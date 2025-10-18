import dotenv from 'dotenv';
dotenv.config();

async function testRecipeGenerator() {
  try {
    console.log('🤖 TEST: Générateur de recettes par IA');
    
    // Test 1: Génération de recettes pour EHPAD
    console.log('\n🔍 TEST 1: Génération pour EHPAD');
    const ehpadData = {
      context: 'ehpad',
      filters: {
        texture: 'mixée',
        pathologies: ['hypertension', 'diabète'],
        diet: ['sans sel ajouté', 'hyperprotéiné'],
        allergens: ['gluten']
      },
      count: 5
    };

    console.log('📋 Données EHPAD:', JSON.stringify(ehpadData, null, 2));

    const ehpadResponse = await fetch('http://localhost:5000/api/recipe-generator/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZTc0ZjBlYzdjMWQ4NmRmMzNkOTMiLCJyb2xlIjoiY29sbGVjdGl2aXRlIiwiaWF0IjoxNzMxNDQ0OTg2LCJleHAiOjE3MzE1MzEzODZ9.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'
      },
      body: JSON.stringify(ehpadData)
    });

    if (!ehpadResponse.ok) {
      const errorText = await ehpadResponse.text();
      console.error('❌ Erreur EHPAD:', ehpadResponse.status, errorText);
    } else {
      const ehpadResult = await ehpadResponse.json();
      console.log('✅ EHPAD - Recettes générées:', ehpadResult.count);
      if (ehpadResult.recipes) {
        ehpadResult.recipes.forEach((recipe, index) => {
          console.log(`  ${index + 1}. ${recipe.name} (${recipe.category})`);
        });
      }
    }

    // Test 2: Génération de recettes pour hôpital
    console.log('\n🔍 TEST 2: Génération pour hôpital');
    const hopitalData = {
      context: 'hopital',
      filters: {
        texture: 'normale',
        pathologies: ['insuffisance_rénale'],
        diet: ['pauvre_en_proteine', 'sans_sel'],
        allergens: []
      },
      count: 3
    };

    const hopitalResponse = await fetch('http://localhost:5000/api/recipe-generator/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZTc0ZjBlYzdjMWQ4NmRmMzNkOTMiLCJyb2xlIjoiY29sbGVjdGl2aXRlIiwiaWF0IjoxNzMxNDQ0OTg2LCJleHAiOjE3MzE1MzEzODZ9.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'
      },
      body: JSON.stringify(hopitalData)
    });

    if (!hopitalResponse.ok) {
      const errorText = await hopitalResponse.text();
      console.error('❌ Erreur hôpital:', hopitalResponse.status, errorText);
    } else {
      const hopitalResult = await hopitalResponse.json();
      console.log('✅ Hôpital - Recettes générées:', hopitalResult.count);
      if (hopitalResult.recipes) {
        hopitalResult.recipes.forEach((recipe, index) => {
          console.log(`  ${index + 1}. ${recipe.name} (${recipe.category})`);
        });
      }
    }

    // Test 3: Statistiques des recettes générées
    console.log('\n🔍 TEST 3: Statistiques des recettes générées');
    const statsResponse = await fetch('http://localhost:5000/api/recipe-generator/stats', {
      method: 'GET',
      headers: {
        'Cookie': 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZTc0ZjBlYzdjMWQ4NmRmMzNkOTMiLCJyb2xlIjoiY29sbGVjdGl2aXRlIiwiaWF0IjoxNzMxNDQ0OTg2LCJleHAiOjE3MzE1MzEzODZ9.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'
      }
    });

    if (statsResponse.ok) {
      const statsResult = await statsResponse.json();
      console.log('✅ Statistiques:', JSON.stringify(statsResult.data, null, 2));
    } else {
      console.error('❌ Erreur statistiques:', statsResponse.status);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testRecipeGenerator();
