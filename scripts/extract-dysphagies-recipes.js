// scripts/extract-dysphagies-recipes.js
// Extraction des recettes du fichier dysphagies.json au format Chef SES

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lire le fichier dysphagies.json
const inputFile = path.join(__dirname, '../data/dysphagies.json');
const outputFile = path.join(__dirname, '../data/dysphagies-recipes.json');
const outputJSFile = path.join(__dirname, '../data/dysphagies-recipes.js');

const content = fs.readFileSync(inputFile, 'utf-8');

// Fonction pour nettoyer le nom d'ingrédient
function cleanIngredientName(name) {
  return name
    .trim()
    .replace(/^\d+[\/\d\s]*\s*(cup|tablespoon|teaspoon|ounce|pound|lb|oz|tbsp|tsp|c\.|t\.|g|kg|ml|l)\s*/i, '')
    .replace(/^[,\-•]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fonction pour extraire les ingrédients
function extractIngredients(text) {
  const ingredients = [];
  const lines = text.split('\n');
  let inIngredients = false;
  let foundFirstIngredient = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Détecter le début de la section ingrédients (ligne avec quantité + unité)
    // Pattern: nombre suivi d'une unité (cup, tablespoon, etc.) ou nombre seul suivi d'ingrédient
    const isIngredientLine = line.match(/^\d+[\/\d\s]*(cup|tablespoon|teaspoon|ounce|pound|lb|oz|tbsp|tsp|c\.|t\.|g|kg|ml|l|inch|piece|clove|package|can|pound|pounds|cloves|packages|cans)/i) ||
                              line.match(/^\d+\s+(pound|pounds|ounce|ounces|cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|clove|cloves|package|packages|can|cans)/i) ||
                              (line.match(/^\d+[\/\d\s]*\s+[a-z]/i) && line.length < 100);
    
    if (isIngredientLine && !foundFirstIngredient) {
      inIngredients = true;
      foundFirstIngredient = true;
    }
    
    // Arrêter à la première étape de préparation (ligne qui commence par un chiffre suivi d'un point)
    if (inIngredients && line.match(/^\d+\.\s/)) {
      break;
    }
    
    // Arrêter si on trouve "FOR THE" ou "TO MAKE" (sections de sous-recettes)
    if (inIngredients && line.match(/^(FOR THE|TO MAKE)/i)) {
      // Continuer mais ignorer cette ligne
      continue;
    }
    
    if (inIngredients && line && !line.match(/^(FOR THE|TO MAKE|SERVINGS|IDDSI|NUTRITIONAL|OceanofPDF)/i)) {
      // Ignorer les lignes qui sont clairement des titres de section (tout en majuscules)
      if (!line.match(/^[A-Z][A-Z\s]{10,}$/) && line.length > 3 && line.length < 150) {
        // Ignorer les lignes qui sont clairement des descriptions (trop longues, phrases complètes)
        if (!line.match(/^[A-Z][^,]{50,}$/) && !line.match(/\.$/)) {
          const cleaned = cleanIngredientName(line);
          if (cleaned && cleaned.length > 2 && !ingredients.includes(cleaned)) {
            ingredients.push(cleaned);
          }
        }
      }
    }
  }

  return ingredients.filter(ing => ing.length > 2 && ing.length < 100);
}

// Fonction pour extraire les étapes de préparation
function extractPreparationSteps(text) {
  const steps = [];
  const lines = text.split('\n');
  let currentStep = '';
  let stepNumber = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Détecter le début d'une étape (numéro suivi d'un point)
    const stepMatch = line.match(/^(\d+)\.\s*(.+)$/);
    if (stepMatch) {
      // Sauvegarder l'étape précédente
      if (currentStep) {
        steps.push(currentStep.trim());
      }
      stepNumber = parseInt(stepMatch[1]);
      currentStep = stepMatch[2];
    } else if (currentStep && line && !line.match(/^(NUTRITIONAL|OceanofPDF|SERVINGS|IDDSI)/i)) {
      // Continuer l'étape sur plusieurs lignes
      currentStep += ' ' + line;
    } else if (line.match(/^(NUTRITIONAL|OceanofPDF)/i)) {
      // Arrêter à la section nutritionnelle
      if (currentStep) {
        steps.push(currentStep.trim());
      }
      break;
    }
  }

  // Ajouter la dernière étape
  if (currentStep) {
    steps.push(currentStep.trim());
  }

  return steps.filter(step => step.length > 0);
}

// Fonction pour extraire le nombre de portions
function extractServings(text) {
  const match = text.match(/SERVINGS?:\s*(\d+)(?:\s*-\s*(\d+))?/i);
  if (match) {
    if (match[2]) {
      return `${match[1]}-${match[2]}`;
    }
    return match[1];
  }
  return '4'; // Par défaut
}

// Fonction pour extraire le temps de cuisson (si disponible)
function extractCookingTime(text) {
  // Chercher des patterns comme "about 30 minutes", "15-20 minutes", etc.
  const timePatterns = [
    /(\d+)\s*-\s*(\d+)\s*(minute|hour)/i,
    /about\s+(\d+)\s*(minute|hour)/i,
    /(\d+)\s*(minute|hour)/i
  ];

  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      const time = match[1] ? `${match[1]}-${match[2] || match[1]}` : match[0];
      const unit = match[3] || match[2] || 'minutes';
      return `${time} ${unit}`;
    }
  }
  return null;
}

