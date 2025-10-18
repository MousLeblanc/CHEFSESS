import dotenv from 'dotenv';
dotenv.config();

async function testMenuGenerationAPI() {
  try {
    console.log('🔍 TEST: Génération de menu via API');
    
    const testData = {
      establishmentType: 'maison_retraite',
      ageGroups: [
        { ageRange: '65-85', count: 10 }
      ],
      numDishes: 2,
      menuStructure: 'plat_seul',
      allergens: ['gluten'],
      dietaryRestrictions: ['sans_sel'],
      medicalConditions: ['diabète'],
      texture: 'normale',
      swallowing: 'normale',
      nutritionalProfile: ['hyperprotéiné'],
      ethicalRestrictions: [],
      ageDependencyGroup: 'personne_agee_dependante',
      comfortFilters: [],
      useStockOnly: false
    };

    console.log('📋 Données de test:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:5000/api/intelligent-menu/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU4ZTc0ZjBlYzdjMWQ4NmRmMzNkOTMiLCJyb2xlIjoiY29sbGVjdGl2aXRlIiwiaWF0IjoxNzMxNDQ0OTg2LCJleHAiOjE3MzE1MzEzODZ9.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Réponse API:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success && result.menu) {
      console.log(`\n📊 Menu généré: ${result.menu.title}`);
      console.log(`📊 Nombre de plats: ${result.menu.dishes.length}`);
      
      result.menu.dishes.forEach((dish, index) => {
        console.log(`\n🍽️ Plat ${index + 1}: ${dish.name}`);
        console.log(`   Catégorie: ${dish.category}`);
        console.log(`   Allergènes: ${dish.allergens?.join(', ') || 'aucun'}`);
        console.log(`   Restrictions: ${dish.dietaryRestrictions?.join(', ') || 'aucune'}`);
        console.log(`   Pathologies: ${dish.medicalConditions?.join(', ') || 'aucune'}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testMenuGenerationAPI();
