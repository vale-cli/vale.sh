// Fills in the presentational fields of src/lib/data/media.json -- the
// description, image and site each card shows -- from a URL's OpenGraph tags.
//
// This used to rebuild the file from errata-ai/library's library.json, which
// made that the source of truth and this a derived artifact. It was not being
// used that way: five entries existed only here, so a run would have deleted
// them. media.json is the source now, and this only ever adds to it -- an
// entry is never dropped, and a field that is already filled is left alone
// unless -force says otherwise.
//
// Add a resource by appending title, url, author, year and type to
// media.json, then running `make media` to fill in the rest.
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

const ogLambda = `https://vale.sh/.netlify/functions/preview?url=%s`

type OGData struct {
	Description string `json:"description"`
	SiteName    string `json:"site_name"`
	Images      []struct {
		URL string `json:"url"`
	} `json:"images"`
}

// Media is one media.json record. Every field round-trips, so a key this tool
// does not understand survives a run.
type Media struct {
	Title       string `json:"title"`
	URL         string `json:"url"`
	Author      string `json:"author"`
	Year        int    `json:"year"`
	Type        string `json:"type"`
	Description string `json:"description"`
	Image       string `json:"image"`
	Site        string `json:"site"`
}

var client = &http.Client{Timeout: 30 * time.Second}

// reachable reports whether an image URL still serves something. Hosts drop
// images and start blocking hotlinks, and a card is better with no image than
// with a broken one.
func reachable(url string) bool {
	resp, err := client.Get(url)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

func fetchOG(url string) (OGData, error) {
	var og OGData

	resp, err := client.Get(fmt.Sprintf(ogLambda, url))
	if err != nil {
		return og, err
	}
	defer resp.Body.Close()

	return og, json.NewDecoder(resp.Body).Decode(&og)
}

func main() {
	root := flag.String("root", ".", "repository root")
	force := flag.Bool("force", false, "refetch entries that already have all three fields")
	flag.Parse()

	path := filepath.Join(*root, "src", "lib", "data", "media.json")

	src, err := os.ReadFile(path)
	if err != nil {
		log.Fatalf("reading %s: %v", path, err)
	}

	var media []Media
	if err := json.Unmarshal(src, &media); err != nil {
		log.Fatalf("parsing %s: %v", path, err)
	}

	filled := 0
	for i, m := range media {
		complete := m.Description != "" && m.Site != "" && m.Image != ""
		if complete && !*force {
			continue
		}

		og, err := fetchOG(m.URL)
		if err != nil {
			// One unreachable host is not a reason to abandon the rest.
			log.Printf("warn: %s: %v (leaving as-is)", m.URL, err)
			continue
		}

		if m.Description == "" || *force {
			media[i].Description = og.Description
		}
		if m.Site == "" || *force {
			media[i].Site = og.SiteName
		}
		if (m.Image == "" || *force) && len(og.Images) > 0 {
			if img := og.Images[0].URL; reachable(img) {
				media[i].Image = img
			} else {
				log.Printf("warn: %s: image not reachable, leaving empty", img)
			}
		}
		filled++
	}

	out, err := json.MarshalIndent(media, "", "\t")
	if err != nil {
		log.Fatal(err)
	}
	if err := os.WriteFile(path, append(out, '\n'), 0o644); err != nil {
		log.Fatal(err)
	}

	log.Printf("%d entries, %d updated", len(media), filled)
}