// Fonction pour extraire les informations nutritionnelles
function extractNutrition(text) {
  const nutrition = {
    kcal: null,
    protein: null,
    lipids: null,
    carbs: null,
    fiber: null,
    sodium: null
  };

  // Pattern: "112 calories, 0.7 g fat, 0.1 g saturated fat, 172 mg sodium, 4.1 g sugar, 23.3 g carbohydrates, 2.7 g fiber, 5.2 g protein"
  const match = text.match(/NUTRITIONAL ANALYSIS PER SERVING[^\n]*\n([^\n]+)/i);
  if (match) {
    const nutritionText = match[1];
    
    // Calories
    const calMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*calories?/i);
    if (calMatch) nutrition.kcal = parseFloat(calMatch[1]);

    // Protein
    const proteinMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*g\s*protein/i);
    if (proteinMatch) nutrition.protein = parseFloat(proteinMatch[1]);

    // Fat/Lipids
    const fatMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*g\s*fat/i);
    if (fatMatch) nutrition.lipids = parseFloat(fatMatch[1]);

    // Carbohydrates
    const carbsMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*g\s*carbohydrates?/i);
    if (carbsMatch) nutrition.carbs = parseFloat(carbsMatch[1]);

    // Fiber
    const fiberMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*g\s*fiber/i);
    if (fiberMatch) nutrition.fiber = parseFloat(fiberMatch[1]);

    // Sodium
    const sodiumMatch = nutritionText.match(/(\d+(?:\.\d+)?)\s*mg\s*sodium/i);
    if (sodiumMatch) nutrition.sodium = parseFloat(sodiumMatch[1]);
  }

  return nutrition;
}

// Fonction pour détecter les allergènes
function detectAllergens(ingredients, name) {
  const allergens = [];
  const allergenKeywords = {
    gluten: ['flour', 'wheat', 'matzo', 'pasta', 'bread', 'gluten'],
    lactose: ['milk', 'cream', 'butter', 'cheese', 'yogurt', 'dairy'],
    oeufs: ['egg', 'eggs'],
    soja: ['soy', 'soya', 'tofu'],
    poisson: ['fish', 'salmon', 'tuna', 'cod', 'seafood'],
    crustaces: ['shrimp', 'crab', 'lobster', 'prawn'],
    mollusques: ['scallop', 'clam', 'oyster', 'mussel'],
    fruits_a_coque: ['almond', 'walnut', 'hazelnut', 'pecan', 'nut'],
    arachides: ['peanut', 'peanuts']
  };

  const allText = (name + ' ' + ingredients.join(' ')).toLowerCase();

  for (const [allergen, keywords] of Object.entries(allergenKeywords)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      allergens.push(allergen);
    }
  }

  return allergens;
}

// Fonction pour détecter les restrictions alimentaires
function detectDietaryRestrictions(ingredients, name) {
  const restrictions = [];
  const text = (name + ' ' + ingredients.join(' ')).toLowerCase();

  if (text.includes('vegetable') && !text.match(/(chicken|beef|pork|meat|fish)/)) {
    restrictions.push('vegetarien');
  }
  if (text.includes('vegan') || (!text.match(/(meat|fish|chicken|beef|pork|egg|dairy|milk|cheese|butter)/) && text.includes('vegetable'))) {
    restrictions.push('vegan');
  }
  if (text.includes('halal')) {
    restrictions.push('halal');
  }
  if (text.includes('kosher') || text.includes('casher')) {
    restrictions.push('casher');
  }

  return restrictions;
}

// Fonction pour générer les tags Chef SES
function generateChefSESTags(name, ingredients, category) {
  const tags = [];
  const text = (name + ' ' + ingredients.join(' ')).toLowerCase();

  // Tags de texture (dysphagie)
  tags.push('texture:purée');
  tags.push('iddsi:level-4');

  // Tags de type
  if (text.includes('soup')) {
    tags.push('type:soupe');
  }
  if (text.includes('dessert') || text.includes('pudding') || text.includes('cake')) {
    tags.push('type:dessert');
  }
  if (text.includes('shake') || text.includes('smoothie')) {
    tags.push('type:boisson');
  }

  // Tags nutritionnels
  if (text.includes('protein') || text.match(/(chicken|beef|pork|fish|turkey)/)) {
    tags.push('riche_en_protéines');
  }
  if (text.includes('fiber') || text.match(/(vegetable|fruit|legume)/)) {
    tags.push('riche_en_fibres');
  }

  return tags;
}

