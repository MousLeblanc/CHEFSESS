// Test de génération de menu pour maison de retraite
const testData = {
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

console.log('🧪 Test de génération de menu pour maison de retraite');
console.log('📤 Données de test:', JSON.stringify(testData, null, 2));

// Simuler l'appel API
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
  } else {
    console.log('❌ Erreur:', data.message);
  }
})
.catch(error => {
  console.error('❌ Erreur lors du test:', error);
});
