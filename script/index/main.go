// Publishes the search index the /library page queries, from this repository's
// own media.json.
//
// media.json is the single source of truth for what appears in the library.
// It used to come from errata-ai/library: that repo held the entry list, built
// a Bleve index from it, and published INDEX.zip as a release asset, which the
// Makefile downloaded. Adding one link therefore meant a pull request there, a
// merge, a release, and a rebuild here -- so in practice entries were added
// straight to media.json instead, and the two lists drifted.
//
// The index now lives in Algolia, alongside the one DocSearch builds for
// docs.vale.sh, rather than in a Bleve directory embedded in a Netlify
// function. That buys typo tolerance, highlighting and ranking the embedded
// index did not have, and it takes a 768 KB index out of the function bundle.
//
// Records carry the whole article. The plan this project is on allows 100 KB
// per record, and the longest of these runs to about 17 KB, so nothing is
// truncated or split across records.
//
// Without ALGOLIA_ADMIN_KEY in the environment this scrapes and reports what
// it would send, then stops -- a local build or a fork's CI should not need a
// credential to succeed.
package main

import (
	"bytes"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"html"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"

	goose "github.com/advancedlogic/GoOse"
)

const (
	source = "src/lib/data/media.json"

	appID = "2Y8OU39U1X"
	index = "library"

	// Algolia rejects anything larger; see the note above on why the whole
	// article still fits comfortably.
	maxRecord = 100_000
)

// Entry is the subset of a media.json record the index needs. The file carries
// description, image and site as well, for the cards.
type Entry struct {
	Title       string `json:"title"`
	URL         string `json:"url"`
	Author      string `json:"author"`
	Year        int    `json:"year"`
	Type        string `json:"type"`
	Description string `json:"description"`
}

// Record is one Algolia object. objectID is the URL, so re-running this
// replaces an entry rather than duplicating it.
type Record struct {
	ObjectID    string `json:"objectID"`
	Title       string `json:"title"`
	URL         string `json:"url"`
	Author      string `json:"author"`
	Year        int    `json:"year"`
	Type        string `json:"type"`
	Description string `json:"description"`
	Text        string `json:"text"`
}

func read(path string) ([]Entry, error) {
	var entries []Entry

	src, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return entries, json.Unmarshal(src, &entries)
}

// Medium answers 403 to anything that isn't a browser, so the article reader
// cannot see these posts at all. Its RSS feeds are served without that block
// and carry the whole post in `content:encoded`, so a Medium URL falls back to
// its publication's feed.
//
// A feed holds only the ten most recent posts, so an older one is still out of
// reach; that entry keeps its title and description, as any unreadable URL
// does.
var feeds = map[string]map[string]string{}

var tags = regexp.MustCompile(`<[^>]+>`)

// mediumFeed returns the feed a Medium URL's post would appear in, or "" when
// the URL is not a Medium post. The first path segment names the publication
// (`/valelint/...`) or the author (`/@someone/...`).
func mediumFeed(raw string) string {
	parsed, err := url.Parse(raw)
	if err != nil || !strings.HasSuffix(parsed.Host, "medium.com") {
		return ""
	}

	parts := strings.Split(strings.Trim(parsed.Path, "/"), "/")
	if len(parts) < 2 {
		return ""
	}
	return "https://medium.com/feed/" + parts[0]
}

// feedText returns the plain text of the post at `link`, reading its feed the
// first time that feed is needed and remembering what it held.
func feedText(link string) string {
	feed := mediumFeed(link)
	if feed == "" {
		return ""
	}

	posts, ok := feeds[feed]
	if !ok {
		posts = readFeed(feed)
		feeds[feed] = posts
	}
	return posts[canonical(link)]
}

// canonical drops the query Medium appends to its own feed links
// (`?source=rss----...`), so a feed entry and a media.json URL compare equal.
func canonical(link string) string {
	if parsed, err := url.Parse(link); err == nil {
		parsed.RawQuery = ""
		parsed.Fragment = ""
		return strings.TrimSuffix(parsed.String(), "/")
	}
	return link
}

