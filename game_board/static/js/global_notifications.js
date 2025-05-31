"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toasts_1 = require("./toasts");
function initializeSSE() {
    var eventSource = new EventSource('/plansze/sse/notifications/');
    eventSource.addEventListener('newBoard', function (event) {
        console.log('Odebrano zdarzenie newBoard:', event.data);
        var data = JSON.parse(event.data);
        (0, toasts_1.showToast)("U\u017Cytkownik ".concat(data.creator_username, " utworzy\u0142 now\u0105 plansz\u0119: ").concat(data.board_name, "."));
    });
    eventSource.addEventListener('newPath', function (event) {
        console.log('Odebrano zdarzenie newPath:', event.data);
        var data = JSON.parse(event.data);
        (0, toasts_1.showToast)("U\u017Cytkownik ".concat(data.user_username, " zapisa\u0142 \u015Bcie\u017Ck\u0119 na planszy: ").concat(data.board_name, "."));
    });
    // Obsługa błędów połączenia
    eventSource.onerror = function () {
        console.error('Błąd połączenia SSE.');
        (0, toasts_1.showToast)('Błąd połączenia z serwerem powiadomień.', 'error');
    };
    // Informacja o otwarciu połączenia
    eventSource.onopen = function () {
        console.log('Połączenie SSE zostało nawiązane.');
    };
}
// Wywołaj funkcję po załadowaniu strony
document.addEventListener('DOMContentLoaded', initializeSSE);
