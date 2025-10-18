// controllers/ocrController.js
import Stock from '../models/Stock.js';
import vision from '@google-cloud/vision';
const client = new vision.ImageAnnotatorClient();

const getCategoryFromName = (productName) => {
    const lowerName = productName.toLowerCase();
    if (lowerName.includes('fruit') || lowerName.includes('pomme') || lowerName.includes('banane') || lowerName.includes('fraise')) return 'Fruits';
    if (lowerName.includes('legume') || lowerName.includes('tomate') || lowerName.includes('pomme de terre') || lowerName.includes('aubergine') || lowerName.includes('salade')) return 'Légumes';
    if (lowerName.includes('viande') || lowerName.includes('poulet') || lowerName.includes('boeuf') || lowerName.includes('kefta') || lowerName.includes('jambon') || lowerName.includes('saucisse')) return 'Viandes et Poissons';
    if (lowerName.includes('poisson') || lowerName.includes('thon') || lowerName.includes('saumon') || lowerName.includes('crevette') || lowerName.includes('poulpe')) return 'Viandes et Poissons';
    if (lowerName.includes('lait') || lowerName.includes('fromage') || lowerName.includes('yaourt') || lowerName.includes('beurre') || lowerName.includes('creme')) return 'Produits Laitiers';
    if (lowerName.includes('pain') || lowerName.includes('farine') || lowerName.includes('riz') || lowerName.includes('pates') || lowerName.includes('semoule')) return 'Céréales et Féculents';
    if (lowerName.includes('huile') || lowerName.includes('sel') || lowerName.includes('sucre') || lowerName.includes('epice') || lowerName.includes('vinaigre') || lowerName.includes('moutarde')) return 'Épicerie et Condiments';
    if (lowerName.includes('eau') || lowerName.includes('jus') || lowerName.includes('vin')) return 'Boissons';
    return 'Autres';
};

export const processOcrDeliveryNote = async (req, res) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ message: 'Aucun fichier fourni ou le fichier n\'est pas un buffer.' });
  }

  const fileBuffer = req.file.buffer;

  let detectedItems = []; 

