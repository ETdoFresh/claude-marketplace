# Building Your Claude Code Marketplace: Skills, Agents & Agent Swarms

## Architecture Overview

You'll create a **GitHub-hosted marketplace repository** with three plugin categories:

```
claude-marketplace/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace catalog
├── plugins/
│   ├── my-skills/                # Plugin 1: Your custom skills
│   ├── my-agents/                # Plugin 2: Your custom agents
│   └── my-swarms/                # Plugin 3: Agent swarm orchestration
└── README.md
```

---

## Phase 1: Create the Marketplace Scaffold

### Step 1 — Initialize the repo and marketplace manifest

```bash
cd ~/code/claude-marketplace
git init
mkdir -p .claude-plugin
mkdir -p plugins/my-skills/.claude-plugin
mkdir -p plugins/my-agents/.claude-plugin
mkdir -p plugins/my-swarms/.claude-plugin
```

### Step 2 — Create `.claude-plugin/marketplace.json`

This is the catalog file that lists all your plugins:

```json
{
  "name": "etgarcia-marketplace",
  "owner": {
    "name": "etgarcia"
  },
  "metadata": {
    "description": "Skills, Agents, and Agent Swarms by etgarcia",
    "version": "1.0.0",
    "pluginRoot": "./plugins"
  },
  "plugins": [
    {
      "name": "my-skills",
      "source": "./plugins/my-skills",
      "description": "Custom slash-command skills",
      "category": "skills",
      "tags": ["skills", "productivity"]
    },
    {
      "name": "my-agents",
      "source": "./plugins/my-agents",
      "description": "Custom subagents for specialized tasks",
      "category": "agents",
      "tags": ["agents", "automation"]
    },
    {
      "name": "my-swarms",
      "source": "./plugins/my-swarms",
      "description": "Multi-agent swarm orchestration patterns",
      "category": "swarms",
      "tags": ["swarms", "multi-agent", "orchestration"]
    }
  ]
}
```

---

## Phase 2: Build the Skills Plugin

Skills are slash-commands (`/my-skills:review`) and auto-invoked agent skills.

### Step 3 — Create the plugin manifest

**`plugins/my-skills/.claude-plugin/plugin.json`**:

```json
{
  "name": "my-skills",
  "description": "Custom slash-command skills and agent skills",
  "version": "1.0.0",
  "author": { "name": "etgarcia" }
}
```

### Step 4 — Add slash-command skills (user-invoked)

These go in `commands/` and are invoked with `/my-skills:command-name`.

```bash
mkdir -p plugins/my-skills/commands
```

**Example: `plugins/my-skills/commands/review.md`**

```markdown
---
description: Review code for bugs, security, and performance
---

Review the selected code or recent changes for:
- Potential bugs or edge cases
- Security concerns (OWASP top 10)
- Performance issues
- Readability improvements

Be concise and actionable. Group feedback by severity.
```

### Step 5 — Add agent skills (auto-invoked by Claude)

These go in `skills/` with `SKILL.md` files. Claude uses them automatically based on context.

```bash
mkdir -p plugins/my-skills/skills/git-workflow
```

**Example: `plugins/my-skills/skills/git-workflow/SKILL.md`**

```yaml
---
name: git-workflow
description: Git workflow best practices. Use when committing, branching, or managing PRs.
---

# Git Workflow

When working with git:
1. Use conventional commits (feat:, fix:, chore:, docs:)
2. Keep commits atomic and focused
3. Always run tests before committing
4. Write descriptive PR titles under 70 chars
```

---

## Phase 3: Build the Agents Plugin

Agents are subagents — specialized AI assistants that run in their own context.

### Step 6 — Create the plugin manifest

**`plugins/my-agents/.claude-plugin/plugin.json`**:

```json
{
  "name": "my-agents",
  "description": "Custom subagents for specialized tasks",
  "version": "1.0.0",
  "author": { "name": "etgarcia" }
}
```

