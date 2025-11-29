// scripts/extract-recipes-from-pdf.js
// Script pour extraire des recettes d'un PDF et les formater en JavaScript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fonction pour extraire le texte d'un PDF
 * Nécessite pdf-parse ou pdfjs-dist
 */
async function extractTextFromPDF(pdfPath) {
  try {
    // Essayer d'utiliser pdf-parse si disponible (plus simple)
    try {
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      const pdfParseModule = require('pdf-parse');
      
      // pdf-parse peut être exporté différemment selon la version
      // Essayer différentes façons d'appeler la fonction
      const dataBuffer = fs.readFileSync(pdfPath);
      let data;
      
      if (typeof pdfParseModule === 'function') {
        data = await pdfParseModule(dataBuffer);
      } else if (pdfParseModule.default && typeof pdfParseModule.default === 'function') {
        data = await pdfParseModule.default(dataBuffer);
      } else if (pdfParseModule.PDFParse && typeof pdfParseModule.PDFParse === 'function') {
        data = await pdfParseModule.PDFParse(dataBuffer);
      } else {
        // Dernier recours : essayer d'appeler directement
        data = await pdfParseModule(dataBuffer);
      }
      
      if (!data || !data.text) {
        throw new Error('Aucun texte extrait du PDF');
      }
      
      return data.text;
    } catch (pdfParseError) {
      // pdf-parse non disponible ou erreur, essayer pdfjs-dist
      console.log('⚠️  pdf-parse non disponible, essai avec pdfjs-dist...');
      // Ne pas throw ici, continuer avec pdfjs-dist
    }
    
    // Fallback : utiliser pdfjs-dist
    try {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
      if (pdfjs) {
        const dataBuffer = fs.readFileSync(pdfPath);
        // Convertir Buffer en Uint8Array pour pdfjs-dist
        const uint8Array = new Uint8Array(dataBuffer);
        const loadingTask = pdfjs.getDocument({ data: uint8Array });
        const pdf = await loadingTask.promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        return fullText;
      }
    } catch (pdfjsError) {
      // pdfjs-dist non disponible ou erreur
    }
    
    throw new Error('Aucune bibliothèque PDF trouvée. Installez pdf-parse: npm install pdf-parse');
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction du PDF:', error);
    throw error;
  }
}

/**
 * Nettoyer le texte extrait du PDF (supprimer les espaces superflus dans les mots)
 * Cette fonction corrige les problèmes d'extraction PDF où les espaces sont insérés dans les mots
 */
function cleanPDFText(text) {
  if (!text || text.length === 0) return text;
  
  // Étape 1: Protéger les éléments importants avant nettoyage
  const protectedItems = [];
  const protectPatterns = [
    { pattern: /c\.\s*à\s*s\./gi, replacement: '__C_A_S__' },
    { pattern: /c\.\s*à\s*c\./gi, replacement: '__C_A_C__' },
    { pattern: /\d+\s*(g|kg|ml|l|cl|dl)/gi, replacement: (match) => {
      const placeholder = `__UNIT_${protectedItems.length}__`;
      protectedItems.push(match);
      return placeholder;
    }},
    { pattern: /(cuillère|cuillères|tasse|tasses|verre|verres|pièce|pièces)/gi, replacement: (match) => {
      const placeholder = `__UNIT_${protectedItems.length}__`;
      protectedItems.push(match);
      return placeholder;
    }}
  ];
  
  let placeholderIndex = 0;
  protectPatterns.forEach(({ pattern, replacement }) => {
    if (typeof replacement === 'string') {
      text = text.replace(pattern, replacement);
    } else {
      text = text.replace(pattern, replacement);
    }
  });
  
  // Étape 2: Supprimer les espaces multiples
  text = text.replace(/\s+/g, ' ');
  
  // Étape 3: Corriger les espaces dans les mots (problème principal)
  // Pattern: lettre minuscule espace lettre minuscule (dans un mot)
  // Répéter plusieurs fois pour corriger les mots avec plusieurs espaces
  for (let i = 0; i < 5; i++) {
    text = text.replace(/([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])\s+([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])/gi, '$1$2');
  }
  
  // Étape 4: Corriger les espaces avant les majuscules (début de mot)
  text = text.replace(/\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ])/g, ' $1');
  
  // Étape 5: Restaurer les éléments protégés
  text = text.replace(/__C_A_S__/g, 'c. à s.');
  text = text.replace(/__C_A_C__/g, 'c. à c.');
  protectedItems.forEach((value, index) => {
    text = text.replace(`__UNIT_${index}__`, value);
  });
  
  // Étape 6: Nettoyer les espaces restants
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Fonction pour parser les recettes depuis le texte extrait
 * Cette fonction doit être adaptée selon le format de votre PDF
 */
