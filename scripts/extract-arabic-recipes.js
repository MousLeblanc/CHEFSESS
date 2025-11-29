// scripts/extract-arabic-recipes.js
// Script pour extraire les recettes du fichier "arabic receipt.json"
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
    // Ignorer les lignes qui sont des étapes (commencent par un chiffre suivi d'un point)
    if (line.match(/^\d+\./)) {
      break; // On a atteint les étapes, arrêter
    }
    
    // Ignorer les lignes "DOUGH", "FILLING", "ZAATAR", etc. (sections)
    if (line.match(/^(DOUGH|FILLING|ZAATAR|SAUCE|MARINADE|SPICE|MIXTURE)$/i)) {
      continue;
    }
    
    // Ignorer les lignes de description (pas en MAJUSCULES ou trop courtes)
    if (!line.match(/^[A-Z0-9\s\(\)\/,\.\-]+$/) || line.length < 3) {
      continue;
    }
    
    // Ignorer les lignes qui sont clairement des descriptions (contiennent "In the", "The secret", etc.)
    if (line.match(/^(In the|The secret|The original|This|It's|A lot|Manakish|Samboosik)/i)) {
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
 * Extraire le nombre de portions
 */
function extractServings(text) {
  // Pattern: "12 PIECES", "25 PIECES", "8 PIECES", etc.
  const servingsMatch = text.match(/(\d+)\s+PIECES?/i);
  if (servingsMatch) {
    return parseInt(servingsMatch[1]);
  }
  
  // Pattern: "SERVES 4", "SERVES 6-8", etc.
  const servesMatch = text.match(/SERVES\s+(\d+)/i);
  if (servesMatch) {
    return parseInt(servesMatch[1]);
  }
  
  return 4; // Par défaut
}

/**
 * Liste des noms de recettes connus pour améliorer la détection
 */
const KNOWN_RECIPE_NAMES = [
  'ROASTED GREEN WHEAT WITH CHICKEN',
  'SMALL SPINACH PIES',
  'SMALL MEAT PIES',
  'FROM BAALBEK',
  'LEBANESE PIZZA WITH ZAATAR',
  'MEAT-FILLED',
  'CRESCENTS',
  'HOLLOW GROUND',
  'LAMB CROQUETTES',
  'LEBANESE EGGPLANT DIP',
  'CHICKPEA DIP WITH SESAME PASTE',
  'PARSLEY SALAD WITH BULGUR',
  'TART SALAD WITH TOASTED BREAD',
  'STUFFED GRAPE LEAVES',
  'LEBANESE LAMB SAUSAGE',
  'OCTOPUS DISH',
  'PIZZA',
  'CHICKEN WRAPS FROM PALESTINE',
  'FRIED CHICKPEA BALLS',
  'TARATOR DRESSING',
  'LEBANESE STEAK TARTARE',
  'KIBBEH PIE WITH FILLING',
  'LEBANESE FISH PIE',
  'KIBBEH FROM MOSUL',
  'RICE BALLS WITH GROUND MEAT FILLING',
  'VEGETARIAN KIBBEH WITH PINE NUTS',
  'LEBANESE RAVIOLI WITH CORIANDER AND YOGURT SAUCE',
  'BEEF PATTIES WITH PINE NUTS',
  'FRENCH-STYLE BEEF STEW',
  'ROYAL CHICKEN DISH FROM THE SOUTH OF LEBANON',
  'MARINATED CHICKEN SKEWERS',
  'MINCED MEAT SKEWERS',
  'LAMB SHANK WITH RICE',
  'IRAQI LAMB STEW WITH APRICOTS',
  'COUSCOUS',
  'BEIRUT STYLE',
  'TRIPOLI STYLE',
  'SOUR CHICKEN DISH',
  'VEGETARIAN DISH FROM EGYPT',
  'BAKED FISH WITH SPICY RICE',
  'TURKEY STUFFED WITH RICE',
  'LEG OF LAMB FROM JORDAN',
  'LAMB DISH FROM THE UNITED ARAB EMIRATES',
  'LAMB DISH FROM SAUDI ARABIA',
  'LEBANESE CREPES',
  'OPEN LEBANESE CREPES',
  'LEBANESE CLOTTED CREAM',
  'ASHTA PUDDING',
  'EGYPTIAN BREAD PUDDING',
  'SWEET ARABIC PASTRIES',
  'FRIED BALLS IN SUGAR SYRUP',
  'SESAME COOKIES',
  'FILLED SEMOLINA COOKIES',
  'FRIED CONES IN SUGAR SYRUP',
  'LEBANESE SUGAR SYRUP',
  'SOFT SEMOLINA CAKE',
  'SOFT CAKE WITH TURMERIC AND ANISE',
  'FIGS IN GRAPE MOLASSES',
  'CANDIED ORANGE PEELS',
  'DATE-FILLED SESAME COOKIES'
];

/**
 * Vérifier si une ligne correspond à un nom de recette connu
 */
function isKnownRecipeName(line) {
  const lineUpper = line.toUpperCase();
  return KNOWN_RECIPE_NAMES.some(name => {
    const nameUpper = name.toUpperCase();
    // Vérifier si la ligne contient le nom ou si le nom contient la ligne
    return lineUpper.includes(nameUpper) || nameUpper.includes(lineUpper);
  });
}

/**
 * Trouver le nom complet d'une recette (peut être sur plusieurs lignes)
 */
function findRecipeName(lines, startIndex) {
  const nameLines = [];
  
  // Chercher dans les lignes précédentes (jusqu'à 5 lignes)
  for (let j = startIndex - 1; j >= Math.max(0, startIndex - 5); j--) {
    const line = lines[j].trim();
    if (line.match(/^[A-Z][A-Z\s&,\-']+$/) && 
        line.length > 3 &&
        !line.match(/^(DOUGH|FILLING|ZAATAR|SAUCE|MARINADE|SPICE|MIXTURE|OR:|PIECES|SERVES|Snacks|Dips|PORTIONS)$/i)) {
      nameLines.unshift(line);
    } else if (nameLines.length > 0) {
      // On a trouvé le début du nom, arrêter
      break;
    }
  }
  
  let recipeName = nameLines.join(' ').trim();
  
  // Vérifier si c'est un nom connu ou contient un nom connu
  if (recipeName) {
    for (const knownName of KNOWN_RECIPE_NAMES) {
      if (recipeName.toUpperCase().includes(knownName.toUpperCase()) || 
          knownName.toUpperCase().includes(recipeName.toUpperCase())) {
        // Utiliser le nom connu complet
        recipeName = knownName;
        break;
      }
    }
  }
  
  return recipeName;
}

/**
 * Parser les recettes depuis le texte
 */
function parseRecipesFromText(text) {
  const recipes = [];
  const lines = text.split('\n');
  
  let currentRecipe = null;
  let recipeStartIndex = -1;
  let inDescription = false;
  let descriptionLines = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Détecter le début d'une nouvelle recette : "X PIECES" ou "SERVES X" ou "X PORTIONS"
    const piecesMatch = line.match(/^(\d+)\s+PIECES?$/i);
    const servesMatch = line.match(/^SERVES\s+(\d+)/i);
    const portionsMatch = line.match(/^(\d+)[-\s]+PORTIONS?$/i);
    
    if (piecesMatch || servesMatch || portionsMatch) {
      // Sauvegarder la recette précédente
      if (currentRecipe && currentRecipe.ingredients.length > 0 && currentRecipe.preparationSteps.length > 0) {
        recipes.push(currentRecipe);
      }
      
      // Extraire le nombre de portions
      const servings = piecesMatch ? parseInt(piecesMatch[1]) : 
                      servesMatch ? parseInt(servesMatch[1]) : 
                      parseInt(portionsMatch[1]);
      
      // Trouver le nom de la recette
      let recipeName = findRecipeName(lines, i);
      
      if (!recipeName || recipeName.length < 3) {
        recipeName = `Arabic Recipe ${recipes.length + 1}`;
      }
      
      // Créer une nouvelle recette
      currentRecipe = {
        name: recipeName,
        ingredients: [],
        preparationSteps: [],
        category: 'plat',
        preparationTime: 0,
        cookingTime: 0,
        servings: servings
      };
      
      recipeStartIndex = i;
      inDescription = true;
      descriptionLines = 0;
      continue;
    }
    
    // Si on a une recette en cours
    if (currentRecipe) {
      // Ignorer les lignes de description (premières lignes après "X PIECES")
      if (inDescription) {
        descriptionLines++;
        // Vérifier si c'est une description (pas en MAJUSCULES ou commence par des mots de description)
        if (!line.match(/^[A-Z0-9\s\(\)\/,\.\-⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+$/) || 
            line.match(/^(In the|The secret|The original|This|It's|A lot|Manakish|Samboosik|Snacks|Dips|One of|Kibbeh|Hummus|Means|Arabic|Lebanese|Kitchen|Common|Preferably|Make|You can|Also|Serve|At my|A popular|A must|The name|refers|replaced|choose|happen|skilled|chef|prettier|larger|turn out|calls for|may be|easier|find|quickly|become|breakfast|dish|quick|easy|bake|cheap|tasty|varied|endlessly|different|fillings|shown|here|popular|spice|mixture|available|different|variations|several|parts|world|has been|long|time|common|feature|meze|table|when|consists|fish|shellfish|very|easy|version|often|served|anything|grilled|usually|folded|eaten|hands|popular|Palestine|where|served|various|shapes|Here|sumac-flavored|chicken|has been|rolled|flat|bread)$/i)) {
          if (descriptionLines > 10) {
            inDescription = false; // Arrêter d'ignorer après 10 lignes
          } else {
            continue;
          }
        } else {
          // Si on trouve une ligne en MAJUSCULES qui ressemble à un ingrédient, arrêter la description
          if (line.match(/^[A-Z0-9\s\(\)\/,\.\-⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+$/) && line.length > 5) {
            inDescription = false;
          } else if (descriptionLines > 5) {
            inDescription = false;
          }
        }
      }
      
      // Détecter les sections DOUGH, FILLING, etc. (sous-sections d'ingrédients)
      if (line.match(/^(DOUGH|FILLING|ZAATAR|SAUCE|MARINADE|SPICE|MIXTURE|OR:)$/i)) {
        continue; // Ignorer la ligne de section mais continuer à collecter les ingrédients
      }
      
      // Détecter le début des étapes (ligne commençant par "1.")
      if (line.match(/^1\.\s+/)) {
        // Extraire toutes les étapes depuis cette ligne jusqu'à la prochaine recette
        let currentStepNum = 1;
        let stepText = line.replace(/^1\.\s+/, '').trim();
        let j = i + 1;
        
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          
          // Vérifier si c'est le début d'une nouvelle recette
          if (nextLine.match(/^(\d+)\s+PIECES?$|^SERVES\s+\d+|^\d+[-\s]+PORTIONS?$/i)) {
            break;
          }
          
          // Vérifier si c'est une nouvelle étape numérotée
          const nextStepMatch = nextLine.match(/^(\d+)\.\s+(.+)$/);
          if (nextStepMatch) {
            const nextStepNum = parseInt(nextStepMatch[1]);
            // Sauvegarder l'étape précédente
            if (stepText.trim()) {
              currentRecipe.preparationSteps.push(stepText.trim());
            }
            // Commencer la nouvelle étape
            stepText = nextStepMatch[2].trim();
            currentStepNum = nextStepNum;
          } else if (nextLine && !nextLine.match(/^(DOUGH|FILLING|ZAATAR|SAUCE|MARINADE|SPICE|MIXTURE|OR:)$/i)) {
            // Continuer l'étape actuelle
            stepText += ' ' + nextLine;
          }
          
          j++;
        }
        
        // Ajouter la dernière étape
        if (stepText.trim()) {
          currentRecipe.preparationSteps.push(stepText.trim());
        }
        
        i = j - 1; // Avancer jusqu'à la prochaine recette
        continue;
      }
      
      // Si on n'est pas encore dans les étapes, collecter les ingrédients
      if (currentRecipe.preparationSteps.length === 0 && !inDescription) {
        // Vérifier si c'est un ingrédient (ligne en MAJUSCULES avec chiffres/unités)
        if (line.match(/^[A-Z0-9\s\(\)\/,\.\-⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]+$/) && line.length > 3 && line.length < 200) {
          // Ignorer les lignes qui sont clairement des descriptions
          if (!line.match(/^(In the|The secret|The original|This|It's|A lot|Manakish|Samboosik|Snacks|Dips|One of|Kibbeh|Hummus|Means|Arabic|Lebanese|Kitchen|Common|Preferably|Make|You can|Also|Serve|At my|A popular|A must|The name|refers|replaced|choose|happen|skilled|chef|prettier|larger|turn out|calls for|may be|easier|find|quickly|become|breakfast|dish|quick|easy|bake|cheap|tasty|varied|endlessly|different|fillings|shown|here|popular|spice|mixture|available|different|variations|several|parts|world|has been|long|time|common|feature|meze|table|when|consists|fish|shellfish|very|easy|version|often|served|anything|grilled|usually|folded|eaten|hands|popular|Palestine|where|served|various|shapes|Here|sumac-flavored|chicken|has been|rolled|flat|bread)$/i)) {
            const cleaned = cleanIngredientName(line);
            if (cleaned.length > 2 && cleaned.length < 150) {
              currentRecipe.ingredients.push({
                name: cleaned,
                quantity: '',
                unit: ''
              });
            }
          }
        }
      }
    }
  }
  
  // Ajouter la dernière recette
  if (currentRecipe && currentRecipe.ingredients.length > 0 && currentRecipe.preparationSteps.length > 0) {
    recipes.push(currentRecipe);
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
    'gluten': ['flour', 'wheat', 'bread', 'pasta', 'noodles', 'semolina', 'couscous', 'barley', 'rye', 'oats', 'dough'],
    'lactose': ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt', 'dairy', 'parmesan', 'mozzarella', 'greek yogurt'],
    'oeufs': ['egg', 'eggs', 'mayonnaise', 'mayo'],
    'poisson': ['fish', 'salmon', 'tuna', 'sardine', 'anchovy', 'cod', 'trout', 'mackerel'],
    'crustaces': ['shrimp', 'crab', 'lobster', 'prawn', 'crayfish'],
    'mollusques': ['mussel', 'oyster', 'clam', 'squid', 'octopus', 'scallop'],
    'soja': ['soy', 'soya', 'tofu', 'tempeh', 'miso', 'edamame'],
    'fruits_a_coque': ['almond', 'walnut', 'hazelnut', 'cashew', 'pistachio', 'pecan', 'macadamia', 'pine nut', 'pine nuts'],
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
  if (!allText.match(/\b(beef|chicken|lamb|pork|meat|fish|seafood|turkey|sausage|bacon|ham|mutton|ground lamb|ground beef)\b/)) {
    restrictions.push('vegetarien');
  }
  
  // Végétalien
  if (!allText.match(/\b(beef|chicken|lamb|pork|meat|fish|seafood|turkey|sausage|bacon|ham|mutton|ground lamb|ground beef|egg|eggs|milk|cheese|butter|yogurt|dairy)\b/)) {
    restrictions.push('vegan');
  }
  
  // Halal (pas de porc)
  if (!allText.match(/\b(pork|bacon|ham)\b/)) {
    restrictions.push('halal');
  }
  
  // Sans gluten
  if (!allText.match(/\b(flour|wheat|bread|pasta|barley|rye|oats|gluten|dough)\b/)) {
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
  tags.push('#arabic');
  tags.push('#middle-eastern');
  tags.push('#lebanese');
  
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
  if (allText.match(/\b(lamb|agneau|mutton)\b/)) {
    tags.push('#agneau');
    tags.push('#viande');
  }
  if (allText.match(/\b(beef|boeuf)\b/)) {
    tags.push('#boeuf');
    tags.push('#viande');
  }
  if (allText.match(/\b(spinach|epinard)\b/)) {
    tags.push('#epinard');
    tags.push('#legumes');
  }
  if (allText.match(/\b(zaatar|sumac|oregano|thyme)\b/)) {
    tags.push('#epice');
    tags.push('#herbes');
  }
  if (allText.match(/\b(pie|pies|pizza|manakish)\b/)) {
    tags.push('#patisserie');
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
  if (nameLower.match(/\b(salad|salade)\b/)) {
    recipe.category = 'entree';
  } else if (nameLower.match(/\b(dessert|cake|pie|pudding|cookie|sweet)\b/)) {
    recipe.category = 'dessert';
  } else if (nameLower.match(/\b(soup|soupe|broth)\b/)) {
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
async function extractArabicRecipes(jsonPath, outputPath = null) {
  try {
    console.log('📚 Extraction des recettes arabes depuis le JSON...');
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
      const jsContent = `// Recettes arabes extraites de ${path.basename(jsonPath)}\n\nexport const recipes = ${JSON.stringify(normalizedRecipes, null, 2)};\n`;
      const jsonContent = JSON.stringify(normalizedRecipes, null, 2);
      
      const jsPath = path.join(outputPath, 'arabic-recipes.js');
      const jsonPathOut = path.join(outputPath, 'arabic-recipes.json');
      
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
  const jsonPath = path.join(__dirname, '..', 'data', 'arabic receipt.json');
  const outputPath = path.join(__dirname, '..', 'data');
  
  extractArabicRecipes(jsonPath, outputPath)
    .then(result => {
      console.log(`\n✅ Extraction terminée: ${result.count} recette(s) extraite(s)`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default extractArabicRecipes;

