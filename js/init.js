/**
 * ChAIf SES - JavaScript d'initialisation commun
 * Ce fichier contient les fonctionnalités communes à toutes les pages de l'application.
 */

// Attendre que le DOM soit entièrement chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser les onglets
    initTabs();
    
    // Initialiser les notifications (s'il y en a)
    initNotifications();
    
    // Initialiser les modales (s'il y en a)
    initModals();
    
    // Vérifier s'il y a des paramètres d'URL à traiter
    handleUrlParams();
    
    console.log('ChAIf SES - Initialisation terminée.');
});
/**
 * Initialisation globale des boutons de l'application
 * Garantit que tous les boutons ont des écouteurs d'événements correctement attachés
 */
function initButtons() {
  console.log('Initialisation des boutons...');
  
  // 1. Créer un registre des initialisations pour éviter les doublons
  if (!window.buttonInitialized) {
    window.buttonInitialized = new Set();
  }
  
  // 2. Initialiser les boutons généraux présents sur toutes les pages
  document.querySelectorAll('button, .btn, [role="button"]').forEach(button => {
    // Ignorer les boutons déjà initialisés
    if (window.buttonInitialized.has(button)) return;
    
    // Ajouter une classe visible lorsqu'un bouton est cliqué (feedback visuel)
    button.addEventListener('click', function(e) {
      // Empêcher le comportement par défaut pour les boutons sans type spécifié
      if (this.tagName === 'BUTTON' && !this.getAttribute('type')) {
        e.preventDefault();
      }
      
      // Effet visuel pour montrer que le bouton a été cliqué
      this.classList.add('btn-clicked');
      setTimeout(() => {
        this.classList.remove('btn-clicked');
      }, 200);
    });
    
    // Marquer le bouton comme initialisé
    window.buttonInitialized.add(button);
  });
  
  // Journaliser le nombre de boutons initialisés
  console.log(`${window.buttonInitialized.size} boutons initialisés.`);
}

// Appeler l'initialisation après le chargement du DOM
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser les boutons
  initButtons();
  
  // Attacher la fonction d'initialisation des boutons aux changements d'onglets
  // pour s'assurer que les boutons dans les onglets cachés sont également initialisés
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Petite temporisation pour laisser le DOM se mettre à jour
      setTimeout(initButtons, 100);
    });
  });
});

// Ré-initialiser les boutons après les modifications dynamiques du DOM (ex: AJAX)
document.addEventListener('DOMNodeInserted', function(e) {
  // Vérifier si l'élément inséré contient des boutons
  if (e.target.tagName && (
      e.target.tagName === 'BUTTON' || 
      e.target.classList?.contains('btn') || 
      e.target.querySelectorAll?.('button, .btn, [role="button"]').length > 0
  )) {
    // Ré-initialiser les boutons seulement si nécessaire
    setTimeout(initButtons, 50);
  }
});

/**
 * Gestion des onglets
 * Permet de changer entre les différents onglets dans l'interface.
 */
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    if (tabs.length === 0) return;
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Désactiver tous les onglets et contenus
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Activer l'onglet cliqué
            this.classList.add('active');
            
            // Activer le contenu correspondant
            const tabId = this.getAttribute('data-tab');
            const contentId = `${tabId}-tab`;
            const content = document.getElementById(contentId);
            
            if (content) {
                content.classList.add('active');
            } else {
                console.error(`Contenu d'onglet non trouvé: ${contentId}`);
            }
            
            // Stocker l'onglet actif dans le stockage local
            localStorage.setItem(`${window.location.pathname}-active-tab`, tabId);
        });
    });
    
    // Restaurer l'onglet actif s'il a été sauvegardé
    const activeTabId = localStorage.getItem(`${window.location.pathname}-active-tab`);
    if (activeTabId) {
        const savedTab = document.querySelector(`.tab[data-tab="${activeTabId}"]`);
        if (savedTab) {
            savedTab.click();
        }
    }
}

/**
 * Système de notification
 * Permet d'afficher des messages à l'utilisateur.
 */
function initNotifications() {
    // Ajouter un gestionnaire d'événements pour fermer les notifications
    document.querySelectorAll('.notification-close').forEach(button => {
        button.addEventListener('click', function() {
            const notification = this.closest('.notification');
            if (notification) {
                notification.remove();
            }
        });
    });
}

