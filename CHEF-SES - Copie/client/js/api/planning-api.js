/**
 * ChAIf SES - JavaScript pour la gestion du planning des menus
 * Version mise à jour pour utiliser le service API
 */

import { showNotification, formatDate } from './init.js';
import apiService from './api-service.js';

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
async function loadWeekData(weekStart) {
    // Formater la date pour l'API
    const startDate = formatDate(weekStart, 'YYYY-MM-DD');
    const endDate = formatDate(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
    
    showNotification('Chargement des données...', 'info');
    
    try {
        // Utiliser le service API pour récupérer les données du planning
        const response = await apiService.planning.getPlanningByPeriod(startDate, endDate);
        
        // Transformer les données pour les adapter au format attendu par la fonction updateCalendarWithMenus
        const formattedMenus = await transformPlanningData(response.data);
        
        // Mettre à jour le calendrier avec les données récupérées
        updateCalendarWithMenus(formattedMenus);
        
        showNotification('Données du planning chargées avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showNotification(`Erreur lors du chargement des données: ${error.message || 'Erreur inconnue'}`, 'danger');
    }
}

/**
 * Transforme les données du planning pour les adapter au format attendu
 * @param {Array} planningData - Données brutes du planning
 * @returns {Array} - Données formatées pour l'affichage
 */
async function transformPlanningData(planningData) {
    const formattedMenus = [];
    
    // Créer un cache pour éviter de récupérer plusieurs fois les mêmes menus
    const menuCache = {};
    
    for (const item of planningData) {
        // Récupérer les détails du menu si pas encore en cache
        if (!menuCache[item.menu_id]) {
            try {
                const menuResponse = await apiService.menu.getMenuById(item.menu_id);
                menuCache[item.menu_id] = menuResponse.data;
            } catch (error) {
                console.error(`Erreur lors de la récupération des détails du menu ${item.menu_id}:`, error);
                menuCache[item.menu_id] = { title: 'Menu inconnu', price: 0 };
            }
        }
        
        // Ajouter le menu formaté à la liste
        formattedMenus.push({
            id: item.id,
            menu_id: item.menu_id,
            date: item.date,
            time: item.time,
            title: menuCache[item.menu_id].title,
            guests: item.covers,
            notes: item.notes
        });
    }
    
    return formattedMenus;
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
    
    // Rediriger vers la page de création avec la date pré-remplie
    window.location.href = `menu.html?tab=menu-create&planningDate=${date}`;
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
async function openMenuDetails(menuId) {
    showNotification(`Chargement des détails du menu #${menuId}...`, 'info');
    
    try {
        // Récupérer les détails du menu via l'API
        const response = await apiService.planning.getPlanningItemById(menuId);
        
        // Si on a une modal, on l'affiche avec les détails
        // Sinon, on redirige vers la page de détails
        
        // Version simplifiée : notification de succès
        showNotification(`Menu chargé : ${response.data.menu_id} - ${response.data.date} (${response.data.covers} couverts)`, 'success');
        
        // Redirection vers la page de détails
        // window.location.href = `menu.html?tab=menu-details&id=${response.data.menu_id}`;
    } catch (error) {
        console.error('Erreur lors du chargement des détails du menu:', error);
        showNotification(`Erreur : ${error.message || 'Impossible de charger les détails du menu'}`, 'danger');
    }
}

/**
 * Initialisation du bouton de génération automatique de planning
 */
function initAutoPlanning() {
    const generateBtn = document.getElementById('generate-week-plan');
    
    if (!generateBtn) return;
    
    generateBtn.addEventListener('click', async function() {
        showNotification('Génération d\'un planning automatique...', 'info');
        
        // Obtenir la semaine actuellement affichée
        const currentWeekStart = getCurrentWeekStart();
        const startDate = formatDate(currentWeekStart, 'YYYY-MM-DD');
        const endDate = formatDate(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000), 'YYYY-MM-DD');
        
        try {
            // Appeler le service API pour générer un planning
            const response = await apiService.planning.generatePlanning(startDate, endDate, {
                meal_types: ['lunch', 'dinner'],
                default_covers: {
                    lunch: 40,
                    dinner: 55
                }
            });
            
            // Transformer et afficher les données
            const formattedMenus = await transformPlanningData(response.data);
            updateCalendarWithMenus(formattedMenus);
            
            showNotification('Planning généré avec succès!', 'success');
        } catch (error) {
            console.error('Erreur lors de la génération du planning:', error);
            showNotification(`Erreur : ${error.message || 'Impossible de générer le planning'}`, 'danger');
        }
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
    const filterHistory = async () => {
        const searchTerm = historySearch.value.toLowerCase();
        const period = historyPeriod.value;
        const sort = historySort.value;
        
        showNotification('Chargement des données filtrées...', 'info');
        
        try {
            // Construire les paramètres de filtrage
            const params = {
                period: period !== 'all' ? period : undefined,
                q: searchTerm ? searchTerm : undefined
            };
            
            // Ajouter le tri
            if (sort) {
                const [field, direction] = sort.split('-');
                params.sort = `${field}:${direction}`;
            }
            
            // Appeler l'API pour récupérer l'historique filtré
            const response = await apiService.planning.getMenuHistory(params);
            
            // Mettre à jour l'affichage (fonction à implémenter)
            updateHistoryList(response.data);
            
            showNotification('Filtres appliqués avec succès', 'success');
        } catch (error) {
            console.error('Erreur lors du filtrage de l\'historique:', error);
            showNotification(`Erreur : ${error.message || 'Impossible de filtrer l\'historique'}`, 'danger');
        }
    };
    
    // Ajouter les écouteurs d'événements
    historySearch.addEventListener('input', function() {
        // Ajouter un délai pour éviter trop d'appels pendant la saisie
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(filterHistory, 500);
    });
    
    historyPeriod.addEventListener('change', filterHistory);
    historySort.addEventListener('change', filterHistory);
    
    // Charger les données initiales
    filterHistory();
}

/**
 * Met à jour la liste d'historique avec les données reçues
 * @param {Array} historyData - Données d'historique
 */
async function updateHistoryList(historyData) {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;
    
    // Vider la liste actuelle
    historyList.innerHTML = '';
    
    // Si aucune donnée, afficher un message
    if (!historyData || historyData.length === 0) {
        historyList.innerHTML = '<div class="empty-state">Aucun élément trouvé dans l\'historique.</div>';
        return;
    }
    
    // Créer un cache pour les menus
    const menuCache = {};
    
    // Ajouter chaque élément à la liste
    for (const item of historyData) {
        // Récupérer les détails du menu si non disponibles dans le cache
        if (!menuCache[item.menu_id]) {
            try {
                const menuResponse = await apiService.menu.getMenuById(item.menu_id);
                menuCache[item.menu_id] = menuResponse.data;
            } catch (error) {
                console.error(`Erreur lors de la récupération des détails du menu ${item.menu_id}:`, error);
                menuCache[item.menu_id] = { 
                    title: 'Menu inconnu', 
                    description: 'Description non disponible',
                    image: '/api/placeholder/160/160'
                };
            }
        }
        
        const menuInfo = menuCache[item.menu_id];
        const formattedDate = formatDate(new Date(item.date), 'DD MMM YYYY');
        const mealType = item.time === '12:00' ? 'midi' : 'soir';
        
        // Créer l'élément d'historique
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.setAttribute('data-menu-id', item.id);
        
        historyItem.innerHTML = `
            <img src="${menuInfo.image || '/api/placeholder/160/160'}" alt="${menuInfo.title}" class="history-image">
            <div class="history-content">
                <h3 class="history-title">${menuInfo.title}</h3>
                <div class="history-meta">
                    <span>📅 ${formattedDate}</span>
                    <span>👤 ${item.covers} couverts</span>
                    <span>⏱️ Service du ${mealType}</span>
                </div>
                <p>${menuInfo.description || 'Aucune description disponible.'}</p>
            </div>
            <div class="history-actions">
                <button class="btn-primary view-menu-btn">Voir la recette</button>
                <button class="btn-success reuse-menu-btn">Réutiliser</button>
            </div>
        `;
        
        // Ajouter à la liste
        historyList.appendChild(historyItem);
    }
    
    // Réinitialiser les écouteurs d'événements
    initHistoryActions();
}

/**
 * Initialisation des boutons d'actions sur l'historique
 */
function initHistoryActions() {
    // Boutons "Voir la recette"
    document.querySelectorAll('.view-menu-btn').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.stopPropagation(); // Empêcher la propagation au parent
            
            const historyItem = this.closest('.history-item');
            const menuId = historyItem.getAttribute('data-menu-id');
            
            try {
                // Récupérer les détails de l'élément d'historique
                const historyResponse = await apiService.planning.getPlanningItemById(menuId);
                
                // Rediriger vers la page de détails du menu
                window.location.href = `menu.html?tab=menu-details&id=${historyResponse.data.menu_id}`;
            } catch (error) {
                console.error('Erreur lors de la récupération des détails:', error);
                showNotification(`Erreur : ${error.message || 'Impossible de charger les détails'}`, 'danger');
            }
        });
    });
    
    // Boutons "Réutiliser"
    document.querySelectorAll('.reuse-menu-btn').forEach(button => {
        button.addEventListener('click', async function(e) {
            e.stopPropagation(); // Empêcher la propagation au parent
            
            const historyItem = this.closest('.history-item');
            const menuId = historyItem.getAttribute('data-menu-id');
            
            try {
                // Récupérer les détails de l'élément d'historique
                const historyResponse = await apiService.planning.getPlanningItemById(menuId);
                
                // Demander la date pour la réutilisation (en pratique, utiliser une modale)
                const currentWeekStart = getCurrentWeekStart();
                const formattedDate = formatDate(currentWeekStart, 'YYYY-MM-DD');
                
                // Créer un nouvel élément dans le planning
                const newPlanningData = {
                    menu_id: historyResponse.data.menu_id,
                    date: formattedDate,
                    time: historyResponse.data.time,
                    meal_type: historyResponse.data.meal_type,
                    covers: historyResponse.data.covers,
                    notes: `Réutilisation du menu du ${historyResponse.data.date}`
                };
                
                // Appeler l'API pour ajouter au planning
                await apiService.planning.addPlanningItem(newPlanningData);
                
                // Recharger les données du planning
                loadWeekData(currentWeekStart);
                
                showNotification(`Menu ajouté au planning du ${formatDate(new Date(formattedDate), 'DD/MM/YYYY')}`, 'success');
            } catch (error) {
                console.error('Erreur lors de la réutilisation du menu:', error);
                showNotification(`Erreur : ${error.message || 'Impossible de réutiliser le menu'}`, 'danger');
            }
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
async function loadCharts() {
    const chartPeriod = document.getElementById('chart-period');
    const ingredientsPeriod = document.getElementById('ingredients-period');
    
    if (!chartPeriod || !ingredientsPeriod) return;
    
    const period1 = chartPeriod.value;
    const period2 = ingredientsPeriod.value;
    
    showNotification('Chargement des statistiques...', 'info');
    
    try {
        // Récupérer les statistiques via l'API
        const statsResponse = await apiService.planning.getUsageStats(period1);
        
        // Mettre à jour les cartes de statistiques
        updateStatsCards(statsResponse.data);
        
        // Dessiner les graphiques (si une bibliothèque de graphiques est disponible)
        drawCharts(statsResponse.data, period1, period2);
        
        showNotification('Statistiques chargées avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
        showNotification(`Erreur : ${error.message || 'Impossible de charger les statistiques'}`, 'danger');
    }
}

/**
 * Met à jour les cartes de statistiques
 * @param {Object} statsData - Données de statistiques
 */
function updateStatsCards(statsData) {
    // Mettre à jour le nombre de menus utilisés
    const menusUsedValue = document.querySelector('.stat-card:nth-child(1) .stat-value');
    if (menusUsedValue) {
        menusUsedValue.textContent = statsData.menus_used || 0;
    }
    
    // Mettre à jour le nombre de couverts
    const coversValue = document.querySelector('.stat-card:nth-child(2) .stat-value');
    if (coversValue) {
        coversValue.textContent = statsData.total_covers || 0;
    }
    
    // Mettre à jour la note moyenne
    const ratingValue = document.querySelector('.stat-card:nth-child(3) .stat-value');
    if (ratingValue) {
        ratingValue.textContent = `${statsData.average_rating || 0}/10`;
    }
    
    // Mettre à jour l'économie sur les ingrédients
    const savingsValue = document.querySelector('.stat-card:nth-child(4) .stat-value');
    if (savingsValue) {
        savingsValue.textContent = `${statsData.ingredients_saving || 0}%`;
    }
}

/**
 * Dessine les graphiques avec les données de statistiques
 * @param {Object} statsData - Données de statistiques
 * @param {string} chartPeriod - Période pour le graphique des menus
 * @param {string} ingredientsPeriod - Période pour le graphique des ingrédients
 */
function drawCharts(statsData, chartPeriod, ingredientsPeriod) {
    // Vérifier si la bibliothèque de graphiques est disponible (Chart.js par exemple)
    if (typeof Chart === 'undefined') {
        console.warn('La bibliothèque de graphiques n\'est pas disponible. Impossible de dessiner les graphiques.');
        return;
    }
    
    // Graphique d'utilisation des menus par catégorie
    const menuUsageChart = document.getElementById('menu-usage-chart');
    if (menuUsageChart) {
        const ctx1 = menuUsageChart.getContext('2d');
        
        // Détruire le graphique existant s'il y en a un
        if (menuUsageChart.chart) {
            menuUsageChart.chart.destroy();
        }
        
        // Données pour le graphique
        const categoryLabels = Object.keys(statsData.category_usage || {});
        const categoryValues = Object.values(statsData.category_usage || {});
        
        // Créer le graphique
        menuUsageChart.chart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: categoryLabels,
                datasets: [{
                    label: 'Utilisation par catégorie',
                    data: categoryValues,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Graphique des ingrédients les plus utilisés
    const ingredientsChart = document.getElementById('ingredients-usage-chart');
    if (ingredientsChart) {
        const ctx2 = ingredientsChart.getContext('2d');
        
        // Détruire le graphique existant s'il y en a un
        if (ingredientsChart.chart) {
            ingredientsChart.chart.destroy();
        }
        
        // Données pour le graphique
        const ingredients = statsData.top_ingredients || [];
        const ingredientLabels = ingredients.map(item => item.name);
        const ingredientValues = ingredients.map(item => item.quantity);
        
        // Créer le graphique
        ingredientsChart.chart = new Chart(ctx2, {
            type: 'horizontalBar',
            data: {
                labels: ingredientLabels,
                datasets: [{
                    label: 'Quantité utilisée',
                    data: ingredientValues,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
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

// Exposer certaines fonctions pour le développement et les tests
window.PlanningApp = {
    loadWeekData,
    updateCalendarWithMenus,
    openAddMenuDialog,
    openMenuDetails
};