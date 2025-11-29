// scripts/add-delivery-zones-to-suppliers.js
// Ajoute des zones de livraison variées en Belgique aux fournisseurs qui n'en ont pas

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Supplier from '../models/Supplier.js';

// Zones de livraison variées en Belgique (villes principales et codes postaux)
const belgianDeliveryZones = [
  // Bruxelles
  { city: 'Bruxelles', postalCode: '1000' },
  { city: 'Bruxelles', postalCode: '1020' },
  { city: 'Bruxelles', postalCode: '1030' },
  { city: 'Bruxelles', postalCode: '1040' },
  { city: 'Bruxelles', postalCode: '1050' },
  { city: 'Bruxelles', postalCode: '1060' },
  { city: 'Bruxelles', postalCode: '1070' },
  { city: 'Bruxelles', postalCode: '1080' },
  { city: 'Bruxelles', postalCode: '1090' },
  { city: 'Bruxelles', postalCode: '1120' },
  { city: 'Bruxelles', postalCode: '1130' },
  { city: 'Bruxelles', postalCode: '1140' },
  { city: 'Bruxelles', postalCode: '1150' },
  { city: 'Bruxelles', postalCode: '1160' },
  { city: 'Bruxelles', postalCode: '1170' },
  { city: 'Bruxelles', postalCode: '1180' },
  { city: 'Bruxelles', postalCode: '1190' },
  { city: 'Bruxelles', postalCode: '1200' },
  
  // Anvers
  { city: 'Anvers', postalCode: '2000' },
  { city: 'Anvers', postalCode: '2018' },
  { city: 'Anvers', postalCode: '2020' },
  { city: 'Anvers', postalCode: '2030' },
  { city: 'Anvers', postalCode: '2040' },
  { city: 'Anvers', postalCode: '2050' },
  { city: 'Anvers', postalCode: '2060' },
  { city: 'Anvers', postalCode: '2100' },
  
  // Gand
  { city: 'Gand', postalCode: '9000' },
  { city: 'Gand', postalCode: '9030' },
  { city: 'Gand', postalCode: '9040' },
  { city: 'Gand', postalCode: '9050' },
  
  // Charleroi
  { city: 'Charleroi', postalCode: '6000' },
  { city: 'Charleroi', postalCode: '6030' },
  { city: 'Charleroi', postalCode: '6040' },
  { city: 'Charleroi', postalCode: '6060' },
  
  // Liège
  { city: 'Liège', postalCode: '4000' },
  { city: 'Liège', postalCode: '4020' },
  { city: 'Liège', postalCode: '4030' },
  { city: 'Liège', postalCode: '4040' },
  
  // Bruges
  { city: 'Bruges', postalCode: '8000' },
  { city: 'Bruges', postalCode: '8200' },
  { city: 'Bruges', postalCode: '8300' },
  
  // Namur
  { city: 'Namur', postalCode: '5000' },
  { city: 'Namur', postalCode: '5100' },
  { city: 'Namur', postalCode: '5150' },
  
  // Louvain
  { city: 'Louvain', postalCode: '3000' },
  { city: 'Louvain', postalCode: '3010' },
  { city: 'Louvain', postalCode: '3020' },
  
  // Mons
  { city: 'Mons', postalCode: '7000' },
  { city: 'Mons', postalCode: '7011' },
  { city: 'Mons', postalCode: '7012' },
  
  // Malines
  { city: 'Malines', postalCode: '2800' },
  { city: 'Malines', postalCode: '2810' },
  
  // Hasselt
  { city: 'Hasselt', postalCode: '3500' },
  { city: 'Hasselt', postalCode: '3510' },
  
  // Ostende
  { city: 'Ostende', postalCode: '8400' },
  { city: 'Ostende', postalCode: '8401' },
  
  // Tournai
  { city: 'Tournai', postalCode: '7500' },
  { city: 'Tournai', postalCode: '7520' },
  
  // Alost
  { city: 'Alost', postalCode: '9300' },
  { city: 'Alost', postalCode: '9310' },
  
  // Courtrai
  { city: 'Courtrai', postalCode: '8500' },
  { city: 'Courtrai', postalCode: '8501' },
  
  // Genk
  { city: 'Genk', postalCode: '3600' },
  { city: 'Genk', postalCode: '3601' },
  
  // Seraing
  { city: 'Seraing', postalCode: '4100' },
  { city: 'Seraing', postalCode: '4101' },
  
  // Roeselare
  { city: 'Roeselare', postalCode: '8800' },
  { city: 'Roeselare', postalCode: '8801' },
  
  // Verviers
  { city: 'Verviers', postalCode: '4800' },
  { city: 'Verviers', postalCode: '4801' },
  
  // Mouscron
  { city: 'Mouscron', postalCode: '7700' },
  { city: 'Mouscron', postalCode: '7701' },
  
  // Wavre
  { city: 'Wavre', postalCode: '1300' },
  { city: 'Wavre', postalCode: '1301' },
  
  // Arlon
  { city: 'Arlon', postalCode: '6700' },
  { city: 'Arlon', postalCode: '6701' },
  
  // Ixelles
  { city: 'Ixelles', postalCode: '1050' },
  
  // Schaerbeek
  { city: 'Schaerbeek', postalCode: '1030' },
  
  // Anderlecht
  { city: 'Anderlecht', postalCode: '1070' },
  
  // Uccle
  { city: 'Uccle', postalCode: '1180' },
  
  // Etterbeek
  { city: 'Etterbeek', postalCode: '1040' },
  
  // Saint-Gilles
  { city: 'Saint-Gilles', postalCode: '1060' },
  
  // Forest
  { city: 'Forest', postalCode: '1190' },
  
  // Molenbeek-Saint-Jean
  { city: 'Molenbeek-Saint-Jean', postalCode: '1080' },
  
  // Jette
  { city: 'Jette', postalCode: '1090' },
  
  // Evere
  { city: 'Evere', postalCode: '1140' },
  
  // Woluwe-Saint-Lambert
  { city: 'Woluwe-Saint-Lambert', postalCode: '1200' },
  
  // Woluwe-Saint-Pierre
  { city: 'Woluwe-Saint-Pierre', postalCode: '1150' },
  
  // Berchem-Sainte-Agathe
  { city: 'Berchem-Sainte-Agathe', postalCode: '1082' },
  
  // Ganshoren
  { city: 'Ganshoren', postalCode: '1083' },
  
  // Koekelberg
  { city: 'Koekelberg', postalCode: '1081' },
  
  // Watermael-Boitsfort
  { city: 'Watermael-Boitsfort', postalCode: '1170' },
  
  // Auderghem
  { city: 'Auderghem', postalCode: '1160' }
];

