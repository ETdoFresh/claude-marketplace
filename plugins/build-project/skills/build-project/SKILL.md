---
name: build-project
description: Full project lifecycle — interview, plan milestones, generate tasks, execute with verification until 100% complete
disable-model-invocation: true
argument-hint: <project description>
allowed-tools: Read, Write, Bash, Glob, Grep, Task, AskUserQuestion, TaskCreate, TaskUpdate, TaskList, TaskGet
---

# Build Project — Full Lifecycle

You are orchestrating the complete lifecycle of a software project: interview → plan → generate milestones → review → create tasks → execute → final acceptance. Follow these phases exactly.

## Setup

1. Parse the project description from: `$ARGUMENTS`
2. Scan the `projects/` directory for existing folders. Determine the next project number (start at `001` if none exist).
3. Generate a project slug: `<NNN>-<short-kebab-name>` (e.g., `001-cli-todo-app`). 3-5 words max.
4. Create the directory: `projects/<slug>/`
5. Write `projects/<slug>/request.md` with the original request:
   ```markdown
   # Request

   <the full project description from $ARGUMENTS>
   ```
6. Announce: print the project number, slug, and description.

---

## Phase 0 — Interview

Before any planning, conduct a clarifying interview with the user to fill in gaps and resolve ambiguity.

1. Use **AskUserQuestion** with up to 4 questions per round.
2. Questions should probe:
   - Scope boundaries (what's in, what's out)
   - Tech stack preferences (language, framework, database)
   - Target platforms (web, mobile, CLI, API)
   - Key features vs nice-to-haves
   - Known constraints (performance, security, compliance)
   - Testing expectations (unit, integration, e2e)
   - Any existing code, APIs, or services to integrate with
   - Deployment target (local, cloud, containerized)
3. **Every question must include an option**: "Skip — use your best judgment" so the user can end the interview at any time.
4. If the user selects "Skip" on any question, stop the interview immediately. Use your best judgment for all remaining unknowns.
5. Repeat rounds until: the user chooses to skip, OR you have enough clarity to plan comprehensively.
6. Append all interview answers to `request.md` under a `## Interview Answers` section.

---

## Phase 1 — High-Level Plan

Delegate to the **bp-project-planner** subagent with this prompt:

> **Project**: <the full project description>
>
> **Interview answers**: <all interview Q&A from Phase 0>
>
> **Working directory**: <current working directory>
>
> **Output path**: <full path to projects/<slug>/plan.md>
>
> Explore any existing codebase, analyze the project requirements, and write a high-level project plan to the output path. The plan must include a Requirements Traceability section mapping every user requirement to at least one milestone.

After the planner finishes, read `plan.md` to confirm it was written. Print the milestone list.

---

## Phase 2 — Milestone Generation

Read `plan.md` to extract the list of milestones. For each milestone **sequentially** (order matters for dependencies):

Delegate to the **bp-milestone-generator** subagent with this prompt:

> **Project**: <the full project description>
>
> **Interview answers**: <all interview Q&A>
>
> **Full plan**: <contents of plan.md>
>
> **Milestone to generate**: <the specific milestone name, number, goal, and description from the plan>
>
> **Previously generated milestones**: <contents of all milestone files generated so far, so dependencies can reference correct task IDs>
>
> **Working directory**: <current working directory>
>
> **Output path**: <full path to projects/<slug>/milestone-NNN-slug.md>
>
> Generate a complete milestone file with all tasks. Write it to the output path.

After each milestone is generated, read the file to confirm. Print the task count for that milestone.

---

## Phase 3 — Quality Review

Delegate to the **bp-milestone-reviewer** subagent with this prompt:

> **Project**: <the full project description>
>
> **Interview answers**: <all interview Q&A>
>
> **Plan**: <contents of plan.md>
>
> **Milestone files**: <list all milestone file paths>
>
> **Working directory**: <current working directory>
>
> **Output path**: <full path to projects/<slug>/review.md>
>
> Review all milestone files for quality and completeness. Write the review to the output path. The review MUST include a `## Overall Result` section with either `PASS` or `FAIL`.

After the reviewer finishes, read `review.md`.

- If **PASS**: proceed to Phase 4.
- If **FAIL**: For each failing milestone, re-run the bp-milestone-generator subagent with the reviewer's feedback included. Then re-run the reviewer. Repeat until PASS.

---

## Phase 4 — Create Tasks

Parse all milestone files to extract every task. For each task across all milestones:

