// models/Product.js
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  },
  minOrderQuantity: {
    type: Number,
    default: 1
  },
  deliveryZones: [{
    type: String
  }],
  imageUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware - Mettre à jour la date de modification
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Product', ProductSchema);