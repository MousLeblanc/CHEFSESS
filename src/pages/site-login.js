const form = document.getElementById('site-login-form');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion');
    }

    localStorage.setItem('user', JSON.stringify(data.user));

    if (data.user.siteId) {
      window.location.href = `/pages/site-dashboard.html?siteId=${data.user.siteId}`;
    } else {
      throw new Error('Aucun site associé à ce compte');
    }

  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.style.display = 'block';
  }
});
