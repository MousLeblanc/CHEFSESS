// client/js/settings.js
import { StorageHelper } from './storageHelper.js';
import { logout, getCurrentUser } from './auth.js';
import { showToast } from './utils.js';
import { apiRequest } from './apiHelper.js';

document.addEventListener('DOMContentLoaded', async () => {
  const token = StorageHelper.getItem('token');
    // 🍪 Token géré via cookie HTTP-Only (authentification automatique)

  const user = await getCurrentUser();
  if (user) {
    document.getElementById('name').value = user.name || '';
    // Initialize other fields (theme, UI mode, etc.) from localStorage
    document.getElementById('theme').value = StorageHelper.getItem('theme') || 'light';
  }

  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('name').value,
      theme: document.getElementById('theme').value
    };
    try {
      const updatedUser = await apiRequest('/api/users/profile', 'PUT', data);
      StorageHelper.setItem('user', updatedUser);
      StorageHelper.setItem('theme', data.theme);
      showToast('Profil mis à jour !', 'success');
    } catch (error) {
      showToast(`Erreur : ${error.message}`, 'error');
    }
  });

  document.getElementById('logout-btn').addEventListener('click', logout);

  // --- Additional Settings Logic (moved inside DOMContentLoaded) ---

  // Cache DOM elements for settings forms and navigation
  const dom = {
    accountForm: document.getElementById('account-form'),
    generalForm: document.getElementById('general-form'),
    navLinks: Array.from(document.querySelectorAll('.settings-nav-link')),
    sections: Array.from(document.querySelectorAll('.settings-section')),
    accountName: document.getElementById('account-name'),
    accountEmail: document.getElementById('account-email'),
    restaurantName: document.getElementById('restaurant-name'),
    itemsPerPage: document.getElementById('items-per-page')
  };

  function loadSettings() {
    // Charger les informations du profil
    if (user) {
      dom.accountName.value = user.name || '';
      dom.accountEmail.value = user.email || '';
    }

    // Charger les préférences de l'application depuis localStorage
    const appSettings = JSON.parse(localStorage.getItem('app-settings')) || {};
    dom.restaurantName.value = appSettings.restaurantName || (user?.businessName || '');
    dom.itemsPerPage.value = appSettings.itemsPerPage || '25';
  }

  /**
   * Gère la sauvegarde du formulaire du profil utilisateur
   */
  async function handleAccountFormSubmit(e) {
    e.preventDefault();
    const dataToUpdate = {
      name: dom.accountName.value,
      email: dom.accountEmail.value,
    };
    // Note : la modification du mot de passe nécessite une interface dédiée et plus de sécurité

    try {
      const updatedUser = await apiRequest('/api/users/profile', 'PUT', dataToUpdate);
      // Mettre à jour le user dans localStorage pour que les changements soient visibles partout
      localStorage.setItem('user', JSON.stringify(updatedUser));
      showToast('Profil du compte mis à jour !', 'success');
    } catch (error) {
      showToast(`Erreur : ${error.message}`, 'error');
    }
  }

  /**
   * Gère la sauvegarde des paramètres généraux dans le localStorage
   */
  function handleGeneralFormSubmit(e) {
    e.preventDefault();
    const appSettings = JSON.parse(localStorage.getItem('app-settings')) || {};

    appSettings.restaurantName = dom.restaurantName.value;
    appSettings.itemsPerPage = dom.itemsPerPage.value;

    localStorage.setItem('app-settings', JSON.stringify(appSettings));
    showToast('Paramètres généraux enregistrés.', 'success');
  }

  /**
   * Gère la navigation entre les onglets de la page
   */
  function handleTabNavigation(e) {
    e.preventDefault();
    const sectionId = e.currentTarget.dataset.section;

    dom.navLinks.forEach(l => l.classList.remove('active'));
    e.currentTarget.classList.add('active');

    dom.sections.forEach(section => {
      section.style.display = section.id === sectionId ? 'block' : 'none';
    });
  }

  // --- Initialisation ---
  // Attacher les écouteurs d'événements
  if (dom.accountForm) dom.accountForm.addEventListener('submit', handleAccountFormSubmit);
  if (dom.generalForm) dom.generalForm.addEventListener('submit', handleGeneralFormSubmit);
  dom.navLinks.forEach(link => link.addEventListener('click', handleTabNavigation));

  // Charger les paramètres au démarrage et afficher la première section
  loadSettings();
  const generalSection = document.getElementById('general');
  if (generalSection) generalSection.style.display = 'block';
});