# ✅ Validation stricte des données utilisateur - Guide d'implémentation

## 📋 Résumé

**Date**: 2025-01-28  
**Objectif**: Implémenter une validation stricte des données utilisateur côté client et backend pour prévenir les erreurs et les attaques.

---

## ✅ Implémentation

### **1. Backend - Middleware de validation**

#### **Fichier**: `middleware/validationMiddleware.js`

Le middleware fournit des fonctions de validation et de sanitization pour :
- ✅ ObjectIds MongoDB
- ✅ Emails
- ✅ Nombres (entiers, décimaux)
- ✅ Chaînes de caractères (longueur, format)
- ✅ Tableaux
- ✅ Objets

#### **Fonctions principales** :

```javascript
// Validation
isValidObjectId(id)
isValidEmail(email)
isValidInteger(value, min, max)
isValidFloat(value, min, max)
isValidString(value, minLength, maxLength, pattern)
isValidArray(value, minLength, maxLength, itemValidator)
isValidObject(value, requiredFields, fieldValidators)

// Sanitization
sanitizeString(value, maxLength)
sanitizeNumber(value, defaultValue, min, max)
sanitizeInteger(value, defaultValue, min, max)

// Middleware de validation
validateRequest(schema)
sanitizeRequest(sanitizers)
```

### **2. Frontend - Helper de validation**

#### **Fichier**: `client/js/validation-helper.js`

Le helper fournit des fonctions de validation côté client pour :
- ✅ Parsing JSON sécurisé avec validation
- ✅ Validation de format (ObjectId, email, nombres, chaînes)
- ✅ Validation des réponses API
- ✅ Sanitization des données

#### **Fonctions principales** :

```javascript
// Parsing sécurisé
safeJSONParse(jsonString, defaultValue, validator)
getStoredUser() // Récupère et valide l'utilisateur depuis le stockage

// Validation
isValidObjectId(id)
isValidEmail(email)
isValidInteger(value, min, max)
isValidFloat(value, min, max)
isValidString(value, minLength, maxLength)

// Validation des réponses API
validateAPIResponse(response, expectedStructure)
safeAPIParse(response, expectedStructure)

// Sanitization
sanitizeString(value, maxLength)
sanitizeNumber(value, defaultValue, min, max)
sanitizeInteger(value, defaultValue, min, max)
```

### **3. Intégration dans le code**

#### **Frontend (`client/ehpad-dashboard.html`)** :

**Avant** :
```javascript
const storedUser = sessionStorage.getItem('user');
const user = JSON.parse(storedUser); // ❌ Pas de validation
const siteId = user?.siteId; // ❌ Pas de validation du format
```

**Après** :
```javascript
// ✅ Validation stricte
const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
if (!user) return;

const siteId = user?.siteId;
if (!siteId || (typeof isValidObjectId === 'function' && !isValidObjectId(siteId))) {
  console.warn('⚠️ SiteId invalide ou manquant');
  return;
}
```

**Avant** :
```javascript
const data = await resp.json(); // ❌ Pas de validation de la réponse
const residents = data?.data || [];
```

**Après** :
```javascript
// ✅ Validation de la réponse API
let data;
if (typeof safeAPIParse === 'function') {
  const parsed = await safeAPIParse(resp, {
    required: ['success', 'data'],
    types: { success: 'boolean', data: 'object' }
  });
  if (!parsed.success) {
    console.warn('⚠️ Réponse API invalide:', parsed.error);
    return;
  }
  data = parsed.data;
} else {
  if (!resp.ok) return;
  data = await resp.json();
}
```

#### **Backend (`controllers/residentController.js`)** :

**Avant** :
```javascript
export async function createResident(req, res) {
  const { siteId, groupId, firstName, lastName } = req.body;
  if (!finalSiteId) {
    return res.status(400).json({ message: 'Site ID requis' });
  }
  // ...
}
```

**Après** :
```javascript
export async function createResident(req, res) {
  const { siteId, groupId, firstName, lastName } = req.body;
  
  // ✅ Validation stricte des champs obligatoires
  if (!firstName || !isValidString(firstName, 1, 100)) {
    return res.status(400).json({ 
      success: false,
      message: 'Prénom requis et doit être une chaîne valide (1-100 caractères)' 
    });
  }
  
  // ✅ Sanitization
  req.body.firstName = sanitizeString(firstName, 100);
  
  // ✅ Validation de l'ObjectId
  if (!finalSiteId || !isValidObjectId(finalSiteId)) {
    return res.status(400).json({ 
      success: false,
      message: 'Site ID requis et doit être un ObjectId valide' 
    });
  }
  // ...
}
```

