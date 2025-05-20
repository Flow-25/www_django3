interface Dot {
    row: number;
    col: number;
    color: string;
}

class GameBoardContinue {
    rows: number;
    cols: number;
    dots: Dot[];
    paths: { [color: string]: { row: number; col: number }[] };
    selectedColor: string | null = null;

    constructor(rows: number, cols: number, dots: Dot[], paths: { [color: string]: { row: number; col: number }[] }) {
        this.rows = rows;
        this.cols = cols;
        this.dots = dots;
        this.paths = paths;

        this.renderGrid();
        this.drawPaths();
        this.setupEventListeners();
    }

    renderGrid(): void {
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
        container.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
        container.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;

        console.log('Rozpoczęto renderowanie siatki.');

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = row.toString();
                cell.dataset.col = col.toString();
                cell.style.border = '1px solid #ccc';

                let dot: Dot | undefined = undefined;
                for (let i = 0; i < this.dots.length; i++) {
                    if (this.dots[i].row === row && this.dots[i].col === col) {
                        dot = this.dots[i];
                        break;
                    }
                }

                if (dot) {
                    cell.style.backgroundColor = dot.color;
                    cell.classList.add('dot', 'start-dot');
                    console.log(`Dodano kropkę: row=${row}, col=${col}, color=${dot.color}`);
                }

                cell.addEventListener('click', () => this.handleCellClick(row, col, cell));
                container.appendChild(cell);
            }
        }

        console.log('Siatka została wygenerowana.');
    }

    drawPaths(): void {
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

        if (!this.paths[this.selectedColor]) {
            this.paths[this.selectedColor] = [];
        }

        const currentPath = this.paths[this.selectedColor];

        // **Blokowanie rysowania, jeśli głowa ścieżki jest w punkcie końcowym i ścieżka ma długość >= 2**
        if (currentPath.length > 0) {
            const lastPoint = currentPath[currentPath.length - 1];
            if (this.isEndDot(lastPoint.row, lastPoint.col) && currentPath.length >= 2) {
                alert('Ścieżka skończona!');
                return;
            }
        }

        const isStartDot = this.dots.some(dot => dot.row === row && dot.col === col && dot.color === this.selectedColor);

        if (cell.classList.contains('dot') && !isStartDot) {
            alert('Nie możesz rozpocząć ścieżki na polu innego koloru!');
            return;
        }

        // **Usuwanie głowy ścieżki po ponownym kliknięciu**
        if (currentPath.length > 0) {
            const lastPoint = currentPath[currentPath.length - 1];
            if (lastPoint.row === row && lastPoint.col === col) {
                currentPath.pop(); // Usuń głowę
                this.drawPaths(); // Przerysuj ścieżki
                return;
            }
        }

        // Zapobieganie przecinaniu się ścieżek
        let alreadyInPath = false;
        for (const color in this.paths) {
            const path = this.paths[color];
            if (path.some(point => point.row === row && point.col === col)) {
                alreadyInPath = true;
                break;
            }
        }
        if (alreadyInPath) {
            alert('Nie możesz przecinać istniejących ścieżek!');
            return;
        }

        // Sprawdź, czy kliknięte pole sąsiaduje z ostatnim polem w ścieżce
        if (currentPath.length > 0) {
            const lastPoint = currentPath[currentPath.length - 1];
            if (!this.isNeighbor(lastPoint.row, lastPoint.col, row, col)) {
                alert('Możesz zaznaczyć tylko sąsiadujące pola!');
                return;
            }
        }

        // Dodaj pole do ścieżki
        currentPath.push({ row, col });
        this.drawPaths();
    }

    isEndDot(row: number, col: number): boolean {
        // Sprawdź, czy pole jest jednym z dwóch pól końcowych
        return this.dots.some(dot => dot.row === row && dot.col === col && dot.color === this.selectedColor);
    }

    isNeighbor(row1: number, col1: number, row2: number, col2: number): boolean {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    setupEventListeners(): void {
        const colorPicker = document.getElementById('color-picker') as HTMLInputElement;
        const savePathBtn = document.getElementById('overwrite-game-btn') as HTMLButtonElement;

        colorPicker.addEventListener('input', () => {
            this.selectedColor = colorPicker.value;
            console.log(`Wybrano kolor: ${this.selectedColor}`);
        });

        savePathBtn.addEventListener('click', () => {
            this.savePaths();
        });
    }

    savePaths(): void {
        const gameIdElement = document.getElementById('game-id') as HTMLInputElement;
        const gameId = parseInt(gameIdElement.value, 10);
    
        if (!gameId || Object.keys(this.paths).length === 0) {
            alert('Nie można zapisać gry: brak ID gry lub ścieżek!');
            return;
        }
    
        fetch(`/game_board/${gameId}/save-path/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': this.getCsrfToken(), // Dodaj token CSRF
            },
            body: JSON.stringify({ paths: this.paths }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Nie udało się zapisać ścieżek.');
                }
                return response.json();
            })
            .then(data => {
                console.log('Ścieżki zapisane:', data);
                alert('Ścieżki zostały zapisane!');
            })
            .catch(error => {
                console.error('Wystąpił błąd podczas zapisywania ścieżek:', error);
                alert('Wystąpił błąd podczas zapisywania ścieżek.');
            });
    }
    
    // Funkcja pomocnicza do pobierania tokena CSRF
    getCsrfToken(): string {
        const cookies = document.cookie.split('; ');
        for (let i = 0; i < cookies.length; i++) {
            if (cookies[i].indexOf('csrftoken=') === 0) {
                return cookies[i].split('=')[1];
            }
        }
        return '';
    }

    overwriteGame(): void {
        const gameIdElement = document.getElementById('game-id') as HTMLInputElement;
        const gameId = parseInt(gameIdElement.value, 10);
    
        if (!gameId || Object.keys(this.paths).length === 0) {
            alert('Nie można nadpisać gry: brak ID gry lub ścieżek!');
            return;
        }
    
        fetch(`/game_board/${gameId}/overwrite/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': this.getCsrfToken(),
            },
            body: JSON.stringify({ paths: this.paths }),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Nie udało się nadpisać gry.');
                }
                return response.json();
            })
            .then(data => {
                console.log('Gra nadpisana:', data);
                alert('Gra została nadpisana!');
            })
            .catch(error => {
                console.error('Wystąpił błąd podczas nadpisywania gry:', error);
                alert('Wystąpił błąd podczas nadpisywania gry.');
            });
    }
}

let gameBoardContinue: GameBoardContinue; // Zmienna globalna

function loadGameBoardContinue(gameId: number): void {
    fetch(`/game_board/continue/${gameId}/`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log('Dane gry:', data);
            const { rows, cols, dots, paths } = data;
            gameBoardContinue = new GameBoardContinue(rows, cols, dots, paths); // Przypisz do zmiennej globalnej
        })
        .catch(error => {
            console.error('Wystąpił błąd:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const gameIdElement = document.getElementById('game-id') as HTMLInputElement;

    if (gameIdElement && gameIdElement.value) {
        const gameId = parseInt(gameIdElement.value, 10);
        if (!isNaN(gameId)) {
            loadGameBoardContinue(gameId);
        }
    } else {
        console.error('Element game-id nie został znaleziony.');
    }
});