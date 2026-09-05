# metric

Learn about the metric extension point.

{% hint style="info" %}
When writing conditions, be sure to use floating-point numbers. For example, use `"== 8.0"` instead of `"== 8"`.
{% endhint %}

| Name        | Type     | Description                                                    |
| ----------- | -------- | -------------------------------------------------------------- |
| `formula`   | `string` | A formula of pre-defined variables to be evaluated.            |
| `condition` | `string` | A binary condition upon which `formula` will trigger an alert. |

`metric` enforces arbitrary formulas based on pre-defined, built-in variables.

```yaml
extends: metric
message: 'Try to keep the Flesch-Kincaid grade level (%s) below 8.'
link: |
  https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests

formula: |
  (0.39 * (words / sentences)) + (11.8 * (syllables / words)) - 15.59

condition: '> 8.0'
```

## [Variables](metric.md#variables)

The table below summarizes all available variables:

|       Variable       |                                    Description                                   |
| :------------------: | :------------------------------------------------------------------------------: |
|     `blockquote`     |                         The number of `blockquote` tags.                         |
|     `characters`     |                             The number of characters.                            |
|    `complex_words`   | The number of polysyllabic words without common suffixes (`es`, `ed`, `ing`, …). |
|    `heading.h{n}`    |    The number of headings at the specified level (for example, `heading.h1`).    |
|        `list`        |                         The number of `ol` and `ul` tags.                        |
|     `long_words`     |                 The number of words with more than 6 characters.                 |
|     `paragraphs`     |      The number of body paragraphs (what the `paragraph` scope matches).         |
| `polysyllabic_words` |                  The number of words with more than 2 syllables.                 |
|         `pre`        |                             The number of `pre` tags.                            |
|      `sentences`     |                             The number of sentences.                             |
|      `syllables`     |                             The number of syllables.                             |
|        `words`       |                               The number of words.                               |

A `metric` rule measures the whole document unless it declares a [scope](../topics/scopes.md#checks-and-scopes). With one, it measures each block the scope names on its own—a paragraph, a heading, a list item, or a `doc(...)` selection—and the alert lands on that block’s first line:

```yaml
extends: metric
message: "This section runs %s words. The budget is 400."
level: warning
scope: 'doc(section:has(> h2))'
formula: words
condition: "> 400"
```

A selection counts the elements it holds, so `heading.h3` inside a section is the number of subheadings in that section. Scoping a `metric` rule requires Vale v3.21.0 or later; `text` means the whole document, as an unset scope does.

{% hint style="info" %}
As of Vale v3.18.0, `paragraphs` counts body paragraphs alone. `words`, `sentences`, and the other prose-derived variables still take in every kind of prose—including list items and blockquotes, which are counted by `list` and `blockquote`.
{% endhint %}

## [Operators](metric.md#operators)

In addition to using the variables listed above, a `formula` may also use the following operators:

|    Operator    |      Description      |
| :------------: | :-------------------: |
|       `+`      |        Addition       |
|       `-`      |      Subtraction      |
|       `*`      |     Multiplication    |
|       `/`      |        Division       |
| `math.sqrt(x)` |   Square root of `x`  |
|  `math.abs(x)` | Absolute value of `x` |

A `condition` is a comparison against the formula's result: `>`, `<`, `==`, `!=`, `>=`, or `<=` and a number. Both the formula and the condition are evaluated as [Tengo](https://tengolang.com/) expressions, so a formula may also use its `math` module.

## [message](metric.md#message)

The result of a `formula` will be compared to its `condition` and inserted into its `message` format specifier (`%s`).
