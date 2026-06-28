# Implementation Plan: Fancy Calculator

**Branch**: `001-fancy-calculator` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-fancy-calculator/spec.md`

## Summary

Build a single-page, fully client-side calculator web app with basic arithmetic, scientific functions (sin, cos, tan, ln, √, ^), a collapsible session history panel, light/dark theme toggle with localStorage persistence, and full keyboard support. The UI is visually polished with CSS animations, a red `=` button, responsive layout, and graceful error handling. No backend is required; the app is a static HTML/CSS/JS bundle served directly. See [research.md](./research.md) for all technical decisions and [design.md](./design.md) for UX/interaction specifications.

---

## Technical Context

**Language/Version**: HTML5 / CSS3 / JavaScript ES2022 (no TypeScript; pure vanilla for zero build-step complexity)

**Primary Dependencies**:
- `math.js` v13 — safe expression evaluation, scientific functions, degree-mode trig
- `Vite` v6 — dev server with HMR, production bundling
- `Playwright` v1.x — end-to-end browser tests

**Storage**:
- `localStorage` key `calculator-theme` — theme preference persistence
- In-memory `Array` — session history (intentionally lost on page reload per spec)

**Testing**: Playwright for e2e; no unit test framework (logic is thin; e2e covers acceptance scenarios directly)

**Target Platform**: Modern desktop and mobile browsers (Chrome 120+, Firefox 120+, Safari 17+); no IE/legacy support

**Project Type**: Static SPA (single HTML page, bundled JS/CSS via Vite)

**Performance Goals**:
- Button interaction feedback: < 100ms (CSS animation, no JS rendering path)
- Page load to interactive: < 3 seconds on broadband
- Expression evaluation: < 50ms (math.js synchronous call, no async needed)

**Constraints**:
- No backend, no network calls at runtime (all static assets)
- History capped at 50 entries (oldest silently removed when 51st added)
- Trig angles always in degrees for v1; radian toggle is out of scope
- `localStorage` is the only persistence mechanism; IndexedDB/cookies not used

**Scale/Scope**: Single-user, single-session, single page; no multi-tab coordination needed

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution contains template placeholders (not yet filled in for this project). The persona principles in the constitution **do** apply:

| Principle | Check | Notes |
|-----------|-------|-------|
| UX above all | ✓ PASS | All stack choices made to serve the UX vision in design.md; math.js chosen partly because it supports the "auto-close parenthesis" pattern safely |
| Architect decides once | ✓ PASS | All stack, storage, theming, and module boundaries decided here; implementers must not improvise |
| Developer follows the plan | ✓ PASS | Implementation artifact (tasks.md) will reference this plan |
| Tester is honest | ✓ PASS | Playwright e2e covers all acceptance scenarios; gaps noted in quickstart.md |

**No gate violations. Proceed.**

*Post-design re-check (Phase 1)*: No new violations introduced. Contracts align with spec requirements; data model covers all named entities.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-fancy-calculator/
├── plan.md          ← this file
├── research.md      ← tech decisions (Phase 0)
├── data-model.md    ← entities & state (Phase 1)
├── quickstart.md    ← validation guide (Phase 1)
├── contracts/
│   └── modules.md   ← JS module interfaces (Phase 1)
├── tasks.md         ← implementation tasks (/speckit-tasks, not yet created)
├── design.md        ← UX/interaction spec (/speckit-design output)
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
index.html                  ← single HTML entry point
src/
├── main.js                 ← app bootstrap; wires modules together
├── calculator.js           ← expression evaluation (wraps math.js)
├── history.js              ← session history state (in-memory array)
├── theme.js                ← theme toggle & localStorage persistence
├── keyboard.js             ← keyboard event → calculator action mapping
├── ui.js                   ← all DOM reads/writes; no logic
└── styles/
    ├── main.css            ← layout, button grid, display, history panel
    ├── themes.css          ← CSS custom properties for light and dark themes
    └── animations.css      ← button press, result fade, shake, history slide-in
tests/
└── e2e/
    ├── arithmetic.spec.js
    ├── scientific.spec.js
    ├── history.spec.js
    ├── theme.spec.js
    └── keyboard.spec.js
vite.config.js
package.json
```

