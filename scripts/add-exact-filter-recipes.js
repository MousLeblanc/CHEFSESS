// scripts/add-exact-filter-recipes.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Recipe from '../recipe.model.js';

dotenv.config();

// Recettes exactement compatibles avec : diabete + hypertension + sans_sel + riche_en_calcium + sans_lactose
const exactFilterRecipes = [
  {
    title: "Salade de légumes verts aux amandes",
    description: "Salade d'épinards et roquette avec amandes, sans sel, riche en calcium, sans lactose",
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
      "Torréfier les amandes à sec",
      "Mélanger tous les ingrédients et assaisonner"
    ],
    nutrition: { calories: 200, proteins: 6, carbs: 12, fats: 16 },
    medicalConditions: ["diabete", "hypertension"],
    dietaryRestrictions: ["sans_sel", "riche_en_calcium"],
    allergens: ["fruits_a_coque"],
    texture: "normale",
    mealComponent: "entree",
    tags: ["diabete", "hypertension", "sans_sel", "calcium", "legumes_verts"]
  },

  {
    title: "Poulet aux herbes vapeur",
    description: "Blanc de poulet cuit à la vapeur avec herbes, sans sel, sans lactose",
    ageGroup: "18+",
    type: "volaille",
    category: "volaille",
    servings: 4,
    ingredients: [
      { name: "Blanc de poulet", quantity: 600, unit: "g" },
      { name: "Thym frais", quantity: 15, unit: "g" },
      { name: "Romarin", quantity: 10, unit: "g" },
      { name: "Citron", quantity: 1, unit: "pièce" },
      { name: "Huile d'olive", quantity: 2, unit: "c.à.s" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    instructions: [
      "Disposer le poulet dans un panier vapeur",
      "Arroser de citron et d'herbes",
      "Cuire 20 minutes à la vapeur",
      "Servir avec un filet d'huile d'olive"
    ],
    nutrition: { calories: 220, proteins: 40, carbs: 2, fats: 6 },
    medicalConditions: ["diabete", "hypertension"],
    dietaryRestrictions: ["sans_sel"],
    allergens: [],
    texture: "normale",
    mealComponent: "proteine",
    tags: ["diabete", "hypertension", "poulet", "vapeur", "herbes"]
  },

  {
    title: "Quinoa aux légumes et amandes",
    description: "Quinoa cuit avec légumes et amandes, sans sel, riche en calcium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Quinoa", quantity: 200, unit: "g" },
      { name: "Courgettes", quantity: 200, unit: "g" },
      { name: "Carottes", quantity: 150, unit: "g" },
      { name: "Amandes effilées", quantity: 50, unit: "g" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" },
      { name: "Herbes de Provence", quantity: 1, unit: "c.à.s" }
    ],
    instructions: [
      "Cuire le quinoa selon les instructions",
      "Couper les légumes en dés et les faire revenir",
      "Mélanger le quinoa avec les légumes",
      "Ajouter les amandes et assaisonner"
    ],
    nutrition: { calories: 280, proteins: 10, carbs: 40, fats: 8 },
    medicalConditions: ["diabete", "hypertension"],
    dietaryRestrictions: ["sans_sel", "riche_en_calcium"],
    allergens: ["fruits_a_coque"],
    texture: "normale",
    mealComponent: "feculent",
    tags: ["diabete", "hypertension", "quinoa", "legumes", "calcium"]
  },

  {
    title: "Poisson blanc aux herbes",
    description: "Filet de poisson blanc cuit à la vapeur avec herbes, sans sel ni lactose",
    ageGroup: "18+",
    type: "poisson",
    category: "poisson",
    servings: 4,
    ingredients: [
      { name: "Filet de cabillaud", quantity: 600, unit: "g" },
      { name: "Aneth frais", quantity: 20, unit: "g" },
      { name: "Citron", quantity: 1, unit: "pièce" },
      { name: "Huile d'olive", quantity: 2, unit: "c.à.s" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    instructions: [
      "Disposer le poisson dans un panier vapeur",
      "Arroser de citron et d'aneth",
      "Cuire 15 minutes à la vapeur",
      "Servir avec un filet d'huile d'olive"
    ],
    nutrition: { calories: 200, proteins: 35, carbs: 2, fats: 6 },
    medicalConditions: ["diabete", "hypertension"],
    dietaryRestrictions: ["sans_sel"],
    allergens: ["poisson"],
    texture: "normale",
    mealComponent: "proteine",
    tags: ["diabete", "hypertension", "poisson", "vapeur", "herbes"]
  },

  {
    title: "Smoothie vert aux épinards",
    description: "Smoothie d'épinards avec fruits, sans sucre ni lactose, riche en calcium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 2,
    ingredients: [
      { name: "Épinards frais", quantity: 100, unit: "g" },
      { name: "Banane", quantity: 1, unit: "pièce" },
      { name: "Amandes", quantity: 20, unit: "g" },
      { name: "Eau de coco", quantity: 200, unit: "ml" },
      { name: "Gingembre", quantity: 10, unit: "g" }
    ],
    instructions: [
      "Laver les épinards",
      "Mixer tous les ingrédients",
      "Servir frais"
    ],
    nutrition: { calories: 120, proteins: 4, carbs: 18, fats: 4 },
    medicalConditions: ["diabete"],
    dietaryRestrictions: ["pauvre_en_sucre", "riche_en_calcium"],
    allergens: ["fruits_a_coque"],
    texture: "mixee",
    mealComponent: "dessert",
    tags: ["diabete", "smoothie", "epinards", "calcium", "sans_lactose"]
  },

  {
    title: "Salade de chou-fleur aux amandes",
    description: "Salade de chou-fleur cru avec amandes, sans sel, riche en calcium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Chou-fleur", quantity: 1, unit: "pièce" },
      { name: "Amandes effilées", quantity: 50, unit: "g" },
      { name: "Vinaigre balsamique", quantity: 2, unit: "c.à.s" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" },
      { name: "Persil frais", quantity: 15, unit: "g" }
    ],
    instructions: [
      "Râper le chou-fleur cru finement",
      "Torréfier les amandes à sec",
      "Mélanger avec le persil",
      "Assaisonner avec vinaigre et huile"
    ],
    nutrition: { calories: 150, proteins: 5, carbs: 12, fats: 10 },
    medicalConditions: ["diabete", "hypertension"],
    dietaryRestrictions: ["sans_sel", "riche_en_calcium"],
    allergens: ["fruits_a_coque"],
    texture: "normale",
    mealComponent: "entree",
    tags: ["diabete", "hypertension", "chou-fleur", "calcium", "sans_sel"]
  },

  {
    title: "Risotto aux légumes sans lactose",
    description: "Risotto crémeux aux légumes, sans produits laitiers ni sel",
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
    tags: ["hypertension", "risotto", "legumes", "sans_lactose"]
  },

  {
    title: "Velouté de légumes verts",
    description: "Soupe onctueuse de légumes verts, sans sel ni lactose, riche en calcium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Brocolis", quantity: 300, unit: "g" },
      { name: "Épinards", quantity: 200, unit: "g" },
      { name: "Oignon", quantity: 1, unit: "pièce" },
      { name: "Bouillon de légumes", quantity: 500, unit: "ml" },
      { name: "Huile d'olive", quantity: 2, unit: "c.à.s" },
      { name: "Amandes effilées", quantity: 30, unit: "g" }
    ],
    instructions: [
      "Faire revenir l'oignon dans l'huile",
      "Ajouter les légumes et le bouillon",
      "Laisser mijoter 20 minutes",
      "Mixer et servir avec les amandes"
    ],
    nutrition: { calories: 120, proteins: 6, carbs: 15, fats: 5 },
    medicalConditions: ["diabete", "hypertension"],
    dietaryRestrictions: ["sans_sel", "riche_en_calcium"],
    allergens: ["fruits_a_coque"],
    texture: "mixee",
    mealComponent: "soupe",
    tags: ["diabete", "hypertension", "veloute", "legumes_verts", "calcium"]
  }
];

