# XKeyReaction

A minimal, browser-based **keyboard reaction-time test**. Wait for the screen
to turn green, press the key it shows you as fast as you can, and the page
reports your reaction time in milliseconds.

No dependencies, no build step — just open `index.html` in any modern browser.

## Features

- Random target key drawn from a wide pool of physical keys
- Random pre-stimulus delay (1.2 – 4.0 seconds) to defeat anticipation
- 10-round sessions with strict failure handling: one wrong press resets the
  entire session back to round 1
- Per-session statistics: last, best, average, round counter
- Layout-independent matching via `KeyboardEvent.code`
- Custom display font (Zeequada)

## How to use

1. Open `index.html` in your browser (double-click the file, or serve the
   folder over any static HTTP server).
2. Press any key to begin a session of **10 rounds**.
3. The screen turns **red** — wait.
4. When the screen turns **green** and a key is shown, press exactly that key
   as fast as you can.
5. Your reaction time is shown on the **blue** result screen. Press any key
   to continue to the next round.
6. After 10 successful rounds the **purple** summary screen shows your average
   and best time. Press any key to start a new session.

### Failure rules

Any of the following resets the session back to **round 1** (all stats are
cleared):

- Pressing a key during the red "wait" phase (false start).
- Pressing the wrong key during the green "go" phase.

In other words, the only valid input *during a round* is the exact key shown
on the green screen — anything else aborts the session.

## Supported keys

Detection is layout-independent: matching uses the physical
[`KeyboardEvent.code`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code)
of each key, so the displayed key always corresponds to the same physical
location on a US-style keyboard regardless of your active layout.

The full pool of possible target keys is:

### Letters
`A` `B` `C` `D` `E` `F` `G` `H` `I` `J` `K` `L` `M`
`N` `O` `P` `Q` `R` `S` `T` `U` `V` `W` `X` `Y` `Z`

### Digits (top row)
`0` `1` `2` `3` `4` `5` `6` `7` `8` `9`

### Symbols (US layout positions)
`` ` `` `-` `=` `[` `]` `\` `;` `'` `,` `.` `/`

### Whitespace and editing
`Space` `Enter` `Tab` `Backspace`

### Navigation
`↑` `↓` `←` `→` `Home` `End` `Page Up` `Page Down` `Insert` `Delete`

### Numpad
`Num 0` – `Num 9`, `Num +`, `Num -`, `Num *`, `Num /`, `Num .`, `Num Enter`

### Function keys
`F2` `F3` `F4` `F6` `F7` `F8` `F9` `F10`

> `F1`, `F5`, `F11`, and `F12` are **excluded** because most browsers reserve
> them (help, reload, fullscreen, devtools) and won't reliably hand the event
> to the page.

### Modifiers and locks
`Shift` (left) · `Ctrl` (left) · `Alt` (left) · `Caps Lock`

> Only the left-hand modifiers are used as *targets* so the on-screen prompt
> is unambiguous. The right-hand modifiers, as well as `Shift`, `Ctrl`, `Alt`,
> and `Meta` in general, are still **detected** if you happen to press them.

### Notes on browser-reserved keys
Some keys are partially or wholly intercepted by the browser or the operating
system (e.g. `Escape` exits fullscreen, `Meta`/`Super` opens the system menu
on many platforms, `F11`/`F12` toggle fullscreen and devtools). The page calls
`preventDefault()` for keys in its target pool, but it cannot override OS-level
shortcuts.

## Files

| File                  | Purpose                              |
|-----------------------|--------------------------------------|
| `index.html`          | Markup and DOM hooks                 |
| `style.css`           | Layout, colors, font registration    |
| `script.js`           | Reaction-time state machine          |
| `Zeequada-Regular.otf`| Display font                         |
| `LICENSE`             | GNU GPL v3.0 license text            |

## License

Copyright (C) 2026

This program is free software: you can redistribute it and/or modify it under
the terms of the **GNU General Public License, version 3**, as published by
the Free Software Foundation.

This program is distributed in the hope that it will be useful, but **WITHOUT
ANY WARRANTY**; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE. See the [GNU General Public License](LICENSE)
for more details.

The bundled font `Zeequada-Regular.otf` is distributed under its own license
terms; consult its author for redistribution rights outside this project.
