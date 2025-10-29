# 📊 Guide du Système Food Cost

## Vue d'ensemble

Le système Food Cost permet aux établissements (EHPAD, hôpitaux, etc.) de suivre et contrôler leurs dépenses alimentaires avec :
- ✅ Suivi budgétaire par période
- ✅ Calcul automatique des coûts (commandes + saisies manuelles)
- ✅ Alertes de dépassement budgétaire
- ✅ Indicateurs de performance (coût par repas, par résident, etc.)

## 🎯 Accès au module

### Qui peut y accéder ?
- **SITE_MANAGER** : Accès au food cost de son site
- **GROUP_ADMIN** : Accès à tous les sites de son groupe
- **admin** : Accès complet

### Où le trouver ?
1. Connectez-vous au dashboard EHPAD
2. Cliquez sur l'onglet **"Food Cost"** (icône graphique)

## 📈 Interface principale

### Statistiques globales (en haut)
Affiche 4 cartes avec :
- **Budget Total** : Somme de tous les budgets prévus
- **Dépensé** : Total des dépenses (commandes + manuel)
- **Écart** : Différence entre budget et dépensé
  - 🔴 Rouge si dépassement
  - 🟢 Vert si sous budget
- **Alertes** : Nombre d'alertes actives

### Alertes actives
Si des alertes sont présentes, elles s'affichent avec des couleurs :
- 🔴 **Critique** : Dépassement > 20%
- 🟠 **Haute** : Dépassement 10-20%
- 🟡 **Moyenne** : Dépassement 5-10%
- 🔵 **Faible** : Budget utilisé à 90-95%

## 🆕 Créer une période de suivi

### Étapes :
1. Cliquer sur **"Nouvelle période"**
2. Remplir le formulaire :
   - **Type de période** : Jour, Semaine, Mois, Trimestre, Année
   - **Date de début** : Date de début de la période
   - **Date de fin** : Date de fin de la période
   - **Budget prévu** (€) : Budget total pour cette période
   - **Budget par résident/jour** (optionnel) : Pour le calcul d'indicateurs
   - **Budget par repas** (optionnel) : Pour le calcul d'indicateurs
3. Cliquer sur **"Créer la période"**

### Calculs automatiques
Lors de la création, le système calcule automatiquement :
- ✅ Nombre de jours dans la période
- ✅ Nombre de résidents actifs
- ✅ Estimation du nombre de repas (résidents × jours × 3)
- ✅ Total des commandes fournisseurs dans cette période

## 📋 Consulter une période

### Vue d'ensemble
Chaque carte de période affiche :
- **Statut** (icône colorée) :
  - ✅ Vert : OK, dans le budget
  - ⚠️ Jaune : Attention, écart 0-10%
  - 🔶 Orange : Alerte, écart 10-20%
  - ❌ Rouge : Critique, écart > 20%
- **Type et dates** : Ex: "Mois du 01/11/2025 au 30/11/2025"
- **Budget, Dépensé, Écart** en pourcentage
- **Coût par repas** et **Coût par résident/jour**
- **Badge d'alerte** si alertes non acquittées

### Détails d'une période
Cliquer sur une carte pour voir :
- Statistiques détaillées
- Répartition des dépenses :
  - **Commandes fournisseurs** : Calculé automatiquement
  - **Dépenses manuelles** : Liste détaillée avec dates, catégories, montants
- Bouton pour **ajouter une dépense manuelle**

## ➕ Ajouter une dépense manuelle

### Cas d'usage
Pour les achats hors système de commande :
- Achats au marché local
- Dépannage chez un commerçant
- Achats non référencés dans les catalogues fournisseurs

### Formulaire
1. Ouvrir les détails d'une période
2. Cliquer sur **"Ajouter une dépense manuelle"**
3. Remplir :
   - **Date** * : Date de l'achat
   - **Catégorie** * : 
     - Fruits & Légumes
     - Viandes & Poissons
     - Produits Laitiers
     - Épicerie
     - Surgelés
     - Boissons
     - Pain & Pâtisserie
     - Autres
   - **Description** : Détails de l'achat
   - **Fournisseur** : Nom du vendeur
   - **Montant** * : Montant TTC en euros
   - **Numéro de facture** : Référence de la facture
   - **Notes** : Informations complémentaires
4. Cliquer sur **"Ajouter la dépense"**

### Après ajout
- Le total de la période est automatiquement recalculé
- Les indicateurs (coût par repas, etc.) sont mis à jour
- Les alertes sont réévaluées

