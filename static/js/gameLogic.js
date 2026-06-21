// @ts-check

/**
 * JS port of check_winner.py
 * @param {string[][]} grid
 * @param {string} player
 * @returns {boolean}
 */
function checkWinner(grid, player) {
    const n = grid.length;
    if (grid.some(row => row.every(cell => cell === player))) return true;
    for (let col = 0; col < n; col++) {
        if (grid.every(row => row[col] === player)) return true;
    }
    if (grid.every((row, i) => row[i] === player)) return true;
    if (grid.every((row, i) => row[n - 1 - i] === player)) return true;
    return false;
}

/**
 * @param {string[][]} grid
 * @returns {boolean}
 */
function checkDraw(grid) {
    return grid.every(row => row.every(cell => cell !== ""));
}