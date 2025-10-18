// client/js/stock.js
import { fetchProtectedAPI } from './apiHelper.js'; 
import { showToast } from './utils.js'; 
import { getToken, logout } from './auth.js'; // Import de logout pour la protection de page

// --- LISTE DES INGRÉDIENTS AVEC CATÉGORIES ---
const INGREDIENTS_WITH_CATEGORIES = [
  // Fruits
  { name: "Abricot sec", category: "Fruits" }, // Note: sec vs frais
  { name: "Abricot", category: "Fruits" },
  { name: "Ananas", category: "Fruits" },
  { name: "Avocat", category: "Fruits" }, // Techniquement un fruit
  { name: "Banane", category: "Fruits" },
  { name: "Cassis", category: "Fruits" },
  { name: "Cerise", category: "Fruits" },
  { name: "Châtaigne", category: "Fruits" }, // Ou "Noix et Graines"
  { name: "Citron", category: "Fruits" },
  { name: "Clémentine", category: "Fruits" },
  { name: "Datte", category: "Fruits" },
  { name: "Figue", category: "Fruits" },
  { name: "Fraise", category: "Fruits" },
  { name: "Framboises", category: "Fruits" }, // Note: pluriel vs singulier
  { name: "Grenade", category: "Fruits" },
  { name: "Groseille", category: "Fruits" },
  { name: "Goyave", category: "Fruits" },
  { name: "Kiwi", category: "Fruits" },
  { name: "Litchi", category: "Fruits" },
  { name: "Mandarine", category: "Fruits" },
  { name: "Mangue", category: "Fruits" },
  { name: "Marron", category: "Fruits" }, // Souvent cuisiné comme un légume
  { name: "Melon", category: "Fruits" },
  { name: "Mirabelle", category: "Fruits" },
  { name: "Mûre", category: "Fruits" },
  { name: "Myrtilles", category: "Fruits" }, // Note: pluriel vs singulier
  { name: "Nectarine", category: "Fruits" },
  { name: "Noix de coco", category: "Fruits" },
  { name: "Orange", category: "Fruits" },
  { name: "Pamplemousse", category: "Fruits" },
  { name: "Papaye", category: "Fruits" },
  { name: "Pastèque", category: "Fruits" },
  { name: "Pêche", category: "Fruits" },
  { name: "Poires", category: "Fruits" }, // Note: pluriel vs singulier
  { name: "Pommes", category: "Fruits" }, // Note: pluriel vs singulier
  { name: "Prune", category: "Fruits" },
  { name: "Raisin", category: "Fruits" },
  { name: "Tomates", category: "Fruits" }, // Techniquement un fruit

  // Légumes
  { name: "Ail", category: "Légumes" }, // Peut aussi être "Épices et Condiments"
  { name: "Artichaut", category: "Légumes" },
  { name: "Asperge", category: "Légumes" },
  { name: "Aubergine", category: "Légumes" },
  { name: "Betterave", category: "Légumes" },
  { name: "Brocoli", category: "Légumes" },
  { name: "Carottes", category: "Légumes" },
  { name: "Céleri", category: "Légumes" },
  { name: "Champignons", category: "Légumes" }, // Techniquement un champignon
  { name: "Chou", category: "Légumes" },
  { name: "Chou-fleur", category: "Légumes" },
  { name: "Concombre", category: "Légumes" },
  { name: "Courgette", category: "Légumes" },
  { name: "Échalote", category: "Légumes" },
  { name: "Endive", category: "Légumes" },
  { name: "Epinards", category: "Légumes" },
  { name: "Fenouil", category: "Légumes" },
  { name: "Haricot vert", category: "Légumes" },
  { name: "Haricot blanc", category: "Légumes" }, // Ou "Céréales et Féculents" si sec
  { name: "Laitue", category: "Légumes" },
  { name: "Légumes", category: "Légumes" }, // Générique
  { name: "Maïs", category: "Légumes" }, // Peut aussi être "Céréales"
  { name: "Navet", category: "Légumes" },
  { name: "Oignons", category: "Légumes" },
  { name: "Olives", category: "Légumes" }, // Techniquement un fruit, utilisé comme condiment/légume
  { name: "Petit pois", category: "Légumes" },
  { name: "Poireau", category: "Légumes" },
  { name: "Poivron", category: "Légumes" },
  { name: "Pommes de terre", category: "Légumes" }, // Peut aussi être "Céréales et Féculents"
  { name: "Potiron", category: "Légumes" },
  { name: "Radis", category: "Légumes" },
  { name: "Salade", category: "Légumes" }, // Générique

  // Viandes et Poissons
  { name: "Agneau", category: "Viandes et Poissons" },
  { name: "Aile de raie", category: "Viandes et Poissons" }, // Regroupé "Raie", "Aile de raie", "Ailes de raie"
  { name: "Anchois", category: "Viandes et Poissons" },
  { name: "Andouillette", category: "Viandes et Poissons" },
  { name: "Bacon", category: "Viandes et Poissons" },
  { name: "Bar", category: "Viandes et Poissons" }, // Loup
  { name: "Boeuf", category: "Viandes et Poissons" },
  { name: "Boudin", category: "Viandes et Poissons" },
  { name: "Cabillaud", category: "Viandes et Poissons" },
  { name: "Calamars", category: "Viandes et Poissons" },
  { name: "Canard", category: "Viandes et Poissons" },
  { name: "Cheval", category: "Viandes et Poissons" },
  { name: "Chipolata", category: "Viandes et Poissons" },
  { name: "Chorizo", category: "Viandes et Poissons" },
  { name: "Coeur", category: "Viandes et Poissons" }, // Abats
  { name: "Colin", category: "Viandes et Poissons" },
  { name: "Coquille St-Jacques", category: "Viandes et Poissons" }, // Regroupé
  { name: "Côte", category: "Viandes et Poissons" }, // (de porc, de boeuf?)
  { name: "Crabe", category: "Viandes et Poissons" },
  { name: "Crevette", category: "Viandes et Poissons" }, // Inclut Gambas
  { name: "Cuisse", category: "Viandes et Poissons" }, // (de poulet, canard?)
  { name: "Dinde", category: "Viandes et Poissons" },
  { name: "Dorade", category: "Viandes et Poissons" },
  { name: "Entrecôte", category: "Viandes et Poissons" },
  { name: "Escalope", category: "Viandes et Poissons" }, // (de veau, dinde?)
  { name: "Filet", category: "Viandes et Poissons" }, // (de boeuf, poulet?)
  { name: "Foie", category: "Viandes et Poissons" }, // Abats
  { name: "Gambas", category: "Viandes et Poissons" },
  { name: "Gésier", category: "Viandes et Poissons" }, // Abats
  { name: "Gigot", category: "Viandes et Poissons" }, // (d'agneau?)
  { name: "Hareng", category: "Viandes et Poissons" },
  { name: "Homard", category: "Viandes et Poissons" },
  { name: "Huître", category: "Viandes et Poissons" },
  { name: "Jambon", category: "Viandes et Poissons" },
  { name: "Julienne", category: "Viandes et Poissons" }, // Poisson
  { name: "Langouste", category: "Viandes et Poissons" },
  { name: "Langoustine", category: "Viandes et Poissons" },
  { name: "Lapin", category: "Viandes et Poissons" },
  { name: "Lard", category: "Viandes et Poissons" },
  { name: "Lotte", category: "Viandes et Poissons" },
  { name: "Loup", category: "Viandes et Poissons" }, // Bar
  { name: "Maquereau", category: "Viandes et Poissons" },
  { name: "Merguez", category: "Viandes et Poissons" },
  { name: "Merlan", category: "Viandes et Poissons" },
  { name: "Merlu", category: "Viandes et Poissons" },
  { name: "Moule", category: "Viandes et Poissons" },
  { name: "Pâté", category: "Viandes et Poissons" },
  { name: "Palourde", category: "Viandes et Poissons" },
  { name: "Poisson", category: "Viandes et Poissons" }, // Générique
  { name: "Porc", category: "Viandes et Poissons" },
  { name: "Poulpe", category: "Viandes et Poissons" },
  { name: "Poulet", category: "Viandes et Poissons" },
  { name: "Ris de veau", category: "Viandes et Poissons" }, // Abats
  { name: "Rognon", category: "Viandes et Poissons" }, // Abats
  { name: "Salami", category: "Viandes et Poissons" },
  { name: "Sardine", category: "Viandes et Poissons" },
  { name: "Saucisse", category: "Viandes et Poissons" },
  { name: "Saucisson", category: "Viandes et Poissons" },
  { name: "Saumon", category: "Viandes et Poissons" },
  { name: "Seiche", category: "Viandes et Poissons" },
  { name: "Sole", category: "Viandes et Poissons" },
  { name: "Terrine", category: "Viandes et Poissons" },
  { name: "Thon", category: "Viandes et Poissons" },
  { name: "Tripe", category: "Viandes et Poissons" }, // Abats
  { name: "Truite", category: "Viandes et Poissons" },
  { name: "Veau", category: "Viandes et Poissons" },
  { name: "Viande", category: "Viandes et Poissons" }, // Générique

  // Produits Laitiers et Oeufs
  { name: "Babeurre", category: "Produits Laitiers" },
  { name: "Beurre", category: "Produits Laitiers" },
  { name: "Bleu", category: "Produits Laitiers" }, // Fromage
  { name: "Brie", category: "Produits Laitiers" }, // Fromage
  { name: "Camembert", category: "Produits Laitiers" }, // Fromage
  { name: "Chèvre", category: "Produits Laitiers" }, // Fromage
  { name: "Comté", category: "Produits Laitiers" }, // Fromage
  { name: "Cottage cheese", category: "Produits Laitiers" },
  { name: "Crème", category: "Produits Laitiers" }, // Générique (fraîche, liquide?)
  { name: "Crème fraîche", category: "Produits Laitiers" },
  { name: "Crème liquide", category: "Produits Laitiers" },
  { name: "Emmental", category: "Produits Laitiers" }, // Fromage
  { name: "Faisselle", category: "Produits Laitiers" },
  { name: "Feta", category: "Produits Laitiers" }, // Fromage
  { name: "Fromage", category: "Produits Laitiers" }, // Générique
  { name: "Gruyère", category: "Produits Laitiers" }, // Fromage
  { name: "Kéfir", category: "Produits Laitiers" },
  { name: "Lait", category: "Produits Laitiers" },
  { name: "Lait de coco", category: "Produits Laitiers" }, // Souvent utilisé comme tel, mais techniquement pas laitier animal
  { name: "Lait fermenté", category: "Produits Laitiers" },
  { name: "Mascarpone", category: "Produits Laitiers" }, // Fromage
  { name: "Mozzarella", category: "Produits Laitiers" }, // Fromage
  { name: "Oeufs", category: "Produits Laitiers" }, // Catégorie commune, parfois séparée
  { name: "Parmesan", category: "Produits Laitiers" }, // Fromage
  { name: "Petit-suisse", category: "Produits Laitiers" },
  { name: "Ricotta", category: "Produits Laitiers" }, // Fromage
  { name: "Roquefort", category: "Produits Laitiers" }, // Fromage
  { name: "Yaourt", category: "Produits Laitiers" }, // Inclut Yogourt
  { name: "Yogourt", category: "Produits Laitiers" },

  // Céréales et Féculents
  { name: "Avoine", category: "Céréales et Féculents" },
  { name: "Baguette", category: "Céréales et Féculents" },
  { name: "Biscottes", category: "Céréales et Féculents" },
  { name: "Blé", category: "Céréales et Féculents" },
  { name: "Boulgour", category: "Céréales et Féculents" },
  { name: "Céréales petit déjeuner", category: "Céréales et Féculents" },
  { name: "Couscous", category: "Céréales et Féculents" },
  { name: "Crackers", category: "Céréales et Féculents" },
  { name: "Farine", category: "Céréales et Féculents" },
  { name: "Flocon d'avoine", category: "Céréales et Féculents" },
  { name: "Haricots", category: "Céréales et Féculents" }, // Haricots secs (pois chiches, lentilles aussi)
  { name: "Lentilles", category: "Céréales et Féculents" },
  { name: "Macaroni", category: "Céréales et Féculents" },
  { name: "Maïzena", category: "Céréales et Féculents" },
  { name: "Millet", category: "Céréales et Féculents" },
  { name: "Muesli", category: "Céréales et Féculents" },
  { name: "Orge", category: "Céréales et Féculents" },
  { name: "Pain", category: "Céréales et Féculents" },
  { name: "Pâtes", category: "Céréales et Féculents" },
  { name: "Pois chiche", category: "Céréales et Féculents" },
  { name: "Polenta", category: "Céréales et Féculents" },
  { name: "Quinoa", category: "Céréales et Féculents" },
  { name: "Riz", category: "Céréales et Féculents" },
  { name: "Sarrasin", category: "Céréales et Féculents" },
  { name: "Semoule", category: "Céréales et Féculents" },
  { name: "Spaghetti", category: "Céréales et Féculents" },
  { name: "Tapioca", category: "Céréales et Féculents" },

  // Épices et Condiments (inclut aussi "Épicerie" pour certains articles)
  { name: "Ail", category: "Épices et Condiments" }, // Répété, choisissez une catégorie principale
  { name: "Anis", category: "Épices et Condiments" },
  { name: "Badiane", category: "Épices et Condiments" }, // Anis étoilé
  { name: "Basilic", category: "Épices et Condiments" }, // Herbe
  { name: "Bouquet garni", category: "Épices et Condiments" },
  { name: "Cannelle", category: "Épices et Condiments" },
  { name: "Cardamome", category: "Épices et Condiments" },
  { name: "Ciboulette", category: "Épices et Condiments" }, // Herbe
  { name: "Clou de girofle", category: "Épices et Condiments" },
  { name: "Coriandre", category: "Épices et Condiments" }, // Herbe
  { name: "Cumin", category: "Épices et Condiments" },
  { name: "Curcuma", category: "Épices et Condiments" },
  { name: "Curry", category: "Épices et Condiments" },
  { name: "Estragon", category: "Épices et Condiments" }, // Herbe
  { name: "Garam masala", category: "Épices et Condiments" },
  { name: "Gingembre", category: "Épices et Condiments" },
  { name: "Herbe", category: "Épices et Condiments" }, // Générique
  { name: "Huile", category: "Épices et Condiments" }, // Huile de cuisson générique
  { name: "Huile d'olive", category: "Épices et Condiments" },
  { name: "Huile de colza", category: "Épices et Condiments" },
  { name: "Huile de sésame", category: "Épices et Condiments" },
  { name: "Huile de tournesol", category: "Épices et Condiments" },
  { name: "Ketchup", category: "Épices et Condiments" },
  { name: "Laurier", category: "Épices et Condiments" }, // Herbe
  { name: "Mayonnaise", category: "Épices et Condiments" },
  { name: "Menthe", category: "Épices et Condiments" }, // Herbe
  { name: "Miel", category: "Épicerie et Condiments" }, // Généralement épicerie sucrée
  { name: "Moutarde", category: "Épices et Condiments" },
  { name: "Muscade", category: "Épices et Condiments" },
  { name: "Noisettes", category: "Épicerie et Condiments" }, // Ou une catégorie "Noix et Graines"
  { name: "Noix", category: "Épicerie et Condiments" }, // Ou "Noix et Graines"
  { name: "Olives", category: "Épices et Condiments" }, // Répété, choisissez une
  { name: "Paprika", category: "Épices et Condiments" },
  { name: "Persil", category: "Épices et Condiments" }, // Herbe
  { name: "Piment", category: "Épices et Condiments" },
  { name: "Piment d'espelette", category: "Épices et Condiments" },
  { name: "Poivre", category: "Épices et Condiments" },
  { name: "Quatre-épices", category: "Épices et Condiments" },
  { name: "Ras el hanout", category: "Épices et Condiments" },
  { name: "Romarin", category: "Épices et Condiments" }, // Herbe
  { name: "Safran", category: "Épices et Condiments" },
  { name: "Sauce", category: "Épices et Condiments" }, // Générique
  { name: "Sel", category: "Épices et Condiments" },
  { name: "Sucre", category: "Épicerie et Condiments" },
  { name: "Thym", category: "Épices et Condiments" }, // Herbe
  { name: "Vanille", category: "Épices et Condiments" }, // ou "Pâtisserie"
  { name: "Vinaigre", category: "Épices et Condiments" }, // Générique
  { name: "Vinaigre balsamique", category: "Épices et Condiments" },
  { name: "Vinaigre de vin", category: "Épices et Condiments" },
  { name: "Aneth", category: "Épices et Condiments"},

  // Boissons et Liquides (certains étaient déjà dans Condiments)
  { name: "Bière", category: "Boissons" },
  { name: "Bouillon", category: "Boissons" }, // Ou "Aides Culinaires"
  { name: "Café", category: "Boissons" },
  { name: "Chocolat chaud", category: "Boissons" },
  { name: "Cidre", category: "Boissons" },
  { name: "Cognac", category: "Boissons" },
  { name: "Eau", category: "Boissons" },
  { name: "Fond", category: "Boissons" }, // Ou "Aides Culinaires" (fond de veau, etc.)
  { name: "Glace", category: "Produits Laitiers" }, // Souvent à base de lait/crème, ou "Desserts"
  { name: "Infusion", category: "Boissons" },
  { name: "Jus", category: "Boissons" },
  { name: "Limonade", category: "Boissons" },
  { name: "Rhum", category: "Boissons" },
  { name: "Sirop", category: "Boissons" }, // Ou "Épicerie Sucrée"
  { name: "Soda", category: "Boissons" },
  { name: "Spiritueux", category: "Boissons" }, // Générique
  { name: "Thé", category: "Boissons" },
  { name: "Vin", category: "Boissons" }, // Générique
  { name: "Vin blanc", category: "Boissons" },
  { name: "Vin rouge", category: "Boissons" },
  { name: "Vodka", category: "Boissons" },
  { name: "Whisky", category: "Boissons" },

  // Épicerie (pour les items qui ne rentrent pas ailleurs facilement)
  { name: "Chocolat", category: "Épicerie et Condiments" }, // Si différent de "Chocolat chaud"
];

