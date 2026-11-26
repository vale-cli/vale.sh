# IgnoredPaths

Learn how to keep files and directories out of a run.

```ini
StylesPath = styles

IgnoredPaths = vendor/**, .terraform, docs/generated/**

[*.md]
BasedOnStyles = Vale
```

`IgnoredPaths` lists globs for files and directories Vale never lints. It requires Vale v3.29.0 or later.

The patterns read the way `.gitignore` patterns do:

| Pattern           | Matches                                                                    |
| ----------------- | -------------------------------------------------------------------------- |
| `vendor/**`       | `vendor/` beside the `.vale.ini`, and everything in it.                    |
| `docs/generated/` | That one directory. A trailing slash doesn't change what a pattern means.  |
| `.terraform`      | Any `.terraform` file or directory, at any depth: the pattern has no `/`.  |
| `**/*.min.md`     | Any file ending in `.min.md`, at any depth.                                |

A path is relative to the `.vale.ini` that sets it, not to the directory you run Vale from, so `vendor/**` means the same directory from anywhere in the project. In `.config/vale.ini`, it's relative to the project rather than to `.config/`.

The list is split on commas outside braces, so a brace group can hold several alternatives:

```ini
IgnoredPaths = {vendor,third_party}/**, CHANGELOG.md
```

An ignored path is skipped whatever the sections say, and in whatever order they come. A directory that matches isn't walked at all, and a file that matches is skipped even when it's named on the command line.

{% hint style="info" %}
To lint files with fewer rules rather than none, use a section instead. A section that sets [`BasedOnStyles = NONE`](basedonstyles.md) turns every rule off for the files it matches, but a later section that matches them too can turn rules back on.
{% endhint %}
