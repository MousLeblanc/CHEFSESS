// client/JS/order-tracking.js
// Fonctions pour le suivi des commandes côté client

// Variable globale pour stocker toutes les commandes
let allOrders = [];
let currentFilter = 'all';

// Charger et afficher les commandes du client
export async function loadCustomerOrders(filterStatus = null) {
  if (filterStatus !== null) {
    currentFilter = filterStatus;
  }
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
      allOrders = result.data || [];
      console.log(`✅ ${allOrders.length} commandes chargées`);
      displayCustomerOrders(allOrders, currentFilter);
      
      // Mettre à jour le badge des commandes en attente
      updateOrdersBadge(allOrders);
      
      // Mettre à jour les compteurs de filtres
      updateFilterCounts(allOrders);
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

// Mettre à jour les compteurs de filtres
function updateFilterCounts(orders) {
  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed' || o.status === 'preparing' || o.status === 'prepared').length,
    ready: orders.filter(o => o.status === 'ready' || o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    issue: orders.filter(o => o.status === 'issue').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  // Mettre à jour les badges des filtres
  Object.keys(counts).forEach(status => {
    const badge = document.querySelector(`[data-filter="${status}"] .filter-count`);
    if (badge) {
      badge.textContent = counts[status];
    }
  });
  
  // Mettre à jour le bouton actif
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === currentFilter) {
      btn.classList.add('active');
    }
  });
  
  // Afficher le nombre de commandes filtrées
  const ordersCount = document.getElementById('orders-count');
  if (ordersCount) {
    const filtered = currentFilter === 'all' ? orders.length : 
                    currentFilter === 'confirmed' ? counts.confirmed :
                    currentFilter === 'ready' ? counts.ready :
                    counts[currentFilter] || 0;
    ordersCount.textContent = `${filtered} commande(s) ${currentFilter !== 'all' ? 'dans ce filtre' : 'au total'}`;
  }
}

// Mettre à jour le badge des commandes en attente
function updateOrdersBadge(orders) {
  // Compter les commandes qui nécessitent une action (ready ou shipped)
  const pendingConfirmation = orders.filter(order => 
    order.status === 'ready' || order.status === 'shipped'
  ).length;
  
  // Trouver tous les boutons "Mes Commandes" (peut y en avoir plusieurs selon la page)
  const orderButtons = document.querySelectorAll('[onclick*="showMyOrders"]');
  
  orderButtons.forEach(button => {
    // Chercher ou créer le badge
    let badge = button.querySelector('.orders-badge');
    
    if (pendingConfirmation > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'orders-badge';
        badge.style.cssText = `
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(231, 76, 60, 0.4);
          animation: pulse 2s ease-in-out infinite;
        `;
        
        // Ajouter l'animation pulse si elle n'existe pas
        if (!document.getElementById('orders-badge-animation')) {
          const style = document.createElement('style');
          style.id = 'orders-badge-animation';
          style.textContent = `
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          `;
          document.head.appendChild(style);
        }
        
        // Ajouter position relative au bouton parent si nécessaire
        if (getComputedStyle(button).position === 'static') {
          button.style.position = 'relative';
        }
        
        button.appendChild(badge);
      }
      badge.textContent = pendingConfirmation;
      badge.style.display = 'flex';
    } else if (badge) {
      badge.style.display = 'none';
    }
  });
  
  console.log(`📊 Badge mis à jour: ${pendingConfirmation} commande(s) à confirmer`);
}

