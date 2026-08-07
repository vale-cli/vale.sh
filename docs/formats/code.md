# Code

Learn how Vale handles source code.

Vale supports linting source code comments in a number of languages (see below).

| Language   | Extensions                           | Scopes                                                                                                                                                                                                                                      |
| ---------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C          | `.c`, `.h`                           | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| C#         | `.cs`, `.csx`                        | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| C++        | `.cpp`, `.cc`, `.cxx`, `.hpp`        | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| CSS        | `.css`                               | <p><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                                                                                  |
| Go         | `.go`                                | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| Haskell    | `.hs`                                | <p><code>--</code> (<code>text.comment.line.ext</code>),<br><code>{-</code> (<code>text.comment.block.ext</code>)</p>                                                                                                                       |
| Java       | `.java`, `.bsh`                      | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| JavaScript | `.js`                                | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| Julia      | `.jl`                                | <p><code>#</code> (<code>text.comment.line.ext</code>),<br><code>"..."</code> (<code>text.comment.line.ext</code>)<br><code>#=</code> (<code>text.comment.block.ext</code>),<br><code>"""</code> (<code>text.comment.block.ext</code>)</p>  |
| LESS       | `.less`                              | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| Lua        | `.lua`                               | <p><code>--</code> (<code>text.comment.line.ext</code>),<br><code>--[[</code> (<code>text.comment.block.ext</code>)</p>                                                                                                                     |
| Perl       | `.pl`, `.pm`, `.pod`                 | `#` (`text.comment.line.ext`)                                                                                                                                                                                                               |
| PHP        | `.php`                               | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>#</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p> |
| PowerShell | `.ps1`                               | <p><code>#</code> (<code>text.comment.line.ext</code>),<br><code>&#x3C;#...#></code> (<code>text.comment.line.ext</code>),<br><code>&#x3C;#</code> (<code>text.comment.block.ext</code>)</p>                                                |
| Protobuf   | `.proto`                             | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| Python     | `.py`, `.py3`, `.pyw`, `.pyi`, `rpy` | <p><code>#</code> (<code>text.comment.line.ext</code>),<br><code>"""</code> (<code>text.comment.block.ext</code>)</p>                                                                                                                       |
| QML        | `.qml`                               | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| R          | `.r`, `.R`                           | `#` (`text.comment.line.ext`)                                                                                                                                                                                                               |
| Ruby       | `.rb`                                | <p><code>#</code> (<code>text.comment.line.ext</code>),<br><code>^=begin</code> (<code>text.comment.block.ext</code>)</p>                                                                                                                   |
| Rust       | `.rs`                                | `//` (`text.comment.line.ext`)                                                                                                                                                                                                              |
| Sass       | `.sass`                              | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| Scala      | `.scala`, `.sbt`                     | `//` (`text.comment.line.ext`)                                                                                                                                                                                                              |
| Swift      | `.swift`                             | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |
| TypeScript | `.ts`, `.tsx`                        | <p><code>//</code> (<code>text.comment.line.ext</code>),<br><code>/*...*/</code> (<code>text.comment.line.ext</code>),<br><code>/*</code> (<code>text.comment.block.ext</code>)</p>                                                         |

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
