# gh Advanced Commands Reference

## gh api - Raw GitHub API Calls

Make authenticated HTTP requests to the GitHub API.

```
gh api <endpoint> [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--cache` | | Cache the response, e.g. "3600s", "60m", "1h" |
| `--field` | `-F` | Add a typed parameter (key=value). Use "@path" to read from file |
| `--header` | `-H` | Add HTTP request header (key:value) |
| `--hostname` | | GitHub hostname (default "github.com") |
| `--include` | `-i` | Include HTTP status line and headers |
| `--input` | | File to use as request body ("-" for stdin) |
| `--jq` | `-q` | Query response with jq syntax |
| `--method` | `-X` | HTTP method (default "GET") |
| `--paginate` | | Fetch all pages of results |
| `--preview` | `-p` | Opt into GitHub API previews |
| `--raw-field` | `-f` | Add a string parameter (key=value) |
| `--silent` | | Do not print response body |
| `--slurp` | | Use with --paginate to return array of all pages |
| `--template` | `-t` | Format JSON via Go template |
| `--verbose` | | Include full HTTP request and response |

**Placeholders:** `{owner}`, `{repo}`, `{branch}` are replaced with values from current directory.

**Type conversion with -F:** `true`/`false`/`null`/integers get converted to JSON types. Values starting with `@` read from file.

**Nested parameters:** Use `key[subkey]=value` for nested values. Use `key[]=value1`, `key[]=value2` for arrays.

**Examples:**
```bash
# List releases
gh api repos/{owner}/{repo}/releases

# Post issue comment
gh api repos/{owner}/{repo}/issues/123/comments -f body='Hi from CLI'

# GET request with query params
gh api -X GET search/issues -f q='repo:cli/cli is:open remote'

# Custom header
gh api -H 'Accept: application/vnd.github.v3.raw+json' ...

# Filter with jq
gh api repos/{owner}/{repo}/issues --jq '.[].title'

# GraphQL query
gh api graphql -F owner='{owner}' -F name='{repo}' -f query='
  query($name: String!, $owner: String!) {
    repository(owner: $owner, name: $name) {
      releases(last: 3) { nodes { tagName } }
    }
  }
'

# Paginated GraphQL
gh api graphql --paginate -f query='
  query($endCursor: String) {
    viewer {
      repositories(first: 100, after: $endCursor) {
        nodes { nameWithOwner }
        pageInfo { hasNextPage endCursor }
      }
    }
  }
'
```

### Common API Recipes: File Operations (Contents API)

The GitHub Contents API lets you create, read, update, and delete files directly on the remote repo without cloning.

**Read a file:**
```bash
# Get file content (base64 encoded) and metadata
gh api repos/{owner}/{repo}/contents/path/to/file.txt

# Get just the decoded content
gh api repos/{owner}/{repo}/contents/path/to/file.txt --jq '.content' | base64 -d

# Get file SHA (needed for update/delete)
gh api repos/{owner}/{repo}/contents/path/to/file.txt --jq '.sha'

# Read from a specific branch
gh api repos/{owner}/{repo}/contents/path/to/file.txt -f ref=my-branch
```

**Create a new file:**
```bash
# Content must be base64 encoded
gh api repos/{owner}/{repo}/contents/path/to/newfile.txt \
  -X PUT \
  -f message="Add new file" \
  -f content="$(echo 'Hello World' | base64)" \
  -f branch="main"
```

**Update an existing file (requires current SHA):**
```bash
# First get the current SHA
SHA=$(gh api repos/{owner}/{repo}/contents/path/to/file.txt --jq '.sha')

# Then update with the SHA
gh api repos/{owner}/{repo}/contents/path/to/file.txt \
  -X PUT \
  -f message="Update file" \
  -f content="$(echo 'Updated content' | base64)" \
  -f sha="$SHA" \
  -f branch="main"
```

