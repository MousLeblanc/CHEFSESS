// scripts/move-final-plat-recipes.js
// Script pour déplacer les dernières recettes de PLAT vers les bonnes catégories
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
    'Compote Lisse de Pommes et Poires Enrichie',
    'Compote de Fruits Rouges Légèrement Sucrée',
    'Compote de Pommes Doucement Cuites',
    'Compote de Pommes à la Cannelle Maison',
    'Compote de Pommes à la Cannelle et Citron',
    'Compote de Pommes à la Cannelle sans Sucre',
    'Compote de pommes à la cannelle et gingembre',
    'Compote de pommes à la cannelle sans sucre ajouté',
    'German Cut Out Cookies',
    'Glace à la banane',
    'Huckleberry Buckle II',
    'Ice Cream Kolacky',
    'Marmalade Chews',
    'Mazarin Cake II',
    'Red Velvet Chocolate Chip Cookies',
    'Sopapillas',
    'Suspiro A La Limea',
    'Yaourt enrichi poudre de lait'
  ],
  'entrée': [
    'Greek Salad I',
    'Greek Salad III',
    'Greek Salad IV',
    'Greek Salad V',
    'Italian Style Bruschetta',
    'Pi p é rade Salad With Olives',
    'Rouleaux de Printemps aux Légumes Croquants et Avocat',
    'SALADE DE CHOU ET DE POMME',
    'SALADE DE CHOU ROUGE',
    'Salade Niçoise au Thon, Tomates et Œufs Durs',
    'Salade croquante aux tomates cerises et herbes fraîches',
    'Salade de Lentilles Vertes aux Légumes Croquants'
  ],
  'accompagnement': [
    'BAKED KALE CHIPS',
    'CÉLERI RÉMOULADE',
    'Chipotle Vinegar',
    'Eggplant Fillets With Cream Sauce',
    'FLAX EGG ALTERNATIVE',
    'GARLICKY LO MEIN WITH',
    'HUMMUS-STUFFED PEPPERS',
    'Mashed Cauliflower',
    'PAIN À LA TOMATE ET À L\'HUILE D\'OLIVE',
    'Ricardo\'s Pizza Crust',
    'Russian Style Creamy Salad Dressing',
    'Spectacular Marsala Glazed Carrots',
    'Sweet Jalapeno Cornbread',
    'TURMERIC HUMMUS',
    'TURMERIC RICE',
    'Whole Sardines With Fresh Herbs And',
    'ZUCCHINI PASTA WITH BROCCOLI SPROUTS PESTO',
    'ZUCCHINI SPAGHETTI WITH RAW TOMATO SAUCE AND'
  ],
  'soupe': [
    'SOUPE AU POIVRON ROUGE ET AU PIMENT',
    'SOUPE DE PETITS POIS',
    'SOUPE DE POMMES DE TERRE',
    'SOUPE GLACÉE À LA COURGETTE ET À LA SAUGE'
  ]
};

/**
 * Fonction principale
 */
async function moveFinalPlatRecipes() {
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
  moveFinalPlatRecipes()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default moveFinalPlatRecipes;