## 🔔 Système d'alertes

### Types d'alertes automatiques

#### 1. Budget dépassé
- Se déclenche dès que dépenses > budget
- Sévérité selon l'écart :
  - 0-5% : Faible
  - 5-10% : Moyenne
  - 10-20% : Haute
  - > 20% : Critique

#### 2. Approche de la limite
- Se déclenche à 90% d'utilisation du budget
- Sévérité : Moyenne
- Permet d'anticiper un dépassement

### Acquitter une alerte
- Les alertes peuvent être marquées comme "lues"
- Elles restent dans l'historique mais ne s'affichent plus dans le compteur

## 📊 Indicateurs calculés

### Coût par repas
```
Coût par repas = Total dépenses / Nombre de repas
```
Exemple : 5000€ pour 2000 repas = 2,50€/repas

### Coût par résident/jour
```
Coût par résident/jour = Total dépenses / (Nombre résidents × Nombre jours)
```
Exemple : 5000€ pour 20 résidents sur 30 jours = 8,33€/résident/jour

### Écart budgétaire
```
Écart (€) = Dépenses - Budget
Écart (%) = (Dépenses - Budget) / Budget × 100
```
Exemple : 5200€ dépensés pour 5000€ budget = +200€ (+4%)

## 🔄 Recalcul des commandes

Le système recalcule automatiquement les commandes fournisseurs :
- Lors de la création d'une période
- Manuellement via l'API (développeurs uniquement)

Les commandes sont incluses si :
- Date de création dans la période
- Statut = "delivered" ou "completed"

## 💡 Bonnes pratiques

### 1. Périodes mensuelles
Recommandé pour :
- Suivi régulier
- Comparaison mois par mois
- Budgets annuels divisés en 12

### 2. Saisie régulière des dépenses manuelles
- Saisir au fur et à mesure (quotidien/hebdomadaire)
- Conserver les factures physiques
- Renseigner le numéro de facture pour traçabilité

### 3. Définir des budgets réalistes
Bases de calcul :
- **Historique** : Moyenne des 6 derniers mois
- **Benchmark** : 6-10€/résident/jour en EHPAD
- **Saisonnalité** : Adapter selon les saisons (fruits/légumes)

### 4. Surveiller les alertes
- Consulter le dashboard chaque semaine
- Réagir rapidement aux alertes "Moyenne" et "Haute"
- Analyser les causes de dépassement

### 5. Analyser les catégories de dépenses
- Identifier les postes les plus coûteux
- Comparer avec les standards du secteur
- Optimiser les achats (groupage, négociation)

## 🎓 Exemples d'utilisation

### Exemple 1 : EHPAD 30 résidents
**Budget mensuel** :
- 30 résidents × 30 jours × 8€/jour = 7 200€

**Saisie** :
- Type : Mois
- Dates : 01/11/2025 → 30/11/2025
- Budget : 7200€
- Budget/résident/jour : 8€

**Dépenses** :
- Commandes automatiques : 6 500€
- Marché (manuel) : 450€
- Dépannage boulangerie (manuel) : 180€
- **Total : 7 130€**

**Résultat** :
- ✅ Écart : -70€ (-0,97%)
- Statut : OK
- Coût/repas : 2,64€
- Coût/résident/jour : 7,92€

### Exemple 2 : Alerte de dépassement
**Budget** : 5 000€
**Dépenses au 20/11** : 4 600€ (92%)

**Alerte générée** :
- Type : "Approche de la limite"
- Sévérité : Moyenne
- Message : "Budget utilisé à 92%"

**Actions** :
1. Limiter les achats non essentiels
2. Privilégier les produits de saison moins chers
3. Négocier avec fournisseurs

## 🛠️ Résolution de problèmes

### Les commandes ne s'affichent pas
- Vérifier que les commandes sont en statut "delivered"
- Vérifier que les dates correspondent à la période
- Utiliser le bouton "Recalculer" (si disponible)

### Les statistiques ne se mettent pas à jour
- Rafraîchir la page (F5)
- Vérifier la connexion internet
- Se déconnecter et reconnecter

### Budget par repas non calculé
- Vérifier qu'il y a des résidents actifs
- S'assurer que la période a des dates valides
- Le calcul se base sur 3 repas/jour/résident

## 📞 Support

Pour toute question ou problème :
1. Consulter cette documentation
2. Vérifier les logs de la console (F12)
3. Contacter l'administrateur système

---

**Dernière mise à jour** : 29 octobre 2025  
**Version** : 1.0.0

