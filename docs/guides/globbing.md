# Globbing

Learn how to use glob patterns in Vale.

[Glob](https://en.wikipedia.org/wiki/Glob_\(programming\)) patterns are used for matching file paths in a filesystem. They are commonly employed in command-line tools, scripting languages, and libraries to specify sets of filenames or directories.

This guide will cover the basics of using glob patterns in Vale.

## [Syntax](globbing.md#syntax)

Vale supports the following glob syntax:

* `/` to separate path segments.
* `*` to match zero or more characters in a path segment.
* `?` to match on one character in a path segment.
* `**` to match zero or more directories.
* `[]` to declare a range of characters to match.
* `{}` to declare a set of patterns to match.
* `[!...]` to negate a range of characters to match.

Additionally, when using the `--glob` flag, you can use the `!` prefix to negate the _entire_ pattern:

```sh
# Match all files except those with a `.md` or `.py` extension.
$ vale --glob='!**/*.{md,py}' path/to/files
```

## [Precedence](globbing.md#precedence)

When evaluating glob patterns, the result of using the `--glob` flag is computed _first_, followed by any sections in the `.vale.ini` file.

For example, given the following `.vale.ini`:

```ini
StylesPath = styles

[*.md]
BasedOnStyles = Vale
```

And this directory structure:

```
cases/test/
├── a.md
├── b
│   └── b.md
└── c.md
```

We can then run Vale with the following command:

```bash
$ vale --glob='!**/b/*' .
 cases/test/c.md
 8:37  warning  Found 'Here'.  Test.Test

 cases/test/a.md
 8:37  warning  Found 'Here'.  Test.Test
```

You’ll notice that the `b.md` file is not included in the output because the `--glob` flag takes precedence over the `.vale.ini` file.
