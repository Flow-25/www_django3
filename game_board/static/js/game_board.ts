interface Dot {
    row: number;
    col: number;
    color: string;
}

class GameBoard {
    rows: number;
    cols: number;
    dots: Dot[] = [];
    selectedColor: string | null = null;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.renderGrid();
    }

    renderGrid(): void {
        console.log('Rozpoczęto renderowanie siatki.');
        const container = document.getElementById('grid-container')!;
        container.innerHTML = ''; // Wyczyść poprzednią zawartość
        container.style.display = 'grid';
        container.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`; // Równe wiersze
        container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`; // Równe kolumny
        container.style.gap = '2px'; // Odstęp między komórkami

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = row.toString();
                cell.dataset.col = col.toString();
                cell.style.border = '1px solid #ccc';
                cell.style.backgroundColor = '#fff'; // Domyślny kolor tła
                cell.addEventListener('click', () => this.handleCellClick(row, col, cell));
                container.appendChild(cell);
            }
        }
        console.log('Siatka została wygenerowana.');
    }

    handleCellClick(row: number, col: number, cell: HTMLElement): void {
        if (!this.selectedColor) {
            alert('Wybierz kolor przed dodaniem lub usunięciem kropki!');
            return;
        }
    
        // Sprawdź, czy komórka ma już przypisany kolor
        let existingDotIndex = -1;
        for (let i = 0; i < this.dots.length; i++) {
            if (this.dots[i].row === row && this.dots[i].col === col) {
                existingDotIndex = i;
                break;
            }
        }
    
        if (existingDotIndex !== -1) {
            const existingDot = this.dots[existingDotIndex];
    
            // Jeśli kliknięto komórkę tym samym kolorem, usuń kropkę
            if (existingDot.color === this.selectedColor) {
                cell.style.backgroundColor = '#fff'; // Przywróć domyślny kolor tła
                this.dots.splice(existingDotIndex, 1); // Usuń kropkę z tablicy
                console.log(`Usunięto kropkę: (${row}, ${col}) w kolorze ${this.selectedColor}`);
                return;
            }
        }
    
        // Sprawdź, czy można dodać kolejną kropkę w wybranym kolorze
        const colorDots = this.dots.filter(dot => dot.color === this.selectedColor);
        if (colorDots.length >= 2) {
            alert('Każdy kolor może mieć tylko dwie kropki!');
            return;
        }
    
        // Dodaj nową kropkę
        cell.style.backgroundColor = this.selectedColor;
        this.dots.push({ row, col, color: this.selectedColor });
        console.log(`Dodano kropkę: (${row}, ${col}) w kolorze ${this.selectedColor}`);
    }
}
let gameBoard: GameBoard | null = null; // Globalna zmienna

// Funkcja do ładowania planszy
function loadGameBoard(boardId: number): void {
    fetch(`/game_board/${boardId}/`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest', // Informacja, że to żądanie AJAX
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Nie udało się załadować planszy.');
            }
            return response.json();
        })
        .then(data => {
            const { name, rows, cols, dots } = data;

            // Ustaw nazwę planszy
            (document.getElementById('name') as HTMLInputElement).value = name;

            // Wygeneruj siatkę
            gameBoard = new GameBoard(rows, cols);

            // Wypełnij siatkę kropkami
            dots.forEach((dot: Dot) => {
                const cell = document.querySelector(
                    `.grid-cell[data-row="${dot.row}"][data-col="${dot.col}"]`
                ) as HTMLElement;
                if (cell) {
                    cell.style.backgroundColor = dot.color;
                    gameBoard!.dots.push(dot); // Użyj `gameBoard!` ponieważ jest globalna
                }
            });
        })
        .catch(error => {
            console.error('Wystąpił błąd podczas ładowania planszy:', error);
            alert('Nie udało się załadować planszy.');
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const colorPicker = document.getElementById('color-picker') as HTMLInputElement;
    colorPicker.addEventListener('input', () => {
        if (gameBoard) {
            gameBoard.selectedColor = colorPicker.value;
            console.log(`Wybrano kolor: ${gameBoard.selectedColor}`);
        }
    });

    document.getElementById('generate-grid-btn')!.addEventListener('click', () => {
        const rows = parseInt((document.getElementById('rows') as HTMLInputElement).value, 10);
        const cols = parseInt((document.getElementById('cols') as HTMLInputElement).value, 10);

        if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
            alert('Podaj poprawne wartości dla liczby wierszy i kolumn.');
            return;
        }

        gameBoard = new GameBoard(rows, cols);
        gameBoard.selectedColor = colorPicker.value;
    });

    document.getElementById('save-board-btn')!.addEventListener('click', () => {
        if (!gameBoard) {
            alert('Najpierw wygeneruj siatkę!');
            return;
        }
    
        const boardId = (document.getElementById('board-id') as HTMLInputElement).value;
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const rows = gameBoard.rows;
        const cols = gameBoard.cols;
        const dots = gameBoard.dots;
    
        if (!name) {
            alert('Podaj nazwę planszy!');
            return;
        }
    
        // Walidacja: Sprawdź, czy każdy kolor ma dokładnie 2 kropki
        const colorCounts: { [color: string]: number } = {};
        dots.forEach(dot => {
            colorCounts[dot.color] = (colorCounts[dot.color] || 0) + 1;
        });
    
        for (const color in colorCounts) {
            if (colorCounts[color] !== 2) {
                alert(`Kolor ${color} musi mieć dokładnie 2 kropki!`);
                return;
            }
        }
    
        const url = boardId
            ? `/game_board/${boardId}/update/` // URL do aktualizacji planszy
            : '/game_board/save/'; // URL do tworzenia nowej planszy
    
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
                name,
                rows,
                cols,
                dots,
            }),
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(errorData => {
                        throw new Error(errorData.error);
                    });
                }
            })
            .then(data => {
                alert(boardId ? 'Plansza została zaktualizowana!' : 'Plansza została zapisana!');
                console.log('ID planszy:', data.id);
            })
            .catch(error => {
                console.error('Wystąpił błąd:', error);
                alert('Wystąpił błąd podczas zapisywania planszy.');
            });
    });

    // Wywołanie funkcji `loadGameBoard` dla edycji planszy
    const boardIdElement = document.getElementById('board-id') as HTMLInputElement;
    if (boardIdElement && boardIdElement.value) {
        const boardId = parseInt(boardIdElement.value, 10);
        if (!isNaN(boardId)) {
            loadGameBoard(boardId);
        }
    }
});

function getCsrfToken(): string {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        if (cookies[i].indexOf('csrftoken=') === 0) {
            return cookies[i].split('=')[1];
        }
    }
    return '';
}