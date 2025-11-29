// scripts/fix-specific-recipes-categories.js
// Script pour corriger des recettes spécifiques selon la liste fournie
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Mappings des recettes à déplacer
 */
const categoryMappings = {
  // Boissons
  'boisson': [
    'ACAI BOWL',
    'ALMOND GELATIN WITH MANDARIN',
    'BLACK AND TAN',
    'Boisson Protéinée au Cacao Maison',
    'Boisson lactée au lait sucré',
    'DAIQUIRI GLACÉ À LA FRAISE',
    'Easy Mango Lassi',
    'MARGARITA',
    'Smoothie Banane-Fraise au Jus d\'Orange',
    'Smoothie aux Fraises, Framboises et Yaourt Nature',
    'Smoothie banane lait en poudre',
    'Smoothie crémeux aux épinards, banane et amandes',
    'THE SMOOTHIE CURE'
  ],
  
  // Desserts
  'dessert': [
    'ALMOND MERINGUE COOKIES',
    'BISCOTTI',
    'BROWNIES AUX DEUX CHOCOLATS',
    'BUÑUELOS DE MANZANA',
    'Cake Moelleux à l\'Orange et Beurre Fondu',
    'Chocolate Banana Brownies',
    'Chocolate Banana Crepes',
    'CLASSIC THREE-INGREDIENT CHOCOLATE BALLS',
    'CRÈME ANGLAISE',
    'CRÈME MOUSSELINE',
    'CRÈME PÂTISSIÈRE',
    'CRÊPES AUX POMMES',
    'Crème aux Œufs à la Vanille',
    'Crème de Millet Douceur Vanillée au Lait',
    'Crème de riz au lait d\'amande',
    'Crème de semoule au lait enrichi',
    'Crème de semoule enrichie',
    'Crème dessert enrichie chocolat',
    'Crêpes aux fruits',
    'Dutch Apple Pie With Oatmeal Streusel',
    'Egg Halwa',
    'Flan Crémeux au Lait et Sucre Caramélisé',
    'Flan Laitier aux Œufs et Sucre',
    'Flan au Chocolat et Cacao Intense',
    'GALETTE À LA FRANGIPANE',
    'GÂTEAU AU FROMAGE ET AUX RAISINS SECS',
    'GÂTEAU AUX AMANDES',
    'GÂTEAU AUX PRUNES',
    'GÂTEAU DE SAVOIE',
    'GÂTEAU MARBRÉ',
    'GÂTEAU ROULÉ STYLE FORÊT-NOIRE',
    'GÂTEAU À L\'ABRICOT',
    'GÂTEAU À L\'ORANGE',
    'GÂTEAU À L\'ORANGE ET AU CITRON',
    'Gâteau aux pommes sans gluten à l\'édulcorant',
    'KAISERSCHMARREN',
    'KAMMERJUNKERS',
    'LEBKUCHEN',
    'Madeleines II',
    'MERINGUES',
    'MINI CASHEW CHEESECAKES',
    'MOUSSE AU CHOCOLAT',
    'MUFFINS AUX MYRTILLES',
    'Mousse Lait et Crème à la Vanille',
    'Mousse aérienne au chocolat noir et stevia',
    'Mousse de Poires Légèrement Sucrée',
    'Mousse lisse au lait et vanille',
    'Olie Bollen',
    'PANETTONE',
    'PARFAIT À LA FRAMBOISE',
    'PAVLOVA À LA FRAISE ET AU FRUIT DE LA PASSION',
    'Pfeffernuesse IV',
    'Poire au Chocolat Sans Sucre',
    'Portuguese Custard Tarts Pasteis De',
    'POTS DE CRÈME AU CHOCOLAT',
    'Purée de pommes au cannelle',
    'RAW CHOCOLATE CHIP COOKIE DOUGH',
    'ROASTED HAZELNUT CHOCOLATE BLOCK',
    'ROCHERS À LA NOIX DE COCO',
    'RÖSTI ET SAUCE À LA POMME',
    'SACHERTORTE',
    'SCONES AUX RAISINS DE SMYRNE',
    'Scottish Shortbread IV',
    'SHORTBREAD',
    'SORBET À LA MANGUE',
    'Speculaas',
    'STRAWBERRY-BALSAMIC PASTA',
    'STRAWBERRY ROSES',
    'STRUDEL AUX POMMES',
    'Swedish Cream',
    'Swedish Ground Almond Spritz Cookies',
    'Swedish Wafers',
    'Syrniki',
    'TARTE AU CHOCOLAT ET AUX FRAMBOISES',
    'TARTE AU CITRON',
    'TARTE AUX POMMES À L\'ANGLAISE',
    'Tarte aux Fruits Frais et Crème Vanillée',
    'Tarte aux Pommes Gourmande à la Crème et Beurre',
    'Tarte aux Pommes et Cannelle sur Pâte Brisée Sans Œuf',
    'Tartelettes Ananas et Crème au Rhum et Amandes',
    'Tiramisu Classique au Mascarpone et Café Amaretto',
    'Yaourt à la vanille avec des fruits frais',
    'ÎLE FLOTTANTE'
  ],
  
  // Soupes
  'soupe': [
    'Consommé Clarifié de Volaille aux Léger Légumes en Brunoise',
    'Consommé de Légumes et Vermicelles',
    'Cullen Skink',
    'Gaspacho Andalou aux Tomates, Concombre et Poivron',
    'Jean Pierre\'s Cod Fish Soup',
    'KIDNEY BEAN SOUP WITH WATERCRESS AND KALE',
    'LAKSA',
    'Octopus And Ceci Bean Zuppa With',
    'Potage Parmentier aux Pommes de Terre et Poireaux',
    'Potage Santé au Cerfeuil, Poireaux et Pommes de Terre',
    'Potage aux carottes, poireaux et pommes de terre',
    'Potage de Carottes, Poireaux et Tomates au Bouillon Léger',
    'Potage de Courge au Gingembre et Lait de Coco',
    'Potage de Petits Pois à la Menthe',
    'Potage de lentilles et poulet',
    'Potage haché de carottes, pommes de terre et courgettes',
    'Potage onctueux aux légumes de saison',
    'Soupe Cubaine aux Haricots Noirs et Légumes',
    'Soupe Douce de Tomates avec Vermicelles',
    'Soupe Froide d\'Avocat et Lait de Coco à la Coriandre',
    'Soupe Italienne aux Haricots, Tomates, Ail et Herbes Aromatiques',
    'Soupe Mexicaine au Poulet, Tomates et Tortillas',
    'Soupe Miso au Tofu Soyeux et Wakame',
    'Soupe Mixée de Courgettes et Tomates au Basilic',
    'Soupe Mixée de Lentilles Vertes et Légumes Racines',
    'Soupe Mixée de Pommes de Terre, Fromage et Pommes',
    'Soupe Paysanne aux Carottes, Poireaux et Vermicelles',
    'Soupe Paysanne à l\'Ail et Jaune d\'Œuf',
    'Soupe Provençale au Pistou, Légumes et Haricots Blancs',
    'Soupe Tendre aux Oeufs, Pâtes et Légumes Parfumés au Cumin',
    'Soupe Thaï au Poulet, Lait de Coco et Champignons',
    'Soupe Thaïlandaise aux Crevettes et Champignons',
    'Soupe Wonton au Bouillon de Volaille et Bok Choy',
    'Soupe d\'Orge Perlé au Jambon Fumé et Légumes',
    'Soupe de Carottes au Bouillon de Légumes Sans Gluten',
    'Soupe de Dinde et Butternut au Curcuma',
    'Soupe de Lentilles Corail, Riz et Légumes Verts',
    'Soupe de Maïs et Poivron Rouge au Cumin',
    'Soupe de Pois Cassés aux Lardons et Légumes',
    'Soupe de Poissons Blancs aux Légumes et Rouille Safranée',
    'Soupe de Ravioles et Carottes au Bouillon de Volaille',
    'Soupe de Tomates et Légumes à l\'Huile d\'Olive',
    'Soupe moulinée de poulet, pommes de terre et poivrons au cumin',
    'Soupe tendre de cabillaud, quinoa et légumes variés',
    'Soupe à l\'Oignon Gratinée au Vin Blanc et Gruyère',
    'Soupe à la Bière et Oignons avec Croûtons',
    'Soupette de Dinde aux Petits Pois et Riz',
    'Tom Ka Gai (Coconut Chicken Soup)',
    'Vegetarian Moroccan Harira',
    'Vietnamese Beef Pho',
    'Wonton Soup Without Ginger'
  ]
};

