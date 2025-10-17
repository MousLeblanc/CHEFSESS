# Chef SES - Système de Gestion Multi-Sites

## 🍽️ Vue d'ensemble

Chef SES est une plateforme complète de gestion de cantines et de restaurants pour différents types d'établissements (écoles, EHPADs, hôpitaux, entreprises, maisons de retraite). Le système permet la gestion centralisée des menus, des stocks, des commandes et des résidents avec synchronisation automatique entre les sites.

## 🏗️ Architecture

### Structure Multi-Sites
- **Groupe Vulpia** : Administration centrale
- **Sites individuels** : Chaque établissement gère ses propres données
- **Synchronisation** : Menus et données centralisées avec synchronisation automatique

### Types d'établissements supportés
- 🏫 **Écoles** : Cantine scolaire avec menus adaptés aux enfants
- 🏥 **EHPADs** : Gestion des résidents avec profils nutritionnels détaillés
- 🏥 **Hôpitaux** : Menus thérapeutiques et restrictions médicales
- 🏢 **Entreprises** : Cantine d'entreprise avec buffet
- 🏠 **Maisons de retraite** : Gestion des résidents âgés
- 🏛️ **Collectivités** : Gestion multi-établissements

## 🚀 Fonctionnalités principales

### 1. Gestion des Menus Intelligents
- **Génération automatique** avec IA (GPT-4)
- **Adaptation par âge** : Quantités et plats adaptés
- **Gestion des allergies** : Menus principaux + variantes
- **Types de menus** :
  - Cantine scolaire : Plat principal ou Soupe + Plat
  - Entreprise : Buffet avec 3 plats principaux + salade + 3 desserts
  - EHPAD/Hôpital : Menus thérapeutiques adaptés

### 2. Gestion des Résidents
- **Carte d'identité nutritionnelle** complète
- **Allergies et intolérances** avec niveaux de gravité
- **Restrictions alimentaires** (religieuses, éthiques, médicales)
- **Besoins nutritionnels** spécifiques
- **Préférences de texture** et hydratation
- **Contact d'urgence** et informations médicales

### 3. Gestion des Stocks
- **Stock clients** : Gestion des ingrédients par site
- **Stock fournisseurs** : Catalogue de produits
- **Alertes de stock** : Notifications automatiques
- **Intégration OCR** : Saisie automatique depuis photos

### 4. Gestion des Commandes
- **Création de commandes** depuis les stocks
- **Suivi en temps réel** : Envoyé, livré, problème
- **Notifications** : Alertes pour clients et fournisseurs
- **Historique complet** des transactions

### 5. Synchronisation Multi-Sites
- **Menus centralisés** : Création au niveau groupe
- **Synchronisation automatique** vers tous les sites
- **Gestion des modifications locales** : Override possible
- **Rapports consolidés** : Vue d'ensemble nutritionnelle et financière

## 🔐 Système d'authentification

### Comptes Groupe (Vulpia)
- **Email** : `vulpiagroup@gmail.com`
- **Rôle** : GROUP_ADMIN
- **Accès** : Gestion centralisée de tous les sites

### Comptes Sites
- **Format** : `nomdusite@vulpia.com`
- **Exemples** :
  - `arthur@vulpia.com`
  - `develdekens@vulpia.com`
  - `ecoleprimaire@vulpia.com`
- **Rôle** : SITE_MANAGER
- **Accès** : Gestion de leur site uniquement

### Rôles disponibles
- **GROUP_ADMIN** : Administration complète du groupe
- **SITE_MANAGER** : Gestion d'un site
- **CHEF** : Gestion des menus et recettes
- **NUTRITIONIST** : Gestion des profils nutritionnels
- **SUPPLIER** : Gestion des produits et commandes
- **VIEWER** : Consultation uniquement

## 📁 Structure du projet

```
CHEF-SES/
├── client/                    # Interface utilisateur
│   ├── index.html            # Page d'accueil
│   ├── group-dashboard.html  # Tableau de bord groupe
│   ├── site-dashboard.html   # Tableau de bord site
│   ├── site-residents.html   # Gestion des résidents
│   ├── add-resident.html     # Ajout de résident
│   ├── site-login.html       # Connexion site
│   └── js/                   # Scripts JavaScript
├── server.js                 # Serveur principal
├── models/                   # Modèles de données
│   ├── User.js              # Utilisateurs
│   ├── Group.js             # Groupes
│   ├── Site.js              # Sites
│   ├── Resident.js          # Résidents
│   ├── Menu.js              # Menus
│   ├── Stock.js             # Stocks
│   └── Order.js             # Commandes
├── controllers/              # Contrôleurs API
├── routes/                   # Routes API
├── middleware/               # Middlewares
└── services/                 # Services (OpenAI, etc.)
```

## 🛠️ Installation et Configuration

