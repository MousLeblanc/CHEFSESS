// scripts/fix-remaining-category-errors.js
// Script pour corriger les erreurs persistantes de catégorisation
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Mappings des recettes à corriger depuis DESSERT
 */
const dessertToOther = {
  'plat': [
    'Boulettes de Pois Chiches à l\'Ail et Persil, Sauce Yaourt',
    'Filet de Poisson Blanc Vapeur, Riz et Légumes de Saison au Yaourt',
    'Mousseline de Pois Chiches et Légumes à la Crème',
    'Pâtes au Poulet, Butternut et Courgettes à la Crème',
    'Quiche Lorraine Mixée aux Lardons et Crème',
    'Quiche Épinards et Fromage à la Crème',
    'Ragoût de Lentilles Corail et Aubergines à la Crème',
    'Waterzooi de Poulet aux Légumes, Riz et Crème'
  ],
  'entrée': [
    'Boulettes de Pois Chiches à l\'Ail et Persil, Sauce Yaourt'
  ],
  'accompagnement': [
    'Garlic Ancho Chile Jam',
    'RÖSTI ET SAUCE À LA POMME'
  ],
  'soupe': [
    'Velouté de Chou-fleur et Pomme de Terre à la Crème',
    'Velouté de Citrouille aux Épices Douces et Crème',
    'Velouté de Pommes de Terre et Carottes à la Crème',
    'Velouté de Potiron et Pommes de Terre à la Crème',
    'Velouté de Tomates et Basilic à la Crème',
    'Velouté de Tomates et Légumes à la Crème'
  ]
};

/**
 * Mappings des recettes à corriger depuis PLAT
 */
const platToOther = {
  'dessert': [
    'Almond Gelatin With Mandarin',
    'Almond Meringue Cookies',
    'ANTICANCER MUFFINS',
    'CHOCOLATE ALMOND BUTTER CUPS',
    'CHOCOLATE-COVERED STRAWBERRIES',
    'CRÈME À LA PÊCHE POUR BÉBÉ',
    'Fromage blanc avec compote de pommes sans sucre ajouté',
    'GLACE AU CITRON ET CITRON VERT',
    'GUGELHOPF',
    'PÂTE SABLÉE',
    'SPEKULATIUS',
    'STOLLEN',
    'Strawberry Roses'
  ],
  'petit-déjeuner': [
    'ANTICANCER MUFFINS',
    'BRETZELS',
    'CRÈME À LA PÊCHE POUR BÉBÉ',
    'Fromage blanc avec compote de pommes sans sucre ajouté',
    'GAUFRES BELGES',
    'HALLAH',
    'Irish Soda Bread And Whiskey Butter',
    'Leona\'s Lefse',
    'Midwestern Whole Wheat Dried Fruit',
    'PAIN AU LEVAIN',
    'PAIN AUX NOIX ET AUX CÉRÉALES',
    'PAIN DE CAMPAGNE',
    'Real French Crepes',
    'STEEL-CUT OVERNIGHT OATS'
  ],
  'boisson': [
    'Black And Tan',
    'LEMON GINGER SHOT',
    'LEMON ICE CUBES',
    'RAINBOW VEGETABLE JUICE FOR DIABETICS'
  ],
  'accompagnement': [
    'BOULETTES DE VIANDE À LA SUÉDOISE',
    'BRETZELS',
    'CAULIFLOWER RICE',
    'CHOCOLATE HAZELNUTELLA',
    'CHUTNEY À LA PÊCHE',
    'CRÈME À LA PÊCHE POUR BÉBÉ',
    'CUMIN AND TURMERIC SEASONING',
    'FRESH FERMENTED SALSA',
    'GARLIC SALT',
    'GLUTEN-FREE TORTILLAS',
    'GUACAMOLE',
    'HARD VEGAN CHEESE',
    'HASH BROWNS',
    'HOMEMADE PROTEIN POWDER',
    'Jerk Seasoning',
    'MASHED CAULIFLOWER',
    'Moroccan Spiced Olives',
    'Naan',
    'OREGANO SAGE SEASONING',
    'PAIN PITTA',
    'PASSATA',
    'PÂTE FEUILLETÉE',
    'PÂTE À CHOUX',
    'Pickled Red Onions',
    'Purée de brocoli au fromage',
    'Purée de brocoli enrichie au fromage',
    'SAUCE BOLOGNAISE',
    'SAUCE BÉCHAMEL',
    'TACO SEASONING',
    'Teriyaki Marinade',
    'VEGAN BUTTER',
    'VEGETABLE SEASONING',
    'WHIPPED COCONUT CREAM'
  ],
  'entrée': [
    'Flan Jambon et Lait d\'Amande Sans Pâte',
    'Japanese Cucumber Salad (Sunomono)',
    'TABBOULEH'
  ]
};

/**
 * Fonction principale
 */
async function fixRemainingCategoryErrors() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    const corrections = [];
    const notFound = [];
    
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
  fixRemainingCategoryErrors()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default fixRemainingCategoryErrors;


