// scripts/analyze-pdf-sample.js
// Script pour analyser un échantillon de texte PDF et comprendre le format
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Analyser plusieurs PDFs pour voir les différents formats
const pdfFiles = [
  '_OceanofPDF.com_Simplissime_100_recettes_French_Edition_-_Jean-Francois_Mallet.pdf',
  '_OceanofPDF.com_300_recettes_mediterraneennes_-_IG_Bas_-_Denise_Cardin.pdf',
  '_OceanofPDF.com_Recettes_de_dinde_French_Edition_-_Ait-Ali_Sylvie.pdf'
];

const pdfDirectory = path.join(__dirname, '..', 'docs', 'pdf receipts');
const outputDir = path.join(__dirname, '..', 'data');

async function analyzePDF(pdfName) {
  const pdfPath = path.join(pdfDirectory, pdfName);
  
  if (!fs.existsSync(pdfPath)) {
    console.log(`❌ Fichier non trouvé: ${pdfName}`);
    return null;
  }
  
  try {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📖 Analyse de: ${pdfName}`);
    console.log('='.repeat(80));
    
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;
    
    console.log(`✅ ${text.length} caractères extraits`);
    console.log(`📄 ${data.numpages} pages\n`);
    
    // Diviser en lignes
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    console.log(`📊 ${lines.length} lignes non vides\n`);
    
    // Sauvegarder un échantillon
    const sampleFile = path.join(outputDir, `pdf-sample-${pdfName.replace('.pdf', '')}.txt`);
    fs.writeFileSync(sampleFile, text.substring(0, 10000), 'utf8');
    console.log(`💾 Échantillon sauvegardé: ${sampleFile}\n`);
    
    // Analyser les patterns
    console.log('🔍 Analyse des patterns:\n');
    
    // Chercher des titres de recettes possibles
    const titlePatterns = [
      { name: 'Lignes en majuscules (10-100 chars)', pattern: /^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ\s]{10,100}$/ },
      { name: 'Numéros suivis de texte', pattern: /^\d+[\.\)]\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]/ },
      { name: 'Mot "recette"', pattern: /recette/i },
      { name: 'Mot "ingrédient"', pattern: /ingrédient|ingredient/i },
      { name: 'Mot "préparation"', pattern: /préparation|preparation/i },
      { name: 'Quantités (200g, 2 cuillères)', pattern: /\d+\s*(g|kg|ml|l|cl|dl|c\.?\s*à\s*s|c\.?\s*à\s*c|cuillère|tasse|verre)/i }
    ];
    
    titlePatterns.forEach(({ name, pattern }) => {
      const matches = lines.filter(line => pattern.test(line));
      if (matches.length > 0) {
        console.log(`  ✅ ${name}: ${matches.length} correspondances`);
        console.log(`     Exemples: ${matches.slice(0, 3).map(m => m.substring(0, 60)).join(' | ')}`);
      } else {
        console.log(`  ❌ ${name}: 0 correspondances`);
      }
    });
    
    // Afficher les premières lignes significatives
    console.log('\n📋 Premières 30 lignes significatives:\n');
    lines.slice(0, 30).forEach((line, i) => {
      if (line.length > 5) {
        console.log(`${String(i + 1).padStart(3)}. ${line.substring(0, 100)}`);
      }
    });
    
    // Chercher des sections de recettes
    console.log('\n🔍 Recherche de sections de recettes:\n');
    let recipeCount = 0;
    let inRecipe = false;
    let recipeStart = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Détecter le début d'une recette
      if ((line.match(/^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ\s]{10,80}$/) && 
           !line.match(/^(TABLE|INDEX|SOMMAIRE|CONTENU|PAGE)/i)) ||
          line.match(/^\d+[\.\)]\s+[A-Z]/) ||
          line.toLowerCase().includes('recette')) {
        if (inRecipe && recipeStart >= 0) {
          // Afficher la recette précédente
          console.log(`\n📝 Recette ${recipeCount + 1} (lignes ${recipeStart + 1}-${i}):`);
          const recipeLines = lines.slice(recipeStart, Math.min(recipeStart + 15, i));
          recipeLines.forEach((l, idx) => {
            console.log(`   ${l.substring(0, 80)}`);
          });
          recipeCount++;
          if (recipeCount >= 3) break; // Limiter à 3 exemples
        }
        recipeStart = i;
        inRecipe = true;
      }
    }
    
    return {
      pdfName,
      totalChars: text.length,
      totalLines: lines.length,
      recipeCount: recipeCount
    };
    
  } catch (error) {
    console.error(`❌ Erreur lors de l'analyse de ${pdfName}:`, error.message);
    return null;
  }
}

async function analyzeAll() {
  console.log('🔍 Analyse des échantillons PDF pour adapter le parser\n');
  
  const results = [];
  for (const pdfFile of pdfFiles) {
    const result = await analyzePDF(pdfFile);
    if (result) {
      results.push(result);
    }
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log('📊 RÉSUMÉ');
  console.log('='.repeat(80));
  results.forEach(r => {
    console.log(`${r.pdfName}: ${r.totalChars} caractères, ${r.totalLines} lignes`);
  });
  
  console.log('\n✅ Analyse terminée!');
  console.log(`📁 Échantillons sauvegardés dans: ${outputDir}`);
}

analyzeAll().catch(console.error);





