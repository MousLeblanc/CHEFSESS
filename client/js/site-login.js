// Site Login JavaScript
class SiteLogin {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkUrlParams();
    }

    setupEventListeners() {
        const form = document.getElementById('site-login-form');
        form.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Auto-focus sur le premier champ
        document.getElementById('email').focus();
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const siteCode = urlParams.get('site');
        const siteName = urlParams.get('name');
        const siteType = urlParams.get('type');
        
        if (siteCode) {
            document.getElementById('site-code').value = siteCode;
            document.getElementById('site-code').readOnly = true;
        }
        
        if (siteName && siteType) {
            this.showSiteInfo(siteName, siteType);
        }
    }

    showSiteInfo(name, type) {
        const siteInfo = document.getElementById('site-info');
        document.getElementById('site-name').textContent = name;
        document.getElementById('site-type').textContent = `Type: ${this.getTypeLabel(type)}`;
        siteInfo.style.display = 'block';
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

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const loginData = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        this.showLoading(true);
        this.hideError();
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(loginData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur de connexion');
            }
            
            const result = await response.json();
            console.log('✅ Connexion réussie:', result);
            
            // Stocker les données utilisateur
            localStorage.setItem('user', JSON.stringify(result.user));
            localStorage.setItem('token', result.token || '');
            
            // Vérifier si c'est un utilisateur de site (avec siteId)
            if (result.user.siteId) {
                // Rediriger vers le tableau de bord du site
                window.location.href = 'site-dashboard.html';
            } else {
                this.showError('Cet email n\'est pas associé à un site spécifique.');
            }
            
        } catch (error) {
            console.error('❌ Erreur de connexion:', error);
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const loginBtn = document.getElementById('login-btn');
        
        if (show) {
            loading.style.display = 'block';
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
        } else {
            loading.style.display = 'none';
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('error-message');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide après 5 secondes
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        const errorDiv = document.getElementById('error-message');
        errorDiv.style.display = 'none';
    }
}

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new SiteLogin();
});
