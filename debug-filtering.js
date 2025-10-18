// debug-filtering.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Recipe from './recipe.model.js';

dotenv.config();

async function debugFiltering() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Test des filtres exacts du test
    const testFilters = {
      establishmentType: 'maison_retraite',
      ageGroups: [
        {
          ageRange: 'adulte',
          count: 25,
          menuStructure: 'entree_plat',
          texture: 'normale',
          medicalConditions: [
            { type: 'diabete', count: 5 },
            { type: 'hypertension', count: 8 }
          ],
          allergens: [
            { type: 'lactose', count: 3 }
          ],
          dietaryRestrictions: [
            { type: 'sans_sel', count: 12 },
            { type: 'riche_en_calcium', count: 18 }
          ]
        }
      ],
      numDishes: 2,
      allergens: ['lactose'],
      dietaryRestrictions: ['sans_sel', 'riche_en_calcium'],
      medicalConditions: ['diabete', 'hypertension'],
      texture: 'normale',
      useStockOnly: false
    };

    console.log('🧪 Test des filtres:');
    console.log('📤 Filtres appliqués:', JSON.stringify(testFilters, null, 2));

    // 1. Test du filtre de base (allergènes exclus)
    const baseFilter = {
      allergens: { $nin: testFilters.allergens }
    };
    const baseCount = await Recipe.countDocuments(baseFilter);
    console.log(`\n1️⃣ Filtre de base (sans lactose): ${baseCount} recettes`);

    // 2. Test avec restrictions alimentaires
    const dietaryFilter = {
      ...baseFilter,
      dietaryRestrictions: { $in: testFilters.dietaryRestrictions }
    };
    const dietaryCount = await Recipe.countDocuments(dietaryFilter);
    console.log(`2️⃣ + Restrictions alimentaires (sans_sel, riche_en_calcium): ${dietaryCount} recettes`);

    // 3. Test avec conditions médicales
    const medicalFilter = {
      ...baseFilter,
      medicalConditions: { $in: testFilters.medicalConditions }
    };
    const medicalCount = await Recipe.countDocuments(medicalFilter);
    console.log(`3️⃣ + Conditions médicales (diabete, hypertension): ${medicalCount} recettes`);

    // 4. Test avec texture
    const textureFilter = {
      ...baseFilter,
      texture: testFilters.texture
    };
    const textureCount = await Recipe.countDocuments(textureFilter);
    console.log(`4️⃣ + Texture (normale): ${textureCount} recettes`);

    // 5. Test combiné (comme dans le contrôleur)
    const combinedFilter = {
      allergens: { $nin: testFilters.allergens },
      dietaryRestrictions: { $in: testFilters.dietaryRestrictions },
      medicalConditions: { $in: testFilters.medicalConditions },
      texture: testFilters.texture
    };
    const combinedCount = await Recipe.countDocuments(combinedFilter);
    console.log(`5️⃣ Filtre combiné: ${combinedCount} recettes`);

    // 6. Test avec OR au lieu de AND pour les restrictions
    const orFilter = {
      allergens: { $nin: testFilters.allergens },
      $or: [
        { dietaryRestrictions: { $in: testFilters.dietaryRestrictions } },
        { medicalConditions: { $in: testFilters.medicalConditions } }
      ],
      texture: testFilters.texture
    };
    const orCount = await Recipe.countDocuments(orFilter);
    console.log(`6️⃣ Filtre OR (plus permissif): ${orCount} recettes`);

    // 7. Test sans texture
    const noTextureFilter = {
      allergens: { $nin: testFilters.allergens },
      dietaryRestrictions: { $in: testFilters.dietaryRestrictions },
      medicalConditions: { $in: testFilters.medicalConditions }
    };
    const noTextureCount = await Recipe.countDocuments(noTextureFilter);
    console.log(`7️⃣ Sans filtre texture: ${noTextureCount} recettes`);

    // 8. Afficher quelques exemples de recettes compatibles
    console.log('\n📋 Exemples de recettes compatibles (filtre OR):');
    const examples = await Recipe.find(orFilter).limit(5);
    examples.forEach((recipe, index) => {
      console.log(`  ${index + 1}. ${recipe.title}`);
      console.log(`     - Allergènes: ${recipe.allergens.join(', ') || 'aucun'}`);
      console.log(`     - Restrictions: ${recipe.dietaryRestrictions.join(', ') || 'aucune'}`);
      console.log(`     - Conditions médicales: ${recipe.medicalConditions.join(', ') || 'aucune'}`);
      console.log(`     - Texture: ${recipe.texture}`);
    });

    // 9. Test de la logique du contrôleur (filtrage par âge)
    console.log('\n🔍 Test du filtrage par âge:');
    const majorityAgeGroup = 'adulte';
    const ageFilteredRecipes = await Recipe.find(orFilter);
    console.log(`Recettes avant filtrage par âge: ${ageFilteredRecipes.length}`);
    
    // Simuler le filtrage par âge (logique du contrôleur)
    const ageCompatibleRecipes = ageFilteredRecipes.filter(recipe => {
      const ageGroup = recipe.ageGroup;
      return ageGroup === '18+' || ageGroup === 'adulte' || ageGroup === '2.5-18';
    });
    console.log(`Recettes après filtrage par âge: ${ageCompatibleRecipes.length}`);

    // 10. Test du filtrage pour seniors
    console.log('\n👴 Test du filtrage pour seniors:');
    const seniorCompatibleRecipes = ageCompatibleRecipes.filter(recipe => {
      const title = (recipe.title || '').toLowerCase();
      const description = (recipe.description || '').toLowerCase();
      const fullText = `${title} ${description}`;
      
      const excludedKeywords = [
        'bowl', 'buddha', 'poke', 'wrap', 'burger', 'hot dog', 'tacos', 'burrito',
        'street', 'fast', 'fusion', 'hipster', 'trendy', 'smoothie bowl',
        'açaí', 'bagel', 'donut', 'pancake', 'waffle', 'cookie', 'cupcake',
        'pulled', 'smash', 'crispy', 'crunchy', 'chips', 'nachos', 'quesadilla',
        'sushi', 'maki', 'california', 'spring roll', 'nems', 'samosa'
      ];
      
      const hasExcludedWord = excludedKeywords.some(keyword => 
        fullText.includes(keyword.toLowerCase())
      );
      
      return !hasExcludedWord;
    });
    console.log(`Recettes après filtrage seniors: ${seniorCompatibleRecipes.length}`);

    console.log('\n🎯 Conclusion:');
    if (seniorCompatibleRecipes.length >= 2) {
      console.log('✅ Assez de recettes compatibles trouvées !');
      console.log('Le problème pourrait être dans la logique de filtrage du contrôleur.');
    } else {
      console.log('❌ Pas assez de recettes compatibles.');
      console.log('Il faut ajouter plus de recettes ou ajuster les filtres.');
    }

  } catch (error) {
    console.error('❌ Erreur lors du débogage:', error);
  } finally {
    await mongoose.connection.close();
  }
}

debugFiltering();
