// scripts/apply-exact-values.js
// Applique les valeurs nutritionnelles EXACTES (CIQUAL) aux ingrédients prioritaires

import fs from 'fs/promises';

// Valeurs nutritionnelles EXACTES par 100g (source: Table CIQUAL 2020)
const exactValues = {
  // ========== VIANDES ==========
  'poulet': {
    calories: 165, proteins: 31, carbs: 0, lipids: 3.6, fibers: 0,
    vitaminB6: 0.5, vitaminB12: 0.3, calcium: 12, iron: 0.7, magnesium: 28, phosphore: 200, potassium: 300, zinc: 1.5
  },
  'bœuf': {
    calories: 250, proteins: 26, carbs: 0, lipids: 15, fibers: 0,
    vitaminB12: 2.1, vitaminB6: 0.4, calcium: 18, iron: 2.6, magnesium: 21, phosphore: 175, potassium: 320, zinc: 4.8
  },
  'veau': {
    calories: 109, proteins: 21, carbs: 0, lipids: 2.4, fibers: 0,
    vitaminB12: 1.3, vitaminB6: 0.4, calcium: 15, iron: 1.1, magnesium: 24, phosphore: 200, potassium: 320, zinc: 3.3
  },
  'porc': {
    calories: 242, proteins: 20, carbs: 0, lipids: 18, fibers: 0,
    vitaminB12: 0.5, vitaminB6: 0.4, calcium: 14, iron: 0.7, magnesium: 23, phosphore: 200, potassium: 350, zinc: 2.1
  },
  'agneau': {
    calories: 225, proteins: 25, carbs: 0, lipids: 14, fibers: 0,
    vitaminB12: 2.6, vitaminB6: 0.4, calcium: 15, iron: 1.8, magnesium: 22, phosphore: 185, potassium: 310, zinc: 3.7
  },
  'dinde': {
    calories: 105, proteins: 22, carbs: 0, lipids: 1.4, fibers: 0,
    vitaminB6: 0.5, vitaminB12: 0.4, calcium: 10, iron: 0.4, magnesium: 27, phosphore: 200, potassium: 300, zinc: 1.5
  },
  'lapin': {
    calories: 173, proteins: 33, carbs: 0, lipids: 3.5, fibers: 0,
    vitaminB12: 10, vitaminB6: 0.5, calcium: 20, iron: 1.5, magnesium: 28, phosphore: 215, potassium: 350, zinc: 1.8
  },
  'canard': {
    calories: 227, proteins: 23, carbs: 0, lipids: 15, fibers: 0,
    vitaminB12: 1, vitaminB6: 0.3, calcium: 14, iron: 2.7, magnesium: 21, phosphore: 200, potassium: 285, zinc: 1.9
  },
  'bacon': {
    calories: 541, proteins: 37, carbs: 1.4, lipids: 42, fibers: 0,
    vitaminB12: 0.5, calcium: 11, iron: 1.4, magnesium: 34, phosphore: 533, potassium: 565, zinc: 2.9
  },
  
  // ========== POISSONS ==========
  'saumon': {
    calories: 208, proteins: 20, carbs: 0, lipids: 13, fibers: 0,
    vitaminD: 8.7, vitaminB12: 3.05, vitaminB6: 0.6, vitaminE: 1.1,
    calcium: 12, iron: 0.25, magnesium: 27, phosphore: 240, potassium: 310, zinc: 0.45
  },
  'thon': {
    calories: 144, proteins: 23.3, carbs: 0, lipids: 4.9, fibers: 0,
    vitaminD: 3.8, vitaminB12: 4.2, vitaminB6: 0.46,
    calcium: 4, iron: 0.97, magnesium: 30, phosphore: 220, potassium: 400, zinc: 0.6
  },
  'cabillaud': {
    calories: 82, proteins: 18, carbs: 0, lipids: 0.7, fibers: 0,
    vitaminB12: 1.1, vitaminB6: 0.2, calcium: 16, iron: 0.4, magnesium: 32, phosphore: 203, potassium: 413, zinc: 0.5
  },
  'colin': {
    calories: 86, proteins: 17.3, carbs: 0, lipids: 1.3, fibers: 0,
    vitaminB12: 1.5, calcium: 27, iron: 1, magnesium: 31, phosphore: 224, potassium: 356, zinc: 0.4
  },
  'truite': {
    calories: 148, proteins: 19.5, carbs: 0, lipids: 7.5, fibers: 0,
    vitaminD: 2.2, vitaminB12: 4.5, calcium: 19, iron: 0.7, magnesium: 24, phosphore: 226, potassium: 361, zinc: 0.6
  },
  'sardine': {
    calories: 208, proteins: 24.6, carbs: 0, lipids: 11.5, fibers: 0,
    vitaminD: 11, vitaminB12: 8.9, calcium: 382, iron: 2.9, magnesium: 39, phosphore: 490, potassium: 397, zinc: 1.3
  },
  'maquereau': {
    calories: 205, proteins: 18.6, carbs: 0, lipids: 13.9, fibers: 0,
    vitaminD: 7.6, vitaminB12: 8.7, calcium: 12, iron: 1.6, magnesium: 76, phosphore: 217, potassium: 314, zinc: 0.6
  },
  
  // ========== ŒUFS & PRODUITS LAITIERS ==========
  'œuf': {
    calories: 145, proteins: 12.6, carbs: 0.72, lipids: 9.9, fibers: 0,
    vitaminA: 160, vitaminD: 2.1, vitaminE: 1.2, vitaminB12: 1.3, vitaminB6: 0.14,
    calcium: 56, iron: 1.8, magnesium: 12, phosphore: 180, potassium: 130, zinc: 1.3
  },
  'lait': {
    calories: 64, proteins: 3.2, carbs: 4.7, lipids: 3.7, fibers: 0,
    vitaminA: 46, vitaminD: 0.05, vitaminE: 0.09, vitaminB12: 0.3, vitaminB6: 0.04,
    calcium: 119, iron: 0.03, magnesium: 11, phosphore: 93, potassium: 150, zinc: 0.4
  },
  'yaourt': {
    calories: 59, proteins: 3.5, carbs: 4.3, lipids: 3.2, fibers: 0,
    vitaminB12: 0.4, calcium: 138, iron: 0.1, magnesium: 13, phosphore: 117, potassium: 180, zinc: 0.6
  },
  'fromage': {
    calories: 356, proteins: 23, carbs: 1.3, lipids: 28, fibers: 0,
    vitaminA: 264, vitaminD: 0.5, vitaminE: 0.74, vitaminB12: 1.2, vitaminB6: 0.08,
    calcium: 720, iron: 0.68, magnesium: 27, phosphore: 470, potassium: 98, zinc: 3.1
  },
  'parmesan': {
    calories: 392, proteins: 38, carbs: 0.9, lipids: 25, fibers: 0,
    vitaminA: 207, vitaminD: 0.5, vitaminB12: 1.2,
    calcium: 1184, iron: 0.82, magnesium: 44, phosphore: 694, potassium: 120, zinc: 3.2
  },
  'mozzarella': {
    calories: 280, proteins: 28, carbs: 2.2, lipids: 17, fibers: 0,
    vitaminA: 179, vitaminB12: 2.3, calcium: 505, iron: 0.4, magnesium: 20, phosphore: 354, potassium: 76, zinc: 2.9
  },
  
  // ========== LÉGUMINEUSES ==========
  'lentilles': {
    calories: 116, proteins: 9, carbs: 16.3, lipids: 0.4, fibers: 7.9,
    vitaminB6: 0.18, vitaminB9: 180, calcium: 19, iron: 3.3, magnesium: 36, phosphore: 180, potassium: 370, zinc: 1.3
  },
  'pois chiches': {
    calories: 119, proteins: 8.9, carbs: 17.7, lipids: 1.8, fibers: 6.4,
    vitaminB6: 0.14, vitaminB9: 145, calcium: 48, iron: 2.6, magnesium: 40, phosphore: 130, potassium: 270, zinc: 1.4
  },
  'haricots rouges': {
    calories: 101, proteins: 8.4, carbs: 14.4, lipids: 0.5, fibers: 6.8,
    vitaminB6: 0.12, vitaminB9: 130, calcium: 28, iron: 2.1, magnesium: 45, phosphore: 142, potassium: 403, zinc: 1.1
  },
  
  // ========== LÉGUMES ==========
  'épinards': {
    calories: 23, proteins: 2.9, carbs: 3.6, lipids: 0.4, fibers: 2.2,
    vitaminA: 469, vitaminC: 28.1, vitaminE: 2, vitaminK: 483, vitaminB6: 0.2, vitaminB9: 194,
    calcium: 99, iron: 2.7, magnesium: 79, phosphore: 49, potassium: 558, zinc: 0.53
  },
  'brocoli': {
    calories: 34, proteins: 2.8, carbs: 6.6, lipids: 0.4, fibers: 2.6,
    vitaminA: 31, vitaminC: 89.2, vitaminE: 0.78, vitaminK: 102, vitaminB6: 0.18, vitaminB9: 63,
    calcium: 47, iron: 0.73, magnesium: 21, phosphore: 66, potassium: 316, zinc: 0.41
  },
  'chou kale': {
    calories: 50, proteins: 3.3, carbs: 10, lipids: 0.7, fibers: 2,
    vitaminA: 500, vitaminC: 120, vitaminK: 705, calcium: 150, iron: 1.5, magnesium: 33, zinc: 0.4
  },
  'poivron rouge': {
    calories: 31, proteins: 1, carbs: 6, lipids: 0.3, fibers: 2.1,
    vitaminC: 127.7, vitaminA: 157, vitaminE: 1.58, vitaminB6: 0.29,
    calcium: 7, iron: 0.43, magnesium: 12, phosphore: 26, potassium: 211, zinc: 0.25
  },
  
  // ========== FRUITS SECS & NOIX ==========
  'amande': {
    calories: 579, proteins: 21.2, carbs: 21.5, lipids: 50, fibers: 12.5,
    vitaminE: 25.6, vitaminB6: 0.14, calcium: 264, iron: 3.7, magnesium: 270, phosphore: 481, potassium: 733, zinc: 3.1
  },
  'noix': {
    calories: 654, proteins: 15.2, carbs: 13.7, lipids: 65.2, fibers: 6.7,
    vitaminE: 0.7, vitaminB6: 0.54, calcium: 98, iron: 2.9, magnesium: 158, phosphore: 346, potassium: 441, zinc: 3.1
  },
  'cacahuète': {
    calories: 567, proteins: 26, carbs: 16, lipids: 49, fibers: 8.5,
    vitaminE: 8.3, vitaminB6: 0.35, calcium: 92, iron: 4.6, magnesium: 168, phosphore: 376, potassium: 705, zinc: 3.3
  },
  'noisette': {
    calories: 628, proteins: 15, carbs: 16.7, lipids: 60.8, fibers: 9.7,
    vitaminE: 15, vitaminB6: 0.56, calcium: 114, iron: 4.7, magnesium: 163, phosphore: 290, potassium: 680, zinc: 2.5
  },
  
  // ========== FÉCULENTS ==========
  'quinoa': {
    calories: 368, proteins: 14.1, carbs: 64.2, lipids: 6.1, fibers: 7,
    vitaminB6: 0.49, vitaminE: 2.4, calcium: 47, iron: 4.6, magnesium: 197, phosphore: 457, potassium: 563, zinc: 3.1
  },
  'riz complet': {
    calories: 370, proteins: 7.9, carbs: 77.2, lipids: 2.9, fibers: 3.5,
    vitaminB6: 0.51, vitaminE: 1.2, calcium: 23, iron: 1.8, magnesium: 143, phosphore: 333, potassium: 268, zinc: 2
  },
  'pain complet': {
    calories: 247, proteins: 8.5, carbs: 49.4, lipids: 3.5, fibers: 7.5,
    vitaminB6: 0.27, vitaminE: 0.38, calcium: 67, iron: 2.5, magnesium: 75, phosphore: 198, potassium: 227, zinc: 1.8
  }
};

