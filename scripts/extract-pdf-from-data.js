// scripts/extract-pdf-from-data.js
// Script pour extraire les recettes d'un PDF depuis data/pdf-recipes
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import extractRecipesFromPDF from './extract-recipes-from-pdf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pdfDirectory = path.join(__dirname, '..', 'data', 'pdf-recipes');
const outputDirectory = path.join(__dirname, '..', 'data', 'pdf-recipes');

async function extractPDFFromData(pdfFileName) {
  try {
    console.log('📚 Extraction d\'un PDF depuis data/pdf-recipes\n');
    console.log('='.repeat(80));
    
    // Vérifier que le fichier existe
    const pdfPath = path.join(pdfDirectory, pdfFileName);
    if (!fs.existsSync(pdfPath)) {
      console.error(`❌ Fichier non trouvé: ${pdfPath}`);
      console.log('\n📋 Fichiers PDF disponibles dans data/pdf-recipes:');
      const files = fs.readdirSync(pdfDirectory).filter(f => f.endsWith('.pdf'));
      if (files.length === 0) {
        console.log('   ❌ Aucun fichier PDF trouvé');
      } else {
        files.forEach((f, i) => {
          console.log(`   ${i + 1}. ${f}`);
        });
      }
      process.exit(1);
    }
    
    console.log(`📄 Fichier: ${pdfFileName}`);
    console.log(`📁 Chemin: ${pdfPath}`);
    
    // Créer le dossier de sortie s'il n'existe pas
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
      console.log(`✅ Dossier de sortie créé: ${outputDirectory}`);
    }
    
    const pdfName = path.basename(pdfFileName, '.pdf');
    const outputPath = path.join(outputDirectory, `${pdfName}-recipes.js`);
    
    console.log(`📁 Sortie: ${outputPath}\n`);
    console.log('='.repeat(80));
    console.log('🚀 Démarrage de l\'extraction...\n');
    
    // Extraire les recettes
    const startTime = Date.now();
    const recipes = await extractRecipesFromPDF(pdfPath, outputPath);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Résultats
    console.log('\n' + '='.repeat(80));
    console.log('✅ EXTRACTION TERMINÉE');
    console.log('='.repeat(80));
    console.log(`⏱️  Durée: ${duration}s`);
    console.log(`📊 Recettes extraites: ${recipes.length}`);
    
    if (recipes.length > 0) {
      console.log('\n📝 Liste des recettes extraites:');
      recipes.forEach((recipe, i) => {
        console.log(`   ${i + 1}. ${recipe.name}`);
        console.log(`      - ${recipe.ingredients.length} ingrédient(s)`);
        console.log(`      - ${recipe.preparationSteps.length} étape(s)`);
      });
    } else {
      console.log('\n⚠️  Aucune recette détectée dans ce PDF');
      console.log('   Le format du PDF ne correspond peut-être pas aux patterns attendus.');
      console.log('   Vérifiez le fichier texte extrait pour comprendre le format.');
    }
    
    console.log('\n' + '='.repeat(80));
    
    return recipes;
    
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
    
    process.exit(1);
  }
}

// Exécution
const pdfFileName = process.argv[2];

if (!pdfFileName) {
  console.log('📚 Extraction de recettes depuis un PDF dans data/pdf-recipes\n');
  console.log('Usage: node scripts/extract-pdf-from-data.js <nom-du-fichier.pdf>');
  console.log('\nExemple:');
  console.log('  node scripts/extract-pdf-from-data.js "_OceanofPDF.com_Kitchen_Aid_150_recettes_du_monde_entier_French_Edition_-_CUISINE.pdf"');
  console.log('\n📋 Fichiers PDF disponibles dans data/pdf-recipes:');
  
  const files = fs.readdirSync(pdfDirectory).filter(f => f.endsWith('.pdf'));
  if (files.length === 0) {
    console.log('   ❌ Aucun fichier PDF trouvé');
  } else {
    files.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f}`);
    });
  }
  
  process.exit(1);
}

extractPDFFromData(pdfFileName)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });





