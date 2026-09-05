# Installation

Get started with Vale in just a few minutes.

## [Pick your platform](installation.md#pick-your-platform)

The recommended approach on every platform is a package manager: it puts `vale` on your `$PATH` and keeps you up to date with new releases.

{% tabs %}
{% tab title="macOS" %}
[Homebrew](https://formulae.brew.sh/formula/vale) tracks new releases closely:

```bash
$ brew install vale
```

[MacPorts](https://ports.macports.org/port/vale/) also packages Vale, and may lag behind releases.
{% endtab %}

{% tab title="Windows" %}
[Chocolatey](https://chocolatey.org/packages/vale):

```powershell
> choco install vale
```

[Scoop](https://scoop.sh/#/apps?q=vale):

```powershell
> scoop install vale
```

[winget](https://winstall.app/apps/errata-ai.Vale):

```powershell
> winget install -e --id errata-ai.Vale
```
{% endtab %}

{% tab title="Linux" %}
On Debian and Ubuntu, the [pkg.haus](https://pkg.haus) APT archive ships Vale for stable, testing, and unstable (amd64 and arm64), built from source at release tags. Set up the archive per the instructions on [pkg.haus](https://pkg.haus), then:

```bash
$ sudo apt install vale
```

On Arch Linux, Vale is in the official repositories:

```bash
$ sudo pacman -S vale
```

[Snapcraft](https://snapcraft.io/vale) works across distributions:

```bash
$ sudo snap install vale
```

Many other distributions—Alpine, openSUSE, Void, and more—package Vale in their own repositories; see [the full list](https://repology.org/project/vale/versions).
{% endtab %}

{% tab title="FreeBSD" %}
Vale is in the ports collection as [`textproc/vale`](https://www.freshports.org/textproc/vale/):

```bash
$ pkg install vale
```

There are no official FreeBSD binaries on the releases page, so the port is also the answer for build-from-source setups.
{% endtab %}
{% endtabs %}

## [Installing Vale with a project](installation.md#installing-vale-with-a-project)

A system-wide install leaves each contributor on whatever version they happened to get, and your CI on another. Declaring Vale in the project instead pins one version for everyone—which matters because a new release can add rules or change what an existing one matches.

[mise](https://mise-versions.jdx.dev/tools/vale) does this for any project, whatever it's written in:

```bash
$ mise use vale@3.20.0
```

If your project already installs its tools through a language's package manager, Vale is packaged there too. Each of these downloads the same release binaries and puts `vale` on your `$PATH`:

{% tabs %}
{% tab title="npm" %}
```bash
$ npm install --save-dev @vvago/vale
```

Adds [`@vvago/vale`](https://www.npmjs.com/package/@vvago/vale) to `devDependencies`; run it with `npx vale`.
{% endtab %}

{% tab title="PyPI" %}
```bash
$ pip install vale
```

Installs [`vale`](https://pypi.org/project/vale/) into the active environment; pin it in `requirements.txt` or your `pyproject.toml`.
{% endtab %}

{% tab title="conda" %}
```bash
$ conda install conda-forge::vale
```

Installs [`conda-forge/vale`](https://anaconda.org/conda-forge/vale) into the active environment, or list it under `dependencies` in `environment.yml`.
{% endtab %}
{% endtabs %}

For linting in CI, the [Vale GitHub Action](https://github.com/vale-cli/vale-action) installs and runs Vale in one step, and Vale can also run as a [pre-commit hook](../integrations/pre-commit.md).

## [GitHub Releases](installation.md#github-releases)

[Archives of precompiled binaries](https://github.com/vale-cli/vale/releases) are available for Windows, macOS, and Linux (amd64 and arm64). Download the archive for your platform, extract it, and (optionally) add the extracted directory to your `$PATH`.

## [Building from source](installation.md#building-from-source)

Vale is a Go program, so `go install` builds it for any platform Go supports—including those without a release archive:

```bash
$ go install github.com/vale-cli/vale/v3/cmd/vale@latest
```

This needs Go 1.25.7 or later and a C compiler, since Vale's source-code parsers are built through cgo. A binary built this way reports its version as `master` rather than the release number.

## [Docker](installation.md#docker)

Vale is available on Docker Hub at [jdkato/vale](https://hub.docker.com/r/jdkato/vale):

```bash
$ docker pull jdkato/vale
```

Vale requires three components: a `.vale.ini` config file, a `StylesPath` directory (specified in the config file), and a document or directory to lint.

Here's an example of calling Vale with locally-defined components (assuming `$(pwd)/fixtures/styles/demo` contains a config file):

```bash
$ docker run --rm \
             -v $(pwd)/styles:/styles \
             -v $(pwd)/fixtures/styles/demo:/docs \
             -w /docs \
             jdkato/vale .
```

By default, the image supports HTML, Markdown, AsciiDoc, and reStructuredText content. If you need support for DITA as well, you'll need to add the relevant dependencies—for example,

```dockerfile
# Choose a version to pin:
FROM jdkato/vale:v3.20.0

# Copy a local installation of the DITA Open Toolkit:
COPY bin/dita-ot-3.6 /
ENV PATH="/dita-ot-3.6/bin:$PATH"

ENTRYPOINT ["/bin/vale"]
```

## [A note on community packages](installation.md#a-note-on-community-packages)

Outside of Homebrew, the GitHub release archives, pkg.haus, and Docker Hub, packages are community-maintained: they may lag behind releases, and their issues belong with their maintainers. [Repology](https://repology.org/project/vale/versions) tracks which version each repository currently ships.
