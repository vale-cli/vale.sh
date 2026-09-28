---
title: 'How GOV.UK turned its style guide into a build step'
description: "The UK government's plain-English rules, packaged as a Vale style, run by ten GOV.UK One Login repositories, and wired into an Android app's Gradle build so the source comments are checked too."
date: '2026-09-28'
draft: false
tags: ['case-studies', 'adopters']
brand: 'GOV.UK'
figure: '10 repositories'
figureLabel: 'run the GOV.UK package, one of them from an Android build'
image: '/blog/brand/case-study-gov-uk.png'
imageAlt: "The GOV.UK crest over the public sector's orbit pattern."
---

This is the second post in a series that explains one team's Vale setup end to end: what it lints, the rules it wrote, how it runs, and what is worth copying. Every file quoted is public, and each section links to it.

GOV.UK is known for plain English, and its style guide's "words to avoid" list is the best-known part of it. The rule against "deliver" is on there, with its explanation: pizzas, post, and services are delivered, not improvements. The Government Digital Service turned that list, and the rest of its technical style guide, into a Vale style that any government team can point at. Then one team, GOV.UK One Login, put it somewhere nobody expects a prose linter: the Gradle build of its Android app.

## The style guide, as rules

The package is [tech-docs-linter](https://github.com/alphagov/tech-docs-linter), fifteen rules that its README calls "rules based on the GOV.UK Technical Style guide". The two that carry the guide's voice are the words-to-avoid rules, and the voice is intact because the rule's replacement column is the guide's own text. An error reads like the guide:

```yaml
extends: substitution
message: "From style guide words to avoid: \" '%s' instead of '%s'.\""
level: error
ignorecase: true
scope: text
swap:
  deliver: use ‘make’, ‘create’, ‘provide’ or a more specific term (pizzas, post and services are delivered - not abstract concepts like improvements)
  drive: use ‘create’, ‘cause’ or ‘encourage’ instead (you can only drive vehicles, not schemes or people)
  '(going | moving forward)': use ‘from now on’ or ‘in the future’ (it’s unlikely we are giving travel directions)
  utilise: use ‘use’
  in order to: usually not needed - do not use it.  For technical documentation use ‘so you can’
  '(easy | easily)':  this can demoralise users if they do not find it easy
```

The guide has a second list, words to avoid unless a condition holds, and that list is its own rule at the warning level, because the writer has to decide. The conditions are kept too: "commit" is fine "unless you are talking about version control", "tackle" unless it is fishing tackle or rugby, "drive out" unless it is cattle.

```yaml
extends: substitution
message: "The style guide suggests: '%s' instead of '%s'."
level: warning
swap:
  commit: use ‘plan to [fulfill your commitment]’ unless you are talking about version control
  key: usually not needed but can use ‘important’ or ‘significant’ (unless it unlocks something)
  robust: depending on context, use ‘well thought out’ or ‘comprehensive’ (unless talking about a sturdy object)
  tackle: use ‘stop’, ‘solve’ or ‘deal with’ (unless talking about fishing tackle or a physical tackle, like in rugby)
```

Two more rules are about government writing in particular. Acronyms must be defined the first time they appear, as an error, and the rule is a conditional: the first pattern finds a three-to-five-letter acronym, the second finds it spelled out with the acronym in brackets, and the finding fires when the first appears without the second. The exceptions are the acronyms every reader of a government document already knows.

```yaml
extends: conditional
message: "'%s' must be defined in the first instance"
level: error
first: '(?<!/)\b([A-Z]{3,5})\b(?!/\b)(?!-\d)'
second: '(?:\b[A-Za-z-]+ )+\(([A-Z]{3,5})\)'
exceptions:
  - DSIT
  - GDS
  - HMRC
  - DVLA
  - NHS
```

And the service's own name is a rule. The sign-in service is "One Login", two words, and the misspellings rule says so with a replacement action.

```yaml
extends: substitution
message: "The GOV.UK style guide recommends using '%s' instead of '%s'"
level: error
action:
  name: replace
swap:
  OneLogin: One Login
```

The rest are structure: headings deeper than H4 are an error, brackets in headings are an error, a heading with no content under it is a warning, and a sentence over twenty-five words gets the guide's advice to split it.

Sources: [words-to-avoid.yml](https://github.com/alphagov/tech-docs-linter/blob/HEAD/styles/tech-writing-style-guide/words-to-avoid.yml), [words-to-avoid-unless.yml](https://github.com/alphagov/tech-docs-linter/blob/HEAD/styles/tech-writing-style-guide/words-to-avoid-unless.yml), [acronyms.yml](https://github.com/alphagov/tech-docs-linter/blob/HEAD/styles/tech-writing-style-guide/acronyms.yml), [common-misspellings.yml](https://github.com/alphagov/tech-docs-linter/blob/HEAD/styles/tech-writing-style-guide/common-misspellings.yml).

## Shipped as a package

Teams do not copy the rules. The repository publishes them as a release, and a team's config names the release. The GOV.UK Tech Docs Template, the gem government teams use to publish technical documentation, points at the latest one:

```ini
StylesPath = styles
Packages = https://github.com/alphagov/tech-docs-linter/releases/latest/download/tech-writing-style-guide.zip
SkippedScopes = pre, code, script, style
MinAlertLevel = suggestion

[*.{md,org,txt,erb,html}]
BasedOnStyles = tech-writing-style-guide
TokenIgnores = `[^`]+`
```

The section header is worth a second look: the template lints Markdown, Org, plain text, ERB templates, and HTML with one style, because a docs site built from a Ruby gem has prose in all five.

One Login's own technical docs pin a specific release rather than the latest, and raise the floor to errors only:

```ini
Packages = https://github.com/alphagov/tech-docs-linter/releases/download/v0.1.0/tech-writing-style-guide.zip
MinAlertLevel = error
```

Ten One Login repositories carry a Vale config today: the technical docs, the Android app, its shared libraries for UI, networking, authentication, logging, and secure storage, the credential-sharing work, and the pipeline repository that the rest inherit from.

Sources: [tech-docs-gem/.vale.ini](https://github.com/alphagov/tech-docs-gem/blob/HEAD/.vale.ini), [govuk-one-login/tech-docs/.vale.ini](https://github.com/govuk-one-login/tech-docs/blob/HEAD/.vale.ini).

## In the Android build

The part to read twice. One Login's Android repositories share a pipeline, and its build logic registers two Gradle tasks: `valeSync`, which downloads the packages, and `vale`, which lints the repository. Both sit in Gradle's "verification" group beside the tests, `vale` depends on `valeSync`, and the standard `check` task is made to depend on `vale`. Running the app's checks runs Vale, with no separate CI step to forget.

```kotlin
val vale =
    rootProject.tasks.register("vale", Exec::class.java) {
        description = "Lint the project's markdown and text files with Vale."
        group = "verification"
        dependsOn(valeSync)
        args(
            ".",
            "--no-wrap",
            "--config=${project.valeConfigFile()}",
            "--glob=!**/{build,.gradle,mobile-android-pipelines}/**",
        )
    }

val check =
    rootProject.tasks
        .maybeCreate("check")
        .apply { dependsOn(vale) }
```

The config the task points at does something the docs template does not: it tells Vale to read Kotlin and Gradle files as Java, which puts them through the code parser, so the comments in the app's source are linted against the same style as its Markdown. Google's style is layered on for the general rules, with three of its punctuation checks switched off for code comments.

```ini
Packages = Google, \
https://github.com/alphagov/tech-docs-linter/releases/latest/download/tech-writing-style-guide.zip

# Treat unsupported file extensions as java
[formats]
kt = java
kts = java
gradle = java

[*.md]
BasedOnStyles = Vale, Google, tech-writing-style-guide

[*.java]
BasedOnStyles = Vale, Google, tech-writing-style-guide
Google.Spacing = NO
Google.Parens = NO
Google.Quotes = NO
```

The vocabulary reads like an Android team's: `Coroutine`, `Detekt`, `ktlint`, `Zsh`, and the acronyms of the identity programme. The tasks have unit tests of their own, one for the plugin and one for the extension that resolves the Vale binary.

Sources: [`vale-config.gradle.kts`](https://github.com/govuk-one-login/mobile-android-pipelines/blob/HEAD/buildLogic/plugins/src/main/kotlin/uk/gov/pipelines/vale-config.gradle.kts), [the pipeline's .vale.ini](https://github.com/govuk-one-login/mobile-android-pipelines/blob/HEAD/buildLogic/config/vale/.vale.ini), [ValeConfigPluginTest.kt](https://github.com/govuk-one-login/mobile-android-pipelines/blob/HEAD/buildLogic/plugins/src/test/kotlin/uk/gov/pipelines/ValeConfigPluginTest.kt).

## And the infrastructure docs, on a different base

Not every GOV.UK team starts from the same package. The platform team's infrastructure docs run Red Hat's style with a GOV.UK style over it, and its config is a list of what it turned off and why. Contractions are off because "GOV.UK style is to not use contractions", with the link. The rule against linking to GitHub is off because "We use GitHub." One rule is off with a date and a version, because that release broke it. The file is a record of decisions, which is what a config should be.

```ini
Packages = RedHat
Vocab = PlatformEngineering

[*.md]
BasedOnStyles = Vale, RedHat, GOVUK, PlatformEngineering
RedHat.Contractions = OFF # GOV.UK style is to not use contractions
RedHat.GitLinks = OFF # RedHat style says not to link to GitHub. We use GitHub.
RedHat.Spelling = OFF # We want to rely on our own spelling rules
```

Source: [govuk-infrastructure/.vale.ini](https://github.com/alphagov/govuk-infrastructure/blob/HEAD/.vale.ini).

## Key points

- **Keep the guide's voice in the rule.** The replacement column is where the explanation goes, and a message that reads like the style guide gets followed.
- **Split "avoid" from "avoid unless".** One is an error; the other is a warning with the condition in the message, because the writer decides.
- **Ship rules as a release**, and let teams choose between `latest` and a pinned version.
- **Put the linter in the build tool the team already runs.** A `check` task that depends on `vale` cannot be skipped by a CI change.
- **Lint the comments.** Mapping source files to the code parser puts the same standard on the prose inside the code.

GOV.UK and GOV.UK One Login are both on the [adopters page](/adopters) under Academia & public sector.
