---
title: 'The model writes the rules. The rules check the docs.'
description: 'A pitch going around says a rule-based linter is the old way and an AI quality gate is the new one. Measured against five model reviews, a counting test, a forgetting test, and a million-word corpus, the model does the pattern work fine, at six hundred times the cost. The one real cost of a linter, configuring it, is the part AI has made cheap.'
date: '2026-11-12'
draft: false
tags: ['agents']
motif: 'gate'
imageAlt: 'An abstract drawing: a tangle of nodes on the left feeds one line into a small rule card, and from the card a straight gate runs down the right, where lines of text pass through and two are stopped with a mark.'
---

<script>
  import GateCorpus from '$lib/components/blog/GateCorpus.svelte';
  import GateCounting from '$lib/components/blog/GateCounting.svelte';
  import GateDecay from '$lib/components/blog/GateDecay.svelte';
  import GateReviews from '$lib/components/blog/GateReviews.svelte';
</script>

There is a pitch going around for AI documentation review, and it has a shape. A rule-based linter, the argument goes, is "completely rule-based and runs offline," so it "can't grasp the semantic context of your writing." Setting one up means "defining your custom styles with YAML and regular expressions, which can be complex," and that takes a lot of time upfront. What you want instead is a quality gate that is context-aware, AI-powered, and low-configuration, with pre-built rules you customize through a UI instead of config files.

Every sentence of that is true as a description. The conclusion is backwards, and it is backwards in a way you can measure. So I measured it: five model reviews of one draft, a counting test, a forgetting test, and a full pass over a million-word corpus. The model is the wrong tool for the gate and the right tool for the part the pitch calls hard.

## Does the model see something the rules don't?

