---
title: spelling
description: Learn about the spelling extension point.
---

<script>
    import Alert from '$lib/components/Alert.svelte';
</script>

| Name           | Type     | Description                                                                                        |
| :------------- | :------- | :------------------------------------------------------------------------------------------------- |
| `custom`       | `bool`   | Turn off the default filters for acronyms, abbreviations, and numbers.                             |
| `filters`      | `array`  | An array of patterns to ignore during spell checking.                                              |
| `ignore`       | `string` | A relative path \(from `StylesPath`\) to a file consisting of one word per line to ignore.         |
| `dicpath`      | `string` | The location to look for `.dic` and `.aff` files. Can be absolute or relative to the `StylesPath`. |
| `dictionaries` | `array`  | An array of dictionaries to load.                                                                  |
| `append`       | `bool`   | Adds the array of dictionaries after the default Vale dictionary, instead of replacing it.         |

`spelling` implements spell checking based on Hunspell-compatible dictionaries.

```yaml
# Uses the built-in dictionary and filters.
extends: spelling
message: "Did you really mean '%s'?"
level: error
```

By default, `spelling` includes a custom, open-source
[dictionary for American English][1].

## Dictionaries

You may instead use the `dictionaries` key to list multiple custom
dictionaries:

```yaml
extends: spelling
message: "'%s' is a typo!"
dictionaries:
  - en_US
  - en_medical
```

The `spelling` extension point will look for `en_US.{dic,aff}` and
`en_medical.{dic,aff}` files in `<StylesPath>/config/dictionaries`.

You can also use the `DICPATH` environment variable or the `dicpath` key.

## Filters

Vale comes with a set of built-in filters, as described in the table below:

| Filter                    | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `[A-Z]{1}[a-z]+[A-Z]+\w+` | Mixed-cased words (such as "MongoDB").              |
| `[^a-zA-Z_']`             | Words containing non-word tokens (such as numbers). |
| `[A-Z]+$`                 | Upper-cased words.                                  |

You can also choose define you own filters either with or without the built-in
ones enabled:

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
  - '[pP]y.*\\b'
```

## Ignore files

Ignore files are plain-text files that list words to be ignored during spell
check (one case-insensitive entry per line) . For example,

```regex
destructuring
transpiler
```

You can name these files anything you'd like and reference them relative to
the active `<StylesPath>/config/ignore` directory.

```yaml
extends: spelling
message: "Did you really mean '%s'?"
level: error
ignore:
  - ignore1.txt
  - ignore2.txt
```

See [Vocabularies][2] for information on rule-agnostic terminology lists.

[1]: https://github.com/errata-ai/en_US-web
[2]: /docs/keys/vocab
