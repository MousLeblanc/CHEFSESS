// scripts/verify-dysphagies-categories.js
// Vérification des catégories des recettes dysphagies avant injection

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const recipesFile = path.join(__dirname, '../data/dysphagies-recipes.json');
const recipes = JSON.parse(fs.readFileSync(recipesFile, 'utf-8'));

console.log(`\n📊 Analyse de ${recipes.length} recettes\n`);
console.log('='.repeat(80));

// Grouper par catégorie
const byCategory = {};
recipes.forEach(recipe => {
  if (!byCategory[recipe.category]) {
    byCategory[recipe.category] = [];
  }
  byCategory[recipe.category].push(recipe);
});

// Afficher les statistiques par catégorie
console.log('\n📈 Répartition par catégorie :\n');
Object.keys(byCategory).sort().forEach(category => {
  console.log(`  ${category.toUpperCase()}: ${byCategory[category].length} recettes`);
});

// Lister toutes les recettes par catégorie
console.log('\n' + '='.repeat(80));
console.log('\n📋 Liste détaillée par catégorie :\n');

Object.keys(byCategory).sort().forEach(category => {
  console.log(`\n${'─'.repeat(80)}`);
  console.log(`\n${category.toUpperCase()} (${byCategory[category].length} recettes)`);
  console.log('─'.repeat(80));
  
  byCategory[category].forEach((recipe, index) => {
    console.log(`\n${index + 1}. ${recipe.name}`);
    console.log(`   Portions: ${recipe.servings}`);
    console.log(`   Ingrédients: ${recipe.ingredients.length}`);
    console.log(`   Étapes: ${recipe.preparationSteps.length}`);
    console.log(`   Tags: ${recipe.tags.slice(0, 3).join(', ')}${recipe.tags.length > 3 ? '...' : ''}`);
    console.log(`   Allergènes: ${recipe.allergens.length > 0 ? recipe.allergens.join(', ') : 'Aucun'}`);
    console.log(`   Régimes: ${recipe.dietaryRestrictions.length > 0 ? recipe.dietaryRestrictions.join(', ') : 'Aucun'}`);
    
    // Vérifier si la catégorie semble correcte
    const nameLower = recipe.name.toLowerCase();
    let suggestedCategory = category;
    let warning = '';
    
    if (category === 'soupe' && !nameLower.includes('soup') && !nameLower.includes('soupe')) {
      warning = '⚠️  Nom ne contient pas "soup/soupe"';
    } else if (category === 'boisson' && !nameLower.match(/(shake|smoothie|drink|boisson|juice)/)) {
      warning = '⚠️  Nom ne suggère pas une boisson';
    } else if (category === 'dessert' && !nameLower.match(/(dessert|pudding|cake|pie|ice cream|sweet)/)) {
      warning = '⚠️  Nom ne suggère pas un dessert';
    } else if (category === 'plat' && nameLower.match(/(soup|soupe|shake|smoothie|dessert|pudding)/)) {
      warning = '⚠️  Nom suggère une autre catégorie';
    }
    
    if (warning) {
      console.log(`   ${warning}`);
    }
  });
});

// Vérifier les catégories potentiellement incorrectes
console.log('\n' + '='.repeat(80));
console.log('\n🔍 Vérification des catégories potentiellement incorrectes :\n');

const suspicious = [];

recipes.forEach(recipe => {
  const nameLower = recipe.name.toLowerCase();
  const issues = [];
  
  if (recipe.category === 'soupe' && !nameLower.match(/(soup|soupe|broth|consommé|potage|velouté)/)) {
    issues.push('Ne contient pas de mot-clé "soupe"');
  }
  
  if (recipe.category === 'boisson' && !nameLower.match(/(shake|smoothie|drink|boisson|juice|beverage)/)) {
    issues.push('Ne contient pas de mot-clé "boisson"');
  }
  
  if (recipe.category === 'dessert' && !nameLower.match(/(dessert|pudding|cake|pie|ice cream|sweet|tart|mousse|cream)/)) {
    issues.push('Ne contient pas de mot-clé "dessert"');
  }
  
  if (recipe.category === 'plat' && nameLower.match(/(soup|soupe|shake|smoothie|dessert|pudding)/)) {
    issues.push('Contient un mot-clé suggérant une autre catégorie');
  }
  
  if (issues.length > 0) {
    suspicious.push({
      name: recipe.name,
      category: recipe.category,
      issues: issues
    });
  }
});

if (suspicious.length > 0) {
  console.log(`⚠️  ${suspicious.length} recettes avec catégories potentiellement incorrectes :\n`);
  suspicious.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name}`);
    console.log(`   Catégorie actuelle: ${item.category}`);
    console.log(`   Problèmes: ${item.issues.join(', ')}`);
    console.log('');
  });
} else {
  console.log('✅ Toutes les catégories semblent correctes !\n');
}

// Statistiques supplémentaires
console.log('='.repeat(80));
console.log('\n📊 Statistiques supplémentaires :\n');

const withAllergens = recipes.filter(r => r.allergens.length > 0).length;
const withDietaryRestrictions = recipes.filter(r => r.dietaryRestrictions.length > 0).length;
const withNutrition = recipes.filter(r => r.nutritionalProfile.kcal !== null).length;

console.log(`  Recettes avec allergènes détectés: ${withAllergens}`);
console.log(`  Recettes avec restrictions alimentaires: ${withDietaryRestrictions}`);
console.log(`  Recettes avec profil nutritionnel: ${withNutrition}`);

// Sauvegarder le rapport
const reportFile = path.join(__dirname, '../data/dysphagies-categories-report.txt');
let report = `RAPPORT DE VÉRIFICATION DES CATÉGORIES - DYSPHAGIES RECIPES\n`;
report += `Date: ${new Date().toLocaleString('fr-FR')}\n`;
report += `Total recettes: ${recipes.length}\n\n`;

report += `RÉPARTITION PAR CATÉGORIE:\n`;
Object.keys(byCategory).sort().forEach(category => {
  report += `  ${category.toUpperCase()}: ${byCategory[category].length} recettes\n`;
});

report += `\n\nLISTE PAR CATÉGORIE:\n\n`;
Object.keys(byCategory).sort().forEach(category => {
  report += `\n${category.toUpperCase()} (${byCategory[category].length} recettes):\n`;
  byCategory[category].forEach((recipe, index) => {
    report += `  ${index + 1}. ${recipe.name}\n`;
  });
});

if (suspicious.length > 0) {
  report += `\n\n⚠️  RECETTES À VÉRIFIER (${suspicious.length}):\n\n`;
  suspicious.forEach((item, index) => {
    report += `${index + 1}. ${item.name} (${item.category})\n`;
    report += `   Problèmes: ${item.issues.join(', ')}\n\n`;
  });
}

fs.writeFileSync(reportFile, report, 'utf-8');
console.log(`\n✅ Rapport sauvegardé dans: ${reportFile}\n`);


