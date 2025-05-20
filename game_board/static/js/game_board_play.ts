interface Dot {
    row: number;
    col: number;
    color: string;
}

class GameBoardPlay {
    rows: number;
    cols: number;
    dots: Dot[] = [];
    selectedColor: string | null = null;
    paths: { [color: string]: { row: number; col: number }[] } = {}; // Ścieżki dla każdego koloru

    constructor(rows: number, cols: number, dots: Dot[]) {
        this.rows = rows;
        this.cols = cols;
        this.dots = dots;
        this.renderGrid();
    }

    renderGrid(): void {
        console.log('Rozpoczęto renderowanie siatki w trybie "play".');
        const container = document.getElementById('grid-container')!;
        container.innerHTML = ''; // Wyczyść poprzednią zawartość
        container.style.position = 'relative'; // Ustaw pozycjonowanie kontenera
    
        // Dodaj element SVG do rysowania linii
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('id', 'path-svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none'; // Wyłącz interakcje z SVG
        container.appendChild(svg);
    
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
    
                let dot: Dot | undefined = undefined;
                for (let i = 0; i < this.dots.length; i++) {
                    if (this.dots[i].row === row && this.dots[i].col === col) {
                        dot = this.dots[i];
                        break;
                    }
                }
                if (dot) {
                    cell.style.backgroundColor = dot.color; // Ustaw kolor kropki
                    cell.classList.add('dot', 'start-dot'); // Dodaj klasę, aby oznaczyć, że to pole jest z planszy i jest "startowe"
                }
    
                cell.addEventListener('click', () => this.handleCellClick(row, col, cell));
                container.appendChild(cell);
            }
        }
        console.log('Siatka została wygenerowana w trybie "play".');
    }


    drawPath(): void {
        const svgElement = document.getElementById('path-svg');
        if (!(svgElement instanceof SVGSVGElement)) {
            throw new Error('Element o ID "path-svg" nie jest elementem SVG.');
        }
        const svg = svgElement as SVGSVGElement;
        svg.innerHTML = ''; // Wyczyść poprzednią zawartość SVG
    
        for (const color in this.paths) {
            const path = this.paths[color];
            if (path.length === 0) continue;
    
            // Rysuj linię
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            line.setAttribute('fill', 'none');
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '4');
    
            const points = path
                .map(point => {
                    const cell = document.querySelector(
                        `.grid-cell[data-row="${point.row}"][data-col="${point.col}"]`
                    ) as HTMLElement;
                    const rect = cell.getBoundingClientRect();
                    const containerRect = svg.getBoundingClientRect();
                    const x = rect.left - containerRect.left + rect.width / 2;
                    const y = rect.top - containerRect.top + rect.height / 2;
                    return `${x},${y}`;
                })
                .join(' ');
    
            line.setAttribute('points', points);
            svg.appendChild(line);
    
            // Rysuj kółko na końcu ścieżki (głowa)
            const lastPoint = path[path.length - 1];
            const lastCell = document.querySelector(
                `.grid-cell[data-row="${lastPoint.row}"][data-col="${lastPoint.col}"]`
            ) as HTMLElement;
            const lastRect = lastCell.getBoundingClientRect();
            const cx = lastRect.left - svg.getBoundingClientRect().left + lastRect.width / 2;
            const cy = lastRect.top - svg.getBoundingClientRect().top + lastRect.height / 2;
    
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', cx.toString());
            circle.setAttribute('cy', cy.toString());
            circle.setAttribute('r', '6');
            circle.setAttribute('fill', color);
            svg.appendChild(circle);
        }
    }

    handleCellClick(row: number, col: number, cell: HTMLElement): void {
        if (!this.selectedColor) {
            alert('Wybierz kolor przed rozpoczęciem rysowania trasy!');
            return;
        }
    
        // Sprawdź, czy kliknięte pole jest polem startowym
        const isStartDot = this.dots.some(dot => dot.row === row && dot.col === col && dot.color === this.selectedColor);
    
        // Blokada rozpoczęcia ścieżki na polu innego koloru
        if (cell.classList.contains('dot') && !isStartDot) {
            alert('Nie możesz rozpocząć ścieżki na polu innego koloru!');
            return;
        }
    
        // Pobierz ścieżkę dla wybranego koloru
        if (!this.paths[this.selectedColor]) {
            this.paths[this.selectedColor] = []; // Inicjalizuj ścieżkę, jeśli nie istnieje
        }
    
        const currentPath = this.paths[this.selectedColor];
    
        // Rozpoczęcie ścieżki
        if (currentPath.length === 0) {
            if (isStartDot) {
                currentPath.push({ row, col }); // Rozpocznij ścieżkę od pola startowego
                this.drawPath(); // Zaktualizuj linię
                return;
            } else {
                alert('Musisz rozpocząć ścieżkę od pola startowego!');
                return;
            }
        }
    
        // Blokada kontynuacji ścieżki na polu innego koloru
        const isDifferentColorDot = this.dots.some(dot => dot.row === row && dot.col === col && dot.color !== this.selectedColor);
        if (isDifferentColorDot) {
            alert('Nie możesz wejść na pole innego koloru!');
            return;
        }
    
        // Zakończenie ścieżki
        if (isStartDot) {
            const alreadyInPath = currentPath.some(point => point.row === row && point.col === col);
            if (alreadyInPath) {
                alert('To pole jest już częścią ścieżki!');
                return;
            }
    
            // Dodaj drugie pole startowe i zakończ ścieżkę
            currentPath.push({ row, col });
            this.drawPath(); // Zaktualizuj linię
            alert('Ścieżka została zakończona!');
            return;
        }
    
        // Sprawdź, czy kliknięte pole jest ostatnim polem w ścieżce (głową)
        if (currentPath.length > 0) {
            const lastPoint = currentPath[currentPath.length - 1];
    
            // Jeśli kliknięto głowę, usuń ostatnie pole z ścieżki
            if (lastPoint.row === row && lastPoint.col === col) {
                currentPath.pop();
                this.drawPath(); // Zaktualizuj linię
                return;
            }
        }
    
        // Sprawdź, czy kliknięte pole już istnieje w ścieżce
        const alreadyInPath = currentPath.some(point => point.row === row && point.col === col);
        if (alreadyInPath) {
            alert('To pole jest już częścią ścieżki!');
            return;
        }
    
        // Sprawdź, czy kliknięte pole sąsiaduje z ostatnim polem w ścieżce
        const lastPoint = currentPath[currentPath.length - 1];
        if (!this.isNeighbor(lastPoint.row, lastPoint.col, row, col)) {
            alert('Możesz zaznaczyć tylko sąsiadujące pola!');
            return;
        }
    
        // Dodaj pole do ścieżki dla wybranego koloru
        currentPath.push({ row, col });
    
        this.drawPath(); // Zaktualizuj linię
    }
    hasNeighborWithColor(row: number, col: number, color: string): boolean {
        const neighbors = [
            { row: row - 1, col }, // Góra
            { row: row + 1, col }, // Dół
            { row, col: col - 1 }, // Lewo
            { row, col: col + 1 }  // Prawo
        ];

        return neighbors.some(neighbor => {
            return this.dots.some(dot => dot.row === neighbor.row && dot.col === neighbor.col && dot.color === color);
        });
    }

    isNeighbor(row1: number, col1: number, row2: number, col2: number): boolean {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    savePath(): void {
        console.log('Funkcja savePath została wywołana.');
        if (Object.keys(this.paths).length === 0) {
            alert('Nie zaznaczono żadnych ścieżek!');
            return;
        }
    
        const boardId = (document.getElementById('board-id') as HTMLInputElement).value;
    
        // Logowanie danych
        console.log('Przesyłane dane:', { paths: this.paths });
        console.log('Board ID:', boardId);
    
        fetch(`/game_board/${boardId}/create-game/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({ paths: this.paths }),
        })
            .then(function (response) {
                console.log('Odpowiedź serwera:', response);
                return response.text(); // Zamiast response.json() użyj response.text() do debugowania
            })
            .then(function (text) {
                console.log('Treść odpowiedzi serwera:', text);
                const data = JSON.parse(text); // Spróbuj sparsować odpowiedź jako JSON
                alert('Gra została utworzona!');
                console.log('Utworzono grę:', data);
            })
            .catch(function (error) {
                console.error('Błąd podczas zapisywania ścieżek:', error);
            });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded został wywołany.');

    const boardIdElement = document.getElementById('board-id') as HTMLInputElement;
    console.log('Element board-id:', boardIdElement);
    if (boardIdElement) {
        console.log('Wartość board-id:', boardIdElement.value);
    }

    if (boardIdElement && boardIdElement.value) {
        const boardId = parseInt(boardIdElement.value, 10);
        console.log('Board ID:', boardId);

        if (!isNaN(boardId)) {
            loadGameBoardPlay(boardId);
        } else {
            console.error('Board ID jest nieprawidłowy.');
        }
    } else {
        console.error('Element board-id nie istnieje lub nie ma wartości.');
    }
});

function loadGameBoardPlay(boardId: number): void {
    fetch(`/game_board/${boardId}/`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Nie udało się załadować planszy.');
            }
            return response.json();
        })
        .then(data => {
            const { rows, cols, dots } = data;
            const gameBoardPlay = new GameBoardPlay(rows, cols, dots);

            const colorPicker = document.getElementById('color-picker') as HTMLInputElement;
            colorPicker.addEventListener('input', () => {
                gameBoardPlay.selectedColor = colorPicker.value;
            });

            document.getElementById('save-path-btn')!.addEventListener('click', () => {
                console.log('Przycisk "Zapisz trasę" został kliknięty.');
                gameBoardPlay.savePath();
            });
        })
        .catch(error => {
            console.error('Wystąpił błąd podczas ładowania planszy:', error);
        });
}

function getCsrfToken(): string {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
        if (cookies[i].indexOf('csrftoken=') === 0) {
            return cookies[i].split('=')[1];
        }
    }
    return '';
}