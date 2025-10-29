# 📋 Plan - Générateur de Menus par Site

**Date** : 29 octobre 2025  
**Objectif** : Permettre à chaque site (EHPAD, hôpital, etc.) de générer des menus adaptés à tous ses résidents

---

## 🎯 Principe

Chaque site a des résidents avec des profils différents :
- **Portions** : normale, double, demi-portion, quart
- **Textures** : IDDSI 0-7, finger food
- **Allergies** : lactose, gluten, fruits à coque, etc.
- **Restrictions** : diabète, sans sel, sans sucre, etc.

Le système doit :
1. ✅ Analyser **tous les résidents du site**
2. ✅ Grouper par profils similaires
3. ✅ Générer **un menu avec variantes** pour couvrir tous les besoins
4. ✅ Fonctionner pour **n'importe quel établissement** (Vulpia ou autre)

---

## ✅ Ce qui est fait (29 oct)

### **Frontend - `client/js/site-menu-generator.js`**

```javascript
class SiteMenuGenerator {
  constructor(siteId) {
    this.siteId = siteId;  // ✅ Générique - n'importe quel site
    this.residents = [];
    this.groupedProfiles = null;
  }

  // ✅ Méthodes implémentées :
  async loadResidents()        // Charge résidents du site
  analyzeProfiles()            // Analyse portions/textures/allergies
  createVariantGroups()        // Crée variantes de menu
  async generateMenu(config)   // Appelle API génération
  formatMenuDisplay()          // Affiche résultats
}
```

**Caractéristiques** :
- ✅ **Générique** : fonctionne avec n'importe quel `siteId`
- ✅ **Indépendant du groupe** : pas de référence à Vulpia
- ✅ **Flexible** : supporte tous types d'établissements

---

## 🚧 Ce qui reste à faire

### **1. Backend - Endpoint API**

**Fichier** : `routes/menuRoutes.js`

```javascript
// À ajouter
router.post('/generate-site', protect, menuController.generateSiteMenu);
```

**Permissions** :
- ✅ `protect` : authentifié
- ✅ Vérifier que `req.user.siteId` existe
- ✅ Fonctionne pour **tous les établissements** (Vulpia, autres, indépendants)

---

### **2. Controller - Logique de génération**

**Fichier** : `controllers/menuController.js`

```javascript
export const generateSiteMenu = async (req, res) => {
  try {
    const {
      siteId,
      numDays,
      numDishesPerMeal,
      totalResidents,
      variants,      // [{ texture, portion, count, residents }]
      allergies,
      restrictions,
      useStock,
      theme
    } = req.body;

    // 1. Vérifier permissions
    //    ✅ L'utilisateur peut-il générer pour ce site ?
    //    ✅ Pas de hardcode Vulpia - vérifier siteId générique

    // 2. Récupérer le type d'établissement
    const site = await Site.findById(siteId);
    const establishmentType = site.establishmentType; // ehpad, hopital, etc.

    // 3. Générer le menu via OpenAI
    //    ✅ Utiliser variants pour créer adaptations
    //    ✅ Gérer portions/textures automatiquement

    // 4. Sauvegarder le menu
    const menu = new Menu({
      siteId: siteId,
      groupId: site.groupId,  // ✅ Peut être null (site indépendant)
      establishmentType: establishmentType,
      days: generatedDays,
      variants: variants,
      metadata: {
        totalResidents,
        allergies,
        restrictions
      }
    });

    await menu.save();

    res.json({
      success: true,
      menu: menu,
      message: `Menu généré pour ${totalResidents} résidents`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

**Points clés** :
- ✅ **Vérification permissions génériques** (pas spécifique à Vulpia)
- ✅ **Support sites indépendants** (`groupId` peut être null)
- ✅ **Type d'établissement dynamique** (EHPAD, hôpital, etc.)

---

### **3. Intégration Frontend - `ehpad-dashboard.html`**

**Onglet "Menus"** - Ajouter section :

```html
<!-- Section Générateur de Menus -->
<div class="card">
  <h2>🍽️ Générateur de Menus Intelligent</h2>
  <p>Générez un menu adapté à tous vos résidents</p>
  
  <form id="site-menu-generator-form">
    <div class="form-group">
      <label>Nombre de jours :</label>
      <input type="number" id="menu-days" value="7" min="1" max="14">
    </div>

    <div class="form-group">
      <label>Plats par repas :</label>
      <input type="number" id="menu-dishes" value="2" min="1" max="5">
    </div>

    <div class="form-group">
      <label>
        <input type="checkbox" id="menu-use-stock">
        Utiliser uniquement les produits en stock
      </label>
    </div>

    <button type="submit">
      <i class="fas fa-magic"></i> Générer le menu
    </button>
  </form>

  <!-- Résultats -->
  <div id="menu-results" style="display: none;">
    <!-- Sera rempli dynamiquement -->
  </div>
