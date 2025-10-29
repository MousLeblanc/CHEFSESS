// client/JS/stock-common.js
// Fonctions communes pour la gestion du stock

let stockData = [];

// ========== CHARGEMENT DU STOCK ==========

export async function loadStockData() {
  console.log('📦 Chargement du stock...');
  
  try {
    console.log('🔑 Utilisation du cookie pour l\'authentification');
    
    const response = await fetch('/api/stock', {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      credentials: 'include' // 🔐 Envoie automatiquement le cookie
    });
    
    console.log('📡 Réponse API stock status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      stockData = result.data || [];
      console.log(`✅ ${stockData.length} articles en stock`);
      console.log('📊 Données stock:', stockData);
      
      if (stockData.length > 0) {
        console.log('📦 Premier article:', stockData[0]);
        console.log('📦 Nom:', stockData[0].name, '| Type:', typeof stockData[0].name);
      }
      
      renderStockTable();
    } else if (response.status === 401) {
      console.error('❌ Non autorisé (401) - Token invalide ou expiré');
      stockData = [];
      renderStockTable();
      alert('Session expirée. Veuillez vous reconnecter.');
      // 🧹 Forcer le nettoyage des cookies avant la reconnexion
      window.location.href = '/index.html?forceCleanup=true';
    } else {
      const errorText = await response.text();
      console.error(`❌ Erreur ${response.status}:`, errorText);
      stockData = [];
      renderStockTable();
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement du stock:', error);
    stockData = [];
    renderStockTable();
  }
}

// ========== AFFICHAGE DU STOCK ==========

export function renderStockTable() {
  const stockTableBody = document.getElementById('stock-table-body');
  if (!stockTableBody) {
    console.warn('⚠️ Élément stock-table-body non trouvé');
    return;
  }

  console.log('🎨 Rendu de la table stock, articles:', stockData.length);
  
  if (stockData.length === 0) {
    stockTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 2rem; color: #6c757d;">
          <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
          Aucun article en stock
        </td>
      </tr>
    `;
    return;
  }

  stockTableBody.innerHTML = stockData.map((item, index) => {
    // Fonction pour extraire le nom de manière sûre
    const getName = (item) => {
      if (!item) return 'N/A';
      
      // Si name est une chaîne, retourner directement
      if (typeof item.name === 'string') return item.name;
      
      // Si name est un objet, essayer d'extraire une propriété
      if (typeof item.name === 'object' && item.name !== null) {
        console.warn(`⚠️ Article ${index}: 'name' est un objet:`, item.name);
        return item.name.value || item.name.name || item.name.productName || JSON.stringify(item.name);
      }
      
      // Sinon, retourner N/A
      console.warn(`⚠️ Article ${index}: 'name' invalide:`, item.name, typeof item.name);
      return 'N/A';
    };
    
    const itemName = getName(item);
    
    return `
      <tr>
        <td style="padding: 1rem;">${itemName}</td>
        <td style="padding: 1rem;">${formatCategory(item.category || 'autres')}</td>
        <td style="padding: 1rem; text-align: center;">
          <span style="font-weight: 600;">${item.quantity || 0} ${item.unit || ''}</span>
          ${item.alertThreshold && item.quantity < item.alertThreshold ? 
            '<span style="margin-left: 0.5rem; color: #e74c3c;"><i class="fas fa-exclamation-triangle"></i></span>' : 
            ''}
        </td>
        <td style="padding: 1rem; text-align: center;">
          ${item.expirationDate ? 
            `<span style="${isExpiringSoon(item.expirationDate) ? 'color: #e74c3c; font-weight: 600;' : ''}">${formatDate(item.expirationDate)}</span>` : 
            '-'}
        </td>
        <td style="padding: 1rem; text-align: center;">
          <button onclick="window.editStockItem('${item._id}')" style="background-color: #3498db; padding: 0.5rem 1rem; margin-right: 0.5rem; font-size: 0.85rem;">
            <i class="fas fa-edit"></i> Modifier
          </button>
          <button onclick="window.deleteStockItem('${item._id}')" style="background-color: #e74c3c; padding: 0.5rem 1rem; font-size: 0.85rem;">
            <i class="fas fa-trash"></i> Supprimer
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ========== MODAL AJOUT ARTICLE ==========

export function showAddStockModal() {
  console.log('📝 Ouverture modal ajout stock');
  
  const modal = document.createElement('div');
  modal.id = 'add-stock-modal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
  
  modal.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%;">
      <h3 style="margin-top: 0; color: #ff6b6b;">
        <i class="fas fa-plus-circle"></i> Ajouter un article au stock
      </h3>
      
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nom de l'article *</label>
        <input type="text" id="new-stock-name" placeholder="Ex: Tomates" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
      </div>
      
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Catégorie *</label>
        <select id="new-stock-category" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
          <option value="legumes">Légumes</option>
          <option value="viandes">Viandes</option>
          <option value="poissons">Poissons</option>
          <option value="produits-laitiers">Produits laitiers</option>
          <option value="cereales">Céréales</option>
          <option value="fruits">Fruits</option>
          <option value="epices">Épices</option>
          <option value="boissons">Boissons</option>
          <option value="autres">Autres</option>
        </select>
      </div>
      
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Quantité *</label>
          <input type="number" id="new-stock-quantity" min="0" step="0.1" placeholder="10" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
        </div>
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Unité *</label>
          <select id="new-stock-unit" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="L">L</option>
            <option value="cl">cl</option>
            <option value="pièces">pièces</option>
            <option value="boîtes">boîtes</option>
            <option value="sachets">sachets</option>
          </select>
        </div>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Date d'expiration (optionnel)</label>
        <input type="date" id="new-stock-expiration" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Seuil d'alerte (optionnel)</label>
        <input type="number" id="new-stock-alert" min="0" step="0.1" placeholder="5" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
      </div>
      
      <div style="display: flex; gap: 1rem;">
        <button onclick="window.saveNewStockItem()" style="flex: 1; background-color: #27ae60; color: white; border: none; padding: 0.9rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
          <i class="fas fa-check"></i> Ajouter
        </button>
        <button onclick="window.closeAddStockModal()" style="flex: 1; background-color: #e74c3c; color: white; border: none; padding: 0.9rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
          <i class="fas fa-times"></i> Annuler
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// ========== SAUVEGARDER NOUVEL ARTICLE ==========

window.saveNewStockItem = async function() {
  const name = document.getElementById('new-stock-name').value.trim();
  const category = document.getElementById('new-stock-category').value;
  const quantity = parseFloat(document.getElementById('new-stock-quantity').value);
  const unit = document.getElementById('new-stock-unit').value;
  const expirationDate = document.getElementById('new-stock-expiration').value;
  const alertThreshold = parseFloat(document.getElementById('new-stock-alert').value) || 0;

  if (!name || !category || isNaN(quantity) || quantity < 0 || !unit) {
    alert('Veuillez remplir tous les champs obligatoires (nom, catégorie, quantité, unité)');
    return;
  }

  try {
    const response = await fetch('/api/stock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // 🔐 Envoie automatiquement le cookie
      body: JSON.stringify({
        name,
        category,
        quantity,
        unit,
        expirationDate: expirationDate || null,
        alertThreshold,
        source: 'manual'
      })
    });

    if (response.ok) {
      console.log('✅ Article ajouté au stock');
      window.closeAddStockModal();
      loadStockData();
      alert('Article ajouté avec succès !');
    } else {
      const error = await response.json();
      console.error('❌ Erreur:', error);
      alert(`Erreur: ${error.message || 'Impossible d\'ajouter l\'article'}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout:', error);
    alert('Erreur lors de l\'ajout de l\'article');
  }
};

window.closeAddStockModal = function() {
  const modal = document.getElementById('add-stock-modal');
  if (modal) modal.remove();
};

// ========== MODIFIER/SUPPRIMER ARTICLE ==========

window.editStockItem = async function(itemId) {
  console.log(`✏️ Édition de l'article ${itemId}`);
  
  // Récupérer les détails de l'article
  const item = stockData.find(i => i._id === itemId);
  
  if (!item) {
    alert('Article non trouvé');
    return;
  }
  
  // Créer la modale d'édition
  const modal = document.createElement('div');
  modal.id = 'edit-stock-modal';
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
  
  modal.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%;">
      <h3 style="margin-top: 0; color: #3498db;">
        <i class="fas fa-edit"></i> Modifier l'article
      </h3>
      
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Nom de l'article *</label>
        <input type="text" id="edit-stock-name" value="${item.name}" placeholder="Ex: Tomates" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
      </div>
      
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Catégorie *</label>
        <select id="edit-stock-category" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
          <option value="legumes" ${item.category === 'legumes' ? 'selected' : ''}>Légumes</option>
          <option value="viandes" ${item.category === 'viandes' ? 'selected' : ''}>Viandes</option>
          <option value="poissons" ${item.category === 'poissons' ? 'selected' : ''}>Poissons</option>
          <option value="produits-laitiers" ${item.category === 'produits-laitiers' ? 'selected' : ''}>Produits laitiers</option>
          <option value="cereales" ${item.category === 'cereales' ? 'selected' : ''}>Céréales</option>
          <option value="fruits" ${item.category === 'fruits' ? 'selected' : ''}>Fruits</option>
          <option value="epices" ${item.category === 'epices' ? 'selected' : ''}>Épices</option>
          <option value="boissons" ${item.category === 'boissons' ? 'selected' : ''}>Boissons</option>
          <option value="autres" ${item.category === 'autres' ? 'selected' : ''}>Autres</option>
        </select>
      </div>
      
      <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Quantité *</label>
          <input type="number" id="edit-stock-quantity" value="${item.quantity}" min="0" step="0.1" placeholder="10" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
        </div>
        <div style="flex: 1;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Unité *</label>
          <select id="edit-stock-unit" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
            <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>kg</option>
            <option value="g" ${item.unit === 'g' ? 'selected' : ''}>g</option>
            <option value="L" ${item.unit === 'L' ? 'selected' : ''}>L</option>
            <option value="cl" ${item.unit === 'cl' ? 'selected' : ''}>cl</option>
            <option value="pièces" ${item.unit === 'pièces' ? 'selected' : ''}>pièces</option>
            <option value="boîtes" ${item.unit === 'boîtes' ? 'selected' : ''}>boîtes</option>
            <option value="sachets" ${item.unit === 'sachets' ? 'selected' : ''}>sachets</option>
          </select>
        </div>
      </div>
      
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Date d'expiration (optionnel)</label>
        <input type="date" id="edit-stock-expiration" value="${item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : ''}" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Seuil d'alerte (optionnel)</label>
        <input type="number" id="edit-stock-alert" value="${item.alertThreshold || 0}" min="0" step="0.1" placeholder="5" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
      </div>
      
      <div style="display: flex; gap: 1rem;">
        <button onclick="window.saveEditedStockItem('${itemId}')" style="flex: 1; background-color: #27ae60; color: white; border: none; padding: 0.9rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
          <i class="fas fa-check"></i> Sauvegarder
        </button>
        <button onclick="window.closeEditStockModal()" style="flex: 1; background-color: #e74c3c; color: white; border: none; padding: 0.9rem; border-radius: 8px; font-weight: 600; cursor: pointer;">
          <i class="fas fa-times"></i> Annuler
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
};

window.saveEditedStockItem = async function(itemId) {
  const name = document.getElementById('edit-stock-name').value.trim();
  const category = document.getElementById('edit-stock-category').value;
  const quantity = parseFloat(document.getElementById('edit-stock-quantity').value);
  const unit = document.getElementById('edit-stock-unit').value;
  const expirationDate = document.getElementById('edit-stock-expiration').value;
  const alertThreshold = parseFloat(document.getElementById('edit-stock-alert').value) || 0;

  if (!name || !category || isNaN(quantity) || quantity < 0 || !unit) {
    alert('Veuillez remplir tous les champs obligatoires (nom, catégorie, quantité, unité)');
    return;
  }

  try {
    const response = await fetch(`/api/stock/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        name,
        category,
        quantity,
        unit,
        expirationDate: expirationDate || null,
        alertThreshold
      })
    });

    if (response.ok) {
      console.log('✅ Article modifié avec succès');
      window.closeEditStockModal();
      showToast('✅ Article modifié avec succès !', 'success');
      loadStockData();
    } else {
      const error = await response.json();
      console.error('❌ Erreur:', error);
      alert(`Erreur: ${error.message || 'Impossible de modifier l\'article'}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la modification:', error);
    alert('Erreur lors de la modification de l\'article');
  }
};

window.closeEditStockModal = function() {
  const modal = document.getElementById('edit-stock-modal');
  if (modal) modal.remove();
};

// Fonction pour afficher un toast (notification temporaire)
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#27ae60' : '#3498db'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  `;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

window.deleteStockItem = async function(itemId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
    return;
  }

  try {
    const response = await fetch(`/api/stock/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include' // 🔐 Envoie automatiquement le cookie
    });

    if (response.ok) {
      console.log('✅ Article supprimé');
      showToast('🗑️ Article supprimé avec succès !', 'success');
      loadStockData(); // Recharger la liste
    } else {
      const error = await response.json();
      console.error('❌ Erreur:', error);
      alert(`Erreur: ${error.message || 'Impossible de supprimer l\'article'}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error);
    alert('Erreur lors de la suppression de l\'article');
  }
};

// ========== CONSOLIDER LE STOCK (REGROUPER DOUBLONS) ==========

export async function consolidateStock() {
  console.log('🔄 Consolidation du stock...');
  
  if (stockData.length === 0) {
    alert('Le stock est vide, rien à consolider.');
    return;
  }
  
  // Regrouper les articles par nom ET unité
  const groupedItems = new Map();
  
  stockData.forEach(item => {
    // Créer une clé unique basée sur le nom (normalisé) et l'unité
    const key = `${item.name.toLowerCase().trim()}_${item.unit.toLowerCase().trim()}`;
    
    if (groupedItems.has(key)) {
      // Article déjà présent : additionner les quantités
      const existing = groupedItems.get(key);
      existing.totalQuantity += item.quantity;
      existing.items.push(item);
    } else {
      // Nouvel article
      groupedItems.set(key, {
        name: item.name,
        unit: item.unit,
        category: item.category,
        totalQuantity: item.quantity,
        items: [item]
      });
    }
  });
  
  // Identifier les doublons (groupes avec plus d'un item)
  const duplicates = Array.from(groupedItems.values()).filter(group => group.items.length > 1);
  
  if (duplicates.length === 0) {
    showToast('✅ Aucun doublon trouvé ! Le stock est déjà consolidé.', 'success');
    return;
  }
  
  // Afficher une confirmation avec les détails
  const duplicateDetails = duplicates.map(group => 
    `• ${group.name} (${group.unit}): ${group.items.length} entrées → ${group.totalQuantity} ${group.unit} au total`
  ).join('\n');
  
  const confirmMessage = `🔍 Doublons trouvés:\n\n${duplicateDetails}\n\n✅ Voulez-vous les regrouper automatiquement?`;
  
  if (!confirm(confirmMessage)) {
    return;
  }
  
  // Procéder à la consolidation
  let consolidated = 0;
  let errors = 0;
  
  for (const group of duplicates) {
    try {
      // Garder le premier article et supprimer les autres
      const mainItem = group.items[0];
      const itemsToDelete = group.items.slice(1);
      
      // Mettre à jour la quantité du premier article
      const updateResponse = await fetch(`/api/stock/${mainItem._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: mainItem.name,
          category: group.category,
          quantity: group.totalQuantity,
          unit: mainItem.unit,
          expirationDate: mainItem.expirationDate || null,
          alertThreshold: mainItem.alertThreshold || 0
        })
      });
      
      if (!updateResponse.ok) {
        console.error(`❌ Erreur lors de la mise à jour de ${mainItem.name}`);
        errors++;
        continue;
      }
      
      // Supprimer les doublons
      for (const itemToDelete of itemsToDelete) {
        const deleteResponse = await fetch(`/api/stock/${itemToDelete._id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        
        if (!deleteResponse.ok) {
          console.error(`❌ Erreur lors de la suppression du doublon ${itemToDelete._id}`);
          errors++;
        }
      }
      
      consolidated++;
      console.log(`✅ ${group.name} consolidé: ${group.items.length} → 1 entrée (${group.totalQuantity} ${group.unit})`);
      
    } catch (error) {
      console.error(`❌ Erreur lors de la consolidation de ${group.name}:`, error);
      errors++;
    }
  }
  
  // Recharger le stock
  await loadStockData();
  
  // Afficher le résultat
  if (errors === 0) {
    showToast(`✅ Stock consolidé ! ${consolidated} produit(s) regroupé(s).`, 'success');
  } else {
    alert(`⚠️ Consolidation partielle: ${consolidated} produit(s) regroupé(s), ${errors} erreur(s).`);
  }
}

// ========== FONCTIONS UTILITAIRES ==========

function formatCategory(category) {
  const categories = {
    'legumes': 'Légumes',
    'viandes': 'Viandes',
    'poissons': 'Poissons',
    'produits-laitiers': 'Produits laitiers',
    'cereales': 'Céréales',
    'fruits': 'Fruits',
    'epices': 'Épices',
    'boissons': 'Boissons',
    'autres': 'Autres'
  };
  return categories[category] || category;
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
}

function isExpiringSoon(dateString) {
  if (!dateString) return false;
  const expirationDate = new Date(dateString);
  const today = new Date();
  const diffTime = expirationDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays >= 0;
}

export function filterStock() {
  const searchTerm = document.getElementById('stock-search')?.value.toLowerCase() || '';
  const categoryFilter = document.getElementById('stock-category-filter')?.value || '';
  
  const filteredData = stockData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm);
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Afficher les résultats filtrés (temporaire)
  console.log(`🔍 Filtrage: ${filteredData.length} / ${stockData.length} articles`);
}

// ========== INITIALISATION ==========

export async function loadDemoStock() {
  try {
    console.log('📦 Chargement du stock de démonstration...');
    
    // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
      // 🍪 Token géré via cookie HTTP-Only (authentification automatique)
    
    // Afficher un loader
    showToast('⏳ Chargement de 83 ingrédients en cours...', 'info');
    
    const response = await fetch('/api/stock/seed', {
      credentials: 'include', // 🍪 Cookie HTTP-Only
      method: 'POST',
      headers: {
        // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du chargement');
    }
    
    const result = await response.json();
    console.log('✅ Stock de démonstration chargé:', result);
    
    showToast(`🎉 ${result.data?.length || 83} ingrédients chargés avec succès !`, 'success');
    
    // Recharger les données
    await loadStockData();
    
  } catch (error) {
    console.error('❌ Erreur lors du chargement du stock de démonstration:', error);
    showToast('Erreur lors du chargement du stock: ' + error.message, 'error');
  }
}

export function initStockTab() {
  console.log('📦 Initialisation onglet Stock');
  
  const addStockItemBtn = document.getElementById('add-stock-item-btn');
  const loadDemoStockBtn = document.getElementById('load-demo-stock-btn');
  const refreshStockBtn = document.getElementById('refresh-stock-btn');
  const consolidateStockBtn = document.getElementById('consolidate-stock-btn');
  const stockSearch = document.getElementById('stock-search');
  const stockCategoryFilter = document.getElementById('stock-category-filter');
  
  if (addStockItemBtn) {
    addStockItemBtn.addEventListener('click', showAddStockModal);
    console.log('✅ Listener "Ajouter un article" ajouté');
  }
  
  if (loadDemoStockBtn) {
    loadDemoStockBtn.addEventListener('click', loadDemoStock);
    console.log('✅ Listener "Charger stock de démonstration" ajouté');
  }
  
  if (refreshStockBtn) {
    refreshStockBtn.addEventListener('click', loadStockData);
    console.log('✅ Listener "Actualiser" ajouté');
  }
  
  if (consolidateStockBtn) {
    consolidateStockBtn.addEventListener('click', consolidateStock);
    console.log('✅ Listener "Consolider le stock" ajouté');
  }
  
  if (stockSearch) {
    stockSearch.addEventListener('input', filterStock);
  }
  
  if (stockCategoryFilter) {
    stockCategoryFilter.addEventListener('change', filterStock);
  }
  
  // Charger les données
  loadStockData();
}

// 🌐 Exposer loadStockData à window pour les autres scripts
window.loadStockData = loadStockData;
