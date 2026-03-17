---
name: opencode-agent
description: >
  Delegate tasks to an opencode agent that uses alternative AI models (default: zai-coding-plan/glm-5-turbo).
  Use this skill whenever the user asks to "run opencode", "launch an opencode agent",
  "use opencode", or wants to delegate a task to opencode. Also use it when the user asks
  to run a task with a non-Claude model like GLM, or mentions opencode in any context
  where they want work done.
allowed-tools: Bash, Read, Glob, Grep
argument-hint: "The task to delegate to opencode, and optionally which model to use"
---

# Opencode Agent

Delegate tasks to [opencode](https://opencode.ai), an alternative AI coding agent. This skill runs `opencode run` as a subprocess, letting you hand off work to models like zai-coding-plan/glm-5-turbo without leaving your Claude Code session.

## When to use this

- The user explicitly asks to run something with opencode
- The user wants to use a non-Claude model (GLM, etc.) for a specific task
- The user says "launch an opencode agent" or similar phrasing

## How it works

Run the user's task via `opencode run`, passing the task as the message argument. The default model is **zai-coding-plan/glm-5-turbo**. If the user specifies a different model, pass it with the `-m` flag.

### Basic execution

```bash
opencode run -m zai-coding-plan/glm-5-turbo "<task description>"
```

### With a specific model

If the user requests a different model, override:

```bash
opencode run -m <provider/model> "<task description>"
```

### With a custom prompt/agent

```bash
opencode run --prompt "<system prompt>" "<task description>"
opencode run --agent <agent-name> "<task description>"
```

## Step-by-step

1. **Parse the request.** Extract the task the user wants opencode to perform. If the user specified a model, note it. Otherwise default to zai-coding-plan/glm-5-turbo.

2. **Run opencode.** Execute the task using Bash. Choose the right execution strategy based on the task's expected duration:

   **Short tasks** (file creation, simple edits, quick scripts) — run inline with a 2-minute timeout:
   ```bash
   opencode run -m zai-coding-plan/glm-5-turbo "<task>"
   ```

   **Medium tasks** (multi-file changes, test generation, refactoring) — use a longer timeout up to 10 minutes:
   ```bash
   opencode run -m zai-coding-plan/glm-5-turbo "<task>"   # with timeout set to 600000
   ```

   **Long-running tasks** (large codebases, complex generation, full project scaffolding) — run in the background so the user isn't blocked:
   ```bash
   opencode run -m zai-coding-plan/glm-5-turbo "<task>"   # with run_in_background: true
   ```
   When running in the background, you'll be notified when the task completes. Let the user know the task is running and you'll report back when it finishes.

   Always pass `-m zai-coding-plan/glm-5-turbo` unless the user specified a different model.

3. **Verify the result.** After opencode finishes, check that the expected output was produced. If opencode created or modified files, read them to confirm. Report the outcome to the user.

4. **Handle errors.** If opencode fails or isn't installed, tell the user clearly. Common issues:
   - `opencode: command not found` — opencode isn't installed. Suggest `npm install -g opencode` or checking their PATH.
   - Timeout — increase the timeout or run in the background. If the task is genuinely too large, break it into smaller subtasks.
   - Model not available — the requested model may not be configured. Suggest running `opencode models` to see available options.

## Tips

- You can continue a previous opencode session with `opencode run -c "<follow-up message>"`.
- To see what models are available: `opencode models`.
- The user's opencode configuration (API keys, providers) is managed separately from Claude Code — if a model isn't working, point them to `opencode providers` to set up credentials.
