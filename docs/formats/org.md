# Org

Learn how Vale handles Org content.

[Org](https://orgmode.org/) support is built in. The supported extension is `.org`.

By default, Vale ignores:

* [Code blocks](https://orgmode.org/org.html#Structure-of-Code-Blocks).
* [Literal examples](https://orgmode.org/org.html#Literal-Examples).
* [Code and verbatim strings](https://orgmode.org/org.html#Emphasis-and-Monospace-1).
* URLs: See [URL handling](https://orgmode.org/org.html#Structure-of-Code-Blocks) for more information.

## [Comments](org.md#comments)

Vale supports comment-based configuration in Org files:

* Turn Vale off entirely:

```org
# vale off

This text will be ignored.

# vale on
```

* Turn off a specific rule:

```org
# vale Style.Redundancy = NO

This is some text ACT test

# vale Style.Redundancy = YES
```

* Turn off specific match(es) within a rule:

```org
# vale Style.Redundancy["ACT test","OTHER"] = NO

This is some text ACT test

# vale Style.Redundancy["ACT test","OTHER"] = YES
```

* Turn on or off specific styles:

```org
# vale StyleName1 = YES
# vale StyleName2 = NO
```

* Set styles (enabling them and switching off any other styles):

```org
# vale style = StyleName1
# vale styles = StyleName1, StyleName2
```
