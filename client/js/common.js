// js/common.js - Fonctions utilitaires minimales
console.log("Chargement de common.js");

// Fonction pour formater les dates
function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

// Afficher une notification
function showNotification(message, type = 'info') {
    console.log(`Notification (${type}): ${message}`);
    
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Ajouter au document
    let container = document.querySelector('.notification-container');
    
    if (!container) {
        container = document.createElement('div');
        container.className = 'notification-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Auto-destruction après 3 secondes
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        
        setTimeout(() => {
            if (notification.parentNode) {
                container.removeChild(notification);
            }
        }, 500);
    }, 3000);
}

// Obtenir l'icône pour les notifications
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Exporter les fonctions pour les rendre disponibles globalement
window.formatDate = formatDate;
window.showNotification = showNotification;