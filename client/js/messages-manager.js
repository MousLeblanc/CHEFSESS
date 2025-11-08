// Gestionnaire de messages pour le dashboard admin

class MessagesManager {
  constructor() {
    this.messages = [];
    this.currentFilter = 'sent';
    this.sites = [];
    this.users = [];
    this.init();
  }

  async init() {
    // Charger les données nécessaires
    await this.loadSites();
    await this.loadUsers();
    
    // Écouter les événements
    document.getElementById('send-message-btn')?.addEventListener('click', () => this.showSendMessageModal());
    document.getElementById('send-message-form')?.addEventListener('submit', (e) => this.handleSendMessage(e));
    
    // Charger les messages
    await this.loadMessages();
    
    // Écouter les notifications WebSocket pour les nouveaux messages
    if (window.notificationClient) {
      window.notificationClient.on('admin_message', (notification) => {
        console.log('📬 Nouveau message reçu:', notification);
        this.loadMessages();
      });
    }
  }

  async loadSites() {
    try {
      const response = await fetch('/api/messages/sites', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      this.sites = data.data || [];
      console.log('✅ Sites chargés:', this.sites.length);
      console.log('📋 Exemple de site:', this.sites[0]);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des sites:', error);
      this.sites = [];
    }
  }

  async loadUsers() {
    try {
      const response = await fetch('/api/messages/users');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      this.users = data.data || [];
      console.log('✅ Utilisateurs chargés:', this.users.length);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des utilisateurs:', error);
      this.users = [];
    }
  }

  async loadMessages() {
    try {
      const response = await fetch('/api/messages');
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Réponse non-JSON reçue:', text.substring(0, 200));
        throw new Error('Réponse non-JSON reçue du serveur');
      }
      
      const data = await response.json();
      this.messages = data.data || [];
      this.updateUnreadBadge(data.unreadCount || 0);
      this.renderMessages();
      console.log('✅ Messages chargés:', this.messages.length);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des messages:', error);
      const messagesList = document.getElementById('messages-list');
      if (messagesList) {
        messagesList.innerHTML = `
          <p class="text-center" style="padding: 2rem; color: #e74c3c;">
            <i class="fas fa-exclamation-triangle"></i><br>
            Erreur lors du chargement des messages<br>
            <small style="color: #666;">${error.message}</small>
          </p>
        `;
      }
    }
  }

  updateUnreadBadge(count) {
    const badge = document.getElementById('messages-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  showSendMessageModal() {
    const modal = document.getElementById('send-message-modal');
    if (modal) {
      modal.style.display = 'block';
      // Réinitialiser le formulaire
      document.getElementById('send-message-form').reset();
      document.getElementById('recipients-selection').style.display = 'none';
      document.getElementById('recipients-checkboxes').innerHTML = '';
    }
  }

  handleRecipientTypeChange() {
    const type = document.getElementById('message-recipients-type').value;
    const recipientsDiv = document.getElementById('recipients-selection');
    const checkboxesDiv = document.getElementById('recipients-checkboxes');
    const label = document.getElementById('recipients-label');
    
    if (type === 'all_sites') {
      recipientsDiv.style.display = 'none';
    } else if (type === 'site') {
      recipientsDiv.style.display = 'block';
      label.textContent = 'Sélectionner les sites *';
      checkboxesDiv.innerHTML = this.sites.map(site => {
        // Le modèle Site utilise 'siteName' comme champ principal
        const siteName = site.siteName || site.name || 'Site sans nom';
        const city = site.address?.city || site.city || '';
        const displayText = city ? `${siteName} - ${city}` : siteName;
        console.log('🔍 Site:', { _id: site._id, siteName: site.siteName, name: site.name, address: site.address });
        return `
        <label style="display: block; padding: 0.5rem; cursor: pointer;">
          <input type="checkbox" name="recipientIds" value="${site._id || site._id}" style="margin-right: 0.5rem;">
          ${displayText}
        </label>
      `;
      }).join('');
    } else if (type === 'user') {
      recipientsDiv.style.display = 'block';
      label.textContent = 'Sélectionner les utilisateurs *';
      checkboxesDiv.innerHTML = this.users.map(user => `
        <label style="display: block; padding: 0.5rem; cursor: pointer;">
          <input type="checkbox" name="recipientIds" value="${user._id}" style="margin-right: 0.5rem;">
          ${user.businessName || user.name} (${user.email})${user.siteId?.name ? ` - ${user.siteId.name}` : ''}
        </label>
      `).join('');
    }
  }

  async handleSendMessage(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const recipientsType = formData.get('recipientsType');
    const subject = formData.get('subject');
    const content = formData.get('content');
    const priority = formData.get('priority') || 'normal';
    
    // Récupérer les IDs des destinataires sélectionnés
    const recipientIds = [];
    if (recipientsType !== 'all_sites') {
      const checkboxes = form.querySelectorAll('input[name="recipientIds"]:checked');
      checkboxes.forEach(cb => recipientIds.push(cb.value));
      
      console.log('📤 Frontend - Données avant envoi:', {
        recipientsType,
        recipientIds,
        recipientIdsIsArray: Array.isArray(recipientIds),
        recipientIdsLength: recipientIds.length,
        checkboxesCount: checkboxes.length,
        subject,
        priority
      });
      
      if (recipientIds.length === 0) {
        alert('Veuillez sélectionner au moins un destinataire.');
        return;
      }
    }
    
    const requestBody = {
      recipientsType,
      recipientIds,
      subject,
      content,
      priority
    };
    
    console.log('📤 Frontend - Corps de la requête à envoyer:', {
      ...requestBody,
      recipientIdsIsArray: Array.isArray(requestBody.recipientIds),
      recipientIdsType: typeof requestBody.recipientIds
    });
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Impossible d\'envoyer le message';
        
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } else {
          const errorText = await response.text();
          console.error('❌ Erreur non-JSON:', errorText);
          errorMessage = `Erreur ${response.status}: ${errorText.substring(0, 100)}`;
        }
        
        alert('Erreur: ' + errorMessage);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Réponse non-JSON:', text);
        throw new Error('Réponse non-JSON reçue');
      }
      
