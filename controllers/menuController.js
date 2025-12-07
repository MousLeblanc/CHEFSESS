import RecipeEnriched from "../models/Recipe.js";
import aiService from "../services/aiService.js";

/**
 * Génère des recettes adaptées avec l'IA (fallback si aucune recette trouvée)
 */
async function generateAdaptedRecipe(filters) {
  try {
    console.log('🤖 Génération de recettes adaptées avec l\'IA...');
    
    const prompt = `Génère 3 recettes adaptées pour un établissement de soins avec les critères suivants:
${filters.texture ? `- Texture: ${filters.texture}` : ''}
${filters.pathologies && filters.pathologies.length > 0 ? `- Pathologies: ${filters.pathologies.join(', ')}` : ''}
${filters.diet && filters.diet.length > 0 ? `- Régimes: ${filters.diet.join(', ')}` : ''}
${filters.allergens && filters.allergens.length > 0 ? `- Allergènes à éviter: ${filters.allergens.join(', ')}` : ''}

Retourne UNIQUEMENT un tableau JSON avec 3 recettes au format:
[{
  "name": "Nom de la recette",
  "category": "plat",
  "description": "Description",
  "texture": "${filters.texture || 'normale'}",
  "diet": ${JSON.stringify(filters.diet || [])},
  "pathologies": ${JSON.stringify(filters.pathologies || [])},
  "allergens": [],
  "ingredients": [{"name": "Ingrédient", "quantity": 100, "unit": "g"}],
  "preparationSteps": ["Étape 1", "Étape 2"]
}]`;

    const response = await aiService.generate([
      {
        role: "system",
        content: "Tu es un expert en nutrition pour établissements de soins. Réponds UNIQUEMENT en JSON valide."
      },
      {
        role: "user",
        content: prompt
      }
    ], {
      temperature: 0.7,
      max_tokens: 2000
    });

    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return [];
  } catch (error) {
    console.error('❌ Erreur génération recettes IA:', error);
    return [];
  }
}

/**
 * Calcule un score de compatibilité entre une recette et des filtres
 */
function calculateCompatibilityScore(recipe, filters) {
  let score = 0.5; // Score de base
  
  // Vérifier la texture
  if (filters.texture && recipe.texture === filters.texture) {
    score += 0.2;
  }
  
  // Vérifier les régimes alimentaires
  if (filters.diet && filters.diet.length > 0) {
    const recipeDiets = recipe.diet || recipe.dietaryRestrictions || [];
    const matches = filters.diet.filter(d => recipeDiets.includes(d));
    score += (matches.length / filters.diet.length) * 0.2;
  }
  
  // Vérifier les pathologies
  if (filters.pathologies && filters.pathologies.length > 0) {
    const recipePathologies = recipe.pathologies || [];
    const matches = filters.pathologies.filter(p => recipePathologies.includes(p));
    score += (matches.length / filters.pathologies.length) * 0.1;
  }
  
  // Vérifier les allergènes (pénalité si contient des allergènes à éviter)
  if (filters.allergens && filters.allergens.length > 0) {
    const recipeAllergens = recipe.allergens || [];
    const hasForbidden = filters.allergens.some(a => recipeAllergens.includes(a));
    if (hasForbidden) {
      score = 0; // Incompatible si contient un allergène interdit
    }
  }
  
  return Math.min(score, 1.0);
}

/**
 * Normalise les valeurs du frontend vers le format backend/MongoDB
 * DOIT correspondre EXACTEMENT aux tags dans la DB (avec accents et underscores)
 */
