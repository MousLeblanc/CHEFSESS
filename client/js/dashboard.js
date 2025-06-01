/**
 * ChAIf SES - Script de la page d'accueil (Dashboard)
 * Ce fichier charge dynamiquement les données pour la page d'accueil
 * à partir des mêmes sources que les autres pages.
 */

// Attendre que le DOM soit entièrement chargé
document.addEventListener('DOMContentLoaded', function() {

    // Protection contre les boucles de redirection
    const redirectCount = parseInt(localStorage.getItem('redirect-count') || '0');
    if (redirectCount > 5) {
        console.error("Trop de redirections détectées. Arrêt.");
        return;
    }
    localStorage.setItem('redirect-count', redirectCount + 1);

    const isAuth = // supprimé (remplacé par token) === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const isFromLogin = urlParams.get('redirect') === 'manual' || urlParams.get('logout') === 'true';

    if (!isAuth && !isFromLogin) {
        console.log("Utilisateur non authentifié, redirection vers index.html");
        document.location = 'index.html?redirect=manual';
        return;
    }

    localStorage.removeItem('redirect-count');
    console.log("Utilisateur authentifié, affichage de la page");
   


    // Mettre à jour le nom d'utilisateur
    const userNameElement = document.getElementById('user-name');
    const userName = JSON.parse(localStorage.getItem('user') || '{}')?.name || 'Utilisateur';
    if (userNameElement) {
        userNameElement.textContent = userName;
    }

    // Configurer le bouton de déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.removeItem('chaif-ses-authenticated');
            localStorage.removeItem('chaif-ses-user-id');
            localStorage.removeItem('chaif-ses-user-email');
            localStorage.removeItem('chaif-ses-user-name');
            localStorage.removeItem('chaif-ses-user-role');
            localStorage.removeItem('chaif-ses-session-start');
            localStorage.setItem('redirect-count', '0');
            document.location = 'index.html?logout=true';
        });
    }
});

    console.log("Initialisation du tableau de bord");
  document.getElementById('add-ingredient-btn')?.addEventListener('click', () => {
    console.log("Ajouter un ingrédient");
  });

  document.getElementById('create-menu-btn')?.addEventListener('click', () => {
    console.log("Créer un menu");
  });

  document.getElementById('place-order-btn')?.addEventListener('click', () => {
    console.log("Passer une commande");
  });

  document.getElementById('export-stock-btn')?.addEventListener('click', () => {
    console.log("Exporter l'inventaire");
  });


    
    // Charger les données du tableau de bord
    loadDashboardData();
    
    // Initialiser les actions rapides
    initQuickActions();


/**
 * Charge toutes les données pour le tableau de bord
 */
function loadDashboardData() {
    // Charger les données de stock
    loadStockData();
    
    // Charger les données du planning
    loadPlanningData();
    
    // Charger les alertes
    loadAlerts();
    
    // Charger les données des fournisseurs
    loadSupplierData();
}

/**
 * Charge et affiche les données de stock
 */
function loadStockData() {
    // Vérifions quelles clés sont disponibles dans le localStorage pour le débogage
    console.log("Clés disponibles dans localStorage:", Object.keys(localStorage));
    
    // Dans stock.js, les données sont stockées sous la clé 'inventory' ou 'chaif-ses-inventory'
    // Essayons les deux possibilités
    let ingredients = [];
    
    if (localStorage.getItem('inventory')) {
        ingredients = JSON.parse(localStorage.getItem('inventory') || '[]');
    } else if (localStorage.getItem('chaif-ses-inventory')) {
        ingredients = JSON.parse(localStorage.getItem('chaif-ses-inventory') || '[]');
    } else if (localStorage.getItem('ingredients')) {
        ingredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
    }
    
    // Si aucune donnée n'est trouvée, utilisons des données de démonstration
    if (ingredients.length === 0) {
        console.log("Aucun ingrédient trouvé en stock. Utilisation de données de démonstration.");
        ingredients = getDemoIngredients();
    }
    
    console.log("Nombre d'ingrédients chargés:", ingredients.length);
    
    // Récupérer les paramètres pour le nombre de jours avant alerte d'expiration
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    const expiryAlertDays = settings.expiryAlertDays || 3;
    
    // Date actuelle et date d'alerte
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + expiryAlertDays);
    alertDate.setHours(0, 0, 0, 0);
    
    // Compter les ingrédients par statut
    let totalIngredients = ingredients.length;
    let lowStockCount = 0;
    let expiringSoonCount = 0;
    
    ingredients.forEach(ingredient => {
        // Stock bas
        if (ingredient.threshold > 0 && ingredient.quantity <= ingredient.threshold) {
            lowStockCount++;
        }
        
        // Bientôt périmé
        if (ingredient.expiry) {
            const expiryDate = new Date(ingredient.expiry);
            expiryDate.setHours(0, 0, 0, 0);
            
            if (expiryDate > today && expiryDate <= alertDate) {
                expiringSoonCount++;
            }
        }
    });
    
    // Mettre à jour l'interface
    document.getElementById('total-ingredients').textContent = totalIngredients;
    document.getElementById('low-stock-count').textContent = lowStockCount;
    document.getElementById('expiring-soon-count').textContent = expiringSoonCount;
}

