---
title: 'Spell checking is a parsing problem, part 1: markup'
description: 'Fourteen markup formats, five spell checkers: what each finds in the prose, what each reports from the markup around it, and what a clean run costs in time and memory.'
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
  import SpellingRepo from '$lib/components/blog/SpellingRepo.svelte';
  import SpellingScale from '$lib/components/blog/SpellingScale.svelte';
</script>

<!-- TODO before publishing: rerun the Vale rows on the tagged release (bench -files ... -merge), regenerate src/lib/data/spelling-results.json with script/spelling-rows.mjs, and name every tool's version in "Holding the tools level". If an excerpt changes, rerun script/spelling-tokens.mjs. -->

A spell checker knows words. Every tool in this post knows enough of them that the dictionary is not what separates them. What separates them is which words they look at: the sentence in a paragraph, yes; the identifier in a code block, the path in a URL, the option under a directive, no. That is a question about the markup, and a tool answers it either by parsing the format or by guessing at it with patterns.

This post measures the answer on fourteen markup formats, which is every one Vale reads. A second post will do the same for source code, where the question is different, and a third for data files, where it is different again.

## How it was measured

Each format gets a generated document of 300 KB that plants two kinds of nonsense word. One kind goes in prose, where a checker should report it: headings, paragraphs, list items, table cells, link text, alt text, a note's body. The other goes where prose is not: fenced code, inline code, URLs, file paths, front-matter keys, an HTML comment, a MyST target, a Typst `#let`, a QDoc `\code` block. Every marker is a distinct seven-letter word that no dictionary knows, so a report traces to one place in the source and says one thing: the tool read that position.

Six words carry the rest of the post, and they mean exactly this:

- **Marker.** One of the planted words. A marker in prose is a misspelling the tool should report. A marker in markup stands for a word no checker should touch: an identifier, a flag, an argument.
- **Found.** A marker in prose that the tool reported. Shown as a percentage of the markers planted in prose, so 100% means every misspelling in the document's text was caught.
- **Missed.** A marker in prose that the tool did not report. In the tables, red.
- **Leaked.** A marker in markup that the tool reported anyway. Each one is a false positive: a word that was never prose, reported as a misspelling. In the tables, amber, with the count.
- **Clean run.** Found everything, leaked nothing. Green. It is the only kind of run whose output can be read as a list of misspellings, and every cell in the cost table carries its verdict as a dot, because the time a run took means little when its output is a list of every token in the file.
- **Tuned.** A second run of typos, codespell, and cspell with their own ignore patterns switched on: the regular expressions each tool's documentation offers for skipping fenced code, inline code, front matter, and comments. As shipped is the tool on its defaults; tuned is the most its documentation says it can do without a parser. The toggle on each table switches between them.

Time and memory are measured on a twin of each document with every marker replaced by an ordinary word, so a tool is timed reading a file it finds nothing wrong with rather than generating thousands of suggestions: hyperfine, five runs after a warm-up, on an Apple Silicon Mac, with peak resident memory from a single run. A tool with no reader for a format is skipped rather than scored, and the tables say so.

<Callout kind="aside" title="A maker's numbers">
The corpus, the scoring, and the choice of what counts as prose are ours, so read every number here as one the maker produced. The section below says exactly what each tool was and was not given.
</Callout>

### Holding the tools level

Every tool runs spelling and nothing else, with its own dictionaries and no word list on any side. Vale gets a config that enables its spelling rule alone. Two formats need something beside it: XML, which Vale reads through an XSLT the user writes, and the corpus ships a twenty-line one naming its prose elements; and DITA, which goes through the DITA Open Toolkit.

typos and codespell report only words on their list of known misspellings, so a nonsense marker is invisible to them until the list says otherwise. The corpus hands each a list of its markers; without one they report nothing, and with one they stand in for words on the list.

