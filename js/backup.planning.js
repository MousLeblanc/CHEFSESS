/**
 * ChAIf SES Planning Module
 * 
 * Ce module gère la planification des menus, l'historique et les statistiques d'utilisation
 */

// Pour le développement initial, nous utilisons des données simulées
// Plus tard, ces imports seront décommentés pour utiliser l'API réelle
// import { ChAIfSESAPI } from './api/chaif-ses-api.js';
// import config from './api/config.js';

// Initialisation de l'API (simulation)
const chaifSesApi = {
  // Méthodes simulées qui seront remplacées par l'API réelle
  getWeeklyPlan: () => ({}),
  getMenuHistory: () => ([]),
  getMenuStats: () => ({})
};

/**
 * Classe de gestion du planning des menus
 */
class MenuPlanner {
  constructor() {
    this.currentWeekStart = null;
    this.weeklyPlan = {};
    this.menuHistory = [];
    this.statsData = {};
    
    // Initialiser la date de début de semaine (lundi)
    this.initWeekStart();
    
    // Charger les données
    this.loadPlanningData();
    this.loadHistoryData();
    this.loadStatsData();
    
    // Initialiser les gestionnaires d'événements
    this.initEventListeners();
  }
  
  /**
   * Initialise la date de début de semaine (lundi)
   */
  initWeekStart() {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajuster si aujourd'hui est dimanche
    
    this.currentWeekStart = new Date(today.setDate(diff));
    this.currentWeekStart.setHours(0, 0, 0, 0);
    
    // Mettre à jour l'affichage de la semaine
    this.updateWeekRange();
  }
  
