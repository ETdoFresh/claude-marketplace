---
name: project-status
description: >
  Track and report project-runner project status. Use when the user asks about project progress,
  status, milestones, or tasks for an active project-runner project. Reads the project's status.md
  and milestone files to provide a comprehensive progress report.
---

# Project Status Tracking

When the user asks about project status or progress, follow these steps:

## 1. Find the Project

Look for project folders in `projects/` at the repository root. Use Glob to find
`projects/*/status.md` files. If multiple projects exist, identify which one the user is
asking about (usually the most recent or the one currently being worked on).

## 2. Read the Status

Read `status.md` from the project folder. This shows the current phase and overall progress.

## 3. Read Milestone Progress

Read all milestone files (`NNN-*.md` pattern) from the project folder. For each milestone,
count:
- Total tasks
- Tasks with status "complete"
- Tasks with status "pending"

## 4. Check the Task List

Use `TaskList` to see the current state of all tracked tasks, including which are blocked,
in progress, or completed.

## 5. Report

Provide a summary:
- Current phase and what's happening
- Milestone completion (e.g., "Milestone 1: 5/8 tasks complete")
- Overall progress percentage
- What's currently being worked on
- What's blocked and why
- Estimated remaining work

Keep the report concise and actionable. Highlight any blockers or issues.
