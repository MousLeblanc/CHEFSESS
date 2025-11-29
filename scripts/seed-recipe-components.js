// scripts/seed-recipe-components.js
// Script pour peupler la base de données avec les composants de recettes de base
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RecipeComponent from '../models/RecipeComponent.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";

// Protéines de base (Top 10)
const baseProteins = [
  {
    name: "Cuisse de poulet",
    type: "protein",
    proteinCategory: "volaille",
    description: "Cuisse de poulet rôtie, grillée ou braisée",
    ingredients: [
      { name: "Cuisse de poulet", quantity: 1, unit: "pièce" },
      { name: "Huile d'olive", quantity: 1, unit: "c. à soupe" },
      { name: "Sel", quantity: 1, unit: "pincée" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    preparationSteps: [
      "Préchauffer le four à 180°C",
      "Badigeonner les cuisses d'huile d'olive",
      "Saler et poivrer",
      "Enfourner 45 minutes ou jusqu'à ce que la peau soit dorée"
    ],
    allergens: [],
    dietaryRestrictions: ["halal"],
    textures: ["normale", "tendre"],
    establishmentTypes: ["restaurant", "cantine_scolaire"],
    nutrition: {
      calories: 250,
      proteins: 30,
      carbs: 0,
      lipids: 12,
      fibers: 0,
      sodium: 80
    },
    preparationTime: 10,
    cookingTime: 45,
    tags: [
      "classique", "polyvalent", "accessible", "volaille", 
      "quotidien", "familial", "français", "facile", "économique"
    ]
  },
  {
    name: "Filet de poulet",
    type: "protein",
    proteinCategory: "volaille",
    description: "Filet de poulet poêlé ou grillé",
    ingredients: [
      { name: "Filet de poulet", quantity: 1, unit: "pièce" },
      { name: "Huile d'olive", quantity: 1, unit: "c. à soupe" },
      { name: "Sel", quantity: 1, unit: "pincée" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    preparationSteps: [
      "Chauffer l'huile dans une poêle",
      "Saler et poivrer les filets",
      "Cuire 6-8 minutes par face jusqu'à ce qu'ils soient dorés"
    ],
    allergens: [],
    dietaryRestrictions: ["halal"],
    textures: ["normale", "tendre"],
    establishmentTypes: ["restaurant", "cantine_scolaire"],
    nutrition: {
      calories: 165,
      proteins: 31,
      carbs: 0,
      lipids: 3.6,
      fibers: 0,
      sodium: 70
    },
    preparationTime: 5,
    cookingTime: 15,
    tags: [
      "rapide", "léger", "polyvalent", "volaille", 
      "quotidien", "sain", "facile", "français"
    ]
  },
  {
    name: "Saumon (Filet)",
    type: "protein",
    proteinCategory: "poisson",
    description: "Filet de saumon poêlé ou cuit au four",
    ingredients: [
      { name: "Filet de saumon", quantity: 1, unit: "pièce (150g)" },
      { name: "Huile d'olive", quantity: 1, unit: "c. à soupe" },
      { name: "Sel", quantity: 1, unit: "pincée" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    preparationSteps: [
      "Préchauffer le four à 200°C ou chauffer une poêle",
      "Badigeonner le saumon d'huile",
      "Saler et poivrer",
      "Cuire 10-12 minutes au four ou 4-5 minutes par face à la poêle"
    ],
    allergens: ["poisson"],
    dietaryRestrictions: [],
    textures: ["normale", "tendre"],
    establishmentTypes: ["restaurant"],
    nutrition: {
      calories: 206,
      proteins: 25,
      carbs: 0,
      lipids: 12,
      fibers: 0,
      sodium: 50
    },
    preparationTime: 5,
    cookingTime: 12,
    tags: [
      "rapide", "sain", "apprécié", "poisson", 
      "quotidien", "gourmand", "facile", "méditerranéen"
    ]
  },
  {
    name: "Cabillaud (Filet)",
    type: "protein",
    proteinCategory: "poisson",
    description: "Filet de cabillaud poêlé ou cuit au four",
    ingredients: [
      { name: "Filet de cabillaud", quantity: 1, unit: "pièce (150g)" },
      { name: "Huile d'olive", quantity: 1, unit: "c. à soupe" },
      { name: "Sel", quantity: 1, unit: "pincée" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    preparationSteps: [
      "Préchauffer le four à 180°C",
      "Badigeonner le cabillaud d'huile",
      "Saler et poivrer",
      "Cuire 12-15 minutes au four"
    ],
    allergens: ["poisson"],
    dietaryRestrictions: [],
    textures: ["normale", "tendre"],
    establishmentTypes: ["restaurant", "cantine_scolaire"],
    nutrition: {
      calories: 82,
      proteins: 18,
      carbs: 0,
      lipids: 0.7,
      fibers: 0,
      sodium: 54
    },
    preparationTime: 5,
    cookingTime: 15,
    tags: [
      "léger", "neutre", "accessible", "poisson", 
      "quotidien", "sain", "facile", "français"
    ]
  },
  {
    name: "Côte de porc",
    type: "protein",
    proteinCategory: "viande",
    description: "Côte de porc rôtie ou grillée",
    ingredients: [
      { name: "Côte de porc", quantity: 1, unit: "pièce" },
      { name: "Huile d'olive", quantity: 1, unit: "c. à soupe" },
      { name: "Sel", quantity: 1, unit: "pincée" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    preparationSteps: [
      "Préchauffer le four à 180°C",
      "Badigeonner la côte d'huile",
      "Saler et poivrer",
      "Enfourner 25-30 minutes"
    ],
    allergens: [],
    dietaryRestrictions: [],
    textures: ["normale", "tendre"],
    establishmentTypes: ["restaurant"],
    nutrition: {
      calories: 242,
      proteins: 27,
      carbs: 0,
      lipids: 14,
      fibers: 0,
      sodium: 62
    },
    preparationTime: 10,
    cookingTime: 30,
    tags: [
      "classique", "généreux", "viande", "porc", 
      "quotidien", "familial", "français", "moyen"
    ]
  },
  {
    name: "Tofu",
    type: "protein",
    proteinCategory: "vegetarien",
    description: "Tofu poêlé ou grillé",
    ingredients: [
      { name: "Tofu ferme", quantity: 150, unit: "g" },
      { name: "Huile de sésame", quantity: 1, unit: "c. à soupe" },
      { name: "Sauce soja", quantity: 1, unit: "c. à soupe" }
    ],
    preparationSteps: [
      "Égoutter et presser le tofu",
      "Couper en tranches",
      "Mariner dans la sauce soja 15 minutes",
      "Poêler 5-7 minutes par face"
    ],
    allergens: ["soja"],
    dietaryRestrictions: ["végétarien", "vegan"],
    textures: ["normale", "tendre"],
    establishmentTypes: ["restaurant", "cantine_scolaire"],
    nutrition: {
      calories: 144,
      proteins: 15,
      carbs: 3,
      lipids: 8,
      fibers: 2,
      sodium: 10
    },
    preparationTime: 20,
    cookingTime: 10,
    tags: [
      "végétarien", "vegan", "polyvalent", "légumineuse", 
      "quotidien", "sain", "asiatique", "facile"
    ]
  },
  {
    name: "Lentilles vertes",
    type: "protein",
    proteinCategory: "vegetarien",
    description: "Lentilles vertes cuites",
    ingredients: [
      { name: "Lentilles vertes", quantity: 80, unit: "g (sec)" },
      { name: "Eau", quantity: 200, unit: "ml" },
      { name: "Sel", quantity: 1, unit: "pincée" }
    ],
    preparationSteps: [
      "Rincer les lentilles",
      "Faire bouillir l'eau salée",
      "Ajouter les lentilles et cuire 20-25 minutes",
      "Égoutter si nécessaire"
    ],
    allergens: [],
    dietaryRestrictions: ["végétarien", "vegan"],
    textures: ["normale", "tendre"],
    establishmentTypes: ["restaurant", "cantine_scolaire"],
    nutrition: {
      calories: 116,
      proteins: 9,
      carbs: 20,
      lipids: 0.4,
      fibers: 8,
      sodium: 2
    },
    preparationTime: 5,
    cookingTime: 25,
    tags: [
      "végétarien", "vegan", "riche_en_fibres", "légumineuse", 
      "quotidien", "sain", "français", "facile", "économique"
    ]
  },
  {
    name: "Œufs (Omelette)",
    type: "protein",
    proteinCategory: "oeuf",
    description: "Omelette aux herbes",
    ingredients: [
      { name: "Œufs", quantity: 2, unit: "pièces" },
      { name: "Beurre", quantity: 10, unit: "g" },
      { name: "Sel", quantity: 1, unit: "pincée" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    preparationSteps: [
      "Battre les œufs",
      "Saler et poivrer",
      "Faire chauffer le beurre dans une poêle",
      "Verser les œufs et cuire 3-4 minutes"
    ],
    allergens: ["oeufs"],
    dietaryRestrictions: ["végétarien"],
    textures: ["normale", "tendre"],
    establishmentTypes: ["restaurant", "cantine_scolaire"],
    nutrition: {
      calories: 180,
      proteins: 13,
      carbs: 1,
      lipids: 14,
      fibers: 0,
      sodium: 140
    },
    preparationTime: 3,
    cookingTime: 4,
    tags: [
      "rapide", "économique", "végétarien", "oeuf", 
      "quotidien", "facile", "français", "brunch"
    ]
  },
  {
    name: "Saucisse de porc",
    type: "protein",
    proteinCategory: "viande",
    description: "Saucisse de porc grillée ou poêlée",
    ingredients: [
      { name: "Saucisse de porc", quantity: 1, unit: "pièce" },
      { name: "Huile", quantity: 1, unit: "c. à soupe" }
    ],
    preparationSteps: [
      "Piquer la saucisse",
      "Chauffer l'huile dans une poêle",
      "Cuire 15-20 minutes en tournant régulièrement"
    ],
    allergens: [],
    dietaryRestrictions: [],
    textures: ["normale"],
    establishmentTypes: ["restaurant"],
    nutrition: {
      calories: 301,
      proteins: 13,
      carbs: 2,
      lipids: 27,
      fibers: 0,
      sodium: 800
    },
    preparationTime: 5,
    cookingTime: 20,
    tags: [
      "classique", "généreux", "accessible", "viande", "porc", 
      "quotidien", "familial", "français", "facile"
    ]
  },
  {
    name: "Magret de canard",
    type: "protein",
    proteinCategory: "volaille",
    description: "Magret de canard poêlé",
    ingredients: [
      { name: "Magret de canard", quantity: 1, unit: "pièce" },
      { name: "Sel", quantity: 1, unit: "pincée" },
      { name: "Poivre", quantity: 1, unit: "pincée" }
    ],
    preparationSteps: [
      "Inciser la peau en croisillons",
      "Saler et poivrer",
      "Cuire côté peau 6-8 minutes",
      "Retourner et cuire 4-5 minutes"
    ],
    allergens: [],
    dietaryRestrictions: [],
    textures: ["normale"],
    establishmentTypes: ["restaurant"],
    nutrition: {
      calories: 337,
      proteins: 19,
      carbs: 0,
      lipids: 28,
      fibers: 0,
      sodium: 70
    },
    preparationTime: 5,
    cookingTime: 12,
    tags: [
      "raffiné", "gourmand", "volaille", "canard", 
      "festif", "romantique", "français", "moyen"
    ]
  }
];

// Sauces de base
const baseSauces = [
  {
    name: "Sauce aux champignons",
    type: "sauce",
    description: "Sauce crémeuse aux champignons",
    ingredients: [
      { name: "Champignons", quantity: 150, unit: "g" },
      { name: "Crème fraîche", quantity: 100, unit: "ml" },
      { name: "Échalote", quantity: 1, unit: "pièce" },
      { name: "Beurre", quantity: 20, unit: "g" },
      { name: "Vin blanc", quantity: 50, unit: "ml" }
    ],
    preparationSteps: [
      "Émincer les champignons et l'échalote",
      "Faire revenir dans le beurre",
      "Déglacer au vin blanc",
      "Ajouter la crème et laisser réduire"
    ],
    compatibleWith: {
      proteins: [] // Sera rempli après création des protéines
    },
    allergens: ["lactose"],
    dietaryRestrictions: [],
    textures: ["normale", "lisse"],
    establishmentTypes: ["restaurant"],
    nutrition: {
      calories: 180,
      proteins: 3,
      carbs: 5,
      lipids: 15,
      fibers: 2,
      sodium: 200
    },
    preparationTime: 5,
    cookingTime: 15,
    tags: [
      "classique", "crémeuse", "sauce", "champignons", 
      "quotidien", "français", "facile", "gourmand"
    ]
  },
  {
    name: "Sauce tomate",
    type: "sauce",
    description: "Sauce tomate basique",
    ingredients: [
      { name: "Tomates concassées", quantity: 200, unit: "g" },
      { name: "Oignon", quantity: 0.5, unit: "pièce" },
      { name: "Ail", quantity: 1, unit: "gousse" },
      { name: "Huile d'olive", quantity: 1, unit: "c. à soupe" },
      { name: "Herbes de Provence", quantity: 1, unit: "c. à café" }
    ],
    preparationSteps: [
      "Émincer l'oignon et l'ail",
      "Faire revenir dans l'huile",
      "Ajouter les tomates et les herbes",
      "Laisser mijoter 15 minutes"
    ],
    compatibleWith: {
      proteins: []
    },
    allergens: [],
    dietaryRestrictions: ["végétarien", "vegan"],
    textures: ["normale", "lisse"],
    establishmentTypes: ["restaurant", "cantine_scolaire"],
    nutrition: {
      calories: 80,
      proteins: 2,
      carbs: 12,
      lipids: 3,
      fibers: 3,
      sodium: 400
    },
    preparationTime: 5,
    cookingTime: 15,
    tags: [
      "classique", "végétarien", "sauce", "tomate", 
      "quotidien", "italien", "facile", "familial"
    ]
  },
  {
    name: "Beurre citron",
    type: "sauce",
    description: "Beurre au citron",
    ingredients: [
      { name: "Beurre", quantity: 50, unit: "g" },
      { name: "Citron", quantity: 0.5, unit: "pièce" },
      { name: "Persil", quantity: 1, unit: "c. à soupe" }
    ],
    preparationSteps: [
      "Faire fondre le beurre",
      "Ajouter le jus de citron",
      "Ajouter le persil haché"
    ],
    compatibleWith: {
      proteins: []
    },
    allergens: ["lactose"],
    dietaryRestrictions: [],
    textures: ["normale", "lisse"],
    establishmentTypes: ["restaurant"],
    nutrition: {
      calories: 370,
      proteins: 0.5,
      carbs: 2,
      lipids: 40,
      fibers: 0,
      sodium: 5
    },
    preparationTime: 3,
    cookingTime: 5,
    tags: [
      "rapide", "simple", "sauce", "citron", 
      "quotidien", "français", "facile", "léger", "poisson"
    ]
  }
];

// Accompagnements de base
const baseAccompaniments = [
  {
    name: "Riz blanc",
    type: "accompaniment",
    description: "Riz blanc cuit",
    ingredients: [
      { name: "Riz", quantity: 80, unit: "g" },
      { name: "Eau", quantity: 160, unit: "ml" },
      { name: "Sel", quantity: 1, unit: "pincée" }
    ],
    preparationSteps: [
      "Rincer le riz",
      "Faire bouillir l'eau salée",
      "Ajouter le riz et cuire 18 minutes",
      "Laisser reposer 5 minutes"
    ],
    compatibleWith: {
      proteins: []
    },
    allergens: [],
    dietaryRestrictions: ["végétarien", "vegan", "sans_gluten"],
    textures: ["normale"],
    establishmentTypes: ["restaurant", "cantine_scolaire"],
    nutrition: {
      calories: 130,
      proteins: 3,
      carbs: 28,
      lipids: 0,
      fibers: 0.5,
      sodium: 1
    },
    preparationTime: 2,
    cookingTime: 18,
    tags: [
      "classique", "neutre", "accompagnement", "riz", 
      "quotidien", "asiatique", "facile", "végétarien", "vegan"
    ]
  },
  {
    name: "Frites",
    type: "accompaniment",
    description: "Pommes de terre frites",
    ingredients: [
      { name: "Pommes de terre", quantity: 200, unit: "g" },
      { name: "Huile de friture", quantity: 500, unit: "ml" },
      { name: "Sel", quantity: 1, unit: "pincée" }
    ],
    preparationSteps: [
      "Éplucher et couper les pommes de terre",
      "Faire chauffer l'huile à 180°C",
      "Frire 5-7 minutes jusqu'à dorure",
      "Égoutter et saler"
    ],
    compatibleWith: {
      proteins: []
    },
    allergens: [],
    dietaryRestrictions: ["végétarien", "vegan"],
    textures: ["normale"],
    establishmentTypes: ["restaurant", "cantine_scolaire"],
    nutrition: {
      calories: 312,
      proteins: 4,
      carbs: 38,
      lipids: 15,
      fibers: 3,
      sodium: 2
    },
    preparationTime: 10,
    cookingTime: 7,
    tags: [
      "classique", "apprécié", "accompagnement", "frites", 
      "quotidien", "familial", "facile", "végétarien", "vegan"
    ]
  },
  {
    name: "Légumes verts",
    type: "accompaniment",
    description: "Légumes verts cuits à la vapeur",
    ingredients: [
      { name: "Légumes verts (haricots, brocolis)", quantity: 150, unit: "g" },
      { name: "Beurre", quantity: 10, unit: "g" },
      { name: "Sel", quantity: 1, unit: "pincée" }
    ],
    preparationSteps: [
      "Laver les légumes",
      "Cuire à la vapeur 8-10 minutes",
      "Ajouter le beurre et saler"
    ],
    compatibleWith: {
      proteins: []
    },
    allergens: [],
    dietaryRestrictions: ["végétarien", "vegan"],
    textures: ["normale", "tendre"],
    establishmentTypes: ["restaurant", "cantine_scolaire"],
    nutrition: {
      calories: 60,
      proteins: 3,
      carbs: 8,
      lipids: 2,
      fibers: 4,
      sodium: 5
    },
    preparationTime: 5,
    cookingTime: 10,
    tags: [
      "sain", "léger", "accompagnement", "légumes", 
      "quotidien", "français", "facile", "végétarien", "vegan"
    ]
  },
  {
    name: "Compote de pommes",
    type: "accompaniment",
    description: "Compote de pommes maison",
    ingredients: [
      { name: "Pommes", quantity: 200, unit: "g" },
      { name: "Sucre", quantity: 20, unit: "g" },
      { name: "Cannelle", quantity: 1, unit: "pincée" }
    ],
    preparationSteps: [
      "Éplucher et couper les pommes",
      "Cuire à feu doux avec le sucre",
      "Ajouter la cannelle",
      "Mixer si nécessaire"
    ],
    compatibleWith: {
      proteins: []
    },
    allergens: [],
    dietaryRestrictions: ["végétarien", "vegan"],
    textures: ["normale", "lisse"],
    establishmentTypes: ["restaurant", "cantine_scolaire"],
    nutrition: {
      calories: 120,
      proteins: 0.5,
      carbs: 28,
      lipids: 0,
      fibers: 3,
      sodium: 2
    },
    preparationTime: 10,
    cookingTime: 20,
    tags: [
      "sucré", "classique", "accompagnement", "compote", "pommes", 
      "quotidien", "familial", "facile", "végétarien", "vegan", "dessert"
    ]
  }
];

async function seedComponents() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');
    
    // Nettoyer les composants existants (optionnel)
    // await RecipeComponent.deleteMany({});
    // console.log('🗑️  Composants existants supprimés');
    
    // Créer les protéines
    console.log('\n📦 Création des protéines...');
    const createdProteins = [];
    for (const protein of baseProteins) {
      const existing = await RecipeComponent.findOne({ name: protein.name, type: 'protein' });
      if (!existing) {
        const created = await RecipeComponent.create(protein);
        createdProteins.push(created);
        console.log(`  ✅ ${protein.name}`);
      } else {
        createdProteins.push(existing);
        console.log(`  ⏭️  ${protein.name} (déjà existant)`);
      }
    }
    
    // Créer les sauces et les lier aux protéines compatibles
    console.log('\n🍯 Création des sauces...');
    const createdSauces = [];
    for (const sauce of baseSauces) {
      // La plupart des sauces sont compatibles avec toutes les protéines
      // Sauf exceptions (ex: beurre citron surtout pour poissons)
      const compatibleProteins = sauce.name === "Beurre citron" 
        ? createdProteins.filter(p => p.proteinCategory === 'poisson').map(p => p._id)
        : createdProteins.map(p => p._id);
      
      sauce.compatibleWith.proteins = compatibleProteins;
      
      const existing = await RecipeComponent.findOne({ name: sauce.name, type: 'sauce' });
      if (!existing) {
        const created = await RecipeComponent.create(sauce);
        createdSauces.push(created);
        console.log(`  ✅ ${sauce.name}`);
      } else {
        createdSauces.push(existing);
        console.log(`  ⏭️  ${sauce.name} (déjà existant)`);
      }
    }
    
    // Créer les accompagnements et les lier aux protéines
    console.log('\n🥔 Création des accompagnements...');
    for (const accompaniment of baseAccompaniments) {
      // La plupart des accompagnements sont compatibles avec toutes les protéines
      accompaniment.compatibleWith.proteins = createdProteins.map(p => p._id);
      
      const existing = await RecipeComponent.findOne({ name: accompaniment.name, type: 'accompaniment' });
      if (!existing) {
        await RecipeComponent.create(accompaniment);
        console.log(`  ✅ ${accompaniment.name}`);
      } else {
        console.log(`  ⏭️  ${accompaniment.name} (déjà existant)`);
      }
    }
    
    // Mettre à jour les protéines avec leurs compatibilités
    console.log('\n🔗 Mise à jour des compatibilités...');
    for (const protein of createdProteins) {
      const compatibleSauces = createdSauces
        .filter(s => s.compatibleWith.proteins.includes(protein._id))
        .map(s => s._id);
      
      const compatibleAccompaniments = baseAccompaniments.length > 0
        ? (await RecipeComponent.find({ type: 'accompaniment' })).map(a => a._id)
        : [];
      
      protein.compatibleWith.sauces = compatibleSauces;
      protein.compatibleWith.accompaniments = compatibleAccompaniments;
      await protein.save();
      console.log(`  ✅ ${protein.name} - ${compatibleSauces.length} sauces, ${compatibleAccompaniments.length} accompagnements`);
    }
    
    console.log('\n✅ Seed terminé avec succès!');
    console.log(`   - ${createdProteins.length} protéines`);
    console.log(`   - ${createdSauces.length} sauces`);
    console.log(`   - ${baseAccompaniments.length} accompagnements`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  }
}

seedComponents();

