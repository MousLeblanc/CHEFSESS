// services/yukaScoreCalculator.js
// Calcule un score nutritionnel similaire à Yuka basé sur les données d'Open Food Facts

/**
 * Calcule un score nutritionnel (0-100) similaire à Yuka
 * Basé sur les critères de Yuka :
 * - Qualité nutritionnelle (60%)
 * - Présence d'additifs (30%)
 * - Degré de transformation (10%)
 * 
 * @param {Object} product - Données du produit depuis Open Food Facts
 * @returns {Object} Score et détails
 */
export function calculateYukaScore(product) {
  let score = 100; // Score de départ (100 = excellent)
  const details = {
    nutrition: { score: 100, deduction: 0, deductions: [] },
    additives: { score: 100, deduction: 0, deductions: [], badAdditives: [] },
    processing: { score: 100, deduction: 0, deductions: [] }
  };
  
  // 1. QUALITÉ NUTRITIONNELLE (60% du score)
  const nutritionScore = calculateNutritionScore(product);
  details.nutrition = nutritionScore;
  score += nutritionScore.deduction * 0.6;
  
  // 2. ADDITIFS (30% du score) - Toujours calculer
  const additivesScore = calculateAdditivesScore(product);
  details.additives = additivesScore;
  score += additivesScore.deduction * 0.3;
  
  // 3. DEGRÉ DE TRANSFORMATION (10% du score)
  const processingScore = calculateProcessingScore(product);
  details.processing = processingScore;
  score += processingScore.deduction * 0.1;
  
  // Arrondir et limiter entre 0 et 100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Déterminer la couleur et le label
  let color = '#27ae60'; // Vert (excellent)
  let label = 'Excellent';
  
  if (score < 25) {
    color = '#e74c3c'; // Rouge (mauvais)
    label = 'Mauvais';
  } else if (score < 50) {
    color = '#f39c12'; // Orange (médiocre)
    label = 'Médiocre';
  } else if (score < 75) {
    color = '#f1c40f'; // Jaune (bon)
    label = 'Bon';
  }
  
  return {
    score: score,
    color: color,
    label: label,
    details: details,
    recommendations: generateRecommendations(score, details)
  };
}

/**
 * Calcule le score nutritionnel basé sur les nutriments
 */
function calculateNutritionScore(product) {
  let deduction = 0;
  const deductions = [];
  
  const nutriments = product.nutriments || {};
  // Open Food Facts peut utiliser différents noms de champs pour le Nutri-Score
  const nutriscore = product.nutriscore_grade || product.nutriscore_grade_fr || product.nutrition_grade_fr || product.nutriscore || '';
  
  // Utiliser le Nutri-Score si disponible (A=0, B=-5, C=-10, D=-15, E=-20)
  if (nutriscore) {
    const nutriDeductions = { 'a': 0, 'b': 5, 'c': 10, 'd': 15, 'e': 20 };
    const nutriDeduction = nutriDeductions[nutriscore.toLowerCase()] || 0;
    if (nutriDeduction > 0) {
      deduction += nutriDeduction;
      deductions.push(`Nutri-Score ${nutriscore.toUpperCase()}: -${nutriDeduction} points`);
    }
  }
  
  // Calories (si > 500 kcal/100g, pénalité)
  const energy = nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0;
  if (energy > 500) {
    const calDeduction = Math.min(10, Math.floor((energy - 500) / 50));
    deduction += calDeduction;
    deductions.push(`Calories élevées (${Math.round(energy)} kcal/100g): -${calDeduction} points`);
  }
  
  // Graisses saturées (si > 10g/100g, pénalité)
  const saturatedFat = nutriments['saturated-fat_100g'] || nutriments['saturated-fat'] || 0;
  if (saturatedFat > 10) {
    const fatDeduction = Math.min(8, Math.floor((saturatedFat - 10) / 2));
    deduction += fatDeduction;
    deductions.push(`Graisses saturées élevées (${saturatedFat}g/100g): -${fatDeduction} points`);
  }
  
  // Sucre (si > 20g/100g, pénalité)
  const sugars = nutriments['sugars_100g'] || nutriments['sugars'] || 0;
  if (sugars > 20) {
    const sugarDeduction = Math.min(10, Math.floor((sugars - 20) / 5));
    deduction += sugarDeduction;
    deductions.push(`Sucre élevé (${sugars}g/100g): -${sugarDeduction} points`);
  }
  
  // Sel (si > 1.5g/100g, pénalité)
  const salt = nutriments['salt_100g'] || nutriments['salt'] || 0;
  if (salt > 1.5) {
    const saltDeduction = Math.min(8, Math.floor((salt - 1.5) / 0.3));
    deduction += saltDeduction;
    deductions.push(`Sel élevé (${salt}g/100g): -${saltDeduction} points`);
  }
  
  // Fibres (bonus si > 3g/100g)
  const fiber = nutriments['fiber_100g'] || nutriments['fiber'] || 0;
  if (fiber > 3) {
    const fiberBonus = Math.min(5, Math.floor(fiber / 2));
    deduction -= fiberBonus;
    deductions.push(`Fibres élevées (${fiber}g/100g): +${fiberBonus} points`);
  }
  
  return {
    score: Math.max(0, 100 - deduction),
    deduction: -Math.min(60, deduction),
    deductions: deductions
  };
}

