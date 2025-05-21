/**
 * ChAIf SES - Module de gestion des fournisseurs
 */


class SupplierManager {
    constructor() {
        this.suppliers = [];
        this.selectedSupplierId = null;
        this.currentProductId = 0;
        this.tempProducts = [];
        
        // Initialisation
        this.loadSuppliers();
        this.initEventListeners();
        this.renderSuppliersList();
    }

    /**
     * Charge les fournisseurs depuis le stockage local
     */
    loadSuppliers() {
        const savedSuppliers = localStorage.getItem('suppliers');
        this.suppliers = savedSuppliers ? JSON.parse(savedSuppliers) : this.getDefaultSuppliers();
        
        // Assigner des IDs aux produits s'ils n'en ont pas
        this.suppliers.forEach(supplier => {
            if (supplier.products) {
                supplier.products.forEach(product => {
                    if (!product.id) {
                        product.id = this.getNextProductId();
                    } else {
                        // Mettre à jour le compteur de produits pour qu'il soit toujours supérieur à l'ID le plus élevé
                        this.currentProductId = Math.max(this.currentProductId, product.id);
                    }
                });
            }
        });
    }

    /**
     * Sauvegarde les fournisseurs dans le stockage local
     */
    saveSuppliers() {
        localStorage.setItem('suppliers', JSON.stringify(this.suppliers));
    }

    /**
     * Initialise les écouteurs d'événements
     */
    initEventListeners() {
        // Bouton d'ajout de fournisseur
        document.getElementById('add-supplier-btn').addEventListener('click', () => {
            this.openSupplierModal();
        });
        
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
        
        // Boutons d'édition et de suppression du fournisseur
        document.getElementById('edit-supplier-btn').addEventListener('click', () => {
            const supplier = this.getSupplierById(this.selectedSupplierId);
            if (supplier) {
                this.openSupplierModal(supplier);
            }
        });
        
        document.getElementById('delete-supplier-btn').addEventListener('click', () => {
            this.openConfirmModal('Êtes-vous sûr de vouloir supprimer ce fournisseur ?', () => {
                this.deleteSupplier(this.selectedSupplierId);
            });
        });
        
        // Formulaire de fournisseur
        document.getElementById('supplier-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSupplierForm();
        });
        
        // Clic sur un fournisseur dans la liste
        document.querySelectorAll('.supplier-item').forEach(item => {
            item.addEventListener('click', () => {
                const supplierId = parseInt(item.dataset.id);
                this.selectSupplier(supplierId);
            });
        });
        
