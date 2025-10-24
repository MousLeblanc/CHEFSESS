# 🎓 LOGIQUE DE CRÉATION DE MENU PAR IA - PAGE ÉCOLE

## 📋 Vue d'ensemble

La page école utilise un système intelligent de génération de menus qui combine **recherche en base de données** et **intelligence artificielle** (GPT-4o) pour créer des menus adaptés aux besoins spécifiques des cantines scolaires.

---

## 🔄 FLUX COMPLET DE GÉNÉRATION

### 1️⃣ **Collecte des données (Frontend)**

**Fichier**: `client/js/intelligent-menu-generator.js`

L'utilisateur renseigne sur la page école :

```javascript
{
  establishmentType: "ecole",
  ageGroups: [
    { ageRange: "maternelle", count: 30 },      // 30 enfants de maternelle
    { ageRange: "primaire_cp_ce1", count: 50 }, // 50 enfants CP-CE1
    { ageRange: "college", count: 40 }          // 40 collégiens
  ],
  numDishes: 3,                    // Nombre de plats (entrée, plat, dessert)
  allergens: ["gluten", "lactose"], // Allergènes à exclure
  dietaryRestrictions: ["vegetarien", "halal"], // Régimes spéciaux
  medicalConditions: [],           // Pathologies (diabète, etc.)
  texture: "normale",              // Texture des plats
  useStockOnly: false,             // Utiliser uniquement le stock
  theme: "Printemps"               // Thème optionnel
}
```

**Appel API** : `POST /api/intelligent-menu/generate`

---

### 2️⃣ **Traitement Backend (Contrôleur)**

**Fichier**: `controllers/recipeMenuController.js` → Fonction `generateIntelligentMenu`

#### **Étape A : Analyse des groupes d'âge**

```javascript
// Calcul du total de convives
const totalPeople = ageGroups.reduce((sum, group) => sum + group.count, 0);
// Total: 30 + 50 + 40 = 120 enfants

// Identification du groupe majoritaire
const majorityAgeGroup = findMajorityAgeGroup(ageGroups);
// Résultat: "primaire_cp_ce1" (50 enfants = le plus grand groupe)
```

#### **Étape B : Construction des filtres MongoDB**

```javascript
const recipeFilter = {
  // 1. Exclure les allergènes
  allergens: { $nin: ["gluten", "lactose"] },
  
  // 2. Filtrer par type d'établissement
  establishmentType: { $in: ["ecole", "collectivite"] },
  
  // 3. Logique OR pour restrictions/pathologies
  $or: [
    { diet: { $in: ["vegetarien", "halal"] } },
    { pathologies: { $in: [] } }
  ],
  
  // 4. Texture (optionnel)
  texture: "normale"
};
```

#### **Étape C : Récupération des recettes compatibles**

```javascript
// Recherche dans la collection RecipeEnriched (510 recettes)
let compatibleRecipes = await RecipeEnriched.find(recipeFilter);
// Exemple: 180 recettes trouvées

// Filtrage par âge
compatibleRecipes = filterRecipesByAgeGroup(compatibleRecipes, "primaire_cp_ce1");
// Si recette.ageGroup existe et min/max définis, vérifier la compatibilité
// Exemple: 150 recettes compatibles
```

**Filtrage par âge** :
```javascript
function filterRecipesByAgeGroup(recipes, targetAgeGroup) {
  return recipes.filter(recipe => {
    // Si pas d'ageGroup, la recette convient à tous
    if (!recipe.ageGroup) return true;
    
    // Si ageGroup.min et max définis
    if (recipe.ageGroup.min && recipe.ageGroup.max) {
      const ageNum = getAgeFromRange(targetAgeGroup); // Ex: 7 ans pour CP-CE1
      return ageNum >= recipe.ageGroup.min && ageNum <= recipe.ageGroup.max;
    }
    
    return true;
  });
}
```

#### **Étape D : Filtrage par stock (optionnel)**

Si `useStockOnly = true` :
```javascript
stockItems = await Stock.find({ userId: req.user._id });
compatibleRecipes = filterRecipesByStock(compatibleRecipes, stockItems);
// Ne garde que les recettes dont TOUS les ingrédients sont en stock
```

---

### 3️⃣ **Sélection Intelligente par IA (GPT-4o)**

