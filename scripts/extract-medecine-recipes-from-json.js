// scripts/extract-medecine-recipes-from-json.js
// Script pour extraire les recettes du fichier "medecin receipt.json" avec tags
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Détecter les allergènes dans les ingrédients
 */
function detectAllergens(recipe) {
  const allergens = new Set();
  const allText = `${recipe.name} ${(recipe.ingredients || []).map(i => i.name).join(' ')}`.toLowerCase();
  
  const allergenMap = {
    'gluten': ['flour', 'wheat', 'bread', 'pasta', 'noodles', 'semolina', 'couscous', 'barley', 'rye', 'oats'],
    'lactose': ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt', 'dairy', 'parmesan', 'mozzarella'],
    'oeufs': ['egg', 'eggs', 'mayonnaise', 'mayo'],
    'poisson': ['fish', 'salmon', 'tuna', 'sardine', 'anchovy', 'cod', 'trout', 'mackerel'],
    'crustaces': ['shrimp', 'crab', 'lobster', 'prawn', 'crayfish'],
    'mollusques': ['mussel', 'oyster', 'clam', 'squid', 'octopus', 'scallop'],
    'soja': ['soy', 'soya', 'tofu', 'tempeh', 'miso', 'edamame'],
    'fruits_a_coque': ['almond', 'walnut', 'hazelnut', 'cashew', 'pistachio', 'pecan', 'macadamia', 'pine nut'],
    'arachides': ['peanut', 'peanuts', 'groundnut'],
    'sesame': ['sesame', 'tahini'],
    'moutarde': ['mustard'],
    'celeri': ['celery', 'celeriac'],
    'sulfites': ['sulfite', 'sulphite'],
    'lupin': ['lupin', 'lupine']
  };
  
  for (const [allergen, keywords] of Object.entries(allergenMap)) {
    for (const keyword of keywords) {
      if (allText.includes(keyword)) {
        allergens.add(allergen);
        break;
      }
    }
  }
  
  return Array.from(allergens);
}

/**
 * Détecter les restrictions diététiques
 */
function detectDietaryRestrictions(recipe) {
  const restrictions = [];
  const allText = `${recipe.name} ${(recipe.ingredients || []).map(i => i.name).join(' ')}`.toLowerCase();
  
  if (allText.match(/\b(vegetarian|veggie|no meat|no fish)\b/)) {
    restrictions.push('vegetarian');
  }
  if (allText.match(/\b(vegan|no dairy|no eggs|plant-based)\b/)) {
    restrictions.push('vegan');
  }
  if (allText.match(/\b(halal|no pork)\b/)) {
    restrictions.push('halal');
  }
  if (allText.match(/\b(kosher|no shellfish)\b/)) {
    restrictions.push('kosher');
  }
  
  return restrictions;
}

/**
 * Générer les tags pour les recettes médicales
 */
