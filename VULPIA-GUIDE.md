# Guide d'utilisation - Système Multi-Sites Vulpia Group

## 🎯 Vue d'ensemble

Le système Chef SES est maintenant configuré pour gérer le groupe Vulpia avec ses 12 sites EHPAD actifs (sur 72 au total). Chaque site peut se connecter indépendamment et gérer ses résidents, toutes les données étant centralisées sur le tableau de bord du groupe.

---

## 📋 Les 12 Sites Actifs

1. **Arthur** - arthur@vulpiagroup.com
2. **Beukenhof** - beukenhof@vulpiagroup.com
3. **De Linde** - delinde@vulpiagroup.com
4. **De Nieuwe Kaai** - denieuwkaai@vulpiagroup.com
5. **De Veldekens** - develdekens@vulpiagroup.com
6. **Driesenhof** - driesenhof@vulpiagroup.com
7. **Elysia Park** - elysiapark@vulpiagroup.com
8. **Halmolen** - halmolen@vulpiagroup.com
9. **Henri Jaspar Premium Living** - henrijaspar@vulpiagroup.com
10. **Herenhof** - herenhof@vulpiagroup.com
11. **Villa ter Molen** - villatermolen@vulpiagroup.com
12. **Vuerenveld** - vuerenveld@vulpiagroup.com

---

## 🚀 Étape 1 : Initialiser le Groupe Vulpia

### Exécuter le script d'initialisation

```bash
npm run init-vulpia
```

Ce script va :
- ✅ Créer le groupe "Vulpia Group" avec le code `vulpia-group`
- ✅ Créer un compte administrateur pour le groupe
- ✅ Créer les 12 sites EHPAD
- ✅ Créer un compte utilisateur pour chaque site avec un mot de passe par défaut

### Comptes créés

**Administrateur du Groupe :**
- Email : `admin@vulpiagroup.com`
- Mot de passe : `VulpiaAdmin2024!` (à changer après première connexion)
- URL de connexion : https://chefsess.onrender.com

**Comptes des Sites :**
- Chaque site a un compte avec le format : `nomdusite@vulpiagroup.com`
- Mot de passe par défaut : `NomDuSite2024!` (ex: `Arthur2024!`, `Beukenhof2024!`)
- URL de connexion : https://chefsess.onrender.com/site-login.html

---

## 👤 Étape 2 : Connexion en tant qu'Administrateur Groupe

### Se connecter au tableau de bord du groupe

1. Aller sur : https://chefsess.onrender.com
2. Se connecter avec :
   - Email : `admin@vulpiagroup.com`
   - Mot de passe : `VulpiaAdmin2024!`
3. Vous accédez au **Group Dashboard** qui affiche :
   - 📊 Vue d'ensemble des 12 sites
   - 👥 Nombre total de résidents (4600+)
   - 📈 Statistiques consolidées
   - 🔍 Gestion centralisée des sites

---

## 🏢 Étape 3 : Connexion en tant que Site

### Se connecter depuis un site individuel

1. Aller sur : https://chefsess.onrender.com/site-login.html
2. Se connecter avec les identifiants du site, par exemple :
   - Email : `arthur@vulpiagroup.com`
   - Mot de passe : `Arthur2024!`
3. Vous accédez au **Site Dashboard** du site Arthur

---

## 👥 Étape 4 : Gestion des Résidents

### Depuis le dashboard d'un site

Une fois connecté en tant que site, vous pouvez :

1. **Accéder à la gestion des résidents** :
   - Cliquer sur l'onglet "Résidents" ou
   - Accéder directement à `site-residents.html`

2. **Ajouter un nouveau résident** :
   - Cliquer sur "Ajouter un résident"
   - Remplir les informations :
     * Informations personnelles (nom, prénom, date de naissance, sexe)
     * Informations médicales (numéro de chambre, dossier médical)
     * **Profil nutritionnel complet** :
       - Allergies et intolérances
       - Restrictions alimentaires (religieuses, éthiques, médicales)
       - Conditions médicales (diabète, hypertension, dysphagie, Alzheimer, etc.)
       - Besoins nutritionnels spécifiques (calories, protéines, sodium, sucre)
       - Préférences de texture (normale, mixée, hachée, liquide)
       - Hydratation
       - Préférences alimentaires

3. **Gérer les résidents** :
   - ✏️ Modifier les informations d'un résident
   - 🔍 Rechercher et filtrer les résidents
   - 📊 Voir les statistiques du site
   - 🍽️ Générer des menus adaptés aux besoins spécifiques

