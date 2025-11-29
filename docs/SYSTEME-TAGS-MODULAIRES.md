# 🏷️ Système de Tags pour Menus Modulaires

## 📋 Structure des Tags dans MongoDB

Tous les composants modulaires (protéines, sauces, accompagnements) et les templates générés sont stockés dans MongoDB avec un système de tags complet pour faciliter la recherche et la catégorisation.

---

## 🏷️ Catégories de Tags

### 1. Tags par Type d'Ingrédient
- **Protéines** : `volaille`, `viande`, `poisson`, `fruits_de_mer`, `vegetarien`, `vegan`, `oeuf`, `fromage`
- **Sauces** : `sauce`, `crémeuse`, `légère`, `épicée`, `fruitée`
- **Accompagnements** : `accompagnement`, `féculent`, `légume`, `céréale`

### 2. Tags par Type de Cuisine
- `français`, `italien`, `asiatique`, `méditerranéen`, `mexicain`, `fusion`

### 3. Tags par Difficulté
- `facile`, `moyen`, `difficile`

### 4. Tags par Temps
- `rapide` (< 20 min), `moyen` (20-45 min), `long` (> 45 min)

### 5. Tags par Occasion
- `quotidien`, `festif`, `romantique`, `familial`, `brunch`, `déjeuner`, `dîner`

### 6. Tags par Caractéristiques
- `classique`, `gourmand`, `léger`, `sain`, `économique`, `raffiné`, `polyvalent`, `accessible`

### 7. Tags par Saison
- `été`, `hiver`, `printemps`, `automne`

### 8. Tags Spéciaux
- `bio`, `local`, `traditionnel`, `innovant`, `populaire`

---

## 📊 Exemples de Tags par Composant

### Cuisse de Poulet (Protéine)
```javascript
tags: [
  "classique", "polyvalent", "accessible", "volaille", 
  "quotidien", "familial", "français", "facile", "économique"
]
```

### Sauce aux Champignons
```javascript
tags: [
  "classique", "crémeuse", "sauce", "champignons", 
  "quotidien", "français", "facile", "gourmand"
]
```

### Riz Blanc
```javascript
tags: [
  "classique", "neutre", "accompagnement", "riz", 
  "quotidien", "asiatique", "facile", "végétarien", "vegan"
]
```

### Template Généré : "Cuisse de poulet + Sauce champignons + Riz"
```javascript
tags: [
  // Tags hérités des composants
  "classique", "polyvalent", "accessible", "volaille",
  "quotidien", "familial", "français", "facile", "économique",
  "crémeuse", "sauce", "champignons", "gourmand",
  "neutre", "accompagnement", "riz", "asiatique",
  // Tags spécifiques au template
  "combo_populaire", "menu_du_jour"
]
```

---

## 🔍 Recherche par Tags

### API Endpoints

#### Rechercher des composants par tags
```javascript
GET /api/recipe-components?tags=rapide,facile,quotidien
GET /api/recipe-components?type=protein&tags=volaille,classique
```

#### Rechercher des templates par tags
```javascript
GET /api/recipe-templates?tags=combo_populaire,quotidien
GET /api/recipe-templates?mealType=déjeuner&tags=familial,facile
```

### Exemples de Requêtes

**Trouver des protéines rapides et faciles** :
```javascript
GET /api/recipe-components?type=protein&tags=rapide,facile
```

**Trouver des menus quotidiens familiaux** :
```javascript
GET /api/recipe-templates?tags=quotidien,familial
```

**Trouver des combinaisons gourmandes pour dîner** :
```javascript
GET /api/recipe-templates?mealType=dîner&tags=gourmand
```

---

## 🎯 Utilisation dans l'Interface Tablette Client

### Scénario : Client cherche un plat "rapide et léger"

1. **Filtres appliqués** : `tags=rapide,léger`
2. **Résultats** :
   - Filet de poulet (rapide, léger)
   - Saumon (rapide, sain)
   - Légumes verts (léger, sain)

### Scénario : Client cherche un plat "festif et gourmand"

1. **Filtres appliqués** : `tags=festif,gourmand`
2. **Résultats** :
   - Magret de canard (raffiné, gourmand)
   - Sauce aux champignons (crémeuse, gourmand)
   - Combinaisons festives

---

## 📐 Structure MongoDB

### Index sur les Tags

```javascript
// RecipeComponent
recipeComponentSchema.index({ tags: 1 });

// RecipeTemplate
recipeTemplateSchema.index({ tags: 1 });
```

### Normalisation des Tags

- Tous les tags sont convertis en **minuscules** automatiquement
- Les espaces sont supprimés
- Les doublons sont évités

---

## 🔄 Génération Automatique de Tags pour Templates

Quand un template est créé à partir de composants :

1. **Union des tags** : Tous les tags des composants sont combinés
2. **Ajout de tags spécifiques** : Tags propres au template (ex: "combo_populaire")
3. **Déduplication** : Suppression des doublons
4. **Normalisation** : Conversion en minuscules

**Exemple** :
- Protéine tags: `["classique", "volaille", "facile"]`
- Sauce tags: `["crémeuse", "gourmand"]`
- Accompagnement tags: `["classique", "neutre"]`
- Template tags: `["classique", "volaille", "facile", "crémeuse", "gourmand", "neutre", "combo_populaire"]`

---

## 🎨 Interface de Recherche par Tags

### Pour la Tablette Client

**Filtres visuels** :
- Badges cliquables pour chaque tag
- Recherche par mots-clés
- Filtres combinés (ET/OU)

**Exemple d'interface** :
```
┌─────────────────────────────────────┐
│ 🔍 Rechercher un plat              │
├─────────────────────────────────────┤
│ Tags populaires:                   │
│ [rapide] [facile] [gourmand]       │
│ [quotidien] [festif] [léger]      │
│                                     │
│ Type de cuisine:                    │
│ [français] [italien] [asiatique]   │
│                                     │
│ Occasion:                           │
│ [quotidien] [festif] [romantique]  │
└─────────────────────────────────────┘
```

---

## 📊 Statistiques et Analytics

### Tags les Plus Utilisés

Permet d'identifier :
- Les plats les plus populaires
- Les préférences des clients
- Les tendances saisonnières

### Requêtes MongoDB

```javascript
// Top 10 tags les plus utilisés
db.recipecomponents.aggregate([
  { $unwind: "$tags" },
  { $group: { _id: "$tags", count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 10 }
])
```

---

## ✅ Avantages du Système de Tags

1. **Recherche flexible** : Multi-critères avec tags
2. **Recommandations** : IA peut suggérer selon tags similaires
3. **Analytics** : Comprendre les préférences clients
4. **Personnalisation** : Menus adaptés selon tags préférés
5. **Évolutivité** : Facile d'ajouter de nouveaux tags

---

**Version: 1.0**  
**Last updated: January 2025**





