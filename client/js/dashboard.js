// client/js/dashboard.js
function formatDate(dateString, format = 'DD/MM/YYYY') { // Ajout d'un format par défaut
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-'; // Gérer date invalide
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    if (format === 'DD MMMM') return `${day} ${date.toLocaleString('fr-FR', { month: 'long' })}`;
    return `${day}/${month}/${year}`;
}function isDateToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}
function isDateTomorrow(date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear();
}


document.addEventListener('DOMContentLoaded', function() {
    console.log("DASHBOARD: DOMContentLoaded - Initialisation pour accueil.html");

    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    let user = null;

    if (userString) {
        try {
            user = JSON.parse(userString);
        } catch (e) {
            console.error("DASHBOARD: Erreur parsing user localStorage", e);
        }
    }

    if (!token || !user) {
        console.log("DASHBOARD: Non authentifié. Redirection.");
        window.location.href = 'index.html';
        return;
    }
    if (user.role !== 'resto') {
        console.log(`DASHBOARD: Rôle ${user.role} non autorisé. Redirection.`);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
        return;
    }
    console.log(`DASHBOARD: Authentifié: ${user.name}, Rôle: ${user.role}`);

    const logoutBtn = document.querySelector('nav .logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            console.log("DASHBOARD: Déconnexion...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Nettoyer les anciennes clés si elles existent encore pour une transition propre
            ['chaif-ses-authenticated', 'chaif-ses-user-id', 'chaif-ses-user-email', 'chaif-ses-user-name', 'chaif-ses-user-role', 'chaif-ses-session-start', 'redirect-count'].forEach(key => localStorage.removeItem(key));
            window.location.href = 'index.html';
        });
    }

    loadDashboardData();
    if (typeof initQuickActions === 'function') initQuickActions();
});

function loadDashboardData() {
    console.log("DASHBOARD: loadDashboardData appelée");
    loadStockData();
    // Appelez ici vos autres fonctions de chargement pour le planning, les alertes (autres que stock), etc.
    // loadPlanningData();
    // loadDashboardAlerts(); // Renommé pour éviter confusion avec la fonction loadAlerts que vous aviez
    // loadSupplierData();
}




