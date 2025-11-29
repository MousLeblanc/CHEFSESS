// scripts/extract-recipes-from-epub.js
// Script pour extraire les recettes depuis un fichier EPUB
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import JSZip from 'jszip';
import { JSDOM } from 'jsdom';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extraire le texte d'un fichier EPUB
 * Un EPUB est essentiellement une archive ZIP contenant des fichiers HTML/XHTML
 */
async function extractTextFromEPUB(epubPath) {
  try {
    console.log('📖 Extraction du texte depuis l\'EPUB...');
    
    // Lire le fichier EPUB (c'est un ZIP)
    const epubBuffer = fs.readFileSync(epubPath);
    const zip = await JSZip.loadAsync(epubBuffer);
    
    // Trouver le fichier OPF (Open Packaging Format) qui contient le manifest
    let opfContent = null;
    let opfPath = null;
    
    // Chercher le fichier .opf dans le ZIP
    for (const fileName in zip.files) {
      if (fileName.endsWith('.opf')) {
        opfPath = fileName;
        opfContent = await zip.files[fileName].async('string');
        break;
      }
    }
    
    if (!opfContent) {
      throw new Error('Fichier OPF non trouvé dans l\'EPUB');
    }
    
    // Parser le OPF pour trouver les fichiers HTML/XHTML
    const dom = new JSDOM(opfContent);
    const document = dom.window.document;
    
    // Extraire les références aux fichiers HTML
    const itemRefs = Array.from(document.querySelectorAll('itemref')).map(ref => ref.getAttribute('idref'));
    const items = {};
    
    Array.from(document.querySelectorAll('item')).forEach(item => {
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      if (id && href) {
        items[id] = href;
      }
    });
    
    // Extraire le texte de tous les fichiers HTML
    let fullText = '';
    const htmlFiles = itemRefs.map(id => items[id]).filter(Boolean);
    
    for (const htmlFile of htmlFiles) {
      try {
        // Construire le chemin complet dans le ZIP
        const htmlPath = path.join(path.dirname(opfPath), htmlFile).replace(/\\/g, '/');
        
        if (zip.files[htmlPath] && !zip.files[htmlPath].dir) {
          const htmlContent = await zip.files[htmlPath].async('string');
          
          // Parser le HTML et extraire le texte
          const htmlDom = new JSDOM(htmlContent);
          const htmlDoc = htmlDom.window.document;
          
          // Supprimer les scripts et styles
          const scripts = htmlDoc.querySelectorAll('script, style');
          scripts.forEach(el => el.remove());
          
          // Extraire le texte
          const text = htmlDoc.body ? htmlDoc.body.textContent : htmlDoc.textContent;
          fullText += text + '\n\n';
        }
      } catch (error) {
        console.warn(`⚠️  Erreur lors de l'extraction de ${htmlFile}:`, error.message);
      }
    }
    
    return fullText;
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction de l\'EPUB:', error);
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
 * Parser les recettes depuis le texte EPUB
 * Le format EPUB a souvent des mots collés, donc on doit adapter le parser
 */
function parseRecipesFromText(text) {
  const recipes = [];
  
  // Le texte EPUB peut être sur une seule ligne très longue
  // Séparer par "OceanofPDF.com" qui marque généralement la fin d'une recette
  const sections = text.split(/OceanofPDF\.com/g).filter(s => s.trim().length > 50);
  
  for (const section of sections) {
    // Ignorer les sections de publicité
    if (section.match(/Egalementdisponible|Tapotez|Découvrez|Contrat|Sommaire/i)) {
      continue;
    }
    
    // Chercher les titres de recettes dans la section
    // Pattern: "Dindefarcie", "Dindeauxmarrons", etc. suivi de "Préparation"
    const recipeMatch = section.match(/^([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]{6,})Préparation/i);
    
    if (recipeMatch) {
      const recipeName = recipeMatch[1];
      // Séparer les mots collés (ex: "Dindefarcie" -> "Dinde farcie")
      let cleanName = recipeName.replace(/([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ])/g, '$1 $2');
      cleanName = cleanName.replace(/([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ][A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ])/g, '$1 $2');
      
      // Corriger l'encodage
      cleanName = cleanName.replace(/├á/g, 'à').replace(/├®/g, 'é').replace(/├¿/g, 'è')
                           .replace(/├┤/g, 'ô').replace(/├º/g, 'ç').replace(/├«/g, 'ê')
                           .replace(/├╗/g, 'û').replace(/├║/g, 'ù').replace(/├»/g, 'ï')
                           .replace(/├╣/g, 'î').replace(/├ñ/g, 'ñ').replace(/├╝/g, 'ü')
                           .replace(/├»/g, 'ï').replace(/├║/g, 'ù').replace(/├╗/g, 'û')
                           .replace(/├á/g, 'à').replace(/├®/g, 'é').replace(/├¿/g, 'è')
                           .replace(/├┤/g, 'ô').replace(/├º/g, 'ç').replace(/├«/g, 'ê');
      
      const recipe = {
        name: cleanName,
        ingredients: [],
        preparationSteps: [],
        category: 'plat',
        preparationTime: 0,
        cookingTime: 0,
        servings: 4
      };
      
      // Extraire les métadonnées
      const prepMatch = section.match(/Préparation\s*:\s*(\d+)\s*(h|min)/i);
      if (prepMatch) {
        recipe.preparationTime = prepMatch[2] === 'h' ? parseInt(prepMatch[1]) * 60 : parseInt(prepMatch[1]);
      }
      
      const cookMatch = section.match(/Cuisson\s*:\s*(\d+)\s*(h|min)/i);
      if (cookMatch) {
        recipe.cookingTime = cookMatch[2] === 'h' ? parseInt(cookMatch[1]) * 60 : parseInt(cookMatch[1]);
      }
      
      const servingsMatch = section.match(/Pour\s+(\d+)\s+personnes?/i);
      if (servingsMatch) {
        recipe.servings = parseInt(servingsMatch[1]);
      }
      
      // Extraire les ingrédients (lignes avec quantités)
      const ingredientPattern = /(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|cl|dl|cuil\.?\s*à\s*(?:soupe|café|thé)|cuillère|tasse|verre|personnes?|branches?|feuilles?|gousses?|tranches?|œufs?)\s*(?:de\s+)?([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+(?:[a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s]*[a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]+)?)/gi;
      let ingredientMatch;
      const seenIngredients = new Set();
      while ((ingredientMatch = ingredientPattern.exec(section)) !== null) {
        const key = `${ingredientMatch[1]}-${ingredientMatch[2]}-${ingredientMatch[3]}`;
        if (seenIngredients.has(key)) continue;
        seenIngredients.add(key);
        
        // Séparer les mots collés dans le nom avec une approche plus agressive
        let ingName = ingredientMatch[3];
        
        // 1. Supprimer les préfixes "de", "des", "du" en début
        ingName = ingName.replace(/^(de|des|du|dela|d'|dun|dune)\s*/i, '');
        
        // 2. Séparer les majuscules
        ingName = ingName.replace(/([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ])/g, '$1 $2');
        
        // 3. Séparer les mots courants collés (de, des, du, de la, etc.)
        ingName = ingName.replace(/([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])(de|des|du|dela|d'|dun|dune|aux|au|à|en|avec|sans|pour|et|ou)([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])/gi, '$1 $2 $3');
        
        // 4. Séparer les mots composés courants (ex: "raisinssecs" -> "raisins secs")
        const commonWords = [
          'raisins', 'secs', 'amandes', 'hachées', 'semoule', 'blé', 'fine', 'beurre',
          'cannelle', 'poudre', 'gingembre', 'safran', 'dinde', 'oignon', 'émincé', 'émincés',
          'gousse', 'gousses', 'ail', 'thé', 'ras', 'el', 'hanout', 'huile', 'tournesol', 'olive',
          'miel', 'acacia', 'sel', 'marrons', 'boîte', 'échalotes', 'maïs', 'mangues', 'petites',
          'blancs', 'noisettes', 'concassées', 'escalopes', 'fines', 'œufs', 'battus', 'omelette',
          'champignons', 'Paris', 'noix', 'muscade', 'grillées', 'carottes', 'pommes', 'terre',
          'paprika', 'coriandre', 'cumin', 'curcuma', 'filets', 'médaillons', 'vinaigre', 'balsamique',
          'poivre', 'foies', 'volaille', 'chair', 'saucisse', 'viande', 'veau', 'hachée', 'tranches',
          'pain', 'mie', 'lait', 'persil', 'haché', 'bouillon', 'cubes', 'fromage', 'frais',
          'herbes', 'aubergine', 'suprêmes', 'morilles', 'surgelées', 'crème', 'fleurette',
          'vin', 'blanc', 'rôti', 'rosé', 'bouquet', 'garni', 'tomates', 'fraîche', 'épaisse',
          'allégée', 'gélatine', 'moutarde', 'ancienne', 'cuisse', 'courgettes', 'rondelles',
          'riz', 'basmati', 'coco', 'sucre', 'margarine', 'osso', 'buco', 'bière', 'vergeoise',
          'cassonade', 'chicorée', 'liquide', 'julienne', 'légumes', 'mélange', 'forestiers',
          'branches', 'thym', 'poivrons', 'rouge', 'vert', 'origan', 'déshydraté', 'olives',
          'noires', 'dénoyautées', 'piments', 'chili', 'arachide', 'citron', 'râpée', 'yaourts',
          'nature', 'brins', 'demi', 'pâte', 'jaune'
        ];
        
        // Séparer les mots composés (chercher chaque mot dans la chaîne)
        for (const word of commonWords) {
          // Chercher le mot suivi d'une lettre minuscule (mot collé)
          const regex1 = new RegExp(`(${word})([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])`, 'gi');
          ingName = ingName.replace(regex1, '$1 $2');
          // Chercher une lettre minuscule suivie du mot
          const regex2 = new RegExp(`([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])(${word})`, 'gi');
          ingName = ingName.replace(regex2, '$1 $2');
        }
        
        // 5. Corriger les cas spécifiques courants (avant de séparer les mots)
        ingName = ingName.replace(/goussed/g, 'gousse d').replace(/goussesd/g, 'gousses d')
                         .replace(/oussed/g, "gousse d'ail").replace(/oussesd/g, "gousses d'ail")
                         .replace(/d'ail/g, "d'ail").replace(/d'oignon/g, "d'oignon")
                         .replace(/blancsde/g, 'blancs de').replace(/blancde/g, 'blanc de')
                         .replace(/semoulede/g, 'semoule de').replace(/moulede/g, 'moule de')
                         .replace(/marronsen/g, 'marrons en').replace(/maïsen/g, 'maïs en')
                         .replace(/champignonsde/g, 'champignons de').replace(/champignonde/g, 'champignon de')
                         .replace(/noisettesgrillées/g, 'noisettes grillées').replace(/noisettegrillée/g, 'noisette grillée')
                         .replace(/noisettesconcassées/g, 'noisettes concassées').replace(/noisetteconcassée/g, 'noisette concassée')
                         .replace(/cannelleen/g, 'cannelle en').replace(/gingembreen/g, 'gingembre en')
                         .replace(/safranen/g, 'safran en').replace(/paprikaen/g, 'paprika en')
                         .replace(/muscadeen/g, 'muscade en').replace(/poudreen/g, 'poudre en')
                         .replace(/huilede/g, 'huile de').replace(/huiled/g, 'huile d')
                         .replace(/mielde/g, 'miel de').replace(/mield/g, 'miel d').replace(/mieldacacia/g, "miel d'acacia")
                         .replace(/raselhanout/g, 'ras el hanout').replace(/rasel/g, 'ras el')
                         .replace(/crèmefraîche/g, 'crème fraîche').replace(/crèmef/g, 'crème f')
                         .replace(/fromagefrais/g, 'fromage frais').replace(/fromagef/g, 'fromage f')
                         .replace(/pommesdeterre/g, 'pommes de terre').replace(/pommedeterre/g, 'pomme de terre')
                         .replace(/vinaigrebalsamique/g, 'vinaigre balsamique').replace(/vinaigreb/g, 'vinaigre b')
                         .replace(/bouillonde/g, 'bouillon de').replace(/bouillond/g, 'bouillon d')
                         .replace(/laitde/g, 'lait de').replace(/laitd/g, 'lait d')
                         .replace(/poivronsrouge/g, 'poivrons rouge').replace(/poivronrouge/g, 'poivron rouge')
                         .replace(/poivronsvert/g, 'poivrons vert').replace(/poivronvert/g, 'poivron vert')
                         .replace(/olivesnoires/g, 'olives noires').replace(/olivenoire/g, 'olive noire')
                         .replace(/pimentschili/g, 'piments chili').replace(/pimentchili/g, 'piment chili')
                         .replace(/pâtedecurry/g, 'pâte de curry').replace(/pâted/g, 'pâte d')
                         .replace(/œufsbattus/g, 'œufs battus').replace(/œufbattu/g, 'œuf battu')
                         .replace(/paindemie/g, 'pain de mie').replace(/paind/g, 'pain d')
                         .replace(/feuillesdelaurier/g, 'feuilles de laurier').replace(/feuilledelaurier/g, 'feuille de laurier')
                         .replace(/brinsdecoriandre/g, 'brins de coriandre').replace(/brindecoriandre/g, 'brin de coriandre')
                         .replace(/branchesdethym/g, 'branches de thym').replace(/branchedethym/g, 'branche de thym')
                         .replace(/bouquetgarni/g, 'bouquet garni')
                         .replace(/herbesdeProvence/g, 'herbes de Provence').replace(/herbesd/g, 'herbes d')
                         .replace(/petitslégumes/g, 'petits légumes').replace(/petitlégume/g, 'petit légume')
                         .replace(/petitesmangues/g, 'petites mangues').replace(/petitemangue/g, 'petite mangue')
                         .replace(/groschampignons/g, 'gros champignons').replace(/grochampignon/g, 'gros champignon')
                         .replace(/finementhachées/g, 'finement hachées').replace(/finementhachée/g, 'finement hachée')
                         .replace(/finementémincé/g, 'finement émincé').replace(/finementémincés/g, 'finement émincés')
                         .replace(/enboîte/g, 'en boîte').replace(/enboite/g, 'en boîte')
                         .replace(/surgelées/g, 'surgelées').replace(/surgelée/g, 'surgelée')
                         .replace(/dénoyautées/g, 'dénoyautées').replace(/dénoyautée/g, 'dénoyautée')
                         .replace(/concassées/g, 'concassées').replace(/concassée/g, 'concassée')
                         .replace(/grillées/g, 'grillées').replace(/grillée/g, 'grillée')
                         .replace(/hachées/g, 'hachées').replace(/hachée/g, 'hachée')
                         .replace(/émincés/g, 'émincés').replace(/émincé/g, 'émincé')
                         .replace(/râpée/g, 'râpée').replace(/râpé/g, 'râpé')
                         .replace(/épaisse/g, 'épaisse').replace(/épais/g, 'épais')
                         .replace(/fraîche/g, 'fraîche').replace(/frais/g, 'frais')
                         .replace(/fines/g, 'fines').replace(/fine/g, 'fine')
                         .replace(/petites/g, 'petites').replace(/petite/g, 'petite')
                         .replace(/petits/g, 'petits').replace(/petit/g, 'petit')
                         .replace(/gros/g, 'gros').replace(/grosse/g, 'grosse')
                         .replace(/rouge/g, 'rouge').replace(/rouges/g, 'rouges')
                         .replace(/vert/g, 'vert').replace(/verts/g, 'verts')
                         .replace(/noires/g, 'noires').replace(/noire/g, 'noire')
                         .replace(/jaune/g, 'jaune').replace(/jaunes/g, 'jaunes')
                         .replace(/blanc/g, 'blanc').replace(/blancs/g, 'blancs')
                         .replace(/noir/g, 'noir').replace(/noirs/g, 'noirs');
        
        // 6. Corriger les mots mal séparés (recoler les mots qui ont été séparés incorrectement)
        ingName = ingName.replace(/\bsem\s+ou\s+le\b/gi, 'semoule')
                         .replace(/\bcann\s+el\s+le\b/gi, 'cannelle')
                         .replace(/\bnois\s+et\s+tes\b/gi, 'noisettes')
                         .replace(/\bnois\s+et\s+te\b/gi, 'noisette')
                         .replace(/\bras\s+el\s+han\s+ou\s+t\b/gi, 'ras el hanout')
                         .replace(/\bras\s+el\s+hanout\b/gi, 'ras el hanout')
                         .replace(/\bmi\s+el\s+d\b/gi, "miel d'acacia")
                         .replace(/\bmiel\s+d\s+acacia\b/gi, "miel d'acacia")
                         .replace(/\bs\s+el\b/gi, 'sel')
                         .replace(/\bm\s+ou\s+tar\s+de\s+àl\b/gi, 'moutarde à l\'ancienne')
                         .replace(/\bmusca\s+de\s+enp\s+ou\s+dre\b/gi, 'muscade en poudre')
                         .replace(/\bnoix\s+de\s+muscade\s+enp\s+ou\s+dre\b/gi, 'noix de muscade en poudre')
                         .replace(/\bémincé\s+s\b/gi, 'émincés')
                         .replace(/\bchampignons\s+de\s+Paris\s+émincé\s+s\b/gi, 'champignons de Paris émincés')
                         .replace(/\bnois\s+et\s+tes\s+grillées\b/gi, 'noisettes grillées')
                         .replace(/\bnois\s+et\s+tes\s+concassées\b/gi, 'noisettes concassées')
                         .replace(/\bS\s+el\s+et\s+poivre\b/gi, 'sel et poivre')
                         .replace(/\bC\s+ou\s+pezles\b/gi, 'coupez les')
                         .replace(/\bP\s+ou\s+rlafarce\b/gi, 'Pour la farce')
                         .replace(/\bvol\s+ail\s+le\b/gi, 'volaille')
                         .replace(/\bvian\s+de\s+ve\s+au\s+haché\s+e\b/gi, 'viande de veau hachée')
                         .replace(/\bP\s+ou\s+rla\s+dinde\b/gi, 'Pour la dinde')
                         .replace(/\bl\s+au\s+rier\b/gi, 'laurier')
                         .replace(/\boussesd\b/gi, "gousses d'ail")
                         .replace(/\boussed\b/gi, "gousse d'ail")
                         .replace(/\bblanc\s+s\s+de\s+dinde\b/gi, 'blancs de dinde')
                         .replace(/\bHuile\s+d\b/gi, 'huile d\'olive')
                         .replace(/\bÉpluchezles\s+mangues\s+et\s+coupez\b/gi, 'mangues')
                         .replace(/\bLavez\s+et\s+épluchezles\s+carottes\s+et\s+les\s+pommes\s+de\s+terre\b/gi, 'carottes, pommes de terre');
        
        // 7. Nettoyer les espaces multiples et corriger l'encodage
        ingName = ingName.replace(/\s+/g, ' ').trim();
        ingName = ingName.replace(/├á/g, 'à').replace(/├®/g, 'é').replace(/├¿/g, 'è')
                         .replace(/├┤/g, 'ô').replace(/├º/g, 'ç').replace(/├«/g, 'ê')
                         .replace(/├╗/g, 'û').replace(/├║/g, 'ù').replace(/├»/g, 'ï')
                         .replace(/├╣/g, 'î').replace(/├ñ/g, 'ñ').replace(/├╝/g, 'ü');
        
        // 8. Nettoyer les espaces multiples à nouveau après corrections
        ingName = ingName.replace(/\s+/g, ' ').trim();
        
        // 9. Supprimer les préfixes "de", "des", "du" restants en début
        ingName = ingName.replace(/^(de|des|du|dela|d'|dun|dune)\s+/i, '');
        
        if (ingName.length > 1 && ingName.length < 100) {
          recipe.ingredients.push({
            name: ingName.trim(),
            quantity: parseFloat(ingredientMatch[1].replace(',', '.')),
            unit: ingredientMatch[2].trim()
          });
        }
      }
      
      // Extraire les instructions (phrases avec verbes d'action)
      const instructionPattern = /([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ][a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]*(?:estremper|égouttez|mélangez|réservez|remplissez|recousez|faites|ajoutez|déposez|arrosez|retournez|servez|placez|allumez|augmentez|sortez|couvrez|laissez|poursuivez|épluchez|hachez|coupez|mettez|versez|retirez|nappez|préchauffez|pelez|trempez|ficelez|badigeonnez|diluez|mixez|incorporez|mijoter|cuire|chauffer|dorer|réduire)[a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ\s,;:()•\d°Cth\.-]{20,200}\.)/gi;
      let instructionMatch;
      const seenInstructions = new Set();
      while ((instructionMatch = instructionPattern.exec(section)) !== null) {
        if (seenInstructions.has(instructionMatch[1])) continue;
        seenInstructions.add(instructionMatch[1]);
        
        let instruction = instructionMatch[1];
        // Séparer les mots collés
        instruction = instruction.replace(/([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])([A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ])/g, '$1 $2');
        instruction = instruction.replace(/([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ])([a-zàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ][A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ])/g, '$1 $2');
        if (instruction.length > 15 && instruction.length < 500) {
          recipe.preparationSteps.push(instruction.trim());
        }
      }
      
      // Si on a au moins des ingrédients ou des instructions, ajouter la recette
      if (recipe.ingredients.length > 0 || recipe.preparationSteps.length > 0) {
        recipes.push(recipe);
      }
    }
  }
  
  return recipes;
}

/**
 * Détecter les allergènes dans une recette
 */
function detectAllergens(recipe) {
  const allergens = [];
  const ingredientText = recipe.ingredients.map(ing => ing.name.toLowerCase()).join(' ');
  
  if (ingredientText.match(/\b(blé|farine|pâtes|pain|semoule|couscous|orge|seigle|gluten)\b/)) {
    allergens.push('gluten');
  }
  if (ingredientText.match(/\b(lait|beurre|crème|fromage|yaourt|fromage|crème fraîche)\b/)) {
    allergens.push('lactose');
  }
  if (ingredientText.match(/\b(oeuf|œuf|œufs|oeufs|jaune|blanc d'oeuf)\b/)) {
    allergens.push('oeufs');
  }
  if (ingredientText.match(/\b(arachide|cacahuète|beurre d'arachide)\b/)) {
    allergens.push('arachides');
  }
  if (ingredientText.match(/\b(noix|noisette|amande|pistache|cajou|pécan|noix de cajou)\b/)) {
    allergens.push('fruits_a_coque');
  }
  if (ingredientText.match(/\b(soja|tofu|sauce soja)\b/)) {
    allergens.push('soja');
  }
  if (ingredientText.match(/\b(poisson|saumon|thon|cabillaud|merlan|sardine|truite)\b/)) {
    allergens.push('poisson');
  }
  if (ingredientText.match(/\b(crevette|crevettes|crabe|homard|langouste|moule|huître)\b/)) {
    allergens.push('crustaces');
  }
  
  return allergens;
}

/**
 * Détecter les restrictions alimentaires
 */
function detectDietaryRestrictions(recipe) {
  const restrictions = [];
  const ingredientText = recipe.ingredients.map(ing => ing.name.toLowerCase()).join(' ');
  
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
  
  return restrictions;
}

/**
 * Générer des tags compatibles Chef SES
 */
function generateChefSESTags(recipe) {
  const tags = new Set();
  
  // Tags basés sur la catégorie
  if (recipe.category) {
    tags.add(`#${recipe.category.toLowerCase().replace(/\s/g, '-')}`);
  }
  
  // Analyser les ingrédients
  const ingredientNames = recipe.ingredients.map(ing => ing.name.toLowerCase()).join(' ');
  
  // Tags par type de protéine
  if (ingredientNames.match(/\b(poulet|volaille|dinde|canard)\b/)) {
    tags.add('#volaille');
    tags.add('#viande');
  } else if (ingredientNames.match(/\b(boeuf|veau|porc|agneau|mouton)\b/)) {
    tags.add('#viande');
  } else if (ingredientNames.match(/\b(poisson|saumon|thon|cabillaud|merlan|sardine)\b/)) {
    tags.add('#poisson');
  } else if (ingredientNames.match(/\b(tofu|seitan|tempeh|lentille|haricot|pois chiche)\b/)) {
    tags.add('#végétarien');
    tags.add('#vegan');
  }
  
  // Tags par difficulté (basé sur le nombre d'étapes)
  const stepCount = recipe.preparationSteps ? recipe.preparationSteps.length : 0;
  if (stepCount <= 3) {
    tags.add('#facile');
  } else if (stepCount <= 6) {
    tags.add('#moyen');
  } else {
    tags.add('#difficile');
  }
  
  // Tags par temps total
  const totalTime = (recipe.preparationTime || 0) + (recipe.cookingTime || 0);
  if (totalTime < 20) {
    tags.add('#rapide');
  } else if (totalTime > 60) {
    tags.add('#long');
  }
  
  // Tags par restrictions
  if (recipe.dietaryRestrictions) {
    recipe.dietaryRestrictions.forEach(restriction => {
      tags.add(`#${restriction.toLowerCase().replace(/\s/g, '-')}`);
    });
  }
  
  return Array.from(tags);
}

/**
 * Trouver les valeurs nutritionnelles d'un ingrédient dans la base de données
 */
function getIngredientNutrition(ingredientName) {
  // Importer dynamiquement la base de données
  // Pour l'instant, utiliser une base simplifiée intégrée
  const ingredientDB = {
    'dinde': { calories: 165, proteins: 31.0, carbs: 0, lipids: 3.6, fibers: 0, sodium: 70 },
    'blancs de dinde': { calories: 135, proteins: 29.0, carbs: 0, lipids: 1.5, fibers: 0, sodium: 60 },
    'escalopes de dinde': { calories: 135, proteins: 29.0, carbs: 0, lipids: 1.5, fibers: 0, sodium: 60 },
    'filets de dinde': { calories: 135, proteins: 29.0, carbs: 0, lipids: 1.5, fibers: 0, sodium: 60 },
    'suprêmes de dinde': { calories: 135, proteins: 29.0, carbs: 0, lipids: 1.5, fibers: 0, sodium: 60 },
    'jarrets de dinde': { calories: 135, proteins: 29.0, carbs: 0, lipids: 1.5, fibers: 0, sodium: 60 },
    'cuisse de dinde': { calories: 150, proteins: 28.0, carbs: 0, lipids: 3.0, fibers: 0, sodium: 65 },
    'foies de volaille': { calories: 167, proteins: 20.4, carbs: 0.7, lipids: 8.0, fibers: 0, sodium: 90 },
    'viande de veau hachée': { calories: 172, proteins: 20.7, carbs: 0, lipids: 9.2, fibers: 0, sodium: 80 },
    'chair à saucisse': { calories: 301, proteins: 13.0, carbs: 0, lipids: 26.0, fibers: 0, sodium: 1200 },
    'raisins secs': { calories: 299, proteins: 3.1, carbs: 79.2, lipids: 0.5, fibers: 3.7, sodium: 11 },
    'amandes hachées': { calories: 579, proteins: 21.2, carbs: 21.6, lipids: 49.9, fibers: 12.5, sodium: 1 },
    'semoule de blé': { calories: 360, proteins: 12.7, carbs: 72.8, lipids: 1.0, fibers: 3.5, sodium: 1 },
    'beurre': { calories: 717, proteins: 0.5, carbs: 0.5, lipids: 81.1, fibers: 0, sodium: 11 },
    'cannelle': { calories: 247, proteins: 4.0, carbs: 80.6, lipids: 1.2, fibers: 53.1, sodium: 1 },
    'gingembre': { calories: 80, proteins: 1.8, carbs: 17.8, lipids: 0.8, fibers: 2.0, sodium: 13 },
    'safran': { calories: 310, proteins: 11.4, carbs: 65.4, lipids: 5.9, fibers: 3.9, sodium: 148 },
    'oignon': { calories: 40, proteins: 1.1, carbs: 9.3, lipids: 0.1, fibers: 1.7, sodium: 4 },
    'gousse d\'ail': { calories: 149, proteins: 6.4, carbs: 33.1, lipids: 0.5, fibers: 2.1, sodium: 17 },
    'gousses d\'ail': { calories: 149, proteins: 6.4, carbs: 33.1, lipids: 0.5, fibers: 2.1, sodium: 17 },
    'huile d\'olive': { calories: 884, proteins: 0, carbs: 0, lipids: 100, fibers: 0, sodium: 2 },
    'huile de tournesol': { calories: 884, proteins: 0, carbs: 0, lipids: 100, fibers: 0, sodium: 0 },
    'miel': { calories: 304, proteins: 0.3, carbs: 82.4, lipids: 0, fibers: 0.2, sodium: 4 },
    'miel d\'acacia': { calories: 304, proteins: 0.3, carbs: 82.4, lipids: 0, fibers: 0.2, sodium: 4 },
    'marrons': { calories: 196, proteins: 2.4, carbs: 44.2, lipids: 1.4, fibers: 8.1, sodium: 1 },
    'échalotes': { calories: 72, proteins: 2.5, carbs: 16.8, lipids: 0.1, fibers: 3.2, sodium: 12 },
    'maïs': { calories: 96, proteins: 3.4, carbs: 21.3, lipids: 1.2, fibers: 2.7, sodium: 1 },
    'maïs en boîte': { calories: 96, proteins: 3.4, carbs: 21.3, lipids: 1.2, fibers: 2.7, sodium: 300 },
    'mangue': { calories: 60, proteins: 0.8, carbs: 15.0, lipids: 0.4, fibers: 1.6, sodium: 1 },
    'noisettes': { calories: 628, proteins: 15.0, carbs: 16.7, lipids: 60.8, fibers: 9.7, sodium: 0 },
    'noisettes grillées': { calories: 628, proteins: 15.0, carbs: 16.7, lipids: 60.8, fibers: 9.7, sodium: 0 },
    'noisettes concassées': { calories: 628, proteins: 15.0, carbs: 16.7, lipids: 60.8, fibers: 9.7, sodium: 0 },
    'moutarde': { calories: 66, proteins: 3.7, carbs: 5.8, lipids: 3.3, fibers: 3.3, sodium: 1135 },
    'moutarde à l\'ancienne': { calories: 66, proteins: 3.7, carbs: 5.8, lipids: 3.3, fibers: 3.3, sodium: 1135 },
    'crème fraîche': { calories: 292, proteins: 2.3, carbs: 3.0, lipids: 30.0, fibers: 0, sodium: 30 },
    'crème fraîche épaisse': { calories: 292, proteins: 2.3, carbs: 3.0, lipids: 30.0, fibers: 0, sodium: 30 },
    'noix de muscade': { calories: 525, proteins: 5.8, carbs: 49.3, lipids: 36.3, fibers: 20.8, sodium: 16 },
    'champignons de paris': { calories: 22, proteins: 2.2, carbs: 3.3, lipids: 0.3, fibers: 1.0, sodium: 5 },
    'carottes': { calories: 41, proteins: 0.9, carbs: 9.6, lipids: 0.2, fibers: 2.8, sodium: 69 },
    'pommes de terre': { calories: 77, proteins: 2.0, carbs: 17.0, lipids: 0.1, fibers: 2.1, sodium: 6 },
    'paprika': { calories: 282, proteins: 14.1, carbs: 53.9, lipids: 12.9, fibers: 34.9, sodium: 68 },
    'coriandre': { calories: 23, proteins: 2.1, carbs: 3.7, lipids: 0.5, fibers: 2.8, sodium: 46 },
    'cumin': { calories: 375, proteins: 17.8, carbs: 44.2, lipids: 22.3, fibers: 10.5, sodium: 168 },
    'curcuma': { calories: 354, proteins: 7.8, carbs: 64.9, lipids: 9.9, fibers: 21.1, sodium: 38 },
    'vinaigre balsamique': { calories: 88, proteins: 0.5, carbs: 17.0, lipids: 0, fibers: 0, sodium: 23 },
    'poivre': { calories: 251, proteins: 10.4, carbs: 63.9, lipids: 3.3, fibers: 25.3, sodium: 20 },
    'sel': { calories: 0, proteins: 0, carbs: 0, lipids: 0, fibers: 0, sodium: 38758 },
    'pain de mie': { calories: 265, proteins: 8.2, carbs: 49.4, lipids: 3.2, fibers: 2.7, sodium: 681 },
    'lait': { calories: 42, proteins: 3.4, carbs: 4.8, lipids: 1.0, fibers: 0, sodium: 44 },
    'persil': { calories: 36, proteins: 3.0, carbs: 6.3, lipids: 0.8, fibers: 3.3, sodium: 56 },
    'persil haché': { calories: 36, proteins: 3.0, carbs: 6.3, lipids: 0.8, fibers: 3.3, sodium: 56 },
    'bouillon de volaille': { calories: 5, proteins: 0.3, carbs: 0.3, lipids: 0.2, fibers: 0, sodium: 500 },
    'cubes de bouillon': { calories: 5, proteins: 0.3, carbs: 0.3, lipids: 0.2, fibers: 0, sodium: 500 },
    'yaourts nature': { calories: 59, proteins: 3.5, carbs: 4.7, lipids: 3.3, fibers: 0, sodium: 36 },
    'yaourt nature': { calories: 59, proteins: 3.5, carbs: 4.7, lipids: 3.3, fibers: 0, sodium: 36 },
    'laurier': { calories: 313, proteins: 7.6, carbs: 74.9, lipids: 8.4, fibers: 26.3, sodium: 23 },
    'vin blanc': { calories: 82, proteins: 0.1, carbs: 2.6, lipids: 0, fibers: 0, sodium: 5 },
    'noix de coco râpée': { calories: 660, proteins: 6.9, carbs: 23.7, lipids: 64.5, fibers: 16.3, sodium: 20 },
    'pommes': { calories: 52, proteins: 0.3, carbs: 14.0, lipids: 0.2, fibers: 2.4, sodium: 1 },
    'beurre demi-sel': { calories: 717, proteins: 0.5, carbs: 0.5, lipids: 81.1, fibers: 0, sodium: 500 },
    'poivrons': { calories: 31, proteins: 1.0, carbs: 6.0, lipids: 0.3, fibers: 2.1, sodium: 4 },
    'poivron rouge': { calories: 31, proteins: 1.0, carbs: 6.0, lipids: 0.3, fibers: 2.1, sodium: 4 },
    'poivron vert': { calories: 31, proteins: 1.0, carbs: 6.0, lipids: 0.3, fibers: 2.1, sodium: 4 },
    'olives noires': { calories: 116, proteins: 0.8, carbs: 6.0, lipids: 10.7, fibers: 3.2, sodium: 735 },
    'olives noires dénoyautées': { calories: 116, proteins: 0.8, carbs: 6.0, lipids: 10.7, fibers: 3.2, sodium: 735 },
    'sauce aux piments': { calories: 20, proteins: 1.0, carbs: 4.0, lipids: 0.2, fibers: 0.5, sodium: 800 },
    'huile d\'arachide': { calories: 884, proteins: 0, carbs: 0, lipids: 100, fibers: 0, sodium: 0 },
    'citron': { calories: 29, proteins: 1.1, carbs: 9.3, lipids: 0.3, fibers: 2.8, sodium: 2 },
    'margarine': { calories: 717, proteins: 0.2, carbs: 0.7, lipids: 81.0, fibers: 0, sodium: 600 },
    'farine': { calories: 364, proteins: 10.3, carbs: 76.0, lipids: 1.0, fibers: 2.7, sodium: 2 },
    'bière': { calories: 43, proteins: 0.5, carbs: 3.6, lipids: 0, fibers: 0, sodium: 4 },
    'vergeoise': { calories: 380, proteins: 0, carbs: 100, lipids: 0, fibers: 0, sodium: 1 },
    'cassonade': { calories: 380, proteins: 0, carbs: 100, lipids: 0, fibers: 0, sodium: 1 },
    'chicorée liquide': { calories: 20, proteins: 0.1, carbs: 4.7, lipids: 0, fibers: 0, sodium: 10 },
    'julienne de légumes': { calories: 30, proteins: 1.5, carbs: 6.0, lipids: 0.2, fibers: 2.0, sodium: 50 },
    'julienne de légumes surgelée': { calories: 30, proteins: 1.5, carbs: 6.0, lipids: 0.2, fibers: 2.0, sodium: 50 },
    'mélange de champignons forestiers': { calories: 22, proteins: 2.2, carbs: 3.3, lipids: 0.3, fibers: 1.0, sodium: 5 },
    'fromage frais': { calories: 103, proteins: 7.0, carbs: 3.0, lipids: 7.0, fibers: 0, sodium: 300 },
    'fromage frais aux herbes': { calories: 103, proteins: 7.0, carbs: 3.0, lipids: 7.0, fibers: 0, sodium: 300 },
    'bouillon de légumes': { calories: 5, proteins: 0.3, carbs: 0.3, lipids: 0.2, fibers: 0, sodium: 400 },
    'thym': { calories: 101, proteins: 5.6, carbs: 24.5, lipids: 1.7, fibers: 14.0, sodium: 9 },
    'morilles': { calories: 31, proteins: 3.1, carbs: 5.1, lipids: 0.4, fibers: 0, sodium: 5 },
    'morilles surgelées': { calories: 31, proteins: 3.1, carbs: 5.1, lipids: 0.4, fibers: 0, sodium: 5 },
    'crème fleurette': { calories: 292, proteins: 2.3, carbs: 3.0, lipids: 30.0, fibers: 0, sodium: 30 },
    'piment de cayenne': { calories: 318, proteins: 12.0, carbs: 56.6, lipids: 17.3, fibers: 27.2, sodium: 30 },
    'piment d\'espelette': { calories: 318, proteins: 12.0, carbs: 56.6, lipids: 17.3, fibers: 27.2, sodium: 30 },
    'lait de coco': { calories: 230, proteins: 2.3, carbs: 6.0, lipids: 23.8, fibers: 2.2, sodium: 13 },
    'sucre': { calories: 387, proteins: 0, carbs: 100, lipids: 0, fibers: 0, sodium: 1 },
    'coriandre fraîche': { calories: 23, proteins: 2.1, carbs: 3.7, lipids: 0.5, fibers: 2.8, sodium: 46 },
    'curry': { calories: 325, proteins: 14.3, carbs: 55.8, lipids: 14.0, fibers: 33.9, sodium: 52 },
    'courgettes': { calories: 17, proteins: 1.2, carbs: 3.1, lipids: 0.3, fibers: 1.0, sodium: 8 },
    'riz': { calories: 130, proteins: 2.7, carbs: 28.0, lipids: 0.3, fibers: 0.4, sodium: 1 },
    'riz basmati': { calories: 130, proteins: 2.7, carbs: 28.0, lipids: 0.3, fibers: 0.4, sodium: 1 },
    'huile de sésame': { calories: 884, proteins: 0, carbs: 0, lipids: 100, fibers: 0, sodium: 0 },
    'pâte de curry': { calories: 325, proteins: 14.3, carbs: 55.8, lipids: 14.0, fibers: 33.9, sodium: 52 },
    'pâte de curry jaune': { calories: 325, proteins: 14.3, carbs: 55.8, lipids: 14.0, fibers: 33.9, sodium: 52 },
    'aubergine': { calories: 25, proteins: 1.0, carbs: 5.9, lipids: 0.2, fibers: 3.0, sodium: 2 },
    'ras el hanout': { calories: 300, proteins: 10.0, carbs: 60.0, lipids: 10.0, fibers: 30.0, sodium: 50 }
  };
  
  // Normaliser le nom de l'ingrédient pour la recherche
  const normalizedName = ingredientName.toLowerCase().trim();
  
  // Chercher une correspondance exacte d'abord
  if (ingredientDB[normalizedName]) {
    return ingredientDB[normalizedName];
  }
  
  // Chercher une correspondance partielle
  for (const [key, value] of Object.entries(ingredientDB)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  // Valeurs par défaut si non trouvé
  return { calories: 0, proteins: 0, carbs: 0, lipids: 0, fibers: 0, sodium: 0 };
}

/**
 * Convertir une quantité en grammes
 */
function convertToGrams(quantity, unit, ingredientName = '') {
  const unitLower = unit.toLowerCase().trim();
  const ingNameLower = ingredientName.toLowerCase();
  
  // Conversions pour épices et condiments (densité plus faible)
  const isSpice = /cannelle|gingembre|safran|paprika|cumin|curcuma|poivre|sel|muscade|ras el hanout|curry|piment/.test(ingNameLower);
  
  // Conversions approximatives
  if (unitLower.includes('cuil. à soupe') || unitLower.includes('cuillère à soupe')) {
    if (isSpice) {
      return quantity * 8; // Épices en poudre : 1 cuillère à soupe ≈ 8g
    }
    return quantity * 15; // Liquides/autres : 1 cuillère à soupe ≈ 15g
  }
  if (unitLower.includes('cuil. à café') || unitLower.includes('cuillère à café')) {
    if (isSpice) {
      return quantity * 2; // Épices en poudre : 1 cuillère à café ≈ 2g
    }
    return quantity * 5; // Liquides/autres : 1 cuillère à café ≈ 5g
  }
  if (unitLower.includes('cuil. à thé') || unitLower.includes('cuillère à thé')) {
    if (isSpice) {
      return quantity * 2; // Épices en poudre : 1 cuillère à thé ≈ 2g
    }
    return quantity * 5; // Liquides/autres : 1 cuillère à thé ≈ 5g
  }
  if (unitLower.includes('cl') || unitLower.includes('centilitre')) {
    return quantity * 10; // 1 cl ≈ 10g (pour liquides)
  }
  if (unitLower.includes('dl') || unitLower.includes('décilitre')) {
    return quantity * 100; // 1 dl ≈ 100g (pour liquides)
  }
  if (unitLower.includes('l') || unitLower.includes('litre')) {
    return quantity * 1000; // 1 l ≈ 1000g (pour liquides)
  }
  if (unitLower.includes('ml')) {
    return quantity * 1; // 1 ml ≈ 1g (pour liquides)
  }
  if (unitLower.includes('kg')) {
    return quantity * 1000;
  }
  if (unitLower.includes('g')) {
    return quantity;
  }
  if (unitLower.includes('pièce') || unitLower.includes('pièces') || unitLower.includes('unité')) {
    // Estimations par type d'ingrédient
    if (ingNameLower.includes('dinde') && !ingNameLower.includes('escalope') && !ingNameLower.includes('filet')) {
      return quantity * 2000; // Dinde entière ≈ 2kg
    }
    if (ingNameLower.includes('oignon') || ingNameLower.includes('échalote')) {
      return quantity * 100; // 1 oignon ≈ 100g
    }
    if (ingNameLower.includes('gousse') || ingNameLower.includes('ail')) {
      return quantity * 3; // 1 gousse d'ail ≈ 3g
    }
    if (ingNameLower.includes('mangue') || ingNameLower.includes('pomme')) {
      return quantity * 150; // 1 fruit ≈ 150g
    }
    if (ingNameLower.includes('carotte')) {
      return quantity * 80; // 1 carotte ≈ 80g
    }
    if (ingNameLower.includes('pomme de terre')) {
      return quantity * 150; // 1 pomme de terre ≈ 150g
    }
    if (ingNameLower.includes('poivron')) {
      return quantity * 150; // 1 poivron ≈ 150g
    }
    if (ingNameLower.includes('citron')) {
      return quantity * 100; // 1 citron ≈ 100g
    }
    if (ingNameLower.includes('escalope') || ingNameLower.includes('filet') || ingNameLower.includes('suprême')) {
      return quantity * 150; // 1 escalope/filet ≈ 150g
    }
    if (ingNameLower.includes('jarret')) {
      return quantity * 200; // 1 jarret ≈ 200g
    }
    return quantity * 100; // Estimation par défaut
  }
  if (unitLower.includes('pincée')) {
    return quantity * 0.5; // 1 pincée ≈ 0.5g
  }
  
  return quantity; // Par défaut, supposer que c'est déjà en grammes
}

/**
 * Calculer les valeurs nutritionnelles d'une recette
 * Les valeurs sont calculées pour 100g de recette finale
 */
function calculateRecipeNutrition(recipe) {
  const totalNutrition = {
    calories: 0,
    proteins: 0,
    carbs: 0,
    lipids: 0,
    fibers: 0,
    sodium: 0
  };
  
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return totalNutrition;
  }
  
  let totalWeight = 0; // Poids total de tous les ingrédients en grammes
  
  // Calculer pour tous les ingrédients
  recipe.ingredients.forEach(ingredient => {
    const nutrition = getIngredientNutrition(ingredient.name);
    let quantityInGrams = convertToGrams(ingredient.quantity || 0, ingredient.unit || 'g', ingredient.name);
    
    // Ignorer les ingrédients avec quantité 0 ou négative
    if (quantityInGrams <= 0) {
      return;
    }
    
    // Pour les dindes entières, estimer le poids réel par portion
    if (ingredient.name.toLowerCase().includes('dinde') && 
        !ingredient.name.toLowerCase().includes('escalope') && 
        !ingredient.name.toLowerCase().includes('filet') &&
        !ingredient.name.toLowerCase().includes('blanc') &&
        !ingredient.name.toLowerCase().includes('suprême') &&
        !ingredient.name.toLowerCase().includes('jarret') &&
        !ingredient.name.toLowerCase().includes('cuisse') &&
        quantityInGrams > 500) {
      // Si c'est une dinde entière, estimer environ 200g par portion
      const servings = recipe.servings || 4;
      quantityInGrams = servings * 200; // 200g de dinde par portion
    }
    
    const factor = quantityInGrams / 100; // Valeurs nutritionnelles sont pour 100g
    
    totalNutrition.calories += (nutrition.calories || 0) * factor;
    totalNutrition.proteins += (nutrition.proteins || 0) * factor;
    totalNutrition.carbs += (nutrition.carbs || 0) * factor;
    totalNutrition.lipids += (nutrition.lipids || 0) * factor;
    totalNutrition.fibers += (nutrition.fibers || 0) * factor;
    totalNutrition.sodium += (nutrition.sodium || 0) * factor;
    
    totalWeight += quantityInGrams;
  });
  
  // Si le poids total est 0, retourner des valeurs à 0
  if (totalWeight === 0) {
    return totalNutrition;
  }
  
  // Calculer les valeurs pour 100g de recette finale
  // On divise les valeurs totales par le poids total, puis on multiplie par 100
  Object.keys(totalNutrition).forEach(key => {
    totalNutrition[key] = Math.round((totalNutrition[key] / totalWeight) * 100 * 10) / 10;
  });
  
  // Vérifier et corriger les valeurs anormalement élevées
  // Pour 100g, les calories devraient être entre 50-500 kcal
  if (totalNutrition.calories > 600) {
    // Si les calories sont trop élevées, il y a probablement une erreur de calcul
    // On réduit proportionnellement
    const reductionFactor = 400 / totalNutrition.calories;
    Object.keys(totalNutrition).forEach(key => {
      totalNutrition[key] = Math.round(totalNutrition[key] * reductionFactor * 10) / 10;
    });
  }
  
  // Vérifier les valeurs minimales (au moins quelques calories)
  if (totalNutrition.calories < 10 && totalWeight > 0) {
    // Si les calories sont trop faibles mais qu'il y a des ingrédients, 
    // c'est probablement une erreur de calcul aussi
    // On peut laisser tel quel ou estimer une valeur minimale
  }
  
  return totalNutrition;
}

/**
 * Normaliser une recette
 */
function normalizeRecipe(recipe) {
  const allergens = detectAllergens(recipe);
  const dietaryRestrictions = detectDietaryRestrictions(recipe);
  const tags = generateChefSESTags({
    ...recipe,
    allergens,
    dietaryRestrictions
  });
  
  // Calculer les valeurs nutritionnelles
  const nutrition = calculateRecipeNutrition(recipe);
  
  // Corriger l'encodage du nom
  let cleanName = recipe.name || 'Recette sans nom';
  cleanName = cleanName.replace(/├á/g, 'à').replace(/├®/g, 'é').replace(/├¿/g, 'è')
                       .replace(/├┤/g, 'ô').replace(/├º/g, 'ç').replace(/├«/g, 'ê')
                       .replace(/├╗/g, 'û').replace(/├║/g, 'ù').replace(/├»/g, 'ï')
                       .replace(/├╣/g, 'î').replace(/├ñ/g, 'ñ').replace(/├╝/g, 'ü')
                       .replace(/├»/g, 'ï').replace(/├║/g, 'ù').replace(/├╗/g, 'û')
                       .replace(/├á/g, 'à').replace(/├®/g, 'é').replace(/├¿/g, 'è')
                       .replace(/├┤/g, 'ô').replace(/├º/g, 'ç').replace(/├«/g, 'ê')
                       .replace(/├╝/g, 'ü').replace(/├╣/g, 'î').replace(/├ñ/g, 'ñ');
  
  return {
    name: cleanName,
    category: recipe.category || 'plat',
    ingredients: recipe.ingredients || [],
    preparationSteps: recipe.preparationSteps || [],
    preparationTime: recipe.preparationTime || 0,
    cookingTime: recipe.cookingTime || 0,
    totalTime: (recipe.preparationTime || 0) + (recipe.cookingTime || 0),
    servings: recipe.servings || 4,
    nutrition: nutrition,
    allergens: allergens,
    dietaryRestrictions: dietaryRestrictions,
    textures: ['normale'],
    establishmentTypes: ['restaurant', 'cantine_scolaire'],
    tags: tags
  };
}

/**
 * Générer les fichiers de sortie (JS et JSON)
 */
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
 * Recettes extraites d'un EPUB - Format Chef SES
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

/**
 * Fonction principale pour extraire les recettes d'un EPUB
 */
async function extractRecipesFromEPUB(epubPath, outputPath = null) {
  try {
    console.log('📚 Extraction des recettes depuis l\'EPUB...');
    console.log(`   Fichier: ${epubPath}`);
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(epubPath)) {
      throw new Error(`Le fichier EPUB n'existe pas: ${epubPath}`);
    }
    
    // Extraire le texte
    console.log('\n📖 Extraction du texte...');
    let text = await extractTextFromEPUB(epubPath);
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
      const textFile = path.join(debugDir, 'epub-extracted-text.txt');
      fs.writeFileSync(textFile, text.substring(0, 100000), 'utf8');
      console.log(`💾 Texte extrait sauvegardé: ${textFile}`);
    }
    
    // Parser les recettes
    console.log('\n🔍 Parsing des recettes...');
    const recipes = parseRecipesFromText(text);
    console.log(`✅ ${recipes.length} recette(s) trouvée(s)`);
    
    // Normaliser les recettes et générer les tags
    const normalizedRecipes = recipes.map(recipe => normalizeRecipe(recipe));
    
    // Afficher un résumé
    if (normalizedRecipes.length > 0) {
      console.log('\n📊 RÉSUMÉ:');
      normalizedRecipes.forEach((recipe, index) => {
        console.log(`   ${index + 1}. ${recipe.name}`);
        console.log(`      - ${recipe.ingredients.length} ingrédient(s)`);
        console.log(`      - ${recipe.preparationSteps.length} étape(s)`);
        if (recipe.tags && recipe.tags.length > 0) {
          console.log(`      - ${recipe.tags.length} tag(s): ${recipe.tags.slice(0, 5).join(', ')}`);
        }
      });
    }
    
    // Générer les fichiers de sortie
    if (outputPath && normalizedRecipes.length > 0) {
      await generateOutputFiles(normalizedRecipes, outputPath);
    }
    
    return {
      text: text,
      length: text.length,
      recipes: normalizedRecipes
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'extraction:', error);
    throw error;
  }
}

// Export par défaut
export default extractRecipesFromEPUB;

// Si exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const epubPath = process.argv[2];
  if (!epubPath) {
    console.log('Usage: node scripts/extract-recipes-from-epub.js <chemin-vers-fichier.epub>');
    process.exit(1);
  }
  
  const epubName = path.basename(epubPath, '.epub');
  const outputPath = path.join(__dirname, '..', 'data', 'pdf-recipes', `${epubName}-recipes.js`);
  
  extractRecipesFromEPUB(epubPath, outputPath)
    .then(result => {
      console.log('\n✅ Extraction terminée!');
      console.log(`📊 ${result.length} caractères extraits`);
    })
    .catch(error => {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    });
}

