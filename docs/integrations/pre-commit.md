# pre-commit

Use Vale with pre-commit, a Git Hooks framework.

[`pre-commit`](https://pre-commit.com/index.html) is a framework for managing and maintaining multi-language pre-commit hooks. It’s designed to be language-agnostic and can be used with any project.

To get started, here’s an example configuration that incorporates running `vale sync` prior to running Vale:

```yaml
repos:
  - repo: https://github.com/vale-cli/vale
    rev: v3.17.0
    hooks:
      - id: vale
        name: vale sync
        pass_filenames: false
        args: [sync]
      - id: vale
        args: [--output=line, --minAlertLevel=error]
```

Pin `rev` to a release tag rather than a commit. A commit pin is a version like
any other and goes stale silently: the hook keeps installing whatever Vale was
at that moment, so fixes released since then never reach it. A configuration
pinned to an old revision can fail on features the docs describe — a `Vocab`
that Vale reports as missing, for one — while the same setup works on a current
release.

https://github.com/vale-cli/vale-action https://plugins.jetbrains.com/plugin/19613-vale-cli/docs
