import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resident from '../models/Resident.js';
import Site from '../models/Site.js';

dotenv.config();

async function fixResidentsGroupId() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/chef-ses');
        console.log('✅ Connecté à MongoDB');

        // Récupérer tous les résidents sans groupId ou avec un groupId invalide
        const residentsWithoutGroup = await Resident.find({
            $or: [
                { groupId: null },
                { groupId: { $exists: false } }
            ]
        });

        console.log(`\n📊 ${residentsWithoutGroup.length} résidents sans groupId trouvés`);

        if (residentsWithoutGroup.length === 0) {
            console.log('✅ Tous les résidents ont déjà un groupId!');
            
            // Vérifier tous les résidents pour debug
            const allResidents = await Resident.find().populate('siteId');
            console.log(`\n📊 Total résidents: ${allResidents.length}`);
            
            for (const resident of allResidents) {
                console.log(`\n👤 ${resident.firstName} ${resident.lastName}`);
                console.log(`   Site: ${resident.siteId?.siteName || 'NON DÉFINI'}`);
                console.log(`   GroupID: ${resident.groupId || 'NON DÉFINI'}`);
            }
            
            await mongoose.connection.close();
            return;
        }

        let fixed = 0;
        let failed = 0;

        for (const resident of residentsWithoutGroup) {
            try {
                // Récupérer le site associé
                const site = await Site.findById(resident.siteId);
                
                if (!site) {
                    console.log(`❌ Site non trouvé pour ${resident.firstName} ${resident.lastName}`);
                    failed++;
                    continue;
                }

                if (!site.groupId) {
                    console.log(`⚠️  Le site "${site.siteName}" n'a pas de groupId`);
                    failed++;
                    continue;
                }

                // Mettre à jour le résident avec le groupId du site
                resident.groupId = site.groupId;
                await resident.save();

                console.log(`✅ ${resident.firstName} ${resident.lastName} → GroupId mis à jour (Site: ${site.siteName})`);
                fixed++;

            } catch (error) {
                console.error(`❌ Erreur pour ${resident.firstName} ${resident.lastName}:`, error.message);
                failed++;
            }
        }

        console.log(`\n📊 RÉSUMÉ:`);
        console.log(`   ✅ Résidents mis à jour: ${fixed}`);
        console.log(`   ❌ Échecs: ${failed}`);

        // Vérifier le résultat final
        const allResidents = await Resident.find().populate('siteId');
        console.log(`\n📊 État final - Total résidents: ${allResidents.length}`);
        
        const residentsByGroup = {};
        for (const resident of allResidents) {
            const groupId = resident.groupId?.toString() || 'SANS_GROUPE';
            if (!residentsByGroup[groupId]) {
                residentsByGroup[groupId] = 0;
            }
            residentsByGroup[groupId]++;
        }

        console.log('\n📊 Répartition par groupe:');
        for (const [groupId, count] of Object.entries(residentsByGroup)) {
            console.log(`   ${groupId === 'SANS_GROUPE' ? '⚠️  Pas de groupe' : '✅ GroupId: ' + groupId}: ${count} résidents`);
        }

        await mongoose.connection.close();
        console.log('\n✅ Migration terminée!');

    } catch (error) {
        console.error('❌ Erreur:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

fixResidentsGroupId();

