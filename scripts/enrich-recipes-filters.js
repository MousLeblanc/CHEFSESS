// scripts/enrich-recipes-filters.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Recipe from '../recipe.model.js';

dotenv.config();

// Mapping des filtres pour les recettes
const filterMappings = {
  // Conditions médicales
  medicalConditions: {
    'diabete': ['diabete', 'diabetes', 'sans_sucre', 'pauvre_en_sucre'],
    'hypertension': ['hypertension', 'sans_sel', 'pauvre_en_sel'],
    'cholesterol': ['cholesterol', 'pauvre_en_graisse', 'sans_graisse'],
    'insuffisance_renale': ['insuffisance_renale', 'pauvre_en_proteine'],
    'troubles_digestifs': ['troubles_digestifs', 'digestif', 'facile_a_digérer'],
    'denutrition': ['denutrition', 'riche_en_calories', 'nutritif']
  },
  
  // Restrictions alimentaires
  dietaryRestrictions: {
    'sans_sel': ['sans_sel', 'pauvre_en_sel', 'hypertension'],
    'pauvre_en_sucre': ['pauvre_en_sucre', 'sans_sucre', 'diabete'],
    'pauvre_en_graisse': ['pauvre_en_graisse', 'sans_graisse', 'cholesterol'],
    'riche_en_calcium': ['riche_en_calcium', 'calcium', 'lait', 'fromage', 'yaourt'],
    'vegetarien': ['vegetarien', 'vegetarian', 'legumes', 'legume'],
    'sans_porc': ['sans_porc', 'halal', 'casher']
  },
  
  // Allergènes
  allergens: {
    'gluten': ['gluten', 'blé', 'ble', 'farine', 'pate', 'pâte'],
    'lactose': ['lactose', 'lait', 'fromage', 'yaourt', 'crème', 'creme'],
    'oeufs': ['oeufs', 'œufs', 'oeuf', 'œuf', 'egg'],
    'fruits_a_coque': ['fruits_a_coque', 'noix', 'amande', 'noisette', 'pistache'],
    'poisson': ['poisson', 'fish', 'saumon', 'thon', 'cabillaud'],
    'crustaces': ['crustaces', 'crevette', 'langouste', 'homard', 'crab']
  }
};

// Mots-clés pour identifier les textures
const textureKeywords = {
  'normale': ['normal', 'classique', 'traditionnel'],
  'tendre': ['tendre', 'fondant', 'mou', 'doux'],
  'hachee': ['haché', 'hachee', 'hachis', 'haché'],
  'mixee': ['mixé', 'mixee', 'purée', 'puree', 'smoothie'],
  'moulinee': ['mouliné', 'moulinee', 'mouliné', 'passé', 'passe']
};

// Fonction pour détecter les filtres basés sur le contenu de la recette
function detectFilters(recipe) {
  const title = (recipe.title || '').toLowerCase();
  const description = (recipe.description || '').toLowerCase();
  const ingredients = (recipe.ingredients || []).map(ing => (ing.name || ing.item || '').toLowerCase()).join(' ');
  const instructions = (recipe.instructions || []).map(inst => inst.toLowerCase()).join(' ');
  
  const fullText = `${title} ${description} ${ingredients} ${instructions}`;
  
  const detectedFilters = {
    medicalConditions: [],
    dietaryRestrictions: [],
    allergens: [],
    texture: 'normale'
  };
  
  // Détecter les conditions médicales
  for (const [condition, keywords] of Object.entries(filterMappings.medicalConditions)) {
    if (keywords.some(keyword => fullText.includes(keyword))) {
      detectedFilters.medicalConditions.push(condition);
    }
  }
  
  // Détecter les restrictions alimentaires
  for (const [restriction, keywords] of Object.entries(filterMappings.dietaryRestrictions)) {
    if (keywords.some(keyword => fullText.includes(keyword))) {
      detectedFilters.dietaryRestrictions.push(restriction);
    }
  }
  
  // Détecter les allergènes
  for (const [allergen, keywords] of Object.entries(filterMappings.allergens)) {
    if (keywords.some(keyword => fullText.includes(keyword))) {
      detectedFilters.allergens.push(allergen);
    }
  }
  
  // Détecter la texture
  for (const [texture, keywords] of Object.entries(textureKeywords)) {
    if (keywords.some(keyword => fullText.includes(keyword))) {
      detectedFilters.texture = texture;
      break;
    }
  }
  
  return detectedFilters;
}

