// client/JS/order-tracking.js
// Fonctions pour le suivi des commandes côté client

// Charger et afficher les commandes du client
export async function loadCustomerOrders() {
  console.log('📋 Chargement des commandes client...');
  const ordersContainer = document.getElementById('customer-orders-list');
  if (!ordersContainer) {
    console.error('❌ Container commandes non trouvé');
    return;
  }

  try {
    // Déterminer l'endpoint selon le rôle de l'utilisateur
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const endpoint = user.role === 'fournisseur' ? '/api/orders/supplier' : '/api/orders';
    
    console.log(`📡 Appel API: GET ${endpoint}`);
    console.log(`🔑 Rôle utilisateur: ${user.role}`);
    console.log('🔑 Utilisation du cookie pour l\'authentification');
    
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      credentials: 'include' // 🔐 Envoie automatiquement le cookie
    });
    
    console.log('📡 Réponse API:', response.status);

    if (response.ok) {
      const result = await response.json();
      const orders = result.data || [];
      console.log(`✅ ${orders.length} commandes chargées`);
      displayCustomerOrders(orders);
    } else if (response.status === 401) {
      console.error('❌ Non autorisé (401)');
      const errorText = await response.text();
      console.error('❌ Détails:', errorText);
      ordersContainer.innerHTML = '<p style="color: #e74c3c; padding: 2rem; text-align: center;">Session expirée. Veuillez vous reconnecter.</p>';
    } else {
      console.error(`❌ Erreur HTTP: ${response.status}`);
      const errorText = await response.text();
      console.error('❌ Détails:', errorText);
      ordersContainer.innerHTML = `<p style="color: #e74c3c; padding: 2rem; text-align: center;">Erreur lors du chargement des commandes (${response.status})</p>`;
    }
  } catch (error) {
    console.error('❌ Erreur réseau complète:', error);
    console.error('❌ Message:', error.message);
    console.error('❌ Stack:', error.stack);
    ordersContainer.innerHTML = '<p style="color: #e74c3c; padding: 2rem; text-align: center;">Erreur réseau. Vérifiez que le serveur est démarré.</p>';
  }
}