  /**
   * Met à jour l'affichage de la plage de dates de la semaine
   */
  updateWeekRange() {
    const weekEnd = new Date(this.currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const weekRangeElement = document.getElementById('week-range');
    if (weekRangeElement) {
      const startDay = this.currentWeekStart.getDate();
      const endDay = weekEnd.getDate();
      const startMonth = this.currentWeekStart.toLocaleString('fr-FR', { month: 'long' });
      const endMonth = weekEnd.toLocaleString('fr-FR', { month: 'long' });
      
      if (startMonth === endMonth) {
        weekRangeElement.textContent = `${startDay} au ${endDay} ${startMonth} ${this.currentWeekStart.getFullYear()}`;
      } else {
        weekRangeElement.textContent = `${startDay} ${startMonth} au ${endDay} ${endMonth} ${this.currentWeekStart.getFullYear()}`;
      }
    }
  }
  
  /**
   * Initialise les gestionnaires d'événements
   */
  initEventListeners() {
    // Gestion des onglets
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        this.activateTab(tabId);
      });
    });
    
    // Navigation dans le calendrier
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    
    if (prevWeekBtn) {
      prevWeekBtn.addEventListener('click', () => this.changeWeek(-1));
    }
    
    if (nextWeekBtn) {
      nextWeekBtn.addEventListener('click', () => this.changeWeek(1));
    }
    
    // Gestion des boutons d'ajout de menu
    const addMenuBtns = document.querySelectorAll('.add-menu-btn');
    addMenuBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const date = e.target.getAttribute('data-date');
        this.showAddMenuModal(date);
      });
    });
    
    // Gestion des menus existants
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const menuId = e.currentTarget.getAttribute('data-menu-id');
        this.showMenuDetails(menuId);
      });
    });
    
    // Gestion des boutons d'actions dans l'historique
    document.querySelectorAll('.view-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuId = e.target.closest('.history-item').getAttribute('data-menu-id');
        this.showMenuDetails(menuId);
      });
    });
    
    document.querySelectorAll('.reuse-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuId = e.target.closest('.history-item').getAttribute('data-menu-id');
        this.reuseMenu(menuId);
      });
    });
    
    // Filtres de l'historique
    const historySearch = document.getElementById('history-search');
    const historyPeriod = document.getElementById('history-period');
    const historySort = document.getElementById('history-sort');
    
    if (historySearch) {
      historySearch.addEventListener('input', () => this.filterHistory());
    }
    
    if (historyPeriod) {
      historyPeriod.addEventListener('change', () => this.filterHistory());
    }
    
    if (historySort) {
      historySort.addEventListener('change', () => this.filterHistory());
    }
    
    // Pagination
    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (!e.target.classList.contains('active')) {
          const currentPage = document.querySelector('.page-btn.active');
          if (currentPage) {
            currentPage.classList.remove('active');
          }
          e.target.classList.add('active');
          this.changePage(e.target.textContent);
        }
      });
    });
    
    // Exportation et impression
    const exportBtn = document.getElementById('export-planning');
    const printBtn = document.getElementById('print-planning');
    
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportPlanning());
    }
    
    if (printBtn) {
      printBtn.addEventListener('click', () => this.printPlanning());
    }
    
    // Génération automatique du planning
    const generateWeekPlanBtn = document.getElementById('generate-week-plan');
    if (generateWeekPlanBtn) {
      generateWeekPlanBtn.addEventListener('click', () => this.generateWeeklyPlan());
    }
    
    // Filtres des graphiques
    const chartPeriod = document.getElementById('chart-period');
    const ingredientsPeriod = document.getElementById('ingredients-period');
    
    if (chartPeriod) {
      chartPeriod.addEventListener('change', () => this.updateCharts());
    }
    
    if (ingredientsPeriod) {
      ingredientsPeriod.addEventListener('change', () => this.updateIngredientsChart());
    }
  }
  
  /**
   * Active l'onglet spécifié
   * @param {string} tabId - Identifiant de l'onglet à activer
   */
  activateTab(tabId) {
    // Désactiver tous les onglets
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    // Activer l'onglet sélectionné
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
    
    // Initialiser les données spécifiques à l'onglet
    if (tabId === 'planning') {
      this.refreshPlanningView();
    } else if (tabId === 'history') {
      this.refreshHistoryView();
    } else if (tabId === 'stats') {
      this.initCharts();
    }
  }
  
  /**
   * Change la semaine affichée
   * @param {number} direction - Direction du changement (-1 pour précédent, 1 pour suivant)
   */
  changeWeek(direction) {
    // Calculer la nouvelle date de début de semaine
    const newWeekStart = new Date(this.currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + (direction * 7));
    
    this.currentWeekStart = newWeekStart;
    
    // Mettre à jour l'affichage de la semaine
    this.updateWeekRange();
    
    // Charger les données de planning pour la nouvelle semaine
    this.loadPlanningData();
    
    // Rafraîchir l'affichage
    this.refreshPlanningView();
  }
  
  /**
   * Charge les données de planning pour la semaine courante
   */
  loadPlanningData() {
    try {
      // Dans une implémentation réelle, on récupérerait les données depuis l'API
      // chaifSesApi.getWeeklyPlan(this.currentWeekStart)
      
      // Pour cette démo, on utilise des données statiques
      this.weeklyPlan = this.getMockWeeklyPlan();
    } catch (error) {
      console.error('Erreur lors du chargement des données de planning:', error);
      this.weeklyPlan = {};
    }
  }
  
  /**
   * Génère des données de planning simulées
   * @returns {Object} - Données de planning simulées
   */
  getMockWeeklyPlan() {
    const weekStart = new Date(this.currentWeekStart);
    const plan = {};
    
    // Générer des données pour chaque jour de la semaine
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = this.formatDate(currentDate);
      
      // Simuler 2 services par jour (midi et soir)
      plan[dateString] = [
        {
          id: 1000 + (i * 2) + 1,
          title: this.getRandomMenuTitle(),
          time: '12:00',
          guests: Math.floor(Math.random() * 30) + 30,
          image: '/api/placeholder/160/160'
        },
        {
          id: 1000 + (i * 2) + 2,
          title: this.getRandomMenuTitle(),
          time: '19:00',
          guests: Math.floor(Math.random() * 30) + 40,
          image: '/api/placeholder/160/160'
        }
      ];
    }
    
    return plan;
  }
  
  /**
   * Génère un titre de menu aléatoire pour les données simulées
   * @returns {string} - Titre de menu aléatoire
   */
  getRandomMenuTitle() {
    const menuTitles = [
      'Risotto aux Champignons',
      'Poulet Rôti aux Herbes',
      'Salade Niçoise',
      'Spaghetti Carbonara',
      'Buddha Bowl Végétarien',
      'Filet de Dorade Grillé',
      'Tartines Avocat & Saumon',
      'Bœuf Bourguignon',
      'Poké Bowl au Thon',
      'Tajine d\'Agneau',
      'Quiche Lorraine',
      'Entrecôte & Frites Maison',
      'Rôti de Bœuf & Gratin',
      'Lasagnes Maison'
    ];
    
    return menuTitles[Math.floor(Math.random() * menuTitles.length)];
  }
  
  /**
   * Formate une date au format YYYY-MM-DD
   * @param {Date} date - Date à formater
   * @returns {string} - Date formatée
   */
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Rafraîchit l'affichage du planning
   */
  refreshPlanningView() {
    const calendarDays = document.querySelectorAll('.calendar-day');
    
    if (calendarDays.length === 0) return;
    
    // Mettre à jour chaque jour du calendrier
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(this.currentWeekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = this.formatDate(currentDate);
      
      const dayElement = calendarDays[i];
      const dayHeader = dayElement.querySelector('.day-header');
      const dayContent = dayElement.querySelector('.day-content');
      const addMenuBtn = dayElement.querySelector('.add-menu-btn');
      
      // Mettre à jour l'en-tête du jour
      const dayNumber = dayHeader.querySelector('.day-number');
      dayNumber.textContent = `${currentDate.getDate()} ${currentDate.toLocaleString('fr-FR', { month: 'long' })}`;
      
      // Mettre à jour le bouton d'ajout de menu
      addMenuBtn.setAttribute('data-date', dateString);
      
      // Vider le contenu du jour
      dayContent.innerHTML = '';
      
      // Ajouter les menus pour ce jour
      if (this.weeklyPlan[dateString]) {
        this.weeklyPlan[dateString].forEach(menu => {
          const menuItem = document.createElement('div');
          menuItem.className = 'menu-item';
          menuItem.setAttribute('data-menu-id', menu.id);
          menuItem.innerHTML = `
            <span class="menu-time">${menu.time}</span>
            <div class="menu-title">${menu.title}</div>
            <div class="menu-guests">${menu.guests} couverts</div>
          `;
          
          menuItem.addEventListener('click', () => {
            this.showMenuDetails(menu.id);
          });
          
          dayContent.appendChild(menuItem);
        });
      }
    }
  }
  
  /**
   * Affiche une modal pour ajouter un menu
   * @param {string} date - Date au format YYYY-MM-DD
   */
  showAddMenuModal(date) {
    // Convertir la date au format local
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Créer la modal
    const modal = document.createElement('div');
    modal.className = 'modal add-menu-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="add-menu-content">
          <h2>Ajouter un Menu pour le ${formattedDate}</h2>
          
          <div class="form-group">
            <label for="menu-time">Heure du Service</label>
            <select id="menu-time">
              <option value="12:00">Service du Midi (12:00)</option>
              <option value="19:00">Service du Soir (19:00)</option>
              <option value="other">Autre horaire</option>
            </select>
          </div>
          
          <div class="form-group" id="custom-time-group" style="display: none;">
            <label for="custom-time">Horaire Personnalisé</label>
            <input type="time" id="custom-time">
          </div>
          
          <div class="form-group">
            <label for="menu-guests">Nombre de Couverts Prévus</label>
            <input type="number" id="menu-guests" min="1" value="40">
          </div>
          
          <div class="form-group">
            <label>Sélection du Menu</label>
            <div class="menu-selection-options">
              <button id="generate-new-menu" class="btn-primary">Générer un Nouveau Menu</button>
              <button id="select-existing-menu" class="btn-primary">Sélectionner un Menu Existant</button>
            </div>
          </div>
          
          <div id="menu-generation-options" style="display: none;">
            <h3>Génération d'un Nouveau Menu</h3>
            <div class="form-group">
              <label for="cuisine-type">Type de Cuisine</label>
              <select id="cuisine-type">
                <option value="">Tous les types</option>
                <option value="italian">Italienne</option>
                <option value="french">Française</option>
                <option value="mediterranean">Méditerranéenne</option>
                <option value="asian">Asiatique</option>
                <option value="mexican">Mexicaine</option>
                <option value="american">Américaine</option>
              </select>
            </div>
            <div class="form-group">
              <label for="diet">Régime Alimentaire</label>
              <select id="diet">
                <option value="">Aucun régime spécifique</option>
                <option value="vegetarian">Végétarien</option>
                <option value="vegan">Végétalien</option>
                <option value="gluten free">Sans Gluten</option>
                <option value="dairy free">Sans Produits Laitiers</option>
              </select>
            </div>
            <div class="form-group">
              <label for="optimize">Optimiser pour</label>
              <select id="optimize">
                <option value="expiry">Péremption imminente</option>
                <option value="cost">Coût minimal</option>
                <option value="balance">Menu équilibré</option>
                <option value="profit">Rentabilité maximale</option>
              </select>
            </div>
            <button id="generate-menu-btn" class="btn-success">Générer des Suggestions</button>
            
            <div id="generated-menus-container" style="display: none;">
              <h3>Menus Suggérés</h3>
              <div id="generated-menus-list" class="generated-menus-list">
                <!-- Les menus générés seront affichés ici -->
              </div>
            </div>
          </div>
          
          <div id="existing-menus-container" style="display: none;">
            <h3>Sélectionner un Menu Existant</h3>
            <div class="form-group">
              <label for="search-existing">Rechercher</label>
              <input type="text" id="search-existing" placeholder="Rechercher un menu...">
            </div>
            <div id="existing-menus-list" class="existing-menus-list">
              <!-- Les menus existants seront affichés ici -->
            </div>
          </div>
          
          <div id="selected-menu-container" style="display: none;">
            <h3>Menu Sélectionné</h3>
            <div id="selected-menu" class="selected-menu">
              <!-- Le menu sélectionné sera affiché ici -->
            </div>
          </div>
          
          <div class="modal-actions">
            <button id="cancel-add-menu" class="btn-secondary">Annuler</button>
            <button id="confirm-add-menu" class="btn-success" disabled>Ajouter ce Menu</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Gérer les interactions avec la modal
    const menuTimeSelect = modal.querySelector('#menu-time');
    const customTimeGroup = modal.querySelector('#custom-time-group');
    const generateNewMenuBtn = modal.querySelector('#generate-new-menu');
    const selectExistingMenuBtn = modal.querySelector('#select-existing-menu');
    const menuGenerationOptions = modal.querySelector('#menu-generation-options');
    const existingMenusContainer = modal.querySelector('#existing-menus-container');
    const generateMenuBtn = modal.querySelector('#generate-menu-btn');
    const generatedMenusContainer = modal.querySelector('#generated-menus-container');
    const selectedMenuContainer = modal.querySelector('#selected-menu-container');
    const cancelBtn = modal.querySelector('#cancel-add-menu');
    const confirmBtn = modal.querySelector('#confirm-add-menu');
    
    // Gestion de l'horaire personnalisé
    menuTimeSelect.addEventListener('change', () => {
      if (menuTimeSelect.value === 'other') {
        customTimeGroup.style.display = 'block';
      } else {
        customTimeGroup.style.display = 'none';
      }
    });
    
    // Gestion des options de sélection de menu
    generateNewMenuBtn.addEventListener('click', () => {
      menuGenerationOptions.style.display = 'block';
      existingMenusContainer.style.display = 'none';
      generateNewMenuBtn.classList.add('active');
      selectExistingMenuBtn.classList.remove('active');
    });
    
    selectExistingMenuBtn.addEventListener('click', () => {
      menuGenerationOptions.style.display = 'none';
      existingMenusContainer.style.display = 'block';
      generateNewMenuBtn.classList.remove('active');
      selectExistingMenuBtn.classList.add('active');
      
      // Charger les menus existants
      this.loadExistingMenus(modal.querySelector('#existing-menus-list'));
    });
    
    // Gestion de la génération de menus
    generateMenuBtn.addEventListener('click', () => {
      // Simuler la génération de menus
      generatedMenusContainer.style.display = 'block';
      generateMenuBtn.disabled = true;
      generateMenuBtn.innerHTML = 'Génération en cours...';
      
      setTimeout(() => {
        this.generateMenuSuggestions(modal.querySelector('#generated-menus-list'));
        generateMenuBtn.disabled = false;
        generateMenuBtn.innerHTML = 'Générer des Suggestions';
      }, 1000);
    });
    
    // Gestion des boutons d'annulation et de confirmation
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    confirmBtn.addEventListener('click', () => {
      const selectedMenuId = modal.querySelector('#selected-menu').getAttribute('data-menu-id');
      const menuTime = menuTimeSelect.value === 'other' ? 
        modal.querySelector('#custom-time').value : 
        menuTimeSelect.value;
      const menuGuests = modal.querySelector('#menu-guests').value;
      
      // Ajouter le menu au planning
      this.addMenuToPlan(date, selectedMenuId, menuTime, menuGuests);
      
      // Fermer la modal
      document.body.removeChild(modal);
    });
  }
  
  /**
   * Charge les menus existants dans la modal
   * @param {HTMLElement} container - Conteneur pour afficher les menus existants
   */
  loadExistingMenus(container) {
    // Simuler le chargement des menus existants
    const existingMenus = [
      { id: 2001, title: 'Risotto aux Champignons', image: '/api/placeholder/80/80' },
      { id: 2002, title: 'Poulet Rôti aux Herbes', image: '/api/placeholder/80/80' },
      { id: 2003, title: 'Salade Niçoise', image: '/api/placeholder/80/80' },
      { id: 2004, title: 'Spaghetti Carbonara', image: '/api/placeholder/80/80' },
      { id: 2005, title: 'Buddha Bowl Végétarien', image: '/api/placeholder/80/80' }
    ];
    
    let menuListHTML = '';
    
    existingMenus.forEach(menu => {
      menuListHTML += `
        <div class="existing-menu-item" data-menu-id="${menu.id}">
          <img src="${menu.image}" alt="${menu.title}" class="menu-thumbnail">
          <div class="existing-menu-title">${menu.title}</div>
        </div>
      `;
    });
    
    container.innerHTML = menuListHTML;
    
    // Ajouter les gestionnaires d'événements pour la sélection des menus
    container.querySelectorAll('.existing-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        const menuId = item.getAttribute('data-menu-id');
        const menuTitle = item.querySelector('.existing-menu-title').textContent;
        const menuImage = item.querySelector('.menu-thumbnail').src;
        
        this.selectMenu(menuId, menuTitle, menuImage);
      });
    });
  }
  
  /**
   * Génère des suggestions de menus dans la modal
   * @param {HTMLElement} container - Conteneur pour afficher les menus générés
   */
  generateMenuSuggestions(container) {
    // Simuler la génération de menus
    const generatedMenus = [
      { id: 3001, title: 'Filet de Saumon aux Herbes', image: '/api/placeholder/80/80', ingredients: 'Saumon, Herbes, Citron', cookTime: 35 },
      { id: 3002, title: 'Gratin de Courgettes', image: '/api/placeholder/80/80', ingredients: 'Courgettes, Fromage, Crème', cookTime: 40 },
      { id: 3003, title: 'Pâtes aux Légumes de Saison', image: '/api/placeholder/80/80', ingredients: 'Pâtes, Légumes variés, Huile d\'olive', cookTime: 25 }
    ];
    
    let menuListHTML = '';
    
    generatedMenus.forEach(menu => {
      menuListHTML += `
        <div class="generated-menu-item" data-menu-id="${menu.id}">
          <img src="${menu.image}" alt="${menu.title}" class="menu-thumbnail">
          <div class="generated-menu-info">
            <div class="generated-menu-title">${menu.title}</div>
            <div class="generated-menu-details">
              <span>⏱️ ${menu.cookTime} min</span>
              <span>🥗 ${menu.ingredients}</span>
            </div>
          </div>
          <button class="select-menu-btn btn-primary">Sélectionner</button>
        </div>
      `;
    });
    
    container.innerHTML = menuListHTML;
    
    // Ajouter les gestionnaires d'événements pour la sélection des menus
    container.querySelectorAll('.select-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const menuItem = e.target.closest('.generated-menu-item');
        const menuId = menuItem.getAttribute('data-menu-id');
        const menuTitle = menuItem.querySelector('.generated-menu-title').textContent;
        const menuImage = menuItem.querySelector('.menu-thumbnail').src;
        
        this.selectMenu(menuId, menuTitle, menuImage);
      });
    });
  }
  
  /**
   * Sélectionne un menu dans la modal
   * @param {string} menuId - Identifiant du menu
   * @param {string} menuTitle - Titre du menu
   * @param {string} menuImage - URL de l'image du menu
   */
  selectMenu(menuId, menuTitle, menuImage) {
    const selectedMenuContainer = document.getElementById('selected-menu-container');
    const selectedMenu = document.getElementById('selected-menu');
    const confirmBtn = document.getElementById('confirm-add-menu');
    
    if (selectedMenuContainer && selectedMenu && confirmBtn) {
      selectedMenu.innerHTML = `
        <div class="selected-menu-item" data-menu-id="${menuId}">
          <img src="${menuImage}" alt="${menuTitle}" class="selected-menu-thumbnail">
          <div class="selected-menu-title">${menuTitle}</div>
        </div>
      `;
      
      selectedMenu.setAttribute('data-menu-id', menuId);
      selectedMenuContainer.style.display = 'block';
      confirmBtn.disabled = false;
    }
  }
  
  /**
   * Ajoute un menu au planning
   * @param {string} date - Date au format YYYY-MM-DD
   * @param {string} menuId - Identifiant du menu
   * @param {string} time - Heure du service
   * @param {number} guests - Nombre de convives
   */
  addMenuToPlan(date, menuId, time, guests) {
    // Récupérer les détails du menu (ici simulé)
    const menuDetails = {
      id: menuId,
      title: this.getMenuTitle(menuId),
      time: time,
      guests: parseInt(guests),
      image: '/api/placeholder/160/160'
    };
    
    // Ajouter le menu au planning
    if (!this.weeklyPlan[date]) {
      this.weeklyPlan[date] = [];
    }
    
    // Vérifier si un menu existe déjà à cette heure
    const existingMenuIndex = this.weeklyPlan[date].findIndex(menu => menu.time === time);
    
    if (existingMenuIndex !== -1) {
      // Remplacer le menu existant
      this.weeklyPlan[date][existingMenuIndex] = menuDetails;
    } else {
      // Ajouter un nouveau menu
      this.weeklyPlan[date].push(menuDetails);
      
      // Trier les menus par heure
      this.weeklyPlan[date].sort((a, b) => a.time.localeCompare(b.time));
    }
    
    // Dans une implémentation réelle, on sauvegarderait les modifications
    // chaifSesApi.updateWeeklyPlan(this.weeklyPlan)
    
    // Rafraîchir l'affichage
    this.refreshPlanningView();
    
    // Afficher un message de confirmation
    this.showToast(`Menu ${menuDetails.title} ajouté pour le ${date} à ${time}`, 'success');
  }
  
  /**
   * Récupère le titre d'un menu à partir de son identifiant
   * @param {string} menuId - Identifiant du menu
   * @returns {string} - Titre du menu
   */
  getMenuTitle(menuId) {
    // Simuler la récupération du titre du menu
    const menuTitles = {
      '2001': 'Risotto aux Champignons',
      '2002': 'Poulet Rôti aux Herbes',
      '2003': 'Salade Niçoise',
      '2004': 'Spaghetti Carbonara',
      '2005': 'Buddha Bowl Végétarien',
      '3001': 'Filet de Saumon aux Herbes',
      '3002': 'Gratin de Courgettes',
      '3003': 'Pâtes aux Légumes de Saison'
    };
    
    return menuTitles[menuId] || 'Menu sans titre';
  }
  
  /**
   * Affiche les détails d'un menu
   * @param {string} menuId - Identifiant du menu
   */
  showMenuDetails(menuId) {
    // Simuler la récupération des détails du menu
    const menu = this.getMenuDetails(menuId);
    
    if (!menu) {
      this.showToast('Menu non trouvé', 'error');
      return;
    }
    
    // Créer la modal
    const modal = document.createElement('div');
    modal.className = 'modal menu-details-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="menu-details-content">
          <h2>${menu.title}</h2>
          
          <div class="menu-details-header">
            <img src="${menu.image}" alt="${menu.title}" class="menu-details-image">
            <div class="menu-details-info">
              <div class="menu-details-meta">
                <span>⏱️ ${menu.cookTime || '45'} min</span>
                <span>👤 ${menu.guests || '4'} personnes</span>
                <span>📅 ${menu.date || 'Non planifié'}</span>
                ${menu.time ? `<span>⌚ ${menu.time}</span>` : ''}
              </div>
              
              <div class="menu-details-description">
                ${menu.description || 'Aucune description disponible.'}
              </div>
            </div>
          </div>
          
          <div class="menu-details-ingredients">
            <h3>Ingrédients</h3>
            <ul>
              ${menu.ingredients ? menu.ingredients.map(ingredient => 
                `<li>${ingredient.amount} ${ingredient.unit} de ${ingredient.name}</li>`
              ).join('') : '<li>Aucun ingrédient disponible</li>'}
            </ul>
          </div>
          
          <div class="menu-details-instructions">
            <h3>Instructions</h3>
            <div class="instructions-text">
              ${menu.instructions || 'Aucune instruction disponible.'}
            </div>
          </div>
          
          <div class="modal-actions">
            <button id="edit-menu-btn" class="btn-primary">Modifier</button>
            <button id="remove-menu-btn" class="btn-danger">Supprimer</button>
            <button id="close-details-btn" class="btn-secondary">Fermer</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Gérer les interactions avec la modal
    const closeBtn = modal.querySelector('#close-details-btn');
    const editBtn = modal.querySelector('#edit-menu-btn');
    const removeBtn = modal.querySelector('#remove-menu-btn');
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    editBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
      this.editMenu(menuId);
    });
    
    removeBtn.addEventListener('click', () => {
      if (confirm(`Êtes-vous sûr de vouloir supprimer le menu "${menu.title}" ?`)) {
        this.removeMenu(menuId, menu.date);
        document.body.removeChild(modal);
      }
    });
  }
  
  /**
   * Récupère les détails d'un menu
   * @param {string} menuId - Identifiant du menu
   * @returns {Object|null} - Détails du menu ou null si non trouvé
   */
  getMenuDetails(menuId) {
    // Chercher le menu dans le planning de la semaine
    for (const date in this.weeklyPlan) {
      const menu = this.weeklyPlan[date].find(m => m.id == menuId);
      if (menu) {
        return {
          ...menu,
          date: date
        };
      }
    }
    
    // Simuler la récupération des détails du menu depuis l'API
    return {
      id: menuId,
      title: this.getMenuTitle(menuId),
      image: '/api/placeholder/400/200',
      cookTime: 45,
      description: 'Un délicieux plat préparé avec des ingrédients frais et de saison.',
      ingredients: [
        { name: 'Ingrédient 1', amount: 200, unit: 'g' },
        { name: 'Ingrédient 2', amount: 3, unit: 'cuillères à soupe' },
        { name: 'Ingrédient 3', amount: 1, unit: 'pincée' }
      ],
      instructions: '1. Préparer les ingrédients.\n2. Cuire selon les instructions.\n3. Servir chaud et déguster.'
    };
  }
  
  /**
   * Modifie un menu existant
   * @param {string} menuId - Identifiant du menu
   */
  editMenu(menuId) {
    // Simuler la modification d'un menu
    this.showToast('Fonctionnalité de modification en cours de développement', 'info');
  }
  
  /**
   * Supprime un menu du planning
   * @param {string} menuId - Identifiant du menu
   * @param {string} date - Date du menu (optionnel)
   */
  removeMenu(menuId, date) {
    if (date && this.weeklyPlan[date]) {
      // Supprimer le menu spécifique
      this.weeklyPlan[date] = this.weeklyPlan[date].filter(menu => menu.id != menuId);
      
      // Dans une implémentation réelle, on sauvegarderait les modifications
      // chaifSesApi.updateWeeklyPlan(this.weeklyPlan)
      
      // Rafraîchir l'affichage
      this.refreshPlanningView();
      
      this.showToast('Menu supprimé avec succès', 'success');
    } else {
      // Chercher le menu dans tout le planning
      for (const d in this.weeklyPlan) {
        const index = this.weeklyPlan[d].findIndex(menu => menu.id == menuId);
        if (index !== -1) {
          this.weeklyPlan[d].splice(index, 1);
          
          // Dans une implémentation réelle, on sauvegarderait les modifications
          // chaifSesApi.updateWeeklyPlan(this.weeklyPlan)
          
          // Rafraîchir l'affichage
          this.refreshPlanningView();
          
          this.showToast('Menu supprimé avec succès', 'success');
          return;
        }
      }
      
      this.showToast('Menu non trouvé dans le planning', 'error');
    }
  }
  
  /**
   * Génère automatiquement un planning hebdomadaire
   */
  generateWeeklyPlan() {
    // Afficher un indicateur de chargement
    this.showToast('Génération du planning en cours...', 'info', false);
    
    // Simuler la génération du planning
    setTimeout(() => {
      // Générer un nouveau planning
      this.weeklyPlan = this.getMockWeeklyPlan();
      
      // Dans une implémentation réelle, on sauvegarderait les modifications
      // chaifSesApi.updateWeeklyPlan(this.weeklyPlan)
      
      // Rafraîchir l'affichage
      this.refreshPlanningView();
      
      this.hideToasts();
      this.showToast('Planning hebdomadaire généré avec succès', 'success');
    }, 2000);
  }
  
  /**
   * Exporte le planning au format CSV
   */
  exportPlanning() {
    let csvContent = 'Date,Jour,Heure,Menu,Couverts\n';
    
    // Construire le contenu CSV
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(this.currentWeekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = this.formatDate(currentDate);
      const dayName = currentDate.toLocaleDateString('fr-FR', { weekday: 'long' });
      
      if (this.weeklyPlan[dateString]) {
        this.weeklyPlan[dateString].forEach(menu => {
          csvContent += `${dateString},${dayName},${menu.time},"${menu.title}",${menu.guests}\n`;
        });
      }
    }
    
    // Créer un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `planning_${this.formatDate(this.currentWeekStart)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    this.showToast('Planning exporté avec succès', 'success');
  }
  
  /**
   * Imprime le planning hebdomadaire
   */
  printPlanning() {
    const printWindow = window.open('', '_blank');
    
    // Construire le contenu HTML pour l'impression
    let printContent = `
      <html>
        <head>
          <title>Planning Hebdomadaire - Semaine du ${this.currentWeekStart.toLocaleDateString('fr-FR')}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
            .menu-time { font-weight: bold; }
            .menu-guests { color: #666; font-size: 0.9em; }
            @media print {
              body { font-size: 12pt; }
              h1 { font-size: 18pt; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Planning Hebdomadaire - Semaine du ${this.currentWeekStart.toLocaleDateString('fr-FR')}</h1>
          
          <table>
            <thead>
              <tr>
                <th>Jour</th>
                <th>Date</th>
                <th>Service du Midi</th>
                <th>Service du Soir</th>
              </tr>
            </thead>
            <tbody>
    `;
    
    // Ajouter chaque jour du planning
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(this.currentWeekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateString = this.formatDate(currentDate);
      const dayName = currentDate.toLocaleDateString('fr-FR', { weekday: 'long' });
      const formattedDate = currentDate.toLocaleDateString('fr-FR');
      
      let lunchMenu = '—';
      let dinnerMenu = '—';
      
      if (this.weeklyPlan[dateString]) {
        this.weeklyPlan[dateString].forEach(menu => {
          const menuHTML = `
            <div>
              <div class="menu-title">${menu.title}</div>
              <div class="menu-guests">${menu.guests} couverts</div>
            </div>
          `;
          
          if (menu.time === '12:00') {
            lunchMenu = menuHTML;
          } else if (menu.time === '19:00') {
            dinnerMenu = menuHTML;
          }
        });
      }
      
      printContent += `
        <tr>
          <td>${dayName}</td>
          <td>${formattedDate}</td>
          <td>${lunchMenu}</td>
          <td>${dinnerMenu}</td>
        </tr>
      `;
    }
    
    printContent += `
            </tbody>
          </table>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()">Imprimer</button>
            <button onclick="window.close()">Fermer</button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  }
  
  /**
   * Charge les données d'historique des menus
   */
  loadHistoryData() {
    try {
      // Dans une implémentation réelle, on récupérerait les données depuis l'API
      // this.menuHistory = await chaifSesApi.getMenuHistory()
      
      // Pour cette démo, on utilise des données statiques
      this.menuHistory = this.getMockHistoryData();
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'historique:', error);
      this.menuHistory = [];
    }
  }
  
  /**
   * Génère des données d'historique simulées
   * @returns {Array} - Données d'historique simulées
   */
  getMockHistoryData() {
    const history = [];
    const today = new Date();
    
    // Générer 20 entrées d'historique
    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      history.push({
        id: 2000 + i,
        title: this.getRandomMenuTitle(),
        date: this.formatDate(date),
        time: i % 2 === 0 ? '12:00' : '19:00',
        guests: Math.floor(Math.random() * 30) + 30,
        image: '/api/placeholder/160/160',
        description: 'Un délicieux plat préparé avec des ingrédients frais et de saison.'
      });
    }
    
    return history;
  }
  
  /**
   * Rafraîchit l'affichage de l'historique
   */
  refreshHistoryView() {
    const historyList = document.querySelector('.history-list');
    
    if (!historyList) return;
    
    // Filtrer l'historique selon les critères
    const filteredHistory = this.filterHistoryData();
    
    if (filteredHistory.length === 0) {
      historyList.innerHTML = `
        <div class="empty-message">
          <h3>Aucun menu trouvé</h3>
          <p>Modifiez vos critères de recherche pour voir plus de résultats.</p>
        </div>
      `;
      return;
    }
    
    // Préparer le contenu HTML
    let historyHTML = '';
    
    filteredHistory.forEach(menu => {
      const menuDate = new Date(menu.date);
      const formattedDate = menuDate.toLocaleDateString('fr-FR');
      const serviceTime = menu.time === '12:00' ? 'Service du midi' : 'Service du soir';
      
      historyHTML += `
        <div class="history-item" data-menu-id="${menu.id}">
          <img src="${menu.image}" alt="${menu.title}" class="history-image">
          <div class="history-content">
            <h3 class="history-title">${menu.title}</h3>
            <div class="history-meta">
              <span>📅 ${formattedDate}</span>
              <span>👤 ${menu.guests} couverts</span>
              <span>⏱️ ${serviceTime}</span>
            </div>
            <p>${menu.description || 'Aucune description disponible.'}</p>
          </div>
          <div class="history-actions">
            <button class="btn-primary view-menu-btn">Voir la recette</button>
            <button class="btn-success reuse-menu-btn">Réutiliser</button>
          </div>
        </div>
      `;
    });
    
    historyList.innerHTML = historyHTML;
    
    // Ajouter les gestionnaires d'événements
    historyList.querySelectorAll('.view-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuId = e.target.closest('.history-item').getAttribute('data-menu-id');
        this.showMenuDetails(menuId);
      });
    });
    
    historyList.querySelectorAll('.reuse-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuId = e.target.closest('.history-item').getAttribute('data-menu-id');
        this.reuseMenu(menuId);
      });
    });
    
    historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', () => {
        const menuId = item.getAttribute('data-menu-id');
        this.showMenuDetails(menuId);
      });
    });
  }
  
  /**
   * Filtre les données d'historique selon les critères de recherche
   * @returns {Array} - Données d'historique filtrées
   */
  filterHistoryData() {
    const searchTerm = document.getElementById('history-search')?.value.toLowerCase() || '';
    const period = document.getElementById('history-period')?.value || 'all';
    const sort = document.getElementById('history-sort')?.value || 'date-desc';
    
    // Filtrer par terme de recherche
    let filtered = this.menuHistory.filter(menu => 
      menu.title.toLowerCase().includes(searchTerm) || 
      (menu.description && menu.description.toLowerCase().includes(searchTerm))
    );
    
    // Filtrer par période
    const today = new Date();
    
    if (period === 'week') {
      // Cette semaine
      const weekStart = new Date(this.currentWeekStart);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      filtered = filtered.filter(menu => {
        const menuDate = new Date(menu.date);
        return menuDate >= weekStart && menuDate <= weekEnd;
      });
    } else if (period === 'month') {
      // Ce mois-ci
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      filtered = filtered.filter(menu => {
        const menuDate = new Date(menu.date);
        return menuDate >= monthStart && menuDate <= monthEnd;
      });
    } else if (period === 'quarter') {
      // Ce trimestre
      const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
      const quarterEnd = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0);
      
      filtered = filtered.filter(menu => {
        const menuDate = new Date(menu.date);
        return menuDate >= quarterStart && menuDate <= quarterEnd;
      });
    }
    
    // Trier les résultats
    if (sort === 'date-desc') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === 'date-asc') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sort === 'guests-desc') {
      filtered.sort((a, b) => b.guests - a.guests);
    } else if (sort === 'guests-asc') {
      filtered.sort((a, b) => a.guests - b.guests);
    }
    
    return filtered;
  }
  
  /**
   * Filtre l'historique des menus
   */
  filterHistory() {
    this.refreshHistoryView();
  }
  
  /**
   * Change la page dans l'historique des menus
   * @param {string} page - Numéro de page ou action de pagination
   */
  changePage(page) {
    // Simuler le changement de page
    console.log('Changement de page:', page);
    this.refreshHistoryView();
  }
  
  /**
   * Réutilise un menu existant
   * @param {string} menuId - Identifiant du menu à réutiliser
   */
  reuseMenu(menuId) {
    // Demander la date et l'heure pour réutiliser le menu
    const today = new Date();
    const formattedToday = this.formatDate(today);
    
    // Créer une modal pour sélectionner la date et l'heure
    const modal = document.createElement('div');
    modal.className = 'modal reuse-menu-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="reuse-menu-content">
          <h2>Réutiliser le Menu</h2>
          
          <div class="menu-preview">
            <img src="/api/placeholder/80/80" alt="${this.getMenuTitle(menuId)}" class="menu-preview-image">
            <div class="menu-preview-title">${this.getMenuTitle(menuId)}</div>
          </div>
          
          <div class="form-group">
            <label for="reuse-date">Date</label>
            <input type="date" id="reuse-date" value="${formattedToday}" min="${formattedToday}">
          </div>
          
          <div class="form-group">
            <label for="reuse-time">Heure du Service</label>
            <select id="reuse-time">
              <option value="12:00">Service du Midi (12:00)</option>
              <option value="19:00">Service du Soir (19:00)</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="reuse-guests">Nombre de Couverts</label>
            <input type="number" id="reuse-guests" min="1" value="40">
          </div>
          
          <div class="modal-actions">
            <button id="cancel-reuse" class="btn-secondary">Annuler</button>
            <button id="confirm-reuse" class="btn-success">Réutiliser ce Menu</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Gérer les interactions avec la modal
    const cancelBtn = modal.querySelector('#cancel-reuse');
    const confirmBtn = modal.querySelector('#confirm-reuse');
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    confirmBtn.addEventListener('click', () => {
      const date = modal.querySelector('#reuse-date').value;
      const time = modal.querySelector('#reuse-time').value;
      const guests = modal.querySelector('#reuse-guests').value;
      
      // Ajouter le menu au planning
      this.addMenuToPlan(date, menuId, time, guests);
      
      // Fermer la modal
      document.body.removeChild(modal);
    });
  }
  
  /**
   * Charge les données de statistiques d'utilisation
   */
  loadStatsData() {
    try {
      // Dans une implémentation réelle, on récupérerait les données depuis l'API
      // this.statsData = await chaifSesApi.getMenuStats()
      
      // Pour cette démo, on utilise des données statiques
      this.statsData = {
        totalMenus: 42,
        totalGuests: 1250,
        averageRating: 8.2,
        costSaving: 32,
        
        menuCategories: [
          { name: 'Italienne', count: 12 },
          { name: 'Française', count: 15 },
          { name: 'Asiatique', count: 8 },
          { name: 'Méditerranéenne', count: 5 },
          { name: 'Américaine', count: 2 }
        ],
        
        topIngredients: [
          { name: 'Poulet', count: 18 },
          { name: 'Tomates', count: 15 },
          { name: 'Oignons', count: 14 },
          { name: 'Ail', count: 12 },
          { name: 'Riz', count: 10 },
          { name: 'Pommes de terre', count: 9 },
          { name: 'Parmesan', count: 8 },
          { name: 'Champignons', count: 7 },
          { name: 'Basilic', count: 6 },
          { name: 'Fromage', count: 5 }
        ]
      };
    } catch (error) {
      console.error('Erreur lors du chargement des données de statistiques:', error);
      this.statsData = {};
    }
  }
  
  /**
   * Initialise les graphiques dans l'onglet statistiques
   */
  initCharts() {
    console.log('Initialisation des graphiques');
    
    // Dans une implémentation réelle, on utiliserait une bibliothèque comme Chart.js
    document.getElementById('menu-usage-chart').innerHTML = `
      <div style="text-align: center; padding: 50px;">
        <p>Graphique des catégories de menus</p>
        <p style="color: #999;">Utilisez Chart.js ou une autre bibliothèque pour afficher les graphiques</p>
      </div>
    `;
    
    document.getElementById('ingredients-usage-chart').innerHTML = `
      <div style="text-align: center; padding: 50px;">
        <p>Graphique des ingrédients les plus utilisés</p>
        <p style="color: #999;">Utilisez Chart.js ou une autre bibliothèque pour afficher les graphiques</p>
      </div>
    `;
  }
  
  /**
   * Met à jour les graphiques selon la période sélectionnée
   */
  updateCharts() {
    const period = document.getElementById('chart-period').value;
    console.log('Mise à jour des graphiques pour la période:', period);
    
    // Dans une implémentation réelle, on mettrait à jour les graphiques avec de nouvelles données
    this.initCharts();
  }
  
  /**
   * Met à jour le graphique des ingrédients selon la période sélectionnée
   */
  updateIngredientsChart() {
    const period = document.getElementById('ingredients-period').value;
    console.log('Mise à jour du graphique des ingrédients pour la période:', period);
    
    // Dans une implémentation réelle, on mettrait à jour le graphique avec de nouvelles données
  }
  
  /**
   * Affiche un toast (notification)
   * @param {string} message - Message à afficher
   * @param {string} type - Type de toast (success, error, warning, info)
   * @param {boolean} autoHide - Si le toast doit se masquer automatiquement
   * @returns {HTMLElement} - Élément DOM du toast
   */
  showToast(message, type = 'info', autoHide = true) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${message}</span>
        ${autoHide ? '' : '<div class="spinner-small"></div>'}
      </div>
    `;
    
    // Ajouter le toast au conteneur (ou le créer s'il n'existe pas)
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }
    
    toastContainer.appendChild(toast);
    
    // Masquer automatiquement après 3 secondes si autoHide est activé
    if (autoHide) {
      setTimeout(() => {
        this.hideToast(toast);
      }, 3000);
    }
    
    return toast;
  }
  
  /**
   * Masque un toast
   * @param {HTMLElement} toast - Élément DOM du toast à masquer
   */
  hideToast(toast) {
    if (!toast) return;
    
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      
      // Supprimer le conteneur s'il est vide
      const toastContainer = document.querySelector('.toast-container');
      if (toastContainer && toastContainer.children.length === 0) {
        document.body.removeChild(toastContainer);
      }
    }, 300);
  }
  
  /**
 * Méthodes complémentaires pour la classe MenuPlanner
 * 
 * Ces méthodes viennent enrichir les fonctionnalités de planification des menus
 */

