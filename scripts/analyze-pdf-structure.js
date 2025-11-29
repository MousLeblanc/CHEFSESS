// scripts/analyze-pdf-structure.js
// Script pour analyser la structure d'un PDF et comprendre comment les recettes sont organisées
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfFileName = process.argv[2] || '_OceanofPDF.com_Simplissime_100_recettes_French_Edition_-_Jean-Francois_Mallet.pdf';
const pdfPath = path.join(__dirname, '..', 'docs', 'pdf receipts', pdfFileName);

async function analyzeStructure() {
  try {
    console.log('🔍 Analyse de la structure du PDF\n');
    console.log(`📄 Fichier: ${pdfFileName}\n`);
    
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data ? data.text : '';
    
    console.log(`✅ ${text.length} caractères extraits`);
    console.log(`📄 ${data.numpages} pages\n`);
    
    // Nettoyer le texte
    let cleanedText = text.replace(/\s+/g, ' ');
    cleanedText = cleanedText.replace(/([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])\s+([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])/gi, '$1$2');
    
    // Sauvegarder le texte nettoyé
    const outputFile = path.join(__dirname, '..', 'data', 'pdf-cleaned-text.txt');
    fs.writeFileSync(outputFile, cleanedText.substring(0, 10000), 'utf8');
    console.log(`💾 Texte nettoyé sauvegardé: ${outputFile}\n`);
    
    // Diviser en lignes
    const lines = cleanedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    console.log(`📊 ${lines.length} lignes non vides\n`);
    
    // Afficher les premières 150 lignes pour voir la structure
    console.log('='.repeat(80));
    console.log('📋 PREMIÈRES 150 LIGNES (pour comprendre la structure):');
    console.log('='.repeat(80));
    lines.slice(0, 150).forEach((line, i) => {
      if (line.length > 3) {
        console.log(`${String(i + 1).padStart(4)}. ${line.substring(0, 100)}`);
      }
    });
    
    // Chercher des patterns spécifiques
    console.log('\n' + '='.repeat(80));
    console.log('🔍 RECHERCHE DE PATTERNS:');
    console.log('='.repeat(80));
    
    // Chercher des numéros de recettes
    const numberedLines = lines.filter(l => /^\d+[\.\)]\s/.test(l));
    console.log(`\n📝 Lignes numérotées (titres possibles): ${numberedLines.length}`);
    if (numberedLines.length > 0) {
      console.log('   Exemples:');
      numberedLines.slice(0, 10).forEach((l, i) => {
        console.log(`   ${i + 1}. ${l.substring(0, 70)}`);
      });
    }
    
    // Chercher des mots-clés de recettes
    const keywords = ['recette', 'ingrédient', 'préparation', 'cuisson', 'min', 'g ', 'kg ', 'ml ', 'cuillère'];
    keywords.forEach(keyword => {
      const matches = lines.filter(l => l.toLowerCase().includes(keyword));
      if (matches.length > 0) {
        console.log(`\n🔑 Mot-clé "${keyword}": ${matches.length} occurrences`);
        console.log(`   Exemples: ${matches.slice(0, 3).map(m => m.substring(0, 60)).join(' | ')}`);
      }
    });
    
    // Chercher des quantités (ingrédients)
    const quantityPattern = /\d+\s*(g|kg|ml|l|cl|dl|cuillère|tasse|verre|pièce)/i;
    const quantityLines = lines.filter(l => quantityPattern.test(l));
    console.log(`\n📦 Lignes avec quantités (ingrédients possibles): ${quantityLines.length}`);
    if (quantityLines.length > 0) {
      console.log('   Exemples:');
      quantityLines.slice(0, 10).forEach((l, i) => {
        console.log(`   ${i + 1}. ${l.substring(0, 70)}`);
      });
    }
    
    // Chercher des instructions (verbes d'action)
    const actionVerbs = ['coupez', 'faites', 'mélangez', 'ajoutez', 'versez', 'chauffez', 'cuisez', 'salez', 'poivrez'];
    const instructionLines = lines.filter(l => {
      const lower = l.toLowerCase();
      return actionVerbs.some(verb => lower.includes(verb));
    });
    console.log(`\n👨‍🍳 Lignes avec verbes d'action (instructions possibles): ${instructionLines.length}`);
    if (instructionLines.length > 0) {
      console.log('   Exemples:');
      instructionLines.slice(0, 10).forEach((l, i) => {
        console.log(`   ${i + 1}. ${l.substring(0, 70)}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Analyse terminée!');
    console.log(`📁 Texte nettoyé sauvegardé dans: ${outputFile}`);
    console.log('\n💡 Utilisez ces informations pour améliorer le parser dans extract-recipes-from-pdf.js');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  }
}

analyzeStructure();

