# Hunspell

Learn how to create and use Hunspell-compatible dictionaries in Vale.

[Hunspell](https://hunspell.github.io/) is a spell-checking engine known for its flexibility and support for complex morphological rules. It powers spell-checking in popular applications like LibreOffice, Mozilla Firefox, and Google Chrome.

Vale uses Hunspell-compatible dictionaries to power its [own spell-checking](../checks/spelling.md) features. This guide will discuss the basics of creating and using these dictionaries.

You can find more thorough documentation at the [official repository](https://github.com/hunspell/hunspell?tab=readme-ov-file#documentation). There’s also a well-documented Python port of the library called [spylls](https://github.com/zverok/spylls).

## How does spell-checking in Vale work?

Vale doesn’t use Hunspell directly and doesn’t require it to be installed on your system.

Instead, Vale uses a pure-Go package to parse Hunspell-compatible dictionaries and check the spelling of words. This package supports a (growing) subset of Hunspell’s features.

A Hunspell-compatible dictionary consists of two files:

1. Affix (`.aff`) file: This file defines the morphological rules, including prefixes, suffixes, and other language-specific grammar rules that govern how words are formed.
2. Dictionary (`.dic`) file: This file contains the list of root words and their associated affix codes to specify valid transformations.

You can name these files whatever you like, so long as the `.aff` and `.dic` files are named consistently – for example, `en_US.aff` and `en_US.dic`.

Here’s a minimal example of a dictionary:

```
1
software/M
```

“1” is the number of words in the dictionary and `software/M` is the root word “software” with the affix code `M`. This means that we accept the word “software” and the variations derived from the affix code `M`.

Our affix file would look like this:

```
SET UTF-8

SFX M Y 1
SFX M   0     's         .
```

* `SFX M Y 1`: This line defines a suffix rule (`SFX`) for the affix code `M`. The `Y` indicates that the rule is [cross-productible](https://github.com/hunspell/hunspell/blob/874abbbe65e228df525023afe176b42df34a7a4f/man/hunspell.5#L527) and the `1` indicates that there is one rule.
* `SFX M 0 's .`: This line defines the rule itself. It says that if a word has the affix code `M`, we can add `'s` to the end of the word. The `0` indicates that no part of the base word is removed when applying this suffix. The `.` indicates that there are no conditions for applying this rule.

The end result is that the dictionary will accept both “software” and “software’s”. Other variations like “softwares” or “softwaring” will be rejected.

## Where can I find Hunspell dictionaries?

* [`wooorm/dictionaries`](https://github.com/wooorm/dictionaries?tab=readme-ov-file)
* [`LibreOffice/dictionaries`](https://github.com/LibreOffice/dictionaries)

[Firefox](https://addons.mozilla.org/en-US/firefox/language-tools) and [LibreOffice](https://extensions.libreoffice.org/en/extensions/?Tags%5B%5D=50) also provide Language Packs that include Hunspell dictionaries.
