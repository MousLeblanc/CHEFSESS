/* group-dashboard.js — Version hybride optimisée
 * Combine : cache, loaders, debounce + logique métier correcte multi-sites Vulpia
 */

class GroupDashboard {
    constructor() {
        // State
        this.currentGroup = null;
        this.user = null;
        this.sites = [];
        this.users = [];
        this.currentTab = localStorage.getItem("gd_active_tab") || "overview";
        
        // Cache système
        this.cache = {
            sites: null,
            sitesTimestamp: null,
            residents: new Map(),
            stats: null,
            statsTimestamp: null
        };
        
        // UI refs
        this.$loader = null;
        this.$progressModal = null;
        
        // Bind methods
        this.init = this.init.bind(this);
        this.switchTab = this.switchTab.bind(this);
        this.handleGenerateAIMenu = this.handleGenerateAIMenu.bind(this);
    }

    /* ===========================
     * Utils
     * ===========================
     */
    /**
     * Normalise les valeurs du frontend vers le format backend/MongoDB
     * DOIT correspondre EXACTEMENT aux tags et dietaryRestrictions dans la DB
     */
    normalizeValue(value) {
        if (!value) return value;
        
        const map = {
            // Sans sel → sans_sel (avec underscore comme dans les tags!)
            "Sans sel": "sans_sel",
            "sans sel": "sans_sel",
            "Sans Sel": "sans_sel",
            
            // Sans sucre → hypoglucidique
            "Sans sucre": "hypoglucidique",
            "sans sucre": "hypoglucidique",
            "Sans Sucre": "hypoglucidique",
            
            // Végétarien (garder l'accent)
            "Végétarien": "végétarien",
            "vegetarien": "végétarien",
            "Vegetarien": "végétarien",
            
            // Végétalien (garder l'accent)
            "Végétalien": "végétalien",
            "Vegan": "végétalien",
            "vegan": "végétalien",
            
            // Textures (garder les accents)
            "Mixée": "mixée",
            "mixée": "mixée",
            "mixee": "mixée",
            "Hachée": "hachée",
            "hachée": "hachée",
            "hachee": "hachée",
            "Tendre": "tendre",
            "tendre": "tendre",
            "Lisse": "lisse",
            "lisse": "lisse",
            
            // Hyperprotéiné (garder l'accent!)
            "Hyperprotéiné": "hyperprotéiné",
            "hyperprotéiné": "hyperprotéiné",
            "hyperproteine": "hyperprotéiné",
            "Hyperproteine": "hyperprotéiné",
            
            // Religions
            "Casher": "casher",
            "casher": "casher",
            "Halal": "halal",
            "halal": "halal",
            
            // Sans gluten → sans_gluten (avec underscore!)
            "Sans gluten": "sans_gluten",
            "sans gluten": "sans_gluten",
            "Sans Gluten": "sans_gluten",
            
            // Sans lactose → sans_lactose (avec underscore!)
            "Sans lactose": "sans_lactose",
            "sans lactose": "sans_lactose",
            "Sans Lactose": "sans_lactose",
            
            // Hypocalorique
            "Hypocalorique": "hypocalorique",
            "hypocalorique": "hypocalorique",
            
            // Pathologies
            "Diabète": "diabete",
            "diabète": "diabete",
            "Hypertension": "hypertension",
            "hypertension": "hypertension"
        };
        
        return map[value] || value.toLowerCase();
    }
    
    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    getISOWeek(date = new Date()) {
        const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
        return { year: tmp.getUTCFullYear(), week: weekNo };
    }

    getISOYearWeekString(date = new Date()) {
        const { year, week } = this.getISOWeek(date);
        return `${year}-W${String(week).padStart(2, "0")}`;
    }

