# Research: Fancy Calculator

**Phase**: 0 — Technical Research
**Date**: 2026-06-27
**Feature**: 001-fancy-calculator

---

## 1. Expression Evaluation Library

**Decision**: Use `math.js` v13

**Rationale**:
- Supports all required scientific functions out of the box: `sqrt`, `sin`, `cos`, `tan`, `log` (natural log), and `^` (exponentiation)
- Evaluates operator precedence correctly (PEMDAS/BODMAS)
- Sandboxed — does not use `eval()` or `Function()` constructor; safe for user-supplied input
- Degree-mode trig is achievable by injecting custom `sin`/`cos`/`tan` into a scope object, overriding the built-in radian defaults
- Mature (14+ years), widely used (millions of weekly npm downloads), actively maintained
- `format()` utility handles significant-figure display and trailing-zero stripping natively

**Alternatives considered**:
- `eval()` / `Function()`: Rejected — arbitrary code execution risk; XSS vector
- Custom recursive descent parser: Rejected — significant implementation effort, high bug risk for edge cases (nested parentheses, unary minus, multi-character function names), no benefit over math.js for this scope
- `nerdamer`: Rejected — primarily a symbolic math library; heavier than math.js for this use case

---

## 2. Frontend Framework

**Decision**: Vanilla JavaScript ES2022 (no framework)

**Rationale**:
- The app is a single, static page with a fixed layout and a small number of interactive components (display, buttons, history list, theme toggle). No component tree, routing, or complex state graph is needed.
- Vanilla JS eliminates framework churn risk (React/Vue major versions) and keeps the bundle small (< 50kB gzipped target)
- DOM manipulation is centralized in `ui.js`; all other modules are pure functions — this already enforces the separation-of-concerns that frameworks provide structurally
- Easier to audit for accessibility (no shadow DOM, no hydration edge cases)

**Alternatives considered**:
- React 19: Rejected — adds ~40kB runtime for no structural benefit; JSX compilation step adds complexity; overkill for a fixed single-page layout
- Vue 3 (Composition API): Rejected — same reasoning as React; reactivity system is unnecessary when state changes are discrete and directly mapped to DOM updates
- Svelte: Rejected — compile-time approach is interesting, but adds unfamiliar tooling for a simple app; community/support narrower for future maintainers

---

## 3. Build Tool

**Decision**: Vite v6

**Rationale**:
- Zero-config entry point (`index.html` at root, `src/main.js`)
- Native ES module dev server with HMR — no cold-start bundling during development
- Production build produces a static asset bundle suitable for any CDN/static host
- Minimal configuration needed; `vite.config.js` is ~10 lines for this project
- Standard choice aligned with vanilla JS + modern browser targets

**Alternatives considered**:
- No build tool (raw `<script type="module">` in HTML): Rejected — would require CDN-sourced math.js (less reliable, no tree-shaking) and prevents production minification; also no dev-server HMR
- Webpack 5: Rejected — significantly more configuration overhead for the same output
- Parcel: Acceptable alternative, but Vite is now the de-facto standard and has better math.js tree-shaking

---

## 4. Testing Approach

**Decision**: Playwright v1.x for end-to-end tests only

**Rationale**:
- All acceptance scenarios in the spec are browser-level interactions (click buttons, observe display text, verify CSS classes). Playwright covers these directly against a real browser, providing the highest confidence.
- The calculator's logic layer (`calculator.js`) is thin (wraps math.js) — unit testing it would mostly test math.js itself, not our code
- Playwright's `expect` assertions match the spec language naturally (e.g., `expect(display).toHaveText('579')`)
- No jsdom/happy-dom approximations needed — tests run against Chromium (real browser layout, real CSS transitions)

**Alternatives considered**:
- Vitest + jsdom: Would cover logic unit tests well but cannot verify CSS animations, focus states, or keyboard-highlight timing (< 100ms requirement). Rejected as primary framework; could be added later for isolated logic tests if complexity grows.
- Cypress: Acceptable alternative to Playwright; Playwright chosen for faster parallel execution and better mobile viewport emulation

---

