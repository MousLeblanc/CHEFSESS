/**
 * Script pour remplacer les instructions génériques par des instructions détaillées
 * Version avec règles basées sur les patterns (sans IA)
 * Utilise des templates et des règles pour générer des instructions spécifiques
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

// Patterns pour détecter les instructions génériques
const GENERIC_PATTERNS = [
  /préparer.*laver/i,
  /cuire.*protéine/i,
  /cuire.*accompagnement/i,
  /assembler.*assaisonner/i,
  /adapter.*texture/i,
  /cuire.*vapeur.*four.*poêle/i,
  /assaisonner.*modérément/i
];

/**
 * Vérifie si une instruction est générique
 */
function isGenericInstruction(instruction) {
  if (!instruction || typeof instruction !== 'string') return false;
  return GENERIC_PATTERNS.some(pattern => pattern.test(instruction));
}

/**
 * Vérifie si une recette a des instructions génériques
 */
function hasGenericInstructions(recipe) {
  if (!recipe.preparationSteps || !Array.isArray(recipe.preparationSteps) || recipe.preparationSteps.length === 0) {
    return false;
  }
  return recipe.preparationSteps.some(isGenericInstruction);
}

/**
 * Extrait les ingrédients principaux d'une recette
 */
function getMainIngredients(recipe) {
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients)) return [];
  
  // Trier par quantité décroissante pour obtenir les ingrédients principaux
  return recipe.ingredients
    .filter(ing => ing.name && ing.quantity)
    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
    .slice(0, 5) // Prendre les 5 principaux
    .map(ing => ing.name);
}

/**
 * Détermine la méthode de cuisson principale
 */
function getCookingMethod(recipe) {
  const name = (recipe.name || '').toLowerCase();
  const ingredients = (recipe.ingredients || []).map(ing => (ing.name || '').toLowerCase()).join(' ');
  
  if (name.includes('vapeur') || name.includes('steam')) return 'vapeur';
  if (name.includes('rôti') || name.includes('roti') || name.includes('roasted')) return 'four';
  if (name.includes('sauté') || name.includes('saute') || name.includes('sauté')) return 'poêle';
  if (name.includes('bouilli') || name.includes('boiled')) return 'eau bouillante';
  if (name.includes('grillé') || name.includes('grille') || name.includes('grilled')) return 'grill';
  if (name.includes('mijoté') || name.includes('mijote') || name.includes('stew')) return 'mijoté';
  if (name.includes('braisé') || name.includes('braise')) return 'braisé';
  
  // Par défaut selon les ingrédients
  if (ingredients.includes('poulet') || ingredients.includes('viande')) return 'poêle ou four';
  if (ingredients.includes('poisson') || ingredients.includes('saumon') || ingredients.includes('cabillaud')) return 'vapeur ou poêle';
  if (ingredients.includes('légumes') || ingredients.includes('legumes')) return 'vapeur';
  
  return 'selon le type d\'ingrédient';
}

/**
 * Génère des instructions détaillées basées sur des règles
 */
