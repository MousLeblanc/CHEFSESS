// scripts/add-medical-recipes.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Recipe from '../recipe.model.js';

dotenv.config();

// Recettes spécialisées pour établissements de soins (EHPAD, hôpitaux)
const medicalRecipes = [
  // === DIABÈTE TYPE 1 & 2 ===
  {
    title: "Salade de quinoa aux légumes verts",
    description: "Salade de quinoa avec légumes verts, pauvre en sucres simples, adaptée au diabète",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Quinoa", quantity: 200, unit: "g" },
      { name: "Épinards frais", quantity: 150, unit: "g" },
      { name: "Brocolis", quantity: 200, unit: "g" },
      { name: "Avocat", quantity: 1, unit: "pièce" },
      { name: "Vinaigre balsamique", quantity: 2, unit: "c.à.s" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" }
    ],
    instructions: [
      "Cuire le quinoa selon les instructions",
      "Blanchir les légumes verts",
      "Mélanger le quinoa refroidi avec les légumes",
      "Assaisonner avec vinaigre et huile d'olive"
    ],
    nutrition: { calories: 220, proteins: 8, carbs: 35, fats: 8 },
    medicalConditions: ["diabete_type1", "diabete_type2"],
    dietaryRestrictions: ["pauvre_en_sucre"],
    allergens: [],
    texture: "normale",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard", "sans_sucre_ajoute"],
    ethicalRestrictions: ["vegetarien"],
    ageDependencyGroup: "personne_agee_autonome",
    comfortFilters: ["temperature_froide"],
    mealComponent: "entree",
    tags: ["diabete", "quinoa", "legumes_verts", "sante"]
  },

  // === HYPERTENSION / HYPOSODÉ ===
  {
    title: "Poisson vapeur aux herbes",
    description: "Filet de poisson blanc cuit à la vapeur avec herbes, sans sel ajouté",
    ageGroup: "18+",
    type: "poisson",
    category: "poisson",
    servings: 4,
    ingredients: [
      { name: "Filet de cabillaud", quantity: 600, unit: "g" },
      { name: "Thym frais", quantity: 15, unit: "g" },
      { name: "Romarin", quantity: 10, unit: "g" },
      { name: "Citron", quantity: 1, unit: "pièce" },
      { name: "Huile d'olive", quantity: 2, unit: "c.à.s" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    instructions: [
      "Disposer le poisson dans un panier vapeur",
      "Arroser de citron et d'herbes",
      "Cuire 15 minutes à la vapeur",
      "Servir avec un filet d'huile d'olive"
    ],
    nutrition: { calories: 200, proteins: 35, carbs: 2, fats: 6 },
    medicalConditions: ["hypertension", "hyposode"],
    dietaryRestrictions: ["sans_sel"],
    allergens: ["poisson"],
    texture: "normale",
    swallowing: "normale",
    nutritionalProfile: ["sans_sel_ajoute"],
    ethicalRestrictions: [],
    ageDependencyGroup: "personne_agee_autonome",
    comfortFilters: ["temperature_chaude"],
    mealComponent: "proteine",
    tags: ["hypertension", "poisson", "vapeur", "sans_sel"]
  },

  // === INSUFFISANCE RÉNALE ===
  {
    title: "Risotto aux légumes sans protéines",
    description: "Risotto crémeux aux légumes, pauvre en protéines pour insuffisance rénale",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Riz arborio", quantity: 300, unit: "g" },
      { name: "Courgettes", quantity: 200, unit: "g" },
      { name: "Carottes", quantity: 150, unit: "g" },
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
    nutrition: { calories: 280, proteins: 6, carbs: 55, fats: 6 },
    medicalConditions: ["insuffisance_renale", "restriction_proteines"],
    dietaryRestrictions: ["pauvre_en_proteine"],
    allergens: [],
    texture: "normale",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard"],
    ethicalRestrictions: ["vegetarien"],
    ageDependencyGroup: "personne_agee_autonome",
    comfortFilters: ["temperature_chaude"],
    mealComponent: "feculent",
    tags: ["insuffisance_renale", "risotto", "legumes", "pauvre_proteines"]
  },

  // === TEXTURE IDDSI 4 (PURÉE ÉPAISSE) ===
  {
    title: "Purée de légumes enrichie",
    description: "Purée épaisse de légumes enrichie en protéines, texture IDDSI 4",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Pommes de terre", quantity: 300, unit: "g" },
      { name: "Carottes", quantity: 200, unit: "g" },
      { name: "Courgettes", quantity: 150, unit: "g" },
      { name: "Poudre de protéines", quantity: 20, unit: "g" },
      { name: "Beurre", quantity: 30, unit: "g" },
      { name: "Lait", quantity: 100, unit: "ml" }
    ],
    instructions: [
      "Cuire tous les légumes à l'eau",
      "Égoutter et mixer finement",
      "Ajouter beurre, lait et poudre de protéines",
      "Mixer jusqu'à obtenir une purée épaisse"
    ],
    nutrition: { calories: 180, proteins: 8, carbs: 25, fats: 6 },
    medicalConditions: ["dysphagie"],
    dietaryRestrictions: [],
    allergens: ["lactose"],
    texture: "iddsi_4",
    swallowing: "epaisse_pudding",
    nutritionalProfile: ["hyperproteine"],
    ethicalRestrictions: ["vegetarien"],
    ageDependencyGroup: "personne_agee_dependante",
    comfortFilters: ["mixe_commande", "temperature_chaude", "sans_morceaux"],
    mealComponent: "legumes",
    tags: ["dysphagie", "purée", "enrichi", "iddsi_4"]
  },

  // === ALZHEIMER / DÉMENCE ===
  {
    title: "Potage de légumes traditionnel",
    description: "Potage de légumes simple et familier, adapté aux personnes atteintes d'Alzheimer",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Pommes de terre", quantity: 300, unit: "g" },
      { name: "Carottes", quantity: 200, unit: "g" },
      { name: "Poireaux", quantity: 1, unit: "pièce" },
      { name: "Bouillon de légumes", quantity: 500, unit: "ml" },
      { name: "Crème fraîche", quantity: 100, unit: "ml" },
      { name: "Persil", quantity: 10, unit: "g" }
    ],
    instructions: [
      "Couper tous les légumes en morceaux",
      "Mettre dans une casserole avec le bouillon",
      "Laisser mijoter 30 minutes",
      "Mixer et ajouter la crème"
    ],
    nutrition: { calories: 150, proteins: 4, carbs: 25, fats: 5 },
    medicalConditions: ["alzheimer", "demence"],
    dietaryRestrictions: [],
    allergens: ["lactose"],
    texture: "mixee",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard"],
    ethicalRestrictions: ["vegetarien"],
    ageDependencyGroup: "personne_agee_dependante",
    comfortFilters: ["prepare_avance", "temperature_chaude"],
    mealComponent: "soupe",
    tags: ["alzheimer", "potage", "traditionnel", "familier"]
  },

  // === DÉNUTRITION SÉVÈRE ===
  {
    title: "Crème dessert hypercalorique",
    description: "Crème dessert enrichie en calories et protéines pour lutter contre la dénutrition",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Lait entier", quantity: 500, unit: "ml" },
      { name: "Crème fraîche", quantity: 200, unit: "ml" },
      { name: "Œufs", quantity: 3, unit: "pièces" },
      { name: "Sucre", quantity: 80, unit: "g" },
      { name: "Poudre de protéines", quantity: 30, unit: "g" },
      { name: "Vanille", quantity: 1, unit: "gousse" }
    ],
    instructions: [
      "Faire chauffer le lait avec la vanille",
      "Battre les œufs avec le sucre",
      "Verser le lait chaud sur les œufs",
      "Ajouter la crème et les protéines, cuire au bain-marie"
    ],
    nutrition: { calories: 350, proteins: 15, carbs: 25, fats: 20 },
    medicalConditions: ["denutrition_severe"],
    dietaryRestrictions: [],
    allergens: ["lactose", "oeufs"],
    texture: "normale",
    swallowing: "normale",
    nutritionalProfile: ["hypercalorique", "hyperproteine"],
    ethicalRestrictions: ["vegetarien"],
    ageDependencyGroup: "denutrition_severe",
    comfortFilters: ["temperature_froide", "portions_renforcees"],
    mealComponent: "dessert",
    tags: ["denutrition", "enrichi", "calories", "proteines"]
  },

  // === TEXTURE IDDSI 0 (LIQUIDE) ===
  {
    title: "Smoothie enrichi aux fruits",
    description: "Smoothie liquide enrichi en vitamines, texture IDDSI 0 pour troubles sévères de déglutition",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 2,
    ingredients: [
      { name: "Banane", quantity: 1, unit: "pièce" },
      { name: "Pomme", quantity: 1, unit: "pièce" },
      { name: "Lait", quantity: 200, unit: "ml" },
      { name: "Miel", quantity: 20, unit: "g" },
      { name: "Poudre de vitamines", quantity: 5, unit: "g" }
    ],
    instructions: [
      "Éplucher et couper les fruits",
      "Mixer tous les ingrédients",
      "Passer au chinois fin",
      "Servir frais"
    ],
    nutrition: { calories: 200, proteins: 6, carbs: 35, fats: 4 },
    medicalConditions: ["dysphagie"],
    dietaryRestrictions: [],
    allergens: ["lactose"],
    texture: "iddsi_0",
    swallowing: "normale",
    nutritionalProfile: ["enrichi_vitamines"],
    ethicalRestrictions: ["vegetarien"],
    ageDependencyGroup: "personne_agee_dependante",
    comfortFilters: ["mixe_commande", "temperature_froide", "sans_morceaux"],
    mealComponent: "dessert",
    tags: ["dysphagie", "smoothie", "liquide", "iddsi_0"]
  },

  // === RÉGIME HALAL ===
  {
    title: "Poulet halal aux épices",
    description: "Poulet halal cuit aux épices, conforme aux prescriptions religieuses",
    ageGroup: "18+",
    type: "volaille",
    category: "volaille",
    servings: 4,
    ingredients: [
      { name: "Poulet halal", quantity: 600, unit: "g" },
      { name: "Cumin", quantity: 1, unit: "c.à.c" },
      { name: "Coriandre", quantity: 1, unit: "c.à.c" },
      { name: "Curcuma", quantity: 1, unit: "c.à.c" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" },
      { name: "Citron", quantity: 1, unit: "pièce" }
    ],
    instructions: [
      "Mélanger les épices avec l'huile",
      "Badigeonner le poulet",
      "Cuire au four 45 minutes",
      "Arroser de citron en fin de cuisson"
    ],
    nutrition: { calories: 250, proteins: 40, carbs: 2, fats: 10 },
    medicalConditions: [],
    dietaryRestrictions: [],
    allergens: [],
    texture: "normale",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard"],
    ethicalRestrictions: ["halal", "sans_porc"],
    ageDependencyGroup: "personne_agee_autonome",
    comfortFilters: ["temperature_chaude"],
    mealComponent: "proteine",
    tags: ["halal", "poulet", "epices", "religieux"]
  },

  // === POST-OPÉRATOIRE ===
  {
    title: "Bouillon de légumes post-opératoire",
    description: "Bouillon léger de légumes, adapté à la convalescence post-opératoire",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Carottes", quantity: 200, unit: "g" },
      { name: "Céleri", quantity: 100, unit: "g" },
      { name: "Oignon", quantity: 1, unit: "pièce" },
      { name: "Bouillon de légumes", quantity: 1, unit: "l" },
      { name: "Persil", quantity: 10, unit: "g" },
      { name: "Gingembre", quantity: 10, unit: "g" }
    ],
    instructions: [
      "Couper les légumes en morceaux",
      "Faire revenir l'oignon",
      "Ajouter les légumes et le bouillon",
      "Laisser mijoter 20 minutes, filtrer"
    ],
    nutrition: { calories: 50, proteins: 2, carbs: 8, fats: 1 },
    medicalConditions: ["post_operatoire"],
    dietaryRestrictions: ["sans_fibres"],
    allergens: [],
    texture: "liquide",
    swallowing: "normale",
    nutritionalProfile: ["sans_fibres", "pauvre_residus"],
    ethicalRestrictions: ["vegetarien"],
    ageDependencyGroup: "post_operatoire",
    comfortFilters: ["temperature_chaude", "teneur_liquides_surveillee"],
    mealComponent: "soupe",
    tags: ["post_operatoire", "bouillon", "convalescence", "leger"]
  },

  // === SOINS PALLIATIFS ===
  {
    title: "Gelée de fruits apaisante",
    description: "Gelée de fruits douce et apaisante, adaptée aux soins palliatifs",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Jus de pomme", quantity: 300, unit: "ml" },
      { name: "Agar-agar", quantity: 4, unit: "g" },
      { name: "Miel", quantity: 30, unit: "g" },
      { name: "Vanille", quantity: 1, unit: "gousse" }
    ],
    instructions: [
      "Faire chauffer le jus avec la vanille",
      "Ajouter l'agar-agar et le miel",
      "Laisser refroidir jusqu'à gélification",
      "Servir frais"
    ],
    nutrition: { calories: 80, proteins: 1, carbs: 18, fats: 0 },
    medicalConditions: ["soins_palliatifs"],
    dietaryRestrictions: [],
    allergens: [],
    texture: "liquide",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard"],
    ethicalRestrictions: ["vegetarien"],
    ageDependencyGroup: "soins_palliatifs",
    comfortFilters: ["temperature_froide", "portions_reduites"],
    mealComponent: "dessert",
    tags: ["soins_palliatifs", "gelée", "apaisant", "doux"]
  }
];

