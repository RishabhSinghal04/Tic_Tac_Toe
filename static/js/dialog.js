// @ts-check

/**
 * Show a confirm-style dialog and resolve with true/false based on the user's choice.
 * @param {string} message
 * @param {{ yesLabel?: string, noLabel?: string }} [options]
 * @returns {Promise<boolean>}
 */
function showConfirmDialog(message, options = {}) {
    const { yesLabel = "Yes", noLabel = "No" } = options;
    const messageDialog = document.getElementById("dialog.message");
    const messageEl = document.getElementById("dialog.message.text");
    const yesBtn = document.getElementById("dialog.yes");
    const noBtn = document.getElementById("dialog.no");

    if (!messageDialog || !messageEl || !yesBtn || !noBtn) {
        return Promise.resolve(false);
    }

    messageEl.textContent = message;
    yesBtn.textContent = yesLabel;
    noBtn.textContent = noLabel;
    messageDialog.classList.remove("hidden");
    messageDialog.classList.add("flex");

    return new Promise((resolve) => {
        /** @param {boolean} result */
        function cleanup(result) {
            const resultEl = /** @type {HTMLElement} */ (messageDialog);
            const yes = /** @type {HTMLButtonElement} */ (yesBtn);
            const no = /** @type {HTMLButtonElement} */ (noBtn);

            resultEl.classList.add("hidden");
            resultEl.classList.remove("flex");
            yes.removeEventListener("click", onYes);
            no.removeEventListener("click", onNo);
            resolve(result);
        }
        function onYes() { cleanup(true); }
        function onNo() { cleanup(false); }
        yesBtn.addEventListener("click", onYes);
        noBtn.addEventListener("click", onNo);
    });
}