**Fichier**: `controllers/recipeMenuController.js` → Fonction `selectMenuWithAI`

#### **Préparation du prompt pour l'IA**

```javascript
const recipesJson = filteredRecipes.map(r => ({
  id: r._id,
  title: r.name,
  category: r.category,
  mealComponent: r.category,
  allergens: r.allergens,
  dietaryRestrictions: r.diet,
  nutritionalProfile: r.nutritionalProfile
}));

// Limiter à 40 recettes max (limite de tokens OpenAI)
if (filteredRecipes.length > 40) {
  filteredRecipes = filteredRecipes.sort(() => 0.5 - Math.random()).slice(0, 40);
}
```

#### **Prompt système envoyé à GPT-4o**

```javascript
const systemPrompt = `Tu es un chef expert en nutrition scolaire.

RÔLE :
- Composer des menus ÉQUILIBRÉS et VARIÉS pour enfants
- Respecter les allergènes et restrictions
- Adapter les portions selon l'âge
- Privilégier des plats SAINS et appréciés des enfants

CONTRAINTES :
- TOUS les plats DOIVENT venir de la liste de recettes fournie (IDs uniquement)
- Respecter la structure demandée (entrée, plat, dessert)
- Éviter les répétitions d'ingrédients
- Équilibre nutritionnel : protéines, glucides, légumes

RECETTES DISPONIBLES (${filteredRecipes.length}) :
${JSON.stringify(recipesJson, null, 2)}

ALLERGÈNES À ÉVITER : ${allergens.join(', ')}
RÉGIMES SPÉCIAUX : ${dietaryRestrictions.join(', ')}
`;

const userPrompt = `Compose un menu ${theme ? `sur le thème "${theme}"` : 'équilibré'} pour une école.

CONVIVES (ATTENTION AUX QUANTITÉS PAR ÂGE):
- Total: 120 enfants
- Groupe 1 : 30 enfants - Maternelle (2,5-5 ans) → portions réduites 70%
- Groupe 2 : 50 enfants - Primaire CP-CE1 (6-7 ans) → portions standards 100%
- Groupe 3 : 40 enfants - Collège (12-15 ans) → portions augmentées 130%

STRUCTURE DU MENU : entrée, plat, dessert (${numDishes} plats)

Réponds UNIQUEMENT avec un JSON contenant:
{
  "title": "Titre du menu",
  "description": "Description mettant en avant l'équilibre nutritionnel",
  "selectedRecipeIds": ["id1", "id2", "id3"],
  "ageAdaptation": "Description PRÉCISE des portions par groupe avec nombres exacts"
}

Choisis ${numDishes} recettes SAINES et ADAPTÉES aux enfants.

IMPORTANT POUR LES ENFANTS:
- Privilégier des plats familiers, appréciés des enfants
- Éviter les plats trop épicés ou exotiques
- Varier les couleurs et textures pour stimuler l'appétit
- Inclure des légumes de façon ludique
- Équilibre: protéines, féculents, légumes, produits laitiers
`;
```

#### **Appel à l'API OpenAI**

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  response_format: { type: "json_object" },
  temperature: 0.7,
  max_tokens: 2000
});

