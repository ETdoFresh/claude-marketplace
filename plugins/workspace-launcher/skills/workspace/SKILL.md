---
name: workspace
description: Launch a new Claude Code session in a different working directory. Opens a new Windows Terminal tab running claude --dangerously-skip-permissions --remote-control (equivalent to the ccy alias). Use when the user wants to open a new Claude instance in another project, spawn a parallel workspace, or dispatch work to a different repo.
---

# /workspace

Launch a new interactive Claude Code session in a separate terminal tab, targeting a different working directory. Mirrors the `ccy` PowerShell alias: `claude --dangerously-skip-permissions --remote-control`.

---

## Instructions

### Step 1: Parse Arguments

Inspect `<command-args>`:

**If args are `list` or `ls`:**
- Run `ls ~/code/` via Bash to list available project directories.
- Present them as a numbered list.
- Ask the user which one to open. **STOP**.

**If args are empty:**
- Ask: "Which directory? Use `/workspace list` to see available projects, or provide a path or project name."
- **STOP**.

**Otherwise**, parse the first token as the target:
- If it starts with `.`, `/`, `~`, or a drive letter (`C:`) → treat as a path directly.
- If it is a bare name (no slashes) → resolve as `~/code/<name>`.
- Remaining tokens after the path/name = **initial prompt** (optional).

Normalize the resolved path for Git Bash: convert `C:\...` → `/c/...`, expand `~` to `/c/Users/etgarcia`.

Store: `TARGET_DIR`, `INITIAL_PROMPT` (may be empty).

### Step 2: Validate the Directory

```bash
test -d "<TARGET_DIR>" && echo "EXISTS" || echo "NOT_FOUND"
```

If NOT_FOUND: report the error, suggest `/workspace list`, and **STOP**.

### Step 3: Generate Session Identity

```bash
python3 -c "import uuid; print(uuid.uuid4())" 2>/dev/null || uuidgen 2>/dev/null || echo "$(date +%s)-$$"
```

```bash
basename "<TARGET_DIR>"
```

Store as `SESSION_ID` and `SESSION_NAME`.

### Step 4: Launch the Session

Determine mode based on `INITIAL_PROMPT`:

**Mode A — Interactive (no initial prompt):**

```bash
wt.exe new-tab --title "ccy: <SESSION_NAME>" -d "<TARGET_DIR>" -- bash -c "claude --dangerously-skip-permissions --remote-control --session-id <SESSION_ID> --name '<SESSION_NAME>'"
```

**Mode B — Interactive with context (initial prompt provided):**

```bash
wt.exe new-tab --title "ccy: <SESSION_NAME>" -d "<TARGET_DIR>" -- bash -c "claude --dangerously-skip-permissions --remote-control --session-id <SESSION_ID> --name '<SESSION_NAME>' --append-system-prompt 'Context from launching session: <INITIAL_PROMPT>'"
```

**Mode C — Headless (user says "headless", "background", or "dispatch"):**

Run via Bash with `run_in_background: true`:
```bash
cd "<TARGET_DIR>" && claude -p "<INITIAL_PROMPT>" --dangerously-skip-permissions --session-id <SESSION_ID> --output-format json 2>&1
```

**Fallback chain** if `wt.exe` fails (non-zero exit):
1. Try psmux: `psmux.exe new-window -n "<SESSION_NAME>" -- bash -c "cd '<TARGET_DIR>' && claude --dangerously-skip-permissions --remote-control --session-id <SESSION_ID> --name '<SESSION_NAME>'"`
2. Try cmd.exe: `cmd.exe /c start "ccy: <SESSION_NAME>" bash -c "cd '<TARGET_DIR>' && claude --dangerously-skip-permissions --remote-control --session-id <SESSION_ID> --name '<SESSION_NAME>'"`
3. If all fail, report the error and print the manual command the user can run themselves.

### Step 5: Report to User

```
Launched: <TARGET_DIR>
  Session: <SESSION_NAME> (<SESSION_ID>)
  Resume:  claude --resume <SESSION_ID>
```

---

## Examples

| Command | Behavior |
|---|---|
| `/workspace CCClaw` | Opens ccy tab in `~/code/CCClaw` |
| `/workspace ~/code/html-share` | Opens ccy tab at that path |
| `/workspace list` | Lists dirs under `~/code/` |
| `/workspace CCClaw Fix the build error in src/index.ts` | Opens tab, context pre-loaded |
| `/workspace CCClaw headless Run tests and report` | Background dispatch via `claude -p` |

---

## Notes

- `--remote-control` is the default in the `ccy` alias. Pass `-nor` equivalent by omitting it only if the user explicitly requests it.
- `--session-id` lets the user resume the spawned session later with `claude --resume <SESSION_ID>`.
- `wt.exe new-tab` is non-blocking on Windows — the Bash call returns immediately.
- Paths passed inside `bash -c "..."` must use Unix-style slashes (`/c/Users/...`).
