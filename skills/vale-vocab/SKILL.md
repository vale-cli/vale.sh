---
name: vale-vocab
description: Add project terms to a Vale vocabulary so spell check accepts them, instead of disabling the rule.
---

# Teach Vale a project's own words

Use when `Vale.Spelling` flags product names, APIs, or jargon that are spelled
correctly for this project.

## Steps

1. **Create the vocabulary** if it does not exist. It lives *inside*
   `StylesPath` but is the one part of it that is yours:

   ```
   styles/config/vocabularies/<Project>/accept.txt
   styles/config/vocabularies/<Project>/reject.txt
   ```

2. **Name it in `.vale.ini`:**

   ```ini
   Vocab = <Project>
   ```

3. **Add one term per line** to `accept.txt`. Entries are case-sensitive
   regular expressions, so `Kubernetes` accepts that spelling and not
   `kubernetes` — which is usually what a project wants, because the casing is
   part of the name.

4. **Use `reject.txt` for terms the project has banned** — an old product name,
   a deprecated spelling. Rejected terms are flagged wherever they appear.

5. **Commit the vocabulary.** Unlike the rest of `StylesPath` it is source, and
   `vale sync` leaves it alone.

## Do not

- **Do not disable `Vale.Spelling`.** One unknown product name is not a reason
  to stop checking every other word in the repository.
- **Do not add a misspelling to `accept.txt` to clear an alert.** Check the
  term is actually how the project writes it — the vocabulary becomes the
  reference other tools and writers follow.
