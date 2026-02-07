# gh repo - Repository Commands

## gh repo create
Create a new GitHub repository.

```
gh repo create [<name>] [flags]
```

**Alias:** `gh repo new`

| Flag | Short | Description |
|------|-------|-------------|
| `--add-readme` | | Add a README file |
| `--clone` | `-c` | Clone the new repository locally |
| `--description` | `-d` | Description of the repository |
| `--disable-issues` | | Disable issues |
| `--disable-wiki` | | Disable wiki |
| `--gitignore` | `-g` | Specify a gitignore template |
| `--homepage` | `-h` | Repository home page URL |
| `--include-all-branches` | | Include all branches from template |
| `--internal` | | Make internal |
| `--license` | `-l` | Specify an open source license |
| `--private` | | Make private |
| `--public` | | Make public |
| `--push` | | Push local commits to the new repository |
| `--remote` | `-r` | Specify remote name |
| `--source` | `-s` | Path to local repository as source |
| `--team` | `-t` | Organization team to grant access |
| `--template` | `-p` | Make based on a template repository |

**Examples:**
```bash
gh repo create my-project --public --clone
gh repo create my-org/my-project --public
gh repo create my-project --private --source=. --remote=upstream
```

---

## gh repo clone
Clone a GitHub repository locally.

```
gh repo clone <repository> [<directory>] [-- <gitflags>...]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--upstream-remote-name` | `-u` | Upstream remote name when cloning a fork (default "upstream") |

**Examples:**
```bash
gh repo clone cli/cli
gh repo clone myrepo
gh repo clone https://github.com/cli/cli
gh repo clone cli/cli workspace/cli
gh repo clone cli/cli -- --depth=1
```

---

## gh repo fork
Create a fork of a repository.

```
gh repo fork [<repository>] [-- <gitflags>...]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--clone` | | Clone the fork |
| `--default-branch-only` | | Only include the default branch |
| `--fork-name` | | Rename the forked repository |
| `--org` | | Create fork in an organization |
| `--remote` | | Add a git remote for the fork |
| `--remote-name` | | Name for the new remote (default "origin") |

---

## gh repo view
Display repo description and README.

```
gh repo view [<repository>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--branch` | `-b` | View a specific branch |
| `--jq` | `-q` | Filter JSON output |
| `--json` | | Output JSON with specified fields |
| `--template` | `-t` | Format JSON via Go template |
| `--web` | `-w` | Open in browser |

**JSON Fields:** archivedAt, assignableUsers, codeOfConduct, contactLinks, createdAt, defaultBranchRef, deleteBranchOnMerge, description, diskUsage, forkCount, fundingLinks, hasDiscussionsEnabled, hasIssuesEnabled, hasProjectsEnabled, hasWikiEnabled, homepageUrl, id, isArchived, isBlankIssuesEnabled, isEmpty, isFork, isInOrganization, isMirror, isPrivate, isSecurityPolicyEnabled, isTemplate, isUserConfigurationRepository, issueTemplates, issues, labels, languages, latestRelease, licenseInfo, mentionableUsers, mergeCommitAllowed, milestones, mirrorUrl, name, nameWithOwner, openGraphImageUrl, owner, parent, primaryLanguage, projects, projectsV2, pullRequestTemplates, pullRequests, pushedAt, rebaseMergeAllowed, repositoryTopics, securityPolicyUrl, squashMergeAllowed, sshUrl, stargazerCount, templateRepository, updatedAt, url, usesCustomOpenGraphImage, viewerCanAdminister, viewerDefaultCommitEmail, viewerDefaultMergeMethod, viewerHasStarred, viewerPermission, viewerPossibleCommitEmails, viewerSubscription, visibility, watchers

---

## gh repo list
List repositories owned by a user or organization.

```
gh repo list [<owner>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--archived` | | Show only archived repositories |
| `--fork` | | Show only forks |
| `--jq` | `-q` | Filter JSON output |
| `--json` | | Output JSON with specified fields |
| `--language` | `-l` | Filter by primary coding language |
| `--limit` | `-L` | Maximum items to fetch (default 30) |
| `--no-archived` | | Omit archived repositories |
| `--source` | | Show only non-forks |
| `--template` | `-t` | Format JSON via Go template |
| `--topic` | | Filter by topic |
| `--visibility` | | Filter by visibility: {public\|private\|internal} |

---

## gh repo edit
Edit repository settings.

```
gh repo edit [<repository>] [flags]
```

| Flag | Description |
|------|-------------|
| `--accept-visibility-change-consequences` | Accept visibility change consequences |
| `--add-topic` | Add repository topic |
| `--allow-forking` | Allow forking of an organization repository |
| `--allow-update-branch` | Allow PR head branch to be updated |
| `--default-branch` | Set default branch name |
| `--delete-branch-on-merge` | Delete head branch when PRs are merged |
| `--description` / `-d` | Description of the repository |
| `--enable-advanced-security` | Enable advanced security |
| `--enable-auto-merge` | Enable auto-merge |
| `--enable-discussions` | Enable discussions |
| `--enable-issues` | Enable issues |
| `--enable-merge-commit` | Enable merge commit |
| `--enable-projects` | Enable projects |
| `--enable-rebase-merge` | Enable rebase merge |
| `--enable-secret-scanning` | Enable secret scanning |
| `--enable-secret-scanning-push-protection` | Enable secret scanning push protection |
| `--enable-squash-merge` | Enable squash merge |
| `--enable-wiki` | Enable wiki |
| `--homepage` / `-h` | Repository home page URL |
| `--remove-topic` | Remove repository topic |
| `--template` | Make available as a template repository |
| `--visibility` | Change visibility: {public\|private\|internal} |

**Note:** Use `--<flag>=false` to toggle settings off.

**Examples:**
```bash
gh repo edit --enable-issues --enable-wiki
gh repo edit --enable-projects=false
```

---

## gh repo delete
Delete a repository.

```
gh repo delete [<repository>] [flags]
```

| Flag | Description |
|------|-------------|
| `--yes` | Confirm deletion without prompting |

---

## gh repo sync
Sync destination repository from source repository.

```
gh repo sync [<destination-repository>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--branch` | `-b` | Branch to sync (default: default branch) |
| `--force` | | Hard reset branch to match source |
| `--source` | `-s` | Source repository |

**Examples:**
```bash
gh repo sync
gh repo sync --branch v1
gh repo sync owner/cli-fork
gh repo sync owner/repo --source owner2/repo2
```

---

## gh repo rename
Rename a repository.

```
gh repo rename <new-name> [flags]
```

| Flag | Description |
|------|-------------|
| `--yes` | Skip confirmation prompt |

---

## gh repo archive / unarchive
Archive or unarchive a repository.

```
gh repo archive [<repository>] [flags]
gh repo unarchive [<repository>] [flags]
```

| Flag | Description |
|------|-------------|
| `--yes` | Skip confirmation prompt |

---

## gh repo set-default
Configure default repository for the current directory.

```
gh repo set-default [<repository>] [flags]
```

| Flag | Description |
|------|-------------|
| `--unset` | Unset the current default repository |
| `--view` | View the current default repository |
