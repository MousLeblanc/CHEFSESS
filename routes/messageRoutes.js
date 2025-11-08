import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Site from '../models/Site.js';
import Group from '../models/Group.js';
import asyncHandler from 'express-async-handler';
import notificationService from '../services/notificationService.js';

const router = express.Router();

// @desc    Envoyer un message
// @route   POST /api/messages
// @access  Private (admin, groupe)
router.post('/', protect, asyncHandler(async (req, res) => {
  const { recipientsType, recipientIds, subject, content, priority } = req.body;
  
  // Logs de diagnostic pour voir ce qui est reçu
  console.log('📥 POST /api/messages - Données reçues:', {
    recipientsType,
    recipientIds,
    recipientIdsType: Array.isArray(recipientIds) ? 'array' : typeof recipientIds,
    recipientIdsLength: Array.isArray(recipientIds) ? recipientIds.length : 'N/A',
    subject,
    priority
  });
  
  // Vérifier que l'utilisateur est admin ou groupe admin
  if (req.user.role !== 'admin' && req.user.role !== 'groupe' && !req.user.roles?.includes('GROUP_ADMIN')) {
    res.status(403);
    throw new Error('Accès refusé. Seuls les administrateurs peuvent envoyer des messages.');
  }
  
  // Validation
  if (!recipientsType || !subject || !content) {
    res.status(400);
    throw new Error('Type de destinataires, sujet et contenu sont requis.');
  }
  
  // S'assurer que recipientIds est un tableau
  let recipientIdsArray = [];
  if (recipientIds) {
    if (Array.isArray(recipientIds)) {
      recipientIdsArray = recipientIds;
    } else if (typeof recipientIds === 'string') {
      // Si c'est une string, essayer de la parser ou la mettre dans un tableau
      recipientIdsArray = [recipientIds];
    } else {
      recipientIdsArray = [recipientIds];
    }
  }
  
  console.log('📋 recipientIdsArray après normalisation:', recipientIdsArray);
  
  // Préparer les IDs des destinataires selon le type
  let recipientObjectIds = [];
  let refModel = null;
  
  // Importer mongoose pour convertir les strings en ObjectId
  const mongoose = (await import('mongoose')).default;
  
  if (recipientsType === 'all_sites') {
    // Récupérer tous les sites du groupe
    const groupId = req.user.groupId || req.user._id;
    const sites = await Site.find({ groupId: groupId, isActive: true });
    recipientObjectIds = sites.map(s => s._id);
    refModel = 'Site';
    console.log(`📬 Message pour tous les sites (${recipientObjectIds.length} sites)`);
  } else if (recipientsType === 'site' && recipientIdsArray && recipientIdsArray.length > 0) {
    // Convertir les strings en ObjectId
    recipientObjectIds = recipientIdsArray.map(id => {
      try {
        return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
      } catch (e) {
        return id;
      }
    });
    refModel = 'Site';
    console.log(`📬 Message pour ${recipientObjectIds.length} site(s) spécifique(s):`, recipientObjectIds.map(id => id.toString()));
  } else if (recipientsType === 'user' && recipientIdsArray && recipientIdsArray.length > 0) {
    recipientObjectIds = recipientIdsArray.map(id => {
      try {
        return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
      } catch (e) {
        return id;
      }
    });
    refModel = 'User';
    console.log(`📬 Message pour ${recipientObjectIds.length} utilisateur(s) spécifique(s)`);
  } else if (recipientsType === 'group' && recipientIdsArray && recipientIdsArray.length > 0) {
    recipientObjectIds = recipientIdsArray.map(id => {
      try {
        return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
      } catch (e) {
        return id;
      }
    });
    refModel = 'Group';
  } else {
    console.error('❌ Erreur: recipientsType:', recipientsType, 'recipientIdsArray:', recipientIdsArray);
    res.status(400);
    throw new Error('IDs des destinataires requis pour ce type de message.');
  }
  
  // Vérifier que recipientObjectIds est bien un tableau
  if (!Array.isArray(recipientObjectIds)) {
    console.error('❌ Erreur: recipientObjectIds n\'est pas un tableau:', recipientObjectIds);
    res.status(400);
    throw new Error('Les IDs des destinataires doivent être un tableau.');
  }
  
  if (recipientObjectIds.length === 0) {
    console.error('❌ Erreur: recipientObjectIds est vide');
    res.status(400);
    throw new Error('Au moins un destinataire doit être spécifié.');
  }
  
  // Créer le message
  console.log('📝 Création du message avec:', {
    recipientsType,
    recipientObjectIds: recipientObjectIds.map(id => id.toString()),
    recipientObjectIdsIsArray: Array.isArray(recipientObjectIds),
    refModel,
    subject
  });
  
  // Vérifier une dernière fois que recipientObjectIds est un tableau
  if (!Array.isArray(recipientObjectIds)) {
    console.error('❌ ERREUR CRITIQUE: recipientObjectIds n\'est pas un tableau avant la création du message!');
    console.error('   Type:', typeof recipientObjectIds);
    console.error('   Valeur:', recipientObjectIds);
    res.status(500);
    throw new Error('Erreur interne: les IDs des destinataires doivent être un tableau.');
  }
  
  const messageData = {
    sender: req.user._id,
    recipients: {
      type: recipientsType,
      ids: recipientObjectIds, // Doit être un tableau
      refModel: refModel
    },
    subject: subject,
    content: content,
    priority: priority || 'normal',
    status: 'sent'
  };
  
  console.log('📝 Données du message à créer:', {
    recipientsType: messageData.recipients.type,
    recipientsIds: messageData.recipients.ids.map(id => id.toString()),
    recipientsIdsIsArray: Array.isArray(messageData.recipients.ids),
    refModel: messageData.recipients.refModel
  });
  
  const message = await Message.create(messageData);
  
  // Vérifier ce qui a été créé
  const createdMessage = await Message.findById(message._id).lean();
  console.log('✅ Message créé dans la DB:', {
    _id: createdMessage._id.toString(),
    recipientsType: createdMessage.recipients.type,
    recipientsIds: createdMessage.recipients.ids,
    recipientsIdsType: Array.isArray(createdMessage.recipients.ids) ? 'array' : typeof createdMessage.recipients.ids,
    recipientsIdsLength: Array.isArray(createdMessage.recipients.ids) ? createdMessage.recipients.ids.length : 'N/A',
    refModel: createdMessage.recipients.refModel,
    subject: createdMessage.subject
  });
  
  // Envoyer des notifications WebSocket aux utilisateurs concernés
  try {
    if (recipientsType === 'all_sites' || recipientsType === 'site') {
      // Trouver tous les utilisateurs des sites concernés
      let userQuery = { isActive: true };
      
      if (recipientsType === 'all_sites') {
        // Pour tous les sites, trouver les utilisateurs du groupe
        if (req.user.groupId) {
          userQuery.groupId = req.user.groupId;
        } else if (req.user.role === 'admin') {
          // Admin peut envoyer à tous les utilisateurs
          userQuery.role = { $in: ['collectivite', 'resto'] };
        }
      } else {
        // Pour des sites spécifiques
        // Convertir les IDs en ObjectId si nécessaire
        const mongoose = (await import('mongoose')).default;
        const siteIds = recipientObjectIds.map(id => {
          try {
            return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
          } catch (e) {
            return id;
          }
        });
        userQuery.siteId = { $in: siteIds };
        console.log(`🔍 Recherche des utilisateurs pour les sites:`, siteIds.map(id => id.toString()));
        
        // Vérifier d'abord que les sites existent
        const sitesInfo = await Site.find({ _id: { $in: siteIds } }).select('_id siteName').lean();
        console.log(`🔍 Sites trouvés pour les IDs:`, sitesInfo.map(s => ({ _id: s._id.toString(), siteName: s.siteName })));
        
        // Diagnostic : vérifier tous les utilisateurs actifs pour voir leurs siteId
        const allActiveUsers = await User.find({ isActive: true }).select('_id name email siteId role roles').lean();
        console.log(`🔍 Diagnostic: ${allActiveUsers.length} utilisateur(s) actif(s) dans la base de données`);
        allActiveUsers.forEach(user => {
          const userSiteId = user.siteId ? (user.siteId.toString ? user.siteId.toString() : user.siteId) : 'null';
          const userSiteIdStr = typeof userSiteId === 'object' ? userSiteId.toString() : userSiteId;
          const matchesAnySite = siteIds.some(siteId => {
            const siteIdStr = siteId.toString();
            return userSiteIdStr === siteIdStr;
          });
          const matchIndicator = matchesAnySite ? ' ✅ MATCH!' : '';
          console.log(`   - ${user.name || user.email} (${user._id}) - siteId: ${userSiteIdStr} - role: ${user.role} - roles: ${user.roles?.join(', ') || 'N/A'}${matchIndicator}`);
        });
        
        // Vérifier aussi avec les IDs en string
        const siteIdsAsStrings = siteIds.map(id => id.toString());
        console.log(`🔍 Recherche avec siteIds (ObjectId):`, siteIds.map(id => id.toString()));
        console.log(`🔍 Recherche avec siteIds (String):`, siteIdsAsStrings);
        
        // Essayer aussi une requête avec les IDs en string
        const usersWithStringIds = await User.find({ 
          isActive: true, 
          siteId: { $in: siteIdsAsStrings } 
        }).select('_id name email siteId').lean();
        console.log(`🔍 Utilisateurs trouvés avec siteIds en string: ${usersWithStringIds.length}`);
        
        // Essayer aussi une requête avec $or pour ObjectId et string
        const usersWithOr = await User.find({ 
          isActive: true, 
          $or: [
            { siteId: { $in: siteIds } },
            { siteId: { $in: siteIdsAsStrings } }
          ]
        }).select('_id name email siteId').lean();
        console.log(`🔍 Utilisateurs trouvés avec $or (ObjectId ou String): ${usersWithOr.length}`);
      }
      
      const users = await User.find(userQuery);
      console.log(`👥 ${users.length} utilisateur(s) trouvé(s) pour recevoir le message`);
      users.forEach(user => {
        const userSiteId = user.siteId ? (user.siteId.toString ? user.siteId.toString() : user.siteId) : 'null';
        console.log(`   - ${user.name || user.email} (${user._id}) - siteId: ${userSiteId}`);
      });
      
      // Si aucun utilisateur trouvé, essayer une recherche plus large
      if (users.length === 0 && recipientsType === 'site') {
        console.log(`⚠️ Aucun utilisateur trouvé avec la requête standard, essai avec une recherche plus large...`);
        const mongoose = (await import('mongoose')).default;
        const siteIds = recipientObjectIds.map(id => {
          try {
            return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;
          } catch (e) {
            return id;
          }
        });
        const siteIdsAsStrings = siteIds.map(id => id.toString());
        
        // Essayer avec $or pour ObjectId et string
        const fallbackUsers = await User.find({ 
          isActive: true, 
          $or: [
            { siteId: { $in: siteIds } },
            { siteId: { $in: siteIdsAsStrings } }
          ]
        });
        
        if (fallbackUsers.length > 0) {
          console.log(`✅ ${fallbackUsers.length} utilisateur(s) trouvé(s) avec la recherche de fallback`);
          // Utiliser ces utilisateurs à la place
          users.length = 0;
          users.push(...fallbackUsers);
        }
      }
      
      // Envoyer une notification à chaque utilisateur
      console.log(`📬 Envoi de notifications à ${users.length} utilisateur(s)`);
      let notificationsSent = 0;
      users.forEach(user => {
        const userId = user._id ? user._id.toString() : user._id;
        console.log(`   → Envoi à l'utilisateur ${userId} (${user.name || user.email || 'sans nom'})`);
        const success = notificationService.sendToUser(userId, {
          type: 'admin_message',
          title: 'Nouveau message de l\'administration',
          message: subject,
          priority: priority || 'normal',
          data: {
            messageId: message._id.toString(),
            subject: subject,
            sender: req.user.name || req.user.businessName
          },
          sound: priority === 'urgent' || priority === 'high'
        });
        if (success) {
          notificationsSent++;
          console.log(`     ✅ Notification envoyée avec succès`);
        } else {
          console.log(`     ❌ Échec de l'envoi de la notification`);
        }
      });
      console.log(`✅ ${notificationsSent}/${users.length} notification(s) envoyée(s) avec succès`);
    } else if (recipientsType === 'user') {
      // Envoyer directement aux utilisateurs
      console.log(`📬 Envoi de notifications à ${recipientObjectIds.length} utilisateur(s)`);
      let notificationsSent = 0;
      recipientObjectIds.forEach(userId => {
        const userIdStr = userId.toString ? userId.toString() : userId;
        console.log(`   → Envoi à l'utilisateur ${userIdStr}`);
        const success = notificationService.sendToUser(userIdStr, {
          type: 'admin_message',
          title: 'Nouveau message de l\'administration',
          message: subject,
          priority: priority || 'normal',
          data: {
            messageId: message._id.toString(),
            subject: subject,
            sender: req.user.name || req.user.businessName
          },
          sound: priority === 'urgent' || priority === 'high'
        });
        if (success) notificationsSent++;
      });
      console.log(`✅ ${notificationsSent}/${recipientObjectIds.length} notification(s) envoyée(s) avec succès`);
    }
  } catch (notifError) {
    console.error('❌ Erreur lors de l\'envoi des notifications:', notifError);
    // Ne pas bloquer l'envoi du message si la notification échoue
  }
  
  res.status(201).json({
    success: true,
    data: message
  });
}));

