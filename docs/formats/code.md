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

Once a markup format has been assigned, you can make use of all the supported features of that format (such as ignore patterns and comment-based configuration) in your source code comments.
