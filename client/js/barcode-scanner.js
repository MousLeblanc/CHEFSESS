// client/js/barcode-scanner.js
// Module de scan de code-barres pour le formulaire de réception

let barcodeScannerActive = false;
let barcodeStream = null;

/**
 * Initialise le scanner de code-barres
 */
async function initBarcodeScanner() {
  const container = document.getElementById('barcode-scanner-container');
  const video = document.getElementById('barcode-video');
  const resultDiv = document.getElementById('barcode-result');
  
  if (barcodeScannerActive) {
    stopBarcodeScanner();
    return;
  }
  
  // Afficher le conteneur
  container.style.display = 'block';
  resultDiv.style.display = 'none';
  
  try {
    // Demander l'accès à la caméra
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Caméra arrière sur mobile
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    
    barcodeStream = stream;
    video.srcObject = stream;
    barcodeScannerActive = true;
    
    // Utiliser QuaggaJS pour la détection de code-barres
    if (typeof Quagga !== 'undefined') {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: video,
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          }
        },
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "code_128_reader",
            "code_39_reader",
            "upc_reader",
            "upc_e_reader"
          ]
        },
        locate: true
      }, (err) => {
        if (err) {
          console.error('Erreur initialisation Quagga:', err);
          // Fallback: utiliser une méthode alternative
          startManualBarcodeDetection();
          return;
        }
        
        Quagga.start();
        console.log('✅ Scanner de code-barres démarré');
      });
      
      Quagga.onDetected((data) => {
        const code = data.codeResult.code;
        console.log('📷 Code-barres détecté:', code);
        handleBarcodeDetected(code);
      });
    } else {
      // Fallback si Quagga n'est pas disponible
      startManualBarcodeDetection();
    }
    
  } catch (error) {
    console.error('Erreur accès caméra:', error);
    alert('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès ou saisir le code-barres manuellement.');
    container.style.display = 'none';
  }
}

/**
 * Détection manuelle de code-barres (fallback)
 */