async function addMedicalRecipes() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    console.log(`🔄 Ajout de ${medicalRecipes.length} recettes médicales spécialisées...`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const recipeData of medicalRecipes) {
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

    // Test des nouveaux filtres
    console.log('\n🏥 Filtres médicaux spécialisés:');
    const medicalFilters = [
      'diabete_type1', 'diabete_type2', 'hypertension', 'insuffisance_renale',
      'alzheimer', 'dysphagie', 'denutrition_severe', 'post_operatoire', 'soins_palliatifs'
    ];
    
    for (const condition of medicalFilters) {
      const count = await Recipe.countDocuments({ medicalConditions: condition });
      console.log(`  ${condition}: ${count} recettes`);
    }

    console.log('\n🍽️ Textures IDDSI:');
    const iddsiTextures = ['iddsi_0', 'iddsi_4', 'normale', 'mixee', 'liquide'];
    for (const texture of iddsiTextures) {
      const count = await Recipe.countDocuments({ texture: texture });
      console.log(`  ${texture}: ${count} recettes`);
    }

    console.log('\n🥤 Filtres de déglutition:');
    const swallowingFilters = ['normale', 'epaisse_pudding', 'sans_morceaux'];
    for (const swallowing of swallowingFilters) {
      const count = await Recipe.countDocuments({ swallowing: swallowing });
      console.log(`  ${swallowing}: ${count} recettes`);
    }

    console.log('\n📈 Profils nutritionnels:');
    const nutritionalProfiles = ['hyperproteine', 'hypercalorique', 'sans_fibres', 'enrichi_vitamines'];
    for (const profile of nutritionalProfiles) {
      const count = await Recipe.countDocuments({ nutritionalProfile: profile });
      console.log(`  ${profile}: ${count} recettes`);
    }

    console.log('\n🎉 Ajout des recettes médicales terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des recettes:', error);
  } finally {
    await mongoose.connection.close();
  }
}

addMedicalRecipes();
