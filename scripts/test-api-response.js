import dotenv from 'dotenv';
dotenv.config();

import fetch from 'node-fetch';

async function testApiResponse() {
  try {
    console.log('🧪 TEST: Vérification de la réponse API');
    
    // Test de génération de recettes via l'API
    const response = await fetch('http://localhost:5000/api/recipe-generator/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // Token de test
      },
      body: JSON.stringify({
        context: 'ehpad',
        filters: {
          texture: 'mixée',
          pathologies: ['hypertension'],
          diet: ['sans sel ajouté'],
          allergens: ['gluten']
        },
        count: 2
      })
    });

    console.log('📡 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Réponse API reçue');
      console.log('📊 Données complètes:', JSON.stringify(data, null, 2));
      
      if (data.recipes && data.recipes.length > 0) {
        const recipe = data.recipes[0];
        console.log('\n🔍 Analyse de la première recette:');
        console.log('- Nom:', recipe.name);
        console.log('- Catégorie:', recipe.category);
        console.log('- Ingrédients:', recipe.ingredients ? recipe.ingredients.length : 'MANQUANT');
        console.log('- Étapes de préparation:', recipe.preparationSteps ? recipe.preparationSteps.length : 'MANQUANT');
        console.log('- Profil nutritionnel:', recipe.nutritionalProfile ? 'PRÉSENT' : 'MANQUANT');
        console.log('- Description:', recipe.description || 'MANQUANT');
      }
    } else {
      const errorData = await response.json();
      console.log('❌ Erreur API:', errorData);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testApiResponse();
