/**
 * Contrôleur spécifique pour la génération de menus entreprise (type buffet)
 * Génère 3 menus complets au choix + buffet salades + desserts variés
 */

import Recipe from '../recipe.model.js';

/**
 * Génère un menu buffet pour cantine d'entreprise avec 3 options au choix
 * @route POST /api/intelligent-menu/generate-enterprise-buffet
 */
export async function generateEnterpriseBuffet(req, res) {
  try {
    const {
      numMeals = 150,
      menuStructure = 'plat_seul',
      dietaryRestrictions = [],
      allergens = []
    } = req.body;

    console.log(`🍽️ Génération menu buffet entreprise pour ${numMeals} personnes`);
    console.log(`📋 Structure: ${menuStructure}`);

    const peoplePerOption = Math.floor(numMeals / 3); // Diviser en 3 options
    const remainder = numMeals % 3;

    // 1. GÉNÉRER 3 OPTIONS DE PLATS COMPLETS
    const menuOptions = [];
    
    // Option 1: Viande/Volaille + Féculent 1
    const option1Protein = await selectOneDish(['viande', 'volaille'], allergens, dietaryRestrictions, 'poulet') ||
                           await selectOneDish(['viande', 'volaille'], allergens, dietaryRestrictions);
    const option1Side = await selectOneDish(['feculent'], allergens, dietaryRestrictions, 'riz');
    const option1Sauce = await selectOneDish(['autre'], allergens, dietaryRestrictions, 'champignon');
    
    if (option1Protein) {
      menuOptions.push({
        name: `Option 1 - ${option1Protein.title}`,
        servings: peoplePerOption + (remainder > 0 ? 1 : 0),
        dishes: [
          formatDish(option1Protein, 'Plat principal'),
          option1Side ? formatDish(option1Side, 'Accompagnement') : null,
          option1Sauce ? formatDish(option1Sauce, 'Sauce') : null
        ].filter(Boolean)
      });
    }

    // Option 2: Poisson + Féculent 2 + Légumes
    const option2Protein = await selectOneDish(['poisson'], allergens, dietaryRestrictions, 'pané') ||
                           await selectOneDish(['poisson'], allergens, dietaryRestrictions);
    const option2Side = await selectOneDish(['feculent'], allergens, dietaryRestrictions, 'purée');
    const option2Veg = await selectOneDish(['legumes'], allergens, dietaryRestrictions);
    
    if (option2Protein) {
      menuOptions.push({
        name: `Option 2 - ${option2Protein.title}`,
        servings: peoplePerOption + (remainder > 1 ? 1 : 0),
        dishes: [
          formatDish(option2Protein, 'Plat principal'),
          option2Side ? formatDish(option2Side, 'Accompagnement') : null,
          option2Veg ? formatDish(option2Veg, 'Légumes') : null
        ].filter(Boolean)
      });
    }

    // Option 3: Viande + Féculent 3 + Sauce
    const option3Protein = await selectOneDish(['viande'], allergens, dietaryRestrictions, 'boulette') ||
                           await selectOneDish(['viande'], allergens, dietaryRestrictions);
    const option3Side = await selectOneDish(['feculent'], allergens, dietaryRestrictions, 'frites');
    const option3Sauce = await selectOneDish(['autre'], allergens, dietaryRestrictions, 'tomate');
    
    if (option3Protein) {
      menuOptions.push({
        name: `Option 3 - ${option3Protein.title}`,
        servings: peoplePerOption,
        dishes: [
          formatDish(option3Protein, 'Plat principal'),
          option3Side ? formatDish(option3Side, 'Accompagnement') : null,
          option3Sauce ? formatDish(option3Sauce, 'Sauce') : null
        ].filter(Boolean)
      });
    }

    // 2. BUFFET DE SALADES (commun à tous)
    const saladBar = await Recipe.find({ 
      type: 'vegetarien',
      $or: [
        { title: /salade/i },
        { title: /crudités/i },
        { mealComponent: 'entree' }
      ]
    }).limit(5).lean();

    // 3. DESSERTS VARIÉS
    const desserts = [];
    
    // Dessert 1: Tarte ou pâtisserie
    const dessert1 = await selectOneDish(['dessert'], allergens, dietaryRestrictions, 'tarte') ||
                     await selectOneDish(['dessert'], allergens, dietaryRestrictions, 'pomme');
    if (dessert1) {
      desserts.push({
        ...formatDish(dessert1, 'Dessert'),
        servings: peoplePerOption,
        details: "Avec recette de pâte complète incluse"
      });
    }

    // Dessert 2: Fruits frais détaillés
    desserts.push({
      name: "Corbeille de Fruits Frais de Saison",
      category: "Dessert",
      servings: peoplePerOption,
      description: `Assortiment de fruits frais pour ${peoplePerOption} personnes`,
      ingredients: [
        { name: "Pommes", quantity: "20", unit: "unités" },
        { name: "Oranges", quantity: "15", unit: "unités" },
        { name: "Bananes", quantity: "15", unit: "unités" }
      ],
      instructions: [
        "Laver tous les fruits",
        "Disposer dans des corbeilles",
        "Servir à température ambiante"
      ],
      nutrition: { 
        calories: 80, 
        proteins: 1, 
        carbs: 20, 
        fats: 0 
      },
      allergens: [],
      dietaryRestrictions: ['vegetarien', 'vegan', 'sans_gluten', 'sans_lactose']
    });

    // Dessert 3: Riz au lait ou yaourt
    const dessert3 = await selectOneDish(['dessert'], allergens, dietaryRestrictions, 'riz') ||
                     await selectOneDish(['dessert'], allergens, dietaryRestrictions, 'lait') ||
                     await selectOneDish(['dessert'], allergens, dietaryRestrictions);
    if (dessert3) {
      desserts.push({
        ...formatDish(dessert3, 'Dessert'),
        servings: peoplePerOption
      });
    }

    // 4. CONSTRUIRE LE MENU BUFFET FINAL
    const buffetMenu = {
      success: true,
      type: 'buffet_entreprise',
      title: `🍽️ Menu Buffet Cantine d'Entreprise`,
      description: `Menu buffet pour ${numMeals} personnes avec 3 options au choix`,
      totalPeople: numMeals,
      structure: menuStructure,
      
      menuOptions: menuOptions,
      
      saladBar: {
        title: "🥗 Buffet de Salades",
        description: "En libre-service pour tous",
        servings: numMeals,
        options: saladBar.map(s => formatDish(s, 'Entrée'))
      },
      
      desserts: {
        title: "🍰 Desserts Variés",
        description: "3 desserts au choix",
        options: desserts
      },
      
      summary: {
        optionsCount: menuOptions.length,
        saladChoices: saladBar.length,
        dessertChoices: desserts.length,
        totalServings: numMeals,
        servingsPerOption: peoplePerOption
      }
    };

    // 5. GÉNÉRER LISTE DE COURSES CONSOLIDÉE
    const allDishes = [
      ...menuOptions.flatMap(opt => opt.dishes),
      ...saladBar,
      ...desserts.filter(d => d.ingredients)
    ];
    
    buffetMenu.shoppingList = consolidateIngredients(allDishes, numMeals);

    console.log(`✅ Menu buffet généré: ${menuOptions.length} options, ${desserts.length} desserts`);
    res.json(buffetMenu);

  } catch (error) {
    console.error('❌ Erreur génération menu buffet:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération du menu buffet',
      details: error.message 
    });
  }
}

