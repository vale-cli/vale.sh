package main

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"gopkg.in/yaml.v3"
)

// The blog is indexed from its source, src/posts/*.md, because this runs
// before the site is built. Frontmatter supplies the fields; the body is
// reduced to prose the way a reader would see it.
const postsDir = "src/posts"

const siteURL = "https://vale.sh"

// Mirrors AUTHORS in src/lib/posts.ts. A post without an author is the
// site's author's.
var authors = map[string]string{
	"jdkato": "Joseph Kato",
}

// Mirrors TAGS in src/lib/posts.ts: a tag's label is what the index stores,
// since that is the word someone searches for.
var tagLabels = map[string]string{
	"packages":  "Packages",
	"agents":    "Agents",
	"tutorials": "Tutorials",
	"formats":   "Formats",
}

// Frontmatter is the subset of a post's frontmatter the index needs.
type Frontmatter struct {
	Title       string   `yaml:"title"`
	Description string   `yaml:"description"`
	Date        string   `yaml:"date"`
	Draft       bool     `yaml:"draft"`
	Author      string   `yaml:"author"`
	Tags        []string `yaml:"tags"`
}

var (
	reFrontmatter = regexp.MustCompile(`(?s)\A---\n(.*?)\n---\n`)
	reScript      = regexp.MustCompile(`(?s)<script[^>]*>.*?</script>`)
	reFence       = regexp.MustCompile("(?ms)^```.*?^```[ \t]*$")
	reComponent   = regexp.MustCompile(`(?s)<[A-Z][A-Za-z]*(?:\s[^>]*?)?/?>|</[A-Z][A-Za-z]*>`)
	reImage       = regexp.MustCompile(`!\[[^\]]*\]\([^)]*\)`)
	reLink        = regexp.MustCompile(`\[([^\]]+)\]\([^)]*\)`)
	reHeading     = regexp.MustCompile(`(?m)^#{1,6}\s+`)
	reQuote       = regexp.MustCompile(`(?m)^>\s?`)
	reBullet      = regexp.MustCompile(`(?m)^\s*(?:[-*+]|\d+\.)\s+`)
	reEmphasis    = regexp.MustCompile("[*_`]+")
)

// split separates a post into its frontmatter and body.
func split(src []byte) (Frontmatter, string, error) {
	var fm Frontmatter

	m := reFrontmatter.FindSubmatchIndex(src)
	if m == nil {
		return fm, "", fmt.Errorf("no frontmatter")
	}
	if err := yaml.Unmarshal(src[m[2]:m[3]], &fm); err != nil {
		return fm, "", err
	}
	return fm, string(src[m[1]:]), nil
}

// prose reduces a post's Markdown body to the text a search should match.
// Code blocks and component markup go; link text, headings and list items
// stay as words.
func prose(body string) string {
	text := reScript.ReplaceAllString(body, " ")
	text = reFence.ReplaceAllString(text, " ")
	text = reComponent.ReplaceAllString(text, " ")
	text = tags.ReplaceAllString(text, " ")
	text = reImage.ReplaceAllString(text, " ")
	text = reLink.ReplaceAllString(text, "$1")
	text = reHeading.ReplaceAllString(text, "")
	text = reQuote.ReplaceAllString(text, "")
	text = reBullet.ReplaceAllString(text, "")
	text = reEmphasis.ReplaceAllString(text, "")
	return strings.Join(strings.Fields(text), " ")
}

// year reads the year off an ISO date.
func year(date string) int {
	n := 0
	if len(date) >= 4 {
		fmt.Sscanf(date[:4], "%d", &n)
	}
	return n
}

// posts reads every published post in dir into a record. A draft is
// unlisted on the site, so it is unlisted here too.
func posts(dir string) ([]Record, error) {
	paths, err := filepath.Glob(filepath.Join(dir, "*.md"))
	if err != nil {
		return nil, err
	}
	sort.Strings(paths)

	var out []Record
	for _, path := range paths {
		src, err := os.ReadFile(path)
		if err != nil {
			return nil, err
		}
		fm, body, err := split(src)
		if err != nil {
			return nil, fmt.Errorf("%s: %w", path, err)
		}
		if fm.Draft {
			continue
		}

		slug := strings.TrimSuffix(filepath.Base(path), ".md")
		link := siteURL + "/blog/" + slug

		author := fm.Author
		if author == "" {
			author = "jdkato"
		}
		name, ok := authors[author]
		if !ok {
			return nil, fmt.Errorf("%s: unknown author %q", path, author)
		}

		labels := make([]string, 0, len(fm.Tags))
		for _, tag := range fm.Tags {
			label, ok := tagLabels[tag]
			if !ok {
				return nil, fmt.Errorf("%s: unknown tag %q", path, tag)
			}
			labels = append(labels, label)
		}

		text := prose(body)
		if len(text) > maxRecord {
			text = text[:maxRecord]
		}

		out = append(out, Record{
			ObjectID:    link,
			Title:       fm.Title,
			URL:         link,
			Author:      name,
			Year:        year(fm.Date),
			Type:        "blog",
			Description: fm.Description,
			Tags:        labels,
			Text:        text,
		})
	}
	return out, nil
}
