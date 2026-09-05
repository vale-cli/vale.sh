# MinAlertLevel

Learn about how to set the minimum alert level for Vale.

```ini
StylesPath = styles
MinAlertLevel = suggestion

[*.md]
BasedOnStyles = Vale
```

The `MinAlertLevel` key allows you to set the minimum alert level that Vale will report. The supported levels are `suggestion` (default), `warning`, and `error`.

`error`-level alerts will result in a [non-zero exit code](../topics/cli.md#return-codes), while `warning`- and `suggestion`-level alerts will not. This is useful for controlling which rules will fail CI builds.

## [Overriding](minalertlevel.md#overriding)

The `MinAlertLevel` key can be overridden from the command line using the `--minAlertLevel` flag:

```bash
$ vale --minAlertLevel=warning README.md
```

This allows you to, for example, show all alerts in your editor while only running `error`-level alerts in CI.

## [Editing](minalertlevel.md#editing)

You can edit the severity of a rule by modifying its `level` in your local `.vale.ini` file:

```ini
[*.md]
BasedOnStyles = Vale

Vale.Spelling = warning
```
