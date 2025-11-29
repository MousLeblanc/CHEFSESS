// scripts/extract-365-recipes-from-json.js
// Script pour extraire les recettes du fichier "365 receipts.json" avec tags
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
    'gluten': ['flour', 'wheat', 'bread', 'pasta', 'noodles', 'semolina', 'couscous', 'barley', 'rye', 'oats', 'all-purpose'],
    'lactose': ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt', 'dairy', 'parmesan', 'mozzarella', 'cottage cheese', 'sour cream', 'cream cheese', 'half-and-half'],
    'oeufs': ['egg', 'eggs', 'mayonnaise', 'mayo', 'egg yolk', 'egg white'],
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
  
  const meatKeywords = ['meat', 'beef', 'pork', 'lamb', 'veal', 'ham', 'bacon', 'sausage', 'steak', 'chicken', 'turkey', 'poultry'];
  const fishKeywords = ['fish', 'salmon', 'tuna', 'cod', 'shrimp', 'crab', 'mussel'];
  const animalProducts = ['milk', 'cream', 'cheese', 'butter', 'egg', 'eggs', 'honey', 'yogurt'];
  
  const hasMeat = meatKeywords.some(kw => allText.includes(kw));
  const hasFish = fishKeywords.some(kw => allText.includes(kw));
  const hasAnimalProducts = animalProducts.some(product => allText.includes(product));
  
  if (!hasMeat && !hasFish) {
    restrictions.push('vegetarian');
    if (!hasAnimalProducts) {
      restrictions.push('vegan');
    }
  }
  
  return restrictions;
}

/**
 * Générer les tags pour les recettes
 */
