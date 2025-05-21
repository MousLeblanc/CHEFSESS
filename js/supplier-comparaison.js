/**
 * Calcule un score comparatif pour un fournisseur basé sur plusieurs critères
 * Un score plus bas indique un meilleur fournisseur
 * 
 * @param {number} price - Prix du produit
 * @param {number} deliveryTime - Délai de livraison en jours
 * @param {number} minQuantity - Quantité minimale de commande
 * @param {number} quality - Note de qualité (de 1 à 5)
 * @param {Object} weights - Poids de chaque critère (optionnel)
 * @param {Object} stats - Statistiques min/max pour normalisation (optionnel)
 * @returns {number} - Score global (plus bas = meilleur)
 */
function calculateScore(price, deliveryTime, minQuantity, quality, weights = null, stats = null) {
    // Poids par défaut des critères (peuvent être personnalisés)
    const defaultWeights = {
        price: 0.4,       // 40% d'importance pour le prix
        delivery: 0.3,    // 30% pour le délai de livraison
        quantity: 0.1,    // 10% pour la quantité minimale
        quality: 0.2      // 20% pour la qualité
    };
    
    // Utiliser les poids personnalisés ou par défaut
    const w = weights || defaultWeights;
    
    // Si aucune statistique n'est fournie, utiliser des valeurs par défaut
    // (en pratique, ces valeurs devraient être calculées à partir de tous les fournisseurs)
    const defaultStats = {
        maxPrice: price * 2,
        minPrice: price * 0.5,
        maxDelivery: 14,
        minDelivery: 1,
        maxQuantity: minQuantity * 2,
        minQuantity: minQuantity * 0.5
    };
    
    // Utiliser les statistiques fournies ou par défaut
    const s = stats || defaultStats;
    
    // Normalisation et calcul des scores individuels (score inversé pour le prix, délai et quantité)
    // Pour chaque critère, la formule normalise la valeur entre 0 et 1, avec 1 étant le meilleur
    
    // Prix: plus c'est bas, meilleur est le score
    const priceRange = s.maxPrice - s.minPrice;
    const priceScore = priceRange > 0 
        ? (s.maxPrice - price) / priceRange 
        : 0.5; // Valeur par défaut si tous les prix sont identiques
    
    // Délai: plus c'est court, meilleur est le score
    const deliveryRange = s.maxDelivery - s.minDelivery;
    const deliveryScore = deliveryRange > 0 
        ? (s.maxDelivery - deliveryTime) / deliveryRange 
        : 0.5;
    
    // Quantité minimale: plus c'est bas, meilleur est le score
    const quantityRange = s.maxQuantity - s.minQuantity;
    const quantityScore = quantityRange > 0 
        ? (s.maxQuantity - minQuantity) / quantityRange 
        : 0.5;
    
    // Qualité: plus c'est élevé, meilleur est le score (déjà entre 1-5)
    const qualityScore = quality / 5;
    
    // Calcul du score global pondéré (plus élevé = meilleur)
    const weightedScore = 
        (priceScore * w.price) + 
        (deliveryScore * w.delivery) + 
        (quantityScore * w.quantity) + 
        (qualityScore * w.quality);
    
    // Normaliser le score final entre 0 et 1 pour faciliter la comparaison
    return parseFloat(weightedScore.toFixed(2));
}

/**
 * Compare plusieurs fournisseurs et retourne un classement
 * 
 * @param {Array} suppliers - Liste des fournisseurs à comparer
 * @param {string} productName - Nom du produit à comparer
 * @param {Object} weights - Poids personnalisés pour les critères (optionnel)
 * @returns {Array} - Fournisseurs classés du meilleur au moins bon
 */
function compareSuppliers(suppliers, productName, weights = null) {
    // Filtrer les fournisseurs qui proposent ce produit
    const relevantSuppliers = suppliers.filter(supplier => {
        return supplier.products && supplier.products.some(
            product => product.name.toLowerCase().includes(productName.toLowerCase())
        );
    });
    
    if (relevantSuppliers.length === 0) {
        return [];
    }
    
    // Extraire les statistiques pour la normalisation
    const stats = {
        maxPrice: Math.max(...relevantSuppliers.map(s => {
            const product = s.products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
            return product ? product.price : 0;
        })),
        minPrice: Math.min(...relevantSuppliers.map(s => {
            const product = s.products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
            return product && product.price > 0 ? product.price : Number.MAX_VALUE;
        })),
        maxDelivery: Math.max(...relevantSuppliers.map(s => s.deliveryTime || 0)),
        minDelivery: Math.min(...relevantSuppliers.map(s => s.deliveryTime || Number.MAX_VALUE)),
        maxQuantity: Math.max(...relevantSuppliers.map(s => {
            const product = s.products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
            return product ? product.minQuantity || 0 : 0;
        })),
        minQuantity: Math.min(...relevantSuppliers.map(s => {
            const product = s.products.find(p => p.name.toLowerCase().includes(productName.toLowerCase()));
            return product && product.minQuantity ? product.minQuantity : Number.MAX_VALUE;
        }))
    };
    
    // Corriger les valeurs min si nécessaire
    if (stats.minPrice === Number.MAX_VALUE) stats.minPrice = 0;
    if (stats.minDelivery === Number.MAX_VALUE) stats.minDelivery = 0;
    if (stats.minQuantity === Number.MAX_VALUE) stats.minQuantity = 0;
    
    // Calculer le score pour chaque fournisseur
    const scoredSuppliers = relevantSuppliers.map(supplier => {
        const product = supplier.products.find(
            p => p.name.toLowerCase().includes(productName.toLowerCase())
        );
        
        const score = calculateScore(
            product.price || 0,
            supplier.deliveryTime || 0,
            product.minQuantity || 0,
            supplier.qualityRating || 0,
            weights,
            stats
        );
        
        return {
            ...supplier,
            product,
            score
        };
    });
    
    // Trier les fournisseurs par score (du plus élevé au plus bas)
    return scoredSuppliers.sort((a, b) => b.score - a.score);
}