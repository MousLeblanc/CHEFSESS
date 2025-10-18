/**
 * Système d'auto-reload intelligent
 * Force le rechargement des fichiers JS modifiés sans déconnexion
 */

// Stocker les timestamps des fichiers
const fileVersions = new Map();

// Fonction pour vérifier si un fichier a été modifié
async function checkFileVersion(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    const lastModified = response.headers.get('Last-Modified');
    return lastModified;
  } catch (error) {
    console.warn(`Impossible de vérifier la version de ${url}:`, error);
    return null;
  }
}

// Fonction pour forcer le rechargement de la page si nécessaire
async function checkForUpdates() {
  const criticalFiles = [
    '/JS/supplier-common.js',
    '/JS/stock-common.js',
    '/JS/order-tracking.js'
  ];
  
  let hasUpdates = false;
  
  for (const file of criticalFiles) {
    const currentVersion = await checkFileVersion(file);
    
    if (currentVersion) {
      const storedVersion = fileVersions.get(file);
      
      if (storedVersion && storedVersion !== currentVersion) {
        console.log(`📦 Mise à jour détectée pour ${file}`);
        hasUpdates = true;
      }
      
      fileVersions.set(file, currentVersion);
    }
  }
  
  if (hasUpdates) {
    showReloadNotification();
  }
}

// Afficher une notification suggérant de recharger
function showReloadNotification() {
  // Ne pas créer de notification si une existe déjà
  if (document.getElementById('reload-notification')) {
    return;
  }
  
  const notification = document.createElement('div');
  notification.id = 'reload-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1.2rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    z-index: 10001;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 300px;
    animation: slideUp 0.4s ease;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <span style="font-size: 1.5rem;">🔄</span>
      <div>
        <strong style="display: block; margin-bottom: 0.25rem;">Nouvelle version disponible</strong>
        <small>Rechargez pour voir les dernières modifications</small>
      </div>
    </div>
    <div style="display: flex; gap: 0.5rem;">
      <button id="reload-now-btn" style="flex: 1; background: white; color: #667eea; border: none; padding: 0.6rem 1rem; border-radius: 6px; font-weight: 600; cursor: pointer;">
        Recharger maintenant
      </button>
      <button id="reload-later-btn" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 0.6rem 1rem; border-radius: 6px; cursor: pointer;">
        Plus tard
      </button>
    </div>
  `;
  
  // Ajouter animation CSS
  if (!document.getElementById('reload-animation')) {
    const style = document.createElement('style');
    style.id = 'reload-animation';
    style.textContent = `
      @keyframes slideUp {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // Bouton recharger maintenant
  document.getElementById('reload-now-btn').addEventListener('click', () => {
    console.log('🔄 Rechargement forcé par l\'utilisateur');
    location.reload(true); // Force reload from server
  });
  
  // Bouton plus tard
  document.getElementById('reload-later-btn').addEventListener('click', () => {
    notification.remove();
    
    // Redemander dans 2 minutes
    setTimeout(() => {
      showReloadNotification();
    }, 120000);
  });
}

// Démarrer la vérification périodique (toutes les 30 secondes)
export function startAutoReloadCheck() {
  console.log('🔄 Système d\'auto-reload activé (vérification toutes les 30s)');
  
  // Première vérification après 30s
  setTimeout(checkForUpdates, 30000);
  
  // Puis toutes les 30 secondes
  setInterval(checkForUpdates, 30000);
}

// Version alternative : rechargement forcé au clic sur un élément
export function forceReload() {
  console.log('🔄 Rechargement forcé du cache...');
  
  // Vider le cache si possible
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // Recharger depuis le serveur
  location.reload(true);
}

// Raccourci clavier CTRL+SHIFT+R pour forcer le reload
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'R') {
    e.preventDefault();
    console.log('🔄 Rechargement forcé via raccourci clavier');
    forceReload();
  }
});

// Export pour utilisation globale
window.forceReload = forceReload;

