import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ OPENAI_API_KEY not set - AI features will be disabled');
}

const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function generateMenu(params) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const {
    establishmentType,
    numberOfPeople,
    dietaryRestrictions = [],
    allergies = [],
    duration = 7
  } = params;

  const prompt = `Génère un menu de ${duration} jours pour un établissement de type ${establishmentType} avec ${numberOfPeople} personnes.

Restrictions alimentaires: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'Aucune'}
Allergies à éviter: ${allergies.length > 0 ? allergies.join(', ') : 'Aucune'}

Format de réponse en JSON:
{
  "menus": [
    {
      "day": 1,
      "date": "2024-01-15",
      "lunch": {
        "starter": "...",
        "main": "...",
        "dessert": "..."
      },
      "dinner": {
        "starter": "...",
        "main": "...",
        "dessert": "..."
      }
    }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Tu es un chef cuisinier expert en nutrition et en restauration collective. Tu génères des menus équilibrés et adaptés."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { menus: [], error: 'Format de réponse invalide' };

  } catch (error) {
    console.error('❌ Erreur OpenAI:', error);
    throw new Error('Erreur lors de la génération du menu');
  }
}

export async function generateRecipe(params) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  const {
    ingredients = [],
    dietaryRestrictions = [],
    servings = 4
  } = params;

  const prompt = `Crée une recette avec les ingrédients suivants: ${ingredients.join(', ')}
Pour ${servings} personnes.
Restrictions: ${dietaryRestrictions.length > 0 ? dietaryRestrictions.join(', ') : 'Aucune'}

Format JSON:
{
  "name": "...",
  "ingredients": [...],
  "instructions": [...],
  "prepTime": 30,
  "cookTime": 45
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Tu es un chef cuisinier créatif qui génère des recettes détaillées."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });

    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { error: 'Format de réponse invalide' };

  } catch (error) {
    console.error('❌ Erreur OpenAI:', error);
    throw new Error('Erreur lors de la génération de la recette');
  }
}

export default { generateMenu, generateRecipe };
