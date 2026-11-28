# XML

Learn how Vale handles XML content.

XML is supported through the external program [`xsltproc`](http://xmlsoft.org/XSLT/xsltproc.html). To install, see:

* [Chocolatey](https://community.chocolatey.org/packages/xsltproc) (Windows): `choco install xsltproc`.
* [Homebrew](https://formulae.brew.sh/formula/libxslt) (macOS): `brew install libxslt`.
* Debian/Ubuntu/apt-based systems: `apt-get install xsltproc`.

The `xsltproc` executable needs to be available in your `$PATH`.

The supported extensions are `.xml` and `.xsd`.

You also need to provide a version 1.0 XSL Transformation (XSLT) for converting to HTML:

{% code title=".vale.ini" %}
```ini
[*.xml]
Transform = docbook-xsl-snapshot/html/docbook.xsl
```
{% endcode %}

A stylesheet is configuration that runs as a program. For that reason, Vale runs `xsltproc` with `--nonet`, `--nowrite`, and `--nomkdir`. These flags block network access and stop the stylesheet from writing files or creating directories. This is similar to the AsciiDoc converter's safe mode, where a document can't include a file from outside the project. If a stylesheet tries any of these, Vale refuses it and reports an error for that file.

Once converted, Vale will follow the same rules as it does for [HTML](html.md).
