import { showToast } from './toasts.js';

function initializeSSE(): void {
    const eventSource = new EventSource('/plansze/sse/notifications/');

    eventSource.addEventListener('newBoard', (event: MessageEvent) => {
        console.log('Odebrano zdarzenie newBoard:', event.data);
        const data = JSON.parse(event.data);
        showToast(`Użytkownik ${data.creator_username} utworzył nową planszę: ${data.board_name}.`);
    });

    eventSource.addEventListener('newPath', (event: MessageEvent) => {
        console.log('Odebrano zdarzenie newPath:', event.data);
        const data = JSON.parse(event.data);
        showToast(`Użytkownik ${data.user_username} zapisał ścieżkę na planszy: ${data.board_name}.`);
    });

    eventSource.onerror = () => {
        console.error('Błąd połączenia SSE.');
        showToast('Błąd połączenia z serwerem powiadomień.', 'error');
    };

    eventSource.onopen = () => {
        console.log('Połączenie SSE zostało nawiązane.');
    };
}

document.addEventListener('DOMContentLoaded', initializeSSE);