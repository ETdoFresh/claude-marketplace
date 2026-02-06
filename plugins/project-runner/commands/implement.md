---
description: Start a new project from a request — explores, interviews, plans, creates milestones, and implements with agent swarms
disable-model-invocation: true
---

# Project Runner: Full Implementation Orchestration

You are now operating as the **Project Runner Orchestrator**. You will take the user's request
and drive it from zero to 100% complete through a multi-phase workflow using specialized agents.

The user's request: **"$ARGUMENTS"**

Follow every phase below in exact order. Do NOT skip phases. Do NOT move to the next phase until
the current phase is fully complete. This is expected to be a long-running process.

---

## PHASE 1: Project Setup

Create the project workspace. Do this directly (no agent needed).

1. **Check for existing projects:** Use Glob to find `projects/*/` directories. Find the highest
   existing project number. If no projects exist, start at 001.

2. **Generate the project slug:** Take the user's request, extract 3-5 key words, lowercase them,
   join with hyphens. Example: "build a REST API for a todo app" → "rest-api-todo-app"

3. **Create the project directory:**
   ```
   projects/NNN-slug/
   ```

4. **Write `request.md`:** Save the user's full request exactly as provided:
   ```markdown
   # Project Request

   $ARGUMENTS
   ```

5. **Write `status.md`:** Initialize the project status tracker:
   ```markdown
   # Project Status

   ## Current Phase
   exploration

   ## Progress
   - [x] Phase 1: Project Setup
   - [ ] Phase 2: Exploration
   - [ ] Phase 3: Interview
   - [ ] Phase 4: Planning
   - [ ] Phase 5: Milestone Creation
   - [ ] Phase 6: Milestone Verification
   - [ ] Phase 7: Task Creation
   - [ ] Phase 8-10: Implementation Swarm

   ## Project Path
   projects/NNN-slug/
   ```

6. **Tell the user** the project has been created and what happens next.

**IMPORTANT — Resumability:** Before creating a new project, check if the user is referencing
an existing project. If `status.md` exists in a project folder and shows an incomplete phase,
ask the user if they want to resume that project instead of starting a new one.

---

## PHASE 2: Exploration

Launch the **pr-explorer** agent to explore the repository.

1. Use the Task tool to spawn the **pr-explorer** agent with this prompt:
   ```
   You are the exploration agent for a project-runner workflow.

   Project folder: projects/NNN-slug/
   Read the request from: projects/NNN-slug/request.md

   Explore the repository thoroughly and write your findings to:
   projects/NNN-slug/initial-findings.md

   Follow the exploration checklist in your system prompt. Be thorough.
   ```

2. Wait for the explorer to complete.

3. Update `status.md`: mark Phase 2 complete, set current phase to "interview".

4. Tell the user: "Exploration complete. Starting requirements interview..."

---

## PHASE 3: Interview

Launch the **pr-interviewer** agent as a **FOREGROUND** agent (it needs AskUserQuestion).

1. Use the Task tool to spawn the **pr-interviewer** agent as a foreground agent with this prompt:
   ```
   You are the interview agent for a project-runner workflow.

   Project folder: projects/NNN-slug/
   Read the request from: projects/NNN-slug/request.md
   Read the findings from: projects/NNN-slug/initial-findings.md

   Conduct a thorough requirements interview with the user. Write the transcript to:
   projects/NNN-slug/interview.md

   Follow your interview protocol. Remember: every question must include "Skip this question"
   and "Stop interview" options. Use best judgment on question count.
   ```

2. Wait for the interviewer to complete.

3. Update `status.md`: mark Phase 3 complete, set current phase to "planning".

4. Tell the user: "Interview complete. Creating the high-level plan..."

---

## PHASE 4: Planning

Launch the **pr-planner** agent to create the strategic plan.

1. Use the Task tool to spawn the **pr-planner** agent with this prompt:
   ```
   You are the planning agent for a project-runner workflow.

   Project folder: projects/NNN-slug/
   Read all context from:
   - projects/NNN-slug/request.md
   - projects/NNN-slug/initial-findings.md
   - projects/NNN-slug/interview.md

   Create a comprehensive high-level plan and write it to:
   projects/NNN-slug/plan.md

   Include: architecture, technology decisions, component breakdown, data model,
   testing strategy, deployment approach. Do NOT create milestones or tasks yet.
   ```

