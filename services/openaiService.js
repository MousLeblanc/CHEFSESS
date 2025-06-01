import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Génère un menu structuré à partir d'une liste d'ingrédients
 * @param {Array} ingredients - liste d'ingrédients (nom, quantité, unité)
 * @param {String} date - date du menu
 * @returns {Promise<{entrée: string, plat: string, dessert: string}>}
 */
export async function generateMenuFromStock(ingredients, date) {
  const content = `
Tu es un chef IA. Génére un menu avec une entrée, un plat et un dessert en te basant uniquement sur ces ingrédients :

${ingredients.map(i => `- ${i.name} (${i.quantity} ${i.unit})`).join('\n')}

Format de réponse STRICT (JSON) :
{
  "entree": "...",
  "plat": "...",
  "dessert": "..."
}

Date du menu : ${date}
`;

  const res = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'Tu es un assistant expert en cuisine.' },
      { role: 'user', content }
    ],
    temperature: 0.7
  });

  const aiResponse = res.choices[0].message.content;

  try {
    return JSON.parse(aiResponse);
  } catch (e) {
    throw new Error('La réponse IA n’est pas au format JSON attendu :\n' + aiResponse);
  }
}
