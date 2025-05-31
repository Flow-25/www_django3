"use strict";
var GameBoardContinue = /** @class */ (function () {
    function GameBoardContinue(rows, cols, dots, paths) {
        this.selectedColor = null;
        this.rows = rows;
        this.cols = cols;
        this.dots = dots;
        this.paths = paths;
        this.renderGrid();
        this.drawPaths();
        this.setupEventListeners();
    }
    GameBoardContinue.prototype.renderGrid = function () {
        var _this = this;
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
        container.style.gridTemplateRows = "repeat(".concat(this.rows, ", 1fr)");
        container.style.gridTemplateColumns = "repeat(".concat(this.cols, ", 1fr)");
        console.log('Rozpoczęto renderowanie siatki.');
        var _loop_1 = function (row) {
            var _loop_2 = function (col) {
                var cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = row.toString();
                cell.dataset.col = col.toString();
                cell.style.border = '1px solid #ccc';
                var dot = undefined;
                for (var i = 0; i < this_1.dots.length; i++) {
                    if (this_1.dots[i].row === row && this_1.dots[i].col === col) {
                        dot = this_1.dots[i];
                        break;
                    }
                }
                if (dot) {
                    cell.style.backgroundColor = dot.color;
                    cell.classList.add('dot', 'start-dot');
                    console.log("Dodano kropk\u0119: row=".concat(row, ", col=").concat(col, ", color=").concat(dot.color));
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
        console.log('Siatka została wygenerowana.');
    };
    GameBoardContinue.prototype.drawPaths = function () {
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
    GameBoardContinue.prototype.handleCellClick = function (row, col, cell) {
        var _this = this;
        if (!this.selectedColor) {
            alert('Wybierz kolor przed rozpoczęciem rysowania trasy!');
            return;
        }
        if (!this.paths[this.selectedColor]) {
            this.paths[this.selectedColor] = [];
        }
        var currentPath = this.paths[this.selectedColor];
        // **Blokowanie rysowania, jeśli głowa ścieżki jest w punkcie końcowym i ścieżka ma długość >= 2**
        if (currentPath.length > 0) {
            var lastPoint = currentPath[currentPath.length - 1];
            if (this.isEndDot(lastPoint.row, lastPoint.col) && currentPath.length >= 2) {
                alert('Ścieżka skończona!');
                return;
            }
        }
        var isStartDot = this.dots.some(function (dot) { return dot.row === row && dot.col === col && dot.color === _this.selectedColor; });
        if (cell.classList.contains('dot') && !isStartDot) {
            alert('Nie możesz rozpocząć ścieżki na polu innego koloru!');
            return;
        }
        // **Usuwanie głowy ścieżki po ponownym kliknięciu**
        if (currentPath.length > 0) {
            var lastPoint = currentPath[currentPath.length - 1];
            if (lastPoint.row === row && lastPoint.col === col) {
                currentPath.pop(); // Usuń głowę
                this.drawPaths(); // Przerysuj ścieżki
                return;
            }
        }
        // Zapobieganie przecinaniu się ścieżek
        var alreadyInPath = false;
        for (var color in this.paths) {
            var path = this.paths[color];
            if (path.some(function (point) { return point.row === row && point.col === col; })) {
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
            var lastPoint = currentPath[currentPath.length - 1];
            if (!this.isNeighbor(lastPoint.row, lastPoint.col, row, col)) {
                alert('Możesz zaznaczyć tylko sąsiadujące pola!');
                return;
            }
        }
        // Dodaj pole do ścieżki
        currentPath.push({ row: row, col: col });
        this.drawPaths();
    };
    GameBoardContinue.prototype.isEndDot = function (row, col) {
        var _this = this;
        // Sprawdź, czy pole jest jednym z dwóch pól końcowych
        return this.dots.some(function (dot) { return dot.row === row && dot.col === col && dot.color === _this.selectedColor; });
    };
    GameBoardContinue.prototype.isNeighbor = function (row1, col1, row2, col2) {
        var rowDiff = Math.abs(row1 - row2);
        var colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    };
    GameBoardContinue.prototype.setupEventListeners = function () {
        var _this = this;
        var colorPicker = document.getElementById('color-picker');
        var savePathBtn = document.getElementById('overwrite-game-btn');
        colorPicker.addEventListener('input', function () {
            _this.selectedColor = colorPicker.value;
            console.log("Wybrano kolor: ".concat(_this.selectedColor));
        });
        savePathBtn.addEventListener('click', function () {
            _this.savePaths();
        });
    };
    GameBoardContinue.prototype.savePaths = function () {
        var gameIdElement = document.getElementById('game-id');
        var gameId = parseInt(gameIdElement.value, 10);
        if (!gameId || Object.keys(this.paths).length === 0) {
            alert('Nie można zapisać gry: brak ID gry lub ścieżek!');
            return;
        }
        fetch("/game_board/".concat(gameId, "/save-path/"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': this.getCsrfToken(), // Dodaj token CSRF
            },
            body: JSON.stringify({ paths: this.paths }),
        })
            .then(function (response) {
            if (!response.ok) {
                throw new Error('Nie udało się zapisać ścieżek.');
            }
            return response.json();
        })
            .then(function (data) {
            console.log('Ścieżki zapisane:', data);
            alert('Ścieżki zostały zapisane!');
        })
            .catch(function (error) {
            console.error('Wystąpił błąd podczas zapisywania ścieżek:', error);
            alert('Wystąpił błąd podczas zapisywania ścieżek.');
        });
    };
    // Funkcja pomocnicza do pobierania tokena CSRF
    GameBoardContinue.prototype.getCsrfToken = function () {
        var cookies = document.cookie.split('; ');
        for (var i = 0; i < cookies.length; i++) {
            if (cookies[i].indexOf('csrftoken=') === 0) {
                return cookies[i].split('=')[1];
            }
        }
        return '';
    };
    GameBoardContinue.prototype.overwriteGame = function () {
        var gameIdElement = document.getElementById('game-id');
        var gameId = parseInt(gameIdElement.value, 10);
        if (!gameId || Object.keys(this.paths).length === 0) {
            alert('Nie można nadpisać gry: brak ID gry lub ścieżek!');
            return;
        }
        fetch("/game_board/".concat(gameId, "/overwrite/"), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': this.getCsrfToken(),
            },
            body: JSON.stringify({ paths: this.paths }),
        })
            .then(function (response) {
            if (!response.ok) {
                throw new Error('Nie udało się nadpisać gry.');
            }
            return response.json();
        })
            .then(function (data) {
            console.log('Gra nadpisana:', data);
            alert('Gra została nadpisana!');
        })
            .catch(function (error) {
            console.error('Wystąpił błąd podczas nadpisywania gry:', error);
            alert('Wystąpił błąd podczas nadpisywania gry.');
        });
    };
    return GameBoardContinue;
}());
var gameBoardContinue; // Zmienna globalna
function loadGameBoardContinue(gameId) {
    fetch("/game_board/continue/".concat(gameId, "/"), {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
        },
    })
        .then(function (response) { return response.json(); })
        .then(function (data) {
        console.log('Dane gry:', data);
        var rows = data.rows, cols = data.cols, dots = data.dots, paths = data.paths;
        gameBoardContinue = new GameBoardContinue(rows, cols, dots, paths); // Przypisz do zmiennej globalnej
    })
        .catch(function (error) {
        console.error('Wystąpił błąd:', error);
    });
}
document.addEventListener('DOMContentLoaded', function () {
    var gameIdElement = document.getElementById('game-id');
    if (gameIdElement && gameIdElement.value) {
        var gameId = parseInt(gameIdElement.value, 10);
        if (!isNaN(gameId)) {
            loadGameBoardContinue(gameId);
        }
    }
    else {
        console.error('Element game-id nie został znaleziony.');
    }
});
