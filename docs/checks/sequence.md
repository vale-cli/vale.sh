# sequence

Learn about the sequence extension point.

| Name         | Type         | Description                                                              |
| ------------ | ------------ | ------------------------------------------------------------------------ |
| `tokens`     | `[]NLPToken` | A list of tokens with associated NLP metadata.                           |
| `ignorecase` | `bool`       | Makes all matches case-insensitive.                                      |
| `exceptions` | `[]string`   | Sentence regions, as regexes; a match beginning inside one is dropped. |

While most extension points focus on writing _style_, `sequence` aims to support grammar-focused rules.

```yaml
extends: sequence

# `%[4]s` is like `%s`, but specifically refers to the
# 4th token in our sequence.
message: |
  The infinitive '%[4]s' after 'be' requires 'to'.
  Did you mean '%[2]s %[3]s *to* %[4]s'?"
tokens:
  - tag: MD
  - pattern: be
  - tag: JJ
  # The `|` notation means that we'll accept `VB`
  # or `VBN` in position 4.
  - tag: VB|VBN
```

Every `sequence`-based rule is required to have at least one `pattern` (such as `pattern: be`, shown above). This becomes the “anchor” of the sequence: we find all instances of the first pattern and then check that the left- and right-hand sides of the sequence match.

Tokens judge the sentence one word at a time. When a rule needs a judgment about a *region* — for example, “the comma closing a fronted phrase isn’t a list comma” — hand that part to `exceptions`: each entry is a regular expression matched against the sentence, and a sequence match that begins inside one of its matches is dropped. Unlike other checks’ `exceptions`, these are regions rather than vocabulary terms, so the project’s accepted vocabulary is never merged in.

```yaml
# Skip matches that begin inside a fronted phrase.
exceptions:
  - '^(?i:(?:in|on|at|when|while|if)\b[^,]{0,60}),'
```

{% hint style="info" %}
`exceptions`, and the boundary behavior of `negate` described below, require Vale v3.20.0 or later.
{% endhint %}

Each entry in a sequence is known as an `NLPToken` and has the following structure:

```yaml
# [optional]: A regular expression (required
# if `tag` isn't given).
pattern: '...'

# [optional]: If true, indicates that we
# *shouldn't* match this token. A negated token at
# the start or end of a sequence is also satisfied
# by the sentence boundary itself: "not preceded by
# X" holds when nothing precedes the match at all.
negate: true # or false

# [optional]: A part-of-speech tag (required
# if `pattern` isn't given).
tag: '...'

# [optional]: An integer meaning that there may
# be up to `n` (3, in this case) tokens between
# this token and the next one.
skip: 3

# [optional]: How many times the token must occur --
# "at least two nouns", not just one. Each occurrence
# gets its own `skip` window, so `skip: 8, min: 2`
# reads "a noun within eight words, then another noun
# within eight words". The default is 1.
min: 2

# [optional]: A universal part-of-speech tag --
# NOUN, VERB, ADJ, and so on -- instead of a
# Penn Treebank `tag`. Universal tags are
# portable; Penn tags are more precise.
upos: '...'

# [optional]: If true, narrows the alert to this
# token alone. Without it, a match spans every
# token in the sequence -- marking one lets a rule
# require surrounding context while pointing at
# only the part the writer should change.
target: true # or false
```

`sequence`-based are [sentence-scoped](../topics/scopes.md). See [prose/tagging](https://github.com/jdkato/prose?tab=readme-ov-file#tagging) for a full list of supported part-of-speech tags.

{% hint style="info" %}
`min` requires Vale v3.19.0 or later.
{% endhint %}

`min` and `skip` combine to express "at least *n* occurrences within a window." For example, a pronoun is ambiguous when two or more nouns precede it:

```yaml
extends: sequence
message: "Avoid ambiguous pronouns."
level: warning
tokens:
  - tag: NN|NNP|NNPS|NNS
    skip: 8
    min: 2
  - pattern: \w+
    tag: PRP
    target: true
```

This matches "The dog chased the cat until **it** tired" — two nouns, then a pronoun — but not "The dog barked because it hungered." Without `skip`, `min` means consecutive occurrences: `tag: JJ, min: 2` is two adjectives in a row.

{% hint style="info" %}
Reaching every block, and honoring a declared `scope`, requires Vale v3.17.0 or later. Earlier versions read sentences from paragraphs only.
{% endhint %}

By default, a `sequence` rule reads sentences from **every** block—headings, list items, and table cells as well as paragraphs. Much of a document's prose lives outside its paragraphs, and `sequence` is the only extension point that reads part-of-speech data, so it needs to reach all of it.

To narrow that, declare a `scope`:

```yaml
extends: sequence
message: "matched '%s'"
level: error
# Only take sentences from headings.
scope: heading
tokens:
  - pattern: quick
  - pattern: brown
```

The scope selects which blocks the sentences are drawn from; the rule still matches sentence by sentence within them.
