# HTML Report Templates

Use these templates to generate the HTML report files for porting results.
All HTML is self-contained — no external dependencies.

## index.html Template

This is the main dashboard page. Generate it at `port-results/<slug>/index.html`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Port Report: {PORT_PROJECT_NAME}</title>
<style>
  :root {
    --bg: #0d1117; --surface: #161b22; --border: #30363d;
    --text: #e6edf3; --text-muted: #8b949e; --accent: #58a6ff;
    --green: #3fb950; --yellow: #d29922; --red: #f85149; --orange: #db6d28;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; padding: 2rem; }
  .container { max-width: 1100px; margin: 0 auto; }
  h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
  .subtitle { color: var(--text-muted); margin-bottom: 2rem; font-size: 0.95rem; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.2rem; }
  .stat-card .label { color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .stat-card .value { font-size: 1.8rem; font-weight: 700; margin-top: 0.3rem; }
  .stat-card .value.green { color: var(--green); }
  .stat-card .value.yellow { color: var(--yellow); }
  .stat-card .value.red { color: var(--red); }
  table { width: 100%; border-collapse: collapse; background: var(--surface); border-radius: 8px; overflow: hidden; margin-bottom: 2rem; }
  th { background: #1c2129; text-align: left; padding: 0.8rem 1rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); border-bottom: 1px solid var(--border); }
  td { padding: 0.8rem 1rem; border-bottom: 1px solid var(--border); }
  tr:last-child td { border-bottom: none; }
  tr:hover { background: #1c2129; }
  a { color: var(--accent); text-decoration: none; }
  a:hover { text-decoration: underline; }
  .badge { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
  .badge.excellent { background: rgba(63,185,80,0.15); color: var(--green); }
  .badge.good { background: rgba(63,185,80,0.1); color: #7ee787; }
  .badge.moderate { background: rgba(210,153,34,0.15); color: var(--yellow); }
  .badge.below { background: rgba(219,109,40,0.15); color: var(--orange); }
  .badge.poor { background: rgba(248,81,73,0.15); color: var(--red); }
  .badge.stuck { background: rgba(248,81,73,0.2); color: var(--red); }
  .badge.accepted { background: rgba(63,185,80,0.15); color: var(--green); }
  .progress-bar { width: 100%; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
  .section-title { font-size: 1.2rem; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
  .meta { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.2rem; margin-bottom: 2rem; }
  .meta-row { display: flex; gap: 2rem; flex-wrap: wrap; }
  .meta-item { flex: 1; min-width: 200px; }
  .meta-item .label { color: var(--text-muted); font-size: 0.8rem; }
  .meta-item .value { font-size: 0.95rem; margin-top: 0.2rem; }
</style>
</head>
<body>
<div class="container">
  <h1>Port Report: {PORT_PROJECT_NAME}</h1>
  <p class="subtitle">{SOURCE_LANG} &rarr; {TARGET_LANG} &bull; Generated {TIMESTAMP}</p>

  <div class="meta">
    <div class="meta-row">
      <div class="meta-item"><div class="label">Original Project</div><div class="value">{ORIGINAL_PROJECT_NAME}</div></div>
      <div class="meta-item"><div class="label">Source Path</div><div class="value"><code>{SOURCE_PATH}</code></div></div>
      <div class="meta-item"><div class="label">Target Framework</div><div class="value">{TARGET_FRAMEWORK}</div></div>
      <div class="meta-item"><div class="label">Platform Layer</div><div class="value">{PLATFORM_LAYER}</div></div>
    </div>
  </div>

  <div class="stats">
    <div class="stat-card"><div class="label">Files Ported</div><div class="value">{FILES_TOTAL}</div></div>
    <div class="stat-card"><div class="label">Avg Final Score</div><div class="value {SCORE_CLASS}">{AVG_SCORE}</div></div>
    <div class="stat-card"><div class="label">Accepted First Pass</div><div class="value green">{FIRST_PASS}</div></div>
    <div class="stat-card"><div class="label">Required Iteration</div><div class="value yellow">{ITERATED}</div></div>
    <div class="stat-card"><div class="label">Stuck (Human Review)</div><div class="value red">{STUCK}</div></div>
  </div>

  <h2 class="section-title">File Scorecard</h2>
  <table>
    <thead><tr><th>File</th><th>Score</th><th>Band</th><th>Iterations</th><th>Status</th><th>Details</th></tr></thead>
    <tbody>
      <!-- {FILE_ROWS} -->
      <!-- Each row:
      <tr>
        <td>{FILENAME}</td>
        <td>
          <div class="progress-bar"><div class="progress-fill" style="width:{SCORE}%;background:{SCORE_COLOR}"></div></div>
          {SCORE}/100
        </td>
        <td><span class="badge {BAND_CLASS}">{BAND}</span></td>
        <td>{ITERATION_COUNT}</td>
        <td><span class="badge {STATUS_CLASS}">{STATUS}</span></td>
        <td><a href="iteration-results-{PADDED_LAST_ITER}.html#{FILE_ANCHOR}">View</a></td>
      </tr>
      -->
    </tbody>
  </table>

  <h2 class="section-title">Iteration History</h2>
  <table>
    <thead><tr><th>#</th><th>Files Processed</th><th>Avg Score</th><th>Issues Fixed</th><th>Report</th></tr></thead>
    <tbody>
      <!-- {ITERATION_ROWS} -->
      <!-- Each row:
      <tr>
        <td>{ITER_NUM}</td>
        <td>{FILE_NAMES}</td>
        <td>{AVG_SCORE}</td>
        <td>{ISSUES_FIXED}</td>
        <td><a href="iteration-results-{PADDED_NUM}.html">View Report</a></td>
      </tr>
      -->
    </tbody>
  </table>

  <!-- If there are cross-file dependencies -->
  <h2 class="section-title">Cross-File Dependencies</h2>
  <table>
    <thead><tr><th>File</th><th>Depends On</th><th>Symbol</th><th>Status</th></tr></thead>
    <tbody>
      <!-- {DEPENDENCY_ROWS} -->
    </tbody>
  </table>
</div>
</body>
</html>
```

## iteration-results-NN.html Template

Generate one per iteration at `port-results/<slug>/iteration-results-{NN}.html`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Iteration {ITER_NUM} — {PORT_PROJECT_NAME}</title>
<style>
  :root {
    --bg: #0d1117; --surface: #161b22; --border: #30363d;
    --text: #e6edf3; --text-muted: #8b949e; --accent: #58a6ff;
    --green: #3fb950; --yellow: #d29922; --red: #f85149;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; padding: 2rem; }
  .container { max-width: 1100px; margin: 0 auto; }
  .nav { margin-bottom: 1.5rem; display: flex; gap: 1rem; align-items: center; }
  .nav a { color: var(--accent); text-decoration: none; font-size: 0.9rem; }
  .nav a:hover { text-decoration: underline; }
  .nav .sep { color: var(--text-muted); }
  h1 { font-size: 1.5rem; margin-bottom: 0.3rem; }
  .subtitle { color: var(--text-muted); margin-bottom: 2rem; font-size: 0.9rem; }
  .file-section { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 2rem; overflow: hidden; }
  .file-header { padding: 1rem 1.2rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: #1c2129; }
  .file-header h2 { font-size: 1.1rem; }
  .file-body { padding: 1.2rem; }
  .score-row { display: flex; gap: 1.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .score-item { text-align: center; }
  .score-item .label { font-size: 0.75rem; color: var(--text-muted); }
  .score-item .num { font-size: 1.4rem; font-weight: 700; }
  .issue-list { list-style: none; }
  .issue-list li { padding: 0.6rem 0; border-bottom: 1px solid var(--border); }
  .issue-list li:last-child { border-bottom: none; }
  .issue-tag { display: inline-block; padding: 0.1rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; margin-right: 0.5rem; }
  .issue-tag.P0 { background: rgba(248,81,73,0.2); color: var(--red); }
  .issue-tag.P1 { background: rgba(248,81,73,0.15); color: #f97583; }
  .issue-tag.P2 { background: rgba(210,153,34,0.15); color: var(--yellow); }
  .issue-tag.P3 { background: rgba(210,153,34,0.1); color: #e3b341; }
  .issue-tag.P4 { background: rgba(88,166,255,0.1); color: var(--accent); }
  .issue-tag.P5 { background: rgba(139,148,158,0.1); color: var(--text-muted); }
  pre { background: #0d1117; border: 1px solid var(--border); border-radius: 6px; padding: 1rem; overflow-x: auto; font-size: 0.85rem; line-height: 1.5; margin: 0.5rem 0; }
  code { font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace; }
  .diff-label { font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem; }
  .badge { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
  .badge.excellent { background: rgba(63,185,80,0.15); color: var(--green); }
  .badge.good { background: rgba(63,185,80,0.1); color: #7ee787; }
  .badge.moderate { background: rgba(210,153,34,0.15); color: var(--yellow); }
  .badge.below { background: rgba(219,109,40,0.15); color: #db6d28; }
  .badge.poor { background: rgba(248,81,73,0.15); color: var(--red); }
  table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
  th { text-align: left; padding: 0.5rem; font-size: 0.8rem; color: var(--text-muted); border-bottom: 1px solid var(--border); }
  td { padding: 0.5rem; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
  .changelog { margin-top: 1rem; }
  .collapsible { cursor: pointer; user-select: none; }
  .collapsible::before { content: "▶ "; font-size: 0.7rem; }
  .collapsible.open::before { content: "▼ "; }
  .collapsible-content { display: none; margin-top: 0.5rem; }
  .collapsible-content.open { display: block; }
  .trajectory { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0; }
  .trajectory .step { padding: 0.3rem 0.8rem; border-radius: 6px; font-weight: 600; font-size: 0.85rem; }
  .trajectory .arrow { color: var(--text-muted); }
</style>
</head>
<body>
<div class="container">
  <div class="nav">
    <a href="index.html">&larr; Dashboard</a>
    <span class="sep">|</span>
    <!-- {NAV_LINKS}: <a href="iteration-results-{PREV}.html">Prev</a> <a href="iteration-results-{NEXT}.html">Next</a> -->
  </div>

  <h1>Iteration {ITER_NUM}</h1>
  <p class="subtitle">{PHASE_DESCRIPTION} &bull; {TIMESTAMP}</p>

  <!-- Repeat for each file in this iteration -->
  <!-- {FILE_SECTIONS} -->
  <!--
  <div class="file-section" id="{FILE_ANCHOR}">
    <div class="file-header">
      <h2>{ORIGINAL_FILE} &rarr; {PORTED_FILE}</h2>
      <span class="badge {BAND_CLASS}">{SCORE}/100</span>
    </div>
    <div class="file-body">
      <div class="score-row">
        <div class="score-item"><div class="num">{FUNC_COVERAGE}</div><div class="label">Function Coverage (40%)</div></div>
        <div class="score-item"><div class="num">{LOGIC_ACCURACY}</div><div class="label">Logic Accuracy (30%)</div></div>
        <div class="score-item"><div class="num">{CONST_FIDELITY}</div><div class="label">Constants (15%)</div></div>
        <div class="score-item"><div class="num">{VAR_FIDELITY}</div><div class="label">Variables (15%)</div></div>
      </div>

      <div class="trajectory">
        <div class="step" style="background:rgba(248,81,73,0.15);color:var(--red);">{PREV_SCORE}</div>
        <span class="arrow">&rarr; Fix &rarr;</span>
        <div class="step" style="background:rgba(63,185,80,0.15);color:var(--green);">{NEW_SCORE}</div>
      </div>

      <h3 class="collapsible" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">Function Inventory</h3>
      <div class="collapsible-content">
        <table>
          <thead><tr><th>Original</th><th>Present?</th><th>Notes</th></tr></thead>
          <tbody>
            {FUNCTION_ROWS}
          </tbody>
        </table>
      </div>

      <h3 class="collapsible" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">Issues ({ISSUE_COUNT})</h3>
      <div class="collapsible-content">
        <ul class="issue-list">
          {ISSUE_ITEMS}
        </ul>
      </div>

      <h3 class="collapsible" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">Changelog</h3>
      <div class="collapsible-content changelog">
        <table>
          <thead><tr><th>Issue</th><th>Priority</th><th>Change</th><th>Lines</th></tr></thead>
          <tbody>
            {CHANGELOG_ROWS}
          </tbody>
        </table>
      </div>

      <h3 class="collapsible" onclick="this.classList.toggle('open');this.nextElementSibling.classList.toggle('open')">Translation Notes</h3>
      <div class="collapsible-content">
        <pre><code>{TRANSLATION_NOTES}</code></pre>
      </div>
    </div>
  </div>
  -->

</div>
<script>
// Auto-open first collapsible sections
document.querySelectorAll('.file-section:first-child .collapsible').forEach(el => {
  el.classList.add('open');
  el.nextElementSibling.classList.add('open');
});
</script>
</body>
</html>
```

## How to Generate Reports

When generating HTML reports, the orchestrator should:

1. **Build the data model first** — collect all scores, issues, changelogs, and function
   inventories from the evaluation/fix JSON outputs into a structured object.

2. **Use string replacement** — replace `{PLACEHOLDER}` tokens in the templates with
   actual values. For repeated sections (file rows, issue items, etc.), build the HTML
   string by iterating over the data and concatenating.

3. **Color coding for scores:**
   - 80-100: `var(--green)` / class `excellent` or `good`
   - 65-79: `#7ee787` / class `good`
   - 50-64: `var(--yellow)` / class `moderate`
   - 35-49: `var(--orange)` / class `below`
   - 0-34: `var(--red)` / class `poor`

4. **Generate `index.html` after every iteration** — overwrite with latest totals.
   Generate each `iteration-results-NN.html` once per iteration (zero-padded: 01, 02, ...).

5. **File the HTML** alongside the markdown reports in `port-results/<slug>/`.