**Delete a file (requires current SHA):**
```bash
SHA=$(gh api repos/{owner}/{repo}/contents/path/to/file.txt --jq '.sha')

gh api repos/{owner}/{repo}/contents/path/to/file.txt \
  -X DELETE \
  -f message="Delete file" \
  -f sha="$SHA" \
  -f branch="main"
```

**List directory contents:**
```bash
# List files in a directory
gh api repos/{owner}/{repo}/contents/path/to/directory

# List with names only
gh api repos/{owner}/{repo}/contents/path/to/directory --jq '.[].name'
```

**Limitations:**
- Content must be base64 encoded for creates/updates
- Current file SHA is required for updates and deletes (prevents race conditions)
- Each API call = one commit per file (no batching)
- For multi-file atomic commits, use the lower-level Git Trees + Commits API:
  1. `GET /repos/{owner}/{repo}/git/ref/heads/{branch}` - get current commit SHA
  2. `POST /repos/{owner}/{repo}/git/trees` - create tree with multiple file changes
  3. `POST /repos/{owner}/{repo}/git/commits` - create commit pointing to new tree
  4. `PATCH /repos/{owner}/{repo}/git/refs/heads/{branch}` - update branch ref

### Common API Recipes: Branch & Tag Management

No dedicated `gh branch` or `gh tag` commands exist. Use the Git Refs API.

**Create a branch:**
```bash
# Get the SHA of the commit to branch from
SHA=$(gh api repos/{owner}/{repo}/git/ref/heads/main --jq '.object.sha')

# Create the branch
gh api repos/{owner}/{repo}/git/refs -f ref="refs/heads/new-branch" -f sha="$SHA"
```

**Delete a branch:**
```bash
gh api repos/{owner}/{repo}/git/refs/heads/branch-name -X DELETE
```

**Create a lightweight tag:**
```bash
SHA=$(gh api repos/{owner}/{repo}/git/ref/heads/main --jq '.object.sha')
gh api repos/{owner}/{repo}/git/refs -f ref="refs/tags/v1.0.0" -f sha="$SHA"
```

**Create an annotated tag:**
```bash
# First create the tag object
TAG_SHA=$(gh api repos/{owner}/{repo}/git/tags \
  -f tag="v1.0.0" \
  -f message="Release v1.0.0" \
  -f object="<commit-sha>" \
  -f type="commit" \
  --jq '.sha')

# Then create the ref pointing to the tag object
gh api repos/{owner}/{repo}/git/refs -f ref="refs/tags/v1.0.0" -f sha="$TAG_SHA"
```

**Delete a tag:**
```bash
gh api repos/{owner}/{repo}/git/refs/tags/v1.0.0 -X DELETE
```

**List branches:**
```bash
gh api repos/{owner}/{repo}/branches --jq '.[].name'
```

**List tags:**
```bash
gh api repos/{owner}/{repo}/tags --jq '.[].name'
```

### Common API Recipes: Reactions

No dedicated `gh reaction` command. Use the Reactions API.

Reaction options: `+1`, `-1`, `laugh`, `confused`, `heart`, `hooray`, `rocket`, `eyes`

**Add reaction to an issue or PR:**
```bash
gh api repos/{owner}/{repo}/issues/123/reactions -f content="+1"
```

**Add reaction to an issue/PR comment:**
```bash
gh api repos/{owner}/{repo}/issues/comments/456/reactions -f content="heart"
```

**Add reaction to a PR review comment:**
```bash
gh api repos/{owner}/{repo}/pulls/comments/789/reactions -f content="rocket"
```

**List reactions on an issue:**
```bash
gh api repos/{owner}/{repo}/issues/123/reactions --jq '.[].content'
```

**Delete a reaction:**
```bash
gh api repos/{owner}/{repo}/issues/123/reactions/111 -X DELETE
```

### Common API Recipes: Milestones

No dedicated `gh milestone` command exists.

