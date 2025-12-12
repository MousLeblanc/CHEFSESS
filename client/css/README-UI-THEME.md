# Guide d'utilisation de ui-theme.css

## Vue d'ensemble

Le fichier `ui-theme.css` contient tous les styles UI réutilisables extraits de `landing.html`. Il peut être appliqué progressivement aux autres pages HTML pour uniformiser le design.

## Comment l'utiliser

### 1. Ajouter le fichier CSS dans votre page HTML

Dans le `<head>` de votre page HTML, ajoutez :

```html
<link rel="stylesheet" href="css/ui-theme.css" />
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### 2. Utiliser les classes disponibles

#### Navigation
- `.navbar` - Barre de navigation fixe
- `.navbar-brand` - Logo/brand
- `.nav-link` - Liens de navigation
- `.nav-link-button` - Bouton dans la navigation

#### Boutons
- `.btn` - Bouton de base
- `.btn-primary` - Bouton principal (vert)
- `.btn-secondary` - Bouton secondaire
- `.btn-large` - Bouton large
- `.btn-outline` - Bouton avec bordure

#### Cards
- `.card` - Carte de base
- `.card-header` - En-tête de carte
- `.card-title` - Titre de carte
- `.card-subtitle` - Sous-titre de carte

#### Formulaires
- `.form-group` - Groupe de formulaire
- `.form-input` - Input de formulaire
- `.form-textarea` - Textarea
- `.form-select` - Select
- `.form-error` - Message d'erreur
- `.checkbox-group` - Groupe de checkbox

#### Typography
- `.section-title` - Titre de section
- `.section-subtitle` - Sous-titre de section
- `.page-title` - Titre de page
- `.page-subtitle` - Sous-titre de page

#### Grid Layouts
- `.grid` - Grille de base
- `.grid-2` - Grille 2 colonnes
- `.grid-3` - Grille 3 colonnes
- `.grid-4` - Grille 4 colonnes
- `.grid-auto` - Grille automatique

#### Stats Cards
- `.stats-grid` - Grille de statistiques
- `.stat-card` - Carte de statistique
- `.stat-icon` - Icône de statistique
- `.stat-number` - Nombre de statistique
- `.stat-label` - Label de statistique

#### Chips / Badges
- `.chip` - Chip (badge arrondi)
- `.badge` - Badge
- `.badge-primary` - Badge principal
- `.badge-secondary` - Badge secondaire

#### Animations
- `.fade-in-up` - Animation fade in up
- `.delay-1` - Délai 0.2s
- `.delay-2` - Délai 0.4s
- `.delay-3` - Délai 0.6s
- `.delay-4` - Délai 0.8s

#### Utilities
- `.text-center`, `.text-left`, `.text-right` - Alignement texte
- `.mt-1` à `.mt-4` - Marges top
- `.mb-1` à `.mb-4` - Marges bottom
- `.p-1` à `.p-4` - Padding

### 3. Variables CSS disponibles

Toutes les variables CSS sont définies dans `:root` :

```css
--color-primary: #67C587;
--color-primary-dark: #52a871;
--color-primary-light: #85d5a5;
--color-white: #ffffff;
--color-gray-50 à --color-gray-900: Nuances de gris
--font-poppins: Police Poppins
--transition-fast, --transition-normal, --transition-slow: Transitions
--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl: Ombres
--radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-full: Rayons
```

### 4. Exemple d'utilisation

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ma Page</title>
  <link rel="stylesheet" href="css/ui-theme.css" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
  <nav class="navbar">
    <div class="navbar-container">
      <a href="/" class="navbar-brand">
        <span class="brand-icon">🍽️</span>
        <span class="brand-name">Chef SES</span>
      </a>
      <div class="navbar-links">
        <a href="#" class="nav-link">Accueil</a>
        <a href="#" class="nav-link">Fonctionnalités</a>
        <a href="#" class="nav-link-button">Connexion</a>
      </div>
    </div>
  </nav>

  <div class="container" style="margin-top: 80px;">
    <h1 class="section-title">Titre de section</h1>
    <p class="section-subtitle">Sous-titre de section</p>

    <div class="grid grid-3">
      <div class="card">
        <h3 class="card-title">Carte 1</h3>
        <p>Contenu de la carte</p>
        <button class="btn btn-primary">Action</button>
      </div>
      <div class="card">
        <h3 class="card-title">Carte 2</h3>
        <p>Contenu de la carte</p>
        <button class="btn btn-secondary">Action</button>
      </div>
      <div class="card">
        <h3 class="card-title">Carte 3</h3>
        <p>Contenu de la carte</p>
        <button class="btn btn-outline">Action</button>
      </div>
    </div>
  </div>
</body>
</html>
```

## Migration progressive

Pour migrer une page existante :

1. Ajoutez `ui-theme.css` dans le `<head>`
2. Remplacez progressivement les styles inline par les classes du thème
3. Utilisez les variables CSS pour les couleurs et espacements
4. Testez sur différentes tailles d'écran (responsive inclus)

## Notes

- Le fichier est responsive par défaut
- Toutes les animations sont incluses
- Les styles sont compatibles avec les navigateurs modernes
- Le thème utilise la police Poppins (à charger séparément)

