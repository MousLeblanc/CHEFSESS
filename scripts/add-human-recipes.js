// scripts/add-human-recipes.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Recipe from '../recipe.model.js';

dotenv.config();

// Recettes humaines authentiques pour chaque filtre
const humanRecipes = [
  // === RECETTES POUR DIABÈTE ===
  {
    title: "Salade de lentilles aux légumes",
    description: "Salade de lentilles vertes avec carottes, céleri et vinaigrette légère, idéale pour les diabétiques",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Lentilles vertes", quantity: 200, unit: "g" },
      { name: "Carottes", quantity: 2, unit: "pièces" },
      { name: "Céleri", quantity: 2, unit: "branches" },
      { name: "Oignon rouge", quantity: 1, unit: "pièce" },
      { name: "Vinaigre de cidre", quantity: 2, unit: "c.à.s" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" },
      { name: "Persil frais", quantity: 20, unit: "g" }
    ],
    instructions: [
      "Cuire les lentilles dans l'eau bouillante 20 minutes",
      "Couper les légumes en petits dés",
      "Mélanger tous les ingrédients",
      "Assaisonner avec vinaigre et huile d'olive"
    ],
    nutrition: { calories: 180, proteins: 12, carbs: 25, fats: 4 },
    medicalConditions: ["diabete"],
    dietaryRestrictions: ["pauvre_en_sucre"],
    allergens: [],
    texture: "normale",
    mealComponent: "entree",
    tags: ["diabete", "lentilles", "legumes", "sante"]
  },
  
  {
    title: "Poisson blanc aux herbes",
    description: "Filet de cabillaud cuit au four avec herbes fraîches, sans sucre ajouté",
    ageGroup: "18+",
    type: "poisson",
    category: "poisson",
    servings: 4,
    ingredients: [
      { name: "Filet de cabillaud", quantity: 600, unit: "g" },
      { name: "Basilic frais", quantity: 10, unit: "g" },
      { name: "Thym frais", quantity: 5, unit: "g" },
      { name: "Citron", quantity: 1, unit: "pièce" },
      { name: "Huile d'olive", quantity: 2, unit: "c.à.s" },
      { name: "Ail", quantity: 2, unit: "gousses" }
    ],
    instructions: [
      "Préchauffer le four à 180°C",
      "Disposer le poisson dans un plat",
      "Arroser d'huile et d'herbes",
      "Cuire 15 minutes au four"
    ],
    nutrition: { calories: 200, proteins: 35, carbs: 2, fats: 6 },
    medicalConditions: ["diabete"],
    dietaryRestrictions: ["pauvre_en_sucre"],
    allergens: ["poisson"],
    texture: "normale",
    mealComponent: "proteine",
    tags: ["diabete", "poisson", "herbes", "sante"]
  },

  // === RECETTES POUR HYPERTENSION (SANS SEL) ===
  {
    title: "Pot-au-feu de légumes",
    description: "Bouillon de légumes traditionnel, naturellement pauvre en sodium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 6,
    ingredients: [
      { name: "Pommes de terre", quantity: 400, unit: "g" },
      { name: "Carottes", quantity: 300, unit: "g" },
      { name: "Poireaux", quantity: 2, unit: "pièces" },
      { name: "Navets", quantity: 200, unit: "g" },
      { name: "Chou vert", quantity: 300, unit: "g" },
      { name: "Bouquet garni", quantity: 1, unit: "pièce" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    instructions: [
      "Éplucher et couper tous les légumes",
      "Mettre dans une grande casserole avec le bouquet garni",
      "Couvrir d'eau et porter à ébullition",
      "Laisser mijoter 45 minutes à feu doux"
    ],
    nutrition: { calories: 120, proteins: 4, carbs: 25, fats: 1 },
    medicalConditions: ["hypertension"],
    dietaryRestrictions: ["sans_sel"],
    allergens: [],
    texture: "normale",
    mealComponent: "soupe",
    tags: ["hypertension", "sans_sel", "legumes", "traditionnel"]
  },

  {
    title: "Poulet rôti aux herbes",
    description: "Poulet entier rôti avec herbes de Provence, sans sel ajouté",
    ageGroup: "18+",
    type: "volaille",
    category: "volaille",
    servings: 6,
    ingredients: [
      { name: "Poulet entier", quantity: 1.5, unit: "kg" },
      { name: "Herbes de Provence", quantity: 2, unit: "c.à.s" },
      { name: "Ail", quantity: 4, unit: "gousses" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" },
      { name: "Citron", quantity: 1, unit: "pièce" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    instructions: [
      "Préchauffer le four à 200°C",
      "Badigeonner le poulet d'huile et d'herbes",
      "Enfourner 1h15 en arrosant régulièrement",
      "Laisser reposer 10 minutes avant de servir"
    ],
    nutrition: { calories: 280, proteins: 45, carbs: 2, fats: 10 },
    medicalConditions: ["hypertension"],
    dietaryRestrictions: ["sans_sel"],
    allergens: [],
    texture: "normale",
    mealComponent: "proteine",
    tags: ["hypertension", "sans_sel", "poulet", "herbes"]
  },

  // === RECETTES RICHES EN CALCIUM ===
  {
    title: "Gratin de chou-fleur au fromage",
    description: "Chou-fleur gratiné avec béchamel et fromage râpé, riche en calcium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Chou-fleur", quantity: 1, unit: "pièce" },
      { name: "Fromage râpé", quantity: 100, unit: "g" },
      { name: "Beurre", quantity: 40, unit: "g" },
      { name: "Farine", quantity: 40, unit: "g" },
      { name: "Lait", quantity: 500, unit: "ml" },
      { name: "Muscade", quantity: 1, unit: "pincée" }
    ],
    instructions: [
      "Cuire le chou-fleur à la vapeur 15 minutes",
      "Préparer la béchamel avec beurre, farine et lait",
      "Disposer le chou-fleur dans un plat",
      "Napper de béchamel et fromage, gratiner 20 minutes"
    ],
    nutrition: { calories: 250, proteins: 12, carbs: 15, fats: 16 },
    medicalConditions: [],
    dietaryRestrictions: ["riche_en_calcium"],
    allergens: ["lactose"],
    texture: "normale",
    mealComponent: "legumes",
    tags: ["calcium", "chou-fleur", "gratin", "fromage"]
  },

  {
    title: "Quiche aux épinards",
    description: "Quiche traditionnelle aux épinards et fromage, excellente source de calcium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 6,
    ingredients: [
      { name: "Pâte brisée", quantity: 1, unit: "rondelle" },
      { name: "Épinards frais", quantity: 500, unit: "g" },
      { name: "Œufs", quantity: 3, unit: "pièces" },
      { name: "Crème fraîche", quantity: 200, unit: "ml" },
      { name: "Fromage râpé", quantity: 80, unit: "g" },
      { name: "Noix de muscade", quantity: 1, unit: "pincée" }
    ],
    instructions: [
      "Foncer un moule à tarte avec la pâte",
      "Blanchir les épinards et les égoutter",
      "Battre les œufs avec la crème et le fromage",
      "Disposer les épinards et napper, cuire 30 minutes"
    ],
    nutrition: { calories: 320, proteins: 14, carbs: 20, fats: 22 },
    medicalConditions: [],
    dietaryRestrictions: ["riche_en_calcium"],
    allergens: ["lactose", "oeufs", "gluten"],
    texture: "normale",
    mealComponent: "plat_complet",
    tags: ["calcium", "epinards", "quiche", "fromage"]
  },

  // === RECETTES SANS LACTOSE ===
  {
    title: "Risotto aux champignons",
    description: "Risotto crémeux aux champignons, sans produits laitiers",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Riz arborio", quantity: 300, unit: "g" },
      { name: "Champignons de Paris", quantity: 300, unit: "g" },
      { name: "Bouillon de légumes", quantity: 1, unit: "l" },
      { name: "Oignon", quantity: 1, unit: "pièce" },
      { name: "Vin blanc", quantity: 100, unit: "ml" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" }
    ],
    instructions: [
      "Faire revenir l'oignon dans l'huile",
      "Ajouter le riz et le vin blanc",
      "Ajouter le bouillon progressivement en remuant",
      "Incorporer les champignons en fin de cuisson"
    ],
    nutrition: { calories: 350, proteins: 8, carbs: 65, fats: 6 },
    medicalConditions: [],
    dietaryRestrictions: ["vegetarien"],
    allergens: [],
    texture: "normale",
    mealComponent: "feculent",
    tags: ["sans_lactose", "risotto", "champignons", "italien"]
  },

  {
    title: "Soupe de légumes aux herbes",
    description: "Soupe de légumes de saison, sans lactose, parfaite pour l'hiver",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 6,
    ingredients: [
      { name: "Courgettes", quantity: 2, unit: "pièces" },
      { name: "Tomates", quantity: 3, unit: "pièces" },
      { name: "Oignon", quantity: 1, unit: "pièce" },
      { name: "Ail", quantity: 2, unit: "gousses" },
      { name: "Basilic frais", quantity: 20, unit: "g" },
      { name: "Huile d'olive", quantity: 2, unit: "c.à.s" },
      { name: "Bouillon de légumes", quantity: 1, unit: "l" }
    ],
    instructions: [
      "Couper tous les légumes en morceaux",
      "Faire revenir l'oignon et l'ail dans l'huile",
      "Ajouter les légumes et le bouillon",
      "Laisser mijoter 30 minutes, mixer et ajouter le basilic"
    ],
    nutrition: { calories: 80, proteins: 3, carbs: 12, fats: 3 },
    medicalConditions: [],
    dietaryRestrictions: ["vegetarien"],
    allergens: [],
    texture: "mixee",
    mealComponent: "soupe",
    tags: ["sans_lactose", "soupe", "legumes", "herbes"]
  },

  // === RECETTES POUR CHOLESTÉROL ===
  {
    title: "Saumon grillé aux légumes",
    description: "Filet de saumon grillé avec légumes vapeur, pauvre en graisses saturées",
    ageGroup: "18+",
    type: "poisson",
    category: "poisson",
    servings: 4,
    ingredients: [
      { name: "Filet de saumon", quantity: 600, unit: "g" },
      { name: "Brocolis", quantity: 300, unit: "g" },
      { name: "Carottes", quantity: 200, unit: "g" },
      { name: "Citron", quantity: 1, unit: "pièce" },
      { name: "Aneth frais", quantity: 10, unit: "g" },
      { name: "Huile d'olive", quantity: 2, unit: "c.à.s" }
    ],
    instructions: [
      "Préchauffer le grill à 200°C",
      "Cuire les légumes à la vapeur 10 minutes",
      "Griller le saumon 8 minutes de chaque côté",
      "Servir avec citron et aneth"
    ],
    nutrition: { calories: 280, proteins: 35, carbs: 8, fats: 12 },
    medicalConditions: ["cholesterol"],
    dietaryRestrictions: ["pauvre_en_graisse"],
    allergens: ["poisson"],
    texture: "normale",
    mealComponent: "proteine",
    tags: ["cholesterol", "saumon", "legumes", "sante"]
  },

  // === RECETTES POUR TEXTURE HACHÉE ===
  {
    title: "Hachis de légumes aux herbes",
    description: "Mélange de légumes hachés finement, idéal pour les difficultés de mastication",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Carottes", quantity: 300, unit: "g" },
      { name: "Courgettes", quantity: 200, unit: "g" },
      { name: "Pommes de terre", quantity: 200, unit: "g" },
      { name: "Persil frais", quantity: 15, unit: "g" },
      { name: "Beurre", quantity: 20, unit: "g" },
      { name: "Lait", quantity: 50, unit: "ml" }
    ],
    instructions: [
      "Cuire tous les légumes à l'eau",
      "Égoutter et hacher très finement",
      "Mélanger avec beurre et lait",
      "Assaisonner et ajouter le persil"
    ],
    nutrition: { calories: 120, proteins: 4, carbs: 20, fats: 3 },
    medicalConditions: [],
    dietaryRestrictions: [],
    allergens: ["lactose"],
    texture: "hachee",
    mealComponent: "legumes",
    tags: ["hache", "legumes", "mastication", "tendre"]
  },

  {
    title: "Boulettes de poisson tendres",
    description: "Boulettes de poisson blanc hachées, très tendres et faciles à manger",
    ageGroup: "18+",
    type: "poisson",
    category: "poisson",
    servings: 4,
    ingredients: [
      { name: "Filet de cabillaud", quantity: 400, unit: "g" },
      { name: "Pain de mie", quantity: 2, unit: "tranches" },
      { name: "Lait", quantity: 100, unit: "ml" },
      { name: "Œuf", quantity: 1, unit: "pièce" },
      { name: "Persil", quantity: 10, unit: "g" },
      { name: "Chapelure", quantity: 50, unit: "g" }
    ],
    instructions: [
      "Tremper le pain dans le lait",
      "Hacher finement le poisson",
      "Mélanger avec pain, œuf et persil",
      "Former des boulettes, paner et cuire à la poêle"
    ],
    nutrition: { calories: 200, proteins: 25, carbs: 15, fats: 5 },
    medicalConditions: [],
    dietaryRestrictions: [],
    allergens: ["poisson", "oeufs", "gluten", "lactose"],
    texture: "hachee",
    mealComponent: "proteine",
    tags: ["hache", "poisson", "boulettes", "tendre"]
  },

  // === RECETTES POUR TEXTURE MIXÉE ===
  {
    title: "Purée de légumes variés",
    description: "Purée onctueuse de légumes de saison, texture lisse et crémeuse",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Pommes de terre", quantity: 300, unit: "g" },
      { name: "Carottes", quantity: 200, unit: "g" },
      { name: "Courgettes", quantity: 150, unit: "g" },
      { name: "Beurre", quantity: 30, unit: "g" },
      { name: "Lait", quantity: 100, unit: "ml" },
      { name: "Noix de muscade", quantity: 1, unit: "pincée" }
    ],
    instructions: [
      "Cuire tous les légumes à l'eau",
      "Égoutter et mixer finement",
      "Ajouter beurre et lait progressivement",
      "Assaisonner avec muscade"
    ],
    nutrition: { calories: 150, proteins: 4, carbs: 25, fats: 5 },
    medicalConditions: [],
    dietaryRestrictions: [],
    allergens: ["lactose"],
    texture: "mixee",
    mealComponent: "legumes",
    tags: ["mixee", "legumes", "purée", "onctueux"]
  },

  // === RECETTES VÉGÉTARIENNES ===
  {
    title: "Ratatouille provençale",
    description: "Mélange traditionnel de légumes du soleil, parfaitement équilibré",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 6,
    ingredients: [
      { name: "Aubergines", quantity: 2, unit: "pièces" },
      { name: "Courgettes", quantity: 2, unit: "pièces" },
      { name: "Tomates", quantity: 4, unit: "pièces" },
      { name: "Poivrons", quantity: 2, unit: "pièces" },
      { name: "Oignon", quantity: 1, unit: "pièce" },
      { name: "Ail", quantity: 3, unit: "gousses" },
      { name: "Herbes de Provence", quantity: 2, unit: "c.à.s" }
    ],
    instructions: [
      "Couper tous les légumes en dés",
      "Faire revenir l'oignon et l'ail",
      "Ajouter les légumes par ordre de cuisson",
      "Laisser mijoter 45 minutes à feu doux"
    ],
    nutrition: { calories: 100, proteins: 3, carbs: 15, fats: 3 },
    medicalConditions: [],
    dietaryRestrictions: ["vegetarien"],
    allergens: [],
    texture: "normale",
    mealComponent: "legumes",
    tags: ["vegetarien", "ratatouille", "provençal", "legumes"]
  },

  {
    title: "Lentilles corail au curry",
    description: "Lentilles corail parfumées au curry et lait de coco, riche en protéines",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Lentilles corail", quantity: 250, unit: "g" },
      { name: "Lait de coco", quantity: 400, unit: "ml" },
      { name: "Oignon", quantity: 1, unit: "pièce" },
      { name: "Ail", quantity: 2, unit: "gousses" },
      { name: "Curry en poudre", quantity: 2, unit: "c.à.s" },
      { name: "Gingembre", quantity: 20, unit: "g" },
      { name: "Huile de coco", quantity: 2, unit: "c.à.s" }
    ],
    instructions: [
      "Faire revenir oignon, ail et gingembre",
      "Ajouter le curry et les lentilles",
      "Couvrir de lait de coco et laisser cuire 20 minutes",
      "Servir chaud avec du riz"
    ],
    nutrition: { calories: 280, proteins: 15, carbs: 35, fats: 8 },
    medicalConditions: [],
    dietaryRestrictions: ["vegetarien"],
    allergens: [],
    texture: "normale",
    mealComponent: "proteine",
    tags: ["vegetarien", "lentilles", "curry", "proteines"]
  },

  // === RECETTES SANS GLUTEN ===
  {
    title: "Risotto au quinoa",
    description: "Risotto préparé avec du quinoa, sans gluten, crémeux et délicieux",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Quinoa", quantity: 250, unit: "g" },
      { name: "Bouillon de légumes", quantity: 750, unit: "ml" },
      { name: "Champignons", quantity: 200, unit: "g" },
      { name: "Oignon", quantity: 1, unit: "pièce" },
      { name: "Parmesan", quantity: 50, unit: "g" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" }
    ],
    instructions: [
      "Faire revenir l'oignon dans l'huile",
      "Ajouter le quinoa et le bouillon progressivement",
      "Incorporer les champignons",
      "Finir avec le parmesan"
    ],
    nutrition: { calories: 320, proteins: 12, carbs: 45, fats: 10 },
    medicalConditions: [],
    dietaryRestrictions: ["sans_gluten"],
    allergens: ["lactose"],
    texture: "normale",
    mealComponent: "feculent",
    tags: ["sans_gluten", "quinoa", "risotto", "champignons"]
  },

  // === RECETTES POUR DÉNUTRITION ===
  {
    title: "Potage de légumes enrichi",
    description: "Potage de légumes enrichi en calories et protéines pour lutter contre la dénutrition",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Pommes de terre", quantity: 300, unit: "g" },
      { name: "Carottes", quantity: 200, unit: "g" },
      { name: "Crème fraîche", quantity: 200, unit: "ml" },
      { name: "Beurre", quantity: 40, unit: "g" },
      { name: "Fromage râpé", quantity: 60, unit: "g" },
      { name: "Jaune d'œuf", quantity: 2, unit: "pièces" },
      { name: "Bouillon de volaille", quantity: 500, unit: "ml" }
    ],
    instructions: [
      "Cuire les légumes dans le bouillon",
      "Mixer finement avec la crème",
      "Ajouter beurre, fromage et jaunes d'œuf",
      "Servir bien chaud"
    ],
    nutrition: { calories: 280, proteins: 10, carbs: 25, fats: 16 },
    medicalConditions: ["denutrition"],
    dietaryRestrictions: ["riche_en_calcium"],
    allergens: ["lactose", "oeufs"],
    texture: "mixee",
    mealComponent: "soupe",
    tags: ["denutrition", "enrichi", "calories", "proteines"]
  },

  // === RECETTES POUR TROUBLES DIGESTIFS ===
  {
    title: "Riz blanc aux légumes tendres",
    description: "Riz blanc cuit à la vapeur avec légumes très tendres, facile à digérer",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Riz blanc", quantity: 200, unit: "g" },
      { name: "Carottes", quantity: 150, unit: "g" },
      { name: "Courgettes", quantity: 150, unit: "g" },
      { name: "Beurre", quantity: 20, unit: "g" },
      { name: "Persil", quantity: 10, unit: "g" },
      { name: "Bouillon de légumes", quantity: 400, unit: "ml" }
    ],
    instructions: [
      "Cuire le riz dans le bouillon",
      "Cuire les légumes à la vapeur très longtemps",
      "Mélanger délicatement avec le beurre",
      "Parsemer de persil"
    ],
    nutrition: { calories: 220, proteins: 5, carbs: 40, fats: 6 },
    medicalConditions: ["troubles_digestifs"],
    dietaryRestrictions: [],
    allergens: [],
    texture: "tendre",
    mealComponent: "feculent",
    tags: ["digestif", "riz", "legumes", "tendre"]
  },

  // === RECETTES POUR INSUFFISANCE RÉNALE ===
  {
    title: "Poulet vapeur aux herbes",
    description: "Blanc de poulet cuit à la vapeur avec herbes, pauvre en protéines",
    ageGroup: "18+",
    type: "volaille",
    category: "volaille",
    servings: 4,
    ingredients: [
      { name: "Blanc de poulet", quantity: 400, unit: "g" },
      { name: "Thym frais", quantity: 10, unit: "g" },
      { name: "Romarin", quantity: 5, unit: "g" },
      { name: "Citron", quantity: 1, unit: "pièce" },
      { name: "Huile d'olive", quantity: 1, unit: "c.à.s" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    instructions: [
      "Disposer le poulet dans un panier vapeur",
      "Arroser de citron et d'herbes",
      "Cuire 20 minutes à la vapeur",
      "Servir avec un filet d'huile d'olive"
    ],
    nutrition: { calories: 180, proteins: 35, carbs: 1, fats: 4 },
    medicalConditions: ["insuffisance_renale"],
    dietaryRestrictions: ["pauvre_en_proteine"],
    allergens: [],
    texture: "normale",
    mealComponent: "proteine",
    tags: ["insuffisance_renale", "poulet", "vapeur", "herbes"]
  }
];

async function addHumanRecipes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    console.log(`🔄 Ajout de ${humanRecipes.length} recettes humaines authentiques...`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const recipeData of humanRecipes) {
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
    console.log('\n📊 Statistiques finales par filtre:');
    
    const totalRecipes = await Recipe.countDocuments();
    console.log(`📚 Total recettes: ${totalRecipes}`);

    // Compter par condition médicale
    console.log('\n🏥 Conditions médicales:');
    const medicalConditions = ['diabete', 'hypertension', 'cholesterol', 'insuffisance_renale', 'troubles_digestifs', 'denutrition'];
    for (const condition of medicalConditions) {
      const count = await Recipe.countDocuments({ medicalConditions: condition });
      console.log(`  ${condition}: ${count} recettes`);
    }

    // Compter par restriction alimentaire
    console.log('\n🥗 Restrictions alimentaires:');
    const dietaryRestrictions = ['sans_sel', 'pauvre_en_sucre', 'pauvre_en_graisse', 'riche_en_calcium', 'vegetarien', 'sans_porc', 'sans_gluten', 'sans_lactose'];
    for (const restriction of dietaryRestrictions) {
      const count = await Recipe.countDocuments({ dietaryRestrictions: restriction });
      console.log(`  ${restriction}: ${count} recettes`);
    }

    // Compter par allergène
    console.log('\n🚫 Allergènes:');
    const allergens = ['gluten', 'lactose', 'oeufs', 'fruits_a_coque', 'poisson', 'crustaces'];
    for (const allergen of allergens) {
      const count = await Recipe.countDocuments({ allergens: allergen });
      console.log(`  ${allergen}: ${count} recettes`);
    }

    // Compter par texture
    console.log('\n🍽️ Textures:');
    const textures = ['normale', 'tendre', 'hachee', 'mixee', 'moulinee'];
    for (const texture of textures) {
      const count = await Recipe.countDocuments({ texture: texture });
      console.log(`  ${texture}: ${count} recettes`);
    }

    console.log('\n🎉 Ajout des recettes humaines terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des recettes:', error);
  } finally {
    await mongoose.connection.close();
  }
}

addHumanRecipes();