function generateDetailedInstructions(recipe) {
  const instructions = [];
  const name = recipe.name || '';
  const category = recipe.category || '';
  const texture = recipe.texture || 'normale';
  const mainIngredients = getMainIngredients(recipe);
  const cookingMethod = getCookingMethod(recipe);
  
  // Étape 1: Préparation des ingrédients
  if (mainIngredients.length > 0) {
    const prepSteps = [];
    
    mainIngredients.forEach(ing => {
      const ingLower = ing.toLowerCase();
      if (ingLower.includes('légume') || ingLower.includes('legume') || 
          ingLower.includes('carotte') || ingLower.includes('courgette') || 
          ingLower.includes('poireau') || ingLower.includes('tomate')) {
        prepSteps.push(`Laver, éplucher et couper ${ing} en morceaux adaptés à la texture ${texture}`);
      } else if (ingLower.includes('poulet') || ingLower.includes('viande') || ingLower.includes('dinde')) {
        prepSteps.push(`Découper ${ing} en morceaux de taille appropriée`);
      } else if (ingLower.includes('poisson') || ingLower.includes('saumon') || ingLower.includes('cabillaud')) {
        prepSteps.push(`Nettoyer et préparer ${ing} (retirer les arêtes si nécessaire)`);
      } else if (ingLower.includes('oignon') || ingLower.includes('ail')) {
        prepSteps.push(`Éplucher et hacher finement ${ing}`);
      }
    });
    
    if (prepSteps.length > 0) {
      instructions.push(prepSteps.join('. ') + '.');
    } else {
      instructions.push(`Préparer tous les ingrédients selon les besoins de la recette.`);
    }
  }
  
  // Étape 2: Cuisson selon la méthode
  if (cookingMethod === 'vapeur') {
    instructions.push(`Cuire les ingrédients à la vapeur pendant 15-20 minutes jusqu'à ce qu'ils soient tendres. Vérifier la cuisson régulièrement.`);
  } else if (cookingMethod === 'four') {
    instructions.push(`Préchauffer le four à 180°C. Enfourner et cuire pendant 30-45 minutes selon la taille des morceaux, jusqu'à ce que la viande soit bien cuite et dorée.`);
  } else if (cookingMethod === 'poêle') {
    instructions.push(`Chauffer une poêle anti-adhésive à feu moyen. Faire revenir les ingrédients pendant 10-15 minutes en remuant régulièrement jusqu'à ce qu'ils soient bien cuits.`);
  } else if (cookingMethod === 'mijoté') {
    instructions.push(`Mettre tous les ingrédients dans une casserole, couvrir d'eau ou de bouillon. Porter à ébullition puis laisser mijoter à feu doux pendant 45-60 minutes jusqu'à ce que les ingrédients soient tendres.`);
  } else if (cookingMethod === 'braisé') {
    instructions.push(`Faire revenir rapidement les ingrédients dans une poêle chaude, puis ajouter un peu de liquide (bouillon, vin) et laisser mijoter à couvert pendant 1h30-2h jusqu'à ce que la viande soit très tendre.`);
  } else {
    instructions.push(`Cuire les ingrédients selon la méthode appropriée (${cookingMethod}) jusqu'à ce qu'ils soient bien cuits.`);
  }
  
  // Étape 3: Adaptation de la texture
  if (texture === 'mixée' || texture === 'moulinée') {
    instructions.push(`Une fois cuits, mixer ou mouliner les ingrédients jusqu'à obtenir une texture lisse et homogène. Ajouter un peu de liquide (bouillon, eau) si nécessaire pour obtenir la consistance souhaitée.`);
  } else if (texture === 'hachée') {
    instructions.push(`Une fois cuits, hacher finement les ingrédients avec un couteau ou un hachoir pour obtenir une texture hachée.`);
  } else if (texture === 'tendre') {
    instructions.push(`Cuire jusqu'à ce que les ingrédients soient très tendres et faciles à mastiquer.`);
  }
  
  // Étape 4: Assaisonnement
  if (category === 'plat' && !name.toLowerCase().includes('sans sel')) {
    instructions.push(`Assaisonner avec du sel, du poivre et des herbes selon le goût. Goûter et ajuster l'assaisonnement si nécessaire.`);
  } else if (name.toLowerCase().includes('sans sel')) {
    instructions.push(`Assaisonner uniquement avec des herbes et des épices (pas de sel). Utiliser du poivre, des herbes de Provence, ou d'autres épices pour relever le goût.`);
  }
  
  // Étape 5: Finition et présentation
  if (category === 'plat') {
    instructions.push(`Servir chaud, en veillant à ce que la température soit adaptée (ni trop chaude, ni trop froide) pour les résidents.`);
  } else if (category === 'soupe') {
    instructions.push(`Servir bien chaud dans des bols. Vérifier la température avant de servir.`);
  } else if (category === 'accompagnement') {
    instructions.push(`Servir chaud en accompagnement du plat principal.`);
  }
  
  // Si on a moins de 5 instructions, ajouter des détails supplémentaires
  if (instructions.length < 5) {
    instructions.push(`Vérifier la cuisson et la texture avant de servir. S'assurer que tous les ingrédients sont bien cuits et adaptés à la texture requise.`);
  }
  
  return instructions;
}

