import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import OpenAI from 'openai';

const router = express.Router();

// Initialiser le client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Route pour générer un menu avec OpenAI
router.post('/generate-menu', protect, async (req, res) => {
  try {
    const { stockItems, preferences } = req.body;
    
    if (!stockItems || !Array.isArray(stockItems) || stockItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'La liste des ingrédients est requise' 
      });
    }

    // Formater les ingrédients pour l'API OpenAI
    const ingredientsList = stockItems.map(item => 
      `${item.name || item.nom}: ${item.quantity || item.qte} ${item.unit || item.unite}`
    ).join(', ');

    // Construire le prompt pour OpenAI
    const prompt = `Génère un menu gastronomique réaliste pour ${preferences.guests || 4} personnes.
    
    ${preferences.cuisine ? `STYLE DE CUISINE DEMANDÉ: ${preferences.cuisine}. Tu DOIS respecter ce style de cuisine.` : ''}
    ${preferences.diet ? `RÉGIME ALIMENTAIRE DEMANDÉ: ${preferences.diet}. Tu DOIS respecter ce régime alimentaire.` : ''}
    ${preferences.mealType ? `TYPE DE REPAS DEMANDÉ: ${preferences.mealType}. Tu DOIS respecter ce type de repas.` : ''}
    ${preferences.occasion ? `OCCASION SPÉCIALE: ${preferences.occasion}. Tu DOIS adapter le menu à cette occasion.` : ''}
    
    Ingrédients disponibles: ${ingredientsList}
    ${req.body.strictMode ? 'Tu DOIS utiliser UNIQUEMENT ces ingrédients disponibles.' : 'Tu peux suggérer d\'autres ingrédients complémentaires si nécessaire.'}
    
    ${preferences.additionalInstructions ? `Instructions spéciales: ${preferences.additionalInstructions}` : ''}
    
    EXIGENCE ABSOLUE: Crée des noms de plats gastronomiques, précis et détaillés comme "Filet de dorade en papillote aux légumes de saison et son beurre citronné" ou "Stoemp aux poireaux et rôti de dinde aux herbes de Provence". Les noms de plats doivent être sophistiqués et détaillés.
    
    Réponds avec un JSON contenant:
    1. Le nom du menu (title) - doit être sophistiqué et descriptif
    2. Une liste des plats (dishes) avec pour chaque plat:
       - name: nom détaillé, précis et gastronomique du plat (minimum 5-7 mots)
       - description: description courte et appétissante
       - ingredients: liste des ingrédients avec nom, quantité et unité
       - instructions: étapes de préparation détaillées`;

    // Appeler l'API OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Utiliser GPT-4 pour de meilleurs résultats si disponible, sinon utiliser gpt-3.5-turbo
      messages: [
        { role: "system", content: `Tu es un chef étoilé Michelin spécialisé dans la haute gastronomie française et internationale. 

Ta mission est de créer des menus gastronomiques sophistiqués avec des noms de plats détaillés et élégants. 

Exemples de noms de plats attendus:
- "Filet de dorade royale en papillote, julienne de légumes de saison et son beurre blanc aux agrumes"
- "Stoemp crémeux aux poireaux et pommes de terre, rôti de dinde fermier aux herbes de Provence"
- "Risotto aux champignons sauvages, tuiles de parmesan et réduction de vin rouge"

Utilise une terminologie culinaire professionnelle et sois extrêmement précis dans tes descriptions. Les noms de plats doivent être sophistiqués et contenir au moins 5-7 mots pour être suffisamment descriptifs.` },
        { role: "user", content: prompt }
      ],
      temperature: 0.8, // Légèrement plus de créativité
      max_tokens: 2000, // Plus de tokens pour des descriptions détaillées
      response_format: { type: "json_object" }
    });

    // Extraire la réponse
    const aiResponse = completion.choices[0].message.content;
    
    // Essayer de parser la réponse JSON
    let menuData;
    try {
      // Avec response_format: { type: "json_object" }, la réponse devrait être un JSON valide
      menuData = JSON.parse(aiResponse);
      
      // S'assurer que le menu a un titre sophistiqué
      if (!menuData.title || menuData.title === "Menu généré") {
        menuData.title = "Menu Dégustation Gastronomique du Chef";
      }
      
      // S'assurer que chaque plat a un nom détaillé et gastronomique
      if (menuData.dishes && Array.isArray(menuData.dishes)) {
        menuData.dishes = menuData.dishes.map(dish => {
          // Si le nom du plat est trop simple, le rendre plus détaillé
          if (!dish.name || dish.name.split(' ').length < 4) {
            const mainIngredients = dish.ingredients && Array.isArray(dish.ingredients) 
              ? dish.ingredients.slice(0, 2).map(i => typeof i === 'string' ? i : i.name).join(' et ') 
              : '';
              
            // Créer un nom de plat sophistiqué par défaut
            const cuisineType = preferences?.cuisine || '';
            const baseNames = {
              'italian': "Risotto crémeux",
              'french': "Médaillon de filet",
              'mediterranean': "Pavé de dorade royale",
              'asian': "Filet de canard laqué",
              'mexican': "Enchiladas gourmandes",
              'american': "Burger gourmet"
            };
            
            const baseName = baseNames[cuisineType.toLowerCase()] || "Assiette gourmande";
            dish.name = `${baseName} ${mainIngredients ? `aux ${mainIngredients}` : 'de saison'}, accompagné de sa garniture du marché`;
          }
          
          // S'assurer que la description est présente
          if (!dish.description) {
            dish.description = `Délicate préparation de ${dish.name.split(',')[0].toLowerCase()}, servie avec finesse pour une expérience gustative exceptionnelle.`;
          }
          
          // S'assurer que les instructions sont présentes
          if (!dish.instructions) {
            dish.instructions = "Préparer les ingrédients. Cuire selon les règles de l'art. Dresser avec élégance et servir immédiatement.";
          }
          
          return dish;
        });
      } else {
        // Si pas de plats, en créer au moins un
        menuData.dishes = [{
          name: "Assiette gourmande du Chef, variation autour des produits de saison",
          description: "Une sélection raffinée des meilleurs produits du marché, préparés avec soin et créativité.",
          ingredients: stockItems.slice(0, 5).map(i => ({ 
            name: i.name || i.nom, 
            quantity: i.quantity || 1, 
            unit: i.unit || 'portion' 
          })),
          instructions: "Préparer les ingrédients avec soin. Cuire à la perfection. Dresser avec élégance sur assiette."
        }];
      }
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse JSON:', error);
      // Si le parsing échoue, créer un menu par défaut avec des noms de plats réalistes
      const defaultDishes = [
        { 
          name: "Filet de dorade royale en papillote, julienne de légumes de saison et son beurre blanc aux agrumes", 
          description: "Dorade fraîche de ligne cuite en papillote avec une délicate julienne de légumes de saison, nappée d'un beurre blanc aux agrumes",
          ingredients: stockItems.slice(0, 5).map(i => ({ 
            name: i.name || i.nom, 
            quantity: i.quantity || 1, 
            unit: i.unit || 'portion' 
          })),
          instructions: "Préparer la julienne de légumes. Assaisonner le filet de dorade. Disposer le poisson sur les légumes dans une feuille de papier sulfurisé. Fermer la papillote et cuire au four à 180°C pendant 15-20 minutes. Préparer le beurre blanc aux agrumes. Servir la papillote ouverte, nappée de sauce."
        }
      ];
      
      menuData = { 
        title: "Menu Dégustation Gastronomique du Chef", 
        dishes: defaultDishes
      };
    }

    res.json({
      success: true,
      menu: menuData
    });
  } catch (error) {
    console.error('Erreur lors de la génération du menu:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération du menu',
      error: error.message
    });
  }
});

export default router;