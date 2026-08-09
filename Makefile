# The search index behind /library is built here, from this repository's own
# src/lib/data/media.json.
#
# It used to be downloaded from errata-ai/library's releases:
#
#     curl .../releases/latest/download/INDEX.zip -L -o INDEX.zip
#     unzip INDEX.zip -d lambda/search
#
# That put the entry list in another repository, so adding one link meant a
# pull request there, a merge, a release, and a rebuild here. Entries were
# added straight to media.json instead and the two drifted -- five of them
# rendered in the grid but could not be found by the search, because the index
# was built from the other copy. See script/index/main.go.
define build_index
	cd script/index && go build -ldflags="-s -w" -o $(CURDIR)/bin/index-media .
	$(CURDIR)/bin/index-media
endef

.PHONY: all build preview index media configs

all: build

build:
	$(call build_index)
	pnpm run build

preview:
	$(call build_index)
	pnpm run build -- -b ${DEPLOY_PRIME_URL}

# Rebuild the index alone, for checking a media.json edit without a full build.
index:
	$(call build_index)

# Refresh the description, image and site of each media.json entry from its
# OpenGraph tags. Additive: it fills fields in, and never drops an entry.
media:
	cd script/media && go run . -root $(CURDIR)

# Re-read the public .vale.ini files the adopters list points at and rebuild
# the counts the generator shows. Run it when adopters.json changes.
configs:
	node script/configs/main.mjs
