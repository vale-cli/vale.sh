---
title: 'How Rubin Observatory made Vale advisory on purpose'
description: "The Rubin Science Platform's docs run Google's style, two house rules, and a vocabulary built from a full spelling pass. Every finding is a suggestion to the writer, never a failed build, and the config explains each choice."
date: '2026-10-31'
draft: false
tags: ['case-studies', 'adopters']
brand: 'Rubin Observatory'
figure: '13 Google rules'
figureLabel: 'tuned for an astronomy corpus, each with its reason in the config'
image: '/blog/brand/case-study-rubin-observatory.png'
imageAlt: "A drawing of Rubin Observatory's telescope over the public sector orbit pattern."
---

<script>
  import Callout from '$lib/components/blog/Callout.svelte';
</script>

This is the third post in a series that explains one team's Vale setup end to end: what it lints, the rules it wrote, how it runs, and what is worth copying. Every file quoted is public, and each section links to it.

The Rubin Science Platform is where astronomers query and analyze Vera C. Rubin Observatory's data, and [rsp.lsst.io](https://rsp.lsst.io) is its documentation: about 145 reStructuredText and Markdown pages, built for eight deployments of the platform. The project already had a written style guide. What it lacked, in the words of the issue that added Vale, was any feedback before review: "authors and reviewing agents get no editorial feedback until a human reviewer catches issues."

The design decision came first and shaped everything after it. Vale's findings would be advice, never a gate. The config says so in its opening comment:

```ini
# Vale (https://vale.sh) provides advisory editorial linting of the prose in
# this repository. Findings are informational: they never fail CI. See
# docs/contributing/vale.rst for how to run and tune Vale.
```

An advisory linter is only useful if writers read what it says, so the rest of the setup is about keeping the list short enough to read.

## A tuning pass, with the numbers

The base is Google's developer documentation style, which the house style guide already defers to. Run as shipped over an astronomy corpus, it produced a wall. So the issue made a tuning pass a requirement before merge: run the full corpus, find each Google rule producing "a high volume of low-value flags", and switch it off or demote it, with a one-line reason in the config. The stated goal was that "a PR touching a typical page should see a *useful, short* list of annotations, not a wall."

Thirteen rules were changed. Eight are off and five are suggestions, and each reason names what the rule got wrong on this corpus. Two carry the count that justified the change:

```ini
# "RSP", "TAP", "API" etc. appear on nearly every page; spelling them out on
# each mention is not this project's convention (109 flags, no value).
Google.Acronyms = NO

# Parenthetical asides are common and acceptable in this procedural prose
# (190 flags — by far the noisiest rule on this corpus).
Google.Parens = NO

# "Will"/future tense is idiomatic and unavoidable in roadmap/scheduling prose.
Google.Will = suggestion
```

`Google.Headings` is off because, the comment says, it "mis-parses RST directive titles and product names", so sentence case is left to review. Run over the corpus again, the format isn't the cause: the same headings fail in Markdown. Most of the 75 alerts are names the rule can't know, such as PyVO, Avro, and the Rubin Science Platform. A capitalization rule takes the vocabulary as its exceptions, so the fix is a vocabulary entry for each, written the way the name is spelled; the current `pyvo` entry is why "Querying with PyVO" fails.

<Callout kind="note" title="Fixed in Vale v3.26.1: acronyms in sentence case">

Six of those alerts were a Vale bug. Sentence case rewrote an acronym like any other word, "TAP" as "Tap" at the start of a heading and "tap" anywhere else, so "TAP endpoint" and "UWS job list" were flagged as wrong. From v3.26.1, a word written in capitals keeps them.

</Callout>

`Vale.Terms` is off for a similar reason. The comment says it fires "on tokens that are correct in context", such as `rsp` inside URLs and package names and `jupyter` in commands. Switched back on, it reports 108 alerts, and most of them come from the vocabulary rather than the text. `Vale.Terms` holds the docs to each entry's case, and the vocabulary lists `jupyter`, `pyvo`, and `dayobs` in lowercase, so every "Jupyter" is an error. An entry written as `[Jj]upyter` accepts both.

<Callout kind="note" title="Fixed in Vale v3.26.1: Sphinx substitutions">

Some of those alerts were Vale's. A substitution such as `|rsp-at|` is defined in the project's Sphinx configuration, which Docutils never sees, so it reached Vale as written and the `rsp` inside it was flagged. From v3.26.1, a substitution Docutils can't resolve is skipped. The same release fixes where an alert lands when the converter has rewritten part of a paragraph: the title of a `:ref:` put its alert on the first `rsp` in the file, inside an earlier role's name. With both fixes, the count drops from 108 to 92.

