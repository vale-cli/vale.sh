---
title: 'Introducing Voices: AI writing skills as Vale rules'
description: 'The writing skill you would reach for, rewritten as Vale rules. Checked on every draft rather than remembered, and free until something breaks one.'
date: '2026-09-02'
poster: [3777, 1535, 735, 0]
imageAlt: 'A token meter showing two prompt-sized bars, one alert-sized bar, and a zero.'
---

<script>
  import Callout from '$lib/components/blog/Callout.svelte';
  import DraftTabs from '$lib/components/blog/DraftTabs.svelte';
  import TokenMeter from '$lib/components/blog/TokenMeter.svelte';
  import VoicesDemo from '$lib/components/blog/VoicesDemo.svelte';
  import SavingsChart from '$lib/components/blog/SavingsChart.svelte';
  import SpeedChart from '$lib/components/blog/SpeedChart.svelte';
  import TermApp from '$lib/components/blog/TermApp.svelte';
  import VoicesLoop from '$lib/components/blog/VoicesLoop.svelte';
  import { dnsAfter, dnsBefore, lintkitAfter, lintkitBefore } from '$lib/data/experiments';
</script>

Today, I'm pleased to announce [Voices](https://github.com/jdkato/voices), a package that turns AI writing instructions into Vale rules. It builds on [Std](/blog/std), announced alongside it today, and on the Vale v3.20 features that post introduces.

