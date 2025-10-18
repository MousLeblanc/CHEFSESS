import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Stock from '../models/Stock.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function migrateStock() {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        await mongoose.connect(mongoUri);
        console.log('✅ Connecté à MongoDB');

        // Trouver l'utilisateur resto@gmail.com
        const user = await User.findOne({ email: 'resto@gmail.com' });
        if (!user) {
            console.log('❌ Utilisateur resto@gmail.com non trouvé');
            return;
        }
        console.log('✅ Utilisateur trouvé:', user._id, user.name);

        // Trouver tous les stocks sans createdBy
        const stocks = await mongoose.connection.db.collection('stocks').find({ createdBy: { $exists: false } }).toArray();
        console.log(`📦 Stocks sans createdBy: ${stocks.length}`);

        if (stocks.length > 0) {
            // Prendre le stock avec le plus d'items
            const mainStock = stocks.reduce((prev, current) => 
                (current.items && current.items.length > (prev.items ? prev.items.length : 0)) ? current : prev
            );

            console.log(`🎯 Stock principal sélectionné avec ${mainStock.items ? mainStock.items.length : 0} items`);

            // Mettre à jour ce stock avec le createdBy
            const result = await mongoose.connection.db.collection('stocks').updateOne(
                { _id: mainStock._id },
                { 
                    $set: { 
                        createdBy: user._id,
                        establishmentType: user.establishmentType || 'autre'
                    } 
                }
            );

            console.log('✅ Stock migré:', result.modifiedCount, 'document(s) modifié(s)');

            // Supprimer les autres stocks (optionnel - commentez si vous voulez les garder)
            const otherStocks = stocks.filter(s => s._id.toString() !== mainStock._id.toString());
            if (otherStocks.length > 0) {
                console.log(`🗑️  Suppression de ${otherStocks.length} stock(s) en double...`);
                for (const stock of otherStocks) {
                    await mongoose.connection.db.collection('stocks').deleteOne({ _id: stock._id });
                }
                console.log('✅ Stocks en double supprimés');
            }

            // Vérifier le résultat
            const updatedStock = await Stock.findOne({ createdBy: user._id });
            if (updatedStock) {
                console.log('✅ Vérification - Stock trouvé pour l\'utilisateur:');
                console.log({
                    _id: updatedStock._id,
                    createdBy: updatedStock.createdBy,
                    establishmentType: updatedStock.establishmentType,
                    itemsCount: updatedStock.items.length,
                    sampleItems: updatedStock.items.slice(0, 3).map(i => ({
                        name: i.name,
                        quantity: i.quantity,
                        unit: i.unit
                    }))
                });
            }
        } else {
            console.log('✅ Tous les stocks ont déjà un createdBy');
        }

        await mongoose.disconnect();
        console.log('✅ Migration terminée');
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

migrateStock();

