import { fetchProtectedAPI } from './apiHelper.js'; 
import { showToast } from './utils.js'; 

const ingredientCategories = {
  // Poissons
  'poisson': ['poisson', 'saumon', 'thon', 'dorade', 'cabillaud', 'merlu', 'truite', 'raie', 'aile de raie', 'ailes de raie', 'sole', 'bar', 'loup', 'merlan', 'sardine', 'anchois', 'hareng', 'maquereau', 'lotte', 'julienne', 'colin', 'crevette', 'gambas', 'langoustine', 'homard', 'langouste', 'crabe', 'moule', 'huître', 'palourde', 'coquille', 'st-jacques', 'saint-jacques', 'calamars', 'poulpe', 'seiche'],
  // Viandes
  'viande': ['viande', 'boeuf', 'poulet', 'dinde', 'porc', 'veau', 'agneau', 'lapin', 'canard', 'cheval', 'foie', 'gésier', 'coeur', 'rognon', 'tripe', 'ris de veau', 'jambon', 'lard', 'bacon', 'saucisse', 'saucisson', 'chorizo', 'salami', 'pâté', 'terrine', 'andouillette', 'boudin', 'merguez', 'chipolata', 'côte', 'entrecôte', 'filet', 'cuisse', 'aile', 'escalope', 'gigot', 'épaule'],
  // Légumes
  'légume': ['légume', 'carotte', 'pomme de terre', 'oignon', 'poireau', 'ail', 'échalote', 'tomate', 'courgette', 'aubergine', 'poivron', 'salade', 'laitue', 'endive', 'épinard', 'brocoli', 'chou', 'chou-fleur', 'asperge', 'artichaut', 'céleri', 'fenouil', 'betterave', 'radis', 'navet', 'champignon', 'maïs', 'petit pois', 'haricot vert', 'haricot blanc', 'lentille', 'pois chiche', 'concombre', 'avocat', 'olive'],
  // Fruits
  'fruit': ['fruit', 'pomme', 'poire', 'banane', 'orange', 'citron', 'pamplemousse', 'mandarine', 'clémentine', 'ananas', 'mangue', 'kiwi', 'fraise', 'framboise', 'myrtille', 'mûre', 'groseille', 'cassis', 'cerise', 'abricot', 'pêche', 'nectarine', 'prune', 'mirabelle', 'raisin', 'melon', 'pastèque', 'figue', 'grenade', 'papaye', 'goyave', 'litchi', 'noix de coco', 'datte', 'châtaigne', 'marron'],
  // Épices
  'épice': ['épice', 'sel', 'poivre', 'cannelle', 'muscade', 'vanille', 'curry', 'cumin', 'coriandre', 'paprika', 'piment', 'thym', 'romarin', 'laurier', 'basilic', 'persil', 'menthe', 'safran', 'gingembre', 'cardamome', 'clou de girofle', 'anis', 'badiane', 'herbe', 'bouquet garni', 'estragon', 'ciboulette', 'aneth', 'curcuma', 'ras el hanout', 'garam masala', 'quatre-épices', 'piment d\'espelette'],
  // Produits laitiers
  'produit laitier': ['lait', 'crème', 'beurre', 'fromage', 'yaourt', 'yogourt', 'camembert', 'brie', 'emmental', 'gruyère', 'comté', 'roquefort', 'bleu', 'chèvre', 'mozzarella', 'parmesan', 'ricotta', 'mascarpone', 'feta', 'crème fraîche', 'crème liquide', 'lait de coco', 'petit-suisse', 'faisselle', 'cottage cheese', 'kéfir', 'babeurre', 'lait fermenté'],
  // Céréales
  'céréale': ['céréale', 'riz', 'pâtes', 'spaghetti', 'macaroni', 'blé', 'semoule', 'couscous', 'quinoa', 'boulgour', 'orge', 'avoine', 'millet', 'sarrasin', 'tapioca', 'polenta', 'maïzena', 'farine', 'pain', 'baguette', 'biscottes', 'crackers', 'flocon d\'avoine', 'muesli', 'céréales petit déjeuner'],
  // Liquides
  'liquide': ['eau', 'huile', 'vinaigre', 'vin', 'bière', 'cidre', 'spiritueux', 'rhum', 'whisky', 'cognac', 'vodka', 'jus', 'sirop', 'soda', 'limonade', 'café', 'thé', 'chocolat chaud', 'infusion', 'bouillon', 'fond', 'sauce', 'ketchup', 'mayonnaise', 'moutarde', 'huile d\'olive', 'huile de tournesol', 'huile de colza', 'huile de sésame', 'vinaigre balsamique', 'vinaigre de vin', 'vin blanc', 'vin rouge'],
  'autre': [] // Catégorie par défaut pour ceux non listés explicitement
};

