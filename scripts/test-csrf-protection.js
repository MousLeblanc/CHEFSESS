/**
 * Script de test pour la protection CSRF
 * Teste les 3 scénarios de protection CSRF
 */

import dotenv from 'dotenv';
import axios from 'axios';

// Gestionnaire de cookies simple
let cookieJar = '';

// Utiliser axios qui est déjà installé dans le projet
// Wrapper pour simuler l'API fetch avec gestion des cookies
const fetch = async (url, options = {}) => {
  try {
    // Ajouter les cookies aux headers si disponibles
    const headers = { ...options.headers };
    if (cookieJar) {
      headers['Cookie'] = cookieJar;
    }
    
    const response = await axios({
      url,
      method: options.method || 'GET',
      headers: headers,
      data: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
      validateStatus: () => true, // Ne pas rejeter sur les codes d'erreur
      maxRedirects: 0,
      withCredentials: true
    });
    
    // Extraire et stocker les cookies depuis Set-Cookie
    const setCookieHeaders = response.headers['set-cookie'] || response.headers['Set-Cookie'] || [];
    if (setCookieHeaders.length > 0) {
      const cookieArray = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
      // Mettre à jour le cookie jar avec les nouveaux cookies
      cookieArray.forEach(cookie => {
        const cookieName = cookie.split('=')[0];
        const cookieValue = cookie.split(';')[0];
        // Remplacer ou ajouter le cookie
        if (cookieJar) {
          const cookies = cookieJar.split('; ').filter(c => !c.startsWith(cookieName + '='));
          cookies.push(cookieValue);
          cookieJar = cookies.join('; ');
        } else {
          cookieJar = cookieValue;
        }
      });
    }
    
    // Convertir la réponse axios en format fetch-like
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText || '',
      headers: {
        get: (name) => {
          const headerName = name.toLowerCase();
          return response.headers[headerName] || response.headers[Object.keys(response.headers).find(k => k.toLowerCase() === headerName)] || null;
        },
        raw: () => response.headers
      },
      text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
      json: async () => {
        if (typeof response.data === 'string') {
          try {
            return JSON.parse(response.data);
          } catch (e) {
            return { message: response.data };
          }
        }
        return response.data;
      },
      clone: function() { return this; }
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
};

dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Utiliser un utilisateur de test existant ou créer un test
const TEST_EMAIL = 'test-csrf@example.com';
const TEST_PASSWORD = 'TestCSRF123!';

// Stocker le token CSRF
let csrfToken = '';

/**
 * Test 1 : Requête POST sans token CSRF
 */
async function test1_NoCSRFToken() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 1 : Requête POST sans token CSRF');
  console.log('='.repeat(60));
  
  try {
    // D'abord se connecter pour obtenir un token d'authentification
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log(`⚠️  Connexion échouée (${loginResponse.status}):`, errorText.substring(0, 100));
      console.log('⚠️  Tentative avec un autre utilisateur...');
      // Essayer avec un autre utilisateur
      const altLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'tanneurs@gmail.com',
          password: 'Tanneurs123!'
        })
      });
      
      if (!altLoginResponse.ok) {
        const altErrorText = await altLoginResponse.text();
        console.log(`❌ Connexion alternative échouée (${altLoginResponse.status}):`, altErrorText.substring(0, 100));
        throw new Error(`Impossible de se connecter. Vérifiez que le serveur est démarré sur ${BASE_URL} et que les utilisateurs de test existent.`);
      }
      
      // Les cookies sont déjà stockés dans cookieJar par le wrapper fetch
      csrfToken = altLoginResponse.headers.get('X-CSRF-Token') || '';
    } else {
      // Les cookies sont déjà stockés dans cookieJar par le wrapper fetch
      csrfToken = loginResponse.headers.get('X-CSRF-Token') || '';
    }
    
    console.log('✅ Connexion réussie');
    console.log('🍪 Cookies stockés:', cookieJar ? cookieJar.substring(0, 50) + '...' : 'aucun');
    if (csrfToken) {
      console.log('🔒 Token CSRF:', csrfToken.substring(0, 20) + '...');
    }
    
    // Maintenant faire une requête POST SANS token CSRF
    console.log('\n📤 Envoi d\'une requête POST SANS token CSRF...');
    
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        // Pas de header X-CSRF-Token
        // Les cookies sont automatiquement ajoutés par le wrapper fetch
      },
      body: JSON.stringify({
        supplierId: 'test',
        items: [{ productId: 'test', quantity: 1 }]
      })
    });
    
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }
    
    console.log(`📥 Status: ${response.status}`);
    console.log(`📥 Response:`, JSON.stringify(responseData, null, 2));
    
    if (response.status === 403 && (responseData.error?.includes('CSRF') || responseData.message?.includes('CSRF'))) {
      console.log('✅ TEST 1 RÉUSSI : La protection CSRF fonctionne (403 avec message CSRF)');
      return true;
    } else {
      console.log('❌ TEST 1 ÉCHOUÉ : La requête devrait être rejetée avec 403 CSRF');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test 1:', error.message);
    return false;
  }
}

