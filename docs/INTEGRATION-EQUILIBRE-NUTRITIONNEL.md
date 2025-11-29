# Intégration de l'Équilibre Nutritionnel et Conformité Réglementaire

## 📋 Vue d'ensemble

Ce document décrit l'intégration des points suivants dans l'application :
1. **Équilibre nutritionnel par groupe** : Menus équilibrés adaptés à chaque groupe de résidents
2. **Prise en compte des restrictions** : Gestion complète des restrictions alimentaires
3. **Dressage de l'assiette** : Suggestions de présentation esthétique
4. **Conformité AVIQ** : Respect du fréquentiel AVIQ
5. **Conformité Annexe 120** : Respect des normes wallonnes

---

## 1. Équilibre Nutritionnel par Groupe

### Objectif
Chaque groupe de résidents doit recevoir un menu équilibré adapté à ses besoins spécifiques (âge, pathologie, dépendance).

### Implémentation

#### A. Calcul de l'équilibre nutritionnel par groupe

```javascript
// models/NutritionalBalance.js (nouveau modèle)
const nutritionalBalanceSchema = {
  groupId: ObjectId, // Référence au groupe de résidents
  targetMacros: {
    proteins: { min: Number, max: Number, target: Number }, // g/jour
    carbs: { min: Number, max: Number, target: Number },    // g/jour
    fats: { min: Number, max: Number, target: Number }       // g/jour
  },
  targetMicros: {
    calcium: Number,      // mg/jour
    iron: Number,         // mg/jour
    vitaminC: Number,     // mg/jour
    vitaminD: Number,     // µg/jour
    fiber: Number         // g/jour
  },
  ageRange: String,      // "65-75", "75-85", "85+"
  dependencyLevel: String, // "autonome", "semi-autonome", "dépendant"
  medicalConditions: [String] // ["diabète", "hypertension", etc.]
}
```

#### B. Vérification de l'équilibre dans la génération de menu

**IMPORTANT :** Les objectifs nutritionnels sont calculés sur l'**ENSEMBLE DU MENU** (entrée + plat + dessert), pas sur un plat individuel.

