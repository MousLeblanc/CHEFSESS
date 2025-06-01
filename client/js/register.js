// register.js
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
  toast.style.zIndex = 1000;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Fonction d’inscription réelle vers API
async function registerUser(data) {
  const res = await fetch('http://localhost:5000/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const name = form.querySelector('input[name="name"]').value.trim();
    const email = form.querySelector('input[name="email"]').value.trim();
    const password = form.querySelector('input[name="password"]').value;
    // Gestion du rôle: <select name="role"> ou radio input
    const roleField = form.querySelector('select[name="role"], input[name="role"]:checked');
    const role = roleField ? roleField.value : '';
    const businessNameField = form.querySelector('input[name="businessName"]');
    const businessName = businessNameField ? businessNameField.value.trim() : '';

    if (!name || !email || !password || !role) {
      showToast("Veuillez remplir tous les champs requis.", "error");
      submitBtn.disabled = false;
      return;
    }

    try {
      await registerUser({ name, email, password, role, businessName });
      showToast("Inscription réussie !", "success");
      setTimeout(() => window.location.href = 'index.html', 1500);
    } catch (e) {
      showToast(e.message, "error");
      submitBtn.disabled = false;
    }
  });
});