// Méthodes à ajouter à la classe MenuPlanner après la méthode updateIngredientsChart()

/**
 * Recherche des menus dans l'historique ou les recettes disponibles
 * @param {string} query - Terme de recherche
 * @param {string} filter - Filtre de recherche (all, vegetarian, gluten-free, etc.)
 * @returns {Array} - Liste des menus correspondants
 */
searchMenus(query, filter = 'all') {
  // Dans une implémentation réelle, on interrogerait l'API
  // return chaifSesApi.searchMenus(query, filter);
  
  // Pour cette démo, on filtre les menus existants
  const searchTerm = query.toLowerCase();
  let results = [];
  
  // Rechercher dans l'historique
  results = this.menuHistory.filter(menu => 
    menu.title.toLowerCase().includes(searchTerm) || 
    (menu.description && menu.description.toLowerCase().includes(searchTerm))
  );
  
  // Appliquer les filtres supplémentaires
  if (filter !== 'all') {
    // Simuler l'application de filtres
    // Dans une implémentation réelle, cela serait basé sur des attributs du menu
    results = results.slice(0, Math.floor(results.length / 2));
  }
  
  // Limiter à 20 résultats pour de meilleures performances
  return results.slice(0, 20);
}

/**
 * Génère un menu en fonction des contraintes spécifiées
 * @param {Object} constraints - Contraintes pour la génération du menu
 * @returns {Object} - Menu généré
 */
