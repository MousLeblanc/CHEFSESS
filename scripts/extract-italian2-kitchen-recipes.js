// scripts/extract-italian2-kitchen-recipes.js
// Script pour extraire les recettes du fichier "italian2 kitchen.json"
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
  
  // Nettoyer les caractères spéciaux en début/fin
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
    // Ignorer les lignes "INGREDIENTS", "DIRECTIONS", etc.
    if (line.match(/^(INGREDIENTS|DIRECTIONS|Ingredients|Directions|Serving Size|Cooking Time)$/i)) {
      continue;
    }
    
    // Ignorer les lignes vides ou trop courtes
    if (line.length < 2) {
      continue;
    }
    
    // Ignorer les lignes qui sont des sections (commencent par "For the")
    if (line.match(/^For the/i)) {
      continue;
    }
    
    // Extraire l'ingrédient
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
function extractPreparationSteps(instructionsText) {
  const steps = [];
  const lines = instructionsText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let currentStep = '';
  
  for (const line of lines) {
    // Ignorer les lignes "DIRECTIONS", "INGREDIENTS", etc.
    if (line.match(/^(DIRECTIONS|INGREDIENTS|Directions|Ingredients|Serving Size|Cooking Time)$/i)) {
      continue;
    }
    
    // Ignorer les lignes qui sont des notes ou tips (commencent par "*" ou "NOTE:")
    if (line.match(/^(\*|NOTE:|NOTE)/i)) {
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
    } else if (line.length > 10 && !line.match(/^(\*|NOTE:|NOTE|Piazza|Primi|First Courses)/i)) {
      // Si la ligne est assez longue, c'est probablement une continuation d'étape
      if (currentStep) {
        currentStep += ' ' + line;
      } else {
        currentStep = line;
      }
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
  const lines = text.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Détecter "INGREDIENTS" comme marqueur de début de recette
    if (line.match(/^INGREDIENTS$/i)) {
      // Chercher le nom de la recette dans les lignes précédentes (généralement 1-2 lignes avant)
      let recipeName = '';
      const nameLines = [];
      
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        const prevLine = lines[j].trim();
        
        // Ignorer les lignes vides
        if (!prevLine) {
          if (nameLines.length > 0) {
            break; // On a trouvé le début du nom
          }
          continue;
        }
        
        // Ignorer les lignes qui sont des sections ou notes
        if (prevLine.match(/^(INGREDIENTS|DIRECTIONS|Ingredients|Directions|Serving Size|Cooking Time|\*|NOTE:|NOTE|Piazza|Primi|First Courses)$/i)) {
          if (nameLines.length > 0) {
            break;
          }
          continue;
        }
        
        // Le nom est généralement une ligne qui commence par une majuscule
        if (prevLine.length > 3 && prevLine.length < 100 &&
            prevLine.match(/^[A-Z]/) &&
            !prevLine.match(/^(The|When|This|There|One|Even|Variety|Culinary|Breakfasts|Snacks|Inns|King|Princess|Alibaba|Scheherazade|Marjina|Sindbad|Noor|Ul|Sabaah|Sindbad's|Marjina's|Scheherazade's|In a|Take|Put|Add|Mix|Combine|Blend|Preheat|Remove|Serve|Garnish|Cut|Make|Boil|Fry|Grind|Place|Brush|Wash|Pat|Roast|Discard|Chop|Season|Toss|Cover|Pour|Cool|Let|Stir|Heat|Melt|Bake|Remove|Cool|Serve|Wash|Rinse|Slice|Arrange|Purge|Sprinkle|Drain|Beat|Dip|Coat|Fry|Using|Move|Store|Bring|Cook|Allow|Clean|Cut|Toss|Singe|Scrape|Place|Drain|Allow|Cut|Move|Add|Sprinkle|Season|In a|Place|Combine|Cover|Hard-boil|When|Rinse|Remove|Halve|Set|Spoon|Garnish|Soak|Squeeze|Add|Adjust|Mix|Let|Shape|Simmer|Serve|Sauté|Meanwhile|Cook|Drain|Put|Stir|Plate|Check|NOTE)/i)) {
          nameLines.unshift(prevLine);
        } else if (nameLines.length > 0) {
          break; // On a trouvé le début du nom
        }
      }
      
      recipeName = nameLines.join(' ').trim();
      
      if (!recipeName || recipeName.length < 3) {
        continue; // Ignorer si pas de nom trouvé
      }
      
      // Chercher "DIRECTIONS" pour trouver où se terminent les ingrédients
      let directionsIndex = -1;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim().match(/^DIRECTIONS$/i)) {
          directionsIndex = j;
          break;
        }
      }
      
      if (directionsIndex === -1) {
        continue; // Ignorer si pas de section DIRECTIONS trouvée
      }
      
      // Extraire les ingrédients (entre "INGREDIENTS" et "DIRECTIONS")
      const ingredientsText = lines.slice(i + 1, directionsIndex).join('\n');
      const ingredients = extractIngredients(ingredientsText);
      
      // Extraire les instructions (après "DIRECTIONS" jusqu'à la prochaine recette ou fin)
      let nextIngredientsIndex = -1;
      for (let j = directionsIndex + 1; j < lines.length; j++) {
        if (lines[j].trim().match(/^INGREDIENTS$/i)) {
          nextIngredientsIndex = j;
          break;
        }
      }
      
      const instructionsEnd = nextIngredientsIndex !== -1 ? nextIngredientsIndex : lines.length;
      const instructionsText = lines.slice(directionsIndex + 1, instructionsEnd).join('\n');
      const preparationSteps = extractPreparationSteps(instructionsText);
      
      // Ne garder que les recettes complètes
      if (ingredients.length > 0 && preparationSteps.length > 0) {
        recipes.push({
          name: recipeName,
          ingredients: ingredients,
          preparationSteps: preparationSteps,
          category: 'plat',
          preparationTime: 0,
          cookingTime: 0,
          servings: 4
        });
      }
    }
  }
  
  return recipes;
}

