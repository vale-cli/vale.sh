---
title: 'Testing your rules with vale test'
description: 'Keep test cases beside your rules, script rules included, and run them in CI. A rule that matches nothing no longer fails in silence.'
date: '2026-10-01'
draft: true
tags: ['tutorials']
imageAlt: 'A terminal window of placeholder prose with a few spans highlighted.'
---

A Vale rule is a small program, and it fails in an unusual way: when it matches nothing, it loads, runs, and reports success. While writing [Voices](/blog/voices), I found three rules that had never fired. One used a `raw` list that joins its entries instead of alternating them, one had a formula that named a variable that didn't exist, and one had tokens written in the infinitive that never matched the past tense. Every run was clean, because none of them could find anything.

Until now, the only defense was a harness of your own: a directory of fixtures, a script that ran `vale` on each one, and golden files to diff against. Voices has one. So do most of the styles I maintain, and each works a little differently.

Vale v3.24.0 adds `vale test`, which runs test cases you keep beside your rules.

## Cases beside the rule

A rule can carry its own cases under `tests`. Each case is a short document and the alerts linting it should produce:

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
 SUCCESS  2 files — 4 passed, 0 failed
```

When a case fails, `vale test` shows what it expected against what came back:

```console
✗ flags a hedge — output does not match

  from  styles/House/Hedging.yml

    - 1:2:House.Hedging:Consider removing 'Perhaps'.
    + 1:1:House.Hedging:Consider removing 'Perhaps'.

    - expected   + actual
```

`want` pins the exact output, and an empty one asserts that there are no alerts. When the message or column doesn't matter, `contains` checks for an excerpt and `absent` checks that something isn't there. Cases can also live in a separate file ending in `.test.yml`, as a list.

## One rule, or the whole project

A case under a rule's `tests` is _isolated_: it runs that rule and nothing else, not the rest of the style and not your `.vale.ini`. It answers the question "what does this rule match?"

A case in a `.test.yml` that doesn't name a rule runs through your project's configuration instead, with its sections, scopes, and `MinAlertLevel`. That answers a different question: "does this rule reach real documents?" A rule can pass every isolated case and still never run, because a section turns it off or a `SkippedScopes` entry hides the text it's looking for. You want both kinds.

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

  ERROR   2 files — 4 passed, 0 failed, 1 uncovered
```

## Packages that build on packages

A package whose rules extend another one, such as Voices and Journals, which both build on [Std](/blog/std), lists that package in its own `.vale.ini`. `vale test` installs it into a temporary `StylesPath` for the run, so the cases resolve without a synced project or a staging script.

The styles I maintain now carry about 1,280 cases between them: Std, Voices, Journals, Diataxis, Commits, Readability, and Fiction. All of them pass with a plain `vale test`.

## In CI

`vale test` exits like a lint run: `0` when every case passes, `1` when one fails or a rule is uncovered, and `2` when a case can't run at all, such as when a rule doesn't compile.

```yaml
- run: vale test --coverage styles
```

The [Testing](https://docs.vale.sh/topics/testing) page has the full list of case keys, including `format`, for linting a case as reStructuredText or AsciiDoc, and `view`, for a rule scoped to part of a [View](https://docs.vale.sh/topics/views).
