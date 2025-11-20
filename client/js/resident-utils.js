/**
 * Utilitaires pour la gestion des résidents
 * Centralise les fonctions réutilisables pour éviter les duplications
 */

(function() {
  'use strict';

/**
 * Obtient la taille de portion normalisée d'un résident
 * Selon le modèle Resident, portionSize est au niveau racine : 0.5, 1, ou 2
 * @param {Object} resident - L'objet résident
 * @returns {number} - La taille de portion (0.5, 1, ou 2), par défaut 1
 */
function getPortionSize(resident) {
  if (!resident) return 1;
  
  // ✅ NORMALISÉ : Utiliser uniquement resident.portionSize (selon le modèle)
  const portionSize = resident.portionSize;
  
  // Valider que c'est une valeur valide (0.5, 1, ou 2)
  if (portionSize === 0.5 || portionSize === 1 || portionSize === 2) {
    return portionSize;
  }
  
  // Si la valeur est null/undefined ou invalide, retourner la valeur par défaut
  return 1;
}

/**
 * Calcule le multiplicateur de portion équivalente
 * - 0.5 (demi-portion) = 0.5 portions équivalentes
 * - 1 (portion normale) = 1 portion équivalente
 * - 2 (double portion) = 1.5 portions équivalentes (×1.5)
 * @param {number} portionSize - La taille de portion (0.5, 1, ou 2)
 * @returns {number} - Le multiplicateur de portions équivalentes
 */
function calculatePortionEquivalent(portionSize) {
  if (portionSize === 0.5) return 0.5;
  if (portionSize === 2) return 1.5; // Double portion = ×1.5
  return 1; // Portion normale ou valeur par défaut
}

/**
 * Calcule le total de portions équivalentes pour un tableau de résidents
 * @param {Array} residents - Tableau de résidents
 * @returns {number} - Total de portions équivalentes
 */
function calculateTotalPortions(residents) {
  if (!Array.isArray(residents)) return 0;
  
  return residents.reduce((total, resident) => {
    const portionSize = getPortionSize(resident);
    return total + calculatePortionEquivalent(portionSize);
  }, 0);
}

/**
 * Compte les résidents par type de portion
 * @param {Array} residents - Tableau de résidents
 * @returns {Object} - { normal: number, demi: number, double: number }
 */
function countResidentsByPortion(residents) {
  if (!Array.isArray(residents)) return { normal: 0, demi: 0, double: 0 };
  
  let normal = 0, demi = 0, dbl = 0;
  residents.forEach(resident => {
    const portionSize = getPortionSize(resident);
    if (portionSize === 2) dbl++; // Double portion
    else if (portionSize === 0.5) demi++; // Demi-portion
    else normal++; // Portion normale (1 ou valeur par défaut)
  });
  
  return { normal, demi, double: dbl };
}

/**
 * Normalise le nom d'un allergène pour éviter les doublons
 * @param {string} name - Nom de l'allergène
 * @returns {string} - Nom normalisé
 */
function normalizeAllergen(name) {
  const normalized = String(name).toLowerCase().trim();
  const variants = {
    'oeufs': 'oeufs', 'oeuf': 'oeufs', 'eggs': 'oeufs',
    'arachides': 'arachides', 'peanuts': 'arachides',
    'fruits_a_coque': 'fruits_a_coque', 'nuts': 'fruits_a_coque', 'noix': 'fruits_a_coque',
    'soja': 'soja', 'soy': 'soja',
    'poisson': 'poisson', 'fish': 'poisson',
    'crustaces': 'crustaces', 'shellfish': 'crustaces',
    'mollusques': 'mollusques', 'molluscs': 'mollusques',
    'celeri': 'celeri', 'celery': 'celeri',
    'moutarde': 'moutarde', 'mustard': 'moutarde',
    'gluten': 'gluten',
    'lactose': 'lactose',
    'sesame': 'sesame',
    'sulfites': 'sulfites',
    'lupin': 'lupin'
  };
  return variants[normalized] || normalized;
}

/**
 * Extrait le siteId d'un résident (peut être un objet ou une string)
 * @param {Object} resident - L'objet résident
 * @returns {string|null} - Le siteId sous forme de string, ou null
 */
function getResidentSiteId(resident) {
  if (!resident || !resident.siteId) return null;
  return resident.siteId._id ? String(resident.siteId._id) : String(resident.siteId);
}

/**
 * Filtre les résidents par siteId et statut (double sécurité côté client)
 * Le backend devrait déjà filtrer, mais cette fonction ajoute une couche de sécurité
 * @param {Array} residents - Tableau de résidents
 * @param {string|Object} siteId - L'ID du site (peut être string ou ObjectId)
 * @param {string} status - Le statut à filtrer (par défaut 'actif')
 * @returns {Array} - Résidents filtrés
 */
function filterResidentsBySiteAndStatus(residents, siteId, status = 'actif') {
  if (!Array.isArray(residents)) return [];
  
  const siteIdStr = String(siteId);
  
  return residents.filter(r => {
    // Vérifier le statut
    const residentStatus = r.status ? String(r.status).toLowerCase().trim() : '';
    if (residentStatus !== status.toLowerCase()) {
      return false;
    }
    
    // Vérifier que le résident appartient bien à ce site
    const residentSiteId = getResidentSiteId(r);
    if (!residentSiteId || residentSiteId !== siteIdStr) {
      return false;
    }
    
    return true;
  });
}

/**
 * Charge les résidents actifs d'un site depuis l'API
 * @param {string|Object} siteId - L'ID du site
 * @param {Object} options - Options de chargement
 * @param {boolean} options.filterActive - Filtrer uniquement les résidents actifs (défaut: true)
 * @param {number} options.limit - Limite de résultats (défaut: 1000)
 * @param {boolean} options.clientSideFilter - Appliquer un filtrage côté client supplémentaire (défaut: true)
 * @returns {Promise<Array>} - Tableau de résidents
 */
async function loadActiveResidents(siteId, options = {}) {
  const {
    filterActive = true,
    limit = 1000,
    clientSideFilter = true
  } = options;
  
  try {
    // Construire l'URL avec les paramètres
    let url = `/api/residents/site/${siteId}`;
    const params = new URLSearchParams();
    if (filterActive) {
      params.append('status', 'actif');
    }
    if (limit) {
      params.append('limit', limit.toString());
    }
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    // Appel API
    const response = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Parser la réponse de manière sécurisée
    let data;
    if (typeof safeAPIParse === 'function') {
      const parsed = await safeAPIParse(response, {
        required: ['success', 'data'],
        types: { success: 'boolean', data: 'object' }
      });
      if (!parsed.success) {
        console.warn('⚠️ [loadActiveResidents] Réponse API invalide:', parsed.error);
        return [];
      }
      data = parsed.data;
    } else {
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Erreur inconnue');
        console.warn(`⚠️ [loadActiveResidents] Erreur HTTP ${response.status}:`, errorText);
        return [];
      }
      data = await response.json();
    }
    
    // Extraire les résidents
    const allResidents = Array.isArray(data?.data) ? data.data : [];
    
    // Filtrage côté client supplémentaire (double sécurité)
    if (clientSideFilter && filterActive) {
      return filterResidentsBySiteAndStatus(allResidents, siteId, 'actif');
    }
    
    return allResidents;
  } catch (error) {
    console.error('❌ [loadActiveResidents] Erreur:', error);
    return [];
  }
}

/**
 * Formate le nom d'un allergène pour l'affichage
 * @param {string} allergen - Nom de l'allergène (normalisé)
 * @returns {string} - Nom formaté pour l'affichage
 */
function formatAllergenName(allergen) {
  const names = {
    'gluten': 'Gluten', 'lactose': 'Lactose', 'oeufs': 'Œufs', 'oeuf': 'Œufs', 'eggs': 'Œufs',
    'arachides': 'Arachides', 'peanuts': 'Arachides', 'fruits_a_coque': 'Fruits à coque', 
    'nuts': 'Fruits à coque', 'noix': 'Fruits à coque', 'soja': 'Soja', 'soy': 'Soja', 
    'poisson': 'Poisson', 'fish': 'Poisson', 'crustaces': 'Crustacés', 'shellfish': 'Crustacés', 
    'mollusques': 'Mollusques', 'molluscs': 'Mollusques', 'celeri': 'Céleri', 'celery': 'Céleri', 
    'moutarde': 'Moutarde', 'mustard': 'Moutarde', 'sesame': 'Sésame', 'sulfites': 'Sulfites', 
    'lupin': 'Lupin'
  };
  return names[allergen.toLowerCase()] || allergen.charAt(0).toUpperCase() + allergen.slice(1);
}

/**
 * Formate le nom d'une restriction pour l'affichage
 * @param {string} restriction - Nom de la restriction
 * @returns {string} - Nom formaté pour l'affichage
 */
function formatRestrictionName(restriction) {
  const names = {
    'vegetarien': 'Végétarien', 'vegan': 'Végan', 'sans_gluten': 'Sans gluten',
    'gluten_free': 'Sans gluten', 'sans_lactose': 'Sans lactose', 'lactose_free': 'Sans lactose',
    'halal': 'Halal', 'casher': 'Casher', 'kosher': 'Casher', 'sans_porc': 'Sans porc', 
    'no_pork': 'Sans porc', 'sans_viande_rouge': 'Sans viande rouge', 'no_red_meat': 'Sans viande rouge', 
    'sans_sel': 'Sans sel', 'salt_free': 'Sans sel', 'hyposode': 'Hyposodé', 
    'pauvre_en_sucre': 'Pauvre en sucre', 'low_sugar': 'Pauvre en sucre',
    'diabetique': 'Diabétique', 'diabetic': 'Diabétique'
  };
  return names[restriction.toLowerCase()] || restriction.charAt(0).toUpperCase() + restriction.slice(1);
}

  // Export pour utilisation globale
  if (typeof window !== 'undefined') {
    window.ResidentUtils = {
      getPortionSize,
      calculatePortionEquivalent,
      calculateTotalPortions,
      countResidentsByPortion,
      normalizeAllergen,
      getResidentSiteId,
      filterResidentsBySiteAndStatus,
      loadActiveResidents,
      formatAllergenName,
      formatRestrictionName
    };
  }
})();

