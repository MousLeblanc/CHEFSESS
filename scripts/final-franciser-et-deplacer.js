// scripts/final-franciser-et-deplacer.js
// Script pour les derniers déplacements et francisations
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recettes à déplacer
 */
const recipesToMove = [
  {
    name: 'Crème de champignons',
    newCategory: 'accompagnement',
    note: 'SOUPE → ACCOMPAGNEMENT (Crème ou sauce pour accompagner un plat)'
  }
];

/**
 * Recettes à franciser/mettre à jour
 */
const recipesToFrancize = [
  {
    name: 'SCHWÄBISCHE MAULTASCHEN',
    frenchTitle: 'Ravioles Souabes',
    description: 'Ravioles Souabes (Allemagne). Grandes ravioles farcies de viande hachée, d\'épinards et de mie de pain.',
    note: 'OK (Plat de pâtes farcies, plat principal).'
  },
  {
    name: 'DAMPFNUDELN',
    frenchTitle: 'Dampfnudeln',
    description: 'Petit pain à la vapeur (Allemagne). Peut être sucré (dessert) ou salé (accompagnement de viande).',
    note: 'OK (Acceptable en PLAT s\'il est servi avec une sauce salée).'
  },
  {
    name: 'Waterzooi de Poulet aux Légumes, Riz et Crème',
    frenchTitle: 'Waterzooi de Poulet',
    description: 'Waterzooï (Belgique). Ragoût ou potée épais à base de poulet (ou poisson), riz, légumes et lié à la crème.',
    note: 'OK (Soupe-repas complète).'
  },
  {
    name: 'Sarma (Stuffed Cabbage)',
    frenchTitle: 'Choux farcis',
    description: 'Choux farcis. Feuilles de chou fermentées farcies de viande hachée et de riz (Europe de l\'Est/Turquie).',
    note: 'OK (Plat mijoté de résistance).'
  },
  {
    name: 'SPÄTZLE',
    frenchTitle: 'Spätzle',
    description: 'Petites pâtes aux œufs souabes (Allemagne).',
    note: 'OK (Souvent un plat principal avec fromage, ou plat d\'accompagnement riche).'
  },
  {
    name: 'Witchetty Grubs',
    frenchTitle: 'Larves Witchetty',
    description: 'Larves comestibles (Australie).',
    note: 'OK (Source de protéines, plat local).'
  },
  {
    name: 'Korean Pizza',
    frenchTitle: 'Pizza coréenne',
    description: 'Pizza coréenne (Variante de Jeon ou plat avec garniture).',
    note: 'OK (Nom moderne pour un plat principal).'
  },
  {
    name: 'KAMMERJUNKERS',
    frenchTitle: 'Kammerjunker',
    description: 'Biscuits au babeurre danois.',
    note: 'OK (Pâtisserie sèche).'
  },
  {
    name: 'SABAYON',
    frenchTitle: 'Sabayon',
    description: 'Zabaglione. Crème mousseuse italienne au jaune d\'œuf, sucre et vin doux.',
    note: 'OK (Dessert).'
  },
  {
    name: 'TABBOULEH',
    frenchTitle: 'Taboulé',
    description: 'Taboulé. Salade de persil, menthe, tomates et boulgour.',
    note: 'OK (Salade/Entrée).'
  },
  {
    name: 'CHAPATIS',
    frenchTitle: 'Chapati',
    description: 'Pain plat (Inde).',
    note: 'OK (Pain d\'accompagnement).'
  },
  {
    name: 'Naan',
    frenchTitle: 'Naan',
    description: 'Pain plat (Inde).',
    note: 'OK (Pain d\'accompagnement).'
  }
];

/**
 * Fonction principale
 */
async function finalFranciserEtDeplacer() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    let moved = 0;
    let francized = 0;
    let notFound = [];
    
    // Déplacer les recettes
    console.log(`🔄 Déplacement de ${recipesToMove.length} recette(s)...\n`);
    for (const recipeData of recipesToMove) {
      const recipe = await RecipeEnriched.findOne({ name: recipeData.name }).lean();
      
      if (recipe) {
        if (recipe.category !== recipeData.newCategory) {
          await RecipeEnriched.updateOne(
            { _id: recipe._id },
            { $set: { category: recipeData.newCategory } }
          );
          console.log(`✅ "${recipeData.name}" : ${recipe.category} → ${recipeData.newCategory}`);
          moved++;
        } else {
          console.log(`ℹ️  "${recipeData.name}" est déjà dans ${recipeData.newCategory}`);
        }
      } else {
        notFound.push(recipeData.name);
        console.log(`⚠️  Recette non trouvée: "${recipeData.name}"`);
      }
    }
    
    // Franciser les recettes
    console.log(`\n📝 Francisation de ${recipesToFrancize.length} recette(s)...\n`);
    for (const recipeData of recipesToFrancize) {
      const recipe = await RecipeEnriched.findOne({ name: recipeData.name }).lean();
      
      if (recipe) {
        await RecipeEnriched.updateOne(
          { _id: recipe._id },
          {
            $set: {
              frenchTitle: recipeData.frenchTitle,
              description: recipeData.description
            }
          }
        );
        console.log(`✅ "${recipeData.name}"`);
        console.log(`   Titre FR: ${recipeData.frenchTitle}`);
        console.log(`   Description: ${recipeData.description.substring(0, 70)}...`);
        francized++;
      } else {
        notFound.push(recipeData.name);
        console.log(`⚠️  Recette non trouvée: "${recipeData.name}"`);
      }
    }
    
    // Afficher le résumé
    console.log('\n' + '='.repeat(80));
    console.log(`📊 RÉSUMÉ:`);
    console.log(`   🔄 ${moved} recette(s) déplacée(s)`);
    console.log(`   📝 ${francized} recette(s) francisée(s)`);
    if (notFound.length > 0) {
      console.log(`   ⚠️  ${notFound.length} recette(s) non trouvée(s):`);
      notFound.forEach(name => {
        console.log(`      - "${name}"`);
      });
    }
    
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
  finalFranciserEtDeplacer()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default finalFranciserEtDeplacer;


