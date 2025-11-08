// Affichage des notifications de promotions (super promo et produits à sauver)

console.log('📦 promotion-notifications.js: Script chargé');

class PromotionNotifications {
  constructor() {
    console.log('🔔 PromotionNotifications: Constructeur appelé');
    console.log('   Host:', typeof window !== 'undefined' ? window.location.host : 'N/A');
    this.notifications = [];
    this.unreadCount = 0;
    this.isSubscribed = false; // Flag pour éviter les abonnements multiples
    this.promotionHandler = null; // Référence au handler pour pouvoir le supprimer
    this.connectedHandler = null; // Référence au handler de connexion
    this.init();
  }

  async init() {
    console.log('🔔 PromotionNotifications: Initialisation...');
    console.log('   URL:', window.location.href);
    console.log('   Host:', window.location.host);
    
    try {
      // Charger les notifications depuis le localStorage EN PREMIER
      // pour s'assurer qu'elles sont disponibles même si le reste échoue
      this.loadNotificationsFromStorage();
      
      // Créer le bouton de notifications de promotions
      this.createPromotionsButton();
      
      // Attendre un peu pour que le bouton soit bien créé
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Afficher le badge
      setTimeout(() => {
        this.displayBadge();
      }, 200);
      
      // Attendre que le client de notifications soit disponible et connecté
      this.setupNotificationsListener();
      
      console.log('✅ PromotionNotifications: Initialisation terminée');
    } catch (error) {
      console.error('❌ PromotionNotifications: Erreur lors de l\'initialisation:', error);
    }
  }

  setupNotificationsListener() {
    // Attendre que le client de notifications soit disponible
    const checkClient = () => {
      if (!window.notificationClient) {
        console.log('⏳ PromotionNotifications: En attente du client de notifications...');
        setTimeout(checkClient, 500);
        return;
      }

      // S'assurer que le client est connecté
      if (!window.notificationClient.isConnected) {
        console.log('⏳ PromotionNotifications: En attente de la connexion WebSocket...');
        // Écouter l'événement 'connected' pour s'abonner après la connexion (une seule fois)
        if (!this.connectedHandler) {
          this.connectedHandler = () => {
            console.log('✅ PromotionNotifications: WebSocket connecté, abonnement aux notifications');
            this.subscribeToPromotions();
          };
          window.notificationClient.on('connected', this.connectedHandler);
        }
        // Réessayer aussi après un délai
        setTimeout(checkClient, 1000);
        return;
      }

      // Le client est prêt, s'abonner aux notifications
      this.subscribeToPromotions();
    };

    checkClient();
  }

  subscribeToPromotions() {
    if (!window.notificationClient) {
      console.error('❌ PromotionNotifications: notificationClient non disponible');
      return;
    }

    // Éviter les abonnements multiples
    if (this.isSubscribed) {
      console.log('🔔 PromotionNotifications: Déjà abonné, skip');
      return;
    }

    console.log('🔔 PromotionNotifications: Abonnement aux notifications product_promotion');
    
    // Créer le handler une seule fois
    this.promotionHandler = (notification) => {
      console.log('🔔 PromotionNotifications: Nouvelle notification de promotion reçue:', notification);
      this.handleNewNotification(notification);
    };
    
    // S'abonner UNIQUEMENT à 'product_promotion' (pas à 'notification' générique pour éviter les doublons)
    window.notificationClient.on('product_promotion', this.promotionHandler);
    
    this.isSubscribed = true;
    console.log('✅ PromotionNotifications: Abonnement effectué');
  }

