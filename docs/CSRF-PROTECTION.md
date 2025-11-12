# 🔒 Protection CSRF - Guide d'implémentation

## 📋 Résumé

**Date**: 2025-01-28  
**Objectif**: Implémenter une protection CSRF complète pour toutes les requêtes POST/PUT/DELETE/PATCH.

---

## ✅ Implémentation

### **1. Backend - Middleware CSRF**

#### **Fichier**: `middleware/csrfMiddleware.js`

Le middleware utilise le **Double Submit Cookie Pattern** :
- Le token CSRF est stocké dans un cookie HttpOnly (`csrf-token`)
- Le même token doit être envoyé dans le header `X-CSRF-Token`
- Le serveur compare les deux valeurs

**Avantages** :
- ✅ Compatible avec les cookies HttpOnly
- ✅ Pas besoin de session serveur (stateless)
- ✅ Protection efficace contre les attaques CSRF

#### **Fonctions principales** :

```javascript
// Générer un token CSRF pour un utilisateur
generateCSRFToken(userId)

// Vérifier un token CSRF
verifyCSRFToken(userId, token)

// Middleware de protection (à utiliser sur les routes POST/PUT/DELETE)
csrfProtection

// Middleware pour générer le token (à utiliser sur les routes GET)
generateCSRFTokenMiddleware
```

### **2. Backend - Intégration dans les routes**

#### **Routes protégées** (déjà implémentées) :
- ✅ `routes/orderRoutes.js` - POST, PUT
- ✅ `routes/productRoutes.js` - POST, PUT, DELETE
- ✅ `routes/residentRoutes.js` - POST, PUT, DELETE
- ✅ `routes/stockRoutes.js` - POST, PUT, DELETE
- ✅ `routes/customMenuRoutes.js` - POST

#### **Exemple d'utilisation** :

```javascript
import { csrfProtection } from '../middleware/csrfMiddleware.js';

// Route POST protégée
router.post('/', protect, csrfProtection, createOrder);

// Route PUT protégée
router.put('/:id', protect, csrfProtection, updateProduct);

// Route DELETE protégée
router.delete('/:id', protect, csrfProtection, deleteResident);
```

**⚠️ Important** : Le middleware `csrfProtection` doit être placé **après** `protect` car il a besoin de `req.user`.

### **3. Backend - Génération du token**

Le token CSRF est généré automatiquement :
- ✅ Lors de la connexion (`controllers/authController.js` - `login`)
- ✅ Lors de l'inscription (`controllers/authController.js` - `register`)
- ✅ Lors de la vérification d'authentification (`controllers/authController.js` - `getMe`)
- ✅ Pour toutes les requêtes GET via `generateCSRFTokenMiddleware` (dans `server.js`)

Le token est envoyé dans :
- Un cookie HttpOnly (`csrf-token`)
- Un header de réponse (`X-CSRF-Token`) - lisible par JavaScript

### **4. Frontend - Helper CSRF**

#### **Fichier**: `client/js/csrf-helper.js`

Le helper fournit :
- ✅ Extraction automatique du token depuis les headers de réponse
- ✅ Fonction `fetchWithCSRF()` pour remplacer `fetch()` avec protection CSRF automatique
- ✅ Auto-initialisation au chargement de la page

#### **Utilisation côté client** :

```javascript
// Option 1 : Utiliser fetchWithCSRF (recommandé)
import { fetchWithCSRF } from './js/csrf-helper.js';

// Les requêtes POST/PUT/DELETE incluront automatiquement le token CSRF
const response = await fetchWithCSRF('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(orderData)
});

// Option 2 : Ajouter manuellement le header
import { getCSRFToken } from './js/csrf-helper.js';

const token = getCSRFToken();
const response = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token
  },
  credentials: 'include',
  body: JSON.stringify(orderData)
});
```

### **5. Frontend - Intégration dans les dashboards**

#### **Fichier**: `client/ehpad-dashboard.html`

