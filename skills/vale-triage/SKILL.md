---
name: vale-triage
description: Turn a large first Vale run into a decision per rule — fix, downgrade, or switch off. Use when the user says "too many alerts", "where do we start", "vale is too noisy", or has just added Vale to an existing corpus.
---

# Triage a first Vale run

## When to use this

Vale runs, the count is in the thousands, and the question is where to start.
The output of this skill is a short ordered plan, not a fixed file.

## Prerequisites

1. `vale ls-config` resolves.
2. You know which path represents the real corpus, not a subset.

## Workflow

**1. Count by rule, not by file.**

```bash
vale --output=JSON <path> > /tmp/vale.json
jq -r 'to_entries | map(.value[]) | group_by(.Check) | map({check: .[0].Check, n: length, severity: .[0].Severity}) | sort_by(-.n) | .[] | "\(.n)\t\(.severity)\t\(.check)"' /tmp/vale.json | head -20
```

**2. Report the shape before proposing anything**: total, the split by
severity, and the ten rules responsible for the most. A team that hears
"18,000 alerts" reaches for `MinAlertLevel`; a team that hears "four rules are
80% of this" makes a decision.

**3. Sort each of the top rules into one bucket, and say which and why:**

| bucket | when | what to write |
|---|---|---|
| **Fix** | few hits, rule is right | do it now, or hand to `vale-fix` |
| **Downgrade** | rule is right, backlog is real | set it to `suggestion` so it guides new writing |
| **Disable** | rule does not match how this project writes | name it in the config *with a comment saying why* |

**4. Say what currently blocks.** Only `error` exits non-zero, so a pipeline
can adopt Vale immediately with everything else advisory. That is usually the
right first move and worth stating outright.

**5. Report.**

```
Vale triage
===========
Total: 18,412   errors 3 · warnings 1,204 · suggestions 17,205
Blocking today: 3 alerts across 2 rules

Top rules
  9,881  suggestion  Microsoft.Wordiness      → downgrade (real backlog, right rule)
  3,442  suggestion  Microsoft.Contractions   → disable (house style differs)
  1,204  warning     Microsoft.Headings       → fix (mechanical, 40 files)
```

## Do not

- Do not propose raising `MinAlertLevel` as the fix. It hides alerts without
  deciding anything, and the decisions are the point.
- Do not disable a rule because it is noisy on legacy content that new content
  would pass. Downgrade it.
- Do not recommend a bucket without saying what it costs.