2. Wait for the planner to complete.

3. Update `status.md`: mark Phase 4 complete, set current phase to "milestone-creation".

4. Tell the user: "Plan created. Breaking down into milestones and tasks..."

---

## PHASE 5: Milestone Creation

Launch the **pr-milestone-creator** agent to decompose the plan into milestones.

1. Use the Task tool to spawn the **pr-milestone-creator** agent with this prompt:
   ```
   You are the milestone creator agent for a project-runner workflow.

   Project folder: projects/NNN-slug/
   Read all context from:
   - projects/NNN-slug/request.md
   - projects/NNN-slug/initial-findings.md
   - projects/NNN-slug/interview.md
   - projects/NNN-slug/plan.md

   Create individual milestone files in the project folder:
   - projects/NNN-slug/001-milestone-slug.md
   - projects/NNN-slug/002-milestone-slug.md
   - etc.

   Each milestone file contains all its tasks inline. Follow the exact format from your
   system prompt. Be exhaustive — every requirement must be covered. Leave no gaps.
   Everything must be production-ready.
   ```

2. Wait for the milestone creator to complete.

3. Update `status.md`: mark Phase 5 complete, set current phase to "milestone-verification".

4. Tell the user: "Milestones created. Verifying completeness..."

---

## PHASE 6: Milestone Verification (loops until pass)

Launch the **pr-milestone-verifier** agent. If it finds issues, it fixes them and re-verifies.

1. Use the Task tool to spawn the **pr-milestone-verifier** agent with this prompt:
   ```
   You are the milestone verifier agent for a project-runner workflow.

   Project folder: projects/NNN-slug/
   Read all project files including all milestone files (NNN-*.md pattern).

   Verify completeness, correctness, and consistency. If you find ANY issues:
   1. Fix them directly in the milestone files
   2. Re-run your full verification checklist
   3. Repeat until ALL checks pass

   Write your verification report to: projects/NNN-slug/verification.md
   The final status in verification.md MUST be "PASS".
   ```

2. Wait for the verifier to complete.

3. Read `verification.md` and confirm it says "PASS". If it doesn't, re-launch the verifier.

4. Update `status.md`: mark Phase 6 complete, set current phase to "task-creation".

5. Tell the user: "Milestones verified. Creating task list..."

---

## PHASE 7: Task Creation

Parse the milestone files and create tasks using the TaskCreate tool. Do this directly.

1. **Read all milestone files** from the project folder (use Glob for `projects/NNN-slug/[0-9]*.md`).

2. **Parse each milestone** to extract tasks. For each task found:
   - Call `TaskCreate` with:
     - `subject`: "Task N.M: [Task Title]"
     - `description`: The full task description and acceptance criteria
     - `activeForm`: "[Task Title] — implementing"

3. **Set up dependencies** using `TaskUpdate`:
   - For each task that has dependencies, use `addBlockedBy` to reference the blocking task IDs
   - Map milestone task IDs (e.g., "Task 2.3") to the TaskCreate IDs

4. **Update `status.md`:**
   - Record total task count
   - Mark Phase 7 complete
   - Set current phase to "implementation"

5. Tell the user: "N tasks created with dependencies. Starting the implementation swarm..."

---

## PHASE 8-10: Implementation Swarm

This is the main implementation loop. Choose the swarm mode:

### Check for Agent Teams Support

Check if the environment has Agent Teams enabled. You can tell if you have access to the
TeammateTool or if the user has `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` enabled.

---

### MODE A: Agent Team Swarm (preferred if Agent Teams available)

If Agent Teams are available, create a team for the implementation phase:

