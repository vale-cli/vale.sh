# LaTeX

Learn how Vale handles LaTeX content.

{% hint style="info" %}
Requires Vale v3.29.0 or later.
{% endhint %}

Vale reads [LaTeX](https://www.latex-project.org/) without running TeX. Support is built in—nothing to install.

The supported extensions are `.tex`, `.ltx`, and `.latex`.

Because nothing is compiled, a document that doesn't build still lints, no package is loaded, and each file is read on its own: `\input` and `\include` aren't followed, so a chapter kept in its own file lints like any other.

By default, Vale ignores:

* The preamble: everything before `\begin{document}` except the `\title`, and everything after `\end{document}`.
* Math: `$x^2$`, `\(...\)`, `\[...\]`, `$$...$$`, and environments such as `equation` and `align`.
* Verbatim text: `\verb`, `\texttt`, `\url`, `\lstinline`, and the `verbatim`, `lstlisting`, and `minted` environments.
* Keys: the arguments of `\cite` and its natbib and biblatex relatives, `\ref` and its relatives, and `\label`.
* Setup: `\usepackage`, `\newcommand`, `\includegraphics`, `\input`, lengths, counters, colors, and the options in `[...]`.
* Drawings and bibliographies: `tikzpicture` and `thebibliography`.
* Comments: `%` to the end of the line.

Everything else is prose in its scope: `\title`, `\chapter`, `\section`, and the levels below it are `heading`; `\textbf` is `strong` and `\emph` and `\textit` are `emphasis`; `\item` is a `list` entry; a `tabular` cell is a table cell; `\caption` is a figure caption; and the text of an `\href` is a `link`.

Text is read as it prints: `~` is a space, ` ``quoted'' ` is “quoted”, `--` and `---` are dashes, `\%` is `%`, and `caf\'e` is `café`. Alerts are mapped back to their positions in the source file.

## [Footnotes](latex.md#footnotes)

A `\footnote` is a paragraph of its own rather than part of the sentence it's attached to, so neither interrupts the other:

```latex
Vale reads this sentence whole.\footnote{And this one on its own.}
```

`\thanks`, `\marginpar`, and `\todo` are read the same way.

## [Environments](latex.md#environments)

`quote`, `quotation`, and `verse` are block quotes. Any other environment becomes a [class scope](../topics/scopes.md#class-scopes) named after it, so a rule can target the text of an `abstract`, a `theorem`, or an environment of your own:

```yaml
extends: existence
message: "Don't use '%s' in an abstract."
scope: class.abstract
level: error
tokens:
  - we
```

## [Your own commands](latex.md#your-own-commands)

Vale doesn't expand macros. A command it doesn't know is treated as markup and its braced arguments as prose, so `\product{Vale} reads files` lints as `Vale reads files`.

When a command of yours takes something that isn't prose, tell Vale to skip it with [`TokenIgnores`](../keys/tokenignores.md):

```ini
[*.tex]
TokenIgnores = (\\apiname\{[^}]+\})
```

## [Comments](latex.md#comments)

Comment-based configuration is written in a `%` comment:

```latex
% vale off

This paragraph isn't linted.

% vale on

% vale Vale.Spelling = NO
```
