# Module Contracts: Fancy Calculator

**Phase**: 1 — Design
**Date**: 2026-06-27
**Feature**: 001-fancy-calculator

These contracts define the public interface of each JavaScript module in `src/`. Implementers MUST NOT change module boundaries or public signatures without updating this document and `plan.md`.

All modules use ES module syntax (`export`/`import`). No globals. No side effects on import except where noted.

---

## `src/calculator.js`

Expression evaluation. Pure functions only. No DOM access. No side effects.

```js
/**
 * Evaluate a display-format expression string.
 *
 * @param {string} displayString - Expression using display symbols (×, ÷, √(, etc.)
 * @returns {{ result: string, error: string | null }}
 *   result  — formatted result string (e.g. "579", "0.5") on success; empty string on error
 *   error   — friendly error message on failure; null on success
 *
 * Empty displayString returns { result: '', error: null } (silent no-op).
 * Infinity result returns { result: '', error: 'Cannot divide by zero' }.
 * NaN / domain error / parse error returns { result: '', error: 'Invalid input' }.
 */
export function evaluate(displayString) {}

/**
 * Transform a display-format expression string into math.js eval syntax.
 * Used internally by evaluate(); exported for testing.
 *
 * @param {string} displayString
 * @returns {string} evalString
 */
export function prepareForEval(displayString) {}

/**
 * Format a numeric result value for display.
 * Strips trailing zeros; uses scientific notation for very large/small values.
 * Up to 10 significant figures.
 *
 * @param {number} value
 * @returns {string}
 */
export function formatResult(value) {}
```

---

## `src/history.js`

Session history management. In-memory array. No DOM access. No persistence.

```js
/**
 * Add a completed calculation to history (newest first).
 * Automatically evicts oldest entry when history exceeds 50 items.
 *
 * @param {string} expression - Human-readable expression (display format)
 * @param {string} result     - Formatted result string
 * @returns {CalculationRecord} The newly created record
 */
export function addRecord(expression, result) {}

/**
 * Return all history records, newest first.
 *
 * @returns {CalculationRecord[]}
 */
export function getRecords() {}

/**
 * Remove all history records.
 *
 * @returns {void}
 */
export function clearRecords() {}

/**
 * Return the number of history records currently stored.
 *
 * @returns {number}
 */
export function count() {}

// CalculationRecord shape (not exported as class; treated as plain object):
// {
//   id: number,          — auto-incrementing, unique within session
//   expression: string,  — display-format expression
//   result: string,      — formatted result
//   timestamp: Date,     — time of evaluation
// }
```

---

## `src/theme.js`

Theme preference management and persistence. Has side effect on import: reads `localStorage` and applies saved theme to the DOM immediately (to prevent FOUC).

```js
/**
 * (Called automatically on module import)
 * Read saved theme from localStorage; fall back to prefers-color-scheme; default 'light'.
 * Sets document.documentElement.dataset.theme accordingly.
 */
// Side effect on import — intentional, documented.

/**
 * Toggle between 'light' and 'dark' themes.
 * Updates DOM attribute and persists to localStorage.
 *
 * @returns {'light' | 'dark'} The new active theme
 */
export function toggle() {}

/**
 * Return the currently active theme.
 *
 * @returns {'light' | 'dark'}
 */
export function current() {}

/**
 * Set an explicit theme value.
 * Updates DOM attribute and persists to localStorage.
 *
 * @param {'light' | 'dark'} theme
 * @returns {void}
 */
export function set(theme) {}
```

---

## `src/keyboard.js`

Keyboard event handling. Depends on `calculator.js`, `history.js`, and dispatches custom events for `ui.js` to consume. Has side effect on import: registers `document` keydown listener.

```js
/**
 * (Called automatically on module import)
 * Attaches a keydown listener to document.
 * Maps keys to calculator actions and dispatches custom DOM events.
 */
// Side effect on import — intentional, documented.

/**
 * Custom events dispatched on document:
 *
 * 'calculator:input'
 *   detail: { token: string }
 *   Fired when a printable token should be appended to the expression.
 *   token is the display-format symbol (e.g. '7', '+', '×', '√(', 'sin(').
 *
 * 'calculator:evaluate'
 *   detail: {}
 *   Fired when Enter or '=' is pressed.
 *
 * 'calculator:clear'
 *   detail: {}
 *   Fired when Escape or Delete is pressed.
 *
 * 'calculator:backspace'
 *   detail: {}
 *   Fired when Backspace is pressed.
 *
 * 'calculator:key-highlight'
 *   detail: { key: string }
 *   Fired for every handled keypress; key is the raw keyboard key value.
 *   ui.js uses this to apply the pressed animation to the matching on-screen button.
 */
```

---

## `src/ui.js`

All DOM reads and writes. No business logic. Reacts to:
1. Calls from `main.js` (button click handlers wired at startup)
2. Custom events from `keyboard.js`

```js
/**
 * Initialize the UI: query DOM elements, bind button click listeners,
 * subscribe to custom keyboard events.
 * Must be called once after DOMContentLoaded.
 *
 * @param {object} deps — injected dependencies
 * @param {Function} deps.onInput    — called with (token: string) on button press or keyboard input
 * @param {Function} deps.onEvaluate — called with no args when = is pressed
 * @param {Function} deps.onClear    — called with no args when AC is pressed
 * @param {Function} deps.onBackspace — called with no args when backspace
 * @param {Function} deps.onHistoryItemClick — called with (result: string) when history entry clicked
 * @param {Function} deps.onHistoryClear     — called with no args when trash icon clicked
 * @param {Function} deps.onThemeToggle      — called with no args when sun/moon icon clicked
 */
export function init(deps) {}

/**
 * Render a new expression state to the display.
 *
 * @param {object} state
 * @param {string}      state.displayString  — expression line text
 * @param {string|null} state.result         — result line text; null clears the line
 * @param {string|null} state.errorMessage   — error text; null clears error state
 * @param {boolean}     state.isResult       — if true, apply result-visible styling
 */
export function renderExpression(state) {}

/**
 * Render the full history panel contents.
 *
 * @param {CalculationRecord[]} records — full history array, newest first
 */
export function renderHistory(records) {}

/**
 * Update the history panel toggle badge count.
 *
 * @param {number} count
 */
export function renderHistoryCount(count) {}

/**
 * Trigger the shake animation on the display (used for errors).
 */
export function shakeDisplay() {}

/**
 * Apply the button-press animation to the on-screen button
 * corresponding to the given key.
 *
 * @param {string} key — raw keyboard key value (e.g. '7', 'Enter', '*')
 */
export function highlightKey(key) {}

/**
 * Toggle history panel open/closed.
 * Optionally force a specific state.
 *
 * @param {boolean} [forceOpen]
 */
export function toggleHistoryPanel(forceOpen) {}
```

---

## `src/main.js`

App bootstrap. Wires all modules together. No business logic of its own.

**Responsibilities**:
1. Import all modules (side effects fire: theme applied, keyboard listener attached)
2. Call `ui.init(deps)` with handler functions that delegate to `calculator.js`, `history.js`, `theme.js`
3. Render initial state

This module is not exported; it is the Vite entry point.

---

## Module Dependency Graph

```
main.js
├── calculator.js   (no deps)
├── history.js      (no deps)
├── theme.js        (no deps; touches DOM/localStorage)
├── keyboard.js     (dispatches events; no direct dep on other modules)
└── ui.js           (no business logic deps; receives callbacks from main.js)
```

`keyboard.js` and `ui.js` communicate exclusively via custom DOM events — they do not import each other.
