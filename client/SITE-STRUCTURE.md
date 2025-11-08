# Structure du Site Chef SES

## 📁 Architecture des Fichiers

```
client/
├── landing.html          # Page d'accueil avec vidéo hero
├── features.html         # Fonctionnalités détaillées
├── about.html            # À propos / Mission / Valeurs / Timeline
├── collectivites.html    # Solutions pour écoles/hôpitaux/EHPAD (onglets)
├── suppliers.html        # Espace fournisseurs
├── contact.html          # Formulaire de contact
├── demo.html             # Accès à la démo
├── legal.html            # Mentions légales
├── privacy.html          # Politique de confidentialité
├── 404.html              # Page d'erreur 404
│
├── includes/
│   ├── navbar.html       # Navigation commune (chargée dynamiquement)
│   └── footer.html       # Footer commun (chargé dynamiquement)
│
├── css/
│   ├── landing.css       # Styles de base (variables, navbar, footer)
│   ├── features.css      # Styles page fonctionnalités
│   ├── about.css         # Styles page à propos
│   ├── collectivites.css # Styles page collectivités
│   ├── suppliers.css     # Styles page fournisseurs
│   ├── contact.css       # Styles page contact
│   ├── demo.css          # Styles page démo
│   ├── legal.css         # Styles pages légales
│   └── 404.css           # Styles page 404
│
├── js/
│   ├── i18n.js           # Système de traduction (FR/EN/NL)
│   ├── common.js         # Scripts communs (navbar, footer, animations)
│   ├── landing.js        # Scripts spécifiques landing
│   ├── collectivites.js  # Gestion des onglets collectivités
│   ├── contact.js        # Gestion formulaire contact
│   └── demo.js           # Gestion modal vidéo démo
│
└── video/
    └── collective-catering.mp4  # Vidéo hero (à ajouter)
```

## 🌍 Système de Traduction

Le site supporte 3 langues : **Français (FR)**, **English (EN)**, **Nederlands (NL)**

### Utilisation

1. **Changer de langue** : Utiliser le sélecteur dans la navbar
2. **Traduire un élément** : Ajouter l'attribut `data-i18n="clé.traduction"`
3. **Ajouter une traduction** : Modifier `client/js/i18n.js`

### Exemple

```html
<h1 data-i18n="nav.features">Fonctionnalités</h1>
```

## 🎨 Design System

### Couleurs
- **Primary** : `#67C587` (vert Chef SES)
- **Primary Dark** : `#52a871`
- **Primary Light** : `#85d5a5`
- **White** : `#ffffff`
- **Gray Scale** : Du `#f9fafb` au `#111827`

### Typographie
- **Police** : Poppins (Google Fonts)
- **Tailles** : Variables CSS dans `landing.css`

### Composants
- **Buttons** : `.btn`, `.btn-primary`, `.btn-secondary`
- **Cards** : `.feature-card`, `.value-card`
- **Sections** : `.section-title`, `.section-subtitle`

## 📄 Pages du Site

### 1. Landing (`landing.html`)
- Hero avec vidéo de fond
- Section Features (aperçu)
- Section About (aperçu)
- Section Contact (aperçu)
- Footer

### 2. Features (`features.html`)
- Détails de chaque fonctionnalité
- Cartes avec descriptions et listes
- CTA "Demander une démo"

### 3. About (`about.html`)
- Mission
- Valeurs (Innovation, Durabilité, Santé)
- Timeline (2024-2026)
- Statistiques
- Équipe (placeholder)

### 4. Collectivités (`collectivites.html`)
- 3 onglets interactifs :
  - 🏫 Écoles
  - 🏥 Hôpitaux
  - 🏡 EHPAD
- Section "Avantages"

### 5. Suppliers (`suppliers.html`)
- Présentation espace fournisseurs
- 6 fonctionnalités principales
- Section "Comment ça marche" (4 étapes)
- CTA "Devenir partenaire"

### 6. Contact (`contact.html`)
- Formulaire de contact (mailto)
- Informations de contact
- Horaires

### 7. Demo (`demo.html`)
- 3 options d'accès :
  - Accès direct à l'application
  - Vidéo de démonstration (modal)
  - Demande de démo personnalisée

### 8. Legal (`legal.html`)
- Mentions légales complètes
- RGPD
- Propriété intellectuelle

### 9. Privacy (`privacy.html`)
- Politique de confidentialité
- Gestion des données personnelles
- Droits utilisateurs

### 10. 404 (`404.html`)
- Page d'erreur stylée
- Liens de navigation
- Retour à l'accueil

## 🚀 Démarrage

1. **Ajouter la vidéo** :
   - Télécharger une vidéo libre de droits (Pexels, Pixabay)
   - La renommer `collective-catering.mp4`
   - La placer dans `client/video/`

2. **Tester le site** :
   - Ouvrir `client/landing.html` dans un navigateur
   - Ou servir via un serveur HTTP (pour les composants dynamiques)

3. **Personnaliser** :
   - Modifier les textes dans les fichiers HTML
   - Ajuster les couleurs dans `css/landing.css` (variables CSS)
   - Ajouter des traductions dans `js/i18n.js`

## 🔧 Fonctionnalités

### Navigation
- Navbar fixe avec effet au scroll
- Smooth scroll vers les sections
- Sélecteur de langue

### Animations
- Fade-in au scroll (Intersection Observer)
- Hover effects sur les cartes
- Transitions fluides

### Responsive
- Design mobile-first
- Breakpoints : 768px, 968px
- Grilles adaptatives

## 📝 Notes

- Les composants navbar et footer sont chargés dynamiquement via `fetch()`
- Le système i18n stocke la langue dans `localStorage`
- Les formulaires utilisent `mailto:` pour l'envoi (à remplacer par une API si nécessaire)
- La vidéo de démo dans `demo.html` est un placeholder YouTube (à remplacer)

## 🎯 Améliorations Futures

- [ ] Intégrer un vrai système de formulaire (API backend)
- [ ] Ajouter plus de traductions
- [ ] Mode sombre/clair
- [ ] Analytics
- [ ] SEO optimization
- [ ] Performance optimization (lazy loading images/vidéos)