const normalizeFilterValue = (value) => {
  if (!value) return value;
  
  const map = {
    // Sans sel → hyposode (comme dans dietaryRestrictions DB!)
    "Sans sel": "hyposode",
    "sans sel": "hyposode",
    "Sans Sel": "hyposode",
    
    // Sans sucre → pauvre_en_sucre (valeur qui existe dans la DB)
    "Sans sucre": "pauvre_en_sucre",
    "sans sucre": "pauvre_en_sucre",
    "Sans Sucre": "pauvre_en_sucre",
    
    // Végétarien (garder l'accent)
    "Végétarien": "végétarien",
    "vegetarien": "végétarien",
    "Vegetarien": "végétarien",
    
    // Végétalien (garder l'accent)
    "Végétalien": "végétalien",
    "Vegan": "végétalien",
    "vegan": "végétalien",
    
    // Textures (garder les accents)
    "Mixée": "mixée",
    "mixée": "mixée",
    "mixee": "mixée",
    "Hachée": "hachée",
    "hachée": "hachée",
    "hachee": "hachée",
    "Tendre": "tendre",
    "tendre": "tendre",
    "Lisse": "lisse",
    "lisse": "lisse",
    
    // Hyperprotéiné (garder l'accent!)
    "Hyperprotéiné": "hyperprotéiné",
    "hyperprotéiné": "hyperprotéiné",
    "hyperproteine": "hyperprotéiné",
    "Hyperproteine": "hyperprotéiné",
    
    // Religions
    "Casher": "casher",
    "casher": "casher",
    "Halal": "halal",
    "halal": "halal",
    
    // Sans gluten → sans_gluten (avec underscore!)
    "Sans gluten": "sans_gluten",
    "sans gluten": "sans_gluten",
    "Sans Gluten": "sans_gluten",
    
    // Sans lactose → sans_lactose (avec underscore!)
    "Sans lactose": "sans_lactose",
    "sans lactose": "sans_lactose",
    
    // Hypocalorique
    "Hypocalorique": "hypocalorique",
    "hypocalorique": "hypocalorique",
    
    // Pathologies
    "Diabète": "diabete",
    "diabète": "diabete",
    "Hypertension": "hypertension",
    "hypertension": "hypertension"
  };
  
  return map[value] || value.toLowerCase();
};

