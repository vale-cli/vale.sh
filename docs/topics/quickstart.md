# Quickstart

Get Vale running on your project in about five minutes.

This walks through a first working setup. Each step links to the page that covers it properly, so read on where you want the detail.

## [1. Install Vale](quickstart.md#1-install-vale)

Use your package manager—`brew install vale`, `choco install vale`, or one of the others on the [Installation](installation.md) page—then check it worked:

```bash
$ vale --version
```

## [2. Create a `.vale.ini`](quickstart.md#2-create-a-valeini)

Vale doesn't ship with opinions of its own. It needs a configuration file saying where to keep styles and which to apply, so create one in the root of your project:

{% code title=".vale.ini" %}
```ini
StylesPath = styles
MinAlertLevel = suggestion

Packages = Microsoft

[*.md]
BasedOnStyles = Vale, Microsoft
```
{% endcode %}

Four things are happening:

* `StylesPath` is the folder Vale will keep downloaded styles in. Add it to your `.gitignore`.
* `MinAlertLevel` is the lowest severity worth reporting.
* `Packages` names what to download—here, Microsoft's writing style guide.
* `[*.md]` applies the styles that follow it to Markdown files. `Vale` is built in; `Microsoft` is the package.

See [.vale.ini](.vale.ini.md) for everything the file accepts.

## [3. Download the styles](quickstart.md#3-download-the-styles)

```bash
$ vale sync
```

```
 SUCCESS  Synced 1 package(s) to 'styles'.
```

Run this again whenever you change `Packages`. See [Packages](../keys/packages.md) for other ways to name one, including a URL or a local path.

## [4. Lint something](quickstart.md#4-lint-something)

```bash
$ vale README.md
```

```
 README.md
 3:1   suggestion  Consider using 'to' instead of 'In order to'.  Microsoft.Wordiness
 3:13  suggestion  Consider using 'use' instead of 'utilize'.     Microsoft.Wordiness

✔ 0 errors, 0 warnings and 2 suggestions in 1 file.
```

You can pass a directory instead of a file, or a glob:

```bash
$ vale docs/
$ vale --glob='*.md' .
```

## [5. Read the output](quickstart.md#5-read-the-output)

Each line is one alert:

```
 3:13  suggestion  Consider using 'use' instead of 'utilize'.     Microsoft.Wordiness
 └─┬─┘ └────┬───┘  └──────────────────┬──────────────────────┘    └────────┬────────┘
 line:col  severity                 message                            rule name
```

The rule name is the useful part: it's `<style>.<rule>`, and it's how you turn one off. To silence that rule for Markdown, name it in your config:

```ini
[*.md]
BasedOnStyles = Vale, Microsoft

Microsoft.Wordiness = NO
```

Severity matters for automation. **Only `error` sets a non-zero exit code**, so a CI job fails on errors and passes with warnings and suggestions:

```bash
$ vale README.md   # 2 suggestions
$ echo $?
0
```

See [MinAlertLevel](../keys/minalertlevel.md) for changing what gets reported, and [BasedOnStyles](../keys/basedonstyles.md) for enabling and disabling rules.

## [With an assistant](quickstart.md#with-an-assistant)

A coding assistant can do the steps above for you. In Claude Code, install the [agent tools](https://vale.sh/agents) plugin:

```
/plugin marketplace add vale-cli/agent-tools
/plugin install vale@agent-tools
```

Then run `/vale:onboard`. It tries the style packages against your docs, drafts a configuration, a vocabulary, and a CI job, and shows you one proposal with before and after counts. Nothing is written until you say yes. It drives the `vale` binary on your machine, installing it first if it's missing.

Two more pieces come with it:

* **Skills** for the work after setup, such as `/vale:tune` to change a style choice, `/vale:from-guide` to turn your style guide into tested rules, and `/vale:fix` to clear the errors.
* **Hooks** that lint each file the assistant writes, and each commit it makes, and hand back the error-level alerts so they're fixed in the same turn.

Both run locally and need no account.

For any other assistant, save [AGENTS.md](https://vale.sh/AGENTS.md) in the root of your repository. [Agent setup](../guides/agent-setup.md) walks through the whole process.

## [Where to go next](quickstart.md#where-to-go-next)

* Browse the [Package Explorer](https://vale.sh/explorer) for styles beyond Microsoft.
* Write your own rules with [Styles](styles.md) and the [checks](../checks/existence.md) reference.
* Narrow what Vale reads using [Scopes](scopes.md).
* Hold an assistant's own writing to a style with the [Agents](../guides/agents.md) guide.
