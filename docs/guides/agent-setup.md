# Agent setup

Have a coding assistant set Vale up in your repository, shape it to how your team writes, and check the assistant's writing as it works.

The [Quickstart](../topics/quickstart.md) sets Vale up by hand in five steps. This guide has an assistant do the work, using Vale's [agent tools](https://vale.sh/agents). These are a plugin of skills (each a set of instructions for one job) and hooks that check what the assistant writes. It covers each skill, in the order a project meets them.

{% hint style="info" %}
The commands below are for Claude Code, which installs everything as one plugin. For other assistants, see [Other assistants](agent-setup.md#other-assistants).
{% endhint %}

## [Before you start](agent-setup.md#before-you-start)

You need very little:

* **The `vale` binary.** The `onboard` and `setup` skills install it if it's missing: through Homebrew, `pacman`, or snap where one is available, otherwise the release binary, checksum-verified. On Windows a PowerShell installer uses winget, Scoop, or Chocolatey. To install it yourself, see [Installation](../topics/installation.md).
* **A POSIX shell**, for the hooks and the skills' helper scripts. macOS and Linux have one. On Windows, install Git for Windows, which includes Git Bash.
* **`jq`**, for the `fix`, `triage`, and `vocab` skills, which read Vale's JSON output.

The skills that write rules test them with [`vale test`](../topics/testing.md), which requires Vale v3.24.0 or later. You don't need an account: the skills and the hooks run the CLI on your machine, against your files.

## [1. Install the plugin](agent-setup.md#1-install-the-plugin)

In Claude Code, type these as two slash commands:

```
/plugin marketplace add vale-cli/agent-tools
/plugin install vale@agent-tools
```

The second command restarts the session, which is what registers the hooks.

To check the install, type `/vale:`. Thirteen completions appear:

| Skill               | Use it to                                                                    |
| ------------------- | ---------------------------------------------------------------------------- |
| `/vale:onboard`     | Go from no Vale to a reviewed baseline in one pass.                          |
| `/vale:setup`       | Write a `.vale.ini`, sync the styles, and get a first run.                   |
| `/vale:doctor`      | Check a setup end to end and get the fix for each broken part.               |
| `/vale:tune`        | Change one style choice, such as heading case or contractions.               |
| `/vale:from-guide`  | Turn a written style guide into tested rules.                                |
| `/vale:rule`        | Write one rule for a house convention and test it.                           |
| `/vale:write-guide` | Write a readable style guide from the configuration.                         |
| `/vale:vocab`       | Add your terms to a vocabulary, and set up dictionaries.                     |
| `/vale:triage`      | Turn a large first run into a decision per rule.                             |
| `/vale:ignore`      | Stop Vale flagging text that isn't prose, such as shortcodes.                |
| `/vale:fix`         | Fix error-level alerts, one pull request per file.                           |
| `/vale:ci`          | Run Vale in GitHub Actions, pre-commit, or another runner.                   |
| `/vale:commits`     | Lint commit messages against the convention your history follows.            |

You don't have to call a skill by name. Ask in your own words, "add prose linting to this repository," and the assistant picks the one that fits.

## [2. Onboard in one prompt](agent-setup.md#2-onboard-in-one-prompt)

In a repository that has prose and no Vale yet, run:

```
/vale:onboard
```

The result is a baseline the team can keep: a configuration, a vocabulary, a decision for each rule that would block a merge, and a CI job. The assistant shows it as one proposal and applies it on one yes.

### [What it does before asking](agent-setup.md#what-it-does-before-asking)

Everything up to the proposal happens in a temp directory. Your repository doesn't change.

1. **It looks.** A script reads the repository and reports what there is to work with: where the prose is, translated docs, source code by language, a written style guide, existing CI and hook runners, and whether Vale is installed or configured.
2. **It previews the candidates.** It tries the Microsoft and Google packages against your docs and takes the quieter one, unless you named a package.
3. **It drafts the baseline.** A vocabulary from the terms spell check doesn't know, starting from any word list you already keep for cspell or another spell checker. A decision for every rule that would block a merge. Your style choices, read from how the docs are written today. The front matter fields that are URLs and shouldn't be linted.
4. **It previews again** with all of that applied. The numbers in the proposal come from that run.

### [The proposal](agent-setup.md#the-proposal)

This is the proposal an assistant produced for Vale's own documentation site:

```
Vale baseline for website/ (41 .md, 16 .mdx) — nothing written yet

              total   errors  warnings  suggestions
First run       427       54       106          267
With baseline   353        5        73          275

What it found, in your files
  "VSCode" in creating-plugin.md:16 — the product is "VS Code" (4 uses)
  "Intellij" in intellij.md:10 — the product is "IntelliJ"
  "e.g.," in core.md:19 → "for example"

Package:     Microsoft   (Google: 598 alerts, 68 errors — say so to switch)
Path:        website/    the path your CI job already lints
Vocabulary:  12 terms    Asciidoctor, Buildkite, DZone, Jilles, Linode, Tengo, …
Not linted:  front matter `id` — page URLs, not prose (cli, gui, vscode, …)

Style choices — from how the docs are written today; change any
  Headings       sentence case   12 hits; advice only, as shipped
  "We"           allowed         52 uses; the docs speak as "we" throughout
  Contractions   advice only     8 hits; was blocking
  "e.g."         spell out       4 hits; shown in review, not blocking
  Terms          VS Code, IntelliJ   6 inconsistent spellings get a fix

Other overrides: 1
  Microsoft.Quotes = warning     9 hits, right rule; not blocking yet
CI:          update .github/workflows/main.yml — advisory, and only on lines
             a pull request adds, so the backlog never lands on anyone.
Still errors: 5 — "VSCode" (4) and "Intellij" (1), the spellings above. Real
              findings; I'd leave them for a follow-up fix.

Not included — say the word for any of these
  Blocking CI        5 errors would fail it today; fix those first
  One-click fixes    suggested changes on pull requests (not from forks)
  Code comments      5 .jsx, 3 .js, 1 .tsx, 1 .py files
  One spelling       79 American, 1 British ("centre") — enforce American
  Commit messages    closest to the "seven rules": 1 of your last 2 pass
  A written guide    generated from this config, for contributors
  In your editor     alerts as you type

The reasons in the config are what I observed, for you to replace with yours.
Apply this as a pull request? Or tell me what to change.
```

Read it in three parts:

* **The top** has the before and after counts, and two or three real mistakes in named files.
* **The middle** is every editorial choice, with the default the assistant picked and the count behind it. A "yes" accepts all of it. "Use Google" or "keep contractions blocking" changes one line, and the assistant previews again without starting over.
* **"Not included"** is everything else Vale can do for this repository, each named with one fact and switched off. Each is a separate yes, with a skill of its own.

### [What a yes does](agent-setup.md#what-a-yes-does)

The assistant writes the configuration, the ignore rules, the vocabulary, the overrides with their reasons, any rules of your own, and the CI change. It runs the preview once more against the real configuration and confirms that it matches the proposal.

By default the result is a pull request whose description is the proposal, so the rest of the team reviews the same thing you did. Say "just commit it" if you'd rather not. The assistant doesn't push to your default branch or merge the pull request itself.

Note these defaults:

* **CI starts advisory**, and on a pull request it looks only at the lines that request adds. Teams ignore a job that's red on its first run.
* **It doesn't edit your prose.** The errors that remain are listed as findings for a follow-up, since a setup pull request that also rewrites forty pages won't be reviewed.
* **It doesn't hide alerts.** It won't raise [`MinAlertLevel`](../keys/minalertlevel.md) or accept a typo into the vocabulary to get a clean count.

If the session is interrupted, run `/vale:onboard` again. It checks what exists and does only what's missing.

### [Setting up by hand instead](agent-setup.md#setting-up-by-hand-instead)

`/vale:setup` does only the first part. It installs Vale and writes a `.vale.ini` for the formats actually present, along with the ignore rules. Then it syncs and reports the first run. Use it when you want the configuration and intend to make the other decisions yourself.

```
/vale:setup The prose is in docs/ and README.md. Use the Microsoft package.
```

It also adds the two sections a first configuration usually leaves out, when you ask for them.

**Translated docs** shouldn't be read as English. Each language gets a section after the general one:

```ini
[*.md]
BasedOnStyles = Vale, Microsoft

[docs/fr/**/*.md]
Lang = fr
BasedOnStyles = Vale
```

See [Lang](../keys/lang.md). Spell check needs that language's dictionary, which `/vale:vocab` installs.

**Comments in source code** need a section that lists the extensions. Spelling starts at `warning`, since comments are full of identifiers:

```ini
[*.{go,py}]
BasedOnStyles = Vale

Vale.Spelling = warning
```

See [Code](../formats/code.md) for the languages Vale reads.

## [3. Make the style yours](agent-setup.md#3-make-the-style-yours)

A package is a starting point. The skills below move the configuration from Microsoft's or Google's choices to your team's.

### [Change a style choice](agent-setup.md#change-a-style-choice)

`/vale:tune` takes a preference in plain words and maps it to the rule:

```
/vale:tune We use title case in headings.
```

It covers the choices teams argue about: heading capitalization, contractions, "we" and "I", passive voice, the Oxford comma, exclamation points, "e.g." and "i.e.", semicolons, and sentence length. Most are one line in `.vale.ini`, written with the reason above it:

```ini
# We address the reader as "we" in tutorials.
Microsoft.We = NO
```

Before writing anything, it counts what the change would flag. A choice that flags three quarters of your docs is probably the wrong one, and it says so.

Some choices are the opposite of what the packages check, or something no package can know. For these, the skill includes tested templates and installs one as a rule of your own:

| Choice                                  | What it installs                                  |
| --------------------------------------- | ------------------------------------------------- |
| Title-case headings                     | A capitalization rule, with the package's off.    |
| Avoid contractions                      | An existence rule, with the package's off.        |
| Preferred terms, such as `VS Code`      | A substitution rule, with your pairs and a fix.   |
| One regional spelling                   | A spelling rule that uses a regional dictionary.  |

Each comes with [test cases](../topics/testing.md), and the skill runs `vale test --coverage` on your style before it reports.

### [Turn your style guide into rules](agent-setup.md#turn-your-style-guide-into-rules)

If your team already has a written style guide, `/vale:from-guide` turns it into rules:

```
/vale:from-guide docs/style-guide.md
```

It reads the whole guide and sorts every statement into one of four piles:

| Pile            | Looks like                                           | What happens                                        |
| --------------- | ---------------------------------------------------- | --------------------------------------------------- |
| Already covered | "Use sentence case." "Avoid passive voice."          | A package rule exists, and its level is set.        |
| A rule          | "Write 'sign in', not 'log in'."                     | A rule is written, with tests.                      |
| Vocabulary      | "Our product name takes a capital Z."                | An entry in the vocabulary.                         |
| Not checkable   | "Be warm." "Lead with the outcome."                  | Listed in the report as needing a person.           |

It shows that table and waits for a yes, since a team may want fewer rules than its guide has sentences. Then it writes one rule per statement:

```yaml
# Guide: Words > Sign in
extends: substitution
message: "Use '%s' instead of '%s'."
link: https://example.com/style-guide#sign-in
level: warning
ignorecase: true
swap:
  'log in|log on': sign in
tests:
  - name: the guide's "don't" example is flagged
    input: Log in to your account.
    contains: "Use 'sign in' instead of 'Log in'."
  - name: the guide's "do" example passes
    input: Sign in to your account.
    want: ''
```

These details make the rules trustworthy:

* **`link` points at the guide section.** An alert takes a writer to the reason.
* **The tests come from the guide.** Its "do" and "don't" examples were written by the people responsible for the rule: every "don't" must be flagged and every "do" must pass.
* **Nothing new starts at `error`.** A rule begins at `warning`, or `suggestion` for length and frequency, so it can't block text written before it existed.

After the tests pass, it runs the new rules over your docs and reads a sample of each rule's hits. A rule that flags hundreds of correct sentences is wrong, and it narrows the rule and adds the false positive as a test.

The fourth pile is part of the result. A rule written to check tone flags the wrong sentences, and the team switches the whole style off.

### [Add one rule](agent-setup.md#add-one-rule)

For a single convention that isn't covered by a package or template, `/vale:rule` writes one rule. Give it the convention, a sentence that breaks it, and a sentence that must not be flagged:

```
/vale:rule Flag "simply" and "just". "Simply run the installer." should fail;
"Run `just build` first." should not.
```

It first checks that no installed rule already does the job, since changing a level is then the whole fix. It writes the rule in your project's own style folder with its test cases beside it, runs `vale test --coverage`, and then runs the rule alone over your files, so you see the count before it's enabled. A new rule starts at `warning`.

### [Write the guide your configuration implies](agent-setup.md#write-the-guide-your-configuration-implies)

`/vale:write-guide` goes the other way. Your rules live in `.vale.ini` and YAML that most writers never open; this writes the page a new contributor can read:

```
/vale:write-guide Put it at docs/contributing/style.md.
```

It writes in the format your docs already use: Markdown, MDX, AsciiDoc, reStructuredText, Org, or HTML. The guide covers how the checks work, what blocks a merge, the style choices and why, the words you use, and a rule reference.

The facts are read, not recalled. A script lists every rule the configuration turns on, the level it runs at after your overrides, and the comment you wrote above each override as its reason. The reference table sits between markers, so it can be regenerated without touching the prose:

```markdown
<!-- vale-inventory:start -->
…table…
<!-- vale-inventory:end -->
```

Where an override has no comment, the guide says that no reason is recorded. It doesn't invent one.

### [Teach Vale your words](agent-setup.md#teach-vale-your-words)

`/vale:vocab` handles spelling alerts on terms that are correct for your project. It collects the words `Vale.Spelling` flags and has you confirm which are yours. Then it adds them to a [vocabulary](../keys/vocabularies.md) at `styles/config/vocabularies/<Project>/accept.txt`.

It does three more things:

* **It imports a word list you already keep**, such as `cspell.json` or a `.wordlist.txt`. It keeps only the words Vale doesn't already know.
* **It leaves front matter alone.** A flagged `id: vscode` is a URL. It adds the field to [`IgnoredScopes`](../keys/ignoredscopes.md) and doesn't accept or "fix" the word.
* **It sets up dictionaries.** Vale's built-in dictionary accepts both "color" and "colour". To enforce one, the skill counts which way your docs lean and installs a regional dictionary such as `en_GB`. Then it adds a spelling rule that uses it. For docs in another language it installs that language's dictionary.

An accepted term is enforced as written: with `Kubernetes` in the list, Vale also flags `kubernetes`.

### [Decide what to do with a noisy run](agent-setup.md#decide-what-to-do-with-a-noisy-run)

`/vale:triage` is for a configuration that already exists and reports thousands of alerts. It counts alerts by rule and reports which few rules produce most of the output. Then it sorts each rule into a bucket:

| Bucket    | When                                         | What it writes                          |
| --------- | -------------------------------------------- | --------------------------------------- |
| Fix       | Few hits, and the rule is right.             | Nothing. The alerts go to `/vale:fix`.  |
| Keep      | The rule is right and already advisory.      | Nothing.                                |
| Downgrade | The rule is right and the backlog is real.   | A lower level, with a comment.          |
| Disable   | The rule doesn't match how you write.        | `NO`, with a comment.                   |

It shows the plan and the exact lines, and writes them to `.vale.ini` once you agree.

### [Exclude what isn't prose](agent-setup.md#exclude-what-isnt-prose)

A rule can be right in general and wrong about a specific piece of text, such as a templating tag, a shortcode, a generated block, or a quotation. `/vale:ignore` takes that text out of Vale's view at the narrowest scope that works:

| What's being flagged                      | What it uses                                                                              |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- |
| A recurring inline token, like `{{ var }}` | [`TokenIgnores`](../keys/tokenignores.md)                                                 |
| A recurring block, like a shortcode pair  | [`BlockIgnores`](../keys/blockignores.md)                                                 |
| The contents of an HTML tag               | [`IgnoredScopes`](../keys/ignoredscopes.md) or [`SkippedScopes`](../keys/skippedscopes.md) |
| One passage, once                         | A comment in the file that specifies the rule                                             |

A pattern in the configuration applies to all files at once. A comment is the last choice. Afterward it runs Vale again and confirms that the total dropped by the alerts it targeted and no more, since a pattern that removes extra alerts is ignoring prose.

## [4. Keep it passing](agent-setup.md#4-keep-it-passing)

### [Fix what blocks](agent-setup.md#fix-what-blocks)

`/vale:fix` fixes the error-level alerts, applying the replacement each rule defines, and opens one pull request per file. It leaves warnings and suggestions alone and reports how many there are. It never switches a rule off to make a run pass, and it won't change what a sentence means to satisfy a rule.

### [Run Vale in your pipeline](agent-setup.md#run-vale-in-your-pipeline)

`/vale:ci` generates the GitHub Actions workflow or the [pre-commit](../integrations/pre-commit.md) entry from a script, after looking at what the repository already has. It asks four questions, in plain words:

| Question                                  | Choices, default first                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------- |
| What should it look at on a pull request? | Only the lines it adds · every alert in the files it touches · everything        |
| What should it report?                    | Every alert · warnings and errors · errors only                                 |
| When should it fail?                      | Never, only report · on errors · on warnings too                                |
| How should it show up?                    | Annotations on the check · review comments with one-click fixes                 |

Looking only at added lines is what lets a repository with a backlog adopt Vale: nobody is told about text they didn't write. Review comments can't be posted on pull requests from forks, so an open source project usually keeps annotations.

It updates a job that already runs Vale and doesn't add a second. For runners other than GitHub Actions, it gives the command to run.

### [Lint commit messages](agent-setup.md#lint-commit-messages)

`/vale:commits` holds your commit log to a convention, using Vale's [commit message support](commit-messages.md). It reads the history first:

```
Convention      failing   most common reason
(core only)        0/14
Conventional      12/14   Conventional.Type (12)
SevenRules         4/14   SevenRules.Capitalize (3)
...
Closest: SevenRules, but 4 of 14 fail. A habit, not yet a convention; ask before enforcing.
```

Where most of the history passes one convention, it sets that one up. Where about half passes, it shows the number and asks. It then adds the section to `.vale.ini`:

```ini
Packages = Microsoft, Commits

[COMMIT_EDITMSG]
BasedOnStyles = Commits, SevenRules
```

It installs the hook in the form your repository already uses, such as lefthook, husky, or pre-commit, and adds a CI check that lints each commit a pull request adds. It doesn't rewrite existing history. This requires Vale v3.21.0 or later.

## [5. Let the hooks check the assistant](agent-setup.md#5-let-the-hooks-check-the-assistant)

Once a configuration exists, two hooks are active. Both run on the assistant's work, not yours.

### [The edit hook](agent-setup.md#the-edit-hook)

Each time the assistant writes or edits a file, the hook lints that one file and hands the alerts back in the same turn:

```
Vale reports 1 alert(s) at error level or above in this file:
  line 4: House.Terms [error] — Use 'allowlist' instead of 'whitelist'.

Fix these before moving on, preserving the markup exactly. Do not disable a rule to clear one.
```

The assistant fixes the alert before it moves on. The hook lints the whole file, so an error that was already there is reported along with any the edit added.

Some of its behavior surprises people:

* **It runs on the assistant's edits.** Saving a file in your editor does nothing. For that, use an [editor integration](lsp.md).
* **It's silent unless there's an error.** It doesn't produce any output for a clean file, a file Vale doesn't lint, or a repository without a Vale configuration.
* **It finds the configuration from the file.** It walks up from the edited file to the nearest `.vale.ini` and runs Vale there, so a section such as `[docs/**/*.md]` matches wherever the session started.

It covers prose files, and source files too when your configuration has a section for them.

### [Choose which alerts it reports](agent-setup.md#choose-which-alerts-it-reports)

By default the hook reports errors only, since a project's warnings and suggestions are advisory by its own choice. A style whose rules are all advisory, such as a [voice](agents.md#what-an-agent-writes), needs a wider setting. Run `/plugin`, open the Vale plugin's settings, and set **Alert level the edit hook reports**:

| Value        | The hook reports      |
| ------------ | --------------------- |
| `error`      | Errors. The default.  |
| `warning`    | Errors and warnings.  |
| `suggestion` | Everything.           |

To change it for one session, set `VALE_HOOK_LEVEL` instead:

```bash
VALE_HOOK_LEVEL=warning claude
```

`MinAlertLevel` in `.vale.ini` controls what Vale reports at all, and this setting controls how much of that reaches the assistant. Setting it lower than `MinAlertLevel` has no effect.

### [The commit hook](agent-setup.md#the-commit-hook)

The second hook runs after the assistant makes a commit. If your configuration has a `[COMMIT_EDITMSG]` section, it lints the message Git recorded and hands back any error-level alerts, with the instruction to amend if the commit hasn't been pushed.

Your project's own `commit-msg` hook does this for people, but it's installed per clone, and an assistant's checkout usually hasn't run that setup. Without the section in the configuration, the hook does nothing.

## [6. When something isn't working](agent-setup.md#6-when-something-isnt-working)

Most Vale problems are silent: a configuration that lints nothing, styles that were never synced, a hook with nothing to say. `/vale:doctor` turns the silence into a list:

```
ok    vale 3.27.0 at /usr/local/bin/vale
ok    configuration loads: .vale.ini
FAIL  styles named in the configuration are not on disk: Microsoft
      -> vale sync
ok    vocabulary Docs: 12 terms accepted
warn  a run on README.md reports nothing
      -> if that is a surprise, check that a [section] glob in the configuration matches this file
```

It checks the binary, whether the configuration loads, whether every style it names is on disk, the vocabulary, a real run on a real file, the parsers AsciiDoc and reStructuredText need, and the hooks. It only reads. Each `->` line is the fix, and it applies one only when you ask.

The silent cases are usually one of these:

| What you see                              | The usual cause                                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------- |
| The hook does nothing.                    | It reports errors only. A file with warnings and no errors is silent by design.                   |
| Vale reports nothing on a file.           | No section in `.vale.ini` matches it. See [Globbing](globbing.md).                                |
| It worked yesterday.                      | The synced styles aren't in Git. A fresh clone has none until `vale sync` runs.                   |
| It passes locally and fails in CI.        | A user-level configuration on one machine is merged in. Compare with `vale --no-global`.          |
| Every word is a spelling error.           | A file in another language is being read as English.                                              |

## [More plugins](agent-setup.md#more-plugins)

Three more plugins come from the same marketplace. Each is experimental and installs separately.

### [The setup pane](agent-setup.md#the-setup-pane)

```
/plugin install vale-onboard@agent-tools
/vale-onboard
```

`vale-onboard` draws the `onboard` proposal as a pane beside the chat. It has a button for each style package with its alert count and a button on each rule to make it quieter. It also lists the unknown words to tick and where Vale should run. Each press runs the preview again, so the count shown is a real one. **Apply** puts the baseline you chose in the prompt, and the assistant applies it with the `onboard` skill.

In a repository that already has Vale, `/vale-checks` opens the "where it runs" part alone, with the generated workflow shown as you choose.

### [Vale as tools](agent-setup.md#vale-as-tools)

```
/plugin install vale-tools@agent-tools
```

`vale-tools` gives the assistant two tools it can call with no shell command:

| Tool   | What it does                                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `lint` | Lints a draft or a file against your rules and vocabulary, returning each alert with the replacement its rule defines. |
| `test` | Runs the test cases kept beside your own rules.                                                                        |

Because `lint` takes text, the assistant can check a paragraph or a commit message before writing it. It starts `vale` directly, so it works on Windows without Git Bash. In the desktop app it also adds **Check with Vale** and **Add to Vale vocabulary** to the menu on selected text.

### [The language server](agent-setup.md#the-language-server)

```
/plugin install vale-lsp@agent-tools
```

`vale-lsp` connects Claude Code to Vale's [language server](lsp.md), so alerts arrive as diagnostics after an edit. It reports errors only, matching the edit hook's default, and needs the `vale-ls` binary on your `PATH`.

It does the same job as the edit hook by another route. Install one or the other, or every alert arrives twice.

## [The MCP server](agent-setup.md#the-mcp-server)

The plugin also registers the Vale CMS [MCP server](mcp.md). The skills test a rule with `vale test`; the server goes further, diagnosing why a pattern doesn't match and stress-testing a rule for false positives. It's the one paid piece, and nothing above depends on it. Without a subscription its tools return a 401 that names Vale CMS.

## [Other assistants](agent-setup.md#other-assistants)

The skills are plain `SKILL.md` folders in [vale-cli/agent-tools](https://github.com/vale-cli/agent-tools/tree/main/skills). For an assistant that reads skills from a directory, copy the folders you want into it, such as `.cursor/skills/`.

Any coding agent that can run a shell can do the same setup from one prompt:

```
Clone https://github.com/vale-cli/agent-tools into a temp directory, then
follow skills/onboard/SKILL.md to set up Vale in this repository.
```

The hooks and the extra plugins are Claude Code features and don't come with the skills. For an assistant with no skill support, save [AGENTS.md](https://vale.sh/AGENTS.md) in the root of your repository.

## [See also](agent-setup.md#see-also)

* [Agents](agents.md): holding an assistant's own writing to a style, and linting the instruction files it reads.
* [Agent tools](https://vale.sh/agents): the skills, the hooks, and the plugins in one place.
* [Testing](../topics/testing.md): the test cases the skills write beside each rule.
* [Commit messages](commit-messages.md): what the `Commits` package checks.
