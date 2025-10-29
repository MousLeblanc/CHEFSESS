# Correction du businessName des Fournisseurs

## 🐛 Problème

Parfois, le nom d'un site s'affiche sur la page fournisseur au lieu du nom du fournisseur.

### Cause

Le champ `businessName` d'un utilisateur peut contenir :
- **Pour un utilisateur fournisseur** : Le nom de l'entreprise fournisseur
- **Pour un utilisateur de site** : Le nom du site (défini dans `siteController.createSiteUser`)

Le problème survient quand :
1. Un utilisateur avec `role='fournisseur'` a un `businessName` qui contient un nom de site au lieu du nom du fournisseur
2. Cela peut arriver lors de migrations de données ou d'erreurs de configuration

## ✅ Solution

### 1. Correction automatique lors de la connexion

Le contrôleur d'authentification a été modifié pour récupérer automatiquement le nom depuis la collection `Supplier` si l'utilisateur a un `supplierId`.

**Fichier modifié** : `controllers/authController.js`

**Fonctions concernées** :
- `login()` - Lors de la connexion
- `getMe()` - Récupération des infos utilisateur
- `refreshToken()` - Rafraîchissement du token

**Code ajouté** :
```javascript
// 🔧 Pour les fournisseurs, récupérer le nom depuis Supplier si disponible
let businessName = user.businessName;
if (user.role === 'fournisseur' && user.supplierId) {
  try {
    const Supplier = (await import('../models/Supplier.js')).default;
    const supplier = await Supplier.findById(user.supplierId).select('name');
    if (supplier) {
      businessName = supplier.name;
      console.log(`✅ Nom du fournisseur récupéré depuis Supplier: ${businessName}`);
    }
  } catch (error) {
    console.warn('⚠️ Erreur lors de la récupération du nom du fournisseur:', error.message);
  }
}
```

### 2. Script de correction manuelle

Un script a été créé pour corriger tous les utilisateurs fournisseurs qui ont un `businessName` incorrect dans la base de données.

**Fichier** : `scripts/fix-supplier-businessname.js`

**Utilisation** :
```bash
node scripts/fix-supplier-businessname.js
```

**Ce que fait le script** :
1. Récupère tous les utilisateurs avec `role='fournisseur'`
2. Pour chaque utilisateur :
   - Vérifie s'il a un `supplierId`
   - Récupère le nom depuis la collection `Supplier`
   - Compare avec le `businessName` actuel
   - Si différent, met à jour avec le bon nom
   - Détecte si le `businessName` actuel est un nom de site

**Exemple de sortie** :
```
🔧 fournisseur@gmail.com                  | "EHPAD Saint-Michel" → "Boulangerie Dupont" (était un nom de site)
✅ autrefournisseur@gmail.com             | Déjà correct: "Epicerie Bio"
⏭️  nouveaufournisseur@gmail.com          | Pas de supplierId - conservé: "Mon Entreprise"
```

## 🔍 Vérification

Pour vérifier qu'un fournisseur a le bon nom affiché :

1. **Côté base de données** :
```javascript
// Vérifier un utilisateur spécifique
const user = await User.findOne({ email: 'fournisseur@example.com' });
console.log('businessName:', user.businessName);

// Si l'utilisateur a un supplierId
if (user.supplierId) {
  const supplier = await Supplier.findById(user.supplierId);
  console.log('Nom du Supplier:', supplier.name);
  console.log('Match:', user.businessName === supplier.name ? '✅' : '❌');
}
```

2. **Côté frontend** :
- Se connecter en tant que fournisseur
- Vérifier que le nom affiché sur le dashboard est le nom du fournisseur et non un nom de site

## 📋 Bonnes Pratiques

### Pour éviter ce problème à l'avenir :

1. **Lors de la création d'un fournisseur** :
   - Toujours définir `businessName` avec le nom du fournisseur
   - Si un `supplierId` existe, utiliser `Supplier.name`

2. **Utilisateurs de site vs Fournisseurs** :
   - Un utilisateur de site devrait avoir `businessName = site.siteName`
   - Un utilisateur fournisseur devrait avoir `businessName = supplier.name`
   - Ces deux types d'utilisateurs sont distincts et ne devraient pas se mélanger

3. **Lors des migrations** :
   - Toujours vérifier que les `businessName` sont cohérents avec les rôles
   - Utiliser le script de correction après toute migration

## 🔧 Maintenance

Si le problème persiste :

1. Vérifier que l'utilisateur a bien un `supplierId` :
```javascript
const user = await User.findOne({ email: 'fournisseur@example.com' });
console.log('supplierId:', user.supplierId); // Doit être un ObjectId valide
```

2. Vérifier que le Supplier existe :
```javascript
const supplier = await Supplier.findById(user.supplierId);
console.log('Supplier trouvé:', supplier ? 'Oui' : 'Non');
```

3. Exécuter le script de correction :
```bash
node scripts/fix-supplier-businessname.js
```

4. Si le problème persiste, vérifier le localStorage côté client :
```javascript
// Console du navigateur
const user = JSON.parse(localStorage.getItem('user'));
console.log('businessName dans localStorage:', user.businessName);
```

Puis se déconnecter et se reconnecter pour rafraîchir les données.

