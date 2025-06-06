// client/js/common.js
console.log("Chargement de common.js");

// Import des dépendances en premier (c'est une convention)
import { logout, getToken } from './auth.js'; // Assurez-vous que le chemin vers auth.js est correct

// --- Définition des constantes et variables globales au module ---
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
let inactivityTimer;

// --- Fonctions Utilitaires Générales ---

// Fonction pour formater les dates
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Obtenir l'icône pour les notifications (utilisée par showNotification)
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Afficher une notification
function showNotification(message, type = 'info') {
    console.log(`Notification (${type}): ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`; // Assurez-vous d'avoir les styles CSS pour .notification et .notification-type
    
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    let container = document.querySelector('.notification-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        // Styles pour le conteneur (peuvent aussi être dans votre CSS global)
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease-out'; // Ajout de ease-out
        
        setTimeout(() => {
            if (notification.parentNode) { // Vérifier si la notification est toujours dans le DOM
                container.removeChild(notification);
            }
        }, 500); // Délai pour la transition avant suppression
    }, 3000);
}

// --- Logique de Gestion de Session et Inactivité ---

function handleInactivity() { // Renommée pour plus de clarté, anciennement la fonction anonyme dans setTimeout
    console.log("Inactivité détectée. Déconnexion automatique.");
    // Utiliser votre showNotification si disponible et stylée
    showNotification("Vous avez été déconnecté pour inactivité.", "warning"); 
    logout();
}

function resetInactivityTimer() {
    if (!getToken()) {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        return;
    }
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(handleInactivity, INACTIVITY_TIMEOUT_MS);
}

function setupActivityListeners() {
    window.addEventListener('mousemove', resetInactivityTimer, { passive: true });
    window.addEventListener('mousedown', resetInactivityTimer, { passive: true });
    window.addEventListener('keypress', resetInactivityTimer, { passive: true });
    window.addEventListener('touchmove', resetInactivityTimer, { passive: true });
    window.addEventListener('scroll', resetInactivityTimer, { passive: true, capture: true });

    resetInactivityTimer(); // Démarrer le timer si l'utilisateur est déjà connecté au chargement du script
}

// --- Initialisation et Écouteurs d'Événements Globaux ---

// Écouteur pour démarrer la surveillance d'activité une fois le DOM chargé,
// uniquement sur les pages où l'utilisateur est censé être connecté.
document.addEventListener('DOMContentLoaded', () => {
    const nonAuthPages = ['/index.html', '/register.html', '/choisir-profil.html'];
    if (!nonAuthPages.includes(window.location.pathname)) {
        if (getToken()) { // Démarrer seulement si un token existe déjà (ex: après un F5)
            setupActivityListeners();
        }
    }
});

// Écouteur pour la synchronisation de la déconnexion entre onglets
window.addEventListener('storage', (event) => {
    if (event.key === 'token' && !event.newValue && getToken()) { 
        // getToken() ici vérifie si cet onglet pense toujours avoir un token valide
        console.log("Token supprimé via un autre onglet/fenêtre. Déconnexion de cet onglet.");
        logout();
    }
    // La gestion de la connexion dans un autre onglet est plus complexe et souvent non nécessaire
    // else if (event.key === 'token' && event.newValue && !getToken()) { ... }
});

// --- Exports du Module ---
// Exporter les fonctions que vous souhaitez utiliser dans d'autres modules ES6
export {
    formatDate,
    showNotification,
    // getNotificationIcon, // Probablement pas besoin de l'exporter, car interne à showNotification
    resetInactivityTimer,  // Peut être utile pour un reset manuel depuis auth.js (login/logout)
    setupActivityListeners // Au cas où vous voudriez le contrôler manuellement depuis un autre point
};

// --- Exposition Globale (Optionnelle et à utiliser avec prudence) ---
// Si vous avez absolument besoin d'accéder à ces fonctions via window.NomFonction
// dans des scripts non-modulaires ou des attributs onclick HTML.
// Essayez de privilégier les imports de modules autant que possible.
/*
window.ChAIfUtils = {
    formatDate,
    showNotification,
    resetInactivityTimer,
    setupActivityListeners
};
*/