/**
 * Sélectionne UNE recette d'un type donné
 */
async function selectOneDish(types, allergens = [], dietaryRestrictions = [], keyword = null) {
  try {
    const query = {};

    // Filtrer par type ou mealComponent
    if (types.some(t => ['viande', 'poisson', 'volaille', 'vegetarien', 'autre'].includes(t))) {
      query.type = { $in: types };
    } else {
      query.mealComponent = { $in: types };
    }

    // Filtrer par mot-clé (ex: "riz", "frites", "tarte")
    if (keyword) {
      query.title = { $regex: keyword, $options: 'i' };
    }

    // Exclure les allergènes
    if (allergens.length > 0) {
      query.allergens = { $nin: allergens };
    }

    let recipe = await Recipe.findOne(query).lean();
    
    // Si pas trouvé avec le mot-clé, réessayer sans
    if (!recipe && keyword) {
      delete query.title;
      recipe = await Recipe.findOne(query).lean();
    }

    return recipe;
  } catch (error) {
    console.error(`Erreur sélection ${types}:`, error);
    return null;
  }
}

/**
 * Formate un plat pour l'affichage
 */
function formatDish(recipe, category = '') {
  if (!recipe) return null;
  
  return {
    id: recipe._id,
    name: recipe.title,
    description: recipe.description || '',
    category: category || formatMealComponent(recipe.mealComponent),
    ingredients: recipe.ingredients || [],
    instructions: recipe.instructions || [],
    nutrition: {
      calories: recipe.nutrition?.calories || 0,
      proteins: recipe.nutrition?.proteins || 0,
      carbs: recipe.nutrition?.carbs || 0,
      fats: recipe.nutrition?.fats || 0
    },
    allergens: recipe.allergens || [],
    dietaryRestrictions: recipe.dietaryRestrictions || []
  };
}

/**
 * Formate le nom du composant de repas
 */
function formatMealComponent(component) {
  const names = {
    'proteine': 'Plat principal (protéine)',
    'feculent': 'Accompagnement (féculent)',
    'legumes': 'Légumes',
    'entree': 'Entrée',
    'soupe': 'Soupe',
    'dessert': 'Dessert',
    'plat_complet': 'Plat complet'
  };
  return names[component] || component;
}

/**
 * Consolide les ingrédients de plusieurs recettes
 */
function consolidateIngredients(recipes, numPeople) {
  const ingredientsMap = new Map();

  recipes.forEach(recipe => {
    if (!recipe || !recipe.ingredients) return;

    recipe.ingredients.forEach(ing => {
      const key = (ing.name?.toLowerCase() || ing.item?.toLowerCase() || '').trim();
      if (!key) return;

      if (ingredientsMap.has(key)) {
        const existing = ingredientsMap.get(key);
        const qty = parseFloat(ing.quantity) || parseFloat(ing.quantite) || 0;
        existing.quantity = (parseFloat(existing.quantity) || 0) + qty;
      } else {
        ingredientsMap.set(key, {
          name: ing.name || ing.item,
          quantity: Math.ceil((parseFloat(ing.quantity) || parseFloat(ing.quantite) || 0) * numPeople / 100),
          unit: ing.unit || ing.mesure || 'unité'
        });
      }
    });
  });

  return Array.from(ingredientsMap.values())
    .filter(ing => ing.quantity > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}
