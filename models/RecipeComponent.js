import mongoose from "mongoose";

const recipeComponentSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ex. "Cuisse de poulet", "Sauce champignons", "Riz"
  
  type: { 
    type: String, 
    enum: ['protein', 'sauce', 'accompaniment', 'garnish'],
    required: true 
  },
  
  // Catégorie de l'ingrédient principal (uniquement pour les protéines)
  proteinCategory: { 
    type: String, 
    enum: ['volaille', 'viande', 'poisson', 'fruits_de_mer', 'vegetarien', 'vegan', 'oeuf', 'fromage'],
    required: function() { return this.type === 'protein'; }
  },
  
  // Description
  description: { type: String },
  
  // Ingrédients nécessaires (quantités par portion)
  ingredients: [{
    name: String,
    quantity: Number, // Quantité par portion
    unit: String
  }],
  
  // Instructions de préparation
  preparationSteps: [String],
  
  // Compatibilités avec d'autres composants
  compatibleWith: {
    proteins: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'RecipeComponent' 
    }], // Pour sauces/accompagnements : liste des protéines compatibles
    sauces: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'RecipeComponent' 
    }], // Pour protéines : liste des sauces compatibles
    accompaniments: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'RecipeComponent' 
    }] // Pour protéines : liste des accompagnements compatibles
  },
  
  // Restrictions et compatibilités
  allergens: [{ 
    type: String,
    enum: [
      'gluten', 'lactose', 'oeufs', 'arachides', 'fruits_a_coque',
      'soja', 'poisson', 'crustaces', 'mollusques', 'celeri',
      'moutarde', 'sesame', 'sulfites', 'lupin'
    ]
  }],
  
  dietaryRestrictions: [{ 
    type: String 
  }], // ex: ["hyposodé", "végétarien", "halal", "casher", "sans_gluten"]
  
  // Textures compatibles
  textures: [{ 
    type: String,
    enum: ["normale", "tendre", "hachée", "mixée", "moulinée", "lisse", "liquide", "boire"]
  }],
  
  // Adaptation aux établissements
  establishmentTypes: [{ 
    type: String, 
    enum: ["cantine_scolaire", "ehpad", "hopital", "cantine_entreprise", "restaurant"] 
  }],
  
  // Informations nutritionnelles (par portion)
  nutrition: {
    calories: { type: Number, default: 0 },
    proteins: { type: Number, default: 0 }, // en g
    carbs: { type: Number, default: 0 }, // en g
    lipids: { type: Number, default: 0 }, // en g
    fibers: { type: Number, default: 0 }, // en g
    sodium: { type: Number, default: 0 } // en mg
  },
  
  // Temps de préparation
  preparationTime: { type: Number, default: 0 }, // en minutes
  cookingTime: { type: Number, default: 0 }, // en minutes
  totalTime: { type: Number, default: 0 }, // en minutes (calculé)
  
  // Tags pour recherche et catégorisation
  tags: [{ 
    type: String,
    lowercase: true // Normaliser en minuscules pour la recherche
  }], 
  // Exemples de tags:
  // - Type: "rapide", "classique", "gourmand", "léger", "économique"
  // - Cuisine: "française", "italienne", "asiatique", "méditerranéenne"
  // - Saison: "été", "hiver", "printemps", "automne"
  // - Occasion: "quotidien", "festif", "romantique", "familial"
  // - Difficulté: "facile", "moyen", "difficile"
  // - Spécial: "bio", "local", "fusion", "traditionnel"
  
  // Prix moyen (optionnel, pour optimisation coût)
  averagePrice: { type: Number }, // Prix par portion en euros
  
  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index pour améliorer les performances de recherche
recipeComponentSchema.index({ type: 1, proteinCategory: 1 });
recipeComponentSchema.index({ 'compatibleWith.proteins': 1 });
recipeComponentSchema.index({ 'compatibleWith.sauces': 1 });
recipeComponentSchema.index({ 'compatibleWith.accompaniments': 1 });
recipeComponentSchema.index({ allergens: 1 });
recipeComponentSchema.index({ dietaryRestrictions: 1 });
recipeComponentSchema.index({ tags: 1 });

// Calculer le temps total avant sauvegarde
recipeComponentSchema.pre('save', function(next) {
  this.totalTime = (this.preparationTime || 0) + (this.cookingTime || 0);
  this.updatedAt = new Date();
  next();
});

// Méthode pour obtenir les composants compatibles
recipeComponentSchema.methods.getCompatibleComponents = async function(componentType) {
  const Component = mongoose.model('RecipeComponent');
  
  if (this.type === 'protein') {
    // Si c'est une protéine, retourner les sauces/accompagnements compatibles
    const field = componentType === 'sauce' ? 'compatibleWith.sauces' : 'compatibleWith.accompaniments';
    return await Component.find({ _id: { $in: this.compatibleWith[componentType === 'sauce' ? 'sauces' : 'accompaniments'] } });
  } else {
    // Si c'est une sauce/accompagnement, retourner les protéines compatibles
    return await Component.find({ 
      type: 'protein',
      'compatibleWith.sauces': this._id 
    });
  }
};

const RecipeComponent = mongoose.model("RecipeComponent", recipeComponentSchema);
export default RecipeComponent;

