// scripts/debug-pdf-parsing.js
// Script pour déboguer le parsing PDF et voir le texte brut
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import extractRecipesFromPDF from './extract-recipes-from-pdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfFileName = process.argv[2] || '_OceanofPDF.com_Simplissime_100_recettes_French_Edition_-_Jean-Francois_Mallet.pdf';
const pdfPath = path.join(__dirname, '..', 'docs', 'pdf receipts', pdfFileName);

async function debugParsing() {
  try {
    console.log('🔍 Débogage du parsing PDF\n');
    console.log(`📄 Fichier: ${pdfFileName}\n`);
    
    // Extraire le texte directement
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const pdfParseModule = require('pdf-parse');
    
    // pdf-parse peut être exporté différemment selon la version
    const pdfParse = pdfParseModule.default || pdfParseModule.PDFParse || pdfParseModule;
    
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await (typeof pdfParse === 'function' ? pdfParse(dataBuffer) : pdfParseModule(dataBuffer));
    const rawText = data ? data.text : '';
    
    console.log(`✅ ${rawText.length} caractères extraits\n`);
    
    // Sauvegarder le texte brut
    const rawTextFile = path.join(__dirname, '..', 'data', 'pdf-raw-text-sample.txt');
    fs.writeFileSync(rawTextFile, rawText.substring(0, 15000), 'utf8');
    console.log(`💾 Texte brut sauvegardé: ${rawTextFile}\n`);
    
    // Nettoyer et sauvegarder
    let cleaned = rawText.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])\s+([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])/gi, '$1$2');
    
    const cleanedFile = path.join(__dirname, '..', 'data', 'pdf-cleaned-text-sample.txt');
    fs.writeFileSync(cleanedFile, cleaned.substring(0, 15000), 'utf8');
    console.log(`💾 Texte nettoyé sauvegardé: ${cleanedFile}\n`);
    
    // Afficher un échantillon
    const lines = cleaned.split('\n').filter(l => l.trim().length > 0);
    console.log('='.repeat(80));
    console.log('📋 PREMIÈRES 100 LIGNES NETTOYÉES:');
    console.log('='.repeat(80));
    lines.slice(0, 100).forEach((line, i) => {
      if (line.length > 5) {
        console.log(`${String(i + 1).padStart(3)}. ${line.substring(0, 90)}`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Échantillons sauvegardés dans data/');
    console.log('📁 Vérifiez les fichiers pour comprendre le format des recettes');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error(error.stack);
  }
}

debugParsing();

