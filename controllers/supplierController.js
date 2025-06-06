// controllers/supplierController.js
import Product from '../models/Product.js'; // Assurez-vous que le chemin est correct et que Product.js utilise 'export default' ou des exports nommés
import Order from '../models/Order.js';   // Assurez-vous que le chemin est correct et que Order.js utilise 'export default' ou des exports nommés
import User from '../models/User.js';     // Assurez-vous que le chemin est correct et que User.js utilise 'export default'

// Obtenir les statistiques du fournisseur
export const getStats = async (req, res) => {
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
        console.error("Erreur getStats supplierController:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des statistiques du fournisseur.' });
    }
};

// Obtenir tous les produits du fournisseur
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ supplier: req.user.id })
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error("Erreur getProducts supplierController:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des produits du fournisseur.' });
    }
};

// Ajouter un nouveau produit
export const addProduct = async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            supplier: req.user.id // req.user.id est fourni par le middleware 'protect'
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error("Erreur addProduct supplierController:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erreur lors de l\'ajout du produit.' });
    }
};

// Mettre à jour un produit
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndUpdate(
            { _id: req.params.id, supplier: req.user.id }, // S'assurer que le produit appartient au fournisseur connecté
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé ou non autorisé à modifier.' });
        }

        res.json(product);
    } catch (error) {
        console.error("Erreur updateProduct supplierController:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erreur lors de la mise à jour du produit.' });
    }
};

// Supprimer un produit
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOneAndDelete({
            _id: req.params.id,
            supplier: req.user.id // S'assurer que le produit appartient au fournisseur connecté
        });

        if (!product) {
            return res.status(404).json({ message: 'Produit non trouvé ou non autorisé à supprimer.' });
        }

        res.json({ message: 'Produit supprimé avec succès.' });
    } catch (error) {
        console.error("Erreur deleteProduct supplierController:", error);
        res.status(500).json({ message: 'Erreur lors de la suppression du produit.' });
    }
};

// Obtenir les commandes du fournisseur
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ supplier: req.user.id }) // Uniquement les commandes destinées à ce fournisseur
            .populate('client', 'name email businessName') // Pour afficher les infos du client
            .populate('items.product', 'name') // Pour afficher le nom du produit dans la commande
            .sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        console.error("Erreur getOrders supplierController:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des commandes.' });
    }
};

// Mettre à jour le statut d'une commande
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // Valider les statuts possibles pour un fournisseur
        if (!['accepted', 'rejected', 'delivered', 'shipped'].includes(status)) { // 'shipped' ajouté comme exemple
            return res.status(400).json({ message: 'Statut de commande invalide.' });
        }

        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, supplier: req.user.id }, // S'assurer que la commande appartient à ce fournisseur
            { status },
            { new: true }
        ).populate('client', 'name email businessName');

        if (!order) {
            return res.status(404).json({ message: 'Commande non trouvée ou non modifiable par ce fournisseur.' });
        }

        res.json(order);
    } catch (error) {
        console.error("Erreur updateOrderStatus supplierController:", error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du statut de la commande.' });
    }
};