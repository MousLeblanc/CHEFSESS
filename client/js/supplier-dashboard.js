// Fonction pour récupérer l'utilisateur connecté (version locale)
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

console.log('🚀 Chargement de supplier-dashboard.js');

class SupplierDashboard {
    constructor() {
        console.log('🏗️ Construction de SupplierDashboard');
        this.init();
        this.setupEventListeners();
    }

    async init() {
        // Vérifier l'authentification et le rôle
        const user = getCurrentUser();
        console.log('🔍 Utilisateur connecté:', user);
        
        if (!user) {
            console.error('❌ Aucun utilisateur connecté - Mode démo activé');
            // Mode démo - permettre l'accès même sans authentification
            document.getElementById('business-name').textContent = 'Mode Démo';
        } else if (user.role !== 'fournisseur') {
            console.error('❌ Rôle incorrect:', user.role, 'attendu: fournisseur - Mode démo activé');
            // Mode démo - permettre l'accès même avec le mauvais rôle
            document.getElementById('business-name').textContent = user.businessName || 'Mode Démo';
        } else {
            console.log('✅ Utilisateur fournisseur connecté:', user.businessName);
            // Afficher le nom de l'entreprise
            document.getElementById('business-name').textContent = user.businessName;
        }

        // Charger les données initiales (même en mode démo)
        await this.loadStats();
        await this.loadProducts();
        await this.loadOrders();
    }

