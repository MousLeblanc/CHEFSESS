import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaif-ses';

async function moveFournisseur() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const correctGroupId = new mongoose.Types.ObjectId('68f966df9ffbca436a234a28');
    
    const supplier = await Supplier.findOne({ email: 'fournisseur@gmail.com' });
    supplier.groupId = correctGroupId;
    await supplier.save();
    console.log('✅ Fournisseur déplacé vers Vulpia Group');
    
    const user = await User.findOne({ email: 'fournisseur@gmail.com' });
    if (user) {
      user.groupId = correctGroupId;
      await user.save();
      console.log('✅ User déplacé vers Vulpia Group');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

moveFournisseur();


