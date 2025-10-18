// scripts/inject-recipes-atlas.js
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Recipe from '../recipe.model.js';

// URI de connexion MongoDB Atlas
const MONGODB_URI = 'mongodb+srv://MousLeblanc:P%4055w0rdM0ng0db@ccluster0.wyfanez.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Recettes médicales spécialisées à ajouter
const medicalRecipes = [
  {
    title: "Saumon vapeur aux herbes et légumes verts",
    description: "Un plat léger et nutritif, idéal pour les régimes sans sel et pauvres en sucre, adapté aux personnes diabétiques et hypertendues.",
    ageGroup: "18+",
    type: "poisson",
    mealComponent: "plat_complet",
    servings: 4,
    ingredients: [
      { name: "Filet de saumon", quantity: 600, unit: "g" },
      { name: "Brocoli", quantity: 300, unit: "g" },
      { name: "Haricots verts", quantity: 300, unit: "g" },
      { name: "Citron", quantity: 1, unit: "unité" },
      { name: "Aneth frais", quantity: 2, unit: "brins" },
      { name: "Huile d'olive", quantity: 2, unit: "cuillères à soupe" }
    ],
    instructions: ["Cuire le saumon et les légumes à la vapeur.", "Assaisonner avec du jus de citron et de l'aneth."],
    nutrition: { calories: 350, proteins: 30, carbs: 15, fats: 18 },
    allergens: ["poisson"],
    dietaryRestrictions: ["sans_sel", "pauvre_en_sucre"],
    medicalConditions: ["diabete_type2", "hypertension"],
    texture: "normale",
    nutritionalProfile: ["equilibre_standard"],
    originalId: "atlas_med_1"
  },
  {
    title: "Purée de carottes et pommes de terre sans sel",
    description: "Une purée douce et crémeuse, parfaite pour les régimes hyposodés et les personnes en convalescence.",
    ageGroup: "18+",
    type: "vegetarien",
    mealComponent: "legumes",
    servings: 4,
    ingredients: [
      { name: "Carottes", quantity: 400, unit: "g" },
      { name: "Pommes de terre", quantity: 300, unit: "g" },
      { name: "Lait demi-écrémé", quantity: 200, unit: "ml" },
      { name: "Beurre", quantity: 20, unit: "g" },
      { name: "Muscade", quantity: 1, unit: "pincée" }
    ],
    instructions: ["Cuire les légumes à l'eau.", "Mixer avec le lait et le beurre.", "Assaisonner avec la muscade."],
    nutrition: { calories: 180, proteins: 6, carbs: 35, fats: 3 },
    allergens: ["lactose"],
    dietaryRestrictions: ["sans_sel", "vegetarien"],
    medicalConditions: ["hypertension", "post_operatoire"],
    texture: "mixée",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard"],
    originalId: "atlas_med_2"
  },
  {
    title: "Compote de pommes sans sucre ajouté",
    description: "Une compote naturelle, idéale pour les régimes diabétiques et les personnes âgées.",
    ageGroup: "18+",
    type: "vegetarien",
    mealComponent: "dessert",
    servings: 4,
    ingredients: [
      { name: "Pommes", quantity: 800, unit: "g" },
      { name: "Cannelle", quantity: 1, unit: "cuillère à café" },
      { name: "Eau", quantity: 100, unit: "ml" }
    ],
    instructions: ["Éplucher et couper les pommes.", "Cuire à feu doux avec l'eau et la cannelle.", "Mixer jusqu'à obtenir une compote lisse."],
    nutrition: { calories: 120, proteins: 1, carbs: 30, fats: 0 },
    allergens: [],
    dietaryRestrictions: ["vegetarien"],
    medicalConditions: ["diabete_type2", "diabete_type1"],
    texture: "mixée",
    swallowing: "normale",
    nutritionalProfile: ["sans_sucre_ajoute"],
    originalId: "atlas_med_3"
  },
  {
    title: "Bouillon de légumes enrichi en calcium",
    description: "Un bouillon nutritif et réconfortant, enrichi en calcium pour les personnes âgées.",
    ageGroup: "18+",
    type: "vegetarien",
    mealComponent: "soupe",
    servings: 4,
    ingredients: [
      { name: "Eau", quantity: 1000, unit: "ml" },
      { name: "Carottes", quantity: 200, unit: "g" },
      { name: "Poireaux", quantity: 100, unit: "g" },
      { name: "Céleri", quantity: 100, unit: "g" },
      { name: "Lait en poudre", quantity: 50, unit: "g" },
      { name: "Persil", quantity: 2, unit: "brins" }
    ],
    instructions: ["Faire bouillir les légumes dans l'eau.", "Ajouter le lait en poudre.", "Mixer et filtrer.", "Parsemer de persil."],
    nutrition: { calories: 80, proteins: 4, carbs: 12, fats: 2 },
    allergens: ["lactose"],
    dietaryRestrictions: ["vegetarien", "riche_en_calcium"],
    medicalConditions: ["denutrition"],
    texture: "liquide",
    swallowing: "normale",
    nutritionalProfile: ["riche_en_calcium"],
    originalId: "atlas_med_4"
  },
  {
    title: "Omelette aux herbes sans sel",
    description: "Une omelette légère et savoureuse, adaptée aux régimes hyposodés.",
    ageGroup: "18+",
    type: "vegetarien",
    mealComponent: "proteine",
    servings: 2,
    ingredients: [
      { name: "Œufs", quantity: 4, unit: "unité" },
      { name: "Ciboulette", quantity: 2, unit: "brins" },
      { name: "Persil", quantity: 2, unit: "brins" },
      { name: "Huile d'olive", quantity: 1, unit: "cuillère à soupe" }
    ],
    instructions: ["Battre les œufs avec les herbes.", "Cuire dans une poêle huilée.", "Plier en deux."],
    nutrition: { calories: 200, proteins: 16, carbs: 2, fats: 14 },
    allergens: ["oeufs"],
    dietaryRestrictions: ["sans_sel", "vegetarien"],
    medicalConditions: ["hypertension"],
    texture: "normale",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard"],
    originalId: "atlas_med_5"
  },
  {
    title: "Riz au lait sans lactose",
    description: "Un dessert crémeux adapté aux intolérants au lactose, enrichi en calcium.",
    ageGroup: "18+",
    type: "vegetarien",
    mealComponent: "dessert",
    servings: 4,
    ingredients: [
      { name: "Riz rond", quantity: 100, unit: "g" },
      { name: "Lait de coco", quantity: 400, unit: "ml" },
      { name: "Eau", quantity: 200, unit: "ml" },
      { name: "Sucre de coco", quantity: 30, unit: "g" },
      { name: "Cannelle", quantity: 1, unit: "cuillère à café" }
    ],
    instructions: ["Cuire le riz dans l'eau et le lait de coco.", "Ajouter le sucre et la cannelle.", "Laisser refroidir."],
    nutrition: { calories: 180, proteins: 3, carbs: 25, fats: 8 },
    allergens: [],
    dietaryRestrictions: ["sans_lactose", "vegetarien"],
    medicalConditions: [],
    texture: "normale",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard"],
    originalId: "atlas_med_6"
  },
  {
    title: "Purée de légumes verts mixée",
    description: "Une purée de légumes verts adaptée aux personnes en convalescence ou avec troubles de déglutition.",
    ageGroup: "18+",
    type: "vegetarien",
    mealComponent: "legumes",
    servings: 4,
    ingredients: [
      { name: "Épinards", quantity: 300, unit: "g" },
      { name: "Courgettes", quantity: 200, unit: "g" },
      { name: "Lait demi-écrémé", quantity: 150, unit: "ml" },
      { name: "Beurre", quantity: 15, unit: "g" },
      { name: "Muscade", quantity: 1, unit: "pincée" }
    ],
    instructions: ["Cuire les légumes à la vapeur.", "Mixer finement avec le lait et le beurre.", "Assaisonner avec la muscade."],
    nutrition: { calories: 90, proteins: 5, carbs: 8, fats: 4 },
    allergens: ["lactose"],
    dietaryRestrictions: ["vegetarien"],
    medicalConditions: ["post_operatoire", "dysphagie"],
    texture: "mixée",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard"],
    originalId: "atlas_med_7"
  },
  {
    title: "Boulettes de poisson hachées",
    description: "Des boulettes de poisson tendres, idéales pour les personnes âgées ou en convalescence.",
    ageGroup: "18+",
    type: "poisson",
    mealComponent: "proteine",
    servings: 4,
    ingredients: [
      { name: "Filet de cabillaud", quantity: 400, unit: "g" },
      { name: "Pain de mie", quantity: 2, unit: "tranches" },
      { name: "Lait", quantity: 100, unit: "ml" },
      { name: "Œuf", quantity: 1, unit: "unité" },
      { name: "Persil", quantity: 2, unit: "brins" },
      { name: "Huile d'olive", quantity: 2, unit: "cuillères à soupe" }
    ],
    instructions: ["Tremper le pain dans le lait.", "Hacher le poisson avec le pain et l'œuf.", "Former des boulettes.", "Cuire à la poêle."],
    nutrition: { calories: 220, proteins: 25, carbs: 8, fats: 10 },
    allergens: ["poisson", "oeufs", "lactose", "gluten"],
    dietaryRestrictions: [],
    medicalConditions: ["post_operatoire"],
    texture: "hachée",
    swallowing: "normale",
    nutritionalProfile: ["hyperproteine"],
    originalId: "atlas_med_8"
  }
];

