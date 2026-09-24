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

> The implementation of the aforementioned methodology necessitates considerable computational infrastructure, notwithstanding the organization's preexisting technological capabilities.

```bash
test.md:1:1:style.Readability:Try to keep the Flesch-Kincaid grade level (34.16) below 8.
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
|    `quote_words`     |          The number of words inside quotation marks (Vale v3.23.0 or later).           |
| `sentence_length_sd` | The standard deviation of words per sentence, in words: how much the sentences vary in length (Vale v3.23.0 or later). |
|        `words`       |                               The number of words.                               |

The readability scores are variables too, computed from the counts above (Vale v3.23.0 or later):

| Variable | Description |
| :------: | :---------: |
| `automated_readability` | The [Automated Readability Index](https://en.wikipedia.org/wiki/Automated_readability_index). |
| `coleman_liau` | The [Coleman–Liau index](https://en.wikipedia.org/wiki/Coleman%E2%80%93Liau_index). |
| `dale_chall` | The [Dale–Chall score](https://en.wikipedia.org/wiki/Dale%E2%80%93Chall_readability_formula). |
| `flesch_kincaid` | The [Flesch–Kincaid grade level](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests). |
| `flesch_reading_ease` | The [Flesch reading-ease score](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests). |
| `gunning_fog` | The [Gunning fog index](https://en.wikipedia.org/wiki/Gunning_fog_index). |
| `lix` | The [LIX](https://en.wikipedia.org/wiki/Lix_\(readability_test\)) measure. |
| `smog` | The [SMOG grade](https://en.wikipedia.org/wiki/SMOG). |

The example above is `flesch_kincaid`. With the score as a variable and `round`, a rule can report a grade the way an editor does:

```yaml
extends: metric
message: "Hard to read: grade %s. Split it, or trim it."
level: suggestion
scope: sentence
formula: round(automated_readability)
condition: ">= 10 && words >= 14"
```

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
|  `round(x)`    | `x` rounded to the nearest whole number |
| `round(x, n)`  | `x` rounded to `n` decimal places |

A `condition` is a comparison against the formula's result: `>`, `<`, `==`, `!=`, `>=`, or `<=` and a number. Both the formula and the condition are evaluated as [Tengo](https://tengolang.com/) expressions, so a formula may also use its `math` module.

## [message](metric.md#message)

The result of a `formula` will be compared to its `condition` and inserted into its `message` format specifier (`%s`).
