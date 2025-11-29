// scripts/fix-dysphagies-categories.js
// Correction des catégories des recettes dysphagies

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const recipesFile = path.join(__dirname, '../data/dysphagies-recipes.json');
const recipes = JSON.parse(fs.readFileSync(recipesFile, 'utf-8'));

// Mappings de correction des catégories
const categoryCorrections = {
  // Soupes mal classées en PLAT
  'Minestrone': 'soupe',
  
  // Salades (devraient être ENTRÉE)
  'Tomato Cucumber Salad with Red': 'entrée',
  'Tuna Avocado Salad': 'entrée',
  'Celery Root Remoulade': 'entrée',
  'Red Beet Salad with Ranch Dressing': 'entrée',
  'Summer Slaw': 'entrée',
  'Chunk Chicken Salad': 'entrée',
  
  // Desserts mal classés en PLAT
  'Cathie G.\'s Banana Cream Pie': 'dessert',
  'Pumpkin Flan': 'dessert',
  'Thickened Ice Cream': 'dessert',
  'The Ice Cream Sandwich': 'dessert',
  
  // Boissons mal classées en PLAT
  'Mango Lassi': 'boisson',
  
  // Plats mal classés en DESSERT
  'New England Crab Cakes': 'plat',
  
  // Plats principaux mal classés en ACCOMPAGNEMENT
  'Baked Cod with Lemon and Mashed': 'plat',
  'Scrambled Eggs and Mashed': 'petit-déjeuner',
};

// Fonction pour détecter et corriger automatiquement certaines catégories
function detectCorrectCategory(recipe) {
  const nameLower = recipe.name.toLowerCase();
  
  // Salades -> entrée
  if (nameLower.includes('salad') || nameLower.includes('slaw') || nameLower.includes('remoulade')) {
    return 'entrée';
  }
  
  // Soupes -> soupe
  if (nameLower.includes('soup') || nameLower.includes('soupe') || 
      nameLower.includes('minestrone') || nameLower.includes('broth') ||
      nameLower.includes('consommé') || nameLower.includes('potage')) {
    return 'soupe';
  }
  
  // Desserts
  if (nameLower.includes('pie') && (nameLower.includes('cream') || nameLower.includes('banana') || nameLower.includes('pumpkin'))) {
    return 'dessert';
  }
  if (nameLower.includes('flan') || nameLower.includes('pudding') || 
      nameLower.includes('ice cream') || nameLower.includes('cake') ||
      nameLower.includes('cheesecake')) {
    return 'dessert';
  }
  
  // Boissons
  if (nameLower.includes('shake') || nameLower.includes('smoothie') || 
      nameLower.includes('lassi') || nameLower.includes('drink') ||
      nameLower.includes('juice')) {
    return 'boisson';
  }
  
  // Accompagnements (légumes simples, céréales) - mais pas les plats avec protéines
  if (nameLower.match(/^(mashed potatoes|creamed corn|quinoa|farro|buckwheat|barley|grits|beans|rice congee)$/i)) {
    return 'accompagnement';
  }
  if ((nameLower.includes('mashed') || nameLower.includes('roasted')) && 
      (nameLower.includes('potato') || nameLower.includes('vegetable') || 
       nameLower.includes('cauliflower') || nameLower.includes('asparagus'))) {
    // Vérifier si c'est un plat complet ou un accompagnement
    // Ne pas classer en accompagnement si ça contient une protéine (cod, chicken, etc.)
    if (!nameLower.match(/(cod|chicken|beef|pork|fish|salmon|turkey|egg|shrimp)/) && recipe.ingredients.length < 10) {
      return 'accompagnement';
    }
  }
  
  // Petit-déjeuner
  if (nameLower.includes('scrambled eggs') || nameLower.includes('oatmeal') || 
      nameLower.includes('quiche') || nameLower.includes('blintzes')) {
    return 'petit-déjeuner';
  }
  
  return null; // Pas de correction automatique
}

let correctionsCount = 0;
const corrections = [];

recipes.forEach(recipe => {
  const originalCategory = recipe.category;
  let newCategory = originalCategory;
  
  // Vérifier les corrections manuelles
  if (categoryCorrections[recipe.name]) {
    newCategory = categoryCorrections[recipe.name];
  } else {
    // Détection automatique
    const detected = detectCorrectCategory(recipe);
    if (detected && detected !== originalCategory) {
      newCategory = detected;
    }
  }
  
  if (newCategory !== originalCategory) {
    corrections.push({
      name: recipe.name,
      from: originalCategory,
      to: newCategory
    });
    recipe.category = newCategory;
    correctionsCount++;
  }
});

console.log(`\n🔧 Correction des catégories\n`);
console.log('='.repeat(80));

if (corrections.length > 0) {
  console.log(`\n✅ ${correctionsCount} recettes corrigées :\n`);
  corrections.forEach((corr, index) => {
    console.log(`${index + 1}. ${corr.name}`);
    console.log(`   ${corr.from.toUpperCase()} → ${corr.to.toUpperCase()}\n`);
  });
} else {
  console.log('\n✅ Aucune correction nécessaire\n');
}

// Sauvegarder les recettes corrigées
fs.writeFileSync(recipesFile, JSON.stringify(recipes, null, 2), 'utf-8');
console.log(`\n✅ Recettes sauvegardées dans ${recipesFile}\n`);

// Afficher la nouvelle répartition
const byCategory = {};
recipes.forEach(recipe => {
  if (!byCategory[recipe.category]) {
    byCategory[recipe.category] = [];
  }
  byCategory[recipe.category].push(recipe);
});

console.log('📊 Nouvelle répartition par catégorie :\n');
Object.keys(byCategory).sort().forEach(category => {
  console.log(`  ${category.toUpperCase()}: ${byCategory[category].length} recettes`);
});
console.log('');

