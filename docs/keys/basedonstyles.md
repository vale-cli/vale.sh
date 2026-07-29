# BasedOnStyles

Learn how to enable a style for a specific file type.

```ini
StylesPath = styles

[*.md]
BasedOnStyles = Vale, MyStyle
```

`BasedOnStyles` enables every rule in the named styles for the files a section matches.

It's a section-level setting, so it has to appear under a glob. Putting it above the first section is an error:

```
'BasedOnStyles' is a syntax-specific option
```

To apply styles to everything, use the catch-all section:

```ini
[*]
BasedOnStyles = Vale
```

## [More than one section](basedonstyles.md#more-than-one-section)

When several sections match a file, the most specific one's `BasedOnStyles` **replaces** the others—it doesn't add to them:

```ini
[*]
BasedOnStyles = Vale

[*.md]
# Markdown files get Microsoft *instead of* Vale, not as well as.
BasedOnStyles = Microsoft
```

If you want the defaults plus something extra, name them all:

```ini
[*]
BasedOnStyles = Vale

[*.md]
BasedOnStyles = Vale, Microsoft
```

## [Individual rules](basedonstyles.md#individual-rules)

Rules can be switched on or off by name, and unlike `BasedOnStyles`, these settings **accumulate** across every section that matches:

```ini
[*]
BasedOnStyles = Vale

[*.md]
# Markdown keeps everything from Vale, and adds one rule
# from a style that isn't otherwise enabled.
Microsoft.Contractions = YES
```

That's the way to extend your defaults for one file type without repeating them.

Turning a rule off works the same way:

```ini
[*.md]
BasedOnStyles = Vale, MyStyle

Vale.Spelling = NO
```

A rule can also be enabled on its own, without its style being listed at all:

```ini
[*.md]
# Only this rule runs, not the rest of Style1.
Style1.Rule = YES
```

## [Severity](basedonstyles.md#severity)

The same syntax sets a rule's level, which overrides whatever the rule file declares:

```ini
[*.md]
BasedOnStyles = Vale

Vale.Spelling = warning
```

See [MinAlertLevel](minalertlevel.md) for how levels affect Vale's exit code.

Related: [MinAlertLevel](minalertlevel.md) [SkippedScopes](skippedscopes.md)
