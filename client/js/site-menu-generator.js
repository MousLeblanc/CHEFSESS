/**
 * Générateur de menus pour un site individuel (EHPAD, hôpital, etc.)
 * Analyse tous les résidents du site et génère des menus adaptés
 */

class SiteMenuGenerator {
  constructor(siteId) {
    this.siteId = siteId;
    this.residents = [];
    this.groupedProfiles = null;
  }

  /**
   * Charger tous les résidents du site
   */
  async loadResidents() {
    try {
      console.log(`📋 Chargement des résidents du site ${this.siteId}...`);
      
      const response = await fetch(`/api/residents/site/${this.siteId}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des résidents');
      }

      const data = await response.json();
      this.residents = data.data || [];
      
      console.log(`✅ ${this.residents.length} résidents chargés`);
      return this.residents;
    } catch (error) {
      console.error('❌ Erreur chargement résidents:', error);
      throw error;
    }
  }

  /**
   * Analyser et grouper les profils des résidents
   */
  analyzeProfiles() {
    console.log('🔍 Analyse des profils nutritionnels...');

    const profiles = {
      portions: {}, // Ex: { "normale": 5, "double": 2, "demi": 3 }
      textures: {},  // Ex: { "iddsi_7": 4, "iddsi_5": 2, "finger_food": 1 }
      allergies: [], // Ex: ["lactose", "gluten"]
      restrictions: [], // Ex: ["sans_sel", "diabete"]
      totalResidents: this.residents.length
    };

    // Compter les portions
    this.residents.forEach(resident => {
      const portion = resident.nutritionalProfile?.portionSize || 'normale';
      profiles.portions[portion] = (profiles.portions[portion] || 0) + 1;

      // Compter les textures
      const texture = resident.nutritionalProfile?.texturePreferences?.consistency || 'iddsi_7';
      profiles.textures[texture] = (profiles.textures[texture] || 0) + 1;

      // Collecter allergies
      const allergies = resident.nutritionalProfile?.allergies || [];
      allergies.forEach(allergy => {
        if (!profiles.allergies.includes(allergy)) {
          profiles.allergies.push(allergy);
        }
      });

      // Collecter restrictions
      const restrictions = resident.nutritionalProfile?.dietaryRestrictions || [];
      restrictions.forEach(restriction => {
        if (!profiles.restrictions.includes(restriction)) {
          profiles.restrictions.push(restriction);
        }
      });
    });

    this.groupedProfiles = profiles;
    
    console.log('✅ Profils analysés:', {
      total: profiles.totalResidents,
      portions: Object.keys(profiles.portions).length,
      textures: Object.keys(profiles.textures).length,
      allergies: profiles.allergies.length,
      restrictions: profiles.restrictions.length
    });

    return profiles;
  }

  /**
   * Créer les groupes de variantes de menu
   */
  createVariantGroups() {
    if (!this.groupedProfiles) {
      this.analyzeProfiles();
    }

    const variants = [];

    // Créer une variante pour chaque combinaison texture × portion significative
    Object.entries(this.groupedProfiles.textures).forEach(([texture, textureCount]) => {
      Object.entries(this.groupedProfiles.portions).forEach(([portion, portionCount]) => {
        // Trouver les résidents correspondant à cette combinaison
        const matchingResidents = this.residents.filter(r => {
          const resTexture = r.nutritionalProfile?.texturePreferences?.consistency || 'iddsi_7';
          const resPortion = r.nutritionalProfile?.portionSize || 'normale';
          return resTexture === texture && resPortion === portion;
        });

        if (matchingResidents.length > 0) {
          variants.push({
            texture: texture,
            portion: portion,
            count: matchingResidents.length,
            residents: matchingResidents.map(r => ({
              id: r._id,
              name: `${r.firstName} ${r.lastName}`,
              room: r.room
            }))
          });
        }
      });
    });

    console.log(`✅ ${variants.length} variantes de menu créées`);
    return variants;
  }

  /**
   * Générer le menu pour le site
   */
  async generateMenu(config = {}) {
    try {
      const {
        numDays = 7,
        numDishesPerMeal = 2,
        useStock = false,
        theme = null
      } = config;

      // 1. Charger les résidents si pas déjà fait
      if (this.residents.length === 0) {
        await this.loadResidents();
      }

      if (this.residents.length === 0) {
        throw new Error('Aucun résident trouvé pour ce site');
      }

      // 2. Analyser les profils
      const profiles = this.analyzeProfiles();

      // 3. Créer les variantes
      const variants = this.createVariantGroups();

      console.log('📤 Envoi de la demande de génération de menu...');

      // 4. Appeler l'API de génération de menu
      const payload = {
        siteId: this.siteId,
        numDays: numDays,
        numDishesPerMeal: numDishesPerMeal,
        totalResidents: profiles.totalResidents,
        variants: variants,
        allergies: profiles.allergies,
        restrictions: profiles.restrictions,
        useStock: useStock,
        theme: theme
      };

      console.log('📋 Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch('/api/menus/generate-site', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la génération du menu');
      }

      const result = await response.json();
      
      console.log('✅ Menu généré:', result);
      return result;

    } catch (error) {
      console.error('❌ Erreur génération menu:', error);
      throw error;
    }
  }

  /**
   * Formater le résultat du menu pour l'affichage
   */
  formatMenuDisplay(menuResult) {
    const html = [];

    html.push('<div class="menu-result">');
    html.push(`<h3>📅 Menu pour ${menuResult.numDays} jours</h3>`);
    html.push(`<p><strong>${this.groupedProfiles.totalResidents} résidents</strong> couverts</p>`);

    // Afficher les variantes
    if (menuResult.variants && menuResult.variants.length > 0) {
      html.push('<div class="variants-summary">');
      html.push('<h4>🍽️ Variantes de menu :</h4>');
      menuResult.variants.forEach(variant => {
        html.push(`
          <div class="variant-card">
            <strong>${variant.count} résidents</strong> - 
            ${this.getTextureLabel(variant.texture)} / 
            ${this.getPortionLabel(variant.portion)}
          </div>
        `);
      });
      html.push('</div>');
    }

    // Afficher les menus par jour
    if (menuResult.menus && menuResult.menus.length > 0) {
      html.push('<div class="daily-menus">');
      menuResult.menus.forEach((dayMenu, index) => {
        html.push(`
          <div class="day-menu">
            <h4>📆 Jour ${index + 1}</h4>
            ${this.formatDayMenu(dayMenu)}
          </div>
        `);
      });
      html.push('</div>');
    }

    html.push('</div>');
    return html.join('');
  }

  /**
   * Formater un menu journalier
   */
  formatDayMenu(dayMenu) {
    const html = [];

    ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
      if (dayMenu[mealType]) {
        html.push(`
          <div class="meal">
            <h5>${this.getMealLabel(mealType)}</h5>
            <ul>
              ${dayMenu[mealType].map(dish => `
                <li>${dish.name || dish}</li>
              `).join('')}
            </ul>
          </div>
        `);
      }
    });

    return html.join('');
  }

  /**
   * Labels pour textures IDDSI
   */
  getTextureLabel(texture) {
    const labels = {
      'iddsi_7': 'Normal facile à mastiquer',
      'iddsi_6': 'Petits morceaux tendres',
      'iddsi_5': 'Haché lubrifié',
      'iddsi_4': 'Purée lisse',
      'iddsi_3': 'Purée fluide',
      'iddsi_2': 'Légèrement épais',
      'iddsi_1': 'Très légèrement épais',
      'iddsi_0': 'Liquide',
      'finger_food': 'Finger Food'
    };
    return labels[texture] || texture;
  }

  /**
   * Labels pour portions
   */
  getPortionLabel(portion) {
    const labels = {
      'normale': 'Portion normale',
      'double': 'Double portion',
      'demi': 'Demi-portion',
      'quart': 'Quart de portion'
    };
    return labels[portion] || portion;
  }

  /**
   * Labels pour repas
   */
  getMealLabel(mealType) {
    const labels = {
      'breakfast': '🌅 Petit-déjeuner',
      'lunch': '🍽️ Déjeuner',
      'dinner': '🌙 Dîner'
    };
    return labels[mealType] || mealType;
  }
}

// Export global
window.SiteMenuGenerator = SiteMenuGenerator;

export default SiteMenuGenerator;





