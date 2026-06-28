<div align="center">

# 📚 Persona Library

**speckit-dev-team · GitHub Spec Kit Integration · Role-based Workflow Framework**

[![Project](https://img.shields.io/badge/Project-speckit--dev--team-blue?logo=github)](https://github.com/github/speckit-dev-team)
[![Spec Kit](https://img.shields.io/badge/GitHub-Spec%20Kit-2ea44f?logo=github)](https://github.com/github/spec-kit)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-success.svg)](README.md)

[About](#about-spec-kit) • [Features](#features) • [Quick Start](#quick-start) • [Personas](#personas) • [Schema](#-schema-reference) • [Contributing](#contributing)

</div>

---

## 🎯 Overview

This **Persona Library** is the core orchestration component of **speckit-dev-team**, built on top of the [GitHub Spec Kit](https://github.com/github/spec-kit) framework. It provides structured, JSON-driven persona definitions that integrate seamlessly with Spec Kit's `/speckit-*` command ecosystem.

The library enables the **speckit-dev-team** project to:
- Define distinct personas using Spec Kit commands (`/speckit-specify`, `/speckit-design`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`, `/speckit-test`)
- Orchestrate collaborative work through coordinated personas
- Automate intelligent handoffs between roles using a unified, Git-friendly framework
- Track artifacts and outputs generated at each stage of development
- Maintain consistency and reusability across multiple feature development cycles

Think of it as **Spec Kit's role choreography layer**—mapping personas directly to Spec Kit's powerful `/speckit-*` workflow commands, enabling teams to collaborate with clarity and structure.

---

## 🎯 What This Library Does

This **Persona Library is the orchestration layer for GitHub Spec Kit**. Instead of running Spec Kit commands in isolation, you define personas that chain multiple Spec Kit commands together:

```
┌─────────────────────────────────────────────────────────────┐
│                   Spec Kit Workflow                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🎨 UX Designer ─────→ 🏛️ Architect ─────→ 👨‍💻 Developer     │
│  /speckit-specify     /speckit-plan      /speckit-tasks      │
│  /speckit-design                         /speckit-implement  │
│                                                               │
│                            ↓                                  │
│                      🔍 Tester                               │
│                      /speckit-test                           │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                 ↑ Orchestrated by                             │
│            Persona Library (this library)                    │
└─────────────────────────────────────────────────────────────┘
```

**The key insight:** Each persona is just a predefined sequence of Spec Kit commands. This library makes it easy to:
- Reuse consistent workflows across projects
- Hand off work between personas with feedback
- Track artifacts at each Spec Kit phase
- Extend with new personas that leverage Spec Kit

---

## 🔗 About GitHub Spec Kit

**GitHub Spec Kit** is a structured specification and planning framework that brings clarity and automation to software development. It orchestrates the full development lifecycle through integrated commands:

| Spec Kit Command | Purpose | Persona |
|---|---|---|
| `/speckit-specify` | Create feature specifications | UX Designer |
| `/speckit-design` | Design UI/UX interactions | UX Designer |
| `/speckit-plan` | Plan technical architecture | Architect |
| `/speckit-tasks` | Generate implementation tasks | Developer |
| `/speckit-implement` | Execute implementation | Developer |
| `/speckit-test` | Write and run tests | Tester |

This **Persona Library** provides the role-based layer that maps personas to these powerful Spec Kit commands, creating a unified workflow where each persona knows exactly which Spec Kit command(s) to invoke and in what sequence.

📖 **Learn more:** [GitHub Spec Kit Documentation](https://github.com/github/spec-kit)

---

## ✨ Features

- **🔗 Spec Kit Native** - Seamlessly integrates with GitHub Spec Kit's `/speckit-*` command ecosystem
- **🎭 Role-Based Workflows** - Pre-defined personas that map directly to Spec Kit phases (specify → design → plan → tasks → implement → test)
- **🤖 Automation Ready** - Built-in Spec Kit commands for each persona with intelligent variable substitution
- **📊 Artifact Tracking** - Clear definition of outputs (spec.md, plan.md, tasks.md, test-report.md) generated at each Spec Kit phase
- **🧩 Modular Design** - Easy to extend with new personas or customize Spec Kit command sequences
- **📋 Structured JSON** - Simple, declarative configuration that mirrors Spec Kit's workflow structure
- **🔄 Workflow Orchestration** - Automatic handoffs between personas using Spec Kit's command layer

---

## 🚀 Quick Start

### 1️⃣ View Spec Kit Personas

All personas are pre-configured with Spec Kit commands:

```bash
ls -la *.json
```

**Output:**
```
architect.json       # Maps to /speckit-plan
developer.json       # Maps to /speckit-tasks, /speckit-implement
tester.json          # Maps to /speckit-test
ux-designer.json     # Maps to /speckit-specify, /speckit-design
```

### 2️⃣ Understand the Persona-to-Spec Kit Mapping

Each persona is a sequence of Spec Kit commands:

```json
{
  "libraryId": "architect",
  "name": "Software Architect",
  "icon": "🏛️",
  "kind": "library",
  "description": "Designs technical solutions using Spec Kit's planning phase",
  "artifacts": ["plan.md", "research.md", "data-model.md", "contracts"],
  "steps": [
    { "command": "/speckit-plan", "argsTemplate": "{{feedback}}" }
  ]
}
```

→ **This means:** When the Architect persona is active, invoke `/speckit-plan` with feedback.

### 3️⃣ Invoke Personas in Your Spec Kit Workflow

Use personas to orchestrate Spec Kit commands:

```
# UX Designer phase (Spec Kit specify + design)
/speckit-specify "Build a calculator app"
/speckit-design "Make it beautiful"

# Architect phase (Spec Kit plan)
/speckit-plan "Feedback: use React for the UI"

# Developer phase (Spec Kit tasks + implement)
/speckit-tasks "All items from spec and plan"
/speckit-implement "Feedback: follow the plan exactly"

# Tester phase (Spec Kit test)
/speckit-test "Verify all features work"
```

---

## 👥 Personas

### 🎨 UX Designer → `/speckit-specify` + `/speckit-design`
**Defines the feature and designs exceptional user experiences**

| Property | Value |
|----------|-------|
| **Role** | UX Designer |
| **Spec Kit Phase** | **Specify → Design** |
| **Purpose** | Creates feature specifications and lovable UI/UX designs |
| **Primary Commands** | `/speckit-specify` (create spec), `/speckit-design` (create design.md) |
| **Input Template** | `{{request}}{{feedback}}` |
| **Artifacts** | `spec.md`, `design.md` |
| **Outputs** | User-centered specifications and interaction flows |
| **Responsibilities** | User research, wireframing, visual design, interaction design, accessibility |

### 🏛️ Architect → `/speckit-plan`
**Designs the complete technical foundation**

| Property | Value |
|----------|-------|
| **Role** | Software Architect |
| **Spec Kit Phase** | **Plan** |
| **Purpose** | Creates comprehensive technical architecture and design documents |
| **Primary Commands** | `/speckit-plan` (generates plan.md with design decisions) |
| **Input Template** | `{{feedback}}` |
| **Artifacts** | `plan.md`, `research.md`, `data-model.md`, `contracts` |
| **Outputs** | Detailed technical specifications, data models, API contracts |
| **Responsibilities** | System design, technology selection, scalability planning, architectural decisions |

### 👨‍💻 Developer → `/speckit-tasks` + `/speckit-implement`
**Brings the architecture to life with clean, maintainable code**

| Property | Value |
|----------|-------|
| **Role** | Developer |
| **Spec Kit Phase** | **Tasks → Implement** |
| **Purpose** | Generates implementation tasks and executes the complete build |
| **Primary Commands** | `/speckit-tasks` (create tasks.md), `/speckit-implement` (execute tasks) |
| **Input Template** | `{{feedback}}` |
| **Artifacts** | `tasks.md` |
| **Outputs** | Fully implemented feature with working code |
| **Responsibilities** | Code implementation, performance optimization, best practices, code quality |

### 🔍 Tester → `/speckit-test`
**Ensures quality through comprehensive testing**

| Property | Value |
|----------|-------|
| **Role** | Tester |
| **Spec Kit Phase** | **Test** |
| **Purpose** | Verifies feature testability and writes comprehensive test suites |
| **Primary Commands** | `/speckit-test` (writes and runs tests) |
| **Input Template** | `{{feedback}}` |
| **Artifacts** | `test-report.md` |
| **Outputs** | Test suites, coverage reports, quality metrics |
| **Responsibilities** | Test design, quality assurance, test automation, coverage analysis |

---

## 📋 Schema Reference

### Persona JSON Structure

Each persona is a JSON configuration that defines Spec Kit command sequences:

```json
{
  "libraryId": "ux-designer",
  "name": "UX Designer",
  "icon": "🎨",
  "kind": "library",
  "description": "Designs the UI/UX using Spec Kit's specify and design phases.",
  "artifacts": ["spec.md", "design.md"],
  "steps": [
    { "command": "/speckit-specify", "argsTemplate": "{{request}}{{feedback}}" },
    { "command": "/speckit-design", "argsTemplate": "{{feedback}}" }
  ]
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `libraryId` | string | ✅ | Unique identifier (kebab-case) |
| `name` | string | ✅ | Human-readable display name |
| `icon` | string | ✅ | Emoji representing the persona |
| `kind` | string | ✅ | Always `"library"` |
| `description` | string | ✅ | Role description focusing on Spec Kit workflow |
| `artifacts` | array | ✅ | Files produced by Spec Kit commands (e.g., `spec.md`, `plan.md`, `tasks.md`) |
| `steps` | array | ✅ | Ordered Spec Kit commands to invoke |

### Steps Structure

Each step invokes a Spec Kit command:

```json
{
  "command": "/speckit-plan",
  "argsTemplate": "{{feedback}}"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `command` | string | **Spec Kit command** to invoke (must start with `/speckit-`) |
| `argsTemplate` | string | Input passed to the Spec Kit command with variable substitution |

### Supported Variables

The `argsTemplate` field automatically substitutes these variables:

| Variable | Source | Example |
|----------|--------|---------|
| `{{request}}` | Original feature request | User's initial feature description |
| `{{feedback}}` | User or system feedback | Comments from previous persona's work |
| `{{variable}}` | Custom parameters | Project-specific data |

**Example with multiple variables:**
```json
{
  "command": "/speckit-plan",
  "argsTemplate": "Feature: {{request}} - Recent feedback: {{feedback}}"
}
```

---

## 🔧 Creating Personas with Spec Kit Commands

### How Persona Steps Map to Spec Kit Commands

When defining a persona's `steps`, each `command` **must reference an existing Spec Kit command**. Here are the core Spec Kit commands available:

| Spec Kit Command | Purpose | Typical Persona |
|---|---|---|
| `/speckit-specify` | Create feature specifications | UX Designer |
| `/speckit-design` | Design UI/UX interactions | UX Designer |
| `/speckit-clarify` | Ask clarification questions | UX Designer |
| `/speckit-plan` | Generate technical plan | Architect |
| `/speckit-tasks` | Generate task list | Developer |
| `/speckit-implement` | Execute implementation | Developer |
| `/speckit-test` | Write and run tests | Tester |
| `/speckit-converge` | Validate code matches specs | QA/Developer |

### Step-by-Step: Adding a Custom Persona

1. **Create a new JSON file** (must reference existing Spec Kit commands):
   ```bash
   touch devops-engineer.json
   ```

2. **Define the persona using Spec Kit commands:**
   ```json
   {
     "libraryId": "devops-engineer",
     "name": "DevOps Engineer",
     "icon": "⚙️",
     "kind": "library",
     "description": "Prepares deployment infrastructure and ensures operational readiness using Spec Kit's infrastructure planning.",
     "artifacts": [
       "infrastructure.md",
       "deployment-guide.md"
     ],
     "steps": [
       {
         "command": "/speckit-plan",
         "argsTemplate": "Infrastructure and deployment: {{feedback}}"
       }
     ]
   }
   ```

3. **Document the persona** in this README with its Spec Kit commands

4. **Test in your Spec Kit workflow** - invoke the Spec Kit commands directly

### Best Practices for Persona Creation

- ✅ **Reference actual Spec Kit commands** - don't invent custom commands
- ✅ Keep descriptions focused on the persona's Spec Kit role
- ✅ Use `{{feedback}}` template for multi-step personas
- ✅ Order steps to match Spec Kit's workflow: specify → design → plan → tasks → implement → test
- ✅ Use consistent emoji and naming conventions
- ✅ Document which Spec Kit commands each persona invokes
- ✅ Validate JSON syntax: `jq . persona-name.json`

---

## 💡 Spec Kit Integration Patterns

### The Standard Spec Kit Workflow
Move features through the complete development pipeline using Spec Kit commands:

```
UX Designer                  Architect              Developer               Tester
/speckit-specify      →    /speckit-plan    →  /speckit-tasks      →  /speckit-test
/speckit-design                               /speckit-implement

  spec.md              plan.md               tasks.md              test-report.md
  design.md            research.md           ✓ Working Code
```

### Feedback-Driven Refinement
Use `{{feedback}}` parameters to incorporate insights at each Spec Kit phase:

```
/speckit-specify
    ↓ ({{feedback}})
/speckit-clarify (optional)
    ↓
/speckit-design ({{feedback}})
    ↓
/speckit-plan ({{feedback}})
    ↓
/speckit-tasks ({{feedback}})
    ↓
/speckit-implement ({{feedback}})
    ↓
/speckit-test ({{feedback}})
    ↓
/speckit-converge (optional, to ensure code matches spec/plan/tasks)
```

### Parallel Spec Kit Tracks
Run spec and design simultaneously while planning and development follow:

```
/speckit-specify + /speckit-design (parallel)
    ↓
/speckit-plan (uses design/spec outputs)
    ↓
/speckit-tasks + /speckit-implement (parallel)
    ↓
/speckit-test
```

---

## 📁 File Organization

```
persona-library/
├── README.md                 # This file
├── architect.json           # 🏛️  Software Architect persona
├── developer.json           # 👨‍💻 Developer persona
├── tester.json             # 🔍  Tester persona
└── ux-designer.json        # 🎨  UX Designer persona
```

---

## 🤝 Contributing

Found a bug? Have a new persona idea? We'd love your contribution!

1. **Fork** this repository
2. **Create** a feature branch: `git checkout -b feat/new-persona`
3. **Validate** your JSON: `jq . persona-name.json`
4. **Test** the persona in your workflow
5. **Submit** a pull request with detailed description

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📚 Resources

- **speckit-dev-team Project:** The primary project using this Persona Library
- **GitHub Spec Kit:** https://github.com/github/spec-kit — The core framework that powers all `/speckit-*` commands
- **Spec Kit Commands:** Detailed documentation available in the official Spec Kit repository
- **This Persona Library:** Role-based orchestration layer that maps personas to Spec Kit commands

---

<div align="center">

**speckit-dev-team Persona Library**

**Built for GitHub Spec Kit · Role-based Orchestration Layer**

**Made with ❤️ to bring structure and clarity to software development**

</div>
