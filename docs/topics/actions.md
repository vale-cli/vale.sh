# Actions

Learn how a rule carries its own fix, and where that fix goes.

## [A fix beside the finding](actions.md#a-fix-beside-the-finding)

A rule says what is wrong. An action says what to do about it: the matched text becomes this instead. It is the part of a rule that an editor can apply with one keystroke, and that an agent can act on without deciding anything.

```yaml
extends: existence
message: "Don't use end punctuation in headings."
scope: heading
nonword: true
action:
  name: edit
  params:
    - trim_right
    - '.?!'
tokens:
  - '\w+[.?!]$'
```

Vale resolves the action when the rule fires, not when someone asks for the fix. Every alert carries both the recipe, `Action`, and the answer, `Suggestions`:

```json
{
  "Action": { "Name": "edit", "Params": ["trim_right", ".?!"] },
  "Suggestions": ["Overview"],
  "Check": "House.HeadingPunctuation",
  "Message": "Don't use end punctuation in headings.",
  "Match": "Overview.",
  "Line": 3,
  "Span": [3, 11]
}
```

The one exception is spelling. Ranking a dictionary against a word is real work, so a spelling rule's suggestions are computed when an editor asks for them, and its `Suggestions` list is empty in lint output.

## [The message](actions.md#the-message)

A message with two placeholders gets the match first and the fix second:

```yaml
message: "'%s' should be '%s'."
```

A rule whose action yields several suggestions sees them joined: `'colour' should be 'color or colors'`. A rule with no action gets the match alone, and a second placeholder stays empty.

## [The actions](actions.md#the-actions)

| Name                             | Description                                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [`replace`](../fixes/replace.md) | One or more replacements written into the rule. `substitution` and `capitalization` fill them in from their own entries.             |
| [`remove`](../fixes/remove.md)   | Delete the match.                                                                                                                    |
| [`edit`](../fixes/edit.md)       | Run the match through a pipeline of operations: rewriting, trimming, wrapping, and casing.                                           |
| [`convert`](../fixes/convert.md) | Change the case of the match.                                                                                                        |
| [`suggest`](../fixes/suggest.md) | Compute the replacements: spelling suggestions from the active dictionaries, or a Tengo script of your own.                           |

An `edit` with several steps is written as a list of lists, one per operation, and the result of each is the input to the next:

```yaml
action:
  name: edit
  params:
    - [trim_right, '!']
    - [lower]
    - [wrap, '`']
```

An argument can also name what the rule matched: `$1` is the first capture group of the token that fired, and `$0` is the whole match. A `replace` written as `'$2, $1'` reorders a name without a pattern of its own. See [the token's groups](../fixes/edit.md#the-tokens-groups).

Every action is checked when the rule loads. An unknown name, a missing parameter, an `edit` operation Vale does not have, or a `suggest` script that is not on disk is an `E201` error pointing at the rule file, not a surprise after the rule fires.

A `replace` action respects [`matchcase`](styles.md#the-header): with it set, `A-OK` written into the rule still suggests `a-ok` for `a ok`. The other actions produce their text from the match itself, so they already carry its case.

## [Where a fix goes](actions.md#where-a-fix-goes)

**The CLI** shows it in the message, as above, and in JSON output as `Suggestions`.

**Editors** get the fix as a quick fix through [`vale-ls`](../guides/lsp.md): a replacement to choose from, or a deletion. A `remove` applied from an editor takes one neighboring space with the word, so a deletion does not leave two behind.
