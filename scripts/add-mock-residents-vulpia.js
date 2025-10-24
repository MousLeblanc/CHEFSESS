import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Group from '../models/Group.js';
import Site from '../models/Site.js';
import Resident from '../models/Resident.js';
import User from '../models/User.js';

dotenv.config();

// 👥 DONNÉES RÉALISTES POUR GÉNÉRER DES RÉSIDENTS

// Prénoms belges courants pour personnes âgées
const firstNamesMale = [
  'Albert', 'André', 'Antoine', 'Bernard', 'Charles', 'Claude', 'Daniel', 'Édouard',
  'François', 'Georges', 'Henri', 'Jacques', 'Jean', 'Joseph', 'Louis', 'Marcel',
  'Maurice', 'Michel', 'Paul', 'Pierre', 'Raymond', 'René', 'Robert', 'Roger',
  'Frans', 'Jan', 'Jozef', 'Karel', 'Luc', 'Marc', 'Patrick', 'Paul', 'Piet', 'Willy'
];

const firstNamesFemale = [
  'Alice', 'Anne', 'Bernadette', 'Catherine', 'Claire', 'Colette', 'Denise', 'Élisabeth',
  'Émilie', 'Françoise', 'Georgette', 'Hélène', 'Jacqueline', 'Jeanne', 'Julienne', 'Louise',
  'Madeleine', 'Marguerite', 'Marie', 'Martine', 'Monique', 'Nicole', 'Odette', 'Simone',
  'Anna', 'Els', 'Frieda', 'Godelieve', 'Hilde', 'Ingrid', 'Katrien', 'Maria', 'Paula', 'Rita'
];

// Noms de famille belges courants
const lastNames = [
  'Dubois', 'Lambert', 'Martin', 'Petit', 'Thomas', 'Robert', 'Richard', 'Durand',
  'Lefebvre', 'Moreau', 'Simon', 'Laurent', 'Michel', 'Garcia', 'David', 'Bertrand',
  'Van den Berg', 'De Vries', 'Janssens', 'Maes', 'Jacobs', 'Mertens', 'Willems', 'Claes',
  'Goossens', 'Wouters', 'De Smet', 'Peeters', 'Hermans', 'Pauwels', 'Desmet', 'Vermeulen'
];

// Allergies courantes chez personnes âgées
const commonAllergies = [
  { allergen: 'Gluten', severity: 'modérée', symptoms: ['Ballonnements', 'Diarrhée', 'Fatigue'] },
  { allergen: 'Lactose', severity: 'légère', symptoms: ['Ballonnements', 'Inconfort digestif'] },
  { allergen: 'Arachides', severity: 'sévère', symptoms: ['Urticaire', 'Difficultés respiratoires'] },
  { allergen: 'Fruits à coque', severity: 'modérée', symptoms: ['Démangeaisons', 'Gonflement'] },
  { allergen: 'Œufs', severity: 'légère', symptoms: ['Éruptions cutanées'] },
  { allergen: 'Poisson', severity: 'modérée', symptoms: ['Nausées', 'Vomissements'] },
  { allergen: 'Crustacés', severity: 'sévère', symptoms: ['Choc anaphylactique possible'] },
  { allergen: 'Soja', severity: 'légère', symptoms: ['Troubles digestifs'] },
  { allergen: 'Céleri', severity: 'légère', symptoms: ['Irritations buccales'] },
  { allergen: 'Moutarde', severity: 'légère', symptoms: ['Réactions cutanées'] }
];

// Restrictions alimentaires courantes
const dietaryRestrictions = [
  { type: 'médicale', restriction: 'Sans sel', details: 'Régime hyposodé strict' },
  { type: 'médicale', restriction: 'Sans sucre', details: 'Diabète de type 2' },
  { type: 'médicale', restriction: 'Faible en graisses', details: 'Hypercholestérolémie' },
  { type: 'religieuse', restriction: 'Halal', details: 'Pratique musulmane' },
  { type: 'religieuse', restriction: 'Casher', details: 'Pratique juive' },
  { type: 'éthique', restriction: 'Végétarien', details: 'Choix personnel' },
  { type: 'médicale', restriction: 'Sans gluten', details: 'Maladie cœliaque' },
  { type: 'médicale', restriction: 'Sans lactose', details: 'Intolérance au lactose' }
];

