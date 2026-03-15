---
name: port-application
description: >
  Port, translate, or migrate source code from one programming language to another
  using a structured pipeline: inventory → translate → evaluate → fix, looping until
  100% accuracy. Supports any language pair (C→C#, Python→Rust,
  Java→Kotlin, JavaScript→TypeScript, etc.). Use this skill whenever the user wants to
  port, migrate, translate, convert, or rewrite code from one language to another — even
  if they don't say "port" explicitly. Phrases like "rewrite this in Rust", "convert to
  TypeScript", "migrate from Java to Kotlin", "translate this C code to C#" should all
  trigger this skill.
argument-hint: <source path or project description>
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, AskUserQuestion
---

# Port Application — Source Code Porting Pipeline

You are orchestrating a multi-phase porting pipeline that translates source code from
one programming language to another. The pipeline runs: **Port → Evaluate → Fix → Loop**
until every file scores 100%.

The methodology prioritizes **accuracy over elegance** — an ugly-but-faithful port beats
a clean-but-wrong one. The original source code is always the single source of truth.

## CRITICAL: Autonomous Execution

This pipeline runs **autonomously to completion**. After Phase 0 (user interview), do NOT
stop, pause, or ask the user for permission between phases. The full sequence is:

1. Phase 0: Discovery & Configuration (only phase with user interaction)
2. Phase 1: Port ALL file groups
3. Phase 2: Evaluate ALL ported files
4. Phase 3: Fix any files scoring < 100, then loop back to Phase 2
5. Repeat Phase 2→3 until every file hits 100%
6. Generate final reports (markdown + HTML)

**Do NOT ask "shall I proceed?" or "should I continue?" between phases.** The pipeline
is designed to run unattended. If you finish porting, immediately start evaluating. If
evaluation reveals issues, immediately start fixing. Keep going until every file scores
100%. There is no retry limit — keep iterating until the file is perfect.

## Setup

1. Parse the project description from: `$ARGUMENTS`
2. Scan the `port-results/` directory for existing folders. Determine the next project
   number (start at `001` if none exist).
3. Generate a slug: `<NNN>-<short-kebab-name>` (e.g., `001-wolf3d-csharp-port`).
4. Create: `port-results/<slug>/`
5. Proceed to Phase 0.

---

## Phase 0 — Discovery & Configuration

Before any porting, gather configuration. Auto-detect as much as possible, then confirm
with the user via **AskUserQuestion**.

### Auto-Detection

1. **Source language**: Detect from file extensions in the source path.
   `.c/.h` → C, `.py` → Python, `.java` → Java, `.js` → JavaScript, `.rs` → Rust, etc.
2. **Project name**: Derive from the source directory name.
3. **File list**: Scan the source path for all source files.
4. **Target framework**: Infer a sensible default from the target language:
   - C# → `.NET 8`
   - Rust → `Cargo / Rust 2024 edition`
   - Java → `JDK 21`
   - Kotlin → `Kotlin 2.0 / JVM`
   - TypeScript → `Node.js 22 / ESM`
   - Go → `Go 1.22`
   - Python → `Python 3.12`

### User Interview

Use **AskUserQuestion** with up to 4 questions per round. Every question must include
a "Use auto-detected default" option so the user can skip.

**Round 1 — Core Settings:**

| Question | Auto-Detect | Fallback |
|----------|-------------|----------|
| Source language | From file extensions | Ask user |
| Target language | From $ARGUMENTS if mentioned | Ask user |
| Source path | From $ARGUMENTS | Ask user |
| Target output path | `<source-dir>-<target-lang>/` | Ask user |

**Round 2 — Project Details (if needed):**

| Question | Auto-Detect | Fallback |
|----------|-------------|----------|
| Original project name | Directory name | Ask user |
| Port project name | `<project>.<TargetLang>` | Ask user |
| Target framework | From target language table above | Ask user |
| Platform abstraction layer | None if not applicable | Ask user |

Stop interviewing as soon as the user selects "Skip" or all values are known.

### Save Configuration

Write `port-results/<slug>/request.md`:

```markdown
# Port Request

## Configuration
- **Source Language**: {SOURCE_LANG}
- **Target Language**: {TARGET_LANG}
- **Original Project**: {ORIGINAL_PROJECT_NAME}
- **Source Path**: {SOURCE_PATH}
- **Port Project**: {PORT_PROJECT_NAME}
- **Port Path**: {PORT_PATH}
- **Target Framework**: {TARGET_FRAMEWORK}
- **Platform Layer**: {PLATFORM_LAYER}

## Source Files
{FILE_LIST with file sizes}

## File Groups
{Groups of 2-3 related files that will be ported together}

## Original Request
{$ARGUMENTS}
```

### File Grouping

Group source files into batches of 2-3 related files:
- Header + implementation files together (e.g., `.h` + `.c`)
- Interface + implementation (e.g., `.java` interface + impl)
- Files that heavily reference each other (check imports/includes)
- Standalone files can be grouped by functional similarity

