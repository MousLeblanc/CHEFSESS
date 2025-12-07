// Affichage des messages reçus pour les sites (dashboards non-admin)

class MessagesDisplay {
  constructor() {
    this.messages = [];
    this.unreadCount = 0;
    this.init();
  }

  async init() {
    console.log('🚀 MessagesDisplay: Initialisation...');
    
    // Créer d'abord le bouton de messages (pour que le badge puisse s'y attacher)
    this.createMessagesButton();
    
    // Attendre un peu pour que le bouton soit bien créé
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Charger les messages
    await this.loadMessages();
    
    // Afficher le badge de messages non lus dans le header (même sans clic)
    // Utiliser un petit délai pour s'assurer que le bouton est bien dans le DOM
    setTimeout(() => {
      this.displayBadge();
    }, 200);
    
    // Attendre que le client de notifications soit disponible et connecté
    this.setupNotificationsListener();
    
    // Vérifier périodiquement s'il y a de nouveaux messages (fallback)
    setInterval(() => {
      this.loadMessages();
    }, 30000); // Vérifier toutes les 30 secondes
  }

  setupNotificationsListener() {
    // Attendre que le client de notifications soit disponible
    const checkClient = () => {
      if (!window.notificationClient) {
        console.log('⏳ MessagesDisplay: En attente du client de notifications...');
        setTimeout(checkClient, 500);
        return;
      }

      // S'assurer que le client est connecté
      if (!window.notificationClient.isConnected) {
        console.log('⏳ MessagesDisplay: En attente de la connexion WebSocket...');
        // Écouter l'événement 'connected' pour s'abonner après la connexion
        window.notificationClient.on('connected', () => {
          console.log('✅ MessagesDisplay: WebSocket connecté, abonnement aux messages');
          this.subscribeToMessages();
        });
        // Réessayer aussi après un délai
        setTimeout(checkClient, 1000);
        return;
      }

      // Le client est prêt, s'abonner aux messages
      this.subscribeToMessages();
    };

    checkClient();
  }

  subscribeToMessages() {
    if (!window.notificationClient) {
      console.error('❌ MessagesDisplay: notificationClient non disponible');
      return;
    }

    console.log('📬 MessagesDisplay: Abonnement aux notifications admin_message');
    
    // S'abonner aux messages admin
    window.notificationClient.on('admin_message', (notification) => {
      console.log('📬 MessagesDisplay: Nouveau message reçu via WebSocket:', notification);
      // Recharger les messages (qui mettra à jour le badge automatiquement)
      this.loadMessages().then(() => {
        // S'assurer que le badge est bien mis à jour
        this.displayBadge();
        // Afficher une notification
        this.showNotification(notification);
      });
    });

    // Écouter aussi les notifications génériques pour les messages
    window.notificationClient.on('notification', (notification) => {
      if (notification.type === 'admin_message' || notification.data?.messageId) {
        console.log('📬 MessagesDisplay: Notification de message reçue:', notification);
        // Recharger les messages (qui mettra à jour le badge automatiquement)
        this.loadMessages().then(() => {
          // S'assurer que le badge est bien mis à jour
          this.displayBadge();
          this.showNotification(notification);
        });
      }
    });
  }

