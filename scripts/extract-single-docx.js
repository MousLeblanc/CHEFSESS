// scripts/extract-single-docx.js
// Script pour extraire les recettes d'un seul DOCX avec retours détaillés
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import extractRecipesFromDOCX from './extract-recipes-from-docx.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const docxDirectory = path.join(__dirname, '..', 'data', 'pdf-recipes');
const outputDirectory = path.join(__dirname, '..', 'data', 'pdf-recipes');

// Importer les fonctions de normalisation depuis extract-recipes-from-epub.js
// On va utiliser une approche différente : créer un module partagé ou copier les fonctions
// Pour l'instant, créer une version simplifiée qui utilise les fonctions du module EPUB
let normalizationModule = null;

async function getNormalizationModule() {
  if (!normalizationModule) {
    // Lire le fichier extract-recipes-from-epub.js et extraire les fonctions nécessaires
    // Pour l'instant, on va créer une version simplifiée
    normalizationModule = {
      normalizeRecipe: function(recipe) {
        return {
          name: recipe.name || 'Recette sans nom',
          category: recipe.category || 'plat',
          ingredients: recipe.ingredients || [],
          preparationSteps: recipe.preparationSteps || [],
          preparationTime: recipe.preparationTime || 0,
          cookingTime: recipe.cookingTime || 0,
          totalTime: (recipe.preparationTime || 0) + (recipe.cookingTime || 0),
          servings: recipe.servings || 4,
          nutrition: {
            calories: 0,
            proteins: 0,
            carbs: 0,
            lipids: 0,
            fibers: 0,
            sodium: 0
          },
          allergens: [],
          dietaryRestrictions: [],
          textures: ['normale'],
          establishmentTypes: ['restaurant', 'cantine_scolaire'],
          tags: ['#plat']
        };
      }
    };
  }
  return normalizationModule;
}

async function generateOutputFiles(recipes, outputPath) {
  const chefSESRecipes = recipes.map(recipe => ({
    name: recipe.name,
    category: recipe.category,
    ingredients: recipe.ingredients,
    preparationSteps: recipe.preparationSteps,
    preparationTime: recipe.preparationTime,
    cookingTime: recipe.cookingTime,
    totalTime: recipe.totalTime,
    servings: recipe.servings,
    nutrition: recipe.nutrition,
    allergens: recipe.allergens,
    dietaryRestrictions: recipe.dietaryRestrictions,
    textures: recipe.textures,
    establishmentTypes: recipe.establishmentTypes,
    tags: recipe.tags
  }));
  
  // Générer le fichier JavaScript
  const fileContent = `/**
 * Recettes extraites d'un DOCX - Format Chef SES
 * Généré le: ${new Date().toISOString()}
 * Total de recettes: ${chefSESRecipes.length}
 * 
 * Format compatible avec le modèle RecipeEnriched de Chef SES
 */

export const extractedRecipes = ${JSON.stringify(chefSESRecipes, null, 2)};

// Export par défaut
export default extractedRecipes;

// Fonctions utilitaires
export function getRecipeByName(name) {
  return extractedRecipes.find(recipe => recipe.name === name);
}

export function getRecipesByCategory(category) {
  return extractedRecipes.filter(recipe => recipe.category === category);
}

export function getRecipesByTag(tag) {
  return extractedRecipes.filter(recipe => 
    recipe.tags && recipe.tags.includes(tag)
  );
}
`;
  
  // Créer le dossier de sortie s'il n'existe pas
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Écrire le fichier JavaScript
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`✅ Fichier JavaScript créé: ${outputPath}`);
  
  // Écrire le fichier JSON
  const jsonPath = outputPath.replace('.js', '.json');
  fs.writeFileSync(jsonPath, JSON.stringify(chefSESRecipes, null, 2), 'utf8');
  console.log(`✅ Fichier JSON créé: ${jsonPath}`);
}

