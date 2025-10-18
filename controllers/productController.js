import Product from '../models/Product.js';

// ✅ Créer un produit (fournisseur)
export const createProduct = async (req, res) => {
  const product = new Product({ ...req.body, supplier: req.user.id });
  await product.save();
  res.status(201).json(product);
};

// ✅ Voir tous les produits (optionnel pour les acheteurs/admin)
export const getAllProducts = async (req, res) => {
  const products = await Product.find().populate('supplier', 'name');
  res.json(products);
};

// ✅ Voir les produits du fournisseur connecté
export const getProductsBySupplier = async (req, res) => {
  const supplierId = req.params.supplierId || req.user.id;
  const products = await Product.find({ supplier: supplierId });
  res.json(products);
};

// ✅ Modifier un produit (fournisseur)
export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.supplier.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: "Non autorisé" });
  }
  Object.assign(product, req.body);
  await product.save();
  res.json(product);
};

// ✅ Supprimer un produit (fournisseur)
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.supplier.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: "Non autorisé" });
  }
  await product.deleteOne();
  res.json({ message: "Produit supprimé" });
};
