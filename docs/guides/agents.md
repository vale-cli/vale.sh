# Agents

Use Vale with an AI assistant: on what it writes, on what it reads, and as a tool it runs.

An agent meets Vale in three places. The prose it writes can be checked against a voice, so a style is enforced on every draft instead of remembered. The instructions it reads, `AGENTS.md`, `CLAUDE.md`, a skill, are prose files in a repository, and can be linted like any other. And Vale itself is a tool an agent can set up and run, with the same four steps as the [Quickstart](../topics/quickstart.md).

## [What an agent writes](agents.md#what-an-agent-writes)

A writing prompt has three parts: a persona, a set of constraints, and guardrails about where the constraints do not apply. The persona is the one thing a model does reliably. The constraints, no hedging, one slang term a sentence, sentences under 25 words, are a linter written as prose, and the guardrails, "none of this applies inside code or paths," are what Vale does by parsing the markup.

[Voices](https://github.com/jdkato/voices) is that conversion done: writing voices from the [output-style catalog](https://github.com/smixs/awesome-claude-output-styles), written as Vale rules. A rule costs nothing until a draft breaks it, where a prompt is paid for on every request, and an exit code is a fact where "I followed the style" is a claim. The [announcement](https://vale.sh/blog/voices) runs one draft through each voice and measures both.

```ini
Packages = https://github.com/jdkato/voices/releases/latest/download/Voices.zip

[*.md]
BasedOnStyles = Voices, Direct
```

`Voices` is the shared core, inflated words, throat-clearing, weasel attribution, recap endings, and is always on. `Direct`, `GenZ`, `Coach`, `Simple`, and `Claude` each add one voice beside it. `Claude` is derived from the formatting section of the published system prompts for Claude and is the demonstration of the argument: that section of a production prompt is already a linter. Voices requires Vale v3.20.0 or later and builds on [Std](https://github.com/vale-cli/Std).

With the edit-time hook below, the alerts reach the assistant in the turn it wrote the draft, and a rule that carries a fix is applied without a decision.

## [What an agent reads](agents.md#what-an-agent-reads)

An instruction file holds a model to a standard, and the same standard can be held to the file: say what to do, in the mood of a command, in a file short enough to be read on every turn. [Prompts](https://github.com/jdkato/Prompts) is a style for `AGENTS.md`, `CLAUDE.md`, `SKILL.md`, and system prompts, on any agent's file:

```ini
Packages = https://github.com/jdkato/Prompts/releases/latest/download/Prompts.zip

[{AGENTS,CLAUDE,SKILL}.md]
BasedOnStyles = Prompts
```

Its rules report advice where an instruction belongs (`you should`, `make sure to`), words that name no action (`handle`, `ensure`, `best practices`), more than ten absolutes in one file, two instructions that pull opposite ways, a skill `description` past the length its loader reads, a section past 300 words, and a file past 2,500. Each rule links to the vendor guidance it enforces. Name the files you mean in the section: a style for instructions has no business in the README. Prompts requires Vale v3.21.0 or later.

## [What an agent runs](agents.md#what-an-agent-runs)

An assistant can install Vale, write a configuration, and fix what it reports. What it needs beyond the Quickstart is the handful of facts that are easy to get wrong without reading further: only `error` sets a non-zero exit code, `--output=JSON` is the format to parse, and a term that trips spell check belongs in a vocabulary rather than in a switched-off rule.

### [AGENTS.md](agents.md#agentsmd)

[AGENTS.md](https://vale.sh/AGENTS.md) says all of that in the form assistants read. Save it in the root of your repository, where most of them find it on their own, and give it to one instead of the Quickstart.

### [Skills](agents.md#skills)

For task-shaped work there are [skills](https://vale.sh/skills) to copy in beside it, each a set of instructions an assistant follows when the task comes up:

| Skill    | What it does                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `setup`  | Install Vale, write a `.vale.ini`, sync the styles, and get a first run in a repository that has none.                  |
| `fix`    | Run Vale, fix the error-level alerts, and open a pull request per file. Warnings and suggestions are left for a person. |
| `triage` | Turn a large first run into a decision per rule: fix, downgrade, or switch off.                                        |
| `vocab`  | Add a project's terms to a vocabulary so spell check accepts them.                                                     |
| `ci`     | Run Vale in GitHub Actions, a pre-commit hook, or another runner, failing the build on errors.                         |

The skills run the CLI you installed and need no account.

### [Claude Code](agents.md#claude-code)

In Claude Code, the skills, an edit-time hook, and the Vale CMS MCP server install together as one plugin:

```
/plugin marketplace add vale-cli/agent-tools
/plugin install vale@agent-tools
```

The hook lints each prose file as the assistant writes it and hands back the alerts, so a mistake is fixed in the same turn it was made. By default it hands back errors only, since a project's warnings and suggestions are advisory by its own choice; the plugin's `level` setting widens that to `warning` or `suggestion` for a style whose rules are deliberately advisory, which is what a voice is.

The MCP server is the one paid piece. It belongs to [Vale CMS](https://vale.sh/cms) and gives an assistant the engine itself to check a rule against, rather than the docs about it. See [MCP](mcp.md).
