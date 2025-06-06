// menu-stock.js corrigé (menus générés filtrés selon stock réel)



class ChAIfAPI {
  constructor() {
    this.currentStock = [];
    this.stockMenusCache = null;
  }

  async fetchCurrentStock() {
    console.log('Chargement du stock simulé...');
    await new Promise(resolve => setTimeout(resolve, 300));
    this.currentStock = [
      { name: "Pâtes", quantity: 5, unit: "kg" },
      { name: "Tomates", quantity: 2, unit: "kg" },
      { name: "Lait", quantity: 15, unit: "L" },
      { name: "Beurre", quantity: 3.5, unit: "kg" },
      { name: "Fromage", quantity: 2, unit: "kg" },
      { name: "Oeufs", quantity: 120, unit: "pièces" },
      { name: "Farine", quantity: 10, unit: "kg" },
      { name: "Pommes de terre", quantity: 10, unit: "kg" },
      { name: "Carottes", quantity: 6, unit: "kg" },
      { name: "Oignon", quantity: 5, unit: "kg" },
      { name: "Ail", quantity: 1, unit: "kg" },
      { name: "Courgettes", quantity: 4, unit: "kg" },
      { name: "Champignons", quantity: 3, unit: "kg" },
      { name: "Poulet entier", quantity: 5, unit: "kg" },
      { name: "Riz basmati", quantity: 4, unit: "kg" },
      { name: "Vin blanc", quantity: 5, unit: "L" },
      { name: "Huile d'olive", quantity: 3, unit: "L" },
      { name: "Crème fraîche", quantity: 4, unit: "L" },
      { name: "Bouillon de légumes", quantity: 6, unit: "L" },
      { name: "Pain", quantity: 10, unit: "kg" }
    ];
    return this.currentStock;
  }

  async generateStockBasedMenus(params = {}) {
    console.log("Génération de menus simulée...");
    await new Promise(resolve => setTimeout(resolve, 500));

    const possibleMenus = [
      {
        id: 1,
        title: "Menu Tomates & Pâtes",
        servings: params.guests || 4,
        readyInMinutes: 25,
        ingredients: [
          { name: "Pâtes", quantity: 80, unit: "g" },
          { name: "Tomates", quantity: 100, unit: "g" },
          { name: "Beurre", quantity: 20, unit: "g" },
          { name: "Oignon", quantity: 30, unit: "g" }
        ],
        likes: 36,
        image: "http://via.placeholder.com/400x200"
      },
      {
        id: 2,
        title: "Omelette fromage",
        servings: params.guests || 2,
        readyInMinutes: 15,
        ingredients: [
          { name: "Oeufs", quantity: 3, unit: "pièces" },
          { name: "Fromage", quantity: 40, unit: "g" },
          { name: "Beurre", quantity: 10, unit: "g" }
        ],
        likes: 21,
        image: "http://via.placeholder.com/400x200"
      }
    ];

    const menusAvailable = possibleMenus.filter(menu => {
      return menu.ingredients.every(ing => {
        const stockItem = this.currentStock.find(s => s.name === ing.name);
        return stockItem && stockItem.quantity > 0;
      });
    });

    menusAvailable.forEach(menu => {
      menu.usedIngredientCount = menu.ingredients.length;
      menu.missedIngredientCount = 0;
    });

    this.stockMenusCache = menusAvailable;
    return menusAvailable;
  }
}

const chaifAPI = new ChAIfAPI();

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<div class="toast-message">${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3000);

  return toast;
}

async function fetchMenuFromBackend(servings = 4) {
  // 1. Vérification du token
  const token = localStorage.getItem('token');
  if (!token || token === "undefined") {
    showToast("Session expirée, redirection...", "error");
    // supprimé (plus utilisé);
    window.location.href = 'index.html';
    return null;
  }

  // 2. Requête API avec gestion améliorée des erreurs
  try {
    const res = await fetch('http://localhost:5000/api/menus/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        mode: 'stock-only',
        servings: servings,
        theme: 'Classique'
      })
    });

    // 3. Gestion des réponses HTTP
    if (res.status === 401) {
      showToast("Session expirée, redirection...", "error");
      localStorage.removeItem('token');
      // supprimé (plus utilisé);
      window.location.href = 'index.html';
      return null;
    }

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Erreur serveur");
    }

    return await res.json();

  } catch (error) {
    console.error("Erreur fetch:", error);
    showToast(`Échec: ${error.message}`, 'error');
    return null;
  }
}

// Activer les boutons "Voir la recette"
document.querySelectorAll('.view-recipe').forEach(btn => {
    btn.addEventListener('click', () => {
        const recipeId = btn.dataset.id;
        openRecipeModal(recipeId);
    });
});


