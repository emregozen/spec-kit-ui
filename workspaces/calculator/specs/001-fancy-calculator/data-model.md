# Data Model: Fancy Calculator

**Phase**: 1 — Design
**Date**: 2026-06-27
**Feature**: 001-fancy-calculator

All data is client-side only. No backend. No database. Two persistence tiers:
- **In-memory** (lost on page reload): expression state, history
- **localStorage** (persists across sessions): theme preference

---

## Entities

### 1. Expression

Represents the expression currently being built or displayed.

| Field | Type | Description |
|-------|------|-------------|
| `displayString` | `string` | Human-readable expression shown in the top display line. Uses `×`, `÷`, `√(`, function names. Max display length unlimited; UI scrolls horizontally. |
| `evalString` | `string` | Derived from `displayString` via `prepareForEval()`. Uses math.js syntax (`*`, `/`, `sqrt(`, etc.). Never stored separately; always computed on demand before evaluation. |
| `result` | `string \| null` | The evaluated result as a formatted string, or `null` before first evaluation. |
| `errorMessage` | `string \| null` | Friendly error string (`"Cannot divide by zero"` / `"Invalid input"`), or `null` when no error. |
| `isResult` | `boolean` | `true` after `=` is pressed and a result is showing. Pressing a digit when `isResult` is `true` starts a fresh expression; pressing an operator continues from the result. |

**State transitions**:
```
EMPTY → (digit pressed) → BUILDING
BUILDING → (= pressed, valid) → RESULT
BUILDING → (= pressed, invalid) → ERROR
RESULT → (digit pressed) → BUILDING (fresh)
RESULT → (operator pressed) → BUILDING (continues from result)
ERROR → (any button except =) → BUILDING (fresh) or EMPTY (AC)
ANY → (AC pressed) → EMPTY
```

---

### 2. CalculationRecord

Represents one completed calculation stored in session history.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `number` | Auto-incrementing integer. Assigned at record creation time; never reused within a session. Used as React-style key for DOM list rendering. |
| `expression` | `string` | The `displayString` at time of evaluation (human-readable, e.g., `"3 + 4 × 2"`). |
| `result` | `string` | The formatted result string at time of evaluation (e.g., `"11"`). |
| `timestamp` | `Date` | JS `Date` object at the moment `=` was pressed. Used to compute relative display text ("just now", "2 min ago"). |

**Constraints**:
- Maximum 50 records. When a 51st is added, the oldest (last in array) is removed.
- Records are stored newest-first (index 0 = most recent).
- Error results are NOT stored in history (only successful evaluations are recorded).
- History is cleared by the user (trash icon) or implicitly on page reload.

---

### 3. ThemePreference

Scalar preference value. Not a structured object.

| Value | Meaning |
|-------|---------|
| `'light'` | Light mode active |
| `'dark'` | Dark mode active |

**Persistence**:
- `localStorage` key: `"calculator-theme"`
- On page load: read this key; if absent, resolve from `prefers-color-scheme` media query; if media query also unavailable, default to `'light'`
- Written to `localStorage` on every toggle

---

## Application State

The full in-memory state of the running app:

```js
AppState = {
  // Current expression
  expression: {
    displayString: '',   // string
    result: null,        // string | null
    errorMessage: null,  // string | null
    isResult: false,     // boolean
  },

  // Session history (newest first, max 50 entries)
  history: [],           // CalculationRecord[]

  // UI state
  historyPanelOpen: false,  // boolean; user-controlled panel visibility
  theme: 'light',           // ThemePreference; initialized from localStorage

  // Internal counter for CalculationRecord IDs
  _nextHistoryId: 1,        // number
}
```

---

## Display Formatting Rules

These rules govern how the `result` field of `Expression` is formatted before display:

| Condition | Display |
|-----------|---------|
| Integer result | No decimal point (e.g., `42`, not `42.0`) |
| Decimal result | Up to 10 significant figures, trailing zeros stripped |
| Very large / very small | Scientific notation via math.js `auto` mode |
| `Infinity` | `"Cannot divide by zero"` (treated as error) |
| `NaN` | `"Invalid input"` (treated as error) |
| Complex result (e.g., `√(-1)`) | `"Invalid input"` (math.js throws; caught as error) |

---

## Symbol Mapping (Display ↔ Eval)

`prepareForEval(displayString)` applies these substitutions in order:

| Display | Eval (math.js) |
|---------|----------------|
| `×` | `*` |
| `÷` | `/` |
| `√(` | `sqrt(` |
| `^` | `^` (already valid in math.js) |
| `sin(` | `sin(` (remapped to degree-mode in scope) |
| `cos(` | `cos(` (remapped to degree-mode in scope) |
| `tan(` | `tan(` (remapped to degree-mode in scope) |
| `ln(` | `log(` (math.js `log` is natural log) |

---

## Validation Rules

| Rule | Details |
|------|---------|
| Empty expression + `=` | Silent no-op; no error state, no history entry |
| Division by zero | Detected by `Infinity` result or math.js throw; display `"Cannot divide by zero"` |
| Invalid domain | Detected by math.js throw (e.g., `sqrt(-1)`); display `"Invalid input"` |
| Consecutive operators | Last operator in `displayString` is replaced in-place; no error |
| Max history | Enforced in `history.js` on every `add()` call |
| Long expressions | No length limit; display scrolls horizontally per design.md |
