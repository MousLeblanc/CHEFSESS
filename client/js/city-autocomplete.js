/**
 * Autocomplete pour les villes belges et françaises
 */

console.log('📦 Chargement du module city-autocomplete.js');

// Liste des principales villes belges et françaises
const BELGIAN_CITIES = [
    'Bruxelles', 'Brussels', 'Brussel',
    'Anvers', 'Antwerp', 'Antwerpen',
    'Gand', 'Ghent', 'Gent',
    'Charleroi',
    'Liège', 'Luik',
    'Bruges', 'Brugge',
    'Namur', 'Namen',
    'Louvain', 'Leuven',
    'Mons', 'Bergen',
    'Malines', 'Mechelen',
    'Aalst', 'Alost',
    'Ostende', 'Oostende',
    'Nieuwpoort', 'Nieuport',
    'Tournai', 'Doornik',
    'Genk',
    'Seraing',
    'Roeselare',
    'Verviers',
    'Mouscron',
    'Beveren',
    'Dendermonde',
    'Beringen',
    'Turnhout',
    'Dilbeek',
    'Heist-op-den-Berg',
    'Sint-Niklaas',
    'Herstal',
    'Vilvoorde',
    'Molenbeek-Saint-Jean',
    'Schoten',
    'Evergem',
    'Jette',
    'Hasselt',
    'Kortrijk',
    'Gembloux',
    'Arlon', 'Aarlen',
    'Bastogne',
    'Dinant',
    'Marche-en-Famenne',
    'Neufchâteau',
    'Virton',
    'Wavre',
    'Nivelles',
    'Tubize',
    'Ottignies-Louvain-la-Neuve',
    'Waterloo',
    'La Louvière',
    'Binche',
    'Châtelet',
    'Fleurus',
    'Thuin',
    'Chimay',
    'Couvin',
    'Philippeville',
    'Walcourt'
];

const FRENCH_CITIES = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg',
    'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre',
    'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes',
    'Villeurbanne', 'Saint-Denis', 'Le Mans', 'Aix-en-Provence', 'Clermont-Ferrand',
    'Brest', 'Limoges', 'Tours', 'Amiens', 'Perpignan', 'Metz', 'Besançon',
    'Boulogne-Billancourt', 'Orléans', 'Mulhouse', 'Rouen', 'Caen', 'Nancy',
    'Saint-Denis', 'Argenteuil', 'Montreuil', 'Roubaix', 'Tourcoing', 'Nanterre',
    'Avignon', 'Créteil', 'Dunkirk', 'Poitiers', 'Asnières-sur-Seine', 'Versailles',
    'Courbevoie', 'Vitry-sur-Seine', 'Colombes', 'Aulnay-sous-Bois', 'La Rochelle',
    'Champigny-sur-Marne', 'Rueil-Malmaison', 'Antibes', 'Saint-Maur-des-Fossés',
    'Cannes', 'Calais', 'Béziers', 'Drancy', 'Mérignac', 'Saint-Nazaire',
    'Colmar', 'Issy-les-Moulineaux', 'Noisy-le-Grand', 'Évry', 'Villeneuve-d\'Ascq',
    'Cergy', 'Pessac', 'Valence', 'Antony', 'La Seyne-sur-Mer', 'Clichy',
    'Troyes', 'Montauban', 'Neuilly-sur-Seine', 'Pantin', 'Niort', 'Sarcelles',
    'Le Blanc-Mesnil', 'Fort-de-France', 'Châteauroux', 'Lorient', 'Bayonne',
    'Bourges', 'Brive-la-Gaillarde', 'Cholet', 'Châlons-en-Champagne', 'Chartres',
    'Évreux', 'Laval', 'Mâcon', 'Meaux', 'Pau', 'Tarbes', 'Thionville', 'Vannes'
];

const ALL_CITIES = [...new Set([...BELGIAN_CITIES, ...FRENCH_CITIES])].sort();

/**
 * Initialise l'autocomplete pour un champ de ville
 * @param {string} inputId - ID du champ input
 * @param {Function} onSelect - Callback appelé quand une ville est sélectionnée (city, postalCode)
 */
