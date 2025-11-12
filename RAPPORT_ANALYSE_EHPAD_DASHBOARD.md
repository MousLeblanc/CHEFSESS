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

### 3. **Exposition de siteId dans les logs console**
**Lignes multiples:**
```javascript
console.log('🔍 SiteId du token/cookie:', currentUser.siteId);
console.log(`📊 Modal - Résidents chargés pour site ${siteIdStr}...`);
```
- **Risque**: Informations sensibles visibles dans la console du navigateur
- **Impact**: Fuite d'informations, aide au profiling d'attaque
- **Recommandation**: Désactiver les logs en production ou utiliser un système de logging conditionnel

### 4. **Requêtes API sans validation de réponse**
**Lignes 969-974, 1067-1073:**
```javascript
const resp = await fetch(`/api/residents/site/${siteId}`, {...});
if (!resp.ok) return;
const data = await resp.json();
```
- **Risque**: Pas de vérification du format de réponse, pas de gestion d'erreur détaillée
- **Impact**: Erreurs silencieuses, comportement imprévisible
- **Recommandation**: Valider la structure de réponse, logger les erreurs

### 5. **Filtrage côté client uniquement pour la sécurité**
**Lignes 1074-1090:**
```javascript
const activeResidents = allResidents.filter(r => {
  const status = r.status ? String(r.status).toLowerCase().trim() : '';
  if (status !== 'actif') return false;
  // Vérifier que le résident appartient bien à ce site
  const residentSiteId = r.siteId ? (r.siteId._id ? String(r.siteId._id) : String(r.siteId)) : null;
  if (!residentSiteId || residentSiteId !== siteIdStr) return false;
  return true;
});
```
- **Risque**: Le filtrage de sécurité est fait côté client, le backend renvoie tous les résidents
- **Impact**: Fuite de données si le backend ne filtre pas correctement
- **Recommandation**: Le backend DOIT filtrer par siteId et statut, le filtrage client est seulement pour l'UI

### 6. **Manipulation d'innerHTML sans sanitization**
**Lignes 1195-1207:**
```javascript
html += `<div style="background: rgba(255,255,255,0.15); padding: 0.75rem 1rem; border-radius: 8px;...">`;
container.innerHTML = html;
```
- **Risque**: Injection XSS si les données (allergen, restriction) contiennent du HTML malveillant
- **Impact**: Exécution de code JavaScript arbitraire
- **Recommandation**: Utiliser `textContent` ou une bibliothèque de sanitization (DOMPurify)

### 7. **Absence de protection CSRF**
- **Risque**: Aucun token CSRF visible dans les requêtes
- **Impact**: Vulnérable aux attaques CSRF
- **Recommandation**: Implémenter des tokens CSRF pour les requêtes POST/PUT/DELETE

---

## 🟡 INCOHÉRENCES

### 1. **Incohérence dans le calcul des portions**
**Lignes 1128-1134 vs 1262-1267:**
- Deux méthodes différentes pour calculer les portions:
  - Modal: `if (ps === 0.5) totalPortions += 0.5; else if (ps === 2) totalPortions += 1.5;`
  - Génération: Même logique mais code dupliqué
- **Problème**: Logique dupliquée, risque d'incohérence si une seule est modifiée
- **Recommandation**: Extraire dans une fonction réutilisable

### 2. **Incohérence dans la gestion des siteId**
**Lignes 1083-1087:**
```javascript
const residentSiteId = r.siteId ? (r.siteId._id ? String(r.siteId._id) : String(r.siteId)) : null;
```
- **Problème**: Gestion complexe et répétée de siteId (peut être objet ou string)
- **Recommandation**: Normaliser côté backend ou créer une fonction helper

