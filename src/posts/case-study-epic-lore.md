---
title: 'How Epic Games keeps Lore from sounding like Git'
description: "Lore is Epic's open source version control system, and its docs run a 62-rule Vale style whose job is to make a new product speak its own language. The config, the rules, and the script that runs them."
date: '2026-09-28'
draft: false
tags: ['case-studies', 'adopters']
brand: 'Epic Games'
figure: '62 rules'
figureLabel: 'in a house style built to keep Git and Perforce out'
image: '/blog/brand/case-study-epic-lore.png'
imageAlt: 'A Vale rule that replaces the Git term "working copy" with the Lore term "working tree".'
---

This is the first in a series that explains one team's Vale setup end to end: what it lints, the rules it wrote, how it runs, and what is worth copying. Every file quoted is public, and each section links to it.

[Lore](https://github.com/EpicGames/lore) is Epic Games' open source version control system, MIT-licensed, with about nine thousand stars, and the built-in version control for the Unreal Editor for Fortnite. It is a new product in an old category, and that is the whole problem its docs face: everyone who writes about version control already has a vocabulary, and it belongs to Git or to Perforce. The style guide says so in one sentence: "Lore is its own version-control system. Don't import Git or Perforce mental models — Lore has its own primitives, and forcing a Git-shaped translation onto them tends to mislead more than it teaches." A guide can say that; it cannot hold the line across contributors and pull requests. So the docs, about eighty Markdown pages, run a house style of sixty-two rules, and the ones that could only belong to this project exist to keep those two vocabularies out.

## Where the rules live

The docs standards are a directory in the repository, `docs/developing/doc-standards`, with three parts: a `canon` that states the rules in prose, a `tools` directory with the linter config files, and the Vale style itself. The config at the repository root opens by saying what the style is and where its reasoning is kept:

```ini
# Lore docs Vale config. The Lore style incorporates rules derived from
# the Microsoft Writing Style Guide alongside project-specific rules (banned
# phrases, Git/Perforce vocabulary, MkDocs-admonition regression check,
# others). Two documented divergences from the style guide are disabled below.

StylesPath = docs/developing/doc-standards/tools/vale/styles
MinAlertLevel = warning
Vocab = Lore

IgnoredScopes = code, tt
SkippedScopes = script, style, pre, code, frontmatter

[*.md]
BasedOnStyles = Vale, Lore
```

Every rule in the style carries a `link:` to the section of the [canon](https://github.com/EpicGames/lore/blob/HEAD/docs/developing/doc-standards/canon/language.md) that explains it, so a writer who hits a finding lands on the reasoning rather than on the regex. That one habit is what makes the rest of this setup work, and it is the first thing to copy.

## The vocabulary rules

Two rules handle Git terms, and the split between them is the design. Terms with a clean one-to-one Lore equivalent are substituted. The message says which word Lore uses, and the `replace` action means an editor can apply it.

```yaml
extends: substitution
message: "Lore uses '%s', not '%s'."
level: warning
ignorecase: true
action:
  name: replace
swap:
  working copy: working tree
  '\bHEAD\b': latest
  '\bgit index\b': stage
  '\bgit pull\b': lore sync
  '\bgit fetch\b': lore sync
```

Terms with no single safe rewrite are flagged instead. The comment at the top of that file says why the two are separate: these are "Git-isms that need writer judgment", with "either no Lore analog at all, or multiple Lore analogs depending on intent", so the rule points at the guidance and leaves the choice to the writer.

```yaml
extends: existence
message: "Git-ism '%s' needs Lore-specific framing — pick the Lore primitive that matches your intent (often `branch`, `layer`, or `link`). See language.md for guidance."
level: warning
ignorecase: true
tokens:
  - detached HEAD
  - \bgit stash\b
  - \bstashed\b
  - \brefspec\b
  - \breflog\b
  - \bsubmodule\b
```

Perforce gets the same treatment, and its substitution table is a small translation dictionary between two products:

```yaml
swap:
  '\bchangelist\b': revision
  '\bchangelists\b': revisions
  '\bp4 integrate\b': lore branch merge
  '\bp4 sync\b': lore sync
  '\bp4 submit\b': lore commit
  '\bp4 revert\b': lore reset
```

Sources: [GitIsmSubstitutions.yml](https://github.com/EpicGames/lore/blob/HEAD/docs/developing/doc-standards/tools/vale/styles/Lore/GitIsmSubstitutions.yml), [GitIsmFlagged.yml](https://github.com/EpicGames/lore/blob/HEAD/docs/developing/doc-standards/tools/vale/styles/Lore/GitIsmFlagged.yml), [PerforceIsmSubstitutions.yml](https://github.com/EpicGames/lore/blob/HEAD/docs/developing/doc-standards/tools/vale/styles/Lore/PerforceIsmSubstitutions.yml).

## Three rules about the product itself

The product's name is a rule. `Lore` alone covers it, and the parts have names of their own, so "the Lore tool" is a finding:

```yaml
extends: existence
message: "Drop the qualifier — '%s' is redundant. Use 'Lore' alone, or name a specific part (Lore CLI, Lore Server, Lore library)."
level: warning
tokens:
  - the Lore (?:tool|software|application|product|system)
```

Permission verbs are banned in the "lets you" sense, and the comment on the rule is careful about the one case where `enable` is right: "Enable the pre-commit hook" is a literal toggle, so the pattern requires a person as the object and the toggle never fires.

```yaml
extends: existence
message: "Avoid permission-implying '%s'. The software is not a gatekeeper. Rewrite as 'you can ...' or use the imperative."
level: warning
ignorecase: true
tokens:
  - (?:allows?|lets?|permits?|enables?) (?:you|users?|the user)
```

And one rule is a regression check rather than a style rule. The docs moved from one admonition syntax to another, and the old one is now an error, so it cannot drift back in.

```yaml
extends: existence
message: "MkDocs admonition syntax '%s' is not allowed. Use GFM alerts: > [!NOTE], > [!TIP], or > [!WARNING]."
level: error
nonword: true
tokens:
  - '^!!! (?:note|tip|warning|info|important|caution|danger|abstract|example|question|success|failure|bug|quote)'
```

Sources: [ProductNaming.yml](https://github.com/EpicGames/lore/blob/HEAD/docs/developing/doc-standards/tools/vale/styles/Lore/ProductNaming.yml), [PermissionVerbs.yml](https://github.com/EpicGames/lore/blob/HEAD/docs/developing/doc-standards/tools/vale/styles/Lore/PermissionVerbs.yml), [MkDocsAdmonitions.yml](https://github.com/EpicGames/lore/blob/HEAD/docs/developing/doc-standards/tools/vale/styles/Lore/MkDocsAdmonitions.yml).

## Spelling, without the noise

Lore switches Vale's built-in spelling rule off and replaces it with its own. The replacement keeps the default American English dictionary and adds filters for the token shapes technical writing is full of, each with a comment naming what it catches. Acronyms, identifiers in camel case and snake case, CLI flags, file extensions, version strings, and email-shaped tokens are never misspellings. The vocabulary file then holds only "a real word the docs use intentionally that the dictionary doesn't include", and its own header says so.

```yaml
extends: spelling
message: "Possible misspelling: '%s'."
level: warning
append: true
filters:
  # Uppercase acronyms (HTTP, YAML, ADR, JWT, mTLS, gRPC, QUIC, CRDT)
  - '[A-Z]{2,}[a-z]?[A-Z]?[A-Za-z]*'
  # camelCase and PascalCase identifiers (myFlag, MyStruct, RocksDB)
  - '[a-z]+[A-Z][a-zA-Z]+'
  # CLI flags and hyphenated slugs (--force, --max-redirects, lore-style)
  - '--?[a-zA-Z][a-zA-Z0-9-]+'
  # Semver-ish version strings (v0.5, 1.2.3)
  - 'v?\d+\.\d+(?:\.\d+)?(?:-\w+)?'
```

Source: [Spelling.yml](https://github.com/EpicGames/lore/blob/HEAD/docs/developing/doc-standards/tools/vale/styles/Lore/Spelling.yml).

## The exemptions are documented too

About thirty of the sixty-two rules derive from the Microsoft style guide, and two of those are switched off. The config does not just disable them; it says where the divergence is written down and warns against re-enabling either without updating that page. Lore puts a space on each side of a dash, and it allows a project-voice "we" for what the project decided or provides.

```ini
# Lore docs use a space before and after em/en dashes.
Lore.Dashes = NO

# Lore allows project-voice "we" / "our" / "us" — what the project
# decided, chose, recommends, provides, or did.
# (canon/language.md § Pronouns.)
Lore.We = NO
```

Then come the per-file exemptions, and they are the most honest part of the config. The canon documents the rules by showing wrong examples, so the page that bans Git terms must contain Git terms. Each exemption is scoped to one file and explains itself:

```ini
# canon/language.md documents the Lore.* prose rules. The "Wrong" column
# in each rule's example table contains the very forms the rule bans.
[**/language.md]
Lore.PermissionVerbs = NO
Lore.ProductNaming = NO
Lore.GitIsmFlagged = NO
Lore.PerforceIsmFlagged = NO
```

The FAQ gets the same care: its headings are questions, so the rules on heading punctuation, first person, and contractions are off for that one file, with the note that "rewording them would change the questions".

Source: [.vale.ini](https://github.com/EpicGames/lore/blob/HEAD/.vale.ini).

## How it runs

Not in CI, as far as the public workflows show. The gate is a script and a review. `scripts/docs-lint.sh` runs the three linters the docs standards name, Vale for prose, `markdownlint` for structure, and `lychee` for links, in sequence, continues through all three when one fails so every finding is seen, and prints a summary. Its exit codes are specified: zero when every linter that ran was clean, one when a linter reported findings, and two when a linter could not run or none is installed, because "a run with no signal isn't a clean check". A contributor with only some of the tools gets a warning for each missing one and results from the rest.

The recommended Vale invocation excludes the template files the link checker also skips:

```bash
vale --glob='!*-template.md' docs/
```

Source: [the doc-standards tools README](https://github.com/EpicGames/lore/blob/HEAD/docs/developing/doc-standards/tools/README.md).

## Key points

- **A `link:` on every rule**, pointing at the page that explains it. The rule becomes a pointer into the style guide instead of a verdict.
- **Substitute or flag, never both.** A term with one right answer gets a replacement; a term that needs judgment gets a message that names the options.
- **Exempt by file, and say why.** A style guide that shows wrong examples has to be exempt from itself, one file at a time, with the reason in the config.
- **Filter spelling by token shape** before adding words to a vocabulary. The vocabulary stays short and every entry in it is a real decision.
- **A regression rule for the last migration.** The syntax you moved away from is an error, so it stays gone.

Epic Games is on the [adopters page](/adopters) under Developer tools, with a link to this config. The next post in the series reads another team's setup the same way.
