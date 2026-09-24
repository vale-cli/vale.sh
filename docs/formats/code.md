# Code

Learn how Vale handles source code.

Vale lints the comments in source code, found with a [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for each language below. Clojure and PowerShell have no bundled grammar and are read with comment patterns instead. A one-line comment is scoped `text.comment.line` and a comment spanning lines `text.comment.block`, each followed by the file's extension.

| Language   | Extensions                           | Scopes                                                                                                                                                                                                                                      |
| ---------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C          | `.c`, `.h`                           | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| Clojure    | `.clj`, `.cljs`, `.cljc`, `.cljd`    | `;` (`text.comment.line.ext`)                                                                                                                                                                                                               |
| C#         | `.cs`, `.csx`                        | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| C++        | `.cpp`, `.cc`, `.cp`, `.cxx`, `.c++`, `.hpp`, `.h++` | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| CSS        | `.css`                               | <p><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                                                                                  |
| Elixir     | `.ex`, `.exs`                        | <p><code>#</code> (<code>text.comment.line.ext</code>),<br><code>@doc</code> (<code>text.comment.doc.line.ext</code>),<br><code>@moduledoc</code> (<code>text.comment.doc.block.ext</code>)</p>                                             |
| Go         | `.go`                                | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| Haskell    | `.hs`                                | <p><code>--</code> (<code>text.comment.line.ext</code>),<br><code>{-</code> (<code>text.comment.block.ext</code>)</p>                                                                                                                       |
| Java       | `.java`, `.bsh`                      | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| JavaScript | `.js`, `.jsx`                        | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| Julia      | `.jl`                                | <p><code>#</code> (<code>text.comment.line.ext</code>),<br><code>#=</code> (<code>text.comment.block.ext</code>)</p>                                                                                                                      |
| Kotlin     | `.kt`, `.kts`                        | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| LESS       | `.less`                              | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| Lua        | `.lua`                               | <p><code>--</code> (<code>text.comment.line.ext</code>),<br><code>--[[</code> (<code>text.comment.block.ext</code>)</p>                                                                                                                     |
| Perl       | `.pl`, `.pm`, `.pod`                 | `#` (`text.comment.line.ext`)                                                                                                                                                                                                               |
| PHP        | `.php`                               | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>#</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p> |
| PowerShell | `.ps1`, `.psm1`, `.psd1`             | <p><code>#</code> (<code>text.comment.line.ext</code>),<br><code>&#x3C;#...#></code> (<code>text.comment.line.ext</code>),<br><code>&#x3C;#</code> (<code>text.comment.block.ext</code>)</p>                                                |
| Protobuf   | `.proto`                             | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| Python     | `.py`, `.py3`, `.pyw`, `.rpy`, `.cpy`, `SConstruct` | <p><code>#</code> (<code>text.comment.line.ext</code>),<br><code>"""</code> (<code>text.comment.block.ext</code>)</p>                                                                                                                       |
| QML        | `.qml`                               | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| R          | `.r`, `.R`                           | `#` (`text.comment.line.ext`)                                                                                                                                                                                                               |
| Ruby       | `.rb`, `Gemfile`, `Rakefile`, `Brewfile`, `.gemspec` | <p><code>#</code> (<code>text.comment.line.ext</code>),<br><code>^=begin</code> (<code>text.comment.block.ext</code>)</p>                                                                                                                   |
| Rust       | `.rs`                                | `//` (`text.comment.line.ext`)                                                                                                                                                                                                              |
| Sass       | `.sass`, `.scss`                     | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| Scala      | `.scala`, `.sbt`                     | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| Swift      | `.swift`                             | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| TypeScript | `.ts`, `.tsx`                        | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |

A URL in a comment is skipped, as one in markup is; see [URLs](../topics/urls.md).

## [Documentation attributes](code.md#documentation-attributes)

{% hint style="info" %}
Requires Vale v3.19.0 or later.
{% endhint %}

Elixir has no documentation comment syntax: its published API documentation lives in module attributes holding a string or a heredoc, and that is what `mix docs` renders.

```elixir
defmodule Session do
  @moduledoc """
  A scheduled period of care delivery.
  """

  @doc "Books a session for a client."
  def book(client), do: ...
end
```

Both comments and attributes are extracted. `@moduledoc`, `@doc`, `@typedoc`, and `@shortdoc` carry a `doc` scope—`text.comment.doc.line` and `text.comment.doc.block`—so published documentation can be held to a different standard than an implementation note, or excluded on its own via [`IgnoredScopes`](../keys/ignoredscopes.md). `@doc false` and `@doc since: "1.0.0"` hold no prose, and neither is extracted.

## [Associations](code.md#associations)

In many languages, it’s common for comments to contain _embedded markup_ (e.g., Markdown, reStructuredText, etc.) within them. For example, consider the following Rust doc comment:

````rust
impl Person {
    /// Creates a person with the given name.
    ///
    /// # Examples
    ///
    /// ```
    /// // You can have rust code between fences
    /// // inside the comments If you pass --test
    /// // to `rustdoc`, it will even test it for
    /// // you!
    /// use doc::Person;
    /// let person = Person::new("name");
    /// ```
    pub fn new(name: &str) -> Person {
        Person {
            name: name.to_string(),
        }
    }
}
````

If the embedded markup is one of the supported formats, you can associate the `comment` scope with a `markup` type. This will allow you to lint the embedded markup as if it were a standalone file.

```ini
StylesPath = styles
MinAlertLevel = suggestion

[formats]
# Rust + Markdown
rs = md

[*.{rs,md}]
BasedOnStyles = Vale
```

![How embedded markup is linted: tree-sitter finds each comment in the source file, the per-line decoration is stripped, the remaining body is parsed as Markdown, and every alert is mapped back to its original line and column in the source.](../.gitbook/assets/embedded.svg)

A [View](../topics/views.md) does the same per query: a scope's `type` names the markup for the comments that query finds, so a Python docstring can be read as reStructuredText while the file's `#` comments stay plain text.

Once a markup format has been assigned, you can make use of all the supported features of that format (such as ignore patterns and comment-based configuration) in your source code comments.

This includes [`TokenIgnores`](../keys/tokenignores.md) and [`BlockIgnores`](../keys/blockignores.md), which are otherwise unavailable in source code: they work by wrapping a match in the format's inline or block code delimiter, so they need a markup format to wrap it with. Associating one makes them available.

### [Block comment decoration](code.md#block-comment-decoration)

{% hint style="info" %}
Requires Vale v3.17.0 or later. Earlier versions passed the leading asterisks through to the markup parser, which read a block comment as a single list.
{% endhint %}

Block comments in C-style languages conventionally decorate each line with a leading asterisk:

```javascript
/**
 * Reads the record and returns it.
 *
 * Pass `refresh` to bypass the cache:
 *
 * * `refresh: true` re-reads from disk.
 * * `refresh: false` uses the cache.
 */
```

That decoration is removed before the comment is handed to the markup parser, so the body above is read as a paragraph followed by a list—not as one long list, which is what the leading asterisks would otherwise make it.

Relative indentation is preserved, so indented code blocks inside a comment still work:

````javascript
/**
 * Formats the value for display.
 *
 * ```
 * const output = format(value);
 * ```
 */
````

The fenced block is treated as code and left alone, exactly as it would be in a standalone Markdown file.

{% hint style="info" %}
An asterisk is only treated as decoration when whitespace or the end of the line follows it. A line beginning `*emphasis*` or `**bold**` keeps its markup.
{% endhint %}

### [Documentation conventions](code.md#documentation-conventions)

A documentation comment has a convention of its own on top of the language's comment syntax, and the parts of it that name code are not linted:

| Language   | Not linted                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- |
| Go         | The name a doc comment opens with (`// Println formats ...`, `// Package fmt ...`), and links in brackets (`[Name]`, `[pkg.Name]`). |
| Rust       | Intra-doc links (`` [`Type`] ``, `[module::item]`).                                                                          |
| Kotlin     | Links (`[name]`, `[text][name]`), and the symbol a block tag names (`@param name`, `@throws Type`).                          |
| Java       | Inline tags (`{@code ...}`, `{@link ...}`), and the symbol a block tag names (`@param name`, `@throws Type`).                 |
| JavaScript | Inline tags (`{@link ...}`), a block tag with its type and name (`@param {string} name`, `@returns {Promise}`), and the whole of an `@example` block. |
| Python     | The field names of a docstring's field list (`:param name:`, `:raises Type:`, `:returns:`).                                 |

The description after a tag is prose and is linted as usual.

### [Directives](code.md#directives)

A comment addressed to a tool rather than a reader is not read at all: a Go build constraint or `//nolint` line, a Python `# noqa` or `# type:` comment, an `eslint` or `@ts-` comment in JavaScript, `NOPMD` and `CHECKSTYLE` in Java, `ktlint` in Kotlin, `NOLINT` and `clang-format` in C and C++, and `rubocop:` and `frozen_string_literal:` in Ruby.