// Fonction pour obtenir des zones de livraison variées pour un fournisseur
function getDeliveryZonesForSupplier(supplierIndex, totalSuppliers) {
  // Distribuer les zones de manière variée selon l'index du fournisseur
  const zonesPerSupplier = Math.ceil(belgianDeliveryZones.length / Math.max(totalSuppliers, 1));
  const startIndex = (supplierIndex * zonesPerSupplier) % belgianDeliveryZones.length;
  const endIndex = Math.min(startIndex + zonesPerSupplier, belgianDeliveryZones.length);
  
  // Prendre une sélection variée de zones
  const selectedZones = [];
  
  // Toujours inclure Bruxelles (zone principale)
  selectedZones.push({ city: 'Bruxelles', postalCode: '1000' });
  
  // Ajouter d'autres zones variées
  for (let i = startIndex; i < endIndex && selectedZones.length < 15; i++) {
    const zone = belgianDeliveryZones[i];
    // Éviter les doublons
    if (!selectedZones.find(z => z.city === zone.city && z.postalCode === zone.postalCode)) {
      selectedZones.push(zone);
    }
  }
  
  // Si on n'a pas assez de zones, ajouter des zones supplémentaires de manière variée
  while (selectedZones.length < 10) {
    const randomZone = belgianDeliveryZones[Math.floor(Math.random() * belgianDeliveryZones.length)];
    if (!selectedZones.find(z => z.city === randomZone.city && z.postalCode === randomZone.postalCode)) {
      selectedZones.push(randomZone);
    }
  }
  
  return selectedZones.slice(0, 15); // Limiter à 15 zones par fournisseur
}

// Fonction principale
async function addDeliveryZonesToSuppliers() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    // Récupérer tous les fournisseurs (avec ou sans groupe)
    const suppliers = await Supplier.find({}).sort({ createdAt: -1 });
    console.log(`📊 ${suppliers.length} fournisseur(s) trouvé(s)\n`);
    
    // Afficher quelques statistiques
    const suppliersWithGroup = suppliers.filter(s => s.groupId).length;
    const suppliersWithoutGroup = suppliers.length - suppliersWithGroup;
    console.log(`   - Avec groupe: ${suppliersWithGroup}`);
    console.log(`   - Sans groupe: ${suppliersWithoutGroup}\n`);
    
    if (suppliers.length === 0) {
      console.log('⚠️  Aucun fournisseur trouvé');
      await mongoose.connection.close();
      return;
    }
    
    let suppliersWithoutZones = 0;
    let suppliersUpdated = 0;
    let suppliersWithZones = 0;
    
    for (let i = 0; i < suppliers.length; i++) {
      const supplier = suppliers[i];
      
      console.log(`\n📦 Fournisseur: ${supplier.name}`);
      
      // Vérifier si le fournisseur a déjà des zones de livraison
      if (supplier.deliveryZones && supplier.deliveryZones.length > 0) {
        console.log(`   ✅ Déjà ${supplier.deliveryZones.length} zone(s) de livraison`);
        suppliersWithZones++;
        continue;
      }
      
      suppliersWithoutZones++;
      console.log(`   ⚠️  Aucune zone de livraison`);
      
      // Ajouter des zones de livraison variées
      const deliveryZones = getDeliveryZonesForSupplier(i, suppliers.length);
      supplier.deliveryZones = deliveryZones;
      
      await supplier.save();
      suppliersUpdated++;
      
      console.log(`   ✅ ${deliveryZones.length} zone(s) de livraison ajoutée(s)`);
      console.log(`   📍 Exemples: ${deliveryZones.slice(0, 3).map(z => `${z.city} (${z.postalCode})`).join(', ')}${deliveryZones.length > 3 ? '...' : ''}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(80));
    console.log(`   Total fournisseurs: ${suppliers.length}`);
    console.log(`   Fournisseurs avec zones: ${suppliersWithZones}`);
    console.log(`   Fournisseurs sans zones: ${suppliersWithoutZones}`);
    console.log(`   Fournisseurs mis à jour: ${suppliersUpdated}`);
    console.log('='.repeat(80) + '\n');
    
    if (suppliersUpdated > 0) {
      console.log('✅ Zones de livraison ajoutées avec succès !\n');
    } else {
      console.log('ℹ️  Tous les fournisseurs ont déjà des zones de livraison.\n');
    }
    
    await mongoose.connection.close();
    console.log('✅ Déconnexion de MongoDB');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Exécuter le script
addDeliveryZonesToSuppliers();

