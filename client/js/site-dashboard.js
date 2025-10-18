// Site Dashboard JavaScript
class SiteDashboard {
    constructor() {
        this.siteId = null;
        this.siteData = null;
        this.currentWeek = null;
        this.init();
    }

    async init() {
        this.getSiteIdFromUrl();
        await this.loadSiteData();
        this.setupEventListeners();
        this.loadWeekSelector();
        await this.loadCurrentWeekMenus();
    }

    getSiteIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        this.siteId = urlParams.get('siteId');
        
        if (!this.siteId) {
            this.showError('ID du site manquant');
            return;
        }
    }

    async loadSiteData() {
        try {
            const response = await fetch(`/api/sites/${this.siteId}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des données du site');
            }
            
            this.siteData = await response.json();
            this.updateSiteHeader();
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement du site:', error);
            this.showError('Erreur lors du chargement des données du site');
        }
    }

    updateSiteHeader() {
        if (!this.siteData) return;
        
        document.getElementById('site-name').textContent = this.siteData.siteName;
        document.getElementById('site-type').textContent = `Type: ${this.getTypeLabel(this.siteData.type)}`;
    }

    getTypeLabel(type) {
        const types = {
            'ehpad': 'EHPAD',
            'hopital': 'Hôpital',
            'ecole': 'École',
            'collectivite': 'Collectivité',
            'resto': 'Restaurant',
            'maison_retraite': 'Maison de Retraite'
        };
        return types[type] || type;
    }

    setupEventListeners() {
        // Déconnexion
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        // Actualisation
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadCurrentWeekMenus();
        });
        
        // Changement de semaine
        document.getElementById('week-select').addEventListener('change', (e) => {
            this.currentWeek = e.target.value;
            this.loadMenusForWeek(this.currentWeek);
        });
        
        // Navigation rapide
        document.getElementById('residents-link').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `site-residents.html?siteId=${this.siteId}`;
        });
        
        document.getElementById('menus-link').addEventListener('click', (e) => {
            e.preventDefault();
            // Reste sur la page actuelle pour voir les menus
            this.loadCurrentWeekMenus();
        });
    }

    async loadWeekSelector() {
        try {
            // Générer les semaines des 4 prochaines semaines
            const weeks = this.generateWeeks(4);
            const select = document.getElementById('week-select');
            
            select.innerHTML = '<option value="">Sélectionner une semaine</option>';
            
            weeks.forEach(week => {
                const option = document.createElement('option');
                option.value = week.value;
                option.textContent = week.label;
                select.appendChild(option);
            });
            
            // Sélectionner la semaine actuelle par défaut
            const currentWeek = this.getCurrentWeek();
            select.value = currentWeek;
            this.currentWeek = currentWeek;
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement du sélecteur de semaines:', error);
        }
    }

    generateWeeks(count) {
        const weeks = [];
        const today = new Date();
        
        for (let i = 0; i < count; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + (i * 7));
            
            const year = date.getFullYear();
            const weekNumber = this.getWeekNumber(date);
            const weekValue = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
            const weekLabel = `Semaine ${weekNumber} (${this.formatDate(date)})`;
            
            weeks.push({ value: weekValue, label: weekLabel });
        }
        
        return weeks;
    }

    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    getCurrentWeek() {
        const today = new Date();
        const year = today.getFullYear();
        const weekNumber = this.getWeekNumber(today);
        return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
    }

    formatDate(date) {
        return date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit' 
        });
    }

    async loadCurrentWeekMenus() {
        if (!this.currentWeek) {
            this.currentWeek = this.getCurrentWeek();
        }
        await this.loadMenusForWeek(this.currentWeek);
    }

    async loadMenusForWeek(yearWeek) {
        if (!yearWeek) return;
        
        this.showLoading(true);
        
        try {
            const response = await fetch(`/api/sites/${this.siteId}/menus?yearWeek=${yearWeek}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des menus');
            }
            
            const menus = await response.json();
            this.displayMenus(menus);
            this.updateSyncStatus(menus);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des menus:', error);
            this.showError('Erreur lors du chargement des menus');
        } finally {
            this.showLoading(false);
        }
    }

    displayMenus(menus) {
        const content = document.getElementById('dashboard-content');
        
        if (!menus || menus.length === 0) {
            content.innerHTML = `
                <div class="no-menu">
                    <i class="fas fa-utensils" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>Aucun menu disponible</h3>
                    <p>Les menus pour cette semaine n'ont pas encore été synchronisés depuis le groupe.</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="menu-section"><h2><i class="fas fa-utensils"></i> Menus de la semaine</h2><div class="menu-grid">';
        
        menus.forEach(menu => {
            html += this.createMenuCard(menu);
        });
        
        html += '</div></div>';
        content.innerHTML = html;
    }

    createMenuCard(menu) {
        const entriesHtml = menu.entries.map(entry => `
            <li class="menu-entry">
                <div>
                    <span class="entry-date">${this.formatDate(new Date(entry.date))}</span>
                </div>
                <div>
                    <span class="entry-service">${this.getServiceLabel(entry.service)}</span>
                </div>
            </li>
        `).join('');
        
        return `
            <div class="menu-card">
                <h3>
                    <i class="fas fa-calendar-week"></i>
                    ${menu.label || 'Menu de la semaine'}
                </h3>
                <ul class="menu-entries">
                    ${entriesHtml}
                </ul>
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #f8f9fa; font-size: 0.9rem; color: #666;">
                    <i class="fas fa-sync"></i> Synchronisé le ${this.formatDateTime(menu.lastSyncedAt)}
                </div>
            </div>
        `;
    }

    getServiceLabel(service) {
        const services = {
            'midi': 'Midi',
            'soir': 'Soir',
            'lunch': 'Déjeuner',
            'dinner': 'Dîner'
        };
        return services[service] || service;
    }

    formatDateTime(dateString) {
        if (!dateString) return 'Inconnu';
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR');
    }

    updateSyncStatus(menus) {
        const syncStatus = document.getElementById('sync-status');
        const syncIcon = document.getElementById('sync-icon');
        const syncMessage = document.getElementById('sync-message');
        
        if (!menus || menus.length === 0) {
            syncStatus.className = 'sync-status pending';
            syncIcon.className = 'fas fa-exclamation-triangle';
            syncMessage.textContent = 'Aucun menu synchronisé pour cette semaine';
        } else {
            syncStatus.className = 'sync-status synced';
            syncIcon.className = 'fas fa-check-circle';
            syncMessage.textContent = `${menus.length} menu(s) synchronisé(s)`;
        }
        
        syncStatus.style.display = 'block';
    }

    showLoading(show) {
        const content = document.getElementById('dashboard-content');
        const refreshBtn = document.getElementById('refresh-btn');
        
        if (show) {
            content.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner"></i> Chargement des menus...
                </div>
            `;
            refreshBtn.disabled = true;
        } else {
            refreshBtn.disabled = false;
        }
    }

    showError(message) {
        const content = document.getElementById('dashboard-content');
        content.innerHTML = `
            <div class="no-menu">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;"></i>
                <h3>Erreur</h3>
                <p>${message}</p>
            </div>
        `;
    }

    async logout() {
        try {
            const response = await fetch('/api/sites/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            // Rediriger vers la page de connexion même en cas d'erreur
            window.location.href = 'site-login.html';
            
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
            window.location.href = 'site-login.html';
        }
    }
}

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new SiteDashboard();
});
