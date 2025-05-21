// js/common.js

/**
 * Gestion des éléments communs de l'interface ChAIf SES Pro
 * Ce script permet de factoriser les fonctionnalités communes
 * à toutes les pages de l'application.
 * NOTE: La navigation est maintenant gérée directement dans chaque page.
 */

document.addEventListener('DOMContentLoaded', function() {
  // Vérification d'authentification
  checkAuthentication();
  
  // Insérer le header et le footer sur les pages authentifiées
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const publicPages = ['login.html', 'register.html'];
  
  if (!publicPages.includes(currentPage)) {
    insertHeader();
    insertFooter();
  }
  
  // Configuration des interactions utilisateur
  setupUserInteractions();
  
  // Création du logo placeholder si nécessaire
  setupLogoPlaceholder();
});

/**
 * Fonction pour insérer le header dans les pages
 */
function insertHeader() {
  // Création directe du header en JavaScript au lieu de charger un fichier externe
  const headerHTML = `
    <header id="header" class="header">
      <div class="container">
        <div class="header-content">
          <div class="logo">
            <a href="accueil.html">
              <img src="img/logo.png" alt="ChAIf SES" id="logo-placeholder" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><text y=%2230%22 font-size=%2230%22>👨‍🍳</text></svg>';">
              <span>ChAIf SES</span>
            </a>
          </div>
          
          <nav>
            <div class="mobile-menu-toggle" id="mobile-menu-button">
              <i class="fas fa-bars"></i>
            </div>
            
            <ul id="nav-links">
              <li><a href="accueil.html"><i class="fas fa-home"></i> Accueil</a></li>
              <li><a href="stock.html"><i class="fas fa-boxes-stacked"></i> Stock</a></li>
              <li><a href="historique.html"><i class="fas fa-history"></i> Menus</a></li>
              <li><a href="fournisseurs.html"><i class="fas fa-truck"></i> Fournisseurs</a></li>
            </ul>
          </nav>
          
          <div class="header-actions">
            <button class="btn-icon" title="Paramètres">
              <i class="fas fa-cog"></i>
            </button>
            
            <div class="user-menu">
              <button id="user-menu-toggle" class="user-menu-button">
                <span id="user-name">Utilisateur</span>
                <i class="fas fa-chevron-down"></i>
              </button>
              
              <ul id="user-dropdown" class="dropdown-menu">
                <li><a href="profile.html"><i class="fas fa-user"></i> Profil</a></li>
                <li><a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Déconnexion</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;
  
  // Insérer le header au début du body
  const headerDiv = document.createElement('div');
  headerDiv.innerHTML = headerHTML;
  document.body.insertBefore(headerDiv.firstChild, document.body.firstChild);
  
  // Mettre à jour le nom d'utilisateur
  updateUserInfo();
  
  // Initialiser les événements du header
  initHeaderEvents();
}

/**
 * Fonction pour insérer le footer dans les pages
 */
function insertFooter() {
  // Création directe du footer en JavaScript au lieu de charger un fichier externe
  const footerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-logo">
            <img src="img/logo.png" alt="ChAIf SES" id="footer-logo-placeholder" class="footer-logo-img" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><text y=%2230%22 font-size=%2230%22>👨‍🍳</text></svg>';">
            <span>ChAIf SES</span>
          </div>
          
          <div class="footer-links">
            <div class="footer-section">
              <h3>Liens rapides</h3>
              <ul>
                <li><a href="accueil.html">Accueil</a></li>
                <li><a href="stock.html">Gestion de stock</a></li>
                <li><a href="historique.html">Historique des menus</a></li>
                <li><a href="fournisseurs.html">Fournisseurs</a></li>
              </ul>
            </div>
            
            <div class="footer-section">
              <h3>Contact</h3>
              <p><i class="fas fa-envelope"></i> support@chaifses.com</p>
              <p><i class="fas fa-phone"></i> +33 1 23 45 67 89</p>
              <div class="social-links">
                <a href="#"><i class="fab fa-facebook"></i></a>
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2025 ChAIf SES. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  `;
  
  // Insérer le footer avant la fermeture du body
  const footerDiv = document.createElement('div');
  footerDiv.innerHTML = footerHTML;
  document.body.appendChild(footerDiv.firstChild);
}

