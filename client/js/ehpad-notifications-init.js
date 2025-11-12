/**
 * Module pour l'initialisation des notifications EHPAD
 * Extrait de ehpad-dashboard.html pour améliorer la maintenabilité
 */

// Initialiser les notifications pour le dashboard EHPAD
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔔 Initialisation des notifications EHPAD');
  
  // Attendre que le client de notifications et supplier-common.js soient chargés
  const initNotifications = () => {
    if (!window.notificationClient) {
      console.log('⏳ En attente du client de notifications...');
      setTimeout(initNotifications, 500);
      return;
    }
    
    if (typeof window.showMyOrders !== 'function') {
      console.log('⏳ En attente de supplier-common.js...');
      setTimeout(initNotifications, 500);
      return;
    }
    
    console.log('✅ Client de notifications et supplier-common.js chargés');
    
    // Écouter les changements de statut de commande
    window.notificationClient.on('order_status_change', (notification) => {
      console.log('📦 CHANGEMENT DE STATUT (WebSocket):', notification);
      console.log('   Commande:', notification.data?.orderNumber);
      console.log('   Nouveau statut:', notification.data?.newStatus);
      
      // Recharger les commandes si la fonction existe
      if (typeof window.showMyOrders === 'function') {
        console.log('   → Rechargement des commandes (showMyOrders)...');
        setTimeout(() => {
          window.showMyOrders();
        }, 500); // Petit délai pour laisser le backend sauvegarder
      } else if (typeof loadCustomerOrders === 'function') {
        console.log('   → Rechargement des commandes (loadCustomerOrders)...');
        setTimeout(() => {
          loadCustomerOrders();
        }, 500);
      } else {
        console.warn('   ⚠️ Aucune fonction de rechargement trouvée');
      }
      
      // Recharger aussi le badge des commandes
      if (typeof loadOrdersBadgeOnly === 'function') {
        setTimeout(() => {
          loadOrdersBadgeOnly();
        }, 1000);
      }
    });
    
    // Écouter les nouvelles commandes (pour le fournisseur, mais aussi utile pour le site)
    window.notificationClient.on('new_order', (notification) => {
      console.log('🛒 NOUVELLE COMMANDE (WebSocket):', notification);
      
      // Recharger les commandes
      if (typeof window.showMyOrders === 'function') {
        setTimeout(() => {
          window.showMyOrders();
        }, 500);
      } else if (typeof loadCustomerOrders === 'function') {
        setTimeout(() => {
          loadCustomerOrders();
        }, 500);
      }
    });
  };
  
  initNotifications();
  
  // Démarrer la vérification périodique des commandes (toutes les 10 secondes)
  // Attendre que checkOrdersUpdates soit disponible
  const startPeriodicCheck = () => {
    if (typeof window.checkOrdersUpdates === 'function') {
      console.log('🔄 Démarrage de la vérification périodique des commandes...');
      setInterval(window.checkOrdersUpdates, 10000); // Vérifier toutes les 10 secondes
    } else {
      console.log('⏳ En attente de checkOrdersUpdates...');
      setTimeout(startPeriodicCheck, 500);
    }
  };
  
  startPeriodicCheck();
});

