# DocSearch Scraper

`index.json` tells the DocSearch scraper how to turn <https://docs.vale.sh> into
the Algolia index that the site's search box queries.

## Running a crawl

The `.env` file should contain the following variables:

```sh
APPLICATION_ID=...
API_KEY=...
```

`API_KEY` is the **admin** key, not the search-only key in
`src/lib/components/DocSearch.svelte`. See the [Algolia dashboard][1] for both.

```console
$ docker run -it --env-file=.env -e "CONFIG=$(cat index.json | jq -r tostring)" algolia/docsearch-scraper
```

The scraper builds a temporary index and atomically moves it over
`docsearch_mock`, so a crawl replaces every record rather than merging into what
is already there. Re-crawl after documentation is restructured, not after every
page edit.

## How the selectors map onto GitBook

The documentation is a GitBook site, served fully rendered, so the scraper needs
no `js_render`. Three attributes carry the extraction:

| Field         | Source                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------- |
| `lvl0`        | the breadcrumb's last link — `Topics`, `Checks`, `Keys`, `Guides`, and so on                 |
| `lvl1`        | the page's `h1`, which GitBook renders exactly once, outside the body                        |
| `lvl2`–`lvl4` | headings inside `[data-content-ref-root]`, the wrapper GitBook puts around page body content |
| `text`        | paragraphs inside `[data-content-ref-root]`                                                  |

`lvl0` is `global`, so every record from a page inherits that page's section.
Pages without a breadcrumb fall back to `Documentation`.

Scoping to `[data-content-ref-root]` is what keeps the sidebar, the "On this
page" panel, and the footer out of the index — GitBook's own class names are
generated and unsafe to target. Markdown list items become `<p>` elements rather
than `<li>`, so the `text` selector already covers them.

`selectors_exclude` drops the `.hash` anchor that GitBook injects into every
heading, and the table of contents.

`stop_urls` keeps the crawler off GitBook's internal `/~gitbook/` routes and off
the raw `.md` and `llms.txt` variants that sit alongside each rendered page —
those yield no records, since the selectors target GitBook's HTML.

[1]: https://dashboard.algolia.com/users/sign_in
