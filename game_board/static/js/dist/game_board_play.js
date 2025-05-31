"use strict";
var GameBoardPlay = /** @class */ (function () {
    function GameBoardPlay(rows, cols, dots) {
        this.dots = [];
        this.selectedColor = null;
        this.paths = {}; // Ścieżki dla każdego koloru
        this.rows = rows;
        this.cols = cols;
        this.dots = dots;
        this.renderGrid();
    }
    GameBoardPlay.prototype.renderGrid = function () {
        var _this = this;
        console.log('Rozpoczęto renderowanie siatki w trybie "play".');
        var container = document.getElementById('grid-container');
        container.innerHTML = ''; // Wyczyść poprzednią zawartość
        container.style.position = 'relative'; // Ustaw pozycjonowanie kontenera
        // Dodaj element SVG do rysowania linii
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('id', 'path-svg');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none'; // Wyłącz interakcje z SVG
        container.appendChild(svg);
        container.style.display = 'grid';
        container.style.gridTemplateRows = "repeat(".concat(this.rows, ", 1fr)"); // Równe wiersze
        container.style.gridTemplateColumns = "repeat(".concat(this.cols, ", 1fr)"); // Równe kolumny
        container.style.gap = '2px'; // Odstęp między komórkami
        var _loop_1 = function (row) {
            var _loop_2 = function (col) {
                var cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = row.toString();
                cell.dataset.col = col.toString();
                cell.style.border = '1px solid #ccc';
                cell.style.backgroundColor = '#fff'; // Domyślny kolor tła
                var dot = undefined;
                for (var i = 0; i < this_1.dots.length; i++) {
                    if (this_1.dots[i].row === row && this_1.dots[i].col === col) {
                        dot = this_1.dots[i];
                        break;
                    }
                }
                if (dot) {
                    cell.style.backgroundColor = dot.color; // Ustaw kolor kropki
                    cell.classList.add('dot', 'start-dot'); // Dodaj klasę, aby oznaczyć, że to pole jest z planszy i jest "startowe"
                }
                cell.addEventListener('click', function () { return _this.handleCellClick(row, col, cell); });
                container.appendChild(cell);
            };
            for (var col = 0; col < this_1.cols; col++) {
                _loop_2(col);
            }
        };
        var this_1 = this;
        for (var row = 0; row < this.rows; row++) {
            _loop_1(row);
        }
        console.log('Siatka została wygenerowana w trybie "play".');
    };
    GameBoardPlay.prototype.drawPath = function () {
        var svgElement = document.getElementById('path-svg');
        if (!(svgElement instanceof SVGSVGElement)) {
            throw new Error('Element o ID "path-svg" nie jest elementem SVG.');
        }
        var svg = svgElement;
        svg.innerHTML = ''; // Wyczyść poprzednią zawartość SVG
        for (var color in this.paths) {
            var path = this.paths[color];
            if (path.length === 0)
                continue;
            // Rysuj linię
            var line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
            line.setAttribute('fill', 'none');
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '4');
            var points = path
                .map(function (point) {
                var cell = document.querySelector(".grid-cell[data-row=\"".concat(point.row, "\"][data-col=\"").concat(point.col, "\"]"));
                var rect = cell.getBoundingClientRect();
                var containerRect = svg.getBoundingClientRect();
                var x = rect.left - containerRect.left + rect.width / 2;
                var y = rect.top - containerRect.top + rect.height / 2;
                return "".concat(x, ",").concat(y);
            })
                .join(' ');
            line.setAttribute('points', points);
            svg.appendChild(line);
            // Rysuj kółko na końcu ścieżki (głowa)
            var lastPoint = path[path.length - 1];
            var lastCell = document.querySelector(".grid-cell[data-row=\"".concat(lastPoint.row, "\"][data-col=\"").concat(lastPoint.col, "\"]"));
            var lastRect = lastCell.getBoundingClientRect();
            var cx = lastRect.left - svg.getBoundingClientRect().left + lastRect.width / 2;
            var cy = lastRect.top - svg.getBoundingClientRect().top + lastRect.height / 2;
            var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', cx.toString());
            circle.setAttribute('cy', cy.toString());
            circle.setAttribute('r', '6');
            circle.setAttribute('fill', color);
            svg.appendChild(circle);
        }
    };
    GameBoardPlay.prototype.handleCellClick = function (row, col, cell) {
        var _this = this;
        if (!this.selectedColor) {
            alert('Wybierz kolor przed rozpoczęciem rysowania trasy!');
            return;
        }
        // Sprawdź, czy kliknięte pole jest polem startowym
        var isStartDot = this.dots.some(function (dot) { return dot.row === row && dot.col === col && dot.color === _this.selectedColor; });
        // Blokada rozpoczęcia ścieżki na polu innego koloru
        if (cell.classList.contains('dot') && !isStartDot) {
            alert('Nie możesz rozpocząć ścieżki na polu innego koloru!');
            return;
        }
        // Pobierz ścieżkę dla wybranego koloru
        if (!this.paths[this.selectedColor]) {
            this.paths[this.selectedColor] = []; // Inicjalizuj ścieżkę, jeśli nie istnieje
        }
        var currentPath = this.paths[this.selectedColor];
        // Rozpoczęcie ścieżki
        if (currentPath.length === 0) {
            if (isStartDot) {
                currentPath.push({ row: row, col: col }); // Rozpocznij ścieżkę od pola startowego
                this.drawPath(); // Zaktualizuj linię
                return;
            }
            else {
                alert('Musisz rozpocząć ścieżkę od pola startowego!');
                return;
            }
        }
        // Blokada kontynuacji ścieżki na polu innego koloru
        var isDifferentColorDot = this.dots.some(function (dot) { return dot.row === row && dot.col === col && dot.color !== _this.selectedColor; });
        if (isDifferentColorDot) {
            alert('Nie możesz wejść na pole innego koloru!');
            return;
        }
        // Zakończenie ścieżki
        if (isStartDot) {
            var alreadyInPath_1 = currentPath.some(function (point) { return point.row === row && point.col === col; });
            if (alreadyInPath_1) {
                alert('To pole jest już częścią ścieżki!');
                return;
            }
            // Dodaj drugie pole startowe i zakończ ścieżkę
            currentPath.push({ row: row, col: col });
            this.drawPath(); // Zaktualizuj linię
            alert('Ścieżka została zakończona!');
            return;
        }
        // Sprawdź, czy kliknięte pole jest ostatnim polem w ścieżce (głową)
        if (currentPath.length > 0) {
            var lastPoint_1 = currentPath[currentPath.length - 1];
            // Jeśli kliknięto głowę, usuń ostatnie pole z ścieżki
            if (lastPoint_1.row === row && lastPoint_1.col === col) {
                currentPath.pop();
                this.drawPath(); // Zaktualizuj linię
                return;
            }
        }
        // Sprawdź, czy kliknięte pole już istnieje w ścieżce
        var alreadyInPath = currentPath.some(function (point) { return point.row === row && point.col === col; });
        if (alreadyInPath) {
            alert('To pole jest już częścią ścieżki!');
            return;
        }
        // Sprawdź, czy kliknięte pole sąsiaduje z ostatnim polem w ścieżce
        var lastPoint = currentPath[currentPath.length - 1];
        if (!this.isNeighbor(lastPoint.row, lastPoint.col, row, col)) {
            alert('Możesz zaznaczyć tylko sąsiadujące pola!');
            return;
        }
        // Dodaj pole do ścieżki dla wybranego koloru
        currentPath.push({ row: row, col: col });
        this.drawPath(); // Zaktualizuj linię
    };
    GameBoardPlay.prototype.hasNeighborWithColor = function (row, col, color) {
        var _this = this;
        var neighbors = [
            { row: row - 1, col: col }, // Góra
            { row: row + 1, col: col }, // Dół
            { row: row, col: col - 1 }, // Lewo
            { row: row, col: col + 1 } // Prawo
        ];
        return neighbors.some(function (neighbor) {
            return _this.dots.some(function (dot) { return dot.row === neighbor.row && dot.col === neighbor.col && dot.color === color; });
        });
    };
    GameBoardPlay.prototype.isNeighbor = function (row1, col1, row2, col2) {
        var rowDiff = Math.abs(row1 - row2);
        var colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    };
    GameBoardPlay.prototype.savePath = function () {
        console.log('Funkcja savePath została wywołana.');
        if (Object.keys(this.paths).length === 0) {
            alert('Nie zaznaczono żadnych ścieżek!');
            return;
        }
        var boardId = document.getElementById('board-id').value;
        // Logowanie danych
        console.log('Przesyłane dane:', { paths: this.paths });
        console.log('Board ID:', boardId);
        fetch("/game_board/".concat(boardId, "/create-game/"), {
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
            var data = JSON.parse(text); // Spróbuj sparsować odpowiedź jako JSON
            alert('Gra została utworzona!');
            console.log('Utworzono grę:', data);
        })
            .catch(function (error) {
            console.error('Błąd podczas zapisywania ścieżek:', error);
        });
    };
    return GameBoardPlay;
}());
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded został wywołany.');
    var boardIdElement = document.getElementById('board-id');
    console.log('Element board-id:', boardIdElement);
    if (boardIdElement) {
        console.log('Wartość board-id:', boardIdElement.value);
    }
    if (boardIdElement && boardIdElement.value) {
        var boardId = parseInt(boardIdElement.value, 10);
        console.log('Board ID:', boardId);
        if (!isNaN(boardId)) {
            loadGameBoardPlay(boardId);
        }
        else {
            console.error('Board ID jest nieprawidłowy.');
        }
    }
    else {
        console.error('Element board-id nie istnieje lub nie ma wartości.');
    }
});
function loadGameBoardPlay(boardId) {
    fetch("/game_board/".concat(boardId, "/"), {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error('Nie udało się załadować planszy.');
        }
        return response.json();
    })
        .then(function (data) {
        var rows = data.rows, cols = data.cols, dots = data.dots;
        var gameBoardPlay = new GameBoardPlay(rows, cols, dots);
        var colorPicker = document.getElementById('color-picker');
        colorPicker.addEventListener('input', function () {
            gameBoardPlay.selectedColor = colorPicker.value;
        });
        document.getElementById('save-path-btn').addEventListener('click', function () {
            console.log('Przycisk "Zapisz trasę" został kliknięty.');
            gameBoardPlay.savePath();
        });
    })
        .catch(function (error) {
        console.error('Wystąpił błąd podczas ładowania planszy:', error);
    });
}
function getCsrfToken() {
    var cookies = document.cookie.split('; ');
    for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].indexOf('csrftoken=') === 0) {
            return cookies[i].split('=')[1];
        }
    }
    return '';
}
