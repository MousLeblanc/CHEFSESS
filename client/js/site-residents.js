// Site Residents Management JavaScript
class SiteResidents {
    constructor() {
        this.siteId = null;
        this.siteData = null;
        this.residents = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.searchQuery = '';
        this.init();
    }

    async init() {
        this.getSiteIdFromUrl();
        await this.loadSiteData();
        this.setupEventListeners();
        await this.loadResidents();
        await this.loadStats();
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
        document.getElementById('site-type').textContent = `Gestion des Résidents - ${this.getTypeLabel(this.siteData.type)}`;
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
        // Bouton retour
        document.getElementById('back-btn').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `site-dashboard.html?siteId=${this.siteId}`;
        });
        
        // Déconnexion
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        // Navigation rapide
        document.getElementById('dashboard-link').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `site-dashboard.html?siteId=${this.siteId}`;
        });
        
        document.getElementById('menus-link').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `site-dashboard.html?siteId=${this.siteId}`;
        });
        
        document.getElementById('residents-link').addEventListener('click', (e) => {
            e.preventDefault();
            // Déjà sur la page résidents, recharger les données
            this.loadResidents();
        });
        
        // Recherche
        document.getElementById('search-btn').addEventListener('click', () => {
            this.searchQuery = document.getElementById('search-input').value;
            this.currentPage = 1;
            this.loadResidents();
        });
        
        document.getElementById('search-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchQuery = e.target.value;
                this.currentPage = 1;
                this.loadResidents();
            }
        });
        
        // Ajouter un résident
        document.getElementById('add-resident-btn').addEventListener('click', () => {
            this.showAddResidentModal();
        });
    }

    async loadResidents() {
        this.showLoading(true);
        
        try {
            const params = new URLSearchParams({
                status: 'actif',
                page: this.currentPage,
                limit: 20
            });
            
            if (this.searchQuery) {
                params.append('search', this.searchQuery);
            }
            
            const response = await fetch(`/api/residents/site/${this.siteId}?${params}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des résidents');
            }
            
            const data = await response.json();
            this.residents = data.residents;
            this.totalPages = data.pagination.pages;
            
            this.displayResidents();
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des résidents:', error);
            this.showError('Erreur lors du chargement des résidents');
        } finally {
            this.showLoading(false);
        }
    }

    async loadStats() {
        try {
            const response = await fetch(`/api/residents/stats/${this.siteId}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des statistiques');
            }
            
            const stats = await response.json();
            this.displayStats(stats);
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des statistiques:', error);
        }
    }

    displayStats(stats) {
        document.getElementById('total-residents').textContent = stats.total || 0;
        document.getElementById('active-residents').textContent = stats.actifs || 0;
        document.getElementById('allergies-count').textContent = stats.avecAllergies || 0;
        document.getElementById('intolerances-count').textContent = stats.avecIntolerances || 0;
    }

    displayResidents() {
        const content = document.getElementById('residents-content');
        
        if (!this.residents || this.residents.length === 0) {
            content.innerHTML = `
                <div class="no-residents">
                    <i class="fas fa-users" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>Aucun résident trouvé</h3>
                    <p>Commencez par ajouter des résidents à votre site.</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="residents-grid">';
        
        this.residents.forEach(resident => {
            html += this.createResidentCard(resident);
        });
        
        html += '</div>';
        
        // Ajouter la pagination si nécessaire
        if (this.totalPages > 1) {
            html += this.createPagination();
        }
        
        content.innerHTML = html;
        
        // Ajouter les event listeners pour les boutons
        this.addResidentCardListeners();
    }

    createResidentCard(resident) {
        const age = this.calculateAge(resident.dateOfBirth);
        const fullName = `${resident.firstName} ${resident.lastName}`;
        
        // Créer les tags nutritionnels
        const tags = this.createNutritionalTags(resident);
        
        return `
            <div class="resident-card" data-resident-id="${resident._id}">
                <div class="resident-header">
                    <div>
                        <h3 class="resident-name">${fullName}</h3>
                        <p class="resident-age">${age} ans</p>
                    </div>
                    <div class="resident-room">Chambre ${resident.roomNumber || 'N/A'}</div>
                </div>
                
                <div class="resident-info">
                    <div class="info-row">
                        <span class="info-label">Genre:</span>
                        <span class="info-value">${resident.gender || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Téléphone:</span>
                        <span class="info-value">${resident.phone || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Statut:</span>
                        <span class="info-value">${this.getStatusLabel(resident.status)}</span>
                    </div>
                </div>
                
                ${tags ? `<div class="nutritional-tags">${tags}</div>` : ''}
                
                <div class="resident-actions">
                    <button class="btn-edit" onclick="siteResidents.editResident('${resident._id}')">
                        <i class="fas fa-edit"></i> Modifier
                    </button>
                    <button class="btn-delete" onclick="siteResidents.deleteResident('${resident._id}')">
                        <i class="fas fa-trash"></i> Supprimer
                    </button>
                </div>
            </div>
        `;
    }

    createNutritionalTags(resident) {
        const tags = [];
        
        // Allergies
        if (resident.nutritionalProfile?.allergies?.length > 0) {
            resident.nutritionalProfile.allergies.forEach(allergy => {
                tags.push(`<span class="tag allergy">Allergie: ${allergy.allergen}</span>`);
            });
        }
        
        // Intolérances
        if (resident.nutritionalProfile?.intolerances?.length > 0) {
            resident.nutritionalProfile.intolerances.forEach(intolerance => {
                tags.push(`<span class="tag intolerance">Intolérance: ${intolerance.substance}</span>`);
            });
        }
        
        // Restrictions alimentaires
        if (resident.nutritionalProfile?.dietaryRestrictions?.length > 0) {
            resident.nutritionalProfile.dietaryRestrictions.forEach(restriction => {
                tags.push(`<span class="tag restriction">${restriction.type}: ${restriction.restriction}</span>`);
            });
        }
        
        return tags.join('');
    }

    calculateAge(dateOfBirth) {
        if (!dateOfBirth) return 'N/A';
        
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }

    getStatusLabel(status) {
        const statusLabels = {
            'actif': 'Actif',
            'inactif': 'Inactif',
            'sorti': 'Sorti',
            'décédé': 'Décédé'
        };
        return statusLabels[status] || status;
    }

    createPagination() {
        let html = '<div class="pagination" style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 2rem;">';
        
        // Bouton précédent
        if (this.currentPage > 1) {
            html += `<button onclick="siteResidents.goToPage(${this.currentPage - 1})" class="btn-edit">Précédent</button>`;
        }
        
        // Numéros de page
        for (let i = 1; i <= this.totalPages; i++) {
            const isActive = i === this.currentPage;
            html += `<button onclick="siteResidents.goToPage(${i})" class="${isActive ? 'btn-add' : 'btn-edit'}" ${isActive ? 'disabled' : ''}>${i}</button>`;
        }
        
        // Bouton suivant
        if (this.currentPage < this.totalPages) {
            html += `<button onclick="siteResidents.goToPage(${this.currentPage + 1})" class="btn-edit">Suivant</button>`;
        }
        
        html += '</div>';
        return html;
    }

    goToPage(page) {
        this.currentPage = page;
        this.loadResidents();
    }

    addResidentCardListeners() {
        // Les event listeners sont ajoutés via onclick dans le HTML
    }

    showAddResidentModal() {
        // Pour l'instant, rediriger vers une page de création simple
        window.location.href = `add-resident.html?siteId=${this.siteId}`;
    }

    editResident(residentId) {
        // Pour l'instant, rediriger vers une page d'édition simple
        window.location.href = `edit-resident.html?siteId=${this.siteId}&residentId=${residentId}`;
    }

    async deleteResident(residentId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce résident ?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/residents/${residentId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    reason: 'Suppression demandée par l\'utilisateur'
                })
            });
            
            if (!response.ok) {
                throw new Error('Erreur lors de la suppression du résident');
            }
            
            this.showToast('Résident supprimé avec succès', 'success');
            await this.loadResidents();
            await this.loadStats();
            
        } catch (error) {
            console.error('❌ Erreur lors de la suppression:', error);
            this.showToast('Erreur lors de la suppression du résident', 'error');
        }
    }

    showLoading(show) {
        const content = document.getElementById('residents-content');
        
        if (show) {
            content.innerHTML = `
                <div class="loading">
                    <i class="fas fa-spinner"></i> Chargement des résidents...
                </div>
            `;
        }
    }

    showError(message) {
        const content = document.getElementById('residents-content');
        content.innerHTML = `
            <div class="no-residents">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;"></i>
                <h3>Erreur</h3>
                <p>${message}</p>
            </div>
        `;
    }

    showToast(message, type = 'info') {
        // Créer un toast simple
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
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
    window.siteResidents = new SiteResidents();
});