```javascript
// Dans scripts/generate-custom-menu.js

/**
 * Calcule la nutrition totale d'un menu complet (entrée + plat + dessert)
 * Les valeurs nutritionnelles sont additionnées sur tous les plats
 */
function calculateTotalNutrition(menu) {
  const totalNutrition = {
    proteins: 0,      // g
    carbs: 0,         // g
    fats: 0,          // g
    calories: 0,      // kcal
    calcium: 0,       // mg
    iron: 0,          // mg
    vitaminC: 0,      // mg
    vitaminD: 0,      // µg
    fiber: 0,         // g
    sodium: 0         // mg
  };
  
  // Additionner les valeurs nutritionnelles de TOUS les plats du menu
  if (menu.dishes && Array.isArray(menu.dishes)) {
    menu.dishes.forEach(dish => {
      const dishNutrition = dish.nutritionalProfile || dish.nutrition || {};
      const servings = dish.servings || 1;
      
      // Multiplier par le nombre de portions
      totalNutrition.proteins += (dishNutrition.protein || dishNutrition.proteins || 0) * servings;
      totalNutrition.carbs += (dishNutrition.carbs || dishNutrition.carbohydrates || 0) * servings;
      totalNutrition.fats += (dishNutrition.fats || dishNutrition.lipids || 0) * servings;
      totalNutrition.calories += (dishNutrition.kcal || dishNutrition.calories || 0) * servings;
      totalNutrition.calcium += (dishNutrition.calcium || 0) * servings;
      totalNutrition.iron += (dishNutrition.iron || 0) * servings;
      totalNutrition.vitaminC += (dishNutrition.vitaminC || 0) * servings;
      totalNutrition.vitaminD += (dishNutrition.vitaminD || 0) * servings;
      totalNutrition.fiber += (dishNutrition.fiber || dishNutrition.fibers || 0) * servings;
      totalNutrition.sodium += (dishNutrition.sodium || 0) * servings;
    });
  }
  
  return totalNutrition;
}

/**
 * Vérifie si le menu complet respecte les objectifs nutritionnels
 * Les objectifs peuvent être atteints en combinant plusieurs plats
 * Exemple: 20g de protéines = 15g dans le plat + 5g dans le dessert
 */
async function verifyNutritionalBalance(menu, nutritionalGoals, groupInfo) {
  // Calculer la nutrition totale du menu complet
  const totalNutrition = calculateTotalNutrition(menu);
  
  const balance = {
    proteins: {
      target: nutritionalGoals.proteins?.target || 0,
      min: nutritionalGoals.proteins?.min || 0,
      max: nutritionalGoals.proteins?.max || 0,
      actual: totalNutrition.proteins,
      status: checkRange(totalNutrition.proteins, nutritionalGoals.proteins),
      percent: nutritionalGoals.proteins?.target ? 
        (totalNutrition.proteins / nutritionalGoals.proteins.target * 100) : 0
    },
    carbs: {
      target: nutritionalGoals.carbs?.target || 0,
      min: nutritionalGoals.carbs?.min || 0,
      max: nutritionalGoals.carbs?.max || 0,
      actual: totalNutrition.carbs,
      status: checkRange(totalNutrition.carbs, nutritionalGoals.carbs),
      percent: nutritionalGoals.carbs?.target ? 
        (totalNutrition.carbs / nutritionalGoals.carbs.target * 100) : 0
    },
    fats: {
      target: nutritionalGoals.fats?.target || 0,
      min: nutritionalGoals.fats?.min || 0,
      max: nutritionalGoals.fats?.max || 0,
      actual: totalNutrition.fats,
      status: checkRange(totalNutrition.fats, nutritionalGoals.fats),
      percent: nutritionalGoals.fats?.target ? 
        (totalNutrition.fats / nutritionalGoals.fats.target * 100) : 0
    },
    calcium: {
      target: nutritionalGoals.calcium || 0,
      actual: totalNutrition.calcium,
      status: totalNutrition.calcium >= (nutritionalGoals.calcium || 0) ? 'OK' : 'INSUFFISANT',
      percent: nutritionalGoals.calcium ? 
        (totalNutrition.calcium / nutritionalGoals.calcium * 100) : 0
    },
    // ... autres micronutriments
  };
  
  // Calculer le score global (moyenne des pourcentages d'atteinte)
  const scores = Object.values(balance)
    .filter(b => b.target > 0)
    .map(b => Math.min(b.percent / 100, 1)); // Limiter à 100%
  
  const score = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  
  return {
    balanced: score >= 0.8, // 80% des objectifs atteints
    score: score,
    totalNutrition: totalNutrition,
    details: balance,
    recommendations: generateRecommendations(balance, nutritionalGoals, totalNutrition)
  };
}

/**
 * Génère des recommandations pour améliorer l'équilibre
 */
function generateRecommendations(balance, nutritionalGoals, totalNutrition) {
  const recommendations = [];
  
  // Protéines insuffisantes
  if (balance.proteins.actual < balance.proteins.min) {
    const deficit = balance.proteins.min - balance.proteins.actual;
    recommendations.push({
      type: 'proteins',
      issue: 'insuffisant',
      deficit: deficit,
      suggestion: `Ajouter ${deficit.toFixed(1)}g de protéines. Options: augmenter la portion de viande/poisson, ajouter des légumineuses au plat, ou un dessert protéiné (yaourt grec, fromage blanc).`
    });
  }
  
  // Protéines excessives
  if (balance.proteins.actual > balance.proteins.max) {
    const excess = balance.proteins.actual - balance.proteins.max;
    recommendations.push({
      type: 'proteins',
      issue: 'excessif',
      excess: excess,
      suggestion: `Réduire de ${excess.toFixed(1)}g de protéines. Options: réduire la portion de protéine animale, remplacer par des légumes ou féculents.`
    });
  }
  
  // Calcium insuffisant
  if (balance.calcium.actual < balance.calcium.target) {
    const deficit = balance.calcium.target - balance.calcium.actual;
    recommendations.push({
      type: 'calcium',
      issue: 'insuffisant',
      deficit: deficit,
      suggestion: `Ajouter ${deficit.toFixed(0)}mg de calcium. Options: fromage en entrée, yaourt en dessert, produits laitiers dans le plat.`
    });
  }
  
  // ... autres recommandations
  
  return recommendations;
}
```

