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
Heads up!

Make sure your rule files end in extension `.yml`. Do not end them in `.yaml`, as Vale will not detect them.
{% endhint %}

The building blocks of styles are called _rules_ (YAML files ending in `.yml`), which utilize _checks_ to perform specific tasks.

The structure of a rule consists header followed by check-specific arguments. Every rule supports the following header fields:

| Name      | Required | Default      | Description                                                                                                                                                                              |
| --------- | -------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extends` | Yes      | `N/A`        | <p>The name of the check to extend in the particular rule. See <a href="../checks/existence.md">Rules</a> for more information.<br><code>&#x3C;br>extends: existence&#x3C;br></code></p> |
| `message` | Yes      | `N/A`        | <p>The message to display when the rule is triggered. Each extension point has different formatting options.<br><code>&#x3C;br>message: "Don't use '%s' headings."&#x3C;br></code></p>   |
| `level`   | No       | `suggestion` | <p>The severity of the rule. The available options are <code>suggestion</code>, <code>warning</code>, and <code>error</code>.<br><code>&#x3C;br>level: warning&#x3C;br></code></p>       |
| `scope`   | No       | `text`       | <p>The scope of the rule. See <a href="scopes.md">Scopes</a> for more information.<br><code>&#x3C;br>scope: heading&#x3C;br></code></p>                                                  |
| `link`    | No       | `N/A`        | <p>A URL to associate with the rule. This is useful for providing more information about the rule.<br><code>&#x3C;br>link: https://example.com&#x3C;br></code></p>                       |
| `limit`   | No       | `N/A`        | <p>The maximum number of times the rule can be triggered in a single file.<br><code>&#x3C;br>limit: 3&#x3C;br></code></p>                                                                |
| `vocab`   | No       | `true`       | <p>If set to false, any active vocabularies will be disabled for the rule.<br><code>&#x3C;br>vocab: false&#x3C;br></code></p>                                                            |

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
