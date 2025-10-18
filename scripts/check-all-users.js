import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAllUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer tous les utilisateurs
    const users = await User.find({}).select('name email role businessName establishmentType createdAt');
    
    console.log(`📊 TOTAL UTILISATEURS: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé dans la base de données');
      return;
    }

    // Grouper par rôle
    const usersByRole = {};
    users.forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });

    // Afficher par rôle
    Object.keys(usersByRole).forEach(role => {
      console.log(`\n👥 RÔLE: ${role.toUpperCase()} (${usersByRole[role].length} utilisateur(s))`);
      console.log('─'.repeat(50));
      
      usersByRole[role].forEach((user, index) => {
        console.log(`${index + 1}. ${user.name || 'N/A'}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🏢 Entreprise: ${user.businessName || 'N/A'}`);
        console.log(`   🏛️ Type établissement: ${user.establishmentType || 'N/A'}`);
        console.log(`   📅 Créé: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}`);
        console.log('');
      });
    });

    // Vérifier s'il y a des conflits de rôles
    console.log('\n🔍 VÉRIFICATION DES CONFLITS:');
    console.log('─'.repeat(50));
    
    const potentialConflicts = users.filter(user => {
      // Vérifier si un utilisateur a un rôle de fournisseur mais un establishmentType
      if (user.role === 'fournisseur' && user.establishmentType) {
        return true;
      }
      // Vérifier si un utilisateur a un rôle de collectivite mais pas d'establishmentType
      if (user.role === 'collectivite' && !user.establishmentType) {
        return true;
      }
      return false;
    });

    if (potentialConflicts.length > 0) {
      console.log('⚠️ CONFLITS DÉTECTÉS:');
      potentialConflicts.forEach(user => {
        console.log(`   • ${user.email} (${user.role})`);
        console.log(`     - establishmentType: ${user.establishmentType || 'N/A'}`);
        console.log(`     - businessName: ${user.businessName || 'N/A'}`);
      });
    } else {
      console.log('✅ Aucun conflit détecté');
    }

    // Vérifier les comptes de test
    console.log('\n🧪 COMPTES DE TEST:');
    console.log('─'.repeat(50));
    
    const testEmails = ['resto@gmail.com', 'tanneurs@gmail.com', 'ecole@gmail.com', 'test@gmail.com'];
    testEmails.forEach(email => {
      const user = users.find(u => u.email === email);
      if (user) {
        console.log(`✅ ${email} - ${user.role} (${user.businessName || user.name})`);
      } else {
        console.log(`❌ ${email} - Non trouvé`);
      }
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connexion fermée');
  }
}

checkAllUsers();

