//  login.js
import { showToast } from './utils.js'; // 

async function handleLogin(email, password) {

  try {
    // MODIFIÉ ICI: URL de l'API
    const res = await fetch('/api/auth/login', { // Utiliser un chemin relatif si le frontend est servi par le même serveur
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json(); // Toujours essayer de parser le JSON pour avoir le message d'erreur

    if (!res.ok) {
        // Utiliser data.message qui vient du backend
        throw new Error(data.message || `Erreur HTTP ${res.status}`);
    }
    // data contient { token, user }

    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);

    showToast("Connexion réussie!", "success");

    // Redirection selon le rôle (logique déjà présente et correcte)
    setTimeout(() => { // Petit délai pour que l'utilisateur voie le toast
        switch (data.user.role) {
          case 'maison': window.location.href = 'maison-dashboard.html'; break;
          case 'resto': window.location.href = 'accueil.html'; break;
          case 'fournisseur': window.location.href = 'supplier-dashboard.html'; break;
          default: window.location.href = 'index.html'; // Fallback, ne devrait pas arriver
        }
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