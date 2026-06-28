<div align="center">

# 📚 DevArmyUI

**Role-based Persona Library for GitHub Spec Kit Integration**

[![Project](https://img.shields.io/badge/Project-DevArmyUI-blue?logo=github)](https://github.com/github/DevArmyUI)
[![Spec Kit](https://img.shields.io/badge/GitHub-Spec%20Kit-2ea44f?logo=github)](https://github.com/github/spec-kit)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-success.svg)](README.md)

[Getting Started](#-getting-started) • [How It Works](#-how-it-works) • [Personas](#-personas) • [Schema](#-schema-reference) • [Advanced](#-advanced-patterns) • [Contributing](#-contributing)

</div>

---

## 🎯 What is This?

**DevArmyUI** is a collection of role definitions (personas) that structure how software gets built using GitHub Spec Kit. Instead of people jumping between tasks randomly, personas define clear workflows: a UX Designer specifies what to build, an Architect designs how, a Developer implements it, and a Tester verifies it works.

This project integrates with [GitHub Spec Kit](https://github.com/github/spec-kit)—a framework that automates structured workflows.

**Why use it?**
- ✅ Ensures consistent handoffs between roles
- ✅ Automates common development workflows  
- ✅ Tracks outputs (specs, designs, plans, code, tests) at each stage
- ✅ Easy to extend with new personas

---

## 🚀 Getting Started

### Step 1: Explore the Personas

This library includes 4 pre-built personas:

```bash
ls -la *.json
```

You'll see:
- **🎨 ux-designer.json** – Defines what to build and how it should feel
- **🏛️ architect.json** – Designs the technical foundation
- **👨‍💻 developer.json** – Writes the code
- **🔍 tester.json** – Verifies everything works

### Step 2: Understand a Persona (Simple Example)

Open `ux-designer.json` and you'll see:

```json
{
  "libraryId": "ux-designer",
  "name": "UX Designer",
  "icon": "🎨",
  "description": "Designs the UI/UX using Spec Kit's specify and design phases.",
  "artifacts": ["spec.md", "design.md"],
  "steps": [
    { "command": "/speckit-specify", "argsTemplate": "{{request}}{{feedback}}" },
    { "command": "/speckit-design", "argsTemplate": "{{feedback}}" }
  ]
}
```

**What this means:**
- **name** – Human-readable role name
- **steps** – Ordered actions this persona takes (commands to run)
- **artifacts** – Files this persona produces
- **{{request}}/{{feedback}}** – Placeholders for input (replaced automatically)

### Step 3: Use a Persona in Your Workflow

When you work with this persona, you run its steps in order:

```bash
# Step 1: /speckit-specify creates a spec.md
# Step 2: /speckit-design creates a design.md

# Pass feedback to the next role (architect)
```

That's it! The persona tells you what commands to run and in what order.

---

## 🔄 How It Works

### The Development Pipeline

Features flow through a sequence of personas, each adding value:

```
┌──────────────────────────────────────────────────────────────────┐
│ 🎨 UX Designer     → 🏛️ Architect   → 👨‍💻 Developer  → 🔍 Tester     │
│ Specify the        Design the       Build the      Verify it    │
│ feature request    architecture     feature code   works        │
├──────────────────────────────────────────────────────────────────┤
│ Outputs:           Outputs:         Outputs:       Outputs:     │
│ spec.md            plan.md          tasks.md       test-report  │
│ design.md                                                        │
└──────────────────────────────────────────────────────────────────┘
```

Each persona:
1. Reads artifacts from the previous persona
2. Runs its Spec Kit commands
3. Produces new artifacts
4. Hands off to the next persona

### What are Spec Kit Commands?

This library uses **Spec Kit commands** – structured automation tools from GitHub Spec Kit:

| Command | What it does | Who uses it |
|---------|------------|-----------|
| `/speckit-specify` | Creates detailed feature specifications | UX Designer |
| `/speckit-design` | Creates interaction & visual designs | UX Designer |
| `/speckit-plan` | Creates technical architecture documents | Architect |
| `/speckit-tasks` | Generates a list of implementation tasks | Developer |
| `/speckit-implement` | Executes the implementation | Developer |
| `/speckit-test` | Writes and runs test suites | Tester |

Each persona is just a predefined sequence of these commands.

---

## 📖 Personas

### 🎨 UX Designer  
**Specifies what to build and designs how it should feel**

- **Runs:** `/speckit-specify` then `/speckit-design`
- **Creates:** `spec.md` (detailed feature request), `design.md` (mockups and interactions)
- **Hands off to:** Architect
- **Responsible for:** Understanding what users need, creating specifications, designing the user experience

**Example**: A user requests "Build a checkout flow." The UX Designer creates a specification document, then designs how the checkout should look and feel.

---

### 🏛️ Architect  
**Designs the technical foundation**

- **Runs:** `/speckit-plan`
- **Creates:** `plan.md` (technical decisions), `research.md`, data models, API contracts
- **Hands off to:** Developer
- **Responsible for:** System design, technology choices, database structure, API design

**Example**: Takes the UX Designer's checkout design and decides: "We'll use React for the frontend, Node.js for the backend, PostgreSQL for the database."

---

### 👨‍💻 Developer  
**Writes the code to implement the architecture**

- **Runs:** `/speckit-tasks` then `/speckit-implement`
- **Creates:** `tasks.md` (list of work items), actual working code
- **Hands off to:** Tester
- **Responsible for:** Code implementation, following the architecture, code quality

**Example**: Takes the Architect's plan and builds the checkout flow following the design and technical decisions.

---

### 🔍 Tester  
**Verifies the code works as intended**

- **Runs:** `/speckit-test`
- **Creates:** Test suites, `test-report.md` (test results and coverage)
- **Hands off to:** Done! Ready to ship.
- **Responsible for:** Writing tests, verifying features work, catching bugs

**Example**: Tests the checkout flow to ensure all features work correctly and the code doesn't break existing functionality.

---

## 🔧 Understanding Persona Files

### Anatomy of a Persona (Using UX Designer as Example)

Open [ux-designer.json](ux-designer.json) and you'll see:

```json
{
  "libraryId": "ux-designer",
  "name": "UX Designer",
  "icon": "🎨",
  "kind": "library",
  "description": "Designs the UI/UX using Spec Kit's specify and design phases.",
  "artifacts": ["spec.md", "design.md"],
  "steps": [
    { "command": "/speckit-specify", "argsTemplate": "{{request}}" },
    { "command": "/speckit-design", "argsTemplate": "{{feedback}}" }
  ]
}
```

### What Each Field Means

| Field | Meaning | Example |
|-------|---------|---------|
| `libraryId` | Internal identifier (used internally) | `"ux-designer"` |
| `name` | Display name of the role | `"UX Designer"` |
| `icon` | Emoji to represent this role | `"🎨"` |
| `description` | What this persona does | `"Designs the UI/UX..."` |
| `artifacts` | Files this persona creates | `["spec.md", "design.md"]` |
| `steps` | Ordered list of actions | See below ⬇️ |

### Understanding Steps

Each step tells the persona to run a Spec Kit command:

```json
{
  "command": "/speckit-specify",
  "argsTemplate": "{{request}}"
}
```

**Breaking it down:**
- `command` – Which Spec Kit command to run
- `argsTemplate` – What information to pass to it

### Variable Substitution

The `{{}}` syntax is a placeholder that gets replaced:

| Placeholder | Gets replaced with |
|-------|---------|
| `{{request}}` | The original feature request |
| `{{feedback}}` | Comments/feedback from the previous persona |

**Example:**
- UX Designer runs: `/speckit-specify "Build a checkout flow"`
- Architect reads that spec and runs: `/speckit-plan "Feedback: Add payment processing"`

This flow of feedback is how personas hand off work to each other.

---

## 📁 File Organization

```
.
├── README.md              # You are here!
├── LICENSE               
├── architect.json         # 🏛️  Software Architect persona
├── developer.json         # 👨‍💻 Developer persona  
├── tester.json           # 🔍  Tester persona
└── ux-designer.json      # 🎨  UX Designer persona
```

**To view a specific persona:**
```bash
cat ux-designer.json    # See the UX Designer persona definition
cat architect.json      # See the Architect persona definition
```

---

## ❓ Common Questions

### Q: How do I know which persona to use?
**A:** Use them in order based on the development phase:
1. **UX Designer** - when you're defining what to build
2. **Architect** - when you're deciding how to build it  
3. **Developer** - when you're actually building it
4. **Tester** - when you're verifying it works

### Q: Can I use just one persona?
**A:** Yes! You can use any persona independently. However, the full pipeline (UX → Architect → Developer → Tester) ensures nothing falls through the cracks.

### Q: What if a persona creates an artifact I don't need?
**A:** Artifacts are just recommended outputs. If a step generates a file you don't use, that's fine—focus on what's valuable for your project.

### Q: Where do I run these personas?
**A:** Personas define the workflow, but the actual commands run wherever your Spec Kit setup is configured.

---

## 🚀 Advanced Patterns

### Creating a Custom Persona

Want to add a new persona (e.g., a QA Engineer or DevOps Engineer)? Here's how:

1. **Create a new JSON file:**
   ```bash
   touch qa-engineer.json
   ```

2. **Define the persona structure:**
   ```json
   {
     "libraryId": "qa-engineer",
     "name": "QA Engineer",
     "icon": "🧪",
     "kind": "library",
     "description": "Performs manual testing and quality assurance beyond automated tests.",
     "artifacts": ["qa-report.md", "bug-log.md"],
     "steps": [
       { "command": "/speckit-test", "argsTemplate": "Manual QA: {{feedback}}" }
     ]
   }
   ```

3. **Place it in the root directory** alongside the other persona files

4. **Update this README** with your new persona

**Important:** Only reference existing Spec Kit commands (`/speckit-specify`, `/speckit-design`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`, `/speckit-test`). Don't invent new commands.

### Advanced Workflow: Feedback Loops

Personas can incorporate feedback at multiple stages:

```
UX Designer (initial spec)
   ↓ provides spec.md
Architect (reviews and provides feedback)
   ↓ runs /speckit-plan
Developer (reads plan, requests clarifications)
   ↓ can request UX changes
UX Designer (refines design with feedback)
   ↓ updated design.md
Developer (implements refined design)
   ↓ working code
Tester (finds bugs, provides feedback)
   ↓ bug report
Developer (fixes bugs)
   ↓ final code
```

This feedback loop is managed using the `{{feedback}}` variable in steps.

### Available Spec Kit Commands

Here's the complete list of Spec Kit commands you can reference:

| Command | Purpose |
|---------|---------|
| `/speckit-specify` | Create feature specifications |
| `/speckit-design` | Design UI/UX interactions |
| `/speckit-clarify` | Ask clarification questions |
| `/speckit-plan` | Generate technical architecture plan |
| `/speckit-tasks` | Generate task list for developers |
| `/speckit-implement` | Execute the implementation |
| `/speckit-test` | Write and run tests |
| `/speckit-converge` | Validate code matches specification |

---

## 🤝 Contributing

Found a way to improve the library? Want to add a new persona? Contributions welcome!

**Process:**
1. Create a feature branch: `git checkout -b feat/new-persona`
2. Add your new persona JSON file or update existing ones
3. Validate JSON syntax: `jq . your-persona.json`
4. Update this README if needed
5. Submit a pull request with a description

**Guidelines:**
- ✅ Use only existing Spec Kit commands (don't invent new ones)
- ✅ Follow the same JSON structure as existing personas
- ✅ Use consistent emoji and naming conventions
- ✅ Include a brief description of what the persona does
- ✅ Test your persona before submitting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📚 Next Steps

**Ready to use this library?**
1. Pick a persona file and open it to understand its structure
2. Run its steps in your workflow
3. Review the outputs it creates
4. Provide feedback to the next persona in the pipeline

**Want to learn more?**
- 📖 [GitHub Spec Kit Documentation](https://github.com/github/spec-kit) – Deep dive into Spec Kit commands
- 🔗 [DevArmyUI Project](https://github.com) – See this library in action
- 💬 Open an issue if you have questions

---

<div align="center">

**DevArmyUI**

**Structured workflows for collaborative software development**

</div>
