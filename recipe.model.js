import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    ageGroup: { type: String, required: true }, // ex: "2.5-6", "6-12", "12-18", "2.5-18", "18+"
    type: { type: String }, // ex: "vegetarien", "viande", "poisson", "volaille", "omnivore"
    mainIngredient: { type: String },
    servings: { type: Number, default: 4 }, // Nombre de portions de base
    ingredients: [{
        name: String,
        quantity: Number,
        unit: String
    }],
    instructions: [String],
    category: { type: String }, // ex: "vegetarien", "viande", "poisson", "volaille", "omnivore"
    
    // Composant du repas (pour composition de plats complets)
    mealComponent: {
        type: String,
        enum: ['soupe', 'entree', 'proteine', 'legumes', 'feculent', 'dessert', 'plat_complet'],
        default: 'plat_complet'
    },
    
    // Informations nutritionnelles
    nutrition: {
        calories: { type: Number, default: 0 },
        proteins: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fats: { type: Number, default: 0 }
    },
    
    // Allergènes potentiels
    allergens: [{
        type: String,
        enum: [
            'gluten', 'lactose', 'oeufs', 'arachides', 'fruits_a_coque',
            'soja', 'poisson', 'crustaces', 'mollusques', 'celeri',
            'moutarde', 'sesame', 'sulfites', 'lupin'
        ]
    }],
    
    // Restrictions alimentaires compatibles
    dietaryRestrictions: [{
        type: String,
        enum: [
            'vegetarien', 'vegan', 'sans_gluten', 'sans_lactose',
            'halal', 'casher', 'sans_porc', 'sans_viande_rouge',
            'sans_sel', 'pauvre_en_sucre', 'pauvre_en_graisse', 'riche_en_calcium',
            'pauvre_en_proteine', 'sans_fibres', 'pauvre_residus', 'riche_fibres'
        ]
    }],
    
    // Pathologies compatibles (filtres médicaux spécialisés)
    medicalConditions: [{
        type: String,
        enum: [
            // Diabète
            'diabete_type1', 'diabete_type2', 'diabete',
            // Hypertension et cardiovasculaire
            'hypertension', 'hyposode', 'insuffisance_cardiaque', 'cardiopathie',
            // Rénal
            'insuffisance_renale', 'maladie_renale', 'restriction_proteines',
            // Digestif
            'troubles_digestifs', 'maladie_coeliaque', 'intolerance_gluten',
            // Neurologique
            'alzheimer', 'parkinson', 'demence', 'dysphagie',
            // Métabolique
            'cholesterol', 'hyperlipidemie', 'obesite', 'denutrition', 'denutrition_severe',
            // Autres
            'texture_modifiee', 'post_operatoire', 'soins_palliatifs'
        ]
    }],
    
    // Texture du plat (normes IDDSI 0-7)
    texture: {
        type: String,
        enum: [
            'normale', 'tendre', 'hachee', 'hachée', 'mixee', 'mixée', 'moulinee', 'moulinée', 'liquide',
            // Normes IDDSI
            'iddsi_0', 'iddsi_1', 'iddsi_2', 'iddsi_3', 'iddsi_4', 'iddsi_5', 'iddsi_6', 'iddsi_7'
        ],
        default: 'normale'
    },
    
    // Filtres de déglutition et hydratation
    swallowing: {
        type: String,
        enum: [
            'normale', 'epaisse_nectar', 'epaisse_miel', 'epaisse_pudding',
            'sans_morceaux', 'hydratation_surveillee', 'hydratation_enrichie'
        ],
        default: 'normale'
    },
    
    // Filtres nutritionnels spécialisés
    nutritionalProfile: [{
        type: String,
        enum: [
            'equilibre_standard', 'hyperproteine', 'hypercalorique', 'hypocalorique',
            'sans_fibres', 'pauvre_residus', 'riche_fibres', 'sans_sucre_ajoute',
            'sans_sel_ajoute', 'enrichi_vitamines', 'enrichi_mineraux', 'riche_en_calcium'
        ]
    }],
    
    // Filtres éthiques et religieux
    ethicalRestrictions: [{
        type: String,
        enum: [
            'vegetarien', 'vegetalien', 'vegan', 'halal', 'casher',
            'sans_porc', 'sans_alcool', 'bouddhiste', 'hindou'
        ]
    }],
    
    // Groupe d'âge et dépendance
    ageDependencyGroup: {
        type: String,
        enum: [
            'personne_agee_autonome', 'personne_agee_dependante', 'post_operatoire',
            'soins_palliatifs', 'denutrition_severe', 'convalescence'
        ],
        default: 'personne_agee_autonome'
    },
    
    // Filtres logistiques et de confort
    comfortFilters: [{
        type: String,
        enum: [
            'mixe_commande', 'prepare_avance', 'temperature_chaude', 'temperature_tiede',
            'temperature_froide', 'teneur_liquides_surveillee', 'portions_reduites',
            'portions_renforcees', 'sans_morceaux_durs', 'sans_morceaux_secs', 'sans_morceaux'
        ]
    }],
    
    // Tags pour recherche avancée
    tags: [String],
    
    // ID original du dataset enrichi
    originalId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

// Index pour améliorer les performances de recherche
recipeSchema.index({ ageGroup: 1, category: 1 });
recipeSchema.index({ allergens: 1 });
recipeSchema.index({ dietaryRestrictions: 1 });
recipeSchema.index({ medicalConditions: 1 });
recipeSchema.index({ texture: 1 });
recipeSchema.index({ mealComponent: 1 });
recipeSchema.index({ tags: 1 });
recipeSchema.index({ 'nutrition.calories': 1 });
recipeSchema.index({ originalId: 1 });

export default mongoose.model('Recipe', recipeSchema);
