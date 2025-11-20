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
      originalStockData = [...stockData]; // Sauvegarder les données originales pour le filtrage
      console.log(`✅ ${stockData.length} articles en stock`);
      console.log('📊 Données stock:', stockData);
      
      if (stockData.length > 0) {
        console.log('📦 Premier article:', stockData[0]);
        console.log('📦 Nom:', stockData[0].name, '| Type:', typeof stockData[0].name);
        console.log('📦 Seuil d\'alerte:', stockData[0].alertThreshold, '| Type:', typeof stockData[0].alertThreshold);
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

export function renderStockTable(filteredData = null) {
  const stockTableBody = document.getElementById('stock-table-body');
  if (!stockTableBody) {
    console.warn('⚠️ Élément stock-table-body non trouvé');
    return;
  }

  // Utiliser les données filtrées si fournies, sinon utiliser stockData
  const dataToRender = filteredData !== null ? filteredData : stockData;
  
  console.log('🎨 Rendu de la table stock, articles:', dataToRender.length);
  console.log('🎨 Données à afficher:', dataToRender);
  
  if (dataToRender.length === 0) {
    stockTableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2rem; color: #6c757d;">
          <i class="fas fa-box-open" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
          ${stockData.length === 0 ? 'Aucun article en stock' : 'Aucun article ne correspond aux filtres'}
        </td>
      </tr>
    `;
    return;
  }

  stockTableBody.innerHTML = dataToRender.map((item, index) => {
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
    // Vérifier si alertThreshold existe et est valide (peut être 0, donc on vérifie !== undefined && !== null)
    const alertThresholdValue = item.alertThreshold !== undefined && item.alertThreshold !== null ? parseFloat(item.alertThreshold) : null;
    const formattedAlertThreshold = alertThresholdValue !== null && alertThresholdValue > 0
      ? `${alertThresholdValue} ${item.unit || ''}`
      : '-';
    
    // Vérifier si l'alerte est déclenchée (seulement si le seuil est défini et > 0)
    const isAlertTriggered = alertThresholdValue !== null && alertThresholdValue > 0 && item.quantity < alertThresholdValue;
    
    return `
      <tr>
        <td style="padding: 1rem;">${itemName}</td>
        <td style="padding: 1rem;">${formatCategory(item.category || 'autres')}</td>
        <td style="padding: 1rem; text-align: center;">
          <span style="font-weight: 600;">${item.quantity || 0} ${item.unit || ''}</span>
          ${isAlertTriggered ? 
            '<span style="margin-left: 0.5rem; color: #e74c3c;"><i class="fas fa-exclamation-triangle"></i></span>' : 
            ''}
        </td>
        <td style="padding: 1rem; text-align: center; ${isAlertTriggered ? 'color: #e74c3c; font-weight: 600;' : ''}">
          ${formattedAlertThreshold}
        </td>
        <td style="padding: 1rem; text-align: center; font-weight: 600; color: #27ae60;">
          ${formattedPrice}
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
  modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; overflow-y: auto;';
  
  // Définir la date d'aujourd'hui par défaut
  const today = new Date().toISOString().split('T')[0];
  
  modal.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 600px; width: 90%; margin: 2rem auto;">
      <h3 style="margin-top: 0; color: #ff6b6b;">
        <i class="fas fa-plus-circle"></i> Ajouter un article au stock
      </h3>
      
      <!-- Onglets -->
      <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e0e0e0;">
        <button id="tab-manual" class="stock-tab-btn active" style="flex: 1; padding: 0.75rem; background: #f8f9fa; border: none; border-bottom: 3px solid #27ae60; cursor: pointer; font-weight: 600; color: #27ae60;">
          <i class="fas fa-keyboard"></i> Saisie manuelle
        </button>
        <button id="tab-ocr" class="stock-tab-btn" style="flex: 1; padding: 0.75rem; background: #f8f9fa; border: none; border-bottom: 3px solid transparent; cursor: pointer; font-weight: 600; color: #666;">
          <i class="fas fa-camera"></i> Scanner OCR
        </button>
      </div>
      
      <!-- Contenu Onglet Saisie manuelle -->
      <div id="manual-tab-content" class="stock-tab-content">
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
              <option value="ml">ml</option>
              <option value="cl">cl</option>
              <option value="pièces">pièces</option>
              <option value="boîtes">boîtes</option>
              <option value="sachets">sachets</option>
            </select>
          </div>
        </div>
        
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Date d'achat *</label>
            <input type="date" id="new-stock-purchase-date" value="${today}" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
          </div>
          <div style="flex: 1;">
            <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Magasin/Fournisseur *</label>
            <input type="text" id="new-stock-store" placeholder="Ex: Carrefour, Metro..." style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
          </div>
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Prix d'achat (€) *</label>
          <input type="number" id="new-stock-price" min="0" step="0.01" placeholder="0.00" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 1rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Date d'expiration (optionnel)</label>
          <input type="date" id="new-stock-expiration" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
        </div>
        
        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Seuil d'alerte (optionnel)</label>
          <input type="number" id="new-stock-alert" min="0" step="0.1" placeholder="5" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
        </div>
      </div>
      
      <!-- Contenu Onglet OCR -->
      <div id="ocr-tab-content" class="stock-tab-content" style="display: none;">
        <div style="margin-bottom: 1.5rem; padding: 1.5rem; background: #f8f9fa; border-radius: 8px; border: 2px dashed #ced4da;">
          <p style="margin: 0 0 1rem 0; color: #666; text-align: center;">
            <i class="fas fa-info-circle"></i> Scannez un ticket de caisse ou une facture pour extraire automatiquement les informations
          </p>
          <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
            <input type="file" id="ocr-image-upload" accept="image/*" style="display: none;">
            <button type="button" id="ocr-upload-btn" style="padding: 0.8rem 1.5rem; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              <i class="fas fa-upload"></i> Choisir une image
            </button>
            <button type="button" id="ocr-camera-btn" style="padding: 0.8rem 1.5rem; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
              <i class="fas fa-camera"></i> Prendre une photo
            </button>
          </div>
          <div id="ocr-preview" style="margin-top: 1rem; text-align: center; display: none;">
            <img id="ocr-preview-img" style="max-width: 100%; max-height: 300px; border-radius: 8px; border: 2px solid #ced4da;">
          </div>
          <div id="ocr-loading" style="display: none; text-align: center; margin-top: 1rem; color: #3498db;">
            <i class="fas fa-spinner fa-spin"></i> Traitement OCR en cours...
          </div>
          <div id="ocr-results" style="margin-top: 1rem; display: none;">
            <h4 style="margin-bottom: 0.5rem; color: #27ae60;">
              <i class="fas fa-check-circle"></i> Données extraites
            </h4>
            <div id="ocr-detected-items" style="padding: 1rem; background: white; border-radius: 8px; border: 1px solid #ced4da; max-height: 300px; overflow-y: auto;">
              <!-- Les items détectés seront affichés ici -->
            </div>
            <button type="button" id="ocr-use-data-btn" style="width: 100%; margin-top: 1rem; padding: 0.8rem; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; display: none;">
              <i class="fas fa-check"></i> Utiliser ces données
            </button>
          </div>
        </div>
      </div>
      
      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
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
  
  // Initialiser les onglets
  initStockModalTabs(modal);
  
  // Initialiser l'OCR
  initStockOCR(modal);
}

// ========== SAUVEGARDER NOUVEL ARTICLE ==========

// ========== GESTION DES ONGLETS ==========
function initStockModalTabs(modal) {
  const tabManual = modal.querySelector('#tab-manual');
  const tabOcr = modal.querySelector('#tab-ocr');
  const contentManual = modal.querySelector('#manual-tab-content');
  const contentOcr = modal.querySelector('#ocr-tab-content');
  
  tabManual?.addEventListener('click', () => {
    tabManual.classList.add('active');
    tabManual.style.borderBottomColor = '#27ae60';
    tabManual.style.color = '#27ae60';
    tabOcr.classList.remove('active');
    tabOcr.style.borderBottomColor = 'transparent';
    tabOcr.style.color = '#666';
    contentManual.style.display = 'block';
    contentOcr.style.display = 'none';
  });
  
  tabOcr?.addEventListener('click', () => {
    tabOcr.classList.add('active');
    tabOcr.style.borderBottomColor = '#27ae60';
    tabOcr.style.color = '#27ae60';
    tabManual.classList.remove('active');
    tabManual.style.borderBottomColor = 'transparent';
    tabManual.style.color = '#666';
    contentManual.style.display = 'none';
    contentOcr.style.display = 'block';
  });
}

// ========== GESTION OCR ==========
function initStockOCR(modal) {
  const uploadBtn = modal.querySelector('#ocr-upload-btn');
  const cameraBtn = modal.querySelector('#ocr-camera-btn');
  const fileInput = modal.querySelector('#ocr-image-upload');
  const preview = modal.querySelector('#ocr-preview');
  const previewImg = modal.querySelector('#ocr-preview-img');
  const loading = modal.querySelector('#ocr-loading');
  const results = modal.querySelector('#ocr-results');
  const detectedItems = modal.querySelector('#ocr-detected-items');
  const useDataBtn = modal.querySelector('#ocr-use-data-btn');
  
  // Upload fichier
  uploadBtn?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleOCRImage(file, modal);
  });
  
  // Caméra
  cameraBtn?.addEventListener('click', () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();
          
          const captureModal = document.createElement('div');
          captureModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 2000;';
          captureModal.innerHTML = `
            <video id="capture-video" autoplay style="max-width: 90%; max-height: 70%; border-radius: 8px;"></video>
            <div style="margin-top: 2rem; display: flex; gap: 1rem;">
              <button id="capture-btn" style="padding: 1rem 2rem; background: #27ae60; color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer;">
                <i class="fas fa-camera"></i> Capturer
              </button>
              <button id="cancel-capture-btn" style="padding: 1rem 2rem; background: #e74c3c; color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer;">
                Annuler
              </button>
            </div>
          `;
          document.body.appendChild(captureModal);
          
          const captureVideo = captureModal.querySelector('#capture-video');
          captureVideo.srcObject = stream;
          
          captureModal.querySelector('#capture-btn')?.addEventListener('click', () => {
            const canvas = document.createElement('canvas');
            canvas.width = captureVideo.videoWidth;
            canvas.height = captureVideo.videoHeight;
            canvas.getContext('2d').drawImage(captureVideo, 0, 0);
            
            canvas.toBlob((blob) => {
              stream.getTracks().forEach(track => track.stop());
              captureModal.remove();
              handleOCRImage(blob, modal);
            });
          });
          
          captureModal.querySelector('#cancel-capture-btn')?.addEventListener('click', () => {
            stream.getTracks().forEach(track => track.stop());
            captureModal.remove();
          });
        })
        .catch(err => {
          console.error('Erreur caméra:', err);
          alert('Impossible d\'accéder à la caméra');
        });
    } else {
      alert('Votre navigateur ne supporte pas l\'accès à la caméra');
    }
  });
  
  async function handleOCRImage(file, modal) {
    // Afficher la prévisualisation
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
    
    // Masquer les résultats précédents
    results.style.display = 'none';
    loading.style.display = 'block';
    
    try {
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
      loading.style.display = 'none';
      
      if (data.items && data.items.length > 0) {
        // Afficher les items détectés
        detectedItems.innerHTML = data.items.map((item, index) => `
          <div style="padding: 0.75rem; margin-bottom: 0.5rem; background: #f8f9fa; border-radius: 6px; border-left: 3px solid #27ae60;">
            <strong>${item.name}</strong><br>
            <small>Quantité: ${item.quantity} ${item.unit} | Catégorie: ${item.category} ${item.price ? '| Prix: ' + item.price + '€' : ''}</small>
          </div>
        `).join('');
        
        // Stocker les items pour utilisation
        modal.ocrDetectedItems = data.items;
        useDataBtn.style.display = 'block';
        results.style.display = 'block';
      } else {
        detectedItems.innerHTML = '<p style="color: #e74c3c;">Aucun article détecté dans l\'image. Veuillez réessayer avec une image plus claire.</p>';
        results.style.display = 'block';
      }
    } catch (error) {
      console.error('Erreur OCR:', error);
      loading.style.display = 'none';
      detectedItems.innerHTML = `<p style="color: #e74c3c;">Erreur lors du traitement: ${error.message}</p>`;
      results.style.display = 'block';
    }
  }
  
  // Utiliser les données OCR
  useDataBtn?.addEventListener('click', () => {
    const modal = document.getElementById('add-stock-modal');
    if (modal.ocrDetectedItems && modal.ocrDetectedItems.length > 0) {
      // Basculer vers l'onglet manuel et préremplir avec le premier item
      const firstItem = modal.ocrDetectedItems[0];
      document.getElementById('tab-manual')?.click();
      document.getElementById('new-stock-name').value = firstItem.name || '';
      document.getElementById('new-stock-category').value = firstItem.category?.toLowerCase() || 'autres';
      document.getElementById('new-stock-quantity').value = firstItem.quantity || '';
      document.getElementById('new-stock-unit').value = firstItem.unit || 'g';
      if (firstItem.price) {
        document.getElementById('new-stock-price').value = firstItem.price;
      }
    }
  });
}