async function injectRecipesToAtlas() {
  try {
    console.log('🔄 Connexion à MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB Atlas');

    console.log(`🔄 Ajout de ${medicalRecipes.length} recettes médicales spécialisées...`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const recipeData of medicalRecipes) {
      // Vérifier si une recette avec le même originalId existe déjà
      const existingRecipe = await Recipe.findOne({ originalId: recipeData.originalId });

      if (existingRecipe) {
        console.log(`⏭️  Recette existante ignorée: ${recipeData.title}`);
        skippedCount++;
        continue;
      }

      const newRecipe = new Recipe(recipeData);
      await newRecipe.save();
      console.log(`➕ Recette ajoutée: ${newRecipe.title}`);
      addedCount++;
    }

    console.log(`\n📊 Résumé:`);
    console.log(`✅ ${addedCount} recettes ajoutées`);
    console.log(`⏭️  ${skippedCount} recettes déjà existantes`);
    
    // Statistiques finales
    const totalRecipes = await Recipe.countDocuments();
    console.log(`\n📊 Statistiques finales:`);
    console.log(`📚 Total recettes: ${totalRecipes}`);

    // Statistiques par filtre
    const sansSelCount = await Recipe.countDocuments({ dietaryRestrictions: 'sans_sel' });
    const diabeteCount = await Recipe.countDocuments({ medicalConditions: 'diabete_type2' });
    const hypertensionCount = await Recipe.countDocuments({ medicalConditions: 'hypertension' });
    const mixeeCount = await Recipe.countDocuments({ texture: 'mixée' });

    console.log(`\n🔍 Recettes par filtre:`);
    console.log(`🥗 Sans sel: ${sansSelCount}`);
    console.log(`🍯 Diabète type 2: ${diabeteCount}`);
    console.log(`❤️  Hypertension: ${hypertensionCount}`);
    console.log(`🥄 Texture mixée: ${mixeeCount}`);

    console.log('\n🎉 Injection des recettes dans MongoDB Atlas terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'injection des recettes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion fermée');
  }
}

injectRecipesToAtlas();
