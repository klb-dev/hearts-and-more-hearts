const scoreDisplay = document.getElementById('score');
const movesDisplay = document.getElementById('moves');
const boardSize = 8;
const board = document.getElementById('board');
let gameBoard = [];
let selectedCell = null;
const colors = ['💛', '❤️', '🧡', '💙', '💚', '💜', '🩷'];
const reshuffleButton = document.getElementById('reshuffleButton');

reshuffleButton.addEventListener('click', () => {
    if (!hasAvailableMatches() && !hasImmediateMatches()) {
        reshuffleBoard();
    } else {
        alert("Reshuffling is only allowed when there are no more matches.");
    }
});

let score = 0;
let moves = Math.floor(Math.random() * (35 - 20 + 1)) + 20; // Random moves between 20-35

function handleCellClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = gameBoard[row][col];

    if (!selectedCell) {
        selectedCell = { row, col, cell };
        cell.element.classList.add('selected');
    } else {
        if (isAdjacent(selectedCell.row, selectedCell.col, row, col)) {
            swapCells(selectedCell, { row, col, cell });
            updateMoves();
            setTimeout(checkMatches, 300);
        }
        selectedCell.cell.element.classList.remove('selected');
        selectedCell = null;
    }
}

function isAdjacent(row1, col1, row2, col2) {
    return (
        (row1 === row2 && Math.abs(col1 - col2) === 1) ||
        (col1 === col2 && Math.abs(row1 - row2) === 1)
    );
}

function swapCells(cell1, cell2) {
    let tempColor = cell1.cell.color;
    cell1.cell.color = cell2.cell.color;
    cell2.cell.color = tempColor;

    cell1.cell.element.textContent = cell1.cell.color;
    cell2.cell.element.textContent = cell2.cell.color;
} 
function reshuffleBoard() {
    let allColors = [];
    // Collect all current colors
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            allColors.push(gameBoard[row][col].color);
        }
    }

    // Shuffle the colors randomly
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

    // Re-check for matches after reshuffling
    checkMatches();
}

function hasImmediateMatches() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (checkPotentialMatch(row, col)) {
                return true;
            }
        }
    }
    return false;
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

function checkPotentialMatch(row, col) {
    const color = gameBoard[row][col].color;
    if (!color) return false;

    if (col < boardSize - 2 && color === gameBoard[row][col + 1].color && color === gameBoard[row][col + 2].color) {
        return true;
    }
    if (row < boardSize - 2 && color === gameBoard[row + 1][col].color && color === gameBoard[row + 2][col].color) {
        return true;
    }
    return false;
}

function checkMatches() {
    let matches = [];

    // Check for horizontal matches
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize - 2; col++) {
            let color = gameBoard[row][col].color;
            if (color && color === gameBoard[row][col + 1].color && color === gameBoard[row][col + 2].color) {
                matches.push([row, col], [row, col + 1], [row, col + 2]);
            }
        }
    }

    // Check for vertical matches
    for (let col = 0; col < boardSize; col++) {
        for (let row = 0; row < boardSize - 2; row++) {
            let color = gameBoard[row][col].color;
            if (color && color === gameBoard[row + 1][col].color && color === gameBoard[row + 2][col].color) {
                matches.push([row, col], [row + 1, col], [row + 2, col]);
            }
        }
    }

    if (matches.length > 0) {
        removeMatches(matches);
    }
}

function removeMatches(matches) {
    let uniqueMatches = Array.from(new Set(matches.map(JSON.stringify)), JSON.parse);
    uniqueMatches.forEach(([row, col]) => {
        gameBoard[row][col].color = null;
        gameBoard[row][col].element.textContent = '';
    });
    updateScore(uniqueMatches.length);
    dropTiles();
}

function dropTiles() {
    for (let col = 0; col < boardSize; col++) {
        let emptySpaces = 0;
        for (let row = boardSize - 1; row >= 0; row--) {
            if (gameBoard[row][col].color === null) {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                gameBoard[row + emptySpaces][col].color = gameBoard[row][col].color;
                gameBoard[row + emptySpaces][col].element.textContent = gameBoard[row][col].color;
                gameBoard[row][col].color = null;
                gameBoard[row][col].element.textContent = '';
            }
        }
        for (let i = 0; i < emptySpaces; i++) {
            gameBoard[i][col].color = getRandomColor();
            gameBoard[i][col].element.textContent = gameBoard[i][col].color;
        }
    }
    setTimeout(checkMatches, 300);
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
    movesDisplay.textContent = `${moves}`;
    if (moves <= 0) {
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
}

function createBoard() {
    board.innerHTML = ''; // Clear previous board
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
    checkMatches(); // Ensure no initial matches
}



function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

// Initialize board and display score/moves
scoreDisplay.textContent = `${score}`;
movesDisplay.textContent = `${moves}`;
createBoard();