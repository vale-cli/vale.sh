# Styles

Learn about the primary component of Vale's configuration system.

Vale has a powerful extension system that doesn’t require knowledge of any programming language. Instead, it uses collections of individual [YAML](http://yaml.org/) files (or “rules”) to enforce particular writing constructs.

```yaml
# An example rule from the "Microsoft" style.
extends: existence
message: "Don't use end punctuation in headings."
link: https://docs.microsoft.com/en-us/style-guide/punctuation/periods
nonword: true
level: warning
scope: heading
action:
  name: edit
  params:
    - remove
    - '.?!'
tokens:
  - '[a-z0-9][.?!](?:\s|$)'
```

These collections are referred to as _styles_ and are organized in a nested folder structure at a user-specified location. For example,

```
$ tree styles
styles/
├── base/
│   ├── ComplexWords.yml
│   ├── SentenceLength.yml
│   ...
├── blog/
│   ├── TechTerms.yml
│   ...
└── docs/
    ├── Branding.yml
```

where _base_, _blog_, and _docs_ are your styles that each contain certain rules.

## [Rules](styles.md#rules)

{% hint style="warning" %}
Make sure your rule files end in extension `.yml`. Do not end them in `.yaml`, as Vale will not detect them.
{% endhint %}

The building blocks of styles are called _rules_ (YAML files ending in `.yml`), which utilize _checks_ to perform specific tasks.

The structure of a rule consists header followed by check-specific arguments. Every rule supports the following header fields:

| Name      | Required | Default      | Description                                                                                                                                                                              |
| --------- | -------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extends` | Yes      | `N/A`        | <p>The name of the check to extend in the particular rule. See <a href="../checks/existence.md">Rules</a> for more information.<br><code>extends: existence</code></p> |
| `message` | Yes      | `N/A`        | <p>The message to display when the rule is triggered. Each extension point has different formatting options.<br><code>message: "Don't use '%s' headings."</code></p>   |
| `level`   | No       | `suggestion` | <p>The severity of the rule. The available options are <code>suggestion</code>, <code>warning</code>, and <code>error</code>.<br><code>level: warning</code></p>       |
| `scope`   | No       | `text`       | <p>The scope of the rule. See <a href="scopes.md">Scopes</a> for more information.<br><code>scope: heading</code></p>                                                  |
| `link`    | No       | `N/A`        | <p>A URL to associate with the rule. This is useful for providing more information about the rule.<br><code>link: https://example.com</code></p>                       |
| `limit`   | No       | `N/A`        | <p>The maximum number of times the rule can be triggered in a single file.<br><code>limit: 3</code></p>                                                                |
| `vocab`   | No       | `true`       | <p>If set to false, any active vocabularies will be disabled for the rule.<br><code>vocab: false</code></p>                                                            |

## [Checks](styles.md#checks)

Each rule _extends_ a specific check, which is a built-in function that performs a particular task. For example, the `existence` check ensures that a given pattern is present in the content.

| Name                                          | Description                                                                               |
| --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [existence](../checks/existence.md)           | Check for the presence of a specific regex pattern.                                       |
| [substitution](../checks/substitution.md)     | Replace a regex pattern with a specific string.                                           |
| [occurrence](../checks/occurrence.md)         | Ensure the presence of a regex pattern a specific number of times.                        |
| [repetition](../checks/repetition.md)         | Avoid repeating a regex pattern a specific number of times.                               |
| [consistency](../checks/consistency.md)       | Ensure that a regex pattern is used consistently.                                         |
| [conditional](../checks/conditional.md)       | Check for the presence of a regex pattern based on a condition.                           |
| [capitalization](../checks/capitalization.md) | Ensure that a regex pattern is capitalized in a specific way.                             |
| [metric](../checks/metric.md)                 | Check the readability (or other metrics) of your content using custom formulas.          |
| [spelling](../checks/spelling.md)             | Spell check using Hunspell-compatible dictionaries.                                       |
| [sequence](../checks/sequence.md)             | Ensure that a regex pattern is used in a specific order. Supports part-of-speech tagging. |
| [script](../checks/script.md)                 | Run a custom Tengo script to check your content.                                          |

## [Extending another rule](styles.md#extending-another-rule)

{% hint style="info" %}
Rule inheritance requires Vale v3.20.0 or later.
{% endhint %}

An `extends` value containing a dot names a rule rather than a check: the new rule starts from that rule's full definition and lays its own keys on top. Two styles can share one carefully built pattern and disagree only about message, level, or a handful of entries:

```yaml
# House/Hedging.yml
extends: Direct.Hedging
message: "Hedge: '%s'. We state things plainly here."
level: error
```

The parent has to be present on the `StylesPath`, not enabled — inheritance is a file reference, and `vale sync` is what puts the file there.

A bare key replaces the parent's value wholesale. Lists and maps also take overlay edits:

* `key+` appends to the parent's list, or merges into a parent map with the child's entries winning.
* `key-` removes entries from a parent list by their source text, or the named keys from a parent map. Removing something the parent doesn't have is a compile error, so an upstream rename is heard about rather than silently diverged from.

```yaml
# Stricter than the parent: two more phrases, one dropped.
extends: Direct.Hedging
message: "Hedge: '%s'."
tokens+:
  - 'arguably'
  - 'to some extent'
tokens-:
  - 'perhaps'
```

Writing both `key` and `key+` (or `key-`) in one file is an error: that says "replace" and "edit the replacement" at once.

A directory whose name starts with `_` or `.` is skipped at load time but stays visible to `extends`, so a pattern shared by several rules can live in one file without itself becoming a rule:

```
styles/GenZ/
├── _shared/
│   └── Slang.yml   # never loads; Density, Budget, and Presence extend it
├── Budget.yml
├── Density.yml
└── Presence.yml
```

A fragment is validated as the chain's root, so it must carry a `message` — even one no alert will ever show.

## [Nested directories](styles.md#nested-directories)

{% hint style="info" %}
Nested rule directories require Vale v3.20.0 or later.
{% endhint %}

A style can organize its rules in subdirectories, and the path joins the rule's name: `Std/dates/TimeFormat.yml` is addressed as `Std.dates.TimeFormat` everywhere a rule name goes — configuration, in-text comments, filters, and output.

```
styles/Std/
├── dates/
│   ├── DateFormat.yml
│   └── TimeFormat.yml
└── SentenceLength.yml
```

As above, directories prefixed with `.` or `_` are inert, so drafts and shared fragments can sit inside a style without loading.

## [Regex](styles.md#regex)

Many rules will require the use of regular expressions to match specific patterns in your content. Vale uses [a superset](https://github.com/dlclark/regexp2?tab=readme-ov-file#compare-regexp-and-regexp2) of Go’s [regexp/syntax](https://pkg.go.dev/regexp/syntax) package to provide a powerful and flexible regex engine.

In addition to the standard Go regex syntax, Vale also supports positive lookahead (`(?=re)`), negative lookahead (`(?!re)`), positive lookbehind (`(?<=re)`), and negative lookbehind (`(?<!re)`).

See the [Regex](../guides/regex.md) guide for more information.

## [Vale](styles.md#vale)

Vale comes with a single built-in style named `Vale` that implements a few rules, as described in the table below.

| Name              | Description                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `Vale.Spelling`   | Checks for spelling errors in your content. Consumes any Hunspell-compatible dictionaries stored in `<StylesPath>/config/dictionaries`. |
| `Vale.Terms`      | Enforces the current project's accepted [Vocabulary](../keys/vocabularies.md) terms.                                                    |
| `Vale.Avoid`      | Enforces the current project's rejected [Vocabulary](../keys/vocabularies.md) terms.                                                    |
| `Vale.Repetition` | Flags repeated words such as "the the" or "and and".                                                                                    |
