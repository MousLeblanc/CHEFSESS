//  login.js
import { showToast } from './utils.js';
import { redirectByRole } from './auth.js'; 

async function handleLogin(email, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 🔐 Important pour envoyer/recevoir les cookies
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `Erreur HTTP ${res.status}`);
    }

    // 🍪 Token géré via cookie HTTP-Only (plus sécurisé)
    // On stocke uniquement les données utilisateur
    localStorage.setItem('user', JSON.stringify(data.user));

    showToast("Connexion réussie!", "success");

    setTimeout(() => {
      redirectByRole(data.user.role, data.user.establishmentType);
    }, 1000);

  } catch (err) {
    showToast(err.message || "Erreur de connexion inconnue.", "error");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');     // Utilise getElementById
  const passwordInput = document.getElementById('password'); // Utilise getElementById

  if (loginForm && emailInput && passwordInput) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value; // Ne pas trimmer le mot de passe

      if (!email || !password) {
        showToast("Veuillez remplir tous les champs.", "error");
        return;
      }
      await handleLogin(email, password);
    });
  } else {
    console.warn("Le formulaire de connexion ou ses champs (email/password avec ID) n'ont pas été trouvés dans index.html.");
  }
});