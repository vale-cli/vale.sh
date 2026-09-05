# Styles

Learn what a rule is, how rules are collected into styles, and how a configuration switches them on.

## [A rule](styles.md#a-rule)

A rule is four decisions. Which _check_ runs, which says what kind of thing is wrong: a pattern that must not appear, a word that must be spelled one way, a count that must not be exceeded. Which _scope_ it runs on, which says where to look: every sentence, only the headings, one section of the document. What the _message_ says when it fires. And, when there is one right answer, what the _action_ is that fixes it.

```yaml
extends: existence
message: "Don't use end punctuation in headings."
scope: heading
nonword: true
tokens:
  - '[a-z][.?!]$'
```

That is a complete rule. It runs the `existence` check on every heading and reports the span that matched. The same rule, fully dressed, from the Microsoft style:

```yaml
extends: existence
message: "Don't use end punctuation in headings."
link: https://learn.microsoft.com/en-us/style-guide/punctuation/periods
nonword: true
level: warning
scope: heading
action:
  name: edit
  params:
    - trim_right
    - '.?!'
tokens:
  - '[a-z][.?!]$'
```

The `link` is the guidance the rule enforces, shown with every alert. The `level` is how loudly to say it. The `action` is the fix, which an editor or an agent applies without deciding anything. `nonword` is an argument to the check itself: the pattern ends in punctuation, so the check is told not to wrap it in word boundaries.

### [The header](styles.md#the-header)

Every rule opens with the same fields, followed by the arguments its check takes:

| Name          | Required | Default      | Description                                                                                                                                                                       |
| ------------- | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extends`     | Yes      |              | <p>The check the rule runs, or another rule to build on.<br><code>extends: existence</code></p>                                                                                   |
| `message`     | Yes      |              | <p>What to say when the rule fires. Each check offers its own placeholders.<br><code>message: "Don't use '%s' in headings."</code></p>                                             |
| `level`       | No       | `warning`    | <p><code>suggestion</code>, <code>warning</code>, or <code>error</code>. Only errors set a non-zero exit code.<br><code>level: error</code></p>                                     |
| `scope`       | No       | `text`       | <p>Where to look. See <a href="scopes.md">Scopes</a>. <code>metric</code> and <code>readability</code> default to the whole document instead.<br><code>scope: heading</code></p> |
| `link`        | No       |              | <p>The guidance the rule enforces, shown with the alert.<br><code>link: https://example.com</code></p>                                                                             |
| `description` | No       |              | <p>A longer explanation, for outputs and editors that show one.<br><code>description: "Headings are labels, not sentences."</code></p>                                             |
| `action`      | No       |              | <p>The fix. See <a href="actions.md">Actions</a>.<br><code>action: { name: replace }</code></p>                                                                                    |
| `limit`       | No       |              | <p>The most times the rule may fire in one file.<br><code>limit: 3</code></p>                                                                                                      |
| `matchcase`   | No       | `false`      | <p>Adapt a suggested replacement to the case of the text it replaces.<br><code>matchcase: true</code></p>                                                                          |

### [The checks](styles.md#the-checks)

Each rule _extends_ a check, which is what does the work. Every check runs on any scope.

| Name                                          | Description                                                                         |
| --------------------------------------------- | ----------------------------------------------------------------------------------- |
| [existence](../checks/existence.md)           | Report a pattern that is present.                                                   |
| [substitution](../checks/substitution.md)     | Report a pattern and carry its replacement.                                         |
| [occurrence](../checks/occurrence.md)         | Count a pattern, and report too few or too many.                                    |
| [repetition](../checks/repetition.md)         | Report a pattern that repeats.                                                      |
| [consistency](../checks/consistency.md)       | Report a file that uses two forms of one thing.                                     |
| [conditional](../checks/conditional.md)       | Report a pattern that appears without another it depends on.                        |
| [capitalization](../checks/capitalization.md) | Report text that is not cased the way the rule says.                                |
| [metric](../checks/metric.md)                 | Evaluate a formula over the counts of a block, and report when the condition holds. |
| [readability](../checks/readability.md)       | Score a block's prose, and report when the grade is too high.                       |
| [spelling](../checks/spelling.md)             | Spell check against Hunspell-compatible dictionaries.                               |
| [sequence](../checks/sequence.md)             | Report a sequence of tokens, with part-of-speech tags, in a sentence.               |
| [script](../checks/script.md)                 | Run a Tengo program over a block, and report what it returns.                       |

## [A style](styles.md#a-style)

A rule is one file, and a style is a directory of them, kept under the [`StylesPath`](../keys/stylespath.md):

```
styles/
├── House/
│   ├── Hedging.yml
│   ├── Terms.yml
│   └── dates/
│       └── TimeFormat.yml
└── Microsoft/
    ├── HeadingPunctuation.yml
    ...
