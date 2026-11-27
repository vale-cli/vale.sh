# pre-commit

Use Vale with pre-commit, a Git Hooks framework.

[`pre-commit`](https://pre-commit.com/index.html) is a framework for managing and maintaining multi-language pre-commit hooks. It’s designed to be language-agnostic and can be used with any project.

To get started, here’s an example configuration that installs your packages before running Vale:

```yaml
repos:
  - repo: https://github.com/vale-cli/vale
    rev: v3.30.0
    hooks:
      - id: vale-sync
      - id: vale
        args: [--output=line, --minAlertLevel=error]
```

`vale-sync` runs `vale sync --if-needed`: it installs your packages on a fresh
clone, then again only when `Packages`, your languages, your grammars, or
Vale’s version change. Other commits make no network requests. List it before
`vale`, and give it the same `--config` if you pass one to `vale`.

Pin `rev` to a release tag rather than a commit. A commit pin is a version like
any other and goes stale silently: the hook keeps installing whatever Vale was
at that moment, so fixes released since then never reach it. A configuration
pinned to an old revision can fail on features the docs describe — a `Vocab`
that Vale reports as missing, for one — while the same setup works on a current
release.
