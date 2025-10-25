import RecipeEnriched from "../models/Recipe.js";
import { generateAdaptedRecipe, calculateCompatibilityScore } from "../services/aiService.js";

export const generateCollectiviteMenu = async (req, res) => {
  try {
    const { filters } = req.body;
    if (!filters) return res.status(400).json({ message: "Filtres manquants" });

    console.log('🔍 Recherche de recettes avec filtres:', filters);

    // Étape 1 : recherche stricte
    let recipes = await RecipeEnriched.find({
      $and: [
        filters.texture ? { texture: filters.texture } : {},
        filters.diet?.length ? { diet: { $all: filters.diet } } : {},
        filters.pathologies?.length ? { pathologies: { $all: filters.pathologies } } : {}
      ]
    });

    console.log(`📊 Recherche stricte: ${recipes.length} recettes trouvées`);

    // Étape 2 : fallback élargi
    if (recipes.length === 0) {
      console.warn("⚠️ Aucun résultat strict. Recherche élargie...");
      recipes = await RecipeEnriched.find({
        $or: [
          { diet: { $in: filters.diet || [] } },
          { pathologies: { $in: filters.pathologies || [] } },
          { compatibleFor: { $in: filters.pathologies || [] } }
        ]
      });
      console.log(`📊 Recherche élargie: ${recipes.length} recettes trouvées`);
    }

    // Étape 3 : fallback IA — substitution d'ingrédients
    if (recipes.length === 0) {
      console.warn("⚙️ Activation du fallback IA...");
      const aiRecipeEnricheds = await generateAdaptedRecipeEnriched(filters);
      if (aiRecipeEnricheds && aiRecipeEnricheds.length > 0) {
        recipes = aiRecipeEnricheds.map(r => ({ ...r, aiGenerated: true }));
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

    // Recherche avec filtres seniors
    let recipes = await RecipeEnriched.find({
      $and: [
        { establishmentTypes: { $in: ['ehpad', 'collectivite'] } },
        texture ? { texture: texture } : {},
        diet.length > 0 ? { diet: { $in: diet } } : {},
        pathologies.length > 0 ? { 
          $or: [
            { pathologies: { $in: pathologies } },
            { compatibleFor: { $in: pathologies } }
          ]
        } : {},
        allergens.length > 0 ? { allergens: { $nin: allergens } } : {}
      ]
    });

    console.log(`👴 ${recipes.length} recettes trouvées pour seniors`);

    // Si pas assez de recettes, utiliser l'IA
    if (recipes.length < numDishes) {
      console.log('🤖 Utilisation de l\'IA pour compléter le menu...');
      const aiRecipeEnricheds = await generateAdaptedRecipeEnriched(seniorFilters);
      if (aiRecipeEnricheds && aiRecipeEnricheds.length > 0) {
        recipes = [...recipes, ...aiRecipeEnricheds.map(r => ({ ...r, aiGenerated: true }))];
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