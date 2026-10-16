# spelling

Learn about the spelling extension point.

| Name           | Type     | Description                                                                                        |
| -------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `custom`       | `bool`   | Turn off the default filters for acronyms, abbreviations, and numbers.                             |
| `filters`      | `array`  | An array of patterns to ignore during spell checking.                                              |
| `ignore`       | `array`  | Relative paths (from `<StylesPath>/config/ignore`) to files consisting of one word per line to ignore. |
| `exceptions`   | `array`  | An array of strings to be ignored.                                                                 |
| `dicpath`      | `string` | The location to look for `.dic` and `.aff` files. Can be absolute or relative to the `StylesPath`. |
| `dictionaries` | `array`  | An array of dictionaries to load.                                                                  |
| `append`       | `bool`   | Adds the array of dictionaries after the default Vale dictionary, instead of replacing it.         |
| `aff`, `dic`   | `string` | One dictionary as a pair of files, found on the `StylesPath`, used instead of `dictionaries`.       |
| `split`        | `bool`   | Check the parts of an identifier rather than skipping it or checking it whole.                     |

`spelling` implements spell checking based on Hunspell-compatible dictionaries.

```yaml
# Uses the built-in dictionary and filters.
extends: spelling
message: "Did you really mean '%s'?"
level: error
```

<!-- vale off -->

> Teh build runs on evrey push.

<!-- vale on -->

```bash
test.md:1:1:style.Spelling:Did you really mean 'Teh'?
test.md:1:19:style.Spelling:Did you really mean 'evrey'?
```

By default, `spelling` includes a custom, open-source [dictionary for American English](https://github.com/vale-cli/en_US-web).

## [Dictionaries](spelling.md#dictionaries)

You may instead use the `dictionaries` key to list multiple custom dictionaries:

```yaml
extends: spelling
message: "'%s' is a typo!"
dictionaries:
  - en_US
  - en_medical
```

The `spelling` extension point will look for `en_US.{dic,aff}` and `en_medical.{dic,aff}` files in `<StylesPath>/config/dictionaries`.

You can also use the `DICPATH` environment variable or the `dicpath` key.

## [Filters](spelling.md#filters)

Vale comes with a set of built-in filters, as described in the table below:

| Filter                    | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `[A-Z]{1}[a-z]+[A-Z]+\w+` | Mixed-cased words (such as “MongoDB”).              |
| `[^a-zA-Z_']`             | Words containing non-word tokens (such as numbers). |
| `[A-Z]+$`                 | Upper-cased words.                                  |

You can also choose define you own filters either with or without the built-in ones enabled:

```yaml
extends: spelling
message: "Did you really mean '%s'?"
level: error
# This disables the built-in filters. If you omit this
# key or set it to false, custom filters (see below) are
# added on top of the built-in ones.
custom: true
# A "filter" is a regular expression specifying words
# to ignore during spell checking.
filters:
  # Ignore all words starting with 'py'.
  #
  # e.g., 'PyYAML'.
  - '[pP]y.*\b'
```

## [Casing and code](spelling.md#casing-and-code)

{% hint style="info" %}
Requires Vale v3.25.0 or later.
{% endhint %}

Two kinds of misspelling get a more specific message, and a fix:

* A word the dictionary spells with capitals inside it is reported as a casing mistake, with the dictionary's spelling as its fix: `github` is reported as `Use 'GitHub' instead of 'github'.`, and `json` as `Use 'JSON' instead of 'json'.` This applies to a word of three or more letters with at most one capital. A name the dictionary only capitalizes, such as `Kubernetes`, is reported as a misspelling, because the check can't tell it from a word in another language; to enforce its case, add it to a [vocabulary](../keys/vocabularies.md).
* Without `split`, a `snake_case` word, or a `camelCase` one that starts with two or more lower-case letters, is reported as looking like code, with the format's inline code as its fix. `apiVersion` and `created_at` are; `vSphere` and `iPhone` aren't.

| Format | Fix |
| --- | --- |
| Markdown, MDX, MyST, Quarto, notebooks, AsciiDoc, Typst | `` `created_at` `` |
| reStructuredText | ` ``created_at`` ` |
| Org | `~created_at~` |
| HTML | `<code>created_at</code>` |

In other formats, such as plain text, the word is reported as a misspelling. Both apply to every `spelling` rule, and replace its `message` for these alerts.

## [Identifiers](spelling.md#identifiers)

{% hint style="info" %}
Requires Vale v3.22.0 or later.
{% endhint %}

An identifier is neither a word nor a typo. Without `split`, the built-in filters skip a `PascalCase` or hyphenated token and check a `camelCase` or `snake_case` one whole, so a typo inside `RecieveMessage` passes and a correct `receiveMessage` is reported as [code](#casing-and-code). With `split: true`, an identifier is taken apart at an underscore, a hyphen, a digit, and a change of case, and each part is checked and reported at its own position:

```yaml
extends: spelling
message: "Did you really mean '%s'?"
level: error
split: true
```

`getHTTPResponse_v2` is `get`, `HTTP`, `Response`, and `v`. A part in all capitals or under three letters is not checked, so `HTTP`, `Id`, and `v2` pass. A plain word is still reported whole, and a whole identifier that is in a dictionary or an ignore file passes without being split.

## [Ignore files](spelling.md#ignore-files)

Ignore files are plain-text files that list words to be ignored during spell check (one case-insensitive entry per line). For example:

```
destructuring
transpiler
```

You can name these files anything you’d like and reference them relative to the active `<StylesPath>/config/ignore` directory.

```yaml
extends: spelling
message: "Did you really mean '%s'?"
level: error
ignore:
  - ignore1.txt
  - ignore2.txt
```

A word from an ignore file is also a candidate when the rule [suggests](../fixes/suggest.md#spellings) a spelling, placed ahead of a dictionary word it ties with.

See [Vocabularies](../keys/vocabularies.md) for information on rule-agnostic terminology lists.
