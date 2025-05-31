export function showToast(message: string, type: 'success' | 'error' = 'success'): void {
    document.addEventListener('DOMContentLoaded', () => {
        showToast('Testowe powiadomienie działa!', 'success');
    });
    const container = document.querySelector('.toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Usuń powiadomienie po 5 sekundach
    setTimeout(() => {
        toast.remove();
    }, 5000);
    
}

function createToastContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}