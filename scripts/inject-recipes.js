// scripts/inject-recipes.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Recipe from '../recipe.model.js';

// Importer les recettes depuis le fichier client/js/recipes.js
import recipesData from '../client/js/recipes.js';

// Fonction pour détecter les allergènes dans les ingrédients
function detectAllergens(ingredients) {
  const allergens = new Set();
  
  const allergenMap = {
    'gluten': ['pâtes', 'pâte', 'farine', 'pain', 'chapelure', 'semoule', 'blé', 'biscuit', 'brioche'],
    'lactose': ['lait', 'crème', 'fromage', 'beurre', 'gruyère', 'parmesan', 'yaourt', 'emmental', 'mozzarella', 'chèvre'],
    'oeufs': ['œuf', 'oeuf', 'mayonnaise', 'mayo'],
    'poisson': ['poisson', 'colin', 'dorade', 'saumon', 'thon', 'cabillaud', 'truite', 'sardine', 'anchois'],
    'crustaces': ['crevette', 'crabe', 'homard', 'langoustine', 'écrevisse'],
    'mollusques': ['moule', 'huître', 'calamar', 'seiche', 'poulpe', 'escargot'],
    'soja': ['soja', 'tofu', 'sauce soja'],
    'fruits_a_coque': ['noix', 'amande', 'noisette', 'cajou', 'pistache', 'pécan', 'macadamia'],
    'arachides': ['cacahuète', 'arachide', 'cacahouète'],
    'sesame': ['sésame', 'tahini'],
    'moutarde': ['moutarde'],
    'celeri': ['céleri', 'celeri'],
    'sulfites': ['vin', 'vinaigre'],
    'lupin': ['lupin']
  };
  
  ingredients.forEach(ing => {
    // Support pour "name" ou "item" comme nom d'ingrédient
    const ingredientName = (ing.name || ing.item || '').toLowerCase();
    Object.entries(allergenMap).forEach(([allergen, keywords]) => {
      if (keywords.some(keyword => ingredientName.includes(keyword))) {
        allergens.add(allergen);
      }
    });
  });
  
  return Array.from(allergens);
}

// Fonction pour déterminer les restrictions alimentaires compatibles
function determineDietaryRestrictions(recipe) {
  const restrictions = [];
  const category = recipe.category?.toLowerCase() || recipe.type?.toLowerCase() || '';
  
  if (category === 'vegetarien') {
    restrictions.push('vegetarien');
  }
  
  // Vérifier si vegan (pas de produits animaux)
  const animalProducts = ['lait', 'crème', 'fromage', 'beurre', 'œuf', 'oeuf', 'miel'];
  const hasAnimalProducts = recipe.ingredients.some(ing => 
    animalProducts.some(product => ing.name.toLowerCase().includes(product))
  );
  
  if (category === 'vegetarien' && !hasAnimalProducts) {
    restrictions.push('vegan');
  }
  
  // Sans gluten
  const glutenIngredients = ['pâtes', 'farine', 'pain', 'chapelure', 'semoule'];
  const hasGluten = recipe.ingredients.some(ing => 
    glutenIngredients.some(gluten => ing.name.toLowerCase().includes(gluten))
  );
  if (!hasGluten) {
    restrictions.push('sans_gluten');
  }
  
  // Sans lactose
  const lactoseIngredients = ['lait', 'crème', 'fromage', 'beurre', 'yaourt'];
  const hasLactose = recipe.ingredients.some(ing => 
    lactoseIngredients.some(lactose => ing.name.toLowerCase().includes(lactose))
  );
  if (!hasLactose) {
    restrictions.push('sans_lactose');
  }
  
  // Sans porc
  const hasPork = recipe.ingredients.some(ing => 
    ing.name.toLowerCase().includes('porc') || ing.name.toLowerCase().includes('lard')
  );
  if (!hasPork) {
    restrictions.push('sans_porc');
  }
  
  return restrictions;
}

// Fonction pour déterminer les pathologies compatibles
function determineMedicalConditions(recipe) {
  const conditions = [];
  const nutrition = recipe.nutrition || {
    calories: recipe.calories,
    proteins: recipe.proteins,
    carbs: recipe.carbs,
    fats: recipe.fats
  };
  
  // Compatible avec diabète si peu de glucides
  if (nutrition.carbs && nutrition.carbs < 50) {
    conditions.push('diabete');
  }
  
  // Compatible avec hypertension si peu salé (on suppose que les recettes ne sont pas trop salées)
  conditions.push('hypertension');
  
  // Compatible avec cholestérol si peu de graisses
  if (nutrition.fats && nutrition.fats < 15) {
    conditions.push('cholesterol');
  }
  
  // Texture normale par défaut (peut être adaptée)
  conditions.push('texture_modifiee'); // Toutes les recettes peuvent être adaptées en texture
  
  return conditions;
}