### Step 7 — Create agent definitions

Agents go in `agents/` as markdown files with YAML frontmatter.

```bash
mkdir -p plugins/my-agents/agents
```

**Example: `plugins/my-agents/agents/debugger.md`**

```markdown
---
name: debugger
description: Debugging specialist for errors, test failures, and unexpected behavior. Use proactively when encountering issues.
tools: Read, Edit, Bash, Grep, Glob
model: sonnet
memory: user
---

You are an expert debugger specializing in root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Implement minimal fix
5. Verify the solution works

Focus on fixing the underlying issue, not the symptoms.
```

**Example: `plugins/my-agents/agents/code-reviewer.md`**

```markdown
---
name: code-reviewer
description: Expert code review specialist. Use proactively after code changes.
tools: Read, Grep, Glob, Bash
model: haiku
---

You are a senior code reviewer. When invoked:
1. Run git diff to see recent changes
2. Focus on modified files
3. Review for quality, security, and maintainability

Provide feedback organized by priority:
- Critical (must fix)
- Warnings (should fix)
- Suggestions (nice to have)
```

### Agent Configuration Reference

| Field            | Purpose                                                                   |
| ---------------- | ------------------------------------------------------------------------- |
| `tools`          | Restrict which tools the agent can use                                    |
| `model`          | `haiku` (fast/cheap), `sonnet` (balanced), `opus` (powerful), `inherit`   |
| `memory`         | `user` / `project` / `local` — persistent learning across sessions       |
| `permissionMode` | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan`          |
| `skills`         | Pre-load specific skills into the agent's context                         |
| `hooks`          | Lifecycle hooks scoped to this agent (PreToolUse, PostToolUse, Stop)      |
| `disallowedTools`| Tools to explicitly deny, removed from inherited or specified list        |

---

## Phase 4: Build the Agent Swarms Plugin (New)

Agent swarms coordinate **multiple agents** working in parallel or sequence. Claude Code supports this via two approaches.

### Approach A: Swarm Orchestration via Skills + Agents (Native Claude Code)

This uses a **skill as the orchestrator** that instructs Claude to spawn multiple subagents.

### Step 8 — Create the plugin manifest

**`plugins/my-swarms/.claude-plugin/plugin.json`**:

```json
{
  "name": "my-swarms",
  "description": "Multi-agent swarm orchestration patterns",
  "version": "1.0.0",
  "author": { "name": "etgarcia" }
}
```

### Step 9 — Create swarm agents (the workers)

```bash
mkdir -p plugins/my-swarms/agents
```

**`plugins/my-swarms/agents/research-agent.md`**

```markdown
---
name: swarm-researcher
description: Research specialist for swarm workflows. Explores codebases and gathers context.
tools: Read, Grep, Glob, Bash
model: haiku
---

You are a research agent in a multi-agent swarm.
Thoroughly explore the assigned area of the codebase and return a structured summary.
Include: file paths, key patterns, dependencies, and potential issues.
```

**`plugins/my-swarms/agents/implementer-agent.md`**

```markdown
---
name: swarm-implementer
description: Implementation specialist for swarm workflows. Writes and edits code.
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

You are an implementation agent in a multi-agent swarm.
Given research context and a task, implement the changes.
Write clean, tested code. Verify your changes compile/pass.
```

**`plugins/my-swarms/agents/validator-agent.md`**

```markdown
---
name: swarm-validator
description: Validation specialist for swarm workflows. Tests and verifies changes.
tools: Read, Bash, Grep, Glob
model: haiku
---

You are a validation agent in a multi-agent swarm.
Run tests, linters, and type checks. Report pass/fail status with details.
```

### Step 10 — Create swarm orchestration commands

```bash
mkdir -p plugins/my-swarms/commands
```

**`plugins/my-swarms/commands/swarm-implement.md`**

```markdown
---
description: Run a full implement swarm — research, implement, validate in sequence
---

