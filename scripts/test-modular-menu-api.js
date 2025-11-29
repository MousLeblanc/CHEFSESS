// scripts/test-modular-menu-api.js
// Script pour tester l'endpoint de génération modulaire de menus
import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testModularMenuGeneration() {
  console.log('🧪 Test de génération modulaire de menus\n');
  console.log(`📍 URL: ${API_URL}/api/menu-modular/generate-modular\n`);

  // Note: Pour un vrai test, il faudrait être authentifié
  // Ce script montre la structure de la requête
  
  const testPayload = {
    numberOfPeople: 4,
    mealType: 'déjeuner',
    dietaryRestrictions: [],
    allergens: [],
    useStockOnly: false,
    // Mode automatique (sans proteinId, sauceId, accompanimentId)
    avoidProteins: [],
    previousMenus: []
  };

  console.log('📤 Payload de test:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('\n');

  try {
    // Note: Cette requête nécessite une authentification
    // Il faudrait inclure les cookies de session ou un token
    const response = await fetch(`${API_URL}/api/menu-modular/generate-modular`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Cookie': 'session=...' // À ajouter si authentifié
      },
      credentials: 'include',
      body: JSON.stringify(testPayload)
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Succès! Réponse:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Erreur:');
      console.log(error);
      
      if (response.status === 401) {
        console.log('\n⚠️  Note: Authentification requise. Connectez-vous d\'abord.');
      }
    }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    console.log('\n💡 Vérifiez que le serveur est démarré: npm start');
  }
}

// Test avec sélection manuelle
async function testManualSelection() {
  console.log('\n\n🧪 Test avec sélection manuelle\n');

  // D'abord, récupérer les composants disponibles
  try {
    const componentsResponse = await fetch(`${API_URL}/api/recipe-components?type=protein&limit=5`, {
      credentials: 'include'
    });

    if (componentsResponse.ok) {
      const components = await componentsResponse.json();
      console.log('📦 Protéines disponibles:');
      if (components.data && components.data.length > 0) {
        const protein = components.data[0];
        console.log(`   - ${protein.name} (ID: ${protein._id})`);
        
        // Test avec cette protéine
        const manualPayload = {
          numberOfPeople: 4,
          mealType: 'déjeuner',
          proteinId: protein._id,
          // sauceId et accompanimentId optionnels
          dietaryRestrictions: [],
          allergens: []
        };

        console.log('\n📤 Payload avec sélection manuelle:');
        console.log(JSON.stringify(manualPayload, null, 2));

        const response = await fetch(`${API_URL}/api/menu-modular/generate-modular`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(manualPayload)
        });

        if (response.ok) {
          const data = await response.json();
          console.log('\n✅ Menu généré avec sélection manuelle:');
          console.log(JSON.stringify(data, null, 2));
        } else {
          const error = await response.text();
          console.log('\n❌ Erreur:', error);
        }
      } else {
        console.log('   Aucune protéine trouvée. Exécutez d\'abord: node scripts/seed-recipe-components.js');
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter les tests
console.log('='.repeat(60));
console.log('TEST API GÉNÉRATION MODULAIRE DE MENUS');
console.log('='.repeat(60));
console.log();

testModularMenuGeneration()
  .then(() => testManualSelection())
  .catch(console.error);





