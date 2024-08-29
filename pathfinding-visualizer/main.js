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

// Update the initializeGrid function
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
    const startCol = Math.max(0, middleCol - 8);
    const endCol = Math.min(GRID_COLS - 1, middleCol + 8);

    startCell = grid[middleRow][startCol];
    startCell.isStart = true;
    endCell = grid[middleRow][endCol];
    endCell.isEnd = true;

    renderGrid();
}

// Update the renderGrid function
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
    e.preventDefault();
    renderGrid();
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

        renderGrid();
        calculatePathInstant(); // Always calculate path instantly when dragging
    } else if (isMouseDown) {
        const cell = grid[row][col];
        if (cell.isStart || cell.isEnd) return;
        cell.isWall = !isErasing;
        renderGrid();
        if (isPathFound) {
            calculatePathInstant();
        }
    }
}

function handleMouseUp() {
    isMouseDown = false;
    isDragging = false;
    draggedNode = null;
    isErasing = false;
    // Remove the recalculatePath call, as we want to keep the instant result
}

function toggleWall(row, col) {
    const cell = grid[row][col];
    if (!cell.isStart && !cell.isEnd) {
        cell.isWall = !cell.isWall;
        renderGrid();
    }
}

// Update the dijkstra function
async function dijkstra(visualize = true) {
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
            console.log(`Dijkstra found target: End Point`);
            if (visualize) {
                await visualizeBatch(visitedNodesInOrder);
                await visualizePath(false, closestNode);
            }
            isPathFound = true;
            return { endNode: endCell, visitedNodesInOrder };
        }

        updateUnvisitedNeighbors(closestNode);
    }

    console.log(`Dijkstra did not find target: End Point`);
    if (visualize) {
        await visualizeBatch(visitedNodesInOrder);
    }
    return { endNode: null, visitedNodesInOrder };
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
async function aStar(visualize = true) {
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
            console.log(`A* found target: End Point`);
            if (visualize) {
                await visualizeBatchAStar(visitedNodesInOrder);  // Changed to visualizeBatchAStar
                await visualizePath(false, current);
            }
            isPathFound = true;
            return { endNode: endCell, visitedNodesInOrder };
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

    console.log(`A* did not find target: End Point`);
    if (visualize) {
        await visualizeBatchAStar(visitedNodesInOrder);  // Changed to visualizeBatchAStar
    }
    return { endNode: null, visitedNodesInOrder };
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
async function visualizePath(instant = false, path) {
    if (!Array.isArray(path)) {
        path = getPathFromEndNode(path);
    }
    
    if (instant) {
        path.forEach(node => {
            const cellElement = document.querySelector(`.cell[data-row="${node.row}"][data-col="${node.col}"]`);
            cellElement.classList.add('path');
        });
    } else {
        for (const node of path) {
            const cellElement = document.querySelector(`.cell[data-row="${node.row}"][data-col="${node.col}"]`);
            cellElement.classList.add('path');
            await sleep(30);  // Increased from 20ms to 30ms
        }
    }
}

// Update the event listeners to clear the previous visualization
document.getElementById('dijkstra').addEventListener('click', async () => {
    clearVisualization();
    await runAlgorithm(dijkstra);
});

document.getElementById('astar').addEventListener('click', async () => {
    clearVisualization();
    await runAlgorithm(aStar);
});

// Update the clearVisualization function
function clearVisualization(fullClear = true) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('visited');
        if (fullClear) {
            cell.classList.remove('path');
        }
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

// Update the resetGrid function
function resetGrid() {
    clearVisualization(true);
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            grid[row][col].isWall = false;
            grid[row][col].isVisited = false;
        }
    }
    initializeGrid();
}

// Add this event listener for the reset button
document.getElementById('reset').addEventListener('click', resetGrid);

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
        await runAlgorithm(dijkstra);
    } else if (currentAlgorithm === 'astar') {
        await runAlgorithm(aStar);
    }
    isPathFound = true;  // Set this to true after recalculation
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

// Update the runAlgorithm function to runAlgorithm
async function runAlgorithm(algorithm) {
    clearVisualization(false);
    const result = await algorithm(true);  // Set visualize to true
    if (result.endNode) {
        const fullPath = getPathFromEndNode(endCell);
        await visualizePath(false, fullPath);
    }
    isPathFound = true;
}

// Helper function to get the path from the end node
function getPathFromEndNode(endNode) {
    const path = [];
    let current = endNode;
    while (current !== null) {
        path.unshift(current);
        current = current.previousCell;
    }
    return path;
}

// Update the dijkstra and aStar functions to return visited nodes
async function dijkstra(visualize = true) {
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
            console.log(`Dijkstra found target: End Point`);
            if (visualize) {
                await visualizeBatch(visitedNodesInOrder);
                await visualizePath(false, closestNode);
            }
            isPathFound = true;
            return { endNode: endCell, visitedNodesInOrder };
        }

        updateUnvisitedNeighbors(closestNode);
    }

    console.log(`Dijkstra did not find target: End Point`);
    if (visualize) {
        await visualizeBatch(visitedNodesInOrder);
    }
    return { endNode: null, visitedNodesInOrder };
}

async function aStar(visualize = true) {
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
            console.log(`A* found target: End Point`);
            if (visualize) {
                await visualizeBatchAStar(visitedNodesInOrder);
                await visualizePath(false, current);
            }
            isPathFound = true;
            return { endNode: endCell, visitedNodesInOrder };
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

    console.log(`A* did not find target: End Point`);
    if (visualize) {
        await visualizeBatchAStar(visitedNodesInOrder);
    }
    return { endNode: null, visitedNodesInOrder };
}

