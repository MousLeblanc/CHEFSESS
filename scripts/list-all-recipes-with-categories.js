// scripts/list-all-recipes-with-categories.js
// Script pour lister toutes les recettes MongoDB avec leurs catégories
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fonction principale
 */
async function listAllRecipesWithCategories() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    // Récupérer toutes les recettes
    console.log('📖 Récupération de toutes les recettes...');
    const allRecipes = await RecipeEnriched.find({}, { name: 1, category: 1 }).sort({ category: 1, name: 1 }).lean();
    console.log(`✅ ${allRecipes.length} recette(s) trouvée(s)\n`);
    
    // Grouper par catégorie
    const recipesByCategory = {};
    allRecipes.forEach(recipe => {
      const category = recipe.category || 'sans catégorie';
      if (!recipesByCategory[category]) {
        recipesByCategory[category] = [];
      }
      recipesByCategory[category].push(recipe.name);
    });
    
    // Afficher les résultats
    console.log('='.repeat(80));
    console.log('📋 LISTE DE TOUTES LES RECETTES PAR CATÉGORIE');
    console.log('='.repeat(80));
    console.log();
    
    // Trier les catégories par ordre alphabétique
    const sortedCategories = Object.keys(recipesByCategory).sort();
    
    let totalRecipes = 0;
    sortedCategories.forEach(category => {
      const recipes = recipesByCategory[category];
      totalRecipes += recipes.length;
      console.log(`\n📁 ${category.toUpperCase()} (${recipes.length} recette${recipes.length > 1 ? 's' : ''})`);
      console.log('-'.repeat(80));
      recipes.forEach((name, index) => {
        console.log(`  ${(index + 1).toString().padStart(3, ' ')}. ${name}`);
      });
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`📊 TOTAL: ${totalRecipes} recette(s) dans ${sortedCategories.length} catégorie(s)`);
    console.log('='.repeat(80));
    
    // Statistiques par catégorie
    console.log('\n📊 STATISTIQUES PAR CATÉGORIE:');
    console.log('-'.repeat(80));
    sortedCategories.forEach(category => {
      const count = recipesByCategory[category].length;
      const percentage = ((count / totalRecipes) * 100).toFixed(1);
      console.log(`  ${category.padEnd(20)} : ${count.toString().padStart(4)} recettes (${percentage}%)`);
    });
    
    // Générer un fichier texte avec la liste
    const outputPath = path.join(__dirname, '..', 'data', 'liste-recettes-par-categorie.txt');
    let fileContent = 'LISTE DE TOUTES LES RECETTES PAR CATÉGORIE\n';
    fileContent += '='.repeat(80) + '\n\n';
    fileContent += `Total: ${totalRecipes} recette(s) dans ${sortedCategories.length} catégorie(s)\n\n`;
    
    sortedCategories.forEach(category => {
      const recipes = recipesByCategory[category];
      fileContent += `\n${category.toUpperCase()} (${recipes.length} recette${recipes.length > 1 ? 's' : ''})\n`;
      fileContent += '-'.repeat(80) + '\n';
      recipes.forEach((name, index) => {
        fileContent += `${(index + 1).toString().padStart(3, ' ')}. ${name}\n`;
      });
    });
    
    fileContent += '\n\n' + '='.repeat(80) + '\n';
    fileContent += 'STATISTIQUES PAR CATÉGORIE\n';
    fileContent += '-'.repeat(80) + '\n';
    sortedCategories.forEach(category => {
      const count = recipesByCategory[category].length;
      const percentage = ((count / totalRecipes) * 100).toFixed(1);
      fileContent += `${category.padEnd(20)} : ${count.toString().padStart(4)} recettes (${percentage}%)\n`;
    });
    
    fs.writeFileSync(outputPath, fileContent, 'utf8');
    console.log(`\n✅ Liste sauvegardée dans: ${outputPath}`);
    
    // Générer aussi un fichier JSON
    const jsonPath = path.join(__dirname, '..', 'data', 'liste-recettes-par-categorie.json');
    const jsonData = {
      total: totalRecipes,
      categories: sortedCategories.length,
      recipesByCategory: recipesByCategory,
      statistics: sortedCategories.map(category => ({
        category: category,
        count: recipesByCategory[category].length,
        percentage: ((recipesByCategory[category].length / totalRecipes) * 100).toFixed(1)
      }))
    };
    
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`✅ Données JSON sauvegardées dans: ${jsonPath}`);
    
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
  listAllRecipesWithCategories()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default listAllRecipesWithCategories;


