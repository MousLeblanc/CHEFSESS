# 🥩 Générateur de Menu Riche en Protéines

## Description

Ce script utilise **OpenAI + votre base de données d'ingrédients** pour générer automatiquement des menus riches en protéines avec :
- ✅ Nom créatif du plat
- ✅ Liste d'ingrédients avec quantités
- ✅ **Valeurs nutritionnelles précises** (calculées depuis votre database)
- ✅ Instructions de préparation
- ✅ Respect des restrictions alimentaires

## 🚀 Utilisation

### 1. Exécuter le script

```bash
cd scripts
node generate-protein-menu.js
```

### 2. Utiliser dans votre code

```javascript
import { generateProteinMenu } from './scripts/generate-protein-menu.js';

// Générer un menu
const result = await generateProteinMenu({
  numberOfPeople: 4,          // Nombre de personnes
  targetProteins: 35,         // Grammes de protéines par personne
  mealType: 'déjeuner',       // 'déjeuner', 'dîner', 'repas complet'
  dietaryRestrictions: []     // ['sans lactose', 'sans gluten', etc.]
});

console.log(result.menu.nomMenu);
console.log(result.nutrition.perPerson);
```

## 📋 Options disponibles

| Option | Type | Par défaut | Description |
|--------|------|------------|-------------|
| `numberOfPeople` | number | 4 | Nombre de personnes |
| `targetProteins` | number | 30 | Objectif de protéines par personne (en grammes) |
| `mealType` | string | 'déjeuner' | Type de repas ('déjeuner', 'dîner', 'repas complet') |
| `dietaryRestrictions` | array | [] | Restrictions alimentaires |

## 🎯 Exemples

### Exemple 1 : Menu déjeuner standard

```javascript
await generateProteinMenu({
  numberOfPeople: 4,
  targetProteins: 35,
  mealType: 'déjeuner'
});
```

**Résultat exemple :**
```
==========================================================
🍽️  POULET GRILLÉ AUX LÉGUMES MÉDITERRANÉENS ET QUINOA
==========================================================

📝 Un plat équilibré riche en protéines, avec du poulet tendre et des légumes colorés

👥 Pour 4 personnes
⏱️  Temps de cuisson : 30 min
📊 Difficulté : Facile

🥘 INGRÉDIENTS:
   • Poulet (blanc): 600g (186g protéines)
   • Quinoa: 200g (9g protéines)
   • Courgette: 300g (4g protéines)
   • Tomate: 200g (2g protéines)
   • Huile d'olive: 30ml (0g protéines)

📊 VALEURS NUTRITIONNELLES PAR PERSONNE:
   • Calories : 420 kcal
   • Protéines : 35 g ✅
   • Glucides : 28 g
   • Lipides : 15 g
   • Fibres : 4 g
```

### Exemple 2 : Menu pour sportifs (haute protéine)

```javascript
await generateProteinMenu({
  numberOfPeople: 2,
  targetProteins: 50,
  mealType: 'dîner'
});
```

**Objectif :** 50g de protéines par personne (pour récupération musculaire)

### Exemple 3 : Menu avec restrictions

```javascript
await generateProteinMenu({
  numberOfPeople: 4,
  targetProteins: 30,
  mealType: 'déjeuner',
  dietaryRestrictions: ['sans lactose', 'sans gluten']
});
```

## 🔧 Comment ça fonctionne ?

### 1. Sélection des ingrédients
Le script analyse votre base de données et filtre les **ingrédients riches en protéines** (>15g/100g) :
- Viandes : Poulet (31g), Dinde (30g), Bœuf (26g)
- Poissons : Thon (30g), Saumon (22g)
- Légumineuses : Lentilles (9g), Pois chiches (8.9g)
- Fromages : Parmesan (38g), Comté (27g)
- Noix : Cacahuètes (25.8g), Amandes (21.2g)

### 2. Génération IA
OpenAI compose un menu créatif en :
- Sélectionnant des ingrédients complémentaires
- Équilibrant protéines + légumes + féculents
- Créant un nom appétissant
- Fournissant des instructions claires

### 3. Calcul nutritionnel précis
Pour chaque ingrédient, le script :
```javascript
// Récupère les vraies valeurs de la database
const ingredientData = getIngredientData('poulet');

// Calcule pour la quantité utilisée
const factor = quantity / 100; // Ex: 600g → factor = 6
const proteins = ingredientData.nutritionalValues.proteins * factor;
// 31g × 6 = 186g de protéines
```

