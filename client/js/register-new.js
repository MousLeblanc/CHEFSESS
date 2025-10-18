/ client/js/register.js

// Importer la fonction centralisée (assurez-vous que le chemin est correct)
import { showToast } from './utils.js'; 

async function registerUser(data) {
  try {
    // Utiliser un chemin relatif
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
    throw err;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (!form) return;

  const businessNameContainer = document.getElementById('businessNameContainer');
  const collectiviteTypeGroup = document.getElementById('collectivite-type-group');
  const restaurantTypeGroup = document.getElementById('restaurant-type-group');

  function toggleProfessionalFields(roleValue) {
    const isBusiness = ['resto', 'collectivite', 'fournisseur'].includes(roleValue);
    
    if (businessNameContainer) businessNameContainer.style.display = isBusiness ? 'block' : 'none';
    if (collectiviteTypeGroup) collectiviteTypeGroup.style.display = roleValue === 'collectivite' ? 'block' : 'none';
    if (restaurantTypeGroup) restaurantTypeGroup.style.display = roleValue === 'resto' ? 'block' : 'none';
  }

  // Écouteurs pour les changements de rôle
  form.querySelectorAll('input[name="role"]').forEach(radio => {
    radio.addEventListener('change', (event) => toggleProfessionalFields(event.target.value));
  });

  // Gestion de la soumission du formulaire
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;
    const selectedRoleInput = form.querySelector('input[name="role"]:checked');
    const roleToRegister = selectedRoleInput ? selectedRoleInput.value : '';
    
    let businessName = null;
    if (['resto', 'collectivite', 'fournisseur'].includes(roleToRegister)) {
      businessName = form.querySelector('input[name="businessName"]').value.trim();
    }

    let establishmentType = null;
    if (roleToRegister === 'collectivite') {
      const establishmentTypeSelect = form.querySelector('#establishment-type');
      establishmentType = establishmentTypeSelect ? establishmentTypeSelect.value : null;
    } else if (roleToRegister === 'resto') {
      const restaurantTypeSelect = form.querySelector('#restaurant-type');
      establishmentType = restaurantTypeSelect ? restaurantTypeSelect.value : 'restaurant_traditionnel';
    }
    
    if (!name || !email || !password || !roleToRegister) {
      showToast('Champs obligatoires manquants.', 'error');
      if (submitBtn) submitBtn.disabled = false;
      return;
    }
    if ((['resto', 'collectivite', 'fournisseur'].includes(roleToRegister)) && !businessName) {
      showToast('Le nom de l\'établissement est requis.', 'error');
      if (submitBtn) submitBtn.disabled = false;
      return;
    }
    if (roleToRegister === 'collectivite' && !establishmentType) {
      showToast('Veuillez sélectionner un type d\'établissement.', 'error');
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    const dataToSend = { name, email, password, role: roleToRegister, businessName, establishmentType };

    try {
      const result = await registerUser(dataToSend);
      showToast(result.message || "Inscription réussie ! Redirection...", "success");
      setTimeout(() => window.location.href = 'index.html', 2000);
    } catch (err) {
      showToast(err.message || "Échec de l'inscription.", "error");
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
