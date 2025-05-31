import { showToast } from './toasts.js';
function initializeSSE() {
    var eventSource = new EventSource('/plansze/sse/notifications/');
    eventSource.addEventListener('newBoard', function (event) {
        console.log('Odebrano zdarzenie newBoard:', event.data);
        var data = JSON.parse(event.data);
        showToast("U\u017Cytkownik ".concat(data.creator_username, " utworzy\u0142 now\u0105 plansz\u0119: ").concat(data.board_name, "."));
    });
    eventSource.addEventListener('newPath', function (event) {
        console.log('Odebrano zdarzenie newPath:', event.data);
        var data = JSON.parse(event.data);
        showToast("U\u017Cytkownik ".concat(data.user_username, " zapisa\u0142 \u015Bcie\u017Ck\u0119 na planszy: ").concat(data.board_name, "."));
    });
    eventSource.onerror = function () {
        console.error('Błąd połączenia SSE.');
        showToast('Błąd połączenia z serwerem powiadomień.', 'error');
    };
    eventSource.onopen = function () {
        console.log('Połączenie SSE zostało nawiązane.');
    };
}
document.addEventListener('DOMContentLoaded', initializeSSE);
