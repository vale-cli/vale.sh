# Views

Customize the file-processing pipeline with Views.

Views represent a virtual, filtered perspective of a file that has structure but no markup Vale can parse: a data file, a source file, or plain text with a convention. They define a series of steps that extract specific, named [scopes](scopes.md), effectively changing how the file is represented for linting purposes. By focusing only on relevant sections, Views let you control exactly what content is analyzed—and enable rules that apply only to specific parts of a file.

A markup file needs no View. Vale parses it into the document its rules already see, and a rule reaches part of that document with a [scope](scopes.md#selections).

Each View is defined in a YAML file and consists of a series of steps that are executed in order. Each step includes the following fields:

* `name`: The name of the step. If no `type` is provided, the name is used as the only scope for the value. Otherwise, the `name` is used as a metascope and will be appended to the active scope – such as `heading.<name>.md`.
* `expr`: An expression that selects the data to be linted. The expression is evaluated by the active [engine](views.md#engines).
* `type`: The type of the data. Supported types are `md`, `adoc`, `html`, `rst`, or `org`.

Here’s an example of a View that extracts the `title` and `description` fields from an OpenAPI document:

```yaml
engine: dasel
scopes:
  - name: title
    expr: info.title
    type: md

  - expr: info.description
    type: md

  - expr: servers.all().description
    type: md
```

Views are stored in `<StylesPath>/config/views` and can be referenced in the `.vale.ini` file under any syntax-specific section:

```ini
[*.json]
BasedOnStyles = Vale

View = MyView
```

## [Engines](views.md#engines)

Each step in a View contains a query that is processed by the View’s engine: [Dasel](https://github.com/TomWright/dasel) for data (JSON, YAML, or TOML), [tree-sitter](https://tree-sitter.github.io/tree-sitter/) for source code, or [TextFSM](views.md#textfsm) for plain text.

### [Dasel](views.md#dasel)

[Dasel](https://github.com/TomWright/dasel) is a command-line tool that allows you to query and modify data structures using selectors. It works with JSON, YAML, TOML, XML, and more.

Vale uses Dasel to query structured data in files and extract the relevant content. For example, given the following JSON:

```json
{
	"title": "Vale",
	"version": "3.0.0",
	"features": [
		{
			"title": "Views",
			"description": "Customize the file-processing pipeline with Views."
		},
		{
			"title": "Styles",
			"description": "Define custom linting rules with Styles."
		}
	]
}
```

You could use the following View to extract the `name` and `description` fields from each feature:

```yaml
engine: dasel
scopes:
  # The `name` field is used as the metascope, allowing us to
  # write rules that specifically target the `title` field by
  # using the custom `feature` scope.
  - name: feature
    expr: features.all().title
    type: md

  - expr: features.all().description
    type: md
```

Check out the [playground](https://dasel.tomwright.me/) to experiment with Dasel queries.

### [Tree-sitter](views.md#tree-sitter)

[Tree-sitter](https://tree-sitter.github.io/tree-sitter/) is a parser generator tool and an incremental parsing library. It can be used to build parsers for source code in any language.

Vale uses tree-sitter to parse source code and extract structured data. For example, given the following Python code:

```python
# This a comment.
def hello(name: str) -> str:
    """
    This is a docstring.
    """
    return f"Hello, {name}!"
```

You could use the following View to extract all comments and function docstrings:

```yaml
engine: tree-sitter
scopes:
  - name: comment
    expr: (comment)+ @comment

  - expr: |
      ((function_definition
        body: (block . (expression_statement (string) @docstring)))
      (#offset! @docstring 0 3 0 -3))
```

See [Pattern Matching with Queries](https://tree-sitter.github.io/tree-sitter/using-parsers/queries/index.html) for more information.

### [TextFSM](views.md#textfsm)

{% hint style="info" %}
Requires Vale v3.21.0 or later.
{% endhint %}

Plain text often has structure by convention rather than by markup: a commit message is a subject, a blank line, a body, and trailers; a transcript is a series of turns, each opened by a name. Nothing parses that, so Vale reads such a file as lines and a rule can’t say “the subject” or “the model’s turn.”

A `textfsm` View reads the file through a template in the form [TextFSM](https://github.com/google/textfsm/wiki/TextFSM) defined: a list of named values, then a state machine whose rules are regular expressions. Vale runs the template itself, in the same regular-expression dialect every rule uses, and records the line and column of everything it captures, so an alert lands where the text is.

The template is written inline under `template`, and each scope’s `expr` names one of its values:

```yaml
engine: textfsm
template: |
  Value Subject (.+)
  Value List Body (.*)
  Value List Trailer ([A-Z][\w-]+: .+)

  Start
    ^${Subject} -> Body

  Body
    ^${Trailer}
    ^${Body}
scopes:
  - name: subject
    expr: Subject

  - name: body
    expr: Body
    type: md

  - name: trailer
    expr: Trailer
```

```ini
[COMMIT_EDITMSG]
BasedOnStyles = Vale, House

View = Commit
```

A commit message then yields three scopes, and a rule reaches one of them the way it reaches a heading:

```yaml
extends: existence
message: "A subject line doesn't end with '%s'."
level: error
scope: subject
raw:
  - '\.$'
```

The template language, in brief:

* A `Value` line declares a name and the pattern that fills it. `List` gathers every capture rather than the last; `Filldown` carries a value into the next record; `Required` drops a record the value is missing from.
* A state is a name on its own line, and the rules under it are tried in order against each line of the file. `Start` is where reading begins.
* A rule is a pattern, in which `${Name}` stands for a value’s pattern and captures it, followed by an optional `->` and what happens on a match: `Next` (the default) reads the next line, `Continue` keeps trying the rules below on the same line, `Record` emits the values captured so far, and a state name moves to that state. `End` stops reading.
* A record is emitted at the end of the file as well, so a template that never says `Record` yields one record per file.

Consecutive lines a `List` value captures are joined into one block, so a body reads as the paragraphs it is. A line the template captures at a different column starts a new block.

The second example is the one that gives the engine its reason to exist. A transcript alternates between a user and a model, and only one side is yours to lint:

```yaml
engine: textfsm
template: |
  Value List Assistant (.*)
  Value List User (.*)

  Start
    ^assistant: ${Assistant} -> Assistant
    ^user: ${User} -> User

  Assistant
    ^(?:user|assistant): -> Continue.Record
    ^assistant: ${Assistant}
    ^user: ${User} -> User
    ^${Assistant}

  User
    ^(?:user|assistant): -> Continue.Record
    ^user: ${User}
    ^assistant: ${Assistant} -> Assistant
    ^${User}
scopes:
  # Only the model's turns are linted; the prompts are left alone.
  - name: assistant
    expr: Assistant
    type: md
```

A rule scoped to `assistant` runs over the model’s turns, and a misspelling in the user’s prompt goes unreported, because no scope names the `User` value.

The same shape fits any text with a convention: subtitles, where the cue text is prose and the timestamps aren’t; patch mail, with a description above the diff; `debian/changelog` entries; `.po` translation catalogs, where `msgstr` is the translation and `msgid` the source; man page sources; screenplays, where dialogue follows different rules from action.
