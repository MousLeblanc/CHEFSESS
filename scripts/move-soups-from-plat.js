// scripts/move-soups-from-plat.js
// Script pour déplacer les soupes et veloutés de PLAT vers SOUPE
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recettes à déplacer de PLAT vers SOUPE
 */
const platToSoupe = [
  'Bortsch aux Betteraves et Chou avec Crème Fraîche',
  'Bouillon Dashi au Kombu et Katsuobushi',
  'Bouillon Pho Vietnamien au Bœuf et Nouilles de Riz',
  'Bouillon crémeux de dinde aux petits pois et semoule',
  'Bouillon de Carottes et Poireaux au Lait Enrichi',
  'Bouillon de Thon aux Légumes et Riz',
  'Crème de Pois Cassés et Oignon au Bouillon Légumes',
  'Crème onctueuse de pommes de terre et carottes',
  'French Onion Soup Gratinee',
  'Minestrone de Légumes de Saison, Haricots, Petites Pâtes et Parmesan',
  'SOUPE AU POIVRON ROUGE ET AU PIMENT',
  'SOUPE DE PETITS POIS',
  'SOUPE DE POMMES DE TERRE',
  'SOUPE GLACÉE À LA COURGETTE ET À LA SAUGE',
  'SOUPE À L\'OIGNON GRATINÉE',
  'Soupe Brocoli-Butternut aux Pois Chiches et Boulgour',
  'Velouté Crémeux de Champignons de Paris au Bouillon de Volaille',
  'Velouté Parmentier aux Pommes de Terre et Poireaux',
  'Velouté Protéiné aux Aubergines et Chou-Fleur',
  'Velouté Provençal de Courgettes et Carottes aux Herbes',
  'Velouté d\'Artichauts et Pomme de Terre au Bouillon Légumes',
  'Velouté d\'Endives aux Fèves ou Jambon Cru',
  'Velouté d\'Oseille à la Crème et Jaune d\'Œuf',
  'Velouté de Brocoli au Bouillon de Légumes',
  'Velouté de Brocolis au Cheddar ou Roquefort',
  'Velouté de Brocolis au Fromage Allégé',
  'Velouté de Brocolis et Épinards aux Amandes',
  'Velouté de Brocolis, Courgettes et Fromage Frais',
  'Velouté de Butternut au Sirop d\'Érable et Noix de Pécan',
  'Velouté de Carottes au Petit-Suisse',
  'Velouté de Carottes et Courgettes',
  'Velouté de Carottes et Pomme de Terre au Cumin',
  'Velouté de Carottes, Céleri et Poireaux à l\'Avoine',
  'Velouté de Carottes, Pommes de Terre et Courgettes',
  'Velouté de Chou-fleur et Pomme de Terre à la Crème',
  'Velouté de Courgettes, Pomme de Terre et Fromage Fondant',
  'Velouté de Haricots de Soissons et Croûtons Aillés',
  'Velouté de Lentilles Corail au Curry et Lait de Coco'
];

/**
 * Recettes à déplacer de PLAT vers ACCOMPAGNEMENT (pour "Crème de champignons")
 */
const platToAccompagnement = [
  'Crème de champignons'
];

/**
 * Fonction principale
 */
async function moveSoupsFromPlat() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    const corrections = [];
    const notFound = [];
    
    // Traiter les recettes depuis PLAT vers SOUPE
    console.log('🔍 Recherche des recettes à déplacer de PLAT vers SOUPE...\n');
    for (const recipeName of platToSoupe) {
      const recipe = await RecipeEnriched.findOne({ name: recipeName }).lean();
      
      if (recipe) {
        const currentCategory = recipe.category || 'plat';
        
        if (currentCategory !== 'soupe') {
          corrections.push({
            id: recipe._id,
            name: recipeName,
            oldCategory: currentCategory,
            newCategory: 'soupe'
          });
        }
      } else {
        notFound.push(recipeName);
      }
    }
    
    // Traiter les recettes depuis PLAT vers ACCOMPAGNEMENT
    console.log('🔍 Recherche des recettes à déplacer de PLAT vers ACCOMPAGNEMENT...\n');
    for (const recipeName of platToAccompagnement) {
      const recipe = await RecipeEnriched.findOne({ name: recipeName }).lean();
      
      if (recipe) {
        const currentCategory = recipe.category || 'plat';
        
        if (currentCategory !== 'accompagnement') {
          corrections.push({
            id: recipe._id,
            name: recipeName,
            oldCategory: currentCategory,
            newCategory: 'accompagnement'
          });
        }
      } else {
        notFound.push(recipeName);
      }
    }
    
    // Afficher les recettes non trouvées
    if (notFound.length > 0) {
      console.log(`\n⚠️  ${notFound.length} recette(s) non trouvée(s):`);
      notFound.forEach(name => {
        console.log(`   - "${name}"`);
      });
    }
    
    // Afficher les corrections
    console.log(`\n📊 ${corrections.length} correction(s) à effectuer:\n`);
    
    const correctionsByCategory = {};
    corrections.forEach(corr => {
      const key = `${corr.oldCategory} → ${corr.newCategory}`;
      if (!correctionsByCategory[key]) {
        correctionsByCategory[key] = [];
      }
      correctionsByCategory[key].push(corr);
    });
    
    Object.entries(correctionsByCategory)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([key, items]) => {
        console.log(`  ${key}: ${items.length} recette(s)`);
        items.slice(0, 10).forEach(item => {
          console.log(`    - "${item.name}"`);
        });
        if (items.length > 10) {
          console.log(`    ... et ${items.length - 10} autres`);
        }
        console.log();
      });
    
    // Appliquer les corrections
    if (corrections.length > 0) {
      console.log('🔄 Application des corrections...\n');
      
      let updated = 0;
      for (const correction of corrections) {
        await RecipeEnriched.updateOne(
          { _id: correction.id },
          { $set: { category: correction.newCategory } }
        );
        updated++;
        
        if (updated % 20 === 0) {
          console.log(`  ✅ ${updated}/${corrections.length} corrections appliquées...`);
        }
      }
      
      console.log(`\n✅ ${updated} recette(s) mise(s) à jour`);
    } else {
      console.log('✅ Aucune correction nécessaire');
    }
    
    // Statistiques finales
    const stats = await RecipeEnriched.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 STATISTIQUES FINALES PAR CATÉGORIE:');
    console.log('-'.repeat(80));
    const total = stats.reduce((sum, stat) => sum + stat.count, 0);
    stats.forEach(stat => {
      const percentage = ((stat.count / total) * 100).toFixed(1);
      console.log(`  ${stat._id.padEnd(20)} : ${stat.count.toString().padStart(4)} recettes (${percentage}%)`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${path.resolve(process.argv[1])}` || 
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  moveSoupsFromPlat()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default moveSoupsFromPlat;

