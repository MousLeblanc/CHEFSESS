import OpenAI from 'openai';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Vérifier que la clé API est définie
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('ERREUR: La clé API OpenAI n\'est pas définie dans les variables d\'environnement.');
  console.error('Veuillez définir la variable d\'environnement OPENAI_API_KEY.');
  process.exit(1);
}

// Créer et configurer le client OpenAI
const openai = new OpenAI({
  apiKey: apiKey,
});

export default openai;