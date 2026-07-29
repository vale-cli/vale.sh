# StylesPath

Learn about Vale's resource directory.

{% hint style="info" %}
You can override the default `StylesPath` by manually defining a `VALE_STYLES_PATH` environment variable.
{% endhint %}

The `StylesPath` specifies where Vale should look for its external resources (e.g., styles and ignore files). The path value may be absolute or relative to the location of the parent `.vale.ini` file.

```ini
# Here's an example of a relative path:
#
# .vale.ini
# ci/
# ├── vale/
# │   ├── styles/
StylesPath = ci/vale/styles

[*.md]
# `MyStyle` is a directory within
# `ci/vale/styles`.
BasedOnStyles = MyStyle
```

If you don’t specify a `StylesPath` in your `.vale.ini` file, Vale will use its default location:

| OS      | Search Locations                                |
| ------- | ----------------------------------------------- |
| Windows | `%LOCALAPPDATA%\vale\styles`                    |
| macOS   | `$HOME/Library/Application Support/vale/styles` |
| Unix    | `$XDG_DATA_HOME/vale/styles`                    |

(Run the `vale ls-dirs` command to see the exact locations on your system.)

## [Structure](stylespath.md#structure)

A `StylesPath` contains two types of entries: _styles_ and the special `config` directory.

```console
$ tree styles
├───config     <-- Special directory
└───write-good <-- A style
```

The `config` directory is used internally by Vale and contains the following:

| Directory                               | Description                                |
| --------------------------------------- | ------------------------------------------ |
| [`vocabularies`](vocabularies.md)       | Project-specific terminology lists.        |
| [`dictionaries`](../checks/spelling.md) | Hunspell-compatible spelling dictionaries. |
| [`templates`](../topics/templates.md)   | Output format templates.                   |
| [`actions`](../topics/actions.md)       | Solutions to your custom rules.            |
| [`filters`](../topics/filters.md)       | Configuration filters.                     |
| [`scripts`](../checks/script.md)        | Tengo scripts.                             |

[Views](../topics/views.md) [Packages](packages.md)
