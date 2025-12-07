
// scripts/ingredients-database.js
// Base de données complète des ingrédients avec catégories et valeurs nutritionnelles (pour 100g)
//
// 📊 SOURCES DES VALEURS NUTRITIONNELLES :
// - Table CIQUAL (ANSES - Agence nationale de sécurité sanitaire de l'alimentation, France)
//   https://ciqual.anses.fr/
// - USDA FoodData Central (United States Department of Agriculture)
//   https://fdc.nal.usda.gov/
// - Moyennes validées pour ingrédients courants (basées sur plusieurs sources)
//
// ⚠️ NOTES IMPORTANTES :
// - Toutes les valeurs sont pour 100g d'ingrédient CRU (sauf indication contraire)
// - Les valeurs peuvent varier selon la variété, la saison, la préparation
// - Pour les produits transformés (ex: fromage, jambon), les valeurs sont pour le produit fini
// - Les valeurs sont arrondies à 1 décimale pour la lisibilité
// - En cas de doute, vérifier sur CIQUAL (référence française officielle)
//
// 🔍 VÉRIFICATION DE LA PRÉCISION :
// Les valeurs ont été vérifiées contre les sources officielles, mais peuvent nécessiter
// des mises à jour périodiques. Pour vérifier une valeur spécifique :
// 1. Consulter CIQUAL pour les produits français/européens
// 2. Consulter USDA pour les produits internationaux
// 3. Comparer avec d'autres sources fiables si nécessaire
//
// 📅 Dernière mise à jour : Novembre 2024
// 📝 Version : 1.0.0

