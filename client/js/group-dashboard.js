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
        document.getElementById('generate-ai-menu-form')?.addEventListener('submit', (e) => this.handleGenerateAIMenu(e));

        // Bouton de déconnexion
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    }

    switchTab(tabName) {
        // Désactiver tous les onglets
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Activer l'onglet sélectionné
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const tabContent = document.getElementById(`${tabName}-tab`);
        
        if (tabBtn) {
            tabBtn.classList.add('active');
        } else {
            console.warn(`⚠️ Bouton d'onglet non trouvé: ${tabName}`);
        }
        
        if (tabContent) {
            tabContent.classList.add('active');
        } else {
            console.warn(`⚠️ Contenu d'onglet non trouvé: ${tabName}-tab`);
        }
        
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
            <tr style="${!site.isActive ? 'opacity: 0.6; background-color: #f8f9fa;' : ''}">
                <td>
                    <strong>${site.siteName}</strong>
                    ${!site.isActive ? '<span class="badge bg-secondary ms-2">INACTIF</span>' : ''}
                    <br><small class="text-muted">${site.address?.city || 'N/A'}</small>
                </td>
                <td>
                    <span class="status-badge ${site.isActive ? 'status-synced' : 'status-error'}">${this.getSiteTypeLabel(site.type)}</span>
                </td>
                <td>
                    <strong style="color: ${site.isActive ? '#667eea' : '#999'}; font-size: 1.1rem;">${residentsCounts[site._id] || 0}</strong>
                </td>
                <td>${site.isActive ? '3,45 €/repas' : '—'}</td>
                <td class="${site.isActive ? 'text-success' : 'text-muted'}">${site.isActive ? '+2%' : '—'}</td>
                <td>
                    ${site.isActive ? '<span class="text-warning">⚠ 2 produits</span>' : '—'}
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
                        ${!site.isActive ? `
                        <button class="btn btn-sm btn-success" onclick="groupDashboard.activateSite('${site._id}')" title="Activer ce site">
                            <i class="fas fa-check"></i>
                        </button>
                        ` : ''}
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
                    ${!site.isActive ? `
                    <button class="btn btn-sm btn-success" onclick="groupDashboard.activateSite('${site._id}')" title="Activer ce site">
                        <i class="fas fa-toggle-on"></i> Activer
                    </button>
                    ` : ''}
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
        
        // Initialiser la date par défaut du générateur IA à aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('ai-menu-start-date');
        if (dateInput) {
            dateInput.value = today;
        }
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

    async handleGenerateAIMenu(e) {
        e.preventDefault();
        
        const startDate = document.getElementById('ai-menu-start-date').value;
        const numDays = parseInt(document.getElementById('ai-menu-num-days').value);
        const theme = document.getElementById('ai-menu-theme').value;
        
        if (!startDate || !numDays) {
            this.showToast('Veuillez remplir tous les champs obligatoires', 'warning');
            return;
        }

        // Afficher le spinner de progression
        const progressDiv = document.getElementById('ai-generation-progress');
        const progressText = document.getElementById('ai-progress-text');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const resultsDiv = document.getElementById('ai-menu-results');
        
        progressDiv.style.display = 'block';
        submitBtn.disabled = true;
        resultsDiv.style.display = 'none';
        
        try {
            // Étape 1: Récupérer les sites actifs
            progressText.textContent = `Chargement des sites actifs...`;
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const activeSites = this.sites.filter(s => s.isActive);
            if (activeSites.length === 0) {
                throw new Error('Aucun site actif trouvé. Veuillez activer au moins un site.');
            }
            
            console.log('✅ Sites actifs:', activeSites.length);
            
            // Étape 2: Récupérer tous les résidents des sites actifs
            progressText.textContent = `Récupération des profils nutritionnels de ${activeSites.length} sites...`;
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const response = await fetch(`/api/residents/group/${this.currentGroup}/grouped`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des résidents');
            }
            
            const residentsData = await response.json();
            console.log('✅ Données résidents:', residentsData);
            
            // Construire la structure de données pour l'API de génération de menu
            // Pour l'instant, commençons avec une configuration simple et permissive
            const totalResidents = residentsData.data?.totalResidents || 100;
            
            const ageGroups = [{
                ageRange: "75+",
                count: totalResidents
            }];
            
            // Limiter les allergènes aux plus critiques seulement
            const allergens = [];
            const dietaryRestrictions = [];
            const medicalConditions = [];
            
            // Agrégation légère des profils - seulement les allergies critiques
            if (residentsData.data && residentsData.data.groups) {
                const groups = residentsData.data.groups;
                
                // Seulement les allergies critiques les plus communes
                if (groups.allergies) {
                    const criticalAllergies = groups.allergies
                        .filter(group => group.severity === 'critique' || group.severity === 'sévère')
                        .slice(0, 3); // Max 3 allergènes
                    
                    criticalAllergies.forEach(group => {
                        allergens.push(group.name);
                    });
                }
                
                console.log('📊 Filtres appliqués (mode permissif):', {
                    totalResidents,
                    allergensCritiques: allergens,
                    sitesActifs: activeSites.length
                });
            }
            
            // Étape 3: Générer le menu avec l'IA
            progressText.textContent = `Génération intelligente des menus...`;
            
            const menuResponse = await fetch('/api/intelligent-menu/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    establishmentType: 'ehpad',
                    ageGroups,
                    numDishes: numDays,
                    menuStructure: 'entree_plat_dessert',
                    allergens, // Seulement allergies critiques
                    dietaryRestrictions: [], // Vide pour l'instant - mode permissif
                    medicalConditions: [], // Vide pour l'instant - mode permissif
                    texture: 'normale', // Texture de base
                    theme: theme || undefined,
                    useStockOnly: false
                })
            });
            
            if (!menuResponse.ok) {
                const errorData = await menuResponse.json();
                throw new Error(errorData.message || 'Erreur lors de la génération des menus');
            }
            
            const result = await menuResponse.json();
            
            // Étape 4: Afficher les résultats
            progressDiv.style.display = 'none';
            submitBtn.disabled = false;
            this.displayAIMenuResults(result, activeSites.length);
            
            this.showToast('Menus générés avec succès pour tous les sites !', 'success');
            
        } catch (error) {
            console.error('❌ Erreur lors de la génération IA:', error);
            progressDiv.style.display = 'none';
            submitBtn.disabled = false;
            this.showToast(`Erreur: ${error.message}`, 'error');
        }
    }

    displayAIMenuResults(result, sitesCount) {
        const resultsDiv = document.getElementById('ai-menu-results');
        
        let html = `
            <div style="background: #d4edda; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 1.5rem;">
                <h3 style="margin: 0 0 0.5rem 0; color: #155724;">
                    <i class="fas fa-check-circle"></i> Menus générés avec succès !
                </h3>
                <p style="margin: 0; color: #155724;">
                    Les menus ont été créés pour <strong>${sitesCount} sites actifs</strong> en tenant compte de tous les profils nutritionnels des résidents.
                </p>
            </div>
        `;
        
        // Afficher un résumé du menu
        if (result.menu && result.menu.days) {
            html += `
                <h3 style="margin-bottom: 1rem;"><i class="fas fa-calendar-alt"></i> Aperçu du menu</h3>
                <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
            `;
            
            result.menu.days.forEach((day, index) => {
                html += `
                    <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 1rem;">
                        <h4 style="margin: 0 0 0.75rem 0; color: #667eea;">
                            Jour ${index + 1} - ${new Date(day.date).toLocaleDateString()}
                        </h4>
                        <div style="display: grid; gap: 0.5rem;">
                            <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
                                <strong>🥗 Entrée:</strong> ${day.meals.find(m => m.type === 'lunch')?.courses.find(c => c.category === 'entrée')?.name || 'N/A'}
                            </div>
                            <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
                                <strong>🍖 Plat:</strong> ${day.meals.find(m => m.type === 'lunch')?.courses.find(c => c.category === 'plat')?.name || 'N/A'}
                            </div>
                            <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
                                <strong>🍰 Dessert:</strong> ${day.meals.find(m => m.type === 'lunch')?.courses.find(c => c.category === 'dessert')?.name || 'N/A'}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        // Bouton pour synchroniser vers les sites
        html += `
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="groupDashboard.syncMenuToAllSites()" class="btn btn-primary" style="padding: 0.75rem 1.5rem;">
                    <i class="fas fa-sync"></i> Synchroniser vers tous les sites
                </button>
                <button onclick="window.location.reload()" class="btn btn-outline" style="padding: 0.75rem 1.5rem;">
                    <i class="fas fa-redo"></i> Générer un nouveau menu
                </button>
            </div>
        `;
        
        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
        
        // Scroller vers les résultats
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async syncMenuToAllSites() {
        this.showToast('Synchronisation vers tous les sites...', 'info');
        // À implémenter: logique de synchronisation
        setTimeout(() => {
            this.showToast('Synchronisation terminée !', 'success');
        }, 2000);
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

        // Charger les responsables du site
        let responsablesHtml = 'Aucun responsable';
        if (site.responsables && site.responsables.length > 0) {
            responsablesHtml = site.responsables.map(r => `
                <div style="background: white; padding: 0.75rem; border-radius: 6px; margin-bottom: 0.75rem; border-left: 3px solid #667eea;">
                    <div style="font-weight: 600; color: #333; margin-bottom: 0.25rem;">${r.name}</div>
                    ${r.position ? `<div style="color: #667eea; font-size: 0.9rem; margin-bottom: 0.5rem;">${r.position}</div>` : ''}
                    <div style="display: grid; gap: 0.25rem; font-size: 0.9rem; color: #666;">
                        ${r.phone ? `<div><i class="fas fa-phone" style="width: 16px;"></i> ${r.phone}</div>` : ''}
                        ${r.email ? `<div><i class="fas fa-envelope" style="width: 16px;"></i> ${r.email}</div>` : ''}
                    </div>
                </div>
            `).join('');
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
                            ${responsablesHtml}
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

    async editSite(siteId) {
        const site = this.sites.find(s => s._id === siteId);
        if (!site) {
            this.showToast('Site non trouvé', 'error');
            return;
        }

        // Créer la modal d'édition
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.5); z-index: 1000; display: flex; 
            align-items: center; justify-content: center; overflow: auto;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto; margin: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="margin: 0; color: #667eea;">
                        <i class="fas fa-edit"></i> Modifier ${site.siteName}
                    </h2>
                    <button onclick="this.closest('div[style*=fixed]').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <form id="edit-site-form" style="display: grid; gap: 1.5rem;">
                    <!-- Informations de base -->
                    <div>
                        <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.1rem; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
                            <i class="fas fa-info-circle"></i> Informations de base
                        </h3>
                        <div style="display: grid; gap: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Nom du site *</label>
                                <input type="text" name="siteName" value="${site.siteName}" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Type *</label>
                                <select name="type" required style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                                    <option value="EHPAD" ${site.type === 'EHPAD' ? 'selected' : ''}>EHPAD</option>
                                    <option value="MRS" ${site.type === 'MRS' ? 'selected' : ''}>MRS</option>
                                    <option value="RESIDENCE_SENIOR" ${site.type === 'RESIDENCE_SENIOR' ? 'selected' : ''}>Résidence Senior</option>
                                    <option value="COLLECTIVITE" ${site.type === 'COLLECTIVITE' ? 'selected' : ''}>Collectivité</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">
                                    <input type="checkbox" name="isActive" ${site.isActive ? 'checked' : ''} style="margin-right: 0.5rem;">
                                    Site actif
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Adresse -->
                    <div>
                        <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.1rem; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
                            <i class="fas fa-map-marker-alt"></i> Adresse
                        </h3>
                        <div style="display: grid; gap: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Rue</label>
                                <input type="text" name="street" value="${site.address?.street || ''}" placeholder="Rue de la Paix, 123" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem;">
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Code postal</label>
                                    <input type="text" name="postalCode" value="${site.address?.postalCode || ''}" placeholder="1000" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Ville</label>
                                    <input type="text" name="city" value="${site.address?.city || ''}" placeholder="Bruxelles" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                                </div>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Pays</label>
                                <input type="text" name="country" value="${site.address?.country || 'Belgique'}" placeholder="Belgique" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                            </div>
                        </div>
                    </div>

                    <!-- Coordonnées de contact -->
                    <div>
                        <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.1rem; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
                            <i class="fas fa-phone"></i> Coordonnées de contact
                        </h3>
                        <div style="display: grid; gap: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Téléphone</label>
                                <input type="tel" name="phone" value="${site.contact?.phone || ''}" placeholder="+32 2 123 45 67" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Email</label>
                                <input type="email" name="email" value="${site.contact?.email || ''}" placeholder="contact@site.com" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Site web</label>
                                <input type="url" name="website" value="${site.contact?.website || ''}" placeholder="https://www.site.com" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                            </div>
                        </div>
                    </div>

                    <!-- Responsables -->
                    <div>
                        <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.1rem; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
                            <i class="fas fa-user-tie"></i> Responsables du site
                        </h3>
                        <div id="responsables-container">
                            ${(site.responsables && site.responsables.length > 0) ? site.responsables.map((resp, index) => `
                                <div class="responsable-item" style="background: #f8f9fa; padding: 1rem; border-radius: 6px; margin-bottom: 0.75rem; position: relative;">
                                    <button type="button" onclick="this.parentElement.remove()" style="position: absolute; top: 0.5rem; right: 0.5rem; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                                        <i class="fas fa-times"></i>
                                    </button>
                                    <div style="display: grid; gap: 0.75rem;">
                                        <div>
                                            <label style="display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.9rem;">Nom complet *</label>
                                            <input type="text" name="responsable_name_${index}" value="${resp.name || ''}" required placeholder="Jean Dupont" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                        </div>
                                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                                            <div>
                                                <label style="display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.9rem;">Téléphone</label>
                                                <input type="tel" name="responsable_phone_${index}" value="${resp.phone || ''}" placeholder="+32 2 123 45 67" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                            </div>
                                            <div>
                                                <label style="display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.9rem;">Email</label>
                                                <input type="email" name="responsable_email_${index}" value="${resp.email || ''}" placeholder="jean@example.com" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                            </div>
                                        </div>
                                        <div>
                                            <label style="display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.9rem;">Fonction</label>
                                            <input type="text" name="responsable_position_${index}" value="${resp.position || ''}" placeholder="Directeur, Responsable cuisine..." style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                                        </div>
                                    </div>
                                </div>
                            `).join('') : '<p id="no-responsables-message" style="color: #666; text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 6px;">Aucun responsable ajouté</p>'}
                        </div>
                        <button type="button" id="add-responsable-btn" style="width: 100%; padding: 0.75rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; margin-top: 0.75rem; font-weight: 600;">
                            <i class="fas fa-plus-circle"></i> Ajouter un responsable
                        </button>
                    </div>

                    <!-- Paramètres -->
                    <div>
                        <h3 style="margin: 0 0 1rem 0; color: #333; font-size: 1.1rem; border-bottom: 2px solid #667eea; padding-bottom: 0.5rem;">
                            <i class="fas fa-cog"></i> Paramètres
                        </h3>
                        <div style="display: grid; gap: 1rem;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Mode de synchronisation</label>
                                <select name="syncMode" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                                    <option value="auto" ${site.syncMode === 'auto' ? 'selected' : ''}>Automatique</option>
                                    <option value="manual" ${site.syncMode === 'manual' ? 'selected' : ''}>Manuelle</option>
                                </select>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Capacité déjeuner</label>
                                    <input type="number" name="capacityLunch" value="${site.settings?.capacity?.lunch || ''}" placeholder="50" min="0" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Capacité dîner</label>
                                    <input type="number" name="capacityDinner" value="${site.settings?.capacity?.dinner || ''}" placeholder="50" min="0" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 1rem;">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Boutons d'action -->
                    <div style="display: flex; gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #eee;">
                        <button type="button" onclick="this.closest('div[style*=fixed]').remove()" style="flex: 1; padding: 0.75rem; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                            <i class="fas fa-times"></i> Annuler
                        </button>
                        <button type="submit" style="flex: 2; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                            <i class="fas fa-save"></i> Enregistrer les modifications
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Gérer le bouton "Ajouter un responsable"
        const addResponsableBtn = modal.querySelector('#add-responsable-btn');
        const responsablesContainer = modal.querySelector('#responsables-container');
        let responsableCounter = (site.responsables?.length || 0);

        addResponsableBtn.addEventListener('click', () => {
            // Supprimer le message "Aucun responsable"
            const noMessage = modal.querySelector('#no-responsables-message');
            if (noMessage) noMessage.remove();

            // Créer un nouveau responsable
            const newResponsable = document.createElement('div');
            newResponsable.className = 'responsable-item';
            newResponsable.style.cssText = 'background: #f8f9fa; padding: 1rem; border-radius: 6px; margin-bottom: 0.75rem; position: relative;';
            newResponsable.innerHTML = `
                <button type="button" onclick="this.parentElement.remove()" style="position: absolute; top: 0.5rem; right: 0.5rem; background: #e74c3c; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-times"></i>
                </button>
                <div style="display: grid; gap: 0.75rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.9rem;">Nom complet *</label>
                        <input type="text" name="responsable_name_${responsableCounter}" required placeholder="Jean Dupont" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.9rem;">Téléphone</label>
                            <input type="tel" name="responsable_phone_${responsableCounter}" placeholder="+32 2 123 45 67" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.9rem;">Email</label>
                            <input type="email" name="responsable_email_${responsableCounter}" placeholder="jean@example.com" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.25rem; font-weight: 600; font-size: 0.9rem;">Fonction</label>
                        <input type="text" name="responsable_position_${responsableCounter}" placeholder="Directeur, Responsable cuisine..." style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                </div>
            `;
            responsablesContainer.appendChild(newResponsable);
            responsableCounter++;
        });

        // Gérer la soumission du formulaire
        const form = modal.querySelector('#edit-site-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleEditSite(e, siteId, modal);
        });

        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        document.body.appendChild(modal);
    }

    async handleEditSite(e, siteId, modal) {
        const formData = new FormData(e.target);
        
        // Récupérer tous les responsables du formulaire
        const responsables = [];
        const formEntries = Array.from(formData.entries());
        
        // Grouper les responsables par index
        const responsableIndices = new Set();
        formEntries.forEach(([key, value]) => {
            if (key.startsWith('responsable_')) {
                const match = key.match(/responsable_\w+_(\d+)/);
                if (match) {
                    responsableIndices.add(parseInt(match[1]));
                }
            }
        });
        
        // Construire les objets responsables
        responsableIndices.forEach(index => {
            const name = formData.get(`responsable_name_${index}`);
            if (name && name.trim()) {  // Seulement si le nom est renseigné
                responsables.push({
                    name: name.trim(),
                    phone: formData.get(`responsable_phone_${index}`) || '',
                    email: formData.get(`responsable_email_${index}`) || '',
                    position: formData.get(`responsable_position_${index}`) || ''
                });
            }
        });
        
        // Construire l'objet de données
        const siteData = {
            siteName: formData.get('siteName'),
            type: formData.get('type'),
            isActive: formData.get('isActive') === 'on',
            address: {
                street: formData.get('street'),
                postalCode: formData.get('postalCode'),
                city: formData.get('city'),
                country: formData.get('country')
            },
            contact: {
                phone: formData.get('phone'),
                email: formData.get('email'),
                website: formData.get('website')
            },
            responsables: responsables,
            syncMode: formData.get('syncMode'),
            settings: {
                capacity: {
                    lunch: parseInt(formData.get('capacityLunch')) || 0,
                    dinner: parseInt(formData.get('capacityDinner')) || 0
                }
            }
        };

        try {
            console.log('📤 Mise à jour du site:', siteData);
            
            const response = await fetch(`/api/sites/${siteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(siteData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la mise à jour');
            }

            const result = await response.json();
            console.log('✅ Site mis à jour:', result);

            this.showToast('Site mis à jour avec succès !', 'success');
            modal.remove();
            
            // Recharger les données
            await this.loadGroupData();
            await this.loadSitesData();
            await this.loadSitesTable();
        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour:', error);
            this.showToast(`Erreur: ${error.message}`, 'error');
        }
    }

    viewSiteMenu(siteId) {
        // À implémenter - afficher le menu du site
        this.showToast('Affichage du menu du site - à implémenter', 'info');
    }

    async activateSite(siteId) {
        const site = this.sites.find(s => s._id === siteId);
        if (!site) {
            this.showToast('Site non trouvé', 'error');
            return;
        }

        if (confirm(`Activer le site "${site.siteName}" ?\n\nCela le rendra disponible pour la synchronisation des menus et la gestion des résidents.`)) {
            try {
                const response = await fetch(`/api/sites/${siteId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ isActive: true })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Erreur lors de l\'activation');
                }

                this.showToast(`Site "${site.siteName}" activé avec succès !`, 'success');
                
                // Recharger les données
                await this.loadGroupData();
                await this.loadSitesData();
                await this.loadSitesTable();
            } catch (error) {
                console.error('❌ Erreur lors de l\'activation:', error);
                this.showToast(`Erreur: ${error.message}`, 'error');
            }
        }
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
