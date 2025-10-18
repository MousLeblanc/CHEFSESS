// openai-service.js - Service pour interagir avec l'API OpenAI

export async function generateMenuWithOpenAI(stockItems, preferences = {}) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Non authentifié');
    }

    const backendUrl = 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/ai/generate-menu`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        stockItems,
        preferences: {
          guests: preferences.guests || 4,
          cuisine: preferences.cuisine || 'Française',
          diet: preferences.diet || '',
          mealType: preferences.mealType || 'Dîner',
          occasion: preferences.occasion || '',
          optimize: preferences.optimize || 'balance',
          additionalInstructions: preferences.additionalInstructions || ''
        },
        strictMode: preferences.strictMode || false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Formater la réponse pour correspondre à notre format d'affichage
    if (result.success && result.menu) {
      // Transformer le format de menu retourné par l'API en format attendu par notre interface
      const menus = [];
      
      // Créer un menu à partir des plats retournés
      const menu = {
        title: result.menu.title,
        description: result.menu.description,
        servings: preferences.guests || 4,
        readyInMinutes: result.menu.dishes.reduce((total, dish) => total + (dish.preparationTime || 0) + (dish.cookingTime || 0), 0),
        ingredients: [],
        instructions: result.menu.dishes.map(dish => `${dish.name}: ${dish.instructions}`).join('\n\n'),
        image: "http://via.placeholder.com/400x200"
      };
      
      // Collecter tous les ingrédients des plats
      result.menu.dishes.forEach(dish => {
        dish.ingredients.forEach(ing => {
          menu.ingredients.push({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit
          });
        });
      });
      
      menus.push(menu);
      
      return {
        success: true,
        menus: menus
      };
    }
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la génération du menu avec OpenAI:', error);
    throw error;
  }
}