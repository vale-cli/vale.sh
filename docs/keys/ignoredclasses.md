# IgnoredClasses

Learn about how to ignore HTML classes.

```ini
StylesPath = styles

IgnoredClasses = my-class, another-class

[*.md]
BasedOnStyles = Vale
```

`IgnoredClasses` names HTML classes whose content Vale won't lint. The classes may appear on inline- or block-level elements.

By default, Vale ignores `problematic`, `pre`, and `code`.

{% hint style="info" %}
Unlike [`IgnoredScopes`](ignoredscopes.md) and [`SkippedScopes`](skippedscopes.md), which replace their defaults when you set them, `IgnoredClasses` **adds** to the list. The three defaults above stay ignored whatever you set.
{% endhint %}

This is most useful for content a documentation tool generates, where the markup carries classes the prose doesn't control:

```ini
# Sphinx marks unresolved references this way; there's no point
# spell-checking them.
IgnoredClasses = problematic, guilabel, menuselection
```

Because this key matches classes rather than tags, it's the one to reach for when what you want to skip isn't a distinct element—an inline `<span>` among other `<span>`s, say.

Related: [IgnoredScopes](ignoredscopes.md) [SkippedScopes](skippedscopes.md)
