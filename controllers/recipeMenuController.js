// controllers/recipeMenuController.js
import asyncHandler from 'express-async-handler';
import RecipeEnriched from '../models/Recipe.js';
import Stock from '../models/Stock.js';
import Resident from '../models/Resident.js';
import openai from '../services/openaiClient.js';

/**
 * Convertit un code de texture IDDSI en label lisible
 */
function getTextureLabel(textureCode) {
  const textureLabels = {
    'iddsi_7': 'Normale (facile à mastiquer)',
    'iddsi_6': 'Petits morceaux tendres',
    'iddsi_5': 'Haché lubrifié',
    'iddsi_4': 'Purée lisse / Très épais',
    'iddsi_3': 'Purée fluide / Modérément épais',
    'normale': 'Normale',
    'tendre': 'Tendre',
    'hachée': 'Hachée',
    'mixée': 'Mixée',
    'moulinée': 'Moulinée',
    'lisse': 'Lisse',
    'liquide': 'Liquide',
    'boire': 'Boire'
  };
  return textureLabels[textureCode] || textureCode;
}

/**
 * Normalise les valeurs du frontend vers le format backend
 */
/**
 * Normalise les valeurs du frontend vers le format backend/MongoDB
 * DOIT correspondre EXACTEMENT aux tags et dietaryRestrictions dans la DB
 */
function normalizeDietaryRestrictions(restrictions) {
  const mapping = {
    // Sans sel → hyposode (comme dans dietaryRestrictions DB!)
    'Sans sel': 'hyposode',
    'sans sel': 'hyposode',
    'Sans Sel': 'hyposode',
    
    // Sans sucre → pauvre_en_sucre (valeur qui existe dans la DB)
    'Sans sucre': 'pauvre_en_sucre',
    'sans sucre': 'pauvre_en_sucre',
    'Sans Sucre': 'pauvre_en_sucre',
    'pauvre_en_sucre': 'pauvre_en_sucre',
    
    // Religions
    'Halal': 'halal',
    'halal': 'halal',
    'Casher': 'casher',
    'casher': 'casher',
    
    // Végétarien (garder l'accent)
    'Végétarien': 'végétarien',
    'végétarien': 'végétarien',
    'Vegetarien': 'végétarien',
    
    // Végétalien (garder l'accent)
    'Végétalien': 'végétalien',
    'végétalien': 'végétalien',
    'Vegan': 'végétalien',
    'vegan': 'végétalien',
    
    // Sans gluten → sans_gluten (avec underscore!)
    'Sans gluten': 'sans_gluten',
    'sans gluten': 'sans_gluten',
    'Sans Gluten': 'sans_gluten',
    
    // Sans lactose → sans_lactose (avec underscore!)
    'Sans lactose': 'sans_lactose',
    'sans lactose': 'sans_lactose',
    'Sans Lactose': 'sans_lactose',
    
    // Hyperprotéiné (garder l'accent!)
    'Hyperprotéiné': 'hyperprotéiné',
    'hyperprotéiné': 'hyperprotéiné',
    'hyperproteine': 'hyperprotéiné',
    'Hyperproteine': 'hyperprotéiné',
    
    // Hypocalorique
    'Hypocalorique': 'hypocalorique',
    'hypocalorique': 'hypocalorique',
    
    // Textures
    'Mixée': 'mixée',
    'mixée': 'mixée',
    'mixee': 'mixée',
    'Hachée': 'hachée',
    'hachée': 'hachée',
    'hachee': 'hachée',
    'Tendre': 'tendre',
    'tendre': 'tendre',
    'Lisse': 'lisse',
    'lisse': 'lisse',
    
    // Pathologies
    'Diabète': 'diabete',
    'diabète': 'diabete',
    'Hypertension': 'hypertension',
    'hypertension': 'hypertension'
  };
  
  return restrictions.map(r => mapping[r] || r.toLowerCase());
}

/**
 * Génère un menu intelligent basé sur les recettes de la base de données
 * avec adaptation des quantités selon l'âge et le nombre de convives
 */
export const generateIntelligentMenu = asyncHandler(async (req, res) => {
  let {
    establishmentType,
    ageGroups, // [{ ageRange: "6-12", count: 25 }, ...]
    numDishes, // Nombre de plats (entrée, plat, dessert)
    menuStructure = 'plat_seul', // Structure du menu (plat_seul, soupe_plat, entree_plat_dessert)
    allergens = [], // Allergènes à exclure
    dietaryRestrictions = [], // Restrictions alimentaires
    medicalConditions = [], // Pathologies à prendre en compte
    texture = 'normale', // Texture souhaitée
    swallowing = 'normale', // Filtres de déglutition
    nutritionalProfile = [], // Profils nutritionnels spécialisés
    ethicalRestrictions = [], // Restrictions éthiques/religieuses
    ageDependencyGroup = 'personne_agee_autonome', // Groupe d'âge et dépendance
    comfortFilters = [], // Filtres de confort
    useStockOnly = false, // Utiliser uniquement les ingrédients en stock
    theme // Thème du menu (optionnel)
  } = req.body;

  // Normaliser les restrictions alimentaires
  dietaryRestrictions = normalizeDietaryRestrictions(dietaryRestrictions);
  console.log('🔄 Restrictions normalisées:', dietaryRestrictions);

  try {
    // 1. Calculer le nombre total de convives et la tranche d'âge majoritaire
    const totalPeople = ageGroups.reduce((sum, group) => sum + group.count, 0);
    const majorityAgeGroup = findMajorityAgeGroup(ageGroups);

    // 2. Construire les filtres pour la recherche de recettes
    const recipeFilter = {
      allergens: { $nin: allergens }
    };

    // Filtrer par type d'établissement si spécifié
    if (establishmentType) {
      // Inclure toujours 'hopital' car c'est le type le plus polyvalent
      recipeFilter.establishmentTypes = { $in: [establishmentType, 'hopital'] };
    }

    // Utiliser une logique OR pour les restrictions et conditions médicales
    // Une recette est compatible si elle respecte AU MOINS UNE des restrictions/conditions
    const orConditions = [];
    
    // Si restrictions alimentaires spécifiées
    if (dietaryRestrictions.length > 0) {
      // Chercher dans BOTH 'diet' ET 'dietaryRestrictions'
      orConditions.push(
        { diet: { $in: dietaryRestrictions } },
        { dietaryRestrictions: { $in: dietaryRestrictions } }
      );
    }

    // Si pathologies spécifiées
    if (medicalConditions.length > 0) {
      orConditions.push({ pathologies: { $in: medicalConditions } });
    }

    // Si profils nutritionnels spécifiés
    if (nutritionalProfile.length > 0) {
      orConditions.push({ nutritionalProfile: { $in: nutritionalProfile } });
    }

    // Si restrictions éthiques/religieuses spécifiées (halal, casher, végétarien, etc.)
    // Ces valeurs sont aussi stockées dans dietaryRestrictions dans la BDD
    if (ethicalRestrictions.length > 0) {
      orConditions.push(
        { diet: { $in: ethicalRestrictions } },
        { dietaryRestrictions: { $in: ethicalRestrictions } }
      );
    }

    // Si on a des conditions OR, les ajouter au filtre
    if (orConditions.length > 0) {
      recipeFilter.$or = orConditions;
    }

    // Texture (optionnel, plus permissif)
    if (texture && texture !== 'normale') {
      recipeFilter.texture = texture;
    }

    // Filtres de déglutition
    if (swallowing && swallowing !== 'normale') {
      recipeFilter.swallowing = swallowing;
    }

    // Groupe d'âge et dépendance
    if (ageDependencyGroup && ageDependencyGroup !== 'personne_agee_autonome') {
      recipeFilter.ageDependencyGroup = ageDependencyGroup;
    }

    // Filtres de confort (optionnel)
    if (comfortFilters.length > 0) {
      recipeFilter.comfortFilters = { $in: comfortFilters };
    }

    // 3. Récupérer les recettes compatibles
    let compatibleRecipes = await RecipeEnriched.find(recipeFilter);
    console.log(`🔍 ${compatibleRecipes.length} recettes compatibles trouvées`);

    // Filtrer par tranche d'âge si nécessaire
    compatibleRecipes = filterRecipesByAgeGroup(compatibleRecipes, majorityAgeGroup);
    console.log(`🔍 ${compatibleRecipes.length} recettes après filtrage par âge`);

    // Filtrage spécifique pour les personnes âgées (maison de retraite, EHPAD)
    if (establishmentType === 'maison_retraite' || establishmentType === 'ehpad' || establishmentType === 'maison de retraite') {
      compatibleRecipes = filterRecipesForSeniors(compatibleRecipes);
      console.log(`👴 ${compatibleRecipes.length} recettes adaptées aux seniors après filtrage`);
    }

    // Vérification assouplie: avertir si peu de recettes mais continuer
    if (compatibleRecipes.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Aucune recette compatible trouvée avec les critères spécifiés.`
      });
    }
    
    if (compatibleRecipes.length < numDishes) {
      console.log(`⚠️ Attention: ${compatibleRecipes.length} recettes compatibles trouvées pour ${numDishes} plats demandés.`);
      console.log(`   L'IA réutilisera certaines recettes ou adaptera le menu.`);
    }

    // 4. Si useStockOnly, vérifier la disponibilité en stock
    let stockItems = [];
    if (useStockOnly) {
      stockItems = await Stock.find({ userId: req.user._id });
      compatibleRecipes = filterRecipesByStock(compatibleRecipes, stockItems);
      console.log(`🔍 ${compatibleRecipes.length} recettes disponibles avec le stock`);
    }

    // 5. Calculer les groupes de variantes nécessaires
    const variantGroups = calculateVariantGroups(ageGroups);
    console.log(`📊 Groupes de variantes:`, JSON.stringify(variantGroups, null, 2));

    // 6. Générer le menu principal et les variantes
    // L'IA va choisir intelligemment les plats parmi TOUTES les recettes compatibles
    console.log(`🎯 Génération du menu avec ${compatibleRecipes.length} recettes compatibles`);
    console.log(`🎯 Nombre de plats demandés: ${numDishes}`);
    console.log(`🎯 Nombre total de convives: ${totalPeople}`);
    
    const menuWithVariants = await generateMenuWithVariants(
      compatibleRecipes, // Passer TOUTES les recettes, pas juste une sélection aléatoire
      numDishes,
      totalPeople,
      ageGroups,
      variantGroups,
      establishmentType,
      theme,
      allergens,
      dietaryRestrictions,
      medicalConditions,
      menuStructure
    );
    
    console.log(`✅ Menu généré avec succès: ${menuWithVariants.title}`);

    // 7. Générer la liste de courses globale
    const shoppingList = generateShoppingListForVariants(menuWithVariants);

    res.status(200).json({
      success: true,
      menu: {
        title: menuWithVariants.title,
        description: menuWithVariants.description,
        mainMenu: menuWithVariants.mainMenu,
        variants: menuWithVariants.variants,
        shoppingList: shoppingList,
        metadata: {
          establishmentType,
          totalPeople,
          ageGroups,
          allergens,
          dietaryRestrictions,
          medicalConditions,
          texture
        }
      }
    });

  } catch (error) {
    console.error('Erreur génération menu intelligent:', error);
    res.status(500);
    throw new Error('Erreur lors de la génération du menu intelligent');
  }
});

