import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resident from '../models/Resident.js';
import Site from '../models/Site.js';

dotenv.config();

async function checkResidentsCount() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    console.log(`🔗 Connexion à MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***@')}`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log('✅ Connecté à MongoDB\n');
    
    // Chercher les sites d'Arthur et Béatrij
    const sites = await Site.find({ 
      $or: [
        { siteName: /arthur/i }, 
        { siteName: /beatrijs/i },
        { siteName: /béatrij/i }
      ] 
    });
    
    console.log('📋 Sites trouvés:');
    sites.forEach(s => {
      console.log(`  - ${s.siteName} (${s._id})`);
    });
    
    if (sites.length === 0) {
      console.log('\n❌ Aucun site trouvé pour Arthur ou Béatrij');
      await mongoose.disconnect();
      return;
    }
    
    // Vérifier pour chaque site
    for (const site of sites) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 Résidents pour: ${site.siteName} (${site._id})`);
      console.log('='.repeat(60));
      
      // Tous les résidents
      const allResidents = await Resident.find({ siteId: site._id });
      
      // Par statut
      const activeResidents = await Resident.find({ siteId: site._id, status: 'actif' });
      const inactiveResidents = await Resident.find({ siteId: site._id, status: 'inactif' });
      const sortiResidents = await Resident.find({ siteId: site._id, status: 'sorti' });
      const decedeResidents = await Resident.find({ siteId: site._id, status: 'décédé' });
      
      console.log(`\n  Total résidents: ${allResidents.length}`);
      console.log(`  ├─ Actifs: ${activeResidents.length}`);
      console.log(`  ├─ Inactifs: ${inactiveResidents.length}`);
      console.log(`  ├─ Sortis: ${sortiResidents.length}`);
      console.log(`  └─ Décédés: ${decedeResidents.length}`);
      
      // Résidents sans statut
      const noStatus = allResidents.filter(r => !r.status);
      if (noStatus.length > 0) {
        console.log(`  ⚠️  Sans statut: ${noStatus.length}`);
      }
      
      // Vérifier aussi les statuts avec différentes casse
      const statusCounts = {};
      allResidents.forEach(r => {
        const s = r.status || 'non défini';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
      });
      
      console.log(`\n  📈 Répartition détaillée des statuts:`);
      Object.entries(statusCounts).forEach(([s, c]) => {
        console.log(`     - "${s}": ${c}`);
      });
      
      // Afficher quelques exemples de résidents actifs
      if (activeResidents.length > 0) {
        console.log(`\n  📝 Exemples de résidents actifs (5 premiers):`);
        activeResidents.slice(0, 5).forEach(r => {
          console.log(`     - ${r.firstName} ${r.lastName} (${r.status})`);
        });
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkResidentsCount();

