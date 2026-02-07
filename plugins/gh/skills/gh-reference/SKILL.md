---
name: gh-reference
description: Comprehensive reference for the GitHub CLI (gh) command. Use when working with GitHub operations like pull requests, issues, repos, releases, workflows, Actions runs, secrets, labels, gists, or the GitHub API. Covers all gh commands, subcommands, flags, and common patterns.
user-invocable: false
---

# GitHub CLI (gh) Complete Reference

You have access to the `gh` CLI for all GitHub operations. This skill provides a comprehensive reference for every command, flag, and common usage pattern.

## Quick Command Map

| Task | Command |
|------|---------|
| Create PR | `gh pr create --title "..." --body "..."` |
| List PRs | `gh pr list` |
| View PR | `gh pr view <number>` |
| Merge PR | `gh pr merge <number> --squash --delete-branch` |
| Checkout PR | `gh pr checkout <number>` |
| PR diff | `gh pr diff <number>` |
| PR checks | `gh pr checks <number>` |
| Create issue | `gh issue create --title "..." --body "..."` |
| List issues | `gh issue list` |
| View issue | `gh issue view <number>` |
| Close issue | `gh issue close <number>` |
| Create release | `gh release create <tag> --generate-notes` |
| View repo | `gh repo view` |
| Clone repo | `gh repo clone <owner/repo>` |
| Raw API call | `gh api <endpoint>` |
| Search code | `gh search code <query>` |
| Search issues | `gh search issues <query>` |
| List runs | `gh run list` |
| View run | `gh run view <run-id>` |
| Trigger workflow | `gh workflow run <workflow>` |
| List labels | `gh label list` |
| Create gist | `gh gist create <file>` |
| Set secret | `gh secret set <name>` |
| Set variable | `gh variable set <name>` |
| Auth status | `gh auth status` |
| **API-Only Operations** | |
| Create/edit/delete files | `gh api repos/{owner}/{repo}/contents/path -X PUT ...` |
| Create branch | `gh api repos/{owner}/{repo}/git/refs -f ref="refs/heads/name" ...` |
| Delete branch | `gh api repos/{owner}/{repo}/git/refs/heads/name -X DELETE` |
| Create tag | `gh api repos/{owner}/{repo}/git/refs -f ref="refs/tags/v1.0" ...` |
| Add reaction | `gh api repos/{owner}/{repo}/issues/123/reactions -f content="+1"` |
| Manage milestones | `gh api repos/{owner}/{repo}/milestones ...` |
| Manage webhooks | `gh api repos/{owner}/{repo}/hooks ...` |
| Branch protection | `gh api repos/{owner}/{repo}/branches/main/protection ...` |
| Manage collaborators | `gh api repos/{owner}/{repo}/collaborators/user ...` |
| Notifications | `gh api notifications ...` |
| Compare branches | `gh api repos/{owner}/{repo}/compare/main...feature` |
| Repo statistics | `gh api repos/{owner}/{repo}/stats/contributors` |
| Deployments | `gh api repos/{owner}/{repo}/deployments ...` |
| Star/unstar repo | `gh api user/starred/owner/repo -X PUT` |
| Repository dispatch | `gh api repos/{owner}/{repo}/dispatches -f event_type="..." ...` |
| Org management | `gh api orgs/{org}/members ...` |

## Inherited Flags (Available on Most Commands)

```
--help                          Show help for command
-R, --repo [HOST/]OWNER/REPO   Select another repository
```

## JSON Output (Available on list/view/status Commands)

```
--json <fields>       Output JSON with specified fields
-q, --jq <expr>       Filter JSON output using jq expression
-t, --template <str>  Format JSON output using Go template
```

## Detailed References

For complete flags and parameters for each command group, see:

- [pr-reference.md](pr-reference.md) - Pull request commands (create, list, view, merge, checkout, diff, review, edit, close, reopen, comment, checks, status, ready, revert, lock, unlock, update-branch)
- [issue-reference.md](issue-reference.md) - Issue commands (create, list, view, edit, close, reopen, comment, delete, develop, lock, unlock, pin, unpin, transfer, status)
- [repo-reference.md](repo-reference.md) - Repository commands (create, clone, fork, view, list, edit, delete, sync, rename, archive, unarchive, deploy-key, set-default)
- [advanced-reference.md](advanced-reference.md) - API calls, search, releases, workflow runs, Actions, secrets, variables, labels, gists, auth, and more. Also includes **API-only recipes** for: file operations, branch/tag management, reactions, milestones, webhooks, branch protection, collaborators, notifications, commit comments/comparisons, repo statistics, deployments, starring/watching, repository dispatch events, and organization management

## Important Patterns

### HEREDOC for Multi-line Bodies
Always use HEREDOC for multi-line body text to preserve formatting:
```bash
gh pr create --title "Title" --body "$(cat <<'EOF'
## Summary
- Change 1
- Change 2

## Test plan
- [ ] Test A
EOF
)"
```

### JSON Filtering with jq
```bash
# Get PR titles
gh pr list --json title -q '.[].title'

# Get issue URLs
gh issue list --json url,number -q '.[] | "\(.number): \(.url)"'

# Get failed workflow runs
gh run list --json conclusion,name -q '.[] | select(.conclusion=="failure")'
```

### Working with the API Directly
```bash
# GET endpoint with placeholders
gh api repos/{owner}/{repo}/pulls

# POST with fields
gh api repos/{owner}/{repo}/issues/123/comments -f body='comment text'

# GraphQL queries
gh api graphql -f query='{ viewer { login } }'

# Paginate results
gh api repos/{owner}/{repo}/issues --paginate
```

### Cross-Repository Operations
```bash
# Any command can target a different repo with -R
gh pr list -R owner/other-repo
gh issue view 42 -R owner/other-repo
```

### PR Review Comments via API
```bash
# View comments on a PR
gh api repos/{owner}/{repo}/pulls/123/comments

# View review comments
gh api repos/{owner}/{repo}/pulls/123/reviews
```
