# AI review

Use Vale beside an AI reviewer, with each one doing the checks it is built for.

An AI reviewer reads a pull request the way an editor does. It comments on a paragraph that buries its point, an example that no longer matches the text, a sentence a newcomer would read two ways. Vale doesn't do that, and isn't meant to. Vale checks the rules you can write down: the product name spelled one way, the phrase your style guide bans, heading case, a term that belongs in a vocabulary. Most teams want both kinds of check, and they work best when each is given the job it does well.

## [What each one is for](ai-review.md#what-each-one-is-for)

|                                            | Vale                                       | AI reviewer                                                  |
| ------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------ |
| Same input, same result                    | Yes                                        | No                                                           |
| Time to a result                           | Seconds, on every push                     | Minutes, sometimes longer                                    |
| Pull requests from forks                   | Runs with no secrets                       | Needs an API key, which forks don't get                      |
| Can fail a check and block a merge         | Yes, on `error`-level alerts               | Not reliably: a check that fails at random gets switched off |
| Cost per run                               | None                                       | Paid per token                                               |
| Text leaves the machine                    | No                                         | Yes, to the model's provider                                 |
| Runs in the editor, as you type            | Yes, through the [language server](lsp.md) | Not usually                                                  |
| Judges clarity, tone, and structure        | No                                         | Yes                                                          |
| Catches a wrong word that is spelled right | Only with a rule for it                    | Often                                                        |
| Rewrites a sentence                        | Only the fix a rule carries                | Yes                                                          |

The first seven rows are what makes a check something a team can depend on. A check that blocks a merge has to give the same answer every time, or people learn to re-run it until it passes and then switch it off. The last three are what a rule can't do: a rule matches a pattern, and "this paragraph is hard to follow" isn't one.

## [Splitting a style guide](ai-review.md#splitting-a-style-guide)

Go through your style guide one rule at a time, and ask whether a person could check it without reading for meaning.

- **Give it to Vale** if it names exact words or a pattern. "Write _sign in_, not _login_, as a verb." "Don't use _simply_ or _just_." "Headings use sentence case." "Spell it _GitHub_." These are [substitution](../checks/substitution.md), [existence](../checks/existence.md), and [capitalization](../checks/capitalization.md) rules, and a [vocabulary](../keys/vocabularies.md) for your terms.
- **Give it to the reviewer** if it needs a reader. "Lead with what the reader can do." "One idea per paragraph." "Explain why before how." "Examples should run as written."
- **Give both a part** if it has a pattern and an exception. "Avoid passive voice" is a Vale rule at `suggestion` level, which a person or the reviewer can overrule where the passive is the right choice.

The `from-guide` [skill](agents.md#skills) does the first pass for you: it turns a written style guide into rules, each tested against the guide's own examples, and lists the statements it couldn't check as needing a person. That list is what the reviewer's instructions should cover.

## [Running both](ai-review.md#running-both)

Run Vale on every pull request and let it fail the check on `error`-level alerts. Run the reviewer as an advisory comment, and give it Vale's results so it doesn't spend its review on what Vale has already reported.

### [Vale in CI](ai-review.md#vale-in-ci)

```yaml
name: Docs
on: pull_request

jobs:
  vale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vale-cli/vale-action@v3
        with:
          files: docs
          fail_on_error: true
```

This workflow needs no secrets, so it runs the same way on a pull request from a fork as on one from your own branch. Only `error` sets a non-zero exit code, so decide which rules are `error`: the ones that should stop a merge, such as a product name or a banned term. Leave the rest at `warning` or `suggestion`, where they show up as comments but don't block.

### [Vale's results for the reviewer](ai-review.md#vales-results-for-the-reviewer)

Vale's JSON output is the format to hand a model:

```bash
vale --output=JSON docs/ > vale.json
```

Each alert carries its file, line, rule name, severity, and message. Pass the file to the reviewer with an instruction such as:

```text
vale.json lists the style issues Vale has already reported on this pull request.
Don't repeat them. Review what a rule can't check: clarity, structure, accuracy
of examples, and whether the change does what its description says.
```

The reviewer's comments then cover what Vale couldn't, and the two don't argue about the same comma.

### [One source for both](ai-review.md#one-source-for-both)

If the reviewer reads a style guide and Vale reads a configuration, the two drift apart. Keep the configuration as the source, and generate the readable guide from it with the `write-guide` [skill](agents.md#skills). Give that guide to the reviewer. When a rule changes, both change with it.

## [Moving a rule from one to the other](ai-review.md#moving-a-rule-from-one-to-the-other)

The split isn't fixed. Two signs tell you to move a check.

- **The reviewer makes the same comment again and again.** If it keeps flagging _e.g._ in running text, or the old product name, the check has a pattern, and a rule makes it instant, free, and the same every time. Write it with the `rule` [skill](agents.md#skills) and prove it with `vale test`.
- **A Vale rule keeps flagging text that's fine.** If people switch it off with comments more often than they act on it, the check needs judgment. Lower it to `suggestion`, or take it out and add it to the reviewer's instructions.

## [When an AI reviewer is enough](ai-review.md#when-an-ai-reviewer-is-enough)

A small project with no fixed terminology, no external contributors, and no need to block a merge may get everything it needs from a reviewer alone. Vale earns its place when a rule has to hold every time: a name, a legal phrase, a term a translation memory depends on, or a check that has to pass before a release.

## [Checking what a model writes](ai-review.md#checking-what-a-model-writes)

An AI reviewer checks what people write. When a model writes the draft, Vale can check that too. [Agents](agents.md) covers styles for a model's own prose, such as Voices, and the hook that lints each file as an assistant writes it.
