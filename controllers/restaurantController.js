// controllers/restaurantController.js
import Product from '../models/Product.js'; 
import Order from '../models/Order.js';
import RecipeEnriched from '../models/Recipe.js';   

// Obtenir le catalogue de produits
export const getCatalog = async (req, res) => {
    try {
        const { category, supplier } = req.query;
        const query = { active: true }; // On suppose que les produits ont un champ 'active'

        if (category) query.category = category;
        if (supplier) query.supplier = supplier; // 'supplier' ici est probablement un ID

        const products = await Product.find(query)
            .populate('supplier', 'name businessName') // Peuple le fournisseur avec son nom et nom d'entreprise
            .sort({ category: 1, name: 1 });

        res.json(products);
    } catch (error) {
        console.error("Erreur getCatalog restaurantController:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération du catalogue.' });
    }
};

// Créer une nouvelle commande
export const createOrder = async (req, res) => {
    try {
        const { items, deliveryDate, notes } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Une commande doit contenir au moins un article.' });
        }

        // Vérifier que tous les produits sont du même fournisseur et récupérer les infos
        const productIds = items.map(item => item.product);
        const productsInDb = await Product.find({ _id: { $in: productIds } });

        if (productsInDb.length !== productIds.length) {
            return res.status(404).json({ message: 'Un ou plusieurs produits n\'ont pas été trouvés.' });
        }

        const supplierId = productsInDb[0].supplier;
        for (const product of productsInDb) {
            if (product.supplier.toString() !== supplierId.toString()) {
                return res.status(400).json({ message: 'Tous les produits d\'une commande doivent provenir du même fournisseur.' });
            }
        }

        const orderItems = items.map(item => {
            const productDetails = productsInDb.find(p => p._id.toString() === item.product);
            if (!productDetails) {
                // Cette erreur ne devrait pas arriver si la vérification précédente est passée, mais sécurité
                throw new Error(`Détails du produit non trouvés pour l'ID ${item.product}.`);
            }
            if (item.quantity < productDetails.minOrder) {
                throw new Error(`La quantité minimale de commande pour ${productDetails.name} est de ${productDetails.minOrder}.`);
            }
            return {
                product: item.product,
                quantity: item.quantity,
                price: productDetails.price, // Utiliser le prix actuel du produit depuis la DB
                unit: productDetails.unit
            };
        });
        
        // Calcul du total (à faire ici ou dans un pre-save hook du modèle Order)
        const totalAmount = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        const order = new Order({
            client: req.user.id, // ID de l'utilisateur authentifié (le restaurant qui commande)
            supplier: supplierId, // ID du fournisseur
            items: orderItems,
            total: totalAmount, // Total calculé
            deliveryDate,
            notes
        });

        await order.save();
        
        // Optionnel: populer les détails avant de renvoyer si le frontend en a besoin immédiatement
        const populatedOrder = await Order.findById(order._id)
                                         .populate('supplier', 'name businessName')
                                         .populate('items.product', 'name');

        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error("Erreur createOrder restaurantController:", error);
        // Si c'est une erreur de validation de Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        // Pour les erreurs lancées manuellement (ex: quantité min)
        if (error.message.includes('Quantité minimum') || error.message.includes('même fournisseur') || error.message.includes('Produit non trouvé')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erreur lors de la création de la commande.' });
    }
};

// Obtenir les commandes du restaurant (client)
export const getOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { client: req.user.id }; // Commandes passées par ce restaurant

        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('supplier', 'name businessName') // Infos du fournisseur
            .populate('items.product', 'name price unit') // Infos des produits commandés
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error("Erreur getOrders restaurantController:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes.' });
    }
};

// Annuler une commande (par le client/restaurant)
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            client: req.user.id, // Seul le client qui a passé la commande peut l'annuler
            status: 'pending'    // On ne peut annuler que les commandes en attente
        });

        if (!order) {
            return res.status(404).json({ 
                message: 'Commande non trouvée, déjà traitée, ou non autorisée à annuler.'
            });
        }

        order.status = 'cancelled';
        await order.save();

        res.json(order);
    } catch (error) {
        console.error("Erreur cancelOrder restaurantController:", error);
        res.status(500).json({ message: 'Erreur lors de l\'annulation de la commande.' });
    }
};

