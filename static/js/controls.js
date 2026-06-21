// @ts-check

/**
 * @callback OnChangeHandler
 * @param {number} val
 * @param {string} key
 * @returns {void | boolean | Promise<void | boolean>}
 */

const PLAYER_OPTIONS = { "ai": 1, "human": 2 };
const DIFFICULTY_OPTIONS = { "medium": 1, "hard": 2 };
const SYMBOL_OPTIONS = { "ai": 1, "human": 2 };

/**
 * Attach cyclic toggle behavior to a button
 * @param {Element | null} button - target button
 * @param {Record<string, number>} options - list of options to cycle through
 * @param {OnChangeHandler} [onChange] - optional callback when option changes
 * @param {number} [defaultValue] - optional default value to start from
 * @param {string} [labelSelector] - optional selector for child element to update
 */
function makeCyclicButton(button, options, onChange, defaultValue, labelSelector) {
    if (!(button instanceof HTMLButtonElement)) return;

    const keys = Object.keys(options);
    let index = 0;

    if (defaultValue !== undefined) {
        const defaultKey = keys.find(k => options[k] === defaultValue);
        if (defaultKey) index = keys.indexOf(defaultKey);
    }

    const labelEl = labelSelector ? button.querySelector(labelSelector) : button;
    if (labelEl) labelEl.textContent = keys[index];

    button.addEventListener("click", async () => {
        const nextIndex = (index + 1) % keys.length;
        const key = keys[nextIndex];
        const value = options[key];

        if (onChange) {
            const result = await onChange(value, key);
            if (result === false) return; // vetoed — don't commit anything
        }

        index = nextIndex;
        if (labelEl) labelEl.textContent = key;
    });
}

/**
 * @param {HTMLButtonElement[]} btns 
 */
function disableBtn(btns) {
    btns.forEach(btn => { btn.disabled = true; btn.style.opacity = "0.5"; });
}

/**
 * @param {HTMLButtonElement[]} btns 
*/
function enableBtn(btns) {
    btns.forEach(btn => { btn.disabled = false; btn.style.opacity = "1"; });
}

const board = /** @type {HTMLElement | null} */ (document.getElementById("board"));
// Find buttons
const playerBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById("button.1.player"));
const difficultyBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById("button.2.difficulty"));
const symbolBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById("button.3.X"));
const boardBtn = /** @type {HTMLButtonElement | null} */ (document.getElementById("button.4.board.size"));
const resetBtn = /** @type {HTMLButtonElement | null} */ ((document.getElementById("button.5.reset")));


if (!board || !playerBtn || !difficultyBtn || !symbolBtn || !boardBtn || !resetBtn) {
    alert("Not Functional");
} else {
    // Init board
    applyBoardSize(board, currentSize);
    createBoard(board, currentSize);
    attachCellListeners(board);
    playAiTurnIfNeeded(board);

    /** @type {number | undefined} */
    let resizeTimeout;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => applyBoardSize(board, currentSize), 100);
    });

    // Initial enable/disable state, based on saved player option
    const savedPlayer = loadOption(STORAGE_KEYS.PLAYER, PLAYER_OPTIONS);
    const isHuman = savedPlayer === PLAYER_OPTIONS["human"];
    isHuman ? disableBtn([difficultyBtn, symbolBtn]) : enableBtn([difficultyBtn, symbolBtn]);

    // ---- Generalized cyclic button setup ----
    const cyclicButtons = [
        {
            btn: playerBtn,
            options: PLAYER_OPTIONS,
            key: STORAGE_KEYS.PLAYER,
            /** @type {OnChangeHandler} */
            onChange: (_, key) => {
                saveOption(STORAGE_KEYS.PLAYER, key);
                key === "human" ? disableBtn([difficultyBtn, symbolBtn]) : enableBtn([difficultyBtn, symbolBtn]);
                playAiTurnIfNeeded(board);
            },
        },
        {
            btn: difficultyBtn,
            options: DIFFICULTY_OPTIONS,
            key: STORAGE_KEYS.DIFFICULTY,
            // no turn check needed — difficulty doesn't change whose turn it is
        },
        {
            btn: symbolBtn,
            options: SYMBOL_OPTIONS,
            key: STORAGE_KEYS.SYMBOL,
            labelSelector: "#symbol-label",
            /** @type {OnChangeHandler} */
            onChange: (_, key) => {
                saveOption(STORAGE_KEYS.SYMBOL, key);
                playAiTurnIfNeeded(board);
            },
        },
        {
            btn: boardBtn,
            options: BOARD_SIZES,
            key: STORAGE_KEYS.BOARD_SIZE,
            /**
             * @param {number} val 
             * @returns {Promise<boolean>}
             */
            onChange: async (val) => {
                const proceed = board.textContent == "" ||
                    await showConfirmDialog("Change board? Current game will reset.");
                if (proceed) {
                    saveOption(STORAGE_KEYS.BOARD_SIZE, val);
                    changeBoardSize(board, val);
                }
                return proceed;
            },
        },
    ];

    cyclicButtons.forEach(({ btn, options, key, labelSelector, onChange }) => {
        const saved = loadOption(key, options);
        const handler = onChange ?? (/** @type {OnChangeHandler} */
            (_, k) => saveOption(key, k));
        makeCyclicButton(btn, options, handler, saved, labelSelector);
    });


    resetBtn.addEventListener("click", async () => {
        // Ask for confirmation
        try {
            if (board.textContent == "") {
                console.log("No content on the board");
                return;
            }
            const confirmed = await showConfirmDialog("Reset board?");
            if (confirmed) {
                clearBoard(board);
                playAiTurnIfNeeded(board);
            }
        } catch (err) {
            console.error("Error during reset:", err);
        }
    });
}