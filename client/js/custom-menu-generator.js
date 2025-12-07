/**
 * Générateur de Menu IA Personnalisé avec Objectifs Nutritionnels
 * Module réutilisable pour tous les dashboards
 */

class CustomMenuGenerator {
    constructor() {
        // State
        this.nutritionalGoals = [];
        this.generatedMenus = [];
        this.acceptedMenu = null;
        this.addGoalModal = null;
        this.weeklyMenus = []; // Stocker les menus de la semaine pour remplacement individuel
        this.initialized = false; // Flag pour éviter les initialisations multiples
    }
    
    /**
     * Initialiser le générateur
     * Peut être appelé plusieurs fois sans problème (idempotent)
     */
    init() {
        // Si déjà initialisé, ne rien faire
        if (this.initialized) {
            console.log('🎯 Générateur déjà initialisé, skip');
            return;
        }
        
        console.log('🎯 Initialisation du générateur de menu personnalisé');
        
        // ✅ REFACTORISÉ : Utiliser la classe Modal réutilisable
        const modalEl = document.getElementById('add-nutritional-goal-modal');
        if (modalEl && typeof window.Modal !== 'undefined' && !this.addGoalModal) {
            this.addGoalModal = new window.Modal('add-nutritional-goal-modal', {
                onOpen: () => {
                    this.updateModalGoalsList();
                    // Focus sur le premier champ
                    const nutrientSelect = document.getElementById('goal-nutrient');
                    if (nutrientSelect) {
                        setTimeout(() => nutrientSelect.focus(), 100);
                    }
                },
                onClose: () => {
                    // Réinitialiser le formulaire
                    const form = document.getElementById('add-nutritional-goal-form');
                    if (form) form.reset();
                },
                closeOnBackdropClick: true,
                closeOnEscape: true,
                lockBodyScroll: true
            });
        }
        
        // Événements
        const addGoalBtn = document.getElementById('add-goal-btn');
        const customMenuForm = document.getElementById('generate-custom-menu-form');
        const addGoalForm = document.getElementById('add-nutritional-goal-form');
        const addAndCloseBtn = document.getElementById('add-goal-and-close-btn');
        
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
            addAndCloseBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Empêcher toute soumission de formulaire
                e.stopPropagation(); // Empêcher la propagation de l'événement
                
                // Valider le formulaire avant d'ajouter
                const form = document.getElementById('add-nutritional-goal-form');
                if (form && !form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                
                const success = this.addNutritionalGoal(false); // Ne pas fermer ici, on le fait après
                // Si l'ajout a réussi, fermer la modale immédiatement
                if (success) {
                    setTimeout(() => {
                        this.closeGoalModal();
                    }, 100); // Petit délai pour laisser le temps au toast de s'afficher
                }
            });
        }
        
        if (customMenuForm) {
            customMenuForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateCustomMenu();
            });
        }
        
        // Marquer comme initialisé
        this.initialized = true;
    }
    
    showAddGoalModal() {
        const modal = document.getElementById('add-nutritional-goal-modal');
        if (!modal) return;
        
        if (this.addGoalModal) {
            this.addGoalModal.open();
            // S'assurer que la modale est visible même si Modal utilise des classes
            modal.style.display = 'flex';
        } else {
            // Fallback si Modal n'est pas disponible
            modal.style.display = 'flex';
        }
        
        this.updateModalGoalsList();
        const nutrientSelect = document.getElementById('goal-nutrient');
        if (nutrientSelect) {
            setTimeout(() => nutrientSelect.focus(), 100);
        }
    }
    
    closeGoalModal() {
        const modal = document.getElementById('add-nutritional-goal-modal');
        
        if (this.addGoalModal) {
            console.log('🔒 Fermeture de la modale via Modal.close()');
            try {
                this.addGoalModal.close();
            } catch (e) {
                console.warn('⚠️ Erreur lors de la fermeture via Modal.close():', e);
                // Fallback si la méthode close() échoue
                if (modal) {
                    modal.style.display = 'none';
                    modal.style.setProperty('display', 'none', 'important');
                    modal.classList.remove('show');
                }
            }
        }
        
        // Toujours fermer directement aussi pour être sûr
        if (modal) {
            console.log('🔒 Fermeture directe de la modale');
            modal.style.display = 'none';
            modal.style.setProperty('display', 'none', 'important'); // Forcer avec !important
            modal.classList.remove('show');
            // Réinitialiser le formulaire
            const form = document.getElementById('add-nutritional-goal-form');
            if (form) form.reset();
            // Débloquer le scroll du body si nécessaire
            document.body.style.overflow = '';
            // Vérifier que la modale est bien fermée
            console.log('✅ Modale fermée, display:', modal.style.display, 'classList:', modal.classList.toString());
        } else {
            console.warn('⚠️ Modale non trouvée');
        }
    }
    
    addNutritionalGoal(closeModal = false) {
        const nutrientSelect = document.getElementById('goal-nutrient');
        const targetInput = document.getElementById('goal-target');
        
        if (!nutrientSelect || !targetInput) return false;
        
        const nutrient = nutrientSelect.value;
        const nutrientLabel = nutrientSelect.options[nutrientSelect.selectedIndex].text;
        const target = parseFloat(targetInput.value);
        
        // Validation
        if (!target || target <= 0) {
            this.showToast('Veuillez saisir un objectif valide', 'warning');
            return false;
        }
        
        // Vérifier si ce nutriment n'est pas déjà ajouté
        if (this.nutritionalGoals.some(g => g.nutrient === nutrient)) {
            this.showToast('Ce nutriment est déjà dans la liste', 'warning');
            return false;
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
        
        // Réinitialiser seulement le champ "objectif"
        targetInput.value = '';
        targetInput.focus();
        
        // Mettre à jour la liste dans la modale
        this.updateModalGoalsList();
        
        // Retourner true pour indiquer le succès
        return true;
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
                <button type="button" onclick="customMenuGenerator.removeGoalFromModal(${index})" style="background: #fee2e2; color: #991b1b; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
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
            goalsList.innerHTML = '<p style="color: #6b7280; font-size: 0.9rem; margin: 0; font-style: italic;">Aucun objectif nutritionnel (optionnel). Les menus seront générés avec une grande variété.</p>';
            return;
        }
        
        goalsList.innerHTML = this.nutritionalGoals.map((goal, index) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: white; border-radius: 6px; margin-bottom: 0.5rem; border: 1px solid #e5e7eb;">
                <div style="flex: 1;">
                    <strong style="color: #374151;">${goal.label}</strong>
                    <span style="color: #6b7280; margin-left: 0.5rem;">Objectif: ${goal.target}${goal.unit}</span>
                </div>
                <button type="button" onclick="customMenuGenerator.removeNutritionalGoal(${index})" style="background: #fee2e2; color: #991b1b; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                    <i class="fas fa-times"></i> Retirer
                </button>
            </div>
        `).join('');
    }
    
    removeNutritionalGoal(index) {
        this.nutritionalGoals.splice(index, 1);
        this.renderNutritionalGoals();
    }
    
    async generateCustomMenu(forceNew = false) {
        // Les objectifs nutritionnels sont maintenant optionnels pour permettre une variété de menus
        
        const numberOfPeople = parseInt(document.getElementById('custom-menu-people').value);
        const mealType = document.getElementById('custom-menu-type').value;
        const restrictionsSelect = document.getElementById('custom-menu-restrictions');
        const periodSelect = document.getElementById('custom-menu-period');
        const useStockOnlyCheckbox = document.getElementById('use-stock-only');
        const dietaryRestrictions = Array.from(restrictionsSelect.selectedOptions).map(opt => opt.value);
        const periodDays = Math.max(1, parseInt(periodSelect?.value || '1'));
        const useStockOnly = useStockOnlyCheckbox ? useStockOnlyCheckbox.checked : false;
        
        // Récupérer le nombre de portions équivalentes depuis le calculateur
        const totalPortionsEl = document.getElementById('calc-total-portions');
        const nombrePortions = totalPortionsEl ? parseFloat(totalPortionsEl.textContent || numberOfPeople.toString()) || numberOfPeople : numberOfPeople;
        
        // Afficher le loader
        const progressDiv = document.getElementById('custom-menu-progress');
        const progressText = document.getElementById('custom-progress-text');
        const resultsDiv = document.getElementById('custom-menu-results');
        
        if (progressDiv) progressDiv.style.display = 'block';
        if (resultsDiv) resultsDiv.style.display = 'none';
        
        try {
            if (progressText) {
                progressText.textContent = useStockOnly 
                    ? 'Recherche des recettes avec le stock disponible...' 
                    : 'Recherche des meilleurs ingrédients...';
            }
            
            const payload = {
                numberOfPeople: nombrePortions, // Utiliser le nombre de portions équivalentes
                mealType,
                nutritionalGoals: this.nutritionalGoals,
                dietaryRestrictions,
                // Les filtres sont des préférences, pas des contraintes strictes
                filtersAsPreferences: true,
                strictMode: false,
                // Prioriser la variété et le catalogue de 635 recettes certifiées CIQUAL
                prioritizeVariety: true,
                useFullRecipeCatalog: true,
                // Option pour utiliser uniquement le stock disponible
                useStockOnly: useStockOnly
            };
            
            // Ajouter le nom du dernier menu pour éviter les doublons
            if (forceNew && this.generatedMenus.length > 0) {
                const lastMenu = this.generatedMenus[0];
                payload.avoidMenuName = lastMenu.menu?.nomMenu;
                payload.forceVariation = true;
            }
            
            // ✅ DÉCLARER generatedMenuNames AVANT callOnce() pour qu'il soit accessible
            const generatedMenuNames = []; // Liste des menus déjà générés pour éviter les répétitions
            
            // Helper to call backend once
            const callOnce = async () => {
                // ✅ Mettre à jour payload.avoidMenuNames avec la liste actuelle avant chaque appel
                payload.avoidMenuNames = [...generatedMenuNames]; // Copie pour éviter les mutations
                
                // 🔒 Utiliser fetchWithCSRF pour la protection CSRF automatique
                const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
                const response = await fetchFn('/api/menu/generate-custom', {
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // Le header X-CSRF-Token sera ajouté automatiquement par fetchWithCSRF si fetchWithCSRF est utilisé
                },
                body: JSON.stringify(payload)
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Erreur lors de la génération du menu');
                }
                const result = await response.json();
                const stockCheck = await this.checkStockAvailability(result, numberOfPeople);
                return { result, stockCheck };
            };

            if (periodDays > 1) {
                if (progressText) progressText.textContent = `Génération ${periodDays} menus (1 par jour)...`;
                const dayResults = [];
                // Politique de répétition hebdomadaire (ex: plat principal 4x/mois avec accompagnements différents)
                const repeatPolicy = {
                    enabled: true,
                    windowDays: 7,
                    maxRepeats: 4,
                    vary: ['accompagnements','garnitures','légumes','féculents'],
                    keep: ['plat_principal','protéine']
                };
                // Thèmes hebdomadaires pour limiter la répétition (lundi→végétarien, mardi→vlaams, mercredi→volaille, jeudi→viandes, vendredi→poisson)
                const weekdayThemes = [
                    { key: 'vege', label: 'Végétarien', rules: { include: ['végétarien'], exclude: ['viande','poisson'] } }, // Lundi
                    { key: 'vlaams', label: 'Vlaams (spécialités belges/flamandes)', rules: { cuisine: 'belge/flamande' } }, // Mardi
                    { key: 'volaille', label: 'Volaille', rules: { include: ['poulet','dinde','volaille'], exclude: ['bœuf','poisson'] } }, // Mercredi
                    { key: 'viande', label: 'Viandes (hors volaille/poisson)', rules: { include: ['bœuf','porc','veau','agneau'], exclude: ['poisson','volaille'] } }, // Jeudi
                    { key: 'poisson', label: 'Poisson', rules: { include: ['poisson','poisson blanc','saumon','colin'], exclude: ['viande'] } }, // Vendredi
                    { key: 'libre', label: 'Libre/équilibré', rules: {} }, // Samedi
                    { key: 'libre', label: 'Libre/équilibré', rules: {} }  // Dimanche
                ];
                const weeklyProteinPlan = ['vege','vlaams','volaille','viande','poisson','libre','libre'];
                const proteinCounts = { boeuf: 0, porc: 0, veau: 0, agneau: 0, volaille: 0, poisson: 0, vegetarien: 0 };
                let lastProteinKey = null;
                // ✅ generatedMenuNames est déjà défini avant callOnce(), pas besoin de le redéfinir
                
                for (let d = 1; d <= periodDays; d++) {
                    if (progressText) progressText.textContent = `Jour ${d}/${periodDays}...`;
                    // Optionally we can hint variation to backend
                    payload.forceVariation = d > 1;
                    payload.periodDays = periodDays;
                    payload.dayIndex = d;
                    payload.repeatPolicy = repeatPolicy;
                    const themeIndex = (d-1) % 7;
                    const theme = weekdayThemes[themeIndex];
                    payload.weekdayTheme = theme;
                    payload.weeklyProteinPlan = weeklyProteinPlan; // aide globale côté IA
                    payload.antiRepeat = { maxSameProteinPerWeek: 1, keys: ['volaille','poisson','bœuf','porc','agneau','veau'] };
                    // ✅ avoidMenuNames sera mis à jour dans callOnce() avant l'appel API
                    // Interdictions dynamiques pour limiter le bœuf et éviter même protéine deux jours de suite
                    const dynamicBan = [];
                    if (proteinCounts['boeuf'] >= 1) dynamicBan.push('bœuf','boeuf');
                    if (lastProteinKey) dynamicBan.push(lastProteinKey);
                    payload.dynamicBanProteins = dynamicBan;
                    const { result, stockCheck } = await callOnce();
                    dayResults.push({ result, stockCheck, day: d });
                    
                    // ✅ NOUVEAU: Ajouter le menu généré à la liste pour éviter les répétitions
                    if (result?.menu?.nomMenu) {
                        const menuName = result.menu.nomMenu;
                        generatedMenuNames.push(menuName);
                        console.log(`📝 Menu jour ${d} ajouté à la liste d'exclusion: "${menuName}"`);
                        console.log(`   Total menus à éviter: ${generatedMenuNames.length}`);
                        console.log(`   Liste complète: ${JSON.stringify(generatedMenuNames)}`);
                    } else {
                        console.warn(`⚠️ Menu jour ${d} n'a pas de nomMenu, impossible d'éviter les répétitions`);
                    }
                    
                    // Déduire la protéine principale du résultat (simple heuristique sur nomMenu)
                    try {
                        const name = (result?.menu?.nomMenu || '').toLowerCase();
                        let key = null;
                        if (/boeuf|bœuf/.test(name)) key = 'boeuf';
                        else if (/porc/.test(name)) key = 'porc';
                        else if (/veau/.test(name)) key = 'veau';
                        else if (/agneau/.test(name)) key = 'agneau';
                        else if (/poulet|dinde|volaille/.test(name)) key = 'volaille';
                        else if (/poisson|saumon|colin|cabillaud|merlu|thon/.test(name)) key = 'poisson';
                        else if (/végétarien|vegetarien|tofu|légumineuse|lentille|pois chiche/.test(name)) key = 'vegetarien';
                        if (key) {
                            proteinCounts[key] = (proteinCounts[key] || 0) + 1;
                            lastProteinKey = key;
                        }
                    } catch {}
                }
                // Render combined output
                this.displayMultiDayResults(dayResults, numberOfPeople);
                // Push the first into history for quick actions
                const first = dayResults[0];
                this.generatedMenus.unshift({ ...first.result, timestamp: new Date(), goals: [...this.nutritionalGoals], stockCheck: first.stockCheck });
                this.displayGeneratedMenusList();
                this.showToast(`✅ ${periodDays} menus générés`, 'success');
            } else {
                const { result, stockCheck } = await callOnce();
                if (progressText) progressText.textContent = 'Menu généré avec succès !';
                this.generatedMenus.unshift({ ...result, timestamp: new Date(), goals: [...this.nutritionalGoals], stockCheck });
                this.displayCustomMenuResult(result, stockCheck);
                this.displayGeneratedMenusList();
                this.showToast(stockCheck.allAvailable ? '✅ Menu généré ! Tous les ingrédients sont en stock' : '⚠️ Menu généré avec éléments à vérifier', stockCheck.allAvailable ? 'success' : 'warning');
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
        const unitLower = (unit || '').toLowerCase().trim();
        
        // Conversions de poids
        if (unitLower === 'kg' || unitLower === 'kilogramme' || unitLower === 'kilogrammes') {
            return quantity * 1000;
        } else if (unitLower === 'g' || unitLower === 'gramme' || unitLower === 'grammes') {
            return quantity;
        }
        
        // Conversions de volume
        else if (unitLower === 'l' || unitLower === 'litre' || unitLower === 'litres') {
            return quantity * 1000; // Pour les liquides, on considère 1L = 1000g (eau)
        } else if (unitLower === 'ml' || unitLower === 'millilitre' || unitLower === 'millilitres') {
            return quantity; // Pour les liquides, on considère 1ml = 1g (eau)
        } else if (unitLower === 'cl' || unitLower === 'centilitre' || unitLower === 'centilitres') {
            return quantity * 10; // 1cl = 10ml = 10g
        }
        
        // Mesures culinaires
        else if (unitLower === 'pincée' || unitLower === 'pincées' || unitLower === 'pinch') {
            return quantity * 1; // 1 pincée = 1 gramme
        } else if (unitLower === 'cuillère à café' || unitLower === 'c. à c.' || unitLower === 'cac' || unitLower === 'tsp') {
            return quantity * 5; // 1 cuillère à café = 5 grammes
        } else if (unitLower === 'cuillère à soupe' || unitLower === 'c. à s.' || unitLower === 'cas' || unitLower === 'tbsp') {
            return quantity * 15; // 1 cuillère à soupe = 15 grammes
        } else if (unitLower === 'verre' || unitLower === 'verres') {
            return quantity * 250; // 1 verre = 250ml = 250g (approximation)
        }
        
        // Unités de comptage
        else if (unitLower === 'pièce' || unitLower === 'pièces' || unitLower === 'unité' || unitLower === 'unités' || unitLower === 'un') {
            return quantity * 100; // Estimation : 1 pièce = 100g
        }
        
        // Par défaut, on retourne la quantité telle quelle (on suppose que c'est déjà en grammes)
        else {
            return quantity;
        }
    }
    
    async checkStockAvailability(menuResult, numberOfPeople) {
        try {
            const stockResponse = await fetch('/api/stock', {
                credentials: 'include',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!stockResponse.ok) {
                console.error('Erreur lors de la récupération du stock');
                return { allAvailable: false, missingCount: 0, items: [], message: 'Erreur de chargement du stock' };
            }
            
            const stockData = await stockResponse.json();
            const stockItems = stockData.data || [];
            
            // Récupérer le nombre de portions équivalentes depuis le calculateur
            const totalPortionsEl = document.getElementById('calc-total-portions');
            const nombrePortions = totalPortionsEl ? parseFloat(totalPortionsEl.textContent || numberOfPeople.toString()) || numberOfPeople : numberOfPeople;
            
            const menuIngredients = this.extractIngredientsFromMenu(menuResult, nombrePortions);
            
            const checkResults = menuIngredients.map(ingredient => {
                const normalizeString = (str) => str.toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/œ/g, 'oe')
                    .replace(/æ/g, 'ae')
                    .replace(/['']/g, ' ')
                    .trim();
                
                const ingredientNorm = normalizeString(ingredient.name);
                
                const stockItem = stockItems.find(item => {
                    const stockNameNorm = normalizeString(item.name);
                    
                    const match = stockNameNorm.includes(ingredientNorm) || 
                           ingredientNorm.includes(stockNameNorm) ||
                           stockNameNorm.split(/\s+/).some(word => ingredientNorm.includes(word) && word.length > 3) ||
                           ingredientNorm.split(/\s+/).some(word => stockNameNorm.includes(word) && word.length > 3);
                    
                    return match;
                });
                
                if (!stockItem) {
                    return {
                        name: ingredient.name,
                        needed: ingredient.quantity,
                        available: 0,
                        unit: ingredient.unit,
                        status: 'missing'
                    };
                }
                
                const neededInGrams = this.convertToGrams(ingredient.quantity, ingredient.unit);
                const availableInGrams = this.convertToGrams(stockItem.quantity, stockItem.unit);
                
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
    
    extractIngredientsFromMenu(menuResult, nombrePortions) {
        const ingredients = [];
        
        if (menuResult.menu && menuResult.menu.ingredients) {
            const nutritionalKeywords = [
                'vitamine', 'vitamin', 'fer', 'iron', 'calcium', 'fibres', 'fiber',
                'protéine', 'protein', 'glucide', 'lipide', 'calorie', 'énergie',
                'magnésium', 'zinc', 'potassium', 'phosphore'
            ];
            
            menuResult.menu.ingredients.forEach(ing => {
                if (typeof ing === 'object' && ing.nom) {
                    const nomLower = (ing.nom || ing.name || '').toLowerCase();
                    const isNutritionalGoal = nutritionalKeywords.some(keyword => nomLower.includes(keyword));
                    
                    if (!isNutritionalGoal) {
                        // Les quantités sont généralement par portion, multiplier par nombrePortions
                        let quantiteParPortion = parseFloat(ing.quantiteParPersonne || ing.quantite || ing.quantity) || 0;
                        if (quantiteParPortion === 0) {
                            quantiteParPortion = parseFloat(ing.quantiteTotal) || 0;
                        }
                        const quantity = quantiteParPortion * nombrePortions;
                        ingredients.push({
                            name: ing.nom || ing.name,
                            quantity: quantity,
                            unit: ing.unite || ing.unit || 'g'
                        });
                    }
                } else if (typeof ing === 'string') {
                    const ingLower = ing.toLowerCase();
                    const isNutritionalGoal = nutritionalKeywords.some(keyword => ingLower.includes(keyword));
                    
                    if (!isNutritionalGoal) {
                        const match = ing.match(/(.+?):\s*(\d+(?:\.\d+)?)\s*(\w+)/);
                        if (match) {
                            // Les quantités sont généralement par portion, multiplier par nombrePortions
                            const quantiteParPortion = parseFloat(match[2]);
                            ingredients.push({
                                name: match[1].trim(),
                                quantity: quantiteParPortion * nombrePortions,
                                unit: match[3]
                            });
                        }
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
        
        // Debug: vérifier les allergènes
        if (!menu.allergens || menu.allergens.length === 0) {
            console.warn(`⚠️ Menu "${menu.nomMenu}" n'a pas d'allergènes déclarés dans les données reçues`);
            console.log('Données du menu:', menu);
        } else {
            console.log(`✅ Menu "${menu.nomMenu}" a ${menu.allergens.length} allergène(s):`, menu.allergens);
        }
        
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
                                            ${item.status === 'ok' ? `✓ Stock: ${item.available.toFixed(item.stockUnit === 'kg' ? 0 : 1)}${item.stockUnit || item.unit}` : 
                                              item.status === 'missing' ? `✗ Non trouvé en stock` :
                                              `⚠ Insuffisant: ${item.available.toFixed(item.stockUnit === 'kg' ? 0 : 1)}${item.stockUnit || item.unit}`}
                                        </span>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
                
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin: 0 0 1rem 0; color: #374151;">👤 Ingrédients par personne</h4>
                    <ul style="columns: 2; column-gap: 2rem; margin: 0; padding-left: 1.5rem;">
                        ${menu.ingredients.map(ing => {
                            if (typeof ing === 'object') {
                                const nom = ing.nom || ing.name || 'Ingrédient';
                                const unite = ing.unite || ing.unit || '';
                                let quantiteParPersonne = ing.quantiteParPersonne || ing.quantite || ing.quantity || '';
                                if (typeof quantiteParPersonne === 'number') {
                                    quantiteParPersonne = Math.round(quantiteParPersonne * 10) / 10;
                                }
                                return `<li style="margin-bottom: 0.5rem; color: #4b5563;">
                                    <strong>${nom}</strong>: ${quantiteParPersonne}${unite}
                                </li>`;
                            }
                            return `<li style="margin-bottom: 0.5rem; color: #4b5563;">${ing}</li>`;
                        }).join('')}
                    </ul>
                </div>
                
                <div style="margin-bottom: 1.5rem; padding: 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px;">
                    <ul style="columns: 2; column-gap: 2rem; margin: 0; padding-left: 1.5rem; color: #ffffff;">
                        ${(() => {
                            // Récupérer le nombre de portions équivalentes depuis le calculateur
                            const totalPortionsEl = document.getElementById('calc-total-portions');
                            const nombrePortions = totalPortionsEl ? parseFloat(totalPortionsEl.textContent || numberOfPeople.toString()) || numberOfPeople : numberOfPeople;
                            
                            const ingredientsList = menu.ingredients.map(ing => {
                                if (typeof ing === 'object') {
                                    const nom = ing.nom || ing.name || 'Ingrédient';
                                    const unite = ing.unite || ing.unit || '';
                                    // Calculer la quantité totale en multipliant par le nombre de portions équivalentes
                                    let quantiteParPersonne = parseFloat(ing.quantiteParPersonne || ing.quantite || ing.quantity || 0);
                                    if (isNaN(quantiteParPersonne)) quantiteParPersonne = 0;
                                    const quantiteTotal = quantiteParPersonne * nombrePortions;
                                    // Formater selon l'unité (arrondir pour les kg, garder 1 décimale pour les g/ml)
                                    let quantiteTotalFormatee = quantiteTotal;
                                    if (unite.toLowerCase() === 'kg' || unite.toLowerCase() === 'l' || unite.toLowerCase() === 'litre') {
                                        quantiteTotalFormatee = Math.round(quantiteTotal * 100) / 100; // 2 décimales
                                    } else {
                                        quantiteTotalFormatee = Math.round(quantiteTotal * 10) / 10; // 1 décimale
                                    }
                                    return `<li style="margin-bottom: 0.5rem; color: #ffffff;">
                                        <strong>${nom}</strong>: ${quantiteTotalFormatee}${unite}
                                    </li>`;
                                }
                                return `<li style="margin-bottom: 0.5rem; color: #ffffff;">${ing}</li>`;
                            }).join('');
                            
                            return `<h4 style="margin: 0 0 1rem 0; color: #ffffff;">👥 Quantités totales pour ${nombrePortions} portions équivalentes</h4>
                    <ul style="columns: 2; column-gap: 2rem; margin: 0; padding-left: 1.5rem; color: #ffffff;">
                        ${ingredientsList}
                    </ul>`;
                    })()}
                </div>
                
                <div>
                    <h4 style="margin: 0 0 1rem 0; color: #374151;">👨‍🍳 Instructions</h4>
                    <ol style="margin: 0; padding-left: 1.5rem;">
                        ${menu.instructions.map(instruction => 
                            `<li style="margin-bottom: 0.75rem; color: #4b5563;">${instruction}</li>`
                        ).join('')}
                    </ol>
                </div>
                
                ${menu.allergens && menu.allergens.length > 0 ? `
                <div style="margin-top: 1.5rem; padding: 1rem; background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px;">
                    <h4 style="margin: 0 0 0.75rem 0; color: #92400e;">
                        <i class="fas fa-exclamation-triangle"></i> Allergènes (Directive Européenne UE 1169/2011 / AFSCA)
                    </h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                        ${menu.allergens.map(allergen => {
                            const allergenNames = {
                                'gluten': '🌾 Gluten',
                                'lait': '🥛 Lait',
                                'oeufs': '🥚 Œufs',
                                'arachides': '🥜 Arachides',
                                'fruits_a_coque': '🌰 Fruits à coque',
                                'soja': '🫘 Soja',
                                'poisson': '🐟 Poisson',
                                'crustaces': '🦐 Crustacés',
                                'mollusques': '🐚 Mollusques',
                                'celeri': '🥬 Céleri',
                                'moutarde': '🌶️ Moutarde',
                                'sesame': '🌾 Sésame',
                                'sulfites': '⚗️ Sulfites',
                                'lupin': '🌱 Lupin'
                            };
                            const normalized = allergen.toLowerCase().trim();
                            const displayName = allergenNames[normalized] || allergen.charAt(0).toUpperCase() + allergen.slice(1);
                            return `<span style="background: #fff; padding: 0.5rem 0.75rem; border-radius: 6px; border: 1px solid #f59e0b; color: #92400e; font-weight: 600; font-size: 0.9rem;">${displayName}</span>`;
                        }).join('')}
                    </div>
                    <p style="margin: 0.75rem 0 0 0; font-size: 0.85rem; color: #92400e; font-style: italic;">
                        ⚠️ Conformité avec la Directive Européenne UE 1169/2011 et les exigences AFSCA (Agence fédérale pour la sécurité de la chaîne alimentaire - Belgique)
                    </p>
                </div>
                ` : `
                <div style="margin-top: 1.5rem; padding: 1rem; background: #d1fae5; border: 2px solid #10b981; border-radius: 8px;">
                    <h4 style="margin: 0 0 0.5rem 0; color: #065f46;">
                        <i class="fas fa-check-circle"></i> Aucun allergène déclaré (conforme Directive Européenne UE 1169/2011)
                    </h4>
                    <p style="margin: 0; font-size: 0.85rem; color: #065f46; font-style: italic;">
                        Cette recette ne contient aucun des 14 allergènes majeurs selon la Directive UE 1169/2011 / AFSCA
                    </p>
                </div>
                `}
                
                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                    <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                        <button onclick="customMenuGenerator.acceptMenu(${this.generatedMenus.length - 1})" class="btn btn-primary" style="flex: 1; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border: none; padding: 1.25rem; font-size: 1.1rem;">
                            <i class="fas fa-check-circle"></i> Accepter ce menu
                        </button>
                        <button onclick="customMenuGenerator.replaceMenu()" class="btn" style="flex: 1; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; padding: 1.25rem; font-size: 1.1rem;">
                            <i class="fas fa-sync-alt"></i> Remplacer le menu
                        </button>
                    </div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button onclick="customMenuGenerator.exportMenu(${this.generatedMenus.length - 1})" class="btn btn-outline" style="flex: 1;">
                            <i class="fas fa-download"></i> Exporter
                        </button>
                        <button onclick="customMenuGenerator.printMenu(${this.generatedMenus.length - 1})" class="btn btn-outline" style="flex: 1;">
                            <i class="fas fa-print"></i> Imprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        resultsDiv.style.display = 'block';
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    displayMultiDayResults(dayResults, numberOfPeople) {
        const resultsDiv = document.getElementById('custom-menu-results');
        if (!resultsDiv) return;
        
        // Stocker les menus de la semaine pour permettre le remplacement individuel
        // Calculer les dates à partir d'aujourd'hui
        const today = new Date();
        this.weeklyMenus = dayResults.map(({ result, stockCheck, day }, idx) => {
            const menuDate = new Date(today);
            menuDate.setDate(today.getDate() + (day - 1)); // Jour 1 = aujourd'hui, Jour 2 = demain, etc.
            return {
                result,
                stockCheck,
                day,
                date: menuDate.toISOString().split('T')[0], // Format YYYY-MM-DD
                accepted: false
            };
        });
        
        this.renderWeeklyMenus();
    }
    
    renderWeeklyMenus() {
        const resultsDiv = document.getElementById('custom-menu-results');
        if (!resultsDiv || !this.weeklyMenus || this.weeklyMenus.length === 0) return;
        
        const combined = [];
        combined.push(`<div style="background:white;border-radius:8px;padding:1rem;border:2px solid #10b981;">`);
        combined.push(`<h3 style="margin:0 0 1rem 0;color:#111827;">📅 Menus générés (${this.weeklyMenus.length} jours)</h3>`);
        combined.push(`<p style="margin:0 0 1rem 0;color:#6b7280;font-size:0.9rem;">💡 Vous pouvez remplacer chaque menu individuellement en cliquant sur "Remplacer"</p>`);
        
        this.weeklyMenus.forEach((menuData, idx) => {
            const { result, stockCheck, day, date, accepted } = menuData;
            const menu = result.menu || {};
            
            // Formater la date pour l'affichage
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            combined.push(`<div id="menu-day-${day}" style="margin-bottom:1.5rem;border:${accepted ? '2px solid #10b981' : '1px solid #e5e7eb'};border-radius:8px;background:${accepted ? '#f0fdf4' : 'white'};">`);
            combined.push(`<div style="padding:.75rem 1rem;background:${accepted ? '#d1fae5' : '#f8fafc'};border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">`);
            combined.push(`<div style="display:flex;align-items:center;gap:0.75rem;">`);
            combined.push(`<span style="font-weight:600;color:#111827;">📅 Jour ${day}</span>`);
            combined.push(`<input type="date" id="date-day-${day}" value="${date}" onchange="customMenuGenerator.updateMenuDate(${idx}, this.value)" style="padding:0.4rem 0.6rem;border:1px solid #d1d5db;border-radius:6px;font-size:0.9rem;cursor:pointer;">`);
            combined.push(`<span style="color:#6b7280;font-size:0.85rem;">${formattedDate}</span>`);
            combined.push(`</div>`);
            combined.push(`<div style="display:flex;gap:0.5rem;align-items:center;">`);
            if (accepted) {
                combined.push(`<span style="color:#059669;font-weight:600;font-size:0.9rem;">✅ Accepté</span>`);
            }
            combined.push(`<button onclick="customMenuGenerator.replaceSingleMenu(${idx})" class="btn" style="background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:white;border:none;padding:0.5rem 1rem;border-radius:6px;font-size:0.9rem;cursor:pointer;font-weight:600;">
                <i class="fas fa-sync-alt"></i> Remplacer
            </button>`);
            combined.push(`</div>`);
            combined.push(`</div>`);
            
            combined.push(`<div style="padding:1rem;">`);
            combined.push(`<h4 style="margin:0 0 0.5rem 0;color:#111827;font-size:1.2rem;">${menu.nomMenu || 'Menu'}</h4>`);
            combined.push(`<p style="margin:0 0 1rem 0;color:#6b7280;">${menu.description || ''}</p>`);
            
            if (result.nutrition && result.nutrition.perPerson) {
                const nut = result.nutrition.perPerson;
                combined.push(`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:0.5rem;margin-bottom:1rem;padding:0.75rem;background:#f3f4f6;border-radius:6px;">`);
                combined.push(`<div><strong>🔥 Calories:</strong> ${Math.round(nut.calories || 0)} kcal</div>`);
                combined.push(`<div><strong>🥩 Protéines:</strong> ${(nut.proteins || 0).toFixed(1)}g</div>`);
                combined.push(`<div><strong>🍞 Glucides:</strong> ${(nut.carbs || 0).toFixed(1)}g</div>`);
                combined.push(`<div><strong>🥑 Lipides:</strong> ${(nut.lipids || 0).toFixed(1)}g</div>`);
                combined.push(`</div>`);
            }
            
            if (menu.allergens && menu.allergens.length > 0) {
                const allergenNames = {
                    'gluten': '🌾 Gluten', 'lait': '🥛 Lait', 'oeufs': '🥚 Œufs',
                    'arachides': '🥜 Arachides', 'fruits_a_coque': '🌰 Fruits à coque', 'soja': '🫘 Soja',
                    'poisson': '🐟 Poisson', 'crustaces': '🦐 Crustacés', 'mollusques': '🐚 Mollusques',
                    'celeri': '🥬 Céleri', 'moutarde': '🌶️ Moutarde', 'sesame': '🌾 Sésame',
                    'sulfites': '⚗️ Sulfites', 'lupin': '🌱 Lupin'
                };
                combined.push(`<div style="margin-bottom:1rem;padding:0.75rem;background:#fef3c7;border:1px solid #f59e0b;border-radius:6px;">`);
                combined.push(`<strong style="color:#92400e;">⚠️ Allergènes:</strong> `);
                combined.push(`<span style="display:inline-flex;flex-wrap:wrap;gap:0.25rem;margin-top:0.25rem;">`);
                menu.allergens.forEach(allergen => {
                    const normalized = allergen.toLowerCase().trim();
                    const displayName = allergenNames[normalized] || allergen;
                    combined.push(`<span style="background:#fff;padding:0.25rem 0.5rem;border-radius:4px;font-size:0.85rem;color:#92400e;">${displayName}</span>`);
                });
                combined.push(`</span></div>`);
            } else {
                combined.push(`<div style="margin-bottom:1rem;padding:0.75rem;background:#d1fae5;border:1px solid #10b981;border-radius:6px;">`);
                combined.push(`<span style="color:#065f46;font-size:0.9rem;">✅ Aucun allergène déclaré (conforme UE 1169/2011 / AFSCA)</span>`);
                combined.push(`</div>`);
            }
            
            // Ingrédients
            if (menu.ingredients && menu.ingredients.length > 0) {
                combined.push(`<div style="margin-bottom:1rem;">`);
                combined.push(`<h5 style="margin:0 0 0.75rem 0;color:#374151;font-size:1rem;">👤 Ingrédients par personne</h5>`);
                combined.push(`<ul style="columns:2;column-gap:2rem;margin:0;padding-left:1.5rem;list-style-type:disc;">`);
                menu.ingredients.forEach(ing => {
                    if (typeof ing === 'object') {
                        const nom = ing.nom || ing.name || 'Ingrédient';
                        const unite = ing.unite || ing.unit || '';
                        let quantiteParPersonne = ing.quantiteParPersonne || ing.quantite || ing.quantity || '';
                        if (typeof quantiteParPersonne === 'number') {
                            quantiteParPersonne = Math.round(quantiteParPersonne * 10) / 10;
                        }
                        combined.push(`<li style="margin-bottom:0.5rem;color:#4b5563;">
                            <strong>${nom}</strong>: ${quantiteParPersonne}${unite}
                        </li>`);
                    } else {
                        combined.push(`<li style="margin-bottom:0.5rem;color:#4b5563;">${ing}</li>`);
                    }
                });
                combined.push(`</ul>`);
                
                // Quantités totales
                const totalPortionsEl = document.getElementById('calc-total-portions');
                const nombrePortions = totalPortionsEl ? parseFloat(totalPortionsEl.textContent || result.numberOfPeople?.toString()) || result.numberOfPeople : result.numberOfPeople;
                if (nombrePortions) {
                    combined.push(`<div style="margin-top:1rem;padding:1rem;background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);border-radius:8px;">`);
                    combined.push(`<h5 style="margin:0 0 0.75rem 0;color:#ffffff;font-size:1rem;">👥 Quantités totales pour ${nombrePortions} portions équivalentes</h5>`);
                    combined.push(`<ul style="columns:2;column-gap:2rem;margin:0;padding-left:1.5rem;list-style-type:disc;color:#ffffff;">`);
                    menu.ingredients.forEach(ing => {
                        if (typeof ing === 'object') {
                            const nom = ing.nom || ing.name || 'Ingrédient';
                            const unite = ing.unite || ing.unit || '';
                            let quantiteParPersonne = parseFloat(ing.quantiteParPersonne || ing.quantite || ing.quantity || 0);
                            if (isNaN(quantiteParPersonne)) quantiteParPersonne = 0;
                            const quantiteTotal = quantiteParPersonne * nombrePortions;
                            let quantiteTotalFormatee = quantiteTotal;
                            if (unite.toLowerCase() === 'kg' || unite.toLowerCase() === 'l' || unite.toLowerCase() === 'litre') {
                                quantiteTotalFormatee = Math.round(quantiteTotal * 100) / 100;
                            } else {
                                quantiteTotalFormatee = Math.round(quantiteTotal * 10) / 10;
                            }
                            combined.push(`<li style="margin-bottom:0.5rem;color:#ffffff;">
                                <strong>${nom}</strong>: ${quantiteTotalFormatee}${unite}
                            </li>`);
                        }
                    });
                    combined.push(`</ul>`);
                    combined.push(`</div>`);
                }
                combined.push(`</div>`);
            }
            
            // Instructions
            if (menu.instructions && menu.instructions.length > 0) {
                combined.push(`<div style="margin-bottom:1rem;">`);
                combined.push(`<h5 style="margin:0 0 0.75rem 0;color:#374151;font-size:1rem;">👨‍🍳 Instructions de préparation</h5>`);
                combined.push(`<ol style="margin:0;padding-left:1.5rem;">`);
                menu.instructions.forEach(instruction => {
                    combined.push(`<li style="margin-bottom:0.75rem;color:#4b5563;">${instruction}</li>`);
                });
                combined.push(`</ol>`);
                combined.push(`</div>`);
            }
            
            combined.push(`<div style="display:flex;gap:0.5rem;margin-top:1rem;">`);
            combined.push(`<button onclick="customMenuGenerator.acceptSingleMenu(${idx})" class="btn" style="flex:1;background:${accepted ? '#6b7280' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'};color:white;border:none;padding:0.75rem;border-radius:6px;font-weight:600;cursor:pointer;">
                <i class="fas fa-check-circle"></i> ${accepted ? 'Accepté' : 'Accepter'}
            </button>`);
            combined.push(`<button onclick="customMenuGenerator.exportSingleMenu(${idx})" class="btn" style="background:#6366f1;color:white;border:none;padding:0.75rem;border-radius:6px;cursor:pointer;">
                <i class="fas fa-download"></i> Exporter
            </button>`);
            combined.push(`</div>`);
            
            combined.push(`</div></div>`);
        });
        combined.push(`</div>`);
        resultsDiv.innerHTML = combined.join('');
        resultsDiv.style.display = 'block';
    }
    
    async replaceSingleMenu(dayIndex) {
        if (!this.weeklyMenus || dayIndex < 0 || dayIndex >= this.weeklyMenus.length) {
            this.showToast('Erreur: menu introuvable', 'error');
            return;
        }
        
        const menuToReplace = this.weeklyMenus[dayIndex];
        const day = menuToReplace.day;
        
        this.showToast(`🔄 Remplacement du menu du jour ${day}...`, 'info');
        
        try {
            const numberOfPeople = parseInt(document.getElementById('custom-menu-people')?.value || 4);
            const mealType = document.getElementById('custom-menu-type')?.value || 'déjeuner';
            
            // Récupérer la liste des menus déjà générés pour éviter les répétitions
            const avoidMenuNames = this.weeklyMenus
                .filter((m, idx) => idx !== dayIndex && m.result?.menu?.nomMenu)
                .map(m => m.result.menu.nomMenu);
            
            // Appeler l'API pour générer un nouveau menu
            const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
            const response = await fetchFn('/api/menu/generate-custom', {
                credentials: 'include',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numberOfPeople,
                    mealType,
                    nutritionalGoals: this.nutritionalGoals,
                    dietaryRestrictions: [],
                    allergens: [],
                    avoidMenuNames,
                    periodDays: 1,
                    dayIndex: day
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la génération du menu');
            }
            
            const result = await response.json();
            
            // Vérifier le stock
            const stockCheck = await this.checkStockAvailability(result, numberOfPeople);
            
            // Remplacer le menu dans weeklyMenus (conserver la date)
            const existingDate = this.weeklyMenus[dayIndex]?.date || new Date().toISOString().split('T')[0];
            this.weeklyMenus[dayIndex] = {
                result,
                stockCheck,
                day,
                date: existingDate,
                accepted: false
            };
            
            // Réafficher les menus
            this.renderWeeklyMenus();
            
            this.showToast(`✅ Menu du jour ${day} remplacé avec succès !`, 'success');
        } catch (error) {
            console.error('Erreur lors du remplacement:', error);
            this.showToast(`Erreur: ${error.message}`, 'error');
        }
    }
    
    acceptSingleMenu(dayIndex) {
        if (!this.weeklyMenus || dayIndex < 0 || dayIndex >= this.weeklyMenus.length) {
            this.showToast('Erreur: menu introuvable', 'error');
            return;
        }
        
        this.weeklyMenus[dayIndex].accepted = !this.weeklyMenus[dayIndex].accepted;
        this.renderWeeklyMenus();
        
        const menuName = this.weeklyMenus[dayIndex].result?.menu?.nomMenu || 'Menu';
        const status = this.weeklyMenus[dayIndex].accepted ? 'accepté' : 'désaccepté';
        this.showToast(`✅ Menu "${menuName}" ${status}`, 'success');
    }
    
    exportSingleMenu(dayIndex) {
        if (!this.weeklyMenus || dayIndex < 0 || dayIndex >= this.weeklyMenus.length) {
            this.showToast('Erreur: menu introuvable', 'error');
            return;
        }
        
        const menuData = this.weeklyMenus[dayIndex].result;
        const jsonStr = JSON.stringify(menuData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `menu-jour-${this.weeklyMenus[dayIndex].day}-${(menuData.menu?.nomMenu || 'menu').toLowerCase().replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('✅ Menu exporté !', 'success');
    }
    
    updateMenuDate(dayIndex, newDate) {
        if (!this.weeklyMenus || dayIndex < 0 || dayIndex >= this.weeklyMenus.length) {
            this.showToast('Erreur: menu introuvable', 'error');
            return;
        }
        
        this.weeklyMenus[dayIndex].date = newDate;
        this.renderWeeklyMenus();
        
        const dateObj = new Date(newDate);
        const formattedDate = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        this.showToast(`✅ Date mise à jour: ${formattedDate}`, 'success');
    }
    
    displayGeneratedMenusList() {
        if (this.generatedMenus.length === 0) return;
        
        const listDiv = document.getElementById('generated-menus-list');
        const containerDiv = document.getElementById('generated-menus-container');
        
        if (!listDiv || !containerDiv) return;
        
        listDiv.style.display = 'block';
        
        containerDiv.innerHTML = this.generatedMenus.slice(0, 5).map((item, index) => `
            <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="margin: 0 0 0.5rem 0; color: #374151;">${item.menu.nomMenu}</h4>
                        <p style="margin: 0; font-size: 0.85rem; color: #6b7280;">
                            ${item.numberOfPeople} pers. • ${item.mealType} • ${new Date(item.timestamp).toLocaleString('fr-FR')}
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
    
    replaceMenu() {
        this.generateCustomMenu(true);
    }
    
    async acceptMenu(index) {
        const menuData = this.generatedMenus[index];
        if (!menuData) return;
        
        // Vérifier si le stock est disponible
        const stockCheck = menuData.stockCheck;
        
        if (stockCheck && !stockCheck.allAvailable) {
            const confirmMsg = `⚠️ Attention : ${stockCheck.missingCount} ingrédient(s) manquant(s) ou insuffisant(s).\n\nVoulez-vous quand même accepter ce menu ?\n(L𝑒s quantités disponibles seront déduites du stock)`;
            if (!confirm(confirmMsg)) {
                return;
            }
        }
        
        // Déduire les quantités du stock
        if (stockCheck && stockCheck.items && stockCheck.items.length > 0) {
            this.showToast('⏳ Déduction des quantités du stock...', 'info');
            
            // Récupérer le nombre de portions équivalentes
            const totalPortionsEl = document.getElementById('calc-total-portions');
            const nombrePortions = totalPortionsEl ? parseFloat(totalPortionsEl.textContent || menuData.numberOfPeople.toString()) || menuData.numberOfPeople : menuData.numberOfPeople;
            
            // Ajuster les quantités à déduire selon le nombre de portions
            const itemsToDeduct = stockCheck.items
                .filter(item => item.status === 'ok')
                .map(item => {
                    // Les quantités dans stockCheck sont déjà pour numberOfPeople, on doit les ajuster pour nombrePortions
                    const ratioPortions = nombrePortions / menuData.numberOfPeople;
                    let quantityToDeduct = item.needed * ratioPortions;
                    
                    // Convertir dans l'unité du stock si nécessaire
                    let quantityInStockUnit = quantityToDeduct;
                    if (item.unit && item.stockUnit && item.unit !== item.stockUnit) {
                        const neededInGrams = this.convertToGrams(quantityToDeduct, item.unit);
                        if (item.stockUnit === 'kg') {
                            quantityInStockUnit = neededInGrams / 1000;
                        } else if (item.stockUnit === 'l' || item.stockUnit === 'litre') {
                            quantityInStockUnit = neededInGrams / 1000;
                        } else {
                            quantityInStockUnit = neededInGrams;
                        }
                    }
                    
                    return {
                        name: item.name,
                        quantity: quantityInStockUnit,
                        unit: item.stockUnit || item.unit
                    };
                });
            
            const success = await this.deductFromStock(itemsToDeduct);
            
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
    
    async deductFromStock(itemsToDeduct) {
        try {
            if (!itemsToDeduct || itemsToDeduct.length === 0) {
                console.log('⚠️ Aucun élément à déduire du stock');
                return true;
            }
            
            // 🔒 Utiliser fetchWithCSRF pour la protection CSRF
            const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
            const response = await fetchFn('/api/stock/deduct', {
                credentials: 'include',
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ itemsToDeduct: itemsToDeduct })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la déduction du stock');
            }
            
            const result = await response.json();
            console.log('✅ Stock déduit avec succès:', result);
            
            // Recharger le stock si la fonction existe
            if (typeof window.loadStockData === 'function') {
                await window.loadStockData();
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors de la déduction du stock:', error);
            this.showToast('Erreur technique lors de la déduction: ' + error.message, 'error');
            return false;
        }
    }
    
    resetForNewMenu() {
        this.nutritionalGoals = [];
        this.renderNutritionalGoals();
        
        const form = document.getElementById('generate-custom-menu-form');
        if (form) {
            form.reset();
            document.getElementById('custom-menu-people').value = 4;
            document.getElementById('custom-menu-type').value = 'déjeuner';
        }
        
        const resultsDiv = document.getElementById('custom-menu-results');
        if (resultsDiv) resultsDiv.style.display = 'none';
        
        this.showToast('Prêt pour un nouveau menu ! 🎯', 'success');
    }
    
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            console.log(`[Toast] ${message}`);
            return;
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}

// Instance globale
const customMenuGenerator = new CustomMenuGenerator();

// Export pour utilisation dans les dashboards
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomMenuGenerator;
}