async function updateDatabase() {
  console.log('\n🎯 APPLICATION DES VALEURS NUTRITIONNELLES EXACTES (CIQUAL)\n');
  console.log('='.repeat(70));
  
  // Lire le fichier actuel
  const filePath = 'scripts/ingredients-database.js';
  let content = await fs.readFile(filePath, 'utf8');
  
  let updatedCount = 0;
  let notFoundCount = 0;
  
  for (const [ingredient, values] of Object.entries(exactValues)) {
    // Chercher l'ingrédient dans le fichier
    const regex = new RegExp(`'${ingredient}':\\s*\\{[^}]+nutritionalValues:\\s*\\{[^}]+\\}`, 's');
    
    if (content.match(regex)) {
      console.log(`✅ Mise à jour: ${ingredient}`);
      
      // Construire le nouveau bloc nutritionalValues
      const nutritionalBlock = Object.entries(values)
        .map(([key, val]) => `      ${key}: ${val}`)
        .join(',\n');
      
      // Remplacer uniquement le bloc nutritionalValues
      const ingredientRegex = new RegExp(
        `('${ingredient}':\\s*\\{[^}]*?nutritionalValues:\\s*\\{)([^}]*)(\\}[^}]*\\})`,
        's'
      );
      
      content = content.replace(ingredientRegex, `$1\n${nutritionalBlock}\n    $3`);
      updatedCount++;
    } else {
      console.log(`⚠️  Non trouvé: ${ingredient}`);
      notFoundCount++;
    }
  }
  
  // Sauvegarder le fichier
  await fs.writeFile(filePath, content, 'utf8');
  
  console.log('\n' + '='.repeat(70));
  console.log(`\n✅ ${updatedCount} ingrédients enrichis avec succès !`);
  console.log(`⚠️  ${notFoundCount} ingrédients non trouvés dans la database\n`);
  console.log(`📁 Fichier mis à jour: ${filePath}\n`);
}

updateDatabase().catch(console.error);

