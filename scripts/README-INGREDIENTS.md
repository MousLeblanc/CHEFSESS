# 📊 Base de données des ingrédients

## Description

Ce fichier contient une base de données complète de **100+ ingrédients** avec :
- **Catégories automatiques** (légumes, viandes, poissons, etc.)
- **Valeurs nutritionnelles pour 100g** (calories, protéines, glucides, lipides, vitamines, minéraux)
- **Mots-clés de détection** pour identifier automatiquement la catégorie

## 📂 Fichiers

### `ingredients-database.js`
Base de données principale avec toutes les données.

### `fix-stock-categories.js`
Script de migration pour mettre à jour automatiquement les catégories dans MongoDB.

## 🎯 Utilisation

### 1. Détecter la catégorie d'un ingrédient

```javascript
import { detectCategory } from './scripts/ingredients-database.js';

const category = detectCategory('Tomates cerises');
console.log(category); // "legumes"
```

### 2. Récupérer les données complètes d'un ingrédient

```javascript
import { getIngredientData } from './scripts/ingredients-database.js';

const data = getIngredientData('Poulet fermier');
console.log(data);
// {
//   name: 'poulet',
//   category: 'viandes',
//   nutritionalValues: {
//     calories: 165,
//     proteins: 31.0,
//     carbs: 0,
//     lipids: 3.6,
//     ...
//   }
// }
```

### 3. Récupérer uniquement les valeurs nutritionnelles

```javascript
import { getNutritionalValues } from './scripts/ingredients-database.js';

const nutrition = getNutritionalValues('Saumon frais');
console.log(nutrition);
// {
//   calories: 206,
//   proteins: 22.0,
//   carbs: 0,
//   lipids: 13.0,
//   omega3: 2.3,
//   ...
// }
```

### 4. Lister tous les ingrédients d'une catégorie

```javascript
import { getIngredientsByCategory } from './scripts/ingredients-database.js';

const legumes = getIngredientsByCategory('legumes');
console.log(legumes);
// [
//   { name: 'tomate', keywords: [...], nutritionalValues: {...} },
//   { name: 'carotte', keywords: [...], nutritionalValues: {...} },
//   ...
// ]
```

## 📋 Catégories disponibles

- **`legumes`** : Tomates, carottes, oignons, pommes de terre, courgettes, etc.
- **`viandes`** : Poulet, bœuf, porc, veau, agneau, dinde, canard, jambon
- **`poissons`** : Saumon, thon, cabillaud, colin, truite, sardines, crevettes
- **`produits-laitiers`** : Lait, yaourt, fromage, beurre, crème, mozzarella, parmesan
- **`cereales`** : Riz, pâtes, pain, farine, quinoa, couscous, boulgour, avoine, lentilles
- **`fruits`** : Pommes, bananes, oranges, fraises, raisins, poires, pêches, kiwis
- **`epices`** : Sel, poivre, curcuma, cumin, paprika, persil, basilic, thym
- **`autres`** : Huiles, œufs, et ingrédients non classés

## 📊 Valeurs nutritionnelles disponibles

Toutes les valeurs sont pour **100g** d'ingrédient :

### Macronutriments (toujours présents)
- `calories` : Énergie en kcal
- `proteins` : Protéines en g
- `carbs` : Glucides en g
- `lipids` : Lipides (graisses) en g
- `fibers` : Fibres en g

### Vitamines (selon disponibilité)
- `vitaminA` : Vitamine A en µg
- `vitaminC` : Vitamine C en mg
- `vitaminD` : Vitamine D en µg
- `vitaminE` : Vitamine E en mg
- `vitaminB1`, `vitaminB3`, `vitaminB6`, `vitaminB12` : Vitamines B

### Minéraux (selon disponibilité)
- `calcium` : Calcium en mg
- `fer` : Fer en mg
- `potassium` : Potassium en mg
- `magnesium` : Magnésium en mg
- `phosphore` : Phosphore en mg
- `sodium` : Sodium en mg
- `zinc` : Zinc en mg
- `selenium` : Sélénium en µg
- `iode` : Iode en µg

### Nutriments spécifiques
- `omega3` : Acides gras oméga-3 en g (poissons)
- `omega6` : Acides gras oméga-6 en g (huiles)
- `omega9` : Acides gras oméga-9 en g (huile d'olive)
- `cholesterol` : Cholestérol en mg (œufs, crevettes)
- `folates` : Folates en µg (légumineuses)

## 🔧 Mise à jour de la base de données

### Ajouter un nouvel ingrédient

Dans `ingredients-database.js`, ajouter une nouvelle entrée :

```javascript
'nouvel-ingredient': {
  category: 'legumes',  // ou 'viandes', 'poissons', etc.
  keywords: ['nouvel-ingredient', 'nom alternatif'],
  nutritionalValues: {
    calories: 50,
    proteins: 2.0,
    carbs: 10.0,
    lipids: 0.5,
    fibers: 3.0,
    // Ajouter autres valeurs si disponibles
  }
}
```

### Modifier les valeurs d'un ingrédient existant

Chercher l'ingrédient dans le fichier et modifier directement ses valeurs nutritionnelles.

## 🚀 Migration des données existantes

Pour appliquer la détection automatique à vos stocks existants :

```bash
cd scripts
node fix-stock-categories.js
```

Ce script va :
1. Se connecter à MongoDB
2. Analyser tous les articles de stock
3. Détecter automatiquement leur catégorie
4. Ajouter les valeurs nutritionnelles (si le modèle le supporte)
5. Sauvegarder les changements

## 📖 Sources des valeurs nutritionnelles

Les valeurs proviennent de sources officielles :
- **USDA FoodData Central** (États-Unis)
- **Table CIQUAL** (ANSES, France)
- **Moyennes validées** pour ingrédients courants

## ⚠️ Notes importantes

1. **Valeurs pour 100g** : Toutes les valeurs sont standardisées pour 100g d'ingrédient
2. **Variation naturelle** : Les valeurs peuvent varier selon la variété, la saison, la préparation
3. **Cuisson** : Les valeurs sont généralement pour l'ingrédient **cru** sauf indication contraire
4. **Compléter** : Cette base contient 100+ ingrédients courants, mais peut être étendue

## 🤝 Contribution

Pour ajouter de nouveaux ingrédients ou corriger des valeurs :
1. Vérifier les sources officielles (CIQUAL, USDA)
2. Ajouter l'ingrédient dans `ingredients-database.js`
3. Tester avec `detectCategory('nom-ingredient')`
4. Documenter la source

## 📞 Questions

Pour toute question sur l'utilisation de cette base de données, consulter ce README ou contacter l'équipe de développement.

---

**Dernière mise à jour** : 27 octobre 2025  
**Nombre d'ingrédients** : 100+  
**Version** : 1.0.0