// Afficher les commandes
function displayCustomerOrders(orders) {
  const ordersContainer = document.getElementById('customer-orders-list');
  if (!ordersContainer) return;

  if (orders.length === 0) {
    ordersContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Aucune commande passée</p>';
    return;
  }

  const statusColors = {
    'pending': '#f39c12',
    'confirmed': '#3498db',
    'preparing': '#9b59b6',
    'ready': '#9b59b6',
    'shipped': '#3498db',
    'delivered': '#27ae60',
    'issue': '#e74c3c',
    'cancelled': '#e74c3c'
  };

  const statusLabels = {
    'pending': '⏳ En attente',
    'confirmed': '✅ Confirmée',
    'preparing': '🔨 En préparation',
    'ready': '📦 Prête',
    'shipped': '🚚 Envoyée',
    'delivered': '✅ Livrée',
    'issue': '⚠️ Problème signalé',
    'cancelled': '❌ Annulée'
  };

  ordersContainer.innerHTML = orders.map(order => {
    const supplierName = order.supplier?.businessName || order.supplier?.name || 'Fournisseur inconnu';
    const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR');
    const deliveryDate = order.delivery?.requestedDate ?
      new Date(order.delivery.requestedDate).toLocaleDateString('fr-FR') : 'Non spécifiée';

    return `
      <div class="order-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; background: white;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; flex-wrap: wrap;">
          <div>
            <h3 style="margin: 0 0 0.5rem 0; color: #2c3e50;">Commande ${order.orderNumber}</h3>
            <p style="margin: 0; color: #666;"><strong>Fournisseur:</strong> ${supplierName}</p>
            <p style="margin: 0; color: #666;"><strong>Date:</strong> ${orderDate}</p>
            <p style="margin: 0; color: #666;"><strong>Livraison prévue:</strong> ${deliveryDate}</p>
          </div>
          <div>
            <span style="background: ${statusColors[order.status]}; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9em; white-space: nowrap;">
              ${statusLabels[order.status]}
            </span>
          </div>
        </div>

        <div style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 4px;">
          <h4 style="margin: 0 0 0.5rem 0; color: #2c3e50;">Articles commandés:</h4>
          ${order.items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
              <span>${item.productName || item.product?.name || 'Produit'}</span>
              <span><strong>${item.quantity} ${item.unit}</strong> × ${item.unitPrice.toFixed(2)}€ = ${item.totalPrice.toFixed(2)}€</span>
            </div>
          `).join('')}
          <div style="border-top: 2px solid #ddd; margin-top: 0.5rem; padding-top: 0.5rem; display: flex; justify-content: space-between;">
            <strong>Total:</strong>
            <strong style="color: #27ae60; font-size: 1.2em;">${order.pricing.total.toFixed(2)}€</strong>
          </div>
        </div>

        ${order.notes?.customer ? `
          <div style="margin: 1rem 0; padding: 0.75rem; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
            <strong>Vos notes:</strong> ${order.notes.customer}
          </div>
        ` : ''}

        ${order.notes?.supplier ? `
          <div style="margin: 1rem 0; padding: 0.75rem; background: #d1ecf1; border-left: 4px solid #17a2b8; border-radius: 4px;">
            <strong>Notes du fournisseur:</strong> ${order.notes.supplier}
          </div>
        ` : ''}

        <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
          ${order.status === 'shipped' ? `
            <button onclick="window.confirmDelivery('${order._id}')" style="background-color: #27ae60; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 1em;">
              <i class="fas fa-check-circle"></i> Confirmer la réception
            </button>
            <button onclick="window.reportIssue('${order._id}')" style="background-color: #e74c3c; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 1em;">
              <i class="fas fa-exclamation-triangle"></i> Signaler un problème
            </button>
          ` : ''}
          ${order.status === 'delivered' ? `
            <div style="padding: 0.5rem 1rem; background: #d4edda; border-radius: 4px; color: #155724;">
              <i class="fas fa-check-circle"></i> Réception confirmée le ${order.dates.delivered ? new Date(order.dates.delivered).toLocaleDateString('fr-FR') : ''}
            </div>
          ` : ''}
          ${order.status === 'issue' ? `
            <div style="padding: 0.5rem 1rem; background: #f8d7da; border-radius: 4px; color: #721c24;">
              <i class="fas fa-exclamation-triangle"></i> Problème signalé - Le fournisseur a été informé
            </div>
          ` : ''}
          ${order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'issue' && order.status !== 'shipped' ? `
            <button onclick="window.cancelOrder('${order._id}')" style="background-color: #e74c3c; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 4px; cursor: pointer; font-size: 1em;">
              <i class="fas fa-times"></i> Annuler la commande
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Fonction pour afficher un toast de notification
function showToast(message, type = 'success') {
  const colors = {
    'success': '#27ae60',
    'warning': '#f39c12',
    'error': '#e74c3c',
    'info': '#3498db'
  };
  
  const icons = {
    'success': '✓',
    'warning': '⚠',
    'error': '✕',
    'info': 'ℹ'
  };
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.success};
    color: white;
    padding: 1.2rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
    animation: slideIn 0.3s ease, fadeOut 0.3s ease 4.7s;
    max-width: 400px;
    line-height: 1.4;
  `;
  
  const icon = icons[type] || icons.success;
  toast.innerHTML = `
    <span style="font-size: 1.5rem;">${icon}</span>
    <span>${message}</span>
  `;
  
  // Ajouter les animations CSS si elles n'existent pas
  if (!document.getElementById('order-toast-animations')) {
    const style = document.createElement('style');
    style.id = 'order-toast-animations';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  // Supprimer automatiquement après 5 secondes
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

// Confirmer la réception d'une commande
window.confirmDelivery = async function(orderId) {
  if (!confirm('Confirmez-vous avoir bien reçu cette commande dans de bonnes conditions ?')) {
    return;
  }

  try {
    const response = await fetch(`/api/orders/${orderId}/customer-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 🔐 Envoie automatiquement le cookie
      body: JSON.stringify({
        status: 'delivered'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Réception confirmée et articles ajoutés au stock');
      
      // Afficher un toast avec un message complet
      showToast('✅ Réception confirmée !<br>📦 Les articles ont été ajoutés à votre stock.<br>💡 Consultez l\'onglet "Stock" pour les voir.', 'success');
      
      // Recharger la liste des commandes
      loadCustomerOrders();
      
      // Recharger le stock automatiquement (même si l'onglet n'est pas actif)
      setTimeout(() => {
        if (typeof window.testStock?.loadStockData === 'function') {
          console.log('🔄 Rechargement du stock...');
          window.testStock.loadStockData();
          console.log('✅ Stock rechargé');
        } else {
          console.warn('⚠️ Fonction loadStockData non disponible');
        }
      }, 1000);
    } else {
      const error = await response.json();
      console.error('❌ Erreur:', error);
      showToast(`Erreur: ${error.message || 'Impossible de confirmer la réception'}`, 'error');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    showToast('Erreur lors de la confirmation de réception', 'error');
  }
};

// Signaler un problème avec une commande
window.reportIssue = async function(orderId) {
  const notes = prompt('Décrivez le problème rencontré avec cette commande:');
  if (!notes || notes.trim() === '') {
    return;
  }

  try {
    const response = await fetch(`/api/orders/${orderId}/customer-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 🔐 Envoie automatiquement le cookie
      body: JSON.stringify({
        status: 'issue',
        notes: notes
      })
    });

    if (response.ok) {
      console.log('✅ Problème signalé');
      alert('Problème signalé avec succès. Le fournisseur sera informé.');
      loadCustomerOrders(); // Recharger la liste
    } else {
      const error = await response.json();
      console.error('❌ Erreur:', error);
      alert(`Erreur: ${error.message || 'Impossible de signaler le problème'}`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    alert('Erreur lors du signalement du problème');
  }
};

// Annuler une commande
window.cancelOrder = async function(orderId) {
  if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
    return;
  }

  try {
    const response = await fetch(`/api/orders/${orderId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // 🔐 Envoie automatiquement le cookie
    });

    if (response.ok) {
      console.log('✅ Commande annulée');
      alert('Commande annulée avec succès');
      loadCustomerOrders(); // Recharger la liste
    } else {
      const error = await response.json();
      console.error('❌ Erreur:', error);
      alert(`Erreur: ${error.message || 'Impossible d\'annuler la commande'}`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    alert('Erreur lors de l\'annulation de la commande');
  }
};

// Initialiser le suivi des commandes
export function initOrderTracking() {
  console.log('🔄 Initialisation du suivi des commandes');
  
  // Charger les commandes au chargement de la page
  if (document.getElementById('customer-orders-list')) {
    loadCustomerOrders();
  }
  
  // Bouton de rafraîchissement
  const refreshBtn = document.getElementById('refresh-orders-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadCustomerOrders);
  }
}

