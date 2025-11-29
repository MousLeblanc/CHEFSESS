//  login.js
import { showToast } from './utils.js';
import { redirectByRole } from './auth.js'; 

async function handleLogin(email, password) {
  try {
    // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
    
    const res = await fetchFn('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // 🔐 Important pour envoyer/recevoir les cookies
      body: JSON.stringify({ email, password })
    });

    let data;
    try {
      data = await res.json();
    } catch (jsonError) {
      // Si la réponse n'est pas du JSON, lire le texte
      const text = await res.text();
      console.error('❌ Réponse non-JSON du serveur:', text);
      throw new Error(`Erreur serveur (${res.status}): ${text || 'Réponse invalide'}`);
    }

    if (!res.ok) {
      const errorMessage = data?.error || data?.message || `Erreur HTTP ${res.status}`;
      console.error('❌ Erreur de connexion:', {
        status: res.status,
        error: errorMessage,
        data: data
      });
      throw new Error(errorMessage);
    }

    // 🍪 Token géré via cookie HTTP-Only (plus sécurisé)
    // On stocke uniquement les données utilisateur
    
    // Stocker avec l'ID de l'onglet pour isoler les contextes
    if (window.sessionSync && window.sessionSync.tabId) {
      const tabId = window.sessionSync.tabId;
      sessionStorage.setItem(`user-${tabId}`, JSON.stringify(data.user));
      sessionStorage.setItem(`role-${tabId}`, data.user.role);
      
      // Pour les utilisateurs de sites, stocker le siteId dans sessionStorage (spécifique à cet onglet)
      if (data.user.siteId) {
        sessionStorage.setItem(`currentSiteId-${tabId}`, data.user.siteId);
        console.log('✅ SiteId stocké dans sessionStorage pour cet onglet:', data.user.siteId);
      }
    }
    
    // Mettre à jour aussi la clé globale pour compatibilité
    sessionStorage.setItem('user', JSON.stringify(data.user));
    if (data.user.siteId) {
      sessionStorage.setItem('currentSiteId', data.user.siteId);
    }
    
    // Notifier les autres onglets du changement de session
    if (window.sessionSync) {
      window.sessionSync.notifySessionChange(data.user);
    }

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