      const data = await response.json();
      alert('Message envoyé avec succès !');
      document.getElementById('send-message-modal').style.display = 'none';
      form.reset();
      this.loadMessages();
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('Erreur lors de l\'envoi du message: ' + error.message);
    }
  }

  renderMessages() {
    const container = document.getElementById('messages-list');
    if (!container) return;
    
    // Récupérer l'utilisateur courant
    const currentUserId = window.currentUser?._id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))._id : null);
    const getSenderId = (m) => typeof m.sender === 'object' ? m.sender._id : m.sender;
    
    const filteredMessages = this.currentFilter === 'sent' 
      ? this.messages.filter(m => getSenderId(m) === currentUserId)
      : this.messages.filter(m => getSenderId(m) !== currentUserId);
    
    if (filteredMessages.length === 0) {
      container.innerHTML = `
        <p class="text-center" style="padding: 2rem; color: #666;">
          <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem;"></i><br>
          Aucun message ${this.currentFilter === 'sent' ? 'envoyé' : 'reçu'}
        </p>
      `;
      return;
    }
    
    container.innerHTML = filteredMessages.map(message => {
      // Récupérer l'utilisateur courant
      const currentUserId = window.currentUser?._id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))._id : null);
      const isRead = message.readBy?.some(r => {
        const readUserId = typeof r.user === 'object' ? r.user._id : r.user;
        return readUserId === currentUserId;
      });
      const priorityColors = {
        low: '#95a5a6',
        normal: '#3498db',
        high: '#f39c12',
        urgent: '#e74c3c'
      };
      
      return `
        <div class="message-card" style="
          border: 1px solid #ddd;
          border-left: 4px solid ${priorityColors[message.priority] || '#3498db'};
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          background: ${isRead ? '#fff' : '#f8f9fa'};
          cursor: pointer;
        " onclick="messagesManager.openMessage('${message._id}')">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
            <div>
              <strong style="font-size: 1.1rem;">${message.subject}</strong>
              ${!isRead ? '<span style="background: #3498db; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem; margin-left: 0.5rem;">Nouveau</span>' : ''}
            </div>
            <span style="color: #666; font-size: 0.9rem;">${this.formatDate(message.createdAt)}</span>
          </div>
          <div style="color: #666; margin-bottom: 0.5rem;">
            <i class="fas fa-user"></i> ${message.sender.name || message.sender.businessName || 'Admin'}
            <span style="margin-left: 1rem;">
              <span style="background: ${priorityColors[message.priority]}; color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.75rem;">
                ${message.priority}
              </span>
            </span>
          </div>
          <div style="color: #333; line-height: 1.6;">
            ${message.content.substring(0, 150)}${message.content.length > 150 ? '...' : ''}
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
      await fetch(`/api/messages/${messageId}/read`, { method: 'PUT' });
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

// Fonction globale pour le changement de filtre
window.filterMessages = function(filter) {
  if (window.messagesManager) {
    window.messagesManager.currentFilter = filter;
    document.querySelectorAll('[data-filter]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    window.messagesManager.renderMessages();
  }
};

// Fonction globale pour le changement de type de destinataire
window.handleRecipientTypeChange = function() {
  if (window.messagesManager) {
    window.messagesManager.handleRecipientTypeChange();
  }
};

// Initialiser le gestionnaire de messages
if (typeof window !== 'undefined') {
  window.messagesManager = new MessagesManager();
}

export default MessagesManager;

