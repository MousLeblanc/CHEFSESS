// auth-api.js – API simplifiée pour gérer l'authentification depuis index.html

export async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Erreur de connexion');
  }

  return res.json(); // { token, user }
}
// Code JS récupéré de auth-api.js