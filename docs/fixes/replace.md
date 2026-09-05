# replace

Learn how to write a rule's replacements into the rule.

```go
func replace(match string) []string
```

`replace` returns the replacements listed in the rule.

```yaml
extends: existence
message: "Use '%s' for '%s'."
action:
  name: replace
  params:
    - color
tokens:
  - colour
```

A parameter can name the token's capture groups, `$1`, `$2`, and the whole match as `$0`; see [the token's groups](edit.md#the-tokens-groups). Several parameters are several suggestions. The message joins them, `'color or hue'`, and an editor offers each as its own quick fix.

Rules that extend `substitution` or `capitalization` know their own replacement, so the parameters can be left out:

```yaml
extends: substitution
message: "Use '%s' instead of '%s'."
action:
  name: replace
swap:
  Javascript: JavaScript
```

A `substitution` entry whose value is written as alternatives, `color|hue`, yields one suggestion per alternative.

With [`matchcase`](../topics/styles.md#the-header) set on the rule, each replacement takes the case of the text it replaces, so a swap written as `a-ok` still suggests `A-OK` for `A OK`. The `capitalization` check ignores that setting: it decides the case, and changing its suggestion's case would undo the correction.
