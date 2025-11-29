// scripts/calculate-menu-nutrition.js
// Fonction pour calculer la nutrition totale d'un menu complet (entrée + plat + dessert)

/**
 * Calcule la nutrition totale d'un menu complet
 * Les valeurs nutritionnelles sont additionnées sur TOUS les plats du menu
 * 
 * Exemple: Si 20g de protéines sont demandées, elles peuvent être réparties entre:
 * - Le plat principal (ex: 15g)
 * - Le dessert (ex: 5g de yaourt grec ou fromage blanc)
 * - L'entrée (ex: 2g de fromage)
 * 
 * @param {Object} menu - Menu avec structure { dishes: [...] }
 * @returns {Object} Nutrition totale du menu
 */
export function calculateTotalNutrition(menu) {
  const totalNutrition = {
    proteins: 0,      // g
    carbs: 0,         // g
    fats: 0,          // g
    calories: 0,      // kcal
    calcium: 0,       // mg
    iron: 0,          // mg
    vitaminC: 0,      // mg
    vitaminD: 0,      // µg
    fiber: 0,         // g
    sodium: 0         // mg
  };
  
  // Si le menu a une structure avec dishes
  if (menu.dishes && Array.isArray(menu.dishes)) {
    menu.dishes.forEach(dish => {
      const dishNutrition = dish.nutritionalProfile || dish.nutrition || {};
      const servings = dish.servings || 1;
      
      // Multiplier par le nombre de portions
      totalNutrition.proteins += (dishNutrition.protein || dishNutrition.proteins || 0) * servings;
      totalNutrition.carbs += (dishNutrition.carbs || dishNutrition.carbohydrates || 0) * servings;
      totalNutrition.fats += (dishNutrition.fats || dishNutrition.lipids || 0) * servings;
      totalNutrition.calories += (dishNutrition.kcal || dishNutrition.calories || 0) * servings;
      totalNutrition.calcium += (dishNutrition.calcium || 0) * servings;
      totalNutrition.iron += (dishNutrition.iron || 0) * servings;
      totalNutrition.vitaminC += (dishNutrition.vitaminC || 0) * servings;
      totalNutrition.vitaminD += (dishNutrition.vitaminD || 0) * servings;
      totalNutrition.fiber += (dishNutrition.fiber || dishNutrition.fibers || 0) * servings;
      totalNutrition.sodium += (dishNutrition.sodium || 0) * servings;
    });
  }
  
  // Si le menu a une structure avec courses (entrée, plat, dessert)
  if (menu.courses && Array.isArray(menu.courses)) {
    menu.courses.forEach(course => {
      const courseNutrition = course.nutritionalProfile || course.nutrition || {};
      const servings = course.servings || 1;
      
      totalNutrition.proteins += (courseNutrition.protein || courseNutrition.proteins || 0) * servings;
      totalNutrition.carbs += (courseNutrition.carbs || courseNutrition.carbohydrates || 0) * servings;
      totalNutrition.fats += (courseNutrition.fats || courseNutrition.lipids || 0) * servings;
      totalNutrition.calories += (courseNutrition.kcal || courseNutrition.calories || 0) * servings;
      totalNutrition.calcium += (courseNutrition.calcium || 0) * servings;
      totalNutrition.iron += (courseNutrition.iron || 0) * servings;
      totalNutrition.vitaminC += (courseNutrition.vitaminC || 0) * servings;
      totalNutrition.vitaminD += (courseNutrition.vitaminD || 0) * servings;
      totalNutrition.fiber += (courseNutrition.fiber || courseNutrition.fibers || 0) * servings;
      totalNutrition.sodium += (courseNutrition.sodium || 0) * servings;
    });
  }
  
  // Si le menu a une structure avec ingredients enrichis (depuis generate-custom-menu.js)
  if (menu.ingredients && Array.isArray(menu.ingredients)) {
    menu.ingredients.forEach(ing => {
      const nutrition = ing.calculated || ing.nutritionalValues || {};
      
      totalNutrition.proteins += nutrition.proteins || 0;
      totalNutrition.carbs += nutrition.carbs || 0;
      totalNutrition.fats += nutrition.lipids || nutrition.fats || 0;
      totalNutrition.calories += nutrition.calories || 0;
      totalNutrition.calcium += nutrition.calcium || 0;
      totalNutrition.iron += nutrition.iron || 0;
      totalNutrition.vitaminC += nutrition.vitaminC || 0;
      totalNutrition.vitaminD += nutrition.vitaminD || 0;
      totalNutrition.fiber += nutrition.fibers || nutrition.fiber || 0;
      totalNutrition.sodium += nutrition.sodium || 0;
    });
  }
  
  // Arrondir à 1 décimale
  Object.keys(totalNutrition).forEach(key => {
    totalNutrition[key] = Math.round(totalNutrition[key] * 10) / 10;
  });
  
  return totalNutrition;
}

