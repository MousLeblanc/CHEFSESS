// js/fix-modal.js
(function() {
  console.log("Script de réparation de modal chargé");
  
  // Attendre que le DOM soit complètement chargé
  document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM chargé, initialisation des correctifs");
    
    // Vérifier l'existence des éléments essentiels
    const addBtn = document.getElementById('add-ingredient-btn');
    const ingredientModal = document.getElementById('ingredient-modal');
    const modalClose = document.getElementById('modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    
    console.log("Éléments vérifiés:", {
      addBtn: !!addBtn,
      ingredientModal: !!ingredientModal,
      modalClose: !!modalClose,
      cancelBtn: !!cancelBtn
    });
    
    // Si le bouton d'ajout et la modal existent
    if (addBtn && ingredientModal) {
      console.log("Ajout d'écouteurs d'événements de substitution");
      
      // 1. Réinitialiser le bouton d'ajout (supprimer tous les écouteurs précédents)
      const newAddBtn = addBtn.cloneNode(true);
      addBtn.parentNode.replaceChild(newAddBtn, addBtn);
      
      // 2. Ajouter un nouvel écouteur au bouton d'ajout
      newAddBtn.addEventListener('click', function(e) {
        console.log("Clic sur le bouton d'ajout détecté!");
        e.preventDefault();
        
        // Réinitialiser le formulaire
        const form = document.getElementById('ingredient-form');
        if (form) form.reset();
        
        // Mettre à jour le titre
        const titleEl = document.getElementById('modal-title');
        if (titleEl) titleEl.textContent = 'Ajouter un ingrédient';
        
        // Vider l'ID
        const idField = document.getElementById('ingredient-id');
        if (idField) idField.value = '';
        
        // Définir l'unité par défaut (optionnel)
        try {
          const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
          if (settings.defaultUnit) {
            const unitSelect = document.getElementById('ingredient-unit');
            const thresholdUnit = document.getElementById('threshold-unit');
            
            if (unitSelect) unitSelect.value = settings.defaultUnit;
            if (thresholdUnit) thresholdUnit.textContent = settings.defaultUnit;
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des paramètres:", error);
        }
        
        // Afficher la modal avec une méthode alternative
        ingredientModal.style.cssText = "display: flex !important; z-index: 9999 !important;";
        
        // Initialiser l'autocomplétion (si disponible)
        if (typeof initAutocomplete === 'function') {
          setTimeout(initAutocomplete, 100);
        }
      });
      
      // 3. Réinitialiser les boutons de fermeture
      if (modalClose) {
        const newModalClose = modalClose.cloneNode(true);
        modalClose.parentNode.replaceChild(newModalClose, modalClose);
        
        newModalClose.addEventListener('click', function() {
          console.log("Fermeture de la modal (×)");
          ingredientModal.style.display = 'none';
        });
      }
      
      if (cancelBtn) {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        newCancelBtn.addEventListener('click', function() {
          console.log("Annulation (bouton Annuler)");
          ingredientModal.style.display = 'none';
        });
      }
      
      // 4. S'assurer que la modal est initialement cachée
      ingredientModal.style.display = 'none';
      
      console.log("Tous les correctifs ont été appliqués avec succès");
    } else {
      console.error("Impossible d'appliquer les correctifs: éléments manquants");
      
      // Si les éléments sont manquants, créer un bouton d'urgence
      const emergencyBtn = document.createElement('button');
      emergencyBtn.textContent = "OUVRIR MODAL (URGENCE)";
      emergencyBtn.style.cssText = "position: fixed; top: 10px; right: 10px; z-index: 9999; background-color: red; color: white; padding: 10px; font-weight: bold;";
      
      emergencyBtn.addEventListener('click', function() {
        alert("Tentative d'ouverture de la modal d'urgence");
        
        // Tenter de localiser la modal par son ID
        const modal = document.getElementById('ingredient-modal');
        if (modal) {
          modal.style.cssText = "display: flex !important; z-index: 9999 !important;";
          console.log("Modal trouvée et affichée");
        } else {
          console.error("Modal introuvable");
          alert("Modal introuvable!");
        }
      });
      
      document.body.appendChild(emergencyBtn);
      console.log("Bouton d'urgence ajouté");
    }
  });
})();