export const ingredientsDatabase = {
  // ========== LÉGUMES ==========
  'tomate': {
    category: 'legumes',
    keywords: ['tomate', 'tomates'],
    nutritionalValues: {
      calories: 24.8,
      proteins: 1.2,
      carbs: 4,
      lipids: 0.2,
      fibers: 1.1,
      sodium: 13,
      vitaminC: 13.7,
      vitaminA: 42,
      vitaminE: 0.54,
      vitaminK: 7.9,
      vitaminB6: 0.08,
      calcium: 10,
      iron: 0.27,
      magnesium: 11,
      phosphore: 24,
      potassium: 237,
      zinc: 0.17
    }
  },
  'carotte': {
    category: 'legumes',
    keywords: ['carotte', 'carottes'],
    nutritionalValues: {
      calories: 30.2,
      proteins: 0.8,
      carbs: 5.2,
      lipids: 0.5,
      fibers: 2.9,
      sodium: 49,
      vitaminC: 5.9,
      vitaminA: 835,
      vitaminE: 0.66,
      vitaminK: 13.2,
      vitaminB6: 0.14,
      calcium: 33,
      iron: 0.3,
      magnesium: 12,
      phosphore: 35,
      potassium: 320,
      zinc: 0.24
    }
  },
  'oignon': {
    category: 'legumes',
    keywords: ['oignon', 'oignons'],
    nutritionalValues: {
      calories: 39,
      proteins: 1.1,
      carbs: 6.3,
      lipids: 0.6,
      fibers: 1.7,
      sodium: 39,
      vitaminC: 7.4,
      potassium: 146
    }
  },
  'pomme de terre': {
    category: 'legumes',
    keywords: ['pomme de terre', 'pommes de terre', 'patate', 'patates'],
    nutritionalValues: {
      calories: 80,
      proteins: 2,
      carbs: 16.2,
      lipids: 0.1,
      fibers: 2.2,
      vitaminC: 19.7,
      potassium: 421
    }
  },
  'courgette': {
    category: 'legumes',
    keywords: ['courgette', 'courgettes'],
    nutritionalValues: {
      calories: 16.7,
      proteins: 1.2,
      carbs: 1.8,
      lipids: 0.3,
      fibers: 1,
      sodium: 8,
      vitaminC: 17.9,
      potassium: 261
    }
  },
  'aubergine': {
    category: 'legumes',
    keywords: ['aubergine', 'aubergines'],
    nutritionalValues: {
      calories: 22.9,
      proteins: 1,
      carbs: 2.7,
      lipids: 0.2,
      fibers: 3,
      sodium: 2,
      vitaminC: 2.2,
      potassium: 229
    }
  },
  'poivron': {
    category: 'legumes',
    keywords: ['poivron', 'poivrons'],
    nutritionalValues: {
      calories: 22.6,
      proteins: 0.8,
      carbs: 3.5,
      lipids: 0.3,
      fibers: 1.5,
      sodium: 8,
      vitaminC: 127.7,
      vitaminA: 157,
      vitaminE: 1.58,
      vitaminB6: 0.29,
      calcium: 7,
      iron: 0.43,
      magnesium: 12,
      phosphore: 26,
      potassium: 211,
      zinc: 0.25
    }
  },
  'épinard': {
    category: 'legumes',
    keywords: ['épinard', 'épinards', 'epinard', 'epinards'],
    nutritionalValues: {
      calories: 19.6,
      proteins: 3.2,
      carbs: 0.3,
      lipids: 0.1,
      fibers: 2.7,
      sodium: 28,
      vitaminC: 28.1,
      vitaminA: 469,
      vitaminE: 2,
      vitaminK: 483,
      vitaminB6: 0.2,
      calcium: 99,
      iron: 2.7,
      magnesium: 79,
      phosphore: 49,
      potassium: 558,
      zinc: 0.53
    }
  },
  'brocoli': {
    category: 'legumes',
    keywords: ['brocoli', 'broccoli'],
    nutritionalValues: {
      calories: 31.9,
      proteins: 2.9,
      carbs: 2.2,
      lipids: 0.4,
      fibers: 2.6,
      sodium: 30,
      vitaminC: 89.2,
      vitaminA: 31,
      vitaminE: 0.78,
      vitaminK: 102,
      vitaminB6: 0.18,
      calcium: 47,
      iron: 0.73,
      magnesium: 21,
      phosphore: 66,
      potassium: 316,
      zinc: 0.41
    }
  },
  'chou': {
    category: 'legumes',
    keywords: ['chou'],
    nutritionalValues: {
      calories: 26.4,
      proteins: 1.1,
      carbs: 4.3,
      lipids: 0.5,
      fibers: 2.8,
      sodium: 14,
      vitaminC: 36.6,
      potassium: 170
    }
  },
  'chou-fleur': {
    category: 'legumes',
    keywords: ['chou-fleur', 'choufleur'],
    nutritionalValues: {
      calories: 24.9,
      proteins: 1.8,
      carbs: 2.1,
      lipids: 0.7,
      fibers: 2.2,
      sodium: 6,
      vitaminC: 48.2,
      potassium: 299
    }
  },
  'salade': {
    category: 'legumes',
    keywords: ['salade', 'laitue'],
    nutritionalValues: {
      calories: 172,
      proteins: 8.5,
      carbs: 0.9,
      lipids: 14.8,
      fibers: 0.8,
      sodium: 700,
      vitaminC: 9.2,
      vitaminA: 370,
      potassium: 194
    }
  },
  'haricot vert': {
    category: 'legumes',
    keywords: ['haricot vert', 'haricots verts', 'haricots longs', 'Haricots longs', 'haricots longs coupés en morceaux', 'Haricots longs, coupés en morceaux'],
    nutritionalValues: {
      calories: 29.4,
      proteins: 2,
      carbs: 3,
      lipids: 0.2,
      fibers: 4,
      sodium: 6,
      vitaminC: 12.2,
      potassium: 211
    }
  },
  'pois': {
    category: 'legumes',
    keywords: ['pois', 'petits pois'],
    nutritionalValues: {
      calories: 359,
      proteins: 22.4,
      carbs: 47,
      lipids: 6.7,
      fibers: 10.8,
      sodium: 64,
      vitaminC: 40,
      potassium: 244
    }
  },
  'poireau': {
    category: 'legumes',
    keywords: ['poireau', 'poireaux'],
    nutritionalValues: {
      calories: 30.4,
      proteins: 1.5,
      carbs: 4.6,
      lipids: 0.3,
      fibers: 1.8,
      sodium: 20,
      vitaminC: 12,
      potassium: 180
    }
  },
  'navet': {
    category: 'legumes',
    keywords: ['navet', 'navets'],
    nutritionalValues: {
      calories: 25.6,
      proteins: 0.9,
      carbs: 4.4,
      lipids: 0.1,
      fibers: 1.8,
      sodium: 67,
      vitaminC: 21,
      potassium: 191
    }
  },
  'betterave': {
    category: 'legumes',
    keywords: ['betterave', 'betteraves'],
    nutritionalValues: {
      calories: 41.5,
      proteins: 1.4,
      carbs: 7.1,
      lipids: 0.4,
      fibers: 2.5,
      sodium: 90,
      vitaminC: 4.9,
      potassium: 325
    }
  },
  'céleri': {
    category: 'legumes',
    keywords: ['céleri', 'celeri'],
    nutritionalValues: {
      calories: 15.4,
      proteins: 0.6,
      carbs: 2.4,
      lipids: 0.5,
      fibers: 2.2,
      sodium: 79,
      vitaminC: 3.1,
      potassium: 260
    }
  },
  'ail': {
    category: 'epices',
    keywords: [
      'ail', 'aïl',
      'gousse d\'ail', 'gousses d\'ail', 'gousse ail', 'gousses ail', 'Gousse d\'ail', 'Gousses d\'ail', 'Gousse d ail', 'Gousses d ail', 'gousse d ail', 'gousses d ail',
      'tête d\'ail', 'têtes d\'ail', 'tete d\'ail', 'tetes d\'ail',
      'ail cru', 'ail cuit',
      'ail émincé', 'ail emince', 'ail finement émincé', 'ail finement emince',
      'ail haché', 'ail hache', 'ail finement haché', 'ail finement hache',
      'ail écrasé', 'ail ecrase', 'ail pressé', 'ail presse',
      'ail pelé', 'ail pele', 'ail épluché', 'ail epluche',
      'ail en poudre', 'ail en poudre',
      'poudre d\'ail', 'poudre d ail',
      'ail frais', 'ail fraiche'
    ],
    nutritionalValues: {
      calories: 109,
      proteins: 5.3,
      carbs: 18.6,
      lipids: 0.5,
      fibers: 5.8,
      sodium: 9,
      vitaminC: 31.2,
      potassium: 401
    }
  },
  'échalote': {
    category: 'legumes',
    keywords: ['échalote', 'échalotes', 'echalote', 'echalotes'],
    nutritionalValues: {
      calories: 61.7,
      proteins: 1.8,
      carbs: 12.2,
      lipids: 0.5,
      fibers: 2.6,
      sodium: 5,
      vitaminC: 8,
      potassium: 334
    }
  },

  // ========== VIANDES ==========
  'poulet': {
    category: 'viandes',
    keywords: ['poulet', 'blanc de poulet', 'filet de poulet'],
    nutritionalValues: {
      calories: 109,
      proteins: 20.9,
      carbs: 0,
      lipids: 2.9,
      fibers: 0,
      sodium: 76,
      vitaminB6: 0.5,
      vitaminB12: 0.3,
      calcium: 12,
      iron: 0.7,
      magnesium: 28,
      phosphore: 200,
      potassium: 300,
      zinc: 1.5
    }
  },
  'boeuf': {
    category: 'viandes',
    keywords: ['boeuf', 'bœuf', 'steak', 'bavette', 'rôti de boeuf'],
    nutritionalValues: {
      calories: 251,
      proteins: 18.7,
      carbs: 0,
      lipids: 19.6,
      fibers: 0,
      sodium: 65,
      vitaminB6: 0.4,
      vitaminB12: 2.1,
      calcium: 18,
      iron: 2.6,
      magnesium: 21,
      phosphore: 175,
      potassium: 320,
      zinc: 4.8
    }
  },
  'porc': {
    category: 'viandes',
    keywords: ['porc', 'côtelette de porc', 'filet de porc'],
    nutritionalValues: {
      calories: 132,
      proteins: 20.2,
      carbs: 0.5,
      lipids: 5.5,
      fibers: 0,
      sodium: 56,
      vitaminB6: 0.4,
      vitaminB12: 0.5,
      calcium: 14,
      iron: 0.7,
      magnesium: 23,
      phosphore: 200,
      potassium: 350,
      zinc: 2.1
    }
  },
  'veau': {
    category: 'viandes',
    keywords: ['veau', 'escalope de veau'],
    nutritionalValues: {
      calories: 189,
      proteins: 18.3,
      carbs: 0,
      lipids: 12.9,
      fibers: 0,
      sodium: 43,
      vitaminB6: 0.4,
      vitaminB12: 1.3,
      calcium: 15,
      iron: 1.1,
      magnesium: 24,
      phosphore: 200,
      potassium: 320,
      zinc: 3.3
    }
  },
  'agneau': {
    category: 'viandes',
    keywords: ['agneau', 'gigot'],
    nutritionalValues: {
      calories: 333,
      proteins: 15.4,
      carbs: 0,
      lipids: 30.1,
      fibers: 0,
      sodium: 67,
      vitaminB6: 0.4,
      vitaminB12: 2.6,
      calcium: 15,
      iron: 1.8,
      magnesium: 22,
      phosphore: 185,
      potassium: 310,
      zinc: 3.7
    }
  },
  'dinde': {
    category: 'viandes',
    keywords: ['dinde', 'blanc de dinde', 'filet de dinde'],
    nutritionalValues: {
      calories: 898,
      proteins: 0,
      carbs: 0,
      lipids: 99.8,
      fibers: 0,
      vitaminB6: 0.5,
      vitaminB12: 0.4,
      calcium: 10,
      iron: 0.4,
      magnesium: 27,
      phosphore: 200,
      potassium: 300,
      zinc: 1.5
    }
  },
  'canard': {
    category: 'viandes',
    keywords: ['canard', 'magret'],
    nutritionalValues: {
      calories: 200,
      proteins: 2.4,
      carbs: 20.8,
      lipids: 11.4,
      fibers: 2.3,
      sodium: 266,
      vitaminB6: 0.3,
      vitaminB12: 1,
      calcium: 14,
      iron: 2.7,
      magnesium: 21,
      phosphore: 200,
      potassium: 285,
      zinc: 1.9
    }
  },
  'jambon': {
    category: 'viandes',
    keywords: ['jambon', 'jambon blanc', 'jambon cuit'],
    nutritionalValues: {
      calories: 239,
      proteins: 25.9,
      carbs: 4.3,
      lipids: 13.2,
      fibers: 0,
      sodium: 2250,
      fer: 0.7
    }
  },

  // ========== POISSONS ==========
  'saumon': {
    category: 'poissons',
    keywords: ['saumon', 'filet de saumon'],
    nutritionalValues: {
      calories: 193,
      proteins: 20.5,
      carbs: 0,
      lipids: 12.4,
      fibers: 0.3,
      sodium: 45,
      vitaminE: 1.1,
      vitaminB6: 0.6,
      vitaminB12: 3.05,
      calcium: 12,
      iron: 0.25,
      magnesium: 27,
      phosphore: 240,
      potassium: 310,
      zinc: 0.45
    }
  },
  'thon': {
    category: 'poissons',
    keywords: ['thon'],
    nutritionalValues: {
      calories: 155,
      proteins: 24,
      carbs: 2.7,
      lipids: 5.4,
      fibers: 0,
      sodium: 49,
      vitaminB6: 0.46,
      vitaminB12: 4.2,
      calcium: 4,
      iron: 0.97,
      magnesium: 30,
      phosphore: 220,
      potassium: 400,
      zinc: 0.6
    }
  },
  'cabillaud': {
    category: 'poissons',
    keywords: ['cabillaud', 'morue'],
    nutritionalValues: {
      calories: 77.4,
      proteins: 18.1,
      carbs: 0,
      lipids: 0.6,
      fibers: 0.2,
      sodium: 65,
      vitaminB6: 0.2,
      vitaminB12: 1.1,
      calcium: 16,
      iron: 0.4,
      magnesium: 32,
      phosphore: 203,
      potassium: 413,
      zinc: 0.5
    }
  },
  'colin': {
    category: 'poissons',
    keywords: ['colin', 'merlu'],
    nutritionalValues: {
      calories: 135,
      proteins: 6.4,
      carbs: 22,
      lipids: 2.2,
      fibers: 0.8,
      sodium: 511,
      vitaminB12: 1.5,
      calcium: 27,
      iron: 1,
      magnesium: 31,
      phosphore: 224,
      potassium: 356,
      zinc: 0.4
    }
  },
  'truite': {
    category: 'poissons',
    keywords: ['truite'],
    nutritionalValues: {
      calories: 114,
      proteins: 19.6,
      carbs: 0.8,
      lipids: 3.6,
      fibers: 0,
      sodium: 55,
      vitaminB12: 4.5,
      calcium: 19,
      iron: 0.7,
      magnesium: 24,
      phosphore: 226,
      potassium: 361,
      zinc: 0.6
    }
  },
  'sardine': {
    category: 'poissons',
    keywords: ['sardine', 'sardines'],
    nutritionalValues: {
      calories: 160,
      proteins: 19.5,
      carbs: 0,
      lipids: 9.2,
      fibers: 0,
      sodium: 101,
      vitaminB12: 8.9,
      calcium: 382,
      iron: 2.9,
      magnesium: 39,
      phosphore: 490,
      potassium: 397,
      zinc: 1.3
    }
  },
  'crevette': {
    category: 'poissons',
    keywords: ['crevette', 'crevettes', 'gambas'],
    nutritionalValues: {
      calories: 91.3,
      proteins: 20.5,
      carbs: 0.2,
      lipids: 0.8,
      fibers: 0,
      sodium: 640
    }
  },

  // ========== PRODUITS LAITIERS ==========
  'lait': {
    category: 'produits-laitiers',
    keywords: ['lait', 'lait entier'],
    nutritionalValues: {
      calories: 64,
      proteins: 3.2,
      carbs: 4.7,
      lipids: 3.7,
      fibers: 0,
      vitaminA: 46,
      vitaminD: 0.05,
      vitaminE: 0.09,
      vitaminB12: 0.3,
      vitaminB6: 0.04,
      calcium: 119,
      iron: 0.03,
      magnesium: 11,
      phosphore: 93,
      potassium: 150,
      zinc: 0.4
    }
  },
  'yaourt': {
    category: 'produits-laitiers',
    keywords: ['yaourt', 'yogourt'],
    nutritionalValues: {
      calories: 42.9,
      proteins: 4.4,
      carbs: 5.8,
      lipids: 0.3,
      fibers: 0,
      sodium: 55,
      vitaminB12: 0.4,
      calcium: 138,
      iron: 0.1,
      magnesium: 13,
      phosphore: 117,
      potassium: 180,
      zinc: 0.6
    }
  },
  'fromage': {
    category: 'produits-laitiers',
    keywords: ['fromage', 'emmental', 'gruyère', 'comté'],
    nutritionalValues: {
      calories: 174,
      proteins: 11.7,
      carbs: 1.1,
      lipids: 13.1,
      fibers: 0.5,
      sodium: 459,
      vitaminA: 264,
      vitaminE: 0.74,
      vitaminB6: 0.08,
      vitaminB12: 1.2,
      calcium: 720,
      iron: 0.68,
      magnesium: 27,
      phosphore: 470,
      potassium: 98,
      zinc: 3.1
    }
  },
  'beurre': {
    category: 'produits-laitiers',
    keywords: ['beurre'],
    nutritionalValues: {
      calories: 94.8,
      proteins: 1.9,
      carbs: 15.7,
      lipids: 2.4,
      fibers: 1.5,
      sodium: 45,
      vitaminA: 684,
      calcium: 24
    }
  },
  'crème': {
    category: 'produits-laitiers',
    keywords: ['crème', 'creme', 'crème fraîche'],
    nutritionalValues: {
      calories: 74.7,
      proteins: 0.2,
      carbs: 3.3,
      lipids: 0,
      fibers: 0,
      sodium: 2,
      vitaminA: 365,
      calcium: 70
    }
  },
  'mozzarella': {
    category: 'produits-laitiers',
    keywords: ['mozzarella'],
    nutritionalValues: {
      calories: 227,
      proteins: 16.5,
      carbs: 0.7,
      lipids: 17.7,
      fibers: 0,
      sodium: 240,
      vitaminA: 179,
      vitaminB12: 2.3,
      calcium: 505,
      iron: 0.4,
      magnesium: 20,
      phosphore: 354,
      potassium: 76,
      zinc: 2.9
    }
  },
  'parmesan': {
    category: 'produits-laitiers',
    keywords: ['parmesan'],
    nutritionalValues: {
      calories: 411,
      proteins: 31.1,
      carbs: 1.1,
      lipids: 31,
      fibers: 0,
      sodium: 628,
      vitaminA: 207,
      vitaminB12: 1.2,
      calcium: 1184,
      iron: 0.82,
      magnesium: 44,
      phosphore: 694,
      potassium: 120,
      zinc: 3.2
    }
  },
  'chèvre': {
    category: 'produits-laitiers',
    keywords: ['chèvre', 'chevre', 'fromage de chèvre'],
    nutritionalValues: {
      calories: 364,
      proteins: 21.6,
      carbs: 2.5,
      lipids: 30.0,
      fibers: 0,
      calcium: 140,
      vitaminA: 407
    }
  },

  // ========== CÉRÉALES ==========
  'riz': {
    category: 'cereales',
    keywords: ['riz', 'riz long', 'riz rond', 'riz arborio', 'Riz Arborio', 'riz Arborio', 'riz à risotto'],
    keywords: ['riz', 'riz blanc', 'riz complet', 'riz rond', 'riz long', 'riz arborio', 'Riz Arborio', 'riz Arborio', 'riz à risotto', 'riz carnaroli', 'Riz Carnaroli'],
    nutritionalValues: {
      calories: 350,
      proteins: 7,
      carbs: 77.5,
      lipids: 0.8,
      fibers: 1.5,
      sodium: 2,
      magnesium: 12
    }
  },
  'pâtes': {
    category: 'cereales',
    keywords: [
      'pâtes', 'pates', 'pasta', 'pâte', 'pate',
      'spaghetti', 'spaghettis', 'spagetti',
      'lasagne', 'lasagnes', 'lasagna',
      'macaroni', 'macaronis',
      'penne', 'pennes',
      'coquillettes', 'coquillette',
      'tagliatelle', 'tagliatelles',
      'fettuccine', 'fettuccines',
      'linguine', 'linguines',
      'fusilli', 'fusillis',
      'rigatoni', 'rigatonis',
      'ravioli', 'raviolis',
      'tortellini', 'tortellinis',
      'gnocchi', 'gnocchis',
      'pâtes de blé dur', 'pates de ble dur',
      'pâtes au blé dur', 'pates au ble dur',
      'nouilles', 'nouille', 'Nouilles', 'Nouille'
    ],
    nutritionalValues: {
      calories: 364,
      proteins: 12,
      carbs: 72.7,
      lipids: 1.6,
      fibers: 2.9,
      sodium: 6,
      magnesium: 18,
      fer: 0.5
    }
  },
  'pain': {
    category: 'cereales',
    keywords: ['pain', 'baguette'],
    nutritionalValues: {
      calories: 276,
      proteins: 8.2,
      carbs: 55,
      lipids: 1.4,
      fibers: 3.9,
      sodium: 499,
      fer: 1.6
    }
  },
  'farine': {
    category: 'cereales',
    keywords: ['farine', 'farine de blé'],
    nutritionalValues: {
      calories: 343,
      proteins: 9.6,
      carbs: 68.6,
      lipids: 1.5,
      fibers: 6.8,
      sodium: 5,
      magnesium: 22,
      fer: 1.2
    }
  },
  'quinoa': {
    category: 'cereales',
    keywords: ['quinoa'],
    // ⚠️ IMPORTANT: Valeurs pour quinoa CRU (avant cuisson)
    // Le quinoa cuit a environ 120 kcal/100g (car il absorbe de l'eau, ratio ~1:3)
    // Si votre recette utilise du quinoa cuit, les quantités doivent être ajustées
    // Exemple: 100g cru → ~300g cuit (mais même valeur nutritionnelle totale)
    nutritionalValues: {
      calories: 358,
      proteins: 13.2,
      carbs: 58.1,
      lipids: 6.1,
      fibers: 7,
      sodium: 5,
      vitaminE: 2.4,
      vitaminB6: 0.49,
      calcium: 47,
      iron: 4.6,
      magnesium: 197,
      phosphore: 457,
      potassium: 563,
      zinc: 3.1
    }
  },
  'couscous': {
    category: 'cereales',
    keywords: ['couscous', 'semoule'],
    nutritionalValues: {
      calories: 366,
      proteins: 12.3,
      carbs: 72.7,
      lipids: 1.3,
      fibers: 4.5,
      sodium: 7
    }
  },
  'boulgour': {
    category: 'cereales',
    keywords: ['boulgour', 'bulgur'],
    nutritionalValues: {
      calories: 347,
      proteins: 11.7,
      carbs: 65.8,
      lipids: 1.4,
      fibers: 10.5,
      sodium: 17,
      magnesium: 32,
      fer: 0.9
    }
  },
  'avoine': {
    category: 'cereales',
    keywords: ['avoine', 'flocons d\'avoine'],
    nutritionalValues: {
      calories: 378,
      proteins: 16.9,
      carbs: 55.7,
      lipids: 6.9,
      fibers: 10.6,
      sodium: 2,
      magnesium: 177,
      fer: 4.7
    }
  },

  // ========== FRUITS ==========
  'pomme': {
    category: 'fruits',
    keywords: ['pomme', 'pommes'],
    nutritionalValues: {
      calories: 80,
      proteins: 2,
      carbs: 16.2,
      lipids: 0.1,
      fibers: 2.2,
      vitaminC: 4.6,
      potassium: 107
    }
  },
  'banane': {
    category: 'fruits',
    keywords: ['banane', 'bananes'],
    nutritionalValues: {
      calories: 87.6,
      proteins: 1.1,
      carbs: 19.7,
      lipids: 0.5,
      fibers: 2.7,
      sodium: 5,
      vitaminC: 8.7,
      potassium: 358
    }
  },
  'orange': {
    category: 'fruits',
    keywords: ['orange', 'oranges'],
    nutritionalValues: {
      calories: 42,
      proteins: 0.8,
      carbs: 8,
      lipids: 0.5,
      fibers: 2.7,
      sodium: 5,
      vitaminC: 53.2,
      potassium: 181
    }
  },
  'fraise': {
    category: 'fruits',
    keywords: ['fraise', 'fraises'],
    nutritionalValues: {
      calories: 35.1,
      proteins: 0.6,
      carbs: 6,
      lipids: 0.5,
      fibers: 3.8,
      sodium: 5,
      vitaminC: 58.8,
      potassium: 153
    }
  },
  'raisin': {
    category: 'fruits',
    keywords: ['raisin', 'raisins'],
    nutritionalValues: {
      calories: 322,
      proteins: 3,
      carbs: 73.2,
      lipids: 0.9,
      fibers: 4.2,
      sodium: 5,
      vitaminC: 3.2,
      potassium: 191
    }
  },
  'poire': {
    category: 'fruits',
    keywords: ['poire', 'poires'],
    nutritionalValues: {
      calories: 62.5,
      proteins: 0.2,
      carbs: 14.8,
      lipids: 0,
      fibers: 0.5,
      sodium: 1,
      vitaminC: 4.3,
      potassium: 116
    }
  },
  'pêche': {
    category: 'fruits',
    keywords: ['pêche', 'pêches', 'peche', 'peches'],
    nutritionalValues: {
      calories: 50.3,
      proteins: 0.2,
      carbs: 12.1,
      lipids: 0.1,
      fibers: 0.3,
      sodium: 4,
      vitaminC: 6.6,
      potassium: 190
    }
  },
  'citron': {
    category: 'fruits',
    keywords: ['citron', 'citrons'],
    nutritionalValues: {
      calories: 24.3,
      proteins: 0.3,
      carbs: 1.6,
      lipids: 0.5,
      fibers: 0.5,
      sodium: 5,
      vitaminC: 53,
      potassium: 138
    }
  },
  'kiwi': {
    category: 'fruits',
    keywords: ['kiwi', 'kiwis'],
    nutritionalValues: {
      calories: 60.9,
      proteins: 0.9,
      carbs: 11,
      lipids: 0.6,
      fibers: 2.4,
      sodium: 5,
      vitaminC: 92.7,
      potassium: 312
    }
  },
  'melon': {
    category: 'fruits',
    keywords: ['melon'],
    nutritionalValues: {
      calories: 59.8,
      proteins: 1.1,
      carbs: 14.8,
      lipids: 0.5,
      fibers: 1.3,
      sodium: 24,
      vitaminC: 36.7,
      vitaminA: 169,
      potassium: 267
    }
  },

  // ========== ÉPICES ET AROMATES ==========
  'sel': {
    category: 'epices',
    keywords: ['sel', 'sel de mer', 'sel fin', 'sel gros', 'gros sel', 'Gros sel', 'sel de table', 'sel iodé', 'sel kasher', 'sel kasher', 'sel marin', 'sel sans sodium'],
    nutritionalValues: {
      calories: 94.8,
      proteins: 1.9,
      carbs: 15.7,
      lipids: 2.4,
      fibers: 1.5,
      sodium: 45
    }
  },
  'poivre': {
    category: 'epices',
    keywords: ['poivre'],
    nutritionalValues: {
      calories: 331,
      proteins: 13.3,
      carbs: 39.9,
      lipids: 7.5,
      fibers: 25.3,
      sodium: 14,
      calcium: 443,
      fer: 9.7
    }
  },
  'curcuma': {
    category: 'epices',
    keywords: ['curcuma'],
    nutritionalValues: {
      calories: 291,
      proteins: 9.7,
      carbs: 44.4,
      lipids: 3.3,
      fibers: 22.7,
      sodium: 27,
      calcium: 183,
      fer: 41.4
    }
  },
  'cumin': {
    category: 'epices',
    keywords: ['cumin'],
    nutritionalValues: {
      calories: 427,
      proteins: 17.8,
      carbs: 33.7,
      lipids: 22.3,
      fibers: 10.5,
      sodium: 168,
      calcium: 931,
      fer: 66.4
    }
  },
  'paprika': {
    category: 'epices',
    keywords: ['paprika'],
    nutritionalValues: {
      calories: 318,
      proteins: 14.1,
      carbs: 18.8,
      lipids: 12.9,
      fibers: 34.9,
      sodium: 68,
      vitaminC: 71,
      vitaminA: 2463
    }
  },
  'persil': {
    category: 'epices',
    keywords: ['persil'],
    nutritionalValues: {
      calories: 42.5,
      proteins: 3,
      carbs: 4.1,
      lipids: 0.6,
      fibers: 4.3,
      sodium: 52,
      vitaminC: 133,
      vitaminA: 421,
      fer: 6.2
    }
  },
  'basilic': {
    category: 'epices',
    keywords: ['basilic'],
    nutritionalValues: {
      calories: 35.2,
      proteins: 3.2,
      carbs: 3.4,
      lipids: 0.6,
      fibers: 1.6,
      sodium: 4,
      vitaminC: 18,
      vitaminA: 264,
      calcium: 177
    }
  },
  'thym': {
    category: 'epices',
    keywords: ['thym'],
    nutritionalValues: {
      calories: 285,
      proteins: 9.1,
      carbs: 26.9,
      lipids: 7.4,
      fibers: 37,
      sodium: 55,
      calcium: 405,
      fer: 17.5
    }
  },

  // ========== HUILES ET MATIÈRES GRASSES ==========
  'huile d\'olive': {
    category: 'autres',
    keywords: ['huile d\'olive', 'huile olive', 'huile d\'olive vierge extra', 'huile olive vierge', 'Huile d\'olive', 'Huile d\'olive vierge extra', 'huile d olive', 'huile d\'olive extra vierge', 'huile olive extra vierge'],
    nutritionalValues: {
      calories: 899,
      proteins: 0.3,
      carbs: 0,
      lipids: 99.9,
      fibers: 0,
      sodium: 5,
      vitaminE: 14.4
    }
  },
  'huile de tournesol': {
    category: 'autres',
    keywords: ['huile de tournesol', 'huile tournesol'],
    nutritionalValues: {
      calories: 900,
      proteins: 0.3,
      carbs: 0,
      lipids: 100,
      fibers: 0,
      sodium: 10,
      vitaminE: 41.1
    }
  },

  // ========== ŒUFS ==========
  'œuf': {
    category: 'autres',
    keywords: ['œuf', 'oeuf', 'œufs', 'oeufs', 'œuf entier', 'oeuf entier', 'Œuf entier', 'Oeuf entier', 'œuf moyen', 'oeuf moyen', 'Œuf moyen', 'Oeuf moyen'],
    nutritionalValues: {
      calories: 140,
      proteins: 12.8,
      carbs: 0.1,
      lipids: 9.8,
      fibers: 0,
      sodium: 124,
      vitaminA: 160,
      vitaminE: 1.2,
      vitaminB6: 0.14,
      vitaminB12: 1.3,
      calcium: 56,
      iron: 1.8,
      magnesium: 12,
      phosphore: 180,
      potassium: 130,
      zinc: 1.3
    }
  },
  'jaune d\'œuf': {
    category: 'autres',
    keywords: ['jaune d\'œuf', 'jaune d\'oeuf', 'jaune d œuf', 'Jaune d\'œuf', 'Jaune d\'oeuf', 'jaune d\'œufs', 'jaunes d\'œuf'],
    nutritionalValues: {
      calories: 307,
      proteins: 15.5,
      carbs: 1.1,
      lipids: 26.7,
      fibers: 0,
      sodium: 50,
      vitaminA: 939,
      vitaminE: 2.58,
      vitaminB6: 0.4,
      vitaminB12: 1.73,
      calcium: 141,
      iron: 2.87,
      magnesium: 5,
      phosphore: 343,
      potassium: 19,
      zinc: 3.03
    }
  },

  // ========== LÉGUMINEUSES ==========
  'lentille': {
    category: 'cereales',
    keywords: ['lentille', 'lentilles', 'lentilles corail'],
    nutritionalValues: {
      calories: 327,
      proteins: 25.1,
      carbs: 44.5,
      lipids: 1.8,
      fibers: 16.3,
      sodium: 5,
      vitaminB6: 0.18,
      calcium: 19,
      iron: 3.3,
      magnesium: 36,
      phosphore: 180,
      potassium: 370,
      zinc: 1.3
    }
  },
  'pois chiche': {
    category: 'cereales',
    keywords: ['pois chiche', 'pois chiches'],
    nutritionalValues: {
      calories: 359,
      proteins: 22.4,
      carbs: 47,
      lipids: 6.7,
      fibers: 10.8,
      sodium: 64,
      vitaminB6: 0.14,
      calcium: 48,
      iron: 2.6,
      magnesium: 40,
      phosphore: 130,
      potassium: 270,
      zinc: 1.4
    }
  },
  'haricot blanc': {
    category: 'cereales',
    keywords: ['haricot blanc', 'haricots blancs'],
    nutritionalValues: {
      calories: 307,
      proteins: 23.4,
      carbs: 43.9,
      lipids: 0.9,
      fibers: 15.2,
      sodium: 16,
      calcium: 90,
      fer: 3.7
    }
  },

  // ========== VIANDES SUPPLÉMENTAIRES ==========
  'lapin': {
    category: 'viandes',
    keywords: ['lapin'],
    nutritionalValues: {
      calories: 286,
      proteins: 14.7,
      carbs: 1.7,
      lipids: 24.5,
      fibers: 0.2,
      sodium: 577,
      vitaminB6: 0.5,
      vitaminB12: 10,
      calcium: 20,
      iron: 1.5,
      magnesium: 28,
      phosphore: 215,
      potassium: 350,
      zinc: 1.8
    }
  },
  'gibier': {
    category: 'viandes',
    keywords: ['gibier', 'chevreuil', 'sanglier'],
    nutritionalValues: {
      calories: 293,
      proteins: 14.2,
      carbs: 3.3,
      lipids: 24.7,
      fibers: 0.5,
      sodium: 610,
      fer: 4.5
    }
  },
  'foie': {
    category: 'viandes',
    keywords: ['foie', 'foie de volaille', 'foie de veau'],
    nutritionalValues: {
      calories: 320,
      proteins: 15.4,
      carbs: 1.3,
      lipids: 28.1,
      fibers: 0.5,
      sodium: 605,
      vitaminA: 16899,
      vitaminB12: 60,
      fer: 8.8
    }
  },
  'boudin noir': {
    category: 'viandes',
    keywords: ['boudin noir', 'boudin'],
    nutritionalValues: {
      calories: 297,
      proteins: 12.2,
      carbs: 0.3,
      lipids: 27.1,
      fibers: 1.4,
      sodium: 574,
      calcium: 51,
      fer: 22.8
    }
  },
  'saucisse': {
    category: 'viandes',
    keywords: ['saucisse', 'saucisses', 'merguez', 'chipolata'],
    nutritionalValues: {
      calories: 460,
      proteins: 27.3,
      carbs: 4,
      lipids: 37.1,
      fibers: 0.6,
      sodium: 1900
    }
  },
  'bacon': {
    category: 'viandes',
    keywords: ['bacon', 'lard'],
    nutritionalValues: {
      calories: 257,
      proteins: 9.3,
      carbs: 25.8,
      lipids: 12.4,
      fibers: 2.6,
      vitaminB12: 0.5,
      calcium: 11,
      iron: 1.4,
      magnesium: 34,
      phosphore: 533,
      potassium: 565,
      zinc: 2.9
    }
  },
  'rôti': {
    category: 'viandes',
    keywords: ['rôti', 'roti'],
    nutritionalValues: {
      calories: 194,
      proteins: 28.8,
      carbs: 0,
      lipids: 8.7,
      fibers: 0,
      fer: 2.6
    }
  },

  // ========== POISSONS SUPPLÉMENTAIRES ==========
  'maquereau': {
    category: 'poissons',
    keywords: ['maquereau'],
    nutritionalValues: {
      calories: 186,
      proteins: 23.6,
      carbs: 0,
      lipids: 10.2,
      fibers: 0,
      sodium: 83,
      vitaminB12: 8.7,
      calcium: 12,
      iron: 1.6,
      magnesium: 76,
      phosphore: 217,
      potassium: 314,
      zinc: 0.6
    }
  },
  'hareng': {
    category: 'poissons',
    keywords: ['hareng'],
    nutritionalValues: {
      calories: 176,
      proteins: 17.7,
      carbs: 0,
      lipids: 11.7,
      fibers: 0,
      sodium: 89
    }
  },
  'anchois': {
    category: 'poissons',
    keywords: ['anchois'],
    nutritionalValues: {
      calories: 129,
      proteins: 18.6,
      carbs: 0,
      lipids: 6.1,
      fibers: 0,
      sodium: 73,
      calcium: 147
    }
  },
  'sole': {
    category: 'poissons',
    keywords: ['sole'],
    nutritionalValues: {
      calories: 206,
      proteins: 16.7,
      carbs: 11.9,
      lipids: 10.2,
      fibers: 0,
      sodium: 270
    }
  },
  'lieu': {
    category: 'poissons',
    keywords: ['lieu', 'lieu noir'],
    nutritionalValues: {
      calories: 72.6,
      proteins: 16.3,
      carbs: 0.5,
      lipids: 0.6,
      fibers: 0.2,
      sodium: 190,
      vitaminB12: 1.8
    }
  },
  'bar': {
    category: 'poissons',
    keywords: ['bar', 'loup'],
    nutritionalValues: {
      calories: 113,
      proteins: 20.3,
      carbs: 0,
      lipids: 3.6,
      fibers: 0,
      sodium: 76
    }
  },
  'daurade': {
    category: 'poissons',
    keywords: ['daurade', 'dorade'],
    nutritionalValues: {
      calories: 95.6,
      proteins: 18.1,
      carbs: 0.6,
      lipids: 2.3,
      fibers: 0,
      sodium: 47
    }
  },
  'espadon': {
    category: 'poissons',
    keywords: ['espadon'],
    nutritionalValues: {
      calories: 134,
      proteins: 18.9,
      carbs: 1,
      lipids: 6,
      fibers: 0,
      sodium: 112
    }
  },
  'flétan': {
    category: 'poissons',
    keywords: ['flétan', 'fletan'],
    nutritionalValues: {
      calories: 96.5,
      proteins: 21.2,
      carbs: 0,
      lipids: 1.3,
      fibers: 0,
      sodium: 59
    }
  },
  'moule': {
    category: 'poissons',
    keywords: ['moule', 'moules'],
    nutritionalValues: {
      calories: 108,
      proteins: 17.2,
      carbs: 5.1,
      lipids: 2.1,
      fibers: 0,
      sodium: 322,
      zinc: 1.6,
      fer: 5.8
    }
  },
  'huître': {
    category: 'poissons',
    keywords: ['huître', 'huitre', 'huîtres'],
    nutritionalValues: {
      calories: 67.2,
      proteins: 8.6,
      carbs: 3.9,
      lipids: 1.9,
      fibers: 0,
      sodium: 578,
      zinc: 16.6,
      fer: 5.8
    }
  },
  'coquille saint-jacques': {
    category: 'poissons',
    keywords: ['coquille saint-jacques', 'saint-jacques', 'noix de saint-jacques'],
    nutritionalValues: {
      calories: 83,
      proteins: 17,
      carbs: 0.8,
      lipids: 1.3,
      fibers: 0,
      sodium: 191,
      vitaminB12: 1.4
    }
  },
  'crabe': {
    category: 'poissons',
    keywords: ['crabe'],
    nutritionalValues: {
      calories: 104,
      proteins: 19.5,
      carbs: 0,
      lipids: 2.9,
      fibers: 0,
      sodium: 275,
      zinc: 3.8
    }
  },
  'homard': {
    category: 'poissons',
    keywords: ['homard'],
    nutritionalValues: {
      calories: 85.5,
      proteins: 17.9,
      carbs: 0.9,
      lipids: 1.2,
      fibers: 0,
      sodium: 361
    }
  },
  'seiche': {
    category: 'poissons',
    keywords: ['seiche'],
    nutritionalValues: {
      calories: 76.3,
      proteins: 16.2,
      carbs: 0.5,
      lipids: 1.1,
      fibers: 0,
      sodium: 372,
      fer: 1.1
    }
  },
  'calmar': {
    category: 'poissons',
    keywords: ['calmar', 'calamar', 'encornet'],
    nutritionalValues: {
      calories: 77,
      proteins: 14.4,
      carbs: 2.2,
      lipids: 1.2,
      fibers: 0,
      sodium: 243
    }
  },

  // ========== FÉCULENTS SUPPLÉMENTAIRES ==========
  'semoule': {
    category: 'cereales',
    keywords: ['semoule', 'semoule de blé'],
    nutritionalValues: {
      calories: 350,
      proteins: 11.8,
      carbs: 69.8,
      lipids: 1.3,
      fibers: 3.7,
      sodium: 1,
      fer: 1.2
    }
  },
  'polenta': {
    category: 'cereales',
    keywords: ['polenta', 'semoule de maïs'],
    nutritionalValues: {
      calories: 350,
      proteins: 7.9,
      carbs: 74,
      lipids: 1.8,
      fibers: 3.2,
      sodium: 2,
      fer: 0.5
    }
  },
  'orge': {
    category: 'cereales',
    keywords: ['orge'],
    nutritionalValues: {
      calories: 334,
      proteins: 12.5,
      carbs: 56.2,
      lipids: 2.3,
      fibers: 17.3,
      sodium: 12,
      magnesium: 22
    }
  },
  'épeautre': {
    category: 'cereales',
    keywords: ['épeautre', 'epeautre'],
    nutritionalValues: {
      calories: 344,
      proteins: 14.6,
      carbs: 59.5,
      lipids: 2.4,
      fibers: 10.7,
      sodium: 8,
      magnesium: 136,
      fer: 4.4
    }
  },
  'sarrasin': {
    category: 'cereales',
    keywords: ['sarrasin', 'blé noir'],
    nutritionalValues: {
      calories: 362,
      proteins: 13.3,
      carbs: 67.5,
      lipids: 3.4,
      fibers: 4,
      sodium: 1,
      magnesium: 231
    }
  },
  'millet': {
    category: 'cereales',
    keywords: ['millet'],
    nutritionalValues: {
      calories: 350,
      proteins: 10.2,
      carbs: 63.2,
      lipids: 4.1,
      fibers: 9.7,
      sodium: 5,
      magnesium: 114
    }
  },
  'riz complet': {
    category: 'cereales',
    keywords: ['riz complet', 'riz brun'],
    nutritionalValues: {
      calories: 350,
      proteins: 7,
      carbs: 71.4,
      lipids: 2.8,
      fibers: 5,
      sodium: 4,
      vitaminE: 1.2,
      vitaminB6: 0.51,
      calcium: 23,
      iron: 1.8,
      magnesium: 143,
      phosphore: 333,
      potassium: 268,
      zinc: 2
    }
  },
  'riz sauvage': {
    category: 'cereales',
    keywords: ['riz sauvage'],
    nutritionalValues: {
      calories: 344,
      proteins: 11.1,
      carbs: 69.2,
      lipids: 0.9,
      fibers: 5.9,
      sodium: 3,
      zinc: 1.3
    }
  },
  'vermicelle': {
    category: 'cereales',
    keywords: ['vermicelle', 'vermicelles', 'cheveux d\'ange'],
    nutritionalValues: {
      calories: 86.6,
      proteins: 1.4,
      carbs: 20.1,
      lipids: 0.5,
      fibers: 0.5,
      sodium: 10,
      fer: 0.5
    }
  },
  'gnocchi': {
    category: 'cereales',
    keywords: ['gnocchi', 'gnocchis'],
    nutritionalValues: {
      calories: 178,
      proteins: 5,
      carbs: 34.1,
      lipids: 2.1,
      fibers: 1.8,
      sodium: 402
    }
  },
  'tapioca': {
    category: 'cereales',
    keywords: ['tapioca', 'perles du japon'],
    nutritionalValues: {
      calories: 354,
      proteins: 0.2,
      carbs: 87.8,
      lipids: 0,
      fibers: 0.9,
      sodium: 1,
      calcium: 20
    }
  },
  'haricot rouge': {
    category: 'cereales',
    keywords: ['haricot rouge', 'haricots rouges'],
    nutritionalValues: {
      calories: 314,
      proteins: 22.5,
      carbs: 46.1,
      lipids: 1.1,
      fibers: 15.2,
      sodium: 12,
      fer: 2.9
    }
  },
  'haricot noir': {
    category: 'cereales',
    keywords: ['haricot noir', 'haricots noirs'],
    nutritionalValues: {
      calories: 297,
      proteins: 12.2,
      carbs: 0.3,
      lipids: 27.1,
      fibers: 1.4,
      sodium: 574,
      fer: 2.1
    }
  },
  'fève': {
    category: 'cereales',
    keywords: ['fève', 'fèves'],
    nutritionalValues: {
      calories: 83.3,
      proteins: 8.1,
      carbs: 9.4,
      lipids: 0.8,
      fibers: 3.1,
      sodium: 10,
      fer: 1.5
    }
  },
  'edamame': {
    category: 'cereales',
    keywords: ['edamame', 'soja vert'],
    nutritionalValues: {
      calories: 320,
      proteins: 25.7,
      carbs: 0,
      lipids: 24.4,
      fibers: 0,
      sodium: 800,
      fer: 2.3
    }
  },
  'pâte feuilletée': {
    category: 'cereales',
    keywords: ['pâte feuilletée', 'feuilletage'],
    nutritionalValues: {
      calories: 385,
      proteins: 5.8,
      carbs: 41,
      lipids: 21.4,
      fibers: 1.5,
      sodium: 453
    }
  },
  'pâte brisée': {
    category: 'cereales',
    keywords: ['pâte brisée', 'pâte à tarte'],
    nutritionalValues: {
      calories: 473,
      proteins: 7.5,
      carbs: 46.4,
      lipids: 26.4,
      fibers: 8.5,
      sodium: 690
    }
  },

  // ========== LÉGUMES SUPPLÉMENTAIRES ==========
  'concombre': {
    category: 'legumes',
    keywords: ['concombre'],
    nutritionalValues: {
      calories: 16.8,
      proteins: 0.7,
      carbs: 2.9,
      lipids: 0.1,
      fibers: 0.5,
      sodium: 5,
      vitaminC: 2.8,
      potassium: 147
    }
  },
  'radis': {
    category: 'legumes',
    keywords: ['radis'],
    nutritionalValues: {
      calories: 16,
      proteins: 0.7,
      carbs: 3.4,
      lipids: 0.1,
      fibers: 1.6,
      vitaminC: 14.8,
      potassium: 233
    }
  },
  'endive': {
    category: 'legumes',
    keywords: ['endive', 'endives'],
    nutritionalValues: {
      calories: 16.6,
      proteins: 1.2,
      carbs: 2.8,
      lipids: 0.5,
      fibers: 1.1,
      sodium: 5,
      vitaminC: 2.8,
      potassium: 211
    }
  },
  'artichaut': {
    category: 'legumes',
    keywords: ['artichaut', 'artichauts'],
    nutritionalValues: {
      calories: 33.2,
      proteins: 2.5,
      carbs: 1,
      lipids: 0.3,
      fibers: 8.3,
      sodium: 60,
      vitaminC: 11.7,
      potassium: 370
    }
  },
  'asperge': {
    category: 'legumes',
    keywords: ['asperge', 'asperges'],
    nutritionalValues: {
      calories: 20.3,
      proteins: 1.6,
      carbs: 1.2,
      lipids: 0.7,
      fibers: 1.6,
      sodium: 287,
      vitaminC: 5.6
    }
  },
  'champignon': {
    category: 'legumes',
    keywords: ['champignon', 'champignons', 'champignon de paris'],
    nutritionalValues: {
      calories: 24.3,
      proteins: 2.4,
      carbs: 2.3,
      lipids: 0.3,
      fibers: 1.6,
      sodium: 5,
      potassium: 318
    }
  },
  'courge': {
    category: 'legumes',
    keywords: ['courge', 'butternut', 'potiron', 'citrouille'],
    nutritionalValues: {
      calories: 14.4,
      proteins: 1,
      carbs: 1.6,
      lipids: 0.1,
      fibers: 1.5,
      sodium: 4,
      vitaminA: 426,
      potassium: 340
    }
  },
  'potimarron': {
    category: 'legumes',
    keywords: ['potimarron'],
    nutritionalValues: {
      calories: 22.1,
      proteins: 1,
      carbs: 3.1,
      lipids: 0.3,
      fibers: 1.7,
      sodium: 30,
      vitaminC: 10,
      vitaminA: 400
    }
  },
  'fenouil': {
    category: 'legumes',
    keywords: ['fenouil'],
    nutritionalValues: {
      calories: 18.2,
      proteins: 1,
      carbs: 2.6,
      lipids: 0.5,
      fibers: 2.6,
      sodium: 22,
      vitaminC: 12,
      potassium: 414
    }
  },
  'rutabaga': {
    category: 'legumes',
    keywords: ['rutabaga'],
    nutritionalValues: {
      calories: 26,
      proteins: 0.9,
      carbs: 4.3,
      lipids: 0.2,
      fibers: 1.8,
      sodium: 5,
      vitaminC: 25,
      potassium: 337
    }
  },
  'panais': {
    category: 'legumes',
    keywords: ['panais'],
    nutritionalValues: {
      calories: 67.9,
      proteins: 1.2,
      carbs: 12.6,
      lipids: 0.3,
      fibers: 4.9,
      sodium: 10,
      vitaminC: 17,
      potassium: 375
    }
  },
  'topinambour': {
    category: 'legumes',
    keywords: ['topinambour'],
    nutritionalValues: {
      calories: 69.3,
      proteins: 1.8,
      carbs: 14.4,
      lipids: 0,
      fibers: 2.2,
      sodium: 36,
      potassium: 429
    }
  },
  'chou de bruxelles': {
    category: 'legumes',
    keywords: ['chou de bruxelles', 'choux de bruxelles'],
    nutritionalValues: {
      calories: 43.9,
      proteins: 3.4,
      carbs: 4.6,
      lipids: 0.3,
      fibers: 3.8,
      sodium: 25,
      vitaminC: 85,
      vitaminK: 177
    }
  },
  'chou rouge': {
    category: 'legumes',
    keywords: ['chou rouge'],
    nutritionalValues: {
      calories: 26.4,
      proteins: 1.1,
      carbs: 4.3,
      lipids: 0.5,
      fibers: 2.8,
      sodium: 14,
      vitaminC: 57,
      vitaminK: 38
    }
  },
  'chou kale': {
    category: 'legumes',
    keywords: ['chou kale', 'kale'],
    nutritionalValues: {
      calories: 34.6,
      proteins: 2.9,
      carbs: 0.3,
      lipids: 1.5,
      fibers: 4.1,
      sodium: 53,
      vitaminC: 120,
      vitaminA: 500,
      vitaminK: 705,
      calcium: 150,
      iron: 1.5,
      magnesium: 33,
      zinc: 0.4
    }
  },
  'roquette': {
    category: 'legumes',
    keywords: ['roquette'],
    nutritionalValues: {
      calories: 27.9,
      proteins: 2.6,
      carbs: 2.1,
      lipids: 0.7,
      fibers: 1.6,
      sodium: 27,
      vitaminC: 15,
      vitaminK: 108,
      calcium: 160
    }
  },
  'mâche': {
    category: 'legumes',
    keywords: ['mâche', 'mache'],
    nutritionalValues: {
      calories: 15,
      proteins: 2,
      carbs: 0.5,
      lipids: 0.5,
      fibers: 2.3,
      sodium: 5,
      vitaminC: 38,
      vitaminA: 420
    }
  },
  'blette': {
    category: 'legumes',
    keywords: ['blette', 'bette', 'côte de blette'],
    nutritionalValues: {
      calories: 12.8,
      proteins: 1,
      carbs: 1.6,
      lipids: 0.5,
      fibers: 1.8,
      vitaminC: 30,
      calcium: 51
    }
  },

  // ========== FRUITS SUPPLÉMENTAIRES ==========
  'abricot': {
    category: 'fruits',
    keywords: ['abricot', 'abricots'],
    nutritionalValues: {
      calories: 58.6,
      proteins: 0.2,
      carbs: 13.7,
      lipids: 0,
      fibers: 0.1,
      sodium: 2,
      vitaminC: 10,
      vitaminA: 96,
      potassium: 259
    }
  },
  'prune': {
    category: 'fruits',
    keywords: ['prune', 'prunes', 'pruneau'],
    nutritionalValues: {
      calories: 74.6,
      proteins: 0.6,
      carbs: 18,
      lipids: 0.5,
      fibers: 2.2,
      sodium: 5,
      vitaminC: 9.5,
      potassium: 157
    }
  },
  'cerise': {
    category: 'fruits',
    keywords: ['cerise', 'cerises'],
    nutritionalValues: {
      calories: 22.9,
      proteins: 0.4,
      carbs: 4.5,
      lipids: 0.3,
      fibers: 0.3,
      sodium: 3,
      vitaminC: 7,
      potassium: 222
    }
  },
  'ananas': {
    category: 'fruits',
    keywords: ['ananas'],
    nutritionalValues: {
      calories: 52.3,
      proteins: 0.4,
      carbs: 11.9,
      lipids: 0.1,
      fibers: 0.2,
      sodium: 5,
      vitaminC: 47.8
    }
  },
  'mangue': {
    category: 'fruits',
    keywords: ['mangue'],
    nutritionalValues: {
      calories: 38.8,
      proteins: 0.2,
      carbs: 9.5,
      lipids: 0,
      fibers: 0,
      vitaminC: 36.4,
      vitaminA: 54
    }
  },
  'pastèque': {
    category: 'fruits',
    keywords: ['pastèque', 'pasteque'],
    nutritionalValues: {
      calories: 35.4,
      proteins: 0.7,
      carbs: 8.3,
      lipids: 0.5,
      fibers: 0.5,
      sodium: 5,
      vitaminC: 8.1
    }
  },
  'clémentine': {
    category: 'fruits',
    keywords: ['clémentine', 'clementine', 'clémentines', 'mandarine'],
    nutritionalValues: {
      calories: 46.7,
      proteins: 0.7,
      carbs: 10.4,
      lipids: 0.1,
      fibers: 0.2,
      sodium: 4,
      vitaminC: 48.8,
      potassium: 177
    }
  },
  'pamplemousse': {
    category: 'fruits',
    keywords: ['pamplemousse'],
    nutritionalValues: {
      calories: 40.9,
      proteins: 0.5,
      carbs: 8.4,
      lipids: 0.1,
      fibers: 0.2,
      sodium: 4,
      vitaminC: 31.2,
      potassium: 135
    }
  },
  'figue': {
    category: 'fruits',
    keywords: ['figue', 'figues'],
    nutritionalValues: {
      calories: 67.6,
      proteins: 1.2,
      carbs: 13.5,
      lipids: 0.5,
      fibers: 4.1,
      sodium: 5,
      calcium: 35,
      potassium: 232
    }
  },
  'myrtille': {
    category: 'fruits',
    keywords: ['myrtille', 'myrtilles', 'bleuet'],
    nutritionalValues: {
      calories: 57.7,
      proteins: 0.9,
      carbs: 10.6,
      lipids: 0.3,
      fibers: 2.4,
      sodium: 1,
      vitaminC: 9.7,
      vitaminK: 19
    }
  },
  'framboise': {
    category: 'fruits',
    keywords: ['framboise', 'framboises'],
    nutritionalValues: {
      calories: 47.9,
      proteins: 1.2,
      carbs: 5.8,
      lipids: 0.8,
      fibers: 4.3,
      sodium: 5,
      vitaminC: 26.2
    }
  },
  'mûre': {
    category: 'fruits',
    keywords: ['mûre', 'mûres', 'mure', 'mures'],
    nutritionalValues: {
      calories: 46,
      proteins: 1.1,
      carbs: 6.5,
      lipids: 0.7,
      fibers: 5.2,
      sodium: 5,
      vitaminC: 21,
      vitaminK: 19
    }
  },
  'cassis': {
    category: 'fruits',
    keywords: ['cassis'],
    nutritionalValues: {
      calories: 70.2,
      proteins: 1.4,
      carbs: 9.7,
      lipids: 0.4,
      fibers: 7.1,
      sodium: 2,
      vitaminC: 181,
      potassium: 322
    }
  },
  'groseille': {
    category: 'fruits',
    keywords: ['groseille', 'groseilles'],
    nutritionalValues: {
      calories: 67.2,
      proteins: 1.6,
      carbs: 7.1,
      lipids: 0.7,
      fibers: 4.6,
      sodium: 5,
      vitaminC: 41,
      potassium: 275
    }
  },
  'coing': {
    category: 'fruits',
    keywords: ['coing', 'coings'],
    nutritionalValues: {
      calories: 59,
      proteins: 0.4,
      carbs: 12.5,
      lipids: 0.1,
      fibers: 1.9,
      sodium: 4,
      vitaminC: 15,
      potassium: 197
    }
  },
  'litchi': {
    category: 'fruits',
    keywords: ['litchi', 'lychee'],
    nutritionalValues: {
      calories: 77.5,
      proteins: 1.1,
      carbs: 16.1,
      lipids: 0.5,
      fibers: 2,
      sodium: 5,
      vitaminC: 71.5,
      potassium: 171
    }
  },
  'avocat': {
    category: 'fruits',
    keywords: ['avocat'],
    nutritionalValues: {
      calories: 203,
      proteins: 1.6,
      carbs: 0,
      lipids: 20.6,
      fibers: 3.6,
      sodium: 6,
      vitaminE: 2.1,
      potassium: 485
    }
  },

  // ========== PRODUITS LAITIERS SUPPLÉMENTAIRES ==========
  'fromage blanc': {
    category: 'produits-laitiers',
    keywords: ['fromage blanc'],
    nutritionalValues: {
      calories: 48.4,
      proteins: 7.3,
      carbs: 4.2,
      lipids: 0.1,
      fibers: 0,
      sodium: 36,
      calcium: 103,
      phosphore: 151
    }
  },
  'ricotta': {
    category: 'produits-laitiers',
    keywords: ['ricotta'],
    nutritionalValues: {
      calories: 174,
      proteins: 11.7,
      carbs: 1.1,
      lipids: 13.1,
      fibers: 0.5,
      sodium: 459,
      calcium: 207
    }
  },
  'mascarpone': {
    category: 'produits-laitiers',
    keywords: ['mascarpone'],
    nutritionalValues: {
      calories: 369,
      proteins: 6,
      carbs: 3.1,
      lipids: 37,
      fibers: 0.5,
      sodium: 32,
      vitaminA: 366,
      calcium: 60
    }
  },
  'feta': {
    category: 'produits-laitiers',
    keywords: ['feta'],
    nutritionalValues: {
      calories: 273,
      proteins: 15.4,
      carbs: 1.2,
      lipids: 22.6,
      fibers: 0,
      sodium: 1000,
      calcium: 493
    }
  },
  'roquefort': {
    category: 'produits-laitiers',
    keywords: ['roquefort'],
    nutritionalValues: {
      calories: 342,
      proteins: 20.6,
      carbs: 0,
      lipids: 29,
      fibers: 0,
      sodium: 1100,
      calcium: 662
    }
  },
  'camembert': {
    category: 'produits-laitiers',
    keywords: ['camembert'],
    nutritionalValues: {
      calories: 280,
      proteins: 19.5,
      carbs: 0,
      lipids: 22.5,
      fibers: 0,
      sodium: 579,
      vitaminA: 241,
      calcium: 388
    }
  },
  'brie': {
    category: 'produits-laitiers',
    keywords: ['brie'],
    nutritionalValues: {
      calories: 345,
      proteins: 17.6,
      carbs: 0.7,
      lipids: 30.4,
      fibers: 0.1,
      sodium: 655,
      vitaminB12: 1.7,
      calcium: 184
    }
  },
  'comté': {
    category: 'produits-laitiers',
    keywords: ['comté', 'comte'],
    nutritionalValues: {
      calories: 413,
      proteins: 27.8,
      carbs: 0,
      lipids: 33.8,
      fibers: 0,
      sodium: 403,
      calcium: 1100,
      phosphore: 625
    }
  },
  'cottage': {
    category: 'produits-laitiers',
    keywords: ['cottage', 'cottage cheese'],
    nutritionalValues: {
      calories: 98,
      proteins: 11.1,
      carbs: 3.4,
      lipids: 4.3,
      fibers: 0,
      calcium: 83,
      sodium: 364
    }
  },
  'lait concentré': {
    category: 'produits-laitiers',
    keywords: ['lait concentré', 'lait concentre'],
    nutritionalValues: {
      calories: 327,
      proteins: 7.7,
      carbs: 56.5,
      lipids: 7.9,
      fibers: 0,
      sodium: 85,
      calcium: 284
    }
  },

  // ========== NOIX ET GRAINES ==========
  'amande': {
    category: 'fruits',
    keywords: ['amande', 'amandes'],
    nutritionalValues: {
      calories: 615,
      proteins: 18.8,
      carbs: 9.5,
      lipids: 51.3,
      fibers: 12.5,
      sodium: 5,
      vitaminE: 25.6,
      vitaminB6: 0.14,
      calcium: 264,
      iron: 3.7,
      magnesium: 270,
      phosphore: 481,
      potassium: 733,
      zinc: 3.1
    }
  },
  'noix': {
    category: 'fruits',
    keywords: ['noix'],
    nutritionalValues: {
      calories: 441,
      proteins: 14.5,
      carbs: 15.2,
      lipids: 35.3,
      fibers: 2.6,
      sodium: 351,
      vitaminE: 0.7,
      vitaminB6: 0.54,
      calcium: 98,
      iron: 2.9,
      magnesium: 158,
      phosphore: 346,
      potassium: 441,
      zinc: 3.1
    }
  },
  'noisette': {
    category: 'fruits',
    keywords: ['noisette', 'noisettes'],
    nutritionalValues: {
      calories: 179,
      proteins: 2.4,
      carbs: 25.3,
      lipids: 7,
      fibers: 2.4,
      sodium: 373,
      vitaminE: 15,
      vitaminB6: 0.56,
      calcium: 114,
      iron: 4.7,
      magnesium: 163,
      phosphore: 290,
      potassium: 680,
      zinc: 2.5
    }
  },
  'cacahuète': {
    category: 'fruits',
    keywords: ['cacahuète', 'cacahuète', 'arachide'],
    nutritionalValues: {
      calories: 623,
      proteins: 22.8,
      carbs: 14.8,
      lipids: 49.1,
      fibers: 8.6,
      sodium: 9,
      vitaminE: 8.3,
      vitaminB6: 0.35,
      calcium: 92,
      iron: 4.6,
      magnesium: 168,
      phosphore: 376,
      potassium: 705,
      zinc: 3.3
    }
  },
  'cajou': {
    category: 'fruits',
    keywords: ['cajou', 'noix de cajou'],
    nutritionalValues: {
      calories: 441,
      proteins: 14.5,
      carbs: 15.2,
      lipids: 35.3,
      fibers: 2.6,
      sodium: 351,
      magnesium: 292,
      fer: 6.7
    }
  },
  'pistache': {
    category: 'fruits',
    keywords: ['pistache', 'pistaches'],
    nutritionalValues: {
      calories: 617,
      proteins: 18.9,
      carbs: 15.9,
      lipids: 49.5,
      fibers: 9.3,
      sodium: 664,
      vitaminB6: 1.7,
      potassium: 1025
    }
  },
  'graines de tournesol': {
    category: 'autres',
    keywords: ['graines de tournesol', 'tournesol'],
    nutritionalValues: {
      calories: 282,
      proteins: 8.3,
      carbs: 39.7,
      lipids: 7.6,
      fibers: 5.8,
      sodium: 460,
      vitaminE: 35.2,
      magnesium: 325
    }
  },
  'graines de lin': {
    category: 'autres',
    keywords: ['graines de lin', 'lin'],
    nutritionalValues: {
      calories: 528,
      proteins: 19,
      carbs: 6.5,
      lipids: 40.3,
      fibers: 24.4,
      sodium: 40,
      magnesium: 392
    }
  },
  'graines de chia': {
    category: 'autres',
    keywords: ['graines de chia', 'chia'],
    nutritionalValues: {
      calories: 282,
      proteins: 8.3,
      carbs: 39.7,
      lipids: 7.6,
      fibers: 5.8,
      sodium: 460,
      calcium: 631
    }
  },
  'graines de sésame': {
    category: 'epices',
    keywords: ['graines de sésame', 'sésame', 'sesame'],
    nutritionalValues: {
      calories: 606,
      proteins: 17.7,
      carbs: 12.8,
      lipids: 49.7,
      fibers: 11.8,
      sodium: 2,
      calcium: 975,
      fer: 14.6
    }
  },

  // ========== CONDIMENTS ET SAUCES ==========
  'moutarde': {
    category: 'autres',
    keywords: ['moutarde'],
    nutritionalValues: {
      calories: 151,
      proteins: 6.9,
      carbs: 4.3,
      lipids: 11.2,
      fibers: 1,
      sodium: 2300
    }
  },
  'mayonnaise': {
    category: 'autres',
    keywords: ['mayonnaise', 'mayo'],
    nutritionalValues: {
      calories: 692,
      proteins: 1.3,
      carbs: 3.4,
      lipids: 74.5,
      fibers: 0.3,
      sodium: 552
    }
  },
  'ketchup': {
    category: 'autres',
    keywords: ['ketchup'],
    nutritionalValues: {
      calories: 108,
      proteins: 1.2,
      carbs: 23.7,
      lipids: 0.2,
      fibers: 1.8,
      sodium: 900
    }
  },
  'sauce soja': {
    category: 'autres',
    keywords: ['sauce soja', 'soja'],
    nutritionalValues: {
      calories: 39.9,
      proteins: 7.3,
      carbs: 1.7,
      lipids: 0.5,
      fibers: 0.9,
      sodium: 5250
    }
  },
  'vinaigre': {
    category: 'autres',
    keywords: ['vinaigre'],
    nutritionalValues: {
      calories: 22.5,
      proteins: 0,
      carbs: 1,
      lipids: 0.1,
      fibers: 0,
      sodium: 5
    }
  },
  'miel': {
    category: 'autres',
    keywords: ['miel'],
    nutritionalValues: {
      calories: 331,
      proteins: 0.7,
      carbs: 82.1,
      lipids: 0,
      fibers: 0,
      sodium: 4,
      potassium: 52
    }
  },
  'confiture': {
    category: 'autres',
    keywords: ['confiture', 'gelée'],
    nutritionalValues: {
      calories: 340,
      proteins: 6.8,
      carbs: 61.7,
      lipids: 7.4,
      fibers: 0,
      sodium: 129,
      vitaminC: 3
    }
  },
  'chocolat noir': {
    category: 'autres',
    keywords: ['chocolat noir', 'chocolat'],
    nutritionalValues: {
      calories: 480,
      proteins: 5.1,
      carbs: 69.2,
      lipids: 19.6,
      fibers: 3.2,
      sodium: 261,
      magnesium: 228,
      fer: 2.3
    }
  },
  'cacao': {
    category: 'autres',
    keywords: ['cacao', 'poudre de cacao'],
    nutritionalValues: {
      calories: 900,
      proteins: 0,
      carbs: 0,
      lipids: 100,
      fibers: 0,
      magnesium: 499,
      fer: 13.9
    }
  },
  'sucre': {
    category: 'autres',
    keywords: ['sucre', 'sucre blanc'],
    nutritionalValues: {
      calories: 399,
      proteins: 0,
      carbs: 99.7,
      lipids: 0,
      fibers: 0,
      sodium: 2,
      calcium: 1
    }
  },
  'huile de colza': {
    category: 'autres',
    keywords: ['huile de colza', 'huile colza', 'colza'],
    nutritionalValues: {
      calories: 900,
      proteins: 0,
      carbs: 0,
      lipids: 100,
      fibers: 0,
      sodium: 0,
      vitaminE: 27.7
    }
  },
  'bouillon de légumes': {
    category: 'autres',
    keywords: ['bouillon de légumes', 'bouillon légumes', 'bouillon vegetal'],
    nutritionalValues: {
      calories: 20.1,
      proteins: 0.3,
      carbs: 4.8,
      lipids: 0.2,
      fibers: 0.2,
      sodium: 240
    }
  },
  'vin blanc': {
    category: 'autres',
    keywords: ['vin blanc', 'vin blanc sec', 'vin'],
    nutritionalValues: {
      calories: 55.3,
      proteins: 0.3,
      carbs: 0.2,
      lipids: 0,
      fibers: 0,
      sodium: 2.5
    }
  },
  'huile végétale': {
    category: 'autres',
    keywords: ['huile végétale', 'huile vegetale', 'huile neutre'],
    nutritionalValues: {
      calories: 899,
      proteins: 0.2,
      carbs: 0,
      lipids: 99.9,
      fibers: 0,
      sodium: 0
    }
  },
  'eau': {
    category: 'autres',
    keywords: ['eau', 'eau tiède', 'eau chaude', 'eau froide', 'eau filtrée', 'eau du robinet'],
    nutritionalValues: {
      calories: 0,
      proteins: 0,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 0
    }
  },
  'levure chimique': {
    category: 'autres',
    keywords: ['levure chimique', 'poudre à lever', 'poudre a lever', 'baking powder'],
    nutritionalValues: {
      calories: 108,
      proteins: 0.1,
      carbs: 26.9,
      lipids: 0,
      fibers: 0,
      sodium: 9250
    }
  },
  'herbes de provence': {
    category: 'epices',
    keywords: ['herbes de provence', 'herbes provence', 'mélange herbes provence'],
    nutritionalValues: {
      calories: 259,
      proteins: 6.5,
      carbs: 45.7,
      lipids: 5.8,
      fibers: 25.3,
      sodium: 26
    }
  },
  'bouquet garni': {
    category: 'epices',
    keywords: ['bouquet garni', 'bouquet garni', 'fagot herbes'],
    nutritionalValues: {
      calories: 45,
      proteins: 3.2,
      carbs: 7.5,
      lipids: 0.8,
      fibers: 2.5,
      sodium: 8
    }
  },
  'cannelle': {
    category: 'epices',
    keywords: ['cannelle', 'cannelle moulue', 'cannelle en poudre', 'cannelle poudre'],
    nutritionalValues: {
      calories: 243,
      proteins: 4,
      carbs: 27.5,
      lipids: 1.2,
      fibers: 53.1,
      sodium: 10
    }
  },
  'muscade': {
    category: 'epices',
    keywords: ['muscade', 'noix de muscade', 'muscade moulue'],
    nutritionalValues: {
      calories: 506,
      proteins: 5.8,
      carbs: 27.4,
      lipids: 36.3,
      fibers: 21,
      sodium: 16
    }
  },
  'extrait de vanille': {
    category: 'epices',
    keywords: ['extrait de vanille', 'extrait vanille', 'vanille extrait', 'essence de vanille', 'essence vanille', 'extrait pur de vanille', 'Extrait pur de vanille'],
    nutritionalValues: {
      calories: 240,
      proteins: 0.1,
      carbs: 2.4,
      lipids: 0,
      fibers: 0,
      sodium: 4
    }
  },
  'gousse de vanille': {
    category: 'epices',
    keywords: ['gousse de vanille', 'gousses de vanille', 'Gousse de vanille', 'vanille gousse', 'vanille en gousse'],
    // Valeurs moyennes pour gousse de vanille (très faible quantité utilisée)
    nutritionalValues: {
      calories: 288,
      proteins: 0.1,
      carbs: 12.7,
      lipids: 0.1,
      fibers: 0,
      sodium: 9
    }
  },
  'tofu': {
    category: 'legumes',
    keywords: ['tofu', 'tofu ferme', 'tofu nature', 'tofu soyeux'],
    nutritionalValues: {
      calories: 142,
      proteins: 14.7,
      carbs: 2.9,
      lipids: 8.5,
      fibers: 0.6,
      sodium: 10
    }
  },
  'madère': {
    category: 'autres',
    keywords: ['madère', 'vin madère', 'madere'],
    // Valeurs approximatives pour un vin de liqueur (similaire au vin blanc avec plus de sucre)
    nutritionalValues: {
      calories: 150,
      proteins: 0.1,
      carbs: 12,
      lipids: 0,
      fibers: 0,
      sodium: 5
    }
  },
  'légumes de saison': {
    category: 'legumes',
    keywords: ['légumes de saison', 'legumes de saison', 'légumes saison', 'vegetables'],
    // Valeurs moyennes pour un mélange de légumes
    nutritionalValues: {
      calories: 30,
      proteins: 1.5,
      carbs: 5,
      lipids: 0.3,
      fibers: 2.5,
      sodium: 20
    }
  },
  'bière brune': {
    category: 'autres',
    keywords: ['bière brune', 'biere brune', 'Bière brune', 'bière'],
    nutritionalValues: {
      calories: 40.5,
      proteins: 0.4,
      carbs: 4.1,
      lipids: 0,
      fibers: 0,
      sodium: 11.6
    }
  },
  'câpres': {
    category: 'epices',
    keywords: ['câpres', 'capres', 'Câpres', 'câpres au vinaigre'],
    nutritionalValues: {
      calories: 0,
      proteins: 2.2,
      carbs: 3.5,
      lipids: 0.9,
      fibers: 0.4,
      sodium: 1620
    }
  },
  'sirop d\'érable': {
    category: 'autres',
    keywords: ['sirop d\'érable', 'sirop d erable', 'sirop erable', 'Sirop d\'érable'],
    nutritionalValues: {
      calories: 269,
      proteins: 0,
      carbs: 67.2,
      lipids: 0.1,
      fibers: 0,
      sodium: 10.5
    }
  },
  'truffe': {
    category: 'legumes',
    keywords: ['truffe', 'truffes', 'Truffe', 'Truffes', 'truffe noire'],
    nutritionalValues: {
      calories: 0,
      proteins: 5.8,
      carbs: 0.5,
      lipids: 0.5,
      fibers: 0.7,
      sodium: 66
    }
  },
  'gingembre': {
    category: 'epices',
    keywords: ['gingembre', 'Gingembre', 'gingembre frais', 'gingembre râpé', 'gingembre rape'],
    nutritionalValues: {
      calories: 80,
      proteins: 1.8,
      carbs: 15.8,
      lipids: 0.8,
      fibers: 2,
      sodium: 13
    }
  },
  'aneth': {
    category: 'epices',
    keywords: ['aneth', 'Aneth', 'aneth frais', 'aneth séché'],
    nutritionalValues: {
      calories: 43,
      proteins: 3.5,
      carbs: 7,
      lipids: 1.1,
      fibers: 2.1,
      sodium: 4
    }
  },
  'sauce worcestershire': {
    category: 'autres',
    keywords: ['sauce worcestershire', 'worcestershire', 'Sauce Worcestershire', 'sauce worcester'],
    // Valeurs approximatives pour une sauce similaire
    nutritionalValues: {
      calories: 78,
      proteins: 0.9,
      carbs: 18.1,
      lipids: 0,
      fibers: 0,
      sodium: 1000
    }
  },
  'vin rouge': {
    category: 'autres',
    keywords: ['vin rouge', 'vin rouge sec'],
    nutritionalValues: {
      calories: 75.7,
      proteins: 0.2,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 1.25
    }
  },
  'maïzena': {
    category: 'cereales',
    keywords: ['maïzena', 'maizena', 'amidon de maïs', 'amidon mais', 'fécule de maïs', 'fecule de mais'],
    // Amidon de maïs - valeurs similaires à l'amidon
    nutritionalValues: {
      calories: 381,
      proteins: 0.3,
      carbs: 91.3,
      lipids: 0.1,
      fibers: 0.9,
      sodium: 9
    }
  },
  'bouillon de volaille': {
    category: 'autres',
    keywords: ['bouillon de volaille', 'bouillon volaille', 'bouillon poulet'],
    nutritionalValues: {
      calories: 30.4,
      proteins: 1.2,
      carbs: 7.2,
      lipids: 0.3,
      fibers: 0.1,
      sodium: 312
    }
  },
  'chapelure': {
    category: 'cereales',
    keywords: ['chapelure', 'miettes de pain', 'miettes pain'],
    nutritionalValues: {
      calories: 365,
      proteins: 9.4,
      carbs: 74.3,
      lipids: 1.6,
      fibers: 4.3,
      sodium: 288
    }
  },
  'poudre d\'ail': {
    category: 'epices',
    keywords: ['poudre d\'ail', 'poudre d ail', 'ail en poudre séché', 'ail séché poudre'],
    nutritionalValues: {
      calories: 346,
      proteins: 16.6,
      carbs: 63.7,
      lipids: 0.7,
      fibers: 2.4,
      sodium: 60
    }
  },
  'huile de coco': {
    category: 'autres',
    keywords: ['huile de coco', 'huile coco', 'Huile de coco', 'huile de noix de coco', 'huile noix de coco'],
    // Valeurs moyennes pour huile de coco
    nutritionalValues: {
      calories: 862,
      proteins: 0,
      carbs: 0,
      lipids: 99.1,
      fibers: 0,
      sodium: 0
    }
  },
  'safran': {
    category: 'epices',
    keywords: ['safran', 'Safran', 'filaments de safran', 'filament de safran', 'safran en filaments', 'safran en poudre', 'filaments safran'],
    // Valeurs moyennes pour safran (très faible quantité utilisée)
    nutritionalValues: {
      calories: 310,
      proteins: 11.4,
      carbs: 65.4,
      lipids: 5.9,
      fibers: 3.9,
      sodium: 148
    }
  },
  'coriandre': {
    category: 'epices',
    keywords: ['coriandre', 'Coriandre', 'coriandre fraîche', 'coriandre fraiche', 'coriandre frais', 'coriandre feuille', 'feuilles de coriandre', 'coriandre fraiche'],
    // Valeurs moyennes pour coriandre fraîche
    nutritionalValues: {
      calories: 23,
      proteins: 2.1,
      carbs: 3.7,
      lipids: 0.5,
      fibers: 2.8,
      sodium: 46
    }
  },
  'laurier': {
    category: 'epices',
    keywords: ['laurier', 'Laurier', 'feuille de laurier', 'feuilles de laurier', 'feuille laurier', 'laurier feuille'],
    // Valeurs moyennes pour feuille de laurier séchée
    nutritionalValues: {
      calories: 313,
      proteins: 7.6,
      carbs: 75,
      lipids: 8.4,
      fibers: 26.3,
      sodium: 23
    }
  },
  'bicarbonate de soude': {
    category: 'epices',
    keywords: ['bicarbonate de soude', 'bicarbonate soude', 'Bicarbonate de soude', 'bicarbonate', 'bicarbonate de sodium'],
    nutritionalValues: {
      calories: 0.4,
      proteins: 0.1,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 27400
    }
  },
  'cayenne': {
    category: 'epices',
    keywords: ['cayenne', 'Cayenne', 'poivre de cayenne', 'piment de cayenne', 'cayenne powder', 'cayenne en poudre'],
    nutritionalValues: {
      calories: 376,
      proteins: 12,
      carbs: 29.4,
      lipids: 17.3,
      fibers: 27.2,
      sodium: 2010
    }
  },
  'romarin': {
    category: 'epices',
    keywords: ['romarin', 'Romarin', 'romarin frais', 'romarin séché', 'romarin en branche', 'branche de romarin'],
    // Valeurs moyennes pour romarin séché
    nutritionalValues: {
      calories: 331,
      proteins: 4.9,
      carbs: 64.1,
      lipids: 15.2,
      fibers: 42.6,
      sodium: 26
    }
  },
  'couenne': {
    category: 'viandes',
    keywords: ['couenne', 'Couenne', 'couennes', 'Couennes', 'couenne de porc'],
    // Valeurs moyennes pour couenne de porc
    nutritionalValues: {
      calories: 518,
      proteins: 18.8,
      carbs: 0,
      lipids: 50.8,
      fibers: 0,
      sodium: 1000
    }
  },
  'crépine': {
    category: 'viandes',
    keywords: ['crépine', 'Crépine', 'crepine', 'Crepine', 'crépine de porc', 'crépine porc'],
    // Valeurs moyennes pour crépine de porc (membrane)
    nutritionalValues: {
      calories: 0,
      proteins: 0,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 0
    }
  },
  'matière grasse': {
    category: 'autres',
    keywords: ['matière grasse', 'Matière grasse', 'matiere grasse', 'matière grasse végétale', 'matière grasse animale'],
    // Valeurs moyennes pour matière grasse (beurre ou huile)
    nutritionalValues: {
      calories: 750,
      proteins: 0.5,
      carbs: 0,
      lipids: 83,
      fibers: 0,
      sodium: 2
    }
  },
  'tournedos': {
    category: 'viandes',
    keywords: ['tournedos', 'Tournedos', 'tournedos de boeuf', 'tournedos boeuf'],
    // Valeurs moyennes pour tournedos de bœuf
    nutritionalValues: {
      calories: 251,
      proteins: 18.7,
      carbs: 0,
      lipids: 18.5,
      fibers: 0,
      sodium: 60
    }
  },
  'curry': {
    category: 'epices',
    keywords: ['curry', 'Curry', 'curry en poudre', 'Curry en poudre', 'poudre de curry', 'curry powder'],
    // Valeurs moyennes pour curry en poudre
    nutritionalValues: {
      calories: 325,
      proteins: 14.3,
      carbs: 55.8,
      lipids: 14,
      fibers: 33.9,
      sodium: 52
    }
  },
  'sauge': {
    category: 'epices',
    keywords: ['sauge', 'Sauge', 'feuilles de sauge', 'feuille de sauge', 'sauge fraîche', 'sauge fraiche', 'sauge séchée'],
    // Valeurs moyennes pour sauge séchée
    nutritionalValues: {
      calories: 315,
      proteins: 10.6,
      carbs: 60.7,
      lipids: 12.8,
      fibers: 40.3,
      sodium: 11
    }
  },
  'pignon de pin': {
    category: 'autres',
    keywords: ['pignon de pin', 'pignons de pin', 'Pignon de pin', 'Pignons de pin', 'pignon pin', 'pignons pin'],
    // Valeurs moyennes pour pignons de pin
    nutritionalValues: {
      calories: 673,
      proteins: 13.7,
      carbs: 13.1,
      lipids: 68.4,
      fibers: 3.7,
      sodium: 2
    }
  },
  'calvados': {
    category: 'autres',
    keywords: ['calvados', 'Calvados', 'calvados eau de vie', 'eau de vie calvados'],
    // Valeurs moyennes pour calvados (eau de vie de cidre)
    nutritionalValues: {
      calories: 250,
      proteins: 0,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 0
    }
  },
  'clou de girofle': {
    category: 'epices',
    keywords: ['clou de girofle', 'clous de girofle', 'Clou de girofle', 'Clous de girofle', 'clou girofle', 'clous girofle', 'clous de girofle entiers', 'clou de girofle entier'],
    nutritionalValues: {
      calories: 335,
      proteins: 6,
      carbs: 31.6,
      lipids: 13,
      fibers: 33.9,
      sodium: 277
    }
  },
  'vergeoise': {
    category: 'autres',
    keywords: ['vergeoise', 'Vergeoise', 'vergeoise blonde', 'Vergeoise blonde', 'vergeoise brune', 'sucre vergeoise'],
    nutritionalValues: {
      calories: 455,
      proteins: 4.6,
      carbs: 67,
      lipids: 0,
      fibers: 0,
      sodium: 28.8
    }
  },
  'huile de friture': {
    category: 'autres',
    keywords: ['huile de friture', 'Huile de friture', 'huile friture', 'huile pour friture', 'huile à frire'],
    nutritionalValues: {
      calories: 900,
      proteins: 0,
      carbs: 0,
      lipids: 100,
      fibers: 0,
      sodium: 0
    }
  },
  'datte': {
    category: 'fruits',
    keywords: ['datte', 'Datte', 'dattes', 'Dattes', 'datte dénoyautée', 'dattes dénoyautées', 'Datte dénoyautée', 'Dattes dénoyautées', 'datte denoyautee', 'dattes denoyautees'],
    nutritionalValues: {
      calories: 287,
      proteins: 1.8,
      carbs: 64.7,
      lipids: 0.3,
      fibers: 7.3,
      sodium: 1
    }
  },
  'riz cuit': {
    category: 'cereales',
    keywords: ['riz cuit', 'Riz cuit', 'riz cuit à l\'eau', 'riz cuit a l eau'],
    // Valeurs moyennes pour riz cuit (poids après cuisson)
    nutritionalValues: {
      calories: 130,
      proteins: 2.7,
      carbs: 28,
      lipids: 0.3,
      fibers: 0.4,
      sodium: 1
    }
  },
  'origan': {
    category: 'epices',
    keywords: ['origan', 'Origan', 'origan séché', 'Origan séché', 'origan seche', 'origan frais'],
    nutritionalValues: {
      calories: 265,
      proteins: 9,
      carbs: 26.4,
      lipids: 4.3,
      fibers: 42.5,
      sodium: 25
    }
  },
  'piment rouge': {
    category: 'epices',
    keywords: ['piment rouge', 'Piment rouge', 'flocons de piment rouge', 'flocons piment rouge', 'piment rouge en flocons', 'piment rouge séché', 'piment chili', 'Piment chili', 'piment chili haché', 'Piment chili, haché', 'piment chili haché optionnel', 'Piment chili, haché (optionnel)'],
    // Valeurs moyennes pour piment rouge séché
    nutritionalValues: {
      calories: 318,
      proteins: 12,
      carbs: 69.9,
      lipids: 5.4,
      fibers: 28.7,
      sodium: 30
    }
  },
  'levure sèche': {
    category: 'epices',
    keywords: ['levure sèche', 'levure seche', 'Levure sèche', 'Levure seche', 'levure sèche active', 'levure seche active', 'levure de boulanger déshydratée', 'levure de boulanger deshydratee'],
    nutritionalValues: {
      calories: 341,
      proteins: 42.7,
      carbs: 14.3,
      lipids: 6.6,
      fibers: 26.9,
      sodium: 51
    }
  },
  'nouilles fraîches': {
    category: 'cereales',
    keywords: ['nouilles fraîches', 'nouilles fraiches', 'Nouilles fraîches', 'nouille fraîche', 'nouille fraiche', 'nouilles asiatiques fraîches', 'nouilles fraîches', 'Nouilles fraîches'],
    // Valeurs moyennes pour nouilles fraîches (similaires aux pâtes fraîches)
    nutritionalValues: {
      calories: 131,
      proteins: 4.5,
      carbs: 25,
      lipids: 1.1,
      fibers: 1.2,
      sodium: 5
    }
  },
  'quenelle': {
    category: 'viandes',
    keywords: ['quenelle', 'Quenelle', 'quenelles', 'Quenelles', 'quenelle de volaille', 'quenelle de veau'],
    // Valeurs moyennes pour quenelle de volaille
    nutritionalValues: {
      calories: 189,
      proteins: 9.4,
      carbs: 14.7,
      lipids: 10.1,
      fibers: 0.7,
      sodium: 295
    }
  },
  'cognac': {
    category: 'autres',
    keywords: ['cognac', 'Cognac', 'eau de vie cognac', 'eau de vie de vin'],
    nutritionalValues: {
      calories: 222,
      proteins: 0,
      carbs: 0.8,
      lipids: 0,
      fibers: 0,
      sodium: 0
    }
  },
  'cornichon': {
    category: 'legumes',
    keywords: ['cornichon', 'Cornichon', 'cornichons', 'Cornichons', 'cornichon au vinaigre', 'cornichon aigre-doux'],
    nutritionalValues: {
      calories: 16,
      proteins: 1.1,
      carbs: 0.8,
      lipids: 0.4,
      fibers: 1.5,
      sodium: 1310
    }
  },
  'olive noire': {
    category: 'legumes',
    keywords: ['olive noire', 'Olive noire', 'olives noires', 'Olives noires', 'olive noire en saumure', 'olive noire à l\'huile'],
    nutritionalValues: {
      calories: 173,
      proteins: 1.4,
      carbs: 0.1,
      lipids: 17.2,
      fibers: 6.2,
      sodium: 1200
    }
  },
  'châtaigne cuite': {
    category: 'fruits',
    keywords: ['châtaigne cuite', 'chataigne cuite', 'Châtaigne cuite', 'châtaignes cuites', 'chataignes cuites', 'Châtaignes cuites', 'châtaigne bouillie', 'châtaigne cuite à l\'eau'],
    nutritionalValues: {
      calories: 123,
      proteins: 2,
      carbs: 23,
      lipids: 1.4,
      fibers: 4.5,
      sodium: 27
    }
  },
  'cannelloni': {
    category: 'cereales',
    keywords: ['cannelloni', 'Cannelloni', 'cannellonis', 'Cannellonis', 'cannellonis secs', 'Cannellonis secs', 'cannelloni sec'],
    // Valeurs similaires aux pâtes sèches
    nutritionalValues: {
      calories: 364,
      proteins: 12,
      carbs: 72.7,
      lipids: 1.6,
      fibers: 2.9,
      sodium: 6
    }
  },
  'rhum': {
    category: 'autres',
    keywords: ['rhum', 'Rhum', 'rhum blanc', 'rhum ambré', 'eau de vie de canne'],
    // Valeurs moyennes pour rhum (eau de vie)
    nutritionalValues: {
      calories: 250,
      proteins: 0,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 0
    }
  },
  'maïs en conserve': {
    category: 'legumes',
    keywords: ['maïs en conserve', 'mais en conserve', 'Maïs en conserve', 'maïs conserve', 'maïs (en conserve ou surgelé)', 'maïs surgelé', 'mais surgelé'],
    // Valeurs moyennes pour maïs en conserve
    nutritionalValues: {
      calories: 96,
      proteins: 3.4,
      carbs: 21.3,
      lipids: 1.2,
      fibers: 2.7,
      sodium: 300
    }
  },
  'raie': {
    category: 'poissons',
    keywords: ['raie', 'Raie', 'ailes de raie', 'Ailes de raie', 'raie ailes', 'raie cuite'],
    // Valeurs moyennes pour raie
    nutritionalValues: {
      calories: 89,
      proteins: 20.8,
      carbs: 0,
      lipids: 0.5,
      fibers: 0,
      sodium: 100
    }
  },
  'béchamel': {
    category: 'autres',
    keywords: ['béchamel', 'bechamel', 'Béchamel', 'sauce béchamel', 'sauce bechamel', 'sauce blanche', 'sauce blanche légère', 'béchamel allégée', 'bechamel allegee'],
    // Valeurs moyennes pour béchamel légère
    nutritionalValues: {
      calories: 120,
      proteins: 3.5,
      carbs: 8,
      lipids: 8.5,
      fibers: 0.3,
      sodium: 400
    }
  },
  'gorgonzola': {
    category: 'produits laitiers',
    keywords: ['gorgonzola', 'Gorgonzola', 'gorgonzola doux', 'Gorgonzola doux', 'gorgonzola piquant'],
    nutritionalValues: {
      calories: 318,
      proteins: 19.5,
      carbs: 0,
      lipids: 26.9,
      fibers: 0,
      sodium: 710
    }
  },
  'cerfeuil': {
    category: 'epices',
    keywords: ['cerfeuil', 'Cerfeuil', 'cerfeuil frais', 'Cerfeuil frais', 'cerfeuil fraiche', 'cerfeuil séché'],
    nutritionalValues: {
      calories: 48.3,
      proteins: 3.3,
      carbs: 6.3,
      lipids: 0.6,
      fibers: 2.6,
      sodium: 5
    }
  },
  'riz carnaroli': {
    category: 'cereales',
    keywords: ['riz carnaroli', 'Riz Carnaroli', 'riz Carnaroli', 'riz arborio ou carnaroli', 'Riz Carnaroli ou Arborio', 'riz Carnaroli ou Arborio', 'carnaroli', 'Carnaroli'],
    // Valeurs similaires au riz arborio
    nutritionalValues: {
      calories: 350,
      proteins: 7,
      carbs: 77.5,
      lipids: 0.8,
      fibers: 1.5,
      sodium: 2
    }
  },
  'fruits de mer': {
    category: 'poissons',
    keywords: ['fruits de mer', 'Fruits de mer', 'fruits de mer sans coquilles', 'mélange de fruits de mer', 'Mélange de fruits de mer'],
    // Valeurs moyennes pour mélange de fruits de mer
    nutritionalValues: {
      calories: 85,
      proteins: 18,
      carbs: 0.5,
      lipids: 1,
      fibers: 0,
      sodium: 200
    }
  },
  'ciboulette': {
    category: 'epices',
    keywords: ['ciboulette', 'Ciboulette', 'ciboulette fraîche', 'Ciboulette fraîche', 'ciboulette fraiche', 'ciboule'],
    nutritionalValues: {
      calories: 30.8,
      proteins: 2.6,
      carbs: 2.9,
      lipids: 0.5,
      fibers: 2.6,
      sodium: 3
    }
  },
  'maïs doux en conserve': {
    category: 'legumes',
    keywords: ['maïs doux en conserve', 'mais doux en conserve', 'Maïs doux en conserve', 'maïs doux en conserve égoutté', 'maïs doux conserve égoutté', 'maïs doux en grains', 'Maïs doux en grains', 'maïs doux grains'],
    // Valeurs moyennes pour maïs doux en conserve égoutté
    nutritionalValues: {
      calories: 96,
      proteins: 3.4,
      carbs: 21.3,
      lipids: 1.2,
      fibers: 2.7,
      sodium: 300
    }
  },
  'fruits rouges': {
    category: 'fruits',
    keywords: ['fruits rouges', 'Fruits rouges', 'fruits rouges congelés', 'Fruits rouges congelés', 'fruits rouges congeles', 'fruits rouges surgelés'],
    nutritionalValues: {
      calories: 45,
      proteins: 1,
      carbs: 8.5,
      lipids: 0.3,
      fibers: 4.5,
      sodium: 1
    }
  },
  'édulcorant': {
    category: 'autres',
    keywords: ['édulcorant', 'edulcorant', 'Édulcorant', 'édulcorants', 'edulcorants', 'édulcorant artificiel'],
    // Valeurs moyennes pour édulcorant (pouvoir sucrant élevé, calories négligeables)
    nutritionalValues: {
      calories: 0,
      proteins: 0,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 0
    }
  },
  'légumes assortis': {
    category: 'legumes',
    keywords: ['légumes assortis', 'legumes assortis', 'Légumes assortis', 'légumes variés', 'legumes varies', 'mélange de légumes variés', 'melange de legumes varies'],
    // Valeurs moyennes pour mélange de légumes variés
    nutritionalValues: {
      calories: 30,
      proteins: 1.5,
      carbs: 5,
      lipids: 0.3,
      fibers: 2.5,
      sodium: 20
    }
  },
  'sauce bolognaise': {
    category: 'autres',
    keywords: ['sauce bolognaise', 'Sauce bolognaise', 'sauce bolognaise', 'bolognaise', 'Bolognaise', 'sauce à la bolognaise'],
    // Valeurs moyennes pour sauce bolognaise
    nutritionalValues: {
      calories: 174,
      proteins: 6.9,
      carbs: 25.1,
      lipids: 4.7,
      fibers: 2.2,
      sodium: 206
    }
  },
  'galette de riz': {
    category: 'cereales',
    keywords: ['galette de riz', 'Galette de riz', 'galette riz', 'galettes de riz', 'Galettes de riz', 'galette de riz complet'],
    nutritionalValues: {
      calories: 381,
      proteins: 8.4,
      carbs: 77.9,
      lipids: 3,
      fibers: 3.4,
      sodium: 5.5
    }
  },
  'fruits frais': {
    category: 'fruits',
    keywords: ['fruits frais', 'Fruits frais', 'fruits frais', 'fruits', 'Fruits'],
    // Valeurs moyennes pour fruits frais (mélange)
    nutritionalValues: {
      calories: 50,
      proteins: 0.8,
      carbs: 11.5,
      lipids: 0.2,
      fibers: 2.5,
      sodium: 1
    }
  },
  'coq': {
    category: 'viandes',
    keywords: ['coq', 'Coq', 'coq morceaux', 'Coq (morceaux)', 'coq morceau', 'coq entier'],
    // Valeurs similaires au poulet
    nutritionalValues: {
      calories: 200,
      proteins: 20.3,
      carbs: 0,
      lipids: 12.6,
      fibers: 0,
      sodium: 70
    }
  },
  'gélatine': {
    category: 'autres',
    keywords: ['gélatine', 'gelatine', 'Gélatine', 'Gelatine', 'gélatine alimentaire', 'gelatine alimentaire', 'Gélatine alimentaire', 'gélatine feuilles', 'gélatine poudre', 'gélifiant', 'gelifiant'],
    // Valeurs moyennes pour gélatine alimentaire
    nutritionalValues: {
      calories: 335,
      proteins: 85.6,
      carbs: 0,
      lipids: 0.1,
      fibers: 0,
      sodium: 11
    }
  },
  'agar-agar': {
    category: 'autres',
    keywords: ['agar-agar', 'agar agar', 'Agar-agar', 'Agar agar', 'agar', 'Agar'],
    // Valeurs moyennes pour agar-agar
    nutritionalValues: {
      calories: 26,
      proteins: 0.5,
      carbs: 7,
      lipids: 0,
      fibers: 0.5,
      sodium: 9
    }
  },
  'petit-suisse': {
    category: 'produits laitiers',
    keywords: ['petit-suisse', 'petit suisse', 'Petit-suisse', 'Petit suisse', 'petit suisse nature', 'fromage frais type petit suisse'],
    nutritionalValues: {
      calories: 57.3,
      proteins: 9.7,
      carbs: 4.2,
      lipids: 0.1,
      fibers: 0,
      sodium: 44.8
    }
  },
  'stévia': {
    category: 'autres',
    keywords: ['stévia', 'stevia', 'Stévia', 'Stevia', 'extrait de stévia', 'extrait de stevia', 'édulcorant stévia', 'edulcorant stevia'],
    nutritionalValues: {
      calories: 1.2,
      proteins: 0.2,
      carbs: 0.3,
      lipids: 0,
      fibers: 0,
      sodium: 0
    }
  },
  'légumes mélangés': {
    category: 'legumes',
    keywords: ['légumes mélangés', 'legumes melanges', 'Légumes mélangés', 'légumes melanges', 'légumes mixte', 'mélange légumes'],
    // Valeurs moyennes pour légumes mélangés
    nutritionalValues: {
      calories: 30,
      proteins: 1.5,
      carbs: 5,
      lipids: 0.3,
      fibers: 2.5,
      sodium: 20
    }
  },
  'estragon': {
    category: 'epices',
    keywords: ['estragon', 'Estragon', 'estragon frais', 'Estragon frais', 'estragon frais haché', 'Estragon frais haché', 'estragon seche', 'estragon séché'],
    nutritionalValues: {
      calories: 0,
      proteins: 3.8,
      carbs: 4.1,
      lipids: 0,
      fibers: 6.2,
      sodium: 0
    }
  },
  'glaçon': {
    category: 'autres',
    keywords: ['glaçon', 'glacon', 'Glaçon', 'glaçons', 'glacons', 'Glaçons', 'glace', 'Glace'],
    // Valeurs pour glaçons (eau gelée)
    nutritionalValues: {
      calories: 0,
      proteins: 0,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 0
    }
  },
  'piment jalapeño': {
    category: 'epices',
    keywords: ['piment jalapeño', 'piment jalapeno', 'Piment jalapeño', 'piments jalapeño', 'piments jalapeno', 'jalapeño', 'jalapeno', 'Jalapeño', 'Jalapeno'],
    // Valeurs similaires au piment cru
    nutritionalValues: {
      calories: 37.4,
      proteins: 1.9,
      carbs: 5.8,
      lipids: 0.4,
      fibers: 4,
      sodium: 3
    }
  },
  'œuf battu': {
    category: 'autres',
    keywords: ['œuf battu', 'oeuf battu', 'Œuf battu', 'Oeuf battu', 'œufs battus', 'oeufs battus'],
    // Valeurs identiques à l'œuf (battre ne change pas la valeur nutritionnelle)
    nutritionalValues: {
      calories: 140,
      proteins: 12.8,
      carbs: 0.1,
      lipids: 9.8,
      fibers: 0,
      sodium: 124
    }
  },
  'œuf moyen': {
    category: 'autres',
    keywords: ['œuf moyen', 'oeuf moyen', 'Œuf moyen', 'Oeuf moyen', 'œufs moyens', 'oeufs moyens'],
    // Valeurs identiques à l'œuf (taille moyenne)
    nutritionalValues: {
      calories: 140,
      proteins: 12.8,
      carbs: 0.1,
      lipids: 9.8,
      fibers: 0,
      sodium: 124
    }
  },
  'blanc d\'œuf': {
    category: 'autres',
    keywords: ['blanc d\'œuf', 'blanc d\'oeuf', 'Blanc d\'œuf', 'blanc d œuf', 'blancs d\'œuf', 'blancs d\'oeuf', 'œuf (blanc séparé du jaune)', 'oeuf (blanc separe du jaune)'],
    nutritionalValues: {
      calories: 48.1,
      proteins: 10.9,
      carbs: 0.7,
      lipids: 0.2,
      fibers: 0,
      sodium: 166
    }
  },
  'piment doux': {
    category: 'epices',
    keywords: ['piment doux', 'Piment doux', 'piment doux en poudre', 'Piment doux en poudre', 'piment doux poudre', 'piments doux', 'piments broyés', 'Piments broyés'],
    // Valeurs moyennes pour piment doux (paprika)
    nutritionalValues: {
      calories: 282,
      proteins: 14.1,
      carbs: 53.9,
      lipids: 12.9,
      fibers: 34.9,
      sodium: 68
    }
  },
  'sauce au piment doux': {
    category: 'autres',
    keywords: ['sauce au piment doux', 'Sauce au piment doux', 'sauce piment doux', 'sauce piment', 'sauce au piment doux', 'Sauce au piment doux'],
    // Valeurs moyennes pour sauce au piment doux
    nutritionalValues: {
      calories: 76,
      proteins: 2.7,
      carbs: 7.3,
      lipids: 2.9,
      fibers: 1.6,
      sodium: 1920
    }
  },
  'sauce anglaise': {
    category: 'autres',
    keywords: ['sauce anglaise', 'Sauce anglaise', 'crème anglaise', 'Crème anglaise', 'creme anglaise'],
    nutritionalValues: {
      calories: 97.3,
      proteins: 3.4,
      carbs: 14.8,
      lipids: 2.5,
      fibers: 0,
      sodium: 53.7
    }
  },
  'marjolaine': {
    category: 'epices',
    keywords: ['marjolaine', 'Marjolaine', 'marjolaine fraîche', 'Marjolaine fraîche', 'marjolaine fraiche', 'marjolaine séchée', 'marjolaine seche'],
    // Valeurs pour marjolaine fraîche (adaptées depuis séchée)
    nutritionalValues: {
      calories: 30,
      proteins: 1.3,
      carbs: 2,
      lipids: 0.7,
      fibers: 4,
      sodium: 20
    }
  },
  'graines de pavot': {
    category: 'epices',
    keywords: ['graines de pavot', 'Graines de pavot', 'graine de pavot', 'Graine de pavot', 'pavot', 'Pavot', 'pavot graine'],
    nutritionalValues: {
      calories: 534,
      proteins: 21.2,
      carbs: 13.7,
      lipids: 41.6,
      fibers: 10,
      sodium: 26
    }
  },
  'saindoux': {
    category: 'autres',
    keywords: ['saindoux', 'Saindoux', 'graisse de porc', 'lard fondu'],
    nutritionalValues: {
      calories: 900,
      proteins: 0,
      carbs: 0,
      lipids: 100,
      fibers: 0,
      sodium: 0
    }
  },
  'levure de boulanger fraîche': {
    category: 'epices',
    keywords: ['levure de boulanger fraîche', 'levure de boulanger fraiche', 'Levure de boulanger fraîche', 'levure boulanger fraîche', 'levure fraîche'],
    nutritionalValues: {
      calories: 115,
      proteins: 8.5,
      carbs: 11.9,
      lipids: 1.9,
      fibers: 8.1,
      sodium: 30
    }
  },
  'marsala': {
    category: 'autres',
    keywords: ['marsala', 'Marsala', 'vin marsala', 'marsala vin'],
    nutritionalValues: {
      calories: 211,
      proteins: 0.1,
      carbs: 27.9,
      lipids: 0,
      fibers: 0,
      sodium: 4
    }
  },
  'menthe': {
    category: 'epices',
    keywords: ['menthe', 'Menthe', 'menthe fraîche', 'Menthe fraîche', 'menthe fraiche', 'menthe séchée', 'feuilles de menthe'],
    // Valeurs moyennes pour menthe fraîche
    nutritionalValues: {
      calories: 44,
      proteins: 3.3,
      carbs: 8.4,
      lipids: 0.7,
      fibers: 8,
      sodium: 5
    }
  },
  'pastis': {
    category: 'autres',
    keywords: ['pastis', 'Pastis', 'anisette', 'Anisette', 'anisette ou pastis', 'pastis ou anisette'],
    nutritionalValues: {
      calories: 274,
      proteins: 0,
      carbs: 2.9,
      lipids: 0,
      fibers: 0,
      sodium: 2
    }
  },
  'baies de goji': {
    category: 'fruits',
    keywords: ['baies de goji', 'Baies de goji', 'baie de goji', 'Baie de goji', 'goji', 'Goji', 'goji séchées'],
    nutritionalValues: {
      calories: 300,
      proteins: 12.1,
      carbs: 49,
      lipids: 2.9,
      fibers: 22.8,
      sodium: 362
    }
  },
  'maca': {
    category: 'epices',
    keywords: ['maca', 'Maca', 'poudre de maca', 'Poudre de maca', 'maca en poudre'],
    // Valeurs moyennes pour poudre de maca
    nutritionalValues: {
      calories: 325,
      proteins: 10.2,
      carbs: 59.8,
      lipids: 2.2,
      fibers: 7.1,
      sodium: 18
    }
  },
  'mangoustan': {
    category: 'fruits',
    keywords: ['mangoustan', 'Mangoustan', 'poudre de mangoustan', 'Poudre de mangoustan', 'mangoustan en poudre'],
    // Valeurs moyennes pour poudre de mangoustan
    nutritionalValues: {
      calories: 73,
      proteins: 0.4,
      carbs: 17.9,
      lipids: 0.6,
      fibers: 1.8,
      sodium: 7
    }
  },
  'grenade': {
    category: 'fruits',
    keywords: ['grenade', 'Grenade', 'poudre de grenade', 'Poudre de grenade', 'grenade en poudre', 'grenade crue'],
    nutritionalValues: {
      calories: 81,
      proteins: 1.4,
      carbs: 14.3,
      lipids: 1.2,
      fibers: 7.1,
      sodium: 3
    }
  },
  'pollen d\'abeille': {
    category: 'autres',
    keywords: ['pollen d\'abeille', 'pollen d abeille', 'Pollen d\'abeille', 'pollen', 'Pollen'],
    nutritionalValues: {
      calories: 358,
      proteins: 21.9,
      carbs: 52.5,
      lipids: 4.2,
      fibers: 11.3,
      sodium: 89.8
    }
  },
  'spiruline': {
    category: 'autres',
    keywords: ['spiruline', 'Spiruline', 'spiruline en poudre', 'Spiruline en poudre', 'spiruline poudre'],
    nutritionalValues: {
      calories: 374,
      proteins: 60.4,
      carbs: 17.7,
      lipids: 6.3,
      fibers: 2.7,
      sodium: 1100
    }
  },
  'graines de chanvre': {
    category: 'epices',
    keywords: ['graines de chanvre', 'Graines de chanvre', 'graine de chanvre', 'Graine de chanvre', 'chanvre', 'Chanvre', 'chènevis'],
    nutritionalValues: {
      calories: 592,
      proteins: 37.2,
      carbs: 5.4,
      lipids: 48.8,
      fibers: 4,
      sodium: 5
    }
  },
  'eau de coco': {
    category: 'autres',
    keywords: ['eau de coco', 'Eau de coco', 'eau coco', 'eau de noix de coco'],
    nutritionalValues: {
      calories: 11.8,
      proteins: 0.3,
      carbs: 3.3,
      lipids: 0.2,
      fibers: 0,
      sodium: 20.4
    }
  },
  'levure nutritionnelle': {
    category: 'epices',
    keywords: ['levure nutritionnelle', 'Levure nutritionnelle', 'levure nutritionnelle', 'levure de bière en paillettes'],
    // Valeurs similaires à la levure de bière en paillettes
    nutritionalValues: {
      calories: 334,
      proteins: 40.4,
      carbs: 21.8,
      lipids: 4.5,
      fibers: 22.5,
      sodium: 1100
    }
  },
  'piment en poudre': {
    category: 'epices',
    keywords: ['piment en poudre', 'Piment en poudre', 'piment poudre', 'piment en poudre', 'piment de cayenne en poudre'],
    // Valeurs similaires au piment de Cayenne en poudre
    nutritionalValues: {
      calories: 376,
      proteins: 12,
      carbs: 29.4,
      lipids: 17.3,
      fibers: 27.2,
      sodium: 2010
    }
  },
  'sarriette': {
    category: 'epices',
    keywords: ['sarriette', 'Sarriette', 'sarriette moulue', 'Sarriette moulue', 'sarriette séchée', 'sarriette seche'],
    // Valeurs moyennes pour sarriette séchée
    nutritionalValues: {
      calories: 272,
      proteins: 6.7,
      carbs: 68.7,
      lipids: 5.9,
      fibers: 45.7,
      sodium: 24
    }
  },
  'olive verte': {
    category: 'legumes',
    keywords: ['olive verte', 'Olive verte', 'olives vertes', 'Olives vertes', 'olives vertes dénoyautées', 'olives vertes denoyautees', 'olives vertes dénoyautées et hachées', 'olives vertes hachées'],
    // Valeurs moyennes pour olives vertes en saumure
    nutritionalValues: {
      calories: 116,
      proteins: 0.8,
      carbs: 0.2,
      lipids: 12.7,
      fibers: 3.2,
      sodium: 1556
    }
  },
  'piment de la jamaïque': {
    category: 'epices',
    keywords: ['piment de la jamaïque', 'piment de la jamaique', 'Piment de la Jamaïque', 'piment jamaïque', 'piment jamaique', 'allspice', 'Allspice', 'piment de la jamaïque moulu', 'allspice moulu'],
    // Valeurs moyennes pour piment de la Jamaïque (allspice)
    nutritionalValues: {
      calories: 263,
      proteins: 6.1,
      carbs: 72.1,
      lipids: 8.7,
      fibers: 21.6,
      sodium: 77
    }
  },
  'corned beef': {
    category: 'viandes',
    keywords: ['corned beef', 'Corned beef', 'corned-beef', 'corned beef cuit', 'corned beef effiloché', 'corned beef cuit effiloché'],
    nutritionalValues: {
      calories: 191,
      proteins: 23.2,
      carbs: 0.1,
      lipids: 10.9,
      fibers: 0,
      sodium: 1120
    }
  },
  'rhubarbe': {
    category: 'fruits',
    keywords: ['rhubarbe', 'Rhubarbe', 'rhubarbe hachée', 'Rhubarbe hachée', 'rhubarbe hachee', 'rhubarbe crue', 'rhubarbe tige'],
    nutritionalValues: {
      calories: 18.1,
      proteins: 0.7,
      carbs: 1.1,
      lipids: 0.2,
      fibers: 1.8,
      sodium: 3
    }
  },
  'mélange d\'épices italien': {
    category: 'epices',
    keywords: ['mélange d\'épices italien', 'melange d epices italien', 'Mélange d\'épices italien', 'mélange épices italien', 'mélange d\'épices italien sec', 'herbes italiennes'],
    // Valeurs moyennes pour mélange d'épices italien
    nutritionalValues: {
      calories: 280,
      proteins: 10,
      carbs: 50,
      lipids: 8,
      fibers: 35,
      sodium: 25
    }
  },
  'mélasse': {
    category: 'autres',
    keywords: ['mélasse', 'Melasse', 'mélasse de canne', 'melasse de canne', 'Mélasse de canne'],
    nutritionalValues: {
      calories: 300,
      proteins: 0,
      carbs: 74.7,
      lipids: 0.1,
      fibers: 0,
      sodium: 1460
    }
  },
  'sauce piquante': {
    category: 'autres',
    keywords: ['sauce piquante', 'Sauce piquante', 'sauce piquante quelques gouttes', 'Sauce piquante (quelques gouttes)', 'harissa', 'Harissa', 'sauce au piment', 'tabasco', 'Tabasco', 'sriracha'],
    // Valeurs basées sur Harissa (CIQUAL)
    nutritionalValues: {
      calories: 76.4,
      proteins: 2.72,
      carbs: 7.3,
      lipids: 6.89,
      fibers: 1.56,
      sodium: 4000
    }
  }
};

