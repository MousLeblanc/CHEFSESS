// client/JS/supplier-common.js
// Fonctions communes pour la gestion des fournisseurs et commandes

let suppliersData = [];
let cart = [];
let currentSupplierId = null;

// ========== GESTION DES FOURNISSEURS ==========

export async function loadSuppliersData() {
  console.log('📦 Chargement des fournisseurs...');
  
  try {
    // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
    console.log('🔑 Token présent:', token ? 'OUI' : 'NON');
    console.log('🔑 Token (premiers caractères):', token ? token.substring(0, 20) + '...' : 'N/A');
    
    const response = await fetch('/api/users/suppliers', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      credentials: 'include' // 🔐 Envoie automatiquement le cookie
    });
    
    console.log('📡 Réponse API status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      suppliersData = result.data || [];
      console.log(`✅ ${suppliersData.length} fournisseurs chargés depuis l'API`);
      renderSuppliersList();
    } else if (response.status === 401) {
      const errorText = await response.text();
      console.error('❌ Non autorisé (401) - Détails:', errorText);
      console.error('🔐 Token invalide ou expiré. Reconnectez-vous.');
      suppliersData = [];
      renderSuppliersList();
      alert('Session expirée. Veuillez vous reconnecter.');
      window.location.href = '/index.html';
    } else {
      const errorText = await response.text();
      console.error(`❌ Erreur ${response.status}:`, errorText);
      suppliersData = [];
      renderSuppliersList();
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des fournisseurs:', error);
    suppliersData = [];
    renderSuppliersList();
  }
}

// Fonction mock supprimée - utilise uniquement les vraies données de l'API

export function renderSuppliersList() {
  console.log('🎨 renderSuppliersList appelé, suppliersData:', suppliersData);
  const suppliersList = document.getElementById('suppliers-list');
  if (!suppliersList) {
    console.error('❌ Élément #suppliers-list NON TROUVÉ dans le DOM !');
    console.log('📍 Éléments disponibles avec "supplier":', document.querySelectorAll('[id*="supplier"]'));
    return;
  }
  console.log('✅ Élément #suppliers-list trouvé:', suppliersList);

  if (suppliersData.length === 0) {
    suppliersList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">Aucun fournisseur disponible</p>';
    return;
  }

  suppliersList.innerHTML = suppliersData.map(supplier => `
    <div class="supplier-card">
      <div class="supplier-header">
        <h3 class="supplier-name">${supplier.businessName || supplier.name}</h3>
        <span class="supplier-status" style="background: #27ae60; color: white; padding: 0.3rem 0.8rem; border-radius: 15px; font-size: 0.85rem;">
          <i class="fas fa-check-circle"></i> Actif
        </span>
      </div>
      
      <div class="supplier-info">
        <div class="supplier-detail">
          <i class="fas fa-envelope"></i>
          <span>${supplier.email}</span>
        </div>
        <div class="supplier-detail">
          <i class="fas fa-tags"></i>
          <span>${supplier.categories ? supplier.categories.join(', ') : 'Non spécifié'}</span>
        </div>
        ${supplier.notes ? `
          <div class="supplier-detail">
            <i class="fas fa-info-circle"></i>
            <span>${supplier.notes}</span>
          </div>
        ` : ''}
      </div>
      
      <div class="supplier-actions">
        <button class="btn-action btn-primary" onclick="window.browseSupplierProductsGlobal('${supplier._id}', '${supplier.businessName || supplier.name}')">
          <i class="fas fa-shopping-bag"></i> Voir le catalogue
        </button>
      </div>
    </div>
  `).join('');

  console.log(`✅ ${suppliersData.length} fournisseurs affichés`);
}

// ========== CATALOGUE DE PRODUITS ==========

