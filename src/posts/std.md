---
title: 'Introducing Std: The standard library for Vale'
description: 'General-purpose rules you extend to build your own style, extracted from the styles teams already run.'
date: '2026-09-02'
motif: 'tree'
imageAlt: 'The Std directory tree, six rule families under one root, in a terminal window.'
---

<script>
  import Callout from '$lib/components/blog/Callout.svelte';
</script>

Today, I'm pleased to announce [Std](https://github.com/vale-cli/Std), the standard library for Vale: general-purpose rules you extend to build your own style.

The motivation comes from the styles library itself. While surveying the published styles, I found the same rules implemented over and over. Google and Microsoft each carry an Oxford-comma check, a passive-voice check, and a sentence-length check. Worse, the copies had drifted. Google's Oxford-comma rule gained a set of false-positive guards over the years. Microsoft's copy of the same rule never received them. A fix that lands in one copy of a shared rule fixes one style. Wouldn't it be nice if it fixed all of them?

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

The name is the path. The first segment is the style directory on your `StylesPath`, each subdirectory adds a segment, and the file's base name closes it. There is no depth limit, and the name you see in an alert is the path you would open to read the rule:

```
styles/
└── Std/
    ├── Grammar/
    │   └── PassiveVoice.yml      Std.Grammar.PassiveVoice
    ├── Punctuation/
    │   └── OxfordComma.yml       Std.Punctuation.OxfordComma
    └── Readability/
        └── SentenceLength.yml    Std.Readability.SentenceLength
```

One kind of directory is reserved. A name that starts with a dot or an underscore is skipped along with everything under it, so a draft or a retired rule can sit inside a style without loading.

## Every dial is addressable

The second feature is bracket parameters. Enabled stock, Std is a reasonable generic style. You can tune it from your config — levels and toggles as always, scalars with the bracket key that [PHP's `.ini` files](https://www.php.net/manual/en/function.parse-ini-file.php) use for the same job:

```ini
Std.Readability.SentenceLength = error
Std.Readability.SentenceLength[max] = 30
Std.Usage.FirstPersonPlural = NO
```

The word in brackets is the key as it appears in the rule's YAML, so any scalar a rule declares is a dial: a `max`, a `min`, an `ignorecase`. Two things separate a parameter from a level. A level belongs to the section it sits in, so the same rule can be an error for Markdown and a warning for HTML. A parameter is applied when the rule compiles and holds wherever the rule runs. And when two config files set the same parameter, the later one wins.

A rule's structural keys can't be changed this way. Its `tokens`, its `swap` table, its `message`, its `exceptions` — anything that is a list, a mapping, or the rule's own prose — is refused with a pointer to the right tool:

```console
$ vale ls-config
E201 Invalid value [/home/me/docs/.vale.ini:6:1]:

   5  BasedOnStyles = Std
   6* Std.Punctuation.OxfordComma[tokens] = x

'tokens' is not adjustable from configuration; extend 'Std.Punctuation.OxfordComma' in a style instead

Execution stopped with code 1.
```

A `level` in brackets is refused the same way, with a note to set it the classic way.

That's deliberate, because changing what a rule matches is a bigger act than turning a dial. It deserves a named file, which is what the next feature provides.

## Extend it

The last feature is rule inheritance. To change what a rule _matches_, extend it in a style of your own:

```yaml
# styles/House/OxfordComma.yml
extends: Std.Punctuation.OxfordComma
message: 'Oxford comma, always.'
level: error
```

Three lines, your name on the alert, Std's machinery underneath — including every false-positive guard the parent ever gains. An `extends` value with a dot in it names a rule rather than an extension point. The child starts from the parent's full definition and lays its own keys on top, and a child can itself be extended, up to ten rules deep.

A bare key replaces the parent's value outright. To edit a list instead, use the `+` and `-` forms:

```yaml
# styles/House/Hedging.yml
extends: Direct.Hedging
message: "We don't hedge."
tokens+:
  - perhaps the best answer is
tokens-:
  - one could argue
```

`tokens+` appends to the parent's list, and `tokens-` removes entries by their text. The same forms work on a mapping like `swap`, where `+` merges with the child's entries winning and `-` names the keys to drop. Removing something the parent doesn't have is an error, on purpose: if upstream renames or drops an entry your child was removing, you hear about it when the rule compiles instead of diverging silently. Scalars take only the bare form, and a file that writes both `tokens` and `tokens+` has asked to replace and edit at once, which is refused.

The parent has to be present on the `StylesPath`, not enabled. Inheritance is a file reference, and `vale sync` is what puts the file there. The one thing you can't extend is a `Vale.*` built-in, because those are generated at runtime and have no file.

[Voices](/blog/voices) is the first consumer: its `Direct.Length` rule is a three-line child of `Std.Readability.SentenceLength` with a sharper message and a lower ceiling. Any length rule you write can be the same three lines.

<Callout kind="note" title="Nothing special about Std">

It's a style directory like any other, and the three features belong to Vale, not to the library. Any style can nest its rules, any scalar in any rule is a dial, and any rule on your `StylesPath` can be a parent. A team can publish its house style as a package and let each project extend the rules it disagrees with, the same way Voices sits on Std. Std is only the first library written with that in mind.

</Callout>

## Where the rules come from

A rule enters the library once it exists in two or more published styles, or has otherwise proven itself. Each file names its source — Google and Microsoft, both MIT — and [NOTICE](https://github.com/vale-cli/Std/blob/main/NOTICE) carries the full attribution.

## Conclusion

To try Std, add the package to your configuration and run `vale sync`. That puts it on your `StylesPath`, which is all a parent needs to be. The style you enable is your own, and its first rule is the three-line child from above:

```yaml
# styles/House/OxfordComma.yml
extends: Std.Punctuation.OxfordComma
message: 'Oxford comma, always.'
level: error
```

```ini
Packages = Std

[*.md]
BasedOnStyles = House
```

Run it over a draft that reads "We ship the linter, the server and the docs together." and the alert that comes back is yours, with Std's pattern doing the matching:

```console
$ vale --output=line draft.md
draft.md:1:19:House.OxfordComma:Oxford comma, always.
```

Std's own message for that span names the missing comma and the word it belongs before. The child kept the match and replaced the words, which is the whole idea.

Enabling Std directly also works, as a generic starting point to tune from the config. But its job is to be extended.

Std requires Vale v3.20.0, which ships everything above: nested rule directories, bracket parameters, and rule inheritance.

If you have any questions or run into any problems, feel free to open an issue at the [Std repository](https://github.com/vale-cli/Std).
