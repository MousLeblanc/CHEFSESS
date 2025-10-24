// Service de notifications en temps réel
import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';

class NotificationService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map userId -> Set of WebSocket connections
  }

  initialize(server) {
    console.log('🔔 Initialisation du service de notifications WebSocket');
    
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws/notifications'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('🔌 Nouvelle connexion WebSocket');
      
      // Extraire le token de la query string
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      if (!token) {
        console.log('❌ Pas de token fourni');
        ws.close(1008, 'Token requis');
        return;
      }

      try {
        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        console.log(`✅ Client WebSocket connecté:`);
        console.log(`   User ID: ${userId}`);
        console.log(`   Token décodé:`, JSON.stringify(decoded, null, 2));
        
        // Associer la connexion à l'utilisateur
        if (!this.clients.has(userId)) {
          this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(ws);
        
        // Envoyer un message de confirmation
        ws.send(JSON.stringify({
          type: 'connected',
          message: 'Connecté au service de notifications'
        }));
        
        // Gérer la déconnexion
        ws.on('close', () => {
          console.log(`🔌 Client déconnecté: ${userId}`);
          const userConnections = this.clients.get(userId);
          if (userConnections) {
            userConnections.delete(ws);
            if (userConnections.size === 0) {
              this.clients.delete(userId);
            }
          }
        });
        
        // Gérer les erreurs
        ws.on('error', (error) => {
          console.error(`❌ Erreur WebSocket pour ${userId}:`, error.message);
        });
        
      } catch (error) {
        console.error('❌ Erreur de vérification du token:', error.message);
        ws.close(1008, 'Token invalide');
      }
    });

    console.log('✅ Service de notifications WebSocket démarré');
  }

  /**
   * Envoyer une notification à un utilisateur spécifique
   * @param {string} userId - ID de l'utilisateur
   * @param {object} notification - Objet de notification
   */
  sendToUser(userId, notification) {
    const userIdStr = userId.toString();
    const userConnections = this.clients.get(userIdStr);
    
    console.log(`\n📤 Tentative d'envoi notification à l'utilisateur ${userIdStr}`);
    console.log(`   Type: ${notification.type}`);
    console.log(`   Titre: ${notification.title}`);
    console.log(`   Clients connectés au total: ${this.clients.size}`);
    console.log(`   IDs connectés: ${Array.from(this.clients.keys()).join(', ')}`);
    
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
}

// Instance unique (singleton)
const notificationService = new NotificationService();

export default notificationService;

