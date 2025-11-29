// scripts/extract-vegan-recipes.js
// Script pour extraire les recettes du fichier "vegan receipt1.json"
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
    // Ignorer les lignes "Ingredients", "Directions", sections, etc.
    if (line.match(/^(Ingredients|Directions|Allergens|Tip|Special Equipment|Make Ahead|Praline Topping|French Toast|Crumble Topping|Cake|Glaze|Frosting|Sauce|Dressing|Marinade|Spice|Mixture)$/i)) {
      continue;
    }
    
    // Ignorer les lignes qui sont des numéros seuls (1., 2., etc.)
    if (line.match(/^\d+\.?\s*$/)) {
      continue;
    }
    
    // Ignorer les lignes qui sont clairement des descriptions (commencent par "Chef Linda", "Preheat", etc.)
    if (line.match(/^(Chef Linda|Preheat|In a|To make|Place|Mix|Add|Stir|Pour|Bake|Remove|Let|Set|Cover|Line|Empty|Whisk|Combine|Process|Pulse|Mash|Blend|Arrange|Top|Sprinkle|Drop|Spoon|Saturate|Cook|Heat|Melt|Bring|Simmer|Continue|Turn|Leave|Reheat|Cut|Insert|Invert|Slice|Chill|Lift|Serve|Drizzle|Garnish|Season|Taste|Test|Check|Wait|Imagine|Conjure|Close|Bite|Enjoy|There|Nearby|Steam|Swirl|Sweet|Scent|Ignite|Appetite|Forkful|Decadent|Wait|France|Future|Say|Then|Buttery|Praline|Adorned|Breakfast|Delight|Without|Relying|Unkind|Standbys|Like|Eggs|Cream|Butter|French|Toast|Casserole|Homestead|Specialty|Gets|Luscious|Custard|Filling|From|Bananas|Nondairy|Milk|Lovely|Addition|Special|Brunches|Holiday|Mornings|Simple|Dish|Pamper|Spirit|Bake|Cool|Days|Advance|Cover|Foil|Refrigerate|Overnight|Reheat|Oven|Minutes|While|Coffee|Brewing|Nothing|Sweeter|Than|Promise|Day|Begins|Cake|Favorite|Homestead|Our|Pecan|Chocolate|Chip|Coffee|Cake|Been|Rousing|Sleepy|Guests|Years|Some|Equip|Themselves|Forks|Others|Bare|Hands|All|Them|End|Wiping|Crumbs|Traces|Melted|Chocolate|From|Satisfied|Smiles|Tender|Moist|Vanilla|Cake|Liberally|Studded|Chocolate|Chips|Topped|Nutty|Sweet|Crumble|Cake|You|Covet|Please|Consider|Sharing|Friends|Family)$/i)) {
      continue;
    }
    
    const cleaned = cleanIngredientName(line);
    if (cleaned.length > 2 && cleaned.length < 200) {
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
  let stepNumber = 0;
  
  for (const line of lines) {
    // Ignorer les lignes "Directions", sections, etc.
    if (line.match(/^(Directions|Ingredients|Allergens|Tip|Special Equipment|Make Ahead|Praline Topping|French Toast|Crumble Topping|Cake|Glaze|Frosting|Sauce|Dressing|Marinade|Spice|Mixture)$/i)) {
      continue;
    }
    
    // Détecter les étapes numérotées (1., 2., etc.)
    const stepMatch = line.match(/^(\d+)\.\s*(.+)$/);
    if (stepMatch) {
      // Sauvegarder l'étape précédente si elle existe
      if (currentStep.trim()) {
        steps.push(currentStep.trim());
      }
      stepNumber = parseInt(stepMatch[1]);
      currentStep = stepMatch[2];
    } else if (line.match(/^\d+\.?\s*$/)) {
      // Ligne avec juste un numéro, continuer
      continue;
    } else if (currentStep || stepNumber > 0) {
      // Continuer l'étape actuelle sur plusieurs lignes
      // Vérifier que ce n'est pas le début d'une nouvelle recette
      if (!line.match(/^(MAKES|SERVES|Chef Linda|Allergens|Tip|Special Equipment|Make Ahead|Ingredients|Directions)$/i)) {
        if (currentStep) {
          currentStep += ' ' + line;
        } else {
          // Première ligne d'une étape non numérotée
          currentStep = line;
        }
      }
    } else {
      // Première ligne d'une étape (sans numéro)
      if (line.length > 10 && !line.match(/^(Chef Linda|Allergens|Tip|Special Equipment|Make Ahead)$/i)) {
        currentStep = line;
        stepNumber = 1;
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
  // Pattern: "MAKES 1 LOAF, ABOUT 8 TO 10 SLICES"
  const makesMatch = text.match(/MAKES\s+(\d+)/i);
  if (makesMatch) {
    return parseInt(makesMatch[1]);
  }
  
  // Pattern: "SERVES 6 TO 8 PEOPLE"
  const servesMatch = text.match(/SERVES\s+(\d+)/i);
  if (servesMatch) {
    return parseInt(servesMatch[1]);
  }
  
  // Pattern: "MAKES 16 (2-INCH) SQUARES"
  const makesSquaresMatch = text.match(/MAKES\s+(\d+)/i);
  if (makesSquaresMatch) {
    return parseInt(makesSquaresMatch[1]);
  }
  
  return 4; // Par défaut
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
  let inDirections = false;
  let ingredientsText = '';
  let directionsText = '';
  let recipeStartIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;
    
    // Détecter le début d'une nouvelle recette : "MAKES" ou "SERVES"
    const makesMatch = line.match(/^(MAKES|SERVES)/i);
    if (makesMatch && i > 0) {
      // Sauvegarder la recette précédente
      if (currentRecipe) {
        // Extraire les ingrédients et étapes
        if (ingredientsText) {
          currentRecipe.ingredients = extractIngredients(ingredientsText);
        }
        if (directionsText) {
          currentRecipe.preparationSteps = extractPreparationSteps(directionsText);
        }
        
        // Ne garder que les recettes complètes
        if (currentRecipe.ingredients.length > 0 && currentRecipe.preparationSteps.length > 0) {
          recipes.push(currentRecipe);
        }
      }
      
      // Extraire le nombre de portions
      const servings = extractServings(line);
      
      // Chercher le nom de la recette dans la ligne précédente (généralement juste avant "MAKES" ou "SERVES")
      recipeName = '';
      if (i > 0) {
        const prevLine = lines[i - 1].trim();
        if (prevLine && prevLine.length > 2 && prevLine.length < 150) {
          // Ignorer si c'est clairement une description ou une section
          if (!prevLine.match(/^(MAKES|SERVES|Chef Linda|Allergens|Tip|Special Equipment|Make Ahead|Ingredients|Directions|Preheat|In a|To make|Place|Mix|Add|Stir|Pour|Bake|Remove|Let|Set|Cover|Line|Empty|Whisk|Combine|Process|Pulse|Mash|Blend|Arrange|Top|Sprinkle|Drop|Spoon|Saturate|Cook|Heat|Melt|Bring|Simmer|Continue|Turn|Leave|Reheat|Cut|Insert|Invert|Slice|Chill|Lift|Serve|Drizzle|Garnish|Season|Taste|Test|Check|Wait|Imagine|Conjure|Close|Bite|Enjoy|There|Nearby|Steam|Swirl|Sweet|Scent|Ignite|Appetite|Forkful|Decadent|Wait|France|Future|Say|Then|Buttery|Praline|Adorned|Breakfast|Delight|Without|Relying|Unkind|Standbys|Like|Eggs|Cream|Butter|French|Toast|Casserole|Homestead|Specialty|Gets|Luscious|Custard|Filling|From|Bananas|Nondairy|Milk|Lovely|Addition|Special|Brunches|Holiday|Mornings|Simple|Dish|Pamper|Spirit|Bake|Cool|Days|Advance|Cover|Foil|Refrigerate|Overnight|Reheat|Oven|Minutes|While|Coffee|Brewing|Nothing|Sweeter|Than|Promise|Day|Begins|Cake|Favorite|Homestead|Our|Pecan|Chocolate|Chip|Coffee|Cake|Been|Rousing|Sleepy|Guests|Years|Some|Equip|Themselves|Forks|Others|Bare|Hands|All|Them|End|Wiping|Crumbs|Traces|Melted|Chocolate|From|Satisfied|Smiles|Tender|Moist|Vanilla|Cake|Liberally|Studded|Chocolate|Chips|Topped|Nutty|Sweet|Crumble|Cake|You|Covet|Please|Consider|Sharing|Friends|Family|^\d+\.?\s*$)$/i)) {
            // Nettoyer le nom (supprimer les caractères étranges et corriger l'encodage)
            recipeName = prevLine
              .replace(/[^\w\s&,\-']/g, ' ') // Supprimer les caractères non-alphanumériques sauf espaces, &, -, '
              .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
              .trim();
            
            // Corriger les noms communs mal encodés
            recipeName = recipeName
              .replace(/\bBe\s+Banan\s+Brea\b/gi, 'Best Banana Bread')
              .replace(/\bNut\s+Breakfa\s+Bar\b/gi, 'Nut Breakfast Bars')
              .replace(/\bBlueberr\s+-Banan\s+an\s+Pralin\s+Frenc\s+Toa\s+Cas\s+er\s+l\b/gi, 'Blueberry-Banana and Praline French Toast Casserole')
              .replace(/\bPeca\s+Choc\s+lat\s+Chi\s+C\s+f\s+e\s+Cak\b/gi, 'Pecan Chocolate Chip Coffee Cake')
              .replace(/\bHome\s+tea\s+Gran\s+l\s+wit\s+Vanill\s+Ca\s+he\s+Crea\b/gi, 'Homemade Granola with Vanilla Cashew Cream')
              .replace(/\bLemo\s+-Blueberr\s+P\s+lent\s+Griddl\s+Cake\s+wit\s+Lemo\s+-But\s+e\s+Syru\b/gi, 'Lemon-Blueberry Polenta Griddle Cakes with Lemon-Butter Syrup')
              .replace(/\bSpice\s+Zucchin\s+Carr\s+\s+Brea\b/gi, 'Spiced Zucchini Carrot Bread')
              .replace(/\bSimpl\s+,\s+Swee\s+Choc\s+lat\s+Chi\s+Scone\b/gi, 'Simple, Sweet Chocolate Chip Scones')
              .replace(/\bWeeken\s+Waf\s+le\s+wit\s+Fudg\s+Sauc\b/gi, 'Weekend Waffles with Fudge Sauce')
              .replace(/\bSuperfoo\s+Smo\s+thi\s+Bowl\b/gi, 'Superfood Smoothie Bowls');
          }
        }
      }
      
      if (!recipeName || recipeName.length < 3) {
        recipeName = `Vegan Recipe ${recipes.length + 1}`;
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
      inIngredients = false;
      inDirections = false;
      ingredientsText = '';
      directionsText = '';
      continue;
    }
    
    // Si on a une recette en cours
    if (currentRecipe) {
      // Détecter la section "Ingredients"
      if (line.match(/^Ingredients$/i)) {
        inIngredients = true;
        inDirections = false;
        continue;
      }
      
      // Détecter la section "Directions"
      if (line.match(/^Directions$/i)) {
        inDirections = true;
        inIngredients = false;
        continue;
      }
      
      // Vérifier si on est dans une nouvelle recette (titre en MAJUSCULES suivi de "MAKES" ou "SERVES")
      if (i > recipeStartIndex + 5 && line.match(/^[A-Z][A-Z\s&,\-']+$/) && line.length > 5) {
        // Vérifier si la ligne suivante contient "MAKES" ou "SERVES"
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine.match(/^(MAKES|SERVES)/i)) {
            // C'est le début d'une nouvelle recette, traiter plus tard
            continue;
          }
        }
      }
      
      // Collecter les ingrédients
      if (inIngredients) {
        ingredientsText += line + '\n';
      }
      
      // Collecter les étapes
      if (inDirections) {
        directionsText += line + '\n';
      }
    } else {
      // Chercher le début d'une recette (titre suivi de "MAKES" ou "SERVES")
      if (line.match(/^[A-Z][A-Z\s&,\-']+$/) && line.length > 3) {
        // Vérifier si la ligne suivante contient "MAKES" ou "SERVES"
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine.match(/^(MAKES|SERVES)/i)) {
            recipeName = line;
            const servings = extractServings(nextLine);
            
            currentRecipe = {
              name: recipeName,
              ingredients: [],
              preparationSteps: [],
              category: 'plat',
              preparationTime: 0,
              cookingTime: 0,
              servings: servings
            };
            
            recipeStartIndex = i + 1;
            inIngredients = false;
            inDirections = false;
            ingredientsText = '';
            directionsText = '';
            i++; // Skip la ligne "MAKES" ou "SERVES"
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
    if (directionsText) {
      currentRecipe.preparationSteps = extractPreparationSteps(directionsText);
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
    'gluten': ['flour', 'wheat', 'bread', 'pasta', 'noodles', 'semolina', 'couscous', 'barley', 'rye', 'oats', 'tortilla', 'tortillas', 'baguette'],
    'lactose': ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt', 'dairy'],
    'oeufs': ['egg', 'eggs', 'mayonnaise', 'mayo'],
    'poisson': ['fish', 'salmon', 'tuna', 'sardine', 'anchovy', 'cod', 'trout', 'mackerel'],
    'crustaces': ['shrimp', 'crab', 'lobster', 'prawn', 'crayfish'],
    'mollusques': ['mussel', 'oyster', 'clam', 'squid', 'octopus', 'scallop'],
    'soja': ['soy', 'soya', 'tofu', 'tempeh', 'miso', 'edamame', 'soy sauce'],
    'fruits_a_coque': ['almond', 'walnut', 'hazelnut', 'cashew', 'pistachio', 'pecan', 'macadamia', 'pine nut', 'pine nuts', 'nuts'],
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
  
  // Toutes les recettes sont véganes par défaut (fichier vegan)
  restrictions.push('vegan');
  
  // Végétarien aussi (végane implique végétarien)
  restrictions.push('vegetarien');
  
  // Sans gluten (si pas de gluten détecté)
  if (!allText.match(/\b(flour|wheat|bread|pasta|barley|rye|oats|gluten|tortilla|baguette)\b/)) {
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
  tags.push('#vegan');
  tags.push('#vegetarien');
  
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
  if (allText.match(/\b(banana|bananas)\b/)) {
    tags.push('#banane');
  }
  if (allText.match(/\b(chocolate|chocolate chips)\b/)) {
    tags.push('#chocolat');
  }
  if (allText.match(/\b(nut|nuts|walnut|pecan|almond|cashew)\b/)) {
    tags.push('#fruits-a-coque');
  }
  if (allText.match(/\b(blueberry|blueberries)\b/)) {
    tags.push('#myrtille');
  }
  if (allText.match(/\b(bread|toast|baguette)\b/)) {
    tags.push('#pain');
  }
  if (allText.match(/\b(cake|coffee cake)\b/)) {
    tags.push('#gateau');
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
  if (nameLower.match(/\b(bread|toast|breakfast|bar|coffee cake|muffin|pancake|waffle)\b/)) {
    recipe.category = 'petit-dejeuner';
  } else if (nameLower.match(/\b(cake|dessert|cookie|pudding|cream|pastry|baklava|syrup)\b/)) {
    recipe.category = 'dessert';
  } else if (nameLower.match(/\b(salad|salade)\b/)) {
    recipe.category = 'entree';
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
async function extractVeganRecipes(jsonPath, outputPath = null) {
  try {
    console.log('📚 Extraction des recettes véganes depuis le JSON...');
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
      const jsContent = `// Recettes véganes extraites de ${path.basename(jsonPath)}\n\nexport const recipes = ${JSON.stringify(normalizedRecipes, null, 2)};\n`;
      const jsonContent = JSON.stringify(normalizedRecipes, null, 2);
      
      const jsPath = path.join(outputPath, 'vegan-recipes.js');
      const jsonPathOut = path.join(outputPath, 'vegan-recipes.json');
      
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
  const jsonPath = path.join(__dirname, '..', 'data', 'vegan receipt1.json');
  const outputPath = path.join(__dirname, '..', 'data');
  
  extractVeganRecipes(jsonPath, outputPath)
    .then(result => {
      console.log(`\n✅ Extraction terminée: ${result.count} recette(s) extraite(s)`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default extractVeganRecipes;

