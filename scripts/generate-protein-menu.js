// scripts/generate-protein-menu.js
// Générateur de menu riche en protéines avec OpenAI + base de données d'ingrédients

import dotenv from 'dotenv';
import openai from '../services/openaiClient.js';
import { ingredientsDatabase, getIngredientData, getIngredientsByCategory } from './ingredients-database.js';

dotenv.config();

/**
 * Filtre les ingrédients riches en protéines (> 15g/100g)
 */
function getHighProteinIngredients() {
  const highProteinIngredients = [];
  
  for (const [name, data] of Object.entries(ingredientsDatabase)) {
    if (data.nutritionalValues.proteins >= 15) {
      highProteinIngredients.push({
        name: name,
        category: data.category,
        proteins: data.nutritionalValues.proteins,
        calories: data.nutritionalValues.calories,
        nutritionalValues: data.nutritionalValues
      });
    }
  }
  
  return highProteinIngredients.sort((a, b) => b.proteins - a.proteins);
}

/**
 * Calcule les valeurs nutritionnelles totales d'un menu
 */
function calculateMenuNutrition(ingredients) {
  const totals = {
    calories: 0,
    proteins: 0,
    carbs: 0,
    lipids: 0,
    fibers: 0
  };
  
  ingredients.forEach(ing => {
    // Calculer en fonction de la quantité (en grammes)
    const quantity = ing.quantity || 100;
    const factor = quantity / 100;
    
    totals.calories += (ing.nutritionalValues.calories || 0) * factor;
    totals.proteins += (ing.nutritionalValues.proteins || 0) * factor;
    totals.carbs += (ing.nutritionalValues.carbs || 0) * factor;
    totals.lipids += (ing.nutritionalValues.lipids || 0) * factor;
    totals.fibers += (ing.nutritionalValues.fibers || 0) * factor;
  });
  
  // Arrondir à 1 décimale
  Object.keys(totals).forEach(key => {
    totals[key] = Math.round(totals[key] * 10) / 10;
  });
  
  return totals;
}

/**
 * Génère un menu riche en protéines avec l'IA
 */