const ingredientsComplets = [
  // Ingrédients de base
  'Ail', 'Ananas', 'Aubergine', 'Avoine', 'Avocat',
  'Banane', 'Betterave', 'Beurre', 'Blé', 'Boeuf',
  'Café', 'Cannelle', 'Carottes', 'Céleri', 'Champignons', 'Chocolat', 'Chou', 'Citron', 'Concombre', 'Coriandre', 'Courgette', 'Crème',
  'Eau', 'Epaule d\'agneau', 'Epinards',
  'Farine', 'Fraise', 'Framboises', 'Fromage',
  'Gingembre', 'Glace',
  'Haricots', 'Huile d\'olive', 'Huile',
  'Jambon',
  'Kiwi',
  'Lait', 'Laitue', 'Légumes', 'Lentilles',
  'Maïs', 'Mangue', 'Miel', 'Moutarde', 'Myrtilles',
  'Noisettes', 'Noix',
  'Oeufs', 'Oignons', 'Olives', 'Orange',
  'Pain', 'Pâtes', 'Pêche', 'Persil', 'Poireau', 'Poires', 'Poisson', 'Poivre', 'Pommes', 'Pommes de terre', 'Porc', 'Poulet',
  'Quinoa',
  'Radis', 'Riz',
  'Salade', 'Saumon', 'Sel', 'Sucre',
  'Thé', 'Thon', 'Tomates',
  'Vanille', 'Viande', 'Vinaigre', 'Vin',
  'Yaourt',
  // Poissons
  'Dorade', 'Cabillaud', 'Merlu', 'Truite', 'Raie', 'Aile de raie', 'Ailes de raie', 'Sole', 'Bar', 'Loup', 'Merlan', 'Sardine',
  'Anchois', 'Hareng', 'Maquereau', 'Lotte', 'Julienne', 'Colin', 'Crevette', 'Gambas', 'Langoustine', 'Homard', 'Langouste',
  'Crabe', 'Moule', 'Huître', 'Palourde', 'Coquille', 'St-Jacques', 'Saint-Jacques', 'Calamars', 'Poulpe', 'Seiche',
  // Viandes
  'Dinde', 'Veau', 'Lapin', 'Canard', 'Cheval', 'Foie', 'Gésier', 'Coeur', 'Rognon', 'Tripe', 'Ris de veau',
  'Lard', 'Bacon', 'Saucisse', 'Saucisson', 'Chorizo', 'Salami', 'Pâté', 'Terrine', 'Andouillette', 'Boudin', 'Merguez',
  'Chipolata', 'Côte', 'Entrecôte', 'Filet', 'Cuisse', 'Aile', 'Escalope', 'Gigot',
  // Légumes
  'Échalote', 'Poivron', 'Endive', 'Brocoli', 'Chou-fleur', 'Asperge', 'Artichaut', 'Fenouil', 'Navet', 'Petit pois',
  'Haricot vert', 'Haricot blanc', 'Pois chiche',
  // Fruits
  'Pamplemousse', 'Mandarine', 'Clémentine', 'Mûre', 'Groseille', 'Cassis', 'Cerise', 'Abricot', 'Nectarine',
  'Prune', 'Mirabelle', 'Raisin', 'Melon', 'Pastèque', 'Figue', 'Grenade', 'Papaye', 'Goyave', 'Litchi', 'Noix de coco',
  'Datte', 'Châtaigne', 'Marron',
  // Épices
  'Muscade', 'Curry', 'Cumin', 'Paprika', 'Piment', 'Thym', 'Romarin', 'Laurier', 'Basilic', 'Menthe', 'Safran',
  'Cardamome', 'Clou de girofle', 'Anis', 'Badiane', 'Herbe', 'Bouquet garni', 'Estragon', 'Ciboulette', 'Aneth',
  'Curcuma', 'Ras el hanout', 'Garam masala', 'Quatre-épices', 'Piment d\'espelette',
  // Produits laitiers
  'Yogourt', 'Camembert', 'Brie', 'Emmental', 'Gruyère', 'Comté', 'Roquefort', 'Bleu', 'Chèvre', 'Mozzarella',
  'Parmesan', 'Ricotta', 'Mascarpone', 'Feta', 'Crème fraîche', 'Crème liquide', 'Lait de coco', 'Petit-suisse',
  'Faisselle', 'Cottage cheese', 'Kéfir', 'Babeurre', 'Lait fermenté',
  // Céréales
  'Spaghetti', 'Macaroni', 'Semoule', 'Couscous', 'Boulgour', 'Orge', 'Millet', 'Sarrasin', 'Tapioca', 'Polenta',
  'Maïzena', 'Baguette', 'Biscottes', 'Crackers', 'Flocon d\'avoine', 'Muesli', 'Céréales petit déjeuner',
  // Liquides
  'Bière', 'Cidre', 'Spiritueux', 'Rhum', 'Whisky', 'Cognac', 'Vodka', 'Jus', 'Sirop', 'Soda', 'Limonade',
  'Chocolat chaud', 'Infusion', 'Bouillon', 'Fond', 'Sauce', 'Ketchup', 'Mayonnaise', 'Huile de tournesol',
  'Huile de colza', 'Huile de sésame', 'Vinaigre balsamique', 'Vinaigre de vin', 'Vin blanc', 'Vin rouge'
].sort(); // Sorted for potentially better autocomplete performance/logic
const elements = {
    ingredientListBody: null,
    emptyStockMessage: null,
    itemModal: null,
    itemForm: null,
    itemIdField: null,
    itemNameField: null,
    itemCategoryField: null,
    itemQuantityField: null,
    itemUnitField: null,
    itemExpiryField: null,
    // itemThresholdField: null, // Décommentez si vous l'ajoutez
    modalAutocompleteContainer: null,
    addItemBtn: null,
    cancelItemBtn: null,
    closeModalBtn: null,

    // Initialisation des éléments
    initDOM() {
        this.ingredientListBody = document.getElementById('ingredient-list');
        this.emptyStockMessage = document.getElementById('empty-stock-message');
        this.itemModal = document.getElementById('item-modal');
        this.itemForm = document.getElementById('item-form');
        this.itemIdField = document.getElementById('item-id');
        this.itemNameField = document.getElementById('item-name');
        this.itemCategoryField = document.getElementById('item-category');
        this.itemQuantityField = document.getElementById('item-quantity');
        this.itemUnitField = document.getElementById('item-unit');
        this.itemExpiryField = document.getElementById('item-expiry');
        // this.itemThresholdField = document.getElementById('item-threshold'); // Décommentez
        this.modalAutocompleteContainer = document.getElementById('modal-autocomplete');
        this.addItemBtn = document.getElementById('add-item-btn');
        this.cancelItemBtn = document.getElementById('cancel-item-btn');
        this.closeModalBtn = document.getElementById('close-modal-btn'); // Dans stock.html, c'est la classe .close-btn dans la modale
    }
};