        // Bouton d'ajout de produit
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.openProductModal(null, this.selectedSupplierId);
        });
        
        // Boutons d'édition et de suppression des produits
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.id);
                const product = this.getProductById(this.selectedSupplierId, productId);
                if (product) {
                    this.openProductModal(product, this.selectedSupplierId);
                }
            });
        });
        
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.id);
                this.openConfirmModal('Êtes-vous sûr de vouloir supprimer ce produit ?', () => {
                    this.deleteProduct(this.selectedSupplierId, productId);
                });
            });
        });
        
        // Formulaire de produit
        document.getElementById('product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProductForm();
        });
        
        // Évaluation par étoiles
        document.querySelectorAll('.rating-input .star').forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.currentTarget.dataset.rating);
                this.setRating(rating);
            });
            
            star.addEventListener('mouseenter', (e) => {
                const rating = parseInt(e.currentTarget.dataset.rating);
                this.highlightRating(rating);
            });
            
            star.addEventListener('mouseleave', () => {
                const currentRating = parseInt(document.getElementById('supplier-rating').value);
                this.highlightRating(currentRating);
            });
        });
        
        // Boutons d'annulation
        document.getElementById('cancel-supplier-btn').addEventListener('click', () => {
            this.closeModal('supplier-modal');
        });
        
        document.getElementById('cancel-product-btn').addEventListener('click', () => {
            this.closeModal('product-modal');
        });
        
        document.getElementById('cancel-confirm-btn').addEventListener('click', () => {
            this.closeModal('confirm-modal');
        });
        
        // Fermeture des modales
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.currentTarget.closest('.modal');
                this.closeModal(modal.id);
            });
        });
    }

    /**
     * Filtre les fournisseurs selon les critères de recherche et de filtres
     */
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

    /**
     * Affiche la liste des fournisseurs
     * @param {Array} suppliers - Liste des fournisseurs à afficher (optionnel)
     */
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
                    <button class="btn-success" id="empty-add-btn">+ Ajouter un fournisseur</button>
                </div>
            `;
            
            document.getElementById('empty-add-btn').addEventListener('click', () => {
                this.openSupplierModal();
            });
            
            // Réinitialiser la section de détails
            this.renderEmptyDetails();
            return;
        }
        
        // Générer la liste des fournisseurs
        suppliersToRender.forEach(supplier => {
            const isActive = supplier.id === this.selectedSupplierId;
            
            const supplierItem = document.createElement('div');
            supplierItem.className = `supplier-item${isActive ? ' active' : ''}`;
            supplierItem.dataset.id = supplier.id;
            
            supplierItem.innerHTML = `
                <div class="supplier-name">${supplier.name}</div>
                <div class="supplier-category">${this.getCategoryName(supplier.category)}</div>
                ${supplier.contact ? `<div class="supplier-contact">${supplier.contact}</div>` : ''}
                <div class="supplier-rating">${this.getStarsHTML(supplier.rating)}</div>
            `;
            
            supplierItem.addEventListener('click', () => {
                this.selectSupplier(supplier.id);
            });
            
            suppliersList.appendChild(supplierItem);
        });
        
        // Si aucun fournisseur n'est sélectionné mais qu'il y en a dans la liste, sélectionner le premier
        if (this.selectedSupplierId === null && suppliersToRender.length > 0) {
            this.selectSupplier(suppliersToRender[0].id);
        } else if (this.selectedSupplierId !== null) {
            // Vérifier si le fournisseur sélectionné fait partie des fournisseurs filtrés
            const selectedSupplierExists = suppliersToRender.some(s => s.id === this.selectedSupplierId);
            if (!selectedSupplierExists && suppliersToRender.length > 0) {
                this.selectSupplier(suppliersToRender[0].id);
            } else if (!selectedSupplierExists) {
                this.renderEmptyDetails();
            }
        }
    }

    /**
     * Affiche un état vide pour les détails du fournisseur
     */
    renderEmptyDetails() {
        const detailsContainer = document.querySelector('.supplier-details');
        
        detailsContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p>Sélectionnez un fournisseur pour voir ses détails</p>
            </div>
        `;
        
        this.selectedSupplierId = null;
    }

    /**
     * Sélectionne un fournisseur et affiche ses détails
     * @param {number} supplierId - ID du fournisseur à sélectionner
     */
    selectSupplier(supplierId) {
        this.selectedSupplierId = supplierId;
        
        // Mettre à jour la classe active
        document.querySelectorAll('.supplier-item').forEach(item => {
            if (parseInt(item.dataset.id) === supplierId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // Afficher les détails du fournisseur
        this.renderSupplierDetails();
    }

    /**
     * Affiche les détails du fournisseur sélectionné
     */
    renderSupplierDetails() {
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
        
        // Mettre à jour les détails du fournisseur
        detailsContainer.innerHTML = `
            <div class="supplier-header">
                <div>
                    <h2>${supplier.name}</h2>
                    <div class="supplier-category">${this.getCategoryName(supplier.category)}</div>
                    <div class="supplier-rating">${this.getStarsHTML(supplier.rating)}</div>
                </div>
                <div>
                    <button id="edit-supplier-btn" class="btn-primary">Modifier</button>
                    <button id="delete-supplier-btn" class="btn-danger">Supprimer</button>
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
                <h3>Produits (<span id="products-count">${supplier.products ? supplier.products.length : 0}</span>)</h3>
                <button id="add-product-btn" class="btn-primary">+ Ajouter un produit</button>
                
                ${supplier.products && supplier.products.length > 0 ? `
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Prix</th>
                                <th>Unité</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${supplier.products.map(product => `
                                <tr>
                                    <td>${product.name}</td>
                                    <td>${product.price ? `${product.price.toFixed(2)} €` : '-'}</td>
                                    <td>${product.unit || '-'}</td>
                                    <td>${product.notes || '-'}</td>
                                    <td class="product-actions">
                                        <button class="action-btn edit-product" data-id="${product.id}"><i class="fa">✏️</i></button>
                                        <button class="action-btn delete delete-product" data-id="${product.id}"><i class="fa">🗑️</i></button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p>Aucun produit enregistré pour ce fournisseur</p>'}
            </div>
        `;
        
        // Ré-attacher les écouteurs d'événements
        document.getElementById('edit-supplier-btn').addEventListener('click', () => {
            this.openSupplierModal(supplier);
        });
        
        document.getElementById('delete-supplier-btn').addEventListener('click', () => {
            this.openConfirmModal('Êtes-vous sûr de vouloir supprimer ce fournisseur ?', () => {
                this.deleteSupplier(this.selectedSupplierId);
            });
        });
        
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.openProductModal(null, this.selectedSupplierId);
        });
        
        // Écouteurs pour les actions de produit
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', e => {
                const productId = parseInt(e.currentTarget.dataset.id);
                const product = this.getProductById(this.selectedSupplierId, productId);
                if (product) {
                    this.openProductModal(product, this.selectedSupplierId);
                }
            });
        });
        
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', e => {
                const productId = parseInt(e.currentTarget.dataset.id);
                const product = this.getProductById(this.selectedSupplierId, productId);
                if (product) {
                    this.openConfirmModal(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`, () => {
                        this.deleteProduct(this.selectedSupplierId, productId);
                    });
                }
            });
        });
    }

    /**
     * Ouvre la modal d'ajout/modification de fournisseur
     * @param {Object} supplier - Fournisseur à modifier (null pour un nouveau)
     */
    openSupplierModal(supplier = null) {
        const modal = document.getElementById('supplier-modal');
        const title = modal.querySelector('.modal-title');
        const form = document.getElementById('supplier-form');
        
        // Réinitialiser le formulaire
        form.reset();
        
        // Réinitialiser l'évaluation
        this.setRating(supplier ? supplier.rating : 0);
        
        // Réinitialiser les données temporaires
        this.tempProducts = [];
        
        if (supplier) {
            // Mode modification
            title.textContent = 'Modifier le fournisseur';
            
            // Remplir le formulaire
            document.getElementById('supplier-name').value = supplier.name;
            document.getElementById('supplier-category').value = supplier.category;
            document.getElementById('supplier-contact').value = supplier.contact || '';
            document.getElementById('supplier-phone').value = supplier.phone || '';
            document.getElementById('supplier-email').value = supplier.email || '';
            document.getElementById('supplier-address').value = supplier.address || '';
            document.getElementById('supplier-notes').value = supplier.notes || '';
            
            // Copier les produits
            if (supplier.products) {
                this.tempProducts = JSON.parse(JSON.stringify(supplier.products));
            }
            
            // Stocker l'ID du fournisseur pour la sauvegarde
            form.dataset.supplierId = supplier.id;
        } else {
            // Mode ajout
            title.textContent = 'Ajouter un fournisseur';
            delete form.dataset.supplierId;
        }
        
        // Afficher la modal
        this.openModal('supplier-modal');
    }

    /**
     * Ouvre la modal d'ajout/modification de produit
     * @param {Object} product - Produit à modifier (null pour un nouveau)
     * @param {number} supplierId - ID du fournisseur associé
     */
    openProductModal(product = null, supplierId = null) {
        const modal = document.getElementById('product-modal');
        const title = modal.querySelector('.modal-title');
        const form = document.getElementById('product-form');
        
        // Réinitialiser le formulaire
        form.reset();
        
        if (product) {
            // Mode modification
            title.textContent = 'Modifier le produit';
            
            // Remplir le formulaire
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price || '';
            document.getElementById('product-unit').value = product.unit || 'kg';
            document.getElementById('product-notes').value = product.notes || '';
            
            // Stocker l'ID du produit pour la sauvegarde
            form.dataset.productId = product.id;
        } else {
            // Mode ajout
            title.textContent = 'Ajouter un produit';
            delete form.dataset.productId;
        }
        
        // Stocker l'ID du fournisseur pour la sauvegarde
        form.dataset.supplierId = supplierId;
        
        // Afficher la modal
        this.openModal('product-modal');
    }

    /**
     * Ouvre la modal de confirmation
     * @param {string} message - Message à afficher
     * @param {Function} callback - Fonction à exécuter si confirmé
     */
    openConfirmModal(message, callback) {
        const modal = document.getElementById('confirm-modal');
        const messageEl = modal.querySelector('p');
        const confirmBtn = document.getElementById('confirm-delete-btn');
        
        // Définir le message
        messageEl.textContent = message;
        
        // Définir le callback
        confirmBtn.onclick = () => {
            callback();
            this.closeModal('confirm-modal');
        };
        
        // Afficher la modal
        this.openModal('confirm-modal');
    }

    /**
     * Ouvre une modal
     * @param {string} modalId - ID de la modal à ouvrir
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
    }

    /**
     * Ferme une modal
     * @param {string} modalId - ID de la modal à fermer
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.remove('show');
    }

    /**
     * Enregistre le fournisseur depuis le formulaire
     */
    saveSupplierForm() {
        const form = document.getElementById('supplier-form');
        
        // Récupérer les valeurs
        const name = document.getElementById('supplier-name').value.trim();
        const category = document.getElementById('supplier-category').value;
        const contact = document.getElementById('supplier-contact').value.trim();
        const phone = document.getElementById('supplier-phone').value.trim();
        const email = document.getElementById('supplier-email').value.trim();
        const address = document.getElementById('supplier-address').value.trim();
        const notes = document.getElementById('supplier-notes').value.trim();
        const rating = parseInt(document.getElementById('supplier-rating').value);
        
        // Vérifier les champs obligatoires
        if (!name || !category) {
            this.showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        // Déterminer s'il s'agit d'un ajout ou d'une modification
        const isEdit = form.dataset.supplierId !== undefined;
        
        if (isEdit) {
            // Modification
            const supplierId = parseInt(form.dataset.supplierId);
            const supplierIndex = this.suppliers.findIndex(s => s.id === supplierId);
            
            if (supplierIndex === -1) {
                console.error(`Fournisseur avec l'ID ${supplierId} non trouvé`);
                return;
            }
            
            // Mettre à jour le fournisseur
            this.suppliers[supplierIndex] = {
                ...this.suppliers[supplierIndex],
                name,
                category,
                contact,
                phone,
                email,
                address,
                notes,
                rating,
                products: this.suppliers[supplierIndex].products || []
            };
            
            this.showToast('Fournisseur modifié avec succès', 'success');
        } else {
            // Ajout
            const newSupplier = {
                id: this.getNextSupplierId(),
                name,
                category,
                contact,
                phone,
                email,
                address,
                notes,
                rating,
                products: []
            };
            
            this.suppliers.push(newSupplier);
            this.selectedSupplierId = newSupplier.id;
            
            this.showToast('Fournisseur ajouté avec succès', 'success');
        }
        
        // Sauvegarder et rafraîchir
        this.saveSuppliers();
        this.renderSuppliersList();
        this.renderSupplierDetails();
        
        // Fermer la modal
        this.closeModal('supplier-modal');
    }

    /**
     * Enregistre le produit depuis le formulaire
     */
    saveProductForm() {
        const form = document.getElementById('product-form');
        
        // Récupérer les valeurs
        const name = document.getElementById('product-name').value.trim();
        const priceStr = document.getElementById('product-price').value.trim();
        const price = priceStr ? parseFloat(priceStr) : null;
        const unit = document.getElementById('product-unit').value;
        const notes = document.getElementById('product-notes').value.trim();
        
        // Vérifier les champs obligatoires
        if (!name) {
            this.showToast('Veuillez entrer un nom de produit', 'error');
            return;
        }
        
        // Récupérer l'ID du fournisseur
        const supplierId = parseInt(form.dataset.supplierId);
        const supplier = this.getSupplierById(supplierId);
        
        if (!supplier) {
            console.error(`Fournisseur avec l'ID ${supplierId} non trouvé`);
            return;
        }
        
        // Déterminer s'il s'agit d'un ajout ou d'une modification
        const isEdit = form.dataset.productId !== undefined;
        
        if (isEdit) {
            // Modification
            const productId = parseInt(form.dataset.productId);
            const productIndex = supplier.products.findIndex(p => p.id === productId);
            
            if (productIndex === -1) {
                console.error(`Produit avec l'ID ${productId} non trouvé`);
                return;
            }
            
            // Mettre à jour le produit
            supplier.products[productIndex] = {
                ...supplier.products[productIndex],
                name,
                price,
                unit,
                notes
            };
            
            this.showToast('Produit modifié avec succès', 'success');
        } else {
            // Ajout
            const newProduct = {
                id: this.getNextProductId(),
                name,
                price,
                unit,
                notes
            };
            
            if (!supplier.products) {
                supplier.products = [];
            }
            
            supplier.products.push(newProduct);
            
            this.showToast('Produit ajouté avec succès', 'success');
        }
        
        // Sauvegarder et rafraîchir
        this.saveSuppliers();
        this.renderSupplierDetails();
        
        // Fermer la modal
        this.closeModal('product-modal');
    }

    /**
     * Supprime un fournisseur
     * @param {number} supplierId - ID du fournisseur à supprimer
     */
    deleteSupplier(supplierId) {
        // Supprimer le fournisseur
        this.suppliers = this.suppliers.filter(supplier => supplier.id !== supplierId);
        
        // Réinitialiser la sélection si le fournisseur supprimé était sélectionné
        if (this.selectedSupplierId === supplierId) {
            this.selectedSupplierId = this.suppliers.length > 0 ? this.suppliers[0].id : null;
        }
        
        // Sauvegarder et rafraîchir
        this.saveSuppliers();
        this.renderSuppliersList();
        this.renderSupplierDetails();
        
        this.showToast('Fournisseur supprimé avec succès', 'success');
    }

    /**
     * Supprime un produit
     * @param {number} supplierId - ID du fournisseur
     * @param {number} productId - ID du produit à supprimer
     */
    deleteProduct(supplierId, productId) {
        const supplier = this.getSupplierById(supplierId);
        
        if (supplier && supplier.products) {
            supplier.products = supplier.products.filter(product => product.id !== productId);
            
            // Sauvegarder et rafraîchir
            this.saveSuppliers();
            this.renderSupplierDetails();
            
            this.showToast('Produit supprimé avec succès', 'success');
        }
    }

    /**
     * Définit la valeur d'évaluation et met à jour l'affichage
     * @param {number} rating - Valeur d'évaluation (0-5)
     */
    setRating(rating) {
        document.getElementById('supplier-rating').value = rating;
        this.highlightRating(rating);
    }

    /**
     * Met en évidence les étoiles jusqu'à la valeur spécifiée
     * @param {number} rating - Valeur d'évaluation (0-5)
     */
    highlightRating(rating) {
        const stars = document.querySelectorAll('.rating-input .star');
        
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    /**
     * Récupère un fournisseur par son ID
     * @param {number} id - ID du fournisseur
     * @returns {Object|null} - Fournisseur ou null si non trouvé
     */
    getSupplierById(id) {
        return this.suppliers.find(supplier => supplier.id === id) || null;
    }

    /**
     * Récupère un produit par son ID
     * @param {number} supplierId - ID du fournisseur
     * @param {number} productId - ID du produit
     * @returns {Object|null} - Produit ou null si non trouvé
     */
    getProductById(supplierId, productId) {
        const supplier = this.getSupplierById(supplierId);
        
        if (supplier && supplier.products) {
            return supplier.products.find(product => product.id === productId) || null;
        }
        
        return null;
    }

    /**
     * Génère le HTML pour l'affichage des étoiles
     * @param {number} rating - Valeur d'évaluation (0-5)
     * @returns {string} - HTML des étoiles
     */
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

    /**
     * Obtient le prochain ID de fournisseur disponible
     * @returns {number} - Prochain ID
     */
    getNextSupplierId() {
        return this.suppliers.length > 0 ? 
            Math.max(...this.suppliers.map(s => s.id)) + 1 : 1;
    }

    /**
     * Obtient le prochain ID de produit disponible
     * @returns {number} - Prochain ID
     */
    getNextProductId() {
        this.currentProductId++;
        return this.currentProductId;
    }

    /**
     * Retourne le nom complet de la catégorie
     * @param {string} categoryKey - Clé de la catégorie
     * @returns {string} - Nom de la catégorie
     */
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

    /**
     * Affiche un message toast
     * @param {string} message - Message à afficher
     * @param {string} type - Type de toast ('success', 'error')
     */
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        toast.innerHTML = `
            <div class="toast-icon">${type === 'success' ? '✅' : '❌'}</div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        // Animation d'entrée
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 10);
        
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

    /**
     * Génère des fournisseurs par défaut
     * @returns {Array} - Liste de fournisseurs par défaut
     */
    getDefaultSuppliers() {
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
                        notes: "De saison d'octobre à mars"
                    },
                    {
                        id: 2,
                        name: "Pommes Golden",
                        price: 3.20,
                        unit: "kg",
                        notes: "Lot de 5kg disponible"
                    },
                    {
                        id: 3,
                        name: "Salade Batavia",
                        price: 1.20,
                        unit: "pièce",
                        notes: ""
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
                        notes: "Race Normande, élevage local"
                    },
                    {
                        id: 5,
                        name: "Poulet fermier",
                        price: 9.80,
                        unit: "kg",
                        notes: "Élevé en plein air"
                    }
                ]
            },
            {
                id: 3,
                name: "Vins et Spiritueux Delorme",
                category: "boissons",
                contact: "Marie Delorme",
                phone: "01 45 67 89 10",
                email: "contact@delorme-vins.fr",
                address: "8 rue des Caves\n33000 Bordeaux",
                notes: "Grand choix de vins de Bordeaux et de spiritueux premium. Possibilité de dégustation sur rendez-vous.",
                rating: 4,
                products: [
                    {
                        id: 6,
                        name: "Bordeaux Supérieur 2018",
                        price: 12.50,
                        unit: "bouteille",
                        notes: "Carton de 6 bouteilles"
                    },
                    {
                        id: 7,
                        name: "Champagne Brut",
                        price: 28.90,
                        unit: "bouteille",
                        notes: ""
                    }
                ]
            }
        ];
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    const supplierManager = new SupplierManager();
    
    // Exposer le gestionnaire globalement pour le débogage
    window.supplierManager = supplierManager;
});

// Exporter la classe SupplierManager
export default SupplierManager;