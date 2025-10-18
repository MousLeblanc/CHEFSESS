import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import openai from '../services/openaiClient.js';

const router = express.Router();

// Route pour générer un menu avec OpenAI
router.post('/generate-menu', protect, async (req, res) => {
  console.log('Requête reçue pour générer un menu, utilisateur:', req.user?.id);
  try {
    const { stockItems, preferences, strictMode } = req.body;
    
    if (!stockItems || !Array.isArray(stockItems) || stockItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'La liste des ingrédients est requise' 
      });
    }

    // Formater les ingrédients pour l'API OpenAI
    const ingredientsList = stockItems.map(item => 
      `${item.name || item.nom}: ${item.quantity || item.qte} ${item.unit || item.unite}`
    ).join('\n- ');

    // Instructions supplémentaires de l'utilisateur
    const additionalInstructions = preferences.additionalInstructions || '';

    // Construire le prompt pour OpenAI
    const prompt = `Tu es un chef cuisinier professionnel. Génère un menu complet et détaillé pour ${preferences.guests || 4} personnes.

${strictMode ? 'IMPORTANT: Utilise UNIQUEMENT les ingrédients listés ci-dessous.' : 'Utilise principalement les ingrédients listés ci-dessous, mais tu peux suggérer d\'autres ingrédients si nécessaire pour compléter les recettes.'}

Ingrédients disponibles:
- ${ingredientsList}

${preferences.cuisine ? `Style de cuisine souhaité: ${preferences.cuisine}` : ''}
${preferences.diet ? `Régime alimentaire à respecter: ${preferences.diet}` : ''}
${preferences.mealType ? `Type de repas: ${preferences.mealType}` : ''}
${preferences.occasion ? `Occasion spéciale: ${preferences.occasion}` : ''}
${preferences.optimize ? `Optimisation: ${preferences.optimize}` : ''}
${additionalInstructions ? `Instructions supplémentaires: ${additionalInstructions}` : ''}

Réponds UNIQUEMENT avec un JSON structuré comme suit:
{
  "title": "Nom du menu",
  "description": "Brève description du menu",
  "dishes": [
    {
      "name": "Nom du plat",
      "type": "entrée/plat/dessert",
      "ingredients": [
        {"name": "Nom ingrédient", "quantity": 100, "unit": "g"},
        ...
      ],
      "instructions": "Instructions détaillées de préparation",
      "preparationTime": 30,
      "cookingTime": 20,
      "difficulty": "facile/moyen/difficile"
    },
    ...
  ]
}`;

    console.log("Envoi du prompt à OpenAI:", prompt);

    // Appeler l'API OpenAI avec GPT-3.5-turbo
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Utiliser GPT-3.5-turbo qui est plus largement disponible
      messages: [
        { role: "system", content: "Tu es un chef cuisinier expert qui génère des menus détaillés et créatifs. Tu réponds uniquement avec du JSON valide." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8, // Légèrement plus créatif
      max_tokens: 2000, // Plus de tokens pour des recettes détaillées
      response_format: { type: "json_object" } // Forcer une réponse JSON
    });

    // Extraire la réponse
    const aiResponse = completion.choices[0].message.content;
    
    // Parser la réponse JSON
    let menuData;
    try {
      menuData = JSON.parse(aiResponse);
      console.log("Menu généré avec succès:", menuData.title);
    } catch (error) {
      console.error('Erreur lors du parsing de la réponse JSON:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur lors du parsing de la réponse de l\'IA',
        error: error.message,
        rawResponse: aiResponse
      });
    }

    res.json({
      success: true,
      menu: menuData
    });
  } catch (error) {
    console.error('Erreur lors de la génération du menu:', error);
    
    // Vérifier si c'est une erreur OpenAI
    if (error.response && error.response.status) {
      console.error('Erreur OpenAI:', error.response.status, error.response.data);
      return res.status(error.response.status).json({
        success: false,
        message: `Erreur OpenAI: ${error.response.data?.error?.message || error.message}`,
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la génération du menu',
      error: error.message
    });
  }
  
  // Log de fin de requête
  console.log('Requête de génération de menu terminée');
});

export default router;