export async function browseSupplierProducts(supplierId, supplierName) {
  console.log('🛍️ Consultation du catalogue:', supplierName);
  currentSupplierId = supplierId;
  
  try {
    // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    // Ajouter le token si disponible
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log('🔑 Token présent:', !!token);
    console.log('📡 Appel API:', `/api/products/supplier/${supplierId}`);
    
    const response = await fetch(`/api/products/supplier/${supplierId}`, {
      headers: headers,
      credentials: 'include' // 🔐 Envoie automatiquement le cookie
    });
    
    if (response.ok) {
      const result = await response.json();
      const products = Array.isArray(result) ? result : (result.data || []);
      console.log(`✅ ${products.length} produits chargés`);
      showSupplierCatalogModal(supplierName, products);
    } else {
      console.error(`❌ Erreur API: ${response.status}`);
      alert(`Impossible de charger le catalogue du fournisseur. Erreur: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    alert('Erreur lors du chargement du catalogue. Vérifiez votre connexion.');
  }
};

// Fonction mock supprimée - utilise uniquement les vraies données de l'API

function showSupplierCatalogModal(supplierName, products) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'catalog-modal';
  modal.innerHTML = `
    <div class="modal-content catalog-modal">
      <div class="modal-header">
        <h2><i class="fas fa-store"></i> Catalogue - ${supplierName}</h2>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      </div>
      
      <div class="catalog-filters">
        <input type="text" id="catalog-search" class="form-control" placeholder="Rechercher un produit...">
        <select id="catalog-category" class="form-control">
          <option value="">Toutes les catégories</option>
          ${[...new Set(products.map(p => p.category))].map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        </select>
      </div>
      
      <div class="products-catalog">
        <div class="products-grid" id="products-grid">
          ${renderProducts(products)}
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Filtres
  document.getElementById('catalog-search').addEventListener('input', () => filterProducts(products));
  document.getElementById('catalog-category').addEventListener('change', () => filterProducts(products));
}

function renderProducts(products) {
  if (products.length === 0) {
    return '<div class="empty-catalog"><i class="fas fa-box-open"></i><p>Aucun produit disponible</p></div>';
  }
  
  return products.map(product => {
    const hasPromo = product.promo > 0;
    const promoPrice = hasPromo ? (product.price * (1 - product.promo / 100)).toFixed(2) : product.price.toFixed(2);
    
    // Gestion de l'affichage du stock
    const stock = product.stock !== undefined ? product.stock : 0;
    const stockAlert = product.stockAlert !== undefined ? product.stockAlert : 10;
    
    // Badge simple pour le client (sans quantités exactes)
    let stockBadge = '';
    let isOutOfStock = false;
    
    if (stock === 0) {
      stockBadge = `<span style="background: #e74c3c; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85em; font-weight: 600;">❌ Rupture de stock</span>`;
      isOutOfStock = true;
    } else {
      stockBadge = `<span style="background: #27ae60; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85em; font-weight: 600;">✓ Disponible</span>`;
    }
    
    return `
      <div class="product-card">
        <div class="product-header">
          <h3>${product.name}</h3>
          <div class="product-badges" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            ${hasPromo ? `<span class="promo-badge" style="background: #e74c3c; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85em; font-weight: 600;">-${product.promo}%</span>` : ''}
            ${stockBadge}
          </div>
        </div>
        <div class="product-info">
          <p><strong>Catégorie:</strong> ${product.category}</p>
          <p><strong>Prix:</strong> ${hasPromo ? `<span class="original-price">${product.price.toFixed(2)}€</span> <span class="promo-price">${promoPrice}€</span>` : `${product.price.toFixed(2)}€`}/${product.unit}</p>
          <p><strong>Commande min:</strong> ${product.minOrder} ${product.unit}</p>
          ${product.description ? `<p>${product.description}</p>` : ''}
        </div>
        <div class="product-actions">
          <button class="btn-primary" 
                  onclick="window.orderProductGlobal('${product._id}', '${product.name}', ${hasPromo ? promoPrice : product.price}, '${product.unit}', ${product.minOrder})" 
                  ${isOutOfStock ? 'disabled style="background-color: #ccc; cursor: not-allowed;" title="Rupture de stock"' : ''}>
            <i class="fas fa-cart-plus"></i> ${isOutOfStock ? 'Rupture de stock' : 'Commander'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function filterProducts(allProducts) {
  const searchTerm = document.getElementById('catalog-search').value.toLowerCase();
  const category = document.getElementById('catalog-category').value;
  
  const filtered = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm);
    const matchesCategory = !category || p.category === category;
    return matchesSearch && matchesCategory;
  });
  
  document.getElementById('products-grid').innerHTML = renderProducts(filtered);
}

// ========== SYSTÈME DE PANIER ==========

// Fonction pour afficher un toast (notification temporaire)
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-weight: 500;
    animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s;
  `;
  
  const icon = type === 'success' ? '✓' : '⚠';
  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${icon}</span>
    <span>${message}</span>
  `;
  
  // Ajouter les animations CSS
  const style = document.createElement('style');
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
  
  document.body.appendChild(toast);
  
  // Supprimer automatiquement après 3 secondes
  setTimeout(() => {
    toast.remove();
    style.remove();
  }, 3000);
}

export function orderProduct(productId, productName, price, unit, minOrder) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay order-modal-overlay'; // Ajout classe spécifique
  modal.id = 'order-modal-specific'; // ID unique pour cette modal
  modal.innerHTML = `
    <div class="modal-content order-modal">
      <div class="modal-header">
        <h2><i class="fas fa-shopping-cart"></i> Commander ${productName}</h2>
        <button class="modal-close" onclick="document.getElementById('order-modal-specific').remove()">&times;</button>
      </div>
      
      <form id="order-form">
        <div class="form-group">
          <label>Quantité souhaitée (${unit}) :</label>
          <input type="number" id="order-quantity" class="form-control" min="${minOrder}" value="${minOrder}" required>
          <small>Commande minimum: ${minOrder} ${unit}</small>
        </div>
        
        <div class="order-summary">
          <h3>Résumé</h3>
          <p><strong>Produit:</strong> ${productName}</p>
          <p><strong>Prix unitaire:</strong> ${price}€/${unit}</p>
          <p><strong>Quantité:</strong> <span id="summary-quantity">${minOrder}</span> ${unit}</p>
          <p><strong>Total:</strong> <span id="summary-total">${(price * minOrder).toFixed(2)}</span>€</p>
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn-secondary" onclick="document.getElementById('order-modal-specific').remove()">Annuler</button>
          <button type="button" class="btn-success" onclick="window.addToCartGlobal('${productId}', '${productName}', ${price}, '${unit}', ${minOrder})" style="background: #27ae60;">
            <i class="fas fa-cart-plus"></i> Ajouter au panier
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const quantityInput = document.getElementById('order-quantity');
  quantityInput.addEventListener('input', () => {
    const quantity = parseInt(quantityInput.value) || 0;
    document.getElementById('summary-quantity').textContent = quantity;
    document.getElementById('summary-total').textContent = (price * quantity).toFixed(2);
  });
};

export function addToCart(productId, productName, price, unit, minOrder) {
  const quantityInput = document.getElementById('order-quantity');
  const quantity = parseInt(quantityInput.value) || minOrder;
  
  const existingItemIndex = cart.findIndex(item => item.productId === productId);
  
  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += quantity;
    cart[existingItemIndex].total = cart[existingItemIndex].price * cart[existingItemIndex].quantity;
  } else {
    cart.push({
      productId,
      productName,
      price,
      unit,
      quantity,
      supplierId: currentSupplierId,
      supplierName: getCurrentSupplierName(),
      total: price * quantity
    });
  }
  
  updateCartCount();
  
  // Afficher un toast au lieu d'une alerte
  showToast(`${productName} ajouté au panier !`, 'success');
  
  // Fermer uniquement la modal de commande, pas le catalogue
  const orderModal = document.getElementById('order-modal-specific');
  if (orderModal) {
    orderModal.remove();
  }
};

function getCurrentSupplierName() {
  const supplier = suppliersData.find(s => s._id === currentSupplierId);
  return supplier ? (supplier.businessName || supplier.name) : 'Fournisseur';
}

export function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }
}

// ========== GESTION DU PANIER ET COMMANDES ==========

export function showCart() {
  if (cart.length === 0) {
    showToast('Votre panier est vide', 'error');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + item.total, 0);
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'cart-modal';
  modal.innerHTML = `
    <div class="modal-content order-modal" style="max-width: 800px;">
      <div class="modal-header">
        <h2><i class="fas fa-shopping-cart"></i> Mon Panier</h2>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      </div>
      
      <div style="padding: 2rem;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #ddd;">
              <th style="text-align: left; padding: 0.75rem;">Produit</th>
              <th style="text-align: left; padding: 0.75rem;">Fournisseur</th>
              <th style="text-align: center; padding: 0.75rem;">Quantité</th>
              <th style="text-align: right; padding: 0.75rem;">Prix unitaire</th>
              <th style="text-align: right; padding: 0.75rem;">Total</th>
              <th style="text-align: center; padding: 0.75rem;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${cart.map((item, index) => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 0.75rem;">${item.productName}</td>
                <td style="padding: 0.75rem;">${item.supplierName}</td>
                <td style="text-align: center; padding: 0.75rem;">
                  <input type="number" 
                         value="${item.quantity}" 
                         min="1" 
                         style="width: 60px; padding: 0.25rem; text-align: center;"
                         onchange="window.updateCartItemQuantity(${index}, this.value)">
                  ${item.unit}
                </td>
                <td style="text-align: right; padding: 0.75rem;">${item.price.toFixed(2)}€/${item.unit}</td>
                <td style="text-align: right; padding: 0.75rem; font-weight: bold;">${item.total.toFixed(2)}€</td>
                <td style="text-align: center; padding: 0.75rem;">
                  <button onclick="window.removeFromCart(${index})" 
                          style="background: #e74c3c; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="border-top: 2px solid #ddd;">
              <td colspan="4" style="text-align: right; padding: 1rem; font-weight: bold; font-size: 1.2rem;">Total général:</td>
              <td style="text-align: right; padding: 1rem; font-weight: bold; font-size: 1.2rem; color: #27ae60;">${total.toFixed(2)}€</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin-top: 2rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Date de livraison souhaitée :</label>
          <input type="date" id="cart-delivery-date" class="form-control" required>
        </div>
        
        <div style="margin-top: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Notes pour les fournisseurs :</label>
          <textarea id="cart-notes" class="form-control" rows="3" placeholder="Instructions spéciales..."></textarea>
        </div>
        
        <div class="modal-actions" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
          <button type="button" class="btn-secondary" onclick="window.clearCart()">
            <i class="fas fa-trash"></i> Vider le panier
          </button>
          <button type="button" class="btn-primary" onclick="window.checkoutCart()">
            <i class="fas fa-check"></i> Valider la commande
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  document.getElementById('cart-delivery-date').value = deliveryDate.toISOString().split('T')[0];
}

function updateCartItemQuantity(index, newQuantity) {
  const quantity = parseInt(newQuantity);
  if (quantity > 0) {
    cart[index].quantity = quantity;
    cart[index].total = cart[index].price * quantity;
    updateCartCount();
    document.getElementById('cart-modal').remove();
    showCart();
  }
}

function removeFromCart(index) {
  const item = cart[index];
  cart.splice(index, 1);
  updateCartCount();
  
  if (cart.length === 0) {
    document.getElementById('cart-modal').remove();
    alert(`${item.productName} retiré du panier`);
  } else {
    document.getElementById('cart-modal').remove();
    showCart();
  }
}

function clearCart() {
  if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
    cart = [];
    updateCartCount();
    document.getElementById('cart-modal').remove();
    alert('Panier vidé');
  }
}

async function checkoutCart() {
  if (cart.length === 0) {
    alert('Votre panier est vide');
    return;
  }
  
  const deliveryDate = document.getElementById('cart-delivery-date').value;
  const notes = document.getElementById('cart-notes').value;
  
  if (!deliveryDate) {
    alert('Veuillez sélectionner une date de livraison');
    return;
  }
  
  try {
    // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
    
    // Grouper les articles par fournisseur
    const ordersBySupplier = {};
    cart.forEach(item => {
      if (!ordersBySupplier[item.supplierId]) {
        ordersBySupplier[item.supplierId] = {
          supplier: item.supplierId,
          supplierName: item.supplierName,
          items: [],
          deliveryDate,
          notes
        };
      }
      ordersBySupplier[item.supplierId].items.push({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price
      });
    });
    
    // Créer une commande pour chaque fournisseur
    // IMPORTANT: Seules les collectivités peuvent créer des commandes
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
    if (user.role === 'fournisseur') {
      console.error('❌ Les fournisseurs ne peuvent pas créer de commandes !');
      console.log('🔧 Nettoyage du localStorage et redirection...');
      
      // Nettoyer le localStorage et rediriger
      localStorage.clear();
      alert('❌ Session incorrecte détectée. Nettoyage en cours... Redirection vers la page de connexion.');
      window.location.href = '/index.html';
      return;
    }
    
    console.log(`📡 Création commande - Rôle: ${user.role}, Endpoint: /api/orders`);
    
    const orderPromises = Object.values(ordersBySupplier).map(orderData =>
      fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 🔐 Envoie automatiquement le cookie
        body: JSON.stringify(orderData)
      }).then(async response => {
        const data = await response.json();
        return { ok: response.ok, data, orderData };
      })
    );
    
    const responses = await Promise.all(orderPromises);
    const successCount = responses.filter(r => r.ok).length;
    const failedOrders = responses.filter(r => !r.ok);
    
    if (successCount > 0) {
      // 🎉 Afficher un message de succès détaillé
      let successMessage = `✅ ${successCount} commande(s) passée(s) avec succès !`;
      
      // 📦 Afficher un toast moderne au lieu d'un alert
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 12px;
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 1.1rem;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      toast.innerHTML = `
        <i class="fas fa-check-circle" style="margin-right: 0.5rem;"></i>
        ${successMessage}
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 5000);
      
      cart = [];
      updateCartCount();
      document.getElementById('cart-modal').remove();
    }
    
    // ⚠️ Afficher les erreurs de manière détaillée
    if (failedOrders.length > 0) {
      failedOrders.forEach(failed => {
        const errorMessage = failed.data.message || 'Erreur inconnue';
        
        // Créer un toast d'erreur détaillé
        const errorToast = document.createElement('div');
        errorToast.style.cssText = `
          position: fixed;
          top: 80px;
          right: 20px;
          background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
          color: white;
          padding: 1.5rem 2rem;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.3);
          z-index: 10000;
          max-width: 500px;
          animation: slideIn 0.3s ease;
        `;
        
        // 🎯 Extraire les informations du message d'erreur
        const stockMatch = errorMessage.match(/Disponible:\s*(\d+)\s*(\w+),\s*Demandé:\s*(\d+)\s*(\w+)/);
        const productMatch = errorMessage.match(/Stock insuffisant pour (.+?)\./);
        
        let displayMessage = errorMessage;
        if (stockMatch && productMatch) {
          const available = stockMatch[1];
          const unit = stockMatch[2];
          const requested = stockMatch[3];
          const productName = productMatch[1];
          
          displayMessage = `
            <div style="display: flex; align-items: start; gap: 1rem;">
              <i class="fas fa-exclamation-triangle" style="font-size: 1.8rem; margin-top: 0.2rem;"></i>
              <div>
                <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.5rem;">
                  ⚠️ Stock insuffisant
                </div>
                <div style="font-size: 0.95rem; line-height: 1.6;">
                  <strong>${productName}</strong><br>
                  📦 Disponible : <strong>${available} ${unit}</strong><br>
                  ❌ Demandé : ${requested} ${unit}<br>
                  <br>
                  <em style="opacity: 0.9;">💡 Ajustez votre quantité à ${available} ${unit} ou moins</em>
                </div>
              </div>
            </div>
          `;
        } else {
          displayMessage = `
            <div style="display: flex; align-items: start; gap: 1rem;">
              <i class="fas fa-exclamation-circle" style="font-size: 1.8rem;"></i>
              <div style="line-height: 1.6;">${errorMessage}</div>
            </div>
          `;
        }
        
        errorToast.innerHTML = displayMessage;
        document.body.appendChild(errorToast);
        
        // Retirer après 10 secondes (plus long pour lire les détails)
        setTimeout(() => errorToast.remove(), 10000);
      });
    }
  } catch (error) {
    console.error('Erreur lors de la validation du panier:', error);
    alert('Erreur lors de la validation du panier');
  }
}

