// collectivite-dashboard.js
import { logout, getToken, getCurrentUser } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // TOUJOURS vérifier avec le serveur pour garantir que l'utilisateur est toujours authentifié
    console.log('🔐 Vérification de l\'authentification avec le serveur...');
    
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401) {
            console.error('❌ Session expirée, redirection vers login');
            sessionStorage.removeItem('user');
            logout();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const user = data?.user || data;
        
        if (!user || (user.role !== 'collectivite' && user.role !== 'resto' && user.role !== 'admin')) {
            console.error('❌ Utilisateur non autorisé');
            logout();
            return;
        }
        
        // Mettre à jour sessionStorage avec les données du serveur
        sessionStorage.setItem('user', JSON.stringify(user));
        console.log('✅ Utilisateur authentifié:', user.name);
    } catch (error) {
        console.error('❌ Erreur lors de la vérification de l\'authentification:', error);
        // En cas d'erreur réseau, essayer de récupérer depuis sessionStorage comme fallback
        const user = getCurrentUser();
        if (!user || (user.role !== 'collectivite' && user.role !== 'resto' && user.role !== 'admin')) {
            logout();
            return;
        }
        console.warn('⚠️ Utilisation des données en cache (sessionStorage)');
    }

    console.log('🚀 Collectivite Dashboard chargé');

    // Variables globales
    let groupCounter = 1;
    let stockData = [];
    let suppliersData = [];
    let cart = []; // Panier pour les commandes
    
    // Éléments des onglets
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Éléments des groupes d'âges
    const addGroupBtn = document.getElementById('add-group-btn');
    
    // Éléments du stock
    const addStockItemBtn = document.getElementById('add-stock-item-btn');
    const refreshStockBtn = document.getElementById('refresh-stock-btn');
    const stockTableBody = document.getElementById('stock-table-body');
    const stockSearch = document.getElementById('stock-search');
    const stockCategoryFilter = document.getElementById('stock-category-filter');
    
    // Éléments des fournisseurs
    const addSupplierBtn = document.getElementById('add-supplier-btn');
    const refreshSuppliersBtn = document.getElementById('refresh-suppliers-btn');
    const suppliersList = document.getElementById('suppliers-list');
    
    // Gestion des onglets
    function initTabs() {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Retirer la classe active de tous les boutons et contenus
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Ajouter la classe active au bouton cliqué et au contenu correspondant
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
                
                // Charger les données spécifiques à l'onglet
                if (targetTab === 'stock') {
                    loadStockData();
                } else if (targetTab === 'suppliers') {
                    loadSuppliersData();
                }
            });
        });
    }
    
    // Gestion des groupes d'âges
    function initAgeGroups() {
        if (addGroupBtn) {
            addGroupBtn.addEventListener('click', addNewGroup);
        }
    }
    
    function addNewGroup() {
        groupCounter++;
        const newGroup = createGroupElement(groupCounter);
        
        // Insérer le nouveau groupe avant le bouton d'ajout
        addGroupBtn.parentNode.insertBefore(newGroup, addGroupBtn);
    }
    
    function createGroupElement(groupNumber) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'age-group';
        groupDiv.id = `group-${groupNumber}`;
        
        groupDiv.innerHTML = `
            <div class="group-header">
                <h4>Groupe ${groupNumber}</h4>
                <button type="button" class="remove-group-btn" onclick="removeGroup(${groupNumber})" style="background:none; color:#e74c3c; padding:0 5px;">&times;</button>
            </div>
            
            <div class="group-content">
                <div class="form-group">
                    <label>Tranche d'âge :</label>
                    <select name="group-${groupNumber}-age-range" class="form-control">
                        <option value="2.5-5">Maternelle (2,5-5 ans)</option>
                        <option value="6-10">Primaire (6-10 ans)</option>
                        <option value="11-15">Collège (11-15 ans)</option>
                        <option value="16-18">Lycée (16-18 ans)</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Nombre de personnes :</label>
                    <input type="number" name="group-${groupNumber}-count" class="form-control" min="1" placeholder="Ex: 100" value="100">
                </div>
                
                <div class="form-group">
                    <label>Allergies ou régimes :</label>
                    <div class="restrictions-list" id="group-${groupNumber}-restrictions">
                        <div class="restriction-item">
                            <select name="group-${groupNumber}-restriction-type" class="form-control">
                                <option value="">-- Sélectionnez --</option>
                                <option value="vegetarian">Végétarien</option>
                                <option value="vegan">Végétalien</option>
                                <option value="gluten-free">Sans gluten</option>
                                <option value="lactose-free">Sans lactose</option>
                                <option value="nuts-free">Sans fruits à coque</option>
                                <option value="peanuts-free">Sans arachides</option>
                                <option value="eggs-free">Sans œufs</option>
                                <option value="fish-free">Sans poisson</option>
                                <option value="shellfish-free">Sans crustacés</option>
                                <option value="soy-free">Sans soja</option>
                                <option value="halal">Halal</option>
                                <option value="kosher">Kosher</option>
                            </select>
                            <input type="number" name="group-${groupNumber}-restriction-count" class="form-control" min="0" placeholder="Nb." style="width: 80px;">
                            <button type="button" class="remove-restriction-btn" onclick="removeRestriction(this)" style="background:none; color:#e74c3c; padding:0 5px;">&times;</button>
                        </div>
                    </div>
                    <button type="button" class="add-restriction-btn" onclick="addRestriction(${groupNumber})" style="font-size:0.8em; padding: 5px 10px; margin-top:5px; background-color:#3498db; color: white; border: none; border-radius: 4px;">+ Ajouter une restriction</button>
                </div>
            </div>
        `;
        
        return groupDiv;
    }
    
    // Fonctions globales pour les groupes
    window.removeGroup = function(groupNumber) {
        const groupElement = document.getElementById(`group-${groupNumber}`);
        if (groupElement) {
            groupElement.remove();
        }
    };
    
    window.addRestriction = function(groupNumber) {
        const restrictionsContainer = document.getElementById(`group-${groupNumber}-restrictions`);
        const restrictionItem = document.createElement('div');
        restrictionItem.className = 'restriction-item';
        
        restrictionItem.innerHTML = `
            <select name="group-${groupNumber}-restriction-type" class="form-control">
                <option value="">-- Sélectionnez --</option>
                <option value="vegetarian">Végétarien</option>
                <option value="vegan">Végétalien</option>
                <option value="gluten-free">Sans gluten</option>
                <option value="lactose-free">Sans lactose</option>
                <option value="nuts-free">Sans fruits à coque</option>
                <option value="peanuts-free">Sans arachides</option>
                <option value="eggs-free">Sans œufs</option>
                <option value="fish-free">Sans poisson</option>
                <option value="shellfish-free">Sans crustacés</option>
                <option value="soy-free">Sans soja</option>
                <option value="halal">Halal</option>
                <option value="kosher">Kosher</option>
            </select>
            <input type="number" name="group-${groupNumber}-restriction-count" class="form-control" min="0" placeholder="Nb." style="width: 80px;">
            <button type="button" class="remove-restriction-btn" onclick="removeRestriction(this)" style="background:none; color:#e74c3c; padding:0 5px;">&times;</button>
        `;
        
        restrictionsContainer.appendChild(restrictionItem);
    };
    
    window.removeRestriction = function(button) {
        button.parentElement.remove();
    };
    
    // Gestion du stock
    function initStock() {
        if (addStockItemBtn) {
            addStockItemBtn.addEventListener('click', showAddStockModal);
        }
        
        if (refreshStockBtn) {
            refreshStockBtn.addEventListener('click', loadStockData);
        }
        
        if (stockSearch) {
            stockSearch.addEventListener('input', filterStock);
        }
        
        if (stockCategoryFilter) {
            stockCategoryFilter.addEventListener('change', filterStock);
        }
    }
    
    async function loadStockData() {
        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
                // 🍪 Token géré via cookie HTTP-Only (authentification automatique)

            console.log('🔄 Chargement du stock depuis l\'API...');

            const response = await fetch('/api/stock', {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'GET',
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Réponse API stock:', response.status, response.statusText);

            if (!response.ok) {
                if (response.status === 401) {
                    console.error('❌ Token invalide ou expiré');
                    console.log('🔄 Utilisation des données mockées...');
                    loadMockStockData();
                    return;
                }
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            stockData = result.data || [];
            console.log('✅ Stock chargé depuis l\'API:', stockData.length, 'articles');
            renderStockTable();
        } catch (error) {
            console.error('❌ Erreur lors du chargement du stock:', error);
            console.log('🔄 Utilisation des données mockées...');
            loadMockStockData();
        }
    }

    function loadMockStockData() {
        stockData = [
            { _id: 'mock1', name: 'Riz Basmati', category: 'cereales', quantity: 10, unit: 'kg', expiration: '2024-12-31', supplier: 'Fruits & Légumes SA', location: 'Réserve A' },
            { _id: 'mock2', name: 'Pommes de terre', category: 'legumes', quantity: 5, unit: 'kg', expiration: '2024-11-15', supplier: 'Fruits & Légumes SA', location: 'Réserve B' },
            { _id: 'mock3', name: 'Poulet', category: 'viandes', quantity: 2, unit: 'kg', expiration: '2024-11-10', supplier: 'Boucherie Martin', location: 'Congélateur' },
            { _id: 'mock4', name: 'Lait', category: 'produits-laitiers', quantity: 30, unit: 'L', expiration: '2024-11-08', supplier: 'Produits Laitiers SA', location: 'Réfrigérateur' }
        ];
        console.log('📦 Données mockées de stock chargées:', stockData.length, 'articles');
        renderStockTable();
    }
    
    function renderStockTable() {
        if (!stockTableBody) return;
        
        stockTableBody.innerHTML = '';
        
        stockData.forEach(item => {
            const row = document.createElement('tr');
            const categoryLabels = {
                'legumes': 'Légumes',
                'viandes': 'Viandes',
                'poissons': 'Poissons',
                'produits-laitiers': 'Produits laitiers',
                'cereales': 'Céréales',
                'epices': 'Épices',
                'boissons': 'Boissons',
                'fruits': 'Fruits',
                'autres': 'Autres'
            };
            
            // Calculer le total (quantité × prix unitaire) et formater le prix
            const unitPrice = item.price !== undefined && item.price !== null ? parseFloat(item.price) : 0;
            const quantity = item.quantity !== undefined && item.quantity !== null ? parseFloat(item.quantity) : 0;
            const totalPrice = unitPrice * quantity;
            
            // Formater le prix : afficher le total avec le prix unitaire entre parenthèses
            const formattedPrice = unitPrice > 0
                ? `<div style="font-weight: 700; color: #27ae60;">${totalPrice.toFixed(2)} €</div>
                   <small style="color: #6c757d; font-weight: 400;">(${unitPrice.toFixed(2)} €/${item.unit || 'unité'})</small>`
                : '-';
            
            // Formater le seuil d'alerte
            const alertThresholdValue = item.alertThreshold !== undefined && item.alertThreshold !== null ? parseFloat(item.alertThreshold) : null;
            const formattedAlertThreshold = alertThresholdValue !== null && alertThresholdValue > 0
                ? `${alertThresholdValue} ${item.unit || ''}`
                : '-';
            
            // Vérifier si l'alerte est déclenchée (seulement si le seuil est défini et > 0)
            const isAlertTriggered = alertThresholdValue !== null && alertThresholdValue > 0 && item.quantity < alertThresholdValue;
            
            row.innerHTML = `
                <td><strong>${item.name}</strong>${item.supplier ? `<br><small style="color: #666;">${item.supplier}</small>` : ''}</td>
                <td><span class="category-badge" style="background: #e3f2fd; color: #1976d2; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8em;">${categoryLabels[item.category] || item.category}</span></td>
                <td><strong>${item.quantity}</strong>${isAlertTriggered ? ' <span style="color: #e74c3c;"><i class="fas fa-exclamation-triangle"></i></span>' : ''}</td>
                <td>${item.unit}</td>
                <td style="${isAlertTriggered ? 'color: #e74c3c; font-weight: 600;' : ''}">${formattedAlertThreshold}</td>
                <td style="font-weight: 600; color: #27ae60;">${formattedPrice}</td>
                <td>${item.expiration || item.expirationDate}</td>
                <td>
                    <button class="btn-small btn-primary" onclick="editStockItem('${item._id}')">Modifier</button>
                    <button class="btn-small" style="background-color: #e74c3c; color: white;" onclick="deleteStockItem('${item._id}')">Supprimer</button>
                </td>
            `;
            stockTableBody.appendChild(row);
        });
    }
    
    function filterStock() {
        const searchTerm = stockSearch.value.toLowerCase();
        const categoryFilter = stockCategoryFilter.value;
        
        const filteredData = stockData.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
        
        // Rendu temporaire avec les données filtrées
        const originalData = stockData;
        stockData = filteredData;
        renderStockTable();
        stockData = originalData;
    }
    
    function showAddStockModal() {
        console.log('➕ Ouverture de la modal d\'ajout d\'article');
        // Créer une modal d'ajout d'article
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Ajouter un article au stock</h3>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-tabs" style="display: flex !important; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e5e5e5; width: 100%;">
                    <button class="tab-btn active" data-tab="manual" style="flex: 1; padding: 0.75rem 1rem; border: none; background: #007bff; color: #fff; cursor: pointer; border-bottom: 3px solid #0056b3; transition: all 0.3s; font-weight: 500;">
                        <i class="fas fa-keyboard"></i> Saisie manuelle
                    </button>
                    <button class="tab-btn" data-tab="ocr" style="flex: 1; padding: 0.75rem 1rem; border: none; background: transparent; color: #495057; cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.3s; font-weight: 500;">
                        <i class="fas fa-camera"></i> Scanner OCR
                    </button>
                </div>
                <form id="add-stock-form">
                    <!-- Onglet Saisie manuelle -->
                    <div id="manual-tab" class="tab-content active">
                        <div class="form-group">
                            <label for="stock-name">Nom de l'article *</label>
                            <input type="text" id="stock-name" name="name" class="form-control" required 
                                   placeholder="Ex: Riz basmati" oninput="window.autoDetectCategory(this.value)">
                        </div>
                        <div class="form-group">
                            <label for="stock-category">Catégorie *</label>
                            <select id="stock-category" name="category" class="form-control" required>
                                <option value="">-- Sélectionnez une catégorie --</option>
                                <option value="legumes">Légumes</option>
                                <option value="viandes">Viandes</option>
                                <option value="poissons">Poissons</option>
                                <option value="produits-laitiers">Produits laitiers</option>
                                <option value="cereales">Céréales</option>
                                <option value="epices">Épices</option>
                                <option value="boissons">Boissons</option>
                                <option value="fruits">Fruits</option>
                                <option value="autres">Autres</option>
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="stock-quantity">Quantité *</label>
                                <input type="number" id="stock-quantity" name="quantity" class="form-control" 
                                       min="0" step="0.1" required placeholder="Ex: 5">
                            </div>
                            <div class="form-group">
                                <label for="stock-unit">Unité *</label>
                                <select id="stock-unit" name="unit" class="form-control" required>
                                    <option value="">-- Unité --</option>
                                    <option value="kg">kg</option>
                                    <option value="g">g</option>
                                    <option value="L">L</option>
                                    <option value="ml">ml</option>
                                    <option value="pièces">pièces</option>
                                    <option value="boîtes">boîtes</option>
                                    <option value="sachets">sachets</option>
                                    <option value="bouteilles">bouteilles</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="stock-expiration">Date d'expiration *</label>
                            <input type="date" id="stock-expiration" name="expirationDate" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="stock-supplier">Fournisseur</label>
                            <input type="text" id="stock-supplier" name="supplier" class="form-control" 
                                   placeholder="Ex: Fruits & Légumes SA">
                        </div>
                        <div class="form-group">
                            <label for="stock-location">Emplacement</label>
                            <input type="text" id="stock-location" name="location" class="form-control" 
                                   placeholder="Ex: Réserve A, Étagère 3">
                        </div>
                        <div class="form-group">
                            <label for="stock-price">Prix (€)</label>
                            <input type="number" id="stock-price" name="price" class="form-control" 
                                   min="0" step="0.01" placeholder="Ex: 2.50">
                        </div>
                        <div class="form-group">
                            <label for="stock-notes">Notes</label>
                            <textarea id="stock-notes" name="notes" class="form-control" rows="3" 
                                      placeholder="Informations supplémentaires..."></textarea>
                        </div>
                    </div>
                    
                    <!-- Onglet Scanner OCR -->
                    <div id="ocr-tab" class="tab-content">
                        <div class="ocr-container">
                            <div class="camera-preview" id="camera-preview" style="display: none;">
                                <video id="video" width="100%" height="300" autoplay></video>
                                <canvas id="canvas" style="display: none;"></canvas>
                            </div>
                            <div class="ocr-upload">
                                <input type="file" id="image-upload" accept="image/*" style="display: none;">
                                <button type="button" id="upload-btn" class="btn-secondary">
                                    <i class="fas fa-upload"></i> Choisir une image
                                </button>
                                <button type="button" id="camera-btn" class="btn-primary">
                                    <i class="fas fa-camera"></i> Prendre une photo
                                </button>
                            </div>
                            <div class="ocr-results" id="ocr-results" style="display: none;">
                                <h4>Texte détecté :</h4>
                                <div id="detected-text" class="detected-text"></div>
                                <button type="button" id="use-ocr-data" class="btn-primary">
                                    <i class="fas fa-check"></i> Utiliser ces données
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
                        <button type="submit" class="btn-primary">Ajouter au stock</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Initialiser les onglets de la modal
        initModalTabs(modal);
        
        // Initialiser l'OCR
        initOCR(modal);
        
        // Gérer la soumission du formulaire
        document.getElementById('add-stock-form').addEventListener('submit', async (e) => {
                e.preventDefault();
            await addStockItem(e.target);
        });
        
        // Définir la date d'expiration par défaut (dans 30 jours)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 30);
        document.getElementById('stock-expiration').value = tomorrow.toISOString().split('T')[0];
        
        // Test de la détection automatique
        console.log('🧪 Test de la détection automatique des catégories');
        console.log('Essayez de taper: banane, riz, tomate, poulet, lait, etc.');
    }
    
    // Détection automatique des catégories
    window.autoDetectCategory = function(productName) {
        if (!productName || productName.trim() === '') {
            return;
        }
        
        const name = productName.toLowerCase().trim();
        const categorySelect = document.getElementById('stock-category');
        
        if (!categorySelect) {
            console.log('❌ Élément stock-category non trouvé');
            return;
        }
        
        // Mots-clés pour chaque catégorie (plus complets)
        const categoryKeywords = {
            'fruits': ['pomme', 'banane', 'orange', 'citron', 'fraise', 'cerise', 'pêche', 'poire', 'raisin', 'fruit', 'kiwi', 'mangue', 'ananas', 'melon', 'pastèque', 'abricot', 'prune', 'framboise', 'myrtille', 'cassis', 'groseille', 'figue', 'datte', 'noix de coco', 'avocat', 'tomate cerise'],
            'legumes': ['carotte', 'tomate', 'pomme de terre', 'oignon', 'courgette', 'aubergine', 'poivron', 'salade', 'épinard', 'brocoli', 'chou', 'radis', 'concombre', 'haricot', 'petit pois', 'légume', 'courge', 'potiron', 'navet', 'betterave', 'céleri', 'fenouil', 'artichaut', 'asperge', 'champignon', 'endive', 'chicorée', 'laitue', 'roquette', 'mâche', 'épinard', 'blette', 'poireau', 'ail', 'échalote'],
            'viandes': ['bœuf', 'boeuf', 'porc', 'agneau', 'veau', 'poulet', 'dinde', 'jambon', 'saucisse', 'bacon', 'steak', 'côtelette', 'viande', 'charcuterie', 'rôti', 'gigot', 'côte', 'entrecôte', 'bifteck', 'escalope', 'côtelette', 'andouille', 'boudin', 'pâté', 'rillettes', 'terrine'],
            'poissons': ['saumon', 'thon', 'cabillaud', 'merlu', 'sole', 'crevette', 'moule', 'huître', 'poisson', 'fruits de mer', 'crustacé', 'langouste', 'homard', 'crabe', 'calmar', 'poulpe', 'anchois', 'sardine', 'maquereau', 'truite', 'bar', 'dorade', 'lotte', 'raie', 'rouget', 'saint-pierre'],
            'produits-laitiers': ['lait', 'fromage', 'yaourt', 'beurre', 'crème', 'fromage blanc', 'laitage', 'dairy', 'brie', 'camembert', 'roquefort', 'chèvre', 'emmental', 'comté', 'gruyère', 'parmesan', 'mozzarella', 'ricotta', 'cottage', 'kiri', 'vache qui rit', 'petit suisse', 'faisselle'],
            'cereales': ['riz', 'pâtes', 'pain', 'farine', 'blé', 'avoine', 'quinoa', 'boulgour', 'semoule', 'céréale', 'grain', 'orge', 'épeautre', 'seigle', 'maïs', 'sarrasin', 'millet', 'amarante', 'spaghetti', 'macaroni', 'penne', 'fusilli', 'tagliatelle', 'ravioli', 'gnocchi', 'couscous', 'polenta'],
            'epices': ['sel', 'poivre', 'herbes', 'épice', 'condiment', 'assaisonnement', 'thym', 'romarin', 'basilic', 'persil', 'ciboulette', 'estragon', 'cerfeuil', 'origan', 'marjolaine', 'sauge', 'laurier', 'cannelle', 'gingembre', 'curcuma', 'cumin', 'coriandre', 'cardamome', 'clou de girofle', 'muscade', 'piment', 'paprika', 'curry', 'herbes de provence'],
            'boissons': ['eau', 'jus', 'soda', 'café', 'thé', 'vin', 'bière', 'boisson', 'liquide', 'coca', 'pepsi', 'fanta', 'sprite', 'orangina', 'limonade', 'sirop', 'smoothie', 'milkshake', 'champagne', 'cidre', 'whisky', 'vodka', 'rhum', 'cognac', 'armagnac', 'liqueur', 'apéritif', 'digestif'],
            'autres': ['huile', 'vinaigre', 'moutarde', 'ketchup', 'mayonnaise', 'sauce', 'conserve', 'conserves', 'biscuit', 'gâteau', 'chocolat', 'bonbon', 'confiserie', 'pâtisserie', 'viennoiserie', 'croissant', 'pain au chocolat', 'brioche', 'tarte', 'flan', 'crème', 'dessert']
        };
        
        console.log(`🔍 Recherche de catégorie pour: "${name}"`);
        
        // Chercher une correspondance
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => name.includes(keyword))) {
                categorySelect.value = category;
                console.log(`🏷️ Catégorie détectée: ${category} pour "${productName}"`);
                
                // Ajouter un effet visuel
                categorySelect.style.backgroundColor = '#e8f5e8';
                categorySelect.style.borderColor = '#4caf50';
                setTimeout(() => {
                    categorySelect.style.backgroundColor = '';
                    categorySelect.style.borderColor = '';
                }, 1000);
                
                return;
            }
        }
        
        // Si aucune correspondance, laisser vide
        categorySelect.value = '';
        console.log(`❌ Aucune catégorie détectée pour "${productName}"`);
    };
    
    // Gestion des onglets dans la modal
    function initModalTabs(modal) {
        const tabButtons = modal.querySelectorAll('.tab-btn');
        const tabContents = modal.querySelectorAll('.tab-content');
        
        // Styles pour les onglets actifs
        const activeStyle = {
            background: '#007bff',
            color: '#fff',
            borderBottom: '3px solid #0056b3'
        };
        
        const inactiveStyle = {
            background: 'transparent',
            color: '#333',
            borderBottom: '3px solid transparent'
        };
        
        // Appliquer les styles initiaux
        tabButtons.forEach((btn, index) => {
            if (index === 0) {
                Object.assign(btn.style, activeStyle);
            } else {
                Object.assign(btn.style, inactiveStyle);
            }
        });
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Retirer la classe active de tous les boutons et contenus
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                    Object.assign(btn.style, inactiveStyle);
                });
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    content.style.display = 'none';
                });
                
                // Ajouter la classe active au bouton cliqué
                button.classList.add('active');
                Object.assign(button.style, activeStyle);
                
                // Afficher le contenu correspondant
                const targetTab = button.dataset.tab;
                const targetContent = modal.querySelector(`#${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    targetContent.style.display = 'block';
                }
            });
        });
        
        // Afficher le premier onglet par défaut
        const firstTab = modal.querySelector('#manual-tab');
        if (firstTab) {
            firstTab.style.display = 'block';
        }
    }
    
    // Initialisation de l'OCR
    function initOCR(modal) {
        const uploadBtn = modal.querySelector('#upload-btn');
        const cameraBtn = modal.querySelector('#camera-btn');
        const imageUpload = modal.querySelector('#image-upload');
        const video = modal.querySelector('#video');
        const canvas = modal.querySelector('#canvas');
        const cameraPreview = modal.querySelector('#camera-preview');
        const ocrResults = modal.querySelector('#ocr-results');
        const detectedText = modal.querySelector('#detected-text');
        const useOcrDataBtn = modal.querySelector('#use-ocr-data');
        
        // Gestion de l'upload d'image
        uploadBtn.addEventListener('click', () => imageUpload.click());
        imageUpload.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                processImage(e.target.files[0]);
            }
        });
        
        // Gestion de la caméra
        cameraBtn.addEventListener('click', async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                video.srcObject = stream;
                cameraPreview.style.display = 'block';
                cameraBtn.textContent = '📷 Capturer';
                cameraBtn.onclick = capturePhoto;
            } catch (error) {
                console.error('Erreur d\'accès à la caméra:', error);
                alert('Impossible d\'accéder à la caméra');
            }
        });
        
        // Capture de photo
        function capturePhoto() {
            const context = canvas.getContext('2d');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0);
            
            canvas.toBlob((blob) => {
                processImage(blob);
                // Arrêter la caméra
                video.srcObject.getTracks().forEach(track => track.stop());
                cameraPreview.style.display = 'none';
                cameraBtn.textContent = '📷 Prendre une photo';
                cameraBtn.onclick = () => cameraBtn.click();
            });
        }
        
        // Traitement de l'image avec OCR
        async function processImage(file) {
            try {
                console.log('🔍 Traitement OCR en cours...');
                
                // Afficher un indicateur de chargement
                detectedText.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Traitement de l\'image en cours...</div>';
                ocrResults.style.display = 'block';
                useOcrDataBtn.style.display = 'none';
                
                // Envoyer l'image au serveur pour OCR
                const formData = new FormData();
                formData.append('file', file);
                
                // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
                const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
                
                const response = await fetchFn('/api/stock/ocr', {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Erreur lors du traitement OCR');
                }
                
                const data = await response.json();
                
                if (data.items && data.items.length > 0) {
                    // Afficher les items détectés
                    detectedText.innerHTML = data.items.map((item, index) => `
                        <div class="ocr-item" style="padding: 0.75rem; margin-bottom: 0.5rem; background: #f8f9fa; border-radius: 6px; border-left: 3px solid #27ae60;">
                            <strong>${item.name}</strong><br>
                            <small>Quantité: ${item.quantity} ${item.unit} | Catégorie: ${item.category} ${item.price ? '| Prix: ' + item.price + '€' : ''}</small>
                        </div>
                    `).join('');
                    
                    // Stocker les items pour utilisation
                    modal.ocrDetectedItems = data.items;
                    useOcrDataBtn.style.display = 'block';
                } else {
                    detectedText.innerHTML = '<div style="color: #e74c3c; padding: 1rem; text-align: center;">Aucun article détecté dans l\'image. Veuillez réessayer avec une image plus claire.</div>';
                }
                
            } catch (error) {
                console.error('Erreur OCR:', error);
                detectedText.innerHTML = `<div style="color: #e74c3c; padding: 1rem; text-align: center;">Erreur lors du traitement: ${error.message}</div>`;
            }
        }
        
        // Remplir le formulaire avec les données OCR
        function fillFormWithOcrData(data) {
            document.getElementById('stock-name').value = data.name || '';
            document.getElementById('stock-category').value = data.category?.toLowerCase() || 'autres';
            document.getElementById('stock-quantity').value = data.quantity || '';
            document.getElementById('stock-unit').value = data.unit || 'g';
            if (data.price) {
                document.getElementById('stock-price').value = data.price;
            }
            
            console.log('📝 Formulaire rempli avec les données OCR');
        }
        
        // Utiliser les données OCR détectées
        useOcrDataBtn.addEventListener('click', () => {
            if (modal.ocrDetectedItems && modal.ocrDetectedItems.length > 0) {
                // Utiliser le premier item détecté
                fillFormWithOcrData(modal.ocrDetectedItems[0]);
                // Passer à l'onglet manuel
                modal.querySelector('[data-tab="manual"]').click();
            }
        });
    }
    
    // Ajout d'un article au stock
    async function addStockItem(form) {
        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
                // 🍪 Token géré via cookie HTTP-Only (authentification automatique)

            const formData = new FormData(form);
            const stockData = {
                name: formData.get('name'),
                category: formData.get('category'),
                quantity: parseFloat(formData.get('quantity')),
                unit: formData.get('unit'),
                expirationDate: formData.get('expirationDate'),
                supplier: formData.get('supplier'),
                location: formData.get('location'),
                price: parseFloat(formData.get('price')) || 0,
                notes: formData.get('notes')
            };

            // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
            const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

            const response = await fetchFn('/api/stock', {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'POST',
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stockData)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('🔐 Authentification via cookie HTTP-Only');
                    addMockStockItem(form);
                    return;
                }
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de l\'ajout de l\'article');
            }

            const result = await response.json();
            console.log('✅ Article ajouté via API:', result.data);
            
            // Fermer la modal et recharger les données
            document.querySelector('.modal-overlay').remove();
            await loadStockData();
            
            alert('Article ajouté au stock avec succès !');
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout de l\'article:', error);
            console.log('🔄 Passage en mode mock');
            addMockStockItem(form);
        }
    }

    function addMockStockItem(form) {
        const formData = new FormData(form);
        const newItem = {
            _id: 'mock' + Date.now(),
            name: formData.get('name'),
            category: formData.get('category'),
            quantity: parseFloat(formData.get('quantity')),
            unit: formData.get('unit'),
            expiration: formData.get('expirationDate'),
            supplier: formData.get('supplier'),
            location: formData.get('location'),
            price: parseFloat(formData.get('price')) || 0,
            notes: formData.get('notes')
        };

        stockData.push(newItem);
        console.log('📦 Article ajouté en mode mock:', newItem);
        
        // Fermer la modal et recharger l'affichage
        document.querySelector('.modal-overlay').remove();
        renderStockTable();
        
        alert('Article ajouté en mode local ! (Les données ne seront pas sauvegardées)');
    }
    
    // Gestion des fournisseurs
    function initSuppliers() {
        if (addSupplierBtn) {
            addSupplierBtn.addEventListener('click', showAddSupplierModal);
        }
        
        if (refreshSuppliersBtn) {
            refreshSuppliersBtn.addEventListener('click', loadSuppliersData);
        }
    }
    
    async function loadSuppliersData() {
        console.log('🔄 Chargement des fournisseurs depuis l\'API...');
        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
                // 🍪 Token géré via cookie HTTP-Only (authentification automatique)

            console.log('🔐 Authentification via cookie HTTP-Only'); + '...');

            // Charger les fournisseurs enregistrés par les collectivités
            const suppliersResponse = await fetch('/api/suppliers', {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'GET',
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
                    'Content-Type': 'application/json'
                }
            });

            // Charger aussi les fournisseurs actifs (ceux qui se sont connectés)
            const activeSuppliersResponse = await fetch('/api/users/suppliers', {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'GET',
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 Réponse fournisseurs:', suppliersResponse.status);
            console.log('📡 Réponse fournisseurs actifs:', activeSuppliersResponse.status);

            let suppliersData = [];
            let activeSuppliers = [];

            // Traiter les fournisseurs enregistrés
            if (suppliersResponse.ok) {
                const result = await suppliersResponse.json();
                suppliersData = result.data || [];
                console.log('✅ Fournisseurs enregistrés:', suppliersData.length);
            }

            // Traiter les fournisseurs actifs
            if (activeSuppliersResponse.ok) {
                const result = await activeSuppliersResponse.json();
                activeSuppliers = result.data || [];
                console.log('✅ Fournisseurs actifs:', activeSuppliers.length);
            }

            // Fusionner les deux listes (éviter les doublons)
            const allSuppliers = [...suppliersData];
            
            activeSuppliers.forEach(activeSupplier => {
                // Vérifier si ce fournisseur n'est pas déjà dans la liste
                const exists = allSuppliers.some(supplier => 
                    supplier.email === activeSupplier.email || 
                    supplier.name === activeSupplier.businessName
                );
                
                if (!exists) {
                    // Ajouter le fournisseur actif à la liste
                    allSuppliers.push({
                        _id: activeSupplier._id,
                        name: activeSupplier.businessName || activeSupplier.name,
                        contact: activeSupplier.name,
                        email: activeSupplier.email,
                        phone: activeSupplier.phone || 'Non renseigné',
                        categories: ['autres'], // Catégorie par défaut
                        notes: 'Fournisseur actif - s\'est connecté récemment',
                        status: 'active'
                    });
                }
            });

            suppliersData = allSuppliers;
            console.log('✅ Total fournisseurs (enregistrés + actifs):', suppliersData.length);
            renderSuppliersList();
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des fournisseurs:', error);
            console.log('🔄 Utilisation des données mockées...');
            loadMockSuppliersData();
        }
    }

    function loadMockSuppliersData() {
        // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
        const connectedUser = typeof getStoredUser === 'function' ? getStoredUser() : null;
        if (!connectedUser) {
          console.warn('⚠️ Utilisateur non connecté');
          return;
        }
        const connectedSupplier = connectedUser.role === 'fournisseur' ? {
            _id: connectedUser.id || 'connected-supplier',
            name: connectedUser.businessName || connectedUser.name || 'Fournisseur Connecté',
            contact: connectedUser.name || 'Contact',
            phone: connectedUser.phone || 'Non renseigné',
            email: connectedUser.email || 'email@example.com',
            categories: ['autres'],
            notes: 'Fournisseur actuellement connecté - s\'est connecté récemment',
            status: 'active'
        } : null;

        suppliersData = [
            { 
                _id: 'mock1', 
                name: 'Fruits & Légumes SA', 
                contact: 'Jean Dupont', 
                phone: '01 23 45 67 89', 
                email: 'contact@fruits-legumes.fr',
                categories: ['legumes', 'fruits'],
                notes: 'Spécialiste des produits frais de saison. Livraison quotidienne.'
            },
            { 
                _id: 'mock2', 
                name: 'Boucherie Martin', 
                contact: 'Pierre Martin', 
                phone: '01 23 45 67 90', 
                email: 'martin@boucherie.fr',
                categories: ['viandes'],
                notes: 'Boucherie traditionnelle depuis 1950. Viandes de qualité supérieure.'
            },
            { 
                _id: 'mock3', 
                name: 'Poissonnerie du Port', 
                contact: 'Marie Leclerc', 
                phone: '01 23 45 67 91', 
                email: 'info@poissonnerie.fr',
                categories: ['poissons'],
                notes: 'Poissons frais du jour. Approvisionnement direct des ports bretons.'
            },
            { 
                _id: 'mock4', 
                name: 'Produits Laitiers Bio', 
                contact: 'Sophie Bernard', 
                phone: '01 23 45 67 92', 
                email: 'sophie@laitiers-bio.fr',
                categories: ['produits-laitiers'],
                notes: 'Produits laitiers biologiques. Fromages artisanaux.'
            },
            { 
                _id: 'mock5', 
                name: 'Épicerie Fine', 
                contact: 'Antoine Moreau', 
                phone: '01 23 45 67 93', 
                email: 'antoine@epicerie-fine.fr',
                categories: ['epices', 'cereales'],
                notes: 'Épicerie fine et produits d\'exception. Import direct.'
            }
        ];

        // Ajouter le fournisseur connecté s'il existe
        if (connectedSupplier) {
            suppliersData.unshift(connectedSupplier); // Ajouter en premier
            console.log('✅ Fournisseur connecté ajouté aux données mockées:', connectedSupplier.name);
        }

        console.log('📦 Données mockées chargées:', suppliersData.length, 'fournisseurs');
        renderSuppliersList();
    }
    
    function renderSuppliersList() {
        if (!suppliersList) return;
        
        suppliersList.innerHTML = '';
        
        if (suppliersData.length === 0) {
            suppliersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-truck"></i>
                    <h3>Aucun fournisseur enregistré</h3>
                    <p>Commencez par ajouter votre premier fournisseur</p>
                </div>
            `;
            return;
        }
        
        suppliersData.forEach(supplier => {
            const card = document.createElement('div');
            card.className = 'supplier-card';
            
            // Formater les catégories avec des badges
            const categoryBadges = supplier.categories && supplier.categories.length > 0 
                ? supplier.categories.map(cat => `<span class="category-badge">${cat}</span>`).join('')
                : '<span class="no-categories">Aucune catégorie</span>';
            
            card.innerHTML = `
                <div class="supplier-header">
                    <h3 class="supplier-name">${supplier.name}</h3>
                    <div class="supplier-status">
                        <span class="status-badge active">Actif</span>
                    </div>
                </div>
                
                <div class="supplier-info">
                    <div class="supplier-detail">
                        <i class="fas fa-user"></i>
                        <span class="label">Contact:</span>
                        <span class="value">${supplier.contact}</span>
                    </div>
                    
                    <div class="supplier-detail">
                        <i class="fas fa-envelope"></i>
                        <span class="label">Email:</span>
                        <span class="value">${supplier.email || 'N/A'}</span>
                    </div>
                    
                    <div class="supplier-detail">
                        <i class="fas fa-phone"></i>
                        <span class="label">Téléphone:</span>
                        <span class="value">${supplier.phone}</span>
                    </div>
                    
                    <div class="supplier-detail">
                        <i class="fas fa-tags"></i>
                        <span class="label">Catégories:</span>
                        <div class="category-badges">${categoryBadges}</div>
                    </div>
                </div>
                
                <div class="supplier-actions">
                    <button class="btn-action btn-primary" onclick="browseSupplierProducts('${supplier._id}', '${supplier.name}')" title="Voir le catalogue">
                        <i class="fas fa-shopping-cart"></i>
                        Voir le catalogue
                    </button>
                    <button class="btn-action btn-secondary" onclick="editSupplier('${supplier._id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                        Modifier
                    </button>
                    <button class="btn-action btn-danger" onclick="deleteSupplier('${supplier._id}')" title="Supprimer">
                        <i class="fas fa-trash"></i>
                        Supprimer
                    </button>
                </div>
            `;
            suppliersList.appendChild(card);
        });
    }
    
    function showAddSupplierModal() {
        console.log('➕ Ouverture de la modal d\'ajout de fournisseur');
        // Créer une modal d'ajout de fournisseur
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Ajouter un fournisseur</h3>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <form id="add-supplier-form">
                    <div class="form-group">
                        <label for="supplier-name">Nom du fournisseur *</label>
                        <input type="text" id="supplier-name" name="name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="supplier-contact">Contact *</label>
                        <input type="text" id="supplier-contact" name="contact" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="supplier-email">Email *</label>
                        <input type="email" id="supplier-email" name="email" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="supplier-phone">Téléphone *</label>
                        <input type="tel" id="supplier-phone" name="phone" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="supplier-categories">Catégories</label>
                        <select id="supplier-categories" name="categories" class="form-control" multiple>
                            <option value="legumes">Légumes</option>
                            <option value="viandes">Viandes</option>
                            <option value="poissons">Poissons</option>
                            <option value="produits-laitiers">Produits laitiers</option>
                            <option value="cereales">Céréales</option>
                            <option value="epices">Épices</option>
                            <option value="boissons">Boissons</option>
                            <option value="autres">Autres</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="supplier-notes">Notes</label>
                        <textarea id="supplier-notes" name="notes" class="form-control" rows="3"></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
                        <button type="submit" class="btn-primary">Ajouter</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer la soumission du formulaire
        document.getElementById('add-supplier-form').addEventListener('submit', async (e) => {
                e.preventDefault();
            await addSupplier(e.target);
        });
    }
    
    async function addSupplier(form) {
        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
                // 🍪 Token géré via cookie HTTP-Only (authentification automatique)

            const formData = new FormData(form);
            const supplierData = {
                name: formData.get('name'),
                contact: formData.get('contact'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                categories: Array.from(formData.getAll('categories')),
                notes: formData.get('notes')
            };

            // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
            const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

            const response = await fetchFn('/api/suppliers', {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'POST',
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplierData)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('🔐 Authentification via cookie HTTP-Only');
                    addMockSupplier(form);
                    return;
                }
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de l\'ajout du fournisseur');
            }

            const result = await response.json();
            console.log('✅ Fournisseur ajouté via API:', result.data);
            
            // Fermer la modal et recharger les données
            document.querySelector('.modal-overlay').remove();
            await loadSuppliersData();
            
            alert('Fournisseur ajouté avec succès !');
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout du fournisseur:', error);
            console.log('🔄 Passage en mode mock');
            addMockSupplier(form);
        }
    }

    function addMockSupplier(form) {
        const formData = new FormData(form);
        const newSupplier = {
            _id: 'mock' + Date.now(),
            name: formData.get('name'),
            contact: formData.get('contact'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            categories: Array.from(formData.getAll('categories')),
            notes: formData.get('notes')
        };

        suppliersData.push(newSupplier);
        console.log('📦 Fournisseur ajouté en mode mock:', newSupplier);
        
        // Fermer la modal et recharger l'affichage
        document.querySelector('.modal-overlay').remove();
        renderSuppliersList();
        
        alert('Fournisseur ajouté en mode local ! (Les données ne seront pas sauvegardées)');
    }
    
    // Fonctions globales pour le stock et les fournisseurs
    window.editStockItem = async function(id) {
        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
                // 🍪 Token géré via cookie HTTP-Only (authentification automatique)

            // Récupérer les données de l'article
            const response = await fetch(`/api/stock/${id}`, {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'GET',
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('🔐 Authentification via cookie HTTP-Only');
                    editMockStockItem(id);
                    return;
                }
                throw new Error('Erreur lors de la récupération de l\'article');
            }

            const result = await response.json();
            const item = result.data;

            // Créer une modal d'édition (similaire à l'ajout)
            showEditStockModal(item);
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'article:', error);
            editMockStockItem(id);
        }
    };

    function editMockStockItem(id) {
        const item = stockData.find(item => item._id === id);
        if (item) {
            showEditStockModal(item);
        }
    }

    function showEditStockModal(item) {
        // Créer une modal d'édition similaire à l'ajout
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Modifier l'article</h3>
                    <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <form id="edit-stock-form">
                    <div class="form-group">
                        <label for="edit-stock-name">Nom de l'article *</label>
                        <input type="text" id="edit-stock-name" name="name" class="form-control" value="${item.name}" required oninput="window.autoDetectCategory(this.value)">
                    </div>
                    <div class="form-group">
                        <label for="edit-stock-category">Catégorie *</label>
                        <select id="edit-stock-category" name="category" class="form-control" required>
                            <option value="">-- Sélectionnez une catégorie --</option>
                            <option value="legumes" ${item.category === 'legumes' ? 'selected' : ''}>Légumes</option>
                            <option value="viandes" ${item.category === 'viandes' ? 'selected' : ''}>Viandes</option>
                            <option value="poissons" ${item.category === 'poissons' ? 'selected' : ''}>Poissons</option>
                            <option value="produits-laitiers" ${item.category === 'produits-laitiers' ? 'selected' : ''}>Produits laitiers</option>
                            <option value="cereales" ${item.category === 'cereales' ? 'selected' : ''}>Céréales</option>
                            <option value="epices" ${item.category === 'epices' ? 'selected' : ''}>Épices</option>
                            <option value="boissons" ${item.category === 'boissons' ? 'selected' : ''}>Boissons</option>
                            <option value="fruits" ${item.category === 'fruits' ? 'selected' : ''}>Fruits</option>
                            <option value="autres" ${item.category === 'autres' ? 'selected' : ''}>Autres</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="edit-stock-quantity">Quantité *</label>
                            <input type="number" id="edit-stock-quantity" name="quantity" class="form-control" value="${item.quantity}" min="0" step="0.1" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-stock-unit">Unité *</label>
                            <select id="edit-stock-unit" name="unit" class="form-control" required>
                                <option value="">-- Unité --</option>
                                <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg</option>
                                <option value="g" ${item.unit === 'g' ? 'selected' : ''}>g</option>
                                <option value="L" ${item.unit === 'L' ? 'selected' : ''}>L</option>
                                <option value="ml" ${item.unit === 'ml' ? 'selected' : ''}>ml</option>
                                <option value="pièces" ${item.unit === 'pièces' ? 'selected' : ''}>pièces</option>
                                <option value="boîtes" ${item.unit === 'boîtes' ? 'selected' : ''}>boîtes</option>
                                <option value="sachets" ${item.unit === 'sachets' ? 'selected' : ''}>sachets</option>
                                <option value="bouteilles" ${item.unit === 'bouteilles' ? 'selected' : ''}>bouteilles</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-stock-expiration">Date d'expiration *</label>
                        <input type="date" id="edit-stock-expiration" name="expirationDate" class="form-control" value="${item.expiration || item.expirationDate}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-stock-supplier">Fournisseur</label>
                        <input type="text" id="edit-stock-supplier" name="supplier" class="form-control" value="${item.supplier || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-stock-location">Emplacement</label>
                        <input type="text" id="edit-stock-location" name="location" class="form-control" value="${item.location || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-stock-price">Prix (€)</label>
                        <input type="number" id="edit-stock-price" name="price" class="form-control" value="${item.price || 0}" min="0" step="0.01">
                    </div>
                    <div class="form-group">
                        <label for="edit-stock-notes">Notes</label>
                        <textarea id="edit-stock-notes" name="notes" class="form-control" rows="3">${item.notes || ''}</textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
                        <button type="submit" class="btn-primary">Modifier l'article</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Gérer la soumission du formulaire
        document.getElementById('edit-stock-form').addEventListener('submit', async (e) => {
                e.preventDefault();
            await updateStockItem(item._id, e.target);
        });
    }

    async function updateStockItem(id, form) {
        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
                // 🍪 Token géré via cookie HTTP-Only (authentification automatique)

            const formData = new FormData(form);
            const stockData = {
                name: formData.get('name'),
                category: formData.get('category'),
                quantity: parseFloat(formData.get('quantity')),
                unit: formData.get('unit'),
                expirationDate: formData.get('expirationDate'),
                supplier: formData.get('supplier'),
                location: formData.get('location'),
                price: parseFloat(formData.get('price')) || 0,
                notes: formData.get('notes')
            };

            // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
            const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

            const response = await fetchFn(`/api/stock/${id}`, {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'PUT',
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stockData)
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('🔐 Authentification via cookie HTTP-Only');
                    updateMockStockItem(id, form);
                    return;
                }
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la modification de l\'article');
            }

            console.log('✅ Article modifié via API');
            document.querySelector('.modal-overlay').remove();
            await loadStockData();
            alert('Article modifié avec succès !');
        } catch (error) {
            console.error('❌ Erreur lors de la modification de l\'article:', error);
            updateMockStockItem(id, form);
        }
    }

    function updateMockStockItem(id, form) {
        const formData = new FormData(form);
        const itemIndex = stockData.findIndex(item => item._id === id);
        
        if (itemIndex !== -1) {
            stockData[itemIndex] = {
                ...stockData[itemIndex],
                name: formData.get('name'),
                category: formData.get('category'),
                quantity: parseFloat(formData.get('quantity')),
                unit: formData.get('unit'),
                expiration: formData.get('expirationDate'),
                supplier: formData.get('supplier'),
                location: formData.get('location'),
                price: parseFloat(formData.get('price')) || 0,
                notes: formData.get('notes')
            };
            
            console.log('📦 Article modifié en mode mock:', stockData[itemIndex]);
            document.querySelector('.modal-overlay').remove();
            renderStockTable();
            alert('Article modifié en mode local !');
        }
    }
    
    window.deleteStockItem = async function(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
            return;
        }

        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
                // 🍪 Token géré via cookie HTTP-Only (authentification automatique)

            // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
            const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

            const response = await fetchFn(`/api/stock/${id}`, {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'DELETE',
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('🔐 Authentification via cookie HTTP-Only');
                    deleteMockStockItem(id);
                    return;
                }
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la suppression de l\'article');
            }

            console.log('✅ Article supprimé via API');
            await loadStockData();
            alert('Article supprimé avec succès !');
        } catch (error) {
            console.error('❌ Erreur lors de la suppression de l\'article:', error);
            deleteMockStockItem(id);
        }
    };

    function deleteMockStockItem(id) {
        stockData = stockData.filter(item => item._id !== id);
        console.log('📦 Article supprimé en mode mock:', id);
        renderStockTable();
        alert('Article supprimé en mode local !');
    }
    
    window.openSupplierDashboard = function(id) {
        // Redirection vers le dashboard fournisseur
        window.open(`supplier-dashboard.html?supplier=${id}`, '_blank');
    };
    
    window.editSupplier = async function(id) {
        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
                // 🍪 Token géré via cookie HTTP-Only (authentification automatique)

            // Récupérer les données du fournisseur
            const response = await fetch(`/api/suppliers/${id}`, {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'GET',
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du fournisseur');
            }

            const result = await response.json();
            const supplier = result.data;

            // Créer une modal d'édition
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Modifier le fournisseur</h3>
                        <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    </div>
                    <form id="edit-supplier-form">
                        <div class="form-group">
                            <label for="edit-supplier-name">Nom du fournisseur *</label>
                            <input type="text" id="edit-supplier-name" name="name" class="form-control" value="${supplier.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-supplier-contact">Contact *</label>
                            <input type="text" id="edit-supplier-contact" name="contact" class="form-control" value="${supplier.contact}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-supplier-email">Email *</label>
                            <input type="email" id="edit-supplier-email" name="email" class="form-control" value="${supplier.email}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-supplier-phone">Téléphone *</label>
                            <input type="tel" id="edit-supplier-phone" name="phone" class="form-control" value="${supplier.phone}" required>
                        </div>
                        <div class="form-group">
                            <label for="edit-supplier-categories">Catégories</label>
                            <select id="edit-supplier-categories" name="categories" class="form-control" multiple>
                                <option value="legumes" ${supplier.categories.includes('legumes') ? 'selected' : ''}>Légumes</option>
                                <option value="viandes" ${supplier.categories.includes('viandes') ? 'selected' : ''}>Viandes</option>
                                <option value="poissons" ${supplier.categories.includes('poissons') ? 'selected' : ''}>Poissons</option>
                                <option value="produits-laitiers" ${supplier.categories.includes('produits-laitiers') ? 'selected' : ''}>Produits laitiers</option>
                                <option value="cereales" ${supplier.categories.includes('cereales') ? 'selected' : ''}>Céréales</option>
                                <option value="epices" ${supplier.categories.includes('epices') ? 'selected' : ''}>Épices</option>
                                <option value="boissons" ${supplier.categories.includes('boissons') ? 'selected' : ''}>Boissons</option>
                                <option value="autres" ${supplier.categories.includes('autres') ? 'selected' : ''}>Autres</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="edit-supplier-notes">Notes</label>
                            <textarea id="edit-supplier-notes" name="notes" class="form-control" rows="3">${supplier.notes || ''}</textarea>
                        </div>
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
                            <button type="submit" class="btn-primary">Modifier</button>
                        </div>
                    </form>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Gérer la soumission du formulaire
            document.getElementById('edit-supplier-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                await updateSupplier(id, e.target);
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du fournisseur:', error);
            alert('Erreur: ' + error.message);
        }
    };

    async function updateSupplier(id, form) {
        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
                // 🍪 Token géré via cookie HTTP-Only (authentification automatique)

            const formData = new FormData(form);
            const supplierData = {
                name: formData.get('name'),
                contact: formData.get('contact'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                categories: Array.from(formData.getAll('categories')),
                notes: formData.get('notes')
            };

            // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
            const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

            const response = await fetchFn(`/api/suppliers/${id}`, {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'PUT',
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(supplierData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la modification du fournisseur');
            }

            const result = await response.json();
            console.log('Fournisseur modifié:', result.data);
            
            // Fermer la modal et recharger les données
            document.querySelector('.modal-overlay').remove();
            await loadSuppliersData();
            
            alert('Fournisseur modifié avec succès !');
        } catch (error) {
            console.error('Erreur lors de la modification du fournisseur:', error);
            alert('Erreur: ' + error.message);
        }
    }

    window.deleteSupplier = async function(id) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
            return;
        }

        try {
            // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
                // 🍪 Token géré via cookie HTTP-Only (authentification automatique)

            // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
            const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

            const response = await fetchFn(`/api/suppliers/${id}`, {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'DELETE',
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('🔐 Authentification via cookie HTTP-Only');
                    deleteMockSupplier(id);
                    return;
                }
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la suppression du fournisseur');
            }

            console.log('✅ Fournisseur supprimé via API');
            await loadSuppliersData();
            alert('Fournisseur supprimé avec succès !');
        } catch (error) {
            console.error('❌ Erreur lors de la suppression du fournisseur:', error);
            console.log('🔄 Passage en mode mock');
            deleteMockSupplier(id);
        }
    };

    function deleteMockSupplier(id) {
        suppliersData = suppliersData.filter(supplier => supplier._id !== id);
        console.log('📦 Fournisseur supprimé en mode mock:', id);
        renderSuppliersList();
        alert('Fournisseur supprimé en mode local !');
    }

    // Variable pour stocker l'ID du fournisseur actuel
    let currentSupplierId = null;

    // Fonction pour consulter le catalogue d'un fournisseur
    window.browseSupplierProducts = async function(supplierId, supplierName) {
        console.log('🛒 Consultation du catalogue du fournisseur:', supplierName);
        
        // Stocker l'ID du fournisseur pour les commandes
        currentSupplierId = supplierId;
        
        try {
            // Charger les produits du fournisseur
            const response = await fetch(`/api/products/supplier/${supplierId}`, {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                headers: {
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
}
            });
            
            let products = [];
            if (response.ok) {
                products = await response.json();
            } else {
                // Fallback avec des données mockées
                products = getMockProductsForSupplier(supplierId);
            }
            
            showSupplierCatalogModal(supplierName, products);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement du catalogue:', error);
            // Utiliser des données mockées en cas d'erreur
            const mockProducts = getMockProductsForSupplier(supplierId);
            showSupplierCatalogModal(supplierName, mockProducts);
        }
    };

    // Fonction pour récupérer l'ID du fournisseur actuel
    function getCurrentSupplierId() {
        return currentSupplierId;
    }

    // Données mockées pour les produits des fournisseurs
    function getMockProductsForSupplier(supplierId) {
        const mockProducts = {
            'mock1': [ // Fruits & Légumes SA
                { _id: 'p1', name: 'Tomates cerises', category: 'fruits-legumes', price: 3.50, unit: 'kg', deliveryTime: 1, minOrder: 5, description: 'Tomates cerises bio de saison', promo: 0, saveProduct: false },
                { _id: 'p2', name: 'Carottes bio', category: 'fruits-legumes', price: 2.20, unit: 'kg', deliveryTime: 1, minOrder: 10, description: 'Carottes biologiques fraîches', promo: 10, saveProduct: false },
                { _id: 'p3', name: 'Pommes Golden', category: 'fruits-legumes', price: 2.80, unit: 'kg', deliveryTime: 2, minOrder: 5, description: 'Pommes Golden du Val de Loire', promo: 0, saveProduct: true }
            ],
            'mock2': [ // Boucherie Martin
                { _id: 'p4', name: 'Filet de bœuf', category: 'viandes', price: 28.50, unit: 'kg', deliveryTime: 1, minOrder: 2, description: 'Filet de bœuf Charolais', promo: 0, saveProduct: false },
                { _id: 'p5', name: 'Côtelettes d\'agneau', category: 'viandes', price: 18.90, unit: 'kg', deliveryTime: 1, minOrder: 3, description: 'Côtelettes d\'agneau de pré-salé', promo: 15, saveProduct: false }
            ],
            'mock3': [ // Poissonnerie du Port
                { _id: 'p6', name: 'Saumon frais', category: 'poissons', price: 24.90, unit: 'kg', deliveryTime: 1, minOrder: 2, description: 'Saumon frais du jour', promo: 0, saveProduct: false },
                { _id: 'p7', name: 'Cabillaud', category: 'poissons', price: 19.50, unit: 'kg', deliveryTime: 1, minOrder: 3, description: 'Cabillaud frais de la mer du Nord', promo: 0, saveProduct: false }
            ],
            'mock4': [ // Produits Laitiers Bio
                { _id: 'p8', name: 'Lait bio 1L', category: 'produits-laitiers', price: 1.20, unit: 'litre', deliveryTime: 1, minOrder: 20, description: 'Lait biologique pasteurisé', promo: 0, saveProduct: false },
                { _id: 'p9', name: 'Fromage de chèvre', category: 'produits-laitiers', price: 8.50, unit: 'pièce', deliveryTime: 2, minOrder: 5, description: 'Fromage de chèvre artisanal', promo: 0, saveProduct: true }
            ],
            'mock5': [ // Épicerie Fine
                { _id: 'p10', name: 'Riz basmati', category: 'epicerie', price: 4.20, unit: 'kg', deliveryTime: 3, minOrder: 10, description: 'Riz basmati premium', promo: 0, saveProduct: false },
                { _id: 'p11', name: 'Épices mélange', category: 'epicerie', price: 12.90, unit: 'sachet', deliveryTime: 2, minOrder: 5, description: 'Mélange d\'épices méditerranéennes', promo: 20, saveProduct: false }
            ]
        };
        
        return mockProducts[supplierId] || [];
    }

    // Modal pour afficher le catalogue d'un fournisseur
    function showSupplierCatalogModal(supplierName, products) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content catalog-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-shopping-cart"></i> Catalogue - ${supplierName}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                
                <div class="catalog-filters">
                    <div class="form-group">
                        <label>Rechercher un produit :</label>
                        <input type="text" id="product-search" placeholder="Nom du produit..." class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Catégorie :</label>
                        <select id="category-filter" class="form-control">
                            <option value="">Toutes les catégories</option>
                            <option value="fruits-legumes">Fruits et Légumes</option>
                            <option value="viandes">Viandes</option>
                            <option value="poissons">Poissons</option>
                            <option value="epicerie">Épicerie</option>
                            <option value="produits-laitiers">Produits Laitiers</option>
                            <option value="boissons">Boissons</option>
                            <option value="autres">Autres</option>
                        </select>
                    </div>
                </div>
                
                <div class="products-catalog" id="products-catalog">
                    ${renderProductsCatalog(products)}
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Fermer</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Ajouter les écouteurs d'événements pour les filtres
        const searchInput = document.getElementById('product-search');
        const categoryFilter = document.getElementById('category-filter');
        
        const filterProducts = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedCategory = categoryFilter.value;
            
            const filteredProducts = products.filter(product => {
                const matchesSearch = product.name.toLowerCase().includes(searchTerm);
                const matchesCategory = !selectedCategory || product.category === selectedCategory;
                return matchesSearch && matchesCategory;
            });
            
            document.getElementById('products-catalog').innerHTML = renderProductsCatalog(filteredProducts);
        };
        
        searchInput.addEventListener('input', filterProducts);
        categoryFilter.addEventListener('change', filterProducts);
    }

    // Rendu du catalogue de produits
    function renderProductsCatalog(products) {
        if (products.length === 0) {
            return `
                <div class="empty-catalog">
                    <i class="fas fa-box-open"></i>
                    <h3>Aucun produit trouvé</h3>
                    <p>Ce fournisseur n'a pas encore de produits en vente.</p>
                </div>
            `;
        }
        
        return `
            <div class="products-grid">
                ${products.map(product => {
                    // Gestion des promotions (priorité: super promo > à sauver > promo normale)
                    const hasSuperPromo = product.superPromo?.active && product.superPromo.promoPrice;
                    const hasToSave = product.toSave?.active && product.toSave.savePrice;
                    const hasPromo = product.promo > 0 && !hasSuperPromo && !hasToSave;
                    
                    // Calculer le prix final
                    let finalPrice = product.price;
                    let priceDisplay = `${product.price.toFixed(2)}€`;
                    
                    if (hasSuperPromo) {
                      finalPrice = product.superPromo.promoPrice;
                      priceDisplay = `<span class="original-price" style="text-decoration: line-through; color: #999;">${product.price.toFixed(2)}€</span> <span class="promo-price" style="color: #f39c12; font-weight: bold; font-size: 1.2em;">${product.superPromo.promoPrice.toFixed(2)}€</span>`;
                    } else if (hasToSave) {
                      finalPrice = product.toSave.savePrice;
                      priceDisplay = `<span class="original-price" style="text-decoration: line-through; color: #999;">${product.price.toFixed(2)}€</span> <span class="save-price" style="color: #e74c3c; font-weight: bold; font-size: 1.2em;">${product.toSave.savePrice.toFixed(2)}€</span>`;
                    } else if (hasPromo) {
                      finalPrice = product.price * (1 - product.promo / 100);
                      priceDisplay = `<span class="original-price" style="text-decoration: line-through; color: #999;">${product.price.toFixed(2)}€</span> <span class="promo-price" style="color: #3498db; font-weight: bold;">${finalPrice.toFixed(2)}€</span>`;
                    }
                    
                    // Badges de promotion
                    const superPromoBadge = hasSuperPromo ? 
                      `<span class="super-promo-badge" style="background: #f39c12; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-right: 0.5rem;"><i class="fas fa-star"></i> Super Promo</span>` : '';
                    
                    const toSaveBadge = hasToSave ? 
                      `<span class="to-save-badge" style="background: #e74c3c; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85em; font-weight: bold; margin-right: 0.5rem;"><i class="fas fa-exclamation-triangle"></i> À Sauver</span>` : '';
                    
                    const promoBadge = hasPromo ? 
                      `<span class="promo-badge" style="background: #3498db; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85em; font-weight: 600; margin-right: 0.5rem;">-${product.promo}%</span>` : '';
                    
                    const saveBadge = product.saveProduct ? 
                      `<span class="save-badge" style="background: #95a5a6; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.85em; margin-right: 0.5rem;">Produit à sauver</span>` : '';
                    
                    return `
                        <div class="product-card" style="border: ${hasSuperPromo ? '2px solid #f39c12' : hasToSave ? '2px solid #e74c3c' : '1px solid #ddd'};">
                            <div class="product-header">
                                <h3>${product.name}</h3>
                                <div class="product-badges" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                                    ${superPromoBadge}
                                    ${toSaveBadge}
                                    ${promoBadge}
                                    ${saveBadge}
                                </div>
                            </div>
                            
                            <div class="product-info">
                                <p><strong>Catégorie:</strong> ${product.category}</p>
                                <p><strong>Prix:</strong> ${priceDisplay}/${product.unit}</p>
                                ${hasSuperPromo ? `
                                    <p style="color: #f39c12; font-weight: bold;"><i class="fas fa-star"></i> Super Promo: ${product.superPromo.promoQuantity || 'N/A'} ${product.unit} disponible(s)</p>
                                    ${product.superPromo.endDate ? `<p style="font-size: 0.9em; color: #666;">Jusqu'au ${new Date(product.superPromo.endDate).toLocaleDateString('fr-FR')}</p>` : ''}
                                ` : ''}
                                ${hasToSave ? `
                                    <p style="color: #e74c3c; font-weight: bold;"><i class="fas fa-exclamation-triangle"></i> À Sauver: ${product.toSave.saveQuantity || 'N/A'} ${product.unit}</p>
                                    ${product.toSave.expirationDate ? `<p style="font-size: 0.9em; color: #666;">Expire le ${new Date(product.toSave.expirationDate).toLocaleDateString('fr-FR')}</p>` : ''}
                                ` : ''}
                                <p><strong>Délai de livraison:</strong> ${product.deliveryTime} jour(s)</p>
                                <p><strong>Commande minimum:</strong> ${product.minOrder} ${product.unit}</p>
                                ${product.description ? `<p><strong>Description:</strong> ${product.description}</p>` : ''}
                            </div>
                            
                            <div class="product-actions">
                                <button class="btn-primary" onclick="orderProduct('${product._id}', '${product.name}', ${finalPrice}, '${product.unit}', ${product.minOrder})">
                                    <i class="fas fa-shopping-cart"></i> Commander
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Fonction pour passer une commande
    window.orderProduct = function(productId, productName, price, unit, minOrder) {
        console.log('🛒 Commande de produit:', productName);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content order-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-shopping-cart"></i> Commander ${productName}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                
                <form id="order-form">
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
                        <button type="button" class="btn-success" onclick="addToCart('${productId}', '${productName}', ${price}, '${unit}', ${minOrder})" style="background: #27ae60;">
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
        document.getElementById('order-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const quantity = parseInt(quantityInput.value);
            const total = price * quantity;
            
            const orderData = {
                supplier: getCurrentSupplierId(), // Fonction à implémenter
                items: [{
                    productId: productId,
                    quantity: quantity
                }],
                deliveryDate: document.getElementById('delivery-date').value,
                notes: document.getElementById('order-notes').value
            };
            
            try {
                // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
                const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

                const response = await fetchFn('/api/orders', {
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
                    
                    alert(`Commande confirmée !\n\nNuméro: ${result.data.orderNumber}\nProduit: ${productName}\nQuantité: ${quantity} ${unit}\nTotal: ${total.toFixed(2)}€\n\nLe fournisseur recevra votre commande et vous contactera pour confirmer la livraison.`);
                    
                    modal.remove();
                } else {
                    const error = await response.json();
                    throw new Error(error.message || 'Erreur lors de la création de la commande');
                }
                
            } catch (error) {
                console.error('❌ Erreur lors de la commande:', error);
                alert(`Erreur lors de la création de la commande: ${error.message}`);
            }
        });
    };
    
    // Gestion du changement de type d'établissement
    function initEstablishmentTypeHandler() {
        const establishmentSelect = document.getElementById('establishment-type-select');
        if (establishmentSelect) {
            establishmentSelect.addEventListener('change', toggleSpecializedFilters);
            // Appel initial
            toggleSpecializedFilters();
        }
    }
    
    function toggleSpecializedFilters() {
        const establishmentType = document.getElementById('establishment-type-select').value;
        console.log('🔄 Type d\'établissement sélectionné:', establishmentType);
        
        // Masquer tous les filtres spécialisés
        const ehpadFilters = document.getElementById('ehpad-filters');
        const hospitalFilters = document.getElementById('hospital-filters');
        const elderlyCareFilters = document.getElementById('elderly-care-filters');
        
        if (ehpadFilters) ehpadFilters.style.display = 'none';
        if (hospitalFilters) hospitalFilters.style.display = 'none';
        if (elderlyCareFilters) elderlyCareFilters.style.display = 'none';
        
        // Gestion des groupes d'âges (spécifiques aux cantines scolaires)
        const ageGroupElement = document.querySelector('.age-group');
        const ageGroupsSection = ageGroupElement ? ageGroupElement.closest('.form-group') : null;
        const addGroupBtn = document.getElementById('add-group-btn');
        
        // Masquer les groupes d'âges par défaut
        if (ageGroupsSection) {
            ageGroupsSection.style.display = 'none';
        }
        if (addGroupBtn) {
            addGroupBtn.style.display = 'none';
        }
        
        // Afficher les filtres appropriés selon le type
        switch(establishmentType) {
            case 'ehpad':
                if (ehpadFilters) {
                    ehpadFilters.style.display = 'block';
                    console.log('✅ Filtres EHPAD affichés');
                }
                break;
            case 'hopital':
                if (hospitalFilters) {
                    hospitalFilters.style.display = 'block';
                    console.log('✅ Filtres hôpital affichés');
                }
                break;
            case 'maison_de_retraite':
                if (elderlyCareFilters) {
                    elderlyCareFilters.style.display = 'block';
                    console.log('✅ Filtres maison de retraite affichés');
                }
                break;
            case 'cantine_scolaire':
                // Afficher les groupes d'âges pour les cantines scolaires
                if (ageGroupsSection) {
                    ageGroupsSection.style.display = 'block';
                    console.log('✅ Groupes d\'âges affichés pour cantine scolaire');
                }
                if (addGroupBtn) {
                    addGroupBtn.style.display = 'block';
                }
                break;
            case 'cantine_entreprise':
                // Afficher les groupes d'âges pour les cantines d'entreprise
                if (ageGroupsSection) {
                    ageGroupsSection.style.display = 'block';
                    console.log('✅ Groupes d\'âges affichés pour cantine d\'entreprise');
                }
                if (addGroupBtn) {
                    addGroupBtn.style.display = 'block';
                }
                break;
            case 'autre':
            default:
                console.log('ℹ️ Aucun filtre spécialisé pour ce type d\'établissement');
                break;
        }
    }
    
    // Gestion des boutons d'ajout/suppression pour les filtres spécialisés
    function initSpecializedFilters() {
        // EHPAD
        setupAddRemoveButtons('ehpad-texture', 'add-ehpad-texture-btn', 'ehpad-texture-container');
        setupAddRemoveButtons('ehpad-mastication', 'add-ehpad-mastication-btn', 'ehpad-mastication-container');
        setupAddRemoveButtons('ehpad-deglutition', 'add-ehpad-deglutition-btn', 'ehpad-deglutition-container');
        
        // Hôpital
        setupAddRemoveButtons('hospital-texture', 'add-hospital-texture-btn', 'hospital-texture-container');
        setupAddRemoveButtons('hospital-diet', 'add-hospital-diet-btn', 'hospital-diet-container');
        
        // Maison de retraite
        setupAddRemoveButtons('texture', 'add-texture-btn', 'texture-container');
        setupAddRemoveButtons('mastication', 'add-mastication-btn', 'mastication-container');
    }
    
    function setupAddRemoveButtons(type, addButtonId, containerId) {
        const addButton = document.getElementById(addButtonId);
        const container = document.getElementById(containerId);
        
        if (addButton && container) {
            addButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`➕ Ajout d'un élément ${type}`);
                const newItem = createFilterItem(type);
                container.appendChild(newItem);
            });
        }
    }
    
    function createFilterItem(type) {
        const newItem = document.createElement('div');
        newItem.className = 'restriction-item';
        
        let selectOptions = '';
        let removeClass = '';
        let nameAttribute = '';
        let ariaLabel = '';
        
        switch(type) {
            case 'ehpad-texture':
                selectOptions = `
                    <option value="TX_SOLID_7">Normal [TX_SOLID_7]</option>
                    <option value="TX_SOLID_6A">Tendre / Facile à mâcher (viandes/garni très tendres) [TX_SOLID_6A]</option>
                    <option value="TX_SOLID_6">Haché & Humide (morceaux ≤ 1 cm, liés avec sauce) [TX_SOLID_6]</option>
                    <option value="TX_SOLID_5A">Mouliné / Émincé fin (morceaux ≤ 4 mm, pas secs, sans fils ni peau) [TX_SOLID_5A]</option>
                    <option value="TX_SOLID_5B">Haché très fin & Lié (≤ 2 mm, forme pâteuse) [TX_SOLID_5B]</option>
                    <option value="TX_SOLID_4">Mixé lisse / Purée (texture homogène, tient sur la cuillère) [TX_SOLID_4]</option>
                `;
                removeClass = 'remove-ehpad-texture-btn';
                nameAttribute = 'ehpad-texture-level';
                ariaLabel = 'Niveau de texture IDDSI';
                break;
            case 'ehpad-mastication':
                selectOptions = `
                    <option value="MAST_FULL">Aucune difficulté [MAST_FULL]</option>
                    <option value="MAST_PARTIAL">Partielle / Prothèse stable (éviter croûtes dures) [MAST_PARTIAL]</option>
                    <option value="MAST_UNSTABLE">Prothèse instable / Douleurs (tendre, haché) [MAST_UNSTABLE]</option>
                    <option value="MAST_NONE">Édentation / Incapacité à mâcher (mouliné/mixé) [MAST_NONE]</option>
                `;
                removeClass = 'remove-ehpad-mastication-btn';
                nameAttribute = 'ehpad-mastication-level';
                ariaLabel = 'Niveau de mastication';
                break;
            case 'ehpad-deglutition':
                selectOptions = `
                    <option value="IDL_0">Liquide mince (eau, café…) [IDL_0]</option>
                    <option value="IDL_1">Légèrement épaissi (nectar) [IDL_1]</option>
                    <option value="IDL_2">Modérément épaissi (miel) [IDL_2]</option>
                    <option value="IDL_3">Fortement épaissi (pudding) [IDL_3]</option>
                    <option value="IDL_GEL">Eau gélifiée [IDL_GEL]</option>
                `;
                removeClass = 'remove-ehpad-deglutition-btn';
                nameAttribute = 'ehpad-deglutition-level';
                ariaLabel = 'Niveau de déglutition IDDSI';
                break;
            case 'hospital-texture':
                selectOptions = `
                    <option value="TEXTURE_NORMAL">Normal</option>
                    <option value="TEXTURE_TENDER">Tendre / Facile à mâcher</option>
                    <option value="TEXTURE_CHOPPED">Haché & Humide</option>
                    <option value="TEXTURE_PUREED">Mixé homogène</option>
                    <option value="TEXTURE_LIQUID_THICK">Liquide épaissi (nectar, miel, pudding)</option>
                `;
                removeClass = 'remove-hospital-texture-btn';
                nameAttribute = 'hospital-texture-level';
                ariaLabel = 'Niveau de texture';
                break;
            case 'hospital-diet':
                selectOptions = `
                    <option value="DIABETIC_45">Diabétique (45g glucides/repas)</option>
                    <option value="DIABETIC_60">Diabétique (60g glucides/repas)</option>
                    <option value="DIABETIC_75">Diabétique (75g glucides/repas)</option>
                    <option value="HYPOSODIC_5G">Hyposodé (5g sel/j)</option>
                    <option value="HYPOSODIC_2G">Hyposodé (2g sel/j)</option>
                    <option value="HYPOSODIC_NONE">Sans sel ajouté</option>
                    <option value="RENAL_LOW_K">IRC - Pauvre en potassium</option>
                    <option value="RENAL_LOW_P">IRC - Pauvre en phosphore</option>
                    <option value="RENAL_LOW_PROT">IRC - Pauvre en protéines</option>
                    <option value="LIVER_LOW_PROT">Hépatique - Restriction protéique</option>
                    <option value="LIVER_LOW_NA">Hépatique - Pauvre en sodium</option>
                    <option value="LIVER_LOW_FAT">Hépatique - Limitation graisses</option>
                    <option value="CANCER_HIGH_CAL">Cancer - Hypercalorique</option>
                    <option value="CANCER_HIGH_PROT">Cancer - Hyperprotéiné</option>
                    <option value="POST_SURG_LIQUID">Post-chirurgie - Liquide clair</option>
                    <option value="POST_SURG_FULL_LIQUID">Post-chirurgie - Liquide complet</option>
                    <option value="POST_SURG_PUREED">Post-chirurgie - Mixé</option>
                    <option value="NO_RESIDUE">Sans résidu (pré-examens)</option>
                    <option value="HIGH_FIBER">Riche en fibres</option>
                    <option value="HYPOCALORIC">Hypocalorique</option>
                    <option value="HYPERPROTEIN">Hyperprotéiné</option>
                    <option value="HYPERCALORIC">Hypercalorique</option>
                    <option value="NO_ADDED_SUGAR">Sans sucres ajoutés</option>
                `;
                removeClass = 'remove-hospital-diet-btn';
                nameAttribute = 'hospital-diet-type';
                ariaLabel = 'Type de régime thérapeutique';
                break;
            case 'texture':
                selectOptions = `
                    <option value="TX_SOLID_7">Normal [TX_SOLID_7]</option>
                    <option value="TX_SOLID_6A">Tendre / Facile à mâcher [TX_SOLID_6A]</option>
                    <option value="TX_SOLID_6">Haché & Humide (≤ 1 cm) [TX_SOLID_6]</option>
                    <option value="TX_SOLID_5A">Mouliné / Émincé fin (≤ 4 mm) [TX_SOLID_5A]</option>
                    <option value="TX_SOLID_5B">Haché très fin & Lié (≤ 2 mm) [TX_SOLID_5B]</option>
                    <option value="TX_SOLID_4">Mixé lisse / Purée [TX_SOLID_4]</option>
                `;
                removeClass = 'remove-texture-btn';
                nameAttribute = 'texture-level';
                ariaLabel = 'Niveau de texture';
                break;
            case 'mastication':
                selectOptions = `
                    <option value="MAST_FULL">Aucune difficulté [MAST_FULL]</option>
                    <option value="MAST_PARTIAL">Partielle / Prothèse stable [MAST_PARTIAL]</option>
                    <option value="MAST_UNSTABLE">Prothèse instable / Douleurs [MAST_UNSTABLE]</option>
                    <option value="MAST_NONE">Édentation / Incapacité à mâcher [MAST_NONE]</option>
                `;
                removeClass = 'remove-mastication-btn';
                nameAttribute = 'mastication-level';
                ariaLabel = 'Niveau de mastication';
                break;
        }
        
        newItem.innerHTML = `
            <select class="form-control" name="${nameAttribute}" aria-label="${ariaLabel}">${selectOptions}</select>
            <input type="number" class="form-control" name="${nameAttribute.replace('-level', '-count').replace('-type', '-count')}" min="1" placeholder="Nb. de pers." aria-label="Nombre de personnes">
            <button type="button" class="${removeClass}" style="background:none; color:#e74c3c; padding:0 5px;" aria-label="Supprimer">&times;</button>
        `;
        
        return newItem;
    }
    
    // Gestion des suppressions par délégation d'événements
    function initRemoveButtons() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-ehpad-texture-btn') || 
                e.target.classList.contains('remove-ehpad-mastication-btn') ||
                e.target.classList.contains('remove-ehpad-deglutition-btn') ||
                e.target.classList.contains('remove-hospital-texture-btn') ||
                e.target.classList.contains('remove-hospital-diet-btn') ||
                e.target.classList.contains('remove-texture-btn') ||
                e.target.classList.contains('remove-mastication-btn')) {
                e.target.closest('.restriction-item').remove();
            }
        });
    }
    
    // Gestion du formulaire de génération de menu
    function initMenuForm() {
        const form = document.getElementById('collectivite-menu-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Collecter les données des groupes d'âges
                const groups = [];
                const groupElements = document.querySelectorAll('.age-group');
                
                groupElements.forEach((group, index) => {
                    const ageRange = group.querySelector('select[name*="age-range"]').value;
                    const count = parseInt(group.querySelector('input[name*="count"]').value) || 0;
                    
                    // Collecter les restrictions
                    const restrictions = [];
                    const restrictionItems = group.querySelectorAll('.restriction-item');
                    
                    restrictionItems.forEach(item => {
                        const type = item.querySelector('select[name*="restriction-type"]').value;
                        const restrictionCount = parseInt(item.querySelector('input[name*="restriction-count"]').value) || 0;
                        
                        if (type && restrictionCount > 0) {
                            restrictions.push({ type, count: restrictionCount });
                        }
                    });
                    
                    groups.push({
                        ageRange,
                        count,
                        restrictions
                    });
                });
                
        const payload = {
                    establishmentType: document.getElementById('establishment-type-select').value,
                    groups,
                    totalServings: parseInt(document.getElementById('total-servings').value) || 0,
                    dishesToPrepare: parseInt(document.getElementById('dishes-to-prepare').value) || 3
                };
                
                console.log('Payload pour génération de menu:', payload);
        
        // Appel API pour générer le menu
        try {
                    const token = getToken();
                // 🍪 Token géré via cookie HTTP-Only (authentification automatique)

            // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
            const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

            const response = await fetchFn('/api/menus/generate-collectivite', {
                credentials: 'include', // 🍪 Cookie HTTP-Only
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
},
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la génération du menu');
            }

            const result = await response.json();
            console.log('Menu généré:', result);
            
            // Afficher le résultat
            if (result.success && result.menus) {
                displayGeneratedMenus(result.menus, result.metadata);
            } else {
                alert('Menu généré avec succès !');
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la génération du menu: ' + error.message);
        }
    });
        }
    }