**Structure Decision**: Option 1 (single project). No backend. All logic is client-side JS split into single-responsibility modules. `ui.js` is the only file that touches the DOM — all other modules are pure functions/classes, making them trivially testable in isolation if needed.

---

## Architecture Decisions (record for implementers)

### Expression Evaluation

Use `math.js` `evaluate()` with a custom scope that maps `sin`/`cos`/`tan` to degree-mode variants:

```js
import { create, all } from 'mathjs'
const math = create(all)
const DEG = Math.PI / 180
const scope = {
  sin: x => Math.sin(x * DEG),
  cos: x => Math.cos(x * DEG),
  tan: x => Math.tan(x * DEG),
}
math.evaluate(expression, scope)
```

The `expression` string is built by the UI (user button presses + keyboard input) and passed to this evaluator verbatim. `ln` maps to `math.js`'s built-in `log`. `√` maps to `sqrt`.

Forbidden: `eval()`, `Function()`, or any dynamic code execution outside math.js.

### Display String vs. Evaluated String

The expression displayed to the user uses readable symbols (`×`, `÷`, `√`, `^`). Before calling `math.evaluate()`, a pre-processing step normalizes to math.js syntax (`*`, `/`, `sqrt(`, `^`). This mapping is one-directional (display → eval); the display string is never reconstructed from the eval string.

### Theme System

- CSS custom properties defined on `:root` (light defaults) and `[data-theme="dark"]` override block
- `theme.js` sets `document.documentElement.dataset.theme = 'dark'` and writes to `localStorage`
- On page load, `theme.js` reads `localStorage` before first paint to avoid FOUC (Flash of Unstyled Content)

### History

- Module-level `Array` of `CalculationRecord` objects, max 50 entries
- Newest entries unshifted to index 0; when length exceeds 50, `pop()` the oldest
- No persistence; intentionally cleared on page reload

### Keyboard Mapping

| Key(s) | Action |
|--------|--------|
| `0–9`, `.` | Append digit/decimal |
| `+`, `-` | Append operator |
| `*` | Append `×` |
| `/` | Append `÷` |
| `(`, `)` | Append parenthesis |
| `Enter`, `=` | Evaluate |
| `Escape`, `Delete` | Clear (AC) |
| `Backspace` | Delete last character |

`keyboard.js` dispatches synthetic button-highlight events so `ui.js` can animate the corresponding on-screen button, bridging keyboard and visual feedback.

### Error Handling

`calculator.js` wraps `math.evaluate()` in try/catch and categorizes errors:

| Condition | Display text |
|-----------|-------------|
| Division by zero | `Cannot divide by zero` |
| Invalid domain (√ of negative, log of ≤0) | `Invalid input` |
| Syntax/parse error | `Invalid input` |
| Empty expression | (no-op; display stays at `0`) |

Error text is styled in amber; the display region receives a one-shot shake CSS class.

### Floating-Point Display

Results are formatted with `math.js`'s `format()` at 10 significant figures with trailing-zero stripping:
```js
math.format(result, { notation: 'auto', precision: 10 })
```

### Responsive Layout

- **Mobile** (< 640px): History panel is a bottom sheet that slides up
- **Desktop** (≥ 640px): History panel is a right-side column
- CSS `@media` query drives the layout switch; no JS breakpoint detection

### DEG Indicator

A static, non-interactive `DEG` label is displayed in the expression area. It is a plain `<span>` with muted styling — not a button, not a toggle placeholder.

### Accessibility

- All buttons: `aria-label` with descriptive text (e.g., `"divide"`, `"square root"`, `"equals"`)
- Display lines: `aria-live="polite"`
- History items: `aria-label="expression: …, result: …"`
- Focus ring: 2px solid accent color
- `prefers-reduced-motion`: animations disabled entirely when active

---

## Open Questions (resolved from design.md)

1. **DEG indicator**: Static `<span>` label only; no toggle UI. Architect confirmed.
2. **History vs. theme storage collision**: History is in-memory only. `localStorage` key `calculator-theme` is the sole persisted key. No collision possible.

---

## Complexity Tracking

No constitution violations. Table not required.