/**
 * Afficher une notification
 * @param {string} message - Le message à afficher
 * @param {string} type - Le type de notification (success, warning, danger, info)
 * @param {number} duration - Durée d'affichage en ms (0 pour persistant)
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Ajouter le contenu
    notification.innerHTML = `
        <div class="notification-content">${message}</div>
        <button class="notification-close">&times;</button>
    `;
    
    // Ajouter au conteneur de notifications ou créer si inexistant
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Ajouter la notification au conteneur
    notificationContainer.appendChild(notification);
    
    // Ajouter le gestionnaire pour fermer la notification
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.remove();
    });
    
    // Fermer automatiquement après la durée spécifiée si > 0
    if (duration > 0) {
        setTimeout(() => {
            // Vérifier si la notification existe encore
            if (notification.parentNode) {
                // Ajouter une classe pour l'animation de sortie
                notification.classList.add('notification-fadeout');
                
                // Supprimer après l'animation
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }
    
    return notification;
}

/**
 * Système de modales
 * Gère l'ouverture et la fermeture des fenêtres modales.
 */
function initModals() {
    // Ouvrir les modales
    document.querySelectorAll('[data-modal-target]').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.classList.add('active');
                document.body.classList.add('modal-open');
            }
        });
    });
    
    // Fermer les modales
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
        element.addEventListener('click', function(e) {
            // Ne fermer que si c'est le bouton de fermeture ou le clic direct sur l'overlay
            if (e.target === this) {
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.classList.remove('modal-open');
                }
            }
        });
    });
    
    // Fermer avec la touche Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        }
    });
}

/**
 * Traitement des paramètres d'URL
 * Permet de réagir à des paramètres spécifiques dans l'URL.
 */
function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Vérifier s'il y a une notification à afficher
    if (urlParams.has('notification')) {
        const message = urlParams.get('notification');
        const type = urlParams.get('notificationType') || 'info';
        
        if (message) {
            showNotification(decodeURIComponent(message), type);
        }
    }
    
    // Vérifier s'il faut ouvrir un onglet spécifique
    if (urlParams.has('tab')) {
        const tabId = urlParams.get('tab');
        const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
        
        if (tab) {
            tab.click();
        }
    }
    
    // Vérifier s'il faut ouvrir une modale
    if (urlParams.has('modal')) {
        const modalId = urlParams.get('modal');
        const modal = document.getElementById(modalId);
        
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    }
}

/**
 * Fonction de formatage de date
 * @param {Date|string} date - La date à formater
 * @param {string} format - Le format souhaité (par défaut: DD/MM/YYYY)
 * @returns {string} - La date formatée
 */
function formatDate(date, format = 'DD/MM/YYYY') {
    if (!date) return '';
    
    // Convertir en objet Date si c'est une chaîne
    if (typeof date === 'string') {
        date = new Date(date);
    }
    
    // Si la conversion a échoué
    if (isNaN(date.getTime())) {
        return '';
    }
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    // Remplacer les éléments de format
    let formattedDate = format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year)
        .replace('HH', hours)
        .replace('mm', minutes);
    
    return formattedDate;
}

/**
 * Fonction pour formater les prix
 * @param {number} price - Le prix à formater
 * @param {string} currency - Le symbole de la devise (par défaut: €)
 * @param {string} locale - La locale pour le formatage (par défaut: fr-FR)
 * @returns {string} - Le prix formaté
 */
function formatPrice(price, currency = '€', locale = 'fr-FR') {
    if (price === null || price === undefined) return '';
    
    // Formater avec l'API Intl
    return new Intl.NumberFormat(locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price) + ' ' + currency;
}

/**
 * Fonction pour vérifier si un élément est visible dans la fenêtre
 * @param {HTMLElement} element - L'élément à vérifier
 * @returns {boolean} - true si l'élément est visible
 */
function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Fonction pour faire défiler la page vers un élément
 * @param {HTMLElement|string} element - L'élément ou son ID
 * @param {number} offset - Décalage en pixels par rapport au haut
 * @param {number} duration - Durée de l'animation en ms
 */
