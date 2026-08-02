# Installation

Get started with Vale in just a few minutes.

## [Package Managers](installation.md#package-managers)

In general, the recommended approach on all platforms is to use a package manager such as [Chocolatey](https://chocolatey.org/packages/vale) (Windows), [Homebrew](https://formulae.brew.sh/formula/vale) (macOS), or [Snapcraft](https://snapcraft.io/vale) (Linux).

{% tabs %}
{% tab title="Windows" %}
```powershell
> choco install vale
```
{% endtab %}

{% tab title="macOS" %}
```bash
$ brew install vale
```
{% endtab %}

{% tab title="Linux" %}
```bash
$ snap install vale
```
{% endtab %}
{% endtabs %}

This will ensure that Vale is available on your `$PATH` and allow you to stay up to date with new releases.

Vale can also be found at a number of [other package repositories](https://repology.org/project/vale/versions). These are community-maintained, so please read the package’s documentation before installing.

## [GitHub Releases](installation.md#github-releases)

[Archives of precompiled binaries](https://github.com/vale-cli/vale/releases) are available for Windows, macOS, and Linux. To use one of these, you’ll need to download the archive for your platform, extract it to a local directory, and (optionally) add the extracted directory to your `$PATH`.

## [Docker](installation.md#docker)

Vale is available on Docker Hub at [jdkato/vale](https://hub.docker.com/r/jdkato/vale):

```bash
$ docker pull jdkato/vale
```

Vale requires three components: a `.vale.ini` config file, a `StylesPath` directory (specified in the config file), and a document or directory to lint.

Here’s an example of calling Vale with locally-defined components (assuming `$(pwd)/fixtures/styles/demo` contains a config file):

```bash
$ docker run --rm \
             -v $(pwd)/styles:/styles \
             -v $(pwd)/fixtures/styles/demo:/docs \
             -w /docs \
             jdkato/vale .
```

By default, the image supports HTML, Markdown, AsciiDoc, and reStructuredText content. If you need support for DITA as well, you’ll need to add the relevant dependencies—for example,

```dockerfile
# Choose a version to pin:
FROM jdkato/vale:v2.15.2

# Copy a local installation of the DITA Open Toolkit:
COPY bin/dita-ot-3.6 /
ENV PATH="/dita-ot-3.6/bin:$PATH"

ENTRYPOINT ["/bin/vale"]
```

## [Other options](installation.md#other-options)

| Source | Documentation                                                                    | Status       |
| ------ | -------------------------------------------------------------------------------- | ------------ |
| `PyPI` | [`project/vale`](https://pypi.org/project/vale/)                                 | active       |
| `NPM`  | [`package/@ocular-d/vale-bin`](https://www.npmjs.com/package/@ocular-d/vale-bin) | unmaintained |