Every tool that reads tokens also has a way to read fewer of them, and the tables carry a second run of each with that way used. cspell's `ignoreRegExpList`, the `extend-ignore-re` of typos, and codespell's `--ignore-regex` each take patterns, and each tool's documentation gives fenced code blocks as the example. The **tuned** runs give them the same list: front matter, fenced blocks, inline code, HTML and XML comments and tags, AsciiDoc listing blocks, Org source blocks and verbatim spans, QDoc code commands, Typst code mode. codespell gets only the single-line patterns, because its multi-line ignore shifts the line numbers it reports after each match and the scorer can no longer place them. That is the fairest reading of how close a pattern can get to a parser.

Two tools are missing. Harper's command-line interface describes itself as a debugging tool and was not installed on the machine. Hunspell prints no positions and would need a wrapper to be scored.

## The documents

<SpellingSample family="prose" caption="The opening of each document, as each tool read it. The text is the benchmark's, with its markers replaced by the words they stand in for; the highlights are what each tool reported at that position. The count on each tab is found over planted, then leaked." />

Pick a format and switch between the tools, and the shape of the result is the same on every one. The prose lights up green under every tab. Under Vale, nothing else does. Under the other three, the markup lights up red: the fenced block, the inline span, the front-matter key, the link target, and on the formats with more syntax of their own, the directive option, the role, the label, the comment.

## The score

<SpellingGrid family="prose" caption="Fourteen formats, five tools, at 300 KB. Green is a clean run; amber found everything and leaked; red missed prose. textlint has readers for Markdown and AsciiDoc only. The toggle shows the tuned runs." />

As shipped, every tool finds the prose and only Vale leaves the markup alone: fourteen clean runs, against none for the rest. The token readers leak two to five thousand words per document, which is roughly the number of markers planted in each document's markup, since they read every token there is. Three tools also miss prose in places: typos and cspell on Org, where an emphasis marker they treat as part of the word hides it; codespell on Markdown, AsciiDoc, and Typst; and textlint on both formats it reads, badly on AsciiDoc.

Tuned, the picture changes on some formats and not on others, and where it changes says what a pattern is. On HTML, the patterns bring typos and cspell to zero leaks, at the price of the 213 words in `alt` and `meta` attributes, which the tag pattern removes with the tag. On Markdown, leaks fall from 3,000 to 332, all of them in indented code blocks, which no pattern can tell from an indented paragraph. On plain text, which has no markup to pattern, nothing changes. And on MyST, tuning costs more than it buys: the fence pattern that removes a code block also removes a `{note}` directive's prose, and a third of the prose goes with it. reStructuredText, whose literal blocks run until the indentation ends and whose links keep their text inside the backticks, gives up 516 markers of prose to keep 1,500 leaks. The patterns are guesses about the syntax, and each format's syntax decides how good a guess it is.

## The cost

<SpellingCost family="prose" caption="What a run costs on each format. Green is the row's fastest time and smallest memory, whichever tool has them, and the dot is the run's verdict from the table above. The toggle shows the tuned runs." />

typos reads any document in about 90 ms and 85 MB, and it is the fastest run on almost every row. codespell is next at about 130 ms and 39 MB, the smallest footprint here. cspell is a steady 0.8 s and over 200 MB, and textlint 3.7 s on AsciiDoc and 16 s on Markdown.

Vale parses nine of the fourteen formats itself, and on those it is between 90 ms and 300 ms and 44 to 60 MB: as fast as typos on HTML and plain text, within a factor of two or three on the rest. The other five go to another program, and the row says whose time it is: AsciiDoc through Asciidoctor at 0.5 s, reStructuredText through Docutils at 1.3 s, DITA through the DITA Open Toolkit at 4.5 s and 330 MB, most of it a Java virtual machine starting. Typst through typst2vast and XML through xsltproc are both under a third of a second, and a notebook, whose code cells are read as code, is 0.2 s.

Read the dots with the numbers. On twelve of fourteen formats the fastest run is an amber one, whose output is a list of every token in the file, and the cheapest green run is Vale's.