### Données automatiquement synchronisées

Chaque résident créé est automatiquement lié :
- ✅ Au site qui l'a créé (`siteId`)
- ✅ Au groupe Vulpia (`groupId`)
- ✅ À l'utilisateur qui l'a créé (`createdBy`)

---

## 📊 Étape 5 : Visualisation Centralisée

### Depuis le tableau de bord du groupe

L'administrateur du groupe peut :

1. **Voir tous les sites** :
   - Affichage des 12 sites avec leur statut (ACTIF)
   - Informations de synchronisation
   - Actions disponibles : Voir, Modifier

2. **Accéder aux résidents de tous les sites** :
   - Vue consolidée des 4600+ résidents
   - Filtres par site, condition médicale, allergie
   - Statistiques globales par site
   - Recherche multi-sites

3. **Gérer les menus centralisés** :
   - Créer des menus groupés pour plusieurs sites
   - Appliquer des restrictions globales
   - Synchroniser automatiquement avec les sites

---

## 🔐 Gestion des Mots de Passe

### Changer le mot de passe par défaut

Après la première connexion, chaque site devrait changer son mot de passe :

1. Se connecter avec le mot de passe par défaut
2. Aller dans "Profil" ou "Paramètres"
3. Modifier le mot de passe
4. Choisir un mot de passe fort et unique

---

## 📝 Structure des Données

### Hiérarchie

```
Vulpia Group (groupId)
├── Admin Groupe (admin@vulpiagroup.com)
└── 12 Sites (siteId)
    ├── Arthur
    │   ├── Responsable (arthur@vulpiagroup.com)
    │   └── Résidents (~380)
    ├── Beukenhof
    │   ├── Responsable (beukenhof@vulpiagroup.com)
    │   └── Résidents (~380)
    └── ... (10 autres sites)
```

### Modèle de Résident

Chaque résident contient :
- **Informations de base** : Nom, prénom, date de naissance, sexe
- **Contact** : Téléphone, email, adresse
- **Médical** : Numéro de chambre, dossier médical
- **Profil nutritionnel complet** :
  - Allergies (avec sévérité et symptômes)
  - Intolérances
  - Restrictions alimentaires
  - Conditions médicales
  - Besoins nutritionnels (calories, protéines, sodium, sucre)
  - Texture et mastication
  - Hydratation
  - Préférences alimentaires
- **Contact d'urgence**
- **Historique des modifications**

---

## 🔧 Maintenance et Support

### Ajouter un nouveau site

1. Créer le site dans la base de données (via API ou script)
2. Créer un compte utilisateur avec :
   - Email : `nouveausite@vulpiagroup.com`
   - Role : `collectivite`
   - `establishmentType` : `ehpad`
   - `groupId` : ID du groupe Vulpia
   - `siteId` : ID du nouveau site
   - `roles` : `['SITE_MANAGER', 'NUTRITIONIST']`

### Désactiver un site

1. Se connecter en tant qu'administrateur groupe
2. Aller dans "Gestion des Sites"
3. Modifier le site
4. Changer le statut à "INACTIF"

---

## 📞 Support Technique

Pour toute question ou problème :
- 📧 Email : contact@vulpiagroup.com
- 📱 Téléphone : +32 3 680 29 90
- 🌐 Site web : https://vulpia.be

---

## ✨ Fonctionnalités Clés

### Pour les Sites
- ✅ Gestion complète des résidents avec profils nutritionnels détaillés
- ✅ Génération de menus adaptés aux besoins médicaux
- ✅ Gestion du stock et des commandes
- ✅ Suivi des fournisseurs
- ✅ Interface intuitive et moderne

### Pour le Groupe
- ✅ Vue consolidée de tous les sites
- ✅ Statistiques globales en temps réel
- ✅ Gestion centralisée des menus
- ✅ Synchronisation automatique
- ✅ Rapports et analyses

---

## 🎉 Prochaines Étapes

1. ✅ Exécuter `npm run init-vulpia` pour initialiser le système
2. ✅ Se connecter en tant qu'administrateur groupe
3. ✅ Vérifier que les 12 sites sont bien créés
4. ✅ Tester la connexion d'un site (ex: Arthur)
5. ✅ Ajouter quelques résidents de test
6. ✅ Vérifier que les résidents apparaissent sur le group dashboard
7. ✅ Former les responsables de chaque site
8. ✅ Déployer en production !

---

**Date de création** : 23 octobre 2025  
**Version** : 1.0  
**Chef SES** - Système de Gestion Multi-Sites pour Vulpia Group 🚀