// Conditions médicales fréquentes en EHPAD
const medicalConditions = [
  { 
    condition: 'Diabète type 2', 
    severity: 'modérée', 
    impactOnNutrition: 'Contrôle strict des glucides',
    dietaryRecommendations: ['Limiter sucres rapides', 'Privilégier fibres', 'Portions contrôlées']
  },
  { 
    condition: 'Hypertension artérielle', 
    severity: 'modérée', 
    impactOnNutrition: 'Réduction du sodium',
    dietaryRecommendations: ['Régime pauvre en sel', 'Augmenter potassium', 'Éviter charcuterie']
  },
  { 
    condition: 'Dysphagie', 
    severity: 'sévère', 
    impactOnNutrition: 'Textures modifiées nécessaires',
    dietaryRecommendations: ['Texture mixée ou hachée', 'Épaissir les liquides', 'Éviter morceaux']
  },
  { 
    condition: 'Maladie d\'Alzheimer', 
    severity: 'modérée', 
    impactOnNutrition: 'Supervision repas nécessaire',
    dietaryRecommendations: ['Alimentation assistée', 'Environnement calme', 'Plats simples']
  },
  { 
    condition: 'Insuffisance rénale', 
    severity: 'modérée', 
    impactOnNutrition: 'Contrôle protéines et potassium',
    dietaryRecommendations: ['Limiter protéines', 'Réduire potassium', 'Hydrater modérément']
  },
  { 
    condition: 'Dénutrition', 
    severity: 'modérée', 
    impactOnNutrition: 'Enrichissement calorique',
    dietaryRecommendations: ['Augmenter calories', 'Petits repas fréquents', 'Suppléments nutritionnels']
  },
  { 
    condition: 'Ostéoporose', 
    severity: 'légère', 
    impactOnNutrition: 'Apport calcium et vitamine D',
    dietaryRecommendations: ['Produits laitiers', 'Poissons gras', 'Supplémentation vitamine D']
  },
  { 
    condition: 'Reflux gastro-œsophagien', 
    severity: 'légère', 
    impactOnNutrition: 'Éviter aliments acides',
    dietaryRecommendations: ['Repas légers', 'Éviter épices', 'Position semi-assise après repas']
  }
];

// Textures de repas
const textureOptions = [
  { consistency: 'normale', difficulty: 'aucune', probability: 0.60 }, // 60%
  { consistency: 'hachée', difficulty: 'légère', probability: 0.20 },  // 20%
  { consistency: 'mixée', difficulty: 'modérée', probability: 0.15 },  // 15%
  { consistency: 'liquide', difficulty: 'sévère', probability: 0.05 }  // 5%
];

// 🎲 FONCTIONS UTILITAIRES

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomBoolean(probability = 0.5) {
  return Math.random() < probability;
}

function getRandomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generatePhoneNumber() {
  return `+32 ${randomInt(400, 499)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`;
}

function getTextureByProbability() {
  const rand = Math.random();
  let cumulative = 0;
  
  for (const texture of textureOptions) {
    cumulative += texture.probability;
    if (rand <= cumulative) {
      return {
        consistency: texture.consistency,
        difficulty: texture.difficulty,
        notes: texture.consistency !== 'normale' ? `Texture ${texture.consistency} prescrite` : ''
      };
    }
  }
  
  return { consistency: 'normale', difficulty: 'aucune', notes: '' };
}

// 🧑‍⚕️ GÉNÉRATION D'UN PROFIL NUTRITIONNEL RÉALISTE

