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
                cell.addEventListener('click', () => this.toggleCell(i, j));
                gridElement.appendChild(cell);
            }
        }

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
        const width = document.getElementById('width').value;
        const height = document.getElementById('height').value;
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
        this.populationData.push(this.population);
        this.chart.data.labels.push(this.generation);
        this.chart.data.datasets[0].data = this.populationData;
        this.chart.update('none'); // Use 'none' mode for performance
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