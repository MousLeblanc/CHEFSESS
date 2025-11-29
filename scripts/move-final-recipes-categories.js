// scripts/move-final-recipes-categories.js
// Script pour déplacer les dernières recettes vers les bonnes catégories
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Mappings des recettes à corriger depuis PLAT
 */
const platToOther = {
  'dessert': [
    'Brown Sugar Spiced Shortbread',
    'CAKE AU MIEL ET AUX NOIX',
    'Cream Cheese Hamantaschen',
    'Easy Turkish Delight',
    'Fruity Fun Skewers',
    'Georgina\'s True English Butter Tarts',
    'Irish Bananas',
    'Italian Cheesecake II',
    'Kolaczki',
    'Microwave Mochi',
    'Old Fashioned Stollen',
    'Polish Galicyjskie Cookies',
    'PROTEIN BALLS',
    'PROTEIN BARS',
    'Riz au lait de coco et cannelle sans lactose',
    'Riz au lait enrichi',
    'Riz au lait enrichi douceur',
    'Thera\'s Canadian Fried Dough',
    'Witchetty Grubs'
  ],
  'petit-déjeuner': [
    'Basic Crepes',
    'Fruity Fun Skewers',
    'HUNSRÜCKER BAUERENBROT',
    'PROTEIN BALLS',
    'PROTEIN BARS',
    'RAW HIGH-PROTEIN GRANOLA BARS WITH CHOCOLATE CHIP ALMOND BUTTER',
    'TEFF CREPES',
    'Yeasted Blinis'
  ],
  'accompagnement': [
    'Balsamic Vinegar And Olive Oil',
    'Basic Crepes',
    'CAROTTES AU FOUR',
    'CAULIFLOWER POPCORN',
    'CHAPATIS',
    'CHICKPEA FRIES',
    'Enoki Mushrooms',
    'Fougasse',
    'French Canadian Dip',
    'Garlic Dill New Potatoes',
    'HUNSRÜCKER BAUERENBROT',
    'Indian Naan II',
    'Kim Chee Squats',
    'POMMES DE TERRE PRINTANIÈRES',
    'SERVIETTENKNÖDEL',
    'SIMPLE STEAMED ARTICHOKES',
    'STUFFED OLIVES',
    'Szechuan Edamame (Soy Beans)',
    'Yorkshire Pudding',
    'Yorkshire Pudding I'
  ],
  'entrée': [
    'Beet Potato Salad With Lemon',
    'Creamy Dill Cucumber Toasties',
    'Fruity Fun Skewers',
    'GRATED BEET AND CARROT SALAD WITH SUNBUTTER DRESSING',
    'SIMPLE STEAMED ARTICHOKES',
    'Yeasted Blinis'
  ]
};

/**
 * Mappings des recettes à corriger depuis ACCOMPAGNEMENT
 */
const accompagnementToOther = {
  'soupe': [
    'Crème de champignons'
  ],
  'plat': [
    'RÖSTI ET SAUCE À LA POMME',
    'Whole Sardines With Fresh Herbs And'
  ]
};

/**
 * Fonction principale
 */
async function moveFinalRecipesCategories() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    const corrections = [];
    const notFound = [];
    
    // Traiter les recettes depuis PLAT
    console.log('🔍 Recherche des recettes à corriger depuis PLAT...\n');
    for (const [newCategory, recipeNames] of Object.entries(platToOther)) {
      for (const recipeName of recipeNames) {
        const recipe = await RecipeEnriched.findOne({ name: recipeName }).lean();
        
        if (recipe) {
          const currentCategory = recipe.category || 'plat';
          
          if (currentCategory !== newCategory) {
            corrections.push({
              id: recipe._id,
              name: recipeName,
              oldCategory: currentCategory,
              newCategory: newCategory
            });
          }
        } else {
          notFound.push(recipeName);
        }
      }
    }
    
    // Traiter les recettes depuis ACCOMPAGNEMENT
    console.log('🔍 Recherche des recettes à corriger depuis ACCOMPAGNEMENT...\n');
    for (const [newCategory, recipeNames] of Object.entries(accompagnementToOther)) {
      for (const recipeName of recipeNames) {
        const recipe = await RecipeEnriched.findOne({ name: recipeName }).lean();
        
        if (recipe) {
          const currentCategory = recipe.category || 'accompagnement';
          
          if (currentCategory !== newCategory) {
            corrections.push({
              id: recipe._id,
              name: recipeName,
              oldCategory: currentCategory,
              newCategory: newCategory
            });
          }
        } else {
          notFound.push(recipeName);
        }
      }
    }
    
    // Afficher les recettes non trouvées
    if (notFound.length > 0) {
      console.log(`\n⚠️  ${notFound.length} recette(s) non trouvée(s):`);
      notFound.forEach(name => {
        console.log(`   - "${name}"`);
      });
    }
    
    // Afficher les corrections
    console.log(`\n📊 ${corrections.length} correction(s) à effectuer:\n`);
    
    const correctionsByCategory = {};
    corrections.forEach(corr => {
      const key = `${corr.oldCategory} → ${corr.newCategory}`;
      if (!correctionsByCategory[key]) {
        correctionsByCategory[key] = [];
      }
      correctionsByCategory[key].push(corr);
    });
    
    Object.entries(correctionsByCategory)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([key, items]) => {
        console.log(`  ${key}: ${items.length} recette(s)`);
        items.slice(0, 10).forEach(item => {
          console.log(`    - "${item.name}"`);
        });
        if (items.length > 10) {
          console.log(`    ... et ${items.length - 10} autres`);
        }
        console.log();
      });
    
    // Appliquer les corrections
    if (corrections.length > 0) {
      console.log('🔄 Application des corrections...\n');
      
      let updated = 0;
      for (const correction of corrections) {
        await RecipeEnriched.updateOne(
          { _id: correction.id },
          { $set: { category: correction.newCategory } }
        );
        updated++;
        
        if (updated % 20 === 0) {
          console.log(`  ✅ ${updated}/${corrections.length} corrections appliquées...`);
        }
      }
      
      console.log(`\n✅ ${updated} recette(s) mise(s) à jour`);
    } else {
      console.log('✅ Aucune correction nécessaire');
    }
    
    // Statistiques finales
    const stats = await RecipeEnriched.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 STATISTIQUES FINALES PAR CATÉGORIE:');
    console.log('-'.repeat(80));
    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    stats.forEach(stat => {
      const percentage = ((stat.count / total) * 100).toFixed(1);
      console.log(`  ${stat._id.padEnd(20)} : ${stat.count.toString().padStart(4)} recettes (${percentage}%)`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${path.resolve(process.argv[1])}` || 
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  moveFinalRecipesCategories()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default moveFinalRecipesCategories;


