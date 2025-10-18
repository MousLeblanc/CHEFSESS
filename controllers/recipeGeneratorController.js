// controllers/recipeGeneratorController.js
import asyncHandler from 'express-async-handler';
import RecipeEnriched from '../models/Recipe.js';
import openai from '../services/openaiClient.js';

/**
 * Génère de nouvelles recettes adaptées aux profils d'établissement
 * en utilisant l'IA pour créer des recettes personnalisées
 */
export const generateRecipes = asyncHandler(async (req, res) => {
  const { context, filters, count = 10 } = req.body;

  try {
    console.log(`🤖 Génération de ${count} recettes pour contexte: ${context}`);
    console.log('📋 Filtres:', filters);

    // Validation des paramètres
    if (!context || !filters) {
      return res.status(400).json({
        success: false,
        message: 'Contexte et filtres requis'
      });
    }

    // Construire le prompt pour l'IA
    const prompt = buildRecipeGenerationPrompt(context, filters, count);

    // Appeler l'IA pour générer les recettes
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en nutrition et en cuisine adaptée aux établissements de soins. Tu génères des recettes saines, équilibrées et adaptées aux besoins spécifiques des patients/résidents."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const generatedContent = aiResponse.choices[0].message.content;
    console.log('🤖 Réponse IA reçue');

    // Parser la réponse JSON de l'IA
    let newRecipes;
    try {
      // Extraire le JSON de la réponse
      const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        newRecipes = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Aucun JSON trouvé dans la réponse');
      }
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors du parsing des recettes générées par l\'IA'
      });
    }

    // Valider et normaliser les recettes
    const validatedRecipes = newRecipes.map(recipe => validateAndNormalizeRecipe(recipe, context, filters));

    // Insérer les recettes dans MongoDB
    const insertedRecipes = await RecipeEnriched.insertMany(validatedRecipes);

    console.log(`✅ ${insertedRecipes.length} recettes générées et insérées avec succès`);

    res.status(201).json({
      success: true,
      message: `${insertedRecipes.length} recettes générées et ajoutées à la base de données`,
      count: insertedRecipes.length,
      recipes: insertedRecipes.map(recipe => ({
        _id: recipe._id,
        id: recipe._id,
        name: recipe.name,
        category: recipe.category,
        description: recipe.description,
        texture: recipe.texture,
        diet: recipe.diet,
        pathologies: recipe.pathologies,
        allergens: recipe.allergens,
        nutritionalProfile: recipe.nutritionalProfile,
        ingredients: recipe.ingredients,
        preparationSteps: recipe.preparationSteps,
        establishmentType: recipe.establishmentType,
        compatibleFor: recipe.compatibleFor,
        aiCompatibilityScore: recipe.aiCompatibilityScore,
        aiGenerated: recipe.aiGenerated
      }))
    });

  } catch (error) {
    console.error('❌ Erreur génération recettes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération des recettes'
    });
  }
});

/**
 * Construit le prompt pour la génération de recettes
 */
