# Grammars

Learn how Vale installs the grammars that read source code.

{% hint style="info" %}
Requires Vale v3.27.0 or later.
{% endhint %}

```ini
StylesPath = styles

Grammars = go, python
```

Vale lints the comments in [source code](../formats/code.md) by parsing the file with a [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar, so a `//` inside a string isn't a comment and a doc comment is told apart from a note. The grammars are WebAssembly modules that Vale downloads rather than carries, and `vale sync` installs them:

* Without the key, the sections decide: a `[*.go]` or `[src/**/*.{py,rs}]` section installs the grammars for the extensions it names. A section that names none, such as `[*]`, implies none.
* `Grammars = go, python` installs those two, and nothing the sections imply.
* `Grammars = ALL` installs every grammar, about 13 MB.
* `Grammars = NONE` installs none.

Running `vale sync` places each one at `<StylesPath>/config/grammars/<name>.wasm`, fetched from the Vale release the binary is. The names are:

| Name         | Reads                                   |
| ------------ | --------------------------------------- |
| `bash`       | Shell scripts                           |
| `c`          | C                                       |
| `cpp`        | C++                                     |
| `csharp`     | C#                                      |
| `css`        | CSS                                     |
| `elixir`     | Elixir                                  |
| `elm`        | Elm, and Haskell                        |
| `go`         | Go                                      |
| `java`       | Java                                    |
| `javascript` | JavaScript, and QML                     |
| `julia`      | Julia                                   |
| `kotlin`     | Kotlin                                  |
| `lua`        | Lua                                     |
| `php`        | PHP                                     |
| `proto`      | Protocol Buffers                        |
| `python`     | Python                                  |
| `ruby`       | Ruby                                    |
| `rust`       | Rust                                    |
| `toml`       | TOML, through a [View](view.md)         |
| `tsx`        | TSX                                     |
| `typescript` | TypeScript                              |
| `yaml`       | YAML, through a [View](view.md)         |

## [Without a grammar](grammars.md#without-a-grammar)

A code file whose grammar isn't installed is still linted: its comments are found by their delimiters, the way Vale read code before it used tree-sitter, and the run prints a warning once naming the grammar and the line that installs it:

```
W101 grammar "go" is not installed; add 'Grammars = go' to .vale.ini and run 'vale sync'; until then, comments are read by their delimiters
```

A `tree-sitter` [View](../topics/views.md) needs its grammar, since its queries have nothing to run on without one.

## [Offline use](grammars.md#offline-use)

Two environment variables cover a machine that can't reach GitHub:

* `VALE_GRAMMARS_URL` points `vale sync` at a mirror: a URL serving the release's `grammar-<name>.zip` archives, or a directory holding them. An archive is also an ordinary [package](packages.md), so a path to one in `Packages` installs it too.
* `VALE_GRAMMARS_PATH` names a directory of `<name>.wasm` modules that Vale reads when the `StylesPath` has none, with no sync at all.

A grammar is compiled to native code the first time a machine runs it and the result kept in the user's cache directory, so only the first run pays for that.
