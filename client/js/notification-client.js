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
   * 🍪 Utilise les cookies HTTP-Only pour l'authentification
   */
  connect() {
    // 🍪 Plus besoin de token - Les cookies sont envoyés automatiquement
    console.log('🔌 Connexion au service de notifications (authentification via cookie)...');
    console.log('   Host:', window.location.host);
    console.log('   Protocol:', window.location.protocol);
    console.log('   Cookies disponibles:', document.cookie);

    // Déterminer le protocole WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    
    // Déterminer quel type de cookie utiliser selon la page
    // Si on est sur une page de site (ehpad-dashboard, collectivite-dashboard, etc.), utiliser siteToken
    const isSitePage = window.location.pathname.includes('ehpad-dashboard') ||
                       window.location.pathname.includes('collectivite-dashboard') ||
                       window.location.pathname.includes('hopital-dashboard') ||
                       window.location.pathname.includes('maison-retraite-dashboard') ||
                       window.location.pathname.includes('ecole-dashboard') ||
                       window.location.pathname.includes('entreprise-dashboard');
    
    // Ajouter un paramètre pour indiquer quel cookie utiliser
    const cookieType = isSitePage ? 'siteToken' : 'token';
    const wsUrl = `${protocol}//${window.location.host}/ws/notifications?cookieType=${cookieType}`;
    
    console.log('📡 URL WebSocket:', wsUrl);
    console.log('   Type de cookie:', cookieType);
    
    try {
      // Les cookies sont envoyés automatiquement par le navigateur
      // Note: Les cookies HTTP-Only ne sont pas accessibles via document.cookie
      // mais sont envoyés automatiquement avec les requêtes WebSocket
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('✅ Connecté au service de notifications');
        console.log('   URL:', wsUrl);
        console.log('   🍪 Authentification via cookie HTTP-Only');
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
        console.error('   Type:', error.type);
        console.error('   Target:', error.target);
        console.error('   URL:', wsUrl);
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
   * Vérifier si l'utilisateur est connecté
   * 🍪 Les cookies HTTP-Only sont gérés automatiquement par le navigateur
   */
  isUserLoggedIn() {
    // Vérifier si des données utilisateur existent en sessionStorage
    const userStr = sessionStorage.getItem('user');
    return !!userStr;
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
      product_promotion: '⭐',
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
   * Supprimer un gestionnaire d'événements
   */
  off(eventType, handler) {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
      if (handlers.length === 0) {
        this.eventHandlers.delete(eventType);
      }
    }
  }

  /**
   * Déclencher un événement
   */
  triggerEvent(eventType, data) {
    console.log(`🔔 [triggerEvent] Déclenchement de l'événement "${eventType}"`);
    const handlers = this.eventHandlers.get(eventType);
    if (handlers && handlers.length > 0) {
      console.log(`   ✓ ${handlers.length} gestionnaire(s) trouvé(s) pour "${eventType}"`);
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Erreur dans le gestionnaire d'événement ${eventType}:`, error);
        }
      });
    } else {
      console.log(`   ⚠️ Aucun gestionnaire trouvé pour "${eventType}"`);
    }
  }
}

// Instance globale
window.NotificationClient = NotificationClient;

// Auto-initialisation si un utilisateur est connecté
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // 🍪 Token géré via cookie HTTP-Only (authentification automatique)
    const userStr = sessionStorage.getItem('user');
    
    if (userStr) {
      console.log('🔔 Initialisation automatique du client de notifications');
      window.notificationClient = new NotificationClient();
      window.notificationClient.connect();
    } else {
      console.log('ℹ️ Notifications non initialisées (pas d\'utilisateur connecté)');
    }
  });
}