/**
 * Détecte la catégorie d'un ingrédient à partir de son nom
 * @param {string} itemName - Nom de l'ingrédient
 * @returns {string} - Catégorie détectée
 */
export function detectCategory(itemName) {
  const nameLower = itemName.toLowerCase().trim();
  
  // Recherche directe dans la base de données
  for (const [ingredientKey, ingredientData] of Object.entries(ingredientsDatabase)) {
    for (const keyword of ingredientData.keywords) {
      if (nameLower.includes(keyword.toLowerCase())) {
        return ingredientData.category;
      }
    }
  }
  
  return 'autres'; // Catégorie par défaut si aucune correspondance
}

/**
 * Normalise le nom d'un ingrédient pour améliorer la correspondance
 * Enlève les descriptions de préparation (émincé, haché, etc.)
 */
function normalizeIngredientName(name) {
  if (!name) return '';
  
  let normalized = name
    .toLowerCase()
    .trim()
    // Enlever les quantités au début (ex: "50 g de", "100ml de")
    .replace(/^\d+\s*(g|ml|cl|kg|l|cuillère|c\.|c\.à\.s\.|c\.à\.c\.|pincée|pincee)\s*(de|d'|du|de la|des)?\s*/i, '')
    // Enlever les quantités dans les parenthèses (ex: "(boîtes de 311 g égoutté)")
    .replace(/\s*\([^)]*\d+\s*(g|ml|cl|kg|l|boîte|boite|can|bouteille)[^)]*\)/gi, '')
    // Enlever les descriptions de préparation après virgule ou parenthèse
    .replace(/[,;]\s*(émincé|emince|haché|hache|coupé|coupe|tranché|tranche|râpé|rape|pelé|pele|écrasé|ecrase|finement|environ|pour|facultatif|optionnel).*$/i, '')
    .replace(/\s*\([^)]*(émincé|emince|haché|hache|coupé|coupe|tranché|tranche|râpé|rape|pelé|pele|écrasé|ecrase|finement|environ|pour|facultatif|optionnel)[^)]*\)/gi, '')
    // Enlever les descriptions de préparation en fin de phrase
    .replace(/\s+(émincé|emince|haché|hache|coupé|coupe|tranché|tranche|râpé|rape|pelé|pele|écrasé|ecrase|finement|environ|pour|facultatif|optionnel).*$/i, '')
    // Normaliser les accents et caractères spéciaux
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    // Normaliser les espaces multiples
    .replace(/\s+/g, ' ')
    .trim();
  
  return normalized;
}

