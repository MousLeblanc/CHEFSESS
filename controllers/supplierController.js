import asyncHandler from 'express-async-handler';
import Supplier from '../models/Supplier.js';

// @desc    Récupérer tous les fournisseurs
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = asyncHandler(async (req, res) => {
  const { search, category, status, establishmentType } = req.query;
  
  console.log('🔍 [getSuppliers] req.user:', {
    id: req.user.id,
    role: req.user.role,
    roles: req.user.roles,
    groupId: req.user.groupId,
    siteId: req.user.siteId
  });
  
  // Construction du filtre
  let filter = {};
  
  // Filtrer par groupe si l'utilisateur a un groupId
  // Exception: Les GROUP_ADMIN peuvent voir tous les fournisseurs de leur groupe
  if (req.user.groupId) {
    filter.groupId = req.user.groupId;
    console.log('🔍 Filtre par req.user.groupId:', req.user.groupId);
  } else if (req.user.siteId && req.user.siteId.groupId) {
    filter.groupId = req.user.siteId.groupId;
    console.log('🔍 Filtre par req.user.siteId.groupId:', req.user.siteId.groupId);
  } else {
    console.log('⚠️ Aucun groupId trouvé - récupération de TOUS les fournisseurs');
  }
  
  // Filtre par type d'établissement
  if (establishmentType) {
    filter.establishmentType = establishmentType;
  }
  
  // Filtre par statut
  if (status) {
    filter.status = status;
  }
  
  // Filtre par catégorie
  if (category) {
    filter.categories = { $in: [category] };
  }
  
  // Recherche textuelle
  if (search) {
    filter.$text = { $search: search };
  }
  
  console.log('🔍 Filtre final fournisseurs:', JSON.stringify(filter));
  
  const suppliers = await Supplier.find(filter)
    .populate('createdBy', 'name email')
    .populate('groupId', 'name')
    .sort({ createdAt: -1 });
  
  console.log(`✅ ${suppliers.length} fournisseurs trouvés`);
  
  if (suppliers.length > 0) {
    console.log('📦 Premier fournisseur:', {
      name: suppliers[0].name,
      groupId: suppliers[0].groupId,
      productsCount: suppliers[0].products?.length || 0
    });
  }
  
  res.json({
    success: true,
    count: suppliers.length,
    data: suppliers
  });
});

// @desc    Récupérer un fournisseur par ID
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id)
    .populate('createdBy', 'name email');
  
  if (!supplier) {
    res.status(404);
    throw new Error('Fournisseur non trouvé');
  }

        res.json({
    success: true,
    data: supplier
  });
});

// @desc    Créer un nouveau fournisseur
// @route   POST /api/suppliers
// @access  Private
const createSupplier = asyncHandler(async (req, res) => {
  const {
    name,
    contact,
    email,
    phone,
    address,
    categories,
    status,
    rating,
    notes,
    establishmentType
  } = req.body;
  
  // Vérifier si le fournisseur existe déjà
  const existingSupplier = await Supplier.findOne({ 
    email,
    createdBy: req.user.id 
  });
  
  if (existingSupplier) {
        res.status(400);
    throw new Error('Un fournisseur avec cet email existe déjà');
    }

  const supplier = await Supplier.create({
        name,
    contact,
    email,
    phone,
    address: address || {},
    categories: categories || [],
    status: status || 'active',
    rating: rating || 3,
    notes,
    createdBy: req.user.id,
    establishmentType: establishmentType || req.user.establishmentType
  });
  
  res.status(201).json({
    success: true,
    data: supplier
  });
});

// @desc    Mettre à jour un fournisseur
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
        res.status(404);
    throw new Error('Fournisseur non trouvé');
  }
  
  // Vérifier que l'utilisateur est le créateur du fournisseur
  if (supplier.createdBy.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Non autorisé à modifier ce fournisseur');
  }
  
  const updatedSupplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');
  
  res.json({
    success: true,
    data: updatedSupplier
  });
});

// @desc    Supprimer un fournisseur
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  
    if (!supplier) {
        res.status(404);
    throw new Error('Fournisseur non trouvé');
  }
  
  // Vérifier que l'utilisateur est le créateur du fournisseur
  if (supplier.createdBy.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Non autorisé à supprimer ce fournisseur');
  }
  
  await Supplier.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Fournisseur supprimé avec succès'
  });
});