</div>

<!-- Script -->
<script type="module">
  import SiteMenuGenerator from './js/site-menu-generator.js';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('site-menu-generator-form');
    const resultsDiv = document.getElementById('menu-results');
    
    // Récupérer le siteId de l'utilisateur connecté
    const user = JSON.parse(sessionStorage.getItem('user'));
    const siteId = user.siteId;

    if (!siteId) {
      console.error('❌ Pas de siteId pour cet utilisateur');
      return;
    }

    // Créer le générateur
    const generator = new SiteMenuGenerator(siteId);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const numDays = parseInt(document.getElementById('menu-days').value);
      const numDishes = parseInt(document.getElementById('menu-dishes').value);
      const useStock = document.getElementById('menu-use-stock').checked;

      try {
        // Afficher loading
        resultsDiv.innerHTML = '<div class="loading">⏳ Génération en cours...</div>';
        resultsDiv.style.display = 'block';

        // Générer le menu
        const result = await generator.generateMenu({
          numDays: numDays,
          numDishesPerMeal: numDishes,
          useStock: useStock
        });

        // Afficher les résultats
        resultsDiv.innerHTML = generator.formatMenuDisplay(result);

      } catch (error) {
        resultsDiv.innerHTML = `<div class="error">❌ ${error.message}</div>`;
      }
    });
  });
</script>
```

---

### **4. Modèle Menu - `models/Menu.js`**

**Vérifier/Ajouter champs** :

```javascript
const menuSchema = new mongoose.Schema({
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    // ✅ PAS required - sites indépendants possibles
  },
  establishmentType: {
    type: String,
    enum: ['ehpad', 'hopital', 'maison_retraite', 'cantine_scolaire', 'cantine_entreprise'],
    required: true
  },
  days: [{
    dayNumber: Number,
    date: Date,
    meals: {
      breakfast: [{ name: String, description: String, adaptations: [] }],
      lunch: [{ name: String, description: String, adaptations: [] }],
      dinner: [{ name: String, description: String, adaptations: [] }]
    }
  }],
  variants: [{
    texture: String,  // IDDSI level
    portion: String,  // normale, double, demi
    count: Number,    // Nombre de résidents
    residents: [{
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      room: String
    }]
  }],
  metadata: {
    totalResidents: Number,
    allergies: [String],
    restrictions: [String],
    generatedAt: { type: Date, default: Date.now }
  }
});
```

---

### **5. Service OpenAI - Génération adaptée**

**Fichier** : `services/aiService.js` ou `openaiService.js`

**Fonction à créer/modifier** :

```javascript
export async function generateSiteMenu({
  establishmentType,
  numDays,
  numDishesPerMeal,
  variants,
  allergies,
  restrictions,
  useStock
}) {
  // Construire le prompt
  const prompt = `
Tu es un chef nutritionniste spécialisé en ${establishmentType}.

CONTEXTE:
- ${numDays} jours de menus
- ${numDishesPerMeal} plats par repas
- Variantes requises:
${variants.map(v => `  * ${v.count} personnes: ${v.texture} / ${v.portion}`).join('\n')}

CONTRAINTES:
- Allergies à éviter: ${allergies.join(', ')}
- Restrictions: ${restrictions.join(', ')}
${useStock ? '- Utiliser uniquement produits en stock' : ''}

GÉNÈRE un menu JSON avec adaptations pour chaque variante.
  `;

  // Appeler OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Tu es un chef nutritionniste expert." },
      { role: "user", content: prompt }
    ],
    temperature: 0.7
  });

  // Parser et retourner
  return JSON.parse(response.choices[0].message.content);
}
```

---

### **6. Tests à effectuer**

#### **Test 1 : Site Vulpia**
- ✅ EHPAD De Linde (Vulpia Group)
- ✅ Résidents variés : Charles (double), François (demi), Claire (demi)
- ✅ Textures : IDDSI 6, IDDSI 7, finger food
- ✅ Génération menu → Variantes adaptées

#### **Test 2 : Site indépendant**
- ✅ Créer un EHPAD hors Vulpia (groupId = null)
- ✅ Ajouter résidents
- ✅ Générer menu
- ✅ Vérifier que ça fonctionne

#### **Test 3 : Hôpital**
- ✅ Créer un hôpital
- ✅ Résidents avec restrictions médicales
- ✅ Générer menu adapté

---

## 🔑 Points clés - Généricité

### **✅ Ce qui rend le système générique**

1. **Pas de hardcode Vulpia** :
   ```javascript
   // ❌ Mauvais
   if (groupId === 'vulpia_id') { ... }
   
   // ✅ Bon
   const site = await Site.findById(siteId);
   const group = site.groupId ? await Group.findById(site.groupId) : null;
   ```

2. **Support sites indépendants** :
   ```javascript
   groupId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Group',
     required: false  // ✅ Pas obligatoire
   }
   ```

3. **Type d'établissement dynamique** :
   ```javascript
   const establishmentType = site.establishmentType;
   // Peut être : ehpad, hopital, maison_retraite, cantine, etc.
   ```

4. **Vérification permissions générique** :
   ```javascript
   // Vérifier que l'utilisateur a accès au site
   if (req.user.siteId.toString() !== siteId) {
     return res.status(403).json({ message: 'Accès refusé' });
   }
   ```

---

## 📦 Architecture finale

```
┌─────────────────────────────────────────┐
│  N'importe quel Site                    │
│  (Vulpia, autres, indépendants)         │
├─────────────────────────────────────────┤
│  - siteId: unique                       │
│  - groupId: nullable                    │
│  - establishmentType: dynamique         │
│  - résidents: array                     │
└─────────────────────────────────────────┘
                  ⬇️
