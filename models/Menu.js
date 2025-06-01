// models/Menu.js
import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  theme: {
    type: String
  },
  mode: {
    type: String,
    enum: ['stock-only', 'stock-plus', 'custom'],
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  courses: [
    {
      type: {
        type: String,
        required: true,
        enum: ['entrée', 'plat', 'dessert', 'accompagnement', 'amuse-bouche', 'autre']
      },
      name: {
        type: String,
        required: true
      },
      ingredients: [
        {
          name: {
            type: String,
            required: true
          },
          quantity: {
            type: Number,
            required: true
          },
          unit: {
            type: String,
            required: true
          },
          inStock: {
            type: Boolean,
            default: true
          }
        }
      ],
      instructions: {
        type: String,
        required: true
      },
      preparationTime: {
        type: Number, // en minutes
      },
      cookingTime: {
        type: Number, // en minutes
      },
      servings: {
        type: Number,
        default: 4
      }
    }
  ],
  stockUpdated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Méthode pour calculer les quantités totales d'ingrédients utilisés
MenuSchema.methods.calculateTotalIngredients = function() {
  const totals = {};
  
  this.courses.forEach(course => {
    course.ingredients.forEach(ingredient => {
      const key = `${ingredient.name}-${ingredient.unit}`;
      
      if (!totals[key]) {
        totals[key] = {
          name: ingredient.name,
          unit: ingredient.unit,
          quantity: 0
        };
      }
      
      totals[key].quantity += ingredient.quantity;
    });
  });
  
  return Object.values(totals);
};

export default mongoose.model('Menu', MenuSchema);