generateMenu(constraints) {
  // Dans une implémentation réelle, on utiliserait l'API Spoonacular ou un modèle IA
  // return chaifSesApi.generateMenu(constraints);
  
  // Pour cette démo, on génère un menu aléatoire
  const menuId = 3000 + Math.floor(Math.random() * 1000);
  
  // Construire un titre adapté aux contraintes
  let title = this.getRandomMenuTitle();
  if (constraints.cuisine) {
    const cuisineTypes = {
      'italian': 'Italien',
      'french': 'Français',
      'mediterranean': 'Méditerranéen',
      'asian': 'Asiatique',
      'mexican': 'Mexicain',
      'american': 'Américain'
    };
    
    // Préfixer avec le type de cuisine
    if (cuisineTypes[constraints.cuisine]) {
      title = `${title} (${cuisineTypes[constraints.cuisine]})`;
    }
  }
  
  if (constraints.diet) {
    const dietLabels = {
      'vegetarian': '🌱 Végétarien',
      'vegan': '🌱 Végétalien',
      'gluten free': '🌾 Sans Gluten',
      'dairy free': '🥛 Sans Lactose'
    };
    
    // Ajouter le label de régime
    if (dietLabels[constraints.diet]) {
      title = `${dietLabels[constraints.diet]} - ${title}`;
    }
  }
  
  // Générer un objet menu
  return {
    id: menuId,
    title: title,
    cookTime: Math.floor(Math.random() * 40) + 20, // 20-60 minutes
    image: '/api/placeholder/400/200',
    description: 'Un délicieux plat préparé avec des ingrédients frais et de saison.',
    ingredients: this.generateRandomIngredients(),
    instructions: this.generateRandomInstructions(),
    nutritionalValues: this.generateNutritionalValues(),
    cost: Math.floor(Math.random() * 600) + 200, // 200-800 centimes par portion
    created: new Date().toISOString()
  };
}

