// controllers/recipeGeneratorController.js
import asyncHandler from 'express-async-handler';
import RecipeEnriched from '../models/Recipe.js';
import aiService from '../services/aiService.js';

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
    console.log('📝 Prompt construit, longueur:', prompt.length, 'caractères');

    // Appeler l'IA pour générer les recettes
    console.log('🤖 Appel à l\'IA...');
    let response;
    try {
      response = await aiService.generate([
        {
          role: "system",
          content: "Tu es un expert en nutrition et en cuisine adaptée aux établissements de soins. Tu génères des recettes saines, équilibrées et adaptées aux besoins spécifiques des patients/résidents."
        },
        {
          role: "user",
          content: prompt
        }
      ], {
        temperature: 0.7,
        max_tokens: 4000
      });
      console.log('✅ Réponse IA reçue');
    } catch (aiError) {
      console.error('❌ Erreur lors de l\'appel à l\'IA:', aiError);
      console.error('   Type:', aiError.constructor.name);
      console.error('   Message:', aiError.message);
      throw new Error(`Erreur lors de l'appel à l'IA: ${aiError.message}`);
    }

    const generatedContent = response.content;
    console.log('📄 Contenu généré, longueur:', generatedContent?.length || 0, 'caractères');

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
    console.error('   Type:', error.constructor.name);
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    
    // Message d'erreur plus détaillé pour le client
    let errorMessage = 'Erreur lors de la génération des recettes';
    
    if (error.message && error.message.includes('API key')) {
      errorMessage = 'Clé API manquante ou invalide. Vérifiez la configuration de l\'IA.';
    } else if (error.message && error.message.includes('rate limit')) {
      errorMessage = 'Limite de requêtes atteinte. Veuillez réessayer plus tard.';
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'Timeout lors de l\'appel à l\'IA. Veuillez réessayer.';
    } else if (error.message) {
      errorMessage = `Erreur: ${error.message}`;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
      // Textures simples
      'normale': 'texture normale (mastication complète)',
      'hachée': 'texture hachée (morceaux petits)',
      'mixée': 'texture mixée (purée épaisse)',
      'lisse': 'texture lisse (sans morceaux)',
      'liquide': 'texture liquide (pour troubles sévères de déglutition)',
      // IDDSI
      'iddsi_7': 'IDDSI 7 - Normal facile à mastiquer (texture normale, facile à mâcher)',
      'iddsi_6': 'IDDSI 6 - Petites morceaux tendres (petits morceaux mous et tendres)',
      'iddsi_5': 'IDDSI 5 - Haché lubrifié (aliments hachés finement avec sauce/liquide)',
      'iddsi_4': 'IDDSI 4 - Purée lisse (purée épaisse, lisse, sans morceaux)',
      'iddsi_3': 'IDDSI 3 - Purée fluide (purée plus liquide, facile à avaler)',
      'iddsi_2': 'IDDSI 2 - Liquide légèrement épais (liquide épaissi)',
      'iddsi_1': 'IDDSI 1 - Liquide très légèrement épais (liquide très légèrement épaissi)',
      'iddsi_0': 'IDDSI 0 - Liquide (liquide fin, eau)',
      'finger_food': 'Finger Food (aliments à manger avec les doigts, adaptés)'
    };
    
    const textureInstructions = {
      'iddsi_7': 'Couper en petits morceaux faciles à mâcher. Cuire jusqu\'à tendreté.',
      'iddsi_6': 'Couper en très petits morceaux (max 1.5cm). Cuire jusqu\'à très tendre.',
      'iddsi_5': 'HACHER FINEMENT tous les aliments. Ajouter sauce/liquide pour lubrifier. Texture finale: haché fin avec sauce.',
      'iddsi_4': 'MIXER en purée ÉPAISSE et LISSE. Passer au tamis si nécessaire. Aucun morceau visible.',
      'iddsi_3': 'MIXER en purée FLUIDE. Ajouter du liquide pour obtenir une consistance fluide mais homogène.',
      'iddsi_2': 'MIXER complètement puis ÉPAISSIR avec un épaississant (gélatine, amidon) pour obtenir un liquide légèrement épais.',
      'iddsi_1': 'MIXER complètement puis ÉPAISSIR LÉGÈREMENT avec un épaississant pour obtenir un liquide très légèrement épais.',
      'iddsi_0': 'MIXER complètement en liquide fin, filtrer si nécessaire. Consistance de l\'eau.',
      'finger_food': 'Préparer en portions individuelles faciles à saisir avec les doigts.'
    };
    
    const textureDesc = textureDescriptions[filters.texture] || filters.texture;
    const textureInstr = textureInstructions[filters.texture] || '';
    
    prompt += `- Texture requise (CRITIQUE): ${textureDesc}\n`;
    if (textureInstr) {
      prompt += `- Instructions de préparation OBLIGATOIRES pour cette texture: ${textureInstr}\n`;
    }
    prompt += `⚠️ IMPORTANT: La texture "${filters.texture}" DOIT être respectée. Les étapes de préparation DOIVENT inclure les instructions de mixage/hachage appropriées.\n`;
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

  // Construire les exemples d'étapes selon la texture
  let preparationStepsExample = '';
  if (filters.texture === 'iddsi_2') {
    preparationStepsExample = '"Cuire les ingrédients jusqu\'à tendreté complète", "MIXER tous les ingrédients cuits en purée lisse", "ÉPAISSIR avec un épaississant (amidon ou gélatine) jusqu\'à obtenir un liquide légèrement épais (texture IDDSI 2)"';
  } else if (filters.texture === 'iddsi_3') {
    preparationStepsExample = '"Cuire les ingrédients jusqu\'à très tendre", "MIXER en purée fluide, ajouter du liquide si nécessaire", "Vérifier la consistance fluide et homogène (texture IDDSI 3)"';
  } else if (filters.texture === 'iddsi_4') {
    preparationStepsExample = '"Cuire les ingrédients jusqu\'à très tendre", "MIXER en purée ÉPAISSE et LISSE", "Passer au tamis fin pour éliminer tous les morceaux (texture IDDSI 4)"';
  } else if (filters.texture === 'iddsi_5') {
    preparationStepsExample = '"HACHER FINEMENT tous les ingrédients cuits", "Ajouter sauce/liquide pour lubrifier", "Vérifier que tous les morceaux sont hachés finement (texture IDDSI 5)"';
  } else {
    preparationStepsExample = '"Étape 1 de préparation", "Étape 2 de préparation"';
  }

  prompt += `\nRetourne UNIQUEMENT un tableau JSON avec ${count} recettes au format suivant:
[
  {
    "name": "Nom de la recette",
    "category": "entrée|plat|dessert|soupe",
    "description": "Description courte",
    "texture": "${filters.texture || 'normale'}", // ⚠️ CRITIQUE: DOIT être exactement "${filters.texture || 'normale'}" - NE PAS changer cette valeur
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
      ${preparationStepsExample}
    ],
    "establishmentType": ["${context}"],
    "compatibleFor": ["${filters.texture || 'normale'}", "${filters.pathologies?.[0] || 'général'}"],
    "aiCompatibilityScore": 1.0
  }
]

⚠️ RÈGLE ABSOLUE: 
1. La texture de chaque recette DOIT être exactement "${filters.texture || 'normale'}" dans le champ "texture".
2. Les étapes de préparation DOIVENT inclure explicitement les actions de transformation selon la texture demandée.
3. Chaque étape doit mentionner explicitement: "MIXER", "HACHER", "ÉPAISSIR" selon la texture.
4. La dernière étape DOIT vérifier que la texture finale correspond à "${filters.texture || 'normale'}".
${filters.texture === 'iddsi_2' ? '\n   EXEMPLE pour IDDSI 2: Les étapes doivent inclure "MIXER" puis "ÉPAISSIR avec épaississant" pour obtenir un liquide légèrement épais.' : ''}
${filters.texture === 'iddsi_3' ? '\n   EXEMPLE pour IDDSI 3: Les étapes doivent inclure "MIXER en purée fluide" et "ajouter liquide" pour fluidité.' : ''}
${filters.texture === 'iddsi_4' ? '\n   EXEMPLE pour IDDSI 4: Les étapes doivent inclure "MIXER en purée ÉPAISSE" et "passer au tamis" pour éliminer les morceaux.' : ''}
${filters.texture === 'iddsi_5' ? '\n   EXEMPLE pour IDDSI 5: Les étapes doivent inclure "HACHER FINEMENT" et "ajouter sauce/liquide" pour lubrifier.' : ''}
`;

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
  // ⚠️ FORCER la texture des filtres si elle est définie (priorité absolue)
  const forcedTexture = filters.texture || recipe.texture || 'normale';
  
  // Générer les tags automatiquement
  const tags = [];
  tags.push(`#${context}`); // Ex: #ehpad, #hopital
  if (forcedTexture) {
    tags.push(`#${forcedTexture}`); // Ex: #iddsi_4, #mixée
  }
  if (filters.pathologies && filters.pathologies.length > 0) {
    filters.pathologies.forEach(patho => {
      tags.push(`#${patho.toLowerCase().replace(/\s+/g, '_')}`); // Ex: #diabète, #hypertension
    });
  }
  if (filters.diet && filters.diet.length > 0) {
    filters.diet.forEach(d => {
      tags.push(`#${d.toLowerCase().replace(/\s+/g, '_')}`); // Ex: #hyperprotéiné, #sans_sel_ajouté
    });
  }
  if (filters.allergens && filters.allergens.length > 0) {
    filters.allergens.forEach(allergen => {
      tags.push(`#sans_${allergen.toLowerCase().replace(/\s+/g, '_')}`); // Ex: #sans_gluten, #sans_lactose
    });
  }
  tags.push('#ia_généré'); // Tag pour identifier les recettes générées par IA
  
  const normalizedRecipe = {
    name: recipe.name.trim(),
    category: recipe.category.toLowerCase(),
    description: recipe.description || '',
    texture: forcedTexture, // Toujours utiliser la texture des filtres en priorité
    diet: Array.isArray(recipe.diet) ? recipe.diet : [],
    pathologies: Array.isArray(recipe.pathologies) ? recipe.pathologies : [],
    allergens: Array.isArray(recipe.allergens) ? recipe.allergens : [],
    tags: tags, // Tags automatiques basés sur les filtres
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

  // Valider les textures (inclure les textures IDDSI)
  const validTextures = [
    'normale', 'hachée', 'mixée', 'lisse', 'liquide',
    'iddsi_7', 'iddsi_6', 'iddsi_5', 'iddsi_4', 'iddsi_3', 'iddsi_2', 'iddsi_1', 'iddsi_0',
    'finger_food'
  ];
  
  // Si la texture n'est pas valide, utiliser celle des filtres ou 'normale' par défaut
  if (!validTextures.includes(normalizedRecipe.texture)) {
    normalizedRecipe.texture = filters.texture || 'normale';
  }
  
  // ⚠️ FORCER la texture des filtres (priorité absolue)
  if (filters.texture) {
    normalizedRecipe.texture = filters.texture;
    console.log(`✅ Texture forcée à: ${filters.texture} (demandée par l'utilisateur)`);
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
