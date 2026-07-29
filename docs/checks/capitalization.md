# capitalization

Learn about the capitalization extension point.

| Name         | Type     | Description                                                                                                          |
| ------------ | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `match`      | `string` | `$title`, `$sentence`, `$lower`, `$upper`, or a pattern.                                                             |
| `style`      | `string` | AP or Chicago; only applies when match is set to `$title` (default: AP).                                             |
| `exceptions` | `array`  | An array of strings to be ignored.                                                                                   |
| `indicators` | `array`  | An array of suffixes that indicate the next token should be ignored.                                                 |
| `threshold`  | `float`  | The minimum proportion of words that must be (un)capitalized for a sentence to be considered correct (default: 0.8). |
| `prefix`     | `string` | A constant prefix to ignore during case conversion.                                                                  |
| `vocab`      | `bool`   | If false, disables all active vocabularies for this rule (default: true).                                            |

`capitalization` checks that the text in the specified scope matches the case of `match`.

```yaml
extends: capitalization
message: "'%s' should be in title case"
level: warning
scope: heading
# $title, $sentence, $lower, $upper, or a pattern.
match: $title
# AP or Chicago; only applies when match is set to
# $title.
style: AP
exceptions:
  - ABC
  - add
```

## [styles](capitalization.md#styles)

The `capitalization` extension point supports two styles: “AP” and “Chicago.”

The “AP” style enforces the rules of the Associated Press Stylebook:

* Capitalize the first word and the last word of the title.
* Capitalize “to” in infinitives.
* Do not capitalize articles, conjunctions, and prepositions of three letters or fewer.

The “Chicago” style enforces the rules of The Chicago Manual of Style:

* Capitalize the first word and the last word of the title.
* Do not capitalize articles (a, an, the), coordinating conjunctions (and, but, or, for, nor), and prepositions, regardless of length.

## [prefix](capitalization.md#prefix)

The `prefix` option allows you to specify a constant prefix to ignore during case conversion. For example,

```yaml
extends: capitalization
message: "'%s' should be sentence-cased."
scope: heading
match: $sentence
# sentence-cased, but allows for a common prefix:
#
# E.g.,
#
# a. This is my heading
prefix: '^[a-z]\.\s'
```

In this example, `^[a-z]\.\s` is used to ignore the common prefix.

## [message](capitalization.md#message)

`capitalization` can have one or two `%s` format specifiers in its message. This allows us to do either of the following:

```yaml
message: "Found: '%s'; expected: '%s'."
# or
message: "'%s' should use title-style capitalization."
```
