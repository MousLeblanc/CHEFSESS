// scripts/enrich-recipe-tags-auto.js
import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

/**
 * Génère automatiquement les tags pour une recette
 */
function generateTags(recipe) {
    const tags = [];
    
    // Tags basés sur la catégorie
    if (recipe.category === 'soupe') tags.push('#soupe');
    if (recipe.category === 'entrée') tags.push('#entrée');
    if (recipe.category === 'plat') tags.push('#plat');
    if (recipe.category === 'dessert') tags.push('#dessert');
    
    // Tags basés sur la texture
    if (recipe.texture) {
        if (recipe.texture === 'mixée' || recipe.texture === 'mixee') tags.push('#mixée');
        if (recipe.texture === 'hachée' || recipe.texture === 'hachee') tags.push('#hachée');
        if (recipe.texture === 'moulinée' || recipe.texture === 'moulinee') tags.push('#moulinée');
        if (recipe.texture === 'lisse') tags.push('#lisse');
        if (recipe.texture === 'liquide' || recipe.texture === 'boire') tags.push('#liquide');
        if (recipe.texture === 'tendre') tags.push('#tendre');
    }
    
    // Tags basés sur les restrictions alimentaires
    if (recipe.diet && recipe.diet.length > 0) {
        recipe.diet.forEach(d => {
            const dietLower = d.toLowerCase();
            if (dietLower.includes('végétarien') || dietLower.includes('vegetarien')) tags.push('#végétarien');
            if (dietLower.includes('sans_gluten')) tags.push('#sans-gluten');
            if (dietLower.includes('sans_lactose')) tags.push('#sans-lactose');
            if (dietLower.includes('hyperprotéin') || dietLower.includes('hyperprotein') || dietLower.includes('protidique')) {
                tags.push('#hyperprotéiné');
            }
            if (dietLower.includes('riche_en_calcium') || dietLower.includes('calcium')) tags.push('#riche-calcium');
            if (dietLower.includes('sans_sel')) tags.push('#sans-sel');
            if (dietLower.includes('sans_sucre') || dietLower.includes('diabetique')) tags.push('#sans-sucre');
            if (dietLower.includes('halal')) tags.push('#halal');
            if (dietLower.includes('casher') || dietLower.includes('kosher')) tags.push('#casher');
        });
    }
    
    // Tags basés sur les pathologies
    if (recipe.pathologies && recipe.pathologies.length > 0) {
        recipe.pathologies.forEach(p => {
            const pathLower = p.toLowerCase();
            if (pathLower.includes('diabete') || pathLower.includes('diabète')) tags.push('#diabète');
            if (pathLower.includes('hypertension')) tags.push('#hypertension');
            if (pathLower.includes('insuffisance_renale') || pathLower.includes('rénale')) tags.push('#insuffisance-rénale');
            if (pathLower.includes('deglutition') || pathLower.includes('dysphagie')) tags.push('#dysphagie');
        });
    }
    
    // Tags basés sur les nutriments
    if (recipe.nutritionalValues) {
        if (recipe.nutritionalValues.protein >= 15) tags.push('#riche-protéines');
        if (recipe.nutritionalValues.calories >= 400) tags.push('#calorique');
        if (recipe.nutritionalValues.fiber >= 5) tags.push('#riche-fibres');
    }
    
    // Supprimer les doublons
    return [...new Set(tags)];
}

/**
 * Détermine les types d'établissements compatibles
 * Types disponibles : cantine_scolaire, ehpad, hopital, cantine_entreprise
 */
function determineEstablishmentTypes(recipe) {
    const types = [];
    
    // EHPAD : texture adaptée, ageGroup seniors (65+)
    const ageGroupEhpad = !recipe.ageGroup || 
                          !recipe.ageGroup.max || 
                          recipe.ageGroup.max >= 65;
    
    const textureEhpad = !recipe.texture || 
                         ['normale', 'tendre', 'hachée', 'hachee', 'mixée', 'mixee', 'moulinée', 'moulinee', 'lisse'].includes(recipe.texture);
    
    if (ageGroupEhpad && textureEhpad) {
        types.push('ehpad');
    }
    
    // Hôpital : toutes textures, toutes pathologies, tous âges
    types.push('hopital');
    
    // Cantine Scolaire : ageGroup enfants/ados (2.5-18 ans), texture normale ou tendre
    const ageGroupSchool = !recipe.ageGroup || 
                           !recipe.ageGroup.min || 
                           recipe.ageGroup.min <= 18;
    
    const textureSchool = !recipe.texture || 
                          ['normale', 'tendre'].includes(recipe.texture);
    
    const notTooAdvanced = !recipe.tags || 
                           !recipe.tags.some(t => t.includes('#hyperprotéiné') || t.includes('#médicalisé'));
    
    if (ageGroupSchool && textureSchool && notTooAdvanced) {
        types.push('cantine_scolaire');
    }
    
    // Cantine d'Entreprise : adultes actifs, texture normale ou tendre, pas de restrictions médicales
    const ageGroupCompany = !recipe.ageGroup || 
                            (recipe.ageGroup.min <= 18 && (!recipe.ageGroup.max || recipe.ageGroup.max >= 65));
    
    const textureCompany = !recipe.texture || 
                           ['normale', 'tendre'].includes(recipe.texture);
    
    const notMedical = !recipe.pathologies || recipe.pathologies.length === 0;
    
    if (ageGroupCompany && textureCompany && notMedical) {
        types.push('cantine_entreprise');
    }
    
    // Si aucun type n'a été déterminé, ajouter au moins hopital (plus polyvalent)
    if (types.length === 0) {
        types.push('hopital');
    }
    
    return types;
}

