/**
 * Script pour améliorer toutes les recettes avec l'IA OpenAI
 * Améliore les titres, les instructions, et la cohérence globale
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import openai from "../services/openaiClient.js";

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
    .filter(word => !['de', 'du', 'des', 'la', 'le', 'les', 'aux', 'avec', 'sans', 'pour'].includes(word));
}

/**
 * Calcule la similarité entre deux listes de mots
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
 * Vérifie si une instruction est générique
 */
function isGenericInstruction(instruction) {
  if (!instruction || typeof instruction !== 'string') return false;
  const genericPatterns = [
    /préparer.*laver/i,
    /cuire.*protéine/i,
    /cuire.*accompagnement/i,
    /assembler.*assaisonner/i,
    /adapter.*texture/i
  ];
  return genericPatterns.some(pattern => pattern.test(instruction));
}

/**
 * Améliore le titre d'une recette avec l'IA
 */
async function improveTitleWithAI(recipe) {
  try {
    const ingredientsList = recipe.ingredients
      .map(ing => `- ${ing.name}: ${ing.quantity}${ing.unit || 'g'}`)
      .join('\n');
    
    const prompt = `Tu es un expert en cuisine pour établissements de soins (EHPAD, hôpitaux).

Améliore le titre de cette recette pour qu'il corresponde mieux aux ingrédients principaux, tout en restant descriptif et appétissant.

**Titre actuel**: ${recipe.name}
**Catégorie**: ${recipe.category || 'plat'}
**Texture**: ${recipe.texture || 'normale'}
**Ingrédients principaux**:
${ingredientsList}

**EXIGENCES**:
1. Le titre doit mentionner les ingrédients principaux (protéine, légumes, féculent si présent)
2. Conserver le style et le type de plat (ex: "Waterzooi", "Tajine", "Risotto")
3. Le titre doit être en français, clair et descriptif
4. Si le titre actuel est déjà bon, le conserver tel quel
5. Maximum 10-12 mots

**Format de réponse** (JSON strict):
{
  "title": "Nouveau titre amélioré",
  "reason": "Raison de l'amélioration ou 'Titre déjà optimal'"
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en cuisine pour établissements de soins. Tu améliores les titres de recettes pour qu'ils soient clairs, descriptifs et correspondent aux ingrédients. Tu réponds UNIQUEMENT en JSON valide."
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
    console.error(`   ❌ Erreur IA pour le titre: ${error.message}`);
    return null;
  }
}

/**
 * Améliore les instructions d'une recette avec l'IA
 */
async function improveInstructionsWithAI(recipe) {
  try {
    const ingredientsList = recipe.ingredients
      .map(ing => `- ${ing.name}: ${ing.quantity}${ing.unit || 'g'}`)
      .join('\n');
    
    const currentSteps = (recipe.preparationSteps || []).join('\n');
    const hasGeneric = (recipe.preparationSteps || []).some(isGenericInstruction);
    
    const prompt = `Tu es un chef cuisinier professionnel spécialisé dans la cuisine pour établissements de soins (EHPAD, hôpitaux).

Génère des instructions de préparation DÉTAILLÉES et SPÉCIFIQUES pour cette recette :

**Nom de la recette**: ${recipe.name}
**Catégorie**: ${recipe.category || 'plat'}
**Texture requise**: ${recipe.texture || 'normale'}
**Ingrédients**:
${ingredientsList}

**Instructions actuelles**:
${currentSteps || 'Aucune instruction'}

${hasGeneric ? '⚠️ Les instructions actuelles sont trop génériques. Remplace-les par des instructions détaillées.' : 'Améliore les instructions si nécessaire.'}

**EXIGENCES**:
1. Génère 5-8 étapes de préparation DÉTAILLÉES et SPÉCIFIQUES
2. Inclus les temps de cuisson précis (ex: "15 minutes", "jusqu'à ébullition")
3. Inclus les températures si nécessaire (ex: "à 180°C", "à feu moyen")
4. Inclus les techniques de cuisson spécifiques (ex: "saisir", "mijoter", "réduire")
5. Adapte les instructions à la texture requise: ${recipe.texture || 'normale'}
6. Sois précis sur les quantités et les proportions
7. Inclus les étapes de préparation des ingrédients (épluchage, découpe, etc.)
8. Évite les phrases génériques comme "préparer et laver", "cuire la protéine", "assembler et assaisonner"

**Format de réponse** (JSON strict):
{
  "instructions": [
    "Étape 1 détaillée...",
    "Étape 2 détaillée...",
    ...
  ],
  "improved": true
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un chef cuisinier professionnel expert en cuisine pour établissements de soins. Tu génères des instructions de préparation détaillées, précises et adaptées aux besoins spécifiques. Tu réponds UNIQUEMENT en JSON valide."
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
      return null;
    }
    
    return parsed.instructions;
  } catch (error) {
    console.error(`   ❌ Erreur IA pour les instructions: ${error.message}`);
    return null;
  }
}

