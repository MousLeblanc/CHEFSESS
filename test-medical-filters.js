// test-medical-filters.js
// Test des nouveaux filtres médicaux spécialisés pour EHPAD/hôpitaux

const testData = {
  establishmentType: 'maison_retraite',
  ageGroups: [
    {
      ageRange: 'adulte',
      count: 25,
      menuStructure: 'entree_plat',
      texture: 'iddsi_4', // Purée épaisse
      medicalConditions: [
        { type: 'diabete_type2', count: 8 },
        { type: 'hypertension', count: 12 },
        { type: 'dysphagie', count: 5 }
      ],
      allergens: [
        { type: 'lactose', count: 3 }
      ],
      dietaryRestrictions: [
        { type: 'sans_sel', count: 25 }
      ]
    }
  ],
  numDishes: 2,
  allergens: [], // Pas d'allergènes pour simplifier
  dietaryRestrictions: [], // Pas de restrictions pour simplifier
  medicalConditions: ['diabete_type2', 'hypertension'], // Seulement 2 conditions
  texture: 'normale', // Plus permissif pour le test
  swallowing: 'normale', // Plus permissif pour le test
  nutritionalProfile: [], // Plus permissif pour le test
  ethicalRestrictions: [], // Plus permissif pour le test
  ageDependencyGroup: 'personne_agee_autonome', // Plus permissif pour le test
  comfortFilters: [], // Plus permissif pour le test
  useStockOnly: false
};

console.log('🏥 Test des filtres médicaux spécialisés pour EHPAD/hôpitaux');
console.log('📤 Données de test:', JSON.stringify(testData, null, 2));

// Test de l'endpoint de génération de menu
fetch('http://localhost:5000/api/intelligent-menu/generate-test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('📡 Statut de la réponse:', response.status);
  return response.json();
})
.then(data => {
  console.log('✅ Réponse reçue:', data);
  if (data.success) {
    console.log('🎉 Menu généré avec succès !');
    console.log('📊 Nombre de plats:', data.menu.mainMenu.dishes.length);
    console.log('🛒 Nombre d\'ingrédients:', data.menu.shoppingList.length);
    
    // Afficher les détails des plats
    console.log('\n🍽️ Détails des plats:');
    data.menu.mainMenu.dishes.forEach((dish, index) => {
      console.log(`${index + 1}. ${dish.name}`);
      console.log(`   🏥 Conditions médicales: ${dish.medicalConditions?.join(', ') || 'Aucune'}`);
      console.log(`   🥗 Restrictions alimentaires: ${dish.dietaryRestrictions?.join(', ') || 'Aucune'}`);
      console.log(`   🍽️ Texture: ${dish.texture}`);
      console.log(`   🥤 Déglutition: ${dish.swallowing}`);
      console.log(`   📈 Profil nutritionnel: ${dish.nutritionalProfile?.join(', ') || 'Standard'}`);
    });
  } else {
    console.error('❌ Erreur:', data.message || data.error);
  }
})
.catch(error => {
  console.error('❌ Erreur lors de l\'appel API:', error);
});
