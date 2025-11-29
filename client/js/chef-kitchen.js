// client/js/chef-kitchen.js
// Gestion du dashboard chef pour recevoir et gérer les commandes clients

class ChefKitchen {
  constructor() {
    this.orders = [];
    this.refreshInterval = null;
    this.init();
  }

  async init() {
    await this.loadOrders();
    this.setupEventListeners();
    
    // Rafraîchir automatiquement toutes les 5 secondes
    this.refreshInterval = setInterval(() => {
      this.loadOrders();
    }, 5000);
  }

  setupEventListeners() {
    // Filtres par statut
    const filterBtns = document.querySelectorAll('.status-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const status = e.target.dataset.status;
        this.filterByStatus(status);
        
        // Mettre à jour l'état actif
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Bouton refresh manuel
    const refreshBtn = document.getElementById('refresh-orders-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.loadOrders());
    }
  }

  async loadOrders(status = null) {
    try {
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
      const url = status 
        ? `/api/customer-orders/kitchen?status=${status}`
        : '/api/customer-orders/kitchen';
      
      const response = await fetchFn(url, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des commandes');

      const data = await response.json();
      this.orders = data.data || data;
      this.displayOrders(this.orders);
    } catch (error) {
      console.error('Erreur:', error);
      this.showError('Impossible de charger les commandes');
    }
  }

  displayOrders(orders) {
    const container = document.getElementById('orders-container');
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = '<div class="no-orders">Aucune commande en attente</div>';
      return;
    }

    // Grouper par statut
    const grouped = {
      pending: orders.filter(o => o.status === 'pending'),
      preparing: orders.filter(o => o.status === 'preparing'),
      ready: orders.filter(o => o.status === 'ready')
    };

    let html = '';

    // Commandes en attente
    if (grouped.pending.length > 0) {
      html += '<div class="orders-section">';
      html += '<h3 class="section-title pending">⏳ En Attente (' + grouped.pending.length + ')</h3>';
      html += '<div class="orders-grid">';
      grouped.pending.forEach(order => {
        html += this.renderOrderCard(order);
      });
      html += '</div></div>';
    }

    // Commandes en préparation
    if (grouped.preparing.length > 0) {
      html += '<div class="orders-section">';
      html += '<h3 class="section-title preparing">👨‍🍳 En Préparation (' + grouped.preparing.length + ')</h3>';
      html += '<div class="orders-grid">';
      grouped.preparing.forEach(order => {
        html += this.renderOrderCard(order);
      });
      html += '</div></div>';
    }

    // Commandes prêtes
    if (grouped.ready.length > 0) {
      html += '<div class="orders-section">';
      html += '<h3 class="section-title ready">✅ Prêtes (' + grouped.ready.length + ')</h3>';
      html += '<div class="orders-grid">';
      grouped.ready.forEach(order => {
        html += this.renderOrderCard(order);
      });
      html += '</div></div>';
    }

    container.innerHTML = html;

    // Ajouter les event listeners pour les boutons
    this.attachOrderEventListeners();
  }

  renderOrderCard(order) {
    const protein = order.selection?.protein || {};
    const sauce = order.selection?.sauce || {};
    const accompaniment = order.selection?.accompaniment || {};
    
    const restrictions = order.restrictions || {};
    const hasRestrictions = 
      (restrictions.allergies && restrictions.allergies.length > 0) ||
      (restrictions.intolerances && restrictions.intolerances.length > 0) ||
      (restrictions.dietaryRestrictions && restrictions.dietaryRestrictions.length > 0);

    const timeAgo = this.getTimeAgo(order.createdAt);
    
    let html = `<div class="order-card ${order.status}" data-order-id="${order._id}">`;
    html += `<div class="order-header">`;
    html += `<div class="order-info">`;
    html += `<h4>Table ${order.customer?.tableNumber || '?'} - Convive ${order.customer?.guestNumber || 1}</h4>`;
    html += `<span class="order-time">${timeAgo}</span>`;
    html += `</div>`;
    html += `<div class="order-status-badge ${order.status}">${this.getStatusLabel(order.status)}</div>`;
    html += `</div>`;

    html += `<div class="order-content">`;
    html += `<div class="order-selection">`;
    html += `<p><strong>🍗 Protéine:</strong> ${protein.name || 'Non spécifié'}</p>`;
    if (sauce.name) {
      html += `<p><strong>🍯 Sauce:</strong> ${sauce.name}</p>`;
    }
    if (accompaniment.name) {
      html += `<p><strong>🥗 Accompagnement:</strong> ${accompaniment.name}</p>`;
    }
    html += `</div>`;

    if (hasRestrictions) {
      html += `<div class="restrictions-warning">`;
      html += `<strong>⚠️ Restrictions:</strong>`;
      html += `<ul>`;
      if (restrictions.allergies && restrictions.allergies.length > 0) {
        html += `<li><span class="allergy-badge">Allergies:</span> ${restrictions.allergies.join(', ')}</li>`;
      }
      if (restrictions.intolerances && restrictions.intolerances.length > 0) {
        html += `<li><span class="intolerance-badge">Intolérances:</span> ${restrictions.intolerances.join(', ')}</li>`;
      }
      if (restrictions.dietaryRestrictions && restrictions.dietaryRestrictions.length > 0) {
        html += `<li><span class="diet-badge">Régimes:</span> ${restrictions.dietaryRestrictions.join(', ')}</li>`;
      }
      html += `</ul>`;
      if (restrictions.notes) {
        html += `<p class="notes"><em>${restrictions.notes}</em></p>`;
      }
      html += `</div>`;
    }

    html += `</div>`;

    html += `<div class="order-actions">`;
    if (order.status === 'pending') {
      html += `<button class="btn-action btn-start" data-order-id="${order._id}" data-action="preparing">Commencer</button>`;
      html += `<button class="btn-action btn-cancel" data-order-id="${order._id}" data-action="cancelled">Annuler</button>`;
    } else if (order.status === 'preparing') {
      html += `<button class="btn-action btn-ready" data-order-id="${order._id}" data-action="ready">Prêt</button>`;
    } else if (order.status === 'ready') {
      html += `<button class="btn-action btn-served" data-order-id="${order._id}" data-action="served">Servi</button>`;
    }
    html += `</div>`;
    html += `</div>`;

    return html;
  }

  attachOrderEventListeners() {
    const actionBtns = document.querySelectorAll('.btn-action');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const orderId = e.target.dataset.orderId;
        const newStatus = e.target.dataset.action;
        await this.updateOrderStatus(orderId, newStatus);
      });
    });
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
      const response = await fetchFn(`/api/customer-orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour');
      }

      // Recharger les commandes
      await this.loadOrders();
      this.showSuccess(`Statut mis à jour: ${this.getStatusLabel(newStatus)}`);
    } catch (error) {
      console.error('Erreur:', error);
      this.showError(error.message || 'Erreur lors de la mise à jour du statut');
    }
  }

  filterByStatus(status) {
    if (status === 'all') {
      this.loadOrders();
    } else {
      this.loadOrders(status);
    }
  }

  getStatusLabel(status) {
    const labels = {
      pending: 'En attente',
      preparing: 'En préparation',
      ready: 'Prêt',
      served: 'Servi',
      cancelled: 'Annulé'
    };
    return labels[status] || status;
  }

  getTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  }

  showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      errorDiv.className = 'alert alert-danger';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }

  showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'block';
      successDiv.className = 'alert alert-success';
      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 3000);
    }
  }

  destroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.chefKitchen = new ChefKitchen();
  });
} else {
  window.chefKitchen = new ChefKitchen();
}





