import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Stock from '../models/Stock.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function checkStockData() {
    try {
        // Vérifier que MONGODB_URI existe
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('❌ MONGODB_URI n\'est pas défini dans .env');
            console.log('Variables d\'environnement disponibles:', Object.keys(process.env).filter(k => k.includes('MONGO')));
            return;
        }
        
        // Connexion à MongoDB
        await mongoose.connect(mongoUri);
        console.log('✅ Connecté à MongoDB');

        // Trouver l'utilisateur resto@gmail.com
        const user = await User.findOne({ email: 'resto@gmail.com' });
        if (!user) {
            console.log('❌ Utilisateur resto@gmail.com non trouvé');
            return;
        }
        console.log('✅ Utilisateur trouvé:', user._id, user.name);

        // Chercher le stock de cet utilisateur
        const stock = await Stock.findOne({ createdBy: user._id });
        if (!stock) {
            console.log('❌ Aucun stock trouvé pour cet utilisateur');
            console.log('🔍 Recherche de tous les stocks...');
            
            const allStocks = await Stock.find();
            console.log(`📦 Total stocks dans la base: ${allStocks.length}`);
            allStocks.forEach((s, i) => {
                console.log(`Stock ${i + 1}:`, {
                    _id: s._id,
                    createdBy: s.createdBy,
                    itemsCount: s.items ? s.items.length : 0
                });
            });
        } else {
            console.log('✅ Stock trouvé pour l\'utilisateur:');
            console.log({
                _id: stock._id,
                createdBy: stock.createdBy,
                establishmentType: stock.establishmentType,
                itemsCount: stock.items ? stock.items.length : 0,
                items: stock.items
            });
        }

        await mongoose.disconnect();
        console.log('✅ Déconnecté de MongoDB');
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

checkStockData();

