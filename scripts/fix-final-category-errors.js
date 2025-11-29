// scripts/fix-final-category-errors.js
// Script pour corriger les dernières erreurs de catégorisation
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
  'boisson': [
    'BANANA BERRY SMOOTHIE BOWL'
  ],
  'petit-déjeuner': [
    'BANANA BERRY SMOOTHIE BOWL',
    'CROISSANTS',
    'Chorizo Breakfast Burritos',
    'FOCACCIA',
    'Fromage blanc crème et miel',
    'PAIN À LA TOMATE ET À L\'HUILE D\'OLIVE'
  ],
  'dessert': [
    'Compote Lisse de Pommes et Poires Enrichie',
    'Compote de Fruits Rouges Légèrement Sucrée',
    'Compote de Pommes Doucement Cuites',
    'Compote de Pommes à la Cannelle Maison',
    'Compote de Pommes à la Cannelle et Citron',
    'Compote de Pommes à la Cannelle sans Sucre',
    'Compote de pommes à la cannelle et gingembre',
    'Compote de pommes à la cannelle sans sucre ajouté',
    'Fromage blanc crème et miel',
    'Glace à la banane',
    'Raspberry And Apricot Rugelach',
    'Salade de Fruits Fraise, Banane et Pomme',
    'Salade de Pommes, Oranges, Fraises et Kiwi',
    'Sopapillas'
  ],
  'accompagnement': [
    'CAESAR SALAD DRESSING',
    'CITRUS SALAD DRESSING',
    'COCONUT BASIL SWEET POTATO FRIES',
    'CREAMY AVOCADO SALAD DRESSING',
    'CREAMY TAHINI SALAD DRESSING',
    'Crab Dip II',
    'FLAX EGG ALTERNATIVE',
    'FOCACCIA',
    'HONEY MUSTARD VINAIGRETTE',
    'Hummus I',
    'Margie\'s Cuban Sofrito (Sauce)',
    'Marinara Sauce I',
    'PAIN À LA TOMATE ET À L\'HUILE D\'OLIVE',
    'PICKLES DOUX AU CONCOMBRE',
    'Ricardo\'s Pizza Crust',
    'Traditional Baba Ghanoush'
  ],
  'entrée': [
    'Crab Dip II',
    'Italian Style Bruschetta',
    'Rouleaux de Printemps aux Légumes Croquants et Avocat',
    'SALADE DE CHOU ET DE POMME',
    'SALADE DE CHOU ROUGE',
    'Salade Niçoise au Thon, Tomates et Œufs Durs',
    'Salade croquante aux tomates cerises et herbes fraîches',
    'Salade d\'épinards et roquette aux amandes croustillantes',
    'Salade de Chou-Fleur, Amandes et Fromage Râpé',
    'Salade de Lentilles Vertes aux Légumes Croquants',
    'Salade de Lentilles, Carottes et Céleri au Vinaigre Balsamique',
    'Salade de Quinoa aux Légumes Croquants et Vinaigrette Balsamique',
    'Salade de Tomates Hachées à la Vinaigrette Douce',
    'Salade de concombre et tomate',
    'Salade de pâtes au blé entier et légumes colorés',
    'Salade de quinoa aux épinards, brocolis et avocat'
  ]
};

/**
 * Mappings des recettes à corriger depuis DESSERT
 */
const dessertToOther = {
  'accompagnement': [
    'PÂTE SABLÉE',
    'PÂTE À STRUDEL'
  ],
  'plat': [
    'STRAWBERRY-BALSAMIC PASTA'
  ],
  'entrée': [
    'STRAWBERRY-BALSAMIC PASTA'
  ],
  'boisson': [
    'VEGAN YOGURT'
  ],
  'petit-déjeuner': [
    'VEGAN YOGURT'
  ]
};

/**
 * Mappings des recettes à corriger depuis SOUPE
 */
const soupeToOther = {
  'plat': [
    'SPICY FISH BALL SOUP',
    'Velouté de Chou-fleur et Pomme de Terre à la Crème'
  ]
};

/**
 * Fonction principale
 */
async function fixFinalCategoryErrors() {
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
    
    // Traiter les recettes depuis DESSERT
    console.log('🔍 Recherche des recettes à corriger depuis DESSERT...\n');
    for (const [newCategory, recipeNames] of Object.entries(dessertToOther)) {
      for (const recipeName of recipeNames) {
        const recipe = await RecipeEnriched.findOne({ name: recipeName }).lean();
        
        if (recipe) {
          const currentCategory = recipe.category || 'dessert';
          
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
    
    // Traiter les recettes depuis SOUPE
    console.log('🔍 Recherche des recettes à corriger depuis SOUPE...\n');
    for (const [newCategory, recipeNames] of Object.entries(soupeToOther)) {
      for (const recipeName of recipeNames) {
        const recipe = await RecipeEnriched.findOne({ name: recipeName }).lean();
        
        if (recipe) {
          const currentCategory = recipe.category || 'soupe';
          
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
  fixFinalCategoryErrors()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default fixFinalCategoryErrors;


