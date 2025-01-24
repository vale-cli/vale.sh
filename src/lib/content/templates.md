---
title: Templates
description: Learn about Vale's output templates.
---

<script lang="ts">
  import CLIOptions from "$lib/components/docs/CLIOptions.svelte";
  import Env from "$lib/components/docs/Env.svelte";
  import Errors from "$lib/components/docs/Errors.svelte";
</script>

By default, Vale includes support for three output styles: `line`, `JSON`, and
`CLI` (the default). You can specify which style to use via the `--output`
flag:

```bash
$ vale --output=line README.md
```

In addition to the three provided output styles, Vale also supports _custom_
output styles powered by Go's [`text/template`][1] package.

To use a custom format, pass the path to a template file through the `--output`
option:

```bash
$ vale --output='template.tmpl' somefile.md
```

Where `template.tmpl` is a file that contains a valid Go template stored in the
`<StylesPath>/config/templates` directory.

## Templating

Templates have access to the following data structures:

```go
type ProcessedFile struct {
    Alerts []core.Alert
    Path   string
}

type Data struct {
    Files       []ProcessedFile
    LintedTotal int
}
```

Where `core.Alert` has the same information as Vale's `--output=JSON` object.

Templates can also access the following functions:

| Name          | Argument(s) | Description                                                                                                        |
| ------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `red`         | `string`    | Returns the given `string` with an ANSI-formatted red foreground color.                                            |
| `blue`        | `string`    | Returns the given `string` with an ANSI-formatted blue foreground color.                                           |
| `yellow`      | `string`    | Returns the given `string` with an ANSI-formatted yellow foreground color.                                         |
| `underline`   | `string`    | Returns the given `string` with an ANSI-formatted underline.                                                       |
| `newTable`    | `bool`      | Creates a new [`tablewriter`][2] struct. `newTable` accepts one boolean value representing [`SetAutoWrapText`][2]. |
| `addRow`      | `[]string`  | Appends the given row to a table.                                                                                  |
| `renderTable` | `Table`     | Prints the table-formatted output to `stdout`.                                                                     |
| `jsonEscape`  | `string`    | Ensure the given `STRING` is valid JSON.                                                                           |

See the [Sprig Function Documentation][4] for the full list.

## Examples

The following example re-implements Vale's default output style using a
template.

```go
{{- /* Keep track of our various counts */ -}}

{{- $e := 0 -}}
{{- $w := 0 -}}
{{- $s := 0 -}}
{{- $f := 0 -}}

{{- /* Range over the linted files */ -}}

{{- range .Files}}
{{$table := newTable true}}

{{- $f = add1 $f -}}
{{- .Path | underline | indent 1 -}}

{{- /* Range over the file's alerts */ -}}

{{- range .Alerts -}}

{{- $error := "" -}}
{{- if eq .Severity "error" -}}
    {{- $error = .Severity | red -}}
    {{- $e = add1 $e  -}}
{{- else if eq .Severity "warning" -}}
    {{- $error = .Severity | yellow -}}
    {{- $w = add1 $w -}}
{{- else -}}
    {{- $error = .Severity | blue -}}
    {{- $s = add1 $s -}}
{{- end}}

{{- $loc := printf "%d:%d" .Line (index .Span 0) -}}
{{- $row := list $loc $error .Message .Check | toStrings -}}

{{- $table = addRow $table $row -}}
{{end -}}

{{- $table = renderTable $table -}}
{{end}}
{{- $e}} {{"errors" | red}}, {{$w}} {{"warnings" | yellow}} and {{$s}} {{"suggestions" | blue}} in {{$f}} {{$f | int | plural "file" "files"}}.
```

[1]: https://golang.org/pkg/text/template/
[2]: https://github.com/olekukonko/tablewriter#ascii-table-writer
[3]: https://godoc.org/github.com/olekukonko/tablewriter#Table.SetAutoWrapText
[4]: http://masterminds.github.io/sprig/
