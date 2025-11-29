# Guide de Connexion des Sites pour un Groupe Multi-Site

## 📋 Vue d'ensemble

Pour qu'un site puisse se connecter à son tableau de bord, il faut :
1. **Créer le Site** dans le groupe (via l'interface admin ou API)
2. **Créer un compte utilisateur** pour le site avec `role: 'collectivite'`, `groupId` et `siteId`
3. **Le site se connecte** via `/site-login.html` avec son email et mot de passe

---

## 🚀 Processus de Configuration

### Étape 1 : Vérifier le Groupe

Le groupe doit exister avec un administrateur (ex: `iris@gmail.com`).

**Vérification :**
```javascript
// Dans MongoDB ou via l'interface admin
// Le groupe doit avoir :
- name: "Nom du Groupe"
- code: "code-du-groupe"
- Un User avec role: 'groupe' et groupId associé
```

---

### Étape 2 : Créer les Sites

Les sites peuvent être créés de deux façons :

#### Option A : Via l'interface Admin Groupe

1. Connectez-vous avec `iris@gmail.com` sur `/index.html`
2. Allez dans l'onglet **"Sites"**
3. Cliquez sur **"Ajouter un site"**
4. Remplissez les informations :
   - **Nom du site** : ex. "EHPAD Saint-Michel"
   - **Type** : EHPAD, Hôpital, École, etc.
   - **Adresse** : adresse complète
   - **Contact** : email, téléphone

#### Option B : Via l'API (pour plusieurs sites)

```javascript
// POST /api/groups/:groupId/sites
{
  "siteName": "EHPAD Saint-Michel",
  "type": "ehpad",
  "address": {
    "street": "123 Rue Example",
    "city": "Bruxelles",
    "postalCode": "1000",
    "country": "Belgique"
  },
  "contact": {
    "email": "saintmichel@group.com",
    "phone": "+32 2 123 45 67"
  }
}
```

---

### Étape 3 : Créer les Comptes Utilisateurs pour les Sites

Pour chaque site, il faut créer un compte utilisateur.

#### Option A : Via l'interface Admin Groupe

1. Dans l'onglet **"Sites"**, sélectionnez un site
2. Cliquez sur **"Gérer les utilisateurs"** ou **"Ajouter un utilisateur"**
3. Remplissez :
   - **Nom** : ex. "Responsable EHPAD Saint-Michel"
   - **Email** : ex. "saintmichel@group.com"
   - **Mot de passe** : (généré ou défini)
   - **Rôles** : SITE_MANAGER, CHEF, NUTRITIONIST

#### Option B : Via l'API

```javascript
// POST /api/sites/:siteId/users
{
  "name": "Responsable EHPAD Saint-Michel",
  "username": "saintmichel",
  "email": "saintmichel@group.com",
  "password": "MotDePasse2024!",
  "roles": ["SITE_MANAGER", "CHEF"]
}
```

#### Option C : Via un Script (pour plusieurs sites)

Créez un script similaire à `scripts/add-all-vulpia-sites.js` :

```javascript
// scripts/create-sites-for-group.js
import mongoose from 'mongoose';
import User from './models/User.js';
import Site from './models/Site.js';
import Group from './models/Group.js';
import bcrypt from 'bcryptjs';

const sites = [
  {
    name: "Site 1",
    email: "site1@group.com",
    type: "ehpad"
  },
  {
    name: "Site 2",
    email: "site2@group.com",
    type: "ehpad"
  }
  // ... autres sites
];

async function createSitesForGroup() {
  // 1. Trouver le groupe
  const group = await Group.findOne({ 
    // Trouver par email de l'admin
    // ou par code du groupe
  });
  
  // 2. Pour chaque site
  for (const siteData of sites) {
    // Créer le site
    const site = await Site.create({
      groupId: group._id,
      siteName: siteData.name,
      type: siteData.type,
      isActive: true
    });
    
    // Créer l'utilisateur
    const hashedPassword = await bcrypt.hash('MotDePasse2024!', 10);
    const user = await User.create({
      name: `Responsable ${siteData.name}`,
      email: siteData.email,
      password: hashedPassword,
      role: 'collectivite',
      groupId: group._id,
      siteId: site._id,
      roles: ['SITE_MANAGER'],
      businessName: siteData.name,
      establishmentType: siteData.type
    });
    
    // Ajouter l'utilisateur aux managers du site
    site.managers.push(user._id);
    await site.save();
  }
}
```

---

## 🔐 Connexion des Sites

### Méthode 1 : Connexion Standard (Recommandée)

Les sites peuvent se connecter via la **page de connexion principale** : **`/index.html`**

**Informations Requises :**
1. **Email** : L'email du compte utilisateur créé (ex: `saintmichel@group.com`)
2. **Mot de passe** : Le mot de passe défini lors de la création

**Processus de Connexion :**
1. L'utilisateur va sur `/index.html`
2. Il entre son **email** et **mot de passe**
3. Le système :
   - Trouve l'utilisateur par email
   - Vérifie le mot de passe
   - Génère un token JWT avec `siteId` et `groupId` (si présents)
   - Redirige automatiquement vers le dashboard approprié :
     - Si `role: 'groupe'` → `/group-dashboard.html`
     - Si `role: 'collectivite'` avec `siteId` → `/ehpad-dashboard.html` (ou selon `establishmentType`)

### Méthode 2 : Connexion Site Spécifique (Alternative)

Les sites peuvent aussi se connecter via : **`/site-login.html`**

Cette méthode nécessite :
- **Site Code** : Nom du site (recherche par nom)
- **Username** : Nom d'utilisateur (pas l'email)
- **Mot de passe** : Le mot de passe

