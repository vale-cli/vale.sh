# conditional

Learn about the conditional extension point.

| Name         | Type     | Description                                                               |
| ------------ | -------- | ------------------------------------------------------------------------- |
| `ignorecase` | `bool`   | Makes all matches case-insensitive.                                       |
| `first`      | `string` | The antecedent of the statement.                                          |
| `second`     | `string` | The consequent of the statement.                                          |
| `vocab`      | `bool`   | If false, disables all active vocabularies for this rule (default: true). |
| `exceptions` | `array`  | An array of strings to be ignored.                                        |
| `in`         | `string` | The [View](../topics/views.md) scope `second` is looked for in. Without it, `second` is looked for in the same scope as `first`. |

```yaml
extends: conditional
message: "'%s' has no definition"
level: error
scope: text
ignorecase: false
# Ensures that the existence of 'first'
# implies the existence of 'second'.
first: '\b([A-Z]{3,5})\b'
second: '(?:\b[A-Z][a-z]+ )+\(([A-Z]{3,5})\)'
# ... with the exception of these:
exceptions:
  - ABC
  - ADD
```

For example, consider the following text:

> According to Wikipedia, the World Health Organization (WHO) is a specialized agency of the United Nations that is concerned with international public health. We can now use WHO because it has been defined, but we can’t use DAFB because people may not know what it represents. We can use `DAFB` when it’s presented as code, though.

Using the above text with our example rule yields the following:

```bash
test.md:1:224:style.UnexpandedAcronyms:'DAFB' has no definition
```

A definition has to come before the use. A match of `second` covers each `first` that follows it in the file, including those in later paragraphs. A `first` that comes before the definition is flagged. Vale flags each undefined use, not only the first one.

## [Several definition forms](conditional.md#several-definition-forms)

Every capture group in `second` counts, so a pattern with an alternation accepts more than one way of defining a term. The rule below is satisfied by `WHO: World Health Organization` and by `World Health Organization (WHO)` alike:

```yaml
extends: conditional
message: "'%s' has no definition"
level: error
scope: text
first: '\b([A-Z]{3,5})\b'
second: '\b([A-Z]{3,5}): (?:[A-Z][a-z]+ ?)+|(?:\b[A-Z][a-z]+ )+\(([A-Z]{3,5})\)'
```

> WHO: World Health Organization. The Central Intelligence Agency (CIA) is next. But FBI is never defined, so FBI is flagged both times.

```bash
test.md:1:84:style.UnexpandedAcronyms:'FBI' has no definition
test.md:1:109:style.UnexpandedAcronyms:'FBI' has no definition
```

## [Exceptions and vocabulary](conditional.md#exceptions-and-vocabulary)

A `first` match listed in `exceptions` is never flagged. The project's [vocabulary](../keys/vocabularies.md) is added to that list. This means that a term in `accept.txt` doesn't need a definition either.

A multi-word entry covers the terms inside it. With `AWS CLI` accepted, `AWS` and `CLI` pass when they appear together and are flagged when they appear alone.

```yaml
extends: conditional
message: "'%s' has no definition"
level: error
scope: text
first: '\b([A-Z]{3,5})\b'
second: '(?:\b[A-Z][a-z]+ )+\(([A-Z]{3,5})\)'
exceptions:
  - ABC
  - ADD
```

> The API is fine. The AWS CLI is fine. AWS alone is not.

```bash
test.md:1:39:style.UnexpandedAcronyms:'AWS' has no definition
```

Set `vocab: false` to ignore the vocabulary and use only the rule's own `exceptions`.

## [Presence checks](conditional.md#presence-checks)

When `second` has a capture group, a `first` match is allowed only if its captured value was also captured by a `second` match (the acronym-definition pattern above). When `second` has *no* capture group, the rule is a plain presence check: any `first` match requires `second` to appear somewhere in the same scope.

```yaml
extends: conditional
message: "A 'Section' requires a 'Summary:' line."
level: error
scope: raw
first: '\bSection\b'
second: 'Summary:'
```

## [Lookarounds](conditional.md#lookarounds)

Regular expression lookarounds can be used to restrict the capture of the rule, allowing for more complex conditional statements. For example, the following rule will flag any MDX-style import that is not used:

```yaml
extends: conditional
message: "'%s' has been imported but not used."
level: error
scope: raw
first: '(?<=import )(\w+)(?= from)'
second: '(?<=<)(\w+)'
```

See the [regex guide](../guides/regex.md) for more information.

## [Across a View's scopes](conditional.md#across-a-views-scopes)

When a [View](../topics/views.md) defines the parts of a file, `in` looks for `second` in one part while `first` is matched in another. A commit whose subject is marked with `!` needs a `BREAKING CHANGE:` footer:

```yaml
extends: conditional
message: "A '!' in the subject needs a 'BREAKING CHANGE:' footer."
level: error
scope: subject
first: '^\w+(?:\([^)]*\))?!:'
second: '^BREAKING CHANGE: '
in: trailer
```

The alert is reported on the subject's `!`. The reverse, a footer that needs the `!`, is the same rule with `scope` and `in` swapped. An `in` that no View defines is an error when the rule loads.