function loadStockData() {
    console.log("DASHBOARD: loadStockData appelée");
    let ingredients = JSON.parse(localStorage.getItem('stock') || '[]');

    if (ingredients.length === 0) {
        console.log("DASHBOARD: Aucun ingrédient dans localStorage pour 'stock'.");
        // ingredients = getDemoIngredients(); 
    }
    
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    const expiryAlertLeadDays = parseInt(settings.expiryAlertDays) || 10; 

    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    let totalIngredientsCount = ingredients.length;
    let lowStockItems = []; 
    let expiringSoonItems = []; 
    let alreadyExpiredItems = []; 

    ingredients.forEach((ingredient) => {
        const quantity = parseFloat(ingredient.qte);
        const threshold = parseFloat(ingredient.seuilAlerte);
        const alertIsActive = ingredient.alerteActive === true;

        if (alertIsActive && !isNaN(threshold) && threshold > 0 && !isNaN(quantity) && quantity <= threshold) {
            lowStockItems.push(ingredient);
        }
        
        const expiryString = ingredient.dateExpiration;
        if (expiryString) {
            const expiryDate = new Date(expiryString);
            if (!isNaN(expiryDate.getTime())) {
                expiryDate.setHours(0, 0, 0, 0); 
                
                const alertEndDateLimit = new Date();
                alertEndDateLimit.setDate(today.getDate() + expiryAlertLeadDays); 
                alertEndDateLimit.setHours(0, 0, 0, 0);

                if (expiryDate < today) {
                    alreadyExpiredItems.push(ingredient);
                } else if (expiryDate <= alertEndDateLimit) {
                    expiringSoonItems.push(ingredient);
                }
            }
        }
    });
    
    // --- Mise à jour des Compteurs dans les Stat Cards ---
    const totalIngredientsEl = document.getElementById('total-ingredients');
    const lowStockCountEl = document.getElementById('low-stock-count');
    const expiringSoonCountEl = document.getElementById('expiring-soon-count');
    const expiredItemsCountEl = document.getElementById('expired-items-count');

    if (totalIngredientsEl) totalIngredientsEl.innerHTML = totalIngredientsCount;
    if (lowStockCountEl) lowStockCountEl.innerHTML = lowStockItems.length;
    if (expiringSoonCountEl) expiringSoonCountEl.innerHTML = expiringSoonItems.length;
    if (expiredItemsCountEl) expiredItemsCountEl.innerHTML = alreadyExpiredItems.length;

    // --- Mise à jour des Titres des Listes Détaillées (avec les compteurs) ---
    const lowStockCountDetailEl = document.getElementById('low-stock-count-detail');
    const expiringSoonCountDetailEl = document.getElementById('expiring-soon-count-detail');
    const expiredItemsCountDetailEl = document.getElementById('expired-items-count-detail');

    if(lowStockCountDetailEl) lowStockCountDetailEl.textContent = lowStockItems.length;
    if(expiringSoonCountDetailEl) expiringSoonCountDetailEl.textContent = expiringSoonItems.length;
    if(expiredItemsCountDetailEl) expiredItemsCountDetailEl.textContent = alreadyExpiredItems.length;

    // --- Mise à jour des Listes Détaillées d'Ingrédients ---
    const lowStockListEl = document.getElementById('low-stock-ingredient-list');
    const expiringSoonListEl = document.getElementById('expiring-soon-ingredient-list');
    const expiredListEl = document.getElementById('expired-ingredient-list');

    // Fonction pour générer la liste HTML des ingrédients
// Dans client/js/dashboard.js

// ... (vos imports et autres fonctions comme formatDate, etc.)

// Dans client/js/dashboard.js

// ... (vos imports et autres fonctions comme formatDate, etc.)

function renderDetailedIngredientList(ulElement, itemList, listTitle) {
    if (ulElement) {
        ulElement.innerHTML = ''; // Vider la liste précédente
        const parentContainer = ulElement.parentNode; 

        // Supprimer l'ancien bouton d'action s'il existe
        const oldActionButton = parentContainer.querySelector('.btn-action-list');
        if (oldActionButton) {
            oldActionButton.remove();
        }

        if (itemList.length > 0) {
            itemList.slice(0, 5).forEach(item => {
                const li = document.createElement('li');
                let details = `${item.nom} (${item.qte} ${item.unite || ''})`;
                if (item.dateExpiration && (listTitle === 'Bientôt Périmés' || listTitle === 'Périmés')) {
                    details += ` - Exp: ${formatDate(item.dateExpiration, 'DD/MM/YYYY')}`;
                }
                if (item.seuilAlerte && (listTitle === 'En Stock Bas')) { 
                    details += ` (Seuil: ${item.seuilAlerte})`;
                }
                li.textContent = details;
                ulElement.appendChild(li);
            });

            if (itemList.length > 5) {
                const liMore = document.createElement('li');
                // Modifié pour que le lien "voir stock" soit plus pertinent pour la section
                let stockLinkAnchor = listTitle === 'En Stock Bas' ? '#low' : (listTitle === 'Bientôt Périmés' ? '#expiring' : (listTitle === 'Périmés' ? '#expired' : ''));
                liMore.innerHTML = `<small><i>et ${itemList.length - 5} autre(s)... <a href="stock.html${stockLinkAnchor}" style="font-size:1em; color:var(--secondary, #e67e22);">voir stock</a></i></small>`;
                ulElement.appendChild(liMore);
            }

            // Ajout des boutons d'action conditionnels
            let actionButtonHtml = '';
            const itemNamesForQuery = encodeURIComponent(itemList.map(i => i.nom).join(','));

            if (listTitle === 'En Stock Bas') {
                actionButtonHtml = `<a href="suppliers.html?action=order&items=${itemNamesForQuery}" class="btn-secondary btn-small btn-action-list" style="margin-top:10px; display:inline-block;">Commander</a>`;
            } else if (listTitle === 'Bientôt Périmés') {
                // MODIFICATION ICI : Rediriger vers menu.html
                actionButtonHtml = `<a href="menu.html?useIngredients=${itemNamesForQuery}&reason=expiring_soon" class="btn-secondary btn-small btn-action-list" style="margin-top:10px; display:inline-block;">Utiliser dans Menu</a>`;
            } else if (listTitle === 'Périmés') {
                 actionButtonHtml = `<a href="stock.html#expired" class="btn-secondary btn-small btn-action-list" style="margin-top:10px; display:inline-block;">Gérer Périmés</a>`;
            }
            
            if (actionButtonHtml) {
                ulElement.insertAdjacentHTML('afterend', actionButtonHtml);
            }

        } else {
            const liEmpty = document.createElement('li');
            liEmpty.className = 'empty-list-placeholder';
            let placeholderText = 'Aucun ingrédient dans cette catégorie.';
            if (ulElement.previousElementSibling && ulElement.previousElementSibling.textContent) {
                 placeholderText = ulElement.previousElementSibling.textContent.includes('Stock Bas') ? 'Aucun ingrédient en stock bas.' : 
                                   ulElement.previousElementSibling.textContent.includes('Bientôt Périmés') ? 'Aucun ingrédient ne périme bientôt.' :
                                   'Aucun ingrédient périmé.';
            }
            liEmpty.textContent = placeholderText;
            ulElement.appendChild(liEmpty);
        }
    } else {
        console.warn(`Conteneur UL pour la liste détaillée "${listTitle}" non trouvé.`);
    }
}

// Assurez-vous que formatDate est disponible
function formatDate(dateString, format = 'DD/MM/YYYY') {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date invalide';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    if (format === 'DD MMMM') return `${day} ${date.toLocaleString('fr-FR', { month: 'long' })}`;
    return `${day}/${month}/${year}`;
}
// Dans la fonction loadStockData, assurez-vous de passer le listTitle:
    renderDetailedIngredientList(lowStockListEl, lowStockItems, 'En Stock Bas');
    renderDetailedIngredientList(expiringSoonListEl, expiringSoonItems, 'Bientôt Périmés');
    renderDetailedIngredientList(expiredListEl, alreadyExpiredItems, 'Périmés');
// ...

// function formatDate(dateString, format = 'DD/MM/YYYY') { /* ... */ }}function getDemoIngredients() {
    console.log("DASHBOARD: getDemoIngredients appelée");
    return [
        { id: 1, nom: 'Tomates', qte: 2, unite: 'kg', seuilAlerte: 5, alerteActive: true, dateExpiration: new Date(Date.now() + 3 * 24*60*60*1000).toISOString().split('T')[0] },
        { id: 2, nom: 'Pâtes', qte: 10, unite: 'kg', seuilAlerte: 3, alerteActive: true, dateExpiration: new Date(Date.now() + 15 * 24*60*60*1000).toISOString().split('T')[0] },
        { id: 3, nom: 'Fromage', qte: 1, unite: 'kg', seuilAlerte: 0.5, alerteActive: false, dateExpiration: new Date(Date.now() + 8 * 24*60*60*1000).toISOString().split('T')[0] },
    ];
}