async function generateProteinMenu(options = {}) {
  const {
    numberOfPeople = 4,
    targetProteins = 30, // grammes de protéines par personne
    mealType = 'déjeuner', // déjeuner, dîner, repas complet
    dietaryRestrictions = [] // ['sans lactose', 'sans gluten', etc.]
  } = options;
  
  console.log(`\n🥩 Génération d'un menu riche en protéines...`);
  console.log(`   👥 ${numberOfPeople} personnes`);
  console.log(`   🎯 Objectif : ${targetProteins}g de protéines par personne`);
  console.log(`   🍽️  Type : ${mealType}`);
  
  // 1. Récupérer les ingrédients riches en protéines
  const highProteinIngredients = getHighProteinIngredients();
  console.log(`\n📊 ${highProteinIngredients.length} ingrédients riches en protéines disponibles`);
  console.log(`   Top 5 protéines:`);
  highProteinIngredients.slice(0, 5).forEach(ing => {
    console.log(`   - ${ing.name}: ${ing.proteins}g/100g`);
  });
  
  // 2. Créer le prompt pour l'IA
  const ingredientsList = highProteinIngredients.slice(0, 30).map(ing => 
    `${ing.name} (${ing.proteins}g protéines/100g, catégorie: ${ing.category})`
  ).join('\n');
  
  const restrictionsText = dietaryRestrictions.length > 0 
    ? `RESTRICTIONS: ${dietaryRestrictions.join(', ')}` 
    : '';
  
  const prompt = `Tu es un chef cuisinier professionnel spécialisé dans les repas riches en protéines pour établissements de santé (EHPAD, hôpitaux).

MISSION: Compose un ${mealType} CLASSIQUE et ÉQUILIBRÉ pour ${numberOfPeople} personnes avec un minimum de ${targetProteins}g de protéines par personne.

${restrictionsText}

INGRÉDIENTS RICHES EN PROTÉINES DISPONIBLES:
${ingredientsList}

Tu peux aussi utiliser des légumes, féculents et condiments pour compléter le menu.

RÈGLES STRICTES:
1. UTILISE UN NOM DE PLAT CLASSIQUE ET SIMPLE (ex: "Poulet rôti aux légumes", "Saumon grillé et riz", "Bœuf bourguignon")
2. ÉVITE les noms poétiques, métaphores ou descriptions trop créatives
3. CHOISIS DES ASSOCIATIONS D'INGRÉDIENTS TRADITIONNELLES ET LOGIQUES
   ❌ PAS de combinaisons bizarres (ex: thon + cacahuètes)
   ✅ Associations classiques (poulet + riz, saumon + légumes, bœuf + pommes de terre)
4. PRIVILÉGIE UNE SEULE SOURCE DE PROTÉINE PRINCIPALE (viande OU poisson OU œufs)
5. AJOUTE des protéines végétales en accompagnement si nécessaire (lentilles, quinoa, pois chiches)
6. Les quantités doivent être RÉALISTES et GÉNÉREUSES pour atteindre l'objectif protéines
7. Le plat doit être APPÉTISSANT et RECONNAISSABLE par tous

EXEMPLES DE NOMS ACCEPTABLES:
- "Poulet grillé, riz et haricots verts"
- "Pavé de saumon, purée de pommes de terre"
- "Bœuf braisé aux carottes et lentilles"
- "Blanquette de veau et riz basmati"
- "Filet de colin sauce citron, épinards"

FORMAT DE RÉPONSE (JSON):
{
  "nomMenu": "Nom simple et classique du plat",
  "description": "Description courte et réaliste (1 ligne)",
  "ingredients": [
    {
      "nom": "nom exact de l'ingrédient",
      "quantite": 600,
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

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide, sans texte avant ou après, sans markdown.`;

  console.log(`\n🤖 Appel à l'IA OpenAI...`);
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Tu es un chef nutritionniste expert. Tu réponds UNIQUEMENT en JSON valide, sans texte additionnel."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });
    
    const response = completion.choices[0].message.content.trim();
    console.log(`\n✅ Réponse IA reçue`);
    
    // Parser le JSON
    let menuData;
    try {
      // Nettoyer la réponse (enlever les markdown code blocks si présents)
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      menuData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      console.log('Réponse brute:', response);
      throw new Error('Format de réponse invalide');
    }
    
    // 3. Enrichir avec les vraies valeurs nutritionnelles de la database
    console.log(`\n📊 Calcul des valeurs nutritionnelles réelles...`);
    
    const enrichedIngredients = menuData.ingredients.map(ing => {
      const ingredientData = getIngredientData(ing.nom);
      
      if (ingredientData) {
        return {
          ...ing,
          category: ingredientData.category,
          nutritionalValues: ingredientData.nutritionalValues
        };
      } else {
        console.warn(`⚠️  Ingrédient "${ing.nom}" non trouvé dans la database`);
        return {
          ...ing,
          category: 'autres',
          nutritionalValues: {
            calories: 0,
            proteins: 0,
            carbs: 0,
            lipids: 0,
            fibers: 0
          }
        };
      }
    });
    
    const nutritionTotals = calculateMenuNutrition(enrichedIngredients);
    const nutritionPerPerson = {
      calories: Math.round(nutritionTotals.calories / numberOfPeople * 10) / 10,
      proteins: Math.round(nutritionTotals.proteins / numberOfPeople * 10) / 10,
      carbs: Math.round(nutritionTotals.carbs / numberOfPeople * 10) / 10,
      lipids: Math.round(nutritionTotals.lipids / numberOfPeople * 10) / 10,
      fibers: Math.round(nutritionTotals.fibers / numberOfPeople * 10) / 10
    };
    
    // 4. Afficher le résultat final
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🍽️  ${menuData.nomMenu.toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`\n📝 ${menuData.description}`);
    console.log(`\n👥 Pour ${numberOfPeople} personnes`);
    console.log(`⏱️  Temps de cuisson : ${menuData.tempsCuisson}`);
    console.log(`📊 Difficulté : ${menuData.difficulte}`);
    
    console.log(`\n🥘 INGRÉDIENTS:`);
    enrichedIngredients.forEach(ing => {
      const proteinInfo = ing.nutritionalValues.proteins 
        ? ` (${Math.round(ing.nutritionalValues.proteins * ing.quantite / 100)}g protéines)` 
        : '';
      console.log(`   • ${ing.nom}: ${ing.quantite}${ing.unite}${proteinInfo}`);
    });
    
    console.log(`\n👨‍🍳 INSTRUCTIONS:`);
    menuData.instructions.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });
    
    console.log(`\n📊 VALEURS NUTRITIONNELLES TOTALES (${numberOfPeople} pers.):`);
    console.log(`   • Calories : ${nutritionTotals.calories} kcal`);
    console.log(`   • Protéines : ${nutritionTotals.proteins} g`);
    console.log(`   • Glucides : ${nutritionTotals.carbs} g`);
    console.log(`   • Lipides : ${nutritionTotals.lipids} g`);
    console.log(`   • Fibres : ${nutritionTotals.fibers} g`);
    
    console.log(`\n📊 VALEURS NUTRITIONNELLES PAR PERSONNE:`);
    console.log(`   • Calories : ${nutritionPerPerson.calories} kcal`);
    console.log(`   • Protéines : ${nutritionPerPerson.proteins} g ${nutritionPerPerson.proteins >= targetProteins ? '✅' : '⚠️'}`);
    console.log(`   • Glucides : ${nutritionPerPerson.carbs} g`);
    console.log(`   • Lipides : ${nutritionPerPerson.lipids} g`);
    console.log(`   • Fibres : ${nutritionPerPerson.fibers} g`);
    
    console.log(`\n${'='.repeat(60)}`);
    
    if (nutritionPerPerson.proteins >= targetProteins) {
      console.log(`✅ Objectif protéines atteint ! (${nutritionPerPerson.proteins}g / ${targetProteins}g)`);
    } else {
      console.log(`⚠️  Objectif protéines non atteint (${nutritionPerPerson.proteins}g / ${targetProteins}g)`);
    }
    
    // Retourner l'objet complet
    return {
      menu: {
        ...menuData,
        ingredients: enrichedIngredients
      },
      nutrition: {
        total: nutritionTotals,
        perPerson: nutritionPerPerson
      },
      numberOfPeople
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération du menu:', error);
    throw error;
  }
}

