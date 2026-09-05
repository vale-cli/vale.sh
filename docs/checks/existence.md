# existence

Learn about the existence extension point.

| Name         | Type    | Description                                                                                          |
| ------------ | ------- | ---------------------------------------------------------------------------------------------------- |
| `append`     | `bool`  | Adds `raw` to the end of `tokens`, assuming both are defined.                                        |
| `ignorecase` | `bool`  | Makes all matches case-insensitive.                                                                  |
| `nonword`    | `bool`  | Removes the default word boundaries (`\b`).                                                          |
| `action`     | `array` | Options for correcting matches, see the [actions](../topics/actions.md) section.                     |
| `raw`        | `array` | A list of tokens to be concatenated into a pattern.                                                  |
| `tokens`     | `array` | A list of tokens to be transformed into a non-capturing group.                                       |
| `exceptions` | `array` | An array of strings to be ignored.                                                                   |
| `vocab`      | `bool`  | If false, disables all active [vocabularies](../keys/vocabularies.md) for this rule (default: true). |

The most general extension point is existence. As its name implies, it looks for the “existence” of particular tokens.

```yaml
extends: existence
message: Consider removing '%s'
level: warning
ignorecase: true
tokens:
  - appears to be
  - arguably
```

These tokens can be anything from simple phrases (as in the above example) to regular expressions—e.g., [the number of spaces between sentences](https://github.com/vale-cli/vale/blob/master/testdata/styles/demo/Spacing.yml) or [the position of punctuation after quotes](https://github.com/vale-cli/Google/blob/master/Google/Quotes.yml).

### [tokens](existence.md#tokens)

{% hint style="info" %}
See [Vale Studio](https://studio.vale.sh/) for a live editor that can help you write and test your rules, including generating the compiled regular expression.
{% endhint %}

The most common entry point for this extension point is the `tokens` key, which is a list of strings or regular expressions to be transformed into a word-bounded, non-capturing group:

```yaml
tokens:
  - appears to be
  - arguably
```

Which, after compilation, becomes:

```regex
(?i)(?m)\b(?:appears to be|arguably)\b
```

This is a convenience feature to avoid having to write the same boilerplate for every token in a rule.

### [raw](existence.md#raw)

When you want more control over the regular expression, you can use the `raw` key instead:

```yaml
extends: existence
message: "Incorrect use of symbols in '%s'."
ignorecase: true
raw:
  - $[d]* ?(?:dollars|usd|us dollars)
```

This allows you to write more complex patterns without having to worry about any post-processing. Each entry in `raw` is concatenated with the previous entry, allowing for improved commenting and readability of complex patterns.

### [message](existence.md#message)

The `message` key is a string that will be used to generate the final message when a match is found. The (optional) `%s` placeholder will be replaced with the matched text. A rule with an [action](../topics/actions.md) may use a second `%s`, which is the fix.
