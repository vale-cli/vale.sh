---
title: 'Spell checking is a parsing problem, part 1: markup'
description: 'Fourteen markup formats, five spell checkers. Every tool finds the misspellings; only the one that parses the format leaves the markup alone, and on most formats it costs no more to run.'
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

Every spell checker in this post finds the misspellings in your prose. That is not what separates them. What separates them is everything else they report: the identifier in a code block, the path in a URL, the option under a directive. To leave those alone, a tool has to know where the prose ends, and there are two ways to know that: parse the markup, or guess at it with patterns.

Vale parses. The other tools here read tokens and guess. On fourteen markup formats, which is every one Vale reads, Vale is the only tool whose output is a list of misspellings and nothing else. On most of those formats it gets there in about the time the fastest token reader takes. The rest of this post is the evidence: what each tool finds, what it reports from the markup, how much tuning helps, and what a run costs.

This is the first of three posts. The second does the same for source code, and the third for data files.

## Why the extra reports matter

A spell checker that reads the markup is not slightly noisy. In this benchmark, the token readers report two to five thousand words of markup per document, and every one of them reaches someone who has to decide what to do with it. There are four choices, and none of them is good:

- **Read past them.** The real misspelling is one line in a page of identifiers, and it gets read past with the rest.
- **Add them to the vocabulary.** The word list grows into an index of the codebase, one flag and one function name at a time, and it accepts every word that once appeared in a code block.
- **Write ignore patterns.** That is the tuned run below, and it closes part of the gap on some formats and widens it on others.
- **Switch the check off.** This is where a noisy check usually ends up.

A clean run is the only kind of output someone will act on line by line, so the clean run is what this post scores.

## How it was measured

Each format gets a generated document of 300 KB with two kinds of nonsense word planted in it. One kind goes in prose, where a checker should report it: headings, paragraphs, list items, table cells, link text, alt text, a note's body. The other kind goes where there is no prose: fenced code, inline code, URLs, file paths, front-matter keys, an HTML comment, a MyST target, a Typst `#let`, a QDoc `\code` block. Every marker is a distinct seven-letter word that no dictionary knows, so each report traces back to one place in the source.

- **Found.** A marker in prose that the tool reported, shown as a percentage of the markers planted in prose.
- **Missed.** A marker in prose that the tool did not report. Red in the tables.
- **Leaked.** A marker in markup that the tool reported anyway: a word that was never prose, reported as a misspelling. Amber in the tables, with the count.
- **Clean run.** Found everything and leaked nothing. Green.
- **Tuned.** A second run of typos, codespell, and cspell with the ignore patterns their documentation offers switched on. As shipped means the tool on its defaults; tuned is the most its documentation says it can do without a parser. The toggle on each table switches between them.

Time and memory are measured on a twin of each document with every marker replaced by an ordinary word, so each tool is timed on a file it finds nothing wrong with. Timing is hyperfine, five runs after a warm-up, on an Apple Silicon Mac, with peak resident memory from a single run. A tool with no reader for a format is skipped, not scored, and the tables say so.

<Callout kind="aside" title="A maker's numbers">
The corpus, the scoring, and the choice of what counts as prose are ours, so read every number here as one the maker produced. The next section says exactly what each tool was and was not given.
</Callout>

### Holding the tools level

Every tool runs spelling and nothing else, with its own dictionaries and no word list on any side. Vale gets a config that enables its spelling rule alone. Two formats need something extra. XML is read through an XSLT the user writes, and the corpus ships a twenty-line one naming its prose elements. DITA goes through the DITA Open Toolkit.

typos and codespell report only words on their list of known misspellings, so a nonsense marker is invisible to them until the list includes it. The corpus gives each of them a list of its markers. Without that list they report nothing; with it, the markers stand in for words on the list.

For the tuned runs, cspell's `ignoreRegExpList`, the `extend-ignore-re` of typos, and codespell's `--ignore-regex` each get the same patterns: front matter, fenced blocks, inline code, HTML and XML comments and tags, AsciiDoc listing blocks, Org source blocks and verbatim spans, QDoc code commands, and Typst code mode. codespell gets only the single-line patterns, because its multi-line ignore shifts the line numbers it reports after each match, and the scorer can no longer place them. That is as close as we could get a pattern to a parser.

