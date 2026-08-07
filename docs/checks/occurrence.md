# occurrence

Learn about the occurrence extension point.

| Name    | Type     | Description                                                         |
| ------- | -------- | ------------------------------------------------------------------- |
| `max`   | `int`    | The maximum amount of times `token` may appear in a given scope.    |
| `min`   | `int`    | The minimum amount of times `token` has to appear in a given scope. |
| `token` | `string` | The token of interest.                                              |
| `ignorecase` | `bool` | Makes all matches case-insensitive.                            |

`occurrence` enforces the maximum or minimum number of times a particular token can appear in a given scope.

```yaml
extends: occurrence
message: 'More than 3 commas!'
level: error
# Here, we're counting the number of times a comma appears
# in a sentence.
#
# If it occurs more than 3 times, we'll flag it.
scope: sentence
max: 3
token: ','
```

In the example above, we’re limiting the number of commas per sentence.

## [message](occurrence.md#message)

The `message` key can contain an optional format specifier `%s` which will be populated with the number of occurrences:

```yaml
message: 'Titles should use fewer than 70 characters (found: %s).'
```
