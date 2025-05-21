/**
 * ChAIf SES - JavaScript pour la gestion du planning des menus
 * Ce fichier contient les fonctionnalités spécifiques à la page planning.html
 */

import { showNotification, formatDate, ajaxRequest } from './init.js';

// Attendre que le DOM soit entièrement chargé
document.addEventListener('DOMContentLoaded', function() {
    initPlanning();
});

/**
 * Initialisation de la page planning
 */
function initPlanning() {
    // Initialiser les contrôles de navigation du calendrier
    initCalendarNavigation();
    
    // Initialiser les boutons d'ajout de menu
    initAddMenuButtons();
    
    // Initialiser les interactions avec les menus existants
    initMenuItems();
    
    // Initialiser le bouton de génération automatique de planning
    initAutoPlanning();
    
    // Initialiser les filtres de l'historique
    initHistoryFilters();
    
    // Initialiser les boutons d'actions sur l'historique
    initHistoryActions();
    
    // Initialiser les filtres des statistiques
    initStatsFilters();
    
    // Charger les graphiques si l'onglet des statistiques est actif
    const statsTab = document.querySelector('.tab[data-tab="stats"]');
    if (statsTab && statsTab.classList.contains('active')) {
        loadCharts();
    } else {
        // Ajouter un écouteur pour charger les graphiques quand on active l'onglet
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', function() {
                if (this.getAttribute('data-tab') === 'stats') {
                    loadCharts();
                }
            });
        });
    }
}

/**
 * Initialisation des contrôles de navigation du calendrier
 */
function initCalendarNavigation() {
    const prevWeekBtn = document.getElementById('prev-week');
    const nextWeekBtn = document.getElementById('next-week');
    const weekRangeSpan = document.getElementById('week-range');
    
    if (!prevWeekBtn || !nextWeekBtn || !weekRangeSpan) return;
    
    // Semaine actuelle (par défaut)
    let currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Lundi
    
    // Mettre à jour l'affichage de la semaine
    updateWeekDisplay(currentWeekStart);
    
    // Gestionnaire pour la semaine précédente
    prevWeekBtn.addEventListener('click', function() {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        updateWeekDisplay(currentWeekStart);
        loadWeekData(currentWeekStart);
    });
    
    // Gestionnaire pour la semaine suivante
    nextWeekBtn.addEventListener('click', function() {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        updateWeekDisplay(currentWeekStart);
        loadWeekData(currentWeekStart);
    });
    
    // Charger les données de la semaine actuelle
    loadWeekData(currentWeekStart);
}

/**
 * Met à jour l'affichage de la semaine
 * @param {Date} weekStart - Date de début de la semaine (lundi)
 */
function updateWeekDisplay(weekStart) {
    if (!weekStart) return;
    
    const weekRangeSpan = document.getElementById('week-range');
    if (!weekRangeSpan) return;
    
    // Calculer la date de fin (dimanche)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    // Formater les dates
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();
    const startMonth = weekStart.toLocaleString('fr-FR', { month: 'long' });
    const endMonth = weekEnd.toLocaleString('fr-FR', { month: 'long' });
    const year = weekStart.getFullYear();
    
    // Mettre à jour le texte d'affichage
    if (startMonth === endMonth) {
        weekRangeSpan.textContent = `${startDay} au ${endDay} ${startMonth} ${year}`;
    } else {
        weekRangeSpan.textContent = `${startDay} ${startMonth} au ${endDay} ${endMonth} ${year}`;
    }
    
    // Mettre à jour les attributs data-date des boutons d'ajout
    document.querySelectorAll('.add-menu-btn').forEach((btn, index) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + index);
        btn.setAttribute('data-date', formatDate(dayDate, 'YYYY-MM-DD'));
    });
    
    // Mettre à jour les dates affichées dans les en-têtes de jours
    document.querySelectorAll('.day-number').forEach((dayNumber, index) => {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + index);
        dayNumber.textContent = `${dayDate.getDate()} ${dayDate.toLocaleString('fr-FR', { month: 'long' }).substring(0, 3)}`;
    });
}

/**
 * Charge les données des menus pour la semaine spécifiée
 * @param {Date} weekStart - Date de début de la semaine
 */