Two tools are missing. Harper's command-line interface describes itself as a debugging tool and was not installed on the machine. Hunspell prints no positions and would need a wrapper to be scored.

## The documents

<SpellingSample family="prose" caption="The opening of each document, as each tool read it. The text is the benchmark's, with its markers replaced by the words they stand in for; the highlights are what each tool reported at that position. The count on each tab is found over planted, then leaked." />

Pick a format and switch between the tools. On every format, the prose lights up green under every tab. Under Vale, nothing else lights up. Under the other three, the markup lights up red: the fenced block, the inline span, the front-matter key, the link target, and on formats with more syntax of their own, the directive option, the role, the label, and the comment.

## Only Vale runs clean

<SpellingGrid family="prose" caption="Fourteen formats, five tools, at 300 KB. Green is a clean run; amber found everything and leaked; red missed prose. textlint has readers for Markdown and AsciiDoc only. The toggle shows the tuned runs." />

As shipped, Vale has fourteen clean runs out of fourteen, and no other tool has any. The token readers leak two to five thousand words per document, which is roughly the number of markers planted in each document's markup: they read every token there is. Some of them miss prose as well. typos and cspell miss it on Org, where an emphasis marker they treat as part of the word hides the word. codespell misses it on Markdown, AsciiDoc, and Typst. textlint misses it on both formats it reads, and badly on AsciiDoc.

## Patterns don't close the gap

The obvious reply is that a token reader just needs configuring. The tuned runs test that reply with the patterns each tool's own documentation recommends, and the result depends on the format.

On HTML, the patterns bring typos and cspell to zero leaks, but they lose the 213 words in `alt` and `meta` attributes, because the tag pattern removes those along with the tag. On Markdown, leaks fall from 3,000 to 332, and every one that remains is in an indented code block, which no pattern can tell apart from an indented paragraph. Plain text has no markup to match, so nothing changes.

On the formats with more syntax, tuning makes things worse. On MyST, the fence pattern that removes a code block also removes a `{note}` directive's prose, and a third of the prose goes with it. On reStructuredText, literal blocks run until the indentation ends and links keep their text inside the backticks, so the patterns give up 516 markers of prose to remove 1,500 leaks.

A pattern is a guess about the syntax, and each format decides how good that guess can be. A parser doesn't guess. It knows that a directive's body is prose and a literal block is not, because that's what the format says.

## A clean run at a token reader's cost

<SpellingCost family="prose" caption="What a run costs on each format. Green is the row's fastest time and smallest memory, whichever tool has them, and the dot is the run's verdict from the table above. The toggle shows the tuned runs." />

Parsing does not have to be slow. Vale parses nine of the fourteen formats itself, and on those it takes 90 ms to 300 ms and 44 MB to 60 MB. That is as fast as typos on HTML and plain text, and within a factor of two or three on the rest. typos is the fastest at about 90 ms and 85 MB per document. codespell takes about 130 ms and uses 39 MB, the smallest footprint here. cspell takes a steady 0.8 s and over 200 MB, and textlint takes 3.7 s on AsciiDoc and 16 s on Markdown.

Read the dots alongside the numbers. On twelve of the fourteen formats, the fastest run is an amber one, and its output is a list of every token in the file. The cheapest green run on every row is Vale's.

The other five formats go through another program, and on those the time belongs to that program. Typst through typst2vast and XML through xsltproc each take under a third of a second, and a notebook, whose code cells are read as code, takes 0.2 s. AsciiDoc through Asciidoctor takes 0.5 s, and reStructuredText through Docutils takes 1.3 s. DITA through the DITA Open Toolkit takes 4.5 s and 330 MB, most of it spent starting a Java virtual machine. Those are real costs, and they are the cost of reading the format as its own tools read it. No other tool here parses reStructuredText or DITA, so on those formats there is no cheaper clean run to compare against.

## At scale

