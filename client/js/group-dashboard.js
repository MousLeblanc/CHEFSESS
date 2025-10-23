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
                window.location.href = '/';
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
                window.location.href = '/';
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
            window.location.href = '/';
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
        
        // Résidents
        document.getElementById('refresh-residents')?.addEventListener('click', () => this.loadResidentsGroups());
        document.getElementById('export-residents-btn')?.addEventListener('click', () => this.exportResidentsGroups());
        
        // Filtres résidents
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'white';
                    b.style.color = '#333';
                });
                e.target.classList.add('active');
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
                this.applyResidentsFilter();
            });
        });
        
        // Stock
        document.getElementById('add-stock-item-btn')?.addEventListener('click', () => {
            if (typeof window.showAddStockModal === 'function') {
                window.showAddStockModal();
            }
        });
        
        document.getElementById('refresh-stock-btn')?.addEventListener('click', () => {
            if (typeof window.loadStockData === 'function') {
                window.loadStockData();
            }
        });
        
        document.getElementById('consolidate-stock-btn')?.addEventListener('click', () => {
            if (typeof window.consolidateStock === 'function') {
                window.consolidateStock();
            }
        });
        
        document.getElementById('stock-search')?.addEventListener('input', (e) => {
            if (typeof window.filterStock === 'function') {
                window.filterStock();
            }
        });
        
        document.getElementById('stock-category-filter')?.addEventListener('change', () => {
            if (typeof window.filterStock === 'function') {
                window.filterStock();
            }
        });
        
        // Fournisseurs
        document.getElementById('refresh-suppliers-btn')?.addEventListener('click', () => {
            if (typeof window.loadSuppliersData === 'function') {
                window.loadSuppliersData();
            }
        });

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
            case 'residents':
                await this.loadResidentsGroups();
                break;
            case 'menus':
                await this.loadMenusData();
                break;
            case 'stock':
                await this.loadStockTab();
                break;
            case 'suppliers':
                await this.loadSuppliersTab();
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
            
            // Charger le nombre total de résidents
            const residentsCounts = await this.loadResidentsCounts();
            const totalResidents = Object.values(residentsCounts).reduce((sum, count) => sum + count, 0);
            
            // Mettre à jour les cartes de statistiques
            document.getElementById('total-sites').textContent = stats.sites || 0;
            document.getElementById('total-residents').textContent = totalResidents;
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
        
        // Charger le nombre de résidents par site
        const residentsCounts = await this.loadResidentsCounts();
        
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
                    <strong style="color: #667eea; font-size: 1.1rem;">${residentsCounts[site._id] || 0}</strong>
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
        
        // Charger le nombre de résidents par site
        const residentsCounts = await this.loadResidentsCounts();
        
        sitesGrid.innerHTML = this.sites.map(site => `
            <div class="site-card">
                <div class="site-header">
                    <h3 class="site-name">${site.siteName}</h3>
                    <span class="site-type">${this.getSiteTypeLabel(site.type)}</span>
                </div>
                <div class="site-info">
                    <div class="site-info-item">
                        <span class="site-info-label">👥 Résidents:</span>
                        <span class="site-info-value"><strong>${residentsCounts[site._id] || 0}</strong></span>
                    </div>
                    <div class="site-info-item">
                        <span class="site-info-label">📍 Adresse:</span>
                        <span class="site-info-value">${site.address?.city || 'À définir'}</span>
                    </div>
                    <div class="site-info-item">
                        <span class="site-info-label">📞 Téléphone:</span>
                        <span class="site-info-value">${site.contact?.phone || 'À définir'}</span>
                    </div>
                    <div class="site-info-item">
                        <span class="site-info-label">Synchronisation:</span>
                        <span class="site-info-value">${site.syncMode === 'auto' ? 'Automatique' : 'Manuelle'}</span>
                    </div>
                    <div class="site-info-item">
                        <span class="site-info-label">Statut:</span>
                        <span class="site-info-value">
                            <span class="status-badge ${site.isActive ? 'status-synced' : 'status-error'}">
                                ${site.isActive ? 'ACTIF' : 'INACTIF'}
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

    async loadResidentsCounts() {
        try {
            const response = await fetch(`/api/residents/group/${this.currentGroup}/counts`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                console.warn('Impossible de charger le nombre de résidents');
                return {};
            }
            
            const result = await response.json();
            return result.data || {};
        } catch (error) {
            console.error('Erreur lors du chargement des résidents:', error);
            return {};
        }
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

    async viewSite(siteId) {
        const site = this.sites.find(s => s._id === siteId);
        if (!site) {
            this.showToast('Site non trouvé', 'error');
            return;
        }

        // Charger les détails supplémentaires
        const residentsCounts = await this.loadResidentsCounts();
        const residentsCount = residentsCounts[siteId] || 0;

        // Charger les managers du site
        let managersHtml = 'Aucun responsable';
        if (site.managers && site.managers.length > 0) {
            const managers = this.users.filter(u => site.managers.includes(u._id));
            if (managers.length > 0) {
                managersHtml = managers.map(m => `
                    <div style="margin-bottom: 0.5rem;">
                        <strong>${m.name}</strong><br>
                        <small>${m.email}</small>
                    </div>
                `).join('');
            }
        }

        // Créer la modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.5); z-index: 1000; display: flex; 
            align-items: center; justify-content: center;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="margin: 0; color: #667eea;">
                        <i class="fas fa-building"></i> ${site.siteName}
                    </h2>
                    <button onclick="this.closest('div[style*=fixed]').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div style="display: grid; gap: 1.5rem;">
                    <!-- Type et Statut -->
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="status-badge" style="background: #e3f2fd; color: #1976d2; padding: 0.5rem 1rem; border-radius: 6px;">
                                ${this.getSiteTypeLabel(site.type)}
                            </span>
                            <span class="status-badge ${site.isActive ? 'status-synced' : 'status-error'}" style="padding: 0.5rem 1rem; border-radius: 6px;">
                                ${site.isActive ? 'ACTIF' : 'INACTIF'}
                            </span>
                        </div>
                    </div>

                    <!-- Statistiques -->
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 8px; text-align: center;">
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 2.5rem;">${residentsCount}</h3>
                        <p style="margin: 0; opacity: 0.9;">Résidents actifs</p>
                    </div>

                    <!-- Responsables -->
                    <div>
                        <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.1rem;">
                            <i class="fas fa-user-tie"></i> Responsables
                        </h3>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                            ${managersHtml}
                        </div>
                    </div>

                    <!-- Coordonnées -->
                    <div>
                        <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.1rem;">
                            <i class="fas fa-address-card"></i> Coordonnées
                        </h3>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                            <div style="margin-bottom: 0.75rem;">
                                <strong>📍 Adresse:</strong><br>
                                ${site.address?.street || 'Non renseignée'}<br>
                                ${site.address?.postalCode || ''} ${site.address?.city || ''}<br>
                                ${site.address?.country || 'Belgique'}
                            </div>
                            <div style="margin-bottom: 0.75rem;">
                                <strong>📞 Téléphone:</strong> ${site.contact?.phone || 'Non renseigné'}
                            </div>
                            <div style="margin-bottom: 0.75rem;">
                                <strong>📧 Email:</strong> ${site.contact?.email || 'Non renseigné'}
                            </div>
                            ${site.contact?.website ? `
                                <div>
                                    <strong>🌐 Site web:</strong> <a href="${site.contact.website}" target="_blank">${site.contact.website}</a>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Paramètres -->
                    <div>
                        <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.1rem;">
                            <i class="fas fa-cog"></i> Paramètres
                        </h3>
                        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                            <div style="margin-bottom: 0.75rem;">
                                <strong>🔄 Synchronisation:</strong> ${site.syncMode === 'auto' ? 'Automatique' : 'Manuelle'}
                            </div>
                            <div style="margin-bottom: 0.75rem;">
                                <strong>🕐 Fuseau horaire:</strong> ${site.settings?.timezone || 'Europe/Brussels'}
                            </div>
                            <div style="margin-bottom: 0.75rem;">
                                <strong>🍽️ Capacité déjeuner:</strong> ${site.settings?.capacity?.lunch || 'N/A'} couverts
                            </div>
                            <div>
                                <strong>🍷 Capacité dîner:</strong> ${site.settings?.capacity?.dinner || 'N/A'} couverts
                            </div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button onclick="window.open('/site-residents.html?siteId=${siteId}', '_blank')" style="flex: 1; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-users"></i> Voir les résidents
                        </button>
                        <button onclick="groupDashboard.editSite('${siteId}'); this.closest('div[style*=fixed]').remove();" style="flex: 1; padding: 0.75rem; background: #ff9800; color: white; border: none; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-edit"></i> Modifier
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
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

    // ===== Gestion des résidents groupés =====
    
    async loadResidentsGroups() {
        if (!this.currentGroup) {
            console.error('Groupe non chargé');
            return;
        }

        try {
            const response = await fetch(`/api/residents/group/${this.currentGroup}/grouped`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des groupes de résidents');
            }

            const result = await response.json();
            this.displayResidentsGroups(result.data);
        } catch (error) {
            console.error('❌ Erreur:', error);
            this.showToast('Erreur lors du chargement des résidents', 'error');
        }
    }

    displayResidentsGroups(data) {
        const content = document.getElementById('residents-groups-content');
        
        // Mettre à jour les statistiques
        document.getElementById('total-residents-count').textContent = data.totalResidents;
        document.getElementById('allergies-groups-count').textContent = data.groups.allergies.length;
        document.getElementById('restrictions-groups-count').textContent = data.groups.restrictions.length;
        document.getElementById('textures-groups-count').textContent = data.groups.textures.length;

        // Créer l'affichage des groupes
        let html = '';

        // Afficher les allergies
        if (data.groups.allergies.length > 0) {
            html += this.createGroupSection('Allergies', data.groups.allergies, 'allergies', '#f8d7da');
        }

        // Afficher les intolérances
        if (data.groups.intolerances.length > 0) {
            html += this.createGroupSection('Intolérances', data.groups.intolerances, 'intolerances', '#fff3cd');
        }

        // Afficher les restrictions
        if (data.groups.restrictions.length > 0) {
            html += this.createGroupSection('Restrictions Alimentaires', data.groups.restrictions, 'restrictions', '#d1ecf1');
        }

        // Afficher les textures
        if (data.groups.textures.length > 0) {
            html += this.createGroupSection('Textures', data.groups.textures, 'textures', '#e3f2fd');
        }

        if (html === '') {
            html = '<div style="text-align: center; padding: 3rem; color: #666;"><i class="fas fa-info-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i><p>Aucun profil nutritionnel spécifique détecté</p></div>';
        }

        content.innerHTML = html;
        
        // Appliquer le filtre actif
        this.applyResidentsFilter();
    }

    createGroupSection(title, groups, category, bgColor) {
        let html = `
            <div class="residents-group-section" data-category="${category}" style="margin-bottom: 2rem;">
                <h3 style="color: #333; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-layer-group"></i> ${title}
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem;">
        `;

        groups.forEach(group => {
            const severityBadge = group.severity ? `<span style="background: ${this.getSeverityColor(group.severity)}; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">${group.severity}</span>` : '';
            
            html += `
                <div style="background: white; border: 2px solid ${bgColor}; border-radius: 8px; padding: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 2px solid ${bgColor};">
                        <h4 style="margin: 0; color: #333; font-size: 1.1rem;">${group.name}</h4>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            ${severityBadge}
                            <span style="background: ${bgColor}; padding: 0.25rem 0.75rem; border-radius: 12px; font-weight: 600; font-size: 0.9rem;">
                                ${group.residents.length} résident${group.residents.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                    <div class="residents-list" style="max-height: 300px; overflow-y: auto;">
            `;

            group.residents.forEach(resident => {
                html += `
                    <div style="padding: 0.75rem; margin-bottom: 0.5rem; background: #f8f9fa; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: #333;">${resident.name}</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">
                                <i class="fas fa-building"></i> ${resident.site} 
                                ${resident.room ? `<span style="margin-left: 0.5rem;"><i class="fas fa-door-open"></i> Ch. ${resident.room}</span>` : ''}
                            </div>
                        </div>
                        <span style="background: #667eea; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
                            ${this.getTypeLabel(resident.siteType)}
                        </span>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
    }

    getSeverityColor(severity) {
        const colors = {
            'légère': '#ffa726',
            'modérée': '#ff7043',
            'sévère': '#f44336',
            'critique': '#d32f2f'
        };
        return colors[severity] || '#666';
    }

    getTypeLabel(type) {
        const labels = {
            'ehpad': 'EHPAD',
            'hopital': 'Hôpital',
            'ecole': 'École',
            'collectivite': 'Collectivité',
            'resto': 'Restaurant',
            'maison_retraite': 'Maison Retraite'
        };
        return labels[type] || type;
    }

    applyResidentsFilter() {
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        const sections = document.querySelectorAll('.residents-group-section');
        
        sections.forEach(section => {
            const category = section.dataset.category;
            if (activeFilter === 'all' || category === activeFilter) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
    }

    exportResidentsGroups() {
        this.showToast('Export en cours de développement', 'info');
        // À implémenter: export CSV ou PDF des groupes
    }

    // ===== Gestion du stock =====
    
    async loadStockTab() {
        console.log('📦 Chargement de l\'onglet Stock...');
        
        try {
            // Utiliser les fonctions globales exposées
            if (typeof window.initStockTab === 'function') {
                await window.initStockTab();
                console.log('✅ Onglet Stock initialisé');
            } else {
                console.error('❌ initStockTab non disponible');
                this.showToast('Erreur lors du chargement du stock', 'error');
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement de l\'onglet stock:', error);
            this.showToast('Erreur lors du chargement du stock', 'error');
        }
    }
    
    // ===== Gestion des fournisseurs =====
    
    async loadSuppliersTab() {
        console.log('🚛 Chargement de l\'onglet Fournisseurs...');
        
        try {
            // Utiliser les fonctions globales exposées
            if (typeof window.initSupplierTab === 'function') {
                await window.initSupplierTab();
                console.log('✅ Onglet Fournisseurs initialisé');
            } else {
                console.error('❌ initSupplierTab non disponible');
                this.showToast('Erreur lors du chargement des fournisseurs', 'error');
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement de l\'onglet fournisseurs:', error);
            this.showToast('Erreur lors du chargement des fournisseurs', 'error');
        }
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            window.location.href = '/';
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            window.location.href = '/';
        }
    }
}

// Initialiser le dashboard quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    window.groupDashboard = new GroupDashboard();
});
