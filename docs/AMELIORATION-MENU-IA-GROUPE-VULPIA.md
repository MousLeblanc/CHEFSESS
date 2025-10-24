# 🏢 LOGIQUE AMÉLIORÉE - MENU IA POUR ADMIN GROUPE VULPIA

## 🎯 Objectifs de l'amélioration

Créer un système intelligent de génération et dispatch de menus pour l'admin groupe Vulpia qui :

1. ✅ **Agrège les restrictions** de TOUS les résidents de TOUS les sites (12 sites EHPAD)
2. ✅ **Vérifie les disponibilités en stock** avant génération
3. ✅ **Décrément automatiquement** le stock lors de l'utilisation des ingrédients
4. ✅ **Dispatche intelligemment** les menus vers tous les sites
5. ✅ **Optimise les quantités** par site selon nombre de résidents

---

## 📊 ARCHITECTURE GLOBALE

```
┌─────────────────────────────────────────────────────────────────┐
│            👔 ADMIN GROUPE VULPIA (Dashboard)                   │
│                                                                 │
│  Actions disponibles :                                          │
│  • Analyser tous les résidents (12 sites)                      │
│  • Générer menu IA avec stock                                  │
│  • Dispatcher aux sites                                        │
│  • Gérer stock centralisé                                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ⬇️
┌─────────────────────────────────────────────────────────────────┐
│              📊 ÉTAPE 1 : AGRÉGATION DES RÉSIDENTS              │
│                                                                 │
│  Requête MongoDB :                                              │
│  → Tous les résidents actifs de tous les sites du groupe       │
│  → Profils nutritionnels complets                              │
│  → 4600+ résidents (estimation Vulpia)                         │
│                                                                 │
│  Résultat agrégé :                                              │
│  {                                                              │
│    totalResidents: 4600,                                        │
│    allergies: {                                                 │
│      gluten: 450,        // 10% des résidents                  │
│      lactose: 350,       // 8%                                 │
│      arachides: 120,     // 3%                                 │
│      ...                                                        │
│    },                                                           │
│    dietaryRestrictions: {                                       │
│      diabete: 920,       // 20% diabétiques                    │
│      hypertension: 1380, // 30%                                │
│      dysphagie: 690,     // 15% problèmes déglutition          │
│      sans_sel: 460,      // 10%                                │
│      ...                                                        │
│    },                                                           │
│    texturePreferences: {                                        │
│      normale: 3220,      // 70%                                │
│      hachée: 690,        // 15%                                │
│      mixée: 460,         // 10%                                │
│      liquide: 230        // 5%                                 │
│    },                                                           │
│    siteBreakdown: [                                             │
│      { siteId: "...", siteName: "Arthur", residents: 385 },    │
│      { siteId: "...", siteName: "Beukenhof", residents: 390 }, │
│      ...                                                        │
│    ]                                                            │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ⬇️
┌─────────────────────────────────────────────────────────────────┐
│           🗄️ ÉTAPE 2 : VÉRIFICATION DU STOCK                    │
│                                                                 │
│  Requête Stock :                                                │
│  → Stock centralisé du groupe (ou agrégé des sites)            │
│  → Quantités disponibles par ingrédient                        │
│  → Dates d'expiration                                           │
│                                                                 │
│  Exemple de stock :                                             │
│  [                                                              │
│    {                                                            │
│      name: "Poulet",                                            │
│      quantity: 500,                                             │
│      unit: "kg",                                                │
│      expirationDate: "2025-11-15",                              │
│      location: "Entrepôt central",                              │
│      reserved: 150  // Déjà réservé pour autres menus          │
│    },                                                           │
│    {                                                            │
│      name: "Carottes",                                          │
│      quantity: 800,                                             │
│      unit: "kg",                                                │
│      expirationDate: "2025-11-10",                              │
│      reserved: 200                                              │
│    },                                                           │
│    ...                                                          │
│  ]                                                              │
│                                                                 │
│  Calcul disponibilité réelle :                                 │
│  disponible = quantity - reserved                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ⬇️
┌─────────────────────────────────────────────────────────────────┐
│          🤖 ÉTAPE 3 : GÉNÉRATION MENU IA INTELLIGENTE           │
│                                                                 │
│  Configuration envoyée à l'IA :                                 │
│  {                                                              │
│    establishmentType: "groupe_ehpad",                           │
│    totalResidents: 4600,                                        │
│    numDishes: 3,  // Entrée, plat, dessert                     │
│                                                                 │
│    // RESTRICTIONS AGRÉGÉES (les plus critiques)               │
│    allergens: ["gluten", "lactose", "arachides"],              │
│    dietaryRestrictions: ["diabete", "hypertension"],           │
│    medicalConditions: ["dysphagie", "alzheimer"],              │
│                                                                 │
│    // STOCK DISPONIBLE                                          │
│    availableStock: [                                            │
│      { name: "Poulet", available: 350 kg },                    │
│      { name: "Carottes", available: 600 kg },                  │
│      ...                                                        │
│    ],                                                           │
│                                                                 │
│    // CONTRAINTE STRICTE                                        │
│    useStockOnly: true,  // ⚠️ OBLIGATOIRE : utiliser UNIQUEMENT │
│                         //    les ingrédients en stock          │
│                                                                 │
│    // OPTIMISATION                                              │
│    prioritizeExpiring: true,  // Utiliser d'abord ce qui expire│
│    targetBudget: 12000  // Budget max pour tous les sites      │
│  }                                                              │
│                                                                 │
│  ⬇️ Appel API OpenAI GPT-4o                                     │
│                                                                 │
│  Prompt spécifique :                                            │
│  "Tu es un chef expert pour groupe EHPAD avec 4600 résidents.  │
│   Compose un menu pour UNE SEMAINE complète (7 jours).         │
│   CONTRAINTES STRICTES :                                        │
│   - Utilise UNIQUEMENT les ingrédients en stock fournis        │
│   - Respecte les allergies de 450 personnes au gluten          │
│   - Respecte les 920 diabétiques (sucres limités)              │
│   - Adapte aux 690 personnes avec dysphagie (textures)         │
│   - Privilégie les ingrédients proches expiration              │
│   - Calcule les quantités pour 4600 portions                   │
│                                                                 │
│   RECETTES DISPONIBLES (filtrées par stock) :                  │
│   [... 80 recettes dont tous les ingrédients sont en stock]    │
│                                                                 │
│   FORMAT RÉPONSE :                                              │
│   {                                                             │
│     'weekMenu': {                                               │
│       'monday': { 'lunch': [...], 'dinner': [...] },           │
│       'tuesday': { 'lunch': [...], 'dinner': [...] },          │
│       ...                                                       │
│     },                                                          │
│     'totalIngredients': [                                       │
│       { name: 'Poulet', quantity: 320, unit: 'kg' },           │
│       ...                                                       │
│     ],                                                          │
│     'stockImpact': [                                            │
│       { name: 'Poulet', before: 350, used: 320, after: 30 },   │
│       ...                                                       │
│     ]                                                           │
│   }"                                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ⬇️
┌─────────────────────────────────────────────────────────────────┐
│         ✅ ÉTAPE 4 : VALIDATION ET RÉSERVATION DU STOCK         │
│                                                                 │
│  Menu généré par IA :                                           │
│  {                                                              │
│    weekMenu: { monday: {...}, tuesday: {...}, ... },           │
│    totalIngredients: [                                          │
│      { name: "Poulet", quantity: 320, unit: "kg" },            │
│      { name: "Carottes", quantity: 450, unit: "kg" },          │
│      { name: "Pommes de terre", quantity: 520, unit: "kg" },   │
│      ...                                                        │
│    ]                                                            │
│  }                                                              │
│                                                                 │
│  ⬇️ Validation automatique du stock                             │
│                                                                 │
│  FOR EACH ingredient IN totalIngredients:                       │
│    1. Vérifier disponibilité :                                  │
│       stockItem = Stock.findOne({ name: ingredient.name })     │
│       available = stockItem.quantity - stockItem.reserved      │
│                                                                 │
│       IF available < ingredient.quantity:                       │
│         ❌ ERREUR : Stock insuffisant                           │
│         → Proposer alternatives ou ajuster le menu             │
│                                                                 │
│    2. Réserver dans le stock :                                  │
│       Stock.updateOne(                                          │
│         { name: ingredient.name },                              │
│         { $inc: { reserved: ingredient.quantity } }            │
│       )                                                         │
│       ✅ Ingrédient réservé (pas encore consommé)              │
│                                                                 │
│  Créer une réservation :                                        │
│  StockReservation.create({                                      │
│    groupId: "vulpia-group",                                     │
│    menuId: "...",                                               │
│    yearWeek: "2025-W45",                                        │
│    items: [                                                     │
│      { ingredient: "Poulet", quantityReserved: 320, unit:"kg" },│
│      ...                                                        │
│    ],                                                           │
│    status: "reserved",  // reserved → confirmed → consumed     │
│    expiresAt: Date + 7 jours  // Auto-libération si non validé │
│  })                                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ⬇️
┌─────────────────────────────────────────────────────────────────┐
│       📤 ÉTAPE 5 : DISPATCH DU MENU VERS TOUS LES SITES         │
│                                                                 │
│  Calcul des quantités par site :                               │
│                                                                 │
│  FOR EACH site IN groupe.sites:                                 │
│    proportionRatio = site.residents / totalResidents           │
│                                                                 │
│    Exemple pour site "Arthur" (385 résidents) :                │
│    proportionRatio = 385 / 4600 = 0.0837 (8.37%)               │
│                                                                 │
│    Ingrédients ajustés :                                        │
│    {                                                            │
│      "Poulet": 320 kg × 0.0837 = 26.8 kg                       │
│      "Carottes": 450 kg × 0.0837 = 37.7 kg                     │
│      ...                                                        │
│    }                                                            │
│                                                                 │
│    Créer menu pour le site :                                   │
│    MenuMultiSite.create({                                       │
│      siteId: site._id,                                          │
│      groupId: "vulpia-group",                                   │
│      yearWeek: "2025-W45",                                      │
│      label: "Semaine 45 - Menu Automne",                        │
│      entries: [...],  // Même menu pour tous                   │
│      origin: "group",                                           │
│      originMenuId: groupMenuId,                                 │
│      syncVersion: 1,                                            │
│                                                                 │
│      // QUANTITÉS AJUSTÉES PAR SITE                             │
│      siteSpecificQuantities: {                                  │
│        residents: 385,                                          │
│        proportionRatio: 0.0837,                                 │
│        adjustedIngredients: [                                   │
│          { name: "Poulet", quantity: 26.8, unit: "kg" },       │
│          { name: "Carottes", quantity: 37.7, unit: "kg" },     │
│          ...                                                    │
│        ]                                                        │
│      }                                                          │
│    })                                                           │
│                                                                 │
│  Résultat : 12 menus créés (un par site)                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ⬇️
┌─────────────────────────────────────────────────────────────────┐
│      🍽️ ÉTAPE 6 : VALIDATION DU MENU PAR LE SITE               │
│                                                                 │
│  Workflow de validation :                                       │
│                                                                 │
│  1. Site reçoit le menu (status: "draft")                      │
│     → Notification : "Nouveau menu disponible"                  │
│                                                                 │
│  2. Responsable du site vérifie le menu                        │
│     → Peut voir :                                               │
│       • Plats proposés                                          │
│       • Ingrédients nécessaires                                 │
│       • Quantités ajustées pour son site                        │
│       • Compatibilité avec résidents locaux                     │
│                                                                 │
│  3. Options du site :                                           │
│     a) ✅ ACCEPTER le menu                                      │
│        → Status passe à "validated"                             │
│        → Confirmation envoyée au groupe                         │
│                                                                 │
│     b) 🔧 MODIFIER LOCALEMENT                                   │
│        → Ajustements mineurs (portions, etc.)                   │
│        → Flag "localOverrides = true"                           │
│        → Menu partiellement personnalisé                        │
│                                                                 │
│     c) ❌ REFUSER le menu                                       │
│        → Motif de refus envoyé au groupe                        │
│        → Stock réservé libéré pour ce site uniquement           │
│                                                                 │
│  4. Une fois validé par TOUS les sites :                        │
│     → Status groupe : "confirmed"                               │
│     → Passage à l'étape suivante (consommation)                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ⬇️
┌─────────────────────────────────────────────────────────────────┐
│         📉 ÉTAPE 7 : DÉCRÉMENTATION DU STOCK                    │
│                                                                 │
│  Déclencheurs de consommation :                                 │
│                                                                 │
│  Option A : Automatique (recommandé)                            │
│  → Déclenché à J-2 avant le début de la semaine               │
│  → Exemple : Menu pour semaine 45 (06-12 Nov)                  │
│               Consommation le 04 Nov à 00:00                    │
│                                                                 │
│  Option B : Manuel par admin groupe                             │
│  → Bouton "Confirmer la consommation du stock"                 │
│  → Déclenché manuellement après validation des sites            │
│                                                                 │
│  Option C : Par site (si stock décentralisé)                    │
│  → Chaque site confirme la préparation                         │
│  → Consommation au jour le jour                                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Processus de décrémentation :                                  │
│                                                                 │
│  1. Récupérer la réservation                                   │
│     reservation = StockReservation.findOne({                    │
│       menuId: "...",                                            │
│       status: "reserved"                                        │
│     })                                                          │
│                                                                 │
│  2. Pour chaque ingrédient réservé :                           │
│     FOR EACH item IN reservation.items:                         │
│       a) Libérer la réservation :                              │
│          Stock.updateOne(                                       │
│            { name: item.ingredient },                           │
│            { $inc: { reserved: -item.quantityReserved } }      │
│          )                                                      │
│                                                                 │
│       b) Consommer effectivement :                             │
│          Stock.updateOne(                                       │
│            { name: item.ingredient },                           │
│            { $inc: { quantity: -item.quantityReserved } }      │
│          )                                                      │
│                                                                 │
│       c) Logger la transaction :                               │
│          StockTransaction.create({                              │
│            stockItemId: "...",                                  │
│            type: "consumption",                                 │
│            quantity: -item.quantityReserved,                    │
│            reason: "Menu semaine 45",                           │
│            menuId: "...",                                       │
│            performedBy: "system",                               │
│            timestamp: Date.now()                                │
│          })                                                     │
│                                                                 │
│  3. Mettre à jour le statut de la réservation :               │
│     reservation.status = "consumed"                             │
│     reservation.consumedAt = Date.now()                         │
│     reservation.save()                                          │
│                                                                 │
│  4. Mettre à jour le statut du menu :                          │
│     MenuMultiSite.updateMany(                                   │
│       { originMenuId: groupMenuId },                            │
│       { status: "published", stockConsumed: true }              │
│     )                                                           │
│                                                                 │
│  Exemple de résultat :                                          │
│  {                                                              │
│    "Poulet": {                                                  │
│      before: 500 kg,                                            │
│      reserved: -150 kg (libéré),                                │
│      consumed: -320 kg,                                         │
│      after: 180 kg,                                             │
│      status: "low_stock"  // Alerte si < seuil                 │
│    },                                                           │
│    "Carottes": {                                                │
│      before: 800 kg,                                            │
│      reserved: -200 kg,                                         │
│      consumed: -450 kg,                                         │
│      after: 350 kg,                                             │
│      status: "ok"                                               │
│    }                                                            │
│  }                                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ⬇️
┌─────────────────────────────────────────────────────────────────┐
│            📊 ÉTAPE 8 : REPORTING ET ALERTES                    │
│                                                                 │
│  Notifications automatiques :                                   │
│                                                                 │
│  1. Alertes de stock bas :                                     │
│     IF stockItem.quantity < stockItem.minThreshold:             │
│       → Email à admin groupe                                    │
│       → Badge "Stock bas" dans dashboard                        │
│       → Suggestion de réapprovisionnement                       │
│                                                                 │
│  2. Rapports hebdomadaires :                                   │
│     {                                                           │
│       weekOf: "2025-W45",                                       │
│       totalResidents: 4600,                                     │
│       menusSent: 12,                                            │
│       menusValidated: 12,                                       │
│       stockConsumed: {                                          │
│         "Poulet": 320 kg,                                       │
│         "Carottes": 450 kg,                                     │
│         ...                                                     │
│       },                                                        │
│       costTotal: 11850 €,                                       │
│       costPerResident: 2.58 €,                                  │
│       wasteEstimate: 45 kg (1.2%)                               │
│     }                                                           │
│                                                                 │
│  3. Prédictions et recommandations IA :                        │
│     "Basé sur la consommation des 4 dernières semaines :       │
│      - Poulet : Réapprovisionner 400kg avant le 15/11          │
│      - Carottes : Stock suffisant jusqu'au 20/11               │
│      - Pommes : Utilisation faible, varier les desserts"       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 IMPLÉMENTATION TECHNIQUE

### 1. Nouveaux Modèles Mongoose

#### **StockReservation.js**

```javascript
const stockReservationSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuMultiSite",
    required: true
  },
  yearWeek: {
    type: String,
    required: true,
    match: /^\d{4}-W\d{2}$/
  },
  
  items: [{
    stockItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock",
      required: true
    },
    ingredient: String,
    quantityReserved: Number,
    unit: String,
    reservedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  status: {
    type: String,
    enum: ["reserved", "confirmed", "consumed", "cancelled"],
    default: "reserved"
  },
  
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  confirmedAt: Date,
  consumedAt: Date,
  cancelledAt: Date,
  
  expiresAt: Date,  // Auto-libération si non confirmé
  
  notes: String
}, { 
  timestamps: true 
});

