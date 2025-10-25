import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Mapping de normalisation
const DIET_NORMALIZATION = {
  'vegetarien': 'végétarien',
  'vegetalien': 'végétalien',
  'sans sel ajouté': 'sans_sel',
  'sans sel': 'sans_sel',
  'sans gluten': 'sans_gluten',
  'sans lactose': 'sans_lactose',
  'hyperprotéiné': 'hyperproteine',
  'hypocalorique': 'hypocalorique',
  'enrichi': 'enrichi',
  'pauvre_en_sucre': 'pauvre_en_sucre',
  'pauvre_en_graisse': 'pauvre_en_graisse',
  'riche_en_calcium': 'riche_en_calcium',
  'hypolipidique': 'hypolipidique'
};

const TEXTURE_NORMALIZATION = {
  'hachee': 'hachée',
  'mixee': 'mixée',
  'moulinee': 'moulinée'
};

// Détection intelligente des restrictions alimentaires
function detectDietaryRestrictions(recipe) {
  const restrictions = [];
  const name = (recipe.name || '').toLowerCase();
  const ingredients = (recipe.ingredients || []).map(ing => (ing.name || ing.item || '').toLowerCase()).join(' ');
  const diet = (recipe.diet || []).map(d => d.toLowerCase());
  const description = (recipe.description || '').toLowerCase();
  
  const allText = `${name} ${ingredients} ${description}`;

  // Sans sel / Hyposodé
  if (diet.includes('sans_sel') || diet.includes('sans sel') || diet.includes('sans sel ajouté') || 
      allText.includes('sans sel') || allText.includes('hyposodé')) {
    restrictions.push('hyposode');
  }

  // Végétarien
  if (diet.includes('végétarien') || diet.includes('vegetarien') ||
      (!allText.includes('poulet') && !allText.includes('viande') && !allText.includes('porc') && 
       !allText.includes('boeuf') && !allText.includes('poisson') && !allText.includes('saumon') &&
       !allText.includes('thon') && !allText.includes('jambon'))) {
    // Vérifier s'il y a des produits laitiers ou œufs
    if (allText.includes('fromage') || allText.includes('lait') || allText.includes('œuf') || 
        allText.includes('beurre') || allText.includes('crème')) {
      restrictions.push('végétarien'); // Lacto-ovo-végétarien
    }
  }

  // Végétalien / Vegan
  if (diet.includes('vegan') || diet.includes('végétalien') || diet.includes('vegetalien')) {
    restrictions.push('végétalien');
    restrictions.push('végétarien'); // Un plat végétalien est aussi végétarien
  }

  // Sans gluten
  if (diet.includes('sans_gluten') || diet.includes('sans gluten') || 
      allText.includes('sans gluten') || allText.includes('gluten-free')) {
    restrictions.push('sans_gluten');
  }

  // Sans lactose
  if (diet.includes('sans_lactose') || diet.includes('sans lactose') || 
      allText.includes('sans lactose') || allText.includes('lactose-free')) {
    restrictions.push('sans_lactose');
  }

  // Halal (par défaut OK si pas de porc/alcool)
  if (!allText.includes('porc') && !allText.includes('jambon') && 
      !allText.includes('lard') && !allText.includes('vin') && !allText.includes('alcool')) {
    restrictions.push('halal');
  }

  // Casher (similaire à halal + restrictions supplémentaires)
  if (!allText.includes('porc') && !allText.includes('fruits de mer') && 
      !allText.includes('crustacé') && !allText.includes('crevette')) {
    restrictions.push('casher');
  }

  // Hyperprotéiné
  if (diet.includes('hyperprotéiné') || diet.includes('hyperproteine') || diet.includes('enrichi') ||
      allText.includes('hyperprotéiné') || allText.includes('enrichi en protéines')) {
    restrictions.push('hyperproteine');
  }

  // Hypocalorique
  if (diet.includes('hypocalorique') || allText.includes('hypocalorique') || 
      allText.includes('light') || allText.includes('léger')) {
    restrictions.push('hypocalorique');
  }

  return [...new Set(restrictions)]; // Dédupliquer
}

