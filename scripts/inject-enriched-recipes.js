// scripts/inject-enriched-recipes.js
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

import mongoose from 'mongoose';
import Recipe from '../recipe.model.js';

// Importer les recettes enrichies depuis le fichier client/js/recipes_enriched_full.js
import recipesData from '../client/js/recipes_enriched_full.js';

// Fonction pour mapper les types d'âge
function mapAgeGroup(types) {
  if (!types || !Array.isArray(types)) return '2.5-18';
  
  if (types.includes('enfants')) {
    return '2.5-12';
  } else if (types.includes('adultes')) {
    return '12-18';
  } else if (types.includes('seniors')) {
    return '18+';
  }
  
  return '2.5-18'; // Par défaut
}

// Fonction pour mapper les régimes alimentaires
function mapDietaryRestrictions(diet) {
  if (!diet || !Array.isArray(diet)) return [];
  
  const restrictions = [];
  
  diet.forEach(d => {
    switch (d.toLowerCase()) {
      case 'omnivore':
        // Omnivore n'ajoute pas de restriction
        break;
      case 'vegetarien':
        restrictions.push('vegetarien');
        break;
      case 'vegetalien':
      case 'vegan':
        restrictions.push('vegan');
        break;
      case 'sans_gluten':
        restrictions.push('sans_gluten');
        break;
      case 'sans_lactose':
        restrictions.push('sans_lactose');
        break;
      case 'halal':
        restrictions.push('halal');
        break;
      case 'casher':
        restrictions.push('casher');
        break;
    }
  });
  
  return restrictions;
}

// Fonction pour mapper les pathologies
function mapMedicalConditions(pathologies) {
  if (!pathologies || !Array.isArray(pathologies)) return [];
  
  const conditions = [];
  
  pathologies.forEach(p => {
    switch (p.toLowerCase()) {
      case 'aucune':
        // Aucune pathologie
        break;
      case 'intolérance lactose':
        conditions.push('maladie_coeliaque'); // Proche concept
        break;
      case 'diabète':
        conditions.push('diabete');
        break;
      case 'hypertension':
        conditions.push('hypertension');
        break;
      case 'cholestérol':
        conditions.push('cholesterol');
        break;
      case 'dysphagie':
        conditions.push('dysphagie');
        break;
      case 'texture_modifiee':
        conditions.push('texture_modifiee');
        break;
    }
  });
  
  return conditions;
}

// Fonction pour mapper les allergènes
function mapAllergens(allergens) {
  if (!allergens || !Array.isArray(allergens)) return [];
  
  const mappedAllergens = [];
  
  allergens.forEach(a => {
    switch (a.toLowerCase()) {
      case 'gluten':
        mappedAllergens.push('gluten');
        break;
      case 'œufs':
      case 'oeufs':
        mappedAllergens.push('oeufs');
        break;
      case 'lait':
      case 'lactose':
        mappedAllergens.push('lactose');
        break;
      case 'arachides':
        mappedAllergens.push('arachides');
        break;
      case 'fruits à coque':
      case 'fruits_a_coque':
        mappedAllergens.push('fruits_a_coque');
        break;
      case 'soja':
        mappedAllergens.push('soja');
        break;
      case 'poisson':
        mappedAllergens.push('poisson');
        break;
      case 'crustacés':
      case 'crustaces':
        mappedAllergens.push('crustaces');
        break;
      case 'mollusques':
        mappedAllergens.push('mollusques');
        break;
      case 'céleri':
      case 'celeri':
        mappedAllergens.push('celeri');
        break;
      case 'moutarde':
        mappedAllergens.push('moutarde');
        break;
      case 'sésame':
      case 'sesame':
        mappedAllergens.push('sesame');
        break;
      case 'sulfites':
        mappedAllergens.push('sulfites');
        break;
      case 'lupin':
        mappedAllergens.push('lupin');
        break;
    }
  });
  
  return mappedAllergens;
}

// Fonction pour détecter le composant du repas à partir des tags
function detectMealComponent(tags, name) {
  if (!tags || !Array.isArray(tags)) return 'plat_complet';
  
  const tagString = tags.join(' ').toLowerCase();
  const nameLower = (name || '').toLowerCase();
  
  // Soupe
  if (tagString.includes('soupe') || nameLower.includes('soupe') || 
      nameLower.includes('velouté') || nameLower.includes('potage') || 
      nameLower.includes('bouillon')) {
    return 'soupe';
  }
  
  // Entrée
  if (tagString.includes('entrée') || tagString.includes('entree') || 
      (tagString.includes('salade') && !tagString.includes('composée'))) {
    return 'entree';
  }
  
  // Dessert
  if (tagString.includes('dessert') || nameLower.includes('compote') || 
      nameLower.includes('yaourt') || nameLower.includes('crème') || 
      nameLower.includes('gâteau') || nameLower.includes('tarte') || 
      nameLower.includes('flan') || nameLower.includes('sorbet') || 
      nameLower.includes('glace')) {
    return 'dessert';
  }
  
  // Féculent seul
  if (tagString.includes('féculent') || tagString.includes('feculent') ||
      nameLower.includes('riz') || nameLower.includes('pâtes') || 
      nameLower.includes('semoule') || nameLower.includes('purée') || 
      nameLower.includes('polenta')) {
    return 'feculent';
  }
  
  // Protéine
  if (tagString.includes('protéine') || tagString.includes('proteine') ||
      tagString.includes('viande') || tagString.includes('poisson') || 
      tagString.includes('volaille') || tagString.includes('poulet') || 
      tagString.includes('dinde') || tagString.includes('bœuf') || 
      tagString.includes('porc') || tagString.includes('agneau')) {
    return 'proteine';
  }
  
  // Légumes
  if (tagString.includes('légumes') || tagString.includes('legumes') ||
      tagString.includes('ratatouille') || nameLower.includes('courgette') || 
      nameLower.includes('aubergine') || nameLower.includes('carotte') || 
      nameLower.includes('haricot') || nameLower.includes('brocoli') || 
      nameLower.includes('chou-fleur') || nameLower.includes('épinard')) {
    return 'legumes';
  }
  
  return 'plat_complet';
}