function startManualBarcodeDetection() {
  const video = document.getElementById('barcode-video');
  const canvas = document.getElementById('barcode-canvas');
  const ctx = canvas.getContext('2d');
  
  // Détection simple par analyse d'image (moins fiable)
  const detectInterval = setInterval(() => {
    if (!barcodeScannerActive) {
      clearInterval(detectInterval);
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    // Ici, on pourrait utiliser une bibliothèque de détection de code-barres
    // Pour l'instant, on laisse l'utilisateur saisir manuellement
  }, 500);
}

/**
 * Arrête le scanner de code-barres
 */
function stopBarcodeScanner() {
  barcodeScannerActive = false;
  
  // Arrêter Quagga si actif
  if (typeof Quagga !== 'undefined' && Quagga.initialized) {
    Quagga.stop();
  }
  
  // Arrêter le stream vidéo
  if (barcodeStream) {
    barcodeStream.getTracks().forEach(track => track.stop());
    barcodeStream = null;
  }
  
  const video = document.getElementById('barcode-video');
  if (video) {
    video.srcObject = null;
  }
  
  const container = document.getElementById('barcode-scanner-container');
  if (container) {
    container.style.display = 'none';
  }
}

/**
 * Gère la détection d'un code-barres
 */
async function handleBarcodeDetected(barcode) {
  console.log('🔍 Recherche produit pour code-barres:', barcode);
  
  // Arrêter le scanner
  stopBarcodeScanner();
  
  // Afficher un indicateur de chargement
  const resultDiv = document.getElementById('barcode-result');
  const productInfoDiv = document.getElementById('barcode-product-info');
  resultDiv.style.display = 'block';
  resultDiv.style.background = '#fff3cd';
  resultDiv.style.borderLeftColor = '#ffc107';
  productInfoDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recherche en cours...';
  
  try {
    // Appeler l'API pour récupérer les informations du produit
    const response = await fetch(`/api/barcode/${barcode}`, {
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success && data.data) {
      // Remplir automatiquement le formulaire avec les données
      fillFormWithBarcodeData(data.data);
      
      // Afficher les informations trouvées
      resultDiv.style.background = '#d5f4e6';
      resultDiv.style.borderLeftColor = '#27ae60';
      productInfoDiv.innerHTML = `
        <div><strong>${data.data.name || 'Produit trouvé'}</strong></div>
        ${data.data.brand ? `<div>Marque: ${data.data.brand}</div>` : ''}
        ${data.data.originCountries ? `<div>Origine: ${data.data.originCountries}</div>` : ''}
        ${data.data.qualityLabels.hasLabel ? `<div>Label: ${data.data.qualityLabels.labelType}</div>` : ''}
        <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #7f8c8d;">
          <i class="fas fa-check-circle"></i> Informations pré-remplies automatiquement
        </div>
      `;
    } else {
      // Produit non trouvé
      resultDiv.style.background = '#fadbd8';
      resultDiv.style.borderLeftColor = '#e74c3c';
      productInfoDiv.innerHTML = `
        <div><strong>❌ Produit non trouvé</strong></div>
        <div style="margin-top: 0.5rem; font-size: 0.85rem;">
          Le code-barres ${barcode} n'a pas été trouvé dans la base de données Open Food Facts.
          <br>Vous pouvez remplir les informations manuellement.
        </div>
      `;
      
      // Remplir au moins le numéro de référence
      document.getElementById('referenceNumber').value = barcode;
    }
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    resultDiv.style.background = '#fadbd8';
    resultDiv.style.borderLeftColor = '#e74c3c';
    productInfoDiv.innerHTML = `
      <div><strong>❌ Erreur</strong></div>
      <div style="margin-top: 0.5rem; font-size: 0.85rem;">
        Erreur lors de la recherche: ${error.message}
      </div>
    `;
  }
}

/**
 * Remplit le formulaire avec les données du code-barres
 */
function fillFormWithBarcodeData(productData) {
  // Nom du produit
  if (productData.name) {
    document.getElementById('productName').value = productData.name;
  }
  
  // Numéro de référence (code-barres)
  if (productData.barcode) {
    document.getElementById('referenceNumber').value = productData.barcode;
  }
  
  // Pays d'origine
  if (productData.originCountries) {
    const countries = productData.originCountries.split(',');
    document.getElementById('countryOfOrigin').value = countries[0].trim();
  } else if (productData.manufacturingPlaces) {
    document.getElementById('countryOfOrigin').value = productData.manufacturingPlaces.split(',')[0].trim();
  }
  
  // Source
  if (productData.manufacturingPlaces) {
    document.getElementById('source').value = productData.manufacturingPlaces;
  } else if (productData.origins) {
    document.getElementById('source').value = productData.origins;
  }
  
  // Présentation commerciale
  if (productData.packaging) {
    const packaging = productData.packaging.toLowerCase();
    if (packaging.includes('surgelé') || packaging.includes('frozen')) {
      document.querySelector('input[name="commercialPresentation"][value="surgelé"]').checked = true;
    } else if (packaging.includes('réfrigéré') || packaging.includes('refrigerated')) {
      document.querySelector('input[name="commercialPresentation"][value="réfrigéré"]').checked = true;
    } else if (packaging.includes('conserve') || packaging.includes('canned')) {
      document.querySelector('input[name="commercialPresentation"][value="conserve"]').checked = true;
    }
  }
  
  // Label qualité
  if (productData.qualityLabels && productData.qualityLabels.hasLabel) {
    document.querySelector('input[name="hasQualityLabel"][value="true"]').checked = true;
    if (productData.qualityLabels.labelType) {
      const labelRadio = document.querySelector(`input[name="labelType"][value="${productData.qualityLabels.labelType}"]`);
      if (labelRadio) {
        labelRadio.checked = true;
      }
    }
  }
  
  // Catégorie
  if (productData.categories) {
    const firstCategory = productData.categories.split(',')[0].trim();
    document.getElementById('category').value = firstCategory;
  }
  
  // Traçabilité totale
  if (productData.origins || productData.manufacturingPlaces) {
    document.querySelector('input[name="totalTraceability"][value="true"]').checked = true;
  }
  
  // Date limite de consommation
  if (productData.expirationDate) {
    try {
      const expDate = new Date(productData.expirationDate);
      document.getElementById('useByDate').value = expDate.toISOString().split('T')[0];
    } catch (e) {
      console.warn('Date d\'expiration invalide:', productData.expirationDate);
    }
  }
  
  console.log('✅ Formulaire pré-rempli avec les données du code-barres');
}

/**
 * Efface le résultat du scan
 */
function clearBarcodeResult() {
  const resultDiv = document.getElementById('barcode-result');
  if (resultDiv) {
    resultDiv.style.display = 'none';
  }
}

// Permettre la saisie manuelle du code-barres
document.addEventListener('DOMContentLoaded', () => {
  const referenceInput = document.getElementById('referenceNumber');
  if (referenceInput) {
    // Détecter quand l'utilisateur entre un code-barres manuellement
    let searchTimeout;
    referenceInput.addEventListener('input', (e) => {
      const barcode = e.target.value.trim();
      
      // Si c'est un code-barres valide (8+ caractères numériques)
      if (barcode.length >= 8 && /^\d+$/.test(barcode)) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          // Rechercher automatiquement après 1 seconde d'inactivité
          handleBarcodeDetected(barcode);
        }, 1000);
      }
    });
  }
});

