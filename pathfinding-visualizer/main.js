// Remove the interface declaration and type annotations
let GRID_COLS, GRID_ROWS;
let grid = [];
let startCell = null;
let endCell = null;

// Add these variables at the top of the file
let isDragging = false;
let draggedNode = null;
let isPathFound = false;
let currentAlgorithm = null;

let isMouseDown = false;
let isErasing = false;

function calculateGridSize() {
    const gridElement = document.getElementById('grid');
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight * 0.9; // 90% of viewport height
    
    const cellSize = 30; // Fixed cell size
    
    GRID_COLS = Math.floor(availableWidth / cellSize);
    GRID_ROWS = Math.floor(availableHeight / cellSize);
    
    gridElement.style.width = `${GRID_COLS * cellSize}px`;
    gridElement.style.height = `${GRID_ROWS * cellSize}px`;
    
    // Remove these lines
    // gridElement.style.gridTemplateColumns = `repeat(${GRID_COLS}, ${cellSize}px)`;
    // gridElement.style.gridTemplateRows = `repeat(${GRID_ROWS}, ${cellSize}px)`;
}

function initializeGrid() {
    console.log("Initializing grid");
    calculateGridSize();
    grid = [];
    for (let row = 0; row < GRID_ROWS; row++) {
        const currentRow = [];
        for (let col = 0; col < GRID_COLS; col++) {
            currentRow.push({
                row,
                col,
                isStart: false,
                isEnd: false,
                isWall: false,
                distance: Infinity,
                previousCell: null,
                f: 0,
                g: 0,
                h: 0,
                isVisited: false
            });
        }
        grid.push(currentRow);
    }

    const middleRow = Math.floor(GRID_ROWS / 2);
    const middleCol = Math.floor(GRID_COLS / 2);
    const startCol = middleCol - 8;
    const endCol = middleCol + 8;

    startCell = grid[middleRow][startCol];
    startCell.isStart = true;
    endCell = grid[middleRow][endCol];
    endCell.isEnd = true;

    renderGrid();
}

function renderGrid() {
    console.log("Rendering grid");
    const gridElement = document.getElementById('grid');
    gridElement.innerHTML = '';

    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = grid[row][col];
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.dataset.row = row;
            cellElement.dataset.col = col;
            if (cell.isStart) cellElement.classList.add('start');
            if (cell.isEnd) cellElement.classList.add('end');
            if (cell.isWall) cellElement.classList.add('wall');
            
            gridElement.appendChild(cellElement);

            cellElement.addEventListener('mousedown', (e) => handleMouseDown(e, row, col));
            cellElement.addEventListener('mouseenter', (e) => handleMouseEnter(e, row, col));
            cellElement.addEventListener('mouseup', handleMouseUp);
        }
    }
    document.addEventListener('mouseup', handleMouseUp);
}

function handleMouseDown(e, row, col) {
    isMouseDown = true;
    const cell = grid[row][col];
    if (cell.isStart || cell.isEnd) {
        isDragging = true;
        draggedNode = cell.isStart ? 'start' : 'end';
    } else {
        isErasing = cell.isWall;
        toggleWall(row, col);
    }
    e.preventDefault(); // Prevent text selection while dragging
}

function handleMouseEnter(e, row, col) {
    if (isDragging) {
        const cell = grid[row][col];
        if (cell.isWall) return;

        if (draggedNode === 'start') {
            startCell.isStart = false;
            cell.isStart = true;
            startCell = cell;
        } else if (draggedNode === 'end') {
            endCell.isEnd = false;
            cell.isEnd = true;
            endCell = cell;
        }

        if (isPathFound) {
            recalculatePath();
        } else {
            renderGrid();
        }
    } else if (isMouseDown) {
        const cell = grid[row][col];
        if (cell.isStart || cell.isEnd) return;
        cell.isWall = !isErasing;
        if (isPathFound) {
            recalculatePath();
        } else {
            renderGrid();
        }
    }
}

function handleMouseUp() {
    isMouseDown = false;
    isDragging = false;
    draggedNode = null;
    isErasing = false;
}

function toggleWall(row, col) {
    const cell = grid[row][col];
    if (!cell.isStart && !cell.isEnd) {
        cell.isWall = !cell.isWall;
        renderGrid();
    }
}

