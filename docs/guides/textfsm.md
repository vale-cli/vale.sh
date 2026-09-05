# TextFSM

Learn how to lint plain text that has structure but no markup.

A commit message is a subject, a blank line, a body, and trailers. A subtitle file is a run of cues, each an index, a timing, and a line or two of text. A transcript is a series of turns, each opened by a name. None of that is markup, so Vale reads such a file as lines, and a rule has no way to say “the subject” or “the model’s turn.”

A `textfsm` [View](../topics/views.md) fixes that. It reads the file through a template in the form Google’s [TextFSM](https://github.com/google/textfsm/wiki/TextFSM) defined for parsing the output of network devices: a list of named values, then a state machine whose rules are regular expressions. What the template captures becomes [scopes](../topics/scopes.md), each placed at the line and column it came from, so a rule reaches the subject the way it reaches a heading and its alert lands where the text is.

Vale runs the template itself. Nothing needs installing, and the patterns use the same [regex](regex.md) dialect as every rule.

{% hint style="info" %}
Requires Vale v3.21.0 or later.
{% endhint %}

## A first template

Take the commit message. Three parts of it deserve rules of their own: the subject, the body, and the trailers at the end.

```
fix: report the shortfall at the scope that fell short.

Zero matches leave no occurence to point at, but the scope has a
position of its own.

Signed-off-by: Joseph Kato <j@example.com>
```

The View lives at `<StylesPath>/config/views/Commit.yml`:

```yaml
engine: textfsm
template: |
  Value Subject (.+)
  Value List Body (.*)
  Value List Trailer ([A-Z][\w-]+: .+)

  Start
    ^${Subject} -> Body

  Body
    ^${Trailer}
    ^${Body}
scopes:
  - name: subject
    expr: Subject

  - name: body
    expr: Body
    type: md

  - name: trailer
    expr: Trailer
```

Read the template from the top:

* Three `Value` lines declare what to capture: a name and the pattern that fills it. `Subject` keeps one line. `Body` and `Trailer` are `List` values, which keep every line they capture rather than the last.
* `Start` is the state reading begins in. Its one rule matches the first line, captures it as the subject, and moves to the `Body` state.
* In `Body`, each line is tried against the rules in order, and the first to match wins. A trailer looks like `Word: text`, so it’s tried first; anything else is body.

`${Subject}` stands for the value’s pattern and captures what it matches. The `->` says what happens on a match; a rule without one reads the next line in the same state.

The `scopes` then name the values to lint. `subject` and `trailer` are linted as plain text. `body` has `type: md`, so it’s parsed as Markdown and a rule scoped to `body` sees paragraphs and inline code the way it does in a `.md` file.

Wire the View to the file in `.vale.ini`. Sections match by path, so a file without an extension is fine:

```ini
[COMMIT_EDITMSG]
BasedOnStyles = Vale, House

View = Commit
```

A rule reaches a scope by name:

```yaml
extends: existence
message: "A subject line doesn't end with '%s'."
level: error
scope: subject
raw:
  - '\.$'
```

And the alerts land in the file, not in the value:

```
 COMMIT_EDITMSG
 1:55  error  A subject line doesn't end with '.'.  House.Subject
 3:23  error  Did you really mean 'occurence'?      Vale.Spelling
```

In a `commit-msg` hook, the message arrives on stdin. `--path` tells Vale which section applies:

```sh
#!/bin/sh
vale --path=COMMIT_EDITMSG < "$1"
```

## How a template is read

![The template as a state machine: Start moves to Body on a line matching Subject, capturing it; Body stays in Body on a Trailer or Body line, capturing one each; the record is emitted at the end of the file and each value becomes a scope.](../.gitbook/assets/textfsm-states.svg)

A template has two parts. The values come first, one per line, up to the first blank line. Each is `Value [options] Name (pattern)`, and a line starting with `#` is a comment. The states follow: a state is a name at the left margin, and its rules are the indented lines beneath it. Every template needs a `Start` state; `End` and `EOF` are reserved.

In the View’s YAML, the template is a block scalar (`|`), so backslashes in patterns need no escaping, and the indent under a state name is what marks a line as a rule.

Reading is one line at a time. The current state’s rules are tried in order, and the first to match decides what happens next. A line no rule matches is skipped: it captures nothing, the state stays the same, and the line lands in no scope.

A rule is `^pattern -> action`, where the action is any of the following, and `Line.Record` pairs are joined with a dot:

| Action | Effect |
| --- | --- |
| `Next` | Read the next line. The default. |
| `Continue` | Keep trying the rules below against the same line. A `Continue` rule can’t change state. |
| `Record` | Emit the captures in hand as a record and start a fresh one. |
| `NoRecord` | Emit nothing. The default. |
| `Clear` | Drop the captures in hand, except `Filldown` values. |
| `Clearall` | Drop every capture, `Filldown` values included. |
| `Error "message"` | Stop reading. Vale reports the message as an error against the View and exits. |
| A state name | Enter that state. `End` stops reading. |

On a match, the line’s captures are assigned first, then the record action runs, then the state changes. So a rule that both captures and says `Record` puts that line’s captures into the record it emits, and `Continue.Record` emits before the rules below capture into the fresh one.

The options on a `Value` line change what it keeps:

| Option | Effect |
| --- | --- |
| `List` | Every capture, in order, rather than the last one. |
| `Filldown` | The last capture carries into the next record until a new one replaces it. |
| `Required` | A record missing this value is dropped rather than emitted. |

`Key` and `Fillup` are accepted for compatibility with TextFSM and change nothing.

A record is emitted for each `Record` action, and the captures in hand at the end of the file are emitted as one more, `End` included. So a template that never says `Record` yields one record per file. An `EOF` state replaces that last record: `EOF` with a `^.* -> Record` rule keeps it, and `EOF` with no rules discards it.

In a pattern, `${Name}` or `$Name` stands for the value’s pattern and captures what it matches. Everything outside it is matched but not captured, which is how `^user: ${User}` keeps the label out of the scope. Start each rule with `^`, as TextFSM does; a rule without it matches anywhere in the line.

## From captures to scopes

Each scope’s `expr` names one of the template’s values, and Vale reports an error at startup if it doesn’t. The scope’s `name` is what a rule’s `scope` refers to, and `type` says how to parse the captured text: `md`, `adoc`, `html`, `rst`, or `org`. Without a `type`, the text is linted as plain lines.

Consecutive lines a `List` value captures are joined into one block, so a body reads as the paragraphs it is rather than one block per line. A gap between the lines starts a new block, and so does a change of column: a block is placed by one line and one column, so every line in it has to start where its first line does.

The blank line matters here. `(.*)` matches a blank line and captures it as empty, so the block continues and the paragraph break survives. `(.+)` doesn’t match a blank line, so the block ends and the next captured line starts another. For a body with `type: md`, `(.*)` gives one document with paragraphs, and `(.+)` gives one document per paragraph. Rules that count across a document, such as `occurrence` and `repetition`, see the difference.

A `textfsm` View takes the file over. A file the section matches is read by the template, whatever its extension, even when it’s `.md`. Only the values a scope names are linted; the rest of the file is never seen by a rule, unless the rule’s scope is `raw`, which still reads the whole file.

## One record per unit

A subtitle file is a run of cues, each an index, a timing line, and one or more lines of text, separated by blank lines. Only the text is prose:

```
1
00:00:01,000 --> 00:00:03,000
First cue, one line.

2
00:00:04,000 --> 00:00:06,000
Second cue,
which wraps.
```

The template walks a cue in three states, and the blank line that ends one emits a record and returns to `Start` for the next:

```yaml
engine: textfsm
template: |
  Value Index (\d+)
  Value Timing (\d\d:\d\d:\d\d,\d\d\d --> \d\d:\d\d:\d\d,\d\d\d.*)
  Value List Cue (.+)

  Start
    ^${Index}$ -> Timing

  Timing
    ^${Timing}$ -> Cue

  Cue
    ^$ -> Record Start
    ^${Cue}
scopes:
  - name: cue
    expr: Cue
```

`Index` and `Timing` are captured so that the template can tell where it is, but no scope names them, so no rule ever sees a timestamp. A rule scoped to `cue` runs over the text of each cue, and a two-line cue is one block at the line and column its first line starts on.

## One side of a conversation

A transcript alternates between a user and a model, and only one side is yours to lint:

```
user: Summarize the change in one line.
assistant: The linter now reports where a scope fell short.
It's worth noting that this only affects occurence rules.
user: Thanks, that's clear enuf.
```

A turn runs until the next label, so each state needs to know when the turn is over before it knows whose turn comes next:

```yaml
engine: textfsm
template: |
  Value List Assistant (.*)
  Value List User (.*)

  Start
    ^assistant: ${Assistant} -> Assistant
    ^user: ${User} -> User

  Assistant
    ^(?:user|assistant): -> Continue.Record
    ^assistant: ${Assistant}
    ^user: ${User} -> User
    ^${Assistant}

  User
    ^(?:user|assistant): -> Continue.Record
    ^user: ${User}
    ^assistant: ${Assistant} -> Assistant
    ^${User}
scopes:
  - name: assistant
    expr: Assistant
    type: md
```

The first rule in each state is the trick. It matches any label, captures nothing, emits the turn in hand as a record, and continues, so the rules below it capture the new turn into a fresh record. A line with no label is a continuation of whichever turn is open.

`User` is captured so the prompt’s lines have somewhere to go, but no scope names it, so the misspelling on the last line goes unreported:

```
 transcript.txt
 3:6   error  'worth noting' hedges, and this is the model's turn.  House.Assistant
 3:42  error  Did you really mean 'occurence'?                      Vale.Spelling
```

The column is the column of the capture, so an alert on the first line of a turn points past the label.

## Seeing what a template captured

A template can be right and still surprise you, because a line no rule matches vanishes without a word. The quickest way to see what a scope holds is a rule that reports every line of it:

```yaml
extends: existence
message: "captured '%s'"
level: suggestion
scope: cue
nonword: true
raw:
  - '(?m)^.+$'
```

Run with `--output=line` and each captured line is listed at its position:

```
sample.srt:3:1:Probe.Cue:captured 'First cue, one line.'
sample.srt:7:1:Probe.Cue:captured 'Second cue,'
sample.srt:8:1:Probe.Cue:captured 'which wraps.'
```

The `(?m)` matters: a block of joined lines is one value, and without the multiline flag `^` and `$` only match at its ends.

Delete the rule once the template does what you expect.
