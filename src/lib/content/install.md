---
title: Install
description: Get started with Vale in just a few minutes.
---

<script>
    import InstallOptions from '$lib/components/docs/InstallOptions.svelte';
    import InstallTabs from '$lib/components/docs/InstallTabs.svelte';
    import { Badge } from "$lib/components/ui/badge";
</script>

## Package Managers

In general, the recommended approach on all platforms is to use a package
manager such as [Chocolatey][4] (Windows), [Homebrew][5] (macOS), or
[Snapcraft][6] (Linux).

<InstallTabs />

This will ensure that Vale is available on your `$PATH` and allow you to stay
up to date with new releases.

Vale can also be found at a number of [other package repositories][3].
These are community-maintained, so please read the package's documentation
before installing.

## GitHub Releases

[Archives of precompiled binaries][2] are available for Windows, macOS, and
Linux. To use one of these, you'll need to download the archive for your
platform, extract it to a local directory, and (optionally) add the extracted
directory to your `$PATH`.

## Docker

Vale is available on Docker Hub at [jdkato/vale][1]:

```bash
$ docker pull jdkato/vale
```

Vale requires three components: a `.vale.ini` config file, a `StylesPath`
directory (specified in the config file), and a document or directory to lint.

Here's an example of calling Vale with locally-defined components (assuming
`$(pwd)/fixtures/styles/demo` contains a config file):

```bash
$ docker run --rm \\
             -v $(pwd)/styles:/styles \\
             -v $(pwd)/fixtures/styles/demo:/docs \\
             -w /docs \\
             jdkato/vale .
```

By default, the image supports HTML, Markdown, AsciiDoc, and reStructuredText
content. If you need support for DITA as well, you'll need to add the relevant
dependencies&mdash;for example,

```dockerfile title=Dockerfile
# Choose a version to pin:
FROM jdkato/vale:v2.15.2

# Copy a local installation of the DITA Open Toolkit:
COPY bin/dita-ot-3.6 /
ENV PATH="/dita-ot-3.6/bin:$PATH"

ENTRYPOINT ["/bin/vale"]
```

## Other options

| Source | Documentation                                                                    | Status                                          |
| ------ | -------------------------------------------------------------------------------- | ----------------------------------------------- |
| `PyPI` | [`project/vale`](https://pypi.org/project/vale/)                                 | <Badge variant="secondary">active</Badge>       |
| `NPM`  | [`package/@ocular-d/vale-bin`](https://www.npmjs.com/package/@ocular-d/vale-bin) | <Badge variant="secondary">unmaintained</Badge> |

[1]: https://hub.docker.com/r/jdkato/vale
[2]: https://github.com/errata-ai/vale/releases
[3]: https://repology.org/project/vale/versions
[4]: https://chocolatey.org/packages/vale
[5]: https://formulae.brew.sh/formula/vale
[6]: https://snapcraft.io/vale
