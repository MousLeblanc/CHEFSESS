// scripts/extract-recipes-from-json.js
// Script pour extraire les recettes depuis un fichier JSON avec marqueur "recette :"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importer les fonctions depuis ingredients-database.js
import { getIngredientData } from './ingredients-database.js';

/**
 * Convertir une unité en grammes
 */
function convertUnitToGrams(quantity, unit, ingredientName = '') {
  const unitLower = unit.toLowerCase().trim();
  const ingNameLower = (ingredientName || '').toLowerCase();
  
  // Conversions pour épices et condiments (densité plus faible)
  const isSpice = /cannelle|gingembre|safran|paprika|cumin|curcuma|poivre|sel|muscade|ras el hanout|curry|piment/.test(ingNameLower);
  
  // Conversions approximatives
  if (unitLower.includes('cuil. à soupe') || unitLower.includes('cuillère à soupe') || unitLower.includes('c. à soupe')) {
    if (isSpice) {
      return quantity * 8; // Épices en poudre : 1 cuillère à soupe ≈ 8g
    }
    return quantity * 15; // Liquides/autres : 1 cuillère à soupe ≈ 15g
  }
  if (unitLower.includes('cuil. à café') || unitLower.includes('cuillère à café') || unitLower.includes('c. à café')) {
    if (isSpice) {
      return quantity * 2; // Épices en poudre : 1 cuillère à café ≈ 2g
    }
    return quantity * 5; // Liquides/autres : 1 cuillère à café ≈ 5g
  }
  if (unitLower.includes('cuil. à thé') || unitLower.includes('cuillère à thé')) {
    if (isSpice) {
      return quantity * 2; // Épices en poudre : 1 cuillère à thé ≈ 2g
    }
    return quantity * 5; // Liquides/autres : 1 cuillère à thé ≈ 5g
  }
  if (unitLower.includes('cl') || unitLower.includes('centilitre')) {
    return quantity * 10; // 1 cl ≈ 10g (pour liquides)
  }
  if (unitLower.includes('dl') || unitLower.includes('décilitre')) {
    return quantity * 100; // 1 dl ≈ 100g (pour liquides)
  }
  if (unitLower.includes('l') || unitLower.includes('litre')) {
    return quantity * 1000; // 1 l ≈ 1000g (pour liquides)
  }
  if (unitLower.includes('ml')) {
    return quantity * 1; // 1 ml ≈ 1g (pour liquides)
  }
  if (unitLower.includes('kg')) {
    return quantity * 1000;
  }
  if (unitLower.includes('g')) {
    return quantity;
  }
  if (unitLower.includes('pièce') || unitLower.includes('pièces')) {
    // Estimations par type d'ingrédient
    if (ingNameLower.includes('oignon') || ingNameLower.includes('échalote')) {
      return quantity * 100; // 1 oignon ≈ 100g
    }
    if (ingNameLower.includes('gousse') || ingNameLower.includes('ail')) {
      return quantity * 3; // 1 gousse d'ail ≈ 3g
    }
    if (ingNameLower.includes('mangue') || ingNameLower.includes('pomme')) {
      return quantity * 150; // 1 fruit ≈ 150g
    }
    if (ingNameLower.includes('carotte')) {
      return quantity * 80; // 1 carotte ≈ 80g
    }
    if (ingNameLower.includes('pomme de terre')) {
      return quantity * 150; // 1 pomme de terre ≈ 150g
    }
    if (ingNameLower.includes('poivron')) {
      return quantity * 150; // 1 poivron ≈ 150g
    }
    if (ingNameLower.includes('citron')) {
      return quantity * 100; // 1 citron ≈ 100g
    }
    return quantity * 100; // Estimation par défaut
  }
  if (unitLower.includes('pincée') || unitLower.includes('pincées')) {
    return quantity * 0.5; // 1 pincée ≈ 0.5g
  }
  if (unitLower.includes('goutte') || unitLower.includes('gouttes')) {
    return quantity * 0.05; // 1 goutte ≈ 0.05g
  }
  
  return quantity; // Par défaut, supposer que c'est déjà en grammes
}

