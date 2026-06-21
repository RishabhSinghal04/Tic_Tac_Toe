// @ts-check

/**
 * Read current AI-related settings from localStorage
 * @returns {{ aiIsOpponent: boolean, aiSymbol: string, difficulty: string }}
 */
function getGameSettings() {
    const playerMode = getKeyByValue(PLAYER_OPTIONS, loadOption(STORAGE_KEYS.PLAYER, PLAYER_OPTIONS) ?? 1);
    const symbolOwner = getKeyByValue(SYMBOL_OPTIONS, loadOption(STORAGE_KEYS.SYMBOL, SYMBOL_OPTIONS) ?? 1);
    const difficulty = getKeyByValue(DIFFICULTY_OPTIONS, loadOption(STORAGE_KEYS.DIFFICULTY, DIFFICULTY_OPTIONS) ?? 1);
    return {
        aiIsOpponent: playerMode === "ai",
        aiSymbol: symbolOwner === "ai" ? "X" : "O",
        difficulty: difficulty ?? "medium",
    };
}

/**
 * Ask the Flask backend for the AI's next move
 * @param {string[][]} grid
 * @param {string} aiPlayer
 * @param {string} difficulty
 * @returns {Promise<number>} 1-indexed cell position
 */
async function requestAiMove(grid, aiPlayer, difficulty) {
    const res = await fetch("/api/ai-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ board: grid, aiPlayer, difficulty }),
    });
    const data = await res.json();
    return data.position;
}