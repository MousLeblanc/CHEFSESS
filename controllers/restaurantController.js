const Product = require('../models/Product');
const Order = require('../models/Order');

// Obtenir le catalogue de produits
exports.getCatalog = async (req, res) => {
    try {
        const { category, supplier } = req.query;
        const query = { active: true };

        if (category) query.category = category;
        if (supplier) query.supplier = supplier;

        const products = await Product.find(query)
            .populate('supplier', 'name businessName')
            .sort({ category: 1, name: 1 });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du catalogue' });
    }
};

// Créer une nouvelle commande
exports.createOrder = async (req, res) => {
    try {
        const { items, deliveryDate, notes } = req.body;

        // Vérifier que tous les produits sont du même fournisseur
        const firstProduct = await Product.findById(items[0].product);
        if (!firstProduct) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        const supplier = firstProduct.supplier;

        // Vérifier les quantités minimales et récupérer les prix actuels
        const orderItems = await Promise.all(items.map(async (item) => {
            const product = await Product.findById(item.product);
            
            if (!product) {
                throw new Error(`Produit ${item.product} non trouvé`);
            }
            
            if (product.supplier.toString() !== supplier.toString()) {
                throw new Error('Tous les produits doivent être du même fournisseur');
            }

            if (item.quantity < product.minOrder) {
                throw new Error(`Quantité minimum non respectée pour ${product.name}`);
            }

            return {
                product: item.product,
                quantity: item.quantity,
                price: product.price,
                unit: product.unit
            };
        }));

        const order = new Order({
            client: req.user.id,
            supplier,
            items: orderItems,
            deliveryDate,
            notes
        });

        await order.save();
        
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtenir les commandes du restaurant
exports.getOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const query = { client: req.user.id };

        if (status) query.status = status;

        const orders = await Order.find(query)
            .populate('supplier', 'name businessName')
            .populate('items.product', 'name')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
    }
};

// Annuler une commande
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            client: req.user.id,
            status: 'pending'
        });

        if (!order) {
            return res.status(404).json({ 
                message: 'Commande non trouvée ou ne peut plus être annulée'
            });
        }

        order.status = 'cancelled';
        await order.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'annulation de la commande' });
    }
};

// Obtenir les statistiques des commandes
exports.getStats = async (req, res) => {
    try {
        const [
            totalOrders,
            pendingOrders,
            totalSpent
        ] = await Promise.all([
            Order.countDocuments({ client: req.user.id }),
            Order.countDocuments({ 
                client: req.user.id,
                status: 'pending'
            }),
            Order.aggregate([
                { 
                    $match: { 
                        client: req.user._id,
                        status: { $in: ['delivered', 'accepted'] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' }
                    }
                }
            ]).then(result => result[0]?.total || 0)
        ]);

        res.json({
            totalOrders,
            pendingOrders,
            totalSpent
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
}; 