/**
 * Test 2 : Requête POST avec token CSRF invalide
 */
async function test2_InvalidCSRFToken() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 2 : Requête POST avec token CSRF invalide');
  console.log('='.repeat(60));
  
  try {
    // Utiliser les cookies de la connexion précédente
    if (!cookieJar) {
      console.log('⚠️  Pas de cookies disponibles, connexion...');
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        })
      });
      
      if (!loginResponse.ok) {
        const altLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'tanneurs@gmail.com',
            password: 'Tanneurs123!'
          })
        });
        
        if (!altLoginResponse.ok) {
          throw new Error('Impossible de se connecter');
        }
        
        // Les cookies sont déjà stockés dans cookieJar par le wrapper fetch
        csrfToken = altLoginResponse.headers.get('X-CSRF-Token') || '';
      } else {
        // Les cookies sont déjà stockés dans cookieJar par le wrapper fetch
        csrfToken = loginResponse.headers.get('X-CSRF-Token') || '';
      }
    }
    
    // Récupérer un token CSRF valide si pas encore obtenu
    if (!csrfToken) {
      const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'GET'
        // Les cookies sont automatiquement ajoutés
      });
      
      if (meResponse.ok) {
        const csrfTokenHeader = meResponse.headers.get('X-CSRF-Token');
        if (csrfTokenHeader) {
          csrfToken = csrfTokenHeader;
          console.log('✅ Token CSRF valide récupéré:', csrfToken.substring(0, 20) + '...');
        }
      }
    }
    
    // Maintenant faire une requête POST avec un token CSRF INVALIDE
    console.log('\n📤 Envoi d\'une requête POST avec token CSRF INVALIDE...');
    
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'invalid-token-12345' // Token invalide
        // Les cookies sont automatiquement ajoutés par le wrapper fetch
      },
      body: JSON.stringify({
        supplierId: 'test',
        items: [{ productId: 'test', quantity: 1 }]
      })
    });
    
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }
    
    console.log(`📥 Status: ${response.status}`);
    console.log(`📥 Response:`, JSON.stringify(responseData, null, 2));
    
    if (response.status === 403 && (responseData.error?.includes('CSRF') || responseData.message?.includes('CSRF'))) {
      console.log('✅ TEST 2 RÉUSSI : La protection CSRF fonctionne (403 avec message CSRF)');
      return true;
    } else {
      console.log('❌ TEST 2 ÉCHOUÉ : La requête devrait être rejetée avec 403 CSRF');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test 2:', error.message);
    return false;
  }
}

/**
 * Test 3 : Requête POST avec token CSRF valide
 */
