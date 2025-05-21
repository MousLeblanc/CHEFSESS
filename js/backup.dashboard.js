// js/dashboard.js
import authManager from './auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // Protéger la page d'accueil
    authManager.protectPage();
    
    // Mettre à jour les informations utilisateur dans l'interface
    updateUserInfo();
    
    // Charger les données du tableau de bord
    loadDashboardData();
    
    // Configuration des interactions utilisateur
    setupUserInteractions();
});

/**
 * Met à jour les informations de l'utilisateur dans l'interface
 */
function updateUserInfo() {
    const userNameElement = document.getElementById('user-name');
    const currentUser = authManager.getCurrentUser();
    
    if (userNameElement && currentUser) {
        userNameElement.textContent = currentUser.name;
    }
}

/**
 * Charge les données du tableau de bord
 */
function loadDashboardData() {
    // Charger les données du stock
    loadStockData();
    
    // Charger les menus à venir
    loadUpcomingMenus();
    
    // Charger les données des fournisseurs
    loadSupplierData();
    
    // Charger les alertes
    loadAlerts();
}

/**
 * Charge les données de stock
 */
function loadStockData() {
    try {
        // Récupérer les ingrédients du localStorage
        const ingredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
        
        // Compter les ingrédients
        const totalIngredients = ingredients.length;
        document.getElementById('total-ingredients').textContent = totalIngredients;
        
        // Compter les ingrédients en stock bas
        const lowStockCount = ingredients.filter(item => {
            return item.threshold > 0 && item.quantity <= item.threshold;
        }).length;
        document.getElementById('low-stock-count').textContent = lowStockCount;
        
        // Compter les ingrédients bientôt périmés
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Récupérer les paramètres pour le nombre de jours avant alerte d'expiration
        const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
        const expiryAlertDays = settings.expiryAlertDays || 3;
        
        const alertDate = new Date();
        alertDate.setDate(alertDate.getDate() + expiryAlertDays);
        alertDate.setHours(0, 0, 0, 0);
        
        const expiringSoonCount = ingredients.filter(item => {
            if (!item.expiry) return false;
            
            const expiryDate = new Date(item.expiry);
            expiryDate.setHours(0, 0, 0, 0);
            
            return expiryDate > today && expiryDate <= alertDate;
        }).length;
        document.getElementById('expiring-soon-count').textContent = expiringSoonCount;
    } catch (error) {
        console.error('Erreur lors du chargement des données de stock:', error);
        showNotification('Erreur lors du chargement des données de stock', 'error');
    }
}

/**
 * Charge les menus à venir
 */
function loadUpcomingMenus() {
    try {
        // Récupérer le planning depuis le localStorage
        const planning = JSON.parse(localStorage.getItem('planning') || '{}');
        
        // Préparer le conteneur
        const menusContainer = document.getElementById('upcoming-menus');
        
        // Si aucun menu planifié
        if (Object.keys(planning).length === 0) {
            menusContainer.innerHTML = '<p>Aucun menu planifié pour le moment.</p>';
            return;
        }
        
        // Obtenir la date d'aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filtrer les menus à venir (7 prochains jours)
        const upcomingDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            upcomingDates.push(formatDateToISO(date));
        }
        
        // Générer le HTML
        let upcomingMenusHTML = '<ul class="menu-list">';
        let menuCount = 0;
        
        for (const dateStr of upcomingDates) {
            if (planning[dateStr]) {
                const dayMenu = planning[dateStr];
                
                // Formater la date
                const [year, month, day] = dateStr.split('-');
                const formattedDate = `${day}/${month}/${year}`;
                
                // Ajouter le menu du midi
                if (dayMenu.midi) {
                    upcomingMenusHTML += `
                        <li class="menu-item">
                            <div class="menu-date">${formattedDate} - Midi</div>
                            <div class="menu-name">${dayMenu.midi.name || 'Menu sans nom'}</div>
                        </li>
                    `;
                    menuCount++;
                }
                
                // Ajouter le menu du soir
                if (dayMenu.soir) {
                    upcomingMenusHTML += `
                        <li class="menu-item">
                            <div class="menu-date">${formattedDate} - Soir</div>
                            <div class="menu-name">${dayMenu.soir.name || 'Menu sans nom'}</div>
                        </li>
                    `;
                    menuCount++;
                }
                
                // Limiter à 5 menus maximum
                if (menuCount >= 5) break;
            }
        }
        
        upcomingMenusHTML += '</ul>';
        
        // Si aucun menu n'a été trouvé
        if (menuCount === 0) {
            menusContainer.innerHTML = '<p>Aucun menu planifié pour les 7 prochains jours.</p>';
        } else {
            menusContainer.innerHTML = upcomingMenusHTML;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des menus:', error);
        document.getElementById('upcoming-menus').innerHTML = '<p>Erreur lors du chargement des menus.</p>';
    }
}

/**
 * Charge les données des fournisseurs
 */
