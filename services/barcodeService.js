// services/barcodeService.js
// Service pour récupérer les informations de produits via code-barres
// Utilise Open Food Facts API (gratuite et open source)
import axios from 'axios';
import Product from '../models/Product.js';
import { calculateYukaScore, formatYukaScore } from './yukaScoreCalculator.js';

/**
 * Recherche dans la base de données interne (MongoDB)
 * @param {string} barcode - Code-barres du produit
 * @returns {Promise<Object>} Informations du produit depuis la base interne
 */
export async function getProductByBarcodeFromDB(barcode) {
  try {
    console.log(`🔍 Recherche dans la base de données interne: ${barcode}`);
    
    const product = await Product.findOne({ barcode: barcode }).populate('supplier', 'name email');
    
    if (!product) {
      return {
        success: false,
        message: 'Produit non trouvé dans la base de données interne'
      };
    }
    
    // Extraire les informations de traçabilité du produit
    const traceabilityInfo = {
      name: product.name,
      brand: product.supplier?.name || '',
      categories: product.category || '',
      barcode: product.barcode,
      
      // Informations de traçabilité depuis le modèle Product
      originCountries: product.traceability?.countryOfOrigin || '',
      manufacturingPlaces: product.traceability?.countryOfOrigin || '',
      batchNumber: product.traceability?.batchNumber || null,
      traceabilityNumber: product.traceability?.traceabilityNumber || '',
      healthStamp: product.traceability?.healthStamp || '',
      commercialPresentation: product.traceability?.commercialPresentation || '',
      qualityLabels: product.traceability?.qualityLabel || { hasLabel: false, labelType: '' },
      productionDate: product.traceability?.productionDate || null,
      useByDate: product.traceability?.useByDate || null,
      bestBeforeDate: product.traceability?.bestBeforeDate || null,
      category: product.traceability?.category || product.category || '',
      class: product.traceability?.class || '',
      
      // Informations supplémentaires
      description: product.description || '',
      price: product.price,
      unit: product.unit,
      
      source: 'Base de données interne',
      sourceUrl: null,
      fromDatabase: true
    };
    
    console.log('✅ Produit trouvé dans la base de données interne');
    
    return {
      success: true,
      data: traceabilityInfo
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la recherche dans la base de données:', error);
    return {
      success: false,
      message: `Erreur base de données: ${error.message}`,
      error: error
    };
  }
}

/**
 * Récupère les informations d'un produit via son code-barres (EAN/UPC)
 * Essaie d'abord la base de données interne, puis Open Food Facts
 * @param {string} barcode - Code-barres du produit (EAN-13, UPC, etc.)
 * @param {boolean} useInternalDB - Chercher d'abord dans la base interne (défaut: true)
 * @returns {Promise<Object>} Informations du produit avec traçabilité
 */
export async function getProductByBarcode(barcode, useInternalDB = true) {
  // 1. Essayer d'abord la base de données interne (si activé)
  if (useInternalDB) {
    const dbResult = await getProductByBarcodeFromDB(barcode);
    if (dbResult.success) {
      console.log('✅ Produit trouvé dans la base de données interne');
      return dbResult;
    }
  }
  
  // 2. Si pas trouvé, essayer Open Food Facts
  try {
    console.log(`🔍 Recherche produit par code-barres: ${barcode}`);
    
    // Open Food Facts API (gratuite, open source)
    const apiUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Chef-SES/1.0 (https://chef-ses.com)'
      }
    });
    
    const data = response.data;
    
    if (data.status === 0 || !data.product) {
      return {
        success: false,
        message: 'Produit non trouvé dans la base de données'
      };
    }
    
    const product = data.product;
    
    // Extraire les informations de traçabilité
    const traceabilityInfo = {
      // Informations de base
      name: product.product_name_fr || product.product_name || product.abbreviated_product_name_fr || '',
      brand: product.brands || '',
      categories: product.categories || '',
      
      // Origine et traçabilité
      origins: product.origins || '',
      originCountries: product.countries || '',
      manufacturingPlaces: product.manufacturing_places || '',
      purchasePlaces: product.purchase_places || '',
      
      // Labels qualité
      labels: product.labels || '',
      labels_tags: product.labels_tags || [],
      qualityLabels: extractQualityLabels(product),
      
      // Dates importantes
      expirationDate: product.expiration_date || null,
      productionDate: null, // Pas toujours disponible dans Open Food Facts
      
      // Informations complémentaires
      packaging: product.packaging || '',
      packagingTags: product.packaging_tags || [],
      stores: product.stores || '',
      
      // Numéro de lot (pas toujours disponible)
      batchNumber: null,
      
      // Code-barres
      barcode: product.code || barcode,
      
      // Informations nutritionnelles (bonus)
      // Open Food Facts utilise nutriscore_grade (sans underscore parfois)
      nutritionGrade: product.nutriscore_grade || product.nutriscore_grade_fr || product.nutrition_grade_fr || product.nutrition_grades_tags?.[0] || product.nutriscore || '',
      novaGroup: product.nova_group || product.nova_groups || product.nova || null,
      
      // Score Yuka (calculé à partir des données nutritionnelles)
      yukaScore: null,
      
      // Images
      imageUrl: product.image_url || product.image_front_url || null,
      
      // Source
      source: 'Open Food Facts',
      sourceUrl: `https://world.openfoodfacts.org/product/${barcode}`
    };
    
    // Calculer le score Yuka (toujours essayer, même avec peu de données)
    // Utiliser les données déjà extraites pour le calcul
    const productForYuka = {
      ...product,
      nutriscore_grade: traceabilityInfo.nutritionGrade || product.nutriscore_grade || product.nutriscore_grade_fr || '',
      nova_group: traceabilityInfo.novaGroup || product.nova_group || product.nova_groups || null
    };
    
    console.log('🔍 Données disponibles pour calcul Yuka:', {
      hasNutriments: !!product.nutriments,
      hasNutriscore: !!product.nutriscore_grade,
      nutritionGrade: traceabilityInfo.nutritionGrade,
      hasNova: !!traceabilityInfo.novaGroup,
      novaGroup: traceabilityInfo.novaGroup,
      hasAdditives: !!(product.additives_tags || product.additives),
      additivesCount: (product.additives_tags || []).length,
      additivesTags: product.additives_tags,
      additivesText: product.additives
    });
    
    // Toujours calculer le score Yuka (même avec peu de données)
    try {
      const yukaData = calculateYukaScore(productForYuka);
      traceabilityInfo.yukaScore = formatYukaScore(yukaData);
      console.log(`📊 Score Yuka calculé: ${yukaData.score}/100 (${yukaData.label})`);
      console.log(`📊 Détails Yuka:`, {
        nutrition: yukaData.details.nutrition.score,
        additives: yukaData.details.additives.score,
        processing: yukaData.details.processing.score,
        badAdditives: yukaData.details.additives.badAdditives?.length || 0
      });
    } catch (error) {
      console.error('❌ Erreur lors du calcul du score Yuka:', error);
      console.error('Stack:', error.stack);
    }
    
    // Ajouter les informations sur les additifs même si le score n'est pas calculé
    if (product.additives_tags || product.additives) {
      traceabilityInfo.additives = {
        tags: product.additives_tags || [],
        text: product.additives || '',
        count: (product.additives_tags || []).length,
        list: product.additives_tags ? product.additives_tags.map(tag => tag.replace(/^(en|fr):/, '')) : []
      };
      console.log(`📊 Additifs détectés: ${traceabilityInfo.additives.count} (${traceabilityInfo.additives.list.join(', ')})`);
    } else {
      console.log('📊 Aucun additif détecté dans les données');
    }
    
    // Ajouter les informations sur les additifs même si le score n'est pas calculé
    if (product.additives_tags || product.additives) {
      traceabilityInfo.additives = {
        tags: product.additives_tags || [],
        text: product.additives || '',
        count: (product.additives_tags || []).length,
        list: product.additives_tags ? product.additives_tags.map(tag => tag.replace(/^(en|fr):/, '')) : []
      };
    }
    
    console.log('✅ Informations récupérées:', traceabilityInfo);
    
    return {
      success: true,
      data: traceabilityInfo
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du produit:', error);
    
    // Gérer les erreurs axios spécifiques
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      if (error.response.status === 404) {
        return {
          success: false,
          message: 'Produit non trouvé dans la base de données Open Food Facts'
        };
      }
      return {
        success: false,
        message: `Erreur API Open Food Facts: ${error.response.status}`,
        error: error
      };
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      return {
        success: false,
        message: 'Impossible de contacter l\'API Open Food Facts',
        error: error
      };
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      return {
        success: false,
        message: `Erreur: ${error.message}`,
        error: error
      };
    }
  }
}

