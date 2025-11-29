/**
 * Script pour ajouter les tags manquants à toutes les recettes
 * Génère des tags basés sur le nom, les ingrédients, la catégorie, la texture, etc.
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

/**
 * Extrait les ingrédients principaux d'une recette
 */
function getMainIngredients(recipe) {
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return [];
  
  return recipe.ingredients
    .filter(ing => ing.name && ing.quantity)
    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
    .slice(0, 5)
    .map(ing => ing.name.toLowerCase());
}

/**
 * Génère des tags basés sur les caractéristiques de la recette
 */
function generateTags(recipe) {
  const tags = new Set();
  const name = (recipe.name || '').toLowerCase();
  const category = (recipe.category || '').toLowerCase();
  const texture = (recipe.texture || 'normale').toLowerCase();
  const ingredients = getMainIngredients(recipe);
  const allergens = (recipe.allergens || []).map(a => a.toLowerCase());
  const dietaryRestrictions = (recipe.dietaryRestrictions || []).map(r => r.toLowerCase());
  const diet = (recipe.diet || []).map(d => d.toLowerCase());
  
  // Tags de catégorie
  if (category) {
    tags.add(`#${category}`);
  }
  
  // Tags de texture
  if (texture && texture !== 'normale') {
    tags.add(`#${texture}`);
    if (texture === 'mixée' || texture === 'moulinée' || texture === 'lisse') {
      tags.add('#texture_adaptee');
      tags.add('#ehpad');
    }
  }
  
  // Tags basés sur le nom
  if (name.includes('soupe') || name.includes('potage') || name.includes('velouté') || name.includes('consommé')) {
    tags.add('#soupe');
    tags.add('#chaud');
  }
  
  if (name.includes('purée') || name.includes('puree')) {
    tags.add('#puree');
    tags.add('#texture_adaptee');
  }
  
  if (name.includes('compote')) {
    tags.add('#dessert');
    tags.add('#fruits');
  }
  
  if (name.includes('smoothie')) {
    tags.add('#boisson');
    tags.add('#fruits');
  }
  
  if (name.includes('salade')) {
    tags.add('#froid');
    tags.add('#legumes');
  }
  
  // Tags basés sur les ingrédients principaux
  ingredients.forEach(ing => {
    const ingLower = ing.toLowerCase();
    
    // Protéines
    if (ingLower.includes('poulet') || ingLower.includes('dinde') || ingLower.includes('volaille')) {
      tags.add('#volaille');
      tags.add('#proteine');
    }
    if (ingLower.includes('boeuf') || ingLower.includes('bœuf') || ingLower.includes('viande') || ingLower.includes('veau')) {
      tags.add('#viande');
      tags.add('#proteine');
    }
    if (ingLower.includes('porc') || ingLower.includes('jambon')) {
      tags.add('#porc');
      tags.add('#proteine');
    }
    if (ingLower.includes('poisson') || ingLower.includes('saumon') || ingLower.includes('cabillaud') || 
        ingLower.includes('thon') || ingLower.includes('merlan') || ingLower.includes('sole')) {
      tags.add('#poisson');
      tags.add('#proteine');
    }
    if (ingLower.includes('oeuf') || ingLower.includes('œuf') || ingLower.includes('egg')) {
      tags.add('#oeufs');
      tags.add('#proteine');
    }
    
    // Légumes
    if (ingLower.includes('carotte') || ingLower.includes('courgette') || ingLower.includes('poireau') || 
        ingLower.includes('tomate') || ingLower.includes('aubergine') || ingLower.includes('courge') ||
        ingLower.includes('potiron') || ingLower.includes('butternut') || ingLower.includes('brocoli') ||
        ingLower.includes('chou') || ingLower.includes('haricot') || ingLower.includes('épinard') ||
        ingLower.includes('epinard') || ingLower.includes('légume') || ingLower.includes('legume')) {
      tags.add('#legumes');
    }
    
    // Féculents
    if (ingLower.includes('pomme de terre') || ingLower.includes('pommes de terre') || ingLower.includes('patate')) {
      tags.add('#pommes_de_terre');
      tags.add('#feculent');
    }
    if (ingLower.includes('riz')) {
      tags.add('#riz');
      tags.add('#feculent');
    }
    if (ingLower.includes('pâte') || ingLower.includes('pate') || ingLower.includes('spaghetti') || 
        ingLower.includes('lasagne') || ingLower.includes('gnocchi')) {
      tags.add('#pates');
      tags.add('#feculent');
    }
    if (ingLower.includes('quinoa') || ingLower.includes('boulgour') || ingLower.includes('couscous') ||
        ingLower.includes('semoule')) {
      tags.add('#cereales');
      tags.add('#feculent');
    }
    if (ingLower.includes('lentille') || ingLower.includes('haricot sec') || ingLower.includes('pois chiche')) {
      tags.add('#legumineuses');
      tags.add('#proteine_vegetale');
    }
    
    // Fruits
    if (ingLower.includes('pomme') || ingLower.includes('poire') || ingLower.includes('banane') ||
        ingLower.includes('fraise') || ingLower.includes('fruits')) {
      tags.add('#fruits');
    }
    
    // Produits laitiers
    if (ingLower.includes('lait') || ingLower.includes('crème') || ingLower.includes('creme') ||
        ingLower.includes('fromage') || ingLower.includes('yaourt') || ingLower.includes('yogurt')) {
      tags.add('#laitier');
    }
  });
  
  // Tags basés sur les restrictions alimentaires
  dietaryRestrictions.forEach(restriction => {
    if (restriction.includes('vegetarien') || restriction.includes('végétarien')) {
      tags.add('#vegetarien');
    }
    if (restriction.includes('vegan') || restriction.includes('végétalien')) {
      tags.add('#vegan');
    }
    if (restriction.includes('sans_gluten') || restriction.includes('sans gluten')) {
      tags.add('#sans_gluten');
    }
    if (restriction.includes('sans_lactose') || restriction.includes('sans lactose')) {
      tags.add('#sans_lactose');
    }
    if (restriction.includes('halal')) {
      tags.add('#halal');
    }
    if (restriction.includes('casher') || restriction.includes('casher')) {
      tags.add('#casher');
    }
    if (restriction.includes('sans_sel') || restriction.includes('sans sel') || restriction.includes('hyposodé')) {
      tags.add('#sans_sel');
      tags.add('#regime_specifique');
    }
  });
  
  // Tags basés sur le régime
  diet.forEach(d => {
    if (d.includes('hypocalorique')) {
      tags.add('#hypocalorique');
    }
    if (d.includes('hyperprotéiné') || d.includes('hyperproteine')) {
      tags.add('#hyperproteine');
    }
    if (d.includes('riche en fibres') || d.includes('riche_en_fibres')) {
      tags.add('#riche_fibres');
    }
  });
  
  // Tags basés sur les allergènes (inversés - sans allergène)
  if (allergens.length === 0) {
    tags.add('#sans_allergenes_majeurs');
  }
  
  // Tags basés sur le profil nutritionnel
  const np = recipe.nutritionalProfile || {};
  if (np.protein && np.protein > 20) {
    tags.add('#riche_proteines');
  }
  if (np.fiber && np.fiber > 5) {
    tags.add('#riche_fibres');
  }
  if (np.kcal && np.kcal < 300) {
    tags.add('#hypocalorique');
  }
  
  // Tags de préparation
  if (name.includes('vapeur') || name.includes('steam')) {
    tags.add('#cuisson_vapeur');
    tags.add('#sain');
  }
  if (name.includes('rôti') || name.includes('roti') || name.includes('roasted')) {
    tags.add('#cuisson_four');
  }
  if (name.includes('mijoté') || name.includes('mijote') || name.includes('stew')) {
    tags.add('#cuisson_mijote');
  }
  
  // Tags pour établissements
  const establishmentTypes = recipe.establishmentTypes || [];
  if (establishmentTypes.includes('ehpad')) {
    tags.add('#ehpad');
  }
  if (establishmentTypes.includes('cantine_scolaire')) {
    tags.add('#cantine_scolaire');
  }
  if (establishmentTypes.includes('hopital')) {
    tags.add('#hopital');
  }
  
  // Tags généraux
  if (category === 'plat') {
    tags.add('#repas_complet');
  }
  if (category === 'dessert') {
    tags.add('#sucré');
  }
  
  // Convertir en tableau et trier
  return Array.from(tags).sort();
}

