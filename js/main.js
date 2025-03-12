const scoreDisplay = document.getElementById('score');
const movesDisplay = document.getElementById('moves');
const boardSize = 8;
const board = document.getElementById('board');
let gameBoard = [];
let selectedCell = null;
const colors = ['💛', '❤️', '🧡', '💙', '💚', '💜', '🩷'];
const reshuffleButton = document.getElementById('reshuffleButton');



reshuffleButton.addEventListener('click', reshuffleBoard);

let score = 0;
let moves = Math.floor(Math.random() * (35 - 20 + 1)) + 20; // Random moves between 20-35

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

function updateScore(points) {
    score += points;
    scoreDisplay.textContent = `${score}`;
}

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

function handleCellClick(event) {
    if (moves <= 0) return; // Stop interaction if moves are 0
    const cell = event.target;
    if (!selectedCell) {
        selectedCell = cell;
        selectedCell.classList.add('selected'); // Highlight selection
    } else {
        if (isAdjacent(selectedCell, cell)) {
            swapCells(selectedCell, cell);
            selectedCell.classList.remove('selected');
            selectedCell = null;
            updateMoves();
        } else {
            selectedCell.classList.remove('selected');
            selectedCell = cell;
            selectedCell.classList.add('selected');
        }
    }
}

function isAdjacent(cell1, cell2) {
    const row1 = parseInt(cell1.dataset.row);
    const col1 = parseInt(cell1.dataset.col);
    const row2 = parseInt(cell2.dataset.row);
    const col2 = parseInt(cell2.dataset.col);

    return (Math.abs(row1 - row2) === 1 && col1 === col2) || (Math.abs(col1 - col2) === 1 && row1 === row2);
}

function swapCells(cell1, cell2) {
    const row1 = parseInt(cell1.dataset.row);
    const col1 = parseInt(cell1.dataset.col);
    const row2 = parseInt(cell2.dataset.row);
    const col2 = parseInt(cell2.dataset.col);

    // Swap colors in the gameBoard
    const tempColor = gameBoard[row1][col1].color;
    gameBoard[row1][col1].color = gameBoard[row2][col2].color;
    gameBoard[row2][col2].color = tempColor;

    // Swap colors visually
    cell1.textContent = gameBoard[row1][col1].color;
    cell2.textContent = gameBoard[row2][col2].color;


    // Check if move created a match
    if (!checkMatches()) {
        // Revert swap if no match found
        gameBoard[row2][col2].color = gameBoard[row1][col1].color;
        gameBoard[row1][col1].color = tempColor;
        cell1.style.backgroundColor = gameBoard[row1][col1].color;
        cell2.style.backgroundColor = gameBoard[row2][col2].color;
    }
}

function checkMatches() {
    let matchedCells = new Set();
    let matchCount = 0; // Count the number of matched cells

    // Check for horizontal matches
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize - 2; col++) {
            let color = gameBoard[row][col].color;
            if (color && color === gameBoard[row][col + 1].color && color === gameBoard[row][col + 2].color) {
                matchedCells.add(`${row}-${col}`);
                matchedCells.add(`${row}-${col + 1}`);
                matchedCells.add(`${row}-${col + 2}`);
                matchCount += 3;
            }
        }
    }

    // Check for vertical matches
    for (let col = 0; col < boardSize; col++) {
        for (let row = 0; row < boardSize - 2; row++) {
            let color = gameBoard[row][col].color;
            if (color && color === gameBoard[row + 1][col].color && color === gameBoard[row + 2][col].color) {
                matchedCells.add(`${row}-${col}`);
                matchedCells.add(`${row + 1}-${col}`);
                matchedCells.add(`${row + 2}-${col}`);
                matchCount += 3;
            }
        }
    }

    if (matchedCells.size > 0) {
        matchedCells.forEach(cell => {
            let [row, col] = cell.split('-').map(Number);
            gameBoard[row][col].element.textContent = '';
            gameBoard[row][col].color = '';
        });

        updateScore(matchCount * 20); // Each matched piece gives 20 points
        setTimeout(dropItems, 500);
        return true;
    }
    return false;
}

function dropItems() {
    for (let col = 0; col < boardSize; col++) {
        let emptySpaces = [];
        for (let row = boardSize - 1; row >= 0; row--) {
            if (gameBoard[row][col].color === '') {
                emptySpaces.push(row);
            } else if (emptySpaces.length > 0) {
                let emptyRow = emptySpaces.shift();
                gameBoard[emptyRow][col].color = gameBoard[row][col].color;
                gameBoard[emptyRow][col].element.textContent = gameBoard[row][col].color;
                gameBoard[row][col].color = '';
                gameBoard[row][col].element.textContent = '';
                emptySpaces.push(row);
            }
        }
    }

    // Refill empty cells
    for (let col = 0; col < boardSize; col++) {
        for (let row = 0; row < boardSize; row++) {
            if (gameBoard[row][col].color === '') {
                let newColor = getRandomColor();
                gameBoard[row][col].color = newColor;
                gameBoard[row][col].element.textContent= newColor;
            }
        }
    }

    setTimeout(checkMatches, 500);
}

// Initialize board and display score/moves
scoreDisplay.textContent = `${score}`;
movesDisplay.textContent = `${moves}`;
createBoard();
