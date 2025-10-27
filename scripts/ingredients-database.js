
// scripts/ingredients-database.js
// Base de données complète des ingrédients avec catégories et valeurs nutritionnelles (pour 100g)

export const ingredientsDatabase = {
  // ========== LÉGUMES ==========
  'tomate': {
    category: 'legumes',
    keywords: ['tomate', 'tomates'],
    nutritionalValues: {
      calories: 18,
      proteins: 0.9,
      carbs: 3.9,
      lipids: 0.2,
      fibers: 1.2,
      vitaminC: 13.7,
      vitaminA: 42,
      vitaminE: 0.54,
      vitaminK: 7.9,
      vitaminB6: 0.08,
      potassium: 237,
      calcium: 10,
      iron: 0.27,
      magnesium: 11,
      phosphore: 24,
      zinc: 0.17
    }
  },
  'carotte': {
    category: 'legumes',
    keywords: ['carotte', 'carottes'],
    nutritionalValues: {
      calories: 41,
      proteins: 0.9,
      carbs: 9.6,
      lipids: 0.2,
      fibers: 2.8,
      vitaminC: 5.9,
      vitaminA: 835,
      vitaminE: 0.66,
      vitaminK: 13.2,
      vitaminB6: 0.14,
      potassium: 320,
      calcium: 33,
      iron: 0.3,
      magnesium: 12,
      phosphore: 35,
      zinc: 0.24
    }
  },
  'oignon': {
    category: 'legumes',
    keywords: ['oignon', 'oignons'],
    nutritionalValues: {
      calories: 40,
      proteins: 1.1,
      carbs: 9.3,
      lipids: 0.1,
      fibers: 1.7,
      vitaminC: 7.4,
      potassium: 146
    }
  },
  'pomme de terre': {
    category: 'legumes',
    keywords: ['pomme de terre', 'pommes de terre', 'patate', 'patates'],
    nutritionalValues: {
      calories: 77,
      proteins: 2.0,
      carbs: 17.0,
      lipids: 0.1,
      fibers: 2.1,
      vitaminC: 19.7,
      potassium: 421
    }
  },
  'courgette': {
    category: 'legumes',
    keywords: ['courgette', 'courgettes'],
    nutritionalValues: {
      calories: 17,
      proteins: 1.2,
      carbs: 3.1,
      lipids: 0.3,
      fibers: 1.0,
      vitaminC: 17.9,
      potassium: 261
    }
  },
  'aubergine': {
    category: 'legumes',
    keywords: ['aubergine', 'aubergines'],
    nutritionalValues: {
      calories: 25,
      proteins: 1.0,
      carbs: 5.9,
      lipids: 0.2,
      fibers: 3.0,
      vitaminC: 2.2,
      potassium: 229
    }
  },
  'poivron': {
    category: 'legumes',
    keywords: ['poivron', 'poivrons'],
    nutritionalValues: {
      calories: 31,
      proteins: 1,
      carbs: 6,
      lipids: 0.3,
      fibers: 2.1,
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
      calories: 23,
      proteins: 2.9,
      carbs: 3.6,
      lipids: 0.4,
      fibers: 2.2,
      vitaminA: 469,
      vitaminC: 28.1,
      vitaminE: 2,
      vitaminK: 483,
      vitaminB6: 0.2,
      vitaminB9: 194,
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
      calories: 34,
      proteins: 2.8,
      carbs: 6.6,
      lipids: 0.4,
      fibers: 2.6,
      vitaminA: 31,
      vitaminC: 89.2,
      vitaminE: 0.78,
      vitaminK: 102,
      vitaminB6: 0.18,
      vitaminB9: 63,
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
      calories: 25,
      proteins: 1.3,
      carbs: 5.8,
      lipids: 0.1,
      fibers: 2.5,
      vitaminC: 36.6,
      potassium: 170
    }
  },
  'chou-fleur': {
    category: 'legumes',
    keywords: ['chou-fleur', 'choufleur'],
    nutritionalValues: {
      calories: 25,
      proteins: 1.9,
      carbs: 5.0,
      lipids: 0.3,
      fibers: 2.0,
      vitaminC: 48.2,
      potassium: 299
    }
  },
  'salade': {
    category: 'legumes',
    keywords: ['salade', 'laitue'],
    nutritionalValues: {
      calories: 15,
      proteins: 1.4,
      carbs: 2.9,
      lipids: 0.2,
      fibers: 1.3,
      vitaminC: 9.2,
      vitaminA: 370,
      potassium: 194
    }
  },
  'haricot vert': {
    category: 'legumes',
    keywords: ['haricot vert', 'haricots verts'],
    nutritionalValues: {
      calories: 31,
      proteins: 1.8,
      carbs: 7.0,
      lipids: 0.2,
      fibers: 2.7,
      vitaminC: 12.2,
      potassium: 211
    }
  },
  'pois': {
    category: 'legumes',
    keywords: ['pois', 'petits pois'],
    nutritionalValues: {
      calories: 81,
      proteins: 5.4,
      carbs: 14.5,
      lipids: 0.4,
      fibers: 5.7,
      vitaminC: 40.0,
      potassium: 244
    }
  },
  'poireau': {
    category: 'legumes',
    keywords: ['poireau', 'poireaux'],
    nutritionalValues: {
      calories: 61,
      proteins: 1.5,
      carbs: 14.2,
      lipids: 0.3,
      fibers: 1.8,
      vitaminC: 12.0,
      potassium: 180
    }
  },
  'navet': {
    category: 'legumes',
    keywords: ['navet', 'navets'],
    nutritionalValues: {
      calories: 28,
      proteins: 0.9,
      carbs: 6.4,
      lipids: 0.1,
      fibers: 1.8,
      vitaminC: 21.0,
      potassium: 191
    }
  },
  'betterave': {
    category: 'legumes',
    keywords: ['betterave', 'betteraves'],
    nutritionalValues: {
      calories: 43,
      proteins: 1.6,
      carbs: 9.6,
      lipids: 0.2,
      fibers: 2.8,
      vitaminC: 4.9,
      potassium: 325
    }
  },
  'céleri': {
    category: 'legumes',
    keywords: ['céleri', 'celeri'],
    nutritionalValues: {
      calories: 16,
      proteins: 0.7,
      carbs: 3.0,
      lipids: 0.2,
      fibers: 1.6,
      vitaminC: 3.1,
      potassium: 260
    }
  },
  'ail': {
    category: 'epices',
    keywords: ['ail'],
    nutritionalValues: {
      calories: 149,
      proteins: 6.4,
      carbs: 33.1,
      lipids: 0.5,
      fibers: 2.1,
      vitaminC: 31.2,
      potassium: 401
    }
  },
  'échalote': {
    category: 'legumes',
    keywords: ['échalote', 'échalotes', 'echalote', 'echalotes'],
    nutritionalValues: {
      calories: 72,
      proteins: 2.5,
      carbs: 16.8,
      lipids: 0.1,
      fibers: 3.2,
      vitaminC: 8.0,
      potassium: 334
    }
  },

  // ========== VIANDES ==========
  'poulet': {
    category: 'viandes',
    keywords: ['poulet', 'blanc de poulet', 'filet de poulet'],
    nutritionalValues: {
      calories: 165,
      proteins: 31,
      carbs: 0,
      lipids: 3.6,
      fibers: 0,
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
      calories: 250,
      proteins: 26,
      carbs: 0,
      lipids: 15,
      fibers: 0,
      vitaminB12: 2.1,
      vitaminB6: 0.4,
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
      calories: 242,
      proteins: 20,
      carbs: 0,
      lipids: 18,
      fibers: 0,
      vitaminB12: 0.5,
      vitaminB6: 0.4,
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
      calories: 109,
      proteins: 21,
      carbs: 0,
      lipids: 2.4,
      fibers: 0,
      vitaminB12: 1.3,
      vitaminB6: 0.4,
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
      calories: 225,
      proteins: 25,
      carbs: 0,
      lipids: 14,
      fibers: 0,
      vitaminB12: 2.6,
      vitaminB6: 0.4,
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
      calories: 105,
      proteins: 22,
      carbs: 0,
      lipids: 1.4,
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
      calories: 227,
      proteins: 23,
      carbs: 0,
      lipids: 15,
      fibers: 0,
      vitaminB12: 1,
      vitaminB6: 0.3,
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
      calories: 145,
      proteins: 21.0,
      carbs: 1.0,
      lipids: 6.0,
      fibers: 0,
      sodium: 1200,
      fer: 0.7
    }
  },

  // ========== POISSONS ==========
  'saumon': {
    category: 'poissons',
    keywords: ['saumon', 'filet de saumon'],
    nutritionalValues: {
      calories: 208,
      proteins: 20,
      carbs: 0,
      lipids: 13,
      fibers: 0,
      vitaminD: 8.7,
      vitaminB12: 3.05,
      vitaminB6: 0.6,
      vitaminE: 1.1,
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
      calories: 144,
      proteins: 23.3,
      carbs: 0,
      lipids: 4.9,
      fibers: 0,
      vitaminD: 3.8,
      vitaminB12: 4.2,
      vitaminB6: 0.46,
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
      calories: 82,
      proteins: 18,
      carbs: 0,
      lipids: 0.7,
      fibers: 0,
      vitaminB12: 1.1,
      vitaminB6: 0.2,
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
      calories: 86,
      proteins: 17.3,
      carbs: 0,
      lipids: 1.3,
      fibers: 0,
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
      calories: 148,
      proteins: 19.5,
      carbs: 0,
      lipids: 7.5,
      fibers: 0,
      vitaminD: 2.2,
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
      calories: 208,
      proteins: 24.6,
      carbs: 0,
      lipids: 11.5,
      fibers: 0,
      vitaminD: 11,
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
      calories: 99,
      proteins: 24.0,
      carbs: 0.2,
      lipids: 0.3,
      fibers: 0,
      cholesterol: 189,
      selenium: 48
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
      calories: 59,
      proteins: 3.5,
      carbs: 4.3,
      lipids: 3.2,
      fibers: 0,
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
      calories: 356,
      proteins: 23,
      carbs: 1.3,
      lipids: 28,
      fibers: 0,
      vitaminA: 264,
      vitaminD: 0.5,
      vitaminE: 0.74,
      vitaminB12: 1.2,
      vitaminB6: 0.08,
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
      calories: 717,
      proteins: 0.9,
      carbs: 0.1,
      lipids: 81.0,
      fibers: 0,
      vitaminA: 684,
      calcium: 24
    }
  },
  'crème': {
    category: 'produits-laitiers',
    keywords: ['crème', 'creme', 'crème fraîche'],
    nutritionalValues: {
      calories: 337,
      proteins: 2.7,
      carbs: 3.5,
      lipids: 35.0,
      fibers: 0,
      calcium: 70,
      vitaminA: 365
    }
  },
  'mozzarella': {
    category: 'produits-laitiers',
    keywords: ['mozzarella'],
    nutritionalValues: {
      calories: 280,
      proteins: 28,
      carbs: 2.2,
      lipids: 17,
      fibers: 0,
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
      calories: 392,
      proteins: 38,
      carbs: 0.9,
      lipids: 25,
      fibers: 0,
      vitaminA: 207,
      vitaminD: 0.5,
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
    keywords: ['riz', 'riz blanc', 'riz complet'],
    nutritionalValues: {
      calories: 130,
      proteins: 2.7,
      carbs: 28.0,
      lipids: 0.3,
      fibers: 0.4,
      magnesium: 12,
      vitaminB1: 0.02
    }
  },
  'pâtes': {
    category: 'cereales',
    keywords: ['pâtes', 'pates', 'spaghetti', 'macaroni', 'penne', 'coquillettes'],
    nutritionalValues: {
      calories: 131,
      proteins: 5.0,
      carbs: 25.0,
      lipids: 1.1,
      fibers: 1.8,
      fer: 0.5,
      magnesium: 18
    }
  },
  'pain': {
    category: 'cereales',
    keywords: ['pain', 'baguette'],
    nutritionalValues: {
      calories: 265,
      proteins: 9.0,
      carbs: 49.0,
      lipids: 3.3,
      fibers: 3.5,
      sodium: 575,
      fer: 1.6
    }
  },
  'farine': {
    category: 'cereales',
    keywords: ['farine', 'farine de blé'],
    nutritionalValues: {
      calories: 364,
      proteins: 10.3,
      carbs: 76.0,
      lipids: 1.0,
      fibers: 2.7,
      fer: 1.2,
      magnesium: 22
    }
  },
  'quinoa': {
    category: 'cereales',
    keywords: ['quinoa'],
    nutritionalValues: {
      calories: 368,
      proteins: 14.1,
      carbs: 64.2,
      lipids: 6.1,
      fibers: 7,
      vitaminB6: 0.49,
      vitaminE: 2.4,
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
      calories: 112,
      proteins: 3.8,
      carbs: 23.0,
      lipids: 0.2,
      fibers: 1.4,
      selenium: 27
    }
  },
  'boulgour': {
    category: 'cereales',
    keywords: ['boulgour', 'bulgur'],
    nutritionalValues: {
      calories: 83,
      proteins: 3.1,
      carbs: 18.6,
      lipids: 0.2,
      fibers: 4.5,
      fer: 0.9,
      magnesium: 32
    }
  },
  'avoine': {
    category: 'cereales',
    keywords: ['avoine', 'flocons d\'avoine'],
    nutritionalValues: {
      calories: 389,
      proteins: 16.9,
      carbs: 66.3,
      lipids: 6.9,
      fibers: 10.6,
      fer: 4.7,
      magnesium: 177
    }
  },

  // ========== FRUITS ==========
  'pomme': {
    category: 'fruits',
    keywords: ['pomme', 'pommes'],
    nutritionalValues: {
      calories: 52,
      proteins: 0.3,
      carbs: 14.0,
      lipids: 0.2,
      fibers: 2.4,
      vitaminC: 4.6,
      potassium: 107
    }
  },
  'banane': {
    category: 'fruits',
    keywords: ['banane', 'bananes'],
    nutritionalValues: {
      calories: 89,
      proteins: 1.1,
      carbs: 23.0,
      lipids: 0.3,
      fibers: 2.6,
      vitaminC: 8.7,
      potassium: 358
    }
  },
  'orange': {
    category: 'fruits',
    keywords: ['orange', 'oranges'],
    nutritionalValues: {
      calories: 47,
      proteins: 0.9,
      carbs: 12.0,
      lipids: 0.1,
      fibers: 2.4,
      vitaminC: 53.2,
      potassium: 181
    }
  },
  'fraise': {
    category: 'fruits',
    keywords: ['fraise', 'fraises'],
    nutritionalValues: {
      calories: 32,
      proteins: 0.7,
      carbs: 7.7,
      lipids: 0.3,
      fibers: 2.0,
      vitaminC: 58.8,
      potassium: 153
    }
  },
  'raisin': {
    category: 'fruits',
    keywords: ['raisin', 'raisins'],
    nutritionalValues: {
      calories: 69,
      proteins: 0.7,
      carbs: 18.0,
      lipids: 0.2,
      fibers: 0.9,
      vitaminC: 3.2,
      potassium: 191
    }
  },
  'poire': {
    category: 'fruits',
    keywords: ['poire', 'poires'],
    nutritionalValues: {
      calories: 57,
      proteins: 0.4,
      carbs: 15.0,
      lipids: 0.1,
      fibers: 3.1,
      vitaminC: 4.3,
      potassium: 116
    }
  },
  'pêche': {
    category: 'fruits',
    keywords: ['pêche', 'pêches', 'peche', 'peches'],
    nutritionalValues: {
      calories: 39,
      proteins: 0.9,
      carbs: 9.5,
      lipids: 0.3,
      fibers: 1.5,
      vitaminC: 6.6,
      potassium: 190
    }
  },
  'citron': {
    category: 'fruits',
    keywords: ['citron', 'citrons'],
    nutritionalValues: {
      calories: 29,
      proteins: 1.1,
      carbs: 9.3,
      lipids: 0.3,
      fibers: 2.8,
      vitaminC: 53.0,
      potassium: 138
    }
  },
  'kiwi': {
    category: 'fruits',
    keywords: ['kiwi', 'kiwis'],
    nutritionalValues: {
      calories: 61,
      proteins: 1.1,
      carbs: 15.0,
      lipids: 0.5,
      fibers: 3.0,
      vitaminC: 92.7,
      potassium: 312
    }
  },
  'melon': {
    category: 'fruits',
    keywords: ['melon'],
    nutritionalValues: {
      calories: 34,
      proteins: 0.8,
      carbs: 8.2,
      lipids: 0.2,
      fibers: 0.9,
      vitaminC: 36.7,
      vitaminA: 169,
      potassium: 267
    }
  },

  // ========== ÉPICES ET AROMATES ==========
  'sel': {
    category: 'epices',
    keywords: ['sel'],
    nutritionalValues: {
      calories: 0,
      proteins: 0,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 38758 // 100% sodium
    }
  },
  'poivre': {
    category: 'epices',
    keywords: ['poivre'],
    nutritionalValues: {
      calories: 251,
      proteins: 10.4,
      carbs: 64.0,
      lipids: 3.3,
      fibers: 25.3,
      fer: 9.7,
      calcium: 443
    }
  },
  'curcuma': {
    category: 'epices',
    keywords: ['curcuma'],
    nutritionalValues: {
      calories: 354,
      proteins: 7.8,
      carbs: 65.0,
      lipids: 9.9,
      fibers: 21.0,
      fer: 41.4,
      calcium: 183
    }
  },
  'cumin': {
    category: 'epices',
    keywords: ['cumin'],
    nutritionalValues: {
      calories: 375,
      proteins: 17.8,
      carbs: 44.2,
      lipids: 22.3,
      fibers: 10.5,
      fer: 66.4,
      calcium: 931
    }
  },
  'paprika': {
    category: 'epices',
    keywords: ['paprika'],
    nutritionalValues: {
      calories: 282,
      proteins: 14.1,
      carbs: 54.0,
      lipids: 12.9,
      fibers: 34.9,
      vitaminA: 2463,
      vitaminC: 71.0
    }
  },
  'persil': {
    category: 'epices',
    keywords: ['persil'],
    nutritionalValues: {
      calories: 36,
      proteins: 3.0,
      carbs: 6.3,
      lipids: 0.8,
      fibers: 3.3,
      vitaminC: 133.0,
      vitaminA: 421,
      fer: 6.2
    }
  },
  'basilic': {
    category: 'epices',
    keywords: ['basilic'],
    nutritionalValues: {
      calories: 23,
      proteins: 3.2,
      carbs: 2.7,
      lipids: 0.6,
      fibers: 1.6,
      vitaminC: 18.0,
      vitaminA: 264,
      calcium: 177
    }
  },
  'thym': {
    category: 'epices',
    keywords: ['thym'],
    nutritionalValues: {
      calories: 101,
      proteins: 5.6,
      carbs: 24.5,
      lipids: 1.7,
      fibers: 14.0,
      fer: 17.5,
      calcium: 405
    }
  },

  // ========== HUILES ET MATIÈRES GRASSES ==========
  'huile d\'olive': {
    category: 'autres',
    keywords: ['huile d\'olive', 'huile olive'],
    nutritionalValues: {
      calories: 884,
      proteins: 0,
      carbs: 0,
      lipids: 100.0,
      fibers: 0,
      vitaminE: 14.4,
      omega9: 73.0
    }
  },
  'huile de tournesol': {
    category: 'autres',
    keywords: ['huile de tournesol', 'huile tournesol'],
    nutritionalValues: {
      calories: 884,
      proteins: 0,
      carbs: 0,
      lipids: 100.0,
      fibers: 0,
      vitaminE: 41.1,
      omega6: 65.7
    }
  },

  // ========== ŒUFS ==========
  'œuf': {
    category: 'autres',
    keywords: ['œuf', 'oeuf', 'œufs', 'oeufs'],
    nutritionalValues: {
      calories: 145,
      proteins: 12.6,
      carbs: 0.72,
      lipids: 9.9,
      fibers: 0,
      vitaminA: 160,
      vitaminD: 2.1,
      vitaminE: 1.2,
      vitaminB12: 1.3,
      vitaminB6: 0.14,
      calcium: 56,
      iron: 1.8,
      magnesium: 12,
      phosphore: 180,
      potassium: 130,
      zinc: 1.3
    }
  },

  // ========== LÉGUMINEUSES ==========
  'lentille': {
    category: 'cereales',
    keywords: ['lentille', 'lentilles', 'lentilles corail'],
    nutritionalValues: {
      calories: 116,
      proteins: 9,
      carbs: 16.3,
      lipids: 0.4,
      fibers: 7.9,
      vitaminB6: 0.18,
      vitaminB9: 180,
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
      calories: 119,
      proteins: 8.9,
      carbs: 17.7,
      lipids: 1.8,
      fibers: 6.4,
      vitaminB6: 0.14,
      vitaminB9: 145,
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
      calories: 140,
      proteins: 9.7,
      carbs: 25.0,
      lipids: 0.5,
      fibers: 6.4,
      fer: 3.7,
      calcium: 90
    }
  },

  // ========== VIANDES SUPPLÉMENTAIRES ==========
  'lapin': {
    category: 'viandes',
    keywords: ['lapin'],
    nutritionalValues: {
      calories: 173,
      proteins: 33,
      carbs: 0,
      lipids: 3.5,
      fibers: 0,
      vitaminB12: 10,
      vitaminB6: 0.5,
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
      calories: 120,
      proteins: 22.0,
      carbs: 0,
      lipids: 3.0,
      fibers: 0,
      fer: 4.5
    }
  },
  'foie': {
    category: 'viandes',
    keywords: ['foie', 'foie de volaille', 'foie de veau'],
    nutritionalValues: {
      calories: 135,
      proteins: 20.4,
      carbs: 3.9,
      lipids: 4.4,
      fibers: 0,
      fer: 8.8,
      vitaminA: 16899,
      vitaminB12: 60.0
    }
  },
  'boudin noir': {
    category: 'viandes',
    keywords: ['boudin noir', 'boudin'],
    nutritionalValues: {
      calories: 379,
      proteins: 14.4,
      carbs: 5.0,
      lipids: 34.5,
      fibers: 0,
      fer: 22.8,
      calcium: 51
    }
  },
  'saucisse': {
    category: 'viandes',
    keywords: ['saucisse', 'saucisses', 'merguez', 'chipolata'],
    nutritionalValues: {
      calories: 301,
      proteins: 13.0,
      carbs: 2.0,
      lipids: 27.0,
      fibers: 0,
      sodium: 950
    }
  },
  'bacon': {
    category: 'viandes',
    keywords: ['bacon', 'lard'],
    nutritionalValues: {
      calories: 541,
      proteins: 37,
      carbs: 1.4,
      lipids: 42,
      fibers: 0,
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
      calories: 250,
      proteins: 26.0,
      carbs: 0,
      lipids: 17.0,
      fibers: 0,
      fer: 2.6
    }
  },

  // ========== POISSONS SUPPLÉMENTAIRES ==========
  'maquereau': {
    category: 'poissons',
    keywords: ['maquereau'],
    nutritionalValues: {
      calories: 205,
      proteins: 18.6,
      carbs: 0,
      lipids: 13.9,
      fibers: 0,
      vitaminD: 7.6,
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
      calories: 158,
      proteins: 18.0,
      carbs: 0,
      lipids: 9.0,
      fibers: 0,
      omega3: 2.0,
      vitaminD: 4.2
    }
  },
  'anchois': {
    category: 'poissons',
    keywords: ['anchois'],
    nutritionalValues: {
      calories: 131,
      proteins: 20.4,
      carbs: 0,
      lipids: 4.8,
      fibers: 0,
      calcium: 147,
      sodium: 3668
    }
  },
  'sole': {
    category: 'poissons',
    keywords: ['sole'],
    nutritionalValues: {
      calories: 86,
      proteins: 18.8,
      carbs: 0,
      lipids: 1.2,
      fibers: 0,
      iode: 30
    }
  },
  'lieu': {
    category: 'poissons',
    keywords: ['lieu', 'lieu noir'],
    nutritionalValues: {
      calories: 92,
      proteins: 19.8,
      carbs: 0,
      lipids: 1.1,
      fibers: 0,
      vitaminB12: 1.8
    }
  },
  'bar': {
    category: 'poissons',
    keywords: ['bar', 'loup'],
    nutritionalValues: {
      calories: 97,
      proteins: 18.0,
      carbs: 0,
      lipids: 2.4,
      fibers: 0,
      omega3: 0.6
    }
  },
  'daurade': {
    category: 'poissons',
    keywords: ['daurade', 'dorade'],
    nutritionalValues: {
      calories: 96,
      proteins: 20.0,
      carbs: 0,
      lipids: 1.7,
      fibers: 0,
      omega3: 0.4
    }
  },
  'espadon': {
    category: 'poissons',
    keywords: ['espadon'],
    nutritionalValues: {
      calories: 144,
      proteins: 19.7,
      carbs: 0,
      lipids: 6.7,
      fibers: 0,
      omega3: 0.8,
      selenium: 56
    }
  },
  'flétan': {
    category: 'poissons',
    keywords: ['flétan', 'fletan'],
    nutritionalValues: {
      calories: 111,
      proteins: 20.8,
      carbs: 0,
      lipids: 2.3,
      fibers: 0,
      omega3: 0.5,
      vitaminD: 5.3
    }
  },
  'moule': {
    category: 'poissons',
    keywords: ['moule', 'moules'],
    nutritionalValues: {
      calories: 86,
      proteins: 11.9,
      carbs: 3.7,
      lipids: 2.2,
      fibers: 0,
      fer: 5.8,
      zinc: 1.6
    }
  },
  'huître': {
    category: 'poissons',
    keywords: ['huître', 'huitre', 'huîtres'],
    nutritionalValues: {
      calories: 69,
      proteins: 9.0,
      carbs: 3.9,
      lipids: 1.6,
      fibers: 0,
      zinc: 16.6,
      fer: 5.8
    }
  },
  'coquille saint-jacques': {
    category: 'poissons',
    keywords: ['coquille saint-jacques', 'saint-jacques', 'noix de saint-jacques'],
    nutritionalValues: {
      calories: 88,
      proteins: 16.8,
      carbs: 2.4,
      lipids: 0.8,
      fibers: 0,
      vitaminB12: 1.4
    }
  },
  'crabe': {
    category: 'poissons',
    keywords: ['crabe'],
    nutritionalValues: {
      calories: 87,
      proteins: 18.1,
      carbs: 0,
      lipids: 1.1,
      fibers: 0,
      zinc: 3.8
    }
  },
  'homard': {
    category: 'poissons',
    keywords: ['homard'],
    nutritionalValues: {
      calories: 89,
      proteins: 19.0,
      carbs: 0.5,
      lipids: 0.9,
      fibers: 0,
      copper: 1.9
    }
  },
  'seiche': {
    category: 'poissons',
    keywords: ['seiche'],
    nutritionalValues: {
      calories: 79,
      proteins: 16.2,
      carbs: 0.8,
      lipids: 1.4,
      fibers: 0,
      fer: 1.1
    }
  },
  'calmar': {
    category: 'poissons',
    keywords: ['calmar', 'calamar', 'encornet'],
    nutritionalValues: {
      calories: 92,
      proteins: 15.6,
      carbs: 3.1,
      lipids: 1.4,
      fibers: 0,
      copper: 2.0
    }
  },

  // ========== FÉCULENTS SUPPLÉMENTAIRES ==========
  'semoule': {
    category: 'cereales',
    keywords: ['semoule', 'semoule de blé'],
    nutritionalValues: {
      calories: 360,
      proteins: 12.7,
      carbs: 72.8,
      lipids: 1.0,
      fibers: 3.9,
      fer: 1.2
    }
  },
  'polenta': {
    category: 'cereales',
    keywords: ['polenta', 'semoule de maïs'],
    nutritionalValues: {
      calories: 70,
      proteins: 1.7,
      carbs: 15.0,
      lipids: 0.4,
      fibers: 1.4,
      fer: 0.5
    }
  },
  'orge': {
    category: 'cereales',
    keywords: ['orge'],
    nutritionalValues: {
      calories: 123,
      proteins: 2.3,
      carbs: 28.2,
      lipids: 0.4,
      fibers: 3.8,
      magnesium: 22
    }
  },
  'épeautre': {
    category: 'cereales',
    keywords: ['épeautre', 'epeautre'],
    nutritionalValues: {
      calories: 338,
      proteins: 14.6,
      carbs: 70.2,
      lipids: 2.4,
      fibers: 10.7,
      fer: 4.4,
      magnesium: 136
    }
  },
  'sarrasin': {
    category: 'cereales',
    keywords: ['sarrasin', 'blé noir'],
    nutritionalValues: {
      calories: 343,
      proteins: 13.3,
      carbs: 71.5,
      lipids: 3.4,
      fibers: 10.0,
      magnesium: 231
    }
  },
  'millet': {
    category: 'cereales',
    keywords: ['millet'],
    nutritionalValues: {
      calories: 378,
      proteins: 11.0,
      carbs: 73.0,
      lipids: 4.2,
      fibers: 8.5,
      magnesium: 114
    }
  },
  'riz complet': {
    category: 'cereales',
    keywords: ['riz complet', 'riz brun'],
    nutritionalValues: {
      calories: 370,
      proteins: 7.9,
      carbs: 77.2,
      lipids: 2.9,
      fibers: 3.5,
      vitaminB6: 0.51,
      vitaminE: 1.2,
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
      calories: 101,
      proteins: 4.0,
      carbs: 21.3,
      lipids: 0.3,
      fibers: 1.8,
      zinc: 1.3
    }
  },
  'vermicelle': {
    category: 'cereales',
    keywords: ['vermicelle', 'vermicelles', 'cheveux d\'ange'],
    nutritionalValues: {
      calories: 131,
      proteins: 5.0,
      carbs: 25.0,
      lipids: 1.1,
      fibers: 1.8,
      fer: 0.5
    }
  },
  'gnocchi': {
    category: 'cereales',
    keywords: ['gnocchi', 'gnocchis'],
    nutritionalValues: {
      calories: 130,
      proteins: 3.5,
      carbs: 27.0,
      lipids: 0.5,
      fibers: 1.5,
      sodium: 400
    }
  },
  'tapioca': {
    category: 'cereales',
    keywords: ['tapioca', 'perles du japon'],
    nutritionalValues: {
      calories: 358,
      proteins: 0.2,
      carbs: 88.7,
      lipids: 0.0,
      fibers: 0.9,
      calcium: 20
    }
  },
  'haricot rouge': {
    category: 'cereales',
    keywords: ['haricot rouge', 'haricots rouges'],
    nutritionalValues: {
      calories: 127,
      proteins: 8.7,
      carbs: 22.8,
      lipids: 0.5,
      fibers: 6.4,
      fer: 2.9
    }
  },
  'haricot noir': {
    category: 'cereales',
    keywords: ['haricot noir', 'haricots noirs'],
    nutritionalValues: {
      calories: 132,
      proteins: 8.9,
      carbs: 23.7,
      lipids: 0.5,
      fibers: 8.7,
      fer: 2.1
    }
  },
  'fève': {
    category: 'cereales',
    keywords: ['fève', 'fèves'],
    nutritionalValues: {
      calories: 110,
      proteins: 7.6,
      carbs: 19.6,
      lipids: 0.4,
      fibers: 5.4,
      fer: 1.5
    }
  },
  'edamame': {
    category: 'cereales',
    keywords: ['edamame', 'soja vert'],
    nutritionalValues: {
      calories: 122,
      proteins: 11.0,
      carbs: 10.0,
      lipids: 5.2,
      fibers: 5.2,
      fer: 2.3
    }
  },
  'pâte feuilletée': {
    category: 'cereales',
    keywords: ['pâte feuilletée', 'feuilletage'],
    nutritionalValues: {
      calories: 558,
      proteins: 6.0,
      carbs: 45.0,
      lipids: 40.0,
      fibers: 1.8,
      sodium: 520
    }
  },
  'pâte brisée': {
    category: 'cereales',
    keywords: ['pâte brisée', 'pâte à tarte'],
    nutritionalValues: {
      calories: 510,
      proteins: 6.5,
      carbs: 52.0,
      lipids: 31.0,
      fibers: 2.0,
      sodium: 480
    }
  },

  // ========== LÉGUMES SUPPLÉMENTAIRES ==========
  'concombre': {
    category: 'legumes',
    keywords: ['concombre'],
    nutritionalValues: {
      calories: 15,
      proteins: 0.7,
      carbs: 3.6,
      lipids: 0.1,
      fibers: 0.5,
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
      calories: 17,
      proteins: 0.9,
      carbs: 3.4,
      lipids: 0.1,
      fibers: 3.1,
      vitaminC: 2.8,
      potassium: 211
    }
  },
  'artichaut': {
    category: 'legumes',
    keywords: ['artichaut', 'artichauts'],
    nutritionalValues: {
      calories: 47,
      proteins: 3.3,
      carbs: 10.5,
      lipids: 0.2,
      fibers: 5.4,
      vitaminC: 11.7,
      potassium: 370
    }
  },
  'asperge': {
    category: 'legumes',
    keywords: ['asperge', 'asperges'],
    nutritionalValues: {
      calories: 20,
      proteins: 2.2,
      carbs: 3.9,
      lipids: 0.1,
      fibers: 1.5,
      vitaminC: 5.6,
      folates: 52
    }
  },
  'champignon': {
    category: 'legumes',
    keywords: ['champignon', 'champignons', 'champignon de paris'],
    nutritionalValues: {
      calories: 22,
      proteins: 3.1,
      carbs: 3.3,
      lipids: 0.3,
      fibers: 1.0,
      vitaminD: 0.2,
      potassium: 318
    }
  },
  'courge': {
    category: 'legumes',
    keywords: ['courge', 'butternut', 'potiron', 'citrouille'],
    nutritionalValues: {
      calories: 45,
      proteins: 1.0,
      carbs: 12.0,
      lipids: 0.1,
      fibers: 2.0,
      vitaminA: 426,
      potassium: 340
    }
  },
  'potimarron': {
    category: 'legumes',
    keywords: ['potimarron'],
    nutritionalValues: {
      calories: 34,
      proteins: 1.5,
      carbs: 7.3,
      lipids: 0.1,
      fibers: 1.5,
      vitaminA: 400,
      vitaminC: 10.0
    }
  },
  'fenouil': {
    category: 'legumes',
    keywords: ['fenouil'],
    nutritionalValues: {
      calories: 31,
      proteins: 1.2,
      carbs: 7.3,
      lipids: 0.2,
      fibers: 3.1,
      vitaminC: 12.0,
      potassium: 414
    }
  },
  'rutabaga': {
    category: 'legumes',
    keywords: ['rutabaga'],
    nutritionalValues: {
      calories: 37,
      proteins: 1.2,
      carbs: 8.6,
      lipids: 0.2,
      fibers: 2.3,
      vitaminC: 25.0,
      potassium: 337
    }
  },
  'panais': {
    category: 'legumes',
    keywords: ['panais'],
    nutritionalValues: {
      calories: 75,
      proteins: 1.2,
      carbs: 18.0,
      lipids: 0.3,
      fibers: 4.9,
      vitaminC: 17.0,
      potassium: 375
    }
  },
  'topinambour': {
    category: 'legumes',
    keywords: ['topinambour'],
    nutritionalValues: {
      calories: 73,
      proteins: 2.0,
      carbs: 17.4,
      lipids: 0.0,
      fibers: 1.6,
      potassium: 429
    }
  },
  'chou de bruxelles': {
    category: 'legumes',
    keywords: ['chou de bruxelles', 'choux de bruxelles'],
    nutritionalValues: {
      calories: 43,
      proteins: 3.4,
      carbs: 9.0,
      lipids: 0.3,
      fibers: 3.8,
      vitaminC: 85.0,
      vitaminK: 177
    }
  },
  'chou rouge': {
    category: 'legumes',
    keywords: ['chou rouge'],
    nutritionalValues: {
      calories: 31,
      proteins: 1.4,
      carbs: 7.4,
      lipids: 0.2,
      fibers: 2.1,
      vitaminC: 57.0,
      vitaminK: 38
    }
  },
  'chou kale': {
    category: 'legumes',
    keywords: ['chou kale', 'kale'],
    nutritionalValues: {
      calories: 50,
      proteins: 3.3,
      carbs: 10,
      lipids: 0.7,
      fibers: 2,
      vitaminA: 500,
      vitaminC: 120,
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
      calories: 25,
      proteins: 2.6,
      carbs: 3.7,
      lipids: 0.7,
      fibers: 1.6,
      vitaminC: 15.0,
      vitaminK: 108,
      calcium: 160
    }
  },
  'mâche': {
    category: 'legumes',
    keywords: ['mâche', 'mache'],
    nutritionalValues: {
      calories: 21,
      proteins: 2.0,
      carbs: 3.6,
      lipids: 0.4,
      fibers: 1.5,
      vitaminC: 38.0,
      vitaminA: 420
    }
  },
  'blette': {
    category: 'legumes',
    keywords: ['blette', 'bette', 'côte de blette'],
    nutritionalValues: {
      calories: 19,
      proteins: 1.8,
      carbs: 3.7,
      lipids: 0.2,
      fibers: 1.6,
      vitaminC: 30.0,
      calcium: 51
    }
  },

  // ========== FRUITS SUPPLÉMENTAIRES ==========
  'abricot': {
    category: 'fruits',
    keywords: ['abricot', 'abricots'],
    nutritionalValues: {
      calories: 48,
      proteins: 1.4,
      carbs: 11.1,
      lipids: 0.4,
      fibers: 2.0,
      vitaminA: 96,
      vitaminC: 10.0,
      potassium: 259
    }
  },
  'prune': {
    category: 'fruits',
    keywords: ['prune', 'prunes', 'pruneau'],
    nutritionalValues: {
      calories: 46,
      proteins: 0.7,
      carbs: 11.4,
      lipids: 0.3,
      fibers: 1.4,
      vitaminC: 9.5,
      potassium: 157
    }
  },
  'cerise': {
    category: 'fruits',
    keywords: ['cerise', 'cerises'],
    nutritionalValues: {
      calories: 63,
      proteins: 1.1,
      carbs: 16.0,
      lipids: 0.2,
      fibers: 2.1,
      vitaminC: 7.0,
      potassium: 222
    }
  },
  'ananas': {
    category: 'fruits',
    keywords: ['ananas'],
    nutritionalValues: {
      calories: 50,
      proteins: 0.5,
      carbs: 13.1,
      lipids: 0.1,
      fibers: 1.4,
      vitaminC: 47.8,
      manganese: 0.9
    }
  },
  'mangue': {
    category: 'fruits',
    keywords: ['mangue'],
    nutritionalValues: {
      calories: 60,
      proteins: 0.8,
      carbs: 15.0,
      lipids: 0.4,
      fibers: 1.6,
      vitaminC: 36.4,
      vitaminA: 54
    }
  },
  'pastèque': {
    category: 'fruits',
    keywords: ['pastèque', 'pasteque'],
    nutritionalValues: {
      calories: 30,
      proteins: 0.6,
      carbs: 7.6,
      lipids: 0.2,
      fibers: 0.4,
      vitaminC: 8.1,
      lycopene: 4532
    }
  },
  'clémentine': {
    category: 'fruits',
    keywords: ['clémentine', 'clementine', 'clémentines', 'mandarine'],
    nutritionalValues: {
      calories: 47,
      proteins: 0.9,
      carbs: 12.0,
      lipids: 0.2,
      fibers: 1.7,
      vitaminC: 48.8,
      potassium: 177
    }
  },
  'pamplemousse': {
    category: 'fruits',
    keywords: ['pamplemousse'],
    nutritionalValues: {
      calories: 42,
      proteins: 0.8,
      carbs: 11.0,
      lipids: 0.1,
      fibers: 1.6,
      vitaminC: 31.2,
      potassium: 135
    }
  },
  'figue': {
    category: 'fruits',
    keywords: ['figue', 'figues'],
    nutritionalValues: {
      calories: 74,
      proteins: 0.8,
      carbs: 19.2,
      lipids: 0.3,
      fibers: 2.9,
      calcium: 35,
      potassium: 232
    }
  },
  'myrtille': {
    category: 'fruits',
    keywords: ['myrtille', 'myrtilles', 'bleuet'],
    nutritionalValues: {
      calories: 57,
      proteins: 0.7,
      carbs: 14.5,
      lipids: 0.3,
      fibers: 2.4,
      vitaminC: 9.7,
      vitaminK: 19
    }
  },
  'framboise': {
    category: 'fruits',
    keywords: ['framboise', 'framboises'],
    nutritionalValues: {
      calories: 52,
      proteins: 1.2,
      carbs: 11.9,
      lipids: 0.7,
      fibers: 6.5,
      vitaminC: 26.2,
      manganese: 0.7
    }
  },
  'mûre': {
    category: 'fruits',
    keywords: ['mûre', 'mûres', 'mure', 'mures'],
    nutritionalValues: {
      calories: 43,
      proteins: 1.4,
      carbs: 9.6,
      lipids: 0.5,
      fibers: 5.3,
      vitaminC: 21.0,
      vitaminK: 19
    }
  },
  'cassis': {
    category: 'fruits',
    keywords: ['cassis'],
    nutritionalValues: {
      calories: 63,
      proteins: 1.4,
      carbs: 15.4,
      lipids: 0.4,
      fibers: 4.8,
      vitaminC: 181.0,
      potassium: 322
    }
  },
  'groseille': {
    category: 'fruits',
    keywords: ['groseille', 'groseilles'],
    nutritionalValues: {
      calories: 56,
      proteins: 1.4,
      carbs: 13.8,
      lipids: 0.2,
      fibers: 4.3,
      vitaminC: 41.0,
      potassium: 275
    }
  },
  'coing': {
    category: 'fruits',
    keywords: ['coing', 'coings'],
    nutritionalValues: {
      calories: 57,
      proteins: 0.4,
      carbs: 15.3,
      lipids: 0.1,
      fibers: 1.9,
      vitaminC: 15.0,
      potassium: 197
    }
  },
  'litchi': {
    category: 'fruits',
    keywords: ['litchi', 'lychee'],
    nutritionalValues: {
      calories: 66,
      proteins: 0.8,
      carbs: 16.5,
      lipids: 0.4,
      fibers: 1.3,
      vitaminC: 71.5,
      potassium: 171
    }
  },
  'avocat': {
    category: 'fruits',
    keywords: ['avocat'],
    nutritionalValues: {
      calories: 160,
      proteins: 2.0,
      carbs: 8.5,
      lipids: 14.7,
      fibers: 6.7,
      vitaminE: 2.1,
      potassium: 485
    }
  },

  // ========== PRODUITS LAITIERS SUPPLÉMENTAIRES ==========
  'fromage blanc': {
    category: 'produits-laitiers',
    keywords: ['fromage blanc'],
    nutritionalValues: {
      calories: 75,
      proteins: 7.1,
      carbs: 3.5,
      lipids: 3.0,
      fibers: 0,
      calcium: 103,
      phosphore: 151
    }
  },
  'ricotta': {
    category: 'produits-laitiers',
    keywords: ['ricotta'],
    nutritionalValues: {
      calories: 174,
      proteins: 11.3,
      carbs: 3.0,
      lipids: 13.0,
      fibers: 0,
      calcium: 207,
      sodium: 84
    }
  },
  'mascarpone': {
    category: 'produits-laitiers',
    keywords: ['mascarpone'],
    nutritionalValues: {
      calories: 429,
      proteins: 4.8,
      carbs: 4.8,
      lipids: 44.0,
      fibers: 0,
      calcium: 60,
      vitaminA: 366
    }
  },
  'feta': {
    category: 'produits-laitiers',
    keywords: ['feta'],
    nutritionalValues: {
      calories: 264,
      proteins: 14.2,
      carbs: 4.1,
      lipids: 21.3,
      fibers: 0,
      calcium: 493,
      sodium: 1116
    }
  },
  'roquefort': {
    category: 'produits-laitiers',
    keywords: ['roquefort'],
    nutritionalValues: {
      calories: 369,
      proteins: 21.5,
      carbs: 2.0,
      lipids: 30.6,
      fibers: 0,
      calcium: 662,
      sodium: 1809
    }
  },
  'camembert': {
    category: 'produits-laitiers',
    keywords: ['camembert'],
    nutritionalValues: {
      calories: 299,
      proteins: 19.8,
      carbs: 0.5,
      lipids: 24.3,
      fibers: 0,
      calcium: 388,
      vitaminA: 241
    }
  },
  'brie': {
    category: 'produits-laitiers',
    keywords: ['brie'],
    nutritionalValues: {
      calories: 334,
      proteins: 20.7,
      carbs: 0.5,
      lipids: 27.7,
      fibers: 0,
      calcium: 184,
      vitaminB12: 1.7
    }
  },
  'comté': {
    category: 'produits-laitiers',
    keywords: ['comté', 'comte'],
    nutritionalValues: {
      calories: 409,
      proteins: 27.0,
      carbs: 1.5,
      lipids: 32.0,
      fibers: 0,
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
      calories: 321,
      proteins: 8.1,
      carbs: 54.4,
      lipaminds: 8.7,
      fibers: 0,
      calcium: 284
    }
  },

  // ========== NOIX ET GRAINES ==========
  'amande': {
    category: 'fruits',
    keywords: ['amande', 'amandes'],
    nutritionalValues: {
      calories: 579,
      proteins: 21.2,
      carbs: 21.5,
      lipids: 50,
      fibers: 12.5,
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
      calories: 654,
      proteins: 15.2,
      carbs: 13.7,
      lipids: 65.2,
      fibers: 6.7,
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
      calories: 628,
      proteins: 15,
      carbs: 16.7,
      lipids: 60.8,
      fibers: 9.7,
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
      calories: 567,
      proteins: 26,
      carbs: 16,
      lipids: 49,
      fibers: 8.5,
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
      calories: 553,
      proteins: 18.2,
      carbs: 30.2,
      lipids: 43.8,
      fibers: 3.3,
      magnesium: 292,
      fer: 6.7
    }
  },
  'pistache': {
    category: 'fruits',
    keywords: ['pistache', 'pistaches'],
    nutritionalValues: {
      calories: 560,
      proteins: 20.2,
      carbs: 27.2,
      lipids: 45.3,
      fibers: 10.6,
      vitaminB6: 1.7,
      potassium: 1025
    }
  },
  'graines de tournesol': {
    category: 'autres',
    keywords: ['graines de tournesol', 'tournesol'],
    nutritionalValues: {
      calories: 584,
      proteins: 20.8,
      carbs: 20.0,
      lipids: 51.5,
      fibers: 8.6,
      vitaminE: 35.2,
      magnesium: 325
    }
  },
  'graines de lin': {
    category: 'autres',
    keywords: ['graines de lin', 'lin'],
    nutritionalValues: {
      calories: 534,
      proteins: 18.3,
      carbs: 28.9,
      lipids: 42.2,
      fibers: 27.3,
      omega3: 22.8,
      magnesium: 392
    }
  },
  'graines de chia': {
    category: 'autres',
    keywords: ['graines de chia', 'chia'],
    nutritionalValues: {
      calories: 486,
      proteins: 16.5,
      carbs: 42.1,
      lipids: 30.7,
      fibers: 34.4,
      omega3: 17.8,
      calcium: 631
    }
  },
  'graines de sésame': {
    category: 'epices',
    keywords: ['graines de sésame', 'sésame', 'sesame'],
    nutritionalValues: {
      calories: 573,
      proteins: 17.7,
      carbs: 23.5,
      lipids: 49.7,
      fibers: 11.8,
      calcium: 975,
      fer: 14.6
    }
  },

  // ========== CONDIMENTS ET SAUCES ==========
  'moutarde': {
    category: 'autres',
    keywords: ['moutarde'],
    nutritionalValues: {
      calories: 66,
      proteins: 3.8,
      carbs: 5.3,
      lipids: 3.3,
      fibers: 4.8,
      sodium: 1135
    }
  },
  'mayonnaise': {
    category: 'autres',
    keywords: ['mayonnaise', 'mayo'],
    nutritionalValues: {
      calories: 680,
      proteins: 1.3,
      carbs: 2.7,
      lipids: 75.0,
      fibers: 0,
      sodium: 597
    }
  },
  'ketchup': {
    category: 'autres',
    keywords: ['ketchup'],
    nutritionalValues: {
      calories: 112,
      proteins: 1.8,
      carbs: 25.0,
      lipids: 0.3,
      fibers: 0.3,
      sodium: 1110
    }
  },
  'sauce soja': {
    category: 'autres',
    keywords: ['sauce soja', 'soja'],
    nutritionalValues: {
      calories: 60,
      proteins: 10.5,
      carbs: 5.6,
      lipids: 0.1,
      fibers: 0.8,
      sodium: 5586
    }
  },
  'vinaigre': {
    category: 'autres',
    keywords: ['vinaigre'],
    nutritionalValues: {
      calories: 21,
      proteins: 0,
      carbs: 0.9,
      lipids: 0,
      fibers: 0,
      sodium: 4
    }
  },
  'miel': {
    category: 'autres',
    keywords: ['miel'],
    nutritionalValues: {
      calories: 304,
      proteins: 0.3,
      carbs: 82.4,
      lipids: 0,
      fibers: 0.2,
      potassium: 52
    }
  },
  'confiture': {
    category: 'autres',
    keywords: ['confiture', 'gelée'],
    nutritionalValues: {
      calories: 278,
      proteins: 0.4,
      carbs: 69.0,
      lipids: 0.1,
      fibers: 1.0,
      vitaminC: 3.0
    }
  },
  'chocolat noir': {
    category: 'autres',
    keywords: ['chocolat noir', 'chocolat'],
    nutritionalValues: {
      calories: 546,
      proteins: 4.9,
      carbs: 61.0,
      lipids: 31.0,
      fibers: 7.0,
      fer: 2.3,
      magnesium: 228
    }
  },
  'cacao': {
    category: 'autres',
    keywords: ['cacao', 'poudre de cacao'],
    nutritionalValues: {
      calories: 228,
      proteins: 19.6,
      carbs: 57.9,
      lipids: 13.7,
      fibers: 33.2,
      fer: 13.9,
      magnesium: 499
    }
  },
  'sucre': {
    category: 'autres',
    keywords: ['sucre', 'sucre blanc'],
    nutritionalValues: {
      calories: 387,
      proteins: 0,
      carbs: 100.0,
      lipids: 0,
      fibers: 0,
      calcium: 1
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
 * Récupère les informations complètes d'un ingrédient
 * @param {string} itemName - Nom de l'ingrédient
 * @returns {object|null} - Données de l'ingrédient ou null
 */
export function getIngredientData(itemName) {
  const nameLower = itemName.toLowerCase().trim();
  
  for (const [ingredientKey, ingredientData] of Object.entries(ingredientsDatabase)) {
    for (const keyword of ingredientData.keywords) {
      if (nameLower.includes(keyword.toLowerCase())) {
        return {
          name: ingredientKey,
          category: ingredientData.category,
          nutritionalValues: ingredientData.nutritionalValues
        };
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