function buildRecipeGenerationPrompt(context, filters, count) {
  const contextDescriptions = {
    'ehpad': 'EHPAD (Établissement d\'Hébergement pour Personnes Âgées Dépendantes)',
    'hopital': 'Hôpital',
    'maison_retraite': 'Maison de retraite',
    'ecole': 'École primaire/maternelle',
    'collectivite': 'Collectivité (restauration collective)',
    'resto': 'Restaurant traditionnel'
  };

  const contextDesc = contextDescriptions[context] || context;

  let prompt = `Génère ${count} recettes adaptées pour un ${contextDesc}.\n\n`;

  // Ajouter les filtres spécifiques
  if (filters.texture) {
    const textureDescriptions = {
      'normale': 'texture normale (mastication complète)',
      'hachée': 'texture hachée (morceaux petits)',
      'mixée': 'texture mixée (purée épaisse)',
      'lisse': 'texture lisse (sans morceaux)',
      'liquide': 'texture liquide (pour troubles sévères de déglutition)'
    };
    prompt += `- Texture requise: ${textureDescriptions[filters.texture] || filters.texture}\n`;
  }

  if (filters.pathologies && filters.pathologies.length > 0) {
    prompt += `- Pathologies à considérer: ${filters.pathologies.join(', ')}\n`;
  }

  if (filters.diet && filters.diet.length > 0) {
    prompt += `- Régimes alimentaires: ${filters.diet.join(', ')}\n`;
  }

  if (filters.allergens && filters.allergens.length > 0) {
    prompt += `- Allergènes à éviter: ${filters.allergens.join(', ')}\n`;
  }

  // Instructions spécifiques selon le contexte
  if (context === 'ehpad' || context === 'maison_retraite') {
    prompt += `\nIMPORTANT pour ${contextDesc}:
- Privilégier les recettes traditionnelles françaises
- Éviter les plats modernes, exotiques ou difficiles à mâcher
- Inclure des protéines et du calcium
- Textures adaptées aux personnes âgées
- Plats réconfortants et familiers\n`;
  }

  if (context === 'hopital') {
    prompt += `\nIMPORTANT pour l'hôpital:
- Recettes thérapeutiques et nutritives
- Respecter les restrictions médicales
- Faciliter la digestion
- Inclure des micronutriments essentiels\n`;
  }

  if (context === 'ecole') {
    prompt += `\nIMPORTANT pour l'école:
- Recettes appréciées des enfants
- Équilibre nutritionnel pour la croissance
- Présentation attractive
- Goûts familiers et rassurants\n`;
  }

  prompt += `\nRetourne UNIQUEMENT un tableau JSON avec ${count} recettes au format suivant:
[
  {
    "name": "Nom de la recette",
    "category": "entrée|plat|dessert|soupe",
    "description": "Description courte",
    "texture": "${filters.texture || 'normale'}",
    "diet": ["régime1", "régime2"],
    "pathologies": ["pathologie1", "pathologie2"],
    "allergens": ["allergène1", "allergène2"],
    "nutritionalProfile": {
      "kcal": 350,
      "protein": 25,
      "lipids": 15,
      "carbs": 30,
      "fiber": 5,
      "sodium": 200
    },
    "ingredients": [
      {"name": "Ingrédient 1", "quantity": 200, "unit": "g"},
      {"name": "Ingrédient 2", "quantity": 1, "unit": "c.à.s"}
    ],
    "preparationSteps": [
      "Étape 1 de préparation",
      "Étape 2 de préparation"
    ],
    "establishmentType": ["${context}"],
    "compatibleFor": ["${filters.texture || 'normale'}", "${filters.pathologies?.[0] || 'général'}"],
    "aiCompatibilityScore": 1.0
  }
]`;

  return prompt;
}

/**
 * Valide et normalise une recette générée par l'IA
 */
function validateAndNormalizeRecipe(recipe, context, filters) {
  // Validation des champs obligatoires
  if (!recipe.name || !recipe.category) {
    throw new Error('Recette invalide: nom et catégorie requis');
  }

  // Normaliser les champs
  const normalizedRecipe = {
    name: recipe.name.trim(),
    category: recipe.category.toLowerCase(),
    description: recipe.description || '',
    texture: recipe.texture || 'normale',
    diet: Array.isArray(recipe.diet) ? recipe.diet : [],
    pathologies: Array.isArray(recipe.pathologies) ? recipe.pathologies : [],
    allergens: Array.isArray(recipe.allergens) ? recipe.allergens : [],
    nutritionalProfile: recipe.nutritionalProfile || {
      kcal: 0,
      protein: 0,
      lipids: 0,
      carbs: 0,
      fiber: 0,
      sodium: 0
    },
    ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients : [],
    preparationSteps: Array.isArray(recipe.preparationSteps) ? recipe.preparationSteps : [],
    establishmentType: [context],
    compatibleFor: recipe.compatibleFor || [filters.texture || 'normale'],
    aiCompatibilityScore: recipe.aiCompatibilityScore || 1.0,
    aiGenerated: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Valider les enums
  const validCategories = ['entrée', 'plat', 'dessert', 'soupe', 'petit-déjeuner'];
  if (!validCategories.includes(normalizedRecipe.category)) {
    normalizedRecipe.category = 'plat';
  }

  const validTextures = ['normale', 'hachée', 'mixée', 'lisse', 'liquide'];
  if (!validTextures.includes(normalizedRecipe.texture)) {
    normalizedRecipe.texture = 'normale';
  }

  return normalizedRecipe;
}

/**
 * Récupère les statistiques des recettes générées par IA
 */
export const getGeneratedRecipesStats = asyncHandler(async (req, res) => {
  try {
    const stats = await RecipeEnriched.aggregate([
      {
        $match: { aiGenerated: true }
      },
      {
        $group: {
          _id: '$establishmentType',
          count: { $sum: 1 },
          avgCompatibilityScore: { $avg: '$aiCompatibilityScore' }
        }
      }
    ]);

    const totalGenerated = await RecipeEnriched.countDocuments({ aiGenerated: true });
    const totalRecipes = await RecipeEnriched.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalGenerated,
        totalRecipes,
        percentageGenerated: Math.round((totalGenerated / totalRecipes) * 100),
        byEstablishment: stats
      }
    });

  } catch (error) {
    console.error('❌ Erreur stats recettes générées:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    });
  }
});