function parseRecipesFromText(text) {
  const recipes = [];
  
  // Nettoyer le texte d'abord
  text = cleanPDFText(text);
  
  // Corriger l'encodage (UTF-8 mal interprété)
  text = text.replace(/Ã©/g, 'é').replace(/Ã¨/g, 'è').replace(/Ãª/g, 'ê')
             .replace(/Ã /g, 'à').replace(/Ã§/g, 'ç').replace(/Ã´/g, 'ô')
             .replace(/Ã®/g, 'î').replace(/Ã¯/g, 'ï').replace(/Ã»/g, 'û')
             .replace(/Ã¼/g, 'ü').replace(/Ã‰/g, 'É').replace(/Ã€/g, 'À')
             .replace(/Ã /g, ' ').replace(/â€™/g, "'").replace(/â€"/g, '"')
             .replace(/â€"/g, '"').replace(/â€"/g, '—').replace(/â€"/g, '–');
  
  // Diviser le texte en lignes
  let lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Si le texte est très mal formaté (mots collés), essayer de le réparer
  // Chercher des patterns comme "Portion1Préparation" et les séparer
  lines = lines.map(line => {
    // Ajouter des espaces avant les mots-clés de recettes
    line = line.replace(/(Portion|Portions|Préparation|Cuisson|Ingrédients|Marinade|Sauce)(\d|[A-Z])/gi, '$1 $2');
    line = line.replace(/(\d)(Portion|Portions|Préparation|Cuisson|Ingrédients|Marinade|Sauce)/gi, '$1 $2');
    // Ajouter des espaces avant les nombres suivis de lettres
    line = line.replace(/(\d)([a-zA-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])/g, '$1 $2');
    // Ajouter des espaces après les unités
    line = line.replace(/(g|kg|ml|l|cl|dl|min|h)([a-zA-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])/gi, '$1 $2');
    return line;
  });
  
  let currentRecipe = null;
  let currentSection = null; // 'ingredients', 'instructions', 'nutrition'
  let previousLine = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    
    // Détecter le début d'une nouvelle recette
    // Patterns possibles : "RECETTE:", "1.", "Nom de la recette" (ligne en majuscules)
    if (isRecipeTitle(line)) {
      // Sauvegarder la recette précédente si elle existe
      if (currentRecipe && currentRecipe.name) {
        recipes.push(normalizeRecipe(currentRecipe));
      }
      
      // Créer une nouvelle recette
      currentRecipe = {
        name: cleanRecipeTitle(line),
        ingredients: [],
        preparationSteps: [],
        nutrition: {
          calories: 0,
          proteins: 0,
          carbs: 0,
          lipids: 0,
          fibers: 0,
          sodium: 0
        },
        category: 'plat',
        allergens: [],
        dietaryRestrictions: [],
        textures: ['normale'],
        establishmentTypes: ['restaurant', 'cantine_scolaire']
      };
      currentSection = null;
      continue;
    }
    
    // Détecter les sections
    if (line.match(/^(Ingrédients|Ingredient)/i)) {
      currentSection = 'ingredients';
      previousLine = line;
      continue;
    }
    
    if (line.match(/^(Préparation|Instruction|Étapes|Etape)/i) && !line.match(/^(Préparation|Cuisson)\s+\d+/i)) {
      // Ne pas confondre avec "Préparation 5 min"
      currentSection = 'instructions';
      previousLine = line;
      continue;
    }
    
    if (line.toLowerCase().includes('nutrition') || line.toLowerCase().includes('valeur nutritive') ||
        line.toLowerCase().includes('calories') || line.toLowerCase().includes('protéine')) {
      currentSection = 'nutrition';
      continue;
    }
    
    // Parser les ingrédients
    if (currentSection === 'ingredients' && currentRecipe) {
      const ingredient = parseIngredient(line);
      if (ingredient) {
        currentRecipe.ingredients.push(ingredient);
      }
    } else if (!currentSection && currentRecipe && currentRecipe.ingredients.length === 0) {
      // Si pas de section définie mais qu'on a une recette, essayer de détecter automatiquement
      // Si la ligne contient une quantité, c'est probablement un ingrédient
      if (line.match(/\d+\s*(g|kg|ml|l|cl|dl|c\.?\s*à\s*s|c\.?\s*à\s*c|cuillère|tasse|verre|pièce)/i)) {
        const ingredient = parseIngredient(line);
        if (ingredient) {
          currentRecipe.ingredients.push(ingredient);
          currentSection = 'ingredients'; // Définir la section automatiquement
        }
      }
    }
    
    // Parser les instructions
    if (currentSection === 'instructions' && currentRecipe) {
      if (line.match(/^\d+[\.\)]/) || (line.length > 20 && line.match(/(coupez|faites|mélangez|ajoutez|versez|chauffez|cuisez|salez|poivrez|préchauffez)/i))) {
        currentRecipe.preparationSteps.push(cleanInstruction(line));
      }
    } else if (currentSection === 'ingredients' && currentRecipe && currentRecipe.ingredients.length > 0) {
      // Si on était dans les ingrédients et qu'on trouve une instruction, passer aux instructions
      if (line.match(/(coupez|faites|mélangez|ajoutez|versez|chauffez|cuisez|salez|poivrez|préchauffez)/i) && line.length > 15) {
        currentSection = 'instructions';
        currentRecipe.preparationSteps.push(cleanInstruction(line));
      }
    }
    
    // Parser la nutrition
    if (currentSection === 'nutrition' && currentRecipe) {
      parseNutrition(line, currentRecipe.nutrition);
    }
    
    // Sauvegarder la ligne actuelle pour la prochaine itération
    previousLine = line;
  }
  
  // Ajouter la dernière recette
  if (currentRecipe && currentRecipe.name) {
    recipes.push(normalizeRecipe(currentRecipe));
  }
  
  return recipes;
}