```

The directory is the style's name, and the file is the rule's, joined with a dot: `Microsoft.HeadingPunctuation` is how the rule is addressed in configuration, in an in-text comment, in a filter, and in Vale's output. A subdirectory joins the name too, so `House/dates/TimeFormat.yml` is `House.dates.TimeFormat`.

Three things about the files themselves:

* A rule file ends in `.yml`. Vale reads no other extension as a rule.
* A directory whose name starts with `.` or `_` is skipped at load time, so drafts and shared fragments can sit inside a style without loading.
* A file ending in `.test.yml` is a set of test cases for the rule beside it, not a rule. See [Testing a style](styles.md#testing-a-style).

Packages installed with [`vale sync`](../keys/packages.md) land on the same path, so a style you wrote and a style you downloaded are the same kind of thing. The `config/` directory beside them holds what is not a style: vocabularies, dictionaries, views, filters, and templates.

## [Switching rules on](styles.md#switching-rules-on)

A style is enabled by name in [`BasedOnStyles`](../keys/basedonstyles.md), and every rule in it runs at the level the rule declares. The configuration can then adjust one rule, or a whole style, without touching the files:

```ini
[*.md]
BasedOnStyles = Vale, Microsoft

# Switch a rule off, or on, or change how loudly it reports.
Microsoft.Contractions = NO
Microsoft.HeadingPunctuation = error

# Set a level for every rule in a style, and keep exceptions beside it.
proselint = suggestion
proselint.Typography = warning

# Adjust a rule's parameter with the bracket key.
Std.SentenceLength[max] = 30
```

A rule named on its own, `House.Hedging = YES`, loads even when its style is not in `BasedOnStyles`: every segment after the style is a path, and Vale reads that one file.

The bracket key takes scalars: a number, a boolean, a level. It refuses the keys that make a rule what it is, `message`, `link`, `tokens`, `swap`, `exceptions`, and the rest, because changing those is authoring. For that, extend the rule.

## [Extending another rule](styles.md#extending-another-rule)

{% hint style="info" %}
Rule inheritance requires Vale v3.20.0 or later.
{% endhint %}

An `extends` value containing a dot names a rule rather than a check. The new rule starts from that rule's full definition and lays its own keys on top, so two styles can share one carefully built pattern and disagree only about message, level, or a handful of entries:

```yaml
# House/Hedging.yml
extends: Direct.Hedging
message: "Hedge: '%s'. We state things plainly here."
level: error
```

The parent has to be present on the `StylesPath`, not enabled: inheritance is a file reference, and `vale sync` is what puts the file there. The built-in `Vale` rules have no file, so they cannot be extended.

A bare key replaces the parent's value wholesale. Lists and maps also take overlay edits:

* `key+` appends to the parent's list, or merges into a parent map with the child's entries winning.
* `key-` removes entries from a parent list by their source text, or the named keys from a parent map. Removing something the parent does not have is an error, so an upstream rename is heard about rather than silently diverged from.

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

Writing both `key` and `key+` (or `key-`) in one file is an error: that says "replace" and "edit the replacement" at once. A chain may run ten rules deep before Vale assumes it is a cycle.

A directory whose name starts with `_` or `.` is skipped at load time but stays visible to `extends`, so a pattern shared by several rules can live in one file without itself becoming a rule:

```
styles/GenZ/
├── _shared/
│   └── Slang.yml   # never loads; Density, Budget, and Presence extend it
├── Budget.yml
├── Density.yml
└── Presence.yml
```

A fragment is validated as the chain's root, so it must carry a `message`, even one no alert will ever show.

## [Testing a style](styles.md#testing-a-style)

A rule is a small program, and a style of any size needs a way to ask whether each rule still fires where it should. Cases are YAML, they live beside the rule they test, and `vale test` runs them:

```yaml
# House/Hedging.test.yml
- name: flags a hedge
  input: It's worth noting that the cache is cold.
  contains: House.Hedging

- name: leaves a quoted hedge alone
  input: The phrase "it's worth noting" is banned.
  want: ""

- name: linted as reStructuredText
  format: rst
  input: |
    It's worth noting that the cache is cold.
  contains: House.Hedging
```

Each case lints `input`, as Markdown unless `format` says otherwise, and asserts on the output: `want` is the exact output, an empty `want` is "no alerts at all," `contains` is an excerpt, and `absent` is a list of what must not appear. A case runs under the configuration a `vale` run in that directory would use; `rule: Hedging.yml` isolates it to one rule instead, so the case says what the rule does and nothing about what a run would surface.

## [Patterns](styles.md#patterns)

Most rules are patterns. Vale runs them on a [regexp2](https://github.com/jdkato/regexp2) engine in RE2 mode: Go's [regexp/syntax](https://pkg.go.dev/regexp/syntax), plus positive and negative lookahead (`(?=re)`, `(?!re)`) and positive and negative lookbehind (`(?<=re)`, `(?<!re)`). See the [Regex](../guides/regex.md) guide for how the checks wrap a pattern before running it.

## [The built-in style](styles.md#the-built-in-style)

One style, `Vale`, is generated at runtime rather than read from disk. Its four rules report as errors:

| Name              | Description                                                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `Vale.Spelling`   | Spell check, with any Hunspell-compatible dictionaries in `<StylesPath>/config/dictionaries` and any suggestion the dictionary can make. |
| `Vale.Terms`      | Enforce the casing of the project's accepted [Vocabulary](../keys/vocabularies.md) terms.                                                |
| `Vale.Avoid`      | Report the project's rejected [Vocabulary](../keys/vocabularies.md) terms.                                                               |
| `Vale.Repetition` | Report a repeated word, "the the", and carry the fix.                                                                                    |

They switch on with `BasedOnStyles = Vale`, and each can be adjusted from the configuration like any other rule.
