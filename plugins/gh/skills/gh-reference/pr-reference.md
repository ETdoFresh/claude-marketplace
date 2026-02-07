# gh pr - Pull Request Commands

## gh pr create
Create a pull request on GitHub.

```
gh pr create [flags]
```

**Alias:** `gh pr new`

| Flag | Short | Description |
|------|-------|-------------|
| `--assignee` | `-a` | Assign people by login. Use "@me" to self-assign |
| `--base` | `-B` | Branch to merge into |
| `--body` | `-b` | Body for the pull request |
| `--body-file` | `-F` | Read body from file (use "-" for stdin) |
| `--draft` | `-d` | Mark as draft |
| `--dry-run` | | Print details instead of creating |
| `--editor` | `-e` | Open text editor for title and body |
| `--fill` | `-f` | Use commit info for title and body |
| `--fill-first` | | Use first commit info for title and body |
| `--fill-verbose` | | Use commits msg+body for description |
| `--head` | `-H` | Branch with commits (default: current branch) |
| `--label` | `-l` | Add labels by name |
| `--milestone` | `-m` | Add to milestone by name |
| `--no-maintainer-edit` | | Disable maintainer's ability to modify PR |
| `--project` | `-p` | Add to projects by title |
| `--recover` | | Recover input from a failed run |
| `--reviewer` | `-r` | Request reviews by handle |
| `--template` | `-T` | Template file for starting body text |
| `--title` | `-t` | Title for the pull request |
| `--web` | `-w` | Open web browser to create PR |

**Examples:**
```bash
gh pr create --title "Fix bug" --body "Everything works again"
gh pr create --reviewer monalisa,hubot --reviewer myorg/team-name
gh pr create --project "Roadmap"
gh pr create --base develop --head monalisa:feature
gh pr create --template "pull_request_template.md"
```

---

## gh pr list
List pull requests in a repository. Default: open PRs only.

```
gh pr list [flags]
```

**Alias:** `gh pr ls`

| Flag | Short | Description |
|------|-------|-------------|
| `--app` | | Filter by GitHub App author |
| `--assignee` | `-a` | Filter by assignee |
| `--author` | `-A` | Filter by author |
| `--base` | `-B` | Filter by base branch |
| `--draft` | `-d` | Filter by draft state |
| `--head` | `-H` | Filter by head branch |
| `--jq` | `-q` | Filter JSON output using jq expression |
| `--json` | | Output JSON with specified fields |
| `--label` | `-l` | Filter by label |
| `--limit` | `-L` | Maximum items to fetch (default 30) |
| `--search` | `-S` | Search PRs with query |
| `--state` | `-s` | Filter by state: {open\|closed\|merged\|all} (default "open") |
| `--template` | `-t` | Format JSON via Go template |
| `--web` | `-w` | List in web browser |

**JSON Fields:** additions, assignees, author, autoMergeRequest, baseRefName, baseRefOid, body, changedFiles, closed, closedAt, closingIssuesReferences, comments, commits, createdAt, deletions, files, fullDatabaseId, headRefName, headRefOid, headRepository, headRepositoryOwner, id, isCrossRepository, isDraft, labels, latestReviews, maintainerCanModify, mergeCommit, mergeStateStatus, mergeable, mergedAt, mergedBy, milestone, number, potentialMergeCommit, projectCards, projectItems, reactionGroups, reviewDecision, reviewRequests, reviews, state, statusCheckRollup, title, updatedAt, url

**Examples:**
```bash
gh pr list --author "@me"
gh pr list --head "typo"
gh pr list --label bug --label "priority 1"
gh pr list --search "status:success review:required"
gh pr list --search "<SHA>" --state merged
```

---

## gh pr view
Display PR title, body, and info.

```
gh pr view [<number> | <url> | <branch>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--comments` | `-c` | View PR comments |
| `--jq` | `-q` | Filter JSON output |
| `--json` | | Output JSON with specified fields |
| `--template` | `-t` | Format JSON via Go template |
| `--web` | `-w` | Open in browser |

---

## gh pr merge
Merge a pull request.

```
gh pr merge [<number> | <url> | <branch>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--admin` | | Use admin privileges to merge (bypass requirements) |
| `--author-email` | `-A` | Email for merge commit author |
| `--auto` | | Auto-merge after requirements met |
| `--body` | `-b` | Body text for merge commit |
| `--body-file` | `-F` | Read body from file |
| `--delete-branch` | `-d` | Delete local and remote branch after merge |
| `--disable-auto` | | Disable auto-merge |
| `--match-head-commit` | | SHA that PR head must match to allow merge |
| `--merge` | `-m` | Merge via merge commit |
| `--rebase` | `-r` | Rebase onto base branch |
| `--squash` | `-s` | Squash into one commit |
| `--subject` | `-t` | Subject for merge commit |

---

## gh pr checkout
Check out a PR in git.

```
gh pr checkout [<number> | <url> | <branch>] [flags]
```

**Alias:** `gh pr co`