// ========== EXEMPLES D'UTILISATION ==========

// Exemple 1: Menu déjeuner riche en protéines (standard)
async function exemple1() {
  console.log('\n🔹 EXEMPLE 1: Menu déjeuner standard riche en protéines\n');
  await generateProteinMenu({
    numberOfPeople: 4,
    targetProteins: 35,
    mealType: 'déjeuner'
  });
}

// Exemple 2: Menu dîner pour sportifs (très riche en protéines)
async function exemple2() {
  console.log('\n🔹 EXEMPLE 2: Menu dîner pour sportifs\n');
  await generateProteinMenu({
    numberOfPeople: 2,
    targetProteins: 50,
    mealType: 'dîner'
  });
}

// Exemple 3: Menu avec restrictions alimentaires
async function exemple3() {
  console.log('\n🔹 EXEMPLE 3: Menu sans lactose\n');
  await generateProteinMenu({
    numberOfPeople: 4,
    targetProteins: 30,
    mealType: 'déjeuner',
    dietaryRestrictions: ['sans lactose']
  });
}

// ========== LANCEMENT ==========

async function main() {
  try {
    // Choisir l'exemple à exécuter (décommenter celui souhaité)
    await exemple1();
    // await exemple2();
    // await exemple3();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// Exporter pour utilisation dans d'autres fichiers
export { generateProteinMenu, getHighProteinIngredients, calculateMenuNutrition };

