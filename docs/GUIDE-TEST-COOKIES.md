# 🧪 Guide de test - Cookies HTTP-Only

## 📋 Objectif

Vérifier que la migration vers cookies HTTP-Only fonctionne correctement et que **les conflits de tokens sont résolus**.

---

## 🚀 Déploiement

### **Statut actuel**
- ✅ Code pushé vers GitHub (commit `11ad868`)
- ⏳ Déploiement automatique sur Render en cours...

### **Vérifier le déploiement**
1. Aller sur [Render Dashboard](https://dashboard.render.com/)
2. Vérifier que le déploiement est **"Live"** (vert)
3. Attendre ~2-5 minutes si le déploiement est en cours

---

## 🧪 Tests à effectuer

### **Test 1 : Connexion simple**

#### **Étapes**
1. Ouvrir la page de login : `https://votre-app.onrender.com`
2. Se connecter avec un utilisateur **fournisseur**
3. Vérifier que vous êtes redirigé vers le dashboard fournisseur
4. **Vérifier dans les DevTools** (F12) :
   - Onglet **Application** → **Cookies**
   - Vérifier qu'un cookie `token` existe
   - Vérifier que `HttpOnly` = ✅ (coché)
   - Vérifier que `Secure` = ✅ (coché en production)
   - Vérifier que `SameSite` = `Lax`

#### **✅ Résultat attendu**
- Connexion réussie
- Cookie `token` présent avec `HttpOnly: true`
- Dashboard fournisseur affiché correctement

---

### **Test 2 : Isolation des tokens (TEST CRITIQUE)**

#### **Contexte**
**Avant la migration**, si vous ouvriez deux onglets avec deux utilisateurs différents (fournisseur + site), le token était **partagé** et causait des erreurs "Accès refusé".

#### **Étapes**
1. **Onglet 1**: Se connecter avec un utilisateur **fournisseur**
   - Aller sur `https://votre-app.onrender.com`
   - Login → Dashboard fournisseur

2. **Onglet 2** (NOUVEAU, dans la même fenêtre):
   - Aller sur `https://votre-app.onrender.com`
   - Login → Se connecter avec un utilisateur **site** (EHPAD)

3. **Dans l'onglet 2** (site):
   - Aller dans **"Mes Commandes"**
   - Trouver une commande en statut **"En attente de confirmation"**
   - Cliquer sur **"Confirmer la réception"**

#### **✅ Résultat attendu**
- ✅ **Plus d'erreur "Accès refusé"**
- ✅ La commande est confirmée avec succès
- ✅ Le toast affiche "Commande confirmée"

#### **❌ Résultat avant la migration**
- ❌ Erreur "Accès refusé"
- ❌ Logs montrant que le token du fournisseur était utilisé

---

### **Test 3 : Commandes fournisseur**

#### **Étapes**
1. Se connecter avec un utilisateur **fournisseur**
2. Aller dans l'onglet **"Commandes"**
3. Changer le statut d'une commande :
   - **"En attente"** → **"Acceptée"**
   - **"Acceptée"** → **"En préparation"**
   - **"En préparation"** → **"Prête"**
   - **"Prête"** → **"Envoyée"**

#### **✅ Résultat attendu**
- ✅ Statut mis à jour avec succès
- ✅ Page reste sur l'onglet **"Commandes"** (pas de saut vers "Produits & Stock")
- ✅ Toast de confirmation affiché

---

### **Test 4 : Food Cost (Site)**

#### **Étapes**
1. Se connecter avec un utilisateur **site** (EHPAD)
2. Aller dans l'onglet **"Food Cost"**
3. Cliquer sur une période existante
4. Cliquer sur **"Recalculer les commandes"**

#### **✅ Résultat attendu**
- ✅ Calcul réussi
- ✅ Total des commandes affiché correctement
- ✅ Pas d'erreur 403 ou "Accès refusé"

---

### **Test 5 : Admin Reports**

#### **Étapes**
1. Se connecter avec un utilisateur **GROUP_ADMIN**
2. Aller dans l'onglet **"Rapports"**
3. Vérifier que tous les sites sont affichés

#### **✅ Résultat attendu**
- ✅ Liste de tous les sites du groupe
- ✅ Sites sans Food Cost affichés avec "⚠️ Pas de période Food Cost"
- ✅ Statistiques globales correctes

---

### **Test 6 : Déconnexion**

#### **Étapes**
1. Se connecter avec n'importe quel utilisateur
2. Cliquer sur **"Déconnexion"**
3. **Vérifier dans les DevTools** (F12) :
   - Onglet **Application** → **Cookies**
   - Vérifier que le cookie `token` a **disparu**

#### **✅ Résultat attendu**
- ✅ Redirection vers la page de login
- ✅ Cookie `token` supprimé
- ✅ Impossible d'accéder aux dashboards sans se reconnecter

---

## 🔍 Inspection des cookies (DevTools)

### **Comment vérifier**
1. **Ouvrir DevTools**: Appuyez sur `F12` ou `Ctrl+Shift+I`
2. **Onglet "Application"** (Chrome/Edge) ou **"Stockage"** (Firefox)
3. **Cookies** → Sélectionnez votre domaine
4. **Vérifier le cookie `token`**:
   - `HttpOnly`: ✅ (coché) → JavaScript ne peut pas le lire
   - `Secure`: ✅ (coché en production) → HTTPS uniquement
   - `SameSite`: `Lax` → Protection CSRF
   - `Expires`: Date dans 7 jours

### **Comparaison avant/après**

#### **Avant (localStorage)**
- **Application** → **Local Storage** → `token` (visible en clair)
- ❌ Lisible par JavaScript
- ❌ Partagé entre onglets

#### **Après (Cookies HTTP-Only)**
- **Application** → **Cookies** → `token`
- ✅ `HttpOnly: true` → Illisible par JavaScript
- ✅ Géré automatiquement par le navigateur

---

## 🐛 En cas de problème

### **Problème 1 : Erreur "Token non fourni"**

#### **Cause possible**
- Les cookies ne sont pas envoyés automatiquement.

#### **Solution**
1. Vérifier que tous les `fetch()` ont `credentials: 'include'`
2. Vérifier dans les logs Render :
   ```
   🍪 Cookie reçu: token=eyJhbGc...
   ```

---

### **Problème 2 : "Accès refusé" persiste**

#### **Cause possible**
- L'ancien token `localStorage` est toujours présent.

#### **Solution**
1. **Vider le localStorage** :
   - DevTools → **Application** → **Local Storage**
   - Clic droit → **"Clear"**
2. **Supprimer tous les cookies** :
   - DevTools → **Application** → **Cookies**
   - Clic droit → **"Clear"**
3. **Recharger la page** (`Ctrl+Shift+R` pour un hard refresh)
4. **Se reconnecter**

---

### **Problème 3 : Cookie pas créé**

#### **Cause possible**
- Le backend n'est pas déployé correctement.

#### **Solution**
1. Vérifier les logs Render :
   ```
   ✅ Connecté à MongoDB
   ✅ Serveur démarré sur le port 10000
   ```
2. Redéployer manuellement depuis Render si nécessaire

---

## 📊 Checklist finale

- [ ] **Connexion fournisseur** : Cookie `token` créé avec `HttpOnly: true`
- [ ] **Connexion site** : Cookie `token` créé avec `HttpOnly: true`
- [ ] **Isolation des tokens** : Pas de conflit entre onglets fournisseur/site
- [ ] **Confirmation de commande** : Pas d'erreur "Accès refusé"
- [ ] **Food Cost** : Recalcul fonctionne sans erreur 403
- [ ] **Admin Reports** : Tous les sites affichés
- [ ] **Déconnexion** : Cookie `token` supprimé

---

## ✅ Résultat final attendu

**Plus de conflits de tokens ! Plus de problèmes d'isolation ! Architecture sécurisée et professionnelle ! 🎉**

---

## 📞 Support

Si vous rencontrez un problème non documenté ici, envoyez :
1. **Capture d'écran** de l'erreur
2. **Logs Render** (si possible)
3. **Steps to reproduce** (étapes pour reproduire le bug)

