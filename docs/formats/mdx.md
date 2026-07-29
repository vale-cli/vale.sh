# MDX

Learn how Vale handles MDX content.

[MDX](https://mdxjs.com/) is supported through the external program [`mdx2vast`](https://github.com/jdkato/mdx2vast). To get started, you’ll need to install the CLI:

```bash
$ npm install -g mdx2vast
```

You’ll need to ensure that the `mdx2vast` executable is available in your `$PATH` (this should happen automatically).

The supported extension is `.mdx`.

By default, Vale ignores:

* Fenced blocks: Blocks surrounded by three or more backticks.
* Code spans: Text surrounded by backticks.
* URLs: See [URL handling](https://github.com/jdkato/mdx2vast) for more information.
* JSX expressions and components.
* ESM imports and exports.

## [Comments](mdx.md#comments)

Vale supports comment-based configuration in MDX files:

* Turn Vale off entirely:

```mdx
{/* vale off */}

This text will be ignored.

{/* vale on */}
```

* Turn off a specific rule:

```mdx
{/* vale Style.Redundancy = NO */}

This is some text ACT test

{/* vale Style.Redundancy = YES */}
```

* Turn off specific match(es) within a rule:

```mdx
{/* vale Style.Redundancy["ACT test","OTHER"] = NO */}

This is some text ACT test

{/* vale Style.Redundancy["ACT test","OTHER"] = YES */}
```

* Turn on or off specific styles:

```mdx
{/* vale StyleName1 = YES */}

{/* vale StyleName2 = NO */}
```

* Set styles (enabling them and switching off any other styles):

```mdx
{/* vale style = StyleName1 */}
{/* vale styles = StyleName1, StyleName2 */}
```

[AsciiDoc](asciidoc.md) [HTML](html.md)