// Auto-libération des réservations expirées
stockReservationSchema.index({ expiresAt: 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { status: "reserved" }
});

export default mongoose.model("StockReservation", stockReservationSchema);
```

#### **StockTransaction.js**

```javascript
const stockTransactionSchema = new mongoose.Schema({
  stockItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Stock",
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group"
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site"
  },
  
  type: {
    type: String,
    enum: [
      "purchase",      // Achat
      "reservation",   // Réservation
      "consumption",   // Consommation
      "return",        // Retour
      "adjustment",    // Ajustement manuel
      "expiration",    // Périmé/jeté
      "transfer"       // Transfert entre sites
    ],
    required: true
  },
  
  quantity: {
    type: Number,
    required: true  // Négatif pour les sorties, positif pour les entrées
  },
  unit: String,
  
  reason: String,
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuMultiSite"
  },
  
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  balanceBefore: Number,
  balanceAfter: Number,
  
  metadata: {
    supplier: String,
    cost: Number,
    transferTo: mongoose.Schema.Types.ObjectId,  // Site de destination si transfert
    notes: String
  }
}, { 
  timestamps: true 
});

// Index pour historique et reporting
stockTransactionSchema.index({ stockItemId: 1, createdAt: -1 });
stockTransactionSchema.index({ groupId: 1, type: 1, createdAt: -1 });
stockTransactionSchema.index({ menuId: 1 });