/**
 * Génère une liste aléatoire d'ingrédients
 * @returns {Array} - Liste des ingrédients
 */
generateRandomIngredients() {
  const allIngredients = [
    { name: 'Poulet', unit: 'g', minAmount: 100, maxAmount: 300 },
    { name: 'Bœuf', unit: 'g', minAmount: 150, maxAmount: 350 },
    { name: 'Poisson', unit: 'g', minAmount: 100, maxAmount: 250 },
    { name: 'Riz', unit: 'g', minAmount: 50, maxAmount: 150 },
    { name: 'Pâtes', unit: 'g', minAmount: 70, maxAmount: 180 },
    { name: 'Pommes de terre', unit: 'g', minAmount: 100, maxAmount: 300 },
    { name: 'Carottes', unit: 'g', minAmount: 50, maxAmount: 150 },
    { name: 'Courgettes', unit: 'g', minAmount: 100, maxAmount: 200 },
    { name: 'Tomates', unit: 'g', minAmount: 100, maxAmount: 300 },
    { name: 'Oignons', unit: '', minAmount: 1, maxAmount: 3 },
    { name: 'Ail', unit: 'gousses', minAmount: 1, maxAmount: 5 },
    { name: 'Huile d\'olive', unit: 'ml', minAmount: 10, maxAmount: 50 },
    { name: 'Sel', unit: 'pincée', minAmount: 1, maxAmount: 2 },
    { name: 'Poivre', unit: 'pincée', minAmount: 1, maxAmount: 2 },
    { name: 'Basilic', unit: 'g', minAmount: 5, maxAmount: 20 },
    { name: 'Persil', unit: 'g', minAmount: 5, maxAmount: 20 },
    { name: 'Fromage râpé', unit: 'g', minAmount: 20, maxAmount: 100 },
    { name: 'Crème fraîche', unit: 'ml', minAmount: 50, maxAmount: 200 },
    { name: 'Beurre', unit: 'g', minAmount: 10, maxAmount: 50 },
    { name: 'Citron', unit: '', minAmount: 1, maxAmount: 2 },
    { name: 'Bouillon', unit: 'ml', minAmount: 100, maxAmount: 500 }
  ];
  
  // Sélectionner un nombre aléatoire d'ingrédients (entre 5 et 10)
  const numIngredients = Math.floor(Math.random() * 6) + 5;
  const selectedIngredients = [];
  
  // Éviter les doublons
  const usedIndices = new Set();
  
  for (let i = 0; i < numIngredients; i++) {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * allIngredients.length);
    } while (usedIndices.has(randomIndex));
    
    usedIndices.add(randomIndex);
    const ingredient = allIngredients[randomIndex];
    
    // Générer une quantité aléatoire
    const amount = Math.floor(Math.random() * (ingredient.maxAmount - ingredient.minAmount + 1)) + ingredient.minAmount;
    
    selectedIngredients.push({
      name: ingredient.name,
      amount: amount,
      unit: ingredient.unit
    });
  }
  
  return selectedIngredients;
}

/**
 * Génère des instructions aléatoires pour un menu
 * @returns {string} - Instructions du menu
 */
generateRandomInstructions() {
  const steps = [
    'Préparer tous les ingrédients. Laver, éplucher et couper les légumes en morceaux.',
    'Dans une poêle (ou une casserole), faire chauffer l\'huile à feu moyen.',
    'Ajouter les oignons et l\'ail, faire revenir jusqu\'à ce qu\'ils soient translucides.',
    'Ajouter la viande et faire cuire jusqu\'à ce qu\'elle soit dorée de tous les côtés.',
    'Ajouter les légumes et mélanger. Laisser cuire 5 minutes en remuant régulièrement.',
    'Verser le bouillon (ou l\'eau), saler, poivrer et ajouter les herbes aromatiques.',
    'Couvrir et laisser mijoter à feu doux pendant 20 à 30 minutes.',
    'Pendant ce temps, préparer l\'accompagnement (riz, pâtes, pommes de terre).',
    'Une fois la cuisson terminée, vérifier l\'assaisonnement et ajuster si nécessaire.',
    'Servir chaud, accompagné de l\'accompagnement préparé. Décorer avec des herbes fraîches.',
    'Pour une version plus gourmande, ajouter de la crème fraîche ou du fromage râpé au moment de servir.'
  ];
  
  // Sélectionner un nombre aléatoire d'étapes (entre 5 et 8)
  const numSteps = Math.floor(Math.random() * 4) + 5;
  
  // Choisir des étapes aléatoires (mais dans l'ordre)
  let selectedIndices = Array.from(Array(steps.length).keys()).sort(() => Math.random() - 0.5).slice(0, numSteps);
  selectedIndices.sort((a, b) => a - b); // Trier pour maintenir l'ordre logique
  
  // Créer les instructions
  let instructions = '';
  selectedIndices.forEach((index, i) => {
    instructions += `${i + 1}. ${steps[index]}\n`;
  });
  
  return instructions;
}

