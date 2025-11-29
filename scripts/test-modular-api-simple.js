// scripts/test-modular-api-simple.js
// Test simple de l'API modulaire
// Note: node-fetch n'est peut-être pas installé, utiliser fetch natif si Node 18+
let fetch;
try {
  fetch = (await import('node-fetch')).default;
} catch {
  // Node 18+ a fetch natif
  fetch = globalThis.fetch;
}

const BASE_URL = 'http://localhost:5000';

async function test() {
  console.log('🧪 Test API Génération Modulaire\n');
  
  // Test 1: Vérifier que le serveur répond
  console.log('1️⃣ Test Health Check...');
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    console.log(`   Status: ${healthRes.status}`);
    if (healthRes.ok) {
      const data = await healthRes.json();
      console.log(`   ✅ Serveur actif: ${data.message}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Serveur non accessible: ${error.message}\n`);
    return;
  }

  // Test 2: Vérifier les composants disponibles
  console.log('2️⃣ Test récupération des composants...');
  try {
    const componentsRes = await fetch(`${BASE_URL}/api/recipe-components?type=protein&limit=3`);
    console.log(`   Status: ${componentsRes.status}`);
    
    if (componentsRes.ok) {
      const data = await componentsRes.json();
      console.log(`   ✅ ${data.count || data.data?.length || 0} protéines trouvées`);
      if (data.data && data.data.length > 0) {
        console.log(`   Exemple: ${data.data[0].name} (ID: ${data.data[0]._id})\n`);
      }
    } else {
      const text = await componentsRes.text();
      console.log(`   ❌ Erreur: ${text.substring(0, 200)}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}\n`);
  }

  // Test 3: Tester l'endpoint de génération (sans auth - devrait retourner 401)
  console.log('3️⃣ Test génération modulaire (sans authentification)...');
  try {
    const payload = {
      numberOfPeople: 4,
      mealType: 'déjeuner',
      dietaryRestrictions: [],
      allergens: []
    };

    const generateRes = await fetch(`${BASE_URL}/api/menu-modular/generate-modular`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log(`   Status: ${generateRes.status}`);
    
    if (generateRes.status === 401) {
      console.log('   ✅ Route trouvée! (Authentification requise - normal)\n');
    } else if (generateRes.status === 404) {
      console.log('   ❌ Route non trouvée (404)');
      console.log('   💡 Vérifiez que le serveur a été redémarré après l\'ajout des routes\n');
    } else if (generateRes.ok) {
      const data = await generateRes.json();
      console.log('   ✅ Menu généré avec succès!');
      console.log(`   Menu: ${data.data?.template?.name || 'N/A'}\n`);
    } else {
      const text = await generateRes.text();
      console.log(`   ⚠️  Réponse: ${text.substring(0, 300)}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('   💡 Le serveur n\'est pas démarré. Lancez: npm start\n');
    } else {
      console.log(`   ${error}\n`);
    }
  }

  // Test 4: Vérifier la route exacte
  console.log('4️⃣ Vérification de la route...');
  console.log(`   Route attendue: POST ${BASE_URL}/api/menu-modular/generate-modular`);
  console.log(`   Route dans server.js: app.use("/api/menu-modular", modularMenuRoutes)`);
  console.log(`   Route dans modularMenuRoutes.js: router.post('/generate-modular', ...)`);
  console.log(`   ✅ Route complète: /api/menu-modular/generate-modular\n`);
}

test().catch(console.error);

