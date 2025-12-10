// Contact form handling

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, textarea, select');
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

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // Show loader
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi en cours...';
      
      // Timeout de sécurité
      const safetyTimeout = setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        showNotification('Le serveur met trop de temps à répondre. Veuillez réessayer.', 'error');
      }, 30000);
      
      try {
        const formData = {
          name: document.getElementById('contact-name').value,
          email: document.getElementById('contact-email').value,
          phone: '', // contact.html n'a pas de champ phone
          organization: '', // contact.html n'a pas de champ organization
          message: document.getElementById('contact-message').value
        };

        // Ajouter le sujet s'il existe
        const subjectElement = document.getElementById('contact-subject');
        if (subjectElement && subjectElement.value) {
          formData.message = `Sujet: ${subjectElement.value}\n\n${formData.message}`;
        }

        // Try to send via API first
        let apiSuccess = false;
        try {
          const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
          
          const response = await fetchFn('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          
          let data;
          try {
            data = await response.json();
          } catch (jsonError) {
            throw new Error(`Erreur serveur (${response.status}): ${response.statusText}`);
          }
          
          if (response.ok && data.success) {
            showNotification(data.message || 'Message envoyé avec succès ! Nous vous répondrons sous 24h.', 'success');
            contactForm.reset();
            apiSuccess = true;
            return;
          } else {
            const errorMsg = data.message || data.error || `Erreur serveur (${response.status})`;
            throw new Error(errorMsg);
          }
        } catch (apiError) {
          console.error('Erreur API:', apiError);
          
          if (apiError.name === 'TypeError' && apiError.message.includes('fetch')) {
            throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion.');
          }
          
          // Si l'API échoue, utiliser le fallback mailto
          console.log('API not available, using mailto fallback');
        }
        
        if (apiSuccess) {
          return;
        }

        // Fallback to mailto
        const subject = subjectElement ? subjectElement.value : 'Contact';
        const subjectText = encodeURIComponent(`${subject} - Contact Chef SES`);
        const body = encodeURIComponent(`Nom: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`);
        const mailtoLink = `mailto:info.chefses@gmail.com?subject=${subjectText}&body=${body}`;
        window.location.href = mailtoLink;
        showNotification('Message préparé ! Votre client email va s\'ouvrir.', 'success');
        contactForm.reset();
      } catch (error) {
        console.error('Erreur complète:', error);
        showNotification(error.message || 'Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
      } finally {
        clearTimeout(safetyTimeout);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  function validateField(field) {
    const errorElement = field.parentElement.querySelector('.form-error');
    let isValid = true;
    let errorMessage = '';

    field.classList.remove('error');

    if (field.hasAttribute('required') && !field.value.trim()) {
      isValid = false;
      errorMessage = 'Ce champ est requis';
    } else if (field.type === 'email' && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        isValid = false;
        errorMessage = 'Email invalide';
      }
    } else if (field.hasAttribute('minlength')) {
      const minLength = parseInt(field.getAttribute('minlength'));
      if (field.value.length < minLength) {
        isValid = false;
        errorMessage = `Minimum ${minLength} caractères requis`;
      }
    }

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

  // Simple notification function
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#67C587' : type === 'error' ? '#dc3545' : '#4b5563'};
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
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
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
});

