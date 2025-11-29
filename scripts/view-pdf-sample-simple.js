// scripts/view-pdf-sample-simple.js
// Script simple pour voir un échantillon du texte PDF
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utiliser le texte déjà extrait si disponible, sinon extraire
const pdfFileName = process.argv[2] || '_OceanofPDF.com_Simplissime_100_recettes_French_Edition_-_Jean-Francois_Mallet.pdf';

// Essayer de lire depuis le fichier JSON généré pour voir ce qui a été extrait
const jsonFile = path.join(__dirname, '..', 'data', 'pdf-recipes', `${pdfFileName.replace('.pdf', '')}-recipes.json`);

if (fs.existsSync(jsonFile)) {
  const content = fs.readFileSync(jsonFile, 'utf8');
  const recipes = JSON.parse(content);
  
  console.log('📊 Recettes extraites:', recipes.length);
  if (recipes.length > 0) {
    console.log('\n📝 Première recette extraite:');
    console.log(JSON.stringify(recipes[0], null, 2));
  } else {
    console.log('\n⚠️  Aucune recette trouvée. Le parser doit être amélioré.');
  }
} else {
  console.log('❌ Fichier JSON non trouvé. Exécutez d\'abord:');
  console.log(`   node scripts/extract-single-pdf.js "${pdfFileName}"`);
}





