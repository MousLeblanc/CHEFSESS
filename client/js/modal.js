/**
 * Classe Modal réutilisable
 * Gère l'ouverture, la fermeture et les interactions des modales
 */
class Modal {
  /**
   * @param {string|HTMLElement} modalElement - ID de la modale ou élément DOM
   * @param {Object} options - Options de configuration
   * @param {Function} options.onOpen - Callback appelé à l'ouverture
   * @param {Function} options.onClose - Callback appelé à la fermeture
   * @param {boolean} options.closeOnBackdropClick - Fermer en cliquant sur le backdrop (défaut: true)
   * @param {boolean} options.closeOnEscape - Fermer avec la touche Escape (défaut: true)
   * @param {boolean} options.lockBodyScroll - Bloquer le scroll du body (défaut: true)
   * @param {string} options.closeButtonSelector - Sélecteur pour les boutons de fermeture (défaut: '.modal-close')
   */
  constructor(modalElement, options = {}) {
    // Récupérer l'élément modal
    if (typeof modalElement === 'string') {
      this.modal = document.getElementById(modalElement);
      if (!this.modal) {
        console.error(`❌ Modal: Élément avec l'ID "${modalElement}" non trouvé`);
        return;
      }
    } else if (modalElement instanceof HTMLElement) {
      this.modal = modalElement;
    } else {
      console.error('❌ Modal: Élément invalide fourni');
      return;
    }

    // Options par défaut
    this.options = {
      onOpen: null,
      onClose: null,
      closeOnBackdropClick: true,
      closeOnEscape: true,
      lockBodyScroll: true,
      closeButtonSelector: '.modal-close',
      ...options
    };

    // État
    this.isOpen = false;
    this.escapeHandler = null;

    // Initialiser
    this.init();
  }

  /**
   * Initialise la modale
   */
  init() {
    // S'assurer que la modale est fermée au départ
    this.close(false); // false = ne pas appeler onClose

    // Ajouter l'écouteur pour le clic sur le backdrop
    if (this.options.closeOnBackdropClick) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }

    // Ajouter les écouteurs pour les boutons de fermeture
    const closeButtons = this.modal.querySelectorAll(this.options.closeButtonSelector);
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.close();
      });
    });

    // Ajouter l'écouteur pour la touche Escape
    if (this.options.closeOnEscape) {
      this.escapeHandler = (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      };
      document.addEventListener('keydown', this.escapeHandler);
    }
  }

  /**
   * Ouvre la modale
   * @param {Object} data - Données optionnelles à passer au callback onOpen
   */
  open(data = null) {
    if (!this.modal) return;

    // Afficher la modale
    if (this.modal.classList && this.modal.classList.contains('modal-overlay')) {
      // Modale avec classe CSS (utilise .show)
      this.modal.classList.add('show');
    } else {
      // Fallback pour les modales qui utilisent style.display
      // Vérifier le style inline existant
      const inlineDisplay = this.modal.style.display;
      
      // Si la modale est cachée (display: none), la rendre visible
      if (!inlineDisplay || inlineDisplay === 'none') {
        // Vérifier si la modale a un attribut style avec display:flex
        const styleAttr = this.modal.getAttribute('style') || '';
        if (styleAttr.includes('display: flex') || styleAttr.includes('display:flex')) {
          this.modal.style.display = 'flex';
        } else {
          // Par défaut, utiliser block
          this.modal.style.display = 'block';
        }
      }
    }

    this.isOpen = true;

    // Bloquer le scroll du body
    if (this.options.lockBodyScroll) {
      document.body.style.overflow = 'hidden';
    }

    // Appeler le callback onOpen
    if (this.options.onOpen && typeof this.options.onOpen === 'function') {
      this.options.onOpen(data);
    }
  }

  /**
   * Ferme la modale
   * @param {boolean} callOnClose - Appeler le callback onClose (défaut: true)
   */
  close(callOnClose = true) {
    if (!this.modal) return;

    // Masquer la modale
    if (this.modal.classList) {
      this.modal.classList.remove('show');
    } else {
      // Fallback pour les modales qui utilisent style.display
      this.modal.style.display = 'none';
    }

    this.isOpen = false;

    // Débloquer le scroll du body
    if (this.options.lockBodyScroll) {
      document.body.style.overflow = '';
    }

    // Appeler le callback onClose
    if (callOnClose && this.options.onClose && typeof this.options.onClose === 'function') {
      this.options.onClose();
    }
  }

  /**
   * Toggle l'état de la modale
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Vérifie si la modale est ouverte
   * @returns {boolean}
   */
  getIsOpen() {
    return this.isOpen;
  }

  /**
   * Détruit la modale et nettoie les écouteurs
   */
  destroy() {
    // Retirer l'écouteur Escape
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }

    // Fermer la modale
    this.close(false);

    // Réinitialiser
    this.modal = null;
    this.isOpen = false;
  }

  /**
   * Met à jour les options
   * @param {Object} newOptions - Nouvelles options
   */
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
  window.Modal = Modal;
}

// Export pour modules ES6
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Modal;
}
