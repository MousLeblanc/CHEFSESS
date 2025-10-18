// test-ultra-simple.js
// Test ultra-simple pour isoler le problème

const testData = {
  establishmentType: 'maison_retraite',
  ageGroups: [
    {
      ageRange: 'adulte',
      count: 25,
      menuStructure: 'entree_plat'
    }
  ],
  numDishes: 2,
  allergens: [],
  dietaryRestrictions: [],
  medicalConditions: [],
  texture: 'normale',
  useStockOnly: false
};

console.log('🧪 Test ultra-simple (aucune restriction)');
console.log('📤 Données de test:', JSON.stringify(testData, null, 2));

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
    
    if (data.menu.mainMenu.dishes.length > 0) {
      console.log('\n🍽️ Détails des plats:');
      data.menu.mainMenu.dishes.forEach((dish, index) => {
        console.log(`${index + 1}. ${dish.name}`);
      });
    } else {
      console.log('❌ Aucun plat généré !');
    }
  } else {
    console.error('❌ Erreur:', data.message || data.error);
  }
})
.catch(error => {
  console.error('❌ Erreur lors de l\'appel API:', error);
});