function loadWeekData(weekStart) {
    // Formater la date pour l'API
    const startDate = formatDate(weekStart, 'YYYY-MM-DD');
    const endDate = formatDate(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
    
    // Simuler un chargement (à remplacer par un appel API réel)
    showNotification('Chargement des données...', 'info');
    
    // Exemple de données simulées (à remplacer par un appel API réel)
    setTimeout(() => {
        const data = simulateMenuData(weekStart);
        updateCalendarWithMenus(data);
        showNotification('Données du planning chargées avec succès', 'success');
    }, 1000);
    
    // Exemple d'appel API (à décommenter et adapter)
    /*
    ajaxRequest('/api/planning', { 
        startDate: startDate, 
        endDate: endDate 
    }, 'GET')
    .then(data => {
        updateCalendarWithMenus(data);
        showNotification('Données du planning chargées avec succès', 'success');
    })
    .catch(error => {
        console.error('Erreur lors du chargement des données:', error);
        showNotification('Erreur lors du chargement des données du planning', 'danger');
    });
    */
}

/**
 * Met à jour le calendrier avec les données des menus
 * @param {Array} menus - Liste des menus à afficher
 */
function updateCalendarWithMenus(menus) {
    // Vider d'abord tous les contenus des jours
    document.querySelectorAll('.day-content').forEach(dayContent => {
        dayContent.innerHTML = '';
    });
    
    // Ajouter les menus aux jours correspondants
    menus.forEach(menu => {
        const menuDate = new Date(menu.date);
        const dayIndex = menuDate.getDay() - 1; // 0 pour lundi, 6 pour dimanche
        const dayIndex2 = dayIndex < 0 ? 6 : dayIndex; // Ajuster pour dimanche
        
        const dayContent = document.querySelectorAll('.day-content')[dayIndex2];
        if (!dayContent) return;
        
        // Créer l'élément de menu
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.setAttribute('data-menu-id', menu.id);
        
        // Ajouter le contenu
        menuItem.innerHTML = `
            <span class="menu-time">${menu.time}</span>
            <div class="menu-title">${menu.title}</div>
            <div class="menu-guests">${menu.guests} couverts</div>
        `;
        
        // Ajouter l'écouteur d'événements
        menuItem.addEventListener('click', function() {
            openMenuDetails(menu.id);
        });
        
        // Ajouter au jour
        dayContent.appendChild(menuItem);
    });
}

/**
 * Initialisation des boutons d'ajout de menu
 */
function initAddMenuButtons() {
    document.querySelectorAll('.add-menu-btn').forEach(button => {
        button.addEventListener('click', function() {
            const date = this.getAttribute('data-date');
            openAddMenuDialog(date);
        });
    });
}

/**
 * Ouvre la boîte de dialogue pour ajouter un menu
 * @param {string} date - Date au format YYYY-MM-DD
 */
function openAddMenuDialog(date) {
    // Pour l'exemple, on simule une notification
    const formattedDate = formatDate(new Date(date), 'DD/MM/YYYY');
    showNotification(`Ouverture du formulaire d'ajout de menu pour le ${formattedDate}`, 'info');
    
    // Ici, vous pourriez ouvrir une modale ou rediriger vers une page de création
    // window.location.href = `menu.html?tab=menu-create&planningDate=${date}`;
}

/**
 * Initialisation des interactions avec les menus existants
 */
function initMenuItems() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const menuId = this.getAttribute('data-menu-id');
            openMenuDetails(menuId);
        });
    });
}

/**
 * Ouvre les détails d'un menu
 * @param {string|number} menuId - ID du menu à afficher
 */
function openMenuDetails(menuId) {
    // Pour l'exemple, on simule une notification
    showNotification(`Ouverture des détails du menu #${menuId}`, 'info');
    
    // Ici, vous pourriez ouvrir une modale ou rediriger vers une page de détails
    // window.location.href = `menu.html?tab=menu-details&id=${menuId}`;
}

/**
 * Initialisation du bouton de génération automatique de planning
 */
function initAutoPlanning() {
    const generateBtn = document.getElementById('generate-week-plan');
    
    if (!generateBtn) return;
    
    generateBtn.addEventListener('click', function() {
        showNotification('Génération d\'un planning automatique...', 'info');
        
        // Simuler un traitement (à remplacer par un appel API réel)
        setTimeout(() => {
            // Semaine actuelle affichée
            const weekText = document.getElementById('week-range').textContent;
            const currentWeekStart = getCurrentWeekStart();
            
            // Générer des données simulées
            const data = simulateMenuData(currentWeekStart, true);
            
            // Mettre à jour le calendrier
            updateCalendarWithMenus(data);
            
            showNotification('Planning généré avec succès!', 'success');
        }, 2000);
    });
}

/**
 * Initialisation des filtres de l'historique
 */
function initHistoryFilters() {
    const historySearch = document.getElementById('history-search');
    const historyPeriod = document.getElementById('history-period');
    const historySort = document.getElementById('history-sort');
    
    if (!historySearch || !historyPeriod || !historySort) return;
    
    // Fonction pour filtrer l'historique
    const filterHistory = () => {
        const searchTerm = historySearch.value.toLowerCase();
        const period = historyPeriod.value;
        const sort = historySort.value;
        
        // Simuler un chargement (à remplacer par un appel API réel)
        showNotification('Chargement des données filtrées...', 'info');
        
        // Exemple de données simulées (à remplacer par un appel API réel)
        setTimeout(() => {
            showNotification('Filtres appliqués avec succès', 'success');
        }, 500);
    };
    
    // Ajouter les écouteurs d'événements
    historySearch.addEventListener('input', filterHistory);
    historyPeriod.addEventListener('change', filterHistory);
    historySort.addEventListener('change', filterHistory);
}

/**
 * Initialisation des boutons d'actions sur l'historique
 */
