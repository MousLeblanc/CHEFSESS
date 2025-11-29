// Food Cost Manager
class FoodCostManager {
  constructor() {
    this.currentPeriodId = null;
    this.periods = [];
    this.stats = null;
  }

  // Initialiser le gestionnaire de food cost
  async init() {
    await this.loadStats();
    await this.loadPeriods();
    this.setupEventListeners();
  }

  // Charger les statistiques globales
  async loadStats() {
    try {
      // Récupérer le siteId depuis sessionStorage pour l'envoyer au serveur
      const storedSiteId = sessionStorage.getItem('currentSiteId');
      // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
      const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
      const userSiteId = user?.siteId;
      const siteIdToSend = storedSiteId || userSiteId;
      
      // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
      const url = `/api/foodcost/stats/summary${siteIdToSend ? `?siteId=${siteIdToSend}` : ''}`;
      console.log('📤 Chargement des stats avec siteId:', siteIdToSend);
      
      const response = await fetch(url, {
        credentials: 'include', // 🍪 Cookie HTTP-Only
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques');

      // ✅ VALIDATION : Utiliser safeAPIParse pour une validation stricte
      let data;
      if (typeof safeAPIParse === 'function') {
        const parsed = await safeAPIParse(response, {
          required: ['data'],
          types: { data: 'object' }
        });
        if (!parsed.success) {
          throw new Error(parsed.error || 'Erreur lors du parsing de la réponse');
        }
        data = parsed.data;
      } else {
        data = await response.json();
      }
      this.stats = data.data;
      await this.displayStats();
    } catch (error) {
      console.error('Erreur loadStats:', error);
      this.showToast('Erreur lors du chargement des statistiques', 'error');
    }
  }

  // Calculer la valeur totale du stock
  async calculateStockValue() {
    try {
      const response = await fetch('/api/stock', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Erreur lors du chargement du stock pour calculer la valeur');
        return 0;
      }

      const result = await response.json();
      const stockItems = result.data || [];
      
      let totalValue = 0;
      
      stockItems.forEach(item => {
        // Calculer la valeur de chaque article (quantité × prix unitaire)
        if (item.price && item.quantity) {
          totalValue += parseFloat(item.price) * parseFloat(item.quantity);
        }
      });
      
      return totalValue;
    } catch (error) {
      console.error('Erreur lors du calcul de la valeur du stock:', error);
      return 0;
    }
  }

  // Afficher les statistiques
  async displayStats() {
    if (!this.stats) return;

    const statsContainer = document.getElementById('foodcost-stats');
    if (!statsContainer) return;

    const alertsCount = this.stats.alerts.critical + this.stats.alerts.high + this.stats.alerts.medium + this.stats.alerts.low;
    
    // Calculer la valeur totale du stock
    const stockValue = await this.calculateStockValue();
    
    statsContainer.innerHTML = `
      <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        
        <!-- Budget total -->
        <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-euro-sign" style="color: white; font-size: 1.5rem;"></i>
            </div>
            <div>
              <p style="color: #888; font-size: 0.85rem; margin: 0;">Budget Total</p>
              <p style="font-size: 1.8rem; font-weight: 700; margin: 0; color: #333;">${this.formatCurrency(this.stats.totals.budget)}</p>
            </div>
          </div>
        </div>

        <!-- Dépensé -->
        <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-shopping-cart" style="color: white; font-size: 1.5rem;"></i>
            </div>
            <div>
              <p style="color: #888; font-size: 0.85rem; margin: 0;">Dépensé</p>
              <p style="font-size: 1.8rem; font-weight: 700; margin: 0; color: #333;">${this.formatCurrency(this.stats.totals.spent)}</p>
            </div>
          </div>
        </div>

        <!-- Écart -->
        <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <div style="width: 48px; height: 48px; background: ${this.stats.totals.variance > 0 ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' : 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'}; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
              <i class="fas ${this.stats.totals.variance > 0 ? 'fa-arrow-up' : 'fa-arrow-down'}" style="color: white; font-size: 1.5rem;"></i>
            </div>
            <div>
              <p style="color: #888; font-size: 0.85rem; margin: 0;">Écart</p>
              <p style="font-size: 1.8rem; font-weight: 700; margin: 0; color: ${this.stats.totals.variance > 0 ? '#dc3545' : '#28a745'};">
                ${this.stats.totals.variance > 0 ? '+' : ''}${this.formatCurrency(this.stats.totals.variance)}
              </p>
            </div>
          </div>
        </div>

        <!-- Valeur du stock -->
        <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-boxes" style="color: white; font-size: 1.5rem;"></i>
            </div>
            <div>
              <p style="color: #888; font-size: 0.85rem; margin: 0;">Valeur du stock</p>
              <p style="font-size: 1.8rem; font-weight: 700; margin: 0; color: #333;">${this.formatCurrency(stockValue)}</p>
            </div>
          </div>
        </div>

        <!-- Alertes -->
        <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #fa8231 0%, #fcc21b 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; position: relative;">
              <i class="fas fa-bell" style="color: white; font-size: 1.5rem;"></i>
              ${alertsCount > 0 ? `<span style="position: absolute; top: -5px; right: -5px; background: #dc3545; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold;">${alertsCount}</span>` : ''}
            </div>
            <div>
              <p style="color: #888; font-size: 0.85rem; margin: 0;">Alertes</p>
              <p style="font-size: 1.8rem; font-weight: 700; margin: 0; color: #333;">${alertsCount}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertes détaillées -->
      ${alertsCount > 0 ? this.renderAlertsSummary() : ''}
    `;
  }

  // Afficher un résumé des alertes
  renderAlertsSummary() {
    const { critical, high, medium, low } = this.stats.alerts;
    
    return `
      <div class="alerts-summary" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 0.8rem 0; color: #856404;">
          <i class="fas fa-exclamation-triangle"></i> Alertes actives
        </h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          ${critical > 0 ? `<span style="background: #dc3545; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;"><i class="fas fa-times-circle"></i> ${critical} Critique${critical > 1 ? 's' : ''}</span>` : ''}
          ${high > 0 ? `<span style="background: #fd7e14; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;"><i class="fas fa-exclamation-circle"></i> ${high} Haute${high > 1 ? 's' : ''}</span>` : ''}
          ${medium > 0 ? `<span style="background: #ffc107; color: #333; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;"><i class="fas fa-exclamation-triangle"></i> ${medium} Moyenne${medium > 1 ? 's' : ''}</span>` : ''}
          ${low > 0 ? `<span style="background: #17a2b8; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.9rem;"><i class="fas fa-info-circle"></i> ${low} Faible${low > 1 ? 's' : ''}</span>` : ''}
        </div>
      </div>
    `;
  }

  // Charger les périodes de food cost
  async loadPeriods() {
    try {
      // Récupérer le siteId depuis sessionStorage pour l'envoyer au serveur
      const storedSiteId = sessionStorage.getItem('currentSiteId');
      // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
      const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
      const userSiteId = user?.siteId;
      const siteIdToSend = storedSiteId || userSiteId;
      
      // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
      const url = `/api/foodcost${siteIdToSend ? `?siteId=${siteIdToSend}` : ''}`;
      console.log('📤 Chargement des périodes avec siteId:', siteIdToSend);
      
      const response = await fetch(url, {
        credentials: 'include', // 🍪 Cookie HTTP-Only
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des périodes');

      const data = await response.json();
      this.periods = data.data;
      this.displayPeriods();
    } catch (error) {
      console.error('Erreur loadPeriods:', error);
      this.showToast('Erreur lors du chargement des périodes', 'error');
    }
  }

  // Afficher la liste des périodes
  displayPeriods() {
    const container = document.getElementById('foodcost-periods');
    if (!container) return;

    if (this.periods.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #888;">
          <i class="fas fa-calendar-times" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p>Aucune période de food cost créée</p>
          <button onclick="foodCostManager.showCreatePeriodModal()" class="btn btn-primary" style="margin-top: 1rem;">
            <i class="fas fa-plus"></i> Créer une première période
          </button>
        </div>
      `;
      return;
    }

    const periodsHtml = this.periods.map(period => {
      const startDate = new Date(period.startDate).toLocaleDateString('fr-FR');
      const endDate = new Date(period.endDate).toLocaleDateString('fr-FR');
      const statusColor = this.getStatusColor(period.analysis?.status || 'ok');
      const statusIcon = this.getStatusIcon(period.analysis?.status || 'ok');
      const variancePercentage = period.analysis?.variance?.percentage || 0;
      const unacknowledgedAlerts = period.analysis?.alerts?.filter(a => !a.acknowledged).length || 0;

      return `
        <div class="period-card" style="background: white; border-radius: 10px; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; transition: transform 0.2s; border-left: 4px solid ${statusColor};" onclick="foodCostManager.viewPeriodDetails('${period._id}')">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
            <div>
              <h3 style="margin: 0 0 0.5rem 0; color: #333;">
                <i class="fas ${statusIcon}" style="color: ${statusColor};"></i>
                ${this.getPeriodLabel(period.period)}
              </h3>
              <p style="color: #666; margin: 0; font-size: 0.9rem;">
                <i class="far fa-calendar"></i> ${startDate} - ${endDate}
              </p>
            </div>
            ${unacknowledgedAlerts > 0 ? `
              <span style="background: #dc3545; color: white; padding: 0.3rem 0.6rem; border-radius: 20px; font-size: 0.8rem;">
                <i class="fas fa-bell"></i> ${unacknowledgedAlerts}
              </span>
            ` : ''}
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1rem;">
            <div>
              <p style="color: #888; font-size: 0.8rem; margin: 0;">Budget</p>
              <p style="font-weight: 600; margin: 0; color: #333;">${this.formatCurrency(period.budget.planned)}</p>
            </div>
            <div>
              <p style="color: #888; font-size: 0.8rem; margin: 0;">Dépensé</p>
              <p style="font-weight: 600; margin: 0; color: #333;">${this.formatCurrency(period.expenses.total)}</p>
            </div>
            <div>
              <p style="color: #888; font-size: 0.8rem; margin: 0;">Écart</p>
              <p style="font-weight: 600; margin: 0; color: ${variancePercentage > 0 ? '#dc3545' : '#28a745'};">
                ${variancePercentage > 0 ? '+' : ''}${variancePercentage.toFixed(1)}%
              </p>
            </div>
          </div>

          ${period.analysis?.costPerMeal ? `
            <div style="border-top: 1px solid #eee; padding-top: 1rem; margin-top: 1rem;">
              <p style="color: #888; font-size: 0.85rem; margin: 0;">
                <i class="fas fa-utensils"></i> Coût par repas: <strong>${this.formatCurrency(period.analysis.costPerMeal)}</strong>
                ${period.analysis.costPerResident ? ` | <i class="fas fa-user"></i> Par résident/jour: <strong>${this.formatCurrency(period.analysis.costPerResident)}</strong>` : ''}
              </p>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = periodsHtml;
  }

  // Afficher le modal de création de période
  showCreatePeriodModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2><i class="fas fa-plus-circle"></i> Nouvelle période de Food Cost</h2>
          <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <div class="modal-body">
          <form id="create-period-form">
            <div style="margin-bottom: 1rem;">
              <label>Type de période *</label>
              <select id="period-type" required style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
                <option value="mois">Mois</option>
                <option value="semaine">Semaine</option>
                <option value="trimestre">Trimestre</option>
                <option value="annee">Année</option>
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label>Date de début *</label>
                <input type="date" id="period-start" required style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
              </div>
              <div>
                <label>Date de fin *</label>
                <input type="date" id="period-end" required style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
              </div>
            </div>

            <div style="margin-bottom: 1rem;">
              <label>Budget prévu (€) *</label>
              <input type="number" id="period-budget" step="0.01" min="0" required placeholder="Ex: 5000.00" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label>Budget par résident/jour (€)</label>
                <input type="number" id="period-budget-resident" step="0.01" min="0" placeholder="Ex: 7.50" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
              </div>
              <div>
                <label>Budget par repas (€)</label>
                <input type="number" id="period-budget-meal" step="0.01" min="0" placeholder="Ex: 2.50" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
              </div>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
              <button type="button" onclick="this.closest('.modal').remove()" class="btn btn-secondary">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-check"></i> Créer la période
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Gérer la soumission du formulaire
    document.getElementById('create-period-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.createPeriod(modal);
    });
  }

  // Créer une nouvelle période
  async createPeriod(modal) {
    try {
      // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
      
      // Récupérer le siteId depuis sessionStorage pour l'envoyer au serveur
      const storedSiteId = sessionStorage.getItem('currentSiteId');
      // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
      const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
      const userSiteId = user?.siteId;
      const siteIdToSend = storedSiteId || userSiteId;
      
      const formData = {
        period: document.getElementById('period-type').value,
        startDate: document.getElementById('period-start').value,
        endDate: document.getElementById('period-end').value,
        budget: {
          planned: parseFloat(document.getElementById('period-budget').value),
          perResident: document.getElementById('period-budget-resident').value ? parseFloat(document.getElementById('period-budget-resident').value) : undefined,
          perMeal: document.getElementById('period-budget-meal').value ? parseFloat(document.getElementById('period-budget-meal').value) : undefined
        }
      };
      
      if (siteIdToSend) {
        formData.siteId = siteIdToSend;
        console.log('📤 Envoi du siteId pour création de période:', siteIdToSend);
      }

      // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

      const response = await fetchFn(`/api/foodcost${siteIdToSend ? `?siteId=${siteIdToSend}` : ''}`, {
        credentials: 'include', // 🍪 Cookie HTTP-Only
        method: 'POST',
        headers: {
          // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création');
      }

      this.showToast('Période créée avec succès', 'success');
      modal.remove();
      await this.loadPeriods();
      await this.loadStats();
    } catch (error) {
      console.error('Erreur createPeriod:', error);
      this.showToast(error.message, 'error');
    }
  }

  // Voir les détails d'une période
  async viewPeriodDetails(periodId) {
    try {
      // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
      const response = await fetch(`/api/foodcost/${periodId}`, {
        credentials: 'include', // 🍪 Cookie HTTP-Only
        headers: {
          // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
}
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des détails');

      const data = await response.json();
      this.showPeriodDetailsModal(data.data);
    } catch (error) {
      console.error('Erreur viewPeriodDetails:', error);
      this.showToast('Erreur lors du chargement des détails', 'error');
    }
  }

  // Afficher le modal de détails d'une période
  showPeriodDetailsModal(period) {
    // Cette fonction sera étendue dans la suite pour afficher tous les détails, 
    // permettre l'ajout de dépenses manuelles, etc.
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h2>
            <i class="fas ${this.getStatusIcon(period.analysis?.status || 'ok')}" style="color: ${this.getStatusColor(period.analysis?.status || 'ok')};"></i>
            Détails - ${this.getPeriodLabel(period.period)}
          </h2>
          <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 2rem; font-weight: bold; color: #333; cursor: pointer; padding: 0; width: 2rem; height: 2rem; display: flex; align-items: center; justify-content: center;">&times;</button>
        </div>
        <div class="modal-body">
          <p><strong>Période:</strong> ${new Date(period.startDate).toLocaleDateString('fr-FR')} - ${new Date(period.endDate).toLocaleDateString('fr-FR')}</p>
          <p><strong>Budget prévu:</strong> ${this.formatCurrency(period.budget.planned)}</p>
          <p><strong>Dépenses totales:</strong> ${this.formatCurrency(period.expenses.total)}</p>
          <p><strong>Écart:</strong> <span style="color: ${period.analysis?.variance?.percentage > 0 ? '#dc3545' : '#28a745'};">${period.analysis?.variance?.percentage > 0 ? '+' : ''}${period.analysis?.variance?.percentage.toFixed(1)}%</span></p>
          
          <hr>
          
          <h3>Dépenses détaillées</h3>
          <p><strong>Commandes fournisseurs:</strong> ${this.formatCurrency(period.expenses.orders)}</p>
          <p><strong>Dépenses manuelles:</strong> ${this.formatCurrency(period.expenses.manual.reduce((sum, e) => sum + e.amount, 0))}</p>
          
          ${period.expenses.manual.length > 0 ? `
            <table style="width: 100%; margin-top: 1rem;">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Catégorie</th>
                  <th>Description</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                ${period.expenses.manual.map(expense => `
                  <tr>
                    <td>${new Date(expense.date).toLocaleDateString('fr-FR')}</td>
                    <td>${this.getCategoryLabel(expense.category)}</td>
                    <td>${expense.description || '-'}</td>
                    <td>${this.formatCurrency(expense.amount)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p style="color: #888; font-style: italic;">Aucune dépense manuelle</p>'}
          
          <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
            <button onclick="foodCostManager.showAddExpenseModal('${period._id}')" class="btn btn-primary">
              <i class="fas fa-plus"></i> Ajouter une dépense manuelle
            </button>
            <button onclick="foodCostManager.recalculateOrders('${period._id}')" class="btn" style="background: #17a2b8; color: white;">
              <i class="fas fa-sync"></i> Recalculer les commandes
            </button>
            <button onclick="foodCostManager.deletePeriod('${period._id}')" class="btn" style="background: #dc3545; color: white;">
              <i class="fas fa-trash"></i> Supprimer la période
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';
  }

  // Afficher le modal d'ajout de dépense manuelle
  showAddExpenseModal(periodId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h2><i class="fas fa-receipt"></i> Ajouter une dépense manuelle</h2>
          <button onclick="this.closest('.modal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <div class="modal-body">
          <form id="add-expense-form">
            <div style="margin-bottom: 1rem;">
              <label>Date *</label>
              <input type="date" id="expense-date" required style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
            </div>

            <div style="margin-bottom: 1rem;">
              <label>Catégorie *</label>
              <select id="expense-category" required style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
                <option value="">Sélectionner...</option>
                <option value="fruits_legumes">Fruits & Légumes</option>
                <option value="viandes_poissons">Viandes & Poissons</option>
                <option value="produits_laitiers">Produits Laitiers</option>
                <option value="epicerie">Épicerie</option>
                <option value="surgeles">Surgelés</option>
                <option value="boissons">Boissons</option>
                <option value="pain_patisserie">Pain & Pâtisserie</option>
                <option value="autres">Autres</option>
              </select>
            </div>

            <div style="margin-bottom: 1rem;">
              <label>Description</label>
              <input type="text" id="expense-description" placeholder="Ex: Achat marché local" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
            </div>

            <div style="margin-bottom: 1rem;">
              <label>Fournisseur</label>
              <input type="text" id="expense-supplier" placeholder="Ex: Maraîcher du coin" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
            </div>

            <div style="margin-bottom: 1rem;">
              <label>Montant (€) *</label>
              <input type="number" id="expense-amount" step="0.01" min="0.01" required placeholder="Ex: 125.50" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
            </div>

            <div style="margin-bottom: 1rem;">
              <label>Numéro de facture</label>
              <input type="text" id="expense-invoice" placeholder="Ex: FACT-2025-001" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
            </div>

            <div style="margin-bottom: 1rem;">
              <label>Notes</label>
              <textarea id="expense-notes" rows="3" placeholder="Notes additionnelles..." style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;"></textarea>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
              <button type="button" onclick="this.closest('.modal').remove()" class="btn btn-secondary">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-check"></i> Ajouter la dépense
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Gérer la soumission du formulaire
    document.getElementById('add-expense-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addExpense(periodId, modal);
    });
  }

  // Ajouter une dépense manuelle
  async addExpense(periodId, modal) {
    try {
      // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
      
      const formData = {
        date: document.getElementById('expense-date').value,
        category: document.getElementById('expense-category').value,
        description: document.getElementById('expense-description').value,
        supplier: document.getElementById('expense-supplier').value,
        amount: parseFloat(document.getElementById('expense-amount').value),
        invoiceNumber: document.getElementById('expense-invoice').value,
        notes: document.getElementById('expense-notes').value
      };

      // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

      const response = await fetchFn(`/api/foodcost/${periodId}/expense`, {
        credentials: 'include', // 🍪 Cookie HTTP-Only
        method: 'POST',
        headers: {
          // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\'ajout');
      }

      this.showToast('Dépense ajoutée avec succès', 'success');
      modal.remove();
      await this.loadPeriods();
      await this.loadStats();
      
      // Fermer le modal de détails s'il est ouvert et le rouvrir avec les nouvelles données
      const detailsModal = document.querySelectorAll('.modal');
      detailsModal.forEach(m => m.remove());
      await this.viewPeriodDetails(periodId);
    } catch (error) {
      console.error('Erreur addExpense:', error);
      this.showToast(error.message, 'error');
    }
  }

  // Recalculer les commandes d'une période
  async recalculateOrders(periodId) {
    try {
      // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
      
      // Confirmation
      if (!confirm('Recalculer les commandes fournisseurs pour cette période ?\n\nCela mettra à jour le total en utilisant le bon champ pricing.total.')) {
        return;
      }
      
      console.log('🔄 Début recalcul pour période:', periodId);
      
      // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

      const response = await fetchFn(`/api/foodcost/${periodId}/recalculate`, {
        credentials: 'include', // 🍪 Cookie HTTP-Only
        method: 'POST',
        headers: {
          // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur response:', errorText);
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || 'Erreur lors du recalcul';
        } catch (e) {
          errorMessage = errorText || 'Erreur lors du recalcul';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Données recalculées:', data);
      console.log('💰 Total des commandes:', data.data?.expenses?.orders || 0, '€');

      this.showToast(`✅ Recalcul terminé ! Total: ${(data.data?.expenses?.orders || 0).toFixed(2)}€`, 'success');
      
      // Fermer la modal actuelle
      const modals = document.querySelectorAll('.modal');
      modals.forEach(m => m.remove());
      
      // Recharger les données AVANT de rouvrir la modal
      console.log('🔄 Rechargement des périodes...');
      await this.loadPeriods();
      await this.loadStats();
      
      // Attendre un peu pour être sûr que les données sont à jour
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Rouvrir la modal avec les nouvelles données
      console.log('🔄 Réouverture de la modal...');
      await this.viewPeriodDetails(periodId);
    } catch (error) {
      console.error('Erreur recalculateOrders:', error);
      this.showToast(error.message, 'error');
    }
  }

  // Supprimer une période
  async deletePeriod(periodId) {
    try {
      // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
      
      // Confirmation
      if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette période ?\n\nCette action est irréversible !')) {
        return;
      }
      
      console.log('🗑️ Suppression de la période:', periodId);
      
      // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

      const response = await fetchFn(`/api/foodcost/${periodId}`, {
        credentials: 'include', // 🍪 Cookie HTTP-Only
        method: 'DELETE',
        headers: {
          // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur response:', errorText);
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || 'Erreur lors de la suppression';
        } catch (e) {
          errorMessage = errorText || 'Erreur lors de la suppression';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('✅ Période supprimée:', data);

      this.showToast('✅ Période supprimée avec succès', 'success');
      
      // Fermer toutes les modals
      const modals = document.querySelectorAll('.modal');
      modals.forEach(m => m.remove());
      
      // Recharger les données
      console.log('🔄 Rechargement des périodes et stats...');
      await this.loadPeriods();
      await this.loadStats();
    } catch (error) {
      console.error('Erreur deletePeriod:', error);
      this.showToast(error.message, 'error');
    }
  }

  // Configuration des écouteurs d'événements
  setupEventListeners() {
    const createBtn = document.getElementById('create-period-btn');
    if (createBtn) {
      createBtn.addEventListener('click', () => this.showCreatePeriodModal());
    }
  }

  // Utilitaires
  formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  }

  getStatusColor(status) {
    const colors = {
      'ok': '#28a745',
      'warning': '#ffc107',
      'alert': '#fd7e14',
      'critical': '#dc3545'
    };
    return colors[status] || colors.ok;
  }

  getStatusIcon(status) {
    const icons = {
      'ok': 'fa-check-circle',
      'warning': 'fa-exclamation-triangle',
      'alert': 'fa-exclamation-circle',
      'critical': 'fa-times-circle'
    };
    return icons[status] || icons.ok;
  }

  getPeriodLabel(period) {
    const labels = {
      'jour': 'Journée',
      'semaine': 'Semaine',
      'mois': 'Mois',
      'trimestre': 'Trimestre',
      'annee': 'Année'
    };
    return labels[period] || period;
  }

  getCategoryLabel(category) {
    const labels = {
      'fruits_legumes': 'Fruits & Légumes',
      'viandes_poissons': 'Viandes & Poissons',
      'produits_laitiers': 'Produits Laitiers',
      'epicerie': 'Épicerie',
      'surgeles': 'Surgelés',
      'boissons': 'Boissons',
      'pain_patisserie': 'Pain & Pâtisserie',
      'autres': 'Autres'
    };
    return labels[category] || category;
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialiser le gestionnaire au chargement de la page
let foodCostManager;

function initFoodCostManager() {
  if (!foodCostManager && (document.getElementById('foodcost-stats') || document.getElementById('foodcost-periods'))) {
    foodCostManager = new FoodCostManager();
    foodCostManager.init();
    // Exposer globalement pour les onclick
    window.foodCostManager = foodCostManager;
  }
  return foodCostManager;
}

// Initialiser automatiquement si le DOM est déjà chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initFoodCostManager();
  });
} else {
  // DOM déjà chargé, initialiser immédiatement
  initFoodCostManager();
}

