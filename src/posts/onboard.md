---
title: 'Setting up Vale with an agent'
description: 'One prompt takes a repository from no Vale to a reviewed baseline, and twelve more skills cover the rest: a written style guide turned into tested rules, a guide written from the config, the backlog, CI, commit messages, and a hook that holds the agent to the result.'
date: '2026-11-19'
draft: false
tags: ['agents', 'tutorials']
motif: 'onboard'
imageAlt: 'A terminal showing a setup proposal: 54 errors on the first run and 5 with the baseline, twelve names accepted, one misspelled product name still flagged, and the question "Apply this as a pull request?"'
---

<script>
  import GuidePiles from '$lib/components/blog/GuidePiles.svelte';
  import OnboardBaseline from '$lib/components/blog/OnboardBaseline.svelte';
  import OnboardFlow from '$lib/components/blog/OnboardFlow.svelte';
  import OnboardHistory from '$lib/components/blog/OnboardHistory.svelte';
  import OnboardPackages from '$lib/components/blog/OnboardPackages.svelte';
  import OnboardTerm from '$lib/components/blog/OnboardTerm.svelte';
  import SkillsMap from '$lib/components/blog/SkillsMap.svelte';
</script>

Last week's post ended on a claim: the hard part of a linter was [configuring it](/blog/quality-gate#the-part-that-was-hard), and that is the part a model has made cheap. This post is the walkthrough. It starts with one prompt, in a repository with docs and no Vale, that comes back as a pull request the team can review. Then it covers the rest of what the agent can do: enforce a written style guide, write one, tune a choice, work down a backlog, and keep itself to the rules it set up.

The example is Vale's own documentation, [vale-cli/docs](https://github.com/vale-cli/docs): 41 Markdown pages and 16 MDX pages under `website/`. Everything quoted below is from that run.

## The prompt