// --- SÉLECTEURS DOM ---
const elements = {
    ingredientListBody: null,
    emptyStockMessage: null,
    itemModal: null,
    itemForm: null, // Sera document.getElementById('item-form')
    modalTitle: null,
    itemIdField: null,
    itemNameField: null,
    itemCategoryField: null,
    itemQuantityField: null,
    itemUnitField: null,
    itemExpiryField: null,
    itemThresholdField: null, // Pour le seuil d'alerte
    itemAlertActiveField: null, // Pour la checkbox d'alerte active
    modalAutocompleteContainer: null,
    addItemBtn: null,
    cancelItemBtn: null,
    closeModalBtn: null,
    logoutBtnPage: null,

    initDOM() {
        this.ingredientListBody = document.getElementById('ingredient-list');
        this.emptyStockMessage = document.getElementById('empty-stock-message');
        this.itemModal = document.getElementById('item-modal');
        this.itemForm = document.getElementById('item-form'); // ID HTML devrait être 'item-form'
        this.modalTitle = document.getElementById('modal-title');
        this.itemIdField = document.getElementById('item-id');
        this.itemNameField = document.getElementById('item-name');
        this.itemCategoryField = document.getElementById('item-category');
        this.itemQuantityField = document.getElementById('item-quantity');
        this.itemUnitField = document.getElementById('item-unit');
        this.itemExpiryField = document.getElementById('item-expiry');
        this.itemThresholdField = document.getElementById('item-threshold'); // Assurez-vous que cet ID existe dans stock.html
        this.itemAlertActiveField = document.getElementById('item-alert-active'); // Assurez-vous que cet ID existe
        this.modalAutocompleteContainer = document.getElementById('modal-autocomplete');
        this.addItemBtn = document.getElementById('add-item-btn');
        this.cancelItemBtn = document.getElementById('cancel-item-btn');
        this.closeModalBtn = document.getElementById('close-modal-btn'); // ID du bouton X dans le modal
        this.logoutBtnPage = document.getElementById('logout-btn'); // Bouton de déconnexion de la page stock.html
    }
};

