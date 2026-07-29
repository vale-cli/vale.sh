# LSP

Get started with Vale's Language Server.

The Vale Language Server (`vale-ls`) is an implementation of the [Language Server Protocol (LSP)](https://microsoft.github.io/language-server-protocol/) that acts as a wrapper around a local installation of Vale, providing autocomplete, diagnostics, hover popups, and more, in many popular text editors and IDEs.

Some available integrations include:

* [CircleCI](https://circleci.com/developer/orbs/orb/circleci/vale)
* [Emacs](https://github.com/tpeacock19/flymake-vale)
* [GitHub Actions](https://github.com/errata-ai/vale-action)
* [Git Hooks](../integrations/pre-commit.md)
* [JetBrains](https://plugins.jetbrains.com/plugin/19613-vale-cli/docs)
* [Laravel](https://github.com/beyondcode/laravel-prose-linter)
* [Obsidian](https://github.com/ChrisChinchilla/obsidian-vale)
* [Oxygen XML](https://www.oxygenxml.com/doc/versions/23.1/ug-editor/topics/vale-linter-addon.html)
* [Sublime Text](https://packagecontrol.io/packages/LSP-vale-ls) LSP
* [Neovim](https://github.com/dense-analysis/ale) LSP
* [VS Code](https://github.com/chrischinchilla/vale-vscode) LSP
* [Qt Creator](https://wiki.qt.io/Setting_Up_Vale)
* [Zed](https://github.com/koozz/zed-vale) LSP

### [Configuration](lsp.md#configuration)

The server supports the following `initializationParams`:

| Parameter       | Default | Description                                                                                                                                                                    |
| --------------- | ------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `installVale`   |  `true` | Automatically install and update Vale to a `vale_bin` folder in the same location as `vale-ls`. If `false`, the `vale` executable needs to be available on the user’s `$PATH`. |
| `filter`        |  `None` | An [output filter](https://vale.sh/manual/filter/) to apply when calling Vale.                                                                                                 |
| `configPath`    |  `None` | An absolute path to a `.vale.ini` file to be used as the default configuration.                                                                                                |
| `syncOnStartup` |  `true` | Runs `vale sync` upon starting the server.                                                                                                                                     |

To use the server, you’ll need to download the latest release from [GitHub](https://github.com/errata-ai/vale-ls/releases). See the Sublime Text [package](https://packagecontrol.io/packages/LSP-vale-ls) for an example of how to use the server.

[Code](../formats/code.md) [Regex](regex.md)
