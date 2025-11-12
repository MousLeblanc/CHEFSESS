/**
 * Middleware de validation stricte des données utilisateur
 * 
 * Fournit des fonctions de validation pour :
 * - Les IDs MongoDB (ObjectId)
 * - Les emails
 * - Les nombres (entiers, décimaux)
 * - Les chaînes de caractères (longueur, format)
 * - Les tableaux
 * - Les objets
 */

import mongoose from 'mongoose';

/**
 * Valider un ObjectId MongoDB
 */
export function isValidObjectId(id) {
  if (!id || typeof id !== 'string') {
    return false;
  }
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Valider un email
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  // Expression régulière simple mais efficace
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 254; // RFC 5321
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
export function isValidString(value, minLength = 0, maxLength = null, pattern = null) {
  if (typeof value !== 'string') {
    return false;
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength) return false;
  if (maxLength !== null && trimmed.length > maxLength) return false;
  if (pattern && !pattern.test(trimmed)) return false;
  return true;
}

/**
 * Valider un tableau
 */
export function isValidArray(value, minLength = 0, maxLength = null, itemValidator = null) {
  if (!Array.isArray(value)) {
    return false;
  }
  if (value.length < minLength) return false;
  if (maxLength !== null && value.length > maxLength) return false;
  if (itemValidator) {
    return value.every(item => itemValidator(item));
  }
  return true;
}

/**
 * Valider un objet
 */
export function isValidObject(value, requiredFields = [], fieldValidators = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  
  // Vérifier les champs requis
  for (const field of requiredFields) {
    if (!(field in value) || value[field] === null || value[field] === undefined) {
      return false;
    }
  }
  
  // Vérifier les validateurs de champs
  for (const [field, validator] of Object.entries(fieldValidators)) {
    if (field in value && !validator(value[field])) {
      return false;
    }
  }
  
  return true;
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
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
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

/**
 * Middleware de validation pour les requêtes
 * Utilise un schéma de validation défini
 */
export function validateRequest(schema) {
  return (req, res, next) => {
    const errors = [];
    
    // Valider req.body
    if (schema.body) {
      const bodyErrors = validateObject(req.body, schema.body);
      if (bodyErrors.length > 0) {
        errors.push(...bodyErrors.map(e => `body.${e}`));
      }
    }
    
    // Valider req.params
    if (schema.params) {
      const paramsErrors = validateObject(req.params, schema.params);
      if (paramsErrors.length > 0) {
        errors.push(...paramsErrors.map(e => `params.${e}`));
      }
    }
    
    // Valider req.query
    if (schema.query) {
      const queryErrors = validateObject(req.query, schema.query);
      if (queryErrors.length > 0) {
        errors.push(...queryErrors.map(e => `query.${e}`));
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation échouée',
        details: errors
      });
    }
    
    next();
  };
}

/**
 * Valider un objet selon un schéma
 */
function validateObject(obj, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = obj[field];
    
    // Vérifier si le champ est requis
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field}: champ requis`);
      continue;
    }
    
    // Si le champ n'est pas requis et est absent, passer au suivant
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Valider le type
    if (rules.type) {
      const typeValid = validateType(value, rules.type);
      if (!typeValid) {
        errors.push(`${field}: type invalide (attendu: ${rules.type})`);
        continue;
      }
    }
    
    // Valider selon le type
    if (rules.type === 'string') {
      if (!isValidString(value, rules.minLength || 0, rules.maxLength || null, rules.pattern)) {
        errors.push(`${field}: chaîne invalide`);
      }
    } else if (rules.type === 'integer') {
      if (!isValidInteger(value, rules.min, rules.max)) {
        errors.push(`${field}: entier invalide`);
      }
    } else if (rules.type === 'float') {
      if (!isValidFloat(value, rules.min, rules.max)) {
        errors.push(`${field}: nombre décimal invalide`);
      }
    } else if (rules.type === 'email') {
      if (!isValidEmail(value)) {
        errors.push(`${field}: email invalide`);
      }
    } else if (rules.type === 'objectId') {
      if (!isValidObjectId(value)) {
        errors.push(`${field}: ObjectId invalide`);
      }
    } else if (rules.type === 'array') {
      if (!isValidArray(value, rules.minLength || 0, rules.maxLength || null, rules.itemValidator)) {
        errors.push(`${field}: tableau invalide`);
      }
    } else if (rules.type === 'object') {
      if (!isValidObject(value, rules.requiredFields || [], rules.fieldValidators || {})) {
        errors.push(`${field}: objet invalide`);
      }
    }
    
    // Valider avec un validateur personnalisé
    if (rules.validator && typeof rules.validator === 'function') {
      try {
        if (!rules.validator(value)) {
          errors.push(`${field}: validation personnalisée échouée`);
        }
      } catch (error) {
        errors.push(`${field}: erreur de validation: ${error.message}`);
      }
    }
  }
  
  return errors;
}

/**
 * Valider le type d'une valeur
 */
function validateType(value, expectedType) {
  switch (expectedType) {
    case 'string':
      return typeof value === 'string';
    case 'integer':
      return Number.isInteger(typeof value === 'string' ? parseInt(value, 10) : Number(value));
    case 'float':
    case 'number':
      return !isNaN(typeof value === 'string' ? parseFloat(value) : Number(value));
    case 'boolean':
      return typeof value === 'boolean' || value === 'true' || value === 'false';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'email':
      return typeof value === 'string';
    case 'objectId':
      return typeof value === 'string';
    default:
      return true;
  }
}

/**
 * Middleware pour valider et sanitizer les données
 */
export function sanitizeRequest(sanitizers) {
  return (req, res, next) => {
    // Sanitizer req.body
    if (sanitizers.body) {
      req.body = sanitizeObject(req.body, sanitizers.body);
    }
    
    // Sanitizer req.params
    if (sanitizers.params) {
      req.params = sanitizeObject(req.params, sanitizers.params);
    }
    
    // Sanitizer req.query
    if (sanitizers.query) {
      req.query = sanitizeObject(req.query, sanitizers.query);
    }
    
    next();
  };
}

/**
 * Sanitizer un objet selon un schéma
 */
function sanitizeObject(obj, schema) {
  const sanitized = { ...obj };
  
  for (const [field, sanitizer] of Object.entries(schema)) {
    if (field in sanitized) {
      if (typeof sanitizer === 'function') {
        sanitized[field] = sanitizer(sanitized[field]);
      } else if (sanitizer === 'string') {
        sanitized[field] = sanitizeString(sanitized[field]);
      } else if (sanitizer === 'integer') {
        sanitized[field] = sanitizeInteger(sanitized[field]);
      } else if (sanitizer === 'float' || sanitizer === 'number') {
        sanitized[field] = sanitizeNumber(sanitized[field]);
      }
    }
  }
  
  return sanitized;
}

