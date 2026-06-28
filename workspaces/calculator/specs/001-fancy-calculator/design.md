# UX Design: Fancy Calculator

**Feature**: 001-fancy-calculator
**Designed**: 2026-06-26
**Status**: Draft

---

## 1. Experience Summary

This calculator is for anyone who needs to compute — from a student solving trig homework to a professional doing quick mental-math verification. It should feel like a precision instrument: satisfying to touch, visually calm, and unmistakably capable. Every press must feel answered immediately, every result must be readable at a glance, and every advanced function must feel like it belongs rather than an afterthought bolted on. The difference between "functional" and "loveable" here comes down to tactility (animations that make buttons feel physical), spatial clarity (a layout where the eye never hunts for what it needs), and small delights that reward return visits — like history that makes the calculator feel like it remembers you.

---

## 2. Screens / Views

### Main Calculator View (the only screen)

The entire experience lives on one page. The layout is divided into three vertical zones, arranged top-to-bottom:

**Zone A — Display**
A wide, high-contrast display band occupying the top ~25% of the calculator body. It shows two lines:
- The upper, smaller line shows the expression being built (e.g., `3 + 4 × 2`). This text overflows to the left so the user always sees the rightmost characters being typed; the expression scrolls horizontally rather than wrapping, keeping the line height consistent.
- The lower, larger line shows the most recent result (or remains blank before the first evaluation). After evaluation, the result sits prominently at a larger font size.

A theme-toggle icon (sun/moon) sits in the top-right corner of the display band, always visible and reachable in one tap.

**Zone B — Button Grid**
The calculator button grid lives below the display. It is divided into two horizontal sections:

- **Scientific row(s)**: A band of smaller, secondary-styled buttons across the top of the grid for: `sin`, `cos`, `tan`, `ln`, `√`, `^`, `(`, `)`. These are clearly differentiated from the numeric buttons by color — muted/outlined rather than filled — so the grid reads as "numbers first, extras available."
- **Main pad**: A standard calculator layout below — Clear (`AC`), sign-toggle (`±`), percent (`%`), divide (`÷`) in the first row; then three rows of digits and operators (`×`, `−`, `+`); and finally `0`, decimal (`.`), and equals (`=`).

The `=` button is the largest button on the grid, occupying a visually dominant position (bottom-right), and is colored **red** (a bold, saturated red such as `#E53935` in light mode, softened slightly to `#EF5350` in dark mode) to signal "this is the action." Red is intentional and distinct from all other buttons — it is not shared with error states, which use amber instead.

**Zone C — History Panel**
A collapsible panel that slides up from the bottom of the page (on mobile) or lives as a right-side column (on desktop-width viewports). A subtle "History" label with a count badge (e.g., "History · 4") and a chevron toggle opens and closes it.

When open, the panel lists past calculation records in reverse-chronological order (newest at top). Each entry shows:
- The expression on the first line (e.g., `3 + 4 × 2`)
- The result on the second line, in a larger weight (e.g., `= 11`)
- A subtle timestamp (e.g., "just now", "2 min ago")

Tapping an entry copies its result into the display's current input. A trash icon at the top of the panel clears all history (with a brief confirmation shake animation before deletion, no modal).

---

## 3. User Flows

### Flow 1 — Basic Arithmetic (P1)

1. User loads the page. The display shows `0` on the result line and an empty expression line.
2. User clicks (or types) `1`, `2`, `3`. The expression line updates to `123` in real time; each button animates on press.
3. User clicks `+`. Expression line shows `123 +`.
4. User clicks `4`, `5`, `6`. Expression shows `123 + 456`.
5. User clicks `=` (or presses Enter). The expression line dims slightly, the result line animates in with `579`.
6. A new entry `123 + 456 = 579` appears at the top of the history panel.
7. User can immediately begin a new expression; pressing any digit starts fresh.

### Flow 2 — Scientific Function (P2)

1. User has a fresh display.
2. User clicks `√`. The expression line shows `√(`. The calculator automatically opens the parenthesis.
3. User types `144`. Expression reads `√(144`.
4. User clicks `)`. Expression reads `√(144)`.
5. User presses `=`. Result line shows `12`.
6. For trig: user clicks `sin`, types `90`, presses `)`, presses `=`. Result shows `1`. (Angles are always in degrees.)

### Flow 3 — History Recall (P3)

1. User has completed three calculations.
2. User taps/clicks "History · 3" to open the history panel.
3. Panel slides open showing three entries in reverse order.
4. User clicks the entry for `√(144) = 12`.
5. The result `12` is placed into the display's expression line as the starting value.
6. User continues building a new expression from there (e.g., types `× 3 =` to get `36`).
7. User clicks the trash icon. The panel shakes subtly (no modal), then the list empties and the badge resets to `History · 0`.

### Flow 4 — Theme Toggle (P4)

1. User is in the default light mode.
2. User clicks the sun/moon icon in the top-right of the display.
3. The entire interface crossfades to dark mode in ~200ms. No page reload.
4. User closes the tab and returns later. The page opens in dark mode immediately — no flash of light mode first.

### Flow 5 — Keyboard-Only Operation (P2)

1. User loads the page. The calculator accepts keyboard input immediately (no click-to-focus required).
2. User types `1`, `5`, `*`, `3`. The expression line builds `15 × 3` and the corresponding on-screen buttons highlight briefly as each key is pressed.
3. User presses `Enter` (or `=`). Result `45` appears.
4. User presses `Escape`. Display clears.
5. `Backspace` deletes the last character of the current expression.

---

## 4. Interaction & Feedback Details

