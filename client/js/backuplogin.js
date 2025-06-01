import auth from './auth.js';

import auth from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const users = JSON.parse(localStorage.getItem('chaif-ses-users') || '[]');
      const hash = btoa(password + 'chaifses-salt');
      const user = users.find(u => u.email === email && u.password === hash);
      if (!user) {
        alert("Identifiants incorrects");
        return;
      }
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'fake-token');
      // Redirection dynamique
      window.location.href = 'index.html';
    });
  }
});

// Ta fonction showToast reste inchangée
function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = document.createElement('div');
    icon.className = 'toast-icon';
    icon.textContent = type === 'success' ? '✅' : '❌';
    
    const text = document.createElement('div');
    text.className = 'toast-message';
    text.textContent = message;
    
    toast.appendChild(icon);
    toast.appendChild(text);
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }, 100);
} 