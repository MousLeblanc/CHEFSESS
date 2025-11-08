// Service de notifications en temps réel
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

class NotificationService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map userId -> Set of WebSocket connections
  }

  initialize(server) {
    try {
      console.log('🔔 Initialisation du service de notifications WebSocket');
      
      this.wss = new WebSocketServer({ 
        server,
        path: '/ws/notifications'
      });

    this.wss.on('connection', (ws, req) => {
      console.log('🔌 Nouvelle connexion WebSocket');
      console.log('   Headers:', JSON.stringify(req.headers, null, 2));
      console.log('   URL:', req.url);
      console.log('   Host:', req.headers.host);
      console.log('   Origin:', req.headers.origin);
      
      // 🍪 Extraire le token depuis les cookies HTTP-Only
      let token = null;
      
      // Parser les cookies depuis le header
      const cookies = req.headers.cookie;
      console.log('   Cookies bruts:', cookies);
      
      if (cookies) {
        const cookieArray = cookies.split(';');
        for (const cookie of cookieArray) {
          const [name, value] = cookie.trim().split('=');
          if (name === 'token') {
            token = value;
            console.log('   ✅ Token trouvé dans les cookies');
            break;
          }
        }
      }
      
      // Fallback : essayer depuis la query string (compatibilité)
      if (!token) {
        try {
          const protocol = req.headers['x-forwarded-proto'] || 'https';
          const url = new URL(req.url, `${protocol}://${req.headers.host}`);
          token = url.searchParams.get('token');
          if (token) {
            console.log('   ✅ Token trouvé dans la query string');
          }
        } catch (error) {
          console.log('   ⚠️ Erreur lors de la création de l\'URL:', error.message);
        }
      }
      
      if (!token) {
        console.log('❌ Pas de token fourni (ni cookie ni query string)');
        console.log('   Cookies disponibles:', cookies || 'aucun');
        console.log('   Headers complets:', JSON.stringify(req.headers, null, 2));
        console.log('   URL complète:', req.url);
        ws.close(1008, 'Token requis');
        return;
      }
      
      console.log('   ✅ Token trouvé, longueur:', token.length);

      try {
        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id ? decoded.id.toString() : decoded.id;
        
        console.log(`✅ Client WebSocket connecté:`);
        console.log(`   User ID: ${userId} (type: ${typeof userId})`);
        console.log(`   Token décodé:`, JSON.stringify(decoded, null, 2));
        
        // Associer la connexion à l'utilisateur (toujours utiliser string pour la clé)
        const userIdStr = userId.toString ? userId.toString() : String(userId);
        if (!this.clients.has(userIdStr)) {
          this.clients.set(userIdStr, new Set());
        }
        this.clients.get(userIdStr).add(ws);
        
        // Envoyer un message de confirmation
        ws.send(JSON.stringify({
          type: 'connected',
          message: 'Connecté au service de notifications'
        }));
        
        // Gérer la déconnexion
        ws.on('close', () => {
          console.log(`🔌 Client déconnecté: ${userIdStr}`);
          const userConnections = this.clients.get(userIdStr);
          if (userConnections) {
            userConnections.delete(ws);
            if (userConnections.size === 0) {
              this.clients.delete(userIdStr);
            }
          }
        });
        
        // Gérer les erreurs
        ws.on('error', (error) => {
          console.error(`❌ Erreur WebSocket pour ${userIdStr}:`, error.message);
        });
        
      } catch (error) {
        console.error('❌ Erreur de vérification du token:', error.message);
        ws.close(1008, 'Token invalide');
      }
    });

      console.log('✅ Service de notifications WebSocket démarré');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du WebSocket:', error);
      console.log('⚠️ Le service de notifications ne sera pas disponible (mode dégradé)');
      this.wss = null;
    }
  }

  /**
   * Envoyer une notification à un utilisateur spécifique
   * @param {string} userId - ID de l'utilisateur
   * @param {object} notification - Objet de notification
   */
  sendToUser(userId, notification) {
    // Si le WebSocket n'est pas initialisé, ne rien faire
    if (!this.wss) {
      console.log('⚠️ WebSocket non disponible, notification ignorée');
      return false;
    }
    
    const userIdStr = userId.toString();
    const userConnections = this.clients.get(userIdStr);
    
    console.log(`\n📤 Tentative d'envoi notification à l'utilisateur ${userIdStr}`);
    console.log(`   Type: ${notification.type}`);
    console.log(`   Titre: ${notification.title}`);
    console.log(`   Clients connectés au total: ${this.clients.size}`);
    console.log(`   IDs connectés: ${Array.from(this.clients.keys()).join(', ')}`);
    
    // Log détaillé des utilisateurs connectés pour debug
    if (this.clients.size > 0) {
      console.log(`   🔍 Détails des utilisateurs connectés:`);
      for (const [connectedUserId, connections] of this.clients.entries()) {
        console.log(`      - User ID: ${connectedUserId} (${connections.size} connexion(s))`);
      }
    }
    
    if (!userConnections || userConnections.size === 0) {
      console.log(`❌ Utilisateur ${userIdStr} n'est pas connecté au WebSocket`);
      console.log(`   Utilisateurs actuellement connectés: ${Array.from(this.clients.keys()).join(', ')}`);
      return false;
    }

    console.log(`✅ Utilisateur ${userIdStr} trouvé avec ${userConnections.size} connexion(s)`);
    
    const message = JSON.stringify(notification);
    let sent = 0;
    
    userConnections.forEach((ws) => {
      if (ws.readyState === 1) { // 1 = OPEN
        ws.send(message);
        sent++;
        console.log(`   ✓ Message envoyé sur connexion ${sent}`);
      } else {
        console.log(`   ✗ Connexion fermée (readyState: ${ws.readyState})`);
      }
    });

    console.log(`📤 Notification envoyée à ${sent}/${userConnections.size} connexion(s) de l'utilisateur ${userIdStr}\n`);
    return sent > 0;
  }

  /**
   * Envoyer une notification à tous les utilisateurs connectés
   * @param {object} notification - Objet de notification
   */
  sendToAll(notification) {
    const message = JSON.stringify(notification);
    let sent = 0;
    
    this.clients.forEach((connections) => {
      connections.forEach((ws) => {
        if (ws.readyState === 1) { // 1 = OPEN
          ws.send(message);
          sent++;
        }
      });
    });

    console.log(`📤 Notification envoyée à ${sent} connexion(s)`);
    return sent;
  }

  /**
   * Notifier une nouvelle commande au fournisseur
   * @param {string} supplierId - ID du fournisseur
   * @param {object} order - Détails de la commande
   */
  notifyNewOrder(supplierId, order) {
    return this.sendToUser(supplierId, {
      type: 'new_order',
      title: 'Nouvelle commande reçue !',
      message: `Vous avez reçu une nouvelle commande: ${order.orderNumber}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.businessName || order.customer?.name,
        total: order.pricing.total,
        itemsCount: order.items.length
      },
      sound: true,
      priority: 'high'
    });
  }

  /**
   * Notifier un changement de statut de commande au client
   * @param {string} customerId - ID du client
   * @param {object} order - Détails de la commande
   * @param {string} oldStatus - Ancien statut
   * @param {string} newStatus - Nouveau statut
   */
  notifyOrderStatusChange(customerId, order, oldStatus, newStatus) {
    const statusMessages = {
      'confirmed': 'Votre commande a été confirmée par le fournisseur',
      'preparing': 'Votre commande est en cours de préparation',
      'ready': 'Votre commande est prête',
      'shipped': 'Votre commande a été expédiée',
      'delivered': 'Votre commande a été livrée',
      'cancelled': 'Votre commande a été annulée'
    };

    return this.sendToUser(customerId, {
      type: 'order_status_change',
      title: 'Mise à jour de commande',
      message: statusMessages[newStatus] || `Statut de commande mis à jour: ${newStatus}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        oldStatus,
        newStatus,
        supplierName: order.supplier?.businessName || order.supplier?.name
      },
      sound: true,
      priority: 'medium'
    });
  }

  /**
   * Notifier un problème signalé sur une commande
   * @param {string} supplierId - ID du fournisseur
   * @param {object} order - Détails de la commande
   */
  notifyOrderIssue(supplierId, order) {
    return this.sendToUser(supplierId, {
      type: 'order_issue',
      title: '⚠️ Problème signalé',
      message: `Un problème a été signalé sur la commande ${order.orderNumber}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.businessName || order.customer?.name,
        notes: order.notes?.customer
      },
      sound: true,
      priority: 'high'
    });
  }

  /**
   * Notifier un stock bas
   * @param {string} supplierId - ID du fournisseur
   * @param {object} product - Détails du produit
   */
  notifyLowStock(supplierId, product) {
    return this.sendToUser(supplierId, {
      type: 'low_stock',
      title: '⚠️ Stock bas',
      message: `Stock bas pour ${product.name}: ${product.stock} ${product.unit} restant(s)`,
      data: {
        productId: product._id,
        productName: product.name,
        currentStock: product.stock,
        stockAlert: product.stockAlert,
        unit: product.unit
      },
      sound: false,
      priority: 'low'
    });
  }

  /**
   * Notifier une promotion produit (super promo ou produit à sauver) à tous les utilisateurs du groupe
   * @param {string} groupId - ID du groupe
   * @param {object} product - Détails du produit
   * @param {string} promotionType - 'super_promo' ou 'to_save'
   * @param {object} supplier - Détails du fournisseur
   */
  notifyProductPromotion(groupId, product, promotionType, supplier) {
    if (!groupId) {
      console.log('⚠️ Pas de groupId fourni, notification ignorée');
      return false;
    }

    // Notifier tous les utilisateurs du groupe (collectivites, resto)
    // Cette fonction sera appelée après avoir trouvé les utilisateurs dans le controller
    // Pour l'instant, on retourne juste true pour indiquer que c'est prêt
    return true;
  }

  /**
   * Notifier une promotion produit à une liste d'utilisateurs
   * @param {Array} userIds - Liste des IDs des utilisateurs à notifier
   * @param {object} product - Détails du produit
   * @param {string} promotionType - 'super_promo' ou 'to_save'
   * @param {object} supplier - Détails du fournisseur
   */
  notifyProductPromotionToUsers(userIds, product, promotionType, supplier) {
    console.log(`🔔 [notifyProductPromotionToUsers] Appelé avec:`);
    console.log(`   - userIds: ${userIds.length} utilisateur(s)`);
    console.log(`   - product: ${product.name} (${product._id})`);
    console.log(`   - promotionType: ${promotionType}`);
    console.log(`   - supplier: ${supplier.businessName || supplier.name} (${supplier._id})`);
    
    const isSuperPromo = promotionType === 'super_promo';
    const title = isSuperPromo 
      ? '⭐ Super Promo disponible !' 
      : '🚨 Produit à sauver disponible !';
    
    const message = isSuperPromo
      ? `${supplier.businessName || supplier.name} propose une super promo sur ${product.name}`
      : `${supplier.businessName || supplier.name} propose un produit à sauver: ${product.name}`;

    console.log(`🔔 [notifyProductPromotionToUsers] Notification à envoyer:`);
    console.log(`   - title: ${title}`);
    console.log(`   - message: ${message}`);

    let notificationsSent = 0;
    userIds.forEach(userId => {
      const userIdStr = userId.toString();
      console.log(`🔔 [notifyProductPromotionToUsers] Envoi notification à l'utilisateur ${userIdStr}...`);
      const success = this.sendToUser(userIdStr, {
        type: 'product_promotion',
        title: title,
        message: message,
        data: {
          productId: product._id ? product._id.toString() : product._id,
          productName: product.name,
          supplierId: supplier._id ? supplier._id.toString() : supplier._id,
          supplierName: supplier.businessName || supplier.name,
          promotionType: promotionType,
          superPromo: isSuperPromo ? product.superPromo : null,
          toSave: !isSuperPromo ? product.toSave : null,
          price: product.price,
          unit: product.unit
        },
        sound: true,
        priority: 'medium',
        color: isSuperPromo ? '#f39c12' : '#e74c3c' // Orange pour super promo, rouge pour à sauver
      });
      if (success) {
        notificationsSent++;
        console.log(`✅ [notifyProductPromotionToUsers] Notification envoyée avec succès à ${userIdStr}`);
      } else {
        console.log(`⚠️ [notifyProductPromotionToUsers] Échec de l'envoi de notification à ${userIdStr} (utilisateur non connecté)`);
      }
    });

    console.log(`✅ ${notificationsSent}/${userIds.length} notification(s) de promotion envoyée(s)`);
    return notificationsSent;
  }
}

// Instance unique (singleton)
const notificationService = new NotificationService();

export default notificationService;