/**
 * Extrait les labels qualité du produit
 * @param {Object} product - Données du produit Open Food Facts
 * @returns {Object} Labels qualité formatés
 */
function extractQualityLabels(product) {
  const labels = {
    hasLabel: false,
    labelType: ''
  };
  
  const labelsTags = product.labels_tags || [];
  const labelsText = (product.labels || '').toLowerCase();
  
  // Détecter les labels qualité
  if (labelsText.includes('bio') || labelsText.includes('organic') || labelsTags.some(tag => tag.includes('organic'))) {
    labels.hasLabel = true;
    labels.labelType = 'AB'; // Agriculture Biologique
  } else if (labelsText.includes('label rouge') || labelsTags.some(tag => tag.includes('label-rouge'))) {
    labels.hasLabel = true;
    labels.labelType = 'Label Rouge';
  } else if (labelsText.includes('aoc') || labelsText.includes('aop') || labelsTags.some(tag => tag.includes('aoc') || tag.includes('aop'))) {
    labels.hasLabel = true;
    labels.labelType = 'AOC';
  } else if (labelsTags.length > 0 || labelsText) {
    labels.hasLabel = true;
    labels.labelType = 'autre';
  }
  
  return labels;
}

/**
 * Recherche alternative via GS1 CodeOnline Search (si disponible)
 * Note: GS1 nécessite généralement une clé API payante
 * @param {string} barcode - Code-barres du produit
 * @param {string} apiKey - Clé API GS1 (optionnelle)
 * @returns {Promise<Object>} Informations du produit depuis GS1
 */