/**
 * Génère des données de démonstration pour l'inventaire
 * @returns {Array} - Liste d'ingrédients de démonstration
 */
function getDemoIngredients() {
    return [
        {
            id: 1,
            name: 'Tomates Bio',
            category: 'fruits-legumes',
            quantity: 28,
            unit: 'kg',
            threshold: 10,
            expiry: '2025-05-25',
            status: 'ok'
        },
        {
            id: 2,
            name: 'Filet de Bœuf',
            category: 'viande',
            quantity: 5.2,
            unit: 'kg',
            threshold: 8,
            expiry: '2025-05-22',
            status: 'warning'
        },
        {
            id: 3,
            name: 'Saumon Frais',
            category: 'poisson',
            quantity: 1.8,
            unit: 'kg',
            threshold: 12,
            expiry: '2025-05-20',
            status: 'danger'
        },
        {
            id: 4,
            name: 'Pommes de Terre',
            category: 'fruits-legumes',
            quantity: 45,
            unit: 'kg',
            threshold: 20,
            expiry: '2025-06-05',
            status: 'ok'
        },
        {
            id: 5,
            name: 'Huile d\'Olive Extra Vierge',
            category: 'epicerie',
            quantity: 12,
            unit: 'L',
            threshold: 8,
            expiry: '2025-12-12',
            status: 'ok'
        },
        {
            id: 6,
            name: 'Champignons de Paris',
            category: 'fruits-legumes',
            quantity: 4.5,
            unit: 'kg',
            threshold: 6,
            expiry: '2025-05-21',
            status: 'warning'
        }
    ];
}

/**
 * Charge et affiche les données du planning des menus
 */
function loadPlanningData() {
    console.log("Chargement des données du planning...");

    // Dans planning.js, les données sont stockées sous la clé 'planning' ou 'chaif-ses-planning'
    // Essayons les deux possibilités
    let planning = [];
    
    if (localStorage.getItem('planning')) {
        planning = JSON.parse(localStorage.getItem('planning') || '[]');
    } else if (localStorage.getItem('chaif-ses-planning')) {
        planning = JSON.parse(localStorage.getItem('chaif-ses-planning') || '[]');
    } 
    
    // Si aucune donnée n'est trouvée, utilisons des données de démonstration
    if (planning.length === 0) {
        console.log("Aucun planning trouvé. Utilisation de données de démonstration.");
        planning = getDemoPlanning();
    }
    
    console.log("Données de planning chargées:", planning);
    
    // Récupérer le conteneur des menus à venir
    const upcomingMenus = document.getElementById('upcoming-menus');
    
    // Si pas de données, afficher un message
    if (planning.length === 0) {
        upcomingMenus.innerHTML = '<p>Aucun menu planifié pour le moment.</p>';
        return;
    }
    
    // Trier les menus par date
    planning.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Filtrer les menus à venir (aujourd'hui et après)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingPlanning = planning.filter(item => {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate >= today;
    });
    
    // Limiter à 3 menus maximum
    const menus = upcomingPlanning.slice(0, 3);
    
    // Si pas de menus à venir, afficher un message
    if (menus.length === 0) {
        upcomingMenus.innerHTML = '<p>Aucun menu planifié pour les prochains jours.</p>';
        return;
    }
    
    // Créer la liste HTML
    let html = '<ul class="menu-preview-list">';
    
    menus.forEach(menu => {
        // Formater la date
        const menuDate = new Date(menu.date);
        const isToday = isDateToday(menuDate);
        const isTomorrow = isDateTomorrow(menuDate);
        
        let dateDisplay;
        if (isToday) {
            dateDisplay = 'Aujourd\'hui';
        } else if (isTomorrow) {
            dateDisplay = 'Demain';
        } else {
            dateDisplay = formatDate(menuDate);
        }
        
        // Récupérer le nom du menu à partir de son ID
        const menuName = getMenuNameById(menu.menu_id);
        
        html += `
            <li class="menu-preview-item">
                <span class="menu-preview-date">${dateDisplay}</span>
                <span class="menu-preview-name">${menuName}</span>
                <span class="menu-preview-guests">${menu.covers} couverts</span>
            </li>
        `;
    });
    
    html += '</ul>';
    upcomingMenus.innerHTML = html;
}

