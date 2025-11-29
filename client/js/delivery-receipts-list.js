// client/js/delivery-receipts-list.js
// Gestion de la liste des formulaires de réception archivés

let receipts = [];
let stats = null;

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadStats();
    await loadReceipts();
    setupEventListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Charger les statistiques
async function loadStats() {
    try {
        const response = await fetch('/api/delivery-receipts/stats/summary', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                stats = data.data;
                displayStats();
            }
        }
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Afficher les statistiques
function displayStats() {
    if (!stats) return;
    
    const container = document.getElementById('statsContainer');
    container.innerHTML = `
        <div class="stat-card">
            <div class="stat-value">${stats.total}</div>
            <div class="stat-label">Total</div>
        </div>
        <div class="stat-card accepted">
            <div class="stat-value">${stats.accepted}</div>
            <div class="stat-label">Acceptés</div>
        </div>
        <div class="stat-card conditionally_accepted">
            <div class="stat-value">${stats.conditionallyAccepted}</div>
            <div class="stat-label">Acceptés sous réserve</div>
        </div>
        <div class="stat-card refused">
            <div class="stat-value">${stats.refused}</div>
            <div class="stat-label">Refusés</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${stats.archived}</div>
            <div class="stat-label">Archivés</div>
        </div>
    `;
}

// Charger les formulaires
async function loadReceipts() {
    try {
        const status = document.getElementById('statusFilter')?.value || '';
        const startDate = document.getElementById('startDate')?.value || '';
        const endDate = document.getElementById('endDate')?.value || '';
        const archived = document.getElementById('archivedFilter')?.value || '';
        
        let url = '/api/delivery-receipts?';
        const params = [];
        
        if (status) params.push(`status=${status}`);
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (archived) params.push(`archived=${archived}`);
        
        url += params.join('&');
        
        const response = await fetch(url, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des formulaires');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
            receipts = data.data;
            displayReceipts();
        } else {
            receipts = [];
            displayReceipts();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des formulaires:', error);
        document.getElementById('receiptsContainer').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erreur lors du chargement des formulaires</p>
            </div>
        `;
    }
}

// Afficher les formulaires
function displayReceipts() {
    const container = document.getElementById('receiptsContainer');
    
    if (receipts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Aucun formulaire trouvé</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="receipts-table">
            <thead>
                <tr>
                    <th>Date de livraison</th>
                    <th>Numéro de commande</th>
                    <th>Fournisseur</th>
                    <th>Produit</th>
                    <th>Statut</th>
                    <th>Contrôlé par</th>
                    <th>Archivé</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    receipts.forEach(receipt => {
        const deliveryDate = receipt.deliveryDate 
            ? new Date(receipt.deliveryDate).toLocaleDateString('fr-FR')
            : 'N/A';
        
        const orderNumber = receipt.orderNumber || receipt.order?.orderNumber || 'N/A';
        const supplierName = receipt.supplier?.name || receipt.supplier?.businessName || 'N/A';
        const productName = receipt.productIdentification?.name || 'N/A';
        const checkedBy = receipt.checkedBy?.name || receipt.checkedBy?.email || 'N/A';
        const archived = receipt.archived ? 'Oui' : 'Non';
        const archivedDate = receipt.archivedAt 
            ? new Date(receipt.archivedAt).toLocaleDateString('fr-FR')
            : '';
        
        const statusClass = receipt.acceptanceStatus || 'accepted';
        const statusLabels = {
            'accepted': 'Accepté',
            'conditionally_accepted': 'Accepté sous réserve',
            'refused': 'Refusé'
        };
        const statusLabel = statusLabels[statusClass] || statusClass;
        
        html += `
            <tr>
                <td>${deliveryDate}</td>
                <td>${orderNumber}</td>
                <td>${supplierName}</td>
                <td>${productName}</td>
                <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                <td>${checkedBy}</td>
                <td>${archived} ${archivedDate ? `(${archivedDate})` : ''}</td>
                <td>
                    <button class="action-btn view" onclick="viewReceipt('${receipt._id}')">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                    <button class="action-btn print" onclick="printReceipt('${receipt._id}')">
                        <i class="fas fa-print"></i> Imprimer
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = html;
}

// Appliquer les filtres
function applyFilters() {
    loadReceipts();
    loadStats();
}

// Voir un formulaire
function viewReceipt(receiptId) {
    window.location.href = `/delivery-receipt.html?id=${receiptId}`;
}

// Imprimer un formulaire
async function printReceipt(receiptId) {
    // Ouvrir le formulaire dans une nouvelle fenêtre pour l'impression
    window.open(`/delivery-receipt.html?id=${receiptId}&print=true`, '_blank');
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

