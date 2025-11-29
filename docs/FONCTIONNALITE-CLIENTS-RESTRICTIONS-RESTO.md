# Fonctionnalité : Gestion des Clients et Restrictions - Dashboard Resto

## 🎯 Objectif

Permettre au chef de restaurant de :
1. **Gérer les clients** et leurs restrictions alimentaires
2. **Générer des menus adaptés** qui respectent les restrictions de tous les clients
3. **Visualiser les restrictions** par table/réservation

---

## 📋 Analyse de l'Existant

### État Actuel (menu.html)
- ❌ Pas de gestion des clients
- ⚠️ Champ "Régime Alimentaire" basique (végétarien, végétalien, sans gluten, sans produits laitiers)
- ❌ Pas de système pour saisir les restrictions par client
- ❌ Pas de génération de menus multi-restrictions

### Comparaison avec Collectivité/EHPAD
- ✅ Collectivité : Gestion de groupes avec restrictions multiples
- ✅ EHPAD : Gestion de résidents avec profils nutritionnels complets
- ✅ Les deux utilisent le générateur IA avec restrictions

---

## 🚀 Solution Proposée

### 1. **Nouvel Onglet "Clients" dans accueil.html**

#### 1.1. Gestion des Clients
**Interface** :
```
┌─────────────────────────────────────────────────────────┐
│ [Clients] [Menus] [Stock] [Planning] [Fournisseurs]    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 👥 Gestion des Clients                                  │
│                                                          │
│ [+ Ajouter un client] [📥 Importer] [📤 Exporter]       │
│                                                          │
│ 🔍 Rechercher... [Filtrer par restriction ▼]           │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Nom          │ Téléphone │ Restrictions │ Actions │ │
│ ├────────────────────────────────────────────────────┤ │
│ │ Jean Dupont  │ 061234... │ 🥛 Lactose   │ ✏️ 🗑️  │ │
│ │ Marie Martin │ 062345... │ 🌾 Gluten    │ ✏️ 🗑️  │ │
│ │              │           │ 🥜 Arachides │         │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

#### 1.2. Formulaire d'Ajout/Édition Client
**Champs** :
- Nom complet *
- Téléphone
- Email
- Date de naissance (pour calculer portions enfants)
- **Restrictions alimentaires** (multi-sélection) :
  - Allergies (14 allergènes majeurs UE)
  - Intolérances (lactose, gluten, etc.)
  - Régimes (végétarien, végétalien, halal, casher, etc.)
  - Restrictions médicales (diabète, hypertension, etc.)
- Notes spéciales (champ texte libre)

#### 1.3. Gestion par Table/Réservation
**Interface** :
```
┌─────────────────────────────────────────────────────────┐
│ 📅 Réservations du Jour                                 │
│                                                          │
│ Table 1 - 12:00 - 4 personnes                           │
│ ├─ Jean Dupont (Lactose)                                │
│ ├─ Marie Martin (Gluten, Arachides)                     │
│ ├─ Paul Durand (Aucune)                                 │
│ └─ Sophie Bernard (Végétarienne)                        │
│                                                          │
│ Table 2 - 19:30 - 2 personnes                           │
│ ├─ ...                                                  │
│                                                          │
│ [+ Nouvelle réservation]                                │
└─────────────────────────────────────────────────────────┘
```

---

### 2. **Génération de Menus Multi-Restrictions**

#### 2.1. Sélection des Clients/Table
**Interface** :
```
┌─────────────────────────────────────────────────────────┐
│ 🍽️ Générer un Menu Adapté                              │
│                                                          │
│ Sélectionner :                                           │
│ ☑️ Table 1 (4 personnes)                                │
│ ☐ Table 2 (2 personnes)                                │
│ ☐ Clients individuels                                   │
│                                                          │
│ Résumé des restrictions :                               │
│ • 1 personne : Lactose                                  │
│ • 1 personne : Gluten, Arachides                        │
│ • 1 personne : Végétarien                               │
│ • 1 personne : Aucune restriction                       │
│                                                          │
│ [Générer le menu adapté]                                │
└─────────────────────────────────────────────────────────┘
```

#### 2.2. Algorithme de Génération
**Logique** :
1. **Collecter toutes les restrictions** des clients sélectionnés
2. **Identifier les restrictions communes** (ex: tous sans gluten)
3. **Générer un menu de base** qui respecte TOUTES les restrictions
4. **Proposer des alternatives** pour les restrictions individuelles
5. **Afficher les adaptations nécessaires** par client

**Exemple** :
```
Menu Principal : Risotto aux Champignons
✅ Compatible avec : Lactose, Gluten, Arachides, Végétarien

