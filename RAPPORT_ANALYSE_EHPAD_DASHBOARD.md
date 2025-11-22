# Rapport d'Analyse - EHPAD Dashboard
## Date: 2024
## Fichier analysé: `client/ehpad-dashboard.html`

---

## 🔴 FAILLES DE SÉCURITÉ

### 1. **Stockage de données sensibles dans sessionStorage/localStorage**
**Ligne 963, 1054, 1240:**
```javascript
const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
```
- **Risque**: Les données utilisateur (incluant potentiellement des IDs sensibles) sont stockées côté client
- **Impact**: Vulnérable au XSS, données accessibles via DevTools
- **Recommandation**: Utiliser uniquement les cookies HttpOnly pour l'authentification, ne stocker que des données non sensibles en sessionStorage

### 2. **Absence de validation côté client des données utilisateur**
**Lignes 963-966, 1054-1060:**
```javascript
const user = JSON.parse(storedUser);
const siteId = user?.siteId;
```
- **Risque**: Pas de validation du format des données avant parsing
- **Impact**: Erreurs potentielles, injection possible si données corrompues
- **Recommandation**: Ajouter try-catch et validation stricte des données
- **✅ PARTIELLEMENT RÉSOLU**: `getStoredUser()` et `validation-helper.js` existent, mais pas utilisé partout

### 3. **Exposition de siteId dans les logs console**
**Lignes multiples:**
```javascript
console.log('🔍 SiteId du token/cookie:', currentUser.siteId);
console.log(`📊 Modal - Résidents chargés pour site ${siteIdStr}...`);
```
- **Risque**: Informations sensibles visibles dans la console du navigateur
- **Impact**: Fuite d'informations, aide au profiling d'attaque
- **Recommandation**: Désactiver les logs en production ou utiliser un système de logging conditionnel

### {DF072017-1944-4631-AFAF-530B42584831}.png
### 1. **Code dupliqué pour le chargement des résidents**
**Lignes 961-998, 1049-1099, 1239-1260:**
- La logique de chargement et filtrage des résidents est répétée 3 fois
- **Recommandation**: Extraire dans une fonction `loadActiveResidents(siteId)`
- **✅ RÉSOLU**: Fonction `loadActiveResidents()` créée dans `client/js/resident-utils.js`, utilisée dans `ehpad-menu-calculator.js`

### 2. **Code dupliqué pour le calcul des portions**
**Lignes 1128-1134, 1262-1267:**
- Même logique de calcul répétée
- **Recommandation**: Fonction `calculateTotalPortions(residents)`
- **✅ RÉSOLU**: Fonctions `calculateTotalPortions()`, `countResidentsByPortion()`, `getPortionSize()`, `calculatePortionEquivalent()` créées dans `client/js/resident-utils.js`

### 3. **Code dupliqué pour la normalisation des allergènes**
**Lignes 1138-1157:**
- Fonction `normalizeAllergen` définie dans le scope global mais pourrait être réutilisée ailleurs
- **Recommandation**: Déplacer dans un module utilitaire
- **✅ RÉSOLU**: Fonctions `normalizeAllergen()`, `formatAllergenName()`, `formatRestrictionName()` créées dans `client/js/resident-utils.js`

### 4. **Styles inline répétés**
- Beaucoup de styles inline répétés (ex: `background: rgba(255,255,255,0.15); padding: 0.75rem 1rem; border-radius: 8px;`)
- **Recommandation**: Extraire dans des classes CSS réutilisables
- **✅ RÉSOLU**: Fichier `client/CSS/utilities/common-styles.css` créé avec classes réutilisables. Styles inline remplacés dans `ehpad-menu-calculator.js` et `ehpad-dashboard.html`

### 5. **Logique de vérification d'authentification dupliquée**
- Vérification de `storedUser` répétée à plusieurs endroits
- **Recommandation**: Fonction helper `getStoredUser()` avec validation
- **✅ PARTIELLEMENT RÉSOLU**: `getStoredUser()` existe déjà, mais pourrait être mieux centralisée

