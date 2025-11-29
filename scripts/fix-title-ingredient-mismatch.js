/**
 * Script pour corriger les recettes où le titre mentionne des ingrédients absents
 * Utilise l'IA pour générer un titre cohérent avec les ingrédients réels
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import openai from "../services/openaiClient.js";

/**
 * Vérifie si un mot du titre est présent dans les ingrédients
 */
function isIngredientInList(ingredientName, ingredients) {
  const ingLower = ingredientName.toLowerCase();
  const ingredientsText = ingredients.map(ing => ing.name.toLowerCase()).join(' ');
  
  // Vérifier correspondance exacte ou partielle
  return ingredientsText.includes(ingLower) ||
         ingredientsText.includes(ingLower.replace(/s$/, '')) || // Pluriel/singulier
         ingredientsText.includes(ingLower + 's') ||
         ingredientsText.includes(ingLower.replace(/e$/, '')) || // Féminin/masculin
         ingredientsText.includes(ingLower + 'e');
}

/**
 * Extrait les ingrédients mentionnés dans le titre
 */
function extractIngredientsFromTitle(title) {
  const titleLower = title.toLowerCase();
  const ingredients = [];
  
  // Liste des ingrédients communs à rechercher
  const commonIngredients = [
    'dinde', 'poulet', 'boeuf', 'bœuf', 'veau', 'porc', 'jambon',
    'poisson', 'saumon', 'cabillaud', 'thon', 'truite',
    'ricotta', 'fromage', 'emmental', 'parmesan',
    'épinard', 'epinard', 'tomate', 'carotte', 'courgette',
    'poireau', 'aubergine', 'brocoli', 'chou-fleur', 'chou',
    'pois chiche', 'lentille', 'haricot', 'quinoa', 'riz',
    'pâtes', 'pate', 'semoule', 'boulgour', 'couscous',
    'pomme de terre', 'pommes de terre', 'patate'
  ];
  
  commonIngredients.forEach(ing => {
    if (titleLower.includes(ing)) {
      ingredients.push(ing);
    }
  });
  
  return ingredients;
}

/**
 * Génère un titre corrigé avec l'IA
 */
async function generateCorrectedTitle(recipe) {
  try {
    const ingredientsList = recipe.ingredients
      .map(ing => `- ${ing.name}: ${ing.quantity}${ing.unit || 'g'}`)
      .join('\n');
    
    const titleIngredients = extractIngredientsFromTitle(recipe.name);
    const missingIngredients = titleIngredients.filter(ing => 
      !isIngredientInList(ing, recipe.ingredients)
    );
    
    const prompt = `Tu es un expert en cuisine pour établissements de soins.

Le titre de cette recette mentionne des ingrédients qui ne sont PAS présents dans la liste des ingrédients réels.

**Titre actuel**: ${recipe.name}
**Ingrédients mentionnés dans le titre mais ABSENTS**: ${missingIngredients.join(', ')}

**Ingrédients RÉELS de la recette**:
${ingredientsList}

**Catégorie**: ${recipe.category || 'plat'}
**Texture**: ${recipe.texture || 'normale'}

**TÂCHE**: Génère un nouveau titre qui :
1. Correspond EXACTEMENT aux ingrédients réels présents
2. Conserve le style et le type de plat si possible
3. Est descriptif et appétissant
4. Ne mentionne QUE les ingrédients réellement présents

**Format de réponse** (JSON strict):
{
  "title": "Nouveau titre corrigé",
  "reason": "Explication de la correction"
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en cuisine. Tu corriges les titres de recettes pour qu'ils correspondent exactement aux ingrédients réels. Tu réponds UNIQUEMENT en JSON valide."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    const parsed = JSON.parse(response);
    
    return parsed.title;
  } catch (error) {
    console.error(`   ❌ Erreur IA: ${error.message}`);
    return null;
  }
}

async function fixTitleIngredientMismatch() {
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
    let issuesFound = 0;
    let fixed = 0;
    let skipped = 0;
    let errors = 0;
    const issues = [];
    
    console.log('🔍 Recherche des incohérences titre/ingrédients...\n');
    
    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      
      try {
        // Ignorer les recettes sans nom ou sans ingrédients
        if (!recipe.name || !recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
          skipped++;
          continue;
        }
        
        analyzed++;
        
        // Extraire les ingrédients mentionnés dans le titre
        const titleIngredients = extractIngredientsFromTitle(recipe.name);
        
        if (titleIngredients.length === 0) {
          continue; // Pas d'ingrédient spécifique dans le titre
        }
        
        // Vérifier si tous les ingrédients du titre sont présents
        const missingIngredients = titleIngredients.filter(ing => 
          !isIngredientInList(ing, recipe.ingredients)
        );
        
        if (missingIngredients.length > 0) {
          issuesFound++;
          issues.push({
            name: recipe.name,
            id: recipe._id,
            missingIngredients: missingIngredients,
            actualIngredients: recipe.ingredients.map(ing => ing.name).slice(0, 5)
          });
          
          console.log(`[${issuesFound}] "${recipe.name}"`);
          console.log(`   ❌ Ingrédients manquants: ${missingIngredients.join(', ')}`);
          
          // Générer un titre corrigé
          const correctedTitle = await generateCorrectedTitle(recipe);
          
          if (correctedTitle && correctedTitle !== recipe.name) {
            recipe.name = correctedTitle;
            await recipe.save();
            fixed++;
            console.log(`   ✅ Titre corrigé: "${correctedTitle}"\n`);
            
            // Pause pour éviter de surcharger l'API
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            console.log(`   ⚠️  Impossible de générer un titre corrigé\n`);
          }
        }
        
        if ((i + 1) % 100 === 0) {
          console.log(`[${i + 1}/${allRecipes.length}] Analysées... (${issuesFound} problèmes trouvés, ${fixed} corrigés)`);
        }
        
      } catch (error) {
        errors++;
        console.error(`   ❌ Erreur: ${error.message}\n`);
        
        // Si erreur de quota, arrêter
        if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('429')) {
          console.error('⚠️  Quota API OpenAI dépassé. Arrêt du script.');
          break;
        }
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DE LA CORRECTION');
    console.log('='.repeat(80));
    console.log(`✅ Recettes analysées: ${analyzed}`);
    console.log(`⚠️  Problèmes détectés: ${issuesFound}`);
    console.log(`✅ Titres corrigés: ${fixed}`);
    console.log(`⏭️  Recettes ignorées: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    
    if (issues.length > 0) {
      console.log('\n📋 DÉTAIL DES PROBLÈMES:');
      issues.slice(0, 20).forEach((item, index) => {
        console.log(`\n${index + 1}. "${item.name}"`);
        console.log(`   Ingrédients manquants: ${item.missingIngredients.join(', ')}`);
        console.log(`   Ingrédients réels: ${item.actualIngredients.join(', ')}...`);
      });
      if (issues.length > 20) {
        console.log(`\n   ... et ${issues.length - 20} autre(s) problème(s)`);
      }
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

console.log('🚀 Démarrage de la correction des incohérences titre/ingrédients...\n');
console.log('📋 Ce script va:');
console.log('   1. Analyser toutes les recettes');
console.log('   2. Détecter les ingrédients mentionnés dans le titre mais absents');
console.log('   3. Utiliser l\'IA pour générer un titre corrigé');
console.log('   4. Appliquer les corrections\n');
fixTitleIngredientMismatch();

