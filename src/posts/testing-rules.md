---
title: 'Testing your rules with vale test'
description: 'Keep test cases beside your rules, script rules included, and run them in CI. A rule that matches nothing no longer fails in silence.'
date: '2026-10-01'
draft: true
tags: ['tutorials']
motif: 'test'
imageAlt: 'A failing vale test case: the expected alert at line 9 against the actual one at line 7.'
---

A Vale rule is a small program, and it fails in an unusual way: when it matches nothing, it loads, runs, and reports success. While writing [Voices](/blog/voices), I found three rules that had never fired. One used a `raw` list that joins its entries instead of alternating them, one had a formula that named a variable that didn't exist, and one had tokens written in the infinitive that never matched the past tense. Every run was clean, because none of them could find anything.

Until now, the only defense was a harness of your own: a directory of fixtures, a script that ran `vale` on each one, and golden files to diff against. Voices has one. So do most of the styles I maintain, and each works a little differently.

Vale v3.24.0 adds `vale test`, which runs test cases you keep beside your rules.

## Cases beside the rule

A rule can carry its own cases under `tests`. Each case has a `name`, an `input` document, and the alerts linting it should produce:

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

```console
$ vale test
 SUCCESS  1 file — 2 passed, 0 failed
```

When a case fails, `vale test` shows what it expected against what came back:

```console
✗ flags a hedge — output does not match

  from  styles/House/Hedging.yml

    - 1:2:House.Hedging:Consider removing 'Perhaps'.
    + 1:1:House.Hedging:Consider removing 'Perhaps'.

    - expected   + actual
```

## Three ways to assert

`want` pins the exact output, one `line:column:Check:message` per line, and an empty `want` asserts that there are no alerts at all. That's often more than you mean to pin, though: a case about which text a rule matches shouldn't break when you reword its message. `contains` checks for an excerpt of the output, or a list of them, and `absent` checks that something isn't there. A case needs at least one of the three; one that asserts nothing would pass whatever the rule does, so `vale test` refuses to run it.

Cases can also live in a separate file ending in `.test.yml`, as a list. This one uses the rest of the keys:

````yaml
# styles/House/Hedging.test.yml
- name: flags every hedge in a sentence
  about: Both tokens, so neither one can be dropped from the list unnoticed.
  rule: Hedging.yml
  input: Perhaps it seems fine.
  contains:
    - "'Perhaps'"
    - "'it seems'"

- name: reStructuredText
  rule: Hedging.yml
  format: rst
  input: |
    Perhaps
    =======
  contains: House.Hedging

- name: code is never prose
  about: Run through the project's .vale.ini, as a real document would be.
  input: |
    ```
    perhaps
    ```
  absent: House.Hedging
````

`about` is a note for whoever reads the case next: why it exists, or the issue it came from. It's never checked. `format` reads the input as another format, here reStructuredText, which is parsed the way a `.rst` file would be. That means it needs `rst2html`, just as a lint run does.

## One rule, or the whole project

A case under a rule's `tests` is _isolated_: it runs that rule and nothing else, not the rest of the style and not your `.vale.ini`. A `.test.yml` case is isolated when it names a `rule`, a path relative to the test file. An isolated case answers the question "what does this rule match?"

A `.test.yml` case that doesn't name a rule, like the last one above, runs through your project's configuration instead, with its sections, scopes, and `MinAlertLevel`. That answers a different question: "does this rule reach real documents?" A rule can pass every isolated case and still never run, because a section turns it off or a `SkippedScopes` entry hides the text it's looking for. You want both kinds.

## Rules scoped to a View

The last key is `view`. A [View](https://docs.vale.sh/topics/views) names the pieces of a file that has no markup, such as the subject and body of a commit message, and a rule can be scoped to one of them. An isolated case loads nothing from the project, including its Views, so a rule scoped to `subject` would see nothing. `view` names the View to read the input through:

```yaml
# styles/House/SubjectPeriod.yml
extends: existence
message: "A subject doesn't end with a period."
level: error
scope: subject
nonword: true
raw:
  - '\.$'
tests:
  - name: fires on the subject
    format: COMMIT_EDITMSG
    view: Commit
    input: |
      Fix the thing.

      The body can end with a period.
    want: |
      1:14:House.SubjectPeriod:A subject doesn't end with a period.
```

## Testing script rules

[`script`](https://docs.vale.sh/checks/script) rules are where tests matter most, since they're the rules with the most logic in them. [Issue #83](https://github.com/vale-cli/vale.sh/issues/83) asked how to test them, and suggested keeping the Tengo files outside the style so a separate runner could load them. With `vale test`, you don't need that. A case runs the rule's real script, whether it's inline or in `config/scripts`:

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

Add a case each time you handle a new edge case, and a later change that breaks it fails the run. Here's what happens when `count > p_limit` in the script becomes `count >= p_limit`:

```console
✗ flags the fourth paragraph of a section — output does not match

  from  styles/House/Sections.yml

    - 9:1:House.Sections:Consider inserting a new section heading at this point.
    + 7:1:House.Sections:Consider inserting a new section heading at this point.
```

## Rules no case touches

A passing run says nothing about rules that have no cases. `--coverage` requires every rule under the given paths to produce an alert in at least one case, which is exactly the check that would have caught those three Voices rules:

```console
$ vale test --coverage

✗ 1 rule produced no alert in any case

    House.Silent

  ERROR   2 files — 5 passed, 0 failed, 1 uncovered
```

## Packages that build on packages

A package whose rules extend another one, such as Voices and Journals, which both build on [Std](/blog/std), lists that package in its own `.vale.ini`. `vale test` installs it into a temporary `StylesPath` for the run, so the cases resolve without a synced project or a staging script.

The styles I maintain now carry about 1,280 cases between them: Std, Voices, Journals, Diataxis, Commits, Readability, and Fiction. All of them pass with a plain `vale test`.

## In CI

`vale test` exits like a lint run: `0` when every case passes, `1` when one fails or a rule is uncovered, and `2` when a case can't run at all, such as when a rule doesn't compile.

```yaml
- run: vale test --coverage styles
```

The [Testing](https://docs.vale.sh/topics/testing) page has the reference for every key and exit code.
