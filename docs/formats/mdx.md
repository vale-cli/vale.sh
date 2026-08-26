# MDX

Learn how Vale handles MDX content.

{% hint style="info" %}
Vale v3.18.0 or later parses [MDX](https://mdxjs.com/) natively. Earlier versions require the external program [`mdx2vast`](https://github.com/jdkato/mdx2vast) (`npm install -g mdx2vast`) on your `$PATH`.
{% endhint %}

The supported extension is `.mdx`.

MDX is Markdown plus ESM statements, JSX elements, and JavaScript expressions. The JavaScript holds no prose, and Vale treats it as code and ignores it:

* JSX tags, their attributes, and self-closing elements (`<Chart data={population} />`).
* ESM `import` and `export` statements, including multiline bodies.
* JavaScript expressions—inline (`{Math.PI * 2}`) and standing on their own.
* Fenced blocks: Blocks surrounded by three or more backticks.
* Code spans: Text surrounded by backticks.

Because MDX removed indented code blocks from the grammar, four leading spaces are an ordinary paragraph and its prose is linted.

## [JSX children](mdx.md#jsx-children)

{% hint style="info" %}
Requires Vale v3.19.0 or later. Earlier versions skipped a JSX element entirely, children included.
{% endhint %}

A JSX element's *children* are Markdown, just as MDX itself reads them, so the prose inside `<Steps>...</Steps>` or `<Aside>...</Aside>` is linted:

```mdx
<Aside type="info">
  This text is linted. The `type` attribute is not.
</Aside>
```

The children carry the element's name as a [class scope](../topics/scopes.md#class-scopes), so a rule can target one component's content (`scope: text.class.Aside`), and a component whose content shouldn't be linted can be excluded by name:

```ini
IgnoredClasses = RawOutput
```

The same applies inline: in `<abbr>HTML</abbr> is a language`, the word "HTML" is linted as part of its sentence.

One exception: an element opened *and* closed on a single standalone line (`<Box>inner</Box>` as its own block) is read as code.

## [The MDX package](mdx.md#the-mdx-package)

{% hint style="info" %}
This package exists for versions before v3.18.0, whose parser threw on inline expressions that aren't valid JavaScript—ending the run rather than the file. The native parser reads them without complaint.
{% endhint %}

The [`MDX`](https://github.com/vale-cli/MDX) package carries the configuration for those cases:

```ini
Packages = MDX
```

See [`Packages`](../keys/packages.md) for more information.

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