function openRecipeModal(recipeId) {
    const modal = document.getElementById('recipe-modal');
    if (!modal) {
        console.warn('Modal de recette introuvable');
        return;
    }

    // Affichage du modal
    modal.style.display = 'block';

    // TODO : Rechercher la recette par ID et remplir le contenu du modal
    const recipe = findRecipeById(recipeId); // À implémenter

    if (recipe) {
        modal.querySelector('.modal-title').textContent = recipe.title || 'Recette';
        modal.querySelector('.modal-body').innerHTML = `
            <ul>
                ${recipe.ingredients.map(ing => `<li>${ing.quantity} ${ing.unit} de ${ing.name}</li>`).join('')}
            </ul>
            <p>${recipe.instructions || 'Instructions non fournies.'}</p>
        `;
    } else {
        modal.querySelector('.modal-body').textContent = 'Recette introuvable.';
    }
}
let ingredientsFromUrl = []; // Variable pour stocker les ingrédients de l'URL

document.addEventListener('DOMContentLoaded', async () => {
const urlParams = new URLSearchParams(window.location.search);
    const ingredientsToUseQuery = urlParams.get('useIngredients');
    const reason = urlParams.get('reason');

if (loading) loading.style.display = 'flex';
    if (menusResults) menusResults.innerHTML = '';

    // Récupérer les valeurs des filtres standards
    const cuisineType = document.getElementById('cuisine-type')?.value;
    const mealType = document.getElementById('meal-type')?.value;
    const diet = document.getElementById('diet')?.value;
    const guests = parseInt(document.getElementById('guests')?.value) || 4;
    const occasion = document.getElementById('occasion')?.value;
    const optimizeFor = document.getElementById('optimize')?.value;
    const aiInstructions = useAI ? document.getElementById('ai-instructions')?.value : '';

    let payload = {
        cuisineType,
        mealType,
        diet,
        guests,
        occasion,
        optimizeFor,
        // On ajoute les ingrédients de l'URL ici pour qu'ils soient pris en compte par l'IA
        // Le backend devra savoir comment les traiter (ex: les prioriser)
        priorityIngredients: ingredientsFromUrl, // Envoyer les ingrédients de l'URL
        additionalInstructions: aiInstructions // Si génération IA
    };

    let apiUrl = '';
    if (useAI) {
        apiUrl = '/api/menus/generate-pro-menu';
        // Pour la génération IA, les 'priorityIngredients' seront des instructions supplémentaires
        // ou un champ spécifique que le backend peut utiliser pour ajuster le prompt.
    } else {
        // Pour la génération basée sur le stock, le backend doit savoir
        // comment utiliser 'priorityIngredients' pour filtrer ou prioriser.
        // Si votre backend /api/menus/generate-stock-menu (ou équivalent) ne le gère pas encore,
        // il faudra l'adapter. Pour l'instant, on l'envoie.
        apiUrl = '/api/menus/generate-stock-menu'; // À DÉFINIR SI DIFFÉRENT
        // Si generateStockBasedMenus est purement client (comme dans menu-stock.js),
        // alors il faut adapter cette fonction directement ici.
        // payload.useStockMethod = true; // Indiquer la méthode
    }

    try {
        console.log(`Appel API vers ${apiUrl} avec payload:`, payload);
        showToast(`Génération de menus en cours (${useAI ? 'IA' : 'Stock'})...`, 'info');

        const response = await fetchProtectedAPI(apiUrl, { // Assurez-vous que fetchProtectedAPI est défini et importé
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const data = await response.json(); // fetchProtectedAPI gère les erreurs HTTP et le .json()

        if (data.success && data.menus) {
            displayMenuResults(data.menus, guests); // Votre fonction d'affichage
            showToast('Menus générés avec succès !', 'success');
        } else {
            throw new Error(data.error || "La génération de menus a échoué.");
        }
    } catch (error) {
        console.error("Erreur lors de la génération de menus:", error);
        showToast(error.message || "Erreur de génération.", "error");
        if (menusResults) menusResults.innerHTML = `<p class="error-message">${error.message}</p>`;
    } finally {
        if (loading) loading.style.display = 'none';
    }
}); // <-- Ajout de la parenthèse et de l'accolade manquantes ici
// Simulation de génération de menus

async function generateMenus() {
    const cuisineType = document.getElementById('cuisine-type')?.value || 'Tous';
    const mealType = document.getElementById('meal-type')?.value || 'Tous';
    const servings = parseInt(document.getElementById('guests')?.value) || 4;

    // Ici tu pourrais appeler ton backend ou utiliser chaifAPI.generateStockBasedMenus()
    console.log(`Génération de menus pour ${servings} personnes - Cuisine: ${cuisineType}, Type: ${mealType}`);

    showToast('Menus générés avec succès !', 'success');

    // TODO : afficher les menus dans l'interface
}


document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const guestsInput = document.getElementById('guests');
      const guests = guestsInput ? parseInt(guestsInput.value) || 4 : 4;
      fetchMenuFromBackend(guests);
    });
  }

  initMenuApp();
});

async function initMenuApp() {
  try {
    await chaifAPI.fetchCurrentStock();
    console.log('Menu app initialized successfully');
  } catch (error) {
    console.error('Error initializing menu app:', error);
    showToast("Une erreur est survenue lors de l'initialisation. Veuillez recharger la page.", 'error');
  }
}

