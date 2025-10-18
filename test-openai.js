// test-openai.js
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Charger les variables d'environnement
dotenv.config();

// Vérifier si la clé API est présente
if (!process.env.OPENAI_API_KEY) {
  console.error('ERREUR: La variable d\'environnement OPENAI_API_KEY est manquante');
  console.error('Veuillez vérifier votre fichier .env');
  process.exit(1);
}

console.log('Clé API OpenAI trouvée (premiers caractères):', process.env.OPENAI_API_KEY.substring(0, 10) + '...');

// Créer une instance du client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fonction de test
async function testOpenAI() {
  try {
    console.log('Test de l\'API OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Tu es un assistant utile." },
        { role: "user", content: "Dis bonjour!" }
      ],
      max_tokens: 50
    });
    
    console.log('Réponse de l\'API OpenAI:', completion.choices[0].message.content);
    console.log('Test réussi!');
  } catch (error) {
    console.error('Erreur lors du test de l\'API OpenAI:', error);
    if (error.response) {
      console.error('Détails de l\'erreur:', error.response.data);
    }
  }
}

// Exécuter le test
testOpenAI();