// @desc    Récupérer les messages pour l'utilisateur connecté
// @route   GET /api/messages
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  // Récupérer le siteId depuis la query string si fourni (pour gérer les onglets multiples)
  const siteIdFromQuery = req.query.siteId;
  
  // Utiliser le siteId de la query string en priorité, sinon celui de req.user
  let siteId = siteIdFromQuery || (req.user.siteId ? req.user.siteId.toString() : null);
  
  // Si le siteId vient de la query string, le convertir en ObjectId
  if (siteIdFromQuery && siteIdFromQuery !== req.user.siteId?.toString()) {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.Types.ObjectId.isValid(siteIdFromQuery)) {
      siteId = new mongoose.Types.ObjectId(siteIdFromQuery);
      console.log('🔧 SiteId utilisé depuis la query string:', siteIdFromQuery);
    }
  }
  
  console.log('📥 GET /api/messages - Utilisateur:', {
    _id: req.user._id.toString(),
    siteIdFromUser: req.user.siteId ? req.user.siteId.toString() : 'null',
    siteIdFromQuery: siteIdFromQuery || 'null',
    siteIdFinal: siteId ? (typeof siteId === 'object' ? siteId.toString() : siteId) : 'null',
    groupId: req.user.groupId ? req.user.groupId.toString() : 'null',
    role: req.user.role,
    roles: req.user.roles
  });
  
  // Vérifier que req.user._id existe
  if (!req.user._id) {
    console.error('❌ req.user._id est undefined!', {
      user: req.user,
      userId: req.user?._id,
      email: req.user?.email
    });
    return res.status(401).json({
      success: false,
      message: 'Utilisateur non authentifié correctement'
    });
  }
  
  console.log('📬 Récupération des messages pour:', {
    userId: req.user._id.toString(),
    siteId: siteId ? siteId.toString() : 'null',
    groupId: req.user.groupId ? req.user.groupId.toString() : 'null'
  });
  
  let messages;
  try {
    messages = await Message.getMessagesForUser(
      req.user._id,
      siteId || null,
      req.user.groupId || null
    );
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des messages:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération des messages'
    });
  }
  
  // Marquer les messages non lus
  const unreadCount = messages.filter(msg => {
    if (!msg.readBy || msg.readBy.length === 0) return true;
    return !msg.readBy.some(
      read => {
        const readUserId = typeof read.user === 'object' ? read.user._id.toString() : read.user.toString();
        return readUserId === req.user._id.toString();
      }
    );
  }).length;
  
  res.json({
    success: true,
    data: messages,
    unreadCount: unreadCount
  });
}));

