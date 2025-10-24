/**
 * Script de notifications pour les dashboards admin/collectivité
 * À inclure dans tous les dashboards qui doivent recevoir des notifications
 */

// Initialiser les notifications dès le chargement
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔔 Initialisation des notifications pour dashboard admin/collectivité');
    
    // Attendre que le client de notifications soit chargé
    const initNotifications = () => {
        if (!window.notificationClient) {
            console.log('⏳ En attente du client de notifications...');
            setTimeout(initNotifications, 500);
            return;
        }
        
        // Écouter les changements de statut de commande
        window.notificationClient.on('order_status_change', (notification) => {
            console.log('📦 CHANGEMENT DE STATUT (WebSocket):', notification);
            console.log('   Commande:', notification.data?.orderNumber);
            console.log('   Nouveau statut:', notification.data?.newStatus);
            
            // Le popup avec son est déjà affiché automatiquement par handleNotification
            // On doit juste recharger les données IMMÉDIATEMENT
            
            // Recharger les commandes si la fonction existe
            if (window.loadOrders) {
                console.log('   → Rechargement des commandes (loadOrders)...');
                window.loadOrders();
            } else if (window.dashboard && typeof window.dashboard.loadOrders === 'function') {
                console.log('   → Rechargement des commandes (dashboard.loadOrders)...');
                window.dashboard.loadOrders();
            } else {
                console.warn('   ⚠️ Aucune fonction de rechargement trouvée');
            }
            
            // Recharger aussi les stats si disponible
            if (window.dashboard && typeof window.dashboard.loadStats === 'function') {
                window.dashboard.loadStats();
            }
        });
        
        // Écouter les livraisons confirmées
        window.notificationClient.on('notification', (notification) => {
            if (notification.data?.newStatus === 'delivered') {
                console.log('✅ Commande livrée confirmée:', notification);
                // Peut-être mettre à jour les stats ou afficher un message spécial
            }
        });
        
        // Connexion établie
        window.notificationClient.on('connected', () => {
            console.log('✅ Service de notifications en temps réel actif pour ADMIN/COLLECTIVITÉ');
            
            // Afficher un petit indicateur de connexion
            showConnectionIndicator(true);
        });
        
        // Déconnexion
        window.notificationClient.on('disconnected', () => {
            console.warn('⚠️ Service de notifications déconnecté pour ADMIN');
            showConnectionIndicator(false);
        });
        
        // Log de toutes les notifications reçues
        window.notificationClient.on('notification', (notification) => {
            console.log('📬 Notification générique reçue:', notification.type, notification);
        });
    };
    
    // Démarrer l'initialisation
    initNotifications();
});

/**
 * Afficher un toast personnalisé
 */
function showCustomToast(notification) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = 'custom-notification-toast';
    toast.style.cssText = `
        background: white;
        border-left: 4px solid #3498db;
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-bell" style="color: #3498db;"></i>
            <div>
                <strong>${notification.title}</strong>
                <p style="margin: 0.25rem 0 0 0; font-size: 0.9rem; color: #666;">
                    ${notification.message}
                </p>
            </div>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

/**
 * Afficher un indicateur de connexion
 */
function showConnectionIndicator(connected) {
    let indicator = document.getElementById('notification-connection-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'notification-connection-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.85rem;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(indicator);
    }
    
    if (connected) {
        indicator.style.background = '#27ae60';
        indicator.style.color = 'white';
        indicator.innerHTML = `
            <i class="fas fa-wifi"></i>
            <span>Notifications en temps réel actives</span>
        `;
        
        // Masquer après 3 secondes
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => {
                indicator.style.display = 'none';
            }, 300);
        }, 3000);
    } else {
        indicator.style.background = '#e74c3c';
        indicator.style.color = 'white';
        indicator.style.display = 'flex';
        indicator.style.opacity = '1';
        indicator.innerHTML = `
            <i class="fas fa-wifi" style="text-decoration: line-through;"></i>
            <span>Reconnexion...</span>
        `;
    }
}

