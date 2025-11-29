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
    this.loadAllResidentsForSummary();
  }

  async loadAllResidentsForSummary() {
    try {
      // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
      const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
      if (!user) return;
      const siteId = user?.siteId;
      if (!siteId || (typeof isValidObjectId === 'function' && !isValidObjectId(siteId))) return;

      // Charger uniquement les résidents ACTIFS du site
      const response = await fetch(`/api/residents/site/${siteId}?status=actif&limit=1000`, {
        credentials: 'include'
      });

      if (!response.ok) return;
      const data = await response.json();
      const allResidents = data?.data || [];
      
      // Filtrer encore côté client : ACTIFS + du BON siteId
      const siteIdStr = String(siteId);
      const activeResidents = allResidents.filter(r => {
        // Vérifier le statut
        const status = r.status ? String(r.status).toLowerCase().trim() : '';
        if (status !== 'actif') return false;
        
        // Vérifier que le résident appartient bien à ce site
        const residentSiteId = r.siteId ? (r.siteId._id ? String(r.siteId._id) : String(r.siteId)) : null;
        if (!residentSiteId || residentSiteId !== siteIdStr) {
          console.warn(`⚠️ Résident ${r.firstName} ${r.lastName} appartient au site ${residentSiteId} mais on cherche ${siteIdStr}`);
          return false;
        }
        
        return true;
      });
      
      console.log(`📊 Résidents chargés pour site ${siteIdStr}: ${allResidents.length} total retournés par API, ${activeResidents.length} actifs et du bon site`);
      
      this.displayResidentsSummary(activeResidents);
    } catch (error) {
      console.error('Erreur lors du chargement du résumé:', error);
    }
  }

  displayResidentsSummary(allResidents) {
    const summaryEl = document.getElementById('residents-summary');
    if (!summaryEl) return;
    
    // Filtrer uniquement les résidents ACTIFS (s'assurer que le statut est exactement "actif")
    const activeResidents = allResidents.filter(r => {
      const status = r.status ? String(r.status).toLowerCase().trim() : '';
      return status === 'actif';
    });
    
    if (activeResidents.length === 0) {
      summaryEl.style.display = 'none';
      return;
    }
    
    summaryEl.style.display = 'block';
    
    // 1. Total résidents ACTIFS uniquement
    document.getElementById('summary-total-residents').textContent = activeResidents.length;
    
    // 2. Calculer les portions équivalentes
    let totalPortions = 0;
    activeResidents.forEach(resident => {
      const ps = resident.portionSize;
      if (ps === 0.5) totalPortions += 0.5;
      else if (ps === 2) totalPortions += 1.5;
      else totalPortions += 1;
    });
    document.getElementById('summary-total-portions').textContent = Math.round(totalPortions * 100) / 100;
    
    // 3. Compter allergies et restrictions (avec normalisation pour éviter les doublons)
    const allergiesCount = {};
    const restrictionsCount = {};
    
    // Fonction pour normaliser le nom d'allergène
    const normalizeAllergen = (name) => {
      const normalized = String(name).toLowerCase().trim();
      // Normaliser les variantes
      const variants = {
        'oeufs': 'oeufs', 'oeuf': 'oeufs', 'eggs': 'oeufs',
        'arachides': 'arachides', 'peanuts': 'arachides',
        'fruits_a_coque': 'fruits_a_coque', 'nuts': 'fruits_a_coque', 'noix': 'fruits_a_coque',
        'soja': 'soja', 'soy': 'soja',
        'poisson': 'poisson', 'fish': 'poisson',
        'crustaces': 'crustaces', 'shellfish': 'crustaces',
        'mollusques': 'mollusques', 'molluscs': 'mollusques',
        'celeri': 'celeri', 'celery': 'celeri',
        'moutarde': 'moutarde', 'mustard': 'moutarde',
        'gluten': 'gluten',
        'lactose': 'lactose',
        'sesame': 'sesame',
        'sulfites': 'sulfites',
        'lupin': 'lupin'
      };
      return variants[normalized] || normalized;
    };
    
    activeResidents.forEach(resident => {
      // Utiliser un Set pour éviter de compter deux fois le même résident pour le même allergène
      const residentAllergens = new Set();
      
      if (resident.nutritionalProfile?.allergies?.length > 0) {
        resident.nutritionalProfile.allergies.forEach(allergy => {
          const allergen = allergy.allergen || allergy;
          const normalized = normalizeAllergen(allergen);
          residentAllergens.add(normalized);
        });
      }
      if (resident.nutritionalProfile?.intolerances?.length > 0) {
        resident.nutritionalProfile.intolerances.forEach(intolerance => {
          const substance = intolerance.substance || intolerance;
          const normalized = normalizeAllergen(substance);
          residentAllergens.add(normalized);
        });
      }
      
      // Compter chaque allergène une seule fois par résident
      residentAllergens.forEach(allergen => {
        allergiesCount[allergen] = (allergiesCount[allergen] || 0) + 1;
      });
      
      if (resident.nutritionalProfile?.dietaryRestrictions?.length > 0) {
        resident.nutritionalProfile.dietaryRestrictions.forEach(restriction => {
          const rn = restriction.restriction || restriction.type || restriction;
          const normalized = String(rn).toLowerCase().trim();
          restrictionsCount[normalized] = (restrictionsCount[normalized] || 0) + 1;
        });
      }
    });
    
    const container = document.getElementById('summary-allergies-restrictions');
    // ✅ SÉCURITÉ : Vider le conteneur de manière sécurisée
    container.textContent = '';
    
    // ✅ SÉCURITÉ : Fonction helper pour créer un élément d'allergie/restriction de manière sécurisée
    const createAllergyRestrictionItem = (name, count, iconClass, iconColor) => {
      const itemDiv = document.createElement('div');
      itemDiv.style.cssText = 'background: rgba(255,255,255,0.3); padding: 0.75rem 1rem; border-radius: 8px; backdrop-filter: blur(10px); display: flex; justify-content: space-between; align-items: center; color: #ffffff;';
      
      // Conteneur pour le nom avec icône
      const nameSpan = document.createElement('span');
      nameSpan.style.cssText = 'font-weight: 500; font-size: 0.9rem; color: #ffffff; display: flex; align-items: center;';
      
      // Icône (sécurisée : classe FontAwesome hardcodée)
      const icon = document.createElement('i');
      icon.className = iconClass;
      icon.style.cssText = `margin-right: 0.5rem; color: ${iconColor};`;
      nameSpan.appendChild(icon);
      
      // Nom (sécurisé : utilisation de textContent)
      const nameText = document.createTextNode(name);
      nameSpan.appendChild(nameText);
      
      // Conteneur pour le count
      const countSpan = document.createElement('span');
      countSpan.style.cssText = 'background: rgba(255,255,255,0.45); padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: 700; font-size: 0.85rem; color: #ffffff;';
      // Sécurisé : count est un nombre, converti en string avec textContent
      countSpan.textContent = String(count);
      
      itemDiv.appendChild(nameSpan);
      itemDiv.appendChild(countSpan);
      return itemDiv;
    };
    
    // Créer les éléments pour les allergies
    const allergiesEntries = Object.entries(allergiesCount).sort((a, b) => b[1] - a[1]);
    allergiesEntries.forEach(([allergen, count]) => {
      // Sécurisé : formatAllergenName retourne une string, utilisée avec textContent
      const formattedName = this.formatAllergenName(allergen);
      const item = createAllergyRestrictionItem(
        formattedName,
        count,
        'fas fa-exclamation-triangle',
        '#ffc107'
      );
      container.appendChild(item);
    });
    
    // Créer les éléments pour les restrictions
    const restrictionsEntries = Object.entries(restrictionsCount).sort((a, b) => b[1] - a[1]);
    restrictionsEntries.forEach(([restriction, count]) => {
      // Sécurisé : formatRestrictionName retourne une string, utilisée avec textContent
      const formattedName = this.formatRestrictionName(restriction);
      const item = createAllergyRestrictionItem(
        formattedName,
        count,
        'fas fa-ban',
        '#e74c3c'
      );
      container.appendChild(item);
    });
    
    // Message si aucune allergie ou restriction
    if (allergiesEntries.length === 0 && restrictionsEntries.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.style.cssText = 'grid-column: 1/-1; text-align: center; opacity: 1; padding: 1rem; color: #ffffff;';
      emptyDiv.textContent = 'Aucune allergie ou restriction enregistrée';
      container.appendChild(emptyDiv);
    }
  }

  formatAllergenName(allergen) {
    const names = {'gluten': 'Gluten', 'lactose': 'Lactose', 'oeufs': 'Œufs', 'oeuf': 'Œufs', 'eggs': 'Œufs',
      'arachides': 'Arachides', 'peanuts': 'Arachides', 'fruits_a_coque': 'Fruits à coque', 'nuts': 'Fruits à coque',
      'noix': 'Fruits à coque', 'soja': 'Soja', 'soy': 'Soja', 'poisson': 'Poisson', 'fish': 'Poisson',
      'crustaces': 'Crustacés', 'shellfish': 'Crustacés', 'mollusques': 'Mollusques', 'molluscs': 'Mollusques',
      'celeri': 'Céleri', 'celery': 'Céleri', 'moutarde': 'Moutarde', 'mustard': 'Moutarde',
      'sesame': 'Sésame', 'sulfites': 'Sulfites', 'lupin': 'Lupin'};
    return names[allergen.toLowerCase()] || allergen.charAt(0).toUpperCase() + allergen.slice(1);
  }

  formatRestrictionName(restriction) {
    const names = {'vegetarien': 'Végétarien', 'vegan': 'Végan', 'sans_gluten': 'Sans gluten',
      'gluten_free': 'Sans gluten', 'sans_lactose': 'Sans lactose', 'lactose_free': 'Sans lactose',
      'halal': 'Halal', 'casher': 'Casher', 'kosher': 'Casher', 'sans_porc': 'Sans porc', 'no_pork': 'Sans porc',
      'sans_viande_rouge': 'Sans viande rouge', 'no_red_meat': 'Sans viande rouge', 'sans_sel': 'Sans sel',
      'salt_free': 'Sans sel', 'hyposode': 'Hyposodé', 'pauvre_en_sucre': 'Pauvre en sucre', 'low_sugar': 'Pauvre en sucre',
      'sans_sucre': 'Sans sucre', 'diabetique': 'Diabétique', 'diabetic': 'Diabétique'};
    return names[restriction.toLowerCase()] || restriction.charAt(0).toUpperCase() + restriction.slice(1);
  }

  bindEvents() {
    // Boutons d'action
    document.getElementById('add-resident-btn')?.addEventListener('click', () => this.showAddResidentModal());
    document.getElementById('refresh-residents-btn')?.addEventListener('click', async () => {
      await this.loadResidents();
      await this.loadAllResidentsForSummary();
    });
    document.getElementById('generate-menu-residents-btn')?.addEventListener('click', () => this.generateMenuForSelected());

    // Filtres
    document.getElementById('resident-search')?.addEventListener('input', (e) => this.filterResidents());
    document.getElementById('medical-filter')?.addEventListener('change', (e) => this.filterResidents());
    document.getElementById('texture-filter')?.addEventListener('change', (e) => this.filterResidents());
  }

  async loadResidents() {
    try {
      // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
      const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
      if (!user) {
        this.showToast('Erreur: Utilisateur non connecté', 'error');
        return;
      }
      const siteId = user?.siteId;
      if (!siteId || (typeof isValidObjectId === 'function' && !isValidObjectId(siteId))) {
        this.showToast('Erreur: Site ID invalide', 'error');
        return;
      }
      
      if (!siteId) {
        this.showToast('Erreur: Site ID manquant', 'error');
        return;
      }

      // Charger TOUS les résidents actifs du site (limit élevé pour être sûr)
      const response = await fetch(`/api/residents/site/${siteId}?status=actif&limit=1000`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des résidents');
      }

      const data = await response.json();
      const allResidents = data.data || [];
      
      // Filtrer côté client pour être absolument sûr
      const siteIdStr = String(siteId);
      this.residents = allResidents.filter(r => {
        const status = r.status ? String(r.status).toLowerCase().trim() : '';
        if (status !== 'actif') return false;
        
        // Vérifier que le résident appartient bien à ce site
        const residentSiteId = r.siteId ? (r.siteId._id ? String(r.siteId._id) : String(r.siteId)) : null;
        if (!residentSiteId || residentSiteId !== siteIdStr) return false;
        
        return true;
      });
      
      console.log(`📊 loadResidents - Chargés: ${allResidents.length} retournés par API, ${this.residents.length} affichés`);
      
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

    // ✅ SÉCURITÉ : Vider le conteneur de manière sécurisée
    statsContainer.textContent = '';

    // Créer les cartes de statistiques de manière sécurisée
    const createStatCard = (value, label, bgColor, textColor) => {
      const card = document.createElement('div');
      card.style.cssText = `background: ${bgColor}; padding: 1rem; border-radius: 8px; text-align: center;`;
      
      const h3 = document.createElement('h3');
      h3.style.cssText = `margin: 0; color: ${textColor}; font-size: 2rem;`;
      h3.textContent = String(value);
      
      const p = document.createElement('p');
      p.style.cssText = 'margin: 0.5rem 0 0 0; color: #666;';
      p.textContent = label;
      
      card.appendChild(h3);
      card.appendChild(p);
      return card;
    };

    statsContainer.appendChild(createStatCard(stats.totalResidents, 'Résidents actifs', '#e3f2fd', '#1976d2'));
    statsContainer.appendChild(createStatCard(stats.textureStats.length, 'Types de textures', '#f3e5f5', '#7b1fa2'));
    statsContainer.appendChild(createStatCard(stats.medicalStats.length, 'Conditions médicales', '#e8f5e8', '#388e3c'));
  }

  renderResidents() {
    const container = document.getElementById('residents-list');
    if (!container) return;

    // ✅ SÉCURITÉ : Vider le conteneur de manière sécurisée
    container.textContent = '';

    if (this.residents.length === 0) {
      // ✅ SÉCURITÉ : Créer le message vide de manière sécurisée
      const emptyDiv = document.createElement('div');
      emptyDiv.style.cssText = 'text-align: center; padding: 3rem; color: #666;';
      
      const icon = document.createElement('i');
      icon.className = 'fas fa-user-plus';
      icon.style.cssText = 'font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;';
      emptyDiv.appendChild(icon);
      
      const h3 = document.createElement('h3');
      h3.textContent = 'Aucun résident enregistré';
      emptyDiv.appendChild(h3);
      
      const p = document.createElement('p');
      p.textContent = 'Commencez par ajouter un résident pour gérer les profils médicaux.';
      emptyDiv.appendChild(p);
      
      container.appendChild(emptyDiv);
      return;
    }

    // ✅ SÉCURITÉ : Créer la grille de manière sécurisée
    const gridDiv = document.createElement('div');
    gridDiv.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem;';
    
    // Créer les cartes de résidents de manière sécurisée
    this.residents.forEach(resident => {
      const cardElement = this.createResidentCardElement(resident);
      gridDiv.appendChild(cardElement);
    });
    
    container.appendChild(gridDiv);
  }

  // ✅ SÉCURITÉ : Créer un élément DOM de carte résident de manière sécurisée (remplace renderResidentCard)
  createResidentCardElement(resident) {
    const age = this.calculateAge(resident.dateOfBirth);
    const medicalSummary = this.getMedicalSummary(resident.nutritionalProfile);
    const isSelected = this.selectedResidents.has(resident._id);
    const portionSize = resident.portionSize || 1;

    // Créer la carte principale
    const card = document.createElement('div');
    card.className = 'resident-card';
    card.style.cssText = `
      background: ${isSelected ? '#e8f5e8' : '#fff'};
      border: 2px solid ${isSelected ? '#4caf50' : '#e0e0e0'};
      border-radius: 8px;
      padding: 0.9rem;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
    `;
    card.addEventListener('click', () => this.toggleResidentSelection(resident._id));

    // En-tête avec nom et boutons
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem;';
    
    const nameDiv = document.createElement('div');
    nameDiv.style.cssText = 'flex: 1; min-width: 0;';
    
    const h3 = document.createElement('h3');
    h3.style.cssText = 'margin: 0 0 0.3rem 0; color: #333; display: flex; align-items: center; gap: 0.4rem; font-size: 0.95rem; font-weight: 600;';
    
    const checkIcon = document.createElement('i');
    checkIcon.className = isSelected ? 'fas fa-check-circle' : 'fas fa-circle';
    checkIcon.style.cssText = `color: ${isSelected ? '#4caf50' : '#ccc'}; font-size: 0.85rem;`;
    h3.appendChild(checkIcon);
    
    const nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
    nameSpan.textContent = `${resident.firstName} ${resident.lastName}`;
    h3.appendChild(nameSpan);
    
    const ageP = document.createElement('p');
    ageP.style.cssText = 'margin: 0; color: #666; font-size: 0.75rem;';
    ageP.textContent = `${age} ans${resident.roomNumber ? ` • Ch. ${resident.roomNumber}` : ''}`;
    
    nameDiv.appendChild(h3);
    nameDiv.appendChild(ageP);
    
    // Boutons d'action
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = 'display: flex; gap: 0.3rem;';
    
    const editBtn = document.createElement('button');
    editBtn.style.cssText = 'background: #3498db; color: white; border: none; padding: 0.35rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.editResident(resident._id);
    });
    const editIcon = document.createElement('i');
    editIcon.className = 'fas fa-edit';
    editBtn.appendChild(editIcon);
    
    const deleteBtn = document.createElement('button');
    deleteBtn.style.cssText = 'background: #e74c3c; color: white; border: none; padding: 0.35rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteResident(resident._id);
    });
    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fas fa-trash';
    deleteBtn.appendChild(deleteIcon);
    
    buttonsDiv.appendChild(editBtn);
    buttonsDiv.appendChild(deleteBtn);
    
    headerDiv.appendChild(nameDiv);
    headerDiv.appendChild(buttonsDiv);
    card.appendChild(headerDiv);

    // Sélecteur de portion
    const portionDiv = document.createElement('div');
    portionDiv.style.cssText = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0.6rem; border-radius: 6px; margin-bottom: 0.6rem;';
    portionDiv.addEventListener('click', (e) => e.stopPropagation());
    
    const portionLabel = document.createElement('label');
    portionLabel.style.cssText = 'display: block; margin-bottom: 0.3rem; color: white; font-size: 0.7rem; font-weight: 600;';
    const utensilIcon = document.createElement('i');
    utensilIcon.className = 'fas fa-utensils';
    utensilIcon.style.cssText = 'font-size: 0.7rem;';
    portionLabel.appendChild(utensilIcon);
    portionLabel.appendChild(document.createTextNode(' Taille de portion'));
    
    const portionSelect = document.createElement('select');
    portionSelect.style.cssText = 'width: 100%; padding: 0.4rem; border: none; border-radius: 4px; font-size: 0.75rem; font-weight: 600; background: white; color: #667eea; cursor: pointer;';
    portionSelect.value = String(portionSize);
    portionSelect.addEventListener('change', (e) => {
      this.updatePortionSize(resident._id, e.target.value);
    });
    
    const option05 = document.createElement('option');
    option05.value = '0.5';
    option05.textContent = '½ - Demi-portion';
    if (portionSize === 0.5) option05.selected = true;
    
    const option1 = document.createElement('option');
    option1.value = '1';
    option1.textContent = '1 - Portion normale';
    if (portionSize === 1) option1.selected = true;
    
    const option2 = document.createElement('option');
    option2.value = '2';
    option2.textContent = '2 - Double portion';
    if (portionSize === 2) option2.selected = true;
    
    portionSelect.appendChild(option05);
    portionSelect.appendChild(option1);
    portionSelect.appendChild(option2);
    
    portionDiv.appendChild(portionLabel);
    portionDiv.appendChild(portionSelect);
    card.appendChild(portionDiv);

    // Profil médical
    const medicalDiv = document.createElement('div');
    medicalDiv.style.cssText = 'background: #f8f9fa; padding: 0.6rem; border-radius: 6px; margin-bottom: 0.6rem; flex: 1;';
    
    const medicalH4 = document.createElement('h4');
    medicalH4.style.cssText = 'margin: 0 0 0.4rem 0; color: #495057; font-size: 0.75rem; font-weight: 600;';
    const stethIcon = document.createElement('i');
    stethIcon.className = 'fas fa-stethoscope';
    stethIcon.style.cssText = 'font-size: 0.7rem;';
    medicalH4.appendChild(stethIcon);
    medicalH4.appendChild(document.createTextNode(' Profil médical'));
    
    const medicalP = document.createElement('p');
    medicalP.style.cssText = 'margin: 0; color: #666; font-size: 0.7rem; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;';
    medicalP.textContent = medicalSummary || 'Aucune information médicale spécifique';
    
    medicalDiv.appendChild(medicalH4);
    medicalDiv.appendChild(medicalP);
    card.appendChild(medicalDiv);

    // Contact d'urgence (si présent)
    if (resident.emergencyContact) {
      const contactDiv = document.createElement('div');
      contactDiv.style.cssText = 'background: #fff3cd; padding: 0.6rem; border-radius: 6px; border-left: 3px solid #ffc107;';
      
      const contactH4 = document.createElement('h4');
      contactH4.style.cssText = 'margin: 0 0 0.3rem 0; color: #856404; font-size: 0.7rem; font-weight: 600;';
      const phoneIcon = document.createElement('i');
      phoneIcon.className = 'fas fa-phone';
      phoneIcon.style.cssText = 'font-size: 0.65rem;';
      contactH4.appendChild(phoneIcon);
      contactH4.appendChild(document.createTextNode(' Contact d\'urgence'));
      
      const contactP = document.createElement('p');
      contactP.style.cssText = 'margin: 0; color: #856404; font-size: 0.65rem;';
      contactP.textContent = `${resident.emergencyContact.name}\n${resident.emergencyContact.phone}`;
      contactP.style.whiteSpace = 'pre-line';
      
      contactDiv.appendChild(contactH4);
      contactDiv.appendChild(contactP);
      card.appendChild(contactDiv);
    }

    return card;
  }

  // ⚠️ DÉPRÉCIÉ : Utiliser createResidentCardElement() à la place pour éviter les risques XSS
  renderResidentCard(resident) {
    const age = this.calculateAge(resident.dateOfBirth);
    const medicalSummary = this.getMedicalSummary(resident.nutritionalProfile);
    const isSelected = this.selectedResidents.has(resident._id);
    const portionSize = resident.portionSize || 1;

    return `
      <div class="resident-card" style="
        background: ${isSelected ? '#e8f5e8' : '#fff'};
        border: 2px solid ${isSelected ? '#4caf50' : '#e0e0e0'};
        border-radius: 8px;
        padding: 0.9rem;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        transition: all 0.3s ease;
        cursor: pointer;
        height: 100%;
        display: flex;
        flex-direction: column;
      " onclick="residentManager.toggleResidentSelection('${resident._id}')">
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.6rem;">
          <div style="flex: 1; min-width: 0;">
            <h3 style="margin: 0 0 0.3rem 0; color: #333; display: flex; align-items: center; gap: 0.4rem; font-size: 0.95rem; font-weight: 600;">
              ${isSelected ? '<i class="fas fa-check-circle" style="color: #4caf50; font-size: 0.85rem;"></i>' : '<i class="fas fa-circle" style="color: #ccc; font-size: 0.85rem;"></i>'}
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${resident.firstName} ${resident.lastName}</span>
            </h3>
            <p style="margin: 0; color: #666; font-size: 0.75rem;">${age} ans ${resident.roomNumber ? `• Ch. ${resident.roomNumber}` : ''}</p>
          </div>
          <div style="display: flex; gap: 0.3rem;">
            <button onclick="event.stopPropagation(); residentManager.editResident('${resident._id}')" 
                    style="background: #3498db; color: white; border: none; padding: 0.35rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
              <i class="fas fa-edit"></i>
            </button>
            <button onclick="event.stopPropagation(); residentManager.deleteResident('${resident._id}')" 
                    style="background: #e74c3c; color: white; border: none; padding: 0.35rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- Sélecteur de portion -->
        <div onclick="event.stopPropagation();" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 0.6rem; border-radius: 6px; margin-bottom: 0.6rem;">
          <label style="display: block; margin-bottom: 0.3rem; color: white; font-size: 0.7rem; font-weight: 600;">
            <i class="fas fa-utensils" style="font-size: 0.7rem;"></i> Taille de portion
          </label>
          <select onchange="residentManager.updatePortionSize('${resident._id}', this.value)" 
                  style="width: 100%; padding: 0.4rem; border: none; border-radius: 4px; font-size: 0.75rem; font-weight: 600; background: white; color: #667eea; cursor: pointer;">
            <option value="0.5" ${portionSize === 0.5 ? 'selected' : ''}>½ - Demi-portion</option>
            <option value="1" ${portionSize === 1 ? 'selected' : ''}>1 - Portion normale</option>
            <option value="2" ${portionSize === 2 ? 'selected' : ''}>2 - Double portion</option>
          </select>
        </div>

        <div style="background: #f8f9fa; padding: 0.6rem; border-radius: 6px; margin-bottom: 0.6rem; flex: 1;">
          <h4 style="margin: 0 0 0.4rem 0; color: #495057; font-size: 0.75rem; font-weight: 600;">
            <i class="fas fa-stethoscope" style="font-size: 0.7rem;"></i> Profil médical
          </h4>
          <p style="margin: 0; color: #666; font-size: 0.7rem; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
            ${medicalSummary || 'Aucune information médicale spécifique'}
          </p>
        </div>

        ${resident.emergencyContact ? `
          <div style="background: #fff3cd; padding: 0.6rem; border-radius: 6px; border-left: 3px solid #ffc107;">
            <h4 style="margin: 0 0 0.3rem 0; color: #856404; font-size: 0.7rem; font-weight: 600;">
              <i class="fas fa-phone" style="font-size: 0.65rem;"></i> Contact d'urgence
            </h4>
            <p style="margin: 0; color: #856404; font-size: 0.65rem;">
              ${resident.emergencyContact.name}<br>${resident.emergencyContact.phone}
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

  getMedicalSummary(nutritionalProfile) {
    const summary = [];
    
    if (!nutritionalProfile) {
      return 'Aucune information';
    }
    
    // Conditions médicales
    if (nutritionalProfile.medicalConditions && nutritionalProfile.medicalConditions.length > 0) {
      const conditions = nutritionalProfile.medicalConditions.map(c => c.condition || c).join(', ');
      summary.push(`Conditions: ${conditions}`);
    }
    
    // Texture
    if (nutritionalProfile.texturePreferences?.consistency && 
        nutritionalProfile.texturePreferences.consistency !== 'normale' &&
        nutritionalProfile.texturePreferences.consistency !== 'iddsi_7') {
      const textureLabels = {
        'iddsi_6': 'IDDSI 6 - Morceaux tendres',
        'iddsi_5': 'IDDSI 5 - Haché',
        'iddsi_4': 'IDDSI 4 - Purée lisse',
        'iddsi_3': 'IDDSI 3 - Purée fluide',
        'iddsi_2': 'IDDSI 2 - Légèrement épais',
        'iddsi_1': 'IDDSI 1 - Très légèrement épais',
        'iddsi_0': 'IDDSI 0 - Liquide',
        'finger_food': 'Finger Food',
        'mixée': 'Mixée',
        'hachée': 'Hachée',
        'liquide': 'Liquide',
        'purée': 'Purée'
      };
      const textureLabel = textureLabels[nutritionalProfile.texturePreferences.consistency] || nutritionalProfile.texturePreferences.consistency;
      summary.push(`Texture: ${textureLabel}`);
    }
    
    // Allergies
    if (nutritionalProfile.allergies && nutritionalProfile.allergies.length > 0) {
      const allergies = nutritionalProfile.allergies.map(a => a.allergen || a).join(', ');
      summary.push(`Allergies: ${allergies}`);
    }
    
    // Restrictions alimentaires
    if (nutritionalProfile.dietaryRestrictions && nutritionalProfile.dietaryRestrictions.length > 0) {
      const restrictions = nutritionalProfile.dietaryRestrictions.map(r => r.restriction || r).join(', ');
      summary.push(`Restrictions: ${restrictions}`);
    }
    
    return summary.length > 0 ? summary.join(' | ') : 'Aucune restriction';
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

  async updatePortionSize(residentId, portionSize) {
    try {
      // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
      
      const response = await fetchFn(`/api/residents/${residentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ portionSize: parseFloat(portionSize) })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la portion');
      }

      // Mettre à jour localement
      const resident = this.residents.find(r => r._id === residentId);
      if (resident) {
        resident.portionSize = parseFloat(portionSize);
      }

      const portionLabel = portionSize === '0.5' ? 'demi-portion' : portionSize === '2' ? 'double portion' : 'portion normale';
      this.showToast(`Portion mise à jour : ${portionLabel}`, 'success');
    } catch (error) {
      console.error('Erreur:', error);
      this.showToast('Erreur lors de la mise à jour de la portion', 'error');
    }
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
        (resident.nutritionalProfile?.medicalConditions && 
         resident.nutritionalProfile.medicalConditions.some(c => 
           (typeof c === 'string' ? c : c.condition) === medicalFilter
         ));

      const matchesTexture = !textureFilter || 
        resident.nutritionalProfile?.texturePreferences?.consistency === textureFilter;

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

  async editResident(residentId) {
    // Récupérer les données du résident
    const resident = this.residents.find(r => r._id === residentId);
    if (!resident) {
      this.showToast('Résident non trouvé', 'error');
      return;
    }

    // Créer et afficher le modal avec les données pré-remplies
    const modal = this.createResidentModal(resident);
    document.body.appendChild(modal);
  }

  async deleteResident(residentId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce résident ?')) {
      return;
    }

    try {
      // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
      
      const response = await fetchFn(`/api/residents/${residentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du résident');
      }

      this.showToast('Résident supprimé avec succès', 'success');
      this.loadResidents();
      this.loadStats();
      this.loadAllResidentsForSummary();
    } catch (error) {
      console.error('Erreur:', error);
      this.showToast('Erreur lors de la suppression du résident', 'error');
    }
  }

  createResidentModal(resident = null) {
    const isEdit = !!resident;
    const modal = document.createElement('div');
    modal.id = 'add-resident-modal';
    modal.className = 'resident-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.5); z-index: 1000; display: flex; 
      align-items: center; justify-content: center;
    `;

    // ✅ SÉCURITÉ : Fonction helper pour échapper les valeurs HTML
    const escapeHtml = (text) => {
      if (text == null) return '';
      const div = document.createElement('div');
      div.textContent = String(text);
      return div.innerHTML;
    };

    // ✅ SÉCURITÉ : Créer le contenu de la modale de manière sécurisée
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; border-radius: 12px; padding: 2rem; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;';
    
    // Titre
    const h2 = document.createElement('h2');
    h2.style.cssText = `margin: 0 0 1.5rem 0; color: ${isEdit ? '#3498db' : '#4caf50'};`;
    const titleIcon = document.createElement('i');
    titleIcon.className = isEdit ? 'fas fa-edit' : 'fas fa-user-plus';
    h2.appendChild(titleIcon);
    h2.appendChild(document.createTextNode(` ${isEdit ? 'Modifier le résident' : 'Ajouter un résident'}`));
    modalContent.appendChild(h2);
    
    // Formulaire
    const form = document.createElement('form');
    form.id = 'add-resident-form';
    if (isEdit && resident._id) {
      form.setAttribute('data-resident-id', String(resident._id));
    }
    
    // Ligne 1: Prénom et Nom
    const row1 = document.createElement('div');
    row1.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;';
    
    const firstNameDiv = document.createElement('div');
    const firstNameLabel = document.createElement('label');
    firstNameLabel.textContent = 'Prénom *';
    const firstNameInput = document.createElement('input');
    firstNameInput.type = 'text';
    firstNameInput.id = 'resident-firstname';
    firstNameInput.required = true;
    firstNameInput.value = isEdit && resident.firstName ? String(resident.firstName) : '';
    firstNameInput.style.cssText = 'width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;';
    firstNameDiv.appendChild(firstNameLabel);
    firstNameDiv.appendChild(firstNameInput);
    
    const lastNameDiv = document.createElement('div');
    const lastNameLabel = document.createElement('label');
    lastNameLabel.textContent = 'Nom *';
    const lastNameInput = document.createElement('input');
    lastNameInput.type = 'text';
    lastNameInput.id = 'resident-lastname';
    lastNameInput.required = true;
    lastNameInput.value = isEdit && resident.lastName ? String(resident.lastName) : '';
    lastNameInput.style.cssText = 'width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;';
    lastNameDiv.appendChild(lastNameLabel);
    lastNameDiv.appendChild(lastNameInput);
    
    row1.appendChild(firstNameDiv);
    row1.appendChild(lastNameDiv);
    form.appendChild(row1);
    
    // Ligne 2: Date de naissance et Genre
    const row2 = document.createElement('div');
    row2.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;';
    
    const birthdateDiv = document.createElement('div');
    const birthdateLabel = document.createElement('label');
    birthdateLabel.textContent = 'Date de naissance *';
    const birthdateInput = document.createElement('input');
    birthdateInput.type = 'date';
    birthdateInput.id = 'resident-birthdate';
    birthdateInput.required = true;
    if (isEdit && resident.dateOfBirth) {
      birthdateInput.value = String(resident.dateOfBirth).split('T')[0];
    }
    birthdateInput.style.cssText = 'width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;';
    birthdateDiv.appendChild(birthdateLabel);
    birthdateDiv.appendChild(birthdateInput);
    
    const genderDiv = document.createElement('div');
    const genderLabel = document.createElement('label');
    genderLabel.textContent = 'Genre *';
    const genderSelect = document.createElement('select');
    genderSelect.id = 'resident-gender';
    genderSelect.required = true;
    genderSelect.style.cssText = 'width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;';
    
    const genderOption0 = document.createElement('option');
    genderOption0.value = '';
    genderOption0.textContent = 'Sélectionner...';
    genderSelect.appendChild(genderOption0);
    
    ['homme', 'femme', 'autre'].forEach(gender => {
      const option = document.createElement('option');
      option.value = gender;
      option.textContent = gender.charAt(0).toUpperCase() + gender.slice(1);
      if (isEdit && resident.gender === gender) {
        option.selected = true;
      }
      genderSelect.appendChild(option);
    });
    
    genderDiv.appendChild(genderLabel);
    genderDiv.appendChild(genderSelect);
    
    row2.appendChild(birthdateDiv);
    row2.appendChild(genderDiv);
    form.appendChild(row2);
    
    // Ligne 3: Chambre et Portion
    const row3 = document.createElement('div');
    row3.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;';
    
    const roomDiv = document.createElement('div');
    const roomLabel = document.createElement('label');
    roomLabel.textContent = 'Numéro de chambre';
    const roomInput = document.createElement('input');
    roomInput.type = 'text';
    roomInput.id = 'resident-room';
    roomInput.value = isEdit && resident.roomNumber ? String(resident.roomNumber) : '';
    roomInput.style.cssText = 'width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;';
    roomDiv.appendChild(roomLabel);
    roomDiv.appendChild(roomInput);
    
    const portionDiv = document.createElement('div');
    const portionLabel = document.createElement('label');
    portionLabel.textContent = 'Taille de portion';
    const portionSelect = document.createElement('select');
    portionSelect.id = 'resident-portion';
    portionSelect.style.cssText = 'width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;';
    
    const portionOptions = [
      { value: '0.5', text: '½ - Demi-portion' },
      { value: '1', text: '1 - Portion normale' },
      { value: '2', text: '2 - Double portion' }
    ];
    
    portionOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      if (isEdit && resident.portionSize === parseFloat(opt.value)) {
        option.selected = true;
      } else if (!isEdit && opt.value === '1') {
        option.selected = true;
      }
      portionSelect.appendChild(option);
    });
    
    portionDiv.appendChild(portionLabel);
    portionDiv.appendChild(portionSelect);
    
    row3.appendChild(roomDiv);
    row3.appendChild(portionDiv);
    form.appendChild(row3);
    
    // Conditions médicales
    const medicalDiv = document.createElement('div');
    medicalDiv.style.cssText = 'margin-bottom: 1rem;';
    const medicalLabel = document.createElement('label');
    medicalLabel.textContent = 'Conditions médicales';
    const medicalGrid = document.createElement('div');
    medicalGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; margin-top: 0.5rem;';
    
    const conditions = ['diabete_type2', 'hypertension', 'dysphagie', 'alzheimer', 'parkinson', 'denutrition'];
    const conditionLabels = {
      'diabete_type2': 'Diabète type 2',
      'hypertension': 'Hypertension',
      'dysphagie': 'Dysphagie',
      'alzheimer': 'Alzheimer',
      'parkinson': 'Parkinson',
      'denutrition': 'Dénutrition'
    };
    
    conditions.forEach(condition => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'medical-condition';
      checkbox.value = condition;
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(` ${conditionLabels[condition]}`));
      medicalGrid.appendChild(label);
    });
    
    medicalDiv.appendChild(medicalLabel);
    medicalDiv.appendChild(medicalGrid);
    form.appendChild(medicalDiv);
    
    // Texture IDDSI
    const textureDiv = document.createElement('div');
    textureDiv.style.cssText = 'margin-bottom: 1rem;';
    const textureLabel = document.createElement('label');
    textureLabel.textContent = 'Texture / Consistance (IDDSI) *';
    const textureSelect = document.createElement('select');
    textureSelect.id = 'resident-texture';
    textureSelect.style.cssText = 'width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px;';
    
    const textureOptions = [
      { value: 'iddsi_7', text: 'IDDSI 7 - Normal facile à mastiquer' },
      { value: 'iddsi_6', text: 'IDDSI 6 - Petites morceaux tendres' },
      { value: 'iddsi_5', text: 'IDDSI 5 - Haché lubrifié' },
      { value: 'iddsi_4', text: 'IDDSI 4 - Purée lisse / Très épais (boisson)' },
      { value: 'iddsi_3', text: 'IDDSI 3 - Purée fluide / Modérément épais (boisson)' },
      { value: 'iddsi_2', text: 'IDDSI 2 - Légèrement épais (boisson)' },
      { value: 'iddsi_1', text: 'IDDSI 1 - Très légèrement épais (boisson)' },
      { value: 'iddsi_0', text: 'IDDSI 0 - Liquide' },
      { value: 'finger_food', text: 'Finger Food' }
    ];
    
    textureOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      textureSelect.appendChild(option);
    });
    
    const textureSmall = document.createElement('small');
    textureSmall.style.cssText = 'color: #666; font-size: 0.85rem; margin-top: 0.3rem; display: block;';
    const infoIcon = document.createElement('i');
    infoIcon.className = 'fas fa-info-circle';
    textureSmall.appendChild(infoIcon);
    textureSmall.appendChild(document.createTextNode(' IDDSI 0-4 pour liquides/boissons, IDDSI 3-7 pour aliments'));
    
    textureDiv.appendChild(textureLabel);
    textureDiv.appendChild(textureSelect);
    textureDiv.appendChild(textureSmall);
    form.appendChild(textureDiv);
    
    // Allergènes
    const allergenDiv = document.createElement('div');
    allergenDiv.style.cssText = 'margin-bottom: 1rem;';
    const allergenLabel = document.createElement('label');
    allergenLabel.textContent = 'Allergènes';
    const allergenGrid = document.createElement('div');
    allergenGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; margin-top: 0.5rem;';
    
    const allergens = ['gluten', 'lactose', 'oeufs', 'arachides', 'poisson', 'soja'];
    const allergenLabels = {
      'gluten': 'Gluten',
      'lactose': 'Lactose',
      'oeufs': 'Œufs',
      'arachides': 'Arachides',
      'poisson': 'Poisson',
      'soja': 'Soja'
    };
    
    allergens.forEach(allergen => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'allergen';
      checkbox.value = allergen;
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(` ${allergenLabels[allergen]}`));
      allergenGrid.appendChild(label);
    });
    
    allergenDiv.appendChild(allergenLabel);
    allergenDiv.appendChild(allergenGrid);
    form.appendChild(allergenDiv);
    
    // Notes
    const notesDiv = document.createElement('div');
    notesDiv.style.cssText = 'margin-bottom: 1rem;';
    const notesLabel = document.createElement('label');
    notesLabel.textContent = 'Notes médicales';
    const notesTextarea = document.createElement('textarea');
    notesTextarea.id = 'resident-notes';
    notesTextarea.rows = 3;
    notesTextarea.style.cssText = 'width: 100%; padding: 0.8rem; border: 1px solid #ced4da; border-radius: 8px; resize: vertical;';
    notesDiv.appendChild(notesLabel);
    notesDiv.appendChild(notesTextarea);
    form.appendChild(notesDiv);
    
    // Boutons
    const buttonsDiv = document.createElement('div');
    buttonsDiv.style.cssText = 'display: flex; gap: 1rem; justify-content: flex-end;';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'cancel-resident-modal-btn';
    cancelBtn.style.cssText = 'background: #6c757d; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer;';
    cancelBtn.textContent = 'Annuler';
    
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.style.cssText = 'background: #4caf50; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; cursor: pointer;';
    const saveIcon = document.createElement('i');
    saveIcon.className = 'fas fa-save';
    submitBtn.appendChild(saveIcon);
    submitBtn.appendChild(document.createTextNode(' Enregistrer'));
    
    buttonsDiv.appendChild(cancelBtn);
    buttonsDiv.appendChild(submitBtn);
    form.appendChild(buttonsDiv);
    
    modalContent.appendChild(form);
    modal.appendChild(modalContent);

    // ✅ SÉCURITÉ : Plus besoin d'innerHTML, tout est créé avec createElement
    // Pré-remplir les champs si c'est une édition (les valeurs sont déjà définies ci-dessus)
    // Mais on doit aussi gérer les checkboxes et selects qui dépendent de nutritionalProfile
    if (isEdit && resident.nutritionalProfile) {
      const np = resident.nutritionalProfile;
      
      // Pré-cocher les conditions médicales
      if (np.medicalConditions) {
        np.medicalConditions.forEach(cond => {
          const value = typeof cond === 'string' ? cond : cond.condition;
          const checkbox = modal.querySelector(`.medical-condition[value="${value}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
      
      // Pré-cocher les allergènes
      if (np.allergies) {
        np.allergies.forEach(allergy => {
          const value = typeof allergy === 'string' ? allergy : allergy.allergen;
          const checkbox = modal.querySelector(`.allergen[value="${value}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
      
      // Sélectionner la texture IDDSI
      if (np.texturePreferences?.consistency) {
        const textureSelect = modal.querySelector('#resident-texture');
        if (textureSelect) textureSelect.value = np.texturePreferences.consistency;
      }
      
      // Notes
      if (resident.generalNotes) {
        const notesTextarea = modal.querySelector('#resident-notes');
        if (notesTextarea) notesTextarea.value = resident.generalNotes;
      }
    }

    // Gérer la soumission du formulaire
    // ✅ CORRECTION : Utiliser la variable form déjà créée, pas besoin de querySelector
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveResident(modal);
    });

    // ✅ REFACTORISÉ : Gérer le bouton Annuler
    // ✅ CORRECTION : Utiliser la variable cancelBtn déjà créée, pas besoin de querySelector
    cancelBtn.addEventListener('click', () => {
      modal.remove();
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
      const form = modal.querySelector('#add-resident-form');
      const residentId = form.dataset.residentId;
      const isEdit = !!residentId;

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
        portionSize: parseFloat(document.getElementById('resident-portion').value),
        nutritionalProfile: {
          medicalConditions: medicalConditions,
          allergies: allergies,
          intolerances: [],
          dietaryRestrictions: [],
          texturePreferences: {
            consistency: document.getElementById('resident-texture').value,
            difficulty: 'aucune',
            notes: ''
          },
          nutritionalNeeds: {},
          hydration: {},
          foodPreferences: {}
        },
        generalNotes: document.getElementById('resident-notes').value,
        status: 'actif'
      };

      console.log('Envoi des données:', formData);

      const url = isEdit ? `/api/residents/${residentId}` : '/api/residents';
      const method = isEdit ? 'PUT' : 'POST';

      // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

      const response = await fetchFn(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur serveur:', errorData);
        throw new Error(errorData.message || `Erreur lors de ${isEdit ? 'la modification' : 'la création'} du résident`);
      }

      const result = await response.json();
      console.log(`Résident ${isEdit ? 'modifié' : 'créé'}:`, result);

      this.showToast(`Résident ${isEdit ? 'modifié' : 'créé'} avec succès`, 'success');
      modal.remove();
      this.loadResidents();
      this.loadStats();
      this.loadAllResidentsForSummary();
    } catch (error) {
      console.error('Erreur:', error);
      this.showToast(error.message || `Erreur lors de ${residentId ? 'la modification' : 'la création'} du résident`, 'error');
    }
  }

  async generateMenuForSelected() {
    if (this.selectedResidents.size === 0) {
      this.showToast('Veuillez sélectionner au moins un résident', 'warning');
      return;
    }

    try {
      // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
      
      const response = await fetchFn('/api/intelligent-menu/generate-for-residents', {
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
        // ✅ AMÉLIORATION : Récupérer le message d'erreur du serveur
        let errorMessage = 'Erreur lors de la génération du menu';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Si la réponse n'est pas du JSON, utiliser le message par défaut
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      this.showMenuResults(data);
    } catch (error) {
      console.error('Erreur:', error);
      this.showToast(error.message || 'Erreur lors de la génération du menu', 'error');
    }
  }

  showMenuResults(data) {
    // Afficher les résultats du menu dans l'onglet Menus
    const menuResults = document.getElementById('menu-results');
    if (!menuResults) return;
    
    // ✅ SÉCURITÉ : Vider le conteneur de manière sécurisée
    menuResults.textContent = '';
    
    if (data.success) {
      const menu = data.menu;
      const metadata = menu.metadata;
      
      // ✅ SÉCURITÉ : Créer les éléments de manière sécurisée avec createElement
      const container = document.createElement('div');
      container.style.cssText = 'background: #e8f5e8; padding: 1.5rem; border-radius: 8px; margin-top: 1rem;';
      
      // Titre
      const h3 = document.createElement('h3');
      h3.style.cssText = 'color: #4caf50; margin: 0 0 1rem 0;';
      const magicIcon = document.createElement('i');
      magicIcon.className = 'fas fa-magic';
      h3.appendChild(magicIcon);
      h3.appendChild(document.createTextNode(' '));
      const titleText = document.createTextNode(menu.title || 'Menu généré');
      h3.appendChild(titleText);
      container.appendChild(h3);
      
      // Description
      if (menu.description) {
        const descP = document.createElement('p');
        descP.style.cssText = 'margin: 0 0 1rem 0; color: #666;';
        descP.textContent = menu.description;
        container.appendChild(descP);
      }
      
      // Statistiques
      const statsGrid = document.createElement('div');
      statsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;';
      
      const createStatCard = (value, label) => {
        const card = document.createElement('div');
        card.style.cssText = 'background: #fff; padding: 1rem; border-radius: 8px; text-align: center;';
        const h4 = document.createElement('h4');
        h4.style.cssText = 'margin: 0; color: #4caf50; font-size: 1.5rem;';
        h4.textContent = String(value);
        const p = document.createElement('p');
        p.style.cssText = 'margin: 0.5rem 0 0 0; color: #666;';
        p.textContent = label;
        card.appendChild(h4);
        card.appendChild(p);
        return card;
      };
      
      statsGrid.appendChild(createStatCard(metadata.totalPeople || 0, 'Résidents'));
      statsGrid.appendChild(createStatCard(metadata.medicalGroups?.length || 0, 'Groupes médicaux'));
      statsGrid.appendChild(createStatCard(menu.mainMenu?.dishes?.length || 0, 'Plats générés'));
      container.appendChild(statsGrid);
      
      // Menu principal
      if (menu.mainMenu && menu.mainMenu.dishes) {
        const mainMenuDiv = document.createElement('div');
        mainMenuDiv.style.cssText = 'background: #fff; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;';
        
        const menuH4 = document.createElement('h4');
        menuH4.style.cssText = 'margin: 0 0 1rem 0; color: #333;';
        const utensilIcon = document.createElement('i');
        utensilIcon.className = 'fas fa-utensils';
        menuH4.appendChild(utensilIcon);
        menuH4.appendChild(document.createTextNode(' Menu principal'));
        mainMenuDiv.appendChild(menuH4);
        
        const dishesGrid = document.createElement('div');
        dishesGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;';
        
        menu.mainMenu.dishes.forEach(dish => {
          const dishDiv = document.createElement('div');
          dishDiv.style.cssText = 'border: 1px solid #e0e0e0; padding: 1rem; border-radius: 8px;';
          
          const dishH5 = document.createElement('h5');
          dishH5.style.cssText = 'margin: 0 0 0.5rem 0; color: #4caf50;';
          dishH5.textContent = dish.title || 'Plat sans titre';
          
          const dishP = document.createElement('p');
          dishP.style.cssText = 'margin: 0; color: #666; font-size: 0.9rem;';
          dishP.textContent = dish.description || 'Description non disponible';
          
          const badgesDiv = document.createElement('div');
          badgesDiv.style.cssText = 'margin-top: 0.5rem; font-size: 0.8rem; color: #888;';
          
          const servingsSpan = document.createElement('span');
          servingsSpan.style.cssText = 'background: #e3f2fd; padding: 0.25rem 0.5rem; border-radius: 4px; margin-right: 0.5rem;';
          servingsSpan.textContent = `${dish.servings || 0} portions`;
          
          const categorySpan = document.createElement('span');
          categorySpan.style.cssText = 'background: #f3e5f5; padding: 0.25rem 0.5rem; border-radius: 4px;';
          categorySpan.textContent = dish.category || 'Non spécifié';
          
          badgesDiv.appendChild(servingsSpan);
          badgesDiv.appendChild(categorySpan);
          
          dishDiv.appendChild(dishH5);
          dishDiv.appendChild(dishP);
          dishDiv.appendChild(badgesDiv);
          dishesGrid.appendChild(dishDiv);
        });
        
        mainMenuDiv.appendChild(dishesGrid);
        container.appendChild(mainMenuDiv);
      }
      
      // Variantes (si présentes)
      if (menu.variants && menu.variants.length > 0) {
        const variantsDiv = document.createElement('div');
        variantsDiv.style.cssText = 'background: #fff; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;';
        
        const variantsH4 = document.createElement('h4');
        variantsH4.style.cssText = 'margin: 0 0 1rem 0; color: #333;';
        const exchangeIcon = document.createElement('i');
        exchangeIcon.className = 'fas fa-exchange-alt';
        variantsH4.appendChild(exchangeIcon);
        variantsH4.appendChild(document.createTextNode(' Variantes pour groupes spécifiques'));
        variantsDiv.appendChild(variantsH4);
        
        menu.variants.forEach(variant => {
          const variantDiv = document.createElement('div');
          variantDiv.style.cssText = 'border: 1px solid #e0e0e0; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;';
          
          const variantH5 = document.createElement('h5');
          variantH5.style.cssText = 'margin: 0 0 0.5rem 0; color: #9c27b0;';
          variantH5.textContent = `${variant.groupName || 'Groupe'} (${variant.count || 0} résidents)`;
          variantDiv.appendChild(variantH5);
          
          const variantDishesGrid = document.createElement('div');
          variantDishesGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem;';
          
          if (variant.dishes) {
            variant.dishes.forEach(dish => {
              const variantDishDiv = document.createElement('div');
              variantDishDiv.style.cssText = 'background: #f8f9fa; padding: 0.75rem; border-radius: 6px;';
              
              const variantDishStrong = document.createElement('strong');
              variantDishStrong.textContent = dish.title || 'Plat sans titre';
              
              const variantDishP = document.createElement('p');
              variantDishP.style.cssText = 'margin: 0.25rem 0 0 0; font-size: 0.8rem; color: #666;';
              variantDishP.textContent = dish.description || '';
              
              variantDishDiv.appendChild(variantDishStrong);
              variantDishDiv.appendChild(variantDishP);
              variantDishesGrid.appendChild(variantDishDiv);
            });
          }
          
          variantDiv.appendChild(variantDishesGrid);
          variantsDiv.appendChild(variantDiv);
        });
        
        container.appendChild(variantsDiv);
      }
      
      // Liste de courses
      if (menu.shoppingList && menu.shoppingList.length > 0) {
        const shoppingDiv = document.createElement('div');
        shoppingDiv.style.cssText = 'background: #fff; padding: 1rem; border-radius: 8px;';
        
        const shoppingH4 = document.createElement('h4');
        shoppingH4.style.cssText = 'margin: 0 0 1rem 0; color: #333;';
        const cartIcon = document.createElement('i');
        cartIcon.className = 'fas fa-shopping-cart';
        shoppingH4.appendChild(cartIcon);
        shoppingH4.appendChild(document.createTextNode(' Liste de courses'));
        shoppingDiv.appendChild(shoppingH4);
        
        const shoppingListDiv = document.createElement('div');
        shoppingListDiv.style.cssText = 'max-height: 200px; overflow-y: auto;';
        
        menu.shoppingList.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.style.cssText = 'display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0;';
          
          const itemName = document.createElement('span');
          itemName.textContent = item.name || 'Article';
          
          const itemQty = document.createElement('span');
          itemQty.style.cssText = 'color: #4caf50; font-weight: 600;';
          itemQty.textContent = `${item.quantity || 0} ${item.unit || ''}`;
          
          itemDiv.appendChild(itemName);
          itemDiv.appendChild(itemQty);
          shoppingListDiv.appendChild(itemDiv);
        });
        
        shoppingDiv.appendChild(shoppingListDiv);
        container.appendChild(shoppingDiv);
      }
      
      menuResults.appendChild(container);
      menuResults.style.display = 'block';
    } else {
      // ✅ SÉCURITÉ : Message d'erreur créé de manière sécurisée
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = 'background: #ffebee; padding: 1.5rem; border-radius: 8px; margin-top: 1rem; text-align: center;';
      
      const errorH3 = document.createElement('h3');
      errorH3.style.cssText = 'color: #f44336; margin: 0 0 1rem 0;';
      const errorIcon = document.createElement('i');
      errorIcon.className = 'fas fa-exclamation-triangle';
      errorH3.appendChild(errorIcon);
      errorH3.appendChild(document.createTextNode(' Erreur lors de la génération du menu'));
      
      const errorP = document.createElement('p');
      errorP.style.cssText = 'margin: 0; color: #666;';
      errorP.textContent = data.message || 'Une erreur inattendue s\'est produite';
      
      errorDiv.appendChild(errorH3);
      errorDiv.appendChild(errorP);
      menuResults.appendChild(errorDiv);
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

function initResidentManagement() {
  if (!residentManager) {
    residentManager = new ResidentManager();
    // Exposer globalement pour les attributs onclick
    window.residentManager = residentManager;
  }
  return residentManager;
}

// Initialiser automatiquement si le DOM est déjà chargé
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initResidentManagement();
  });
} else {
  // DOM déjà chargé, initialiser immédiatement
  initResidentManagement();
}
