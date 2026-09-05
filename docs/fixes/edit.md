# edit

Learn how to transform a match into its fix.

```go
func edit(match string) string
```

`edit` produces one suggestion by running the matched text through one or more operations. Each operation is a name followed by its arguments, and the result of one is the input to the next. Whatever the last operation leaves is trimmed of surrounding whitespace before it is suggested.

One operation is a flat list:

```yaml
action:
  name: edit
  params:
    - trim_right
    - '!'
```

Several are a list of lists, one per step:

```yaml
action:
  name: edit
  params:
    - [trim_right, '!']
    - [lower]
    - [wrap, '`']
```

Because every operation takes a fixed number of arguments, the same pipeline written flat, `[trim_right, '!', lower, wrap, '`']`, means the same thing; that is the form the alert carries.

## [The token's groups](edit.md#the-tokens-groups)

An argument can name what the rule matched. `$0` is the whole match, and `$1`, `$2`, and so on are the capture groups of the token that matched, in that token's own numbering. An `existence` rule can therefore reorder or reuse its match without a `regex` step that matches it again:

```yaml
extends: existence
message: "Put the family name first: '%s' should be '%s'."
nonword: true
action:
  name: replace
  params:
    - '$2, $1'
tokens:
  - '\b([A-Z][a-z]+) ([A-Z][a-z]+) \(author\)'
```

The same groups reach every `edit` step, so `[prefix, '$2 ']` or `[replace, '$1', '$2']` read as the author thinks.

Every argument is expanded this way except a `regex` step's own, where `$1` keeps meaning that pattern's first group. Write `$$` for a literal dollar sign. A rule whose tokens have no groups sees `$1` as empty, and the alert carries the groups as `Groups` so an editor resolving the suggestion later gets the same answer.

## [Rewriting](edit.md#rewriting)

### [`replace`](edit.md#replace)

Replace every occurrence of a literal string within the match.

```yaml
extends: sequence
message: Did you mean "%[1]ss" instead of "%[1]s's"?
tokens:
  - tag: NN
  - pattern: "'s"
  - pattern: are
action:
  name: edit
  params:
    - replace
    - "'"
    - ''
```

### [`regex`](edit.md#regex)

Replace every match of a pattern within the text with a replacement, which may refer to the pattern's groups as `$1`, `$2`, or `${name}`.

```yaml
extends: existence
message: "'%s' should be '%s'."
level: error
action:
  name: edit
  params:
    - regex
    - '(\w+)_(\w+)' # pattern
    - '$1-$2'       # replacement
tokens:
  - '\w+_\w+'
```

The pattern runs on the same engine as the rule's own tokens, so a lookaround that found the match can also rewrite it.

### [`remove`](edit.md#remove)

Delete every occurrence of any of the given characters from the match.

```yaml
extends: existence
message: "Don't use end punctuation in headings."
scope: heading
nonword: true
action:
  name: edit
  params:
    - remove
    - '.?!'
tokens:
  - '\w+[.?!]$'
```

## [Trimming](edit.md#trimming)

### [`trim_right`](edit.md#trim_right)

Remove any of the given characters from the end of the match.

```yaml
extends: existence
message: "Don't use exclamation points in text."
nonword: true
action:
  name: edit
  params:
    - trim_right
    - '!'
tokens:
  - '\w+!(?:\s|$)'
```

### [`trim_left`](edit.md#trim_left)

Remove any of the given characters from the start of the match.

```yaml
extends: existence
message: "'%s' too many spaces."
level: warning
nonword: true
action:
  name: edit
  params:
    - trim_left
    - ' '
tokens:
  - '(?<=[a-z][.!?] ) [A-Z]'
```

### [`trim`](edit.md#trim)

Remove any of the given characters from both ends of the match.

```yaml
action:
  name: edit
  params:
    - trim
    - '*_'
```

### [`truncate`](edit.md#truncate)

Keep what comes before the first occurrence of a separator. The built-in `Vale.Repetition` rule uses it to reduce `the the` to `the`:

```yaml
action:
  name: edit
  params:
    - truncate
    - ' '
