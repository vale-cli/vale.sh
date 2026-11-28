# Agents

## Writing docs

`docs/` is the copy of docs.vale.sh that GitBook syncs. After editing a page,
lint it with the agent template:

```console
$ vale sync
$ vale --output=.github/styles/config/templates/ai-tells-agent.tmpl docs/<page>.md
```

The config encodes how these docs were written before LLMs:

- Fix every error. Each finding is a construction the docs didn't use before:
  figurative verbs (`the alert carries`, `holds no prose`), negated objects
  (`needs no definition`), count lead-ins (`Two files are`), `, so ...`
  consequence clauses, and `Every X` subjects.
- Use suggestions (em dashes, semicolons) sparingly. Keep one only when a
  comma, period, or parentheses would read worse.
- Rules that are off (`For example`, `a single`, label colons, `This means
  that`) are part of the voice. Don't rewrite them away.

A fix keeps the meaning and the facts. Leave code, links, option names, and
GitBook blocks (`{% hint %}`, `{% tabs %}`) as they are. If a rewrite would
read worse than the finding, leave the finding.

CI doesn't run these rules (see `.github/styles/config/filters/ci.expr`), so a
leftover finding never fails a build.
