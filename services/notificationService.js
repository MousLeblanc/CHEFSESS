// Service de notifications en temps réel
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

class NotificationService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map userId -> Set of WebSocket connections
    this.siteConnections = new Map(); // Map<siteId, Set<WebSocket>> - Pour notifier tous les utilisateurs d'un site
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
      // Support à la fois 'token' (connexion normale) et 'siteToken' (connexion site)
      let token = null;
      
      // Vérifier si le client a spécifié quel cookie utiliser via query string
      let cookieType = 'token'; // Par défaut
      try {
        const protocol = req.headers['x-forwarded-proto'] || (req.headers.host?.includes('localhost') ? 'http' : 'https');
        const url = new URL(req.url, `${protocol}://${req.headers.host}`);
        cookieType = url.searchParams.get('cookieType') || 'token';
        console.log(`   📋 Type de cookie demandé: ${cookieType}`);
        
        // Fallback : essayer depuis la query string (compatibilité)
        if (!token) {
          token = url.searchParams.get('token');
          if (token) {
            console.log('   ✅ Token trouvé dans la query string');
          }
        }
      } catch (error) {
        console.log('   ⚠️ Erreur lors de la création de l\'URL:', error.message);
      }
      
      // Parser les cookies depuis le header
      const cookies = req.headers.cookie;
      console.log('   Cookies bruts:', cookies);
      
      if (cookies) {
        const cookieArray = cookies.split(';');
        for (const cookie of cookieArray) {
          const [name, value] = cookie.trim().split('=');
          // Utiliser le cookie spécifié par le client, ou 'token' par défaut
          if (name === cookieType && value) {
            token = value;
            console.log(`   ✅ Token trouvé dans le cookie "${cookieType}"`);
            break;
          }
        }
        
        // Fallback : si le cookie demandé n'existe pas, essayer l'autre
        if (!token) {
          const fallbackCookie = cookieType === 'token' ? 'siteToken' : 'token';
          for (const cookie of cookieArray) {
            const [name, value] = cookie.trim().split('=');
            if (name === fallbackCookie && value) {
              token = value;
              console.log(`   ⚠️ Cookie "${cookieType}" non trouvé, utilisation du cookie "${fallbackCookie}" en fallback`);
              break;
            }
          }
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
        
        // Stocker le siteId pour la déconnexion
        let siteIdStr = null;
        if (decoded.siteId) {
          siteIdStr = decoded.siteId.toString ? decoded.siteId.toString() : String(decoded.siteId);
          if (!this.siteConnections.has(siteIdStr)) {
            this.siteConnections.set(siteIdStr, new Set());
          }
          this.siteConnections.get(siteIdStr).add(ws);
          console.log(`   Site ID: ${siteIdStr} (connexion associée)`);
        }
        
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
          
          // Retirer aussi de siteConnections si présent
          if (siteIdStr) {
            const siteConnections = this.siteConnections.get(siteIdStr);
            if (siteConnections) {
              siteConnections.delete(ws);
              if (siteConnections.size === 0) {
                this.siteConnections.delete(siteIdStr);
              }
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
    // S'assurer que supplierId est bien une string
    const supplierIdStr = supplierId.toString ? supplierId.toString() : String(supplierId);
    
    console.log(`\n📬 [notifyNewOrder] Notification nouvelle commande`);
    console.log(`   Supplier ID: ${supplierIdStr} (type: ${typeof supplierIdStr})`);
    console.log(`   Order: ${order.orderNumber}`);
    console.log(`   Order ID: ${order._id}`);
    
    const notification = {
      type: 'new_order',
      title: 'Nouvelle commande reçue !',
      message: `Vous avez reçu une nouvelle commande: ${order.orderNumber}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.businessName || order.customer?.name,
        total: order.pricing?.total || 0,
        itemsCount: order.items?.length || 0
      },
      sound: true,
      priority: 'high'
    };
    
    const result = this.sendToUser(supplierIdStr, notification);
    console.log(`📬 [notifyNewOrder] Résultat: ${result ? 'envoyé' : 'échec'}\n`);
    return result;
  }

  /**
   * Envoyer une notification à tous les utilisateurs connectés d'un site
   * @param {string} siteId - ID du site
   * @param {object} notification - Objet de notification
   */
  sendToSite(siteId, notification) {
    if (!this.wss) {
      console.log('⚠️ WebSocket non disponible, notification de site ignorée');
      return false;
    }
    
    const siteIdStr = siteId.toString ? siteId.toString() : String(siteId);
    const siteConnections = this.siteConnections.get(siteIdStr);
    
    console.log(`\n📤 Tentative d'envoi notification au site ${siteIdStr}`);
    console.log(`   Type: ${notification.type}`);
    console.log(`   Sites avec connexions: ${Array.from(this.siteConnections.keys()).join(', ')}`);
    
    if (!siteConnections || siteConnections.size === 0) {
      console.log(`❌ Aucun utilisateur connecté pour le site ${siteIdStr}`);
      return false;
    }

    console.log(`✅ Site ${siteIdStr} trouvé avec ${siteConnections.size} connexion(s)`);
    
    const message = JSON.stringify(notification);
    let sent = 0;
    
    siteConnections.forEach((ws) => {
      if (ws.readyState === 1) { // 1 = OPEN
        ws.send(message);
        sent++;
        console.log(`   ✓ Message envoyé sur connexion ${sent}`);
      } else {
        console.log(`   ✗ Connexion fermée (readyState: ${ws.readyState})`);
      }
    });

    console.log(`📤 Notification envoyée à ${sent}/${siteConnections.size} connexion(s) du site ${siteIdStr}\n`);
    return sent > 0;
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
      'shipped': 'Votre commande a été expédiée',
      'delivered': 'Votre commande a été livrée',
      'cancelled': 'Votre commande a été annulée'
    };

    const notification = {
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
    };

    // Envoyer au client principal
    const sentToCustomer = this.sendToUser(customerId, notification);
    
    // Si la commande a un siteId, envoyer aussi à tous les utilisateurs du site
    if (order.siteId) {
      const siteIdStr = order.siteId.toString ? order.siteId.toString() : String(order.siteId);
      console.log(`📬 Envoi de notification aux utilisateurs du site ${siteIdStr}`);
      const sentToSite = this.sendToSite(siteIdStr, notification);
      return sentToCustomer || sentToSite;
    }
    
    return sentToCustomer;
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