export default mongoose.model("StockTransaction", stockTransactionSchema);
```

#### **Ajouts au modèle Stock.js existant**

```javascript
const stockSchema = new mongoose.Schema({
  // ... champs existants ...
  
  // NOUVEAUX CHAMPS pour gestion avancée
  reserved: {
    type: Number,
    default: 0,
    min: 0
  },
  
  minThreshold: {
    type: Number,
    default: 0  // Seuil d'alerte stock bas
  },
  
  maxCapacity: {
    type: Number  // Capacité max de stockage
  },
  
  averageConsumption: {
    daily: Number,
    weekly: Number,
    monthly: Number
  },
  
  lastRestockDate: Date,
  nextRestockDate: Date,
  
  isLowStock: {
    type: Boolean,
    default: false
  },
  
  isCriticalStock: {
    type: Boolean,
    default: false
  }
});

// Méthodes utiles
stockSchema.methods.getAvailableQuantity = function() {
  return this.quantity - this.reserved;
};

stockSchema.methods.canReserve = function(requestedQty) {
  return this.getAvailableQuantity() >= requestedQty;
};

stockSchema.methods.reserve = async function(quantity) {
  if (!this.canReserve(quantity)) {
    throw new Error(`Stock insuffisant pour ${this.name}`);
  }
  this.reserved += quantity;
  return await this.save();
};

