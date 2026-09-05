# suggest

Learn how to compute a rule's suggestions.

```go
func suggest(match string) []string
```

`suggest` returns replacements that have to be worked out from the match: the closest words in a dictionary, or whatever a script of your own decides.

## [`spellings`](suggest.md#spellings)

```yaml
action:
  name: suggest
  params:
    - spellings
```

The five closest words to the match, by [Levenshtein distance](https://pkg.go.dev/github.com/adrg/strutil@v0.3.0/metrics#Levenshtein), from every dictionary the rule loads. A capitalized match gets capitalized suggestions.

Ranking a dictionary is real work, so these suggestions are not computed while linting. Lint output leaves the alert's `Suggestions` empty, and an editor asks for them per alert. On a rule that extends `spelling`, a bare `name: suggest` means the same thing.

## [A script](suggest.md#a-script)

```yaml
action:
  name: suggest
  params:
    - CamelToSnake.tengo
```

Any other parameter names a [Tengo](https://github.com/d5/tengo) script. Vale looks for it in `<StylesPath>/config/actions` first, then in the rule's own style directory, so a style can ship its scripts beside its rules. A script that is in neither place is a load-time error.

The script receives the matched text as `match` and must leave its answer in `suggestions`, an array of strings; anything in the array that is not a string is dropped. The `text`, `fmt`, and `math` modules are available to import.

```go
text := import("text")

// `match` is the rule's matched text.
made := text.re_replace(`([A-Z]\w+)([A-Z]\w+)`, match, `$1-$2`)

made = text.replace(made, "-", "_", 1)
made = text.to_lower(made)

// `suggestions` is what Vale reads back.
suggestions := [made]
```

Saved as `CamelToSnake.tengo`, the script serves this rule:

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

A script is compiled once per run and executed for each match.