// --- FONCTIONS DE GESTION DU STOCK (localStorage pour l'instant) ---
async function loadStockFromAPI() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('❌ Pas de token - Utilisation du localStorage');
            return JSON.parse(localStorage.getItem('stock') || "[]");
        }

        const response = await fetch('/api/stock', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Stock chargé depuis l\'API:', result.data);
            return result.data || [];
        } else {
            console.warn('❌ Erreur API - Utilisation du localStorage');
            return JSON.parse(localStorage.getItem('stock') || "[]");
        }
    } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
        return JSON.parse(localStorage.getItem('stock') || "[]");
    }
}

// Fonction synchrone pour compatibilité (utilise le cache)
function loadStockFromLocalStorage() {
    // Cette fonction est toujours appelée, mais on préfère l'API
    return JSON.parse(localStorage.getItem('stock') || "[]");
}

function saveStockToLocalStorage(stockArray) {
    // Sauvegarder aussi en local pour le cache
    localStorage.setItem('stock', JSON.stringify(stockArray));
}

// --- FONCTIONS DU MODAL ET AUTOCOMPLÉTION ---
function openModal(editId = null) {
    if (!elements.itemModal || !elements.itemForm) {
        showToast("Erreur: Le formulaire d'ingrédient n'a pas pu être initialisé.", "error");
        return;
    }
    elements.itemForm.reset();
    elements.itemIdField.value = "";
    elements.modalTitle.textContent = editId ? "Modifier l'ingrédient" : "Ajouter un ingrédient";

    if (editId) {
        const stock = loadStockFromLocalStorage();
        const item = stock.find(x => x.id === editId);
        if (item) {
            elements.itemIdField.value = item.id;
            elements.itemNameField.value = item.nom;
            elements.itemCategoryField.value = item.categorie;
            elements.itemQuantityField.value = item.qte;
            elements.itemUnitField.value = item.unite;
            elements.itemExpiryField.value = item.dateExpiration || ""; // Utiliser 'dateExpiration' comme clé
            if (elements.itemThresholdField) elements.itemThresholdField.value = item.seuilAlerte || "";
            if (elements.itemAlertActiveField) elements.itemAlertActiveField.checked = item.alerteActive || false;
        } else {
            showToast(`Ingrédient avec ID ${editId} non trouvé.`, "error");
            return;
        }
    }
    elements.itemModal.classList.add('show');
    elements.itemNameField.focus();
}