// Fonction pour normaliser une recette au format Chef SES
function normalizeRecipe(recipeText, recipeName) {
  const ingredients = extractIngredients(recipeText);
  const preparationSteps = extractPreparationSteps(recipeText);
  const servings = extractServings(recipeText);
  const cookingTime = extractCookingTime(recipeText);
  const nutrition = extractNutrition(recipeText);

  // Détecter la catégorie
  let category = 'plat';
  const nameLower = recipeName.toLowerCase();
  if (nameLower.includes('soup')) {
    category = 'soupe';
  } else if (nameLower.includes('shake') || nameLower.includes('smoothie')) {
    category = 'boisson';
  } else if (nameLower.includes('dessert') || nameLower.includes('pudding') || nameLower.includes('cake')) {
    category = 'dessert';
  }

  const allergens = detectAllergens(ingredients, recipeName);
  const dietaryRestrictions = detectDietaryRestrictions(ingredients, recipeName);
  const tags = generateChefSESTags(recipeName, ingredients, category);

  return {
    name: recipeName,
    category: category,
    establishmentTypes: ['ehpad', 'restaurant', 'domicile'],
    ageGroup: ['senior', 'adulte'],
    texture: 'purée',
    diet: dietaryRestrictions.includes('vegan') ? 'vegan' : (dietaryRestrictions.includes('vegetarien') ? 'vegetarien' : 'standard'),
    dietaryRestrictions: dietaryRestrictions,
    tags: tags,
    pathologies: ['dysphagie'],
    allergens: allergens,
    nutritionalProfile: {
      kcal: nutrition.kcal,
      protein: nutrition.protein,
      lipids: nutrition.lipids,
      carbs: nutrition.carbs,
      fiber: nutrition.fiber,
      sodium: nutrition.sodium
    },
    ingredients: ingredients.map(ing => ({
      name: ing,
      quantity: null,
      unit: null
    })),
    preparationSteps: preparationSteps,
    servings: servings,
    cookingTime: cookingTime || null,
    description: `Recette adaptée pour la dysphagie (IDDSI Level 4 - Purée). ${recipeName}`
  };
}

// Fonction principale pour parser les recettes
function parseRecipesFromText(text) {
  const recipes = [];
  const sections = text.split('OceanofPDF.com');

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    
    // Ignorer les sections qui ne sont pas des recettes (introduction, etc.)
    if (section.length < 100 || !section.match(/SERVINGS?:\s*\d+/i)) {
      continue;
    }

    // Extraire le nom de la recette (première ligne en majuscules ou titre évident)
    const lines = section.split('\n');
    let recipeName = '';
    
    // Chercher le titre de la recette (généralement avant "SERVINGS")
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j].trim();
      if (line.match(/SERVINGS?:\s*\d+/i)) {
        // Le titre est généralement 1-3 lignes avant
        for (let k = Math.max(0, j - 3); k < j; k++) {
          const prevLine = lines[k].trim();
          if (prevLine && 
              prevLine.length > 3 && 
              prevLine.length < 100 &&
              !prevLine.match(/^(FOR THE|TO MAKE|NUTRITIONAL|IDDSI)/i) &&
              !prevLine.match(/^\d+\.\s/) &&
              !prevLine.match(/^[a-z]/)) {
            recipeName = prevLine;
            break;
          }
        }
        break;
      }
    }

    // Si on n'a pas trouvé de nom, essayer la première ligne significative
    if (!recipeName) {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && 
            trimmed.length > 3 && 
            trimmed.length < 100 &&
            !trimmed.match(/^(FOR THE|TO MAKE|NUTRITIONAL|IDDSI|SERVINGS)/i) &&
            !trimmed.match(/^\d+\.\s/) &&
            trimmed[0] === trimmed[0].toUpperCase()) {
          recipeName = trimmed;
          break;
        }
      }
    }

    if (recipeName && section.match(/SERVINGS?:\s*\d+/i)) {
      try {
        const normalized = normalizeRecipe(section, recipeName);
        if (normalized.ingredients.length > 0 && normalized.preparationSteps.length > 0) {
          recipes.push(normalized);
        }
      } catch (error) {
        console.error(`Erreur lors de la normalisation de "${recipeName}":`, error.message);
      }
    }
  }

  return recipes;
}

// Exécuter l'extraction
console.log('Extraction des recettes de dysphagies.json...');
const recipes = parseRecipesFromText(content);

console.log(`\n${recipes.length} recettes extraites\n`);

// Afficher quelques exemples
recipes.slice(0, 3).forEach((recipe, index) => {
  console.log(`${index + 1}. ${recipe.name}`);
  console.log(`   Catégorie: ${recipe.category}`);
  console.log(`   Ingrédients: ${recipe.ingredients.length}`);
  console.log(`   Étapes: ${recipe.preparationSteps.length}`);
  console.log(`   Portions: ${recipe.servings}`);
  console.log('');
});

// Sauvegarder en JSON
fs.writeFileSync(outputFile, JSON.stringify(recipes, null, 2), 'utf-8');
console.log(`✅ Recettes sauvegardées dans ${outputFile}`);

// Sauvegarder en JS
const jsContent = `// Recettes extraites de dysphagies.json\n\nexport default ${JSON.stringify(recipes, null, 2)};\n`;
fs.writeFileSync(outputJSFile, jsContent, 'utf-8');
console.log(`✅ Recettes sauvegardées dans ${outputJSFile}`);