  async loadMessages() {
    try {
      console.log('📥 MessagesDisplay: Chargement des messages...');
      
      // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
      const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
      console.log('👤 Utilisateur actuel:', {
        _id: user?._id,
        siteId: user?.siteId,
        groupId: user?.groupId,
        role: user?.role
      });
      
      // Récupérer le siteId depuis sessionStorage pour l'envoyer au serveur
      const storedSiteId = sessionStorage.getItem('currentSiteId');
      const userSiteId = user?.siteId;
      const siteIdToSend = storedSiteId || userSiteId;
      
      // Construire l'URL avec le siteId si disponible
      let url = '/api/messages';
      if (siteIdToSend) {
        url += `?siteId=${siteIdToSend}`;
        console.log('📤 Envoi du siteId au serveur:', siteIdToSend);
      }
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.messages = data.data || [];
        const oldUnreadCount = this.unreadCount;
        this.unreadCount = data.unreadCount || 0;
        
        console.log(`📊 MessagesDisplay: ${this.messages.length} message(s) total, ${this.unreadCount} non lu(s)`);
        
        if (this.messages.length > 0) {
          console.log('📋 Messages reçus:');
          this.messages.forEach((msg, idx) => {
            console.log(`   ${idx + 1}. "${msg.subject}" - Type: ${msg.recipients?.type} - IDs: ${msg.recipients?.ids?.map(id => id.toString()).join(', ') || 'N/A'}`);
          });
        } else {
          console.log('⚠️ Aucun message trouvé pour cet utilisateur');
        }
        
        // Toujours afficher le badge (même si le compte n'a pas changé)
        // Cela garantit que le badge apparaît même au premier chargement
        this.displayBadge();
        
        // Si la modal est ouverte, la mettre à jour automatiquement
        this.updateMessagesModal();
        
        // Si le nombre de messages non lus a changé, forcer l'affichage du badge
        if (oldUnreadCount !== this.unreadCount && this.unreadCount > 0) {
          console.log(`🔄 MessagesDisplay: Nombre de messages non lus changé (${oldUnreadCount} → ${this.unreadCount})`);
          setTimeout(() => this.displayBadge(), 100);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ MessagesDisplay: Erreur HTTP lors du chargement:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ MessagesDisplay: Erreur lors du chargement des messages:', error);
    }
  }

  updateMessagesModal() {
    // Vérifier si la modal est ouverte
    const modal = document.getElementById('messages-modal');
    if (!modal) return; // Modal fermée, pas besoin de mettre à jour
    
    console.log('🔄 Mise à jour automatique de la modal de messages');
    
    // Mettre à jour le contenu de la modal
    const messagesListContainer = modal.querySelector('#messages-list-container');
    if (messagesListContainer) {
      const unreadMessages = this.messages.filter(m => {
        // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
        const user = window.currentUser || (typeof getStoredUser === 'function' ? getStoredUser() : null);
        const currentUserId = user?._id || null;
        return !m.readBy?.some(r => {
          const readUserId = typeof r.user === 'object' ? r.user._id : r.user;
          return String(readUserId) === String(currentUserId);
        });
      });
      
      // Mettre à jour le compteur de messages non lus dans le header de la modal
      const modalHeader = modal.querySelector('.modal-header');
      if (modalHeader && unreadMessages.length > 0) {
        let unreadBanner = modal.querySelector('.unread-messages-banner');
        if (!unreadBanner) {
          unreadBanner = document.createElement('div');
          unreadBanner.className = 'unread-messages-banner';
          unreadBanner.style.cssText = 'background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;';
          const modalBody = modal.querySelector('.modal-body');
          if (modalBody) {
            modalBody.insertBefore(unreadBanner, messagesListContainer);
          }
        }
        unreadBanner.innerHTML = `<strong><i class="fas fa-info-circle"></i> ${unreadMessages.length} message(s) non lu(s)</strong>`;
      } else {
        const unreadBanner = modal.querySelector('.unread-messages-banner');
        if (unreadBanner) unreadBanner.remove();
      }
      
      // Mettre à jour la liste des messages
      if (this.messages.length === 0) {
        messagesListContainer.innerHTML = `
          <p class="text-center" style="padding: 2rem; color: #666;">
            <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>
            Aucun message
          </p>
        `;
      } else {
        messagesListContainer.innerHTML = this.renderMessagesList();
        
        // Réattacher les événements de clic sur les messages
        this.attachMessageClickHandlers(modal);
      }
      
      // Faire défiler vers le haut pour voir les nouveaux messages
      messagesListContainer.scrollTop = 0;
    }
  }

  attachMessageClickHandlers(modal) {
    // Attacher les événements de clic sur chaque message
    modal.querySelectorAll('.message-item').forEach(item => {
      item.addEventListener('click', async () => {
        const messageId = item.dataset.messageId;
        if (messageId) {
          await this.openMessage(messageId);
        }
      });
    });
  }

  displayBadge() {
    console.log(`🏷️ MessagesDisplay: Affichage du badge - ${this.unreadCount} message(s) non lu(s)`);
    
    // Chercher le bouton de messages
    let messagesBtn = document.getElementById('messages-btn');
    
    if (!messagesBtn) {
      // Si le bouton n'existe pas, le créer
      console.log('🏷️ MessagesDisplay: Création du bouton messages...');
      this.createMessagesButton();
      // Attendre un peu et réessayer
      setTimeout(() => {
        this.displayBadge();
      }, 200);
      return;
    }
    
    // S'assurer que le bouton a position: relative pour le badge
    messagesBtn.style.position = 'relative';
    
    // Chercher un badge existant
    let badge = document.getElementById('messages-unread-badge');
    
    // Créer le badge s'il n'existe pas
    if (!badge) {
      console.log('🏷️ MessagesDisplay: Création du badge de notification');
      badge = document.createElement('span');
      badge.id = 'messages-unread-badge';
      badge.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        background: #e74c3c;
        color: white;
        border-radius: 50%;
        min-width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: bold;
        z-index: 1000;
        padding: 0 6px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      `;
      
      // Ajouter l'animation CSS si elle n'existe pas
      if (!document.getElementById('badge-pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'badge-pulse-animation';
        style.textContent = `
          @keyframes badgePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
          #messages-unread-badge {
            animation: badgePulse 1s ease-in-out;
          }
        `;
        document.head.appendChild(style);
      }
      
      messagesBtn.appendChild(badge);
      console.log('✅ MessagesDisplay: Badge créé et attaché au bouton');
    }
    
    // Mettre à jour le badge (même s'il vient d'être créé)
    badge = document.getElementById('messages-unread-badge');
    if (badge) {
      if (this.unreadCount > 0) {
        badge.textContent = this.unreadCount > 99 ? '99+' : String(this.unreadCount);
        badge.style.display = 'flex';
        badge.style.visibility = 'visible';
        badge.style.opacity = '1';
        console.log(`✅ MessagesDisplay: Badge affiché avec ${this.unreadCount} message(s) non lu(s)`);
      } else {
        badge.style.display = 'none';
        badge.style.visibility = 'hidden';
        console.log('✅ MessagesDisplay: Badge masqué (aucun message non lu)');
      }
    } else {
      console.error('❌ MessagesDisplay: Impossible de créer ou trouver le badge');
    }
  }

  createMessagesButton() {
    // Créer un bouton de messages dans le header si il n'existe pas
    // Chercher dans plusieurs emplacements possibles du header
    const header = document.querySelector('header');
    if (!header) {
      console.warn('⚠️ MessagesDisplay: Header non trouvé, retry dans 500ms...');
      setTimeout(() => this.createMessagesButton(), 500);
      return;
    }
    
    // Chercher le conteneur des boutons (généralement dans le header)
    const userInfo = header.querySelector('div[style*="display: flex"]') || 
                     header.querySelector('div:last-child') || 
                     header;
    
    let messagesBtn = document.getElementById('messages-btn');
    if (!messagesBtn) {
      console.log('✅ MessagesDisplay: Création du bouton Messages');
      messagesBtn = document.createElement('button');
      messagesBtn.id = 'messages-btn';
      messagesBtn.innerHTML = '<i class="fas fa-envelope"></i> Messages';
      messagesBtn.style.cssText = `
        position: relative; 
        margin-right: 0.5rem; 
        background-color: #3498db; 
        color: white; 
        border: none; 
        padding: 0.7rem 1.2rem; 
        border-radius: 8px; 
        cursor: pointer; 
        font-weight: 600; 
        font-size: 0.9rem;
        transition: background-color 0.3s ease;
      `;
      messagesBtn.onmouseover = () => messagesBtn.style.backgroundColor = '#2980b9';
      messagesBtn.onmouseout = () => messagesBtn.style.backgroundColor = '#3498db';
      messagesBtn.onclick = () => this.showMessagesModal();
      
      // Insérer avant le bouton de déconnexion ou à la fin
      const logoutBtn = userInfo.querySelector('#logout-btn');
      if (logoutBtn) {
        userInfo.insertBefore(messagesBtn, logoutBtn);
      } else {
        // Si pas de bouton logout trouvé, insérer avant le dernier élément ou à la fin
        const lastChild = userInfo.lastElementChild;
        if (lastChild && lastChild !== messagesBtn) {
          userInfo.insertBefore(messagesBtn, lastChild);
        } else {
          userInfo.appendChild(messagesBtn);
        }
      }
      console.log('✅ MessagesDisplay: Bouton Messages créé et inséré');
    } else {
      console.log('ℹ️ MessagesDisplay: Bouton Messages existe déjà');
    }
  }

  showMessagesModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'messages-modal';
    modal.style.display = 'block';
    
    const unreadMessages = this.messages.filter(m => {
      // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
      const user = window.currentUser || (typeof getStoredUser === 'function' ? getStoredUser() : null);
      const currentUserId = user?._id || null;
      return !m.readBy?.some(r => {
        const readUserId = typeof r.user === 'object' ? r.user._id : r.user;
        return readUserId === currentUserId;
      });
    });
    
    modal.innerHTML = `
      <div class="modal-content large">
        <div class="modal-header">
          <h3><i class="fas fa-envelope"></i> Messages reçus</h3>
          <button class="modal-close" onclick="document.getElementById('messages-modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          ${unreadMessages.length > 0 ? `
            <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
              <strong><i class="fas fa-info-circle"></i> ${unreadMessages.length} message(s) non lu(s)</strong>
            </div>
          ` : ''}
          <div id="messages-list-container" style="max-height: 500px; overflow-y: auto;">
            ${this.messages.length === 0 ? `
              <p class="text-center" style="padding: 2rem; color: #666;">
                <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>
                Aucun message
              </p>
            ` : this.renderMessagesList()}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="document.getElementById('messages-modal').remove()">Fermer</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Fermer en cliquant en dehors
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    // Attacher les événements de clic sur les messages
    this.attachMessageClickHandlers(modal);
    modal.querySelectorAll('.message-item').forEach(item => {
      item.addEventListener('click', () => {
        const messageId = item.dataset.messageId;
        this.openMessage(messageId);
      });
    });
  }

  renderMessagesList() {
    const priorityColors = {
      low: '#95a5a6',
      normal: '#3498db',
      high: '#f39c12',
      urgent: '#e74c3c'
    };
    
    // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
    const user = window.currentUser || (typeof getStoredUser === 'function' ? getStoredUser() : null);
    const currentUserId = user?._id || null;
    
    return this.messages.map(message => {
      const isRead = message.readBy?.some(r => {
        const readUserId = typeof r.user === 'object' ? r.user._id : r.user;
        return readUserId === currentUserId;
      });
      
      return `
        <div class="message-item" data-message-id="${message._id}" style="
          border: 1px solid #ddd;
          border-left: 4px solid ${priorityColors[message.priority] || '#3498db'};
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          background: ${isRead ? '#fff' : '#f8f9fa'};
          cursor: pointer;
          transition: all 0.2s;
        " onmouseover="this.style.transform='translateX(5px)'" onmouseout="this.style.transform='translateX(0)'">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
            <div>
              <strong style="font-size: 1rem;">${message.subject}</strong>
              ${!isRead ? '<span style="background: #3498db; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; margin-left: 0.5rem;">Nouveau</span>' : ''}
            </div>
            <span style="color: #666; font-size: 0.85rem;">${this.formatDate(message.createdAt)}</span>
          </div>
          <div style="color: #666; margin-bottom: 0.5rem; font-size: 0.9rem;">
            <i class="fas fa-user"></i> ${message.sender.name || message.sender.businessName || 'Admin'}
            <span style="margin-left: 1rem;">
              <span style="background: ${priorityColors[message.priority]}; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">
                ${message.priority}
              </span>
            </span>
          </div>
          <div style="color: #333; line-height: 1.6; font-size: 0.9rem;">
            ${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  async openMessage(messageId) {
    const message = this.messages.find(m => m._id === messageId);
    if (!message) return;
    
    // Marquer comme lu
    try {
      // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
      await fetchFn(`/api/messages/${messageId}/read`, { method: 'PUT', credentials: 'include' });
      await this.loadMessages();
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
    
    // Afficher le message complet
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${message.subject}</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #ddd;">
            <strong>De:</strong> ${message.sender.name || message.sender.businessName || 'Admin'}<br>
            <strong>Date:</strong> ${this.formatDate(message.createdAt)}<br>
            <strong>Priorité:</strong> <span style="text-transform: capitalize;">${message.priority}</span>
          </div>
          <div style="white-space: pre-wrap; line-height: 1.8;">
            ${message.content}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Fermer</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Fermer en cliquant en dehors
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    // Fermer la modale de liste si elle est ouverte
    const listModal = document.getElementById('messages-modal');
    if (listModal) listModal.remove();
  }

  showNotification(notification) {
    // 🔊 Jouer une alerte sonore
    this.playNotificationSound();
    
    // Afficher une notification toast non-bloquante
    if (typeof showToast === 'function') {
      showToast(notification.message || notification.title, 'info');
    } else {
      // Créer une notification toast fermable au lieu d'un alert bloquant
      this.showDismissibleToast(notification.title || 'Nouveau message', notification.message || notification.title);
    }
  }

  playNotificationSound() {
    // Utiliser le client de notifications s'il est disponible
    if (window.notificationClient && typeof window.notificationClient.playSound === 'function') {
      try {
        window.notificationClient.playSound();
        console.log('🔊 Alerte sonore jouée pour le nouveau message');
      } catch (error) {
        console.warn('⚠️ Erreur lors de la lecture du son:', error);
        // Fallback: créer un beep simple
        this.playSimpleBeep();
      }
    } else {
      // Fallback: créer un beep simple
      this.playSimpleBeep();
    }
  }

  playSimpleBeep() {
    try {
      // Créer un contexte audio simple pour un beep
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Si l'audioContext est suspendu, le reprendre
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          this.createBeep(audioContext);
        }).catch(err => {
          console.warn('⚠️ Impossible de réactiver l\'AudioContext:', err);
        });
      } else {
        this.createBeep(audioContext);
      }
    } catch (error) {
      console.warn('⚠️ Impossible de créer un beep:', error);
    }
  }

  createBeep(audioContext) {
    try {
      // Créer un beep court et doux
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Fréquence agréable (800 Hz)
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      // Volume doux (30%)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      // Durée courte (200ms)
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('⚠️ Erreur lors de la création du beep:', error);
    }
  }

  showDismissibleToast(title, message) {
    // Créer un conteneur de toasts s'il n'existe pas
    let container = document.getElementById('messages-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'messages-toast-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `;
      document.body.appendChild(container);
    }

    // Créer le toast
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: white;
      border-left: 4px solid #3498db;
      border-radius: 8px;
      padding: 1rem 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      min-width: 300px;
      animation: slideInRight 0.3s ease;
      cursor: pointer;
      position: relative;
    `;

    toast.innerHTML = `
      <div style="display: flex; align-items: start; gap: 1rem;">
        <div style="font-size: 1.5rem;">🔔</div>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 0.5rem; color: #2c3e50;">${title}</div>
          <div style="color: #666; font-size: 0.9rem;">${message}</div>
        </div>
        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                style="background: none; border: none; font-size: 1.5rem; color: #999; cursor: pointer; padding: 0; margin-left: 0.5rem; line-height: 1;">
          ×
        </button>
      </div>
    `;

    // Ajouter l'animation CSS si elle n'existe pas
    if (!document.getElementById('toast-animations')) {
      const style = document.createElement('style');
      style.id = 'toast-animations';
      style.textContent = `
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(toast);

    // Fermer automatiquement après 5 secondes
    const autoClose = setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, 5000);

    // Fermer au clic (annuler le timer)
    toast.addEventListener('click', () => {
      clearTimeout(autoClose);
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    });
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Initialiser le gestionnaire de messages pour les sites
if (typeof window !== 'undefined') {
  // Ne s'initialiser que si on n'est pas sur le dashboard admin (qui a son propre gestionnaire)
  if (!window.location.pathname.includes('group-dashboard')) {
    window.messagesDisplay = new MessagesDisplay();
  }
}

// Exporter pour les modules ES6
export default MessagesDisplay;

// Exporter globalement pour les scripts classiques
if (typeof window !== 'undefined') {
  window.MessagesDisplay = MessagesDisplay;
}

