// Fonction pour récupérer l'utilisateur connecté (version locale)
function getCurrentUser() {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

console.log('🚀 Chargement de supplier-dashboard.js');

class SupplierDashboard {
    constructor() {
        console.log('🏗️ Construction de SupplierDashboard');
        this.deliveryZones = []; // Zones de livraison temporaires
        this.isDemoMode = false; // Mode démo par défaut
        this.init();
        this.setupEventListeners();
    }

    async init() {
        // TOUJOURS vérifier avec le serveur pour garantir que l'utilisateur est toujours authentifié
        console.log('🔐 Vérification de l\'authentification avec le serveur...');
        
        let user = null;
        try {
            console.log('🔍 Appel /api/auth/me avec credentials: include...');
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 Réponse /api/auth/me:', response.status, response.statusText);
            
            if (response.status === 401) {
                console.error('❌ Session expirée (401 Unauthorized)');
                sessionStorage.removeItem('user');
                // Ne pas rediriger automatiquement, permettre le mode démo
                console.warn('⚠️ Mode démo activé à cause de l\'authentification manquante');
            } else if (response.ok) {
                const data = await response.json();
                console.log('📦 Données reçues:', data);
                user = data?.user || data;
                
                if (user) {
                    // Mettre à jour sessionStorage avec les données du serveur
                    sessionStorage.setItem('user', JSON.stringify(user));
                    console.log('✅ Utilisateur authentifié:', user.name || user.businessName, '- Role:', user.role, '- Roles:', user.roles);
                } else {
                    console.warn('⚠️ Aucun utilisateur dans la réponse');
                }
            } else {
                console.warn('⚠️ Réponse non-OK:', response.status);
                // Essayer de récupérer depuis sessionStorage comme fallback
                user = getCurrentUser();
                if (user) {
                    console.warn('⚠️ Utilisation des données en cache (sessionStorage)');
                }
            }
        } catch (error) {
            console.error('❌ Erreur lors de la vérification de l\'authentification:', error);
            // En cas d'erreur réseau, essayer de récupérer depuis sessionStorage comme fallback
            user = getCurrentUser();
            if (user) {
                console.warn('⚠️ Utilisation des données en cache (sessionStorage) après erreur');
            }
        }
        
        // Vérifier l'authentification et le rôle
        console.log('🔍 Utilisateur connecté:', user);
        console.log('🔍 Type de user:', typeof user);
        console.log('🔍 user.role:', user?.role);
        console.log('🔍 user.roles:', user?.roles);
        
        // Vérifier si l'utilisateur est un fournisseur (vérifier à la fois role et roles)
        // Les fournisseurs ont role='fournisseur' ET/OU roles=['SUPPLIER']
        const isSupplier = user && (
            user.role === 'fournisseur' || 
            (user.roles && (user.roles.includes('fournisseur') || user.roles.includes('SUPPLIER')))
        );
        
        console.log('🔍 isSupplier:', isSupplier);
        
        if (!user) {
            console.error('❌ Aucun utilisateur connecté - Mode démo activé');
            // Mode démo - permettre l'accès même sans authentification
            document.getElementById('business-name').textContent = 'Mode Démo';
            this.isDemoMode = true;
        } else if (!isSupplier) {
            console.error('❌ Rôle incorrect:', user.role, user.roles, 'attendu: fournisseur - Mode démo activé');
            // Mode démo - permettre l'accès même avec le mauvais rôle
            document.getElementById('business-name').textContent = user.businessName || 'Mode Démo';
            this.isDemoMode = true;
        } else {
            console.log('✅ Utilisateur fournisseur connecté:', user.businessName);
            // Afficher le nom de l'entreprise
            document.getElementById('business-name').textContent = user.businessName;
            this.isDemoMode = false;
            
            // Charger le profil fournisseur (inclut les zones de livraison)
            await this.loadSupplierProfile();
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
            // Réinitialiser les champs super promo et à sauver
            document.getElementById('super-promo-active').checked = false;
            document.getElementById('to-save-active').checked = false;
            document.getElementById('super-promo-fields').style.display = 'none';
            document.getElementById('to-save-fields').style.display = 'none';
        });

        // Gestion de l'affichage des champs super promo
        document.getElementById('super-promo-active').addEventListener('change', (e) => {
            const fields = document.getElementById('super-promo-fields');
            fields.style.display = e.target.checked ? 'block' : 'none';
        });

        // Gestion de l'affichage des champs à sauver
        document.getElementById('to-save-active').addEventListener('change', (e) => {
            const fields = document.getElementById('to-save-fields');
            fields.style.display = e.target.checked ? 'block' : 'none';
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

        // Gestion du formulaire de profil
        const addZoneBtn = document.getElementById('add-delivery-zone-btn');
        const profileForm = document.getElementById('supplier-profile-form');
        const cancelProfileBtn = document.getElementById('cancel-profile-btn');

        if (addZoneBtn) {
            addZoneBtn.addEventListener('click', () => this.addDeliveryZone());
        }

        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveSupplierProfile();
            });
        }

        if (cancelProfileBtn) {
            cancelProfileBtn.addEventListener('click', () => {
                this.loadSupplierProfile();
            });
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/supplier/stats', {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
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
                credentials: 'include', // 🍪 Cookie HTTP-Only
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
}
            });

            console.log('📡 Réponse API products/mine:', response.status);

            if (response.ok) {
                const result = await response.json();
                console.log('📦 Données reçues (result):', result);
                console.log('📦 Type de result:', typeof result);
                console.log('📦 result.data:', result.data);
                
                const products = Array.isArray(result) ? result : (result.data || []);
                console.log('✅ Produits finaux:', products);
                console.log('✅ Type de products:', typeof products);
                console.log('✅ Array.isArray(products):', Array.isArray(products));
                console.log('✅ Nombre de produits:', products.length);
                
                this.displayProducts(products);
            } else {
                const errorText = await response.text();
                console.error('❌ Erreur HTTP:', response.status, errorText);
                this.showToast('Erreur lors du chargement des produits', 'error');
            }
        } catch (error) {
            console.error('❌ Erreur chargement produits:', error);
            this.showToast('Erreur lors du chargement des produits', 'error');
        }
    }

    async loadOrders() {
        try {
            const response = await fetch('/api/orders/supplier', {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
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
        
        const superPromoActive = document.getElementById('super-promo-active').checked;
        const toSaveActiveCheckbox = document.getElementById('to-save-active').checked;
        const toSaveActiveSelect = document.getElementById('product-save')?.value === 'true';
        // Utiliser la checkbox en priorité, sinon le select (pour compatibilité)
        const toSaveActive = toSaveActiveCheckbox || toSaveActiveSelect;
        
        // Synchroniser les deux champs
        if (toSaveActiveCheckbox && document.getElementById('product-save')) {
            document.getElementById('product-save').value = 'true';
        } else if (toSaveActiveSelect && document.getElementById('to-save-active')) {
            document.getElementById('to-save-active').checked = true;
        }
        
        console.log('🔔 [handleAddProduct] État des promotions:');
        console.log('   - superPromoActive:', superPromoActive);
        console.log('   - toSaveActive (checkbox):', toSaveActiveCheckbox);
        console.log('   - toSaveActive (select):', toSaveActiveSelect);
        console.log('   - toSaveActive (final):', toSaveActive);
        
        const formData = {
            name: document.getElementById('product-name').value,
            category: document.getElementById('product-category').value,
            price: parseFloat(document.getElementById('product-price').value),
            unit: document.getElementById('product-unit').value,
            deliveryTime: parseInt(document.getElementById('delivery-time').value),
            minOrder: parseInt(document.getElementById('min-order').value),
            description: document.getElementById('product-description').value,
            promo: parseInt(document.getElementById('product-promo').value) || 0,
            saveProduct: toSaveActive, // Synchronisé avec toSave
            superPromo: {
                active: superPromoActive,
                promoPrice: superPromoActive ? parseFloat(document.getElementById('super-promo-price').value) : null,
                promoQuantity: superPromoActive ? parseInt(document.getElementById('super-promo-quantity').value) : null,
                endDate: superPromoActive && document.getElementById('super-promo-end-date').value ? 
                    new Date(document.getElementById('super-promo-end-date').value) : null
            },
            toSave: {
                active: toSaveActive,
                savePrice: toSaveActive ? parseFloat(document.getElementById('to-save-price').value) : null,
                saveQuantity: toSaveActive ? parseInt(document.getElementById('to-save-quantity').value) : null,
                expirationDate: toSaveActive && document.getElementById('to-save-expiration').value ? 
                    new Date(document.getElementById('to-save-expiration').value) : null
            }
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
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
},
                body: JSON.stringify(formData)
            });

            console.log('📡 Réponse reçue:', response.status, response.statusText);

            if (response.ok) {
                this.showToast(isEdit ? 'Produit modifié avec succès' : 'Produit ajouté avec succès', 'success');
                form.classList.remove('show');
                form.reset();
                delete form.dataset.productId;
                
                // Réinitialiser les champs super promo et à sauver
                document.getElementById('super-promo-active').checked = false;
                document.getElementById('to-save-active').checked = false;
                document.getElementById('super-promo-fields').style.display = 'none';
                document.getElementById('to-save-fields').style.display = 'none';
                
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
            
            // Badges de promotion
            const promoBadge = product.promo > 0 ? 
                `<span class="promo-badge" style="background: #3498db; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; margin-right: 0.5rem;">-${product.promo}%</span>` : '';
            
            const superPromoBadge = product.superPromo?.active ? 
                `<span class="super-promo-badge" style="background: #f39c12; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; margin-right: 0.5rem; font-weight: bold;"><i class="fas fa-star"></i> Super Promo</span>` : '';
            
            const toSaveBadge = product.toSave?.active ? 
                `<span class="to-save-badge" style="background: #e74c3c; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; margin-right: 0.5rem; font-weight: bold;"><i class="fas fa-exclamation-triangle"></i> À Sauver</span>` : '';
            
            const saveBadge = product.saveProduct ? 
                `<span class="save-badge" style="background: #95a5a6; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85rem; margin-right: 0.5rem;">Produit à sauver</span>` : '';
            
            // Calcul du prix affiché (priorité: super promo > à sauver > promo normale)
            let priceDisplay = `${product.price}€`;
            if (product.superPromo?.active && product.superPromo.promoPrice) {
                priceDisplay = `<span class="original-price" style="text-decoration: line-through; color: #999;">${product.price}€</span> <span class="promo-price" style="color: #f39c12; font-weight: bold; font-size: 1.2em;">${product.superPromo.promoPrice}€</span>`;
            } else if (product.toSave?.active && product.toSave.savePrice) {
                priceDisplay = `<span class="original-price" style="text-decoration: line-through; color: #999;">${product.price}€</span> <span class="save-price" style="color: #e74c3c; font-weight: bold; font-size: 1.2em;">${product.toSave.savePrice}€</span>`;
            } else if (product.promo > 0) {
                priceDisplay = `<span class="original-price" style="text-decoration: line-through; color: #999;">${product.price}€</span> <span class="promo-price" style="color: #3498db; font-weight: bold;">${finalPrice}€</span>`;
            }

            card.innerHTML = `
                <div class="product-header">
                    <h3>${product.name}</h3>
                    <div class="product-badges" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                        ${superPromoBadge}
                        ${toSaveBadge}
                        ${promoBadge}
                        ${saveBadge}
                    </div>
                </div>
                <div class="product-info">
                    <p><strong>Catégorie:</strong> ${product.category}</p>
                    <p><strong>Prix:</strong> ${priceDisplay}/${product.unit}</p>
                    ${product.superPromo?.active ? `
                        <p style="color: #f39c12; font-weight: bold;"><i class="fas fa-star"></i> Super Promo: ${product.superPromo.promoQuantity || 'N/A'} ${product.unit} disponible(s)</p>
                        ${product.superPromo.endDate ? `<p style="font-size: 0.9em; color: #666;">Jusqu'au ${new Date(product.superPromo.endDate).toLocaleDateString('fr-FR')}</p>` : ''}
                    ` : ''}
                    ${product.toSave?.active ? `
                        <p style="color: #e74c3c; font-weight: bold;"><i class="fas fa-exclamation-triangle"></i> À Sauver: ${product.toSave.saveQuantity || 'N/A'} ${product.unit}</p>
                        ${product.toSave.expirationDate ? `<p style="font-size: 0.9em; color: #666;">Expire le ${new Date(product.toSave.expirationDate).toLocaleDateString('fr-FR')}</p>` : ''}
                    ` : ''}
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

    // ========== GESTION DU PROFIL FOURNISSEUR ==========
    
    async loadSupplierProfile() {
        try {
            console.log('📋 Chargement du profil fournisseur...');
            const response = await fetch('/api/suppliers/me', {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const supplier = data.data;
                
                console.log('✅ Profil chargé:', supplier);
                
                // Remplir le formulaire
                document.getElementById('supplier-name').value = supplier.name || '';
                document.getElementById('supplier-contact').value = supplier.contact || '';
                document.getElementById('supplier-email').value = supplier.email || '';
                document.getElementById('supplier-phone').value = supplier.phone || '';
                document.getElementById('supplier-address-street').value = supplier.address?.street || '';
                document.getElementById('supplier-address-city').value = supplier.address?.city || '';
                document.getElementById('supplier-address-postalCode').value = supplier.address?.postalCode || '';
                document.getElementById('supplier-address-country').value = supplier.address?.country || 'Belgique';
                document.getElementById('supplier-type').value = supplier.type || '';
                document.getElementById('supplier-isBio').checked = supplier.isBio || false;
                document.getElementById('supplier-notes').value = supplier.notes || '';
                
                // Charger les zones de livraison
                this.deliveryZones = supplier.deliveryZones || [];
                this.renderDeliveryZones();
            } else {
                console.error('❌ Erreur lors du chargement du profil');
                this.showToast('Erreur lors du chargement du profil', 'error');
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
            this.showToast('Erreur lors du chargement du profil', 'error');
        }
    }

    addDeliveryZone() {
        // Empêcher l'ajout en mode démo
        if (this.isDemoMode) {
            this.showToast('Veuillez vous connecter pour ajouter des zones de livraison', 'error');
            return;
        }
        
        const city = document.getElementById('new-zone-city').value.trim();
        const postalCode = document.getElementById('new-zone-postalCode').value.trim();
        
        if (!city && !postalCode) {
            this.showToast('Veuillez renseigner au moins une ville ou un code postal', 'error');
            return;
        }

        // Vérifier si la zone existe déjà
        const exists = this.deliveryZones.some(zone => 
            zone.city === city && zone.postalCode === postalCode
        );

        if (exists) {
            this.showToast('Cette zone de livraison existe déjà', 'error');
            return;
        }

        // Ajouter la zone
        this.deliveryZones.push({
            city: city || undefined,
            postalCode: postalCode || undefined
        });

        // Réinitialiser les champs
        document.getElementById('new-zone-city').value = '';
        document.getElementById('new-zone-postalCode').value = '';

        // Re-rendre la liste
        this.renderDeliveryZones();
        this.showToast('Zone de livraison ajoutée', 'success');
    }

    removeDeliveryZone(index) {
        this.deliveryZones.splice(index, 1);
        this.renderDeliveryZones();
        this.showToast('Zone de livraison supprimée', 'success');
    }

    renderDeliveryZones() {
        const container = document.getElementById('delivery-zones-list');
        if (!container) return;

        if (this.deliveryZones.length === 0) {
            container.innerHTML = '<p style="color: #7f8c8d; font-style: italic;">Aucune zone de livraison définie</p>';
            return;
        }

        container.innerHTML = this.deliveryZones.map((zone, index) => {
            const zoneText = zone.postalCode 
                ? `${zone.city || 'Ville'} (${zone.postalCode})`
                : zone.city || 'Code postal ' + zone.postalCode;
            
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 0.5rem;">
                    <span style="font-weight: 500;">
                        <i class="fas fa-map-marker-alt" style="color: #e74c3c; margin-right: 0.5rem;"></i>
                        ${zoneText}
                    </span>
                    <button type="button" class="btn btn-danger" onclick="window.dashboard.removeDeliveryZone(${index})" style="padding: 0.25rem 0.75rem; font-size: 0.85rem;">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            `;
        }).join('');
    }

    async saveSupplierProfile() {
        // Empêcher la sauvegarde en mode démo
        if (this.isDemoMode) {
            this.showToast('Veuillez vous connecter pour sauvegarder les modifications', 'error');
            return;
        }
        
        try {
            console.log('💾 Sauvegarde du profil fournisseur...');
            
            const supplierData = {
                name: document.getElementById('supplier-name').value,
                contact: document.getElementById('supplier-contact').value,
                email: document.getElementById('supplier-email').value,
                phone: document.getElementById('supplier-phone').value,
                address: {
                    street: document.getElementById('supplier-address-street').value,
                    city: document.getElementById('supplier-address-city').value,
                    postalCode: document.getElementById('supplier-address-postalCode').value,
                    country: document.getElementById('supplier-address-country').value
                },
                type: document.getElementById('supplier-type').value,
                isBio: document.getElementById('supplier-isBio').checked,
                notes: document.getElementById('supplier-notes').value,
                deliveryZones: this.deliveryZones
            };

            console.log('📦 Données à sauvegarder:', supplierData);

            const response = await fetch('/api/suppliers/me', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplierData)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Profil sauvegardé:', data);
                this.showToast('Profil mis à jour avec succès', 'success');
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('❌ Erreur:', error);
            this.showToast(error.message || 'Erreur lors de la sauvegarde', 'error');
        }
    }
}

