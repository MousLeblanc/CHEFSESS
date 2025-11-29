// scripts/fix-and-categorize-recipes.js
// Script pour corriger les catégories et ajouter des sous-catégories pour les plats
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Détecter le type de plat (végétarien, poisson, viande, volaille)
 */
function detectPlatType(recipe) {
  const name = (recipe.name || '').toLowerCase();
  const ingredients = (recipe.ingredients || []).map(i => i.name.toLowerCase()).join(' ');
  const allText = `${name} ${ingredients}`.toLowerCase();
  
  // Mots-clés pour les volailles
  const volailleKeywords = [
    'chicken', 'poulet', 'turkey', 'dinde', 'duck', 'canard', 'goose', 'oie',
    'quail', 'caille', 'poussin', 'coq', 'hen', 'poule', 'volaille'
  ];
  
  // Mots-clés pour les poissons et fruits de mer
  const poissonKeywords = [
    'fish', 'poisson', 'salmon', 'saumon', 'tuna', 'thon', 'cod', 'cabillaud',
    'trout', 'truite', 'sardine', 'anchovy', 'anchois', 'mackerel', 'maquereau',
    'tilapia', 'sole', 'bass', 'bar', 'seabass', 'dorade', 'daurade', 'ray',
    'raie', 'shrimp', 'crevette', 'crab', 'crabe', 'lobster', 'homard',
    'prawn', 'langoustine', 'mussel', 'moule', 'oyster', 'huître', 'clam',
    'palourde', 'squid', 'calmar', 'octopus', 'poulpe', 'scallop', 'coquille',
    'seafood', 'fruits de mer', 'fruits-de-mer'
  ];
  
  // Mots-clés pour les viandes
  const viandeKeywords = [
    'beef', 'boeuf', 'bœuf', 'steak', 'veal', 'veau', 'lamb', 'agneau',
    'mutton', 'mouton', 'pork', 'porc', 'bacon', 'lardons', 'ham', 'jambon',
    'sausage', 'saucisse', 'chorizo', 'pancetta', 'prosciutto', 'jambon cru',
    'meat', 'viande', 'burger', 'meatball', 'boulette', 'meatloaf',
    'ribs', 'côtes', 'roast', 'rôti', 'stew', 'ragoût', 'goulash'
  ];
  
  // Vérifier d'abord les volailles
  if (volailleKeywords.some(keyword => allText.includes(keyword))) {
    return 'volaille';
  }
  
  // Ensuite les poissons
  if (poissonKeywords.some(keyword => allText.includes(keyword))) {
    return 'poisson';
  }
  
  // Ensuite les viandes
  if (viandeKeywords.some(keyword => allText.includes(keyword))) {
    return 'viande';
  }
  
  // Sinon, c'est végétarien
  return 'végétarien';
}

/**
 * Détecter la catégorie principale correcte
 */