/**
 * Calculer les valeurs nutritionnelles pour une recette
 */
function calculateNutritionalValuesForRecipe(ingredients) {
  const totalNutrition = {
    calories: 0, proteins: 0, carbs: 0, lipids: 0, fibers: 0, sodium: 0
  };
  let totalWeightGrams = 0;

  ingredients.forEach(ing => {
    const ingredientData = getIngredientData(ing.name);
    if (ingredientData && ingredientData.nutritionalValues) {
      const quantityInGrams = convertUnitToGrams(ing.quantity, ing.unit, ing.name);
      if (quantityInGrams > 0) {
        const factor = quantityInGrams / 100; // Values in DB are per 100g
        totalNutrition.calories += (ingredientData.nutritionalValues.calories || 0) * factor;
        totalNutrition.proteins += (ingredientData.nutritionalValues.proteins || 0) * factor;
        totalNutrition.carbs += (ingredientData.nutritionalValues.carbs || 0) * factor;
        totalNutrition.lipids += (ingredientData.nutritionalValues.lipids || 0) * factor;
        totalNutrition.fibers += (ingredientData.nutritionalValues.fibers || 0) * factor;
        totalNutrition.sodium += (ingredientData.nutritionalValues.sodium || 0) * factor;
        totalWeightGrams += quantityInGrams;
      }
    }
    // Ne pas afficher d'avertissement pour chaque ingrédient non trouvé (trop verbeux)
  });

  // Normaliser à per 100g de recette finale si totalWeightGrams est significatif
  if (totalWeightGrams > 0) {
    Object.keys(totalNutrition).forEach(key => {
      totalNutrition[key] = (totalNutrition[key] / totalWeightGrams) * 100;
    });
  }

  // Arrondir à 1 décimale
  Object.keys(totalNutrition).forEach(key => {
    totalNutrition[key] = Math.round(totalNutrition[key] * 10) / 10;
  });

  return totalNutrition;
}

/**
 * Nettoyer le nom d'un ingrédient
 */
function cleanIngredientName(name) {
  if (!name) return '';
  
  // Supprimer les espaces multiples
  name = name.replace(/\s+/g, ' ').trim();
  
  // Liste de mots courants à supprimer en fin
  const commonEndings = [
    'pour', 'avec', 'sans', 'de', 'du', 'des', 'le', 'la', 'les', 'un', 'une',
    'facultatif', 'facultative', 'optionnel', 'optionnelle', 'selon', 'votre', 'goût'
  ];
  
  // Supprimer les mots courants en fin
  for (const ending of commonEndings) {
    const regex = new RegExp(`\\s+${ending}\\s*$`, 'i');
    name = name.replace(regex, '');
  }
  
  // Supprimer les caractères spéciaux en fin
  name = name.replace(/[,\\.;:!?]+$/, '').trim();
  
  return name;
}

/**
 * Parser les recettes depuis le texte JSON
 */
