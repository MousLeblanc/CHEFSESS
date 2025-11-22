// Gestion de la comparaison des fournisseurs et du système de notation

let comparisonData = null;

/**
 * Charger et afficher la comparaison des fournisseurs
 */
export async function loadSupplierComparison() {
  const loadingEl = document.getElementById('comparison-loading');
  const resultsEl = document.getElementById('comparison-results');
  
  if (loadingEl) loadingEl.style.display = 'block';
  if (resultsEl) resultsEl.innerHTML = '';

  try {
    const response = await fetch('/api/suppliers/compare', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    comparisonData = result.data;

    if (loadingEl) loadingEl.style.display = 'none';
    if (resultsEl) {
      resultsEl.innerHTML = renderComparison(comparisonData);
      attachEventListeners();
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la comparaison:', error);
    if (loadingEl) loadingEl.style.display = 'none';
    if (resultsEl) {
      resultsEl.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #e74c3c;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
          <p>Erreur lors du chargement de la comparaison: ${error.message}</p>
        </div>
      `;
    }
  }
}

/**
 * Rendre la comparaison des produits
 */
function renderComparison(comparisons) {
  if (!comparisons || comparisons.length === 0) {
    return `
      <div style="padding: 2rem; text-align: center; color: #6c757d;">
        <i class="fas fa-info-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <p>Aucune comparaison disponible. Assurez-vous d'avoir plusieurs fournisseurs avec des produits similaires.</p>
      </div>
    `;
  }

  return comparisons.map(comparison => `
    <div class="comparison-card" style="background: white; border: 1px solid #dee2e6; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #e9ecef;">
        <div>
          <h3 style="margin: 0; color: #2c3e50; font-size: 1.3rem;">
            <i class="fas fa-box" style="color: #9c27b0; margin-right: 0.5rem;"></i>
            ${comparison.productName}
          </h3>
          <p style="margin: 0.5rem 0 0 0; color: #6c757d; font-size: 0.9rem;">
            <span style="background: #e9ecef; padding: 0.25rem 0.5rem; border-radius: 4px; margin-right: 0.5rem;">${comparison.category}</span>
            <span style="background: #e9ecef; padding: 0.25rem 0.5rem; border-radius: 4px;">${comparison.unit}</span>
          </p>
        </div>
        ${comparison.priceRange ? `
          <div style="text-align: right;">
            <div style="font-size: 0.9rem; color: #6c757d; margin-bottom: 0.25rem;">Écart de prix</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: ${comparison.priceRange.differencePercent > 20 ? '#e74c3c' : comparison.priceRange.differencePercent > 10 ? '#f39c12' : '#27ae60'};">
              ${comparison.priceRange.differencePercent}%
            </div>
            <div style="font-size: 0.8rem; color: #6c757d;">
              ${comparison.priceRange.min.toFixed(2)}€ - ${comparison.priceRange.max.toFixed(2)}€
            </div>
          </div>
        ` : ''}
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
        ${comparison.suppliers.map((supplier, index) => `
          <div class="supplier-card" 
               style="border: 2px solid ${index === 0 ? '#27ae60' : '#dee2e6'}; 
                      border-radius: 8px; 
                      padding: 1rem; 
                      background: ${index === 0 ? '#f8fff9' : 'white'};
                      position: relative;">
            ${index === 0 ? `
              <div style="position: absolute; top: -10px; right: 10px; background: #27ae60; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                <i class="fas fa-trophy"></i> Meilleur prix
              </div>
            ` : ''}
            
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
              <h4 style="margin: 0; color: #2c3e50; font-size: 1.1rem;">
                ${supplier.supplierName}
              </h4>
              ${supplier.rating > 0 ? `
                <div style="display: flex; align-items: center; gap: 0.25rem;">
                  ${renderStars(supplier.rating)}
                  <span style="font-size: 0.85rem; color: #6c757d; margin-left: 0.25rem;">(${supplier.ratingCount})</span>
                </div>
              ` : ''}
            </div>

            <div style="margin-bottom: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <span style="color: #6c757d; font-size: 0.9rem;">Prix</span>
                <div>
                  ${supplier.basePrice !== supplier.finalPrice ? `
                    <span style="text-decoration: line-through; color: #999; font-size: 0.9rem; margin-right: 0.5rem;">
                      ${supplier.basePrice.toFixed(2)}€
                    </span>
                  ` : ''}
                  <span style="font-size: 1.3rem; font-weight: 700; color: #27ae60;">
                    ${supplier.finalPrice.toFixed(2)}€
                  </span>
                  ${supplier.hasSuperPromo ? `
                    <span style="background: #f39c12; color: white; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; margin-left: 0.5rem;">
                      Super Promo
                    </span>
                  ` : supplier.hasToSave ? `
                    <span style="background: #e74c3c; color: white; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; margin-left: 0.5rem;">
                      À sauver
                    </span>
                  ` : supplier.promo > 0 ? `
                    <span style="background: #3498db; color: white; padding: 0.15rem 0.5rem; border-radius: 4px; font-size: 0.7rem; margin-left: 0.5rem;">
                      -${supplier.promo}%
                    </span>
                  ` : ''}
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem; color: #6c757d;">
                <div>
                  <i class="fas fa-clock"></i> Livraison: ${supplier.deliveryTime} jour(s)
                </div>
                <div>
                  <i class="fas fa-shopping-cart"></i> Min: ${supplier.minOrder} ${supplier.unit}
                </div>
                ${supplier.stock !== undefined ? `
                  <div>
                    <i class="fas fa-boxes"></i> Stock: 
                    <span style="color: ${supplier.stock > 0 ? '#27ae60' : '#e74c3c'}; font-weight: 600;">
                      ${supplier.stock > 0 ? 'Disponible' : 'Rupture'}
                    </span>
                  </div>
                ` : ''}
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap;">
              <button class="btn-rate-supplier" 
                      data-supplier-id="${supplier.supplierId}"
                      data-supplier-name="${supplier.supplierName}"
                      style="flex: 1; min-width: 100px; padding: 0.5rem; background: #9c27b0; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: background 0.2s;">
                <i class="fas fa-star"></i> Noter
              </button>
              ${supplier.ratingCount > 0 ? `
                <button class="btn-view-ratings" 
                        data-supplier-id="${supplier.supplierId}"
                        data-supplier-name="${supplier.supplierName}"
                        style="flex: 1; min-width: 100px; padding: 0.5rem; background: #f39c12; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: background 0.2s;">
                  <i class="fas fa-comments"></i> Avis (${supplier.ratingCount})
                </button>
              ` : ''}
              <button class="btn-view-supplier" 
                      data-supplier-id="${supplier.supplierId}"
                      data-supplier-name="${supplier.supplierName}"
                      style="flex: 1; min-width: 100px; padding: 0.5rem; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; transition: background 0.2s;">
                <i class="fas fa-eye"></i> Voir
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/**
 * Rendre les étoiles de notation
 */
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  let html = '';
  for (let i = 0; i < fullStars; i++) {
    html += '<i class="fas fa-star" style="color: #f39c12;"></i>';
  }
  if (hasHalfStar) {
    html += '<i class="fas fa-star-half-alt" style="color: #f39c12;"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    html += '<i class="far fa-star" style="color: #ddd;"></i>';
  }
  return html;
}

/**
 * Attacher les event listeners
 */
function attachEventListeners() {
  // Bouton actualiser
  const refreshBtn = document.getElementById('refresh-comparison-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadSupplierComparison);
  }

  // Boutons de notation
  document.querySelectorAll('.btn-rate-supplier').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const supplierId = e.target.closest('.btn-rate-supplier').dataset.supplierId;
      const supplierName = e.target.closest('.btn-rate-supplier').dataset.supplierName;
      showRatingModal(supplierId, supplierName);
    });
  });

  // Boutons voir avis
  document.querySelectorAll('.btn-view-ratings').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const supplierId = e.target.closest('.btn-view-ratings').dataset.supplierId;
      const supplierName = e.target.closest('.btn-view-ratings').dataset.supplierName;
      await showSupplierRatings(supplierId, supplierName);
    });
  });

  // Boutons voir fournisseur
  document.querySelectorAll('.btn-view-supplier').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const supplierId = e.target.closest('.btn-view-supplier').dataset.supplierId;
      const supplierName = e.target.closest('.btn-view-supplier').dataset.supplierName || 'Fournisseur';
      
      console.log('👁️ Clic sur "Voir" pour le fournisseur:', supplierId, supplierName);
      
      // Naviguer vers l'onglet fournisseurs
      const suppliersTab = document.querySelector('[data-tab="suppliers"]');
      if (suppliersTab) {
        suppliersTab.click();
        
        // Attendre que l'onglet soit chargé, puis ouvrir le catalogue
        setTimeout(async () => {
          // Utiliser la fonction globale pour ouvrir le catalogue
          if (typeof window.browseSupplierProductsGlobal === 'function') {
            console.log('✅ Ouverture du catalogue via browseSupplierProductsGlobal');
            await window.browseSupplierProductsGlobal(supplierId, supplierName);
          } else if (typeof window.browseSupplierProducts === 'function') {
            console.log('✅ Ouverture du catalogue via browseSupplierProducts');
            await window.browseSupplierProducts(supplierId, supplierName);
          } else {
            console.error('❌ Fonction browseSupplierProducts non disponible');
            alert('Impossible d\'ouvrir le catalogue du fournisseur');
          }
        }, 300); // Petit délai pour laisser l'onglet se charger
      } else {
        console.error('❌ Onglet fournisseurs non trouvé');
        // Essayer quand même d'ouvrir le catalogue
        if (typeof window.browseSupplierProductsGlobal === 'function') {
          await window.browseSupplierProductsGlobal(supplierId, supplierName);
        }
      }
    });
  });
}

/**
 * Afficher le modal de notation
 */
function showRatingModal(supplierId, supplierName) {
  const modal = document.createElement('div');
  modal.id = 'rating-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
    background: rgba(0,0,0,0.5); z-index: 10000; 
    display: flex; align-items: center; justify-content: center;
  `;

  modal.innerHTML = `
    <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h2 style="margin: 0; color: #2c3e50;">
          <i class="fas fa-star" style="color: #f39c12;"></i>
          Noter ${supplierName}
        </h2>
        <button id="close-rating-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6c757d;">
          &times;
        </button>
      </div>

      <form id="rating-form">
        <input type="hidden" name="supplierId" value="${supplierId}">

        <!-- Note globale -->
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #2c3e50;">
            Note globale <span style="color: #e74c3c;">*</span>
          </label>
          <div id="overall-rating" class="star-rating" data-rating="0" style="display: flex; gap: 0.5rem; font-size: 2rem; cursor: pointer;">
            ${[1,2,3,4,5].map(i => `<i class="far fa-star" data-value="${i}" style="color: #ddd; transition: color 0.2s;"></i>`).join('')}
          </div>
          <input type="hidden" name="overallRating" id="overall-rating-value" required>
        </div>

        <!-- Notes détaillées -->
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #2c3e50;">
            Notes détaillées (optionnel)
          </label>
          
          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span>Prix</span>
              <div class="star-rating-small" data-rating="0" data-field="price" style="display: flex; gap: 0.25rem; font-size: 1.2rem; cursor: pointer;">
                ${[1,2,3,4,5].map(i => `<i class="far fa-star" data-value="${i}" style="color: #ddd;"></i>`).join('')}
              </div>
            </div>
            <input type="hidden" name="ratings[price]" id="rating-price">
          </div>

          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span>Délai de livraison</span>
              <div class="star-rating-small" data-rating="0" data-field="deliveryTime" style="display: flex; gap: 0.25rem; font-size: 1.2rem; cursor: pointer;">
                ${[1,2,3,4,5].map(i => `<i class="far fa-star" data-value="${i}" style="color: #ddd;"></i>`).join('')}
              </div>
            </div>
            <input type="hidden" name="ratings[deliveryTime]" id="rating-deliveryTime">
          </div>

          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span>Qualité des produits</span>
              <div class="star-rating-small" data-rating="0" data-field="productQuality" style="display: flex; gap: 0.25rem; font-size: 1.2rem; cursor: pointer;">
                ${[1,2,3,4,5].map(i => `<i class="far fa-star" data-value="${i}" style="color: #ddd;"></i>`).join('')}
              </div>
            </div>
            <input type="hidden" name="ratings[productQuality]" id="rating-productQuality">
          </div>

          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span>Communication</span>
              <div class="star-rating-small" data-rating="0" data-field="communication" style="display: flex; gap: 0.25rem; font-size: 1.2rem; cursor: pointer;">
                ${[1,2,3,4,5].map(i => `<i class="far fa-star" data-value="${i}" style="color: #ddd;"></i>`).join('')}
              </div>
            </div>
            <input type="hidden" name="ratings[communication]" id="rating-communication">
          </div>

          <div style="margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span>Emballage</span>
              <div class="star-rating-small" data-rating="0" data-field="packaging" style="display: flex; gap: 0.25rem; font-size: 1.2rem; cursor: pointer;">
                ${[1,2,3,4,5].map(i => `<i class="far fa-star" data-value="${i}" style="color: #ddd;"></i>`).join('')}
              </div>
            </div>
            <input type="hidden" name="ratings[packaging]" id="rating-packaging">
          </div>
        </div>

        <!-- Commentaires -->
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #2c3e50;">
            Points positifs
          </label>
          <textarea name="feedback[positive]" 
                    style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px; min-height: 80px; font-family: inherit;"
                    placeholder="Qu'est-ce qui vous a plu ?"></textarea>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #2c3e50;">
            Points à améliorer
          </label>
          <textarea name="feedback[negative]" 
                    style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px; min-height: 80px; font-family: inherit;"
                    placeholder="Qu'est-ce qui pourrait être amélioré ?"></textarea>
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #2c3e50;">
            Suggestions
          </label>
          <textarea name="feedback[suggestions]" 
                    style="width: 100%; padding: 0.75rem; border: 1px solid #dee2e6; border-radius: 6px; min-height: 80px; font-family: inherit;"
                    placeholder="Avez-vous des suggestions ?"></textarea>
        </div>

        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button type="button" id="cancel-rating" 
                  style="padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            Annuler
          </button>
          <button type="submit" 
                  style="padding: 0.75rem 1.5rem; background: #9c27b0; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            <i class="fas fa-check"></i> Enregistrer
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  // Event listeners pour les étoiles
  setupStarRatings(modal);

  // Fermer le modal
  modal.querySelector('#close-rating-modal').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  modal.querySelector('#cancel-rating').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });

  // Soumettre le formulaire
  modal.querySelector('#rating-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitRating(modal);
  });
}

/**
 * Configurer les étoiles de notation
 */
function setupStarRatings(modal) {
  // Note globale
  const overallRating = modal.querySelector('#overall-rating');
  overallRating.querySelectorAll('i').forEach(star => {
    star.addEventListener('click', (e) => {
      const value = parseInt(e.target.dataset.value);
      setStarRating(overallRating, value);
      modal.querySelector('#overall-rating-value').value = value;
    });
    star.addEventListener('mouseenter', (e) => {
      const value = parseInt(e.target.dataset.value);
      highlightStars(overallRating, value);
    });
  });
  overallRating.addEventListener('mouseleave', () => {
    const currentRating = parseInt(overallRating.dataset.rating);
    highlightStars(overallRating, currentRating);
  });

  // Notes détaillées
  modal.querySelectorAll('.star-rating-small').forEach(ratingEl => {
    const field = ratingEl.dataset.field;
    ratingEl.querySelectorAll('i').forEach(star => {
      star.addEventListener('click', (e) => {
        const value = parseInt(e.target.dataset.value);
        setStarRating(ratingEl, value);
        modal.querySelector(`#rating-${field}`).value = value;
      });
      star.addEventListener('mouseenter', (e) => {
        const value = parseInt(e.target.dataset.value);
        highlightStars(ratingEl, value);
      });
    });
    ratingEl.addEventListener('mouseleave', () => {
      const currentRating = parseInt(ratingEl.dataset.rating);
      highlightStars(ratingEl, currentRating);
    });
  });
}