**Create a milestone:**
```bash
gh api repos/{owner}/{repo}/milestones \
  -f title="v2.0" \
  -f description="Next major release" \
  -f due_on="2026-06-01T00:00:00Z" \
  -f state="open"
```

**List milestones:**
```bash
gh api repos/{owner}/{repo}/milestones --jq '.[] | "\(.number): \(.title) (\(.state))"'
```

**Update a milestone:**
```bash
gh api repos/{owner}/{repo}/milestones/1 -X PATCH -f title="v2.0 - Updated"
```

**Close a milestone:**
```bash
gh api repos/{owner}/{repo}/milestones/1 -X PATCH -f state="closed"
```

**Delete a milestone:**
```bash
gh api repos/{owner}/{repo}/milestones/1 -X DELETE
```

### Common API Recipes: Webhooks

No dedicated `gh webhook` command exists.

**List webhooks:**
```bash
gh api repos/{owner}/{repo}/hooks
```

**Create a webhook:**
```bash
gh api repos/{owner}/{repo}/hooks \
  -f name="web" \
  -f config[url]="https://example.com/webhook" \
  -f config[content_type]="json" \
  -f config[secret]="my-secret" \
  -F active=true \
  -F 'events[]=push' \
  -F 'events[]=pull_request'
```

**Update a webhook:**
```bash
gh api repos/{owner}/{repo}/hooks/123 -X PATCH \
  -f config[url]="https://example.com/new-webhook" \
  -F 'events[]=push' \
  -F 'events[]=issues'
```

**Delete a webhook:**
```bash
gh api repos/{owner}/{repo}/hooks/123 -X DELETE
```

**Ping a webhook (test delivery):**
```bash
gh api repos/{owner}/{repo}/hooks/123/pings -X POST
```

### Common API Recipes: Branch Protection

`gh ruleset` exists for rulesets, but classic branch protection uses the API.

**Get branch protection:**
```bash
gh api repos/{owner}/{repo}/branches/main/protection
```

**Set branch protection (use --input for complex rules):**
```bash
# Create a JSON file with protection rules
cat > /tmp/protection.json << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["ci/build", "ci/test"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null
}
EOF

gh api repos/{owner}/{repo}/branches/main/protection -X PUT --input /tmp/protection.json
```

**Delete branch protection:**
```bash
gh api repos/{owner}/{repo}/branches/main/protection -X DELETE
```

**Require signed commits:**
```bash
gh api repos/{owner}/{repo}/branches/main/protection/required_signatures -X POST
```

### Common API Recipes: Collaborators & Permissions

No dedicated `gh collaborator` command exists.

**List collaborators:**
```bash
gh api repos/{owner}/{repo}/collaborators --jq '.[].login'
```

**Add a collaborator:**
```bash
# permission: pull, triage, push, maintain, admin
gh api repos/{owner}/{repo}/collaborators/username -X PUT -f permission="push"
```

**Remove a collaborator:**
```bash
gh api repos/{owner}/{repo}/collaborators/username -X DELETE
```

**Check a user's permission level:**
```bash
gh api repos/{owner}/{repo}/collaborators/username/permission --jq '.permission'
```

**List pending invitations:**
```bash
gh api repos/{owner}/{repo}/invitations
```

### Common API Recipes: Notifications

No dedicated `gh notification` command (only `gh status` for a summary).

**List notifications:**
```bash
gh api notifications --jq '.[] | "\(.subject.type): \(.subject.title)"'
```

**List unread notifications:**
```bash
gh api notifications -f all=false
```

**Mark all notifications as read:**
```bash
gh api notifications -X PUT -f read=true
```

**Mark a specific thread as read:**
```bash
gh api notifications/threads/123 -X PATCH
```

**Subscribe to a thread:**
```bash
gh api notifications/threads/123/subscription -X PUT -F ignored=false
```

**Unsubscribe from a thread:**
```bash
gh api notifications/threads/123/subscription -X PUT -F ignored=true
```

