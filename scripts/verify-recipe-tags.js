// scripts/verify-recipe-tags.js
import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function verifyRecipeTags() {
    try {
        console.log('🔌 Connexion à MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connecté à MongoDB\n');

        // Récupérer toutes les recettes
        const recipes = await RecipeEnriched.find({});
        console.log(`📊 Total de recettes: ${recipes.length}\n`);

        // Statistiques
        const stats = {
            total: recipes.length,
            withTags: 0,
            withoutTags: 0,
            withTexture: 0,
            withoutTexture: 0,
            withAgeGroup: 0,
            withoutAgeGroup: 0,
            withDiet: 0,
            withoutDiet: 0,
            withPathologies: 0,
            withoutPathologies: 0,
            byCategory: {},
            byTexture: {},
            byEstablishment: {
                cantine_scolaire: 0,
                ehpad: 0,
                hopital: 0,
                cantine_entreprise: 0
            }
        };

        const missingTagsRecipes = [];
        const wellTaggedRecipes = [];

        recipes.forEach(recipe => {
            // Tags
            if (recipe.tags && recipe.tags.length > 0) {
                stats.withTags++;
            } else {
                stats.withoutTags++;
            }

            // Texture
            if (recipe.texture && recipe.texture !== 'normale') {
                stats.withTexture++;
                stats.byTexture[recipe.texture] = (stats.byTexture[recipe.texture] || 0) + 1;
            } else {
                stats.withoutTexture++;
            }

            // Age Group
            if (recipe.ageGroup && (recipe.ageGroup.min || recipe.ageGroup.max)) {
                stats.withAgeGroup++;
            } else {
                stats.withoutAgeGroup++;
            }

            // Diet (restrictions alimentaires)
            if (recipe.diet && recipe.diet.length > 0) {
                stats.withDiet++;
            } else {
                stats.withoutDiet++;
            }

            // Pathologies
            if (recipe.pathologies && recipe.pathologies.length > 0) {
                stats.withPathologies++;
            } else {
                stats.withoutPathologies++;
            }

            // Par catégorie
            const cat = recipe.category || 'unknown';
            stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;

            // Par établissement
            if (recipe.establishmentTypes) {
                recipe.establishmentTypes.forEach(type => {
                    if (stats.byEstablishment.hasOwnProperty(type)) {
                        stats.byEstablishment[type]++;
                    }
                });
            }

            // Vérifier si la recette est "bien taggée"
            const isWellTagged = 
                recipe.tags && recipe.tags.length > 0 &&
                recipe.texture &&
                recipe.category &&
                recipe.establishmentTypes && recipe.establishmentTypes.length > 0;

            if (!isWellTagged) {
                missingTagsRecipes.push({
                    name: recipe.name,
                    category: recipe.category || 'N/A',
                    tags: recipe.tags || [],
                    texture: recipe.texture || 'N/A',
                    establishmentTypes: recipe.establishmentTypes || [],
                    ageGroup: recipe.ageGroup || null,
                    diet: recipe.diet || [],
                    pathologies: recipe.pathologies || []
                });
            } else {
                wellTaggedRecipes.push(recipe.name);
            }
        });

        // Affichage des résultats
        console.log('═══════════════════════════════════════════════════');
        console.log('📊 RAPPORT D\'ANALYSE DES TAGS DE RECETTES');
        console.log('═══════════════════════════════════════════════════\n');

        console.log('📈 STATISTIQUES GLOBALES:');
        console.log(`   Total recettes: ${stats.total}`);
        console.log(`   ✅ Bien taggées: ${wellTaggedRecipes.length}`);
        console.log(`   ⚠️  Manque tags: ${missingTagsRecipes.length}`);
        console.log('');

        console.log('🏷️  TAGS:');
        console.log(`   ✅ Avec tags: ${stats.withTags} (${(stats.withTags / stats.total * 100).toFixed(1)}%)`);
        console.log(`   ❌ Sans tags: ${stats.withoutTags} (${(stats.withoutTags / stats.total * 100).toFixed(1)}%)`);
        console.log('');

        console.log('🥄 TEXTURES:');
        console.log(`   ✅ Avec texture spécifique: ${stats.withTexture}`);
        console.log(`   ℹ️  Texture normale: ${stats.withoutTexture}`);
        Object.entries(stats.byTexture).forEach(([texture, count]) => {
            console.log(`      - ${texture}: ${count}`);
        });
        console.log('');

        console.log('👥 GROUPES D\'ÂGE:');
        console.log(`   ✅ Avec ageGroup: ${stats.withAgeGroup}`);
        console.log(`   ❌ Sans ageGroup: ${stats.withoutAgeGroup}`);
        console.log('');

        console.log('🍽️  RESTRICTIONS ALIMENTAIRES:');
        console.log(`   ✅ Avec diet: ${stats.withDiet}`);
        console.log(`   ❌ Sans diet: ${stats.withoutDiet}`);
        console.log('');

        console.log('🏥 PATHOLOGIES:');
        console.log(`   ✅ Avec pathologies: ${stats.withPathologies}`);
        console.log(`   ❌ Sans pathologies: ${stats.withoutPathologies}`);
        console.log('');

        console.log('📂 PAR CATÉGORIE:');
        Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
            console.log(`   ${cat}: ${count}`);
        });
        console.log('');

        console.log('🏢 PAR ÉTABLISSEMENT:');
        Object.entries(stats.byEstablishment).forEach(([type, count]) => {
            console.log(`   ${type}: ${count}`);
        });
        console.log('');

        if (missingTagsRecipes.length > 0) {
            console.log('⚠️  RECETTES AVEC TAGS MANQUANTS (20 premières):');
            console.log('═══════════════════════════════════════════════════\n');
            
            missingTagsRecipes.slice(0, 20).forEach((recipe, index) => {
                console.log(`${index + 1}. "${recipe.name}"`);
                console.log(`   Catégorie: ${recipe.category}`);
                console.log(`   Tags: ${recipe.tags.length > 0 ? recipe.tags.join(', ') : '❌ AUCUN'}`);
                console.log(`   Texture: ${recipe.texture}`);
                console.log(`   Établissements: ${recipe.establishmentTypes.length > 0 ? recipe.establishmentTypes.join(', ') : '❌ AUCUN'}`);
                console.log(`   Age Group: ${recipe.ageGroup ? `${recipe.ageGroup.min}-${recipe.ageGroup.max}` : '❌ AUCUN'}`);
                console.log(`   Diet: ${recipe.diet.length > 0 ? recipe.diet.join(', ') : 'Aucune'}`);
                console.log(`   Pathologies: ${recipe.pathologies.length > 0 ? recipe.pathologies.join(', ') : 'Aucune'}`);
                console.log('');
            });

            if (missingTagsRecipes.length > 20) {
                console.log(`   ... et ${missingTagsRecipes.length - 20} autres recettes\n`);
            }
        }

        // Exemples de recettes bien taggées
        console.log('✅ EXEMPLES DE RECETTES BIEN TAGGÉES (5 premières):');
        console.log('═══════════════════════════════════════════════════\n');
        
        const samplesWithDetails = await RecipeEnriched.find({
            _id: { $in: recipes.filter(r => 
                r.tags && r.tags.length > 0 &&
                r.texture &&
                r.establishmentTypes && r.establishmentTypes.length > 0
            ).slice(0, 5).map(r => r._id) }
        });

        samplesWithDetails.forEach((recipe, index) => {
            console.log(`${index + 1}. "${recipe.name}"`);
            console.log(`   Tags: ${recipe.tags.join(', ')}`);
            console.log(`   Texture: ${recipe.texture}`);
            console.log(`   Catégorie: ${recipe.category}`);
            console.log(`   Établissements: ${recipe.establishmentTypes.join(', ')}`);
            if (recipe.ageGroup && (recipe.ageGroup.min || recipe.ageGroup.max)) {
                console.log(`   Age Group: ${recipe.ageGroup.min || 0}-${recipe.ageGroup.max || '99'} ans`);
            }
            if (recipe.diet && recipe.diet.length > 0) {
                console.log(`   Diet: ${recipe.diet.join(', ')}`);
            }
            if (recipe.pathologies && recipe.pathologies.length > 0) {
                console.log(`   Pathologies: ${recipe.pathologies.join(', ')}`);
            }
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════');
        console.log('📋 RÉSUMÉ:');
        console.log(`   ${wellTaggedRecipes.length}/${stats.total} recettes bien taggées (${(wellTaggedRecipes.length / stats.total * 100).toFixed(1)}%)`);
        
        if (missingTagsRecipes.length > 0) {
            console.log(`   ⚠️  ${missingTagsRecipes.length} recettes nécessitent des améliorations`);
        } else {
            console.log('   ✅ Toutes les recettes sont correctement taggées !');
        }
        console.log('═══════════════════════════════════════════════════\n');

        await mongoose.connection.close();
        console.log('✅ Connexion fermée');

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

// Exécution
verifyRecipeTags();

