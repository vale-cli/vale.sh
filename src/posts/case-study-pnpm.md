---
title: 'How pnpm holds its release notes to a stricter standard than its docs'
description: 'pnpm runs one 25-rule Vale style over its docs, its release notes, its contributor Markdown, and the comments in its Rust and TypeScript. The config decides which rules apply to which text, and the release notes get the most.'
date: '2026-11-12'
draft: true
tags: ['case-studies', 'adopters']
brand: 'pnpm'
figure: '25 rules'
figureLabel: 'in one house style, set four ways for docs, release notes, contributor text, and code comments'
image: '/blog/brand/case-study-pnpm.png'
imageAlt: 'The pnpm mark over the prompt-and-brackets pattern of the developer tools sector.'
---

This is the fourth post in a series that explains one team's Vale setup end to end: what it lints, the rules it wrote, how it runs, and what is worth copying. Every file quoted is public, and each section links to it.

[pnpm](https://github.com/pnpm/pnpm) is a package manager for JavaScript, with about thirty-seven thousand stars. Its repository holds more than one product: the TypeScript CLI, the Rust CLI that succeeds it, a registry server, and the website docs for each, a little over three hundred Markdown pages. It also holds a lot of prose that is not documentation. A change to a published package ships with a changeset, a short Markdown file that becomes a line in the release notes, and thousands of Rust and TypeScript files carry comments.

The writing rules for all of it were already written down, in `AGENTS.md`. That file opens by saying who it is for: it "provides context and instructions for AI agents working on the pnpm codebase." Agents write a share of this repository's prose, and the pull request that added Vale is an example. Its footer says agents wrote it.

An instruction file asks, and nothing checks whether the answer followed it. The pull request states the goal in one line: "the repo's writing rules are checked by a machine, as its code rules already are." The check is the same for every author. A person and an agent get the same alert, with the same message, at the same line.

What makes the setup worth reading is that it does not treat that prose as one thing. A docs page, a release note, a contributor README, and a code comment have different readers, so one style is set four ways.

## Rules written for the repository

pnpm tried the published packages first. The pull request names Google, Microsoft, RedHat, and write-good, and says they "were too noisy to block on, for example 1,300 passive-voice hits in the v12 docs alone". So the style is written for the repository instead, "following the GitLab model": twenty-five short rules in `.vale/styles/pnpm`, each small enough to read in one screen.

Twenty of them carry a `link:` to the guideline they enforce. Fourteen point at a page of the Google developer documentation style guide, and six point at a section of `AGENTS.md`. Passive voice, the rule that produced the 1,300 hits, is kept as a suggestion, and its message uses the project's own example: "Name the actor: 'pnpm reads the file', not 'the file is read'."

The levels are the design. Twenty rules are errors, four are warnings, and one is a suggestion, and only errors fail a run. A rule is an error when a pattern can decide the question, and a warning when the writer has to. This one is an error:

```yaml
extends: existence
message: "Replace '%s' with a measurement, or remove it."
link: https://developers.google.com/style/excessive-claims
level: error
ignorecase: true
tokens:
  - blazing(?:ly)? fast
  - lightning fast
  - seamless(?:ly)?
  - robust
  - powerful
  - significantly
  - dramatically
```

For a package manager whose pitch is speed, that message is a policy: a claim about performance comes with a number.

The product-name rule shows the same care about false positives. It fixes `Github` and `NodeJS`, but a lowercase `github` is flagged only when it stands alone, so a URL or a package name passes:

```yaml
swap:
  '(?:Pnpm|PNPM)': pnpm
  '(?:Github|(?<![\w./@-])github(?![\w./-]))': GitHub
  'lock file|lock-file': lockfile
```

Spelling is not Vale's job here. The pull request leaves it with cspell, "which also checks code identifiers. Vale cannot see those."

Sources: [the pnpm style](https://github.com/pnpm/pnpm/tree/main/.vale/styles/pnpm), [Puffery.yml](https://github.com/pnpm/pnpm/blob/main/.vale/styles/pnpm/Puffery.yml), [Terms.yml](https://github.com/pnpm/pnpm/blob/main/.vale/styles/pnpm/Terms.yml), [pull request #17238](https://github.com/pnpm/pnpm/pull/17238).

## One style, four sections

The config is under fifty lines, and it opens by saying where the rules are:

```ini
# Prose linting. The rules live in .vale/styles/pnpm, and each one links
# the guideline it enforces.
StylesPath = .vale/styles
MinAlertLevel = suggestion

[*.md]
BasedOnStyles = pnpm
pnpm.Emphasis = NO
pnpm.History = NO
pnpm.InsteadOf = NO
pnpm.Internals = NO
pnpm.Reasoning = NO
pnpm.ReleaseLine = NO
# Contributor text is held to the user-facing rules except these, which
# are not yet fixed across it.
pnpm.Dashes = warning
pnpm.Headings = warning

[{pnpm,pnpm11,pnpr}/docs/**/*.md]
pnpm.Dashes = warning
pnpm.Headings = error
pnpm.Internals = YES

[.changeset/*.md]
pnpm.Dashes = error
pnpm.Emphasis = YES
pnpm.Headings = NO
pnpm.InsteadOf = YES
pnpm.Internals = YES
pnpm.Reasoning = YES
pnpm.ReleaseLine = YES
```

Vale merges every section whose glob matches a file, so the first section is the baseline for all Markdown and the next two only state what differs. A fourth section, covered below, does the same for source files. Read together, they give each kind of text its own subset:

- **Contributor Markdown** gets nineteen rules. The six that are off only make sense for a release note or a comment. Dashes and heading case are warnings for now.
- **The website docs** get twenty. Sentence-case headings become an error, and `Internals` comes on.
- **Changesets** get twenty-three, the most of any section, and the dash rule is an error.
- **Rust and TypeScript comments** get fifteen. The rules about Markdown are off, and the one rule written for comments is on.

The two `warning` lines in the first section are a debt, and the config says so: the rules "are not yet fixed across it". The pull request gives the size, about 8,100 em dashes in contributor Markdown and comments, and lists making the rule an error there as a planned follow-up.

`Internals` is the rule that divides the readers. `AGENTS.md` lists what counts as user-facing text and then draws the line: "User-facing text names only what the user can reach: their project, their config, the `pnpm` command, npm, Node.js." The rule is that sentence as a pattern:

```yaml
extends: existence
message: "User-facing text names only what the user can reach. Describe the behavior instead of '%s'."
link: https://github.com/pnpm/pnpm/blob/main/AGENTS.md#user-facing-text
level: error
ignorecase: true
tokens:
  - pacquet
  - (?:the )?Rust (?:implementation|CLI|rewrite|port)
  - (?:the )?TypeScript (?:implementation|CLI)
  - just recipe
```

`pacquet` is the name of the Rust CLI inside the repository. A contributor README can say it freely. A docs page or a release note that says it fails the build, because the reader of those knows only the `pnpm` command.

Sources: [.vale.ini](https://github.com/pnpm/pnpm/blob/main/.vale.ini), [Internals.yml](https://github.com/pnpm/pnpm/blob/main/.vale/styles/pnpm/Internals.yml), [AGENTS.md](https://github.com/pnpm/pnpm/blob/main/AGENTS.md#user-facing-text).

## Release notes get the most rules

A changeset is a few sentences long and it is the most-read text a change produces. The guide says why it gets its own standard: "Someone skimming the changelog for the one entry that affects them should read it once and know what changed for them." Release blog posts are assembled from the same entries, "so their wording is the wording users see."

Four rules run only on changesets. `Emphasis` removes bold and italics. `ReleaseLine` rejects "pnpm v11" and "pnpm v12" in the text, because the package targets in the changeset's header already put the entry on the right release page. The other two catch the shape of a sentence that explains itself too much:

```yaml
extends: existence
message: "A release note states what pnpm does now. Move '%s' and the reasoning after it to the commit body."
link: https://github.com/pnpm/pnpm/blob/main/AGENTS.md#changeset-style
level: warning
ignorecase: true
tokens:
  - so that
  - this ensures
  - this means that
  - which ensures
  - in order to
```

`InsteadOf` does the same for "instead of" and "rather than", with the guide's wording as its message: "End with the issue link, not with the old behavior." Both are warnings. "So that" is sometimes the right phrase, and the guide's own corrected example keeps a "so" clause, so the writer decides.

The messages are what make these rules useful. Each one says where the cut text belongs, which is the commit body, so the writer is moving a sentence rather than losing it.

The guide pairs the rules with examples, and one shows what they are for. Before:

```text
Sped up installs in large workspaces: the fast lockfile-update check no longer compares every project against every lockfile entry (or copies the whole lockfile before discovering a change needs the resolver), project ordering uses faster hashing, and the version-preference table builds in parallel [#14352](https://github.com/pnpm/pnpm/issues/14352).
```

After:

```text
Sped up installs in large workspaces. The check that decides whether the lockfile needs updating no longer compares every project against every lockfile entry [#14352](https://github.com/pnpm/pnpm/issues/14352).
```

The guide asks the writer to reread an entry before committing and "ask what makes it read as generated", and it names the usual answers: "an em dash, an 'instead of' tail, and a colon-joined list of internals." The first two are rules. The third is partly `Internals`. A request to reread is the kind of instruction that gets skipped. A failed check is not, and its message tells an agent what to do next as plainly as it tells a person.

Sources: [Reasoning.yml](https://github.com/pnpm/pnpm/blob/main/.vale/styles/pnpm/Reasoning.yml), [InsteadOf.yml](https://github.com/pnpm/pnpm/blob/main/.vale/styles/pnpm/InsteadOf.yml), [ReleaseLine.yml](https://github.com/pnpm/pnpm/blob/main/.vale/styles/pnpm/ReleaseLine.yml), [the changeset style](https://github.com/pnpm/pnpm/blob/main/AGENTS.md#changeset-style).

## A rule for comments

Vale reads a source file's comments and skips its code, so the last section of the config points the same style at Rust and TypeScript:

```ini
[*.{rs,ts}]
BasedOnStyles = pnpm
pnpm.Dashes = warning
pnpm.Ellipses = NO
pnpm.Emphasis = NO
pnpm.Headings = NO
pnpm.InsteadOf = NO
pnpm.Internals = NO
pnpm.LinkText = NO
pnpm.Reasoning = NO
pnpm.ReleaseLine = NO
pnpm.Spacing = NO
pnpm.Terms = NO
```

Ten rules are off. Some check Markdown that a comment does not have, and some would misfire on code: a comment is where `pacquet`, a lowercase `github`, and aligned spacing all belong. What stays on is the plain-language core, and one rule that exists only for this section:

```yaml
extends: existence
message: "Describe the current contract. '%s' is history, and history belongs in the commit message."
link: https://github.com/pnpm/pnpm/blob/main/AGENTS.md#comments
level: error
ignorecase: false
tokens:
  - '[Tt]he (?:old|original|previous) (?:code|implementation|approach|logic)\b'
  - '\b(?:was|were) (?:changed|renamed|moved|replaced) (?:to|from|by)\b'
```

The guide's rule is that a comment describes what the code guarantees, not what it replaced: "That's what `git log` and `git blame` are for." A comment about the previous implementation is true on the day it is written and stale after the next change, and this rule is the one place in the style where a pattern catches a habit of thought.

The repeated-word rule also knows where it is running. Its exceptions are `Errors`, `Panics`, and `Safety`, the section headings a Rust doc comment uses.

Sources: [History.yml](https://github.com/pnpm/pnpm/blob/main/.vale/styles/pnpm/History.yml), [Repetition.yml](https://github.com/pnpm/pnpm/blob/main/.vale/styles/pnpm/Repetition.yml), [the comment rules](https://github.com/pnpm/pnpm/blob/main/AGENTS.md#comments).

## The guide is linted too

`AGENTS.md` is a Markdown file, so the style runs on it, and a guide that tells writers not to say "leverage" has to say "leverage". It switches three rules off around the two bullets that quote the rejected words, and says why in a comment:

```markdown
<!-- The rules below quote the words the prose linter rejects. -->
<!-- vale pnpm.Substitutions = NO -->
<!-- vale pnpm.Puffery = NO -->
<!-- vale pnpm.NoteThat = NO -->
- **Plain words.** "Use", not "leverage". "Many", not "numerous". "If", not "in the event that".
```

That is the only use the guide allows: "Fix an alert by rewriting the sentence. Turn a rule off with a `<!-- vale <rule> = NO -->` comment only where the text quotes the words the rule rejects."

The same section is honest about what a linter is. "Vale flags patterns, not meaning", it says, and it gives the writer the checks no pattern can make: whether the opening answers the reader's question, and whether conditions are easy to find. It also guards against the lazy fix for a hedging alert: "If behavior is uncertain, name the condition or source of uncertainty instead of removing it."

Source: [Prose linting](https://github.com/pnpm/pnpm/blob/main/AGENTS.md#prose-linting).

## How it runs

One script, locally and in CI. `pnpm lint:prose` runs `lint-prose.mjs`, which asks Git for every tracked Markdown, Rust, and TypeScript file, drops fixtures, vendor directories, changelogs, and licenses, and passes the rest to Vale in batches of 200 to stay "under the Windows command-line limit". It sets `--minAlertLevel=error`, so a run prints only what fails it. The pull request puts a full run at about eleven seconds.

Changesets get different handling, and the script's opening comment explains it:

```js
// Released changesets stay in .changeset/ and are not rewritten, so only the
// changesets added since PROSE_BASE (default: origin/main) are linted.
```

A released note is a record, and holding it to a rule written later would mean editing history. So the script lists the changesets a branch adds, and in CI the base is the pull request's base commit.

The `Prose` workflow runs on any pull request that touches Markdown, Rust, TypeScript, or the Vale files. It does not use an action to install Vale. It downloads a release pinned by version, checks the archive against a SHA-256 in the workflow file, and runs the script with `--output=line`:

```yaml
env:
  VALE_VERSION: 3.24.0
  VALE_SHA256: 867534ddb678abca7f214bc4706ead0922bd5252ffe8035fc227013f66c8b214
```

A blocking check has to start green, so the pull request that added the rules also fixed what they found: about 1,100 errors across 300 files, with only prose and comment text changed. Where a heading was rewritten to sentence case, its anchor was kept, so no link to the docs broke.

Sources: [lint-prose.mjs](https://github.com/pnpm/pnpm/blob/main/.github/scripts/lint-prose.mjs), [prose.yml](https://github.com/pnpm/pnpm/blob/main/.github/workflows/prose.yml).

## Key points

- **Sort the prose by reader before writing rules.** Docs, release notes, contributor text, and comments each got a section, and a rule runs only where its reader is.
- **Write the baseline once and state the differences.** Sections merge, so the narrow ones are three to seven lines each.
- **Back the agent instructions with a linter.** `AGENTS.md` states the rule, the Vale rule links back to it, and the same check runs on every author.
- **Put the destination in the message.** "Move it to the commit body" gets a better edit than "remove it".
- **Make it an error only when a pattern can decide.** "So that" is a warning; "blazing fast" is not.
- **Leave released text alone.** Lint what a branch adds, and the rule never asks anyone to rewrite a record.
- **Fix the corpus in the pull request that adds the gate,** and mark what is left as a warning with a comment saying so.

pnpm is on the [adopters page](/adopters) under Developer tools, with a link to this config.
