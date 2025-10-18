import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import openai from '../services/openaiClient.js';
import Stock from '../models/Stock.js'; // Assurez-vous d'importer le modèle Stock

const router = express.Router();

// Route pour générer un menu avec OpenAI
router.post('/generate-menu', protect, async (req, res) => {
  console.log('Requête reçue pour générer un menu, utilisateur:', req.user.id);

  const { stockItems, preferences, strictMode } = req.body;

  // Validation des données de base
  if (!preferences) {
    return res.status(400).json({ message: 'Les préférences du menu sont requises.' });
  }

  if (strictMode && (!stockItems || stockItems.length === 0)) {
    return res.status(400).json({ message: 'En mode strict, le stock ne peut pas être vide.' });
  }

  // Préparer la liste des ingrédients pour l'IA
  let ingredientsList = 'Aucun ingrédient en stock.';
  if (stockItems && stockItems.length > 0) {
    ingredientsList = stockItems.map(item => `${item.name} (quantité: ${item.quantity} ${item.unit})`).join(', ');
  }

  // Construire la chaîne pour les groupes d'âge et les restrictions
  let ageGroupsPrompt = '';
  if (preferences.ageGroups && preferences.ageGroups.length > 0) {
    ageGroupsPrompt = preferences.ageGroups.map((group, index) => {
      let groupDetails = `Groupe ${index + 1} (${group.ageRange}, ${group.guestCount} personnes)`;
      if (group.restrictions && group.restrictions.length > 0) {
        const restrictionsDetails = group.restrictions.map(r => `${r.type} (${r.count} personnes)`).join(', ');
        groupDetails += ` avec les restrictions suivantes : ${restrictionsDetails}.`;
      } else {
        groupDetails += '.';
      }
      return groupDetails;
    }).join('\n'); // Utilise \n pour un retour à la ligne dans le prompt
    ageGroupsPrompt = `\nGroupes d'usagers et leurs restrictions spécifiques :\n${ageGroupsPrompt}`;
  }


  // Construire le prompt pour l'IA
  const aiPrompt = `
    Je suis un chef d'établissement et j'ai besoin d'un menu détaillé.
    ${ageGroupsPrompt}
    Type d'établissement : ${preferences.establishmentType}.
    Nombre de plats souhaités : ${preferences.numDishes} (ex: Entrée, Plat, Dessert).
    Type de cuisine préféré : ${preferences.cuisine}.
    Préférence alimentaire globale : ${preferences.globalDietaryPreference}.
    Priorité pour les ingrédients : ${preferences.ingredientPriority === 'cout' ? 'Optimiser les coûts' : preferences.ingredientPriority === 'saison' ? 'Privilégier les produits de saison' : 'Autres (à définir)'}.
    Instructions additionnelles : ${preferences.additionalInstructions || 'Aucune.'}.

    Mon stock actuel d'ingrédients disponibles est le suivant : ${ingredientsList}.

    ${strictMode ? `IMPORTANT : Vous DEVEZ générer un menu qui utilise UNIQUEMENT les ingrédients de mon stock disponible. Si un ingrédient n'est pas dans la liste de stock, il ne peut PAS être inclus dans le menu. Soyez très strict sur l'utilisation exclusive du stock fourni.` : `Vous pouvez proposer des ingrédients hors stock si nécessaire, mais privilégiez l'utilisation du stock.`}

    Le menu doit être fourni au format JSON strict, comme suit :
    {
      "title": "Nom du menu (ex: Menu Printemps Équilibré)",
      "description": "Brève description du menu.",
      "dishes": [
        {
          "name": "Nom du plat (ex: Salade fraîcheur aux agrumes)",
          "description": "Description détaillée du plat.",
          "preparationTime": "Temps en minutes",
          "cookingTime": "Temps en minutes",
          "servings": "Nombre de portions basé sur le total des personnes des groupes d'âge",
          "ingredients": [
            {
              "name": "Nom ingrédient",
              "quantity": "Quantité (numérique)",
              "unit": "Unité (ex: g, ml, pièce, botte)"
            }
          ],
          "instructions": [
            "Étape 1",
            "Étape 2"
          ],
          "chefTip": "Conseil culinaire (optionnel)"
        }
      ],
      "shoppingList": [
        {
            "name": "Nom ingrédient",
            "quantity": "Quantité (numérique)",
            "unit": "Unité (ex: g, ml, pièce, botte)",
            "requiredFor": ["Nom du plat 1", "Nom du plat 2"]
        }
      ]
    }
    Assurez-vous que tous les champs sont présents et que les quantités d'ingrédients sont appropriées pour le nombre total de convives des différents groupes d'âge.
    Les quantités d'ingrédients de la "shoppingList" doivent représenter la somme totale pour tous les plats et tous les convives, en tenant compte des éventuels ingrédients manquants du stock si le strictMode est false.
  `;

  console.log('Prompt envoyé à OpenAI:', aiPrompt);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Ou un modèle approprié comme "gpt-3.5-turbo-1106"
      messages: [{ role: "user", content: aiPrompt }],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const rawResponse = completion.choices[0].message.content;
    console.log('Réponse brute de l\'IA:', rawResponse);

    let generatedMenu;
    try {
      generatedMenu = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('Erreur de parsing JSON de la réponse de l\'IA:', parseError);
      console.error('Réponse non-JSON reçue:', rawResponse);
      return res.status(500).json({ message: 'L\'IA a renvoyé un format de réponse invalide. Veuillez réessayer.', error: rawResponse });
    }

    // Vérification du mode strict
    if (strictMode && generatedMenu.dishes) {
      const stockItemNames = new Set(stockItems.map(item => item.name.toLowerCase()));
      let ingredientsNotInStock = [];

      generatedMenu.dishes.forEach(dish => {
        if (dish.ingredients) {
          dish.ingredients.forEach(ingredient => {
            if (!stockItemNames.has(ingredient.name.toLowerCase())) {
              ingredientsNotInStock.push(ingredient.name);
            }
          });
        }
      });

      if (ingredientsNotInStock.length > 0) {
        const uniqueMissingIngredients = [...new Set(ingredientsNotInStock)];
        console.warn('Mode strict activé: Ingrédients générés non trouvés en stock:', uniqueMissingIngredients);
        // Vous pouvez choisir de renvoyer une erreur, de tenter une regénération, ou d'avertir l'utilisateur.
        // Pour l'instant, je vais renvoyer une erreur explicite.
        return res.status(400).json({
          message: `Le menu généré contient des ingrédients non disponibles en stock en mode strict: ${uniqueMissingIngredients.join(', ')}.`,
          details: generatedMenu
        });
      }
    }

    res.json({ success: true, menu: generatedMenu });

  } catch (error) {
    console.error('Erreur lors de l\'appel à OpenAI ou traitement:', error);
    if (error.response) {
      console.error('Erreur OpenAI (détails):', error.response.data);
    }
    res.status(500).json({ message: 'Erreur lors de la génération du menu par l\'IA.', error: error.message });
  }
});

export default router;