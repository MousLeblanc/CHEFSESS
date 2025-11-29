// scripts/add-french-titles-descriptions.js
// Script pour ajouter les titres français et descriptions aux recettes
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Données des recettes à mettre à jour
 */
const recipesToUpdate = [
  {
    name: 'Biko',
    category: 'plat',
    frenchTitle: 'Biko',
    description: 'Gâteau de riz sucré philippin, à base de riz gluant, lait de coco et sucre roux.',
    note: 'À déplacer vers DESSERT (C\'est un gâteau sucré).'
  },
  {
    name: 'Sarma (Stuffed Cabbage)',
    category: 'plat',
    frenchTitle: 'Sarma (Chou Farcis)',
    description: 'Feuilles de chou ou de vigne farcies. La farce contient généralement de la viande hachée, du riz, des oignons et des épices.',
    note: 'Laisser en PLAT (Plat de résistance servi chaud).'
  },
  {
    name: 'Waterzooi de Poulet aux Légumes, Riz et Crème',
    category: 'plat',
    frenchTitle: 'Waterzooi de Poulet',
    description: 'Waterzooï (ou Waterzooi) : Soupe-repas mijotée (ragoût épais), d\'origine belge (Gand), à base de poulet (ou poisson), de légumes (carotte, céleri, poireau, pomme de terre) et d\'un bouillon lié à la crème ou au beurre.',
    note: 'Laisser en PLAT (Soupe-repas complète).'
  },
  {
    name: 'DAMPFNUDELN',
    category: 'plat',
    frenchTitle: 'Dampfnudeln',
    description: 'Petit pain blanc (ou pain au lait) gonflé à la vapeur. Peut être consommé comme plat principal (surtout en Bavière) ou comme dessert.',
    note: 'Laisser en PLAT (si servi comme tel, mais peut aussi être un accompagnement ou dessert).'
  },
  {
    name: 'Witchetty Grubs',
    category: 'plat',
    frenchTitle: 'Larves Witchetty',
    description: 'Larves comestibles (souvent de papillons de nuit). Plat traditionnel aborigène australien, riche en protéines et matières grasses.',
    note: 'Laisser en PLAT (Source de protéines, plat principal pour les populations locales).'
  },
  {
    name: 'KAISERSCHMARREN',
    category: 'dessert',
    frenchTitle: 'Kaiserschmarrn',
    description: 'Plat principal sucré autrichien. C\'est une crêpe épaisse, coupée en morceaux, réalisée avec des blancs en neige et servie saupoudrée de sucre glace, souvent accompagnée de compote de pommes ou de prunes.',
    note: 'Laisser en DESSERT (Bien qu\'appelé "plat principal sucré" en Autriche, il est classé comme dessert dans un menu occidental).'
  },
  {
    name: 'Kolaczki',
    category: 'dessert',
    frenchTitle: 'Kolaczki',
    description: 'Biscuits polonais traditionnels. Petites pâtisseries à la pâte riche en fromage à la crème et en beurre, souvent garnies de confiture (pruneau, abricot, framboise).',
    note: 'Laisser en DESSERT.'
  },
  {
    name: 'SABAYON',
    category: 'dessert',
    frenchTitle: 'Sabayon',
    description: 'Entremets italien (zabaglione) à base de jaunes d\'œufs, de sucre semoule et généralement de vin doux. C\'est une crème légère et mousseuse.',
    note: 'Laisser en DESSERT.'
  }
];

/**
 * Fonction principale
 */
async function addFrenchTitlesDescriptions() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    let updated = 0;
    let notFound = [];
    
    console.log(`📝 Mise à jour de ${recipesToUpdate.length} recette(s)...\n`);
    
    for (const recipeData of recipesToUpdate) {
      const recipe = await RecipeEnriched.findOne({ name: recipeData.name }).lean();
      
      if (recipe) {
        // Mettre à jour la recette avec les nouveaux champs
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
        console.log(`   Description: ${recipeData.description.substring(0, 80)}...`);
        console.log();
        
        updated++;
      } else {
        notFound.push(recipeData.name);
        console.log(`⚠️  Recette non trouvée: "${recipeData.name}"`);
      }
    }
    
    // Afficher le résumé
    console.log('='.repeat(80));
    console.log(`📊 RÉSUMÉ:`);
    console.log(`   ✅ ${updated} recette(s) mise(s) à jour`);
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
  addFrenchTitlesDescriptions()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default addFrenchTitlesDescriptions;