Alternatives par client :
• Jean (Lactose) : Risotto sans fromage
• Marie (Gluten) : Risotto avec riz sans gluten
• Sophie (Végétarien) : Déjà compatible
• Paul : Version standard
```

#### 2.3. Affichage des Résultats
**Interface** :
```
┌─────────────────────────────────────────────────────────┐
│ ✅ Menu Généré : Risotto aux Champignons                │
│                                                          │
│ 📊 Compatibilité :                                      │
│ ✅ Compatible avec toutes les restrictions             │
│                                                          │
│ 👥 Adaptations par client :                             │
│ • Jean Dupont : Sans fromage (lactose)                 │
│ • Marie Martin : Riz sans gluten                        │
│ • Sophie Bernard : Déjà végétarien                      │
│ • Paul Durand : Version standard                        │
│                                                          │
│ 📋 Ingrédients nécessaires :                            │
│ • Riz arborio : 500g ✓ Disponible                      │
│ • Champignons : 300g ✓ Disponible                       │
│ • ...                                                   │
│                                                          │
│ [Accepter ce menu] [Générer une alternative]           │
└─────────────────────────────────────────────────────────┘
```

---

### 3. **Intégration avec le Générateur IA Existant**

#### 3.1. Utiliser le Générateur IA Personnalisé
**Modification** : Adapter `custom-menu-generator.js` pour accepter une liste de clients

**Paramètres** :
```javascript
{
  clients: [
    { id: 1, name: "Jean Dupont", restrictions: ["lactose"] },
    { id: 2, name: "Marie Martin", restrictions: ["gluten", "arachides"] },
    // ...
  ],
  numberOfPeople: 4,
  mealType: "déjeuner",
  // ... autres paramètres
}
```

#### 3.2. Logique de Filtrage
**Algorithme** :
1. **Union de toutes les restrictions** : Créer une liste unique de toutes les restrictions
2. **Intersection des allergènes** : Exclure les allergènes présents chez au moins un client
3. **Union des régimes** : Le menu doit être compatible avec au moins un régime (ou aucun régime)
4. **Génération** : Utiliser le générateur IA avec ces filtres

**Exemple** :
```
Clients :
- Client 1 : Allergies [lactose], Régimes [végétarien]
- Client 2 : Allergies [gluten], Régimes []
- Client 3 : Allergies [], Régimes [halal]

Filtres générés :
- Exclure : lactose, gluten (intersection des allergènes)
- Compatible avec : végétarien OU halal OU aucun régime
```

---

## 📐 Structure de Données

### Modèle Client (MongoDB)
```javascript
{
  _id: ObjectId,
  restaurantId: ObjectId, // Référence au restaurant
  name: String,
  phone: String,
  email: String,
  dateOfBirth: Date, // Pour calculer portions enfants
  restrictions: {
    allergies: [String], // ["lactose", "gluten", "arachides"]
    intolerances: [String], // ["lactose", "gluten"]
    diets: [String], // ["vegetarien", "vegan", "halal", "casher"]
    medicalConditions: [String], // ["diabete", "hypertension"]
    ethicalRestrictions: [String] // ["sans_porc"]
  },
  notes: String, // Notes spéciales
  createdAt: Date,
  updatedAt: Date
}
```

### Modèle Réservation (MongoDB)
```javascript
{
  _id: ObjectId,
  restaurantId: ObjectId,
  date: Date,
  time: String, // "12:00"
  tableNumber: Number,
  numberOfPeople: Number,
  clientIds: [ObjectId], // Références aux clients
  status: String, // "confirmed", "cancelled", "completed"
  menuId: ObjectId, // Menu généré pour cette réservation
  createdAt: Date
}
```

---

## 🎨 Interface Utilisateur

### Page Clients (Nouvel Onglet)
```html
<div id="clients-tab" class="tab-content">
  <div class="card">
    <h2><i class="fas fa-users"></i> Gestion des Clients</h2>
    
    <!-- Actions -->
    <div class="actions-bar">
      <button id="add-client-btn" class="btn-primary">
        <i class="fas fa-plus"></i> Ajouter un client
      </button>
      <button id="import-clients-btn" class="btn-secondary">
        <i class="fas fa-file-import"></i> Importer (CSV)
      </button>
      <button id="export-clients-btn" class="btn-secondary">
        <i class="fas fa-file-export"></i> Exporter (CSV)
      </button>
    </div>
    
    <!-- Filtres -->
    <div class="filters-bar">
      <input type="text" id="client-search" placeholder="Rechercher un client...">
      <select id="restriction-filter">
        <option value="">Toutes les restrictions</option>
        <option value="lactose">Lactose</option>
        <option value="gluten">Gluten</option>
        <!-- ... -->
      </select>
    </div>
    
    <!-- Liste des clients -->
    <table class="clients-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Contact</th>
          <th>Restrictions</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="clients-list">
        <!-- Chargé dynamiquement -->
      </tbody>
    </table>
  </div>
  
  <!-- Section Réservations -->
  <div class="card">
    <h2><i class="fas fa-calendar-alt"></i> Réservations du Jour</h2>
    <div id="reservations-list">
      <!-- Chargé dynamiquement -->
    </div>
  </div>
