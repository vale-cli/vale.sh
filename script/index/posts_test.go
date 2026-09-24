package main

import (
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

const samplePost = `---
title: 'Linting a manuscript'
description: 'Journals is a Vale package for scientific papers.'
date: '2026-09-17'
tags: ['packages', 'formats']
motif: 'manuscript'
---

<script>
  import Callout from '$lib/components/blog/Callout.svelte';
  import JournalsRuleChart from '$lib/components/blog/JournalsRuleChart.svelte';
</script>

Every journal publishes a page of [instructions for authors](https://example.com).

` + "```ini\nStylesPath = styles\n```" + `

<JournalsRuleChart
  rows={[1, 2]}
/>

## Sections

<Callout title="Note">A rule is *scoped* to a section.</Callout>

- one item
- two items
`

func TestProse(t *testing.T) {
	_, body, err := split([]byte(samplePost))
	if err != nil {
		t.Fatal(err)
	}
	got := prose(body)
	want := "Every journal publishes a page of instructions for authors. Sections A rule is scoped to a section. one item two items"
	if got != want {
		t.Errorf("prose:\n got %q\nwant %q", got, want)
	}
	for _, leaked := range []string{"StylesPath", "import", "rows=", "https://"} {
		if strings.Contains(got, leaked) {
			t.Errorf("prose leaked %q", leaked)
		}
	}
}

func TestPosts(t *testing.T) {
	dir := t.TempDir()
	write := func(name, src string) {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(src), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("journals.md", samplePost)
	write("wip.md", "---\ntitle: 'Soon'\ndescription: 'x'\ndate: '2026-10-01'\ndraft: true\n---\n\nNot yet.\n")

	recs, err := posts(dir)
	if err != nil {
		t.Fatal(err)
	}
	if len(recs) != 1 {
		t.Fatalf("got %d records, want 1 (the draft is skipped)", len(recs))
	}

	rec := recs[0]
	want := Record{
		ObjectID:    "https://vale.sh/blog/journals",
		Title:       "Linting a manuscript",
		URL:         "https://vale.sh/blog/journals",
		Author:      "Joseph Kato",
		Year:        2026,
		Type:        "blog",
		Description: "Journals is a Vale package for scientific papers.",
		Tags:        []string{"Packages", "Formats"},
		Text:        rec.Text,
	}
	if !reflect.DeepEqual(rec, want) {
		t.Errorf("record:\n got %+v\nwant %+v", rec, want)
	}
}

func TestPostsRejectsUnknownTag(t *testing.T) {
	dir := t.TempDir()
	src := "---\ntitle: 'T'\ndescription: 'd'\ndate: '2026-01-01'\ntags: ['nope']\n---\n\nBody.\n"
	if err := os.WriteFile(filepath.Join(dir, "t.md"), []byte(src), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := posts(dir); err == nil || !strings.Contains(err.Error(), `"nope"`) {
		t.Errorf("want an error naming the tag, got %v", err)
	}
}

// The real posts parse, so a frontmatter change that breaks the indexer
// fails here rather than in the deploy.
func TestPostsInRepo(t *testing.T) {
	recs, err := posts(filepath.Join("..", "..", postsDir))
	if err != nil {
		t.Fatal(err)
	}
	if len(recs) == 0 {
		t.Fatal("no posts read from the repository")
	}
	for _, rec := range recs {
		if rec.Title == "" || rec.Description == "" || rec.Year == 0 || rec.Text == "" {
			t.Errorf("%s: incomplete record %+v", rec.URL, rec)
		}
		if len(rec.Text) > maxRecord {
			t.Errorf("%s: text is %d bytes", rec.URL, len(rec.Text))
		}
	}
}
