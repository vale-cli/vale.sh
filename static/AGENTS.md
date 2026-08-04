# Vale — instructions for coding agents

Vale is a command-line linter for prose. It reads Markdown, AsciiDoc,
reStructuredText, HTML, and source-code comments, and reports style violations
against rules the project chooses.

Drop this file in the root of a repository so an agent working there can set
Vale up and run it without guessing. Everything below is the free, open-source
CLI; nothing here needs an account.

## Setting it up

Four steps. Do them in order — `vale sync` fails without a config, and linting
fails without styles.

**1. Install.**

```bash
brew install vale          # macOS, Linux
choco install vale         # Windows
```

Other package managers, and the binaries, are at
<https://docs.vale.sh/topics/installation.md>. Confirm with `vale --version`.

**2. Write `.vale.ini` in the repository root.**

```ini
StylesPath = styles
MinAlertLevel = suggestion

Packages = Microsoft

[*.md]
BasedOnStyles = Vale, Microsoft
```

- `StylesPath` is where downloaded styles land. **Add it to `.gitignore`** —
  it is build output, and editing anything inside it is pointless because
  `vale sync` overwrites the directory.
- `Packages` names what to download. `Microsoft` and `Google` are the common
  starting points; the rest are at <https://vale.sh/explorer>.
- `[*.md]` is a glob. Styles listed under it apply to files it matches, so a
  repository with `.adoc` or `.rst` files needs a section for those too.
- `Vale` is built in and needs no package.

**3. Download the styles.**

```bash
vale sync
```

Re-run it whenever `Packages` changes. Without it, linting fails with an
unresolved-style error rather than silently skipping.

**4. Lint.**

```bash
vale README.md      # one file
vale docs/          # a directory
vale --glob='*.md' .
```

## Running it as an agent

Use `--output=JSON` when you intend to parse the result. The default `CLI`
output is aligned for a terminal and is not stable to scrape:

```bash
vale --output=JSON docs/
```

`--output=line` gives one `path:line:col:rule:message` per alert, which is
easier to read in a diff or a comment than JSON.

Two flags worth knowing when the run has to be reproducible:

- `--no-global` ignores the machine's own Vale config, so the result depends
  only on the repository.
- `--config=<path>` selects a config explicitly rather than searching upward
  from the file being linted.

## What to know before changing anything

**Only `error` sets a non-zero exit code.** Warnings and suggestions exit 0. A
CI job that "passes" may still have reported a hundred alerts, so check the
output rather than the exit status unless the project has deliberately set
everything it cares about to `error`.

**An alert names the rule that fired**, as `Style.Rule` —
`Microsoft.Wordiness`, `Vale.Spelling`. That name is how you turn one off:

```ini
[*.md]
BasedOnStyles = Vale, Microsoft

Microsoft.Wordiness = NO
```

Turn a rule off in the config when it is wrong for the whole project. For a
single passage, use a comment in the file instead:

```markdown
<!-- vale off -->
Text Vale should ignore.
<!-- vale on -->
```

**Do not silence a rule to make a run pass.** Fixing the prose is the point of
the tool; disabling `Vale.Spelling` because a product name trips it is the
wrong fix. Add the term to a vocabulary:

```
styles/config/vocabularies/Project/accept.txt
```

one term per line, and name it in the config with `Vocab = Project`. Terms in
`accept.txt` are accepted everywhere; `reject.txt` beside it flags terms the
project has banned. The vocabulary directory is the one part of `StylesPath`
that is yours and survives `vale sync`.

**`MinAlertLevel` filters what is reported, not what is checked.** Raising it
to `error` hides suggestions; it does not make the run faster.

## Looking something up

The documentation is written to be read by agents.

- Any page is available as Markdown by appending `.md` to its URL:
  <https://docs.vale.sh/topics/quickstart.md>
- The full index is at <https://docs.vale.sh/llms.txt>, and every page
  concatenated is at <https://docs.vale.sh/llms-full.txt>.
- A page answers questions directly. `GET` it with an `ask` parameter and it
  returns an answer with sources, rather than the whole page:

  ```
  https://docs.vale.sh/topics/quickstart.md?ask=how%20do%20I%20lint%20AsciiDoc
  ```

Reach for `ask` when the answer is not on the page in front of you; it is
cheaper than fetching several pages and reading them all.

## Writing rules

A project's own rules live in `styles/<Project>/*.yml` and are named in
`BasedOnStyles` like any package. Start from the check reference —
<https://docs.vale.sh/checks/existence.md> and its siblings — and note that
`vale sync` does not touch a directory it did not download, so hand-written
rules are safe there.
