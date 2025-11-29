// scripts/list-plats-by-type.js
// Script pour lister les plats par type (végétarien, poisson, viande, volaille)
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fonction principale
 */
async function listPlatsByType() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    // Récupérer tous les plats avec leurs tags
    console.log('📖 Récupération des plats...');
    const plats = await RecipeEnriched.find({ category: 'plat' }, { name: 1, tags: 1 })
      .sort({ name: 1 })
      .lean();
    console.log(`✅ ${plats.length} plat(s) trouvé(s)\n`);
    
    // Grouper par type
    const platsByType = {
      'végétarien': [],
      'poisson': [],
      'viande': [],
      'volaille': [],
      'non classé': []
    };
    
    plats.forEach(plat => {
      const tags = plat.tags || [];
      const typeTag = tags.find(tag => tag.startsWith('type:'));
      
      if (typeTag) {
        const type = typeTag.replace('type:', '');
        if (platsByType[type]) {
          platsByType[type].push(plat.name);
        } else {
          platsByType['non classé'].push(plat.name);
        }
      } else {
        platsByType['non classé'].push(plat.name);
      }
    });
    
    // Afficher les résultats
    console.log('='.repeat(80));
    console.log('📋 LISTE DES PLATS PAR TYPE');
    console.log('='.repeat(80));
    console.log();
    
    const typeOrder = ['végétarien', 'volaille', 'viande', 'poisson', 'non classé'];
    let totalPlats = 0;
    
    typeOrder.forEach(type => {
      const recipes = platsByType[type];
      if (recipes.length > 0) {
        totalPlats += recipes.length;
        console.log(`\n📁 ${type.toUpperCase()} (${recipes.length} recette${recipes.length > 1 ? 's' : ''})`);
        console.log('-'.repeat(80));
        recipes.slice(0, 50).forEach((name, index) => {
          console.log(`  ${(index + 1).toString().padStart(3, ' ')}. ${name}`);
        });
        if (recipes.length > 50) {
          console.log(`  ... et ${recipes.length - 50} autres recettes`);
        }
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log(`📊 TOTAL: ${totalPlats} plat(s) dans ${typeOrder.filter(t => platsByType[t].length > 0).length} type(s)`);
    console.log('='.repeat(80));
    
    // Statistiques par type
    console.log('\n📊 STATISTIQUES PAR TYPE:');
    console.log('-'.repeat(80));
    typeOrder.forEach(type => {
      const count = platsByType[type].length;
      if (count > 0) {
        const percentage = ((count / totalPlats) * 100).toFixed(1);
        console.log(`  ${type.padEnd(15)} : ${count.toString().padStart(4)} recettes (${percentage}%)`);
      }
    });
    
    // Générer un fichier texte
    const outputPath = path.join(__dirname, '..', 'data', 'liste-plats-par-type.txt');
    let fileContent = 'LISTE DES PLATS PAR TYPE\n';
    fileContent += '='.repeat(80) + '\n\n';
    fileContent += `Total: ${totalPlats} plat(s)\n\n`;
    
    typeOrder.forEach(type => {
      const recipes = platsByType[type];
      if (recipes.length > 0) {
        fileContent += `\n${type.toUpperCase()} (${recipes.length} recette${recipes.length > 1 ? 's' : ''})\n`;
        fileContent += '-'.repeat(80) + '\n';
        recipes.forEach((name, index) => {
          fileContent += `${(index + 1).toString().padStart(3, ' ')}. ${name}\n`;
        });
      }
    });
    
    fs.writeFileSync(outputPath, fileContent, 'utf8');
    console.log(`\n✅ Liste sauvegardée dans: ${outputPath}`);
    
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
  listPlatsByType()
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default listPlatsByType;


