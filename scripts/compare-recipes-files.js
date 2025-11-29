import fs from "fs";

const oldFile = fs.readFileSync('data/all-recipes.js', 'utf8');
const newFile = fs.readFileSync('data/all-recipesnew.js', 'utf8');

// Compter les recettes dans chaque fichier
const oldCount = (oldFile.match(/"name":/g) || []).length;
const newCount = (newFile.match(/"name":/g) || []).length;

console.log('📊 COMPARAISON DES FICHIERS:');
console.log(`   all-recipes.js: ${oldCount} recettes`);
console.log(`   all-recipesnew.js: ${newCount} recettes`);
console.log(`   Différence: ${oldCount - newCount} recettes`);

if (newCount < oldCount) {
  console.log(`\n⚠️  ATTENTION: all-recipesnew.js est INCOMPLET !`);
  console.log(`   Il manque ${oldCount - newCount} recettes.`);
  console.log(`   Ce fichier ne peut PAS remplacer all-recipes.js.`);
} else if (newCount === oldCount) {
  console.log(`\n✅ Les deux fichiers ont le même nombre de recettes.`);
  console.log(`   all-recipesnew.js peut potentiellement remplacer all-recipes.js.`);
} else {
  console.log(`\n✅ all-recipesnew.js contient plus de recettes.`);
}

// Vérifier la présence de fonctions utilitaires
const oldHasUtils = oldFile.includes('getRecipeById');
const newHasUtils = newFile.includes('getRecipeById');

console.log(`\n📋 Fonctions utilitaires:`);
console.log(`   all-recipes.js: ${oldHasUtils ? '✅ Oui' : '❌ Non'}`);
console.log(`   all-recipesnew.js: ${newHasUtils ? '✅ Oui' : '❌ Non'}`);

// Vérifier la note de correction
const hasNote = newFile.includes('NOTE: Fichier corrigé');
console.log(`\n📝 Note de correction:`);
console.log(`   all-recipesnew.js: ${hasNote ? '✅ Oui (fichier corrigé)' : '❌ Non'}`);