// @desc    Obtenir les statistiques des fournisseurs
// @route   GET /api/suppliers/stats
// @access  Private
const getSupplierStats = asyncHandler(async (req, res) => {
  const { establishmentType } = req.query;
  
  let filter = { createdBy: req.user.id };
  if (establishmentType) {
    filter.establishmentType = establishmentType;
  }
  
  const stats = await Supplier.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        inactive: {
          $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
        },
        suspended: {
          $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
        },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  
  const categoryStats = await Supplier.aggregate([
    { $match: filter },
    { $unwind: '$categories' },
    {
      $group: {
        _id: '$categories',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  res.json({
    success: true,
    data: {
      overview: stats[0] || { total: 0, active: 0, inactive: 0, suspended: 0, avgRating: 0 },
      categories: categoryStats
    }
  });
});

// @desc    Seed les 15 fournisseurs initiaux
// @route   POST /api/suppliers/seed
// @access  Private (Admin only)
const seedSuppliers = asyncHandler(async (req, res) => {
  console.log('🌱 Démarrage du seed des fournisseurs...');
  
  // Vérifier que l'utilisateur est admin
  if (!req.user.roles || !req.user.roles.includes('GROUP_ADMIN')) {
    res.status(403);
    throw new Error('Seuls les administrateurs peuvent initialiser les fournisseurs');
  }

  const groupId = req.user.groupId || req.user.siteId?.groupId;
  
  if (!groupId) {
    res.status(400);
    throw new Error('Impossible de déterminer le groupe');
  }

  const suppliersData = [
    {
      name: "Poissonnerie La Mer du Nord",
      contact: "Jean Dupont",
      email: "contact@poissonneriemerdunord.be",
      phone: "+32 2 345 67 89",
      address: {
        street: "15 Quai aux Briques",
        city: "Bruxelles",
        postalCode: "1000",
        country: "Belgique"
      },
      type: "poissonnier",
      isBio: false,
      products: [
        { name: "Saumon frais", category: "Poisson", unit: "kg", price: 18.50, stock: 150, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-15') } },
        { name: "Cabillaud", category: "Poisson", unit: "kg", price: 14.20, stock: 200, promotion: { active: false } },
        { name: "Moules", category: "Fruits de mer", unit: "kg", price: 4.50, stock: 300, promotion: { active: false } },
        { name: "Crevettes grises", category: "Fruits de mer", unit: "kg", price: 22.00, stock: 80, promotion: { active: true, discountPercent: 15, endDate: new Date('2025-11-10') } },
        { name: "Sole", category: "Poisson", unit: "kg", price: 28.00, stock: 50, promotion: { active: false } },
        { name: "Thon", category: "Poisson", unit: "kg", price: 20.00, stock: 120, promotion: { active: false } }
      ]
    },
    {
      name: "Boucherie de la Ferme",
      contact: "Pierre Martin",
      email: "contact@boucherieferme.be",
      phone: "+32 2 456 78 90",
      address: {
        street: "28 Rue du Marché",
        city: "Liège",
        postalCode: "4000",
        country: "Belgique"
      },
      type: "boucher",
      isBio: false,
      products: [
        { name: "Bœuf haché", category: "Viande", unit: "kg", price: 12.00, stock: 250, promotion: { active: false } },
        { name: "Poulet fermier", category: "Volaille", unit: "kg", price: 8.50, stock: 200, promotion: { active: true, discountPercent: 5, endDate: new Date('2025-11-20') } },
        { name: "Côtelettes de porc", category: "Viande", unit: "kg", price: 10.00, stock: 180, promotion: { active: false } },
        { name: "Agneau", category: "Viande", unit: "kg", price: 16.00, stock: 100, promotion: { active: false } },
        { name: "Saucisses", category: "Charcuterie", unit: "kg", price: 7.50, stock: 150, promotion: { active: false } },
        { name: "Jambon blanc", category: "Charcuterie", unit: "kg", price: 9.00, stock: 120, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-12') } }
      ]
    },
    {
      name: "Volailles du Brabant",
      contact: "Marie Dubois",
      email: "contact@volaillesbrabant.be",
      phone: "+32 2 567 89 01",
      address: {
        street: "42 Chaussée de Wavre",
        city: "Bruxelles",
        postalCode: "1050",
        country: "Belgique"
      },
      type: "boucher",
      isBio: false,
      products: [
        { name: "Poulet entier", category: "Volaille", unit: "kg", price: 7.80, stock: 300, promotion: { active: false } },
        { name: "Cuisses de poulet", category: "Volaille", unit: "kg", price: 6.50, stock: 250, promotion: { active: true, discountPercent: 8, endDate: new Date('2025-11-18') } },
        { name: "Dinde", category: "Volaille", unit: "kg", price: 9.00, stock: 150, promotion: { active: false } },
        { name: "Canard", category: "Volaille", unit: "kg", price: 12.00, stock: 80, promotion: { active: false } },
        { name: "Lapin", category: "Viande", unit: "kg", price: 11.00, stock: 100, promotion: { active: false } },
        { name: "Foie gras", category: "Volaille", unit: "kg", price: 45.00, stock: 30, promotion: { active: false } }
      ]
    },
    {
      name: "Épicerie Bio Nature",
      contact: "Sophie Laurent",
      email: "contact@bionature.be",
      phone: "+32 2 678 90 12",
      address: {
        street: "7 Avenue Louise",
        city: "Bruxelles",
        postalCode: "1050",
        country: "Belgique"
      },
      type: "epicier",
      isBio: true,
      products: [
        { name: "Riz complet bio", category: "Féculents", unit: "kg", price: 3.50, stock: 500, promotion: { active: false } },
        { name: "Quinoa bio", category: "Féculents", unit: "kg", price: 5.00, stock: 200, promotion: { active: true, discountPercent: 12, endDate: new Date('2025-11-25') } },
        { name: "Lentilles bio", category: "Légumineuses", unit: "kg", price: 4.00, stock: 300, promotion: { active: false } },
        { name: "Pâtes complètes bio", category: "Féculents", unit: "kg", price: 2.80, stock: 400, promotion: { active: false } },
        { name: "Huile d'olive bio", category: "Condiments", unit: "L", price: 12.00, stock: 150, promotion: { active: false } },
        { name: "Miel bio", category: "Sucres", unit: "kg", price: 15.00, stock: 80, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-12-01') } }
      ]
    },
    {
      name: "Primeur du Jardin",
      contact: "Luc Petit",
      email: "contact@primeurjardin.be",
      phone: "+32 2 789 01 23",
      address: {
        street: "12 Place Sainte-Catherine",
        city: "Bruxelles",
        postalCode: "1000",
        country: "Belgique"
      },
      type: "primeur",
      isBio: false,
      products: [
        { name: "Tomates", category: "Légumes", unit: "kg", price: 2.50, stock: 400, promotion: { active: false } },
        { name: "Carottes", category: "Légumes", unit: "kg", price: 1.80, stock: 500, promotion: { active: true, discountPercent: 15, endDate: new Date('2025-11-10') } },
        { name: "Pommes de terre", category: "Féculents", unit: "kg", price: 1.20, stock: 600, promotion: { active: false } },
        { name: "Pommes Golden", category: "Fruits", unit: "kg", price: 2.00, stock: 350, promotion: { active: false } },
        { name: "Oranges", category: "Fruits", unit: "kg", price: 2.80, stock: 300, promotion: { active: false } },
        { name: "Bananes", category: "Fruits", unit: "kg", price: 1.50, stock: 400, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-12') } }
      ]
    },
    {
      name: "Crémerie Fromages d'Antan",
      contact: "François Leroy",
      email: "contact@fromagesantan.be",
      phone: "+32 2 890 12 34",
      address: {
        street: "9 Rue des Bouchers",
        city: "Bruxelles",
        postalCode: "1000",
        country: "Belgique"
      },
      type: "cremier",
      isBio: false,
      products: [
        { name: "Camembert", category: "Fromages", unit: "kg", price: 14.00, stock: 120, promotion: { active: false } },
        { name: "Brie", category: "Fromages", unit: "kg", price: 12.50, stock: 150, promotion: { active: false } },
        { name: "Comté", category: "Fromages", unit: "kg", price: 18.00, stock: 100, promotion: { active: true, discountPercent: 8, endDate: new Date('2025-11-22') } },
        { name: "Chèvre frais", category: "Fromages", unit: "kg", price: 15.00, stock: 80, promotion: { active: false } },
        { name: "Yaourt nature", category: "Produits laitiers", unit: "L", price: 3.50, stock: 200, promotion: { active: false } },
        { name: "Beurre", category: "Produits laitiers", unit: "kg", price: 8.00, stock: 250, promotion: { active: false } }
      ]
    },
    {
      name: "Boulangerie Artisanale du Pain",
      contact: "Marc Boulanger",
      email: "contact@boulangeriepain.be",
      phone: "+32 2 901 23 45",
      address: {
        street: "5 Rue de Flandre",
        city: "Bruxelles",
        postalCode: "1000",
        country: "Belgique"
      },
      type: "boulanger",
      isBio: false,
      products: [
        { name: "Pain blanc", category: "Pain", unit: "pièce", price: 2.50, stock: 500, promotion: { active: false } },
        { name: "Pain complet", category: "Pain", unit: "pièce", price: 3.00, stock: 400, promotion: { active: true, discountPercent: 5, endDate: new Date('2025-11-15') } },
        { name: "Croissants", category: "Viennoiseries", unit: "pièce", price: 1.50, stock: 600, promotion: { active: false } },
        { name: "Baguette tradition", category: "Pain", unit: "pièce", price: 1.80, stock: 550, promotion: { active: false } },
        { name: "Brioche", category: "Viennoiseries", unit: "pièce", price: 4.00, stock: 200, promotion: { active: false } },
        { name: "Pain aux céréales", category: "Pain", unit: "pièce", price: 3.50, stock: 350, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-20') } }
      ]
    },
    {
      name: "Grossiste Metro Pro",
      contact: "David Vandenberghe",
      email: "contact@metropro.be",
      phone: "+32 2 012 34 56",
      address: {
        street: "100 Boulevard Industriel",
        city: "Anderlecht",
        postalCode: "1070",
        country: "Belgique"
      },
      type: "grossiste",
      isBio: false,
      products: [
        { name: "Huile de tournesol", category: "Condiments", unit: "L", price: 4.50, stock: 800, promotion: { active: false } },
        { name: "Sucre blanc", category: "Sucres", unit: "kg", price: 1.20, stock: 1000, promotion: { active: false } },
        { name: "Sel fin", category: "Condiments", unit: "kg", price: 0.80, stock: 1200, promotion: { active: false } },
        { name: "Poivre noir", category: "Épices", unit: "kg", price: 15.00, stock: 150, promotion: { active: true, discountPercent: 20, endDate: new Date('2025-11-30') } },
        { name: "Vinaigre balsamique", category: "Condiments", unit: "L", price: 8.00, stock: 300, promotion: { active: false } },
        { name: "Moutarde", category: "Condiments", unit: "kg", price: 5.00, stock: 400, promotion: { active: false } }
      ]
    },
    {
      name: "Fruits Bio de Wallonie",
      contact: "Anne-Marie Dupuis",
      email: "contact@fruitsbiowallonie.be",
      phone: "+32 2 123 45 67",
      address: {
        street: "18 Rue du Verger",
        city: "Namur",
        postalCode: "5000",
        country: "Belgique"
      },
      type: "primeur",
      isBio: true,
      products: [
        { name: "Pommes bio", category: "Fruits", unit: "kg", price: 3.00, stock: 400, promotion: { active: false } },
        { name: "Poires bio", category: "Fruits", unit: "kg", price: 3.50, stock: 300, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-18') } },
        { name: "Fraises bio", category: "Fruits", unit: "kg", price: 8.00, stock: 100, promotion: { active: false } },
        { name: "Raisins bio", category: "Fruits", unit: "kg", price: 5.00, stock: 200, promotion: { active: false } },
        { name: "Kiwis bio", category: "Fruits", unit: "kg", price: 4.50, stock: 150, promotion: { active: false } },
        { name: "Ananas bio", category: "Fruits", unit: "pièce", price: 4.00, stock: 120, promotion: { active: true, discountPercent: 15, endDate: new Date('2025-11-25') } }
      ]
    },
    {
      name: "Légumes du Potager",
      contact: "Claude Masson",
      email: "contact@legumespotager.be",
      phone: "+32 2 234 56 78",
      address: {
        street: "22 Chemin des Champs",
        city: "Charleroi",
        postalCode: "6000",
        country: "Belgique"
      },
      type: "primeur",
      isBio: false,
      products: [
        { name: "Courgettes", category: "Légumes", unit: "kg", price: 2.20, stock: 350, promotion: { active: false } },
        { name: "Aubergines", category: "Légumes", unit: "kg", price: 2.80, stock: 250, promotion: { active: false } },
        { name: "Poivrons", category: "Légumes", unit: "kg", price: 3.00, stock: 300, promotion: { active: true, discountPercent: 12, endDate: new Date('2025-11-15') } },
        { name: "Haricots verts", category: "Légumes", unit: "kg", price: 4.50, stock: 200, promotion: { active: false } },
        { name: "Épinards", category: "Légumes", unit: "kg", price: 3.50, stock: 180, promotion: { active: false } },
        { name: "Choux-fleurs", category: "Légumes", unit: "pièce", price: 2.50, stock: 150, promotion: { active: false } }
      ]
    },
    {
      name: "Épicerie Fine Delhaize Pro",
      contact: "Isabelle Renard",
      email: "contact@delhaizepro.be",
      phone: "+32 2 345 67 89",
      address: {
        street: "50 Avenue de la Gare",
        city: "Mons",
        postalCode: "7000",
        country: "Belgique"
      },
      type: "grossiste",
      isBio: false,
      products: [
        { name: "Café moulu", category: "Boissons", unit: "kg", price: 12.00, stock: 300, promotion: { active: false } },
        { name: "Thé vert", category: "Boissons", unit: "kg", price: 18.00, stock: 150, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-30') } },
        { name: "Chocolat noir", category: "Sucres", unit: "kg", price: 15.00, stock: 200, promotion: { active: false } },
        { name: "Confiture fraise", category: "Sucres", unit: "kg", price: 8.00, stock: 250, promotion: { active: false } },
        { name: "Farine blanche", category: "Féculents", unit: "kg", price: 1.50, stock: 600, promotion: { active: false } },
        { name: "Levure", category: "Ingrédients", unit: "kg", price: 10.00, stock: 100, promotion: { active: false } }
      ]
    },
    {
      name: "Poissonnerie Océan Frais",
      contact: "Bernard Lacroix",
      email: "contact@oceanfrais.be",
      phone: "+32 2 456 78 90",
      address: {
        street: "8 Quai du Commerce",
        city: "Ostende",
        postalCode: "8400",
        country: "Belgique"
      },
      type: "poissonnier",
      isBio: false,
      products: [
        { name: "Bar", category: "Poisson", unit: "kg", price: 22.00, stock: 80, promotion: { active: false } },
        { name: "Dorade", category: "Poisson", unit: "kg", price: 18.00, stock: 100, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-20') } },
        { name: "Truite", category: "Poisson", unit: "kg", price: 12.00, stock: 150, promotion: { active: false } },
        { name: "Homard", category: "Fruits de mer", unit: "kg", price: 45.00, stock: 30, promotion: { active: false } },
        { name: "Huîtres", category: "Fruits de mer", unit: "pièce", price: 2.50, stock: 500, promotion: { active: false } },
        { name: "Saint-Jacques", category: "Fruits de mer", unit: "kg", price: 35.00, stock: 40, promotion: { active: true, discountPercent: 15, endDate: new Date('2025-11-25') } }
      ]
    },
    {
      name: "Boucherie Halal Al-Iman",
      contact: "Ahmed Hassan",
      email: "contact@boucheriehalal.be",
      phone: "+32 2 567 89 01",
      address: {
        street: "33 Chaussée de Gand",
        city: "Bruxelles",
        postalCode: "1080",
        country: "Belgique"
      },
      type: "boucher",
      isBio: false,
      products: [
        { name: "Bœuf halal", category: "Viande", unit: "kg", price: 13.00, stock: 200, promotion: { active: false } },
        { name: "Poulet halal", category: "Volaille", unit: "kg", price: 9.00, stock: 250, promotion: { active: true, discountPercent: 8, endDate: new Date('2025-11-22') } },
        { name: "Agneau halal", category: "Viande", unit: "kg", price: 17.00, stock: 120, promotion: { active: false } },
        { name: "Merguez halal", category: "Charcuterie", unit: "kg", price: 8.50, stock: 150, promotion: { active: false } },
        { name: "Kefta halal", category: "Viande", unit: "kg", price: 11.00, stock: 180, promotion: { active: false } },
        { name: "Brochettes halal", category: "Viande", unit: "kg", price: 12.00, stock: 100, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-18') } }
      ]
    },
    {
      name: "Légumes Bio Terre Vivante",
      contact: "Christine Moreau",
      email: "contact@terrevivante.be",
      phone: "+32 2 678 90 12",
      address: {
        street: "14 Rue de la Terre",
        city: "Louvain-la-Neuve",
        postalCode: "1348",
        country: "Belgique"
      },
      type: "primeur",
      isBio: true,
      products: [
        { name: "Betteraves bio", category: "Légumes", unit: "kg", price: 2.50, stock: 300, promotion: { active: false } },
        { name: "Céleris bio", category: "Légumes", unit: "kg", price: 3.00, stock: 200, promotion: { active: false } },
        { name: "Radis bio", category: "Légumes", unit: "kg", price: 2.80, stock: 250, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-15') } },
        { name: "Navets bio", category: "Légumes", unit: "kg", price: 2.00, stock: 280, promotion: { active: false } },
        { name: "Brocolis bio", category: "Légumes", unit: "kg", price: 4.00, stock: 180, promotion: { active: false } },
        { name: "Choux de Bruxelles bio", category: "Légumes", unit: "kg", price: 3.50, stock: 220, promotion: { active: false } }
      ]
    },
    {
      name: "Épicerie du Monde",
      contact: "Nicolas Bertrand",
      email: "contact@epiceriedumonde.be",
      phone: "+32 2 789 01 23",
      address: {
        street: "45 Rue de l'Orient",
        city: "Bruxelles",
        postalCode: "1000",
        country: "Belgique"
      },
      type: "epicier",
      isBio: false,
      products: [
        { name: "Couscous", category: "Féculents", unit: "kg", price: 2.50, stock: 400, promotion: { active: false } },
        { name: "Riz basmati", category: "Féculents", unit: "kg", price: 3.00, stock: 500, promotion: { active: true, discountPercent: 15, endDate: new Date('2025-11-28') } },
        { name: "Harissa", category: "Condiments", unit: "kg", price: 8.00, stock: 150, promotion: { active: false } },
        { name: "Tahini", category: "Condiments", unit: "kg", price: 12.00, stock: 100, promotion: { active: false } },
        { name: "Dattes", category: "Fruits", unit: "kg", price: 6.00, stock: 200, promotion: { active: false } },
        { name: "Pois chiches", category: "Légumineuses", unit: "kg", price: 3.50, stock: 350, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-20') } }
      ]
    }
  ];

  let createdCount = 0;
  let skippedCount = 0;

  for (const supplierData of suppliersData) {
    try {
      // Vérifier si le fournisseur existe déjà
      const existingSupplier = await Supplier.findOne({ 
        name: supplierData.name,
        groupId: groupId
      });

      if (existingSupplier) {
        console.log(`⏭️  Fournisseur déjà existant : ${supplierData.name}`);
        skippedCount++;
        continue;
      }

      // Créer le fournisseur
      const newSupplier = await Supplier.create({
        ...supplierData,
        groupId: groupId,
        status: 'active',
        rating: 4
      });

      console.log(`✅ Fournisseur créé : ${newSupplier.name} avec ${newSupplier.products.length} produits`);
      createdCount++;
    } catch (error) {
      console.error(`❌ Erreur création ${supplierData.name}:`, error.message);
    }
  }

  console.log(`\n🎉 Seed terminé : ${createdCount} créés, ${skippedCount} ignorés`);

  res.json({
    success: true,
    message: `Seed terminé avec succès`,
    created: createdCount,
    skipped: skippedCount,
    total: suppliersData.length
  });
});

export {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStats,
  seedSuppliers
};