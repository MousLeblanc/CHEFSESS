// Group Dashboard JavaScript
class GroupDashboard {
    constructor() {
        this.currentGroup = null;
        this.sites = [];
        this.users = [];
        this.menus = [];
        this.init();
    }

    async init() {
        try {
            // Vérifier l'authentification d'abord
            const isAuthenticated = await this.checkAuthentication();
            if (!isAuthenticated) {
                console.log('❌ Utilisateur non authentifié, redirection vers login');
                window.location.href = '/login.html';
                return;
            }

            // Charger les informations utilisateur
            await this.loadUserInfo();
            
            // Charger les données du groupe
            await this.loadGroupData();
            
            // Initialiser les événements
            this.initEventListeners();
            
            // Charger les données initiales
            await this.loadOverviewData();
            
            console.log('✅ Group Dashboard initialisé');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showToast('Erreur lors du chargement du tableau de bord', 'error');
            // Rediriger vers login en cas d'erreur d'authentification
            if (error.message.includes('Non authentifié') || error.message.includes('401')) {
                window.location.href = '/login.html';
            }
        }
    }

    async checkAuthentication() {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                return false;
            }
            
            const data = await response.json();
            return data.success && data.user;
        } catch (error) {
            console.error('Erreur lors de la vérification d\'authentification:', error);
            return false;
        }
    }

    async loadUserInfo() {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Non authentifié');
            }
            
            const data = await response.json();
            const user = data.user;
            document.getElementById('user-name').textContent = user.name;
            
            // Vérifier que l'utilisateur est un GROUP_ADMIN
            if (!user.roles?.includes('GROUP_ADMIN')) {
                this.showToast('Accès refusé - Rôle GROUP_ADMIN requis', 'error');
                setTimeout(() => window.location.href = '/', 2000);
                return;
            }
            
            this.currentGroup = user.groupId;
            console.log('👤 Utilisateur chargé:', user.name, 'GroupId:', this.currentGroup);
        } catch (error) {
            console.error('Erreur lors du chargement des informations utilisateur:', error);
            window.location.href = '/login.html';
        }
    }

    async loadGroupData() {
        if (!this.currentGroup) {
            console.error('❌ Aucun groupId trouvé pour l\'utilisateur');
            this.showToast('Erreur: Aucun groupe associé à cet utilisateur', 'error');
            return;
        }
        
        try {
            console.log('🔄 Chargement des données du groupe:', this.currentGroup);
            
            // Charger les sites
            const sitesResponse = await fetch(`/api/groups/${this.currentGroup}/sites`, {
                credentials: 'include'
            });
            if (!sitesResponse.ok) {
                throw new Error(`Erreur ${sitesResponse.status}: ${sitesResponse.statusText}`);
            }
            this.sites = await sitesResponse.json();
            console.log('✅ Sites chargés:', this.sites.length);
            
            // Charger les utilisateurs
            const usersResponse = await fetch(`/api/groups/${this.currentGroup}/users`, {
                credentials: 'include'
            });
            if (!usersResponse.ok) {
                throw new Error(`Erreur ${usersResponse.status}: ${usersResponse.statusText}`);
            }
            this.users = await usersResponse.json();
            console.log('✅ Utilisateurs chargés:', this.users.length);
            
        } catch (error) {
            console.error('Erreur lors du chargement des données du groupe:', error);
            this.showToast('Erreur lors du chargement des données', 'error');
        }
    }

    initEventListeners() {
        // Navigation des onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Boutons d'action
        document.getElementById('refresh-sites')?.addEventListener('click', () => this.loadOverviewData());
        document.getElementById('add-site-btn')?.addEventListener('click', () => this.showAddSiteModal());
        document.getElementById('create-group-menu-btn')?.addEventListener('click', () => this.showCreateGroupMenuModal());
        document.getElementById('sync-all-btn')?.addEventListener('click', () => this.syncAllSites());
        document.getElementById('add-user-btn')?.addEventListener('click', () => this.showAddUserModal());

        // Sélecteurs de semaine
        document.getElementById('week-selector')?.addEventListener('change', (e) => this.loadMenusForWeek(e.target.value));
        document.getElementById('sync-week-selector')?.addEventListener('change', (e) => this.loadSyncStatusForWeek(e.target.value));

        // Formulaires
        document.getElementById('add-site-form')?.addEventListener('submit', (e) => this.handleAddSite(e));
        document.getElementById('create-group-menu-form')?.addEventListener('submit', (e) => this.handleCreateGroupMenu(e));

        // Bouton de déconnexion
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    }

    switchTab(tabName) {
        // Désactiver tous les onglets
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Activer l'onglet sélectionné
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Charger les données spécifiques à l'onglet
        this.loadTabData(tabName);
    }

    async loadTabData(tabName) {
        switch (tabName) {
            case 'overview':
                await this.loadOverviewData();
                break;
            case 'sites':
                await this.loadSitesData();
                break;
            case 'menus':
                await this.loadMenusData();
                break;
            case 'sync':
                await this.loadSyncData();
                break;
            case 'reports':
                await this.loadReportsData();
                break;
            case 'users':
                await this.loadUsersData();
                break;
        }
    }

    async loadOverviewData() {
        try {
            // Charger les statistiques
            const statsResponse = await fetch(`/api/groups/${this.currentGroup}/stats`, {
                credentials: 'include'
            });
            const stats = await statsResponse.json();
            
            // Mettre à jour les cartes de statistiques
            document.getElementById('total-sites').textContent = stats.sites || 0;
            document.getElementById('total-users').textContent = stats.users || 0;
            document.getElementById('total-menus').textContent = stats.menus || 0;
            document.getElementById('sync-rate').textContent = '95%'; // Placeholder
            
            // Charger le tableau des sites
            await this.loadSitesTable();
            
        } catch (error) {
            console.error('Erreur lors du chargement des données d\'ensemble:', error);
            this.showToast('Erreur lors du chargement des données', 'error');
        }
    }

    async loadSitesTable() {
        const tbody = document.getElementById('sites-tbody');
        if (!tbody) return;
        
        if (this.sites.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">Aucun site trouvé</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.sites.map(site => `
            <tr>
                <td>
                    <strong>${site.siteName}</strong>
                    <br><small class="text-muted">${site.address?.city || 'N/A'}</small>
                </td>
                <td>
                    <span class="status-badge status-synced">${this.getSiteTypeLabel(site.type)}</span>
                </td>
                <td>
                    <span class="text-success">✓ 3/3</span>
                </td>
                <td>3,45 €/repas</td>
                <td class="text-success">+2%</td>
                <td>
                    <span class="text-warning">⚠ 2 produits</span>
                </td>
                <td>
                    <small>${new Date().toLocaleDateString()}</small>
                </td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline" onclick="groupDashboard.viewSite('${site._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="groupDashboard.editSite('${site._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadSitesData() {
        const sitesGrid = document.getElementById('sites-grid');
        if (!sitesGrid) return;
        
        if (this.sites.length === 0) {
            sitesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-building"></i>
                    <h3>Aucun site</h3>
                    <p>Commencez par ajouter votre premier site</p>
                </div>
            `;
            return;
        }
        
        sitesGrid.innerHTML = this.sites.map(site => `
            <div class="site-card">
                <div class="site-header">
                    <h3 class="site-name">${site.siteName}</h3>
                    <span class="site-type">${this.getSiteTypeLabel(site.type)}</span>
                </div>
                <div class="site-info">
                    <div class="site-info-item">
                        <span class="site-info-label">Adresse:</span>
                        <span class="site-info-value">${site.address?.city || 'N/A'}</span>
                    </div>
                    <div class="site-info-item">
                        <span class="site-info-label">Téléphone:</span>
                        <span class="site-info-value">${site.contact?.phone || 'N/A'}</span>
                    </div>
                    <div class="site-info-item">
                        <span class="site-info-label">Synchronisation:</span>
                        <span class="site-info-value">${site.syncMode === 'auto' ? 'Automatique' : 'Manuelle'}</span>
                    </div>
                    <div class="site-info-item">
                        <span class="site-info-label">Statut:</span>
                        <span class="site-info-value">
                            <span class="status-badge ${site.isActive ? 'status-synced' : 'status-error'}">
                                ${site.isActive ? 'Actif' : 'Inactif'}
                            </span>
                        </span>
                    </div>
                </div>
                <div class="site-actions">
                    <button class="btn btn-sm btn-primary" onclick="groupDashboard.viewSite('${site._id}')">
                        <i class="fas fa-eye"></i> Voir
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="groupDashboard.editSite('${site._id}')">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadMenusData() {
        // Générer les options de semaine pour les 12 prochaines semaines
        this.populateWeekSelector('week-selector');
    }

    async loadSyncData() {
        // Générer les options de semaine pour les 12 prochaines semaines
        this.populateWeekSelector('sync-week-selector');
    }

    async loadReportsData() {
        // Charger les rapports nutritionnels et de coûts
        document.getElementById('nutrition-chart').innerHTML = '<p class="text-center">Rapport nutritionnel en cours de développement</p>';
        document.getElementById('costs-chart').innerHTML = '<p class="text-center">Rapport des coûts en cours de développement</p>';
    }

    async loadUsersData() {
        const tbody = document.getElementById('users-tbody');
        if (!tbody) return;
        
        if (this.users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucun utilisateur trouvé</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    ${user.roles?.map(role => `<span class="status-badge status-synced">${role}</span>`).join(' ') || 'N/A'}
                </td>
                <td>${user.siteId?.siteName || 'N/A'}</td>
                <td>${new Date().toLocaleDateString()}</td>
                <td>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline" onclick="groupDashboard.editUser('${user._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline text-danger" onclick="groupDashboard.removeUser('${user._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    populateWeekSelector(selectorId) {
        const selector = document.getElementById(selectorId);
        if (!selector) return;
        
        const currentDate = new Date();
        const options = [];
        
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate);
            date.setDate(date.getDate() + (i * 7));
            
            const year = date.getFullYear();
            const week = Math.ceil(date.getDate() / 7);
            const weekString = `${year}-W${week.toString().padStart(2, '0')}`;
            
            options.push(`<option value="${weekString}">Semaine ${week} - ${year}</option>`);
        }
        
        selector.innerHTML = '<option value="">Sélectionner une semaine</option>' + options.join('');
    }

    async loadMenusForWeek(yearWeek) {
        if (!yearWeek) return;
        
        const content = document.getElementById('menus-content');
        content.innerHTML = '<div class="loading">Chargement des menus...</div>';
        
        try {
            // Charger les menus pour cette semaine
            const response = await fetch(`/api/groups/${this.currentGroup}/menus/status?yearWeek=${yearWeek}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des menus');
            }
            
            const data = await response.json();
            this.displayMenusForWeek(data);
            
        } catch (error) {
            console.error('Erreur lors du chargement des menus:', error);
            content.innerHTML = '<p class="text-center text-danger">Erreur lors du chargement des menus</p>';
        }
    }

    displayMenusForWeek(data) {
        const content = document.getElementById('menus-content');
        
        if (!data.sites || data.sites.length === 0) {
            content.innerHTML = '<p class="text-center">Aucun menu trouvé pour cette semaine</p>';
            return;
        }
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>${data.groupMenu.label} (v${data.groupMenu.version})</h3>
                    <span class="text-muted">${data.sites.length} sites</span>
                </div>
                <div class="card-body">
                    <div class="sync-status-grid">
                        ${data.sites.map(site => `
                            <div class="sync-site-card ${site.syncStatus}">
                                <div class="sync-site-info">
                                    <h4>${site.siteName}</h4>
                                    <p>Version: ${site.syncVersion} | ${site.localOverrides ? 'Modifications locales' : 'Synchronisé'}</p>
                                </div>
                                <div class="sync-actions">
                                    <button class="btn btn-sm btn-outline" onclick="groupDashboard.viewSiteMenu('${site.siteId}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${!site.isUpToDate ? `
                                        <button class="btn btn-sm btn-primary" onclick="groupDashboard.syncSite('${site.siteId}')">
                                            <i class="fas fa-sync"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    async loadSyncStatusForWeek(yearWeek) {
        if (!yearWeek) return;
        
        const content = document.getElementById('sync-status');
        content.innerHTML = '<div class="loading">Chargement du statut de synchronisation...</div>';
        
        try {
            const response = await fetch(`/api/groups/${this.currentGroup}/menus/status?yearWeek=${yearWeek}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement du statut');
            }
            
            const data = await response.json();
            this.displaySyncStatus(data);
            
        } catch (error) {
            console.error('Erreur lors du chargement du statut:', error);
            content.innerHTML = '<p class="text-center text-danger">Erreur lors du chargement du statut</p>';
        }
    }

    displaySyncStatus(data) {
        const content = document.getElementById('sync-status');
        
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3>Statut de Synchronisation - ${data.yearWeek}</h3>
                    <div class="header-actions">
                        <span class="text-muted">
                            ${data.summary.syncedSites}/${data.summary.totalSites} sites synchronisés
                        </span>
                        <button class="btn btn-primary" onclick="groupDashboard.syncAllSites('${data.yearWeek}')">
                            <i class="fas fa-sync"></i> Synchroniser Tout
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="sync-status-grid">
                        ${data.sites.map(site => `
                            <div class="sync-site-card ${site.syncStatus}">
                                <div class="sync-site-info">
                                    <h4>${site.siteName}</h4>
                                    <p>
                                        Version: ${site.syncVersion}/${data.groupMenu.version} | 
                                        ${site.localOverrides ? 'Modifications locales' : 'Synchronisé'} |
                                        Dernière MAJ: ${site.lastSyncedAt ? new Date(site.lastSyncedAt).toLocaleString() : 'Jamais'}
                                    </p>
                                </div>
                                <div class="sync-actions">
                                    <button class="btn btn-sm btn-outline" onclick="groupDashboard.viewSiteMenu('${site.siteId}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${!site.isUpToDate ? `
                                        <button class="btn btn-sm btn-primary" onclick="groupDashboard.syncSite('${site.siteId}', '${data.yearWeek}')">
                                            <i class="fas fa-sync"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    showAddSiteModal() {
        document.getElementById('add-site-modal').style.display = 'block';
    }

    showCreateGroupMenuModal() {
        document.getElementById('create-group-menu-modal').style.display = 'block';
    }

    showAddUserModal() {
        // À implémenter
        this.showToast('Fonctionnalité en cours de développement', 'info');
    }

    async handleAddSite(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const siteData = Object.fromEntries(formData.entries());
        
        try {
            console.log('📤 Envoi des données du site:', siteData);
            console.log('📤 URL:', `/api/groups/${this.currentGroup}/sites`);
            
            const response = await fetch(`/api/groups/${this.currentGroup}/sites`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(siteData)
            });
            
            console.log('📥 Réponse du serveur:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erreur détaillée:', errorData);
                throw new Error(`Erreur ${response.status}: ${errorData.message || 'Erreur lors de la création du site'}`);
            }
            
            const newSite = await response.json();
            console.log('✅ Site créé:', newSite);
            this.sites.push(newSite);
            
            this.showToast('Site créé avec succès', 'success');
            this.closeModal('add-site-modal');
            e.target.reset();
            
            // Recharger les données
            await this.loadSitesData();
            
        } catch (error) {
            console.error('❌ Erreur lors de la création du site:', error);
            this.showToast(`Erreur: ${error.message}`, 'error');
        }
    }

    async handleCreateGroupMenu(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const menuData = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('/api/menus/group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    groupId: this.currentGroup,
                    ...menuData
                })
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la création du menu groupe');
            }
            
            this.showToast('Menu groupe créé avec succès', 'success');
            this.closeModal('create-group-menu-modal');
            e.target.reset();
            
        } catch (error) {
            console.error('Erreur lors de la création du menu groupe:', error);
            this.showToast('Erreur lors de la création du menu groupe', 'error');
        }
    }

    async syncAllSites(yearWeek) {
        if (!yearWeek) {
            yearWeek = document.getElementById('sync-week-selector')?.value;
        }
        
        if (!yearWeek) {
            this.showToast('Veuillez sélectionner une semaine', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/menus/sync-group', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    groupId: this.currentGroup,
                    yearWeek,
                    strategy: 'respect-overrides'
                })
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la synchronisation');
            }
            
            const result = await response.json();
            this.showToast(`Synchronisation terminée: ${result.syncedCount} sites synchronisés`, 'success');
            
            // Recharger les données
            await this.loadSyncStatusForWeek(yearWeek);
            
        } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
            this.showToast('Erreur lors de la synchronisation', 'error');
        }
    }

    async syncSite(siteId, yearWeek) {
        try {
            const response = await fetch(`/api/menus/${this.currentGroup}/${siteId}/${yearWeek}/force-sync`, {
                method: 'POST',
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la synchronisation du site');
            }
            
            this.showToast('Site synchronisé avec succès', 'success');
            
            // Recharger les données
            await this.loadSyncStatusForWeek(yearWeek);
            
        } catch (error) {
            console.error('Erreur lors de la synchronisation du site:', error);
            this.showToast('Erreur lors de la synchronisation du site', 'error');
        }
    }

    viewSite(siteId) {
        // À implémenter - rediriger vers le dashboard du site
        this.showToast('Redirection vers le dashboard du site', 'info');
    }

    editSite(siteId) {
        // À implémenter - ouvrir le modal d'édition
        this.showToast('Édition du site - à implémenter', 'info');
    }

    viewSiteMenu(siteId) {
        // À implémenter - afficher le menu du site
        this.showToast('Affichage du menu du site - à implémenter', 'info');
    }

    editUser(userId) {
        // À implémenter - ouvrir le modal d'édition utilisateur
        this.showToast('Édition de l\'utilisateur - à implémenter', 'info');
    }

    removeUser(userId) {
        if (confirm('Êtes-vous sûr de vouloir retirer cet utilisateur du groupe ?')) {
            // À implémenter - supprimer l'utilisateur
            this.showToast('Suppression de l\'utilisateur - à implémenter', 'info');
        }
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    getSiteTypeLabel(type) {
        const labels = {
            'ehpad': 'EHPAD',
            'hopital': 'Hôpital',
            'ecole': 'École',
            'collectivite': 'Collectivité',
            'maison_retraite': 'Maison de Retraite',
            'resto': 'Restaurant'
        };
        return labels[type] || type;
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            window.location.href = '/login.html';
        }
    }
}

// Initialiser le dashboard quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.groupDashboard = new GroupDashboard();
});
