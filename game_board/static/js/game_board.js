var GameBoard = /** @class */ (function () {
    function GameBoard(rows, cols) {
        this.dots = [];
        this.selectedColor = null;
        this.rows = rows;
        this.cols = cols;
        this.renderGrid();
    }
    GameBoard.prototype.renderGrid = function () {
        var _this = this;
        console.log('Rozpoczęto renderowanie siatki.');
        var container = document.getElementById('grid-container');
        container.innerHTML = ''; // Wyczyść poprzednią zawartość
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
    GameBoard.prototype.handleCellClick = function (row, col, cell) {
        var _this = this;
        if (!this.selectedColor) {
            alert('Wybierz kolor przed dodaniem lub usunięciem kropki!');
            return;
        }
        // Sprawdź, czy komórka ma już przypisany kolor
        var existingDotIndex = -1;
        for (var i = 0; i < this.dots.length; i++) {
            if (this.dots[i].row === row && this.dots[i].col === col) {
                existingDotIndex = i;
                break;
            }
        }
        if (existingDotIndex !== -1) {
            var existingDot = this.dots[existingDotIndex];
            // Jeśli kliknięto komórkę tym samym kolorem, usuń kropkę
            if (existingDot.color === this.selectedColor) {
                cell.style.backgroundColor = '#fff'; // Przywróć domyślny kolor tła
                this.dots.splice(existingDotIndex, 1); // Usuń kropkę z tablicy
                console.log("Usuni\u0119to kropk\u0119: (".concat(row, ", ").concat(col, ") w kolorze ").concat(this.selectedColor));
                return;
            }
        }
        // Sprawdź, czy można dodać kolejną kropkę w wybranym kolorze
        var colorDots = this.dots.filter(function (dot) { return dot.color === _this.selectedColor; });
        if (colorDots.length >= 2) {
            alert('Każdy kolor może mieć tylko dwie kropki!');
            return;
        }
        // Dodaj nową kropkę
        cell.style.backgroundColor = this.selectedColor;
        this.dots.push({ row: row, col: col, color: this.selectedColor });
        console.log("Dodano kropk\u0119: (".concat(row, ", ").concat(col, ") w kolorze ").concat(this.selectedColor));
    };
    return GameBoard;
}());
var gameBoard = null; // Globalna zmienna
// Funkcja do ładowania planszy
function loadGameBoard(boardId) {
    fetch("/game_board/".concat(boardId, "/"), {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest', // Informacja, że to żądanie AJAX
        },
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error('Nie udało się załadować planszy.');
        }
        return response.json();
    })
        .then(function (data) {
        var name = data.name, rows = data.rows, cols = data.cols, dots = data.dots;
        // Ustaw nazwę planszy
        document.getElementById('name').value = name;
        // Wygeneruj siatkę
        gameBoard = new GameBoard(rows, cols);
        // Wypełnij siatkę kropkami
        dots.forEach(function (dot) {
            var cell = document.querySelector(".grid-cell[data-row=\"".concat(dot.row, "\"][data-col=\"").concat(dot.col, "\"]"));
            if (cell) {
                cell.style.backgroundColor = dot.color;
                gameBoard.dots.push(dot); // Użyj `gameBoard!` ponieważ jest globalna
            }
        });
    })
        .catch(function (error) {
        console.error('Wystąpił błąd podczas ładowania planszy:', error);
        alert('Nie udało się załadować planszy.');
    });
}
document.addEventListener('DOMContentLoaded', function () {
    var colorPicker = document.getElementById('color-picker');
    colorPicker.addEventListener('input', function () {
        if (gameBoard) {
            gameBoard.selectedColor = colorPicker.value;
            console.log("Wybrano kolor: ".concat(gameBoard.selectedColor));
        }
    });
    document.getElementById('generate-grid-btn').addEventListener('click', function () {
        var rows = parseInt(document.getElementById('rows').value, 10);
        var cols = parseInt(document.getElementById('cols').value, 10);
        if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
            alert('Podaj poprawne wartości dla liczby wierszy i kolumn.');
            return;
        }
        gameBoard = new GameBoard(rows, cols);
        gameBoard.selectedColor = colorPicker.value;
    });
    document.getElementById('save-board-btn').addEventListener('click', function () {
        if (!gameBoard) {
            alert('Najpierw wygeneruj siatkę!');
            return;
        }
        var boardId = document.getElementById('board-id').value;
        var name = document.getElementById('name').value;
        var rows = gameBoard.rows;
        var cols = gameBoard.cols;
        var dots = gameBoard.dots;
        if (!name) {
            alert('Podaj nazwę planszy!');
            return;
        }
        // Walidacja: Sprawdź, czy każdy kolor ma dokładnie 2 kropki
        var colorCounts = {};
        dots.forEach(function (dot) {
            colorCounts[dot.color] = (colorCounts[dot.color] || 0) + 1;
        });
        for (var color in colorCounts) {
            if (colorCounts[color] !== 2) {
                alert("Kolor ".concat(color, " musi mie\u0107 dok\u0142adnie 2 kropki!"));
                return;
            }
        }
        var url = boardId
            ? "/game_board/".concat(boardId, "/update/") // URL do aktualizacji planszy
            : '/game_board/save/'; // URL do tworzenia nowej planszy
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
            body: JSON.stringify({
                name: name,
                rows: rows,
                cols: cols,
                dots: dots,
            }),
        })
            .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            else {
                return response.json().then(function (errorData) {
                    throw new Error(errorData.error);
                });
            }
        })
            .then(function (data) {
            alert(boardId ? 'Plansza została zaktualizowana!' : 'Plansza została zapisana!');
            console.log('ID planszy:', data.id);
        })
            .catch(function (error) {
            console.error('Wystąpił błąd:', error);
            alert('Wystąpił błąd podczas zapisywania planszy.');
        });
    });
    // Wywołanie funkcji `loadGameBoard` dla edycji planszy
    var boardIdElement = document.getElementById('board-id');
    if (boardIdElement && boardIdElement.value) {
        var boardId = parseInt(boardIdElement.value, 10);
        if (!isNaN(boardId)) {
            loadGameBoard(boardId);
        }
    }
});
function getCsrfToken() {
    var cookies = document.cookie.split('; ');
    for (var i = 0; i < cookies.length; i++) {
        if (cookies[i].indexOf('csrftoken=') === 0) {
            return cookies[i].split('=')[1];
        }
    }
    return '';
}
