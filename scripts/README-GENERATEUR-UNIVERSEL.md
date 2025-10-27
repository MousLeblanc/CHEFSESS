# 🎯 Générateur de Menu Universel

## Description
Générateur intelligent de menus basé sur l'IA qui s'adapte à **n'importe quel critère nutritionnel** sans modification de code.

---

## 🚀 Utilisation Simple

```javascript
import { generateCustomMenu, displayMenu } from './generate-custom-menu.js';

const result = await generateCustomMenu({
  numberOfPeople: 4,
  mealType: 'déjeuner',
  nutritionalGoals: [
    { 
      nutrient: 'proteins',    // Clé du nutriment
      target: 35,              // Objectif par personne
      unit: 'g',               // Unité
      label: 'Protéines',      // Label d'affichage
      minIngredientValue: 15   // Valeur min pour filtrer les ingrédients
    }
  ],
  dietaryRestrictions: ['sans lactose']
});

displayMenu(result);
```

---

## 📊 Nutriments Disponibles

| Clé            | Label              | Unité | Exemple d'objectif |
|----------------|--------------------| ----- |--------------------|
| `proteins`     | Protéines          | g     | 35g                |
| `vitaminC`     | Vitamine C         | mg    | 80mg               |
| `fibers`       | Fibres             | g     | 10g                |
| `iron`         | Fer                | mg    | 10mg               |
| `calcium`      | Calcium            | mg    | 800mg              |
| `vitaminD`     | Vitamine D         | µg    | 15µg               |
| `vitaminB12`   | Vitamine B12       | µg    | 2.5µg              |
| `magnesium`    | Magnésium          | mg    | 300mg              |
| `zinc`         | Zinc               | mg    | 10mg               |
| `phosphore`    | Phosphore          | mg    | 700mg              |
| `potassium`    | Potassium          | mg    | 2000mg             |
| `vitaminA`     | Vitamine A         | µg    | 800µg              |
| `vitaminE`     | Vitamine E         | mg    | 12mg               |
| `vitaminB6`    | Vitamine B6        | mg    | 1.5mg              |

---

## 🎯 Exemples d'Utilisation

### 1. Menu Riche en Protéines (seniors)
```javascript
await generateCustomMenu({
  numberOfPeople: 4,
  mealType: 'déjeuner',
  nutritionalGoals: [
    { nutrient: 'proteins', target: 35, unit: 'g', label: 'Protéines', minIngredientValue: 15 }
  ]
});
```
**Résultat**: "Poulet rôti aux lentilles et légumes"

---

### 2. Menu Anti-Anémie (fer + vitamine C)
```javascript
await generateCustomMenu({
  numberOfPeople: 4,
  mealType: 'déjeuner',
  nutritionalGoals: [
    { nutrient: 'iron', target: 10, unit: 'mg', label: 'Fer', minIngredientValue: 2 },
    { nutrient: 'vitaminC', target: 80, unit: 'mg', label: 'Vitamine C', minIngredientValue: 20 }
  ]
});
```
**Résultat**: "Bœuf aux épinards et poivrons"

---

### 3. Menu Santé Osseuse (calcium + vitamine D)
```javascript
await generateCustomMenu({
  numberOfPeople: 4,
  mealType: 'dîner',
  nutritionalGoals: [
    { nutrient: 'calcium', target: 800, unit: 'mg', label: 'Calcium', minIngredientValue: 100 },
    { nutrient: 'vitaminD', target: 15, unit: 'µg', label: 'Vitamine D', minIngredientValue: 1 }
  ]
});
```
**Résultat**: "Saumon grillé, brocolis et fromage"

---

### 4. Menu Digestif (fibres)
```javascript
await generateCustomMenu({
  numberOfPeople: 4,
  mealType: 'déjeuner',
  nutritionalGoals: [
    { nutrient: 'fibers', target: 12, unit: 'g', label: 'Fibres', minIngredientValue: 5 }
  ]
});
```
**Résultat**: "Salade de lentilles et légumes variés"

---

### 5. Menu Immunitaire (vitamine C + zinc)
```javascript
await generateCustomMenu({
  numberOfPeople: 4,
  mealType: 'déjeuner',
  nutritionalGoals: [
    { nutrient: 'vitaminC', target: 100, unit: 'mg', label: 'Vitamine C', minIngredientValue: 20 },
    { nutrient: 'zinc', target: 8, unit: 'mg', label: 'Zinc', minIngredientValue: 1 }
  ],
  dietaryRestrictions: ['sans gluten']
});
```
**Résultat**: "Poulet aux agrumes et légumes colorés"

---

## 🎨 Combinaisons Populaires

| Objectif Santé         | Nutriments                  | Use Case                    |
|------------------------|-----------------------------|-----------------------------|
| 💪 Muscle              | Protéines                   | Seniors, sportifs           |
| 🩸 Anti-anémie         | Fer + Vitamine C            | Anémie, fatigue             |
| 🦴 Os solides          | Calcium + Vitamine D        | Ostéoporose, seniors        |
| 🛡️ Immunité            | Vitamine C + Zinc           | Hiver, convalescence        |
| 🧠 Cerveau             | Oméga-3 + B12               | Mémoire, concentration      |
| 💚 Digestion           | Fibres                      | Constipation, transit       |
| ❤️ Cœur                | Oméga-3 + Potassium         | Cardio-vasculaire           |
| 👁️ Vision             | Vitamine A + Zinc           | Santé oculaire              |

---

## 🔧 API Route (à venir)

```javascript
POST /api/menu/generate-custom

Body:
{
  "numberOfPeople": 4,
  "mealType": "déjeuner",
  "nutritionalGoals": [
    { "nutrient": "proteins", "target": 35, "unit": "g", "label": "Protéines" }
  ],
  "dietaryRestrictions": []
}
```

---

## ✅ Avantages

1. **Flexible** : Aucune modification de code nécessaire
2. **Puissant** : Support de tous les nutriments de la database
3. **Intelligent** : L'IA compose des plats classiques et équilibrés
4. **Précis** : Calculs nutritionnels automatiques
5. **Extensible** : Facile d'ajouter de nouveaux nutriments

---

## 📝 Notes

- Les valeurs nutritionnelles sont calculées automatiquement depuis `ingredients-database.js`
- L'IA privilégie les **noms de plats classiques** (pas de "poésie")
- Les **associations d'ingrédients sont logiques** et reconnues
- Support des **restrictions alimentaires** multiples

