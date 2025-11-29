// scripts/extract-all-pdfs.js
// Script pour extraire les recettes de tous les PDFs dans docs/pdf receipts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import extractRecipesFromPDF from './extract-recipes-from-pdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfDirectory = path.join(__dirname, '..', 'docs', 'pdf receipts');
const outputDirectory = path.join(__dirname, '..', 'data', 'pdf-recipes');

async function extractAllPDFs() {
  try {
    console.log('📚 Extraction des recettes depuis tous les PDFs\n');
    console.log(`📁 Dossier PDF: ${pdfDirectory}`);
    console.log(`📁 Dossier de sortie: ${outputDirectory}\n`);
    
    // Créer le dossier de sortie s'il n'existe pas
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
      console.log('✅ Dossier de sortie créé\n');
    }
    
    // Lister tous les PDFs
    const files = fs.readdirSync(pdfDirectory).filter(file => file.endsWith('.pdf'));
    console.log(`📄 ${files.length} fichier(s) PDF trouvé(s)\n`);
    
    let totalRecipes = 0;
    const results = [];
    
    for (const file of files) {
      const pdfPath = path.join(pdfDirectory, file);
      const pdfName = path.basename(file, '.pdf');
      const outputPath = path.join(outputDirectory, `${pdfName}-recipes.js`);
      
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📖 Traitement: ${file}`);
      console.log(`${'='.repeat(60)}`);
      
      try {
        const recipes = await extractRecipesFromPDF(pdfPath, outputPath);
        totalRecipes += recipes.length;
        results.push({
          file,
          success: true,
          count: recipes.length
        });
        console.log(`✅ ${recipes.length} recette(s) extraite(s) de ${file}`);
      } catch (error) {
        console.error(`❌ Erreur lors de l'extraction de ${file}:`, error.message);
        results.push({
          file,
          success: false,
          error: error.message
        });
      }
    }
    
    // Résumé final
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 RÉSUMÉ FINAL');
    console.log(`${'='.repeat(60)}`);
    console.log(`Total de PDFs traités: ${files.length}`);
    console.log(`Total de recettes extraites: ${totalRecipes}`);
    console.log(`\nDétails par fichier:`);
    results.forEach(result => {
      if (result.success) {
        console.log(`  ✅ ${result.file}: ${result.count} recette(s)`);
      } else {
        console.log(`  ❌ ${result.file}: Erreur - ${result.error}`);
      }
    });
    
    console.log(`\n✅ Tous les fichiers ont été traités!`);
    console.log(`📁 Fichiers générés dans: ${outputDirectory}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || process.argv[1].includes('extract-all-pdfs')) {
  extractAllPDFs()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default extractAllPDFs;

