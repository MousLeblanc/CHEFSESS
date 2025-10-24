import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import Group from '../models/Group.js';
import Site from '../models/Site.js';
import Resident from '../models/Resident.js';
import User from '../models/User.js';

dotenv.config();

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';

// 🔐 Fonction pour s'authentifier
async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/api/users/login`, {
      email,
      password
    });
    
    return response.data.token;
  } catch (error) {
    console.error('❌ Erreur de connexion:', error.response?.data || error.message);
    throw error;
  }
}

// 📊 Fonction pour analyser les résidents
function analyzeResidents(residents) {
  const analysis = {
    total: residents.length,
    allergies: {},
    medicalConditions: {},
    dietaryRestrictions: {},
    textures: {}
  };
  
  residents.forEach(resident => {
    // Allergies
    resident.nutritionalProfile.allergies?.forEach(allergy => {
      const key = allergy.allergen;
      analysis.allergies[key] = (analysis.allergies[key] || 0) + 1;
    });
    
    // Conditions médicales
    resident.nutritionalProfile.medicalConditions?.forEach(condition => {
      const key = condition.condition;
      analysis.medicalConditions[key] = (analysis.medicalConditions[key] || 0) + 1;
    });
    
    // Restrictions
    resident.nutritionalProfile.dietaryRestrictions?.forEach(restriction => {
      const key = restriction.restriction;
      analysis.dietaryRestrictions[key] = (analysis.dietaryRestrictions[key] || 0) + 1;
    });
    
    // Textures
    const texture = resident.nutritionalProfile.texturePreferences?.consistency || 'normale';
    analysis.textures[texture] = (analysis.textures[texture] || 0) + 1;
  });
  
  return analysis;
}

// 🎯 Fonction pour générer un menu
async function generateMenu(token, config) {
  try {
    const response = await axios.post(
      `${API_URL}/api/intelligent-menu/generate`,
      config,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('❌ Erreur génération menu:', error.response?.data || error.message);
    throw error;
  }
}

// 🚀 SCRIPT PRINCIPAL
async function testVulpiaMenuGeneration() {
  try {
    console.log('🎯 TEST GÉNÉRATION MENU VULPIA GROUP\n');
    console.log('='.repeat(70));
    
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
    
    console.log(`🏢 Groupe: ${group.name}`);
    console.log(`📍 Code: ${group.code}\n`);

    // Récupérer les sites ACTIFS
    const activeSites = await Site.find({ 
      groupId: group._id,
      isActive: true 
    }).sort({ siteName: 1 });
    
    console.log(`📍 Sites actifs: ${activeSites.length}`);
    activeSites.forEach(site => {
      console.log(`   • ${site.siteName} (${site.address.city})`);
    });
    console.log();

    // Récupérer tous les résidents des sites actifs
    const activeSiteIds = activeSites.map(s => s._id);
    const residents = await Resident.find({ 
      siteId: { $in: activeSiteIds },
      status: 'actif'
    });
    
    console.log(`👥 Résidents actifs: ${residents.length}\n`);

    // Analyser les profils
    console.log('📊 ANALYSE DES PROFILS NUTRITIONNELS\n');
    const analysis = analyzeResidents(residents);
    
    console.log(`📋 Allergies majeures:`);
    Object.entries(analysis.allergies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([allergen, count]) => {
        console.log(`   • ${allergen}: ${count} résidents (${Math.round(count/analysis.total*100)}%)`);
      });
    
    console.log(`\n🏥 Conditions médicales:`);
    Object.entries(analysis.medicalConditions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([condition, count]) => {
        console.log(`   • ${condition}: ${count} résidents (${Math.round(count/analysis.total*100)}%)`);
      });
    
    console.log(`\n🥗 Restrictions alimentaires:`);
    Object.entries(analysis.dietaryRestrictions)
      .sort((a, b) => b[1] - a[1])
      .forEach(([restriction, count]) => {
        console.log(`   • ${restriction}: ${count} résidents (${Math.round(count/analysis.total*100)}%)`);
      });
    
    console.log(`\n🍽️  Textures requises:`);
    Object.entries(analysis.textures)
      .sort((a, b) => b[1] - a[1])
      .forEach(([texture, count]) => {
        console.log(`   • ${texture}: ${count} résidents (${Math.round(count/analysis.total*100)}%)`);
      });

    console.log('\n' + '='.repeat(70));
    console.log('🔐 AUTHENTIFICATION\n');

    // Se connecter en tant qu'admin groupe
    const token = await login('admin@vulpiagroup.com', 'VulpiaAdmin2024!');
    console.log('✅ Connecté en tant qu\'admin groupe');
    console.log(`🔑 Token: ${token.substring(0, 20)}...\n`);

    // Préparer la configuration pour la génération de menu
    console.log('='.repeat(70));
    console.log('🤖 GÉNÉRATION DU MENU PAR IA\n');

    // Extraire les allergènes les plus fréquents (top 5)
    const topAllergens = Object.entries(analysis.allergies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([allergen]) => allergen.toLowerCase());

    // Extraire les restrictions les plus fréquentes
    const topRestrictions = Object.entries(analysis.dietaryRestrictions)
      .map(([restriction]) => restriction.toLowerCase().replace(/\s+/g, '_'));

    // Créer les groupes d'âge pour l'API
    const ageGroups = activeSites.map(site => {
      const siteResidents = residents.filter(r => r.siteId.toString() === site._id.toString());
      return {
        ageRange: "65-95", // EHPAD
        count: siteResidents.length,
        siteName: site.siteName
      };
    });

    const menuConfig = {
      establishmentType: "ehpad",
      ageGroups: ageGroups,
      numDishes: 3, // Entrée, plat, dessert
      menuStructure: "entree_plat_dessert",
      allergens: topAllergens,
      dietaryRestrictions: topRestrictions,
      medicalConditions: ["diabete", "hypertension", "dysphagie"],
      texture: "normale",
      useStockOnly: false, // Pour le test, on n'utilise pas que le stock
      theme: "Menu équilibré pour seniors"
    };

    console.log('📝 Configuration du menu:');
    console.log(`   • Type: ${menuConfig.establishmentType}`);
    console.log(`   • Total convives: ${residents.length}`);
    console.log(`   • Nombre de plats: ${menuConfig.numDishes}`);
    console.log(`   • Structure: ${menuConfig.menuStructure}`);
    console.log(`   • Allergènes exclus: ${topAllergens.join(', ')}`);
    console.log(`   • Restrictions: ${topRestrictions.join(', ')}`);
    console.log(`   • Conditions médicales: ${menuConfig.medicalConditions.join(', ')}`);
    console.log(`   • Thème: ${menuConfig.theme}\n`);

    console.log('⏳ Génération en cours (peut prendre 5-10 secondes)...\n');

    // Générer le menu
    const startTime = Date.now();
    const result = await generateMenu(token, menuConfig);
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('='.repeat(70));
    console.log('✅ MENU GÉNÉRÉ AVEC SUCCÈS\n');
    console.log(`⏱️  Temps de génération: ${duration} secondes\n`);

    // Afficher le menu
    if (result.menu) {
      console.log(`📋 Titre: ${result.menu.title || 'Menu équilibré'}`);
      console.log(`📝 Description: ${result.menu.description || 'N/A'}\n`);

      if (result.menu.mainMenu && result.menu.mainMenu.dishes) {
        console.log('🍽️  PLATS DU MENU:\n');
        result.menu.mainMenu.dishes.forEach((dish, index) => {
          console.log(`${index + 1}. ${dish.name || 'Plat sans nom'}`);
          console.log(`   • Catégorie: ${dish.category || 'N/A'}`);
          
          if (dish.nutritionalProfile) {
            console.log(`   • Nutrition: ${dish.nutritionalProfile.kcal || 0} kcal, ` +
                       `${dish.nutritionalProfile.protein || 0}g protéines, ` +
                       `${dish.nutritionalProfile.carbs || 0}g glucides, ` +
                       `${dish.nutritionalProfile.lipids || 0}g lipides`);
          }
          
          if (dish.ingredients && dish.ingredients.length > 0) {
            console.log(`   • Ingrédients: ${dish.ingredients.length} items`);
          }
          
          console.log();
        });
      }

      // Afficher les adaptations par âge si disponibles
      if (result.menu.variants && result.menu.variants.length > 0) {
        console.log('👥 ADAPTATIONS PAR SITE:\n');
        result.menu.variants.forEach(variant => {
          console.log(`   • ${variant.ageRange}: ${variant.count} résidents`);
        });
        console.log();
      }

      // Afficher la liste de courses si disponible
      if (result.menu.shoppingList && result.menu.shoppingList.length > 0) {
        console.log('🛒 LISTE DE COURSES (TOP 10):\n');
        result.menu.shoppingList
          .slice(0, 10)
          .forEach(item => {
            console.log(`   • ${item.name}: ${item.quantity} ${item.unit}`);
          });
        console.log();
      }
    }

    console.log('='.repeat(70));
    console.log('📊 RÉSUMÉ DU TEST\n');
    console.log(`✅ Sites actifs: ${activeSites.length}`);
    console.log(`✅ Résidents analysés: ${residents.length}`);
    console.log(`✅ Profils nutritionnels pris en compte: ${analysis.total}`);
    console.log(`✅ Menu généré en ${duration}s`);
    console.log(`✅ Plats proposés: ${result.menu?.mainMenu?.dishes?.length || 0}`);
    
    console.log('\n💡 PROCHAINES ÉTAPES:');
    console.log('   1. Tester avec différents thèmes');
    console.log('   2. Activer plus de sites pour tester scalabilité');
    console.log('   3. Intégrer la gestion du stock');
    console.log('   4. Tester le dispatch vers tous les sites');

  } catch (error) {
    console.error('\n❌ ERREUR LORS DU TEST:', error.message);
    if (error.response) {
      console.error('Détails:', JSON.stringify(error.response.data, null, 2));
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connexion MongoDB fermée');
  }
}

// Exécuter le test
testVulpiaMenuGeneration();

