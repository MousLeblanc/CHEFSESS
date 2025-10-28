import Product from '../models/Product.js';

// ✅ Créer un produit (fournisseur)
export const createProduct = async (req, res) => {
  try {
    console.log('📦 [createProduct] User:', req.user.id, 'Role:', req.user.role);
    
    // Vérifier que l'utilisateur est un fournisseur
    if (req.user.role !== 'fournisseur') {
      return res.status(403).json({ 
        success: false,
        message: 'Seuls les fournisseurs peuvent ajouter des produits' 
      });
    }

    // Créer le produit avec le supplier = ID du user fournisseur
    const productData = {
      ...req.body,
      supplier: req.user.id  // L'ID du User fournisseur connecté
    };

    const product = await Product.create(productData);
    
    console.log('✅ Produit créé:', product.name, 'par', req.user.id);

    res.status(201).json({ 
      success: true, 
      message: 'Produit ajouté avec succès',
      data: product
    });
  } catch (error) {
    console.error('❌ Erreur création produit:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Voir MES produits (fournisseur connecté)
export const getMyProducts = async (req, res) => {
  try {
    console.log('📦 [getMyProducts] User:', req.user.id, 'Role:', req.user.role);
    
    const products = await Product.find({ supplier: req.user.id })
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${products.length} produits trouvés pour fournisseur ${req.user.id}`);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('❌ Erreur récupération produits:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Voir tous les produits (pour les acheteurs/sites)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ active: true })
      .populate('supplier', 'name email businessName phone')
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${products.length} produits actifs trouvés`);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('❌ Erreur récupération tous produits:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Voir les produits d'un fournisseur spécifique
export const getProductsBySupplier = async (req, res) => {
  try {
    const supplierId = req.params.supplierId;
    
    console.log('🔍 [getProductsBySupplier] supplierId:', supplierId);
    
    const products = await Product.find({ 
      supplier: supplierId,
      active: true 
    }).sort({ createdAt: -1 });
    
    console.log(`✅ ${products.length} produits trouvés pour fournisseur ${supplierId}`);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('❌ Erreur récupération produits fournisseur:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Modifier un produit (fournisseur)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Produit non trouvé' 
      });
    }

    // Vérifier que le produit appartient au fournisseur connecté
    if (product.supplier.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé à modifier ce produit' 
      });
    }

    // Mettre à jour le produit
    Object.assign(product, req.body);
    await product.save();

    console.log('✅ Produit modifié:', product.name);

    res.json({ 
      success: true, 
      message: 'Produit modifié avec succès',
      data: product
    });
  } catch (error) {
    console.error('❌ Erreur modification produit:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ✅ Supprimer un produit (fournisseur)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Produit non trouvé' 
      });
    }

    // Vérifier que le produit appartient au fournisseur connecté
    if (product.supplier.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Non autorisé à supprimer ce produit' 
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    console.log('✅ Produit supprimé:', product.name);

    res.json({ 
      success: true, 
      message: 'Produit supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur suppression produit:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

export default {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductsBySupplier,
  updateProduct,
  deleteProduct
};