function generateTags(recipe, ingredientContext = '') {
  const tags = [];
  const name = (recipe.name || '').toLowerCase();
  const ingredients = (recipe.ingredients || []).map(i => i.name.toLowerCase()).join(' ');
  const allText = `${name} ${ingredients} ${ingredientContext}`.toLowerCase();
  
  // Tags médicaux/thérapeutiques
  if (allText.match(/\b(cancer|anticancer|healing|immune|detox|antioxidant)\b/)) {
    tags.push('#cancer-healing');
    tags.push('#immune-boosting');
  }
  
  // Tags par ingrédient principal
  if (allText.match(/\b(turmeric|curcumin|curry)\b/)) {
    tags.push('#turmeric');
    tags.push('#anti-inflammatory');
  }
  if (allText.match(/\b(blueberry|blueberries)\b/)) {
    tags.push('#blueberry');
    tags.push('#antioxidant');
  }
  if (allText.match(/\b(broccoli|broccoli sprout)\b/)) {
    tags.push('#broccoli');
    tags.push('#cruciferous');
  }
  if (allText.match(/\b(flax|flaxseed|linseed)\b/)) {
    tags.push('#flaxseed');
    tags.push('#omega-3');
  }
  if (allText.match(/\b(green|kale|spinach|watercress|arugula)\b/)) {
    tags.push('#dark-leafy-greens');
    tags.push('#detox');
  }
  if (allText.match(/\b(garlic)\b/)) {
    tags.push('#garlic');
    tags.push('#immune-boosting');
  }
  if (allText.match(/\b(ginger)\b/)) {
    tags.push('#ginger');
    tags.push('#anti-inflammatory');
  }
  if (allText.match(/\b(grapes|grape)\b/)) {
    tags.push('#grapes');
    tags.push('#resveratrol');
  }
  if (allText.match(/\b(lemon)\b/)) {
    tags.push('#lemon');
    tags.push('#vitamin-c');
  }
  if (allText.match(/\b(mushroom|shiitake|reishi)\b/)) {
    tags.push('#mushroom');
    tags.push('#immune-boosting');
  }
  if (allText.match(/\b(quinoa)\b/)) {
    tags.push('#quinoa');
    tags.push('#protein');
  }
  if (allText.match(/\b(tomato|tomatoes)\b/)) {
    tags.push('#tomato');
    tags.push('#lycopene');
  }
  
  // Tags catégories
  if (name.match(/\b(juice|juicing)\b/)) {
    tags.push('#juice');
    tags.push('#beverage');
  }
  if (name.match(/\b(smoothie)\b/)) {
    tags.push('#smoothie');
    tags.push('#beverage');
  }
  if (name.match(/\b(soup|broth)\b/)) {
    tags.push('#soup');
  }
  if (name.match(/\b(salad)\b/)) {
    tags.push('#salad');
  }
  if (name.match(/\b(tea)\b/)) {
    tags.push('#tea');
    tags.push('#beverage');
  }
  if (name.match(/\b(cake|dessert|pudding)\b/)) {
    tags.push('#dessert');
  }
  
  // Tags diététiques
  if (allText.match(/\b(vegetarian|veggie|no meat|no fish)\b/)) {
    tags.push('#végétarien');
  }
  if (allText.match(/\b(vegan|no dairy|no eggs|plant-based)\b/)) {
    tags.push('#végétalien');
  }
  if (allText.match(/\b(gluten-free|no gluten|no wheat)\b/)) {
    tags.push('#sans-gluten');
  }
  if (allText.match(/\b(dairy-free|no dairy|no milk)\b/)) {
    tags.push('#sans-lactose');
  }
  
  // Tags nutritionnels
  if (allText.match(/\b(protein|high protein)\b/)) {
    tags.push('#hyperprotéiné');
  }
  if (allText.match(/\b(low calorie|light|low fat)\b/)) {
    tags.push('#hypocalorique');
  }
  
  return tags;
}

/**
 * Parser les recettes depuis le texte
 */
