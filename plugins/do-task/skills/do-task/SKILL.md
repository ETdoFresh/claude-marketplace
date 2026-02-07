---
name: do-task
description: Execute a task through plan, implement, evaluate phases with automatic retry logic until completion
disable-model-invocation: true
argument-hint: <task description>
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task
---

# Task Runner — Plan, Implement, Evaluate

You are orchestrating a multi-phase task execution workflow. Follow these phases exactly.

## Setup

1. Parse the task description from: `$ARGUMENTS`
2. Scan the `task-results/` directory for existing folders. Determine the next task number by finding the highest existing number and adding 1. If no folders exist, start at `001`.
3. Generate a task slug from the description: `<NNN>-<short-kebab-case-name>` (e.g., `001-add-user-auth`). The kebab name should be 3-5 words max, derived from the task description.
4. Create the directory: `task-results/<slug>/`
5. Write `task-results/<slug>/request.md` with the original user request. Format:
   ```markdown
   # Request

   <the full task description from $ARGUMENTS>
   ```
6. Announce the task: print the task number, slug, and description.

## Phase 1 — Plan

Delegate to the **dt-task-planner** subagent with this prompt:

> **Task**: <the full task description>
>
> **Working directory**: <current working directory>
>
> **Output path**: <full path to task-results/<slug>/plan.md>
>
> Explore the codebase, analyze the task requirements, and write a detailed implementation plan to the output path.

After the planner finishes, read `plan.md` to confirm it was written. Print a brief summary of the plan.

## Phase 2 — Implement

Set the attempt counter to 1.

Delegate to the **dt-task-implementer** subagent with this prompt:

> **Task**: <the full task description>
>
> **Plan**: <contents of plan.md>
>
> **Attempt**: <attempt number>
>
> **Previous evaluation feedback** (if retry): <contents of the most recent evaluation-summary, if this is a retry>
>
> **Working directory**: <current working directory>
>
> **Output path**: <full path to implementation-summary.md or implementation-N-summary.md>
>
> Implement the task according to the plan. Write a summary of all changes to the output path.

For the first attempt, the output file is `implementation-summary.md`.
For subsequent attempts, use `implementation-<N>-summary.md` (e.g., `implementation-2-summary.md`).

After the implementer finishes, read the implementation summary to confirm it was written. Print a brief summary of what was implemented.

## Phase 3 — Evaluate

Delegate to the **dt-task-evaluator** subagent with this prompt:

> **Task**: <the full task description>
>
> **Plan**: <contents of plan.md>
>
> **Implementation summary**: <contents of the latest implementation summary>
>
> **Attempt**: <attempt number>
>
> **Working directory**: <current working directory>
>
> **Output path**: <full path to evaluation-summary.md or evaluation-N-summary.md>
>
> **Evaluation scripts path**: <full path to task-results/<slug>/>
>
> Evaluate the implementation. You MUST produce a runnable verification — not just a subjective review. Write the evaluation report to the output path. The report MUST include a clear `## Result` section with either `PASS` or `FAIL`.

For the first attempt, the output file is `evaluation-summary.md`.
For subsequent attempts, use `evaluation-<N>-summary.md`.

After the evaluator finishes, read the evaluation summary.

## Retry Logic

1. Read the evaluation summary and check the `## Result` section.
2. If the result is **PASS**: announce success, print a final summary with the task slug and all generated files. Done.
3. If the result is **FAIL**:
   - Increment the attempt counter.
   - Print what failed and that you are retrying.
   - Go back to **Phase 2** with the evaluation feedback included in the prompt to the implementer.
   - Continue the loop until the evaluation passes.

## Important Notes

- Always use the **dt-task-planner**, **dt-task-implementer**, and **dt-task-evaluator** subagents by name.
- Each subagent runs in its own context. Pass all necessary information in the delegation prompt — subagents do not have access to the main conversation.
- Write all output files to the `task-results/<slug>/` directory.
- The evaluation must always include a runnable check, not just a code review.
- If a subagent encounters an error, report it and attempt to recover.