  handleNewNotification(notification) {
    // Vérifier si cette notification n'a pas déjà été traitée (éviter les doublons)
    // Utiliser une combinaison productId + supplierId + promotionType + timestamp pour identifier les doublons
    const notificationKey = `${notification.data?.productId || ''}_${notification.data?.supplierId || ''}_${notification.data?.promotionType || ''}_${notification.data?.timestamp || Date.now()}`;
    
    // Vérifier si une notification similaire existe déjà (même produit, même fournisseur, même type de promotion)
    const existingNotification = this.notifications.find(n => {
      const existingKey = `${n.data?.productId || ''}_${n.data?.supplierId || ''}_${n.data?.promotionType || ''}`;
      return existingKey === notificationKey.split('_').slice(0, 3).join('_');
    });
    
    if (existingNotification) {
      console.log('⚠️ PromotionNotifications: Notification déjà existante, ignorée (doublon)');
      return;
    }
    
    // Ajouter la notification à la liste
    const notificationData = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9), // ID unique
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      color: notification.color || '#10b981',
      read: false,
      createdAt: new Date()
    };

    this.notifications.unshift(notificationData);
    this.unreadCount++;
    
    // Sauvegarder dans le localStorage
    this.saveNotificationsToStorage();
    
    // Afficher le badge
    this.displayBadge();
    
    // Afficher une notification toast verte
    this.showToast(notification.title, notification.message, notification.color || '#10b981');
    
    // Mettre à jour la modal si elle est ouverte
    if (document.getElementById('promotions-modal')?.style.display === 'flex') {
      this.renderNotifications();
    }
  }

  loadNotificationsFromStorage() {
    try {
      const stored = localStorage.getItem('promotionNotifications');
      if (stored) {
        const data = JSON.parse(stored);
        this.notifications = (data.notifications || []).map(notif => {
          // Convertir les dates string en objets Date
          if (notif.createdAt && typeof notif.createdAt === 'string') {
            notif.createdAt = new Date(notif.createdAt);
          }
          return notif;
        });
        // Calculer le nombre de non lues
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        console.log(`🔔 PromotionNotifications: ${this.notifications.length} notification(s) chargée(s) depuis le localStorage (${this.unreadCount} non lue(s))`);
      } else {
        console.log('🔔 PromotionNotifications: Aucune notification sauvegardée dans le localStorage');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des notifications:', error);
      // En cas d'erreur, réinitialiser
      this.notifications = [];
      this.unreadCount = 0;
    }
  }

  saveNotificationsToStorage() {
    try {
      localStorage.setItem('promotionNotifications', JSON.stringify({
        notifications: this.notifications,
        lastUpdate: new Date()
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des notifications:', error);
    }
  }

  displayBadge() {
    console.log(`🔔 PromotionNotifications: Affichage du badge - ${this.unreadCount} notification(s) non lue(s)`);
    
    // Chercher le bouton de promotions
    let promotionsBtn = document.getElementById('promotions-btn');
    
    if (!promotionsBtn) {
      console.log('🔔 PromotionNotifications: Bouton non trouvé, retry...');
      setTimeout(() => {
        this.displayBadge();
      }, 200);
      return;
    }
    
    // S'assurer que le bouton a position: relative pour le badge
    promotionsBtn.style.position = 'relative';
    
    // Chercher un badge existant
    let badge = document.getElementById('promotions-unread-badge');
    
    // Créer le badge s'il n'existe pas
    if (!badge) {
      console.log('🔔 PromotionNotifications: Création du badge de notification');
      badge = document.createElement('span');
      badge.id = 'promotions-unread-badge';
      badge.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        background: #10b981;
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
      if (!document.getElementById('promotion-badge-pulse-animation')) {
        const style = document.createElement('style');
        style.id = 'promotion-badge-pulse-animation';
        style.textContent = `
          @keyframes promotionBadgePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
          #promotions-unread-badge {
            animation: promotionBadgePulse 1s ease-in-out;
          }
        `;
        document.head.appendChild(style);
      }
      
      promotionsBtn.appendChild(badge);
      console.log('✅ PromotionNotifications: Badge créé et attaché au bouton');
    }
    
    // Mettre à jour le badge
    badge = document.getElementById('promotions-unread-badge');
    if (badge) {
      if (this.unreadCount > 0) {
        badge.textContent = this.unreadCount > 99 ? '99+' : String(this.unreadCount);
        badge.style.display = 'flex';
        badge.style.visibility = 'visible';
        badge.style.opacity = '1';
        console.log(`✅ PromotionNotifications: Badge affiché avec ${this.unreadCount} notification(s) non lue(s)`);
      } else {
        badge.style.display = 'none';
        badge.style.visibility = 'hidden';
        console.log('✅ PromotionNotifications: Badge masqué (aucune notification non lue)');
      }
    }
  }

  createPromotionsButton() {
    // Créer un bouton de notifications de promotions dans le header
    const header = document.querySelector('header');
    if (!header) {
      console.warn('⚠️ PromotionNotifications: Header non trouvé, retry dans 500ms...');
      console.warn('   Document readyState:', document.readyState);
      console.warn('   Body:', document.body ? 'existe' : 'n\'existe pas');
      setTimeout(() => this.createPromotionsButton(), 500);
      return;
    }
    
    console.log('✅ PromotionNotifications: Header trouvé, création du bouton...');
    
    // Chercher le conteneur des boutons (généralement dans le header)
    const userInfo = header.querySelector('div[style*="display: flex"]') || 
                     header.querySelector('div:last-child') || 
                     header;
    
    // Vérifier si le bouton existe déjà
    let promotionsBtn = document.getElementById('promotions-btn');
    if (promotionsBtn) {
      console.log('✅ PromotionNotifications: Bouton déjà existant');
      return;
    }
    
    // Chercher le bouton de messages pour insérer à côté
    const messagesBtn = document.getElementById('messages-btn');
    
    // Créer le bouton de promotions
    promotionsBtn = document.createElement('button');
    promotionsBtn.id = 'promotions-btn';
    promotionsBtn.innerHTML = '<i class="fas fa-bell"></i>';
    promotionsBtn.title = 'Notifications de promotions';
    promotionsBtn.style.cssText = `
      background-color: #10b981;
      color: white;
      border: none;
      padding: 0.7rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;
    `;
    
    promotionsBtn.onmouseover = () => {
      promotionsBtn.style.backgroundColor = '#059669';
    };
    promotionsBtn.onmouseout = () => {
      promotionsBtn.style.backgroundColor = '#10b981';
    };
    
    promotionsBtn.onclick = () => {
      this.showPromotionsModal();
    };
    
    // Insérer le bouton à côté du bouton de messages ou à la fin
    if (messagesBtn && messagesBtn.parentNode) {
      messagesBtn.parentNode.insertBefore(promotionsBtn, messagesBtn.nextSibling);
    } else {
      userInfo.appendChild(promotionsBtn);
    }
    
    console.log('✅ PromotionNotifications: Bouton créé dans le header');
  }

  showPromotionsModal() {
    // Créer la modal si elle n'existe pas
    let modal = document.getElementById('promotions-modal');
    if (!modal) {
      modal = this.createPromotionsModal();
    }
    
    // Afficher la modal
    modal.style.display = 'flex';
    
    // Rendre les notifications
    this.renderNotifications();
  }

  createPromotionsModal() {
    const modal = document.createElement('div');
    modal.id = 'promotions-modal';
    modal.className = 'modal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      z-index: 10000;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      align-items: center;
      justify-content: center;
    `;
    
    modal.innerHTML = `
      <div class="modal-content" style="background: white; padding: 2rem; border-radius: 12px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
        <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0; color: #10b981;"><i class="fas fa-bell"></i> Notifications de promotions</h3>
          <button class="modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">&times;</button>
        </div>
        <div class="modal-body">
          <div id="promotions-list" style="min-height: 200px;">
            <p style="text-align: center; color: #999; padding: 2rem;">Chargement...</p>
          </div>
        </div>
        <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem;">
          <button onclick="promotionNotifications.markAllAsRead()" style="background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
            <i class="fas fa-check-double"></i> Tout marquer comme lu
          </button>
          <button onclick="promotionNotifications.closeModal()" style="background: #6c757d; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
            Fermer
          </button>
        </div>
      </div>
    `;
    
    // Gérer la fermeture
    modal.querySelector('.modal-close').onclick = () => {
      this.closeModal();
    };
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    };
    
    document.body.appendChild(modal);
    return modal;
  }

  renderNotifications() {
    const listContainer = document.getElementById('promotions-list');
    if (!listContainer) return;
    
    if (this.notifications.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #999;">
          <i class="fas fa-bell-slash" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p>Aucune notification de promotion</p>
        </div>
      `;
      return;
    }
    
    listContainer.innerHTML = this.notifications.map(notif => {
      const isSuperPromo = notif.data?.promotionType === 'super_promo';
      const borderColor = isSuperPromo ? '#f39c12' : '#e74c3c';
      const bgColor = notif.read ? '#f9fafb' : '#f0fdf4';
      
      return `
        <div class="promotion-notification-item" 
             data-id="${notif.id}"
             style="background: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;"
             onmouseover="this.style.backgroundColor='#e7f3ff'"
             onmouseout="this.style.backgroundColor='${bgColor}'"
             onclick="promotionNotifications.openNotification('${notif.id}')">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <strong style="color: ${borderColor};">
                  ${isSuperPromo ? '⭐ Super Promo' : '🚨 Produit à sauver'}
                </strong>
                ${!notif.read ? '<span style="background: #10b981; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">Nouveau</span>' : ''}
              </div>
              <p style="margin: 0.25rem 0; font-weight: 600; color: #374151;">${notif.data?.productName || 'Produit'}</p>
              <p style="margin: 0.25rem 0; color: #6b7280; font-size: 0.9rem;">${notif.data?.supplierName || 'Fournisseur'}</p>
              <p style="margin: 0.5rem 0 0 0; color: #4b5563; font-size: 0.85rem;">${notif.message}</p>
              <p style="margin: 0.5rem 0 0 0; color: #9ca3af; font-size: 0.75rem;">
                ${new Date(notif.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  openNotification(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    // Marquer comme lue
    if (!notification.read) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.saveNotificationsToStorage();
      this.displayBadge();
      this.renderNotifications();
    }
    
    // Fermer la modal des notifications
    this.closeModal();
    
    // Récupérer les informations du fournisseur depuis la notification
    const supplierId = notification.data?.supplierId;
    const supplierName = notification.data?.supplierName || 'Fournisseur';
    
    if (!supplierId) {
      console.error('❌ PromotionNotifications: supplierId manquant dans la notification');
      alert('Impossible de trouver le fournisseur associé à cette notification.');
      return;
    }
    
    console.log('🔔 PromotionNotifications: Ouverture du catalogue du fournisseur:', supplierName, supplierId);
    
    // Activer l'onglet "Fournisseurs" si on est sur un dashboard
    const suppliersTabBtn = document.querySelector('[data-tab="suppliers"]');
    if (suppliersTabBtn) {
      console.log('✅ Onglet Fournisseurs trouvé, activation...');
      suppliersTabBtn.click();
      
      // Attendre un peu que l'onglet soit activé et les fournisseurs chargés
      setTimeout(() => {
        this.openSupplierCatalog(supplierId, supplierName);
      }, 500);
    } else {
      // Si pas d'onglet, ouvrir directement le catalogue
      this.openSupplierCatalog(supplierId, supplierName);
    }
  }
  
  openSupplierCatalog(supplierId, supplierName) {
    console.log('🔍 PromotionNotifications: Ouverture du catalogue');
    console.log('   - supplierId:', supplierId);
    console.log('   - supplierName:', supplierName);
    
    // Essayer d'utiliser la fonction globale pour ouvrir le catalogue
    if (typeof window.browseSupplierProductsGlobal === 'function') {
      console.log('✅ Utilisation de browseSupplierProductsGlobal');
      window.browseSupplierProductsGlobal(supplierId, supplierName);
    } else if (typeof window.browseSupplierProducts === 'function') {
      console.log('✅ Utilisation de browseSupplierProducts');
      window.browseSupplierProducts(supplierId, supplierName);
    } else {
      console.error('❌ Aucune fonction de navigation vers le catalogue trouvée');
      alert(`Catalogue du fournisseur: ${supplierName}\nID: ${supplierId}`);
    }
  }

  markAllAsRead() {
    this.notifications.forEach(notif => {
      notif.read = true;
    });
    this.unreadCount = 0;
    this.saveNotificationsToStorage();
    this.displayBadge();
    this.renderNotifications();
  }

  closeModal() {
    const modal = document.getElementById('promotions-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  showToast(title, message, color = '#10b981') {
    const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
      background: ${color};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      gap: 1rem;
      max-width: 400px;
      animation: slideInRight 0.3s ease-out;
    `;
    
    toast.innerHTML = `
      <i class="fas fa-bell" style="font-size: 1.5rem;"></i>
      <div>
        <strong style="display: block; margin-bottom: 0.25rem;">${title}</strong>
        <span style="font-size: 0.9rem; opacity: 0.9;">${message}</span>
      </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 10);
    
    // Retirer après 5 secondes
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 5000);
  }

  createToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
      `;
      document.body.appendChild(container);
    }
    return container;
  }
}

// Instance globale
let promotionNotifications;

// Fonction d'initialisation qui attend que le DOM soit prêt
function initializePromotionNotifications() {
  if (typeof window === 'undefined') {
    return;
  }
  
  console.log('🔔 PromotionNotifications: Tentative d\'initialisation...');
  console.log('   Document readyState:', document.readyState);
  console.log('   Host:', window.location.host);
  
  try {
    // Si le DOM est déjà chargé, initialiser immédiatement
    if (document.readyState === 'loading') {
      console.log('⏳ PromotionNotifications: DOM en cours de chargement, attente...');
      document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ PromotionNotifications: DOM chargé, initialisation...');
        promotionNotifications = new PromotionNotifications();
        window.promotionNotifications = promotionNotifications;
      });
    } else {
      // DOM déjà chargé, initialiser immédiatement
      console.log('✅ PromotionNotifications: DOM déjà chargé, initialisation immédiate...');
      promotionNotifications = new PromotionNotifications();
      window.promotionNotifications = promotionNotifications;
    }
  } catch (error) {
    console.error('❌ PromotionNotifications: Erreur lors de la création de l\'instance:', error);
    console.error('   Stack:', error.stack);
    // Créer une instance vide pour éviter les erreurs
    promotionNotifications = {
      notifications: [],
      unreadCount: 0,
      showPromotionsModal: () => console.warn('PromotionNotifications non initialisé'),
      markAllAsRead: () => {},
      closeModal: () => {}
    };
    window.promotionNotifications = promotionNotifications;
  }
}

// Initialiser seulement si on est dans un navigateur
if (typeof window !== 'undefined') {
  // Essayer d'initialiser immédiatement
  initializePromotionNotifications();
  
  // Aussi essayer après un court délai au cas où le script serait chargé avant le DOM
  setTimeout(() => {
    if (!window.promotionNotifications || !window.promotionNotifications.notifications) {
      console.log('🔄 PromotionNotifications: Réinitialisation après délai...');
      initializePromotionNotifications();
    }
  }, 1000);
}

