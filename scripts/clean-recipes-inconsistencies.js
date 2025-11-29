// scripts/clean-recipes-inconsistencies.js
// Script pour trouver et nettoyer les incohérences dans les recettes MongoDB
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';

/**
 * Fonction principale
 */
async function cleanRecipesInconsistencies() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    const issues = {
      noName: [],
      emptyName: [],
      noIngredients: [],
      emptyIngredients: [],
      noSteps: [],
      emptySteps: [],
      invalidCategory: [],
      noCategory: [],
      duplicateNames: [],
      invalidTags: [],
      invalidAllergens: [],
      invalidRestrictions: [],
      other: []
    };
    
    console.log('🔍 Analyse des recettes...\n');
    
    // Récupérer toutes les recettes
    const allRecipes = await RecipeEnriched.find({}).lean();
    console.log(`📊 Total de recettes à analyser: ${allRecipes.length}\n`);
    
    // Catégories valides selon le schéma
    const validCategories = ['entrée', 'plat', 'dessert', 'petit-déjeuner', 'soupe', 'accompagnement', 'boisson', 'purée'];
    
    // Allergènes valides
    const validAllergens = ['gluten', 'lactose', 'oeufs', 'poisson', 'crustaces', 'mollusques', 'soja', 'fruits_a_coque', 'arachides', 'sesame', 'moutarde', 'celeri', 'sulfites', 'lupin'];
    
    // Analyser chaque recette
    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      const recipeId = recipe._id.toString();
      
      // Vérifier le nom
      if (!recipe.name) {
        issues.noName.push({ id: recipeId, name: 'Sans nom' });
      } else if (recipe.name.trim().length === 0) {
        issues.emptyName.push({ id: recipeId, name: recipe.name });
      } else if (recipe.name.trim().length < 3) {
        issues.other.push({ id: recipeId, issue: `Nom trop court: "${recipe.name}"` });
      }
      
      // Vérifier les ingrédients
      if (!recipe.ingredients) {
        issues.noIngredients.push({ id: recipeId, name: recipe.name || 'Sans nom' });
      } else if (!Array.isArray(recipe.ingredients)) {
        issues.other.push({ id: recipeId, issue: `Ingrédients n'est pas un tableau: ${typeof recipe.ingredients}` });
      } else if (recipe.ingredients.length === 0) {
        issues.emptyIngredients.push({ id: recipeId, name: recipe.name || 'Sans nom' });
      } else {
        // Vérifier les ingrédients invalides
        recipe.ingredients.forEach((ing, idx) => {
          if (!ing || !ing.name || ing.name.trim().length === 0) {
            issues.other.push({ id: recipeId, issue: `Ingrédient ${idx + 1} invalide (nom vide)` });
          }
        });
      }
      
      // Vérifier les étapes
      if (!recipe.preparationSteps) {
        issues.noSteps.push({ id: recipeId, name: recipe.name || 'Sans nom' });
      } else if (!Array.isArray(recipe.preparationSteps)) {
        issues.other.push({ id: recipeId, issue: `Étapes n'est pas un tableau: ${typeof recipe.preparationSteps}` });
      } else if (recipe.preparationSteps.length === 0) {
        issues.emptySteps.push({ id: recipeId, name: recipe.name || 'Sans nom' });
      } else {
        // Vérifier les étapes invalides
        recipe.preparationSteps.forEach((step, idx) => {
          if (!step || step.trim().length === 0) {
            issues.other.push({ id: recipeId, issue: `Étape ${idx + 1} invalide (vide)` });
          }
        });
      }
      
      // Vérifier la catégorie
      if (!recipe.category) {
        issues.noCategory.push({ id: recipeId, name: recipe.name || 'Sans nom' });
      } else if (!validCategories.includes(recipe.category)) {
        issues.invalidCategory.push({ id: recipeId, name: recipe.name || 'Sans nom', category: recipe.category });
      }
      
      // Vérifier les tags
      if (recipe.tags && Array.isArray(recipe.tags)) {
        recipe.tags.forEach((tag, idx) => {
          if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
            issues.invalidTags.push({ id: recipeId, name: recipe.name || 'Sans nom', tagIndex: idx });
          }
        });
      }
      
      // Vérifier les allergènes
      if (recipe.allergens && Array.isArray(recipe.allergens)) {
        recipe.allergens.forEach((allergen, idx) => {
          if (!allergen || typeof allergen !== 'string') {
            issues.invalidAllergens.push({ id: recipeId, name: recipe.name || 'Sans nom', allergenIndex: idx });
          }
        });
      }
      
      // Vérifier les restrictions alimentaires
      if (recipe.dietaryRestrictions && Array.isArray(recipe.dietaryRestrictions)) {
        recipe.dietaryRestrictions.forEach((restriction, idx) => {
          if (!restriction || typeof restriction !== 'string') {
            issues.invalidRestrictions.push({ id: recipeId, name: recipe.name || 'Sans nom', restrictionIndex: idx });
          }
        });
      }
    }
    
    // Afficher le rapport des problèmes
    console.log('📋 RAPPORT DES INCOHÉRENCES:\n');
    
    let totalIssues = 0;
    
    if (issues.noName.length > 0) {
      console.log(`❌ Recettes sans nom: ${issues.noName.length}`);
      issues.noName.slice(0, 5).forEach(r => console.log(`   - ID: ${r.id}`));
      if (issues.noName.length > 5) console.log(`   ... et ${issues.noName.length - 5} autres`);
      totalIssues += issues.noName.length;
    }
    
    if (issues.emptyName.length > 0) {
      console.log(`\n❌ Recettes avec nom vide: ${issues.emptyName.length}`);
      issues.emptyName.slice(0, 5).forEach(r => console.log(`   - ID: ${r.id}`));
      if (issues.emptyName.length > 5) console.log(`   ... et ${issues.emptyName.length - 5} autres`);
      totalIssues += issues.emptyName.length;
    }
    
    if (issues.noIngredients.length > 0) {
      console.log(`\n❌ Recettes sans ingrédients: ${issues.noIngredients.length}`);
      issues.noIngredients.slice(0, 5).forEach(r => console.log(`   - ${r.name} (ID: ${r.id})`));
      if (issues.noIngredients.length > 5) console.log(`   ... et ${issues.noIngredients.length - 5} autres`);
      totalIssues += issues.noIngredients.length;
    }
    
    if (issues.emptyIngredients.length > 0) {
      console.log(`\n❌ Recettes avec liste d'ingrédients vide: ${issues.emptyIngredients.length}`);
      issues.emptyIngredients.slice(0, 5).forEach(r => console.log(`   - ${r.name} (ID: ${r.id})`));
      if (issues.emptyIngredients.length > 5) console.log(`   ... et ${issues.emptyIngredients.length - 5} autres`);
      totalIssues += issues.emptyIngredients.length;
    }
    
    if (issues.noSteps.length > 0) {
      console.log(`\n❌ Recettes sans étapes: ${issues.noSteps.length}`);
      issues.noSteps.slice(0, 5).forEach(r => console.log(`   - ${r.name} (ID: ${r.id})`));
      if (issues.noSteps.length > 5) console.log(`   ... et ${issues.noSteps.length - 5} autres`);
      totalIssues += issues.noSteps.length;
    }
    
    if (issues.emptySteps.length > 0) {
      console.log(`\n❌ Recettes avec liste d'étapes vide: ${issues.emptySteps.length}`);
      issues.emptySteps.slice(0, 5).forEach(r => console.log(`   - ${r.name} (ID: ${r.id})`));
      if (issues.emptySteps.length > 5) console.log(`   ... et ${issues.emptySteps.length - 5} autres`);
      totalIssues += issues.emptySteps.length;
    }
    
    if (issues.noCategory.length > 0) {
      console.log(`\n❌ Recettes sans catégorie: ${issues.noCategory.length}`);
      issues.noCategory.slice(0, 5).forEach(r => console.log(`   - ${r.name} (ID: ${r.id})`));
      if (issues.noCategory.length > 5) console.log(`   ... et ${issues.noCategory.length - 5} autres`);
      totalIssues += issues.noCategory.length;
    }
    
    if (issues.invalidCategory.length > 0) {
      console.log(`\n❌ Recettes avec catégorie invalide: ${issues.invalidCategory.length}`);
      issues.invalidCategory.slice(0, 5).forEach(r => console.log(`   - ${r.name}: "${r.category}" (ID: ${r.id})`));
      if (issues.invalidCategory.length > 5) console.log(`   ... et ${issues.invalidCategory.length - 5} autres`);
      totalIssues += issues.invalidCategory.length;
    }
    
    if (issues.invalidTags.length > 0) {
      console.log(`\n⚠️  Recettes avec tags invalides: ${issues.invalidTags.length}`);
      totalIssues += issues.invalidTags.length;
    }
    
    if (issues.invalidAllergens.length > 0) {
      console.log(`\n⚠️  Recettes avec allergènes invalides: ${issues.invalidAllergens.length}`);
      totalIssues += issues.invalidAllergens.length;
    }
    
    if (issues.invalidRestrictions.length > 0) {
      console.log(`\n⚠️  Recettes avec restrictions invalides: ${issues.invalidRestrictions.length}`);
      totalIssues += issues.invalidRestrictions.length;
    }
    
    if (issues.other.length > 0) {
      console.log(`\n⚠️  Autres problèmes: ${issues.other.length}`);
      issues.other.slice(0, 10).forEach(r => console.log(`   - ${r.issue} (ID: ${r.id})`));
      if (issues.other.length > 10) console.log(`   ... et ${issues.other.length - 10} autres`);
      totalIssues += issues.other.length;
    }
    
    // Détecter les doublons de noms
    console.log('\n🔍 Détection des doublons de noms...');
    const nameMap = new Map();
    allRecipes.forEach(recipe => {
      if (recipe.name) {
        const nameLower = recipe.name.toLowerCase().trim();
        if (!nameMap.has(nameLower)) {
          nameMap.set(nameLower, []);
        }
        nameMap.get(nameLower).push({ id: recipe._id.toString(), name: recipe.name });
      }
    });
    
    nameMap.forEach((recipes, nameLower) => {
      if (recipes.length > 1) {
        issues.duplicateNames.push({ name: recipes[0].name, count: recipes.length, ids: recipes.map(r => r.id) });
      }
    });
    
    if (issues.duplicateNames.length > 0) {
      console.log(`\n⚠️  Noms de recettes en double: ${issues.duplicateNames.length}`);
      issues.duplicateNames.slice(0, 10).forEach(dup => {
        console.log(`   - "${dup.name}": ${dup.count} occurrences`);
      });
      if (issues.duplicateNames.length > 10) {
        console.log(`   ... et ${issues.duplicateNames.length - 10} autres doublons`);
      }
      totalIssues += issues.duplicateNames.length;
    }
    
    console.log(`\n📊 TOTAL DE PROBLÈMES DÉTECTÉS: ${totalIssues}\n`);
    
    // Nettoyage
    console.log('🧹 NETTOYAGE DES RECETTES...\n');
    
    let cleaned = 0;
    let deleted = 0;
    
    // Supprimer les recettes sans nom ou avec nom vide
    const toDelete = [
      ...issues.noName.map(r => r.id),
      ...issues.emptyName.map(r => r.id)
    ];
    
    // Supprimer les recettes sans ingrédients ou sans étapes (recettes incomplètes)
    const incompleteRecipes = [
      ...issues.noIngredients.map(r => r.id),
      ...issues.emptyIngredients.map(r => r.id),
      ...issues.noSteps.map(r => r.id),
      ...issues.emptySteps.map(r => r.id)
    ];
    
    toDelete.push(...incompleteRecipes);
    
    // Supprimer les doublons (garder la première occurrence)
    const duplicateIdsToDelete = [];
    issues.duplicateNames.forEach(dup => {
      // Garder la première, supprimer les autres
      for (let i = 1; i < dup.ids.length; i++) {
        duplicateIdsToDelete.push(dup.ids[i]);
      }
    });
    toDelete.push(...duplicateIdsToDelete);
    
    // Supprimer les recettes problématiques
    const uniqueIdsToDelete = [...new Set(toDelete)];
    if (uniqueIdsToDelete.length > 0) {
      const deleteResult = await RecipeEnriched.deleteMany({ _id: { $in: uniqueIdsToDelete.map(id => new mongoose.Types.ObjectId(id)) } });
      deleted = deleteResult.deletedCount;
      console.log(`✅ ${deleted} recettes supprimées (incomplètes ou doublons)`);
    }
    
    // Corriger les catégories invalides
    for (const issue of issues.invalidCategory) {
      // Essayer de deviner la catégorie correcte
      const nameLower = issue.name.toLowerCase();
      let newCategory = 'plat'; // Par défaut
      
      if (nameLower.match(/\b(salad|salade|insalata)\b/)) {
        newCategory = 'entrée';
      } else if (nameLower.match(/\b(dessert|cake|sweet|pastry|tiramisu)\b/)) {
        newCategory = 'dessert';
      } else if (nameLower.match(/\b(soup|soupe|broth|minestrone|velouté|consommé)\b/)) {
        newCategory = 'soupe';
      } else if (nameLower.match(/\b(dip|sauce|dressing)\b/)) {
        newCategory = 'accompagnement';
      } else if (nameLower.match(/\b(drink|smoothie|juice|beverage|boisson)\b/)) {
        newCategory = 'boisson';
      } else if (nameLower.match(/\b(breakfast|petit-déjeuner|petit dejeuner)\b/)) {
        newCategory = 'petit-déjeuner';
      }
      
      await RecipeEnriched.updateOne(
        { _id: new mongoose.Types.ObjectId(issue.id) },
        { $set: { category: newCategory } }
      );
      cleaned++;
    }
    
    // Corriger les recettes sans catégorie
    for (const issue of issues.noCategory) {
      const recipe = await RecipeEnriched.findById(issue.id).lean();
      if (recipe) {
        const nameLower = (recipe.name || '').toLowerCase();
        let newCategory = 'plat'; // Par défaut
        
        if (nameLower.match(/\b(salad|salade|insalata)\b/)) {
          newCategory = 'entrée';
        } else if (nameLower.match(/\b(dessert|cake|sweet|pastry|tiramisu)\b/)) {
          newCategory = 'dessert';
        } else if (nameLower.match(/\b(soup|soupe|broth|minestrone|velouté|consommé)\b/)) {
          newCategory = 'soupe';
        } else if (nameLower.match(/\b(dip|sauce|dressing)\b/)) {
          newCategory = 'accompagnement';
        } else if (nameLower.match(/\b(drink|smoothie|juice|beverage|boisson)\b/)) {
          newCategory = 'boisson';
        } else if (nameLower.match(/\b(breakfast|petit-déjeuner|petit dejeuner)\b/)) {
          newCategory = 'petit-déjeuner';
        }
        
        await RecipeEnriched.updateOne(
          { _id: new mongoose.Types.ObjectId(issue.id) },
          { $set: { category: newCategory } }
        );
        cleaned++;
      }
    }
    
    // Nettoyer les tags invalides
    for (const issue of issues.invalidTags) {
      const recipe = await RecipeEnriched.findById(issue.id).lean();
      if (recipe && recipe.tags) {
        const cleanedTags = recipe.tags.filter(tag => tag && typeof tag === 'string' && tag.trim().length > 0);
        await RecipeEnriched.updateOne(
          { _id: new mongoose.Types.ObjectId(issue.id) },
          { $set: { tags: cleanedTags } }
        );
        cleaned++;
      }
    }
    
    // Nettoyer les allergènes invalides
    for (const issue of issues.invalidAllergens) {
      const recipe = await RecipeEnriched.findById(issue.id).lean();
      if (recipe && recipe.allergens) {
        const cleanedAllergens = recipe.allergens.filter(allergen => allergen && typeof allergen === 'string');
        await RecipeEnriched.updateOne(
          { _id: new mongoose.Types.ObjectId(issue.id) },
          { $set: { allergens: cleanedAllergens } }
        );
        cleaned++;
      }
    }
    
    // Nettoyer les restrictions invalides
    for (const issue of issues.invalidRestrictions) {
      const recipe = await RecipeEnriched.findById(issue.id).lean();
      if (recipe && recipe.dietaryRestrictions) {
        const cleanedRestrictions = recipe.dietaryRestrictions.filter(restriction => restriction && typeof restriction === 'string');
        await RecipeEnriched.updateOne(
          { _id: new mongoose.Types.ObjectId(issue.id) },
          { $set: { dietaryRestrictions: cleanedRestrictions } }
        );
        cleaned++;
      }
    }
    
    // Nettoyer les ingrédients invalides
    for (const issue of issues.other) {
      if (issue.issue.includes('Ingrédient') && issue.issue.includes('invalide')) {
        const recipe = await RecipeEnriched.findById(issue.id).lean();
        if (recipe && recipe.ingredients) {
          const cleanedIngredients = recipe.ingredients.filter(ing => ing && ing.name && ing.name.trim().length > 0);
          await RecipeEnriched.updateOne(
            { _id: new mongoose.Types.ObjectId(issue.id) },
            { $set: { ingredients: cleanedIngredients } }
          );
          cleaned++;
        }
      }
    }
    
    // Nettoyer les étapes invalides
    for (const issue of issues.other) {
      if (issue.issue.includes('Étape') && issue.issue.includes('invalide')) {
        const recipe = await RecipeEnriched.findById(issue.id).lean();
        if (recipe && recipe.preparationSteps) {
          const cleanedSteps = recipe.preparationSteps.filter(step => step && step.trim().length > 0);
          await RecipeEnriched.updateOne(
            { _id: new mongoose.Types.ObjectId(issue.id) },
            { $set: { preparationSteps: cleanedSteps } }
          );
          cleaned++;
        }
      }
    }
    
    console.log(`✅ ${cleaned} recettes corrigées`);
    
    // Statistiques finales
    const finalCount = await RecipeEnriched.countDocuments();
    console.log(`\n📊 RÉSULTAT FINAL:`);
    console.log(`   - Recettes avant nettoyage: ${allRecipes.length}`);
    console.log(`   - Recettes supprimées: ${deleted}`);
    console.log(`   - Recettes corrigées: ${cleaned}`);
    console.log(`   - Recettes après nettoyage: ${finalCount}`);
    console.log(`   - Recettes valides: ${finalCount} (${((finalCount / allRecipes.length) * 100).toFixed(1)}%)`);
    
    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Exécuter
cleanRecipesInconsistencies();