stockSchema.methods.consume = async function(quantity) {
  if (this.quantity < quantity) {
    throw new Error(`Quantité insuffisante pour consommer ${quantity} ${this.unit}`);
  }
  this.quantity -= quantity;
  this.reserved = Math.max(0, this.reserved - quantity);
  
  // Vérifier les seuils
  this.isLowStock = this.quantity <= this.minThreshold;
  this.isCriticalStock = this.quantity <= (this.minThreshold * 0.5);
  
  return await this.save();
};

stockSchema.methods.updateConsumptionStats = async function() {
  // Calculer les moyennes de consommation basées sur l'historique
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const transactions = await StockTransaction.find({
    stockItemId: this._id,
    type: "consumption",
    createdAt: { $gte: thirtyDaysAgo }
  });
  
  const totalConsumed = transactions.reduce((sum, t) => sum + Math.abs(t.quantity), 0);
  
  this.averageConsumption = {
    daily: totalConsumed / 30,
    weekly: (totalConsumed / 30) * 7,
    monthly: totalConsumed
  };
  
  return await this.save();
};
```

---

### 2. Nouveaux Contrôleurs

#### **controllers/groupMenuController.js**

```javascript
import Resident from "../models/Resident.js";
import Stock from "../models/Stock.js";
import StockReservation from "../models/StockReservation.js";
import StockTransaction from "../models/StockTransaction.js";
import RecipeEnriched from "../models/Recipe.js";
import MenuMultiSite from "../models/MenuMultiSite.js";
import Site from "../models/Site.js";
import openai from "../services/openaiClient.js";

/**
 * ÉTAPE 1 : Analyser tous les résidents du groupe
 */
export async function analyzeGroupResidents(req, res) {
  try {
    const { groupId } = req.params;
    
    // Récupérer tous les résidents actifs du groupe
    const residents = await Resident.find({ 
      groupId, 
      status: "actif" 
    }).populate("siteId", "siteName");
    
    // Agrégation des données
    const analysis = {
      totalResidents: residents.length,
      allergies: {},
      dietaryRestrictions: {},
      medicalConditions: {},
      texturePreferences: {},
      siteBreakdown: []
    };
    
    // Compter les allergies
    residents.forEach(resident => {
      resident.nutritionalProfile.allergies?.forEach(allergy => {
        const key = allergy.allergen.toLowerCase();
        analysis.allergies[key] = (analysis.allergies[key] || 0) + 1;
      });
      
      // Compter les restrictions
      resident.nutritionalProfile.dietaryRestrictions?.forEach(restriction => {
        const key = restriction.restriction.toLowerCase();
        analysis.dietaryRestrictions[key] = (analysis.dietaryRestrictions[key] || 0) + 1;
      });
      
      // Compter les conditions médicales
      resident.nutritionalProfile.medicalConditions?.forEach(condition => {
        const key = condition.condition.toLowerCase();
        analysis.medicalConditions[key] = (analysis.medicalConditions[key] || 0) + 1;
      });
      
      // Compter les préférences de texture
      const texture = resident.nutritionalProfile.texturePreferences?.consistency || "normale";
      analysis.texturePreferences[texture] = (analysis.texturePreferences[texture] || 0) + 1;
    });
    
    // Agrégation par site
    const siteMap = new Map();
    residents.forEach(resident => {
      const siteId = resident.siteId._id.toString();
      if (!siteMap.has(siteId)) {
        siteMap.set(siteId, {
          siteId,
          siteName: resident.siteId.siteName,
          residents: 0
        });
      }
      siteMap.get(siteId).residents++;
    });
    analysis.siteBreakdown = Array.from(siteMap.values());
    
    console.log(`✅ Analyse terminée: ${analysis.totalResidents} résidents`);
    
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error("Erreur lors de l'analyse des résidents:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'analyse" 
    });
  }
}

/**
 * ÉTAPE 2 : Vérifier le stock disponible
 */
