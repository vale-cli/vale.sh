# DITA

Learn how Vale handles DITA content.

{% hint style="warning" %}
Due to the dependency on the third-party `dita` command, you'll likely experience worse performance with DITA files compared to other formats.
{% endhint %}

DITA is supported through the [DITA Open Toolkit](https://www.dita-ot.org/). You’ll need to follow the [installation instructions](https://www.dita-ot.org/dev/topics/installing-client.html), including the optional step of adding the absolute path for the `bin` directory to the `PATH` system variable.

The supported extension is `.dita`.

Vale runs `dita` with the `html5` transformation and lints the result, so the [HTML](html.md) rules apply: `<codeblock>` becomes `<pre>` and is skipped, and `<codeph>` and `<tt>` become inline code.