// Obtenir les statistiques des commandes pour le restaurant
export const getStats = async (req, res) => {
    try {
        const [
            totalOrders,
            pendingOrders,
            totalSpentResult // Renommé pour clarté
        ] = await Promise.all([
            Order.countDocuments({ client: req.user.id }),
            Order.countDocuments({ 
                client: req.user.id,
                status: 'pending'
            }),
            Order.aggregate([
                { 
                    $match: { 
                        client: req.user.id, // Assurez-vous que req.user.id est bien un ObjectId si vous matchez directement
                        status: { $in: ['delivered', 'accepted'] } // Statuts pour lesquels la dépense est comptée
                    }
                },
                {
                    $group: {
                        _id: null, // Grouper toutes les commandes correspondantes
                        total: { $sum: '$total' } // Sommer le champ 'total' de chaque commande
                    }
                }
            ]) // aggregate retourne un tableau
        ]);
        
        const totalSpent = totalSpentResult.length > 0 ? totalSpentResult[0].total : 0;

        res.json({
            totalOrders,
            pendingOrders,
            totalSpent
        });
    } catch (error) {
        console.error("Erreur getStats restaurantController:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques des commandes.' });
    }
};

// Obtenir les menus compatibles avec les restrictions du client
export const getCompatibleMenus = async (req, res) => {
    try {
        // Accepter les paramètres depuis query string (GET) ou body (POST)
        const allergensParam = req.query.allergens || req.body.allergens;
        const dietaryRestrictionsParam = req.query.dietaryRestrictions || req.body.dietaryRestrictions;
        const intolerancesParam = req.query.intolerances || req.body.intolerances;
        const categoriesParam = req.query.categories || req.body.categories;
        
        // Parser les paramètres (peuvent être des strings séparés par virgule)
        const allergens = Array.isArray(allergensParam) 
            ? allergensParam 
            : (allergensParam ? allergensParam.split(',').map(a => a.trim()) : []);
        
        const dietaryRestrictions = Array.isArray(dietaryRestrictionsParam)
            ? dietaryRestrictionsParam
            : (dietaryRestrictionsParam ? dietaryRestrictionsParam.split(',').map(r => r.trim()) : []);
        
        const intolerances = Array.isArray(intolerancesParam)
            ? intolerancesParam
            : (intolerancesParam ? intolerancesParam.split(',').map(i => i.trim()) : []);
        
        const categories = Array.isArray(categoriesParam)
            ? categoriesParam
            : (categoriesParam ? categoriesParam.split(',').map(c => c.trim()) : ['plat', 'entrée', 'dessert']);
        
        // Normaliser les allergènes (combiner allergies et intolérances)
        const allAllergens = [...new Set([...allergens, ...intolerances])].map(a => a.toLowerCase());
        
        // Construire le filtre
        let filter = {
            category: { $in: categories } // Utiliser les catégories demandées ou par défaut
        };
        
        // Exclure les recettes contenant les allergènes
        if (allAllergens.length > 0) {
            filter.allergens = { $nin: allAllergens };
        }
        
        // Filtrer par restrictions alimentaires
        if (dietaryRestrictions && dietaryRestrictions.length > 0) {
            const restrictionsLower = dietaryRestrictions.map(r => r.toLowerCase());
            
            // Si végétarien demandé, exclure viande/poisson/volaille
            if (restrictionsLower.includes('vegetarien') || restrictionsLower.includes('végétarien')) {
                // Construire un filtre strict qui EXCLUT toutes les recettes avec viande/poisson/volaille
                // et INCLUT seulement les recettes végétariennes explicites ou sans viande
                
                // Conditions pour être végétarien : soit explicite, soit pas de viande détectée
                const vegetarianOrConditions = [];
                
                // 1. Recettes explicitement végétariennes
                vegetarianOrConditions.push(
                    { dietaryRestrictions: { $in: ['vegetarien', 'végétarien'] } },
                    { diet: { $in: ['vegetarien', 'végétarien'] } },
                    { tags: { $in: ['type:végétarien', 'vegetarien', 'végétarien'] } }
                );
                
                // 2. Recettes sans viande/poisson/volaille (vérification stricte)
                vegetarianOrConditions.push({
                    $and: [
                        // Pas de tags indiquant viande/poisson/volaille
                        { 
                            $or: [
                                { tags: { $exists: false } },
                                { tags: { $size: 0 } },
                                { tags: { $nin: ['type:viande', 'type:poisson', 'type:volaille', 'viande', 'poisson', 'volaille', 'meat', 'fish', 'poultry', 'chicken', 'beef', 'pork'] } }
                            ]
                        },
                        // Pas de mots-clés de viande/poisson/volaille dans le nom
                        { 
                            name: { 
                                $not: {
                                    $regex: /(porc|pork|beef|bœuf|boeuf|viande|meat|canard|duck|agneau|lamb|mouton|sheep|veau|veal|saucisse|sausage|jambon|ham|bacon|steak|entrecôte|entrecote|côte|cote|chop|magret|duck|poulet|chicken|dinde|turkey|volaille|poultry|pintade|guinea|poisson|fish|saumon|salmon|thon|tuna|cabillaud|cod|truite|trout|crevette|shrimp|crabe|crab|moule|mussel|huître|oyster|coquille|scallop)/i
                                }
                            }
                        },
                        // Pas de mots-clés dans frenchTitle si présent
                        {
                            $or: [
                                { frenchTitle: { $exists: false } },
                                { frenchTitle: { $regex: /^(?!.*(porc|pork|beef|bœuf|viande|meat|canard|duck|agneau|lamb|veau|veal|saucisse|sausage|jambon|ham|bacon|steak|poulet|chicken|dinde|turkey|volaille|poisson|fish|saumon|salmon|thon|tuna|cabillaud|cod|truite|trout|crevette|shrimp|crabe|crab|moule|mussel|huître|oyster)).*$/i } }
                            ]
                        }
                    ]
                });
                
                // Appliquer le filtre : soit végétarien explicite, soit pas de viande détectée
                if (!filter.$and) {
                    filter.$and = [];
                }
                filter.$and.push({
                    $or: vegetarianOrConditions
                });
            }
            
            // Si végétalien/vegan demandé
            if (restrictionsLower.includes('vegan') || restrictionsLower.includes('végétalien')) {
                const veganConditions = [
                    { dietaryRestrictions: { $in: ['vegan', 'végétalien'] } },
                    { diet: { $in: ['vegan', 'végétalien'] } },
                    { tags: { $in: ['type:végétarien', 'vegan', 'végétalien'] } }
                ];
                
                // Exclure viande/poisson/volaille ET produits animaux (lait, œufs)
                const excludeAnimalConditions = {
                    $and: [
                        { tags: { $nin: ['type:viande', 'type:poisson', 'type:volaille', 'viande', 'poisson', 'volaille'] } },
                        { allergens: { $nin: ['lactose', 'lait', 'oeufs', 'oeuf', 'milk', 'egg', 'eggs'] } },
                        { 
                            $nor: [
                                { name: { $regex: /(porc|pork|beef|bœuf|viande|meat|canard|duck|agneau|lamb|mouton|sheep|veau|veal|saucisse|sausage|jambon|ham|bacon|steak|entrecôte|côte|chop)/i } },
                                { name: { $regex: /(poisson|fish|saumon|salmon|thon|tuna|cabillaud|cod|truite|trout|crevette|shrimp|crabe|crab|moule|mussel|huître|oyster)/i } },
                                { name: { $regex: /(poulet|chicken|dinde|turkey|canard|duck|volaille|poultry|pintade|guinea)/i } },
                                { name: { $regex: /(fromage|cheese|beurre|butter|crème|cream|lait|milk|yaourt|yogurt)/i } }
                            ]
                        }
                    ]
                };
                
                filter.$and = [
                    {
                        $or: [
                            ...veganConditions,
                            excludeAnimalConditions
                        ]
                    }
                ];
                
                // Exclure aussi les allergènes lait et œufs
                const veganAllergens = [...allAllergens, 'lactose', 'lait', 'oeufs', 'oeuf', 'milk', 'egg', 'eggs'];
                if (filter.allergens) {
                    filter.allergens = { $nin: [...new Set([...filter.allergens.$nin || [], ...veganAllergens])] };
                } else {
                    filter.allergens = { $nin: veganAllergens };
                }
            }
            
            // Si halal demandé
            if (restrictionsLower.includes('halal')) {
                filter.$or = [
                    { dietaryRestrictions: { $in: ['halal'] } },
                    { diet: { $in: ['halal'] } }
                ];
            }
            
            // Si casher demandé
            if (restrictionsLower.includes('casher')) {
                filter.$or = [
                    { dietaryRestrictions: { $in: ['casher'] } },
                    { diet: { $in: ['casher'] } }
                ];
            }
        }
        
        // Récupérer les recettes compatibles
        const recipes = await RecipeEnriched.find(filter)
            .select('name category description frenchTitle allergens dietaryRestrictions diet tags')
            .limit(50)
            .sort({ name: 1 });
        
        res.json({
            success: true,
            count: recipes.length,
            data: recipes
        });
    } catch (error) {
        console.error("Erreur getCompatibleMenus restaurantController:", error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur lors de la récupération des menus compatibles.' 
        });
    }
};