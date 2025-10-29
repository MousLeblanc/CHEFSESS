import mongoose from "mongoose";

const foodCostSchema = new mongoose.Schema({
  // Référence au site
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Site",
    required: true,
    index: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
    index: true
  },
  
  // Période de suivi
  period: {
    type: String,
    enum: ['jour', 'semaine', 'mois', 'trimestre', 'annee'],
    default: 'mois'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Budget et objectifs
  budget: {
    planned: {
      type: Number,
      required: true,
      default: 0,
      description: "Budget prévu pour la période"
    },
    perResident: {
      type: Number,
      description: "Budget par résident par jour"
    },
    perMeal: {
      type: Number,
      description: "Budget par repas"
    }
  },
  
  // Dépenses réelles
  expenses: {
    // Achats auprès des fournisseurs (automatique)
    orders: {
      type: Number,
      default: 0,
      description: "Total des commandes fournisseurs"
    },
    // Saisies manuelles
    manual: [{
      date: {
        type: Date,
        required: true
      },
      category: {
        type: String,
        enum: [
          'fruits_legumes',
          'viandes_poissons',
          'produits_laitiers',
          'epicerie',
          'surgeles',
          'boissons',
          'pain_patisserie',
          'autres'
        ],
        required: true
      },
      description: String,
      supplier: String,
      amount: {
        type: Number,
        required: true
      },
      invoiceNumber: String,
      notes: String,
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }],
    // Total
    total: {
      type: Number,
      default: 0
    }
  },
  
  // Nombre de repas et résidents pour le calcul
  metrics: {
    numberOfResidents: {
      type: Number,
      default: 0
    },
    numberOfMeals: {
      type: Number,
      default: 0
    },
    numberOfDays: {
      type: Number,
      default: 0
    }
  },
  
  // Calculs et indicateurs
  analysis: {
    // Coûts unitaires
    costPerResident: Number,
    costPerMeal: Number,
    costPerDay: Number,
    
    // Écarts
    variance: {
      amount: Number,
      percentage: Number
    },
    
    // Statut
    status: {
      type: String,
      enum: ['ok', 'warning', 'alert', 'critical'],
      default: 'ok'
    },
    
    // Alertes
    alerts: [{
      type: {
        type: String,
        enum: ['budget_exceeded', 'approaching_limit', 'high_variance', 'unusual_expense']
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      },
      message: String,
      date: {
        type: Date,
        default: Date.now
      },
      acknowledged: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Notes et commentaires
  notes: String,
  
  // Audit
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, {
  timestamps: true
});

// Index composites pour les recherches
foodCostSchema.index({ siteId: 1, startDate: 1, endDate: 1 });
foodCostSchema.index({ groupId: 1, period: 1 });
foodCostSchema.index({ 'analysis.status': 1 });

// Méthode pour calculer les totaux
foodCostSchema.methods.calculateTotals = function() {
  // Somme des dépenses manuelles
  const manualTotal = this.expenses.manual.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Total général
  this.expenses.total = this.expenses.orders + manualTotal;
  
  // Calculs unitaires
  if (this.metrics.numberOfResidents > 0) {
    this.analysis.costPerResident = this.expenses.total / this.metrics.numberOfResidents / this.metrics.numberOfDays;
  }
  
  if (this.metrics.numberOfMeals > 0) {
    this.analysis.costPerMeal = this.expenses.total / this.metrics.numberOfMeals;
  }
  
  if (this.metrics.numberOfDays > 0) {
    this.analysis.costPerDay = this.expenses.total / this.metrics.numberOfDays;
  }
  
  // Calcul de l'écart
  this.analysis.variance = {
    amount: this.expenses.total - this.budget.planned,
    percentage: this.budget.planned > 0 
      ? ((this.expenses.total - this.budget.planned) / this.budget.planned) * 100 
      : 0
  };
  
  // Détermination du statut
  this.updateStatus();
};

// Méthode pour mettre à jour le statut
foodCostSchema.methods.updateStatus = function() {
  const variance = this.analysis.variance.percentage;
  
  if (variance <= 0) {
    this.analysis.status = 'ok';
  } else if (variance > 0 && variance <= 10) {
    this.analysis.status = 'warning';
  } else if (variance > 10 && variance <= 20) {
    this.analysis.status = 'alert';
  } else {
    this.analysis.status = 'critical';
  }
};

// Méthode pour ajouter une alerte
foodCostSchema.methods.addAlert = function(type, severity, message) {
  this.analysis.alerts.push({
    type,
    severity,
    message,
    date: new Date(),
    acknowledged: false
  });
};

// Méthode pour vérifier et créer les alertes automatiques
foodCostSchema.methods.checkAndCreateAlerts = function() {
  const variance = this.analysis.variance.percentage;
  
  // Alerte de dépassement de budget
  if (variance > 0) {
    const existingAlert = this.analysis.alerts.find(
      a => a.type === 'budget_exceeded' && !a.acknowledged
    );
    
    if (!existingAlert) {
      let severity = 'low';
      if (variance > 20) severity = 'critical';
      else if (variance > 10) severity = 'high';
      else if (variance > 5) severity = 'medium';
      
      this.addAlert(
        'budget_exceeded',
        severity,
        `Budget dépassé de ${variance.toFixed(1)}% (${this.analysis.variance.amount.toFixed(2)}€)`
      );
    }
  }
  
  // Alerte d'approche de la limite (90%)
  const usagePercentage = (this.expenses.total / this.budget.planned) * 100;
  if (usagePercentage >= 90 && usagePercentage < 100) {
    const existingAlert = this.analysis.alerts.find(
      a => a.type === 'approaching_limit' && !a.acknowledged
    );
    
    if (!existingAlert) {
      this.addAlert(
        'approaching_limit',
        'medium',
        `Budget utilisé à ${usagePercentage.toFixed(1)}%`
      );
    }
  }
};

// Hook avant sauvegarde
foodCostSchema.pre('save', function(next) {
  this.calculateTotals();
  this.checkAndCreateAlerts();
  next();
});

export default mongoose.model("FoodCost", foodCostSchema);