/**
 * Génère des valeurs nutritionnelles aléatoires
 * @returns {Object} - Valeurs nutritionnelles
 */
generateNutritionalValues() {
  return {
    calories: Math.floor(Math.random() * 600) + 200, // 200-800 calories
    proteins: Math.floor(Math.random() * 30) + 10,   // 10-40g
    carbs: Math.floor(Math.random() * 80) + 20,      // 20-100g
    fats: Math.floor(Math.random() * 35) + 5,        // 5-40g
    fiber: Math.floor(Math.random() * 10) + 1,       // 1-11g
    salt: (Math.random() * 1.5 + 0.2).toFixed(1)     // 0.2-1.7g
  };
}

/**
 * Optimise un planning hebdomadaire selon des critères spécifiques
 * @param {string} criteria - Critère d'optimisation (cost, nutrition, variety, expiry)
 * @returns {Object} - Planning optimisé
 */
optimizeWeeklyPlan(criteria = 'variety') {
  this.showToast(`Optimisation du planning selon le critère: ${criteria}`, 'info', false);
  
  // Dans une implémentation réelle, on utiliserait un algorithme d'optimisation
  // et des données sur les stocks d'ingrédients, les préférences, etc.
  // return chaifSesApi.optimizeWeeklyPlan(this.currentWeekStart, criteria);
  
  // Pour cette démo, on génère simplement un nouveau planning
  setTimeout(() => {
    // Générer un nouveau planning
    this.weeklyPlan = this.getMockWeeklyPlan();
    
    // Rafraîchir l'affichage
    this.refreshPlanningView();
    
    this.hideToasts();
    this.showToast(`Planning optimisé selon le critère: ${criteria}`, 'success');
  }, 2000);
  
  return true;
}

/**
 * Analyse la saisonnalité des ingrédients dans un menu
 * @param {string} menuId - Identifiant du menu à analyser
 * @returns {Object} - Résultats de l'analyse
 */
analyzeMenuSeasonality(menuId) {
  // Dans une implémentation réelle, on interrogerait une base de données
  // de saisonnalité des ingrédients
  // return chaifSesApi.analyzeSeasonality(menuId);
  
  // Pour cette démo, on génère des résultats aléatoires
  const menu = this.getMenuDetails(menuId);
  
  if (!menu || !menu.ingredients) {
    return {
      seasonalScore: 0,
      seasonalIngredients: 0,
      outOfSeasonIngredients: 0,
      details: []
    };
  }
  
  // Déterminer la saison actuelle
  const currentMonth = new Date().getMonth();
  let currentSeason = 'hiver';
  
  if (currentMonth >= 2 && currentMonth <= 4) {
    currentSeason = 'printemps';
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    currentSeason = 'été';
  } else if (currentMonth >= 8 && currentMonth <= 10) {
    currentSeason = 'automne';
  }
  
  // Analyser chaque ingrédient
  const seasons = ['printemps', 'été', 'automne', 'hiver'];
  const details = menu.ingredients.map(ingredient => {
    // Attribuer une saison aléatoire à chaque ingrédient (ou toutes les saisons)
    const isSeasonless = Math.random() < 0.3; // 30% de chance que l'ingrédient soit disponible toute l'année
    const ingredientSeasons = isSeasonless ? seasons : [seasons[Math.floor(Math.random() * seasons.length)]];
    
    // Vérifier si l'ingrédient est de saison
    const isInSeason = isSeasonless || ingredientSeasons.includes(currentSeason);
    
    return {
      name: ingredient.name,
      inSeason: isInSeason,
      seasons: ingredientSeasons,
      alternative: isInSeason ? null : this.getSeasionalAlternative(ingredient.name, currentSeason)
    };
  });
  
  // Calculer les statistiques
  const seasonalIngredients = details.filter(d => d.inSeason).length;
  const totalIngredients = details.length;
  const seasonalScore = Math.round((seasonalIngredients / totalIngredients) * 10) / 10 * 10; // Score sur 10
  
  return {
    seasonalScore: seasonalScore,
    seasonalIngredients: seasonalIngredients,
    outOfSeasonIngredients: totalIngredients - seasonalIngredients,
    details: details,
    season: currentSeason
  };
}

/**
 * Trouve une alternative de saison pour un ingrédient
 * @param {string} ingredient - Nom de l'ingrédient
 * @param {string} season - Saison actuelle
 * @returns {string|null} - Alternative de saison ou null
 */
getSeasionalAlternative(ingredient, season) {
  // Dictionnaire d'alternatives (simplifié)
  const alternatives = {
    'Tomates': {
      'hiver': 'Tomates en conserve ou Poivrons rouges',
      'automne': 'Tomates cerises ou Courge'
    },
    'Courgettes': {
      'hiver': 'Courge butternut ou Panais',
      'automne': 'Potimarron ou Aubergine'
    },
    'Fraises': {
      'hiver': 'Oranges ou Pommes',
      'automne': 'Poires ou Raisins'
    }
  };
  
  // Retourner une alternative si disponible
  if (alternatives[ingredient] && alternatives[ingredient][season]) {
    return alternatives[ingredient][season];
  }
  
  // Si pas d'alternative spécifique, retourner une alternative générique
  const genericAlternatives = {
    'printemps': 'Asperges, Petits pois, Épinards',
    'été': 'Tomates, Courgettes, Poivrons',
    'automne': 'Potirons, Champignons, Poireaux',
    'hiver': 'Choux, Panais, Carottes'
  };
  
  return `Alternative suggérée: ${genericAlternatives[season]}`;
}

/**
 * Calcule le coût d'un menu
 * @param {string} menuId - Identifiant du menu
 * @param {number} servings - Nombre de portions
 * @returns {Object} - Détails du coût
 */
calculateMenuCost(menuId, servings = 1) {
  // Dans une implémentation réelle, on utiliserait les données de MarketMan
  // return chaifSesApi.calculateMenuCost(menuId, servings);
  
  // Pour cette démo, on génère des coûts aléatoires
  const menu = this.getMenuDetails(menuId);
  
  if (!menu || !menu.ingredients) {
    return {
      totalCost: 0,
      costPerServing: 0,
      ingredients: []
    };
  }
  
  // Calculer le coût de chaque ingrédient
  const ingredientCosts = menu.ingredients.map(ingredient => {
    // Prix unitaire aléatoire (entre 0.5€ et 20€ par unité)
    const unitPrice = (Math.random() * 19.5 + 0.5).toFixed(2);
    
    // Quantité nécessaire pour le nombre de portions demandé
    const quantity = ingredient.amount * servings;
    
    // Coût total pour cet ingrédient
    const cost = (unitPrice * quantity / 100).toFixed(2);
    
    return {
      name: ingredient.name,
      unitPrice: unitPrice,
      quantity: quantity,
      unit: ingredient.unit,
      cost: cost
    };
  });
  
  // Calculer le coût total
  const totalCost = ingredientCosts.reduce((sum, item) => sum + parseFloat(item.cost), 0).toFixed(2);
  
  // Calculer le coût par portion
  const costPerServing = (totalCost / servings).toFixed(2);
  
  return {
    totalCost: totalCost,
    costPerServing: costPerServing,
    ingredients: ingredientCosts,
    servings: servings
  };
}

/**
 * Vérifie la disponibilité des ingrédients pour un menu
 * @param {string} menuId - Identifiant du menu
 * @param {number} servings - Nombre de portions
 * @returns {Object} - Disponibilité des ingrédients
 */
checkIngredientsAvailability(menuId, servings = 1) {
  // Dans une implémentation réelle, on interrogerait MarketMan
  // return chaifSesApi.checkIngredientsAvailability(menuId, servings);
  
  // Pour cette démo, on génère des données aléatoires
  const menu = this.getMenuDetails(menuId);
  
  if (!menu || !menu.ingredients) {
    return {
      available: false,
      missing: [],
      lowStock: [],
      expiringSoon: []
    };
  }
  
  // Vérifier chaque ingrédient
  const ingredientsStatus = menu.ingredients.map(ingredient => {
    // Quantité nécessaire pour le nombre de portions demandé
    const requiredQuantity = ingredient.amount * servings;
    
    // Générer aléatoirement le statut de disponibilité
    const random = Math.random();
    let status = 'available';
    
    if (random < 0.1) {
      status = 'missing';
    } else if (random < 0.3) {
      status = 'lowStock';
    } else if (random < 0.5) {
      status = 'expiringSoon';
    }
    
    // Stock disponible
    let availableStock = 0;
    
    if (status !== 'missing') {
      if (status === 'lowStock') {
        availableStock = Math.floor(requiredQuantity * (Math.random() * 0.8 + 0.1)); // 10-90% du nécessaire
      } else {
        availableStock = Math.floor(requiredQuantity * (Math.random() * 2 + 1)); // 100-300% du nécessaire
      }
    }
    
    // Date d'expiration (pour les ingrédients qui expirent bientôt)
    let expiryDate = null;
    
    if (status === 'expiringSoon') {
      const today = new Date();
      const daysToExpiry = Math.floor(Math.random() * 5) + 1; // 1-5 jours
      expiryDate = new Date(today);
      expiryDate.setDate(today.getDate() + daysToExpiry);
    }
    
    return {
      name: ingredient.name,
      required: requiredQuantity,
      unit: ingredient.unit,
      available: availableStock,
      status: status,
      expiryDate: expiryDate ? this.formatDate(expiryDate) : null
    };
  });
  
  // Regrouper par statut
  const missing = ingredientsStatus.filter(i => i.status === 'missing');
  const lowStock = ingredientsStatus.filter(i => i.status === 'lowStock');
  const expiringSoon = ingredientsStatus.filter(i => i.status === 'expiringSoon');
  
  return {
    available: missing.length === 0,
    missing: missing,
    lowStock: lowStock,
    expiringSoon: expiringSoon,
    ingredients: ingredientsStatus
  };
}