function closeModal() {
    if (elements.itemModal) elements.itemModal.classList.remove('show');
}

function initModalAutocomplete() {
    if (!elements.itemNameField || !elements.modalAutocompleteContainer || !elements.itemCategoryField) {
        console.warn("Éléments pour l'autocomplétion non trouvés. L'autocomplétion sera désactivée.");
        return;
    }

    elements.itemNameField.oninput = function() {
        const searchTerm = this.value.toLowerCase().trim();
        elements.modalAutocompleteContainer.innerHTML = ''; 

        if (!searchTerm) {
            elements.modalAutocompleteContainer.style.display = 'none';
            return;
        }

        // Utiliser INGREDIENTS_WITH_CATEGORIES pour le filtrage
        const foundIngredients = INGREDIENTS_WITH_CATEGORIES.filter(ingData =>
            ingData.name.toLowerCase().startsWith(searchTerm)
        );

        if (foundIngredients.length > 0) {
            foundIngredients.slice(0, 10).forEach(ingData => { // ingData est {name, category}
                const suggestionDiv = document.createElement('div');
                suggestionDiv.className = 'autocomplete-item';
                suggestionDiv.textContent = ingData.name;

                suggestionDiv.onmousedown = function(e) {
                    e.preventDefault(); 
                    elements.itemNameField.value = ingData.name;
                    // Vérifier si la catégorie existe dans le select avant de la définir
                    const categoryOptionExists = Array.from(elements.itemCategoryField.options).some(opt => opt.value === ingData.category);
                    if (categoryOptionExists) {
                        elements.itemCategoryField.value = ingData.category;
                    } else {
                        console.warn(`Catégorie "${ingData.category}" pour "${ingData.name}" non trouvée dans les options du select.`);
                        elements.itemCategoryField.value = ""; // ou une valeur par défaut
                    }
                    
                    elements.modalAutocompleteContainer.innerHTML = '';
                    elements.modalAutocompleteContainer.style.display = 'none';
                };
                elements.modalAutocompleteContainer.appendChild(suggestionDiv);
            });
            elements.modalAutocompleteContainer.style.display = 'block';
        } else {
            elements.modalAutocompleteContainer.style.display = 'none';
        }
    };

    elements.itemNameField.onblur = function() {
        setTimeout(() => {
            if (elements.modalAutocompleteContainer) elements.modalAutocompleteContainer.style.display = 'none';
        }, 200); 
    };
}

