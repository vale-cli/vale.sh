# convert

Learn how to change the case of a match.

```go
func convert(match string) string
```

`convert` suggests the matched text in another case. Its one parameter names the target:

| Name     | Result                                                 |
| -------- | ------------------------------------------------------ |
| `simple` | Lower case, with the words separated by single spaces. |

```yaml
extends: existence
message: "'%s' should be '%s'."
action:
  name: convert
  params:
    - simple
tokens:
  - '[A-Z]{2,}(?: [A-Z]{2,})+'
```

The same conversion is available as the `simple` step of [`edit`](edit.md#casing), beside the other cases, which is where a fix that needs more than one step belongs.
