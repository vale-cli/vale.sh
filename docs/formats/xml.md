# XML

Learn how Vale handles XML content.

XML is supported through the external program [`xsltproc`](http://xmlsoft.org/XSLT/xsltproc.html). To install, see:

* [Chocolatey](https://community.chocolatey.org/packages/xsltproc) (Windows): `choco install xsltproc`.
* [Homebrew](https://formulae.brew.sh/formula/libxslt) (macOS): `brew install libxslt`.
* Debian/Ubuntu/apt-based systems: `apt-get install xsltproc`.

You’ll need to ensure that the `xsltproc` executable is available in your `$PATH`.

The supported extension is `.xml`.

You also need to provide a version 1.0 XSL Transformation (XSLT) for converting to HTML:

{% code title=".vale.ini" %}
```ini
[*.xml]
Transform = docbook-xsl-snapshot/html/docbook.xsl
```
{% endcode %}

Once converted, Vale will follow the same rules as it does for [HTML](html.md).

Related formats: [reStructuredText](restructuredtext.md) [Org](org.md)