</div>
```

### Modal Ajout/Édition Client
```html
<div id="client-modal" class="modal">
  <div class="modal-content">
    <h3>Ajouter un client</h3>
    
    <form id="client-form">
      <div class="form-group">
        <label>Nom complet *</label>
        <input type="text" id="client-name" required>
      </div>
      
      <div class="form-group">
        <label>Téléphone</label>
        <input type="tel" id="client-phone">
      </div>
      
      <div class="form-group">
        <label>Email</label>
        <input type="email" id="client-email">
      </div>
      
      <!-- Restrictions -->
      <div class="form-group">
        <label>Allergies (14 allergènes majeurs UE)</label>
        <div class="checkbox-group">
          <label><input type="checkbox" value="gluten"> 🌾 Gluten</label>
          <label><input type="checkbox" value="lactose"> 🥛 Lait/Lactose</label>
          <label><input type="checkbox" value="oeufs"> 🥚 Œufs</label>
          <label><input type="checkbox" value="arachides"> 🥜 Arachides</label>
          <label><input type="checkbox" value="fruits_a_coque"> 🌰 Fruits à coque</label>
          <label><input type="checkbox" value="soja"> 🫘 Soja</label>
          <label><input type="checkbox" value="poisson"> 🐟 Poisson</label>
          <label><input type="checkbox" value="crustaces"> 🦐 Crustacés</label>
          <label><input type="checkbox" value="mollusques"> 🐚 Mollusques</label>
          <label><input type="checkbox" value="celeri"> 🥬 Céleri</label>
          <label><input type="checkbox" value="moutarde"> 🌶️ Moutarde</label>
          <label><input type="checkbox" value="sesame"> 🌾 Sésame</label>
          <label><input type="checkbox" value="sulfites"> ⚗️ Sulfites</label>
          <label><input type="checkbox" value="lupin"> 🌱 Lupin</label>
        </div>
      </div>
      
      <div class="form-group">
        <label>Régimes alimentaires</label>
        <div class="checkbox-group">
          <label><input type="checkbox" value="vegetarien"> Végétarien</label>
          <label><input type="checkbox" value="vegan"> Végétalien</label>
          <label><input type="checkbox" value="halal"> Halal</label>
          <label><input type="checkbox" value="casher"> Casher</label>
          <label><input type="checkbox" value="sans_porc"> Sans porc</label>
        </div>
      </div>
      
      <div class="form-group">
        <label>Restrictions médicales</label>
        <div class="checkbox-group">
          <label><input type="checkbox" value="diabete"> Diabète</label>
          <label><input type="checkbox" value="hypertension"> Hypertension</label>
          <label><input type="checkbox" value="hyposode"> Hyposodé</label>
        </div>
      </div>
      
      <div class="form-group">
        <label>Notes spéciales</label>
        <textarea id="client-notes" rows="3"></textarea>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn-secondary" onclick="closeClientModal()">Annuler</button>
        <button type="submit" class="btn-primary">Enregistrer</button>
      </div>
    </form>
  </div>
</div>
```

### Génération de Menu avec Restrictions
```html
<div id="generate-menu-clients-modal" class="modal">
  <div class="modal-content">
    <h3>Générer un Menu Adapté</h3>
    
    <!-- Sélection des clients/réservations -->
    <div class="form-group">
      <label>Sélectionner les clients ou la réservation</label>
      <div id="clients-selection">
        <!-- Liste des clients avec checkboxes -->
      </div>
    </div>
    
    <!-- Résumé des restrictions -->
    <div class="restrictions-summary">
      <h4>Résumé des restrictions :</h4>
      <div id="restrictions-list">
        <!-- Généré dynamiquement -->
      </div>
    </div>
    
    <!-- Options de génération -->
    <div class="form-group">
      <label>Type de repas</label>
      <select id="menu-meal-type">
        <option value="déjeuner">Déjeuner</option>
        <option value="dîner">Dîner</option>
      </select>
    </div>
    
    <div class="form-actions">
      <button type="button" class="btn-secondary" onclick="closeGenerateMenuModal()">Annuler</button>
      <button type="button" class="btn-primary" onclick="generateMenuForClients()">
        <i class="fas fa-magic"></i> Générer le menu adapté
      </button>
    </div>
  </div>