```

### [`split`](edit.md#split)

Split the match on a separator and keep one piece, counted from zero.

```yaml
extends: existence
message: "Use the product name alone: '%s'."
action:
  name: edit
  params:
    - split
    - ' by '
    - '0'
tokens:
  - 'Acme Cloud by Acme'
```

### [`squeeze`](edit.md#squeeze)

Collapse every run of whitespace into one space.

```yaml
extends: existence
message: "'%s' has too many spaces."
nonword: true
action:
  name: edit
  params:
    - squeeze
tokens:
  - '\w+ {2,}\w+'
```

## [Wrapping](edit.md#wrapping)

### [`wrap`](edit.md#wrap)

Put the given string on both sides of the match.

```yaml
extends: existence
message: "Format '%s' as code: %s."
action:
  name: edit
  params:
    - wrap
    - '`'
tokens:
  - '\b[a-z]+_[a-z_]+\b'
```

### [`unwrap`](edit.md#unwrap)

Remove the given string from both sides of the match, where it is present.

```yaml
action:
  name: edit
  params:
    - unwrap
    - '*'
```

### [`prefix`](edit.md#prefix) and [`suffix`](edit.md#suffix)

Put the given string before, or after, the match. Together they wrap in a pair that differs on each side:

```yaml
action:
  name: edit
  params:
    - [prefix, '“']
    - [suffix, '”']
```

## [Casing](edit.md#casing)

Each takes no arguments.

| Name           | `foo Bar` becomes |
| -------------- | ----------------- |
| `lower`        | `foo bar`         |
| `upper`        | `FOO BAR`         |
| `capitalize`   | `Foo Bar`         |
| `uncapitalize` | `foo Bar`         |
| `title`        | `Foo Bar`         |
| `sentence`     | `Foo bar`         |
| `simple`       | `foo bar`         |
| `kebab`        | `foo-bar`         |
| `snake`        | `foo_bar`         |
| `camel`        | `fooBar`          |
| `pascal`       | `FooBar`          |

`capitalize` and `uncapitalize` touch only the first letter, which is what a rule about how a list item or a sentence starts wants.

`title` follows AP style, and `sentence` keeps only the first word capitalized; neither knows the rule's own vocabulary. For a fix that respects a `capitalization` rule's exceptions, use that rule's own `replace` action.

```yaml
extends: existence
message: "Headings are sentence case: '%s' should be '%s'."
scope: heading
action:
  name: edit
  params:
    - [trim_right, '.']
    - [sentence]
tokens:
  - '(?:[A-Z][a-z]+ ){2,}[A-Z][a-z]+\.?'
```

## [Typography](edit.md#typography)

Each takes no arguments.

| Name    | Result                                                                                                                                                                |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `smart` | Typewriter punctuation to its typographic form: `---` and `--` to em and en dashes, `...` to an ellipsis, and straight quotes to curly ones.                              |
| `dumb`  | The reverse, back to ASCII punctuation.                                                                                                                               |
| `ascii` | `dumb`, then accents stripped and letters with no plain form spelled out: `naïve` to `naive`, `Straße` to `Strasse`.                                                    |

A quote opens after whitespace, a bracket, or a dash, and closes anywhere else, so an apostrophe inside a word comes out as `’`.

```yaml
extends: existence
message: "Use curly quotes: '%s' should be '%s'."
nonword: true
action:
  name: edit
  params:
    - smart
tokens:
  - '"[^"]+"'
```

## [Numbers](edit.md#numbers)

Each takes no arguments.

| Name     | Result                                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------- |
| `words`  | An integer or ordinal spelled out: `21` to `twenty-one`, `1,205` to `one thousand two hundred five`, `3rd` to `third`. |
| `digits` | The reverse: `twenty-one` to `21`, `one hundred and five` to `105`, `third` to `3rd`.                              |

Text that is not a number passes through unchanged, so a token that is broader than the number itself is fine.

```yaml
extends: existence
message: "Spell out numbers under ten: '%s' should be '%s'."
nonword: true
action:
  name: edit
  params:
    - words
tokens:
  - '\b[1-9]\b'
```