/**
 * Initialiser les événements du header
 */
function initHeaderEvents() {
  // Menu utilisateur déroulant
  const userMenuToggle = document.getElementById('user-menu-toggle');
  const userDropdown = document.getElementById('user-dropdown');
  
  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener('click', function() {
      userDropdown.classList.toggle('show');
    });
    
    // Fermer le menu lorsqu'on clique ailleurs
    document.addEventListener('click', function(e) {
      if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('show');
      }
    });
  }
  
  // Menu mobile
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const navLinks = document.getElementById('nav-links');
  
  if (mobileMenuButton && navLinks) {
    mobileMenuButton.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
  }
  
  // Déconnexion
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
}

/**
 * Mettre à jour les informations utilisateur dans le header
 */
function updateUserInfo() {
  const userNameElement = document.getElementById('user-name');
  const storedUserName = localStorage.getItem('userName');
  
  if (userNameElement && storedUserName) {
    userNameElement.textContent = storedUserName;
  }
}

/**
 * Vérifie si l'utilisateur est authentifié
 * Redirige vers la page de connexion si non
 */
function checkAuthentication() {
  const token = localStorage.getItem('token');
  const publicPages = ['login.html', 'register.html'];
  
  // Extraire le nom de la page actuelle
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  if (!token && !publicPages.includes(currentPage)) {
    // Sauvegarder la page actuelle pour y revenir après connexion
    localStorage.setItem('redirectAfterLogin', currentPage);
    
    // Rediriger vers la page de connexion
    window.location.href = 'login.html';
    return false;
  }
  
  if (token && publicPages.includes(currentPage)) {
    // Si déjà connecté et sur une page publique, rediriger vers l'accueil
    window.location.href = 'accueil.html';
    return false;
  }
  
  return true;
}

/**
 * Configure les interactions utilisateur communes
 */
function setupUserInteractions() {
  // Vérifier si on est sur une page publique
  const publicPages = ['login.html', 'register.html'];
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  if (publicPages.includes(currentPage)) {
    return;
  }
  
  // Menu utilisateur déroulant
  const userMenuToggle = document.getElementById('user-menu-toggle');
  const userDropdown = document.getElementById('user-dropdown');
  
  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener('click', function() {
      userDropdown.classList.toggle('show');
    });
    
    // Fermer le menu lorsqu'on clique ailleurs
    document.addEventListener('click', function(e) {
      if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('show');
      }
    });
  }
  
  // Fonctionnalité de déconnexion
  const logoutBtn = document.getElementById('logout-btn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
}

/**
 * Déconnecte l'utilisateur
 */
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userName');
  window.location.href = 'login.html';
}

/**
 * Configure le logo placeholder
 */
function setupLogoPlaceholder() {
  const logoPlaceholder = document.getElementById('logo-placeholder');
  
  if (logoPlaceholder) {
    logoPlaceholder.onerror = function() {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');
      
      // Background
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(20, 20, 20, 0, 2 * Math.PI);
      ctx.fill();
      
      // Text
      ctx.fillStyle = '#8b4513';
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('👨‍🍳', 20, 20);
      
      logoPlaceholder.src = canvas.toDataURL();
    };
  }
}

/**
 * Affiche un message de succès
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée d'affichage en ms (défaut: 3000)
 */
function showSuccess(message, duration = 3000) {
  showAlert(message, 'success', duration);
}

/**
 * Affiche un message d'erreur
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée d'affichage en ms (défaut: 5000)
 */
function showError(message, duration = 5000) {
  showAlert(message, 'error', duration);
}

/**
 * Affiche un message d'alerte
 * @param {string} message - Message à afficher
 * @param {string} type - Type d'alerte ('success', 'error', 'warning')
 * @param {number} duration - Durée d'affichage en ms
 */