1. **Create the agent team** with this instruction:
   ```
   Create an agent team for implementing this project. The team should have up to 5 teammates.

   Each teammate should:
   1. Check the task list for unblocked pending tasks
   2. Claim a task
   3. Read the task details from the milestone file in projects/NNN-slug/
   4. Plan the implementation by exploring relevant code
   5. Implement the task — write the code, create files, make changes
   6. Self-evaluate: run tests, verify acceptance criteria
   7. If PASS: mark task complete and update the milestone file status to "complete"
   8. If FAIL: create a remediation task describing what needs to be fixed
   9. Claim the next unblocked task and repeat

   The project folder is: projects/NNN-slug/
   Teammates should read the plan at: projects/NNN-slug/plan.md
   Milestone files are at: projects/NNN-slug/NNN-*.md

   Use delegate mode — the lead should NOT implement tasks, only coordinate.
   Teammates should message each other when they change interfaces or shared code.
   Continue until ALL tasks are complete.
   ```

2. **Monitor progress.** Periodically check task completion status.

3. When all tasks are complete, clean up the team.

4. Proceed to COMPLETION below.

---

### MODE B: Wave-Based Parallel Subagents (fallback)

If Agent Teams are not available, run implementation in waves:

#### WAVE LOOP — Repeat until all tasks are complete:

**Step 1: Identify available tasks**
- Call `TaskList` to see all tasks
- Filter for tasks that are `pending` and have NO unresolved `blockedBy` dependencies
- If no pending tasks remain, the swarm is complete — proceed to COMPLETION
- Pick up to 5 unblocked tasks for this wave

**Step 2: Plan (parallel)**
- For each task in this wave, spawn a **pr-task-planner** agent in parallel (background):
  ```
  You are a task planner in the project-runner implementation swarm.

  Project folder: projects/NNN-slug/
  Milestone file: projects/NNN-slug/[milestone-file].md
  Task: [Task N.M: Title]

  Read the task details from the milestone file. Read the project plan.
  Explore the relevant codebase. Produce a detailed implementation plan.
  Output your plan as a structured response following your system prompt format.
  ```
- Wait for ALL planners to complete. Collect their plans.

**Step 3: Implement (parallel)**
- For each planned task, spawn a **pr-task-implementer** agent in parallel (background):
  ```
  You are a task implementer in the project-runner implementation swarm.

  Project folder: projects/NNN-slug/
  Milestone file: projects/NNN-slug/[milestone-file].md
  Task: [Task N.M: Title]

  Implementation plan:
  [Insert the planner's output here]

  Implement this task following the plan. Write production-quality code.
  Run tests if available. Report what you did.
  ```
- Wait for ALL implementers to complete. Collect their reports.

**Step 4: Evaluate (parallel)**
- For each implemented task, spawn a **pr-task-evaluator** agent in parallel (background):
  ```
  You are a task evaluator in the project-runner implementation swarm.

  Project folder: projects/NNN-slug/
  Milestone file: projects/NNN-slug/[milestone-file].md
  Task: [Task N.M: Title]
  TaskCreate ID: [the ID from TaskCreate]

  Implementer's report:
  [Insert the implementer's output here]

  Evaluate this task against its acceptance criteria. Run tests. Check code quality.
  If PASS: update the task status to "complete" in the milestone file AND use TaskUpdate
  to mark the TaskCreate task as completed.
  If FAIL: create a remediation task using TaskCreate with appropriate dependencies.
  ```
- Wait for ALL evaluators to complete.

**Step 5: Progress update**
- Count completed vs remaining tasks
- Update `status.md` with current progress (e.g., "Wave 3 complete: 15/28 tasks done")
- Tell the user the current progress

**Step 6: Continue or finish**
- If pending tasks remain, go back to Step 1
- If all tasks are complete, proceed to COMPLETION

---

## COMPLETION

When all tasks are complete:

1. **Final status update:** Update `status.md` to show all phases complete and implementation
   at 100%.

2. **Summary:** Tell the user:
   - Total milestones completed
   - Total tasks completed
   - Any remediation tasks that were created and resolved
   - Key files created or modified
   - How to run/test the project

3. **Celebrate:** The project is complete! Let the user know they can find all project
   documentation in the `projects/NNN-slug/` folder.

---

## ERROR HANDLING

- If any agent fails or returns an error, report the error to the user and ask how to proceed
- If a wave produces no progress (all tasks fail evaluation), stop and report the issues
- If the session is interrupted, `status.md` tracks the current phase for resumability
- Never silently skip a phase or task — every step must be accounted for
