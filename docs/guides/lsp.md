# LSP

Get started with Vale's Language Server.

The Vale Language Server (`vale-ls`) implements the [Language Server Protocol](https://microsoft.github.io/language-server-protocol/) around a local installation of Vale, giving any editor that speaks LSP autocomplete, diagnostics, hover popups, and quick fixes.

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

| Option           | Type      | Default | Description                                                                                                                |
| ---------------- | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| `installVale`    | `boolean` | `false` | Install and update Vale into a `vale_bin` folder beside `vale-ls`. When false, `vale` must be on your `$PATH`.              |
| `syncOnStartup`  | `boolean` | `false` | Run [`vale sync`](../topics/cli.md) when the server starts.                                                                |
| `filter`         | `string`  | `""`    | An [output filter](../topics/cli.md) to apply, e.g. `.Level in ['warning', 'error']`.                                       |
| `configPath`     | `string`  | `""`    | An absolute path to a `.vale.ini`. Usually best left empty so Vale's own [search process](../topics/.vale.ini.md) applies. |
| `valeBinaryPath` | `string`  | `""`    | An absolute path to the `vale` binary to use. Set this when you need your own installation rather than a managed or `$PATH` copy. |
| `lintOnChange`   | `boolean` | `true`  | Report diagnostics as you type. When false, they're only updated when you save.                                             |
| `debounceMs`     | `number`  | `300`   | How long typing has to settle before `lintOnChange` runs Vale.                                                              |
| `showMetrics`    | `boolean` | `true`  | Show a [code lens](lsp.md#code-lenses) with the document's word and sentence counts.                                        |

{% hint style="info" %}
`installVale` and `syncOnStartup` are off unless your client asks for them. Editor plugins generally do—[LSP-vale-ls](https://github.com/vale-cli/LSP-vale-ls) turns both on by default—but if you're wiring the server up yourself, set them explicitly.
{% endhint %}

A configured `valeBinaryPath` is never substituted: if nothing is there, the server reports it rather than falling back to another copy of Vale. You can also pass it on the command line as `--vale-binary`, which the setting overrides.

Clients that push settings after connecting—`workspace/didChangeConfiguration`—can change any of these without a restart. The server accepts the settings object either as-is or scoped under a `vale` key.

In a workspace with more than one folder, each document is linted against the innermost folder containing it, so projects with different `.vale.ini` files can be open at the same time. Setting `configPath` overrides that for every document.

## [Quick fixes](lsp.md#quick-fixes)

Where Vale can suggest a correction, the server offers it as a code action: a replacement for a [substitution](../topics/styles.md) rule, or a deletion for a repeated word.

Spelling alerts also offer to add the flagged word to a vocabulary, which writes it to that vocabulary's `accept.txt` and re-lints the file. A project with several active [vocabularies](../keys/vocabularies.md) gets one action per vocabulary, so you choose where the word lands.

## [Code lenses](lsp.md#code-lenses)

Prose files carry a lens with the document's word and sentence counts. Selecting it reports the rest of Vale's metrics—characters, paragraphs, syllables, and the counts the readability formulas are built on. Turn it off with `showMetrics`.

## [Commands](lsp.md#commands)

The server registers these for `workspace/executeCommand`:

| Command        | Arguments                     | Description                                                        |
| -------------- | ----------------------------- | ------------------------------------------------------------------ |
| `cli.sync`     | none                          | Run [`vale sync`](../topics/cli.md).                               |
| `cli.install`  | none                          | Install or update the managed copy of Vale.                        |
| `cli.compile`  | `[uri]`                       | Compile a rule and open it on Regex101.                            |
| `vocab.add`    | `[{uri, vocab, term}]`        | Add a term to a vocabulary's `accept.txt`.                         |
| `vocab.reject` | `[{uri, vocab, term}]`        | Add a term to a vocabulary's `reject.txt`.                         |
| `doc.metrics`  | `[{uri}]`                     | Report a document's metrics.                                       |

## [Editors](lsp.md#editors)

These connect to `vale-ls`:

* [Sublime Text](https://packagecontrol.io/packages/LSP-vale-ls)
* [VS Code](https://github.com/chrischinchilla/vale-vscode)
* [Neovim](https://github.com/neovim/nvim-lspconfig) (as `vale_ls`)
* [Zed](https://github.com/koozz/zed-vale)
* [Emacs](https://github.com/tpeacock19/flymake-vale)

Other editors integrate with the Vale CLI directly rather than through the server: [ALE](https://github.com/dense-analysis/ale), [JetBrains](https://plugins.jetbrains.com/plugin/19613-vale-cli/docs), [Obsidian](https://github.com/ChrisChinchilla/obsidian-vale), [Oxygen XML](https://www.oxygenxml.com/doc/versions/23.1/ug-editor/topics/vale-linter-addon.html), and [Qt Creator](https://wiki.qt.io/Setting_Up_Vale).

## [Running it yourself](lsp.md#running-it-yourself)

Download a build from [releases](https://github.com/vale-cli/vale-ls/releases) and point your client at the binary. [LSP-vale-ls](https://github.com/vale-cli/LSP-vale-ls) is a small, readable example of a client configuration.

The binary takes no arguments beyond `--vale-binary`, `--version`, and `--help`; everything else comes from your client.
