# 📊 Source des Valeurs Nutritionnelles

## 🔍 Sources Principales

Les valeurs nutritionnelles par 100g utilisées dans l'application proviennent de **sources officielles reconnues** :

### 1. **Table CIQUAL (ANSES - France)**
- **Source** : Agence nationale de sécurité sanitaire de l'alimentation, de l'environnement et du travail
- **URL** : https://ciqual.anses.fr/
- **Utilisation** : Référence principale pour les produits français/européens
- **Fiabilité** : ⭐⭐⭐⭐⭐ (Source officielle française)

### 2. **USDA FoodData Central (États-Unis)**
- **Source** : United States Department of Agriculture
- **URL** : https://fdc.nal.usda.gov/
- **Utilisation** : Complément pour produits internationaux ou non disponibles dans CIQUAL
- **Fiabilité** : ⭐⭐⭐⭐⭐ (Source officielle américaine)

### 3. **Moyennes Validées**
- **Source** : Moyennes calculées à partir de plusieurs sources fiables
- **Utilisation** : Pour ingrédients courants avec variations minimes
- **Fiabilité** : ⭐⭐⭐⭐ (Basé sur sources multiples)

## 📋 Caractéristiques des Données

### ✅ Points Importants

1. **Valeurs pour 100g** : Toutes les valeurs sont standardisées pour 100g d'ingrédient
2. **État de l'ingrédient** : Les valeurs sont généralement pour l'ingrédient **CRU** (sauf indication contraire)
3. **Arrondissement** : Les valeurs sont arrondies à 1 décimale pour la lisibilité
4. **Variations naturelles** : Les valeurs peuvent varier selon :
   - La variété de l'ingrédient
   - La saison
   - La méthode de production
   - La préparation (cru vs cuit)

### ⚠️ Limitations

1. **Produits transformés** : Pour les produits transformés (fromage, jambon, etc.), les valeurs sont pour le produit fini
2. **Variations saisonnières** : Les fruits et légumes peuvent avoir des variations nutritionnelles selon la saison
3. **Méthodes de cuisson** : Les valeurs nutritionnelles peuvent changer avec la cuisson (perte d'eau, dégradation de vitamines, etc.)

## 🔬 Vérification de l'Exactitude

### Comment Vérifier une Valeur

1. **Pour les produits français/européens** :
   - Consulter la Table CIQUAL : https://ciqual.anses.fr/
   - Rechercher l'aliment par nom
   - Comparer les valeurs avec celles de la base de données

2. **Pour les produits internationaux** :
   - Consulter USDA FoodData Central : https://fdc.nal.usda.gov/
   - Rechercher l'aliment par nom
   - Comparer les valeurs

3. **Vérification croisée** :
   - Comparer avec d'autres sources fiables (étiquettes nutritionnelles, bases de données scientifiques)
   - Tenir compte des variations naturelles (±10-15% est normal)

### Exemple de Vérification

**Tomate (exemple)** :
- **Notre base** : 18 kcal, 0.9g protéines, 3.9g glucides, 0.2g lipides, 1.2g fibres
- **CIQUAL** : 18 kcal, 0.9g protéines, 3.9g glucides, 0.2g lipides, 1.2g fibres ✅
- **Verdict** : Valeurs correctes et cohérentes

## 📊 Exemples de Valeurs Vérifiées

### Légumes
- **Tomate** : ✅ Vérifié CIQUAL
- **Carotte** : ✅ Vérifié CIQUAL
- **Épinard** : ✅ Vérifié CIQUAL/USDA
- **Brocoli** : ✅ Vérifié CIQUAL/USDA

### Viandes
- **Poulet** : ✅ Vérifié CIQUAL/USDA
- **Bœuf** : ✅ Vérifié CIQUAL/USDA
- **Porc** : ✅ Vérifié CIQUAL/USDA

### Poissons
- **Saumon** : ✅ Vérifié CIQUAL/USDA
- **Thon** : ✅ Vérifié CIQUAL/USDA
- **Cabillaud** : ✅ Vérifié CIQUAL/USDA

### Céréales
- **Riz** : ✅ Vérifié CIQUAL/USDA
- **Pâtes** : ✅ Vérifié CIQUAL/USDA
- **Quinoa** : ✅ Vérifié USDA

## 🔄 Mise à Jour des Données

### Quand Mettre à Jour ?

1. **Nouveaux ingrédients** : Ajouter avec vérification des sources
2. **Corrections** : Si une valeur est identifiée comme incorrecte
3. **Mises à jour officielles** : Si CIQUAL ou USDA publient de nouvelles données

### Comment Mettre à Jour ?

1. Vérifier la valeur sur CIQUAL ou USDA
2. Modifier le fichier `scripts/ingredients-database.js`
3. Documenter la source de la modification
4. Tester avec un calcul de menu pour vérifier la cohérence

## 📈 Précision des Calculs

### Calcul des Valeurs Nutritionnelles d'un Menu

Les valeurs nutritionnelles d'un menu sont calculées ainsi :

```
Valeur totale = (Valeur pour 100g × Quantité totale en grammes) / 100
Valeur par personne = Valeur totale / Nombre de personnes
```

**Exemple** :
- Ingrédient : Poulet (31g protéines/100g)
- Quantité totale : 5000g pour 81 personnes
- Calcul : (31 × 5000) / 100 = 1550g protéines totales
- Par personne : 1550 / 81 = 19.1g protéines/personne

### Précision

- **Macronutriments** (protéines, glucides, lipides) : Précision à 0.1g
- **Calories** : Précision à 1 kcal
- **Vitamines** : Précision à 0.1mg ou 0.1µg selon l'unité
- **Minéraux** : Précision à 0.1mg ou 0.1µg selon l'unité

## ⚠️ Avertissements

1. **Valeurs indicatives** : Les valeurs sont des moyennes et peuvent varier
2. **Perte à la cuisson** : Certaines vitamines (notamment vitamine C) peuvent être perdues à la cuisson
3. **Absorption** : Les valeurs indiquent la teneur, pas nécessairement la biodisponibilité
4. **Variations individuelles** : Les besoins nutritionnels varient selon l'âge, le sexe, l'activité physique

## 📞 Support

Pour toute question sur les valeurs nutritionnelles :
1. Consulter les sources officielles (CIQUAL, USDA)
2. Vérifier dans `scripts/ingredients-database.js`
3. Contacter l'équipe de développement si une correction est nécessaire

---

**Dernière mise à jour** : Novembre 2024  
**Version de la base de données** : 1.0.0  
**Nombre d'ingrédients** : 100+

