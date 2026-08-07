# QDoc

Learn how Vale handles QDoc content.

{% hint style="info" %}
Requires Vale v3.18.0 or later.
{% endhint %}

[QDoc](https://doc.qt.io/qt-6/01-qdoc-manual.html) is Qt's documentation markup: LaTeX-style commands inside `/*! ... */` comment blocks. Support is built in—nothing to install.

The supported extension is `.qdoc`. Doc comments in C++ and QML sources lint through a [format association](../topics/.vale.ini.md#format-associations):

```ini
[formats]
cpp = qdoc
qml = qdoc

[*.{qdoc,cpp,qml}]
BasedOnStyles = Vale
```

Alerts are mapped back to their positions in the source file. Only block comments (`/*! ... */`) are treated as documentation—`//` line comments are code.

By default, Vale ignores:

* Code blocks: `\code`, `\badcode`, `\qml`, and friends, through their `\end` commands.
* Omitted text: `\omit ... \endomit`.
* Topic and context commands: `\fn`, `\class`, `\page`, `\module`, `\since`, and the rest of their family—the whole line is markup.
* Quoting commands: `\snippet`, `\quotefile`, `\printline`, and so on.
* Links' targets: `\l {target} {text}` keeps its text and drops its target; `\sa` lines say nothing.
* Inline code: `\c` and `\a` arguments.

Everything else is prose in its scope: `\title` and `\section1` through `\section4` are headings, `\li` items are `list` entries or table cells, `\b` and `\e` are `strong` and `emphasis`, and `\caption` is a figure caption.

## [Classed paragraphs](qdoc.md#classed-paragraphs)

`\brief`, `\note`, `\warning`, and `\important` become [class scopes](../topics/scopes.md#class-scopes), so a rule can target them by name:

```yaml
extends: existence
message: "Don't use '%s' in a note."
scope: class.note
level: error
tokens:
  - obviously
```

An unknown command is masked with its text kept, so a QDoc extension Vale doesn't know about degrades to plain prose rather than to noise.
