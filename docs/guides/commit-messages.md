# Commits

Lint the log with the same tool that lints the docs: a convention for the subject, body, and trailers, spelling on the body, and a hook that stops a bad commit.

A commit message has a subject, a blank line, a body, and trailers, and every project has rules about each. [Commits](https://github.com/jdkato/commits) is a package of those rules: the conventions people follow, [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), Angular's format, gitmoji, Emoji-Log, the seven rules, the Linux kernel's patch format, the Go project's, a Jira key, and the rule sets of the linters people run, commitlint, gitlint, committed, conform, and commitizen, each transcribed rule for rule. A [`textfsm` View](textfsm.md) reads the message into its parts. A rule can then target the subject the same way it targets a heading.

{% hint style="info" %}
Requires Vale v3.21.0 or later.
{% endhint %}

## Install

The package is in the [library](https://vale.sh/explorer), so its name is enough:

```ini
StylesPath = styles
Packages = Commits

[COMMIT_EDITMSG]
BasedOnStyles = Commits, Conventional
```

```console
$ vale sync
```

The package brings the section, the View, and `Commits`, which has the rules every convention shares. It requires a blank line after the subject and the imperative mood, and it rejects whitespace at the edges and a subject of `fix` or `wip`. You name the convention beside it.

| Style          | Enforces                                                                                       |
| -------------- | ---------------------------------------------------------------------------------------------- |
| `Conventional` | The [specification](https://www.conventionalcommits.org/en/v1.0.0/#specification), and only it |
| `Commitlint`   | commitlint's rules, with `config-conventional`'s on; goes with `Conventional`                  |
| `Angular`      | Angular's guidelines; goes with `Conventional`                                                 |
| `Gitmoji`      | One of the 75 gitmojis first, then a message                                                   |
| `EmojiLog`     | One of Emoji-Log's seven labels                                                                |
| `SevenRules`   | Chris Beams's seven rules: 50 characters, a capital, no period, the body wrapped at 72         |
| `Kernel`       | Subsystem prefix, 75 columns, `Signed-off-by:`, the `Fixes:` and `Closes:` tag forms           |
| `Go`           | Package prefix, no capital, `Fixes #123`                                                        |
| `Jira`         | An issue key in the subject                                                                    |
| `Gitlint`      | gitlint's built-in rules at their defaults                                                     |
| `Committed`    | committed's defaults                                                                           |
| `Conform`      | conform's commit policy                                                                        |
| `Commitizen`   | `cz check`'s schema; goes with `Conventional`                                                  |

Levels and toggles work as they do for any rule, and a limit is a parameter set with the bracket key:

```ini
[COMMIT_EDITMSG]
BasedOnStyles = Commits, Conventional, Commitlint
Commitlint.HeaderLength[max] = 72
Commits.Imperative = error
Conventional.Footer = NO
```

A rule a tool leaves off by default, commitlint's `scope-enum` or `references-empty`, is off here too. `Commitlint.References = YES` turns it on. Each rule file in the package's [styles](https://github.com/jdkato/commits/tree/main/Commits/styles) begins with what it reports and why. It also sets its level and links the passage it enforces. A guide per tool, [commitlint](https://github.com/jdkato/commits/blob/main/docs/commitlint.md), [gitlint](https://github.com/jdkato/commits/blob/main/docs/gitlint.md), [committed](https://github.com/jdkato/commits/blob/main/docs/committed.md), [conform](https://github.com/jdkato/commits/blob/main/docs/conform.md), and [commitizen](https://github.com/jdkato/commits/blob/main/docs/commitizen.md), maps that tool's config to the rules here.

## The hook

A `commit-msg` hook receives the path of the message file. Vale reads it on stdin, and `--path` names the section that applies, since the text has no name of its own:

```sh
#!/bin/sh
# .git/hooks/commit-msg
exec vale --path=COMMIT_EDITMSG < "$1"
```

Vale exits non-zero on an error-level alert. The commit stops, and the alerts stay on screen. Lines Git adds as commentary, and the diff `commit -v` appends, are never seen by a rule. The package's [`script/commit-msg`](https://github.com/jdkato/commits/blob/main/script/commit-msg) is that hook with two additions: messages Git writes itself, merges, reverts, and the `fixup!` and `squash!` that autosquash reads, are allowed, and on a fresh clone it runs `vale sync` once, when the `StylesPath` has no `Commits` in it.

Git keeps `.git/hooks` outside version control, so a hook copied there protects one clone. To include it in the repository, put it in a tracked directory and point `core.hooksPath` at it, once per clone:

```console
$ git config core.hooksPath script
```

A `prepare` script in `package.json` or a `make setup` target runs that for every contributor. The hook runners do the same thing under the hood, with husky, lefthook, or the pre-commit framework:

```yaml
# lefthook.yml
commit-msg:
  commands:
    vale:
      run: vale --path=COMMIT_EDITMSG < {1}
```

```yaml
# .pre-commit-config.yaml
- repo: local
  hooks:
    - id: vale-commit-msg
      name: vale
      entry: sh -c 'vale --path=COMMIT_EDITMSG < "$1"' --
      language: system
      stages: [commit-msg]
```

## CI and pull requests

Because the message comes in on stdin, the same command works on what was pushed, on each commit of a pull request, and on the request's description:

```sh
git log -1 --format=%B | vale --path=COMMIT_EDITMSG

for sha in $(git rev-list "$BASE..HEAD"); do
  git log -1 --format=%B "$sha" | vale --path=COMMIT_EDITMSG || status=1
done

gh pr view --json body -q .body | vale --path=COMMIT_EDITMSG
```

Nothing on the server side can run a hook for a client, so the check in CI is the backstop for a clone that skipped the setup.

## Output

The report can match the format of the tool a team used before. The package includes [templates](../topics/templates.md), picked with `--output` by name once synced:

```console
$ vale --output=commitlint.tmpl --path=COMMIT_EDITMSG < .git/COMMIT_EDITMSG
⧗   input: COMMIT_EDITMSG
✖   Start with a type, then a colon: 'fix: ...', 'feat(scope)!: ...'. 'Fixed' is not one. [Conventional.Type]
✖   A subject does not end with a period. [Commitlint.FullStop]
⚠   Write the subject as a command: 'Add', not 'Fixed'. [Commits.Imperative]

✖   found 2 problems, 1 warnings
ⓘ   Get help: https://www.conventionalcommits.org/en/v1.0.0/#specification
```

`gitlint.tmpl`, `committed.tmpl`, and `conform.tmpl` print those tools' forms, `github.tmpl` prints GitHub Actions annotations so an alert appears on the pull request at its line, and `hook.tmpl` is a short form for the terminal.

## Spelling and the rest of Vale

The body is read as Markdown, so `Vale.Spelling` skips an identifier in backticks and catches a misspelling in prose, and any style already in use on the docs runs on the log with one line of config:

```ini
[COMMIT_EDITMSG]
BasedOnStyles = Vale, Commits, Conventional, House
```

## Your own rules

A rule targets a part of the message by its scope, `subject`, `gap`, `body`, or `trailer`, and a rule that spans two parts is a [`conditional`](../checks/conditional.md) whose `in` names the second:

```yaml
extends: conditional
message: "A '!' in the subject needs a 'BREAKING CHANGE:' trailer."
level: error
scope: subject
first: '^\w+(?:\([^)]*\))?!:'
second: '^BREAKING CHANGE: '
in: trailer
```

To change a list in a rule, such as the types a project accepts, extend the rule in a style of your own with the pattern rewritten, and turn the original off. The [TextFSM guide](textfsm.md) is the View itself: how the template reads a message, and how the same approach reads a subtitle file or a transcript.