function parseRecipesFromText(text) {
  const recipes = [];
  
  // Séparer par "recette :" ou "recette"
  const recipePattern = /recette\s*:?\s*/gi;
  const sections = text.split(recipePattern).filter(s => s.trim().length > 50);
  
  console.log(`📚 ${sections.length} sections de recettes détectées`);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    
    // Ignorer les sections d'introduction
    if (section.match(/^Recettes\s+Complètes|^Section\s*:|^Les\s+Entrées|^Les\s+Salades|^Les\s+Soupes/i)) {
      continue;
    }
    
    // Extraire le nom de la recette (première ligne jusqu'à "Pour :" ou fin de ligne)
    const nameMatch = section.match(/^([^\n]+?)(?:\s+\([^)]+\))?(?:\s+Pour\s*:|$)/i);
    if (!nameMatch) continue;
    
    let recipeName = nameMatch[1].trim();
    // Nettoyer le nom (supprimer le pays entre parenthèses si présent)
    recipeName = recipeName.replace(/\s*\([^)]+\)\s*$/, '').trim();
    
    const recipe = {
      name: recipeName,
      ingredients: [],
      preparationSteps: [],
      category: 'plat',
      preparationTime: 0,
      cookingTime: 0,
      servings: 4,
      nutrition: { calories: 0, proteins: 0, carbs: 0, lipids: 0, fibers: 0, sodium: 0 }
    };
    
    // Extraire les métadonnées
    const sectionText = section.toLowerCase();
    
    // Temps de préparation
    const prepMatch = sectionText.match(/préparation\s*:\s*(\d+)\s*(?:minutes?|min|h|heures?)/i);
    if (prepMatch) {
      const value = parseInt(prepMatch[1]);
      if (sectionText.match(/préparation\s*:\s*\d+\s*h/i)) {
        recipe.preparationTime = value * 60;
      } else {
        recipe.preparationTime = value;
      }
    }
    
    // Temps de cuisson
    const cookMatch = sectionText.match(/cuisson\s*:\s*(\d+)\s*(?:minutes?|min|h|heures?)/i);
    if (cookMatch) {
      const value = parseInt(cookMatch[1]);
      if (sectionText.match(/cuisson\s*:\s*\d+\s*h/i)) {
        recipe.cookingTime = value * 60;
      } else {
        recipe.cookingTime = value;
      }
    }
    
    // Nombre de personnes
    const servingsMatch = sectionText.match(/pour\s*:\s*(\d+)(?:\s*à\s*(\d+))?\s*personnes?/i);
    if (servingsMatch) {
      recipe.servings = servingsMatch[2] ? 
        Math.round((parseInt(servingsMatch[1]) + parseInt(servingsMatch[2])) / 2) : 
        parseInt(servingsMatch[1]);
    }
    
    // Extraire les ingrédients
    const ingredientSection = section.match(/ingrédients\s*:([\s\S]*?)(?=préparation\s*:|$)/i);
    if (ingredientSection) {
      const ingredientText = ingredientSection[1];
      // Pattern amélioré pour capturer plus d'ingrédients
      // Supporte: "450g de céleri-rave", "1 c. à soupe de moutarde", "Jus d'1 citron", "1/2 petit chou"
      const ingredientPattern = /(\d+(?:[.,]\d+)?(?:\/\d+)?)\s*(g|kg|ml|l|cl|dl|c\.?\s*à\s*(?:soupe|café|thé)|cuillère|tasse|verre|personnes?|branches?|feuilles?|gousses?|tranches?|œufs?|pièces?|pincées?|gouttes?|petit|petite|gros|grosse|grossec?|moyen|moyenne|grand|grande)\s*(?:de\s+|d'|du|des|le|la|les)?([^,\.;:\n]+?)(?=[,\\.;:\n]|$)/gi;
      
      let ingredientMatch;
      const seenIngredients = new Set();
      
      // Chercher aussi les ingrédients sans quantité explicite (ex: "Jus d'1 citron")
      const specialPattern = /(?:Jus|Zeste|Feuilles?|Branches?|Quelques?)\s+(?:d'|de\s+|du\s+|des\s+)?([^,\.;:\n]+?)(?=[,\\.;:\n]|$)/gi;
      
      while ((ingredientMatch = ingredientPattern.exec(ingredientText)) !== null) {
        const key = `${ingredientMatch[1]}-${ingredientMatch[2]}-${ingredientMatch[3]}`;
        if (seenIngredients.has(key)) continue;
        seenIngredients.add(key);
        
        let ingName = cleanIngredientName(ingredientMatch[3] || ingredientMatch[4] || '');
        
        if (ingName.length > 2 && ingName.length < 100) {
          // Gérer les fractions
          let quantity = ingredientMatch[1];
          if (quantity.includes('/')) {
            const [num, den] = quantity.split('/');
            quantity = parseFloat(num) / parseFloat(den);
          } else {
            quantity = parseFloat(quantity.replace(',', '.'));
          }
          
          // Nettoyer l'unité
          let unit = ingredientMatch[2].trim();
          if (unit.match(/^(petit|petite|gros|grosse|grossec?|moyen|moyenne|grand|grande)$/i)) {
            // Si l'unité est un adjectif, l'ajouter au nom
            ingName = `${unit} ${ingName}`.trim();
            unit = 'unité';
          }
          
          recipe.ingredients.push({
            name: ingName,
            quantity: quantity,
            unit: unit
          });
        }
      }
      
      // Chercher les ingrédients spéciaux (sans quantité numérique)
      let specialMatch;
      while ((specialMatch = specialPattern.exec(ingredientText)) !== null) {
        const ingName = cleanIngredientName(specialMatch[1]);
        if (ingName.length > 2 && ingName.length < 100) {
          const key = `special-${ingName}`;
          if (!seenIngredients.has(key)) {
            seenIngredients.add(key);
            recipe.ingredients.push({
              name: ingName,
              quantity: 1,
              unit: 'unité'
            });
          }
        }
      }
    }
    
    // Extraire les instructions
    const preparationSection = section.match(/préparation\s*:([\s\S]*?)(?=recette\s*:|$)/i);
    if (preparationSection) {
      const prepText = preparationSection[1];
      
      // Nettoyer le texte (supprimer les retours à la ligne multiples)
      const cleanedText = prepText.replace(/\n\s*\n/g, '\n').trim();
      
      // Séparer par points suivis d'une majuscule, ou par retours à la ligne
      // Mais garder les phrases courtes ensemble
      const steps = cleanedText
        .split(/(?<=[\.!])\s+(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ])|(?<=\n)(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ])/)
        .map(s => s.trim())
        .filter(s => s.length > 10 && !s.match(/^(Préparation|Ingrédients|Pour|Cuisson|Accessoires)/i));
      
      steps.forEach(step => {
        const cleaned = step.replace(/\s+/g, ' ').trim();
        // Ignorer les phrases qui sont juste des métadonnées
        if (cleaned.length > 15 && cleaned.length < 500 && 
            !cleaned.match(/^(Pour|Préparation|Cuisson|Ingrédients|Accessoires)/i)) {
          recipe.preparationSteps.push(cleaned);
        }
      });
    }
    
    // Calculer les valeurs nutritionnelles
    if (recipe.ingredients.length > 0) {
      recipe.nutrition = calculateNutritionalValuesForRecipe(recipe.ingredients);
    }
    
    // Ajouter la recette si elle a au moins des ingrédients ou des instructions
    if (recipe.ingredients.length > 0 || recipe.preparationSteps.length > 0) {
      recipes.push(recipe);
    }
  }
  
  return recipes;
}

