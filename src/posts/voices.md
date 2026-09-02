---
title: 'Introducing Voices: AI output styles powered by Vale'
description: 'Voices turns AI output styles into Vale rules. Checked on every draft rather than remembered, and free until something breaks one.'
date: '2026-09-02'
draft: true
poster: [2418, 482, 459, 0]
imageAlt: 'A token meter showing two prompt-sized bars, one alert-sized bar, and a zero.'
---

<script>
  import DraftTabs from '$lib/components/blog/DraftTabs.svelte';
  import TokenMeter from '$lib/components/blog/TokenMeter.svelte';
  import VoicesDemo from '$lib/components/blog/VoicesDemo.svelte';
  import VoicesLoop from '$lib/components/blog/VoicesLoop.svelte';
  import { dnsAfter, dnsBefore, lintkitAfter, lintkitBefore } from '$lib/data/experiments';
</script>

Today, I'm pleased to announce [Voices](https://github.com/jdkato/voices), a package that turns AI writing instructions into Vale rules. It's built on three new Vale features, which this post also introduces along the way.

A quick note on the name. A voice is not quite the same thing as a style guide. A style guide settles disputes — serial commas, capitalization, which words a product name allows. A voice is how the writing sounds. The register, the sentence budget, the vocabulary, the moves it refuses to make. That's the thing a prompt tries to describe, and the thing these rules pin down.