The starting material comes from the [output-style catalog](https://github.com/smixs/awesome-claude-output-styles), a collection of prompts that each describe a voice. And the approach is the prose half of an argument already being won for code. [Evil Martians](https://evilmartians.com/chronicles/stop-writing-rules-in-agents-md-use-agent-hooks-and-nano-staged-instead) recommend moving agent rules out of AGENTS.md and into hooks. A rule encoded as a tool is a rule the model can't forget. [Swizec Teller](https://swizec.com/blog/stop-burning-tokens-on-code-review) and [Factory](https://factory.ai/news/using-linters-to-direct-agents) reached the same place for code review.

Compared to a prompt, rules are cheaper, verifiable, cumulative, and measurable. In the following sections, we'll look at each claim in turn, with real model output as the evidence.

<VoicesLoop caption="The loop. Every section below is a detail of one of these four steps." />

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

<TokenMeter caption="What each approach costs per request, in Claude's own tokens. The two prompt rows are paid on every request. The alert rows are paid only when a draft breaks a rule." />

These are Claude's own counts, under the Fable 5 tokenizer. They were measured through Claude Code by differencing a request's usage against a fixed baseline, and the two bracketing baselines differed by five tokens. The prompt measured is no-ai-slop's `SKILL.md` at `b53e265`. [count.py](https://github.com/jdkato/voices/blob/main/script/tokens/count.py) reproduces every figure, and its offline `o200k_base` backend counts the same prompt at 2,418.

The alerts are cheap to act on, too. A rule with one right answer carries it, so the agent applies the fix without spending a turn deciding anything:

```json
{
	"Match": "made a decision",
	"Action": { "Name": "replace", "Params": ["decided"] }
}
```

The gap compounds over a session, because resident context is paid again on every request. Briefs pasted into CLAUDE.md ride along the same way, so they draw a straight line too. Rules draw a band instead. The top edge is the worst case, a dirty draft on every single request, and a clean session sits on the floor:

<SavingsChart caption="Cumulative tokens over fifty requests. Resident context draws a straight line. Rules draw a band, and a clean session sits on its floor." />

Fifty requests cost 188,850 tokens under the skill and at most 36,750 under the rules. And you can run with no briefs at all — the bare-model experiment in the next section converges in one repair pass. The priming the briefs buy is already encoded where it matters, because every message is written as an instruction. "State it, or say why you're unsure" teaches the voice at the exact moment it was broken.

<Callout kind="note" title="Tokens, not dollars">

The chart counts tokens, not dollars. Claude Code caches the prompt prefix, and a cache read bills at about a tenth of the input rate. On Fable 5.1 it is a fortieth. The skill and the brief both live in that prefix, so the discount lands on both lines equally. The money gap is narrower than the token gap, and the chart says nothing about your bill. Two things survive the discount. A cached prompt still occupies the context window on every request. And every rule it carries is one more standing instruction for the model to hold, which is the decay problem in the next section. An alert is paid for once, at the moment it fires, and a clean draft costs nothing at any rate.

</Callout>

The gap matches what Swizec Teller [reports for code review](https://swizec.com/blog/stop-burning-tokens-on-code-review). His AI review bot cost $1,000 a week; the custom lint rules that replaced it run in seconds.

Time is the other cost. Swizec's review bot took ten to thirty minutes to post a comment, and his slowest linter takes 27 seconds. Vale never calls a model, so it is faster still. Here is the demo draft above, checked both ways on the same laptop, startup included:

<SpeedChart caption="Wall-clock time to review the demo draft, startup included. One run each, on the same Apple M1." />

Inside an agent, that difference is a turn. The model's review spent 2,060 output tokens, more than half of them on thinking. Its list also ran longer than Vale's, and the difference marks the edge of what a rule can do. The model caught every pattern Vale caught. It missed the two sentence-length alerts, because counting words is something a rule does perfectly and a model does badly. Then it added nine judgment calls. "Several caching solutions" is vague, and the closing bullet list is filler. No pattern can say that. Those calls are what the model is for, and the rules exist so its attention goes there instead of to `leverage`. The hook returns before the next turn begins, so the check costs the agent no time it would notice.

## Rules are verifiable

There's a second problem with resident instructions, and it isn't the price. Models can't hold many of them at once. The [Curse of Instructions](https://maxpool.dev/research-papers/curse_of_instructions_report.html) paper found that the odds of following every instruction decay roughly exponentially as instructions are added. [IFScale](https://arxiv.org/abs/2507.11538) measured the same decline across every frontier model as instruction density grows. A voice is exactly that — dozens of standing constraints — so "I followed the style" is a claim you can't check. An exit code is a fact you can gate CI on.

Here's what that looks like in practice. The examples below are not staged. Claude (Fable 5) got a bare task with no style instructions. Announce a fictional linter's 2.0 release. The Before tab is what it wrote; the After tab is its one-pass repair, and the Diff tab shows exactly what changed:

<DraftTabs
  before={lintkitBefore}
  after={lintkitAfter}
  hint="Before is the bare model's draft. After is its one-pass repair. Diff marks every change."
  caption="A release announcement written with no style instructions, and the same text after one pass against Vale's alerts."
/>

And here's what Vale returned on the original, with `Voices, Direct` enabled:

```console
$ vale --output=line draft.md
draft.md:3:7:Voices.Puffery:Importance puffery: 'thrilled to announce'. State the fact and let the reader judge.
draft.md:3:44:Voices.Banned:Inflated word: 'transformative'. Say the plain thing.
draft.md:6:13:Voices.BinaryContrast:Binary contrast: 'isn't just a linter; it's'. State the second half directly.
draft.md:7:4:Voices.InflatedWords:Inflated word: use 'using' instead of 'leveraging'.
draft.md:7:15:Voices.Banned:Inflated word: 'cutting-edge'. Say the plain thing.
draft.md:7:47:Voices.Banned:Inflated word: 'empowers'. Say the plain thing.
draft.md:8:23:Voices.InflatedWords:Inflated word: use 'simplify' instead of 'streamline'.
draft.md:14:15:Voices.InflatedWords:Inflated word: use 'strong' instead of 'robust'.
draft.md:15:18:Direct.Hedging:Hedge: 'It's worth noting'. State it, or say why you're unsure.
draft.md:18:1:Voices.Recap:Recap ending: 'In conclusion'. End on the last concrete point.
draft.md:18:28:Voices.Puffery:Importance puffery: 'represents a pivotal moment'. State the fact and let the reader judge.
```

That's eleven alerts in 145 words, and none of them are unusual. This is the register the training data rewards, and it survives good intentions.

The decay research predicts something stronger — a large enough constraint should be impossible to follow no matter how careful the model is. The `Simple` voice is that constraint. It allows only the 850 words of [Basic English](https://en.wikipedia.org/wiki/Basic_English), shipped as a Hunspell dictionary. The model had the full list in its prompt when it explained DNS:

<DraftTabs
  before={dnsBefore}
  after={dnsAfter}
  hint="Before is the model's best unaided attempt. After is where the lint loop converged."
  caption="DNS explained in Basic English. The Before tab breaks the vocabulary 25 times with the full word list in its prompt. The After tab breaks it zero times, after four passes."
/>

Vale found 25 violations in the Before tab's 118 words. "Computer", "web", "site", "type", "know", "ask", "job" — none of them are in Ogden's list. Inside the lint loop, the count went 25 → 2 → 1 → 1 → 0 in four passes. Interestingly, every round's repairs bred new violations that only the re-check caught — "network" and "another" arrived in fixes, then "away", then "distant". A generator can't verify its own repairs. A checker doesn't have to trust them.

The package ships a shared core and four voices — `Direct`, `GenZ`, `Coach`, and `Simple` — each a different kind of constraint: patterns, register, structure, vocabulary. You can check the verifiability claim yourself. Below, one hedged paragraph runs against each voice. Every rewrite is a file in the test suite, and CI fails if it stops coming back clean:

<VoicesDemo caption="One hedged paragraph, checked against every voice. Each rewrite is a fixture in the test suite, and each alert links to the rule that raised it." />

## Rules are cumulative

To be fair, a shared prompt can be improved too — the difference is what an update arrives with. A rule lands with a test that proves it fires, and an exit code enforces it from then on. A prompt's new line still depends on the model honoring it, which is the decay problem all over again.

The LintKit draft above is the proof. When it was first judged, five of its eleven alerts didn't exist. Both puffery matches, the contracted binary contrast, and two of the inflated verbs sailed through, and the model's own judgment caught them. The fix was not a better prompt. Each escape became a pattern, committed with a test that proves it fires, enforced for everyone since.

Accumulation works in the other direction, too — you can build on what's already there. Every number and list above is addressable from your configuration file, through [bracket parameters](/blog/std#every-dial-is-addressable):

```ini
[*.md]
BasedOnStyles = Voices, Direct
Direct.Length[max] = 30
GenZ.Budget[max] = 3
Simple.Vocabulary = error
```

To change what a rule _matches_, [extend it](/blog/std#extend-it). The `+` and `-` keys edit the parent's lists:

```yaml
# styles/House/Hedging.yml
extends: Direct.Hedging
message: "We don't hedge."
level: error
tokens+:
  - perhaps the best answer is
```

Inheritance keeps the machinery, and your file carries only the opinion. The shared machinery lives in Std: `Direct.Length` is a three-line child of `Std.Readability.SentenceLength`, and so is any length rule you write.

## Rules are measurable

A voice you can check is a voice you can measure. The footer of this post is Vale's own report on it — alert counts, a reading grade, and the wall-clock time of the run. Compare it to the footer on the [Views tutorial](/blog/openapi), written years apart in a different register, and the difference shows up in the numbers. This post is linted with the rules it announces, and the briefs that prime the model are walked against those rules in CI. A token the brief fails to state fails the build, so the two can't drift apart.

## Using Voices with an agent

The [agent-tools](https://github.com/vale-cli/agent-tools) plugin closes the loop for Claude Code:

<TermApp
  commands={['/plugin marketplace add vale-cli/agent-tools', '/plugin install vale@agent-tools']}
  caption="Two slash commands in Claude Code. The first registers the marketplace, the second installs the plugin from it."
/>

Here's what a whole turn looks like with it installed. You ask Claude for a changelog entry, and it drafts this:

```markdown
## v2.1.0

We're excited to share v2.1.0, which leverages a new caching layer to
deliver significantly faster builds. It's worth noting that cold
starts are not just faster, they're roughly 40% faster.
```

You never see that version. The hook lints the file the moment it's written, and Vale's report lands back in front of Claude in the same turn:

```
Vale reports 4 alert(s) at error level or above in this file:
  line 3: Voices.Puffery [error] — Importance puffery: 'excited to share'. State the fact and let the reader judge.
  line 3: Voices.InflatedWords [error] — Inflated word: use 'uses' instead of 'leverages'.
  line 4: Direct.Hedging [error] — Hedge: 'It's worth noting'. State it, or say why you're unsure.
  line 5: Voices.BinaryContrast [error] — Binary contrast: 'are not just faster, they're'. State the second half directly.

Fix these before moving on, preserving the markup exactly. Do not disable a rule to clear one.
```

Claude repairs against those exact spans, the hook re-checks the edit, and this is what reaches you:

```markdown
## v2.1.0

v2.1.0 adds a caching layer. Builds are faster across the board, and
cold starts are roughly 40% faster.
```

Four alerts, none of them your problem. Every artifact above is real — the draft was judged by Vale, the report is the hook's actual output, and the repair exits 0. This post was linted the same way, and at the worst point a single paragraph drew five alerts before it passed.

Outside an agent, the loop is one pipe — no file, no server, and an exit code a prompt can't supply:

<TermApp
  app="bash"
  session={[
    {
      cmd: 'echo "The team made a decision in order to ship." | vale --ext=.md --output=line',
      out: [
        "stdin.md:1:10:Voices.WeakVerbs:Weak verb phrase: use 'decided' instead of 'made a decision'.",
        "stdin.md:1:26:Voices.WeakVerbs:Weak verb phrase: use 'to' instead of 'in order to'."
      ]
    },
    { cmd: 'echo $?', out: ['1'] },
    { cmd: 'echo "The team decided to ship." | vale --ext=.md --output=line' },
    { cmd: 'echo $?', out: ['0'] }
  ]}
  caption="The same check from a shell. A sentence piped in comes back with its alerts and a nonzero exit; a clean one prints nothing and exits 0."
/>

## Where the voices come from

Each voice is an entry in the [output-style catalog](https://github.com/smixs/awesome-claude-output-styles), rewritten as the constraint its description states. Only [no-ai-slop](https://github.com/petergyang/no-ai-slop) contributed text — the word list and most of the shared core are a translation of its `SKILL.md` into check syntax. Both upstreams are MIT, every derived file names its source, and [NOTICE](https://github.com/jdkato/voices/blob/main/NOTICE) ships inside the archive alongside the license.

## Conclusion

To try Voices, add the package to your configuration and run `vale sync`:

```ini
Packages = https://github.com/jdkato/voices/releases/latest/download/Voices.zip

[*.md]
BasedOnStyles = Voices, Direct
```

Voices requires Vale v3.20.0 and pulls in Std on sync. Both are covered in the [Std announcement](/blog/std).

If you have any questions or run into any problems, feel free to open an issue at the [Voices repository](https://github.com/jdkato/voices).