# Swarm: Implement Feature

Execute this multi-agent workflow for the task: "$ARGUMENTS"

## Phase 1: Research (parallel)
Launch these subagents IN PARALLEL to research the codebase:
- Use the **swarm-researcher** agent to explore the relevant modules and dependencies
- Use the **swarm-researcher** agent to find existing patterns and conventions
- Use the **swarm-researcher** agent to identify test patterns

## Phase 2: Implement
Based on the research results, use the **swarm-implementer** agent to:
- Implement the requested changes
- Follow existing patterns discovered in Phase 1

## Phase 3: Validate
Use the **swarm-validator** agent to:
- Run the test suite
- Run linters and type checks
- Report final status

Summarize the full swarm execution at the end.
```

**`plugins/my-swarms/commands/swarm-review.md`**

```markdown
---
description: Run a parallel review swarm — security, performance, quality in parallel
---

# Swarm: Parallel Review

Review "$ARGUMENTS" using a multi-agent swarm.

Launch ALL of these subagents IN PARALLEL (background):
1. **swarm-researcher** — Review for security vulnerabilities (OWASP top 10, injection, XSS)
2. **swarm-researcher** — Review for performance issues (N+1 queries, unnecessary allocations, blocking calls)
3. **swarm-researcher** — Review for code quality (readability, DRY, naming, error handling)

After all agents complete, synthesize their findings into a single report organized by severity.
```

### Approach B: Swarms Python Framework (External, Advanced)

For more complex multi-agent patterns (hierarchical, DAG, mixture-of-agents), you can integrate the [Swarms framework](https://github.com/kyegomez/swarms) via an MCP server.

#### Install Swarms

```bash
pip3 install -U swarms
```

#### Available Swarm Architectures

| Architecture         | Description                                           | Best For                          |
| -------------------- | ----------------------------------------------------- | --------------------------------- |
| SequentialWorkflow   | Agents execute tasks in a linear chain                | Step-by-step processes            |
| ConcurrentWorkflow   | Agents run tasks simultaneously                       | High-throughput parallel tasks    |
| AgentRearrange       | Dynamically maps complex relationships between agents | Flexible, adaptive workflows      |
| GraphWorkflow        | Orchestrates agents as nodes in a DAG                 | Complex projects with dependencies|
| MixtureOfAgents      | Multiple expert agents in parallel, synthesized       | Complex problem-solving           |
| GroupChat            | Agents collaborate via conversational interface       | Collaborative decision-making     |
| HierarchicalSwarm    | Director agent creates plans and distributes tasks    | Complex project management        |
| SwarmRouter          | Universal orchestrator for any swarm type             | Flexible multi-agent management   |

#### Step 11 (optional) — Add an MCP server for Swarms integration

**`plugins/my-swarms/.mcp.json`**:

```json
{
  "swarms-server": {
    "command": "${CLAUDE_PLUGIN_ROOT}/servers/swarms-mcp.sh",
    "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/swarms-config.json"]
  }
}
```

#### Example: Sequential Swarm (Python)

```python
from swarms import Agent, SequentialWorkflow

researcher = Agent(
    agent_name="Researcher",
    system_prompt="Research the provided topic and provide a detailed summary.",
    model_name="gpt-4o-mini",
)

writer = Agent(
    agent_name="Writer",
    system_prompt="Take the research summary and write an engaging blog post.",
    model_name="gpt-4o-mini",
)

workflow = SequentialWorkflow(agents=[researcher, writer])
result = workflow.run("The history and future of artificial intelligence")
```

#### Example: Concurrent Swarm (Python)

```python
from swarms import Agent, ConcurrentWorkflow

market_analyst = Agent(
    agent_name="Market-Analyst",
    system_prompt="Analyze market trends and provide insights.",
    model_name="gpt-4o-mini",
    max_loops=1,
)