function detectCorrectCategory(recipe) {
  const name = (recipe.name || '').toLowerCase().trim();
  const ingredients = (recipe.ingredients || []).map(i => i.name.toLowerCase()).join(' ');
  const allText = `${name} ${ingredients}`.toLowerCase();
  
  // Détecter les boissons - doit être dans le nom principal
  const boissonNamePatterns = [
    /^(iced\s+)?coffee$/i,
    /^.*\s+(smoothie|juice|drink|beverage|tea|latte|shake|lemonade|water|milk)$/i,
    /^(golden\s+milk|tumeric\s+latte|detox\s+water|sea\s+salt\s+flush|lemon\s+water|energy\s+tea|ginger\s+tea)$/i,
    /^(chocolate|strawberry|almond|coconut|flax|nut|seed|tigernut)\s+milk$/i,
    /^.*\s+(sorbet|glace)$/i
  ];
  
  if (boissonNamePatterns.some(pattern => pattern.test(name))) {
    return 'boisson';
  }
  
  // Détecter les soupes - doit être dans le nom principal
  const soupeNamePatterns = [
    /^(.*\s+)?(soup|soupe|broth|bouillon|consommé|potage|velouté)$/i,
    /^(gaspacho|bortsch|minestrone|pho|ramen|udon|wonton\s+soup|chowder|bisque)$/i,
    /^(chicken\s+noodle\s+soup|tomato\s+soup|mushroom\s+soup|lentil\s+soup|vegetable\s+soup|fish\s+soup)$/i
  ];
  
  if (soupeNamePatterns.some(pattern => pattern.test(name))) {
    // Mais exclure les plats qui contiennent "soup" mais ne sont pas des soupes
    if (!name.includes('stew') && !name.includes('goulash') && 
        !name.includes('casserole') && !name.includes('pie')) {
      return 'soupe';
    }
  }
  
  // Détecter les desserts - doit être dans le nom principal
  const dessertNamePatterns = [
    /^(.*\s+)?(dessert|cake|pie|tart|tarte|pudding|mousse|crème|flan|tiramisu|cheesecake|brownie|cookie|biscuit|scone|muffin|waffle|gaufre|pancake|crepe|crêpe|ice\s+cream|gelato|sorbet|compote|jam|marmalade|chocolate|sweet|sugar|candy|bonbon|truffle|fudge|caramel|toffee|meringue|macaron|eclair|profiterole|parfait|sundae|strudel|baklava|cannoli|panna\s+cotta|sabayon|syllabub|trifle|pavlova|soufflé|clafoutis|tarte\s+tatin|crumble|cobbler|crisp|buckle|pandowdy|galette|charlotte|bavarois|bombe|semifreddo|granita|sherbet|yogurt|yaourt|fromage\s+blanc|rice\s+pudding|riz\s+au\s+lait)$/i
  ];
  
  // Exclure les plats salés qui contiennent "pie" ou "cake"
  const notDessertPatterns = [
    /(corned\s+beef|hash|potato\s+pie|meat\s+pie|shepherd|cottage\s+pie|fish\s+pie|chicken\s+pie|beef\s+pie|pork\s+pie)/i,
    /(sausage|ham|bacon|chorizo|pancetta|prosciutto|salmon|tuna|cod|chicken|beef|pork|lamb|turkey|duck|veal|steak|burger|meatball|meatloaf|stew|casserole|gratin)/i
  ];
  
  if (notDessertPatterns.some(pattern => pattern.test(allText))) {
    // C'est un plat salé
  } else if (dessertNamePatterns.some(pattern => pattern.test(name))) {
    return 'dessert';
  }
  
  // Détecter les entrées - salades et entrées simples
  if (name.match(/^(.*\s+)?(salad|salade)$/i) && 
      !name.includes('sauce') && !name.includes('dressing')) {
    return 'entrée';
  }
  
  // Détecter les accompagnements - sauces simples, purées simples, etc.
  if (name.match(/^(.*\s+)?(sauce|dressing|marinara|pesto|aioli|mayonnaise|ketchup|mustard|relish|chutney|pickle|pickles)$/i) &&
      !name.includes('salad') && !name.includes('salade')) {
    return 'accompagnement';
  }
  
  // Purées simples (sans viande/poisson)
  if (name.match(/^(purée|purée|mashed)\s+(de\s+)?(pommes\s+de\s+terre|potato|carottes|carrot|courgettes|zucchini)/i) &&
      !allText.match(/(chicken|poulet|beef|boeuf|fish|poisson|salmon|saumon|tuna|thon)/i)) {
    return 'accompagnement';
  }
  
  // Détecter les petits-déjeuners
  if (name.match(/^(.*\s+)?(breakfast|petit-déjeuner|petit\s+dejeuner|morning|matin|cereal|céréale|oatmeal|porridge|granola|muesli|toast|pain|bread|bagel|croissant|brioche|pancake|waffle|gaufre|crepe|crêpe|omelet|omelette|scrambled|brouillé|hash\s+brown|röstis)$/i) &&
      !allText.includes('dinner') && !allText.includes('dîner') &&
      !allText.includes('lunch') && !allText.includes('déjeuner')) {
    return 'petit-déjeuner';
  }
  
  // Par défaut, c'est un plat
  return 'plat';
}

/**
 * Fonction principale
 */
