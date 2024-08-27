class GameOfLife {
    constructor(size) {
        this.size = size;
        this.grid = Array(size).fill().map(() => Array(size).fill(false));
        this.nextGrid = Array(size).fill().map(() => Array(size).fill(false));
        this.isRunning = false;
        this.intervalId = null;
        this.speed = 200;
        this.isDrawing = false;

        this.initializeGrid();
        this.addEventListeners();
    }

    initializeGrid() {
        const gridElement = document.getElementById('grid');
        gridElement.style.gridTemplateColumns = `repeat(${this.size}, auto)`;
        gridElement.innerHTML = '';

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', () => this.toggleCell(i, j));
                gridElement.appendChild(cell);
            }
        }
    }

    addEventListeners() {
        document.getElementById('start').addEventListener('click', () => this.start());
        document.getElementById('stop').addEventListener('click', () => this.stop());
        document.getElementById('clear').addEventListener('click', () => this.clear());
        document.getElementById('random').addEventListener('click', () => this.randomize());
        document.getElementById('speed').addEventListener('input', (e) => this.setSpeed(e.target.value));
        document.getElementById('size').addEventListener('change', (e) => this.setSize(e.target.value));
        const gridElement = document.getElementById('grid');
        gridElement.addEventListener('mousedown', (e) => this.startDrawing(e));
        gridElement.addEventListener('mousemove', (e) => this.draw(e));
        gridElement.addEventListener('mouseup', () => this.stopDrawing());
        gridElement.addEventListener('mouseleave', () => this.stopDrawing());
    }

    toggleCell(row, col) {
        this.grid[row][col] = !this.grid[row][col];
        this.updateCell(row, col);
    }

    updateCell(row, col) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        cell.classList.toggle('alive', this.grid[row][col]);
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.run();
        }
    }

    stop() {
        this.isRunning = false;
        clearInterval(this.intervalId);
    }

    clear() {
        this.stop();
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(false));
        this.updateAllCells();
    }

    randomize() {
        this.stop();
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill().map(() => Math.random() < 0.3));
        this.updateAllCells();
    }

    setSpeed(value) {
        this.speed = 1000 / value;
        if (this.isRunning) {
            this.stop();
            this.start();
        }
    }

    setSize(size) {
        this.size = parseInt(size);
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(false));
        this.nextGrid = Array(this.size).fill().map(() => Array(this.size).fill(false));
        this.initializeGrid();
    }

    updateAllCells() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                this.updateCell(i, j);
            }
        }
    }

    run() {
        this.intervalId = setInterval(() => {
            this.step();
        }, this.speed);
    }

    step() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const neighbors = this.countNeighbors(i, j);
                if (this.grid[i][j]) {
                    this.nextGrid[i][j] = neighbors === 2 || neighbors === 3;
                } else {
                    this.nextGrid[i][j] = neighbors === 3;
                }
            }
        }

        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
        this.updateAllCells();
    }

    countNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = (row + i + this.size) % this.size;
                const newCol = (col + j + this.size) % this.size;
                if (this.grid[newRow][newCol]) count++;
            }
        }
        return count;
    }

    startDrawing(e) {
        this.isDrawing = true;
        document.getElementById('grid').classList.add('drawing');
        this.draw(e);
    }

    draw(e) {
        if (!this.isDrawing) return;
        const cell = e.target;
        if (cell.classList.contains('cell')) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            this.grid[row][col] = true;
            this.updateCell(row, col);
        }
    }

    stopDrawing() {
        this.isDrawing = false;
        document.getElementById('grid').classList.remove('drawing');
    }
}

const game = new GameOfLife(20);