// Fonction pour enrichir une recette avec des filtres
function enrichRecipeWithFilters(recipe) {
  const detectedFilters = detectFilters(recipe);
  
  // Ajouter les filtres détectés aux filtres existants
  const enrichedRecipe = {
    ...recipe.toObject(),
    medicalConditions: [...new Set([...(recipe.medicalConditions || []), ...detectedFilters.medicalConditions])],
    dietaryRestrictions: [...new Set([...(recipe.dietaryRestrictions || []), ...detectedFilters.dietaryRestrictions])],
    allergens: [...new Set([...(recipe.allergens || []), ...detectedFilters.allergens])],
    texture: detectedFilters.texture !== 'normale' ? detectedFilters.texture : (recipe.texture || 'normale')
  };
  
  return enrichedRecipe;
}

// Fonction pour créer des recettes spécifiques pour les filtres manquants
function createFilterSpecificRecipes() {
  const specificRecipes = [
    // Recettes pour diabète
    {
      title: "Salade de légumes verts aux herbes",
      description: "Salade fraîche et légère, parfaite pour les personnes diabétiques",
      ageGroup: "18+",
      type: "vegetarien",
      category: "vegetarien",
      servings: 4,
      ingredients: [
        { name: "Salade verte", quantity: 200, unit: "g" },
        { name: "Concombre", quantity: 1, unit: "pièce" },
        { name: "Tomates cerises", quantity: 150, unit: "g" },
        { name: "Herbes fraîches", quantity: 20, unit: "g" },
        { name: "Vinaigre balsamique", quantity: 2, unit: "c.à.s" },
        { name: "Huile d'olive", quantity: 1, unit: "c.à.s" }
      ],
      instructions: [
        "Laver et couper les légumes",
        "Mélanger avec les herbes",
        "Assaisonner avec vinaigre et huile"
      ],
      nutrition: { calories: 80, proteins: 3, carbs: 8, fats: 4 },
      medicalConditions: ["diabete"],
      dietaryRestrictions: ["pauvre_en_sucre"],
      allergens: [],
      texture: "normale",
      mealComponent: "entree",
      tags: ["diabete", "legumes", "sante"]
    },
    
    // Recettes pour hypertension (sans sel)
    {
      title: "Poisson vapeur aux herbes",
      description: "Poisson cuit à la vapeur, sans sel ajouté, idéal pour l'hypertension",
      ageGroup: "18+",
      type: "poisson",
      category: "poisson",
      servings: 4,
      ingredients: [
        { name: "Filet de cabillaud", quantity: 600, unit: "g" },
        { name: "Citron", quantity: 1, unit: "pièce" },
        { name: "Herbes de Provence", quantity: 1, unit: "c.à.s" },
        { name: "Ail", quantity: 2, unit: "gousses" },
        { name: "Huile d'olive", quantity: 1, unit: "c.à.s" }
      ],
      instructions: [
        "Placer le poisson dans un panier vapeur",
        "Arroser de citron et d'herbes",
        "Cuire 15 minutes à la vapeur"
      ],
      nutrition: { calories: 180, proteins: 35, carbs: 2, fats: 4 },
      medicalConditions: ["hypertension"],
      dietaryRestrictions: ["sans_sel"],
      allergens: ["poisson"],
      texture: "normale",
      mealComponent: "proteine",
      tags: ["hypertension", "poisson", "vapeur", "sante"]
    },
    
    // Recettes riches en calcium
    {
      title: "Gratin de brocolis au fromage",
      description: "Gratin de brocolis riche en calcium, parfait pour les os",
      ageGroup: "18+",
      type: "vegetarien",
      category: "vegetarien",
      servings: 4,
      ingredients: [
        { name: "Brocolis", quantity: 500, unit: "g" },
        { name: "Fromage râpé", quantity: 100, unit: "g" },
        { name: "Crème fraîche", quantity: 200, unit: "ml" },
        { name: "Œufs", quantity: 2, unit: "pièces" },
        { name: "Muscade", quantity: 1, unit: "pincée" }
      ],
      instructions: [
        "Cuire les brocolis à la vapeur",
        "Mélanger avec crème, œufs et fromage",
        "Enfourner 25 minutes à 180°C"
      ],
      nutrition: { calories: 220, proteins: 15, carbs: 8, fats: 16 },
      medicalConditions: [],
      dietaryRestrictions: ["riche_en_calcium"],
      allergens: ["lactose", "oeufs"],
      texture: "normale",
      mealComponent: "legumes",
      tags: ["calcium", "brocolis", "fromage", "gratin"]
    },
    
    // Recettes pour texture hachée
    {
      title: "Hachis parmentier de légumes",
      description: "Hachis de légumes tendre, idéal pour les personnes ayant des difficultés de mastication",
      ageGroup: "18+",
      type: "vegetarien",
      category: "vegetarien",
      servings: 4,
      ingredients: [
        { name: "Pommes de terre", quantity: 400, unit: "g" },
        { name: "Carottes", quantity: 200, unit: "g" },
        { name: "Courgettes", quantity: 200, unit: "g" },
        { name: "Beurre", quantity: 30, unit: "g" },
        { name: "Lait", quantity: 100, unit: "ml" }
      ],
      instructions: [
        "Cuire les légumes à l'eau",
        "Égoutter et hacher finement",
        "Mélanger avec beurre et lait"
      ],
      nutrition: { calories: 180, proteins: 5, carbs: 30, fats: 6 },
      medicalConditions: [],
      dietaryRestrictions: [],
      allergens: ["lactose"],
      texture: "hachee",
      mealComponent: "legumes",
      tags: ["hache", "legumes", "tendre", "mastication"]
    },
    
    // Recettes sans lactose
    {
      title: "Risotto aux légumes sans lactose",
      description: "Risotto crémeux aux légumes, sans produits laitiers",
      ageGroup: "18+",
      type: "vegetarien",
      category: "vegetarien",
      servings: 4,
      ingredients: [
        { name: "Riz arborio", quantity: 300, unit: "g" },
        { name: "Bouillon de légumes", quantity: 1, unit: "l" },
        { name: "Légumes variés", quantity: 300, unit: "g" },
        { name: "Huile d'olive", quantity: 3, unit: "c.à.s" },
        { name: "Vin blanc", quantity: 100, unit: "ml" }
      ],
      instructions: [
        "Faire revenir le riz dans l'huile",
        "Ajouter le vin et le bouillon progressivement",
        "Incorporer les légumes en fin de cuisson"
      ],
      nutrition: { calories: 320, proteins: 8, carbs: 60, fats: 6 },
      medicalConditions: [],
      dietaryRestrictions: ["vegetarien"],
      allergens: [],
      texture: "normale",
      mealComponent: "feculent",
      tags: ["sans_lactose", "risotto", "legumes", "italien"]
    }
  ];
  
  return specificRecipes;
}

