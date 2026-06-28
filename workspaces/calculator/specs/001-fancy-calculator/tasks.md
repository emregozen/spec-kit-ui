# Tasks: Fancy Calculator

**Input**: Design documents from `/specs/001-fancy-calculator/`

**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/modules.md ✓

**Tests**: E2e Playwright tests are included as they are explicitly listed in plan.md's project structure and Playwright is a primary dependency.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)
- All tasks include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — installs dependencies, scaffolds config, and creates the HTML entry point. Nothing else can start until this phase is complete.

- [X] T001 Initialize package.json with Vite v6, math.js v13, and Playwright v1.x dependencies (`npm init` + `npm install vite mathjs playwright @playwright/test`)
- [X] T002 [P] Create `vite.config.js` — set `root: '.'`, `build.outDir: 'dist'`, and base config per plan.md
- [X] T003 [P] Create `playwright.config.js` — configure Chromium, baseURL `http://localhost:5173`, test dir `tests/e2e/`
- [X] T004 Create `index.html` — full calculator HTML skeleton: display area (expression line + result line), number/operator button grid with `data-token` and `data-key` attributes, scientific function buttons placeholder, history panel container, theme toggle button, `<script type="module" src="/src/main.js">`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: CSS layout foundation and empty module stubs that all user stories build on. Must complete before any story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Create `src/styles/main.css` — CSS layout skeleton: button grid (`display: grid`), display region, history panel container structure, history toggle button; link from `index.html`
- [X] T006 [P] Create `src/styles/themes.css` — CSS custom properties on `:root` for all design tokens (background, surface, text, accent, button colors); import in `main.css`
- [X] T007 [P] Create `src/styles/animations.css` — placeholder keyframe blocks: `@keyframes btn-press`, `@keyframes shake`, `@keyframes history-slide-in`, `@keyframes result-fade`; import in `main.css`
- [X] T008 Create `src/main.js` — bootstrap: `import` all modules, `DOMContentLoaded` listener that calls `ui.init(deps)` with empty handler stubs, calls `ui.renderExpression` with initial empty state
- [X] T009 [P] Create module stubs for `src/calculator.js`, `src/history.js`, `src/theme.js`, `src/keyboard.js`, `src/ui.js` — each file exports the exact function signatures from `contracts/modules.md` as empty no-op functions (enables parallel story implementation)

**Checkpoint**: Foundation ready — all five module files exist with correct export signatures; `npm run dev` serves `index.html` with the button grid visible.

---

## Phase 3: User Story 1 — Perform Basic Arithmetic (Priority: P1) 🎯 MVP

**Goal**: User can enter numbers and the four basic operators via mouse buttons, press `=`, and see the result — with visible button animations and friendly error messages.

**Independent Test**: Load the page, click buttons to enter `123 + 456 =`, verify result `579` appears. Then enter `9 ÷ 0 =` and verify "Cannot divide by zero" is shown. Verify the `=` button is red.

### Implementation for User Story 1

- [X] T010 [P] [US1] Implement `prepareForEval(displayString)` in `src/calculator.js` — apply symbol-mapping table from `data-model.md`: `×→*`, `÷→/`, `√(→sqrt(`, keep `^` and trig/log tokens as-is
- [X] T011 [P] [US1] Implement `formatResult(value)` in `src/calculator.js` — use `math.format(value, { notation: 'auto', precision: 10 })` with `Infinity`/`NaN` guard
- [X] T012 [US1] Implement `evaluate(displayString)` in `src/calculator.js` — call `prepareForEval()`, pass to `math.evaluate()` with degree-mode scope for basic trig stubs, wrap in try/catch, categorize errors per data-model.md table, return `{ result, error }` (depends on T010, T011)
- [X] T013 [US1] Implement `ui.init(deps)` in `src/ui.js` — query all DOM elements, bind click listeners on number/operator/equals/clear/backspace buttons (call `deps.onInput`, `deps.onEvaluate`, `deps.onClear`, `deps.onBackspace`)
- [X] T014 [US1] Implement `ui.renderExpression(state)` in `src/ui.js` — update expression-line and result-line text content, toggle error-mode CSS class (amber text) when `state.errorMessage` is set, toggle result-visible class when `state.isResult` is true
- [X] T015 [US1] Implement `ui.shakeDisplay()` in `src/ui.js` — add `shake` CSS class to display container, remove it on `animationend`
- [X] T016 [US1] Flesh out `src/styles/animations.css` button-press keyframe — scale button to 0.93 and back in 80ms; add `shake` keyframe (3-cycle horizontal translate); apply via `.btn:active` and JS-added class
- [X] T017 [US1] Style the `=` button red in `src/styles/main.css` — add `.btn-equals { background: var(--color-equals); }` and define `--color-equals` in `themes.css` as red for both themes
- [X] T018 [US1] Wire basic arithmetic in `src/main.js` — implement `onInput(token)` (append token to displayString, call `renderExpression`), `onEvaluate()` (call `calculator.evaluate`, call `renderExpression`, call `shakeDisplay` on error), `onClear()` (reset state), `onBackspace()` (slice displayString)
- [X] T019 [P] [US1] Write Playwright e2e tests in `tests/e2e/arithmetic.spec.js` — cover: `8 × 7 = 56`, `100 ÷ 4 = 25`, `9 ÷ 0` shows "Cannot divide by zero", `=` button has red background, button animation fires within 100ms