### Common API Recipes: Commit Comments & Comparisons

**Comment on a specific commit:**
```bash
gh api repos/{owner}/{repo}/commits/<sha>/comments -f body="Nice change!"
```

**Comment on a specific line in a commit:**
```bash
gh api repos/{owner}/{repo}/commits/<sha>/comments \
  -f body="Issue here" \
  -f path="src/main.js" \
  -F position=10
```

**List comments on a commit:**
```bash
gh api repos/{owner}/{repo}/commits/<sha>/comments --jq '.[].body'
```

**Compare two branches or commits:**
```bash
# Compare branches
gh api repos/{owner}/{repo}/compare/main...feature

# Just get ahead/behind counts
gh api repos/{owner}/{repo}/compare/main...feature --jq '"\(.ahead_by) ahead, \(.behind_by) behind"'

# Get list of changed files
gh api repos/{owner}/{repo}/compare/main...feature --jq '.files[].filename'

# Get commit messages between two refs
gh api repos/{owner}/{repo}/compare/v1.0.0...v2.0.0 --jq '.commits[].commit.message'
```

**Get full commit details:**
```bash
gh api repos/{owner}/{repo}/commits/<sha>
```

### Common API Recipes: Repository Statistics

**Contributor stats (commits, additions, deletions per contributor):**
```bash
gh api repos/{owner}/{repo}/stats/contributors --jq '.[] | "\(.author.login): \(.total) commits"'
```

**Weekly commit activity (last year):**
```bash
gh api repos/{owner}/{repo}/stats/commit_activity
```

**Code frequency (weekly additions/deletions):**
```bash
gh api repos/{owner}/{repo}/stats/code_frequency
```

**Languages breakdown:**
```bash
gh api repos/{owner}/{repo}/languages
```

**Community profile (README, license, contributing, etc.):**
```bash
gh api repos/{owner}/{repo}/community/profile
```

**Traffic - clones:**
```bash
gh api repos/{owner}/{repo}/traffic/clones
```

**Traffic - views:**
```bash
gh api repos/{owner}/{repo}/traffic/views
```

**Traffic - top referral sources:**
```bash
gh api repos/{owner}/{repo}/traffic/popular/referrers
```

### Common API Recipes: Deployments

**Create a deployment:**
```bash
gh api repos/{owner}/{repo}/deployments \
  -f ref="main" \
  -f environment="production" \
  -f description="Deploy to prod" \
  -F auto_merge=false
```

**Create a deployment status:**
```bash
gh api repos/{owner}/{repo}/deployments/123/statuses \
  -f state="success" \
  -f environment_url="https://myapp.com" \
  -f description="Deployed successfully"
```

Deployment states: `error`, `failure`, `inactive`, `in_progress`, `queued`, `pending`, `success`

**List deployments:**
```bash
gh api repos/{owner}/{repo}/deployments --jq '.[] | "\(.id): \(.environment) - \(.ref)"'
```

**List deployment statuses:**
```bash
gh api repos/{owner}/{repo}/deployments/123/statuses
```

### Common API Recipes: Starring & Watching

**Star a repo:**
```bash
gh api user/starred/owner/repo -X PUT
```

**Unstar a repo:**
```bash
gh api user/starred/owner/repo -X DELETE
```

**Check if you starred a repo (204 = yes, 404 = no):**
```bash
gh api user/starred/owner/repo -i 2>&1 | head -1
```

**List your starred repos:**
```bash
gh api user/starred --paginate --jq '.[].full_name'
```

**Watch a repo (subscribe to all notifications):**
```bash
gh api repos/{owner}/{repo}/subscription -X PUT -F subscribed=true
```

**Unwatch a repo:**
```bash
gh api repos/{owner}/{repo}/subscription -X DELETE
```

**List stargazers of a repo:**
```bash
gh api repos/{owner}/{repo}/stargazers --jq '.[].login'
```

