# DITA

Learn how Vale handles DITA content.

{% hint style="warning" %}
The third-party `dita` command takes a second or two to start. A run converts every DITA file it lints in one call, so that cost is paid once per run rather than once per file.
{% endhint %}

DITA is supported through the [DITA Open Toolkit](https://www.dita-ot.org/). You’ll need to follow the [installation instructions](https://www.dita-ot.org/dev/topics/installing-client.html), including the optional step of adding the absolute path for the `bin` directory to the `PATH` system variable.

The supported extension is `.dita`.

Vale runs `dita` with the `html5` transformation and lints the result, so the [HTML](html.md) rules apply: `<codeblock>` becomes `<pre>` and is skipped, and `<codeph>` and `<tt>` become inline code.

[`TokenIgnores`](../keys/tokenignores.md) and [`BlockIgnores`](../keys/blockignores.md) apply to DITA. The toolkit reads its input from disk, so a file an ignore pattern changes is converted from a temporary copy written beside it, where its references still resolve, and the copy is removed afterward. Ignore patterns in DITA require Vale v3.22.0 or later.