try { // Main try-catch for the whole function
    const image = { content: fileBuffer.toString('base64') };
    const [result] = await client.documentTextDetection({ image: image }); 
    const fullText = result.fullTextAnnotation ? result.fullTextAnnotation.text : '';

    console.log('Texte OCR complet reçu:\n--- DEBUT TEXTE ---\n' + fullText + '\n--- FIN TEXTE ---'); 

    const lines = fullText.split('\n');
    for (const line of lines) {
        // Ignorer les lignes trop courtes ou trop longues
        if (line.trim().length < 5 || line.trim().length > 150) {
            console.log(`🔍 Ligne ignorée (longueur): "${line}"`);
            continue;
        }

        const lowerLine = line.toLowerCase();
        
        // --- NOUVELLE REGEX ULTRA-SIMPLIFIÉE POUR ÉVITER LES SYNTAXERROR ---
        // Cette regex se concentre sur les motifs les plus basiques et courants:
        // Nom (le plus large possible) - Quantité - Unité - (optionnel: x Prix) - (optionnel: = Total)
        // J'ai enlevé les échappements des caractères comme '(' et ')' qui ne sont pas des métacaractères quand utilisés comme littéraux.
        // J'ai aussi simplifié les groupes non-capturants.
        // Groupes:
        // 1: Nom du produit (non-gourmand)
        // 2: Quantité numérique (peut avoir , ou .)
        // 3: (interne décimale qté)
        // 4: Unité (liste exhaustive SANS échappement des caractères littéraux)
        // 5: (groupe x Prix)
        // 6: Prix unitaire (numérique)
        // 7: (interne décimale prix unitaire)
        // 8: (groupe /unité_prix)
        // 9: (groupe = Total)
        // 10: Prix total (numérique)
        // 11: (interne décimale prix total)
        // 12: (unité monétaire total)

const itemPattern = /(.+?)\s+(\d+[,.]\d*|\d+)\s+(kg|g|l|ml|pièce|unité|boîte|conserve|paquet|bouteille|botte|sachet)/i;


        const itemMatch = line.match(itemPattern);

        if (itemMatch) {
            // Re-vérifier l'indexation des groupes de capture avec la nouvelle regex :
            // itemMatch[1] = nom
            // itemMatch[2] = quantité numérique
            // itemMatch[3] = (interne décimale qté)
            // itemMatch[4] = unité
            // itemMatch[5] = (groupe x Prix)
            // itemMatch[6] = prix unitaire
            // itemMatch[7] = (interne décimale prix unitaire)
            // itemMatch[8] = (groupe /unité_prix)
            // itemMatch[9] = (groupe = Total)
            // itemMatch[10] = prix total
            // itemMatch[11] = (interne décimale prix total)
            // itemMatch[12] = (unité monétaire total)

let name = itemMatch[1].trim();
let quantity = parseFloat(itemMatch[2].replace(',', '.'));
let unit = itemMatch[3].toLowerCase();
let price = null; // Simplifié pour MVP
let lineTotal = 0;            
            // Nettoyage du nom: supprime les préfixes courants
            name = name.replace(/^(?:c\)\s*|produit\s*|item\s*|article\s*)/i, '').trim();
            name = name.replace(new RegExp(`\\s*\\d+([,.]?\\d*)\\s*(?:kg|g|l|ml|pièce|unité|boîte|conserve|paquet|bouteille|botte|sachet)$`, 'i'), '').trim();


            // Validation stricte des données extraites :
            if (!name || name.length < 2 || /^\d+([,.]?\d*)?$/.test(name) || !/[a-z0-9]/i.test(name) || 
                isNaN(quantity) || quantity <= 0) 
            {
                console.warn(`⚠️ Ligne matchée mais données invalides (nom/qte): "${name}" Qte:${quantity} Prix:${price}. Ligne: "${line}"`);
                continue; 
            }

            let category = getCategoryFromName(name);

            detectedItems.push({
                name: name,
                quantity: quantity,
                unit: unit,
                category: category,
                price: price, 
                source: 'ocr',
                expirationDate: null, 
                alertThreshold: 0
            });
            console.log(`✅ Article valide détecté: Nom: "${name}", Qte: ${quantity}, Unité: "${unit}", Prix Unitaire: ${price}, Ligne: "${line}"`);
        } else {
            console.log(`🔍 Ligne ignorée (ne correspond pas au format d'article): "${line}"`);
        }
    }
    
    if (detectedItems.length === 0) {
        console.warn('Aucun article structuré détecté sur le bon de livraison par l\'OCR.');
    }    const userId = req.user.id;
    let userStock = await Stock.findOne({ user: userId });
    
    if (!userStock) {
      userStock = new Stock({ user: userId, items: [] });
    }
    
    for (const item of detectedItems) {
      const existingItemIndex = userStock.items.findIndex(
        i => i.name.toLowerCase() === item.name.toLowerCase() && i.unit.toLowerCase() === item.unit.toLowerCase()
      );
      
      if (existingItemIndex !== -1) {
        userStock.items[existingItemIndex].quantity += item.quantity;
        userStock.items[existingItemIndex].updatedAt = Date.now();
        userStock.items[existingItemIndex].source = 'ocr';
        if (item.price !== null && item.price !== undefined) userStock.items[existingItemIndex].price = item.price;
      } else {
        if (item.quantity > 0) { 
            userStock.items.push({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              category: item.category,
              price: item.price,
              source: 'ocr',
              expirationDate: item.expirationDate || null, 
              alertThreshold: item.alertThreshold || 0,
              createdAt: Date.now(),
              updatedAt: Date.now()
            });
        } else {
            console.warn(`Article OCR non ajouté au stock car quantité invalide (<=0): ${item.name} - ${item.quantity}`);
        }
      }
    }
    
    await userStock.save();
    
    res.status(200).json({ success: true, message: 'Bon de livraison analysé et stock mis à jour.', items: detectedItems });
  } catch (error) {
    console.error('Erreur OCR lors du traitement du bon de livraison:', error);
    res.status(500).json({ message: 'Erreur lors du traitement OCR du bon de livraison', error: error.message });
  }
};