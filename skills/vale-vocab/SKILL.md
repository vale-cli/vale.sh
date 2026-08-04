---
name: vale-vocab
description: Add project terms to a Vale vocabulary so spell check accepts them. Use when the user says "vale doesn't know our product name", "stop flagging this word", or spelling alerts are firing on correct terms.
---

# Teach Vale a project's own words

## When to use this

`Vale.Spelling` is flagging terms that are spelled correctly for this
project — product names, APIs, jargon.

The alternative someone will otherwise reach for is disabling spell check
entirely, which stops checking every other word in the repository over one
proper noun.

## Prerequisites

1. `vale ls-config` resolves and shows a `StylesPath`.
2. The flagged terms really are the project's spelling. Check the docs or the
   product itself — the vocabulary becomes the reference everyone else follows.

## Workflow

**1. Collect the terms Vale is actually flagging**, rather than guessing:

```bash
vale --output=JSON <path> | jq -r '.[][] | select(.Check == "Vale.Spelling") | .Match' | sort | uniq -c | sort -rn
```

**2. Create the vocabulary.** It lives inside `StylesPath` but is the one part
of it that is yours and survives `vale sync`:

```
styles/config/vocabularies/<Project>/accept.txt
styles/config/vocabularies/<Project>/reject.txt
```

**3. Name it in `.vale.ini`:**

```ini
Vocab = <Project>
```

**4. Add one term per line** to `accept.txt`. Entries are case-sensitive
regular expressions, so `Kubernetes` accepts that spelling and not
`kubernetes` — usually what a project wants, because the casing is part of the
name.

**5. Use `reject.txt`** for terms the project has banned: an old product name,
a deprecated spelling. Rejected terms are flagged wherever they appear.

**6. Re-run** and report what is left.

**7. Commit the vocabulary.** Unlike the rest of `StylesPath`, it is source.

## Do not

- **Do not disable `Vale.Spelling`.** One unknown product name is not a reason
  to stop checking the repository.
- **Do not add a misspelling to `accept.txt`** to clear an alert. If the term is
  wrong, fix the prose.
- **Do not bulk-add every flagged token.** Read the list first; some of them
  are genuine typos, and that is the point of the rule.
