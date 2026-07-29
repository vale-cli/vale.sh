# readability

Learn about the readability extension point.

| Name      | Type    | Description                                                                            |
| --------- | ------- | -------------------------------------------------------------------------------------- |
| `metrics` | `array` | One or more of `Gunning Fog`, `Coleman-Liau`, `Flesch-Kincaid`, `SMOG`, and `Automated Readability`. |
| `grade`   | `float` | The highest acceptable grade level.                                                    |

`readability` calculates the reading grade level of a document and flags it when the score is too high.

```yaml
extends: readability
message: "Grade level (%s) too high!"
level: warning
# Flag any document that reads above a US grade 7 level.
grade: 7
metrics:
  - Flesch-Kincaid
```

Given a document written in dense, abstract prose, the rule above reports:

```
 a.md
 1:1  warning  Grade level (33.70) too high!  demo.Reading
```

## [metrics](readability.md#metrics)

Each metric estimates the years of education a reader needs to understand the text on a first reading, expressed as a US grade level. They disagree with one another—they weigh sentence length, syllable count, and word length differently—so the number you get depends on which you choose.

When you list more than one, Vale averages them:

```yaml
extends: readability
message: "Grade level (%s) too high!"
level: warning
grade: 8
# The score is the average of the three, not the highest of them.
metrics:
  - Flesch-Kincaid
  - Gunning Fog
  - Coleman-Liau
```

Averaging several metrics is usually steadier than trusting one, since each has text it handles badly—`SMOG`, for example, is calibrated for health writing.

## [message](readability.md#message)

The `message` key can contain an optional format specifier `%s`, which is populated with the calculated grade level to two decimal places:

```yaml
message: "Grade level (%s) too high!"
```

## [Scope](readability.md#scope)

`readability` is the one extension point that doesn't accept a [scope](../topics/scopes.md).

A grade level is calculated from whole sentences, so scoring anything smaller than a paragraph—a heading, a list item, a table cell—wouldn't mean anything. Vale always applies the rule to the document's prose as a whole, and reports the result at line 1.

[metric](metric.md) [spelling](spelling.md)
