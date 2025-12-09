// Landing page JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Navbar scroll effect
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return; // Navbar pas encore chargée
    
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

  // Animate statistics on scroll
  function animateStats() {
    const stats = document.querySelectorAll('.stat-card-animated');
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseFloat(entry.target.dataset.target);
          const statNumber = entry.target.querySelector('.stat-number');
          animateNumber(statNumber, 0, target, 2000);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => statObserver.observe(stat));
  }

  function animateNumber(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = end % 1 === 0 ? Math.floor(current) : current.toFixed(1);
    }, 16);
  }

  // Initialize stats animation
  animateStats();

  // Contact form handling with validation
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          validateField(input);
        }
      });
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Validate all fields
      let isValid = true;
      inputs.forEach(input => {
        if (!validateField(input)) {
          isValid = false;
        }
      });

      if (!isValid) {
        showNotification('Veuillez corriger les erreurs dans le formulaire.', 'error');
        return;
      }

      const submitBtn = document.getElementById('submit-btn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoader = submitBtn.querySelector('.btn-loader');
      
      // Show loader
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline-block';
      submitBtn.disabled = true;
      
      try {
        const formData = {
          name: document.getElementById('contact-name').value,
          email: document.getElementById('contact-email').value,
          phone: document.getElementById('contact-phone').value,
          organization: document.getElementById('contact-organization').value,
          message: document.getElementById('contact-message').value
        };

        // Try to send via API first
        try {
          // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
          const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
          
          const response = await fetchFn('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          
          if (response.ok) {
            showNotification('Message envoyé avec succès ! Nous vous répondrons sous 24h.', 'success');
            contactForm.reset();
            return;
          }
        } catch (apiError) {
          console.log('API not available, using mailto fallback');
        }

        // Fallback to mailto
        const subject = encodeURIComponent('Contact depuis Chef SES');
        const body = encodeURIComponent(
          `Nom: ${formData.name}\nEmail: ${formData.email}\nTéléphone: ${formData.phone || 'N/A'}\nÉtablissement: ${formData.organization || 'N/A'}\n\nMessage:\n${formData.message}`
        );
        const mailtoLink = `mailto:info.chefses@gmail.com?subject=${subject}&body=${body}`;
        window.location.href = mailtoLink;
        showNotification('Message préparé ! Votre client email va s\'ouvrir.', 'success');
        contactForm.reset();
      } catch (error) {
        showNotification('Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
      } finally {
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
      }
    });
  }

  function validateField(field) {
    const errorElement = field.parentElement.querySelector('.form-error');
    let isValid = true;
    let errorMessage = '';

    // Remove previous error styling
    field.classList.remove('error');

    // Check required fields
    if (field.hasAttribute('required') && !field.value.trim()) {
      isValid = false;
      errorMessage = 'Ce champ est requis';
    }
    // Validate email
    else if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        isValid = false;
        errorMessage = 'Email invalide';
      }
    }
    // Validate minlength
    else if (field.hasAttribute('minlength')) {
      const minLength = parseInt(field.getAttribute('minlength'));
      if (field.value.length < minLength) {
        isValid = false;
        errorMessage = `Minimum ${minLength} caractères requis`;
      }
    }

    // Update error display
    if (errorElement) {
      errorElement.textContent = errorMessage;
    }

    if (!isValid) {
      field.classList.add('error');
      field.style.borderColor = '#dc3545';
    } else {
      field.style.borderColor = '';
    }

    return isValid;
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
    
    // Initialiser l'opacité - la vidéo doit être visible
    heroVideo.style.opacity = '1';
    heroVideo.style.transition = 'opacity 0.5s ease';
    heroVideo.style.display = 'block';
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

