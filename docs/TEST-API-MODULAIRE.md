# 🧪 Guide de Test - API Génération Modulaire

## ⚠️ Important : Redémarrer le Serveur

Les nouvelles routes (`/api/menu-modular`, `/api/recipe-components`, `/api/recipe-templates`) nécessitent un **redémarrage du serveur** pour être disponibles.

### Étape 1 : Redémarrer le Serveur

```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis redémarrer
npm start
```

Ou si vous utilisez nodemon :
```bash
# Le serveur redémarre automatiquement
```

---

## 🧪 Tests de l'API

### Test 1 : Vérifier que les routes sont chargées

```bash
# Health check
curl http://localhost:5000/api/health

# Devrait retourner: {"status":"ok","message":"Server is running"}
```

### Test 2 : Récupérer les composants disponibles

```bash
# Récupérer les protéines
curl http://localhost:5000/api/recipe-components?type=protein&limit=5

# Récupérer les sauces
curl http://localhost:5000/api/recipe-components?type=sauce&limit=5

# Récupérer les accompagnements
curl http://localhost:5000/api/recipe-components?type=accompaniment&limit=5
```

**Note**: Ces endpoints nécessitent une authentification. Si vous obtenez une 401, c'est normal.

### Test 3 : Générer un menu modulaire (Mode Automatique)

**Endpoint**: `POST /api/menu-modular/generate-modular`

**Payload**:
```json
{
  "numberOfPeople": 4,
  "mealType": "déjeuner",
  "dietaryRestrictions": [],
  "allergens": [],
  "useStockOnly": false,
  "avoidProteins": [],
  "previousMenus": []
}
```

**Avec curl** (PowerShell):
```powershell
$body = @{
    numberOfPeople = 4
    mealType = "déjeuner"
    dietaryRestrictions = @()
    allergens = @()
    useStockOnly = $false
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/menu-modular/generate-modular" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -SessionVariable session
```

**Avec Node.js** (script):
```bash
node scripts/test-modular-api-simple.js
```

### Test 4 : Générer un menu modulaire (Mode Manuel)

**Payload avec sélection manuelle**:
```json
{
  "numberOfPeople": 4,
  "mealType": "déjeuner",
  "proteinId": "ID_DE_LA_PROTEINE",
  "sauceId": "ID_DE_LA_SAUCE",
  "accompanimentId": "ID_DE_L_ACCOMPAGNEMENT",
  "dietaryRestrictions": [],
  "allergens": []
}
```

**Étapes**:
1. D'abord, récupérer les IDs des composants disponibles
2. Utiliser ces IDs dans le payload

---

## 🔐 Authentification

Tous les endpoints nécessitent une authentification. Vous devez :

1. **Vous connecter d'abord** via `POST /api/auth/login`
2. **Utiliser les cookies de session** dans les requêtes suivantes

**Exemple avec fetch (Node.js)**:
```javascript
// 1. Se connecter
const loginRes = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    email: 'votre-email@example.com',
    password: 'votre-mot-de-passe'
  })
});

// Les cookies sont automatiquement stockés avec credentials: 'include'

// 2. Utiliser l'API modulaire
const menuRes = await fetch('http://localhost:5000/api/menu-modular/generate-modular', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important pour envoyer les cookies
  body: JSON.stringify({
    numberOfPeople: 4,
    mealType: 'déjeuner'
  })
});
```

---

## 📋 Réponses Attendues

### Succès (200 OK)
```json
{
  "success": true,
  "data": {
    "template": {
      "_id": "...",
      "name": "Cuisse de poulet avec sauce champignons et riz",
      "protein": { ... },
      "sauce": { ... },
      "accompaniment": { ... },
      "totalNutrition": { ... },
      "totalIngredients": [ ... ]
    },
    "stockCheck": null,
    "combination": {
      "protein": "Cuisse de poulet",
      "sauce": "Sauce aux champignons",
      "accompaniment": "Riz blanc"
    }
  }
}
```

### Erreur - Authentification requise (401)
```json
{
  "success": false,
  "message": "Not authorized"
}
```

### Erreur - Route non trouvée (404)
```
Cannot POST /api/menu-modular/generate-modular
```
→ **Solution**: Redémarrer le serveur

### Erreur - Protéine non trouvée (400)
```json
{
  "success": false,
  "message": "Aucune protéine compatible trouvée"
}
```
→ **Solution**: Vérifier que le seed a été exécuté (`node scripts/seed-recipe-components.js`)

---

## 🐛 Dépannage

### Problème : Route 404
**Cause**: Serveur non redémarré
**Solution**: Redémarrer le serveur (`npm start`)

### Problème : 401 Unauthorized
**Cause**: Pas authentifié
**Solution**: Se connecter d'abord via `/api/auth/login`

### Problème : Aucune protéine trouvée
**Cause**: Base de données vide
**Solution**: Exécuter `node scripts/seed-recipe-components.js`

### Problème : Erreur de compatibilité
**Cause**: Sauce/accompagnement non compatible avec la protéine
**Solution**: Vérifier les compatibilités dans la base de données

---

## 📝 Scripts de Test Disponibles

1. **`scripts/test-modular-api-simple.js`**
   - Test basique sans authentification
   - Vérifie que les routes sont chargées

2. **`scripts/test-modular-menu-api.js`**
   - Test complet avec authentification
   - Test mode automatique et manuel

---

## ✅ Checklist de Test

- [ ] Serveur redémarré après ajout des routes
- [ ] Seed exécuté (`node scripts/seed-recipe-components.js`)
- [ ] Authentification fonctionnelle
- [ ] Route `/api/menu-modular/generate-modular` accessible
- [ ] Composants disponibles dans la base de données
- [ ] Génération automatique fonctionne
- [ ] Génération manuelle fonctionne
- [ ] Vérification de compatibilité fonctionne

---

**Version: 1.0**  
**Last updated: January 2025**





