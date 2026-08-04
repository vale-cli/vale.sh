---
name: vale-fix
description: Run Vale, fix error-level alerts, and open a pull request per file. Use when the user says "run vale", "fix vale errors", "lint the docs", "fix the linter", or "make vale pass". Fixes errors only; leaves warnings and suggestions for a person.
---

# Fix Vale alerts

## When to use this

The user asks to run Vale, fix its output, or make a lint job pass.

Do **not** trigger on prose edits alone. Editing a Markdown file is not a
request to lint the repository, and an unasked-for wave of style changes buried
in someone else's pull request is worse than the alerts.

## Prerequisites

Check these before doing any work, and stop with a plain message if one fails:

1. `vale --version` succeeds. If not, use the `vale-setup` skill.
2. A config exists — `vale ls-config` resolves without error.
3. The working tree is clean, or the user has said it is fine to branch from
   what is there.
4. You know which files to process. Ask if the user did not say.

## Scope

**Fix `error` level only, unless asked otherwise.** Vale's three levels are a
decision the project already made:

| level | meaning | this skill |
|---|---|---|
| `error` | the project decided this must not ship | fix |
| `warning` | worth a look in review | leave, report the count |
| `suggestion` | advisory | leave, report the count |

Only `error` sets a non-zero exit code, so this is also what makes a lint job
pass. Say at the start which level you are working at.

## Workflow

**1. Get the alerts as data.**

```bash
vale --output=JSON <path> > /tmp/vale.json
```

The default `CLI` output is aligned for reading and is not stable to parse.

**2. Keep only the errors.**

```bash
jq 'map_values(map(select(.Severity == "error"))) | with_entries(select(.value | length > 0))' /tmp/vale.json
```

If nothing is left, say so and stop. Do not go looking for warnings to fix
instead.

**3. Take each file on its own branch.**

```bash
git switch -c vale-fix-<file-stem>-<short-hash>
```

**4. Apply the fix the rule intends.** Each alert carries `Check`, `Message`,
`Line`, `Span`, and often `Action.Name` with `Action.Params` — the replacement
the rule itself defines. Prefer that over inventing wording from the message.

Preserve the markup exactly: AsciiDoc attributes, MDX expressions, reference
links, code fences, existing line breaks. Never reflow a paragraph to fix one
word.

**5. Verify.**

```bash
vale --output=JSON <file>
```

The error count should be zero and nothing new should appear. If an alert
cannot be fixed without changing meaning, leave it and say so in the pull
request.

**6. Commit and open one pull request per file**, following the repository's
own commit conventions. A hundred prose edits in one branch cannot be reviewed;
ten small ones can. In the body, list each fix as `line — rule — what changed`,
and note anything left unfixed and why.

**7. Report.**

```
Vale fix summary
================
Files processed:      3
Pull requests:        2
Clean already:        1
Errors fixed:         8
Left for a human:     2 (meaning would change)
Untouched by design:  14 warnings, 51 suggestions
```

## Fixing guidance

Most rules name their own replacement; these are the shapes that need judgment:

- **Wordiness** — "in order to" → "to", "utilize" → "use". Safe.
- **Passive voice** — "the button is clicked by the user" → "click the
  button". Check the actor is actually known before rewriting.
- **Heading punctuation, link text, capitalization** — mechanical, low risk.
- **Gendered terms** — "he/she" → "they". Safe, and check surrounding
  agreement.
- **Contractions** — whichever direction the project's style goes; do not
  switch a document's register halfway through.
- **Spelling** — a flagged product name is not a misspelling. Use the
  `vale-vocab` skill instead of editing the word.

## Do not

- **Do not silence a rule to make a run pass.** Turning off `Vale.Spelling`
  because it flags a product name is the wrong fix; so is disabling a rule the
  team chose. Changing the config is their decision, not yours.
- **Do not edit anything under `StylesPath`.** `vale sync` overwrites it.
- **Do not change what a sentence means** to satisfy a style rule. Technical
  accuracy wins; report the alert instead.
- **Do not fix warnings or suggestions** unless asked. They are advisory by the
  project's own choice.
