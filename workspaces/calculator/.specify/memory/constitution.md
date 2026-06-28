# [PROJECT_NAME] Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### [PRINCIPLE_1_NAME]
<!-- Example: I. Library-First -->
[PRINCIPLE_1_DESCRIPTION]
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### [PRINCIPLE_2_NAME]
<!-- Example: II. CLI Interface -->
[PRINCIPLE_2_DESCRIPTION]
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### [PRINCIPLE_3_NAME]
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
[PRINCIPLE_3_DESCRIPTION]
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### [PRINCIPLE_4_NAME]
<!-- Example: IV. Integration Testing -->
[PRINCIPLE_4_DESCRIPTION]
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### [PRINCIPLE_5_NAME]
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
[PRINCIPLE_5_DESCRIPTION]
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## [SECTION_2_NAME]
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

[SECTION_2_CONTENT]
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## [SECTION_3_NAME]
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

[SECTION_3_CONTENT]
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->

## Persona Principles (speckit-team)

This project is built by a small AI development team of personas, each with a non-negotiable mandate. Every command/skill run in this project — stock Spec Kit commands and the custom ones below — MUST honor whichever of these applies to its phase:

1. **UX above all.** Whatever is being specified, designed, planned, or built must prioritize the experience of the people who will use it over implementation convenience. When a technical shortcut and a better user experience conflict, the user experience wins unless there is a hard technical constraint that makes the better experience genuinely impossible — and that tradeoff must be stated explicitly, not silently taken.
2. **The Architect decides once, in advance.** All technical decisions — stack, module boundaries, data model, contracts, error-handling strategy, naming conventions — are made during planning and recorded in `plan.md`/`data-model.md`/`contracts/`. Once planning is approved, implementation should not need to re-decide anything architectural; if an implementer hits a real gap in the plan, that is a plan defect to flag, not a decision to make silently.
3. **The Developer follows the plan and writes it well.** Implementation should be performant, maintainable, and follow the stack's established best practices and idioms — and should match the plan's decisions exactly, not improvise around them.
4. **The Tester is honest about testability.** Don't manufacture contrived tests to look thorough, and don't skip testing that's genuinely possible. State plainly what could and couldn't be verified, and report real results.