/**
 * Vérifie si le menu complet respecte les objectifs nutritionnels
 * Les objectifs peuvent être atteints en combinant plusieurs plats
 * 
 * @param {Object} menu - Menu complet
 * @param {Object} nutritionalGoals - Objectifs nutritionnels
 * @param {Object} groupInfo - Informations sur le groupe
 * @returns {Object} Résultat de la vérification
 */
export function verifyNutritionalBalance(menu, nutritionalGoals, groupInfo = {}) {
  // Calculer la nutrition totale du menu complet
  const totalNutrition = calculateTotalNutrition(menu);
  
  const balance = {
    proteins: {
      target: nutritionalGoals.proteins?.target || 0,
      min: nutritionalGoals.proteins?.min || 0,
      max: nutritionalGoals.proteins?.max || 0,
      actual: totalNutrition.proteins,
      status: checkRange(totalNutrition.proteins, nutritionalGoals.proteins),
      percent: nutritionalGoals.proteins?.target ? 
        (totalNutrition.proteins / nutritionalGoals.proteins.target * 100) : 0
    },
    carbs: {
      target: nutritionalGoals.carbs?.target || 0,
      min: nutritionalGoals.carbs?.min || 0,
      max: nutritionalGoals.carbs?.max || 0,
      actual: totalNutrition.carbs,
      status: checkRange(totalNutrition.carbs, nutritionalGoals.carbs),
      percent: nutritionalGoals.carbs?.target ? 
        (totalNutrition.carbs / nutritionalGoals.carbs.target * 100) : 0
    },
    fats: {
      target: nutritionalGoals.fats?.target || 0,
      min: nutritionalGoals.fats?.min || 0,
      max: nutritionalGoals.fats?.max || 0,
      actual: totalNutrition.fats,
      status: checkRange(totalNutrition.fats, nutritionalGoals.fats),
      percent: nutritionalGoals.fats?.target ? 
        (totalNutrition.fats / nutritionalGoals.fats.target * 100) : 0
    },
    calcium: {
      target: nutritionalGoals.calcium || 0,
      actual: totalNutrition.calcium,
      status: totalNutrition.calcium >= (nutritionalGoals.calcium || 0) ? 'OK' : 'INSUFFISANT',
      percent: nutritionalGoals.calcium ? 
        (totalNutrition.calcium / nutritionalGoals.calcium * 100) : 0
    },
    iron: {
      target: nutritionalGoals.iron || 0,
      actual: totalNutrition.iron,
      status: totalNutrition.iron >= (nutritionalGoals.iron || 0) ? 'OK' : 'INSUFFISANT',
      percent: nutritionalGoals.iron ? 
        (totalNutrition.iron / nutritionalGoals.iron * 100) : 0
    },
    vitaminC: {
      target: nutritionalGoals.vitaminC || 0,
      actual: totalNutrition.vitaminC,
      status: totalNutrition.vitaminC >= (nutritionalGoals.vitaminC || 0) ? 'OK' : 'INSUFFISANT',
      percent: nutritionalGoals.vitaminC ? 
        (totalNutrition.vitaminC / nutritionalGoals.vitaminC * 100) : 0
    },
    fiber: {
      target: nutritionalGoals.fiber || 0,
      actual: totalNutrition.fiber,
      status: totalNutrition.fiber >= (nutritionalGoals.fiber || 0) ? 'OK' : 'INSUFFISANT',
      percent: nutritionalGoals.fiber ? 
        (totalNutrition.fiber / nutritionalGoals.fiber * 100) : 0
    }
  };
  
  // Calculer le score global (moyenne des pourcentages d'atteinte)
  const scores = Object.values(balance)
    .filter(b => b.target > 0)
    .map(b => Math.min(b.percent / 100, 1)); // Limiter à 100%
  
  const score = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  
  return {
    balanced: score >= 0.8, // 80% des objectifs atteints
    score: score,
    totalNutrition: totalNutrition,
    details: balance,
    recommendations: generateRecommendations(balance, nutritionalGoals, totalNutrition)
  };
}