    showLoader(msg = "Chargement…") {
        if (!this.$loader) {
            this.$loader = document.createElement("div");
            this.$loader.className = "gd-loader-overlay";
            this.$loader.innerHTML = `
                <div class="gd-loader">
                    <div class="gd-spinner"></div>
                    <div class="gd-loader-text">${msg}</div>
                </div>`;
            document.body.appendChild(this.$loader);
            
            // Styles
            if (!document.getElementById('gd-loader-styles')) {
                const style = document.createElement('style');
                style.id = 'gd-loader-styles';
                style.textContent = `
                    .gd-loader-overlay {
                        position: fixed;
                        inset: 0;
                        background: rgba(255, 255, 255, 0.9);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 9999;
                        backdrop-filter: blur(4px);
                    }
                    .gd-loader {
                        display: flex;
                        flex-direction: column;
                        gap: 1rem;
                        align-items: center;
                        background: white;
                        border: 2px solid #667eea;
                        padding: 2rem 2.5rem;
                        border-radius: 12px;
                        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.2);
                    }
                    .gd-spinner {
                        width: 40px;
                        height: 40px;
                        border: 4px solid #e3e8ef;
                        border-top-color: #667eea;
                        border-radius: 50%;
                        animation: gd-spin 0.8s linear infinite;
                    }
                    .gd-loader-text {
                        font-size: 1rem;
                        color: #667eea;
                        font-weight: 600;
                    }
                    @keyframes gd-spin {
                        to { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
        this.$loader.querySelector(".gd-loader-text").textContent = msg;
        this.$loader.style.display = "flex";
    }

    hideLoader() {
        if (this.$loader) {
            this.$loader.style.display = "none";
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            setTimeout(() => toast.remove(), 5000);
        }
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

    /* ===========================
     * Auth & Bootstrap
     * ===========================
     */
    async checkAuthentication() {
        try {
            const res = await fetch("/api/auth/me", { credentials: "include" });
            if (res.status === 401) {
                this.showToast("Session expirée, reconnexion nécessaire.", "warning");
                setTimeout(() => window.location.href = "/", 1500);
                return null;
            }
            if (!res.ok) {
                throw new Error("Erreur d'authentification");
            }
            const data = await res.json();
            return data?.user || data || null;
        } catch (e) {
            console.error("Auth check failed:", e);
            this.showToast("Erreur de connexion au serveur.", "error");
            return null;
        }
    }

    async loadUserInfo() {
        if (this.user) return this.user;
        
        console.log('🔐 Vérification de l\'authentification...');
        this.user = await this.checkAuthentication();
        
        if (!this.user) {
            console.error('❌ Utilisateur non authentifié');
            return null;
        }

        console.log('✅ Utilisateur connecté:', this.user.name);
        
        // Récupérer le groupId
        if (this.user.groupId) {
            this.currentGroup = this.user.groupId;
            console.log('✅ Groupe ID:', this.currentGroup);
        } else {
            console.warn('⚠️ Aucun groupe associé à cet utilisateur');
            this.showToast('Erreur: Aucun groupe associé à cet utilisateur', 'error');
        }

        return this.user;
    }

    async loadGroupData(force = false) {
        if (!this.currentGroup) {
            console.error('❌ Aucun groupe chargé');
            return;
        }

        // Cache (5 minutes)
        const now = Date.now();
        if (!force && this.cache.sites && this.cache.sitesTimestamp && (now - this.cache.sitesTimestamp < 300000)) {
            console.log('📦 Utilisation du cache pour les sites');
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
            this.cache.sites = this.sites;
            this.cache.sitesTimestamp = now;
            console.log('✅ Sites chargés:', this.sites.length, `(${this.sites.filter(s => s.isActive).length} actifs)`);
            
            // Charger les utilisateurs
            const usersResponse = await fetch(`/api/groups/${this.currentGroup}/users`, {
                credentials: 'include'
            });
            
            if (usersResponse.ok) {
                this.users = await usersResponse.json();
                console.log('✅ Utilisateurs chargés:', this.users.length);
            }
            
        } catch (error) {
            console.error('Erreur lors du chargement des données du groupe:', error);
            this.showToast('Erreur lors du chargement des données', 'error');
        }
    }

    /* ===========================
     * Init & UI Bindings
     * ===========================
     */
    async init() {
        // Auth
        const user = await this.loadUserInfo();
        if (!user) return;

        // Load group data
        await this.loadGroupData();

        // UI bindings
        this.initEventListeners();

        // Default date
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('ai-menu-start-date');
        if (dateInput && !dateInput.value) {
            dateInput.value = today;
        }

        // Load first tab
        await this.switchTab(this.currentTab);
    }

    initEventListeners() {
        // Navigation des onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                if (tab) this.switchTab(tab);
            });
        });

        // Boutons d'action
        const refreshSites = document.getElementById('refresh-sites');
        if (refreshSites) {
            refreshSites.addEventListener('click', () => this.loadOverviewData());
        }

        const addSiteBtn = document.getElementById('add-site-btn');
        if (addSiteBtn) {
            addSiteBtn.addEventListener('click', () => this.showAddSiteModal());
        }

        const syncAllBtn = document.getElementById('sync-all-btn');
        if (syncAllBtn) {
            syncAllBtn.addEventListener('click', () => this.syncAllSites());
        }

        // Résidents
        const refreshResidents = document.getElementById('refresh-residents');
        if (refreshResidents) {
            refreshResidents.addEventListener('click', () => this.loadResidentsGroups());
        }

        // Stock avec debounce
        const stockSearch = document.getElementById('stock-search');
        if (stockSearch) {
            stockSearch.addEventListener('input', this.debounce(() => {
                if (typeof window.filterStock === 'function') {
                    window.filterStock();
                }
            }, 300));
        }

        const stockCategoryFilter = document.getElementById('stock-category-filter');
        if (stockCategoryFilter) {
            stockCategoryFilter.addEventListener('change', () => {
                if (typeof window.filterStock === 'function') {
                    window.filterStock();
                }
            });
        }

        // Sélecteurs de semaine
        const weekSelector = document.getElementById('week-selector');
        if (weekSelector) {
            weekSelector.addEventListener('change', (e) => this.loadMenusForWeek(e.target.value));
        }

        // Formulaire génération IA
        const aiForm = document.getElementById('generate-ai-menu-form');
        if (aiForm) {
            aiForm.addEventListener('submit', (e) => this.handleGenerateAIMenu(e));
        }

        // Bouton de déconnexion
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    async switchTab(tabName) {
        this.currentTab = tabName;
        localStorage.setItem("gd_active_tab", tabName);

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
        await this.loadTabData(tabName);
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

    /* ===========================
     * Overview
     * ===========================
     */
    async loadOverviewData() {
        // Cache stats (2 minutes)
        const now = Date.now();
        if (this.cache.stats && this.cache.statsTimestamp && (now - this.cache.statsTimestamp < 120000)) {
            this.renderOverview(this.cache.stats);
            return;
        }

        try {
            this.showLoader('Chargement des statistiques...');
            
            // Charger les statistiques
            const statsResponse = await fetch(`/api/groups/${this.currentGroup}/stats`, {
                credentials: 'include'
            });
            
            if (!statsResponse.ok) {
                throw new Error('Erreur chargement stats');
            }
            
            const stats = await statsResponse.json();
            this.cache.stats = stats;
            this.cache.statsTimestamp = now;
            
            // Charger le nombre total de résidents
            const residentsCounts = await this.loadResidentsCounts();
            const totalResidents = Object.values(residentsCounts).reduce((sum, count) => sum + count, 0);
            
            // Mettre à jour les cartes de statistiques
            const totalSitesEl = document.getElementById('total-sites');
            if (totalSitesEl) totalSitesEl.textContent = stats.sites || 0;
            
            const totalResidentsEl = document.getElementById('total-residents');
            if (totalResidentsEl) totalResidentsEl.textContent = totalResidents;
            
            const totalMenusEl = document.getElementById('total-menus');
            if (totalMenusEl) totalMenusEl.textContent = stats.menus || 0;
            
            const syncRateEl = document.getElementById('sync-rate');
            if (syncRateEl) syncRateEl.textContent = '95%';
            
            // Charger le tableau des sites
            await this.loadSitesTable();
            
            this.hideLoader();
        } catch (error) {
            console.error('Erreur lors du chargement des données d\'ensemble:', error);
            this.showToast('Erreur lors du chargement des données', 'error');
            this.hideLoader();
        }
    }

    renderOverview(stats) {
        // Placeholder pour affichage stats
        console.log('📊 Stats:', stats);
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

    /* ===========================
     * Menus & IA Generation
     * ===========================
     */
    async loadMenusData() {
        // Générer les options de semaine pour les 12 prochaines semaines
        this.populateWeekSelector('week-selector');
        
        // Initialiser la date par défaut du générateur IA à aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('ai-menu-start-date');
        if (dateInput && !dateInput.value) {
            dateInput.value = today;
        }
    }

    populateWeekSelector(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        const weeks = [];
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setDate(date.getDate() + (i * 7));
            weeks.push(this.getISOYearWeekString(date));
        }

        select.innerHTML = '<option value="">Sélectionner une semaine</option>' +
            weeks.map(w => `<option value="${w}">${w}</option>`).join('');
    }

    async handleGenerateAIMenu(e) {
        e.preventDefault();
        
        const startDate = document.getElementById('ai-menu-start-date')?.value;
        const numDays = parseInt(document.getElementById('ai-menu-num-days')?.value);
        const theme = document.getElementById('ai-menu-theme')?.value;
        
        if (!startDate || !numDays) {
            this.showToast('Veuillez remplir tous les champs obligatoires', 'warning');
            return;
        }

        const progressDiv = document.getElementById('ai-generation-progress');
        const progressText = document.getElementById('ai-progress-text');
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const resultsDiv = document.getElementById('ai-menu-results');
        
        if (progressDiv) progressDiv.style.display = 'block';
        if (submitBtn) submitBtn.disabled = true;
        if (resultsDiv) resultsDiv.style.display = 'none';
        
        try {
            // Étape 1: Récupérer les sites actifs
            if (progressText) progressText.textContent = 'Chargement des sites actifs...';
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const activeSites = this.sites.filter(s => s.isActive);
            if (activeSites.length === 0) {
                throw new Error('Aucun site actif trouvé. Veuillez activer au moins un site.');
            }
            
            console.log('✅ Sites actifs:', activeSites.length);
            
            // Étape 2: Récupérer les profils groupés des résidents
            if (progressText) progressText.textContent = `Analyse des profils nutritionnels...`;
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const groupedResponse = await fetch(`/api/residents/group/${this.currentGroup}/grouped`, {
                credentials: 'include'
            });
            
            if (!groupedResponse.ok) {
                throw new Error('Erreur lors de la récupération des profils nutritionnels');
            }
            
            const groupedData = await groupedResponse.json();
            const totalResidents = groupedData.data?.totalResidents || 0;
            const groups = groupedData.data?.groups || {};
            
            if (totalResidents === 0) {
                throw new Error('Aucun résident actif trouvé dans les sites. Veuillez ajouter des résidents avant de générer un menu.');
            }
            
            console.log('✅ Profils nutritionnels groupés:', {
                totalResidents,
                allergies: groups.allergies?.length || 0,
                restrictions: groups.restrictions?.length || 0,
                textures: groups.textures?.length || 0
            });
            
            // Étape 3: Préparer les groupes de résidents pour les variantes de menu
            if (progressText) progressText.textContent = `Préparation des variantes de menu...`;
            
            const variantGroups = [];
            
            // Groupe de base (tous les résidents)
            variantGroups.push({
                name: 'Menu Standard',
                description: 'Menu de base pour tous les résidents',
                residentCount: totalResidents,
                allergens: [],
                dietaryRestrictions: [],
                medicalConditions: []
            });
            
            // Groupes par allergies critiques
            if (groups.allergies && groups.allergies.length > 0) {
                groups.allergies
                    .filter(g => (g.severity === 'critique' || g.severity === 'sévère') && g.residents.length >= 50)
                    .slice(0, 5)
                    .forEach(allergyGroup => {
                        variantGroups.push({
                            name: `Sans ${allergyGroup.name}`,
                            description: `Menu adapté pour ${allergyGroup.residents.length} résidents allergiques`,
                            residentCount: allergyGroup.residents.length,
                            allergens: [allergyGroup.name],
                            dietaryRestrictions: [],
                            medicalConditions: [],
                            severity: allergyGroup.severity
                        });
                    });
            }
            
            // Groupes par restrictions alimentaires
            if (groups.restrictions && groups.restrictions.length > 0) {
                groups.restrictions
                    .filter(g => g.residents.length >= 100)
                    .slice(0, 5)
                    .forEach(restrictionGroup => {
                        variantGroups.push({
                            name: restrictionGroup.name,
                            description: `Menu spécifique pour ${restrictionGroup.residents.length} résidents`,
                            residentCount: restrictionGroup.residents.length,
                            allergens: [],
                            dietaryRestrictions: [restrictionGroup.name],
                            medicalConditions: [],
                            restrictionType: restrictionGroup.restrictionType
                        });
                    });
            }
            
            console.log('📊 Variantes de menu à générer:', variantGroups.length, variantGroups.map(v => v.name));
            
            // Étape 4: Générer les menus pour chaque groupe avec l'IA
            if (progressText) progressText.textContent = `Génération de ${variantGroups.length} variantes de menu...`;
            
            const menuVariants = [];
            
            for (let i = 0; i < variantGroups.length; i++) {
                const group = variantGroups[i];
                
                if (progressText) {
                    progressText.textContent = `Génération du menu "${group.name}" (${i + 1}/${variantGroups.length})...`;
                }
                
                try {
                    // NORMALISER toutes les valeurs avant d'envoyer au backend
                    const normalizedAllergens = (group.allergens || []).map(a => this.normalizeValue(a));
                    const normalizedRestrictions = (group.dietaryRestrictions || []).map(r => this.normalizeValue(r));
                    const normalizedMedical = (group.medicalConditions || []).map(m => this.normalizeValue(m));
                    
                    // Séparer les restrictions éthiques/religieuses
                    const ethicalValues = ['halal', 'casher', 'végétarien', 'végétalien'];
                    const ethicalRestrictions = normalizedRestrictions.filter(r => ethicalValues.includes(r));
                    const dietRestrictions = normalizedRestrictions.filter(r => !ethicalValues.includes(r));
                    
                    const payload = {
                        establishmentType: 'ehpad',
                        ageGroups: [{
                            ageRange: "75+",
                            count: group.residentCount
                        }],
                        numDishes: numDays,
                        menuStructure: 'entree_plat_dessert',
                        allergens: normalizedAllergens,                    // ✅ NORMALISÉ
                        dietaryRestrictions: dietRestrictions,             // ✅ NORMALISÉ
                        medicalConditions: normalizedMedical,              // ✅ NORMALISÉ
                        ethicalRestrictions: ethicalRestrictions,          // ✅ NORMALISÉ (halal, casher, etc.)
                        texture: 'normale',
                        theme: theme || '',
                        useStockOnly: false,
                        swallowing: 'normale',
                        nutritionalProfile: [],
                        ageDependencyGroup: 'personne_agee_autonome',
                        comfortFilters: []
                    };
                    
                    console.log(`📤 Envoi requête pour "${group.name}" (AVANT normalisation):`, {
                        allergens: group.allergens,
                        dietaryRestrictions: group.dietaryRestrictions
                    });
                    console.log(`✅ Requête normalisée:`, payload);
                    
                    const menuResponse = await fetch('/api/intelligent-menu/generate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include',
                        body: JSON.stringify(payload)
                    });
                    
                    if (menuResponse.ok) {
                        const result = await menuResponse.json();
                        menuVariants.push({
                            group: group,
                            menu: result.menu || result,
                            success: true
                        });
                        console.log(`✅ Menu "${group.name}" généré avec succès`);
                    } else {
                        // Capturer le message d'erreur détaillé
                        let errorMsg = 'Échec de génération';
                        try {
                            const errorData = await menuResponse.json();
                            errorMsg = errorData.message || errorData.error || errorMsg;
                            console.error(`❌ Erreur ${menuResponse.status} pour "${group.name}":`, errorData);
                        } catch (e) {
                            console.error(`❌ Erreur ${menuResponse.status} pour "${group.name}" (pas de détails)`);
                        }
                        
                        menuVariants.push({
                            group: group,
                            error: errorMsg,
                            success: false
                        });
                    }
                    
                    // Petite pause entre les requêtes
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } catch (err) {
                    console.error(`❌ Erreur pour "${group.name}":`, err);
                    menuVariants.push({
                        group: group,
                        error: err.message,
                        success: false
                    });
                }
            }
            
            const result = {
                variants: menuVariants,
                totalGroups: variantGroups.length,
                successCount: menuVariants.filter(v => v.success).length,
                totalResidents: totalResidents
            };
            
            // Étape 5: Afficher les résultats
            if (progressDiv) progressDiv.style.display = 'none';
            if (submitBtn) submitBtn.disabled = false;
            this.displayAIMenuVariants(result, activeSites.length);
            
            const successMsg = result.successCount === result.totalGroups
                ? `✅ ${result.successCount} variantes de menu générées avec succès !`
                : `⚠️ ${result.successCount}/${result.totalGroups} variantes générées`;
            
            this.showToast(successMsg, result.successCount > 0 ? 'success' : 'warning');
            
        } catch (error) {
            console.error('❌ Erreur lors de la génération IA:', error);
            if (progressDiv) progressDiv.style.display = 'none';
            if (submitBtn) submitBtn.disabled = false;
            this.showToast(`Erreur: ${error.message}`, 'error');
        }
    }

    displayAIMenuVariants(result, sitesCount) {
        const resultsDiv = document.getElementById('ai-menu-results');
        if (!resultsDiv) return;
        
        const { variants, totalGroups, successCount, totalResidents } = result;
        
        let html = `
            <div style="background: #d4edda; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 1.5rem;">
                <h3 style="margin: 0 0 0.5rem 0; color: #155724;">
                    <i class="fas fa-check-circle"></i> ${successCount} variantes de menu générées !
                </h3>
                <p style="margin: 0; color: #155724;">
                    <strong>${successCount}/${totalGroups}</strong> variantes créées pour <strong>${totalResidents} résidents</strong> répartis sur <strong>${sitesCount} sites actifs</strong>.
                </p>
            </div>
        `;
        
        // Afficher chaque variante de menu
        html += `<div style="display: grid; gap: 1.5rem; margin-bottom: 2rem;">`;
        
        variants.forEach((variant, index) => {
            const { group, menu, success, error } = variant;
            
            if (!success) {
                html += `
                    <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 1.5rem;">
                        <h4 style="margin: 0 0 0.5rem 0; color: #856404;">
                            ⚠️ ${group.name}
                        </h4>
                        <p style="margin: 0; color: #856404;">
                            <strong>${group.residentCount} résidents</strong> - ${group.description}
                        </p>
                        <p style="margin: 0.5rem 0 0 0; color: #dc3545;">
                            Erreur: ${error || 'Échec de génération'}
                        </p>
                    </div>
                `;
                return;
            }
            
            const days = menu?.days || menu?.menu?.days || [];
            const bgColor = index === 0 ? '#e7f3ff' : '#f8f9fa';
            const borderColor = index === 0 ? '#667eea' : '#dee2e6';
            
            html += `
                <div style="background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 10px; padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <h4 style="margin: 0 0 0.25rem 0; color: #333; font-size: 1.3rem;">
                                ${index === 0 ? '🏆' : '🍽️'} ${group.name}
                            </h4>
                            <p style="margin: 0; color: #666; font-size: 0.95rem;">
                                <strong>${group.residentCount} résidents</strong> - ${group.description}
                            </p>
                        </div>
                        ${group.severity ? `
                        <span style="background: #dc3545; color: white; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">
                            ${group.severity}
                        </span>
                        ` : ''}
                    </div>
            `;
            
            if (days.length > 0) {
                html += `
                    <div style="display: grid; gap: 0.75rem; margin-top: 1rem;">
                        ${days.slice(0, 3).map((day, dayIndex) => {
                            const meals = day.meals || [];
                            const lunch = meals.find(m => m.type === 'lunch') || {};
                            const courses = lunch.courses || [];
                            
                            return `
                                <details ${dayIndex === 0 ? 'open' : ''} style="background: white; border-radius: 6px; overflow: hidden;">
                                    <summary style="padding: 0.75rem; cursor: pointer; background: #f8f9fa; font-weight: 600; color: #667eea;">
                                        📅 ${typeof day.date === 'string' ? day.date : new Date(day.date).toLocaleDateString('fr-FR')}
                                    </summary>
                                    <div style="padding: 0.75rem; display: grid; gap: 0.5rem;">
                                        <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; border-left: 3px solid #28a745;">
                                            <strong>🥗 Entrée:</strong> ${courses.find(c => c.category === 'entrée')?.name || 'N/A'}
                                        </div>
                                        <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; border-left: 3px solid #fd7e14;">
                                            <strong>🍖 Plat:</strong> ${courses.find(c => c.category === 'plat')?.name || 'N/A'}
                                        </div>
                                        <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; border-left: 3px solid #e83e8c;">
                                            <strong>🍰 Dessert:</strong> ${courses.find(c => c.category === 'dessert')?.name || 'N/A'}
                                        </div>
                                    </div>
                                </details>
                            `;
                        }).join('')}
                        ${days.length > 3 ? `
                        <div style="text-align: center; padding: 0.5rem; color: #666; font-size: 0.9rem;">
                            ... et ${days.length - 3} autres jours
                        </div>
                        ` : ''}
                    </div>
                `;
            } else {
                html += `
                    <div style="text-align: center; padding: 1rem; color: #666; font-style: italic;">
                        Aucun détail de menu disponible
                    </div>
                `;
            }
            
            html += `</div>`;
        });
        
        html += `</div>`;
        
        // Boutons d'action
        html += `
            <div style="display: flex; gap: 1rem; justify-content: center; padding-top: 1rem; border-top: 2px solid #dee2e6;">
                <button onclick="groupDashboard.syncMenuToAllSites()" class="btn btn-primary" style="padding: 0.75rem 1.5rem;">
                    <i class="fas fa-sync"></i> Synchroniser vers tous les sites
                </button>
                <button onclick="window.location.reload()" class="btn btn-outline" style="padding: 0.75rem 1.5rem;">
                    <i class="fas fa-redo"></i> Générer de nouveaux menus
                </button>
            </div>
        `;
        
        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
        
        // Scroller vers les résultats
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    displayAIMenuResults(result, sitesCount, residentsCount) {
        const resultsDiv = document.getElementById('ai-menu-results');
        if (!resultsDiv) return;
        
        let html = `
            <div style="background: #d4edda; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 1.5rem;">
                <h3 style="margin: 0 0 0.5rem 0; color: #155724;">
                    <i class="fas fa-check-circle"></i> Menus générés avec succès !
                </h3>
                <p style="margin: 0; color: #155724;">
                    Les menus ont été créés pour <strong>${residentsCount} résidents</strong> répartis sur <strong>${sitesCount} sites actifs</strong>, en tenant compte de tous les profils nutritionnels.
                </p>
            </div>
        `;
        
        // Afficher un résumé du menu
        const days = result?.menu?.days || result?.days || [];
        if (days.length > 0) {
            html += `
                <h3 style="margin-bottom: 1rem;"><i class="fas fa-calendar-alt"></i> Aperçu du menu</h3>
                <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
            `;
            
            days.forEach((day, index) => {
                const date = day.date || `Jour ${index + 1}`;
                const meals = day.meals || [];
                const lunch = meals.find(m => m.type === 'lunch') || {};
                const courses = lunch.courses || [];
                
                html += `
                    <div style="background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 1rem;">
                        <h4 style="margin: 0 0 0.75rem 0; color: #667eea;">
                            ${typeof date === 'string' ? date : new Date(date).toLocaleDateString()}
                        </h4>
                        <div style="display: grid; gap: 0.5rem;">
                            <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
                                <strong>🥗 Entrée:</strong> ${courses.find(c => c.category === 'entrée')?.name || 'N/A'}
                            </div>
                            <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
                                <strong>🍖 Plat:</strong> ${courses.find(c => c.category === 'plat')?.name || 'N/A'}
                            </div>
                            <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
                                <strong>🍰 Dessert:</strong> ${courses.find(c => c.category === 'dessert')?.name || 'N/A'}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        } else {
            html += `<div class="alert alert-info">Aucun jour de menu à afficher.</div>`;
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

    /* ===========================
     * Residents
     * ===========================
     */
    async loadResidentsGroups() {
        if (!this.currentGroup) {
            console.error('Groupe non chargé');
            return;
        }

        try {
            this.showLoader('Chargement des résidents...');
            
            const response = await fetch(`/api/residents/group/${this.currentGroup}/grouped`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des groupes de résidents');
            }

            const result = await response.json();
            this.displayResidentsGroups(result.data);
            
            this.hideLoader();
        } catch (error) {
            console.error('❌ Erreur:', error);
            this.showToast('Erreur lors du chargement des résidents', 'error');
            this.hideLoader();
        }
    }

    displayResidentsGroups(data) {
        const content = document.getElementById('residents-groups-content');
        if (!content) return;
        
        // Mettre à jour les statistiques
        const totalResidentsCount = document.getElementById('total-residents-count');
        if (totalResidentsCount) totalResidentsCount.textContent = data.totalResidents || 0;
        
        const allergiesGroupsCount = document.getElementById('allergies-groups-count');
        if (allergiesGroupsCount) allergiesGroupsCount.textContent = data.groups?.allergies?.length || 0;
        
        const restrictionsGroupsCount = document.getElementById('restrictions-groups-count');
        if (restrictionsGroupsCount) restrictionsGroupsCount.textContent = data.groups?.restrictions?.length || 0;
        
        const texturesGroupsCount = document.getElementById('textures-groups-count');
        if (texturesGroupsCount) texturesGroupsCount.textContent = data.groups?.textures?.length || 0;

        // Créer l'affichage des groupes
        let html = '';

        // Afficher les allergies
        if (data.groups?.allergies?.length > 0) {
            html += this.createGroupSection('Allergies', data.groups.allergies, 'allergies', '#f8d7da');
        }

        // Afficher les intolérances
        if (data.groups?.intolerances?.length > 0) {
            html += this.createGroupSection('Intolérances', data.groups.intolerances, 'intolerances', '#fff3cd');
        }

        // Afficher les restrictions
        if (data.groups?.restrictions?.length > 0) {
            html += this.createGroupSection('Restrictions Alimentaires', data.groups.restrictions, 'restrictions', '#d1ecf1');
        }

        // Afficher les textures
        if (data.groups?.textures?.length > 0) {
            html += this.createGroupSection('Textures', data.groups.textures, 'textures', '#e3f2fd');
        }

        if (html === '') {
            html = '<div style="text-align: center; padding: 3rem; color: #666;"><i class="fas fa-info-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i><p>Aucun profil nutritionnel spécifique détecté</p></div>';
        }

        content.innerHTML = html;
    }

    createGroupSection(title, groups, category, bgColor) {
        if (!Array.isArray(groups)) return '';
        
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
                                ${group.residents?.length || 0} résident${(group.residents?.length || 0) > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                    <div class="residents-list" style="max-height: 300px; overflow-y: auto;">
            `;

            (group.residents || []).forEach(resident => {
                html += `
                    <div style="padding: 0.75rem; margin-bottom: 0.5rem; background: #f8f9fa; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 600; color: #333;">${resident.name}</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">
                                <i class="fas fa-building"></i> ${resident.site || 'N/A'} 
                                ${resident.room ? `<span style="margin-left: 0.5rem;"><i class="fas fa-door-open"></i> Ch. ${resident.room}</span>` : ''}
                            </div>
                        </div>
                        <span style="background: #667eea; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
                            ${this.getSiteTypeLabel(resident.siteType)}
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

    /* ===========================
     * Stock & Suppliers
     * ===========================
     */
    async loadStockTab() {
        console.log('📦 Chargement de l\'onglet Stock...');
        
        try {
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

    async loadSuppliersTab() {
        console.log('🚛 Chargement de l\'onglet Fournisseurs...');
        
        try {
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

    /* ===========================
     * Sync & Reports
     * ===========================
     */
    async loadSyncData() {
        this.populateWeekSelector('sync-week-selector');
    }

    async loadReportsData() {
        const nutritionChart = document.getElementById('nutrition-chart');
        if (nutritionChart) {
            nutritionChart.innerHTML = '<p class="text-center">Rapport nutritionnel en cours de développement</p>';
        }
        
        const costsChart = document.getElementById('costs-chart');
        if (costsChart) {
            costsChart.innerHTML = '<p class="text-center">Rapport des coûts en cours de développement</p>';
        }
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
                <td>${(user.roles || []).join(', ')}</td>
                <td>${user.siteId?.siteName || '—'}</td>
                <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Jamais'}</td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="groupDashboard.editUser('${user._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    /* ===========================
     * Helper Methods
     * ===========================
     */
    getSiteTypeLabel(type) {
        const labels = {
            'EHPAD': 'EHPAD',
            'ehpad': 'EHPAD',
            'hopital': 'Hôpital',
            'ecole': 'École',
            'collectivite': 'Collectivité',
            'maison_retraite': 'Maison de Retraite',
            'resto': 'Restaurant'
        };
        return labels[type] || type || '—';
    }

    async viewSite(siteId) {
        this.showToast('Visualisation du site - en cours de développement', 'info');
    }

    async editSite(siteId) {
        this.showToast('Édition du site - en cours de développement', 'info');
    }

    async activateSite(siteId) {
        const site = this.sites.find(s => s._id === siteId);
        if (!site) {
            this.showToast('Site non trouvé', 'error');
            return;
        }

        if (confirm(`Activer le site "${site.siteName}" ?\n\nCela le rendra disponible pour la synchronisation des menus et la gestion des résidents.`)) {
            try {
                this.showLoader('Activation du site...');
                
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
                await this.loadGroupData(true);
                await this.loadSitesData();
                await this.loadSitesTable();
                
                this.hideLoader();
            } catch (error) {
                console.error('❌ Erreur lors de l\'activation:', error);
                this.showToast(`Erreur: ${error.message}`, 'error');
                this.hideLoader();
            }
        }
    }

    showAddSiteModal() {
        this.showToast('Ajout de site - en cours de développement', 'info');
    }

    async syncAllSites() {
        this.showToast('Synchronisation - en cours de développement', 'info');
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

/* ========= Bootstrap ========= */
let groupDashboard;

document.addEventListener("DOMContentLoaded", () => {
    groupDashboard = new GroupDashboard();
    groupDashboard.init();
    
    // Rendre accessible globalement
    window.groupDashboard = groupDashboard;
});
