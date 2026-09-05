# Front Matter

Learn how Vale handles front matter.

Front matter is linted in Markdown and its dialects (MDX, MyST, Quarto, R Markdown), AsciiDoc, reStructuredText, Org, Typst, and QDoc files.

There are 3 supported front matter types – YAML, TOML, and JSON. Each is recognized by the delimiters that open and close it:

{% tabs %}
{% tab title="YAML" %}
Opening and closing `---` lines:

```yaml
---
name: "frontmatter"
---
rest of the content
```

Or an opening `---yaml` line with a closing `---`:

```yaml
---yaml
name: "frontmatter"
---
rest of the content
```
{% endtab %}

{% tab title="TOML" %}
Opening and closing `+++` lines:

```toml
+++
name = "frontmatter"
+++
rest of the content
```

Or an opening `---toml` line with a closing `---`:

```toml
---toml
name = "frontmatter"
---
rest of the content
```
{% endtab %}

{% tab title="JSON" %}
Opening and closing `;;;` lines:

```json
;;;
{
    "name": "frontmatter"
}
;;;
rest of the content
```

Or an opening `---json` line with a closing `---`:

```json
---json
{
    "name": "frontmatter"
}
---
rest of the content
```

A bare JSON object followed by an empty line also works:

```json
{
    "name": "frontmatter"
}

rest of the content
```
{% endtab %}
{% endtabs %}

Each field is dynamically assigned its own scope, allowing you to write rules that target specific ones:

```yaml
---
title: 'My document'
description: "A short summary of the document's purpose."
author: 'John Doe'
---
```

Using the example above, the generated scopes would be `text.frontmatter.title`, `text.frontmatter.description`, and `text.frontmatter.author`.

A rule can then use these in its `scope:` field:

```yaml
extends: capitalization
message: "'%s' should be in title case"
level: warning
scope: text.frontmatter.title
```

This rule would then only be applied to the `title` field in the front matter.

Only string-valued fields are linted; a list or a nested map is left alone. A field can be excluded by naming its scope in [`IgnoredScopes`](../keys/ignoredscopes.md).
