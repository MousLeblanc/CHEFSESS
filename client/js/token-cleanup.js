// Script pour nettoyer les anciens tokens et forcer une reconnexion
(function() {
  console.log('🧹 Vérification et nettoyage des tokens...');
  
  // Fonction pour supprimer TOUS les cookies
  function deleteAllCookies() {
    console.log('🗑️ Suppression de tous les cookies...');
    const cookies = document.cookie.split(";");
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      
      // Supprimer le cookie pour tous les chemins et domaines possibles
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
    }
    
    console.log('✅ Tous les cookies supprimés');
  }
  
  // Fonction pour nettoyer le localStorage
  function clearLocalStorage() {
    console.log('🗑️ Nettoyage du localStorage...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('siteToken');
    console.log('✅ localStorage nettoyé');
  }
  
  // Vérifier s'il faut forcer un nettoyage
  const urlParams = new URLSearchParams(window.location.search);
  const forceCleanup = urlParams.get('forceCleanup');
  
  if (forceCleanup === 'true') {
    console.log('⚠️ Nettoyage forcé détecté');
    deleteAllCookies();
    clearLocalStorage();
    
    // Rediriger vers la page de connexion sans le paramètre
    const cleanUrl = window.location.pathname;
    window.location.replace(cleanUrl);
  }
  
  console.log('✅ Vérification terminée');
})();