</Callout>

And one rule stays on at a lower level because it agrees with the house style: "House style *encourages* contractions, and this rule agrees — it suggests 'don't' over 'do not' — so keep it as a low-key suggestion."

The pull request recorded where that left the corpus: 300 alerts, of which 31 are errors, 92 warnings, and 177 suggestions.

Sources: [.vale.ini](https://github.com/lsst/rsp_lsst_io/blob/HEAD/.vale.ini), [issue #100](https://github.com/lsst/rsp_lsst_io/issues/100), [pull request #105](https://github.com/lsst/rsp_lsst_io/pull/105).

## Two house rules

The RSP style has two rules, one for each house rule in the style guide that a pattern can check. Both carry a `link:` to the guide, and both say in a comment which section of the guide they come from.

The first is about "we". The guide says never to use it, "since that's ambiguous": name Rubin Observatory if you mean the project, and say "you" if you mean the reader. Google has a rule for this, and the RSP rule replaces it so the message can give both answers. The config's comment calls Google's coverage of reStructuredText "thin", but over this corpus `Google.We` finds every line `RSP.We` does, plus five more, each of them "US". That is the real difference, and the RSP token list is worth reading for what it leaves out:

```yaml
extends: existence
message: "Address the reader as 'you', not '%s'. If you mean the project, name 'Rubin Observatory'."
link: https://rsp.lsst.io/contributing/style-guide.html
level: warning
ignorecase: true
tokens:
  # "us" is deliberately omitted: it collides with "US" (US Pacific time, US
  # facilities) far more often than it appears as the first-person pronoun.
  - "we"
  - "we're"
  - "we've"
  - "we'll"
  - "our"
  - "ours"
```

The second is "never use 'here' as link text". What makes text a link is the markup, so the rule reads the source with `scope: raw` and matches the two reStructuredText forms a link takes: an inline hyperlink, and a `:doc:` or `:ref:` role with explicit text.

```yaml
extends: existence
message: "Don't use '%s' as link text; make the relevant noun or phrase the link."
link: https://rsp.lsst.io/contributing/style-guide.html
level: warning
nonword: true
scope: raw
tokens:
  - '(?i)`\s*(?:here|click here|this page)\s*<[^>]+>`_'
  - '(?i):(?:doc|ref):`\s*(?:here|click here|this page)\s*<[^>]+>`'
```

The guide also asks for one sentence per line. The issue lists that rule as house style that is out of scope for Vale, and it stays with review.

Sources: [We.yml](https://github.com/lsst/rsp_lsst_io/blob/HEAD/styles/RSP/We.yml), [LinkText.yml](https://github.com/lsst/rsp_lsst_io/blob/HEAD/styles/RSP/LinkText.yml), [the style guide](https://github.com/lsst/rsp_lsst_io/blob/HEAD/docs/contributing/style-guide.rst).

## A vocabulary built from the corpus

The vocabulary was not written from memory. Vale's spelling rule ran over every page, and each flag went one of two ways: a real term went into the vocabulary, and a real typo was fixed in the same pull request. That pass found eight typos, among them `menue`, `perfoming`, and two product names spelled wrong: `TOPCat` for TOPCAT and `Comanage` for COmanage.

The file is grouped by where a term comes from, with a header for each: Rubin and RSP project terms, people named in release notes, astronomy terms such as `coadd` and `dayobs`, software, and a last group for tokens that only look like words because of the markup. That last group accepts any lowercase `snake_case` token, since API names read as prose to a spell checker, and reStructuredText reference names that end in an underscore. For the correct spelling of a Rubin term, the contributor page points at the glossary the observatory already keeps, and the rule for writers is the same as the pass: "If a flagged word is actually a typo, fix it in the source instead of accepting it."

Source: [accept.txt](https://github.com/lsst/rsp_lsst_io/blob/HEAD/styles/config/vocabularies/RSP/accept.txt).

## How it runs

In three places, and none of them can fail.

Locally, `tox -e vale` installs Vale and Docutils, syncs the Google package, and lints `docs/`. Vale reads reStructuredText through `rst2html`, so Docutils goes wherever Vale does. The Google package is synced on each run and ignored by Git; only the config, the RSP style, and the vocabulary are committed.

On a pull request, a job runs the Vale GitHub Action with `filter_mode: added`, so the annotations land only on lines the pull request changed, and `fail_on_error: false`. The job also sets `continue-on-error`, and its comment explains why the second setting is not enough on its own:

```yaml
- name: Run Vale
  uses: errata-ai/vale-action@v2
  # Vale is advisory: annotations should appear on the PR, but the
  # check must stay green. fail_on_error alone isn't enough — the
  # action still fails the step when reviewdog exits nonzero (for
  # example when a prose-heavy PR overflows GitHub's per-step
  # annotation cap), so tolerate any step failure outright.
  continue-on-error: true
  with:
    fail_on_error: false
    filter_mode: added
    files: docs
```

<Callout kind="note" title="Fixed in vale-action v3: the annotation limit">

The job pins the action's `@v2`. From `@v3`, reaching GitHub's annotation limit is a warning rather than a failure when `fail_on_error` is `false`, so that setting is enough on its own and `continue-on-error` can go.

</Callout>

Every Monday, the periodic workflow runs Vale over the whole corpus and uploads the output as a `vale-report` artifact, a record of where the docs stand that nobody has to act on.

Sources: [ci.yaml](https://github.com/lsst/rsp_lsst_io/blob/HEAD/.github/workflows/ci.yaml), [periodic-ci.yaml](https://github.com/lsst/rsp_lsst_io/blob/HEAD/.github/workflows/periodic-ci.yaml), [tox.ini](https://github.com/lsst/rsp_lsst_io/blob/HEAD/tox.ini).

## Frozen prose stays frozen

Three paths are excluded: the dated release notes, which are "frozen, not worth re-editing", the rough drafts in the inbox, and the roadmap, whose prose "is aspirational and future-tense by nature". Each excluded section clears `BasedOnStyles` and also switches off every rule the broader section set a level for, and the config explains the pattern before using it:

```ini
# These paths are excluded from linting. Vale merges glob sections, so an
# excluded section must both clear BasedOnStyles *and* silence every rule that
# was individually enabled above.

# Historical release/update notes: frozen, not worth re-editing.
[docs/updates/**]
BasedOnStyles =
Google.Will = NO
Google.Units = NO
Google.Ordinal = NO
Google.Exclamation = NO
Google.Contractions = NO
```

The pull request confirms that the excluded paths produce no alerts.

<Callout kind="tip" title="On Vale v3.22.0 or later, this is one line">

Rubin's config predates v3.22.0. Before that release, an empty `BasedOnStyles` cleared a section's styles but kept the rule settings it inherited, so `Google.Will = suggestion` from `[*.{rst,md}]` still ran in `[docs/updates/**]`, and each one had to be switched off again by name. Since v3.22.0, an empty `BasedOnStyles` clears both, and v3.24.0 added `NONE` as a way to spell it. An excluded path now needs only this:

```ini
[docs/updates/**]
BasedOnStyles = NONE
```

To drop a single inherited setting and keep the rest, set that rule to `UNSET`. See [Starting over](https://docs.vale.sh/keys/basedonstyles#starting-over).

</Callout>

## Then the pattern moved

Three months later, the same setup arrived in [Documenteer](https://github.com/lsst-sqre/documenteer), the Sphinx tooling Rubin's documentation projects are built with. Its config has the same opening comment, the same thirteen Google changes, and its own two-rule style, `Documenteer.We` and `Documenteer.LinkText`. Its tuning pass found different noise, and the config records that too: Google's word list prefers "preceding" over "above" and "app" over "application", which misfire on "the example above" and on Sphinx's application object, so both word-list rules are suggestions. Its exclusions are generated files rather than frozen ones: the changelog, the generated API stubs, and the templates.

Source: [Documenteer's .vale.ini](https://github.com/lsst-sqre/documenteer/blob/HEAD/.vale.ini).

## Key points

- **Decide whether it's a gate before you write a rule.** Advisory and blocking are different designs, and every later choice follows from which one you picked.
- **Tune against the whole corpus, and record the count.** "190 flags" is a better reason to switch a rule off than "noisy", and it tells the next person what changed.
- **Replace a package rule rather than fight it.** When `Google.We` missed the format, a house rule with the guide's own wording took its place.
- **Build the vocabulary from a spelling pass, and fix the typos it finds.** The file then holds only terms someone decided on.
- **Annotate only changed lines.** On a pull request, a writer sees the findings for the prose they touched, not the backlog.

Rubin Observatory is on the [adopters page](/adopters) under Academia & public sector.
