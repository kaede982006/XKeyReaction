(() => {
    "use strict";

    const stage      = document.getElementById("stage");
    const promptEl   = document.getElementById("prompt-key");
    const messageEl  = document.getElementById("message");
    const hintEl     = document.getElementById("hint");
    const resultEl   = document.getElementById("result");
    const lastEl     = document.getElementById("last-time");
    const bestEl     = document.getElementById("best-time");
    const avgEl      = document.getElementById("avg-time");
    const attemptsEl = document.getElementById("attempts");

    const ROUNDS_PER_SESSION = 10;

    // Pool of possible target keys, identified by KeyboardEvent.code.
    // Keys commonly hijacked by the browser (F1, F5, F11, F12, etc.) are excluded.
    const TARGET_POOL = [
        // Letters
        "KeyA","KeyB","KeyC","KeyD","KeyE","KeyF","KeyG","KeyH","KeyI","KeyJ",
        "KeyK","KeyL","KeyM","KeyN","KeyO","KeyP","KeyQ","KeyR","KeyS","KeyT",
        "KeyU","KeyV","KeyW","KeyX","KeyY","KeyZ",
        // Digits
        "Digit0","Digit1","Digit2","Digit3","Digit4",
        "Digit5","Digit6","Digit7","Digit8","Digit9",
        // Symbols
        "Minus","Equal","BracketLeft","BracketRight","Backslash",
        "Semicolon","Quote","Comma","Period","Slash","Backquote",
        // Whitespace / control
        "Space","Enter","Tab","Backspace",
        // Navigation
        "ArrowUp","ArrowDown","ArrowLeft","ArrowRight",
        "Home","End","PageUp","PageDown","Insert","Delete",
        // Numpad
        "Numpad0","Numpad1","Numpad2","Numpad3","Numpad4",
        "Numpad5","Numpad6","Numpad7","Numpad8","Numpad9",
        "NumpadAdd","NumpadSubtract","NumpadMultiply","NumpadDivide",
        "NumpadDecimal","NumpadEnter",
        // Function keys (safe ones — F1/F5/F11/F12 are skipped)
        "F2","F3","F4","F6","F7","F8","F9","F10",
        // Modifiers (left side only, to keep displays unambiguous)
        "ShiftLeft","ControlLeft","AltLeft",
        // Lock keys
        "CapsLock",
    ];

    // How each KeyboardEvent.code is shown to the user.
    const DISPLAY = {
        Space: "Space", Enter: "Enter", Tab: "Tab", Backspace: "Backspace",
        Escape: "Esc", CapsLock: "Caps Lock",
        ArrowUp: "↑", ArrowDown: "↓", ArrowLeft: "←", ArrowRight: "→",
        Home: "Home", End: "End", PageUp: "Page Up", PageDown: "Page Down",
        Insert: "Insert", Delete: "Delete",
        Minus: "-", Equal: "=", BracketLeft: "[", BracketRight: "]",
        Backslash: "\\", Semicolon: ";", Quote: "'",
        Comma: ",", Period: ".", Slash: "/", Backquote: "`",
        ShiftLeft: "Shift", ShiftRight: "Shift",
        ControlLeft: "Ctrl", ControlRight: "Ctrl",
        AltLeft: "Alt", AltRight: "Alt",
        MetaLeft: "Meta", MetaRight: "Meta",
        NumpadAdd: "Num +", NumpadSubtract: "Num -",
        NumpadMultiply: "Num *", NumpadDivide: "Num /",
        NumpadDecimal: "Num .", NumpadEnter: "Num Enter",
    };

    function displayFor(code) {
        if (DISPLAY[code]) return DISPLAY[code];
        if (code.startsWith("Key"))    return code.slice(3);
        if (code.startsWith("Digit"))  return code.slice(5);
        if (code.startsWith("Numpad")) return "Num " + code.slice(6);
        if (/^F\d+$/.test(code))       return code;
        return code;
    }

    // State machine
    const STATE = {
        IDLE:   "idle",   // before any session
        WAIT:   "wait",   // red — waiting for the green
        GO:     "go",     // green — target shown, awaiting press
        RESULT: "result", // blue — between rounds in a session
        FAIL:   "fail",   // red-dark — pressed wrongly; session reset
        DONE:   "done",   // purple — 10 rounds completed
    };
    let state       = STATE.IDLE;
    let targetCode  = null;
    let goTimestamp = 0;
    let waitTimer   = null;

    // Stats for the current session
    let times = [];
    let best = Infinity;

    function setStateClass(s) {
        stage.classList.remove(
            "state-idle","state-wait","state-go","state-result",
            "state-early","state-fail","state-done"
        );
        stage.classList.add("state-" + s);
    }

    function pickTarget() {
        return TARGET_POOL[Math.floor(Math.random() * TARGET_POOL.length)];
    }

    function refreshStats() {
        const completed = times.length;
        if (completed === 0) {
            lastEl.textContent = "— ms";
            bestEl.textContent = "— ms";
            avgEl.textContent  = "— ms";
        } else {
            const avg = times.reduce((a, b) => a + b, 0) / completed;
            lastEl.textContent = `${times[completed - 1].toFixed(0)} ms`;
            bestEl.textContent = `${best.toFixed(0)} ms`;
            avgEl.textContent  = `${avg.toFixed(0)} ms`;
        }
        attemptsEl.textContent = `${completed} / ${ROUNDS_PER_SESSION}`;
    }

    function resetSession() {
        times = [];
        best = Infinity;
        refreshStats();
    }

    function beginSession() {
        resetSession();
        startRound();
    }

    function startRound() {
        clearTimeout(waitTimer);
        state = STATE.WAIT;
        targetCode = pickTarget();
        setStateClass("wait");
        promptEl.textContent = "•••";
        messageEl.textContent = `Round ${times.length + 1} of ${ROUNDS_PER_SESSION} — wait for green…`;
        hintEl.textContent = "Don't press anything yet.";
        resultEl.hidden = false;

        const delay = 1200 + Math.random() * 2800; // 1.2s – 4s
        waitTimer = setTimeout(() => {
            state = STATE.GO;
            setStateClass("go");
            promptEl.textContent = displayFor(targetCode);
            messageEl.textContent = "Press it!";
            hintEl.textContent = "";
            goTimestamp = performance.now();
        }, delay);
    }

    function failSession(reason, detail) {
        clearTimeout(waitTimer);
        state = STATE.FAIL;
        setStateClass("fail");
        promptEl.textContent = "✕";
        messageEl.textContent = reason;
        hintEl.textContent = `${detail} Press any key to start over from round 1.`;
        resetSession();
    }

    function finishRound(ms) {
        times.push(ms);
        if (ms < best) best = ms;
        refreshStats();

        if (times.length >= ROUNDS_PER_SESSION) {
            const avg = times.reduce((a, b) => a + b, 0) / times.length;
            state = STATE.DONE;
            setStateClass("done");
            promptEl.textContent = `${avg.toFixed(0)} ms avg`;
            messageEl.textContent = `Session complete — best ${best.toFixed(0)} ms.`;
            hintEl.textContent = "Press any key to start a new 10-round session.";
        } else {
            state = STATE.RESULT;
            setStateClass("result");
            promptEl.textContent = `${ms.toFixed(0)} ms`;
            messageEl.textContent = `Round ${times.length} of ${ROUNDS_PER_SESSION} done.`;
            hintEl.textContent = "Press any key for the next round.";
        }
    }

    document.addEventListener("keydown", (e) => {
        // Allow standard browser shortcuts to pass through (Ctrl+R, Ctrl+T, etc.)
        if (e.ctrlKey || e.metaKey || e.altKey) {
            const isLoneModifier = ["ControlLeft","ControlRight","AltLeft","AltRight",
                                    "MetaLeft","MetaRight","ShiftLeft","ShiftRight"].includes(e.code);
            if (!isLoneModifier) return;
        }

        // Block default browser behavior for keys we use as targets (Tab, Space, arrows, etc.).
        if (TARGET_POOL.includes(e.code) || e.code === "Escape") {
            e.preventDefault();
        }

        if (e.repeat) return;

        switch (state) {
            case STATE.IDLE:
            case STATE.RESULT:
                // Continuing or starting a session — just go.
                if (state === STATE.IDLE) beginSession();
                else                       startRound();
                break;

            case STATE.FAIL:
            case STATE.DONE:
                // Session is over (failed or finished); a press starts a fresh one.
                beginSession();
                break;

            case STATE.WAIT:
                // Pressed too soon — fail the whole session.
                failSession("Too soon!", "You pressed before the green screen.");
                break;

            case STATE.GO:
                if (e.code === targetCode) {
                    const ms = performance.now() - goTimestamp;
                    finishRound(ms);
                } else {
                    failSession(
                        "Wrong key!",
                        `Expected ${displayFor(targetCode)}, got ${displayFor(e.code)}.`
                    );
                }
                break;
        }
    });

    // Click anywhere to also advance — useful on touch devices, though the
    // primary input is the keyboard.
    stage.addEventListener("click", () => {
        if (state === STATE.IDLE)                                  beginSession();
        else if (state === STATE.RESULT)                           startRound();
        else if (state === STATE.FAIL || state === STATE.DONE)     beginSession();
        else if (state === STATE.WAIT)
            failSession("Too soon!", "You clicked before the green screen.");
    });

    // Make sure the body has focus so keys are received reliably.
    window.addEventListener("load", () => stage.focus());
})();