window.saveNewStockItem = async function() {
  const name = document.getElementById('new-stock-name')?.value.trim();
  const category = document.getElementById('new-stock-category')?.value;
  const quantity = parseFloat(document.getElementById('new-stock-quantity')?.value);
  const unit = document.getElementById('new-stock-unit')?.value;
  const priceInput = document.getElementById('new-stock-price')?.value;
  const price = priceInput ? parseFloat(priceInput) : null;
  const purchaseDate = document.getElementById('new-stock-purchase-date')?.value;
  const store = document.getElementById('new-stock-store')?.value.trim();
  const expirationDate = document.getElementById('new-stock-expiration')?.value;
  const alertThreshold = parseFloat(document.getElementById('new-stock-alert')?.value) || 0;

  if (!name || !category || isNaN(quantity) || quantity < 0 || !unit || !purchaseDate || !store || !priceInput || isNaN(price) || price < 0) {
    alert('Veuillez remplir tous les champs obligatoires (nom, catégorie, quantité, unité, date d\'achat, magasin, prix)');
    return;
  }

  try {
    // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

    const response = await fetchFn('/api/stock', {
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
        price: price,
        purchaseDate: purchaseDate || null,
        store: store || null,
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
        <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">Prix d'achat (€) (optionnel)</label>
        <input type="number" id="edit-stock-price" value="${item.price !== undefined && item.price !== null ? item.price : ''}" min="0" step="0.01" placeholder="0.00" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; box-sizing: border-box;">
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
  const price = parseFloat(document.getElementById('edit-stock-price').value) || null;
  const expirationDate = document.getElementById('edit-stock-expiration').value;
  const alertThresholdInput = document.getElementById('edit-stock-alert').value;
  const alertThreshold = alertThresholdInput && alertThresholdInput.trim() !== '' 
    ? parseFloat(alertThresholdInput) 
    : 0;

  if (!name || !category || isNaN(quantity) || quantity < 0 || !unit) {
    alert('Veuillez remplir tous les champs obligatoires (nom, catégorie, quantité, unité)');
    return;
  }

  console.log('💾 Modification article - alertThreshold:', alertThreshold, '| Type:', typeof alertThreshold);

  try {
    // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

    const response = await fetchFn(`/api/stock/${itemId}`, {
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
        price: price !== null && !isNaN(price) ? price : null,
        expirationDate: expirationDate || null,
        alertThreshold: isNaN(alertThreshold) ? 0 : alertThreshold
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Article modifié avec succès');
      console.log('📦 Données retournées:', result.data);
      console.log('📦 alertThreshold retourné:', result.data?.alertThreshold);
      window.closeEditStockModal();
      showToast('✅ Article modifié avec succès !', 'success');
      // Forcer le rechargement complet
      await loadStockData();
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
    // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

    const response = await fetchFn(`/api/stock/${itemId}`, {
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
      
      // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

      // Mettre à jour la quantité du premier article
      const updateResponse = await fetchFn(`/api/stock/${mainItem._id}`, {
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
        const deleteResponse = await fetchFn(`/api/stock/${itemToDelete._id}`, {
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

// Variable pour stocker les données originales (non filtrées)
let originalStockData = [];

export function filterStock() {
  const searchTerm = document.getElementById('stock-search')?.value.toLowerCase() || '';
  const categoryFilter = document.getElementById('stock-category-filter')?.value || '';
  
  console.log(`🔍 Filtrage - Terme de recherche: "${searchTerm}", Catégorie: "${categoryFilter}"`);
  console.log(`🔍 Total articles avant filtrage: ${stockData.length}`);
  
  // S'assurer que originalStockData est à jour
  if (originalStockData.length === 0 && stockData.length > 0) {
    originalStockData = [...stockData];
  }
  
  // Utiliser originalStockData si disponible, sinon stockData
  const sourceData = originalStockData.length > 0 ? originalStockData : stockData;
  
  const filteredData = sourceData.filter(item => {
    const itemName = typeof item.name === 'string' ? item.name : (item.name?.value || item.name?.name || '');
    const matchesSearch = !searchTerm || itemName.toLowerCase().includes(searchTerm);
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  console.log(`🔍 Articles après filtrage: ${filteredData.length}`);
  
  // Afficher avec les données filtrées
  renderStockTable(filteredData);
}

// ========== INITIALISATION ==========

export async function loadDemoStock() {
  try {
    console.log('📦 Chargement du stock de démonstration...');
    
    // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
      // 🍪 Token géré via cookie HTTP-Only (authentification automatique)
    
    // Afficher un loader
    showToast('⏳ Chargement de 83 ingrédients en cours...', 'info');
    
    // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

    const response = await fetchFn('/api/stock/seed', {
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
  
  // Retirer les anciens event listeners pour éviter les doublons
  if (addStockItemBtn) {
    const newBtn = addStockItemBtn.cloneNode(true);
    addStockItemBtn.parentNode.replaceChild(newBtn, addStockItemBtn);
    newBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🖱️ Clic sur "Ajouter un article" détecté');
      showAddStockModal();
    });
    console.log('✅ Listener "Ajouter un article" ajouté');
  } else {
    console.warn('⚠️ Bouton "add-stock-item-btn" non trouvé dans le DOM');
  }
  
  if (loadDemoStockBtn) {
    loadDemoStockBtn.addEventListener('click', loadDemoStock);
    console.log('✅ Listener "Charger stock de démonstration" ajouté');
  }
  
  if (refreshStockBtn) {
    refreshStockBtn.addEventListener('click', async () => {
      // Réinitialiser les filtres
      if (stockSearch) stockSearch.value = '';
      if (stockCategoryFilter) stockCategoryFilter.value = '';
      originalStockData = []; // Réinitialiser les données originales
      await loadStockData(); // Recharger les données
    });
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

// 🌐 Exposer les fonctions à window pour les autres scripts
window.loadStockData = loadStockData;

// Écouter l'événement de rafraîchissement du stock
if (typeof window !== 'undefined') {
  window.addEventListener('stockNeedsRefresh', () => {
    console.log('🔄 Événement stockNeedsRefresh reçu, rechargement du stock...');
    if (typeof window.loadStockData === 'function') {
      window.loadStockData().catch(err => {
        console.error('❌ Erreur lors du rechargement du stock:', err);
      });
    }
  });
}
window.showAddStockModal = showAddStockModal;
window.initStockTab = initStockTab;

// Initialiser automatiquement si le bouton existe au chargement
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const addStockItemBtn = document.getElementById('add-stock-item-btn');
    if (addStockItemBtn && !addStockItemBtn.hasAttribute('data-listener-added')) {
      addStockItemBtn.setAttribute('data-listener-added', 'true');
      addStockItemBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🖱️ Clic sur "Ajouter un article" (fallback)');
        showAddStockModal();
      });
      console.log('✅ Listener fallback "Ajouter un article" ajouté');
    }
  });
}