// Fonction pour détecter le composant du repas
function detectMealComponent(recipe) {
  const title = (recipe.title || recipe.name || '').toLowerCase();
  const ingredients = recipe.ingredients || [];
  const ingredientNames = ingredients.map(ing => (ing.name || ing.item || '').toLowerCase()).join(' ');
  
  // Soupe
  if (title.includes('soupe') || title.includes('velouté') || title.includes('potage') || title.includes('bouillon')) {
    return 'soupe';
  }
  
  // Entrée
  if (title.includes('salade') && !title.includes('composée')) {
    return 'entree';
  }
  
  // Dessert
  if (title.includes('compote') || title.includes('yaourt') || title.includes('crème') || 
      title.includes('gâteau') || title.includes('tarte') || title.includes('flan') ||
      title.includes('sorbet') || title.includes('glace')) {
    return 'dessert';
  }
  
  // Féculent seul
  const feculentKeywords = ['riz', 'pâtes', 'semoule', 'pommes de terre', 'purée', 'polenta'];
  const hasOnlyFeculent = feculentKeywords.some(kw => title.includes(kw)) && 
    !['poulet', 'poisson', 'viande', 'saumon', 'colin', 'boeuf', 'porc'].some(kw => title.includes(kw));
  if (hasOnlyFeculent) {
    return 'feculent';
  }
  
  // Protéine (viande, poisson, volaille)
  const proteineKeywords = ['poulet', 'poisson', 'saumon', 'colin', 'dorade', 'thon', 'cabillaud', 
                            'boeuf', 'veau', 'agneau', 'porc', 'jambon', 'steak', 'filet', 'escalope'];
  const hasProteine = proteineKeywords.some(kw => title.includes(kw) || ingredientNames.includes(kw));
  if (hasProteine) {
    return 'proteine';
  }
  
  // Légumes seuls
  const legumesKeywords = ['ratatouille', 'légumes', 'courgette', 'aubergine', 'tomate', 'carotte', 
                           'haricot', 'brocoli', 'chou-fleur', 'épinard'];
  const hasLegumes = legumesKeywords.some(kw => title.includes(kw));
  if (hasLegumes && !hasProteine) {
    return 'legumes';
  }
  
  // Par défaut, plat complet
  return 'plat_complet';
}

// Fonction pour normaliser une recette
function normalizeRecipe(recipe) {
  const nutrition = recipe.nutrition ? {
    calories: recipe.nutrition.calories,
    proteins: recipe.nutrition.proteins,
    carbs: recipe.nutrition.carbs,
    fats: recipe.nutrition.fats
  } : {
    calories: recipe.calories || 0,
    proteins: recipe.proteins || 0,
    carbs: recipe.carbs || 0,
    fats: recipe.fats || 0
  };
  
  // Normaliser les ingrédients (support "item" et "name")
  const normalizedIngredients = recipe.ingredients.map(ing => ({
    name: ing.item || ing.name || 'Ingrédient',
    quantity: ing.quantity || 0,
    unit: ing.unit || 'unité'
  }));
  
  // Détecter la catégorie à partir des tags ou du type
  const tags = recipe.tags || [];
  let category = recipe.category || recipe.type || 'autre';
  
  // Détecter à partir des tags
  if (tags.includes('viande') || tags.includes('bœuf') || tags.includes('porc') || tags.includes('agneau')) {
    category = 'viande';
  } else if (tags.includes('poisson') || tags.includes('fruits de mer')) {
    category = 'poisson';
  } else if (tags.includes('volaille') || tags.includes('poulet') || tags.includes('dinde')) {
    category = 'volaille';
  } else if (tags.includes('végétarien') || tags.includes('vegetarien') || tags.includes('légumes')) {
    category = 'vegetarien';
  }
  
  // Déterminer le groupe d'âge (par défaut tous âges si non spécifié)
  const ageGroup = recipe.ageGroup || '2.5-18';
  
  const normalizedRecipe = {
    title: recipe.title,
    description: recipe.description || `Délicieuse recette de ${recipe.title.toLowerCase()}`,
    ageGroup: ageGroup,
    type: category,
    mainIngredient: recipe.mainIngredient || 'divers',
    servings: recipe.servings || 4,
    ingredients: normalizedIngredients,
    instructions: recipe.instructions || [],
    category: category,
    nutrition: nutrition,
    allergens: detectAllergens(normalizedIngredients),
    dietaryRestrictions: determineDietaryRestrictions({...recipe, ingredients: normalizedIngredients, category}),
    medicalConditions: determineMedicalConditions({...recipe, nutrition}),
    texture: recipe.texture || 'normale',
    mealComponent: detectMealComponent({...recipe, title: recipe.title, ingredients: normalizedIngredients})
  };
  
  return normalizedRecipe;
}

// Fonction principale d'injection
async function injectRecipes() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    console.log('🗑️  Suppression des anciennes recettes...');
    await Recipe.deleteMany({});
    console.log('✅ Anciennes recettes supprimées');
    
    console.log(`📝 Injection de ${recipesData.length} recettes...`);
    const normalizedRecipes = recipesData.map(normalizeRecipe);
    
    const insertedRecipes = await Recipe.insertMany(normalizedRecipes);
    console.log(`✅ ${insertedRecipes.length} recettes injectées avec succès!`);
    
    // Afficher quelques statistiques
    const stats = {
      total: insertedRecipes.length,
      parCategorie: {},
      parTrancheAge: {}
    };
    
    insertedRecipes.forEach(recipe => {
      stats.parCategorie[recipe.category] = (stats.parCategorie[recipe.category] || 0) + 1;
      stats.parTrancheAge[recipe.ageGroup] = (stats.parTrancheAge[recipe.ageGroup] || 0) + 1;
    });
    
    console.log('\n📊 Statistiques:');
    console.log('Par catégorie:', stats.parCategorie);
    console.log('Par tranche d\'âge:', stats.parTrancheAge);
    
    console.log('\n🎉 Injection terminée avec succès!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'injection:', error);
    process.exit(1);
  }
}

// Exécuter l'injection
injectRecipes();

