// scripts/franciser-et-corriger-categories.js
// Script pour franciser les plats étrangers et corriger les catégories
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
    newCategory: 'dessert',
    frenchTitle: 'Biko',
    description: 'Gâteau de riz gluant philippin sucré (à base de riz gluant, lait de coco et sucre roux).',
    note: 'ERREUR → DESSERT (C\'est une pâtisserie sucrée).'
  },
  {
    name: 'Berbere',
    newCategory: 'accompagnement',
    frenchTitle: 'Berbere',
    description: 'Mélange d\'épices éthiopien et érythréen (piment, ail, gingembre, basilic, etc.).',
    note: 'ERREUR → ACCOMPAGNEMENT (C\'est un assaisonnement, pas un plat principal).'
  },
  {
    name: 'Gedde Bollen',
    newCategory: null, // OK
    frenchTitle: 'Boulettes de viande',
    description: 'Boulettes de viande (Pays-Bas).',
    note: 'OK (Plat à base de viande).'
  },
  {
    name: 'GERMKNÖDEL',
    newCategory: null, // OK / AMBIGU
    frenchTitle: 'Germknödel',
    description: 'Grande boule de pâte de levure à la vapeur fourrée (souvent à la confiture de prune et recouverte de graines de pavot et de beurre fondu).',
    note: 'OK / AMBIGU (Plat principal en Autriche/Bavière, mais souvent sucré - peut être un DESSERT).'
  },
  {
    name: 'KJØTTKAKER',
    newCategory: null, // OK
    frenchTitle: 'Boulettes de viande norvégiennes',
    description: 'Boulettes de viande norvégiennes (servies avec pommes de terre, chou-fleur et sauce).',
    note: 'OK (Plat à base de viande).'
  },
  {
    name: 'KOLDSKAAL',
    newCategory: 'soupe',
    frenchTitle: 'Koldskål',
    description: 'Soupe froide danoise au babeurre (traditionnellement servie avec des biscuits au babeurre appelés kammerjunker).',
    note: 'ERREUR → SOUPE (C\'est une soupe froide).'
  },
  {
    name: 'SCHWÄBISCHE MAULTASCHEN',
    newCategory: null, // OK
    frenchTitle: 'Maultaschen souabes',
    description: 'Grandes ravioles souabes (Allemagne), farcies à la viande hachée, aux épinards et aux oignons.',
    note: 'OK (Plat de pâtes farcies - plat principal).'
  },
  {
    name: 'SERVIETTENKNÖDEL',
    newCategory: 'accompagnement',
    frenchTitle: 'Boulettes de pain à la serviette',
    description: 'Boulettes de pain cuites à la vapeur dans une serviette.',
    note: 'ERREUR → ACCOMPAGNEMENT (C\'est un accompagnement typique des plats de viande allemands).'
  },
  {
    name: 'SPÄTZLE',
    newCategory: null, // OK / AMBIGU
    frenchTitle: 'Spätzle',
    description: 'Petites pâtes aux œufs allemandes (souvent servies comme accompagnement ou en plat principal avec fromage/viande).',
    note: 'OK / AMBIGU (Souvent un plat principal complet - Käsespätzle).'
  },
  {
    name: 'VITELLO TONNATO',
    newCategory: 'entrée',
    frenchTitle: 'Vitello tonnato',
    description: 'Veau au thon. Plat italien de fines tranches de veau froid recouvertes d\'une sauce crémeuse à base de thon et de câpres.',
    note: 'ERREUR → ENTRÉE (Classiquement servi froid comme entrée - antipasto).'
  },
  {
    name: 'Waterzooi de Poulet aux Légumes, Riz et Crème',
    newCategory: null, // OK
    frenchTitle: 'Waterzooi de Poulet',
    description: 'Waterzoï (ou Waterzooi). Ragoût épais belge à base de poulet (ou poisson), riz et légumes.',
    note: 'OK (Plat complet, type ragoût - soupe-repas).'
  },
  {
    name: 'Wiener Schnitzel',
    newCategory: null, // OK
    frenchTitle: 'Escalope viennoise',
    description: 'Fine escalope de veau panée.',
    note: 'OK (Plat principal).'
  },
  {
    name: 'Witchetty Grubs',
    newCategory: null, // OK
    frenchTitle: 'Larves Witchetty',
    description: 'Larves comestibles australiennes (Plat traditionnel aborigène).',
    note: 'OK (Plat principal - source de protéines).'
  },
  {
    name: 'Yorkshire Pudding',
    newCategory: 'accompagnement',
    frenchTitle: 'Yorkshire Pudding',
    description: 'Pâtisserie salée anglaise (accompagnement de rôtis).',
    note: 'ERREUR → ACCOMPAGNEMENT (C\'est un accompagnement traditionnel).'
  },
  {
    name: 'KAMMERJUNKERS',
    newCategory: null, // OK
    frenchTitle: 'Kammerjunker',
    description: 'Biscuits au babeurre danois (souvent servis avec le Koldskål).',
    note: 'OK (Pâtisserie/dessert).'
  },
  {
    name: 'SABAYON',
    newCategory: null, // OK
    frenchTitle: 'Sabayon',
    description: 'Zabaglione. Crème mousseuse italienne au jaune d\'œuf, sucre et vin doux (Marsala ou Moscato).',
    note: 'OK (Dessert).'
  }
];

/**
 * Fonction principale
 */
async function franciserEtCorrigerCategories() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    let updated = 0;
    let categoryChanged = 0;
    let notFound = [];
    
    console.log(`📝 Mise à jour de ${recipesToUpdate.length} recette(s)...\n`);
    
    for (const recipeData of recipesToUpdate) {
      const recipe = await RecipeEnriched.findOne({ name: recipeData.name }).lean();
      
      if (recipe) {
        const updateData = {
          frenchTitle: recipeData.frenchTitle,
          description: recipeData.description
        };
        
        // Changer la catégorie si nécessaire
        if (recipeData.newCategory && recipe.category !== recipeData.newCategory) {
          updateData.category = recipeData.newCategory;
          categoryChanged++;
        }
        
        await RecipeEnriched.updateOne(
          { _id: recipe._id },
          { $set: updateData }
        );
        
        console.log(`✅ "${recipeData.name}"`);
        console.log(`   Titre FR: ${recipeData.frenchTitle}`);
        if (recipeData.newCategory) {
          console.log(`   Catégorie: ${recipe.category} → ${recipeData.newCategory}`);
        } else {
          console.log(`   Catégorie: ${recipe.category} (inchangée)`);
        }
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
    console.log(`   🔄 ${categoryChanged} catégorie(s) modifiée(s)`);
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
  franciserEtCorrigerCategories()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default franciserEtCorrigerCategories;