async function fixGenericInstructions() {
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
    
    // Filtrer les recettes avec instructions génériques
    console.log('🔍 Détection des recettes avec instructions génériques...');
    const recipesWithGeneric = allRecipes.filter(hasGenericInstructions);
    console.log(`✅ ${recipesWithGeneric.length} recette(s) avec instructions génériques trouvée(s)\n`);
    
    if (recipesWithGeneric.length === 0) {
      console.log('✅ Aucune recette avec instructions génériques trouvée !');
      return;
    }
    
    // Statistiques
    let fixed = 0;
    let skipped = 0;
    let errors = 0;
    const fixedRecipes = [];
    const errorRecipes = [];
    
    console.log('🔧 Génération d\'instructions détaillées avec des règles...\n');
    
    for (let i = 0; i < recipesWithGeneric.length; i++) {
      const recipe = recipesWithGeneric[i];
      
      try {
        console.log(`[${i + 1}/${recipesWithGeneric.length}] Traitement de "${recipe.name}"...`);
        
        // Générer les nouvelles instructions
        const newInstructions = generateDetailedInstructions(recipe);
        
        if (newInstructions.length === 0) {
          console.log(`⚠️  Aucune instruction générée, recette ignorée\n`);
          skipped++;
          continue;
        }
        
        // Sauvegarder
        const oldInstructions = [...(recipe.preparationSteps || [])];
        recipe.preparationSteps = newInstructions;
        await recipe.save();
        
        fixed++;
        fixedRecipes.push({
          name: recipe.name,
          id: recipe._id,
          oldCount: oldInstructions.length,
          newCount: newInstructions.length,
          oldFirst: oldInstructions[0]?.substring(0, 60) || 'N/A',
          newFirst: newInstructions[0]?.substring(0, 60) || 'N/A'
        });
        
        console.log(`✅ Instructions générées (${newInstructions.length} étapes)`);
        console.log(`   Avant: ${oldInstructions[0]?.substring(0, 60)}...`);
        console.log(`   Après: ${newInstructions[0]?.substring(0, 60)}...\n`);
        
      } catch (error) {
        errors++;
        errorRecipes.push({
          name: recipe.name,
          id: recipe._id,
          error: error.message
        });
        console.error(`❌ Erreur: ${error.message}\n`);
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DE LA CORRECTION');
    console.log('='.repeat(80));
    console.log(`✅ Recettes corrigées: ${fixed}`);
    console.log(`⏭️  Recettes ignorées: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total analysé: ${recipesWithGeneric.length}`);
    
    if (fixedRecipes.length > 0) {
      console.log('\n📋 DÉTAIL DES CORRECTIONS (premiers 10):');
      fixedRecipes.slice(0, 10).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.name}`);
        console.log(`   Étapes avant: ${item.oldCount} → après: ${item.newCount}`);
        console.log(`   Avant: ${item.oldFirst}...`);
        console.log(`   Après: ${item.newFirst}...`);
      });
      if (fixedRecipes.length > 10) {
        console.log(`\n   ... et ${fixedRecipes.length - 10} autre(s) recette(s)`);
      }
    }
    
    if (errorRecipes.length > 0) {
      console.log('\n❌ RECETTES EN ERREUR:');
      errorRecipes.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name}: ${item.error}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Correction terminée !');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

console.log('🚀 Démarrage de la correction des instructions génériques (version règles)...\n');
console.log('📋 Ce script va:');
console.log('   1. Détecter les recettes avec instructions génériques');
console.log('   2. Générer des instructions détaillées basées sur des règles');
console.log('   3. Remplacer les instructions génériques par les nouvelles');
console.log('   4. Sauvegarder les modifications dans MongoDB');
console.log('\n✅ Cette version utilise des règles, pas d\'IA (pas de coût API)\n');
fixGenericInstructions();