The 300 KB documents compare the tools per format. Two more runs compare them per project: a file ten times the size, and a repository of documents.

### One large file

<SpellingScale scenario="md-3mb" caption="A 3 MB Markdown document, with nothing misspelled in it." />

Ten times the bytes cost ten times the time, for every tool. Vale, typos, and cspell each read the 3 MB Markdown document in about a second. codespell, which reads it as plain text, takes a third of a second.

<SpellingScale scenario="rst-3mb" caption="The same document as reStructuredText. Vale's bar is Docutils; the three token readers never parse the format." />

reStructuredText is the exception. Vale converts it with Docutils, the reference implementation, and Docutils gets slower per byte as a document grows: 0.8 s at 300 KB, 3.4 s at 1 MB, and 19 s at 3 MB when measured on its own. Of Vale's 25 s on this file, 24 s are Docutils. The other tools read it as text in about a second, and report every directive and role in it.

At this size, codespell uses 45 MB, as it does for any file. Vale uses 150 MB and cspell 220 MB. typos uses 450 MB, which you wouldn't guess from the small-file runs, where it has the second-smallest footprint.

### One repository

<SpellingRepo caption="A repository of each format: twenty copies of its document in one directory, one invocation per tool." />

typos reads twenty files of any format in about 130 ms. codespell takes half a second and cspell a second and a half, whatever the format, since each pays its startup once and then reads tokens. Vale lints the files in parallel, so on the nine formats it parses itself it takes 0.2 s to 0.9 s. On those rows it's ahead of codespell and cspell and behind only typos. On the other five, the converters set the pace: Typst and XML stay under a second, AsciiDoc takes 1.5 s, reStructuredText 8 s, and DITA 15 s and 486 MB, with the toolkit called once for the directory.

## What it costs in CI

GitHub-hosted Linux runners bill $0.006 a minute for private repositories and nothing for public ones, so the difference between a one-second check and a ten-second one is not what shows up on the bill. What costs a team is the false positives: every report from the markup is something a person reads, ignores, or writes a pattern for, and the tuned rows show how far patterns get. A check that reports only misspellings can fail the build. A check that reports thousands of tokens can only print a warning, and nobody reads it.

Memory decides where a check can run. codespell at 45 MB and Vale at 50 MB to 150 MB on a single file fit beside anything. cspell at 200 MB, typos at 450 MB on a large file, and Vale at 486 MB on a repository of DITA are worth knowing before you add the step to a job that also builds the site. Installing the tool is part of the cost too. Vale and typos are each a single binary. codespell needs Python, and cspell and textlint need Node and a package install. Vale needs Python for reStructuredText, Ruby for AsciiDoc, the toolkit for DITA, typst2vast for Typst, and xsltproc for XML; the other nine formats it reads with nothing installed.

## Use the tool that reads the format

If the output of a spell check is going to be read, it has to be a list of misspellings. On every markup format here, Vale is the only tool that produces one, as shipped, with no patterns to write or maintain.

- **Markdown, HTML, or plain text.** Vale runs clean at the cost of the fastest token reader. A tuned typos or cspell gets close on HTML and Markdown, but loses alt text and indented code.
- **AsciiDoc, Org, MDX, Quarto, Typst, QDoc, XML, or a notebook.** Vale runs clean, and no other tool gets within a thousand leaks of it, tuned or not.
- **reStructuredText or MyST.** Vale runs clean and is the only tool that reads the format. A pattern cannot express a literal block or tell a prose directive from a code block. On reStructuredText, the price is Docutils: about a second per 300 KB, and more on large files.
- **DITA.** Vale reads it through the DITA Open Toolkit, and the toolkit is the cost: seconds and a few hundred megabytes per run.

## What this does not measure

The markers are nonsense to every dictionary, so this benchmark says nothing about whose dictionary is better, whose suggestions are closer, or how each tool handles British spellings or a technical vocabulary. It does not measure editor integrations, where startup is paid once, or how much configuration a real project ends up with. And fourteen formats is not every format: a tool with no reader for a format is skipped, not failed, and the tables say so.