    setupEventListeners() {
        console.log('🎯 Configuration des gestionnaires d\'événements');
        
        // Gestion du formulaire d'ajout de produit
        const showAddProductBtn = document.getElementById('show-add-product');
        const addProductForm = document.getElementById('add-product-form');
        const cancelAddProductBtn = document.getElementById('cancel-add-product');
        
        console.log('🔍 Éléments trouvés:', {
            showAddProductBtn: !!showAddProductBtn,
            addProductForm: !!addProductForm,
            cancelAddProductBtn: !!cancelAddProductBtn
        });

        showAddProductBtn.addEventListener('click', () => {
            addProductForm.classList.add('show');
        });

        cancelAddProductBtn.addEventListener('click', () => {
            addProductForm.classList.remove('show');
            addProductForm.reset();
        });

        addProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleAddProduct(e);
        });

        // Bouton de test direct
        const testDirectBtn = document.getElementById('test-direct-btn');
        if (testDirectBtn) {
            testDirectBtn.addEventListener('click', () => {
                console.log('🧪 Test direct - Affichage du formulaire');
                addProductForm.classList.add('show');
            });
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/supplier/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const stats = await response.json();
                document.getElementById('active-products-count').textContent = stats.activeProducts;
                document.getElementById('pending-orders-count').textContent = stats.pendingOrders;
                document.getElementById('active-clients-count').textContent = stats.activeClients;
            }
        } catch (error) {
            this.showToast('Erreur lors du chargement des statistiques', 'error');
        }
    }

    async loadProducts() {
        try {
            const response = await fetch('/api/products/mine', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const products = await response.json();
                this.displayProducts(products);
            }
        } catch (error) {
            this.showToast('Erreur lors du chargement des produits', 'error');
        }
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/orders/supplier', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const orders = await response.json();
                this.displayOrders(orders);
            }
        } catch (error) {
            this.showToast('Erreur lors du chargement des commandes', 'error');
        }
    }

    async handleAddProduct(e) {
        console.log('🔄 Tentative d\'ajout de produit...');
        
        const formData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            unit: document.getElementById('product-unit').value,
            deliveryTime: parseInt(document.getElementById('delivery-time').value),
            minOrder: parseInt(document.getElementById('min-order').value),
            description: document.getElementById('product-description').value,
            promo: parseInt(document.getElementById('product-promo').value) || 0,
            saveProduct: document.getElementById('product-save').value === 'true'
        };

        console.log('📝 Données du formulaire:', formData);

        const form = document.getElementById('add-product-form');
        const productId = form.dataset.productId;
        const isEdit = !!productId;

        try {
            const url = isEdit ? `/api/products/${productId}` : '/api/products';
            const method = isEdit ? 'PUT' : 'POST';

            console.log(`🌐 Envoi ${method} vers ${url}`);

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            console.log('📡 Réponse reçue:', response.status, response.statusText);

            if (response.ok) {
                this.showToast(isEdit ? 'Produit modifié avec succès' : 'Produit ajouté avec succès', 'success');
                form.classList.remove('show');
                form.reset();
                delete form.dataset.productId;
                
                // Remettre le titre et le bouton par défaut
                document.querySelector('#add-product-form h3').textContent = 'Ajouter un nouveau produit';
                document.querySelector('#add-product-form button[type="submit"]').textContent = 'Ajouter le produit';
                
                await this.loadProducts(); // Recharger la liste des produits
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            this.showToast(error.message || `Erreur lors de ${isEdit ? 'la modification' : 'l\'ajout'} du produit`, 'error');
        }
    }

    displayProducts(products) {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        if (products.length === 0) {
            grid.innerHTML = '<p>Aucun produit enregistré. Ajoutez votre premier produit !</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Calculer le prix avec promotion
            const finalPrice = product.promo > 0 ? 
                (product.price * (1 - product.promo / 100)).toFixed(2) : 
                product.price;
            
            const promoBadge = product.promo > 0 ? 
                `<span class="promo-badge">-${product.promo}%</span>` : '';
            
            const saveBadge = product.saveProduct ? 
                `<span class="save-badge">Produit à sauver</span>` : '';
            
            const priceDisplay = product.promo > 0 ? 
                `<span class="original-price">${product.price}€</span> <span class="promo-price">${finalPrice}€</span>` :
                `${product.price}€`;

            card.innerHTML = `
                <div class="product-header">
                    <h3>${product.name}</h3>
                    <div class="product-badges">
                        ${promoBadge}
                        ${saveBadge}
                    </div>
                </div>
                <div class="product-info">
                    <p><strong>Catégorie:</strong> ${product.category}</p>
                    <p><strong>Prix:</strong> ${priceDisplay}/${product.unit}</p>
                    <p><strong>Délai de livraison:</strong> ${product.deliveryTime} jours</p>
                    <p><strong>Commande minimum:</strong> ${product.minOrder} ${product.unit}</p>
                    ${product.description ? `<p><strong>Description:</strong> ${product.description}</p>` : ''}
                </div>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="editProduct('${product._id}')">Modifier</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product._id}')">Supprimer</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    displayOrders(orders) {
        const list = document.getElementById('orders-list');
        list.innerHTML = '';

        if (orders.length === 0) {
            list.innerHTML = '<p>Aucune commande en cours</p>';
            return;
        }

        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'order-item';
            orderElement.innerHTML = `
                <h3>Commande #${order.id}</h3>
                <p><strong>Client:</strong> ${order.clientName}</p>
                <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                <p><strong>Statut:</strong> ${order.status}</p>
                <p><strong>Total:</strong> ${order.total}€</p>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="updateOrderStatus(${order.id}, 'accepted')">Accepter</button>
                    <button class="btn btn-secondary" onclick="updateOrderStatus(${order.id}, 'rejected')">Refuser</button>
                </div>
            `;
            list.appendChild(orderElement);
        });
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icon = document.createElement('div');
        icon.className = 'toast-icon';
        icon.textContent = type === 'success' ? '✅' : '❌';
        
        const text = document.createElement('div');
        text.className = 'toast-message';
        text.textContent = message;
        
        toast.appendChild(icon);
        toast.appendChild(text);
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    }
}

// Fonctions globales pour les boutons d'action
window.editProduct = async function(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            const product = await response.json();
            // Pré-remplir le formulaire avec les données du produit
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-unit').value = product.unit;
            document.getElementById('delivery-time').value = product.deliveryTime;
            document.getElementById('min-order').value = product.minOrder;
            document.getElementById('product-description').value = product.description || '';
            document.getElementById('product-promo').value = product.promo || 0;
            document.getElementById('product-save').value = product.saveProduct ? 'true' : 'false';
            
            // Afficher le formulaire
            document.getElementById('add-product-form').classList.add('show');
            
            // Changer le titre et le bouton
            document.querySelector('#add-product-form h3').textContent = 'Modifier le produit';
            document.querySelector('#add-product-form button[type="submit"]').textContent = 'Mettre à jour';
            
            // Stocker l'ID pour la mise à jour
            document.getElementById('add-product-form').dataset.productId = productId;
        }
    } catch (error) {
        console.error('Erreur lors du chargement du produit:', error);
    }
};

window.deleteProduct = async function(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            // Recharger la liste des produits
            const dashboard = new SupplierDashboard();
            await dashboard.loadProducts();
            dashboard.showToast('Produit supprimé avec succès', 'success');
        } else {
            throw new Error('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du produit');
    }
};

// Initialiser le tableau de bord
document.addEventListener('DOMContentLoaded', () => {
    new SupplierDashboard();
}); 