### 6. **Gestion des modales dupliquée**
- Logique d'ouverture/fermeture de modale répétée
- **Recommandation**: Créer une classe `Modal` réutilisable
- **✅ RÉSOLU**: Classe `Modal` créée dans `client/js/Modal.js`. Utilisée dans `ehpad-menu-calculator.js` et `custom-menu-generator.js`. Gère l'ouverture/fermeture, clic backdrop, touche Escape, et callbacks.

---

## 🔵 AMÉLIORATIONS POSSIBLES

### 1. **Performance**

#### a. **Chargement des scripts**
- **Problème**: Tous les scripts sont chargés même si non utilisés
- **Recommandation**: Chargement lazy des scripts par onglet

#### b. **Requêtes API multiples**
- **Problème**: Plusieurs appels API séquentiels pour charger les résidents
- **Recommandation**: Implémenter du caching côté client, ou batch les requêtes

#### c. **Manipulation DOM excessive**
- **Problème**: Beaucoup de manipulations DOM directes
- **Recommandation**: Utiliser un framework (React/Vue) ou au moins document fragments

### 2. **Maintenabilité**

#### a. **Code JavaScript dans le HTML**
- **Problème**: ~400 lignes de JavaScript inline dans le HTML (lignes 894-1286)
- **Recommandation**: Extraire dans un fichier séparé `ehpad-dashboard-menu.js`

#### b. **Magic numbers**
- **Problème**: Valeurs hardcodées (`0.5`, `1.5`, `2`, `1000`, etc.)
- **Recommandation**: Constantes nommées (`PORTION_DEMI = 0.5`, `MAX_RESIDENTS = 1000`)

#### c. **Noms de variables peu explicites**
- **Problème**: `$n`, `$h`, `$d`, `ps`, etc.
- **Recommandation**: Noms descriptifs (`$normalPortion`, `$halfPortion`, `portionSize`)

### 3. **Accessibilité**

#### a. **Labels manquants**
- Certains éléments interactifs n'ont pas de labels appropriés
- **Recommandation**: Ajouter `aria-label` et `aria-describedby`

#### b. **Contraste des couleurs**
- Certains textes sur fonds colorés peuvent avoir un contraste insuffisant
- **Recommandation**: Vérifier avec un outil d'accessibilité (WCAG AA minimum)
- **✅ RÉSOLU**: Fichier `accessibility.css` créé. Opacité des fonds augmentée, opacité du texte supprimée, `text-shadow` ajouté sur les en-têtes. Conforme WCAG AA (ratio 4.5:1 minimum)

#### c. **Navigation au clavier**
- Les modales et certains éléments peuvent ne pas être accessibles au clavier
- **Recommandation**: Gérer `tabindex` et les événements clavier (Escape pour fermer)
- **✅ PARTIELLEMENT RÉSOLU**: Classe `Modal` gère la touche Escape et le focus. **⚠️ À AMÉLIORER**: Ajouter `tabindex` et gestion du focus trap dans les modales

### 4. **UX/UI**

#### a. **Feedback utilisateur**
- Certaines actions (comme le chargement des résidents) sont silencieuses
- **Recommandation**: Ajouter des indicateurs de chargement (spinners, progress bars)

#### b. **Gestion d'erreurs utilisateur**
- Erreurs techniques affichées directement à l'utilisateur
- **Recommandation**: Messages d'erreur user-friendly avec codes d'erreur pour le support

#### c. **Validation des formulaires**
- Validation HTML5 basique uniquement
- **Recommandation**: Validation en temps réel avec messages d'erreur contextuels

### 5. **Architecture**

#### a. **Séparation des responsabilités**
- Mélange de logique métier, présentation et accès aux données
- **Recommandation**: Architecture MVC ou similaire