// Fonctions globales pour les boutons d'action
window.editProduct = async function(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`, {
            credentials: 'include', // 🍪 Cookie HTTP-Only
            headers: {
                // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
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
            
            // Super Promo
            const superPromoActive = product.superPromo?.active || false;
            document.getElementById('super-promo-active').checked = superPromoActive;
            document.getElementById('super-promo-fields').style.display = superPromoActive ? 'block' : 'none';
            if (superPromoActive) {
                document.getElementById('super-promo-price').value = product.superPromo.promoPrice || '';
                document.getElementById('super-promo-quantity').value = product.superPromo.promoQuantity || '';
                if (product.superPromo.endDate) {
                    const endDate = new Date(product.superPromo.endDate);
                    document.getElementById('super-promo-end-date').value = endDate.toISOString().split('T')[0];
                }
            }
            
            // À Sauver
            const toSaveActive = product.toSave?.active || false;
            document.getElementById('to-save-active').checked = toSaveActive;
            document.getElementById('to-save-fields').style.display = toSaveActive ? 'block' : 'none';
            if (toSaveActive) {
                document.getElementById('to-save-price').value = product.toSave.savePrice || '';
                document.getElementById('to-save-quantity').value = product.toSave.saveQuantity || '';
                if (product.toSave.expirationDate) {
                    const expDate = new Date(product.toSave.expirationDate);
                    document.getElementById('to-save-expiration').value = expDate.toISOString().split('T')[0];
                }
            }
            
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
            credentials: 'include', // 🍪 Cookie HTTP-Only
            method: 'DELETE',
            headers: {
                // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
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
    window.dashboard = new SupplierDashboard();
}); 