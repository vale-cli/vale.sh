---
name: vale-setup
description: Install Vale, write a .vale.ini, download styles, and get a first clean run in a repository that has never used it.
---

# Set up Vale in this repository

Use when the repository has no `.vale.ini`, or has one that does not resolve.

## Steps

1. **Check for an existing config** before writing one. `.vale.ini`, `_vale.ini`,
   or a `vale` section in another file all count. If one exists, run
   `vale ls-config` and fix what it reports rather than starting over.

2. **Install Vale** if `vale --version` fails: `brew install vale`,
   `choco install vale`, or a release binary from
   <https://docs.vale.sh/topics/installation.md>.

3. **Identify what to lint.** Find the prose: `docs/`, `content/`, `*.md` at
   the root. Do not point Vale at the whole repository — vendored directories
   and generated reference pages produce alerts nobody will act on.

4. **Write `.vale.ini`** in the repository root:

   ```ini
   StylesPath = styles
   MinAlertLevel = suggestion

   Packages = Microsoft

   [*.md]
   BasedOnStyles = Vale, Microsoft
   ```

   Match the section glob to the formats actually present — `[*.{md,mdx}]`,
   `[*.adoc]`, `[*.rst]`. A section that matches nothing lints nothing, and
   Vale will not warn you about it.

5. **Add `StylesPath` to `.gitignore`.** It is build output.

6. **`vale sync`**, then lint one file to confirm the setup resolves.

7. **Report the first run honestly.** A large corpus commonly produces
   thousands of suggestions on day one. Say the number, and offer `vale-triage`
   rather than quietly raising `MinAlertLevel` to hide it.

## Do not

- Do not commit the `StylesPath` directory.
- Do not pick a style package for the project without asking. Microsoft and
  Google differ on things teams care about; the choice is theirs.
