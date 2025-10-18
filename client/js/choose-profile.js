document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', () => {
      const role = card.dataset.role;
      window.location.href = `register-pro.html?role=${role}`;
    });
  });
});