async function fixAndCategorizeRecipes() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    // Récupérer toutes les recettes
    console.log('📖 Récupération de toutes les recettes...');
    const allRecipes = await RecipeEnriched.find({}).lean();
    console.log(`✅ ${allRecipes.length} recette(s) trouvée(s)\n`);
    
    // Analyser et corriger
    console.log('🔍 Analyse et correction des catégories...\n');
    
    const corrections = [];
    const platTypes = {
      'végétarien': [],
      'poisson': [],
      'viande': [],
      'volaille': []
    };
    
    for (const recipe of allRecipes) {
      const currentCategory = recipe.category || 'plat';
      const correctCategory = detectCorrectCategory(recipe);
      
      // Si c'est un plat, détecter le type
      let platType = null;
      if (correctCategory === 'plat') {
        platType = detectPlatType(recipe);
        platTypes[platType].push({
          id: recipe._id,
          name: recipe.name
        });
      }
      
      if (currentCategory !== correctCategory) {
        corrections.push({
          id: recipe._id,
          name: recipe.name,
          oldCategory: currentCategory,
          newCategory: correctCategory,
          platType: platType
        });
      } else if (correctCategory === 'plat' && platType) {
        // Même si la catégorie est correcte, on doit ajouter le type de plat
        corrections.push({
          id: recipe._id,
          name: recipe.name,
          oldCategory: currentCategory,
          newCategory: correctCategory,
          platType: platType,
          updateOnly: true // Juste mettre à jour les tags
        });
      }
    }
    
    // Afficher les statistiques des types de plats
    console.log('📊 RÉPARTITION DES PLATS PAR TYPE:');
    console.log('-'.repeat(80));
    Object.entries(platTypes).forEach(([type, recipes]) => {
      console.log(`  ${type.padEnd(15)} : ${recipes.length} recette(s)`);
    });
    console.log();
    
    // Afficher les corrections
    const categoryCorrections = corrections.filter(c => !c.updateOnly);
    console.log(`📊 ${categoryCorrections.length} correction(s) de catégorie à effectuer:\n`);
    
    const correctionsByCategory = {};
    categoryCorrections.forEach(corr => {
      const key = `${corr.oldCategory} → ${corr.newCategory}`;
      if (!correctionsByCategory[key]) {
        correctionsByCategory[key] = [];
      }
      correctionsByCategory[key].push(corr);
    });
    
    Object.entries(correctionsByCategory)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .forEach(([key, items]) => {
        console.log(`  ${key}: ${items.length} recette(s)`);
        items.slice(0, 3).forEach(item => {
          console.log(`    - "${item.name}"`);
        });
        if (items.length > 3) {
          console.log(`    ... et ${items.length - 3} autres`);
        }
        console.log();
      });
    
    // Appliquer les corrections
    if (corrections.length > 0) {
      console.log('🔄 Application des corrections...\n');
      
      let updated = 0;
      for (const correction of corrections) {
        const updateData = {
          category: correction.newCategory
        };
        
        // Ajouter le type de plat dans les tags
        if (correction.platType) {
          const currentTags = correction.updateOnly ? 
            (await RecipeEnriched.findById(correction.id).select('tags').lean())?.tags || [] :
            [];
          
          // Supprimer les anciens tags de type de plat
          const tagsWithoutType = (currentTags || []).filter(tag => 
            !tag.includes('type:') && 
            !tag.includes('végétarien') && 
            !tag.includes('poisson') && 
            !tag.includes('viande') && 
            !tag.includes('volaille')
          );
          
          // Ajouter le nouveau tag
          const newTags = [...tagsWithoutType, `type:${correction.platType}`];
          updateData.tags = newTags;
        }
        
        await RecipeEnriched.updateOne(
          { _id: correction.id },
          { $set: updateData }
        );
        updated++;
        
        if (updated % 50 === 0) {
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
    stats.forEach(stat => {
      const percentage = ((stat.count / allRecipes.length) * 100).toFixed(1);
      console.log(`  ${stat._id.padEnd(20)} : ${stat.count.toString().padStart(4)} recettes (${percentage}%)`);
    });
    
    // Statistiques des types de plats
    const platStats = await RecipeEnriched.aggregate([
      { $match: { category: 'plat' } },
      { $unwind: { path: '$tags', preserveNullAndEmptyArrays: true } },
      { $match: { tags: { $regex: /^type:/ } } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    if (platStats.length > 0) {
      console.log('\n📊 RÉPARTITION DES PLATS PAR TYPE:');
      console.log('-'.repeat(80));
      platStats.forEach(stat => {
        const type = stat._id.replace('type:', '');
        const percentage = ((stat.count / platStats.reduce((a, b) => a + b.count, 0)) * 100).toFixed(1);
        console.log(`  ${type.padEnd(15)} : ${stat.count.toString().padStart(4)} recettes (${percentage}%)`);
      });
    }
    
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
  fixAndCategorizeRecipes()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default fixAndCategorizeRecipes;


