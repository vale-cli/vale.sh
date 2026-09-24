---
title: 'Which kind of page is this?'
description: 'Diataxis is a Vale package for the four kinds of documentation in Diátaxis: tutorials, how-to guides, reference, and explanation, each checked against the job it claims to do.'
date: '2026-09-24'
tags: ['packages']
motif: 'compass'
imageAlt: 'A two-by-two grid of the four kinds of documentation, each cell with one alert where the page slipped into another kind.'
---

<script>
  import Callout from '$lib/components/blog/Callout.svelte';
  import DiataxisFolders from '$lib/components/blog/DiataxisFolders.svelte';
  import DiataxisPage from '$lib/components/blog/DiataxisPage.svelte';
  import DiataxisQuadrant from '$lib/components/blog/DiataxisQuadrant.svelte';
</script>

[Diátaxis](https://diataxis.fr) says there are four kinds of documentation and that they don't mix. A tutorial is a lesson: the reader learns by doing something you chose for them. A how-to guide gets a reader who already knows the basics to a goal of their own. Reference describes the machinery, and explanation says why it's built that way. [Django's docs](https://docs.djangoproject.com/en/stable/#how-the-documentation-is-organized) are organized this way, [Canonical's](https://canonical.com/documentation) are, [Python's documentation](https://devguide.python.org/documentation/style-guide/#diataxis) strives to be, and on a docs team "is this a tutorial or a how-to guide" is a review question everyone knows.

The framework's claim is that each kind fails in a particular way: a tutorial that stops to explain, a how-to guide that teaches, reference that recommends, explanation with steps to run. Those slips have a vocabulary. "Alternatively" in a tutorial, "you'll learn" in a how-to guide, "you should" in reference, "Run the build" in an explanation. Vocabulary is what a linter is for.

[Diataxis](https://github.com/jdkato/diataxis) is a Vale package with a style for each kind: 20 rules, each looking for one thing the framework says a kind does, or one way it slips into the other three.

<DiataxisQuadrant caption="The framework's two axes: a page serves study or work, through action or through cognition. Each cell is a Vale style." />

## One page, four ways

Here is a page that is all four kinds at once, which is what most documentation pages are. It's run through all four styles, and each alert is colored by the kind whose rule fired.

<DiataxisPage caption="A page about caching, linted as a tutorial, a how-to guide, reference, and explanation at the same time. Real output; the colors are the kind that objected." />

Read the colors and the page sorts itself. The tutorial rules object to "alternatively" and "if you prefer," because a tutorial takes one path, and to the absence of "we," because a tutor stands beside the learner. The how-to rules object to "you'll learn," because a guide assumes competence, and to an opening that never says what the guide shows. The reference rules object to "you should" and "simply," because reference doesn't advise or judge, and to a page with no example on it. The explanation rules object to "Run" and "Open," because explanation discusses, and to a page that never says why. The four alerts that quote nothing are the whole-page ones: something the kind needs and the page never provides. Nobody planned this page as any of the four, so it is a little of each, and every kind of reader has to wade through the other three kinds of sentence to find theirs.

A page that knows what it is passes its own style and would fail the other three. That's the framework's point, and it is exactly what a rule can check.

## What each kind is checked for

<DiataxisQuadrant rules caption="The 20 rules on the grid. Each kind is checked for what it needs and for the ways it slips toward its neighbors." />

The rules are the framework's own descriptions turned around, mostly from the "language of" section each of its pages has. Diátaxis says a tutorial tells the learner what they'll build and what they'll see at each step, so `Tutorial.Opening` reads the paragraph after the title for "you'll build" or "by the end," and `Tutorial.Expectations` looks for "you will see" or "notice that" somewhere in the page. It says a how-to guide is named for its goal and opens by saying what it shows, so `HowTo.Title` wants "How to deploy" or "Deploying" and `HowTo.Opening` wants "This guide shows you how to." It says reference is austere but may warn, so `Reference.Opinion` flags "simply," "unfortunately," and "obviously," and `Reference.Instruction` flags "you should" and "we recommend" while leaving "you must not" alone.

Four of the checks use a selector over the document's structure rather than a word list. The two `Opening` rules read the paragraph after the title, and since a tutorial and a how-to guide are both sequences of steps, the two `Steps` rules look for an ordered list:

```yaml
extends: occurrence
message: "A how-to guide is a sequence of steps; there is no numbered list here."
level: warning
scope: doc(ol)
token: '(?s).'
min: 1
```

`doc(ol)` selects the page's ordered lists, and `min: 1` with a token that matches anything turns the rule around: it fires when there's no such list at all. The same shape, with a count over `raw`, gives `Explanation.Reference` its ceiling of six table lines, header and rule included, because a table of every option is reference and the explanation should link to it.

## Telling Vale the kind

Vale reads a page's words and structure, but nothing on the page says which kind it is meant to be. The config says, and Diátaxis-shaped documentation is usually laid out one folder per kind, so the mapping is four sections:

<DiataxisFolders caption="A folder per kind on the left, the config section that enables its style on the right." />

```ini
StylesPath = styles
Packages = https://github.com/jdkato/diataxis/releases/latest/download/Diataxis.zip

[docs/tutorials/*.md]
BasedOnStyles = Tutorial

[docs/how-to/*.md]
BasedOnStyles = HowTo

[docs/reference/*.md]
BasedOnStyles = Reference

[docs/explanation/*.md]
BasedOnStyles = Explanation
```

That is also the whole install. Run `vale sync` and the four styles land in the StylesPath. Limits and levels are settings, so a team that wants longer tables in explanations writes `Explanation.Reference[max] = 12` and a team that finds `Tutorial.Options` too eager turns it down to a suggestion.

## Using Diataxis with an agent

The folder mapping matters most when the writer is an agent. Ask one for a how-to guide and it tends to produce a tutorial with a how-to's title: it teaches, it explains, and it hedges every step. The [agent-tools](https://github.com/vale-cli/agent-tools) plugin for Claude Code runs Vale on every prose file the agent edits and hands the alerts back, so a draft written into `docs/how-to/` is read by the `HowTo` rules before the agent moves on. The plugin reports errors only by default, and these rules are warnings and suggestions, so its level option is set to suggestion here. Here is one such draft:

```markdown
# Deployment

In this guide you'll learn how to deploy the site. Under the hood, the registry caches layers.

- You should build the image.
- You can push it to the registry.
```

And what Vale says about it, which the hook hands back on the same turn:

```console
howto.md:1:1:HowTo.Steps:A how-to guide is a sequence of steps; there is no numbered list here.
howto.md:1:3:HowTo.Title:Name the guide for its goal: 'How to ...' or a verb phrase such as 'Deploying to ...'.
howto.md:3:15:HowTo.Teaching:'you'll learn' is teaching. A how-to guide assumes the reader knows the basics; a tutorial teaches them.
howto.md:3:52:HowTo.Explanation:'Under the hood' opens an explanation. Keep the guide to the steps; link to the explanation.
howto.md:5:3:HowTo.Imperative:'You should' softens an instruction. Write the step as a command.
howto.md:6:3:HowTo.Imperative:'You can' softens an instruction. Write the step as a command.
```

That is the framework's review, delivered as alerts with the span quoted, and the agent fixes what it can see. The next draft is named for its goal, opens with what it shows, and has its steps as commands. The kind came from the folder, not from the prompt, which is the point: the prompt can be vague about what a how-to guide is, and the rules are not.

## What it doesn't do

It doesn't judge whether an explanation explains, whether a tutorial's steps work, or whether the reference is complete. A rule reads words, and the framework's harder questions aren't in the words. Each page of Diátaxis has a list of principles, and most of them need a reader: deliver visible results early, aspire to perfect reliability, adopt standard patterns, seek flow, make connections. None of those is a rule here, and none could be.

What the rules cover is the part the framework writes down as language. Each page has a section on the phrasings its kind uses, "In this tutorial, we will," "This guide shows you how to," "Refer to the x reference guide for a full list of options," and each of those is a rule. The rest of the rules are the boundaries: the sentence that belongs on another page. In practice those are most of what a docs review finds, and the review can now start from a page that has already been sorted.

<Callout>
Diátaxis is by Daniele Procida and is published under CC BY-SA 4.0. The rules follow its distinctions in their own words, each linking to the page it comes from; see the package's <a href="https://github.com/jdkato/diataxis/blob/main/NOTICE">NOTICE</a>.
</Callout>
