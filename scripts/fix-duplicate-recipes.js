/**
 * Script pour résoudre les doublons de recettes
 * Détecte les recettes avec le même nom (normalisé) et propose de fusionner ou renommer
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

/**
 * Normalise un nom de recette pour la comparaison
 */
function normalizeRecipeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compare deux recettes pour déterminer laquelle est la plus complète
 */
function compareRecipes(recipe1, recipe2) {
  let score1 = 0;
  let score2 = 0;
  
  // Points pour les ingrédients
  const ing1 = recipe1.ingredients || [];
  const ing2 = recipe2.ingredients || [];
  if (ing1.length > ing2.length) score1 += 10;
  else if (ing2.length > ing1.length) score2 += 10;
  
  // Points pour les instructions
  const steps1 = recipe1.preparationSteps || [];
  const steps2 = recipe2.preparationSteps || [];
  if (steps1.length > steps2.length) score1 += 5;
  else if (steps2.length > steps1.length) score2 += 5;
  
  // Points pour le profil nutritionnel
  const np1 = recipe1.nutritionalProfile || {};
  const np2 = recipe2.nutritionalProfile || {};
  const np1Complete = Object.keys(np1).length;
  const np2Complete = Object.keys(np2).length;
  if (np1Complete > np2Complete) score1 += 5;
  else if (np2Complete > np1Complete) score2 += 5;
  
  // Points pour les allergènes déclarés
  const all1 = (recipe1.allergens || []).length;
  const all2 = (recipe2.allergens || []).length;
  if (all1 > all2) score1 += 3;
  else if (all2 > all1) score2 += 3;
  
  // Points pour les tags
  const tags1 = (recipe1.tags || []).length;
  const tags2 = (recipe2.tags || []).length;
  if (tags1 > tags2) score1 += 2;
  else if (tags2 > tags1) score2 += 2;
  
  // Points pour la date de création (plus récent = mieux)
  if (recipe1.createdAt && recipe2.createdAt) {
    if (recipe1.createdAt > recipe2.createdAt) score1 += 1;
    else if (recipe2.createdAt > recipe1.createdAt) score2 += 1;
  }
  
  return { score1, score2, winner: score1 > score2 ? 1 : score2 > score1 ? 2 : 0 };
}

/**
 * Fusionne deux recettes en conservant les meilleures données
 */
function mergeRecipes(recipe1, recipe2) {
  const comparison = compareRecipes(recipe1, recipe2);
  const baseRecipe = comparison.winner === 1 ? recipe1 : recipe2;
  const otherRecipe = comparison.winner === 1 ? recipe2 : recipe1;
  
  // Convertir en objet en excluant _id et __v
  const merged = baseRecipe.toObject();
  delete merged._id;
  delete merged.__v;
  
  // Fusionner les ingrédients (éviter les doublons)
  const baseIng = (baseRecipe.ingredients || []).map(ing => `${ing.name}_${ing.quantity}`);
  const otherIng = (otherRecipe.ingredients || []).map(ing => `${ing.name}_${ing.quantity}`);
  const allIngredients = [...baseRecipe.ingredients || []];
  
  otherRecipe.ingredients?.forEach(ing => {
    const key = `${ing.name}_${ing.quantity}`;
    if (!baseIng.includes(key)) {
      allIngredients.push(ing);
    }
  });
  merged.ingredients = allIngredients;
  
  // Fusionner les instructions (prendre les plus longues)
  const baseSteps = baseRecipe.preparationSteps || [];
  const otherSteps = otherRecipe.preparationSteps || [];
  merged.preparationSteps = baseSteps.length >= otherSteps.length ? baseSteps : otherSteps;
  
  // Fusionner les allergènes (union)
  const baseAllergens = new Set(baseRecipe.allergens || []);
  (otherRecipe.allergens || []).forEach(a => baseAllergens.add(a));
  merged.allergens = Array.from(baseAllergens);
  
  // Fusionner les tags (union)
  const baseTags = new Set(baseRecipe.tags || []);
  (otherRecipe.tags || []).forEach(t => baseTags.add(t));
  merged.tags = Array.from(baseTags);
  
  // Fusionner les restrictions alimentaires (union)
  const baseRestrictions = new Set(baseRecipe.dietaryRestrictions || []);
  (otherRecipe.dietaryRestrictions || []).forEach(r => baseRestrictions.add(r));
  merged.dietaryRestrictions = Array.from(baseRestrictions);
  
  // Prendre le meilleur profil nutritionnel
  const np1 = baseRecipe.nutritionalProfile || {};
  const np2 = otherRecipe.nutritionalProfile || {};
  const np1Complete = Object.keys(np1).filter(k => np1[k] !== null && np1[k] !== undefined && np1[k] !== 0).length;
  const np2Complete = Object.keys(np2).filter(k => np2[k] !== null && np2[k] !== undefined && np2[k] !== 0).length;
  merged.nutritionalProfile = np1Complete >= np2Complete ? np1 : np2;
  
  return merged;
}

