# 📦 Point de Restauration - Système de Commandes

**Date** : 29 octobre 2025  
**Version** : Production stable  
**Commit** : `e003bf4`

---

## ✅ État du système

### **Fonctionnalités opérationnelles**

| Fonctionnalité | État | Testé |
|----------------|------|-------|
| Authentification cookies HTTP-Only | ✅ OK | ✅ |
| Isolation sessions (sessionStorage) | ✅ OK | ✅ |
| Affichage noms sites | ✅ OK | ✅ |
| Chargement fournisseurs | ✅ OK | ✅ |
| Catalogue produits | ✅ OK | ✅ |
| Vérification stock | ✅ OK | ✅ |
| Création commande | ✅ OK | ✅ |
| Notifications WebSocket | ✅ OK | ✅ |
| Alerte stock insuffisant | ✅ OK | ✅ |
| Food Cost | ✅ OK | ✅ |
| Admin Reports | ✅ OK | ✅ |

---

## 🔧 Architecture technique

### **Backend**

#### **Authentification**
- **Token** : Cookie HTTP-Only
- **Expiration** : 7 jours
- **Sécurité** : sameSite: 'lax', secure: true (prod)

#### **Endpoints critiques**

##### `/api/auth/login`
```javascript
POST /api/auth/login
Body: { email, password }
Response: { success: true, user: {...} }
Cookie: token (HTTP-Only)
```

##### `/api/orders` (POST)
```javascript
POST /api/orders
Headers: credentials: 'include'
Body: {
  supplier: "supplier_id",
  items: [
    { productId: "product_id", quantity: 20 }
  ],
  deliveryDate: "2025-11-01",
  notes: "Instructions spéciales"
}
Response: { success: true, order: {...} }
```

**Validations** :
- ✅ Fournisseur existe
- ✅ Produits existent
- ✅ Stock suffisant (bloque si insuffisant)
- ✅ Prix calculés automatiquement
- ✅ Déduction stock fournisseur
- ✅ Notification fournisseur (WebSocket)

---

### **Frontend**

#### **Structure fichiers**
```
client/
├── js/
│   ├── login.js                      ✅ sessionStorage.user
│   ├── auth.js                       ✅ Redirection par rôle
│   ├── supplier-common.js            ✅ Chargement fournisseurs
│   ├── stock-common.js               ✅ Gestion stock
│   ├── notification-client.js        ✅ WebSocket cookies
│   ├── foodcost-manager.js           ✅ Food Cost
│   ├── group-dashboard.js            ✅ Admin
│   └── ehpad-dashboard.js            ✅ Site EHPAD
```

#### **Flux de commande**

```
1. Site se connecte (Edge)
   → Cookie 'token' créé
   → sessionStorage.setItem('user', {...})

2. Onglet "Fournisseurs"
   → fetch('/api/users/suppliers', { credentials: 'include' })
   → Affiche liste fournisseurs

3. Clic "Parcourir catalogue"
   → fetch(`/api/products/supplier/${id}`, { credentials: 'include' })
   → Affiche produits disponibles

4. Ajout au panier
   → cart.push({ productId, quantity, name, price })
   → updateCartCount()

5. Valider commande
   → POST /api/orders
   → Vérifications backend :
      ✅ Stock suffisant ?
      ✅ Fournisseur valide ?
      ✅ Produits valides ?
   → Déduction stock
   → Notification WebSocket au fournisseur

6. Fournisseur reçoit notification (Chrome)
   → WebSocket : 'new_order'
   → Son "ding-dong" 🔔
   → Popup notification
   → Commande visible dans onglet "Commandes"
```

---

## 🔐 Sécurité

### **Protection XSS**
- ✅ Token dans cookie HTTP-Only (inaccessible JS)
- ✅ sameSite: 'lax' (protection CSRF)
- ✅ secure: true en production (HTTPS)

### **Validation backend**
- ✅ Vérification stock avant création commande
- ✅ Validation ObjectId MongoDB
- ✅ Middleware `protect` sur toutes les routes sensibles
- ✅ Rôles vérifiés (fournisseur, collectivite, admin)

---

## 📊 Base de données

### **Collections principales**

#### **User**
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (bcrypt),
  role: String (fournisseur, collectivite, admin),
  establishmentType: String (ehpad, hopital, etc.),
  businessName: String,
  groupId: ObjectId (ref: Group),
  siteId: ObjectId (ref: Site),
  supplierId: ObjectId (ref: Supplier)
}
```

#### **Order**
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  customer: ObjectId (ref: User),
  supplier: ObjectId (ref: User),
  siteId: ObjectId (ref: Site),
  items: [{
    product: ObjectId (ref: Product),
    productName: String,
    quantity: Number,
    unit: String,
    unitPrice: Number,
    totalPrice: Number
  }],
  delivery: {
    requestedDate: Date,
    confirmedDate: Date
  },
  status: String (pending, accepted, preparing, ready, shipped, delivered),
  pricing: {
    subtotal: Number,
    tax: Number,
    total: Number
  },
  dates: {
    delivered: Date
  },
  establishmentType: String
}
```

#### **Product**
```javascript
{
  _id: ObjectId,
  name: String,
  category: String,
  price: Number,
  unit: String (kg, L, pièce),
  stock: Number,
  stockAlert: Number,
  supplier: ObjectId (ref: User)
}
```

---

## 🔔 Notifications WebSocket

### **Connexion**
```javascript
// Frontend
const ws = new WebSocket('wss://chefsess.onrender.com/ws/notifications');
// Cookie 'token' envoyé automatiquement par le navigateur
```

### **Backend**
```javascript
// services/notificationService.js
// Parse cookies depuis req.headers.cookie
// Vérifie JWT
// Associe WebSocket à userId
```

