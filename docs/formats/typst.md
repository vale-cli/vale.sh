# Typst

Learn how Vale handles Typst content.

{% hint style="info" %}
Requires Vale v3.18.0 or later.
{% endhint %}

Vale reads [Typst](https://typst.app/) with [`typst2vast`](https://github.com/jdkato/typst2vast), which parses documents with `typst-syntax`—the Typst compiler's own parser—without ever evaluating them. As of v3.29.0 it's built in—nothing to install. Earlier versions need the program on your `$PATH`:

```console
$ cargo install typst2vast
```

The supported extension is `.typ`.

Because nothing is compiled, a document that doesn't build still lints, no package is ever fetched, and no `#show` rule can move an alert off its source text.

By default, Vale ignores:

* Code mode: `#` expressions and `#let`, `#set`, `#show`, and `#import` statements.
* Raw text: inline `` `spans` `` and fenced blocks.
* Math: `$x^2$` and display equations.
* Comments: `//` and `/* ... */`, nesting included.
* Labels (`<my-label>`) and references (`@my-label`).

Everything else is prose in its scope: `=` headings are `heading`, `*strong*` and `_emphasis_` are `strong` and `emphasis`, raw spans are `code`, and list, numbered, and term items are `list`.

## [Content blocks](typst.md#content-blocks)

A `[content]` block anywhere inside code mode is prose, and Vale lints it—a figure's caption, a conditional's branches, a `#let`-bound body:

```typst
#figure(
  image("diagram.png", width: 70%),
  caption: [This caption is linted.],
)

#if release [This branch is linted.] else [So is this one.]
```