export function initCityAutocomplete(inputId, onSelect = null) {
    const input = document.getElementById(inputId);
    if (!input) {
        console.warn(`Champ ${inputId} non trouvé pour l'autocomplete`);
        return;
    }

    let autocompleteList = null;
    let selectedIndex = -1;

    // Vérifier si l'autocomplete n'est pas déjà initialisé
    const existingContainer = document.getElementById(`${inputId}-autocomplete`);
    if (existingContainer) {
        existingContainer.remove();
    }

    // Créer le conteneur pour les suggestions
    const container = document.createElement('div');
    container.id = `${inputId}-autocomplete`;
    container.className = 'city-autocomplete-list';
    container.style.cssText = `
        position: absolute;
        z-index: 1000;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        max-height: 200px;
        overflow-y: auto;
        display: none;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        width: 100%;
        margin-top: 2px;
    `;
    // S'assurer que le parent a une position relative pour le positionnement absolu
    const parent = input.parentElement;
    if (parent) {
        if (window.getComputedStyle(parent).position === 'static') {
            parent.style.position = 'relative';
        }
        parent.appendChild(container);
    } else {
        console.error('❌ Impossible de trouver le parent de l\'input pour l\'autocomplete');
        return;
    }

    // Fonction pour filtrer les villes
    function filterCities(query) {
        if (!query || query.length < 2) return [];
        const lowerQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return ALL_CITIES.filter(city => {
            const normalizedCity = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return normalizedCity.includes(lowerQuery);
        }).slice(0, 10); // Limiter à 10 résultats
    }

    // Fonction pour afficher les suggestions
    function showSuggestions(cities) {
        if (cities.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.innerHTML = cities.map((city, index) => `
            <div class="autocomplete-item" data-index="${index}" style="
                padding: 0.5rem 1rem;
                cursor: pointer;
                border-bottom: 1px solid #eee;
            " onmouseover="this.style.backgroundColor='#f0f0f0'" onmouseout="this.style.backgroundColor='white'">
                ${city}
            </div>
        `).join('');

        // Ajouter les event listeners
        container.querySelectorAll('.autocomplete-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                selectCity(cities[index]);
            });
        });

        container.style.display = 'block';
        selectedIndex = -1;
    }

    // Fonction pour sélectionner une ville
    function selectCity(city) {
        input.value = city;
        container.style.display = 'none';
        selectedIndex = -1;
        
        if (onSelect) {
            onSelect(city);
        }
        
        // Déclencher l'événement input pour mettre à jour le code postal si possible
        input.dispatchEvent(new Event('input'));
    }

    // Event listener sur l'input
    input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        const cities = filterCities(query);
        showSuggestions(cities);
    });

    // Gestion du clavier
    input.addEventListener('keydown', (e) => {
        const items = container.querySelectorAll('.autocomplete-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            items.forEach((item, idx) => {
                item.style.backgroundColor = idx === selectedIndex ? '#e3f2fd' : 'white';
            });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            items.forEach((item, idx) => {
                item.style.backgroundColor = idx === selectedIndex ? '#e3f2fd' : 'white';
            });
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            const city = items[selectedIndex].textContent.trim();
            selectCity(city);
        } else if (e.key === 'Escape') {
            container.style.display = 'none';
            selectedIndex = -1;
        }
    });

    // Fermer l'autocomplete quand on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !container.contains(e.target)) {
            container.style.display = 'none';
        }
    });

    // Focus sur l'input
    input.addEventListener('focus', () => {
        const query = input.value.trim();
        if (query.length >= 2) {
            const cities = filterCities(query);
            showSuggestions(cities);
        }
    });
}

// Export pour utilisation globale
if (typeof window !== 'undefined') {
    window.initCityAutocomplete = initCityAutocomplete;
    console.log('✅ Fonction initCityAutocomplete exposée globalement sur window');
    console.log('✅ Type de window.initCityAutocomplete:', typeof window.initCityAutocomplete);
}