// --- GESTION DU FORMULAIRE ET DE LA TABLE ---
// Dans client/js/stock.js

// ... (imports et autres fonctions) ...

function handleItemFormSubmit(e) {
    e.preventDefault();
    const id = elements.itemIdField.value || Date.now().toString();
    const nom = elements.itemNameField.value.trim();
    const categorie = elements.itemCategoryField.value;
    const qte = parseFloat(elements.itemQuantityField.value);
    const unite = elements.itemUnitField.value;
    const dateExpiration = elements.itemExpiryField.value;

    // Gestion améliorée du seuil d'alerte (optionnel)
    let seuilAlerteNum = 0; // Valeur par défaut si le champ est vide ou non valide
    if (elements.itemThresholdField && elements.itemThresholdField.value.trim() !== "") {
        const parsedThreshold = parseFloat(elements.itemThresholdField.value);
        if (!isNaN(parsedThreshold) && parsedThreshold >= 0) {
            seuilAlerteNum = parsedThreshold;
        } else {
            showToast("Le seuil d'alerte, s'il est renseigné, doit être un nombre positif.", "error");
            return; // Bloquer si une valeur est entrée mais n'est pas un nombre positif
        }
    }

    const alerteActive = elements.itemAlertActiveField ? elements.itemAlertActiveField.checked : false;
    if (!nom || !categorie || isNaN(qte) || !unite) {
        showToast("Veuillez remplir tous les champs obligatoires (Nom, Catégorie, Quantité, Unité).", "error");
        return;
    }
    if (qte < 0) {
        showToast("La quantité ne peut pas être négative.", "error");
        return;
    }
    // La validation spécifique pour seuilAlerte (s'il est rempli mais invalide) est faite au-dessus

    let stock = loadStockFromLocalStorage(); // Assurez-vous que cette fonction est définie
    const itemIndex = stock.findIndex(x => x.id === id);
    
    const stockItem = { 
        id, 
        nom, 
        categorie, 
        qte, 
        unite, 
        dateExpiration: dateExpiration || null, 
        seuilAlerte: seuilAlerteNum, // Utiliser la valeur traitée
        alerteActive 
    };

    if (itemIndex >= 0) {
        stock[itemIndex] = stockItem; // Modifier
    } else {
        stock.push(stockItem); // Ajouter
    }

    saveStockToLocalStorage(stock); // Assurez-vous que cette fonction est définie
    closeModal(); // Assurez-vous que cette fonction est définie
    showToast(`Ingrédient "${nom}" ${itemIndex >= 0 ? 'modifié' : 'ajouté'} !`, "success");
    refreshTable(); // Assurez-vous que cette fonction est définie
}

