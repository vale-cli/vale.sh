---
title: 'Introducing Std: The standard library for Vale'
description: 'General-purpose rules you extend to build your own style, extracted from the styles teams already run.'
date: '2026-09-02'
draft: true
motif: 'tree'
imageAlt: 'The Std directory tree, six rule families under one root, in a terminal window.'
---

Today, I'm pleased to announce [Std](https://github.com/vale-cli/Std), the standard library for Vale: general-purpose rules you extend to build your own style.

The motivation comes from the styles library itself. While surveying the published styles, I found the same rules implemented over and over. Google, Microsoft, and IBM each carry a serial-comma check, a passive-voice check, and a sentence-length check. Worse, the copies had drifted. Google's serial-comma rule gained a set of false-positive guards over the years. Microsoft's copy of the same rule never received them. A fix that lands in one copy of a shared rule fixes one style. Wouldn't it be nice if it fixed all of them?

Std is that shared copy. Every rule in it comes from a published style where it had already survived real use. It carries the machinery, with neutral messages at `suggestion` level. The opinions — levels, wording, documentation links — are yours to add.

```
Std/
├── Abbreviations/   Acronyms, Latin
├── DateTime/        DateFormat, TimeFormat
├── Grammar/         Contractions, PassiveVoice
├── Punctuation/     OxfordComma, Ellipses, Spacing
├── Readability/     SentenceLength
└── Usage/           FirstPersonSingular, FirstPersonPlural,
                     GenderedPronouns, GenderedTerms
```

Std ships alongside Vale v3.20, and it exercises the major features of that release. Each section below introduces one.

## The directory is the name

The first feature is nested rule directories. `Std/Grammar/PassiveVoice.yml` is `Std.Grammar.PassiveVoice` everywhere a rule name goes — alerts, config, `extends`. Styles used to be flat, so a library at this scale had to encode its taxonomy in file names. Now the tree is the taxonomy, and new families join it without renaming what exists.

## Every dial is addressable

The second feature is bracket parameters. Enabled stock, Std is a reasonable generic style. You can tune it from your config — levels and toggles as always, scalars with the bracket key:

```ini
Std.Readability.SentenceLength = error
Std.Readability.SentenceLength[max] = 30
Std.Usage.FirstPersonPlural = NO
```

Only scalar parameters are addressable this way — a `max`, a `min`, an `ignorecase`. A rule's structural keys, like its `tokens`, can't be changed from a config file. That's deliberate, because changing what a rule matches is a bigger act than turning a dial. It deserves a named file, which is what the next feature provides.

## Extend it

The last feature is rule inheritance. To change what a rule _matches_, extend it in a style of your own:

```yaml
# styles/House/OxfordComma.yml
extends: Std.Punctuation.OxfordComma
message: 'Serial comma, always.'
level: error
```

Three lines, your name on the alert, Std's machinery underneath — including every false-positive guard the parent ever gains. A child's keys replace the parent's outright. The `+` and `-` forms (`tokens+`, `tokens-`, `swap+`, `swap-`) edit a parent's lists instead, for when you want almost all of a rule.

[Voices](/blog/voices) is the first consumer: its `Direct.Length` rule is a three-line child of `Std.Readability.SentenceLength` with a sharper message and a lower ceiling. Any length rule you write can be the same three lines.

## Every rule carries its tests

Every rule in Std is tested, with a case that must trip it and a case that must stay clean. That second half matters more than it sounds. A Vale rule that matches nothing fails silently — it loads, runs, and reports success. A rule is only proven by a fixture that fires it. CI runs the whole set on every push, against a fresh build of Vale.

## Where the rules come from

A rule enters the library once it exists in two or more published styles, or has otherwise proven itself. Each file names its source — Google, Microsoft, IBM, all MIT — and [NOTICE](https://github.com/vale-cli/Std/blob/main/NOTICE) carries the full attribution.

## Conclusion

To try Std, add the package to your configuration and run `vale sync`:

```ini
Packages = https://github.com/vale-cli/Std/releases/latest/download/Std.zip

[*.md]
BasedOnStyles = Std
```

Std requires Vale v3.20.0, which ships everything above: nested rule directories, bracket parameters, and rule inheritance.

If you have any questions or run into any problems, feel free to open an issue at the [Std repository](https://github.com/vale-cli/Std).
