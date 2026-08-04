---
name: vale-setup
description: Install Vale, write a .vale.ini, sync styles, and get a first run. Use when the user says "set up vale", "add vale", "add prose linting", or "lint our docs" in a repository that has no Vale config yet.
---

# Set up Vale in this repository

## When to use this

The repository has no `.vale.ini`, or has one that does not resolve. If a
working config already exists, the user probably wants `vale-fix` or
`vale-triage` instead — check before writing anything.

## Prerequisites

1. `vale ls-config` — if it resolves, a config already exists. Fix what it
   reports rather than starting over, and say that is what you are doing.
2. Know where the prose lives. Ask if it is not obvious.

## Workflow

**1. Install** if `vale --version` fails: `brew install vale`,
`choco install vale`, or a binary from
<https://docs.vale.sh/topics/installation.md>.

**2. Find the prose.** `docs/`, `content/`, `*.md` at the root. Do not point
Vale at the whole repository: vendored directories, changelogs and generated
reference pages produce alerts nobody will act on, and the first run is what
decides whether the team keeps it.

**3. Write `.vale.ini`** in the repository root:

```ini
StylesPath = styles
MinAlertLevel = suggestion

Packages = Microsoft

[*.md]
BasedOnStyles = Vale, Microsoft
```

Match the section glob to the formats actually present — `[*.{md,mdx}]`,
`[*.adoc]`, `[*.rst]`. A section that matches nothing lints nothing, and Vale
will not warn you about it.

**4. Ask before choosing the style package.** Microsoft and Google disagree
about things teams care about — contractions, headings, the Oxford comma. It is
their editorial decision, not a default you pick for them. The
<https://vale.sh/explorer> listing has the rest.

**5. Add `StylesPath` to `.gitignore`.** It is build output.

**6. `vale sync`, then lint one file** to confirm the setup resolves.

**7. Report the first run honestly.**

```
Vale setup summary
==================
Config:      .vale.ini  ([*.md] → Vale, Microsoft)
Styles:      styles/ (gitignored), 1 package synced
First run:   docs/ → 0 errors, 214 warnings, 1,988 suggestions
```

A large corpus commonly produces thousands of suggestions on day one. Say the
number, and offer `vale-triage`. Do not quietly raise `MinAlertLevel` to make
it look smaller.

## Do not

- Do not commit the `StylesPath` directory.
- Do not pick the style package without asking.
- Do not set `MinAlertLevel = error` to make the first run look clean. Nothing
  has been decided by hiding the output.