**Button press animation**: Each button scales down to ~93% for 80ms then springs back, giving a physical "click" feel. The animation is CSS-driven to ensure it fires within 100ms.

**Keyboard highlight**: When a key is pressed, the corresponding on-screen button receives the same "pressed" animation and a brief highlight ring (accent-colored border) for 150ms, so the user can visually confirm mapping.

**Equals result animation**: The result line fades in from slightly below its final position over 120ms — subtle enough not to distract, noticeable enough to feel responsive.

**History entry appearance**: New history entries slide in from the top of the history list with a quick 150ms slide-down. This draws attention to the new entry without being disruptive.

**Error states**:
- Division by zero: Expression line shows the entered expression; result line shows `Cannot divide by zero` in an amber/warning color. The display shakes once horizontally (a brief 300ms shake animation).
- Invalid domain (e.g., `√(-1)`, `log(0)`): Result line shows `Invalid input` with the same amber styling and shake.
- Empty display `=` press: Nothing happens — no error, no shake. The display remains at `0`. This is a silent no-op.

**Empty state (history panel)**: When no calculations have been made, the history panel shows a centered, muted message: "Your calculations will appear here." No icon clutter — just the text.

**Long expression handling**: The expression line scrolls horizontally (left-overflow, rightmost content always visible). If the user is deep into a complex expression that overflows, a subtle gradient fade on the left edge signals that content is scrolled out of view.

**Floating-point display**: Results are shown with up to 10 significant digits. Trailing zeros after the decimal point are stripped. `0.1 + 0.2` displays as `0.3` (the display rounds to a sensible precision) — a deliberate design choice to avoid exposing IEEE 754 artifacts to the user.

**Consecutive operator presses**: If the user presses an operator when the last token is already an operator (e.g., presses `×` after `+`), the last operator is replaced silently. No error, no friction.

**History overflow (50+ entries)**: Only the 50 most recent entries are kept. When a 51st entry is added, the oldest is silently removed from the bottom of the list. The history panel is scrollable; it does not paginate.

**Theme crossfade**: Light-to-dark and dark-to-light transitions are a 200ms CSS transition on background and text colors — fast enough to feel instantaneous, slow enough to not be jarring.

---

## 5. Accessibility Notes

**Color contrast**: All text on buttons and the display must meet WCAG AA minimum (4.5:1 for normal text, 3:1 for large text) in both light and dark themes. The red `=` button must use white label text and the chosen red value must achieve at least 3:1 contrast against that white in both light and dark variants. The amber error color must also pass against both light and dark backgrounds.

**Keyboard focus order**: Tab order moves through the display toggle, then the scientific functions row left-to-right, then the main button grid left-to-right top-to-bottom, then the history toggle. The focus ring must be clearly visible in both themes — a 2px solid ring using the accent color, not the browser default which may be invisible on some backgrounds.

**Screen reader labels**: All buttons must carry descriptive `aria-label` values (e.g., `aria-label="divide"` for `÷`, `aria-label="square root"` for `√`, `aria-label="equals"` for `=`). The display lines should be `aria-live="polite"` so result changes are announced without interrupting the user. The history panel items should be labeled as `aria-label="expression: 123 + 456, result: 579"`.

**Touch target sizes**: On mobile, all buttons must be at minimum 44×44 CSS pixels (Apple HIG / WCAG 2.5.5 target). The `=` button can be taller/wider as it is the primary action; the scientific buttons may be narrower but never below 44px height.

**Animation safety**: The button-press animation, shake, and result fade must be wrapped to respect `prefers-reduced-motion`. When this media query is active, animations are disabled entirely — feedback is still given via color change but no motion occurs.

**Operator symbol legibility**: The displayed operator symbols use the mathematical characters `×` (multiplication) and `÷` (division), not `*` or `/`. This improves readability at a glance and avoids ambiguity, even though keyboard input may use `*` and `/` which are silently mapped.

---

## 6. Lovability Checklist

- **The `=` button is the biggest button on the grid and colored red.** A calculator's primary purpose is to get the result — the most-used action gets the most prominent real estate and the most eye-catching color, making "how do I calculate?" immediately obvious to a first-time user.
- **Automatic parenthesis after `√` and trig functions.** Users don't need to remember to type `(` after `sin` — the calculator does it for them, removing a common source of frustration.
- **History entry timestamps use human-relative time ("just now", "3 min ago").** It gives the panel a conversational feel rather than a cold data-dump.
- **Floating-point results are cleaned up before display.** Showing `0.3` instead of `0.30000000000000004` keeps the tool trustworthy and non-intimidating.
- **No confirmation modal for history clear — just a shake.** Modals break flow. The shake is enough feedback that something irreversible happened, and history loss is low-stakes enough to not warrant a full confirm dialog.
- **Theme toggle remembers without a login.** Persistence via localStorage means the app adapts to the user on the next visit with zero overhead on their part.
- **Keyboard shortcut mapping echoes visually on-screen.** Power users can use the keyboard without feeling disconnected from the visual layout — the button highlight bridges both interaction styles simultaneously.
- **Error messages use plain language.** "Cannot divide by zero" and "Invalid input" speak like a helpful teacher, not a stack trace.

---

## 7. Open Questions for the Architect

1. **Degree/radian toggling is out of scope for v1**, per assumptions. The display should show a small, non-interactive "DEG" indicator so users know the current angle mode without ambiguity — but there is no toggle UI to implement. The Architect should confirm whether this indicator is a static label or a future toggle placeholder.

2. **History persistence**: The spec defines history as session-scoped (resets on reload), while theme preference must persist via `localStorage`. The Architect should confirm the storage mechanism for each and ensure they don't collide in a shared key namespace.
