# Views

Learn how to lint the prose inside a file that is not prose.

A markup file is a document, and Vale parses it into the blocks its rules see. A data file, a source file, or a plain-text file with a convention has prose in it too, in the descriptions of an API specification, the docstrings of a module, the body of a commit message, but nothing marks where. A View says where: a list of queries that pull named pieces out of the file, so that Vale lints those and passes over the rest, and a rule can be written for one of them by name.

```yaml
# <StylesPath>/config/views/OpenAPI.yml
engine: dasel
scopes:
  - name: title
    expr: info.title

  - name: description
    expr: search(has("description")).map(description)
    type: md
```

```ini
[*.{json,yml,yaml}]
BasedOnStyles = Vale, House
View = OpenAPI
```

A View is a YAML file in the `StylesPath`'s `config/views` directory, and the [`View`](../keys/view.md) key names it under a section, so the files it applies to are whichever that section matches. A name that is not there is an error when the configuration loads, and a query that fails is an error that points at the section.

## [The file](views.md#the-file)

| Key        | Description                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `engine`   | What runs the queries: `dasel` for a data file, `tree-sitter` for source code, or `textfsm` for plain text.                                            |
| `scopes`   | The queries, in order. Each has an `expr` the engine evaluates, an optional `name`, an optional `type`, and for `dasel` an optional `join`.               |
| `template` | For `textfsm` only: the template the file is read through. Each scope's `expr` names one of its values.                                                |

A scope's `name` is how a rule reaches what the query found. It is appended to the scope of every block the value produces, so a rule with `scope: title` runs on the titles and nothing else, and a rule with the usual `scope: text` runs on everything the View extracted. A query without a name is linted, and is reachable only by the scopes the format gives it.

A scope's `type` is the format the extracted text is parsed as: `md`, `rst`, `html`, `org`, or `adoc`. Without one, the text is read as plain lines, which is right for a title and wrong for a description written in Markdown.

![A file goes to an engine, whose query yields values placed at their line and column, and each value becomes a block whose scope carries the query's name. Dasel reads a data file with a selector, tree-sitter reads source code with a query, and TextFSM reads plain text with a template's named value.](../.gitbook/assets/views-engines.svg)

## [Data](views.md#data)

A `dasel` View applies to any file its section matches. The file is read as JSON, YAML, or TOML by its extension, and as YAML, which reads JSON too, when the extension is none of those. Each `expr` is a [Dasel](https://github.com/TomWright/dasel) selector over the parsed document. A selector may land on one string or many; every string it selects is one value, and anything that is not a string is dropped. A list of strings is dropped too, unless the scope has a `join`, the separator the list is joined with to make one value. A notebook keeps each Markdown cell's source as a list of lines that already end in a line break, so the cell is one value with `join: ""`, placed where its first line is:

```yaml
# <StylesPath>/config/views/Notebook.yml
engine: dasel
scopes:
  - name: cell
    expr: cells.all().filter(equal(cell_type,markdown)).source
    join: ""
    type: md
```

```ini
[*.ipynb]
BasedOnStyles = Vale
View = Notebook
```

```json
{
  "features": [
    { "title": "Views", "description": "Lint the prose inside a data file." },
    { "title": "Styles", "description": "Collect rules into a style." }
  ]
}
```

```yaml
engine: dasel
scopes:
  - name: feature
    expr: features.all().title

  - expr: features.all().description
    type: md
```

For JSON and YAML, each value is placed at the line and column the parser read it from, so an alert points into the source file, and a folded YAML block is read with its line breaks kept so positions stay line for line. TOML gives no positions, and a value is found by searching the text for it.

A YAML or TOML file's comments are linted as well, whatever the View selects: a comment is prose, and a selector cannot reach one. They carry the scopes a source file's comments do, `text.comment.line` and `text.comment.block`, so `IgnoredScopes = comment` leaves them out.

## [Code](views.md#code)

Vale reads source code by its comments. A `tree-sitter` View replaces that with queries of your own, in tree-sitter's [query language](https://tree-sitter.github.io/tree-sitter/using-parsers/queries/index.html), run against the file's syntax tree. It applies to the languages Vale has a grammar for: C, C++, CSS, Elixir, Go, Haskell, Java, JavaScript, Julia, Kotlin, Lua, PHP, Protocol Buffers, Python, QML, R, Ruby, Rust, TOML, TypeScript, and YAML.

```python
def hello(name: str) -> str:
    """Greet someone by name."""
    return f"Hello, {name}!"
```

```yaml
engine: tree-sitter
scopes:
  - expr: (comment)+ @comment

  - name: docstring
    expr: |
      ((function_definition
        body: (block . (expression_statement (string) @docstring)))
      (#offset! @docstring 0 3 0 -3))
    type: md
```

Each capture in a query is one value. Its scope is `text.comment`, then the query's `name`, then `.line` or `.block` by whether the text spans lines, so the docstrings above answer to `scope: text.comment.docstring` and a plain `scope: comment` reaches both queries. Comment delimiters and per-line decoration are stripped before linting, and `#offset!` trims a capture by rows and columns from each end, which is how the docstring loses its quotes. A capture whose name starts with `_` is there for a predicate to test and is not linted, and one named `prose` is taken as bare content with nothing to strip.

A YAML file is otherwise read as data, whole or through a `dasel` View. Naming it in a `tree-sitter` View reads it as code instead, so a `(comment) @comment` query lints its comments and nothing else, which is how the comments in a Helm chart's `values.yaml` or a CI workflow are checked without the values.

## [Text](views.md#text)

A `textfsm` View applies to any file the section matches, and reads it through a template in the form [TextFSM](https://github.com/google/textfsm/wiki/TextFSM) defined: named values, then a state machine of regular expressions in the same [dialect](../guides/regex.md) every rule uses. Each scope's `expr` names a value, and what the template captured for it becomes the scope's text, placed at the line and column it came from.

```yaml
engine: textfsm
template: |
  Value Subject (.+)
  Value List Body (.*)
  Value List Trailer ((?:BREAKING CHANGE|[A-Z][\w-]+): .+)

  Start
    ^${Subject} -> Body

  Body
    ^# -> Next
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

The [Commits](../guides/commit-messages.md) package ships this View with the conventions and the hook; the [TextFSM guide](../guides/textfsm.md) walks through the template language.

A rule with `scope: subject` then runs on the first line of a commit message and nowhere else. Consecutive lines a `List` value captures at the same column are joined into one value, so a body reads as its paragraphs rather than one block per line. A value the template never fills is an empty scope at the top of the file, which is where an `occurrence` rule with `min` reports that it is missing. The [TextFSM guide](../guides/textfsm.md) walks through the template language, a transcript where only one side is linted, and how to see what a template captured.