// @desc    Marquer un message comme lu
// @route   PUT /api/messages/:id/read
// @access  Private
router.put('/:id/read', protect, asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);
  
  if (!message) {
    res.status(404);
    throw new Error('Message non trouvé.');
  }
  
  await message.markAsRead(req.user._id);
  
  res.json({
    success: true,
    data: message
  });
}));

// @desc    Récupérer les sites disponibles pour l'envoi de messages
// @route   GET /api/messages/sites
// @access  Private (admin, groupe)
router.get('/sites', protect, asyncHandler(async (req, res) => {
  // Vérifier que l'utilisateur est admin ou groupe admin
  if (req.user.role !== 'admin' && req.user.role !== 'groupe' && !req.user.roles?.includes('GROUP_ADMIN')) {
    res.status(403);
    throw new Error('Accès refusé.');
  }
  
  const groupId = req.user.groupId;
  console.log('🔍 GET /api/messages/sites - groupId:', groupId);
  
  // Récupérer les sites sans .select() d'abord pour voir tous les champs disponibles
  const allSites = await Site.find({ groupId: groupId, isActive: true }).lean();
  console.log(`📋 ${allSites.length} site(s) trouvé(s) (sans select)`);
  
  // Vérifier les champs disponibles sur le premier site
  if (allSites.length > 0) {
    console.log('🔍 Exemple de site (tous les champs):', Object.keys(allSites[0]));
    console.log('🔍 Premier site complet:', JSON.stringify(allSites[0], null, 2));
  }
  
  // Maintenant utiliser .select() pour ne récupérer que les champs nécessaires
  const sites = await Site.find({ groupId: groupId, isActive: true })
    .select('_id siteName address type')
    .lean();
  
  console.log(`📋 ${sites.length} site(s) après select`);
  sites.forEach((site, index) => {
    console.log(`   Site ${index + 1}:`);
    console.log(`     - _id: ${site._id}`);
    console.log(`     - siteName: "${site.siteName}" (type: ${typeof site.siteName})`);
    console.log(`     - address:`, site.address);
    console.log(`     - type: ${site.type}`);
  });
  
  // S'assurer que les données sont correctement formatées
  const formattedSites = sites.map(site => {
    // Vérifier si siteName existe, sinon essayer d'autres champs possibles
    const siteName = site.siteName || site.name || `Site ${site._id}`;
    return {
      _id: site._id,
      siteName: siteName,
      address: site.address || {},
      type: site.type || null
    };
  });
  
  console.log('📤 Sites formatés à envoyer:', formattedSites.length);
  formattedSites.forEach((site, index) => {
    console.log(`   ${index + 1}. ${site.siteName} (${site._id})`);
  });
  
  res.json({
    success: true,
    data: formattedSites
  });
}));