financial_analyst = Agent(
    agent_name="Financial-Analyst",
    system_prompt="Provide financial analysis and recommendations.",
    model_name="gpt-4o-mini",
    max_loops=1,
)

risk_analyst = Agent(
    agent_name="Risk-Analyst",
    system_prompt="Assess risks and provide risk management strategies.",
    model_name="gpt-4o-mini",
    max_loops=1,
)

workflow = ConcurrentWorkflow(
    agents=[market_analyst, financial_analyst, risk_analyst],
    max_loops=1,
)

results = workflow.run("Analyze the impact of AI on healthcare")
```

---

## Phase 5: Test Locally

### Step 12 — Test each plugin individually

```bash
# Test skills plugin
claude --plugin-dir ./plugins/my-skills

# Test agents plugin
claude --plugin-dir ./plugins/my-agents

# Test swarms plugin
claude --plugin-dir ./plugins/my-swarms

# Test all together
claude --plugin-dir ./plugins/my-skills \
       --plugin-dir ./plugins/my-agents \
       --plugin-dir ./plugins/my-swarms
```

Inside Claude Code, verify:

- `/my-skills:review` works
- `/agents` shows your custom agents
- `/my-swarms:swarm-implement add a login page` triggers the multi-agent workflow

### Step 13 — Validate marketplace structure

```bash
claude plugin validate .
```

---

## Phase 6: Publish & Distribute

### Step 14 — Push to GitHub

```bash
cd ~/code/claude-marketplace
git add .
git commit -m "Initial marketplace: skills, agents, and swarms"
git remote add origin https://github.com/etgarcia/claude-marketplace.git
git push -u origin main
```

### Step 15 — Install from anywhere

Anyone (including you) can now install your marketplace:

```
/plugin marketplace add etgarcia/claude-marketplace
/plugin install my-skills@etgarcia-marketplace
/plugin install my-agents@etgarcia-marketplace
/plugin install my-swarms@etgarcia-marketplace
```

### Step 16 — Auto-configure for team repos

Add to any project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "etgarcia-marketplace": {
      "source": {
        "source": "github",
        "repo": "etgarcia/claude-marketplace"
      }
    }
  },
  "enabledPlugins": {
    "my-skills@etgarcia-marketplace": true,
    "my-agents@etgarcia-marketplace": true,
    "my-swarms@etgarcia-marketplace": true
  }
}
```

---

## Quick Reference

| What                  | Where it lives           | How it's invoked                         |
| --------------------- | ------------------------ | ---------------------------------------- |
| Slash commands        | `commands/*.md`          | `/plugin-name:command`                   |
| Agent skills (auto)   | `skills/*/SKILL.md`     | Claude uses automatically                |
| Subagents             | `agents/*.md`            | Claude delegates or you ask explicitly   |
| Swarm patterns        | Commands that orchestrate multiple agents | `/my-swarms:swarm-implement <task>` |
| MCP servers           | `.mcp.json`              | Auto-connected tools                     |
| Hooks                 | `hooks/hooks.json`       | Event-driven automation                  |

---

## Sources

- [Claude Code Plugins Docs — Create plugins](https://code.claude.com/docs/en/plugins)
- [Claude Code — Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces)
- [Claude Code — Create custom subagents](https://code.claude.com/docs/en/sub-agents)
- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [Organizing Claude Code Skills Into Plugin Marketplaces — Scott Spence](https://scottspence.com/posts/organising-claude-code-skills-into-plugin-marketplaces)
- [Swarms Framework](https://github.com/kyegomez/swarms)
- [MCP Market](https://mcpmarket.com/)
- [AI Agent Store](https://aiagentstore.ai/)
- [Claude Code Has a Skills Marketplace Now — Medium](https://medium.com/@markchen69/claude-code-has-a-skills-marketplace-now-a-beginner-friendly-walkthrough-8adeb67cdc89)
- [Claude Code Plugins & Agent Skills Community Registry](https://claude-plugins.dev/)
- [awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)