#### C. Amélioration du prompt IA

**IMPORTANT :** Le prompt doit expliquer que les objectifs sont calculés sur l'**ENSEMBLE DU MENU**, pas sur un plat individuel.

```javascript
// Dans scripts/generate-custom-menu.js - selectBestRecipeWithAI

const nutritionalBalancePrompt = `
ÉQUILIBRE NUTRITIONNEL OBLIGATOIRE PAR GROUPE:

Groupe: ${groupInfo.name}
- Tranche d'âge: ${groupInfo.ageRange}
- Niveau de dépendance: ${groupInfo.dependencyLevel}
- Pathologies: ${groupInfo.medicalConditions.join(', ')}

OBJECTIFS NUTRITIONNELS À RESPECTER (pour l'ENSEMBLE du menu: entrée + plat + dessert):
- Protéines: ${nutritionalGoals.proteins.target}g/jour (min: ${nutritionalGoals.proteins.min}g, max: ${nutritionalGoals.proteins.max}g)
- Glucides: ${nutritionalGoals.carbs.target}g/jour (min: ${nutritionalGoals.carbs.min}g, max: ${nutritionalGoals.carbs.max}g)
- Lipides: ${nutritionalGoals.fats.target}g/jour (min: ${nutritionalGoals.fats.min}g, max: ${nutritionalGoals.fats.max}g)
- Calcium: ${nutritionalGoals.calcium}mg/jour minimum
- Fer: ${nutritionalGoals.iron}mg/jour minimum
- Vitamine C: ${nutritionalGoals.vitaminC}mg/jour minimum
- Fibres: ${nutritionalGoals.fiber}g/jour minimum

⚠️ RÈGLE FONDAMENTALE: Les objectifs nutritionnels sont calculés sur l'ENSEMBLE DU MENU, pas sur un plat individuel.
Exemple: Si 20g de protéines sont demandées, elles peuvent être réparties entre:
- Le plat principal (ex: 15g)
- Le dessert (ex: 5g de yaourt grec ou fromage blanc)
- L'entrée (ex: 2g de fromage)

Tu DOIS sélectionner des recettes qui, COMBINÉES, permettent d'atteindre ces objectifs.
Si le menu actuel ne permet pas d'atteindre les objectifs, suggère des ajustements ou des alternatives.
`;
```

---

## 2. Prise en Compte des Restrictions

### Objectif
Toutes les restrictions alimentaires (allergies, régimes, pathologie, éthique) doivent être strictement respectées.

### Implémentation

#### A. Hiérarchie des restrictions

```javascript
// models/DietaryRestriction.js (nouveau modèle ou extension)

const restrictionPriority = {
  CRITICAL: ['allergie', 'intolérance'],      // Ne jamais violer
  HIGH: ['pathologie', 'régime_médical'],     // Strictement respecter
  MEDIUM: ['préférence_éthique', 'religion'], // Respecter si possible
  LOW: ['préférence_personnelle']             // Suggérer mais flexible
};

function checkRestrictions(recipe, restrictions) {
  const violations = [];
  
  restrictions.forEach(restriction => {
    const priority = restrictionPriority[restriction.priority] || 'MEDIUM';
    
    if (priority === 'CRITICAL' || priority === 'HIGH') {
      if (recipeContains(recipe, restriction.forbiddenIngredients)) {
        violations.push({
          restriction: restriction.name,
          priority: restriction.priority,
          severity: 'BLOCKING'
        });
      }
    }
  });
  
  return {
    allowed: violations.length === 0,
    violations: violations
  };
}
```

#### B. Filtrage pré-IA

```javascript
// Dans scripts/generate-custom-menu.js

async function filterRecipesByRestrictions(recipes, residentsGroups) {
  const allowedRecipes = [];
  
  recipes.forEach(recipe => {
    let isAllowed = true;
    const restrictions = [];
    
    residentsGroups.forEach(group => {
      group.restrictions.forEach(restriction => {
        if (!checkRestriction(recipe, restriction)) {
          isAllowed = false;
          restrictions.push({
            group: group.name,
            restriction: restriction.name,
            reason: restriction.reason
          });
        }
      });
    });
    
    if (isAllowed) {
      allowedRecipes.push({
        recipe: recipe,
        compatibleGroups: residentsGroups.filter(g => 
          g.restrictions.every(r => checkRestriction(recipe, r))
        )
      });
    }
  });
  
  return allowedRecipes;
}
```

---

## 3. Dressage de l'Assiette

### Objectif
Chaque recette doit inclure des suggestions de présentation pour une assiette esthétique et appétissante.

### Implémentation

#### A. Extension du modèle Recipe

```javascript
// models/Recipe.js - Ajouter

const recipeSchema = {
  // ... champs existants
  plating: {
    description: String,        // Description textuelle du dressage
    instructions: [String],     // Étapes de présentation
    visualElements: {
      colors: [String],          // Couleurs dominantes
      textures: [String],        // Textures variées
      height: String,            // "plat", "moyen", "haut"
      arrangement: String        // "central", "dispersé", "asymétrique"
    },
    garnishes: [{
      name: String,
      placement: String,        // "bord", "centre", "dessus"
      quantity: String
    }],
    plateType: String,           // "assiette_creuse", "assiette_plate", "bol"
    servingStyle: String         // "traditionnel", "moderne", "minimaliste"
  }
}
```

#### B. Génération par l'IA

```javascript
// Dans scripts/generate-custom-menu.js

const platingPrompt = `
DRESSAGE DE L'ASSIETTE:

Pour chaque recette sélectionnée, propose un dressage esthétique et harmonieux:

1. DISPOSITION:
   - Placement des éléments (protéine, légumes, féculents)
   - Hauteur et volume
   - Espacement et équilibre visuel

2. COULEURS:
   - Palette de couleurs harmonieuse
   - Contraste pour l'appétence
   - Éviter les plats monochromes

3. TEXTURES:
   - Variété des textures (croustillant, onctueux, croquant)
   - Éléments de décoration (herbes, graines, coulis)

4. GARNITURES:
   - Suggestions de garnitures adaptées
   - Placement précis
   - Quantités appropriées

5. VAISSELLE:
   - Type d'assiette recommandé
   - Style de service

Réponds avec un JSON:
{
  "plating": {
    "description": "Description du dressage",
    "instructions": ["Étape 1", "Étape 2"],
    "visualElements": {
      "colors": ["couleur1", "couleur2"],
      "textures": ["texture1", "texture2"],
      "height": "moyen",
      "arrangement": "central"
    },
    "garnishes": [
      {
        "name": "Persil",
        "placement": "dessus",
        "quantity": "quelques brins"
      }
    ],
    "plateType": "assiette_plate",
    "servingStyle": "moderne"
  }
}
`;
```

#### C. Affichage dans l'interface

```javascript
// client/js/ehpad-dashboard.js ou group-dashboard.js

function displayPlatingInstructions(recipe) {
  if (!recipe.plating) return '';
  
  return `
    <div class="plating-section" style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
      <h4 style="color: #667eea; margin-bottom: 1rem;">
        <i class="fas fa-palette"></i> Dressage de l'Assiette
      </h4>
      <p style="margin-bottom: 1rem;">${recipe.plating.description}</p>
      
      <div style="margin-bottom: 1rem;">
        <strong>Instructions de présentation:</strong>
        <ol style="margin-top: 0.5rem;">
          ${recipe.plating.instructions.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>
      
      ${recipe.plating.garnishes && recipe.plating.garnishes.length > 0 ? `
        <div style="margin-bottom: 1rem;">
          <strong>Garnitures:</strong>
          <ul style="margin-top: 0.5rem;">
            ${recipe.plating.garnishes.map(g => `<li>${g.name} - ${g.placement} (${g.quantity})</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      
      <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
        <span class="badge" style="background: #667eea; color: white;">
          <i class="fas fa-palette"></i> ${recipe.plating.visualElements?.arrangement || 'N/A'}
        </span>
        <span class="badge" style="background: #10b981; color: white;">
          <i class="fas fa-utensils"></i> ${recipe.plating.plateType || 'N/A'}
        </span>
        <span class="badge" style="background: #f59e0b; color: white;">
          <i class="fas fa-paint-brush"></i> ${recipe.plating.servingStyle || 'N/A'}
        </span>
      </div>
    </div>
  `;
}
```

---

## 4. Conformité AVIQ (Fréquentiel)

### Objectif
Respecter les recommandations de fréquence de consommation de l'AVIQ (Agence pour une Vie de Qualité).

### Implémentation

#### A. Modèle de fréquentiel AVIQ

```javascript
// models/AVIQFrequency.js (nouveau modèle)

const aviqFrequencySchema = {
  foodCategory: String,        // "viande_rouge", "poisson", "légumes", etc.
  frequency: String,          // "quotidien", "hebdomadaire", "mensuel"
  minPerPeriod: Number,       // Minimum par période
  maxPerPeriod: Number,       // Maximum par période
  period: String,             // "jour", "semaine", "mois"
  recommendations: String,    // Recommandations spécifiques
  targetGroup: String,        // "personnes_âgées", "personnes_dépendantes"
  source: String              // "AVIQ 2024", etc.
}

// Exemples de données AVIQ
const aviqFrequencies = [
  {
    foodCategory: "viande_rouge",
    frequency: "hebdomadaire",
    minPerPeriod: 1,
    maxPerPeriod: 2,
    period: "semaine",
    recommendations: "Privilégier les viandes maigres",
    targetGroup: "personnes_âgées"
  },
  {
    foodCategory: "poisson",
    frequency: "hebdomadaire",
    minPerPeriod: 2,
    maxPerPeriod: 3,
    period: "semaine",
    recommendations: "Dont au moins 1 poisson gras (saumon, maquereau)",
    targetGroup: "personnes_âgées"
  },
  {
    foodCategory: "légumes",
    frequency: "quotidien",
    minPerPeriod: 2,
    maxPerPeriod: 5,
    period: "jour",
    recommendations: "Varier les couleurs et textures",
    targetGroup: "personnes_âgées"
  }
];
```

#### B. Vérification de conformité

```javascript
// scripts/verify-aviq-compliance.js

async function verifyAVIQCompliance(weeklyMenu, residentsGroups) {
  const compliance = {
    compliant: true,
    violations: [],
    recommendations: []
  };
  
  // Compter les occurrences par catégorie
  const categoryCounts = countFoodCategories(weeklyMenu);
  
  // Vérifier chaque catégorie AVIQ
  const aviqRules = await AVIQFrequency.find({ targetGroup: 'personnes_âgées' });
  
  aviqRules.forEach(rule => {
    const count = categoryCounts[rule.foodCategory] || 0;
    
    if (count < rule.minPerPeriod) {
      compliance.compliant = false;
      compliance.violations.push({
        category: rule.foodCategory,
        issue: 'insuffisant',
        current: count,
        required: rule.minPerPeriod,
        recommendation: rule.recommendations
      });
    }
    
    if (count > rule.maxPerPeriod) {
      compliance.compliant = false;
      compliance.violations.push({
        category: rule.foodCategory,
        issue: 'excessif',
        current: count,
        max: rule.maxPerPeriod,
        recommendation: rule.recommendations
      });
    }
  });
  
  return compliance;
}
```

#### C. Intégration dans la génération de menu

```javascript
// Dans scripts/generate-custom-menu.js

const aviqPrompt = `
CONFORMITÉ AVIQ (Fréquentiel):

Les menus doivent respecter les fréquences de consommation recommandées par l'AVIQ:

- Viande rouge: 1-2 fois par semaine maximum
- Poisson: 2-3 fois par semaine (dont 1 poisson gras)
- Volaille: 2-3 fois par semaine
- Légumes: 2-5 portions par jour (varier les couleurs)
- Fruits: 2-3 portions par jour
- Produits laitiers: 2-3 portions par jour
- Féculents: À chaque repas
- Matières grasses: Privilégier les graisses végétales

⚠️ IMPORTANT: Vérifie que le menu proposé respecte ces fréquences pour la semaine complète.
`;
```

---

## 5. Conformité Annexe 120

### Objectif
Respecter les normes de l'annexe 120 du Code réglementaire wallon concernant la nutrition et l'hygiène.

### Implémentation

#### A. Modèle de conformité Annexe 120

```javascript
// models/Annexe120Compliance.js (nouveau modèle)

const annexe120Schema = {
  requirement: String,        // "nutrition", "hygiène", "traçabilité"
  description: String,        // Description de l'exigence
  mandatory: Boolean,         // Obligatoire ou recommandé
  verification: String,       // Comment vérifier
  documentation: String       // Documentation requise
}

// Exigences principales de l'annexe 120
const annexe120Requirements = [
  {
    requirement: "nutrition_équilibrée",
    description: "Menu équilibré adapté aux besoins nutritionnels",
    mandatory: true,
    verification: "Vérification des apports nutritionnels",
    documentation: "Fiche nutritionnelle par repas"
  },
  {
    requirement: "traçabilité",
    description: "Traçabilité complète des ingrédients",
    mandatory: true,
    verification: "Vérification des origines et dates",
    documentation: "Fiches produits avec origines"
  },
  {
    requirement: "hygiène",
    description: "Respect des normes d'hygiène HACCP",
    mandatory: true,
    verification: "Contrôles réguliers",
    documentation: "Carnets de traçabilité"
  },
  {
    requirement: "adaptation_pathologies",
    description: "Adaptation aux pathologies des résidents",
    mandatory: true,
    verification: "Vérification des restrictions",
    documentation: "Dossiers de soins individualisés"
  }
];
```

#### B. Vérification de conformité

```javascript
// scripts/verify-annexe120-compliance.js

async function verifyAnnexe120Compliance(menu, site, residents) {
  const compliance = {
    compliant: true,
    checks: []
  };
  
  // 1. Vérification nutrition équilibrée
  const nutritionalBalance = await verifyNutritionalBalance(menu, residents);
  compliance.checks.push({
    requirement: "nutrition_équilibrée",
    status: nutritionalBalance.balanced ? 'OK' : 'NON_CONFORME',
    details: nutritionalBalance
  });
  
  // 2. Vérification traçabilité
  const traceability = verifyTraceability(menu.ingredients);
  compliance.checks.push({
    requirement: "traçabilité",
    status: traceability.complete ? 'OK' : 'NON_CONFORME',
    details: traceability
  });
  
  // 3. Vérification adaptation pathologie
  const pathologyAdaptation = verifyPathologyAdaptation(menu, residents);
  compliance.checks.push({
    requirement: "adaptation_pathologies",
    status: pathologyAdaptation.adapted ? 'OK' : 'NON_CONFORME',
    details: pathologyAdaptation
  });
  
  // Calculer le statut global
  compliance.compliant = compliance.checks.every(c => c.status === 'OK');
  
  return compliance;
}
```

---

## 6. Interface Utilisateur

### A. Affichage de l'équilibre nutritionnel

```javascript
// client/js/group-dashboard.js

function displayNutritionalBalance(menu, groups) {
  return `
    <div class="nutritional-balance-card">
      <h4><i class="fas fa-balance-scale"></i> Équilibre Nutritionnel par Groupe</h4>
      ${groups.map(group => `
        <div class="group-balance">
          <h5>${group.name}</h5>
          <div class="balance-indicators">
            <div class="indicator ${group.balance.proteins.status}">
              <span>Protéines: ${group.balance.proteins.value}g / ${group.balance.proteins.target}g</span>
              <div class="progress-bar">
                <div class="progress" style="width: ${group.balance.proteins.percent}%"></div>
              </div>
            </div>
            <!-- Autres indicateurs -->
          </div>
          ${group.balance.recommendations.length > 0 ? `
            <div class="recommendations">
              <strong>Recommandations:</strong>
              <ul>
                ${group.balance.recommendations.map(r => `<li>${r}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
}
```

### B. Affichage de la conformité AVIQ et Annexe 120

```javascript
// client/js/group-dashboard.js

function displayComplianceStatus(aviqCompliance, annexe120Compliance) {
  return `
    <div class="compliance-section">
      <h4><i class="fas fa-check-circle"></i> Conformité Réglementaire</h4>
      
      <div class="compliance-card ${aviqCompliance.compliant ? 'compliant' : 'non-compliant'}">
        <h5><i class="fas fa-certificate"></i> Conformité AVIQ</h5>
        <div class="status ${aviqCompliance.compliant ? 'ok' : 'warning'}">
          ${aviqCompliance.compliant ? '✅ Conforme' : '⚠️ Non conforme'}
        </div>
        ${aviqCompliance.violations.length > 0 ? `
          <div class="violations">
            <strong>Points à corriger:</strong>
            <ul>
              ${aviqCompliance.violations.map(v => `<li>${v.category}: ${v.recommendation}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
      
      <div class="compliance-card ${annexe120Compliance.compliant ? 'compliant' : 'non-compliant'}">
        <h5><i class="fas fa-file-contract"></i> Conformité Annexe 120</h5>
        <div class="status ${annexe120Compliance.compliant ? 'ok' : 'warning'}">
          ${annexe120Compliance.compliant ? '✅ Conforme' : '⚠️ Non conforme'}
        </div>
        <div class="checks">
          ${annexe120Compliance.checks.map(check => `
            <div class="check-item ${check.status === 'OK' ? 'ok' : 'error'}">
              <i class="fas fa-${check.status === 'OK' ? 'check' : 'times'}"></i>
              ${check.requirement}: ${check.status}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
```

---

## 7. Plan d'Implémentation

### Phase 1 : Modèles de données (Semaine 1)
- [ ] Créer `models/NutritionalBalance.js`
- [ ] Créer `models/AVIQFrequency.js`
- [ ] Créer `models/Annexe120Compliance.js`
- [ ] Étendre `models/Recipe.js` avec `plating`
- [ ] Peupler les données AVIQ et Annexe 120

### Phase 2 : Logique métier (Semaine 2)
- [ ] Implémenter `verifyNutritionalBalance()`
- [ ] Implémenter `filterRecipesByRestrictions()` amélioré
- [ ] Implémenter `verifyAVIQCompliance()`
- [ ] Implémenter `verifyAnnexe120Compliance()`
- [ ] Améliorer le prompt IA avec équilibre nutritionnel et dressage

### Phase 3 : Génération IA améliorée (Semaine 3)
- [ ] Intégrer l'équilibre nutritionnel dans `selectBestRecipeWithAI()`
- [ ] Ajouter la génération de `plating` dans le prompt IA
- [ ] Ajouter la vérification AVIQ dans le prompt IA
- [ ] Tester la génération avec tous les critères

### Phase 4 : Interface utilisateur (Semaine 4)
- [ ] Ajouter l'affichage de l'équilibre nutritionnel
- [ ] Ajouter l'affichage du dressage de l'assiette
- [ ] Ajouter l'affichage de la conformité AVIQ
- [ ] Ajouter l'affichage de la conformité Annexe 120
- [ ] Ajouter les alertes et recommandations

### Phase 5 : Tests et validation (Semaine 5)
- [ ] Tests unitaires pour chaque fonction
- [ ] Tests d'intégration avec l'IA
- [ ] Validation avec des nutritionnistes
- [ ] Validation avec des établissements pilotes

---

## 8. Exemples de Code

Voir les fichiers suivants pour des exemples complets :
- `scripts/generate-custom-menu-enhanced.js` (à créer)
- `controllers/nutritionalBalanceController.js` (à créer)
- `controllers/complianceController.js` (à créer)

---

**Date de création** : 2025-01-27
**Auteur** : Chef SES Development Team

