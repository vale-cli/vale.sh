# suggest

Learn how to create dynamic suggestions for your rules.

```go
func suggest(match string) []string
```

`suggest` returns an array of suggested replacements for the matched text.

## [script](suggest.md#script)

```yaml
action:
  name: suggest
  params:
    - scriptName.tengo
```

The `suggest` action allows you to define a custom suggestion script that will be executed for each match. The script should return an array of strings called `suggestions`.

Scripts are written in [Tengo](https://github.com/d5/tengo) and are stored in the `<StylesPath>/config/actions` directory.

Here’s an example script:

```go
text := import("text")

// `match` is provided by Vale and represents the rule's matched text.
made := text.re_replace(`([A-Z]\w+)([A-Z]\w+)`, match, `$1-$2`)

made = text.replace(made, "-", "_", 1)
made = text.to_lower(made)

// `suggestions` is required by Vale and represents the script's output.
suggestions := [made]
```

We would save this script as `CamelToSnake.tengo` and then reference it in our rule:

```yaml
extends: existence
message: "'%s' should be in snake_case."
nonword: true
level: error
action:
  name: suggest
  params:
    - CamelToSnake.tengo
tokens:
  - '[A-Z]\w+[A-Z]\w+'
```

## [spellings](suggest.md#spellings)

```yaml
action:
  name: suggest
  params:
    - spellings
```

`spellings` returns the top 5 spelling suggestions for the matched text from all active dictionaries.

Suggestions are ordered by calculating the [Levenshtein distance](https://pkg.go.dev/github.com/adrg/strutil@v0.3.0/metrics#Levenshtein) between the matched text and the dictionary words.
