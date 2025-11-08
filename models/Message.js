import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  // Expéditeur
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Destinataires
  recipients: {
    // Type de message : 'all_sites' (tous les sites), 'site' (site spécifique), 'user' (utilisateur spécifique)
    type: {
      type: String,
      enum: ['all_sites', 'site', 'user', 'group'],
      required: true
    },
    // IDs des destinataires (sites, utilisateurs, ou groupe)
    ids: [{
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'recipients.refModel'
    }],
    // Référence dynamique selon le type
    refModel: {
      type: String,
      enum: ['Site', 'User', 'Group'],
      required: false
    }
  },
  
  // Contenu du message
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Le sujet ne peut pas dépasser 200 caractères']
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  
  // Priorité
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Statut
  status: {
    type: String,
    enum: ['draft', 'sent', 'read'],
    default: 'sent'
  },
  
  // Lecture
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Métadonnées
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
messageSchema.index({ 'recipients.ids': 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ status: 1 });

// Méthode pour marquer comme lu
messageSchema.methods.markAsRead = async function(userId) {
  const alreadyRead = this.readBy.some(
    read => read.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    await this.save();
  }
  
  return this;
};

// Méthode statique pour obtenir les messages d'un utilisateur/site
messageSchema.statics.getMessagesForUser = async function(userId, siteId = null, groupId = null) {
  const mongoose = await import('mongoose');
  
  // Convertir les IDs en ObjectId si nécessaire
  const userIdObj = mongoose.default.Types.ObjectId.isValid(userId) ? new mongoose.default.Types.ObjectId(userId) : userId;
  const siteIdObj = siteId && mongoose.default.Types.ObjectId.isValid(siteId) ? new mongoose.default.Types.ObjectId(siteId) : siteId;
  const groupIdObj = groupId && mongoose.default.Types.ObjectId.isValid(groupId) ? new mongoose.default.Types.ObjectId(groupId) : groupId;
  
  const queryOr = [
    // Messages pour tous les sites
    { 'recipients.type': 'all_sites' },
    // Messages pour un utilisateur spécifique
    { 'recipients.type': 'user', 'recipients.ids': userIdObj }
  ];
  
  // Ajouter les conditions pour site et groupe seulement si les IDs sont fournis
  if (siteIdObj) {
    // MongoDB peut chercher directement dans un tableau avec la valeur
    // Cela cherche si recipients.ids contient siteIdObj
    // La syntaxe correcte est simplement de passer l'ObjectId directement
    // MongoDB cherchera automatiquement dans le tableau
    queryOr.push({ 
      'recipients.type': 'site', 
      'recipients.ids': siteIdObj 
    });
  }
  
  if (groupIdObj) {
    queryOr.push({ 'recipients.type': 'group', 'recipients.ids': groupIdObj });
    queryOr.push({ 'recipients.type': 'group', 'recipients.ids': { $in: [groupIdObj] } });
  }
  
  // Convertir les ObjectIds en strings pour le log JSON
  const queryForLog = {
    $or: queryOr.map(condition => {
      const cond = { ...condition };
      if (cond['recipients.ids']) {
        // Si c'est un ObjectId, le convertir en string pour le log
        if (cond['recipients.ids'].toString) {
          cond['recipients.ids'] = cond['recipients.ids'].toString();
        }
      }
      return cond;
    }),
    status: 'sent'
  };
  
  console.log('🔍 getMessagesForUser - Query:', JSON.stringify(queryForLog, null, 2));
  console.log('🔍 getMessagesForUser - userId:', userIdObj?.toString(), 'siteId:', siteIdObj?.toString(), 'groupId:', groupIdObj?.toString());
  
  // Afficher tous les messages de type 'site' pour debug
  const allSiteMessages = await this.find({ 'recipients.type': 'site', status: 'sent' })
    .select('recipients.ids recipients.type subject')
    .lean();
  console.log(`🔍 Tous les messages de type 'site' dans la DB: ${allSiteMessages.length}`);
  allSiteMessages.forEach((msg, idx) => {
    // Vérifier si recipients.ids est un tableau ou une string
    let ids = [];
    if (Array.isArray(msg.recipients.ids)) {
      ids = msg.recipients.ids.map(id => id.toString());
    } else if (msg.recipients.ids) {
      // Si c'est une string ou un ObjectId unique, le convertir en tableau
      ids = [msg.recipients.ids.toString()];
    }
    console.log(`   ${idx + 1}. "${msg.subject}" - IDs: ${ids.join(', ')}`);
    if (siteIdObj) {
      const siteIdStr = siteIdObj.toString();
      if (ids.includes(siteIdStr)) {
        console.log(`      ✅ Ce message correspond au siteId recherché (${siteIdStr})!`);
      } else {
        console.log(`      ❌ Ce message ne correspond pas (recherché: ${siteIdStr})`);
      }
    }
  });
  
  // Tester la requête manuellement pour voir si elle fonctionne
  if (siteIdObj) {
    const siteIdStr = siteIdObj.toString();
    console.log(`🧪 Test de la requête pour siteId: ${siteIdStr}`);
    console.log(`   SiteId type: ${typeof siteIdObj}, isObjectId: ${siteIdObj.constructor?.name || 'unknown'}`);
    
    // Test 1: Recherche directe avec ObjectId
    const test1 = await this.find({ 
      'recipients.type': 'site', 
      'recipients.ids': siteIdObj,
      status: 'sent'
    }).select('subject recipients.ids').lean();
    console.log(`   Test 1 (ObjectId direct): ${test1.length} message(s) trouvé(s)`);
    if (test1.length > 0) {
      test1.forEach((msg, idx) => {
        const ids = Array.isArray(msg.recipients.ids) ? msg.recipients.ids.map(id => id.toString()) : [msg.recipients.ids.toString()];
        console.log(`      ${idx + 1}. "${msg.subject}" - IDs: ${ids.join(', ')}`);
      });
    }
    
    // Test 2: Recherche avec $in
    const test2 = await this.find({ 
      'recipients.type': 'site', 
      'recipients.ids': { $in: [siteIdObj] },
      status: 'sent'
    }).select('subject recipients.ids').lean();
    console.log(`   Test 2 ($in avec ObjectId): ${test2.length} message(s) trouvé(s)`);
    if (test2.length > 0) {
      test2.forEach((msg, idx) => {
        const ids = Array.isArray(msg.recipients.ids) ? msg.recipients.ids.map(id => id.toString()) : [msg.recipients.ids.toString()];
        console.log(`      ${idx + 1}. "${msg.subject}" - IDs: ${ids.join(', ')}`);
      });
    }
    
    // Test 3: Recherche avec string
    const test3 = await this.find({ 
      'recipients.type': 'site', 
      'recipients.ids': siteIdStr,
      status: 'sent'
    }).select('subject recipients.ids').lean();
    console.log(`   Test 3 (String direct): ${test3.length} message(s) trouvé(s)`);
    if (test3.length > 0) {
      test3.forEach((msg, idx) => {
        const ids = Array.isArray(msg.recipients.ids) ? msg.recipients.ids.map(id => id.toString()) : [msg.recipients.ids.toString()];
        console.log(`      ${idx + 1}. "${msg.subject}" - IDs: ${ids.join(', ')}`);
      });
    }
    
    // Test 4: Recherche avec $in et string
    const test4 = await this.find({ 
      'recipients.type': 'site', 
      'recipients.ids': { $in: [siteIdStr] },
      status: 'sent'
    }).select('subject recipients.ids').lean();
    console.log(`   Test 4 ($in avec String): ${test4.length} message(s) trouvé(s)`);
    if (test4.length > 0) {
      test4.forEach((msg, idx) => {
        const ids = Array.isArray(msg.recipients.ids) ? msg.recipients.ids.map(id => id.toString()) : [msg.recipients.ids.toString()];
        console.log(`      ${idx + 1}. "${msg.subject}" - IDs: ${ids.join(', ')}`);
      });
    }
    
    // Vérifier si le siteId correspond à l'un des messages
    console.log(`🔍 Vérification: Le siteId ${siteIdStr} correspond-il à l'un des messages?`);
    allSiteMessages.forEach((msg, idx) => {
      let ids = [];
      if (Array.isArray(msg.recipients.ids)) {
        ids = msg.recipients.ids.map(id => id.toString());
      } else if (msg.recipients.ids) {
        ids = [msg.recipients.ids.toString()];
      }
      const matches = ids.includes(siteIdStr);
      console.log(`   Message "${msg.subject}": IDs ${ids.join(', ')} - ${matches ? '✅ CORRESPOND!' : '❌ Ne correspond pas'}`);
    });
    
    // Déterminer quelle requête fonctionne et corriger queryOr
    let workingQuery = null;
    if (test1.length > 0) {
      workingQuery = { 'recipients.type': 'site', 'recipients.ids': siteIdObj, status: 'sent' };
      console.log(`✅ Test 1 fonctionne - Utilisation de cette requête`);
    } else if (test2.length > 0) {
      workingQuery = { 'recipients.type': 'site', 'recipients.ids': { $in: [siteIdObj] }, status: 'sent' };
      console.log(`✅ Test 2 fonctionne - Utilisation de cette requête`);
    } else if (test3.length > 0) {
      workingQuery = { 'recipients.type': 'site', 'recipients.ids': siteIdStr, status: 'sent' };
      console.log(`✅ Test 3 fonctionne - Utilisation de cette requête`);
    } else if (test4.length > 0) {
      workingQuery = { 'recipients.type': 'site', 'recipients.ids': { $in: [siteIdStr] }, status: 'sent' };
      console.log(`✅ Test 4 fonctionne - Utilisation de cette requête`);
    }
    
    // Si une requête fonctionne, remplacer la condition dans queryOr
    if (workingQuery) {
      // Retirer les anciennes conditions pour 'site'
      queryOr = queryOr.filter(cond => !(cond['recipients.type'] === 'site'));
      // Ajouter la requête qui fonctionne
      queryOr.push(workingQuery);
      console.log(`🔧 Requête corrigée avec la requête qui fonctionne`);
    }
  } else {
    console.log(`⚠️ Aucun siteId fourni pour cet utilisateur - les messages de type 'site' ne seront pas récupérés`);
  }
  
  // Reconstruire la query avec la requête corrigée
  const query = {
    $or: queryOr,
    status: 'sent'
  };
  
  const messages = await this.find(query)
    .populate('sender', 'name email businessName')
    .sort({ createdAt: -1 });
  
  console.log(`📬 ${messages.length} message(s) trouvé(s) pour l'utilisateur avec la requête finale`);
  if (messages.length > 0) {
    messages.forEach((msg, idx) => {
      let ids = [];
      if (Array.isArray(msg.recipients.ids)) {
        ids = msg.recipients.ids.map(id => id.toString());
      } else if (msg.recipients.ids) {
        ids = [msg.recipients.ids.toString()];
      }
      console.log(`   ${idx + 1}. "${msg.subject}" - Type: ${msg.recipients.type} - IDs: ${ids.join(', ')}`);
    });
  } else if (siteIdObj) {
    console.log(`⚠️ Aucun message trouvé pour le siteId: ${siteIdObj.toString()}`);
    console.log(`   Vérifiez les tests ci-dessus pour voir quelle requête fonctionne`);
  }
  
  return messages;
};

const Message = mongoose.model('Message', messageSchema);
export default Message;

