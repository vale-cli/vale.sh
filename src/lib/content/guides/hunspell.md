---
title: Hunspell
description: Learn how to create and use Hunspell-compatible dictionaries in Vale.
---

[Hunspell][1] is a spell-checking engine known for its flexibility and support for complex morphological rules. It powers spell-checking in popular applications like LibreOffice, Mozilla Firefox, and Google Chrome.

Vale uses Hunspell-compatible dictionaries to power its [own spell-checking][2] features. This guide will discuss the basics of creating and using these dictionaries.

## How does Hunspell work?

The best resource for learning about Hunspell are the official [man pages][3]. There's also a well-documented Python port of the library called [spylls][4].

## Where can I find Hunspell dictionaries?

- [`wooorm/dictionaries`][5]
- [`LibreOffice/dictionaries`][6]

[Firefox][7] and [OpenOffice][8] also provide Language Packs that include
Hunspell dictionaries.

[1]: https://hunspell.github.io
[2]: /docs/checks/spelling
[3]: https://github.com/hunspell/hunspell?tab=readme-ov-file#documentation
[4]: https://github.com/zverok/spylls
[5]: https://github.com/wooorm/dictionaries?tab=readme-ov-file
[6]: https://github.com/LibreOffice/dictionaries
[7]: https://addons.mozilla.org/en-US/firefox/language-tools
[8]: https://extensions.openoffice.org/en/search?f%5B0%5D=field_project_tags%3A157