function loadSupplierData() {
    try {
        // Récupérer les fournisseurs depuis le localStorage
        const suppliers = JSON.parse(localStorage.getItem('suppliers') || '[]');
        
        // Mettre à jour le compteur
        document.getElementById('total-suppliers').textContent = suppliers.length;
        
        // Calculer le nombre de produits en dessous du seuil de stock
        let pendingOrdersCount = 0;
        const ingredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
        
        // On compte comme "commandes en cours" les ingrédients sous le seuil
        for (const ingredient of ingredients) {
            if (ingredient.threshold > 0 && ingredient.quantity <= ingredient.threshold) {
                // Vérifier si un fournisseur propose cet ingrédient
                const canBeOrdered = suppliers.some(supplier => 
                    supplier.products && supplier.products.some(product => 
                        product.name.toLowerCase().includes(ingredient.name.toLowerCase())
                    )
                );
                
                if (canBeOrdered) {
                    pendingOrdersCount++;
                }
            }
        }
        
        document.getElementById('pending-orders').textContent = pendingOrdersCount;
    } catch (error) {
        console.error('Erreur lors du chargement des données fournisseurs:', error);
    }
}

/**
 * Charge les alertes
 */
function loadAlerts() {
    try {
        // Récupérer les ingrédients
        const ingredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
        
        // Récupérer le planning
        const planning = JSON.parse(localStorage.getItem('planning') || '{}');
        
        const alertsContainer = document.getElementById('alerts-container');
        let alertsHTML = '';
        
        // Vérifier les ingrédients périmés
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const expiredCount = ingredients.filter(item => {
            if (!item.expiry) return false;
            
            const expiryDate = new Date(item.expiry);
            expiryDate.setHours(0, 0, 0, 0);
            
            return expiryDate < today;
        }).length;
        
        if (expiredCount > 0) {
            alertsHTML += `
                <div class="alert alert-error">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>${expiredCount} ingrédient(s) périmé(s) ! Vérifiez votre stock.</span>
                </div>
            `;
        }
        
        // Vérifier les ingrédients en stock bas
        const lowStockCount = ingredients.filter(item => {
            return item.threshold > 0 && item.quantity <= item.threshold;
        }).length;
        
        if (lowStockCount > 0) {
            alertsHTML += `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${lowStockCount} ingrédient(s) en quantité faible.</span>
                </div>
            `;
        }
        
        // Vérifier si le planning est vide pour les prochains jours
        const upcomingDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            upcomingDates.push(formatDateToISO(date));
        }
        
        let hasUpcomingMenus = false;
        for (const dateStr of upcomingDates) {
            if (planning[dateStr] && (planning[dateStr].midi || planning[dateStr].soir)) {
                hasUpcomingMenus = true;
                break;
            }
        }
        
        if (!hasUpcomingMenus) {
            alertsHTML += `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    <span>Aucun menu planifié pour les prochains jours.</span>
                </div>
            `;
        }
        
        // Afficher les alertes ou un message par défaut
        if (alertsHTML) {
            alertsContainer.innerHTML = alertsHTML;
        } else {
            alertsContainer.innerHTML = `
                <div class="alert alert-success">
                    <i class="fas fa-check-circle"></i>
                    <span>Tout est en ordre !</span>
                </div>
            `;
        }
    } catch (error) {
        console.error('Erreur lors du chargement des alertes:', error);
    }
}

/**
 * Configure les interactions utilisateur
 */
function setupUserInteractions() {
    // Menu utilisateur déroulant
    const userMenuToggle = document.getElementById('user-menu-toggle');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenuToggle && userDropdown) {
        userMenuToggle.addEventListener('click', function() {
            userDropdown.classList.toggle('show');
        });
        
        // Fermer le menu lorsqu'on clique ailleurs
        document.addEventListener('click', function(e) {
            if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('show');
            }
        });
    }
    
    // Déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Déconnecter l'utilisateur
            authManager.logout();
            
            // Rediriger vers la page de connexion
            window.location.href = 'login.html';
        });
    }
}

/**
 * Formate une date au format ISO (YYYY-MM-DD)
 * @param {Date} date - Objet Date
 * @returns {string} - Date au format YYYY-MM-DD
 */
function formatDateToISO(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Affiche une notification
 * @param {string} message - Message à afficher
 * @param {string} type - Type de notification ('success', 'error', 'info', 'warning')
 */
function showNotification(message, type = 'info') {
    // Vérifier si la fonction existe globalement
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
    } else {
        // Créer notre propre notification
        const notificationContainer = document.createElement('div');
        notificationContainer.className = `notification notification-${type}`;
        
        notificationContainer.innerHTML = `
            <div class="notification-content">
                <i class="fas ${getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Ajouter au document
        document.body.appendChild(notificationContainer);
        
        // Animer
        setTimeout(() => {
            notificationContainer.classList.add('show');
        }, 10);
        
        // Supprimer après un délai
        setTimeout(() => {
            notificationContainer.classList.remove('show');
            setTimeout(() => {
                if (notificationContainer.parentNode) {
                    document.body.removeChild(notificationContainer);
                }
            }, 300);
        }, 3000);
    }
}

/**
 * Retourne l'icône pour le type de notification
 * @param {string} type - Type de notification
 * @returns {string} - Classe d'icône Font Awesome
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}