The starting material comes from the [output-style catalog](https://github.com/smixs/awesome-claude-output-styles), a collection of prompts that each describe a voice. And the approach is the prose half of an argument already being won for code. [Evil Martians](https://evilmartians.com/chronicles/stop-writing-rules-in-agents-md-use-agent-hooks-and-nano-staged-instead) recommend moving agent rules out of AGENTS.md and into hooks. A rule encoded as a tool is a rule the model can't forget. [Swizec Teller](https://swizec.com/blog/stop-burning-tokens-on-code-review) and [Factory](https://factory.ai/news/using-linters-to-direct-agents) reached the same place for code review.

Compared to a prompt, rules are cheaper, verifiable, cumulative, and measurable. In the following sections, we'll look at each claim in turn, with real output from the model that drafted this post.

<VoicesLoop />

## What a rule can take from a prompt

First, the mechanics. If you open any entry in the catalog, you'll find that it splits into three parts.

The first is a **persona**. "Answer like a senior engineer who is short on time." Nothing here touches that part, and nothing needs to — adopting a persona is the one thing models already do reliably.

The second is a **set of constraints**. No hedging. One slang term per sentence. Exactly one `Next:` action. The prompt states each one, then asks the model to check by re-reading its own draft. As you can probably tell, that's a linter.

The third is a set of **structural guardrails**. "None of this applies inside code, commands, file paths or identifiers." A prompt says this and hopes. Vale parses the markup, so the rules only ever see prose.

The middle part converts directly. For instance, here's "don't hedge," shipped as `Direct.Hedging`:

```yaml
extends: existence
message: "Hedge: '%s'. State it, or say why you're unsure."
level: error
ignorecase: true
tokens:
  - '(?:you )?may want to(?: consider)?'
  - is likely because
  - "it(?:'s| is) worth noting"
  - "it(?:'s| is) important to note"
  - 'one could argue'
```

## Rules are cheaper

A prompt is paid for on every request, whether or not it applies. A rule costs nothing until a draft breaks it.

<TokenMeter />

These are real BPE counts, not an estimate — OpenAI's `o200k_base`, since Anthropic publishes no offline tokenizer for Claude 3 and later. The prompt measured is no-ai-slop's `SKILL.md` at `b53e265`. [count.py](https://github.com/jdkato/voices/blob/main/script/tokens/count.py) reproduces every figure, and takes an `--backend anthropic` flag for Claude's own count.

The alerts are cheap to act on, too. A rule with one right answer carries it, so the agent applies the fix without spending a turn deciding anything:

```json
{
	"Match": "made a decision",
	"Action": { "Name": "replace", "Params": ["decided"] }
}
```

The gap matches what Swizec Teller [reports for code review](https://swizec.com/blog/stop-burning-tokens-on-code-review). His AI review bot cost $1,000 a week; the custom lint rules that replaced it run in seconds.

## Rules are verifiable

There's a second problem with resident instructions, and it isn't the price. Models can't hold many of them at once. The [Curse of Instructions](https://maxpool.dev/research-papers/curse_of_instructions_report.html) paper found that the odds of following every instruction decay roughly exponentially as instructions are added. [IFScale](https://arxiv.org/abs/2507.11538) measured the same decline across every frontier model as instruction density grows. A voice is exactly that — dozens of standing constraints — so "I followed the style" is a claim you can't check. An exit code is a fact you can gate CI on.

Here's what that looks like in practice. The examples below are not staged. Claude (Fable 5), the model that drafted this post, got a bare task with no style instructions. Announce a fictional linter's 2.0 release. The Before tab is what it wrote; the After tab is its one-pass repair, and the Diff tab shows exactly what changed:

<DraftTabs before={lintkitBefore} after={lintkitAfter} />

And here's what Vale returned on the original, with `Voices, Direct` enabled:

```console
$ vale --output=line draft.md
draft.md:3:7   Voices.Puffery         Importance puffery: 'thrilled to announce'.
draft.md:3:44  Voices.Banned          Inflated word: 'transformative'.
draft.md:6:13  Voices.BinaryContrast  Binary contrast: 'isn't just a linter; it's'.
draft.md:7:4   Voices.InflatedWords   Use 'using' instead of 'leveraging'.
draft.md:7:15  Voices.Banned          Inflated word: 'cutting-edge'.
draft.md:7:47  Voices.Banned          Inflated word: 'empowers'.
draft.md:8:23  Voices.InflatedWords   Use 'simplify' instead of 'streamline'.
draft.md:14:15 Voices.InflatedWords   Use 'strong' instead of 'robust'.
draft.md:15:18 Direct.Hedging         Hedge: 'It's worth noting'.
draft.md:18:1  Voices.Recap           Recap ending: 'In conclusion'.
draft.md:18:28 Voices.Puffery         Importance puffery: 'represents a pivotal moment'.
```

That's eleven alerts in 145 words, and none of them are unusual. This is the register the training data rewards, and it survives good intentions.

The decay research predicts something stronger — a large enough constraint should be impossible to follow no matter how careful the model is. The `Simple` voice is that constraint. It allows only the 850 words of [Basic English](https://en.wikipedia.org/wiki/Basic_English), shipped as a Hunspell dictionary. The model had the full list in its prompt when it explained DNS:

<DraftTabs before={dnsBefore} after={dnsAfter} />

Vale found 25 violations in the Before tab's 118 words. "Computer", "web", "site", "type", "know", "ask", "job" — none of them are in Ogden's list. Inside the lint loop, the count went 25 → 2 → 1 → 1 → 0 in four passes. Interestingly, every round's repairs bred new violations that only the re-check caught — "network" and "another" arrived in fixes, then "away", then "distant". A generator can't verify its own repairs. A checker doesn't have to trust them.

The package ships a shared core and four voices — `Direct`, `GenZ`, `Coach`, and `Simple` — each a different kind of constraint: patterns, register, structure, vocabulary. You can check the verifiability claim yourself. Below, one hedged paragraph runs against each voice. Every rewrite is a file in the test suite, and CI fails if it stops coming back clean:

<VoicesDemo />

## Rules are cumulative

A better prompt improves one session. A rule improves the product, permanently, for everyone downstream.

The LintKit draft above is the proof. When it was first judged, five of its eleven alerts didn't exist. Both puffery matches, the contracted binary contrast, and two of the inflated verbs sailed through, and the model's own judgment caught them. The fix was not a better prompt. Each escape became a pattern, committed with a test that proves it fires, enforced for everyone since.

Accumulation works in the other direction, too — you can build on what's already there. Every number and list above is addressable from your configuration file, with the new bracket syntax in Vale v3.20:

```ini
[*.md]
BasedOnStyles = Voices, Direct
Direct.Length[max] = 30
GenZ.Budget[max] = 3
Simple.Vocabulary = error
```

To change what a rule _matches_, extend it. Rules can now inherit from other rules, with `+` and `-` keys to edit the parent's lists:

```yaml
# styles/House/Hedging.yml
extends: Direct.Hedging
message: "We don't hedge."
level: error
tokens+:
  - perhaps the best answer is
```

Inheritance keeps the machinery, and your file carries only the opinion. The shared machinery lives in [Std](https://github.com/vale-cli/Std), a new standard library of general-purpose rules extracted from the Google, Microsoft, and IBM styles. `Direct.Length` is a three-line child of `Std.Readability.SentenceLength`, and so is any length rule you write.

## Rules are measurable

A voice you can check is a voice you can measure. The footer of this post is Vale's own report on it — alert counts, a reading grade, and the wall-clock time of the run. Compare it to the footer on the [Views tutorial](/blog/openapi), written years apart in a different register, and the difference shows up in the numbers. This post is linted with the rules it announces, and the briefs that prime the model are walked against those rules in CI. A token the brief fails to state fails the build, so the two can't drift apart.

## Using Voices with an agent

The [agent-tools](https://github.com/vale-cli/agent-tools) plugin closes the loop for Claude Code. Every prose file the agent writes is linted, and the alerts return in the same turn, so the repair happens before you read the draft. Outside an agent, the loop is one pipe — no file, no server, and an exit code a prompt can't supply:

```console
$ echo "The team made a decision in order to ship." | vale --ext=.md
stdin.md:1:10  use 'decided' instead of 'made a decision'
stdin.md:1:26  use 'to' instead of 'in order to'
exit=1

$ echo "The team decided to ship." | vale --ext=.md
exit=0
```

## Where the voices come from

Each voice is an entry in the [output-style catalog](https://github.com/smixs/awesome-claude-output-styles), rewritten as the constraint its description states. Only [no-ai-slop](https://github.com/petergyang/no-ai-slop) contributed text — the word list and most of the shared core are a translation of its `SKILL.md` into check syntax. Both upstreams are MIT, every derived file names its source, and [NOTICE](https://github.com/jdkato/voices/blob/main/NOTICE) ships inside the archive alongside the license.

## Conclusion

To try Voices, add the package to your configuration and run `vale sync`:

```ini
Packages = https://github.com/jdkato/voices/releases/latest/download/Voices.zip

[*.md]
BasedOnStyles = Voices, Direct
```

Voices requires Vale v3.20.0, which also ships nested rule directories, rule inheritance, bracket parameters, and in-source rule tests.

If you have any questions or run into any problems, feel free to open an issue at the [Voices repository](https://github.com/jdkato/voices).
