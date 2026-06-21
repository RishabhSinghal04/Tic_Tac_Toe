// @ts-check

const STORAGE_KEYS = {
    PLAYER: "playerOption",
    DIFFICULTY: "difficultyOption",
    SYMBOL: "symbolOption",
    BOARD_SIZE: "boardSize",
};

/**
 * @param {string} key
 * @param {string | number} value
 */
function saveOption(key, value) {
    localStorage.setItem(key, String(value));
}

/**
 * @param {string} key
 * @param {Record<string, number>} options
 * @returns {number | undefined}
 */
function loadOption(key, options) {
    const saved = localStorage.getItem(key);
    if (!saved) return undefined;
    if (saved in options) return options[saved]; // match by key name
    const num = Number(saved);
    if (!isNaN(num) && Object.values(options).includes(num)) return num; // match by value
    return undefined;
}

/**
 * @param {Record<string, number>} options
 * @param {number} value
 * @returns {string | undefined}
 */
function getKeyByValue(options, value) {
    return Object.keys(options).find(k => options[k] === value);
}