/**
 * Génère un nom unique pour une recette dupliquée
 */
function generateUniqueName(originalName, index) {
  const suffixes = ['(version 1)', '(version 2)', '(variante)', '(alternative)'];
  const suffix = suffixes[index % suffixes.length] || `(${index + 1})`;
  return `${originalName} ${suffix}`;
}

async function fixDuplicateRecipes(strategy = 'merge') {
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
    const allRecipes = await Recipe.find({});
    console.log(`✅ ${allRecipes.length} recette(s) trouvée(s)\n`);
    
    // Grouper par nom normalisé
    console.log('🔍 Détection des doublons...');
    const nameMap = new Map();
    
    allRecipes.forEach(recipe => {
      if (!recipe.name) return;
      const normalizedName = normalizeRecipeName(recipe.name);
      if (!nameMap.has(normalizedName)) {
        nameMap.set(normalizedName, []);
      }
      nameMap.get(normalizedName).push(recipe);
    });
    
    // Filtrer les groupes avec plus d'une recette
    const duplicates = [];
    nameMap.forEach((recipes, normalizedName) => {
      if (recipes.length > 1) {
        duplicates.push({ normalizedName, recipes, count: recipes.length });
      }
    });
    
    console.log(`✅ ${duplicates.length} groupe(s) de doublons trouvé(s)\n`);
    
    if (duplicates.length === 0) {
      console.log('✅ Aucun doublon trouvé !');
      return;
    }
    
    // Statistiques
    let merged = 0;
    let renamed = 0;
    let skipped = 0;
    let errors = 0;
    const processedGroups = [];
    
    console.log(`📋 Stratégie choisie: ${strategy === 'merge' ? 'Fusionner' : 'Renommer'}\n`);
    console.log('🔧 Traitement des doublons...\n');
    
    for (let i = 0; i < duplicates.length; i++) {
      const group = duplicates[i];
      const { normalizedName, recipes } = group;
      
      try {
        console.log(`[${i + 1}/${duplicates.length}] Groupe: "${recipes[0].name}" (${recipes.length} recette(s))`);
        
        if (strategy === 'merge') {
          // Fusionner toutes les recettes du groupe
          // Recharger la première recette pour éviter les conflits de version
          let mergedRecipe = await Recipe.findById(recipes[0]._id);
          
          for (let j = 1; j < recipes.length; j++) {
            // Recharger la recette à fusionner
            const otherRecipe = await Recipe.findById(recipes[j]._id);
            if (!otherRecipe) {
              console.log(`   ⚠️  Recette "${recipes[j].name}" (ID: ${recipes[j]._id}) déjà supprimée, ignorée`);
              continue;
            }
            
            const mergedData = mergeRecipes(mergedRecipe, otherRecipe);
            
            // Mettre à jour la recette principale avec findByIdAndUpdate pour éviter les conflits de version
            await Recipe.findByIdAndUpdate(
              mergedRecipe._id,
              { $set: mergedData },
              { new: true, runValidators: true }
            );
            
            // Recharger la recette fusionnée pour la prochaine itération
            mergedRecipe = await Recipe.findById(recipes[0]._id);
            
            // Supprimer les autres recettes
            await Recipe.findByIdAndDelete(recipes[j]._id);
            console.log(`   ✅ Fusionnée avec "${otherRecipe.name}" (ID: ${otherRecipe._id})`);
          }
          
          merged++;
          processedGroups.push({
            name: recipes[0].name,
            action: 'merged',
            count: recipes.length,
            keptId: mergedRecipe._id,
            deletedIds: recipes.slice(1).map(r => r._id)
          });
          
          console.log(`   ✅ Groupe fusionné (${recipes.length} → 1 recette)\n`);
          
        } else if (strategy === 'rename') {
          // Renommer toutes les recettes sauf la première
          const baseRecipe = recipes[0];
          
          for (let j = 1; j < recipes.length; j++) {
            const newName = generateUniqueName(baseRecipe.name, j - 1);
            recipes[j].name = newName;
            await recipes[j].save();
            console.log(`   ✅ Renommée: "${recipes[j].name}" → "${newName}"`);
          }
          
          renamed += recipes.length - 1;
          processedGroups.push({
            name: baseRecipe.name,
            action: 'renamed',
            count: recipes.length,
            baseId: baseRecipe._id,
            renamedIds: recipes.slice(1).map(r => r._id)
          });
          
          console.log(`   ✅ Groupe renommé (${recipes.length - 1} recette(s) renommée(s))\n`);
        }
        
      } catch (error) {
        errors++;
        console.error(`   ❌ Erreur: ${error.message}\n`);
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DE LA RÉSOLUTION DES DOUBLONS');
    console.log('='.repeat(80));
    
    if (strategy === 'merge') {
      console.log(`✅ Groupes fusionnés: ${merged}`);
      console.log(`📊 Recettes supprimées: ${duplicates.reduce((sum, g) => sum + g.count - 1, 0)}`);
    } else {
      console.log(`✅ Recettes renommées: ${renamed}`);
      console.log(`📊 Groupes traités: ${processedGroups.length}`);
    }
    
    console.log(`⏭️  Groupes ignorés: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total de groupes de doublons: ${duplicates.length}`);
    
    if (processedGroups.length > 0) {
      console.log('\n📋 DÉTAIL DES TRAITEMENTS (premiers 10):');
      processedGroups.slice(0, 10).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.name}`);
        if (item.action === 'merged') {
          console.log(`   Action: Fusionné ${item.count} recette(s) en 1`);
          console.log(`   Recette conservée: ${item.keptId}`);
          console.log(`   Recettes supprimées: ${item.deletedIds.length}`);
        } else {
          console.log(`   Action: ${item.count - 1} recette(s) renommée(s)`);
          console.log(`   Recette de base: ${item.baseId}`);
        }
      });
      if (processedGroups.length > 10) {
        console.log(`\n   ... et ${processedGroups.length - 10} autre(s) groupe(s)`);
      }
    }
    
    // Statistiques finales
    const finalCount = await Recipe.countDocuments();
    console.log(`\n📊 Statistiques finales:`);
    console.log(`   Recettes avant: ${allRecipes.length}`);
    console.log(`   Recettes après: ${finalCount}`);
    if (strategy === 'merge') {
      console.log(`   Recettes supprimées: ${allRecipes.length - finalCount}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Résolution des doublons terminée !');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

// Récupérer la stratégie depuis les arguments de ligne de commande
const strategy = process.argv[2] || 'merge'; // 'merge' ou 'rename'

if (strategy !== 'merge' && strategy !== 'rename') {
  console.error('❌ Stratégie invalide. Utilisez "merge" ou "rename"');
  console.error('   Exemple: node scripts/fix-duplicate-recipes.js merge');
  console.error('   Exemple: node scripts/fix-duplicate-recipes.js rename');
  process.exit(1);
}

console.log('🚀 Démarrage de la résolution des doublons...\n');
console.log('📋 Ce script va:');
if (strategy === 'merge') {
  console.log('   1. Détecter les recettes avec le même nom (normalisé)');
  console.log('   2. Comparer les recettes pour identifier la plus complète');
  console.log('   3. Fusionner les données en conservant les meilleures informations');
  console.log('   4. Supprimer les recettes dupliquées');
  console.log('\n⚠️  ATTENTION: Cette stratégie supprime des recettes de la base de données\n');
} else {
  console.log('   1. Détecter les recettes avec le même nom (normalisé)');
  console.log('   2. Conserver la première recette du groupe');
  console.log('   3. Renommer les autres avec des suffixes (version 1, version 2, etc.)');
  console.log('\n✅ Cette stratégie conserve toutes les recettes\n');
}
fixDuplicateRecipes(strategy);

