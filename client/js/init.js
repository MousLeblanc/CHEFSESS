// init.js - Initialisation globale de l'application
// Ce fichier doit être chargé en premier dans toutes les pages

// Intercepter toutes les requêtes fetch pour ajouter les en-têtes no-cache
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    const noCacheHeaders = {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    };

    const mergedOptions = {
        ...options,
        headers: {
            ...noCacheHeaders,
            ...options.headers
        }
    };

    return originalFetch(url, mergedOptions);
};

// Désactiver le cache du navigateur pour la page actuelle
if (window.performance && performance.navigation.type === 1) {
    // Page rechargée
    console.log('Page rechargée - cache désactivé');
}

// Forcer le rechargement sans cache au besoin
window.addEventListener('load', () => {
    // Ajouter un timestamp aux URLs des ressources dynamiques
    window.cacheBuster = Date.now();
});

console.log('✓ Initialisation : Cache désactivé pour toutes les requêtes');
