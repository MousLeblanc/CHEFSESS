import OpenAI from 'openai';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Vérifier que la clé API est définie
const apiKey = process.env.OPENAI_API_KEY;
let openai;

if (!apiKey) {
  console.warn('⚠️ OPENAI_API_KEY non définie. Le client OpenAI ne sera pas disponible.');
  console.warn('   Si vous utilisez Anthropic, c\'est normal. Le serveur continuera de fonctionner.');
  // Ne pas faire crasher le serveur - créer un client vide qui échouera gracieusement
  openai = {
    chat: {
      completions: {
        create: async () => {
          throw new Error('OPENAI_API_KEY non configurée. Configurez OPENAI_API_KEY ou utilisez un autre provider (Anthropic, etc.)');
        }
      }
    }
  };
} else {
  // Créer et configurer le client OpenAI
  openai = new OpenAI({
    apiKey: apiKey,
  });
}

export default openai;