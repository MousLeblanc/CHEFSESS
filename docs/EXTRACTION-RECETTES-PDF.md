# Extraction de Recettes depuis un PDF

Ce guide explique comment extraire des recettes d'un fichier PDF et les convertir en format JavaScript pour les utiliser dans l'application.

## Installation

D'abord, installez la bibliothèque nécessaire pour lire les PDF :

```bash
npm install pdf-parse
```

Ou si vous préférez utiliser pdfjs-dist :

```bash
npm install pdfjs-dist
```

## Utilisation

### Méthode 1 : Ligne de commande

```bash
npm run extract-pdf-recipes <chemin-vers-pdf> [chemin-sortie]
```

**Exemples :**

```bash
# Extraction avec chemin par défaut (data/nom-du-pdf-recipes.js)
npm run extract-pdf-recipes ./recettes.pdf

# Extraction avec chemin de sortie personnalisé
npm run extract-pdf-recipes ./recettes.pdf ./data/mes-recettes.js
```

### Méthode 2 : Script Node.js direct

```bash
node scripts/extract-recipes-from-pdf.js ./recettes.pdf
```

## Format du PDF

Le script essaie de détecter automatiquement la structure du PDF, mais fonctionne mieux avec des PDFs qui ont une structure claire :

### Structure recommandée :

```
RECETTE: Nom de la recette

INGRÉDIENTS:
- 200g de farine
- 2 œufs
- 100ml de lait
- 1 cuillère à soupe d'huile

PRÉPARATION:
1. Mélanger la farine et les œufs
2. Ajouter le lait progressivement
3. Faire cuire à feu moyen

NUTRITION:
Calories: 250
Protéines: 10g
Glucides: 30g
Lipides: 8g
```

### Formats acceptés :

- **Titres de recettes** : "RECETTE:", "1. Nom", ou lignes en majuscules
- **Ingrédients** : 
  - "200g de farine"
  - "Farine: 200g"
  - "- 200g farine"
- **Instructions** : 
  - "1. Première étape"
  - "- Première étape"
- **Nutrition** : "Calories: 250", "Protéines: 10g", etc.

## Format de sortie

Le script génère deux fichiers :

1. **Fichier JavaScript** (`*.js`) : Format ES6 avec export
2. **Fichier JSON** (`*.json`) : Format JSON brut pour référence

### Structure d'une recette extraite :

```javascript
{
  name: "Nom de la recette",
  category: "plat",
  ingredients: [
    { name: "Farine", quantity: 200, unit: "g" },
    { name: "Œufs", quantity: 2, unit: "pièce" }
  ],
  preparationSteps: [
    "Mélanger la farine et les œufs",
    "Ajouter le lait progressivement"
  ],
  nutrition: {
    calories: 250,
    proteins: 10,
    carbs: 30,
    lipids: 8,
    fibers: 0,
    sodium: 0
  },
  allergens: [],
  dietaryRestrictions: [],
  textures: ["normale"],
  establishmentTypes: ["restaurant", "cantine_scolaire"]
}
```

## Personnalisation

Si le format de votre PDF est différent, vous pouvez modifier le script `scripts/extract-recipes-from-pdf.js` :

### Fonctions à adapter :

1. **`isRecipeTitle(line)`** : Détecte le début d'une nouvelle recette
2. **`parseIngredient(line)`** : Parse une ligne d'ingrédient
3. **`parseNutrition(line, nutrition)`** : Parse les informations nutritionnelles
4. **`parseRecipesFromText(text)`** : Logique principale de parsing

## Intégration dans l'application

Une fois les recettes extraites, vous pouvez :

1. **Les importer dans MongoDB** :
   ```bash
   # Utiliser le script d'import existant
   node scripts/import-recipes.js
   ```

2. **Les utiliser directement** :
   ```javascript
   import extractedRecipes from './data/mon-pdf-recipes.js';
   ```

3. **Les fusionner avec d'autres recettes** :
   ```bash
   node scripts/merge-recipes.js
   ```

## Dépannage

### Erreur : "Aucune bibliothèque PDF trouvée"

Installez `pdf-parse` :
```bash
npm install pdf-parse
```

### Aucune recette détectée

Le format du PDF ne correspond peut-être pas aux patterns attendus. Vérifiez :
- Le texte est bien extrait (regardez les logs)
- Les titres de recettes sont détectés
- Les sections (INGRÉDIENTS, PRÉPARATION) sont clairement identifiées

### Recettes mal parsées

Ajustez les fonctions de parsing dans le script selon votre format spécifique.

## Exemple complet

```bash
# 1. Installer la dépendance
npm install pdf-parse

# 2. Extraire les recettes
npm run extract-pdf-recipes ./mes-recettes.pdf

# 3. Vérifier le résultat
cat data/mes-recettes-recipes.js

# 4. Importer dans MongoDB (optionnel)
# Modifier scripts/import-recipes.js pour inclure le nouveau fichier
```

## Notes

- Le script fonctionne mieux avec des PDFs textuels (pas des images scannées)
- Pour les PDFs scannés, utilisez d'abord un OCR (comme Tesseract.js)
- Les recettes extraites peuvent nécessiter une révision manuelle
- Les valeurs nutritionnelles peuvent être approximatives selon le format du PDF