async function enrichRecipeTags() {
    try {
        console.log('🔌 Connexion à MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB\n');

        // Récupérer toutes les recettes
        const recipes = await RecipeEnriched.find({});
        console.log(`📊 Total de recettes à enrichir: ${recipes.length}\n`);

        let enrichedCount = 0;
        let unchangedCount = 0;
        const errors = [];

        console.log('🔄 Enrichissement en cours...\n');

        for (const recipe of recipes) {
            try {
                let hasChanges = false;
                const updates = {};

                // Générer les tags si manquants
                if (!recipe.tags || recipe.tags.length === 0) {
                    const generatedTags = generateTags(recipe);
                    if (generatedTags.length > 0) {
                        updates.tags = generatedTags;
                        hasChanges = true;
                    }
                }

                // Générer les establishmentTypes si manquants
                if (!recipe.establishmentTypes || recipe.establishmentTypes.length === 0) {
                    const types = determineEstablishmentTypes(recipe);
                    if (types.length > 0) {
                        updates.establishmentTypes = types;
                        hasChanges = true;
                    }
                }

                // Mettre à jour la recette si nécessaire
                if (hasChanges) {
                    await RecipeEnriched.findByIdAndUpdate(recipe._id, updates);
                    enrichedCount++;
                    
                    if (enrichedCount % 50 === 0) {
                        console.log(`   ✅ ${enrichedCount} recettes enrichies...`);
                    }
                } else {
                    unchangedCount++;
                }

            } catch (error) {
                errors.push({
                    recipe: recipe.name,
                    error: error.message
                });
            }
        }

        console.log('\n═══════════════════════════════════════════════════');
        console.log('📊 RÉSULTAT DE L\'ENRICHISSEMENT');
        console.log('═══════════════════════════════════════════════════\n');
        console.log(`   ✅ Recettes enrichies: ${enrichedCount}`);
        console.log(`   ℹ️  Recettes inchangées: ${unchangedCount}`);
        
        if (errors.length > 0) {
            console.log(`   ❌ Erreurs: ${errors.length}`);
            console.log('\n⚠️  ERREURS:');
            errors.slice(0, 10).forEach(err => {
                console.log(`   - ${err.recipe}: ${err.error}`);
            });
        }

        // Vérification finale
        console.log('\n🔍 Vérification finale...\n');
        const recipesAfter = await RecipeEnriched.find({});
        const withTags = recipesAfter.filter(r => r.tags && r.tags.length > 0).length;
        const withTypes = recipesAfter.filter(r => r.establishmentTypes && r.establishmentTypes.length > 0).length;

        console.log(`   Tags: ${withTags}/${recipesAfter.length} (${(withTags / recipesAfter.length * 100).toFixed(1)}%)`);
        console.log(`   Establishment Types: ${withTypes}/${recipesAfter.length} (${(withTypes / recipesAfter.length * 100).toFixed(1)}%)`);

        // Exemples de recettes enrichies
        console.log('\n✨ EXEMPLES DE RECETTES ENRICHIES:\n');
        const samples = await RecipeEnriched.find({
            tags: { $exists: true, $ne: [] },
            establishmentTypes: { $exists: true, $ne: [] }
        }).limit(5);

        samples.forEach((recipe, index) => {
            console.log(`${index + 1}. "${recipe.name}"`);
            console.log(`   Tags: ${recipe.tags.join(', ')}`);
            console.log(`   Établissements: ${recipe.establishmentTypes.join(', ')}`);
            console.log(`   Texture: ${recipe.texture || 'normale'}`);
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════\n');

        await mongoose.connection.close();
        console.log('✅ Connexion fermée');

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

// Exécution
enrichRecipeTags();

