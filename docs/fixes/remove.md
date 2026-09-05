# remove

Learn how to delete a match.

```go
func remove(match string)
```

`remove` suggests an empty string in place of the matched text. It takes no parameters.

```yaml
extends: existence
message: "Don't use an ellipsis in documentation."
nonword: true
action:
  name: remove
tokens:
  - '...'
```

Applied to a whole word from an editor, the deletion takes one neighboring space with it, so removing `very` from `a very good one` leaves `a good one` rather than two spaces.
