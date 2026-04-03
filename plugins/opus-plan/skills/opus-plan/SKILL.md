---
name: opus-plan
description: Plan using Claude Opus 4.6. Spawns an Opus Plan subagent with "ultrathink" to maximize reasoning depth. Note: does NOT use the extended thinking API — effort is prompted, not configured via budget tokens. Use when the user invokes /opus-plan or asks for a high-quality plan, architecture review, or deep implementation strategy.
---

# opus-plan

Delegate the planning task to a Claude Opus 4.6 Plan subagent. Uses "ultrathink" in the prompt to maximize reasoning depth. Note: this does NOT use the extended thinking API — effort is elicited via prompt, not configured via budget tokens.

## Instructions

1. Identify the task to plan from `<command-args>` if provided, otherwise from the current conversation context (the most recent user request or problem description).

2. Launch an Agent with these parameters:
   - `subagent_type: "Plan"`
   - `model: "opus"`
   - A detailed prompt that includes:
     - The full task description
     - Relevant context from the conversation (files mentioned, constraints, goals)
     - Instruction to be thorough: explore trade-offs, identify risks, consider alternatives, and produce a step-by-step implementation plan
     - Instruction to read relevant files before making recommendations (never plan blind)

3. Generate a timestamp via Bash: `date +%Y%m%d-%H%M%S`

4. Ensure the `./tmp` directory exists: `mkdir -p ./tmp`

5. Write the full plan to `./tmp/claude-plan-<timestamp>.md` using the Write tool. Report the path to the user.

6. Present the plan returned by the subagent to the user. Do not summarize or truncate it.

## Example prompt to pass to the subagent

```
ultrathink

You are planning the implementation of: <task>

Context:
- <any relevant files, constraints, or background from the conversation>

Produce a thorough implementation plan:
- Read all relevant files before recommending changes
- Identify the key files and components involved
- List the steps in order, with specific file paths and line numbers where applicable
- Call out risks, trade-offs, and alternative approaches
- Note any open questions that need the user's input before proceeding
```
