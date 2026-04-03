---
name: workspace
description: Launch a new Claude Code session as a named workspace. Takes a workspace name and optional working directory. Opens a new Windows Terminal tab running claude --dangerously-skip-permissions --remote-control. Use when the user wants to open or create a named workspace in a new Claude instance.
---

# /workspace

Launch a named Claude Code workspace in a new terminal tab.

Usage: `/workspace <name> [directory]`

- `name` — display name for the session
- `directory` — working directory (optional; defaults to `$WORKSPACES_DIR/<name>`, falling back to `~/code/workspaces/<name>`)

---

## Instructions

### Step 1: Parse Arguments

Inspect `<command-args>`:

- **If empty:** ask the user for a workspace name. **STOP**.
- **First token** = `WORKSPACE_NAME`
- **Second token** (if present) = `WORKSPACE_DIR`

### Step 2: Resolve the Working Directory

If `WORKSPACE_DIR` was not provided:

```bash
echo "${WORKSPACES_DIR:-$HOME/code/workspaces}"
```

Use the result as `WORKSPACE_DIR`.

### Step 3: Generate a Session ID

```bash
python3 -c "import uuid; print(uuid.uuid4())" 2>/dev/null || uuidgen 2>/dev/null || echo "$(date +%s)-$$"
```

Store as `SESSION_ID`.

### Step 5: Launch the Session

```bash
wt.exe new-tab --title "<WORKSPACE_NAME>" -d "<WORKSPACE_DIR>" -- bash -c "claude --dangerously-skip-permissions --remote-control --session-id <SESSION_ID> --name '<WORKSPACE_NAME>'"
```

**Fallback chain** if `wt.exe` fails:
1. `psmux.exe new-window -n "<WORKSPACE_NAME>" -- bash -c "cd '<WORKSPACE_DIR>' && claude --dangerously-skip-permissions --remote-control --session-id <SESSION_ID> --name '<WORKSPACE_NAME>'"`
2. `cmd.exe /c start "<WORKSPACE_NAME>" bash -c "cd '<WORKSPACE_DIR>' && claude --dangerously-skip-permissions --remote-control --session-id <SESSION_ID> --name '<WORKSPACE_NAME>'"`
3. If all fail, report the error and print the manual command.

### Step 6: Report to User

```
Workspace: <WORKSPACE_NAME>
Directory: <WORKSPACE_DIR>
Session:   <SESSION_ID>
Resume:    claude --resume <SESSION_ID>
```

---

## Examples

| Command | Behavior |
|---|---|
| `/workspace my-project` | Opens tab in `$WORKSPACES_DIR` (or `~/code/workspaces`), named "my-project" |
| `/workspace my-project /c/Users/etgarcia/code/CCClaw` | Opens tab in the specified directory |

---

## Notes

- `WORKSPACES_DIR` env var overrides the default root (`~/code/workspaces`).
- `--session-id` enables later resume with `claude --resume <SESSION_ID>`.
- `wt.exe new-tab` is non-blocking — returns immediately after opening the tab.