async function test3_ValidCSRFToken() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST 3 : Requête POST avec token CSRF valide');
  console.log('='.repeat(60));
  
  try {
    // Se connecter pour obtenir un token CSRF valide
    console.log('🔐 Connexion...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    
    if (!loginResponse.ok) {
      const altLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'tanneurs@gmail.com',
          password: 'Tanneurs123!'
        })
      });
      
      if (!altLoginResponse.ok) {
        throw new Error('Impossible de se connecter');
      }
      
      // Les cookies sont déjà stockés dans cookieJar par le wrapper fetch
      csrfToken = altLoginResponse.headers.get('X-CSRF-Token') || '';
    } else {
      // Les cookies sont déjà stockés dans cookieJar par le wrapper fetch
      csrfToken = loginResponse.headers.get('X-CSRF-Token') || '';
    }
    
    // Si pas de token dans la réponse de login, le récupérer via /api/auth/me
    if (!csrfToken) {
      console.log('📥 Récupération du token CSRF via /api/auth/me...');
      const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
        method: 'GET'
        // Les cookies sont automatiquement ajoutés
      });
      
      if (meResponse.ok) {
        csrfToken = meResponse.headers.get('X-CSRF-Token') || '';
      }
    }
    
    if (!csrfToken) {
      throw new Error('Impossible de récupérer le token CSRF');
    }
    
    console.log('✅ Token CSRF valide récupéré:', csrfToken.substring(0, 20) + '...');
    console.log('🍪 Cookies stockés:', cookieJar ? cookieJar.substring(0, 50) + '...' : 'aucun');
    
    // Maintenant faire une requête POST avec le token CSRF VALIDE
    console.log('\n📤 Envoi d\'une requête POST avec token CSRF VALIDE...');
    
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken // Token valide
        // Les cookies sont automatiquement ajoutés par le wrapper fetch
      },
      body: JSON.stringify({
        supplierId: 'test',
        items: [{ productId: 'test', quantity: 1 }]
      })
    });
    
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { message: responseText };
    }
    
    console.log(`📥 Status: ${response.status}`);
    console.log(`📥 Response:`, JSON.stringify(responseData, null, 2));
    
    // Le test est réussi si :
    // - Soit la requête passe (200/201) - le token CSRF est accepté
    // - Soit on obtient une erreur de validation métier (pas une erreur CSRF)
    if (response.status === 403 && (responseData.error?.includes('CSRF') || responseData.message?.includes('CSRF'))) {
      console.log('❌ TEST 3 ÉCHOUÉ : La requête a été rejetée avec une erreur CSRF alors que le token est valide');
      return false;
    } else if (response.status === 200 || response.status === 201) {
      console.log('✅ TEST 3 RÉUSSI : La requête a été acceptée avec un token CSRF valide');
      return true;
    } else {
      // Erreur de validation métier (ex: supplierId invalide) = le CSRF fonctionne
      console.log('✅ TEST 3 RÉUSSI : La requête a passé la vérification CSRF (erreur métier attendue)');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test 3:', error.message);
    return false;
  }
}

/**
 * Fonction principale
 */
async function runTests() {
  console.log('\n' + '🔒'.repeat(30));
  console.log('   TESTS DE PROTECTION CSRF');
  console.log('🔒'.repeat(30));
  console.log(`\n📍 URL de base: ${BASE_URL}`);
  console.log(`👤 Utilisateur de test: ${TEST_EMAIL}`);
  
  // Vérifier que le serveur est accessible
  console.log('\n🔍 Vérification de l\'accessibilité du serveur...');
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/health`);
    if (healthCheck.ok) {
      console.log('✅ Serveur accessible');
    } else {
      console.log(`⚠️  Serveur répond mais avec un code ${healthCheck.status}`);
    }
  } catch (error) {
    console.error(`❌ Serveur non accessible: ${error.message}`);
    console.error(`   Assurez-vous que le serveur est démarré sur ${BASE_URL}`);
    process.exit(1);
  }
  
  const results = {
    test1: false,
    test2: false,
    test3: false
  };
  
  // Test 1
  results.test1 = await test1_NoCSRFToken();
  
  // Test 2
  results.test2 = await test2_InvalidCSRFToken();
  
  // Test 3
  results.test3 = await test3_ValidCSRFToken();
  
  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  console.log(`Test 1 (Sans token CSRF)     : ${results.test1 ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'}`);
  console.log(`Test 2 (Token CSRF invalide) : ${results.test2 ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'}`);
  console.log(`Test 3 (Token CSRF valide)   : ${results.test3 ? '✅ RÉUSSI' : '❌ ÉCHOUÉ'}`);
  console.log('='.repeat(60));
  
  const allPassed = results.test1 && results.test2 && results.test3;
  if (allPassed) {
    console.log('\n🎉 TOUS LES TESTS SONT RÉUSSIS ! La protection CSRF fonctionne correctement.');
  } else {
    console.log('\n⚠️  CERTAINS TESTS ONT ÉCHOUÉ. Vérifiez la configuration CSRF.');
  }
  
  process.exit(allPassed ? 0 : 1);
}

// Exécuter les tests
runTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

