// js/dashboard.js
import authManager from './auth.js';

// Déclaration explicite du débogage
const DEBUG = true;

function log(message) {
    if (DEBUG) console.log(`[Dashboard] ${message}`);
}

log("Initialisation du dashboard...");

document.addEventListener('DOMContentLoaded', function() {
    log("DOM chargé, vérification de l'authentification");
    
    // Vérifier si l'utilisateur est authentifié
    if (!authManager.isAuthenticated()) {
        log("Utilisateur non authentifié, redirection vers login.html");
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 100);
        return;
    }
    
    log("Utilisateur authentifié, chargement du dashboard");
    
    // Mettre à jour le nom d'utilisateur
    updateUserInfo();
    
    // Charger les données du tableau de bord
    loadDashboardData();
    
    // Configurer les interactions utilisateur
    setupUserInteractions();
});

// Mettre à jour les informations utilisateur
function updateUserInfo() {
    log("Mise à jour des informations utilisateur");
    const userNameElement = document.getElementById('user-name');
    const userName = localStorage.getItem('chaif-ses-user-name') || 'Utilisateur';
    
    if (userNameElement) {
        userNameElement.textContent = userName;
        log(`Nom d'utilisateur mis à jour: ${userName}`);
    }
}

// Charger les données du tableau de bord
function loadDashboardData() {
    log("Chargement des données du dashboard");
    try {
        // Fonctions simplifiées pour l'instant
        updateStockStats();
        updateMenusDisplay();
        updateAlertsDisplay();
        updateSuppliersStats();
    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
    }
}

// Configurer les interactions utilisateur
function setupUserInteractions() {
    log("Configuration des interactions utilisateur");
    
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
            log("Déconnexion demandée");
            
            // Déconnecter l'utilisateur
            authManager.logout();
            
            // Rediriger vers la page de connexion
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 100);
        });
    }
}

// Mise à jour des statistiques de stock
function updateStockStats() {
    document.getElementById('total-ingredients').textContent = '0';
    document.getElementById('low-stock-count').textContent = '0';
    document.getElementById('expiring-soon-count').textContent = '0';
}

// Mise à jour de l'affichage des menus
function updateMenusDisplay() {
    document.getElementById('upcoming-menus').innerHTML = '<p>Aucun menu planifié pour le moment.</p>';
}

// Mise à jour de l'affichage des alertes
function updateAlertsDisplay() {
    // Par défaut, afficher un message indiquant que tout est en ordre
    document.getElementById('alerts-container').innerHTML = `
        <div class="alert alert-success">
            <i class="fas fa-check-circle"></i>
            <span>Tout est en ordre !</span>
        </div>
    `;
}

// Mise à jour des statistiques de fournisseurs
function updateSuppliersStats() {
    document.getElementById('total-suppliers').textContent = '0';
    document.getElementById('pending-orders').textContent = '0';
}