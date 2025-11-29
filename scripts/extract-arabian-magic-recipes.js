// scripts/extract-arabian-magic-recipes.js
// Script pour extraire les recettes du fichier "arabian magic receipt1.json"
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
    // Ignorer les lignes "Ingredients:", "Instructions:", etc.
    if (line.match(/^(Ingredients|Instructions|Serving size|Cooking time|Ingredients:|Instructions:)$/i)) {
      continue;
    }
    
    // Ignorer les lignes vides ou trop courtes
    if (line.length < 2) {
      continue;
    }
    
    // Extraire l'ingrédient (format: "Nom quantité unité" ou "Quantité unité Nom")
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
    // Ignorer les lignes "Instructions:", "Ingredients:", etc.
    if (line.match(/^(Instructions|Ingredients|Serving size|Cooking time|Instructions:|Ingredients:)$/i)) {
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
    } else if (line.length > 10) {
      // Si la ligne est assez longue, c'est probablement une étape
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
 * Extraire le nombre de portions
 */
function extractServings(text) {
  const servingsMatch = text.match(/Serving size:\s*(\d+)/i);
  if (servingsMatch) {
    return parseInt(servingsMatch[1]);
  }
  return 4; // Par défaut
}

/**
 * Extraire le temps de cuisson
 */
function extractCookingTime(text) {
  const timeMatch = text.match(/Cooking time:\s*(\d+)\s*(?:hour|hours|minute|minutes|min|h)/i);
  if (timeMatch) {
    let time = parseInt(timeMatch[1]);
    // Si c'est en heures, convertir en minutes
    if (text.match(/Cooking time:\s*\d+\s*(?:hour|hours|h)/i)) {
      time = time * 60;
    }
    return time;
  }
  return 30; // Par défaut
}

/**
 * Parser les recettes depuis le texte
 */
function parseRecipesFromText(text) {
  const recipes = [];
  const lines = text.split('\n');
  
  let currentRecipe = null;
  let recipeName = '';
  let inIngredients = false;
  let inInstructions = false;
  let ingredientsText = '';
  let instructionsText = '';
  let recipeStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Détecter le début d'une nouvelle recette : "Serving size:" après un titre
    const servingSizeMatch = line.match(/^Serving size:\s*(\d+)/i);
    if (servingSizeMatch && i > 0) {
      // Sauvegarder la recette précédente
      if (currentRecipe) {
        // Extraire les ingrédients et étapes
        if (ingredientsText) {
          currentRecipe.ingredients = extractIngredients(ingredientsText);
        }
        if (instructionsText) {
          currentRecipe.preparationSteps = extractPreparationSteps(instructionsText);
        }
        
        // Ne garder que les recettes complètes
        if (currentRecipe.ingredients.length > 0 && currentRecipe.preparationSteps.length > 0) {
          recipes.push(currentRecipe);
        }
      }
      
      // Extraire le nombre de portions
      const servings = parseInt(servingSizeMatch[1]);
      
      // Chercher le nom de la recette en remontant les lignes précédentes
      // Le titre est généralement une ligne courte qui commence par une majuscule
      // et qui est suivie d'une description (ligne qui commence par "When", "This", "There", etc.)
      recipeName = '';
      
      // Chercher en remontant jusqu'à 15 lignes avant
      for (let j = i - 1; j >= Math.max(0, i - 15); j--) {
        const prevLine = lines[j].trim();
        const nextPrevLine = j > 0 ? lines[j - 1].trim() : '';
        
        // Ignorer les lignes vides
        if (!prevLine) {
          continue;
        }
        
        // Ignorer les sections et métadonnées
        if (prevLine.match(/^(Serving size|Cooking time|Ingredients|Instructions|Ingredients:|Instructions:)$/i)) {
          continue;
        }
        
        // Ignorer les lignes qui sont clairement des descriptions (commencent par des mots de description)
        if (prevLine.match(/^(The|When|This|There|One|Even|Variety|Culinary|Breakfasts|Snacks|Inns|King|Princess|Alibaba|Scheherazade|Marjina|Sindbad|Noor|Ul|Sabaah|Sindbad's|Marjina's|Scheherazade's|In a|Take|Put|Add|Mix|Combine|Blend|Preheat|Remove|Serve|Garnish|Cut|Make|Boil|Fry|Grind|Place|Brush|Wash|Pat|Roast|Discard|Chop|Season|Toss|Cover|Pour|Cool|Let|Stir|Heat|Melt|Bake|Remove|Cool|Serve|Culinary|Breakfasts|Snacks)/i)) {
          continue;
        }
        
        // Le titre est généralement une ligne courte qui commence par une majuscule
        // et qui est suivie d'une description (ligne suivante commence par "When", "This", "There", etc.)
        if (prevLine.length > 3 && prevLine.length < 80 &&
            prevLine.match(/^[A-Z]/) &&
            !prevLine.match(/\.$/) && // Ne pas prendre les lignes qui se terminent par un point
            !prevLine.match(/^(In a|Take|Put|Add|Mix|Combine|Blend|Preheat|Remove|Serve|Garnish|Cut|Make|Boil|Fry|Grind|Place|Brush|Wash|Pat|Roast|Discard|Chop|Season|Toss|Cover|Pour|Cool|Let|Stir|Heat|Melt|Bake|Remove|Cool|Serve)/i)) {
          
          // Vérifier si la ligne suivante (dans le sens de lecture) commence par un mot de description
          // Cela indique que prevLine est probablement le titre
          const followingLine = j < lines.length - 1 ? lines[j + 1].trim() : '';
          if (followingLine && followingLine.match(/^(The|When|This|There|One|Even|Variety|Culinary|Breakfasts|Snacks|Inns|King|Princess|Alibaba|Scheherazade|Marjina|Sindbad|Noor|Ul|Sabaah|Sindbad's|Marjina's|Scheherazade's)/i)) {
            recipeName = prevLine;
            break;
          }
          
          // Si pas de ligne suivante avec description, mais que la ligne précédente est vide ou une section,
          // c'est probablement aussi un titre
          if ((!nextPrevLine || nextPrevLine.match(/^(Serving size|Cooking time|Ingredients|Instructions|Ingredients:|Instructions:)$/i) || nextPrevLine.length === 0) &&
              prevLine.length < 60) {
            recipeName = prevLine;
            break;
          }
        }
      }
      
      if (!recipeName || recipeName.length < 3) {
        recipeName = `Arabian Magic Recipe ${recipes.length + 1}`;
      }
      
      // Extraire le temps de cuisson (ligne suivante)
      let cookingTime = 30;
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        cookingTime = extractCookingTime(nextLine);
      }
      
      // Créer une nouvelle recette
      currentRecipe = {
        name: recipeName,
        ingredients: [],
        preparationSteps: [],
        category: 'plat',
        preparationTime: 0,
        cookingTime: cookingTime,
        servings: servings
      };
      
      recipeStartIndex = i;
      inIngredients = false;
      inInstructions = false;
      ingredientsText = '';
      instructionsText = '';
      continue;
    }
    
    // Si on a une recette en cours
    if (currentRecipe) {
      // Détecter la section "Ingredients:"
      if (line.match(/^Ingredients:?$/i)) {
        inIngredients = true;
        inInstructions = false;
        continue;
      }
      
      // Détecter la section "Instructions:"
      if (line.match(/^Instructions:?$/i)) {
        inInstructions = true;
        inIngredients = false;
        continue;
      }
      
      // Vérifier si on est dans une nouvelle recette (titre suivi de "Serving size:")
      if (i > recipeStartIndex + 5 && line.length > 3 && line.length < 200 &&
          !line.match(/^(Serving size|Cooking time|Ingredients|Instructions|Ingredients:|Instructions:)$/i)) {
        // Vérifier si la ligne suivante contient "Serving size:"
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine.match(/^Serving size:/i)) {
            // C'est le début d'une nouvelle recette, traiter plus tard
            continue;
          }
        }
      }
      
      // Collecter les ingrédients
      if (inIngredients) {
        ingredientsText += line + '\n';
      }
      
      // Collecter les instructions
      if (inInstructions) {
        instructionsText += line + '\n';
      }
    } else {
      // Chercher le début d'une recette (titre suivi de "Serving size:")
      if (line.length > 3 && line.length < 200 &&
          !line.match(/^(Serving size|Cooking time|Ingredients|Instructions|Ingredients:|Instructions:)$/i)) {
        // Vérifier si la ligne suivante contient "Serving size:"
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine.match(/^Serving size:\s*(\d+)/i)) {
            recipeName = line;
            const servings = parseInt(nextLine.match(/^Serving size:\s*(\d+)/i)[1]);
            
            // Extraire le temps de cuisson
            let cookingTime = 30;
            if (i + 2 < lines.length) {
              const timeLine = lines[i + 2].trim();
              cookingTime = extractCookingTime(timeLine);
            }
            
            currentRecipe = {
              name: recipeName,
              ingredients: [],
              preparationSteps: [],
              category: 'plat',
              preparationTime: 0,
              cookingTime: cookingTime,
              servings: servings
            };
            
            recipeStartIndex = i + 1;
            inIngredients = false;
            inInstructions = false;
            ingredientsText = '';
            instructionsText = '';
            i += 1; // Skip la ligne "Serving size:"
            continue;
          }
        }
      }
    }
  }
  
  // Ajouter la dernière recette
  if (currentRecipe) {
    if (ingredientsText) {
      currentRecipe.ingredients = extractIngredients(ingredientsText);
    }
    if (instructionsText) {
      currentRecipe.preparationSteps = extractPreparationSteps(instructionsText);
    }
    
    if (currentRecipe.ingredients.length > 0 && currentRecipe.preparationSteps.length > 0) {
      recipes.push(currentRecipe);
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
    'gluten': ['flour', 'wheat', 'bread', 'pasta', 'noodles', 'semolina', 'couscous', 'barley', 'rye', 'oats', 'tortilla', 'tortillas', 'baguette', 'bulgur'],
    'lactose': ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt', 'dairy', 'greek yogurt'],
    'oeufs': ['egg', 'eggs', 'mayonnaise', 'mayo'],
    'poisson': ['fish', 'salmon', 'tuna', 'sardine', 'anchovy', 'cod', 'trout', 'mackerel'],
    'crustaces': ['shrimp', 'crab', 'lobster', 'prawn', 'crayfish'],
    'mollusques': ['mussel', 'oyster', 'clam', 'squid', 'octopus', 'scallop'],
    'soja': ['soy', 'soya', 'tofu', 'tempeh', 'miso', 'edamame'],
    'fruits_a_coque': ['almond', 'walnut', 'hazelnut', 'cashew', 'pistachio', 'pecan', 'macadamia', 'pine nut', 'pine nuts', 'nuts', 'peanut'],
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
  if (!allText.match(/\b(beef|chicken|lamb|pork|meat|fish|seafood|turkey|sausage|bacon|ham|mutton)\b/)) {
    restrictions.push('vegetarien');
  }
  
  // Végétalien
  if (!allText.match(/\b(beef|chicken|lamb|pork|meat|fish|seafood|turkey|sausage|bacon|ham|mutton|egg|eggs|milk|cheese|butter|yogurt|dairy)\b/)) {
    restrictions.push('vegan');
  }
  
  // Halal (pas de porc)
  if (!allText.match(/\b(pork|bacon|ham)\b/)) {
    restrictions.push('halal');
  }
  
  // Sans gluten
  if (!allText.match(/\b(flour|wheat|bread|pasta|barley|rye|oats|gluten|tortilla|bulgur)\b/)) {
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
  tags.push('#arabian');
  tags.push('#middle-eastern');
  tags.push('#arabian-nights');
  
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
    tags.push('#dip');
  } else {
    tags.push('#plat');
  }
  
  // Tags par ingrédient principal
  if (allText.match(/\b(chicken|poulet)\b/)) {
    tags.push('#poulet');
    tags.push('#volaille');
  }
  if (allText.match(/\b(lamb|agneau|mutton)\b/)) {
    tags.push('#agneau');
    tags.push('#viande');
  }
  if (allText.match(/\b(beef|boeuf)\b/)) {
    tags.push('#boeuf');
    tags.push('#viande');
  }
  if (allText.match(/\b(tahini|hummus|baba ghanoush|mutabal)\b/)) {
    tags.push('#dip');
    tags.push('#accompagnement');
  }
  if (allText.match(/\b(falafel|tabouleh)\b/)) {
    tags.push('#vegetarien');
  }
  if (allText.match(/\b(coconut|drink|smoothie)\b/)) {
    tags.push('#boisson');
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
  if (nameLower.match(/\b(drink|smoothie|juice|beverage)\b/)) {
    recipe.category = 'boisson';
  } else if (nameLower.match(/\b(salad|salade|tabouleh)\b/)) {
    recipe.category = 'entree';
  } else if (nameLower.match(/\b(dessert|cake|sweet|pastry)\b/)) {
    recipe.category = 'dessert';
  } else if (nameLower.match(/\b(soup|soupe|broth)\b/)) {
    recipe.category = 'soupe';
  } else if (nameLower.match(/\b(dip|hummus|tahini|baba ghanoush|mutabal|sauce)\b/)) {
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
async function extractArabianMagicRecipes(jsonPath, outputPath = null) {
  try {
    console.log('📚 Extraction des recettes Arabian Magic depuis le JSON...');
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
      const jsContent = `// Recettes Arabian Magic extraites de ${path.basename(jsonPath)}\n\nexport const recipes = ${JSON.stringify(normalizedRecipes, null, 2)};\n`;
      const jsonContent = JSON.stringify(normalizedRecipes, null, 2);
      
      const jsPath = path.join(outputPath, 'arabian-magic-recipes.js');
      const jsonPathOut = path.join(outputPath, 'arabian-magic-recipes.json');
      
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
  const jsonPath = path.join(__dirname, '..', 'data', 'arabian magic receipt1.json');
  const outputPath = path.join(__dirname, '..', 'data');
  
  extractArabianMagicRecipes(jsonPath, outputPath)
    .then(result => {
      console.log(`\n✅ Extraction terminée: ${result.count} recette(s) extraite(s)`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default extractArabianMagicRecipes;