**Checkpoint**: User Story 1 is fully functional — basic four-function arithmetic, button animations, red `=` button, and error handling all work without any other story implemented.

---

## Phase 4: User Story 2 — Use Scientific / Advanced Functions (Priority: P2)

**Goal**: User can compute √, ^, sin, cos, tan, ln from the same page, with correct degree-mode trig and operator precedence.

**Independent Test**: Enter `√(144) =` and verify `12`. Enter `sin(90) =` and verify `1`. Enter `3 + 4 × 2 =` and verify `11` (not `14`).

### Implementation for User Story 2

- [X] T020 [US2] Extend `prepareForEval()` in `src/calculator.js` to handle `ln(→log(` substitution (math.js `log` is natural log); verify `^` passes through correctly
- [X] T021 [US2] Complete degree-mode trig scope in `evaluate()` in `src/calculator.js` — inject `{ sin: x => Math.sin(x * DEG), cos: x => Math.cos(x * DEG), tan: x => Math.tan(x * DEG) }` into `math.evaluate()` call
- [X] T022 [US2] Add scientific function buttons to `index.html` — `√(`, `^`, `sin(`, `cos(`, `tan(`, `ln(`, `(`, `)` buttons with appropriate `data-token` values (display symbols) and `aria-label` attributes
- [X] T023 [US2] Update `src/ui.js` `init()` to bind click listeners on scientific buttons, passing their `data-token` value to `deps.onInput`
- [X] T024 [P] [US2] Write Playwright e2e tests in `tests/e2e/scientific.spec.js` — cover: `√(49) = 7`, `2^10 = 1024`, `sin(30) = 0.5`, `3+4×2 = 11` (order of operations), `√(-1)` shows "Invalid input"

**Checkpoint**: Scientific functions all work from the single page with correct degree-mode trig and PEMDAS ordering.

---

## Phase 5: User Story 5 — Use the Calculator via Keyboard (Priority: P2)

**Goal**: User can type numbers, operators, and `Enter` to evaluate; on-screen buttons highlight within 100ms of key press; `Escape`/`Delete` clears; `Backspace` removes last character.

**Independent Test**: Without touching the mouse, type `15 * 3 Enter` and verify `45` on screen. Verify the corresponding on-screen button highlights on each key press.

### Implementation for User Story 5

- [X] T025 [US5] Implement `src/keyboard.js` — attach `document.addEventListener('keydown', handler)` on module import; map keys per plan.md table to display-format tokens; dispatch `CustomEvent` types: `calculator:input`, `calculator:evaluate`, `calculator:clear`, `calculator:backspace`, `calculator:key-highlight` on `document`
- [X] T026 [US5] Implement `ui.highlightKey(key)` in `src/ui.js` — find button whose `data-key` attribute matches `key`, add the button-press CSS class, remove it after 150ms
- [X] T027 [US5] Update `src/ui.js` `init()` to subscribe to `calculator:input`, `calculator:evaluate`, `calculator:clear`, `calculator:backspace` (call corresponding `deps.*` handlers) and `calculator:key-highlight` (call `highlightKey`)
- [X] T028 [US5] Import `src/keyboard.js` in `src/main.js` so the keydown listener attaches at app load (side-effect import per contracts/modules.md)
- [X] T029 [P] [US5] Write Playwright e2e tests in `tests/e2e/keyboard.spec.js` — cover: `15 * 3 Enter = 45`, `Escape` clears display, `Backspace` removes last char, key highlight appears within 100ms, `=` key evaluates

**Checkpoint**: Full keyboard operation works — no mouse needed from page load through expression entry, evaluation, and clear.

---

## Phase 6: User Story 3 — View Calculation History (Priority: P3)

**Goal**: After completing calculations, user sees a history panel with past expressions and results (newest first, max 50), can click an entry to paste its result into the display, and can clear the history.

**Independent Test**: Perform three calculations, open the history panel, verify all three appear newest-first. Click one entry and verify its result populates the input display. Click the trash icon and verify the list empties.

### Implementation for User Story 3

