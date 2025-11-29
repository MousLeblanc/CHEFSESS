# 🧪 Guide de Test - Génération Modulaire dans menu.html

## 📍 Page de Test

**Page**: `client/menu.html` (Page Menus du dashboard resto)

**URL**: `http://localhost:5000/menu.html`

---

## 🔐 Étape 1 : Se Connecter

1. Allez sur `http://localhost:5000/index.html`
2. Connectez-vous avec vos identifiants **resto**
3. Vous serez redirigé vers `accueil.html`

---

## 🧩 Étape 2 : Accéder à la Génération Modulaire

1. Dans le menu de navigation, cliquez sur **"Menus"**
2. Vous arrivez sur `menu.html`
3. Dans la section **"Méthode de Génération"**, vous verrez maintenant **3 options** :
   - 📦 **Utiliser le Stock Actuel**
   - 🤖 **ChAIf IA**
   - 🧩 **Génération Modulaire** ← **NOUVEAU!**

---

## 🎯 Étape 3 : Tester la Génération Modulaire

### Option A : Mode Automatique (Recommandé pour tester)

1. **Sélectionnez** l'option "🧩 Génération Modulaire"
2. **Configurez** les paramètres :
   - **Type de Repas** : Déjeuner, Dîner, ou Petit-déjeuner
   - **Nombre de Convives** : 4 (par défaut)
   - **Régime Alimentaire** : Optionnel (Végétarien, Végétalien, etc.)
3. **Cliquez** sur "Générer des Menus"
4. **Attendez** la génération (quelques secondes)
5. **Résultat** : Un menu modulaire sera affiché avec :
   - Protéine sélectionnée
   - Sauce compatible (si disponible)
   - Accompagnement compatible (si disponible)
   - Liste des ingrédients totaux
   - Informations nutritionnelles
   - Instructions de préparation

### Option B : Mode Manuel (Pour plus de contrôle)

Pour tester le mode manuel, vous devrez d'abord récupérer les IDs des composants via l'API, puis les utiliser dans le code JavaScript.

---

## 📊 Ce que vous devriez voir

### Résultat Attendu

```
Menu: "Cuisse de poulet avec sauce champignons et riz blanc"

Composants:
- Protéine: Cuisse de poulet (55 min)
- Sauce: Sauce aux champignons (20 min)
- Accompagnement: Riz blanc (20 min)

Ingrédients nécessaires (pour 4 personnes):
- Cuisse de poulet: 4 pièces
- Huile d'olive: 4 c. à soupe
- Champignons: 600 g
- Crème fraîche: 400 ml
- Riz: 320 g
- ...

Nutrition (par portion):
- Calories: 560 kcal
- Protéines: 38 g
- Glucides: 33 g
- Lipides: 27 g
```

---

## 🐛 Dépannage

### Problème : "Erreur: Not authorized"
**Solution**: Vous n'êtes pas connecté. Reconnectez-vous via `index.html`

### Problème : "Aucune protéine compatible trouvée"
**Solution**: Vérifiez que le seed a été exécuté :
```bash
node scripts/seed-recipe-components.js
```

### Problème : "Route non trouvée (404)"
**Solution**: Le serveur n'a pas été redémarré. Redémarrez-le :
```bash
npm start
```

### Problème : Menu généré mais pas d'affichage
**Solution**: Vérifiez la console du navigateur (F12) pour voir les erreurs JavaScript

---

## ✅ Checklist de Test

- [ ] Serveur démarré
- [ ] Seed exécuté (10 protéines, 3 sauces, 4 accompagnements)
- [ ] Connecté avec un compte resto
- [ ] Page menu.html accessible
- [ ] Option "Génération Modulaire" visible
- [ ] Génération automatique fonctionne
- [ ] Menu affiché correctement
- [ ] Bouton "Générer une alternative" fonctionne

---

## 🎨 Fonctionnalités Testables

1. **Génération automatique** : L'IA sélectionne protéine + sauce + accompagnement
2. **Génération alternative** : Cliquer sur "Générer une alternative" pour une nouvelle combinaison
3. **Filtres** : Tester avec différents régimes alimentaires
4. **Nombre de personnes** : Tester avec différents nombres (les quantités s'adaptent)

---

## 📝 Notes

- La génération modulaire utilise les composants créés par le seed
- Les compatibilités sont automatiquement vérifiées
- Les quantités sont calculées automatiquement selon le nombre de personnes
- La nutrition est calculée en additionnant les composants

---

**Version: 1.0**  
**Last updated: January 2025**





