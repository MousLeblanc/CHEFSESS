import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["entrée", "plat", "dessert", "petit-déjeuner", "soupe", "accompagnement", "boisson", "purée"], required: true },

  // Adaptation aux établissements
  establishmentTypes: [{ type: String, enum: ["cantine_scolaire", "ehpad", "hopital", "cantine_entreprise"] }],

  // Groupes d'âge (optionnel - si absent, la recette convient à tous les âges)
  ageGroup: {
    min: { type: Number }, // âge minimum en années
    max: { type: Number }  // âge maximum en années
  },

  // Textures & régimes
  texture: {
    type: String,
    enum: [
      "normale", "tendre", "hachée", "mixée", "moulinée", "lisse", "liquide", "boire",
      // Normes IDDSI (International Dysphagia Diet Standardisation Initiative)
      "iddsi_0", "iddsi_1", "iddsi_2", "iddsi_3", "iddsi_4", "iddsi_5", "iddsi_6", "iddsi_7",
      // Autres textures spécialisées
      "finger_food"
    ],
    default: "normale"
  },
  diet: [{ type: String }], // ex: ["sans sel ajouté", "hypocalorique", "végétarien"]
  
  // Restrictions alimentaires détectées automatiquement
  dietaryRestrictions: [{ type: String }], // ex: ["hyposodé", "végétarien", "halal", "casher", "sans_gluten"]
  
  // Tags pour recherche et affichage
  tags: [{ type: String }], // ex: ["#ehpad", "#hyperprotéiné", "#mixée", "#soupe"]

  // Pathologies
  pathologies: [{ type: String }], // ex: ["diabète", "hypertension", "insuffisance rénale"]

  // Allergènes principaux (selon règlement UE)
  allergens: [{ type: String }], // ex: ["gluten", "lait", "oeuf"]

  // Profil nutritionnel (optionnel mais utile pour IA)
  // ⚠️ IMPORTANT : Toutes les valeurs sont pour 100g de recette finale
  // Les valeurs sont calculées à partir des ingrédients en utilisant CIQUAL (ANSES)
  // et normalisées pour 100g de recette finale
  nutritionalProfile: {
    kcal: Number,    // kcal pour 100g de recette
    protein: Number, // g pour 100g de recette
    lipids: Number,  // g pour 100g de recette
    carbs: Number,   // g pour 100g de recette
    fiber: Number,   // g pour 100g de recette
    sodium: Number   // mg pour 100g de recette
  },

  // Liste d'ingrédients
  ingredients: [
    {
      name: String,
      quantity: Number,
      unit: String
    }
  ],

  preparationSteps: [String],

  // Index IA
  compatibleFor: [{ type: String }], // ex: ["mixée", "diabétique", "hyposodé", "ehpad"]

  // Niveau de compatibilité IA calculé dynamiquement
  aiCompatibilityScore: { type: Number, default: 1.0 }
});

const RecipeEnriched = mongoose.model("RecipeEnriched", recipeSchema);
export default RecipeEnriched;
