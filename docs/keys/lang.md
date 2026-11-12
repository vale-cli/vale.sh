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

A tag is matched without regard to case, and an underscore reads as a hyphen, so `de_DE` and `de-de` both mean `de-DE`. A tag with a region or script uses its base language's model: `de-AT` and `de-CH` read with the German model, `fr-CA` with the French one, and `en`, `en-US`, and `en-GB` are all English. The tags in the table below are the base languages Vale has models for.

The language chooses three things about how a file is read:

* **Sentences.** A supported language has a trained model that knows its abbreviations, so `Dr. Müller` doesn't end a sentence. Any other language is segmented by punctuation, which includes the East Asian terminators (`。！？`) that take no space.
* **Words.** French and Italian split elisions as their models were trained to, so `l'homme` is `l'` and `homme`; Chinese and Japanese are split where the script changes and at each punctuation mark.
* **Part-of-speech tags.** A supported language has a tagging model. Each emits the [universal tag set](https://universaldependencies.org/u/pos/), so a [`sequence`](../checks/sequence.md) rule written with `upos` reads the same in every language. The `tag` key, which takes Penn tags, applies to English alone.

The checks built for English behave as follows on a file in another language:

* **Spelling.** `Vale.Spelling`, and any [`spelling`](../checks/spelling.md) rule that names no dictionary of its own, reads the language's dictionary from `<StylesPath>/config/dictionaries/`: `de.dic` and `de.aff`, or Hunspell's `de_DE`. Vale doesn't carry those dictionaries; add the one you use. Without it, the rule skips the file and says so once, rather than reporting every word.
* **Capitalization.** `$sentence` keeps what the language capitalizes, so a German heading keeps its nouns: the words the language's tagger reads as nouns and names count as exceptions. `$title` is an English convention and skips the file, with a warning.
* **Readability.** Every formula counts English syllables, so the rule skips the file, with a warning.

A rule that matches text, such as `existence` or `substitution`, is language-neutral: word boundaries and `ignorecase` handle accented letters, though a case-insensitive match folds simple pairs only, so `Straße` doesn't match `STRASSE`.

`vale sync` reports what each model holds and from which prose release, and names the languages that have no dictionary.

## [Models](lang.md#models)

Three languages are supported, each with everything English has: a sentence model, a tokenizer, and a tagging model. English's are built into Vale; the others are downloaded. Running `vale sync` installs an archive for each language the configuration names into `<StylesPath>/config/models/<lang>/`, holding the tagging model (`tagger.bin`), the sentence model (`segmenter.json.gz` and `abbreviations.txt`), and a `model.json` describing both. The archives come from the release of [prose](https://github.com/jdkato/prose), Vale's NLP library, that the binary was built with.

| Language | Tag  |
| -------- | ---- |
| French   | `fr` |
| German   | `de` |
| Spanish  | `es` |

Each tagging model's training data, license, and accuracy, English's included, are listed in prose's [MODELS.md](https://github.com/jdkato/prose/blob/v3/tag/lang/MODELS.md). A language not in the table is still accepted. Where prose publishes a model for it, `vale sync` installs that; otherwise its text is segmented by punctuation, and a rule that needs its tags reports `no model for language "ja"` rather than tagging it as English.

`vale sync` reports a language it has no model for as a warning, so a configuration that names Japanese still syncs.

## [Offline use](lang.md#offline-use)

`VALE_MODELS_URL` points `vale sync` somewhere else: a URL serving the same `<lang>.zip` archives, or a directory holding them. A model archive is also an ordinary [package](packages.md), so a path to one in `Packages` installs it too.
