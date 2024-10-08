class GameOfLife {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = Array(height).fill().map(() => Array(width).fill(false));
        this.nextGrid = Array(height).fill().map(() => Array(width).fill(false));
        this.isRunning = false;
        this.intervalId = null;
        this.speed = 200;
        this.isDrawing = false;
        this.generation = 0;
        this.population = 0;
        this.populationData = [];
        this.drawState = null;

        this.initializeGrid();
        this.addEventListeners();
        this.initializeChart();
    }

    initializeGrid() {
        console.log(`initializeGrid called with dimensions: ${this.width}x${this.height}`);
        const gridElement = document.getElementById('grid');
        gridElement.style.gridTemplateColumns = `repeat(${this.width}, 15px)`;
        gridElement.style.gridTemplateRows = `repeat(${this.height}, 15px)`;
        gridElement.innerHTML = '';

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('mousedown', (e) => {
                    e.preventDefault(); // Prevent text selection
                    this.toggleCell(i, j);
                });
                gridElement.appendChild(cell);
            }
        }

        gridElement.addEventListener('mousedown', (e) => this.startDrawing(e));
        gridElement.addEventListener('mousemove', (e) => this.draw(e));
        gridElement.addEventListener('mouseup', () => this.stopDrawing());
        gridElement.addEventListener('mouseleave', () => this.stopDrawing());

        // Update input fields to reflect current size
        document.getElementById('width').value = this.width;
        document.getElementById('height').value = this.height;
        console.log(`Grid initialized with ${this.width * this.height} cells`);
    }

    addEventListeners() {
        document.getElementById('startStop').addEventListener('click', () => this.toggleStartStop());
        document.getElementById('clear').addEventListener('click', () => this.clear());
        document.getElementById('random').addEventListener('click', () => this.randomize());
        document.getElementById('speed').addEventListener('input', (e) => this.setSpeed(e.target.value));
        document.getElementById('width').addEventListener('change', () => this.updateSize());
        document.getElementById('height').addEventListener('change', () => this.updateSize());
        const gridElement = document.getElementById('grid');
        gridElement.addEventListener('mousedown', (e) => this.startDrawing(e));
        gridElement.addEventListener('mousemove', (e) => this.draw(e));
        gridElement.addEventListener('mouseup', () => this.stopDrawing());
        gridElement.addEventListener('mouseleave', () => this.stopDrawing());
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const pattern = e.target.dataset.pattern;
                this.drawPattern(pattern);
            });
        });
    }

    toggleCell(row, col) {
        console.log(`Cell clicked: row ${row}, col ${col}`);
        this.grid[row][col] = !this.grid[row][col];
        this.updateCell(row, col);
        this.updatePopulation();
    }

    updateCell(row, col) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            if (this.grid[row][col]) {
                cell.classList.add('alive');
            } else {
                cell.classList.remove('alive');
            }
            console.log(`Cell updated: row ${row}, col ${col}, alive: ${this.grid[row][col]}`);
        } else {
            console.error(`Cell not found: row ${row}, col ${col}`);
        }
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
        document.getElementById('startStop').textContent = 'Start';
    }

    clear() {
        this.stop();
        this.grid = Array(this.height).fill().map(() => Array(this.width).fill(false));
        this.updateAllCells();
        this.generation = 0;
        this.populationData = [];
        this.updateGeneration();
        this.updatePopulation();
        this.chart.data.labels = [];
        this.chart.data.datasets[0].data = [];
        this.chart.update();
    }

    randomize() {
        this.stop();
        this.grid = Array(this.height).fill().map(() => Array(this.width).fill().map(() => Math.random() < 0.3));
        this.updateAllCells();
        this.generation = 0;
        this.updateGeneration();
        this.updatePopulation();
    }

    setSpeed(value) {
        this.speed = 1000 / value;
        if (this.isRunning) {
            clearInterval(this.intervalId);
            this.run();
        }
    }

    setSize(width, height) {
        console.log(`setSize called with width: ${width}, height: ${height}`);
        const wasRunning = this.isRunning;
        if (wasRunning) {
            this.stop();
        }
        const oldWidth = this.width;
        const oldHeight = this.height;
        this.width = parseInt(width);
        this.height = parseInt(height);
        console.log(`New dimensions: ${this.width}x${this.height}`);

        const newGrid = Array(this.height).fill().map(() => Array(this.width).fill(false));
        const newNextGrid = Array(this.height).fill().map(() => Array(this.width).fill(false));

        // Copy the existing state to the new grid
        for (let i = 0; i < Math.min(oldHeight, this.height); i++) {
            for (let j = 0; j < Math.min(oldWidth, this.width); j++) {
                newGrid[i][j] = this.grid[i][j];
            }
        }

        this.grid = newGrid;
        this.nextGrid = newNextGrid;
        this.initializeGrid();
        this.updatePopulation();
        this.updateAllCells();

        if (wasRunning) {
            this.start();
        }
        console.log('setSize completed');
    }

    updateSize() {
        let width = parseInt(document.getElementById('width').value);
        let height = parseInt(document.getElementById('height').value);

        const widthPopup = document.getElementById('widthPopup');
        const heightPopup = document.getElementById('heightPopup');

        const showPopup = (popup, message) => {
            popup.textContent = message;
            popup.style.display = 'block';
            popup.style.opacity = '1';
            setTimeout(() => {
                popup.style.opacity = '0';
                setTimeout(() => {
                    popup.style.display = 'none';
                }, 300);
            }, 3000);
        };

        if (width < 5) {
            width = 5;
            showPopup(widthPopup, 'Minimum width is 5');
        } else if (width > 70) {
            width = 70;
            showPopup(widthPopup, 'Maximum width is 70');
        }

        if (height < 5) {
            height = 5;
            showPopup(heightPopup, 'Minimum height is 5');
        } else if (height > 50) {
            height = 50;
            showPopup(heightPopup, 'Maximum height is 50');
        }

        document.getElementById('width').value = width;
        document.getElementById('height').value = height;

        console.log(`updateSize called with width: ${width}, height: ${height}`);
        this.setSize(width, height);
        this.updatePopulation();
        this.updateGeneration();
    }

    updateAllCells() {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
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
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
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
        this.updateGeneration();
        this.updatePopulation();
        this.updateChart();
    }

    countNeighbors(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const newRow = (row + i + this.height) % this.height;
                const newCol = (col + j + this.width) % this.width;
                if (this.grid[newRow][newCol]) count++;
            }
        }
        return count;
    }

    startDrawing(e) {
        this.isDrawing = true;
        document.getElementById('grid').classList.add('drawing');
        if (e.target.classList.contains('cell')) {
            const row = parseInt(e.target.dataset.row);
            const col = parseInt(e.target.dataset.col);
            this.drawState = !this.grid[row][col];
            this.toggleCell(row, col);
        }
    }

    draw(e) {
        if (!this.isDrawing || !e || !e.target) return;
        const cell = e.target;
        if (cell.classList.contains('cell')) {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if (this.grid[row][col] !== this.drawState) {
                this.toggleCell(row, col);
            }
        }
    }

    stopDrawing() {
        this.isDrawing = false;
        document.getElementById('grid').classList.remove('drawing');
    }

    toggleStartStop() {
        if (this.isRunning) {
            this.stop();
            document.getElementById('startStop').textContent = 'Start';
        } else {
            this.start();
            document.getElementById('startStop').textContent = 'Stop';
        }
    }

    updateGeneration() {
        this.generation++;
        document.getElementById('generation').textContent = this.generation;
    }

    updatePopulation() {
        this.population = this.grid.flat().filter(cell => cell).length;
        document.getElementById('population').textContent = this.population;
        this.updateChart();
    }

    initializeChart() {
        const ctx = document.getElementById('populationGraph').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Population',
                    data: [],
                    borderColor: '#ffffff',
                    tension: 0.1,
                    pointRadius: 0 // Hide points for better performance
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false, // Disable animations for better performance
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: true,
                            text: 'Generation'
                        },
                        ticks: {
                            maxTicksLimit: 10 // Limit the number of x-axis ticks
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Population'
                        },
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Hide legend for cleaner look
                    }
                }
            }
        });
    }

    updateChart() {
        if (this.isRunning) {
            this.populationData.push(this.population);
            this.chart.data.labels.push(this.generation);
            this.chart.data.datasets[0].data = this.populationData;
            this.chart.update('none'); // Use 'none' mode for performance
        }
    }

    drawPattern(pattern) {
        this.clear();
        const centerX = Math.floor(this.width / 2);
        const centerY = Math.floor(this.height / 2);

        switch (pattern) {
            case 'glider':
                this.drawGlider(centerX, centerY);
                break;
            case 'lwss':
                this.drawLWSS(centerX, centerY);
                break;
            case 'pulsar':
                this.drawPulsar(centerX, centerY);
                break;
            case 'gosperGliderGun':
                this.drawGosperGliderGun(1, 1);
                break;
        }

        this.updateAllCells();
        this.updatePopulation();
    }

    drawGlider(x, y) {
        const glider = [[0, 1, 0], [0, 0, 1], [1, 1, 1]];
        this.drawShape(x, y, glider);
    }

    drawLWSS(x, y) {
        const lwss = [[0, 1, 1, 1, 1], [1, 0, 0, 0, 1], [0, 0, 0, 0, 1], [1, 0, 0, 1, 0]];
        this.drawShape(x, y, lwss);
    }

    drawPulsar(x, y) {
        const pulsar = [
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
        ];
        this.drawShape(x - 6, y - 6, pulsar);
    }

    drawGosperGliderGun(x, y) {
        const gun = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];
        this.drawShape(x, y, gun);
    }

    drawShape(x, y, shape) {
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j] === 1) {
                    const newX = (x + j + this.width) % this.width;
                    const newY = (y + i + this.height) % this.height;
                    this.grid[newY][newX] = true;
                }
            }
        }
    }
}

const game = new GameOfLife(30, 30);

// Add this to the end of the file
function makeWindowsDraggable() {
    // Remove the draggable functionality
}

// Keep the function call
makeWindowsDraggable();

function updateRangeProgress() {
    const rangeInput = document.getElementById('speed');
    const progress = (rangeInput.value - rangeInput.min) / (rangeInput.max - rangeInput.min) * 100;
    rangeInput.style.setProperty('--range-progress', `${progress}%`);
}

document.getElementById('speed').addEventListener('input', updateRangeProgress);
updateRangeProgress(); // Initial call to set the progress on page load