#### **Backend (`controllers/orderController.js`)** :

**Avant** :
```javascript
if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
  throw new Error('Fournisseur et articles requis');
}
```

**Après** :
```javascript
// ✅ Validation stricte
if (!supplier || (typeof supplier !== 'string' && !isValidObjectId(supplier))) {
  throw new Error('Fournisseur requis et doit être un ID ou un nom valide');
}

if (!items || !isValidArray(items, 1, 100)) {
  throw new Error('Articles requis et doivent être un tableau non vide (max 100 articles)');
}

// ✅ Validation de chaque article
for (let i = 0; i < items.length; i++) {
  const item = items[i];
  if (!item.productId || !isValidObjectId(item.productId)) {
    throw new Error(`Article ${i + 1}: productId invalide`);
  }
  if (!item.quantity || !isValidInteger(item.quantity, 1, 10000)) {
    throw new Error(`Article ${i + 1}: quantité invalide`);
  }
  items[i].quantity = sanitizeInteger(item.quantity, 1, 1, 10000);
}
```

---

## 🔧 Contrôleurs protégés

### **Contrôleurs avec validation stricte** :
- ✅ `controllers/residentController.js` - `createResident`, `updateResident`
- ✅ `controllers/orderController.js` - `createOrder`

### **Contrôleurs à protéger** (à faire) :
- ⏳ `controllers/productController.js` - `createProduct`, `updateProduct`
- ⏳ `controllers/stockController.js` - `addItemToStock`, `updateStockItem`
- ⏳ `controllers/authController.js` - `register`, `login`
- ⏳ Tous les autres contrôleurs qui acceptent des données utilisateur

---

## 📝 Exemples d'utilisation

### **Exemple 1 : Validation d'un schéma complet**

```javascript
import { validateRequest } from '../middleware/validationMiddleware.js';

const createResidentSchema = {
  body: {
    firstName: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    lastName: { type: 'string', required: true, minLength: 1, maxLength: 100 },
    siteId: { type: 'objectId', required: false },
    roomNumber: { type: 'string', required: false, maxLength: 20 }
  }
};

router.post('/', protect, csrfProtection, validateRequest(createResidentSchema), createResident);
```

### **Exemple 2 : Sanitization automatique**

```javascript
import { sanitizeRequest } from '../middleware/validationMiddleware.js';

const sanitizers = {
  body: {
    firstName: 'string',
    lastName: 'string',
    quantity: 'integer'
  }
};

router.post('/', protect, csrfProtection, sanitizeRequest(sanitizers), createResident);
```

### **Exemple 3 : Validation côté client**

```javascript
// Dans un formulaire
const formData = {
  firstName: document.getElementById('first-name').value,
  lastName: document.getElementById('last-name').value,
  quantity: document.getElementById('quantity').value
};

// Valider avant envoi
if (!isValidString(formData.firstName, 1, 100)) {
  showToast('Prénom invalide', 'error');
  return;
}

if (!isValidInteger(formData.quantity, 1, 1000)) {
  showToast('Quantité invalide (1-1000)', 'error');
  return;
}

// Sanitizer avant envoi
formData.firstName = sanitizeString(formData.firstName, 100);
formData.quantity = sanitizeInteger(formData.quantity, 1, 1, 1000);
```

---

## 🎯 Bénéfices

### **Sécurité** :
- ✅ Prévention des injections (SQL, NoSQL, XSS)
- ✅ Validation des types de données
- ✅ Limitation de la taille des données
- ✅ Sanitization des entrées utilisateur

### **Robustesse** :
- ✅ Gestion d'erreurs améliorée
- ✅ Messages d'erreur clairs
- ✅ Prévention des erreurs de parsing
- ✅ Validation des réponses API

### **Maintenabilité** :
- ✅ Code réutilisable
- ✅ Validation centralisée
- ✅ Schémas de validation déclaratifs
- ✅ Facile à tester

---

## 🚀 Prochaines étapes

1. ✅ Créer le middleware de validation backend
2. ✅ Créer le helper de validation frontend
3. ✅ Intégrer dans `ehpad-dashboard.html`
4. ✅ Appliquer dans `residentController.js`
5. ✅ Appliquer dans `orderController.js`
6. ⏳ Appliquer dans tous les autres contrôleurs
7. ⏳ Créer des schémas de validation réutilisables
8. ⏳ Ajouter des tests unitaires pour la validation

---

**Fin du guide**

