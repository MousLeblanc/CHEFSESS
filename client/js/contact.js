// Contact form handling

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const subject = document.getElementById('contact-subject').value;
      const message = document.getElementById('contact-message').value;
      
      // Create mailto link
      const subjectText = encodeURIComponent(`${subject} - Contact Chef SES`);
      const body = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\nSujet: ${subject}\n\nMessage:\n${message}`);
      const mailtoLink = `mailto:info.chefses@gmail.com?subject=${subjectText}&body=${body}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success message
      if (typeof showNotification === 'function') {
        showNotification('Message préparé ! Votre client email va s\'ouvrir.', 'success');
      } else {
        alert('Message préparé ! Votre client email va s\'ouvrir.');
      }
      
      // Reset form
      setTimeout(() => {
        contactForm.reset();
      }, 1000);
    });
  }
});

