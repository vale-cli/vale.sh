# repetition

Learn about the repetition extension point.

| Name         | Type    | Description                                                               |
| ------------ | ------- | ------------------------------------------------------------------------- |
| `ignorecase` | `bool`  | Makes all matches case-insensitive.                                       |
| `alpha`      | `bool`  | Limits all matches to alphanumeric tokens.                                |
| `tokens`     | `array` | A list of tokens to be transformed into a non-capturing group.            |
| `exceptions` | `array` | An array of strings to be ignored.                                        |
| `vocab`      | `bool`  | If false, disables all active vocabularies for this rule (default: true). |

`repetition` looks for repeated occurrences of its tokens.

```yaml
extends: repetition
message: "'%s' is repeated!"
level: error
alpha: true
tokens:
  - '[^s.!?]+'
```

## [Vale.Repetition](repetition.md#valerepetition)

Vale includes a [built-in implementation](../topics/styles.md#vale) of `repetition` that can be used to flag repeated words such as “the the” or “and and”. This rule will catch almost any instance of a repeated word, including across markup boundaries:

```markdown
See the Mermaid [Mermaid user guide][1].
```

[occurrence](occurrence.md) [consistency](consistency.md)
