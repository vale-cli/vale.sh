# Lang

Learn how Vale reads a file written in a language other than English.

{% hint style="info" %}
Requires Vale v3.27.0 or later.
{% endhint %}

```ini
StylesPath = styles

# Every file, unless a section says otherwise.
Lang = de

[docs/fr/*.md]
Lang = fr
```

`Lang` names the language a file is written in, as a [BCP 47](https://www.rfc-editor.org/info/bcp47) tag: `de`, `pt-BR`, `zh-Hant`. A section's `Lang` applies to the files it matches, and the top-level one to the rest. Without the key, every file is English.

The language chooses three things about how a file is read:

* **Sentences.** A supported language has a trained model that knows its abbreviations, so `Dr. Müller` doesn't end a sentence. Any other language is segmented by punctuation, which includes the East Asian terminators (`。！？`) that take no space.
* **Words.** French, Italian, and Catalan split elisions as their models were trained to, so `l'homme` is `l'` and `homme`; Chinese and Japanese are split where the script changes and at each punctuation mark.
* **Part-of-speech tags.** A supported language has a tagging model. Each emits the [universal tag set](https://universaldependencies.org/u/pos/), so a [`sequence`](../checks/sequence.md) rule written with `upos` reads the same in every language. The `tag` key, which takes Penn tags, applies to English alone.

`Lang` doesn't change spelling: `Vale.Spelling` reads the dictionary the [`spelling`](../checks/spelling.md) check names.

## [Models](lang.md#models)

Eleven languages are supported, each with everything English has: a sentence model, a tokenizer, and a tagging model. English's are built into Vale; the others are downloaded. Running `vale sync` installs an archive for each language the configuration names into `<StylesPath>/config/models/<lang>/`, holding the tagging model (`tagger.bin`), the sentence model (`segmenter.json.gz` and `abbreviations.txt`), and a `model.json` describing both. The archives come from the release of [prose](https://github.com/jdkato/prose), Vale's NLP library, that the binary was built with.

| Language         | Tag  |
| ---------------- | ---- |
| Danish           | `da` |
| Dutch            | `nl` |
| Finnish          | `fi` |
| French           | `fr` |
| German           | `de` |
| Italian          | `it` |
| Norwegian Bokmål | `nb` |
| Portuguese       | `pt` |
| Spanish          | `es` |
| Swedish          | `sv` |
| Turkish          | `tr` |

Each tagging model's training data, license, and accuracy, English's included, are listed in prose's [MODELS.md](https://github.com/jdkato/prose/blob/v3/tag/lang/MODELS.md). A language not in the table is still accepted: its text is segmented by punctuation, and a rule that needs its tags reports `no model for language "ja"` rather than tagging it as English.

`vale sync` reports a language it has no model for as a warning, so a configuration that names Japanese still syncs.

## [Offline use](lang.md#offline-use)

`VALE_MODELS_URL` points `vale sync` somewhere else: a URL serving the same `<lang>.zip` archives, or a directory holding them. A model archive is also an ordinary [package](packages.md), so a path to one in `Packages` installs it too.
