# AsciiDoc

Learn how Vale handles AsciiDoc content.

AsciiDoc is supported through the external program [Asciidoctor](https://asciidoctor.org/). See their [installation](https://docs.asciidoctor.org/asciidoctor/latest/install) instructions to get started. You’ll need to ensure that the `asciidoctor` executable is available in your `$PATH`.

The supported extensions are `.adoc`, `.asciidoc`, and `.asc`.

By default, Vale ignores:

* [Literals and source code](https://docs.asciidoctor.org/asciidoc/latest/syntax-quick-reference/#literals-and-source-code).
* URLs: See [URL handling](https://github.com/vale-cli/vale/issues/320) for more information.

## [Attributes](asciidoc.md#attributes)

You can customize how `asciidoctor` is called by passing [document attributes](https://docs.asciidoctor.org/asciidoc/latest/attributes/document-attributes-ref/):

```ini
StylesPath = styles

[asciidoctor]
# attribute = value
#
# where 'YES' enables and 'NO' disables.

# enable
experimental = YES

# assign a specific value
attribute-missing = drop

[*.adoc]
BasedOnStyles = Vale
```

By default, Vale switches off the attributes that generate text of their own—section numbers (`sectnums`), the table of contents (`toc`), and caption labels such as the "Table 1." prefixed to a block title (`table-caption`, `figure-caption`, `example-caption`, `listing-caption`). Generated text appears nowhere in the source, so a rule matching it would report an unrelated line. It also sets `attribute-missing=drop`, so a reference to an undefined attribute disappears rather than being linted as text, and renders the document title. An attribute set in the `[asciidoctor]` section overrides these defaults.

## [Comments](asciidoc.md#comments)

Vale supports comment-based configuration in AsciiDoc files:

{% hint style="warning" %}
Make sure to surround the inline passthrough statements with newlines, as shown below.
{% endhint %}

* Turn Vale off entirely:

```adoc
pass:[<!-- vale off -->]

This text will be ignored.

pass:[<!-- vale on -->]
```

* Turn off a specific rule:

```adoc
pass:[<!-- vale Style.Redundancy = NO -->]

This is some text ACT test

pass:[<!-- vale Style.Redundancy = YES -->]
```

* Turn off specific match(es) within a rule:

```adoc
pass:[<!-- vale Style.Redundancy["ACT test","OTHER"] = NO -->]

This is some text ACT test

pass:[<!-- vale Style.Redundancy["ACT test","OTHER"] = YES -->]
```

* Turn on or off specific styles:

```adoc
pass:[<!-- vale StyleName1 = YES -->]
pass:[<!-- vale StyleName2 = NO -->]
```

* Set styles (enabling them and switching off any other styles):

```adoc
pass:[<!-- vale style = StyleName1 -->]
pass:[<!-- vale styles = StyleName1, StyleName2 -->]
```