List the groups and total count before proceeding.

---

## Phase 1 — Port (per file group)

For each file group, spawn a **pa-porter** subagent:

> **Role**: Source code porter ({SOURCE_LANG} → {TARGET_LANG})
>
> **Original project**: {ORIGINAL_PROJECT_NAME}
> **Source path**: {SOURCE_PATH}
> **Port project**: {PORT_PROJECT_NAME}
> **Port path**: {PORT_PATH}
> **Target framework**: {TARGET_FRAMEWORK}
> **Platform layer**: {PLATFORM_LAYER}
>
> **Source files to port**:
> {List of files in this group with their full contents}
>
> **Type mapping rules**:
> {Language-specific type mapping — see references/porting-phases.md}
>
> **Instructions**: Read `references/porting-phases.md` Phase 1 — Porter section.
> Follow those instructions exactly. Write the ported files to {PORT_PATH}.
> Also write the inventory checklist to `port-results/<slug>/inventories/{filename}-inventory.md`.
>
> **Working directory**: {cwd}

After the porter finishes:
- Verify the ported files exist at {PORT_PATH}
- Read the inventory checklist
- Print a brief summary: files created, function count, confidence levels
- **Immediately proceed to Phase 2 — do not wait or ask the user**

---

## Phase 2 — Evaluate (per file group)

Proceed immediately after Phase 1 completes. Do not pause.

Spawn a **pa-auditor** subagent:

> **Role**: Code port auditor ({SOURCE_LANG} → {TARGET_LANG})
>
> **Original project**: {ORIGINAL_PROJECT_NAME}
> **Source path**: {SOURCE_PATH}
> **Port project**: {PORT_PROJECT_NAME}
> **Port path**: {PORT_PATH}
>
> **Files to evaluate**:
> {List of original files AND their corresponding ported files — include full contents of both}
>
> **Instructions**: Read `references/porting-phases.md` Phase 2 — Auditor section.
> Follow those instructions exactly. Score each file 0-100 using the weighted rubric.
> Run two independent scoring passes and average them.
>
> **Output**: Write the evaluation to BOTH:
> - `port-results/<slug>/evaluations/{filename}-eval-{iteration}.json` (structured)
> - `port-results/<slug>/evaluations/{filename}-eval-{iteration}.md` (human-readable)
>
> **Working directory**: {cwd}

After the auditor finishes:
- Read the evaluation JSON
- Extract scores and issue lists
- Print summary: per-file scores, critical issues found

### Decision Gate

For each file in the group, apply these rules automatically (no user input needed):

| Condition | Action |
|-----------|--------|
| Score = 100 | **ACCEPT** — file is done, move to next group |
| Score < 100 | **Immediately** proceed to Phase 3 (Fix) — no retry limit |

When all groups reach 100%, proceed to Final Report generation.

---

## Phase 3 — Fix (per file group, if needed)

Proceed immediately when the decision gate routes here. Do not pause.

Spawn a **pa-fixer** subagent:

> **Role**: Code port corrector ({SOURCE_LANG} → {TARGET_LANG})
>
> **Original project**: {ORIGINAL_PROJECT_NAME}
> **Source path**: {SOURCE_PATH}
> **Port project**: {PORT_PROJECT_NAME}
> **Port path**: {PORT_PATH}
>
> **Input A — Original source files**:
> {Full contents of original files}
>
> **Input B — Current ported files**:
> {Full contents of current ported files}
>
> **Input C — Evaluation report**:
> {Full contents of the evaluation JSON/markdown}
>
> **Instructions**: Read `references/porting-phases.md` Phase 3 — Fixer section.
> Follow those instructions exactly. Fix every issue, P0 first.
> Overwrite the ported files in {PORT_PATH} with the corrected versions.
> Write the changelog to `port-results/<slug>/changelogs/{filename}-changelog-{iteration}.md`.
>
> **Working directory**: {cwd}

After the fixer finishes:
- Verify the corrected files exist
- Read the self-audit score
- Check for recurring issues (same issue in 2+ consecutive iterations)
- **Immediately loop back to Phase 2** with the corrected files — do not pause or ask

---

## State Tracking

Maintain a running state table. Update after every phase:

```
| File           | Iteration | Phase    | Score | P0s | Status       |
|----------------|-----------|----------|-------|-----|--------------|
| main.c         | 1         | PORT     | —     | —   | In Progress  |
| main.c         | 1         | EVALUATE | 72    | 1   | Below Target |
| main.c         | 1         | FIX      | 72→85 | 0   | Below Target |
| main.c         | 2         | EVALUATE | 89    | 0   | Below Target |
| ...            | ...       | ...      | ...   | ... | ...          |
| main.c         | 5         | EVALUATE | 100   | 0   | Accepted     |
```