func readFeed(feed string) map[string]string {
	out := map[string]string{}

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Get(feed)
	if err != nil {
		log.Printf("warn: %s: %v", feed, err)
		return out
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("warn: %s -> %s", feed, resp.Status)
		return out
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Printf("warn: %s: %v", feed, err)
		return out
	}

	var parsed struct {
		Items []struct {
			Link    string `xml:"link"`
			Content string `xml:"encoded"`
		} `xml:"channel>item"`
	}
	if err := xml.Unmarshal(body, &parsed); err != nil {
		log.Printf("warn: %s: %v", feed, err)
		return out
	}

	for _, item := range parsed.Items {
		if text := strip(item.Content); text != "" {
			out[canonical(item.Link)] = text
		}
	}
	return out
}

// strip turns the feed's HTML body into the plain text the index stores.
func strip(markup string) string {
	text := html.UnescapeString(tags.ReplaceAllString(markup, " "))
	return strings.TrimSpace(strings.Join(strings.Fields(text), " "))
}

// records scrapes each post for its body text, which is what makes the search
// match on more than a title.
//
// A URL that cannot be read keeps its title and description and loses only its
// body. These are other people's blogs: one of them going away should cost that
// entry's full text, not the whole build.
func records(entries []Entry) []Record {
	reader := goose.New()
	out := make([]Record, 0, len(entries))

	for _, entry := range entries {
		body := ""
		if entry.Type == "post" {
			article, err := reader.ExtractFromURL(entry.URL)
			if err == nil {
				body = article.CleanedText
			} else if body = feedText(entry.URL); body != "" {
				log.Printf("read %s from its feed", entry.URL)
			} else {
				log.Printf("warn: %s: %v (title and description only)", entry.URL, err)
			}
		}

		if len(body) > maxRecord {
			log.Printf("warn: %s: body truncated to %d bytes", entry.URL, maxRecord)
			body = body[:maxRecord]
		}

		out = append(out, Record{
			ObjectID:    entry.URL,
			Title:       entry.Title,
			URL:         entry.URL,
			Author:      entry.Author,
			Year:        entry.Year,
			Type:        entry.Type,
			Description: entry.Description,
			Text:        body,
		})
	}

	return out
}

// replaceAll swaps the index's contents for these records in one operation, so
// a search during the update sees either the old set or the new one, and an
// entry dropped from media.json disappears rather than lingering.
func replaceAll(key string, recs []Record) error {
	body, err := json.Marshal(map[string]any{"requests": requests(recs)})
	if err != nil {
		return err
	}

	url := fmt.Sprintf("https://%s.algolia.net/1/indexes/%s/batch", appID, index)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return err
	}
	req.Header.Set("X-Algolia-Application-Id", appID)
	req.Header.Set("X-Algolia-API-Key", key)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var msg bytes.Buffer
		_, _ = msg.ReadFrom(resp.Body)
		return fmt.Errorf("algolia -> %s: %s", resp.Status, msg.String())
	}
	return nil
}

func requests(recs []Record) []map[string]any {
	out := make([]map[string]any, 0, len(recs))
	for _, rec := range recs {
		out = append(out, map[string]any{"action": "updateObject", "body": rec})
	}
	return out
}

func main() {
	entries, err := read(source)
	if err != nil {
		log.Fatalf("reading %s: %v", source, err)
	}
	log.Printf("indexing %d entries from %s", len(entries), source)

	recs := records(entries)

	scraped := 0
	for _, rec := range recs {
		if rec.Text != "" {
			scraped++
		}
	}
	log.Printf("%d of %d entries carry body text", scraped, len(recs))

	key := os.Getenv("ALGOLIA_ADMIN_KEY")
	if key == "" {
		log.Printf("ALGOLIA_ADMIN_KEY is unset; not publishing to %q", index)
		return
	}

	if err := replaceAll(key, recs); err != nil {
		log.Fatalf("publishing to %s: %v", index, err)
	}
	log.Printf("published %d records to %s", len(recs), index)
}