### Common API Recipes: Repository Dispatch (Custom Events)

Trigger custom `repository_dispatch` events for CI/CD workflows.

**Trigger a repository dispatch event:**
```bash
gh api repos/{owner}/{repo}/dispatches \
  -f event_type="deploy" \
  -f client_payload[environment]="production" \
  -f client_payload[version]="1.2.3"
```

The receiving workflow must listen for `repository_dispatch`:
```yaml
on:
  repository_dispatch:
    types: [deploy]
```

### Common API Recipes: Organization Management

**List organization members:**
```bash
gh api orgs/{org}/members --jq '.[].login'
```

**Check membership:**
```bash
gh api orgs/{org}/members/username
```

**List organization teams:**
```bash
gh api orgs/{org}/teams --jq '.[].name'
```

**List team members:**
```bash
gh api orgs/{org}/teams/{team_slug}/members --jq '.[].login'
```

**Add a user to a team:**
```bash
gh api orgs/{org}/teams/{team_slug}/memberships/username -X PUT -f role="member"
```

**List organization repos:**
```bash
gh api orgs/{org}/repos --paginate --jq '.[].name'
```

---

## gh search - Search GitHub

### gh search issues
```
gh search issues [<query>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--app` | | Filter by GitHub App author |
| `--archived` | | Filter by archived state |
| `--assignee` | | Filter by assignee |
| `--author` | | Filter by author |
| `--closed` | | Filter on closed date |
| `--commenter` | | Filter by commenter |
| `--comments` | | Filter on number of comments |
| `--created` | | Filter on created date |
| `--include-prs` | | Include pull requests in results |
| `--interactions` | | Filter on number of reactions and comments |
| `--involves` | | Filter by user involvement |
| `--label` | | Filter on label |
| `--language` | | Filter by coding language |
| `--limit` | `-L` | Maximum results (default 30) |
| `--locked` | | Filter on locked status |
| `--match` | | Restrict to field: {title\|body\|comments} |
| `--mentions` | | Filter by user mentions |
| `--milestone` | | Filter by milestone title |
| `--no-assignee` | | Filter on missing assignee |
| `--no-label` | | Filter on missing label |
| `--no-milestone` | | Filter on missing milestone |
| `--no-project` | | Filter on missing project |
| `--order` | | Order: {asc\|desc} (default "desc") |
| `--owner` | | Filter on repository owner |
| `--project` | | Filter on project board owner/number |
| `--reactions` | | Filter on number of reactions |
| `--repo` | `-R` | Filter on repository |
| `--sort` | | Sort: {comments\|created\|interactions\|reactions\|updated} (default "best-match") |
| `--state` | | Filter by state: {open\|closed} |
| `--team-mentions` | | Filter by team mentions |
| `--updated` | | Filter on last updated date |
| `--visibility` | | Filter by visibility: {public\|private\|internal} |
| `--web` | `-w` | Open in browser |

### gh search prs
```
gh search prs [<query>] [flags]
```

Same flags as `search issues` plus:

| Flag | Short | Description |
|------|-------|-------------|
| `--base` | `-B` | Filter on base branch name |
| `--checks` | | Filter on checks status: {pending\|success\|failure} |
| `--draft` | | Filter on draft state |
| `--head` | `-H` | Filter on head branch name |
| `--merged` | | Filter on merged state |
| `--merged-at` | | Filter on merged date |
| `--review` | | Filter on review status: {none\|required\|approved\|changes_requested} |
| `--review-requested` | | Filter on user/team requested to review |
| `--reviewed-by` | | Filter on user who reviewed |

### gh search code
```
gh search code <query> [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--extension` | | Filter on file extension |
| `--filename` | | Filter on filename |
| `--language` | | Filter by language |
| `--limit` | `-L` | Maximum results (default 30) |
| `--match` | | Restrict to: {file\|path} |
| `--owner` | | Filter on owner |
| `--repo` | `-R` | Filter on repository |
| `--size` | | Filter on size range (KB) |
| `--web` | `-w` | Open in browser |

