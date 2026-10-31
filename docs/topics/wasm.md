# WebAssembly

{% hint style="info" %}
Requires Vale v3.26.0 or later.
{% endhint %}

Vale ships as a WebAssembly module for JavaScript hosts: a browser, a browser extension, or Node. It is the same engine as the CLI, built without CGo, so it lints Markdown, HTML, and plain text from memory with no server and no filesystem.

Each release carries `vale_<version>_wasm.tar.gz`, which holds two files:

| File           | What it is                                                                   |
| -------------- | ---------------------------------------------------------------------------- |
| `vale.wasm`    | The module.                                                                  |
| `wasm_exec.js` | Go's loader, from the toolchain that built the module. Use the one shipped. |

## [Loading](wasm.md#loading)

```html
<script src="wasm_exec.js"></script>
<script type="module">
  const go = new Go();
  const { instance } = await WebAssembly.instantiateStreaming(
    fetch("vale.wasm"),
    go.importObject,
  );
  go.run(instance); // installs the functions below on globalThis
</script>
```

`go.run` never resolves: the module stays resident, and its functions are called synchronously after it starts. Load it once, in a worker where one is available, since the first lint also loads the dictionary.

The module reads nothing from the host. `wasm_exec.js` answers every filesystem call with a stub, which is what the module expects; a Node host that installs its own `fs` global makes those calls asynchronous and the module stops. Leave `globalThis.fs` unset.

## [Functions](wasm.md#functions)

Every function returns an object. A failure is `{ error: string }`; the shapes below are the success case.

| Function                              | Returns               | What it does                                                                                                                                                      |
| ------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ValeLint(text, format, ini)`         | `{ result: string }`  | Lints `text` as a document named `input.<format>`, under the configuration in `ini`. `result` is the JSON the CLI prints with `--output=JSON`, keyed by that name. |
| `ValeSuggest(alertJSON, ini)`         | `{ suggestions: [] }` | Resolves one alert's [fix](actions.md): the replacement strings its action produces, or an empty list when it has none.                                           |
| `ValeLintBuilt(text, format, html, ini)` | `{ result: string }` | Lints `text` from `html`, the host's own conversion of it; see [Converted formats](wasm.md#converted-formats).                                                   |
| `ValeConverterOptions(format, ini)`   | object                | What to give the converter for `format` so its HTML is what Vale would have produced; see below.                                                                  |
| `ValeTransform(text, format, ini)`    | `{ result: string }`  | Applies the configuration's `BlockIgnores` and `TokenIgnores` to `text` and returns what is left to lint.                                                          |
| `ValeResolveConfig(ini)`              | `{ result: string }`  | Resolves the configuration without linting anything; see [Resolving a configuration](wasm.md#resolving-a-configuration).                                         |
| `ValeAddFile(path, contents)`         | `{ ok: true }`        | Writes one file into the in-memory filesystem. `contents` is a string or a `Uint8Array`.                                                                           |
| `ValeAddPackage(prefix, zipBytes)`    | `{ ok: true }`        | Extracts a ZIP archive under `prefix`, each entry at its own path.                                                                                                 |
| `ValeResetFS()`                       | `{ ok: true }`        | Empties the in-memory filesystem.                                                                                                                                 |
| `ValeListFS()`                        | `{ paths: [] }`       | Lists every path it holds.                                                                                                                                        |

`format` is an extension without the dot: `md`, `html`, `txt`. A `[formats]` association in the INI applies to it as it would to a file.

## [Assets](wasm.md#assets)

The configuration is a string, and everything it names is resolved against an in-memory filesystem the host fills. Paths are absolute under a single root, so a `StylesPath` of `/styles` reads rules from `/styles/<Style>/<Rule>.yml`, vocabularies from `/styles/config/vocabularies/`, and dictionaries from `/styles/config/dictionaries/`, as it would on disk.

```js
ValeAddFile("/styles/House/Hedging.yml", ruleYAML);
ValeAddPackage("/styles", await (await fetch(packageURL)).arrayBuffer());