/**
 * Normaliser une recette
 */
function normalizeRecipe(recipe) {
  return {
    name: recipe.name || 'Recette sans nom',
    category: recipe.category || 'plat',
    ingredients: recipe.ingredients || [],
    preparationSteps: recipe.preparationSteps || [],
    preparationTime: recipe.preparationTime || 0,
    cookingTime: recipe.cookingTime || 0,
    totalTime: (recipe.preparationTime || 0) + (recipe.cookingTime || 0),
    servings: recipe.servings || 4,
    nutrition: recipe.nutrition || { calories: 0, proteins: 0, carbs: 0, lipids: 0, fibers: 0, sodium: 0 },
    tags: generateChefSESTags(recipe)
  };
}

/**
 * Générer les tags Chef SES
 */
function generateChefSESTags(recipe) {
  const tags = [];
  const name = (recipe.name || '').toLowerCase();
  const ingredients = (recipe.ingredients || []).map(i => i.name.toLowerCase()).join(' ');
  const allText = `${name} ${ingredients}`.toLowerCase();
  
  // Tags diététiques
  if (allText.match(/\b(végétarien|vegetarien|vegetable|legume|legumes)\b/)) {
    tags.push('#végétarien');
  }
  if (allText.match(/\b(vegan|végétalien|vegetalien)\b/)) {
    tags.push('#végétalien');
  }
  if (allText.match(/\b(hyperprotéiné|hyperproteine|protein|protéine)\b/)) {
    tags.push('#hyperprotéiné');
  }
  if (allText.match(/\b(hypocalorique|hypo|light|léger|leger)\b/)) {
    tags.push('#hypocalorique');
  }
  
  // Tags catégories
  if (name.match(/\b(soupe|soup|potage)\b/)) {
    tags.push('#soupe');
  }
  if (name.match(/\b(salade|salad)\b/)) {
    tags.push('#salade');
  }
  if (name.match(/\b(dessert|gateau|gâteau|tarte|mousse|crème)\b/)) {
    tags.push('#dessert');
  }
  if (name.match(/\b(pizza|pâte|pate|pasta|lasagne|ravioli|gnocchi)\b/)) {
    tags.push('#pâtes');
  }
  if (name.match(/\b(poisson|fish|saumon|crabe|crevette)\b/)) {
    tags.push('#poisson');
  }
  if (name.match(/\b(viande|meat|bœuf|boeuf|porc|agneau|veau)\b/)) {
    tags.push('#viande');
  }
  if (name.match(/\b(poulet|chicken|volaille|dinde)\b/)) {
    tags.push('#volaille');
  }
  
  // Tags EHPAD
  if (allText.match(/\b(bébé|bebe|purée|puree|mixé|mixer)\b/)) {
    tags.push('#ehpad');
    tags.push('#mixé');
  }
  
  return tags;
}