## 5. Theme System Implementation

**Decision**: CSS custom properties on `[data-theme]` attribute with `localStorage` persistence; FOUC prevention via inline script

**Rationale**:
- CSS custom properties enable the 200ms crossfade transition with a single `transition: background-color 200ms, color 200ms` rule — no JS involved in the visual transition
- `document.documentElement.dataset.theme` is set before any rendering frame completes (via a tiny inline `<script>` before `</head>`) to eliminate Flash of Unstyled Content
- One `localStorage` key (`calculator-theme`) with values `'light'` | `'dark'`; default falls back to `prefers-color-scheme` media query if no saved preference exists

**Alternatives considered**:
- CSS class toggle (`.dark-mode` on body): Functionally equivalent; `data-theme` attribute is more semantically explicit and aligns with modern CSS practice
- `prefers-color-scheme` only (no toggle): Rejected — spec requires explicit user toggle with manual preference persistence

---

## 6. Expression Input Strategy

**Decision**: String-accumulation model with display-string / eval-string duality

**Rationale**:
- The display string uses human-readable symbols (`×`, `÷`, `√(`, `^`); the eval string uses math.js syntax (`*`, `/`, `sqrt(`, `**`)
- This approach is simple to implement and debug: the display string is always the source of truth; the eval string is derived by a single `prepareForEval(displayStr)` transform function
- Auto-opening parenthesis after `√`, `sin`, `cos`, `tan`, `ln` is implemented by appending the function token + `(` as a unit when the button is pressed

**Consecutive operator replacement**: If the last token of the display string is an operator, pressing another operator replaces it in-place (no error state).

**Alternatives considered**:
- Token-array model (store expression as `[Token]` objects): More powerful for cursor movement and editing, but out of scope for v1; adds significant complexity
- AST-based input: Rejected — overkill; math.js already handles parsing internally

---

## 7. Floating-Point Display

**Decision**: `math.format(result, { notation: 'auto', precision: 10 })` with manual trailing-zero stripping

**Rationale**:
- `notation: 'auto'` uses fixed notation for numbers in a readable range and switches to scientific notation for very large/small values, avoiding ugly output like `1e-15`
- `precision: 10` gives 10 significant figures, which is sufficient for all scientific calculator use cases and avoids displaying IEEE 754 artifacts (e.g., `0.1 + 0.2 = 0.3` not `0.30000000000000004`)
- math.js `format()` already strips trailing zeros in `auto` mode

---

## 8. History Overflow Strategy

**Decision**: Max 50 entries; silent oldest-entry eviction

**Rationale**: Spec explicitly defines 50-entry cap with silent oldest-removal. No pagination needed — the panel is scrollable. This is implemented in `history.js` with a simple `Array.unshift()` + length check + `Array.pop()`.

---

## 9. Keyboard Accessibility — Focus Management

**Decision**: Calculator captures global `keydown` events on `document`; no explicit focus required from user

**Rationale**:
- The spec states "no click-to-focus required" — the calculator should accept keyboard input immediately on page load
- `document.addEventListener('keydown', handler)` achieves this; no autofocus hack needed
- Tab navigation moves through interactive elements in DOM order; `keyboard.js` does not interfere with tab behavior (only handles calculator-specific keys)
- The keyboard highlight (visual echo of key press on on-screen button) is achieved by `keyboard.js` dispatching a custom `calculator:key-highlight` event; `ui.js` listens and applies the CSS animation class

---

## Summary of Resolved Unknowns

| Unknown | Resolution |
|---------|------------|
| Expression evaluation library | math.js v13 |
| Framework | Vanilla JS ES2022 |
| Build tool | Vite v6 |
| Testing framework | Playwright v1.x |
| Theme storage | localStorage key `calculator-theme` |
| History storage | In-memory Array (session only) |
| Degree-mode trig | Custom scope injected into math.evaluate() |
| Float display | math.format() at 10 sig figs |
| Keyboard capture | Global document keydown listener |
| Auto-parenthesis for functions | Append function token + `(` as a unit |
| FOUC prevention | Inline script before </head> reads localStorage |
