---
title: Markdown
description: Learn how Vale handles Markdown content.
---

[GitHub-Flavored Markdown][1] support is built in. The supported extensions are
`.md`, `.mdown`, `.markdown`, and `.markdn`.

By default, Vale ignores:

- Indented blocks: Blocks starting with four or more spaces.
- Fenced blocks: Blocks surrounded by three or more backticks.
- Code spans: Text surrounded by backticks.
- URLs: See [URL handling][2] for more information.

## Comments

Vale supports comment-based configuration in Markdown files:

- Turn Vale off entirely:

  ```markdown
  <!-- vale off -->

  This text will be ignored.

  <!-- vale on -->
  ```

- Turn off a specific rule:

  ```markdown
  <!-- vale Style.Redundancy = NO -->

  This is some text ACT test

  <!-- vale Style.Redundancy = YES -->
  ```

- Turn off specific match(es) within a rule:

  ```markdown
  <!-- vale Style.Redundancy["ACT test","OTHER"] = NO -->

  This is some text ACT test

  <!-- vale Style.Redundancy["ACT test","OTHER"] = YES -->
  ```

- Turn on or off specific styles:

  ```markdown
  <!-- vale StyleName1 = YES -->
  <!-- vale StyleName2 = NO -->
  ```

- Set styles (enabling them and switching off any other styles):

  ```markdown
  <!-- vale style = StyleName1 -->
  <!-- vale styles = StyleName1, StyleName2 -->
  ```

[1]: https://github.github.com/gfm
[2]: https://github.com/errata-ai/vale/issues/320
