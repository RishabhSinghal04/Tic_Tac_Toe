// @ts-check

let currentSymbol = "X";
let gameOver = false;
let aiThinking = false;

/** @type {HTMLElement | null} */
let lastClickedCell = null;

/**
 * Place a symbol on a cell and update tracking state
 * @param {HTMLElement} cell
 * @param {string} symbol
 */
function placeSymbol(cell, symbol) {
    cell.textContent = symbol;
    cell.classList.add("cell-filled");
    if (lastClickedCell) lastClickedCell.style.color = "black";
    lastClickedCell = cell;
}

/**
 * Check for win/draw after a move; returns true if the game ended
 * @param {HTMLElement} board
 * @param {string} symbolJustPlayed
 */
async function checkGameEnd(board, symbolJustPlayed) {
    const grid = getBoardState(board);

    let message = null;
    if (checkWinner(grid, symbolJustPlayed)) {
        message = `${symbolJustPlayed} wins!`;
    } else if (checkDraw(grid)) {
        message = "It's a draw";
    } else {
        return false;
    }

    gameOver = true;
    const playAgain = await showConfirmDialog(message, { yesLabel: "New Game", noLabel: "Close" });
    if (playAgain) {
        clearBoard(board);
        playAiTurnIfNeeded(board);
    }
    return true;
}

/**
 * If it's the AI's turn, request and play its move.
 * Sets `aiThinking` for the duration of the request so clicks are blocked meanwhile.
 * @param {HTMLElement} board
 */
async function playAiTurnIfNeeded(board) {
    if (gameOver || aiThinking) return;
    const { aiIsOpponent, aiSymbol, difficulty } = getGameSettings();
    if (!aiIsOpponent || currentSymbol !== aiSymbol) return;

    aiThinking = true;
    try {
        const grid = getBoardState(board);
        const position = await requestAiMove(grid, aiSymbol, difficulty);
        const aiCell = board.querySelectorAll(".cell-base")[position - 1];
        if (aiCell instanceof HTMLElement) {
            placeSymbol(aiCell, aiSymbol);
            currentSymbol = currentSymbol === "X" ? "O" : "X";
            await checkGameEnd(board, aiSymbol);
        }
    } finally {
        aiThinking = false;
    }
}

/**
 * Attach click listeners to cells
 * @param {Element | null} board
 */
function attachCellListeners(board) {
    if (!board) return;

    board.addEventListener("click", async (e) => {
        if (gameOver || aiThinking) return;
        if (!(e.target instanceof Element)) return;

        const cell = e.target.closest(".cell-base");
        if (!(cell instanceof HTMLElement) || cell.textContent !== "") return;

        const playedSymbol = currentSymbol;
        placeSymbol(cell, playedSymbol);
        currentSymbol = currentSymbol === "X" ? "O" : "X";

        if (await checkGameEnd(/** @type {HTMLElement} */(board), playedSymbol)) return;
        await playAiTurnIfNeeded(/** @type {HTMLElement} */(board));
    });
}