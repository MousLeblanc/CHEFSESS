// routes/deliveryReceiptRoutes.js
// Routes pour la gestion des formulaires de réception de marchandises
import express from 'express';
import asyncHandler from 'express-async-handler';
import DeliveryReceipt from '../models/DeliveryReceipt.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Créer un formulaire de réception
// @route   POST /api/delivery-receipts
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const {
    orderId,
    orderNumber,
    deliveryDate,
    deliveryTime,
    productIdentification,
    supplier,
    packaging,
    transport,
    organolepticExamination,
    acceptanceStatus,
    acceptanceNotes,
    productLabelling
  } = req.body;
  
  // Vérifier si un formulaire existe déjà pour cette commande
  if (orderId) {
    const existing = await DeliveryReceipt.findOne({ order: orderId });
    if (existing) {
      return res.status(400).json({ 
        message: 'Un formulaire de réception existe déjà pour cette commande',
        receipt: existing
      });
    }
  }
  
  const receipt = await DeliveryReceipt.create({
    groupId: req.user.groupId,
    siteId: req.user.siteId,
    order: orderId,
    orderNumber: orderNumber,
    deliveryDate: deliveryDate || new Date(),
    deliveryTime: deliveryTime,
    productIdentification: productIdentification || {},
    supplier: supplier || {},
    packaging: packaging || {},
    transport: transport || {},
    organolepticExamination: organolepticExamination || {},
    acceptanceStatus: acceptanceStatus || 'accepted',
    acceptanceNotes: acceptanceNotes,
    productLabelling: productLabelling || {},
    checkedBy: req.user._id
  });
  
  // Si la marchandise est acceptée, mettre à jour le statut de la commande
  if (orderId && acceptanceStatus === 'accepted') {
    const order = await Order.findById(orderId);
    if (order && order.status !== 'delivered') {
      order.status = 'delivered';
      order.dates.delivered = new Date();
      await order.save();
    }
  }
  
  res.status(201).json({
    success: true,
    data: receipt
  });
}));

// @desc    Obtenir tous les formulaires de réception
// @route   GET /api/delivery-receipts
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const { archived, status, startDate, endDate } = req.query;
  
  const query = {};
  
  // Filtrage par site/groupe
  if (req.user.siteId) {
    query.siteId = req.user.siteId;
  } else if (req.user.groupId) {
    query.groupId = req.user.groupId;
  }
  
  // Filtrage par archivage
  if (archived !== undefined) {
    query.archived = archived === 'true';
  }
  
  // Filtrage par statut d'acceptation
  if (status) {
    query.acceptanceStatus = status;
  }
  
  // Filtrage par date
  if (startDate || endDate) {
    query.deliveryDate = {};
    if (startDate) {
      query.deliveryDate.$gte = new Date(startDate);
    }
    if (endDate) {
      query.deliveryDate.$lte = new Date(endDate);
    }
  }
  
  const receipts = await DeliveryReceipt.find(query)
    .populate('order', 'orderNumber status')
    .populate('checkedBy', 'name email')
    .populate('supplier', 'businessName name')
    .sort({ deliveryDate: -1 });
  
  res.json({
    success: true,
    count: receipts.length,
    data: receipts
  });
}));

// @desc    Obtenir un formulaire de réception par ID
// @route   GET /api/delivery-receipts/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const receipt = await DeliveryReceipt.findById(req.params.id)
    .populate('order', 'orderNumber status items')
    .populate('checkedBy', 'name email')
    .populate('supplier', 'businessName name address');
  
  if (!receipt) {
    res.status(404);
    throw new Error('Formulaire de réception non trouvé');
  }
  
  // Vérifier les permissions
  if (req.user.siteId && receipt.siteId && receipt.siteId.toString() !== req.user.siteId.toString()) {
    res.status(403);
    throw new Error('Accès non autorisé à ce formulaire');
  }
  
  res.json({
    success: true,
    data: receipt
  });
}));

