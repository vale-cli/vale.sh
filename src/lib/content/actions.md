---
title: Actions
description: Create dynamic suggestions for your rules with Actions.
---

<script lang="ts">
    import Alert from '$lib/components/Alert.svelte';
</script>

<Alert>
See <a href="/docs/guides/lsp"><code>vale-ls</code></a> for an easy way to integrate Actions into your favorite text editor.
</Alert>

Actions provide a way for users to define dynamic fixes for their custom rules
that show up in the CLI and LSP-based integrations.

![Actions](/media/action.png)

In the Sublime Text example above, the "Quick Fix" menu is powered by the
action defined in the rule definition:

```yaml
action:
  name: replace
```

See the documentation on each `action` type for more information:

| Name           | Description                                                                                  |
| :------------- | :------------------------------------------------------------------------------------------- |
| [`suggest`][1] | An array of dynamically-computed suggestions.                                                |
| [`replace`][2] | An array of static suggestions. Supported by default in `substitution` and `capitalization`. |
| [`remove`][3]  | Remove the matched text.                                                                     |
| [`edit`][4]    | In-place edits of the matched text.                                                          |

## CLI

Most Vale rules are based on _static_ suggestions&mdash;for example,

```yaml
extends: substitution
message: "Use '%s' instead of '%s'."
level: error
action:
  name: replace
swap:
  Javascript: JavaScript
```

Here, the `action` is a to _replace_ `Javascript` with `JavaScript`. In such
cases, we know what we want to suggest to the user ahead of time and Vale can
easily generate the appropriate output message.

However, there are cases in which we _don't_ know the appropriate suggestion
ahead of time. For example, consider the following rule:

```yaml
extends: existence
message: "'%s' should be '%s'."
level: error
action:
  name: edit
  params:
    - regex
    - '(\\w+)_(\\w+)'
    - '$1-$2'
tokens:
  - '\\w+_\\w+'
```

This rule is designed to catch instances of `snake_case` and suggest that the
user convert to `kebab-case`. In this case, the exact suggestion is dependent
on a string transformation that needs to be computed at runtime.

Using the `edit` action allows us to define a rule that can dynamically
generate suggestions based on the matched text in CLI output:

![CLI](/media/snake.png)

As you can see, the CLI output is dynamically computing the suggestion based on
the matched text.

## LSP

In both static and dynamic cases, any application that uses the
[Vale Language Server][5] will be able to provide the user with a list of
"Quick Fixes" that can be applied to the document.

[1]: /docs/fixers/suggest
[2]: /docs/fixers/replace
[3]: /docs/fixers/remove
[4]: /docs/fixers/edit
[5]: /docs/guides/lsp
