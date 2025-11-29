// scripts/extract-single-json.js
// Script pour extraire les recettes d'un seul fichier JSON avec marqueur "recette :"
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import extractRecipesFromJSON from './extract-recipes-from-json.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonDirectory = path.join(__dirname, '..', 'data', 'pdf-recipes');
const outputDirectory = path.join(__dirname, '..', 'data', 'pdf-recipes');

async function extractSingleJSON(jsonFileName) {
  try {
    console.log('📚 Extraction d\'un fichier JSON\n');
    console.log('='.repeat(80));
    
    // Vérifier que le fichier existe
    const jsonPath = path.join(jsonDirectory, jsonFileName);
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ Fichier non trouvé: ${jsonPath}`);
      console.log('\n📋 Fichiers JSON disponibles dans data/pdf-recipes:');
      const files = fs.readdirSync(jsonDirectory).filter(f => f.endsWith('.json'));
      files.forEach(f => console.log(`   - ${f}`));
      return;
    }
    
    console.log(`📄 Fichier: ${jsonFileName}`);
    console.log(`📁 Chemin: ${jsonPath}`);
    console.log(`📁 Sortie: ${path.join(outputDirectory, path.basename(jsonFileName, '.json') + '-recipes.js')}`);
    console.log('\n' + '='.repeat(80));
    console.log('🚀 Démarrage de l\'extraction...\n');
    
    const startTime = Date.now();
    
    // Extraire les recettes
    const result = await extractRecipesFromJSON(jsonPath);
    
    // Générer les fichiers de sortie
    const baseName = path.basename(jsonFileName, '.json');
    const jsContent = `// Recettes extraites de ${jsonFileName}\n\nexport const recipes = ${JSON.stringify(result.recipes, null, 2)};\n`;
    const jsonContent = JSON.stringify(result.recipes, null, 2);
    
    const jsPath = path.join(outputDirectory, `${baseName}-recipes.js`);
    const jsonPathOut = path.join(outputDirectory, `${baseName}-recipes.json`);
    
    fs.writeFileSync(jsPath, jsContent, 'utf8');
    fs.writeFileSync(jsonPathOut, jsonContent, 'utf8');
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ EXTRACTION TERMINÉE');
    console.log('='.repeat(80));
    console.log(`⏱️  Durée: ${duration}s`);
    console.log(`📝 Caractères extraits: ${fs.readFileSync(jsonPath, 'utf8').length}`);
    console.log(`🍽️  Recettes extraites: ${result.count}`);
    console.log(`\n🍽️  Liste des recettes extraites:`);
    result.recipes.forEach((recipe, index) => {
      console.log(`   ${index + 1}. ${recipe.name}`);
      console.log(`      - ${recipe.ingredients.length} ingrédient(s)`);
      console.log(`      - ${recipe.preparationSteps.length} étape(s)`);
    });
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    throw error;
  }
}

// Exécuter si appelé directement
const isMainModule = import.meta.url === `file://${path.resolve(process.argv[1])}` || 
                     import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || process.argv[1] && process.argv[1].includes('extract-single-json')) {
  const jsonFileName = process.argv[2];
  if (!jsonFileName) {
    console.error('❌ Usage: node extract-single-json.js <nom-du-fichier.json>');
    console.log('\n📋 Fichiers JSON disponibles dans data/pdf-recipes:');
    const files = fs.readdirSync(jsonDirectory).filter(f => f.endsWith('.json'));
    files.forEach(f => console.log(`   - ${f}`));
    process.exit(1);
  }
  
  extractSingleJSON(jsonFileName)
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

