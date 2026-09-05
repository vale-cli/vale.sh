# CommentDelimiters

Learn how to define custom comment delimiters.

`CommentDelimiters` allow you to override standard HTML comment delimiters (`<!-- foo -->`).

They are for a format whose tools do not accept an HTML comment, so that comment-based configuration can be written in a form it does. Before a file is parsed, every occurrence of the first delimiter becomes `<!--` and every occurrence of the second becomes `-->`, so the two must differ and neither should appear in the prose for any other reason.

```ini
[*.md]
BasedOnStyles = Vale

CommentDelimiters = {/*, */}
```

```markdown
{/* vale off */}

This is some text ACT test

{/* vale on */}

{/* vale Style.Redundancy = NO */}

This is some text ACT test

{/* vale Style.Redundancy = YES */}
```

The key applies to the formats that take [`BlockIgnores`](blockignores.md). The formats with a comment syntax of their own, MDX, AsciiDoc, reStructuredText, and Org among them, need none of this; see each [format](../formats/markdown.md) for the form it reads.