### Prérequis
- Node.js (v16+)
- MongoDB (local ou Atlas)
- Compte OpenAI (pour l'IA)

### Installation
```bash
# Cloner le projet
git clone [url-du-repo]
cd CHEF-SES

# Installer les dépendances
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos paramètres

# Démarrer le serveur
npm start
```

### Variables d'environnement
```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/chef-ses

# JWT
JWT_SECRET=votre-secret-jwt

# OpenAI
OPENAI_API_KEY=votre-clé-openai

# Serveur
PORT=5000
NODE_ENV=development
```

## 🚀 Utilisation

### 1. Connexion Groupe Vulpia
1. Aller sur `http://localhost:5000`
2. Se connecter avec `vulpiagroup@gmail.com`
3. Accéder au tableau de bord de groupe
4. Créer et gérer les sites

### 2. Connexion Sites
1. Aller sur `http://localhost:5000/site-login.html`
2. Se connecter avec `nomdusite@vulpia.com`
3. Gérer les résidents et voir les menus synchronisés

### 3. Gestion des Résidents
1. Se connecter en tant que site
2. Aller dans "Gestion des Résidents"
3. Ajouter des résidents avec leurs profils nutritionnels
4. Les données sont automatiquement centralisées

### 4. Synchronisation des Menus
1. Créer un menu au niveau groupe
2. Synchroniser vers tous les sites
3. Chaque site voit le menu adapté à son type

## 📊 Modèles de données

### Résident
```javascript
{
  firstName: String,
  lastName: String,
  dateOfBirth: Date,
  gender: String,
  roomNumber: String,
  nutritionalProfile: {
    allergies: [{
      allergen: String,
      severity: String
    }],
    intolerances: [{
      substance: String,
      severity: String
    }],
    dietaryRestrictions: [{
      type: String,
      restriction: String
    }],
    nutritionalNeeds: {
      calories: Number,
      proteins: Number,
      sodium: String,
      sugar: String
    }
  },
  siteId: ObjectId,
  groupId: ObjectId
}
```

### Site
```javascript
{
  siteName: String,
  type: String, // ehpad, hopital, ecole, etc.
  address: Object,
  contact: Object,
  managers: [ObjectId],
  syncMode: String,
  isActive: Boolean,
  groupId: ObjectId
}
```

## 🔧 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/sites/login` - Connexion site

### Résidents
- `GET /api/residents/site/:siteId` - Liste des résidents d'un site
- `POST /api/residents` - Créer un résident
- `PUT /api/residents/:id` - Modifier un résident
- `DELETE /api/residents/:id` - Supprimer un résident

### Sites
- `GET /api/sites/:siteId` - Informations d'un site
- `GET /api/sites/:siteId/menus` - Menus d'un site

### Groupes
- `GET /api/groups/:groupId/sites` - Sites d'un groupe
- `POST /api/groups/:groupId/sites` - Créer un site

## 🤖 Intelligence Artificielle

### Génération de Menus
- **Contexte adaptatif** : Type d'établissement, âge, saison
- **Gestion des allergies** : Menus principaux + variantes
- **Équilibre nutritionnel** : Respect des besoins par âge
- **Cohérence** : Menus variés sur la semaine

### Génération de Recettes
- **Adaptation aux profils** : Texture, restrictions, pathologies
- **Créativité** : Nouvelles recettes basées sur les ingrédients disponibles
- **Sécurité** : Vérification des compatibilités alimentaires

## 📱 Interface Utilisateur

### Design Responsive
- **Mobile-first** : Optimisé pour tous les écrans
- **Accessibilité** : Conforme aux standards WCAG
- **Performance** : Chargement rapide et fluide

### Composants
- **Cartes interactives** : Affichage des données
- **Formulaires dynamiques** : Ajout/suppression d'éléments
- **Notifications** : Feedback utilisateur en temps réel
- **Pagination** : Gestion des grandes listes

## 🔒 Sécurité

### Authentification
- **JWT Tokens** : Sessions sécurisées
- **Cookies HttpOnly** : Protection XSS
- **Hachage des mots de passe** : bcrypt

### Autorisation
- **Rôles granulaires** : Accès basé sur les permissions
- **Isolation des données** : Sites ne voient que leurs données
- **Validation** : Vérification côté serveur

## 📈 Monitoring et Logs

### Logs
- **Connexions** : Suivi des accès
- **Modifications** : Historique des changements
- **Erreurs** : Détection et notification

### Métriques
- **Utilisation** : Nombre de connexions, actions
- **Performance** : Temps de réponse
- **Qualité** : Taux d'erreur

## 🚀 Déploiement

### Production
- **Base de données** : MongoDB Atlas recommandé
- **Serveur** : Node.js avec PM2
- **Reverse Proxy** : Nginx
- **SSL** : Certificats Let's Encrypt

### Environnement
- **Variables d'environnement** : Configuration sécurisée
- **Secrets** : Gestion des clés API
- **Monitoring** : Surveillance en temps réel

## 🤝 Contribution

### Développement
1. Fork du projet
2. Créer une branche feature
3. Commits descriptifs
4. Tests unitaires
5. Pull request

### Standards
- **Code** : ESLint + Prettier
- **Commits** : Conventionnel
- **Tests** : Couverture > 80%
- **Documentation** : JSDoc

## 📞 Support

### Contact
- **Email** : support@vulpia.com
- **Documentation** : [Wiki du projet]
- **Issues** : [GitHub Issues]

### FAQ
- **Connexion** : Vérifier les identifiants
- **Synchronisation** : Vérifier la connectivité
- **Performance** : Vérifier les logs

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🎯 Roadmap

### Version 2.0
- [ ] Application mobile native
- [ ] Intégration ERP
- [ ] Analytics avancées
- [ ] API publique

### Version 2.1
- [ ] Multi-langues
- [ ] Thèmes personnalisables
- [ ] Intégrations tierces
- [ ] Machine Learning

---

**Chef SES** - Simplifiant la gestion des cantines depuis 2024 🍽️
