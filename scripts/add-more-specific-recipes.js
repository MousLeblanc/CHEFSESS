// scripts/add-more-specific-recipes.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Recipe from '../recipe.model.js';

dotenv.config();

// Recettes spécifiques pour combinaisons de filtres
const specificRecipes = [
  // === DIABÈTE + SANS SEL + RICHE EN CALCIUM ===
  {
    title: "Salade de chou-fleur aux amandes",
    description: "Salade de chou-fleur cru avec amandes, riche en calcium et sans sel",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Chou-fleur", quantity: 1, unit: "pièce" },
      { name: "Amandes effilées", quantity: 50, unit: "g" },
      { name: "Fromage râpé", quantity: 60, unit: "g" },
      { name: "Vinaigre balsamique", quantity: 2, unit: "c.à.s" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" },
      { name: "Persil frais", quantity: 15, unit: "g" }
    ],
    instructions: [
      "Râper le chou-fleur cru finement",
      "Torréfier les amandes à sec",
      "Mélanger avec le fromage et les herbes",
      "Assaisonner avec vinaigre et huile"
    ],
    nutrition: { calories: 180, proteins: 8, carbs: 12, fats: 12 },
    medicalConditions: ["diabete"],
    dietaryRestrictions: ["sans_sel", "riche_en_calcium"],
    allergens: ["fruits_a_coque", "lactose"],
    texture: "normale",
    mealComponent: "entree",
    tags: ["diabete", "sans_sel", "calcium", "chou-fleur"]
  },

  {
    title: "Smoothie vert aux épinards",
    description: "Smoothie d'épinards avec fruits, sans sucre ajouté, riche en calcium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 2,
    ingredients: [
      { name: "Épinards frais", quantity: 100, unit: "g" },
      { name: "Banane", quantity: 1, unit: "pièce" },
      { name: "Yaourt nature", quantity: 150, unit: "ml" },
      { name: "Amandes", quantity: 20, unit: "g" },
      { name: "Eau", quantity: 100, unit: "ml" }
    ],
    instructions: [
      "Laver les épinards",
      "Mixer tous les ingrédients",
      "Servir frais"
    ],
    nutrition: { calories: 120, proteins: 6, carbs: 15, fats: 4 },
    medicalConditions: ["diabete"],
    dietaryRestrictions: ["pauvre_en_sucre", "riche_en_calcium"],
    allergens: ["lactose", "fruits_a_coque"],
    texture: "mixee",
    mealComponent: "dessert",
    tags: ["diabete", "smoothie", "epinards", "calcium"]
  },

  // === HYPERTENSION + SANS LACTOSE ===
  {
    title: "Poisson vapeur aux légumes",
    description: "Filet de poisson blanc cuit à la vapeur avec légumes, sans sel ni lactose",
    ageGroup: "18+",
    type: "poisson",
    category: "poisson",
    servings: 4,
    ingredients: [
      { name: "Filet de colin", quantity: 600, unit: "g" },
      { name: "Courgettes", quantity: 2, unit: "pièces" },
      { name: "Carottes", quantity: 2, unit: "pièces" },
      { name: "Citron", quantity: 1, unit: "pièce" },
      { name: "Herbes de Provence", quantity: 1, unit: "c.à.s" },
      { name: "Huile d'olive", quantity: 2, unit: "c.à.s" }
    ],
    instructions: [
      "Couper les légumes en rondelles",
      "Disposer dans un panier vapeur",
      "Placer le poisson sur les légumes",
      "Arroser de citron et herbes, cuire 15 minutes"
    ],
    nutrition: { calories: 200, proteins: 35, carbs: 8, fats: 4 },
    medicalConditions: ["hypertension"],
    dietaryRestrictions: ["sans_sel"],
    allergens: ["poisson"],
    texture: "normale",
    mealComponent: "plat_complet",
    tags: ["hypertension", "sans_sel", "poisson", "vapeur"]
  },

  {
    title: "Risotto aux légumes sans lactose",
    description: "Risotto crémeux aux légumes, sans produits laitiers, pauvre en sodium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Riz arborio", quantity: 300, unit: "g" },
      { name: "Courgettes", quantity: 200, unit: "g" },
      { name: "Tomates", quantity: 200, unit: "g" },
      { name: "Bouillon de légumes", quantity: 1, unit: "l" },
      { name: "Oignon", quantity: 1, unit: "pièce" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" }
    ],
    instructions: [
      "Faire revenir l'oignon dans l'huile",
      "Ajouter le riz et le bouillon progressivement",
      "Incorporer les légumes en fin de cuisson",
      "Servir chaud"
    ],
    nutrition: { calories: 320, proteins: 8, carbs: 60, fats: 6 },
    medicalConditions: ["hypertension"],
    dietaryRestrictions: ["sans_sel"],
    allergens: [],
    texture: "normale",
    mealComponent: "feculent",
    tags: ["hypertension", "sans_sel", "risotto", "legumes"]
  },

  // === CHOLESTÉROL + PAUVRE EN GRAISSE ===
  {
    title: "Saumon grillé aux herbes",
    description: "Filet de saumon grillé avec herbes fraîches, pauvre en graisses saturées",
    ageGroup: "18+",
    type: "poisson",
    category: "poisson",
    servings: 4,
    ingredients: [
      { name: "Filet de saumon", quantity: 600, unit: "g" },
      { name: "Aneth frais", quantity: 20, unit: "g" },
      { name: "Citron", quantity: 1, unit: "pièce" },
      { name: "Huile d'olive", quantity: 1, unit: "c.à.s" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    instructions: [
      "Préchauffer le grill à 200°C",
      "Badigeonner le saumon d'huile",
      "Griller 8 minutes de chaque côté",
      "Servir avec aneth et citron"
    ],
    nutrition: { calories: 250, proteins: 40, carbs: 2, fats: 10 },
    medicalConditions: ["cholesterol"],
    dietaryRestrictions: ["pauvre_en_graisse"],
    allergens: ["poisson"],
    texture: "normale",
    mealComponent: "proteine",
    tags: ["cholesterol", "saumon", "herbes", "grille"]
  },

  {
    title: "Salade de quinoa aux légumes",
    description: "Salade de quinoa avec légumes croquants, pauvre en graisses",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Quinoa", quantity: 200, unit: "g" },
      { name: "Concombre", quantity: 1, unit: "pièce" },
      { name: "Tomates cerises", quantity: 200, unit: "g" },
      { name: "Poivron rouge", quantity: 1, unit: "pièce" },
      { name: "Vinaigre balsamique", quantity: 2, unit: "c.à.s" },
      { name: "Huile d'olive", quantity: 1, unit: "c.à.s" }
    ],
    instructions: [
      "Cuire le quinoa selon les instructions",
      "Couper les légumes en dés",
      "Mélanger le quinoa refroidi avec les légumes",
      "Assaisonner avec vinaigre et huile"
    ],
    nutrition: { calories: 200, proteins: 8, carbs: 35, fats: 4 },
    medicalConditions: ["cholesterol"],
    dietaryRestrictions: ["pauvre_en_graisse"],
    allergens: [],
    texture: "normale",
    mealComponent: "feculent",
    tags: ["cholesterol", "quinoa", "legumes", "salade"]
  },

  // === TEXTURE HACHÉE + RICHE EN CALCIUM ===
  {
    title: "Hachis de légumes au fromage",
    description: "Mélange de légumes hachés avec fromage, riche en calcium et tendre",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Pommes de terre", quantity: 300, unit: "g" },
      { name: "Carottes", quantity: 200, unit: "g" },
      { name: "Fromage râpé", quantity: 80, unit: "g" },
      { name: "Beurre", quantity: 20, unit: "g" },
      { name: "Lait", quantity: 100, unit: "ml" },
      { name: "Noix de muscade", quantity: 1, unit: "pincée" }
    ],
    instructions: [
      "Cuire les légumes à l'eau",
      "Égoutter et hacher très finement",
      "Mélanger avec beurre, lait et fromage",
      "Assaisonner avec muscade"
    ],
    nutrition: { calories: 200, proteins: 8, carbs: 25, fats: 8 },
    medicalConditions: [],
    dietaryRestrictions: ["riche_en_calcium"],
    allergens: ["lactose"],
    texture: "hachee",
    mealComponent: "legumes",
    tags: ["hache", "calcium", "legumes", "fromage"]
  },

  // === TEXTURE MIXÉE + SANS LACTOSE ===
  {
    title: "Velouté de potiron aux épices",
    description: "Soupe onctueuse de potiron avec épices, sans lactose",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Potiron", quantity: 600, unit: "g" },
      { name: "Oignon", quantity: 1, unit: "pièce" },
      { name: "Bouillon de légumes", quantity: 500, unit: "ml" },
      { name: "Curry en poudre", quantity: 1, unit: "c.à.s" },
      { name: "Huile de coco", quantity: 2, unit: "c.à.s" },
      { name: "Coriandre fraîche", quantity: 10, unit: "g" }
    ],
    instructions: [
      "Couper le potiron en cubes",
      "Faire revenir l'oignon dans l'huile de coco",
      "Ajouter le potiron et le bouillon",
      "Laisser mijoter 30 minutes, mixer et assaisonner"
    ],
    nutrition: { calories: 120, proteins: 3, carbs: 20, fats: 4 },
    medicalConditions: [],
    dietaryRestrictions: [],
    allergens: [],
    texture: "mixee",
    mealComponent: "soupe",
    tags: ["mixee", "potiron", "epices", "veloute"]
  },

  // === DIABÈTE + HYPERTENSION + SANS LACTOSE ===
  {
    title: "Poulet aux légumes vapeur",
    description: "Blanc de poulet avec légumes cuits à la vapeur, sans sel ni lactose",
    ageGroup: "18+",
    type: "volaille",
    category: "volaille",
    servings: 4,
    ingredients: [
      { name: "Blanc de poulet", quantity: 600, unit: "g" },
      { name: "Brocolis", quantity: 300, unit: "g" },
      { name: "Carottes", quantity: 200, unit: "g" },
      { name: "Citron", quantity: 1, unit: "pièce" },
      { name: "Thym frais", quantity: 10, unit: "g" },
      { name: "Huile d'olive", quantity: 2, unit: "c.à.s" }
    ],
    instructions: [
      "Couper les légumes en morceaux",
      "Disposer dans un panier vapeur",
      "Placer le poulet sur les légumes",
      "Arroser de citron et thym, cuire 20 minutes"
    ],
    nutrition: { calories: 220, proteins: 40, carbs: 8, fats: 4 },
    medicalConditions: ["diabete", "hypertension"],
    dietaryRestrictions: ["sans_sel", "pauvre_en_sucre"],
    allergens: [],
    texture: "normale",
    mealComponent: "plat_complet",
    tags: ["diabete", "hypertension", "poulet", "vapeur"]
  },

  // === RICHE EN CALCIUM + SANS GLUTEN ===
  {
    title: "Gratin de légumes sans gluten",
    description: "Gratin de légumes avec sauce béchamel sans gluten, riche en calcium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Chou-fleur", quantity: 400, unit: "g" },
      { name: "Brocolis", quantity: 300, unit: "g" },
      { name: "Fromage râpé", quantity: 100, unit: "g" },
      { name: "Farine de riz", quantity: 40, unit: "g" },
      { name: "Lait", quantity: 500, unit: "ml" },
      { name: "Beurre", quantity: 40, unit: "g" }
    ],
    instructions: [
      "Cuire les légumes à la vapeur",
      "Préparer la béchamel avec farine de riz",
      "Disposer les légumes dans un plat",
      "Napper de béchamel et fromage, gratiner"
    ],
    nutrition: { calories: 280, proteins: 15, carbs: 20, fats: 16 },
    medicalConditions: [],
    dietaryRestrictions: ["riche_en_calcium", "sans_gluten"],
    allergens: ["lactose"],
    texture: "normale",
    mealComponent: "legumes",
    tags: ["calcium", "sans_gluten", "gratin", "legumes"]
  },

  // === TEXTURE TENDRE + DIABÈTE ===
  {
    title: "Compote de pommes aux épices",
    description: "Compote de pommes cuite lentement, sans sucre ajouté, très tendre",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Pommes", quantity: 800, unit: "g" },
      { name: "Cannelle", quantity: 1, unit: "c.à.c" },
      { name: "Gingembre", quantity: 1, unit: "c.à.c" },
      { name: "Eau", quantity: 100, unit: "ml" },
      { name: "Vanille", quantity: 1, unit: "gousse" }
    ],
    instructions: [
      "Éplucher et couper les pommes",
      "Mettre dans une casserole avec l'eau",
      "Ajouter les épices et la vanille",
      "Cuire à feu doux 45 minutes en remuant"
    ],
    nutrition: { calories: 120, proteins: 1, carbs: 30, fats: 0 },
    medicalConditions: ["diabete"],
    dietaryRestrictions: ["pauvre_en_sucre"],
    allergens: [],
    texture: "tendre",
    mealComponent: "dessert",
    tags: ["diabete", "compote", "pommes", "tendre"]
  },

  // === HYPERTENSION + RICHE EN CALCIUM + SANS LACTOSE ===
  {
    title: "Salade de légumes verts aux amandes",
    description: "Salade de légumes verts avec amandes, sans sel, riche en calcium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Épinards frais", quantity: 200, unit: "g" },
      { name: "Roquette", quantity: 100, unit: "g" },
      { name: "Amandes effilées", quantity: 60, unit: "g" },
      { name: "Avocat", quantity: 1, unit: "pièce" },
      { name: "Vinaigre balsamique", quantity: 2, unit: "c.à.s" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" }
    ],
    instructions: [
      "Laver et essorer les légumes verts",
      "Couper l'avocat en dés",
      "Torréfier les amandes",
      "Mélanger et assaisonner"
    ],
    nutrition: { calories: 200, proteins: 6, carbs: 12, fats: 16 },
    medicalConditions: ["hypertension"],
    dietaryRestrictions: ["sans_sel", "riche_en_calcium"],
    allergens: ["fruits_a_coque"],
    texture: "normale",
    mealComponent: "entree",
    tags: ["hypertension", "sans_sel", "calcium", "legumes_verts"]
  }
];