/**
 * Recettes à déplacer depuis ACCOMPAGNEMENT vers DESSERT
 */
const accompagnementToDessert = [
  'ICE CREAM BITES WITH CHOCOLATE SAUCE'
];

/**
 * Fonction principale
 */
async function fixSpecificRecipesCategories() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    const corrections = [];
    const notFound = [];
    
    // Traiter les mappings par catégorie
    for (const [newCategory, recipeNames] of Object.entries(categoryMappings)) {
      console.log(`\n🔍 Recherche des recettes à déplacer vers "${newCategory}"...`);
      
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
    
    // Traiter les recettes depuis ACCOMPAGNEMENT vers DESSERT
    console.log(`\n🔍 Recherche des recettes à déplacer depuis ACCOMPAGNEMENT vers DESSERT...`);
    for (const recipeName of accompagnementToDessert) {
      const recipe = await RecipeEnriched.findOne({ name: recipeName }).lean();
      
      if (recipe) {
        const currentCategory = recipe.category || 'accompagnement';
        
        if (currentCategory !== 'dessert') {
          corrections.push({
            id: recipe._id,
            name: recipeName,
            oldCategory: currentCategory,
            newCategory: 'dessert'
          });
        }
      } else {
        notFound.push(recipeName);
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
  fixSpecificRecipesCategories()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default fixSpecificRecipesCategories;

