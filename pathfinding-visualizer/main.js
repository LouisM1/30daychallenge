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

let routingPoint = null;
let hasRoutingPoint = false;
let isAddingRoutingPoint = false;

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
                isRoutingPoint: false,
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
            if (cell.isRoutingPoint) cellElement.classList.add('routing-point');
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
    if (isAddingRoutingPoint) {
        if (!cell.isStart && !cell.isEnd && !cell.isWall) {
            cell.isRoutingPoint = true;
            routingPoint = cell;
            hasRoutingPoint = true;
            isAddingRoutingPoint = false;
            const button = document.getElementById('toggle-routing-point');
            button.textContent = 'Remove Routing Point';
            button.classList.remove('active');
        }
    } else if (cell.isStart || cell.isEnd || cell.isRoutingPoint) {
        isDragging = true;
        draggedNode = cell.isStart ? 'start' : (cell.isEnd ? 'end' : 'routing-point');
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
        } else if (draggedNode === 'routing-point') {
            routingPoint.isRoutingPoint = false;
            cell.isRoutingPoint = true;
            routingPoint = cell;
        }

        if (isPathFound) {
            recalculatePath();
        } else {
            renderGrid();
        }
    } else if (isMouseDown) {
        const cell = grid[row][col];
        if (cell.isStart || cell.isEnd || cell.isRoutingPoint) return;
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
    if (!cell.isStart && !cell.isEnd && !cell.isRoutingPoint) {
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
            console.log(`Dijkstra found target: ${endCell === routingPoint ? 'Routing Point' : 'End Point'}`);
            if (visualize) {
                await visualizeBatch(visitedNodesInOrder);
                await visualizePath(false, closestNode);
            }
            isPathFound = true;
            return { endNode: endCell, visitedNodesInOrder };
        }

        updateUnvisitedNeighbors(closestNode);
    }

    console.log(`Dijkstra did not find target: ${endCell === routingPoint ? 'Routing Point' : 'End Point'}`);
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
            console.log(`A* found target: ${endCell === routingPoint ? 'Routing Point' : 'End Point'}`);
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

    console.log(`A* did not find target: ${endCell === routingPoint ? 'Routing Point' : 'End Point'}`);
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
    await runAlgorithmWithRoutingPoint(dijkstra);
});

document.getElementById('astar').addEventListener('click', async () => {
    clearVisualization();
    await runAlgorithmWithRoutingPoint(aStar);
});

// Update the clearVisualization function
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
        // Remove this part to keep the routing point
        // if (hasRoutingPoint && routingPoint) {
        //     routingPoint.isRoutingPoint = false;
        //     routingPoint = null;
        //     hasRoutingPoint = false;
        //     isAddingRoutingPoint = false;
        //     const button = document.getElementById('toggle-routing-point');
        //     button.textContent = 'Add Routing Point';
        //     button.classList.remove('active');
        // }
    }
    renderGrid();
}

// Update the resetGrid function
function resetGrid() {
    clearVisualization(true);
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
    document.getElementById('toggle-routing-point').addEventListener('click', toggleRoutingPoint);
});

// Add this new function
async function recalculatePath() {
    clearVisualization(false);
    if (currentAlgorithm === 'dijkstra') {
        await runAlgorithmWithRoutingPoint(dijkstra);
    } else if (currentAlgorithm === 'astar') {
        await runAlgorithmWithRoutingPoint(aStar);
    }
}

function visualizeSearchedNodes() {
    const gridElement = document.getElementById('grid');
    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const cell = grid[row][col];
            const cellElement = gridElement.children[row * GRID_COLS + col];
            if (cell.isVisited && !cell.isStart && !cell.isEnd && !cell.isWall && !cell.isRoutingPoint) {
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

// Add this function to toggle the routing point
function toggleRoutingPoint() {
    const button = document.getElementById('toggle-routing-point');
    if (hasRoutingPoint) {
        // Remove routing point
        if (routingPoint) {
            routingPoint.isRoutingPoint = false;
            routingPoint = null;
        }
        hasRoutingPoint = false;
        isAddingRoutingPoint = false;
        button.textContent = 'Add Routing Point';
        button.classList.remove('active');
    } else {
        // Prepare to add routing point
        isAddingRoutingPoint = true;
        hasRoutingPoint = false; // Reset this flag
        button.textContent = 'Cancel Routing Point';
        button.classList.add('active');
    }
    renderGrid();
}

// Add this function to run the algorithm in two parts
async function runAlgorithmWithRoutingPoint(algorithm) {
    clearVisualization(false);
    const originalStart = startCell;
    const originalEnd = endCell;
    let allVisitedNodes = [];
    let fullPath = [];

    if (!hasRoutingPoint || !routingPoint) {
        // If there's no routing point, run the algorithm normally
        const result = await algorithm(false);
        allVisitedNodes = result.visitedNodesInOrder;
        fullPath = getPathFromEndNode(originalEnd);
        console.log("End point found!");
    } else {
        // First, find path to routing point
        endCell = routingPoint;
        const result1 = await algorithm(false);
        if (result1.endNode) {
            console.log("Routing point found!");
            allVisitedNodes = result1.visitedNodesInOrder;
            fullPath = getPathFromEndNode(routingPoint);

            // Then, find path from routing point to end
            startCell = routingPoint;
            endCell = originalEnd;
            const result2 = await algorithm(false);
            if (result2.endNode) {
                console.log("End point found!");
                allVisitedNodes = allVisitedNodes.concat(result2.visitedNodesInOrder);
                fullPath = fullPath.concat(getPathFromEndNode(originalEnd).slice(1)); // Slice to avoid duplicating the routing point
            } else {
                console.log("End point not found after routing point!");
            }
        } else {
            console.log("Routing point not found!");
        }
    }

    // Reset start and end cells
    startCell = originalStart;
    endCell = originalEnd;
    
    // Visualize the full path
    await visualizeBatch(allVisitedNodes);
    await visualizePath(false, fullPath);

    // Reset the grid cells for the next run
    resetGridCells();
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
            console.log(`Dijkstra found target: ${endCell === routingPoint ? 'Routing Point' : 'End Point'}`);
            if (visualize) {
                await visualizeBatch(visitedNodesInOrder);
                await visualizePath(false, closestNode);
            }
            isPathFound = true;
            return { endNode: endCell, visitedNodesInOrder };
        }

        updateUnvisitedNeighbors(closestNode);
    }

    console.log(`Dijkstra did not find target: ${endCell === routingPoint ? 'Routing Point' : 'End Point'}`);
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
            console.log(`A* found target: ${endCell === routingPoint ? 'Routing Point' : 'End Point'}`);
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

    console.log(`A* did not find target: ${endCell === routingPoint ? 'Routing Point' : 'End Point'}`);
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
            cell.isVisited = false;
            cell.distance = Infinity;
            cell.previousCell = null;
            cell.f = 0;
            cell.g = 0;
            cell.h = 0;
        }
    }
    startCell.distance = 0;
}
