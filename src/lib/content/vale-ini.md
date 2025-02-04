---
title: .vale.ini
description: Learn how to configure Vale for your specific needs.
---

<script>
    import Alert from '$lib/components/Alert.svelte';
    import CoreSettings from '$lib/components/docs/CoreSettings.svelte';
    import FormatSettings from '$lib/components/docs/FormatSettings.svelte';
    import Cascade from '$lib/components/docs/Cascade.svelte';
</script>

## Creating a `.vale.ini` File

After installing Vale, you'll need to create a `.vale.ini` file in your
project's root directory. This file is used to configure Vale's behavior and
can be used to specify which rules to use, which directories to lint, and more.

The fastest way to get started with Vale is to use the
[Config Generator](/generator) to create a `.vale.ini` configuration file.

Once you have your local `.vale.ini` created in the directory of your choice,
run `vale sync` from the command line to initialize it:

```bash
$ cd some-project
# You'll need to create this file
$ cat .vale.ini
...
$ vale sync
...
$ ls styles
...
$ vale README.md
```

Check out our [sample repository][1] for a complete example of the required
components of a Vale configuration.

## File structure

Vale’s configuration is read from a `.vale.ini` file. This file is
[INI-formatted][4] and consists of multiple sections: core settings,
format associations, and format-specific settings:

```ini
# Core settings appear at the top
# (the "global" section).

[formats]
# Format associations appear under
# the optional "formats" section.

[*]
# Format-specific settings appear
# under a user-provided "glob"
# pattern.
```

### Core settings

<CoreSettings />

Core settings appear at the top of the file and apply to the application itself
rather than a specific file format.

### Format associations

Format associations allow you to associate an "unknown" file extension with a
supported one:

```ini
[formats]
mdx = md
```

In the example above, we're telling Vale to treat MDX files as Markdown files.
Note that this is merely an extension-level substitution and is not a means of
adding support for a new file type.

### Format-specific settings

<FormatSettings />

Format-specific sections apply their settings only to files that match their
associated glob pattern. For example, `[*]` matches all files while
`[*.{md,txt}]` only matches files that end with either `.md` or `.txt.`

You can have as many format-specific sections as you’d like and settings
defined under a more specific section will override those in `[*]`.

See [Globbing](/docs/guides/glob) for more information on how to use glob
patterns with Vale.

## Search process

<Alert>
You can override the default search process by manually specifying a path using
the <code>--config</code> option or by defining a <code>VALE_CONFIG_PATH</code> environment variable.
</Alert>

Vale expects its configuration to be in a file named `.vale.ini` or
`_vale.ini`. It'll start looking for this file in the directory that the
`vale` command was run from and then search up the file tree until it finds
one.

If no ancestor of the current directory has a configuration file, Vale will
use a global configuration file (see below).

## Global configuration

In addition to project-specific configurations, Vale also supports a global
configuration file. The expected location of the global configuration depends
on your operating system:

| OS      | Search Locations                                   |
| :------ | :------------------------------------------------- |
| Windows | `%LOCALAPPDATA%\vale\.vale.ini`                    |
| macOS   | `$HOME/Library/Application Support/vale/.vale.ini` |
| Unix    | `$XDG_CONFIG_HOME/vale/.vale.ini`                  |

(Run the `vale ls-dirs` command to see the exact locations on your system.)

This is different from the other config-defining options (`--config`,
`VALE_CONFIG_PATH`, etc.) in that it's loaded in addition to, rather than
instead of, any other configuration sources.

In other words, this config file is _always_ loaded and is read after
any other sources to allow for project-agnostic customization.

## Cascading overrides

Vale's configuration system supports using multiple configuration files at
the same time. Typically, this is done in cases where you are contributing to
a project that already has an established configuration but you want to make
local changes.

For example, let's say you're working on a project that uses the following
configuration:

```ini
StylesPath = styles
MinAlertLevel = error

[*.md]
BasedOnStyles = ProjectStyle
```

Now, let's say you want to add the `write-good` style to your local
configuration.

Create a global configuration file&mdash;for macOS, this would be
`~/Library/Application Support/vale/.vale.ini` (see above for other OSes).

```ini
StylesPath = localpath

Packages = write-good

[*.md]
BasedOnStyles = write-good
```

Now, when you run Vale, it will show results from both the `ProjectStyle` and
`write-good` styles locally.

You'll notice that multi-valued settings (like `BasedOnStyles`) are merged
together, while single-valued settings (like `MinAlertLevel`) are overridden.

This allows you to contribute to projects with established styles while
still being able to make local changes.

[1]: https://github.com/errata-ai/vale-boilerplate
[2]: https://github.com/errata-ai/Microsoft
[3]: https://github.com/errata-ai/write-good
[4]: https://ini.unknwon.io/docs/intro
