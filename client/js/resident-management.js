// client/JS/resident-management.js
class ResidentManager {
  constructor() {
    this.residents = [];
    this.selectedResidents = new Set();
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadResidents();
    this.loadStats();
  }

  bindEvents() {
    // Boutons d'action
    document.getElementById('add-resident-btn')?.addEventListener('click', () => this.showAddResidentModal());
    document.getElementById('refresh-residents-btn')?.addEventListener('click', () => this.loadResidents());
    document.getElementById('generate-menu-residents-btn')?.addEventListener('click', () => this.generateMenuForSelected());

    // Filtres
    document.getElementById('resident-search')?.addEventListener('input', (e) => this.filterResidents());
    document.getElementById('medical-filter')?.addEventListener('change', (e) => this.filterResidents());
    document.getElementById('texture-filter')?.addEventListener('change', (e) => this.filterResidents());
  }

  async loadResidents() {
    try {
      const response = await fetch('/api/residents', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des résidents');
      }

      const data = await response.json();
      this.residents = data.data || [];
      this.renderResidents();
    } catch (error) {
      console.error('Erreur:', error);
      this.showToast('Erreur lors du chargement des résidents', 'error');
    }
  }

  async loadStats() {
    try {
      const response = await fetch('/api/residents/stats', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      const data = await response.json();
      this.renderStats(data.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  }

  renderStats(stats) {
    const statsContainer = document.getElementById('resident-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
      <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; text-align: center;">
        <h3 style="margin: 0; color: #1976d2; font-size: 2rem;">${stats.totalResidents}</h3>
        <p style="margin: 0.5rem 0 0 0; color: #666;">Résidents actifs</p>
      </div>
      <div style="background: #f3e5f5; padding: 1rem; border-radius: 8px; text-align: center;">
        <h3 style="margin: 0; color: #7b1fa2; font-size: 2rem;">${stats.textureStats.length}</h3>
        <p style="margin: 0.5rem 0 0 0; color: #666;">Types de textures</p>
      </div>
      <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; text-align: center;">
        <h3 style="margin: 0; color: #388e3c; font-size: 2rem;">${stats.medicalStats.length}</h3>
        <p style="margin: 0.5rem 0 0 0; color: #666;">Conditions médicales</p>
      </div>
    `;
  }

  renderResidents() {
    const container = document.getElementById('residents-list');
    if (!container) return;

    if (this.residents.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #666;">
          <i class="fas fa-user-plus" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <h3>Aucun résident enregistré</h3>
          <p>Commencez par ajouter un résident pour gérer les profils médicaux.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.residents.map(resident => this.renderResidentCard(resident)).join('');
  }

  renderResidentCard(resident) {
    const age = this.calculateAge(resident.dateOfBirth);
    const medicalSummary = this.getMedicalSummary(resident.medicalProfile);
    const isSelected = this.selectedResidents.has(resident._id);

    return `
      <div class="resident-card" style="
        background: ${isSelected ? '#e8f5e8' : '#fff'};
        border: 2px solid ${isSelected ? '#4caf50' : '#e0e0e0'};
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        cursor: pointer;
      " onclick="residentManager.toggleResidentSelection('${resident._id}')">
        
        <div style="display: flex; justify-content: between; align-items: flex-start; margin-bottom: 1rem;">
          <div style="flex: 1;">
            <h3 style="margin: 0 0 0.5rem 0; color: #333; display: flex; align-items: center; gap: 0.5rem;">
              ${isSelected ? '<i class="fas fa-check-circle" style="color: #4caf50;"></i>' : '<i class="fas fa-circle" style="color: #ccc;"></i>'}
              ${resident.firstName} ${resident.lastName}
              ${resident.roomNumber ? `<span style="background: #e3f2fd; color: #1976d2; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin-left: 0.5rem;">Ch. ${resident.roomNumber}</span>` : ''}
            </h3>
            <p style="margin: 0; color: #666; font-size: 0.9rem;">${age} ans</p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button onclick="event.stopPropagation(); residentManager.editResident('${resident._id}')" 
                    style="background: #3498db; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="event.stopPropagation(); residentManager.deleteResident('${resident._id}')" 
                    style="background: #e74c3c; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.5rem 0; color: #495057; font-size: 0.9rem;">
            <i class="fas fa-stethoscope"></i> Profil médical
          </h4>
          <p style="margin: 0; color: #666; font-size: 0.85rem; line-height: 1.4;">
            ${medicalSummary || 'Aucune information médicale spécifique'}
          </p>
        </div>

        ${resident.emergencyContact ? `
          <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h4 style="margin: 0 0 0.5rem 0; color: #856404; font-size: 0.9rem;">
              <i class="fas fa-phone"></i> Contact d'urgence
            </h4>
            <p style="margin: 0; color: #856404; font-size: 0.85rem;">
              ${resident.emergencyContact.name} - ${resident.emergencyContact.phone}
            </p>
          </div>
        ` : ''}
      </div>
    `;
  }

  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  getMedicalSummary(medicalProfile) {
    const summary = [];
    
    if (medicalProfile.medical && medicalProfile.medical.length > 0) {
      summary.push(`Conditions: ${medicalProfile.medical.join(', ')}`);
    }
    
    if (medicalProfile.texture && medicalProfile.texture !== 'normale') {
      summary.push(`Texture: ${medicalProfile.texture}`);
    }
    
    if (medicalProfile.swallowing && medicalProfile.swallowing !== 'normale') {
      summary.push(`Déglutition: ${medicalProfile.swallowing}`);
    }
    
    if (medicalProfile.nutrition && medicalProfile.nutrition.length > 0) {
      summary.push(`Nutrition: ${medicalProfile.nutrition.join(', ')}`);
    }
    
    if (medicalProfile.ethical && medicalProfile.ethical.length > 0) {
      summary.push(`Éthique: ${medicalProfile.ethical.join(', ')}`);
    }
    
    if (medicalProfile.allergens && medicalProfile.allergens.length > 0) {
      summary.push(`Allergènes: ${medicalProfile.allergens.join(', ')}`);
    }
    
    return summary.join(' | ');
  }

  toggleResidentSelection(residentId) {
    if (this.selectedResidents.has(residentId)) {
      this.selectedResidents.delete(residentId);
    } else {
      this.selectedResidents.add(residentId);
    }
    this.renderResidents();
    this.updateGenerateButton();
  }

  updateGenerateButton() {
    const button = document.getElementById('generate-menu-residents-btn');
    if (button) {
      button.disabled = this.selectedResidents.size === 0;
      button.style.opacity = this.selectedResidents.size === 0 ? '0.5' : '1';
    }
  }

  filterResidents() {
    const searchTerm = document.getElementById('resident-search')?.value.toLowerCase() || '';
    const medicalFilter = document.getElementById('medical-filter')?.value || '';
    const textureFilter = document.getElementById('texture-filter')?.value || '';

    const filtered = this.residents.filter(resident => {
      const matchesSearch = !searchTerm || 
        resident.firstName.toLowerCase().includes(searchTerm) ||
        resident.lastName.toLowerCase().includes(searchTerm) ||
        (resident.roomNumber && resident.roomNumber.toLowerCase().includes(searchTerm));

      const matchesMedical = !medicalFilter || 
        (resident.medicalProfile.medical && resident.medicalProfile.medical.includes(medicalFilter));

      const matchesTexture = !textureFilter || 
        resident.medicalProfile.texture === textureFilter;

      return matchesSearch && matchesMedical && matchesTexture;
    });

    // Temporairement remplacer la liste pour le filtrage
    const originalResidents = this.residents;
    this.residents = filtered;
    this.renderResidents();
    this.residents = originalResidents;
  }

  showAddResidentModal() {
    // Créer et afficher le modal d'ajout de résident
    const modal = this.createResidentModal();
    document.body.appendChild(modal);
  }

  createResidentModal() {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.5); z-index: 1000; display: flex; 
      align-items: center; justify-content: center;
    `;

    modal.innerHTML = `
      <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin: 0 0 1.5rem 0; color: #4caf50;">
          <i class="fas fa-user-plus"></i> Ajouter un résident
        </h2>
        
        <form id="add-resident-form">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label>Prénom *</label>
              <input type="text" id="resident-firstname" required style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
            </div>
            <div>
              <label>Nom *</label>
              <input type="text" id="resident-lastname" required style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label>Date de naissance *</label>
              <input type="date" id="resident-birthdate" required style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
            </div>
            <div>
              <label>Genre *</label>
              <select id="resident-gender" required style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
                <option value="">Sélectionner...</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="autre">Autre</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 1rem;">
            <label>Numéro de chambre</label>
            <input type="text" id="resident-room" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
          </div>

          <div style="margin-bottom: 1rem;">
            <label>Conditions médicales</label>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; margin-top: 0.5rem;">
              <label><input type="checkbox" class="medical-condition" value="diabete_type2"> Diabète type 2</label>
              <label><input type="checkbox" class="medical-condition" value="hypertension"> Hypertension</label>
              <label><input type="checkbox" class="medical-condition" value="dysphagie"> Dysphagie</label>
              <label><input type="checkbox" class="medical-condition" value="alzheimer"> Alzheimer</label>
              <label><input type="checkbox" class="medical-condition" value="parkinson"> Parkinson</label>
              <label><input type="checkbox" class="medical-condition" value="denutrition"> Dénutrition</label>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label>Texture</label>
              <select id="resident-texture" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
                <option value="normale">Normale</option>
                <option value="hachée">Hachée</option>
                <option value="mixée">Mixée</option>
                <option value="iddsi_4">IDDSI 4</option>
                <option value="iddsi_5">IDDSI 5</option>
              </select>
            </div>
            <div>
              <label>Déglutition</label>
              <select id="resident-swallowing" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;">
                <option value="normale">Normale</option>
                <option value="epaisse_nectar">Épaisse nectar</option>
                <option value="epaisse_miel">Épaisse miel</option>
                <option value="epaisse_pudding">Épaisse pudding</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 1rem;">
            <label>Allergènes</label>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; margin-top: 0.5rem;">
              <label><input type="checkbox" class="allergen" value="gluten"> Gluten</label>
              <label><input type="checkbox" class="allergen" value="lactose"> Lactose</label>
              <label><input type="checkbox" class="allergen" value="oeufs"> Œufs</label>
              <label><input type="checkbox" class="allergen" value="arachides"> Arachides</label>
              <label><input type="checkbox" class="allergen" value="poisson"> Poisson</label>
              <label><input type="checkbox" class="allergen" value="soja"> Soja</label>
            </div>
          </div>

          <div style="margin-bottom: 1rem;">
            <label>Notes médicales</label>
            <textarea id="resident-notes" rows="3" style="width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; resize: vertical;"></textarea>
          </div>

          <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button type="button" onclick="this.closest('.modal').remove()" style="background: #6c757d; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer;">
              Annuler
            </button>
            <button type="submit" style="background: #4caf50; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer;">
              <i class="fas fa-save"></i> Enregistrer
            </button>
          </div>
        </form>
      </div>
    `;

    // Gérer la soumission du formulaire
    modal.querySelector('#add-resident-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveResident(modal);
    });

    // Fermer le modal en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    return modal;
  }

  async saveResident(modal) {
    try {
      // Récupérer les conditions médicales cochées
      const medicalConditions = Array.from(modal.querySelectorAll('.medical-condition:checked'))
        .map(cb => ({
          condition: cb.value,
          severity: 'modérée',
          notes: ''
        }));

      // Récupérer les allergènes cochés
      const allergies = Array.from(modal.querySelectorAll('.allergen:checked'))
        .map(cb => ({
          allergen: cb.value,
          severity: 'modérée',
          symptoms: [],
          notes: ''
        }));

      const formData = {
        firstName: document.getElementById('resident-firstname').value,
        lastName: document.getElementById('resident-lastname').value,
        dateOfBirth: document.getElementById('resident-birthdate').value,
        gender: document.getElementById('resident-gender').value,
        roomNumber: document.getElementById('resident-room').value,
        nutritionalProfile: {
          medicalConditions: medicalConditions,
          allergies: allergies,
          intolerances: [],
          dietaryRestrictions: [],
          texturePreferences: {
            consistency: document.getElementById('resident-texture').value,
            difficulty: 'aucune',
            notes: document.getElementById('resident-swallowing')?.value || ''
          },
          nutritionalNeeds: {},
          hydration: {},
          foodPreferences: {}
        },
        generalNotes: document.getElementById('resident-notes').value,
        status: 'actif'
      };

      console.log('Envoi des données:', formData);

      const response = await fetch('/api/residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur serveur:', errorData);
        throw new Error(errorData.message || 'Erreur lors de la création du résident');
      }

      const result = await response.json();
      console.log('Résident créé:', result);

      this.showToast('Résident créé avec succès', 'success');
      modal.remove();
      this.loadResidents();
      this.loadStats();
    } catch (error) {
      console.error('Erreur:', error);
      this.showToast(error.message || 'Erreur lors de la création du résident', 'error');
    }
  }

  async generateMenuForSelected() {
    if (this.selectedResidents.size === 0) {
      this.showToast('Veuillez sélectionner au moins un résident', 'warning');
      return;
    }

    try {
      const response = await fetch('/api/intelligent-menu/generate-for-residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          residentIds: Array.from(this.selectedResidents),
          numDishes: 2,
          menuStructure: 'entree_plat'
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du menu');
      }

      const data = await response.json();
      this.showMenuResults(data);
    } catch (error) {
      console.error('Erreur:', error);
      this.showToast('Erreur lors de la génération du menu', 'error');
    }
  }

  showMenuResults(data) {
    // Afficher les résultats du menu dans l'onglet Menus
    const menuResults = document.getElementById('menu-results');
    if (menuResults && data.success) {
      const menu = data.menu;
      const metadata = menu.metadata;
      
      menuResults.innerHTML = `
        <div style="background: #e8f5e8; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;">
          <h3 style="color: #4caf50; margin: 0 0 1rem 0;">
            <i class="fas fa-magic"></i> ${menu.title}
          </h3>
          <p style="margin: 0 0 1rem 0; color: #666;">
            ${menu.description}
          </p>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
            <div style="background: #fff; padding: 1rem; border-radius: 8px; text-align: center;">
              <h4 style="margin: 0; color: #4caf50; font-size: 1.5rem;">${metadata.totalPeople}</h4>
              <p style="margin: 0.5rem 0 0 0; color: #666;">Résidents</p>
            </div>
            <div style="background: #fff; padding: 1rem; border-radius: 8px; text-align: center;">
              <h4 style="margin: 0; color: #4caf50; font-size: 1.5rem;">${metadata.medicalGroups.length}</h4>
              <p style="margin: 0.5rem 0 0 0; color: #666;">Groupes médicaux</p>
            </div>
            <div style="background: #fff; padding: 1rem; border-radius: 8px; text-align: center;">
              <h4 style="margin: 0; color: #4caf50; font-size: 1.5rem;">${menu.mainMenu.dishes.length}</h4>
              <p style="margin: 0.5rem 0 0 0; color: #666;">Plats générés</p>
            </div>
          </div>

          <div style="background: #fff; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
            <h4 style="margin: 0 0 1rem 0; color: #333;">
              <i class="fas fa-utensils"></i> Menu principal
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
              ${menu.mainMenu.dishes.map(dish => `
                <div style="border: 1px solid #e0e0e0; padding: 1rem; border-radius: 8px;">
                  <h5 style="margin: 0 0 0.5rem 0; color: #4caf50;">${dish.title}</h5>
                  <p style="margin: 0; color: #666; font-size: 0.9rem;">${dish.description || 'Description non disponible'}</p>
                  <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #888;">
                    <span style="background: #e3f2fd; padding: 0.25rem 0.5rem; border-radius: 4px; margin-right: 0.5rem;">
                      ${dish.servings} portions
                    </span>
                    <span style="background: #f3e5f5; padding: 0.25rem 0.5rem; border-radius: 4px;">
                      ${dish.category || 'Non spécifié'}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          ${menu.variants && menu.variants.length > 0 ? `
            <div style="background: #fff; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <h4 style="margin: 0 0 1rem 0; color: #333;">
                <i class="fas fa-exchange-alt"></i> Variantes pour groupes spécifiques
              </h4>
              ${menu.variants.map(variant => `
                <div style="border: 1px solid #e0e0e0; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                  <h5 style="margin: 0 0 0.5rem 0; color: #9c27b0;">
                    ${variant.groupName} (${variant.count} résidents)
                  </h5>
                  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem;">
                    ${variant.dishes.map(dish => `
                      <div style="background: #f8f9fa; padding: 0.75rem; border-radius: 6px;">
                        <strong>${dish.title}</strong>
                        <p style="margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #666;">${dish.description || ''}</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div style="background: #fff; padding: 1rem; border-radius: 8px;">
            <h4 style="margin: 0 0 1rem 0; color: #333;">
              <i class="fas fa-shopping-cart"></i> Liste de courses
            </h4>
            <div style="max-height: 200px; overflow-y: auto;">
              ${menu.shoppingList.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;">
                  <span>${item.name}</span>
                  <span style="color: #4caf50; font-weight: 600;">${item.quantity} ${item.unit}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      menuResults.style.display = 'block';
    } else {
      menuResults.innerHTML = `
        <div style="background: #ffebee; padding: 1.5rem; border-radius: 8px; margin-top: 1rem; text-align: center;">
          <h3 style="color: #f44336; margin: 0 0 1rem 0;">
            <i class="fas fa-exclamation-triangle"></i> Erreur lors de la génération du menu
          </h3>
          <p style="margin: 0; color: #666;">
            ${data.message || 'Une erreur inattendue s\'est produite'}
          </p>
        </div>
      `;
      menuResults.style.display = 'block';
    }

    // Basculer vers l'onglet Menus
    const menuTab = document.querySelector('[data-tab="menus"]');
    if (menuTab) {
      menuTab.click();
    }
  }

  showToast(message, type = 'info') {
    // Créer une notification toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 1001;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
      color: white; padding: 1rem 1.5rem; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Initialiser le gestionnaire de résidents
let residentManager;
document.addEventListener('DOMContentLoaded', () => {
  residentManager = new ResidentManager();
});