// Update the visualizePath function to accept a path array
async function visualizePath(instant = false, path) {
    if (!Array.isArray(path)) {
        path = getPathFromEndNode(path);
    }
    
    if (instant) {
        path.forEach(node => {
            const cellElement = document.querySelector(`.cell[data-row="${node.row}"][data-col="${node.col}"]`);
            cellElement.classList.add('path');
        });
    } else {
        for (const node of path) {
            const cellElement = document.querySelector(`.cell[data-row="${node.row}"][data-col="${node.col}"]`);
            cellElement.classList.add('path');
            await sleep(30);
        }
    }
}

// Helper function to reset grid cells
function resetGridCells() {
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = grid[row][col];
            if (!cell.isWall) {
                cell.isVisited = false;
                cell.distance = Infinity;
                cell.previousCell = null;
                cell.f = 0;
                cell.g = 0;
                cell.h = 0;
            }
        }
    }
    startCell.distance = 0;
}

// Update the calculatePathInstant function to set isPathFound
function calculatePathInstant() {
    resetGridCells();
    clearVisualization(false);
    let result;
    if (currentAlgorithm === 'dijkstra') {
        result = dijkstraInstant();
    } else if (currentAlgorithm === 'astar') {
        result = aStarInstant();
    }
    if (result && result.endNode) {
        visualizeVisitedNodesInstant(result.visitedNodesInOrder);
        const path = getPathFromEndNode(endCell);
        visualizePathInstant(path);
        isPathFound = true; // Set this to true after instant calculation
    } else {
        isPathFound = false; // Set this to false if no path is found
    }
}

function dijkstraInstant() {
    if (!startCell || !endCell) return null;

    const unvisitedNodes = new Set(getAllNodes());
    const visitedNodesInOrder = [];
    startCell.distance = 0;

    while (unvisitedNodes.size) {
        const closestNode = getClosestNode(unvisitedNodes);
        if (!closestNode) break;

        if (closestNode.isWall) continue;
        if (closestNode.distance === Infinity) return null;

        closestNode.isVisited = true;
        unvisitedNodes.delete(closestNode);
        visitedNodesInOrder.push(closestNode);

        if (closestNode === endCell) {
            return { endNode: endCell, visitedNodesInOrder };
        }

        updateUnvisitedNeighbors(closestNode);
    }

    return null;
}

function aStarInstant() {
    if (!startCell || !endCell) return null;

    const openSet = new Set([startCell]);
    const closedSet = new Set();
    const visitedNodesInOrder = [];

    startCell.g = 0;
    startCell.f = heuristic(startCell, endCell);

    while (openSet.size > 0) {
        const current = getLowestFScoreNode(openSet);

        if (current === endCell) {
            return { endNode: endCell, visitedNodesInOrder };
        }

        openSet.delete(current);
        closedSet.add(current);
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

    return null;
}

function visualizePathInstant(path) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('path'));
    
    path.forEach(node => {
        const cellElement = document.querySelector(`.cell[data-row="${node.row}"][data-col="${node.col}"]`);
        cellElement.classList.add('path');
    });
}

function visualizeVisitedNodesInstant(visitedNodes) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('visited'));
    
    visitedNodes.forEach(node => {
        if (!node.isStart && !node.isEnd && !node.isWall) {
            const cellElement = document.querySelector(`.cell[data-row="${node.row}"][data-col="${node.col}"]`);
            cellElement.classList.add('visited');
        }
    });
}

function generateMaze() {
    clearVisualization(true);
    resetGrid();
    
    // Mark all cells as walls initially
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            if (!grid[row][col].isStart && !grid[row][col].isEnd) {
                grid[row][col].isWall = true;
            }
        }
    }

    const stack = [];
    const startRow = Math.floor(Math.random() * GRID_ROWS);
    const startCol = Math.floor(Math.random() * GRID_COLS);
    stack.push(grid[startRow][startCol]);

    animateMazeGeneration(stack);
}

async function animateMazeGeneration(stack) {
    while (stack.length > 0) {
        const current = stack.pop();
        if (!current.isVisited && !current.isStart && !current.isEnd) {
            current.isWall = false;
            current.isVisited = true;
            await visualizeMazeCell(current);
        }

        const neighbors = getUnvisitedNeighbors(current);
        if (neighbors.length > 0) {
            stack.push(current);
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWallBetween(current, next);
            stack.push(next);
        }
    }

    // Reset isVisited property
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            grid[row][col].isVisited = false;
        }
    }

    renderGrid();
}

function getUnvisitedNeighbors(cell) {
    const neighbors = [];
    const { row, col } = cell;

    const directions = [
        { row: -2, col: 0 },
        { row: 2, col: 0 },
        { row: 0, col: -2 },
        { row: 0, col: 2 }
    ];

    for (const dir of directions) {
        const newRow = row + dir.row;
        const newCol = col + dir.col;
        if (newRow >= 0 && newRow < GRID_ROWS && newCol >= 0 && newCol < GRID_COLS) {
            const neighbor = grid[newRow][newCol];
            if (!neighbor.isVisited && !neighbor.isStart && !neighbor.isEnd) {
                neighbors.push(neighbor);
            }
        }
    }

    return neighbors;
}

function removeWallBetween(cell1, cell2) {
    const rowDiff = cell2.row - cell1.row;
    const colDiff = cell2.col - cell1.col;
    const wallRow = cell1.row + rowDiff / 2;
    const wallCol = cell1.col + colDiff / 2;
    grid[wallRow][wallCol].isWall = false;
}

async function visualizeMazeCell(cell) {
    const cellElement = document.querySelector(`.cell[data-row="${cell.row}"][data-col="${cell.col}"]`);
    cellElement.classList.remove('wall');
    await sleep(10);
}

// Add this event listener for the generate maze button
document.getElementById('generate-maze').addEventListener('click', generateMaze);