async function improveAllRecipesWithAI() {
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
    let titlesImproved = 0;
    let instructionsImproved = 0;
    let skipped = 0;
    let errors = 0;
    const improvements = [];
    
    console.log('🤖 Amélioration avec l\'IA OpenAI...\n');
    console.log('⚠️  Ce processus peut prendre du temps et consommer des crédits OpenAI\n');
    
    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      
      try {
        console.log(`[${i + 1}/${allRecipes.length}] "${recipe.name}"...`);
        
        let hasChanges = false;
        const changes = {
          name: recipe.name,
          id: recipe._id,
          titleChanged: false,
          instructionsChanged: false,
          oldTitle: recipe.name,
          newTitle: null,
          oldInstructionsCount: (recipe.preparationSteps || []).length,
          newInstructionsCount: null
        };
        
        // Ignorer les recettes sans ingrédients
        if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
          console.log(`   ⏭️  Pas d'ingrédients, ignorée\n`);
          skipped++;
          continue;
        }
        
        // Vérifier la cohérence titre/ingrédients
        const titleWords = extractMainWords(recipe.name);
        const ingredientWords = recipe.ingredients.flatMap(ing => extractMainWords(ing.name || ''));
        const similarity = calculateSimilarity(titleWords, ingredientWords);
        
        // Améliorer le titre si cohérence < 30%
        if (similarity < 0.3) {
          const improvedTitle = await improveTitleWithAI(recipe);
          if (improvedTitle && improvedTitle !== recipe.name) {
            recipe.name = improvedTitle;
            changes.newTitle = improvedTitle;
            changes.titleChanged = true;
            hasChanges = true;
            titlesImproved++;
            console.log(`   ✅ Titre amélioré: "${improvedTitle}"`);
          }
          
          // Pause pour éviter de surcharger l'API
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Vérifier les instructions génériques
        const hasGenericInstructions = (recipe.preparationSteps || []).some(isGenericInstruction);
        
        if (hasGenericInstructions || !recipe.preparationSteps || recipe.preparationSteps.length === 0) {
          const improvedInstructions = await improveInstructionsWithAI(recipe);
          if (improvedInstructions && improvedInstructions.length > 0) {
            recipe.preparationSteps = improvedInstructions;
            changes.newInstructionsCount = improvedInstructions.length;
            changes.instructionsChanged = true;
            hasChanges = true;
            instructionsImproved++;
            console.log(`   ✅ Instructions améliorées (${improvedInstructions.length} étapes)`);
          }
          
          // Pause pour éviter de surcharger l'API
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Sauvegarder si des changements ont été faits
        if (hasChanges) {
          await recipe.save();
          improvements.push(changes);
          console.log(`   ✅ Recette améliorée\n`);
        } else {
          console.log(`   ✓ Déjà optimale\n`);
        }
        
        analyzed++;
        
        // Pause entre chaque recette pour éviter les rate limits
        if (i < allRecipes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
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
    console.log('📊 RÉSUMÉ DE L\'AMÉLIORATION AVEC IA');
    console.log('='.repeat(80));
    console.log(`✅ Recettes analysées: ${analyzed}`);
    console.log(`📝 Titres améliorés: ${titlesImproved}`);
    console.log(`📋 Instructions améliorées: ${instructionsImproved}`);
    console.log(`⏭️  Recettes ignorées: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total de recettes: ${allRecipes.length}`);
    
    if (improvements.length > 0) {
      console.log('\n📋 EXEMPLES D\'AMÉLIORATIONS (premiers 10):');
      improvements.slice(0, 10).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.oldTitle}`);
        if (item.titleChanged) {
          console.log(`   Titre: "${item.oldTitle}" → "${item.newTitle}"`);
        }
        if (item.instructionsChanged) {
          console.log(`   Instructions: ${item.oldInstructionsCount} → ${item.newInstructionsCount} étapes`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Amélioration terminée !');
    console.log('='.repeat(80));
    
    if (errors > 0 && improvements.some(i => i.error && i.error.includes('quota'))) {
      console.log('\n⚠️  ATTENTION: Certaines recettes n\'ont pas pu être améliorées à cause du quota API.');
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

console.log('🚀 Démarrage de l\'amélioration de toutes les recettes avec l\'IA...\n');
console.log('📋 Ce script va:');
console.log('   1. Analyser toutes les recettes');
console.log('   2. Améliorer les titres avec faible cohérence (< 30%)');
console.log('   3. Améliorer les instructions génériques');
console.log('   4. Utiliser GPT-4o pour des améliorations de qualité');
console.log('\n⚠️  ATTENTION: Ce script consomme des crédits OpenAI API\n');
improveAllRecipesWithAI();