async function extractSingleDOCX(docxFileName) {
  try {
    console.log('📚 Extraction d\'un seul DOCX\n');
    console.log('='.repeat(80));
    
    // Vérifier que le fichier existe
    const docxPath = path.join(docxDirectory, docxFileName);
    if (!fs.existsSync(docxPath)) {
      console.error(`❌ Fichier non trouvé: ${docxPath}`);
      console.log('\n📋 Fichiers DOCX disponibles:');
      const files = fs.readdirSync(docxDirectory).filter(f => f.endsWith('.docx') || f.endsWith('.doc'));
      if (files.length === 0) {
        console.log('   ❌ Aucun fichier DOCX trouvé');
      } else {
        files.forEach((f, i) => {
          console.log(`   ${i + 1}. ${f}`);
        });
      }
      process.exit(1);
    }
    
    console.log(`📄 Fichier: ${docxFileName}`);
    console.log(`📁 Chemin: ${docxPath}`);
    
    // Créer le dossier de sortie s'il n'existe pas
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
      console.log(`✅ Dossier de sortie créé: ${outputDirectory}`);
    }
    
    const docxName = path.basename(docxFileName, '.docx');
    const outputPath = path.join(outputDirectory, `${docxName}-recipes.js`);
    
    console.log(`📁 Sortie: ${outputPath}\n`);
    console.log('='.repeat(80));
    console.log('🚀 Démarrage de l\'extraction...\n');
    
    // Extraire les recettes
    const startTime = Date.now();
    const result = await extractRecipesFromDOCX(docxPath, outputPath);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Normaliser les recettes
    const normModule = await getNormalizationModule();
    const normalizedRecipes = result.recipes.map(recipe => normModule.normalizeRecipe(recipe));
    
    // Générer les fichiers de sortie
    if (normalizedRecipes.length > 0) {
      await generateOutputFiles(normalizedRecipes, outputPath);
    }
    
    // Résultats
    console.log('\n' + '='.repeat(80));
    console.log('✅ EXTRACTION TERMINÉE');
    console.log('='.repeat(80));
    console.log(`⏱️  Durée: ${duration}s`);
    console.log(`📊 Caractères extraits: ${result.length}`);
    console.log(`📝 Recettes extraites: ${normalizedRecipes.length}`);
    
    if (normalizedRecipes.length > 0) {
      console.log('\n📝 Liste des recettes extraites:');
      normalizedRecipes.forEach((recipe, i) => {
        console.log(`   ${i + 1}. ${recipe.name}`);
        console.log(`      - ${recipe.ingredients.length} ingrédient(s)`);
        console.log(`      - ${recipe.preparationSteps.length} étape(s)`);
        if (recipe.nutrition && recipe.nutrition.calories > 0) {
          console.log(`      - Calories: ${recipe.nutrition.calories} kcal/100g`);
        }
      });
    } else {
      console.log('\n⚠️  Aucune recette détectée dans ce DOCX');
      console.log('   Le texte a été extrait et sauvegardé pour analyse.');
      console.log('   Vérifiez le fichier texte extrait pour comprendre le format.');
    }
    
    console.log('\n' + '='.repeat(80));
    
    return normalizedRecipes;
    
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
const docxFileName = process.argv[2];

if (!docxFileName) {
  console.log('📚 Extraction de recettes depuis un DOCX\n');
  console.log('Usage: node scripts/extract-single-docx.js <nom-du-fichier.docx>');
  console.log('\nExemple:');
  console.log('  node scripts/extract-single-docx.js "recettes kitchen aid.docx"');
  console.log('\n📋 Fichiers DOCX disponibles dans data/pdf-recipes:');
  
  const files = fs.readdirSync(docxDirectory).filter(f => f.endsWith('.docx') || f.endsWith('.doc'));
  if (files.length === 0) {
    console.log('   ❌ Aucun fichier DOCX trouvé');
  } else {
    files.forEach((f, i) => {
      console.log(`   ${i + 1}. ${f}`);
    });
  }
  
  process.exit(1);
}

extractSingleDOCX(docxFileName)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

