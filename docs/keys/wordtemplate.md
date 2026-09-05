# WordTemplate

Learn about how to change what Vale considers a word boundary.

```ini
StylesPath = styles
MinAlertLevel = suggestion

WordTemplate = (?m)(?:%s)

[*.md]
BasedOnStyles = Vale
```

`WordTemplate` sets the pattern Vale wraps a rule's tokens in. The default is:

```
(?m)\b(?:%s)\b
```

`%s` is where the rule's tokens are inserted, and `\b` on either side is what stops `cat` from matching inside `concatenate`. Rules built from token lists—[`existence`](../checks/existence.md), [`substitution`](../checks/substitution.md), [`consistency`](../checks/consistency.md), and [`sequence`](../checks/sequence.md)—all use it.

## [When you need it](wordtemplate.md#when-you-need-it)

`\b` is defined as the boundary between a word character (`[0-9A-Za-z_]`) and anything else. Scripts written outside that set have no word characters at all, so the boundary never occurs and **the rule matches nothing**:

```yaml
extends: existence
message: "Found it."
level: error
tokens:
  - 世界
```

Given the text `你好世界朋友`, that rule reports nothing—and reports nothing for `hello 世界 there` too, where the term is surrounded by spaces. There is no error and no warning; the rule is simply silent.

Setting a template without `\b` fixes it:

```ini
WordTemplate = (?m)(?:%s)
```

```
 a.md
 1:3  error  Found it.  Test.Term
```

{% hint style="warning" %}
This is a global setting: it applies to every token-based rule in every style you load. Dropping `\b` means Latin-script tokens start matching inside longer words, so this is for projects whose content is genuinely in a script `\b` can't handle—not a per-rule adjustment.
{% endhint %}

## [Per-rule alternatives](wordtemplate.md#per-rule-alternatives)

If only some rules need different boundaries, leave `WordTemplate` alone and use the rule's own keys instead:

* `nonword: true` drops the boundaries for one rule.
* `raw` lets a rule supply its pattern verbatim, boundaries included.