// Fonction pour afficher les menus générés
function displayGeneratedMenus(menus, metadata) {
        const resultsContainer = document.getElementById('resultat-menu');
    
    let html = `
        <div class="menu-results">
            <h3>Menus générés pour ${metadata.establishmentType} (${metadata.totalPeople} personnes)</h3>
            <div class="menus-grid">
    `;
    
    menus.forEach((menu, index) => {
        html += `
                <div class="menu-suggestion-card">
                <h4>${menu.nom}</h4>
                <p class="menu-description">${menu.description}</p>
                <p class="menu-servings">Pour ${menu.personnes} personnes</p>
                
                <div class="ingredients-section">
                    <h5>Ingrédients nécessaires :</h5>
                    <ul>
                        ${menu.ingredients_necessaires.map(ing => 
                            `<li>${ing.quantite_ingredient} de ${ing.nom_ingredient}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="preparation-section">
                    <h5>Étapes de préparation :</h5>
                    <ol>
                        ${menu.etapes_preparation.map(step => `<li>${step}</li>`).join('')}
                    </ol>
                </div>
                
                ${menu.considerations_nutritionnelles ? `
                    <div class="nutrition-section">
                        <h5>Considérations nutritionnelles :</h5>
                        <p>${menu.considerations_nutritionnelles}</p>
                    </div>
                ` : ''}
                
                <div class="menu-actions">
                    <button class="btn btn-primary" onclick="useMenu(${index})">Utiliser ce menu</button>
                    <button class="btn btn-secondary" onclick="saveMenu(${index})">Sauvegarder</button>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
    
    // Stocker les menus pour les actions
    window.generatedMenus = menus;
}

    // Initialisation
    initTabs();
    initAgeGroups();
    initStock();
    initSuppliers();
    initMenuForm();
    initEstablishmentTypeHandler();
    initSpecializedFilters();
    initRemoveButtons();
    
    // Charger les données initiales
    loadStockData();
    loadSuppliersData();
    
    // Appliquer les filtres au chargement de la page
    setTimeout(() => {
        toggleSpecializedFilters();
    }, 100);
    
    // Gestion du bouton de déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Fonctions globales pour les menus
window.useMenu = function(menuIndex) {
    const menu = window.generatedMenus[menuIndex];
    if (!menu) return;
    
    // Demander le nombre de convives
    const guests = prompt(`Nombre de convives pour "${menu.nom}" :`, menu.personnes);
    if (!guests || isNaN(guests)) return;
    
    // Calculer les quantités à déduire
    const itemsToDeduct = menu.ingredients_necessaires.map(ingredient => {
        const ratio = parseInt(guests) / menu.personnes;
        const quantity = parseFloat(ingredient.quantite_ingredient) * ratio;
        return {
            name: ingredient.nom_ingredient,
            quantity: quantity,
            unit: ingredient.quantite_ingredient.split(' ').pop() || 'unité'
        };
    });
    
    // Appeler l'API de déduction
    deductStockItems(itemsToDeduct);
};

window.saveMenu = function(menuIndex) {
    const menu = window.generatedMenus[menuIndex];
    if (!menu) return;
    
    // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

    // Appeler l'API de sauvegarde
    // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
    fetchFn('/api/menus/save', {
        credentials: 'include', // 🍪 Cookie HTTP-Only
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
},
        body: JSON.stringify({
            title: menu.nom,
            theme: 'Collectivité',
            mode: 'collectivite-generated',
            courses: [menu]
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Menu sauvegardé avec succès !');
        } else {
            alert('Erreur lors de la sauvegarde');
        }
    })
    .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la sauvegarde');
    });
};