/**
 * Définir la note des étoiles
 */
function setStarRating(ratingEl, value) {
  ratingEl.dataset.rating = value;
  highlightStars(ratingEl, value);
}

/**
 * Mettre en évidence les étoiles
 */
function highlightStars(ratingEl, value) {
  ratingEl.querySelectorAll('i').forEach((star, index) => {
    if (index < value) {
      star.className = 'fas fa-star';
      star.style.color = '#f39c12';
    } else {
      star.className = 'far fa-star';
      star.style.color = '#ddd';
    }
  });
}

/**
 * Soumettre la notation
 */
async function submitRating(modal) {
  const form = modal.querySelector('#rating-form');
  const formData = new FormData(form);

  const ratingData = {
    supplierId: formData.get('supplierId'),
    overallRating: parseInt(formData.get('overallRating')),
    ratings: {
      price: formData.get('ratings[price]') ? parseInt(formData.get('ratings[price]')) : undefined,
      deliveryTime: formData.get('ratings[deliveryTime]') ? parseInt(formData.get('ratings[deliveryTime]')) : undefined,
      productQuality: formData.get('ratings[productQuality]') ? parseInt(formData.get('ratings[productQuality]')) : undefined,
      communication: formData.get('ratings[communication]') ? parseInt(formData.get('ratings[communication]')) : undefined,
      packaging: formData.get('ratings[packaging]') ? parseInt(formData.get('ratings[packaging]')) : undefined
    },
    feedback: {
      positive: formData.get('feedback[positive]') || undefined,
      negative: formData.get('feedback[negative]') || undefined,
      suggestions: formData.get('feedback[suggestions]') || undefined
    }
  };

  // Nettoyer les valeurs undefined
  Object.keys(ratingData.ratings).forEach(key => {
    if (ratingData.ratings[key] === undefined) {
      delete ratingData.ratings[key];
    }
  });
  Object.keys(ratingData.feedback).forEach(key => {
    if (ratingData.feedback[key] === undefined) {
      delete ratingData.feedback[key];
    }
  });

  try {
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
    
    const response = await fetchFn('/api/suppliers/ratings', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ratingData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'enregistrement de la notation');
    }

    // Afficher un message de succès
    alert('Merci pour votre avis !');
    document.body.removeChild(modal);
    
    // Recharger la comparaison pour mettre à jour les notes
    await loadSupplierComparison();
  } catch (error) {
    console.error('Erreur lors de la soumission de la notation:', error);
    alert(`Erreur: ${error.message}`);
  }
}