/**
 * Détecter si une ligne est un titre de recette
 */
function isRecipeTitle(line) {
  // Ignorer les lignes trop courtes ou trop longues
  if (line.length < 5 || line.length > 150) return false;
  
  // Ignorer les lignes qui sont clairement des en-têtes ou du contenu
  const ignorePatterns = [
    /^(TABLE|INDEX|SOMMAIRE|CONTENU|PAGE|OCEANOFPDF|OceanofPDF)/i,
    /^\d+\s*$/,
    /^[A-Z\s]{2,5}$/, // Trop court pour être un titre
    /^(mode|emploi|conseil|astuce|ingrédient|préparation|instruction|portion|cuisson|réfrigération|macération)/i,
    /^(Portion|Préparation|Cuisson|Ingrédients|Marinade|Sauce)/i, // Sections de recette
    /^(Donne|Préparation|Cuisson|Refroidissement|Repos|Infusion|Trempage|Levée|Réfrigération|Macération)/i
  ];
  
  if (ignorePatterns.some(pattern => pattern.test(line))) return false;
  
  // Patterns pour détecter un titre de recette
  const patterns = [
    /^RECETTE\s*[:\.]?\s*/i,
    /^\d+[\.\)]\s+[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]/,
    /^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s\-']{8,120}$/, // Titre avec majuscule initiale
    /^[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ\s]{8,120}$/, // Titre en majuscules
    // Pattern pour détecter les titres qui précèdent "Portion" ou "Préparation"
    /^[A-Z][a-zA-Z\s\-']{10,100}$/ // Titre général
  ];
  
  return patterns.some(pattern => pattern.test(line));
}

/**
 * Détecter le début d'une recette (pattern: "Portion", "Préparation", etc.)
 */
function isRecipeStart(line) {
  return /^(Portion|Portions|Préparation|Cuisson|Ingrédients|Marinade|Sauce)/i.test(line);
}

/**
 * Nettoyer le titre de la recette
 */
function cleanRecipeTitle(line) {
  return line
    .replace(/^RECETTE\s*[:\.]?\s*/i, '')
    .replace(/^\d+[\.\)]\s*/, '')
    .trim();
}