/**
 * Génère des données de démonstration pour le planning
 * @returns {Array} - Planning de démonstration
 */
function getDemoPlanning() {
    // Calculer les dates pour la semaine en cours
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + mondayOffset);
    
    // Formater une date en YYYY-MM-DD
    const formatDateYMD = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Créer les entrées du planning pour chaque jour de la semaine
    const planning = [];
    const menuIds = [1001, 1002, 1003, 1004]; // IDs des menus existants
    
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(monday);
        currentDay.setDate(monday.getDate() + i);
        const dateStr = formatDateYMD(currentDay);
        
        // Déjeuner
        planning.push({
            id: 2000 + (i * 2),
            menu_id: menuIds[Math.floor(Math.random() * menuIds.length)],
            date: dateStr,
            time: '12:00',
            meal_type: 'lunch',
            covers: 30 + Math.floor(Math.random() * 40),
            notes: ''
        });
        
        // Dîner
        planning.push({
            id: 2000 + (i * 2) + 1,
            menu_id: menuIds[Math.floor(Math.random() * menuIds.length)],
            date: dateStr,
            time: '19:00',
            meal_type: 'dinner',
            covers: 40 + Math.floor(Math.random() * 30),
            notes: ''
        });
    }
    
    return planning;
}

/**
 * Récupère le nom d'un menu à partir de son ID
 * @param {number} menuId - ID du menu
 * @returns {string} - Nom du menu, ou "Menu inconnu" si non trouvé
 */
function getMenuNameById(menuId) {
    console.log("Recherche du menu avec l'ID:", menuId);
    
    // Essayer de récupérer les menus depuis différentes clés de localStorage
    let menus = [];
    
    if (localStorage.getItem('menus')) {
        menus = JSON.parse(localStorage.getItem('menus') || '[]');
    } else if (localStorage.getItem('chaif-ses-menus')) {
        menus = JSON.parse(localStorage.getItem('chaif-ses-menus') || '[]');
    }
    
    // Si aucun menu n'est trouvé, utiliser des données de démonstration
    if (menus.length === 0) {
        menus = getDemoMenus();
    }
    
    // Trouver le menu correspondant
    const menu = menus.find(m => m.id == menuId);
    
    return menu ? menu.title : "Menu inconnu";
}

/**
 * Génère des données de démonstration pour les menus
 * @returns {Array} - Liste de menus de démonstration
 */
function getDemoMenus() {
    return [
        {
            id: 1001,
            title: "Risotto aux Champignons",
            category: "plat",
            price: 12.5,
            description: "Un risotto crémeux aux champignons, parfait pour un déjeuner élégant."
        },
        {
            id: 1002,
            title: "Poulet Rôti aux Herbes",
            category: "plat",
            price: 14.9,
            description: "Un poulet rôti classique avec des herbes fraîches et des pommes de terre."
        },
        {
            id: 1003,
            title: "Salade Niçoise",
            category: "entree",
            price: 9.9,
            description: "Une salade niçoise traditionnelle avec du thon, des œufs et des olives."
        },
        {
            id: 1004,
            title: "Spaghetti Carbonara",
            category: "plat",
            price: 11.5,
            description: "Des pâtes carbonara crémeuses avec du lard et du parmesan."
        }
    ];
}

/**
 * Charge et affiche les alertes
 */