function parseRecipesFromText(text) {
  const recipes = [];
  
  // Pattern pour détecter les recettes : nom en MAJUSCULES suivi de "Makes" ou "Ingredients"
  // Format: "RECIPE NAME" suivi d'une description puis "Makes X servings" ou "Total time" puis "Ingredients:"
  const recipePattern = /([A-Z][A-Z\s'&!.,\-]+(?:'S)?)\s*\n([\s\S]*?)(?=\n[A-Z][A-Z\s'&!.,\-]+(?:'S)?\s*\n|$)/g;
  
  let recipeMatch;
  while ((recipeMatch = recipePattern.exec(text)) !== null) {
    const recipeName = recipeMatch[1].trim();
    const recipeText = recipeMatch[2].trim();
    
    // Ignorer si ce n'est pas vraiment une recette (pas de "Makes" ou "Ingredients")
    if (!recipeText.match(/\b(Makes|Ingredients|Total time|Prep time|Cook time)\b/i)) {
      continue;
    }
    
    // Ignorer les titres de chapitres
    if (recipeName.match(/^(PART|CHAPTER|CANCER-HEALING|WAYS OF INCORPORATING|SUGGESTED|TIPS|VARIATIONS)/i)) {
      continue;
    }
    
    const recipe = {
      name: recipeName,
      ingredients: [],
      preparationSteps: [],
      category: 'plat',
      preparationTime: 0,
      cookingTime: 0,
      servings: 4,
      tags: [],
      ingredientContext: ''
    };
    
    // Extraire le nombre de portions
    const servingsMatch = recipeText.match(/Makes\s+(\d+)\s+serving/i);
    if (servingsMatch) {
      recipe.servings = parseInt(servingsMatch[1]);
    }
    
    // Extraire le temps total
    const totalTimeMatch = recipeText.match(/Total time:\s*(\d+)\s*minutes?/i);
    if (totalTimeMatch) {
      recipe.preparationTime = parseInt(totalTimeMatch[1]);
    }
    
    // Extraire les ingrédients (section "Ingredients:")
    const ingredientsSection = recipeText.match(/Ingredients:\s*\n([\s\S]*?)(?=Actions:|Directions:|Tips:|Variations:|Calories:|$)/i);
    if (ingredientsSection) {
      const ingredientsText = ingredientsSection[1];
      const ingredientLines = ingredientsText.split('\n').filter(line => line.trim().length > 0);
      
      for (const line of ingredientLines) {
        // Pattern pour quantités: fractions, nombres, "One", "Pinch", etc.
        const ingMatch = line.match(/^(\d+\/\d+|\d+\.?\d*|One|one|Two|two|Three|three|Four|four|Five|five|Six|six|Seven|seven|Eight|eight|Nine|nine|Ten|ten|Pinch|pinch|Few|few|Several|several)\s*(?:cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|tbsp|tsp|oz|ounce|ounces|lb|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|clove|cloves|piece|pieces|slice|slices|handful|handfuls|bunch|bunches|stalk|stalks|head|heads|can|cans|package|packages|pound|pounds)?\s*(?:of\s+)?(.+)$/i);
        
        if (ingMatch) {
          let quantity = ingMatch[1];
          const unit = (ingMatch[2] || '').trim() || 'unit';
          const ingredientName = ingMatch[3].trim();
          
          // Convertir les mots en nombres
          const wordToNumber = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'pinch': 0.125, 'few': 3, 'several': 5
          };
          
          if (wordToNumber[quantity.toLowerCase()]) {
            quantity = wordToNumber[quantity.toLowerCase()];
          } else if (quantity.includes('/')) {
            // Gérer les fractions
            const [num, den] = quantity.split('/');
            quantity = parseFloat(num) / parseFloat(den);
          } else {
            quantity = parseFloat(quantity) || 1;
          }
          
          if (ingredientName && ingredientName.length > 1) {
            recipe.ingredients.push({
              name: ingredientName,
              quantity: quantity,
              unit: unit
            });
          }
        } else if (line.trim().length > 2) {
          // Si pas de quantité détectée, ajouter quand même l'ingrédient
          recipe.ingredients.push({
            name: line.trim(),
            quantity: 1,
            unit: 'unit'
          });
        }
      }
    }
    
    // Extraire les instructions (section "Actions:" ou "Directions:")
    const actionsSection = recipeText.match(/(?:Actions|Directions):\s*\n([\s\S]*?)(?=Tips:|Variations:|Calories:|$)/i);
    if (actionsSection) {
      const actionsText = actionsSection[1];
      // Séparer par numéros (1., 2., etc.) ou par lignes
      const steps = actionsText.split(/\d+\.\s+/).filter(step => step.trim().length > 10);
      
      if (steps.length > 0) {
        recipe.preparationSteps = steps.map(step => step.trim()).filter(step => step.length > 5);
      } else {
        // Si pas de numérotation, prendre chaque ligne
        const lines = actionsText.split('\n').filter(line => line.trim().length > 10);
        recipe.preparationSteps = lines.map(line => line.trim());
      }
    }
    
    // Générer les tags
    recipe.tags = generateTags(recipe, '');
    
    // Détecter les allergènes et restrictions
    recipe.allergens = detectAllergens(recipe);
    recipe.dietaryRestrictions = detectDietaryRestrictions(recipe);
    
    // Si on a au moins un nom et des ingrédients ou des instructions, ajouter la recette
    if (recipe.name && recipe.name.length > 3 && (recipe.ingredients.length > 0 || recipe.preparationSteps.length > 0)) {
      recipes.push(recipe);
    }
  }
  
  return recipes;
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
    tags: recipe.tags || [],
    allergens: recipe.allergens || [],
    dietaryRestrictions: recipe.dietaryRestrictions || [],
    ingredientContext: recipe.ingredientContext || '',
    nutrition: {
      calories: 0,
      proteins: 0,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 0
    }
  };
}