| Flag | Short | Description |
|------|-------|-------------|
| `--branch` | `-b` | Local branch name (default: head branch name) |
| `--detach` | | Checkout with detached HEAD |
| `--force` | `-f` | Reset existing local branch to latest PR state |
| `--recurse-submodules` | | Update all submodules after checkout |

---

## gh pr diff
View changes in a PR.

```
gh pr diff [<number> | <url> | <branch>] [flags]
```

| Flag | Description |
|------|-------------|
| `--color` | Use color: {always\|never\|auto} (default "auto") |
| `--name-only` | Display only names of changed files |
| `--patch` | Display in patch format |
| `--web` / `-w` | Open in browser |

---

## gh pr review
Add a review to a PR.

```
gh pr review [<number> | <url> | <branch>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--approve` | `-a` | Approve PR |
| `--body` | `-b` | Body of review |
| `--body-file` | `-F` | Read body from file |
| `--comment` | `-c` | Comment on PR |
| `--request-changes` | `-r` | Request changes |

**Examples:**
```bash
gh pr review --approve
gh pr review --comment -b "interesting"
gh pr review 123 -r -b "needs more ASCII art"
```

---

## gh pr edit
Edit a pull request.

```
gh pr edit [<number> | <url> | <branch>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--add-assignee` | | Add assignees by login. "@me" or "@copilot" supported |
| `--add-label` | | Add labels by name |
| `--add-project` | | Add to projects by title |
| `--add-reviewer` | | Add reviewers by login |
| `--base` | `-B` | Change base branch |
| `--body` | `-b` | Set new body |
| `--body-file` | `-F` | Read body from file |
| `--milestone` | `-m` | Edit milestone by name |
| `--remove-assignee` | | Remove assignees by login |
| `--remove-label` | | Remove labels by name |
| `--remove-milestone` | | Remove milestone association |
| `--remove-project` | | Remove from projects by title |
| `--remove-reviewer` | | Remove reviewers by login |
| `--title` | `-t` | Set new title |

---

## gh pr close
Close a pull request.

```
gh pr close {<number> | <url> | <branch>} [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--comment` | `-c` | Leave a closing comment |
| `--delete-branch` | `-d` | Delete local and remote branch |

---

## gh pr reopen
Reopen a pull request.

```
gh pr reopen {<number> | <url> | <branch>} [flags]
```

No additional flags beyond inherited.

---

## gh pr comment
Add a comment to a PR.

```
gh pr comment [<number> | <url> | <branch>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--body` | `-b` | Comment body text |
| `--body-file` | `-F` | Read body from file |
| `--create-if-none` | | Create new comment if none found (use with --edit-last) |
| `--delete-last` | | Delete last comment of current user |
| `--edit-last` | | Edit last comment of current user |
| `--editor` | `-e` | Open text editor |
| `--web` | `-w` | Open browser to write comment |
| `--yes` | | Skip delete confirmation |

---

## gh pr checks
Show CI status for a PR.

```
gh pr checks [<number> | <url> | <branch>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--fail-fast` | | Exit watch mode on first failure |
| `--interval` | `-i` | Refresh interval in seconds (default 10) |
| `--jq` | `-q` | Filter JSON output |
| `--json` | | Output JSON with specified fields |
| `--required` | | Only show required checks |
| `--template` | `-t` | Format JSON via Go template |
| `--watch` | | Watch checks until they finish |
| `--web` | `-w` | Open in browser |

**JSON Fields:** bucket, completedAt, description, event, link, name, startedAt, state, workflow

**Exit code 8:** Checks pending

---

## gh pr status
Show status of relevant PRs.

```
gh pr status [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--conflict-status` | `-c` | Display merge conflict status |
| `--jq` | `-q` | Filter JSON output |
| `--json` | | Output JSON with specified fields |
| `--template` | `-t` | Format JSON via Go template |

---

## gh pr ready
Mark PR as ready for review.

```
gh pr ready [<number> | <url> | <branch>] [flags]
```

| Flag | Description |
|------|-------------|
| `--undo` | Convert PR to "draft" |

---

## gh pr revert
Revert a pull request.

```
gh pr revert {<number> | <url> | <branch>} [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--body` | `-b` | Body for revert PR |
| `--body-file` | `-F` | Read body from file |
| `--draft` | `-d` | Mark revert PR as draft |
| `--title` | `-t` | Title for revert PR |

---

## gh pr lock / unlock
Lock or unlock PR conversation.

```
gh pr lock {<number> | <url>} [flags]
gh pr unlock {<number> | <url>} [flags]
```

| Flag (lock only) | Short | Description |
|------|-------|-------------|
| `--reason` | `-r` | Reason: {off_topic\|resolved\|spam\|too_heated} |

---

## gh pr update-branch
Update PR branch with latest base branch changes.

```
gh pr update-branch [<number> | <url> | <branch>] [flags]
```

| Flag | Description |
|------|-------------|
| `--rebase` | Update by rebasing on top of latest base branch |
