// scripts/extract-ethiopian-recipes.js
// Script pour extraire les recettes du fichier ETHIOPIAN.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Nettoyer le nom d'un ingrédient
 */
function cleanIngredientName(name) {
  if (!name) return '';
  
  name = name.trim();
  
  // Supprimer les numéros en début (1., 2., etc.)
  name = name.replace(/^\d+\.\s*/, '');
  
  // Supprimer les caractères spéciaux en début/fin
  name = name.replace(/^[,\\.;:!?]+/, '').replace(/[,\\.;:!?]+$/, '');
  
  // Nettoyer les espaces multiples
  name = name.replace(/\s+/g, ' ').trim();
  
  return name;
}

/**
 * Extraire les ingrédients depuis le texte
 */
function extractIngredients(ingredientsText) {
  const ingredients = [];
  const lines = ingredientsText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  for (const line of lines) {
    // Ignorer les lignes "Optional:" ou "To Garnish:"
    if (line.match(/^(Optional|To Garnish):/i)) {
      continue;
    }
    
    // Ignorer les lignes qui sont des titres de section
    if (line.match(/^Ingredient List:/i)) {
      continue;
    }
    
    // Extraire la quantité et le nom
    // Format: "1 teaspoon of berbere spice mixture" ou "2 tablespoons Kibbeh"
    const cleaned = cleanIngredientName(line);
    if (cleaned.length > 2) {
      ingredients.push({
        name: cleaned,
        quantity: '',
        unit: ''
      });
    }
  }
  
  return ingredients;
}

/**
 * Extraire les étapes de préparation
 */
function extractPreparationSteps(preparationText) {
  const steps = [];
  const lines = preparationText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let currentStep = '';
  for (const line of lines) {
    // Ignorer les lignes "Preparation:"
    if (line.match(/^Preparation:/i)) {
      continue;
    }
    
    // Détecter les étapes numérotées (1., 2., etc.)
    const stepMatch = line.match(/^(\d+)\.\s*(.+)$/);
    if (stepMatch) {
      // Sauvegarder l'étape précédente si elle existe
      if (currentStep.trim()) {
        steps.push(currentStep.trim());
      }
      currentStep = stepMatch[2];
    } else if (currentStep) {
      // Continuer l'étape actuelle sur plusieurs lignes
      currentStep += ' ' + line;
    }
  }
  
  // Ajouter la dernière étape
  if (currentStep.trim()) {
    steps.push(currentStep.trim());
  }
  
  return steps;
}

/**
 * Parser les recettes depuis le texte
 */
function parseRecipesFromText(text) {
  const recipes = [];
  
  // Pattern pour détecter les recettes: "Recipe X: Nom"
  const recipePattern = /Recipe\s+(\d+):\s*([^\n]+)/gi;
  
  let recipeMatch;
  let lastIndex = 0;
  
  while ((recipeMatch = recipePattern.exec(text)) !== null) {
    const recipeNumber = parseInt(recipeMatch[1]);
    const recipeName = recipeMatch[2].trim();
    const startIndex = recipeMatch.index;
    
    // Si on a une recette précédente, extraire son contenu
    if (recipes.length > 0) {
      const prevRecipe = recipes[recipes.length - 1];
      const prevText = text.substring(prevRecipe.startIndex, startIndex);
      extractRecipeDetails(prevRecipe, prevText);
    }
    
    // Créer une nouvelle recette
    const recipe = {
      name: recipeName,
      ingredients: [],
      preparationSteps: [],
      category: 'plat',
      preparationTime: 0,
      cookingTime: 0,
      servings: 4,
      startIndex: startIndex
    };
    
    recipes.push(recipe);
    lastIndex = recipeMatch.index + recipeMatch[0].length;
  }
  
  // Extraire les détails de la dernière recette
  if (recipes.length > 0) {
    const lastRecipe = recipes[recipes.length - 1];
    const lastText = text.substring(lastRecipe.startIndex);
    extractRecipeDetails(lastRecipe, lastText);
  }
  
  return recipes;
}

/**
 * Extraire les détails d'une recette (ingrédients, étapes, métadonnées)
 */