/**
 * Calcule le score basé sur les additifs
 */
function calculateAdditivesScore(product) {
  let deduction = 0;
  const deductions = [];
  
  const additives = product.additives_tags || product.additives || [];
  const additivesText = (product.additives || '').toLowerCase();
  
  // Additifs à éviter (liste basée sur les critères Yuka)
  const badAdditives = [
    'e100', 'e102', 'e104', 'e110', 'e120', 'e122', 'e124', 'e129', 'e131', 'e132', 'e133',
    'e142', 'e150a', 'e150b', 'e150c', 'e150d', 'e151', 'e155', 'e160a', 'e160b', 'e171',
    'e172', 'e173', 'e174', 'e175', 'e180', 'e200', 'e202', 'e203', 'e210', 'e211', 'e212',
    'e213', 'e214', 'e215', 'e216', 'e217', 'e218', 'e219', 'e220', 'e221', 'e222', 'e223',
    'e224', 'e225', 'e226', 'e227', 'e228', 'e230', 'e231', 'e232', 'e233', 'e234', 'e235',
    'e236', 'e237', 'e238', 'e239', 'e240', 'e249', 'e250', 'e251', 'e252', 'e280', 'e281',
    'e282', 'e283', 'e310', 'e311', 'e312', 'e320', 'e321', 'e385', 'e407', 'e450', 'e451',
    'e452', 'e621', 'e622', 'e623', 'e624', 'e625', 'e951', 'e952', 'e954', 'e955'
  ];
  
  // Vérifier les additifs problématiques
  const foundBadAdditives = [];
  
  // Vérifier dans les tags d'additifs
  if (Array.isArray(additives)) {
    additives.forEach(additive => {
      if (typeof additive === 'string') {
        // Extraire le code (ex: "en:e100" -> "e100")
        const additiveCode = additive.toLowerCase().replace(/^(en|fr):/, '').replace(/^e/, 'e');
        if (badAdditives.includes(additiveCode)) {
          foundBadAdditives.push(additiveCode);
        }
      }
    });
  }
  
  // Vérifier aussi dans le texte (format "E100, E102, etc.")
  if (additivesText) {
    badAdditives.forEach(code => {
      // Chercher le code avec ou sans "E" majuscule
      const codePattern = new RegExp(`\\b${code}\\b|\\bE${code.substring(1)}\\b`, 'i');
      if (codePattern.test(additivesText)) {
        if (!foundBadAdditives.includes(code)) {
          foundBadAdditives.push(code);
        }
      }
    });
  }
  
  // Pénalité selon le nombre d'additifs problématiques
  if (foundBadAdditives.length > 0) {
    const additiveDeduction = Math.min(30, foundBadAdditives.length * 5);
    deduction += additiveDeduction;
    deductions.push(`${foundBadAdditives.length} additif(s) problématique(s) (${foundBadAdditives.slice(0, 3).join(', ')}${foundBadAdditives.length > 3 ? '...' : ''}): -${additiveDeduction} points`);
  }
  
  return {
    score: Math.max(0, 100 - deduction),
    deduction: -Math.min(30, deduction),
    deductions: deductions,
    badAdditives: foundBadAdditives
  };
}

