/**
 * Module pour le calculateur de portions et la génération de menu pour résidents
 * Extrait de ehpad-dashboard.html pour améliorer la maintenabilité
 */

// Initialiser le générateur de menu personnalisé
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier que ResidentUtils est disponible
  if (typeof window.ResidentUtils === 'undefined') {
    console.error('❌ ResidentUtils non disponible. Assurez-vous que resident-utils.js est chargé avant ce script.');
    return;
  }
  
  // Extraire les fonctions utilitaires
  const {
    loadActiveResidents,
    countResidentsByPortion,
    calculateTotalPortions,
    normalizeAllergen,
    formatAllergenName,
    formatRestrictionName
  } = window.ResidentUtils;
  if (typeof customMenuGenerator === 'undefined') {
    console.warn('⚠️ customMenuGenerator non disponible');
    return;
  }
  
  customMenuGenerator.init();

  // ===== Calculateur de portions → synchronisation avec le générateur =====
  const $n = document.getElementById('portion-normal');
  const $h = document.getElementById('portion-demi');
  const $d = document.getElementById('portion-double');
  const $totalResidents = document.getElementById('calc-total-residents');
  const $totalPortions = document.getElementById('calc-total-portions');
  const $apply = document.getElementById('calc-apply-to-generator');
  const $refresh = document.getElementById('calc-refresh');
  const $reset = document.getElementById('calc-reset');

  function toNum(el){ return Math.max(0, parseFloat(el?.value || '0') || 0); }

  function refreshTotals(){
    const normal = toNum($n);
    const demi = toNum($h);
    const dbl = toNum($d);
    const residents = normal + demi + dbl;
    const portions = normal + 0.5 * demi + 1.5 * dbl;
    if ($totalResidents) $totalResidents.textContent = residents.toString();
    if ($totalPortions) $totalPortions.textContent = (Math.round(portions * 100) / 100).toString();
    return { residents, portions };
  }

  // Les champs sont en lecture seule: calculés automatiquement depuis les fiches résidents
  refreshTotals();

  if ($apply) {
    $apply.addEventListener('click', (e) => {
      e.preventDefault();
      const { portions } = refreshTotals();
      const target = document.getElementById('custom-menu-people');
      if (target) {
        target.value = Math.max(1, Math.round(portions));
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  }

  if ($reset) {
    $reset.addEventListener('click', (e) => {
      e.preventDefault();
      [$n, $h, $d].forEach(el => { if (el) el.value = '0'; });
      refreshTotals();
    });
  }

  // ===== Pré-remplissage depuis les fiches résidents =====
  async function prefillFromResidents() {
    try {
      // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
      const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
      if (!user) return;
      
      const siteId = user?.siteId;
      if (!siteId || (typeof isValidObjectId === 'function' && !isValidObjectId(siteId))) {
        console.warn('⚠️ SiteId invalide ou manquant');
        return;
      }

      // ✅ REFACTORISÉ : Utiliser la fonction utilitaire centralisée
      const residents = await loadActiveResidents(siteId, {
        filterActive: false, // Charger tous les résidents (pas seulement actifs pour le calculateur)
        clientSideFilter: true
      });

      // ✅ REFACTORISÉ : Utiliser la fonction utilitaire pour compter les portions
      const counts = countResidentsByPortion(residents);

      if ($n) $n.value = String(counts.normal);
      if ($h) $h.value = String(counts.demi);
      if ($d) $d.value = String(counts.double);

      const totals = refreshTotals();
      // Mettre aussi à jour le générateur directement
      const target = document.getElementById('custom-menu-people');
      if (target) target.value = Math.max(1, Math.round(totals.portions));
    } catch (e) {
      // silencieux: on ne bloque pas l'UI si l'appel échoue
      console.warn('Prefill residents failed', e);
    }
  }

  prefillFromResidents();

  if ($refresh) {
    $refresh.addEventListener('click', (e) => {
      e.preventDefault();
      prefillFromResidents();
    });
  }

  // ===== Suggestions rapides: appliquer des objectifs prédéfinis =====
  const suggestionButtons = document.querySelectorAll('.quick-goal');
  suggestionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      try {
        // ✅ VALIDATION : Parser JSON de manière sécurisée
        const goals = typeof safeJSONParse === 'function' 
          ? safeJSONParse(btn.getAttribute('data-goals') || '[]', [], (val) => Array.isArray(val))
          : JSON.parse(btn.getAttribute('data-goals') || '[]');
        if (!Array.isArray(goals) || goals.length === 0) return;
        // Remplacer les objectifs actuels par la suggestion
        customMenuGenerator.nutritionalGoals = goals.map(g => ({
          nutrient: g.nutrient,
          label: g.label,
          target: g.target,
          unit: g.unit,
          minIngredientValue: customMenuGenerator.getMinIngredientValue ? customMenuGenerator.getMinIngredientValue(g.nutrient) : 0
        }));
        if (typeof customMenuGenerator.renderNutritionalGoals === 'function') {
          customMenuGenerator.renderNutritionalGoals();
        }
        if (typeof customMenuGenerator.showToast === 'function') {
          customMenuGenerator.showToast('✅ Objectifs appliqués: ' + goals.map(g=>g.label+" "+g.target+g.unit).join(' • '), 'success');
        }
      } catch (e) {
        console.warn('Suggestion parse error', e);
      }
    });
  });

  // ===== Modal Générer menu pour résidents =====
  const generateMenuResidentsBtn = document.getElementById('generate-menu-all-residents-btn');
  const generateMenuResidentsModalEl = document.getElementById('generate-menu-residents-modal');
  const generateMenuResidentsConfirmBtn = document.getElementById('generate-menu-residents-confirm-btn');

  // ✅ REFACTORISÉ : Utiliser la classe Modal réutilisable
  let generateMenuResidentsModal = null;
  if (generateMenuResidentsModalEl && typeof window.Modal !== 'undefined') {
    generateMenuResidentsModal = new window.Modal('generate-menu-residents-modal', {
      onOpen: async () => {
        try {
          // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
          const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
          if (!user) {
            if (typeof showToast === 'function') {
              showToast('Erreur: Utilisateur non connecté', 'error');
            }
            generateMenuResidentsModal.close();
            return;
          }
          const siteId = user?.siteId;
          if (!siteId || (typeof isValidObjectId === 'function' && !isValidObjectId(siteId))) {
            if (typeof showToast === 'function') {
              showToast('Erreur: Site ID invalide ou manquant', 'error');
            }
            generateMenuResidentsModal.close();
            return;
          }

          // ✅ REFACTORISÉ : Utiliser la fonction utilitaire centralisée
          const activeResidents = await loadActiveResidents(siteId, {
            filterActive: true,
            limit: 1000,
            clientSideFilter: true
          });
          
          displayResidentsSummaryInModal(activeResidents);
        } catch (error) {
          console.error('Erreur:', error);
          if (typeof showToast === 'function') {
            showToast('Erreur lors du chargement des résidents', 'error');
          }
        }
      },
      closeOnBackdropClick: true,
      closeOnEscape: true,
      lockBodyScroll: true
    });
  }

  // Ouvrir la modal
  if (generateMenuResidentsBtn && generateMenuResidentsModal) {
    generateMenuResidentsBtn.addEventListener('click', () => {
      generateMenuResidentsModal.open();
    });
  }

  // Fonction globale pour compatibilité (si utilisée ailleurs)
  window.closeGenerateMenuResidentsModal = function() {
    if (generateMenuResidentsModal) {
      generateMenuResidentsModal.close();
    }
  };

  function displayResidentsSummaryInModal(residents) {
    const activeResidents = residents || [];
    
    const totalResidentsEl = document.getElementById('modal-summary-total-residents');
    const totalPortionsEl = document.getElementById('modal-summary-total-portions');
    const container = document.getElementById('modal-summary-allergies-restrictions');
    
    if (!totalResidentsEl || !totalPortionsEl || !container) {
      console.error('❌ Éléments DOM manquants pour l\'affichage du résumé');
      return;
    }
    
    if (activeResidents.length === 0) {
      totalResidentsEl.textContent = '0';
      totalPortionsEl.textContent = '0';
      // Sécurisé : utilisation de createElement et textContent au lieu de innerHTML
      container.textContent = ''; // Vider le conteneur
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-message';
      emptyDiv.textContent = 'Aucun résident actif trouvé';
      container.appendChild(emptyDiv);
      return;
    }

    totalResidentsEl.textContent = activeResidents.length;

    // ✅ REFACTORISÉ : Utiliser la fonction utilitaire pour calculer les portions
    const totalPortions = calculateTotalPortions(activeResidents);
    totalPortionsEl.textContent = Math.round(totalPortions * 100) / 100;

    const allergiesCount = {}, restrictionsCount = {};
    activeResidents.forEach(resident => {
      // Utiliser un Set pour éviter de compter deux fois le même résident pour le même allergène
      const residentAllergens = new Set();
      
      if (resident.nutritionalProfile?.allergies?.length > 0) {
        resident.nutritionalProfile.allergies.forEach(allergy => {
          const allergen = allergy.allergen || allergy;
          const normalized = normalizeAllergen(allergen);
          residentAllergens.add(normalized);
        });
      }
      if (resident.nutritionalProfile?.intolerances?.length > 0) {
        resident.nutritionalProfile.intolerances.forEach(intolerance => {
          const substance = intolerance.substance || intolerance;
          const normalized = normalizeAllergen(substance);
          residentAllergens.add(normalized);
        });
      }
      
      // Compter chaque allergène une seule fois par résident
      residentAllergens.forEach(allergen => {
        allergiesCount[allergen] = (allergiesCount[allergen] || 0) + 1;
      });
      
      if (resident.nutritionalProfile?.dietaryRestrictions?.length > 0) {
        resident.nutritionalProfile.dietaryRestrictions.forEach(restriction => {
          const rn = restriction.restriction || restriction.type || restriction;
          const normalized = String(rn).toLowerCase().trim();
          restrictionsCount[normalized] = (restrictionsCount[normalized] || 0) + 1;
        });
      }
    });

    // Sécurisé : vider le conteneur avant d'ajouter de nouveaux éléments
    container.textContent = '';
    
    // Fonction helper pour créer un élément d'allergie/restriction de manière sécurisée
    const createAllergyRestrictionItem = (name, count, iconClass, iconColor) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'card-item';
      
      // Conteneur pour le nom avec icône
      const nameSpan = document.createElement('span');
      nameSpan.className = 'text-label';
      
      // Icône (sécurisée : classe FontAwesome hardcodée)
      const icon = document.createElement('i');
      icon.className = `${iconClass} icon-spacing`;
      // Sécurisé : iconColor est une valeur hardcodée passée en paramètre, pas des données utilisateur
      icon.style.color = iconColor;
      nameSpan.appendChild(icon);
      
      // Nom (sécurisé : utilisation de textContent)
      const nameText = document.createTextNode(name);
      nameSpan.appendChild(nameText);
      
      // Conteneur pour le count
      const countSpan = document.createElement('span');
      countSpan.className = 'badge-count';
      // Sécurisé : count est un nombre, converti en string avec textContent
      countSpan.textContent = String(count);
      
      itemDiv.appendChild(nameSpan);
      itemDiv.appendChild(countSpan);
      return itemDiv;
    };
    
    // Créer les éléments pour les allergies
    const allergiesEntries = Object.entries(allergiesCount).sort((a, b) => b[1] - a[1]);
    if (allergiesEntries.length > 0) {
      allergiesEntries.forEach(([allergen, count]) => {
        // ✅ REFACTORISÉ : Utiliser la fonction utilitaire
        const formattedName = formatAllergenName(allergen);
        const item = createAllergyRestrictionItem(
          formattedName,
          count,
          'fas fa-exclamation-triangle',
          '#ffc107'
        );
        container.appendChild(item);
      });
    }
    
    // Créer les éléments pour les restrictions
    const restrictionsEntries = Object.entries(restrictionsCount).sort((a, b) => b[1] - a[1]);
    if (restrictionsEntries.length > 0) {
      restrictionsEntries.forEach(([restriction, count]) => {
        // ✅ REFACTORISÉ : Utiliser la fonction utilitaire
        const formattedName = formatRestrictionName(restriction);
        const item = createAllergyRestrictionItem(
          formattedName,
          count,
          'fas fa-ban',
          '#e74c3c'
        );
        container.appendChild(item);
      });
    }
    
    // Message si aucune allergie ou restriction
    if (allergiesEntries.length === 0 && restrictionsEntries.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'empty-message';
      emptyDiv.textContent = 'Aucune allergie ou restriction enregistrée';
      container.appendChild(emptyDiv);
    }
  }

  if (generateMenuResidentsConfirmBtn) {
    generateMenuResidentsConfirmBtn.addEventListener('click', async () => {
      const mealType = document.getElementById('modal-menu-type')?.value;
      const period = document.getElementById('modal-menu-period')?.value || '1';
      if (!mealType) {
        if (typeof showToast === 'function') {
          showToast('Veuillez sélectionner un type de repas', 'error');
        }
        return;
      }
      if (generateMenuResidentsModal) {
        generateMenuResidentsModal.close();
      }
      try {
        // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
        const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
        if (!user) {
          if (typeof showToast === 'function') {
            showToast('Erreur: Utilisateur non connecté', 'error');
          }
          return;
        }
        const siteId = user?.siteId;
        if (!siteId || (typeof isValidObjectId === 'function' && !isValidObjectId(siteId))) {
          if (typeof showToast === 'function') {
            showToast('Erreur: Site ID invalide ou manquant', 'error');
          }
          return;
        }
        // ✅ REFACTORISÉ : Utiliser la fonction utilitaire centralisée
        const residents = await loadActiveResidents(siteId, {
          filterActive: true,
          limit: 1000,
          clientSideFilter: true
        });
        
        // ✅ REFACTORISÉ : Utiliser la fonction utilitaire pour calculer les portions
        const totalPortions = calculateTotalPortions(residents);
        const peopleInput = document.getElementById('custom-menu-people');
        const typeSelect = document.getElementById('custom-menu-type');
        const periodSelect = document.getElementById('custom-menu-period');
        if (peopleInput) peopleInput.value = Math.max(1, Math.round(totalPortions));
        if (typeSelect) typeSelect.value = mealType;
        if (periodSelect) periodSelect.value = period;
        if (typeof customMenuGenerator !== 'undefined' && customMenuGenerator.generateCustomMenu) {
          await customMenuGenerator.generateCustomMenu();
        }
        const resultsDiv = document.getElementById('custom-menu-results');
        if (resultsDiv) resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (error) {
        console.error('Erreur:', error);
        if (typeof showToast === 'function') {
          showToast('Erreur lors de la génération du menu', 'error');
        }
      }
    });
  }
});

