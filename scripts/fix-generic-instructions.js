/**
 * Script pour remplacer les instructions génériques par des instructions détaillées
 * Utilise l'IA (OpenAI) pour générer des instructions spécifiques basées sur le nom et les ingrédients
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import openai from "../services/openaiClient.js";

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
 * Génère des instructions détaillées avec l'IA
 */
async function generateDetailedInstructions(recipe) {
  try {
    const ingredientsList = recipe.ingredients
      .map(ing => `- ${ing.name}: ${ing.quantity}${ing.unit || 'g'}`)
      .join('\n');
    
    const texture = recipe.texture || 'normale';
    const category = recipe.category || 'plat';
    
    const prompt = `Tu es un chef cuisinier professionnel spécialisé dans la cuisine pour établissements de soins (EHPAD, hôpitaux).

Génère des instructions de préparation DÉTAILLÉES et SPÉCIFIQUES pour cette recette :

**Nom de la recette**: ${recipe.name}
**Catégorie**: ${category}
**Texture requise**: ${texture}
**Ingrédients**:
${ingredientsList}

**Instructions actuelles (GÉNÉRIQUES - À REMPLACER)**:
${recipe.preparationSteps.join('\n')}

**EXIGENCES**:
1. Génère 5-8 étapes de préparation DÉTAILLÉES et SPÉCIFIQUES
2. Inclus les temps de cuisson précis (ex: "15 minutes", "jusqu'à ébullition")
3. Inclus les températures si nécessaire (ex: "à 180°C", "à feu moyen")
4. Inclus les techniques de cuisson spécifiques (ex: "saisir", "mijoter", "réduire")
5. Adapte les instructions à la texture requise: ${texture}
6. Sois précis sur les quantités et les proportions
7. Inclus les étapes de préparation des ingrédients (épluchage, découpe, etc.)
8. Évite les phrases génériques comme "préparer et laver", "cuire la protéine", "assembler et assaisonner"

**Format de réponse** (JSON strict):
{
  "instructions": [
    "Étape 1 détaillée...",
    "Étape 2 détaillée...",
    ...
  ]
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un chef cuisinier professionnel expert en cuisine pour établissements de soins. Tu génères des instructions de préparation détaillées, précises et adaptées aux besoins spécifiques (textures, régimes, etc.). Tu réponds UNIQUEMENT en JSON valide."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    const parsed = JSON.parse(response);
    
    if (!parsed.instructions || !Array.isArray(parsed.instructions) || parsed.instructions.length === 0) {
      throw new Error('Réponse IA invalide: pas d\'instructions générées');
    }
    
    return parsed.instructions;
  } catch (error) {
    console.error(`❌ Erreur lors de la génération d'instructions pour "${recipe.name}":`, error.message);
    throw error;
  }
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
    
    console.log('🤖 Génération d\'instructions détaillées avec l\'IA...\n');
    console.log('⚠️  Note: Ce processus peut prendre du temps et consommer des crédits OpenAI\n');
    
    for (let i = 0; i < recipesWithGeneric.length; i++) {
      const recipe = recipesWithGeneric[i];
      
      try {
        console.log(`[${i + 1}/${recipesWithGeneric.length}] Traitement de "${recipe.name}"...`);
        
        // Générer les nouvelles instructions
        const newInstructions = await generateDetailedInstructions(recipe);
        
        // Sauvegarder
        recipe.preparationSteps = newInstructions;
        await recipe.save();
        
        fixed++;
        fixedRecipes.push({
          name: recipe.name,
          id: recipe._id,
          oldCount: recipe.preparationSteps.length,
          newCount: newInstructions.length,
          newInstructions: newInstructions.slice(0, 2) // Afficher les 2 premières pour exemple
        });
        
        console.log(`✅ Instructions générées (${newInstructions.length} étapes)`);
        console.log(`   Exemple: ${newInstructions[0].substring(0, 80)}...\n`);
        
        // Pause pour éviter de surcharger l'API OpenAI
        if (i < recipesWithGeneric.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 seconde entre chaque requête
        }
        
      } catch (error) {
        errors++;
        errorRecipes.push({
          name: recipe.name,
          id: recipe._id,
          error: error.message
        });
        console.error(`❌ Erreur: ${error.message}\n`);
        
        // Si erreur de quota API, arrêter
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
    console.log(`✅ Recettes corrigées: ${fixed}`);
    console.log(`⏭️  Recettes ignorées: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total analysé: ${recipesWithGeneric.length}`);
    
    if (fixedRecipes.length > 0) {
      console.log('\n📋 DÉTAIL DES CORRECTIONS:');
      fixedRecipes.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.name}`);
        console.log(`   Étapes avant: ${item.oldCount}`);
        console.log(`   Étapes après: ${item.newCount}`);
        console.log(`   Première étape: ${item.newInstructions[0]?.substring(0, 100)}...`);
      });
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
    
    if (errors > 0 && errorRecipes.some(e => e.error.includes('quota'))) {
      console.log('\n⚠️  ATTENTION: Certaines recettes n\'ont pas pu être corrigées à cause du quota API.');
      console.log('   Réexécutez le script plus tard pour traiter les recettes restantes.');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

console.log('🚀 Démarrage de la correction des instructions génériques...\n');
console.log('📋 Ce script va:');
console.log('   1. Détecter les recettes avec instructions génériques');
console.log('   2. Utiliser l\'IA (OpenAI) pour générer des instructions détaillées');
console.log('   3. Remplacer les instructions génériques par les nouvelles');
console.log('   4. Sauvegarder les modifications dans MongoDB');
console.log('\n⚠️  ATTENTION: Ce script consomme des crédits OpenAI API\n');
fixGenericInstructions();

