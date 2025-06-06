// controllers/menuController.js
import asyncHandler from 'express-async-handler';
import { openai } from '../server.js'; // Importe le client OpenAI initialisé dans server.js
import Menu from '../models/Menu.js';   // Modèle Mongoose pour sauvegarder les menus si besoin
// import Stock from '../models/Stock.js'; // Si vous l'utilisez pour les fonctions pro

// Pour maison-dashboard.html
export const generateHomeMenuByAI = asyncHandler(async (req, res) => {
    // NOUVEAU : Récupérer 'servings' de req.body
    const { ingredients, onlyAvailable, context, servings } = req.body;
    const userName = req.user.name || 'l\'utilisateur';

    // Utiliser 'servings' fourni par l'utilisateur, ou une valeur par défaut si non fourni ou invalide
    const numberOfPeople = parseInt(servings) > 0 ? parseInt(servings) : (context === 'solo' ? 1 : (context === 'romantique' ? 2 : 4));

    if ((!ingredients || ingredients.trim() === "") && context !== 'solo' && context !== 'romantique') {
        res.status(400);
        throw new Error("Les ingrédients sont requis pour ce contexte...");
    }
    if (!context) {
        res.status(400);
        throw new Error("Le contexte du repas est requis.");
    }

    const systemPrompt = `Tu es un assistant culinaire expert... Chaque objet plat dans le tableau "menus" doit contenir EXACTEMENT les clés suivantes :
- "nom": (string) Le nom du plat.
- "description": (string) Une brève description alléchante du plat (1-2 phrases).
- "personnes": (number) Le nombre de personnes pour lequel cette recette est prévue (utilise la valeur fournie).
- "ingredients_necessaires": (array of objects) Une liste des ingrédients pour le plat. Chaque objet ingrédient doit avoir les clés "nom_ingredient" (string) et "quantite_ingredient" (string, incluant l'unité, ex: "200g", "1 cuillère à soupe").
- "etapes_preparation": (array of strings) Une liste des étapes de préparation claires.
Ne fournis AUCUNE explication ou texte en dehors de cet objet JSON structuré.`;

    const userPrompt = `
    Je suis ${userName} et je souhaite 3 suggestions de plats pour un repas à la maison.
    Contexte du repas : "${context}".
    Nombre de personnes à servir : ${numberOfPeople}. {/* UTILISATION DE numberOfPeople */}
    Ingrédients principaux que je possède : "${ingredients}".
    Contrainte sur les ingrédients : ${onlyAvailable ? "Base-toi strictement sur ces ingrédients listés..." : "Tu peux suggérer 1 ou 2 ingrédients complémentaires mineurs..."}

    Pour chaque plat suggéré, fournis :
    1. Le nom du plat.
    2. Une courte description.
    3. Pour combien de personnes la recette est prévue (base-toi sur ${numberOfPeople} personnes).
    4. La liste détaillée des ingrédients nécessaires avec leurs quantités précises (nom_ingredient, quantite_ingredient) ajustées pour ${numberOfPeople} personnes.
    5. Les étapes claires de préparation.

    Assure-toi que la réponse soit uniquement l'objet JSON comme spécifié...
    `;

    try {
        console.log(`Appel OpenAI pour generateHomeMenuByAI pour ${numberOfPeople} personnes...`);
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 1500
        });
        // ... (reste de la fonction inchangée pour le parsing et la réponse)
        const aiResponseContent = completion.choices[0].message.content;
        console.log("Réponse brute d'OpenAI (détaillée):", aiResponseContent);
        const parsedResponse = JSON.parse(aiResponseContent);
        
        if (parsedResponse && Array.isArray(parsedResponse.menus) && parsedResponse.menus.every(menu =>
            typeof menu.nom === 'string' &&
            typeof menu.description === 'string' &&
            typeof menu.personnes === 'number' && // L'IA devrait renvoyer le nombre de personnes
            Array.isArray(menu.ingredients_necessaires) &&
            menu.ingredients_necessaires.every(ing => typeof ing.nom_ingredient === 'string' && typeof ing.quantite_ingredient === 'string') &&
            Array.isArray(menu.etapes_preparation) &&
            menu.etapes_preparation.every(step => typeof step === 'string')
        )) {
            res.status(200).json({ success: true, menus: parsedResponse.menus });
        } else {
            console.error("Réponse IA détaillée inattendue:", parsedResponse);
            throw new Error("La réponse de l'IA n'a pas le format détaillé attendu (nom, description, personnes, ingredients_necessaires, etapes_preparation).");
        }

    } catch (error) {
        // ... (gestion d'erreur inchangée) ...
        console.error("Erreur OpenAI (generateHomeMenuByAI détaillée):", error);
        res.status(500);
        let errorMessage = "Erreur lors de la génération du menu IA détaillé pour la maison.";
        if (error.message && error.message.includes("format détaillé attendu")) {
            errorMessage = error.message;
        } else if (error.response && error.response.data && error.response.data.error && error.response.data.error.message) {
            errorMessage = `Erreur OpenAI: ${error.response.data.error.message}`;
        }
        throw new Error(errorMessage);
    }
});// Pour menu.html (option "ChAIf IA" des pros)
// Dans controllers/menuController.js