// Replace the existing dijkstra function with this optimized version
async function dijkstra(instant = false) {
    currentAlgorithm = 'dijkstra';
    if (!startCell || !endCell) return;

    const unvisitedNodes = new Set(getAllNodes());
    const visitedNodesInOrder = [];
    startCell.distance = 0;

    while (unvisitedNodes.size) {
        const closestNode = getClosestNode(unvisitedNodes);
        if (!closestNode) break;

        if (closestNode.isWall) continue;
        if (closestNode.distance === Infinity) return;

        closestNode.isVisited = true;
        unvisitedNodes.delete(closestNode);
        visitedNodesInOrder.push(closestNode);

        if (closestNode === endCell) {
            if (!instant) {
                await visualizeBatch(visitedNodesInOrder);
                await visualizePath(instant);
            }
            isPathFound = true;
            return endCell;
        }

        updateUnvisitedNeighbors(closestNode);
    }

    if (!instant) {
        await visualizeBatch(visitedNodesInOrder);
    }
    return null;
}

// Add this new function for batch visualization
async function visualizeBatch(nodes, batchSize = 5) {  // Reduced batch size from 10 to 5
    for (let i = 0; i < nodes.length; i += batchSize) {
        const batch = nodes.slice(i, i + batchSize);
        batch.forEach(node => {
            const cellElement = document.querySelector(`.cell[data-row="${node.row}"][data-col="${node.col}"]`);
            cellElement.classList.add('visited');
        });
        await sleep(5);  // Increased sleep time from 1ms to 5ms
    }
}

// Add this new function to replace sortNodesByDistance
function getClosestNode(nodes) {
    let closestNode = null;
    let shortestDistance = Infinity;
    for (const node of nodes) {
        if (node.distance < shortestDistance) {
            closestNode = node;
            shortestDistance = node.distance;
        }
    }
    return closestNode;
}

// Add this new function for A* visualization
async function visualizeBatchAStar(nodes, batchSize = 3) {  // Reduced batch size from 5 to 3
    for (let i = 0; i < nodes.length; i += batchSize) {
        const batch = nodes.slice(i, i + batchSize);
        batch.forEach(node => {
            const cellElement = document.querySelector(`.cell[data-row="${node.row}"][data-col="${node.col}"]`);
            cellElement.classList.add('visited');
        });
        await sleep(8);  // Increased sleep time from 5ms to 8ms
    }
}

// Update the aStar function to use the new visualizeBatchAStar
async function aStar(instant = false) {
    currentAlgorithm = 'astar';
    if (!startCell || !endCell) return;

    const openSet = new Set([startCell]);
    const closedSet = new Set();
    const visitedNodesInOrder = [];

    startCell.g = 0;
    startCell.f = heuristic(startCell, endCell);

    while (openSet.size > 0) {
        const current = getLowestFScoreNode(openSet);

        if (current === endCell) {
            if (!instant) {
                await visualizeBatchAStar(visitedNodesInOrder);  // Changed to visualizeBatchAStar
                await visualizePath(instant);
            }
            isPathFound = true;
            return endCell;
        }

        openSet.delete(current);
        closedSet.add(current);
        current.isVisited = true;
        visitedNodesInOrder.push(current);

        const neighbors = getNeighbors(current);
        for (const neighbor of neighbors) {
            if (closedSet.has(neighbor) || neighbor.isWall) continue;

            const tentativeG = current.g + 1;

            if (!openSet.has(neighbor)) {
                openSet.add(neighbor);
            } else if (tentativeG >= neighbor.g) {
                continue;
            }

            neighbor.previousCell = current;
            neighbor.g = tentativeG;
            neighbor.h = heuristic(neighbor, endCell);
            neighbor.f = neighbor.g + neighbor.h;
        }
    }

    if (!instant) {
        await visualizeBatchAStar(visitedNodesInOrder);  // Changed to visualizeBatchAStar
    }
    return null;
}

function getLowestFScoreNode(nodes) {
    return Array.from(nodes).reduce((lowest, node) => 
        (node.f < lowest.f ? node : lowest)
    );
}

// Update heuristic function to use Manhattan distance
function heuristic(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function getAllNodes() {
    return grid.flat();
}

function updateUnvisitedNeighbors(node) {
    const neighbors = getNeighbors(node);
    for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !neighbor.isWall) {
            const tentativeDistance = node.distance + 1;
            if (tentativeDistance < neighbor.distance) {
                neighbor.distance = tentativeDistance;
                neighbor.previousCell = node;
            }
        }
    }
}

