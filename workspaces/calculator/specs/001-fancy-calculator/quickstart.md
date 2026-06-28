# Quickstart & Validation Guide: Fancy Calculator

**Phase**: 1 — Design
**Date**: 2026-06-27
**Feature**: 001-fancy-calculator

This guide describes how to run the app and validate that each acceptance scenario from [spec.md](./spec.md) passes. It is a validation/run guide, not an implementation reference — see [plan.md](./plan.md) and [contracts/modules.md](./contracts/modules.md) for implementation details.

---

## Prerequisites

- Node.js 20+ and npm installed
- Repository cloned and checked out on branch `001-fancy-calculator`

---

## Setup

```bash
npm install
```

---

## Run the App (Development)

```bash
npm run dev
```

Opens at `http://localhost:5173` (or next available port). Hot module reloading is active.

---

## Run the App (Production Preview)

```bash
npm run build && npm run preview
```

Serves the production bundle at `http://localhost:4173`.

---

## Run the Test Suite

```bash
npm test
```

Runs all Playwright e2e tests in headless Chromium. To run with UI:

```bash
npm run test:ui
```

To run a specific test file:

```bash
npx playwright test tests/e2e/arithmetic.spec.js
```

---

## Manual Validation Scenarios

Run these against the development server at `http://localhost:5173`.

### User Story 1 — Basic Arithmetic (P1)

**SC-1a: Standard addition**
1. Load the page
2. Click: `1`, `2`, `3`, `+`, `4`, `5`, `6`, `=`
3. **Expected**: Result line shows `579`

**SC-1b: Multiplication**
1. Click: `8`, `×`, `7`, `=`
2. **Expected**: Result line shows `56`

**SC-1c: Division**
1. Click: `1`, `0`, `0`, `÷`, `4`, `=`
2. **Expected**: Result line shows `25`

**SC-1d: Button animation**
1. Click any button
2. **Expected**: Button visually scales down (~93%) and springs back; animation completes within 100ms

**SC-1e: Division by zero**
1. Click: `9`, `÷`, `0`, `=`
2. **Expected**: Result line shows `Cannot divide by zero` in amber color; display shakes once

**SC-1f: Equals button styling** (SC-009)
1. Load the page without any interaction
2. **Expected**: The `=` button is visually red (distinct from all other buttons)

---

### User Story 2 — Scientific Functions (P2)

**SC-2a: Square root**
1. Click: `√`, `4`, `9`, `)`, `=`
2. **Expected**: Result shows `7`

**SC-2b: Exponentiation**
1. Click: `2`, `^`, `1`, `0`, `=`
2. **Expected**: Result shows `1024`

**SC-2c: Sine in degrees**
1. Click: `sin`, `3`, `0`, `)`, `=`
2. **Expected**: Result shows `0.5`

**SC-2d: Order of operations**
1. Click: `3`, `+`, `4`, `×`, `2`, `=`
2. **Expected**: Result shows `11` (not `14`)

---

### User Story 3 — History (P3)

**SC-3a: History panel populates**
1. Perform three calculations (any)
2. Click the "History" toggle
3. **Expected**: All three entries appear in reverse-chronological order (newest at top), each showing expression and result

**SC-3b: History recall**
1. With history panel open, click any entry
2. **Expected**: That entry's result value is placed into the display's expression line

**SC-3c: History clear**
1. With history panel open and at least one entry, click the trash icon
2. **Expected**: History list empties immediately (no confirmation modal); badge resets to `History · 0`

---

### User Story 4 — Dark/Light Mode (P4)

**SC-4a: Toggle to dark mode**
1. While in light mode, click the sun/moon icon
2. **Expected**: Entire interface switches to dark mode within 200ms; no page reload

**SC-4b: Persistence**
1. Switch to dark mode
2. Close the tab and reopen `http://localhost:5173`
3. **Expected**: Page opens in dark mode without any toggle action

**SC-4c: Toggle back**
1. Switch back to light mode; close and reopen
2. **Expected**: Page opens in light mode

---

### User Story 5 — Keyboard Input (P2)

**SC-5a: Keyboard arithmetic**
1. Load the page (do not click anything)
2. Type: `1`, `5`, `*`, `3`, `Enter`
3. **Expected**: Result shows `45`; no mouse interaction needed

**SC-5b: Key highlight**
1. While typing, observe on-screen buttons
2. **Expected**: Each key pressed causes the corresponding on-screen button to animate (scale + highlight) within 100ms

**SC-5c: Clear with Escape**
1. Type some digits, then press `Escape`
2. **Expected**: Display clears

**SC-5d: Backspace**
1. Type `1`, `2`, `3`, then press `Backspace`
2. **Expected**: Expression shows `12`

---

### Edge Cases

**EC-1: Empty display + equals**
1. Load page (or press `AC` to clear)
2. Press `=` (keyboard or button)
3. **Expected**: Nothing happens; no error; display stays at `0`

**EC-2: Consecutive operators**
1. Click: `5`, `+`, `×`
2. **Expected**: Expression shows `5 ×` (the `+` was silently replaced by `×`); no error shown

**EC-3: Invalid domain**
1. Click: `√`, `(`, `-`, `1`, `)`, `=`  (or type `sqrt(-1)` equivalent)
2. **Expected**: Result shows `Invalid input` in amber; display shakes

**EC-4: Long expression**
1. Enter a very long sequence of digits and operators (20+ characters)
2. **Expected**: Expression line scrolls horizontally; layout does not break; rightmost content is always visible

**EC-5: History overflow (50+ entries)**
1. Perform 51 calculations
2. **Expected**: History shows only the 50 most recent; the oldest entry is gone

**EC-6: Floating-point display**
1. Click: `0`, `.`, `1`, `+`, `0`, `.`, `2`, `=`
2. **Expected**: Result shows `0.3` (not `0.30000000000000004`)

---

## Expected Outcomes Summary

| Scenario | Pass Criterion |
|----------|---------------|
| Basic arithmetic | Correct results; button animations within 100ms |
| Scientific functions | √, ^, sin, cos, tan, ln all return correct values in degrees mode |
| Order of operations | `3 + 4 × 2 = 11` |
| Division by zero | Friendly error message; amber color; shake animation |
| History | Session-scoped; reverse-chronological; clickable; clearable |
| Dark mode | Toggle works; preference persists in localStorage; no FOUC |
| Keyboard | Full operation without mouse; key highlights within 100ms |
| Floating-point | Results displayed to ≤10 sig figs; no IEEE 754 artifacts |
| Equals button | Red; visually distinct from all other buttons |
| Page load | Interactive within 3 seconds on broadband |

---

## Known Validation Gaps

- **Animation timing (100ms)**: Manual validation by eye is subjective. Playwright can verify that CSS classes are applied, but measuring the exact render-to-completion time requires performance tooling outside the standard test suite.
- **Screen reader announcement**: `aria-live="polite"` behavior requires manual testing with VoiceOver or NVDA; Playwright does not simulate screen readers.
- **`prefers-reduced-motion`**: Requires OS-level setting change to validate; not covered by automated tests.
- **Page load timing (< 3s)**: Best validated with browser DevTools Lighthouse; not a Playwright e2e assertion.
