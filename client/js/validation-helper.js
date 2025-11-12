/**
 * Helper de validation stricte des données utilisateur côté client
 * 
 * Fournit des fonctions de validation pour :
 * - Le parsing JSON sécurisé
 * - La validation de format
 * - La sanitization des données
 */

/**
 * Parser JSON de manière sécurisée avec validation
 */
export function safeJSONParse(jsonString, defaultValue = null, validator = null) {
  if (!jsonString || typeof jsonString !== 'string') {
    return defaultValue;
  }
  
  try {
    const parsed = JSON.parse(jsonString);
    
    // Si un validateur est fourni, valider les données parsées
    if (validator && typeof validator === 'function') {
      if (!validator(parsed)) {
        console.warn('⚠️ Validation échouée pour les données parsées:', parsed);
        return defaultValue;
      }
    }
    
    return parsed;
  } catch (error) {
    console.error('❌ Erreur lors du parsing JSON:', error.message);
    console.error('   Données:', jsonString.substring(0, 100));
    return defaultValue;
  }
}

/**
 * Valider un ObjectId MongoDB (format 24 caractères hexadécimaux)
 */
export function isValidObjectId(id) {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return /^[0-9a-fA-F]{24}$/.test(id.trim());
}

/**
 * Valider un email
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

/**
 * Valider un nombre entier
 */
export function isValidInteger(value, min = null, max = null) {
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  if (isNaN(num) || !Number.isInteger(num)) {
    return false;
  }
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
}

/**
 * Valider un nombre décimal
 */
export function isValidFloat(value, min = null, max = null) {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num) || !isFinite(num)) {
    return false;
  }
  if (min !== null && num < min) return false;
  if (max !== null && num > max) return false;
  return true;
}

/**
 * Valider une chaîne de caractères
 */
export function isValidString(value, minLength = 0, maxLength = null) {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength) return false;
  if (maxLength !== null && trimmed.length > maxLength) return false;
  return true;
}

/**
 * Valider un tableau
 */
export function isValidArray(value, minLength = 0, maxLength = null) {
  if (!Array.isArray(value)) {
    return false;
  }
  if (value.length < minLength) return false;
  if (maxLength !== null && value.length > maxLength) return false;
  return true;
}

/**
 * Valider un objet utilisateur depuis sessionStorage/localStorage
 */
export function validateUserObject(user) {
  if (!user || typeof user !== 'object') {
    return false;
  }
  
  // Vérifier les champs essentiels
  if (!user.id && !user._id) {
    return false;
  }
  
  if (!user.email || !isValidEmail(user.email)) {
    return false;
  }
  
  if (!user.role || typeof user.role !== 'string') {
    return false;
  }
  
  return true;
}

/**
 * Récupérer et valider l'utilisateur depuis sessionStorage/localStorage
 */
export function getStoredUser() {
  try {
    const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!storedUser) {
      return null;
    }
    
    const user = safeJSONParse(storedUser, null, validateUserObject);
    if (!user) {
      console.warn('⚠️ Données utilisateur invalides dans le stockage');
      // Nettoyer les données invalides
      sessionStorage.removeItem('user');
      localStorage.removeItem('user');
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
}

/**
 * Valider une réponse API
 */
export function validateAPIResponse(response, expectedStructure = null) {
  if (!response || typeof response !== 'object') {
    return { valid: false, error: 'Réponse invalide: pas un objet' };
  }
  
  // Vérifier la structure de base
  if (expectedStructure) {
    for (const field of expectedStructure.required || []) {
      if (!(field in response)) {
        return { valid: false, error: `Champ requis manquant: ${field}` };
      }
    }
    
    // Valider les types si spécifiés
    if (expectedStructure.types) {
      for (const [field, expectedType] of Object.entries(expectedStructure.types)) {
        if (field in response) {
          const actualType = typeof response[field];
          if (actualType !== expectedType) {
            return { valid: false, error: `Type invalide pour ${field}: attendu ${expectedType}, reçu ${actualType}` };
          }
        }
      }
    }
  }
  
  return { valid: true };
}

/**
 * Parser une réponse API de manière sécurisée
 */
export async function safeAPIParse(response, expectedStructure = null) {
  if (!response || !response.ok) {
    return {
      success: false,
      error: response?.statusText || 'Erreur de réponse',
      status: response?.status || 0
    };
  }
  
  try {
    const text = await response.text();
    if (!text) {
      return {
        success: false,
        error: 'Réponse vide'
      };
    }
    
    const data = safeJSONParse(text, null);
    if (!data) {
      return {
        success: false,
        error: 'Impossible de parser la réponse JSON'
      };
    }
    
    // Valider la structure si fournie
    if (expectedStructure) {
      const validation = validateAPIResponse(data, expectedStructure);
      if (!validation.valid) {
        console.warn('⚠️ Structure de réponse invalide:', validation.error);
        return {
          success: false,
          error: validation.error,
          data: data // Retourner quand même les données pour debugging
        };
      }
    }
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('❌ Erreur lors du parsing de la réponse API:', error);
    return {
      success: false,
      error: error.message || 'Erreur inconnue'
    };
  }
}

/**
 * Sanitizer : Nettoyer une chaîne de caractères
 */
export function sanitizeString(value, maxLength = null) {
  if (typeof value !== 'string') {
    return '';
  }
  let cleaned = value.trim();
  
  // Supprimer les caractères de contrôle (sauf \n, \r, \t)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Limiter la longueur
  if (maxLength !== null && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  
  return cleaned;
}

/**
 * Sanitizer : Nettoyer un nombre
 */
export function sanitizeNumber(value, defaultValue = 0, min = null, max = null) {
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value);
  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }
  if (min !== null && num < min) return min;
  if (max !== null && num > max) return max;
  return num;
}

/**
 * Sanitizer : Nettoyer un entier
 */
export function sanitizeInteger(value, defaultValue = 0, min = null, max = null) {
  const num = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  if (isNaN(num) || !Number.isInteger(num)) {
    return defaultValue;
  }
  if (min !== null && num < min) return min;
  if (max !== null && num > max) return max;
  return num;
}

// Exposer les fonctions globalement pour faciliter l'utilisation
if (typeof window !== 'undefined') {
  window.safeJSONParse = safeJSONParse;
  window.getStoredUser = getStoredUser;
  window.validateAPIResponse = validateAPIResponse;
  window.safeAPIParse = safeAPIParse;
  window.isValidObjectId = isValidObjectId;
  window.isValidEmail = isValidEmail;
  window.isValidInteger = isValidInteger;
  window.isValidFloat = isValidFloat;
  window.sanitizeString = sanitizeString;
  window.sanitizeNumber = sanitizeNumber;
  window.sanitizeInteger = sanitizeInteger;
}

