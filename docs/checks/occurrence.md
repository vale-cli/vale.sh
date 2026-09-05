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

## [min](occurrence.md#min)

`min` makes absence a violation: a scope with fewer than `min` matches is flagged. The rule is evaluated once per scope, so a document that satisfies it in one paragraph and not the next is flagged at the paragraph that fell short.

```yaml
extends: occurrence
message: 'A paragraph here has no example (found %d).'
level: suggestion
scope: paragraph
min: 1
token: 'for example'
```

When a scope has zero matches there is no occurrence to point at, so the alert is anchored to the scope's first word — one alert per scope that fell short, at that scope's own position.

{% hint style="info" %}
Per-scope positions for `min` shortfalls require Vale v3.20.0 or later. Earlier versions report once per file, at `1:1`.
{% endhint %}

## [message](occurrence.md#message)

The `message` key can contain an optional format specifier, `%s` or `%d`, which is populated with the number of occurrences:

```yaml
message: 'Titles should use fewer than 70 characters (found: %s).'
```
