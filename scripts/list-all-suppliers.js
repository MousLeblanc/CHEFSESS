// scripts/list-all-suppliers.js
// Liste tous les fournisseurs dans la base de données

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Supplier from '../models/Supplier.js';

async function listAllSuppliers() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
    console.log(`📊 ${suppliers.length} fournisseur(s) trouvé(s)\n`);
    
    if (suppliers.length === 0) {
      console.log('⚠️  Aucun fournisseur dans la base de données');
      console.log('💡 Vous pouvez créer des fournisseurs avec: node scripts/seed-suppliers.js');
    } else {
      console.log('='.repeat(100));
      suppliers.forEach((supplier, index) => {
        console.log(`\n${index + 1}. ${supplier.name}`);
        console.log(`   Email: ${supplier.email}`);
        console.log(`   Type: ${supplier.type || 'N/A'}`);
        console.log(`   Catégories: ${supplier.categories?.join(', ') || 'Aucune'}`);
        console.log(`   Ville: ${supplier.address?.city || 'N/A'}`);
        console.log(`   Produits: ${supplier.products?.length || 0}`);
        console.log(`   Zones de livraison: ${supplier.deliveryZones?.length || 0}`);
        if (supplier.deliveryZones && supplier.deliveryZones.length > 0) {
          console.log(`   📍 Zones: ${supplier.deliveryZones.slice(0, 3).map(z => `${z.city} (${z.postalCode})`).join(', ')}${supplier.deliveryZones.length > 3 ? '...' : ''}`);
        } else {
          console.log(`   ⚠️  Aucune zone de livraison`);
        }
        console.log(`   Groupe: ${supplier.groupId ? 'Oui' : 'Non'}`);
        console.log(`   Statut: ${supplier.status || 'active'}`);
      });
      console.log('\n' + '='.repeat(100));
      
      const suppliersWithoutZones = suppliers.filter(s => !s.deliveryZones || s.deliveryZones.length === 0).length;
      const suppliersWithZones = suppliers.length - suppliersWithoutZones;
      
      console.log(`\n📊 RÉSUMÉ:`);
      console.log(`   Total: ${suppliers.length}`);
      console.log(`   Avec zones de livraison: ${suppliersWithZones}`);
      console.log(`   Sans zones de livraison: ${suppliersWithoutZones}`);
      
      if (suppliersWithoutZones > 0) {
        console.log(`\n💡 Pour ajouter des zones de livraison: node scripts/add-delivery-zones-to-suppliers.js`);
      }
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Déconnexion de MongoDB');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

listAllSuppliers();
