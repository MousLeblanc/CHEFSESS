// scripts/generate-custom-menu.js
// Générateur de menu UNIVERSEL avec critères nutritionnels personnalisables

import dotenv from 'dotenv';
import openai from '../services/openaiClient.js';
import { ingredientsDatabase, getIngredientData } from './ingredients-database.js';

dotenv.config();

/**
 * Filtre les ingrédients selon un critère nutritionnel
 * @param {string} nutrientKey - Clé du nutriment (proteins, vitaminC, fibers, calcium, iron, etc.)
 * @param {number} minValue - Valeur minimale pour être considéré "riche"
 * @returns {Array} Liste triée d'ingrédients
 */
function getIngredientsByNutrient(nutrientKey, minValue = 0) {
  const ingredients = [];
  
  for (const [name, data] of Object.entries(ingredientsDatabase)) {
    const value = data.nutritionalValues[nutrientKey] || 0;
    if (value >= minValue) {
      ingredients.push({
        name: name,
        category: data.category,
        value: value,
        nutrientKey: nutrientKey,
        nutritionalValues: data.nutritionalValues
      });
    }
  }
  
  return ingredients.sort((a, b) => b.value - a.value);
}

/**
 * Génère un menu selon des critères nutritionnels personnalisés
 * @param {Object} options
 * @param {number} options.numberOfPeople - Nombre de personnes
 * @param {string} options.mealType - Type de repas (déjeuner, dîner, etc.)
 * @param {Array} options.nutritionalGoals - Liste des objectifs nutritionnels
 *   Ex: [{ nutrient: 'proteins', target: 35, unit: 'g', label: 'Protéines' }]
 * @param {Array} options.dietaryRestrictions - Restrictions alimentaires
 */