- [X] T030 [US3] Implement `addRecord(expression, result)`, `getRecords()`, `clearRecords()`, `count()` in `src/history.js` — in-memory array, newest-first with `unshift`, evict oldest with `pop` when length > 50, auto-increment `id`, set `timestamp: new Date()`
- [X] T031 [US3] Implement `ui.renderHistory(records)` in `src/ui.js` — clear history list container, generate `<li>` for each record with expression, result, relative timestamp text, `data-result` attribute for click-to-paste, `aria-label`
- [X] T032 [US3] Implement `ui.renderHistoryCount(count)` in `src/ui.js` — update history toggle badge element with count (hide badge at 0)
- [X] T033 [US3] Implement `ui.toggleHistoryPanel(forceOpen)` in `src/ui.js` — toggle `.history-panel--open` CSS class on history container; track open state in module variable
- [X] T034 [US3] Wire history into `src/main.js` — after successful `onEvaluate()`: call `history.addRecord()` and `ui.renderHistory(history.getRecords())` and `ui.renderHistoryCount(history.count())`; implement `onHistoryItemClick(result)` to set displayString to result; implement `onHistoryClear()` to call `history.clearRecords()` and `ui.renderHistory([])` and `ui.renderHistoryCount(0)`; wire history panel toggle button to `ui.toggleHistoryPanel()`
- [X] T035 [US3] Add history slide-in animation in `src/styles/animations.css` — `@keyframes history-slide-in` translating from `translateY(100%)` to `translateY(0)` for mobile and from `translateX(100%)` for desktop; apply via `.history-panel--open` class
- [X] T036 [P] [US3] Write Playwright e2e tests in `tests/e2e/history.spec.js` — cover: three calculations appear newest-first, clicking history entry populates display, trash icon clears list, 51st calculation silently removes oldest

**Checkpoint**: History panel fully functional — records accumulate per session, entry recall works, clear works, 50-entry cap enforced.

---

## Phase 7: User Story 4 — Switch Between Light and Dark Mode (Priority: P4)

**Goal**: User clicks theme toggle to switch between light and dark mode instantly (no reload); preference is saved to `localStorage` and restored on next visit; FOUC is prevented.

**Independent Test**: Toggle to dark mode, close and reopen the page, verify dark theme is applied without re-toggling. Toggle back to light, reload, verify light mode restores.

### Implementation for User Story 4

- [X] T037 [US4] Complete `src/styles/themes.css` — add `[data-theme="dark"]` block overriding all CSS custom properties with dark-mode values; add `transition: background-color 200ms, color 200ms` on `:root` for smooth crossfade
- [X] T038 [US4] Implement `toggle()`, `current()`, `set(theme)` in `src/theme.js` — on module import: read `localStorage.getItem('calculator-theme')`, fall back to `prefers-color-scheme`, default `'light'`; set `document.documentElement.dataset.theme`; `toggle()` flips theme, writes to `localStorage`, updates DOM; `set(theme)` sets explicitly
- [X] T039 [US4] Add FOUC-prevention inline `<script>` in `index.html` before `</head>` — reads `localStorage['calculator-theme']` or `prefers-color-scheme` and synchronously sets `document.documentElement.dataset.theme` before first paint
- [X] T040 [US4] Import `theme.js` in `src/main.js`; implement `onThemeToggle` handler: call `theme.toggle()`, update toggle button icon (sun ↔ moon) based on `theme.current()`
- [X] T041 [P] [US4] Write Playwright e2e tests in `tests/e2e/theme.spec.js` — cover: toggle switches to dark mode (check `data-theme="dark"`), preference persists after page reload, toggle back restores light mode, no FOUC on load with saved dark preference

**Checkpoint**: Theme toggle fully functional with localStorage persistence and FOUC prevention.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsive layout, edge-case UX, and validation scenarios that span all user stories.