## At scale

The 300 KB documents answer the question per format. Two more runs answer it per project: a file ten times the size, and a repository of documents.

### One large file

<SpellingScale scenario="md-3mb" caption="A 3 MB Markdown document, with nothing misspelled in it." />

Ten times the bytes cost ten times the time, for every tool. Vale, typos, and cspell each read the 3 MB Markdown document in about a second; codespell, which reads it as plain text, in a third of one. Nothing here changes the small-file picture except the scale on the axis.

<SpellingScale scenario="rst-3mb" caption="The same document as reStructuredText. Vale's bar is Docutils; the three token readers never parse the format." />

reStructuredText is the exception. Vale converts it with Docutils, the reference implementation, and Docutils gets slower per byte as a document grows: 0.8 s at 300 KB, 3.4 s at 1 MB, 19 s at 3 MB, measured on its own. Of Vale's 25 s on this file, 24 are Docutils. The other tools read it as text in about a second, and report every directive and role in it.

Memory at this size sorts the tools into three groups. codespell holds 45 MB, as it does for any file. Vale holds 150 MB and cspell 220 MB. typos holds 450 MB, the one number a reader would not guess from the small-file runs, where it is the second-smallest.

### One repository

<SpellingRepo caption="A repository of each format: twenty copies of its document in one directory, one invocation per tool." />

The number to read is the one on your own row. typos reads twenty files of anything in about 130 ms. codespell takes half a second and cspell a second and a half, whatever the format, since each pays its startup once and then reads tokens. Vale lints the files in parallel, so on the nine formats it parses itself it is between 0.2 s and 0.9 s, ahead of codespell and cspell on every one of those rows and behind only typos. The converters set the pace on the other five: Typst and XML are still under a second, AsciiDoc is 1.5 s, reStructuredText 8 s, and DITA 15 s and 486 MB, with the toolkit called once for the directory.

## What it costs in CI

On GitHub-hosted Linux runners, which bill at $0.006 a minute for private repositories and nothing for public ones, the difference between a one-second check and a ten-second one is not the bill. The bill is the false positives: the reports from markup that someone either reads or teaches the checker to ignore, one pattern or one word-list entry at a time, and the tuned rows above are what that buys. Memory decides where the check can run: codespell at 45 MB and Vale at 50 to 150 MB on a file fit beside anything, and cspell at 200 MB, typos at 450 MB on a large file, and Vale at 490 MB on a repository of DITA are numbers to know before adding the step to a job that also builds the site. And the install is part of the cost. Vale and typos are a single binary each. codespell needs Python, cspell and textlint need Node and a package install, and Vale needs Python for reStructuredText, Ruby for AsciiDoc, and the toolkit for DITA; the other eleven formats it reads with nothing installed.

## If you write

**Markdown, HTML, or plain text.** Vale is the clean run, and it costs what the fastest token reader costs. A tuned typos or cspell gets close on HTML and Markdown, minus alt text and indented code.

**AsciiDoc, Org, MDX, Quarto, Typst, QDoc, XML, or a notebook.** Vale is the clean run, and nothing else gets within a thousand leaks of it, tuned or not.

**reStructuredText or MyST.** Vale is the clean run and the only one that reads the format; a pattern cannot express a literal block or tell a prose directive from a code block. On reStructuredText the price is Docutils, a second per 300 KB, more on large files.

**DITA.** Vale reads it through the DITA Open Toolkit, and the toolkit is the cost: seconds and a few hundred megabytes per run.

## What this does not measure

The markers are nonsense to every dictionary, so this says nothing about whose dictionary is better, whose suggestions are closer, or how each tool handles British spellings or a technical vocabulary. It does not measure editor integrations, where startup is paid once, or how much configuration a real project ends up with. And fourteen formats is not every format: a tool with no reader for one is skipped, not failed, and the tables say so where that happened.