function loadPlanningData() { 
    console.log("DASHBOARD: loadPlanningData - à implémenter pour charger depuis API/localStorage.");
    const el = document.getElementById('upcoming-menus');
    if(el) el.innerHTML = "<div class='loading-container'><p>Planning à venir (données réelles à charger).</p></div>";
}
function loadAlerts() { 
    console.log("DASHBOARD: loadAlerts - à implémenter pour les alertes non liées au stock (ex: commandes).");
    const el = document.getElementById('alerts-container');
    if(el) el.innerHTML = "<div class='loading-container'><p>Autres alertes (données réelles à charger).</p></div>";
}
function loadSupplierData() { 
    console.log("DASHBOARD: loadSupplierData - à implémenter pour charger depuis API/localStorage.");
    const totalSuppliersEl = document.getElementById('total-suppliers');
    const pendingOrdersEl = document.getElementById('pending-orders');
    if(totalSuppliersEl) totalSuppliersEl.innerHTML = "0";
    if(pendingOrdersEl) pendingOrdersEl.innerHTML = "0";
}
function initQuickActions() {
    console.log("DASHBOARD: initQuickActions appelée.");
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    if(addIngredientBtn) addIngredientBtn.addEventListener('click', () => { window.location.href = 'stock.html#add'; });
    
    const createMenuBtn = document.getElementById('create-menu-btn');
    if(createMenuBtn) createMenuBtn.addEventListener('click', () => { window.location.href = 'menu.html#create'; });

    const placeOrderBtn = document.getElementById('place-order-btn');
    if(placeOrderBtn) placeOrderBtn.addEventListener('click', () => { window.location.href = 'suppliers.html#order'; });
    
    const exportStockBtn = document.getElementById('export-stock-btn');
    if(exportStockBtn) exportStockBtn.addEventListener('click', () => { 
        console.log("Export de l'inventaire non implémenté.");
        // Supposer que showToast est disponible globalement ou importé
        if (typeof showToast === 'function') showToast("Fonctionnalité d'exportation non implémentée.", "info");
        else alert("Fonctionnalité d'exportation non implémentée.");
    });
}function checkAndNotifyExpiringItems() {
    console.log("DASHBOARD: checkAndNotifyExpiringItems à implémenter si des notifications actives sont souhaitées.");
}

// Définitions des fonctions de démo si vous les utilisez toujours pour le planning/menus/fournisseurs
function getDemoPlanning() { return []; }
function getDemoMenus() { return []; }
function getDemoSuppliers() { return []; }
function getMenuNameById(id) { return `Menu ID ${id} (Démo)`; }


