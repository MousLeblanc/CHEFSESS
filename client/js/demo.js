// Demo page functionality

function showDemoVideo() {
  const modal = document.getElementById('video-modal');
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeDemoVideo() {
  const modal = document.getElementById('video-modal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  const modal = document.getElementById('video-modal');
  if (e.target === modal) {
    closeDemoVideo();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDemoVideo();
  }
});

