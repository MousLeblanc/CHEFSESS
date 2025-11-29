// scripts/deplacer-et-mettre-a-jour-descriptions.js
// Script pour déplacer les dernières recettes et mettre à jour les descriptions
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
    name: 'Berbere',
    newCategory: 'accompagnement',
    note: 'PLAT → ACCOMPAGNEMENT (Mélange d\'épices éthiopien - assaisonnement)'
  },
  {
    name: 'Biko',
    newCategory: 'dessert',
    note: 'PLAT → DESSERT (Gâteau de riz gluant philippin - sucré)'
  },
  {
    name: 'KOLDSKAAL',
    newCategory: 'soupe',
    note: 'PLAT → SOUPE (Soupe froide danoise au babeurre)'
  },
  {
    name: 'Semmelknoedel (Bread Dumplings)',
    newCategory: 'accompagnement',
    note: 'PLAT → ACCOMPAGNEMENT (Boulettes de pain allemandes - accompagnement de viande)'
  },
  {
    name: 'VITELLO TONNATO',
    newCategory: 'entrée',
    note: 'PLAT → ENTRÉE (Veau au thon - plat froid italien servi en entrée)'
  }
];

/**
 * Recettes à mettre à jour avec nouvelles descriptions
 */
const recipesToUpdate = [
  {
    name: 'SCHWÄBISCHE MAULTASCHEN',
    frenchTitle: 'Ravioles Souabes',
    description: 'Grandes Ravioles Souabes (Allemagne). Farce de viande, épinards et mie de pain.',
    note: 'OK (Plat principal).'
  },
  {
    name: 'DAMPFNUDELN',
    frenchTitle: 'Dampfnudeln',
    description: 'Petit Pain à la Vapeur (Allemagne).',
    note: 'OK (Plat principal s\'il est servi avec une sauce salée).'
  },
  {
    name: 'KJØTTKAKER',
    frenchTitle: 'Boulettes de Viande Norvégiennes',
    description: 'Boulettes de Viande Norvégiennes.',
    note: 'OK (Plat de viande).'
  },
  {
    name: 'Wiener Schnitzel',
    frenchTitle: 'Escalope Viennoise',
    description: 'Escalope Viennoise (Autriche/Allemagne). Fine escalope de veau panée.',
    note: 'OK (Plat principal).'
  },
  {
    name: 'SERVIETTENKNÖDEL',
    frenchTitle: 'Boulettes de Pain à la Serviette',
    description: 'Boulettes de Pain cuites à la Serviette (Allemagne).',
    note: 'OK (Accompagnement).'
  },
  {
    name: 'SABAYON',
    frenchTitle: 'Sabayon',
    description: 'Zabaglione. Crème mousseuse italienne au vin doux.',
    note: 'OK (Dessert).'
  },
  {
    name: 'TABBOULEH',
    frenchTitle: 'Taboulé',
    description: 'Taboulé. Salade de persil, menthe et boulgour (Moyen-Orient).',
    note: 'OK (Entrée/Salade).'
  }
];

/**
 * Fonction principale
 */
async function deplacerEtMettreAJourDescriptions() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    let moved = 0;
    let updated = 0;
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
    
    // Mettre à jour les descriptions
    console.log(`\n📝 Mise à jour de ${recipesToUpdate.length} recette(s)...\n`);
    for (const recipeData of recipesToUpdate) {
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
        console.log(`   Description: ${recipeData.description}`);
        updated++;
      } else {
        notFound.push(recipeData.name);
        console.log(`⚠️  Recette non trouvée: "${recipeData.name}"`);
      }
    }
    
    // Afficher le résumé
    console.log('\n' + '='.repeat(80));
    console.log(`📊 RÉSUMÉ:`);
    console.log(`   🔄 ${moved} recette(s) déplacée(s)`);
    console.log(`   📝 ${updated} recette(s) mise(s) à jour`);
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
  deplacerEtMettreAJourDescriptions()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default deplacerEtMettreAJourDescriptions;


