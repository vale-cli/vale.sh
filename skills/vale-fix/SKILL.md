---
name: vale-fix
description: Fix Vale alerts in a file or directory, error-level first, preserving markup, one pull request per file.
---

# Fix Vale alerts

Use when asked to fix, clean up, or act on Vale output.

## Scope

**Fix `error` level by default.** Warnings and suggestions are advisory and
often deliberate; changing them wholesale produces a large diff nobody asked
for. Fix them only when asked, and say which level you are working at.

## Steps

1. **Get the alerts as data**, not as terminal output:

   ```bash
   vale --output=JSON <path> > /tmp/vale.json
   ```

   The default `CLI` format is aligned for reading and is not stable to parse.

2. **Work file by file.** For each file, apply the fix an alert names. Many
   rules carry one — `Action.Name` and `Action.Params` in the JSON are the
   replacement the rule intends.

3. **Preserve the markup.** These are not plain-text files: keep AsciiDoc
   attributes, MDX expressions, Markdown reference links, and code fences
   exactly as they were. Never reflow a paragraph to fix one word.

4. **Re-run Vale on the file** and confirm the count dropped and nothing new
   appeared.

5. **One pull request per file**, titled for the file. A hundred prose edits in
   one branch cannot be reviewed; ten small ones can.

## Do not

- **Do not silence a rule to make the run pass.** Turning off
  `Vale.Spelling` because it flags a product name is the wrong fix — use the
  `vale-vocab` skill. Turning off a rule the team chose needs their agreement,
  not yours.
- **Do not edit anything under `StylesPath`.** `vale sync` overwrites it.
- **Do not change meaning to satisfy a style rule.** If the only way to clear
  an alert is to say something different, leave it and report it.
