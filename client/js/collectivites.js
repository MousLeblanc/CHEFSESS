// Collectivites page - Tab switching

function switchTab(tabName) {
  // Remove active class from all tabs
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active');
  });
  
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Add active class to selected tab
  const button = document.querySelector(`[data-tab="${tabName}"]`);
  const content = document.getElementById(`tab-${tabName}`);
  
  if (button) {
    button.classList.add('active');
  }
  
  if (content) {
    content.classList.add('active');
  }
}

// Initialize first tab
document.addEventListener('DOMContentLoaded', () => {
  switchTab('ecole');
});

