# existence

Learn about the existence extension point.

| Name         | Type    | Description                                                                                          |
| ------------ | ------- | ---------------------------------------------------------------------------------------------------- |
| `affix`      | `string`| Names an affix file, so a `word/FLAGS` token matches every form its flags name. See [Affix flags](#affix-flags). |
| `append`     | `bool`  | Adds `raw` to the end of `tokens`, assuming both are defined.                                        |
| `ignorecase` | `bool`  | Makes all matches case-insensitive.                                                                  |
| `nonword`    | `bool`  | Removes the default word boundaries (`\b`).                                                          |
| `action`     | `array` | Options for correcting matches, see the [actions](../topics/actions.md) section.                     |
| `raw`        | `array` | A list of tokens to be concatenated into a pattern.                                                  |
| `tokens`     | `array` | A list of tokens to be transformed into a non-capturing group.                                       |
| `exceptions` | `array` | An array of strings to be ignored.                                                                   |
| `vocab`      | `bool`  | If false, disables all active [vocabularies](../keys/vocabularies.md) for this rule (default: true). |

The most general extension point is existence. As its name implies, it looks for the “existence” of particular tokens.

```yaml
extends: existence
message: Consider removing '%s'
level: warning
ignorecase: true
tokens:
  - appears to be
  - arguably
```

> This is arguably the best option, and it appears to be stable.

```bash
test.md:1:9:style.Hedging:Consider removing 'arguably'
test.md:1:42:style.Hedging:Consider removing 'appears to be'
```

These tokens can be anything from simple phrases (as in the above example) to regular expressions—e.g., [the number of spaces between sentences](https://github.com/vale-cli/vale/blob/master/testdata/styles/demo/Spacing.yml) or [the position of punctuation after quotes](https://github.com/vale-cli/Google/blob/master/Google/Quotes.yml).

### [tokens](existence.md#tokens)

The most common entry point for this extension point is the `tokens` key, which is a list of strings or regular expressions to be transformed into a word-bounded, non-capturing group:

```yaml
tokens:
  - appears to be
  - arguably
```

Which, after compilation, becomes:

```regex
(?i)(?m)\b(?:appears to be|arguably)\b
```

This is a convenience feature to avoid having to write the same boilerplate for every token in a rule.

### [raw](existence.md#raw)

When you want more control over the regular expression, you can use the `raw` key instead:

```yaml
extends: existence
message: "Incorrect use of symbols in '%s'."
ignorecase: true
raw:
  - $[d]* ?(?:dollars|usd|us dollars)
```

This allows you to write more complex patterns without having to worry about any post-processing. Each entry in `raw` is concatenated with the previous entry, allowing for improved commenting and readability of complex patterns.

### [message](existence.md#message)

The `message` key is a string that will be used to generate the final message when a match is found. The (optional) `%s` placeholder will be replaced with the matched text. A rule with an [action](../topics/actions.md) may use a second `%s`, which is the fix.

## Affix flags

{% hint style="info" %}
Requires Vale v3.25.0 or later.
{% endhint %}

With `affix` set, a token written as `word/FLAGS` matches every form the Hunspell [affix flags](../guides/hunspell.md) name, instead of a hand-written pattern:

```yaml
extends: existence
message: Avoid '%s'.
affix: en_US-web
tokens:
  - leverage/DGS        # leverage, leveraged, leverages, leveraging
  - jump/DGS the gun    # jump the gun, jumped the gun, ...
```

In a phrase, each word with flags expands on its own, and the rest of the token is a pattern as usual. A `\b` on either side of a flagged word stays a word boundary.

`en_US-web` is the affix file of Vale's built-in dictionary. Any other name is looked up as a `.aff` file in `<StylesPath>/config/dictionaries/`, then in `$DICPATH`, as a spelling rule's [dictionaries](spelling.md) are.

In a rule that sets `affix`, an unescaped `/` in a space-separated word of a token separates the word from its flags, and the word must be plain text. Write a literal slash as `\/`: `and\/or`. A token without a slash is a pattern as usual.