### gh search commits
```
gh search commits [<query>] [flags]
```

### gh search repos
```
gh search repos [<query>] [flags]
```

**PowerShell note:** To exclude results with `-`, use: `gh --% search issues -- "query -label:bug"`

---

## gh release - Release Management

### gh release create
```
gh release create [<tag>] [<filename>... | <pattern>...]
```

**Alias:** `gh release new`

| Flag | Short | Description |
|------|-------|-------------|
| `--discussion-category` | | Start a discussion in category |
| `--draft` | `-d` | Save as draft |
| `--fail-on-no-commits` | | Fail if no new commits since last release |
| `--generate-notes` | | Auto-generate title and notes |
| `--latest` | | Mark as "Latest" (--latest=false to skip) |
| `--notes` | `-n` | Release notes |
| `--notes-file` | `-F` | Read notes from file |
| `--notes-from-tag` | | Fetch notes from tag annotation |
| `--notes-start-tag` | | Starting tag for generating notes |
| `--prerelease` | `-p` | Mark as prerelease |
| `--target` | | Target branch or commit SHA |
| `--title` | `-t` | Release title |
| `--verify-tag` | | Abort if tag doesn't already exist |

**Examples:**
```bash
gh release create v1.2.3 --notes "bugfix release"
gh release create v1.2.3 --generate-notes
gh release create v1.2.3 -F release-notes.md
gh release create v1.2.3 --notes-from-tag
gh release create v1.2.3 ./dist/*.tgz
gh release create v1.2.3 '/path/to/asset.zip#My display label'
gh release create v1.2.3 --discussion-category "General"
```

### gh release list
```
gh release list [flags]
```

### gh release view
```
gh release view [<tag>] [flags]
```

### gh release download
```
gh release download [<tag>] [flags]
```

### gh release edit
```
gh release edit <tag> [flags]
```

### gh release delete
```
gh release delete <tag> [flags]
```

### gh release upload
```
gh release upload <tag> <files>... [flags]
```

---

## gh run - Workflow Run Management

### gh run list
```
gh run list [flags]
```

**Alias:** `gh run ls`

| Flag | Short | Description |
|------|-------|-------------|
| `--all` | `-a` | Include disabled workflows |
| `--branch` | `-b` | Filter by branch |
| `--commit` | `-c` | Filter by commit SHA |
| `--created` | | Filter by creation date |
| `--event` | `-e` | Filter by trigger event |
| `--jq` | `-q` | Filter JSON output |
| `--json` | | Output JSON with specified fields |
| `--limit` | `-L` | Maximum runs (default 20) |
| `--status` | `-s` | Filter by status: {queued\|completed\|in_progress\|requested\|waiting\|pending\|action_required\|cancelled\|failure\|neutral\|skipped\|stale\|startup_failure\|success\|timed_out} |
| `--template` | `-t` | Format JSON via Go template |
| `--user` | `-u` | Filter by user who triggered run |
| `--workflow` | `-w` | Filter by workflow |

### gh run view
```
gh run view [<run-id>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--attempt` | `-a` | Attempt number of the workflow run |
| `--exit-status` | | Exit non-zero if run failed |
| `--job` | `-j` | View specific job ID |
| `--jq` | `-q` | Filter JSON output |
| `--json` | | Output JSON with specified fields |
| `--log` | | View full log for run or job |
| `--log-failed` | | View log for failed steps only |
| `--template` | `-t` | Format JSON via Go template |
| `--verbose` | `-v` | Show job steps |
| `--web` | `-w` | Open in browser |

**Examples:**
```bash
gh run view 12345
gh run view 12345 --attempt 3
gh run view --job 456789
gh run view --log --job 456789
gh run view 0451 --exit-status && echo "run pending or passed"
```