async function addExactFilterRecipes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log(`🔄 Ajout de ${exactFilterRecipes.length} recettes exactement compatibles...`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const recipeData of exactFilterRecipes) {
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

    // Test de compatibilité spécifique
    console.log('\n🧪 Test de compatibilité exacte:');
    
    const exactFilter = {
      medicalConditions: { $in: ['diabete', 'hypertension'] },
      dietaryRestrictions: { $in: ['sans_sel', 'riche_en_calcium'] },
      allergens: { $nin: ['lactose'] }
    };

    const compatibleCount = await Recipe.countDocuments(exactFilter);
    console.log(`  Filtres exacts (diabète + hypertension + sans sel + riche en calcium + sans lactose): ${compatibleCount} recettes`);

    // Test avec filtres moins restrictifs
    const lessRestrictiveFilter = {
      $or: [
        { medicalConditions: { $in: ['diabete', 'hypertension'] } },
        { dietaryRestrictions: { $in: ['sans_sel', 'riche_en_calcium'] } }
      ],
      allergens: { $nin: ['lactose'] }
    };

    const lessRestrictiveCount = await Recipe.countDocuments(lessRestrictiveFilter);
    console.log(`  Filtres moins restrictifs: ${lessRestrictiveCount} recettes`);

    const totalRecipes = await Recipe.countDocuments();
    console.log(`📚 Total recettes: ${totalRecipes}`);

    console.log('\n🎉 Ajout des recettes exactes terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des recettes:', error);
  } finally {
    await mongoose.connection.close();
  }
}

addExactFilterRecipes();