// Générer des tags pertinents
function generateTags(recipe) {
  const tags = [];
  const name = (recipe.name || '').toLowerCase();
  const establishmentTypes = recipe.establishmentTypes || [];
  const texture = recipe.texture || 'normale';
  const diet = (recipe.diet || []).map(d => d.toLowerCase());

  // Tags d'établissement
  if (establishmentTypes.includes('ehpad')) tags.push('#ehpad');
  if (establishmentTypes.includes('hopital')) tags.push('#hopital');
  if (establishmentTypes.includes('cantine_scolaire')) tags.push('#cantine_scolaire');
  if (establishmentTypes.includes('cantine_entreprise')) tags.push('#cantine_entreprise');

  // Tags de texture
  if (texture === 'mixée') tags.push('#mixée');
  if (texture === 'hachée') tags.push('#hachée');
  if (texture === 'lisse') tags.push('#lisse');
  if (texture === 'moelleuse') tags.push('#moelleuse');
  if (texture === 'tendre') tags.push('#tendre');

  // Tags diététiques
  if (diet.includes('hyperprotéiné') || diet.includes('hyperproteine') || diet.includes('enrichi')) {
    tags.push('#hyperprotéiné');
  }
  if (diet.includes('végétarien') || diet.includes('vegetarien')) {
    tags.push('#végétarien');
  }
  if (diet.includes('vegan') || diet.includes('végétalien')) {
    tags.push('#végétalien');
  }
  if (diet.includes('sans_sel') || diet.includes('sans sel')) {
    tags.push('#sans_sel');
  }
  if (diet.includes('sans_gluten') || diet.includes('sans gluten')) {
    tags.push('#sans_gluten');
  }

  // Tags par catégorie
  if (name.includes('soupe') || name.includes('velouté') || name.includes('potage')) {
    tags.push('#soupe');
  }
  if (name.includes('gratin')) tags.push('#gratin');
  if (name.includes('purée')) tags.push('#purée');
  if (name.includes('compote')) tags.push('#compote');

  // Tags pour seniors
  if (establishmentTypes.includes('ehpad')) {
    tags.push('#senior');
    tags.push('#facile_à_mâcher');
  }

  return [...new Set(tags)]; // Dédupliquer
}

async function enrichDietProductionDB() {
  try {
    // Connexion directe à MongoDB Production (Render)
    const productionURI = process.env.MONGODB_URI;
    if (!productionURI || !productionURI.includes('mongodb')) {
      throw new Error('MONGODB_URI de production non trouvée dans .env');
    }

    console.log('🔗 Connexion à MongoDB Production...');
    await mongoose.connect(productionURI);
    console.log('✅ Connecté à MongoDB Production\n');

    // Utiliser le schéma flexible pour éviter les problèmes de validation
    const RecipeEnriched = mongoose.model('RecipeEnriched', new mongoose.Schema({}, { strict: false }));

    const recipes = await RecipeEnriched.find({});
    console.log(`📊 ${recipes.length} recettes à enrichir\n`);

    let enrichedCount = 0;
    let normalizedCount = 0;

    for (const recipe of recipes) {
      let updateFields = {};

      // 0. Normaliser la texture
      if (recipe.texture) {
        const normalizedTexture = TEXTURE_NORMALIZATION[recipe.texture.toLowerCase()] || recipe.texture;
        if (normalizedTexture !== recipe.texture) {
          updateFields.texture = normalizedTexture;
          normalizedCount++;
        }
      }

      // 1. Normaliser le champ 'diet'
      if (recipe.diet && recipe.diet.length > 0) {
        const normalizedDiet = [...new Set(recipe.diet.map(d => {
          const normalized = DIET_NORMALIZATION[d.toLowerCase()] || d.toLowerCase();
          if (normalized !== d) {
            normalizedCount++;
          }
          return normalized;
        }))];
        updateFields.diet = normalizedDiet;
      }

      // 2. Enrichir 'dietaryRestrictions'
      const detectedRestrictions = detectDietaryRestrictions(recipe);
      if (detectedRestrictions.length > 0) {
        updateFields.dietaryRestrictions = detectedRestrictions;
      }

      // 3. Enrichir 'tags'
      const generatedTags = generateTags(recipe);
      if (generatedTags.length > 0) {
        updateFields.tags = generatedTags;
      }

      // Sauvegarder avec updateOne pour éviter les problèmes de validation
      if (Object.keys(updateFields).length > 0) {
        await RecipeEnriched.updateOne({ _id: recipe._id }, { $set: updateFields });
        enrichedCount++;
        
        if (enrichedCount <= 5) {
          console.log(`✅ ${recipe.name}`);
          console.log(`   dietaryRestrictions: ${JSON.stringify(updateFields.dietaryRestrictions || recipe.dietaryRestrictions)}`);
          console.log(`   tags: ${JSON.stringify(updateFields.tags || recipe.tags)}`);
          console.log();
        }
      }
    }

    console.log(`\n🎉 Enrichissement PRODUCTION terminé !`);
    console.log(`   Recettes enrichies: ${enrichedCount}`);
    console.log(`   Valeurs normalisées: ${normalizedCount}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

enrichDietProductionDB();