- [X] T042 [P] Add `aria-label` attributes to all buttons in `index.html` — e.g., `"divide"`, `"square root"`, `"equals"`, `"clear"`, `"backspace"` per plan.md accessibility section
- [X] T043 [P] Add `aria-live="polite"` to expression display line and result line in `index.html`
- [X] T044 [P] Add `aria-label="expression: …, result: …"` generation to `ui.renderHistory()` in `src/ui.js` using record fields
- [X] T045 [P] Add focus ring CSS to `src/styles/main.css` — `button:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }` for all interactive elements
- [X] T046 Add `@media (prefers-reduced-motion: reduce)` block in `src/styles/animations.css` — set all animation `duration` and `transition` to `0.01ms`
- [X] T047 Add responsive history panel layout to `src/styles/main.css` — below 640px: history panel is a bottom sheet (`position: fixed; bottom: 0; width: 100%`) sliding up; at 640px+: right-side column layout using CSS grid
- [X] T048 [P] Add horizontal-scroll rule for long expressions in `src/styles/main.css` — `overflow-x: auto; white-space: nowrap; scroll-behavior: smooth` on the expression display line
- [X] T049 [P] Add static `<span class="deg-indicator">DEG</span>` to the expression area in `index.html` with muted styling in `main.css` (non-interactive label per plan.md)
- [X] T050 Run all quickstart.md validation scenarios end-to-end (`npx playwright test`) and confirm all pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2 — no other story dependencies
- **US2 (Phase 4)**: Depends on Phase 2; builds on calculator.js from US1 (T010–T012 must be complete)
- **US5 (Phase 5)**: Depends on Phase 2 and US1 UI wiring (T013, T018 must be complete so keyboard events have handlers to call)
- **US3 (Phase 6)**: Depends on Phase 2 and US1 evaluate flow (T018 must be complete so `onEvaluate` exists to hook history into)
- **US4 (Phase 7)**: Depends on Phase 2 only — theme system is independent of all other stories
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no inter-story dependencies
- **US2 (P2)**: Can start after US1 calculator core (T010–T012) — extends `calculator.js` and HTML only
- **US5 (P2)**: Can start after US1 UI is wired (T013, T018) — adds `keyboard.js` and `highlightKey`
- **US3 (P3)**: Can start after US1 evaluate flow (T018) — adds `history.js` and history UI
- **US4 (P4)**: Can start after Phase 2 — fully independent of US1–US5

### Within Each User Story

- Pure logic modules (`calculator.js`, `history.js`, `theme.js`) before UI wiring
- HTML/CSS structure before JS wiring
- `src/main.js` wiring tasks last within each story (depend on module implementations)
- Playwright tests can be written any time within a story phase

### Parallel Opportunities

- T002, T003 can run in parallel with each other (Phase 1)
- T006, T007, T009 can run in parallel (Phase 2)
- T010, T011 can run in parallel within US1 (both touch only calculator.js pure functions)
- T013, T014, T015, T016, T017, T019 can be parallelized where they touch different functions/files
- US2 and US5 can be worked in parallel after US1 (T010–T018) is complete
- US3 and US4 can be worked in parallel after Phase 2 is complete
- All Polish tasks marked [P] can run concurrently

---

## Parallel Example: User Story 1

```bash
# Run in parallel (different functions in same file - no conflicts):
Task T010: Implement prepareForEval() in src/calculator.js
Task T011: Implement formatResult() in src/calculator.js

# Then sequentially (T012 depends on T010 + T011):
Task T012: Implement evaluate() in src/calculator.js

# Run in parallel (different files):
Task T013: Implement ui.init() in src/ui.js
Task T016: Add button-press animation in src/styles/animations.css
Task T017: Style = button red in src/styles/main.css + themes.css

# Then wire together:
Task T018: Wire handlers in src/main.js

# Any time after T013–T018:
Task T019: Write arithmetic.spec.js Playwright tests
```

---

## Parallel Example: After US1 Complete

```bash
# Two developers can work simultaneously:
Developer A → US2: Scientific functions (T020–T024)
Developer B → US5: Keyboard support (T025–T029)

# After both US2 and US5 complete:
Developer A → US3: History panel (T030–T036)
Developer B → US4: Theme system (T037–T041)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T009) — **CRITICAL, blocks everything**
3. Complete Phase 3: User Story 1 (T010–T019)
4. **STOP and VALIDATE**: Run `npx playwright test tests/e2e/arithmetic.spec.js`
5. Functional basic calculator — ship or demo

### Incremental Delivery

1. Setup + Foundational → skeleton visible at `localhost:5173`
2. US1 → Working basic calculator (MVP!)
3. US2 + US5 in parallel → Scientific + keyboard (both P2)
4. US3 → History panel
5. US4 → Theme toggle
6. Polish → Accessibility, responsive layout, validation

### Single-Developer Sequence

```
T001 → T002/T003/T004 → T005 → T006/T007/T008/T009
→ T010/T011 → T012 → T013/T016/T017 → T014/T015 → T018 → T019  [US1 done]
→ T020 → T021 → T022 → T023 → T024                               [US2 done]
→ T025 → T026 → T027 → T028 → T029                               [US5 done]
→ T030 → T031/T032/T033 → T034/T035 → T036                       [US3 done]
→ T037 → T038 → T039 → T040 → T041                               [US4 done]
→ T042/T043/T044/T045 → T046 → T047/T048/T049 → T050             [Polish done]
```

---

## Notes

- **[P]** = different files or non-conflicting functions; safe to run in parallel
- **[US#]** label maps each task to its user story for traceability
- Each user story phase is independently completable and testable
- `src/main.js` wiring tasks within each story should always be last (they tie together the story's modules)
- `contracts/modules.md` is the authoritative interface spec — do not change exported function signatures without updating it
- The `=` button must be red per FR-006a and SC-009 — verify visually after T017
- Do not use `eval()` or `Function()` constructor anywhere — math.js is the only evaluation path
