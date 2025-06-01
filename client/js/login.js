// login.js

async function handleLogin(email, password) {
  try {
    const res = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw new Error((await res.json()).message);
    const data = await res.json();

    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);

    // Redirection selon le rôle
    switch (data.user.role) {
      case 'maison': window.location.href = 'maison-dashboard.html'; break;
      case 'resto': window.location.href = 'accueil.html'; break;
      case 'fournisseur': window.location.href = 'supplier-dashboard.html'; break;
      default: window.location.href = 'index.html';
    }
  } catch (err) {
    showToast(err.message || "Erreur de connexion", "error");
  }
}

function showToast(message, type = "error") {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = type === "success" ? "#28a745" : "#dc3545";
  toast.style.color = "white";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "8px";
  toast.style.zIndex = 1000;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;
    if (!email || !password) {
      showToast("Veuillez remplir tous les champs", "error");
      return;
    }
    await handleLogin(email, password);
  });
});