// ===== FONCTIONS =====

async function refreshTable() {
    if (!elements.ingredientListBody || !elements.emptyStockMessage) {
        console.error("Éléments du tableau de stock non trouvés.");
        return;
    }
    elements.ingredientListBody.innerHTML = ""; // Vider le tableau

    try {
        const response = await fetchProtectedAPI('http://localhost:5000/api/stock');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
        }
        const responseData = await response.json();
        const items = responseData.data || [];

        if (!items.length) {
            elements.emptyStockMessage.style.display = "block";
            return;
        }
        elements.emptyStockMessage.style.display = "none";

        items.forEach(ing => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${ing.name || 'N/A'}</td>
              <td>${ing.category || 'N/A'}</td>
              <td>${ing.quantity !== undefined ? ing.quantity : 'N/A'}</td>
              <td>${ing.unit || 'N/A'}</td>
              <td>${ing.expirationDate ? new Date(ing.expirationDate).toLocaleDateString() : ""}</td>
              <td>
                <button class="btn-icon" onclick="window.editStockItem('${ing._id}')">✏️</button>
                <button class="btn-icon" onclick="window.deleteStockItem('${ing._id}')">🗑️</button>
              </td>
            `;
            elements.ingredientListBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erreur lors du rafraîchissement du stock:", error);
        showToast(`Erreur de chargement du stock: ${error.message}`, 'error');
        elements.emptyStockMessage.style.display = "block";
    }
}

async function handleItemFormSubmit(e) {
    e.preventDefault();

    if (!elements.itemIdField || !elements.itemNameField || !elements.itemCategoryField || !elements.itemQuantityField || !elements.itemUnitField || !elements.itemExpiryField) {
        showToast("Erreur: Un ou plusieurs champs du formulaire sont introuvables.", "error");
        return;
    }
    const itemId = elements.itemIdField.value;


    const newItemData = {
        name: elements.itemNameField.value.trim(),
        category: elements.itemCategoryField.value,
        quantity: parseFloat(elements.itemQuantityField.value),
        unit: elements.itemUnitField.value,
        expirationDate: elements.itemExpiryField.value || null,
        // alertThreshold: parseFloat(elements.itemThresholdField.value) || 0, // Décommentez
    };

    if (!newItemData.name || isNaN(newItemData.quantity)) {
        showToast("Le nom et une quantité valide sont requis.", "error");
        return;
    }
    if (newItemData.quantity < 0) {
        showToast("La quantité ne peut pas être négative.", "error");
        return;
    }

    try {
        const stockResponse = await fetchProtectedAPI('http://localhost:5000/api/stock');
        if (!stockResponse.ok) {
            const errorText = await stockResponse.text().catch(() => stockResponse.statusText);
            throw new Error(`Impossible de récupérer le stock actuel: ${errorText}`);
        }
        const stockResult = await stockResponse.json();
        let currentStockItems = stockResult.data || [];

        if (itemId) { // Mode Modification
            currentStockItems = currentStockItems.map(item =>
                item._id === itemId ? { ...item, ...newItemData } : item // Conserver _id existant
            );
        } else { // Mode Ajout
            currentStockItems.push(newItemData); // Le backend assignera _id
        }

        const updateResponse = await fetchProtectedAPI('http://localhost:5000/api/stock', {
            method: 'PUT',
            body: JSON.stringify({ items: currentStockItems })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json().catch(() => ({ message: updateResponse.statusText }));
            throw new Error(errorData.message || `Erreur HTTP ${updateResponse.status} lors de la sauvegarde.`);
        }

        closeModal();
        showToast(`Ingrédient ${itemId ? 'modifié' : 'ajouté'} !`, "success");
        refreshTable();

    } catch (error) {
        console.error("Erreur lors de la sauvegarde de l'item:", error);
        showToast(`Erreur de sauvegarde: ${error.message}`, 'error');
    }
}

window.deleteStockItem = async function(itemIdToDelete) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet ingrédient ?")) return;

    try {
        const stockResponse = await fetchProtectedAPI('http://localhost:5000/api/stock');
        if (!stockResponse.ok) {
            const errorText = await stockResponse.text().catch(() => stockResponse.statusText);
            throw new Error(`Impossible de récupérer le stock actuel: ${errorText}`);
        }
        const stockResult = await stockResponse.json();
        let currentStockItems = stockResult.data || [];

        currentStockItems = currentStockItems.filter(item => item._id !== itemIdToDelete);

        const updateResponse = await fetchProtectedAPI('http://localhost:5000/api/stock', {
            method: 'PUT',
            body: JSON.stringify({ items: currentStockItems })
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json().catch(() => ({ message: updateResponse.statusText }));
            throw new Error(errorData.message || `Erreur HTTP ${updateResponse.status} lors de la suppression.`);
        }

        showToast("Ingrédient supprimé !", "success");
        refreshTable();

    } catch (error) {
        console.error("Erreur lors de la suppression de l'item:", error);
        showToast(`Erreur de suppression: ${error.message}`, 'error');
    }
};

window.editStockItem = async function(itemId) {
    try {
        const response = await fetchProtectedAPI('http://localhost:5000/api/stock');
        if (!response.ok) {
            const errorText = await response.text().catch(() => response.statusText);
            throw new Error(`Impossible de récupérer le stock: ${errorText}`);
        }
        const stockData = await response.json();
        const items = stockData.data || [];
        const item = items.find(x => x._id === itemId);

        if (item) {
            elements.itemIdField.value = item._id;
            elements.itemNameField.value = item.name;
            elements.itemCategoryField.value = item.category;
            elements.itemQuantityField.value = item.quantity;
            elements.itemUnitField.value = item.unit;
            elements.itemExpiryField.value = item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : "";
            // elements.itemThresholdField.value = item.alertThreshold || ""; // Décommentez
            openModal(true); // Passer un flag pour indiquer que c'est une édition
        } else {
            showToast("Ingrédient non trouvé pour modification.", "error");
        }
    } catch (error) {
        showToast(`Erreur édition: ${error.message}`, "error");
    }
};

function openModal(isEdit = false) {
    if (!elements.itemModal || !elements.itemForm || !elements.itemIdField) return;
    
    if (!isEdit) {
        elements.itemForm.reset();
        elements.itemIdField.value = "";
    }
    elements.itemModal.classList.add('show');
    // L'appel à initModalAutocomplete doit être fait ici pour s'assurer que itemNameField est visible et prêt
    if(elements.itemNameField) { // Vérifier si itemNameField est initialisé
        setTimeout(initModalAutocomplete, 80);
    }
}

function closeModal() {
    if (!elements.itemModal) return;
    elements.itemModal.classList.remove('show');
}

function suggestCategory(nom) { //
    const lower = nom.toLowerCase();
    for (const categoryValue in ingredientCategories) {
        // Les clés de ingredientCategories sont 'poisson', 'viande', etc.
        // Les valeurs des <option> dans stock.html sont "Poissons", "Viandes", etc.
        // Il faut une correspondance. Soit les clés de ingredientCategories sont normalisées,
        // soit on compare avec les listes d'ingrédients.
        if (ingredientCategories[categoryValue].some(keyword => lower.includes(keyword))) {
            // Trouver la valeur exacte de l'option du select qui correspond à categoryKey
            const selectOptions = Array.from(elements.itemCategoryField.options);
            const matchingOption = selectOptions.find(opt => opt.textContent.toLowerCase() === categoryValue || opt.value.toLowerCase() === categoryValue);
            if (matchingOption) return matchingOption.value;
        }
    }
    // Correction pour correspondre aux valeurs exactes du select de `stock.html`
    if (["pomme", "poire", "banane", "fraise", "raisin", "orange", "abricot", "ananas", "kiwi", "melon", "cerise", "mangue"].some(x => lower.includes(x))) {
        return "Fruits";
    }
    if (["carotte", "tomate", "aubergine", "courgette", "oignon", "poireau", "épinard", "laitue", "salade", "brocoli"].some(x => lower.includes(x))) {
        return "Légumes";
    }
    if (["poulet", "boeuf", "saumon", "cabillaud", "truite", "canard", "porc", "veau", "jambon"].some(x => lower.includes(x))) {
        return "Viandes et Poissons";
    }
    if (["lait", "fromage", "beurre", "yaourt", "crème"].some(x => lower.includes(x))) {
        return "Produits Laitiers";
    }
    if (["riz", "pâtes", "blé", "semoule", "couscous", "pain", "farine"].some(x => lower.includes(x))) {
        return "Céréales et Féculents";
    }
    if (["sel", "poivre", "basilic", "thym", "laurier", "épice", "herbe", "curry", "safran"].some(x => lower.includes(x))) {
        return "Épices et Condiments";
    }
    return ""; // Catégorie par défaut ou la première du select
}

function initModalAutocomplete() { //
    if (!elements.itemNameField || !elements.modalAutocompleteContainer || !elements.itemCategoryField) {
        console.error("Éléments nécessaires pour l'autocomplétion manquants.");
        return;
    }

    elements.itemNameField.oninput = function() {
        const val = this.value.toLowerCase().trim();
        elements.modalAutocompleteContainer.innerHTML = '';
        if (!val) {
            elements.modalAutocompleteContainer.style.display = 'none';
            return;
        }
        const found = ingredientsComplets.filter(ing => ing.toLowerCase().startsWith(val));

        found.slice(0, 12).forEach(ing => { // Limité à 12 suggestions pour la performance
            const div = document.createElement('div');
            div.className = 'autocomplete-item';
            div.textContent = ing;
            div.onmousedown = function(e) {
                e.preventDefault();
                elements.itemNameField.value = ing;
                elements.modalAutocompleteContainer.innerHTML = '';
                elements.modalAutocompleteContainer.style.display = 'none';

                const catVal = suggestCategory(ing);
                if (elements.itemCategoryField && catVal) {
                    // Recherche de la valeur exacte (insensible à la casse) dans les options
                    let optionFound = false;
                    for (const opt of elements.itemCategoryField.options) {
                        if (opt.value.trim().toLowerCase() === catVal.trim().toLowerCase()) {
                            elements.itemCategoryField.value = opt.value;
                            optionFound = true;
                            break;
                        }
                    }
                    if (!optionFound) {
                        console.warn(`Catégorie suggérée "${catVal}" pour "${ing}" non trouvée dans les options. Valeurs possibles:`, Array.from(elements.itemCategoryField.options).map(o => o.value));
                         // Optionnel: définir une valeur par défaut si aucune correspondance exacte
                        // elements.itemCategoryField.value = elements.itemCategoryField.options[0].value; // ou ""
                    }
                }
            };
            elements.modalAutocompleteContainer.appendChild(div);
        });
        elements.modalAutocompleteContainer.style.display = found.length ? 'block' : 'none';
    };
    elements.itemNameField.onblur = function() {
        setTimeout(() => {
            if (elements.modalAutocompleteContainer) elements.modalAutocompleteContainer.style.display = 'none';
        }, 150); // Délai pour permettre le clic sur un item de l'autocomplétion
    };
}

// ----- INITIALISATION -----
document.addEventListener('DOMContentLoaded', () => {
    elements.initDOM(); // Initialiser les références aux éléments DOM

    if (!elements.itemForm || !elements.addItemBtn || !elements.cancelItemBtn || !elements.closeModalBtn) {
        console.error("Un ou plusieurs éléments essentiels du formulaire ou de la modale sont manquants.");
        return;
    }

    elements.itemForm.addEventListener('submit', handleItemFormSubmit);
    elements.addItemBtn.addEventListener('click', () => openModal(false)); // false pour isEdit
    elements.cancelItemBtn.addEventListener('click', closeModal);
    
    // Votre `stock.html` utilise une classe `.close-btn` pour la fermeture de la modale.
    // S'il y a plusieurs boutons avec cette classe, ou si l'ID est différent, ajustez ici.
    // Si 'close-modal-btn' est l'ID unique du bouton X de la modale:
    if(elements.closeModalBtn) elements.closeModalBtn.addEventListener('click', closeModal);
    // Si c'est une classe (et qu'il y en a qu'un dans cette modale) :
    const modalCloseButton = elements.itemModal ? elements.itemModal.querySelector('.close-btn') : null;
    if(modalCloseButton) modalCloseButton.addEventListener('click', closeModal);


    // Protection de la page et chargement initial des données
    if (window.auth && typeof window.auth.protectPage === 'function') {
        window.auth.protectPage()
            .then(() => {
                refreshTable();
            })
            .catch(err => {
                console.error("Protection de page échouée, chargement du stock annulé.", err);
                // La redirection devrait être gérée par auth.js ou apiHelper.js
            });
    } else {
        console.warn("Module d'authentification ou `protectPage` non défini. Le chargement du stock peut échouer ou exposer des données.");
        // Tentative de chargement, mais cela suppose que les appels non authentifiés sont soit permis, soit échoueront gracieusement.
        refreshTable();
    }
});