export async function getProductByBarcodeGS1(barcode, apiKey = null) {
  if (!apiKey) {
    console.warn('GS1 API non disponible (clé API requise)');
    return {
      success: false,
      message: 'GS1 API non disponible (clé API requise)'
    };
  }
  
  try {
    console.log(`🔍 Recherche GS1 pour code-barres: ${barcode}`);
    
    // GS1 CodeOnline Search API
    // Documentation: https://developers.gs1.fr/api-codeonline-search
    const apiUrl = `https://api.gs1.fr/v1/products/${barcode}`;
    
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data) {
      const product = response.data;
      
      return {
        success: true,
        data: {
          name: product.productName || product.brandName || '',
          brand: product.brandName || '',
          categories: product.category || '',
          barcode: barcode,
          gtin: product.gtin || barcode,
          netContent: product.netContent || '',
          imageUrl: product.imageUrl || null,
          source: 'GS1 CodeOnline',
          sourceUrl: `https://www.gs1.fr/product/${barcode}`
        }
      };
    }
    
    return {
      success: false,
      message: 'Produit non trouvé dans GS1'
    };
    
  } catch (error) {
    console.error('❌ Erreur GS1 API:', error);
    return {
      success: false,
      message: `Erreur GS1 API: ${error.message}`
    };
  }
}

/**
 * Recherche via Barcodes Database (gratuit avec limitations)
 * @param {string} barcode - Code-barres du produit
 * @returns {Promise<Object>} Informations du produit depuis Barcodes Database
 */
export async function getProductByBarcodeBarcodesDB(barcode) {
  try {
    console.log(`🔍 Recherche Barcodes Database pour code-barres: ${barcode}`);
    
    // Barcodes Database API (gratuite)
    const apiUrl = `https://api.barcodesdatabase.org/v1/product/${barcode}`;
    
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Chef-SES/1.0'
      }
    });
    
    if (response.data && response.data.product) {
      const product = response.data.product;
      
      return {
        success: true,
        data: {
          name: product.name || '',
          brand: product.manufacturer || '',
          categories: product.category || '',
          countryOfOrigin: product.country || '',
          description: product.description || '',
          imageUrl: product.image || null,
          barcode: barcode,
          source: 'Barcodes Database',
          sourceUrl: `https://barcodesdatabase.org/product/${barcode}`
        }
      };
    }
    
    return {
      success: false,
      message: 'Produit non trouvé dans Barcodes Database'
    };
    
  } catch (error) {
    console.error('❌ Erreur Barcodes Database:', error);
    return {
      success: false,
      message: `Erreur Barcodes Database: ${error.message}`
    };
  }
}