function generateNutritionalProfile() {
  const profile = {
    allergies: [],
    intolerances: [],
    dietaryRestrictions: [],
    medicalConditions: [],
    nutritionalNeeds: {},
    texturePreferences: getTextureByProbability(),
    hydration: {
      dailyIntake: randomInt(1200, 2000),
      restrictions: [],
      preferences: ['Eau', 'Thé', 'Jus de fruits'],
      notes: ''
    },
    foodPreferences: {
      liked: [],
      disliked: [],
      cultural: [],
      religious: [],
      notes: ''
    }
  };

  // Allergies (30% de chance d'avoir 1-2 allergies)
  if (randomBoolean(0.30)) {
    const numAllergies = randomBoolean(0.7) ? 1 : 2;
    for (let i = 0; i < numAllergies; i++) {
      const allergy = randomChoice(commonAllergies);
      profile.allergies.push({
        allergen: allergy.allergen,
        severity: allergy.severity,
        symptoms: allergy.symptoms,
        notes: `Allergie diagnostiquée`
      });
    }
  }

  // Conditions médicales (70% de chance d'avoir 1-3 conditions)
  if (randomBoolean(0.70)) {
    const numConditions = randomBoolean(0.5) ? 1 : randomBoolean(0.7) ? 2 : 3;
    const selectedConditions = [];
    
    for (let i = 0; i < numConditions; i++) {
      let condition;
      do {
        condition = randomChoice(medicalConditions);
      } while (selectedConditions.some(c => c.condition === condition.condition));
      
      selectedConditions.push(condition);
      profile.medicalConditions.push({
        condition: condition.condition,
        severity: condition.severity,
        impactOnNutrition: condition.impactOnNutrition,
        dietaryRecommendations: condition.dietaryRecommendations,
        notes: `Diagnostic confirmé, suivi médical régulier`
      });
    }
  }

  // Restrictions alimentaires basées sur les conditions médicales
  if (profile.medicalConditions.some(c => c.condition.includes('Diabète'))) {
    profile.dietaryRestrictions.push({
      type: 'médicale',
      restriction: 'Sans sucre',
      details: 'Contrôle glycémique strict',
      startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Il y a 1 an
    });
  }

  if (profile.medicalConditions.some(c => c.condition.includes('Hypertension'))) {
    profile.dietaryRestrictions.push({
      type: 'médicale',
      restriction: 'Sans sel',
      details: 'Régime hyposodé < 2g/jour',
      startDate: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000) // Il y a 2 ans
    });
  }

  // Restrictions religieuses/éthiques (10% de chance)
  if (randomBoolean(0.10)) {
    const restriction = randomChoice(dietaryRestrictions.filter(d => 
      d.type === 'religieuse' || d.type === 'éthique'
    ));
    profile.dietaryRestrictions.push({
      type: restriction.type,
      restriction: restriction.restriction,
      details: restriction.details,
      startDate: new Date(Date.now() - 3650 * 24 * 60 * 60 * 1000) // Il y a 10 ans
    });
  }

  // Besoins nutritionnels (basés sur âge et conditions)
  const hasDenutrition = profile.medicalConditions.some(c => c.condition.includes('Dénutrition'));
  const hasDiabetes = profile.medicalConditions.some(c => c.condition.includes('Diabète'));
  
  profile.nutritionalNeeds = {
    calories: {
      daily: hasDenutrition ? randomInt(2000, 2400) : randomInt(1600, 2000),
      perMeal: hasDenutrition ? randomInt(650, 800) : randomInt(500, 650),
      notes: hasDenutrition ? 'Enrichissement calorique nécessaire' : ''
    },
    proteins: {
      daily: randomInt(50, 75),
      perMeal: randomInt(20, 30),
      notes: hasDenutrition ? 'Apport protéique renforcé' : ''
    },
    carbohydrates: {
      daily: hasDiabetes ? randomInt(150, 200) : randomInt(200, 280),
      perMeal: hasDiabetes ? randomInt(50, 65) : randomInt(65, 90),
      notes: hasDiabetes ? 'Privilégier glucides complexes' : ''
    },
    fats: {
      daily: randomInt(50, 70),
      perMeal: randomInt(15, 25),
      notes: 'Privilégier acides gras insaturés'
    },
    fiber: {
      daily: randomInt(20, 30),
      notes: 'Favoriser transit intestinal'
    },
    sodium: {
      daily: profile.dietaryRestrictions.some(r => r.restriction === 'Sans sel') ? 
        randomInt(1000, 1500) : randomInt(2000, 2500),
      restriction: profile.dietaryRestrictions.some(r => r.restriction === 'Sans sel') ? 
        'très réduit' : 'normal',
      notes: profile.dietaryRestrictions.some(r => r.restriction === 'Sans sel') ? 
        'Régime hyposodé strict' : ''
    },
    sugar: {
      daily: hasDiabetes ? randomInt(20, 40) : randomInt(50, 75),
      restriction: hasDiabetes ? 'très réduit' : 'normal',
      notes: hasDiabetes ? 'Contrôle glycémique strict' : ''
    }
  };

  // Hydratation (ajuster si dysphagie)
  if (profile.medicalConditions.some(c => c.condition.includes('Dysphagie'))) {
    profile.hydration.restrictions.push('Liquides épaissis');
    profile.hydration.notes = 'Eau gélifiée ou épaissie systématiquement';
  }

  // Préférences alimentaires
  profile.foodPreferences.liked = randomChoice([
    ['Purée de pommes de terre', 'Poulet rôti', 'Légumes vapeur'],
    ['Pâtes', 'Poisson grillé', 'Salade verte'],
    ['Riz', 'Viande en sauce', 'Carottes'],
    ['Soupe', 'Pain frais', 'Fromage']
  ]);

  profile.foodPreferences.disliked = randomChoice([
    ['Choux', 'Abats'],
    ['Poisson cru', 'Épices fortes'],
    ['Aliments acides', 'Plats trop salés'],
    []
  ]);

  return profile;
}