Print the state table after each phase completes.

### Recurring Issue Detection

If the same issue appears in two consecutive evaluations with no improvement:
- Try a different fix approach — re-read the original source for context
- If still stuck, note it in the iteration report but keep iterating
- Systematic patterns across files may indicate a translation rule that needs adjusting

---

## Report Generation

After **every iteration** (each pass through Evaluate or Fix), generate reports.

### Markdown Report

Write `port-results/<slug>/iteration-results-{NN}.md` (zero-padded: 01, 02, ...):

```markdown
# Iteration {N} Results

**Date**: {timestamp}
**Phase**: {PORT|EVALUATE|FIX}

## Files Processed
{Table of files with scores, changes, issues}

## Score Trajectory
{For each file: previous score → current score}

## Issues Found / Fixed
{Numbered list of issues with severity}

## Function Inventory
{Table of original functions → ported methods with confidence}

## Changelog (if fix phase)
{Table of changes made}

## Remaining Issues
{Any issues not yet resolved}

## State Table
{Current state of all files}
```

### HTML Reports

Read `references/html-templates.md` for the HTML templates. Generate:

1. **`port-results/<slug>/index.html`** — Main dashboard. Regenerate after every iteration
   with latest totals, scorecard, and links to iteration reports.

2. **`port-results/<slug>/iteration-results-{NN}.html`** — Per-iteration detail page.
   Generate once per iteration. Include navigation links (prev/next/dashboard).

Build the HTML by reading the templates from `references/html-templates.md` and replacing
the placeholder tokens with actual data. Use the color coding scheme from the templates.

---

## Parallel Execution

When there are multiple file groups, process them efficiently:

- **Sequential** (default for ≤ 3 groups): Process each group through the full
  Port→Evaluate→Fix loop before starting the next. Simpler, uses less context.

- **Parallel** (for > 3 groups): Spawn porter subagents for multiple groups simultaneously
  using the Agent tool. Then evaluate results as they come in. This is faster for large
  projects.

For parallel execution, spawn up to 3 porter subagents at once. As each finishes,
immediately spawn its auditor. This keeps the pipeline flowing.

---

## Final Report

After all files are processed, write `port-results/<slug>/final-report.md`:

```markdown
# Final Port Report: {PORT_PROJECT_NAME}

## Summary
- **Source**: {ORIGINAL_PROJECT_NAME} ({SOURCE_LANG})
- **Target**: {PORT_PROJECT_NAME} ({TARGET_LANG})
- **Framework**: {TARGET_FRAMEWORK}
- **Date**: {timestamp}

## Scorecard
| File | Final Score | Band | Iterations | Status |
|------|-------------|------|------------|--------|

## Score Trajectories
{For each file: iteration-by-iteration score progression}

## Critical Issues Resolved
{Most impactful bugs caught and fixed}

## Cross-File Dependencies
{Any stubs or // DEPENDENCY comments that need wiring up}

## Statistics
- Files ported: {X}
- Average final score: {X}
- Files accepted (100%): {X}
- Files accepted first pass: {X}
- Files requiring iteration: {X}
- Total iterations: {X}
```

Also regenerate `index.html` with final statistics.

---

## Type Mapping Generation

For each language pair, generate appropriate type mappings. Common pairs are documented
in `references/porting-phases.md` under "Language-Specific Type Mapping Examples".

For uncommon pairs, generate the mapping by:
1. Identifying the source language's primitive types
2. Finding the closest equivalent in the target language
3. Documenting any lossy conversions or semantic differences
4. Including this mapping in the porter subagent's prompt

---

## Important Notes

- **NEVER stop to ask the user between phases.** After Phase 0, the entire pipeline
  runs autonomously. The only stopping condition is: all files at 100%.
  Then generate final reports and finish. There is no retry limit.
- Each subagent runs in its own context. Pass ALL necessary information (file contents,
  config, evaluation reports) directly in the delegation prompt.
- Use named subagents: **pa-porter**, **pa-auditor**, **pa-fixer**.
- The original source code is ALWAYS the single source of truth.
- Quality over speed — do not accept low scores to move faster.
- Each fix iteration should show measurable improvement. If a fix doesn't improve the
  score by at least 5 points, re-examine the approach.
- Track recurring issues across files — these may indicate a systematic translation
  error that should be fixed as a rule for all remaining files.
- All output goes to `port-results/<slug>/`.
- No retry limit. Keep iterating until 100% score.
- When porting related files (header + implementation), port them together.
- If a subagent encounters an error, report it and attempt to recover.

## Reference Files

- **`references/porting-phases.md`**: Detailed instructions for each phase (Porter,
  Auditor, Fixer). Subagents should read the relevant section. Contains language-specific
  type mappings.
- **`references/html-templates.md`**: HTML templates for generating the dashboard
  (index.html) and per-iteration reports (iteration-results-NN.html).