/**
 * Recherche multi-sources avec fallback
 * Essaie plusieurs sources dans l'ordre jusqu'à trouver le produit
 * @param {string} barcode - Code-barres du produit
 * @param {Object} options - Options de recherche
 * @returns {Promise<Object>} Informations du produit depuis la première source disponible
 */
export async function getProductByBarcodeMultiSource(barcode, options = {}) {
  const { useGS1 = false, gs1ApiKey = null, useBarcodesDB = false } = options;
  
  // 1. Essayer Open Food Facts (gratuit, source principale)
  console.log('🔍 Tentative 1/3: Open Food Facts...');
  let result = await getProductByBarcode(barcode);
  if (result.success) {
    console.log('✅ Produit trouvé via Open Food Facts');
    return result;
  }
  
  // 2. Essayer GS1 si disponible
  if (useGS1 && gs1ApiKey) {
    console.log('🔍 Tentative 2/3: GS1 CodeOnline...');
    result = await getProductByBarcodeGS1(barcode, gs1ApiKey);
    if (result.success) {
      console.log('✅ Produit trouvé via GS1');
      return result;
    }
  }
  
  // 3. Essayer Barcodes Database
  if (useBarcodesDB) {
    console.log('🔍 Tentative 3/3: Barcodes Database...');
    result = await getProductByBarcodeBarcodesDB(barcode);
    if (result.success) {
      console.log('✅ Produit trouvé via Barcodes Database');
      return result;
    }
  }
  
  // Aucune source n'a trouvé le produit
  return {
    success: false,
    message: 'Produit non trouvé dans les bases de données disponibles'
  };
}

/**
 * Formate les informations pour le formulaire de réception
 * @param {Object} productInfo - Informations du produit depuis Open Food Facts
 * @returns {Object} Données formatées pour le formulaire
 */
export function formatForDeliveryReceipt(productInfo) {
  if (!productInfo.success || !productInfo.data) {
    return null;
  }
  
  const data = productInfo.data;
  
  return {
    productIdentification: {
      name: data.name,
      referenceNumber: data.barcode,
      commercialPresentation: detectCommercialPresentation(data),
      source: data.manufacturingPlaces || data.origins || '',
      countryOfOrigin: extractCountryOfOrigin(data),
      batchNumber: data.batchNumber || '',
      healthStamp: ''
    },
    productLabelling: {
      totalTraceability: !!data.origins || !!data.manufacturingPlaces,
      qualityLabel: data.qualityLabels,
      category: data.categories?.split(',')[0]?.trim() || '',
      class: '',
      productionDate: data.productionDate || null,
      useByDate: data.expirationDate ? new Date(data.expirationDate) : null,
      bestBeforeDate: null,
      coreTemperature: null,
      netWeightAtPacking: null,
      numberOfPieces: null
    }
  };
}

/**
 * Détecte la présentation commerciale depuis les données
 */
function detectCommercialPresentation(data) {
  const packaging = (data.packaging || '').toLowerCase();
  const packagingTags = data.packagingTags || [];
  
  if (packaging.includes('frozen') || packaging.includes('surgelé') || packagingTags.some(tag => tag.includes('frozen'))) {
    return 'surgelé';
  }
  if (packaging.includes('refrigerated') || packaging.includes('réfrigéré') || packagingTags.some(tag => tag.includes('refrigerated'))) {
    return 'réfrigéré';
  }
  if (packaging.includes('canned') || packaging.includes('conserve') || packagingTags.some(tag => tag.includes('canned'))) {
    return 'conserve';
  }
  if (packaging.includes('4th range') || packaging.includes('4ème gamme')) {
    return '4ème gamme';
  }
  if (packaging.includes('5th range') || packaging.includes('5ème gamme')) {
    return '5ème gamme';
  }
  
  return 'autre';
}

/**
 * Extrait le pays d'origine
 */
function extractCountryOfOrigin(data) {
  // Priorité: manufacturing_places > origins > countries
  if (data.manufacturingPlaces) {
    const places = data.manufacturingPlaces.split(',');
    return places[0].trim();
  }
  if (data.origins) {
    const origins = data.origins.split(',');
    return origins[0].trim();
  }
  if (data.originCountries) {
    const countries = data.originCountries.split(',');
    return countries[0].trim();
  }
  return '';
}

