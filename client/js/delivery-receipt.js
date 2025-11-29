// client/js/delivery-receipt.js
// Gestion du formulaire de réception de marchandises

let currentOrderId = null;
let currentReceiptId = null;

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    setupEventListeners();
    setDefaultDate();
    
    // Charger les informations de l'utilisateur
    const user = getStoredUser();
    if (user) {
        document.getElementById('checkedBy').value = user.name || user.email || 'Utilisateur';
    }
    
    // Vérifier si on charge un formulaire existant ou une commande spécifique
    const urlParams = new URLSearchParams(window.location.search);
    const receiptId = urlParams.get('id');
    const orderId = urlParams.get('orderId');
    const printMode = urlParams.get('print');
    
    if (receiptId) {
        // Charger un formulaire existant
        await loadReceiptById(receiptId);
        if (printMode === 'true') {
            setTimeout(() => window.print(), 500);
        }
    } else if (orderId) {
        // Charger une commande spécifique pour créer un nouveau formulaire
        await loadOrders();
        // Sélectionner la commande dans le select
        const orderSelect = document.getElementById('orderSelect');
        if (orderSelect) {
            orderSelect.value = orderId;
            await loadOrderData();
        }
    } else {
        // Charger toutes les commandes disponibles
        await loadOrders();
    }
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Boutons de conformité
    document.querySelectorAll('.compliance-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const field = this.dataset.field;
            const value = this.dataset.value;
            const group = this.closest('.compliance-group');
            
            // Réinitialiser tous les boutons du groupe
            group.querySelectorAll('.compliance-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // Activer le bouton cliqué
            this.classList.add('active');
            
            // Stocker la valeur dans un champ caché
            let hiddenInput = document.querySelector(`input[name="${field.replace(/\./g, '_')}"]`);
            if (!hiddenInput) {
                hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = field.replace(/\./g, '_');
                document.getElementById('deliveryReceiptForm').appendChild(hiddenInput);
            }
            hiddenInput.value = value;
        });
    });
    
    // Cases d'acceptation
    document.querySelectorAll('.acceptance-box').forEach(box => {
        box.addEventListener('click', function() {
            document.querySelectorAll('.acceptance-box').forEach(b => {
                b.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Soumission du formulaire
    document.getElementById('deliveryReceiptForm').addEventListener('submit', handleSubmit);
    
    // Bouton de déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Définir la date par défaut (aujourd'hui)
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('deliveryDate').value = today;
    
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('deliveryTime').value = `${hours}:${minutes}`;
}

// Charger les commandes disponibles
async function loadOrders() {
    try {
        const response = await fetch('/api/orders?status=shipped,confirmed,preparing', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des commandes');
        }
        
        const data = await response.json();
        const select = document.getElementById('orderSelect');
        
        // Vider le select
        select.innerHTML = '<option value="">-- Sélectionner une commande --</option>';
        
        if (data.success && data.data && data.data.length > 0) {
            data.data.forEach(order => {
                const option = document.createElement('option');
                option.value = order._id;
                option.textContent = `${order.orderNumber} - ${order.supplier?.businessName || order.supplier?.name || 'Fournisseur'} - ${new Date(order.delivery?.requestedDate || order.createdAt).toLocaleDateString('fr-FR')}`;
                option.dataset.orderNumber = order.orderNumber;
                select.appendChild(option);
            });
        } else {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Aucune commande disponible';
            select.appendChild(option);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
        showAlert('Erreur lors du chargement des commandes', 'error');
    }
}

// Charger les données de la commande sélectionnée
async function loadOrderData() {
    const select = document.getElementById('orderSelect');
    const orderId = select.value;
    
    if (!orderId) {
        resetForm();
        return;
    }
    
    currentOrderId = orderId;
    
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement de la commande');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const order = data.data;
            
            // Remplir les informations du fournisseur
            if (order.supplier) {
                document.getElementById('supplierName').value = order.supplier.businessName || order.supplier.name || '';
                if (order.supplier.address) {
                    const address = [
                        order.supplier.address.street,
                        order.supplier.address.zipCode,
                        order.supplier.address.city
                    ].filter(Boolean).join(', ');
                    document.getElementById('supplierAddress').value = address;
                }
            }
            
            // Remplir le numéro de commande
            if (order.orderNumber) {
                // Le numéro de commande peut être affiché quelque part si nécessaire
            }
            
            // Remplir les informations des produits avec données de traçabilité
            if (order.items && order.items.length > 0) {
                // Pour l'instant, on prend le premier produit (on pourra étendre pour plusieurs produits)
                const firstItem = order.items[0];
                document.getElementById('productName').value = firstItem.productName || '';
                
                // Charger les détails complets du produit pour obtenir les informations de traçabilité
                if (firstItem.product) {
                    try {
                        const productResponse = await fetch(`/api/products/${firstItem.product}`, {
                            credentials: 'include'
                        });
                        
                        if (productResponse.ok) {
                            const productData = await productResponse.json();
                            if (productData.success && productData.data) {
                                const product = productData.data;
                                
                                // Pré-remplir avec les informations de traçabilité du produit
                                if (product.traceability) {
                                    const trace = product.traceability;
                                    if (trace.countryOfOrigin) {
                                        document.getElementById('countryOfOrigin').value = trace.countryOfOrigin;
                                    }
                                    if (trace.batchNumber) {
                                        document.getElementById('batchNumber').value = trace.batchNumber;
                                    }
                                    if (trace.healthStamp) {
                                        document.getElementById('healthStamp').value = trace.healthStamp;
                                    }
                                    if (trace.commercialPresentation) {
                                        const radio = document.querySelector(`input[name="commercialPresentation"][value="${trace.commercialPresentation}"]`);
                                        if (radio) radio.checked = true;
                                    }
                                    if (trace.qualityLabel && trace.qualityLabel.hasLabel) {
                                        document.querySelector('input[name="hasQualityLabel"][value="true"]').checked = true;
                                        if (trace.qualityLabel.labelType) {
                                            const labelRadio = document.querySelector(`input[name="labelType"][value="${trace.qualityLabel.labelType}"]`);
                                            if (labelRadio) labelRadio.checked = true;
                                        }
                                    }
                                    if (trace.category) {
                                        document.getElementById('category').value = trace.category;
                                    }
                                    if (trace.class) {
                                        const classRadio = document.querySelector(`input[name="class"][value="${trace.class}"]`);
                                        if (classRadio) classRadio.checked = true;
                                    }
                                    if (trace.productionDate) {
                                        document.getElementById('productionDate').value = new Date(trace.productionDate).toISOString().split('T')[0];
                                    }
                                    if (trace.useByDate) {
                                        document.getElementById('useByDate').value = new Date(trace.useByDate).toISOString().split('T')[0];
                                    }
                                    if (trace.bestBeforeDate) {
                                        document.getElementById('bestBeforeDate').value = new Date(trace.bestBeforeDate).toISOString().split('T')[0];
                                    }
                                }
                                
                                // Pré-remplir le numéro de référence avec l'ID du produit
                                document.getElementById('referenceNumber').value = product._id || '';
                            }
                        }
                    } catch (error) {
                        console.warn('Impossible de charger les détails du produit:', error);
                    }
                }
            }
            
            // Vérifier si un formulaire existe déjà pour cette commande
            await checkExistingReceipt(orderId);
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la commande:', error);
        showAlert('Erreur lors du chargement de la commande', 'error');
    }
}

// Vérifier si un formulaire existe déjà
async function checkExistingReceipt(orderId) {
    try {
        const response = await fetch(`/api/delivery-receipts?order=${orderId}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.length > 0) {
                const receipt = data.data[0];
                currentReceiptId = receipt._id;
                loadReceiptData(receipt);
                showAlert('Un formulaire existe déjà pour cette commande. Vous pouvez le modifier.', 'info');
            }
        }
    } catch (error) {
        console.error('Erreur lors de la vérification du formulaire existant:', error);
    }
}

// Charger un formulaire par son ID
async function loadReceiptById(receiptId) {
    try {
        const response = await fetch(`/api/delivery-receipts/${receiptId}`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Formulaire non trouvé');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const receipt = data.data;
            currentReceiptId = receipt._id;
            currentOrderId = receipt.order?._id || receipt.order;
            loadReceiptData(receipt);
            
            // Désactiver le select de commande si on est en mode visualisation
            const orderSelect = document.getElementById('orderSelect');
            if (orderSelect) {
                orderSelect.disabled = true;
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement du formulaire:', error);
        showAlert('Erreur lors du chargement du formulaire', 'error');
    }
}

// Charger les données d'un formulaire existant
function loadReceiptData(receipt) {
    // Date et heure
    if (receipt.deliveryDate) {
        document.getElementById('deliveryDate').value = new Date(receipt.deliveryDate).toISOString().split('T')[0];
    }
    if (receipt.deliveryTime) {
        document.getElementById('deliveryTime').value = receipt.deliveryTime;
    }
    
    // Identification du produit
    if (receipt.productIdentification) {
        const pi = receipt.productIdentification;
        if (pi.name) document.getElementById('productName').value = pi.name;
        if (pi.referenceNumber) document.getElementById('referenceNumber').value = pi.referenceNumber;
        if (pi.commercialPresentation) {
            document.querySelector(`input[name="commercialPresentation"][value="${pi.commercialPresentation}"]`).checked = true;
        }
        if (pi.source) document.getElementById('source').value = pi.source;
        if (pi.countryOfOrigin) document.getElementById('countryOfOrigin').value = pi.countryOfOrigin;
        if (pi.batchNumber) document.getElementById('batchNumber').value = pi.batchNumber;
        if (pi.healthStamp) document.getElementById('healthStamp').value = pi.healthStamp;
    }
    
    // Emballage
    if (receipt.packaging) {
        setComplianceValue('packaging.integrity', receipt.packaging.integrity);
        setComplianceValue('packaging.labellingCompliance', receipt.packaging.labellingCompliance);
    }
    
    // Transport
    if (receipt.transport) {
        setComplianceValue('transport.vehicleCleanliness', receipt.transport.vehicleCleanliness);
        setComplianceValue('transport.enclosureTemperature', receipt.transport.enclosureTemperature);
        setComplianceValue('transport.driverCleanliness', receipt.transport.driverCleanliness);
        setComplianceValue('transport.orderComparison', receipt.transport.orderComparison);
        if (receipt.transport.temperature) document.getElementById('transportTemperature').value = receipt.transport.temperature;
        if (receipt.transport.notes) document.getElementById('transportNotes').value = receipt.transport.notes;
    }
    
    // Examen organoleptique
    if (receipt.organolepticExamination) {
        const oe = receipt.organolepticExamination;
        setComplianceValue('organolepticExamination.appearance', oe.appearance);
        setComplianceValue('organolepticExamination.odour', oe.odour);
        setComplianceValue('organolepticExamination.colour', oe.colour);
        setComplianceValue('organolepticExamination.quality', oe.quality);
        if (oe.notes) document.getElementById('organolepticNotes').value = oe.notes;
    }
    
    // Statut d'acceptation
    if (receipt.acceptanceStatus) {
        const box = document.querySelector(`.acceptance-box[data-status="${receipt.acceptanceStatus}"]`);
        if (box) {
            box.classList.add('active');
        }
    }
    if (receipt.acceptanceNotes) {
        document.getElementById('acceptanceNotes').value = receipt.acceptanceNotes;
    }
    
    // Étiquetage
    if (receipt.productLabelling) {
        const pl = receipt.productLabelling;
        if (pl.totalTraceability !== undefined) {
            document.querySelector(`input[name="totalTraceability"][value="${pl.totalTraceability}"]`).checked = true;
        }
        if (pl.qualityLabel) {
            if (pl.qualityLabel.hasLabel !== undefined) {
                document.querySelector(`input[name="hasQualityLabel"][value="${pl.qualityLabel.hasLabel}"]`).checked = true;
            }
            if (pl.qualityLabel.labelType) {
                document.querySelector(`input[name="labelType"][value="${pl.qualityLabel.labelType}"]`).checked = true;
            }
        }
        if (pl.category) document.getElementById('category').value = pl.category;
        if (pl.class) document.querySelector(`input[name="class"][value="${pl.class}"]`).checked = true;
        if (pl.productionDate) document.getElementById('productionDate').value = new Date(pl.productionDate).toISOString().split('T')[0];
        if (pl.useByDate) document.getElementById('useByDate').value = new Date(pl.useByDate).toISOString().split('T')[0];
        if (pl.remainingShelfLife) document.getElementById('remainingShelfLife').value = pl.remainingShelfLife;
        if (pl.bestBeforeDate) document.getElementById('bestBeforeDate').value = new Date(pl.bestBeforeDate).toISOString().split('T')[0];
        if (pl.coreTemperature) document.getElementById('coreTemperature').value = pl.coreTemperature;
        if (pl.netWeightAtPacking) document.getElementById('netWeightAtPacking').value = pl.netWeightAtPacking;
        if (pl.numberOfPieces) document.getElementById('numberOfPieces').value = pl.numberOfPieces;
    }
    
    // Signature
    if (receipt.signature) {
        document.getElementById('signature').value = receipt.signature;
    }
}

// Définir une valeur de conformité
function setComplianceValue(field, value) {
    const btn = document.querySelector(`.compliance-btn[data-field="${field}"][data-value="${value}"]`);
    if (btn) {
        btn.click();
    }
}

// Gérer la soumission du formulaire
async function handleSubmit(e) {
    e.preventDefault();
    
    if (!currentOrderId) {
        showAlert('Veuillez sélectionner une commande', 'error');
        return;
    }
    
    const formData = new FormData(e.target);
    const orderSelect = document.getElementById('orderSelect');
    const orderNumber = orderSelect.options[orderSelect.selectedIndex]?.dataset.orderNumber || '';
    
    // Récupérer le statut d'acceptation
    const acceptanceBox = document.querySelector('.acceptance-box.active');
    const acceptanceStatus = acceptanceBox ? acceptanceBox.dataset.status : 'accepted';
    
    // Construire l'objet de données
    const receiptData = {
        orderId: currentOrderId,
        orderNumber: orderNumber,
        deliveryDate: formData.get('deliveryDate'),
        deliveryTime: formData.get('deliveryTime'),
        productIdentification: {
            name: formData.get('productName'),
            referenceNumber: formData.get('referenceNumber'),
            commercialPresentation: formData.get('commercialPresentation'),
            source: formData.get('source'),
            countryOfOrigin: formData.get('countryOfOrigin'),
            batchNumber: formData.get('batchNumber'),
            healthStamp: formData.get('healthStamp')
        },
        supplier: {
            name: formData.get('supplierName'),
            address: {
                street: formData.get('supplierAddress')
            },
            qualityStandards: formData.getAll('qualityStandards'),
            approvalNumber: formData.get('approvalNumber'),
            deliveryDriverName: formData.get('deliveryDriverName'),
            transportCompany: formData.get('transportCompany')
        },
        packaging: {
            integrity: formData.get('packaging_integrity') || 'conforme',
            labellingCompliance: formData.get('packaging_labellingCompliance') || 'conforme'
        },
        transport: {
            vehicleCleanliness: formData.get('transport_vehicleCleanliness') || 'conforme',
            enclosureTemperature: formData.get('transport_enclosureTemperature') || 'conforme',
            driverCleanliness: formData.get('transport_driverCleanliness') || 'conforme',
            orderComparison: formData.get('transport_orderComparison') || 'conforme',
            temperature: formData.get('transportTemperature') ? parseFloat(formData.get('transportTemperature')) : undefined,
            notes: formData.get('transportNotes')
        },
        organolepticExamination: {
            appearance: formData.get('organolepticExamination_appearance') || 'conforme',
            odour: formData.get('organolepticExamination_odour') || 'conforme',
            colour: formData.get('organolepticExamination_colour') || 'conforme',
            quality: formData.get('organolepticExamination_quality') || 'conforme',
            notes: formData.get('organolepticNotes')
        },
        acceptanceStatus: acceptanceStatus,
        acceptanceNotes: formData.get('acceptanceNotes'),
        productLabelling: {
            totalTraceability: formData.get('totalTraceability') === 'true',
            qualityLabel: {
                hasLabel: formData.get('hasQualityLabel') === 'true',
                labelType: formData.get('labelType') || ''
            },
            category: formData.get('category'),
            class: formData.get('class') || '',
            productionDate: formData.get('productionDate') || undefined,
            useByDate: formData.get('useByDate') || undefined,
            remainingShelfLife: formData.get('remainingShelfLife') ? parseInt(formData.get('remainingShelfLife')) : undefined,
            bestBeforeDate: formData.get('bestBeforeDate') || undefined,
            coreTemperature: formData.get('coreTemperature') ? parseFloat(formData.get('coreTemperature')) : undefined,
            netWeightAtPacking: formData.get('netWeightAtPacking') ? parseFloat(formData.get('netWeightAtPacking')) : undefined,
            numberOfPieces: formData.get('numberOfPieces') ? parseInt(formData.get('numberOfPieces')) : undefined
        },
        signature: formData.get('signature')
    };
    
    try {
        const url = currentReceiptId 
            ? `/api/delivery-receipts/${currentReceiptId}`
            : '/api/delivery-receipts';
        
        const method = currentReceiptId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(receiptData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showAlert('Formulaire enregistré et archivé avec succès !', 'success');
            currentReceiptId = data.data._id;
            
            // Réinitialiser le formulaire après 2 secondes
            setTimeout(() => {
                resetForm();
                loadOrders();
            }, 2000);
        } else {
            throw new Error(data.message || 'Erreur lors de l\'enregistrement');
        }
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        showAlert(error.message || 'Erreur lors de l\'enregistrement du formulaire', 'error');
    }
}

// Réinitialiser le formulaire
function resetForm() {
    document.getElementById('deliveryReceiptForm').reset();
    setDefaultDate();
    currentOrderId = null;
    currentReceiptId = null;
    
    // Réinitialiser les boutons de conformité
    document.querySelectorAll('.compliance-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Réinitialiser les cases d'acceptation
    document.querySelectorAll('.acceptance-box').forEach(box => {
        box.classList.remove('active');
    });
    
    // Réinitialiser le select
    document.getElementById('orderSelect').value = '';
}

// Afficher une alerte
function showAlert(message, type = 'info') {
    const container = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    container.innerHTML = '';
    container.appendChild(alert);
    
    // Supprimer l'alerte après 5 secondes
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// Charger les formulaires archivés
async function loadReceipts() {
    // Rediriger vers une page de liste des formulaires ou ouvrir un modal
    window.location.href = '/delivery-receipts-list.html';
}

// Fonction utilitaire pour obtenir l'utilisateur stocké
function getStoredUser() {
    try {
        const userStr = sessionStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        return null;
    }
}

// Gérer la déconnexion
async function handleLogout() {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            sessionStorage.clear();
            window.location.href = '/index.html';
        }
    } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        sessionStorage.clear();
        window.location.href = '/index.html';
    }
}