// @desc    Récupérer les utilisateurs disponibles pour l'envoi de messages
// @route   GET /api/messages/users
// @access  Private (admin, groupe)
router.get('/users', protect, asyncHandler(async (req, res) => {
  // Vérifier que l'utilisateur est admin ou groupe admin
  if (req.user.role !== 'admin' && req.user.role !== 'groupe' && !req.user.roles?.includes('GROUP_ADMIN')) {
    res.status(403);
    throw new Error('Accès refusé.');
  }
  
  let groupId = req.user.groupId;
  let query = {
    isActive: true,
    role: { $in: ['collectivite', 'resto'] }
  };
  
  if (!groupId && req.user.role === 'admin') {
    // Admin peut voir tous les utilisateurs
  } else {
    query.groupId = groupId;
  }
  
  const users = await User.find(query).select('name email businessName siteId');
  
  // Populate siteId pour obtenir le nom du site
  await User.populate(users, { path: 'siteId', select: 'name' });
  
  res.json({
    success: true,
    data: users
  });
}));

// @desc    Supprimer un message (admin seulement)
// @route   DELETE /api/messages/:id
// @access  Private (admin, groupe)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  // Vérifier que l'utilisateur est admin ou groupe admin
  if (req.user.role !== 'admin' && req.user.role !== 'groupe' && !req.user.roles?.includes('GROUP_ADMIN')) {
    res.status(403);
    throw new Error('Accès refusé.');
  }
  
  const message = await Message.findById(req.params.id);
  
  if (!message) {
    res.status(404);
    throw new Error('Message non trouvé.');
  }
  
  // Vérifier que le message a été envoyé par l'utilisateur ou qu'il est admin
  if (message.sender.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Vous ne pouvez supprimer que vos propres messages.');
  }
  
  await message.deleteOne();
  
  res.json({
    success: true,
    message: 'Message supprimé avec succès.'
  });
}));

export default router;

