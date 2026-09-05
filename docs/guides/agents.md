# Coding agents

Set Vale up, and keep it running, when an AI assistant is doing the work.

An assistant can install Vale, write a configuration, and fix what it reports, and the same four steps as the [Quickstart](../topics/quickstart.md) apply. What it needs beyond those is the handful of facts that are easy to get wrong without reading further: only `error` sets a non-zero exit code, `--output=JSON` is the format to parse, and a term that trips spell check belongs in a vocabulary rather than in a switched-off rule.

## [AGENTS.md](agents.md#agentsmd)

[AGENTS.md](https://vale.sh/AGENTS.md) says all of that in the form assistants read. Save it in the root of your repository, where most of them find it on their own, and give it to one instead of the Quickstart.

## [Skills](agents.md#skills)

For task-shaped work there are [skills](https://vale.sh/skills) to copy in beside it, each a set of instructions an assistant follows when the task comes up:

| Skill    | What it does                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------------- |
| `setup`  | Install Vale, write a `.vale.ini`, sync the styles, and get a first run in a repository that has none.    |
| `fix`    | Run Vale, fix the error-level alerts, and open a pull request per file. Warnings and suggestions are left for a person. |
| `triage` | Turn a large first run into a decision per rule: fix, downgrade, or switch off.                          |
| `vocab`  | Add a project's terms to a vocabulary so spell check accepts them.                                       |
| `ci`     | Run Vale in GitHub Actions, a pre-commit hook, or another runner, failing the build on errors.           |

The skills run the CLI you installed and need no account.

## [Claude Code](agents.md#claude-code)

In Claude Code, the skills, an edit-time hook, and the Vale CMS MCP server install together as one plugin:

```
/plugin marketplace add vale-cli/agent-tools
/plugin install vale@agent-tools
```

The hook lints each prose file as the assistant writes it and hands back the alerts, so a mistake is fixed in the same turn it was made. By default it hands back errors only, since a project's warnings and suggestions are advisory by its own choice; the plugin's `level` setting widens that to `warning` or `suggestion` for a style whose rules are deliberately advisory.

The MCP server is the one paid piece. It belongs to [Vale CMS](https://vale.sh/cms) and gives an assistant the engine itself to check a rule against, rather than the docs about it. See [MCP](mcp.md).
