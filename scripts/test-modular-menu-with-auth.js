// scripts/test-modular-menu-with-auth.js
// Test complet de l'API modulaire avec authentification
import dotenv from 'dotenv';
dotenv.config();

// Note: node-fetch n'est peut-être pas installé, utiliser fetch natif si Node 18+
let fetch;
try {
  fetch = (await import('node-fetch')).default;
} catch {
  // Node 18+ a fetch natif
  fetch = globalThis.fetch;
}

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Configuration de test (à adapter avec vos identifiants)
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'password123';

async function login() {
  console.log('🔐 Connexion...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Connexion réussie\n');
      
      // Récupérer les cookies de la réponse
      const cookies = response.headers.get('set-cookie');
      return cookies;
    } else {
      const error = await response.text();
      console.log('❌ Erreur de connexion:', error);
      console.log('\n💡 Vérifiez vos identifiants dans le fichier .env ou modifiez TEST_EMAIL et TEST_PASSWORD dans ce script\n');
      return null;
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    return null;
  }
}

async function testGetComponents(cookies) {
  console.log('📦 Test récupération des composants...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/recipe-components?type=protein&limit=5`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${data.count || data.data?.length || 0} protéines trouvées\n`);
      
      if (data.data && data.data.length > 0) {
        console.log('Exemples de protéines:');
        data.data.forEach((protein, index) => {
          console.log(`   ${index + 1}. ${protein.name} (ID: ${protein._id})`);
        });
        console.log();
        return data.data;
      }
    } else {
      const error = await response.text();
      console.log('❌ Erreur:', error.substring(0, 200));
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
  
  return [];
}

async function testGenerateModularMenu(cookies, proteins = []) {
  console.log('🍽️  Test génération modulaire de menu...\n');
  
  // Test 1: Mode automatique
  console.log('1️⃣ Mode automatique (sélection IA)...');
  
  const autoPayload = {
    numberOfPeople: 4,
    mealType: 'déjeuner',
    dietaryRestrictions: [],
    allergens: [],
    useStockOnly: false,
    avoidProteins: [],
    previousMenus: []
  };

  try {
    const response = await fetch(`${BASE_URL}/api/menu-modular/generate-modular`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      credentials: 'include',
      body: JSON.stringify(autoPayload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Menu généré avec succès!\n');
      console.log('📋 Détails du menu:');
      console.log(`   Nom: ${data.data?.template?.name || 'N/A'}`);
      console.log(`   Protéine: ${data.data?.combination?.protein || 'N/A'}`);
      console.log(`   Sauce: ${data.data?.combination?.sauce || 'N/A'}`);
      console.log(`   Accompagnement: ${data.data?.combination?.accompaniment || 'N/A'}`);
      
      if (data.data?.template?.totalNutrition) {
        const nut = data.data.template.totalNutrition;
        console.log(`\n   Nutrition (par portion):`);
        console.log(`   - Calories: ${nut.calories || 0} kcal`);
        console.log(`   - Protéines: ${nut.proteins || 0} g`);
        console.log(`   - Glucides: ${nut.carbs || 0} g`);
        console.log(`   - Lipides: ${nut.lipids || 0} g`);
      }
      
      if (data.data?.template?.totalIngredients) {
        console.log(`\n   Ingrédients totaux (pour ${autoPayload.numberOfPeople} personnes):`);
        data.data.template.totalIngredients.slice(0, 5).forEach(ing => {
          console.log(`   - ${ing.name}: ${ing.quantity} ${ing.unit}`);
        });
        if (data.data.template.totalIngredients.length > 5) {
          console.log(`   ... et ${data.data.template.totalIngredients.length - 5} autres ingrédients`);
        }
      }
      
      console.log();
      return data.data?.template;
    } else {
      const error = await response.text();
      console.log('❌ Erreur:', error.substring(0, 300));
      console.log();
    }
  } catch (error) {
    console.log('❌ Erreur:', error.message);
    console.log();
  }

  // Test 2: Mode manuel (si des protéines sont disponibles)
  if (proteins.length > 0) {
    console.log('2️⃣ Mode manuel (sélection spécifique)...');
    
    const protein = proteins[0];
    console.log(`   Utilisation de: ${protein.name}\n`);
    
    const manualPayload = {
      numberOfPeople: 4,
      mealType: 'déjeuner',
      proteinId: protein._id,
      // sauceId et accompanimentId seront sélectionnés automatiquement parmi les compatibles
      dietaryRestrictions: [],
      allergens: []
    };

    try {
      const response = await fetch(`${BASE_URL}/api/menu-modular/generate-modular`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies || ''
        },
        credentials: 'include',
        body: JSON.stringify(manualPayload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Menu généré avec sélection manuelle!\n');
        console.log(`   Menu: ${data.data?.template?.name || 'N/A'}\n`);
      } else {
        const error = await response.text();
        console.log('❌ Erreur:', error.substring(0, 300));
        console.log();
      }
    } catch (error) {
      console.log('❌ Erreur:', error.message);
      console.log();
    }
  }
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('TEST COMPLET API GÉNÉRATION MODULAIRE');
  console.log('='.repeat(60));
  console.log();
  console.log(`📍 URL: ${BASE_URL}`);
  console.log(`📧 Email de test: ${TEST_EMAIL}`);
  console.log();
  
  // 1. Se connecter
  const cookies = await login();
  if (!cookies) {
    console.log('\n⚠️  Impossible de continuer sans authentification.');
    console.log('💡 Créez un utilisateur de test ou utilisez des identifiants existants.\n');
    return;
  }

  // 2. Récupérer les composants
  const proteins = await testGetComponents(cookies);

  // 3. Tester la génération
  await testGenerateModularMenu(cookies, proteins);

  console.log('='.repeat(60));
  console.log('✅ Tests terminés');
  console.log('='.repeat(60));
}

runTests().catch(console.error);