/**
 * Afficher les avis détaillés d'un fournisseur
 */
async function showSupplierRatings(supplierId, supplierName) {
  try {
    console.log('📊 [showSupplierRatings] Chargement des avis pour:', supplierId, supplierName);
    
    // Vérifier le rôle de l'utilisateur pour déterminer ce qui doit être affiché
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const isSupplier = user && (user.role === 'fournisseur' || (user.roles && (user.roles.includes('fournisseur') || user.roles.includes('SUPPLIER'))));
    
    console.log('📊 [showSupplierRatings] Utilisateur est fournisseur?', isSupplier);
    
    const apiUrl = `/api/suppliers/ratings/supplier/${supplierId}`;
    console.log('📊 [showSupplierRatings] URL API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    console.log('📊 [showSupplierRatings] Réponse API:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [showSupplierRatings] Erreur API:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('📊 [showSupplierRatings] Résultat:', result);
    console.log('📊 [showSupplierRatings] result.success:', result.success);
    console.log('📊 [showSupplierRatings] result.data:', result.data);
    
    // Vérifier que la structure de réponse est correcte
    if (!result.success) {
      throw new Error(result.message || 'Erreur lors de la récupération des avis');
    }
    
    if (!result.data) {
      throw new Error('Données non disponibles dans la réponse');
    }
    
    const ratings = result.data.ratings || [];
    const averages = result.data.averages || {
      averageRating: 0,
      count: 0,
      priceAvg: 0,
      deliveryAvg: 0,
      qualityAvg: 0,
      communicationAvg: 0,
      packagingAvg: 0
    };
    
    console.log('📊 [showSupplierRatings] Nombre d\'avis:', ratings.length);
    console.log('📊 [showSupplierRatings] Moyennes:', averages);

    // Créer le modal
    const modal = document.createElement('div');
    modal.id = 'ratings-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.5); z-index: 10000; 
      display: flex; align-items: center; justify-content: center;
    `;

    modal.innerHTML = `
      <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 style="margin: 0; color: #2c3e50;">
            <i class="fas fa-star" style="color: #f39c12;"></i>
            Avis sur ${supplierName}
          </h2>
          <button id="close-ratings-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6c757d;">
            &times;
          </button>
        </div>

        ${ratings.length === 0 ? `
          <div style="text-align: center; padding: 3rem; color: #6c757d;">
            <i class="fas fa-star" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
            <p>Aucun avis pour le moment</p>
          </div>
        ` : `
          <!-- Résumé des notes -->
          <div style="background: #f8f9fa; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
              <div style="font-size: 3rem; font-weight: 700; color: #f39c12;">
                ${averages.averageRating.toFixed(1)}
              </div>
              <div>
                <div style="margin-bottom: 0.5rem;">
                  ${renderStars(averages.averageRating)}
                </div>
                <div style="color: #6c757d; font-size: 0.9rem;">
                  Basé sur ${averages.count} avis
                </div>
              </div>
            </div>
            
            ${averages.priceAvg > 0 || averages.deliveryAvg > 0 || averages.qualityAvg > 0 ? `
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #dee2e6;">
                ${averages.priceAvg > 0 ? `
                  <div>
                    <div style="font-size: 0.85rem; color: #6c757d; margin-bottom: 0.25rem;">Prix</div>
                    <div>${renderStars(averages.priceAvg)}</div>
                  </div>
                ` : ''}
                ${averages.deliveryAvg > 0 ? `
                  <div>
                    <div style="font-size: 0.85rem; color: #6c757d; margin-bottom: 0.25rem;">Livraison</div>
                    <div>${renderStars(averages.deliveryAvg)}</div>
                  </div>
                ` : ''}
                ${averages.qualityAvg > 0 ? `
                  <div>
                    <div style="font-size: 0.85rem; color: #6c757d; margin-bottom: 0.25rem;">Qualité</div>
                    <div>${renderStars(averages.qualityAvg)}</div>
                  </div>
                ` : ''}
                ${averages.communicationAvg > 0 ? `
                  <div>
                    <div style="font-size: 0.85rem; color: #6c757d; margin-bottom: 0.25rem;">Communication</div>
                    <div>${renderStars(averages.communicationAvg)}</div>
                  </div>
                ` : ''}
                ${averages.packagingAvg > 0 ? `
                  <div>
                    <div style="font-size: 0.85rem; color: #6c757d; margin-bottom: 0.25rem;">Emballage</div>
                    <div>${renderStars(averages.packagingAvg)}</div>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          </div>

          <!-- Liste des avis -->
          <div>
            <h3 style="margin-bottom: 1rem; color: #2c3e50;">Avis détaillés</h3>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
              ${ratings.map(rating => `
                <div style="border: 1px solid #dee2e6; border-radius: 8px; padding: 1rem;">
                  <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                    <div>
                      <div style="font-weight: 600; color: #2c3e50; margin-bottom: 0.25rem;">
                        ${rating.reviewer?.name || 'Anonyme'}
                        ${rating.site?.siteName ? ` - ${rating.site.siteName}` : ''}
                      </div>
                      <div style="color: #6c757d; font-size: 0.85rem;">
                        ${new Date(rating.createdAt).toLocaleDateString('fr-FR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div>
                      ${renderStars(rating.overallRating)}
                    </div>
                  </div>
                  
                  ${rating.feedback?.positive || (isSupplier && (rating.feedback?.negative || rating.feedback?.suggestions)) ? `
                    <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #f0f0f0;">
                      ${rating.feedback.positive ? `
                        <div style="margin-bottom: 0.5rem;">
                          <div style="font-weight: 600; color: #27ae60; margin-bottom: 0.25rem; font-size: 0.9rem;">
                            <i class="fas fa-thumbs-up"></i> Points positifs
                          </div>
                          <div style="color: #555; font-size: 0.9rem;">${rating.feedback.positive}</div>
                        </div>
                      ` : ''}
                      ${isSupplier && rating.feedback.negative ? `
                        <div style="margin-bottom: 0.5rem;">
                          <div style="font-weight: 600; color: #e74c3c; margin-bottom: 0.25rem; font-size: 0.9rem;">
                            <i class="fas fa-thumbs-down"></i> Points à améliorer
                          </div>
                          <div style="color: #555; font-size: 0.9rem;">${rating.feedback.negative}</div>
                        </div>
                      ` : ''}
                      ${isSupplier && rating.feedback.suggestions ? `
                        <div>
                          <div style="font-weight: 600; color: #3498db; margin-bottom: 0.25rem; font-size: 0.9rem;">
                            <i class="fas fa-lightbulb"></i> Suggestions
                          </div>
                          <div style="color: #555; font-size: 0.9rem;">${rating.feedback.suggestions}</div>
                        </div>
                      ` : ''}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `}
      </div>
    `;

    document.body.appendChild(modal);

    // Fermer le modal
    modal.querySelector('#close-ratings-modal').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  } catch (error) {
    console.error('❌ [showSupplierRatings] Erreur lors du chargement des avis:', error);
    console.error('❌ [showSupplierRatings] Stack:', error.stack);
    
    // Afficher un modal d'erreur au lieu d'une alerte
    const errorModal = document.createElement('div');
    errorModal.id = 'ratings-error-modal';
    errorModal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.5); z-index: 10000; 
      display: flex; align-items: center; justify-content: center;
    `;
    
    let errorMessage = error.message || 'Erreur inconnue';
    if (errorMessage.includes('404')) {
      errorMessage = 'Les avis pour ce fournisseur n\'ont pas été trouvés.';
    } else if (errorMessage.includes('403')) {
      errorMessage = 'Vous n\'avez pas les permissions pour voir ces avis.';
    } else if (errorMessage.includes('401')) {
      errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
    }
    
    errorModal.innerHTML = `
      <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 500px; width: 90%;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2 style="margin: 0; color: #e74c3c;">
            <i class="fas fa-exclamation-triangle"></i> Erreur
          </h2>
          <button id="close-error-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6c757d;">
            &times;
          </button>
        </div>
        <p style="color: #555; margin-bottom: 1.5rem;">${errorMessage}</p>
        <button id="retry-ratings" style="padding: 0.75rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem;">
          Réessayer
        </button>
      </div>
    `;
    
    document.body.appendChild(errorModal);
    
    errorModal.querySelector('#close-error-modal').addEventListener('click', () => {
      document.body.removeChild(errorModal);
    });
    
    errorModal.querySelector('#retry-ratings').addEventListener('click', () => {
      document.body.removeChild(errorModal);
      showSupplierRatings(supplierId, supplierName);
    });
    
    errorModal.addEventListener('click', (e) => {
      if (e.target === errorModal) {
        document.body.removeChild(errorModal);
      }
    });
  }
}

// Exposer la fonction globalement
if (typeof window !== 'undefined') {
  window.loadSupplierComparison = loadSupplierComparison;
}