// 👤 GÉNÉRATION D'UN RÉSIDENT COMPLET

function generateResident(siteId, groupId, createdBy, siteName) {
  const gender = randomChoice(['homme', 'femme', 'homme', 'femme']); // 50/50
  const firstName = gender === 'homme' ? 
    randomChoice(firstNamesMale) : 
    randomChoice(firstNamesFemale);
  const lastName = randomChoice(lastNames);
  
  // Âge entre 65 et 95 ans (EHPAD)
  const age = randomInt(65, 95);
  const birthYear = new Date().getFullYear() - age;
  const dateOfBirth = getRandomDate(birthYear, birthYear);
  
  return {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    phone: generatePhoneNumber(),
    email: randomBoolean(0.3) ? 
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@exemple.be` : 
      undefined,
    address: {
      street: `${randomInt(1, 200)} Rue ${randomChoice(['de la Paix', 'du Commerce', 'Principale', 'Neuve'])}`,
      city: siteName,
      postalCode: `${randomInt(1000, 9999)}`,
      country: 'Belgique'
    },
    roomNumber: `${randomInt(1, 3)}${randomInt(0, 9)}${randomInt(1, 9)}`,
    bedNumber: randomChoice(['A', 'B', '']),
    medicalRecordNumber: `VUL-${Date.now()}-${randomInt(1000, 9999)}`,
    nutritionalProfile: generateNutritionalProfile(),
    emergencyContact: {
      name: `${randomChoice(firstNamesMale)} ${randomChoice(lastNames)}`,
      relationship: randomChoice(['Fils', 'Fille', 'Neveu', 'Nièce', 'Ami proche']),
      phone: generatePhoneNumber(),
      email: randomBoolean(0.5) ? `contact${randomInt(1, 999)}@exemple.be` : undefined
    },
    status: 'actif',
    siteId,
    groupId,
    createdBy,
    generalNotes: randomChoice([
      'Résident autonome, participe aux activités.',
      'Nécessite une aide pour les déplacements.',
      'Préfère les repas en compagnie d\'autres résidents.',
      'Aime la lecture et les promenades.',
      ''
    ])
  };
}

// 🚀 SCRIPT PRINCIPAL

async function addMockResidentsVulpia() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer le groupe Vulpia
    const group = await Group.findOne({ code: 'vulpia-group' });
    if (!group) {
      console.error('❌ Groupe Vulpia non trouvé');
      process.exit(1);
    }

    // Récupérer un utilisateur admin pour createdBy
    const adminUser = await User.findOne({ 
      email: 'admin@vulpiagroup.com' 
    });
    
    if (!adminUser) {
      console.error('❌ Admin Vulpia non trouvé');
      process.exit(1);
    }

    console.log(`🏢 Groupe: ${group.name}`);
    console.log(`👤 Admin: ${adminUser.email}\n`);

    // Récupérer tous les sites du groupe
    const sites = await Site.find({ 
      groupId: group._id 
    }).sort({ siteName: 1 });

    console.log(`📍 ${sites.length} sites trouvés\n`);
    console.log('🎲 Génération des résidents mockés...\n');

    let totalResidents = 0;
    let totalCreated = 0;
    const stats = {
      withAllergies: 0,
      withDiabetes: 0,
      withHypertension: 0,
      withDysphagia: 0,
      withRestrictions: 0,
      textureNormale: 0,
      textureHachee: 0,
      textureMixee: 0,
      textureLiquide: 0
    };

    for (const site of sites) {
      console.log(`\n📍 Site: ${site.siteName} (${site.isActive ? 'ACTIF' : 'INACTIF'})`);
      
      // Calculer le nombre de résidents à créer
      // Utiliser la capacité ou un nombre par défaut
      const capacity = site.settings?.capacity?.lunch || 80;
      // Générer entre 70% et 95% de la capacité
      const numResidents = Math.floor(capacity * (randomInt(70, 95) / 100));
      
      console.log(`   👥 Capacité: ${capacity} → Génération de ${numResidents} résidents`);
      
      const residentsToCreate = [];
      
      for (let i = 0; i < numResidents; i++) {
        const resident = generateResident(
          site._id, 
          group._id, 
          adminUser._id,
          site.address.city
        );
        residentsToCreate.push(resident);
        
        // Statistiques
        if (resident.nutritionalProfile.allergies.length > 0) stats.withAllergies++;
        if (resident.nutritionalProfile.medicalConditions.some(c => c.condition.includes('Diabète'))) stats.withDiabetes++;
        if (resident.nutritionalProfile.medicalConditions.some(c => c.condition.includes('Hypertension'))) stats.withHypertension++;
        if (resident.nutritionalProfile.medicalConditions.some(c => c.condition.includes('Dysphagie'))) stats.withDysphagia++;
        if (resident.nutritionalProfile.dietaryRestrictions.length > 0) stats.withRestrictions++;
        
        const texture = resident.nutritionalProfile.texturePreferences.consistency;
        if (texture === 'normale') stats.textureNormale++;
        else if (texture === 'hachée') stats.textureHachee++;
        else if (texture === 'mixée') stats.textureMixee++;
        else if (texture === 'liquide') stats.textureLiquide++;
      }
      
      // Insérer tous les résidents du site en une fois
      try {
        const created = await Resident.insertMany(residentsToCreate);
        totalCreated += created.length;
        console.log(`   ✅ ${created.length} résidents créés`);
      } catch (error) {
        console.error(`   ❌ Erreur pour ${site.siteName}:`, error.message);
      }
      
      totalResidents += numResidents;
    }

    // Résumé final
    console.log('\n' + '='.repeat(70));
    console.log('🎉 GÉNÉRATION TERMINÉE !');
    console.log('='.repeat(70));
    console.log(`\n📊 STATISTIQUES GLOBALES :`);
    console.log(`   • Total résidents générés : ${totalResidents}`);
    console.log(`   • Total créés en base : ${totalCreated}`);
    console.log(`   • Résidents avec allergies : ${stats.withAllergies} (${Math.round(stats.withAllergies/totalResidents*100)}%)`);
    console.log(`   • Résidents diabétiques : ${stats.withDiabetes} (${Math.round(stats.withDiabetes/totalResidents*100)}%)`);
    console.log(`   • Résidents hypertendus : ${stats.withHypertension} (${Math.round(stats.withHypertension/totalResidents*100)}%)`);
    console.log(`   • Résidents avec dysphagie : ${stats.withDysphagia} (${Math.round(stats.withDysphagia/totalResidents*100)}%)`);
    console.log(`   • Résidents avec restrictions : ${stats.withRestrictions} (${Math.round(stats.withRestrictions/totalResidents*100)}%)`);
    
    console.log(`\n🍽️ RÉPARTITION DES TEXTURES :`);
    console.log(`   • Texture normale : ${stats.textureNormale} (${Math.round(stats.textureNormale/totalResidents*100)}%)`);
    console.log(`   • Texture hachée : ${stats.textureHachee} (${Math.round(stats.textureHachee/totalResidents*100)}%)`);
    console.log(`   • Texture mixée : ${stats.textureMixee} (${Math.round(stats.textureMixee/totalResidents*100)}%)`);
    console.log(`   • Texture liquide : ${stats.textureLiquide} (${Math.round(stats.textureLiquide/totalResidents*100)}%)`);

    // Vérification finale
    const totalInDB = await Resident.countDocuments({ groupId: group._id });
    console.log(`\n✅ VÉRIFICATION BASE DE DONNÉES :`);
    console.log(`   • Total résidents en DB : ${totalInDB}`);
    console.log(`   • Résidents actifs : ${await Resident.countDocuments({ groupId: group._id, status: 'actif' })}`);

    console.log(`\n💡 PROCHAINES ÉTAPES :`);
    console.log(`   • Connectez-vous en tant qu'admin groupe`);
    console.log(`   • Testez la génération de menu IA`);
    console.log(`   • Le système agrégera automatiquement tous ces profils`);
    console.log(`   • Les restrictions seront prises en compte intelligemment`);

  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connexion MongoDB fermée');
  }
}

// Exécuter le script
addMockResidentsVulpia();