/**
 * Trouve le groupe d'âge majoritaire
 */
function findMajorityAgeGroup(ageGroups) {
  return ageGroups.reduce((max, group) => 
    group.count > (max.count || 0) ? group : max
  , {}).ageRange || '6-12';
}

/**
 * Filtre les recettes par groupe d'âge
 */
function filterRecipesByAgeGroup(recipes, targetAgeGroup) {
  return recipes.filter(recipe => {
    // Si pas d'ageGroup défini, on garde la recette
    if (!recipe.ageGroup) {
      return true;
    }
    
    // NOUVEAU FORMAT: { min: Number, max: Number }
    if (typeof recipe.ageGroup === 'object' && recipe.ageGroup.min !== undefined && recipe.ageGroup.max !== undefined) {
      // Pour les seniors/adultes (18+), on accepte toutes les recettes avec max >= 18
      // Pour les enfants, on vérifie l'overlap
      if (targetAgeGroup === 'adulte' || targetAgeGroup === 'senior' || targetAgeGroup === '18+' || targetAgeGroup === '75+') {
        return recipe.ageGroup.max >= 18;
      }
      
      // Pour d'autres tranches d'âge numériques (ex: "6-12")
      if (targetAgeGroup && targetAgeGroup.includes && targetAgeGroup.includes('-')) {
        const targetAges = targetAgeGroup.split('-').map(a => parseFloat(a));
        // Vérifier overlap: recette.min <= target.max ET recette.max >= target.min
        return recipe.ageGroup.min <= targetAges[1] && recipe.ageGroup.max >= targetAges[0];
      }
      
      // Par défaut, accepter (recettes enrichies avec min:2.5, max:99 sont universelles)
      return true;
    }
    
    // ANCIEN FORMAT STRING (au cas où il en reste)
    if (typeof recipe.ageGroup === 'string' && recipe.ageGroup.includes('-')) {
      const recipeAges = recipe.ageGroup.split('-').map(a => parseFloat(a));
      
      if (targetAgeGroup && targetAgeGroup.includes && targetAgeGroup.includes('-')) {
        const targetAges = targetAgeGroup.split('-').map(a => parseFloat(a));
        return recipeAges[0] <= targetAges[1] && recipeAges[1] >= targetAges[0];
      }
      
      return recipe.ageGroup === '2.5-99' || recipeAges[1] >= 99;
    }
    
    // Dans le nouveau modèle, on utilise establishmentTypes pour la compatibilité
    if (recipe.establishmentTypes && recipe.establishmentTypes.length > 0) {
      return true;
    }
    
    // Par défaut, on garde la recette (moins restrictif)
    return true;
  });
}

/**
 * Filtre les recettes inadaptées pour les personnes âgées
 * Exclut les plats "modernes", "street food", "fast food"
 * Privilégie les recettes traditionnelles françaises faciles à mâcher
 */