### gh run cancel / delete / rerun / watch / download
```
gh run cancel <run-id>
gh run delete <run-id>
gh run rerun <run-id> [flags]
gh run watch <run-id> [flags]
gh run download <run-id> [flags]
```

---

## gh workflow - Workflow Management

### gh workflow run
Trigger a workflow_dispatch event.

```
gh workflow run [<workflow-id> | <workflow-name>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--field` | `-F` | Add string parameter (key=value), respecting @ syntax |
| `--json` | | Read workflow inputs as JSON via STDIN |
| `--raw-field` | `-f` | Add string parameter (key=value) |
| `--ref` | `-r` | Branch or tag with workflow version to run |

**Examples:**
```bash
gh workflow run triage.yml
gh workflow run triage.yml --ref my-branch
gh workflow run triage.yml -f name=scully -f greeting=hello
echo '{"name":"scully"}' | gh workflow run triage.yml --json
```

### gh workflow list / view / enable / disable
```
gh workflow list [flags]
gh workflow view [<workflow-id> | <workflow-name> | <filename>] [flags]
gh workflow enable [<workflow-id> | <workflow-name>]
gh workflow disable [<workflow-id> | <workflow-name>]
```

---

## gh secret - Manage Secrets

### gh secret set
```
gh secret set <secret-name> [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--app` | `-a` | Application: {actions\|codespaces\|dependabot} |
| `--body` | `-b` | Secret value (reads from stdin if not specified) |
| `--env` | `-e` | Set deployment environment secret |
| `--env-file` | `-f` | Load from dotenv-formatted file |
| `--no-repos-selected` | | No repos can access the org secret |
| `--no-store` | | Print encrypted value instead of storing |
| `--org` | `-o` | Set organization secret |
| `--repos` | `-r` | Repos that can access org/user secret |
| `--user` | `-u` | Set user secret |
| `--visibility` | `-v` | Org secret visibility: {all\|private\|selected} (default "private") |

### gh secret list / delete
```
gh secret list [flags]
gh secret delete <secret-name> [flags]
```

---

## gh variable - Manage Variables

### gh variable set
```
gh variable set <variable-name> [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--body` | `-b` | Variable value |
| `--env` | `-e` | Set deployment environment variable |
| `--env-file` | `-f` | Load from dotenv-formatted file |
| `--org` | `-o` | Set organization variable |
| `--repos` | `-r` | Repos that can access org variable |
| `--visibility` | `-v` | Org variable visibility: {all\|private\|selected} (default "private") |

### gh variable get / list / delete
```
gh variable get <variable-name> [flags]
gh variable list [flags]
gh variable delete <variable-name> [flags]
```

---

## gh label - Manage Labels

### gh label create
```
gh label create <name> [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--color` | `-c` | Color (6 char hex) |
| `--description` | `-d` | Description |
| `--force` | `-f` | Update if label already exists |

### gh label list
```
gh label list [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--limit` | `-L` | Maximum labels (default 30) |
| `--order` | | Order: {asc\|desc} (default "asc") |
| `--search` | `-S` | Search names and descriptions |
| `--sort` | | Sort: {created\|name} (default "created") |

### gh label edit / delete / clone
```
gh label edit <name> [flags]
gh label delete <name> [flags]
gh label clone <source-repository> [flags]
```

---

## gh gist - Manage Gists

### gh gist create
```
gh gist create [<filename>... | <pattern>... | -] [flags]
```

**Alias:** `gh gist new`

| Flag | Short | Description |
|------|-------|-------------|
| `--desc` | `-d` | Description for the gist |
| `--filename` | `-f` | Filename when reading from stdin |
| `--public` | `-p` | List publicly (default "secret") |
| `--web` | `-w` | Open browser with created gist |

