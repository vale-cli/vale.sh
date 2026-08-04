---
name: vale-ci
description: Run Vale in CI or a pre-commit hook, failing the build on what the project decided should fail and nothing else.
---

# Put Vale in the pipeline

Use when Vale runs locally and should now run automatically.

## What decides pass or fail

**Only `error` sets a non-zero exit code.** Warnings and suggestions exit 0. So
a job wired up naively passes no matter how much it reports — which is fine, and
is usually the right way to start, as long as everyone knows that is what it is
doing.

Say which of the two you are setting up:

- **Advisory** — Vale reports, the job stays green. Good for adopting Vale on a
  corpus that has never had it.
- **Blocking** — the rules the team cares about are set to `error` in the
  config, and the job fails on them.

## GitHub Actions

```yaml
- uses: vale-cli/vale-action@reviewdog
  with:
    files: docs
```

It posts alerts as review comments on the pull request, which is where a
writer will actually see them.

## Pre-commit

```yaml
repos:
  - repo: https://github.com/vale-cli/vale
    rev: v3.17.0
    hooks:
      - id: vale
```

Pin `rev` to a release. Hooks that float break at the worst time.

## Any other runner

```bash
vale --output=line docs/
```

`--output=line` gives `path:line:col:rule:message`, which most CI systems can
annotate. Add `--no-global` so the run does not depend on a config on the
machine.

## Do not

- Do not add `--no-exit` to make a failing job pass. If the team does not want
  those alerts to block, change the levels in the config, where the decision is
  visible.
- Do not run `vale sync` and lint in one step without pinning `Packages`. A
  style that updates upstream will fail a build nobody changed.
