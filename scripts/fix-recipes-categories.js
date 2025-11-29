// scripts/fix-recipes-categories.js
// Script pour corriger les catégories des recettes dans MongoDB
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Détecter la catégorie correcte basée sur le nom et les ingrédients
 */
function detectCorrectCategory(recipe) {
  const name = (recipe.name || '').toLowerCase();
  const ingredients = (recipe.ingredients || []).map(i => i.name.toLowerCase()).join(' ');
  const allText = `${name} ${ingredients}`.toLowerCase();
  
  // Détecter les boissons
  const boissonKeywords = [
    'smoothie', 'juice', 'drink', 'beverage', 'tea', 'coffee', 'iced coffee', 
    'latte', 'milk', 'shake', 'water', 'lemonade', 'golden milk', 'tumeric latte',
    'detox water', 'sea salt flush', 'lemon water', 'energy tea', 'ginger tea',
    'chocolate milk', 'strawberry milk', 'almond milk', 'coconut milk', 'flax milk',
    'nut milk', 'seed milk', 'tigernut milk', 'soda', 'cola', 'sorbet', 'glace'
  ];
  
  if (boissonKeywords.some(keyword => allText.includes(keyword))) {
    return 'boisson';
  }
  
  // Détecter les soupes
  const soupeKeywords = [
    'soup', 'soupe', 'broth', 'bouillon', 'consommé', 'potage', 'velouté',
    'gaspacho', 'bortsch', 'minestrone', 'pho', 'ramen', 'udon', 'wonton soup',
    'chicken noodle soup', 'tomato soup', 'mushroom soup', 'lentil soup',
    'vegetable soup', 'fish soup', 'chowder', 'bisque', 'goulash'
  ];
  
  if (soupeKeywords.some(keyword => allText.includes(keyword))) {
    return 'soupe';
  }
  
  // Détecter les desserts
  const dessertKeywords = [
    'dessert', 'cake', 'pie', 'tart', 'tarte', 'pudding', 'mousse', 'crème',
    'flan', 'tiramisu', 'cheesecake', 'brownie', 'cookie', 'biscuit', 'scone',
    'muffin', 'waffle', 'gaufre', 'pancake', 'crepe', 'crêpe', 'ice cream',
    'gelato', 'sorbet', 'compote', 'jam', 'marmalade', 'chocolate', 'sweet',
    'sugar', 'candy', 'bonbon', 'truffle', 'fudge', 'caramel', 'toffee',
    'meringue', 'macaron', 'eclair', 'profiterole', 'parfait', 'sundae',
    'strudel', 'baklava', 'cannoli', 'panna cotta', 'sabayon', 'syllabub',
    'trifle', 'pavlova', 'soufflé', 'clafoutis', 'tarte tatin', 'crumble',
    'cobbler', 'crisp', 'buckle', 'pandowdy', 'galette', 'charlotte',
    'bavarois', 'bombe', 'semifreddo', 'granita', 'sherbet', 'sorbet',
    'yogurt', 'yaourt', 'fromage blanc', 'rice pudding', 'riz au lait',
    'semoule', 'chocolate cake', 'vanilla cake', 'spice cake', 'fruit cake'
  ];
  
  // Exclure les plats salés qui contiennent certains mots
  const notDessertKeywords = [
    'corned beef', 'hash', 'potato pie', 'meat pie', 'shepherd', 'cottage pie',
    'fish pie', 'chicken pie', 'beef pie', 'pork pie', 'sausage', 'ham',
    'bacon', 'chorizo', 'pancetta', 'prosciutto', 'salmon', 'tuna', 'cod',
    'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'veal', 'steak',
    'burger', 'meatball', 'meatloaf', 'stew', 'casserole', 'gratin'
  ];
  
  if (notDessertKeywords.some(keyword => allText.includes(keyword))) {
    // C'est un plat salé, pas un dessert
  } else if (dessertKeywords.some(keyword => allText.includes(keyword))) {
    return 'dessert';
  }
  
  // Détecter les entrées
  const entreeKeywords = [
    'salad', 'salade', 'entrée', 'starter', 'appetizer', 'hors d\'oeuvre',
    'antipasto', 'tapas', 'mezze', 'bruschetta', 'crostini', 'canapé',
    'tartine', 'dip', 'hummus', 'baba ghanoush', 'tzatziki', 'guacamole',
    'salsa', 'pesto', 'marinara', 'sauce', 'dressing', 'vinaigrette',
    'spring roll', 'rouleau de printemps', 'samosa', 'empanada', 'calzone'
  ];
  
  // Mais attention : certaines sauces et salades peuvent être des accompagnements
  if (name.includes('sauce') || name.includes('dressing') || name.includes('marinara')) {
    // Vérifier si c'est vraiment une entrée ou un accompagnement
    if (name.includes('salad') || name.includes('salade')) {
      return 'entrée';
    }
    // Les sauces simples sont plutôt des accompagnements
    if (!name.includes('salad') && !name.includes('salade') && 
        (name.includes('sauce') || name.includes('dressing'))) {
      return 'accompagnement';
    }
  }
  
  if (entreeKeywords.some(keyword => allText.includes(keyword)) && 
      !name.includes('sauce') && !name.includes('dressing')) {
    return 'entrée';
  }
  
  // Détecter les accompagnements
  const accompagnementKeywords = [
    'side', 'accompagnement', 'garnish', 'garniture', 'topping',
    'purée', 'mashed', 'fries', 'frites', 'roasted', 'rôti', 'grilled',
    'sauté', 'steamed', 'vapeur', 'boiled', 'cooked', 'cuit',
    'sauce', 'dressing', 'marinara', 'pesto', 'aioli', 'mayonnaise',
    'ketchup', 'mustard', 'relish', 'chutney', 'pickle', 'pickles',
    'bread', 'pain', 'roll', 'bun', 'baguette', 'toast', 'crouton',
    'rice', 'riz', 'pasta', 'pâtes', 'noodles', 'noodles', 'quinoa',
    'couscous', 'bulgur', 'polenta', 'grits', 'risotto', 'pilaf'
  ];
  
  // Mais si c'est un plat principal avec ces ingrédients, c'est un plat
  const platPrincipalKeywords = [
    'with', 'aux', 'au', 'à la', 'and', 'et', 'stuffed', 'farcis',
    'filled', 'gratin', 'casserole', 'lasagna', 'lasagne', 'pasta',
    'spaghetti', 'tagliatelle', 'fettuccine', 'penne', 'rigatoni',
    'ravioli', 'cannelloni', 'gnocchi', 'risotto', 'paella', 'curry',
    'stir fry', 'wok', 'tacos', 'burrito', 'enchilada', 'quesadilla',
    'burger', 'sandwich', 'wrap', 'pizza', 'calzone', 'pie', 'tarte'
  ];
  
  // Si le nom contient "with", "aux", etc. et des ingrédients principaux, c'est un plat
  if (platPrincipalKeywords.some(keyword => name.includes(keyword)) &&
      (allText.includes('chicken') || allText.includes('beef') || 
       allText.includes('pork') || allText.includes('fish') || 
       allText.includes('salmon') || allText.includes('shrimp') ||
       allText.includes('tofu') || allText.includes('vegetable') ||
       allText.includes('pasta') || allText.includes('noodles'))) {
    return 'plat';
  }
  
  // Si c'est juste une sauce ou un accompagnement simple
  if (accompagnementKeywords.some(keyword => allText.includes(keyword)) &&
      !platPrincipalKeywords.some(keyword => name.includes(keyword))) {
    return 'accompagnement';
  }
  
  // Détecter les petits-déjeuners
  const petitDejeunerKeywords = [
    'breakfast', 'petit-déjeuner', 'petit dejeuner', 'morning', 'matin',
    'cereal', 'céréale', 'oatmeal', 'porridge', 'granola', 'muesli',
    'toast', 'pain', 'bread', 'bagel', 'croissant', 'brioche', 'pancake',
    'waffle', 'gaufre', 'crepe', 'crêpe', 'omelet', 'omelette', 'scrambled',
    'brouillé', 'bacon', 'sausage', 'saucisse', 'hash brown', 'röstis'
  ];
  
  if (petitDejeunerKeywords.some(keyword => allText.includes(keyword)) &&
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
async function fixRecipesCategories() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    // Récupérer toutes les recettes
    console.log('📖 Récupération de toutes les recettes...');
    const allRecipes = await RecipeEnriched.find({}).lean();
    console.log(`✅ ${allRecipes.length} recette(s) trouvée(s)\n`);
    
    // Analyser et corriger les catégories
    console.log('🔍 Analyse et correction des catégories...\n');
    
    const corrections = [];
    const titlesTronques = [];
    const statsByCategory = {
      'plat': 0,
      'soupe': 0,
      'accompagnement': 0,
      'dessert': 0,
      'boisson': 0,
      'entrée': 0,
      'petit-déjeuner': 0,
      'purée': 0
    };
    
    for (const recipe of allRecipes) {
      const currentCategory = recipe.category || 'plat';
      const correctCategory = detectCorrectCategory(recipe);
      
      // Détecter les titres tronqués (se terminent par des espaces ou des parenthèses ouvertes)
      const name = recipe.name || '';
      if (name.trim().endsWith('(') || 
          name.trim().endsWith('In') || 
          name.trim().endsWith('(Dou') ||
          name.trim().endsWith('(Red') ||
          name.trim().endsWith('(Greek') ||
          name.match(/\s{3,}$/) || // Plusieurs espaces à la fin
          name.length > 0 && name[name.length - 1] === ' ') {
        titlesTronques.push({
          id: recipe._id,
          name: name,
          category: currentCategory
        });
      }
      
      if (currentCategory !== correctCategory) {
        corrections.push({
          id: recipe._id,
          name: name,
          oldCategory: currentCategory,
          newCategory: correctCategory
        });
      }
      
      statsByCategory[correctCategory] = (statsByCategory[correctCategory] || 0) + 1;
    }
    
    // Afficher les titres tronqués
    if (titlesTronques.length > 0) {
      console.log(`⚠️  ${titlesTronques.length} titre(s) tronqué(s) détecté(s):`);
      titlesTronques.slice(0, 20).forEach(item => {
        console.log(`   - "${item.name}" (catégorie: ${item.category})`);
      });
      if (titlesTronques.length > 20) {
        console.log(`   ... et ${titlesTronques.length - 20} autres`);
      }
      console.log();
    }
    
    // Afficher les corrections à faire
    console.log(`📊 ${corrections.length} correction(s) de catégorie à effectuer:\n`);
    
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
        items.slice(0, 5).forEach(item => {
          console.log(`    - "${item.name}"`);
        });
        if (items.length > 5) {
          console.log(`    ... et ${items.length - 5} autres`);
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
        
        if (updated % 50 === 0) {
          console.log(`  ✅ ${updated}/${corrections.length} corrections appliquées...`);
        }
      }
      
      console.log(`\n✅ ${updated} recette(s) mise(s) à jour`);
    } else {
      console.log('✅ Aucune correction nécessaire');
    }
    
    // Afficher les nouvelles statistiques
    console.log('\n📊 NOUVELLES STATISTIQUES PAR CATÉGORIE:');
    console.log('-'.repeat(80));
    Object.entries(statsByCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        const percentage = ((count / allRecipes.length) * 100).toFixed(1);
        console.log(`  ${cat.padEnd(20)} : ${count.toString().padStart(4)} recettes (${percentage}%)`);
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
  fixRecipesCategories()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default fixRecipesCategories;


