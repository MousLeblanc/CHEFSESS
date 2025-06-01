// Dans client/js/index.js
import { getCurrentUser, getToken, redirectByRole } from './auth.js';
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  const token = getToken();
  if (token && user) redirectByRole(user.role);
});

import auth from './auth.js'; // Assurez-vous que l'instance auth est accessible
// import { showToast } from './utils.js'; // Ou une autre fonction pour afficher les messages
// index.js ou <script> dans index.html
document.addEventListener('DOMContentLoaded', () => {
    // Vérifie si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
        // Pas connecté => rester sur la page de login
        return;
    }
    try {
        const user = JSON.parse(userStr);
        // Rediriger selon le rôle
        switch (user.role) {
            case 'maison':
                window.location.href = 'maison-dashboard.html';
                break;
            case 'resto':
                window.location.href = 'accueil.html';
                break;
            case 'fournisseur':
            case 'supplier':
                window.location.href = 'supplier-dashboard.html';
                break;
            default:
                window.location.href = 'accueil.html';
        }
    } catch (e) {
        // Si erreur parsing, nettoyer et rester sur index
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form'); // Présent dans index.html
    const emailInput = document.getElementById('email');     // Assurez-vous que cet ID existe dans index.html
    const passwordInput = document.getElementById('password'); // Assurez-vous que cet ID existe dans index.html

    if (loginForm && emailInput && passwordInput) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Empêche le rechargement de la page

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                // showToast('Veuillez entrer votre email et mot de passe.', 'error');
                alert('Veuillez entrer votre email et mot de passe.'); // Pour un test rapide
                return;
            }

            try {
                console.log("Tentative de connexion avec:", email); // Log pour débogage
                const result = await auth.login(email, password); // Appel à la méthode de auth.js

                if (result && result.success && result.redirectTo) {
                    console.log("Connexion réussie, redirection vers:", result.redirectTo); // Log
                    window.location.href = result.redirectTo;
                } else {
                    console.log("Échec de la connexion:", result ? result.error : "Résultat indéfini de auth.login"); // Log
                    // showToast(result.error || 'Échec de la connexion. Veuillez vérifier vos identifiants.', 'error');
                    alert(result.error || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
                }
            } catch (error) {
                console.error('Erreur inattendue pendant le processus de connexion:', error);
                // showToast('Une erreur technique est survenue. Veuillez réessayer.', 'error');
                alert('Une erreur technique est survenue. Veuillez réessayer.');
            }
        });
    } else {
        console.warn("Le formulaire de connexion ou ses champs (email/password) n'ont pas été trouvés dans index.html.");
    }
document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return; // Pas connecté, rester sur la page
  }

  try {
    const res = await fetch('http://localhost:5000/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      // Token invalide ou expiré
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return;
    }

    const user = JSON.parse(userStr);
    switch (user.role) {
      case 'maison':
        window.location.href = 'maison-dashboard.html';
        break;
      case 'resto':
        window.location.href = 'accueil.html';
        break;
      case 'fournisseur':
        window.location.href = 'suppliers.html';
        break;
      default:
        window.location.href = 'accueil.html';
    }
  } catch (err) {
    console.error("Erreur lors de la vérification du token :", err);
  }
});
});