const ini = `
StylesPath = /styles
MinAlertLevel = suggestion

[*]
BasedOnStyles = Vale, House, Microsoft
`;
const { result, error } = ValeLint(text, "md", ini);
```

The built-in `Vale` style and its `en_US` dictionary are inside the module, so a configuration with no `StylesPath` lints with them alone. There is no user-level configuration: the INI passed is the whole configuration.

## [Resolving a configuration](wasm.md#resolving-a-configuration)

`ValeResolveConfig` reports what a configuration comes to, for a host that shows one rather than runs it. `result` is JSON:

```json
{
  "stylesPath": "/styles",
  "global": { "minAlertLevel": "warning", "vocab": [], "basedOnStyles": [] },
  "sections": [
    {
      "glob": "*.md",
      "styles": ["House"],
      "rules": [
        { "ref": "House.Hedging", "state": "override", "level": "suggestion" },
        { "ref": "House.Passive", "state": "disabled" }
      ],
      "active": 0,
      "overridden": 1,
      "disabled": 1
    }
  ]
}
```

Each rule a section's styles bring is `active`, `disabled`, or `override` with the `level` it was set to. A rule that is switched off is still listed, read from the files on the `StylesPath`. A configuration that fails to load returns its message in `result`'s `error` field.

## [Formats](wasm.md#formats)

| Format                                | In the browser     | How                                                                                           |
| ------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------- |
| Markdown, MDX, MyST, Quarto, Org-mode | Yes                | Parsed in Go.                                                                                 |
| HTML                                  | Yes                |                                                                                               |
| Plain text                            | Yes                |                                                                                               |
| YAML, JSON, TOML                      | Yes                | Through a [View](views.md).                                                                   |
| AsciiDoc                              | With the host's converter | Asciidoctor.js; see below.                                                             |
| XML                                   | With the host's converter | The browser's `XSLTProcessor` and the section's `Transform` stylesheet.                |
| DITA, reStructuredText, Typst         | With the host's converter | When the host has one: DITA-OT and Docutils have no browser build; Typst does.          |
| Source code                           | No alerts          | Comments are found with tree-sitter, which is CGo. The file is accepted and produces nothing.  |

A document in an unsupported format is not an error: it lints as empty.

## [Converted formats](wasm.md#converted-formats)

Natively, Vale reads AsciiDoc, reStructuredText, XML, DITA, and Typst by running a converter and linting its HTML. A browser can't run those programs, but it can run some of their JavaScript builds, so the module takes the HTML from the host instead: `ValeLintBuilt` is `ValeLint` with the conversion step already done. Everything after it is the same, including where each alert lands in the source.

The HTML has to be what Vale would have produced, which means the same arguments. `ValeConverterOptions` returns them, so the host and the CLI stay in step as they change:

| Format | Returns                                                                                                                                        |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `adoc` | `attributes`, an array of Asciidoctor attributes including the `[asciidoctor]` section's; `standalone: false`; `safe: "secure"`; and `converter`, the source of a converter class to register, which renders a cross-reference the author gave no text as an empty link, as Vale's own does. |
| `rst`  | `args`, Docutils' command-line flags.                                                                                                          |
| `xml`  | `params`, the stylesheet parameters, as name-value pairs.                                                                                      |

With Asciidoctor.js 4:

```js
const asciidoctor = require("@asciidoctor/core");
const opts = ValeConverterOptions("adoc", ini);

const ValeHtml5Converter = new Function(`${opts.converter}; return ValeHtml5Converter;`)();
asciidoctor.ConverterFactory.register(new ValeHtml5Converter(asciidoctor), ["html5"]);

const html = await asciidoctor.convert(text, {
  standalone: opts.standalone,
  safe: opts.safe,
  attributes: opts.attributes,
});
const { result, error } = ValeLintBuilt(text, "adoc", String(html), ini);
```
