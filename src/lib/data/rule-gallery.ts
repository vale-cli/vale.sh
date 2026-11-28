/**
 * Rules that check something other than prose, each modeled on rules docs
 * teams wrote for themselves. The YAML is ours; `credits` links the
 * adopters' originals. Each `sample` fires its rule and `clean` doesn't.
 */

export type GalleryRule = {
	id: string;
	category: string;
	title: string;
	summary: string;
	yaml: string;
	sample: string;
	/** Text the rule leaves alone; for the tests. */
	clean: string;
	credits: { name: string; url: string }[];
};

export type GalleryCategory = { id: string; title: string; summary: string };

export const categories: GalleryCategory[] = [
	{
		id: 'build',
		title: 'Markup that breaks the build',
		summary: 'Caught on the author’s machine, not in a failed deploy.'
	},
	{
		id: 'links',
		title: 'Links',
		summary: 'Links that survive a domain move, a locale redirect, and a site generator.'
	},
	{
		id: 'frontmatter',
		title: 'Front matter',
		summary: 'The page’s metadata, held to a contract.'
	},
	{
		id: 'code',
		title: 'Code blocks',
		summary: 'Examples a reader can copy and run.'
	},
	{
		id: 'structure',
		title: 'Page structure',
		summary: 'The shape of a page, not its sentences.'
	},
	{
		id: 'leaks',
		title: 'Leaks',
		summary: 'What shouldn’t reach the public site.'
	},
	{
		id: 'units',
		title: 'Units and numbers',
		summary: 'House rules for how numbers are written.'
	}
];

