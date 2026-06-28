# 🖼️ UI Designer Persona Guide

## Overview

The **UI Designer persona** translates UX specifications into production-ready UI components and visual implementations. It bridges the gap between UX design and developer implementation.

**Workflow:**
```
UX Designer Output (spec.md, design.md)
           ↓
    UI Designer Phase
    - Create components
    - Define visual system
    - Document states
           ↓
   Design Review & Approval
    - Markdown documentation
    - Preview artifacts
    - Stakeholder sign-off
           ↓
    Architect/Developer Handoff
```

---

## 📋 UI Designer Artifacts

### 1. **components.md** (Primary Output)
This is the main design artifact that developers receive. It documents:

- **Component Library Inventory** — list of all components created
- **Component Specifications** — for each component:
  - Purpose and use cases
  - Visual rendering (HTML/JSX mockup or SVG)
  - Props/configuration options
  - Interactive states (hover, active, disabled, error, loading)
  - Accessibility considerations (ARIA labels, keyboard navigation)
  - Code example (React component pattern)

**Example structure:**
```markdown
# Component Library

## Button Component

### Description
Primary action button for forms and call-to-actions.

### Visual States
- Default (blue background, white text)
- Hover (darker blue)
- Active (pressed)
- Disabled (gray, no pointer)
- Loading (spinner overlay)

### Props
- `variant`: 'primary' | 'secondary' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `loading`: boolean

### Example Usage
\`\`\`jsx
<Button variant="primary" size="md" onClick={() => submit()}>
  Submit
</Button>
\`\`\`

### Accessibility
- Uses semantic `<button>` element
- `aria-disabled` when disabled
- `aria-busy` when loading
- Keyboard focusable with visible focus ring
```

### 2. **design-system.md** (Reference)
Documents the visual design system:

- **Color Palette** — hex codes, names, usage guidelines
- **Typography** — font families, sizes, weights, line heights
- **Spacing System** — unit scale (8px base)
- **Elevation/Shadows** — depth levels
- **Breakpoints** — responsive design breakpoints
- **Animation Tokens** — timing functions, durations
- **Brand Guidelines** — logo usage, tone of voice

### 3. **preview-screenshots.md** (Visual Approval)
Contains:

- **Component Gallery** — visual screenshots or rendered components
- **State Variations** — show all interactive states side-by-side
- **Responsive Mockups** — mobile, tablet, desktop layouts
- **Color/Contrast Compliance** — WCAG AA verification notes
- **Approval Checklist** — stakeholder sign-off

---

## ✅ Design Review & Approval Process

### Phase 1: Artifact Generation
The UI Designer runs:
```bash
/speckit-implement "Create reusable UI components from UX design specs"
/speckit-design "Document component library, states, and accessibility"
```

### Phase 2: Markdown-Based Review
**Output location:** `specs/{spec-id}/components.md` (Git-tracked, PR-reviewable)

**Review mechanism:**
- Components documented in Markdown for easy Git review
- Design system reference included for consistency
- Code examples show integration patterns
- All artifacts are **version-controlled** and **traceable**

### Phase 3: Stakeholder Approval
**Approval workflow:**
1. PR review in GitHub — reviewers can see component docs and design decisions
2. Dashboard preview — render component gallery in the dashboard UI
3. Sign-off — approval checkbox in `preview-screenshots.md`

Example approval block:
```markdown
## Approval Checklist

- [ ] Design aligns with UX specifications
- [ ] All components have clear use cases
- [ ] Accessibility requirements met (WCAG AA)
- [ ] Responsive design verified
- [ ] Color/contrast compliance verified

**Approved by:** [Stakeholder Name]  
**Approval date:** YYYY-MM-DD
```

### Phase 4: Developer Handoff
Once approved, `components.md` becomes the **source of truth** for developers:
- No ambiguity about visual requirements
- Clear component APIs and props
- Accessibility built-in
- Implementation guidance via code examples

---

## 🔄 Integration with Spec Kit Workflow

### Input Dependencies
The UI Designer receives from UX Designer:
- `spec.md` — feature requirements and user stories
- `design.md` — UX flows, wireframes, design decisions

### Output Deliverables
The UI Designer produces:
- `design-system.md` — visual design tokens and guidelines
- `components.md` — component library documentation
- `preview-screenshots.md` — visual artifacts for approval

### Downstream Handoff
- **Architect** receives components to plan technical integration
- **Developer** receives `components.md` as implementation spec

---

## 🎨 Design System Versioning

Components are version-controlled alongside specs:
```
specs/
├── 001-feature-name/
│   ├── spec.md (UX Designer output)
│   ├── design.md (UX Designer output)
│   ├── design-system.md (UI Designer output)
│   ├── components.md (UI Designer output) ← Developer source of truth
│   └── preview-screenshots.md (UI Designer output)
```

This ensures:
- **Traceability** — link components to features via Git history
- **Approval Trail** — review history in Git blame/log
- **Consistency** — design system evolves with specs
- **Reusability** — components can be shared across features

---

## 📊 Dashboard Integration

The dashboard can render components for interactive approval:

1. **Component Preview Gallery** — iframe/canvas rendering of components
2. **State Showcase** — toggle between interactive states
3. **Responsive Preview** — preview at different breakpoints
4. **Approval UI** — submit/reject actions logged back to spec

---

## 🚀 Best Practices

✅ **DO:**
- Keep components focused and single-responsibility
- Document interactive states explicitly
- Include accessibility requirements upfront
- Show code examples for common patterns
- Version design system alongside components

❌ **DON'T:**
- Create monolithic "mega-components"
- Skip accessibility documentation
- Leave design decisions implicit
- Produce designs without developer guidance
- Orphan design specs (keep them in Git)

---

## 📝 Example: Complete UI Designer Run

**Input:** UX Designer delivers `spec.md` and `design.md`

**UI Designer executes:**
```bash
/speckit-implement << 'EOF'
Create a reusable component library for the calculator UI.

Requirements from UX spec:
- Display component for showing numbers and expressions
- Button grid for numbers 0-9 and operators
- History panel with previous calculations

Design system from design.md:
- Color: Blue (#0066CC) primary, Gray (#F5F5F5) background
- Typography: Roboto Mono for display, Open Sans for UI
- Spacing: 8px base unit

Deliver: Well-documented components with clear props, states, and examples.
EOF
```

**Output artifacts:**
- ✅ `design-system.md` — color palette, typography, spacing tokens
- ✅ `components.md` — Display, Button, HistoryPanel components documented
- ✅ `preview-screenshots.md` — visual gallery for approval

**Next step:**
- Stakeholder reviews and approves in PR
- Developer uses `components.md` as implementation spec
- Architect plans how components integrate with state management

---

## 🔗 Related

- [UX Designer Persona](ux-designer.json) — Input to UI Designer
- [GitHub Spec Kit](https://github.com/github/spec-kit) — Underlying command framework
- [Persona Library](README.md) — Orchestration system