function loadAlerts() {
    console.log("Chargement des alertes...");
    
    // Récupérer les ingrédients depuis plusieurs sources possibles
    let ingredients = [];
    
    if (localStorage.getItem('inventory')) {
        ingredients = JSON.parse(localStorage.getItem('inventory') || '[]');
    } else if (localStorage.getItem('chaif-ses-inventory')) {
        ingredients = JSON.parse(localStorage.getItem('chaif-ses-inventory') || '[]');
    } else if (localStorage.getItem('ingredients')) {
        ingredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
    }
    
    // Si aucun ingrédient n'est trouvé, utiliser des données de démonstration
    if (ingredients.length === 0) {
        ingredients = getDemoIngredients();
    }
    
    // Récupérer les paramètres pour le nombre de jours avant alerte d'expiration
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    const expiryAlertDays = settings.expiryAlertDays || 3;
    
    // Date actuelle et date d'alerte
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + expiryAlertDays);
    alertDate.setHours(0, 0, 0, 0);
    
    // Compter les alertes par type
    let lowStockCount = 0;
    let expiringCount = 0;
    let expiredCount = 0;
    
    ingredients.forEach(ingredient => {
        // Vérifier le seuil
        if (ingredient.threshold > 0 && ingredient.quantity <= ingredient.threshold) {
            lowStockCount++;
        }
        
        // Vérifier l'expiration
        if (ingredient.expiry) {
            const expiryDate = new Date(ingredient.expiry);
            expiryDate.setHours(0, 0, 0, 0);
            
            if (expiryDate < today) {
                expiredCount++;
            } else if (expiryDate <= alertDate) {
                expiringCount++;
            }
        }
    });
    
    // Récupérer le conteneur des alertes
    const alertsContainer = document.getElementById('alerts-container');
    
    // Vider le conteneur
    alertsContainer.innerHTML = '';
    
    // Afficher les alertes s'il y en a
    if (expiredCount > 0) {
        alertsContainer.innerHTML += `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i>
                <span>${expiredCount} ingrédient(s) périmé(s). Vérifiez votre stock.</span>
            </div>
        `;
    }
    
    if (expiringCount > 0) {
        alertsContainer.innerHTML += `
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${expiringCount} ingrédient(s) périront dans les ${expiryAlertDays} prochains jours.</span>
            </div>
        `;
    }
    
    if (lowStockCount > 0) {
        alertsContainer.innerHTML += `
            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <span>${lowStockCount} ingrédient(s) sont en quantité faible.</span>
            </div>
        `;
    }
    
    // Si aucune alerte, afficher un message
    if (expiredCount === 0 && expiringCount === 0 && lowStockCount === 0) {
        alertsContainer.innerHTML = `
            <div class="alert alert-success">
                <i class="fas fa-check-circle"></i>
                <span>Tout est en ordre !</span>
            </div>
        `;
    }
}

/**
 * Charge et affiche les données des fournisseurs
 */
function loadSupplierData() {
    console.log("Chargement des données des fournisseurs...");
    
    // Récupérer les fournisseurs depuis plusieurs sources possibles
    let suppliers = [];
    
    if (localStorage.getItem('suppliers')) {
        suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
    } else if (localStorage.getItem('chaif-ses-suppliers')) {
        suppliers = JSON.parse(localStorage.getItem('chaif-ses-suppliers') || '[]');
    }
    
    // Si aucun fournisseur n'est trouvé, utiliser des données de démonstration
    if (suppliers.length === 0) {
        console.log("Aucun fournisseur trouvé. Utilisation de données de démonstration.");
        suppliers = getDemoSuppliers();
    }
    
    console.log("Nombre de fournisseurs chargés:", suppliers.length);
    
    // Mettre à jour le nombre total de fournisseurs
    document.getElementById('total-suppliers').textContent = suppliers.length;
    
    // Compter les commandes en cours
    let pendingOrders = 0;
    
    suppliers.forEach(supplier => {
        if (supplier.orders) {
            pendingOrders += supplier.orders.filter(order => 
                order.status === 'pending' || order.status === 'confirmed' || order.status === 'shipped'
            ).length;
        }
    });
    
    // Si aucune commande en cours, utiliser des données de démonstration
    if (pendingOrders === 0 && suppliers.length > 0) {
        pendingOrders = Math.floor(Math.random() * 3) + 1;
    }
    
    // Mettre à jour le nombre de commandes en cours
    document.getElementById('pending-orders').textContent = pendingOrders;
}

/**
 * Génère des données de démonstration pour les fournisseurs
 * @returns {Array} - Liste de fournisseurs de démonstration
 */