/**
 * Génère des suggestions d'accompagnements pour un menu
 * @param {string} menuId - Identifiant du menu principal
 * @returns {Array} - Liste des accompagnements suggérés
 */
suggestSideDishes(menuId) {
  // Dans une implémentation réelle, on utiliserait un algorithme de recommandation
  // return chaifSesApi.suggestSideDishes(menuId);
  
  // Pour cette démo, on génère des suggestions aléatoires
  const sideDishes = [
    { id: 's001', title: 'Riz basmati', type: 'grain', preparationTime: 20 },
    { id: 's002', title: 'Pommes de terre rôties', type: 'veg', preparationTime: 45 },
    { id: 's003', title: 'Purée de pommes de terre', type: 'veg', preparationTime: 30 },
    { id: 's004', title: 'Riz pilaf aux légumes', type: 'grain', preparationTime: 25 },
    { id: 's005', title: 'Salade verte', type: 'veg', preparationTime: 10 },
    { id: 's006', title: 'Pâtes fraîches', type: 'grain', preparationTime: 15 },
    { id: 's007', title: 'Légumes grillés', type: 'veg', preparationTime: 25 },
    { id: 's008', title: 'Quinoa aux herbes', type: 'grain', preparationTime: 20 },
    { id: 's009', title: 'Lentilles', type: 'legume', preparationTime: 30 },
    { id: 's010', title: 'Haricots verts sautés', type: 'veg', preparationTime: 15 }
  ];
  
  // Sélectionner 3 accompagnements aléatoires
  const numSuggestions = 3;
  const shuffled = [...sideDishes].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numSuggestions);
  
  // Ajouter un score de compatibilité simulé
  return selected.map(dish => ({
    ...dish,
    compatibilityScore: (Math.random() * 4 + 6).toFixed(1) // Score sur 10 (6-10)
  }));
}

/**
 * Génère des rapports d'analyse pour la gestion des stocks et la planification
 * @param {string} reportType - Type de rapport (inventory, costs, popularity, seasonality)
 * @param {string} period - Période (week, month, quarter, year)
 * @returns {Object} - Données du rapport
 */
generateReport(reportType, period = 'month') {
  // Dans une implémentation réelle, on interrogerait les API et la base de données
  // return chaifSesApi.generateReport(reportType, period);
  
  // Pour cette démo, on génère des rapports simulés
  this.showToast(`Génération du rapport ${reportType} en cours...`, 'info', false);
  
  // Simuler un délai de génération
  return new Promise((resolve) => {
    setTimeout(() => {
      let report = {};
      
      switch (reportType) {
        case 'inventory':
          report = this.generateInventoryReport(period);
          break;
        case 'costs':
          report = this.generateCostsReport(period);
          break;
        case 'popularity':
          report = this.generatePopularityReport(period);
          break;
        case 'seasonality':
          report = this.generateSeasonalityReport(period);
          break;
        default:
          report = { error: `Type de rapport inconnu: ${reportType}` };
      }
      
      this.hideToasts();
      this.showToast(`Rapport ${reportType} généré avec succès`, 'success');
      
      resolve(report);
    }, 2000);
  });
}

/**
 * Génère un rapport d'inventaire
 * @param {string} period - Période du rapport
 * @returns {Object} - Données du rapport d'inventaire
 */
generateInventoryReport(period) {
  // Créer un ensemble de données simulées
  const today = new Date();
  const daysInPeriod = this.getDaysInPeriod(period);
  
  // Générer des catégories d'ingrédients
  const categories = [
    { id: 'meat', name: 'Viandes et Poissons', totalItems: 0, expiringItems: 0, valueEur: 0 },
    { id: 'vegetables', name: 'Légumes', totalItems: 0, expiringItems: 0, valueEur: 0 },
    { id: 'fruits', name: 'Fruits', totalItems: 0, expiringItems: 0, valueEur: 0 },
    { id: 'dairy', name: 'Produits Laitiers', totalItems: 0, expiringItems: 0, valueEur: 0 },
    { id: 'grains', name: 'Céréales et Féculents', totalItems: 0, expiringItems: 0, valueEur: 0 },
    { id: 'spices', name: 'Épices et Condiments', totalItems: 0, expiringItems: 0, valueEur: 0 }
  ];
  
  // Générer des éléments d'inventaire aléatoires pour chaque catégorie
  const inventory = [];
  let totalValue = 0;
  let expiringValue = 0;
  
  categories.forEach(category => {
    // Nombre d'articles dans cette catégorie (entre 5 et 20)
    const numItems = Math.floor(Math.random() * 16) + 5;
    
    for (let i = 0; i < numItems; i++) {
      // Choisir si l'élément expire bientôt (20% de chances)
      const isExpiring = Math.random() < 0.2;
      
      // Générer une date d'expiration
      let expiryDate = null;
      if (isExpiring) {
        expiryDate = new Date(today);
        expiryDate.setDate(today.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 jours
      } else {
        expiryDate = new Date(today);
        expiryDate.setDate(today.getDate() + Math.floor(Math.random() * 30) + 8); // 8-37 jours
      }
      
      // Générer une valeur d'inventaire (entre 1€ et 100€)
      const value = (Math.random() * 99 + 1).toFixed(2);
      
      // Créer l'élément d'inventaire
      const item = {
        id: `item-${category.id}-${i}`,
        name: `Ingrédient ${i + 1} (${category.name})`,
        category: category.id,
        quantity: Math.floor(Math.random() * 100) + 1,
        unit: 'g',
        expiry: this.formatDate(expiryDate),
        valueEur: value,
        isExpiring: isExpiring
      };
      
      // Ajouter l'élément à l'inventaire
      inventory.push(item);
      
      // Mettre à jour les statistiques de la catégorie
      category.totalItems++;
      if (isExpiring) {
        category.expiringItems++;
        expiringValue += parseFloat(value);
      }
      category.valueEur += parseFloat(value);
      totalValue += parseFloat(value);
    }
  });
  
  return {
    period: period,
    generatedAt: new Date().toISOString(),
    summary: {
      totalItems: inventory.length,
      totalValueEur: totalValue.toFixed(2),
      expiringItems: inventory.filter(item => item.isExpiring).length,
      expiringValueEur: expiringValue.toFixed(2)
    },
    categories: categories,
    inventory: inventory
  };
}

/**
 * Génère un rapport de coûts
 * @param {string} period - Période du rapport
 * @returns {Object} - Données du rapport de coûts
 */
generateCostsReport(period) {
  // Créer un ensemble de données simulées
  const daysInPeriod = this.getDaysInPeriod(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysInPeriod);
  
  // Générer des données de coûts par jour
  const dailyCosts = [];
  let totalCost = 0;
  let totalRevenue = 0;
  let totalServings = 0;
  
  for (let i = 0; i < daysInPeriod; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Nombre de couverts pour ce jour (entre 30 et 100)
    const servings = Math.floor(Math.random() * 71) + 30;
    
    // Coût par couvert (entre 5€ et 15€)
    const costPerServing = (Math.random() * 10 + 5).toFixed(2);
    
    // Prix moyen facturé par couvert (entre 15€ et 40€)
    const pricePerServing = (Math.random() * 25 + 15).toFixed(2);
    
    // Calculer les totaux
    const dayCost = (servings * costPerServing).toFixed(2);
    const dayRevenue = (servings * pricePerServing).toFixed(2);
    const dayProfit = (dayRevenue - dayCost).toFixed(2);
    
    // Créer l'entrée pour ce jour
    const dailyCost = {
      date: this.formatDate(date),
      servings: servings,
      costPerServing: costPerServing,
      pricePerServing: pricePerServing,
      totalCost: dayCost,
      totalRevenue: dayRevenue,
      profit: dayProfit,
      profitMargin: ((dayProfit / dayRevenue) * 100).toFixed(2)
    };
    
    // Ajouter l'entrée à la liste
    dailyCosts.push(dailyCost);
    
    // Mettre à jour les totaux
    totalCost += parseFloat(dayCost);
    totalRevenue += parseFloat(dayRevenue);
    totalServings += servings;
  }
  
  // Calculer les statistiques globales
  const totalProfit = totalRevenue - totalCost;
  const averageProfitMargin = ((totalProfit / totalRevenue) * 100).toFixed(2);
  
  return {
    period: period,
    generatedAt: new Date().toISOString(),
    summary: {
      totalServings: totalServings,
      totalCostEur: totalCost.toFixed(2),
      totalRevenueEur: totalRevenue.toFixed(2),
      totalProfitEur: totalProfit.toFixed(2),
      averageCostPerServing: (totalCost / totalServings).toFixed(2),
      averageProfitMargin: averageProfitMargin
    },
    dailyCosts: dailyCosts
  };
}

/**
 * Génère un rapport de popularité des menus
 * @param {string} period - Période du rapport
 * @returns {Object} - Données du rapport de popularité
 */
generatePopularityReport(period) {
  // Créer un ensemble de données simulées
  const menuItems = [];
  
  // Générer 20 menus aléatoires
  for (let i = 0; i < 20; i++) {
    // Nombre de fois que le menu a été servi (entre 1 et 50)
    const servings = Math.floor(Math.random() * 50) + 1;
    
    // Note moyenne (entre 1 et 5)
    const rating = (Math.random() * 4 + 1).toFixed(1);
    
    // Créer l'entrée pour ce menu
    const menuItem = {
      id: `menu-${1000 + i}`,
      title: this.getRandomMenuTitle(),
      servings: servings,
      rating: rating,
      category: this.getRandomCategory()
    };
    
    // Ajouter l'entrée à la liste
    menuItems.push(menuItem);
  }
  
  // Trier par nombre de services (du plus au moins populaire)
  menuItems.sort((a, b) => b.servings - a.servings);
  
  // Extraire les 5 menus les plus populaires
  const topMenus = menuItems.slice(0, 5);
  
  // Extraire les menus les mieux notés (note >= 4.5)
  const topRated = menuItems.filter(item => parseFloat(item.rating) >= 4.5);
  
  // Calculer les statistiques par catégorie
  const categories = {};
  menuItems.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = {
        name: item.category,
        totalServings: 0,
        averageRating: 0,
        menuCount: 0
      };
    }
    
    categories[item.category].totalServings += item.servings;
    categories[item.category].averageRating += parseFloat(item.rating);
    categories[item.category].menuCount++;
  });
  
  // Calculer les moyennes par catégorie
  Object.values(categories).forEach(category => {
    category.averageRating = (category.averageRating / category.menuCount).toFixed(1);
  });
  
  return {
    period: period,
    generatedAt: new Date().toISOString(),
    summary: {
      totalMenus: menuItems.length,
      totalServings: menuItems.reduce((sum, item) => sum + item.servings, 0),
      averageRating: (menuItems.reduce((sum, item) => sum + parseFloat(item.rating), 0) / menuItems.length).toFixed(1)
    },
    topMenus: topMenus,
    topRated: topRated,
    categories: Object.values(categories),
    menuItems: menuItems
  };
}

