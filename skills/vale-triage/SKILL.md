---
name: vale-triage
description: Turn a first Vale run on an existing corpus into a short, ordered plan — which rules to fix, which to downgrade, which to switch off.
---

# Triage a first Vale run

Use when Vale has just been added to a repository that already has a lot of
prose, and the alert count is too large to act on directly.

The goal is a decision per rule, not a fixed file.

## Steps

1. **Count by rule, not by file:**

   ```bash
   vale --output=JSON <path> > /tmp/vale.json
   ```

   Group the alerts by `Check` and by `Severity`. A handful of rules almost
   always produce most of the output.

2. **Report the shape before proposing anything**: total alerts, the split by
   severity, and the ten rules responsible for the most. A team that sees
   "18,000 alerts" reaches for `MinAlertLevel`; a team that sees "four rules
   are 80% of this" makes a decision.

3. **Sort each of the top rules into one of three buckets**, and say which and
   why:

   - **Fix** — few enough hits to clear now, and the rule is right.
   - **Downgrade** — the rule is right but the backlog is real. Set it to
     `suggestion` so it guides new writing without failing anything.
   - **Disable** — the rule does not match how this project writes. Name it in
     the config with a comment saying why.

4. **Check what actually blocks.** Only `error` sets a non-zero exit code, so a
   pipeline can adopt Vale immediately with everything else advisory. That is
   usually the right first move, and it is worth saying explicitly.

## Do not

- Do not propose raising `MinAlertLevel` as the fix. It hides the alerts
  without deciding anything, and the decisions are the point.
- Do not disable a rule because it is noisy on legacy content when new content
  would pass it. Downgrade instead.