The setup lives in [agent-tools](https://github.com/vale-cli/agent-tools), a set of skills for the coding agent you already run. In Claude Code, install the plugin:

```text
/plugin marketplace add vale-cli/agent-tools
/plugin install vale@agent-tools
```

Then, in the repository:

```text
/vale:onboard
```

Any other agent that can run a shell can follow the same instructions without the plugin:

```text
Clone https://github.com/vale-cli/agent-tools into a temp directory, then
follow skills/onboard/SKILL.md to set up Vale in this repository.
```

If Vale isn't installed, the agent installs it: through Homebrew, `pacman`, or snap where one is available, otherwise the release binary, checksum-verified. On Windows a PowerShell installer does the same with winget, Scoop, or Chocolatey.

## It looks before it asks

The usual way to set up a linter is a questionnaire. Which style guide? Which directory? Should CI fail? Those are hard to answer about a tool you haven't seen run on your own files, so the skill asks none of them. It reads the repository instead.

<OnboardFlow caption="The seven steps of the skill. Everything above the line happens in a temp directory; the repository is touched only after the proposal is accepted." />

A survey script reports where the prose is, whether a CI job already lints a path, what other tools hold decisions worth carrying over, and whether the docs are translated. A word list kept for another spell checker becomes the start of the vocabulary. A workflow that already runs Vale gets updated; a second one isn't added.

Then it tries the candidate packages against the docs, in a temp directory, with a throwaway config:

<OnboardPackages caption="Output of preview.sh -p Microsoft -p Google website: both packages on the same 41 Markdown and 16 MDX files, on one scale." />

Microsoft is quieter here, so it becomes the default. The same script then prints that package in full: the busiest rules, and for every error-level rule one real alert with its file and line. That is the raw material for every decision that follows, and it takes seconds. Nothing in the repository has changed.

## The proposal

Fifty-four errors is not a baseline. A job that blocks on them would be red on its first run, and a job that is red on its first run teaches a team to ignore it. So the agent drafts the rest, still in temp files: a vocabulary for the names spell check doesn't know, a decision for each error-level rule, and the style choices the docs already make. It previews again with all of that applied:

<OnboardBaseline caption="Microsoft as shipped against Microsoft with the drafted baseline. Suggestions rise by eight because the eight contraction alerts moved down from errors to advice." />

Then it shows one message. This is what it wrote, sixty seconds after the prompt:

<OnboardTerm name="proposal" title="/vale:onboard" caption="The proposal, as the agent wrote it. Nothing has been written to the repository at this point." />

Three things about it are deliberate.

It leads with findings. `VSCode` on line 16 of a named file, in docs that elsewhere write "VS Code," is a mistake anyone on the team would agree is one. A count of 427 convinces nobody; a typo in a page they wrote does.

Every choice comes with its evidence. The docs say "we" 52 times, so the rule against "we" is off, and the line says why. Contractions were blocking with 8 hits; now they are advice. Each default is read from what the docs already do, and each is one line to change: "use Google" or "keep the We rule" re-runs the preview with that line swapped and nothing else re-asked.

The five errors that remain are left as errors. The agent could have reached zero by accepting `VSCode` into the vocabulary, and the skill forbids that in so many words: the count that matters is the one nobody had to hide. So CI starts advisory, and "Blocking CI" sits in the list of things not included, with the reason.

## What a yes writes

One yes applies all of it:

- `.vale.ini`, with the package, the path, and the vocabulary
- the accepted terms, in `accept.txt`
- each override, with its reason as a comment above it
- a small house style for the preferred terms, with test cases that `vale test` runs
- the CI change, generated by a script, not written from memory

The reasons are in the config because an unexplained `NO` looks the same as someone silencing a rule to get a build through. Two of the choices above, as they land:

```ini
# 52 uses; the docs speak as "we" throughout.
Microsoft.We = NO

# 9 hits, right rule. Advisory until they're fixed.
Microsoft.Quotes = warning
```

Then the agent checks its own work. The preview script runs once more, this time against the real config, and its report has to match the proposal's line for line. If it doesn't, a glob or an override isn't matching, and the agent finds out which before it reports anything.

The result is one commit on a branch and a pull request whose description is the proposal. A baseline is a set of editorial decisions, and the person at the keyboard is rarely the only one they affect. The rest of the team approves the same table, the same findings, and the same reasons. The agent doesn't merge it, and it doesn't touch the prose: a setup pull request that also rewrites forty pages won't get reviewed.

Onboarding is one of thirteen skills. The rest of this post is the other twelve, and each can be asked for in plain words:

<SkillsMap caption="The thirteen skills, with a phrase that brings each one up. Each name links to its instructions." />

## The style guide, in both directions

Onboarding starts from a package, because a package is what a repository with no opinions yet can adopt. Most teams have opinions. They are in a document called the style guide, and the usual fate of that document is that nobody checks anything against it.

`/vale:from-guide` reads the guide and sorts every statement in it into one of four piles:

- **Already covered.** "Use sentence case" is a package rule. It gets a level, not a new rule.
- **A rule.** "Write 'sign in,' not 'log in'" becomes one, with tests.
- **Vocabulary.** "Our product is `Zentrix`, capital Z" goes in `accept.txt`.
- **Not checkable.** "Be warm" and "write for a busy reader" are listed in the report as needing a person.

The fourth pile is the important one. A rule that pretends to check tone fires on the wrong sentences, and then the team switches the whole style off. So the agent proposes the sort as a table, with counts at the top, before it writes anything.

<GuidePiles caption="The skill's worked example: a short guide, sorted. Seven statements become five rules with thirteen tests, one level on a package rule, and one line in the report." />

Each rule then links to the section it came from, and its tests are the guide's own examples. A "don't" has to be flagged and a "do" has to pass. This one is from the skill's worked example, a short guide that turns into five rules and thirteen tests:

```yaml
# Guide: Words > Sign in
extends: substitution
message: "Use '%s' instead of '%s'."
link: style-guide.md#sign-in
level: warning
ignorecase: true
swap:
  'log in|log on': sign in
  'login': sign-in
tests:
  - name: the guide's "don't" example is flagged
    input: Log in to your account.
    contains: "Use 'sign in' instead of 'Log in'."
  - name: the guide's "do" example passes
    input: Sign in to your account.
    want: ''
  - name: the noun form is flagged too
    input: Open the login page.
    contains: "'sign-in'"
```

`vale test --coverage` runs the cases and fails any rule that no case exercises, since a rule that matches nothing passes every negative test. Then the agent counts each rule against the real docs and reads ten hits of anything busy. The tests show the rule does what was meant; the corpus shows whether what was meant was right. Nothing new starts at `error`.

`/vale:write-guide` goes the other way. A team that started from a package has a house style too, and it lives in `.vale.ini` and YAML that most writers never open. The skill writes the page a new contributor can read: what blocks a merge, the style choices and the reason the config gives for each, the words the project uses. The facts come from a script that lists every rule at the level it actually runs at, and the table it produces sits between markers so it can be regenerated without touching the prose. It writes Markdown, MDX, AsciiDoc, reStructuredText, Org, or HTML. A choice with no reason in the config is reported as a gap, not given an invented one.

## One choice, one rule, one exception

Three skills cover the changes a team makes after the baseline, each sized to the request.

`/vale:tune` takes a preference in plain words. "Use title case headings," "allow contractions," "it should be VS Code." It maps the sentence to the rule, counts what the change would flag before writing it, and puts the line in the config with its reason. The count is a check on the choice itself: on one docs set, sentence case flagged 10 headings and title case 75, so the corpus had already decided. For the choices no package covers, such as title case, no contractions, preferred terms, and one regional spelling, it ships templates with their tests already written.

`/vale:rule` writes one rule for a house convention. It asks for a sentence that breaks the convention and one that must not, because the second is the one that finds false positives. Both become test cases. The rule runs alone on the corpus before it is enabled, and the report says how many alerts it raised and how many of the ones read were wrong.

`/vale:ignore` is for the opposite problem, a rule that is right in general and wrong about text that isn't prose: a shortcode, a template variable, a generated block, one quotation. It picks the narrowest tool that works, a path, a `TokenIgnores` pattern, a `BlockIgnores` pattern, or a comment naming one rule around one passage. Then it checks that the alert count fell by exactly the number it targeted. A pattern that removed more is ignoring prose.

## The backlog

A first run on a large corpus is thousands of alerts. Three skills work it down.

`/vale:triage` turns the run into a decision per rule: fix, keep, downgrade, or switch off, each written into `.vale.ini` with its reason. `/vale:fix` clears error-level alerts a file at a time, applying the replacement each rule defines, one pull request per file. It leaves warnings and suggestions for a person. `/vale:vocab` handles spelling, which is usually the largest source of first-run errors and almost entirely names. It imports a word list kept for another spell checker, says whether the docs lean American or British, and installs dictionaries for other languages.

`/vale:setup` is the first step of onboarding on its own, for a team that wants a config and an honest first run and will make the decisions itself. It also covers two things the baseline leaves out: translated docs, and the comments in source code.

## Where it runs

A config that only runs when someone remembers to type `vale` isn't adopted. `/vale:ci` looks at what the repository already has and generates the GitHub Actions workflow or the pre-commit entry from a script. It asks three things: what a pull request check looks at (the lines it adds, the files it touches, or everything), what it reports, and when it fails. The default is advisory and new lines only, so the backlog lands on nobody.

`/vale:commits` does the same for the log, with the [Commits](/blog/commits) package. It doesn't ask which convention you want. It scores the history against each one first. This is its read of the agent-tools repository's own last twenty commits:

<OnboardHistory caption="Output of history.sh -n 20 on the agent-tools repository, as commits that pass. All twenty pass the core every convention shares. The script's verdict: closest is SevenRules, and enforcing it confirms what the team does." />

Then it sets up the convention the history already follows, with the hook and the CI check.

## The agent is held to it too

The plugin installs a hook, and it is the piece that keeps the baseline from eroding. Each time the agent writes or edits a file Vale lints, the hook lints that one file and hands back the alerts in the same turn. That includes source files, when the config has a section for them: a typo in a doc comment is caught the same way. A second hook does this for commit messages, after the agent commits, when the config has a commit section.

By default only errors reach the agent. Warnings and suggestions are advisory by the project's own choice, and reporting them on every edit is how people end up turning a linter off. A setting raises that to warnings or to everything, for a style that is advisory on purpose.

The agent that set the rules up is held to them from then on, with the same message at the same line a person would get.

## When it goes quiet

The most common reason Vale "stops working" is a fresh clone where the styles were never synced. `/vale:doctor` checks the setup end to end and gives the command that fixes each broken thing:

<OnboardTerm name="doctor" title="/vale:doctor" caption="The doctor report on a fresh clone. Both failures have one cause, and the fix is printed under the first." />

## Three experiments, and other agents

Three more plugins ship in the same marketplace, all marked experimental. `vale-onboard` draws the proposal as a pane beside the chat, with a button per package and per rule, and every press re-runs the preview. `vale-tools` gives the agent `lint` and `test` as tools it calls without a shell, so it can check a draft before writing it. `vale-lsp` connects Vale's language server, so alerts arrive as diagnostics; use it or the edit hook, not both.

None of this is tied to one agent. `skills/` is a plain directory of instructions and POSIX shell scripts, so most clients read it as it is. For a setup with no skill support, [AGENTS.md](https://vale.sh/AGENTS.md) covers the same ground as prose.

That is the split from last week, in practice. The model spends its attention on judgment: which package, which words are names, which statements in a guide a rule can check and which need a person. What it leaves behind is a config, a directory of tested rules, and a pull request. From there the checking costs nothing.

## Method

The onboarding run is `/vale:onboard` on a clone of [vale-cli/docs](https://github.com/vale-cli/docs) with Vale 3.27.0. The proposal and the doctor report are reproduced as the agent and the script wrote them, with one long line cut short, and the charts are drawn from the preview and history scripts' output; the agent-tools [README](https://github.com/vale-cli/agent-tools#readme) has each as an image. Every figure's numbers are in [`onboard.ts`](https://github.com/vale-cli/vale.sh/blob/main/src/lib/data/onboard.ts). The sign-in rule is [`SignIn.yml`](https://github.com/vale-cli/agent-tools/blob/main/skills/from-guide/example/styles/Acme/SignIn.yml) from the `from-guide` example.