async function showMyOrders() {
  try {
    // Fermer toute modal existante
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Déterminer l'endpoint selon le rôle de l'utilisateur
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const endpoint = user.role === 'fournisseur' ? '/api/orders/supplier' : '/api/orders';
    
    console.log(`📋 Chargement des commandes - Rôle: ${user.role}, Endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      credentials: 'include' // 🔐 Envoie automatiquement le cookie
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des commandes');
    }
    
    const result = await response.json();
    const orders = result.data || [];
    
    console.log('📦 Commandes chargées:', orders.length, 'commandes');
    orders.forEach(order => {
      console.log(`  - Commande #${order.orderNumber}: ${order.status} (${order.items.length} articles)`);
    });
    
    // Masquer le badge de notification
    const badge = document.getElementById('orders-update-badge');
    if (badge) {
      badge.style.display = 'none';
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'orders-modal-open'; // Marquer que la modale est ouverte
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 1200px;">
        <div class="modal-header">
          <h2><i class="fas fa-receipt"></i> Mes Commandes</h2>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <button class="btn-secondary" onclick="window.showMyOrders()" style="padding: 0.5rem 1rem;">
              <i class="fas fa-sync-alt"></i> Actualiser
            </button>
            <button class="modal-close" onclick="this.closest('.modal-overlay').remove()" style="background: none; border: none; font-size: 2rem; font-weight: bold; color: #333; cursor: pointer; padding: 0; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center;">&times;</button>
          </div>
        </div>
        
        <div style="padding: 2rem;">
          ${orders.length === 0 ? '<p style="text-align: center; color: #666;">Aucune commande pour le moment</p>' : `
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #ddd;">
                  <th style="text-align: left; padding: 0.75rem;">N° Commande</th>
                  <th style="text-align: left; padding: 0.75rem;">Fournisseur</th>
                  <th style="text-align: left; padding: 0.75rem;">Date</th>
                  <th style="text-align: left; padding: 0.75rem;">Articles</th>
                  <th style="text-align: left; padding: 0.75rem;">Statut</th>
                  <th style="text-align: right; padding: 0.75rem;">Total</th>
                  <th style="text-align: center; padding: 0.75rem;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(order => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 0.75rem; font-weight: 600;">#${order.orderNumber}</td>
                    <td style="padding: 0.75rem;">${order.supplier?.businessName || order.supplier?.name || 'N/A'}</td>
                    <td style="padding: 0.75rem;">${new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style="padding: 0.75rem;">
                      <details style="cursor: pointer;">
                        <summary style="color: #007bff;">${order.items.length} article(s)</summary>
                        <ul style="margin: 0.5rem 0 0 1rem; padding: 0; list-style: none;">
                          ${order.items.map(item => `
                            <li style="padding: 0.25rem 0; font-size: 0.9rem;">
                              • ${item.productName || item.name || 'Article'} - ${item.quantity || 0} x ${(item.unitPrice || item.price || 0).toFixed(2)}€ = ${(item.totalPrice || 0).toFixed(2)}€
                            </li>
                          `).join('')}
                        </ul>
                      </details>
                    </td>
                    <td style="padding: 0.75rem;">
                      <span style="padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.85rem; font-weight: 600;
                                   background: ${order.status === 'pending' ? '#ffc107' : order.status === 'confirmed' ? '#28a745' : order.status === 'delivered' ? '#17a2b8' : '#6c757d'}; 
                                   color: white;">
                        ${order.status === 'pending' ? '⏳ En attente' : order.status === 'confirmed' ? '✅ Confirmée' : order.status === 'delivered' ? '📦 Livrée' : order.status}
                      </span>
                    </td>
                    <td style="text-align: right; padding: 0.75rem; font-weight: bold; font-size: 1.1rem; color: #28a745;">
                      ${(order.pricing?.total || order.items.reduce((sum, item) => sum + (item.totalPrice || (item.unitPrice || item.price || 0) * (item.quantity || 0)), 0)).toFixed(2)}€
                    </td>
                    <td style="text-align: center; padding: 0.75rem;">
                      ${(order.status === 'shipped' || order.status === 'ready') ? `
                        <button onclick="window.confirmDelivery('${order._id}')" style="background-color: #27ae60; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; margin: 0.25rem;">
                          <i class="fas fa-check-circle"></i> Confirmer
                        </button>
                        <button onclick="window.reportIssue('${order._id}')" style="background-color: #e74c3c; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; margin: 0.25rem;">
                          <i class="fas fa-exclamation-triangle"></i> Problème
                        </button>
                      ` : order.status === 'delivered' ? `
                        <span style="color: #27ae60; font-weight: 600;">
                          <i class="fas fa-check-circle"></i> Reçue
                        </span>
                      ` : order.status === 'cancelled' ? `
                        <span style="color: #6c757d; font-weight: 600;">
                          <i class="fas fa-times-circle"></i> Annulée
                        </span>
                      ` : `
                        <span style="color: #6c757d;">
                          En attente
                        </span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  } catch (error) {
    console.error('Erreur lors du chargement des commandes:', error);
    alert('Erreur lors du chargement des commandes');
  }
}

// ========== EXPOSITION GLOBALE DES FONCTIONS ==========
// Exposer les fonctions globalement dès le chargement du module
// pour que les boutons du header (Panier, Mes Commandes) fonctionnent
window.browseSupplierProductsGlobal = browseSupplierProducts;
window.orderProductGlobal = orderProduct;
window.addToCartGlobal = addToCart;
window.showCart = showCart;
window.showMyOrders = showMyOrders;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.checkoutCart = checkoutCart;
window.refreshSuppliers = loadSuppliersData; // Pour le bouton "Actualiser"

// ========== SYSTÈME DE RAFRAÎCHISSEMENT AUTOMATIQUE ==========

let autoRefreshInterval = null;
let lastOrdersCheck = null;

// Vérifier s'il y a des mises à jour de commandes
async function checkOrdersUpdates() {
  try {
    // Déterminer l'endpoint selon le rôle de l'utilisateur
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const endpoint = user.role === 'fournisseur' ? '/api/orders/supplier' : '/api/orders';
    
    console.log(`🔍 Vérification des commandes - Rôle: ${user.role}, Endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      credentials: 'include' // 🔐 Envoie automatiquement le cookie
    });

    if (response.ok) {
      const orders = await response.json();
      
      // Vérifier que orders est bien un tableau
      if (!Array.isArray(orders)) {
        console.warn('⚠️ Format de réponse inattendu pour les commandes');
        return;
      }
      
      const currentCheck = JSON.stringify(orders.map(o => ({ id: o._id, status: o.status })));
      
      // Si c'est la première vérification, on enregistre juste l'état
      if (lastOrdersCheck === null) {
        lastOrdersCheck = currentCheck;
        return;
      }
      
      // Si les commandes ont changé, afficher une notification
      if (currentCheck !== lastOrdersCheck) {
        console.log('🔔 Mise à jour des commandes détectée!');
        showOrderUpdateNotification();
        lastOrdersCheck = currentCheck;
        
        // Si la modale des commandes est ouverte, la rafraîchir
        if (document.getElementById('orders-modal-open')) {
          showMyOrders();
        }
      }
    } else if (response.status === 401) {
      // Erreur 401 = non autorisé (normal si pas connecté)
      // On ne fait rien et on arrête le rafraîchissement automatique
      if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
      }
      return;
    }
  } catch (error) {
    // Ignorer les erreurs réseau silencieusement (l'utilisateur n'est probablement pas connecté)
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
      autoRefreshInterval = null;
    }
  }
}

// Afficher une notification de mise à jour
function showOrderUpdateNotification() {
  // Créer ou mettre à jour le badge de notification
  const badge = document.getElementById('orders-update-badge') || createOrdersUpdateBadge();
  badge.style.display = 'flex';
  
  // Notification toast
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #27ae60;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: slideIn 0.3s ease;
  `;
  toast.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>Vos commandes ont été mises à jour!</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Créer le badge de notification sur le bouton "Mes Commandes"
function createOrdersUpdateBadge() {
  const ordersBtn = document.querySelector('[onclick*="showMyOrders"]');
  if (!ordersBtn) return null;
  
  const badge = document.createElement('span');
  badge.id = 'orders-update-badge';
  badge.style.cssText = `
    position: absolute;
    top: -5px;
    right: -5px;
    background: #e74c3c;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: bold;
    animation: pulse 1s infinite;
  `;
  badge.textContent = '!';
  
  ordersBtn.style.position = 'relative';
  ordersBtn.appendChild(badge);
  
  return badge;
}

// Démarrer le rafraîchissement automatique
export function startAutoRefresh(intervalSeconds = 15) {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
  
  console.log(`🔄 Démarrage du rafraîchissement automatique (toutes les ${intervalSeconds}s)`);
  
  // Première vérification immédiate
  checkOrdersUpdates();
  
  // Puis toutes les X secondes
  autoRefreshInterval = setInterval(checkOrdersUpdates, intervalSeconds * 1000);
}

// Arrêter le rafraîchissement automatique
export function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
    console.log('⏹️ Arrêt du rafraîchissement automatique');
  }
}

// Ajouter les styles CSS pour les animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
`;
document.head.appendChild(style);

// Initialiser le compteur du panier au chargement
updateCartCount();

// Démarrer le rafraîchissement automatique au chargement
startAutoRefresh(5); // Vérifier toutes les 5 secondes (pour mises à jour rapides)

export function initSupplierTab() {
  console.log('🔧 Initialisation de l\'onglet fournisseurs...');
  loadSuppliersData();
  updateCartCount();
  console.log('✅ Onglet fournisseurs initialisé');
}