function getNeighbors(cell) {
    const neighbors = [];
    const { row, col } = cell;

    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < GRID_ROWS - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < GRID_COLS - 1) neighbors.push(grid[row][col + 1]);

    return neighbors;
}

// Update the sleep function to use requestAnimationFrame for smoother animations
function sleep(ms) {
    return new Promise(resolve => {
        if (ms === 0) {
            requestAnimationFrame(resolve);
        } else {
            setTimeout(resolve, ms);
        }
    });
}

// Update the visualizePath function
async function visualizePath(instant = false) {
    let current = endCell;
    const pathNodes = [];
    while (current !== null) {
        pathNodes.push(current);
        current = current.previousCell;
    }
    
    if (instant) {
        pathNodes.forEach(node => {
            const cellElement = document.querySelector(`.cell[data-row="${node.row}"][data-col="${node.col}"]`);
            cellElement.classList.add('path');
        });
    } else {
        for (let i = pathNodes.length - 1; i >= 0; i--) {
            const node = pathNodes[i];
            const cellElement = document.querySelector(`.cell[data-row="${node.row}"][data-col="${node.col}"]`);
            cellElement.classList.add('path');
            await sleep(30);  // Increased from 20ms to 30ms
        }
    }
}

// Update the event listeners to clear the previous visualization
document.getElementById('dijkstra').addEventListener('click', async () => {
    clearVisualization();
    await dijkstra();
});

document.getElementById('astar').addEventListener('click', async () => {
    clearVisualization();
    await aStar();
});

// Add this new function to clear the previous visualization
function clearVisualization(fullClear = true) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('visited', 'path');
    });
    
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = grid[row][col];
            cell.isVisited = false;
            cell.distance = Infinity;
            cell.previousCell = null;
            cell.f = 0;
            cell.g = 0;
            cell.h = 0;
        }
    }
    
    startCell.distance = 0;
    if (fullClear) {
        isPathFound = false;
        currentAlgorithm = null;
    }
    renderGrid();
}

// Add this function to reset the grid
function resetGrid() {
    clearVisualization();
    initializeGrid();
}

// Add this event listener for the reset button
document.getElementById('reset').addEventListener('click', resetGrid);

// Update the initializeGrid function to ensure it fully resets the grid
function initializeGrid() {
    console.log("Initializing grid");
    calculateGridSize();
    grid = [];
    for (let row = 0; row < GRID_ROWS; row++) {
        const currentRow = [];
        for (let col = 0; col < GRID_COLS; col++) {
            currentRow.push({
                row,
                col,
                isStart: false,
                isEnd: false,
                isWall: false,
                distance: Infinity,
                previousCell: null,
                f: 0,
                g: 0,
                h: 0,
                isVisited: false
            });
        }
        grid.push(currentRow);
    }

    const middleRow = Math.floor(GRID_ROWS / 2);
    const middleCol = Math.floor(GRID_COLS / 2);
    const startCol = middleCol - 8;
    const endCol = middleCol + 8;

    startCell = grid[middleRow][startCol];
    startCell.isStart = true;
    endCell = grid[middleRow][endCol];
    endCell.isEnd = true;

    renderGrid();
}

// Update the existing DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    calculateGridSize();
    initializeGrid();
    document.getElementById('reset').addEventListener('click', resetGrid);
});

// Add this new function
async function recalculatePath() {
    clearVisualization(false);
    if (currentAlgorithm === 'dijkstra') {
        await dijkstra(true);
    } else if (currentAlgorithm === 'astar') {
        await aStar(true);
    }
    visualizeSearchedNodes();
    visualizePath(true);
}

function visualizeSearchedNodes() {
    const gridElement = document.getElementById('grid');
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = grid[row][col];
            const cellElement = gridElement.children[row * GRID_COLS + col];
            if (cell.isVisited && !cell.isStart && !cell.isEnd && !cell.isWall) {
                cellElement.classList.add('visited');
            } else {
                cellElement.classList.remove('visited');
            }
        }
    }
}

// Update the window resize event listener
window.addEventListener('resize', () => {
    calculateGridSize();
    resetGrid();
});