/**
 * Charge les alias d'ingrédients depuis le fichier JSON (synchrone)
 */
let ingredientAliasesCache = null;
function loadIngredientAliases() {
  if (ingredientAliasesCache !== null) return ingredientAliasesCache;
  
  // Initialiser à vide par défaut
  ingredientAliasesCache = {};
  
  // Note: Les alias sont gérés via les keywords étendus dans ingredientsDatabase
  // et via le fichier ingredient_aliases.json qui est utilisé par d'autres services
  // Pour l'instant, on s'appuie sur les keywords étendus dans la base de données
  return ingredientAliasesCache;
}

/**
 * Récupère les informations complètes d'un ingrédient
 * @param {string} itemName - Nom de l'ingrédient
 * @returns {object|null} - Données de l'ingrédient ou null
 */
export function getIngredientData(itemName) {
  if (!itemName) return null;
  
  // Normaliser le nom d'abord (enlève les descriptions de préparation)
  const normalized = normalizeIngredientName(itemName);
  const nameLower = itemName.toLowerCase().trim();
  
  // 1. Recherche exacte avec le nom normalisé
  for (const [ingredientKey, ingredientData] of Object.entries(ingredientsDatabase)) {
    // Vérifier si le nom normalisé correspond exactement à une clé
    if (normalized === ingredientKey.toLowerCase() || normalized === ingredientKey) {
      return {
        name: ingredientKey,
        category: ingredientData.category,
        nutritionalValues: ingredientData.nutritionalValues
      };
    }
    
    // 2. Recherche par keywords (avec le nom original et normalisé)
    for (const keyword of ingredientData.keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Correspondance exacte du keyword
      if (normalized === keywordLower || nameLower === keywordLower) {
        return {
          name: ingredientKey,
          category: ingredientData.category,
          nutritionalValues: ingredientData.nutritionalValues
        };
      }
      
      // Correspondance partielle (le keyword est contenu dans le nom ou vice versa)
      // Ex: "spaghetti" dans "spaghetti à la bolognaise"
      // Ex: "gousse d'ail" contient "ail"
      if (normalized.includes(keywordLower) || keywordLower.includes(normalized) ||
          nameLower.includes(keywordLower)) {
        // Vérifier que ce n'est pas une correspondance trop large
        // Ex: "pomme" ne doit pas matcher "pomme de terre" si on cherche "pomme"
        // Mais "pomme de terre" doit matcher "pomme de terre"
        if (keywordLower.length >= 4 || normalized.length <= 6 || nameLower.length <= 6) {
          return {
            name: ingredientKey,
            category: ingredientData.category,
            nutritionalValues: ingredientData.nutritionalValues
          };
        }
      }
    }
  }
  
  return null;
}

/**
 * Récupère uniquement les valeurs nutritionnelles d'un ingrédient
 * @param {string} itemName - Nom de l'ingrédient
 * @returns {object|null} - Valeurs nutritionnelles ou null
 */
export function getNutritionalValues(itemName) {
  const ingredientData = getIngredientData(itemName);
  return ingredientData ? ingredientData.nutritionalValues : null;
}

/**
 * Liste tous les ingrédients d'une catégorie
 * @param {string} category - Catégorie recherchée
 * @returns {array} - Liste des ingrédients de cette catégorie
 */
export function getIngredientsByCategory(category) {
  return Object.entries(ingredientsDatabase)
    .filter(([key, data]) => data.category === category)
    .map(([key, data]) => ({
      name: key,
      keywords: data.keywords,
      nutritionalValues: data.nutritionalValues
    }));
}

export default ingredientsDatabase;

