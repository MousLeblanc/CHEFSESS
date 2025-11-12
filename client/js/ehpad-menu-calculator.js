/**
 * Module pour le calculateur de portions et la génération de menu pour résidents
 * Extrait de ehpad-dashboard.html pour améliorer la maintenabilité
 */

// Initialiser le générateur de menu personnalisé
document.addEventListener('DOMContentLoaded', () => {
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
  function getPortionMultiplier(raw) {
    if (raw == null) return 1;
    const s = String(raw).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    // numeric
    const num = parseFloat(s.replace(',', '.'));
    if (!isNaN(num) && num > 0) {
      if (num <= 0.6) return 0.5; // treat ~0.5 as demi
      if (num >= 1.4) return 1.5; // treat ~1.5-2 as double (×1.5)
      return 1;
    }
    // keywords
    if (/(demi|1\/2|half|½)/.test(s)) return 0.5;
    if (/(double|x2|2x|\b2\b)/.test(s)) return 1.5; // Double portion = ×1.5
    return 1;
  }

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

      // 🔐 SÉCURITÉ : Le backend filtre déjà par siteId
      const resp = await fetch(`/api/residents/site/${siteId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // ✅ VALIDATION : Parser la réponse de manière sécurisée
      let data;
      if (typeof safeAPIParse === 'function') {
        const parsed = await safeAPIParse(resp, {
          required: ['success', 'data'],
          types: { success: 'boolean', data: 'object' }
        });
        if (!parsed.success) {
          console.warn('⚠️ Réponse API invalide:', parsed.error);
          return;
        }
        data = parsed.data;
      } else {
        if (!resp.ok) return;
        data = await resp.json();
      }
      
      // Le backend a déjà filtré par siteId, les résidents retournés sont sécurisés
      const residents = Array.isArray(data?.data) ? data.data : [];

      let normal = 0, demi = 0, dbl = 0;
      residents.forEach(r => {
        const portionRaw = r?.nutritionalProfile?.portionSize ?? r?.portion ?? r?.portionSize;
        const mult = getPortionMultiplier(portionRaw);
        if (mult === 1.5) dbl++; // Double portion = 1.5
        else if (mult === 0.5) demi++;
        else normal++;
      });

      if ($n) $n.value = String(normal);
      if ($h) $h.value = String(demi);
      if ($d) $d.value = String(dbl);

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
  const generateMenuResidentsModal = document.getElementById('generate-menu-residents-modal');
  const generateMenuResidentsConfirmBtn = document.getElementById('generate-menu-residents-confirm-btn');

  // Ouvrir la modal
  if (generateMenuResidentsBtn) {
    generateMenuResidentsBtn.addEventListener('click', async () => {
      await openGenerateMenuResidentsModal();
    });
  }

  // Fonction pour ouvrir la modal et charger les données
  async function openGenerateMenuResidentsModal() {
    if (!generateMenuResidentsModal) return;
    generateMenuResidentsModal.style.display = 'block';
    
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

      // 🔐 SÉCURITÉ : Le backend filtre déjà par siteId et statut
      // Le filtrage côté client est une double sécurité pour l'UI uniquement
      const response = await fetch(`/api/residents/site/${siteId}?status=actif&limit=1000`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // ✅ VALIDATION : Parser la réponse de manière sécurisée
      let data;
      if (typeof safeAPIParse === 'function') {
        const parsed = await safeAPIParse(response, {
          required: ['success', 'data'],
          types: { success: 'boolean', data: 'object' }
        });
        if (!parsed.success) {
          console.warn('⚠️ Réponse API invalide:', parsed.error);
          if (typeof showToast === 'function') {
            showToast('Erreur lors du chargement des résidents', 'error');
          }
          return;
        }
        data = parsed.data;
      } else {
        if (!response.ok) {
          if (typeof showToast === 'function') {
            showToast('Erreur lors du chargement des résidents', 'error');
          }
          return;
        }
        data = await response.json();
      }
      
      // Le backend a déjà filtré par siteId et statut 'actif'
      // Filtrage côté client : double sécurité pour l'UI (ne devrait jamais filtrer si le backend fonctionne correctement)
      const allResidents = data?.data || [];
      const siteIdStr = String(siteId);
      const activeResidents = allResidents.filter(r => {
        // Vérifier le statut (déjà fait par le backend, mais double sécurité)
        const status = r.status ? String(r.status).toLowerCase().trim() : '';
        if (status !== 'actif') {
          console.warn(`⚠️ Modal - Résident ${r.firstName} ${r.lastName} avec statut "${status}" retourné par le backend (devrait être filtré)`);
          return false;
        }
        
        // Vérifier que le résident appartient bien à ce site (déjà fait par le backend, mais double sécurité)
        const residentSiteId = r.siteId ? (r.siteId._id ? String(r.siteId._id) : String(r.siteId)) : null;
        if (!residentSiteId || residentSiteId !== siteIdStr) {
          console.error(`🚨 SÉCURITÉ - Résident ${r.firstName} ${r.lastName} du site ${residentSiteId} retourné pour le site ${siteIdStr} (le backend devrait avoir filtré)`);
          return false;
        }
        
        return true;
      });
      
      console.log(`📊 Modal - Résidents chargés pour site ${siteIdStr}: ${allResidents.length} retournés par le backend, ${activeResidents.length} après filtrage client (double sécurité)`);
      
      displayResidentsSummaryInModal(activeResidents);
    } catch (error) {
      console.error('Erreur:', error);
      if (typeof showToast === 'function') {
        showToast('Erreur lors du chargement des résidents', 'error');
      }
    }
  }

  window.closeGenerateMenuResidentsModal = function() {
    if (generateMenuResidentsModal) generateMenuResidentsModal.style.display = 'none';
  };

  if (generateMenuResidentsModal) {
    generateMenuResidentsModal.addEventListener('click', (e) => {
      if (e.target === generateMenuResidentsModal) closeGenerateMenuResidentsModal();
    });
  }

  function displayResidentsSummaryInModal(residents) {
    // Filtrer uniquement les résidents ACTIFS (double sécurité)
    const activeResidents = (residents || []).filter(r => {
      const status = r.status ? String(r.status).toLowerCase().trim() : '';
      return status === 'actif';
    });
    
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
      emptyDiv.style.cssText = 'grid-column: 1/-1; text-align: center; opacity: 0.8; padding: 1rem;';
      emptyDiv.textContent = 'Aucun résident actif trouvé';
      container.appendChild(emptyDiv);
      return;
    }

    totalResidentsEl.textContent = activeResidents.length;

    let totalPortions = 0;
    activeResidents.forEach(resident => {
      const ps = resident.portionSize;
      if (ps === 0.5) totalPortions += 0.5;
      else if (ps === 2) totalPortions += 1.5;
      else totalPortions += 1;
    });
    totalPortionsEl.textContent = Math.round(totalPortions * 100) / 100;

    // Fonction pour normaliser le nom d'allergène (éviter les doublons)
    const normalizeAllergen = (name) => {
      const normalized = String(name).toLowerCase().trim();
      const variants = {
        'oeufs': 'oeufs', 'oeuf': 'oeufs', 'eggs': 'oeufs',
        'arachides': 'arachides', 'peanuts': 'arachides',
        'fruits_a_coque': 'fruits_a_coque', 'nuts': 'fruits_a_coque', 'noix': 'fruits_a_coque',
        'soja': 'soja', 'soy': 'soja',
        'poisson': 'poisson', 'fish': 'poisson',
        'crustaces': 'crustaces', 'shellfish': 'crustaces',
        'mollusques': 'mollusques', 'molluscs': 'mollusques',
        'celeri': 'celeri', 'celery': 'celeri',
        'moutarde': 'moutarde', 'mustard': 'moutarde',
        'gluten': 'gluten',
        'lactose': 'lactose',
        'sesame': 'sesame',
        'sulfites': 'sulfites',
        'lupin': 'lupin'
      };
      return variants[normalized] || normalized;
    };

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
      itemDiv.style.cssText = 'background: rgba(255,255,255,0.15); padding: 0.75rem 1rem; border-radius: 8px; backdrop-filter: blur(10px); display: flex; justify-content: space-between; align-items: center;';
      
      // Conteneur pour le nom avec icône
      const nameSpan = document.createElement('span');
      nameSpan.style.cssText = 'font-weight: 500; font-size: 0.9rem; display: flex; align-items: center;';
      
      // Icône (sécurisée : classe FontAwesome hardcodée)
      const icon = document.createElement('i');
      icon.className = iconClass;
      // Sécurisé : iconColor est une valeur hardcodée passée en paramètre, pas des données utilisateur
      icon.style.cssText = `margin-right: 0.5rem; color: ${iconColor};`;
      nameSpan.appendChild(icon);
      
      // Nom (sécurisé : utilisation de textContent)
      const nameText = document.createTextNode(name);
      nameSpan.appendChild(nameText);
      
      // Conteneur pour le count
      const countSpan = document.createElement('span');
      countSpan.style.cssText = 'background: rgba(255,255,255,0.3); padding: 0.25rem 0.75rem; border-radius: 20px; font-weight: 700; font-size: 0.85rem;';
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
        // Sécurisé : formatAllergenName retourne une string, utilisée avec textContent
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
        // Sécurisé : formatRestrictionName retourne une string, utilisée avec textContent
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
      emptyDiv.style.cssText = 'grid-column: 1/-1; text-align: center; opacity: 0.8; padding: 1rem;';
      emptyDiv.textContent = 'Aucune allergie ou restriction enregistrée';
      container.appendChild(emptyDiv);
    }
  }

  function formatAllergenName(allergen) {
    const names = {'gluten': 'Gluten', 'lactose': 'Lactose', 'oeufs': 'Œufs', 'oeuf': 'Œufs', 'eggs': 'Œufs',
      'arachides': 'Arachides', 'peanuts': 'Arachides', 'fruits_a_coque': 'Fruits à coque', 'nuts': 'Fruits à coque',
      'noix': 'Fruits à coque', 'soja': 'Soja', 'soy': 'Soja', 'poisson': 'Poisson', 'fish': 'Poisson',
      'crustaces': 'Crustacés', 'shellfish': 'Crustacés', 'mollusques': 'Mollusques', 'molluscs': 'Mollusques',
      'celeri': 'Céleri', 'celery': 'Céleri', 'moutarde': 'Moutarde', 'mustard': 'Moutarde',
      'sesame': 'Sésame', 'sulfites': 'Sulfites', 'lupin': 'Lupin'};
    return names[allergen.toLowerCase()] || allergen.charAt(0).toUpperCase() + allergen.slice(1);
  }

  function formatRestrictionName(restriction) {
    const names = {'vegetarien': 'Végétarien', 'vegan': 'Végan', 'sans_gluten': 'Sans gluten',
      'gluten_free': 'Sans gluten', 'sans_lactose': 'Sans lactose', 'lactose_free': 'Sans lactose',
      'halal': 'Halal', 'casher': 'Casher', 'kosher': 'Casher', 'sans_porc': 'Sans porc', 'no_pork': 'Sans porc',
      'sans_viande_rouge': 'Sans viande rouge', 'no_red_meat': 'Sans viande rouge', 'sans_sel': 'Sans sel',
      'salt_free': 'Sans sel', 'hyposode': 'Hyposodé', 'pauvre_en_sucre': 'Pauvre en sucre', 'low_sugar': 'Pauvre en sucre',
      'diabetique': 'Diabétique', 'diabetic': 'Diabétique'};
    return names[restriction.toLowerCase()] || restriction.charAt(0).toUpperCase() + restriction.slice(1);
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
      closeGenerateMenuResidentsModal();
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
        // 🔐 SÉCURITÉ : Le backend filtre déjà par siteId et statut
        const response = await fetch(`/api/residents/site/${siteId}?status=actif&limit=1000`, { credentials: 'include' });
        
        // ✅ VALIDATION : Parser la réponse de manière sécurisée
        let data;
        if (typeof safeAPIParse === 'function') {
          const parsed = await safeAPIParse(response, {
            required: ['success', 'data'],
            types: { success: 'boolean', data: 'object' }
          });
          if (!parsed.success) {
            throw new Error(parsed.error || 'Erreur lors du chargement des résidents');
          }
          data = parsed.data;
        } else {
          if (!response.ok) throw new Error('Erreur lors du chargement des résidents');
          data = await response.json();
        }
        
        // Le backend a déjà filtré par siteId et statut 'actif'
        // Filtrage côté client : double sécurité pour l'UI (ne devrait jamais filtrer si le backend fonctionne correctement)
        const allResidents = data?.data || [];
        const siteIdStr = String(siteId);
        const residents = allResidents.filter(r => {
          // Vérifier le statut (déjà fait par le backend, mais double sécurité)
          const status = r.status ? String(r.status).toLowerCase().trim() : '';
          if (status !== 'actif') {
            console.warn(`⚠️ Génération menu - Résident avec statut "${status}" retourné par le backend (devrait être filtré)`);
            return false;
          }
          
          // Vérifier que le résident appartient bien à ce site (déjà fait par le backend, mais double sécurité)
          const residentSiteId = r.siteId ? (r.siteId._id ? String(r.siteId._id) : String(r.siteId)) : null;
          if (!residentSiteId || residentSiteId !== siteIdStr) {
            console.error(`🚨 SÉCURITÉ - Résident du site ${residentSiteId} retourné pour le site ${siteIdStr} (le backend devrait avoir filtré)`);
            return false;
          }
          
          return true;
        });
        console.log(`📊 Génération menu - Résidents pour site ${siteIdStr}: ${allResidents.length} retournés par le backend, ${residents.length} après filtrage client (double sécurité)`);
        let totalPortions = 0;
        residents.forEach(resident => {
          const ps = resident.portionSize;
          if (ps === 0.5) totalPortions += 0.5;
          else if (ps === 2) totalPortions += 1.5;
          else totalPortions += 1;
        });
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

