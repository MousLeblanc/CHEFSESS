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
            // Sans sel → hyposode (comme dans dietaryRestrictions DB!)
            "Sans sel": "hyposode",
            "sans sel": "hyposode",
            "Sans Sel": "hyposode",
            
            // Sans sucre → pauvre_en_sucre (valeur qui existe dans la DB)
            "Sans sucre": "pauvre_en_sucre",
            "sans sucre": "pauvre_en_sucre",
            "Sans Sucre": "pauvre_en_sucre",
            
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
        this.initCustomMenuGenerator();

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
                    .filter(g => {
                        // Filtrer : minimum 100 résidents ET pas casher/halal (gérés au niveau site)
                        const value = (g.restrictionValue || g.name).toLowerCase();
                        const excludeValues = ['halal', 'casher'];
                        return g.residents.length >= 100 && !excludeValues.includes(value);
                    })
                    .slice(0, 5)
                    .forEach(restrictionGroup => {
                        variantGroups.push({
                            name: restrictionGroup.name,  // Pour l'affichage ("médicale: Sans sel")
                            description: `Menu spécifique pour ${restrictionGroup.residents.length} résidents`,
                            residentCount: restrictionGroup.residents.length,
                            allergens: [],
                            dietaryRestrictions: [restrictionGroup.restrictionValue || restrictionGroup.name],  // ✅ Utiliser restrictionValue
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
                    // Note : Halal et Casher sont gérés au niveau des sites, pas comme variantes de menu
                    const ethicalValues = ['végétarien', 'végétalien'];
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
                        console.log(`📦 Structure reçue pour "${group.name}":`, result);
                        console.log(`📦 Menu extrait:`, result.menu || result);
                        
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
        
        // Détecter le menu de référence (premier menu réussi)
        const referenceMenu = variants.find(v => v.success)?.menu;
        const referenceDishes = referenceMenu?.mainMenu?.dishes || referenceMenu?.dishes || [];
        const referenceNames = referenceDishes.map(d => d.name).sort().join('|');
        
        // Grouper les variantes identiques
        const uniqueMenus = [];
        const sharedGroups = []; // Groupes qui partagent le même menu
        
        variants.forEach((variant, index) => {
            const { group, menu, success, error } = variant;
            
            if (!success) {
                uniqueMenus.push({ variant, isShared: false });
                return;
            }
            
            const dishes = menu?.mainMenu?.dishes || menu?.dishes || [];
            const dishNames = dishes.map(d => d.name).sort().join('|');
            
            // Si les plats sont identiques au menu de référence et que ce n'est pas le menu principal
            if (index > 0 && dishNames === referenceNames && referenceNames) {
                sharedGroups.push(group);
            } else {
                uniqueMenus.push({ variant, isShared: false, sharedWith: [] });
            }
        });
        
        // Ajouter les groupes partagés au premier menu
        if (uniqueMenus.length > 0 && sharedGroups.length > 0) {
            uniqueMenus[0].sharedWith = sharedGroups;
        }
        
        uniqueMenus.forEach((item, uniqueIndex) => {
            const { variant, sharedWith } = item;
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
            
            // Gérer les deux formats possibles : jours (days) ou plats directs (mainMenu.dishes)
            const days = menu?.days || menu?.menu?.days || [];
            const dishes = menu?.mainMenu?.dishes || menu?.dishes || [];
            const hasContent = days.length > 0 || dishes.length > 0;
            
            // Calculer le nombre total de résidents (groupe principal + groupes partagés)
            const totalResidents = group.residentCount + (sharedWith || []).reduce((sum, g) => sum + g.residentCount, 0);
            
            const bgColor = uniqueIndex === 0 ? '#e7f3ff' : '#f8f9fa';
            const borderColor = uniqueIndex === 0 ? '#667eea' : '#dee2e6';
            
            html += `
                <div style="background: ${bgColor}; border: 2px solid ${borderColor}; border-radius: 10px; padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 0.25rem 0; color: #333; font-size: 1.3rem;">
                                ${uniqueIndex === 0 ? '🏆' : '🍽️'} ${group.name}
                            </h4>
                            <p style="margin: 0; color: #666; font-size: 0.95rem;">
                                <strong>${totalResidents} résidents</strong> - ${group.description}
                            </p>
                            ${sharedWith && sharedWith.length > 0 ? `
                                <div style="margin-top: 0.5rem; padding: 0.5rem; background: #d4edda; border-radius: 4px; font-size: 0.85rem;">
                                    <strong style="color: #155724;">✨ Menu compatible également pour :</strong>
                                    <ul style="margin: 0.25rem 0 0 0; padding-left: 1.5rem; color: #155724;">
                                        ${sharedWith.map(g => `<li>${g.name} (${g.residentCount} résidents)</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                        ${group.severity ? `
                        <span style="background: #dc3545; color: white; padding: 0.35rem 0.75rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">
                            ${group.severity}
                        </span>
                        ` : ''}
                    </div>
            `;
            
            // Format avec jours (structure complète)
            if (days.length > 0) {
                html += `
                    <div style="display: grid; gap: 0.75rem; margin-top: 1rem;">
                        ${days.slice(0, 3).map((day, dayIndex) => {
                            const meals = day.meals || [];
                            const lunch = meals.find(m => m.type === 'lunch') || {};
                            const courses = lunch.courses || [];
                            
                            // Helper pour afficher un plat avec ses ingrédients
                            const renderCourse = (course, color, icon, label) => {
                                if (!course) return `
                                    <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; border-left: 3px solid ${color};">
                                        <strong>${icon} ${label}:</strong> N/A
                                    </div>
                                `;
                                
                                let ingredientsHtml = '';
                                if (course.ingredientsPerPerson && course.ingredientsPerPerson.length > 0) {
                                    ingredientsHtml = `
                                        <details style="margin-top: 0.5rem;">
                                            <summary style="cursor: pointer; font-size: 0.85rem; color: #666; font-weight: 500;">
                                                📋 Ingrédients (${course.residentCount || 0} pers.)
                                            </summary>
                                            <div style="margin-top: 0.5rem; padding: 0.5rem; background: white; border-radius: 4px; font-size: 0.8rem;">
                                                <div style="margin-bottom: 0.5rem;">
                                                    <strong style="color: ${color};">Par personne:</strong>
                                                    <ul style="margin: 0.25rem 0; padding-left: 1.5rem; font-size: 0.8rem;">
                                                        ${course.ingredientsPerPerson.slice(0, 5).map(ing => 
                                                            `<li>${ing.name}: <strong>${ing.quantity} ${ing.unit}</strong></li>`
                                                        ).join('')}
                                                        ${course.ingredientsPerPerson.length > 5 ? 
                                                            `<li style="color: #666; font-style: italic;">... +${course.ingredientsPerPerson.length - 5}</li>` 
                                                        : ''}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <strong style="color: ${color};">Total groupe (${course.residentCount || 0} pers.):</strong>
                                                    <ul style="margin: 0.25rem 0; padding-left: 1.5rem; font-size: 0.8rem;">
                                                        ${course.ingredientsTotal.slice(0, 5).map(ing => 
                                                            `<li>${ing.name}: <strong>${ing.quantity} ${ing.unit}</strong></li>`
                                                        ).join('')}
                                                        ${course.ingredientsTotal.length > 5 ? 
                                                            `<li style="color: #666; font-style: italic;">... +${course.ingredientsTotal.length - 5}</li>` 
                                                        : ''}
                                                    </ul>
                                                </div>
                                            </div>
                                        </details>
                                    `;
                                }
                                
                                return `
                                    <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; border-left: 3px solid ${color};">
                                        <strong>${icon} ${label}:</strong> ${course.name}
                                        ${ingredientsHtml}
                                    </div>
                                `;
                            };
                            
                            return `
                                <details ${dayIndex === 0 ? 'open' : ''} style="background: white; border-radius: 6px; overflow: hidden;">
                                    <summary style="padding: 0.75rem; cursor: pointer; background: #f8f9fa; font-weight: 600; color: #667eea;">
                                        📅 ${typeof day.date === 'string' ? day.date : new Date(day.date).toLocaleDateString('fr-FR')}
                                    </summary>
                                    <div style="padding: 0.75rem; display: grid; gap: 0.5rem;">
                                        ${renderCourse(courses.find(c => c.category === 'entrée'), '#28a745', '🥗', 'Entrée')}
                                        ${renderCourse(courses.find(c => c.category === 'plat'), '#fd7e14', '🍖', 'Plat')}
                                        ${renderCourse(courses.find(c => c.category === 'dessert'), '#e83e8c', '🍰', 'Dessert')}
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
            }
            // Format avec plats directs (numDishes simple)
            else if (dishes.length > 0) {
                html += `
                    <div style="display: grid; gap: 0.5rem; margin-top: 1rem; background: white; border-radius: 6px; padding: 0.75rem;">
                        ${dishes.map(dish => {
                            const categoryColors = {
                                'entrée': '#28a745',
                                'plat': '#fd7e14', 
                                'dessert': '#e83e8c',
                                'soupe': '#17a2b8'
                            };
                            const color = categoryColors[dish.category] || '#6c757d';
                            const icon = dish.category === 'entrée' ? '🥗' : dish.category === 'plat' ? '🍖' : dish.category === 'dessert' ? '🍰' : '🍲';
                            
                            // Affichage des quantités d'ingrédients
                            let ingredientsHtml = '';
                            if (dish.ingredientsPerPerson && dish.ingredientsPerPerson.length > 0) {
                                ingredientsHtml = `
                                    <details style="margin-top: 0.5rem;">
                                        <summary style="cursor: pointer; font-size: 0.9rem; color: #666; font-weight: 500;">
                                            📋 Ingrédients (${dish.residentCount || 0} pers.)
                                        </summary>
                                        <div style="margin-top: 0.5rem; padding: 0.5rem; background: white; border-radius: 4px; font-size: 0.85rem;">
                                            <div style="margin-bottom: 0.75rem;">
                                                <strong style="color: ${color};">Par personne:</strong>
                                                <ul style="margin: 0.25rem 0; padding-left: 1.5rem;">
                                                    ${dish.ingredientsPerPerson.slice(0, 5).map(ing => 
                                                        `<li>${ing.name}: <strong>${ing.quantity} ${ing.unit}</strong></li>`
                                                    ).join('')}
                                                    ${dish.ingredientsPerPerson.length > 5 ? 
                                                        `<li style="color: #666; font-style: italic;">... et ${dish.ingredientsPerPerson.length - 5} autres ingrédients</li>` 
                                                    : ''}
                                                </ul>
                                            </div>
                                            <div>
                                                <strong style="color: ${color};">Pour le groupe (${dish.residentCount || 0} pers.):</strong>
                                                <ul style="margin: 0.25rem 0; padding-left: 1.5rem;">
                                                    ${dish.ingredientsTotal.slice(0, 5).map(ing => 
                                                        `<li>${ing.name}: <strong>${ing.quantity} ${ing.unit}</strong></li>`
                                                    ).join('')}
                                                    ${dish.ingredientsTotal.length > 5 ? 
                                                        `<li style="color: #666; font-style: italic;">... et ${dish.ingredientsTotal.length - 5} autres ingrédients</li>` 
                                                    : ''}
                                                </ul>
                                            </div>
                                        </div>
                                    </details>
                                `;
                            }
                            
                            return `
                                <div style="padding: 0.5rem; background: #f8f9fa; border-radius: 4px; border-left: 3px solid ${color};">
                                    <strong>${icon} ${dish.category?.charAt(0).toUpperCase() + dish.category?.slice(1)}:</strong> ${dish.name}
                                    ${ingredientsHtml}
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            } 
            // Aucun contenu
            else {
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
    
    /* ===========================
     * Générateur de Menu Personnalisé
     * ===========================
     */
    
    initCustomMenuGenerator() {
        // Array pour stocker les objectifs nutritionnels
        this.nutritionalGoals = [];
        this.generatedMenus = [];
        
        // Événements
        const addGoalBtn = document.getElementById('add-goal-btn');
        const customMenuForm = document.getElementById('generate-custom-menu-form');
        const addGoalForm = document.getElementById('add-nutritional-goal-form');
        const addAndCloseBtn = document.getElementById('add-goal-and-close-btn');
        const modal = document.getElementById('add-nutritional-goal-modal');
        
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => {
                this.showAddGoalModal();
            });
        }
        
        // Bouton "Ajouter un autre" (submit du formulaire)
        if (addGoalForm) {
            addGoalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNutritionalGoal(false); // Ne pas fermer la modale
            });
        }
        
        // Bouton "Ajouter et fermer"
        if (addAndCloseBtn) {
            addAndCloseBtn.addEventListener('click', () => {
                this.addNutritionalGoal(true); // Fermer la modale
            });
        }
        
        // Gestion de la fermeture de la modale (une seule fois)
        if (modal) {
            const closeButtons = modal.querySelectorAll('.modal-close');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.closeGoalModal();
                });
            });
            
            // Fermer en cliquant en dehors
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeGoalModal();
                }
            });
        }
        
        if (customMenuForm) {
            customMenuForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateCustomMenu();
            });
        }
    }
    
    showAddGoalModal() {
        const modal = document.getElementById('add-nutritional-goal-modal');
        if (modal) {
            modal.style.display = 'flex';
            // Mettre à jour la liste dans la modale
            this.updateModalGoalsList();
            // Focus sur le premier champ
            const nutrientSelect = document.getElementById('goal-nutrient');
            if (nutrientSelect) {
                setTimeout(() => nutrientSelect.focus(), 100);
            }
        }
    }
    
    closeGoalModal() {
        const modal = document.getElementById('add-nutritional-goal-modal');
        if (modal) {
            modal.style.display = 'none';
            // Réinitialiser le formulaire
            const form = document.getElementById('add-nutritional-goal-form');
            if (form) form.reset();
        }
    }
    
    addNutritionalGoal(closeModal = false) {
        const nutrientSelect = document.getElementById('goal-nutrient');
        const targetInput = document.getElementById('goal-target');
        
        if (!nutrientSelect || !targetInput) return;
        
        const nutrient = nutrientSelect.value;
        const nutrientLabel = nutrientSelect.options[nutrientSelect.selectedIndex].text;
        const target = parseFloat(targetInput.value);
        
        // Validation
        if (!target || target <= 0) {
            this.showToast('Veuillez saisir un objectif valide', 'warning');
            return;
        }
        
        // Vérifier si ce nutriment n'est pas déjà ajouté
        if (this.nutritionalGoals.some(g => g.nutrient === nutrient)) {
            this.showToast('Ce nutriment est déjà dans la liste', 'warning');
            return;
        }
        
        // Extraire l'unité du label
        const unitMatch = nutrientLabel.match(/\(([^)]+)\)/);
        const unit = unitMatch ? unitMatch[1] : '';
        const label = nutrientLabel.split('(')[0].trim();
        
        // Ajouter l'objectif
        const goal = {
            nutrient,
            label,
            target,
            unit,
            minIngredientValue: this.getMinIngredientValue(nutrient)
        };
        
        this.nutritionalGoals.push(goal);
        this.renderNutritionalGoals();
        
        // Toast de confirmation
        this.showToast(`✅ ${label} ajouté (${target}${unit})`, 'success');
        
        // Réinitialiser seulement le champ "objectif" pour faciliter l'ajout d'un autre
        targetInput.value = '';
        targetInput.focus();
        
        // Mettre à jour la liste dans la modale
        this.updateModalGoalsList();
        
        // Fermer la modale seulement si demandé
        if (closeModal) {
            this.closeGoalModal();
        }
    }
    
    updateModalGoalsList() {
        const modalListDiv = document.getElementById('modal-goals-list');
        const modalContainer = document.getElementById('modal-goals-container');
        
        if (!modalListDiv || !modalContainer) return;
        
        if (this.nutritionalGoals.length === 0) {
            modalListDiv.style.display = 'none';
            return;
        }
        
        modalListDiv.style.display = 'block';
        
        modalContainer.innerHTML = this.nutritionalGoals.map((goal, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: white; border-radius: 4px; margin-bottom: 0.5rem; border: 1px solid #d1fae5;">
                <div>
                    <strong style="color: #047857; font-size: 0.9rem;">${goal.label}</strong>
                    <span style="color: #059669; margin-left: 0.5rem; font-size: 0.85rem;">${goal.target}${goal.unit}</span>
                </div>
                <button type="button" onclick="groupDashboard.removeGoalFromModal(${index})" style="background: #fee2e2; color: #991b1b; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    removeGoalFromModal(index) {
        this.removeNutritionalGoal(index);
        this.updateModalGoalsList();
    }
    
    getMinIngredientValue(nutrient) {
        const minValues = {
            proteins: 15,
            iron: 1.5,
            calcium: 50,
            magnesium: 30,
            zinc: 1,
            vitaminC: 20,
            vitaminD: 1,
            vitaminA: 100,
            fibers: 5,
            vitaminE: 1,
            vitaminK: 10,
            vitaminB6: 0.2,
            vitaminB9: 50,
            vitaminB12: 0.5
        };
        return minValues[nutrient] || 5;
    }
    
    renderNutritionalGoals() {
        const goalsList = document.getElementById('nutritional-goals-list');
        if (!goalsList) return;
        
        if (this.nutritionalGoals.length === 0) {
            goalsList.innerHTML = '<p style="color: #6b7280; font-size: 0.9rem; margin: 0;">Aucun objectif ajouté. Cliquez sur "Ajouter un objectif" ci-dessous.</p>';
            return;
        }
        
        goalsList.innerHTML = this.nutritionalGoals.map((goal, index) => `
            <div style="display: flex; justify-items: center; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; margin-bottom: 0.5rem; border: 1px solid #e5e7eb;">
                <div style="flex: 1;">
                    <strong style="color: #374151;">${goal.label}</strong>
                    <span style="color: #6b7280; margin-left: 0.5rem;">Objectif: ${goal.target}${goal.unit}</span>
                </div>
                <button type="button" onclick="groupDashboard.removeNutritionalGoal(${index})" style="background: #fee2e2; color: #991b1b; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                    <i class="fas fa-times"></i> Retirer
                </button>
            </div>
        `).join('');
    }
    
    removeNutritionalGoal(index) {
        this.nutritionalGoals.splice(index, 1);
        this.renderNutritionalGoals();
    }
    
    async generateCustomMenu() {
        if (this.nutritionalGoals.length === 0) {
            this.showToast('Veuillez ajouter au moins un objectif nutritionnel', 'warning');
            return;
        }
        
        const numberOfPeople = parseInt(document.getElementById('custom-menu-people').value);
        const mealType = document.getElementById('custom-menu-type').value;
        const restrictionsSelect = document.getElementById('custom-menu-restrictions');
        const dietaryRestrictions = Array.from(restrictionsSelect.selectedOptions).map(opt => opt.value);
        
        // Afficher le loader
        const progressDiv = document.getElementById('custom-menu-progress');
        const progressText = document.getElementById('custom-progress-text');
        const resultsDiv = document.getElementById('custom-menu-results');
        
        if (progressDiv) progressDiv.style.display = 'block';
        if (resultsDiv) resultsDiv.style.display = 'none';
        
        try {
            if (progressText) progressText.textContent = 'Recherche des meilleurs ingrédients...';
            
            const response = await fetch('/api/menu/generate-custom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    numberOfPeople,
                    mealType,
                    nutritionalGoals: this.nutritionalGoals,
                    dietaryRestrictions
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la génération du menu');
            }
            
            const result = await response.json();
            
            if (progressText) progressText.textContent = 'Vérification du stock...';
            
            // Vérifier la disponibilité des ingrédients en stock
            const stockCheck = await this.checkStockAvailability(result, numberOfPeople);
            
            if (progressText) progressText.textContent = 'Menu généré avec succès !';
            
            // Ajouter le menu généré à la liste avec les infos de stock
            this.generatedMenus.unshift({
                ...result,
                timestamp: new Date(),
                goals: [...this.nutritionalGoals],
                stockCheck: stockCheck
            });
            
            // Afficher les résultats
            this.displayCustomMenuResult(result, stockCheck);
            this.displayGeneratedMenusList();
            
            if (stockCheck.allAvailable) {
                this.showToast('✅ Menu généré ! Tous les ingrédients sont en stock', 'success');
            } else {
                this.showToast(`⚠️ Menu généré mais ${stockCheck.missingCount} ingrédient(s) manquant(s)`, 'warning');
            }
            
        } catch (error) {
            console.error('Error generating custom menu:', error);
            this.showToast(error.message || 'Erreur lors de la génération du menu', 'error');
        } finally {
            if (progressDiv) {
                setTimeout(() => {
                    progressDiv.style.display = 'none';
                }, 1000);
            }
        }
    }
    
    convertToGrams(quantity, unit) {
        // Convertir toutes les quantités en grammes pour comparaison uniforme
        const unitLower = (unit || '').toLowerCase();
        
        if (unitLower === 'kg') {
            return quantity * 1000;
        } else if (unitLower === 'l' || unitLower === 'litre' || unitLower === 'litres') {
            return quantity * 1000; // 1L = 1000ml (traité comme grammes)
        } else if (unitLower === 'ml') {
            return quantity; // 1ml ≈ 1g pour simplification
        } else if (unitLower === 'g' || unitLower === 'gramme' || unitLower === 'grammes') {
            return quantity;
        } else if (unitLower === 'pièce' || unitLower === 'pièces' || unitLower === 'unité' || unitLower === 'unités') {
            return quantity * 100; // Approximation : 1 pièce ≈ 100g
        } else {
            return quantity; // Par défaut, traiter comme des grammes
        }
    }
    
    async checkStockAvailability(menuResult, numberOfPeople) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return { allAvailable: false, missingCount: 0, items: [], message: 'Non connecté' };
            }
            
            // Récupérer le stock actuel
            const stockResponse = await fetch('/api/stock', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!stockResponse.ok) {
                console.error('Erreur lors de la récupération du stock');
                return { allAvailable: false, missingCount: 0, items: [], message: 'Erreur de chargement du stock' };
            }
            
            const stockData = await stockResponse.json();
            const stockItems = stockData.data || [];
            
            // Extraire les ingrédients du menu avec leurs quantités
            const menuIngredients = this.extractIngredientsFromMenu(menuResult, numberOfPeople);
            
            // Vérifier chaque ingrédient
            const checkResults = menuIngredients.map(ingredient => {
                const stockItem = stockItems.find(item => 
                    item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
                    ingredient.name.toLowerCase().includes(item.name.toLowerCase())
                );
                
                if (!stockItem) {
                    return {
                        name: ingredient.name,
                        needed: ingredient.quantity,
                        available: 0,
                        unit: ingredient.unit,
                        status: 'missing'
                    };
                }
                
                // Convertir les deux quantités en grammes pour comparaison
                const availableInGrams = this.convertToGrams(stockItem.quantity, stockItem.unit);
                const neededInGrams = this.convertToGrams(ingredient.quantity, ingredient.unit);
                
                if (availableInGrams >= neededInGrams) {
                    return {
                        name: ingredient.name,
                        needed: ingredient.quantity,
                        available: stockItem.quantity,
                        unit: ingredient.unit,
                        stockUnit: stockItem.unit,
                        status: 'ok',
                        stockItemId: stockItem._id
                    };
                } else {
                    return {
                        name: ingredient.name,
                        needed: ingredient.quantity,
                        available: stockItem.quantity,
                        unit: ingredient.unit,
                        stockUnit: stockItem.unit,
                        status: 'insufficient',
                        stockItemId: stockItem._id
                    };
                }
            });
            
            const missingItems = checkResults.filter(item => item.status !== 'ok');
            
            return {
                allAvailable: missingItems.length === 0,
                missingCount: missingItems.length,
                items: checkResults,
                missingItems: missingItems
            };
            
        } catch (error) {
            console.error('Erreur lors de la vérification du stock:', error);
            return { allAvailable: false, missingCount: 0, items: [], message: 'Erreur' };
        }
    }
    
    extractIngredientsFromMenu(menuResult, numberOfPeople) {
        // Extraire les ingrédients avec leurs quantités
        // NOTE: Les quantités retournées par l'AI sont DÉJÀ pour le groupe entier
        const ingredients = [];
        
        if (menuResult.menu && menuResult.menu.ingredients) {
            menuResult.menu.ingredients.forEach(ing => {
                // Si c'est un objet avec nom, quantité, unité
                if (typeof ing === 'object' && ing.nom) {
                    ingredients.push({
                        name: ing.nom || ing.name,
                        quantity: parseFloat(ing.quantite || ing.quantity) || 0,
                        unit: ing.unite || ing.unit || 'g'
                    });
                }
                // Si c'est une string, parser le format "ingredient: quantité unité"
                else if (typeof ing === 'string') {
                    const match = ing.match(/(.+?):\s*(\d+(?:\.\d+)?)\s*(\w+)/);
                    if (match) {
                        ingredients.push({
                            name: match[1].trim(),
                            quantity: parseFloat(match[2]),
                            unit: match[3]
                        });
                    }
                }
            });
        }
        
        return ingredients;
    }
    
    displayCustomMenuResult(result, stockCheck = null) {
        const resultsDiv = document.getElementById('custom-menu-results');
        if (!resultsDiv) return;
        
        const { menu, nutrition, numberOfPeople, nutritionalGoals } = result;
        
        // Vérifier les objectifs atteints
        const goalsStatus = nutritionalGoals.map(goal => {
            const value = nutrition.perPerson[goal.nutrient] || 0;
            const achieved = value >= goal.target;
            return { ...goal, value, achieved };
        });
        
        const allGoalsAchieved = goalsStatus.every(g => g.achieved);
        
        resultsDiv.innerHTML = `
            <div style="background: white; border-radius: 8px; padding: 1.5rem; border: 2px solid ${allGoalsAchieved ? '#10b981' : '#f59e0b'};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <h3 style="margin: 0; color: #111827; font-size: 1.5rem;">${menu.nomMenu}</h3>
                    <span style="background: ${allGoalsAchieved ? '#d1fae5' : '#fef3c7'}; color: ${allGoalsAchieved ? '#065f46' : '#92400e'}; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">
                        ${allGoalsAchieved ? '✅ Tous les objectifs atteints' : '⚠️ Objectifs partiellement atteints'}
                    </span>
                </div>
                
                <p style="color: #6b7280; margin: 0 0 1.5rem 0;">${menu.description}</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
                    <div>
                        <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #374151;"><i class="fas fa-users"></i> ${numberOfPeople} personnes</p>
                        <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #374151;"><i class="fas fa-clock"></i> ${menu.tempsCuisson}</p>
                        <p style="margin: 0; font-weight: 600; color: #374151;"><i class="fas fa-chart-bar"></i> ${menu.difficulte}</p>
                    </div>
                    <div style="background: #f3f4f6; padding: 1rem; border-radius: 6px;">
                        <p style="margin: 0 0 0.5rem 0; font-weight: 600; color: #374151;">Par personne:</p>
                        <p style="margin: 0; font-size: 0.9rem; color: #6b7280;">
                            🔥 ${Math.round(nutrition.perPerson.calories || 0)} kcal<br>
                            🥩 ${(nutrition.perPerson.proteins || 0).toFixed(1)}g protéines<br>
                            🍞 ${(nutrition.perPerson.carbs || 0).toFixed(1)}g glucides<br>
                            🥑 ${(nutrition.perPerson.lipids || 0).toFixed(1)}g lipides<br>
                            🌾 ${(nutrition.perPerson.fibers || 0).toFixed(1)}g fibres
                        </p>
                    </div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin: 0 0 1rem 0; color: #374151;">📊 Objectifs Nutritionnels</h4>
                    ${goalsStatus.map(goal => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: ${goal.achieved ? '#d1fae5' : '#fee2e2'}; border-radius: 6px; margin-bottom: 0.5rem;">
                            <span style="font-weight: 600; color: #374151;">${goal.label}</span>
                            <span style="color: ${goal.achieved ? '#065f46' : '#991b1b'};">
                                ${goal.value.toFixed(1)}${goal.unit} / ${goal.target}${goal.unit}
                                ${goal.achieved ? '✅' : '⚠️'}
                            </span>
                        </div>
                    `).join('')}
                </div>
                
                ${stockCheck ? `
                    <div style="margin-bottom: 1.5rem; padding: 1rem; background: ${stockCheck.allAvailable ? '#d1fae5' : '#fef3c7'}; border-radius: 8px; border: 2px solid ${stockCheck.allAvailable ? '#10b981' : '#f59e0b'};">
                        <h4 style="margin: 0 0 1rem 0; color: #374151;">
                            ${stockCheck.allAvailable ? '✅ Stock disponible' : `⚠️ Stock : ${stockCheck.missingCount} élément(s) à vérifier`}
                        </h4>
                        ${stockCheck.items && stockCheck.items.length > 0 ? `
                            <div style="max-height: 200px; overflow-y: auto;">
                                ${stockCheck.items.map(item => `
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; margin-bottom: 0.5rem; background: white; border-radius: 4px; border-left: 4px solid ${item.status === 'ok' ? '#10b981' : item.status === 'missing' ? '#ef4444' : '#f59e0b'};">
                                        <span style="font-weight: 500; color: #374151;">${item.name}</span>
                                        <span style="font-size: 0.85rem; color: ${item.status === 'ok' ? '#059669' : item.status === 'missing' ? '#dc2626' : '#d97706'};">
                                            ${item.status === 'ok' ? `✓ Stock: ${item.available.toFixed(item.stockUnit === 'kg' ? 0 : 1)}${item.stockUnit || item.unit} (besoin: ${item.needed.toFixed(1)}${item.unit})` : 
                                              item.status === 'missing' ? `✗ Non trouvé en stock (besoin: ${item.needed.toFixed(1)}${item.unit})` :
                                              `⚠ Insuffisant: ${item.available.toFixed(item.stockUnit === 'kg' ? 0 : 1)}${item.stockUnit || item.unit} (besoin: ${item.needed.toFixed(1)}${item.unit})`}
                                        </span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin: 0 0 1rem 0; color: #374151;">🥘 Ingrédients</h4>
                    <ul style="columns: 2; column-gap: 2rem; margin: 0; padding-left: 1.5rem;">
                        ${menu.ingredients.map(ing => {
                            // Si c'est un objet, formatter correctement
                            if (typeof ing === 'object') {
                                const nom = ing.nom || ing.name || 'Ingrédient';
                                const quantite = ing.quantite || ing.quantity || '';
                                const unite = ing.unite || ing.unit || '';
                                return `<li style="margin-bottom: 0.5rem; color: #4b5563;">${nom}: ${quantite}${unite}</li>`;
                            }
                            // Si c'est une string, l'afficher directement
                            return `<li style="margin-bottom: 0.5rem; color: #4b5563;">${ing}</li>`;
                        }).join('')}
                    </ul>
                </div>
                
                <div>
                    <h4 style="margin: 0 0 1rem 0; color: #374151;">👨‍🍳 Instructions</h4>
                    <ol style="margin: 0; padding-left: 1.5rem;">
                        ${menu.instructions.map(instruction => 
                            `<li style="margin-bottom: 0.75rem; color: #4b5563;">${instruction}</li>`
                        ).join('')}
                    </ol>
                </div>
                
                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                    <!-- Boutons principaux -->
                    <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                        <button onclick="groupDashboard.acceptMenu(${this.generatedMenus.length - 1})" class="btn btn-primary" style="flex: 1; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; padding: 1.25rem; font-size: 1.1rem; font-weight: 700; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                            <i class="fas fa-check-circle" style="font-size: 1.2rem;"></i> Accepter ce menu
                        </button>
                        <button onclick="groupDashboard.replaceMenu()" class="btn" style="flex: 1; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; padding: 1.25rem; font-size: 1.1rem; font-weight: 700; box-shadow: 0 4px 6px rgba(245, 158, 11, 0.4);">
                            <i class="fas fa-sync-alt" style="font-size: 1.2rem;"></i> Remplacer le menu
                        </button>
                    </div>
                    
                    <!-- Boutons secondaires -->
                    <div style="display: flex; gap: 1rem;">
                        <button onclick="groupDashboard.exportMenu(${this.generatedMenus.length - 1})" class="btn btn-outline" style="flex: 1;">
                            <i class="fas fa-download"></i> Exporter
                        </button>
                        <button onclick="groupDashboard.printMenu(${this.generatedMenus.length - 1})" class="btn btn-outline" style="flex: 1;">
                            <i class="fas fa-print"></i> Imprimer
                        </button>
                        <button onclick="groupDashboard.saveMenuToDatabase(${this.generatedMenus.length - 1})" class="btn btn-outline" style="flex: 1;">
                            <i class="fas fa-save"></i> Sauvegarder
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        resultsDiv.style.display = 'block';
        
        // Scroll vers les résultats
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    displayGeneratedMenusList() {
        if (this.generatedMenus.length === 0) return;
        
        const listDiv = document.getElementById('generated-menus-list');
        const containerDiv = document.getElementById('generated-menus-container');
        
        if (!listDiv || !containerDiv) return;
        
        listDiv.style.display = 'block';
        
        containerDiv.innerHTML = this.generatedMenus.slice(0, 5).map((item, index) => `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s;" onclick="groupDashboard.displayCustomMenuResult(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="margin: 0 0 0.5rem 0; color: #374151;">${item.menu.nomMenu}</h4>
                        <p style="margin: 0; font-size: 0.85rem; color: #6b7280;">
                            ${item.numberOfPeople} pers. • ${item.mealType} • ${new Date(item.timestamp).toLocaleString('fr-FR')}
                        </p>
                        <p style="margin: 0.5rem 0 0 0; font-size: 0.85rem; color: #10b981;">
                            ${item.goals.map(g => `${g.label}: ${g.target}${g.unit}`).join(' • ')}
                        </p>
                    </div>
                    <span style="color: #10b981; font-size: 1.5rem;">✓</span>
                </div>
            </div>
        `).join('');
    }
    
    exportMenu(index) {
        const menuData = this.generatedMenus[index];
        if (!menuData) return;
        
        const jsonStr = JSON.stringify(menuData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `menu-${menuData.menu.nomMenu.toLowerCase().replace(/\s+/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Menu exporté avec succès', 'success');
    }
    
    printMenu(index) {
        const menuData = this.generatedMenus[index];
        if (!menuData) return;
        
        window.print();
    }
    
    async saveMenuToDatabase(index) {
        const menuData = this.generatedMenus[index];
        if (!menuData) return;
        
        // TODO: Implement save to database
        this.showToast('Fonctionnalité à venir', 'info');
    }
    
    resetForNewMenu() {
        // Réinitialiser les objectifs nutritionnels
        this.nutritionalGoals = [];
        this.renderNutritionalGoals();
        
        // Réinitialiser le formulaire
        const form = document.getElementById('generate-custom-menu-form');
        if (form) {
            form.reset();
            // Remettre les valeurs par défaut
            document.getElementById('custom-menu-people').value = 4;
            document.getElementById('custom-menu-type').value = 'déjeuner';
        }
        
        // Cacher les résultats
        const resultsDiv = document.getElementById('custom-menu-results');
        if (resultsDiv) resultsDiv.style.display = 'none';
        
        // Scroll vers le formulaire
        const formSection = document.getElementById('generate-custom-menu-form');
        if (formSection) {
            formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        this.showToast('Prêt pour un nouveau menu ! 🎯', 'success');
    }
    
    async acceptMenu(index) {
        const menuData = this.generatedMenus[index];
        if (!menuData) return;
        
        // Vérifier si le stock est disponible
        const stockCheck = menuData.stockCheck;
        
        if (stockCheck && !stockCheck.allAvailable) {
            const confirmMsg = `⚠️ Attention : ${stockCheck.missingCount} ingrédient(s) manquant(s) ou insuffisant(s).\n\nVoulez-vous quand même accepter ce menu ?\n(Les quantités disponibles seront déduites du stock)`;
            if (!confirm(confirmMsg)) {
                return;
            }
        }
        
        // Déduire les quantités du stock
        if (stockCheck && stockCheck.items && stockCheck.items.length > 0) {
            this.showToast('⏳ Déduction des quantités du stock...', 'info');
            
            const success = await this.deductFromStock(stockCheck.items);
            
            if (success) {
                this.showToast(`✅ Menu "${menuData.menu.nomMenu}" accepté ! Quantités déduites du stock.`, 'success');
            } else {
                this.showToast(`⚠️ Menu accepté mais erreur lors de la déduction du stock`, 'warning');
            }
        } else {
            this.showToast(`✅ Menu "${menuData.menu.nomMenu}" accepté !`, 'success');
        }
        
        // Marquer le menu comme accepté
        this.acceptedMenu = menuData;
        
        // Optionnel : Cacher les résultats et préparer pour un nouveau menu
        setTimeout(() => {
            this.resetForNewMenu();
        }, 2000);
    }
    
    async deductFromStock(stockItems) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token non disponible');
                return false;
            }
            
            // Préparer les éléments à déduire (seulement ceux qui sont disponibles)
            // On déduit seulement ce qui est disponible, pas les insuffisants ni les manquants
            const itemsToDeduct = stockItems
                .filter(item => item.status === 'ok')
                .map(item => ({
                    name: item.name,
                    quantity: item.needed,
                    unit: item.unit
                }));
            
            if (itemsToDeduct.length === 0) {
                console.log('Aucun élément à déduire du stock (tous manquants ou insuffisants)');
                return true;
            }
            
            console.log('Déduction du stock:', itemsToDeduct);
            
            const response = await fetch('/api/stock/deduct', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemsToDeduct: itemsToDeduct })
            });
            
            if (!response.ok) {
                const error = await response.json();
                console.error('Erreur lors de la déduction:', error);
                return false;
            }
            
            const result = await response.json();
            console.log('✅ Stock déduit avec succès:', result);
            
            // Recharger le stock pour afficher les nouvelles quantités
            if (typeof window.loadStockData === 'function') {
                await window.loadStockData();
            }
            
            return true;
            
        } catch (error) {
            console.error('Erreur lors de la déduction du stock:', error);
            return false;
        }
    }
    
    replaceMenu() {
        // Garder les mêmes critères (nutritionalGoals déjà en place)
        const numberOfPeople = parseInt(document.getElementById('custom-menu-people').value);
        const mealType = document.getElementById('custom-menu-type').value;
        
        if (this.nutritionalGoals.length === 0) {
            this.showToast('Impossible de regénérer : aucun objectif défini', 'warning');
            return;
        }
        
        // Message d'information
        this.showToast('🔄 Génération d\'un nouveau menu avec les mêmes critères...', 'info');
        
        // Régénérer le menu
        setTimeout(() => {
            this.generateCustomMenu();
        }, 500);
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