function showAlert(message, type, duration) {
  // Créer l'élément d'alerte
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  
  // Choisir l'icône en fonction du type
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';
  
  // Construire le HTML
  alertDiv.innerHTML = `
    <i class="fas fa-${icon} alert-icon"></i>
    <div>${message}</div>
  `;
  
  // Trouver où insérer l'alerte
  const container = document.querySelector('.container');
  const insertPoint = container ? container.firstChild : document.body.firstChild;
  
  if (container) {
    container.insertBefore(alertDiv, insertPoint);
  } else {
    document.body.insertBefore(alertDiv, document.body.firstChild);
  }
  
  // Faire disparaître l'alerte après la durée spécifiée
  setTimeout(() => {
    alertDiv.style.opacity = '0';
    alertDiv.style.transition = 'opacity 0.5s';
    
    setTimeout(() => {
      alertDiv.remove();
    }, 500);
  }, duration);
}

/**
 * Formate une date (JJ/MM/AAAA)
 * @param {string} dateString - Date au format ISO ou objet Date
 * @returns {string} - Date formatée
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Convertit entre différentes unités de mesure
 * @param {number} value - Valeur à convertir
 * @param {string} fromUnit - Unité d'origine ('g', 'kg', 'ml', 'L', 'unité')
 * @param {string} toUnit - Unité cible ('g', 'kg', 'ml', 'L', 'unité')
 * @returns {number} - Valeur convertie
 */
function convertToBaseUnit(value, unit) {
  switch(unit) {
    case 'kg': return value * 1000; // Convertir en g
    case 'L': return value * 1000;  // Convertir en ml
    default: return value;
  }
}

/**
 * Convertit d'une unité de base vers une unité spécifique
 * @param {number} value - Valeur à convertir
 * @param {string} unit - Unité cible ('g', 'kg', 'ml', 'L', 'unité')
 * @returns {number} - Valeur convertie
 */
function convertFromBaseUnit(value, unit) {
  switch(unit) {
    case 'kg': return value / 1000; // De g à kg
    case 'L': return value / 1000;  // De ml à L
    default: return value;
  }
}

/**
 * Récupère les paramètres de l'application
 * @returns {Object} - Paramètres avec valeurs par défaut
 */
function getAppSettings() {
  // Valeurs par défaut
  const defaultSettings = {
    defaultUnit: 'g',
    autoUpdateStock: true,
    expiryAlertDays: 3
  };
  
  // Fusionner avec les paramètres stockés
  const storedSettings = JSON.parse(localStorage.getItem('app-settings') || '{}');
  return { ...defaultSettings, ...storedSettings };
}

/**
 * Vérifie si une date d'expiration arrive bientôt
 * @param {string} expiryDate - Date d'expiration
 * @param {number} alertDays - Nombre de jours pour l'alerte
 * @returns {boolean} - Vrai si la date expire bientôt
 */
function isExpiringSoon(expiryDate, alertDays = 3) {
  if (!expiryDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const alertDate = new Date();
  alertDate.setDate(alertDate.getDate() + alertDays);
  alertDate.setHours(0, 0, 0, 0);
  
  return expiry <= alertDate && expiry > today;
}

/**
 * Vérifie si une date est dépassée
 * @param {string} expiryDate - Date d'expiration
 * @returns {boolean} - Vrai si la date est dépassée
 */
function isExpired(expiryDate) {
  if (!expiryDate) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  return expiry < today;
}

/**
 * Affiche une notification temporaire
 * Variante de la fonction showAlert, adaptée pour le nouveau stock.js
 * @param {string} message - Message à afficher
 * @param {string} type - Type de notification ('success', 'error', 'info', 'warning')
 */
function showNotification(message, type = 'info') {
  // Réutiliser la fonction showAlert existante avec les paramètres adaptés
  let alertType;
  switch(type) {
    case 'success': alertType = 'success'; break;
    case 'error': alertType = 'error'; break;
    case 'warning': alertType = 'warning'; break;
    default: alertType = 'info';
  }
  
  showAlert(message, alertType, 3000);
}

// Exposer les fonctions utiles globalement
window.showSuccess = showSuccess;
window.showError = showError;
window.showAlert = showAlert;
window.logout = logout;
window.formatDate = formatDate;
window.convertToBaseUnit = convertToBaseUnit;
window.convertFromBaseUnit = convertFromBaseUnit;
window.getAppSettings = getAppSettings;
window.isExpiringSoon = isExpiringSoon;
window.isExpired = isExpired;
window.showNotification = showNotification;