function generateTags(recipe, chapter = '') {
  const tags = [];
  const name = (recipe.name || '').toLowerCase();
  const ingredients = (recipe.ingredients || []).map(i => i.name.toLowerCase()).join(' ');
  const allText = `${name} ${ingredients} ${chapter}`.toLowerCase();
  
  // Tags par chapitre/cuisine
  if (chapter.toLowerCase().includes('ashkenazi')) {
    tags.push('#ashkenazi');
    tags.push('#jewish');
  }
  if (chapter.toLowerCase().includes('sephardic')) {
    tags.push('#sephardic');
    tags.push('#jewish');
  }
  if (chapter.toLowerCase().includes('italian')) {
    tags.push('#italian');
  }
  if (chapter.toLowerCase().includes('french')) {
    tags.push('#french');
  }
  if (chapter.toLowerCase().includes('mediterranean')) {
    tags.push('#mediterranean');
  }
  
  // Tags catégories
  if (name.match(/\b(soup|broth|stew)\b/)) {
    tags.push('#soupe');
  }
  if (name.match(/\b(salad)\b/)) {
    tags.push('#salade');
  }
  if (name.match(/\b(cake|dessert|cookie|pie|tart|pudding|mousse)\b/)) {
    tags.push('#dessert');
  }
  if (name.match(/\b(bread|roll|bagel|challah|kugel)\b/)) {
    tags.push('#pain');
    tags.push('#viennoiserie');
  }
  if (name.match(/\b(pasta|noodle|lasagna|ravioli|gnocchi)\b/)) {
    tags.push('#pâtes');
  }
  if (name.match(/\b(fish|salmon|tuna|cod|trout)\b/)) {
    tags.push('#poisson');
  }
  if (name.match(/\b(meat|beef|pork|lamb|veal|steak)\b/)) {
    tags.push('#viande');
  }
  if (name.match(/\b(chicken|turkey|poultry|duck)\b/)) {
    tags.push('#volaille');
  }
  if (name.match(/\b(sauce|dressing|marinade)\b/)) {
    tags.push('#sauce');
  }
  if (name.match(/\b(side|accompaniment|vegetable)\b/)) {
    tags.push('#accompagnement');
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
  
  // Séparer par chapitres de manière plus efficace
  const chapterPattern = /^Chapter \d+: ([^\n]+)/gm;
  const chapterMatches = [];
  let match;
  
  // Collecter toutes les positions des chapitres d'abord
  while ((match = chapterPattern.exec(text)) !== null) {
    chapterMatches.push({
      name: match[1].trim(),
      index: match.index
    });
  }
  
  // Traiter chaque chapitre séparément pour éviter les problèmes de mémoire
  const chapters = [];
  for (let i = 0; i < chapterMatches.length; i++) {
    const startIndex = chapterMatches[i].index;
    const endIndex = i < chapterMatches.length - 1 ? chapterMatches[i + 1].index : text.length;
    chapters.push({
      name: chapterMatches[i].name,
      content: text.substring(startIndex, endIndex)
    });
  }
  
  // Parser chaque chapitre de manière plus efficace
  for (const chapter of chapters) {
    if (!chapter.content || chapter.content.length < 50) continue;
    
    // Trouver toutes les positions des recettes d'abord
    const recipePattern = /^(\d+)\.\s+([^\n]+)\n/gm;
    const recipeMatches = [];
    let recipeMatch;
    
    while ((recipeMatch = recipePattern.exec(chapter.content)) !== null) {
      recipeMatches.push({
        number: recipeMatch[1],
        name: recipeMatch[2].trim(),
        index: recipeMatch.index,
        fullMatchLength: recipeMatch[0].length
      });
    }
    
    // Traiter chaque recette
    for (let i = 0; i < recipeMatches.length; i++) {
      const recipeInfo = recipeMatches[i];
      const recipeName = recipeInfo.name;
      const recipeStart = recipeInfo.index + recipeInfo.fullMatchLength;
      const recipeEnd = i < recipeMatches.length - 1 ? recipeMatches[i + 1].index : chapter.content.length;
      const recipeText = chapter.content.substring(recipeStart, recipeEnd);
      
      const recipe = {
        name: recipeName,
        ingredients: [],
        preparationSteps: [],
        category: 'plat',
        preparationTime: 0,
        cookingTime: 0,
        servings: 4,
        tags: [],
        chapter: chapter.name,
        nutrition: {
          calories: 0,
          proteins: 0,
          carbs: 0,
          lipids: 0,
          fibers: 0,
          sodium: 0
        }
      };
      
      // Extraire les ingrédients (section "Ingredients")
      const ingredientsMatch = recipeText.match(/Ingredients\s*\n([\s\S]*?)(?=Direction|Nutrition Information|$)/i);
      if (ingredientsMatch) {
        const ingredientsText = ingredientsMatch[1];
        const ingredientLines = ingredientsText.split('\n').filter(line => line.trim());
        
        for (const line of ingredientLines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.length < 3) continue;
          
          // Pattern pour extraire quantité, unité et nom
          const ingPattern = /^(\d+(?:\/\d+)?(?:\s*-\s*\d+)?(?:\s+\d+\/\d+)?)\s*(?:ounce|ounces|oz|cup|cups|c|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|pound|pounds|lb|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|clove|cloves|piece|pieces|slice|slices|handful|handfuls|bunch|bunches|stalk|stalks|head|heads|can|cans|package|packages|envelope|envelopes|stick|sticks|inch|inches|in\.|large|medium|small)?\s*(?:of\s+)?(.+)$/i;
          
          const ingMatch = trimmed.match(ingPattern);
          if (ingMatch) {
            const quantity = ingMatch[1].trim();
            const unit = (ingMatch[2] || '').trim() || 'unit';
            const ingredientName = ingMatch[3] ? ingMatch[3].trim() : trimmed;
            
            // Nettoyer le nom de l'ingrédient
            let cleanName = ingredientName.replace(/\b(ounce|ounces|oz|cup|cups|c|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|pound|pounds|lb|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|clove|cloves|piece|pieces|slice|slices|handful|handfuls|bunch|bunches|stalk|stalks|head|heads|can|cans|package|packages|envelope|envelopes|stick|sticks|inch|inches|in\.|large|medium|small|of)\b/gi, '').trim();
            
            if (cleanName && cleanName.length > 1) {
              recipe.ingredients.push({
                name: cleanName,
                quantity: parseFloat(quantity.replace(/\s+/g, '').replace(/\//g, '/')) || 1,
                unit: unit || 'unit'
              });
            }
          } else {
            // Si le pattern ne match pas, utiliser toute la ligne comme nom
            const cleanName = trimmed.replace(/^\d+/, '').trim();
            if (cleanName && cleanName.length > 1) {
              recipe.ingredients.push({
                name: cleanName,
                quantity: 1,
                unit: 'unit'
              });
            }
          }
        }
      }
      
      // Extraire les instructions (section "Direction")
      const directionMatch = recipeText.match(/Direction\s*\n([\s\S]*?)(?=Nutrition Information|$)/i);
      if (directionMatch) {
        const directionText = directionMatch[1];
        // Séparer par phrases (points, points d'exclamation, points d'interrogation)
        const sentences = directionText.split(/[.!?]+/).filter(s => s.trim().length > 10);
        recipe.preparationSteps = sentences.map(s => s.trim()).filter(s => s.length > 0);
      }
      
      // Extraire les informations nutritionnelles
      const nutritionMatch = recipeText.match(/Nutrition Information\s*\n([\s\S]*?)(?=\d+\.|$)/i);
      if (nutritionMatch) {
        const nutritionText = nutritionMatch[1];
        
        const caloriesMatch = nutritionText.match(/Calories:\s*(\d+)/i);
        if (caloriesMatch) {
          recipe.nutrition.calories = parseInt(caloriesMatch[1]);
        }
        
        const proteinMatch = nutritionText.match(/Protein:\s*(\d+)\s*g/i);
        if (proteinMatch) {
          recipe.nutrition.proteins = parseInt(proteinMatch[1]);
        }
        
        const carbMatch = nutritionText.match(/Total Carbohydrate:\s*(\d+)\s*g/i);
        if (carbMatch) {
          recipe.nutrition.carbs = parseInt(carbMatch[1]);
        }
        
        const fatMatch = nutritionText.match(/Total Fat:\s*(\d+)\s*g/i);
        if (fatMatch) {
          recipe.nutrition.lipids = parseInt(fatMatch[1]);
        }
        
        const fiberMatch = nutritionText.match(/Fiber:\s*(\d+)\s*g/i);
        if (fiberMatch) {
          recipe.nutrition.fibers = parseInt(fiberMatch[1]);
        }
        
        const sodiumMatch = nutritionText.match(/Sodium:\s*(\d+)\s*mg/i);
        if (sodiumMatch) {
          recipe.nutrition.sodium = parseInt(sodiumMatch[1]);
        }
      }
      
      // Générer les tags
      recipe.tags = generateTags(recipe, chapter.name);
      
      // Détecter les allergènes et restrictions
      recipe.allergens = detectAllergens(recipe);
      recipe.dietaryRestrictions = detectDietaryRestrictions(recipe);
      
      // Si on a au moins un nom et des ingrédients ou des instructions, ajouter la recette
      if (recipe.name && (recipe.ingredients.length > 0 || recipe.preparationSteps.length > 0)) {
        recipes.push(recipe);
      }
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
    tags: recipe.tags || [],
    allergens: recipe.allergens || [],
    dietaryRestrictions: recipe.dietaryRestrictions || [],
    chapter: recipe.chapter || '',
    nutrition: recipe.nutrition || {
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
async function extract365Recipes(jsonPath, outputPath = null) {
  try {
    console.log('📚 Extraction des recettes depuis le fichier 365 receipts...');
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
      
      // Statistiques par chapitre
      const chapterCounts = {};
      normalizedRecipes.forEach(recipe => {
        const chapter = recipe.chapter || 'Sans chapitre';
        chapterCounts[chapter] = (chapterCounts[chapter] || 0) + 1;
      });
      
      console.log('\n📖 Répartition par chapitre:');
      Object.entries(chapterCounts).sort((a, b) => b[1] - a[1]).forEach(([chapter, count]) => {
        console.log(`   ${chapter}: ${count}`);
      });
      
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
        .slice(0, 15)
        .forEach(([tag, count]) => {
          console.log(`   ${tag}: ${count}`);
        });
      
      // Afficher quelques exemples
      console.log('\n📝 Exemples de recettes:');
      normalizedRecipes.slice(0, 5).forEach((recipe, index) => {
        console.log(`\n   ${index + 1}. ${recipe.name}`);
        console.log(`      Chapitre: ${recipe.chapter}`);
        console.log(`      Tags: ${recipe.tags.slice(0, 5).join(', ')}`);
        console.log(`      Ingrédients: ${recipe.ingredients.length}`);
        console.log(`      Instructions: ${recipe.preparationSteps.length}`);
        if (recipe.nutrition.calories > 0) {
          console.log(`      Calories: ${recipe.nutrition.calories}`);
        }
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
export default extract365Recipes;

// Si exécuté directement
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.includes('extract-365-recipes-from-json');

if (isMainModule || process.argv[1]?.includes('extract-365-recipes-from-json')) {
  const jsonPath = process.argv[2] || path.join(__dirname, '..', 'data', '365 receipts.json');
  const outputPath = process.argv[3] || path.join(__dirname, '..', 'data', '365-receipts-recipes.js');
  
  extract365Recipes(jsonPath, outputPath)
    .then(() => {
      console.log('\n✅ Extraction terminée!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    });
}

