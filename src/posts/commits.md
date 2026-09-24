---
title: 'Linting commit messages'
description: 'Commits is a Vale package for the log: nine conventions, the rule sets of commitlint, gitlint, committed, conform, and commitizen, spelling on the body, and a hook that runs in 12 ms.'
date: '2026-09-10'
tags: ['packages', 'formats']
motif: 'commit'
imageAlt: 'A commit message with its subject, body, and trailers each highlighted as a separate scope, one carrying an alert at its exact column.'
---

<script>
  import Callout from '$lib/components/blog/Callout.svelte';
  import CommitsSpeedChart from '$lib/components/blog/CommitsSpeedChart.svelte';
  import RuleCountChart from '$lib/components/blog/RuleCountChart.svelte';
</script>

A commit message has a shape everyone agrees on. The first line is the subject. A blank line follows, then the body. At the end come the trailers, `Signed-off-by:` and the like, one per line. Teams write rules about each part: the subject doesn't end with a period, the body explains why, a breaking change is called out in a footer.

None of that is markup. There's no `#` in front of the subject and no fence around the trailers, so to a linter the message is a run of lines that all look the same. A rule can say "no line ends with a period," but it can't say "the subject doesn't," and a rule about trailers has nothing to hold on to.

As of v3.21.0, Vale reads a plain-text file through a [TextFSM](https://github.com/google/textfsm/wiki/TextFSM) template and turns what it captures into named parts. The first version of this post set that up by hand. Today there's a package that does it, [Commits](https://github.com/jdkato/commits), and this post is about what it holds, how it compares to the tools it replaces, and what it cost Vale to get there.

## The template

A [View](https://docs.vale.sh/topics/views) is a file in `<StylesPath>/config/views` that tells Vale how to read a file. For a commit message, the View is a template: values to capture, and a small state machine that decides which line is which.

```yaml
# config/views/Commit.yml
engine: textfsm
template: |
  Value Subject (.+)
  Value Gap (.*)
  Value List Body (.*)
  Value List Trailer (.+)

  Start
    ^# -> Next
    ^${Subject} -> Gap

  Gap
    ^${Gap} -> Continue
    ^\s*$$ -> Para
    ^${Body} -> Body

  Body
    ^# -> Next
    ^(?=\s*$$)${Body} -> Para
    ^${Body}

  Para
    ^# -> Next
    ^(?=(?:(?i:breaking[ -]change)|[\w-]+)(?:: | #))${Trailer} -> Trailers
    ^${Body} -> Body

  Trailers
    ^\s*$$ -> Para
    ^${Trailer}
scopes:
  - name: subject
    expr: Subject
  - name: gap
    expr: Gap
  - name: body
    expr: Body
    type: md
  - name: trailer
    expr: Trailer
```

Reading starts in `Start` and follows the message down. The first line is the subject. The line after it is kept as `gap`, whatever it holds, so a rule can say whether it was blank. A paragraph that opens with a `Token: value` or `Token #ref` line is a trailer block, and it runs to the next blank line, since the spec says a footer's value "MAY contain spaces and newlines." Lines starting with `#` are Git's commentary and are read past. The package's copy also ends the read at the scissors line `commit -v` puts before the diff.

The body has `type: md`, so it's parsed as Markdown: a rule scoped to `body` sees paragraphs and inline code the way it does in a `.md` file, and spelling leaves an identifier in backticks alone. A value the template never fills is still a scope, one empty value at the top of the file, and that's where a rule that requires something reports that it's missing.

## The package

Every convention people follow for commit messages is a set of rules about those parts, and Commits ships each as a style: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), the [Angular](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md) format it came from, [gitmoji](https://gitmoji.dev/specification), [Emoji-Log](https://github.com/ahmadawais/Emoji-Log), Chris Beams's [seven rules](https://cbea.ms/git-commit/), the Linux [kernel's](https://www.kernel.org/doc/html/latest/process/submitting-patches.html) patch format, the [Go](https://go.dev/doc/contribute#commit_messages) project's, and a Jira key. Then the linters: the rule sets of [commitlint](https://commitlint.js.org), [gitlint](https://jorisroovers.com/gitlint/), [committed](https://github.com/crate-ci/committed), [conform](https://github.com/siderolabs/conform), and [commitizen](https://commitizen-tools.github.io/commitizen/), each transcribed rule for rule with its defaults, so a team keeps the checks it knows.

<RuleCountChart caption="Eighty-eight rules across fourteen styles. Each rule links to the passage of the document it enforces." />

```ini
StylesPath = styles
Packages = Commits

[COMMIT_EDITMSG]
BasedOnStyles = Commits, Conventional
```

The package brings the section, the View, and `Commits`, the core every convention shares: a blank line after the subject, the imperative mood, no whitespace at the edges, no `fix` or `wip` for a subject. You name the convention beside it. `Conventional` is the spec and nothing else; `Commitlint` and `Angular` narrow it and go with it.

The conventions agree more than they differ, and where they say the same thing the rule is written once. A `_shared` directory holds the shared patterns, and a style's rule extends one with its own message, link, level, and limit, a Vale v3.20 feature:

```yaml
# SevenRules/Limit.yml
extends: Commits._shared.SubjectLength
message: 'A subject of %d characters. Shoot for 50; 72 is the hard limit.'
link: https://cbea.ms/git-commit/#limit-50
level: warning
max: 50
```

The limit is a rule parameter, so a project sets its own from the config, `Commitlint.HeaderLength[max] = 72`, without touching the rule.

## Coming from commitlint

`@commitlint/config-conventional` is the spec plus a few rules of Angular's. Two styles cover it:

```ini
[COMMIT_EDITMSG]
BasedOnStyles = Commits, Conventional, Commitlint
```

Every rule in commitlint's reference has a counterpart, at the level the config gives it, and the ones config-conventional leaves off are off here too. `Commitlint.References = YES` turns one on, the way the config would. The [guide](https://github.com/jdkato/commits/blob/main/docs/commitlint.md) maps every rule; there's one for [gitlint](https://github.com/jdkato/commits/blob/main/docs/gitlint.md), [committed](https://github.com/jdkato/commits/blob/main/docs/committed.md), [conform](https://github.com/jdkato/commits/blob/main/docs/conform.md), and [commitizen](https://github.com/jdkato/commits/blob/main/docs/commitizen.md) as well, each with the config to write and what is not carried and why. What can't be carried is what only Git knows: an author, a signature, a diff.

The report can look like the old tool's, too. The package ships output templates, and `--output=commitlint.tmpl` prints commitlint's:

```console
$ vale --output=commitlint.tmpl --path=COMMIT_EDITMSG < .git/COMMIT_EDITMSG
⧗   input: COMMIT_EDITMSG
✖   Start with a type, then a colon: 'fix: ...', 'feat(scope)!: ...'. 'Fixed' is not one. [Conventional.Type]
✖   A subject does not end with a period. [Commitlint.FullStop]
⚠   Write the subject as a command: 'Add', not 'Fixed'. [Commits.Imperative]

✖   found 2 problems, 1 warnings
ⓘ   Get help: https://www.conventionalcommits.org/en/v1.0.0/#specification
```

There's a gitlint form, a committed form, conform's table, and `github.tmpl`, which prints GitHub Actions annotations so an alert lands on the pull request at its line.

## The hook

A `commit-msg` hook receives the path of the message file. Vale reads it on stdin, and `--path` names the section that applies, since the text has no name of its own:

```sh
#!/bin/sh
# .git/hooks/commit-msg
exec vale --path=COMMIT_EDITMSG < "$1"
```

Vale exits non-zero on an error-level alert, so the commit stops with the alerts on screen. The package's copy adds two things. Messages Git writes itself, merges, reverts, and the `fixup!` and `squash!` that autosquash reads, are let through, as commitlint lets them through. And on a fresh clone, where the styles aren't there yet, it runs `vale sync` once, when the `StylesPath` the config names has no `Commits` in it, so the first commit after a clone fetches the package and no commit after it does.

Because the message comes in on stdin, the same line runs in CI on `git log --format=%B -1`, on each commit of a pull request, and on the request's description.

## Speed

One message, from a file, the way a hook runs it, on an Apple Silicon Mac. hyperfine, 30 runs after 3 warm-ups. Each tool ran its default Conventional Commits check; Vale ran the styles that match.

<CommitsSpeedChart caption="Wall-clock time to lint one commit message. The two Rust parsers read the header and stop; everything else does more, and Vale does the most of it." />

Vale's 12 ms is the same with one rule or fifty. Profiled, 8 of it is starting a 43 MB binary that carries tree-sitter grammars for twenty languages; the rest is reading the config and compiling the rules, and the lint itself is under a millisecond. A run does everything commitlint does in a twentieth of the time. Spelling adds a dictionary load, which none of the others have to pay for, and lands at 85 ms.

Where the lines fall isn't a matter of taste. Dan Luu's [terminal latency](https://danluu.com/term-latency/) measurements found that "when extra latency is A/B tested, people can and do notice latency in the range we're discussing here," tens of milliseconds. A 2024 [pre-commit-hooks issue](https://github.com/pre-commit/pre-commit-hooks/issues/1069) reports "about 50 ms" a hook adding up to "~600 ms for all the hooks" as sluggish. And [prek](https://prek.j178.dev/benchmark/), a rewrite of pre-commit, benchmarks 13 hooks over 960 files at 135 ms against pre-commit's 1,737 ms and calls the difference the point of the project.

## The tests

Each rule carries its cases in a `tests:` block, run in isolation by `vale test`. A rule scoped to `subject` needs the View to have a subject, so each case names it:

```yaml
tests:
  - name: before
    format: COMMIT_EDITMSG
    view: Commit
    input: |
      fix: some message.
    want: |
      1:18:Commitlint.FullStop:A subject does not end with a period.
```

That's 265 cases across the 88 rules. Beside them sit the other tools' own fixtures: a script pulls the test messages of commitlint, gitlint, commitizen, conform, and committed at a pinned commit, reads the verdict each tool's tests expect, and writes cases asserting that the rule here agrees. Sixty-one of those, and every one passes. It caught a real bug on the way in: commitlint's `footer-max-line-length` fixture has a footer whose value continues on an unindented second line, which the spec allows and the View was handing back to the body.

<Callout kind="note" title="Two things this put into Vale">

The `view:` key on a test case is new, and on the `v3` branch until the next release; before it, an embedded case couldn't reach a View-scoped rule at all. And a `conditional` rule miscounted a `(` inside a character class as a capture group, so a `second` written as `^\w+(?:\([^()]*\))?!:` never matched. Both are fixed, with tests. Linting needs only v3.21.0; running the package's own suite needs `v3`, which its CI builds.

</Callout>

## Elsewhere

The same approach reads anything with a shape and no markup: subtitle files, transcripts where only one side is yours to lint, changelogs, `.po` files. The [TextFSM guide](https://docs.vale.sh/guides/textfsm) walks through the template language and two more of those. The package's [comparison](https://github.com/jdkato/commits/blob/main/docs/comparison.md) has the feature table, and [how it works](https://github.com/jdkato/commits/blob/main/docs/how-it-works.md) the rest of the mechanics.
