// scripts/view-pdf-text-sample.js
// Script pour voir un échantillon du texte extrait d'un PDF
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfFileName = process.argv[2] || '_OceanofPDF.com_Simplissime_100_recettes_French_Edition_-_Jean-Francois_Mallet.pdf';
const pdfPath = path.join(__dirname, '..', 'docs', 'pdf receipts', pdfFileName);

async function viewSample() {
  try {
    console.log('📖 Extraction d\'un échantillon du texte PDF\n');
    console.log(`📄 Fichier: ${pdfFileName}\n`);
    
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;
    
    console.log(`✅ ${text.length} caractères extraits`);
    console.log(`📄 ${data.numpages} pages\n`);
    
    // Sauvegarder les 5000 premiers caractères
    const sampleFile = path.join(__dirname, '..', 'data', 'pdf-text-sample.txt');
    fs.writeFileSync(sampleFile, text.substring(0, 5000), 'utf8');
    console.log(`💾 Échantillon sauvegardé: ${sampleFile}\n`);
    
    // Afficher les premières lignes
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    console.log('📋 Premières 100 lignes non vides:\n');
    console.log('='.repeat(80));
    lines.slice(0, 100).forEach((line, i) => {
      console.log(`${String(i + 1).padStart(3)}. ${line}`);
    });
    console.log('='.repeat(80));
    
    // Chercher des patterns de recettes
    console.log('\n🔍 Recherche de patterns de recettes:\n');
    
    // Chercher des lignes qui pourraient être des titres de recettes
    const possibleTitles = lines.filter(line => {
      return (
        (line.length >= 10 && line.length <= 80) &&
        (line.match(/^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸa-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-']{5,}$/) ||
         line.match(/^\d+[\.\)]\s+[A-Z]/) ||
         line.toLowerCase().includes('recette'))
      );
    });
    
    console.log(`📝 ${possibleTitles.length} lignes qui pourraient être des titres de recettes:`);
    possibleTitles.slice(0, 20).forEach((title, i) => {
      console.log(`   ${i + 1}. ${title.substring(0, 70)}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

viewSample();