window.editStockItem = (id) => { 
    openModal(id);
};

window.deleteStockItem = (id) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer cet ingrédient ?`)) {
        let stock = loadStockFromLocalStorage();
        stock = stock.filter(x => x.id !== id);
        saveStockToLocalStorage(stock);
        showToast("Ingrédient supprimé !", "success");
        refreshTable();
    }
};

// Fonction pour formater les dates (si non importée depuis common.js/utils.js)
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

async function refreshTable() {
    if (!elements.ingredientListBody || !elements.emptyStockMessage) {
        console.error("Éléments du tableau de stock pour refreshTable non trouvés.");
        return;
    }
    
    console.log('🔄 Chargement du stock...');
    const data = await loadStockFromAPI();
    console.log('📦 Données du stock:', data);
    
    elements.ingredientListBody.innerHTML = "";

    if (!data || !data.length) {
        elements.emptyStockMessage.style.display = "block";
    } else {
        elements.emptyStockMessage.style.display = "none";
        data.forEach(ing => {
            const tr = document.createElement('tr');
            // Adaptez les noms de propriété si nécessaire (ex: ing.dateExpiration)
            tr.innerHTML = `
              <td>${ing.name || ing.nom || '-'}</td>
              <td>${ing.category || ing.categorie || '-'}</td>
              <td>${ing.quantity || ing.qte || '-'}</td>
              <td>${ing.unit || ing.unite || '-'}</td>
              <td>${ing.seuilAlerte !== undefined && ing.seuilAlerte > 0 ? ing.seuilAlerte : '-'}</td> 
              <td>${ing.expirationDate || ing.dateExpiration ? formatDate(ing.expirationDate || ing.dateExpiration) : "-"}</td> 
              <td>
                <button class="btn-icon" onclick="window.editStockItem('${ing._id || ing.id}')">✏️</button>
                <button class="btn-icon" onclick="window.deleteStockItem('${ing._id || ing.id}')">🗑️</button>
              </td>
            `;
            elements.ingredientListBody.appendChild(tr);
        });
    }
}

// --- INITIALISATION DE LA PAGE ---
document.addEventListener('DOMContentLoaded', () => {
    elements.initDOM(); 

    // Authentification de la page
    const token = getToken();
    if (!token) {
        logout(); 
        return; 
    }
    // Vous pouvez ajouter un appel à /api/auth/verify ici si vous voulez une validation serveur à chaque chargement
    
    // Attacher les écouteurs d'événements
    if (elements.addItemBtn) elements.addItemBtn.addEventListener('click', () => openModal());
    if (elements.itemForm) elements.itemForm.addEventListener('submit', handleItemFormSubmit);
    if (elements.cancelItemBtn) elements.cancelItemBtn.addEventListener('click', closeModal);
    if (elements.closeModalBtn) elements.closeModalBtn.addEventListener('click', closeModal);
    
    // Bouton de déconnexion de la page stock.html
    if(elements.logoutBtnPage) {
        elements.logoutBtnPage.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    initModalAutocomplete();
    refreshTable();
});
