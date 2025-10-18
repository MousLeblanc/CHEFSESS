import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ["entrée", "plat", "dessert", "petit-déjeuner", "soupe"], required: true },

  // Adaptation aux établissements
  establishmentType: [{ type: String, enum: ["ecole", "ehpad", "hopital", "collectivite", "resto"] }],

  // Textures & régimes
  texture: {
    type: String,
    enum: ["normale", "hachée", "mixée", "lisse", "liquide"],
    default: "normale"
  },
  diet: [{ type: String }], // ex: ["sans sel ajouté", "hypocalorique", "végétarien"]

  // Pathologies
  pathologies: [{ type: String }], // ex: ["diabète", "hypertension", "insuffisance rénale"]

  // Allergènes principaux (selon règlement UE)
  allergens: [{ type: String }], // ex: ["gluten", "lait", "oeuf"]

  // Profil nutritionnel (optionnel mais utile pour IA)
  nutritionalProfile: {
    kcal: Number,
    protein: Number,
    lipids: Number,
    carbs: Number,
    fiber: Number,
    sodium: Number
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
