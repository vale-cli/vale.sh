---
title: Blueprints
description: Customize the file-processing pipeline with Blueprints.
---

Blueprints are a series of instructions that transform a structured
file into a list of named [scopes][1]. This allow you to choose exactly
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

[1]: /docs/scopes
[2]: https://github.com/TomWright/dasel
[3]: https://tree-sitter.github.io/tree-sitter/
