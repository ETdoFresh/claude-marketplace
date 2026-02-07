# gh issue - Issue Commands

## gh issue create
Create an issue on GitHub.

```
gh issue create [flags]
```

**Alias:** `gh issue new`

| Flag | Short | Description |
|------|-------|-------------|
| `--assignee` | `-a` | Assign people by login. "@me" to self-assign, "@copilot" for Copilot |
| `--body` | `-b` | Supply a body |
| `--body-file` | `-F` | Read body from file (use "-" for stdin) |
| `--editor` | `-e` | Open text editor for title and body |
| `--label` | `-l` | Add labels by name |
| `--milestone` | `-m` | Add to milestone by name |
| `--project` | `-p` | Add to projects by title |
| `--recover` | | Recover input from a failed run |
| `--template` | `-T` | Template name for starting body text |
| `--title` | `-t` | Supply a title |
| `--web` | `-w` | Open browser to create issue |

**Examples:**
```bash
gh issue create --title "I found a bug" --body "Nothing works"
gh issue create --label "bug,help wanted"
gh issue create --assignee monalisa,hubot
gh issue create --assignee "@me"
gh issue create --project "Roadmap"
gh issue create --template "Bug Report"
```

---

## gh issue list
List issues in a repository. Default: open issues only.

```
gh issue list [flags]
```

**Alias:** `gh issue ls`

| Flag | Short | Description |
|------|-------|-------------|
| `--app` | | Filter by GitHub App author |
| `--assignee` | `-a` | Filter by assignee |
| `--author` | `-A` | Filter by author |
| `--jq` | `-q` | Filter JSON output |
| `--json` | | Output JSON with specified fields |
| `--label` | `-l` | Filter by label |
| `--limit` | `-L` | Maximum items to fetch (default 30) |
| `--mention` | | Filter by mention |
| `--milestone` | `-m` | Filter by milestone number or title |
| `--search` | `-S` | Search issues with query |
| `--state` | `-s` | Filter by state: {open\|closed\|all} (default "open") |
| `--template` | `-t` | Format JSON via Go template |
| `--web` | `-w` | List in web browser |

**JSON Fields:** assignees, author, body, closed, closedAt, closedByPullRequestsReferences, comments, createdAt, id, isPinned, labels, milestone, number, projectCards, projectItems, reactionGroups, state, stateReason, title, updatedAt, url

**Examples:**
```bash
gh issue list --label "bug" --label "help wanted"
gh issue list --author monalisa
gh issue list --assignee "@me"
gh issue list --milestone "The big 1.0"
gh issue list --search "error no:assignee sort:created-asc"
gh issue list --state all
```

---

## gh issue view
Display issue info.

```
gh issue view {<number> | <url>} [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--comments` | `-c` | View issue comments |
| `--jq` | `-q` | Filter JSON output |
| `--json` | | Output JSON with specified fields |
| `--template` | `-t` | Format JSON via Go template |
| `--web` | `-w` | Open in browser |

---

## gh issue edit
Edit one or more issues.

```
gh issue edit {<numbers> | <urls>} [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--add-assignee` | | Add assignees by login. "@me" or "@copilot" supported |
| `--add-label` | | Add labels by name |
| `--add-project` | | Add to projects by title |
| `--body` | `-b` | Set new body |
| `--body-file` | `-F` | Read body from file |
| `--milestone` | `-m` | Edit milestone by name |
| `--remove-assignee` | | Remove assignees by login |
| `--remove-label` | | Remove labels by name |
| `--remove-milestone` | | Remove milestone association |
| `--remove-project` | | Remove from projects by title |
| `--title` | `-t` | Set new title |

**Examples:**
```bash
gh issue edit 23 --title "I found a bug" --body "Nothing works"
gh issue edit 23 --add-label "bug,help wanted" --remove-label "core"
gh issue edit 23 --add-assignee "@me" --remove-assignee monalisa,hubot
gh issue edit 23 --add-project "Roadmap" --remove-project v1,v2
gh issue edit 23 --milestone "Version 1"
gh issue edit 23 --remove-milestone
gh issue edit 23 34 --add-label "help wanted"
```

---

## gh issue close
Close an issue.

```
gh issue close {<number> | <url>} [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--comment` | `-c` | Leave a closing comment |
| `--reason` | `-r` | Reason: {completed\|not planned} |

---

## gh issue reopen
Reopen an issue.

```
gh issue reopen {<number> | <url>} [flags]
```

No additional flags beyond inherited.

---

## gh issue comment
Add a comment to an issue.

```
gh issue comment {<number> | <url>} [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--body` | `-b` | Comment body text |
| `--body-file` | `-F` | Read body from file |
| `--create-if-none` | | Create new comment if none (use with --edit-last) |
| `--delete-last` | | Delete last comment of current user |
| `--edit-last` | | Edit last comment of current user |
| `--editor` | `-e` | Open text editor |
| `--web` | `-w` | Open browser to write comment |
| `--yes` | | Skip delete confirmation |

---

## gh issue delete
Delete an issue.

```
gh issue delete {<number> | <url>} [flags]
```

| Flag | Description |
|------|-------------|
| `--yes` | Confirm deletion without prompting |

---

## gh issue develop
Manage linked branches for an issue.

```
gh issue develop {<number> | <url>} [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--base` | `-b` | Remote branch to create new branch from |
| `--branch-repo` | | Repo where you want to create the branch |
| `--checkout` | `-c` | Checkout branch after creating it |
| `--list` | `-l` | List linked branches for the issue |
| `--name` | `-n` | Name of the branch to create |

**Examples:**
```bash
gh issue develop --list 123
gh issue develop 123 --base my-feature
gh issue develop 123 --checkout
gh issue develop 123 --repo cli/cli --branch-repo monalisa/cli
```

---

## gh issue lock / unlock
Lock or unlock issue conversation.

```
gh issue lock {<number> | <url>} [flags]
gh issue unlock {<number> | <url>} [flags]
```

| Flag (lock only) | Short | Description |
|------|-------|-------------|
| `--reason` | `-r` | Reason: {off_topic\|resolved\|spam\|too_heated} |

---

## gh issue pin / unpin
Pin or unpin an issue to a repository.

```
gh issue pin {<number> | <url>} [flags]
gh issue unpin {<number> | <url>} [flags]
```

No additional flags beyond inherited.

---

## gh issue transfer
Transfer issue to another repository.

```
gh issue transfer {<number> | <url>} <destination-repo> [flags]
```

No additional flags beyond inherited.

---

## gh issue status
Show status of relevant issues.

```
gh issue status [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--jq` | `-q` | Filter JSON output |
| `--json` | | Output JSON with specified fields |
| `--template` | `-t` | Format JSON via Go template |
