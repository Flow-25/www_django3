export function showToast(message, type) {
    if (type === void 0) { type = 'success'; }
    document.addEventListener('DOMContentLoaded', function () {
        showToast('Testowe powiadomienie działa!', 'success');
    });
    var container = document.querySelector('.toast-container') || createToastContainer();
    var toast = document.createElement('div');
    toast.className = "toast ".concat(type);
    toast.textContent = message;
    container.appendChild(toast);
    // Usuń powiadomienie po 5 sekundach
    setTimeout(function () {
        toast.remove();
    }, 5000);
}
function createToastContainer() {
    var container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}
