// Scripts communs pour toutes les pages du site Chef SES

document.addEventListener('DOMContentLoaded', () => {
  // Charger navbar et footer
  const navbarContainer = document.getElementById('navbar-container');
  const footerContainer = document.getElementById('footer-container');
  
  if (navbarContainer) {
    loadComponent('includes/navbar.html', 'navbar-container');
  }
  
  if (footerContainer) {
    loadComponent('includes/footer.html', 'footer-container');
  }
  
  // Initialiser i18n après chargement des composants
  // Le système i18n se réinitialisera automatiquement après le chargement de la navbar
  setTimeout(() => {
    if (window.i18n) {
      // S'assurer que le sélecteur de langue dans la navbar est configuré
      const langSwitcher = document.getElementById('lang-switcher');
      if (langSwitcher && window.i18n) {
        // Configurer le sélecteur via la méthode setupLanguageSwitcher
        window.i18n.setupLanguageSwitcher();
        
        // Supprimer le sélecteur flottant s'il existe maintenant que la navbar est chargée
        const floatingContainer = document.getElementById('language-switcher-container');
        if (floatingContainer) {
          floatingContainer.remove();
        }
      }
      
      // Retraduire la page après le chargement de la navbar
      window.i18n.translate();
    }
  }, 500);
  
  // Navbar scroll effect
  initNavbarScroll();
  
  // Smooth scroll pour les liens d'ancrage
  initSmoothScroll();
  
  // Intersection Observer pour animations
  initScrollAnimations();
});

// Charger un composant HTML
function loadComponent(url, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  fetch(url)
    .then(response => response.text())
    .then(html => {
      container.innerHTML = html;
      // Ré-exécuter les scripts après chargement
      const scripts = container.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    })
    .catch(error => {
      console.warn(`Impossible de charger ${url}:`, error);
    });
}

// Effet de scroll sur la navbar
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Smooth scroll pour les liens d'ancrage
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '#top') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = 80;
          const targetPosition = target.offsetTop - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

// Animations au scroll
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observer les éléments avec la classe animate-on-scroll
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
  });
}

// Fonction utilitaire pour afficher des notifications
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#67C587' : type === 'error' ? '#e74c3c' : '#4b5563'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    max-width: 400px;
    font-family: var(--font-poppins);
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Ajouter les animations CSS si elles n'existent pas
if (!document.getElementById('common-animations')) {
  const style = document.createElement('style');
  style.id = 'common-animations';
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
    
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-on-scroll.animate-in {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);
}
