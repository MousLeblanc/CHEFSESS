const form = document.getElementById('register-form');
const roleSelect = document.getElementById('role');
const establishmentTypeGroup = document.getElementById('establishment-type-group');
const errorMessage = document.getElementById('error-message');

roleSelect.addEventListener('change', (e) => {
  if (e.target.value === 'collectivite') {
    establishmentTypeGroup.style.display = 'block';
  } else {
    establishmentTypeGroup.style.display = 'none';
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    role: document.getElementById('role').value,
    businessName: document.getElementById('businessName').value,
    establishmentType: document.getElementById('establishmentType').value || null,
  };

  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }

    localStorage.setItem('user', JSON.stringify(data.user));

    if (data.user.roles && data.user.roles.includes('GROUP_ADMIN')) {
      window.location.href = '/pages/group-dashboard.html';
    } else {
      window.location.href = '/index.html';
    }

  } catch (error) {
    errorMessage.textContent = error.message;
    errorMessage.style.display = 'block';
  }
});