### 4. Affichage détaillé
Résultat complet avec :
- Nom du menu
- Ingrédients + quantités + apport protéique
- Instructions pas à pas
- **Valeurs nutritionnelles totales ET par personne**

## 📊 Valeurs nutritionnelles calculées

Le script calcule automatiquement pour **100% des ingrédients** :
- ✅ Calories (kcal)
- ✅ Protéines (g)
- ✅ Glucides (g)
- ✅ Lipides (g)
- ✅ Fibres (g)

**Données sources :** Base de données `ingredients-database.js` (200+ ingrédients)

## 🎨 Intégration dans votre application

### Dans un contrôleur Express

```javascript
// controllers/menuController.js
import { generateProteinMenu } from '../scripts/generate-protein-menu.js';

export const generateProteinMenuAPI = async (req, res) => {
  try {
    const { numberOfPeople, targetProteins, dietaryRestrictions } = req.body;
    
    const result = await generateProteinMenu({
      numberOfPeople,
      targetProteins,
      mealType: 'déjeuner',
      dietaryRestrictions
    });
    
    res.status(200).json({
      success: true,
      menu: result.menu,
      nutrition: result.nutrition
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### Dans le frontend

```javascript
// Appel API depuis le frontend
async function generateMenu() {
  const response = await fetch('/api/menu/protein', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      numberOfPeople: 4,
      targetProteins: 35,
      dietaryRestrictions: ['sans lactose']
    })
  });
  
  const data = await response.json();
  
  // Afficher le menu
  console.log(`Menu : ${data.menu.nomMenu}`);
  console.log(`Protéines : ${data.nutrition.perPerson.proteins}g`);
  
  // Afficher les ingrédients
  data.menu.ingredients.forEach(ing => {
    console.log(`${ing.nom}: ${ing.quantite}${ing.unite}`);
  });
}
```

## 🔥 Cas d'usage

1. **EHPAD / Maison de retraite**
   - Générer des menus riches en protéines pour lutter contre la dénutrition
   - Adapter selon les restrictions (sans sel, sans sucre, textures modifiées)

2. **Salle de sport / Nutrition sportive**
   - Menus post-entraînement (50g+ protéines)
   - Prise de masse musculaire

3. **Restaurant / Traiteur**
   - Menu "Fit" ou "Sportif"
   - Affichage des valeurs nutritionnelles précises

4. **Application santé**
   - Génération automatique de menus équilibrés
   - Suivi des apports protéiques

## ⚙️ Configuration

### Variables d'environnement requises

```env
OPENAI_API_KEY=sk-...
```

### Modifier le modèle OpenAI

Dans `generate-protein-menu.js`, ligne ~150 :

```javascript
const completion = await openai.chat.completions.create({
  model: "gpt-4",           // Ou "gpt-3.5-turbo" (plus rapide, moins cher)
  temperature: 0.8,         // Créativité (0.0 = précis, 1.0 = créatif)
  max_tokens: 2000
});
```

## 🐛 Dépannage

### Erreur : "Ingrédient non trouvé dans la database"

L'IA a suggéré un ingrédient qui n'existe pas dans `ingredients-database.js`.

**Solution :** Ajouter l'ingrédient manquant dans la base de données.

### Erreur : "Format de réponse invalide"

L'IA n'a pas répondu en JSON valide.

**Solution :** Relancer le script (l'IA est parfois inconstante) ou ajuster le prompt.

### Objectif protéines non atteint

Le menu généré ne contient pas assez de protéines.

**Solution :** 
- Augmenter `targetProteins` dans le prompt
- Ajouter plus d'ingrédients riches en protéines dans la database
- Modifier le prompt pour insister sur l'objectif

## 📈 Améliorations possibles

1. **Générer plusieurs variantes**
   ```javascript
   const variants = await Promise.all([
     generateProteinMenu({ targetProteins: 30 }),
     generateProteinMenu({ targetProteins: 40 }),
     generateProteinMenu({ targetProteins: 50 })
   ]);
   ```

2. **Ajouter un filtre de prix**
   ```javascript
   dietaryRestrictions: ['budget serré']
   ```

3. **Générer un menu complet (entrée + plat + dessert)**
   ```javascript
   mealType: 'repas complet'
   ```

4. **Sauvegarder dans MongoDB**
   ```javascript
   const Menu = require('../models/Menu');
   await Menu.create(result.menu);
   ```

## 📞 Support

Pour toute question ou amélioration, consulter la documentation de la base de données d'ingrédients : `README-INGREDIENTS.md`

---

**Dernière mise à jour** : 27 octobre 2025  
**Version** : 1.0.0  
**Dépendances** : OpenAI API, ingredients-database.js

