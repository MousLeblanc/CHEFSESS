// scripts/update-resident-portions.js
// Ajoute les tailles de portion aux résidents existants

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Resident from '../models/Resident.js';

async function updateResidentPortions() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer tous les résidents
    const residents = await Resident.find({});
    console.log(`📊 ${residents.length} résidents trouvés\n`);

    let updated = 0;
    let skipped = 0;

    for (const resident of residents) {
      // Si portionSize n'existe pas ou est null, en attribuer une aléatoirement
      if (resident.portionSize === undefined || resident.portionSize === null) {
        // Distribution réaliste : 20% demi-portion, 60% normale, 20% double
        const random = Math.random();
        let portionSize;
        
        if (random < 0.2) {
          portionSize = 0.5;
        } else if (random < 0.8) {
          portionSize = 1;
        } else {
          portionSize = 2;
        }

        resident.portionSize = portionSize;
        await resident.save();
        updated++;
      } else {
        skipped++;
      }
    }

    console.log('✅ MISE À JOUR TERMINÉE !');
    console.log(`   📝 Résidents mis à jour : ${updated}`);
    console.log(`   ⏭️  Résidents déjà à jour : ${skipped}`);

    // Statistiques des portions
    const halfPortions = await Resident.countDocuments({ portionSize: 0.5 });
    const normalPortions = await Resident.countDocuments({ portionSize: 1 });
    const doublePortions = await Resident.countDocuments({ portionSize: 2 });

    console.log('\n📊 RÉPARTITION DES PORTIONS :');
    console.log(`   ½ Demi-portions : ${halfPortions} (${((halfPortions/residents.length)*100).toFixed(1)}%)`);
    console.log(`   1 Portions normales : ${normalPortions} (${((normalPortions/residents.length)*100).toFixed(1)}%)`);
    console.log(`   2 Double portions : ${doublePortions} (${((doublePortions/residents.length)*100).toFixed(1)}%)`);

    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

updateResidentPortions();

