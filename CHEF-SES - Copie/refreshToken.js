// refreshToken.js - Utilitaire pour rafraîchir le token d'authentification

// Fonction pour vérifier le token
export async function checkToken() { // Exported as ES Module
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('Aucun token trouvé');
    return false;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/check-token', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      console.log('Token valide');
      return true;
    } else {
      console.warn('Token invalide ou expiré');
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return false;
  }
}

// Fonction pour rafraîchir le token
export async function refreshToken() { // Exported as ES Module
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Aucun token à rafraîchir');
    }
    
    const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors du rafraîchissement du token: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      console.log('Token rafraîchi avec succès');
      return true;
    } else {
      throw new Error('Pas de nouveau token reçu');
    }
  } catch (error) {
    console.error('Échec du rafraîchissement du token:', error);
    return false;
  }
}

// Fonction pour se reconnecter
export async function reconnect(email, password) { // Exported as ES Module, and email/password as params
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error(`Erreur lors de la connexion: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      console.log('Reconnexion réussie');
      return true;
    } else {
      throw new Error('Pas de token reçu');
    }
  } catch (error) {
    console.error('Échec de la reconnexion:', error);
    return false;
  }
}