function extractRecipeDetails(recipe, text) {
  // Extraire le nombre de portions
  const yieldMatch = text.match(/Yield:\s*(\d+)(?:\s*-\s*(\d+))?\s*Servings?/i);
  if (yieldMatch) {
    const min = parseInt(yieldMatch[1]);
    const max = yieldMatch[2] ? parseInt(yieldMatch[2]) : min;
    recipe.servings = Math.round((min + max) / 2);
  }
  
  // Extraire le temps de préparation
  const prepTimeMatch = text.match(/Preparation\s+Time:\s*([^\n]+)/i);
  if (prepTimeMatch) {
    const timeText = prepTimeMatch[1].toLowerCase();
    // Format: "50 minutes" ou "1 & 1/2 hour" ou "1 hour & 10 minutes"
    let totalMinutes = 0;
    
    // Heures
    const hourMatch = timeText.match(/(\d+(?:\s*&\s*\d+\/\d+)?)\s*hours?/);
    if (hourMatch) {
      const hourStr = hourMatch[1];
      if (hourStr.includes('&')) {
        // Format "1 & 1/2"
        const parts = hourStr.split('&').map(p => p.trim());
        const whole = parseInt(parts[0]) || 0;
        const fraction = parts[1] ? eval(parts[1]) : 0;
        totalMinutes += (whole + fraction) * 60;
      } else {
        totalMinutes += parseInt(hourStr) * 60;
      }
    }
    
    // Minutes
    const minMatch = timeText.match(/(\d+)\s*minutes?/);
    if (minMatch) {
      totalMinutes += parseInt(minMatch[1]);
    }
    
    recipe.preparationTime = totalMinutes || 0;
  }
  
  // Extraire les ingrédients (section "Ingredient List:")
  const ingredientsMatch = text.match(/Ingredient\s+List:\s*\n([\s\S]*?)(?=\n\s*HHHH+|Preparation:|Recipe\s+\d+:|$)/i);
  if (ingredientsMatch) {
    recipe.ingredients = extractIngredients(ingredientsMatch[1]);
  }
  
  // Extraire les étapes de préparation (section "Preparation:")
  const preparationMatch = text.match(/Preparation:\s*\n([\s\S]*?)(?=\n\s*Recipe\s+\d+:|Chapter|About|$)/i);
  if (preparationMatch) {
    recipe.preparationSteps = extractPreparationSteps(preparationMatch[1]);
  }
  
  // Déterminer la catégorie basée sur le nom ou le chapitre
  const nameLower = recipe.name.toLowerCase();
  if (nameLower.match(/\b(breakfast|porridge|genfo|firfir)\b/)) {
    recipe.category = 'petit-dejeuner';
  } else if (nameLower.match(/\b(dessert|salad|fruit|baklava|turnover)\b/)) {
    recipe.category = 'dessert';
  } else if (nameLower.match(/\b(salad|salade)\b/)) {
    recipe.category = 'entree';
  } else {
    recipe.category = 'plat';
  }
  
  // Supprimer startIndex (propriété temporaire)
  delete recipe.startIndex;
}

/**
 * Détecter les allergènes dans les ingrédients
 */
function detectAllergens(recipe) {
  const allergens = new Set();
  const allText = `${recipe.name} ${(recipe.ingredients || []).map(i => i.name).join(' ')}`.toLowerCase();
  
  const allergenMap = {
    'gluten': ['flour', 'wheat', 'bread', 'pasta', 'noodles', 'semolina', 'couscous', 'barley', 'rye', 'oats', 'baguette', 'injera'],
    'lactose': ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt', 'dairy', 'parmesan', 'mozzarella', 'kibbeh', 'kibe'],
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
  
  // Végétarien
  if (!allText.match(/\b(beef|chicken|lamb|pork|meat|fish|seafood)\b/)) {
    restrictions.push('vegetarien');
  }
  
  // Végétalien
  if (!allText.match(/\b(beef|chicken|lamb|pork|meat|fish|seafood|egg|eggs|milk|cheese|butter|yogurt|dairy)\b/)) {
    restrictions.push('vegan');
  }
  
  // Halal (pas de porc)
  if (!allText.match(/\b(pork|bacon|ham)\b/)) {
    restrictions.push('halal');
  }
  
  // Sans gluten
  if (!allText.match(/\b(flour|wheat|bread|pasta|barley|rye|oats|gluten)\b/)) {
    restrictions.push('sans_gluten');
  }
  
  return restrictions;
}

/**
 * Générer les tags Chef SES
 */
function generateChefSESTags(recipe) {
  const tags = [];
  const name = (recipe.name || '').toLowerCase();
  const ingredients = (recipe.ingredients || []).map(i => i.name.toLowerCase()).join(' ');
  const allText = `${name} ${ingredients}`.toLowerCase();
  
  // Tags de base
  tags.push('#ethiopian');
  tags.push('#exotic');
  
  // Tags par catégorie
  if (recipe.category === 'petit-dejeuner') {
    tags.push('#petit-dejeuner');
    tags.push('#breakfast');
  } else if (recipe.category === 'dessert') {
    tags.push('#dessert');
  } else if (recipe.category === 'entree') {
    tags.push('#entree');
    tags.push('#salad');
  } else {
    tags.push('#plat');
  }
  
  // Tags par ingrédient principal
  if (allText.match(/\b(chicken|poulet)\b/)) {
    tags.push('#poulet');
    tags.push('#volaille');
  }
  if (allText.match(/\b(beef|boeuf|steak)\b/)) {
    tags.push('#boeuf');
    tags.push('#viande');
  }
  if (allText.match(/\b(lamb|agneau)\b/)) {
    tags.push('#agneau');
    tags.push('#viande');
  }
  if (allText.match(/\b(lentil|lentille)\b/)) {
    tags.push('#lentilles');
    tags.push('#legumineuses');
  }
  if (allText.match(/\b(vegetable|legume|carrot|cabbage|potato)\b/)) {
    tags.push('#legumes');
  }
  if (allText.match(/\b(berbere|spice|curry)\b/)) {
    tags.push('#epice');
    tags.push('#spicy');
  }
  
  // Tags par type de plat
  if (allText.match(/\b(stew|ragout)\b/)) {
    tags.push('#ragout');
  }
  if (allText.match(/\b(salad|salade)\b/)) {
    tags.push('#salade');
  }
  if (allText.match(/\b(bread|pain|injera)\b/)) {
    tags.push('#pain');
  }
  
  return tags;
}

/**
 * Normaliser une recette au format Chef SES
 */
function normalizeRecipe(recipe) {
  // Filtrer les recettes vides (sans ingrédients ni étapes)
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return null;
  }
  if (!recipe.preparationSteps || recipe.preparationSteps.length === 0) {
    return null;
  }
  
  // Détecter automatiquement les allergènes et restrictions
  const allergens = detectAllergens(recipe);
  const dietaryRestrictions = detectDietaryRestrictions(recipe);
  const tags = generateChefSESTags(recipe);
  
  // Déterminer la texture (par défaut normale)
  const texture = 'normale';
  
  // Déterminer les types d'établissements compatibles
  const establishmentTypes = ['restaurant', 'cantine_scolaire', 'ehpad', 'hopital'];
  
  return {
    name: recipe.name || 'Recette sans nom',
    category: recipe.category || 'plat',
    ingredients: recipe.ingredients || [],
    preparationSteps: recipe.preparationSteps || [],
    nutrition: {
      calories: 0,
      proteins: 0,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 0
    },
    allergens: allergens,
    dietaryRestrictions: dietaryRestrictions,
    texture: texture,
    establishmentTypes: establishmentTypes,
    preparationTime: recipe.preparationTime || 30,
    cookingTime: recipe.cookingTime || 0,
    servings: recipe.servings || 4,
    tags: tags,
    compatibleFor: [],
    aiCompatibilityScore: 1.0
  };
}