/**
 * Générer les fichiers de sortie
 */
function generateOutputFiles(recipes, outputPath, baseName) {
  const jsContent = `// Recettes extraites de ${baseName}\n\nexport const recipes = ${JSON.stringify(recipes, null, 2)};\n`;
  const jsonContent = JSON.stringify(recipes, null, 2);
  
  const jsPath = path.join(outputPath, `${baseName}-recipes.js`);
  const jsonPath = path.join(outputPath, `${baseName}-recipes.json`);
  
  fs.writeFileSync(jsPath, jsContent, 'utf8');
  fs.writeFileSync(jsonPath, jsonContent, 'utf8');
  
  console.log(`✅ Fichier JavaScript créé: ${jsPath}`);
  console.log(`✅ Fichier JSON créé: ${jsonPath}`);
}

/**
 * Fonction principale
 */
export default async function extractRecipesFromJSON(jsonPath) {
  try {
    console.log('📖 Lecture du fichier JSON...');
    const text = fs.readFileSync(jsonPath, 'utf8');
    
    console.log('🔍 Parsing des recettes...');
    const recipes = parseRecipesFromText(text);
    
    console.log(`✅ ${recipes.length} recette(s) trouvée(s)`);
    
    // Normaliser les recettes
    const normalizedRecipes = recipes.map(recipe => normalizeRecipe(recipe));
    
    return {
      recipes: normalizedRecipes,
      count: normalizedRecipes.length
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    throw error;
  }
}

// Si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('❌ Usage: node extract-recipes-from-json.js <chemin-vers-fichier.json>');
    process.exit(1);
  }
  
  const outputPath = path.dirname(jsonPath);
  const baseName = path.basename(jsonPath, '.json');
  
  extractRecipesFromJSON(jsonPath)
    .then(result => {
      generateOutputFiles(result.recipes, outputPath, baseName);
      console.log(`\n✅ Extraction terminée: ${result.count} recettes`);
    })
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