export async function generateCustomMenu({
  numberOfPeople = 4,
  mealType = 'déjeuner',
  nutritionalGoals = [],
  dietaryRestrictions = [],
  avoidMenuName = null,
  forceVariation = false
}) {
  console.log(`\n🎯 Génération d'un menu personnalisé...`);
  console.log(`   👥 ${numberOfPeople} personnes`);
  console.log(`   🍽️  Type : ${mealType}`);
  if (forceVariation && avoidMenuName) {
    console.log(`   🔄 Forcer une variation (éviter: "${avoidMenuName}")`);
  }
  
  if (nutritionalGoals.length === 0) {
    throw new Error('Au moins un objectif nutritionnel doit être spécifié');
  }
  
  // Afficher les objectifs
  console.log(`   🎯 Objectifs nutritionnels :`);
  nutritionalGoals.forEach(goal => {
    console.log(`      - ${goal.label} : ${goal.target}${goal.unit} par personne`);
  });
  
  if (dietaryRestrictions.length > 0) {
    console.log(`   ⚠️  Restrictions : ${dietaryRestrictions.join(', ')}`);
  }
  
  // Construire la liste d'ingrédients recommandés pour chaque nutriment
  const ingredientLists = {};
  
  nutritionalGoals.forEach(goal => {
    const minValue = goal.minIngredientValue || 5; // Valeur min pour être considéré "source de"
    const ingredients = getIngredientsByNutrient(goal.nutrient, minValue);
    ingredientLists[goal.nutrient] = ingredients;
    
    console.log(`\n📊 ${ingredients.length} ingrédients riches en ${goal.label}`);
    console.log(`   Top 5 :`);
    ingredients.slice(0, 5).forEach(ing => {
      console.log(`   - ${ing.name}: ${ing.value}${goal.unit}/100g`);
    });
  });
  
  // Construire le prompt dynamique
  const goalsText = nutritionalGoals.map(goal => 
    `- ${goal.label} : minimum ${goal.target}${goal.unit} par personne`
  ).join('\n');
  
  const ingredientsSections = nutritionalGoals.map(goal => {
    const list = ingredientLists[goal.nutrient]
      .slice(0, 15)
      .map(i => `${i.name} (${i.value}${goal.unit}/100g)`)
      .join('\n');
    
    return `INGRÉDIENTS RICHES EN ${goal.label.toUpperCase()} DISPONIBLES:\n${list}`;
  }).join('\n\n');
  
  const restrictionsText = dietaryRestrictions.length > 0 
    ? `RESTRICTIONS ALIMENTAIRES: ${dietaryRestrictions.join(', ')}` 
    : '';
  
  const variationText = forceVariation && avoidMenuName
    ? `⚠️ IMPORTANT: Tu as DÉJÀ proposé "${avoidMenuName}".
Tu DOIS créer un menu COMPLÈTEMENT DIFFÉRENT avec:
- Un nom de plat différent
- Des ingrédients principaux différents (si possible)
- Une présentation/cuisson différente
NE RÉPÈTE PAS le menu précédent !`
    : '';
  
  const prompt = `Tu es un chef cuisinier professionnel spécialisé dans les repas nutritifs pour établissements de santé (EHPAD, hôpitaux).

MISSION: Compose un ${mealType} CLASSIQUE et ÉQUILIBRÉ pour ${numberOfPeople} personnes.

OBJECTIFS NUTRITIONNELS PRIORITAIRES:
${goalsText}

${restrictionsText}

${variationText}

${ingredientsSections}

Tu peux aussi utiliser d'autres légumes, féculents, viandes, poissons et condiments pour compléter le menu.

RÈGLES STRICTES:
1. UTILISE UN NOM DE PLAT CLASSIQUE ET SIMPLE (ex: "Poulet rôti aux légumes", "Saumon grillé et riz", "Salade composée")
2. ÉVITE les noms poétiques, métaphores ou descriptions trop créatives
3. CHOISIS DES ASSOCIATIONS D'INGRÉDIENTS TRADITIONNELLES ET LOGIQUES
4. PRIVILÉGIE des ingrédients qui répondent aux objectifs nutritionnels
5. ⚠️ IMPORTANT: Les quantités doivent être PAR PERSONNE (portions individuelles)
   Exemple: Pour du poulet, indique environ 150g (quantité par personne)
6. Les quantités doivent être RÉALISTES et GÉNÉREUSES pour atteindre les objectifs nutritionnels
7. Le plat doit être APPÉTISSANT, ÉQUILIBRÉ et RECONNAISSABLE

EXEMPLES DE NOMS ACCEPTABLES:
- "Poulet grillé aux poivrons et brocolis"
- "Saumon aux épinards et lentilles"
- "Bœuf braisé aux carottes et quinoa"
- "Salade composée aux agrumes"

FORMAT DE RÉPONSE (JSON):
{
  "nomMenu": "Nom simple et classique du plat",
  "description": "Description courte et réaliste (1 ligne)",
  "ingredients": [
    {
      "nom": "nom exact de l'ingrédient",
      "quantite": 150,
      "unite": "g"
    }
  ],
  "instructions": [
    "Étape 1 - action claire",
    "Étape 2 - action claire"
  ],
  "tempsCuisson": "30 min",
  "difficulte": "Facile"
}

⚠️ RAPPEL: Dans "quantite", indique la portion PAR PERSONNE (ex: 150g de poulet par personne).
Le système multipliera automatiquement par ${numberOfPeople} pour obtenir la quantité totale.

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide, sans texte avant ou après, sans markdown.`;

  console.log(`\n🤖 Appel à l'IA OpenAI...`);
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: forceVariation ? 0.9 : 0.7,  // Plus de créativité pour les variations
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0].message.content;
    console.log(`\n✅ Réponse IA reçue\n`);
    
    // Parser la réponse
    let menuData;
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      menuData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError.message);
      console.log('Réponse brute:', aiResponse);
      throw parseError;
    }
    
    // Calculer les valeurs nutritionnelles réelles
    console.log(`📊 Calcul des valeurs nutritionnelles réelles...\n`);
    
    const enrichedIngredients = menuData.ingredients.map(ing => {
      const ingredientData = getIngredientData(ing.nom);
      if (!ingredientData) {
        console.log(`⚠️  Ingrédient "${ing.nom}" non trouvé dans la database`);
        return null;
      }
      
      // L'IA génère les quantités PAR PERSONNE (comme demandé dans le prompt)
      const quantityPerPerson = parseFloat(ing.quantite) || 100;
      
      console.log(`🔍 [BACKEND] Ingrédient "${ing.nom}": quantite de l'IA (PAR PERSONNE) = ${ing.quantite}, numberOfPeople = ${numberOfPeople}`);
      
      // Calculer la quantité TOTALE en multipliant par le nombre de personnes
      const quantityTotal = quantityPerPerson * numberOfPeople;
      
      console.log(`🔍 [BACKEND] → quantityPerPerson = ${quantityPerPerson}, quantityTotal = ${quantityTotal}`);
      
      // Calculer les valeurs nutritionnelles pour la quantité TOTALE
      const factor = quantityTotal / 100;
      
      const nutritionCalculated = {};
      for (const [key, value] of Object.entries(ingredientData.nutritionalValues)) {
        nutritionCalculated[key] = (value || 0) * factor;
      }
      
      // Construire l'objet final avec SEULEMENT les propriétés dont on a besoin
      return {
        nom: ing.nom,
        unite: ing.unite,
        quantiteParPersonne: quantityPerPerson,  // Quantité par personne (150g)
        quantiteTotal: quantityTotal,             // Quantité totale (150 × 42 = 6300g)
        nutritionalValues: ingredientData.nutritionalValues,
        calculated: nutritionCalculated
      };
    }).filter(ing => ing !== null);
    
    // Calculer les totaux pour tous les nutriments
    const totals = {};
    enrichedIngredients.forEach(ing => {
      for (const [key, value] of Object.entries(ing.calculated)) {
        totals[key] = (totals[key] || 0) + value;
      }
    });
    
    // Préparer les résultats
    const nutrition = {
      total: totals,
      perPerson: {}
    };
    
    for (const [key, value] of Object.entries(totals)) {
      nutrition.perPerson[key] = value / numberOfPeople;
    }
    
    // Log pour vérifier ce qu'on retourne
    console.log('📤 [BACKEND] Exemple d\'ingrédient retourné:', JSON.stringify(enrichedIngredients[0], null, 2));
    
    return {
      menu: menuData,
      nutrition: nutrition,
      numberOfPeople: numberOfPeople,
      nutritionalGoals: nutritionalGoals,
      ingredients: enrichedIngredients
    };
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'appel OpenAI:', error.message);
    throw error;
  }
}

