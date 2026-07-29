# LSP

Get started with Vale's Language Server.

The Vale Language Server (`vale-ls`) implements the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) around a local installation of Vale, giving any editor that speaks LSP autocomplete, diagnostics, and hover popups.

Most people don't run it directly—an editor plugin does. See [Editors](lsp.md#editors) below.

## [Configuration](lsp.md#configuration)

The server reads its settings from the `initializationOptions` your client sends when it connects:

```json
{
  "initializationOptions": {
    "installVale": true,
    "syncOnStartup": true,
    "filter": "",
    "configPath": ""
  }
}
```

| Option          | Type      | Description                                                                                                                |
| --------------- | --------- | -------------------------------------------------------------------------------------------------------------------------- |
| `installVale`   | `boolean` | Install and update Vale into a `vale_bin` folder beside `vale-ls`. When false, `vale` must be on your `$PATH`.              |
| `syncOnStartup` | `boolean` | Run [`vale sync`](../topics/cli.md) when the server starts.                                                                |
| `filter`        | `string`  | An [output filter](../topics/cli.md) to apply, e.g. `.Level in ['warning', 'error']`.                                       |
| `configPath`    | `string`  | An absolute path to a `.vale.ini`. Usually best left empty so Vale's own [search process](../topics/.vale.ini.md) applies. |

{% hint style="info" %}
The server treats an option it wasn't sent as off, so `installVale` and `syncOnStartup` only apply if your client asks for them. Editor plugins generally do—[LSP-vale-ls](https://github.com/vale-cli/LSP-vale-ls) turns both on by default—but if you're wiring the server up yourself, set them explicitly.
{% endhint %}

## [Editors](lsp.md#editors)

These connect to `vale-ls`:

* [Sublime Text](https://packagecontrol.io/packages/LSP-vale-ls)
* [VS Code](https://github.com/chrischinchilla/vale-vscode)
* [Neovim](https://github.com/dense-analysis/ale)
* [Zed](https://github.com/koozz/zed-vale)
* [Emacs](https://github.com/tpeacock19/flymake-vale)

Other editors integrate with the Vale CLI directly rather than through the server: [JetBrains](https://plugins.jetbrains.com/plugin/19613-vale-cli/docs), [Obsidian](https://github.com/ChrisChinchilla/obsidian-vale), [Oxygen XML](https://www.oxygenxml.com/doc/versions/23.1/ug-editor/topics/vale-linter-addon.html), and [Qt Creator](https://wiki.qt.io/Setting_Up_Vale).

## [Running it yourself](lsp.md#running-it-yourself)

Download a build from [releases](https://github.com/vale-cli/vale-ls/releases) and point your client at the binary. [LSP-vale-ls](https://github.com/vale-cli/LSP-vale-ls) is a small, readable example of a client configuration.

[Code](../formats/code.md) [Regex](regex.md)
