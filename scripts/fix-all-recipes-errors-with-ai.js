/**
 * Script pour corriger toutes les erreurs et incohérences dans les recettes avec l'IA
 * Utilise GPT-4o pour analyser et corriger chaque recette de manière systématique
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";
import openai from "../services/openaiClient.js";

/**
 * Analyse une recette et génère des corrections avec l'IA
 */
async function analyzeAndFixRecipeWithAI(recipe) {
  try {
    const ingredientsList = recipe.ingredients
      .map(ing => `- ${ing.name}: ${ing.quantity}${ing.unit || 'g'}`)
      .join('\n');
    
    const allergensList = (recipe.allergens || []).join(', ') || 'Aucun';
    const tagsList = (recipe.tags || []).join(', ') || 'Aucun';
    const dietaryRestrictionsList = (recipe.dietaryRestrictions || []).join(', ') || 'Aucun';
    const instructionsList = (recipe.preparationSteps || []).join('\n') || 'Aucune';
    
    const prompt = `Tu es un expert en cuisine pour établissements de soins (EHPAD, hôpitaux) et en conformité avec la directive UE 1169/2011.

Analyse cette recette et corrige TOUTES les erreurs et incohérences que tu détectes :

**RECETTE À ANALYSER**:
- Nom: ${recipe.name}
- Catégorie: ${recipe.category || 'non spécifiée'}
- Texture: ${recipe.texture || 'normale'}
- Tags: ${tagsList}
- Allergènes déclarés: ${allergensList}
- Restrictions alimentaires: ${dietaryRestrictionsList}
- Ingrédients:
${ingredientsList}
- Instructions:
${instructionsList}

**TÂCHES DE CORRECTION**:
1. **Cohérence titre/ingrédients**: Vérifie que le titre correspond aux ingrédients principaux. Si non, propose un titre corrigé.
2. **Allergènes UE 1169/2011**: Détecte TOUS les allergènes présents dans les ingrédients et compare avec ceux déclarés. Ajoute les manquants.
3. **Catégorie**: Vérifie que la catégorie correspond au type de plat (soupe, plat, dessert, etc.).
4. **Tags**: Vérifie que les tags correspondent aux ingrédients, allergènes, et restrictions. Ajoute les tags manquants, retire les incorrects.
5. **Instructions**: Si les instructions sont génériques (ex: "Préparer et laver", "Cuire la protéine"), génère des instructions détaillées et spécifiques.
6. **Restrictions alimentaires**: Vérifie la cohérence entre les restrictions déclarées et les ingrédients (ex: "végétarien" mais présence de viande).
7. **Profil nutritionnel**: Si manquant ou incohérent, laisse-le tel quel (sera calculé automatiquement).

**RÈGLES STRICTES**:
- Ne modifie QUE ce qui est incorrect ou incohérent
- Conserve le style et le format original
- Respecte la directive UE 1169/2011 pour les allergènes
- Les instructions doivent être détaillées (5-8 étapes avec temps, températures, techniques)
- Le titre doit mentionner les ingrédients principaux présents

**Format de réponse** (JSON strict):
{
  "corrections": {
    "title": "Nouveau titre si correction nécessaire, sinon null",
    "allergens": ["liste", "complète", "des", "allergènes", "détectés"],
    "tags": ["liste", "complète", "des", "tags", "corrigés"],
    "dietaryRestrictions": ["liste", "corrigée", "des", "restrictions"],
    "category": "catégorie corrigée si nécessaire, sinon null",
    "instructions": ["instruction", "1", "détaillée", "...", "instruction", "N", "..."],
    "issuesFound": ["description", "des", "problèmes", "détectés"]
  },
  "reason": "Explication des corrections apportées"
}

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en cuisine pour établissements de soins, en conformité UE 1169/2011, et en qualité de données. Tu analyses et corriges les recettes de manière systématique et précise. Tu réponds UNIQUEMENT en JSON valide."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Plus bas pour plus de précision
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    const parsed = JSON.parse(response);
    
    return parsed.corrections;
  } catch (error) {
    console.error(`   ❌ Erreur IA: ${error.message}`);
    return null;
  }
}

async function fixAllRecipesErrorsWithAI() {
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
    let fixed = 0;
    let skipped = 0;
    let errors = 0;
    const corrections = {
      titles: 0,
      allergens: 0,
      tags: 0,
      instructions: 0,
      categories: 0,
      restrictions: 0
    };
    const fixedRecipes = [];
    
    console.log('🤖 Analyse et correction avec l\'IA (GPT-4o)...\n');
    console.log('⚠️  Ce processus peut prendre du temps et consommer des crédits OpenAI\n');
    
    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      
      try {
        console.log(`[${i + 1}/${allRecipes.length}] "${recipe.name}"...`);
        
        // Ignorer les recettes sans ingrédients
        if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
          console.log(`   ⏭️  Pas d'ingrédients, ignorée\n`);
          skipped++;
          continue;
        }
        
        // Analyser et corriger avec l'IA
        const aiCorrections = await analyzeAndFixRecipeWithAI(recipe);
        
        if (!aiCorrections) {
          console.log(`   ⚠️  Impossible d'obtenir des corrections de l'IA\n`);
          errors++;
          continue;
        }
        
        let hasChanges = false;
        const changes = {
          name: recipe.name,
          id: recipe._id,
          corrections: []
        };
        
        // Appliquer les corrections
        if (aiCorrections.title && aiCorrections.title !== recipe.name) {
          recipe.name = aiCorrections.title;
          changes.corrections.push('Titre');
          corrections.titles++;
          hasChanges = true;
        }
        
        if (aiCorrections.allergens && Array.isArray(aiCorrections.allergens)) {
          const newAllergens = [...new Set(aiCorrections.allergens)]; // Éviter les doublons
          if (JSON.stringify(newAllergens.sort()) !== JSON.stringify((recipe.allergens || []).sort())) {
            recipe.allergens = newAllergens;
            changes.corrections.push('Allergènes');
            corrections.allergens++;
            hasChanges = true;
          }
        }
        
        if (aiCorrections.tags && Array.isArray(aiCorrections.tags)) {
          const newTags = [...new Set(aiCorrections.tags)]; // Éviter les doublons
          if (JSON.stringify(newTags.sort()) !== JSON.stringify((recipe.tags || []).sort())) {
            recipe.tags = newTags;
            changes.corrections.push('Tags');
            corrections.tags++;
            hasChanges = true;
          }
        }
        
        if (aiCorrections.dietaryRestrictions && Array.isArray(aiCorrections.dietaryRestrictions)) {
          const newRestrictions = [...new Set(aiCorrections.dietaryRestrictions)];
          if (JSON.stringify(newRestrictions.sort()) !== JSON.stringify((recipe.dietaryRestrictions || []).sort())) {
            recipe.dietaryRestrictions = newRestrictions;
            changes.corrections.push('Restrictions');
            corrections.restrictions++;
            hasChanges = true;
          }
        }
        
        if (aiCorrections.category && aiCorrections.category !== recipe.category) {
          recipe.category = aiCorrections.category;
          changes.corrections.push('Catégorie');
          corrections.categories++;
          hasChanges = true;
        }
        
        if (aiCorrections.instructions && Array.isArray(aiCorrections.instructions) && aiCorrections.instructions.length > 0) {
          const currentSteps = (recipe.preparationSteps || []).join('\n').toLowerCase();
          const newSteps = aiCorrections.instructions.join('\n').toLowerCase();
          
          // Vérifier si les nouvelles instructions sont vraiment différentes (pas juste une reformulation)
          if (newSteps.length > currentSteps.length * 1.2 || // 20% plus longues = plus détaillées
              !currentSteps.includes('minute') && newSteps.includes('minute') || // Ajout de temps
              !currentSteps.includes('°c') && newSteps.includes('°c')) { // Ajout de température
            recipe.preparationSteps = aiCorrections.instructions;
            changes.corrections.push('Instructions');
            corrections.instructions++;
            hasChanges = true;
          }
        }
        
        // Sauvegarder si des changements ont été faits
        if (hasChanges) {
          await recipe.save();
          fixed++;
          fixedRecipes.push(changes);
          console.log(`   ✅ Corrigé: ${changes.corrections.join(', ')}\n`);
        } else {
          console.log(`   ✓ Aucune correction nécessaire\n`);
        }
        
        analyzed++;
        
        // Pause entre chaque recette pour éviter les rate limits
        if (i < allRecipes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 secondes
        }
        
      } catch (error) {
        errors++;
        console.error(`   ❌ Erreur: ${error.message}\n`);
        
        // Si erreur de quota, arrêter
        if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('429')) {
          console.error('⚠️  Quota API OpenAI dépassé. Arrêt du script.');
          console.error(`   ${analyzed} recettes analysées, ${fixed} corrigées.`);
          console.error(`   Réexécutez le script plus tard pour continuer.`);
          break;
        }
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DE LA CORRECTION AVEC IA');
    console.log('='.repeat(80));
    console.log(`✅ Recettes analysées: ${analyzed}`);
    console.log(`✅ Recettes corrigées: ${fixed}`);
    console.log(`⏭️  Recettes ignorées: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total de recettes: ${allRecipes.length}`);
    
    console.log(`\n📋 DÉTAIL DES CORRECTIONS:`);
    console.log(`   Titres corrigés: ${corrections.titles}`);
    console.log(`   Allergènes corrigés: ${corrections.allergens}`);
    console.log(`   Tags corrigés: ${corrections.tags}`);
    console.log(`   Instructions améliorées: ${corrections.instructions}`);
    console.log(`   Catégories corrigées: ${corrections.categories}`);
    console.log(`   Restrictions corrigées: ${corrections.restrictions}`);
    
    if (fixedRecipes.length > 0) {
      console.log(`\n📋 EXEMPLES DE RECETTES CORRIGÉES (premiers 15):`);
      fixedRecipes.slice(0, 15).forEach((item, index) => {
        console.log(`\n${index + 1}. "${item.name}"`);
        console.log(`   Corrections: ${item.corrections.join(', ')}`);
      });
      if (fixedRecipes.length > 15) {
        console.log(`\n   ... et ${fixedRecipes.length - 15} autre(s) recette(s)`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Correction terminée !');
    console.log('='.repeat(80));
    
    if (errors > 0 && fixedRecipes.some(r => r.error && r.error.includes('quota'))) {
      console.log(`\n⚠️  ATTENTION: Certaines recettes n'ont pas pu être corrigées à cause du quota API.`);
      console.log(`   Réexécutez le script plus tard pour traiter les recettes restantes.`);
    }
    
    // Exporter le fichier corrigé
    console.log(`\n💾 Régénération du fichier all-recipes.js avec les corrections...`);
    const { exec } = await import('child_process');
    exec('node scripts/export-all-recipes-to-js.js', (error, stdout, stderr) => {
      if (error) {
        console.error(`   ⚠️  Erreur lors de la régénération: ${error.message}`);
      } else {
        console.log(`   ✅ Fichier all-recipes.js régénéré avec les corrections`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

console.log('🚀 Démarrage de la correction complète avec l\'IA...\n');
console.log('📋 Ce script va:');
console.log('   1. Analyser chaque recette avec GPT-4o');
console.log('   2. Détecter toutes les erreurs et incohérences:');
console.log('      - Incohérences titre/ingrédients');
console.log('      - Allergènes manquants (UE 1169/2011)');
console.log('      - Tags incorrects');
console.log('      - Instructions génériques');
console.log('      - Catégories incorrectes');
console.log('      - Restrictions incohérentes');
console.log('   3. Appliquer les corrections automatiquement');
console.log('   4. Régénérer le fichier all-recipes.js');
console.log('\n⚠️  ATTENTION: Ce script consomme des crédits OpenAI API');
console.log('   Temps estimé: ~20-30 minutes pour 535 recettes\n');
fixAllRecipesErrorsWithAI();