// Fonction pour normaliser une recette enrichie
function normalizeEnrichedRecipe(recipe) {
  console.log(`🔄 Normalisation de la recette: ${recipe.name}`);
  
  const normalizedRecipe = {
    title: recipe.name,
    description: `Délicieuse recette de ${recipe.name.toLowerCase()}`,
    ageGroup: mapAgeGroup(recipe.type),
    type: recipe.diet && recipe.diet.length > 0 ? recipe.diet[0] : 'omnivore',
    mainIngredient: 'divers',
    servings: recipe.servings || 4,
    ingredients: recipe.ingredients || [],
    instructions: recipe.steps || [],
    category: recipe.diet && recipe.diet.length > 0 ? recipe.diet[0] : 'omnivore',
    nutrition: {
      calories: recipe.calories || 0,
      proteins: recipe.proteins || 0,
      carbs: recipe.carbs || 0,
      fats: recipe.lipids || 0
    },
    allergens: mapAllergens(recipe.allergens),
    dietaryRestrictions: mapDietaryRestrictions(recipe.diet),
    medicalConditions: mapMedicalConditions(recipe.pathologies),
    texture: recipe.texture || 'normale',
    mealComponent: detectMealComponent(recipe.tags, recipe.name),
    tags: recipe.tags || [],
    originalId: recipe.id
  };
  
  return normalizedRecipe;
}

// Fonction principale d'injection
async function injectEnrichedRecipes() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    console.log('🗑️  Suppression des anciennes recettes...');
    await Recipe.deleteMany({});
    console.log('✅ Anciennes recettes supprimées');
    
    console.log(`📝 Injection de ${recipesData.length} recettes enrichies...`);
    const normalizedRecipes = recipesData.map(normalizeEnrichedRecipe);
    
    const insertedRecipes = await Recipe.insertMany(normalizedRecipes);
    console.log(`✅ ${insertedRecipes.length} recettes enrichies injectées avec succès!`);
    
    // Afficher des statistiques détaillées
    const stats = {
      total: insertedRecipes.length,
      parCategorie: {},
      parTrancheAge: {},
      parTexture: {},
      parComposant: {},
      allergenes: {},
      restrictions: {},
      pathologies: {}
    };
    
    insertedRecipes.forEach(recipe => {
      // Par catégorie
      stats.parCategorie[recipe.category] = (stats.parCategorie[recipe.category] || 0) + 1;
      
      // Par tranche d'âge
      stats.parTrancheAge[recipe.ageGroup] = (stats.parTrancheAge[recipe.ageGroup] || 0) + 1;
      
      // Par texture
      stats.parTexture[recipe.texture] = (stats.parTexture[recipe.texture] || 0) + 1;
      
      // Par composant de repas
      stats.parComposant[recipe.mealComponent] = (stats.parComposant[recipe.mealComponent] || 0) + 1;
      
      // Allergènes
      recipe.allergens.forEach(allergen => {
        stats.allergenes[allergen] = (stats.allergenes[allergen] || 0) + 1;
      });
      
      // Restrictions alimentaires
      recipe.dietaryRestrictions.forEach(restriction => {
        stats.restrictions[restriction] = (stats.restrictions[restriction] || 0) + 1;
      });
      
      // Pathologies
      recipe.medicalConditions.forEach(pathology => {
        stats.pathologies[pathology] = (stats.pathologies[pathology] || 0) + 1;
      });
    });
    
    console.log('\n📊 Statistiques détaillées:');
    console.log('Par catégorie:', stats.parCategorie);
    console.log('Par tranche d\'âge:', stats.parTrancheAge);
    console.log('Par texture:', stats.parTexture);
    console.log('Par composant de repas:', stats.parComposant);
    console.log('Allergènes les plus fréquents:', Object.entries(stats.allergenes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {}));
    console.log('Restrictions alimentaires:', stats.restrictions);
    console.log('Pathologies supportées:', stats.pathologies);
    
    console.log('\n🎉 Injection des recettes enrichies terminée avec succès!');
    console.log('🚀 Votre application dispose maintenant de 400 recettes avec filtrage avancé!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'injection des recettes enrichies:', error);
    process.exit(1);
  }
}

// Exécuter l'injection
injectEnrichedRecipes();
