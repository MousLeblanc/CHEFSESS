// scripts/test-pdf-extraction.js
// Script de test pour voir le format du texte extrait
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfPath = path.join(__dirname, '..', 'docs', 'pdf receipts', '_OceanofPDF.com_Simplissime_100_recettes_French_Edition_-_Jean-Francois_Mallet.pdf');

async function testExtraction() {
  try {
    console.log('📖 Extraction du texte du PDF...\n');
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;
    
    console.log(`✅ ${text.length} caractères extraits\n`);
    // Sauvegarder dans un fichier pour analyse
    const outputFile = path.join(__dirname, '..', 'data', 'pdf-text-sample.txt');
    fs.writeFileSync(outputFile, text.substring(0, 5000), 'utf8');
    console.log(`✅ Échantillon sauvegardé dans: ${outputFile}`);
    
    // Analyser les lignes
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    console.log(`\n📊 ${lines.length} lignes non vides`);
    console.log(`📄 ${text.length} caractères au total\n`);
    
    // Chercher des patterns de recettes
    console.log('🔍 Recherche de patterns de recettes...\n');
    const recipePatterns = [
      /recette/i,
      /ingrédient/i,
      /préparation/i,
      /instruction/i,
      /^\d+[\.\)]\s+[A-Z]/,
      /^[A-Z][A-Z\s]{10,}$/
    ];
    
    recipePatterns.forEach((pattern, i) => {
      const matches = lines.filter(line => pattern.test(line));
      console.log(`Pattern ${i + 1}: ${matches.length} correspondances`);
      if (matches.length > 0) {
        console.log(`  Exemples: ${matches.slice(0, 3).join(' | ')}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testExtraction();

