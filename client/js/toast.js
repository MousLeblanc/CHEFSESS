// Toast notification functionality
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container') || this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        this.container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Auto remove
        setTimeout(() => {
            this.remove(toast);
        }, duration);

        return toast;
    }

    remove(toast) {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }

    getIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Global toast manager instance
window.toast = new ToastManager();

// CSS for toast notifications
const toastStyles = `
<style>
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.toast {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px;
    min-width: 300px;
    max-width: 400px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
}

.toast.show {
    transform: translateX(0);
    opacity: 1;
}

.toast.hide {
    transform: translateX(100%);
    opacity: 0;
}

.toast-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
}

.toast-content i {
    font-size: 18px;
}

.toast-success {
    border-left: 4px solid #28a745;
}

.toast-success i {
    color: #28a745;
}

.toast-error {
    border-left: 4px solid #dc3545;
}

.toast-error i {
    color: #dc3545;
}

.toast-warning {
    border-left: 4px solid #ffc107;
}

.toast-warning i {
    color: #ffc107;
}

.toast-info {
    border-left: 4px solid #17a2b8;
}

.toast-info i {
    color: #17a2b8;
}

.toast-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    margin-left: 12px;
    color: #6c757d;
    font-size: 14px;
}

.toast-close:hover {
    color: #495057;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', toastStyles);
