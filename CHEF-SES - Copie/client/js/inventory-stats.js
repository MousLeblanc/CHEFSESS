// inventory-stats.js - Module pour afficher les statistiques d'inventaire

// Fonction pour charger les statistiques d'inventaire
async function loadInventoryStats() {
  // Récupérer les données de stock depuis localStorage
  const stockData = JSON.parse(localStorage.getItem('stock')) || [];
  
  // Calculer les statistiques
  const totalItems = stockData.length;
  let totalValue = 0;
  let lowStockItems = 0;
  
  stockData.forEach(item => {
    // Calculer la valeur
    const itemValue = (item.qte || item.quantity) * (item.cost || 1);
    totalValue += itemValue;
    
    // Vérifier si sous le seuil
    const threshold = item.seuilAlerte !== undefined ? item.seuilAlerte : (item.threshold || 5);
    if ((item.qte || item.quantity) <= threshold) {
      lowStockItems++;
    }
  });
  
  // Mettre à jour l'interface
  const statsContainer = document.getElementById('inventory-stats');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <h3>Statistiques d'Inventaire</h3>
      <div class="filter-section">
        <div>
          <h4>Valeur Totale de l'Inventaire</h4>
          <p class="stat">${totalValue.toFixed(2)} €</p>
        </div>
        <div>
          <h4>Nombre de Produits</h4>
          <p class="stat">${totalItems}</p>
        </div>
        <div>
          <h4>Produits Sous Seuil</h4>
          <p class="stat">${lowStockItems}</p>
        </div>
      </div>
    `;
  }
}

// Exporter la fonction pour l'utiliser dans d'autres fichiers
export { loadInventoryStats };

// Initialisation automatique si le conteneur existe
document.addEventListener('DOMContentLoaded', () => {
  const statsContainer = document.getElementById('inventory-stats');
  if (statsContainer) {
    loadInventoryStats();
  }
});