async function enrichRecipesWithFilters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // 1. Enrichir les recettes existantes
    console.log('🔄 Enrichissement des recettes existantes...');
    const existingRecipes = await Recipe.find();
    console.log(`📊 ${existingRecipes.length} recettes existantes trouvées`);

    let enrichedCount = 0;
    for (const recipe of existingRecipes) {
      const enrichedRecipe = enrichRecipeWithFilters(recipe);
      
      // Mettre à jour seulement si des filtres ont été ajoutés
      if (enrichedRecipe.medicalConditions.length > (recipe.medicalConditions || []).length ||
          enrichedRecipe.dietaryRestrictions.length > (recipe.dietaryRestrictions || []).length ||
          enrichedRecipe.allergens.length > (recipe.allergens || []).length) {
        
        await Recipe.findByIdAndUpdate(recipe._id, {
          medicalConditions: enrichedRecipe.medicalConditions,
          dietaryRestrictions: enrichedRecipe.dietaryRestrictions,
          allergens: enrichedRecipe.allergens,
          texture: enrichedRecipe.texture
        });
        enrichedCount++;
      }
    }
    console.log(`✅ ${enrichedCount} recettes enrichies`);

    // 2. Ajouter des recettes spécifiques pour les filtres manquants
    console.log('🔄 Ajout de recettes spécifiques...');
    const specificRecipes = createFilterSpecificRecipes();
    
    for (const recipeData of specificRecipes) {
      const existingRecipe = await Recipe.findOne({ title: recipeData.title });
      if (!existingRecipe) {
        const newRecipe = new Recipe(recipeData);
        await newRecipe.save();
        console.log(`➕ Recette ajoutée: ${recipeData.title}`);
      }
    }

    // 3. Vérifier les statistiques finales
    console.log('\n📊 Statistiques finales:');
    const totalRecipes = await Recipe.countDocuments();
    console.log(`📚 Total recettes: ${totalRecipes}`);

    const stats = {
      medicalConditions: {},
      dietaryRestrictions: {},
      allergens: {},
      textures: {}
    };

    // Compter par condition médicale
    for (const condition of ['diabete', 'hypertension', 'cholesterol', 'insuffisance_renale', 'troubles_digestifs', 'denutrition']) {
      stats.medicalConditions[condition] = await Recipe.countDocuments({ medicalConditions: condition });
    }

    // Compter par restriction alimentaire
    for (const restriction of ['sans_sel', 'pauvre_en_sucre', 'pauvre_en_graisse', 'riche_en_calcium', 'vegetarien', 'sans_porc']) {
      stats.dietaryRestrictions[restriction] = await Recipe.countDocuments({ dietaryRestrictions: restriction });
    }

    // Compter par allergène
    for (const allergen of ['gluten', 'lactose', 'oeufs', 'fruits_a_coque', 'poisson', 'crustaces']) {
      stats.allergens[allergen] = await Recipe.countDocuments({ allergens: allergen });
    }

    // Compter par texture
    for (const texture of ['normale', 'tendre', 'hachee', 'mixee', 'moulinee']) {
      stats.textures[texture] = await Recipe.countDocuments({ texture: texture });
    }

    console.log('\n🏥 Conditions médicales:');
    Object.entries(stats.medicalConditions).forEach(([condition, count]) => {
      console.log(`  ${condition}: ${count} recettes`);
    });

    console.log('\n🥗 Restrictions alimentaires:');
    Object.entries(stats.dietaryRestrictions).forEach(([restriction, count]) => {
      console.log(`  ${restriction}: ${count} recettes`);
    });

    console.log('\n🚫 Allergènes:');
    Object.entries(stats.allergens).forEach(([allergen, count]) => {
      console.log(`  ${allergen}: ${count} recettes`);
    });

    console.log('\n🍽️ Textures:');
    Object.entries(stats.textures).forEach(([texture, count]) => {
      console.log(`  ${texture}: ${count} recettes`);
    });

    console.log('\n🎉 Enrichissement terminé avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'enrichissement:', error);
  } finally {
    await mongoose.connection.close();
  }
}

enrichRecipesWithFilters();
