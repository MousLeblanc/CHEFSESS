// scripts/add-complex-medical-recipes.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Recipe from '../recipe.model.js';

dotenv.config();

// Recettes qui combinent exactement les filtres médicaux spécialisés
const complexMedicalRecipes = [
  // === DIABÈTE TYPE 2 + HYPERTENSION + SANS SEL + PAUVRE EN SUCRE ===
  {
    title: "Saumon vapeur aux herbes et légumes verts",
    description: "Filet de saumon cuit à la vapeur avec herbes fraîches et légumes verts, sans sel ajouté, pauvre en sucres",
    ageGroup: "18+",
    type: "poisson",
    category: "poisson",
    servings: 4,
    ingredients: [
      { name: "Filet de saumon", quantity: 600, unit: "g" },
      { name: "Brocolis", quantity: 300, unit: "g" },
      { name: "Courgettes", quantity: 200, unit: "g" },
      { name: "Aneth frais", quantity: 20, unit: "g" },
      { name: "Citron", quantity: 1, unit: "pièce" },
      { name: "Huile d'olive", quantity: 2, unit: "c.à.s" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    instructions: [
      "Disposer le saumon dans un panier vapeur",
      "Ajouter les légumes coupés en morceaux",
      "Arroser de citron et d'aneth",
      "Cuire 15 minutes à la vapeur",
      "Servir avec un filet d'huile d'olive"
    ],
    nutrition: { calories: 220, proteins: 35, carbs: 8, fats: 6 },
    medicalConditions: ["diabete_type2", "hypertension"],
    dietaryRestrictions: ["sans_sel", "pauvre_en_sucre"],
    allergens: ["poisson"],
    texture: "normale",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard"],
    ethicalRestrictions: [],
    ageDependencyGroup: "personne_agee_autonome",
    comfortFilters: ["temperature_chaude"],
    mealComponent: "proteine",
    tags: ["diabete", "hypertension", "sans_sel", "saumon", "vapeur"]
  },

  // === DIABÈTE TYPE 2 + HYPERTENSION + SANS SEL + PAUVRE EN SUCRE (VÉGÉTARIEN) ===
  {
    title: "Quinoa aux légumes et tofu grillé",
    description: "Quinoa complet aux légumes de saison et tofu grillé, sans sel ajouté, pauvre en sucres",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Quinoa", quantity: 200, unit: "g" },
      { name: "Tofu ferme", quantity: 300, unit: "g" },
      { name: "Courgettes", quantity: 200, unit: "g" },
      { name: "Tomates cerises", quantity: 150, unit: "g" },
      { name: "Basilic frais", quantity: 15, unit: "g" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" },
      { name: "Ail", quantity: 2, unit: "gousses" }
    ],
    instructions: [
      "Cuire le quinoa selon les instructions",
      "Couper le tofu en dés et le faire griller",
      "Faire revenir les légumes à l'huile d'olive",
      "Mélanger le quinoa avec les légumes et le tofu",
      "Ajouter le basilic ciselé"
    ],
    nutrition: { calories: 280, proteins: 18, carbs: 35, fats: 8 },
    medicalConditions: ["diabete_type2", "hypertension"],
    dietaryRestrictions: ["sans_sel", "pauvre_en_sucre", "vegetarien"],
    allergens: [],
    texture: "normale",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard"],
    ethicalRestrictions: ["vegetarien"],
    ageDependencyGroup: "personne_agee_autonome",
    comfortFilters: ["temperature_chaude"],
    mealComponent: "plat_complet",
    tags: ["diabete", "hypertension", "sans_sel", "quinoa", "tofu"]
  },

  // === DYSPHAGIE + TEXTURE IDDSI 4 + SANS LACTOSE ===
  {
    title: "Purée de légumes et poisson sans lactose",
    description: "Purée épaisse de légumes et poisson blanc, texture IDDSI 4, sans lactose",
    ageGroup: "18+",
    type: "poisson",
    category: "poisson",
    servings: 4,
    ingredients: [
      { name: "Cabillaud", quantity: 400, unit: "g" },
      { name: "Pommes de terre", quantity: 300, unit: "g" },
      { name: "Carottes", quantity: 200, unit: "g" },
      { name: "Lait d'amande", quantity: 200, unit: "ml" },
      { name: "Beurre végétal", quantity: 30, unit: "g" },
      { name: "Persil", quantity: 10, unit: "g" }
    ],
    instructions: [
      "Cuire le poisson et les légumes à l'eau",
      "Égoutter et mixer finement",
      "Ajouter le lait d'amande et le beurre végétal",
      "Mixer jusqu'à obtenir une purée épaisse",
      "Servir chaud avec du persil"
    ],
    nutrition: { calories: 180, proteins: 20, carbs: 18, fats: 4 },
    medicalConditions: ["dysphagie"],
    dietaryRestrictions: ["sans_lactose"],
    allergens: ["poisson"],
    texture: "iddsi_4",
    swallowing: "epaisse_pudding",
    nutritionalProfile: ["equilibre_standard"],
    ethicalRestrictions: [],
    ageDependencyGroup: "personne_agee_dependante",
    comfortFilters: ["mixe_commande", "temperature_chaude", "sans_morceaux"],
    mealComponent: "plat_complet",
    tags: ["dysphagie", "iddsi_4", "sans_lactose", "purée", "poisson"]
  },

  // === DIABÈTE TYPE 2 + PAUVRE EN SUCRE + SANS LACTOSE ===
  {
    title: "Salade de lentilles et légumes verts",
    description: "Salade de lentilles corail aux légumes verts, pauvre en sucres, sans lactose",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Lentilles corail", quantity: 200, unit: "g" },
      { name: "Épinards frais", quantity: 150, unit: "g" },
      { name: "Concombre", quantity: 1, unit: "pièce" },
      { name: "Tomates", quantity: 2, unit: "pièces" },
      { name: "Vinaigre balsamique", quantity: 2, unit: "c.à.s" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" },
      { name: "Moutarde", quantity: 1, unit: "c.à.c" }
    ],
    instructions: [
      "Cuire les lentilles selon les instructions",
      "Laver et couper les légumes",
      "Mélanger les lentilles refroidies avec les légumes",
      "Préparer la vinaigrette avec vinaigre, huile et moutarde",
      "Arroser la salade de vinaigrette"
    ],
    nutrition: { calories: 200, proteins: 12, carbs: 25, fats: 6 },
    medicalConditions: ["diabete_type2"],
    dietaryRestrictions: ["pauvre_en_sucre", "sans_lactose"],
    allergens: [],
    texture: "normale",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard"],
    ethicalRestrictions: ["vegetarien"],
    ageDependencyGroup: "personne_agee_autonome",
    comfortFilters: ["temperature_froide"],
    mealComponent: "entree",
    tags: ["diabete", "pauvre_sucre", "sans_lactose", "lentilles", "salade"]
  },

  // === HYPERTENSION + SANS SEL + RICHE EN CALCIUM ===
  {
    title: "Gratin de légumes au fromage de chèvre",
    description: "Gratin de légumes de saison au fromage de chèvre, sans sel ajouté, riche en calcium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 4,
    ingredients: [
      { name: "Courgettes", quantity: 300, unit: "g" },
      { name: "Aubergines", quantity: 200, unit: "g" },
      { name: "Tomates", quantity: 200, unit: "g" },
      { name: "Fromage de chèvre", quantity: 150, unit: "g" },
      { name: "Lait", quantity: 200, unit: "ml" },
      { name: "Œufs", quantity: 2, unit: "pièces" },
      { name: "Herbes de Provence", quantity: 1, unit: "c.à.c" }
    ],
    instructions: [
      "Couper tous les légumes en rondelles",
      "Disposer en couches dans un plat à gratin",
      "Mélanger le fromage, le lait et les œufs",
      "Verser sur les légumes",
      "Cuire 30 minutes au four"
    ],
    nutrition: { calories: 180, proteins: 12, carbs: 12, fats: 10 },
    medicalConditions: ["hypertension"],
    dietaryRestrictions: ["sans_sel", "riche_en_calcium"],
    allergens: ["lactose", "oeufs"],
    texture: "normale",
    swallowing: "normale",
    nutritionalProfile: ["riche_en_calcium"],
    ethicalRestrictions: ["vegetarien"],
    ageDependencyGroup: "personne_agee_autonome",
    comfortFilters: ["temperature_chaude"],
    mealComponent: "plat_complet",
    tags: ["hypertension", "sans_sel", "calcium", "gratin", "legumes"]
  },

  // === DIABÈTE TYPE 2 + HYPERTENSION + DYSPHAGIE + TEXTURE IDDSI 4 ===
  {
    title: "Purée de légumes et viande hachée",
    description: "Purée épaisse de légumes et viande hachée, adaptée au diabète et hypertension, texture IDDSI 4",
    ageGroup: "18+",
    type: "viande",
    category: "viande",
    servings: 4,
    ingredients: [
      { name: "Viande hachée maigre", quantity: 300, unit: "g" },
      { name: "Pommes de terre", quantity: 400, unit: "g" },
      { name: "Carottes", quantity: 200, unit: "g" },
      { name: "Courgettes", quantity: 150, unit: "g" },
      { name: "Bouillon de légumes", quantity: 200, unit: "ml" },
      { name: "Huile d'olive", quantity: 2, unit: "c.à.s" },
      { name: "Thym", quantity: 1, unit: "c.à.c" }
    ],
    instructions: [
      "Faire revenir la viande hachée",
      "Cuire les légumes dans le bouillon",
      "Mélanger viande et légumes",
      "Mixer finement jusqu'à purée épaisse",
      "Ajuster la consistance avec le bouillon"
    ],
    nutrition: { calories: 220, proteins: 18, carbs: 20, fats: 8 },
    medicalConditions: ["diabete_type2", "hypertension", "dysphagie"],
    dietaryRestrictions: ["sans_sel", "pauvre_en_sucre"],
    allergens: [],
    texture: "iddsi_4",
    swallowing: "epaisse_pudding",
    nutritionalProfile: ["equilibre_standard"],
    ethicalRestrictions: [],
    ageDependencyGroup: "personne_agee_dependante",
    comfortFilters: ["mixe_commande", "temperature_chaude", "sans_morceaux"],
    mealComponent: "plat_complet",
    tags: ["diabete", "hypertension", "dysphagie", "iddsi_4", "purée", "viande"]
  },

  // === SANS LACTOSE + PAUVRE EN SUCRE + RICHE EN CALCIUM ===
  {
    title: "Smoothie vert enrichi au calcium",
    description: "Smoothie vert aux légumes et fruits, sans lactose, pauvre en sucres, enrichi en calcium",
    ageGroup: "18+",
    type: "vegetarien",
    category: "vegetarien",
    servings: 2,
    ingredients: [
      { name: "Épinards frais", quantity: 100, unit: "g" },
      { name: "Kiwi", quantity: 2, unit: "pièces" },
      { name: "Avocat", quantity: 1, unit: "pièce" },
      { name: "Lait d'amande", quantity: 300, unit: "ml" },
      { name: "Graines de sésame", quantity: 20, unit: "g" },
      { name: "Miel", quantity: 10, unit: "g" }
    ],
    instructions: [
      "Laver les épinards",
      "Éplucher et couper les fruits",
      "Mixer tous les ingrédients",
      "Ajouter le lait d'amande progressivement",
      "Servir frais"
    ],
    nutrition: { calories: 180, proteins: 6, carbs: 20, fats: 10 },
    medicalConditions: [],
    dietaryRestrictions: ["sans_lactose", "pauvre_en_sucre", "riche_en_calcium"],
    allergens: ["sesame"],
    texture: "liquide",
    swallowing: "normale",
    nutritionalProfile: ["riche_en_calcium"],
    ethicalRestrictions: ["vegetarien"],
    ageDependencyGroup: "personne_agee_autonome",
    comfortFilters: ["temperature_froide"],
    mealComponent: "dessert",
    tags: ["sans_lactose", "pauvre_sucre", "calcium", "smoothie", "vert"]
  },

  // === DIABÈTE TYPE 2 + HYPERTENSION + SANS SEL + SANS LACTOSE ===
  {
    title: "Poulet aux herbes et légumes vapeur",
    description: "Filet de poulet aux herbes avec légumes vapeur, sans sel ajouté, sans lactose",
    ageGroup: "18+",
    type: "volaille",
    category: "volaille",
    servings: 4,
    ingredients: [
      { name: "Filet de poulet", quantity: 600, unit: "g" },
      { name: "Brocolis", quantity: 200, unit: "g" },
      { name: "Carottes", quantity: 200, unit: "g" },
      { name: "Haricots verts", quantity: 150, unit: "g" },
      { name: "Romarin", quantity: 10, unit: "g" },
      { name: "Thym", quantity: 10, unit: "g" },
      { name: "Huile d'olive", quantity: 3, unit: "c.à.s" }
    ],
    instructions: [
      "Badigeonner le poulet d'huile d'olive et d'herbes",
      "Disposer dans un panier vapeur avec les légumes",
      "Cuire 20 minutes à la vapeur",
      "Servir chaud"
    ],
    nutrition: { calories: 250, proteins: 40, carbs: 8, fats: 6 },
    medicalConditions: ["diabete_type2", "hypertension"],
    dietaryRestrictions: ["sans_sel", "sans_lactose"],
    allergens: [],
    texture: "normale",
    swallowing: "normale",
    nutritionalProfile: ["equilibre_standard"],
    ethicalRestrictions: [],
    ageDependencyGroup: "personne_agee_autonome",
    comfortFilters: ["temperature_chaude"],
    mealComponent: "proteine",
    tags: ["diabete", "hypertension", "sans_sel", "sans_lactose", "poulet", "vapeur"]
  }
];

async function addComplexMedicalRecipes() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    console.log(`🔄 Ajout de ${complexMedicalRecipes.length} recettes médicales complexes...`);

    let addedCount = 0;
    let skippedCount = 0;

    for (const recipeData of complexMedicalRecipes) {
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

    // Test des combinaisons spécifiques
    console.log('\n🎯 Test des combinaisons de filtres:');
    
    // Diabète + Hypertension + Sans sel
    const diabeteHypertensionSansSel = await Recipe.countDocuments({
      medicalConditions: { $in: ['diabete_type2', 'hypertension'] },
      dietaryRestrictions: { $in: ['sans_sel'] }
    });
    console.log(`  Diabète + Hypertension + Sans sel: ${diabeteHypertensionSansSel} recettes`);

    // Diabète + Pauvre en sucre
    const diabetePauvreSucre = await Recipe.countDocuments({
      medicalConditions: 'diabete_type2',
      dietaryRestrictions: 'pauvre_en_sucre'
    });
    console.log(`  Diabète + Pauvre en sucre: ${diabetePauvreSucre} recettes`);

    // Dysphagie + Texture IDDSI 4
    const dysphagieIddsi4 = await Recipe.countDocuments({
      medicalConditions: 'dysphagie',
      texture: 'iddsi_4'
    });
    console.log(`  Dysphagie + Texture IDDSI 4: ${dysphagieIddsi4} recettes`);

    // Sans lactose + Pauvre en sucre
    const sansLactosePauvreSucre = await Recipe.countDocuments({
      dietaryRestrictions: { $in: ['sans_lactose', 'pauvre_en_sucre'] }
    });
    console.log(`  Sans lactose + Pauvre en sucre: ${sansLactosePauvreSucre} recettes`);

    console.log('\n🎉 Ajout des recettes médicales complexes terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des recettes:', error);
  } finally {
    await mongoose.connection.close();
  }
}

addComplexMedicalRecipes();
