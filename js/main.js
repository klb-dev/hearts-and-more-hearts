const scoreDisplay = document.getElementById('score');
const movesDisplay = document.getElementById('moves');
const boardSize = 8;
const board = document.getElementById('board');
let gameBoard = [];
let selectedCell = null;
const colors = ['💛', '❤️', '🧡', '💙', '💚', '💜', '🩷'];
const reshuffleButton = document.getElementById('reshuffle-button');

reshuffleButton.addEventListener('click', () => {
    if (!hasAvailableMatches()) {
        reshuffleBoard();
    } else {
        alert("Reshuffling is only allowed when there are no more matches.");
    }
});

let score = 0;
let moves = Math.floor(Math.random() * (35 - 20 + 1)) + 20; // Random moves between 20-35

function updateReshuffleButtonState() {
    if (!hasAvailableMatches()) {
        reshuffleButton.disabled = true;
        reshuffleButton.classList.add('disabled');
    } else {
        reshuffleButton.disabled = false;
        reshuffleButton.classList.remove('disabled');
    }
}

function handleCellClick(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (selectedCell) {
        const selectedRow = parseInt(selectedCell.dataset.row);
        const selectedCol = parseInt(selectedCell.dataset.col);

        if (isAdjacent(selectedRow, selectedCol, row, col)) {
            swapCells(selectedRow, selectedCol, row, col);

            // Check if the swap results in a match
            if (hasAvailableMatches()) {
                checkMatches();
                updateMoves();
            } else {
                // If no match is found, revert the swap
                swapCells(selectedRow, selectedCol, row, col);
            }

            selectedCell.classList.remove('selected');
            selectedCell = null;
        } else {
            selectedCell.classList.remove('selected');
            selectedCell = cell;
            selectedCell.classList.add('selected');
        }
    } else {
        selectedCell = cell;
        selectedCell.classList.add('selected');
    }
}

function hasAvailableMatches() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (checkPotentialMatch(row, col)) {
                return true;
            }
        }
    }
    return false;
}

function findMatches(row, col, direction) {
    const color = gameBoard[row][col].color;
    if (!color) return [];

    let matches = [[row, col]];

    if (direction === 'horizontal') {
        // Check to the right
        for (let i = col + 1; i < boardSize && gameBoard[row][i].color === color; i++) {
            matches.push([row, i]);
        }
        // Check to the left
        for (let i = col - 1; i >= 0 && gameBoard[row][i].color === color; i--) {
            matches.push([row, i]);
        }
    } else if (direction === 'vertical') {
        // Check downwards
        for (let i = row + 1; i < boardSize && gameBoard[i][col].color === color; i++) {
            matches.push([i, col]);
        }
        // Check upwards
        for (let i = row - 1; i >= 0 && gameBoard[i][col].color === color; i--) {
            matches.push([i, col]);
        }
    }

    return matches.length >= 3 ? matches : [];
}

function checkPotentialMatch(row, col) {
    return findMatches(row, col, 'horizontal').length > 0 || findMatches(row, col, 'vertical').length > 0;
}

function checkMatches() {
    let matches = [];

    // Check for horizontal matches
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            matches = matches.concat(findMatches(row, col, 'horizontal'));
            matches = matches.concat(findMatches(row, col, 'vertical'));
        }
    }

    if (matches.length > 0) {
        removeMatches(matches);
    }
    updateReshuffleButtonState();
}



function isAdjacent(row1, col1, row2, col2) {
    return (Math.abs(row1 - row2) === 1 && col1 === col2) || (Math.abs(col1 - col2) === 1 && row1 === row2);
}

function swapCells(row1, col1, row2, col2) {
    const tempColor = gameBoard[row1][col1].color;
    gameBoard[row1][col1].color = gameBoard[row2][col2].color;
    gameBoard[row2][col2].color = tempColor;

    gameBoard[row1][col1].element.textContent = gameBoard[row1][col1].color;
    gameBoard[row2][col2].element.textContent = gameBoard[row2][col2].color;
}

function reshuffleBoard() {
    const allColors = [];
    // Collect all current colors
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            allColors.push(gameBoard[row][col].color);
        }
    }

    allColors.sort(() => Math.random() - 0.5);

    // Reassign the shuffled colors to the board
    let index = 0;
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            gameBoard[row][col].color = allColors[index];
            gameBoard[row][col].element.textContent = allColors[index]; // Update the visual
            index++;
        }
    }

    checkMatches();
    updateReshuffleButtonState();
}

function removeMatches(matches) {
    let uniqueMatches = Array.from(new Set(matches.map(JSON.stringify)), JSON.parse);
    uniqueMatches.forEach(([row, col]) => {
        gameBoard[row][col].color = null;
        gameBoard[row][col].element.textContent = '';
        gameBoard[row][col].element.classList.add('hidden')
    });
    updateScore(uniqueMatches.length);
    setTimeout(dropTiles, 500);
}

function dropTiles() {
    for (let col = 0; col < boardSize; col++) {
        let emptySpaces = 0;
        for (let row = boardSize - 1; row >= 0; row--) {
            if (gameBoard[row][col].color === null) {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                // Move the tile down by the number of empty spaces
                gameBoard[row + emptySpaces][col].color = gameBoard[row][col].color;
                gameBoard[row + emptySpaces][col].element.textContent = gameBoard[row][col].color;
                gameBoard[row + emptySpaces][col].element.classList.remove('hidden'); // Remove hidden class
                gameBoard[row][col].color = null;
                gameBoard[row][col].element.textContent = '';
            }
        }
        // Fill the top empty spaces with new tiles
        for (let i = 0; i < emptySpaces; i++) {
            gameBoard[i][col].color = getRandomColor();
            gameBoard[i][col].element.textContent = gameBoard[i][col].color;
            gameBoard[i][col].element.classList.remove('hidden'); // Ensure new tiles are visible
        }
    }
    setTimeout(checkMatches, 500);
    updateReshuffleButtonState();
}

function updateScore(points) {
    let basePoints = points * 20;
    if (points === 4) {
        basePoints += 20; 
    } else if (points >= 5) {
        basePoints += 50; 
    }
    score += basePoints;
    scoreDisplay.textContent = `${score}`;
};

function updateMoves() {
    moves--;
    movesDisplay.textContent = `${moves}`; // Update the display before checking

    if (moves <= 0) {
        movesDisplay.textContent = '0';
        alert(`Game Over! Your final score is ${score}`);
        resetGame();
    }
}

function resetGame() {
    score = 0;
    moves = Math.floor(Math.random() * (35 - 20 + 1)) + 20;
    scoreDisplay.textContent = `Score: ${score}`;
    movesDisplay.textContent = `Moves: ${moves}`;
    createBoard();
    updateReshuffleButtonState();
}

function createBoard() {
    board.innerHTML = ''; 
    gameBoard = [];

    for (let row = 0; row < boardSize; row++) {
        let rowArray = [];
        for (let col = 0; col < boardSize; col++) {
            let color = getRandomColor();
            let cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.textContent = color;
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
            rowArray.push({ color, element: cell });
        }
        gameBoard.push(rowArray);
    }
    checkMatches();
}

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

// Initialize board and display score/moves
scoreDisplay.textContent = `${score}`;
movesDisplay.textContent = `${moves}`;
createBoard();
updateReshuffleButtonState();