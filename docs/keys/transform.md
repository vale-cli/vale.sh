# Transform

Learn about how to convert XML to HTML for linting.

```ini
StylesPath = styles

[*.xml]
BasedOnStyles = Vale

Transform = docbook-xsl-snapshot/html/docbook.xsl
```

`Transform` names a version 1.0 XSL Transformation (XSLT) that converts the matched files to HTML. Vale lints the result, following the same rules it uses for [HTML](../formats/html.md).

It applies to the files Vale reads as XML, `.xml` and `.xsd`, and it is a section-level setting, so different parts of a project can use different stylesheets:

```ini
[manuals/*.xml]
Transform = docbook/html.xsl

[schemas/*.xsd]
Transform = xsd/html.xsl
```

DITA has a converter of its own and does not use this key; see [DITA](../formats/dita.md).

## [Paths](transform.md#paths)

A relative path is resolved against **the directory holding your `.vale.ini`**—not the working directory, and not your `StylesPath`. A leading `~` is expanded.

```ini
# Both of these are relative to .vale.ini:
Transform = xsl/docbook.xsl
Transform = ../shared/docbook.xsl

# Absolute and home-relative paths work too:
Transform = ~/xsl/docbook.xsl
```

## [Requirements](transform.md#requirements)

The conversion is performed by [`xsltproc`](http://xmlsoft.org/XSLT/xsltproc.html), which has to be installed and on your `$PATH`. See [XML](../formats/xml.md) for how to install it.