┌─────────────────────────────────────────┐
│  SiteMenuGenerator                      │
│  (Frontend - Générique)                 │
├─────────────────────────────────────────┤
│  1. Charge résidents du siteId          │
│  2. Analyse profils                     │
│  3. Crée variantes                      │
│  4. Appelle API                         │
└─────────────────────────────────────────┘
                  ⬇️
┌─────────────────────────────────────────┐
│  /api/menus/generate-site               │
│  (Backend - Générique)                  │
├─────────────────────────────────────────┤
│  1. Vérifie permissions (siteId)        │
│  2. Récupère type établissement         │
│  3. Génère menu OpenAI                  │
│  4. Sauvegarde Menu                     │
└─────────────────────────────────────────┘
                  ⬇️
┌─────────────────────────────────────────┐
│  Menu généré avec variantes             │
│  - Adapté aux résidents du site         │
│  - Indépendant du groupe                │
│  - Fonctionne pour tous                 │
└─────────────────────────────────────────┘
```

---

## 🎯 Ordre d'implémentation (Demain)

### **Étape 1 : Backend (1h)**
1. Créer `generateSiteMenu` dans `menuController.js`
2. Ajouter route dans `menuRoutes.js`
3. Vérifier modèle `Menu.js`
4. Tester avec Postman

### **Étape 2 : Service OpenAI (45min)**
1. Créer/adapter fonction génération
2. Gérer variantes dans le prompt
3. Parser réponse JSON

### **Étape 3 : Frontend UI (1h)**
1. Ajouter section dans `ehpad-dashboard.html`
2. Intégrer `site-menu-generator.js`
3. Gérer événements formulaire

### **Étape 4 : Affichage résultats (45min)**
1. Formatter HTML des menus
2. Afficher variantes clairement
3. Permettre sauvegarde/export

### **Étape 5 : Tests (30min)**
1. Tester site Vulpia (De Linde)
2. Tester site indépendant
3. Vérifier permissions

**Total estimé : 4h**

---

## ✅ Checklist finale

Avant de considérer le système terminé :

- [ ] Fonctionne pour site Vulpia
- [ ] Fonctionne pour site indépendant (groupId null)
- [ ] Fonctionne pour EHPAD
- [ ] Fonctionne pour hôpital
- [ ] Fonctionne pour cantine
- [ ] Gère correctement les permissions
- [ ] Affiche toutes les variantes
- [ ] Sauvegarde les menus en base
- [ ] Export possible (PDF/Excel)
- [ ] Documentation complète

---

## 📝 Notes importantes

### **Éviter**
- ❌ Hardcoder "Vulpia"
- ❌ Supposer qu'un site a toujours un groupId
- ❌ Ignorer le type d'établissement

### **Faire**
- ✅ Utiliser siteId comme identifiant unique
- ✅ Vérifier groupId (peut être null)
- ✅ Adapter selon establishmentType
- ✅ Permissions génériques (pas spécifiques à Vulpia)

---

## 🔖 État actuel

**Date** : 29 octobre 2025, 23:50  
**Commit** : `597cada`  
**Fichier créé** : `client/js/site-menu-generator.js` ✅  
**À continuer demain** : Backend + UI + Tests

---

**Ce document servira de guide complet pour l'implémentation demain. 🚀**

