// scripts/extract-recipes-from-docx.js
// Script pour extraire les recettes depuis un fichier DOCX
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mammoth from 'mammoth';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extraire le texte d'un fichier DOCX
 */
async function extractTextFromDOCX(docxPath) {
  try {
    console.log('📖 Extraction du texte depuis le DOCX...');
    
    const result = await mammoth.extractRawText({ path: docxPath });
    return result.value;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction du DOCX:', error);
    throw error;
  }
}

/**
 * Nettoyer le texte extrait
 */
function cleanText(text) {
  // Supprimer les espaces multiples
  text = text.replace(/\s+/g, ' ');
  
  // Corriger les espaces dans les mots (problème similaire aux PDFs)
  for (let i = 0; i < 5; i++) {
    text = text.replace(/([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])\s+([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])/gi, '$1$2');
  }
  
  // Nettoyer les espaces restants
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Parser les recettes depuis le texte (utiliser la même logique que pour EPUB)
 */
function parseRecipesFromText(text) {
  const recipes = [];
  
  // Le texte DOCX peut avoir des mots collés - chercher les patterns de recettes
  // Stratégie améliorée: 
  // 1. D'abord séparer le texte par sections
  // 2. Dans chaque section, chercher les recettes avec des patterns flexibles
  // 3. Détecter les recettes même si elles n'ont pas "Pour :" ou "Préparation :" directement après le titre
  
  // IMPORTANT: Le texte est collé, donc on doit chercher des patterns sans espaces
  
  // D'abord, séparer par sections pour mieux organiser
  const sections = text.split(/Section\s*:/i).filter(s => s.trim().length > 50);
  
  console.log(`📚 ${sections.length} sections détectées`);
  
  // Pattern flexible pour détecter les titres de recettes
  // Un titre de recette est généralement:
  // - 8+ caractères en majuscules
  // - Suivi de "(Pays)" ou directement de "Pour :", "Préparation :", "Ingrédients :", "Cuisson :"
  // - Ou suivi d'un nombre (pour X personnes)
  
  // Pattern flexible pour détecter les titres de recettes dans chaque section
  // Un titre de recette est généralement:
  // - 8+ caractères en majuscules
  // - Suivi de "(Pays)" ou directement de "Pour :", "Préparation :", "Ingrédients :", "Cuisson :"
  // - Ou suivi d'un nombre (pour X personnes)
  
  // Pattern principal: Titre en majuscules (6+ caractères) suivi de "(Pays)" puis "Pour :"
  const recipePattern1 = /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]{6,})\s*\([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ\s]+\)\s*Pour\s*:/g;
  
  // Pattern secondaire: Titre en majuscules suivi directement de "Pour" (texte collé)
  // Réduire à 6 caractères minimum pour capturer plus de recettes
  const recipePattern2 = /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]{6,})Pour\s*:/g;
  
  // Pattern tertiaire: Titre en majuscules suivi de "Préparation :"
  const recipePattern3 = /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]{6,})Préparation\s*:/g;
  
  // Pattern quaternaire: Titre en majuscules suivi de "Ingrédients :"
  const recipePattern4 = /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]{6,})Ingrédients\s*:/g;
  
  // Pattern quinaire: Titre en majuscules suivi de "Cuisson :"
  const recipePattern5 = /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]{6,})Cuisson\s*:/g;
  
  // Pattern sexenaire: Titre en majuscules suivi de "Accessoires" (certaines recettes ont "Accessoiresutilisés :")
  const recipePattern6 = /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]{6,})Accessoires\s*:/g;
  
  // Pattern septenaire: Titre en majuscules suivi directement d'un nombre (pour X personnes, sans "Pour :")
  // Exemple: "SOUPEDEPOMMESDETERREPour : 4" ou "RECETTE 4 personnes"
  const recipePattern7 = /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]{6,})(?:\([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ\s]+\))?(?:Pour|Préparation|Ingrédients|Cuisson|Accessoires)\s*:\s*\d+/g;
  
  let match;
  const recipeStarts = [];
  const seenIndices = new Set();
  
  // Chercher dans tout le texte avec tous les patterns
  const allPatterns = [recipePattern1, recipePattern2, recipePattern3, recipePattern4, recipePattern5, recipePattern6, recipePattern7];
  
  // Liste des mots-clés à exclure (faux positifs) - seulement les plus évidents
  const excludedKeywords = new Set([
    'SECTION', 'SUITE', 'RECETTES', 'COMPLÈTES', 'EXTRAITES', 'MONDE', 'ENTIER', 
    'ENTRÉES', 'SALADES', 'SOUPES', 'PIZZAS', 'PÂTES', 'GNOCCCHIS', 'NOUILLES', 
    'POISSONS', 'VIANDES', 'VOLAILLES', 'LÉGUMES', 'DESSERTS', 'PÂTISSERIES'
  ]);
  
  // Liste des patterns de faux positifs (phrases complètes qui ne sont pas des titres)
  const excludedPatterns = [
    /^CHELIQUIDE$/i,
    /^PASSEZLESPETITSPOISETLEURLIQUIDEDE$/i,
    /^SAUPOUDRZLESOIGNONSDEFARINEETPOURSUIVEZLA$/i,
    /^HDETREMPAGEPOURLESHARICOTSSECS$/i,
    /^RENCEFERMES$/i,
    /^PLUSUNTRAIT$/i,
    /^YLESHARICOTS$/i,
    /^POURSUIVEZLA$/i,
    /^MINUTESAVANTLAFINDELLA$/i,
    /^TESSOIENTALDENTE$/i,
    /^TERLEBATTEURSURSOCLEUNEOUDEUXFOIS$/i,
    /^MLDESAUCE$/i,
    /^MELIQUIDE$/i,
    /^INCORPOREZPROGRESSIVEMENTLELAITETPOURSUIVEZLA$/i,
    /^FEUILLEDELAURIER$/i,
    /^PARATIONDEBASE$/i,
    /^REMENTDANSLAFARINE$/i
  ];
  
  for (const pattern of allPatterns) {
    // Réinitialiser le lastIndex pour chaque pattern
    pattern.lastIndex = 0;
    while ((match = pattern.exec(text)) !== null) {
      // Vérifier que ce n'est pas un faux positif
      const beforeMatch = text.substring(Math.max(0, match.index - 50), match.index);
      const title = match[1].toUpperCase();
      
      // Ignorer les titres qui sont des mots-clés ou trop courts
      if (title.length < 6) continue;
      
      // Ignorer les titres qui sont dans la liste d'exclusion
      if (excludedKeywords.has(title)) {
        continue;
      }
      
      // Ignorer les titres qui correspondent aux patterns de faux positifs
      if (excludedPatterns.some(pattern => pattern.test(title))) {
        continue;
      }
      
      // Ignorer les titres qui commencent par un mot-clé exclu (mais pas s'ils sont plus longs)
      if (title.length < 15 && Array.from(excludedKeywords).some(kw => title.startsWith(kw))) {
        continue;
      }
      
      // Ignorer si précédé de "minutes", "heures", "secondes", "Suite", "Section"
      const beforeContext = beforeMatch.toLowerCase();
      if (beforeContext.match(/\d+\s*(minutes|heures|secondes)\s*$/i) || 
          beforeContext.match(/suite\s*$/i) || 
          beforeContext.match(/section\s*:\s*$/i)) {
        continue;
      }
      
      // Ignorer les titres qui se terminent par des mots-clés de mesure (comme "minutesCuisson")
      // Mais seulement si le titre est court (moins de 10 caractères)
      if (title.length < 10 && title.match(/(MINUTES|HEURES|SECONDES|ML|G|KG|CL|DL|L|CUIL|CUILLÈRE|TASSE|VERRE|PERSONNES|BRANCHES|FEUILLES|GOUSSES|TRANCHES|ŒUFS|PIÈCES|CHAMEL|RATION|DETREMPAGE|POUR|H|MIN|ACCESSOIRES|UTILISÉS)$/i)) {
        continue;
      }
      
      // Ignorer les titres qui commencent par des mots-clés de mesure (comme "mldesauceCuisson")
      // Mais seulement si le titre est court
      if (title.length < 15 && title.match(/^(ML|G|KG|CL|DL|L|CUIL|CUILLÈRE|TASSE|VERRE|PERSONNES|BRANCHES|FEUILLES|GOUSSES|TRANCHES|ŒUFS|PIÈCES|CHAMEL|RATION|DETREMPAGE|POUR|H|MIN|ACCESSOIRES|UTILISÉS)/i)) {
        continue;
      }
      
      // Vérifier que le titre a au moins 8 caractères (pour éviter les faux positifs courts)
      if (title.length < 8) {
        // Si le titre est court, vérifier qu'il n'est pas un mot-clé
        if (title.match(/^(ML|G|KG|CL|DL|L|CUIL|CUILLÈRE|TASSE|VERRE|PERSONNES|BRANCHES|FEUILLES|GOUSSES|TRANCHES|ŒUFS|PIÈCES|CHAMEL|RATION|DETREMPAGE|POUR|H|MIN|ACCESSOIRES|UTILISÉS|MINUTES|HEURES|SECONDES)/i)) {
          continue;
        }
      }
      
      if (!seenIndices.has(match.index)) {
        recipeStarts.push({
          index: match.index,
          title: match[1] // Garder le titre original (pas en majuscules)
        });
        seenIndices.add(match.index);
      }
    }
  }
  
  // Trier par index
  recipeStarts.sort((a, b) => a.index - b.index);
  
  console.log(`🔍 ${recipeStarts.length} débuts de recettes détectés`);
  
  // Si on a trouvé des recettes, les traiter
  if (recipeStarts.length > 0) {
    console.log(`📝 Traitement de ${recipeStarts.length} recettes...`);
    for (let i = 0; i < recipeStarts.length; i++) {
      if (i % 10 === 0) {
        console.log(`   Traitement de la recette ${i + 1}/${recipeStarts.length}...`);
      }
      
      const start = recipeStarts[i];
      const end = i < recipeStarts.length - 1 ? recipeStarts[i + 1].index : text.length;
      const section = text.substring(start.index, end);
      
      // Ignorer les sections trop courtes
      if (section.length < 100) continue;
      
      // Nettoyer le titre (séparer les mots collés si possible)
      let recipeName = start.title;
      // Essayer de séparer les mots collés en majuscules
      recipeName = recipeName.replace(/([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ])([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])/g, '$1 $2');
      recipeName = recipeName.replace(/([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ])/g, '$1 $2');
      
      const recipe = {
        name: recipeName.trim(),
        ingredients: [],
        preparationSteps: [],
        category: 'plat',
        preparationTime: 0,
        cookingTime: 0,
        servings: 4
      };
    
      // Extraire les métadonnées
      const sectionText = section.toLowerCase();
    const prepMatch = sectionText.match(/préparation\s*[:•]\s*(\d+)\s*(h|min|minutes?)/i);
    if (prepMatch) {
      recipe.preparationTime = prepMatch[2] === 'h' ? parseInt(prepMatch[1]) * 60 : parseInt(prepMatch[1]);
    }
    
    const cookMatch = sectionText.match(/cuisson\s*[:•]\s*(\d+)\s*(h|min|minutes?)/i);
    if (cookMatch) {
      recipe.cookingTime = cookMatch[2] === 'h' ? parseInt(cookMatch[1]) * 60 : parseInt(cookMatch[1]);
    }
    
    const servingsMatch = sectionText.match(/pour\s+(\d+)\s+personnes?/i);
    if (servingsMatch) {
      recipe.servings = parseInt(servingsMatch[1]);
    }
    
    // Extraire les ingrédients
    const ingredientPattern = /(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|cl|dl|cuil\.?\s*à\s*(?:soupe|café|thé)|cuillère|tasse|verre|personnes?|branches?|feuilles?|gousses?|tranches?|œufs?|pièces?)\s*(?:de\s+)?([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]+)/gi;
    let ingredientMatch;
    const seenIngredients = new Set();
    
    while ((ingredientMatch = ingredientPattern.exec(section)) !== null) {
      const key = `${ingredientMatch[1]}-${ingredientMatch[2]}-${ingredientMatch[3]}`;
      if (seenIngredients.has(key)) continue;
      seenIngredients.add(key);
      
      let ingName = ingredientMatch[3].trim();
      
      // Nettoyer le nom de l'ingrédient
      ingName = ingName.replace(/\s+/g, ' ').trim();
      
      if (ingName.length > 2 && ingName.length < 100) {
        recipe.ingredients.push({
          name: ingName,
          quantity: parseFloat(ingredientMatch[1].replace(',', '.')),
          unit: ingredientMatch[2].trim()
        });
      }
    }
    
    // Extraire les instructions
    const instructionPattern = /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]*(?:faire|mélanger|ajouter|cuire|chauffer|dorer|verser|retirer|ajoutez|faites|mélangez|coupez|épluchez|hachez|déposez|placez|mettez|servez|préparez|mettre|mettre|réserver|réservez|égoutter|égouttez|mijoter|laisser|laissez)[a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s,;:()•\d°Cth\.-]{20,300}[\.!])/gi;
    let instructionMatch;
    const seenInstructions = new Set();
    
    while ((instructionMatch = instructionPattern.exec(section)) !== null) {
      if (seenInstructions.has(instructionMatch[1])) continue;
      seenInstructions.add(instructionMatch[1]);
      
      let instruction = instructionMatch[1].trim();
      if (instruction.length > 15 && instruction.length < 500) {
        recipe.preparationSteps.push(instruction);
      }
    }
    
      // Si on a au moins des ingrédients ou des instructions, ajouter la recette
      if (recipe.ingredients.length > 0 || recipe.preparationSteps.length > 0) {
        recipes.push(recipe);
      }
    }
    
    return recipes;
  }
  
  // Si aucune recette trouvée avec le pattern, essayer une approche différente
  // Séparer par des lignes vides ou des patterns de recettes
  const simpleSections = text.split(/\n\s*\n/).filter(s => s.trim().length > 50);
  
  for (const section of simpleSections) {
    // Ignorer les sections de publicité ou d'introduction
    if (section.match(/sommaire|table des matières|introduction|préface|recettes complètes extraites/i)) {
      continue;
    }
    
    // Chercher les titres de recettes
    const lines = section.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 3) continue; // Ignorer les sections trop courtes
    
    // Détecter le titre (première ligne significative en majuscules)
    let recipeName = null;
    let startIndex = 0;
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Titre de recette: ligne en majuscules ou avec format spécifique
      if (line.length > 8 && line.length < 100 &&
          (line.match(/^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ\s]{5,}$/) ||
           line.match(/^[A-Z][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-']{8,}$/)) &&
          !line.match(/^(Préparation|Cuisson|Pour|Ingrédients|Instructions|Étapes|Section|Accessoires)/i)) {
        recipeName = line;
        startIndex = i + 1;
        break;
      }
    }
    
    if (!recipeName) {
      // Si pas de titre détecté, prendre la première ligne comme titre
      recipeName = lines[0];
      startIndex = 1;
    }
    
    const recipe = {
      name: recipeName,
      ingredients: [],
      preparationSteps: [],
      category: 'plat',
      preparationTime: 0,
      cookingTime: 0,
      servings: 4
    };
    
    // Extraire les métadonnées
    const sectionText = section.toLowerCase();
    
    const prepMatch = sectionText.match(/préparation\s*[:•]\s*(\d+)\s*(h|min|minutes?)/i);
    if (prepMatch) {
      recipe.preparationTime = prepMatch[2] === 'h' ? parseInt(prepMatch[1]) * 60 : parseInt(prepMatch[1]);
    }
    
    const cookMatch = sectionText.match(/cuisson\s*[:•]\s*(\d+)\s*(h|min|minutes?)/i);
    if (cookMatch) {
      recipe.cookingTime = cookMatch[2] === 'h' ? parseInt(cookMatch[1]) * 60 : parseInt(cookMatch[1]);
    }
    
    const servingsMatch = sectionText.match(/pour\s+(\d+)\s+personnes?/i);
    if (servingsMatch) {
      recipe.servings = parseInt(servingsMatch[1]);
    }
    
    // Extraire les ingrédients
    const ingredientPattern = /(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|cl|dl|cuil\.?\s*à\s*(?:soupe|café|thé)|cuillère|tasse|verre|personnes?|branches?|feuilles?|gousses?|tranches?|œufs?|pièces?)\s*(?:de\s+)?([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]+)/gi;
    let ingredientMatch;
    const seenIngredients = new Set();
    
    while ((ingredientMatch = ingredientPattern.exec(section)) !== null) {
      const key = `${ingredientMatch[1]}-${ingredientMatch[2]}-${ingredientMatch[3]}`;
      if (seenIngredients.has(key)) continue;
      seenIngredients.add(key);
      
      let ingName = ingredientMatch[3].trim();
      
      // Nettoyer le nom de l'ingrédient
      ingName = ingName.replace(/\s+/g, ' ').trim();
      
      if (ingName.length > 2 && ingName.length < 100) {
        recipe.ingredients.push({
          name: ingName,
          quantity: parseFloat(ingredientMatch[1].replace(',', '.')),
          unit: ingredientMatch[2].trim()
        });
      }
    }
    
    // Extraire les instructions
    const instructionPattern = /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]*(?:faire|mélanger|ajouter|cuire|chauffer|dorer|verser|retirer|ajoutez|faites|mélangez|coupez|épluchez|hachez|déposez|placez|mettez|servez|préparez|mettre|mettre|réserver|réservez|égoutter|égouttez|mijoter|laisser|laissez)[a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s,;:()•\d°Cth\.-]{20,300}[\.!])/gi;
    let instructionMatch;
    const seenInstructions = new Set();
    
    while ((instructionMatch = instructionPattern.exec(section)) !== null) {
      if (seenInstructions.has(instructionMatch[1])) continue;
      seenInstructions.add(instructionMatch[1]);
      
      let instruction = instructionMatch[1].trim();
      if (instruction.length > 15 && instruction.length < 500) {
        recipe.preparationSteps.push(instruction);
      }
    }
    
    // Si on a au moins des ingrédients ou des instructions, ajouter la recette
    if (recipe.ingredients.length > 0 || recipe.preparationSteps.length > 0) {
      recipes.push(recipe);
    }
  }
  
  return recipes;
}