### gh gist list / view / edit / delete / clone / rename
```
gh gist list [flags]
gh gist view [<id> | <url>] [flags]
gh gist edit {<id> | <url>} [flags]
gh gist delete {<id> | <url>} [flags]
gh gist clone <gist> [<directory>] [-- <gitflags>...]
gh gist rename {<id> | <url>} <oldFilename> <newFilename>
```

---

## gh auth - Authentication

### Available Subcommands
```
gh auth login          # Log in to a GitHub account
gh auth logout         # Log out
gh auth refresh        # Refresh stored credentials
gh auth setup-git      # Setup git with GitHub CLI
gh auth status         # Display active account and auth state
gh auth switch         # Switch active GitHub account
gh auth token          # Print auth token for a hostname
```

### gh auth login
```
gh auth login [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--git-protocol` | `-p` | Protocol for git: {ssh\|https} |
| `--hostname` | `-h` | GitHub hostname to authenticate with |
| `--insecure-storage` | | Save auth token in plain text |
| `--scopes` | `-s` | Additional authentication scopes to request |
| `--skip-ssh-key` | | Skip generating/uploading SSH key |
| `--web` | `-w` | Open browser to authenticate |
| `--with-token` | | Read token from standard input |

### gh auth refresh
```
gh auth refresh [flags]
```

Use to add scopes: `gh auth refresh -s project`

---

## gh project - GitHub Projects (V2)

```
gh project close / copy / create / delete / edit
gh project field-create / field-delete / field-list
gh project item-add / item-archive / item-create / item-delete / item-edit / item-list
gh project link / unlink / list / mark-template / view
```

---

## gh cache - Actions Cache
```
gh cache list [flags]
gh cache delete <cache-id> [flags]
```

---

## gh ssh-key / gpg-key
```
gh ssh-key add <key-file> [flags]
gh ssh-key delete <id> [flags]
gh ssh-key list [flags]

gh gpg-key add <key-file> [flags]
gh gpg-key delete <id> [flags]
gh gpg-key list [flags]
```

---

## gh ruleset - Repository Rulesets
```
gh ruleset check [flags]
gh ruleset list [flags]
gh ruleset view [<ruleset-id>] [flags]
```

---

## gh extension - CLI Extensions
```
gh extension browse [flags]
gh extension create [<name>] [flags]
gh extension exec <name> [args]
gh extension install <repository> [flags]
gh extension list [flags]
gh extension remove <name>
gh extension search [<query>] [flags]
gh extension upgrade {<name> | --all} [flags]
```

---

## gh codespace - Cloud Development Environments
```
gh codespace code [flags]        # Open in VS Code
gh codespace cp [flags]          # Copy files
gh codespace create [flags]      # Create codespace
gh codespace delete [flags]      # Delete codespace
gh codespace edit [flags]        # Edit codespace
gh codespace jupyter [flags]     # Open Jupyter
gh codespace list [flags]        # List codespaces
gh codespace logs [flags]        # View logs
gh codespace ports [flags]       # Manage ports
gh codespace rebuild [flags]     # Rebuild codespace
gh codespace ssh [flags]         # SSH into codespace
gh codespace stop [flags]        # Stop codespace
gh codespace view [flags]        # View codespace
```

---

## gh status
Print info about relevant issues, PRs, and notifications across all repos.

```
gh status [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--exclude` | `-e` | Comma-separated list of repos to exclude |
| `--org` | `-o` | Report status within an organization |

---

## gh browse
Open repository in the web browser.

```
gh browse [<number> | <path>] [flags]
```

| Flag | Short | Description |
|------|-------|-------------|
| `--branch` | `-b` | Select a branch |
| `--commit` | `-c` | Open last commit |
| `--no-browser` | `-n` | Print URL without opening browser |
| `--projects` | `-p` | Open Projects tab |
| `--releases` | `-r` | Open Releases tab |
| `--repo` | `-R` | Select another repository |
| `--settings` | `-s` | Open Settings tab |
| `--wiki` | `-w` | Open Wiki tab |
