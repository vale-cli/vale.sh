# R Markdown

Learn how Vale handles R Markdown content.

{% hint style="info" %}
Requires Vale v3.18.0 or later. Earlier versions can assign the format instead: `Rmd = md` under `[formats]`.
{% endhint %}

[R Markdown](https://rmarkdown.rstudio.com/) is Markdown with knitr code chunks and inline R expressions. Vale reads it as [Markdown](markdown.md), and the knitr syntax is code to it:

* Chunks are fenced blocks: the chunk options in the `{r ...}` info string and everything inside the fence are ignored.
* Inline expressions such as `` `r nrow(df)` `` are code spans, and are ignored by default.

The supported extensions are `.Rmd` and `.rmd`. A configuration section still has to match one of them:

```ini
[*.{md,Rmd}]
BasedOnStyles = Vale
```

Pandoc syntax that is not Markdown, citations for one, can be excluded with [`TokenIgnores`](../keys/tokenignores.md):

```ini
[*.{md,Rmd}]
TokenIgnores = (\[@[^\n\]]+\])
```

Front matter, math, and comment-based configuration work as they do in [Markdown](markdown.md).
