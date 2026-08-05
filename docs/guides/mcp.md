# MCP

Give an AI assistant the Vale engine, so it can check its own work.

Models write plausible Vale YAML. Whether it compiles, whether the regex matches anything, whether the config still loads — a model has no way to find out, so you find out later, in CI.

The Vale MCP server closes that gap. It exposes the engine as [Model Context Protocol](https://modelcontextprotocol.io) tools, so an assistant can scaffold a rule, compile it, run it over sample text, and see the alerts it produced — before writing a file.

{% hint style="info" %}
The hosted MCP server is part of [Vale CMS](https://vale.sh/cms), which is a paid product. Vale itself — the CLI, the engine, and the styles — stays free, open source, and MIT licensed.
{% endhint %}

## Connecting

The server speaks JSON-RPC 2.0 over HTTP. Point your client at it with a token from your Vale CMS account:

```json
{
  "mcpServers": {
    "vale-cms": {
      "type": "http",
      "url": "https://api.vale.sh/mcp"
    }
  }
}
```

Clients that support remote MCP servers — Claude Code, Claude Desktop, Cursor, VS Code, and others — need nothing installed locally.

## What the tools do

The tools fall into four groups.

### Author

Start from something that already compiles, rather than a blank file and a guess at the schema.

| Tool | Purpose |
| --- | --- |
| `scaffold_rule` | A valid starter rule for any of the twelve check types |
| `scaffold_vocab` | A vocabulary, with its `accept.txt` and `reject.txt` |
| `scaffold_dictionary` | A Hunspell `.dic`/`.aff` pair |
| `scaffold_filter` | A filter expression over your rules |
| `scaffold_view` | A view that extracts part of a document |
| `scaffold_template` | An output template |
| `assemble_style` | A whole style package, with each rule checked against the guide's own examples |
| `fetch_guide` | A published style guide, as text you can derive rules from |

### Verify

The half that generation can't do for itself.

| Tool | Purpose |
| --- | --- |
| `diagnose_rule` | Compile a rule and report the error, with its position |
| `test_rule` | Run a rule over inputs and check each should or shouldn't match |
| `stress_rule` | Generate near-miss inputs from the rule's own tokens and report what it wrongly flags |
| `check_config` | Load a whole proposed project through the engine |
| `lint_text` | The alerts a config produces on sample prose |
| `audit_style` | Correctness and performance defects no compile step catches |
| `check_links` | Resolve every rule's `link:` field, which Vale itself never validates |

### Understand

Answers about the engine, from the engine.

| Tool | Purpose |
| --- | --- |
| `explain_check` | What a check type detects, its fields, and an example |
| `list_check_types` | All twelve extension points |
| `tag_text` | Part-of-speech tags, as the `sequence` check sees them |
| `show_blocks` | How a format splits text into the blocks rules run over |
| `trace_rule` | What each slot of a sequence wanted, beside what the tagger said |
| `resolve_config` | The config the engine actually resolved |
| `project_layout` | Where every asset belongs, and how to enable it |
| `expand_dictionary` | The exact word forms a Hunspell entry accepts |

### Change safely

Editing a rule already in use is the risky edit.

| Tool | Purpose |
| --- | --- |
| `diff_rule` | Which alerts an edit adds and removes, over a corpus you supply |
| `diff_style` | The same, for a whole package |
| `render_template` | What a template produces against real alerts |
| `put_files` | Upload a project once and reference it by hash |

## Three questions it answers

These are the questions that cost hours by hand and one call here.

### A rule looks right and never fires

Sequence rules match on part-of-speech tags, and the tagger's reading of a word is invisible in the YAML. `trace_rule` shows what each slot wanted beside what the tagger actually produced — a slot expecting a proper noun sitting on a word tagged `JJ` is a rule that can never match.

The useful part is what it rules out: the rule may be correct and the tagger may simply disagree with you, which calls for a documented exception rather than a rewrite.

### A rule behaves differently in Markdown and plain text

`show_blocks` shows how each format splits a document into the blocks rules run over. A `.txt` file is one block, so its whole `text` scope is a single unit; the same content in Markdown is one block per paragraph.

That is how a pattern containing `\s+` quietly matches across a blank line and joins two paragraphs. The cause is the format, not the pattern.

### Linting got slower and no rule changed

`audit_style` prices a style before any text is read — what it costs to compile, which is paid on every run whether or not a rule ever fires. On a short document that is most of the wall clock.

A negated character class under `ignorecase` is the classic example: the regex engine computes the case orbit of every member, at roughly 3.6× the compile cost of the `\s` it replaced.

## See also

* [Vale CMS](https://vale.sh/cms) — the hosted editor the MCP server is part of
* [Styles](../topics/styles.md) — what a rule is, and the twelve check types
* [Scopes](../topics/scopes.md) — the scoping system `show_blocks` reports on
