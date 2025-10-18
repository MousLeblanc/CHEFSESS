// Add Resident JavaScript
class AddResident {
    constructor() {
        this.siteId = null;
        this.siteData = null;
        this.allergyCount = 1;
        this.intoleranceCount = 1;
        this.restrictionCount = 1;
        this.init();
    }

    async init() {
        this.getSiteIdFromUrl();
        await this.loadSiteData();
        this.setupEventListeners();
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
            this.updateSiteInfo();
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement du site:', error);
            this.showError('Erreur lors du chargement des données du site');
        }
    }

    updateSiteInfo() {
        if (!this.siteData) return;
        
        document.getElementById('site-info').textContent = 
            `Ajout d'un résident pour ${this.siteData.siteName}`;
    }

    setupEventListeners() {
        // Formulaire
        document.getElementById('resident-form').addEventListener('submit', (e) => {
            this.handleSubmit(e);
        });
        
        // Bouton annuler
        document.getElementById('cancel-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.goBack();
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const residentData = this.processFormData(formData);
        
        this.showLoading(true);
        
        try {
            const response = await fetch('/api/residents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...residentData,
                    siteId: this.siteId,
                    groupId: this.siteData.groupId
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de la création du résident');
            }
            
            const result = await response.json();
            console.log('✅ Résident créé:', result);
            
            this.showToast('Résident créé avec succès', 'success');
            
            // Rediriger vers la liste des résidents
            setTimeout(() => {
                window.location.href = `site-residents.html?siteId=${this.siteId}`;
            }, 1500);
            
        } catch (error) {
            console.error('❌ Erreur lors de la création du résident:', error);
            this.showToast(`Erreur: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    processFormData(formData) {
        const data = {};
        
        // Informations personnelles
        data.firstName = formData.get('firstName');
        data.lastName = formData.get('lastName');
        data.dateOfBirth = formData.get('dateOfBirth');
        data.gender = formData.get('gender');
        data.phone = formData.get('phone');
        data.email = formData.get('email');
        data.roomNumber = formData.get('roomNumber');
        data.bedNumber = formData.get('bedNumber');
        
        // Adresse
        data.address = {
            street: formData.get('address.street'),
            city: formData.get('address.city'),
            postalCode: formData.get('address.postalCode'),
            country: 'France'
        };
        
        // Contact d'urgence
        data.emergencyContact = {
            name: formData.get('emergencyContact.name'),
            relationship: formData.get('emergencyContact.relationship'),
            phone: formData.get('emergencyContact.phone'),
            email: formData.get('emergencyContact.email')
        };
        
        // Notes générales
        data.generalNotes = formData.get('generalNotes');
        
        // Carte d'identité nutritionnelle
        data.nutritionalProfile = {
            allergies: this.processAllergies(formData),
            intolerances: this.processIntolerances(formData),
            dietaryRestrictions: this.processRestrictions(formData),
            nutritionalNeeds: {
                calories: {
                    daily: parseInt(formData.get('calories.daily')) || null
                },
                proteins: {
                    daily: parseInt(formData.get('proteins.daily')) || null
                },
                sodium: {
                    restriction: formData.get('sodium.restriction') || 'normal'
                },
                sugar: {
                    restriction: formData.get('sugar.restriction') || 'normal'
                }
            }
        };
        
        return data;
    }

    processAllergies(formData) {
        const allergies = [];
        let index = 0;
        
        while (formData.get(`allergies[${index}].allergen`)) {
            const allergen = formData.get(`allergies[${index}].allergen`).trim();
            if (allergen) {
                allergies.push({
                    allergen,
                    severity: formData.get(`allergies[${index}].severity`) || 'modérée'
                });
            }
            index++;
        }
        
        return allergies;
    }

    processIntolerances(formData) {
        const intolerances = [];
        let index = 0;
        
        while (formData.get(`intolerances[${index}].substance`)) {
            const substance = formData.get(`intolerances[${index}].substance`).trim();
            if (substance) {
                intolerances.push({
                    substance,
                    severity: formData.get(`intolerances[${index}].severity`) || 'modérée'
                });
            }
            index++;
        }
        
        return intolerances;
    }

    processRestrictions(formData) {
        const restrictions = [];
        let index = 0;
        
        while (formData.get(`restrictions[${index}].restriction`)) {
            const restriction = formData.get(`restrictions[${index}].restriction`).trim();
            if (restriction) {
                restrictions.push({
                    type: formData.get(`restrictions[${index}].type`) || 'personnelle',
                    restriction
                });
            }
            index++;
        }
        
        return restrictions;
    }

    showLoading(show) {
        const saveBtn = document.getElementById('save-btn');
        
        if (show) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enregistrement...';
        } else {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Enregistrer';
        }
    }

    showError(message) {
        alert(`Erreur: ${message}`);
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

    goBack() {
        window.location.href = `site-residents.html?siteId=${this.siteId}`;
    }
}

// Fonctions globales pour les boutons dynamiques
function addAllergy() {
    const container = document.getElementById('allergies-container');
    const index = container.children.length;
    
    const div = document.createElement('div');
    div.className = 'allergy-item';
    div.innerHTML = `
        <input type="text" placeholder="Allergène (ex: arachides, gluten...)" name="allergies[${index}].allergen">
        <select name="allergies[${index}].severity">
            <option value="légère">Légère</option>
            <option value="modérée" selected>Modérée</option>
            <option value="sévère">Sévère</option>
            <option value="critique">Critique</option>
        </select>
        <button type="button" class="btn-remove-item" onclick="removeItem(this)">
            <i class="fas fa-minus"></i>
        </button>
    `;
    
    container.appendChild(div);
}

function addIntolerance() {
    const container = document.getElementById('intolerances-container');
    const index = container.children.length;
    
    const div = document.createElement('div');
    div.className = 'intolerance-item';
    div.innerHTML = `
        <input type="text" placeholder="Substance (ex: lactose, fructose...)" name="intolerances[${index}].substance">
        <select name="intolerances[${index}].severity">
            <option value="légère">Légère</option>
            <option value="modérée" selected>Modérée</option>
            <option value="sévère">Sévère</option>
        </select>
        <button type="button" class="btn-remove-item" onclick="removeItem(this)">
            <i class="fas fa-minus"></i>
        </button>
    `;
    
    container.appendChild(div);
}

function addRestriction() {
    const container = document.getElementById('restrictions-container');
    const index = container.children.length;
    
    const div = document.createElement('div');
    div.className = 'restriction-item';
    div.innerHTML = `
        <select name="restrictions[${index}].type">
            <option value="religieuse">Religieuse</option>
            <option value="éthique">Éthique</option>
            <option value="médicale">Médicale</option>
            <option value="personnelle">Personnelle</option>
        </select>
        <input type="text" placeholder="Description de la restriction" name="restrictions[${index}].restriction">
        <button type="button" class="btn-remove-item" onclick="removeItem(this)">
            <i class="fas fa-minus"></i>
        </button>
    `;
    
    container.appendChild(div);
}

function removeItem(button) {
    button.parentElement.remove();
}

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new AddResident();
});
