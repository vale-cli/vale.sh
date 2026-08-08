# FAQ

Answers to questions Vale users ask most often.

{% hint style="info" %}
If none of these covers your case, ask in [Discord](https://discord.gg/tPeMs4A).
{% endhint %}

## Scopes and markup

### When should I use the `raw` scope?

Use it only when a rule needs to match markup *syntax* itself — an asterisk, a link target, a heading tag. Everything else should use a normal scope.

`raw` gives a rule the unprocessed file contents, which means no scope-related feature applies to it. That is the point of the scope, and also its cost.

### Why doesn't my `raw` rule skip code blocks?

Because `raw` bypasses the processing that skips them. Vale already ignores listing blocks and inline literals by default, so a rule like this fires inside code you meant to exclude:

```yaml
extends: existence
message: "Use uppercase letters for hexadecimal numbers"
scope: raw
level: error
raw: '\b0x[0-9a-f]*[a-f][0-9a-f]*\b'
```

Remove `scope: raw` and it behaves as intended:

```yaml
extends: existence
message: "Use uppercase letters for hexadecimal numbers"
level: error
raw: '\b0x[0-9a-f]*[a-f][0-9a-f]*\b'
```

### Why can't I disable a `raw` rule with a comment?

Comment processing happens after a document is converted to HTML, and `raw` rules don't run on the converted document. No markup-related feature — comments, ignore patterns — reaches them.

This is another reason to reach for `raw` only when targeting markup syntax.

### How do I turn a rule off for one paragraph?

Use [markup-based configuration](../topics/styles.md):

```markdown
<!-- vale Custom.spelling = NO -->

The three pillars of Developer Relations are **C**ommunity, **C**ontent, and **C**ode, also known as the 3Cs.

<!-- vale Custom.spelling = YES -->
```

### How do I check whether a word is italicized?

Target the markup with `raw`:

```yaml
extends: existence
message: "'%s' shouldn't be italicized."
scope: raw
nonword: true
tokens:
  - '\*(?:word1|word2)\*'
```

### How do I check that an image has alt text?

A `raw`-scoped rule can match the empty-alt form:

```yaml
extends: existence
message: "'%s' does not have an alt text."
level: warning
scope: raw
raw:
  - '!\[\]\(.+\)'
```

### How do I stop Vale spell-checking image alt text?

When AsciiDoc images have no explicit alt text, Asciidoctor derives one from the file path, and Vale then checks it. A [`TokenIgnores`](../keys/tokenignores.md) pattern skips them:

```ini
[*.adoc]
TokenIgnores = (image::.+\[\])
```

Providing real alt text is the better fix.

### Why doesn't `TokenIgnores` work on AsciiDoc cross-references?

Because the text Vale sees is the rendered link text, not the source. This cross-reference:

```html
<p>See <a href="#ecc_memsys_error_path">Subchapter</a> for more.</p>
```

lints "Subchapter". Without a label, it lints the anchor name instead:

```html
<p>See <a href="#ecc_memsys_error_path">[ecc_memsys_error_path]</a> for more.</p>
```

Give the reference a label suited to linting:

```asciidoc
See <<ecc_memsys_error_path,My Label>> for more.
```

### How do I ignore a reStructuredText directive?

With a [`BlockIgnores`](../keys/blockignores.md) pattern:

```ini
[*]
BasedOnStyles = Vale

BlockIgnores = (?s) *(\.\. math::)
```

### Why doesn't `occurrence` count across the whole document?

`occurrence` counts within each block that the scope matches. With `scope: heading`, this checks whether the token appears twice *in a single heading*:

```yaml
extends: occurrence
message: "Problem description is missing"
ignorecase: true
scope: heading
level: error
min: 1
max: 1
token: "problem description"
```

To count across the document, widen the scope and match the markup:

```yaml
extends: occurrence
message: "Problem description heading does not occur exactly once"
ignorecase: true
scope: raw
level: error
min: 1
max: 1
token: "<h[1-9]>problem description"
```

### How do I lint a `.txt` file as reStructuredText?

Use a [format association](../topics/styles.md):

```ini
[formats]
txt = rst
```

The `--ext` flag also works, but only from the command line and only for single-file or all-`rst` input. A format association applies everywhere, including editor extensions and mixed-format runs.

### How do I get markup features in source-code comments?

Assign an embedded markup syntax to the format, then use the markup keys as normal:

```ini
[formats]
# Treat .cc comments as Markdown
cc = md

[*.cc]
# You then have access to all markup-related features,
# such as TokenIgnores and BlockIgnores.
TokenIgnores = (\\c \w+)
```

### How do I lint YAML?

Write a [view](../topics/views.md) that extracts the fields you care about:

```yaml
engine: dasel
scopes:
  - name: chapter.title
    expr: chapters.all().title

  - name: chapter.goal
    expr: chapters.all().goal
    # Long form content (`|-`) might contain markup?
    type: md

  - name: section.objective
    # objectives can be empty
    expr: chapters.all().topics.all().sections.all().objectives?.all()
```

Rules can then target those scopes individually:

```yaml
extends: existence
message: "'%s' should be capitalized"
scope: chapter.title
raw:
  - "^[a-z].+"
```

Your default `text`-scoped rules run on them too.

### Why don't `IgnoredScopes` and `TokenIgnores` work on my file?

They apply only to [supported formats](../formats/). For anything else, Vale has no markup to reason about, so there is nothing for those keys to select.

The other cause is a section that doesn't match the file. A section names files as they are on disk, so a [format association](../topics/.vale.ini.md#format-associations) doesn't make `[*.md]` reach a `.qmd`—that needs `[*.qmd]`. A section keyed on a path needs to be written relative to where you run Vale.

### Can Vale lint the URL inside a link?

No. There is no scope more specific than `raw` for this, and matching a link target reliably from raw text is difficult because the scope is so wide.

Checking link targets is closer to what a format-specific tool does than to prose linting.

### Can I enforce a reference style in AsciiDoc?

Yes, with `scope: raw`, since the rule needs to see the markup itself. There are AsciiDoc-specific examples in [rohennes/vale-asciidoc](https://github.com/rohennes/vale-asciidoc).

### How does Vale parse AsciiDoc?

It doesn't. Vale operates on the HTML that Asciidoctor produces.

### How do I set Asciidoctor up as the parser?

Make sure `asciidoctor` is on your `$PATH`. Any standard installation puts it there.

### Where does Vale look for a global config on Windows?

`%UserProfile%`, as [Go's `UserHomeDir`](https://pkg.go.dev/os#UserHomeDir) defines it.

### How does Vale split text into tokens?

It depends on the rule's `extends` value and its `scope`. The matching process for `existence` is described on its [reference page](../checks/existence.md), and by default a rule sees text with markup syntax removed.

[Vale Studio](https://studio.vale.sh) shows the final regex a rule compiles to, which is usually the fastest way to understand a surprising match.

## Writing rules

### How do I disable a single rule?

Permanently, set it to `NO` in your `.vale.ini`:

```ini
Google.DateFormat = NO
```

For a one-off run, use a [filter](../topics/filters.md):

```console
$ vale --filter='.Name != "demo.Cap"'
```

### How do I disable rules for one sub-directory?

To skip a directory entirely, use `--glob`.

To change configuration for it, add a section to the root `.vale.ini` — you don't need a second config file:

```ini
StylesPath = vale-styles

Packages = Hugo, Microsoft

[*.md]
MinAlertLevel = suggestion
BasedOnStyles = Vale, Microsoft

[content/bad/*.md]
Microsoft.Contractions = NO
Microsoft.We = NO
Vale.Spelling = NO
```

### Can I use lookarounds in a pattern?

Yes, in `existence`-based rules, since v2.9.0.

### Why doesn't my `sequence` rule match?

Two mistakes are common. `pos` is not a supported key — the key is `tag` — and `^` matches the start of a *line*, not a sentence. A working version:

```yaml
extends: sequence
message: "Sentence should not start with a preposition."
tokens:
  - pattern: '[A-Z][a-z]+'
    tag: PRP
```

### How do I match a word only when it isn't followed by a noun?

Negate the final token:

```yaml
extends: sequence
message: "Don't use '%s'."
tokens:
  - pattern: following
  - tag: NN|NNS|NNP|NNPS
    negate: true
```

### Can a `conditional` rule accept plurals?

Yes — write the plural into both patterns:

```yaml
extends: conditional
message: "'%s' has no definition"
level: error
ignorecase: false
first: '\b([A-Z]{3,5})(?=s\b|\b)'
second: '(?:\b[A-Z][a-z]+ )+\(([A-Z]{3,5})s?\)'
```

### Can I flag a variable that's imported but never used?

It's better suited to a syntax linter, but it is possible:

```yaml
extends: conditional
message: "'%s' has been imported but not used."
level: error
scope: raw
first: "(?<=import )(.*)(?= from)"
second: '(?<=<)(\w+)'
```

### How do I stop a `substitution` rule firing on valid phrasing?

Exclude the valid forms with a lookbehind:

```yaml
swap:
  (?<!when |initial |a |default |root |your )login: log in
  you login: you log in
  log into: log in to
  logout (?:off|from): log out of
  logging into: logging in to
  logging out from: logging out of
```

### Why doesn't my pattern match next to punctuation?

Vale adds word boundaries (`\b`) automatically, which interferes with patterns that need to match punctuation. Set `nonword: true` to turn that off — see [`substitution`](../checks/substitution.md).

### Why doesn't `repetition` catch "text text."?

The trailing punctuation makes the two tokens different: `text` is not `text.`. Adjust the pattern to exclude it:

```yaml
extends: repetition
message: "'%s' is repeated!"
level: error
alpha: true
tokens:
  - '[^\s.!?,]+'
```

### How do I match a word only when it starts a sentence?

Combine a scope with a lookbehind:

```yaml
extends: existence
message: "'%s' should only be capitalized when starting a sentence."
level: error
nonword: true
scope:
  - heading
  - list
  - sentence
tokens:
  - (?<=\s)Internet(?! Service Provider| Protocol)
```

### Can I use the same `%s` twice in a message?

Yes, by index:

```yaml
message: "Avoid the use of '%s' on weekdays. Only use '%[1]s' on weekends."
```

### How do I replace a capture group with its uppercase form?

Substitution can't transform a match, so use a [script fix](../fixes/suggest.md).

### How strict should `capitalization` be?

`1.0` is the strictest setting. At that level, expect to maintain a [vocabulary](../keys/vocabularies.md) so brand and product names don't raise false positives.

## Vocabularies and spelling

### What's the difference between `Vale.Spelling` and `spelling`?

They are the same thing: `Vale.Spelling` is an implementation of the [`spelling`](../checks/spelling.md) check that uses the built-in dictionary. Write your own `spelling`-based rule only when you need a custom Hunspell dictionary — another language, or one of your own — and then use it *instead of* `Vale.Spelling`, not alongside it.

### How do I accept a multi-word phrase?

Spell check is a single-word operation, so a phrase needs two rules. First, stop the unusual word raising a spelling error:

```yaml
extends: spelling
message: "Did you really mean '%s'?"
level: error
filters:
  - '[Bb]ananaz'
```

Then enforce the phrase itself:

```yaml
extends: substitution
message: "Use '%s' instead of '%s'"
level: error
ignorecase: false
swap:
  # This will catch cases like "Blue Bananaz", "Yellow bananaz", etc.
  '(?:[^\s]*) ?[Bb]ananaz': Yellow Bananaz
```

### How do I accept a term without accepting it in handles and emails?

Make the vocabulary entry case-sensitive:

```
(?-i)Vaadin
```

`Vaadin` then passes `Vale.Spelling`, while `@vaadin` doesn't gain a case suggestion.

### Why doesn't my `accept.txt` entry work?

Entries are regular expressions, so a pattern that looks right may match nothing. `[dD]eserializer(s)` requires a literal `s`; you almost certainly want `[dD]eserializers?`.

### Why does adding a word to `accept.txt` stop my other rules firing on it?

A vocabulary entry is a global exception — every rule honours it. To except a word from one rule only, add it to that rule instead of the vocabulary.

### Can I change the wording of a spelling message?

Yes. Write your own rule that extends [`spelling`](../checks/spelling.md) with the message you want.

### Why are both "favour" and "favor" accepted?

Both spellings are in Vale's default dictionary. For a single-variant check, supply a [custom dictionary](hunspell.md).

### How do I ship vocabularies in a package?

`Vocab` is a global setting, and the vocabulary rules need the `Vale` style enabled:

```ini
StylesPath = vale/styles
MinAlertLevel = suggestion

Packages = https://github.com/spectrocloud/spectro-vale-pkg/releases/latest/download/spectrocloud-docs-internal.zip

# `Vocab` is a global setting
Vocab = spectrocloud-vocab

[*.md]
# The vocab rules, `Vale.Avoid` and `Vale.Terms`, require the `Vale` style to be enabled.
BasedOnStyles = Vale, spectrocloud-docs-internal
```

### How do I structure a package containing scripts and dictionaries?

From v3.0, every non-style resource lives under `<StylesPath>/config`:

```console
$ tree -a MyPackage
MyPackage
├── .vale.ini
└── styles
    ├── MyStyle
    │   └── MyRule.yml
    └── config
        ├── dictionaries
        │   └── MyDic.dic
        ├── scripts
        │   └── MyScript.tengo
        └── vocabularies
            └── MyVocab
                ├── accept.txt
                └── reject.txt
```

## Configuration and packages

### Why does `vale sync` fail with a `mkdir` error?

The directory named by [`StylesPath`](../keys/stylespath.md) has to exist before you sync:

```ini
StylesPath = a/path/to/an/existing/folder
```

### How do I override an entry in an inherited style?

Add the term to a [vocabulary](../keys/vocabularies.md); vocabulary entries take precedence over an inherited rule's list.

## CI and editors

### Can I report every alert but only fail on some files?

Not with a built-in option. Take Vale's JSON output and set the exit code from the file paths in it.

## Other

### How do I enforce one sentence per line?

```yaml
extends: occurrence
message: "Only use one sentence per line."
level: error
scope: paragraph
max: 1
token: '[.!?](?: |$)'
```

A [script](../checks/script.md) rule gives finer control.

### Does Vale know parts of speech?

Yes — the [`sequence`](../checks/sequence.md) check matches on part-of-speech tags. The [Package Explorer](https://vale.sh/explorer) has working examples.
