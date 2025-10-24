# 🎨 SCHÉMA VISUEL - FLUX DE GÉNÉRATION DE MENU PAR IA

## 📐 Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────┐
│                       🎓 PAGE ÉCOLE (Frontend)                      │
│                                                                     │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────┐ │
│  │  📝 Formulaire     │  │  👥 Groupes d'âge  │  │  🍽️ Options │ │
│  │  - Type établ.     │  │  - Maternelle: 30  │  │  - Allergènes│ │
│  │  - Nb plats: 3     │  │  - Primaire: 50    │  │  - Régimes   │ │
│  │  - Thème: Printemps│  │  - Collège: 40     │  │  - Texture   │ │
│  └────────────────────┘  └────────────────────┘  └──────────────┘ │
│                                                                     │
│                        ⬇️ POST /api/intelligent-menu/generate       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ⬇️
┌─────────────────────────────────────────────────────────────────────┐
│                    🖥️ BACKEND - Contrôleur (Node.js)               │
│                                                                     │
│  ÉTAPE 1 : Analyse des données                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  ✅ Total convives: 120 enfants                             │  │
│  │  ✅ Groupe majoritaire: Primaire CP-CE1 (50 enfants)        │  │
│  │  ✅ Allergènes à éviter: gluten, lactose                    │  │
│  │  ✅ Régimes: végétarien, halal                              │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│                        ⬇️                                            │
│                                                                     │
│  ÉTAPE 2 : Construction des filtres MongoDB                        │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  {                                                           │  │
│  │    allergens: { $nin: ["gluten", "lactose"] },              │  │
│  │    establishmentType: { $in: ["ecole", "collectivite"] },   │  │
│  │    $or: [                                                    │  │
│  │      { diet: { $in: ["vegetarien", "halal"] } }             │  │
│  │    ],                                                        │  │
│  │    texture: "normale"                                        │  │
│  │  }                                                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ⬇️
┌─────────────────────────────────────────────────────────────────────┐
│                   🗄️ BASE DE DONNÉES MongoDB                        │
│                                                                     │
│  Collection: RecipeEnriched (510 recettes)                         │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  📊 RECHERCHE :                                             │  │
│  │  510 recettes → Filtres → 150 recettes compatibles         │  │
│  │                                                             │  │
│  │  Recettes gardées :                                         │  │
│  │  ✅ Sans gluten ET sans lactose                            │  │
│  │  ✅ Établissement: école ou collectivité                   │  │
│  │  ✅ Régime végétarien OU halal                             │  │
│  │  ✅ Texture normale                                        │  │
│  │  ✅ Tranche d'âge compatible (6-12 ans)                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│                        ⬇️ 150 recettes                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ⬇️
┌─────────────────────────────────────────────────────────────────────┐
│                  🤖 INTELLIGENCE ARTIFICIELLE (OpenAI)              │
│                                                                     │
│  Modèle : GPT-4o                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  📝 PROMPT SYSTÈME :                                        │  │
│  │  "Tu es un chef expert en nutrition scolaire.               │  │
│  │   Compose un menu ÉQUILIBRÉ pour enfants..."                │  │
│  │                                                             │  │
│  │  📝 PROMPT UTILISATEUR :                                    │  │
│  │  "Compose un menu sur le thème Printemps                    │  │
│  │   pour 120 enfants (3 groupes d'âge).                       │  │
│  │   Choisis 3 recettes parmi ces 150 options..."             │  │
│  │                                                             │  │
│  │  📋 RECETTES FOURNIES (max 40 pour limites tokens) :       │  │
│  │  [                                                          │  │
│  │    {id: "68ece...", title: "Salade carottes",...},          │  │
│  │    {id: "68ece...", title: "Poulet rôti",...},              │  │
│  │    {id: "68ece...", title: "Compote pommes",...},           │  │
│  │    ...                                                      │  │
│  │  ]                                                          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│                        ⬇️ Traitement IA (3-5 secondes)              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  🎯 RÉPONSE IA (format JSON) :                              │  │
│  │  {                                                           │  │
│  │    "title": "Menu Printanier Équilibré",                    │  │
│  │    "description": "Menu coloré avec légumes de saison...",  │  │
│  │    "selectedRecipeIds": [                                   │  │
│  │      "68ece0eea5b41c48e9064216",  // Salade carottes       │  │
│  │      "68ece0eea5b41c48e906423a",  // Poulet rôti           │  │
│  │      "68ece0eea5b41c48e9064298"   // Compote pommes        │  │
│  │    ],                                                       │  │
│  │    "ageAdaptation": "Portions adaptées : Maternelle 70%..." │  │
│  │  }                                                           │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ⬇️
┌─────────────────────────────────────────────────────────────────────┐
│              🍽️ BACKEND - Composition du menu final                │
│                                                                     │
│  ÉTAPE 3 : Récupération des recettes complètes                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  3 recettes sélectionnées par l'IA :                        │  │
│  │  - Salade de carottes râpées (entrée)                       │  │
│  │  - Poulet rôti avec légumes (plat)                          │  │
│  │  - Compote de pommes (dessert)                              │  │
│  │                                                             │  │
│  │  Chaque recette contient :                                  │  │
│  │  ✅ Ingrédients détaillés (quantités, unités)              │  │
│  │  ✅ Instructions de préparation (étapes)                   │  │
│  │  ✅ Valeurs nutritionnelles (kcal, protéines, etc.)        │  │
│  │  ✅ Texture, catégorie, description                        │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│                        ⬇️                                            │
│                                                                     │
│  ÉTAPE 4 : Calcul des portions par groupe d'âge                    │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  📊 MULTIPLICATEURS DE PORTIONS :                           │  │
│  │                                                             │  │
│  │  Groupe 1 : Maternelle (30 enfants)                        │  │
│  │  └─► Multiplicateur : 0.7 (70% d'une portion standard)     │  │
│  │                                                             │  │
│  │  Groupe 2 : Primaire CP-CE1 (50 enfants)                   │  │
│  │  └─► Multiplicateur : 1.0 (100% = portion de référence)    │  │
│  │                                                             │  │
│  │  Groupe 3 : Collège (40 enfants)                           │  │
│  │  └─► Multiplicateur : 1.3 (130% = portion augmentée)       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│                        ⬇️                                            │
│                                                                     │
│  ÉTAPE 5 : Génération de la liste de courses                       │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  📝 CALCUL DES QUANTITÉS TOTALES :                          │  │
│  │                                                             │  │
│  │  Carottes (pour Salade + Poulet rôti) :                    │  │
│  │  • Maternelle : 2kg × 0.7 × 30 = 4.2 kg                    │  │
│  │  • Primaire   : 2kg × 1.0 × 50 = 10.0 kg                   │  │
│  │  • Collège    : 2kg × 1.3 × 40 = 10.4 kg                   │  │
│  │  └─► TOTAL : 24.6 kg de carottes                           │  │
│  │                                                             │  │
│  │  Poulet (pour Poulet rôti) :                                │  │
│  │  • Maternelle : 100g × 0.7 × 30 = 2.1 kg                   │  │
│  │  • Primaire   : 100g × 1.0 × 50 = 5.0 kg                   │  │
│  │  • Collège    : 100g × 1.3 × 40 = 5.2 kg                   │  │
│  │  └─► TOTAL : 12.3 kg de poulet                             │  │
│  │                                                             │  │
│  │  ... (calcul similaire pour tous les ingrédients)          │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ⬇️
┌─────────────────────────────────────────────────────────────────────┐
│                  📤 RÉPONSE JSON COMPLÈTE AU FRONTEND               │
│                                                                     │
│  {                                                                  │
│    "success": true,                                                 │
│    "menu": {                                                        │
│      "title": "Menu Printanier Équilibré",                          │
│      "description": "Menu coloré avec légumes de saison...",        │
│                                                                     │
│      "mainMenu": {                                                  │
│        "dishes": [                                                  │
│          {                                                          │
│            "name": "Salade de carottes râpées",                     │
│            "category": "entrée",                                    │
│            "ingredients": [{name:"Carottes",quantity:2,unit:"kg"}], │
│            "nutritionalProfile": {kcal:85, protein:2, carbs:12},    │
│            "preparationSteps": ["Laver les carottes", "Râper",...] │
│          },                                                         │
│          { "name": "Poulet rôti avec légumes", ... },               │
│          { "name": "Compote de pommes", ... }                       │
│        ]                                                            │
│      },                                                             │
│                                                                     │
│      "variants": [                                                  │
│        {                                                            │
│          "ageRange": "maternelle",                                  │
│          "count": 30,                                               │
│          "portionMultiplier": 0.7,                                  │
│          "dishes": [/* mêmes plats, quantités × 0.7 */]             │
│        },                                                           │
│        {                                                            │
│          "ageRange": "primaire_cp_ce1",                             │
│          "count": 50,                                               │
│          "portionMultiplier": 1.0,                                  │
│          "dishes": [/* portions standards */]                       │
│        },                                                           │
│        {                                                            │
│          "ageRange": "college",                                     │
│          "count": 40,                                               │
│          "portionMultiplier": 1.3,                                  │
│          "dishes": [/* portions augmentées */]                      │
│        }                                                            │
│      ],                                                             │
│                                                                     │
│      "shoppingList": [                                              │
│        {                                                            │
│          "name": "Carottes",                                        │
│          "quantity": 24.6,                                          │
│          "unit": "kg",                                              │
│          "requiredFor": ["Salade carottes", "Poulet rôti"]         │
│        },                                                           │
│        {                                                            │
│          "name": "Poulet",                                          │
│          "quantity": 12.3,                                          │
│          "unit": "kg",                                              │
│          "requiredFor": ["Poulet rôti avec légumes"]               │
│        },                                                           │
│        // ... autres ingrédients                                   │
│      ]                                                              │
│    }                                                                │
│  }                                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                                    ⬇️
┌─────────────────────────────────────────────────────────────────────┐
│                   🎨 AFFICHAGE FRONTEND (Page École)                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │  📋 MENU PRINTANIER ÉQUILIBRÉ                               │  │
│  │  ────────────────────────────────────────────────────────   │  │
│  │                                                             │  │
│  │  🥗 ENTRÉE : Salade de carottes râpées                      │  │
│  │  • Description : Salade fraîche et croquante...             │  │
│  │  • Nutrition : 85 kcal, 2g protéines, 12g glucides          │  │
│  │  • Ingrédients : 2 kg de carottes, citron, huile...         │  │
│  │                                                             │  │
│  │  🍗 PLAT : Poulet rôti avec légumes                         │  │
│  │  • Description : Poulet tendre avec accompagnement...       │  │
│  │  • Nutrition : 420 kcal, 35g protéines, 25g glucides        │  │
│  │  • Ingrédients : 100g poulet, carottes, pommes de terre...  │  │
│  │                                                             │  │
│  │  🍎 DESSERT : Compote de pommes                             │  │
│  │  • Description : Compote onctueuse maison...                │  │
│  │  • Nutrition : 95 kcal, 0.5g protéines, 22g glucides        │  │
│  │  • Ingrédients : 150g pommes, sucre, cannelle...            │  │
│  │                                                             │  │
│  │  ────────────────────────────────────────────────────────   │  │
│  │  👥 ADAPTATIONS PAR GROUPE :                                │  │
│  │  • 30 Maternelle → portions à 70%                           │  │
│  │  • 50 Primaire CP-CE1 → portions standards 100%             │  │
│  │  • 40 Collège → portions augmentées 130%                    │  │
│  │                                                             │  │
│  │  🛒 LISTE DE COURSES (pour 120 convives) :                  │  │
│  │  • Carottes : 24.6 kg                                       │  │
│  │  • Poulet : 12.3 kg                                         │  │
│  │  • Pommes : 8.5 kg                                          │  │
│  │  • ... (liste complète)                                     │  │
│  │                                                             │  │
│  │  [📥 Télécharger PDF]  [🛒 Commander]  [💾 Sauvegarder]     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUX SIMPLIFIÉ

```
Utilisateur
    │
    ├─► 1. Remplit formulaire (groupes d'âge, restrictions)
    │
    ⬇
Backend
    │
    ├─► 2. Filtre 510 recettes → 150 compatibles (MongoDB)
    │
    ⬇
IA (GPT-4o)
    │
    ├─► 3. Sélectionne 3 recettes optimales (équilibre nutritionnel)
    │
    ⬇
Backend
    │
    ├─► 4. Calcule portions par groupe d'âge
    ├─► 5. Génère liste de courses
    │
    ⬇
Frontend
    │
    └─► 6. Affiche menu complet + liste de courses
```

---

## ⏱️ TEMPS DE TRAITEMENT

```
┌─────────────────────┬──────────────┬─────────────────┐
│ ÉTAPE               │ TEMPS        │ COMPOSANT       │
├─────────────────────┼──────────────┼─────────────────┤
│ Envoi formulaire    │ < 0.1s       │ Frontend        │
│ Filtrage recettes   │ 0.5-1s       │ MongoDB         │
│ Sélection IA        │ 3-5s         │ OpenAI GPT-4o   │
│ Calculs portions    │ 0.2-0.5s     │ Backend         │
│ Affichage menu      │ < 0.1s       │ Frontend        │
├─────────────────────┼──────────────┼─────────────────┤
│ TOTAL               │ 4-7 secondes │                 │
└─────────────────────┴──────────────┴─────────────────┘
```

---

## 🎯 CRITÈRES DE SÉLECTION DE L'IA

```
┌───────────────────────────────────────────────────────┐
│           🧠 INTELLIGENCE DE SÉLECTION                │
├───────────────────────────────────────────────────────┤
│                                                       │
│  1️⃣ ÉQUILIBRE NUTRITIONNEL (Poids: 40%)              │
│     • Protéines + Glucides + Lipides bien répartis   │
│     • Apport calorique adapté à l'âge                │
│     • Présence de légumes et fibres                  │
│                                                       │
│  2️⃣ VARIÉTÉ (Poids: 25%)                             │
│     • Pas de répétition d'ingrédients principaux     │
│     • Diversité des textures et couleurs             │
│     • Alternance chaud/froid                         │
│                                                       │
│  3️⃣ ADAPTATION À L'ÂGE (Poids: 20%)                  │
│     • Plats adaptés aux préférences enfants          │
│     • Facilité de mastication et déglutition         │
│     • Présentation attractive                        │
│                                                       │
│  4️⃣ RESPECT DES CONTRAINTES (Poids: 15%)             │
│     • Aucun allergène interdit                       │
│     • Conformité aux régimes (végétarien, halal...)  │
│     • Texture appropriée (normale, mixée...)         │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## 🔍 EXEMPLE DE DÉCISION IA

**Contexte** : Menu pour école, 120 enfants, thème Printemps, pas de gluten

**Recettes disponibles** : 35 options après filtrage

**Processus de l'IA** :

```
Analyse des 35 recettes :
├─► Catégorie "entrée" : 8 options
│   └─► Sélection : "Salade de carottes" ✅
│       Raison : Légère, colorée, apport fibres, sans gluten
│
├─► Catégorie "plat" : 18 options
│   └─► Sélection : "Poulet rôti légumes" ✅
│       Raison : Protéines, légumes de saison, populaire auprès enfants
│
└─► Catégorie "dessert" : 9 options
    └─► Sélection : "Compote pommes" ✅
        Raison : Léger, fruité, facile à digérer, sans gluten
```

**Vérifications finales de l'IA** :
- ✅ Équilibre : Protéines (poulet) + Glucides (légumes) + Fibres (carottes, pommes)
- ✅ Pas de répétition : carottes utilisées dans 2 plats mais de façon différente
- ✅ Couleurs : Orange (carottes), Doré (poulet), Jaune (pommes)
- ✅ Thème Printemps : Légumes frais, plats légers

---

✅ **La logique est maintenant complètement documentée avec schémas visuels !**