function initHistoryActions() {
    // Boutons "Voir la recette"
    document.querySelectorAll('.view-menu-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Empêcher la propagation au parent
            const menuId = this.closest('.history-item').getAttribute('data-menu-id');
            showNotification(`Affichage de la recette du menu #${menuId}`, 'info');
        });
    });
    
    // Boutons "Réutiliser"
    document.querySelectorAll('.reuse-menu-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Empêcher la propagation au parent
            const menuId = this.closest('.history-item').getAttribute('data-menu-id');
            showNotification(`Menu #${menuId} ajouté au planning courant`, 'success');
        });
    });
    
    // Clic sur un élément d'historique
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', function() {
            const menuId = this.getAttribute('data-menu-id');
            openMenuDetails(menuId);
        });
    });
}

/**
 * Initialisation des filtres des statistiques
 */
function initStatsFilters() {
    const chartPeriod = document.getElementById('chart-period');
    const ingredientsPeriod = document.getElementById('ingredients-period');
    
    if (!chartPeriod || !ingredientsPeriod) return;
    
    // Fonction pour mettre à jour les graphiques
    const updateCharts = () => {
        loadCharts();
    };
    
    // Ajouter les écouteurs d'événements
    chartPeriod.addEventListener('change', updateCharts);
    ingredientsPeriod.addEventListener('change', updateCharts);
}

/**
 * Charge et initialise les graphiques
 */
function loadCharts() {
    // Simuler un chargement (à remplacer par un appel API réel)
    showNotification('Chargement des graphiques...', 'info');
    
    // Exemple de données simulées (à remplacer par un appel API réel)
    setTimeout(() => {
        showNotification('Graphiques chargés avec succès', 'success');
        
        // Ici, vous devrez utiliser une bibliothèque de graphiques comme Chart.js
        // Pour cet exemple, on ne fait rien car les fonctions ne sont pas disponibles
        console.log('Chargement des graphiques (simulation uniquement)');
    }, 1000);
}

/**
 * Obtient la date de début de la semaine actuellement affichée
 * @returns {Date} - Date de début de semaine
 */
function getCurrentWeekStart() {
    const weekText = document.getElementById('week-range').textContent;
    const matches = weekText.match(/(\d+)\s+(\w+)\s+au\s+(\d+)\s+(\w+)\s+(\d{4})/);
    
    if (!matches) return new Date();
    
    const startDay = parseInt(matches[1]);
    const startMonth = getMonthNumber(matches[2]);
    const endDay = parseInt(matches[3]);
    const endMonth = getMonthNumber(matches[4]);
    const year = parseInt(matches[5]);
    
    return new Date(year, startMonth, startDay);
}

/**
 * Convertit un nom de mois en français en numéro de mois (0-11)
 * @param {string} monthName - Nom du mois en français
 * @returns {number} - Numéro du mois (0-11)
 */
function getMonthNumber(monthName) {
    const months = {
        'janvier': 0, 'jan': 0,
        'février': 1, 'fév': 1, 
        'mars': 2, 'mar': 2,
        'avril': 3, 'avr': 3,
        'mai': 4,
        'juin': 5,
        'juillet': 6, 'juil': 6,
        'août': 7, 'aou': 7,
        'septembre': 8, 'sep': 8,
        'octobre': 9, 'oct': 9,
        'novembre': 10, 'nov': 10,
        'décembre': 11, 'déc': 11
    };
    
    return months[monthName.toLowerCase()] || 0;
}

/**
 * Génère des données de menu simulées pour le développement
 * @param {Date} weekStart - Date de début de semaine
 * @param {boolean} fullWeek - Générer des données pour toute la semaine
 * @returns {Array} - Données de menus simulées
 */
function simulateMenuData(weekStart, fullWeek = false) {
    const menus = [];
    const menuTitles = [
        'Risotto aux Champignons', 'Poulet Rôti aux Herbes', 'Salade Niçoise',
        'Spaghetti Carbonara', 'Buddha Bowl Végétarien', 'Filet de Dorade Grillé',
        'Tartines Avocat & Saumon', 'Bœuf Bourguignon', 'Poké Bowl au Thon',
        'Tajine d\'Agneau', 'Quiche Lorraine', 'Entrecôte & Frites Maison',
        'Rôti de Bœuf & Gratin', 'Lasagnes Maison'
    ];
    
    // Générer les données pour chaque jour de la semaine
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + i);
        
        // Lunch
        menus.push({
            id: 1000 + (i * 2) + 1,
            date: formatDate(dayDate, 'YYYY-MM-DD'),
            time: '12:00',
            title: menuTitles[Math.floor(Math.random() * menuTitles.length)],
            guests: 30 + Math.floor(Math.random() * 40)
        });
        
        // Dinner
        menus.push({
            id: 1000 + (i * 2) + 2,
            date: formatDate(dayDate, 'YYYY-MM-DD'),
            time: '19:00',
            title: menuTitles[Math.floor(Math.random() * menuTitles.length)],
            guests: 40 + Math.floor(Math.random() * 30)
        });
        
        // Si on ne veut pas une semaine complète, s'arrêter à mercredi
        if (!fullWeek && i >= 3) break;
    }
    
    return menus;
}

// Exposer certaines fonctions pour le développement
window.PlanningApp = {
    loadWeekData,
    updateCalendarWithMenus,
    openAddMenuDialog,
    openMenuDetails
};