function scrollToElement(element, offset = 0, duration = 500) {
    // Si c'est un ID, obtenir l'élément
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    
    if (!element) return;
    
    const startPosition = window.pageYOffset;
    const targetPosition = element.getBoundingClientRect().top + startPosition - offset;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        const easeInOutCubic = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        window.scrollTo(0, startPosition + (targetPosition - startPosition) * easeInOutCubic);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

/**
 * Fonctions d'aide pour les formulaires
 */

/**
 * Fonction pour valider un formulaire
 * @param {HTMLFormElement} form - Le formulaire à valider
 * @param {Object} customValidations - Validations personnalisées
 * @returns {boolean} - true si le formulaire est valide
 */
function validateForm(form, customValidations = {}) {
    let isValid = true;
    
    // Supprimer les anciennes erreurs
    form.querySelectorAll('.error-message').forEach(error => error.remove());
    form.querySelectorAll('.input-error').forEach(input => input.classList.remove('input-error'));
    
    // Vérifier les champs requis et les validations HTML5 standard
    form.querySelectorAll('input, select, textarea').forEach(field => {
        // Ignorer les champs désactivés
        if (field.disabled) return;
        
        // Validation standard HTML5
        if (!field.checkValidity()) {
            isValid = false;
            field.classList.add('input-error');
            
            // Ajouter un message d'erreur
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = field.validationMessage;
            field.parentNode.appendChild(errorMessage);
        }
        
        // Validation personnalisée si définie
        if (field.name in customValidations) {
            const customValidation = customValidations[field.name];
            const customResult = customValidation.validate(field.value, form);
            
            if (!customResult.valid) {
                isValid = false;
                field.classList.add('input-error');
                
                // Ajouter un message d'erreur personnalisé
                const errorMessage = document.createElement('div');
                errorMessage.className = 'error-message';
                errorMessage.textContent = customResult.message;
                field.parentNode.appendChild(errorMessage);
            }
        }
    });
    
    return isValid;
}

/**
 * Fonction pour sérialiser un formulaire en objet JavaScript
 * @param {HTMLFormElement} form - Le formulaire à sérialiser
 * @returns {Object} - Les données du formulaire
 */
function serializeForm(form) {
    const formData = new FormData(form);
    const data = {};
    
    for (const [name, value] of formData.entries()) {
        // Gérer les tableaux (champs avec le même nom)
        if (name.endsWith('[]')) {
            const key = name.substring(0, name.length - 2);
            if (!data[key]) {
                data[key] = [];
            }
            data[key].push(value);
        } else {
            data[name] = value;
        }
    }
    
    return data;
}

/**
 * Remplit un formulaire avec des données
 * @param {HTMLFormElement} form - Le formulaire à remplir
 * @param {Object} data - Les données à insérer
 */
function fillForm(form, data) {
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key];
            const field = form.querySelector(`[name="${key}"]`);
            
            if (!field) continue;
            
            // Traiter selon le type de champ
            if (field.type === 'checkbox') {
                field.checked = Boolean(value);
            } else if (field.type === 'radio') {
                const radio = form.querySelector(`[name="${key}"][value="${value}"]`);
                if (radio) {
                    radio.checked = true;
                }
            } else if (field.tagName === 'SELECT' && Array.isArray(value)) {
                // Select multiple
                value.forEach(val => {
                    const option = field.querySelector(`option[value="${val}"]`);
                    if (option) {
                        option.selected = true;
                    }
                });
            } else {
                field.value = value;
            }
        }
    }
}

/**
 * Fonction pour envoyer des données via AJAX
 * @param {string} url - L'URL de la requête
 * @param {Object} data - Les données à envoyer
 * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE)
 * @param {Object} options - Options supplémentaires
 * @returns {Promise} - Promesse résolue avec la réponse
 */
function ajaxRequest(url, data = null, method = 'GET', options = {}) {
    const fetchOptions = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...options.headers
        },
        credentials: 'same-origin'
    };
    
    // Ajouter le corps de la requête pour les méthodes non-GET
    if (method !== 'GET' && data) {
        fetchOptions.body = JSON.stringify(data);
    }
    
    // Ajouter les paramètres à l'URL pour les requêtes GET
    if (method === 'GET' && data) {
        const params = new URLSearchParams();
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                params.append(key, data[key]);
            }
        }
        url = `${url}?${params.toString()}`;
    }
    
    return fetch(url, fetchOptions)
        .then(response => {
            // Vérifier le type de contenu
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                return response.json().then(data => {
                    if (!response.ok) {
                        throw { status: response.status, data };
                    }
                    return data;
                });
            } else {
                return response.text().then(text => {
                    if (!response.ok) {
                        throw { status: response.status, text };
                    }
                    return text;
                });
            }
        });
}

// Exposer les fonctions utiles globalement
window.ChAIf = {
    showNotification,
    formatDate,
    formatPrice,
    validateForm,
    serializeForm,
    fillForm,
    ajaxRequest,
    scrollToElement
};

// Exporter pour les modules ES6
export {
    showNotification,
    formatDate,
    formatPrice,
    validateForm,
    serializeForm,
    fillForm,
    ajaxRequest,
    scrollToElement
};