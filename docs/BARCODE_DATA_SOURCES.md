# Sources de données pour codes-barres

Ce document liste les différentes sources de données disponibles pour enrichir les informations de traçabilité via code-barres.

## Sources actuellement implémentées

### 1. Open Food Facts ✅ (Actif)
- **Type** : Gratuit, Open Source
- **URL** : https://world.openfoodfacts.org
- **Avantages** :
  - ✅ Gratuit et sans limite
  - ✅ Base de données collaborative très large
  - ✅ Informations nutritionnelles détaillées
  - ✅ Labels qualité détectés
  - ✅ Images des produits
- **Limitations** :
  - ❌ Pas de numéro de lot
  - ❌ Pas d'estampille sanitaire
  - ❌ Pas de numéro de traçabilité spécifique
  - ❌ Dates de production rarement disponibles
- **Données disponibles** :
  - Nom, marque, catégories
  - Pays d'origine, lieux de fabrication
  - Labels qualité (AB, Label Rouge, AOC)
  - Présentation commerciale
  - Informations nutritionnelles
  - Images

## Sources alternatives disponibles

### 2. GS1 CodeOnline Search
- **Type** : API officielle (payante)
- **URL** : https://developers.gs1.fr/api-codeonline-search
- **Avantages** :
  - ✅ Source officielle GS1 (standard international)
  - ✅ 450+ millions de produits
  - ✅ Données très fiables et à jour
  - ✅ Informations complètes (GTIN, marque, catégorie, contenu net)
- **Limitations** :
  - ❌ Nécessite un abonnement payant
  - ❌ Clé API requise
  - ❌ Peut avoir des limites de requêtes
- **Données disponibles** :
  - GTIN (code-barres)
  - Nom de la marque
  - Nom du produit
  - Image du produit
  - Catégorie du produit
  - Contenu net
- **Prix** : Contact GS1 France pour tarification

### 3. Labellink
- **Type** : API professionnelle (payante)
- **URL** : https://labellink.org/fr/
- **Avantages** :
  - ✅ API robuste et professionnelle
  - ✅ Connecté à GS1 GDSN (Global Data Synchronisation Network)
  - ✅ Données synchronisées en temps réel
  - ✅ Intégration avec la chaîne d'approvisionnement
- **Limitations** :
  - ❌ Service payant
  - ❌ Clé API requise
  - ❌ Principalement pour les professionnels
- **Données disponibles** :
  - Informations produits complètes
  - Données de traçabilité avancées
  - Synchronisation avec détaillants et partenaires

### 4. Barcodes Database
- **Type** : Base de données internationale (gratuite avec limitations)
- **URL** : https://barcodesdatabase.org
- **Avantages** :
  - ✅ Gratuit (avec limitations)
  - ✅ Base de données internationale
  - ✅ Informations sur fabricants
- **Limitations** :
  - ❌ Données parfois incomplètes
  - ❌ Pas de traçabilité spécifique
  - ❌ Limites de requêtes pour version gratuite
- **Données disponibles** :
  - Nom du fabricant
  - Nom du produit
  - Pays d'origine
  - Description
  - Image
  - Prix (parfois)

### 5. Yuka (Application mobile) - Score calculé
- **Type** : Application mobile (pas d'API publique) - **Score calculé depuis Open Food Facts**
- **URL** : https://yuka.io
- **Avantages** :
  - ✅ Base de données riche
  - ✅ Informations santé détaillées
  - ✅ Notes nutritionnelles (0-100)
  - ✅ Détection d'additifs problématiques
  - ✅ Classification NOVA (degré de transformation)
- **Limitations** :
  - ❌ Pas d'API publique disponible
  - ❌ Données propriétaires
  - ❌ Nécessiterait un scraping (non recommandé)
- **Solution implémentée** :
  - ✅ **Calcul automatique du score Yuka** basé sur les données d'Open Food Facts
  - ✅ Score 0-100 avec couleur et label (Excellent/Bon/Médiocre/Mauvais)
  - ✅ Détails par catégorie : Nutrition (60%), Additifs (30%), Transformation (10%)
  - ✅ Recommandations automatiques
  - ✅ Détection des additifs problématiques (E100-E955)

## Recommandations

### Pour la traçabilité AFSCA

**Option 1 : Multi-sources avec fallback (Recommandé)**
1. **Open Food Facts** (gratuit) - Source principale
2. **GS1 CodeOnline** (payant) - Source secondaire pour données officielles
3. **Base de données interne** - Stocker les données complétées par les fournisseurs

**Option 2 : Base de données interne enrichie**
- Les fournisseurs complètent les informations manquantes lors de l'enregistrement
- Les données sont stockées dans MongoDB
- Réutilisation pour les prochaines commandes

### Informations non disponibles via API

Les informations suivantes ne sont généralement **pas disponibles** via les APIs publiques et doivent être saisies manuellement :

- ✅ **Numéro de lot** (batch number) - Spécifique à chaque livraison
- ✅ **Estampille sanitaire** - Spécifique au producteur
- ✅ **Numéro de traçabilité** - Généré par le producteur
- ✅ **Date de production** - Spécifique à chaque lot
- ✅ **Date limite d'utilisation optimale (DDM)** - Calculée selon le produit

## Implémentation future

### Priorité 1 : Base de données interne
- Stocker les informations complétées par les fournisseurs
- Réutiliser pour les prochaines commandes du même produit
- Recherche par code-barres dans la base interne en premier

### Priorité 2 : Intégration GS1 (si budget disponible)
- API GS1 CodeOnline Search pour données officielles
- Fallback sur Open Food Facts si GS1 ne trouve pas

### Priorité 3 : Cache des résultats
- Mettre en cache les résultats d'Open Food Facts
- Réduire les appels API
- Améliorer les performances

