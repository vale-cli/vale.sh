# vale.sh [![Netlify Status](https://api.netlify.com/api/v1/badges/6b41c018-35db-4ab5-ba7f-ba23bec59fc3/deploy-status)](https://app.netlify.com/sites/eclectic-semifreddo-be083c/deploys)

Website and documentation for all things Vale.

## Contributing

### Adding your team to the home page

If your team runs Vale, add an entry to [`src/lib/data/adopters.json`][adopters].
Every entry needs a **public link** that shows Vale in use — a `.vale.ini`, a
style package, or a write-up. Entries without one get removed.

```json
{
	"name": "Elastic",
	"category": "Data & observability",
	"context": "Ships an Elastic style guide implemented as Vale rules.",
	"url": "https://www.elastic.co/docs/contribute-docs/vale-linter",
	"icon": "elastic"
}
```

| Field      | Required | Notes                                                          |
| ---------- | -------- | -------------------------------------------------------------- |
| `name`     | yes      | How your team is normally written.                             |
| `category` | yes      | One of the six categories listed below.                        |
| `context`  | yes      | One sentence, ending in a period, on what Vale does for you.   |
| `url`      | yes      | `https://` link to the public proof.                           |
| `icon`     | no       | A [Simple Icons][simple-icons] slug, e.g. `elastic`, `gitlab`. |
| `github`   | no       | GitHub org login, e.g. `aiven`. Used when there's no icon.     |

Categories: `Cloud & infrastructure`, `Community & services`,
`Data & observability`, `Developer tools`, `Enterprise`, `Open source`.

Set **either** `icon` or `github`, not both. Simple Icons doesn't carry every
brand — Microsoft and AWS, for example — so `github` falls back to your org's
avatar. With neither, the card shows a two-letter monogram.

**Don't commit images.** The avatar PNGs under `static/users/avatars` are
fetched from the `github` field by a maintainer running:

```bash
$ node script/adopters.mjs --sync
```

### Adding a post, talk, or video

Add an entry to [`src/lib/data/press.json`][press]:

```json
{
	"type": "article",
	"title": "Prose linting with Vale",
	"outlet": "Meilisearch",
	"author": "Maryam Sulemani",
	"year": 2023,
	"url": "https://blog.meilisearch.com/prose-linting-with-vale/"
}
```

| Field      | Required | Notes                                                         |
| ---------- | -------- | ------------------------------------------------------------- |
| `type`     | yes      | `book`, `paper`, `talk`, `article`, `video`, or `newsletter`. |
| `title`    | yes      | The title as published.                                       |
| `outlet`   | yes      | Publication, company, or conference.                          |
| `url`      | yes      | `https://` link.                                              |
| `author`   | no       | Byline, if there is one.                                      |
| `year`     | no       | Integer.                                                      |
| `subtitle` | no       | Books only.                                                   |

A link can appear **once** on the page. If your company blog post is already an
adopter's `url`, don't add it here too — the validator rejects it.

### Adding an upcoming event

Add an entry to [`src/lib/data/events.json`][events]:

```json
{
	"title": "Social Coworking and Office Hours: Vale and Text Linting",
	"host": "rOpenSci",
	"date": "2026-08-04",
	"time": "01:00–03:00 UTC",
	"location": "Online",
	"url": "https://ropensci.org/events/coworking-2026-08/"
}
```

| Field      | Required | Notes                                           |
| ---------- | -------- | ----------------------------------------------- |
| `title`    | yes      | The event or session title.                     |
| `host`     | yes      | Organizer, e.g. `rOpenSci`.                     |
| `date`     | yes      | Start date, `YYYY-MM-DD`.                       |
| `location` | yes      | `Online`, or a city.                            |
| `url`      | yes      | `https://` link to register or read more.       |
| `endDate`  | no       | `YYYY-MM-DD`, for events spanning several days. |
| `time`     | no       | Free text, e.g. `01:00–03:00 UTC`.              |

**Finished events don't need removing.** The section filters by date at both
build and page load, so an event disappears — along with its nav link, and the
whole section once nothing is left — as soon as it's over. The validator prints
a note for entries that have already passed, so they can be cleared out later.

### Checking your change

```bash
$ node script/adopters.mjs
```

This validates all three files: required fields, known categories and types,
`https://` URLs, unique names and links, real Simple Icons slugs, and well-formed
dates. CI runs the same command on every push.

### Docs

The documentation is written in Markdown and is located in the
`src/lib/content` directory. To contribute, simply edit the appropriate file
and submit a pull request.

### Packages & Configurations

If you have a Vale package or configuration that you'd like to share, please
submit a pull request to the [`packages`][packages] repository.

## Developing

To start a development server:

```bash
$ pnpm install
$ pnpm run dev -- --open
```

Home page numbers — downloads, stars, backers — are read from the GitHub,
Docker Hub, PyPI, conda-forge, Homebrew, Chocolatey, and Open Collective APIs at
**build time** (see `src/lib/server/stats.ts`). Each lookup falls back to a
checked-in value, so a failed request never breaks the build. Set `GITHUB_TOKEN`
in the build environment to keep the GitHub calls off the 60/hr per-IP limit.

[adopters]: src/lib/data/adopters.json
[press]: src/lib/data/press.json
[events]: src/lib/data/events.json
[packages]: https://github.com/vale-cli/packages
[simple-icons]: https://simpleicons.org
