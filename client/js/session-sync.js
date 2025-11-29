// client/js/session-sync.js
// Système de synchronisation de session entre onglets

class SessionSync {
  constructor() {
    this.channel = null;
    this.listeners = [];
    this.tabId = this.generateTabId();
    
    // Initialiser le canal de communication entre onglets
    if (typeof BroadcastChannel !== 'undefined') {
      this.channel = new BroadcastChannel('chef-ses-session-sync');
      this.channel.onmessage = (event) => {
        this.handleMessage(event);
      };
    }
    
    // Écouter les changements de sessionStorage (via localStorage comme proxy)
    // Note: sessionStorage ne déclenche pas l'événement storage dans le même onglet
    // On utilise localStorage comme mécanisme de synchronisation
    window.addEventListener('storage', (e) => {
      if (e.key === 'chef-ses-session-update') {
        this.handleSessionUpdate();
      }
    });
    
    // Stocker l'ID de l'onglet dans sessionStorage pour le récupérer plus tard
    sessionStorage.setItem('tabId', this.tabId);
    console.log('🆔 ID de l\'onglet:', this.tabId);
  }
  
  // Générer un ID unique pour cet onglet
  generateTabId() {
    // Essayer de récupérer un ID existant
    const existingId = sessionStorage.getItem('tabId');
    if (existingId) {
      return existingId;
    }
    // Générer un nouvel ID
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Notifier les autres onglets d'un changement de session
  notifySessionChange(userData) {
    if (this.channel) {
      this.channel.postMessage({
        type: 'SESSION_CHANGE',
        user: userData,
        tabId: this.tabId, // Inclure l'ID de l'onglet source
        timestamp: Date.now()
      });
    }
    
    // Utiliser localStorage comme fallback pour la synchronisation
    try {
      localStorage.setItem('chef-ses-session-update', JSON.stringify({
        user: userData,
        tabId: this.tabId,
        timestamp: Date.now()
      }));
      // Supprimer immédiatement pour éviter l'accumulation
      setTimeout(() => {
        localStorage.removeItem('chef-ses-session-update');
      }, 100);
    } catch (e) {
      console.warn('⚠️ Impossible d\'utiliser localStorage pour la synchronisation:', e);
    }
  }
  
  // Gérer les messages reçus des autres onglets
  handleMessage(event) {
    // Ignorer les messages provenant de cet onglet
    if (event.data.tabId === this.tabId) {
      return;
    }
    
    if (event.data.type === 'SESSION_CHANGE') {
      console.log(`🔄 Changement de session détecté depuis l'onglet ${event.data.tabId}`);
      this.handleSessionUpdate(event.data.user);
    } else if (event.data.type === 'LOGOUT') {
      console.log(`🚪 Déconnexion détectée depuis l'onglet ${event.data.tabId}`);
      this.handleLogout();
    }
  }
  
  // Obtenir le contexte de l'onglet actuel (rôle et siteId)
  getTabContext() {
    const currentPath = window.location.pathname;
    
    // Essayer d'abord de récupérer depuis la clé spécifique à l'onglet
    const userKey = `user-${this.tabId}`;
    const roleKey = `role-${this.tabId}`;
    const storedUser = sessionStorage.getItem(userKey) || sessionStorage.getItem('user');
    const storedRole = sessionStorage.getItem(roleKey);
    
    let currentRole = storedRole;
    let currentSiteId = null;
    
    if (storedUser) {
      try {
        // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
        const user = typeof getStoredUser === 'function' 
          ? getStoredUser()
          : (typeof safeJSONParse === 'function' 
            ? safeJSONParse(storedUser, null)
            : JSON.parse(storedUser));
        if (user) {
          if (!currentRole) currentRole = user.role;
          currentSiteId = user.siteId || sessionStorage.getItem(`currentSiteId-${this.tabId}`) || sessionStorage.getItem('currentSiteId');
        }
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }
    
    // Déduire le rôle depuis l'URL si pas dans sessionStorage
    if (!currentRole) {
      if (currentPath.includes('supplier-dashboard')) currentRole = 'fournisseur';
      else if (currentPath.includes('ehpad-dashboard')) currentRole = 'collectivite';
      else if (currentPath.includes('collectivite-dashboard')) currentRole = 'collectivite';
      else if (currentPath.includes('group-dashboard')) currentRole = 'groupe';
    }
    
    return { role: currentRole, siteId: currentSiteId, path: currentPath };
  }
  
  // Gérer une mise à jour de session
  async handleSessionUpdate(userData = null) {
    const tabContext = this.getTabContext();
    console.log('🔄 Mise à jour de session - Contexte onglet:', tabContext);
    
    // Vérifier avec le serveur pour obtenir les données à jour
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.status === 401) {
        // Session expirée - seulement si on est sur un dashboard
        if (tabContext.path && !tabContext.path.includes('index.html') && tabContext.path !== '/') {
          console.log('🚪 Session expirée - redirection vers login');
          this.handleLogout();
        }
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        const user = data?.user || data;
        
        if (user) {
          // Stocker les données utilisateur avec l'ID de l'onglet pour isoler les contextes
          const userKey = `user-${this.tabId}`;
          const roleKey = `role-${this.tabId}`;
          
          // Si l'onglet a déjà un contexte (rôle), vérifier si le nouveau rôle correspond
          // Si le rôle est différent, ne pas mettre à jour sessionStorage pour cet onglet
          // Cela permet d'avoir plusieurs onglets avec des rôles différents
          const storedRole = sessionStorage.getItem(roleKey);
          if (storedRole && storedRole !== user.role) {
            console.log(`⚠️ Rôle différent détecté - Onglet: ${storedRole}, Nouveau: ${user.role}`);
            console.log('   → Ne pas mettre à jour sessionStorage pour cet onglet');
            console.log('   → Permettre à cet onglet de garder son contexte');
            return; // Ne pas mettre à jour si le rôle est différent
          }
          
          // Si l'onglet est sur un dashboard spécifique et que le rôle correspond, mettre à jour
          if (tabContext.path && !tabContext.path.includes('index.html') && tabContext.path !== '/') {
            // Vérifier que le rôle correspond au dashboard
            const expectedRole = this.getRoleForPath(tabContext.path);
            if (expectedRole && expectedRole !== user.role) {
              console.log(`⚠️ Rôle ${user.role} ne correspond pas au dashboard ${tabContext.path}`);
              return; // Ne pas mettre à jour
            }
          }
          
          // Mettre à jour sessionStorage avec la clé spécifique à l'onglet
          sessionStorage.setItem(userKey, JSON.stringify(user));
          sessionStorage.setItem(roleKey, user.role);
          
          // Mettre à jour aussi la clé globale 'user' pour compatibilité
          // mais seulement si le rôle correspond au contexte de l'onglet
          if (!storedRole || storedRole === user.role) {
            sessionStorage.setItem('user', JSON.stringify(user));
          }
          
          // Pour les sites, mettre à jour currentSiteId si nécessaire
          if (user.siteId && user.role === 'collectivite') {
            const storedSiteId = sessionStorage.getItem('currentSiteId');
            // Si on a déjà un siteId stocké et qu'il est différent, ne pas le changer
            // Cela permet d'avoir plusieurs onglets avec des sites différents
            if (!storedSiteId || storedSiteId === user.siteId) {
              sessionStorage.setItem('currentSiteId', user.siteId);
            }
          }
          
          // Notifier les listeners
          this.listeners.forEach(listener => {
            try {
              listener(user);
            } catch (e) {
              console.error('❌ Erreur dans le listener de session:', e);
            }
          });
          
          // Vérifier si on doit rediriger selon le rôle (seulement depuis la page de connexion)
          this.checkRoleAndRedirect(user);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de session:', error);
    }
  }
  
  // Obtenir le rôle attendu pour un chemin
  getRoleForPath(path) {
    if (path.includes('supplier-dashboard')) return 'fournisseur';
    if (path.includes('ehpad-dashboard') || path.includes('collectivite-dashboard')) return 'collectivite';
    if (path.includes('group-dashboard')) return 'groupe';
    return null;
  }
  
  // Gérer la déconnexion
  handleLogout() {
    const tabContext = this.getTabContext();
    console.log('🚪 Déconnexion - Contexte onglet:', tabContext);
    
    // Vérifier si on est vraiment déconnecté (pas juste un changement de rôle)
    fetch('/api/auth/me', {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      if (response.status === 401) {
        // Vraiment déconnecté - nettoyer et rediriger
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('currentSiteId');
        
        // Notifier les listeners
        this.listeners.forEach(listener => {
          try {
            listener(null);
          } catch (e) {
            console.error('❌ Erreur dans le listener de déconnexion:', e);
          }
        });
        
        // Rediriger vers la page de connexion si on n'y est pas déjà
        if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
          window.location.href = '/index.html';
        }
      } else {
        // Pas vraiment déconnecté - probablement juste un changement de rôle
        console.log('⚠️ Changement de rôle détecté, pas de déconnexion');
      }
    }).catch(error => {
      console.error('❌ Erreur lors de la vérification de déconnexion:', error);
      // En cas d'erreur, nettoyer quand même
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('currentSiteId');
    });
  }
  
  // Vérifier le rôle et rediriger si nécessaire
  checkRoleAndRedirect(user) {
    const currentPath = window.location.pathname;
    const expectedPath = this.getExpectedPathForRole(user.role, user.establishmentType);
    
    // Si on est sur un dashboard qui ne correspond pas au rôle, ne pas rediriger automatiquement
    // L'utilisateur peut avoir plusieurs onglets ouverts avec des rôles différents
    // (par exemple, un onglet fournisseur et un onglet site)
    
    // Vérifier seulement si on est sur la page de connexion
    if (currentPath === '/' || currentPath === '/index.html') {
      if (expectedPath && !currentPath.includes(expectedPath)) {
        console.log(`🔄 Redirection vers ${expectedPath} pour le rôle ${user.role}`);
        window.location.href = expectedPath;
      }
    }
  }
  
  // Obtenir le chemin attendu pour un rôle
  getExpectedPathForRole(role, establishmentType) {
    switch (role) {
      case 'fournisseur':
        return '/supplier-dashboard.html';
      case 'collectivite':
      case 'resto':
        if (establishmentType === 'ehpad' || establishmentType === 'maison_de_retraite') {
          return '/ehpad-dashboard.html';
        }
        return '/collectivite-dashboard.html';
      case 'groupe':
      case 'admin':
        return '/group-dashboard.html';
      default:
        return null;
    }
  }
  
  // Ajouter un listener pour les changements de session
  onSessionChange(callback) {
    this.listeners.push(callback);
    
    // Retourner une fonction pour supprimer le listener
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  // Notifier une déconnexion
  notifyLogout() {
    if (this.channel) {
      this.channel.postMessage({
        type: 'LOGOUT',
        timestamp: Date.now()
      });
    }
    
    try {
      localStorage.setItem('chef-ses-logout', Date.now().toString());
      setTimeout(() => {
        localStorage.removeItem('chef-ses-logout');
      }, 100);
    } catch (e) {
      console.warn('⚠️ Impossible d\'utiliser localStorage pour la déconnexion:', e);
    }
  }
}

// Créer une instance globale
const sessionSync = new SessionSync();

// Exporter pour utilisation dans d'autres modules
if (typeof window !== 'undefined') {
  window.sessionSync = sessionSync;
}

export default sessionSync;

