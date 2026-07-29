# pre-commit

Use Vale with pre-commit, a Git Hooks framework.

[`pre-commit`](https://pre-commit.com/index.html) is a framework for managing and maintaining multi-language pre-commit hooks. It’s designed to be language-agnostic and can be used with any project.

To get started, here’s an example configuration that incorporates running `vale sync` prior to running Vale:

```yaml
repos:
  - repo: https://github.com/errata-ai/vale
    rev: 16d3a7f
    hooks:
      - id: vale
        name: vale sync
        pass_filenames: false
        args: [sync]
      - id: vale
        args: [--output=line, --minAlertLevel=error]
```

https://github.com/errata-ai/vale-action https://plugins.jetbrains.com/plugin/19613-vale-cli/docs
