import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import openai from '../services/openaiClient.js';

async function testRecipeGeneratorDirect() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    console.log('🤖 TEST: Génération directe de recettes par IA');
    
    // Test de génération pour EHPAD
    const context = 'ehpad';
    const filters = {
      texture: 'mixée',
      pathologies: ['hypertension', 'diabète'],
      diet: ['sans sel ajouté', 'hyperprotéiné'],
      allergens: ['gluten']
    };
    const count = 3;

    console.log(`📋 Contexte: ${context}`);
    console.log(`📋 Filtres:`, filters);
    console.log(`📋 Nombre: ${count}`);

    // Construire le prompt
    const prompt = buildRecipeGenerationPrompt(context, filters, count);
    console.log('\n🤖 Prompt envoyé à l\'IA:');
    console.log(prompt.substring(0, 500) + '...');

    // Appeler l'IA
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
    console.log('\n🤖 Réponse IA reçue');

    // Parser la réponse JSON
    let newRecipes;
    try {
      const jsonMatch = generatedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        newRecipes = JSON.parse(jsonMatch[0]);
        console.log(`✅ ${newRecipes.length} recettes parsées`);
      } else {
        throw new Error('Aucun JSON trouvé dans la réponse');
      }
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      console.log('📄 Contenu reçu:', generatedContent.substring(0, 1000));
      return;
    }

    // Valider et normaliser les recettes
    console.log('\n🔍 Validation des recettes...');
    const validatedRecipes = newRecipes.map((recipe, index) => {
      try {
        return validateAndNormalizeRecipe(recipe, context, filters);
      } catch (error) {
        console.error(`❌ Erreur validation recette ${index + 1}:`, error.message);
        return null;
      }
    }).filter(recipe => recipe !== null);

    console.log(`✅ ${validatedRecipes.length} recettes validées`);

    // Afficher les recettes
    console.log('\n📋 Recettes générées:');
    validatedRecipes.forEach((recipe, index) => {
      console.log(`\n${index + 1}. ${recipe.name}`);
      console.log(`   Catégorie: ${recipe.category}`);
      console.log(`   Texture: ${recipe.texture}`);
      console.log(`   Régimes: ${recipe.diet.join(', ')}`);
      console.log(`   Pathologies: ${recipe.pathologies.join(', ')}`);
      console.log(`   Allergènes: ${recipe.allergens.join(', ')}`);
    });

    // Insérer dans MongoDB
    if (validatedRecipes.length > 0) {
      console.log('\n💾 Insertion dans MongoDB...');
      const insertedRecipes = await RecipeEnriched.insertMany(validatedRecipes);
      console.log(`✅ ${insertedRecipes.length} recettes insérées avec succès`);

      // Afficher les IDs
      insertedRecipes.forEach((recipe, index) => {
        console.log(`   ${index + 1}. ${recipe.name} (ID: ${recipe._id})`);
      });
    }

    console.log('\n✅ Test terminé avec succès');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

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

  // Instructions spécifiques pour EHPAD
  if (context === 'ehpad' || context === 'maison_retraite') {
    prompt += `\nIMPORTANT pour ${contextDesc}:
- Privilégier les recettes traditionnelles françaises
- Éviter les plats modernes, exotiques ou difficiles à mâcher
- Inclure des protéines et du calcium
- Textures adaptées aux personnes âgées
- Plats réconfortants et familiers\n`;
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

testRecipeGeneratorDirect();