export const generateCollectiviteMenu = async (req, res) => {
  try {
    let { filters } = req.body;
    if (!filters) return res.status(400).json({ message: "Filtres manquants" });

    console.log('🔍 Recherche de recettes avec filtres (AVANT normalisation):', filters);
    
    // NORMALISER les filtres pour correspondre aux valeurs MongoDB
    if (filters.diet) {
      filters.diet = filters.diet.map(normalizeFilterValue);
    }
    if (filters.pathologies) {
      filters.pathologies = filters.pathologies.map(normalizeFilterValue);
    }
    if (filters.texture) {
      filters.texture = normalizeFilterValue(filters.texture);
    }
    
    console.log('✅ Filtres normalisés:', filters);

    // Construire les conditions de recherche avec les nouveaux champs enrichis
    const searchConditions = [];
    
    // Texture
    if (filters.texture) {
      searchConditions.push({ texture: filters.texture });
    }
    
    // Diet/Restrictions alimentaires - chercher dans TOUS les champs pertinents
    if (filters.diet?.length > 0) {
      // Les tags ont des # devant ET des noms différents (hyposode → sans_sel)
      const dietTags = filters.diet.map(d => {
        // Convertir hyposode → sans_sel pour les tags
        if (d === 'hyposode') return '#sans_sel';
        if (d === 'pauvre_en_sucre') return '#pauvre_en_sucre';
        if (d === 'hyperproteine') return '#hyperprotéiné';
        return `#${d}`;
      });
      
      searchConditions.push({
        $or: [
          { diet: { $in: filters.diet } },
          { dietaryRestrictions: { $in: filters.diet } },  // hyposode
          { tags: { $in: dietTags } }  // #sans_sel
        ]
      });
    }
    
    // Pathologies - chercher dans TOUS les champs pertinents
    if (filters.pathologies?.length > 0) {
      // Les tags ont des # devant, mais pas les autres champs
      const pathologyTags = filters.pathologies.map(p => `#${p}`);
      
      searchConditions.push({
        $or: [
          { pathologies: { $in: filters.pathologies } },
          { compatibleFor: { $in: filters.pathologies } },
          { tags: { $in: pathologyTags } }  // Ajouter # pour les tags
        ]
      });
    }

    // Étape 1 : recherche stricte
    let recipes = [];
    if (searchConditions.length > 0) {
      recipes = await RecipeEnriched.find({ $and: searchConditions });
    } else {
      // Si pas de filtres, prendre toutes les recettes
      recipes = await RecipeEnriched.find({}).limit(50);
    }

    console.log(`📊 Recherche stricte: ${recipes.length} recettes trouvées`);

    // Étape 2 : fallback élargi si aucun résultat
    if (recipes.length === 0 && (filters.diet?.length > 0 || filters.pathologies?.length > 0)) {
      console.warn("⚠️ Aucun résultat strict. Recherche élargie...");
      const expandedConditions = [];
      
      if (filters.diet?.length > 0) {
        const dietTags = filters.diet.map(d => {
          // Convertir hyposode → sans_sel pour les tags
          if (d === 'hyposode') return '#sans_sel';
          if (d === 'pauvre_en_sucre') return '#pauvre_en_sucre';
          if (d === 'hyperproteine') return '#hyperprotéiné';
          return `#${d}`;
        });
        expandedConditions.push(
          { diet: { $in: filters.diet } },
          { dietaryRestrictions: { $in: filters.diet } },
          { tags: { $in: dietTags } }
        );
      }
      
      if (filters.pathologies?.length > 0) {
        const pathologyTags = filters.pathologies.map(p => `#${p}`);
        expandedConditions.push(
          { pathologies: { $in: filters.pathologies } },
          { compatibleFor: { $in: filters.pathologies } },
          { tags: { $in: pathologyTags } }
        );
      }
      
      if (expandedConditions.length > 0) {
        recipes = await RecipeEnriched.find({ $or: expandedConditions });
        console.log(`📊 Recherche élargie: ${recipes.length} recettes trouvées`);
      }
    }

    // Étape 3 : fallback IA — substitution d'ingrédients
    if (recipes.length === 0) {
      console.warn("⚙️ Activation du fallback IA...");
      const aiRecipes = await generateAdaptedRecipe(filters);
      if (aiRecipes && aiRecipes.length > 0) {
        recipes = aiRecipes.map(r => ({ ...r, aiGenerated: true }));
        console.log(`🤖 IA: ${recipes.length} recettes générées`);
      }
    }

    // Étape 4 : gestion du cas vide
    if (recipes.length === 0) {
      return res.status(200).json({
        success: false,
        message: "Aucune recette compatible trouvée, veuillez assouplir les filtres.",
        suggestions: [
          "Essayez de réduire le nombre de restrictions",
          "Vérifiez que les filtres sont cohérents",
          "Contactez un nutritionniste pour des conseils personnalisés"
        ]
      });
    }

    // Étape 5 : scoring IA de compatibilité
    const scored = recipes.map(r => {
      const compatibilityScore = calculateCompatibilityScore(r, filters);
      return { 
        ...r.toObject(), 
        aiCompatibilityScore: Math.min(compatibilityScore, 1.0),
        isAiGenerated: r.aiGenerated || false
      };
    });

    // Trier par score de compatibilité
    const sortedRecipeEnricheds = scored.sort((a, b) => b.aiCompatibilityScore - a.aiCompatibilityScore);

    // Prendre les 3 meilleures recettes
    const topRecipeEnricheds = sortedRecipeEnricheds.slice(0, 3);

    return res.status(200).json({
      success: true,
      message: "Menus générés avec succès",
      totalFound: recipes.length,
      selectedCount: topRecipeEnricheds.length,
      recipes: topRecipeEnricheds,
      metadata: {
        searchMethod: recipes.some(r => r.aiGenerated) ? 'ai_fallback' : 
                     recipes.length > 0 ? 'database_search' : 'no_results',
        filters: filters,
        compatibilityScores: topRecipeEnricheds.map(r => ({
          name: r.name,
          score: r.aiCompatibilityScore
        }))
      }
    });
    } catch (error) {
    console.error("❌ Erreur génération menu :", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur lors de la génération des menus.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Génère un menu pour maison de retraite avec filtres spécialisés
 */
export const generateMaisonRetraiteMenu = async (req, res) => {
  try {
  let { 
      texture = 'normale',
      diet = [],
      pathologies = [],
      allergens = [],
      numDishes = 2,
      totalPeople = 10
  } = req.body;

    console.log('🏥 Génération menu maison de retraite (AVANT normalisation):', {
      texture, diet, pathologies, allergens, numDishes, totalPeople
    });
    
    // NORMALISER les filtres pour correspondre aux valeurs MongoDB
    if (diet.length > 0) {
      diet = diet.map(normalizeFilterValue);
    }
    if (pathologies.length > 0) {
      pathologies = pathologies.map(normalizeFilterValue);
    }
    if (texture) {
      texture = normalizeFilterValue(texture);
    }
    
    console.log('✅ Filtres normalisés:', { texture, diet, pathologies });

    // Filtres spécialisés pour seniors
    const seniorFilters = {
      texture,
      diet: [...diet, 'enrichi', 'facile_mastication'],
      pathologies: [...pathologies, 'senior'],
      allergens
    };

    // Recherche avec filtres seniors - utiliser les nouveaux champs enrichis
    const seniorSearchConditions = [
      { establishmentTypes: { $in: ['ehpad', 'hopital'] } }
    ];
    
    if (texture) {
      seniorSearchConditions.push({ texture: texture });
    }
    
    // Diet/Restrictions - chercher dans tous les champs
    if (diet.length > 0) {
      // Les tags ont des # devant ET des noms différents (hyposode → sans_sel)
      const dietTags = diet.map(d => {
        // Convertir hyposode → sans_sel pour les tags
        if (d === 'hyposode') return '#sans_sel';
        if (d === 'pauvre_en_sucre') return '#pauvre_en_sucre';
        if (d === 'hyperproteine') return '#hyperprotéiné';
        return `#${d}`;
      });
      
      seniorSearchConditions.push({
        $or: [
          { diet: { $in: diet } },
          { dietaryRestrictions: { $in: diet } },  // hyposode
          { tags: { $in: dietTags } }  // #sans_sel
        ]
      });
    }
    
    // Pathologies - chercher dans tous les champs
    if (pathologies.length > 0) {
      // Les tags ont des # devant, mais pas les autres champs
      const pathologyTags = pathologies.map(p => `#${p}`);
      
      seniorSearchConditions.push({
        $or: [
          { pathologies: { $in: pathologies } },
          { compatibleFor: { $in: pathologies } },
          { tags: { $in: pathologyTags } }  // Ajouter # pour les tags
        ]
      });
    }
    
    // Allergènes - EXCLUSION
    if (allergens.length > 0) {
      seniorSearchConditions.push({ allergens: { $nin: allergens } });
    }
    
    let recipes = await RecipeEnriched.find({
      $and: seniorSearchConditions.filter(c => Object.keys(c).length > 0)
    });

    console.log(`👴 ${recipes.length} recettes trouvées pour seniors (conditions: ${seniorSearchConditions.length})`);
    console.log('🔍 Conditions de recherche:', JSON.stringify(seniorSearchConditions, null, 2));
    
    // FALLBACK si aucun résultat : essayer sans restrictions diet/pathologies
    if (recipes.length === 0) {
      console.warn('⚠️ Aucun résultat avec filtres stricts. Tentative avec EHPAD/Hopital uniquement...');
      recipes = await RecipeEnriched.find({
        $and: [
          { establishmentTypes: { $in: ['ehpad', 'hopital'] } },
          texture ? { texture: texture } : {},
          allergens.length > 0 ? { allergens: { $nin: allergens } } : {}
        ].filter(c => Object.keys(c).length > 0)
      });
      console.log(`👴 Fallback: ${recipes.length} recettes trouvées`);
    }

    // Si pas assez de recettes, utiliser l'IA
    if (recipes.length < numDishes) {
      console.log('🤖 Utilisation de l\'IA pour compléter le menu...');
      const aiRecipes = await generateAdaptedRecipe(seniorFilters);
      if (aiRecipes && aiRecipes.length > 0) {
        recipes = [...recipes, ...aiRecipes.map(r => ({ ...r, aiGenerated: true }))];
      }
    }

    if (recipes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Aucune recette adaptée aux seniors trouvée",
        suggestions: [
          "Assouplir les restrictions alimentaires",
          "Vérifier la cohérence des filtres",
          "Consulter un nutritionniste spécialisé"
        ]
      });
    }

    // Calculer les scores et sélectionner les meilleures
    const scored = recipes.map(r => ({
      ...r.toObject(),
      aiCompatibilityScore: calculateCompatibilityScore(r, seniorFilters)
    }));

    const selectedRecipeEnricheds = scored
      .sort((a, b) => b.aiCompatibilityScore - a.aiCompatibilityScore)
      .slice(0, numDishes);

    // Adapter les quantités pour le nombre de personnes
    const adaptedRecipeEnricheds = selectedRecipeEnricheds.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients.map(ing => ({
        ...ing,
        quantity: Math.ceil(ing.quantity * totalPeople / 4) // Base 4 personnes
      })),
      servings: totalPeople
    }));

    return res.status(200).json({
        success: true, 
      message: `Menu généré pour ${totalPeople} résidents`,
      menu: {
        title: `Menu Maison de Retraite - ${new Date().toLocaleDateString('fr-FR')}`,
        totalPeople,
        dishes: adaptedRecipeEnricheds,
        metadata: {
          texture,
          diet,
          pathologies,
          allergens,
          aiGenerated: selectedRecipeEnricheds.some(r => r.aiGenerated)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur génération menu maison de retraite:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du menu",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};