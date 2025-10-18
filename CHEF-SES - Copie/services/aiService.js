import openai from './openaiClient.js';

/**
 * Génère des recettes adaptées via IA quand aucune recette compatible n'est trouvée
 */
export const generateAdaptedRecipe = async (filters) => {
  try {
    console.log('🤖 Génération IA de recettes adaptées...');
    
    const prompt = `
Tu es un expert en nutrition et diététique pour établissements de soins (EHPAD, hôpitaux, maisons de retraite).

Génère 3 recettes adaptées aux critères suivants :
- Texture: ${filters.texture || 'normale'}
- Régimes: ${filters.diet?.join(', ') || 'aucun'}
- Pathologies: ${filters.pathologies?.join(', ') || 'aucune'}
- Allergènes à éviter: ${filters.allergens?.join(', ') || 'aucun'}

IMPORTANT pour les personnes âgées :
- Privilégier les plats traditionnels français
- Textures adaptées (tendres, moelleuses)
- Éviter les aliments difficiles à mâcher
- Enrichissement nutritionnel si nécessaire

Réponds UNIQUEMENT avec un JSON valide contenant un tableau de 3 recettes :
[
  {
    "name": "Nom de la recette",
    "category": "plat",
    "texture": "${filters.texture || 'normale'}",
    "diet": ["régime1", "régime2"],
    "pathologies": ["pathologie1", "pathologie2"],
    "allergens": [],
    "nutritionalProfile": {
      "kcal": 400,
      "protein": 25,
      "lipids": 15,
      "carbs": 45,
      "fiber": 8,
      "sodium": 200
    },
    "ingredients": [
      {"name": "ingrédient1", "quantity": 200, "unit": "g"},
      {"name": "ingrédient2", "quantity": 1, "unit": "pièce"}
    ],
    "preparationSteps": [
      "Étape 1...",
      "Étape 2...",
      "Étape 3..."
    ],
    "compatibleFor": ["mixée", "diabétique", "hyposodé"],
    "aiGenerated": true
  }
]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "Tu es un expert en nutrition pour établissements de soins. Réponds UNIQUEMENT en JSON valide." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = JSON.parse(completion.choices[0].message.content);
    console.log(`✅ ${response.recipes?.length || 0} recettes IA générées`);
    
    return response.recipes || [];
    
  } catch (error) {
    console.error('❌ Erreur génération IA:', error);
    return [];
  }
};

/**
 * Calcule un score de compatibilité pour une recette
 */
export const calculateCompatibilityScore = (recipe, filters) => {
  let score = 0;
  let totalCriteria = 0;

  // Texture (30% du score)
  if (filters.texture) {
    totalCriteria += 0.3;
    if (recipe.texture === filters.texture) {
      score += 0.3;
    }
  }

  // Régimes alimentaires (25% du score)
  if (filters.diet && filters.diet.length > 0) {
    totalCriteria += 0.25;
    const matchingDiets = recipe.diet?.filter(d => filters.diet.includes(d)).length || 0;
    score += (matchingDiets / filters.diet.length) * 0.25;
  }

  // Pathologies (25% du score)
  if (filters.pathologies && filters.pathologies.length > 0) {
    totalCriteria += 0.25;
    const matchingPathologies = recipe.pathologies?.filter(p => filters.pathologies.includes(p)).length || 0;
    score += (matchingPathologies / filters.pathologies.length) * 0.25;
  }

  // Allergènes (20% du score) - pénalité si allergène présent
  if (filters.allergens && filters.allergens.length > 0) {
    totalCriteria += 0.2;
    const hasAllergen = recipe.allergens?.some(a => filters.allergens.includes(a));
    if (!hasAllergen) {
      score += 0.2;
    }
  }

  // Normaliser le score si des critères sont manquants
  return totalCriteria > 0 ? score / totalCriteria : 1.0;
};
