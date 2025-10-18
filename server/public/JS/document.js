document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) window.location.href = 'login.html';

  // Éléments du DOM
  const ingredientForm = document.getElementById('ingredient-form');
  const ingredientList = document.getElementById('ingredient-list');
  const messageDiv = document.getElementById('message');

  // Charger les ingrédients au démarrage
  await loadIngredients();

  // Gestion de la soumission du formulaire
  ingredientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Check authorization before proceeding
    if (!await checkAuthorization()) {
      showMessage('Non autorisé', 'error');
      return;
    }
    
    const name = document.getElementById('ingredient-name').value.trim();
    const quantity = document.getElementById('ingredient-quantity').value.trim();
    const unit = document.getElementById('ingredient-unit').value;

    if (!name || !quantity) {
      showMessage('Veuillez remplir tous les champs', 'error');
      return;
    }

    try {
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          quantity: `${quantity}${unit}`,
          category: 'autre' // Vous pouvez ajouter un select pour la catégorie
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'ajout');
      }

      showMessage('Ingrédient ajouté avec succès!', 'success');
      ingredientForm.reset();
      await loadIngredients();
    } catch (error) {
      showMessage(error.message, 'error');
      console.error('Erreur:', error);
    }
  });

  // Fonction pour charger la liste
  async function loadIngredients() {
    try {
      const response = await fetch('/api/stock', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur de chargement');

      const ingredients = await response.json();
      renderIngredients(ingredients);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  }

  // Fonction d'affichage
  function renderIngredients(ingredients) {
    const sanitizedHtml = DOMPurify.sanitize(ingredients.map(ing => `
      <div class="ingredient-item">
        <span>${ing.name} - ${ing.quantity}</span>
        <button class="delete-btn" data-id="${ing._id}">Supprimer</button>
      </div>
    `).join(''));

    ingredientList.innerHTML = sanitizedHtml;

    // Gestion des boutons de suppression
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Supprimer cet ingrédient?')) {
          try {
            const response = await fetch(`/api/stock/${btn.dataset.id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!response.ok) throw new Error('Échec de suppression');
            
            showMessage('Ingrédient supprimé', 'success');
            await loadIngredients();
          } catch (error) {
            showMessage(error.message, 'error');
          }
        }
      });
    });
  }

  function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type}`;
    setTimeout(() => messageDiv.textContent = '', 3000);
  }

  // Function to check authorization
  async function checkAuthorization() {
    try {
      const response = await fetch('/api/check-auth', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Authorization check failed:', error);
      return false;
    }
  }
});