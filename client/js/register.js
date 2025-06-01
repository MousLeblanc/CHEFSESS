// Dans client/js/register.js

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = type === "success" ? "#28a745" : "#dc3545";
  toast.style.color = "white";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "8px";
  toast.style.zIndex = 1000; // z-index élevé
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function registerUser(data) {
  try {
    // Utilisez un chemin relatif et assurez-vous que server.js écoute sur /api/auth/register
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const responseData = await res.json();
    if (!res.ok) {
      throw new Error(responseData.message || `Erreur HTTP ${res.status}`);
    }
    return responseData;
  } catch (err) {
    console.error("Erreur d'inscription API:", err);
    // Le showToast pour l'erreur API est déjà ici, c'est bien.
    throw err; // Relancer pour que le gestionnaire d'événements puisse désactiver le bouton
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (!form) {
    console.warn("Le formulaire d'inscription (register-form) n'a pas été trouvé.");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const roleFromQuery = urlParams.get('role'); // Utilisé pour la logique initiale

  const businessNameContainer = document.getElementById('businessNameContainer'); // Pour afficher/masquer

  function toggleBusinessNameVisibility(roleValue) {
    if (businessNameContainer) {
      if (roleValue === 'resto' || roleValue === 'fournisseur') {
        businessNameContainer.style.display = 'block';
      } else {
        businessNameContainer.style.display = 'none';
      }
    }
  }

  // Gérer la visibilité initiale basée sur le rôle pré-coché (par le script inline de register.html)
  const initiallyCheckedRole = form.querySelector('input[name="role"]:checked');
  if (initiallyCheckedRole) {
    toggleBusinessNameVisibility(initiallyCheckedRole.value);
  }

  // Ajouter des écouteurs d'événements aux boutons radio pour changer la visibilité
  form.querySelectorAll('input[name="role"]').forEach(radio => {
    radio.addEventListener('change', (event) => {
      toggleBusinessNameVisibility(event.target.value);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const passwordInput = form.querySelector('input[name="password"]');
    const businessNameInput = form.querySelector('input[name="businessName"]');
    const selectedRoleInput = form.querySelector('input[name="role"]:checked');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : ''; // Ne pas trimmer le mot de passe
    const roleToRegister = selectedRoleInput ? selectedRoleInput.value : '';
    
    let businessName = '';
    // Récupérer businessName seulement s'il est pertinent pour le rôle et visible
    if (businessNameInput && (roleToRegister === 'resto' || roleToRegister === 'fournisseur')) {
      businessName = businessNameInput.value.trim();
    }
    
    if (!name || !email || !password || !roleToRegister) {
      showToast('Tous les champs (Nom, Email, Mot de passe, Profil) sont obligatoires.', 'error');
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if ((roleToRegister === 'resto' || roleToRegister === 'fournisseur') && !businessName) {
      showToast('Le nom de l\'établissement est requis pour ce profil.', 'error');
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    try {
      const result = await registerUser({ name, email, password, role: roleToRegister, businessName });
      showToast(result.message || "Inscription réussie ! Redirection...", "success");
      setTimeout(() => window.location.href = 'index.html', 2000);
    } catch (err) {
      // L'erreur est déjà affichée par showToast dans registerUser ou ici si validation échoue avant.
      showToast(err.message || "Échec de l'inscription.", "error"); // Assurer un message si registerUser ne le fait pas.
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});