### 3. **Incohérence dans les chemins de scripts**
**Lignes 883-890:**
```javascript
<script type="module" src="JS/supplier-common.js"></script>  // JS en majuscules
<script src="js/recipe-generator.js"></script>  // js en minuscules
```
- **Problème**: Mélange de casse dans les chemins (JS vs js)
- **Impact**: Problèmes potentiels sur systèmes case-sensitive (Linux)
- **Recommandation**: Standardiser sur une seule casse (préférer minuscules)

### 4. **Incohérence dans la gestion des erreurs**
- Certaines fonctions retournent silencieusement (`if (!resp.ok) return;`)
- D'autres lancent des erreurs (`throw new Error(...)`)
- **Recommandation**: Standardiser la gestion d'erreur (toujours logger, toujours informer l'utilisateur)

### 5. **Incohérence dans les formats de données**
**Lignes 979-984:**
```javascript
const portionRaw = r?.nutritionalProfile?.portionSize ?? r?.portion ?? r?.portionSize;
```
- **Problème**: Trois chemins différents pour la même donnée
- **Recommandation**: Normaliser le modèle de données côté backend

---

## 🟠 REDONDANCES

### 1. **Code dupliqué pour le chargement des résidents**
**Lignes 961-998, 1049-1099, 1239-1260:**
- La logique de chargement et filtrage des résidents est répétée 3 fois
- **Recommandation**: Extraire dans une fonction `loadActiveResidents(siteId)`

### 2. **Code dupliqué pour le calcul des portions**
**Lignes 1128-1134, 1262-1267:**
- Même logique de calcul répétée
- **Recommandation**: Fonction `calculateTotalPortions(residents)`

### 3. **Code dupliqué pour la normalisation des allergènes**
**Lignes 1138-1157:**
- Fonction `normalizeAllergen` définie dans le scope global mais pourrait être réutilisée ailleurs
- **Recommandation**: Déplacer dans un module utilitaire

### 4. **Styles inline répétés**
- Beaucoup de styles inline répétés (ex: `background: rgba(255,255,255,0.15); padding: 0.75rem 1rem; border-radius: 8px;`)
- **Recommandation**: Extraire dans des classes CSS réutilisables

### 5. **Logique de vérification d'authentification dupliquée**
- Vérification de `storedUser` répétée à plusieurs endroits
- **Recommandation**: Fonction helper `getStoredUser()` avec validation

### 6. **Gestion des modales dupliquée**
- Logique d'ouverture/fermeture de modale répétée
- **Recommandation**: Créer une classe `Modal` réutilisable

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

#### c. **Navigation au clavier**
- Les modales et certains éléments peuvent ne pas être accessibles au clavier
- **Recommandation**: Gérer `tabindex` et les événements clavier (Escape pour fermer)

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
- Tous les textes sont en français
- **Recommandation**: Système d'i18n pour support multilingue

---

## 📊 RÉSUMÉ PAR PRIORITÉ

### 🔴 **CRITIQUE (À corriger immédiatement)**
1. Sanitization des données avant innerHTML (XSS)
2. Filtrage de sécurité côté backend (pas seulement client)
3. Protection CSRF
4. Validation stricte des données utilisateur

### 🟡 **IMPORTANT (À corriger rapidement)**
1. Extraction du code JavaScript inline
2. Standardisation des chemins de scripts (JS vs js)
3. Gestion d'erreur cohérente
4. Normalisation du modèle de données (portionSize)

### 🟢 **AMÉLIORATION (À planifier)**
1. Refactoring pour éliminer les duplications
2. Amélioration de l'accessibilité
3. Performance (lazy loading, caching)
4. Documentation du code

---

## 📝 NOTES ADDITIONNELLES

- Le code utilise des cookies HttpOnly pour l'authentification (bonne pratique)
- La vérification d'authentification avec le serveur est présente (ligne 89-102 dans ehpad-dashboard.js)
- Le système de notifications WebSocket est bien implémenté
- La gestion des onglets est fonctionnelle mais pourrait être améliorée

---

**Fin du rapport**