async function addSpecificRecipes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log(`🔄 Ajout de ${specificRecipes.length} recettes spécifiques...`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const recipeData of specificRecipes) {
      // Vérifier si la recette existe déjà
      const existingRecipe = await Recipe.findOne({ title: recipeData.title });
      
      if (existingRecipe) {
        console.log(`⏭️  Recette existante ignorée: ${recipeData.title}`);
        skippedCount++;
        continue;
      }

      // Créer la nouvelle recette
      const newRecipe = new Recipe(recipeData);
      await newRecipe.save();
      console.log(`➕ Recette ajoutée: ${recipeData.title}`);
      addedCount++;
    }

    console.log(`\n📊 Résumé:`);
    console.log(`✅ ${addedCount} recettes ajoutées`);
    console.log(`⏭️  ${skippedCount} recettes déjà existantes`);

    // Vérifier les statistiques finales
    console.log('\n📊 Statistiques finales:');
    
    const totalRecipes = await Recipe.countDocuments();
    console.log(`📚 Total recettes: ${totalRecipes}`);

    // Test de compatibilité pour les filtres problématiques
    console.log('\n🧪 Test de compatibilité:');
    
    const testFilters = {
      diabete: { medicalConditions: ['diabete'] },
      hypertension: { medicalConditions: ['hypertension'] },
      sans_sel: { dietaryRestrictions: ['sans_sel'] },
      riche_en_calcium: { dietaryRestrictions: ['riche_en_calcium'] },
      sans_lactose: { allergens: { $nin: ['lactose'] } },
      diabete_hypertension: { 
        medicalConditions: { $in: ['diabete', 'hypertension'] },
        dietaryRestrictions: { $in: ['sans_sel', 'riche_en_calcium'] },
        allergens: { $nin: ['lactose'] }
      }
    };

    for (const [filterName, filter] of Object.entries(testFilters)) {
      const count = await Recipe.countDocuments(filter);
      console.log(`  ${filterName}: ${count} recettes compatibles`);
    }

    console.log('\n🎉 Ajout des recettes spécifiques terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des recettes:', error);
  } finally {
    await mongoose.connection.close();
  }
}

addSpecificRecipes();
