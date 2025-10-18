// scripts/test-openai-key.js
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

console.log('\n=== TEST DE LA CLÉ API OPENAI ===\n');

if (!apiKey) {
  console.error('❌ ERREUR: Aucune clé API trouvée dans .env');
  console.log('Veuillez ajouter OPENAI_API_KEY dans votre fichier .env\n');
  process.exit(1);
}

console.log('✓ Clé API trouvée dans .env');
console.log(`✓ Clé commence par: ${apiKey.substring(0, 15)}...`);
console.log(`✓ Clé se termine par: ...${apiKey.slice(-6)}\n`);

console.log('🔄 Test de connexion à OpenAI...\n');

const openai = new OpenAI({ apiKey });

try {
  // Test simple avec le modèle le moins cher
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: 'Dis juste "OK"' }],
    max_tokens: 5,
  });

  console.log('✅ SUCCÈS! La clé API est valide.');
  console.log('✅ Connexion à OpenAI établie.');
  console.log(`✅ Réponse reçue: ${response.choices[0].message.content}\n`);
  console.log('🎉 Votre système de génération de menus IA est opérationnel!\n');
  
} catch (error) {
  console.error('❌ ÉCHEC: La clé API ne fonctionne pas.\n');
  console.error('Erreur:', error.message);
  
  if (error.status === 401) {
    console.log('\n📝 ACTIONS À FAIRE:');
    console.log('1. Allez sur: https://platform.openai.com/api-keys');
    console.log('2. Créez une nouvelle clé API');
    console.log('3. Remplacez OPENAI_API_KEY dans votre fichier .env');
    console.log('4. Redémarrez le serveur\n');
  } else if (error.status === 429) {
    console.log('\n⚠️  Vous avez dépassé votre quota ou manquez de crédits.');
    console.log('Vérifiez: https://platform.openai.com/usage\n');
  }
  
  console.log('ℹ️  EN ATTENDANT: Le système fonctionne en mode FALLBACK');
  console.log('   (sélection aléatoire avec filtrage strict des allergènes)\n');
  
  process.exit(1);
}