export const rules: GalleryRule[] = [
	{
		id: 'ConflictMarkers',
		category: 'build',
		title: 'Leftover merge conflicts',
		summary: 'A resolved merge that left its markers behind.',
		yaml: "extends: existence\nmessage: \"Resolve the merge conflict: '%s' is still in the file.\"\nlevel: error\nscope: raw\nnonword: true\ntokens:\n  - '(?m)^(?:<{7}|>{7}) .*$'\n  - '(?m)^={7}$'\n",
		sample:
			'# Install\n\n<<<<<<< HEAD\nRun the installer.\n=======\nRun the script.\n>>>>>>> main\n',
		clean: '# Install\n\nRun the installer.\n',
		credits: [
			{
				name: 'Expo',
				url: 'https://github.com/expo/expo/blob/main/docs/.vale/writing-styles/expo-docs/MergeConflictMarkers.yml'
			},
			{
				name: 'Hazelcast',
				url: 'https://github.com/hazelcast/documentation/blob/main/.vale/Hazelcast/MergeConflictsMarker.yml'
			},
			{
				name: 'Microsoft',
				url: 'https://github.com/microsoft/Documentarian/blob/main/Projects/Styles/PowerShell-Docs/Source/Rules/MergeConflictMarkers.yml'
			},
			{
				name: 'CircleCI',
				url: 'https://github.com/circleci/circleci-docs/blob/main/styles/circleci-docs/MergeConflictMarkers.yml'
			},
			{
				name: 'OUTSCALE',
				url: 'https://github.com/outscale/osc-doc-framework/blob/main/Vale/styles/Outscale/MergeConflicts.yml'
			}
		]
	},
	{
		id: 'UnclosedFence',
		category: 'build',
		title: 'Unclosed code blocks',
		summary: 'One missing fence turns the rest of the page into code.',
		yaml: 'extends: script\nmessage: "This code block is never closed, so the rest of the page renders as code."\nlevel: error\nscope: raw\nscript: |\n  text := import("text")\n  matches := []\n  open := -1\n  pos := 0\n  for line in text.split(scope, "\\n") {\n    if text.has_prefix(text.trim_space(line), "```") {\n      open = open < 0 ? pos : -1\n    }\n    pos += len(line) + 1\n  }\n  if open >= 0 {\n    matches = append(matches, {begin: open, end: open + 3})\n  }\n',
		sample: '# Run it\n\n```shell\nvale sync\n\nThen lint the docs.\n',
		clean: '# Run it\n\n```shell\nvale sync\n```\n\nThen lint the docs.\n',
		credits: [
			{
				name: 'Red Hat',
				url: 'https://github.com/redhat-documentation/vale-at-red-hat/blob/main/.vale/styles/AsciiDoc/ValidCodeBlocks.yml'
			},
			{
				name: 'CircleCI',
				url: 'https://github.com/circleci/circleci-docs/blob/main/styles/AsciiDoc/ValidCodeBlocks.yml'
			}
		]
	},
	{
		id: 'MdxComments',
		category: 'build',
		title: 'HTML comments in MDX',
		summary: 'MDX rejects `<!-- -->`, and the build stops on it.',
		yaml: "extends: existence\nmessage: \"MDX can't parse HTML comments; use '{/* ... */}' instead.\"\nlevel: error\nscope: raw\nnonword: true\ntokens:\n  - '<!--'\n",
		sample: '# Setup\n\n<!-- TODO: screenshot -->\nInstall the CLI.\n',
		clean: '# Setup\n\n{/* TODO: screenshot */}\nInstall the CLI.\n',
		credits: [
			{
				name: 'StarRocks',
				url: 'https://github.com/StarRocks/starrocks/blob/main/docs/styles/local/HTMLComment.yml'
			}
		]
	},
	{
		id: 'RelativeLinks',
		category: 'links',
		title: 'Relative links to your own docs',
		summary: 'An absolute link to your own site breaks in previews and on version branches.',
		yaml: "extends: existence\nmessage: \"Link to the page by its relative path, not '%s'.\"\nlevel: warning\nscope: raw\nnonword: true\ntokens:\n  - '(?<=\\]\\()https?://docs\\.example\\.com/[^)\\s]*'\n",
		sample: 'See [the install guide](https://docs.example.com/install/).\n',
		clean: 'See [the install guide](../install.md).\n',
		credits: [
			{
				name: 'Camunda',
				url: 'https://github.com/camunda/camunda-docs/blob/main/styles/camunda/all/markdownLinksDontExitToProduction.yml'
			},
			{
				name: 'Temporal',
				url: 'https://github.com/temporalio/documentation/blob/main/vale/styles/Temporal/RelativeLinks.yml'
			},
			{
				name: 'Crossplane',
				url: 'https://github.com/crossplane/docs/blob/master/utils/vale/styles/gitlab/RelativeLinks.yml'
			},
			{
				name: 'Sauce Labs',
				url: 'https://github.com/saucelabs/sauce-docs/blob/main/styles/sauce/RelativeLinks.yml'
			},
			{
				name: 'OpenSAFELY',
				url: 'https://github.com/opensafely/documentation/blob/main/styles/OpenSAFELY/InternalLinks.yml'
			}
		]
	},
	{
		id: 'SourceLinks',
		category: 'links',
		title: 'Links to the source, not the build',
		summary: 'Link `setup.md` so the generator can check it, not `setup.html`.',
		yaml: "extends: existence\nmessage: \"Link the source file, not the built page: '%s'.\"\nlevel: warning\nscope: raw\nnonword: true\ntokens:\n  - '(?<=\\]\\()(?!https?:)[^)\\s]+\\.html?(?:#[^)\\s]*)?(?=\\))'\n",
		sample: 'Follow [setup](./setup.html#linux).\n',
		clean: 'Follow [setup](./setup.md#linux) or [the spec](https://example.org/spec.html).\n',
		credits: [
			{
				name: 'Microsoft',
				url: 'https://github.com/microsoft/Documentarian/blob/main/Projects/Styles/PowerShell-Docs/Source/Rules/InternalLinkExtension.yml'
			},
			{
				name: 'Crossplane',
				url: 'https://github.com/crossplane/docs/blob/master/utils/vale/styles/gitlab/InternalLinkExtension.yml'
			},
			{
				name: 'Qdrant',
				url: 'https://github.com/qdrant/landing_page/blob/master/qdrant-landing/styles/Qdrant/InternalLinkExtension.yml'
			}
		]
	},
	{
		id: 'InsecureLinks',
		category: 'links',
		title: 'https only',
		summary: 'Plain `http://` links in published docs.',
		yaml: "extends: existence\nmessage: \"Link over https: '%s'.\"\nlevel: warning\nscope: raw\nnonword: true\ntokens:\n  - '(?<=\\]\\()http://[^)\\s]+'\n",
		sample: 'Read [the spec](http://example.org/spec).\n',
		clean: 'Read [the spec](https://example.org/spec).\n',
		credits: [
			{
				name: 'Mendix',
				url: 'https://github.com/mendix/docs/blob/development/.vale/styles/Mendix/HttpLinks.yml'
			},
			{
				name: 'Nhost',
				url: 'https://github.com/nhost/nhost/blob/main/.vale/styles/NhostBlog/InsecureLink.yml'
			}
		]
	},
	{
		id: 'LocaleLinks',
		category: 'links',
		title: 'No locale in URLs',
		summary: '`/en-us/` pins every reader to one language.',
		yaml: "extends: existence\nmessage: \"Drop the locale from '%s' so readers land on their own language.\"\nlevel: suggestion\nscope: raw\nnonword: true\ntokens:\n  - '(?<=\\]\\()https?://[^)\\s]*/(?:en-us|en-gb)/[^)\\s]*'\n",
		sample: 'Read [the guide](https://learn.example.com/en-us/guide).\n',
		clean: 'Read [the guide](https://learn.example.com/guide).\n',
		credits: [
			{
				name: 'CockroachDB',
				url: 'https://github.com/cockroachdb/docs/blob/main/vale/CockroachDB/LocalizedLinks.yml'
			}
		]
	},
	{
		id: 'DescriptionRequired',
		category: 'frontmatter',
		title: 'A description on every page',
		summary: 'Search results and link previews show it.',
		yaml: "extends: occurrence\nmessage: \"Add a 'description' to the front matter; search results show it.\"\nlevel: error\nscope: raw\nmin: 1\ntoken: '(?m)^description:\\s*\\S'\n",
		sample: '---\ntitle: Install\n---\n\n# Install\n\nRun the installer.\n',
		clean:
			'---\ntitle: Install\ndescription: Install the CLI on macOS, Linux, or Windows.\n---\n\n# Install\n',
		credits: [
			{
				name: 'StarRocks',
				url: 'https://github.com/StarRocks/starrocks/blob/main/docs/styles/local/FrontmatterDescription.yml'
			},
			{
				name: 'EDB',
				url: 'https://github.com/EnterpriseDB/docs/blob/develop/vale/styles/Custom/FrontmatterDescriptionNotEmpty.yml'
			},
			{
				name: 'ngrok',
				url: 'https://github.com/ngrok/ngrok-docs/blob/main/.vale/styles/StyleRules/DescriptionRequired.yml'
			}
		]
	},
	{
		id: 'DescriptionFiller',
		category: 'frontmatter',
		title: 'Descriptions that say something',
		summary: '“This page explains…” wastes the one line a search result shows.',
		yaml: "extends: existence\nmessage: \"Say what the page covers instead of opening with '%s'.\"\nlevel: warning\nscope: raw\nnonword: true\ntokens:\n  - '(?mi)(?<=^description:\\s*[\"'']?)(?:this (?:page|document|article|guide|section)|in this (?:page|document|article|guide|section)|learn about)'\n",
		sample: '---\ndescription: This page explains how to install the CLI.\n---\n',
		clean: '---\ndescription: Install the CLI on macOS, Linux, or Windows.\n---\n',
		credits: [
			{
				name: 'StarRocks',
				url: 'https://github.com/StarRocks/starrocks/blob/main/docs/styles/local/FrontmatterDescriptionFluff.yml'
			}
		]
	},
	{
		id: 'ShellPrompts',
		category: 'code',
		title: 'Copy-pasteable commands',
		summary: 'A `$ ` prompt comes along when the command is copied.',
		yaml: "extends: existence\nmessage: \"Drop the '$ ' prompt so the command can be copied as is.\"\nlevel: warning\nscope: raw\nnonword: true\ntokens:\n  - '(?m)(?<=^```(?:bash|sh|shell)\\n(?:[^`\\n]*\\n)*?)\\$ '\n",
		sample: '```bash\n$ vale sync\n```\n',
		clean: '```bash\nvale sync\n```\n',
		credits: [
			{
				name: 'Infisical',
				url: 'https://github.com/Infisical/infisical/blob/main/docs/.vale/styles/Infisical/ShellPrompts.yml'
			},
			{
				name: 'Gardener',
				url: 'https://github.com/gardener/documentation/blob/master/.vale/styles/Gardener/CommandPrompt.yml'
			},
			{
				name: 'Canonical',
				url: 'https://github.com/canonical/documentation-style-guide/blob/main/styles/Canonical/015-No-prompts-in-comments.yml'
			}
		]
	},
	{
		id: 'FenceLanguage',
		category: 'code',
		title: 'A language on every fence',
		summary: 'An unlabeled block gets no highlighting.',
		yaml: 'extends: script\nmessage: "Name the code block\'s language so it gets highlighted."\nlevel: warning\nscope: raw\nscript: |\n  text := import("text")\n  matches := []\n  inside := false\n  pos := 0\n  for line in text.split(scope, "\\n") {\n    t := text.trim_space(line)\n    if text.has_prefix(t, "```") {\n      if !inside && t == "```" {\n        matches = append(matches, {begin: pos, end: pos + len(line)})\n      }\n      inside = !inside\n    }\n    pos += len(line) + 1\n  }\n',
		sample: 'Run:\n\n```\nvale sync\n```\n',
		clean: 'Run:\n\n```shell\nvale sync\n```\n',
		credits: [
			{
				name: 'ClickHouse',
				url: 'https://github.com/clickhouse/clickhouse-docs/blob/main/styles/ClickHouse/CodeblockFences.yml'
			},
			{
				name: 'Oracle',
				url: 'https://github.com/oracle-livelabs/common/blob/main/lintchecker/vale/fixtures/scopes/rules/Fence.yml'
			},
			{
				name: 'Crossplane',
				url: 'https://github.com/crossplane/docs/blob/master/utils/vale/styles/gitlab/CodeblockFences.yml'
			}
		]
	},
	{
		id: 'LongCodeBlocks',
		category: 'code',
		title: 'Code blocks that fit',
		summary: 'Past 25 lines, link the file instead.',
		yaml: 'extends: script\nmessage: "This code block runs over 25 lines; trim it or link the full file."\nlevel: suggestion\nscope: raw\nscript: |\n  text := import("text")\n  matches := []\n  max := 25\n  start := -1\n  count := 0\n  pos := 0\n  for line in text.split(scope, "\\n") {\n    if text.has_prefix(text.trim_space(line), "```") {\n      if start < 0 {\n        start = pos\n        count = 0\n      } else {\n        if count > max {\n          matches = append(matches, {begin: start, end: start + 3})\n        }\n        start = -1\n      }\n    } else if start >= 0 {\n      count += 1\n    }\n    pos += len(line) + 1\n  }\n',
		sample:
			'```text\n1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12\n13\n14\n15\n16\n17\n18\n19\n20\n21\n22\n23\n24\n25\n26\n```\n',
		clean: '```text\n1\n2\n```\n',
		credits: [
			{
				name: 'Canonical',
				url: 'https://github.com/canonical/documentation-style-guide/blob/main/styles/Canonical/017b-Warn-code-over-35-lines.yml'
			},
			{
				name: 'Rootstock',
				url: 'https://github.com/rsksmart/docs-style-guide/blob/main/styles/Rootstock/017-Avoid-long-code-blocks.yml'
			}
		]
	},
	{
		id: 'HeadingLevels',
		category: 'structure',
		title: 'No skipped heading levels',
		summary: 'Screen readers navigate by heading level.',
		yaml: 'extends: script\nmessage: "This heading skips a level; go down one level at a time."\nlevel: warning\nscope: raw\nscript: |\n  text := import("text")\n  matches := []\n  last := 0\n  inside := false\n  pos := 0\n  for line in text.split(scope, "\\n") {\n    if text.has_prefix(line, "```") {\n      inside = !inside\n    } else if !inside && text.re_match("^#{1,6} ", line) {\n      level := len(text.split(line, " ")[0])\n      if last > 0 && level > last + 1 {\n        matches = append(matches, {begin: pos, end: pos + len(line)})\n      }\n      last = level\n    }\n    pos += len(line) + 1\n  }\n',
		sample: '# Install\n\nIntro.\n\n### Linux\n\nSteps.\n',
		clean: '# Install\n\nIntro.\n\n## Linux\n\nSteps.\n',
		credits: [
			{
				name: 'GOV.UK',
				url: 'https://github.com/alphagov/tech-docs-linter/blob/main/styles/tech-writing-style-guide/skipped-heading-levels.yml'
			},
			{
				name: 'Coder',
				url: 'https://github.com/coder/coder/blob/main/docs/.style/styles/Coder/HeadingOrder.yml'
			}
		]
	},
	{
		id: 'StackedHeadings',
		category: 'structure',
		title: 'A sentence under every heading',
		summary: 'Two headings in a row leave a section empty.',
		yaml: 'extends: existence\nmessage: "Add a sentence under this heading before the next one."\nlevel: suggestion\nscope: raw\nnonword: true\ntokens:\n  - \'(?m)^#{1,6} .+\\n\\s*(?=#{1,6} )\'\n',
		sample: '# Install\n\n## Linux\n\nRun the script.\n',
		clean: '# Install\n\nPick your platform.\n\n## Linux\n\nRun the script.\n',
		credits: [
			{
				name: 'Hazelcast',
				url: 'https://github.com/hazelcast/documentation/blob/main/.vale/Hazelcast/StackedHeadings.yml'
			},
			{
				name: 'Couchbase',
				url: 'https://github.com/couchbaselabs/docs-style-guide/blob/main/ValeStyles/Couchbase/StackedHeadings.yml'
			},
			{
				name: 'Novu',
				url: 'https://github.com/novuhq/docs/blob/main/.vale/styles/Novu/HeadingContext.yml'
			},
			{
				name: 'Rootstock',
				url: 'https://github.com/rsksmart/docs-style-guide/blob/main/styles/Rootstock/011-Headings-not-followed-by-heading.yml'
			}
		]
	},
	{
		id: 'RequiredSections',
		category: 'structure',
		title: 'Required sections',
		summary: 'Every how-to ends with where to go next.',
		yaml: "extends: occurrence\nmessage: \"How-to pages end with a '## Next steps' section.\"\nlevel: warning\nscope: raw\nmin: 1\ntoken: '(?m)^## Next steps$'\n",
		sample: '# Rotate a key\n\nRun the command.\n',
		clean: '# Rotate a key\n\nRun the command.\n\n## Next steps\n\nSee the audit log.\n',
		credits: [
			{
				name: 'Yellow Network',
				url: 'https://github.com/layer-3/docs/blob/master/.vale/styles/Yellow/BuildPageShapeNextSteps.yml'
			}
		]
	},
	{
		id: 'ListNumbering',
		category: 'structure',
		title: 'Numbered steps in order',
		summary: 'A step numbered twice after an edit.',
		yaml: 'extends: script\nmessage: "This step is out of order; number the list 1, 2, 3."\nlevel: warning\nscope: raw\nscript: |\n  text := import("text")\n  matches := []\n  want := 1\n  pos := 0\n  for line in text.split(scope, "\\n") {\n    m := text.re_find("^(\\\\d+)\\\\. ", line)\n    if m != undefined {\n      n := text.atoi(m[0][1].text)\n      if n != want {\n        matches = append(matches, {begin: pos, end: pos + len(m[0][0].text) - 1})\n      }\n      want = n + 1\n    } else if text.trim_space(line) != "" && !text.has_prefix(line, " ") {\n      want = 1\n    }\n    pos += len(line) + 1\n  }\n',
		sample: '1. Install the CLI.\n2. Sync the styles.\n2. Run Vale.\n',
		clean: '1. Install the CLI.\n2. Sync the styles.\n3. Run Vale.\n',
		credits: [
			{
				name: 'Smallstep',
				url: 'https://github.com/smallstep/docs/blob/main/.vale/styles/Smallstep/OrderedListNumbering.yml'
			}
		]
	},
	{
		id: 'InternalHosts',
		category: 'leaks',
		title: 'Internal hostnames',
		summary: 'A `*.corp` or `*.internal` host left in an example.',
		yaml: "extends: existence\nmessage: \"'%s' is an internal host; replace it before publishing.\"\nlevel: error\nscope: raw\nnonword: true\ntokens:\n  - '\\b[\\w-]+(?:\\.[\\w-]+)*\\.(?:internal|corp|lan)\\b'\n",
		sample: 'Point the client at build-01.corp to start.\n',
		clean: 'Point the client at api.example.com to start.\n',
		credits: [
			{
				name: 'Oracle',
				url: 'https://github.com/oracle-livelabs/common/blob/main/lintchecker/vale/styles/Oracle/Security_InternalDomains.yml'
			}
		]
	},
	{
		id: 'OwnedTodos',
		category: 'leaks',
		title: 'TODOs with an owner',
		summary: 'A TODO that points at an issue gets done.',
		yaml: "extends: existence\nmessage: \"Link this TODO to an issue ('TODO(#123)') or remove it.\"\nlevel: warning\nscope: raw\nnonword: true\ntokens:\n  - '\\bTODO\\b(?!\\s*\\(#\\d+\\))'\n",
		sample: 'TODO: add the Windows steps.\n',
		clean: 'TODO(#412): add the Windows steps.\n',
		credits: [
			{
				name: 'Canonical',
				url: 'https://github.com/canonical/documentation-style-guide/blob/main/styles/Canonical/028-flag-todo-comments.yml'
			}
		]
	},
	{
		id: 'ChatArtifacts',
		category: 'leaks',
		title: 'Text pasted from a chat tool',
		summary: 'Tracking parameters and citation marks a chat tool adds.',
		yaml: "extends: existence\nmessage: \"Remove '%s'; it came along when the text was copied out of a chat tool.\"\nlevel: error\nscope: raw\nnonword: true\ntokens:\n  - '[?&]utm_source=chatgpt\\.com'\n  - '【\\d+†[^】]*】'\n",
		sample: 'See [the docs](https://example.com/docs?utm_source=chatgpt.com).\n',
		clean: 'See [the docs](https://example.com/docs).\n',
		credits: [
			{
				name: 'Mintlify',
				url: 'https://github.com/mintlify/docs/blob/main/.vale/styles/Mintlify/ChatArtifacts.yml'
			}
		]
	},
	{
		id: 'ByteUnits',
		category: 'units',
		title: 'Byte units',
		summary: 'kB, MB, and GB, written one way.',
		yaml: "extends: substitution\nmessage: \"Use '%s' instead of '%s' for bytes.\"\nlevel: warning\nignorecase: false\nnonword: true\nswap:\n  '(?<=\\d ?)KB\\b': kB\n  '(?<=\\d ?)kb\\b': kB\n  '(?<=\\d ?)mb\\b': MB\n  '(?<=\\d ?)gb\\b': GB\n",
		sample: 'The bundle is 512 KB and the image is 2 gb.\n',
		clean: 'The bundle is 512 kB and the image is 2 GB.\n',
		credits: [
			{
				name: 'Expo',
				url: 'https://github.com/expo/expo/blob/main/docs/.vale/writing-styles/expo-docs/Bytes.yml'
			}
		]
	},
	{
		id: 'HexCase',
		category: 'units',
		title: 'Hexadecimal case',
		summary: '`0xFFF1`, not `0xfff1`.',
		yaml: "extends: existence\nmessage: \"Write hexadecimal digits in uppercase: '%s'.\"\nlevel: suggestion\nnonword: true\ntokens:\n  - '\\b0x[0-9A-F]*[a-f][0-9A-Fa-f]*\\b'\n",
		sample: 'The vendor ID is 0xfff1.\n',
		clean: 'The vendor ID is 0xFFF1.\n',
		credits: [
			{
				name: 'Matter',
				url: 'https://github.com/project-chip/matter-handbook/blob/main/.vale/Matter/BadHexNumberFormat.yml'
			}
		]
	}
];
