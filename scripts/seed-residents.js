// scripts/seed-residents.js
// Génère des résidents fictifs pour chaque site et les enregistre dans MongoDB

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Resident from '../models/Resident.js';
import Site from '../models/Site.js';
import Group from '../models/Group.js';

// Listes pour générer des noms réalistes
const prenomsFemmes = ['Marie', 'Anne', 'Sophie', 'Claire', 'Élise', 'Louise', 'Jeanne', 'Marguerite', 'Hélène', 'Françoise', 'Catherine', 'Monique', 'Isabelle', 'Nicole', 'Martine', 'Sylvie', 'Christine', 'Brigitte', 'Paulette', 'Simone'];
const prenomsHommes = ['Jean', 'Pierre', 'Jacques', 'Michel', 'André', 'Paul', 'Robert', 'Louis', 'Henri', 'François', 'Georges', 'René', 'Marcel', 'Albert', 'Claude', 'Bernard', 'Émile', 'Roger', 'Maurice', 'Lucien'];
const noms = ['Dubois', 'Martin', 'Bernard', 'Thomas', 'Robert', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez', 'Legrand', 'Garnier'];

// Profils nutritionnels
const allergies = [
  { allergen: 'Gluten', severity: 'sévère' },
  { allergen: 'Lait', severity: 'modérée' },
  { allergen: 'Œufs', severity: 'modérée' },
  { allergen: 'Poissons', severity: 'sévère' },
  { allergen: 'Crustacés', severity: 'sévère' },
  { allergen: 'Arachides', severity: 'critique' },
  { allergen: 'Fruits à coque', severity: 'sévère' },
  { allergen: 'Soja', severity: 'modérée' }
];

const intolerances = [
  { substance: 'Lactose', severity: 'modérée' },
  { substance: 'Fructose', severity: 'légère' },
  { substance: 'Gluten', severity: 'modérée' }
];

const restrictions = [
  { type: 'médicale', name: 'Sans sel', reason: 'Hypertension' },
  { type: 'médicale', name: 'Sans sucre', reason: 'Diabète' },
  { type: 'médicale', name: 'Pauvre en protéines', reason: 'Insuffisance rénale' },
  { type: 'éthique', name: 'Végétarien', reason: 'Choix personnel' },
  { type: 'médicale', name: 'Sans matières grasses', reason: 'Cholestérol' }
];

const textures = ['normal', 'haché', 'mixé', 'mouliné'];
const swallowing = ['normal', 'liquide épaissi', 'eau gélifiée'];

// Fonction pour générer un âge réaliste (65-100 ans)
function generateAge() {
  return Math.floor(Math.random() * 36) + 65; // 65 à 100 ans
}

// Fonction pour générer une date de naissance
function generateBirthDate(age) {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - age;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(birthYear, month, day);
}

// Fonction pour sélectionner aléatoirement des éléments
function randomSelect(array, probability = 0.3) {
  if (Math.random() < probability) {
    return array[Math.floor(Math.random() * array.length)];
  }
  return null;
}

// Fonction pour générer un profil nutritionnel
function generateNutritionalProfile() {
  const profile = {
    allergies: [],
    intolerances: [],
    dietaryRestrictions: [],
    texture: textures[Math.floor(Math.random() * textures.length)],
    swallowing: swallowing[Math.floor(Math.random() * swallowing.length)]
  };

  // 20% ont une allergie
  if (Math.random() < 0.2) {
    profile.allergies.push(randomSelect(allergies, 1));
  }

  // 15% ont une intolérance
  if (Math.random() < 0.15) {
    profile.intolerances.push(randomSelect(intolerances, 1));
  }

  // 30% ont une restriction alimentaire
  if (Math.random() < 0.3) {
    profile.dietaryRestrictions.push(randomSelect(restrictions, 1));
  }

  return profile;
}

// Fonction pour générer un résident
function generateResident(siteId, groupId, roomNumber, gender) {
  const isFemale = gender === 'F';
  const prenom = isFemale 
    ? prenomsFemmes[Math.floor(Math.random() * prenomsFemmes.length)]
    : prenomsHommes[Math.floor(Math.random() * prenomsHommes.length)];
  
  const nom = noms[Math.floor(Math.random() * noms.length)];
  const age = generateAge();
  const dateOfBirth = generateBirthDate(age);

  return {
    firstName: prenom,
    lastName: nom,
    dateOfBirth: dateOfBirth,
    gender: isFemale ? 'femme' : 'homme',
    roomNumber: roomNumber.toString(),
    bedNumber: Math.random() < 0.3 ? (Math.floor(Math.random() * 2) + 1).toString() : '1',
    phone: `+32 4${Math.floor(Math.random() * 90000000 + 10000000)}`,
    address: {
      street: `Rue de ${noms[Math.floor(Math.random() * noms.length)]} ${Math.floor(Math.random() * 200) + 1}`,
      city: 'Bruxelles',
      postalCode: `${1000 + Math.floor(Math.random() * 200)}`,
      country: 'Belgique'
    },
    emergencyContact: {
      name: `${prenomsFemmes[Math.floor(Math.random() * prenomsFemmes.length)]} ${noms[Math.floor(Math.random() * noms.length)]}`,
      relationship: Math.random() < 0.5 ? 'Fille' : 'Fils',
      phone: `+32 4${Math.floor(Math.random() * 90000000 + 10000000)}`
    },
    nutritionalProfile: generateNutritionalProfile(),
    status: 'actif',
    siteId: siteId,
    groupId: groupId
  };
}

async function seedResidents() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver le groupe Vulpia
    const group = await Group.findOne({ name: 'Vulpia Group' });
    if (!group) {
      console.log('❌ Groupe Vulpia non trouvé !');
      process.exit(1);
    }

    // Récupérer tous les sites
    const sites = await Site.find({ groupId: group._id, isActive: true }).sort({ siteName: 1 });
    console.log(`✅ ${sites.length} sites trouvés\n`);

    console.log('👥 Génération et enregistrement des résidents...\n');
    console.log('='.repeat(100));

    let totalCreated = 0;
    let totalSkipped = 0;

    for (const site of sites) {
      // Générer entre 50 et 80 résidents par site
      const numberOfResidents = Math.floor(Math.random() * 31) + 50; // 50 à 80
      
      // Vérifier s'il y a déjà des résidents pour ce site
      const existingCount = await Resident.countDocuments({ siteId: site._id });
      
      if (existingCount > 0) {
        console.log(`⏭️  ${site.siteName.padEnd(40)} | ${existingCount} résidents déjà présents`);
        totalSkipped += existingCount;
        continue;
      }

      const residents = [];
      
      for (let i = 1; i <= numberOfResidents; i++) {
        const gender = Math.random() < 0.6 ? 'F' : 'M'; // 60% femmes, 40% hommes (réaliste en EHPAD)
        const resident = generateResident(site._id, group._id, i, gender);
        residents.push(resident);
      }

      // Insérer tous les résidents du site en une seule fois
      await Resident.insertMany(residents);
      
      console.log(`✅ ${site.siteName.padEnd(40)} | ${numberOfResidents} résidents créés`);
      totalCreated += numberOfResidents;
    }

    console.log('='.repeat(100));
    console.log('\n📊 RÉSUMÉ :');
    console.log(`   ✅ Résidents créés : ${totalCreated}`);
    console.log(`   ⏭️  Résidents existants : ${totalSkipped}`);
    console.log(`   📍 Sites traités : ${sites.length}`);
    console.log(`   📊 Moyenne par site : ${Math.round(totalCreated / sites.length)}`);

    // Statistiques des profils nutritionnels
    console.log('\n📊 STATISTIQUES DES PROFILS NUTRITIONNELS :');
    console.log('━'.repeat(100));
    
    const withAllergies = await Resident.countDocuments({ 'nutritionalProfile.allergies.0': { $exists: true } });
    const withIntolerances = await Resident.countDocuments({ 'nutritionalProfile.intolerances.0': { $exists: true } });
    const withRestrictions = await Resident.countDocuments({ 'nutritionalProfile.dietaryRestrictions.0': { $exists: true } });
    
    console.log(`   🔴 Avec allergies : ${withAllergies} (${((withAllergies/totalCreated)*100).toFixed(1)}%)`);
    console.log(`   🟡 Avec intolérances : ${withIntolerances} (${((withIntolerances/totalCreated)*100).toFixed(1)}%)`);
    console.log(`   🟢 Avec restrictions : ${withRestrictions} (${((withRestrictions/totalCreated)*100).toFixed(1)}%)`);

    await mongoose.disconnect();
    console.log('\n✅ Génération terminée !');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedResidents();

