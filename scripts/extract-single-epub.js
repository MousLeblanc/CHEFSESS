// scripts/extract-single-epub.js
// Script pour extraire les recettes d'un seul EPUB avec retours détaillés
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import extractRecipesFromEPUB from './extract-recipes-from-epub.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const epubDirectory = path.join(__dirname, '..', 'docs', 'pdf receipts');
const outputDirectory = path.join(__dirname, '..', 'data', 'pdf-recipes');

async function extractSingleEPUB(epubFileName) {
  try {
    console.log('📚 Extraction d\'un seul EPUB\n');
    console.log('='.repeat(80));
    
    // Vérifier que le fichier existe
    const epubPath = path.join(epubDirectory, epubFileName);
    if (!fs.existsSync(epubPath)) {
      console.error(`❌ Fichier non trouvé: ${epubPath}`);
      console.log('\n📋 Fichiers EPUB disponibles:');
      const files = fs.readdirSync(epubDirectory).filter(f => f.endsWith('.epub'));
      files.forEach((f, i) => {
        console.log(`   ${i + 1}. ${f}`);
      });
      process.exit(1);
    }
    
    console.log(`📄 Fichier: ${epubFileName}`);
    console.log(`📁 Chemin: ${epubPath}`);
    
    // Créer le dossier de sortie s'il n'existe pas
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
      console.log(`✅ Dossier de sortie créé: ${outputDirectory}`);
    }
    
    const epubName = path.basename(epubFileName, '.epub');
    const outputPath = path.join(outputDirectory, `${epubName}-recipes.js`);
    
    console.log(`📁 Sortie: ${outputPath}\n`);
    console.log('='.repeat(80));
    console.log('🚀 Démarrage de l\'extraction...\n');
    
    // Extraire les recettes
    const startTime = Date.now();
    const result = await extractRecipesFromEPUB(epubPath, outputPath);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Résultats
    console.log('\n' + '='.repeat(80));
    console.log('✅ EXTRACTION TERMINÉE');
    console.log('='.repeat(80));
    console.log(`⏱️  Durée: ${duration}s`);
    console.log(`📊 Caractères extraits: ${result.length}`);
    
    if (result.recipes && result.recipes.length > 0) {
      console.log(`📝 Recettes extraites: ${result.recipes.length}`);
      console.log('\n📝 Liste des recettes extraites:');
      result.recipes.forEach((recipe, i) => {
        console.log(`   ${i + 1}. ${recipe.name}`);
        console.log(`      - ${recipe.ingredients.length} ingrédient(s)`);
        console.log(`      - ${recipe.preparationSteps.length} étape(s)`);
      });
    } else {
      console.log('\n⚠️  Aucune recette détectée dans ce EPUB');
      console.log('   Le texte a été extrait et sauvegardé pour analyse.');
      console.log('   Vérifiez le fichier texte extrait pour comprendre le format.');
    }
    
    console.log('\n' + '='.repeat(80));
    
    return result;
    
  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ ERREUR LORS DE L\'EXTRACTION');
    console.error('='.repeat(80));
    console.error(`Message: ${error.message}`);
    console.error(`Type: ${error.name}`);
    
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    
    console.error('\n💡 Suggestions:');
    console.error('   - Vérifiez que le fichier EPUB n\'est pas corrompu');
    console.error('   - Assurez-vous que jszip et jsdom sont installés: npm install jszip jsdom');
    console.error('   - Le EPUB doit être un fichier valide');
    
    process.exit(1);
  }
}

// Exécution
const epubFileName = process.argv[2];

if (!epubFileName) {
  console.log('📚 Extraction de recettes depuis un EPUB\n');
  console.log('Usage: node scripts/extract-single-epub.js <nom-du-fichier.epub>');
  console.log('\nExemple:');
  console.log('  node scripts/extract-single-epub.js "_OceanofPDF.com_Recettes_de_dinde_French_Edition_-_Ait-Ali_Sylvie.epub"');
  console.log('\n📋 Fichiers EPUB disponibles:');
  
  const files = fs.readdirSync(epubDirectory).filter(f => f.endsWith('.epub'));
  if (files.length === 0) {
    console.log('   ❌ Aucun fichier EPUB trouvé dans:', epubDirectory);
  } else {
    files.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f}`);
    });
  }
  
  process.exit(1);
}

extractSingleEPUB(epubFileName)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });





