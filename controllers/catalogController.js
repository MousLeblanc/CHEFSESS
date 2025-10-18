// controllers/catalogController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

// @desc    Obtenir le catalogue des fournisseurs pour les restaurants
// @route   GET /api/catalog/suppliers
// @access  Private (restaurants et collectivités)
export const getSuppliersCatalog = asyncHandler(async (req, res) => {
  try {
    // Récupérer tous les utilisateurs avec le rôle 'fournisseur'
    const suppliers = await User.find({ role: 'fournisseur' })
      .select('name businessName email phone address rating category description')
      .lean();

    // Pour chaque fournisseur, récupérer ses produits actifs
    const suppliersWithProducts = await Promise.all(
      suppliers.map(async (supplier) => {
        const products = await Product.find({ 
          supplier: supplier._id, 
          active: true 
        })
        .select('name description price unit deliveryTime minOrder category')
        .lean();

        return {
          id: supplier._id,
          name: supplier.businessName || supplier.name,
          category: supplier.category || 'autres',
          contact: supplier.name,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          rating: supplier.rating || 0,
          description: supplier.description,
          products: products.map(product => ({
            id: product._id,
            name: product.name,
            description: product.description,
            price: product.price,
            unit: product.unit,
            deliveryTime: product.deliveryTime,
            minOrder: product.minOrder,
            category: product.category
          }))
        };
      })
    );

    res.status(200).json({
      success: true,
      suppliers: suppliersWithProducts
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du catalogue:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du catalogue des fournisseurs'
    });
  }
});

// @desc    Passer une commande à un fournisseur
// @route   POST /api/catalog/orders
// @access  Private (restaurants et collectivités)
export const placeOrder = asyncHandler(async (req, res) => {
  const { supplierId, items, notes } = req.body;
  const clientId = req.user._id;

  if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Données de commande invalides');
  }

  try {
    // Vérifier que le fournisseur existe
    const supplier = await User.findById(supplierId);
    if (!supplier || supplier.role !== 'fournisseur') {
      res.status(404);
      throw new Error('Fournisseur non trouvé');
    }

    // Vérifier que tous les produits existent et appartiennent au fournisseur
    const productIds = items.map(item => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      supplier: supplierId,
      active: true
    });

    if (products.length !== productIds.length) {
      res.status(400);
      throw new Error('Certains produits ne sont pas disponibles');
    }

    // Calculer le total de la commande
    let total = 0;
    const orderItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      return {
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        unit: product.unit,
        total: itemTotal
      };
    });

    // Créer la commande
    const order = new Order({
      client: clientId,
      supplier: supplierId,
      items: orderItems,
      total: total,
      status: 'pending',
      notes: notes || ''
    });

    const savedOrder = await order.save();

    // Populer les détails pour la réponse
    await savedOrder.populate([
      { path: 'client', select: 'name businessName' },
      { path: 'supplier', select: 'name businessName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Commande passée avec succès',
      order: {
        id: savedOrder._id,
        clientName: savedOrder.client.businessName || savedOrder.client.name,
        supplierName: savedOrder.supplier.businessName || savedOrder.supplier.name,
        total: savedOrder.total,
        status: savedOrder.status,
        createdAt: savedOrder.createdAt,
        items: savedOrder.items
      }
    });

  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de la commande'
    });
  }
});

// @desc    Obtenir les commandes d'un restaurant
// @route   GET /api/catalog/orders
// @access  Private (restaurants et collectivités)
export const getClientOrders = asyncHandler(async (req, res) => {
  try {
    const orders = await Order.find({ client: req.user._id })
      .populate('supplier', 'name businessName')
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map(order => ({
      id: order._id,
      supplierName: order.supplier.businessName || order.supplier.name,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items
    }));

    res.status(200).json({
      success: true,
      orders: formattedOrders
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes'
    });
  }
});

