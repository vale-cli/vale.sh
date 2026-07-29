# CommentDelimiters

Learn how to define custom comment delimiters.

`CommentDelimiters` allow you to override standard HTML comment delimiters (`<!-- foo -->`).

Custom comment delimiters are useful when using non-standard markup which do not allow HTML-style comments, such as MDX.

```ini
[formats]
mdx = md

[*.mdx]
BasedOnStyles = Vale

CommentDelimiters = {/*, */}
```

When `CommentDelimiters` are set, you can take full advantage of markup-based configuration to enable or disable specific rules within a section.

For instance, when using MDX:

```mdx
{/* vale off */}

This is some text ACT test

This is some text ACT test

{/* vale on */}

{/* vale vale.Redundancy = NO */}

This is some text ACT test

{/* vale vale.Redundancy = YES */}
```

Related keys: [TokenIgnores](tokenignores.md) [Transform](transform.md)