Start with the pitch's strongest word, "context." If a model reviewing against a style finds things the style's rules can't, that is worth paying for. If it finds the same things, it isn't. So I gave the same draft and the same rule list to five fresh instances of [Fable 5.1](https://www.anthropic.com/claude/fable), through the agent harness it would actually run in, and asked each for the violations as JSON:

<GateReviews caption="Five reviews of one draft against the same rule list, each a fresh context. Eighteen findings appear in every run; two more appear once each." />

Eighteen findings, identical across all five runs, and every one of them is a pattern: a banned word, a hedge, a recap, a weak verb. Vale carries each as a rule and finds the same eighteen in 90 milliseconds. The two findings that appeared only once are different in kind. `upgrading is effortless` and `fundamentally reimagines how teams approach code quality` are judgment calls, the kind no pattern can make and the kind a reviewer wants a model for.

So the model does see something the rules don't. Two things, in twenty, and it sees them inconsistently. Everything else it saw, it saw because the rule list told it to, and a rule would have seen it for free.

## Can the model do the rule's job?

The reverse question matters too, because the pitch's gate would do the rules' work as well as the judgment. The obvious doubt is whether a model is reliable at the mechanical checks a style guide is mostly made of: this word, not that one; this many words; this case in a heading. The hardest of those for a language model is counting. So I took thirty sentences from this site's docs, 18 to 34 words each, and asked three times which of them run past 25 words:

<GateCounting caption="Who found the fourteen long sentences, and the price of the answer. Vale's two extra alerts are 25-word sentences that its tokenizer counts at 26, since a contraction or a parenthesis is a token of its own." />

Fourteen of fourteen, three times out of three. The model can do the rule's job. It took 46 seconds and 45,000 tokens each time, and Vale took 70 milliseconds and none, which is the whole finding: at the gate, the model and the rule agree, and the rule is six hundred times cheaper. That gap is not an argument about capability. It is an argument about where to spend attention that costs money.

## Does the model forget?

The literature says standing instructions decay. [Curse of Instructions](https://openreview.net/forum?id=R6q67CDBCH) found that the odds of satisfying every instruction in a prompt fall roughly exponentially as instructions are added, [IFScale](https://arxiv.org/abs/2507.11538) measured the same decline across frontier models as instruction density grows, [Multi-IF](https://arxiv.org/abs/2410.15553) found adherence to earlier instructions dropping with each turn of a conversation, and [Du and colleagues](https://arxiv.org/abs/2510.05381) found that input length alone hurts performance even when retrieval is perfect. [Voices](/blog/voices#rules-are-verifiable) showed what that looks like for a vocabulary constraint: 25 violations of Basic English with the full word list in the prompt.

A gate is where this bites, because a gate's instructions are standing ones. So I pushed on it. The same draft and the same ten rules, with the draft placed after 32,000 and then 86,000 tokens of this site's docs that the prompt said were not under review; and separately, with 47 of the [Microsoft style's](https://github.com/vale-cli/Microsoft) rules added to the ten, each given by its message alone, the way a prompt would carry them:

<GateDecay caption="Eight runs on one draft. The ten house rules survived 86,000 tokens of distraction and a list of fifty-seven. The forty-seven rules the prompt could only name were applied by their gist: against Vale's thirteen Microsoft alerts on the draft, each run matched eleven, missed two, and raised two to four the style's own definitions don't." />

The ten explicit rules held. Eighteen of eighteen, in every run, at every distance, which is better than the literature led me to expect of a current model at full effort, and the cost of holding them rose to 200,000 tokens and a minute per review. What slipped was subtler than forgetting a rule. Given fifty-seven, the model kept every rule's name and reconstructed its definition: it flagged `fundamentally` and `fully` as adverbs to cut, which Microsoft's list doesn't contain, missed `nicely`, which it does, and in one run flagged `AI` and `CI` as undefined acronyms, which the style exempts. A rule in a style guide is a list, and a prompt can carry fifty names but not fifty lists. A linter carries the lists.

## What a gate costs at scale

A gate doesn't review one draft. It runs on every pull request, on the day it is adopted, and again every time a rule changes, over everything. Here are three corpora of increasing size: this site's docs, the [textbench](https://github.com/jdkato/textbench) corpus, and the Markdown under the [Grafana repository's](https://github.com/grafana/grafana/tree/main/docs/sources) `docs/sources`, which is what an adopter at that scale actually lints. Vale's time is one warm pass. The model's figure is only the list price of handing the same text in as input, before it has written a word of review:

<GateCorpus caption="One full pass over each corpus. Vale's wall clock on an Apple M1, against the input price of the same text at Fable 5.1 and Sonnet 5.5 list rates on 2026-11-03, with no output counted." />

A pass over the Grafana docs is 2.7 seconds, or $17 of input at the model the pitch would stand at the gate, $3.40 at the cheaper one, and that before the review is written. The lower bar is a lower bound. Run it on every pull request and the arithmetic does itself.

## What a gate has to be

Two things, and the model fails both as a gate while passing both as an author.

A gate's verdict has to be stated in advance. A rule's is: [`vale test`](https://docs.vale.sh/topics/testing) runs each rule against the sentences it should catch and the ones it should leave alone, and `--coverage` fails any rule no case exercises. A model's verdict on a judgment call changes between runs, as the two single-run findings show, so a gate built on it can be sampled but not tested.

And a gate has to carry the style's definitions, not its headings. The forgetting test is the measurement: the names survive, the lists don't. A rule in a linter is the list.

## The part that was hard

So far this is the case for a linter as it stood in 2019, and the pitch's answer to it was also true in 2019: nobody wanted to write the YAML. A style guide is a few hundred rules, each a regex somebody had to get right, and the first run on a real corpus produced thousands of alerts nobody wanted to triage. The Grafana docs produce 15,637 under a stranger's style. That was the cost of a linter, and it was a real one.

It is the cost a model removes. Not by standing at the gate, but by doing the setup once and leaving.

Vale ships [skills](https://docs.vale.sh/guides/agents) for the agent you already run. `setup` installs Vale, writes the `.vale.ini`, syncs the styles, and gets a first run in a repository that has none. `triage` turns that first run's thousands of alerts into a decision per rule: fix, downgrade, or switch off, with the reason written into the config. `vocab` adds the project's terms so spelling stops arguing about product names. `ci` wires the whole thing into GitHub Actions or a pre-commit hook. A rule you can describe in a sentence, the model writes as YAML, with the regex, and `vale test` tells both of you whether it does what the sentence said. The regex that was the pitch's complaint is the one artifact a model produces reliably and a test can verify.

Notice what that leaves in the repository: a config file and a directory of rules, each with a test, each in version control, each reviewed in a pull request like any other change. "A UI instead of config files" asks you to give that up. Config files are the format a model edits best and a team reviews best, and they are what makes the gate's behavior something you can read.

## The right split

The model's attention is expensive and its judgment is the point. Spend it there: on whether a paragraph says anything, on whether the example is the right example, on the two calls above that no pattern could make. Spend nothing on `leverage`, on a heading in title case, on a sentence that ran to thirty words, because a rule already caught those in ninety milliseconds and the fix came with the alert.

That split is not a compromise between the old way and the new one. It is what the new tools are for. The model writes the rules; the rules check the docs; the model reads what the rules left.

## Method

Everything above is in [`quality-gate.ts`](https://github.com/vale-cli/vale.sh/blob/main/src/lib/data/quality-gate.ts), taken on 2026-11-12. The reviews, counting runs, and forgetting runs are Claude Fable 5.1 through the [Claude Code](https://code.claude.com/docs/en/overview) agent harness, each a fresh context; the token figures are what the harness billed, most of it the harness's own context rather than the text under review. Vale's timings are one warm run of [Vale 3.27](https://github.com/vale-cli/vale/releases) with the [Voices](https://github.com/jdkato/voices) and Direct styles on an Apple M1. Corpus tokens are [o200k](https://github.com/openai/tiktoken) counts of every Markdown file; prices are the list rates for input tokens on the [Claude pricing page](https://platform.claude.com/docs/en/about-claude/pricing) on 2026-11-03.
