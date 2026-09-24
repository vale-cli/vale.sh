---
title: 'Linting a manuscript'
description: 'Journals is a Vale package for scientific papers: the conventions every journal shares, the Nature and PLOS ONE author guidelines, and the CONSORT, STROBE, and PRISMA checklists, read section by section.'
date: '2026-09-17'
tags: ['packages', 'formats']
motif: 'manuscript'
imageAlt: 'A manuscript in a terminal window, its headings lit as sections, with one alert on a unit and one on the Methods heading.'
---

<script>
  import Callout from '$lib/components/blog/Callout.svelte';
  import ChecklistCoverage from '$lib/components/blog/ChecklistCoverage.svelte';
  import JournalsRuleChart from '$lib/components/blog/JournalsRuleChart.svelte';
</script>

Every journal publishes a page of instructions for authors. Nature's says a title is at most 75 characters and a summary paragraph at most 200 words. PLOS ONE says to cite figures as `Fig 1`, references as `[1]`, and to report an exact p-value for anything at or above 0.001. Then there are the reporting checklists. CONSORT has 30 items a trial report has to cover, PRISMA has 27 for a systematic review, STROBE has 22 for an observational study, and a journal will ask for the completed checklist with the submission.

Most of that is checkable, and almost none of it gets checked before a reviewer reads the paper. [Journals](https://github.com/jdkato/journals) is a Vale package that does it: 121 rules in seven styles, for Markdown, Quarto, R Markdown, MyST, Typst, and Jupyter notebooks.

```ini
StylesPath = styles
Packages = Journals
Vocab = Journals

[*.md]
BasedOnStyles = Journals, IMRaD, PLOS, CONSORT
IMRaD.AbstractLength[max] = 300
IMRaD.AbstractCitations = error
```

`Journals` is the core, on for everyone: a space before a unit, an en dash in a range, `p = 0.03` spaced and `p = 0.000` rejected, `data are`, `et al.`, `Figure 2` capitalized and cited by number rather than as "the figure below", a species name in italics, no `[ref]` or `TODO` left in the text. `IMRaD` wants the standard sections and an abstract within budget. `Nature` and `PLOS` are the two author guides. `CONSORT`, `STROBE`, and `PRISMA` are the checklists.

<JournalsRuleChart caption="121 rules across seven styles. Each rule links to the passage or checklist item it enforces." />

## Sections

A checklist item is usually about a section. CONSORT item 16 says the Methods explain how the sample size was determined. Item 18 says the Results present baseline characteristics. Item 28 says the Discussion addresses limitations. A rule has to know which section it's reading.

Since v3.21.0 a rule can scope itself to part of a document with a CSS selector over the document's structure. A section is a heading and what follows it, so the sample-size rule is this:

```yaml
extends: occurrence
message: "Methods say how the sample size was determined (item 16)."
link: https://doi.org/10.1371/journal.pmed.1004587
level: error
scope: 'doc(section:haschild(h1:contains("ethod"),h2:contains("ethod")))'
token: '(?i)sample size|power (?:calculation|analysis)|powered to'
min: 1
```

The selector matches a section opened by a level-one or level-two heading containing `ethod`, which covers `Methods`, `Materials and methods`, and a Typst paper whose sections are all level one. `min: 1` turns the rule around: it fires when the section has no match, and when there's no such section at all it fires at the top of the file. Sixty-six of the package's rules are this shape, one per checklist item a regex can see.

<ChecklistCoverage caption="Checklist items with a rule, in item order. The unlit items are the ones that need a reader: whether the interpretation is balanced, whether the objectives match the hypotheses, whether the harms reported are the harms that occurred." />

A few more selectors do the rest. The abstract is `section:haschild(h2:contains("Abstract"))`, and a word count over it with `max: 250` is the budget rule; PLOS raises it to 300 from the config with `IMRaD.AbstractLength[max] = 300`, since a limit is a parameter of the rule, not a copy of it. Nature's summary paragraph is `text & doc(h1 + p)`, the paragraph after the title. A citation in the wrong place is `~doc(section:haschild(h2:contains("References")))`, everything except the reference list.

## The whole document at once

Two PLOS requirements don't belong to a section. A study of humans or animals has to name the committee that approved it, somewhere. An abbreviation shouldn't be introduced unless it's used at least three times, anywhere.

Both are one regex over the raw file. The ethics rule is two lookaheads from the start of the document: the first finds patients, participants, mice, or rats; the second fails if any approval language appears.

```yaml
raw:
  - '(?si)\A(?=.*\b(?:patients|participants|mice|rats|animals)\b)(?!.*\b(?:approved by|ethics committee|review board|IRB|IACUC)\b).'
```

The abbreviation rule matches a term introduced in parentheses and then looks ahead for two more uses of the captured term:

```yaml
raw:
  - '\(([A-Z][A-Za-z]{1,5})\)(?!(?s:.*\b\1\b.*\b\1\b))'
```

Neither needs anything from Vale beyond a regex engine that lets a lookahead refer back to a capture, which regexp2 does.

The species rule uses the raw scope for a different reason. Vale strips emphasis before a rule sees the text, so a rule can't normally tell `*E. coli*` from `E. coli`. In the raw scope the markers are still there, and a name not between `*` or `_` is the one to flag. The same pattern covers Markdown and Typst.

## Notebooks

A notebook's Markdown cells are separate strings in a JSON file. Read one cell at a time, a rule looking for a Methods section fires in every cell that isn't it. The package ships a View that reads every Markdown cell as one document:

```yaml
engine: dasel
scopes:
  - name: cell
    expr: '[cells.filter(cell_type == "markdown").map(source).flatten()]'
    join: "\n"
    type: md
```

The array literal is the part that matters. `join` turns a selected list into one value, and without the brackets the selection is a list of lists, one per cell, so each cell is joined on its own. Flattened and wrapped, it's one list, and the whole notebook is one manuscript. Alerts still land on the right line of the JSON.

## What a paper looks like to it

The repository's test fixture is a deliberately bad trial report. Run under `Journals, IMRaD, PLOS, CONSORT` it produces 68 alerts. A selection, with one title trimmed to fit:

```console
$ vale --no-wrap fixtures/trial.md
 fixtures/trial.md
 1:1     error       Give the trial registry and registration number (item 2).                  CONSORT.Registration
 1:1     error       The study has human or animal subjects; name the committee that approved it.  PLOS.Ethics
 1:1     warning     Say where the protocol and statistical analysis plan can be accessed (item 3).  CONSORT.Protocol
 1:3     warning     Write the title in sentence case: 'A Novel Randomized Trial Of Zetaprol ...'.  PLOS.TitleCase
 1:5     suggestion  Let the result carry the weight; cut 'Novel'.                              Journals.Hype
 5:76    warning     Spell out a number that starts a sentence, or recast it: '120'.            Journals.SentenceNumeral
 5:193   warning     Put a space between the number and the unit: '12mmHg'.                     Journals.UnitSpacing
 5:201   warning     Report 'p=0.000' as 'p < 0.001'; a p-value is never zero.                  Journals.PValueZero
 11:4    error       Methods describe how allocation was concealed until assignment (item 12a).  CONSORT.Concealment
 17:136  warning     Report the exact p-value at or above 0.001, not 'p < 0.05'.                PLOS.PValues
```

Beside it is the same paper rewritten, which produces nothing. Every style has that pair, in a different format each: the trial in Markdown and Typst, a systematic review in Quarto, a cohort study in MyST, a Nature article in R Markdown, a notebook. Each rule also carries its own cases in a `tests:` block, 304 of them, run by `vale test`. A rule with no case that expects an alert fails the suite, because a Vale rule that matches nothing loads and runs without complaint.

## Spelling

A general spell checker is the wrong tool for a paper, and not because its dictionary is small. Everything it doesn't know is a typo, the personal dictionary that fixes that lives on one machine, and a document full of gene names and reagent codes trains the author to click "ignore" until a real misspelling goes by with the rest. Vale's spell checker has three properties that change this.

The first is that it reads the document's structure before it reads the words. Take this sentence:

```md
We grew *Saccharomyces cerevisiae* (strain BY4741) in YPD and measured ATP
by qPCR at 5 µmol, registered as NCT01234567. Heteroscedasticity was handled
with a Wilcoxon test in `statsmodels`; see @smith2020 and Fig. 2.
```

`statsmodels` is inline code and `@smith2020` is a citation, so neither reaches the spell checker. `YPD`, `ATP`, and `NCT01234567` are all-caps or alphanumeric and are skipped, and so is `qPCR`. The unit is a number and a symbol. Of the terms a word processor would underline, four are left: `Saccharomyces`, `cerevisiae`, `Heteroscedasticity`, and `Wilcoxon`.

The second is that a vocabulary is a file in the repository. The package ships one, and `Vocab = Journals` turns it on:

```
# Statistics
Wilcoxon
heteroscedasticity
...
# Model organisms
Saccharomyces
cerevisiae
```

It's 149 terms, grouped under comments, and shorter than I expected. The dictionary already knew `Drosophila`, `Escherichia`, and `confounder`, and a test in the repository lints the list with the vocabulary off, so a term the dictionary knows can't stay in it. A lab's own terms go in a second file beside it, `Vocab = Journals, Lab`, and an entry can be a regex when a family of identifiers shares a shape. A vocabulary term is accepted at the start of a sentence too, so the capital H on `Heteroscedasticity` is not a second spelling to list.

The third is what happens on a real misspelling. With the vocabulary on, the sentence above produces one alert, and the suggestions come from the vocabulary before the dictionary:

```console
$ vale paper.md
 paper.md
 1:223  error  Did you really mean 'Saccharomycess'?  Vale.Spelling

$ vale fix <alert>
Saccharomycess -> Saccharomyces, Saccharometer, Saccharoses, Saccharides
heteroscedasticty -> heteroscedasticity, heteroskedasticity, homoscedasticity
```

Without the vocabulary the first list starts with `Saccharometer`, and the second with `heterosexuality`. A dictionary can do this only for words it holds, which is why the vocabulary and the suggestions are one mechanism: the words a project adds are the words it gets offered back.

For a field with thousands of terms, a vocabulary is the wrong size, and Vale reads Hunspell dictionaries, so a `.dic` and `.aff` drop in with their affix rules. The package doesn't ship one yet; the candidate sources have licenses I haven't finished reading.

## What it doesn't do

A rule can see that a committee is named, not whether it's the right one. It can see that the Discussion has a paragraph about limitations, not whether they're the limitations that matter. It can check that a reference ends in `(2020).` for Nature or `2020;395:1054–62.` for PLOS, not that the title is the paper's. The species rule knows twenty model organisms and expects a project to extend it with its own.

The checklists are paraphrased, not quoted. CONSORT 2025, STROBE, and PRISMA 2020 were all published under Creative Commons Attribution licenses, in PLOS Medicine and the BMJ, and the package's NOTICE credits each. The Nature and PLOS guides are encoded as rules with the requirement quoted in the rule's comment and linked from its message.

<Callout kind="note" title="Three things worth knowing about Vale from this">

A `doc(...)` selector can't take a comma-separated group at the top level, but it can inside `:haschild(...)`, and that's what makes a selector that matches either heading level possible. A `%` in a rule's message is a format verb: "95% confidence interval" printed as "95onfidence interval" with no error at load, and the rule now says "a confidence interval." And `vale fix` can offer a misspelling as its own first suggestion: `Wilcoxin` comes back for `Wilcoxin`, ahead of `Wilcoxon`, with or without a vocabulary.

</Callout>

The package is in the [library](https://vale.sh/explorer) as `Journals`, and the repository has the fixtures, the rules with their sources, and the test script.
