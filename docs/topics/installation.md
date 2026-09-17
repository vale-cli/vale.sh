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
$ mise use vale@3.22.0
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
FROM jdkato/vale:v3.22.0

# Copy a local installation of the DITA Open Toolkit:
COPY bin/dita-ot-3.6 /
ENV PATH="/dita-ot-3.6/bin:$PATH"

ENTRYPOINT ["/bin/vale"]
```

## [Keeping Vale up to date](installation.md#keeping-vale-up-to-date)

A system package manager updates Vale along with everything else it installed. A version pinned in a project stays put until someone moves it, which is what dependency-update bots are for. None of them know anything about Vale: they read the file where you wrote a version number, ask the registry that file points at whether a newer one exists, and open a pull request that changes the number. The pull request's CI run is the useful part. A new release can add rules to a package or change what an existing rule matches, so a red build on the bump shows the new alerts before anyone else sees them.

### [Renovate](installation.md#renovate)

[Renovate](https://github.com/renovatebot/renovate) runs either as the hosted Mend app for GitHub or self-hosted from an npm package, a Docker image, or its own GitHub Action, and it supports GitHub, GitLab, Bitbucket, Azure DevOps, and Forgejo. Once installed, it opens a first pull request that adds a `renovate.json` and lists everything it found; merging that turns it on.

From then on, each run scans the repository for the manifest files its *managers* recognize, looks each dependency up in the registry it belongs to, and opens one pull request per available update. Every way of pinning Vale from the previous section maps to a manager:

| Where Vale is pinned | Manager | Looks up versions in |
| :-- | :-- | :-- |
| `mise.toml` | `mise` | Vale's GitHub releases, via the mise registry |
| `package.json` | `npm` | npm |
| `requirements.txt` | `pip_requirements` | PyPI |
| `pyproject.toml` | `pep621` | PyPI |
| `Dockerfile` | `dockerfile` | Docker Hub |
| `.github/workflows/*.yml` | `github-actions` | the action's tags |
| `.pre-commit-config.yaml` | `pre-commit` | Vale's GitHub tags |

All of these are on by default except `pre-commit`, which Renovate leaves off because hook revisions are often deliberately old. A minimal `renovate.json` that enables it:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended", ":enablePreCommit"]
}
```

Two pins need a number to bump. A `FROM jdkato/vale` line with no tag floats, so Renovate has nothing to update; pin it to `jdkato/vale:v3.20.0` as in the Docker example above. And the Vale GitHub Action's `version` input defaults to `latest`: Renovate bumps the action's own reference, but a pinned `version: 3.20.0` inside a workflow is plain YAML to it and needs a [custom manager](https://docs.renovatebot.com/modules/manager/regex/) to be tracked.

### [Dependabot](installation.md#dependabot)

[Dependabot](https://docs.github.com/en/code-security/dependabot) is built into GitHub, so there is nothing to install. It reads one file, `.github/dependabot.yml`, and each `updates` entry names a package ecosystem, the directory holding its manifest, and how often to check. Every entry is checked independently and opens its own pull requests.

| Where Vale is pinned | `package-ecosystem` |
| :-- | :-- |
| `package.json` | `npm` |
| `requirements.txt` or `pyproject.toml` | `pip` |
| `environment.yml` | `conda` |
| `Dockerfile` | `docker` |
| `.github/workflows/*.yml` | `github-actions` |

A config that covers an npm-managed project with a Docker image and the Vale action:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
  - package-ecosystem: docker
    directory: /
    schedule:
      interval: weekly
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

Dependabot has no ecosystem for mise or pre-commit, so a `mise.toml` pin or a `.pre-commit-config.yaml` revision stays where it is. For pre-commit, [pre-commit.ci](https://pre-commit.ci) fills the gap with a weekly pull request that bumps every hook's `rev`. The same tag rule applies as with Renovate: an untagged `FROM jdkato/vale` is never updated.
