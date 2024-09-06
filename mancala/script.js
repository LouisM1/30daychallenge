const board = {
    player1: [4, 4, 4, 4, 4, 4],
    player2: [4, 4, 4, 4, 4, 4],
    stores: [0, 0]
};

let currentPlayer = 1;

function initBoard() {
    const player1Pits = document.getElementById('player1-pits');
    const player2Pits = document.getElementById('player2-pits');
    
    for (let i = 0; i < 6; i++) {
        player1Pits.innerHTML += `<div class="pit" onclick="makeMove(1, ${i})">${board.player1[i]}</div>`;
        player2Pits.innerHTML += `<div class="pit" onclick="makeMove(2, ${5-i})">${board.player2[5-i]}</div>`;
    }
    
    updateBoard();
}

function updateBoard() {
    const pits = document.querySelectorAll('.pit');
    for (let i = 0; i < 6; i++) {
        pits[i].textContent = board.player2[5-i];
        pits[i+6].textContent = board.player1[i];
    }
    
    document.getElementById('player1-store').textContent = board.stores[0];
    document.getElementById('player2-store').textContent = board.stores[1];
    
    document.getElementById('status').textContent = `Player ${currentPlayer}'s turn`;
}

function makeMove(player, pit) {
    console.log(`Player ${player} moving from pit ${pit}`);
    if (player !== currentPlayer) {
        console.log('Not current player\'s turn');
        return;
    }
    
    let stones = board[`player${player}`][pit];
    console.log(`Stones in pit: ${stones}`);
    if (stones === 0) {
        console.log('No stones in pit, move cancelled');
        return;
    }
    
    board[`player${player}`][pit] = 0;
    let currentPit = pit;
    let currentSide = player;
    
    console.log('Starting stone distribution');
    while (stones > 0) {
        currentPit++;
        if (currentPit > 5) {
            if (currentSide === player) {
                board.stores[player-1]++;
                stones--;
                console.log(`Added stone to player ${player}'s store. Stones left: ${stones}`);
                if (stones === 0) break;
            }
            currentSide = 3 - currentSide;
            currentPit = 0;
        }
        board[`player${currentSide}`][currentPit]++;
        stones--;
        console.log(`Added stone to player ${currentSide}, pit ${currentPit}. Stones left: ${stones}`);
    }
    
    console.log(`Last stone landed on player ${currentSide}, pit ${currentPit}`);
    console.log(`Stones in last pit: ${board[`player${currentSide}`][currentPit]}`);

    // Avalanche rule
    if (currentPit <= 5 && board[`player${currentSide}`][currentPit] > 1) {
        console.log('Avalanche rule triggered!');
        stones = board[`player${currentSide}`][currentPit];
        board[`player${currentSide}`][currentPit] = 0;
        console.log(`Continuing move with ${stones} stones from pit ${currentPit}`);
        makeMove(currentSide, currentPit);
        return;
    } else {
        console.log('Avalanche rule not triggered');
        console.log(`currentSide: ${currentSide}, player: ${player}, currentPit: ${currentPit}, stones: ${board[`player${currentSide}`][currentPit]}`);
    }
    
    if (currentSide === player && currentPit === 6) {
        console.log('Landed in own store, player gets another turn');
        updateBoard();
        return;
    }
    
    console.log(`Turn ends, switching to player ${3 - player}`);
    currentPlayer = 3 - player;
    updateBoard();
    checkGameOver();
}

function checkGameOver() {
    if (board.player1.every(pit => pit === 0) || board.player2.every(pit => pit === 0)) {
        for (let i = 0; i < 6; i++) {
            board.stores[0] += board.player1[i];
            board.stores[1] += board.player2[i];
            board.player1[i] = 0;
            board.player2[i] = 0;
        }
        updateBoard();
        const winner = board.stores[0] > board.stores[1] ? 1 : 2;
        document.getElementById('status').textContent = `Game Over! Player ${winner} wins!`;
    }
}

initBoard();