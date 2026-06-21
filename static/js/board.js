// @ts-check

const BOARD_SIZES = { "3x3": 3, "4x4": 4, "5x5": 5 };

/**
 * Get cell size based on board dimension
 * @param {number} n - board size (e.g., 3, 4, 5)
 * @returns {number} - numeric size (without unit)
*/
function getBaseSize(n) {
    /** @type {Record<number, number>} */
    const sizes = { 3: 26.66, 4: 20, 5: 16 };
    const base = sizes[n] ?? 16;
    return base;
}

/**
 * Get CSS unit (vh or vw depending on viewport)
 * @returns {string}
 */
function getUnit() {
    return window.innerWidth < window.innerHeight ? "vw" : "vh";
}

/**
 * Apply grid template dynamically
 * @param {Element | null} board - board element
 * @param {number} n - board size
 */
function applyBoardSize(board, n) {
    if (!(board instanceof HTMLElement)) {
        console.error("Invalid board element:", board);
        return;
    }
    const baseSize = getBaseSize(n);
    const unit = getUnit();
    const cellSize = `${baseSize}${unit}`;
    board.style.display = "grid";
    board.style.gridTemplateColumns = `repeat(${n}, ${cellSize})`;
    board.style.gridTemplateRows = `repeat(${n}, ${cellSize})`;
}

/**
 * Create n × n cells inside the board
 * @param {Element | null} board - board element
 * @param {number} n - board size
 */
function createBoard(board, n) {
    if (!(board instanceof HTMLElement)) {
        console.error("Invalid board element:", board);
        return;
    }
    board.innerHTML = ""; // clear old cells
    const textSize = getBaseSize(n) * 0.5 + getUnit();
    for (let i = 0; i < n * n; i++) {
        const cell = document.createElement("div");
        cell.style.fontSize = textSize;
        cell.className = "cell-base";
        board.appendChild(cell);
    }
}

/**
 * Update board size when user changes option
 * @param {HTMLElement} board
 * @param {number} newSize 
*/
function changeBoardSize(board, newSize) {
    currentSize = newSize;
    // localStorage.setItem("boardSize", String(newSize));
    saveOption(STORAGE_KEYS.BOARD_SIZE, newSize);

    // Reset everything BEFORE doing anything async
    currentSymbol = "X";
    gameOver = false;
    aiThinking = false;
    lastClickedCell = null;

    applyBoardSize(board, newSize);
    createBoard(board, newSize);
    attachCellListeners(board); // attach listeners after creating cells
    playAiTurnIfNeeded(board);
}

/**
 * Convert the flat DOM board into a 2D array of "X" / "O" / ""
 * @param {HTMLElement} board
 * @returns {string[][]}
 */
function getBoardState(board) {
    const cells = Array.from(board.querySelectorAll(".cell-base"));
    const n = Math.sqrt(cells.length);
    const grid = [];
    for (let r = 0; r < n; r++) {
        const row = [];
        for (let c = 0; c < n; c++) row.push(cells[r * n + c].textContent || "");
        grid.push(row);
    }
    return grid;
}

/**
 * 
 * @param {HTMLElement} board 
 */
function clearBoard(board) {
    board.querySelectorAll(".cell-base").forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("cell-filled")
    })

    lastClickedCell = null;
    currentSymbol = "X";
    gameOver = false;
}

// Read last board size from localStorage, fallback to 3
let currentSize = loadOption(STORAGE_KEYS.BOARD_SIZE, BOARD_SIZES) ?? 3;