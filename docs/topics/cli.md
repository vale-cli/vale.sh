# CLI

Learn about the Vale command-line interface.

The Vale CLI is a powerful tool for linting your content in a variety of formats. To get started, try running with no arguments:

![Running vale with no arguments prints a short usage summary and an example configuration file.](../.gitbook/assets/help2.svg)

## [Environment variables](cli.md#environment-variables)

The following list of environment variables are supported by the `vale` command-line interface:

| Variable           | Description                                                         |
| ------------------ | ------------------------------------------------------------------- |
| `VALE_CONFIG_PATH` | Override the default search process by specifying a .vale.ini file. |
| `VALE_STYLES_PATH` | Specify the location of the default StylesPath.                     |

You can inspect the current environment variables by running:

```
$ vale ls-vars
```

The exact steps for setting environment variables depend on your operating system, but here are some useful links for [Windows](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/setx) and [macOS](https://support.apple.com/guide/terminal/use-environment-variables-apd382cc5fa-4f58-4449-b20a-41c53c006f8f/mac).

## [CLI options](cli.md#cli-options)

| Name              | Description                                                                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sync`            | <p>Download and install packages. See <a href="../keys/packages.md">Packages</a> for more information.<br><code>&#x3C;br>$ vale sync&#x3C;br></code></p>                                  |
| `ls-config`       | <p>Print the current configuration options as JSON.<br><code>&#x3C;br>$ vale ls-config&#x3C;br></code></p>                                                                                |
| `ls-metrics`      | <p>Print the computed metrics for the given file. See <a href="../checks/metric.md">metric</a> for more information.<br><code>&#x3C;br>$ vale ls-metrics path/to/file&#x3C;br></code></p> |
| `ls-dirs`         | <p>Print the location of default configuration directories.<br><code>&#x3C;br>$ vale ls-dirs&#x3C;br></code></p>                                                                          |
| `ls-vars`         | <p>Print the supported environment variables.<br><code>&#x3C;br>$ vale ls-vars&#x3C;br></code></p>                                                                                        |
| `--config`        | <p>Override the default configuration search process.<br><code>&#x3C;br>$ vale --config='path/to/.vale.ini' README.md&#x3C;br></code></p>                                                 |
| `--ext`           | <p>Assign a file extension to stdin.<br>```<br>$ echo "<em>This</em> is Markdown"</p>                                                                                                     |
| `--filter`        | <p>An expression to filter rules by. See <a href="filters.md">Filters</a> for more information.<br><code>&#x3C;br>$ vale --filter='"heading" in .Scope' test.md&#x3C;br></code></p>       |
| `--glob`          | <p>A glob pattern to match files against. See <a href="../guides/globbing.md">Globbing</a> for more information.<br><code>&#x3C;br>$ vale --glob='*.md' some-dir&#x3C;br></code></p>      |
| `--ignore-syntax` | <p>Treat all input as plain text.<br><code>&#x3C;br>$ vale --ignore-syntax README.md&#x3C;br></code></p>                                                                                  |
| `--no-exit`       | <p>Do not return a non-zero exit code if there are errors.<br><code>&#x3C;br>$ vale --no-exit README.md&#x3C;br></code></p>                                                               |
| `--no-wrap`       | <p>Do not wrap output.<br><code>&#x3C;br>$ vale --no-wrap README.md&#x3C;br></code></p>                                                                                                   |
| `--no-global`     | <p>Do not load the global configuration.<br><code>&#x3C;br>$ vale --no-global README.md&#x3C;br></code></p>                                                                               |
| `--output`        | <p>Change the output format. See <a href="templates.md">Templates</a> for more information.<br><code>&#x3C;br>$ vale --output=JSON README.md&#x3C;br></code></p>                          |
| `--version`       | <p>Print the version of Vale.<br><code>&#x3C;br>$ vale --version&#x3C;br></code></p>                                                                                                      |

## [Return codes](cli.md#return-codes)

The `vale` CLI returns the following exit codes:

| Code | Description                                                                                  |
| ---- | -------------------------------------------------------------------------------------------- |
| `0`  | No error(s) were found.                                                                      |
| `1`  | Linting error(s) were found. Useful for failing CI builds; can be disabled with `--no-exit`. |
| `2`  | Runtime error(s) occurred.                                                                   |

It will try to respect the value of `--output` when printing to `stderr`. For example:

![Vale reporting an E201 configuration error, showing the offending line of the rule file and the accepted values.](../.gitbook/assets/error.svg)
