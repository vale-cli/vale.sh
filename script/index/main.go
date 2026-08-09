// Builds the search index the /library page queries, from this repository's
// own media.json.
//
// It used to come from errata-ai/library: that repo held the entry list, built
// an index from it, and published INDEX.zip as a release asset, which the
// Makefile downloaded. Adding one link therefore meant a pull request there, a
// merge, a release, and a rebuild here -- so in practice entries were added
// straight to media.json instead, and the two lists drifted. Five entries were
// only ever in media.json, which meant they rendered in the grid but could not
// be found by the search.
//
// media.json is the single source now. The Bleve wrapper still comes from
// errata-ai/library, because that part earns its keep.
//
// The library version here is pinned to the one lambda/search embeds (v0.4.1),
// so the index this writes is one that lambda can read. That version predates
// the package's GitHub-issue reader, so Vale's issues -- which the old,
// separately-built index carried -- are not indexed. Restoring them means
// bumping the library in both places together and setting GH_TOKEN.
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"

	goose "github.com/advancedlogic/GoOse"
	"github.com/errata-ai/library/pkg/data"
	"github.com/errata-ai/library/pkg/search"
)

const (
	source = "src/lib/data/media.json"
	target = "lambda/search/INDEX"
)

// Entry is the subset of a media.json record the index needs. The file carries
// description, image and site as well, for the cards; none of that is indexed.
type Entry struct {
	Title  string `json:"title"`
	URL    string `json:"url"`
	Author string `json:"author"`
	Year   int    `json:"year"`
	Type   string `json:"type"`
}

func read(path string) ([]Entry, error) {
	var entries []Entry

	src, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	return entries, json.Unmarshal(src, &entries)
}

// sources scrapes each post for its body text, which is what makes the search
// match on more than a title and what fills the result fragment.
//
// A URL that cannot be read is skipped with a warning rather than returned as
// an error. These are other people's blogs: one of them going away should cost
// its own entry's body text, not the whole site build.
func sources(entries []Entry) []data.Source {
	reader := goose.New()
	out := make([]data.Source, 0, len(entries))

	for _, entry := range entries {
		body := entry.Title
		if entry.Type == "post" {
			article, err := reader.ExtractFromURL(entry.URL)
			if err != nil {
				log.Printf("warn: %s: %v (indexing title only)", entry.URL, err)
			} else if article.CleanedText != "" {
				body = article.CleanedText
			}
		}

		out = append(out, data.Source{
			ID: fmt.Sprintf(
				"title=%s&url=%s&author=%s&year=%d&type=%s",
				entry.Title, entry.URL, entry.Author, entry.Year, entry.Type),
			URL: entry.URL,
			Fields: map[string]interface{}{
				"title":  entry.Title,
				"text":   body,
				"author": entry.Author,
				"year":   entry.Year,
				"type":   entry.Type,
			},
		})
	}

	return out
}

// flatten moves INDEX/store/* up into INDEX, which is the layout the lambda's
// embed directive expects. The old pipeline did this in a Makefile after
// unzipping; it belongs with the code that produces the directory.
func flatten(dir string) error {
	store := filepath.Join(dir, "store")
	if _, err := os.Stat(store); os.IsNotExist(err) {
		return nil
	}

	items, err := os.ReadDir(store)
	if err != nil {
		return err
	}
	for _, item := range items {
		from := filepath.Join(store, item.Name())
		to := filepath.Join(dir, item.Name())
		if err := os.Rename(from, to); err != nil {
			return err
		}
	}

	return os.Remove(store)
}

func main() {
	entries, err := read(source)
	if err != nil {
		log.Fatalf("reading %s: %v", source, err)
	}
	log.Printf("indexing %d entries from %s", len(entries), source)

	// Bleve will not write into a directory that already holds an index.
	if err := os.RemoveAll(target); err != nil {
		log.Fatal(err)
	}

	set := data.Set{
		Mapping: data.Mapping{
			Path: source,
			Fields: map[string]string{
				"title":  "string",
				"text":   "string",
				"author": "string",
				"year":   "numeric",
				"type":   "string",
			},
		},
		Sources: sources(entries),
	}

	if _, err := search.NewEngineFromData(target, set); err != nil {
		log.Fatalf("building index: %v", err)
	}
	if err := flatten(target); err != nil {
		log.Fatalf("flattening index: %v", err)
	}

	log.Printf("wrote %s", target)
}