/**
 * Fonction principale pour extraire les recettes d'un DOCX
 */
async function extractRecipesFromDOCX(docxPath, outputPath = null) {
  try {
    console.log('📚 Extraction des recettes depuis le DOCX...');
    console.log(`   Fichier: ${docxPath}`);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(docxPath)) {
      throw new Error(`Le fichier DOCX n'existe pas: ${docxPath}`);
    }
    
    // Extraire le texte
    console.log('\n📖 Extraction du texte...');
    let text = await extractTextFromDOCX(docxPath);
    const originalLength = text.length;
    console.log(`✅ ${originalLength} caractères extraits`);
    
    // Nettoyer le texte
    text = cleanText(text);
    console.log(`🧹 Texte nettoyé: ${originalLength} → ${text.length} caractères`);
    
    // Sauvegarder le texte pour analyse
    if (outputPath) {
      const debugDir = path.dirname(outputPath);
      if (!fs.existsSync(debugDir)) {
        fs.mkdirSync(debugDir, { recursive: true });
      }
      const textFile = path.join(debugDir, 'docx-extracted-text.txt');
      fs.writeFileSync(textFile, text.substring(0, 100000), 'utf8');
      console.log(`💾 Texte extrait sauvegardé: ${textFile}`);
    }
    
    // Parser les recettes
    console.log('\n🔍 Parsing des recettes...');
    const recipes = parseRecipesFromText(text);
    console.log(`✅ ${recipes.length} recette(s) trouvée(s)`);
    
    return {
      text: text,
      length: text.length,
      recipes: recipes
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    throw error;
  }
}

// Export par défaut
export default extractRecipesFromDOCX;

// Si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const docxPath = process.argv[2];
  if (!docxPath) {
    console.log('Usage: node scripts/extract-recipes-from-docx.js <chemin-vers-fichier.docx>');
    process.exit(1);
  }
  
  const docxName = path.basename(docxPath, '.docx');
  const outputPath = path.join(__dirname, '..', 'data', 'pdf-recipes', `${docxName}-recipes.js`);
  
  extractRecipesFromDOCX(docxPath, outputPath)
    .then(result => {
      console.log('\n✅ Extraction terminée!');
      console.log(`📊 ${result.length} caractères extraits`);
      console.log(`📝 ${result.recipes.length} recette(s) trouvée(s)`);
    })
    .catch(error => {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    });
}

