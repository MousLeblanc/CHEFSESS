/**
 * Client de notifications en temps réel
 * Gère les connexions WebSocket et l'affichage des popups
 */

class NotificationClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.isConnected = false;
    this.eventHandlers = new Map();
    
    // Charger le son de notification
    this.notificationSound = null;
    this.loadNotificationSound();
  }

  /**
   * Charger le son de notification
   */
  loadNotificationSound() {
    // Créer un contexte audio
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Créer un son de notification simple (bip agréable)
    this.createNotificationBeep = () => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Fréquences agréables
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      // Envelope pour un son doux
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
      
      // Deuxième note pour un effet "ding-dong"
      setTimeout(() => {
        const oscillator2 = this.audioContext.createOscillator();
        const gainNode2 = this.audioContext.createGain();
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(this.audioContext.destination);
        
        oscillator2.frequency.value = 1000;
        oscillator2.type = 'sine';
        
        gainNode2.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode2.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator2.start(this.audioContext.currentTime);
        oscillator2.stop(this.audioContext.currentTime + 0.5);
      }, 200);
    };
  }

  /**
   * Jouer le son de notification
   */
  playSound() {
    try {
      if (this.createNotificationBeep) {
        this.createNotificationBeep();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la lecture du son:', error);
    }
  }

  /**
   * Se connecter au serveur WebSocket
   */
  connect() {
    const token = this.getToken();
    
    if (!token) {
      console.warn('⚠️ Pas de token disponible, impossible de se connecter aux notifications');
      return;
    }

    // Déterminer le protocole WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications?token=${token}`;
    
    console.log('🔌 Connexion au service de notifications...');
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ Connecté au service de notifications');
        console.log('   URL:', wsUrl.replace(/token=[^&]+/, 'token=***'));
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.triggerEvent('connected', {});
      };
      
      this.ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          console.log('📬 Notification reçue:', notification);
          console.log('   Type:', notification.type);
          console.log('   Titre:', notification.title);
          console.log('   Son activé:', notification.sound);
          this.handleNotification(notification);
        } catch (error) {
          console.error('❌ Erreur lors du traitement de la notification:', error);
          console.error('   Event data:', event.data);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ Erreur WebSocket:', error);
        this.isConnected = false;
      };
      
      this.ws.onclose = () => {
        console.log('🔌 Déconnecté du service de notifications');
        this.isConnected = false;
        this.triggerEvent('disconnected', {});
        this.attemptReconnect();
      };
      
    } catch (error) {
      console.error('❌ Erreur lors de la connexion WebSocket:', error);
      this.attemptReconnect();
    }
  }

  /**
   * Tenter une reconnexion
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      
      console.log(`🔄 Tentative de reconnexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} dans ${delay}ms`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Nombre maximum de tentatives de reconnexion atteint');
    }
  }

  /**
   * Se déconnecter
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  /**
   * Récupérer le token d'authentification
   * ⚠️ Avec cookies HTTP-Only, le token n'est plus accessible en JavaScript
   * Les WebSocket doivent être authentifiés via le backend
   */
  getToken() {
    // 🍪 Token géré via cookie HTTP-Only (inaccessible en JavaScript)
    console.warn('⚠️ Les notifications WebSocket nécessitent une migration vers cookie-based auth');
    console.warn('   Pour l\'instant, les notifications temps réel sont désactivées');
    
    // TODO: Implémenter authentification WebSocket via cookie
    // Option 1: Endpoint backend qui gère les connexions WebSocket avec cookies
    // Option 2: Utiliser Server-Sent Events (SSE) au lieu de WebSocket
    
    return null;
  }

  /**
   * Gérer une notification reçue
   */
  handleNotification(notification) {
    // Jouer le son si demandé
    if (notification.sound) {
      this.playSound();
    }

    // Afficher le popup
    this.showPopup(notification);

    // Déclencher les événements personnalisés
    this.triggerEvent(notification.type, notification);
    this.triggerEvent('notification', notification);
  }

  /**
   * Afficher un popup de notification
   */
  showPopup(notification) {
    // Créer le conteneur de popups s'il n'existe pas
    let container = document.getElementById('notification-popup-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-popup-container';
      container.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 99999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `;
      document.body.appendChild(container);
    }

    // Déterminer la couleur selon la priorité
    const colors = {
      high: '#e74c3c',
      medium: '#3498db',
      low: '#95a5a6'
    };
    const color = colors[notification.priority || 'medium'];

    // Déterminer l'icône selon le type
    const icons = {
      new_order: '🛒',
      order_status_change: '📦',
      order_issue: '⚠️',
      low_stock: '📊',
      connected: '✅',
      default: '🔔'
    };
    const icon = icons[notification.type] || icons.default;

    // Créer le popup
    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    popup.style.cssText = `
      background: white;
      border-left: 4px solid ${color};
      border-radius: 8px;
      padding: 1rem 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 300px;
      animation: slideInRight 0.3s ease, fadeOut 0.3s ease 4.7s;
      cursor: pointer;
      transition: transform 0.2s;
    `;

    popup.innerHTML = `
      <div style="display: flex; align-items: start; gap: 1rem;">
        <div style="font-size: 2rem;">${icon}</div>
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #2c3e50; margin-bottom: 0.25rem;">
            ${notification.title}
          </div>
          <div style="color: #666; font-size: 0.9rem;">
            ${notification.message}
          </div>
          ${notification.data && notification.data.orderNumber ? `
            <div style="margin-top: 0.5rem; padding: 0.5rem; background: #f8f9fa; border-radius: 4px; font-size: 0.85rem;">
              <strong>Commande:</strong> ${notification.data.orderNumber}
              ${notification.data.total ? `<br><strong>Montant:</strong> ${notification.data.total.toFixed(2)}€` : ''}
            </div>
          ` : ''}
        </div>
        <button onclick="this.closest('.notification-popup').remove()" 
          style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999; padding: 0; margin: 0; line-height: 1;">
          ×
        </button>
      </div>
    `;

    // Ajouter les animations CSS si elles n'existent pas
    if (!document.getElementById('notification-popup-animations')) {
      const style = document.createElement('style');
      style.id = 'notification-popup-animations';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .notification-popup:hover {
          transform: translateX(-5px);
        }
      `;
      document.head.appendChild(style);
    }

    // Ajouter au conteneur
    container.appendChild(popup);

    // Rediriger vers la page appropriée au clic
    popup.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        this.handleNotificationClick(notification);
      }
    });

    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
      popup.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => popup.remove(), 300);
    }, 5000);
  }

  /**
   * Gérer le clic sur une notification
   */
  handleNotificationClick(notification) {
    switch (notification.type) {
      case 'new_order':
        // Rediriger vers l'onglet des commandes
        const ordersTab = document.querySelector('[data-tab="orders"]');
        if (ordersTab) {
          ordersTab.click();
        }
        break;
      case 'order_status_change':
        // Recharger les commandes
        if (window.dashboard && typeof window.dashboard.loadOrders === 'function') {
          window.dashboard.loadOrders();
        }
        break;
    }
  }

  /**
   * Enregistrer un gestionnaire d'événements
   */
  on(eventType, handler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType).push(handler);
  }

  /**
   * Déclencher un événement
   */
  triggerEvent(eventType, data) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Erreur dans le gestionnaire d'événement ${eventType}:`, error);
        }
      });
    }
  }
}

// Instance globale
window.NotificationClient = NotificationClient;

// Auto-initialisation désactivée (nécessite migration WebSocket vers cookies)
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // 🍪 Token géré via cookie HTTP-Only (inaccessible en JavaScript)
    // Les notifications WebSocket sont temporairement désactivées
    console.log('ℹ️ Notifications temps réel désactivées (migration vers cookie-based auth en cours)');
    
    // TODO: Réactiver après migration WebSocket
    // window.notificationClient = new NotificationClient();
    // window.notificationClient.connect();
  });
}

