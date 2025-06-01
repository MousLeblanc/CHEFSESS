const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Obtenir les statistiques du fournisseur
exports.getStats = async (req, res) => {
    try {
        const [activeProducts, pendingOrders, activeClients] = await Promise.all([
            Product.countDocuments({ supplier: req.user.id, active: true }),
            Order.countDocuments({ supplier: req.user.id, status: 'pending' }),
            Order.distinct('client', { supplier: req.user.id }).then(clients => clients.length)
        ]);

        res.json({
            activeProducts,
            pendingOrders,
            activeClients
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
    }
};

// Obtenir tous les produits du fournisseur
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({ supplier: req.user.id })
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des produits' });
    }
};

// Ajouter un nouveau produit
exports.addProduct = async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            supplier: req.user.id
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erreur lors de l\'ajout du produit' });
    }
};

// Mettre à jour un produit
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, supplier: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        res.json(product);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erreur lors de la mise à jour du produit' });
    }
};

// Supprimer un produit
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            supplier: req.user.id
        });

        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé' });
        }

        res.json({ message: 'Produit supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression du produit' });
    }
};

// Obtenir les commandes du fournisseur
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ supplier: req.user.id })
            .populate('client', 'name email businessName')
            .populate('items.product', 'name')
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes' });
    }
};

// Mettre à jour le statut d'une commande
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['accepted', 'rejected', 'delivered'].includes(status)) {
            return res.status(400).json({ message: 'Statut invalide' });
        }

        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, supplier: req.user.id },
            { status },
            { new: true }
        ).populate('client', 'name email businessName');

        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour du statut' });
    }
}; 