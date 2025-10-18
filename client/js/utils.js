export function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✓' : '✗'}</div>
        <div>${message}</div>
    `;
    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    } else {
        console.warn('Conteneur #toast-container introuvable');
    }
}

// Fonction fetch améliorée avec en-têtes no-cache automatiques
export async function fetchWithNoCache(url, options = {}) {
    const defaultHeaders = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    };

    const mergedOptions = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    return fetch(url, mergedOptions);
}

// Initialiser l'interception globale des requêtes fetch (optionnel)
export function initFetchInterceptor() {
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
        const defaultHeaders = {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        };

        const mergedOptions = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        return originalFetch(url, mergedOptions);
    };
}

// Fonction pour scroller automatiquement vers un élément
export function scrollToElement(element, options = {}) {
    const defaultOptions = {
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
    };

    const scrollOptions = { ...defaultOptions, ...options };

    if (element) {
        // Petit délai pour s'assurer que l'élément est visible dans le DOM
        setTimeout(() => {
            element.scrollIntoView(scrollOptions);
        }, options.delay || 100);
    }
}

// Fonction pour afficher un élément et scroller vers lui
export function showAndScrollTo(element, showClass = 'show', options = {}) {
    if (!element) return;

    // Ajouter la classe pour afficher l'élément
    element.classList.add(showClass);
    
    // Scroller vers l'élément
    scrollToElement(element, options);
}

// Fonction pour créer une modale centrée
export function setupModal(modalElement, options = {}) {
    if (!modalElement) return;

    const {
        closeOnClickOutside = true,
        closeOnEscape = true,
        closeButtonSelector = '.modal-close-btn',
        cancelButtonSelector = '.cancel-btn'
    } = options;

    // Fermer en cliquant sur le fond
    if (closeOnClickOutside) {
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                closeModal(modalElement);
            }
        });
    }

    // Fermer avec la touche Echap
    if (closeOnEscape) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalElement.classList.contains('show')) {
                closeModal(modalElement);
            }
        });
    }

    // Bouton de fermeture (X)
    const closeBtn = modalElement.querySelector(closeButtonSelector);
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modalElement));
    }

    // Bouton d'annulation
    const cancelBtn = modalElement.querySelector(cancelButtonSelector);
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => closeModal(modalElement));
    }
}

// Fonction pour ouvrir une modale
export function openModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.add('show');
    document.body.style.overflow = 'hidden'; // Empêcher le scroll du body
}

// Fonction pour fermer une modale
export function closeModal(modalElement) {
    if (!modalElement) return;
    modalElement.classList.remove('show');
    document.body.style.overflow = ''; // Restaurer le scroll du body
    
    // Réinitialiser le formulaire si c'est un formulaire
    if (modalElement.tagName === 'FORM') {
        modalElement.reset();
        // Supprimer l'ID de produit si présent
        delete modalElement.dataset.productId;
    }
}