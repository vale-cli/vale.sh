---
title: reStructuredText
description: Learn how Vale handles reStructuredText content.
---

reStructuredText is supported through the external program
[`rst2html`][1]. To get started, you'll need to install the [`docutils`][2]
package:

```bash
$ pip install docutils
```

You'll need to ensure that the `rst2html` executable is available in your
`$PATH` (this should happen automatically).

The supported extensions are `.rst` and `.rest`.

By default, Vale ignores:

- [Literal blocks][3].
- [Inline literals][4].
- URLs: See [URL handling][5] for more information.

## Comments

Vale supports comment-based configuration in reStructuredText files:

- Turn Vale off entirely:

  ```rst
  .. vale off

  This text will be ignored.

  .. vale on
  ```

- Turn off a specific rule:

  ```rst
  .. vale Style.Redundancy = NO

  This is some text ACT test

  .. vale Style.Redundancy = YES
  ```

- Turn off specific match(es) within a rule:

  ```rst
  .. vale Style.Redundancy["ACT test","OTHER"] = NO

  This is some text ACT test

  .. vale Style.Redundancy["ACT test","OTHER"] = YES
  ```

- Turn on or off specific styles:

  ```rst
  .. vale StyleName1 = YES
  .. vale StyleName2 = NO
  ```

- Set styles (enabling them and switching off any other styles):

  ```rst
  .. vale style = StyleName1
  .. vale styles = StyleName1, StyleName2
  ```

[1]: http://docutils.sourceforge.net/docs/user/tools.html#rst2html-py
[2]: https://pypi.org/project/docutils/
[3]: https://docutils.sourceforge.io/docs/user/rst/quickref.html#literal-blocks
[4]: https://docutils.sourceforge.io/docs/user/rst/quickref.html#inline-markup
[5]: https://github.com/errata-ai/vale/issues/320
