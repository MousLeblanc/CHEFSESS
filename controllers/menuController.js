import RecipeEnriched from "../models/Recipe.js";
import { generateAdaptedRecipe, calculateCompatibilityScore } from "../services/aiService.js";

export const generateCollectiviteMenu = async (req, res) => {
  try {
    const { filters } = req.body;
    if (!filters) return res.status(400).json({ message: "Filtres manquants" });

    console.log('🔍 Recherche de recettes avec filtres:', filters);

    // Construire les conditions de recherche avec les nouveaux champs enrichis
    const searchConditions = [];
    
    // Texture
    if (filters.texture) {
      searchConditions.push({ texture: filters.texture });
    }
    
    // Diet/Restrictions alimentaires - chercher dans TOUS les champs pertinents
    if (filters.diet?.length > 0) {
      searchConditions.push({
        $or: [
          { diet: { $in: filters.diet } },
          { dietaryRestrictions: { $in: filters.diet } },
          { tags: { $in: filters.diet } }
        ]
      });
    }
    
    // Pathologies - chercher dans TOUS les champs pertinents
    if (filters.pathologies?.length > 0) {
      searchConditions.push({
        $or: [
          { pathologies: { $in: filters.pathologies } },
          { compatibleFor: { $in: filters.pathologies } },
          { tags: { $in: filters.pathologies } }
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
        expandedConditions.push(
          { diet: { $in: filters.diet } },
          { dietaryRestrictions: { $in: filters.diet } },
          { tags: { $in: filters.diet } }
        );
      }
      
      if (filters.pathologies?.length > 0) {
        expandedConditions.push(
          { pathologies: { $in: filters.pathologies } },
          { compatibleFor: { $in: filters.pathologies } },
          { tags: { $in: filters.pathologies } }
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
  const { 
      texture = 'normale',
      diet = [],
      pathologies = [],
      allergens = [],
      numDishes = 2,
      totalPeople = 10
  } = req.body;

    console.log('🏥 Génération menu maison de retraite:', {
      texture, diet, pathologies, allergens, numDishes, totalPeople
    });

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
      seniorSearchConditions.push({
        $or: [
          { diet: { $in: diet } },
          { dietaryRestrictions: { $in: diet } },
          { tags: { $in: diet } }
        ]
      });
    }
    
    // Pathologies - chercher dans tous les champs
    if (pathologies.length > 0) {
      seniorSearchConditions.push({
        $or: [
          { pathologies: { $in: pathologies } },
          { compatibleFor: { $in: pathologies } },
          { tags: { $in: pathologies } }
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