/**
 * Détecter les allergènes dans les ingrédients
 */
function detectAllergens(recipe) {
  const allergens = new Set();
  const allText = `${recipe.name} ${(recipe.ingredients || []).map(i => i.name).join(' ')}`.toLowerCase();
  
  const allergenMap = {
    'gluten': ['flour', 'wheat', 'bread', 'pasta', 'noodles', 'semolina', 'couscous', 'barley', 'rye', 'oats', 'tortilla', 'tortillas', 'baguette', 'bulgur', 'croutons', 'dough', 'spaghetti', 'bread crumbs'],
    'lactose': ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt', 'dairy', 'greek yogurt', 'mozzarella', 'parmesan', 'parmigiano', 'cheddar', 'mascarpone', 'mayonnaise', 'heavy cream'],
    'oeufs': ['egg', 'eggs', 'mayonnaise', 'mayo', 'egg yolk', 'egg white'],
    'poisson': ['fish', 'salmon', 'tuna', 'sardine', 'anchovy', 'anchovies', 'cod', 'trout', 'mackerel', 'tilapia', 'shrimp', 'shrimps', 'scampi', 'prawns'],
    'crustaces': ['shrimp', 'shrimps', 'crab', 'lobster', 'prawn', 'prawns', 'crayfish', 'scampi'],
    'mollusques': ['mussel', 'oyster', 'clam', 'squid', 'octopus', 'scallop'],
    'soja': ['soy', 'soya', 'tofu', 'tempeh', 'miso', 'edamame'],
    'fruits_a_coque': ['almond', 'walnut', 'hazelnut', 'cashew', 'pistachio', 'pecan', 'macadamia', 'pine nut', 'pine nuts', 'nuts'],
    'arachides': ['peanut', 'peanuts', 'groundnut'],
    'sesame': ['sesame', 'tahini', 'sesame seeds', 'sesame oil'],
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
  if (!allText.match(/\b(beef|chicken|lamb|pork|meat|fish|seafood|turkey|sausage|bacon|ham|mutton|steak|tilapia|cod|anchovy|anchovies|shrimp|shrimps|octopus|veal|prosciutto|pancetta|guanciale|salame|speck)\b/)) {
    restrictions.push('vegetarien');
  }
  
  // Végétalien
  if (!allText.match(/\b(beef|chicken|lamb|pork|meat|fish|seafood|turkey|sausage|bacon|ham|mutton|steak|tilapia|cod|anchovy|anchovies|shrimp|shrimps|octopus|veal|prosciutto|pancetta|guanciale|salame|speck|egg|eggs|milk|cheese|butter|yogurt|dairy|mozzarella|parmesan|parmigiano|cheddar|mascarpone|mayonnaise|heavy cream)\b/)) {
    restrictions.push('vegan');
  }
  
  // Halal (pas de porc)
  if (!allText.match(/\b(pork|bacon|ham|prosciutto|pancetta|guanciale|salame|speck)\b/)) {
    restrictions.push('halal');
  }
  
  // Sans gluten
  if (!allText.match(/\b(flour|wheat|bread|pasta|barley|rye|oats|gluten|tortilla|bulgur|croutons|dough|spaghetti|bread crumbs)\b/)) {
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
  tags.push('#italian');
  tags.push('#italie');
  tags.push('#mediterranean');
  
  // Tags par catégorie
  if (recipe.category === 'petit-dejeuner') {
    tags.push('#petit-dejeuner');
    tags.push('#breakfast');
  } else if (recipe.category === 'dessert') {
    tags.push('#dessert');
  } else if (recipe.category === 'entree') {
    tags.push('#entree');
    tags.push('#salad');
  } else if (recipe.category === 'soupe') {
    tags.push('#soupe');
  } else if (recipe.category === 'accompagnement') {
    tags.push('#accompagnement');
  } else {
    tags.push('#plat');
  }
  
  // Tags par ingrédient principal
  if (allText.match(/\b(chicken|poulet)\b/)) {
    tags.push('#poulet');
    tags.push('#volaille');
  }
  if (allText.match(/\b(beef|steak|boeuf|bistecca|tartare|manzo)\b/)) {
    tags.push('#boeuf');
    tags.push('#viande');
  }
  if (allText.match(/\b(fish|poisson|tilapia|cod|pesce|octopus|polpo|shrimp|shrimps|gamberetti)\b/)) {
    tags.push('#poisson');
  }
  if (allText.match(/\b(pasta|pasta|spaghetti|penne|rigatoni|carbonara)\b/)) {
    tags.push('#pates');
  }
  if (allText.match(/\b(pizza|calzone)\b/)) {
    tags.push('#pizza');
  }
  if (allText.match(/\b(risotto|rice)\b/)) {
    tags.push('#riz');
  }
  if (allText.match(/\b(eggplant|melanzane|aubergine)\b/)) {
    tags.push('#aubergine');
  }
  
  return tags;
}

/**
 * Normaliser une recette au format Chef SES
 */
function normalizeRecipe(recipe) {
  // Filtrer les recettes vides
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
  
  // Déterminer la catégorie basée sur le nom
  const nameLower = recipe.name.toLowerCase();
  if (nameLower.match(/\b(salad|salade|insalata)\b/)) {
    recipe.category = 'entree';
  } else if (nameLower.match(/\b(dessert|cake|sweet|pastry|tiramisu)\b/)) {
    recipe.category = 'dessert';
  } else if (nameLower.match(/\b(soup|soupe|broth|minestrone)\b/)) {
    recipe.category = 'soupe';
  } else if (nameLower.match(/\b(dip|sauce|dressing)\b/)) {
    recipe.category = 'accompagnement';
  } else {
    recipe.category = 'plat';
  }
  
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
    preparationTime: recipe.preparationTime || 0,
    cookingTime: recipe.cookingTime || 30,
    servings: recipe.servings || 4,
    tags: tags,
    compatibleFor: [],
    aiCompatibilityScore: 1.0
  };
}

/**
 * Fonction principale
 */
async function extractItalian2KitchenRecipes(jsonPath, outputPath = null) {
  try {
    console.log('📚 Extraction des recettes Italian2 Kitchen depuis le JSON...');
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
      normalizedRecipes.slice(0, 10).forEach((recipe, index) => {
        console.log(`   ${index + 1}. ${recipe.name}`);
        console.log(`      - Catégorie: ${recipe.category}`);
        console.log(`      - Portions: ${recipe.servings}`);
        console.log(`      - Temps: ${recipe.cookingTime} min`);
        console.log(`      - Ingrédients: ${recipe.ingredients.length}`);
        console.log(`      - Étapes: ${recipe.preparationSteps.length}`);
      });
      if (normalizedRecipes.length > 10) {
        console.log(`   ... et ${normalizedRecipes.length - 10} autres recettes`);
      }
    }
    
    // Générer les fichiers de sortie
    if (outputPath) {
      const jsContent = `// Recettes Italian2 Kitchen extraites de ${path.basename(jsonPath)}\n\nexport const recipes = ${JSON.stringify(normalizedRecipes, null, 2)};\n`;
      const jsonContent = JSON.stringify(normalizedRecipes, null, 2);
      
      const jsPath = path.join(outputPath, 'italian2-kitchen-recipes.js');
      const jsonPathOut = path.join(outputPath, 'italian2-kitchen-recipes.json');
      
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
  const jsonPath = path.join(__dirname, '..', 'data', 'italian2 kitchen.json');
  const outputPath = path.join(__dirname, '..', 'data');
  
  extractItalian2KitchenRecipes(jsonPath, outputPath)
    .then(result => {
      console.log(`\n✅ Extraction terminée: ${result.count} recette(s) extraite(s)`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default extractItalian2KitchenRecipes;


