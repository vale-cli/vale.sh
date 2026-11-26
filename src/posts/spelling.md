---
title: 'Spell checking is a parsing problem'
description: 'Vale reads the format before it checks the spelling, so in fifteen markup formats, six programming languages, and three data formats, its output is the misspellings in your prose and nothing else. What that gets you, how fast it is, and how to bring a technical vocabulary along.'
date: '2026-11-26'
tags: ['formats', 'releases']
release: 'v3.29.0'
motif: 'spelling'
imageAlt: 'A Markdown page, a Go file, and a YAML file sketched as bars, with the prose lit, the code and markup dark, and one alert in each at its exact position.'
draft: false
---

<script>
  import Callout from '$lib/components/blog/Callout.svelte';
  import SpellingGrid from '$lib/components/blog/SpellingGrid.svelte';
  import SpellingSample from '$lib/components/blog/SpellingSample.svelte';
</script>

A spell checker sees a document as words, and most of a technical document's words aren't prose: an identifier in a code block, a path in a URL, an option under a directive. Vale reads the format first. It knows where a Markdown code block starts and ends, that a reStructuredText literal block isn't prose, and that a link's text is prose while its target isn't. So it checks the prose and leaves the rest alone, and what it reports is the misspellings in your writing.

The same goes for the prose outside documents: the comments in source code, which have markup of their own, and the descriptions in a data file. This post shows what that looks like across twenty-four formats, what it costs, and how to give Vale a technical vocabulary.

## What Vale reads

<SpellingSample family="prose" caption="The opening of each test document. Misspellings are planted in its prose, and words no dictionary knows in its code, URLs, and other markup; the marks show what Vale did with each." />

Pick a format. The planted misspellings sit in headings, paragraphs, list items, link text, and table cells, and the code blocks, URLs, front matter, and directives around them hold words no dictionary knows either. Vale marks the misspellings and leaves the markup alone, because it never sends the markup to the spell checker.

## Why it matters

A spell check is useful when every alert is worth acting on. Then it can run in CI and fail the build, and in an editor a red line always means something. When the code around the prose is checked too, the misspellings arrive with a list of identifiers, and the usual answers are to add them to a word list or to write patterns that skip the markup. Both work, and both are configuration someone has to keep up.

Reading the format is the version of that work the format has already done. The grammar knows what's prose, so there's nothing to write and nothing to maintain.

## What teams do today

We looked at 992 public repositories with a `.vale.ini`. 132 of them, 13%, also run a second spell checker, and their configuration shows how much care goes into keeping a text-based check quiet on documentation:

- **Patterns for the format.** One documentation team maintains fifteen named patterns, among them its own rules for Markdown code blocks and links, so the checker skips them.
- **Word lists that grow with the code.** Teams keep a few hundred to over a thousand accepted words. One splits its list into commands, aliases, file extensions, and product terms; another shares 1,600 words across five lists that several repositories pull in.
- **Directories set aside.** Generated reference pages and code samples are excluded by path, sometimes into a folder made for the purpose.

Several of these repositories turn Vale's spelling off and leave spelling to the other tool, and the setups we read lean on that tool's technical dictionaries, which know the names and terms a general dictionary doesn't. That's the gap the next sections close. Vale reads the format, so the patterns and the directories aren't needed, and a technical dictionary takes care of most of the word list.

## Twenty-four formats, at full speed

<SpellingGrid caption="Vale on each format's 300 KB test document: what reads it, the planted misspellings it found, the planted words from code and markup it reported, and what the run cost." />

On every format, Vale finds every planted misspelling and reports nothing from the code or markup around it.

**Markup.** Vale reads thirteen of the fifteen formats itself, in 50 ms to 150 ms and 70 MB or less per document. XML goes through xsltproc and still takes under 150 ms; DITA goes through the DITA Open Toolkit, which takes about 3 s. A 3 MB Markdown document takes about a second, and 1.5 s as reStructuredText; a repository of twenty documents, checked in parallel, takes under a second on every format Vale reads itself.

**Comments in source code.** Vale finds comments with a tree-sitter grammar, so a `//` inside a string isn't a comment, and reads each comment in the markup it's written in, so a code block inside a doc comment is code. It also knows each language's documentation conventions: a Go doc link, a Rust intra-doc link, a Python field name, and a `# noqa` directive are left alone. Each of the six languages here takes 0.15 s to 0.26 s.

**Data files.** A View names the fields that hold prose, such as a title or a description, and a data file's comments are read whatever the View selects.

Code and data need a few lines of configuration: the grammars, which `vale sync` installs, what each language's comments are written in, and a View for the data files.

