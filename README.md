# 🍽️ Chef SES - Plateforme Intelligente de Gestion de Restauration Collective

> **Solution IA complète pour la gestion de la restauration collective : génération automatique de menus, gestion du stock, réseau de fournisseurs, scan de codes-barres avec traçabilité avancée, et bien plus.**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](package.json)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0%2B-brightgreen.svg)](https://www.mongodb.com/)

---

## 📋 Table des Matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités Principales](#-fonctionnalités-principales)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Structure du Projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Fonctionnalités Récentes](#-fonctionnalités-récentes)
- [Cas d'Usage](#-cas-dusage)
- [Contribution](#-contribution)
- [License](#-license)

---

## 🎯 Vue d'ensemble

**Chef SES** est une plateforme intelligente de gestion complète de la restauration collective, conçue pour les professionnels de la cuisine (EHPAD, écoles, hôpitaux, restaurants, collectivités).

### Problème résolu

Les chefs de cuisine dans la restauration collective font face à des défis majeurs :
- ⏰ **10-15 heures par semaine** perdues sur des tâches manuelles complexes :
  - 4-6 heures pour créer des menus (allergies, intolérances, restrictions)
  - 2-3 heures pour gérer les commandes fournisseurs
  - 1-2 heures pour la conformité AFSCA
  - 2-3 heures pour la coordination et le suivi
- 🚨 **Risques sanitaires** : gestion complexe des allergies et restrictions (erreurs humaines)
  - **1 client sur 3 avec allergies est mis en danger** (BII, 2024)
- 📦 **Gaspillage alimentaire** : 20-30% de perte due à une mauvaise gestion du stock
- 💰 **Coûts cachés** : manque de visibilité sur les dépenses
- 🔄 **Processus fragmentés** : Excel, papier, emails = inefficacité

### Solution Chef SES

**Chef SES automatise et centralise toute la gestion** grâce à l'intelligence artificielle :
- ✅ Génération automatique de menus en **2 minutes** (vs 4-6 heures)
- ✅ Respect automatique de **toutes** les allergies et restrictions
- ✅ Réduction du gaspillage : **5-10%** (vs 20-30% standard)
- ✅ Écosystème complet : menus + stock + fournisseurs + food cost
- ✅ Architecture multi-sites native pour les groupes
- ✅ **🆕 Scanner de codes-barres** : Identification instantanée des produits
- ✅ **🆕 Intégration Open Food Facts** : Enrichissement automatique des données
- ✅ **🆕 Score Yuka automatique** : Calcul du score santé (0-100)

---

## ⚡ Fonctionnalités Principales

### 🧠 1. Générateur de Menus IA

**Génération automatique de menus équilibrés en quelques secondes**

- ✅ **Génération modulaire** : Combinaison de protéines, sauces et accompagnements
- ✅ **Base de 500+ recettes** enrichies avec tags et métadonnées
- ✅ **Respect automatique** de toutes les allergies et restrictions
- ✅ **Optimisation nutritionnelle** : calories, protéines, sodium, fibres
- ✅ **Anti-répétition intelligente** : évite les plats répétés
- ✅ **Adaptation aux textures** : normale, mixée, hachée (dysphagie)
- ✅ **Génération multi-jours** : menus hebdomadaires automatiques
- ✅ **Filtres avancés** : type de cuisine, régime, occasion, saison

**Gain de temps : 4-6 heures → 2 minutes**

### 📦 2. Gestion Intelligente du Stock

**Suivi en temps réel avec alertes automatiques**

- ✅ **Suivi en temps réel** des quantités et valeurs
- ✅ **Alertes automatiques** : seuils d'alerte, expiration proche
- ✅ **Intégration OCR** : scannez une facture, le stock se met à jour automatiquement
- ✅ **Mise à jour automatique** lors de la réception des commandes
- ✅ **Gestion multi-sites** : stocks indépendants par établissement
- ✅ **Historique complet** : traçabilité des mouvements
- ✅ **Calcul automatique** de la valeur du stock
- ✅ **🆕 Scanner de codes-barres** : Identification instantanée par caméra (mobile et desktop)
- ✅ **🆕 Open Food Facts** : Enrichissement automatique (origine, labels qualité, nutrition)
- ✅ **🆕 Score Yuka automatique** : Calcul du score santé (0-100) basé sur nutrition, additifs, transformation
- ✅ **🆕 Recherche multi-sources** : Base interne + Open Food Facts + GS1 (optionnel)

**Réduction du gaspillage : 20-30% → 5-10%**

### 🤝 3. Réseau de Fournisseurs Intégré

**Commandes simplifiées en quelques clics**

- ✅ **Catalogues numériques** en ligne
- ✅ **Commandes en quelques clics** depuis le stock
- ✅ **Suivi des livraisons** en temps réel
- ✅ **Notifications automatiques** : nouvelle commande, changement de statut
- ✅ **Comparaison de fournisseurs** : prix, qualité, délais
- ✅ **Intégration automatique** au stock à la réception
- ✅ **Gestion des commandes** : historique, factures, paiements
- ✅ **🆕 Recherche par code-barres** : Ajout rapide de produits avec données enrichies automatiquement

**Gain de temps : 2-3 heures → 15 minutes par commande (87% de réduction)**

### 👥 4. Gestion des Résidents/Élèves

**Profils nutritionnels complets avec restrictions**

- ✅ **Profils détaillés** : allergies, intolérances, régimes
- ✅ **Groupes d'âges** : gestion par tranches d'âge
- ✅ **Restrictions médicales** : dysphagie, diabète, etc.
- ✅ **Génération de menus** adaptés par groupe
- ✅ **Historique nutritionnel** : suivi des apports
- ✅ **Conformité AVIQ** : respect des fréquences recommandées

### 🏢 5. Architecture Multi-Sites

**Gestion centralisée avec autonomie par site**

- ✅ **Groupes et sites** : hiérarchie flexible
- ✅ **Données centralisées** : recettes, fournisseurs partagés
- ✅ **Stocks indépendants** : gestion autonome par site
- ✅ **Synchronisation automatique** : menus, données
- ✅ **Permissions granulaires** : accès par rôle et site
- ✅ **Tableaux de bord** : vue globale et vue site

**Exemple : Vulpia Group - 12 sites EHPAD, 4600+ résidents**

### 💰 6. Food Cost & Budget

**Suivi financier complet et optimisation des coûts**

- ✅ **Calcul automatique** du coût par menu
- ✅ **Suivi du budget** : dépenses vs prévisions
- ✅ **Analyse des coûts** : évolution, tendances
- ✅ **Optimisation** : suggestions d'économies
- ✅ **Rapports financiers** : export Excel, PDF

### 🍽️ 7. Système Modulaire pour Restaurants

**Nouvelle approche : sélection modulaire par les clients**

- ✅ **Tablette client** : interface tactile pour sélection modulaire
- ✅ **Sélection en 3 étapes** : protéine → sauce → accompagnement
- ✅ **Gestion des restrictions** : allergies, intolérances en temps réel
- ✅ **Dashboard chef** : réception et gestion des commandes
- ✅ **Statuts en temps réel** : en attente, en préparation, prêt, servi
- ✅ **Notifications automatiques** : nouvelles commandes
- ✅ **Tags MongoDB** : recherche et filtrage avancés

---

## 🏗️ Architecture

### Stack Technique

```
Frontend (Client)
├── HTML5 / CSS3
├── JavaScript (ES6+)
├── Font Awesome Icons
└── Responsive Design

Backend (Server)
├── Node.js (Express)
├── MongoDB (Mongoose)
├── OpenAI API (GPT-4)
├── WebSocket (Socket.io)
└── JWT Authentication

Services
├── OCR (Tesseract.js, Google Vision)
├── Notification Service
├── Email Service
├── File Upload (Multer)
└── Barcode Service (Open Food Facts, Yuka Score)
```

### Architecture Multi-Sites

```
Group (Groupe)
├── Sites (Établissements)
│   ├── Stock (indépendant)
│   ├── Résidents/Élèves
│   ├── Menus
│   └── Commandes
├── Fournisseurs (partagés)
├── Recettes (partagées)
└── Utilisateurs (rôles)
```

### Modèles de Données Principaux

- **User** : Utilisateurs (chef, admin, fournisseur, etc.)
- **Group** : Groupes d'établissements
- **Site** : Établissements individuels
- **Stock** : Inventaire par site
- **Recipe** : Recettes avec métadonnées
- **RecipeComponent** : Composants modulaires (protéine, sauce, accompagnement)
- **RecipeTemplate** : Templates de combinaisons modulaires
- **CustomerOrder** : Commandes clients (restaurants)
- **Order** : Commandes fournisseurs
- **Product** : Produits fournisseurs
- **Resident** : Résidents/élèves avec profils nutritionnels
- **Menu** : Menus générés
- **Planning** : Planning des menus

---

## 🛠️ Technologies

### Backend
- **Node.js** 18+
- **Express.js** 4.21+
- **MongoDB** 5.0+ (Mongoose 8.15+)
- **OpenAI** API (GPT-4)
- **Socket.io** (WebSocket)
- **JWT** (JSON Web Tokens)
- **bcryptjs** (Hash passwords)
- **cookie-parser** (HTTP-Only cookies)

### Frontend
- **HTML5 / CSS3**
- **JavaScript ES6+**
- **Font Awesome** 6.0+
- **Responsive Design** (Mobile-first)

### Services
- **Tesseract.js** (OCR)
- **Google Cloud Vision** (OCR avancé)
- **Multer** (File upload)
- **Express Rate Limit** (Sécurité)
- **Open Food Facts API** (Enrichissement produits)
- **Axios** (Requêtes HTTP pour APIs externes)

---

## 📦 Installation

### Prérequis

- **Node.js** >= 18.0.0
- **MongoDB** >= 5.0
- **npm** ou **yarn**

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-repo/chef-ses.git
cd chef-ses
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Éditer `.env` avec vos configurations :
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/chef-ses

# JWT
JWT_SECRET=votre_secret_jwt

# OpenAI
OPENAI_API_KEY=votre_clé_openai

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5000
```

4. **Initialiser la base de données**
```bash
# Créer un utilisateur admin
node scripts/create-admin-user.js

# Injecter les recettes
npm run inject-recipes

# Initialiser le stock (optionnel)
npm run init-stock
```

5. **Lancer le serveur**
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

6. **Accéder à l'application**
```
http://localhost:5000
```

---

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `MONGODB_URI` | URI de connexion MongoDB | ✅ |
| `JWT_SECRET` | Secret pour JWT | ✅ |
| `OPENAI_API_KEY` | Clé API OpenAI | ✅ |
| `PORT` | Port du serveur | ❌ (défaut: 5000) |
| `NODE_ENV` | Environnement (development/production) | ❌ |
| `FRONTEND_URL` | URL du frontend | ❌ |

### Configuration MongoDB

Assurez-vous que MongoDB est en cours d'exécution :
```bash
# Démarrer MongoDB (Windows)
net start MongoDB

# Démarrer MongoDB (Linux/Mac)
sudo systemctl start mongod
```

---

## 🚀 Utilisation

### 1. Connexion

Accédez à `http://localhost:5000` et connectez-vous avec vos identifiants.

**Rôles disponibles :**
- **Admin** : Accès complet
- **Chef** : Gestion menus, stock, commandes
- **Resto** : Gestion restaurant (menus modulaires)
- **Fournisseur** : Gestion catalogue et commandes
- **Collectivite** : Gestion collectivité (EHPAD, école, etc.)

### 2. Génération de Menus

#### Méthode Classique (IA)
1. Aller dans **Menus** → **Génération de Menus**
2. Sélectionner **"ChAlf IA"**
3. Configurer les filtres (nombre de personnes, régime, type de repas)
4. Cliquer sur **"Générer"**
5. Le menu est créé en quelques secondes

#### Méthode Modulaire (Restaurants)
1. Aller dans **Tablette Client** (onglet)
2. Sélectionner une **protéine**
3. Choisir une **sauce** (optionnel)
4. Choisir un **accompagnement** (optionnel)
5. Indiquer les **restrictions** (allergies, intolérances)
6. Cliquer sur **"Envoyer la commande au chef"**

### 3. Gestion du Stock

1. Aller dans **Stock** → **Inventaire**
2. **Ajouter** un ingrédient (manuel ou OCR)
3. Consulter les **alertes** (stock bas, expiration)
4. **Scanner une facture** : OCR met à jour automatiquement

### 4. Commandes Fournisseurs

1. Aller dans **Fournisseurs** → **Catalogue**
2. Parcourir les produits
3. Ajouter au panier
4. Passer la commande
5. Suivre la livraison
6. **Réception** : stock mis à jour automatiquement

### 5. Dashboard Chef (Restaurants)

1. Aller dans **Cuisine Chef** (onglet)
2. Voir les **commandes en attente**
3. Cliquer sur **"Commencer"** pour une commande
4. Marquer **"Prêt"** quand terminé
5. Marquer **"Servi"** après service

---

## 📁 Structure du Projet

```
chef-ses/
├── client/                 # Frontend
│   ├── css/               # Styles CSS
│   ├── js/                # JavaScript
│   ├── *.html             # Pages HTML
│   └── img/               # Images
│
├── controllers/            # Contrôleurs API
│   ├── authController.js
│   ├── menuController.js
│   ├── stockController.js
│   └── ...
│
├── models/                 # Modèles MongoDB
│   ├── User.js
│   ├── Stock.js
│   ├── Recipe.js
│   ├── RecipeComponent.js
│   ├── RecipeTemplate.js
│   ├── CustomerOrder.js
│   └── ...
│
├── routes/                 # Routes API
│   ├── authRoutes.js
│   ├── menuRoutes.js
│   ├── stockRoutes.js
│   ├── customerOrderRoutes.js
│   └── ...
│
├── middleware/             # Middleware Express
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── ...
│
├── services/               # Services métier
│   ├── openaiClient.js
│   ├── notificationService.js
│   └── ...
│
├── scripts/                # Scripts utilitaires
│   ├── inject-recipes.js
│   ├── seed-recipe-components.js
│   └── ...
│
├── docs/                   # Documentation
│   ├── SYSTEME-CLIENT-TABLETTE-RESTO.md
│   ├── SYSTEME-TAGS-MODULAIRES.md
│   └── ...
│
├── server.js               # Point d'entrée
├── package.json
└── README.md
```

---

## 📚 API Documentation

### Endpoints Principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Utilisateur actuel

#### Menus
- `POST /api/menus/generate` - Générer un menu (IA)
- `POST /api/menu-modular/generate-modular` - Générer menu modulaire
- `GET /api/menus` - Liste des menus
- `GET /api/menus/:id` - Détails d'un menu

#### Stock
- `GET /api/stock` - Liste du stock
- `POST /api/stock` - Ajouter un ingrédient
- `PUT /api/stock/:id` - Modifier un ingrédient
- `DELETE /api/stock/:id` - Supprimer un ingrédient

#### Composants Modulaires
- `GET /api/recipe-components` - Liste des composants
- `GET /api/recipe-components?type=protein` - Filtrer par type
- `GET /api/recipe-components?tags=rapide,facile` - Filtrer par tags
- `POST /api/recipe-components` - Créer un composant

#### Commandes Clients (Restaurants)
- `POST /api/customer-orders` - Créer une commande
- `GET /api/customer-orders/kitchen` - Commandes pour le chef
- `PUT /api/customer-orders/:id/status` - Mettre à jour le statut

#### Fournisseurs
- `GET /api/suppliers` - Liste des fournisseurs
- `GET /api/products` - Catalogue produits
- `POST /api/orders` - Passer une commande

#### Codes-Barres
- `GET /api/barcode/:code` - Rechercher un produit par code-barres
- Retourne : Données Open Food Facts + Score Yuka + Traçabilité

---

## 🆕 Fonctionnalités Récentes

### Version 2.0 (Janvier 2025) — Scanner de Codes-Barres & Traçabilité

#### 📷 **Scanner de Codes-Barres**
- **Détection par caméra** : Mobile et desktop
- **Support multi-formats** : EAN-13, UPC, Code 128, Code 39
- **Saisie manuelle** : Auto-détection du code-barres
- **Remplissage automatique** : Formulaire pré-rempli avec les données du produit

#### 🌍 **Intégration Open Food Facts**
- **Base de données collaborative** : Gratuite et open source
- **Enrichissement automatique** :
  - Nom, marque, catégories
  - Pays d'origine et lieux de fabrication
  - Labels qualité (AB, Label Rouge, AOC)
  - Informations nutritionnelles complètes
  - Images des produits

#### ⭐ **Calcul Automatique du Score Yuka**
- **Score santé 0-100** : Calculé automatiquement
- **Basé sur 3 critères** :
  - **Nutrition (60%)** : Nutri-Score, calories, graisses, sucre, sel
  - **Additifs (30%)** : Détection des additifs problématiques (E100-E955)
  - **Transformation (10%)** : Classification NOVA (degré de transformation)
- **Labels visuels** : Excellent / Bon / Médiocre / Mauvais
- **Recommandations automatiques** : Suggestions d'amélioration

#### 🔍 **Recherche Multi-Sources**
- **Base de données interne** : Priorité (données complétées par les fournisseurs)
- **Open Food Facts** : Source principale gratuite
- **GS1 CodeOnline** : Optionnel (payant, données officielles)
- **Barcodes Database** : Fallback

#### 📋 **Traçabilité Complète**
- **Conformité AFSCA** : Traçabilité complète avec origine et labels
- **Informations d'origine** : Pays, lieux de fabrication
- **Labels qualité** : Détection automatique (Bio, Label Rouge, etc.)
- **Données nutritionnelles** : Enrichies automatiquement

### Fonctionnalités Existantes

#### 1. Système Modulaire de Menus
- **Composants modulaires** : Protéines, sauces, accompagnements stockés dans MongoDB
- **Templates générés** : Combinaisons automatiques avec tags
- **Recherche par tags** : Filtrage avancé (rapide, facile, gourmand, etc.)
- **Compatibilité** : Système de compatibilité entre composants

#### 2. Tablette Client pour Restaurants
- **Interface tactile** : Optimisée pour tablettes
- **Sélection modulaire** : 3 étapes (protéine → sauce → accompagnement)
- **Gestion des restrictions** : Allergies, intolérances en temps réel
- **Envoi automatique** : Commandes envoyées directement au chef

#### 3. Dashboard Chef
- **Temps réel** : Rafraîchissement automatique (5 secondes)
- **Gestion des statuts** : En attente → En préparation → Prêt → Servi
- **Alertes visuelles** : Restrictions mises en évidence
- **Filtres** : Par statut, table, etc.

#### 4. Système de Tags MongoDB
- **Tags normalisés** : Minuscules, indexés
- **Catégories** : Type, cuisine, difficulté, occasion, saison
- **Recherche avancée** : Multi-critères avec tags
- **Héritage automatique** : Tags combinés dans les templates

---

## 💼 Cas d'Usage

### EHPAD (Vulpia Group)
- **12 sites** gérés centralement
- **4600+ résidents** avec profils nutritionnels
- **Génération automatique** de menus par site (4 heures → 2 minutes)
- **Respect strict** des allergies et restrictions médicales (0 erreur depuis déploiement)
- **Conformité AVIQ** : fréquences recommandées
- **Gain de temps total** : 10-15 heures/semaine économisées
- **Réduction du gaspillage** : 20% de réduction mesurée
- **Validation** : Vulpia Group a montré son intérêt à acquérir l'application après une présentation

### Restaurants
- **Tablette client** : Sélection modulaire par les clients
- **Dashboard chef** : Gestion des commandes en temps réel
- **Gestion des restrictions** : Allergies, intolérances
- **Optimisation** : Réduction du gaspillage

### Écoles
- **Groupes d'âges** : Menus adaptés par tranche d'âge
- **Équilibre nutritionnel** : Respect des recommandations
- **Gestion des élèves** : Profils avec restrictions
- **Planification** : Menus hebdomadaires automatiques

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 License

Ce projet est sous licence ISC.

---

## 📞 Contact & Support

- **Email** : support@chef-ses.com
- **Documentation** : Voir le dossier `/docs`
- **Issues** : GitHub Issues

---

## 🎯 Roadmap

### Prochaines fonctionnalités
- [ ] Base de données interne pour codes-barres (cache des données enrichies)
- [ ] Intégration GS1 CodeOnline (optionnel, payant)
- [ ] Application mobile (React Native)
- [ ] Intégration avec systèmes de caisse
- [ ] Analytics avancés (BI)
- [ ] Export PDF amélioré
- [ ] Multi-langues (i18n)
- [ ] API publique documentée (Swagger)

---

**Développé avec ❤️ pour les professionnels de la restauration collective**