async function addMissingTags() {
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
    
    // Statistiques
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    const updatedRecipes = [];
    
    console.log('🏷️  Génération et ajout des tags...\n');
    
    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      
      try {
        // Générer les nouveaux tags
        const newTags = generateTags(recipe);
        
        // Fusionner avec les tags existants (éviter les doublons)
        const existingTags = new Set((recipe.tags || []).map(t => t.toLowerCase()));
        const addedTags = [];
        newTags.forEach(tag => {
          const tagLower = tag.toLowerCase();
          if (!existingTags.has(tagLower)) {
            existingTags.add(tag);
            addedTags.push(tag);
          }
        });
        
        const allTags = Array.from(existingTags).sort();
        
        // Toujours mettre à jour si on a généré de nouveaux tags ou si la recette n'avait pas de tags
        const tagsChanged = addedTags.length > 0 || (recipe.tags || []).length === 0;
        
        if (tagsChanged) {
          recipe.tags = allTags;
          await recipe.save();
          
          updated++;
          updatedRecipes.push({
            name: recipe.name,
            id: recipe._id,
            oldCount: (recipe.tags || []).length,
            newCount: allTags.length,
            addedTags: addedTags.slice(0, 5)
          });
          
          if ((i + 1) % 50 === 0) {
            console.log(`[${i + 1}/${allRecipes.length}] ${updated} recette(s) mise(s) à jour...`);
          }
        } else {
          skipped++;
        }
        
      } catch (error) {
        errors++;
        console.error(`❌ Erreur pour "${recipe.name}" (ID: ${recipe._id}): ${error.message}`);
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DE L\'AJOUT DES TAGS');
    console.log('='.repeat(80));
    console.log(`✅ Recettes mises à jour: ${updated}`);
    console.log(`⏭️  Recettes sans changement: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total de recettes: ${allRecipes.length}`);
    
    if (updatedRecipes.length > 0) {
      console.log('\n📋 EXEMPLES DE RECETTES MISES À JOUR (premiers 10):');
      updatedRecipes.slice(0, 10).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.name}`);
        console.log(`   Tags avant: ${item.oldCount} → après: ${item.newCount}`);
        if (item.addedTags.length > 0) {
          console.log(`   Tags ajoutés: ${item.addedTags.join(', ')}${item.newCount - item.oldCount > item.addedTags.length ? '...' : ''}`);
        }
      });
      if (updatedRecipes.length > 10) {
        console.log(`\n   ... et ${updatedRecipes.length - 10} autre(s) recette(s)`);
      }
    }
    
    // Statistiques des tags
    const allTagsSet = new Set();
    allRecipes.forEach(r => {
      (r.tags || []).forEach(t => allTagsSet.add(t));
    });
    
    console.log(`\n📊 Statistiques des tags:`);
    console.log(`   Total de tags uniques: ${allTagsSet.size}`);
    console.log(`   Recettes avec tags: ${allRecipes.filter(r => r.tags && r.tags.length > 0).length}`);
    console.log(`   Recettes sans tags: ${allRecipes.filter(r => !r.tags || r.tags.length === 0).length}`);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Ajout des tags terminé !');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

console.log('🚀 Démarrage de l\'ajout des tags manquants...\n');
console.log('📋 Ce script va:');
console.log('   1. Analyser toutes les recettes');
console.log('   2. Générer des tags basés sur:');
console.log('      - La catégorie (plat, soupe, dessert, etc.)');
console.log('      - La texture (mixée, hachée, etc.)');
console.log('      - Les ingrédients principaux');
console.log('      - Les restrictions alimentaires');
console.log('      - Les allergènes');
console.log('      - Le profil nutritionnel');
console.log('   3. Fusionner avec les tags existants');
console.log('   4. Sauvegarder les modifications\n');
addMissingTags();