```ini
StylesPath = styles
Grammars = go, python, rust, java, kotlin, javascript, yaml, toml

[formats]
go = md
rs = md
kt = md
js = md
py = rst
java = html

[*]
BasedOnStyles = Vale

[*.{yml,json,toml}]
View = Data
```

## A technical vocabulary

A dictionary of English doesn't know `kubeadm`, `Buildx`, or `vSphere`, and technical writing is full of words like them. cspell's maintainers have spent years collecting them, in MIT-licensed word lists for software terms, companies, file types, and dozens of languages and frameworks.

[TechTerms](https://github.com/jdkato/techterms) packages those lists as a Vale dictionary: 115,000 terms from 53 of cspell's lists, each with its license and credit. Add it and `Vale.Spelling` uses it beside its own dictionary, with no style to configure:

```ini
StylesPath = styles
Packages = TechTerms

[*.md]
BasedOnStyles = Vale
```

Here is what it does on four real documentation sets, each checked whole in one run:

| Documentation | Files | Words | Words flagged in prose | With TechTerms | Time |
| --- | ---: | ---: | ---: | ---: | ---: |
| Kubernetes | 1,734 | 1.86 M | 969 | 552 | 1.4 s |
| Docker | 871 | 0.91 M | 836 | 470 | 0.8 s |
| Grafana | 800 | 1.00 M | 559 | 322 | 0.9 s |
| CPython (reStructuredText) | 340 | 0.92 M | 1,593 | 697 | 1.0 s |

It accepts 42% to 56% of the distinct words Vale flagged, and costs about 60 ms at startup. What's left is mostly each project's own vocabulary, such as its product names, its API objects, and the people it credits, which is what a project's word list is for.

## One tool for spelling and style

Clean output is one reason to use Vale for spelling. Here are the others:

- **Every format you write in.** Markdown, MDX, AsciiDoc, reStructuredText, MyST, Quarto, Org, HTML, XML, DITA, Typst, LaTeX, QDoc, notebooks, and plain text, each read the way its own tools read it, plus the comments in more than twenty programming languages and the prose fields of data files.
- **Exceptions where they belong.** A comment in the file turns a rule off for a passage, or for one word: `<!-- vale Vale.Spelling["Pulumi"] = NO -->` in Markdown, `.. vale off` in reStructuredText, `# vale off` in Org. The exception sits next to the text it excuses.
- **One configuration.** The same `.vale.ini` runs spelling, your terminology, and your style guide, so there's one check to install, one place to tune, and one list of alerts.
- **A vocabulary you review.** Accepted and rejected terms are plain text files in your repository, changed in pull requests like everything else, and every rule shares them.
- **Exact positions.** Each alert has its line and column, so an editor can underline it and a pull request can comment on the line.
- **Everywhere you write.** The same configuration runs on the command line, in CI, in your editor through the language server, in the browser extension, and in your coding assistant.
- **Offline.** Vale is a single binary. No text leaves your machine, and thirteen of the fifteen formats need nothing else installed.

## How it was measured

<Callout kind="aside" title="Our numbers">
The test documents, the scoring, and the choice of what counts as prose are ours. The details below say how each number was produced, so you can reproduce it.
</Callout>

Each format gets a generated 300 KB document with two kinds of made-up word planted in it: one kind in prose, where a spell checker should report it, and one in code, URLs, file paths, comments, and other markup, where it shouldn't. Every planted word is distinct, so each report traces back to one place in the source. Time and memory are measured on a copy of each document with nothing misspelled, using hyperfine, five runs after a warm-up, on an Apple Silicon Mac.

Every run uses `Vale.Spelling` alone. Typst, LaTeX, and the source and data formats use Vale 3.29.0; the other markup formats use 3.28.1. Source files are read with their grammars installed and the `[formats]` associations above; the data files' View names their `title`, `description`, `notes`, and `summary` fields. XML is read through a twenty-line XSLT naming its prose elements, and DITA through the DITA Open Toolkit.

The survey searched GitHub's code index for `.vale.ini` files and added the repositories on [our adopters page](/adopters), 992 in all, then looked in each one for the configuration files of cspell, typos, codespell, textlint, and PySpelling, and in its workflows for their GitHub Actions. The descriptions of individual setups come from reading sixteen of them.

The documentation sets are Kubernetes' `content/en/docs`, Docker's `content/manuals`, Grafana's `docs/sources`, and CPython's `Doc/library`, as of November 21, 2026. "Words flagged in prose" counts distinct words, with `Vale.Spelling` alone and the default configuration; each set was timed over three runs after a warm-up.

The planted words are nonsense to every dictionary, so the format test says nothing about dictionaries or suggestions; the TechTerms figures come from the documentation sets.
