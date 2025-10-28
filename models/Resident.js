import mongoose from "mongoose";

const residentSchema = new mongoose.Schema({
  // Informations personnelles
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['homme', 'femme', 'autre'],
    required: true
  },
  
  // Informations de contact
  phone: String,
  email: String,
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: {
      type: String,
      default: "France"
    }
  },
  
  // Informations médicales
  roomNumber: String,
  bedNumber: String,
  medicalRecordNumber: String,
  
  // Carte d'identité nutritionnelle
  nutritionalProfile: {
    // Intolérances et allergies
    allergies: [{
      allergen: String,
      severity: {
        type: String,
        enum: ['légère', 'modérée', 'sévère', 'critique'],
        default: 'modérée'
      },
      symptoms: [String],
      notes: String
    }],
    
    intolerances: [{
      substance: String,
      severity: {
        type: String,
        enum: ['légère', 'modérée', 'sévère'],
        default: 'modérée'
      },
      symptoms: [String],
      notes: String
    }],
    
    // Restrictions alimentaires
    dietaryRestrictions: [{
      type: {
        type: String,
        enum: ['religieuse', 'éthique', 'médicale', 'personnelle'],
        required: true
      },
      restriction: String,
      details: String,
      startDate: Date,
      endDate: Date
    }],
    
    // Pathologies et conditions médicales
    medicalConditions: [{
      condition: String,
      severity: {
        type: String,
        enum: ['légère', 'modérée', 'sévère'],
        default: 'modérée'
      },
      impactOnNutrition: String,
      dietaryRecommendations: [String],
      notes: String
    }],
    
    // Besoins nutritionnels spécifiques
    nutritionalNeeds: {
      calories: {
        daily: Number,
        perMeal: Number,
        notes: String
      },
      proteins: {
        daily: Number, // en grammes
        perMeal: Number,
        notes: String
      },
      carbohydrates: {
        daily: Number,
        perMeal: Number,
        notes: String
      },
      fats: {
        daily: Number,
        perMeal: Number,
        notes: String
      },
      fiber: {
        daily: Number,
        notes: String
      },
      sodium: {
        daily: Number, // en mg
        restriction: {
          type: String,
          enum: ['normal', 'réduit', 'très réduit', 'sans sel'],
          default: 'normal'
        },
        notes: String
      },
      sugar: {
        daily: Number,
        restriction: {
          type: String,
          enum: ['normal', 'réduit', 'très réduit', 'sans sucre'],
          default: 'normal'
        },
        notes: String
      }
    },
    
    // Texture et mastication
    texturePreferences: {
      consistency: {
        type: String,
        enum: ['normale', 'mixée', 'hachée', 'liquide', 'purée'],
        default: 'normale'
      },
      difficulty: {
        type: String,
        enum: ['aucune', 'légère', 'modérée', 'sévère'],
        default: 'aucune'
      },
      notes: String
    },
    
    // Hydratation
    hydration: {
      dailyIntake: Number, // en ml
      restrictions: [String],
      preferences: [String],
      notes: String
    },
    
    // Préférences alimentaires
    foodPreferences: {
      liked: [String],
      disliked: [String],
      cultural: [String],
      religious: [String],
      notes: String
    }
  },
  
  // Taille de portion pour les repas
  portionSize: {
    type: Number,
    enum: [0.5, 1, 2],
    default: 1,
    description: '0.5 = demi-portion, 1 = portion normale, 2 = double portion'
  },
  
  // Informations de contact d'urgence
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String,
    address: {
      street: String,
      city: String,
      postalCode: String
    }
  },
  
  // Statut et suivi
  status: {
    type: String,
    enum: ['actif', 'inactif', 'sorti', 'décédé'],
    default: 'actif'
  },
  
  // Références
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site",
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },
  
  // Métadonnées
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  
  // Notes générales
  generalNotes: String,
  
  // Historique des modifications
  modificationHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    changes: String,
    reason: String
  }]
}, {
  timestamps: true
});

// Index pour les recherches rapides
residentSchema.index({ siteId: 1, lastName: 1, firstName: 1 });
residentSchema.index({ groupId: 1, status: 1 });
residentSchema.index({ "nutritionalProfile.allergies.allergen": 1 });
residentSchema.index({ "nutritionalProfile.intolerances.substance": 1 });
residentSchema.index({ roomNumber: 1, siteId: 1 });

// Méthodes utiles
residentSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

residentSchema.methods.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

residentSchema.methods.hasAllergy = function(allergen) {
  return this.nutritionalProfile.allergies.some(allergy => 
    allergy.allergen.toLowerCase().includes(allergen.toLowerCase())
  );
};

residentSchema.methods.hasIntolerance = function(substance) {
  return this.nutritionalProfile.intolerances.some(intolerance => 
    intolerance.substance.toLowerCase().includes(substance.toLowerCase())
  );
};

residentSchema.methods.getDietaryRestrictions = function() {
  const restrictions = [];
  
  // Allergies
  this.nutritionalProfile.allergies.forEach(allergy => {
    restrictions.push(`Allergie: ${allergy.allergen} (${allergy.severity})`);
  });
  
  // Intolérances
  this.nutritionalProfile.intolerances.forEach(intolerance => {
    restrictions.push(`Intolérance: ${intolerance.substance} (${intolerance.severity})`);
  });
  
  // Restrictions alimentaires
  this.nutritionalProfile.dietaryRestrictions.forEach(restriction => {
    restrictions.push(`${restriction.type}: ${restriction.restriction}`);
  });
  
  return restrictions;
};

export default mongoose.model("Resident", residentSchema);