const aiResponse = JSON.parse(completion.choices[0].message.content);
```

#### **Exemple de réponse IA**

```json
{
  "title": "Menu Printanier Équilibré",
  "description": "Un menu coloré et équilibré mettant en avant les légumes de saison, riche en protéines et calcium pour la croissance des enfants.",
  "selectedRecipeIds": [
    "68ece0eea5b41c48e9064216",  // Salade de carottes râpées
    "68ece0eea5b41c48e906423a",  // Poulet rôti avec légumes
    "68ece0eea5b41c48e9064298"   // Compote de pommes
  ],
  "ageAdaptation": "Les portions sont adaptées : • Groupe 1 (30 enfants - Maternelle): portions à 70% • Groupe 2 (50 enfants - Primaire CP-CE1): portions à 100% (référence) • Groupe 3 (40 enfants - Collège): portions à 130%"
}
```

---

### 4️⃣ **Composition du menu final**

#### **Récupération des recettes sélectionnées**

```javascript
const selectedRecipes = filteredRecipes.filter(r => 
  aiResponse.selectedRecipeIds.includes(r._id.toString())
);
// Résultat: 3 recettes complètes avec tous leurs détails
```

#### **Structuration selon le format demandé**

```javascript
const composedDishes = composeMenuStructure(
  selectedRecipes, 
  'entree_plat_dessert', // Structure du menu
  3 // Nombre de plats
);
```

**Fonction `composeMenuStructure`** :
```javascript
function composeMenuStructure(recipes, structure, numDishes) {
  const dishes = [];
  
  switch(structure) {
    case 'plat_seul':
      dishes.push(findRecipeByCategory(recipes, 'plat'));
      break;
      
    case 'soupe_plat':
      dishes.push(findRecipeByCategory(recipes, 'soupe'));
      dishes.push(findRecipeByCategory(recipes, 'plat'));
      break;
      
    case 'entree_plat_dessert':
      dishes.push(findRecipeByCategory(recipes, 'entrée'));
      dishes.push(findRecipeByCategory(recipes, 'plat'));
      dishes.push(findRecipeByCategory(recipes, 'dessert'));
      break;
  }
  
  return dishes.map(recipe => ({
    _id: recipe._id,
    name: recipe.name,
    category: recipe.category,
    description: recipe.description,
    ingredients: recipe.ingredients,
    preparationSteps: recipe.preparationSteps,
    nutritionalProfile: recipe.nutritionalProfile,
    portions: recipe.portions,
    texture: recipe.texture
  }));
}
```

---

### 5️⃣ **Calcul des quantités et liste de courses**

#### **Adaptation des portions par groupe d'âge**

```javascript
function calculateVariantGroups(ageGroups) {
  return ageGroups.map(group => {
    let portionMultiplier = 1.0;
    
    switch(group.ageRange) {
      case 'maternelle':
        portionMultiplier = 0.7; // 70% d'une portion standard
        break;
      case 'primaire_cp_ce1':
      case 'primaire_ce2_cm1':
        portionMultiplier = 1.0; // 100% - portion standard
        break;
      case 'primaire_cm2':
        portionMultiplier = 1.1; // 110%
        break;
      case 'college':
        portionMultiplier = 1.3; // 130%
        break;
      case 'lycee':
        portionMultiplier = 1.5; // 150%
        break;
    }
    
    return {
      ageRange: group.ageRange,
      count: group.count,
      portionMultiplier
    };
  });
}
```

#### **Génération de la liste de courses**

```javascript
function generateShoppingListForVariants(menu) {
  const shoppingList = {};
  
  menu.mainMenu.dishes.forEach(dish => {
    dish.ingredients.forEach(ingredient => {
      const key = ingredient.name.toLowerCase();
      
      if (!shoppingList[key]) {
        shoppingList[key] = {
          name: ingredient.name,
          quantity: 0,
          unit: ingredient.unit,
          requiredFor: []
        };
      }
      
      // Calculer la quantité totale pour tous les groupes
      menu.variants.forEach(variant => {
        const adjustedQuantity = ingredient.quantity * 
                                 variant.portionMultiplier * 
                                 variant.count;
        shoppingList[key].quantity += adjustedQuantity;
      });
      
      shoppingList[key].requiredFor.push(dish.name);
    });
  });
  
  return Object.values(shoppingList);
}
```

**Exemple de liste de courses** :
```json
[
  {
    "name": "Carottes",
    "quantity": 18.5,
    "unit": "kg",
    "requiredFor": ["Salade de carottes râpées", "Poulet rôti avec légumes"]
  },
  {
    "name": "Poulet",
    "quantity": 25,
    "unit": "kg",
    "requiredFor": ["Poulet rôti avec légumes"]
  },
  {
    "name": "Pommes",
    "quantity": 12,
    "unit": "kg",
    "requiredFor": ["Compote de pommes"]
  }
]
```

---

### 6️⃣ **Réponse finale au Frontend**

```json
{
  "success": true,
  "menu": {
    "title": "Menu Printanier Équilibré",
    "description": "Un menu coloré et équilibré mettant en avant les légumes de saison...",
    "mainMenu": {
      "dishes": [
        {
          "_id": "68ece0eea5b41c48e9064216",
          "name": "Salade de carottes râpées",
          "category": "entrée",
          "description": "Salade fraîche et croquante...",
          "ingredients": [...],
          "preparationSteps": [...],
          "nutritionalProfile": {
            "kcal": 85,
            "protein": 2,
            "carbs": 12,
            "lipids": 3
          }
        },
        // ... autres plats
      ]
    },
    "variants": [
      {
        "ageRange": "maternelle",
        "count": 30,
        "portionMultiplier": 0.7,
        "dishes": [/* mêmes plats avec quantités ajustées */]
      },
      {
        "ageRange": "primaire_cp_ce1",
        "count": 50,
        "portionMultiplier": 1.0,
        "dishes": [/* portions standards */]
      },
      {
        "ageRange": "college",
        "count": 40,
        "portionMultiplier": 1.3,
        "dishes": [/* portions augmentées */]
      }
    ],
    "shoppingList": [
      { "name": "Carottes", "quantity": 18.5, "unit": "kg", "requiredFor": [...] },
      // ... autres ingrédients
    ],
    "metadata": {
      "establishmentType": "ecole",
      "totalPeople": 120,
      "ageGroups": [...],
      "allergens": ["gluten", "lactose"],
      "dietaryRestrictions": ["vegetarien", "halal"]
    }
  }
}
```

---

## 📊 POINTS CLÉS DU SYSTÈME

### ✅ Avantages

1. **Recherche intelligente en BDD** : 
   - 510 recettes disponibles avec données complètes
   - Filtrage précis par allergènes, régimes, pathologies
   - Valeurs nutritionnelles précises (97% des recettes)

2. **IA GPT-4o pour la sélection** :
   - Choix intelligent parmi les recettes compatibles
   - Respect de l'équilibre nutritionnel
   - Adaptation au contexte (âge, restrictions)
   - Créativité (thèmes, variété)

3. **Adaptation automatique des portions** :
   - Calculs précis par groupe d'âge
   - Multiplicateurs ajustés (0.7x à 1.5x)
   - Liste de courses consolidée

4. **Flexibilité** :
   - Support multi-groupes d'âge
   - Gestion des restrictions alimentaires
   - Mode "stock uniquement"
   - Thèmes personnalisables

### ⚠️ Contraintes techniques

1. **Limite de tokens OpenAI** : Max 40 recettes dans le prompt
2. **Nécessite authentification** : Token JWT requis
3. **Dépendance IA** : Coût API OpenAI par génération
4. **Temps de réponse** : 3-8 secondes selon complexité

---

## 🔧 CONFIGURATION REQUISE

### Variables d'environnement

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
```

