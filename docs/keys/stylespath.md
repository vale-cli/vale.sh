# StylesPath

Learn where Vale keeps its resources, and how that directory is laid out.

{% hint style="info" %}
The `VALE_STYLES_PATH` environment variable replaces the default location described below.
{% endhint %}

`StylesPath` names the directory that holds everything Vale reads besides your content: the styles, and the `config/` directory of vocabularies, dictionaries, views, and other assets beside them. The value is a path, absolute or relative to the `.vale.ini` file that sets it, and it has to exist when the configuration loads. A path that isn't there is an error that points at the key.

```ini
# .vale.ini
# ci/
# └── vale/
#     └── styles/
StylesPath = ci/vale/styles

[*.md]
# House is a directory in ci/vale/styles.
BasedOnStyles = House
```

`vale sync` is the one command that creates the directory when it's missing, because installing a package is what fills it.

## [The default location](stylespath.md#the-default-location)

When no configuration file sets a `StylesPath`, Vale uses a directory in the operating system's data folder. `vale ls-dirs` prints the path on your system and whether it exists:

| OS      | Location                                        |
| ------- | ----------------------------------------------- |
| Windows | `%LOCALAPPDATA%\vale\styles`                    |
| macOS   | `$HOME/Library/Application Support/vale/styles` |
| Linux   | `$XDG_DATA_HOME/vale/styles`                    |

This directory is also read when a project does set its own path, as long as it exists. See [More than one path](stylespath.md#more-than-one-path).

## [Layout](stylespath.md#layout)

A `StylesPath` holds three kinds of entry: directories that are styles, one `config/` directory for everything that isn't a style, and a `.vale-config/` directory that `vale sync` writes.

```
styles/
├── House/                   a style you wrote
│   ├── Hedging.yml
│   ├── Terms.yml
│   └── dates/
│       └── TimeFormat.yml
├── Microsoft/               a style vale sync installed
│   ├── HeadingPunctuation.yml
│   └── ...
├── config/                  everything that isn't a style
│   ├── vocabularies/
│   │   └── Product/
│   │       ├── accept.txt
│   │       └── reject.txt
│   ├── dictionaries/
│   │   ├── en_medical.aff
│   │   └── en_medical.dic
│   ├── ignore/
│   │   └── jargon.txt
│   ├── actions/
│   ├── scripts/
│   ├── filters/
│   ├── templates/
│   └── views/
└── .vale-config/            written by vale sync
    └── 0-Microsoft.ini
```

Any directory that is not `config` or `.vale-config` is read as a style, so keep other files out of the top level.

### [Styles](stylespath.md#styles)

A style is a directory, and its name is the directory's name. Each `.yml` file in it is a rule, addressed as the style's name and the file's name joined with a dot: `Microsoft/HeadingPunctuation.yml` is `Microsoft.HeadingPunctuation` in configuration, in an in-text comment, in a filter, and in Vale's output.

Rules can be nested. A subdirectory joins the name with another dot, so `House/dates/TimeFormat.yml` is `House.dates.TimeFormat`, and any depth works the same way. Nesting is for organizing a large style; it doesn't change how a rule runs or what it inherits. The name is also how Vale finds a single rule that is switched on without its style: `House.dates.TimeFormat = YES` under a section opens `House/dates/TimeFormat.yml` directly.

Three things about what's inside a style:

- Only `.yml` files are rules. A README, a license, or a `.yaml` file is left alone.
- A directory whose name starts with `.` or `_` is skipped, along with everything under it. That is the place for drafts and retired rules.
- A rule's name can't contain `[` or `]`, because `Style.Rule[param]` is configuration syntax.

The [Styles](../topics/styles.md) page covers what goes in a rule.

### [The config directory](stylespath.md#the-config-directory)

`config/` holds what a rule or a configuration key refers to by name. Each subdirectory is reached from one place:

| Directory                                      | Holds                                                                                                                            | Reached by                                                                                                        |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [`vocabularies`](vocabularies.md)              | One directory per vocabulary, holding `accept.txt` and `reject.txt`. Subdirectories are walked, so a vocabulary can be split up. | `Vocab = Name` in `.vale.ini`.                                                                                    |
| [`dictionaries`](../checks/spelling.md)        | Hunspell pairs, `name.dic` beside `name.aff`, and the `.dict` models a `sequence` rule names.                                    | `dictionaries: [name]` in a `spelling` rule, or `model: name` in a `sequence` rule.                               |
| [`ignore`](../checks/spelling.md#ignore-files) | Plain-text word lists, one word per line, at any depth.                                                                          | `ignore: [file.txt]` in a `spelling` rule, relative to this directory.                                            |
| [`actions`](../fixes/suggest.md)               | Tengo scripts that compute a suggestion.                                                                                         | The script's name in a rule's `action`. A style's own directory is searched too, so a style can ship its scripts. |
| [`scripts`](../checks/script.md)               | Tengo scripts for `script` rules.                                                                                                | `script: Name.tengo` in the rule.                                                                                 |
| [`filters`](../topics/filters.md)              | Filter expressions, one per file.                                                                                                | The file's name on `--filter`.                                                                                    |
| [`templates`](../topics/templates.md)          | Output templates.                                                                                                                | The file's name on `--output`.                                                                                    |
| [`views`](../topics/views.md)                  | One View per `.yml` file.                                                                                                        | `View = Name` under a section.                                                                                    |

`vale sync` merges a package's `config/` into this one, directory by directory, so a package can carry a vocabulary or a view along with its style.

### [The pipeline directory](stylespath.md#the-pipeline-directory)

`.vale-config/` holds the `.vale.ini` files that packages carry, one per package, numbered in the order the [`Packages`](packages.md) key lists them. Vale reads them before your own configuration, so a package's settings are the base and yours are laid over them. The directory is deleted and rebuilt on every `vale sync`. Nothing in it is yours to edit.

## [More than one path](stylespath.md#more-than-one-path)

A run can have several paths on its search list, gathered in this order:

1. The default location, or `VALE_STYLES_PATH`, when the directory exists.
2. The `StylesPath` of the user-level `.vale.ini`, if that file sets one.
3. The `StylesPath` of the project's `.vale.ini`.

Each file sets one path, resolved against that file. `vale ls-config` prints the list under `Paths`, and `--no-global` drops the first two entries along with the user-level file.

A style, a vocabulary, a view, a script, an action, a template, or a filter is taken from the first path on the list that has it. So a style in the default location shadows one of the same name in the project, and a project can't override a shared style by copying it. Rename the copy instead.

The last path, the project's, is where `vale sync` installs packages and writes `.vale-config/`. It is also the only path a `spelling` rule reads `dictionaries` and `ignore` files from.

This is what lets a machine keep one copy of the shared styles for every project on it. Sync the packages into the default location once, from a configuration that lives there:

```ini
# ~/Library/Application Support/vale/.vale.ini
Packages = Microsoft, write-good
```

```console
$ vale sync --config "$HOME/Library/Application Support/vale/.vale.ini"
```

Then a project needs a path only for what is its own:

```ini
# .vale.ini
StylesPath = styles

[*.md]
BasedOnStyles = Microsoft, write-good, House
```

`Microsoft` and `write-good` are found in the default location, `House` in the project's `styles`, and `vale sync` in the project touches nothing shared.

## [Version control](stylespath.md#version-control)

Commit the styles you wrote and the `config/` directory. Everything `vale sync` writes, the installed styles and `.vale-config/`, is rebuilt from `Packages`, and most projects ignore it. The [Packages](packages.md#vcs) page shows a `.gitignore` that keeps the two apart.