// Afficher les commandes
function displayCustomerOrders(orders, filterStatus = 'all') {
  const ordersContainer = document.getElementById('customer-orders-list');
  if (!ordersContainer) return;

  console.log(`📊 Affichage de ${orders.length} commande(s) - Filtre: ${filterStatus}`);

  if (orders.length === 0) {
    ordersContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Aucune commande passée</p>';
    return;
  }

  // Filtrer les commandes selon le statut sélectionné
  let filteredOrders = orders;
  if (filterStatus !== 'all') {
    if (filterStatus === 'confirmed') {
      // Grouper confirmed, preparing, prepared
      filteredOrders = orders.filter(order => 
        order.status === 'confirmed' || order.status === 'preparing' || order.status === 'prepared'
      );
    } else if (filterStatus === 'ready') {
      // Grouper ready et shipped
      filteredOrders = orders.filter(order => 
        order.status === 'ready' || order.status === 'shipped'
      );
    } else {
      filteredOrders = orders.filter(order => order.status === filterStatus);
    }
  }

  console.log(`📊 ${filteredOrders.length} commande(s) après filtrage`);

  if (filteredOrders.length === 0) {
    ordersContainer.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">Aucune commande trouvée avec ce filtre</p>';
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

  ordersContainer.innerHTML = filteredOrders.map(order => {
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
          ${(order.status === 'shipped' || order.status === 'ready') ? `
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
      @keyframes slideInRight {
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
  const confirmMessage = `✅ Confirmez-vous avoir bien reçu cette commande dans de bonnes conditions ?\n\n📦 Les articles seront automatiquement ajoutés à votre stock.\n💡 Consultez l'onglet "Stock" pour les voir.`;
  
  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    // Récupérer le siteId depuis sessionStorage pour l'envoyer au serveur
    const storedSiteId = sessionStorage.getItem('currentSiteId');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userSiteId = user?.siteId;
    const siteIdToSend = storedSiteId || userSiteId;
    
    const requestBody = {
      status: 'delivered'
    };
    
    if (siteIdToSend) {
      requestBody.siteId = siteIdToSend;
      console.log('📤 Envoi du siteId pour confirmation de réception:', siteIdToSend);
    }
    
    // 🔒 Utiliser fetchWithCSRF pour la protection CSRF
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
    
    const response = await fetchFn(`/api/orders/${orderId}/customer-status${siteIdToSend ? `?siteId=${siteIdToSend}` : ''}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 🔐 Envoie automatiquement le cookie
      body: JSON.stringify(requestBody)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Réception confirmée et articles ajoutés au stock');
      
      // Afficher un toast de succès amélioré
      const successToast = document.createElement('div');
      successToast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60, #2ecc71);
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(39, 174, 96, 0.4);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.5s ease, fadeOut 0.5s ease 5.5s;
      `;
      successToast.innerHTML = `
        <div style="display: flex; align-items: start; gap: 1rem;">
          <i class="fas fa-check-circle" style="font-size: 2rem; margin-top: 0.2rem;"></i>
          <div>
            <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 0.5rem;">Réception confirmée !</div>
            <div style="font-size: 0.95rem; line-height: 1.5; opacity: 0.95;">
              📦 Les articles ont été ajoutés à votre stock<br>
              💡 Consultez l'onglet "Stock" pour les voir
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(successToast);
      setTimeout(() => successToast.remove(), 6000);
      
      // Recharger la liste des commandes
      loadCustomerOrders();
      
      // 🔄 Rafraîchir aussi la modale "Mes Commandes" si elle est ouverte
      if (document.getElementById('orders-modal-open')) {
        console.log('🔄 Rafraîchissement de la modale "Mes Commandes"...');
        if (typeof window.showMyOrders === 'function') {
          setTimeout(() => {
            window.showMyOrders();
          }, 800); // Délai pour laisser le temps au backend de sauvegarder
        }
      }
      
      // 🔄 Rafraîchir automatiquement le stock après ajout depuis commande
      setTimeout(() => {
        console.log('🔄 Rafraîchissement automatique du stock après ajout depuis commande...');
        
        // Essayer d'utiliser loadStockData depuis stock-common.js (disponible globalement)
        if (typeof window.loadStockData === 'function') {
          console.log('✅ Appel de window.loadStockData()');
          window.loadStockData().catch(err => {
            console.error('❌ Erreur lors du rafraîchissement du stock:', err);
          });
        } else {
          console.log('⚠️ window.loadStockData() non disponible, tentative avec le bouton actualiser...');
          
          // Essayer de cliquer sur le bouton actualiser du stock
          const refreshStockBtn = document.getElementById('refresh-stock-btn');
          if (refreshStockBtn) {
            refreshStockBtn.click();
            console.log('✅ Bouton actualiser du stock cliqué');
          } else {
            console.warn('⚠️ Bouton refresh-stock-btn non trouvé');
            // Dernière tentative : forcer un rechargement via fetch direct
            console.log('🔄 Tentative de rechargement direct du stock...');
            fetch('/api/stock', {
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              },
              credentials: 'include'
            }).then(response => {
              if (response.ok) {
                console.log('✅ Stock rechargé directement via fetch');
                // Si l'onglet Stock est actif, déclencher un événement pour forcer le rechargement
                const stockTab = document.querySelector('[data-tab="stock"]');
                if (stockTab && stockTab.classList.contains('active')) {
                  console.log('✅ Onglet Stock actif, déclenchement du rechargement...');
                  // Déclencher un événement personnalisé pour forcer le rechargement
                  window.dispatchEvent(new CustomEvent('stockNeedsRefresh'));
                }
              }
            }).catch(err => {
              console.error('❌ Erreur lors du rechargement direct du stock:', err);
            });
          }
        }
      }, 1500); // Délai de 1.5 secondes pour laisser le backend sauvegarder
      
      // 🔄 Recharger automatiquement la page avec un hard refresh après 8 secondes
      // (augmenté pour laisser le temps de voir la mise à jour dans la modale)
      setTimeout(() => {
        console.log('🔄 Rechargement automatique (hard refresh) pour actualiser le stock...');
        // Ne rafraîchir que si la modale n'est pas ouverte, pour éviter de fermer la modale pendant que l'utilisateur la consulte
        if (!document.getElementById('orders-modal-open')) {
          window.location.href = window.location.href.split('?')[0] + '?refresh=' + Date.now();
        } else {
          console.log('⏸️ Rafraîchissement différé - la modale des commandes est ouverte');
        }
      }, 8000);
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
    // Récupérer le siteId depuis sessionStorage pour l'envoyer au serveur
    const storedSiteId = sessionStorage.getItem('currentSiteId');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userSiteId = user?.siteId;
    const siteIdToSend = storedSiteId || userSiteId;
    
    const requestBody = {
      status: 'issue',
      notes: notes
    };
    
    if (siteIdToSend) {
      requestBody.siteId = siteIdToSend;
      console.log('📤 Envoi du siteId pour signalement de problème:', siteIdToSend);
    }
    
    // 🔒 Utiliser fetchWithCSRF pour la protection CSRF
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
    
    const response = await fetchFn(`/api/orders/${orderId}/customer-status${siteIdToSend ? `?siteId=${siteIdToSend}` : ''}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 🔐 Envoie automatiquement le cookie
      body: JSON.stringify(requestBody)
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
    // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

    const response = await fetchFn(`/api/orders/${orderId}/cancel`, {
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

// Charger les commandes en arrière-plan pour le badge
export async function loadOrdersBadgeOnly() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const endpoint = user.role === 'fournisseur' ? '/api/orders/supplier' : '/api/orders';
    
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      credentials: 'include'
    });

    if (response.ok) {
      const result = await response.json();
      const orders = result.data || [];
      updateOrdersBadge(orders);
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement du badge des commandes:', error);
  }
}

// Initialiser le suivi des commandes
export function initOrderTracking() {
  console.log('🔄 Initialisation du suivi des commandes');
  
  // Charger les commandes au chargement de la page
  if (document.getElementById('customer-orders-list')) {
    loadCustomerOrders();
  }
  
  // Charger le badge immédiatement
  loadOrdersBadgeOnly();
  
  // Actualiser le badge toutes les 30 secondes
  setInterval(loadOrdersBadgeOnly, 30000);
  
  // Bouton de rafraîchissement
  const refreshBtn = document.getElementById('refresh-orders-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadCustomerOrders);
  }
}

