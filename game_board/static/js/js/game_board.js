"use strict";
class GameBoard {
    constructor(rows, cols) {
        this.dots = [];
        this.selectedColor = null;
        this.rows = rows;
        this.cols = cols;
        this.renderGrid();
    }
    renderGrid() {
        console.log('Rozpoczęto renderowanie siatki.');
        const container = document.getElementById('grid-container');
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
    handleCellClick(row, col, cell) {
        if (!this.selectedColor) {
            alert('Wybierz kolor przed dodaniem kropki!');
            return;
        }
        // Sprawdź, czy komórka jest już zajęta
        const existingDot = this.dots.find(dot => dot.row === row && dot.col === col);
        if (existingDot) {
            alert('Ta komórka jest już zajęta!');
            return;
        }
        // Sprawdź, czy dla wybranego koloru są już dwie kropki
        const colorDots = this.dots.filter(dot => dot.color === this.selectedColor);
        if (colorDots.length >= 2) {
            alert('Każdy kolor może mieć tylko dwie kropki!');
            return;
        }
        // Dodaj kropkę
        cell.style.backgroundColor = this.selectedColor;
        this.dots.push({ row, col, color: this.selectedColor });
        console.log(`Dodano kropkę: (${row}, ${col}) w kolorze ${this.selectedColor}`);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    let gameBoard = null;
    // Obsługa wyboru koloru
    const colorPicker = document.getElementById('color-picker');
    colorPicker.addEventListener('input', () => {
        if (gameBoard) {
            gameBoard.selectedColor = colorPicker.value;
            console.log(`Wybrano kolor: ${gameBoard.selectedColor}`);
        }
    });
    document.getElementById('generate-grid-btn').addEventListener('click', () => {
        console.log('Kliknięto przycisk "Generuj siatkę".');
        const rows = parseInt(document.getElementById('rows').value, 10);
        const cols = parseInt(document.getElementById('cols').value, 10);
        if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) {
            console.error('Nieprawidłowe wartości wierszy lub kolumn.');
            alert('Podaj poprawne wartości dla liczby wierszy i kolumn.');
            return;
        }
        console.log(`Generowanie siatki o wymiarach ${rows} x ${cols}.`);
        gameBoard = new GameBoard(rows, cols);
        gameBoard.selectedColor = colorPicker.value; // Ustaw początkowy kolor
    });
});
