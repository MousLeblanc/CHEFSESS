/**
 * Script pour exporter toutes les recettes de MongoDB dans un fichier JavaScript
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import fs from "fs";
import path from "path";

async function exportAllRecipesToJS() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connecté à MongoDB\n');
    
    // Récupérer toutes les recettes
    console.log('📚 Récupération de toutes les recettes...');
    const allRecipes = await Recipe.find({}).lean(); // .lean() pour obtenir des objets JavaScript simples
    console.log(`✅ ${allRecipes.length} recette(s) trouvée(s)\n`);
    
    // Préparer les données pour l'export
    console.log('📝 Préparation des données pour l\'export...');
    
    // Convertir les ObjectId en strings pour la sérialisation JSON
    const recipesData = allRecipes.map(recipe => {
      const recipeData = {
        _id: recipe._id.toString(),
        name: recipe.name,
        category: recipe.category,
        establishmentTypes: recipe.establishmentTypes || [],
        ageGroup: recipe.ageGroup || null,
        texture: recipe.texture || 'normale',
        diet: recipe.diet || [],
        dietaryRestrictions: recipe.dietaryRestrictions || [],
        tags: recipe.tags || [],
        pathologies: recipe.pathologies || [],
        allergens: recipe.allergens || [],
        nutritionalProfile: recipe.nutritionalProfile || {},
        ingredients: recipe.ingredients || [],
        preparationSteps: recipe.preparationSteps || [],
        compatibleFor: recipe.compatibleFor || [],
        aiCompatibilityScore: recipe.aiCompatibilityScore || 1.0,
        createdAt: recipe.createdAt ? recipe.createdAt.toISOString() : null,
        updatedAt: recipe.updatedAt ? recipe.updatedAt.toISOString() : null
      };
      
      // Nettoyer les champs null/undefined
      Object.keys(recipeData).forEach(key => {
        if (recipeData[key] === null || recipeData[key] === undefined) {
          delete recipeData[key];
        }
      });
      
      return recipeData;
    });
    
    // Générer le contenu du fichier JS
    const fileContent = `/**
 * Export de toutes les recettes de MongoDB
 * Généré le: ${new Date().toISOString()}
 * Total de recettes: ${recipesData.length}
 */

export const allRecipes = ${JSON.stringify(recipesData, null, 2)};

// Export par défaut
export default allRecipes;

// Fonctions utilitaires
export function getRecipeById(id) {
  return allRecipes.find(recipe => recipe._id === id);
}

export function getRecipesByCategory(category) {
  return allRecipes.filter(recipe => recipe.category === category);
}

export function getRecipesByTag(tag) {
  return allRecipes.filter(recipe => recipe.tags && recipe.tags.includes(tag));
}

export function searchRecipes(query) {
  const queryLower = query.toLowerCase();
  return allRecipes.filter(recipe => 
    recipe.name.toLowerCase().includes(queryLower) ||
    (recipe.ingredients && recipe.ingredients.some(ing => 
      ing.name.toLowerCase().includes(queryLower)
    ))
  );
}
`;
    
    // Écrire le fichier
    const outputPath = path.join(process.cwd(), 'data', 'all-recipes.js');
    const outputDir = path.dirname(outputPath);
    
    // Créer le dossier data s'il n'existe pas
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log(`💾 Écriture du fichier: ${outputPath}`);
    fs.writeFileSync(outputPath, fileContent, 'utf8');
    
    // Aussi créer une version JSON pour référence
    const jsonPath = path.join(process.cwd(), 'data', 'all-recipes.json');
    fs.writeFileSync(jsonPath, JSON.stringify(recipesData, null, 2), 'utf8');
    
    console.log(`✅ Fichier JavaScript créé: ${outputPath}`);
    console.log(`✅ Fichier JSON créé: ${jsonPath}`);
    
    // Statistiques
    console.log('\n📊 STATISTIQUES:');
    console.log(`   Total de recettes: ${recipesData.length}`);
    
    const byCategory = {};
    recipesData.forEach(recipe => {
      const cat = recipe.category || 'non spécifié';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });
    
    console.log(`\n   Par catégorie:`);
    Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`      ${cat}: ${count}`);
      });
    
    const withTags = recipesData.filter(r => r.tags && r.tags.length > 0).length;
    const withAllergens = recipesData.filter(r => r.allergens && r.allergens.length > 0).length;
    const withInstructions = recipesData.filter(r => r.preparationSteps && r.preparationSteps.length > 0).length;
    
    console.log(`\n   Qualité des données:`);
    console.log(`      Avec tags: ${withTags} (${((withTags / recipesData.length) * 100).toFixed(1)}%)`);
    console.log(`      Avec allergènes déclarés: ${withAllergens} (${((withAllergens / recipesData.length) * 100).toFixed(1)}%)`);
    console.log(`      Avec instructions: ${withInstructions} (${((withInstructions / recipesData.length) * 100).toFixed(1)}%)`);
    
    console.log('\n✅ Export terminé !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

console.log('🚀 Démarrage de l\'export de toutes les recettes...\n');
exportAllRecipesToJS();

