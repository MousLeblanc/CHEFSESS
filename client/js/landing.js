// Landing page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Navbar scroll effect
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href !== '#hero') {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const offset = 80; // Navbar height
          const targetPosition = target.offsetTop - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Observe feature cards
  document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });

  // Contact form handling
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const message = document.getElementById('contact-message').value;
      
      // Create mailto link
      const subject = encodeURIComponent('Contact depuis Chef SES');
      const body = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      const mailtoLink = `mailto:info@chefses.com?subject=${subject}&body=${body}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success message
      showNotification('Message préparé ! Votre client email va s\'ouvrir.', 'success');
    });
  }

  // Video fallback if video fails to load
  const heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    // Vérifier si la vidéo se charge correctement
    heroVideo.addEventListener('loadeddata', () => {
      console.log('✅ Vidéo chargée avec succès');
      heroVideo.style.opacity = '1';
    });
    
    heroVideo.addEventListener('error', (e) => {
      console.warn('⚠️ Erreur lors du chargement de la vidéo, utilisation du fallback');
      console.warn('   Erreur:', e);
      heroVideo.style.display = 'none';
      const fallback = heroVideo.querySelector('.hero-fallback');
      if (fallback) {
        fallback.style.display = 'block';
      }
    });
    
    // Forcer la lecture si nécessaire (pour certains navigateurs)
    heroVideo.addEventListener('canplay', () => {
      heroVideo.play().catch(err => {
        console.warn('⚠️ Impossible de lire la vidéo automatiquement:', err);
      });
    });
    
    // Initialiser l'opacité
    heroVideo.style.opacity = '0';
    heroVideo.style.transition = 'opacity 0.5s ease';
  }

  // Scroll indicator click
  const scrollIndicator = document.querySelector('.hero-scroll-indicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    });
    scrollIndicator.style.cursor = 'pointer';
  }
});

// Simple notification function
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#67C587' : '#4b5563'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    max-width: 400px;
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

// Add notification animations
const style = document.createElement('style');
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

