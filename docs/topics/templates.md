# Templates

Learn about Vale's output templates.

By default, Vale includes support for three output styles: `line`, `JSON`, and `CLI` (the default). You can specify which style to use via the `--output` flag:

```bash
$ vale --output=line README.md
```

In addition to the three provided output styles, Vale also supports _custom_ output styles powered by Go’s [`text/template`](https://golang.org/pkg/text/template/) package.

To use a custom format, pass the path to a template file through the `--output` option:

```bash
$ vale --output='template.tmpl' somefile.md
```

Where `template.tmpl` is a file that contains a valid Go template stored in the `<StylesPath>/config/templates` directory.

## [Templating](templates.md#templating)

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

Where `core.Alert` has the same information as Vale’s `--output=JSON` object.

Templates can also access the following functions:

| Name          | Argument(s) | Description                                                                                                                                                                                                                                           |
| ------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `red`         | `string`    | Returns the given `string` with an ANSI-formatted red foreground color.                                                                                                                                                                               |
| `blue`        | `string`    | Returns the given `string` with an ANSI-formatted blue foreground color.                                                                                                                                                                              |
| `yellow`      | `string`    | Returns the given `string` with an ANSI-formatted yellow foreground color.                                                                                                                                                                            |
| `underline`   | `string`    | Returns the given `string` with an ANSI-formatted underline.                                                                                                                                                                                          |
| `newTable`    | `bool`      | Creates a new [`tablewriter`](https://github.com/olekukonko/tablewriter#ascii-table-writer) struct. `newTable` accepts one boolean value representing [`SetAutoWrapText`](https://godoc.org/github.com/olekukonko/tablewriter#Table.SetAutoWrapText). |
| `addRow`      | `[]string`  | Appends the given row to a table.                                                                                                                                                                                                                     |
| `renderTable` | `Table`     | Prints the table-formatted output to `stdout`.                                                                                                                                                                                                        |
| `jsonEscape`  | `string`    | Ensure the given `STRING` is valid JSON.                                                                                                                                                                                                              |

See the [Sprig Function Documentation](http://masterminds.github.io/sprig/) for the full list.

## [Examples](templates.md#examples)

### [Customizing the default output](templates.md#customizing-the-default-output)

The following example re-implements Vale’s default output style using a template.

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

### [Creating a RDJSONL template](templates.md#creating-a-rdjsonl-template)

The following example converts Vale’s output to [RDJSONL](https://github.com/reviewdog/reviewdog?tab=readme-ov-file#reviewdog-diagnostic-format-rdformat), which you can then pass to [Reviewdog](https://github.com/reviewdog/reviewdog) to display on pull request. This can be useful when the [Vale action](https://github.com/vale-cli/vale-action) is not suitable for your workflow.

```go
{{- /* Range over the linted files */ -}}

{{- range .Files}}

{{- $path := .Path -}}

{{- /* Range over the file's alerts */ -}}

{{- range .Alerts -}}

{{- $error := "" -}}
{{- if eq .Severity "error" -}}
    {{- $error = "ERROR" -}}
{{- else if eq .Severity "warning" -}}
    {{- $error = "WARNING" -}}
{{- else -}}
    {{- $error = "INFO" -}}
{{- end}}

{{- /* Variables setup */ -}}

{{- $line := printf "%d" .Line -}}
{{- $start := index .Span 0 -}}
{{- $end := add (index .Span 1) 1 -}}
{{- $check := printf "%s" .Check -}}
{{- $message := printf "%s" .Message -}}

{{- /* Output */ -}}

{"message": "{{ $message | jsonEscape }}", "location": {"path": "{{ $path }}", "range": {"start": {"line": {{ $line }}, "column": {{ $start }}}, "end": {"line": {{ $line }}, "column": {{ $end }}}}}, "severity": "{{ $error }}", "code": {"value": "{{ $check | jsonEscape }}"{{ if .Link }}, "url": "{{ .Link | jsonEscape }}"{{ end }}}}
{{end -}}
{{end -}}
```

Two things are worth knowing when adapting this. Reviewdog reads a range, so giving it the end of the span -- `Span` is inclusive, and Reviewdog's end is not -- is what underlines the match rather than pointing at its first character. And Reviewdog counts columns in UTF-8 bytes where Vale counts characters, so the two agree only until a line picks up its first multi-byte character; converting between them needs the source line, which a template can't read.

### [Creating a SARIF template](templates.md#creating-a-sarif-template)

The following example converts Vale's output to [SARIF](https://sarifweb.azurewebsites.net/), the format that [GitHub code scanning](https://docs.github.com/en/code-security/code-scanning/integrating-with-code-scanning/uploading-a-sarif-file-to-github), GitLab, and Azure DevOps read. Unlike a pull request comment, an alert reported this way persists: it has a history, and someone can dismiss it with a reason.

```bash
$ vale --output=sarif.tmpl . > vale.sarif
```

In a GitHub workflow, hand the file to `upload-sarif`:

```yaml
- name: Upload to code scanning
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: vale.sarif
```

Two details make the conversion straightforward. SARIF measures columns in characters, as Vale's `Span` does, so the positions carry over unchanged. And SARIF asks for each rule to be described once, which [`dict`](http://masterminds.github.io/sprig/dicts.html) and `set` collect in a pass over the alerts before any output.

```go
{{- /* Collect the rules that fired, so that each is described once. */ -}}
{{- $rules := dict -}}
{{- range .Files -}}
{{- range .Alerts -}}
{{- $_ := set $rules .Check (dict "link" .Link "text" .Description) -}}
{{- end -}}
{{- end -}}
{
  "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
  "version": "2.1.0",
  "runs": [
    {
      "tool": {
        "driver": {
          "name": "Vale",
          "informationUri": "https://vale.sh",
          "rules": [
{{- $first := true -}}
{{- range $id, $rule := $rules }}
{{ if not $first }},{{ end }}            {
              "id": "{{ $id | jsonEscape }}",
              "shortDescription": {"text": "{{ if $rule.text }}{{ $rule.text | jsonEscape }}{{ else }}{{ $id | jsonEscape }}{{ end }}"}
              {{- if $rule.link }},
              "helpUri": "{{ $rule.link | jsonEscape }}"
              {{- end }}
            }
{{- $first = false -}}
{{- end }}
          ]
        }
      },
      "results": [
{{- $first = true -}}
{{- range .Files -}}
{{- $path := .Path -}}
{{- range .Alerts }}
{{ if not $first }},{{ end }}        {
          "ruleId": "{{ .Check | jsonEscape }}",
          "level": "{{ if eq .Severity "error" }}error{{ else if eq .Severity "warning" }}warning{{ else }}note{{ end }}",
          "message": {"text": "{{ .Message | jsonEscape }}"},
          "locations": [
            {
              "physicalLocation": {
                "artifactLocation": {"uri": "{{ $path | jsonEscape }}"},
                "region": {
                  "startLine": {{ .Line }},
                  "startColumn": {{ index .Span 0 }},
                  "endColumn": {{ add (index .Span 1) 1 }},
                  "snippet": {"text": "{{ .Match | jsonEscape }}"}
                }
              }
            }
          ]
        }
{{- $first = false -}}
{{- end -}}
{{- end }}
      ]
    }
  ]
}
```