</div>
```

---

## 🔧 Implémentation Technique

### 1. Backend - Routes API

#### Routes Clients
```javascript
// routes/clientRoutes.js
router.post('/api/clients', createClient);
router.get('/api/clients/restaurant/:restaurantId', getClientsByRestaurant);
router.get('/api/clients/:id', getClient);
router.put('/api/clients/:id', updateClient);
router.delete('/api/clients/:id', deleteClient);
```

#### Routes Réservations
```javascript
// routes/reservationRoutes.js
router.post('/api/reservations', createReservation);
router.get('/api/reservations/restaurant/:restaurantId', getReservationsByRestaurant);
router.get('/api/reservations/date/:date', getReservationsByDate);
router.put('/api/reservations/:id', updateReservation);
router.delete('/api/reservations/:id', deleteReservation);
```

#### Route Génération Menu Multi-Restrictions
```javascript
// routes/menuRoutes.js
router.post('/api/menu/generate-for-clients', generateMenuForClients);
```

### 2. Frontend - JavaScript

#### Fichier : `client/js/restaurant-clients.js`
```javascript
class RestaurantClients {
  constructor() {
    this.clients = [];
    this.reservations = [];
  }
  
  async loadClients() {
    // Charger les clients depuis l'API
  }
  
  async createClient(clientData) {
    // Créer un nouveau client
  }
  
  async generateMenuForClients(clientIds) {
    // Générer un menu adapté aux restrictions des clients
  }
  
  getRestrictionsSummary(clients) {
    // Calculer le résumé des restrictions
  }
}
```

### 3. Intégration avec Générateur IA

**Modification de `custom-menu-generator.js`** :
```javascript
async generateMenuForClients(clientIds) {
  // 1. Charger les clients
  const clients = await this.loadClientsByIds(clientIds);
  
  // 2. Collecter toutes les restrictions
  const allRestrictions = this.collectRestrictions(clients);
  
  // 3. Construire les paramètres pour le générateur IA
  const params = {
    numberOfPeople: clients.length,
    mealType: document.getElementById('menu-meal-type').value,
    dietaryRestrictions: allRestrictions.diets,
    allergens: allRestrictions.allergies,
    // ...
  };
  
  // 4. Appeler le générateur IA
  const result = await this.generateCustomMenu(params);
  
  // 5. Afficher les résultats avec adaptations par client
  this.displayMenuWithClientAdaptations(result, clients);
}
```

---

## 📊 Exemple d'Utilisation

### Scénario : Table de 4 personnes

**Clients** :
1. **Jean** : Allergie lactose
2. **Marie** : Allergie gluten + arachides
3. **Sophie** : Végétarienne
4. **Paul** : Aucune restriction

**Génération du menu** :
1. **Menu proposé** : Risotto aux Champignons (végétarien, sans gluten, sans lactose, sans arachides)
2. **Adaptations** :
   - Jean : Version sans fromage (lactose)
   - Marie : Riz sans gluten, vérifier absence d'arachides
   - Sophie : Déjà compatible (végétarien)
   - Paul : Version standard

**Résultat** : Un menu unique qui satisfait toutes les restrictions avec des adaptations mineures par client.

---

## ✅ Checklist d'Implémentation

### Phase 1 : Structure de Base
- [ ] Créer le modèle Client (MongoDB)
- [ ] Créer le modèle Réservation (MongoDB)
- [ ] Créer les routes API pour clients
- [ ] Créer les routes API pour réservations
- [ ] Créer l'onglet "Clients" dans accueil.html

### Phase 2 : Interface Utilisateur
- [ ] Formulaire d'ajout/édition client
- [ ] Liste des clients avec filtres
- [ ] Gestion des réservations
- [ ] Modal de génération de menu avec sélection clients

### Phase 3 : Génération de Menus
- [ ] Fonction de collecte des restrictions
- [ ] Intégration avec générateur IA
- [ ] Affichage des adaptations par client
- [ ] Validation de compatibilité

### Phase 4 : Améliorations
- [ ] Import/Export CSV
- [ ] Historique des menus générés
- [ ] Suggestions de menus récurrents
- [ ] Notifications pour restrictions complexes

---

## 🎯 Priorité

**⭐ PRIORITÉ TRÈS HAUTE** - Cette fonctionnalité est essentielle pour un restaurant qui doit gérer les restrictions alimentaires de ses clients.

---

## 📝 Notes

- Utiliser le même système de restrictions que collectivite-dashboard
- S'assurer que le générateur IA peut gérer plusieurs restrictions simultanément
- Prévoir un système de fallback si aucun menu ne peut satisfaire toutes les restrictions
- Permettre au chef de forcer un menu même si certaines restrictions ne peuvent pas être respectées (avec avertissement)





