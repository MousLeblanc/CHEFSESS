/**
 * Script pour améliorer la cohérence entre les titres et les ingrédients des recettes
 * Génère des suggestions de titres améliorés basés sur les ingrédients principaux
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

// Mots à ignorer lors de l'extraction
const STOP_WORDS = ['de', 'du', 'des', 'la', 'le', 'les', 'aux', 'avec', 'sans', 'pour', 'et', 'ou', 'en', 'au', 'à'];

/**
 * Extrait les mots principaux d'un texte
 */
function extractMainWords(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !STOP_WORDS.includes(word));
}

/**
 * Calcule la similarité entre deux listes de mots (coefficient de Jaccard)
 */
function calculateSimilarity(words1, words2) {
  if (words1.length === 0 || words2.length === 0) return 0;
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

/**
 * Extrait les ingrédients principaux d'une recette (par quantité)
 */
function getMainIngredients(recipe) {
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return [];
  
  return recipe.ingredients
    .filter(ing => ing.name && ing.quantity)
    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
    .slice(0, 5) // Prendre les 5 principaux
    .map(ing => ing.name);
}

/**
 * Génère un titre amélioré basé sur les ingrédients et la catégorie
 */
function generateImprovedTitle(recipe) {
  const category = recipe.category || '';
  const texture = recipe.texture || 'normale';
  const mainIngredients = getMainIngredients(recipe);
  
  if (mainIngredients.length === 0) {
    return null; // Pas d'ingrédients, impossible de générer un titre
  }
  
  // Extraire les mots-clés des ingrédients principaux
  const ingredientKeywords = mainIngredients
    .flatMap(ing => extractMainWords(ing))
    .filter(word => word.length > 3); // Mots significatifs
  
  // Identifier le type de protéine
  const proteins = [];
  const vegetables = [];
  const starches = [];
  const others = [];
  
  mainIngredients.forEach(ing => {
    const ingLower = ing.toLowerCase();
    const ingName = ing.trim();
    
    // Protéines
    if (ingLower.includes('poulet') || ingLower.includes('dinde') || ingLower.includes('volaille')) {
      if (ingLower.includes('poulet')) proteins.push('Poulet');
      else if (ingLower.includes('dinde')) proteins.push('Dinde');
      else proteins.push('Volaille');
    } else if (ingLower.includes('boeuf') || ingLower.includes('bœuf') || ingLower.includes('veau') || 
               (ingLower.includes('viande') && !ingLower.includes('haché'))) {
      if (ingLower.includes('veau')) proteins.push('Veau');
      else if (ingLower.includes('boeuf') || ingLower.includes('bœuf')) proteins.push('Bœuf');
      else proteins.push('Viande');
    } else if (ingLower.includes('porc') || ingLower.includes('jambon')) {
      proteins.push('Porc');
    } else if (ingLower.includes('poisson') || ingLower.includes('saumon') || ingLower.includes('cabillaud') || 
               ingLower.includes('thon') || ingLower.includes('truite') || ingLower.includes('merlan') || 
               ingLower.includes('sole')) {
      if (ingLower.includes('saumon')) proteins.push('Saumon');
      else if (ingLower.includes('cabillaud')) proteins.push('Cabillaud');
      else if (ingLower.includes('thon')) proteins.push('Thon');
      else proteins.push('Poisson');
    } else if (ingLower.includes('oeuf') || ingLower.includes('œuf')) {
      proteins.push('Œufs');
    } else if (ingLower.includes('steak haché') || ingLower.includes('haché')) {
      proteins.push('Steak haché');
    } else if (ingLower.includes('lentille') || ingLower.includes('haricot sec') || ingLower.includes('pois chiche')) {
      const name = ingName.split(' ')[0];
      proteins.push(name.charAt(0).toUpperCase() + name.slice(1));
    } else if (ingLower.includes('tofu')) {
      proteins.push('Tofu');
    }
    // Légumes
    else if (ingLower.includes('carotte')) {
      vegetables.push('Carottes');
    } else if (ingLower.includes('courgette')) {
      vegetables.push('Courgettes');
    } else if (ingLower.includes('poireau')) {
      vegetables.push('Poireaux');
    } else if (ingLower.includes('tomate')) {
      vegetables.push('Tomates');
    } else if (ingLower.includes('aubergine')) {
      vegetables.push('Aubergines');
    } else if (ingLower.includes('courge') || ingLower.includes('butternut') || ingLower.includes('potiron')) {
      if (ingLower.includes('butternut')) vegetables.push('Butternut');
      else if (ingLower.includes('potiron')) vegetables.push('Potiron');
      else vegetables.push('Courge');
    } else if (ingLower.includes('brocoli')) {
      vegetables.push('Brocoli');
    } else if (ingLower.includes('chou-fleur') || ingLower.includes('chou fleur')) {
      vegetables.push('Chou-fleur');
    } else if (ingLower.includes('chou')) {
      vegetables.push('Chou');
    } else if (ingLower.includes('haricot vert')) {
      vegetables.push('Haricots verts');
    } else if (ingLower.includes('épinard') || ingLower.includes('epinard')) {
      vegetables.push('Épinards');
    } else if (ingLower.includes('artichaut')) {
      vegetables.push('Artichauts');
    }
    // Féculents
    else if (ingLower.includes('pomme de terre') || ingLower.includes('pommes de terre') || ingLower.includes('patate')) {
      starches.push('Pommes de terre');
    } else if (ingLower.includes('riz')) {
      starches.push('Riz');
    } else if (ingLower.includes('pâte') || ingLower.includes('pate') || ingLower.includes('spaghetti') || 
               ingLower.includes('lasagne') || ingLower.includes('gnocchi')) {
      if (ingLower.includes('lasagne')) starches.push('Lasagnes');
      else if (ingLower.includes('spaghetti')) starches.push('Spaghettis');
      else starches.push('Pâtes');
    } else if (ingLower.includes('quinoa')) {
      starches.push('Quinoa');
    } else if (ingLower.includes('boulgour')) {
      starches.push('Boulgour');
    } else if (ingLower.includes('couscous')) {
      starches.push('Couscous');
    } else if (ingLower.includes('semoule')) {
      starches.push('Semoule');
    }
    // Autres
    else {
      const name = ingName.split(' ')[0];
      others.push(name.charAt(0).toUpperCase() + name.slice(1));
    }
  });
  
  // Générer le titre selon la catégorie
  let newTitle = '';
  
  if (category === 'soupe' || category === 'potage') {
    // Soupes : "Soupe de [ingrédient principal]"
    if (vegetables.length > 0) {
      newTitle = `Soupe de ${vegetables[0]}`;
      if (vegetables.length > 1) {
        newTitle += ` et ${vegetables[1]}`;
      }
    } else if (proteins.length > 0) {
      newTitle = `Soupe ${proteins[0].toLowerCase()}`;
      if (vegetables.length > 0) {
        newTitle += ` aux ${vegetables[0].toLowerCase()}`;
      }
    } else {
      newTitle = `Soupe aux ${mainIngredients[0].split(' ')[0]}`;
    }
    
    // Ajouter texture si nécessaire
    if (texture === 'mixée' || texture === 'moulinée') {
      newTitle += ' mixée';
    }
    
  } else if (category === 'plat') {
    // Plats : "[Protéine] avec [légumes] et [féculent]"
    if (proteins.length > 0) {
      newTitle = proteins[0];
      
      // Ajouter méthode de cuisson si détectée dans le nom original
      const originalName = (recipe.name || '').toLowerCase();
      if (originalName.includes('rôti') || originalName.includes('roti')) {
        newTitle = `${proteins[0]} rôti`;
      } else if (originalName.includes('vapeur')) {
        newTitle = `${proteins[0]} vapeur`;
      } else if (originalName.includes('grillé') || originalName.includes('grille')) {
        newTitle = `${proteins[0]} grillé`;
      } else if (originalName.includes('mijoté') || originalName.includes('mijote')) {
        newTitle = `${proteins[0]} mijoté`;
      }
      
      if (vegetables.length > 0) {
        newTitle += ` aux ${vegetables[0].toLowerCase()}`;
        if (vegetables.length > 1) {
          newTitle += ` et ${vegetables[1].toLowerCase()}`;
        }
      }
      
      if (starches.length > 0 && !originalName.includes(starches[0].toLowerCase())) {
        newTitle += `, ${starches[0].toLowerCase()}`;
      }
    } else if (vegetables.length > 0) {
      // Plat végétarien
      newTitle = vegetables[0];
      if (vegetables.length > 1) {
        newTitle += ` et ${vegetables[1]}`;
      }
      if (starches.length > 0) {
        newTitle += `, ${starches[0].toLowerCase()}`;
      }
    } else {
      // Fallback : utiliser le premier ingrédient principal
      newTitle = mainIngredients[0].split(' ')[0].charAt(0).toUpperCase() + mainIngredients[0].split(' ')[0].slice(1);
    }
    
    // Ajouter texture si nécessaire
    if (texture === 'mixée' || texture === 'moulinée') {
      newTitle += ' mixé';
    } else if (texture === 'hachée') {
      newTitle += ' haché';
    }
    
  } else if (category === 'dessert') {
    // Desserts : "[Fruit] [préparation]"
    if (others.some(o => o.toLowerCase().includes('pomme'))) {
      newTitle = 'Compote de pommes';
    } else if (others.some(o => o.toLowerCase().includes('fruits'))) {
      newTitle = 'Salade de fruits';
    } else {
      newTitle = mainIngredients[0].split(' ')[0].charAt(0).toUpperCase() + mainIngredients[0].split(' ')[0].slice(1);
    }
    
  } else if (category === 'accompagnement') {
    // Accomagnements : "[Type] de [ingrédient]"
    if (mainIngredients[0].toLowerCase().includes('pomme de terre') || mainIngredients[0].toLowerCase().includes('pommes de terre')) {
      newTitle = 'Purée de pommes de terre';
    } else {
      newTitle = `Purée de ${mainIngredients[0].toLowerCase()}`;
    }
    
    if (texture === 'mixée' || texture === 'moulinée') {
      newTitle += ' mixée';
    }
    
  } else {
    // Catégorie inconnue : utiliser le premier ingrédient principal
    newTitle = mainIngredients[0].split(' ')[0].charAt(0).toUpperCase() + mainIngredients[0].split(' ')[0].slice(1);
  }
  
  // Ajouter "sans sel" si présent dans le nom original
  const originalName = recipe.name || '';
  if (originalName.toLowerCase().includes('sans sel') || originalName.toLowerCase().includes('sans_sel')) {
    newTitle += ' sans sel';
  }
  
  return newTitle;
}

async function improveTitleIngredientCoherence(threshold = 0.2, dryRun = true) {
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
    let analyzed = 0;
    let lowCoherence = 0;
    let improved = 0;
    let skipped = 0;
    let errors = 0;
    const improvements = [];
    
    console.log(`🔍 Analyse de la cohérence titre/ingrédients (seuil: ${(threshold * 100).toFixed(0)}%)...\n`);
    if (dryRun) {
      console.log('⚠️  MODE DRY-RUN : Aucune modification ne sera appliquée\n');
    }
    
    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      
      try {
        // Ignorer les recettes sans nom ou sans ingrédients
        if (!recipe.name || !recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
          skipped++;
          continue;
        }
        
        // Calculer la cohérence
        const titleWords = extractMainWords(recipe.name);
        const ingredientWords = recipe.ingredients.flatMap(ing => extractMainWords(ing.name || ''));
        const similarity = calculateSimilarity(titleWords, ingredientWords);
        
        analyzed++;
        
        // Si la cohérence est faible, générer un titre amélioré
        if (similarity < threshold) {
          lowCoherence++;
          
          const improvedTitle = generateImprovedTitle(recipe);
          
          if (improvedTitle && improvedTitle !== recipe.name) {
            // Calculer la nouvelle cohérence
            const newTitleWords = extractMainWords(improvedTitle);
            const newSimilarity = calculateSimilarity(newTitleWords, ingredientWords);
            
            // Ne proposer que si l'amélioration est significative (au moins +5%)
            if (newSimilarity > similarity + 0.05) {
              improvements.push({
                name: recipe.name,
                id: recipe._id,
                oldSimilarity: similarity,
                newTitle: improvedTitle,
                newSimilarity: newSimilarity,
                improvement: newSimilarity - similarity,
                mainIngredients: getMainIngredients(recipe).slice(0, 3)
              });
              
              // Appliquer la modification si pas en mode dry-run
              if (!dryRun) {
                recipe.name = improvedTitle;
                await recipe.save();
                improved++;
              }
            }
          }
        }
        
        if ((i + 1) % 100 === 0) {
          console.log(`[${i + 1}/${allRecipes.length}] Analysées... (${lowCoherence} avec faible cohérence)`);
        }
        
      } catch (error) {
        errors++;
        console.error(`❌ Erreur pour "${recipe.name}":`, error.message);
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DE L\'AMÉLIORATION DE LA COHÉRENCE');
    console.log('='.repeat(80));
    console.log(`📈 STATISTIQUES:`);
    console.log(`   Total de recettes analysées: ${analyzed}`);
    console.log(`   Recettes avec faible cohérence (< ${(threshold * 100).toFixed(0)}%): ${lowCoherence}`);
    console.log(`   Titres améliorés proposés: ${improvements.length}`);
    if (!dryRun) {
      console.log(`   ✅ Titres modifiés: ${improved}`);
    }
    console.log(`   ⏭️  Recettes ignorées: ${skipped}`);
    console.log(`   ❌ Erreurs: ${errors}`);
    
    if (improvements.length > 0) {
      // Trier par amélioration décroissante
      improvements.sort((a, b) => b.improvement - a.improvement);
      
      console.log(`\n📋 EXEMPLES D'AMÉLIORATIONS (premiers 15):`);
      improvements.slice(0, 15).forEach((item, index) => {
        console.log(`\n${index + 1}. "${item.name}"`);
        console.log(`   Cohérence avant: ${(item.oldSimilarity * 100).toFixed(1)}%`);
        console.log(`   Titre proposé: "${item.newTitle}"`);
        console.log(`   Cohérence après: ${(item.newSimilarity * 100).toFixed(1)}%`);
        console.log(`   Amélioration: +${(item.improvement * 100).toFixed(1)}%`);
        console.log(`   Ingrédients principaux: ${item.mainIngredients.join(', ')}`);
      });
      
      if (improvements.length > 15) {
        console.log(`\n   ... et ${improvements.length - 15} autre(s) amélioration(s) proposée(s)`);
      }
      
      // Statistiques d'amélioration
      const avgImprovement = improvements.reduce((sum, item) => sum + item.improvement, 0) / improvements.length;
      const maxImprovement = Math.max(...improvements.map(item => item.improvement));
      const minImprovement = Math.min(...improvements.map(item => item.improvement));
      
      console.log(`\n📊 STATISTIQUES D'AMÉLIORATION:`);
      console.log(`   Amélioration moyenne: +${(avgImprovement * 100).toFixed(1)}%`);
      console.log(`   Amélioration maximale: +${(maxImprovement * 100).toFixed(1)}%`);
      console.log(`   Amélioration minimale: +${(minImprovement * 100).toFixed(1)}%`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Analyse terminée !');
    console.log('='.repeat(80));
    
    if (dryRun && improvements.length > 0) {
      console.log(`\n💡 Pour appliquer les modifications, exécutez:`);
      console.log(`   node scripts/improve-title-ingredient-coherence.js ${threshold} false`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

// Récupérer les arguments de ligne de commande
const threshold = parseFloat(process.argv[2]) || 0.2; // Seuil de similarité (20% par défaut)
const dryRun = process.argv[3] !== 'false'; // Mode dry-run par défaut

console.log('🚀 Démarrage de l\'amélioration de la cohérence titre/ingrédients...\n');
console.log('📋 Ce script va:');
console.log('   1. Analyser la cohérence entre les titres et les ingrédients');
console.log('   2. Identifier les recettes avec une faible cohérence');
console.log('   3. Générer des suggestions de titres améliorés');
console.log(`   4. ${dryRun ? 'Afficher les suggestions (mode dry-run)' : 'Appliquer les modifications'}\n`);
improveTitleIngredientCoherence(threshold, dryRun);