// @desc    Mettre à jour un formulaire de réception
// @route   PUT /api/delivery-receipts/:id
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const receipt = await DeliveryReceipt.findById(req.params.id);
  
  if (!receipt) {
    res.status(404);
    throw new Error('Formulaire de réception non trouvé');
  }
  
  // Vérifier les permissions
  if (req.user.siteId && receipt.siteId && receipt.siteId.toString() !== req.user.siteId.toString()) {
    res.status(403);
    throw new Error('Accès non autorisé à ce formulaire');
  }
  
  // Mettre à jour les champs
  const {
    deliveryDate,
    deliveryTime,
    productIdentification,
    supplier,
    packaging,
    transport,
    organolepticExamination,
    acceptanceStatus,
    acceptanceNotes,
    productLabelling,
    signature
  } = req.body;
  
  if (deliveryDate) receipt.deliveryDate = deliveryDate;
  if (deliveryTime) receipt.deliveryTime = deliveryTime;
  if (productIdentification) receipt.productIdentification = { ...receipt.productIdentification, ...productIdentification };
  if (supplier) receipt.supplier = { ...receipt.supplier, ...supplier };
  if (packaging) receipt.packaging = { ...receipt.packaging, ...packaging };
  if (transport) receipt.transport = { ...receipt.transport, ...transport };
  if (organolepticExamination) receipt.organolepticExamination = { ...receipt.organolepticExamination, ...organolepticExamination };
  if (acceptanceStatus) receipt.acceptanceStatus = acceptanceStatus;
  if (acceptanceNotes !== undefined) receipt.acceptanceNotes = acceptanceNotes;
  if (productLabelling) receipt.productLabelling = { ...receipt.productLabelling, ...productLabelling };
  if (signature) receipt.signature = signature;
  
  receipt.updatedAt = new Date();
  
  const updatedReceipt = await receipt.save();
  
  // Si la marchandise est acceptée, mettre à jour le statut de la commande
  if (updatedReceipt.order && acceptanceStatus === 'accepted') {
    const order = await Order.findById(updatedReceipt.order);
    if (order && order.status !== 'delivered') {
      order.status = 'delivered';
      order.dates.delivered = new Date();
      await order.save();
    }
  }
  
  res.json({
    success: true,
    data: updatedReceipt
  });
}));

// @desc    Archiver un formulaire de réception
// @route   PUT /api/delivery-receipts/:id/archive
// @access  Private
router.put('/:id/archive', protect, asyncHandler(async (req, res) => {
  const receipt = await DeliveryReceipt.findById(req.params.id);
  
  if (!receipt) {
    res.status(404);
    throw new Error('Formulaire de réception non trouvé');
  }
  
  receipt.archived = true;
  receipt.archivedAt = new Date();
  
  await receipt.save();
  
  res.json({
    success: true,
    data: receipt
  });
}));

// @desc    Supprimer un formulaire de réception
// @route   DELETE /api/delivery-receipts/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const receipt = await DeliveryReceipt.findById(req.params.id);
  
  if (!receipt) {
    res.status(404);
    throw new Error('Formulaire de réception non trouvé');
  }
  
  // Vérifier les permissions (seul l'auteur ou un admin peut supprimer)
  if (receipt.checkedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Accès non autorisé');
  }
  
  await receipt.deleteOne();
  
  res.json({
    success: true,
    message: 'Formulaire de réception supprimé'
  });
}));

// @desc    Obtenir les statistiques des réceptions
// @route   GET /api/delivery-receipts/stats/summary
// @access  Private
router.get('/stats/summary', protect, asyncHandler(async (req, res) => {
  const query = {};
  
  if (req.user.siteId) {
    query.siteId = req.user.siteId;
  } else if (req.user.groupId) {
    query.groupId = req.user.groupId;
  }
  
  const total = await DeliveryReceipt.countDocuments(query);
  const accepted = await DeliveryReceipt.countDocuments({ ...query, acceptanceStatus: 'accepted' });
  const conditionallyAccepted = await DeliveryReceipt.countDocuments({ ...query, acceptanceStatus: 'conditionally_accepted' });
  const refused = await DeliveryReceipt.countDocuments({ ...query, acceptanceStatus: 'refused' });
  const archived = await DeliveryReceipt.countDocuments({ ...query, archived: true });
  
  res.json({
    success: true,
    data: {
      total,
      accepted,
      conditionallyAccepted,
      refused,
      archived,
      pending: total - accepted - conditionallyAccepted - refused
    }
  });
}));

export default router;