**Note :** Cette méthode est moins utilisée car elle nécessite un `username` séparé de l'email.

---

## 📝 Format des Comptes

### Pour le Groupe (Admin)

- **Email** : `iris@gmail.com`
- **Role** : `groupe`
- **Roles** : `['GROUP_ADMIN']`
- **groupId** : ID du groupe (créé automatiquement)
- **Connexion** : `/index.html` → redirige vers `/group-dashboard.html`

### Pour les Sites

- **Email** : `nomdusite@group.com` (ou format personnalisé)
- **Role** : `collectivite`
- **Roles** : `['SITE_MANAGER']` ou `['SITE_MANAGER', 'CHEF']` ou `['SITE_MANAGER', 'CHEF', 'NUTRITIONIST']`
- **groupId** : ID du groupe parent (obligatoire)
- **siteId** : ID du site associé (obligatoire)
- **establishmentType** : `'ehpad'`, `'hopital'`, `'ecole'`, etc.
- **Connexion** : `/index.html` → redirige automatiquement vers `/ehpad-dashboard.html` (ou selon le type)

---

## ✅ Checklist de Configuration

Pour chaque nouveau site :

- [ ] Le groupe existe avec un admin (ex: `iris@gmail.com`)
- [ ] Le site est créé dans le groupe (via admin ou API)
- [ ] Un compte utilisateur est créé avec :
  - [ ] `role: 'collectivite'`
  - [ ] `groupId` associé au groupe
  - [ ] `siteId` associé au site
  - [ ] `roles: ['SITE_MANAGER']` (ou autres rôles)
  - [ ] Email et mot de passe définis
- [ ] L'utilisateur est ajouté dans `site.managers`
- [ ] Le site est actif (`isActive: true`)

---

## 🔍 Vérification

### Vérifier qu'un site peut se connecter

```javascript
// Dans MongoDB
// 1. Vérifier le site
db.sites.findOne({ siteName: "EHPAD Saint-Michel" })

// 2. Vérifier l'utilisateur
db.users.findOne({ 
  email: "saintmichel@group.com",
  groupId: ObjectId("..."),
  siteId: ObjectId("...")
})

// 3. Vérifier que l'utilisateur est dans site.managers
db.sites.findOne({ 
  _id: ObjectId("..."),
  managers: ObjectId("...")
})
```

---

