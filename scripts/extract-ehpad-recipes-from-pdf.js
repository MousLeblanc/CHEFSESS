// scripts/extract-ehpad-recipes-from-pdf.js
// Script spécialisé pour extraire les recettes EHPAD depuis le PDF
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parser spécialisé pour les recettes EHPAD
 */
function parseEHPADRecipes(text) {
  const recipes = [];
  
  // Corriger l'encodage
  text = text.replace(/Ã©/g, 'é').replace(/Ã¨/g, 'è').replace(/Ãª/g, 'ê')
             .replace(/Ã /g, 'à').replace(/Ã§/g, 'ç').replace(/Ã´/g, 'ô')
             .replace(/Ã®/g, 'î').replace(/Ã¯/g, 'ï').replace(/Ã»/g, 'û')
             .replace(/Ã¼/g, 'ü').replace(/Ã‰/g, 'É').replace(/Ã€/g, 'À')
             .replace(/â€™/g, "'").replace(/â€"/g, '"')
             .replace(/â€"/g, '"').replace(/â€"/g, '—').replace(/â€"/g, '–')
             .replace(/Å'/g, 'Œ').replace(/Å"/g, 'œ');
  
  // Diviser par "Recette de" ou "Recettede" (sans espace)
  const recipeSections = text.split(/(?=Recettede|Recette de)/i);
  
  console.log(`📚 ${recipeSections.length} sections détectées`);
  
  for (const section of recipeSections) {
    if (section.trim().length < 100) continue; // Ignorer les sections trop courtes
    
    const recipe = {
      name: '',
      ingredients: [],
      preparationSteps: [],
      category: 'plat',
      establishment: '',
      creator: '',
      family: '',
      texture: 'normale',
      servings: 10, // Par défaut pour EHPAD
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
      tags: ['#ehpad']
    };
    
    // Extraire le nom de l'établissement
    const establishmentMatch = section.match(/Recette de\s*\(['"]?établissement\)\s*:\s*([^\n]+)/i);
    if (establishmentMatch) {
      recipe.establishment = establishmentMatch[1].trim();
    }
    
    // Extraire le créateur
    const creatorMatch = section.match(/Une création de\s*\(nom\)\s*:\s*([^\n]+)/i);
    if (creatorMatch) {
      recipe.creator = creatorMatch[1].trim();
    }
    
    // Extraire la famille (catégorie)
    const familyMatch = section.match(/Famille\s*:\s*([^\n]+)/i);
    if (familyMatch) {
      recipe.family = familyMatch[1].trim().toLowerCase();
      // Mapper la famille à une catégorie
      if (recipe.family.includes('dessert')) {
        recipe.category = 'dessert';
      } else if (recipe.family.includes('soupe') || recipe.family.includes('potage')) {
        recipe.category = 'soupe';
      } else if (recipe.family.includes('viande') || recipe.family.includes('œuf')) {
        recipe.category = 'plat';
      } else {
        recipe.category = 'plat';
      }
    }
    
    // Extraire le nom de la recette
    const nameMatch = section.match(/Nomdelarecette\s*:\s*([^\n]+)/i) || 
                     section.match(/Nom de la recette\s*:\s*([^\n]+)/i);
    if (nameMatch) {
      recipe.name = nameMatch[1].trim();
      // Nettoyer le nom (supprimer les espaces collés)
      recipe.name = recipe.name.replace(/([a-z])([A-Z])/g, '$1 $2');
    }
    
    // Si pas de nom, essayer de trouver un titre au début
    if (!recipe.name || recipe.name.length < 3) {
      const lines = section.split('\n').slice(0, 10);
      for (const line of lines) {
        if (line.length > 10 && line.length < 100 && 
            !line.match(/Recette|Famille|Ingrédients|Quantité/i)) {
          recipe.name = line.trim();
          break;
        }
      }
    }
    
    // Extraire les ingrédients (format tableau)
    const ingredientsSection = section.match(/Ingrédients[\s\S]*?(?=Poids|Traitement|Pour 10|Elément|Cetterecette)/i);
    if (ingredientsSection) {
      const ingText = ingredientsSection[0];
      // Pattern pour capturer les ingrédients : "NOM 200 gr" ou "NOM 200gr"
      const ingredientPattern = /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸa-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]+?)\s+(\d+(?:[.,]\d+)?)\s*(gr|kg|ml|l|cl|dl|litre|litres|unité|unités|feuille|feuilles|goutte|gouttes|cuillère|cuillères|sachet|sachets|pièce|pièces|cl|ml|g|kg)/gi;
      
      let match;
      while ((match = ingredientPattern.exec(ingText)) !== null) {
        const name = match[1].trim();
        const quantity = parseFloat(match[2].replace(',', '.'));
        const unit = match[3].trim().toLowerCase();
        
        if (name.length > 2 && name.length < 100 && quantity > 0) {
          recipe.ingredients.push({
            name: name,
            quantity: quantity,
            unit: unit
          });
        }
      }
    }
    
    // Extraire les instructions
    const instructionsMatch = section.match(/Traitement, progression de l'élaboration\s*:([\s\S]*?)(?=Préconisations|Ustensiles|Intérêt|Pour 10|Elément|Cetterecette)/i);
    if (instructionsMatch) {
      const instructionsText = instructionsMatch[1];
      // Séparer par points, majuscules, ou retours à la ligne
      const steps = instructionsText
        .split(/(?<=[.!])\s+(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ])|(?<=\n)(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ])/)
        .map(s => s.trim())
        .filter(s => s.length > 10 && s.length < 500);
      
      recipe.preparationSteps = steps;
    }
    
    // Extraire les informations nutritionnelles
    const nutritionMatch = section.match(/Protides\s*\(gr\.\)\s*([\d.,]+)[\s\S]*?Lipides\s*\(gr\.\)\s*([\d.,]+)[\s\S]*?Glucides\s*\(gr\.\)\s*([\d.,]+)[\s\S]*?Kcalories\s*([\d.,]+)/i);
    if (nutritionMatch) {
      recipe.nutrition.proteins = parseFloat(nutritionMatch[1].replace(',', '.')) || 0;
      recipe.nutrition.lipids = parseFloat(nutritionMatch[2].replace(',', '.')) || 0;
      recipe.nutrition.carbs = parseFloat(nutritionMatch[3].replace(',', '.')) || 0;
      recipe.nutrition.calories = parseFloat(nutritionMatch[4].replace(',', '.')) || 0;
    }
    
    // Extraire le sodium
    const sodiumMatch = section.match(/Sodium\s*\(gr\.\)\s*([\d.,]+)/i);
    if (sodiumMatch) {
      recipe.nutrition.sodium = parseFloat(sodiumMatch[1].replace(',', '.')) || 0;
    }
    
    // Détecter les textures
    const textureMatch = section.match(/Le\s*(haché|mouliné|mixé|lissé)/i);
    if (textureMatch) {
      const texture = textureMatch[1].toLowerCase();
      if (texture === 'haché') recipe.texture = 'hachée';
      else if (texture === 'mouliné') recipe.texture = 'moulinée';
      else if (texture === 'mixé') recipe.texture = 'mixée';
      else if (texture === 'lissé') recipe.texture = 'lisse';
      recipe.tags.push(`#${recipe.texture}`);
    }
    
    // Détecter les allergènes basiques
    const allText = `${recipe.name} ${recipe.ingredients.map(i => i.name).join(' ')}`.toLowerCase();
    if (allText.includes('lait') || allText.includes('crème') || allText.includes('fromage')) {
      recipe.allergens.push('lactose');
    }
    if (allText.includes('œuf') || allText.includes('oeuf') || allText.includes('blanc')) {
      recipe.allergens.push('oeufs');
    }
    if (allText.includes('farine') || allText.includes('semoule') || allText.includes('blé')) {
      recipe.allergens.push('gluten');
    }
    
    // Ajouter la recette si elle a un nom et des ingrédients
    if (recipe.name && recipe.name.length > 3 && recipe.ingredients.length > 0) {
      recipes.push(recipe);
    }
  }
  
  return recipes;
}

/**
 * Fonction principale
 */
async function extractEHPADRecipes(pdfPath, outputPath = null) {
  try {
    console.log('📄 Extraction des recettes EHPAD depuis le PDF...');
    console.log(`   Fichier: ${pdfPath}`);
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Le fichier PDF n'existe pas: ${pdfPath}`);
    }
    
    // Utiliser la fonction d'extraction de texte existante
    console.log('\n📖 Extraction du texte...');
    
    // Copier la logique d'extraction du script existant
    const require = createRequire(import.meta.url);
    let pdfParseModule;
    
    try {
      pdfParseModule = require('pdf-parse');
    } catch (e) {
      throw new Error('pdf-parse n\'est pas installé. Exécutez: npm install pdf-parse');
    }
    
    const dataBuffer = fs.readFileSync(pdfPath);
    let data;
    
    // Essayer différentes façons d'appeler pdf-parse
    try {
      if (typeof pdfParseModule === 'function') {
        data = await pdfParseModule(dataBuffer);
      } else if (pdfParseModule.default) {
        if (typeof pdfParseModule.default === 'function') {
          data = await pdfParseModule.default(dataBuffer);
        } else {
          // C'est peut-être une classe
          data = await new pdfParseModule.default(dataBuffer);
        }
      } else {
        // Essayer comme fonction
        data = await pdfParseModule(dataBuffer);
      }
    } catch (e) {
      // Si ça échoue, essayer avec new
      try {
        const PDFParse = pdfParseModule.default || pdfParseModule;
        data = await new PDFParse(dataBuffer);
      } catch (e2) {
        throw new Error(`Impossible d'utiliser pdf-parse: ${e.message}`);
      }
    }
    
    if (!data || !data.text) {
      throw new Error('Aucun texte extrait du PDF');
    }
    
    let text = data.text;
    console.log(`✅ ${text.length} caractères extraits`);
    
    // Parser les recettes EHPAD
    console.log('\n🔍 Parsing des recettes EHPAD...');
    const recipes = parseEHPADRecipes(text);
    console.log(`✅ ${recipes.length} recette(s) trouvée(s)`);
    
    // Afficher un résumé
    console.log('\n📊 RÉSUMÉ:');
    recipes.forEach((recipe, index) => {
      console.log(`   ${index + 1}. ${recipe.name}`);
      console.log(`      - ${recipe.ingredients.length} ingrédient(s)`);
      console.log(`      - ${recipe.preparationSteps.length} étape(s)`);
      console.log(`      - Texture: ${recipe.texture}`);
      console.log(`      - Catégorie: ${recipe.category}`);
    });
    
    // Générer le fichier de sortie
    if (!outputPath) {
      const pdfName = path.basename(pdfPath, '.pdf');
      outputPath = path.join(__dirname, '..', 'data', 'pdf-recipes', `${pdfName}-recipes.js`);
    }
    
    const jsonPath = outputPath.replace('.js', '.json');
    
    // Générer le fichier JavaScript
    const jsContent = `// Recettes EHPAD extraites de ${path.basename(pdfPath)}\n\nexport const recipes = ${JSON.stringify(recipes, null, 2)};\n`;
    fs.writeFileSync(outputPath, jsContent, 'utf8');
    console.log(`\n✅ Fichier JavaScript créé: ${outputPath}`);
    
    // Générer le fichier JSON
    fs.writeFileSync(jsonPath, JSON.stringify(recipes, null, 2), 'utf8');
    console.log(`✅ Fichier JSON créé: ${jsonPath}`);
    
    console.log('\n✅ Extraction terminée avec succès!');
    return recipes;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    throw error;
  }
}

// Exécution si appelé directement
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.includes('extract-ehpad-recipes-from-pdf');

if (isMainModule || process.argv[1]?.includes('extract-ehpad-recipes-from-pdf')) {
  const pdfPath = process.argv[2] || path.join(__dirname, '..', 'data', 'pdf-recipes', 'special ehpads.pdf');
  
  extractEHPADRecipes(pdfPath)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default extractEHPADRecipes;