1. Call **TaskCreate** with:
   - `subject`: The task title (e.g., "Task 001.1: Set up project structure with build system")
   - `description`: The full task body from the milestone file — including Goal, Technical Details, Implementation Steps, Integration Point, Verification, and Acceptance Criteria. Also include the milestone number and project slug for context.
   - `activeForm`: Present-continuous form (e.g., "Setting up project structure")

2. Keep a mapping of milestone task IDs (e.g., `001.1`) to TaskCreate IDs (e.g., `#5`).

3. After ALL tasks are created, call **TaskUpdate** on each task to set `addBlockedBy` based on the task's Prerequisites field, using the ID mapping.

Print summary: total tasks created, dependency links established.

---

## Phase 5 — Execute Tasks

Process tasks respecting dependency order:

1. Call **TaskList** to find unblocked pending tasks (no blockedBy, status = pending).
2. Pick up to **3 independent tasks** to execute in parallel.
3. For each task, delegate to the existing task execution agents using the **Task** tool:

   For each task being executed:
   a. Create a task subfolder inside the project: `projects/<project-slug>/tasks/<task-slug>/`
      The task-slug is derived from the milestone task ID and title (e.g., `001.1-set-up-project-structure`).
   b. Mark it as `in_progress` via **TaskUpdate**.
   c. Delegate to **bp-task-planner** subagent:
      > Plan the implementation of this task:
      > **Task**: <task subject and full description>
      > **Working directory**: <cwd>
      > **Output path**: <projects/<project-slug>/tasks/<task-slug>/plan.md>

   d. Delegate to **bp-task-implementer** subagent:
      > Implement this task:
      > **Task**: <task subject and full description>
      > **Plan**: <contents of the task plan>
      > **Attempt**: <N>
      > **Previous evaluation feedback**: <if retry>
      > **Working directory**: <cwd>
      > **Output path**: <projects/<project-slug>/tasks/<task-slug>/implementation-summary.md>

   e. Delegate to **bp-task-evaluator** subagent:
      > Evaluate this task:
      > **Task**: <task subject and full description>
      > **Plan**: <contents of the task plan>
      > **Implementation summary**: <contents>
      > **Attempt**: <N>
      > **Working directory**: <cwd>
      > **Output path**: <projects/<project-slug>/tasks/<task-slug>/evaluation-summary.md>
      > **Evaluation scripts path**: <projects/<project-slug>/tasks/<task-slug>/>
      > The report MUST include a `## Result` section with either `PASS` or `FAIL`.

   f. Read evaluation. If FAIL → retry (increment attempt, feed feedback to implementer). If PASS → mark task as `completed` via TaskUpdate.

4. After completing a batch, go back to step 1 to find newly-unblocked tasks.
5. Loop until ALL tasks are complete.

---

## Phase 6 — Final Acceptance

After all tasks are complete, run a final end-to-end acceptance check:

1. Delegate to the **bp-task-evaluator** subagent with this prompt:

   > **Final Acceptance Test**
   >
   > **Original project request**: <contents of request.md including interview answers>
   >
   > **Project plan**: <contents of plan.md>
   >
   > **Working directory**: <cwd>
   >
   > **Output path**: <projects/<slug>/final-acceptance.md>
   >
   > **Evaluation scripts path**: <projects/<slug>/>
   >
   > Run comprehensive end-to-end acceptance tests against the original project requirements. Every requirement from the request must be verified with a runnable check. The report MUST include a `## Result` section with either `PASS` or `FAIL`.

2. Read the acceptance report.
3. If **PASS**: Announce project completion. Print a final summary with all generated files, task counts, and project slug.
4. If **FAIL**: For each unmet requirement:
   - Create new remediation tasks via TaskCreate describing exactly what needs to be fixed.
   - Go back to Phase 5 to execute the remediation tasks.
   - After remediation tasks complete, re-run Phase 6.
   - Repeat until PASS.

---

## Important Notes

- Each subagent runs in its own context. Pass ALL necessary information in the delegation prompt.
- Use the **bp-project-planner**, **bp-milestone-generator**, and **bp-milestone-reviewer** subagents for phases 1-3.
- Use the **bp-task-planner**, **bp-task-implementer**, and **bp-task-evaluator** subagents for phase 5 execution.
- All project files go to `projects/<slug>/` — milestones at the top level, task results in `tasks/<task-slug>/` subfolders.
- The goal is 100% working, production-ready code that does exactly what the user requested. Do not stop until the final acceptance passes.
- If any subagent encounters an error, report it and attempt to recover.
- Maximum 3 tasks in parallel during execution — never more.
