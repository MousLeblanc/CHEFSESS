// scripts/extract-world-recipes.js
// Script pour extraire les recettes du fichier "world receipt.json"
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
    // Ignorer les lignes "INGREDIENTS"
    if (line.match(/^INGREDIENTS$/i)) {
      continue;
    }
    
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
function extractPreparationSteps(directionsText) {
  const steps = [];
  const lines = directionsText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let currentStep = '';
  for (const line of lines) {
    // Ignorer les lignes "DIRECTIONS"
    if (line.match(/^DIRECTIONS$/i)) {
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
 * Extraire les informations nutritionnelles
 */
function extractNutrition(nutritionText) {
  const nutrition = {
    calories: 0,
    proteins: 0,
    carbs: 0,
    lipids: 0,
    fibers: 0,
    sodium: 0
  };
  
  // Calories
  const caloriesMatch = nutritionText.match(/Calories:\s*(\d+)/i);
  if (caloriesMatch) {
    nutrition.calories = parseInt(caloriesMatch[1]);
  }
  
  // Protein
  const proteinMatch = nutritionText.match(/Protein:\s*(\d+(?:\.\d+)?)g/i);
  if (proteinMatch) {
    nutrition.proteins = parseFloat(proteinMatch[1]);
  }
  
  // Carbohydrates
  const carbsMatch = nutritionText.match(/Carbohydrates:\s*(\d+(?:\.\d+)?)g/i);
  if (carbsMatch) {
    nutrition.carbs = parseFloat(carbsMatch[1]);
  }
  
  // Fat
  const fatMatch = nutritionText.match(/Fat:\s*(\d+(?:\.\d+)?)g/i);
  if (fatMatch) {
    nutrition.lipids = parseFloat(fatMatch[1]);
  }
  
  return nutrition;
}

/**
 * Extraire les temps (prep, cook, total)
 */
function extractTimes(servingsText) {
  let preparationTime = 0;
  let cookingTime = 0;
  let servings = 4;
  
  // Servings
  const servingsMatch = servingsText.match(/Servings:\s*(\d+)/i);
  if (servingsMatch) {
    servings = parseInt(servingsMatch[1]);
  }
  
  // Prep time
  const prepMatch = servingsText.match(/Prep:\s*(\d+)m/i);
  if (prepMatch) {
    preparationTime = parseInt(prepMatch[1]);
  }
  
  // Cook time
  const cookMatch = servingsText.match(/Cooks?:\s*(\d+)m/i);
  if (cookMatch) {
    cookingTime = parseInt(cookMatch[1]);
  }
  
  // Total time (si pas de prep/cook séparés)
  if (!preparationTime && !cookingTime) {
    const totalMatch = servingsText.match(/Total:\s*(\d+)h(\d+)m/i);
    if (totalMatch) {
      const hours = parseInt(totalMatch[1]);
      const minutes = parseInt(totalMatch[2]);
      preparationTime = hours * 60 + minutes;
    } else {
      const totalMatch2 = servingsText.match(/Total:\s*(\d+)m/i);
      if (totalMatch2) {
        preparationTime = parseInt(totalMatch2[1]);
      }
    }
  }
  
  return { preparationTime, cookingTime, servings };
}

/**
 * Parser les recettes depuis le texte
 */
function parseRecipesFromText(text) {
  const recipes = [];
  
  // Diviser par "Servings:" qui marque le début de chaque recette
  const recipeSections = text.split(/(?=Servings:)/);
  
  for (let i = 0; i < recipeSections.length; i++) {
    const section = recipeSections[i].trim();
    if (!section || !section.startsWith('Servings:')) {
      continue;
    }
    
    // Extraire le nom de la recette (lignes avant "Servings:")
    // Mais on doit chercher dans la section précédente
    let recipeName = '';
    if (i > 0) {
      // Prendre les dernières lignes de la section précédente qui sont en MAJUSCULES
      const prevSection = recipeSections[i - 1];
      const lines = prevSection.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      // Prendre les dernières lignes en MAJUSCULES (nom de la recette)
      const nameLines = [];
      for (let j = lines.length - 1; j >= 0; j--) {
        const line = lines[j];
        // Si la ligne est en MAJUSCULES et ne contient pas de chiffres ou de caractères spéciaux de recette
        if (line.match(/^[A-Z][A-Z\s&,\-']+$/) && 
            !line.match(/^(NUTRITION|INGREDIENTS|DIRECTIONS|FACTS|SERVINGS|PREP|COOKS|TOTAL)$/i) &&
            line.length > 3) {
          nameLines.unshift(line);
        } else if (nameLines.length > 0) {
          // On a trouvé le début du nom, arrêter
          break;
        }
      }
      recipeName = nameLines.join(' ').trim();
    }
    
    // Si pas de nom trouvé, essayer de l'extraire de la section actuelle
    if (!recipeName) {
      const lines = section.split('\n');
      // Chercher la première ligne en MAJUSCULES avant "Servings:"
      for (const line of lines) {
        if (line.match(/^[A-Z][A-Z\s&,\-']+$/) && line.length > 3) {
          recipeName = line.trim();
          break;
        }
      }
    }
    
    // Si toujours pas de nom, utiliser un nom par défaut
    if (!recipeName || recipeName.length < 3) {
      recipeName = `Recipe ${i}`;
    }
    
    const recipeContent = section;
    
    const recipe = {
      name: recipeName,
      ingredients: [],
      preparationSteps: [],
      category: 'plat',
      preparationTime: 0,
      cookingTime: 0,
      servings: 4,
      nutrition: {
        calories: 0,
        proteins: 0,
        carbs: 0,
        lipids: 0,
        fibers: 0,
        sodium: 0
      }
    };
    
    // Extraire les temps et portions
    const times = extractTimes(recipeContent);
    recipe.preparationTime = times.preparationTime;
    recipe.cookingTime = times.cookingTime;
    recipe.servings = times.servings;
    
    // Extraire les informations nutritionnelles
    const nutritionMatch = recipeContent.match(/NUTRITION FACTS\s*\n([\s\S]*?)(?=INGREDIENTS|$)/i);
    if (nutritionMatch) {
      recipe.nutrition = extractNutrition(nutritionMatch[1]);
    }
    
    // Extraire les ingrédients
    const ingredientsMatch = recipeContent.match(/INGREDIENTS\s*\n([\s\S]*?)(?=DIRECTIONS|$)/i);
    if (ingredientsMatch) {
      recipe.ingredients = extractIngredients(ingredientsMatch[1]);
    }
    
    // Extraire les étapes de préparation
    const directionsMatch = recipeContent.match(/DIRECTIONS\s*\n([\s\S]*?)(?=\n[A-Z][A-Z\s&,\-']+(?:\s+[A-Z][A-Z\s&,\-']+)*\nServings:|$)/i);
    if (directionsMatch) {
      recipe.preparationSteps = extractPreparationSteps(directionsMatch[1]);
    }
    
    // Déterminer la catégorie basée sur le nom
    const nameLower = recipe.name.toLowerCase();
    if (nameLower.match(/\b(salad|salade)\b/)) {
      recipe.category = 'entree';
    } else if (nameLower.match(/\b(dessert|cake|pie|pudding|cookie|brownie|muffin|cupcake)\b/)) {
      recipe.category = 'dessert';
    } else if (nameLower.match(/\b(soup|soupe|broth|stew|ragout)\b/)) {
      recipe.category = 'soupe';
    } else if (nameLower.match(/\b(dip|sauce|dressing|marinade)\b/)) {
      recipe.category = 'accompagnement';
    } else {
      recipe.category = 'plat';
    }
    
    // Ne garder que les recettes complètes (avec ingrédients et étapes)
    if (recipe.ingredients.length > 0 && recipe.preparationSteps.length > 0) {
      recipes.push(recipe);
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
    'gluten': ['flour', 'wheat', 'bread', 'pasta', 'noodles', 'semolina', 'couscous', 'barley', 'rye', 'oats', 'tortilla', 'tortillas'],
    'lactose': ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt', 'dairy', 'parmesan', 'mozzarella', 'cheddar', 'sour cream'],
    'oeufs': ['egg', 'eggs', 'mayonnaise', 'mayo'],
    'poisson': ['fish', 'salmon', 'tuna', 'sardine', 'anchovy', 'cod', 'trout', 'mackerel'],
    'crustaces': ['shrimp', 'crab', 'lobster', 'prawn', 'crayfish'],
    'mollusques': ['mussel', 'oyster', 'clam', 'squid', 'octopus', 'scallop'],
    'soja': ['soy', 'soya', 'tofu', 'tempeh', 'miso', 'edamame', 'soy sauce'],
    'fruits_a_coque': ['almond', 'walnut', 'hazelnut', 'cashew', 'pistachio', 'pecan', 'macadamia', 'pine nut'],
    'arachides': ['peanut', 'peanuts', 'groundnut'],
    'sesame': ['sesame', 'tahini', 'sesame seeds'],
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
  if (!allText.match(/\b(beef|chicken|lamb|pork|meat|fish|seafood|turkey|sausage|bacon|ham)\b/)) {
    restrictions.push('vegetarien');
  }
  
  // Végétalien
  if (!allText.match(/\b(beef|chicken|lamb|pork|meat|fish|seafood|turkey|sausage|bacon|ham|egg|eggs|milk|cheese|butter|yogurt|dairy)\b/)) {
    restrictions.push('vegan');
  }
  
  // Halal (pas de porc)
  if (!allText.match(/\b(pork|bacon|ham)\b/)) {
    restrictions.push('halal');
  }
  
  // Sans gluten
  if (!allText.match(/\b(flour|wheat|bread|pasta|barley|rye|oats|gluten|tortilla)\b/)) {
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
  tags.push('#world');
  tags.push('#international');
  
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
  if (allText.match(/\b(beef|boeuf|steak)\b/)) {
    tags.push('#boeuf');
    tags.push('#viande');
  }
  if (allText.match(/\b(turkey|dinde)\b/)) {
    tags.push('#dinde');
    tags.push('#volaille');
  }
  if (allText.match(/\b(pork|porc)\b/)) {
    tags.push('#porc');
    tags.push('#viande');
  }
  if (allText.match(/\b(fish|poisson|salmon|tuna)\b/)) {
    tags.push('#poisson');
  }
  if (allText.match(/\b(vegetable|legume|spinach|artichoke|potato|sweet potato)\b/)) {
    tags.push('#legumes');
  }
  if (allText.match(/\b(pasta|noodles|spaghetti)\b/)) {
    tags.push('#pates');
  }
  if (allText.match(/\b(rice|riz)\b/)) {
    tags.push('#riz');
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
  
  return {
    name: recipe.name || 'Recette sans nom',
    category: recipe.category || 'plat',
    ingredients: recipe.ingredients || [],
    preparationSteps: recipe.preparationSteps || [],
    nutrition: recipe.nutrition || {
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
async function extractWorldRecipes(jsonPath, outputPath = null) {
  try {
    console.log('📚 Extraction des recettes du monde depuis le JSON...');
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
        console.log(`      - Temps: ${recipe.preparationTime} min`);
        console.log(`      - Ingrédients: ${recipe.ingredients.length}`);
        console.log(`      - Étapes: ${recipe.preparationSteps.length}`);
      });
      if (normalizedRecipes.length > 10) {
        console.log(`   ... et ${normalizedRecipes.length - 10} autres recettes`);
      }
    }
    
    // Générer les fichiers de sortie
    if (outputPath) {
      const jsContent = `// Recettes du monde extraites de ${path.basename(jsonPath)}\n\nexport const recipes = ${JSON.stringify(normalizedRecipes, null, 2)};\n`;
      const jsonContent = JSON.stringify(normalizedRecipes, null, 2);
      
      const jsPath = path.join(outputPath, 'world-recipes.js');
      const jsonPathOut = path.join(outputPath, 'world-recipes.json');
      
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
  const jsonPath = path.join(__dirname, '..', 'data', 'world receipt.json');
  const outputPath = path.join(__dirname, '..', 'data');
  
  extractWorldRecipes(jsonPath, outputPath)
    .then(result => {
      console.log(`\n✅ Extraction terminée: ${result.count} recette(s) extraite(s)`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default extractWorldRecipes;