/**
 * Parser un ingrédient depuis une ligne
 */
function parseIngredient(line) {
  // Patterns possibles :
  // - "200g de farine"
  // - "Farine: 200g"
  // - "2 cuillères à soupe d'huile"
  // - "- 200g farine"
  
  const patterns = [
    /^[-•]\s*(.+)/, // Liste à puces
    /^(.+?):\s*(.+)/, // "Nom: quantité"
    /^(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|cl|dl|c\.?\s*à\s*s|c\.?\s*à\s*c|pièce|pièces|tranche|tranches)\s+(?:de\s+)?(.+)/i,
    /^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|cl|dl|c\.?\s*à\s*s|c\.?\s*à\s*c|pièce|pièces|tranche|tranches)/i
  ];
  
  for (const pattern of patterns) {
    const match = line.match(pattern);
    if (match) {
      let name, quantity, unit;
      
      if (pattern === patterns[0]) {
        // Liste à puces
        const parts = match[1].split(/\s+/);
        if (parts.length >= 2) {
          quantity = parseFloat(parts[0].replace(',', '.'));
          unit = parts[1];
          name = parts.slice(2).join(' ');
        } else {
          name = match[1];
          quantity = 1;
          unit = 'unité';
        }
      } else if (pattern === patterns[1]) {
        // "Nom: quantité"
        name = match[1].trim();
        const qtyMatch = match[2].match(/(\d+(?:[.,]\d+)?)\s*(.+)/);
        if (qtyMatch) {
          quantity = parseFloat(qtyMatch[1].replace(',', '.'));
          unit = qtyMatch[2].trim();
        } else {
          quantity = 1;
          unit = 'unité';
        }
      } else if (pattern === patterns[2] || pattern === patterns[3]) {
        // Format standard
        quantity = parseFloat(match[1].replace(',', '.'));
        unit = match[2].trim();
        name = match[3] ? match[3].trim() : match[1].trim();
      }
      
      if (name && name.length > 0) {
        return {
          name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
          quantity: quantity || 1,
          unit: unit || 'unité'
        };
      }
    }
  }
  
  // Fallback : prendre toute la ligne comme nom
  if (line.length > 2 && line.length < 100) {
    return {
      name: line,
      quantity: 1,
      unit: 'unité'
    };
  }
  
  return null;
}

/**
 * Nettoyer une instruction
 */
function cleanInstruction(line) {
  return line
    .replace(/^\d+[\.\)]\s*/, '')
    .replace(/^[-•]\s*/, '')
    .trim();
}

/**
 * Parser les informations nutritionnelles
 */
function parseNutrition(line, nutrition) {
  const patterns = [
    /calories?[:\s]+(\d+)/i,
    /protéines?[:\s]+(\d+(?:[.,]\d+)?)\s*(g|mg)/i,
    /glucides?[:\s]+(\d+(?:[.,]\d+)?)\s*(g|mg)/i,
    /lipides?[:\s]+(\d+(?:[.,]\d+)?)\s*(g|mg)/i,
    /fibres?[:\s]+(\d+(?:[.,]\d+)?)\s*(g|mg)/i,
    /sodium[:\s]+(\d+(?:[.,]\d+)?)\s*(g|mg)/i
  ];
  
  patterns.forEach((pattern, index) => {
    const match = line.match(pattern);
    if (match) {
      const value = parseFloat(match[1].replace(',', '.'));
      const unit = match[2] || 'g';
      const multiplier = unit.toLowerCase() === 'mg' ? 0.001 : 1;
      
      switch (index) {
        case 0: nutrition.calories = value; break;
        case 1: nutrition.proteins = value * multiplier; break;
        case 2: nutrition.carbs = value * multiplier; break;
        case 3: nutrition.lipids = value * multiplier; break;
        case 4: nutrition.fibers = value * multiplier; break;
        case 5: nutrition.sodium = value * multiplier; break;
      }
    }
  });
}

/**
 * Générer des tags compatibles Chef SES basés sur la recette (format #tag)
 */
