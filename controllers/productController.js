import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';

// ✅ Créer un produit (fournisseur)
export const createProduct = async (req, res) => {
  try {
    // Chercher le fournisseur par supplierId de l'utilisateur connecté
    const supplier = await Supplier.findById(req.user.supplierId);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    // Ajouter le produit au tableau products du fournisseur
    supplier.products.push(req.body);
    await supplier.save();

    res.status(201).json({ 
      success: true, 
      message: 'Produit ajouté avec succès',
      product: supplier.products[supplier.products.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Voir tous les produits (optionnel pour les acheteurs/admin)
export const getAllProducts = async (req, res) => {
  try {
    // Récupérer tous les fournisseurs et leurs produits
    const suppliers = await Supplier.find({ groupId: req.user.groupId }).populate('groupId', 'name');
    
    // Extraire tous les produits de tous les fournisseurs
    const allProducts = [];
    suppliers.forEach(supplier => {
      if (supplier.products && supplier.products.length > 0) {
        supplier.products.forEach(product => {
          allProducts.push({
            ...product.toObject(),
            supplierName: supplier.name,
            supplierId: supplier._id
          });
        });
      }
    });
    
    res.json(allProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Voir les produits du fournisseur connecté
export const getProductsBySupplier = async (req, res) => {
  try {
    const supplierId = req.params.supplierId || req.user.supplierId;
    
    console.log('🔍 [getProductsBySupplier] supplierId:', supplierId);
    console.log('🔍 [getProductsBySupplier] req.params:', req.params);
    console.log('🔍 [getProductsBySupplier] req.user.supplierId:', req.user?.supplierId);
    
    if (!supplierId) {
      console.error('❌ ID fournisseur manquant');
      return res.status(400).json({ 
        success: false,
        message: 'ID fournisseur manquant' 
      });
    }

    const supplier = await Supplier.findById(supplierId);
    
    console.log('🔍 [getProductsBySupplier] Fournisseur trouvé:', supplier ? supplier.name : 'NULL');
    console.log('🔍 [getProductsBySupplier] Nombre de produits:', supplier?.products?.length || 0);
    
    if (!supplier) {
      console.error('❌ Fournisseur non trouvé pour ID:', supplierId);
      return res.status(404).json({ 
        success: false,
        message: 'Fournisseur non trouvé',
        supplierId: supplierId
      });
    }

    // Retourner les produits du fournisseur
    console.log('✅ Envoi de', supplier.products?.length || 0, 'produits');
    res.json(supplier.products || []);
  } catch (error) {
    console.error('❌ [getProductsBySupplier] Erreur:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Modifier un produit (fournisseur)
export const updateProduct = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.user.supplierId);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    // Trouver le produit dans le tableau
    const productIndex = supplier.products.findIndex(p => p._id.toString() === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Mettre à jour le produit
    Object.assign(supplier.products[productIndex], req.body);
    await supplier.save();

    res.json({ 
      success: true, 
      message: 'Produit modifié avec succès',
      product: supplier.products[productIndex]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Supprimer un produit (fournisseur)
export const deleteProduct = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.user.supplierId);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    // Trouver et supprimer le produit du tableau
    const productIndex = supplier.products.findIndex(p => p._id.toString() === req.params.id);
    
    if (productIndex === -1) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    supplier.products.splice(productIndex, 1);
    await supplier.save();

    res.json({ 
      success: true, 
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
