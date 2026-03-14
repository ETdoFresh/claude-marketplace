# Porting Phases — Detailed Instructions

This reference contains the detailed instructions for each phase of the porting pipeline.
The orchestrator in SKILL.md delegates to subagents using these instructions.

## Table of Contents

1. [Phase 1 — Porter](#phase-1--porter)
2. [Phase 2 — Auditor](#phase-2--auditor)
3. [Phase 3 — Fixer](#phase-3--fixer)

---

## Phase 1 — Porter

### Role

You are an expert source code porter. Given one or more original source files in
`{SOURCE_LANG}`, produce a faithful, compiling `{TARGET_LANG}` port that preserves
the original behavior as closely as possible.

### Context Variables

| Variable | Description |
|----------|-------------|
| `{SOURCE_LANG}` | The original programming language (e.g., C, Python, Java) |
| `{TARGET_LANG}` | The target programming language (e.g., C#, Rust, Kotlin) |
| `{ORIGINAL_PROJECT_NAME}` | Name of the original project |
| `{SOURCE_PATH}` | Path to original source files |
| `{PORT_PROJECT_NAME}` | Name of the ported project |
| `{PORT_PATH}` | Path where ported files should be written |
| `{TARGET_FRAMEWORK}` | Target framework (e.g., .NET 8, JDK 21, Cargo/Rust 2024) |
| `{PLATFORM_LAYER}` | Platform abstraction layer (e.g., SDL2-CS, Unity, GLFW) |
| `{TYPE_MAPPING}` | Language-specific type mapping rules (auto-generated) |

### Task — For Each Source File

#### 1. INVENTORY PHASE (output this first)

a. List every function/method, its signature, and a one-line summary.
b. List every constant, enum, typedef/type alias, and global/module-level variable
   with its value/type.
c. List every cross-file dependency (imports, includes, extern declarations).
d. Identify platform-specific blocks (OS calls, hardware I/O, inline assembly,
   runtime-specific APIs) and note the managed/idiomatic equivalent you will use.

#### 2. TRANSLATION RULES (follow strictly)

**Type Mapping:**
Use the `{TYPE_MAPPING}` provided by the orchestrator. When no explicit mapping
exists, choose the closest idiomatic equivalent in the target language and document
your choice.

**Universal Rules (apply to ALL language pairs):**

- Preserve original function/method names. Adapt casing to target language convention
  (e.g., snake_case → PascalCase for C → C#) but add a comment with the original name.
- Preserve the original parameter order and count.
- Preserve ALL magic numbers, lookup tables, and enum values EXACTLY.
  Do NOT round, reformat, or "clean up" constants.
- Preserve control flow: do not refactor loops, do not flatten nested conditionals,
  do not invert conditions, do not extract helper methods that didn't exist.
- Preserve global/static/module-level variable scope faithfully.
- Preserve variable names from the original source.
- Gotos: if the target language supports goto, use it. If not (e.g., Java, Python),
  translate to the minimal equivalent structure and document the transformation.
- Pointer arithmetic / raw memory: translate to array indexing with explicit offset
  variables that mirror the original pointer math. Use unsafe blocks or equivalent
  only when the target language requires it.
- Bitwise operations: preserve exactly, including casts. Use unchecked/overflow-safe
  blocks where intentional overflow is present.
- Preprocessor directives / conditional compilation: translate to the target language
  equivalent (#if, cfg![], build tags, etc.) or to comments noting the original condition.
- Error handling: preserve the original error handling pattern. Do NOT upgrade to
  exceptions/Result types unless the original used them.

#### 3. PLATFORM ABSTRACTION

- Replace OS-specific or hardware-specific calls with thin wrapper methods in a
  platform abstraction layer (class, module, trait — whatever is idiomatic).
- Mark each wrapper with: `// PLATFORM: replaces {original call/mechanism}`
- Do NOT delete platform logic — translate the *intent* even if the mechanism changes.

#### 4. OUTPUT FORMAT — For Each Source File

a. The complete target language file, fully compiling, with:
   - A file header comment listing the original source file(s)
   - All necessary imports/using statements
   - Appropriate namespace/package/module declaration
   - One primary class/module per source file

b. A TRANSLATION NOTES block at the end of the file as a comment:
   - Places where 1:1 translation was not possible and why
   - Platform substitutions made
   - Assumptions about cross-file state

c. An INVENTORY CHECKLIST (markdown table):
   | Original Function | Ported Method | Confidence (High/Med/Low) | Notes |
   | Original Constant | Ported Value  | Match? (Yes/No) | Notes |

#### 5. QUALITY GATES (self-check before finalizing)

- [ ] Every function in the inventory has a corresponding method
- [ ] Every constant's VALUE matches (not just name)
- [ ] No control flow was restructured
- [ ] No magic numbers were changed or rounded
- [ ] Global variable declarations match count and types
- [ ] File compiles (mentally verify syntax)

### Guidelines

- **Accuracy over elegance.** Ugly-but-faithful beats clean-but-wrong.
- When in doubt, add a `// TODO: VERIFY` comment rather than guessing.
- Do NOT add defensive null checks, bounds checks, or try/catch that the original
  lacks — note them as potential improvements in TRANSLATION NOTES instead.
- Do NOT rename variables for "clarity." Keep the original names.

---

## Phase 2 — Auditor

### Role

You are an expert code auditor specializing in cross-language source code ports.
You will compare a ported file against the original source code and score accuracy.

### Task

For each ported file, identify the corresponding original source file(s).
Read both files completely, then score the port's accuracy from 0–100 using
the weighted rubric below.

### Scoring Rubric

| Category | Weight | What to Check |
|----------|--------|---------------|
| **Function Coverage** | 40% | All original functions present? Count missing, stubbed, renamed. Inlined = present if logic preserved. |
| **Logic Accuracy** | 30% | Is each function faithfully ported? Penalize rewrites, simplified algorithms, changed control flow, wrong formulas, behavioral differences. |
| **Constants & Data Fidelity** | 15% | All constants, lookup tables, enum values, data structures correct and complete? Verify VALUES, not just names. |
| **Variable & State Fidelity** | 15% | Global variables, cross-module state, calling conventions accurately represented? |

### Score Bands

| Range | Band |
|-------|------|
| 80–100 | Excellent |
| 65–79 | Good |
| 50–64 | Moderate |
| 35–49 | Below Average |
| 0–34 | Poor |

### Per-File Output

1. **Numeric score** (0–100) with sub-scores per rubric category.

2. **Function inventory table:**
   | Original Function | Present in Port? | Notes |
   |-------------------|------------------|-------|

3. **Numbered gap/error list** — every specific issue preventing 100:
   - Missing functions (name them)
   - Logic differences (quote original vs. port side-by-side)
   - Wrong constant values (show expected vs. actual)
   - Missing variables or changed types
   - Off-by-one errors, changed comparators, divisor changes
   - Defensive code added that the original lacks

4. **Brief summary paragraph.**

### Final Report (after all files in the group)

1. Sorted summary scorecard table (file, score, band).
2. Critical Issues list — behavior-breaking bugs ranked by severity.
3. Overall average score.

### Output Format

Produce the evaluation as **both structured JSON and human-readable markdown**
so it can be consumed by automated tooling and human reviewers.

### JSON Structure

```json
{
  "files": [
    {
      "original_file": "path/to/original.c",
      "ported_file": "path/to/ported.cs",
      "score": 72,
      "sub_scores": {
        "function_coverage": 80,
        "logic_accuracy": 65,
        "constants_data_fidelity": 70,
        "variable_state_fidelity": 73
      },
      "band": "Good",
      "functions": [
        {"original": "func_name", "present": true, "notes": "..."}
      ],
      "issues": [
        {"id": 1, "severity": "P0", "category": "logic", "description": "...", "original_code": "...", "ported_code": "..."}
      ],
      "summary": "..."
    }
  ],
  "overall_score": 72,
  "critical_issues": ["..."]
}
```

### Guidelines

- Platform-specific code reasonably replaced by managed equivalents: note but
  do not penalize as harshly as missing core logic.
- Verify actual values, not just names. Check enum orderings, array contents,
  formula operands.
- Note where the port adds defensive code not in the original.
- Flag any `>=` replacing `==`, changed divisors, off-by-one errors.
- Run two independent scoring passes and average to reduce variance.
- Group 2–3 file pairs per pass to keep context manageable.

---

## Phase 3 — Fixer

### Role

You are an expert code corrector. You will read an evaluation report, then
systematically fix every issue in the ported file to bring it to a 100% score.

### Input

You will receive THREE things:
- A. The original source file(s) — the single source of truth
- B. The current ported file
- C. The evaluation report (score, gap list, function inventory)

### Task

#### 1. TRIAGE

Read the evaluation report and categorize every gap/error:

| Priority | Category | Example |
|----------|----------|---------|
| P0 | Behavior-breaking logic | Wrong formula, missing state machine |
| P1 | Missing functions | Entire function not ported |
| P2 | Wrong constants/data | Enum value off, table entry wrong |
| P3 | Type/variable mismatch | int vs uint, missing global |
| P4 | Control flow drift | Restructured loop, inverted condition |
| P5 | Cosmetic/defensive | Added null checks, renamed variables |

Output this triage table before making any changes.

#### 2. FIX — For each issue, in priority order (P0 first)

a. State the issue number and description from the evaluation
b. Show the ORIGINAL source code (the ground truth)
c. Show the CURRENT ported code (the bug)
d. Show the CORRECTED code
e. Explain what was wrong and why the fix is faithful

**Rules for fixes:**
- Always fix toward the original source, never toward "better target language"
- Do NOT introduce new abstractions, patterns, or refactors
- Do NOT add defensive code unless it was in the original
- Preserve variable names from the original
- If a function was missing, port it using the same translation rules as Phase 1
- If a constant was wrong, use the EXACT original value
- If control flow was restructured, restore the original structure
- If a goto was refactored away, put it back (if target language supports it)

#### 3. OUTPUT

a. The complete corrected file (not a diff — the whole file, ready to drop in)
b. A CHANGELOG table:
   | Issue # | Priority | What Changed | Lines Affected |
   |---------|----------|--------------|----------------|
c. A SELF-AUDIT — re-score the corrected file using the same rubric.
   For each sub-category, explain why it should now score higher. Be honest.
d. A REMAINING ISSUES list — anything you could not fix and why.

#### 4. QUALITY GATES (self-check)

- [ ] Every P0 and P1 issue is resolved
- [ ] The corrected file compiles (mentally verify syntax)
- [ ] No new issues were introduced by the fixes
- [ ] The self-audit score is higher than the original evaluation score
- [ ] Every fix references the original source code as ground truth

### Guidelines

- If the evaluation report is ambiguous, read the original source — it is the
  single source of truth.
- If fixing one issue would break another function, note the conflict and fix both.
- If a fix requires a cross-file dependency that doesn't exist yet, add a
  `// DEPENDENCY: needs {filename}.{function}` comment and stub it.
- Aim for 100% but be honest. A 95% with clear documentation of the remaining 5%
  is better than a claimed 100% with hidden compromises.

---

## Language-Specific Type Mapping Examples

These are provided as reference. The orchestrator generates the appropriate mapping
based on the detected source and target languages.

### C → C#

| C Type | C# Type | Notes |
|--------|---------|-------|
| `unsigned short` | `ushort` | |
| `long` | `int` | 32-bit, match DOS long |
| `unsigned long` | `uint` | |
| `char*` | `string` or `byte[]` | Depends on usage |
| `function pointers` | `delegate` or `Action/Func<>` | |

### Python → Rust

| Python Type | Rust Type | Notes |
|-------------|-----------|-------|
| `int` | `i64` or `i32` | Depends on range |
| `float` | `f64` | |
| `str` | `String` or `&str` | Owned vs borrowed |
| `list[T]` | `Vec<T>` | |
| `dict[K,V]` | `HashMap<K,V>` | |
| `Optional[T]` | `Option<T>` | |
| `None` | `None` | Option variant |

### Java → Kotlin

| Java Type | Kotlin Type | Notes |
|-----------|-------------|-------|
| `int` | `Int` | |
| `String` | `String` | Nullable: `String?` |
| `List<T>` | `List<T>` or `MutableList<T>` | |
| `Map<K,V>` | `Map<K,V>` or `MutableMap<K,V>` | |
| `void` | `Unit` | |
| `@Nullable T` | `T?` | |

### JavaScript → TypeScript

| JavaScript | TypeScript | Notes |
|------------|-----------|-------|
| `let x` | `let x: type` | Infer type from usage |
| `function(a,b)` | `function(a: T, b: U): R` | Add parameter and return types |
| `{}` | `interface` or `type` | Define shape types |
| `Promise` | `Promise<T>` | Type the resolution value |
| `any`/dynamic | Specific type | Narrow as much as possible |