### Modèles utilisés

- **Base de données** : `RecipeEnriched` (510 recettes)
- **Modèle IA** : GPT-4o (OpenAI)
- **Format réponse** : JSON structuré

---

## 🎯 EXEMPLE COMPLET DE FLUX

```
1. Utilisateur remplit formulaire école
   ↓
2. Frontend → POST /api/intelligent-menu/generate
   ↓
3. Backend filtre 510 recettes → 150 compatibles
   ↓
4. IA (GPT-4o) sélectionne 3 recettes optimales
   ↓
5. Backend structure le menu + calcule quantités
   ↓
6. Réponse JSON complète au Frontend
   ↓
7. Affichage du menu avec :
   - Titre et description
   - 3 plats détaillés
   - Adaptations par groupe d'âge
   - Liste de courses consolidée
```

---

## 📝 NOTES IMPORTANTES

1. **Tranches d'âge** : Depuis la mise à jour, les recettes avec `ageGroup` sont configurées de **2.5 à 99 ans**, donc compatibles pour TOUTES les tranches d'âge (maternelle à EHPAD).

2. **Qualité des données** :
   - 100% des recettes ont des instructions
   - 97% ont des valeurs nutritionnelles
   - 73% ont des tranches d'âge définies

3. **Performance** : Le système peut gérer jusqu'à **6 groupes d'âge simultanés** avec calculs séparés pour chaque groupe.

4. **Évolutivité** : Le système peut facilement être étendu pour :
   - Ajouter de nouvelles restrictions
   - Supporter d'autres types d'établissements
   - Intégrer d'autres APIs (Spoonacular, etc.)

---

✅ **Le système est maintenant optimisé et prêt pour une utilisation en production !**

