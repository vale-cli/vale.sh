---
title: 'Vale and the OpenAPI Specification'
description: 'A tutorial on linting OpenAPI Specification files: extract just the prose from a structured file, with errors reported at their exact location.'
date: '2026-03-13'
motif: 'view'
imageAlt: 'A YAML document with only its prose fields highlighted, one carrying an alert at its exact location.'
---

[OpenAPI Specification](https://www.openapis.org/) files provide machine-readable (JSON or YAML) descriptions of APIs and often contain snippets of text suitable for linting.

The problem is that the target text can be hard to reach from a linting perspective. For instance, consider the following basic example from Swagger's Petstore:

```yaml
openapi: 3.0.0
info:
  title: sample API
  description: Optional multiline or single-line description in [CommonMark](http://commonmark.org/help/) or HTML.
  version: 0.1.9

servers:
  - url: http://api.example.com/v1
    description: Optional server description, e.g. Main (production) serrver
  - url: http://staging-api.example.com
    description: |
      Optional server description, e.g.
      Internal staging serrver for testing
  - url: http://api.example.com/v2
    description: Optional server description, e.g. Main (production) serrver

paths:
  /users:
    get:
      summary: Returns a list of users.
      description: Optional extended description in CommonMark or HTML.
      responses:
        '200': # status code
          description: A JSON array of user names
          content:
            application/json:
              schema:
                type: array
                items:
                  type: string
```

As you can see above, the only parts we're really interested in are the `title`, `description`, and `summary` keys — the human-readable prose embedded in an otherwise machine-readable file.

When this article was [originally written in 2019](https://medium.com/valelint/vale-the-openapi-specification-8a7cfae135fb), reaching that content required scripting workarounds, format conversion tools, or accepting poor error reporting. Vale now has a first-class solution for this problem: [**Views**](https://docs.vale.sh/topics/views).

## What are Views?

A _View_ is a virtual, filtered perspective of a structured file. It defines a series of transformation steps that extract specific, named content from a file, effectively changing how the file is represented for linting purposes. This means Vale can lint exactly the fields you care about — and nothing else — with accurate file locations reported for any errors found.

Views support two engines. [Dasel](https://github.com/TomWright/dasel) queries structured data (JSON, YAML, and TOML), and [tree-sitter](https://tree-sitter.github.io/tree-sitter/) does the same for source code — see the [documentation](https://docs.vale.sh/topics/views) for the full picture. An OpenAPI document is structured data, so we'll be using Dasel here.

Views are stored in `<StylesPath>/config/views` as YAML files and referenced in your `.vale.ini` under any syntax-specific section. One useful pattern is to attach a View to a specific named file rather than an extension glob, which lets you apply different Views to different documents even if they share the same file extension:

```ini
StylesPath = styles
MinAlertLevel = suggestion

[*.{yml,yaml}]
BasedOnStyles = Vale, Scopes

[API.yml]
View = OpenAPI
```

Here, all YAML files are linted normally, but `API.yml` additionally uses the `OpenAPI` View to extract only the prose fields.

## Setting up a View for OpenAPI

Here's a View that targets only the fields we want to lint in our OpenAPI document:

```yaml
engine: dasel
scopes:
  - expr: info.title
    name: title

  - expr: 'search(has("description")).map(description)'
    name: description
    type: md

  - expr: 'search(has("summary")).map(summary)'
    name: summary
    type: md
```

Save this file as `<StylesPath>/config/views/OpenAPI.yml`.

Each scope works as follows:

- `expr` is a [Dasel query](https://github.com/TomWright/dasel) that selects the data to lint. Dasel is a query tool for structured data formats like JSON and YAML.
- `name` assigns a metascope to the extracted values, which lets you write rules that target a specific field — for example, enforcing a character limit only on `title` values — independently of other scopes.
- `type` tells Vale how to interpret the extracted content. Setting it to `md` means embedded Markdown links and formatting are handled correctly rather than flagged as errors (`adoc`, `html`, `rst`, and `org` are also supported). The `title` scope has no `type` because our API titles are plain text — and a scope without a `type` uses its `name` as the value's only scope, which is what the rule in the next section hooks into.

The `search(has("description")).map(description)` expression deserves a closer look. Rather than manually enumerating every path in the document where a `description` field might appear — `info.description`, `servers[*].description`, `paths[*][*].description`, `paths[*][*].responses[*].description`, and so on — `search` recursively traverses the entire document tree and finds every node that contains a `description` key, regardless of nesting depth. The `.map(description)` call then extracts the string value from each matched node.

This makes the View future-proof: if your spec adds `description` fields in new locations like `components` or `parameters`, they are picked up automatically without any changes to the View. See the [Dasel v3 docs](https://daseldocs.tomwright.me/functions/search) for more information.

## Writing a scoped rule

Our configuration enables a style named `Scopes`, and this is where the View's `name` fields pay off. A rule can target one extracted field and ignore the rest:

```yaml
# styles/Scopes/TitleCase.yml
extends: existence
message: 'API titles start with a capital letter.'
level: error
scope: title
nonword: true
tokens:
  - '^[a-z]'
```

The `scope: title` line is the connection. The View names the values it extracts, and the rule opts into exactly one of them — descriptions and summaries are never checked against it.

## Running Vale

With the View in place, run Vale as you normally would:

```console
$ vale --output=line API.yml
API.yml:3:10:Scopes.TitleCase:API titles start with a capital letter.
API.yml:4:25:Vale.Spelling:Did you really mean 'multiline'?
API.yml:9:70:Vale.Spelling:Did you really mean 'serrver'?
API.yml:13:24:Vale.Spelling:Did you really mean 'serrver'?
API.yml:15:70:Vale.Spelling:Did you really mean 'serrver'?
exit=1
```

That's real output, and it shows the two halves working together. The `title` rule fired exactly once, on the title. Every location points into the original YAML file — including line 13, where the misspelling sits inside a multiline (`|`) block scalar. Nothing outside the View's three scopes was checked at all: no false positives from URLs, keys, or status codes.

## Conclusion

Views are the cleanest way to lint OpenAPI Specification files with Vale. By expressing your document's structure as a series of targeted Dasel queries, you get accurate error reporting, full Markdown support, and no external scripts or format conversion steps.

If you have any questions or run into any problems, feel free to open an issue at the [Vale repository](https://github.com/errata-ai/vale).
