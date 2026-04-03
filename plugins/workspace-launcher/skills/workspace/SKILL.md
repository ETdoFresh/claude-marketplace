---
name: workspace
description: Launch a new named Claude Code session. The workspace name is only a display label — the working directory is always $WORKSPACES_DIR (default ~/code/workspaces), or the explicitly provided second argument. Never append the name to the path. Use when the user wants to open a new Claude instance with a given name.
---

# /workspace

Launch a named Claude Code session in a new terminal tab.

Usage: `/workspace <name> [directory]`

- `name` — session display name only (never used as a path component)
- `directory` — working directory (optional; defaults to the `WORKSPACES_DIR` env var, or `~/code/workspace` if unset)

**IMPORTANT: The workspace name is NOT appended to the directory. It is only used as the session title.**

---

## Instructions

### Step 1: Parse Arguments

Inspect `<command-args>`:

- **If empty:** ask the user for a workspace name. **STOP**.
- **First token** = `WORKSPACE_NAME` (display label only, not a path)
- **Second token** (if present) = `WORKSPACE_DIR`

### Step 2: Resolve the Working Directory

If `WORKSPACE_DIR` was **not** provided by the user, run:

```bash
echo "${WORKSPACES_DIR:-$HOME/code/workspace}"
```

Use the printed value as `WORKSPACE_DIR`.

**Do NOT append `WORKSPACE_NAME` to this path under any circumstances.**

Then convert it to a Windows-style path for `wt.exe` (which does not accept Unix paths):

```bash
cygpath -w "<WORKSPACE_DIR>"
```

Use the result as `WORKSPACE_DIR_WIN`. If `cygpath` is unavailable, manually replace a leading `/c/` with `C:\` and convert remaining `/` to `\`.

### Step 3: Generate a Session ID

```bash
python3 -c "import uuid; print(uuid.uuid4())" 2>/dev/null || uuidgen 2>/dev/null || echo "$(date +%s)-$$"
```

Store as `SESSION_ID`.

### Step 4: Launch the Session

```bash
wt.exe new-tab --title "<WORKSPACE_NAME>" -d "<WORKSPACE_DIR_WIN>" -- bash -c "claude --dangerously-skip-permissions --remote-control --session-id <SESSION_ID> --name '<WORKSPACE_NAME>'"
```

**Fallback chain** if `wt.exe` fails:
1. `psmux.exe new-window -n "<WORKSPACE_NAME>" -- bash -c "cd '<WORKSPACE_DIR>' && claude --dangerously-skip-permissions --remote-control --session-id <SESSION_ID> --name '<WORKSPACE_NAME>'"`
2. `cmd.exe /c start "<WORKSPACE_NAME>" bash -c "cd '<WORKSPACE_DIR>' && claude --dangerously-skip-permissions --remote-control --session-id <SESSION_ID> --name '<WORKSPACE_NAME>'"`
3. If all fail, report the error and print the manual command.

### Step 5: Report to User

```
Workspace: <WORKSPACE_NAME>
Directory: <WORKSPACE_DIR>
Session:   <SESSION_ID>
Resume:    claude --resume <SESSION_ID>
```

---

## Examples

| Command | Result |
|---|---|
| `/workspace hello-world` | Opens tab in `$WORKSPACES_DIR` (e.g. `~/code/workspace`), named "hello-world" |
| `/workspace hello-world /c/Users/etgarcia/code/CCClaw` | Opens tab in `CCClaw`, named "hello-world" |

---

## Notes

- `WORKSPACES_DIR` env var overrides the default root (`~/code/workspace`).
- `--session-id` enables later resume with `claude --resume <SESSION_ID>`.
- `wt.exe new-tab` is non-blocking — returns immediately after opening the tab.
