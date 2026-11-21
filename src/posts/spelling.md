---
title: 'Spell checking is a parsing problem, part 1: markup'
description: 'Vale reads the format before it checks the spelling, so on fourteen markup formats its output is the misspellings in your prose and nothing else. What that gets you, how fast it is, and how to bring a technical vocabulary along.'
date: '2026-09-25'
tags: ['formats']
motif: 'spelling'
imageAlt: 'A Markdown page, a reStructuredText page, and an HTML page sketched as bars, with the prose lit, the markup dark, and one alert in each at its exact position.'
draft: true
---

<script>
  import Callout from '$lib/components/blog/Callout.svelte';
  import SpellingCost from '$lib/components/blog/SpellingCost.svelte';
  import SpellingGrid from '$lib/components/blog/SpellingGrid.svelte';
  import SpellingSample from '$lib/components/blog/SpellingSample.svelte';
</script>

A spell checker sees a document as words, and most of a technical document's words aren't prose: an identifier in a code block, a path in a URL, an option under a directive. Vale reads the format first. It knows where a Markdown code block starts and ends, that a reStructuredText literal block isn't prose, and that a link's text is prose while its target isn't. So it checks the prose and leaves the rest alone, and what it reports is the misspellings in your writing.

This post shows what that looks like on fourteen markup formats, what it costs, and how to give Vale a technical vocabulary. It's the first of three: the second does the same for comments in source code, and the third for the prose fields of data files.

## What Vale reads

<SpellingSample family="prose" caption="The opening of each test document, and what each tool reported in it. The count on each tab is the misspellings found in prose, then the words reported from code and other markup." />

Pick a format. The planted misspellings sit in headings, paragraphs, list items, link text, and table cells, and the code blocks, URLs, front matter, and directives around them hold words no dictionary knows either. Under the Vale tab, the misspellings are marked and the markup is left alone, because Vale never sends it to the spell checker.

The other tabs show tools that read a file as text, which is what they're built for. typos and codespell look for known misspellings across a whole repository, code included, and they're very good at it. cspell is designed to sit in your editor and check everything you type. Point any of them at a Markdown file and they check its markup as well, because to them it's more text.

## Why it matters

A spell check is useful when every alert is worth acting on. Then it can run in CI and fail the build, and in an editor a red line always means something. When the code around the prose is checked too, the misspellings arrive with a list of identifiers, and the usual answers are to add them to a word list or to write patterns that skip the markup. Both work, and both are configuration someone has to keep up.

Reading the format is the version of that work the format has already done. The grammar knows what's prose, so there's nothing to write and nothing to maintain.

## Across fourteen formats

<SpellingGrid family="prose" caption="Fourteen formats at 300 KB. Green: every planted misspelling found and nothing reported from markup. Amber: every misspelling found, plus words from markup. Red: some prose not reached. textlint reads Markdown and AsciiDoc. The toggle switches on the ignore patterns each tool's documentation suggests." />

Vale has a clean run on all fourteen formats. The toggle shows what ignore patterns add to the text-based tools: on HTML and Markdown they get most of the way, and on formats with more syntax of their own, such as MyST and reStructuredText, a pattern can't always tell a prose block from a code block, which is the distinction a parser makes for free.

## At the same speed

<SpellingCost family="prose" caption="Time and memory for one 300 KB document. Green is the fastest time and smallest footprint in each row; the dot is the run's result from the table above. The toggle shows the runs with ignore patterns." />

Reading the format doesn't make Vale slow. It reads eleven of the fourteen formats itself, in 50 ms to 150 ms and 70 MB or less per document, which is in the same range as the fastest tools here. A 3 MB document takes about a second, and a repository of twenty documents, checked in parallel, takes under a second on every format Vale reads itself. Typst and XML go through another program and still take under 150 ms; DITA goes through the DITA Open Toolkit, which takes about 3 s.

## A technical vocabulary

A dictionary of English doesn't know `kubeadm`, `Buildx`, or `vSphere`, and technical writing is full of words like them. cspell's maintainers have spent years collecting them, in MIT-licensed word lists for software terms, companies, file types, and dozens of languages and frameworks.

[TechTerms](https://github.com/jdkato/techterms) packages those lists as a Vale dictionary: 115,000 terms from 53 of cspell's lists, each with its license and credit. Add it and `Vale.Spelling` uses it beside its own dictionary, with no style to configure:

```ini
StylesPath = styles
Packages = TechTerms

[*.md]
BasedOnStyles = Vale
```

On the Kubernetes, Docker, and Grafana documentation and CPython's library reference, about 4.7 million words, it accepts 42% to 56% of the words Vale flagged in their prose, and adds about 60 ms to Vale's startup.

## One tool for spelling and style

Clean output is one reason to use Vale for spelling. Here are the others:

- **Every format you write in.** Markdown, MDX, AsciiDoc, reStructuredText, MyST, Quarto, Org, HTML, XML, DITA, Typst, QDoc, notebooks, and plain text, each read the way its own tools read it.
- **Exceptions where they belong.** A comment in the file turns a rule off for a passage, or for one word: `<!-- vale Vale.Spelling["Pulumi"] = NO -->` in Markdown, `.. vale off` in reStructuredText, `# vale off` in Org. The exception sits next to the text it excuses.
- **One configuration.** The same `.vale.ini` runs spelling, your terminology, and your style guide, so there's one check to install, one place to tune, and one list of alerts.
- **A vocabulary you review.** Accepted and rejected terms are plain text files in your repository, changed in pull requests like everything else, and every rule shares them.
- **Exact positions.** Each alert has its line and column, so an editor can underline it and a pull request can comment on the line.
- **Everywhere you write.** The same configuration runs on the command line, in CI, in your editor through the language server, in the browser extension, and in your coding assistant.
- **Offline.** Vale is a single binary. No text leaves your machine, and eleven of the fourteen formats need nothing else installed.

## How it was measured

<Callout kind="aside" title="A maker's numbers">
The corpus, the scoring, and the choice of what counts as prose are ours, so read every number here as one the maker produced. The details below say exactly what each tool was and was not given.
</Callout>

Each format gets a generated 300 KB document with two kinds of made-up word planted in it: one kind in prose, where a checker should report it, and one in code, URLs, file paths, comments, and other markup, where it shouldn't. Every planted word is distinct, so each report traces back to one place in the source. A **clean run** found every word in prose and reported none in markup. Time and memory are measured on a copy of each document with nothing misspelled, using hyperfine, five runs after a warm-up, on an Apple Silicon Mac.

The tools are Vale 3.28.1, cspell 10.0.1, typos 1.50.2, codespell 2.4.3, and textlint 15.7.1 with textlint-rule-spelling. Every tool runs spelling and nothing else, with its own dictionaries. typos and codespell only report words on their list of known misspellings, so each gets a list of the planted words. The runs with ignore patterns give cspell, typos, and codespell the same patterns: front matter, fenced blocks, inline code, comments and tags, and each format's code blocks. XML is read through a twenty-line XSLT naming its prose elements, and DITA through the DITA Open Toolkit. Harper's command-line tool describes itself as a debugging tool and wasn't installed; Hunspell prints no positions, so it couldn't be scored.

The planted words are nonsense to every dictionary, so the format benchmark says nothing about dictionaries, suggestions, or British spellings. The TechTerms figures come from a separate run over the four documentation sets with Vale alone, with and without the package. And a tool with no reader for a format is skipped, not failed.
