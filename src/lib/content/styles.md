---
title: Styles
description: Learn about the primary component of Vale's configuration system.
---

<script lang="ts">
    import Alert from '$lib/components/Alert.svelte';
    import RuleHeader from '$lib/components/docs/RuleHeader.svelte';
    import Checks from '$lib/components/docs/Checks.svelte';
    import ValeStyle from '$lib/components/docs/ValeStyle.svelte';
</script>

Vale has a powerful extension system that doesn't require knowledge of
any programming language. Instead, it uses collections of individual
[YAML](http://yaml.org) files (or "rules") to enforce particular writing
constructs.

```yaml
# An example rule from the "Microsoft" style.
extends: existence
message: "Don't use end punctuation in headings."
link: https://docs.microsoft.com/en-us/style-guide/punctuation/periods
nonword: true
level: warning
scope: heading
action:
  name: edit
  params:
    - remove
    - '.?!'
tokens:
  - '[a-z0-9][.?!](?:\\s|$)'
```

These collections are referred to as _styles_ and are organized in a
nested folder structure at a user-specified location. For example,

```console
$ tree styles
styles/
├── base/
│   ├── ComplexWords.yml
│   ├── SentenceLength.yml
│   ...
├── blog/
│   ├── TechTerms.yml
│   ...
└── docs/
├── Branding.yml
```

where _base_, _blog_, and _docs_ are your styles that each contain certain
rules.

## Rules

<Alert level="warning">
Make sure your rule files end in extension <code>.yml</code>. Do not end them
in <code>.yaml</code>, as Vale will not detect them.
</Alert>

The building blocks of styles are called _rules_ (YAML files ending in `.yml`),
which utilize _checks_ to perform specific tasks.

The structure of a rule consists header followed by check-specific
arguments. Every rule supports the following header fields:

<RuleHeader />

## Checks

Each rule _extends_ a specific check, which is a built-in function that
performs a particular task. For example, the `existence` check ensures that
a given pattern is present in the content.

<Checks />

## Regex

Many rules will require the use of regular expressions to match specific
patterns in your content. Vale uses [a superset][2] of Go's [regexp/syntax][1]
package to provide a powerful and flexible regex engine.

In addition to the standard Go regex syntax, Vale also supports positive
lookahead (`(?=re)`), negative lookahead (`(?!re)`), positive lookbehind
(`(?<=re)`), and negative lookbehind (`(?<!re)`).

See the [Regex](/docs/guides/regex) guide for more information.

## Vale

Vale comes with a single built-in style named `Vale` that implements a few
rules, as described in the table below.

<ValeStyle />

[1]: https://pkg.go.dev/regexp/syntax
[2]: https://github.com/dlclark/regexp2?tab=readme-ov-file#compare-regexp-and-regexp2
