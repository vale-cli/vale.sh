# replace

Learn how to create static suggestions for your rules.

```go
func replace(match string) []string
```

`replace` returns an array of user-provided replacements.

```yaml
action:
  name: replace
  params:
    - option1
    - option2
    ...
```

Rules that extend `substitution` or `capitalization` will automatically populate the `params` array, so you can simply provide the `name`:

```yaml
action:
  name: replace
```
