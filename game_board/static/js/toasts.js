"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.showToast = showToast;
function showToast(message, type) {
    if (type === void 0) { type = 'success'; }
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
