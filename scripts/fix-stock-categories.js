// scripts/fix-stock-categories.js
import mongoose from 'mongoose';
import Stock from '../models/Stock.js';
import dotenv from 'dotenv';
import { detectCategory, getIngredientData, getNutritionalValues } from './ingredients-database.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

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
            // Récupérer aussi les données nutritionnelles
            const ingredientData = getIngredientData(item.name);
            
            console.log(`  🔍 "${item.name}" -> ${detectedCategory}`);
            if (ingredientData && ingredientData.nutritionalValues) {
              const nutritionalValues = ingredientData.nutritionalValues;
              console.log(`     📊 Calories: ${nutritionalValues.calories} kcal | Protéines: ${nutritionalValues.proteins}g | Glucides: ${nutritionalValues.carbs}g | Lipides: ${nutritionalValues.lipids}g`);
              
              // Optionnel: Ajouter les valeurs nutritionnelles à l'item si le modèle le supporte
              if (!item.nutritionalValues) {
                item.nutritionalValues = nutritionalValues;
              }
            }
            
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