export const generateProMenuByAI = asyncHandler(async (req, res) => {
    const { 
        cuisineType, mealType, diet, guests, occasion, optimizeFor, 
        additionalInstructions, // Renommé depuis aiInstructions pour correspondre au payload
        priorityIngredients // NOUVEAU PARAMÈTRE
    } = req.body;
    const userName = req.user.name || 'le chef';

    if (!guests) {
        res.status(400);
        throw new Error("Le nombre de convives est requis pour un menu professionnel.");
    }
    
    const systemPrompt = `Tu es un assistant chef IA expert... (votre systemPrompt existant demandant le format JSON) ...`;
    
    let userPrompt = `Crée 3 suggestions de menu pour un restaurant (pour ${userName}).
    Type de cuisine : ${cuisineType || 'Variée'}.
    Type de repas : ${mealType || 'Plat principal'}.
    Régime alimentaire spécifique : ${diet || 'Aucun'}.
    Nombre de convives estimé : ${guests}.
    Occasion spéciale : ${occasion || 'Service standard'}.
    Optimiser pour : ${optimizeFor || 'Équilibre saveurs/coûts'}.`;

    if (priorityIngredients && priorityIngredients.length > 0) {
        userPrompt += `\nPrioriser l'utilisation des ingrédients suivants si possible : ${priorityIngredients.join(', ')}. Ce sont des ingrédients qui approchent de leur date de péremption.`;
    }

    userPrompt += `\nInstructions additionnelles : ${additionalInstructions || 'Surprendre les clients avec créativité et faisabilité en cuisine professionnelle.'}`;
    
    try {
        console.log("Appel OpenAI pour generateProMenuByAI avec ingrédients prioritaires:", priorityIngredients);
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            response_format: { type: "json_object" },
            temperature: 0.6,
            max_tokens: 700 
        });
        // ... (reste de la fonction pour parser la réponse et renvoyer les menus)
        const aiResponseContent = completion.choices[0].message.content;
        const parsedResponse = JSON.parse(aiResponseContent);

        if (parsedResponse && Array.isArray(parsedResponse.menus)) {
            res.status(200).json({ success: true, menus: parsedResponse.menus });
        } else {
            throw new Error("La réponse de l'IA ne contient pas la clé 'menus' attendue ou n'est pas un tableau.");
        }

    } catch (error) {
        console.error("Erreur OpenAI (generateProMenuByAI):", error);
        res.status(500);
        throw new Error("Erreur lors de la génération du menu IA professionnel.");
    }
});
// Pour planning.html (génération de planning pour les pros)
export const generateWeeklyPlanByAI = asyncHandler(async (req, res) => {
    const { numDays = 7, mealsPerDay = ['Dejeuner', 'Diner'], stylePreferences, dietaryRestrictions, budgetConstraints, baseIngredients } = req.body;

    const systemPrompt = `Tu es un planificateur de menus IA expert pour restaurants. Tu dois impérativement répondre avec un objet JSON valide. L'objet JSON doit contenir une clé principale "weeklyPlan". La valeur de "weeklyPlan" sera un tableau d'objets, où chaque objet représente un jour et contient les clés "jour" (ex: "Lundi", "Mardi", ...), et "repas" (un objet où chaque clé est un type de repas demandé (ex: "Dejeuner", "Diner"), et sa valeur un tableau de suggestions de plats [{nom, description}]). Ne retourne rien d'autre que cet objet JSON structuré.`;
    const userPrompt = `Crée un planning de menus détaillé pour un restaurant sur ${numDays} jours (commençant par Lundi si non spécifié).
    Repas à planifier par jour : ${mealsPerDay.join(' et ')}.
    Préférences de style générales : ${stylePreferences || 'Cuisine française moderne, variée et utilisant des produits de saison.'}.
    Restrictions alimentaires à considérer globalement : ${dietaryRestrictions || 'Proposer des options végétariennnes régulièrement.'}.
    Contraintes budgétaires : ${budgetConstraints || 'Optimiser le rapport qualité/prix tout en maintenant une haute qualité.'}.
    ${baseIngredients ? `Prendre en compte les ingrédients de base suivants pour inspiration ou utilisation: "${baseIngredients}".` : ''}
    Assure une bonne variété des plats tout au long de la semaine et évite les répétitions excessives d'ingrédients principaux sur des jours consécutifs. Structure la réponse pour chaque jour.`;

    try {
        console.log("Appel OpenAI pour generateWeeklyPlanByAI...");
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", 
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 2500 
        });
        const aiResponseContent = completion.choices[0].message.content;
        const parsedResponse = JSON.parse(aiResponseContent);

        if (parsedResponse && parsedResponse.weeklyPlan) { // La clé doit être 'weeklyPlan' comme demandé dans le systemPrompt
             res.status(200).json({ success: true, weeklyPlan: parsedResponse.weeklyPlan });
        } else {
            console.error("Réponse IA inattendue (planning):", parsedResponse);
            throw new Error("La réponse de l'IA ne contient pas la clé 'weeklyPlan' attendue.");
        }
    } catch (error) {
        console.error("Erreur OpenAI (generateWeeklyPlanByAI):", error);
        res.status(500);
        throw new Error("Erreur lors de la génération du planning hebdomadaire IA. Veuillez vérifier la console du serveur.");
    }
});

export const getSavedMenus = asyncHandler(async (req, res) => {
  const menus = await Menu.find({ user: req.user.id }).sort({ date: -1 });
  res.json({ success: true, data: menus });
});

export const saveGeneratedMenu = asyncHandler(async (req, res) => {
  const { title, theme, mode, date, courses } = req.body;
  // Validation des données reçues...
  if (!title || !courses || !Array.isArray(courses) || courses.length === 0) {
      res.status(400);
      throw new Error("Données de menu incomplètes ou invalides pour la sauvegarde.");
  }
  const menu = new Menu({
      user: req.user.id,
      title,
      theme: theme || 'Généré par IA',
      mode: mode || 'ai-generated', // Un mode spécifique pour les menus IA sauvegardés
      date: date || new Date(),
      courses // Le frontend enverra la structure des plats comme reçue de l'IA
  });
  const createdMenu = await menu.save();
  res.status(201).json({ success: true, data: createdMenu });
});