/**
 * Calcule le score basé sur le degré de transformation (NOVA)
 */
function calculateProcessingScore(product) {
  let deduction = 0;
  const deductions = [];
  
  const novaGroup = product.nova_group || product.nova_groups || product.nova || null;
  
  // Classification NOVA :
  // 1 = Aliments non transformés ou minimalement transformés (0 point)
  // 2 = Ingrédients culinaires transformés (0 point)
  // 3 = Aliments transformés (-5 points)
  // 4 = Aliments ultra-transformés (-10 points)
  
  if (novaGroup) {
    if (novaGroup === 3) {
      deduction = 5;
      deductions.push('Aliment transformé (NOVA 3): -5 points');
    } else if (novaGroup === 4) {
      deduction = 10;
      deductions.push('Aliment ultra-transformé (NOVA 4): -10 points');
    }
  }
  
  // Vérifier aussi les ingrédients pour détecter les produits transformés
  const ingredients = (product.ingredients_text_fr || product.ingredients_text || '').toLowerCase();
  const ultraProcessedKeywords = ['sirop de glucose', 'huile hydrogénée', 'protéines hydrolysées', 'isolat de protéines', 'maltodextrine'];
  
  if (ultraProcessedKeywords.some(keyword => ingredients.includes(keyword))) {
    if (deduction < 10) {
      deduction = 10;
      deductions.push('Ingrédients ultra-transformés détectés: -10 points');
    }
  }
  
  return {
    score: Math.max(0, 100 - deduction),
    deduction: -Math.min(10, deduction),
    deductions: deductions
  };
}

/**
 * Génère des recommandations basées sur le score
 */
function generateRecommendations(score, details) {
  const recommendations = [];
  
  if (score < 50) {
    recommendations.push('⚠️ Ce produit a un impact négatif sur la santé');
    recommendations.push('💡 Considérez des alternatives plus saines');
  }
  
  if (details.additives.badAdditives && details.additives.badAdditives.length > 0) {
    recommendations.push(`⚠️ Contient ${details.additives.badAdditives.length} additif(s) problématique(s)`);
  }
  
  if (details.processing.deduction < 0) {
    recommendations.push('⚠️ Produit transformé ou ultra-transformé');
  }
  
  if (score >= 75) {
    recommendations.push('✅ Produit de bonne qualité nutritionnelle');
  }
  
  return recommendations;
}

/**
 * Formate le score pour l'affichage
 */
export function formatYukaScore(yukaData) {
  return {
    score: yukaData.score,
    color: yukaData.color,
    label: yukaData.label,
    badge: `${yukaData.score}/100`,
    details: {
      nutrition: {
        score: yukaData.details.nutrition.score,
        deductions: yukaData.details.nutrition.deductions
      },
      additives: {
        score: yukaData.details.additives.score,
        deductions: yukaData.details.additives.deductions,
        badAdditives: yukaData.details.additives.badAdditives || []
      },
      processing: {
        score: yukaData.details.processing.score,
        deductions: yukaData.details.processing.deductions
      }
    },
    recommendations: yukaData.recommendations
  };
}