// Fonction pour déduire les ingrédients du stock
async function deductStockItems(itemsToDeduct) {
    try {
        // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
        const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

        const response = await fetchFn('/api/stock/deduct', {
            credentials: 'include', // 🍪 Cookie HTTP-Only
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
},
            body: JSON.stringify({ itemsToDeduct })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de la déduction du stock');
        }
        
        const result = await response.json();
        alert(`Stock mis à jour ! ${result.data.deductedItems.length} ingrédient(s) déduit(s).`);
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la déduction du stock: ' + error.message);
    }
}

// ========== SYSTÈME DE PANIER ==========

window.addToCart = function(productId, productName, price, unit, minOrder) {
    const quantityInput = document.getElementById('order-quantity');
    const quantity = parseInt(quantityInput.value) || minOrder;
    
    // Vérifier si le produit est déjà dans le panier
    const existingItemIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex !== -1) {
        // Augmenter la quantité
        cart[existingItemIndex].quantity += quantity;
        cart[existingItemIndex].total = cart[existingItemIndex].price * cart[existingItemIndex].quantity;
    } else {
        // Ajouter au panier
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
    alert(`${productName} ajouté au panier !`);
    
    // Fermer la modal
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
};

function getCurrentSupplierName() {
    const supplier = suppliersData.find(s => s._id === currentSupplierId);
    return supplier ? supplier.name : 'Fournisseur';
}

function updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Fonction pour calculer les frais de livraison
async function calculateDeliveryFeeForCart(supplierId, siteCity, sitePostalCode, orderTotal) {
    try {
        const response = await fetch(`/api/suppliers/${supplierId}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            console.warn(`⚠️ Impossible de récupérer les infos du fournisseur ${supplierId}`);
            return { fee: 0, message: 'Information non disponible' };
        }
        
        const result = await response.json();
        const supplier = result.data;
        
        if (!supplier || !supplier.deliveryZones || supplier.deliveryZones.length === 0) {
            return { fee: 0, message: 'Pas de zone de livraison définie' };
        }
        
            // Normaliser les noms de villes (gérer les accents et variations)
            const normalizeCityName = (city) => {
                if (!city) return '';
                return city.toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
                    .trim();
            };
            
            // Mappings pour les variations de noms de villes
            const cityMappings = {
                'bruxelles': ['brussels', 'bruxelles', 'brussel'],
                'brussels': ['brussels', 'bruxelles', 'brussel'],
                'brussel': ['brussels', 'bruxelles', 'brussel'],
                'anvers': ['antwerp', 'anvers', 'antwerpen'],
                'antwerp': ['antwerp', 'anvers', 'antwerpen'],
                'antwerpen': ['antwerp', 'anvers', 'antwerpen'],
                'gand': ['ghent', 'gand', 'gent'],
                'ghent': ['ghent', 'gand', 'gent'],
                'gent': ['ghent', 'gand', 'gent'],
                'liege': ['liege', 'luik'],
                'luik': ['liege', 'luik'],
                'charleroi': ['charleroi'],
                'namur': ['namur', 'namen'],
                'namen': ['namur', 'namen'],
                'brugge': ['brugge', 'bruges'],
                'bruges': ['brugge', 'bruges'],
                'oostende': ['oostende', 'ostende', 'ostend'],
                'ostende': ['oostende', 'ostende', 'ostend'],
                'ostend': ['oostende', 'ostende', 'ostend']
            };
            
            const getCityVariations = (city) => {
                const normalized = normalizeCityName(city);
                return cityMappings[normalized] || [normalized];
            };
            
            // Trouver la zone de livraison correspondante
            console.log(`🔍 Recherche zone pour site: ${siteCity} (${sitePostalCode})`);
            console.log(`📦 Zones disponibles:`, supplier.deliveryZones.map(z => `${z.city} (${z.postalCode || 'N/A'})`));
            
            const matchingZone = supplier.deliveryZones.find(zone => {
                // Vérifier par code postal d'abord (plus précis)
                if (sitePostalCode && zone.postalCode) {
                    const match = zone.postalCode.trim() === sitePostalCode.trim();
                    if (match) console.log(`✅ Correspondance par code postal: ${zone.postalCode}`);
                    return match;
                }
                
                // Sinon vérifier par ville (avec variations)
                if (siteCity && zone.city) {
                    const siteCityNormalized = normalizeCityName(siteCity);
                    const zoneCityNormalized = normalizeCityName(zone.city);
                    const siteCityVariations = getCityVariations(siteCity);
                    const zoneCityVariations = getCityVariations(zone.city);
                    
                    // Vérifier si les villes correspondent (directement ou via variations)
                    const match = siteCityNormalized === zoneCityNormalized ||
                                 siteCityVariations.some(v => zoneCityVariations.includes(v)) ||
                                 zoneCityVariations.some(v => siteCityVariations.includes(v));
                    
                    if (match) {
                        console.log(`✅ Correspondance par ville: ${zone.city} (site: ${siteCity})`);
                    }
                    return match;
                }
                
                return false;
            });
            
            if (!matchingZone) {
                console.warn(`⚠️ Aucune zone trouvée pour ${siteCity} (${sitePostalCode})`);
                return { fee: 0, message: 'Zone non couverte' };
            }
            
            if (!matchingZone.deliveryRules) {
                console.warn(`⚠️ Zone trouvée mais pas de règles de livraison: ${matchingZone.city}`);
                return { fee: 0, message: 'Pas de règles de livraison définies pour cette zone' };
            }
        
        const rules = matchingZone.deliveryRules;
        
        if (rules.freeDeliveryThreshold && orderTotal >= rules.freeDeliveryThreshold) {
            return { 
                fee: 0, 
                message: `Livraison gratuite (commande ≥ ${rules.freeDeliveryThreshold}€)`,
                threshold: rules.freeDeliveryThreshold
            };
        } else {
            return { 
                fee: rules.deliveryFee || 0, 
                message: rules.freeDeliveryThreshold 
                    ? `Frais de livraison: ${rules.deliveryFee || 0}€ (gratuit à partir de ${rules.freeDeliveryThreshold}€)`
                    : `Frais de livraison: ${rules.deliveryFee || 0}€`,
                threshold: rules.freeDeliveryThreshold
            };
        }
    } catch (error) {
        console.error('❌ Erreur calcul frais livraison:', error);
        return { fee: 0, message: 'Erreur de calcul' };
    }
}

window.showCart = async function() {
    if (cart.length === 0) {
        alert('Votre panier est vide');
        return;
    }
    
    // Récupérer les informations du site
    let siteCity = '';
    let sitePostalCode = '';
    try {
        // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
        const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
        if (user?.siteId) {
            const siteResponse = await fetch(`/api/sites/${user.siteId}`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (siteResponse.ok) {
                const site = await siteResponse.json();
                siteCity = site.address?.city || '';
                sitePostalCode = site.address?.postalCode || '';
            }
        }
    } catch (error) {
        console.warn('⚠️ Impossible de récupérer les infos du site:', error);
    }
    
    // Calculer le total des produits
    const productsTotal = cart.reduce((sum, item) => sum + item.total, 0);
    
    // Grouper les articles par fournisseur et calculer les frais de livraison
    const suppliersInCart = [...new Set(cart.map(item => item.supplierId))];
    const deliveryFees = {};
    let totalDeliveryFees = 0;
    
    // Calculer les frais pour chaque fournisseur
    for (const supplierId of suppliersInCart) {
        const supplierTotal = cart
            .filter(item => item.supplierId === supplierId)
            .reduce((sum, item) => sum + item.total, 0);
        
        const deliveryInfo = await calculateDeliveryFeeForCart(supplierId, siteCity, sitePostalCode, supplierTotal);
        deliveryFees[supplierId] = deliveryInfo;
        totalDeliveryFees += deliveryInfo.fee;
    }
    
    const grandTotal = productsTotal + totalDeliveryFees;
    
    // Créer la modal du panier
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'cart-modal';
    modal.innerHTML = `
        <div class="modal-content order-modal" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
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
                                           onchange="updateCartItemQuantity(${index}, this.value)">
                                    ${item.unit}
                                </td>
                                <td style="text-align: right; padding: 0.75rem;">${item.price.toFixed(2)}€/${item.unit}</td>
                                <td style="text-align: right; padding: 0.75rem; font-weight: bold;">${item.total.toFixed(2)}€</td>
                                <td style="text-align: center; padding: 0.75rem;">
                                    <button onclick="removeFromCart(${index})" 
                                            style="background: #e74c3c; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="border-top: 2px solid #ddd;">
                            <td colspan="4" style="text-align: right; padding: 0.75rem; font-weight: bold;">Sous-total produits:</td>
                            <td style="text-align: right; padding: 0.75rem; font-weight: bold;">${productsTotal.toFixed(2)}€</td>
                            <td></td>
                        </tr>
                        ${Object.entries(deliveryFees).map(([supplierId, info]) => {
                            const supplierName = cart.find(item => item.supplierId === supplierId)?.supplierName || 'Fournisseur';
                            return `
                                <tr style="border-top: 1px solid #eee;">
                                    <td colspan="4" style="text-align: right; padding: 0.75rem; font-size: 0.9rem; color: #555;">
                                        <i class="fas fa-truck" style="margin-right: 0.5rem; color: #3498db;"></i>
                                        Livraison ${supplierName}:
                                        <br><small style="font-size: 0.8rem; color: #7f8c8d;">${info.message}</small>
                                    </td>
                                    <td style="text-align: right; padding: 0.75rem; font-weight: bold; color: ${info.fee === 0 ? '#27ae60' : '#e67e22'};">
                                        ${info.fee === 0 ? 'Gratuit' : `${info.fee.toFixed(2)}€`}
                                    </td>
                                    <td></td>
                                </tr>
                            `;
                        }).join('')}
                        <tr style="border-top: 2px solid #ddd; background: #f8f9fa;">
                            <td colspan="4" style="text-align: right; padding: 1rem; font-weight: bold; font-size: 1.2rem;">Total général:</td>
                            <td style="text-align: right; padding: 1rem; font-weight: bold; font-size: 1.2rem; color: #27ae60;">${grandTotal.toFixed(2)}€</td>
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
                    <button type="button" class="btn-secondary" onclick="clearCart()">
                        <i class="fas fa-trash"></i> Vider le panier
                    </button>
                    <button type="button" class="btn-primary" onclick="checkoutCart()">
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
};

window.updateCartItemQuantity = function(index, newQuantity) {
    const quantity = parseInt(newQuantity);
    if (quantity > 0) {
        cart[index].quantity = quantity;
        cart[index].total = cart[index].price * quantity;
        updateCartCount();
        // Recharger la modal du panier
        document.getElementById('cart-modal').remove();
        showCart();
    }
};

window.removeFromCart = function(index) {
    const item = cart[index];
    cart.splice(index, 1);
    updateCartCount();
    alert(`${item.productName} retiré du panier`);
    
    if (cart.length === 0) {
        document.getElementById('cart-modal').remove();
    } else {
        // Recharger la modal du panier
        document.getElementById('cart-modal').remove();
        showCart();
    }
};

window.clearCart = function() {
    if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
        cart = [];
        updateCartCount();
        document.getElementById('cart-modal').remove();
        alert('Panier vidé');
    }
};

window.checkoutCart = async function() {
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
    
    // Grouper les articles par fournisseur
    const ordersBySupplier = {};
    cart.forEach(item => {
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
            
            // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
            const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

            const response = await fetchFn('/api/orders', {
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
        cart = [];
        updateCartCount();
        document.getElementById('cart-modal').remove();
        
    } catch (error) {
        console.error('❌ Erreur lors de la validation du panier:', error);
        alert(`Erreur: ${error.message}`);
    }
};

// ========== SUIVI DES COMMANDES ==========

window.showMyOrders = async function() {
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
        
        displayMyOrdersModal(orders);
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des commandes:', error);
        alert('Erreur lors du chargement des commandes');
    }
};

function displayMyOrdersModal(orders) {
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
                                            <button onclick="cancelMyOrder('${order._id}')" 
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

window.cancelMyOrder = async function(orderId) {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
        return;
    }
    
    try {
        // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
        const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

        const response = await fetchFn(`/api/orders/${orderId}/cancel`, {
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
        
        alert('Commande annulée');
        
        // Fermer et rouvrir la modal
        document.getElementById('my-orders-modal').remove();
        await showMyOrders();
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'annulation:', error);
        alert('Erreur lors de l\'annulation de la commande');
    }
};