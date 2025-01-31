---
title: Blueprints
description: Customize the file-processing pipeline with Blueprints.
---

Blueprints are a series of instructions that transform a structured
file into a list of named [scopes][1]. This allows you to choose exactly
what sections of the file are linted, and even write rules that specifically
target certain parts.

Each Blueprint is defined in a YAML file and consists of a series of steps
that are executed in order. Each step includes the following fields:

- `name`: The name of the step. If no `type` is provided, the name is used as
  the only scope for the value. Otherwise, the `name` is used as the metascope and will be appended to the active scope -- such as `heading.<name>.md`.
- `expr`: An expression that selects the data to be linted. The expression is
  evaluated by the active [engine](#engines).
- `type`: The type of the data. Supported types are `md`, `adoc`, `html`,
  `rst`, or `org`.

Here's an example of a Blueprint that extracts the `title` and `description`
fields from an OpenAPI document:

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

Blueprints are stored in `<StylesPath>/config/blueprints` and can be
referenced in the `.vale.ini` file under any syntax-specific section:

```ini
[*.json]
BasedOnStyles = Vale

Blueprint = MyBlueprint
```

## Engines

Each step in a Blueprint contains a query that is processed by either
[Dasel][2] (JSON, YAML, and TOML) or [tree-sitter][3] (source code).

### Dasel

[Dasel][2] is a command-line tool that allows you to query and modify data
structures using selectors. It works with JSON, YAML, TOML, XML, and CSV.

Vale uses Dasel to query structured data in files and extract the relevant
content. For example, given the following JSON:

```json
{
	"title": "Vale",
	"version": "3.0.0",
	"features": [
		{
			"title": "Blueprints",
			"description": "Customize the file-processing pipeline with Blueprints."
		},
		{
			"title": "Styles",
			"description": "Define custom linting rules with Styles."
		}
	]
}
```

You could use the following Blueprint to extract the `name` and `description`
fields from each feature:

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

Check out the [playground][4] to experiment with Dasel queries.

### Tree-sitter

[Tree-sitter][3] is a parser generator tool and an incremental parsing library.
It can be used to build parsers for source code in any language.

Vale uses tree-sitter to parse source code and extract structured data. For
example, given the following Python code:

```python
# This a comment.
def hello(name: str) -> str:
    """
    This is a docstring.
    """
    return f"Hello, {name}!"
```

You could use the following Blueprint to extract all comments and function docstrings:

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

See [Pattern Matching with Queries][5] for more information.

[1]: /docs/scopes
[2]: https://github.com/TomWright/dasel
[3]: https://tree-sitter.github.io/tree-sitter/
[4]: https://dasel.tomwright.me/
[5]: https://tree-sitter.github.io/tree-sitter/using-parsers/queries/index.html