/**
 * Vérifie si une valeur est dans la plage cible
 */
function checkRange(actual, target) {
  if (!target) return 'OK';
  
  const min = target.min || 0;
  const max = target.max || Infinity;
  const targetValue = target.target || 0;
  
  if (actual < min) return 'INSUFFISANT';
  if (actual > max) return 'EXCESSIF';
  if (targetValue > 0 && Math.abs(actual - targetValue) / targetValue <= 0.1) return 'OPTIMAL'; // ±10%
  return 'OK';
}

/**
 * Génère des recommandations pour améliorer l'équilibre
 */
function generateRecommendations(balance, nutritionalGoals, totalNutrition) {
  const recommendations = [];
  
  // Protéines insuffisantes
  if (balance.proteins.actual < balance.proteins.min) {
    const deficit = balance.proteins.min - balance.proteins.actual;
    recommendations.push({
      type: 'proteins',
      issue: 'insuffisant',
      deficit: deficit,
      suggestion: `Ajouter ${deficit.toFixed(1)}g de protéines. Options: augmenter la portion de viande/poisson dans le plat principal, ajouter des légumineuses, ou proposer un dessert protéiné (yaourt grec, fromage blanc, fromage).`
    });
  }
  
  // Protéines excessives
  if (balance.proteins.actual > balance.proteins.max) {
    const excess = balance.proteins.actual - balance.proteins.max;
    recommendations.push({
      type: 'proteins',
      issue: 'excessif',
      excess: excess,
      suggestion: `Réduire de ${excess.toFixed(1)}g de protéines. Options: réduire la portion de protéine animale dans le plat principal, remplacer par des légumes ou féculents.`
    });
  }
  
  // Calcium insuffisant
  if (balance.calcium.actual < balance.calcium.target) {
    const deficit = balance.calcium.target - balance.calcium.actual;
    recommendations.push({
      type: 'calcium',
      issue: 'insuffisant',
      deficit: deficit,
      suggestion: `Ajouter ${deficit.toFixed(0)}mg de calcium. Options: fromage en entrée, yaourt ou fromage blanc en dessert, produits laitiers dans le plat principal.`
    });
  }
  
  // Fer insuffisant
  if (balance.iron.actual < balance.iron.target) {
    const deficit = balance.iron.target - balance.iron.actual;
    recommendations.push({
      type: 'iron',
      issue: 'insuffisant',
      deficit: deficit,
      suggestion: `Ajouter ${deficit.toFixed(1)}mg de fer. Options: viande rouge, légumineuses, épinards, ou céréales enrichies.`
    });
  }
  
  // Vitamine C insuffisante
  if (balance.vitaminC.actual < balance.vitaminC.target) {
    const deficit = balance.vitaminC.target - balance.vitaminC.actual;
    recommendations.push({
      type: 'vitaminC',
      issue: 'insuffisant',
      deficit: deficit,
      suggestion: `Ajouter ${deficit.toFixed(0)}mg de vitamine C. Options: agrumes en dessert, légumes crus en entrée, poivrons dans le plat principal.`
    });
  }
  
  // Fibres insuffisantes
  if (balance.fiber.actual < balance.fiber.target) {
    const deficit = balance.fiber.target - balance.fiber.actual;
    recommendations.push({
      type: 'fiber',
      issue: 'insuffisant',
      deficit: deficit,
      suggestion: `Ajouter ${deficit.toFixed(1)}g de fibres. Options: légumes supplémentaires, fruits en dessert, céréales complètes.`
    });
  }
  
  return recommendations;
}

export default {
  calculateTotalNutrition,
  verifyNutritionalBalance
};

