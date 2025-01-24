---
title: Filters
description: Learn about Vale's rule filtering system.
---

<script lang="ts">
  import CLIOptions from "$lib/components/docs/CLIOptions.svelte";
  import Env from "$lib/components/docs/Env.svelte";
  import Errors from "$lib/components/docs/Errors.svelte";
</script>

The `--filter` CLI option allows you to report an arbitrary subset of your
`.vale.ini` configuration.

![Filters](/media/filter.png)

A filter is an [expression][1] targeting one of the following keys defined in
the rule definition: `.Name`, `.Level`, `.Scope`, `.Message`, `.Description`,
`.Extends`, or `.Link`.

## Saving filters

You can save a filter for reuse by storing it in `<StylesPath>/config/filters`.
Then, you can reference it by name when using the `--filter` option:

```bash
$ vale --filter=headings.expr docs/
```

Where `headings.expr` is a file containing the filter expression, such as:

```coffeescript
"heading" in .Scope
```

## Examples

- Filter by `.Level` and `.Name`:

  ```coffeescript
  .Level in ["error", "suggestion"] and .Name != "demo.Cap"
  ```

- Filter by `.Extends`:

  ```coffeescript
  .Extends=="existence"
  ```

- Only run a specific rule:

  ```coffeescript
  .Name=="demo.Cap"
  ```

See the [documentation][2] for a list of all supported operators.

[1]: https://expr-lang.org/docs/language-definition
[2]: https://expr-lang.org/docs/language-definition#operators