/**
 * Génère un rapport de saisonnalité
 * @param {string} period - Période du rapport
 * @returns {Object} - Données du rapport de saisonnalité
 */
generateSeasonalityReport(period) {
  // Déterminer la saison actuelle
  const currentMonth = new Date().getMonth();
  let currentSeason = 'hiver';
  
  if (currentMonth >= 2 && currentMonth <= 4) {
    currentSeason = 'printemps';
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    currentSeason = 'été';
  } else if (currentMonth >= 8 && currentMonth <= 10) {
    currentSeason = 'automne';
  }
  
  // Créer un ensemble de données simulées
  const ingredients = [];
  const seasons = ['printemps', 'été', 'automne', 'hiver'];
  
  // Liste d'ingrédients
  const ingredientsList = [
    'Tomates', 'Courgettes', 'Aubergines', 'Poivrons', 'Concombres',
    'Fraises', 'Abricots', 'Pêches', 'Pommes', 'Poires',
    'Champignons', 'Carottes', 'Pommes de terre', 'Oignons', 'Ail',
    'Épinards', 'Brocolis', 'Choux', 'Asperges', 'Artichauts'
  ];
  
  // Générer des données pour chaque ingrédient
  ingredientsList.forEach(name => {
    // Attribuer une saison principale à l'ingrédient
    const mainSeason = seasons[Math.floor(Math.random() * seasons.length)];
    
    // Déterminer si l'ingrédient est disponible toute l'année
    const isYearRound = Math.random() < 0.3; // 30% de chance
    
    // Déterminer les saisons où l'ingrédient est disponible
    let availableSeasons = [];
    
    if (isYearRound) {
      availableSeasons = [...seasons];
    } else {
      // Ajouter la saison principale
      availableSeasons.push(mainSeason);
      
      // Ajouter éventuellement une saison adjacente
      const seasonIndex = seasons.indexOf(mainSeason);
      const nextSeasonIndex = (seasonIndex + 1) % seasons.length;
      
      if (Math.random() < 0.5) {
        availableSeasons.push(seasons[nextSeasonIndex]);
      }
    }
    
    // Déterminer si l'ingrédient est actuellement de saison
    const isInSeason = availableSeasons.includes(currentSeason);
    
    // Usage dans les menus actuels (entre 0 et 15)
    const usage = Math.floor(Math.random() * 16);
    
    // Créer l'entrée pour cet ingrédient
    const ingredient = {
      name: name,
      mainSeason: mainSeason,
      availableSeasons: availableSeasons,
      isYearRound: isYearRound,
      isInSeason: isInSeason,
      menuUsage: usage,
      carbonFootprint: isInSeason ? 'low' : 'high',
      locallyAvailable: isInSeason ? (Math.random() < 0.8) : (Math.random() < 0.2) // 80% si de saison, 20% sinon
    };
    
    // Ajouter l'entrée à la liste
    ingredients.push(ingredient);
  });
  
  // Calculer le score de saisonnalité global
  const inSeasonUsage = ingredients.reduce((sum, ing) => sum + (ing.isInSeason ? ing.menuUsage : 0), 0);
  const totalUsage = ingredients.reduce((sum, ing) => sum + ing.menuUsage, 0);
  const seasonalityScore = totalUsage > 0 ? ((inSeasonUsage / totalUsage) * 10).toFixed(1) : 0; // Score sur 10
  
  return {
    period: period,
    generatedAt: new Date().toISOString(),
    currentSeason: currentSeason,
    summary: {
      seasonalityScore: seasonalityScore,
      inSeasonIngredients: ingredients.filter(ing => ing.isInSeason).length,
      outOfSeasonIngredients: ingredients.filter(ing => !ing.isInSeason).length,
      yearRoundIngredients: ingredients.filter(ing => ing.isYearRound).length
    },
    ingredients: ingredients
  };
}

/**
 * Obtient le nombre de jours dans une période
 * @param {string} period - Période (week, month, quarter, year)
 * @returns {number} - Nombre de jours
 */
getDaysInPeriod(period) {
  switch (period) {
    case 'week':
      return 7;
    case 'month':
      return 30;
    case 'quarter':
      return 90;
    case 'year':
      return 365;
    default:
      return 30; // Par défaut, un mois
  }
}

/**
 * Obtient une catégorie aléatoire pour un menu
 * @returns {string} - Catégorie de menu
 */
getRandomCategory() {
  const categories = [
    'Italienne',
    'Française',
    'Méditerranéenne',
    'Asiatique',
    'Américaine',
    'Mexicaine',
    'Végétarienne'
  ];
  
  return categories[Math.floor(Math.random() * categories.length)];
}
  /**
   * Masque tous les toasts
   */
  hideToasts() {
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => this.hideToast(toast));
  }
}

// Styles CSS pour les composants de planning
const planningStyles = `
  /* Styles pour les modals */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    animation: fadeIn 0.3s ease-in-out;
  }

  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

  .modal-container {
    position: relative;
    background-color: white;
    border-radius: 8px;
    max-width: 90%;
    max-height: 90%;
    width: 800px;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    z-index: 1001;
    animation: slideUp 0.3s ease-in-out;
  }

  /* Styles spécifiques pour les différentes modals */
  .add-menu-modal .modal-container,
  .menu-details-modal .modal-container,
  .reuse-menu-modal .modal-container,
  .expiring-modal .modal-container,
  .confirm-modal .modal-container {
    padding: 2rem;
  }

  /* Styles des headers des modals */
  .modal h2 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: var(--primary);
    font-size: 1.5rem;
  }

  .modal h3 {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: var(--primary);
    font-size: 1.2rem;
  }

  /* Styles pour le formulaire dans les modals */
  .modal .form-group {
    margin-bottom: 1.5rem;
  }

  .modal label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .modal input, 
  .modal select, 
  .modal textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .modal input:focus, 
  .modal select:focus, 
  .modal textarea:focus {
    outline: none;
    border-color: var(--secondary);
    box-shadow: 0 0 0 2px rgba(230, 126, 34, 0.2);
  }

  /* Styles pour les options de sélection de menu */
  .menu-selection-options {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .menu-selection-options button {
    flex: 1;
  }

  .menu-selection-options button.active {
    background-color: var(--primary);
  }

  /* Styles pour les listes de menus dans les modals */
  .generated-menus-list,
  .existing-menus-list {
    max-height: 300px;
    overflow-y: auto;
    margin-top: 1rem;
    border: 1px solid #eee;
    border-radius: 4px;
  }

  .generated-menu-item,
  .existing-menu-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #eee;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .generated-menu-item:last-child,
  .existing-menu-item:last-child {
    border-bottom: none;
  }

  .generated-menu-item:hover,
  .existing-menu-item:hover {
    background-color: #f9f9f9;
  }

  .menu-thumbnail {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 1rem;
  }

  .generated-menu-info {
    flex: 1;
  }

  .generated-menu-title,
  .existing-menu-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .generated-menu-details {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #666;
  }

  .select-menu-btn {
    margin-left: 1rem;
  }

  /* Styles pour le menu sélectionné */
  .selected-menu-container {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 4px;
    border-left: 4px solid var(--success);
  }

  .selected-menu-item {
    display: flex;
    align-items: center;
  }

  .selected-menu-thumbnail {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 1rem;
  }

  .selected-menu-title {
    font-weight: 600;
    font-size: 1.2rem;
  }

  /* Styles pour les détails du menu */
  .menu-details-header {
    display: flex;
    margin-bottom: 2rem;
  }

  .menu-details-image {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    margin-right: 2rem;
  }

  .menu-details-info {
    flex: 1;
  }

  .menu-details-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
    color: #666;
  }

  .menu-details-description {
    line-height: 1.6;
  }

  .menu-details-ingredients {
    margin-bottom: 2rem;
  }

  .menu-details-ingredients ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    line-height: 1.6;
  }

  .menu-details-instructions {
    margin-bottom: 2rem;
  }

  .instructions-text {
    white-space: pre-line;
    line-height: 1.6;
  }

  /* Styles pour la prévisualisation du menu à réutiliser */
  .menu-preview {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 4px;
  }

  .menu-preview-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    margin-right: 1rem;
  }

  .menu-preview-title {
    font-weight: 600;
    font-size: 1.2rem;
  }

  /* Styles pour les actions de modal */
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Styles pour les modals sur mobile */
  @media (max-width: 768px) {
    .modal-container {
      width: 95%;
      max-height: 95%;
    }
    
    .menu-details-header {
      flex-direction: column;
    }
    
    .menu-details-image {
      width: 100%;
      height: auto;
      margin-right: 0;
      margin-bottom: 1rem;
    }
    
    .menu-selection-options {
      flex-direction: column;
    }
  }

  /* Styles pour les spinners dans les modals */
  .spinner-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border-left-color: var(--secondary);
    animation: spin 1s linear infinite;
  }

  /* Toast notifications */
  .toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1500;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .toast {
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 250px;
    max-width: 400px;
    animation: slideIn 0.3s ease forwards;
  }

  .toast-hiding {
    animation: slideOut 0.3s ease forwards;
  }

  .toast-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .toast-message {
    flex: 1;
  }

  .toast-success {
    background-color: #d4edda;
    color: #155724;
    border-left: 4px solid #28a745;
  }

  .toast-error {
    background-color: #f8d7da;
    color: #721c24;
    border-left: 4px solid #dc3545;
  }

  .toast-warning {
    background-color: #fff3cd;
    color: #856404;
    border-left: 4px solid #ffc107;
  }

  .toast-info {
    background-color: #d1ecf1;
    color: #0c5460;
    border-left: 4px solid #17a2b8;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Initialisation lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  // Ajouter les styles au document
  const styleElement = document.createElement('style');
  styleElement.textContent = planningStyles;
  document.head.appendChild(styleElement);
  
  // Initialiser le planificateur de menus
  const menuPlanner = new MenuPlanner();
  
  // Pour le débogage
  console.log("MenuPlanner initialisé avec succès");
});