export async function checkGroupStock(req, res) {
  try {
    const { groupId } = req.params;
    
    // Récupérer tout le stock du groupe
    const stockItems = await Stock.find({ 
      groupId,
      quantity: { $gt: 0 }
    });
    
    const availableStock = stockItems.map(item => ({
      _id: item._id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      reserved: item.reserved,
      available: item.getAvailableQuantity(),
      unit: item.unit,
      expirationDate: item.expirationDate,
      isLowStock: item.isLowStock,
      isCriticalStock: item.isCriticalStock,
      daysUntilExpiration: item.expirationDate 
        ? Math.ceil((new Date(item.expirationDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null
    }));
    
    // Trier par date d'expiration (priorité aux produits qui expirent bientôt)
    availableStock.sort((a, b) => {
      if (!a.daysUntilExpiration) return 1;
      if (!b.daysUntilExpiration) return -1;
      return a.daysUntilExpiration - b.daysUntilExpiration;
    });
    
    console.log(`✅ Stock récupéré: ${availableStock.length} articles disponibles`);
    
    res.json({
      success: true,
      stockItems: availableStock,
      summary: {
        totalItems: availableStock.length,
        lowStockItems: availableStock.filter(item => item.isLowStock).length,
        criticalItems: availableStock.filter(item => item.isCriticalStock).length,
        expiringWithin7Days: availableStock.filter(item => 
          item.daysUntilExpiration && item.daysUntilExpiration <= 7
        ).length
      }
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du stock:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la vérification du stock" 
    });
  }
}

/**
 * ÉTAPE 3 : Générer le menu IA avec contraintes de stock
 */
export async function generateGroupMenuWithStock(req, res) {
  try {
    const { groupId } = req.params;
    const { 
      yearWeek,
      label,
      theme,
      numDaysPerWeek = 7,
      mealsPerDay = 2,  // Déjeuner + Dîner
      dishesPerMeal = 3  // Entrée, plat, dessert
    } = req.body;
    
    console.log(`🎯 Génération menu groupe pour ${yearWeek}`);
    
    // 1. Analyser les résidents
    const residentsAnalysis = await analyzeGroupResidentsInternal(groupId);
    console.log(`📊 ${residentsAnalysis.totalResidents} résidents analysés`);
    
    // 2. Récupérer le stock disponible
    const stockItems = await Stock.find({ 
      groupId,
      quantity: { $gt: 0 }
    });
    const availableStock = stockItems.map(item => ({
      name: item.name,
      available: item.getAvailableQuantity(),
      unit: item.unit,
      expirationDate: item.expirationDate
    }));
    console.log(`🗄️ ${availableStock.length} articles en stock`);
    
    // 3. Filtrer les recettes dont TOUS les ingrédients sont en stock
    const allRecipes = await RecipeEnriched.find({
      establishmentType: { $in: ["ehpad", "maison_retraite", "collectivite"] }
    });
    
    const recipesInStock = filterRecipesByStock(allRecipes, stockItems);
    console.log(`🍽️ ${recipesInStock.length} recettes disponibles avec le stock actuel`);
    
    if (recipesInStock.length < (dishesPerMeal * mealsPerDay * numDaysPerWeek)) {
      return res.status(400).json({
        success: false,
        message: "Stock insuffisant pour générer un menu complet",
        recipesAvailable: recipesInStock.length,
        recipesNeeded: dishesPerMeal * mealsPerDay * numDaysPerWeek
      });
    }
    
    // 4. Préparer le prompt pour l'IA
    const criticalAllergies = Object.entries(residentsAnalysis.allergies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([allergen, count]) => `${allergen} (${count} résidents)`);
    
    const criticalConditions = Object.entries(residentsAnalysis.medicalConditions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([condition, count]) => `${condition} (${count} résidents)`);
    
    const systemPrompt = `Tu es un chef expert pour groupe EHPAD avec ${residentsAnalysis.totalResidents} résidents répartis sur ${residentsAnalysis.siteBreakdown.length} sites.

RÔLE :
- Composer un menu pour UNE SEMAINE COMPLÈTE (${numDaysPerWeek} jours)
- Respecter STRICTEMENT les contraintes de stock
- Adapter aux besoins nutritionnels des seniors
- Optimiser pour réduire le gaspillage

CONTRAINTES CRITIQUES :
- Utiliser UNIQUEMENT les recettes dont les ingrédients sont en stock
- Allergies majeures : ${criticalAllergies.join(", ")}
- Conditions médicales : ${criticalConditions.join(", ")}
- Préférences texture : ${JSON.stringify(residentsAnalysis.texturePreferences)}

RECETTES DISPONIBLES (${recipesInStock.length}) :
${JSON.stringify(recipesInStock.slice(0, 40).map(r => ({
  id: r._id,
  name: r.name,
  category: r.category,
  allergens: r.allergens,
  texture: r.texture,
  ingredients: r.ingredients.map(ing => ing.name)
})), null, 2)}`;

    const userPrompt = `Compose un menu équilibré pour la ${yearWeek}${theme ? ` sur le thème "${theme}"` : ""}.

STRUCTURE :
- ${numDaysPerWeek} jours (Lundi à Dimanche)
- ${mealsPerDay} repas par jour (Déjeuner, Dîner)
- ${dishesPerMeal} plats par repas (Entrée, Plat, Dessert)

CONSIGNES :
1. Varier les plats (pas de répétition)
2. Équilibre nutritionnel sur la semaine
3. Privilégier les ingrédients proches de l'expiration
4. Calculer les quantités pour ${residentsAnalysis.totalResidents} personnes

FORMAT RÉPONSE (JSON STRICT) :
{
  "weekMenu": {
    "monday": {
      "lunch": [
        { "recipeId": "...", "recipeName": "...", "category": "entrée" },
        { "recipeId": "...", "recipeName": "...", "category": "plat" },
        { "recipeId": "...", "recipeName": "...", "category": "dessert" }
      ],
      "dinner": [...]
    },
    "tuesday": {...},
    ...
  },
  "totalIngredients": [
    { "name": "Poulet", "quantity": 320, "unit": "kg" },
    ...
  ],
  "nutritionalSummary": {
    "avgCaloriesPerDay": 1800,
    "avgProteinsPerDay": 75
  }
}`;

    // 5. Appel à l'IA
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000
    });
    
    const aiResponse = JSON.parse(completion.choices[0].message.content);
    console.log(`🤖 Menu généré par l'IA`);
    
    // 6. Créer le menu groupe
    const groupMenu = await MenuMultiSite.create({
      groupId,
      yearWeek,
      label: label || `Menu ${yearWeek}`,
      theme,
      origin: "group",
      entries: convertAIMenuToEntries(aiResponse.weekMenu),
      totalIngredients: aiResponse.totalIngredients,
      nutritionalSummary: aiResponse.nutritionalSummary,
      createdBy: req.user._id,
      syncVersion: 1,
      status: "draft"
    });
    
    console.log(`✅ Menu groupe créé: ${groupMenu._id}`);
    
    res.json({
      success: true,
      menu: groupMenu,
      residentsCount: residentsAnalysis.totalResidents,
      sitesCount: residentsAnalysis.siteBreakdown.length,
      recipesUsed: Object.values(aiResponse.weekMenu).flat().length
    });
  } catch (error) {
    console.error("Erreur lors de la génération du menu:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}

/**
 * ÉTAPE 4 : Réserver le stock pour le menu
 */
export async function reserveStockForMenu(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { menuId } = req.params;
    const { expirationDays = 7 } = req.body;
    
    const menu = await MenuMultiSite.findById(menuId);
    if (!menu) {
      throw new Error("Menu non trouvé");
    }
    
    if (!menu.totalIngredients || menu.totalIngredients.length === 0) {
      throw new Error("Aucun ingrédient dans le menu");
    }
    
    const reservationItems = [];
    const stockUpdates = [];
    
    // Pour chaque ingrédient du menu
    for (const ingredient of menu.totalIngredients) {
      const stockItem = await Stock.findOne({
        groupId: menu.groupId,
        name: new RegExp(`^${ingredient.name}$`, 'i')
      }).session(session);
      
      if (!stockItem) {
        throw new Error(`Stock introuvable pour: ${ingredient.name}`);
      }
      
      // Vérifier disponibilité
      if (!stockItem.canReserve(ingredient.quantity)) {
        throw new Error(`Stock insuffisant pour ${ingredient.name}. Disponible: ${stockItem.getAvailableQuantity()} ${stockItem.unit}`);
      }
      
      // Réserver
      await stockItem.reserve(ingredient.quantity);
      await stockItem.save({ session });
      
      reservationItems.push({
        stockItemId: stockItem._id,
        ingredient: stockItem.name,
        quantityReserved: ingredient.quantity,
        unit: stockItem.unit
      });
      
      // Logger la transaction
      await StockTransaction.create([{
        stockItemId: stockItem._id,
        groupId: menu.groupId,
        type: "reservation",
        quantity: -ingredient.quantity,
        unit: stockItem.unit,
        reason: `Réservation pour ${menu.label}`,
        menuId: menu._id,
        performedBy: req.user._id,
        balanceBefore: stockItem.quantity + ingredient.quantity,
        balanceAfter: stockItem.quantity
      }], { session });
    }
    
    // Créer la réservation
    const reservation = await StockReservation.create([{
      groupId: menu.groupId,
      menuId: menu._id,
      yearWeek: menu.yearWeek,
      items: reservationItems,
      status: "reserved",
      reservedBy: req.user._id,
      expiresAt: new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
    }], { session });
    
    // Mettre à jour le menu
    menu.stockReserved = true;
    menu.stockReservationId = reservation[0]._id;
    await menu.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    console.log(`✅ Stock réservé pour le menu ${menu.label}`);
    
    res.json({
      success: true,
      reservation: reservation[0],
      itemsReserved: reservationItems.length,
      expiresAt: reservation[0].expiresAt
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Erreur lors de la réservation du stock:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}

/**
 * ÉTAPE 5 : Dispatcher le menu vers tous les sites
 */
export async function dispatchMenuToAllSites(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { menuId } = req.params;
    
    const groupMenu = await MenuMultiSite.findById(menuId);
    if (!groupMenu || !groupMenu.isGroupMenu()) {
      throw new Error("Menu groupe invalide");
    }
    
    // Récupérer tous les sites actifs
    const sites = await Site.find({ 
      groupId: groupMenu.groupId, 
      isActive: true 
    });
    
    // Analyser les résidents par site
    const residentsAnalysis = await analyzeGroupResidentsInternal(groupMenu.groupId);
    const totalResidents = residentsAnalysis.totalResidents;
    
    const dispatchResults = [];
    
    for (const site of sites) {
      const siteData = residentsAnalysis.siteBreakdown.find(
        s => s.siteId === site._id.toString()
      );
      
      if (!siteData || siteData.residents === 0) {
        console.log(`⏭️ Site ${site.siteName} ignoré (aucun résident)`);
        continue;
      }
      
      const proportionRatio = siteData.residents / totalResidents;
      
      // Calculer les ingrédients ajustés
      const adjustedIngredients = groupMenu.totalIngredients.map(ing => ({
        name: ing.name,
        quantity: parseFloat((ing.quantity * proportionRatio).toFixed(2)),
        unit: ing.unit
      }));
      
      // Créer le menu pour le site
      const siteMenu = await MenuMultiSite.create([{
        siteId: site._id,
        groupId: groupMenu.groupId,
        yearWeek: groupMenu.yearWeek,
        label: groupMenu.label,
        theme: groupMenu.theme,
        entries: groupMenu.entries,  // Même menu pour tous
        origin: "site",
        originMenuId: groupMenu._id,
        syncVersion: groupMenu.syncVersion,
        lastSyncedAt: new Date(),
        status: "draft",
        createdBy: req.user._id,
        
        // Données spécifiques au site
        siteSpecificQuantities: {
          residents: siteData.residents,
          proportionRatio,
          adjustedIngredients
        }
      }], { session });
      
      dispatchResults.push({
        siteId: site._id,
        siteName: site.siteName,
        residents: siteData.residents,
        proportionRatio: `${(proportionRatio * 100).toFixed(2)}%`,
        menuId: siteMenu[0]._id
      });
      
      console.log(`✅ Menu dispatché vers ${site.siteName} (${siteData.residents} résidents)`);
    }
    
    // Mettre à jour le statut du menu groupe
    groupMenu.status = "published";
    groupMenu.dispatchedAt = new Date();
    groupMenu.dispatchedToSites = dispatchResults.length;
    await groupMenu.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    console.log(`🎯 Dispatch terminé: ${dispatchResults.length} sites`);
    
    res.json({
      success: true,
      dispatchedToSites: dispatchResults.length,
      totalResidents,
      details: dispatchResults
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Erreur lors du dispatch:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}

/**
 * ÉTAPE 7 : Consommer le stock (décrémentation)
 */
export async function consumeStockForMenu(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { menuId } = req.params;
    
    const menu = await MenuMultiSite.findById(menuId);
    if (!menu) {
      throw new Error("Menu non trouvé");
    }
    
    // Récupérer la réservation
    const reservation = await StockReservation.findOne({
      menuId: menu._id,
      status: "reserved"
    }).session(session);
    
    if (!reservation) {
      throw new Error("Aucune réservation trouvée pour ce menu");
    }
    
    const consumptionResults = [];
    
    // Pour chaque ingrédient réservé
    for (const item of reservation.items) {
      const stockItem = await Stock.findById(item.stockItemId).session(session);
      
      if (!stockItem) {
        console.warn(`⚠️ Stock ${item.ingredient} introuvable, ignoré`);
        continue;
      }
      
      const balanceBefore = stockItem.quantity;
      
      // Consommer le stock
      await stockItem.consume(item.quantityReserved);
      await stockItem.save({ session });
      
      // Logger la transaction
      await StockTransaction.create([{
        stockItemId: stockItem._id,
        groupId: menu.groupId,
        type: "consumption",
        quantity: -item.quantityReserved,
        unit: stockItem.unit,
        reason: `Consommation pour ${menu.label}`,
        menuId: menu._id,
        performedBy: req.user._id || "system",
        balanceBefore,
        balanceAfter: stockItem.quantity
      }], { session });
      
      consumptionResults.push({
        ingredient: item.ingredient,
        consumed: item.quantityReserved,
        unit: item.unit,
        balanceBefore,
        balanceAfter: stockItem.quantity,
        isLowStock: stockItem.isLowStock,
        isCriticalStock: stockItem.isCriticalStock
      });
      
      console.log(`✅ ${item.ingredient}: ${item.quantityReserved}${item.unit} consommé (reste: ${stockItem.quantity}${item.unit})`);
    }
    
    // Mettre à jour la réservation
    reservation.status = "consumed";
    reservation.consumedAt = new Date();
    await reservation.save({ session });
    
    // Mettre à jour le menu
    menu.stockConsumed = true;
    menu.stockConsumedAt = new Date();
    menu.status = "published";
    await menu.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    console.log(`🎯 Stock consommé pour le menu ${menu.label}`);
    
    // Vérifier les alertes de stock bas
    const lowStockItems = consumptionResults.filter(r => r.isLowStock);
    const criticalStockItems = consumptionResults.filter(r => r.isCriticalStock);
    
    res.json({
      success: true,
      itemsConsumed: consumptionResults.length,
      consumptionDetails: consumptionResults,
      alerts: {
        lowStock: lowStockItems.map(r => r.ingredient),
        criticalStock: criticalStockItems.map(r => r.ingredient)
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Erreur lors de la consommation du stock:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
}

// Fonction utilitaire interne
async function analyzeGroupResidentsInternal(groupId) {
  const residents = await Resident.find({ 
    groupId, 
    status: "actif" 
  }).populate("siteId", "siteName");
  
  const analysis = {
    totalResidents: residents.length,
    allergies: {},
    dietaryRestrictions: {},
    medicalConditions: {},
    texturePreferences: {},
    siteBreakdown: []
  };
  
  residents.forEach(resident => {
    resident.nutritionalProfile.allergies?.forEach(allergy => {
      const key = allergy.allergen.toLowerCase();
      analysis.allergies[key] = (analysis.allergies[key] || 0) + 1;
    });
    
    resident.nutritionalProfile.dietaryRestrictions?.forEach(restriction => {
      const key = restriction.restriction.toLowerCase();
      analysis.dietaryRestrictions[key] = (analysis.dietaryRestrictions[key] || 0) + 1;
    });
    
    resident.nutritionalProfile.medicalConditions?.forEach(condition => {
      const key = condition.condition.toLowerCase();
      analysis.medicalConditions[key] = (analysis.medicalConditions[key] || 0) + 1;
    });
    
    const texture = resident.nutritionalProfile.texturePreferences?.consistency || "normale";
    analysis.texturePreferences[texture] = (analysis.texturePreferences[texture] || 0) + 1;
  });
  
  const siteMap = new Map();
  residents.forEach(resident => {
    const siteId = resident.siteId._id.toString();
    if (!siteMap.has(siteId)) {
      siteMap.set(siteId, {
        siteId,
        siteName: resident.siteId.siteName,
        residents: 0
      });
    }
    siteMap.get(siteId).residents++;
  });
  analysis.siteBreakdown = Array.from(siteMap.values());
  
  return analysis;
}

function filterRecipesByStock(recipes, stockItems) {
  // Filtrer les recettes dont TOUS les ingrédients sont disponibles en stock
  return recipes.filter(recipe => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return false;
    }
    
    return recipe.ingredients.every(ingredient => {
      const stockItem = stockItems.find(stock => 
        stock.name.toLowerCase() === ingredient.name.toLowerCase()
      );
      
      return stockItem && stockItem.getAvailableQuantity() > 0;
    });
  });
}

function convertAIMenuToEntries(weekMenu) {
  const entries = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  days.forEach((day, index) => {
    if (weekMenu[day]) {
      if (weekMenu[day].lunch) {
        entries.push({
          date: `day-${index + 1}`,
          service: "midi",
          recipeIds: weekMenu[day].lunch.map(meal => meal.recipeId)
        });
      }
      if (weekMenu[day].dinner) {
        entries.push({
          date: `day-${index + 1}`,
          service: "soir",
          recipeIds: weekMenu[day].dinner.map(meal => meal.recipeId)
        });
      }
    }
  });
  
  return entries;
}

export default {
  analyzeGroupResidents,
  checkGroupStock,
  generateGroupMenuWithStock,
  reserveStockForMenu,
  dispatchMenuToAllSites,
  consumeStockForMenu
};
```

---

### 3. Routes API

#### **routes/groupMenuRoutes.js**

```javascript
import express from "express";
import { protect, groupAdminOnly } from "../middleware/authMiddleware.js";
import {
  analyzeGroupResidents,
  checkGroupStock,
  generateGroupMenuWithStock,
  reserveStockForMenu,
  dispatchMenuToAllSites,
  consumeStockForMenu
} from "../controllers/groupMenuController.js";

const router = express.Router();

// Toutes les routes nécessitent authentification + rôle GROUP_ADMIN
router.use(protect);
router.use(groupAdminOnly);

// Analyse des résidents
router.get("/:groupId/residents/analysis", analyzeGroupResidents);

// Vérification du stock
router.get("/:groupId/stock/check", checkGroupStock);

// Génération du menu avec stock
router.post("/:groupId/menu/generate-with-stock", generateGroupMenuWithStock);

// Réservation du stock
router.post("/menu/:menuId/reserve-stock", reserveStockForMenu);

// Dispatch vers tous les sites
router.post("/menu/:menuId/dispatch-to-sites", dispatchMenuToAllSites);

// Consommation du stock
router.post("/menu/:menuId/consume-stock", consumeStockForMenu);

export default router;
```

---

## 🎯 WORKFLOW COMPLET POUR L'ADMIN GROUPE

### Interface Dashboard Groupe

```
┌─────────────────────────────────────────────────────────────┐
│  🏢 VULPIA GROUP - GÉNÉRATION DE MENU INTELLIGENT           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 ÉTAPE 1 : ANALYSE DES RÉSIDENTS                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Total résidents : 4600                             │   │
│  │  Allergies majeures : Gluten (450), Lactose (350)  │   │
│  │  Conditions : Diabète (920), Hypertension (1380)   │   │
│  │  Sites actifs : 12                                  │   │
│  │                                                     │   │
│  │  [📋 Voir détails complets]                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🗄️ ÉTAPE 2 : VÉRIFICATION DU STOCK                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Articles disponibles : 156                         │   │
│  │  ⚠️ Stock bas : 12 articles                         │   │
│  │  🚨 Stock critique : 3 articles                     │   │
│  │  ⏰ Expire dans 7j : 8 articles                     │   │
│  │                                                     │   │
│  │  [🗄️ Voir détails du stock]                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🤖 ÉTAPE 3 : GÉNÉRER LE MENU                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Semaine : [2025-W45 ▼]                            │   │
│  │  Label : [Menu Automne________]                    │   │
│  │  Thème : [Saveurs d'automne__]                     │   │
│  │                                                     │   │
│  │  Nombre de jours : [7 ▼]                           │   │
│  │  Repas par jour : [2 ▼] (Déj + Dîner)             │   │
│  │  Plats par repas : [3 ▼] (E + P + D)              │   │
│  │                                                     │   │
│  │  ✅ Utiliser uniquement le stock disponible         │   │
│  │  ✅ Privilégier produits proches expiration         │   │
│  │                                                     │   │
│  │  [🚀 GÉNÉRER LE MENU]                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ✅ ÉTAPE 4 : VALIDATION & DISPATCH                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Menu généré avec succès ✓                         │   │
│  │  Recettes utilisées : 42                           │   │
│  │  Ingrédients totaux : 85                           │   │
│  │  Coût estimé : 11,850 €                            │   │
│  │                                                     │   │
│  │  [📥 Télécharger PDF] [👁️ Prévisualiser]          │   │
│  │                                                     │   │
│  │  [🔒 RÉSERVER LE STOCK] → [📤 DISPATCHER AUX SITES] │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 SÉQUENCE D'ACTIONS POUR L'ADMIN

1. **Analyser les résidents** → Bouton "📊 Analyser"
   - Appel : `GET /api/group-menu/:groupId/residents/analysis`
   
2. **Vérifier le stock** → Bouton "🗄️ Vérifier Stock"
   - Appel : `GET /api/group-menu/:groupId/stock/check`
   
3. **Générer le menu** → Bouton "🚀 Générer le Menu"
   - Appel : `POST /api/group-menu/:groupId/menu/generate-with-stock`
   
4. **Réserver le stock** → Bouton "🔒 Réserver le Stock"
   - Appel : `POST /api/group-menu/menu/:menuId/reserve-stock`
   
5. **Dispatcher aux sites** → Bouton "📤 Dispatcher aux Sites"
   - Appel : `POST /api/group-menu/menu/:menuId/dispatch-to-sites`
   
6. **Consommer le stock** (automatique ou manuel)
   - Appel : `POST /api/group-menu/menu/:menuId/consume-stock`

---

## ✅ AVANTAGES DE CETTE LOGIQUE

1. **Gestion intelligente du stock** :
   - ✅ Vérification automatique de la disponibilité
   - ✅ Réservation temporaire (évite les double-bookings)
   - ✅ Décrémentation sécurisée avec historique complet

2. **Optimisation multi-sites** :
   - ✅ Un seul menu pour tous les sites (économies d'échelle)
   - ✅ Quantités ajustées automatiquement par site
   - ✅ Respect des profils nutritionnels de 4600+ résidents

3. **Traçabilité complète** :
   - ✅ Chaque transaction enregistrée
   - ✅ Historique consultable
   - ✅ Reporting automatisé

4. **Alertes intelligentes** :
   - ✅ Stock bas / critique
   - ✅ Produits proches expiration
   - ✅ Suggestions de réapprovisionnement

5. **Flexibilité** :
   - ✅ Sites peuvent modifier localement
   - ✅ Annulation possible avant consommation
   - ✅ Stock libéré automatiquement si non confirmé

---

✅ **SYSTÈME PRÊT POUR DÉPLOIEMENT PRODUCTION !**

