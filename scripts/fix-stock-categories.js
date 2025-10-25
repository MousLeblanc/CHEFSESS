// scripts/fix-stock-categories.js
import mongoose from 'mongoose';
import Stock from '../models/Stock.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

// Dictionnaire de correspondance mot-clé -> catégorie
const categoryMappings = {
  'legumes': ['tomate', 'carotte', 'oignon', 'poivron', 'courgette', 'aubergine', 'pomme de terre', 'patate', 'chou', 'salade', 'laitue', 'épinard', 'brocoli', 'haricot', 'pois', 'navaro', 'navet', 'endive', 'poireau', 'asperge', 'artichaut', 'betterave', 'céleri', 'fenouil', 'ail', 'échalote'],
  'viandes': ['poulet', 'boeuf', 'porc', 'veau', 'agneau', 'canard', 'dinde', 'jambon', 'bacon', 'saucisse', 'steak', 'côtelette', 'rôti', 'bavette', 'aiguillette', 'filet', 'escalope', 'blanquette', 'émincé', 'hachis', 'chair'],
  'poissons': ['saumon', 'thon', 'cabillaud', 'morue', 'truite', 'bar', 'daurade', 'sole', 'lieu', 'merlan', 'sardine', 'maquereau', 'anchois', 'hareng', 'crevette', 'gambas', 'homard', 'crabe', 'moule', 'huître', 'coquille', 'seiche', 'calmar', 'poulpe', 'aiglefin', 'aileron'],
  'produits-laitiers': ['lait', 'fromage', 'yaourt', 'beurre', 'crème', 'camembert', 'emmental', 'gruyère', 'roquefort', 'brie', 'chèvre', 'mozzarella', 'parmesan', 'ricotta', 'mascarpone', 'feta', 'cottage'],
  'cereales': ['pain', 'riz', 'pâtes', 'farine', 'blé', 'avoine', 'orge', 'semoule', 'quinoa', 'boulgour', 'couscous', 'maïs', 'polenta', 'céréale', 'muesli', 'granola'],
  'fruits': ['pomme', 'poire', 'banane', 'orange', 'clémentine', 'mandarine', 'citron', 'pamplemousse', 'raisin', 'fraise', 'framboise', 'mûre', 'myrtille', 'cerise', 'abricot', 'pêche', 'prune', 'melon', 'pastèque', 'ananas', 'mangue', 'kiwi', 'fruit'],
  'epices': ['sel', 'poivre', 'épice', 'curry', 'paprika', 'cumin', 'cannelle', 'muscade', 'gingembre', 'safran', 'curcuma', 'coriandre', 'persil', 'thym', 'romarin', 'basilic', 'menthe', 'laurier', 'herbe', 'aromate'],
  'boissons': ['eau', 'jus', 'soda', 'café', 'thé', 'lait', 'sirop', 'nectar', 'boisson', 'infusion']
};

function detectCategory(itemName) {
  const nameLower = itemName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categoryMappings)) {
    for (const keyword of keywords) {
      if (nameLower.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'autres'; // Catégorie par défaut si aucune correspondance
}

async function fixStockCategories() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Récupérer tous les documents de stock
    const stocks = await Stock.find({});
    console.log(`📦 ${stocks.length} documents de stock trouvés`);

    let totalUpdated = 0;
    let totalItems = 0;

    for (const stock of stocks) {
      let updated = false;
      
      for (const item of stock.items) {
        totalItems++;
        
        // Si la catégorie est "autres" ou manquante, essayer de la détecter
        if (!item.category || item.category === 'autres') {
          const detectedCategory = detectCategory(item.name);
          
          if (detectedCategory !== 'autres') {
            console.log(`  🔍 "${item.name}" -> ${detectedCategory}`);
            item.category = detectedCategory;
            updated = true;
            totalUpdated++;
          }
        }
      }
      
      if (updated) {
        await stock.save();
        console.log(`  ✅ Stock mis à jour pour ${stock.createdBy || stock.groupId || stock.siteId}`);
      }
    }

    console.log('\n📊 Résumé:');
    console.log(`  - Articles analysés: ${totalItems}`);
    console.log(`  - Catégories corrigées: ${totalUpdated}`);
    console.log(`  - Articles restant "Autres": ${totalItems - totalUpdated}`);

    await mongoose.connection.close();
    console.log('✅ Terminé !');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

fixStockCategories();