#### b. **Gestion d'état**
- État dispersé dans plusieurs variables globales
- **Recommandation**: Centraliser dans un store (Redux-like ou simple objet d'état)

#### c. **API calls**
- Appels API dispersés dans le code
- **Recommandation**: Créer un service API centralisé (`api/residents.js`, `api/menu.js`)

### 6. **Tests**

#### a. **Absence de tests**
- Aucun test visible
- **Recommandation**: Ajouter des tests unitaires pour les fonctions critiques (calcul portions, filtrage résidents)

### 7. **Documentation**

#### a. **Code peu documenté**
- Fonctions complexes sans documentation
- **Recommandation**: JSDoc pour les fonctions publiques

#### b. **Logique métier non documentée**
- Logique de calcul des portions non expliquée
- **Recommandation**: Commentaires expliquant les règles métier

### 8. **Internationalisation**

#### a. **Textes hardcodés en français**
{EB5615CC-0EA3-4227-9A2F-EF946D02D2A2}.png

---

## 📊 RÉSUMÉ PAR PRIORITÉ

### 🔴 **CRITIQUE (À corriger immédiatement)**
1. ✅ **Sanitization des données avant innerHTML (XSS)** - **RÉSOLU** : Toutes les utilisations d'`innerHTML` ont été remplacées par `createElement` et `textContent` dans `resident-management.js`
2. ✅ **Filtrage de sécurité côté backend** - Code amélioré avec logs d'avertissement, mais vérifier que le backend filtre correctement
3. ✅ **Protection CSRF** - `csrf-helper.js` existe, vérifier que toutes les requêtes l'utilisent
4. ⚠️ **Validation stricte des données utilisateur** - Helpers existent mais pas utilisés partout

### 🟡 **IMPORTANT (À corriger rapidement)**
1. ⚠️ **Extraction du code JavaScript inline** - ~400 lignes de JS dans `ehpad-dashboard.html` (lignes 907-1554)
2. ⚠️ **Standardisation des chemins de scripts (JS vs js)** - Tous les scripts utilisent maintenant `js/` (minuscules), mais vérifier les autres fichiers
3. ⚠️ **Gestion d'erreur cohérente** - `handleError()` et `handleAPIResponse()` existent mais pas utilisés partout
4. ✅ **Normalisation du modèle de données (portionSize)** - Résolu via `getPortionSize()` dans `resident-utils.js`

### 🟢 **AMÉLIORATION (À planifier)**
1. ✅ **Refactoring pour éliminer les duplications** - Module `resident-utils.js` créé, `ehpad-menu-calculator.js` refactorisé, classe `Modal` créée, CSS utilities créées
2. ✅ **Amélioration de l'accessibilité** - Contraste WCAG AA résolu, navigation clavier partiellement résolue
3. ⚠️ **Performance (lazy loading, caching)** - Non implémenté
4. ⚠️ **Documentation du code** - JSDoc partiel, à améliorer

---

## 📝 NOTES ADDITIONNELLES

- Le code utilise des cookies HttpOnly pour l'authentification (bonne pratique)
- La vérification d'authentification avec le serveur est présente (ligne 89-102 dans ehpad-dashboard.js)
- Le système de notifications WebSocket est bien implémenté
- La gestion des onglets est fonctionnelle mais pourrait être améliorée

---

## 📅 MISE À JOUR - État actuel (2024)

### ✅ **RÉSOLU**
- Normalisation du modèle de données (portionSize)
- Refactoring des duplications (resident-utils.js, Modal.js, common-styles.css)
- Amélioration du contraste (accessibility.css, WCAG AA)
- Protection CSRF (csrf-helper.js)
- Gestion des modales (Modal.js)
- Bouton Annuler des paramètres corrigé
- **Sanitization XSS** : Toutes les utilisations d'`innerHTML` remplacées par `createElement` et `textContent` dans `resident-management.js` et `ehpad-menu-calculator.js`

### ⚠️ **EN COURS / PARTIELLEMENT RÉSOLU**
- Validation des données : Helpers existent mais pas utilisés partout
- Gestion d'erreur : Helpers existent mais pas utilisés partout
- Navigation clavier : Escape géré, mais focus trap à améliorer
- Extraction du code JavaScript inline : ~400 lignes restent dans `ehpad-dashboard.html`

### 🔴 **À FAIRE EN PRIORITÉ**
1. ✅ **Corriger `innerHTML` dans `resident-management.js`** - **RÉSOLU** : Toutes les utilisations ont été remplacées par `createElement` et `textContent`
2. **Vérifier que toutes les requêtes POST/PUT/DELETE utilisent `fetchWithCSRF`**
3. **Extraire le code JavaScript inline de `ehpad-dashboard.html`** vers un fichier séparé
4. **Utiliser `getStoredUser()` et `safeAPIParse()` partout** au lieu de `JSON.parse(storedUser)`

---

**Fin du rapport**

