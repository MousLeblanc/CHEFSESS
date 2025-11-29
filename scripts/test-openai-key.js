/**
 * Script pour tester si la clé API OpenAI est valide et fonctionnelle
 */

import dotenv from "dotenv";
dotenv.config();

import openai from "../services/openaiClient.js";

async function testOpenAIKey() {
  try {
    console.log('🔍 Vérification de la clé API OpenAI...\n');
    
    // Vérifier si la clé est définie
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ ERREUR: La clé API OpenAI n\'est pas définie dans les variables d\'environnement.');
      console.error('   Veuillez définir la variable d\'environnement OPENAI_API_KEY dans votre fichier .env');
      process.exit(1);
    }
    
    // Masquer la clé pour l'affichage (afficher seulement les 7 premiers et 4 derniers caractères)
    const maskedKey = apiKey.length > 11 
      ? `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`
      : '***';
    
    console.log(`✅ Clé API trouvée: ${maskedKey}`);
    console.log(`   Longueur: ${apiKey.length} caractères\n`);
    
    // Tester la clé avec une requête simple
    console.log('🧪 Test de la clé avec une requête simple à l\'API OpenAI...\n');
    
    const testPrompt = "Réponds simplement 'OK' si tu reçois ce message.";
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Utiliser le modèle le moins cher pour le test
      messages: [
        {
          role: "system",
          content: "Tu es un assistant de test. Réponds simplement 'OK'."
        },
        {
          role: "user",
          content: testPrompt
        }
      ],
      max_tokens: 10,
      temperature: 0
    });
    
    const response = completion.choices[0].message.content;
    
    console.log('✅ REQUÊTE RÉUSSIE !');
    console.log(`   Réponse de l'API: "${response}"\n`);
    
    // Afficher les informations sur l'utilisation
    console.log('📊 Informations sur la requête:');
    console.log(`   Modèle utilisé: ${completion.model}`);
    console.log(`   Tokens utilisés: ${completion.usage?.total_tokens || 'N/A'}`);
    console.log(`   Tokens prompt: ${completion.usage?.prompt_tokens || 'N/A'}`);
    console.log(`   Tokens completion: ${completion.usage?.completion_tokens || 'N/A'}\n`);
    
    // Vérifier le quota (si disponible dans la réponse)
    if (completion.usage) {
      console.log('✅ La clé API est valide et fonctionnelle !');
      console.log('   Vous pouvez utiliser l\'API OpenAI dans vos scripts.\n');
    }
    
    // Test avec un modèle plus récent si disponible
    console.log('🧪 Test avec GPT-4o (si disponible)...\n');
    
    try {
      const completion4o = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: "Réponds 'OK'"
          }
        ],
        max_tokens: 5
      });
      
      console.log('✅ GPT-4o est disponible !');
      console.log(`   Réponse: "${completion4o.choices[0].message.content}"\n`);
    } catch (error) {
      if (error.message.includes('quota') || error.message.includes('billing')) {
        console.log('⚠️  GPT-4o n\'est pas disponible (quota ou facturation)');
        console.log('   Mais GPT-3.5-turbo fonctionne correctement.\n');
      } else {
        console.log(`⚠️  GPT-4o non disponible: ${error.message}\n`);
      }
    }
    
    console.log('='.repeat(80));
    console.log('✅ RÉSUMÉ: La clé API OpenAI est valide et fonctionnelle !');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ ERREUR lors du test de la clé API:\n');
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('   La clé API est invalide ou expirée.');
      console.error('   Veuillez vérifier votre clé API dans le fichier .env');
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      console.error('   Limite de taux dépassée. Attendez quelques instants avant de réessayer.');
    } else if (error.message.includes('quota') || error.message.includes('billing')) {
      console.error('   Quota API dépassé ou problème de facturation.');
      console.error('   Vérifiez votre compte OpenAI et votre facturation.');
    } else if (error.message.includes('Invalid API key')) {
      console.error('   La clé API est invalide.');
      console.error('   Vérifiez que la clé est correctement définie dans le fichier .env');
    } else {
      console.error(`   ${error.message}`);
    }
    
    console.error('\n   Détails de l\'erreur:');
    console.error(`   ${error.stack || error}\n`);
    
    process.exit(1);
  }
}

console.log('🚀 Test de la clé API OpenAI\n');
testOpenAIKey();
