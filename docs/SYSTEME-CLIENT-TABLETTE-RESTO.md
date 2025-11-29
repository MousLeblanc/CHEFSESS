# 🍽️ Système Client Tablette - Restaurants

## 🎯 Concept

Nouveau workflow pour les restaurants :
1. **Client sur tablette** → Sélectionne son plat modulaire
2. **Indique allergies/intolérances** → L'IA propose des options adaptées
3. **Commande envoyée au chef** → En cuisine pour préparation

---

## 📱 Architecture

### 1. Page Tablette Client (`client-tablet.html`)

**Interface simplifiée pour tablette** :
- Sélection de protéine
- Sélection de sauce (selon protéine)
- Sélection d'accompagnement (selon protéine)
- Formulaire allergies/intolérances
- Validation et envoi au chef

### 2. Dashboard Chef (`chef-kitchen.html`)

**Interface pour le chef en cuisine** :
- Liste des commandes clients en temps réel
- Détails de chaque commande (protéine, sauce, accompagnement)
- Restrictions alimentaires mises en évidence
- Statut de préparation (en attente, en préparation, prêt)
- Notifications WebSocket pour nouvelles commandes

### 3. Modèle de Données

**CustomerOrder** (Commande Client) :
- Client info (nom, table, etc.)
- Sélection modulaire (protéine, sauce, accompagnement)
- Restrictions (allergies, intolérances)
- Statut (pending, preparing, ready, served)
- Timestamp

---

## 🏗️ Implémentation

### Modèle : CustomerOrder

```javascript
// models/CustomerOrder.js
const customerOrderSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Informations client
  customer: {
    name: String, // Optionnel si anonyme
    tableNumber: Number,
    guestNumber: Number // Numéro de convive à la table
  },
  
  // Sélection modulaire
  selection: {
    protein: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecipeComponent',
      required: true
    },
    sauce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecipeComponent'
    },
    accompaniment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecipeComponent'
    }
  },
  
  // Restrictions du client
  restrictions: {
    allergies: [String],
    intolerances: [String],
    dietaryRestrictions: [String],
    notes: String // Notes spéciales
  },
  
  // Template généré
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecipeTemplate'
  },
  
  // Statut
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
    default: 'pending'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  startedAt: Date, // Quand le chef commence la préparation
  readyAt: Date, // Quand c'est prêt
  servedAt: Date // Quand servi au client
});
```

### Routes API

```javascript
// routes/customerOrderRoutes.js

// Créer une commande client
POST /api/customer-orders
Body: {
  proteinId: "...",
  sauceId: "...",
  accompanimentId: "...",
  restrictions: {
    allergies: ["lactose"],
    intolerances: [],
    dietaryRestrictions: ["vegetarien"]
  },
  tableNumber: 5,
  guestNumber: 1
}

// Récupérer les commandes pour le chef
GET /api/customer-orders/kitchen
Query: ?status=pending&restaurantId=...

// Mettre à jour le statut
PUT /api/customer-orders/:id/status
Body: { status: "preparing" }
```

---

## 🎨 Interface Tablette Client

### Page : `client-tablet.html`

**Design** :
- Interface tactile optimisée
- Grands boutons
- Navigation simple
- Pas de scroll complexe

**Workflow** :
1. **Écran d'accueil** : "Bienvenue, sélectionnez votre plat"
2. **Sélection protéine** : Liste visuelle avec images
3. **Sélection sauce** : Selon protéine choisie
4. **Sélection accompagnement** : Selon protéine choisie
5. **Formulaire restrictions** : Checkboxes allergies/intolérances
6. **Récapitulatif** : Aperçu du menu avec restrictions
7. **Validation** : Envoi au chef

---

## 👨‍🍳 Interface Chef

### Page : `chef-kitchen.html`

**Fonctionnalités** :
- **Vue en temps réel** : Commandes qui arrivent
- **Cartes de commande** : Une carte par commande
- **Mise en évidence restrictions** : Allergies en rouge
- **Statuts** : Boutons pour changer le statut
- **Notifications** : Son/visuel pour nouvelles commandes

**Layout** :
```
┌─────────────────────────────────────────┐
│ 🍽️ Cuisine - Commandes en Cours         │
├─────────────────────────────────────────┤
│ [En Attente] [En Préparation] [Prêtes] │
├─────────────────────────────────────────┤
│ Table 5 - Convive 1                     │
│ Cuisse poulet + Sauce champignons + Riz │
│ ⚠️ Allergies: Lactose                    │
│ [Commencer] [Prêt] [Servi]              │
├─────────────────────────────────────────┤
│ Table 3 - Convive 2                     │
│ Saumon + Beurre citron + Légumes        │
│ ✅ Aucune restriction                    │
│ [Commencer] [Prêt] [Servi]              │
└─────────────────────────────────────────┘
```

---

## 🤖 Logique IA pour Suggestions

### Algorithme de Suggestion

Quand un client sélectionne une protéine avec des restrictions :

1. **Récupérer les composants compatibles**
   - Sauces compatibles avec la protéine ET sans allergènes
   - Accompagnements compatibles avec la protéine ET sans allergènes

2. **Scorer les combinaisons**
   - Bonus si compatible avec toutes les restrictions
   - Pénalité si contient des allergènes
   - Priorité aux combinaisons validées

3. **Proposer 3-5 options**
   - Option 1 : Meilleure combinaison
   - Option 2-3 : Alternatives
   - Option 4-5 : Si restrictions strictes, proposer modifications

---

## 📋 Exemple de Workflow Complet

### Scénario : Client avec allergie lactose

1. **Client sur tablette** :
   - Sélectionne "Cuisse de poulet"
   - Indique "Allergie : Lactose"
   - L'IA propose :
     - ✅ Option 1 : Cuisse poulet + Sauce tomate + Riz (sans lactose)
     - ✅ Option 2 : Cuisse poulet + Beurre citron + Légumes (sans lactose)
     - ⚠️ Option 3 : Cuisse poulet + Sauce champignons + Riz (contient lactose - proposer sans crème)

2. **Client valide** :
   - Choisit Option 1
   - Commande envoyée au chef

3. **Chef en cuisine** :
   - Reçoit notification
   - Voit la commande avec alerte "⚠️ Allergie Lactose"
   - Commence la préparation
   - Marque "Prêt" quand terminé

4. **Service** :
   - Le serveur voit que c'est prêt
   - Sert au client
   - Marque "Servi"

---

## 🔧 Implémentation Technique

### 1. Modèle CustomerOrder
### 2. Routes API
### 3. Page Tablette Client
### 4. Page Chef Kitchen
### 5. Notifications WebSocket
### 6. Intégration avec génération modulaire

---

**Version: 1.0**  
**Last updated: January 2025**





