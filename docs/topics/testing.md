# Testing

Learn how to check that your rules still fire where you think they do.

{% hint style="info" %}
Requires Vale v3.24.0 or later.
{% endhint %}

A rule is a small program, and a rule that matches nothing fails silently: it loads, runs, and reports success. `vale test` runs cases you keep beside your rules, each a short document and the alerts linting it must produce.

```console
$ vale test
 SUCCESS  2 files — 4 passed, 0 failed
```

## [Writing cases](testing.md#writing-cases)

Cases live in one of two places. A rule can carry its own under `tests`:

```yaml
# styles/House/Hedging.yml
extends: existence
message: "Consider removing '%s'."
level: warning
ignorecase: true
tokens:
  - perhaps
  - it seems
tests:
  - name: flags a hedge
    input: Perhaps we should ship.
    want: |
      1:1:House.Hedging:Consider removing 'Perhaps'.
  - name: leaves code alone
    input: |
      Run `perhaps` first.
    want: ''
```

Or a file ending in `.test.yml` holds a list of them:

````yaml
# styles/House/Hedging.test.yml
- name: in a project run, a fence stays silent
  input: |
    ```
    perhaps
    ```
  absent: House.Hedging
- name: reStructuredText
  rule: Hedging.yml
  format: rst
  input: It seems fine.
  contains:
    - House.Hedging
    - "'It seems'"
````

| Key        | Description                                                                                                                    |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `name`     | Required. Identifies the case in the report, and is unique within its file.                                                    |
| `about`    | A note for the reader, such as an issue number. Never checked.                                                                 |
| `input`    | The document to lint.                                                                                                          |
| `format`   | The extension `input` is read as, such as `rst` or `.adoc`. Defaults to `md`.                                                  |
| `rule`     | A rule file, relative to the test file, to run alone. See [Isolated and project cases](testing.md#isolated-and-project-cases). |
| `view`     | A [View](views.md) under `config/views` to read `input` through, for a rule scoped to one of its pieces.                       |
| `want`     | The exact alerts, one `line:column:Check:message` per line. An empty `want` asserts that there are none.                       |
| `contains` | Text, or a list of texts, that the alerts must include.                                                                        |
| `absent`   | Text, or a list of texts, that the alerts must not include.                                                                    |

Every case needs at least one of `want`, `contains`, or `absent`. A case that asserts nothing passes whatever the rule does, so Vale refuses to run it.

## [Isolated and project cases](testing.md#isolated-and-project-cases)

An **isolated** case runs one rule and nothing else: not the rest of its style, and not your `.vale.ini`. It reports at every level, so it says exactly what the rule matches. A case under a rule's `tests` is isolated to that rule, and a `.test.yml` case is isolated when it names a `rule`.

A **project** case, a `.test.yml` case with no `rule`, is linted by the configuration a `vale` run in that directory would use: its sections, scopes, `MinAlertLevel`, and every style it enables. It tells you whether the rule reaches real documents. Its `format` has to be one your configuration covers, or nothing is linted.

An isolated rule keeps the name a project run gives it, so a case can move between the two without its `want` changing.

## [Running them](testing.md#running-them)

With no arguments, `vale test` searches the working directory. Name files or directories to run only those:

```bash
vale test styles/House
vale test styles/House/Hedging.yml
```

A failed case shows what was expected against what came back:

```console
$ vale test

✗ flags a hedge — output does not match

  from  styles/House/Hedging.yml

    - 1:2:House.Hedging:Consider removing 'Perhaps'.
    + 1:1:House.Hedging:Consider removing 'Perhaps'.

    - expected   + actual

  ERROR   2 files — 3 passed, 1 failed
```

`--output=JSON` prints the same results as JSON, with each failure's `reason`, `got`, and `want`.

### [Coverage](testing.md#coverage)

A passing run says nothing about the rules no case touches. With `--coverage`, every rule under the given paths has to produce an alert in at least one case:

```console
$ vale test --coverage

✗ 1 rule produced no alert in any case

    House.Silent

  ERROR   2 files — 4 passed, 0 failed, 1 uncovered
```

## [Script rules](testing.md#script-rules)

A [`script`](../checks/script.md) rule is tested like any other, by linting an input with it. The case runs the rule's real script, whether it's written inline or kept in `config/scripts` on the `StylesPath`, so there's nothing to extract or load into a separate runner:

```yaml
# styles/House/Sections.yml
extends: script
message: 'Consider inserting a new section heading at this point.'
level: suggestion
scope: raw
script: Sections.tengo
tests:
  - name: flags the fourth paragraph of a section
    input: |
      # Intro

      One.

      Two.

      Three.

      Four.
    want: |
      9:1:House.Sections:Consider inserting a new section heading at this point.
  - name: a new heading resets the count
    input: |
      # Intro

      One.

      # Next

      Two.
    want: ''
```

Give each edge case its own case as you find it, so a later change to the script that breaks it fails the run. An off-by-one in the paragraph count shows up as a diff:

```console
✗ flags the fourth paragraph of a section — output does not match

  from  styles/House/Sections.yml

    - 9:1:House.Sections:Consider inserting a new section heading at this point.
    + 7:1:House.Sections:Consider inserting a new section heading at this point.
```

A script that doesn't compile fails every case of its rule as one that could not run, and the run exits `2`.

## [Packages](testing.md#packages)

A package whose rules [extend](styles.md#extending-another-rule) another package names it in the package's own `.vale.ini`, the way [Packages](../keys/packages.md) does for a project. `vale test` installs what a package names into a temporary `StylesPath` for the run, so its cases resolve without a synced project. A package already on the `StylesPath` is used as it is.

A package root is the nearest directory above a rule that holds both a `.vale.ini` and a `styles` directory, the layout `vale sync` installs.

## [In CI](testing.md#in-ci)

`vale test` exits like a lint run:

| Code | Meaning                                                                                                                 |
| ---- | ----------------------------------------------------------------------------------------------------------------------- |
| `0`  | Every case passed.                                                                                                      |
| `1`  | A case failed, or, with `--coverage`, a rule was uncovered.                                                             |
| `2`  | A case could not run: a rule that failed to load, a View that was not found, or no cases at all. The rest still report. |

```yaml
# .github/workflows/styles.yml
- run: vale test --coverage styles
```