/**
 * Fonction principale
 */
async function extractEthiopianRecipes(jsonPath, outputPath = null) {
  try {
    console.log('📚 Extraction des recettes éthiopiennes depuis le JSON...');
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
    
    // Normaliser les recettes et filtrer les vides
    const normalizedRecipes = recipes
      .map(recipe => normalizeRecipe(recipe))
      .filter(recipe => recipe !== null); // Filtrer les recettes vides
    
    console.log(`✅ ${normalizedRecipes.length} recette(s) complète(s) après filtrage`);
    
    // Afficher un résumé
    if (normalizedRecipes.length > 0) {
      console.log('\n📋 Résumé des recettes extraites:');
      normalizedRecipes.forEach((recipe, index) => {
        console.log(`   ${index + 1}. ${recipe.name}`);
        console.log(`      - Catégorie: ${recipe.category}`);
        console.log(`      - Portions: ${recipe.servings}`);
        console.log(`      - Temps: ${recipe.preparationTime} min`);
        console.log(`      - Ingrédients: ${recipe.ingredients.length}`);
        console.log(`      - Étapes: ${recipe.preparationSteps.length}`);
      });
    }
    
    // Générer les fichiers de sortie
    if (outputPath) {
      const jsContent = `// Recettes éthiopiennes extraites de ${path.basename(jsonPath)}\n\nexport const recipes = ${JSON.stringify(normalizedRecipes, null, 2)};\n`;
      const jsonContent = JSON.stringify(normalizedRecipes, null, 2);
      
      const jsPath = path.join(outputPath, 'ethiopian-recipes.js');
      const jsonPathOut = path.join(outputPath, 'ethiopian-recipes.json');
      
      fs.writeFileSync(jsPath, jsContent, 'utf8');
      fs.writeFileSync(jsonPathOut, jsonContent, 'utf8');
      
      console.log(`\n✅ Fichiers générés:`);
      console.log(`   - ${jsPath}`);
      console.log(`   - ${jsonPathOut}`);
    }
    
    return {
      recipes: normalizedRecipes,
      count: normalizedRecipes.length
    };
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    throw error;
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${path.resolve(process.argv[1])}` || 
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const jsonPath = path.join(__dirname, '..', 'data', 'ETHIOPIAN.json');
  const outputPath = path.join(__dirname, '..', 'data');
  
  extractEthiopianRecipes(jsonPath, outputPath)
    .then(result => {
      console.log(`\n✅ Extraction terminée: ${result.count} recette(s) extraite(s)`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default extractEthiopianRecipes;