/**
 * Affiche le menu de manière formatée
 */
export function displayMenu(result) {
  const { menu, nutrition, numberOfPeople, nutritionalGoals, ingredients } = result;
  
  console.log('='.repeat(70));
  console.log(`🍽️  ${menu.nomMenu.toUpperCase()}`);
  console.log('='.repeat(70));
  console.log(`\n📝 ${menu.description}\n`);
  console.log(`👥 Pour ${numberOfPeople} personnes`);
  console.log(`⏱️  Temps de cuisson : ${menu.tempsCuisson}`);
  console.log(`📊 Difficulté : ${menu.difficulte}`);
  
  console.log(`\n🥘 INGRÉDIENTS:`);
  ingredients.forEach(ing => {
    const nutrientInfo = nutritionalGoals.map(goal => {
      const value = ing.calculated[goal.nutrient] || 0;
      return `${value.toFixed(1)}${goal.unit} ${goal.label.toLowerCase()}`;
    }).join(', ');
    console.log(`   • ${ing.nom}: ${ing.quantite}${ing.unite} (${nutrientInfo})`);
  });
  
  console.log(`\n👨‍🍳 INSTRUCTIONS:`);
  menu.instructions.forEach((instruction, index) => {
    console.log(`   ${index + 1}. ${instruction}`);
  });
  
  console.log(`\n📊 VALEURS NUTRITIONNELLES TOTALES (${numberOfPeople} pers.):`);
  console.log(`   • Calories : ${Math.round(nutrition.total.calories || 0)} kcal`);
  console.log(`   • Protéines : ${(nutrition.total.proteins || 0).toFixed(1)} g`);
  console.log(`   • Glucides : ${(nutrition.total.carbs || 0).toFixed(1)} g`);
  console.log(`   • Lipides : ${(nutrition.total.lipids || 0).toFixed(1)} g`);
  console.log(`   • Fibres : ${(nutrition.total.fibers || 0).toFixed(1)} g`);
  
  // Afficher les nutriments des objectifs
  nutritionalGoals.forEach(goal => {
    const value = nutrition.total[goal.nutrient] || 0;
    console.log(`   • ${goal.label} : ${value.toFixed(1)} ${goal.unit}`);
  });
  
  console.log(`\n📊 VALEURS NUTRITIONNELLES PAR PERSONNE:`);
  console.log(`   • Calories : ${(nutrition.perPerson.calories || 0).toFixed(1)} kcal`);
  console.log(`   • Protéines : ${(nutrition.perPerson.proteins || 0).toFixed(1)} g`);
  console.log(`   • Glucides : ${(nutrition.perPerson.carbs || 0).toFixed(1)} g`);
  console.log(`   • Lipides : ${(nutrition.perPerson.lipids || 0).toFixed(1)} g`);
  console.log(`   • Fibres : ${(nutrition.perPerson.fibers || 0).toFixed(1)} g`);
  
  // Vérifier les objectifs
  let allGoalsMet = true;
  nutritionalGoals.forEach(goal => {
    const value = nutrition.perPerson[goal.nutrient] || 0;
    const met = value >= goal.target;
    const icon = met ? '✅' : '⚠️';
    console.log(`   • ${goal.label} : ${value.toFixed(1)} ${goal.unit} ${icon}`);
    if (!met) allGoalsMet = false;
  });
  
  console.log('\n' + '='.repeat(70));
  
  if (allGoalsMet) {
    console.log('✅ Tous les objectifs nutritionnels sont atteints !');
  } else {
    console.log('⚠️  Certains objectifs ne sont pas atteints');
  }
  
  console.log('='.repeat(70) + '\n');
}