/**
 * Fonction principale
 */
async function extractMedicineRecipes(jsonPath, outputPath = null) {
  try {
    console.log('📚 Extraction des recettes médicales depuis le JSON...');
    console.log(`   Fichier: ${jsonPath}`);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Le fichier JSON n'existe pas: ${jsonPath}`);
    }
    
    // Lire le fichier
    console.log('\n📖 Lecture du fichier...');
    const text = fs.readFileSync(jsonPath, 'utf8');
    console.log(`✅ ${text.length} caractères lus`);
    
    // Parser les recettes
    console.log('\n🔍 Parsing des recettes...');
    const recipes = parseRecipesFromText(text);
    console.log(`✅ ${recipes.length} recette(s) trouvée(s)`);
    
    // Normaliser les recettes
    const normalizedRecipes = recipes.map(recipe => normalizeRecipe(recipe));
    
    // Afficher un résumé
    if (normalizedRecipes.length > 0) {
      console.log('\n📊 Résumé des recettes:');
      console.log(`   Total: ${normalizedRecipes.length}`);
      
      // Statistiques par tags
      const tagCounts = {};
      normalizedRecipes.forEach(recipe => {
        recipe.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      console.log('\n🏷️  Tags les plus fréquents:');
      Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([tag, count]) => {
          console.log(`   ${tag}: ${count}`);
        });
      
      // Afficher quelques exemples
      console.log('\n📝 Exemples de recettes:');
      normalizedRecipes.slice(0, 5).forEach((recipe, index) => {
        console.log(`\n   ${index + 1}. ${recipe.name}`);
        console.log(`      Tags: ${recipe.tags.join(', ')}`);
        console.log(`      Ingrédients: ${recipe.ingredients.length}`);
        console.log(`      Instructions: ${recipe.preparationSteps.length}`);
      });
    }
    
    // Générer les fichiers de sortie
    if (outputPath) {
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Fichier JSON
      const jsonPath = outputPath.replace(/\.js$/, '.json');
      fs.writeFileSync(jsonPath, JSON.stringify(normalizedRecipes, null, 2), 'utf8');
      console.log(`\n✅ Fichier JSON créé: ${jsonPath}`);
      
      // Fichier JS
      const jsContent = `// Recettes extraites de ${path.basename(jsonPath)}\n// ${normalizedRecipes.length} recettes\n\nexport const recipes = ${JSON.stringify(normalizedRecipes, null, 2)};\n\nexport default recipes;`;
      fs.writeFileSync(outputPath, jsContent, 'utf8');
      console.log(`✅ Fichier JS créé: ${outputPath}`);
    }
    
    return normalizedRecipes;
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    throw error;
  }
}

// Export par défaut
export default extractMedicineRecipes;

// Si exécuté directement
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.includes('extract-medecine-recipes-from-json');

if (isMainModule || process.argv[1]?.includes('extract-medecine-recipes-from-json')) {
  const jsonPath = process.argv[2] || path.join(__dirname, '..', 'data', 'medecin receipt.json');
  const outputPath = process.argv[3] || path.join(__dirname, '..', 'data', 'medecin-receipt-recipes.js');
  
  extractMedicineRecipes(jsonPath, outputPath)
    .then(() => {
      console.log('\n✅ Extraction terminée!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    });
}