## 🛠️ Script Rapide pour Créer un Site et son Utilisateur

Créez un fichier `scripts/create-site-for-group.js` :

```javascript
import mongoose from 'mongoose';
import User from './models/User.js';
import Site from './models/Site.js';
import Group from './models/Group.js';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chefses';

async function createSiteForGroup() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // 1. Trouver le groupe par email de l'admin
    const groupAdmin = await User.findOne({ email: 'iris@gmail.com' });
    if (!groupAdmin || !groupAdmin.groupId) {
      throw new Error('Groupe non trouvé pour iris@gmail.com');
    }

    const group = await Group.findById(groupAdmin.groupId);
    if (!group) {
      throw new Error('Groupe non trouvé');
    }

    console.log(`✅ Groupe trouvé: ${group.name}`);

    // 2. Créer le site
    const siteData = {
      siteName: 'EHPAD Exemple',
      type: 'ehpad',
      email: 'exemple@group.com',
      password: 'Exemple2024!'
    };

    let site = await Site.findOne({ 
      siteName: siteData.siteName,
      groupId: group._id
    });

    if (!site) {
      site = await Site.create({
        groupId: group._id,
        siteName: siteData.siteName,
        type: siteData.type,
        address: {
          street: 'À définir',
          city: 'Bruxelles',
          country: 'Belgique'
        },
        contact: {
          email: siteData.email,
          phone: 'À définir'
        },
        isActive: true,
        settings: {
          timezone: 'Europe/Brussels'
        }
      });
      console.log(`✅ Site créé: ${site.siteName}`);
    } else {
      console.log(`ℹ️  Site existant: ${site.siteName}`);
    }

    // 3. Créer l'utilisateur
    let user = await User.findOne({ email: siteData.email });

    if (!user) {
      const hashedPassword = await bcrypt.hash(siteData.password, 10);
      user = await User.create({
        name: `Responsable ${siteData.siteName}`,
        email: siteData.email,
        password: hashedPassword,
        role: 'collectivite',
        groupId: group._id,
        siteId: site._id,
        roles: ['SITE_MANAGER', 'CHEF'],
        businessName: siteData.siteName,
        establishmentType: siteData.type
      });
      console.log(`✅ Utilisateur créé: ${user.email}`);
      console.log(`🔑 Mot de passe: ${siteData.password}`);
    } else {
      // Mettre à jour si nécessaire
      if (!user.siteId || user.siteId.toString() !== site._id.toString()) {
        user.siteId = site._id;
        await user.save();
        console.log(`✅ Utilisateur mis à jour avec siteId`);
      } else {
        console.log(`ℹ️  Utilisateur existant: ${user.email}`);
      }
    }

    // 4. Ajouter l'utilisateur aux managers du site
    if (!site.managers.includes(user._id)) {
      site.managers.push(user._id);
      await site.save();
      console.log(`✅ Utilisateur ajouté aux managers du site`);
    }

    console.log('\n✅ Configuration terminée !');
    console.log(`\n📋 Informations de connexion :`);
    console.log(`   URL: http://localhost:5000/index.html`);
    console.log(`   Email: ${siteData.email}`);
    console.log(`   Mot de passe: ${siteData.password}`);
    console.log(`\n📝 Note: Le site se connecte avec son EMAIL et MOT DE PASSE sur la page de connexion principale.`);
    console.log(`   Le système redirige automatiquement vers le dashboard du site.\n`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

createSiteForGroup();
```

**Exécution :**
```bash
node scripts/create-site-for-group.js
```

---

## 📞 Support

Si un site ne peut pas se connecter, vérifiez :

1. ✅ Le site existe et est actif (`isActive: true`)
2. ✅ L'utilisateur existe avec le bon email
3. ✅ L'utilisateur a `groupId` et `siteId` corrects
4. ✅ L'utilisateur est dans `site.managers`
5. ✅ Le mot de passe est correct
6. ✅ L'utilisateur a `role: 'collectivite'` et `roles: ['SITE_MANAGER']`

---

**Date de création** : 2025-01-27