### **Événements**
- `new_order` : Nouvelle commande reçue
- `order_status_change` : Changement statut commande
- `low_stock` : Alerte stock bas

---

## 🚨 Gestion erreurs

### **Stock insuffisant**
```javascript
// Backend (orderController.js ligne 72-76)
if (product.stock < item.quantity) {
  res.status(400);
  throw new Error(`Stock insuffisant pour ${product.name}. 
    Disponible: ${product.stock} ${product.unit}, 
    Demandé: ${item.quantity} ${product.unit}`);
}
```

### **Frontend affichage**
```javascript
// client/js/supplier-common.js
// Toast détaillé avec stock disponible
// Suggestion d'ajuster la quantité
```

---

## ⚠️ Limitation connue

### **Conflit cookies entre onglets**

**Problème** : Les cookies HTTP-Only sont partagés entre tous les onglets du même navigateur.

**Solution appliquée** :
- ✅ sessionStorage isolé par onglet
- ✅ Documentation utilisateur
- ✅ Recommandation : 2 PC ou 2 navigateurs différents

**Workflow recommandé** :
- **PC 1 ou Chrome** : Fournisseur
- **PC 2 ou Edge** : Site

---

## 📝 Tests de validation

### **Test 1 : Commande normale**
1. Site commande 5kg fraises (stock: 10kg)
2. ✅ Commande créée
3. ✅ Stock déduit (5kg restants)
4. ✅ Notification envoyée
5. ✅ Fournisseur reçoit alerte

### **Test 2 : Stock insuffisant**
1. Site commande 20kg steak argentin (stock: 10kg)
2. ✅ Erreur 400 affichée
3. ✅ Message clair : "Disponible: 10kg, Demandé: 20kg"
4. ✅ Commande NON créée
5. ✅ Stock inchangé

### **Test 3 : Notifications**
1. Fournisseur connecté (Chrome)
2. Site passe commande (Edge)
3. ✅ WebSocket notification reçue
4. ✅ Son "ding-dong" joué
5. ✅ Popup affichée
6. ✅ Commande visible dans onglet

### **Test 4 : Food Cost**
1. Commande livrée
2. ✅ Total ajouté au Food Cost
3. ✅ Stock mis à jour
4. ✅ Calcul automatique

---

## 🔄 Flux complet testé

```
┌─────────────────────────────────────────┐
│  1. Site (Edge) se connecte             │
│     → Cookie 'token' créé               │
│     → sessionStorage.user enregistré    │
└─────────────────────────────────────────┘
                  ⬇️
┌─────────────────────────────────────────┐
│  2. Fournisseur (Chrome) se connecte    │
│     → Cookie 'token' créé (isolé)       │
│     → WebSocket notifications activé    │
└─────────────────────────────────────────┘
                  ⬇️
┌─────────────────────────────────────────┐
│  3. Site parcourt catalogue             │
│     → GET /api/products/supplier/:id    │
│     → Affiche produits + stock          │
└─────────────────────────────────────────┘
                  ⬇️
┌─────────────────────────────────────────┐
│  4. Site ajoute au panier               │
│     → cart.push()                       │
│     → Vérification côté client          │
└─────────────────────────────────────────┘
                  ⬇️
┌─────────────────────────────────────────┐
│  5. Site valide commande                │
│     → POST /api/orders                  │
│     → Backend vérifie stock ✅           │
│     → Déduction stock                   │
│     → Création commande                 │
└─────────────────────────────────────────┘
                  ⬇️
┌─────────────────────────────────────────┐
│  6. Notification WebSocket              │
│     → notificationService.notifyNewOrder│
│     → WebSocket → Fournisseur (Chrome)  │
│     → Son + Popup + Badge               │
└─────────────────────────────────────────┘
                  ⬇️
┌─────────────────────────────────────────┐
│  7. Fournisseur gère commande           │
│     → Accepter / Refuser                │
│     → Préparer                          │
│     → Envoyer                           │
└─────────────────────────────────────────┘
                  ⬇️
┌─────────────────────────────────────────┐
│  8. Site confirme réception             │
│     → Statut: 'delivered'               │
│     → Stock site mis à jour             │
│     → Food Cost calculé                 │
└─────────────────────────────────────────┘
```

---

## 📦 Commits de référence

| Commit | Description | Date |
|--------|-------------|------|
| `11ad868` | Migration cookies HTTP-Only | 29/10/2025 |
| `38691da` | Migration sessionStorage | 29/10/2025 |
| `56fb320` | Suppression if (!token) | 29/10/2025 |
| `fd60047` | HOTFIX formatage headers | 29/10/2025 |
| `efba424` | FIX FINAL token | 29/10/2025 |
| `e003bf4` | Réactivation notifications WebSocket | 29/10/2025 |

---

## 🎯 Points de restauration

### **Pour revenir à cet état**
```bash
git checkout e003bf4
```

### **Vérifier l'état**
```bash
git log --oneline -10
```

---

## 🔒 Configuration production

### **Variables d'environnement (Render)**
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
NODE_ENV=production
PORT=10000
```

### **Sécurité cookies**
```javascript
res.cookie('token', token, {
  httpOnly: true,        // ✅
  secure: true,          // ✅ (HTTPS)
  sameSite: 'lax',       // ✅
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 jours
});
```

---

## ✅ Système stable et opérationnel

**Toutes les fonctionnalités critiques sont testées et fonctionnent correctement.**

Date de sauvegarde : **29 octobre 2025, 23:30**  
Version : **Production stable**  
Commit : **e003bf4**

---

**Ce document sert de point de restauration complet du système de commandes. 🎉**