function getDemoSuppliers() {
    return [
        {
            id: 1,
            name: "Primeurs du Marché",
            category: "fruits-legumes",
            contact: "Jean Dupont",
            phone: "01 23 45 67 89",
            email: "contact@primeurs-du-marche.fr",
            address: "12 rue des Maraîchers\n75020 Paris",
            notes: "Livraison les mardis et vendredis. Produits bio disponibles sur commande.",
            rating: 4,
            orders: [
                {
                    id: 1,
                    date: "2025-05-18",
                    status: "confirmed",
                    total: 485.60
                }
            ],
            products: [
                {
                    id: 1,
                    name: "Carottes Bio",
                    price: 2.50,
                    unit: "kg",
                    notes: "De saison d'octobre à mars"
                },
                {
                    id: 2,
                    name: "Pommes Golden",
                    price: 3.20,
                    unit: "kg",
                    notes: "Lot de 5kg disponible"
                },
                {
                    id: 3,
                    name: "Salade Batavia",
                    price: 1.20,
                    unit: "pièce",
                    notes: ""
                }
            ]
        },
        {
            id: 2,
            name: "Boucherie Normande",
            category: "viandes",
            contact: "Paul Martin",
            phone: "01 34 56 78 90",
            email: "commandes@boucherie-normande.com",
            address: "45 avenue des Bouchers\n14000 Caen",
            notes: "Commandes 48h à l'avance pour les grosses quantités. Livraison gratuite à partir de 150€.",
            rating: 5,
            orders: [
                {
                    id: 2,
                    date: "2025-05-17",
                    status: "shipped",
                    total: 752.30
                }
            ],
            products: [
                {
                    id: 4,
                    name: "Filet de bœuf",
                    price: 32.90,
                    unit: "kg",
                    notes: "Race Normande, élevage local"
                },
                {
                    id: 5,
                    name: "Poulet fermier",
                    price: 9.80,
                    unit: "kg",
                    notes: "Élevé en plein air"
                }
            ]
        },
        {
            id: 3,
            name: "Vins et Spiritueux Delorme",
            category: "boissons",
            contact: "Marie Delorme",
            phone: "01 45 67 89 10",
            email: "contact@delorme-vins.fr",
            address: "8 rue des Caves\n33000 Bordeaux",
            notes: "Grand choix de vins de Bordeaux et de spiritueux premium. Possibilité de dégustation sur rendez-vous.",
            rating: 4,
            orders: [
                {
                    id: 3,
                    date: "2025-05-15",
                    status: "delivered",
                    total: 367.90
                }
            ],
            products: [
                {
                    id: 6,
                    name: "Bordeaux Supérieur 2018",
                    price: 12.50,
                    unit: "bouteille",
                    notes: "Carton de 6 bouteilles"
                },
                {
                    id: 7,
                    name: "Champagne Brut",
                    price: 28.90,
                    unit: "bouteille",
                    notes: ""
                }
            ]
        }
    ];
}

/**
 * Initialise les boutons d'actions rapides
 */
function initQuickActions() {
    // Ajouter les écouteurs d'événements pour les actions rapides
    
    // Ajouter un ingrédient
    document.querySelector('a[href="stock.html#add"]').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'stock.html?modal=add-ingredient-modal';
    });
    
    // Créer un menu
    document.querySelector('a[href="planning.html#create"]').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'menu.html?tab=menu-create';
    });
    
    // Passer une commande
    document.querySelector('a[href="suppliers.html#order"]').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'suppliers.html?modal=supplier-modal';
    });
    
    // Exporter l'inventaire
    document.querySelector('a[href="stock.html#export"]').addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'stock.html?action=export';
    });
}

/**
 * Vérifie si une date est aujourd'hui
 * @param {Date} date - Date à vérifier
 * @returns {boolean} - true si la date est aujourd'hui
 */
function isDateToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
}

/**
 * Vérifie si une date est demain
 * @param {Date} date - Date à vérifier
 * @returns {boolean} - true si la date est demain
 */
function isDateTomorrow(date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() && 
           date.getMonth() === tomorrow.getMonth() && 
           date.getFullYear() === tomorrow.getFullYear();
}

/**
 * Formate une date pour l'affichage
 * @param {Date} date - Date à formater
 * @returns {string} - Date formatée (ex: "20 Mai")
 */
function formatDate(date) {
    const day = date.getDate();
    const month = date.toLocaleString('fr-FR', { month: 'long' });
    return `${day} ${month}`;
}