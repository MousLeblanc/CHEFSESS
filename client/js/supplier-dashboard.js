import auth from './auth.js';

class SupplierDashboard {
    constructor() {
        this.init();
        this.setupEventListeners();
    }

    async init() {
        // Vérifier l'authentification et le rôle
        const user = auth.getCurrentUser();
        if (!user || user.role !== 'supplier') {
            window.location.href = 'index.html';
            return;
        }

        // Afficher le nom de l'entreprise
        document.getElementById('business-name').textContent = user.businessName;

        // Charger les données initiales
        await this.loadStats();
        await this.loadProducts();
        await this.loadOrders();
    }

    setupEventListeners() {
        // Gestion du formulaire d'ajout de produit
        const showAddProductBtn = document.getElementById('show-add-product');
        const addProductForm = document.getElementById('add-product-form');
        const cancelAddProductBtn = document.getElementById('cancel-add-product');

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
    }

    async loadStats() {
        try {
            const response = await fetch('localhost:5000/api/supplier/stats', {
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
            const response = await fetch('localhost:5000/api/supplier/products', {
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
            const response = await fetch('localhost:5000/api/supplier/orders', {
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
        const formData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            unit: document.getElementById('product-unit').value,
            deliveryTime: parseInt(document.getElementById('delivery-time').value),
            minOrder: parseInt(document.getElementById('min-order').value)
        };

        try {
            const response = await fetch('localhost:5000/api/supplier/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                this.showToast('Produit ajouté avec succès', 'success');
                document.getElementById('add-product-form').classList.remove('show');
                document.getElementById('add-product-form').reset();
                await this.loadProducts(); // Recharger la liste des produits
            } else {
                const error = await response.json();
                throw new Error(error.message);
            }
        } catch (error) {
            this.showToast(error.message || 'Erreur lors de l\'ajout du produit', 'error');
        }
    }

    displayProducts(products) {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <h3>${product.name}</h3>
                <p><strong>Catégorie:</strong> ${product.category}</p>
                <p><strong>Prix:</strong> ${product.price}€/${product.unit}</p>
                <p><strong>Délai de livraison:</strong> ${product.deliveryTime} jours</p>
                <p><strong>Commande minimum:</strong> ${product.minOrder} ${product.unit}</p>
                <div class="action-buttons">
                    <button class="btn btn-secondary" onclick="editProduct(${product.id})">Modifier</button>
                    <button class="btn btn-secondary" onclick="deleteProduct(${product.id})">Supprimer</button>
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

// Initialiser le tableau de bord
document.addEventListener('DOMContentLoaded', () => {
    new SupplierDashboard();
}); 