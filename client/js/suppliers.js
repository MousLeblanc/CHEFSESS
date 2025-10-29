/**
 * ChAIf SES - Module de gestion des fournisseurs pour RESTAURANTS
 * Permet aux restaurants de voir les fournisseurs et passer des commandes
 */

class RestaurantSupplierManager {
    constructor() {
        this.suppliers = [];
        this.selectedSupplierId = null;
        this.currentOrder = {
            supplierId: null,
            items: [],
            notes: ''
        };
        this.cart = []; // Panier multi-fournisseurs
        
        // Initialisation
        this.init();
    }

    async init() {
        // Vérifier l'authentification et le rôle
        const user = JSON.parse(sessionStorage.getItem('user') || 'null');
        if (!user || (user.role !== 'resto' && user.role !== 'collectivite')) {
            window.location.href = 'index.html';
            return;
        }

        this.loadSuppliers();
        this.initEventListeners();
    }

    initEventListeners() {
        // Recherche et filtres
        document.getElementById('supplier-search').addEventListener('input', () => {
            this.filterSuppliers();
        });
        
        document.getElementById('category-filter').addEventListener('change', () => {
            this.filterSuppliers();
        });
        
        document.getElementById('rating-filter').addEventListener('change', () => {
            this.filterSuppliers();
        });

        // Bouton de déconnexion
        document.querySelector('.logout-btn').addEventListener('click', () => {
            // 🍪 Token supprimé via cookie (géré par le backend)
            sessionStorage.removeItem('user');
            localStorage.removeItem('chaif-ses-session-start');
            window.location.href = 'index.html';
        });

        // Modal de commande
        document.getElementById('cancel-order-btn').addEventListener('click', () => {
            this.closeOrderModal();
        });

        document.getElementById('order-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitOrder();
        });