function generateChefSESTags(recipe) {
  const tags = [];
  
  // Tags basés sur la catégorie
  if (recipe.category === 'soupe') tags.push('#soupe');
  if (recipe.category === 'entrée') tags.push('#entrée');
  if (recipe.category === 'plat') tags.push('#plat');
  if (recipe.category === 'dessert') tags.push('#dessert');
  if (recipe.category === 'petit-déjeuner') tags.push('#petit-déjeuner');
  if (recipe.category === 'accompagnement') tags.push('#accompagnement');
  
  // Analyser les ingrédients pour détecter des tags
  const ingredientNames = recipe.ingredients.map(ing => ing.name.toLowerCase()).join(' ');
  const recipeName = (recipe.name || '').toLowerCase();
  
  // Tags basés sur la texture
  if (recipe.texture) {
    if (recipe.texture === 'mixée' || recipe.texture === 'mixee') tags.push('#mixée');
    if (recipe.texture === 'hachée' || recipe.texture === 'hachee') tags.push('#hachée');
    if (recipe.texture === 'moulinée' || recipe.texture === 'moulinee') tags.push('#moulinée');
    if (recipe.texture === 'lisse') tags.push('#lisse');
    if (recipe.texture === 'liquide' || recipe.texture === 'boire') tags.push('#liquide');
    if (recipe.texture === 'tendre') tags.push('#tendre');
  }
  
  // Tags par type de protéine
  if (ingredientNames.match(/\b(poulet|volaille|dinde|canard)\b/)) {
    tags.push('#volaille');
  }
  if (ingredientNames.match(/\b(boeuf|veau|porc|agneau|mouton|jambon|saucisse)\b/)) {
    tags.push('#viande');
  }
  if (ingredientNames.match(/\b(poisson|saumon|thon|cabillaud|merlan|sardine|truite)\b/)) {
    tags.push('#poisson');
  }
  if (ingredientNames.match(/\b(tofu|seitan|tempeh|lentille|haricot|pois chiche|quinoa)\b/)) {
    tags.push('#végétarien');
    if (!ingredientNames.match(/\b(lait|beurre|crème|fromage|yaourt|oeuf|œuf)\b/)) {
      tags.push('#vegan');
    }
  }
  
  // Tags par restrictions alimentaires
  if (recipe.dietaryRestrictions && recipe.dietaryRestrictions.length > 0) {
    recipe.dietaryRestrictions.forEach(restriction => {
      const restLower = restriction.toLowerCase();
      if (restLower.includes('végétarien') || restLower.includes('vegetarien')) tags.push('#végétarien');
      if (restLower.includes('vegan')) tags.push('#vegan');
      if (restLower.includes('sans_gluten') || restLower.includes('sans-gluten')) tags.push('#sans-gluten');
      if (restLower.includes('sans_lactose') || restLower.includes('sans-lactose')) tags.push('#sans-lactose');
      if (restLower.includes('halal')) tags.push('#halal');
      if (restLower.includes('casher') || restLower.includes('kosher')) tags.push('#casher');
      if (restLower.includes('sans_porc') || restLower.includes('sans-porc')) tags.push('#sans-porc');
    });
  }
  
  // Tags par caractéristiques nutritionnelles
  if (recipe.nutrition) {
    if (recipe.nutrition.proteins >= 25) {
      tags.push('#hyperprotéiné');
      tags.push('#riche-protéines');
    }
    if (recipe.nutrition.calories < 300) {
      tags.push('#léger');
      tags.push('#hypocalorique');
    }
    if (recipe.nutrition.fibers >= 5) {
      tags.push('#riche-fibres');
    }
    if (recipe.nutrition.sodium < 400 || recipe.nutrition.sodium === 0) {
      tags.push('#hyposodé');
      tags.push('#sans-sel');
    }
    if (recipe.nutrition.calories >= 400) {
      tags.push('#calorique');
    }
  }
  
  // Tags par pathologies (détection depuis le nom ou les ingrédients)
  const textToAnalyze = (recipeName + ' ' + ingredientNames).toLowerCase();
  if (textToAnalyze.match(/\b(diabete|diabète|diabétique|sans sucre|sans-sucre)\b/)) {
    tags.push('#diabète');
    tags.push('#sans-sucre');
  }
  if (textToAnalyze.match(/\b(hypertension|hyposodé|sans sel|sans-sel)\b/)) {
    tags.push('#hypertension');
    tags.push('#hyposodé');
  }
  if (textToAnalyze.match(/\b(cholesterol|cholestérol|anti-cholesterol)\b/)) {
    tags.push('#anti-cholestérol');
  }
  if (textToAnalyze.match(/\b(inflammatoire|anti-inflammatoire)\b/)) {
    tags.push('#anti-inflammatoire');
  }
  if (textToAnalyze.match(/\b(dysphagie|déglutition|mixée|hachée)\b/)) {
    tags.push('#dysphagie');
  }
  
  // Tags par type de cuisine
  if (ingredientNames.match(/\b(tomate|basilic|parmesan|pâtes|risotto|mozzarella)\b/)) {
    tags.push('#italien');
  }
  if (ingredientNames.match(/\b(soja|gingembre|sauce soja|curry|coco|riz thaï)\b/)) {
    tags.push('#asiatique');
  }
  if (ingredientNames.match(/\b(huile d'olive|ail|herbes de provence|tomate|aubergine)\b/)) {
    tags.push('#méditerranéen');
  }
  if (ingredientNames.match(/\b(okra|turquie|turc|dinde)\b/)) {
    tags.push('#turc');
  }
  
  // Tags par difficulté (basé sur le nombre d'étapes)
  const stepCount = recipe.preparationSteps.length;
  if (stepCount <= 3) {
    tags.push('#facile');
    tags.push('#rapide');
  } else if (stepCount <= 6) {
    tags.push('#moyen');
  } else {
    tags.push('#difficile');
  }
  
  // Tags par temps total
  const totalTime = (recipe.preparationTime || 0) + (recipe.cookingTime || 0);
  if (totalTime < 20) {
    tags.push('#rapide');
  } else if (totalTime > 60) {
    tags.push('#long');
  }
  
  // Tags par établissement (détection automatique)
  if (recipe.establishmentTypes && recipe.establishmentTypes.length > 0) {
    recipe.establishmentTypes.forEach(type => {
      if (type === 'ehpad') tags.push('#ehpad');
      if (type === 'cantine_scolaire') tags.push('#cantine-scolaire');
      if (type === 'hopital') tags.push('#hopital');
    });
  }
  
  // Tags généraux
  tags.push('#quotidien');
  tags.push('#familial');
  tags.push('#classique');
  
  // Tags économiques (basé sur les ingrédients simples)
  const simpleIngredients = ['pomme de terre', 'riz', 'pâtes', 'légumes', 'oeuf', 'œuf'];
  if (recipe.ingredients.some(ing => simpleIngredients.some(simple => ing.name.toLowerCase().includes(simple)))) {
    tags.push('#économique');
  }
  
  // Tags par saison (détection basique)
  if (ingredientNames.match(/\b(tomate|courgette|aubergine|poivron|basilic)\b/)) {
    tags.push('#été');
  }
  if (ingredientNames.match(/\b(chou|carotte|navet|potiron|courge)\b/)) {
    tags.push('#hiver');
  }
  
  // Supprimer les doublons et retourner
  return [...new Set(tags)];
}

/**
 * Détecter les allergènes depuis les ingrédients
 */
function detectAllergens(recipe) {
  const allergens = [];
  const ingredientText = recipe.ingredients.map(ing => ing.name.toLowerCase()).join(' ');
  
  const allergenMap = {
    'gluten': ['blé', 'farine', 'pâtes', 'pain', 'semoule', 'couscous', 'orge', 'seigle'],
    'lactose': ['lait', 'beurre', 'crème', 'fromage', 'yaourt', 'laitage'],
    'oeufs': ['oeuf', 'œuf', 'blanc d\'oeuf', 'jaune d\'oeuf'],
    'arachides': ['arachide', 'cacahuète', 'cacahuete'],
    'fruits_a_coque': ['noix', 'noisette', 'amande', 'pistache', 'cajou'],
    'soja': ['soja', 'tofu', 'tempeh'],
    'poisson': ['poisson', 'saumon', 'thon', 'cabillaud', 'merlan'],
    'crustaces': ['crevette', 'crabe', 'langouste', 'homard'],
    'mollusques': ['moule', 'huître', 'coquille', 'calamar'],
    'celeri': ['céleri', 'celeri'],
    'moutarde': ['moutarde'],
    'sesame': ['sésame', 'sesame'],
    'sulfites': ['sulfite', 'conservateur']
  };
  
  Object.keys(allergenMap).forEach(allergen => {
    if (allergenMap[allergen].some(ing => ingredientText.includes(ing))) {
      allergens.push(allergen);
    }
  });
  
  return allergens;
}

/**
 * Détecter les restrictions alimentaires
 */
function detectDietaryRestrictions(recipe) {
  const restrictions = [];
  const ingredientText = recipe.ingredients.map(ing => ing.name.toLowerCase()).join(' ');
  const nameLower = recipe.name.toLowerCase();
  
  // Végétarien/Vegan
  if (!ingredientText.match(/\b(viande|poisson|volaille|porc|boeuf|veau|agneau|mouton|jambon|saucisse)\b/)) {
    if (!ingredientText.match(/\b(lait|beurre|crème|fromage|yaourt|oeuf|œuf)\b/)) {
      restrictions.push('vegan');
    } else {
      restrictions.push('vegetarien');
    }
  }
  
  // Sans porc
  if (!ingredientText.match(/\b(porc|jambon|saucisse|cochon)\b/)) {
    restrictions.push('sans_porc');
  }
  
  // Sans gluten
  if (!ingredientText.match(/\b(blé|farine|pâtes|pain|semoule|couscous|orge|seigle)\b/)) {
    restrictions.push('sans_gluten');
  }
  
  // Halal (pas de porc, pas d'alcool)
  if (restrictions.includes('sans_porc') && !ingredientText.match(/\b(alcool|vin|bière|rhum)\b/)) {
    restrictions.push('halal');
  }
  
  return restrictions;
}

/**
 * Normaliser une recette pour s'assurer qu'elle a tous les champs requis
 */
function normalizeRecipe(recipe) {
  // Détecter automatiquement les allergènes et restrictions
  const allergens = detectAllergens(recipe);
  const dietaryRestrictions = detectDietaryRestrictions(recipe);
  
  // Générer les tags
  const tags = generateChefSESTags({
    ...recipe,
    allergens,
    dietaryRestrictions
  });
  
  return {
    name: recipe.name || 'Recette sans nom',
    category: recipe.category || 'plat',
    ingredients: recipe.ingredients || [],
    preparationSteps: recipe.preparationSteps || [],
    nutrition: recipe.nutrition || {
      calories: 0,
      proteins: 0,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 0
    },
    allergens: allergens,
    dietaryRestrictions: dietaryRestrictions,
    textures: recipe.textures || ['normale'],
    establishmentTypes: recipe.establishmentTypes || ['restaurant', 'cantine_scolaire'],
    preparationTime: recipe.preparationTime || 30,
    cookingTime: recipe.cookingTime || 30,
    tags: tags,
    // Champs supplémentaires pour Chef SES
    compatibleFor: recipe.compatibleFor || [],
    aiCompatibilityScore: recipe.aiCompatibilityScore || 1.0
  };
}

/**
 * Générer le contenu JavaScript pour les recettes (format Chef SES)
 */
function generateJSFile(recipes, outputPath) {
  // Convertir les recettes au format Chef SES (RecipeEnriched)
  const chefSESRecipes = recipes.map(recipe => ({
    name: recipe.name,
    category: recipe.category || 'plat',
    establishmentTypes: recipe.establishmentTypes || ['restaurant', 'cantine_scolaire'],
    texture: recipe.textures && recipe.textures[0] ? recipe.textures[0] : 'normale',
    diet: recipe.dietaryRestrictions || [],
    dietaryRestrictions: recipe.dietaryRestrictions || [],
    tags: recipe.tags || [],
    allergens: recipe.allergens || [],
    nutritionalProfile: {
      kcal: recipe.nutrition?.calories || 0,
      protein: recipe.nutrition?.proteins || 0,
      lipids: recipe.nutrition?.lipids || 0,
      carbs: recipe.nutrition?.carbs || 0,
      fiber: recipe.nutrition?.fibers || 0,
      sodium: recipe.nutrition?.sodium || 0
    },
    ingredients: recipe.ingredients || [],
    preparationSteps: recipe.preparationSteps || [],
    compatibleFor: recipe.compatibleFor || [],
    aiCompatibilityScore: recipe.aiCompatibilityScore || 1.0
  }));
  
  const fileContent = `/**
 * Recettes extraites d'un PDF - Format Chef SES
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

export function searchRecipes(query) {
  const queryLower = query.toLowerCase();
  return extractedRecipes.filter(recipe => 
    recipe.name.toLowerCase().includes(queryLower) ||
    (recipe.ingredients && recipe.ingredients.some(ing => 
      ing.name.toLowerCase().includes(queryLower)
    )) ||
    (recipe.tags && recipe.tags.some(tag => 
      tag.toLowerCase().includes(queryLower)
    ))
  );
}

// Fonction pour filtrer par établissement
export function getRecipesForEstablishment(establishmentType) {
  return extractedRecipes.filter(recipe => 
    recipe.establishmentTypes && recipe.establishmentTypes.includes(establishmentType)
  );
}

// Fonction pour filtrer par restriction alimentaire
export function getRecipesByDietaryRestriction(restriction) {
  return extractedRecipes.filter(recipe => 
    recipe.dietaryRestrictions && recipe.dietaryRestrictions.includes(restriction)
  );
}
`;

  // Créer le dossier de sortie s'il n'existe pas
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, fileContent, 'utf8');
  console.log(`✅ Fichier JavaScript créé: ${outputPath}`);
}

/**
 * Fonction principale
 */
async function extractRecipesFromPDF(pdfPath, outputPath = null) {
  try {
    console.log('📄 Extraction des recettes depuis le PDF...');
    console.log(`   Fichier: ${pdfPath}`);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Le fichier PDF n'existe pas: ${pdfPath}`);
    }
    
    // Extraire le texte du PDF
    console.log('\n📖 Extraction du texte...');
    let text = await extractTextFromPDF(pdfPath);
    const originalLength = text.length;
    console.log(`✅ ${originalLength} caractères extraits`);
    
    // Nettoyer le texte (corriger les espaces dans les mots)
    text = cleanPDFText(text);
    console.log(`🧹 Texte nettoyé: ${originalLength} → ${text.length} caractères`);
    
    // Parser les recettes
    console.log('\n🔍 Parsing des recettes...');
    const recipes = parseRecipesFromText(text);
    console.log(`✅ ${recipes.length} recette(s) trouvée(s)`);
    
    // Si aucune recette trouvée, sauvegarder un échantillon pour analyse
    if (recipes.length === 0 && outputPath) {
      const debugDir = path.dirname(outputPath);
      const sampleFile = path.join(debugDir, 'pdf-parsing-debug.txt');
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const sample = lines.slice(0, 200).join('\n');
      fs.writeFileSync(sampleFile, sample, 'utf8');
      console.log(`\n⚠️  Aucune recette détectée. Échantillon sauvegardé: ${sampleFile}`);
      console.log('   Vérifiez ce fichier pour comprendre le format et améliorer le parser.');
    }
    
    // Afficher un résumé
    console.log('\n📊 RÉSUMÉ:');
    recipes.forEach((recipe, index) => {
      console.log(`   ${index + 1}. ${recipe.name}`);
      console.log(`      - ${recipe.ingredients.length} ingrédient(s)`);
      console.log(`      - ${recipe.preparationSteps.length} étape(s)`);
    });
    
    // Générer le fichier JavaScript
    if (!outputPath) {
      const pdfName = path.basename(pdfPath, '.pdf');
      outputPath = path.join(__dirname, '..', 'data', `${pdfName}-recipes.js`);
    }
    
    console.log('\n💾 Génération du fichier JavaScript...');
    generateJSFile(recipes, outputPath);
    
    // Aussi créer une version JSON
    const jsonPath = outputPath.replace('.js', '.json');
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
if (import.meta.url === `file://${process.argv[1]}`) {
  const pdfPath = process.argv[2];
  const outputPath = process.argv[3] || null;
  
  if (!pdfPath) {
    console.error('❌ Usage: node extract-recipes-from-pdf.js <chemin-vers-pdf> [chemin-sortie]');
    console.error('   Exemple: node extract-recipes-from-pdf.js ./recettes.pdf');
    process.exit(1);
  }
  
  extractRecipesFromPDF(pdfPath, outputPath)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default extractRecipesFromPDF;