Le helper CSRF est chargé automatiquement :

```html
<!-- 🔒 Helper CSRF (doit être chargé avant les autres scripts qui font des requêtes) -->
<script type="module" src="js/csrf-helper.js"></script>
```

**⚠️ Important** : Le helper doit être chargé **avant** les autres scripts qui font des requêtes POST/PUT/DELETE.

---

## 🔧 Routes à protéger (à faire progressivement)

### **Routes critiques** (déjà protégées) :
- ✅ `/api/orders` - POST, PUT
- ✅ `/api/products` - POST, PUT, DELETE
- ✅ `/api/residents` - POST, PUT, DELETE
- ✅ `/api/stock` - POST, PUT, DELETE
- ✅ `/api/menu/generate-custom` - POST

### **Routes à protéger** (à faire) :
- ⏳ `/api/messages` - POST
- ⏳ `/api/sites` - POST, PUT, DELETE
- ⏳ `/api/groups` - POST, PUT, DELETE
- ⏳ `/api/foodcost` - POST, PUT, DELETE
- ⏳ `/api/users` - PUT, DELETE
- ⏳ Toutes les autres routes POST/PUT/DELETE

**Pour ajouter la protection** :
1. Importer `csrfProtection` dans le fichier de routes
2. Ajouter `csrfProtection` après `protect` sur les routes POST/PUT/DELETE
3. Mettre à jour le code client pour utiliser `fetchWithCSRF()` ou ajouter le header manuellement

---

## 🧪 Tests

### **Test de protection CSRF** :

1. **Test 1 : Requête sans token CSRF**
   ```bash
   curl -X POST http://localhost:5000/api/orders \
     -H "Content-Type: application/json" \
     -b "token=YOUR_TOKEN" \
     -d '{"test": "data"}'
   ```
   **Résultat attendu** : 403 Forbidden - "CSRF token manquant"

2. **Test 2 : Requête avec token CSRF invalide**
   ```bash
   curl -X POST http://localhost:5000/api/orders \
     -H "Content-Type: application/json" \
     -H "X-CSRF-Token: invalid-token" \
     -b "token=YOUR_TOKEN; csrf-token=valid-token" \
     -d '{"test": "data"}'
   ```
   **Résultat attendu** : 403 Forbidden - "CSRF token invalide"

3. **Test 3 : Requête avec token CSRF valide**
   - Se connecter via le navigateur
   - Récupérer le token CSRF depuis le header `X-CSRF-Token` d'une requête GET
   - Utiliser ce token dans le header `X-CSRF-Token` d'une requête POST
   **Résultat attendu** : 200 OK

---

## 📝 Notes importantes

### **Compatibilité avec les cookies HttpOnly**
- Le token CSRF est stocké dans un cookie HttpOnly (sécurisé)
- Le token est aussi envoyé dans le header `X-CSRF-Token` pour que le client puisse le lire
- Le client doit envoyer le même token dans le header `X-CSRF-Token` des requêtes POST/PUT/DELETE

### **Expiration des tokens**
- Les tokens CSRF expirent après 24 heures
- Un nouveau token est généré automatiquement lors de la connexion ou de la vérification d'authentification
- Le client doit récupérer un nouveau token si l'ancien expire

### **Performance**
- Les tokens sont stockés en mémoire (Map)
- Un nettoyage automatique des tokens expirés est effectué tous les 1000 tokens
- En production, considérer l'utilisation de Redis pour le stockage distribué

---

## 🚀 Prochaines étapes

1. ✅ Implémenter le middleware CSRF
2. ✅ Protéger les routes critiques (orders, products, residents, stock)
3. ⏳ Protéger toutes les autres routes POST/PUT/DELETE
4. ⏳ Mettre à jour tous les clients pour utiliser `fetchWithCSRF()`
5. ⏳ Tests de sécurité complets
6. ⏳ Documentation pour les développeurs

---

**Fin du guide**