        // Fermeture des modales
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.currentTarget.closest('.modal');
                this.closeModal(modal.id);
            });
        });
    }

    async loadSuppliers() {
        try {
            console.log('🔄 Chargement des fournisseurs depuis l\'API...');
            const response = await fetch('/api/users/suppliers', {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            console.log('📡 Réponse API:', response.status, response.statusText);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Fournisseurs chargés:', data);
                // La réponse de /api/users/suppliers a la structure { success: true, count: X, data: [...] }
                this.suppliers = data.data || data.suppliers || [];
                console.log(`✅ ${this.suppliers.length} fournisseurs trouvés`);
                this.renderSuppliersList();
            } else if (response.status === 401) {
                console.error('❌ Session expirée (401) - Redirection vers login');
                this.showToast('Session expirée. Reconnexion nécessaire.', 'error');
                setTimeout(() => {
                    // 🍪 Token supprimé via cookie (géré par le backend)
                    sessionStorage.removeItem('user');
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                console.error('❌ Erreur API:', response.status, response.statusText);
                this.showToast(`Erreur lors du chargement des fournisseurs (${response.status})`, 'error');
                this.suppliers = [];
                this.renderSuppliersList();
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des fournisseurs:', error);
            this.showToast('Erreur de connexion au serveur', 'error');
            this.suppliers = [];
            this.renderSuppliersList();
        }
    }

    async loadSupplierProducts(supplierId) {
        try {
            console.log('🔄 Chargement des produits du fournisseur ID:', supplierId);
            const response = await fetch(`/api/products/supplier/${supplierId}`, {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            console.log('📡 Réponse produits API:', response.status, response.statusText);

            if (response.ok) {
                const result = await response.json();
                console.log('📡 Réponse de l\'API:', result);
                
                // ✅ L'API retourne { success: true, count: X, data: [...] }
                // On extrait TOUJOURS result.data
                const products = result.data || result || [];
                
                console.log('✅ Produits extraits:', Array.isArray(products), products.length, 'produits');
                console.log('✅ Premier produit:', products[0]);
                
                return products;
            } else {
                console.warn('❌ Erreur lors du chargement des produits:', response.status);
                return [];
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des produits:', error);
            return [];
        }
    }

    filterSuppliers() {
        const searchTerm = document.getElementById('supplier-search').value.toLowerCase();
        const categoryFilter = document.getElementById('category-filter').value;
        const ratingFilter = parseInt(document.getElementById('rating-filter').value);
        
        const filteredSuppliers = this.suppliers.filter(supplier => {
            // Filtre par texte de recherche
            const matchesSearch = supplier.name.toLowerCase().includes(searchTerm) ||
                (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm));
            
            // Filtre par catégorie
            const matchesCategory = !categoryFilter || supplier.category === categoryFilter;
            
            // Filtre par évaluation
            const matchesRating = supplier.rating >= ratingFilter;
            
            return matchesSearch && matchesCategory && matchesRating;
        });
        
        this.renderSuppliersList(filteredSuppliers);
    }

    renderSuppliersList(suppliers = null) {
        const suppliersList = document.querySelector('.suppliers-list');
        const suppliersToRender = suppliers || this.suppliers;
        
        // Vider la liste
        suppliersList.innerHTML = '';
        
        if (suppliersToRender.length === 0) {
            suppliersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <p>Aucun fournisseur trouvé</p>
                </div>
            `;
            this.renderEmptyDetails();
            return;
        }
        
        // Générer la liste des fournisseurs
        suppliersToRender.forEach(supplier => {
            const supplierId = supplier._id || supplier.id;
            const isActive = supplierId === this.selectedSupplierId;
            
            const supplierItem = document.createElement('div');
            supplierItem.className = `supplier-item${isActive ? ' active' : ''}`;
            supplierItem.dataset.id = supplierId;
            
            supplierItem.innerHTML = `
                <div class="supplier-name">${supplier.name}</div>
                <div class="supplier-category">${this.getCategoryName(supplier.category)}</div>
                ${supplier.contact ? `<div class="supplier-contact">${supplier.contact}</div>` : ''}
                <div class="supplier-rating">${this.getStarsHTML(supplier.rating)}</div>
            `;
            
            supplierItem.addEventListener('click', () => {
                this.selectSupplier(supplierId);
            });
            
            suppliersList.appendChild(supplierItem);
        });
        
        // Si aucun fournisseur n'est sélectionné mais qu'il y en a dans la liste, sélectionner le premier
        if (this.selectedSupplierId === null && suppliersToRender.length > 0) {
            this.selectSupplier(suppliersToRender[0]._id || suppliersToRender[0].id);
        }
    }

    selectSupplier(supplierId) {
        this.selectedSupplierId = supplierId;
        
        // Mettre à jour la classe active
        document.querySelectorAll('.supplier-item').forEach(item => {
            // Comparer en string car les IDs MongoDB sont des strings
            if (item.dataset.id === String(supplierId) || parseInt(item.dataset.id) === supplierId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Afficher les détails du fournisseur
        this.renderSupplierDetails();
    }

    async renderSupplierDetails() {
        const detailsContainer = document.querySelector('.supplier-details');
        
        if (this.selectedSupplierId === null) {
            this.renderEmptyDetails();
            return;
        }
        
        const supplier = this.getSupplierById(this.selectedSupplierId);
        
        if (!supplier) {
            console.error(`Fournisseur avec l'ID ${this.selectedSupplierId} non trouvé`);
            this.renderEmptyDetails();
            return;
        }
        
        // Charger les produits du fournisseur
        console.log('🔄 Chargement des produits du fournisseur:', supplier.name);
        console.log('🆔 ID du fournisseur:', supplier._id);
        console.log('📋 Objet fournisseur complet:', supplier);
        const products = await this.loadSupplierProducts(supplier._id);
        console.log('📦 Produits chargés:', products);
        
        // Mettre à jour les détails du fournisseur
        detailsContainer.innerHTML = `
            <div class="supplier-header">
                <div>
                    <h2>${supplier.name}</h2>
                    <div class="supplier-category">${this.getCategoryName(supplier.category)}</div>
                    <div class="supplier-rating">${this.getStarsHTML(supplier.rating)}</div>
                </div>
                <div>
                    <button class="btn btn-success" onclick="restaurantSupplierManager.openOrderModal()">Passer commande</button>
                </div>
            </div>
            
            <div class="supplier-info">
                <div class="contact-info">
                    <div class="info-section">
                        <h3>Contact</h3>
                        ${supplier.contact ? `
                            <div class="info-item">
                                <span class="info-icon">👤</span>
                                <span>${supplier.contact}</span>
                            </div>
                        ` : ''}
                        ${supplier.phone ? `
                            <div class="info-item">
                                <span class="info-icon">📞</span>
                                <span>${supplier.phone}</span>
                            </div>
                        ` : ''}
                        ${supplier.email ? `
                            <div class="info-item">
                                <span class="info-icon">✉️</span>
                                <span>${supplier.email}</span>
                            </div>
                        ` : ''}
                        ${!supplier.contact && !supplier.phone && !supplier.email ? `
                            <p>Aucune information de contact disponible</p>
                        ` : ''}
                    </div>
                </div>
                
                <div class="address-info">
                    <div class="info-section">
                        <h3>Adresse</h3>
                        ${supplier.address ? `
                            <div class="info-item">
                                <span class="info-icon">📍</span>
                                <span>${supplier.address.replace(/\n/g, '<br>')}</span>
                            </div>
                        ` : '<p>Aucune adresse disponible</p>'}
                    </div>
                </div>
            </div>
            
            ${supplier.notes ? `
                <div class="info-section">
                    <h3>Notes</h3>
                    <p>${supplier.notes.replace(/\n/g, '<br>')}</p>
                </div>
            ` : ''}
            
            <div class="products-list">
                <h3>Produits disponibles (<span id="products-count">${products.length}</span>)</h3>
                
                ${products.length > 0 ? `
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Prix</th>
                                <th>Unité</th>
                                <th>Délai</th>
                                <th>Min. commande</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${products.map(product => `
                                <tr>
                                    <td>
                                        <strong>${product.name}</strong>
                                        ${product.description ? `<br><small>${product.description}</small>` : ''}
                                    </td>
                                    <td>${product.price ? `${product.price.toFixed(2)} €` : '-'}</td>
                                    <td>${product.unit || '-'}</td>
                                    <td>${product.deliveryTime ? `${product.deliveryTime} jours` : '-'}</td>
                                    <td>${product.minOrder ? `${product.minOrder} ${product.unit || ''}` : '-'}</td>
                                    <td class="product-actions">
                                        <button class="action-btn order" onclick="restaurantSupplierManager.orderProduct('${product._id}', '${product.name}', ${product.price}, '${product.unit}', ${product.minOrder}, '${supplier._id}', '${supplier.name}')">Commander</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p>Aucun produit disponible pour ce fournisseur</p>'}
            </div>
        `;
    }

    renderEmptyDetails() {
        const detailsContainer = document.querySelector('.supplier-details');
        
        detailsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p>Sélectionnez un fournisseur pour voir ses produits et passer commande</p>
            </div>
        `;
        
        this.selectedSupplierId = null;
    }

    orderProduct(productId, productName, price, unit, minOrder, supplierId, supplierName) {
        console.log('📦 Commande de produit:', productName);
        
        // Créer la modal de commande
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'order-product-modal';
        modal.innerHTML = `
            <div class="modal-content order-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-shopping-cart"></i> Commander ${productName}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                
                <form id="order-product-form">
                    <div class="form-group">
                        <label>Fournisseur :</label>
                        <input type="text" value="${supplierName}" class="form-control" readonly>
                    </div>
                    
                    <div class="form-group">
                        <label>Quantité souhaitée (${unit}) :</label>
                        <input type="number" id="order-quantity" class="form-control" min="${minOrder}" value="${minOrder}" required>
                        <small>Commande minimum: ${minOrder} ${unit}</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Date de livraison souhaitée :</label>
                        <input type="date" id="delivery-date" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label>Notes pour le fournisseur :</label>
                        <textarea id="order-notes" class="form-control" rows="3" placeholder="Instructions spéciales, préférences..."></textarea>
                    </div>
                    
                    <div class="order-summary">
                        <h3>Résumé de la commande</h3>
                        <p><strong>Produit:</strong> ${productName}</p>
                        <p><strong>Prix unitaire:</strong> ${price}€/${unit}</p>
                        <p><strong>Quantité:</strong> <span id="summary-quantity">${minOrder}</span> ${unit}</p>
                        <p><strong>Total:</strong> <span id="summary-total">${(price * minOrder).toFixed(2)}</span>€</p>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
                        <button type="button" class="btn-success" onclick="restaurantSupplierManager.addToCart('${productId}', '${productName}', ${price}, '${unit}', ${minOrder}, '${supplierId}', '${supplierName}')">
                            <i class="fas fa-cart-plus"></i> Ajouter au panier
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-check"></i> Commander maintenant
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Définir la date de livraison par défaut (dans 3 jours)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 3);
        document.getElementById('delivery-date').value = deliveryDate.toISOString().split('T')[0];
        
        // Mettre à jour le résumé quand la quantité change
        const quantityInput = document.getElementById('order-quantity');
        const summaryQuantity = document.getElementById('summary-quantity');
        const summaryTotal = document.getElementById('summary-total');
        
        quantityInput.addEventListener('input', () => {
            const quantity = parseInt(quantityInput.value) || 0;
            summaryQuantity.textContent = quantity;
            summaryTotal.textContent = (price * quantity).toFixed(2);
        });
        
        // Gérer la soumission de la commande
        document.getElementById('order-product-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const quantity = parseInt(quantityInput.value);
            const total = price * quantity;
            
            const orderData = {
                supplier: supplierId,
                items: [{
                    productId: productId,
                    quantity: quantity
                }],
                deliveryDate: document.getElementById('delivery-date').value,
                notes: document.getElementById('order-notes').value
            };
            
            try {
                // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
                const response = await fetch('/api/orders', {
                    credentials: 'include', // 🍪 Cookie HTTP-Only
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
},
                    body: JSON.stringify(orderData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('📦 Commande créée:', result.data);
                    
                    this.showToast(`Commande envoyée à ${supplierName} !`, 'success');
                    alert(`Commande confirmée !\\n\\nNuméro: ${result.data.orderNumber}\\nProduit: ${productName}\\nQuantité: ${quantity} ${unit}\\nTotal: ${total.toFixed(2)}€\\n\\nLe fournisseur recevra votre commande et vous contactera pour confirmer la livraison.`);
                    
                    modal.remove();
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Erreur lors de la création de la commande');
                }
                
            } catch (error) {
                console.error('❌ Erreur lors de la commande:', error);
                this.showToast(`Erreur: ${error.message}`, 'error');
            }
        });
    }

    openOrderModal() {
        if (!this.selectedSupplierId) {
            this.showToast('Veuillez sélectionner un fournisseur', 'error');
            return;
        }

        const supplier = this.getSupplierById(this.selectedSupplierId);
        if (!supplier) return;

        // Réinitialiser la commande
        this.currentOrder = {
            supplierId: this.selectedSupplierId,
            items: [],
            notes: ''
        };

        // Remplir les informations du fournisseur
        document.getElementById('supplier-name').value = supplier.name;
        document.getElementById('order-items').innerHTML = '<p>Aucun article ajouté à la commande</p>';
        document.getElementById('order-notes').value = '';

        // Afficher la modal
        this.openModal('order-modal');
    }

    addToOrder(productId) {
        const supplier = this.getSupplierById(this.selectedSupplierId);
        if (!supplier || !supplier.products) return;

        const product = supplier.products.find(p => p.id === productId);
        if (!product) return;

        // Demander la quantité
        const quantity = prompt(`Quantité de "${product.name}" à commander:`, product.minOrder || 1);
        if (!quantity || isNaN(quantity) || quantity <= 0) return;

        const quantityNum = parseInt(quantity);
        
        // Vérifier la quantité minimum
        if (product.minOrder && quantityNum < product.minOrder) {
            this.showToast(`Quantité minimum requise: ${product.minOrder} ${product.unit}`, 'error');
            return;
        }

        // Ajouter à la commande
        const existingItem = this.currentOrder.items.find(item => item.productId === productId);
        if (existingItem) {
            existingItem.quantity += quantityNum;
        } else {
            this.currentOrder.items.push({
                productId: productId,
                name: product.name,
                price: product.price,
                unit: product.unit,
                quantity: quantityNum
            });
        }

        this.updateOrderDisplay();
        this.showToast(`${product.name} ajouté à la commande`, 'success');
    }

    updateOrderDisplay() {
        const orderItemsContainer = document.getElementById('order-items');
        
        if (this.currentOrder.items.length === 0) {
            orderItemsContainer.innerHTML = '<p>Aucun article ajouté à la commande</p>';
            return;
        }

        let total = 0;
        let html = '<h4>Articles de la commande:</h4><table class="products-table"><thead><tr><th>Produit</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th><th>Actions</th></tr></thead><tbody>';
        
        this.currentOrder.items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity} ${item.unit}</td>
                    <td>${item.price.toFixed(2)} €</td>
                    <td>${itemTotal.toFixed(2)} €</td>
                    <td>
                        <button class="action-btn" onclick="restaurantSupplierManager.removeFromOrder(${index})">Supprimer</button>
                    </td>
                </tr>
            `;
        });
        
        html += `</tbody></table><div style="margin-top: 1rem; font-weight: bold; text-align: right;">Total: ${total.toFixed(2)} €</div>`;
        
        orderItemsContainer.innerHTML = html;
    }

    removeFromOrder(index) {
        this.currentOrder.items.splice(index, 1);
        this.updateOrderDisplay();
    }

    async submitOrder() {
        if (this.currentOrder.items.length === 0) {
            this.showToast('Veuillez ajouter au moins un article à la commande', 'error');
            return;
        }

        try {
            const API_BASE = (window.API_BASE || 'http://localhost:5000');
            const orderData = {
                supplierId: this.currentOrder.supplierId,
                items: this.currentOrder.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                })),
                notes: document.getElementById('order-notes').value
            };

            const response = await fetch(`${API_BASE}/api/catalog/orders`, {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
},
                body: JSON.stringify(orderData)
            });

            if (response.ok) {
                const result = await response.json();
                this.showToast('Commande passée avec succès', 'success');
                this.closeOrderModal();
                console.log('Commande créée:', result.order);
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la commande');
            }
        } catch (error) {
            console.error('Erreur lors de la commande:', error);
            this.showToast(error.message || 'Erreur lors de la commande', 'error');
        }
    }

    closeOrderModal() {
        this.closeModal('order-modal');
        this.currentOrder = {
            supplierId: null,
            items: [],
            notes: ''
        };
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }

    getSupplierById(id) {
        return this.suppliers.find(supplier => (supplier._id || supplier.id) === id) || null;
    }

    getCategoryName(categoryKey) {
        const categories = {
            'fruits-legumes': 'Fruits et Légumes',
            'viandes': 'Viandes et Volailles',
            'poissons': 'Poissons et Fruits de mer',
            'epicerie': 'Épicerie',
            'boissons': 'Boissons',
            'autres': 'Autres'
        };
        return categories[categoryKey] || categoryKey;
    }

    getStarsHTML(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                html += '★';
            } else {
                html += '☆';
            }
        }
        return html;
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `
            <div class="toast-icon">${type === 'success' ? '✅' : '❌'}</div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Auto-destruction après 3 secondes
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                if (toast.parentNode) {
                    container.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    getMockSuppliers() {
        return [
            {
                id: 1,
                name: "Primeurs du Marché",
                category: "fruits-legumes",
                contact: "Jean Dupont",
                phone: "01 23 45 67 89",
                email: "contact@primeurs-du-marche.fr",
                address: "12 rue des Maraîchers\n75020 Paris",
                notes: "Livraison les mardis et vendredis. Produits bio disponibles sur commande.",
                rating: 4,
                products: [
                    {
                        id: 1,
                        name: "Carottes Bio",
                        price: 2.50,
                        unit: "kg",
                        deliveryTime: 2,
                        minOrder: 5,
                        description: "De saison d'octobre à mars"
                    },
                    {
                        id: 2,
                        name: "Pommes Golden",
                        price: 3.20,
                        unit: "kg",
                        deliveryTime: 1,
                        minOrder: 3,
                        description: "Lot de 5kg disponible"
                    },
                    {
                        id: 3,
                        name: "Salade Batavia",
                        price: 1.20,
                        unit: "pièce",
                        deliveryTime: 1,
                        minOrder: 10,
                        description: "Fraîche du jour"
                    }
                ]
            },
            {
                id: 2,
                name: "Boucherie Normande",
                category: "viandes",
                contact: "Paul Martin",
                phone: "01 34 56 78 90",
                email: "commandes@boucherie-normande.com",
                address: "45 avenue des Bouchers\n14000 Caen",
                notes: "Commandes 48h à l'avance pour les grosses quantités. Livraison gratuite à partir de 150€.",
                rating: 5,
                products: [
                    {
                        id: 4,
                        name: "Filet de bœuf",
                        price: 32.90,
                        unit: "kg",
                        deliveryTime: 3,
                        minOrder: 1,
                        description: "Race Normande, élevage local"
                    },
                    {
                        id: 5,
                        name: "Poulet fermier",
                        price: 9.80,
                        unit: "kg",
                        deliveryTime: 2,
                        minOrder: 2,
                        description: "Élevé en plein air"
                    }
                ]
            }
        ];
    }

    // ========== SYSTÈME DE PANIER ==========
    
    addToCart(productId, productName, price, unit, minOrder, supplierId, supplierName) {
        const quantityInput = document.getElementById('order-quantity');
        const quantity = parseInt(quantityInput.value) || minOrder;
        
        // Vérifier si le produit est déjà dans le panier
        const existingItemIndex = this.cart.findIndex(item => item.productId === productId);
        
        if (existingItemIndex !== -1) {
            // Augmenter la quantité
            this.cart[existingItemIndex].quantity += quantity;
        } else {
            // Ajouter au panier
            this.cart.push({
                productId,
                productName,
                price,
                unit,
                quantity,
                supplierId,
                supplierName,
                total: price * quantity
            });
        }
        
        this.updateCartCount();
        this.showToast(`${productName} ajouté au panier !`, 'success');
        
        // Fermer la modal
        document.getElementById('order-product-modal').remove();
    }
    
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }
    }
    
    showCart() {
        if (this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'info');
            return;
        }
        
        // Calculer le total
        const total = this.cart.reduce((sum, item) => sum + item.total, 0);
        
        // Créer la modal du panier
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
                            ${this.cart.map((item, index) => `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 0.75rem;">${item.productName}</td>
                                    <td style="padding: 0.75rem;">${item.supplierName}</td>
                                    <td style="text-align: center; padding: 0.75rem;">
                                        <input type="number" 
                                               value="${item.quantity}" 
                                               min="1" 
                                               style="width: 60px; padding: 0.25rem; text-align: center;"
                                               onchange="restaurantSupplierManager.updateCartItemQuantity(${index}, this.value)">
                                        ${item.unit}
                                    </td>
                                    <td style="text-align: right; padding: 0.75rem;">${item.price.toFixed(2)}€/${item.unit}</td>
                                    <td style="text-align: right; padding: 0.75rem; font-weight: bold;">${item.total.toFixed(2)}€</td>
                                    <td style="text-align: center; padding: 0.75rem;">
                                        <button onclick="restaurantSupplierManager.removeFromCart(${index})" 
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
                        <button type="button" class="btn-secondary" onclick="restaurantSupplierManager.clearCart()">
                            <i class="fas fa-trash"></i> Vider le panier
                        </button>
                        <button type="button" class="btn-primary" onclick="restaurantSupplierManager.checkoutCart()">
                            <i class="fas fa-check"></i> Valider la commande
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Définir la date de livraison par défaut (dans 3 jours)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 3);
        document.getElementById('cart-delivery-date').value = deliveryDate.toISOString().split('T')[0];
    }
    
    updateCartItemQuantity(index, newQuantity) {
        const quantity = parseInt(newQuantity);
        if (quantity > 0) {
            this.cart[index].quantity = quantity;
            this.cart[index].total = this.cart[index].price * quantity;
            this.updateCartCount();
            // Recharger la modal du panier
            document.getElementById('cart-modal').remove();
            this.showCart();
        }
    }
    
    removeFromCart(index) {
        const item = this.cart[index];
        this.cart.splice(index, 1);
        this.updateCartCount();
        this.showToast(`${item.productName} retiré du panier`, 'info');
        
        if (this.cart.length === 0) {
            document.getElementById('cart-modal').remove();
        } else {
            // Recharger la modal du panier
            document.getElementById('cart-modal').remove();
            this.showCart();
        }
    }
    
    clearCart() {
        if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
            this.cart = [];
            this.updateCartCount();
            document.getElementById('cart-modal').remove();
            this.showToast('Panier vidé', 'info');
        }
    }
    
    async checkoutCart() {
        if (this.cart.length === 0) {
            this.showToast('Votre panier est vide', 'error');
            return;
        }
        
        const deliveryDate = document.getElementById('cart-delivery-date').value;
        const notes = document.getElementById('cart-notes').value;
        
        if (!deliveryDate) {
            this.showToast('Veuillez sélectionner une date de livraison', 'error');
            return;
        }
        
        // Grouper les articles par fournisseur
        const ordersBySupplier = {};
        this.cart.forEach(item => {
            if (!ordersBySupplier[item.supplierId]) {
                ordersBySupplier[item.supplierId] = {
                    supplierId: item.supplierId,
                    supplierName: item.supplierName,
                    items: []
                };
            }
            ordersBySupplier[item.supplierId].items.push({
                productId: item.productId,
                quantity: item.quantity
            });
        });
        
        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
            const orderResults = [];
            
            // Créer une commande pour chaque fournisseur
            for (const supplierId in ordersBySupplier) {
                const orderGroup = ordersBySupplier[supplierId];
                
                const orderData = {
                    supplier: supplierId,
                    items: orderGroup.items,
                    deliveryDate: deliveryDate,
                    notes: notes
                };
                
                const response = await fetch('/api/orders', {
                    credentials: 'include', // 🍪 Cookie HTTP-Only
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
},
                    body: JSON.stringify(orderData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    orderResults.push({
                        supplierName: orderGroup.supplierName,
                        orderNumber: result.data.orderNumber
                    });
                } else {
                    const error = await response.json();
                    throw new Error(`Erreur pour ${orderGroup.supplierName}: ${error.message}`);
                }
            }
            
            // Afficher le résumé des commandes
            const summary = orderResults.map(order => 
                `✅ ${order.supplierName}: ${order.orderNumber}`
            ).join('\\n');
            
            alert(`Commandes confirmées !\\n\\n${summary}\\n\\nLes fournisseurs recevront vos commandes et vous contacteront pour confirmer la livraison.`);
            
            // Vider le panier
            this.cart = [];
            this.updateCartCount();
            document.getElementById('cart-modal').remove();
            this.showToast('Commandes envoyées avec succès !', 'success');
            
        } catch (error) {
            console.error('❌ Erreur lors de la validation du panier:', error);
            this.showToast(`Erreur: ${error.message}`, 'error');
        }
    }
    
    // ========== SUIVI DES COMMANDES ==========
    
    async showMyOrders() {
        console.log('📋 Affichage de mes commandes...');
        
        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
            const response = await fetch('/api/orders', {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des commandes');
            }
            
            const result = await response.json();
            const orders = result.data || [];
            console.log('✅ Commandes chargées:', orders.length);
            
            this.displayMyOrdersModal(orders);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des commandes:', error);
            this.showToast('Erreur lors du chargement des commandes', 'error');
        }
    }
    
    displayMyOrdersModal(orders) {
        const statusColors = {
            'pending': '#f39c12',
            'confirmed': '#3498db',
            'prepared': '#9b59b6',
            'delivered': '#27ae60',
            'cancelled': '#e74c3c'
        };
        
        const statusLabels = {
            'pending': 'En attente',
            'confirmed': 'Confirmée',
            'prepared': 'Préparée',
            'delivered': 'Livrée',
            'cancelled': 'Annulée'
        };
        
        const statusIcons = {
            'pending': 'fa-clock',
            'confirmed': 'fa-check-circle',
            'prepared': 'fa-box',
            'delivered': 'fa-truck',
            'cancelled': 'fa-times-circle'
        };
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'my-orders-modal';
        modal.innerHTML = `
            <div class="modal-content order-modal" style="max-width: 1000px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2><i class="fas fa-receipt"></i> Mes Commandes</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                
                <div style="padding: 2rem;">
                    ${orders.length === 0 ? `
                        <div style="text-align: center; padding: 3rem; color: #666;">
                            <i class="fas fa-inbox" style="font-size: 4rem; margin-bottom: 1rem; color: #ddd;"></i>
                            <p style="font-size: 1.2rem;">Aucune commande pour le moment</p>
                            <p>Commencez à commander auprès de vos fournisseurs !</p>
                        </div>
                    ` : `
                        <div style="display: grid; gap: 1.5rem;">
                            ${orders.map(order => {
                                const supplierName = order.supplier?.businessName || order.supplier?.name || 'Fournisseur';
                                const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                });
                                const deliveryDate = order.delivery?.requestedDate ? 
                                    new Date(order.delivery.requestedDate).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    }) : 'Non spécifiée';
                                
                                return `
                                    <div style="border: 2px solid ${statusColors[order.status]}; border-radius: 12px; padding: 1.5rem; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #eee;">
                                            <div>
                                                <h3 style="margin: 0 0 0.5rem 0; color: #2c3e50; font-size: 1.3rem;">
                                                    <i class="fas fa-file-invoice"></i> ${order.orderNumber}
                                                </h3>
                                                <p style="margin: 0.25rem 0; color: #666;">
                                                    <i class="fas fa-store"></i> <strong>Fournisseur:</strong> ${supplierName}
                                                </p>
                                                <p style="margin: 0.25rem 0; color: #666;">
                                                    <i class="fas fa-calendar"></i> <strong>Commandé le:</strong> ${orderDate}
                                                </p>
                                                <p style="margin: 0.25rem 0; color: #666;">
                                                    <i class="fas fa-truck"></i> <strong>Livraison prévue:</strong> ${deliveryDate}
                                                </p>
                                            </div>
                                            <div style="text-align: right;">
                                                <span style="background: ${statusColors[order.status]}; color: white; padding: 0.75rem 1.5rem; border-radius: 25px; font-size: 1rem; font-weight: bold; display: inline-flex; align-items: center; gap: 0.5rem;">
                                                    <i class="fas ${statusIcons[order.status]}"></i>
                                                    ${statusLabels[order.status]}
                                                </span>
                                                <div style="margin-top: 1rem; font-size: 1.5rem; font-weight: bold; color: #27ae60;">
                                                    ${order.pricing.total.toFixed(2)}€
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                            <h4 style="margin: 0 0 0.75rem 0; color: #2c3e50;">
                                                <i class="fas fa-box-open"></i> Articles commandés (${order.items.length})
                                            </h4>
                                            <div style="display: grid; gap: 0.5rem;">
                                                ${order.items.map(item => `
                                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: white; border-radius: 4px;">
                                                        <div>
                                                            <strong style="color: #2c3e50;">${item.productName || item.product?.name || 'Produit'}</strong>
                                                            <div style="color: #666; font-size: 0.9em;">
                                                                ${item.quantity} ${item.unit} × ${item.unitPrice.toFixed(2)}€
                                                            </div>
                                                        </div>
                                                        <div style="font-weight: bold; color: #2c3e50; font-size: 1.1em;">
                                                            ${item.totalPrice.toFixed(2)}€
                                                        </div>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                        
                                        ${order.notes?.customer ? `
                                            <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 1rem;">
                                                <strong><i class="fas fa-sticky-note"></i> Vos notes:</strong><br>
                                                ${order.notes.customer}
                                            </div>
                                        ` : ''}
                                        
                                        ${order.status === 'pending' || order.status === 'confirmed' ? `
                                            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                                                <button onclick="restaurantSupplierManager.cancelMyOrder('${order._id}')" 
                                                        style="background: #e74c3c; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 0.5rem;">
                                                    <i class="fas fa-times"></i> Annuler la commande
                                                </button>
                                            </div>
                                        ` : ''}
                                        
                                        ${order.status === 'delivered' ? `
                                            <div style="background: #d4edda; padding: 1rem; border-radius: 8px; border-left: 4px solid #28a745; text-align: center;">
                                                <i class="fas fa-check-circle" style="color: #28a745; font-size: 1.5rem;"></i>
                                                <strong style="color: #155724; margin-left: 0.5rem;">Commande livrée avec succès !</strong>
                                            </div>
                                        ` : ''}
                                        
                                        ${order.status === 'cancelled' ? `
                                            <div style="background: #f8d7da; padding: 1rem; border-radius: 8px; border-left: 4px solid #dc3545; text-align: center;">
                                                <i class="fas fa-times-circle" style="color: #dc3545; font-size: 1.5rem;"></i>
                                                <strong style="color: #721c24; margin-left: 0.5rem;">Commande annulée</strong>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    async cancelMyOrder(orderId) {
        if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
            return;
        }
        
        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'PUT',
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de l\'annulation');
            }
            
            this.showToast('Commande annulée', 'success');
            
            // Fermer et rouvrir la modal
            document.getElementById('my-orders-modal').remove();
            await this.showMyOrders();
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'annulation:', error);
            this.showToast('Erreur lors de l\'annulation de la commande', 'error');
        }
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.restaurantSupplierManager = new RestaurantSupplierManager();
});

// Exporter la classe
export default RestaurantSupplierManager;