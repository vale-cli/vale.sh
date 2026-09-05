# Packages

Learn how configuration is shared, installed, and kept up to date.

```ini
StylesPath = styles

Packages = Microsoft, write-good

[*.md]
BasedOnStyles = Microsoft, write-good
```

`Packages` lists what `vale sync` installs into the [`StylesPath`](stylespath.md). A package is a style, a configuration file, or both, published as an archive, and naming it here is all a project has to do to use it. Update the package, run `vale sync` again, and every project that names it has the new rules.

![One upstream package is inherited by several projects, so an upstream change reaches all of them. Within a project, configuration is layered: the first package is overridden by the second, and local configuration overrides both.](../.gitbook/assets/package.svg)

## [Naming a package](packages.md#naming-a-package)

Each entry in the list is one of four things:

- **A name from the library**, such as `Microsoft`. A name is looked up in the [package library](https://github.com/vale-cli/packages), which the [Package Explorer](https://vale.sh/explorer) is built from, and the URL it records is what gets installed.
- **A URL** to a `.zip` archive.
- **A path to a `.zip` archive** on disk.
- **A path to a directory** laid out like an unpacked archive.

A package's name is the archive's file name without `.zip`, or the directory's name, and the archive has to hold one folder with that name. `Google.zip` unpacks to `Google/`. A name that isn't in the library is tried as a path and then as a URL, so a misspelled name reports itself as a URL that couldn't be fetched.

Relative paths are resolved from the directory `vale sync` runs in, not from the configuration file.

## [What sync does](packages.md#what-sync-does)

`vale sync` reads `Packages` from one configuration file, the one the search finds or the one `--config` names, and installs each entry in order. In doing so it:

1. Creates the `StylesPath` if it doesn't exist, and deletes the `.vale-config/` directory inside it.
2. Fetches or unpacks each package, and copies what it holds into the `StylesPath`. A style already there with the same name is replaced whole, so an installed style is not the place to make edits.
3. Merges the package's `config/` into yours, one entry at a time: a vocabulary or dictionary the package carries lands beside the ones you have, and one with the same name replaces yours.
4. Copies the package's `.vale.ini`, if it has one, into `.vale-config/`, named for its position in the list. A package that lists packages of its own has those installed too.

Run it after adding a package, and in CI before linting. `--plain-progress` prints a line per package instead of a progress bar, for logs.

```console
$ vale sync --plain-progress
Synced Microsoft
Synced write-good
 SUCCESS  Synced 2 package(s) to '/home/me/docs/styles'.
```

## [Shapes](packages.md#shapes)

A package holds a style, a configuration file, or both.

### [A style](packages.md#a-style)

An archive of one style directory:

```console
$ unzip write-good.zip
Archive:  write-good.zip
   creating: write-good/
  inflating: write-good/README.md
  inflating: write-good/Cliches.yml
  inflating: write-good/ThereIs.yml
  inflating: write-good/Weasel.yml
  ...
  inflating: write-good/meta.json
```

The directory is copied into the `StylesPath`, and `BasedOnStyles = write-good` switches it on.

### [A configuration](packages.md#a-configuration)

An archive of a `.vale.ini` alone, which is how support for a markup convention or a site generator is shared:

```console
$ unzip Hugo.zip
Archive:  Hugo.zip
   creating: Hugo/
  inflating: Hugo/.vale.ini
```

The file lands in `.vale-config/` and is read before your own, so its settings are the base yours sit on. Nothing in it needs to be repeated locally.

### [Both](packages.md#both)

A `.vale.ini` beside a `styles/` directory that is a `StylesPath` of its own:

```
MyPackage/
├── .vale.ini
└── styles/
    ├── MyStyle/
    │   └── MyRule.yml
    └── config/
        ├── dictionaries/
        │   └── MyDic.dic
        ├── scripts/
        │   └── MyScript.tengo
        └── vocabularies/
            └── MyVocab/
                ├── accept.txt
                └── reject.txt
```

The directory has to be named `styles`, and it can hold anything a `StylesPath` can, styles and the `config/` directory alike. Its `.vale.ini` refers to it, switches its rules on, and can list further packages:

```ini
# MyPackage/.vale.ini
StylesPath = styles

Packages = proselint

[*.{md,adoc}]
BasedOnStyles = MyStyle
```

On sync, `styles/` is merged into the project's `StylesPath` and the `.vale.ini` goes to `.vale-config/`.

## [Pinning a version](packages.md#pinning-a-version)

Naming a package installs its latest release, so the rules it brings change as the package is updated. To hold a package at a known version, give the release URL in place of the name:

```ini
StylesPath = styles

Packages = https://github.com/vale-cli/Google/releases/download/v0.7.0/Google.zip

[*.md]
BasedOnStyles = Google
```

A style takes its name from the folder inside the archive, so `BasedOnStyles` reads the same either way. Only where the package comes from changes. Run `vale sync` again after editing the URL to move to a different version.

This is worth doing wherever a new rule arriving on its own would be disruptive, such as a repository several people write in, or a CI job that fails on new alerts.

## [Ordering](packages.md#ordering)

Configuration is read in this order: each package's `.vale.ini` in the order `Packages` lists them, then your own file.

```ini
Packages = pkg1, pkg2

[*.md]
BasedOnStyles = House
```

A list key such as `BasedOnStyles` gathers every value from every source, so the styles `pkg1` and `pkg2` switch on run alongside `House`. Any other key takes the last value read: `MinAlertLevel`, a rule's level, a parameter, and a switch all end up as your file has them, and `pkg2` has them as it does where your file is silent.

## [Publishing a package](packages.md#publishing-a-package)

A package is a release asset: a `.zip` whose single top-level folder is the package's name, attached to a release of a Git repository. The `releases/latest/download` URL then always points at the newest one. To make a package installable by name, add an entry for it to the [library](https://github.com/vale-cli/packages) in a pull request. The repository's README describes the entry.

## [Version control](packages.md#version-control)

Commit the styles you wrote and the `config/` directory. Everything `vale sync` writes, the installed styles and `.vale-config/`, is rebuilt from `Packages`, so most projects ignore it. Ignoring the whole `StylesPath` is simplest when nothing in it is yours. When some of it is, ignore selectively:

```gitignore
# Ignore the StylesPath except for our own vocabulary.

.github/styles/*
!.github/styles/config/

.github/styles/config/*
!.github/styles/config/vocabularies/

.github/styles/config/vocabularies/*
!.github/styles/config/vocabularies/Base
```

This ignores everything under `.github/styles/` except `.github/styles/config/vocabularies/Base`.