function filterRecipesForSeniors(recipes) {
  // Mots-clés à EXCLURE pour les personnes âgées
  const excludedKeywords = [
    'bowl', 'buddha', 'poke', 'wrap', 'burger', 'hot dog', 'tacos', 'burrito',
    'street', 'fast', 'fusion', 'hipster', 'trendy', 'smoothie bowl',
    'açaí', 'bagel', 'donut', 'pancake', 'waffle', 'cookie', 'cupcake',
    'pulled', 'smash', 'crispy', 'crunchy', 'chips', 'nachos', 'quesadilla',
    'sushi', 'maki', 'california', 'spring roll', 'nems', 'samosa'
  ];
  
  // Mots-clés à PRIVILÉGIER pour les personnes âgées
  const preferredKeywords = [
    'soupe', 'potage', 'velouté', 'crème', 'gratin', 'purée', 'compote',
    'blanquette', 'ragoût', 'daube', 'mijot', 'brais', 'pot-au-feu', 'potée',
    'hachis', 'flan', 'clafoutis', 'far breton', 'riz au lait', 'crème caramel',
    'poulet rôti', 'poisson vapeur', 'colin', 'sole', 'cabillaud',
    'légumes fondants', 'carottes vichy', 'haricots verts', 'courgettes',
    'quiche', 'tarte', 'tourte', 'pâté', 'terrine', 'mousse',
    'traditionnel', 'classique', 'français', 'grand-mère', 'maison'
  ];
  
  return recipes.filter(recipe => {
    // D'abord, vérifier la cohérence titre/ingrédients et l'appropriation pour les seniors
    if (!isRecipeAppropriateForSeniors(recipe)) {
      return false;
    }
    
    const recipeTitleLower = (recipe.name || '').toLowerCase();
    const recipeDescLower = (recipe.description || '').toLowerCase();
    const fullText = `${recipeTitleLower} ${recipeDescLower}`;
    
    // Exclure si contient un mot-clé interdit
    const hasExcludedWord = excludedKeywords.some(keyword => 
      fullText.includes(keyword.toLowerCase())
    );
    
    if (hasExcludedWord) {
      console.log(`🚫 Recette "${recipe.name}" exclue pour les seniors (mot-clé inapproprié)`);
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Prioriser les recettes avec mots-clés préférés
    const aScore = preferredKeywords.filter(keyword => 
      `${a.name || ''} ${a.description || ''}`.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    const bScore = preferredKeywords.filter(keyword => 
      `${b.name || ''} ${b.description || ''}`.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    return bScore - aScore; // Tri décroissant par score
  });
}

/**
 * Compose les plats selon la structure du menu demandée
 */
function composeMenuStructure(recipes, menuStructure, numDishes) {
  // Séparer les recettes par catégorie
  const recipesByComponent = {
    soupe: recipes.filter(r => r.category === 'soupe' || r.name.toLowerCase().includes('soupe')),
    entree: recipes.filter(r => r.category === 'entrée' || r.category === 'entree'),
    proteine: recipes.filter(r => r.category === 'plat' && (r.name.toLowerCase().includes('viande') || r.name.toLowerCase().includes('poisson') || r.name.toLowerCase().includes('volaille'))),
    legumes: recipes.filter(r => r.category === 'plat' && (r.name.toLowerCase().includes('légume') || r.name.toLowerCase().includes('légumes') || r.name.toLowerCase().includes('légume'))),
    feculent: recipes.filter(r => r.category === 'plat' && (r.name.toLowerCase().includes('riz') || r.name.toLowerCase().includes('pâtes') || r.name.toLowerCase().includes('pomme de terre'))),
    dessert: recipes.filter(r => r.category === 'dessert'),
    plat_complet: recipes.filter(r => r.category === 'plat' && !r.name.toLowerCase().includes('soupe'))
  };

  const composedDishes = [];

  switch (menuStructure) {
    case 'plat_seul':
      // Plat principal uniquement - composer protéine+féculent OU légumes+féculent
      composedDishes.push(...composePlatsPrincipaux(recipesByComponent, numDishes));
      break;

    case 'soupe_plat':
      // Soupe + Plat principal
      if (recipesByComponent.soupe.length > 0) {
        composedDishes.push(...recipesByComponent.soupe.slice(0, 1));
      }
      composedDishes.push(...composePlatsPrincipaux(recipesByComponent, numDishes - 1));
      break;

    case 'entree_plat_dessert':
      // Entrée + Plat + Dessert
      if (recipesByComponent.entree.length > 0) {
        composedDishes.push(...recipesByComponent.entree.slice(0, 1));
      }
      composedDishes.push(...composePlatsPrincipaux(recipesByComponent, 1));
      if (recipesByComponent.dessert.length > 0) {
        composedDishes.push(...recipesByComponent.dessert.slice(0, 1));
      }
      break;

    default:
      // Par défaut, retourner les plats complets existants
      composedDishes.push(...recipesByComponent.plat_complet.slice(0, numDishes));
  }

  return composedDishes.length > 0 ? composedDishes : recipes.slice(0, numDishes);
}

/**
 * Compose des plats principaux (protéine+féculent OU légumes+féculent)
 */
function composePlatsPrincipaux(recipesByComponent, count) {
  const platsPrincipaux = [];

  // D'abord utiliser les plats complets déjà existants
  platsPrincipaux.push(...recipesByComponent.plat_complet.slice(0, Math.min(count, recipesByComponent.plat_complet.length)));

  // Si besoin de plus de plats, composer des combinaisons
  const remaining = count - platsPrincipaux.length;
  if (remaining > 0) {
    // Composer protéine + féculent
    for (let i = 0; i < Math.min(remaining, recipesByComponent.proteine.length); i++) {
      const proteine = recipesByComponent.proteine[i];
      const feculent = recipesByComponent.feculent[i % recipesByComponent.feculent.length];

      if (proteine && feculent) {
        // Créer un "plat composé" en fusionnant les deux recettes
        const platCompose = {
          ...proteine,
          title: `${proteine.name} avec ${feculent.name}`,
          description: `${proteine.description || proteine.name} accompagné(e) de ${feculent.name.toLowerCase()}`,
          isComposed: true,
          components: [
            { type: 'proteine', recipe: proteine },
            { type: 'feculent', recipe: feculent }
          ],
          ingredients: [...proteine.ingredients, ...feculent.ingredients],
          instructions: [...(proteine.preparationSteps || []), ...( feculent.preparationSteps || [])],
          nutrition: {
            calories: (proteine.nutritionalProfile?.kcal || 0) + (feculent.nutritionalProfile?.kcal || 0),
            proteins: (proteine.nutritionalProfile?.protein || 0) + (feculent.nutritionalProfile?.protein || 0),
            carbs: (proteine.nutritionalProfile?.carbs || 0) + (feculent.nutritionalProfile?.carbs || 0),
            fats: (proteine.nutritionalProfile?.lipids || 0) + (feculent.nutritionalProfile?.lipids || 0)
          }
        };
        platsPrincipaux.push(platCompose);
      }
    }

    // Si encore besoin, composer légumes + féculent
    const stillRemaining = count - platsPrincipaux.length;
    if (stillRemaining > 0) {
      for (let i = 0; i < Math.min(stillRemaining, recipesByComponent.legumes.length); i++) {
        const legumes = recipesByComponent.legumes[i];
        const feculent = recipesByComponent.feculent[(i + recipesByComponent.proteine.length) % recipesByComponent.feculent.length];

        if (legumes && feculent) {
          const platCompose = {
            ...legumes,
            title: `${legumes.name} avec ${feculent.name}`,
            description: `${legumes.description || legumes.name} accompagné(e) de ${feculent.name.toLowerCase()}`,
            isComposed: true,
            components: [
              { type: 'legumes', recipe: legumes },
              { type: 'feculent', recipe: feculent }
            ],
            ingredients: [...legumes.ingredients, ...feculent.ingredients],
            instructions: [...(legumes.preparationSteps || []), ...(feculent.preparationSteps || [])],
            nutrition: {
              calories: (legumes.nutritionalProfile?.kcal || 0) + (feculent.nutritionalProfile?.kcal || 0),
              proteins: (legumes.nutritionalProfile?.protein || 0) + (feculent.nutritionalProfile?.protein || 0),
              carbs: (legumes.nutritionalProfile?.carbs || 0) + (feculent.nutritionalProfile?.carbs || 0),
              fats: (legumes.nutritionalProfile?.lipids || 0) + (feculent.nutritionalProfile?.lipids || 0)
            }
          };
          platsPrincipaux.push(platCompose);
        }
      }
    }
  }

  return platsPrincipaux.slice(0, count);
}

/**
 * Filtre les recettes en fonction du stock disponible
 */
function filterRecipesByStock(recipes, stockItems) {
  const availableIngredients = new Set(
    stockItems
      .filter(item => item.quantite > 0)
      .map(item => normalizeIngredientName(item.nom))
  );

  return recipes.filter(recipe => {
    const requiredIngredients = recipe.ingredients.map(ing => 
      normalizeIngredientName(ing.name)
    );
    
    // Vérifier si au moins 70% des ingrédients sont disponibles
    const availableCount = requiredIngredients.filter(ing => 
      availableIngredients.has(ing)
    ).length;
    
    return (availableCount / requiredIngredients.length) >= 0.7;
  });
}

/**
 * Normalise le nom d'un ingrédient pour la comparaison
 */
function normalizeIngredientName(name) {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/**
 * Utilise l'IA pour sélectionner et composer le menu
 */
async function selectMenuWithAI(
  compatibleRecipes,
  numDishes,
  totalPeople,
  ageGroups,
  establishmentType,
  theme,
  allergens,
  dietaryRestrictions,
  medicalConditions,
  menuStructure = 'plat_seul'
) {
  console.log(`🤖 Appel IA pour sélectionner ${numDishes} plats (structure: ${menuStructure})`);
  console.log(`🤖 Recettes compatibles reçues: ${compatibleRecipes.length}`);
  console.log(`🤖 Allergènes à exclure: ${allergens}`);
  console.log(`🤖 Restrictions alimentaires: ${dietaryRestrictions}`);
  console.log(`🤖 Conditions médicales: ${medicalConditions}`);
  
  // Filtrer strictement par allergènes et restrictions AVANT d'envoyer à l'IA
  let filteredRecipes = compatibleRecipes.filter(recipe => {
    // D'abord, vérifier que la recette est appropriée pour les seniors
    if (establishmentType === 'maison_retraite' && !isRecipeAppropriateForSeniors(recipe)) {
      return false;
    }
    
    // Vérifier allergènes - DOUBLE VÉRIFICATION (champ + ingrédients)
    if (allergens && allergens.length > 0) {
      // 1. Vérifier dans le champ allergens
      const recipeAllergens = recipe.allergens || [];
      const hasProblematicAllergen = recipeAllergens.some(a => allergens.includes(a));
      if (hasProblematicAllergen) {
        console.log(`❌ ${recipe.name} exclue (allergène: ${recipeAllergens.join(', ')})`);
        return false;
      }
      
      // 2. Vérifier dans les ingrédients (mots-clés)
      const ingredients = recipe.ingredients || [];
      const ingredientNames = ingredients.map(ing => (ing.name || ing.item || '').toLowerCase()).join(' ');
      
      for (const allergen of allergens) {
        let allergenKeywords = [];
        
        switch(allergen) {
          case 'lactose':
            allergenKeywords = ['lait', 'crème', 'fromage', 'beurre', 'yaourt', 'gorgonzola', 'gruyère', 'parmesan', 'mozzarella', 'chèvre', 'emmental', 'mascarpone', 'ricotta'];
            break;
          case 'gluten':
            allergenKeywords = ['farine', 'pain', 'pâtes', 'blé', 'orge', 'seigle', 'épeautre'];
            break;
          case 'oeufs':
          case 'œufs':
            allergenKeywords = ['œuf', 'oeuf'];
            break;
          case 'poisson':
            allergenKeywords = ['poisson', 'saumon', 'thon', 'cabillaud', 'truite', 'morue', 'sole', 'colin'];
            break;
          case 'crustaces':
          case 'crustacés':
            allergenKeywords = ['crevette', 'crabe', 'homard', 'langouste', 'écrevisse'];
            break;
          case 'fruits_a_coque':
          case 'arachides':
            allergenKeywords = ['noix', 'noisette', 'amande', 'cacahuète', 'cajou', 'pistache'];
            break;
        }
        
        const hasAllergenInIngredients = allergenKeywords.some(keyword => 
          ingredientNames.includes(keyword)
        );
        
        if (hasAllergenInIngredients) {
          console.log(`❌ ${recipe.name} exclue (ingrédient ${allergen}: ${allergenKeywords.find(k => ingredientNames.includes(k))})`);
          return false;
        }
      }
    }
    
    // Vérifier restrictions alimentaires - LOGIQUE PLUS PERMISSIVE
    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      const recipeRestrictions = recipe.diet || [];
      // Au moins une des restrictions demandées doit être dans la recette
      const matchesRestriction = dietaryRestrictions.some(r => recipeRestrictions.includes(r));
      if (!matchesRestriction) {
        console.log(`❌ ${recipe.name} exclue (restrictions: ${recipeRestrictions.join(', ')}, demandées: ${dietaryRestrictions.join(', ')})`);
        return false;
      }
    }
    
    return true;
  });
  
  console.log(`✅ ${filteredRecipes.length} recettes après filtrage allergènes/restrictions`);
  
  if (filteredRecipes.length === 0) {
    console.log(`❌ Aucune recette compatible après filtrage strict !`);
    console.log(`🔍 Recettes originales: ${compatibleRecipes.length}`);
    console.log(`🔍 Exemples de recettes originales:`, compatibleRecipes.slice(0, 3).map(r => ({
      name: r.name,
      allergens: r.allergens,
      diet: r.diet,
      pathologies: r.pathologies
    })));
    return { dishes: [], title: "Menu non disponible", description: "Aucune recette compatible trouvée" };
  }
  
  // Limiter à 40 recettes pour ne pas dépasser la limite de tokens OpenAI
  if (filteredRecipes.length > 40) {
    // Mélanger et prendre les 40 premières
    filteredRecipes = filteredRecipes.sort(() => 0.5 - Math.random()).slice(0, 40);
    console.log(`📉 Limitation à ${filteredRecipes.length} recettes pour OpenAI (tokens)`);
  }
  
  const recipesJson = filteredRecipes.map(r => ({
    id: r._id,
    title: r.name,
    category: r.category,
    mealComponent: r.category,
    allergens: r.allergens,
    dietaryRestrictions: r.diet
  }));

  const ageGroupsInfo = ageGroups.map(g => 
    `${g.count} personnes de ${g.ageRange} ans`
  ).join(', ');

  // Créer des recommandations adaptées au type d'établissement
  const getEstablishmentSpecificGuidelines = (type) => {
    switch(type) {
      case 'cantine_scolaire':
        return {
          expertRole: 'EXPERT EN DIÉTÉTIQUE PÉDIATRIQUE et NUTRITIONNISTE pour ENFANTS',
          mission: 'composer des menus SAINS, ÉQUILIBRÉS et ADAPTÉS aux enfants, couvrant tous leurs besoins nutritionnels de croissance',
          portions: `
RECOMMANDATIONS DE PORTIONS PAR ÂGE (ENFANTS):
- 2.5-6 ans (Maternelle): Portions 60-70% adulte | Protéines 15-20g | Légumes 80-100g | Féculents 60-80g | 400-500 kcal
- 6-12 ans (Primaire): Portions 80-90% adulte | Protéines 25-30g | Légumes 100-150g | Féculents 100-120g | 600-700 kcal
- 12-18 ans (Secondaire): Portions 100-110% adulte | Protéines 35-45g | Légumes 150-200g | Féculents 150-180g | 800-900 kcal`,
          specificRules: `
⚠️ INTERDICTIONS ABSOLUES POUR ENFANTS:
- AUCUN plat épicé (piment, curry fort, épices fortes)
- INTERDIT: Penne all'Arrabbiata, Spaghetti Aglio e Olio (ail cru + piment)
- INTERDIT: Ail cru, goûts trop prononcés, sauces relevées
- Privilégier: Saveurs douces, naturelles, familières

✅ PRIORITÉS ENFANTS:
- Plats réconfortants (gratin, pâtes sauce douce, riz au poulet, purées)
- Légumes familiers (carottes, courgettes, pommes de terre)
- Protéines tendres et faciles à mâcher
- Textures adaptées (ni trop dures, ni trop liquides)
- Couleurs attrayantes, présentations ludiques`
        };
      
      case 'hopital':
        return {
          expertRole: 'EXPERT EN NUTRITION CLINIQUE et DIÉTÉTICIEN HOSPITALIER',
          mission: 'composer des menus THÉRAPEUTIQUES adaptés aux PATHOLOGIES, favorisant la GUÉRISON et le maintien de l\'état nutritionnel',
          portions: `
RECOMMANDATIONS HOSPITALIÈRES:
- Portions standard adulte: 100% | Protéines 40-50g | Légumes 200g | Féculents 150g | 700-800 kcal
- PRIORITÉ: Apports protéiques suffisants (risque de dénutrition)
- HYDRATATION: Privilégier soupes, potages, aliments riches en eau
- DIGESTIBILITÉ: Cuissons douces, aliments faciles à digérer`,
          specificRules: `
🏥 RÈGLES HOSPITALIÈRES STRICTES:
- Respect ABSOLU des régimes médicaux (diabète, hypertension, insuffisance rénale, etc.)
- Textures adaptées selon pathologie: normale, hachée, mixée, liquide
- INTERDIT pour diabète: sucres rapides, desserts très sucrés
- INTERDIT pour hypertension: excès de sel, charcuteries, conserves salées
- INTERDIT pour insuffisance rénale: excès de protéines, potassium, phosphore
- INTERDIT pour dysphagie: morceaux entiers, textures dures, liquides trop fluides

✅ PRIORITÉS HÔPITAL:
- Plats faciles à digérer, bien tolérés
- Apports protéiques optimaux (viandes tendres, poissons, œufs)
- Éviter aliments flatulents (choux, légumineuses crues)
- Cuissons vapeur, pochées, en papillote (éviter fritures)
- Saveurs douces mais appétissantes (stimuler l'appétit des patients)`
        };
      
      case 'ehpad':
      case 'maison_retraite':
        return {
          expertRole: 'EXPERT EN NUTRITION GÉRIATRIQUE et DIÉTÉTICIEN pour PERSONNES ÂGÉES',
          mission: 'composer des menus adaptés aux SENIORS, prévenant la DÉNUTRITION et respectant les capacités de MASTICATION/DÉGLUTITION',
          portions: `
RECOMMANDATIONS PERSONNES ÂGÉES:
- Portions standard: 100% | Protéines 45-55g (AUGMENTÉ pour éviter sarcopénie) | Légumes 200g | Féculents 150g | 700-800 kcal
- ENRICHISSEMENT PROTÉIQUE: Priorité absolue (risque de dénutrition élevé)
- CALCIUM: Apports augmentés (prévention ostéoporose)
- FIBRES: Suffisants mais pas excessifs (transit)`,
          specificRules: `
👴👵 RÈGLES SPÉCIFIQUES SENIORS:
- TEXTURES ADAPTÉES: Normale / Hachée / Mixée / Moulinée selon capacités
- MASTICATION: Privilégier viandes tendres, poissons, œufs (éviter viandes dures)
- DÉGLUTITION: Éviter aliments secs, friables, collants (risque fausse route)
- INTERDIT textures: Morceaux durs, fibres longues, aliments secs sans sauce
- Privilégier: Plats en sauce, gratins, purées enrichies, flans

✅ PRIORITÉS EHPAD:
- Plats tendres, moelleux, fondants (faciles à mâcher)
- Saveurs marquées (perte goût/odorat avec l'âge)
- Enrichissement: Crème, beurre, fromage (apports caloriques/protéiques)
- Soupes enrichies, purées onctueuses, compotes
- Éviter: Viandes dures, pain sec, crudités dures, fruits à pépins
- APPÉTENCE: Couleurs, odeurs, saveurs stimulantes`
        };
      
      case 'entreprise':
      case 'cantine_entreprise':
        return {
          expertRole: 'EXPERT EN NUTRITION et DIÉTÉTICIEN pour ADULTES ACTIFS',
          mission: 'composer des menus ÉQUILIBRÉS et ÉNERGÉTIQUES pour maintenir la PERFORMANCE et la CONCENTRATION au travail',
          portions: `
RECOMMANDATIONS ADULTES ACTIFS:
- Portions standard: 100% | Protéines 40-50g | Légumes 200-250g | Féculents 150-200g | 700-900 kcal
- ÉQUILIBRE: Glucides complexes (énergie longue durée), protéines (satiété), fibres
- ÉVITER: Repas trop lourds (somnolence après-midi)
- VARIÉTÉ: Menus diversifiés pour éviter lassitude`,
          specificRules: `
💼 RÈGLES RESTAURATION COLLECTIVE ADULTES:
- Repas équilibrés sans être trop lourds (éviter coup de fatigue 14h)
- Privilégier glucides complexes (riz, pâtes, pommes de terre) pour énergie durable
- Protéines de qualité (viandes, poissons, légumineuses)
- Légumes variés (vitamines, minéraux, fibres)
- Possibilité plats plus relevés/épicés (palais adultes)

✅ PRIORITÉS ENTREPRISE:
- Variété et diversité (éviter monotonie)
- Rapidité de service
- Options végétariennes/vegan disponibles
- Plats internationaux acceptables (cuisine du monde)
- Équilibre nutritionnel sur la semaine
- Saveurs variées (épices modérées acceptées)`
        };
      
      default:
        return {
          expertRole: 'EXPERT EN NUTRITION et DIÉTÉTICIEN en RESTAURATION COLLECTIVE',
          mission: 'composer des menus SAINS, ÉQUILIBRÉS et ADAPTÉS aux convives',
          portions: '- Portions standard adulte: Protéines 40-50g | Légumes 200g | Féculents 150g | 700-800 kcal',
          specificRules: '- Respecter les restrictions alimentaires et pathologies\n- Assurer un équilibre nutritionnel'
        };
    }
  };

  const guidelines = getEstablishmentSpecificGuidelines(establishmentType);

  const systemPrompt = `Tu es un ${guidelines.expertRole} spécialisé dans la restauration collective.
Ta mission est de ${guidelines.mission}.

${guidelines.portions}

PRINCIPES DIÉTÉTIQUES FONDAMENTAUX:
- Chaque menu doit couvrir 100% des besoins nutritionnels adaptés au public
- Équilibre des macronutriments : protéines (15-20%), glucides (50-55%), lipides (30-35%)
- Variété des sources : protéines animales ET végétales, fibres, vitamines, minéraux
- Favoriser aliments frais, peu transformés, riches en nutriments
- Adapter textures et saveurs selon le public

RÈGLES STRICTES:
1. Sélectionne exactement ${numDishes} plats variés parmi les recettes fournies
2. Assure une diversité des catégories (entrée, plat principal, accompagnement, dessert)
3. ÉQUILIBRE NUTRITIONNEL COMPLET adapté au public ciblé
4. IMPÉRATIF: Quantités ajustées selon âges et besoins spécifiques
5. Restrictions OBLIGATOIRES: allergènes interdits: ${allergens.join(', ') || 'aucun'}, restrictions: ${dietaryRestrictions.join(', ') || 'aucune'}, pathologies: ${medicalConditions.join(', ') || 'aucune'}

${guidelines.specificRules}`;

  const userPrompt = `Compose un menu ${theme ? `sur le thème "${theme}"` : 'équilibré'} pour un ${establishmentType}.

CONVIVES (ATTENTION AUX QUANTITÉS PAR ÂGE):
- Total: ${totalPeople} personnes
- Répartition détaillée: ${ageGroupsInfo}

⚠️ IMPORTANT: Les recettes doivent être adaptées aux tranches d'âge avec des portions appropriées.
Exemple: Si tu as 20 enfants de 2.5-6 ans et 30 enfants de 6-12 ans, les quantités doivent être calculées en conséquence (portions réduites pour les petits).

CONTRAINTES ALIMENTAIRES:
- Nombre de plats souhaités: ${numDishes}
- Allergènes à EXCLURE ABSOLUMENT: ${allergens.join(', ') || 'aucun'}
- Restrictions alimentaires à respecter: ${dietaryRestrictions.join(', ') || 'aucune'}
- Pathologies à considérer: ${medicalConditions.join(', ') || 'aucune'}

⚠️ IMPORTANT: Toutes les recettes ci-dessous ont DÉJÀ été filtrées pour exclure les allergènes et respecter les restrictions. Tu dois choisir parmi ces recettes déjà sûres.

RECETTES DISPONIBLES (${filteredRecipes.length}):
${JSON.stringify(recipesJson, null, 2)}

Réponds UNIQUEMENT avec un JSON contenant:
{
  "title": "Titre du menu",
  "description": "Description courte du menu mettant en avant l'équilibre nutritionnel",
  "selectedRecipeIds": ["id1", "id2", "id3", ...],
  "ageAdaptation": "Description PRÉCISE des portions par groupe avec nombres exacts. Format: 'Les portions sont adaptées : • Groupe 1 (X enfants - Maternelle/Primaire/etc): portions à XX% • Groupe 2...' - OBLIGATOIRE de mentionner TOUS les groupes avec leurs nombres"
}

CRITÈRES DE SÉLECTION POUR UN MENU PROFESSIONNEL ${establishmentType.toUpperCase()}:

1. VARIÉTÉ ET ÉQUILIBRE NUTRITIONNEL:
   - ÉVITE LES RÉPÉTITIONS (pas 2 fois le même ingrédient principal)
   - Alterne les sources de protéines: viandes, poissons, œufs, légumineuses
   - Varie les légumes: 3 couleurs minimum (vert, orange/rouge, blanc)
   - Équilibre les textures: croquant, fondant, moelleux
   - Mixe cru et cuit si possible

2. APPÉTENCE ET QUALITÉ GASTRONOMIQUE:
   - Privilégie les plats "maison" aux préparations basiques
   - Choisis des recettes avec des sauces savoureuses (évite le "vapeur nature")
   - Varie les modes de cuisson: rôti, braisé, gratiné, mijoté
   - Assure 3 saveurs différentes minimum (salé, sucré, umami, acide)

3. ADAPTATION SENIORS (EHPAD/Maison de retraite):
   - Textures tendres et moelleuses (évite le trop croquant/dur)
   - Recettes traditionnelles françaises et réconfortantes
   - Portions visuellement généreuses mais nutritionnellement adaptées
   - Température de service appropriée (tiède plutôt que brûlant)
   - Facilité de préhension (évite les aliments qui glissent)

4. NUTRIMENTS ESSENTIELS SENIORS:
   - Protéines: minimum 20g par repas (prévention dénutrition)
   - Calcium: privilégie produits laitiers, légumes verts
   - Fibres douces: légumes cuits, fruits compotes
   - Hydratation: soupes, sauces, desserts laitiers

5. RÈGLES D'EXCLUSION STRICTES:
   - ❌ PAS de "purée nature" ou "compote nature" (toujours enrichies/aromatisées)
   - ❌ PAS de répétition du même légume/fruit dans le repas
   - ❌ ÉVITE les desserts trop sucrés pour les régimes médicaux
   - ❌ EXCLUS les textures inadaptées (chips, croquant, dur)

Choisis ${numDishes} recettes qui forment un repas COMPLET, ÉQUILIBRÉ, APPÉTISSANT et VARIÉ.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8, // ✅ Plus de créativité pour menus variés
      max_tokens: 3000  // ✅ Plus d'espace pour réflexion qualité
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    
    // Récupérer les recettes sélectionnées par l'IA
    const selectedRecipes = filteredRecipes.filter(r => 
      aiResponse.selectedRecipeIds.includes(r._id.toString())
    );
    
    console.log(`✅ IA a sélectionné ${selectedRecipes.length} recettes (respectant tous les filtres)`);
    
    // Composer les plats selon la structure du menu
    const composedDishes = composeMenuStructure(selectedRecipes, menuStructure, numDishes);
    console.log(`🍽️ ${composedDishes.length} plat(s) composé(s) selon structure: ${menuStructure}`);

    return {
      title: aiResponse.title,
      description: aiResponse.description,
      ageAdaptation: aiResponse.ageAdaptation || 'Portions adaptées selon les tranches d\'âge des convives',
      dishes: composedDishes.map(r => ({
        recipeId: r._id,
        name: r.name,
        category: r.category,
        description: r.description,
        servings: r.servings,
        ingredients: r.ingredients,
        instructions: r.preparationSteps,
        nutrition: r.nutritionalProfile,
        texture: r.texture,
        isComposed: r.isComposed,
        components: r.components
      }))
    };
  } catch (error) {
    console.error('Erreur IA sélection menu:', error);
    console.log('⚠️ Utilisation du mode de sélection aléatoire (IA non disponible)');
    
    // Fallback: sélection aléatoire AVEC FILTRAGE STRICT des allergènes
    let safelist = compatibleRecipes.filter(recipe => {
      // Vérifier que la recette n'a AUCUN des allergènes exclus
      if (allergens && allergens.length > 0) {
        const recipeAllergens = recipe.allergens || [];
        const hasProblematicAllergen = recipeAllergens.some(a => allergens.includes(a));
        
        if (hasProblematicAllergen) {
          console.log(`❌ Recette "${recipe.name}" exclue car contient: ${recipeAllergens.join(', ')}`);
          return false;
        }
        
        // Double-vérification dans les ingrédients pour lactose
        if (allergens.includes('lactose')) {
          const ingredients = recipe.ingredients || [];
          const ingredientNames = ingredients.map(ing => (ing.name || ing.item || '').toLowerCase());
          const lactoseKeywords = ['lait', 'crème', 'fromage', 'beurre', 'yaourt', 'gorgonzola', 'gruyère', 'parmesan', 'mozzarella', 'chèvre', 'emmental'];
          
          const hasLactose = ingredientNames.some(name => 
            lactoseKeywords.some(keyword => name.includes(keyword))
          );
          
          if (hasLactose) {
            console.log(`❌ Recette "${recipe.name}" exclue car contient du lactose dans les ingrédients`);
            return false;
          }
        }
      }
      
      return true;
    });
    
    console.log(`✅ ${safelist.length} recettes sûres après filtrage strict`);
    
    if (safelist.length < numDishes) {
      console.log(`⚠️ Pas assez de recettes sûres (${safelist.length}/${numDishes}), assouplissement des critères...`);
      safelist = compatibleRecipes; // Fallback au fallback
    }
    
    // Sélection aléatoire parmi les recettes sûres
    const shuffled = [...safelist].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(numDishes * 2, shuffled.length)); // Prendre plus pour avoir de quoi composer
    
    console.log(`📋 Sélection fallback: ${selected.length} recettes pour composer`);
    
    // Composer les plats selon la structure du menu (même en fallback)
    const composedDishes = composeMenuStructure(selected, menuStructure, numDishes);
    console.log(`🍽️ ${composedDishes.length} plat(s) composé(s) selon structure: ${menuStructure}`);
    
    // Créer un message d'adaptation aux âges plus descriptif
    const ageAdaptationMessage = ageGroups.map((g, index) => {
      const portionPercent = g.ageRange === '2.5-6' ? '60-70%' : 
                             g.ageRange === '6-12' ? '80-90%' :
                             g.ageRange === '12-18' ? '100-110%' : '100%';
      const groupName = `Groupe ${index + 1}`;
      const ageLabel = g.ageRange === '2.5-6' ? 'Maternelle (2.5-6 ans)' :
                       g.ageRange === '6-12' ? 'Primaire (6-12 ans)' :
                       g.ageRange === '12-18' ? 'Secondaire (12-18 ans)' : 'Adultes';
      return `• <strong>${groupName}</strong> (${g.count} personnes - ${ageLabel}): portions ajustées à ${portionPercent} de la portion adulte`;
    }).join('<br>');
    
    return {
      title: theme ? `Menu ${theme}` : 'Menu du jour',
      description: 'Menu équilibré et varié (sélection automatique avec filtrage de sécurité)',
      ageAdaptation: `Les portions de chaque recette sont adaptées pour couvrir les besoins nutritionnels spécifiques de chaque groupe :<br>${ageAdaptationMessage}`,
      dishes: composedDishes.map(r => ({
        recipeId: r._id,
        name: r.name,
        category: r.category,
        description: r.description,
        servings: r.servings,
        ingredients: r.ingredients,
        instructions: r.preparationSteps,
        nutrition: r.nutritionalProfile,
        texture: r.texture,
        isComposed: r.isComposed,
        components: r.components
      }))
    };
  }
}

/**
 * Valide qu'une recette est appropriée pour les personnes âgées
 */
function isRecipeAppropriateForSeniors(recipe) {
  // Vérifier que le titre correspond aux ingrédients
  const title = recipe.name.toLowerCase();
  const ingredients = recipe.ingredients.map(ing => ing.name.toLowerCase()).join(' ');
  
  // Vérifier la cohérence titre/ingrédients (version plus permissive)
  const titleWords = title.split(/[\s&+]+/).filter(word => word.length > 3); // Mots de plus de 3 caractères
  const hasMatchingIngredients = titleWords.some(word => {
    // Vérifier si le mot du titre apparaît dans les ingrédients
    const wordInIngredients = ingredients.includes(word) || 
                             ingredients.includes(word.replace(/s$/, '')) || // Pluriel/singulier
                             ingredients.includes(word + 's') ||
                             ingredients.includes(word.replace(/e$/, '')) || // Féminin/masculin
                             ingredients.includes(word + 'e');
    
    // Vérifier aussi les variations communes
    const variations = [
      word.replace(/é/g, 'e'), word.replace(/è/g, 'e'), word.replace(/ê/g, 'e'),
      word.replace(/à/g, 'a'), word.replace(/â/g, 'a'), word.replace(/ä/g, 'a'),
      word.replace(/ù/g, 'u'), word.replace(/û/g, 'u'), word.replace(/ü/g, 'u'),
      word.replace(/ô/g, 'o'), word.replace(/ö/g, 'o')
    ];
    
    const hasVariation = variations.some(variation => ingredients.includes(variation));
    
    return wordInIngredients || hasVariation;
  });
  
  // Si aucun mot du titre ne correspond, c'est suspect mais pas forcément rédhibitoire
  if (!hasMatchingIngredients && titleWords.length > 0) {
    console.log(`⚠️ Recette "${recipe.name}" - titre ne correspond pas clairement aux ingrédients, mais on garde`);
    // On ne rejette plus automatiquement, on continue
  }
  
  // Vérifier que ce n'est pas un plat inapproprié pour les seniors
  const inappropriateKeywords = [
    'buddha bowl', 'poke bowl', 'smoothie bowl', 'acai bowl',
    'wrap', 'burrito', 'taco', 'quesadilla',
    'sushi', 'maki', 'sashimi',
    'raw', 'cru', 'tartare', 'carpaccio'
  ];
  
  const isInappropriate = inappropriateKeywords.some(keyword => 
    title.includes(keyword) || ingredients.includes(keyword)
  );
  
  if (isInappropriate) {
    console.log(`❌ Recette "${recipe.name}" - plat inapproprié pour les seniors`);
    return false;
  }
  
  return true;
}


/**
 * Adapte les quantités pour chaque groupe d'âge
 */
function adaptQuantitiesForAgeGroups(menu, ageGroups) {
  // Coefficients d'adaptation selon l'âge
  const ageCoefficients = {
    '2.5-6': 0.6,
    '6-12': 0.8,
    '12-18': 1.2,
    'adulte': 1.0
  };

  menu.dishes = menu.dishes.map(dish => {
    // Calculer le facteur de multiplication total
    let totalFactor = 0;
    ageGroups.forEach(group => {
      const coef = ageCoefficients[group.ageRange] || 1.0;
      const peopleFactor = group.count / dish.servings;
      totalFactor += peopleFactor * coef;
    });

    // Adapter les quantités d'ingrédients
    const adaptedIngredients = dish.ingredients.map(ing => ({
      name: ing.name,
      quantity: Math.round(ing.quantity * totalFactor * 100) / 100,
      unit: ing.unit,
      originalQuantity: ing.quantity
    }));

    return {
      ...dish,
      ingredients: adaptedIngredients,
      adaptedFor: ageGroups.map(g => `${g.count} × ${g.ageRange} ans`).join(', ')
    };
  });

  return menu;
}

/**
 * Génère une liste de courses consolidée
 */
function generateShoppingList(dishes) {
  const ingredientMap = new Map();

  dishes.forEach(dish => {
    dish.ingredients.forEach(ing => {
      const key = normalizeIngredientName(ing.name);
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key);
        // Si même unité, additionner les quantités
        if (existing.unit === ing.unit) {
          existing.quantity += ing.quantity;
          existing.usedIn.push(dish.name);
        } else {
          // Sinon, créer une nouvelle entrée
          ingredientMap.set(`${key}_${ing.unit}`, {
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            usedIn: [dish.name]
          });
        }
      } else {
        ingredientMap.set(key, {
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          usedIn: [dish.name]
        });
      }
    });
  });

  return Array.from(ingredientMap.values()).map(item => ({
    name: item.name,
    quantity: Math.round(item.quantity * 100) / 100,
    unit: item.unit,
    requiredFor: item.usedIn
  }));
}

/**
 * Récupère les suggestions de recettes basées sur les filtres
 */
export const getRecipeSuggestions = asyncHandler(async (req, res) => {
  const {
    ageGroup,
    category,
    allergens = [],
    dietaryRestrictions = [],
    limit = 10
  } = req.query;

  try {
    const filter = {
      allergens: { $nin: allergens.split(',').filter(Boolean) }
    };

    if (ageGroup) {
      filter.$or = [
        { ageGroup: ageGroup },
        { ageGroup: '2.5-18' } // Recettes universelles
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (dietaryRestrictions) {
      const restrictions = dietaryRestrictions.split(',').filter(Boolean);
      if (restrictions.length > 0) {
        filter.diet = { $in: restrictions };
      }
    }

    const suggestions = await RecipeEnriched.find(filter)
      .limit(parseInt(limit))
      .select('name description category nutritionalProfile allergens');

    res.status(200).json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    console.error('Erreur suggestions recettes:', error);
    res.status(500);
    throw new Error('Erreur lors de la récupération des suggestions');
  }
});

/**
 * Calcule les groupes de variantes nécessaires en fonction des allergies et restrictions
 * CORRIGÉ : Décompose chaque restriction/allergie avec son propre nombre de personnes
 */
function calculateVariantGroups(ageGroups) {
  const variantMap = new Map();
  let totalPeople = 0;
  let totalWithRestrictions = 0;
  
  // Parcourir tous les groupes d'âge
  ageGroups.forEach(group => {
    totalPeople += group.count;
    
    // Décomposer les restrictions alimentaires individuelles
    if (group.dietaryRestrictions && group.dietaryRestrictions.length > 0) {
      group.dietaryRestrictions.forEach(restriction => {
        const profileKey = JSON.stringify({
          allergens: [],
          restrictions: [restriction.type].sort()
        });
        
        if (variantMap.has(profileKey)) {
          const existing = variantMap.get(profileKey);
          existing.count += restriction.count;
        } else {
          variantMap.set(profileKey, {
            allergens: [],
            dietaryRestrictions: [restriction.type],
            count: restriction.count,
            ageRange: group.ageRange
          });
        }
        
        totalWithRestrictions += restriction.count;
      });
    }
    
    // Décomposer les allergies individuelles
    if (group.allergens && group.allergens.length > 0) {
      group.allergens.forEach(allergen => {
        const profileKey = JSON.stringify({
          allergens: [allergen.type].sort(),
          restrictions: []
        });
        
        if (variantMap.has(profileKey)) {
          const existing = variantMap.get(profileKey);
          existing.count += allergen.count;
        } else {
          variantMap.set(profileKey, {
            allergens: [allergen.type],
            dietaryRestrictions: [],
            count: allergen.count,
            ageRange: group.ageRange
          });
        }
        
        totalWithRestrictions += allergen.count;
      });
    }
  });
  
  // Convertir le map en tableau
  const variants = Array.from(variantMap.values());
  
  // Calculer le nombre de personnes sans restrictions (menu principal)
  const mainGroupCount = totalPeople - totalWithRestrictions;
  
  // Si personne sans restrictions, prendre le groupe le plus nombreux comme principal
  let mainGroup;
  let variantGroups;
  
  if (mainGroupCount > 0) {
    // Il y a des personnes sans restrictions
    mainGroup = {
      allergens: [],
      dietaryRestrictions: [],
      count: mainGroupCount,
      ageRange: ageGroups[0]?.ageRange || 'adulte',
      isMain: true
    };
    variantGroups = variants;
  } else {
    // Tout le monde a des restrictions, prendre le plus grand groupe
    variants.sort((a, b) => b.count - a.count);
    mainGroup = {
      ...variants[0],
      isMain: true
    };
    variantGroups = variants.slice(1);
  }
  
  console.log(`📊 Calcul variantes: ${totalPeople} pers. total, ${mainGroupCount} sans restrictions, ${variants.length} variantes`);
  
  return {
    totalPeople,
    mainGroup: mainGroup,
    variantGroups: variantGroups.map((v, index) => ({
      ...v,
      variantId: index + 1,
      name: generateVariantName(v.allergens, v.dietaryRestrictions)
    }))
  };
}

/**
 * Génère un nom pour une variante
 */
function generateVariantName(allergens, restrictions) {
  const parts = [];
  
  if (restrictions && restrictions.length > 0) {
    const restrictionNames = {
      'vegetarien': 'Végétarien',
      'vegan': 'Vegan',
      'sans_gluten': 'Sans gluten',
      'sans_lactose': 'Sans lactose',
      'halal': 'Halal',
      'casher': 'Casher'
    };
    parts.push(...restrictions.map(r => restrictionNames[r] || r));
  }
  
  if (allergens && allergens.length > 0) {
    const allergenNames = {
      'gluten': 'sans gluten',
      'lactose': 'sans lactose',
      'oeufs': 'sans œufs',
      'arachides': 'sans arachides',
      'fruits_a_coque': 'sans fruits à coque',
      'poisson': 'sans poisson'
    };
    parts.push(...allergens.map(a => allergenNames[a] || `sans ${a}`));
  }
  
  return parts.join(' + ') || 'Standard';
}

/**
 * Vérifie si un plat est compatible avec des restrictions/allergènes
 */
function isDishCompatible(dish, allergens = [], dietaryRestrictions = []) {
  // Vérifier les allergènes - DOUBLE VÉRIFICATION (champ + ingrédients)
  const dishAllergens = dish.allergens || [];
  const hasProblematicAllergen = allergens.some(a => dishAllergens.includes(a));
  
  if (hasProblematicAllergen) {
    return false;
  }
  
  // Vérifier aussi dans les ingrédients (comme dans le filtrage principal)
  if (allergens && allergens.length > 0) {
    const ingredients = dish.ingredients || [];
    const ingredientNames = ingredients.map(ing => (ing.name || ing.item || '').toLowerCase()).join(' ');
    
    for (const allergen of allergens) {
      let allergenKeywords = [];
      
      switch(allergen) {
        case 'lactose':
          allergenKeywords = ['lait', 'crème', 'fromage', 'beurre', 'yaourt', 'gorgonzola', 'gruyère', 'parmesan', 'mozzarella', 'chèvre', 'emmental', 'mascarpone', 'ricotta'];
          break;
        case 'gluten':
          allergenKeywords = ['farine', 'pain', 'pâtes', 'blé', 'orge', 'seigle', 'épeautre'];
          break;
        case 'oeufs':
        case 'œufs':
          allergenKeywords = ['œuf', 'oeuf'];
          break;
        case 'poisson':
          allergenKeywords = ['poisson', 'saumon', 'thon', 'cabillaud', 'truite', 'morue', 'sole', 'colin'];
          break;
        case 'crustaces':
        case 'crustacés':
          allergenKeywords = ['crevette', 'crabe', 'homard', 'langouste', 'écrevisse'];
          break;
        case 'fruits_a_coque':
        case 'arachides':
          allergenKeywords = ['noix', 'noisette', 'amande', 'cacahuète', 'cajou', 'pistache'];
          break;
      }
      
      const hasAllergenInIngredients = allergenKeywords.some(keyword => 
        ingredientNames.includes(keyword)
      );
      
      if (hasAllergenInIngredients) {
        return false;
      }
    }
  }
  
  // Vérifier les restrictions alimentaires
  const dishRestrictions = dish.dietaryRestrictions || [];
  const dishIngredients = (dish.ingredients || []).map(ing => (ing.name || ing.item || '').toLowerCase()).join(' ');
  
  for (const restriction of dietaryRestrictions) {
    // Si le plat a déjà le tag de restriction, c'est bon
    if (dishRestrictions.includes(restriction)) {
      continue;
    }
    
    // Sinon, vérifier si le plat est NATURELLEMENT compatible
    switch(restriction) {
      case 'hyposode': // Sans sel
        // Un plat est compatible pour sans sel si :
        // 1. Il a le tag hyposode (déjà vérifié ci-dessus)
        // 2. OU il ne contient pas de sel ajouté (naturellement hyposodé)
        // La plupart des plats peuvent être préparés sans sel ajouté
        // Sauf les charcuteries, fromages salés, plats déjà salés
        const saltyKeywords = ['jambon', 'saucisse', 'charcuterie', 'bacon', 'lardons', 'anchois', 'câpres', 'olives', 'cornichons'];
        const hasSaltyIngredients = saltyKeywords.some(keyword => dishIngredients.includes(keyword));
        if (hasSaltyIngredients) {
          return false; // Plat intrinsèquement salé
        }
        // Sinon, le plat peut être préparé sans sel → compatible
        break;
        
      case 'végétarien':
      case 'vegetarien':
        // Incompatible si contient viande ou poisson
        if (dish.category === 'viande' || dish.category === 'poisson') {
          return false;
        }
        break;
        
      case 'végétalien':
      case 'vegan':
        // Incompatible si contient produits animaux
        if (dish.category === 'viande' || dish.category === 'poisson' || 
            dishAllergens.includes('lactose') || dishAllergens.includes('oeufs')) {
          return false;
        }
        break;
        
      case 'pauvre_en_sucre':
        // Compatible si pas de dessert sucré ou friandises
        const sweetKeywords = ['sucre', 'confiture', 'chocolat', 'caramel', 'miel', 'sirop'];
        const hasSweetIngredients = sweetKeywords.some(keyword => dishIngredients.includes(keyword));
        if (hasSweetIngredients && dish.category === 'dessert') {
          return false; // Dessert sucré incompatible
        }
        break;
        
      // Pour les autres restrictions, si le plat n'a pas le tag, on considère qu'il n'est pas adapté
      default:
        if (!dishRestrictions.includes(restriction)) {
          return false;
        }
    }
  }
  
  return true;
}

/**
 * Trouve un plat de remplacement compatible
 */
async function findReplacementDish(allRecipes, originalDish, allergens, dietaryRestrictions, medicalConditions) {
  // Filtrer les recettes compatibles de la même catégorie
  const compatibleRecipes = allRecipes.filter(recipe => {
    // Même catégorie si possible
    if (recipe.category && originalDish.category && recipe.category !== originalDish.category) {
      return false;
    }
    
    return isDishCompatible(recipe, allergens, dietaryRestrictions);
  });
  
  if (compatibleRecipes.length === 0) {
    console.log(`⚠️ Aucune recette de remplacement trouvée pour "${originalDish.name}"`);
    return null;
  }
  
  // Prendre une recette aléatoire parmi les compatibles
  const replacement = compatibleRecipes[Math.floor(Math.random() * compatibleRecipes.length)];
  console.log(`   ↳ Remplacement: "${originalDish.name}" → "${replacement.name}"`);
  
  return {
    recipeId: replacement._id,
    name: replacement.name,
    category: replacement.category,
    description: replacement.description,
    servings: replacement.servings,
    ingredients: replacement.ingredients,
    instructions: replacement.preparationSteps,
    nutrition: replacement.nutritionalProfile,
    allergens: replacement.allergens,
    dietaryRestrictions: replacement.diet,
    texture: replacement.texture
  };
}

/**
 * Génère un menu avec variantes INTELLIGENTES
 * Réutilise les plats compatibles du menu principal
 */
/**
 * Enrichit un plat avec les quantités d'ingrédients par personne et pour le groupe
 */
function enrichDishWithIngredientQuantities(dish, residentCount) {
  if (!dish || !dish.ingredients || dish.ingredients.length === 0) {
    return dish;
  }
  
  // Récupérer le nombre de personnes de la recette originale (par défaut 4)
  const recipeServings = dish.servings || dish.numberOfPeople || 4;
  
  // Calculer les quantités par personne
  const ingredientsPerPerson = dish.ingredients.map(ing => ({
    name: ing.name || ing.item,
    quantity: parseFloat((ing.quantity / recipeServings).toFixed(2)),
    unit: ing.unit || 'portion'
  }));
  
  // Calculer les quantités pour le groupe entier
  const ingredientsTotal = dish.ingredients.map(ing => ({
    name: ing.name || ing.item,
    quantity: parseFloat(((ing.quantity / recipeServings) * residentCount).toFixed(2)),
    unit: ing.unit || 'portion'
  }));
  
  return {
    ...dish,
    ingredientsPerPerson,
    ingredientsTotal,
    residentCount
  };
}

async function generateMenuWithVariants(
  allRecipes,
  numDishes,
  totalPeople,
  ageGroups,
  variantGroups,
  establishmentType,
  theme,
  globalAllergens,
  globalRestrictions,
  medicalConditions,
  menuStructure = 'plat_seul'
) {
  const { mainGroup, variantGroups: variants } = variantGroups;
  
  console.log(`\n🎯 Génération du menu principal pour ${mainGroup.count} personnes`);
  console.log(`🔄 ${variants.length} variante(s) nécessaire(s)`);
  
  // 1. Générer le menu principal (pour le groupe majoritaire)
  const mainMenuRecipes = await selectMenuWithAI(
    allRecipes,
    numDishes,
    mainGroup.count,
    [{ ageRange: mainGroup.ageRange, count: mainGroup.count }],
    establishmentType,
    theme,
    mainGroup.allergens || [],
    mainGroup.dietaryRestrictions || [],
    medicalConditions,
    menuStructure
  );
  
  // 2. Générer les variantes INTELLIGEMMENT (réutiliser les plats compatibles)
  const generatedVariants = [];
  const compatibleProfiles = []; // Profils 100% compatibles avec le menu principal
  let mainMenuTotalCount = mainGroup.count;
  
  for (const variant of variants) {
    console.log(`\n🔄 Analyse variante "${variant.name}" pour ${variant.count} personnes`);
    
    const variantDishes = [];
    const replacedDishes = [];
    const reusedDishes = [];
    
    // Pour chaque plat du menu principal, vérifier s'il est compatible
    for (const mainDish of mainMenuRecipes.dishes) {
      const isCompatible = isDishCompatible(
        mainDish,
        variant.allergens || [],
        variant.dietaryRestrictions || []
      );
      
      if (isCompatible) {
        // ✅ Plat compatible → Réutiliser
        console.log(`   ✅ "${mainDish.name}" compatible → Réutilisé`);
        variantDishes.push(mainDish);
        reusedDishes.push(mainDish.name);
      } else {
        // ❌ Plat incompatible → Trouver un remplacement
        console.log(`   ❌ "${mainDish.name}" incompatible → Remplacement nécessaire`);
        const replacement = await findReplacementDish(
          allRecipes,
          mainDish,
          variant.allergens || [],
          variant.dietaryRestrictions || [],
          medicalConditions
        );
        
        if (replacement) {
          variantDishes.push(replacement);
          replacedDishes.push({ original: mainDish.name, replacement: replacement.name });
        } else {
          // Si pas de remplacement trouvé, ne pas inclure ce plat
          console.log(`   ⚠️ Pas de remplacement pour "${mainDish.name}" - plat omis`);
        }
      }
    }
    
    // NOUVELLE LOGIQUE : Si TOUS les plats sont identiques, fusionner avec le menu principal
    if (replacedDishes.length === 0 && reusedDishes.length === mainMenuRecipes.dishes.length) {
      console.log(`   ✨ 100% compatible → Fusionné avec le menu principal (+${variant.count} pers.)`);
      compatibleProfiles.push({
        name: variant.name,
        count: variant.count,
        allergens: variant.allergens,
        dietaryRestrictions: variant.diet
      });
      mainMenuTotalCount += variant.count;
    } else {
      // Sinon, créer une variante réelle
      const adaptationMessage = `Menu adapté pour ${variant.count} personne(s) : ${reusedDishes.length} plat(s) identique(s) au menu principal, ${replacedDishes.length} plat(s) remplacé(s).`;
      
      generatedVariants.push({
        variantId: variant.variantId,
        name: variant.name,
        count: variant.count,
        allergens: variant.allergens,
        dietaryRestrictions: variant.diet,
        dishes: variantDishes,
        ageAdaptation: adaptationMessage,
        reusedDishes: reusedDishes,
        replacedDishes: replacedDishes
      });
      
      console.log(`   📊 Résumé: ${reusedDishes.length} réutilisés, ${replacedDishes.length} remplacés`);
    }
  }
  
  console.log(`\n✅ Menu principal étendu à ${mainMenuTotalCount} personnes (inclus ${compatibleProfiles.length} profil(s) compatible(s))`);
  console.log(`🔄 ${generatedVariants.length} variante(s) réelle(s) nécessaire(s)`);
  
  // ✨ ENRICHIR TOUS LES PLATS avec quantités d'ingrédients par personne ET pour le groupe
  const enrichedMainDishes = mainMenuRecipes.dishes.map(dish => 
    enrichDishWithIngredientQuantities(dish, mainMenuTotalCount)
  );
  
  const enrichedVariants = generatedVariants.map(variant => ({
    ...variant,
    dishes: variant.dishes.map(dish => enrichDishWithIngredientQuantities(dish, variant.count))
  }));
  
  return {
    title: mainMenuRecipes.title,
    description: mainMenuRecipes.description,
    mainMenu: {
      count: mainMenuTotalCount,
      originalCount: mainGroup.count,
      dishes: enrichedMainDishes,
      ageAdaptation: mainMenuRecipes.ageAdaptation,
      compatibleWith: compatibleProfiles
    },
    variants: enrichedVariants
  };
}

/**
 * Génère la liste de courses pour un menu avec variantes
 */
function generateShoppingListForVariants(menuWithVariants) {
  const ingredientMap = new Map();
  
  // Ajouter les ingrédients du menu principal
  const mainDishes = menuWithVariants.mainMenu.dishes || [];
  mainDishes.forEach(dish => {
    (dish.ingredients || []).forEach(ing => {
      const key = ing.name.toLowerCase();
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key);
        existing.quantity += ing.quantity;
        existing.requiredFor.add(dish.name);
      } else {
        ingredientMap.set(key, {
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
          requiredFor: new Set([dish.name])
        });
      }
    });
  });
  
  // Ajouter les ingrédients des variantes
  (menuWithVariants.variants || []).forEach(variant => {
    variant.dishes.forEach(dish => {
      (dish.ingredients || []).forEach(ing => {
        const key = ing.name.toLowerCase();
        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          existing.quantity += ing.quantity;
          existing.requiredFor.add(`${dish.name} (${variant.name})`);
        } else {
          ingredientMap.set(key, {
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            requiredFor: new Set([`${dish.name} (${variant.name})`])
          });
        }
      });
    });
  });
  
  // Convertir en tableau
  return Array.from(ingredientMap.values()).map(item => ({
    name: item.name,
    quantity: Math.round(item.quantity * 10) / 10,
    unit: item.unit,
    requiredFor: Array.from(item.requiredFor)
  }));
}

/**
 * Génère un menu intelligent basé sur les profils de résidents
 * avec croisement automatique des paramètres médicaux
 */
export const generateMenuForResidents = asyncHandler(async (req, res) => {
  const {
    residentIds,
    numDishes = 2,
    menuStructure = 'entree_plat',
    useStockOnly = false,
    theme
  } = req.body;

  try {
    // ✅ CORRECTION : Utiliser siteId au lieu de establishment
    if (!req.user.siteId) {
      return res.status(400).json({
        success: false,
        message: 'Utilisateur non associé à un site'
      });
    }

    // 1. Récupérer les résidents
    const residents = await Resident.find({
      _id: { $in: residentIds },
      siteId: req.user.siteId, // ✅ CORRECTION : Utiliser siteId au lieu de establishment
      status: 'actif'
    });

    if (residents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun résident valide trouvé. Vérifiez que les résidents sélectionnés appartiennent à votre site et sont actifs.'
      });
    }

    // 2. Analyser les profils médicaux pour créer les groupes
    const medicalGroups = new Map();
    
    residents.forEach(resident => {
      // ✅ CORRECTION : Utiliser nutritionalProfile au lieu de medicalProfile
      const profile = resident.nutritionalProfile || {};
      
      // ✅ CORRECTION : Mapper la structure nutritionalProfile vers le format attendu
      const medicalConditions = (profile.medicalConditions || []).map(c => c.condition || c);
      const allergens = (profile.allergies || []).map(a => a.allergen || a);
      // Extraire les restrictions et les normaliser pour correspondre à la base de données
      const rawDietaryRestrictions = (profile.dietaryRestrictions || []).map(r => r.restriction || r);
      const dietaryRestrictions = normalizeDietaryRestrictions(rawDietaryRestrictions);
      // ✅ SIMPLIFICATION : Filtrer les restrictions éthiques/religieuses directement depuis le profile
      const ethicalRestrictions = (profile.dietaryRestrictions || [])
        .filter(dr => dr.type === 'éthique' || dr.type === 'religieuse')
        .map(dr => normalizeDietaryRestrictions([dr.restriction || dr])[0]);
      const texture = profile.texturePreferences?.consistency || 'iddsi_7';
      const swallowing = profile.texturePreferences?.difficulty || 'aucune';
      
      // Créer une clé unique pour le profil médical
      const profileKey = JSON.stringify({
        medical: medicalConditions.sort(),
        texture: texture,
        swallowing: swallowing,
        nutrition: [], // Pas de champ direct dans nutritionalProfile
        ethical: ethicalRestrictions.sort(),
        allergens: allergens.sort(),
        comfort: [], // Pas de champ direct dans nutritionalProfile
        ageGroup: 'personne_agee_autonome' // Valeur par défaut pour EHPAD
      });
      
      if (medicalGroups.has(profileKey)) {
        medicalGroups.get(profileKey).count++;
        medicalGroups.get(profileKey).residents.push(resident);
      } else {
        // ✅ CORRECTION : Stocker les données mappées au lieu du profile brut
        medicalGroups.set(profileKey, {
          count: 1,
          residents: [resident],
          profile: {
            medical: medicalConditions,
            texture: texture,
            swallowing: swallowing,
            nutrition: [],
            ethical: ethicalRestrictions,
            allergens: allergens,
            comfort: [],
            ageGroup: 'personne_agee_autonome'
          },
          nutritionalProfile: profile // Garder aussi le profile original pour référence
        });
      }
    });

    // 3. Convertir en format pour la génération de menu
    const ageGroups = Array.from(medicalGroups.values()).map(group => ({
      ageRange: 'adulte',
      count: group.count,
      menuStructure: menuStructure,
      medicalConditions: group.profile.medical || [],
      allergens: group.profile.allergens || [],
      dietaryRestrictions: [
        ...(group.profile.nutrition || []),
        ...(group.profile.ethical || [])
      ],
      texture: group.profile.texture || 'iddsi_7',
      swallowing: group.profile.swallowing || 'aucune',
      nutritionalProfile: group.profile.nutrition || [],
      ethicalRestrictions: group.profile.ethical || [],
      ageDependencyGroup: group.profile.ageGroup || 'personne_agee_autonome',
      comfortFilters: group.profile.comfort || []
    }));

    // 4. Calculer les groupes de variantes AVANT de chercher les recettes
    // ✅ CORRECTION : Calculer les variantGroups d'abord pour comprendre la structure
    const variantGroups = calculateVariantGroups(ageGroups);
    console.log(`📊 ${ageGroups.length} groupe(s) de profils similaires identifié(s)`);
    console.log(`📊 Groupes de variantes:`, JSON.stringify(variantGroups, null, 2));

    // 5. ✅ CORRECTION : Récupérer un pool large de recettes compatibles avec AU MOINS UN groupe
    // Au lieu de combiner toutes les restrictions, on récupère les recettes qui peuvent
    // satisfaire au moins un des groupes de résidents
    const totalPeople = ageGroups.reduce((sum, group) => sum + group.count, 0);
    const majorityAgeGroup = 'adulte'; // Tous les résidents sont des adultes

    // Collecter TOUS les allergènes de TOUS les groupes (pour exclusion globale)
    const allAllergens = [...new Set(ageGroups.flatMap(g => g.allergens || []))];
    
    // Construire un filtre plus permissif : recettes qui ne contiennent AUCUN allergène
    // et qui peuvent satisfaire au moins un groupe
    const recipeFilter = {
      // Exclure les recettes contenant des allergènes présents dans n'importe quel groupe
      allergens: { $nin: allAllergens }
    };

    // ✅ NOUVELLE LOGIQUE : Construire un filtre permissif qui trouve des recettes
    // compatibles avec AU MOINS UN groupe, en utilisant une logique OR globale
    
    // Filtrer par type d'établissement
    recipeFilter.establishmentTypes = { $in: ['maison_retraite', 'ehpad', 'hopital'] };
    
    // Construire des conditions OR globales : une recette est compatible si elle
    // satisfait AU MOINS UNE des restrictions/conditions de n'importe quel groupe
    const orConditions = [];
    
    // Collecter toutes les restrictions de tous les groupes
    const allDietaryRestrictions = [...new Set(ageGroups.flatMap(g => g.dietaryRestrictions || []))];
    const allEthicalRestrictions = [...new Set(ageGroups.flatMap(g => g.ethicalRestrictions || []))];
    const allMedicalConditions = [...new Set(ageGroups.flatMap(g => g.medicalConditions || []))];
    const allTextures = [...new Set(ageGroups.map(g => g.texture).filter(t => t && t !== 'iddsi_7' && t !== 'normale'))];
    
    // ✅ NORMALISATION : Normaliser les restrictions pour correspondre à la base de données
    const normalizedDietaryRestrictions = normalizeDietaryRestrictions(allDietaryRestrictions);
    const normalizedEthicalRestrictions = normalizeDietaryRestrictions(allEthicalRestrictions);
    
    // ✅ NOUVEAU : Séparer les restrictions "sans sel" qui sont compatibles avec les recettes normales
    const hasHyposode = normalizedDietaryRestrictions.includes('hyposode');
    const dietaryRestrictionsWithoutHyposode = normalizedDietaryRestrictions.filter(r => r !== 'hyposode');
    
    console.log(`🔄 Restrictions normalisées:`, normalizedDietaryRestrictions);
    console.log(`🔄 Restrictions éthiques normalisées:`, normalizedEthicalRestrictions);
    if (hasHyposode) {
      console.log(`⚠️ "Sans sel" détecté : les recettes normales seront compatibles avec un warning`);
    }
    if (allTextures.length > 0) {
      console.log(`⚠️ Textures spécifiques détectées : les recettes normales seront compatibles avec un message d'adaptation`);
    }
    
    // Restrictions alimentaires (sans "sans sel" qui sera géré différemment)
    if (dietaryRestrictionsWithoutHyposode.length > 0) {
      orConditions.push(
        { diet: { $in: dietaryRestrictionsWithoutHyposode } },
        { dietaryRestrictions: { $in: dietaryRestrictionsWithoutHyposode } }
      );
    }
    
    // Restrictions éthiques/religieuses : chercher dans 'diet' ET 'dietaryRestrictions'
    if (normalizedEthicalRestrictions.length > 0) {
      orConditions.push(
        { diet: { $in: normalizedEthicalRestrictions } },
        { dietaryRestrictions: { $in: normalizedEthicalRestrictions } }
      );
    }
    
    // Conditions médicales
    if (allMedicalConditions.length > 0) {
      orConditions.push({ pathologies: { $in: allMedicalConditions } });
    }
    
    // ✅ NOUVEAU : Ne PAS filtrer par texture - toutes les recettes sont compatibles
    // (on ajoutera un message d'adaptation dans les métadonnées)
    // Les textures spécifiques seront gérées via des warnings dans les métadonnées
    
    // Si on a des conditions OR, les ajouter au filtre
    // Si aucune condition spécifique, on prend toutes les recettes sans allergènes
    // (déjà filtrées par establishmentTypes)
    if (orConditions.length > 0) {
      recipeFilter.$or = orConditions;
    }
    
    // ✅ NOUVEAU : Si on a seulement "sans sel" ou textures, on prend toutes les recettes
    // (les warnings seront ajoutés dans les métadonnées)
    if (orConditions.length === 0 && (hasHyposode || allTextures.length > 0)) {
      // Pas de filtre OR, on prend toutes les recettes sans allergènes
      // (déjà filtrées par establishmentTypes)
    }

    // 6. Récupérer les recettes compatibles (pool large)
    let compatibleRecipes = await RecipeEnriched.find(recipeFilter);
    console.log(`🔍 ${compatibleRecipes.length} recettes potentiellement compatibles trouvées (pool large)`);

    // 7. Filtrer par tranche d'âge si nécessaire
    compatibleRecipes = filterRecipesByAgeGroup(compatibleRecipes, majorityAgeGroup);
    console.log(`🔍 ${compatibleRecipes.length} recettes après filtrage par âge`);

    // 8. Filtrage spécifique pour les personnes âgées
    compatibleRecipes = filterRecipesForSeniors(compatibleRecipes);
    console.log(`👴 ${compatibleRecipes.length} recettes adaptées aux seniors après filtrage`);

    // 9. ✅ FALLBACK : Si aucune recette trouvée, essayer sans restrictions (sauf allergènes)
    if (compatibleRecipes.length === 0) {
      console.log(`⚠️ Aucune recette trouvée avec les restrictions, essai sans restrictions (sauf allergènes)`);
      const fallbackFilter = {
        allergens: { $nin: allAllergens },
        establishmentTypes: { $in: ['maison_retraite', 'ehpad', 'hopital'] }
      };
      compatibleRecipes = await RecipeEnriched.find(fallbackFilter);
      compatibleRecipes = filterRecipesByAgeGroup(compatibleRecipes, majorityAgeGroup);
      compatibleRecipes = filterRecipesForSeniors(compatibleRecipes);
      console.log(`🔍 ${compatibleRecipes.length} recettes trouvées avec le filtre de secours`);
      
      if (compatibleRecipes.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Aucune recette compatible trouvée. Vérifiez que la base de données contient des recettes pour EHPAD et que les allergènes des résidents sont correctement renseignés.`
        });
      }
    }
    
    if (compatibleRecipes.length < numDishes) {
      console.log(`⚠️ Attention: ${compatibleRecipes.length} recettes compatibles trouvées pour ${numDishes} plats demandés.`);
      console.log(`   L'IA réutilisera certaines recettes ou adaptera le menu.`);
    }

    // 10. Si useStockOnly, vérifier la disponibilité en stock
    let stockItems = [];
    if (useStockOnly) {
      stockItems = await Stock.find({ userId: req.user._id });
      compatibleRecipes = filterRecipesByStock(compatibleRecipes, stockItems);
      console.log(`🔍 ${compatibleRecipes.length} recettes disponibles avec le stock`);
    }

    // 11. ✅ CORRECTION : Préparer les données globales pour generateMenuWithVariants
    // Les allergènes globaux sont ceux de TOUS les groupes (pour exclusion)
    const globalAllergens = allAllergens;
    const globalRestrictions = [...new Set(ageGroups.flatMap(g => g.dietaryRestrictions || []))];
    const globalMedicalConditions = [...new Set(ageGroups.flatMap(g => g.medicalConditions || []))];

    // 12. Générer le menu principal et les variantes pour chaque groupe
    console.log(`🎯 Génération du menu avec ${compatibleRecipes.length} recettes compatibles`);
    console.log(`🎯 Nombre de plats demandés: ${numDishes}`);
    console.log(`🎯 Nombre total de convives: ${totalPeople}`);
    console.log(`🎯 ${ageGroups.length} groupe(s) de profils à gérer`);
    
    const menuWithVariants = await generateMenuWithVariants(
      compatibleRecipes,
      numDishes,
      totalPeople,
      ageGroups,
      variantGroups,
      'maison_retraite',
      theme,
      globalAllergens,
      globalRestrictions,
      globalMedicalConditions,
      menuStructure
    );
    
    console.log(`✅ Menu généré avec succès: ${menuWithVariants.title}`);

    // 13. Générer la liste de courses globale
    const shoppingList = generateShoppingListForVariants(menuWithVariants);

    // 14. ✅ NOUVEAU : Préparer les warnings pour "sans sel" et textures
    const warnings = [];
    const adaptations = [];
    
    // Warnings pour "sans sel"
    if (hasHyposode) {
      // Trouver les groupes qui ont "hyposode" dans leurs restrictions
      const hyposodeGroups = ageGroups.filter(g => {
        const groupRestrictions = g.dietaryRestrictions || [];
        return groupRestrictions.includes('hyposode');
      });
      if (hyposodeGroups.length > 0) {
        const hyposodeCount = hyposodeGroups.reduce((sum, g) => sum + g.count, 0);
        warnings.push({
          type: 'hyposode',
          message: `⚠️ ATTENTION : ${hyposodeCount} résident(s) nécessitent un régime sans sel. Ne pas ajouter de sel lors de la préparation des plats.`,
          affectedResidents: hyposodeCount,
          groups: hyposodeGroups.map(g => ({
            count: g.count,
            restrictions: g.dietaryRestrictions || []
          }))
        });
      }
    }
    
    // Adaptations pour textures
    if (allTextures.length > 0) {
      const textureGroups = ageGroups.filter(g => 
        g.texture && g.texture !== 'iddsi_7' && g.texture !== 'normale'
      );
      if (textureGroups.length > 0) {
        textureGroups.forEach(group => {
          const textureLabel = getTextureLabel(group.texture);
          adaptations.push({
            type: 'texture',
            texture: group.texture,
            textureLabel: textureLabel,
            message: `🔄 ADAPTATION : Pour ${group.count} résident(s) nécessitant une texture "${textureLabel}", mixer la recette jusqu'à obtention de la texture souhaitée.`,
            affectedResidents: group.count,
            group: {
              count: group.count,
              texture: group.texture
            }
          });
        });
      }
    }

    res.status(200).json({
      success: true,
      menu: {
        title: menuWithVariants.title,
        description: menuWithVariants.description,
        mainMenu: menuWithVariants.mainMenu,
        variants: menuWithVariants.variants,
        shoppingList: shoppingList,
        metadata: {
          establishmentType: 'maison_retraite',
          totalPeople,
          ageGroups,
          residents: residents.map(r => ({
            id: r._id,
            name: `${r.firstName} ${r.lastName}`,
            room: r.roomNumber,
            nutritionalProfile: r.nutritionalProfile // ✅ CORRECTION : Utiliser nutritionalProfile
          })),
          medicalGroups: Array.from(medicalGroups.values()).map(group => ({
            count: group.count,
            profile: group.profile,
            residents: group.residents.map(r => `${r.firstName} ${r.lastName}`)
          })),
          allergens: globalAllergens,
          dietaryRestrictions: globalRestrictions,
          medicalConditions: globalMedicalConditions,
          texture: ageGroups[0]?.texture || 'iddsi_7',
          warnings: warnings, // ✅ NOUVEAU : Warnings pour "sans sel"
          adaptations: adaptations // ✅ NOUVEAU : Adaptations pour textures
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la génération du menu pour les résidents:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la génération du menu intelligent pour les résidents' 
    });
  }
});

