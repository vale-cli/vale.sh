<script lang="ts">
	// "We have an MCP server" is a sentence every product shipped this year. What
	// is not common is what the tools are *attached to*: an engine that answers
	// whether a rule compiles, what it matches, and what it costs. So this lets a
	// reader open the surface instead of taking its word for it.
	//
	// EVERY example below is a real call with its real output, trimmed to fit the
	// panel. Nothing here is illustrative. On a page whose whole argument is that
	// the engine really runs, an invented transcript would be the one lie on it —
	// and the cheapest one to catch, since a reader can make the same call.
	//
	// check_links is deliberately absent: it needs VALE_MCP_ALLOW_NETWORK, which
	// the deployed server does not have yet, so there is no real output to show.
	// Add it here when there is.
	type Example = { call: string; result: string; note?: string };
	type Tool = { name: string; desc: string; example: Example };
	type Group = { name: string; body: string; tools: Tool[] };

	const groups: Group[] = [
		{
			name: 'Author',
			body: 'Start from something that already compiles — not a blank file and a guess at the schema.',
			tools: [
				{
					name: 'scaffold_rule',
					desc: 'A valid starter rule for any check type, compiled against the engine before you ever see it.',
					example: {
						call: 'scaffold_rule\n  check_type: "substitution"\n  style: "House"\n  name: "Terms"\n  level: "warning"',
						result:
							'{\n  "files": {\n    "styles/House/Terms.yml":\n      "level: warning\\nextends: substitution\\n\n       message: \\"Use \'%s\' instead of \'%s\'.\\"\\n\n       swap:\\n  utilise: use"\n  },\n  "enable": "Add `BasedOnStyles = House` to\n             the [*] section of .vale.ini.",\n  "valid": true,\n  "note": "valid ✓"\n}',
						note: 'It comes back with the path it belongs at and the line that switches it on, so nothing is left to guess.'
					}
				},
				{
					name: 'assemble_style',
					desc: "Assemble validated rules into a style package. Pass the guide's own avoid and prefer examples and every rule is checked against them.",
					example: {
						call: 'assemble_style\n  style: "House"\n  rules:\n    - name: GenderBias\n      yaml: "extends: existence\n             tokens: [his/her]"\n      avoid:  ["Give him/her the file."]\n      prefer: ["Give them the file."]',
						result:
							'{\n  "compiled": 1,\n  "verified": 0,\n  "unverified": [{\n    "name": "GenderBias",\n    "cases": [{\n      "kind": "avoid",\n      "text": "Give him/her the file.",\n      "problem": "the guide rejects this and\n                  the rule did not flag it"\n    }]\n  }]\n}',
						note: 'The rule compiled and still did the wrong thing: the token said his/her, the sentence said him/her. Compiling alone would have called that a success.'
					}
				},
				{
					name: 'fetch_guide',
					desc: 'Turn a published style guide into plain text you can derive rules from, headings and list markers intact.',
					example: {
						call: 'fetch_guide\n  url: "https://learn.microsoft.com/en-us/\n        style-guide/word-choice/…"',
						result:
							'{\n  "title": "Use simple words, concise\n            sentences — Microsoft Style Guide",\n  "chars": 1771,\n  "truncated": false,\n  "source": "page",\n  "text": "# Use simple words, concise\n            sentences\\n\\nMake every word\n            count. Concise, clear\n            sentences save space…"\n}',
						note: "A page that renders client-side falls back to the site's llms.txt automatically. `source` tells you which one answered."
					}
				},
				{
					name: 'scaffold_vocab',
					desc: 'A vocabulary — the accept and reject word lists, at the path Vale looks for them.',
					example: {
						call: 'scaffold_vocab\n  name: "Acme"\n  accept: ["Kubernetes", "kubectl", "Acme Corp"]\n  reject: ["k8s", "webserver"]',
						result:
							'{\n  "files": {\n    "styles/config/vocabularies/Acme/accept.txt":\n      "Kubernetes\\nkubectl\\nAcme Corp\\n",\n    "styles/config/vocabularies/Acme/reject.txt":\n      "k8s\\nwebserver\\n"\n  },\n  "enable": "Add `Vocab = Acme` to the [*]\n             section of .vale.ini."\n}',
						note: 'Entries are case-insensitive regular expressions, not just literals — which is easy to forget and hard to notice.'
					}
				},
				{
					name: 'scaffold_dictionary',
					desc: 'A custom Hunspell dictionary: the .dic and .aff pair, plus the spelling rule that uses it.',
					example: {
						call: 'scaffold_dictionary\n  name: "acme"\n  words: ["Acme", "kubectl", "deploy/DG"]',
						result:
							'{\n  "files": {\n    "…/dictionaries/acme.dic":\n      "3\\nAcme\\nkubectl\\ndeploy/DG\\n",\n    "…/dictionaries/acme.aff":\n      "SET UTF-8\\nSFX S Y 2\\n…"\n  },\n  "rule": "extends: spelling\\n\n           dictionaries:\\n  - acme\\n",\n  "note": "The .dic first line MUST be the\n           entry count."\n}',
						note: 'The count header on line 1 is required and is the usual reason a hand-written dictionary silently fails to load.'
					}
				},
				{
					name: 'scaffold_filter',
					desc: 'A result filter — an expr-lang expression over alerts.',
					example: {
						call: 'scaffold_filter\n  name: "errors-only"\n  expression: \'.Level == "error" and\n               .Check contains "House"\'',
						result:
							'{\n  "files": {\n    "styles/config/filters/errors-only":\n      ".Level == \\"error\\" and\n       .Check contains \\"House\\"\\n"\n  },\n  "enable": "vale --filter=\'styles/config/\n             filters/errors-only\' …",\n  "note": "fields include .Check, .Level,\n           .Rule, .Message, .Match,\n           .Line, .Span"\n}'
					}
				},
				{
					name: 'scaffold_view',
					desc: 'A view: a named projection of structured or source files, via dasel or tree-sitter.',
					example: {
						call: 'scaffold_view\n  name: "frontmatter"\n  engine: "dasel"\n  scope: "title"\n  expr: ".title"',
						result:
							'{\n  "files": {\n    "styles/config/views/frontmatter.yml":\n      "engine: dasel\\nscopes:\\n\n         - name: title\\n    expr: \\".title\\"\\n"\n  },\n  "enable": "Reference it from a rule\'s scope,\n             e.g. scope: text.view.<name>"\n}',
						note: 'Lets a rule target only the title in your front matter, and leave the body alone.'
					}
				},
				{
					name: 'scaffold_template',
					desc: "An output template that formats Vale's results.",
					example: {
						call: 'scaffold_template\n  name: "compact"',
						result:
							'{\n  "files": {\n    "styles/config/templates/compact.tmpl":\n      "{{- range .Files}}\\n{{.Path}}\\n\n       {{- range .Alerts}}\\n  {{.Line}}:\n       {{.Span.0}}  {{.Severity}}\n       {{.Message}}  ({{.Check}})\\n\n       {{- end}}\\n{{end -}}\\n"\n  },\n  "enable": "vale --output=\'…/compact.tmpl\'"\n}'
					}
				}
			]
		},
		{
			name: 'Verify',
			body: 'The half generation cannot do for itself: does it compile, does it fire, and does it fire on the right things.',
			tools: [
				{
					name: 'test_rule',
					desc: 'Lint each input against the rule alone and check whether it should match — unit tests for one rule.',
					example: {
						call: 'test_rule\n  rule: "tokens: [\'\\\\b[1-9]\\\\b\']"\n  tests:\n    - input: "Select 3 options."\n      expectMatch: true\n    - input: "Use version 1.2.3 of the CLI."\n      expectMatch: false',
						result:
							'[\n  { "pass": true,  "matched": true, "count": 1 },\n\n  { "pass": false, "matched": true, "count": 3,\n    "matches": [\n      { "match": "1", "span": [13, 13] },\n      { "match": "2", "span": [15, 15] },\n      { "match": "3", "span": [17, 17] }\n    ]}\n]',
						note: '\\b treats a dot as a word boundary, so one version number matched three times. Nothing in the YAML tells you that.'
					}
				},
				{
					name: 'stress_rule',
					desc: "Generate near-miss inputs from the rule's own tokens and report the ones it wrongly fires on.",
					example: {
						call: 'stress_rule\n  rule: "tokens: [\'\\\\b[1-9]\\\\b\']"',
						result:
							'{\n  "probed": 9,\n  "clean": 6,\n  "fired": [\n    { "kind": "version",\n      "text": "Use version 1.2.3 of the CLI.",\n      "why": "matched inside a version number" },\n    { "kind": "section",\n      "text": "See section 2.1 for details.",\n      "why": "matched inside a section number" }\n  ]\n}',
						note: 'Examples you write only test what you thought of. These come from the rule itself, which is how they catch what you did not.'
					}
				},
				{
					name: 'diff_rule',
					desc: 'Run both versions of a rule over a corpus and report exactly which alerts the edit adds and removes.',
					example: {
						call: 'diff_rule\n  old_rule: "tokens: [very]"\n  new_rule: "nonword: true\n             tokens: [very]"\n  corpus:\n    docs/intro.md: "…Every release ships…"\n    docs/guide.md: "…with every setting."',
						result:
							'{\n  "added": 2,\n  "removed": 0,\n  "filesAffected": 2,\n  "coverage": "exercised",\n  "files": [\n    { "path": "docs/guide.md",\n      "added": [{ "match": "very",\n                  "line": 1, "span": [23, 26] }]},\n    { "path": "docs/intro.md",\n      "added": [{ "match": "very",\n                  "line": 3, "span": [2, 5] }]}\n  ]\n}',
						note: 'One word added to the rule made "very" match inside "every", twice. `coverage: exercised` says the corpus really tested the change — a clean result on a corpus that did not would prove nothing.'
					}
				},
				{
					name: 'audit_style',
					desc: 'Correctness and performance defects no compile step catches — plus what the style costs before it reads a byte.',
					example: {
						call: 'audit_style\n  files: { "styles/House/Numbers.yml": … }\n  sample: { text: "Select 3 options…" }',
						result:
							'{\n  "findings": [\n    { "costClass": "pattern",\n      "reason": "may backtrack on regexp2\n                 (lookaround)" },\n    { "costClass": "pattern",\n      "reason": "nonword: true drops word\n                 boundaries" }\n  ],\n  "measured": {\n    "compileFloorMs": 0.524,\n    "rules": [{ "lintMs": 0.056, "alerts": 3 }]\n  }\n}',
						note: 'Compile cost is paid on every run whether or not the rule fires — and on a short document it is most of the wall clock.'
					}
				},
				{
					name: 'diagnose_rule',
					desc: 'Compile a rule and report the error — a bad regex, field, or structure — with its position.',
					example: {
						call: 'diagnose_rule\n  rule: "extends: existence\n         tokens:\n           - \'(?<!\\\\bthe )(unclosed\'"',
						result:
							'[\n  {\n    "line": 1,\n    "col": 1,\n    "severity": "error",\n    "message": "error parsing regexp:\n                missing closing ) in\n                `(?m)\\\\b(?:(?<!\\\\bthe )\n                (unclosed)\\\\b`"\n  }\n]',
						note: 'It shows the pattern the engine actually built, wrapper and all — which is where the mismatched paren usually turns out to be.'
					}
				},
				{
					name: 'check_config',
					desc: 'Load a whole proposed project through the engine: does the .vale.ini parse, do references resolve, do the rules compile.',
					example: {
						call: 'check_config\n  config: "StylesPath = styles\n           Vocab = Missing\n           [*]\n           BasedOnStyles = House"\n  files: { "styles/House/Terms.yml": … }',
						result:
							'{\n  "ok": false,\n  "error": "\'config/vocabularies/Missing\'\n            directory does not exist"\n}',
						note: 'A rule can compile perfectly and the project still not load. This is the check that catches the reference nobody created.'
					}
				},
				{
					name: 'lint_text',
					desc: 'The alerts a config actually produces on sample prose — the same output your CI will print.',
					example: {
						call: 'lint_text\n  config: "BasedOnStyles = House"\n  text: "In order to build,\n         simply run make."',
						result:
							'[\n  { "Check": "House.Wordy", "Span": [1, 11],\n    "Message": "Use \'to\' instead of\n                \'In order to\'." },\n  { "Check": "House.Avoid", "Span": [20, 25],\n    "Message": "Don\'t use \'simply\'." }\n]'
					}
				}
			]
		},
		{
			name: 'Understand',
			body: 'Answers about the engine, from the engine — the tags, blocks, and scopes a rule will actually see.',
			tools: [
				{
					name: 'trace_rule',
					desc: 'For a sequence rule: what each slot requires, which words it would accept, and the alerts it produced.',
					example: {
						call: 'trace_rule\n  rule: "extends: sequence\n         tokens:\n           - tag: VB[DZP]\n             pattern: (am|are|is|was|were)\n           - tag: VBN"\n  text: "The report was carefully\n         reviewed by the team."',
						result:
							'words:  The/DT  report/NN  was/VBD\n        carefully/RB  reviewed/VBN …\n\nslot 0  requires  tag: VB[DZP], pattern: …\n        accepts   [2]  ("was")\nslot 1  requires  tag: VBN\n        accepts   [4]  ("reviewed")\n\nalerts: none\n\n"the rule did not fire, though every slot\n accepts some word here: the words that\n satisfy the slots are in the wrong order,\n too far apart, or consumed by another slot"',
						note: 'Both slots match and the rule still stays silent — "carefully" sits between them and there is no skip. That is invisible in the YAML and obvious here.'
					}
				},
				{
					name: 'show_blocks',
					desc: "How a format splits text into the blocks rules run over, with each block's scope.",
					example: {
						call: 'show_blocks\n  text: "First paragraph here.\n\n         Second paragraph here."\n  format: "txt"',
						result:
							'{\n  "format": "txt",\n  "count": 2,\n  "scopes": ["raw.txt", "text.txt"],\n  "note": "the `text` scope covers the whole\n     input: this format does not end a block\n     at a blank line, so a rule can match\n     across what reads as two paragraphs —\n     a pattern joining words with `\\\\s+`…\n     `.md` or `.adoc` splits them."\n}',
						note: 'This is why the same rule behaves in Markdown and misfires in plain text. The format is the bug, not the pattern.'
					}
				},
				{
					name: 'tag_text',
					desc: "Part-of-speech tags from Vale's own tagger — the Penn Treebank tags sequence checks match on.",
					example: {
						call: 'tag_text\n  text: "Does the mistake change the\n         meaning of the quotation?"',
						result:
							'Does       VBZ\nthe        DT\nmistake    NN\nchange     NN    ← not a verb, to Vale\nthe        DT\nmeaning    NN\nof         IN\nquotation  NN',
						note: 'A rule guarding on "a verb follows" will not fire here. That is a tagger disagreement, not a broken rule — and the fix is an exception, not a rewrite.'
					}
				},
				{
					name: 'resolve_config',
					desc: "The configuration the engine actually resolved: which styles apply per glob, and each rule's state after the cascade.",
					example: {
						call: 'resolve_config\n  config: "[*]\n           BasedOnStyles = House\n           [*.md]\n           House.Terms = error\n           House.Wordy = NO"',
						result:
							'glob "*"\n  House.Terms   override  level: error\n  House.Wordy   active\n  → active 1, disabled 0, overridden 1\n\nglob "*.md"\n  House.Terms   override  level: error\n  House.Wordy   disabled\n  → active 0, disabled 1, overridden 1',
						note: 'Precedence the config text does not show you. Answers which rules run in this file, at what level — before you wonder why one never fired.'
					}
				},
				{
					name: 'expand_dictionary',
					desc: 'The exact word forms a Hunspell entry accepts, continuation classes included — before you add the word.',
					example: {
						call: 'expand_dictionary\n  aff: "SFX D Y 2\n        SFX D 0 ed   [^ey]\n        SFX D y ied  [^aeiou]y\n        SFX G Y 1\n        SFX G 0 ing  [^e]"\n  entries: ["deploy/DG", "verify/D"]',
						result:
							'{\n  "expansions": [\n    { "entry": "deploy/DG",\n      "forms": ["deploy", "deploying"] },\n\n    { "entry": "verify/D",\n      "forms": ["verify", "verified"] }\n  ]\n}',
						note: 'No "deployed". The D suffix needs a word not ending in y, or a consonant before the y — "deploy" is neither, so the form you wanted is quietly missing.'
					}
				},
				{
					name: 'explain_check',
					desc: 'What a check type detects, the fields that matter, and a working example rule.',
					example: {
						call: 'explain_check\n  type: "occurrence"',
						result:
							'## occurrence  (Matching)\n\nCounts matches of one token per scope and\nflags when the count is over max (or\nunder min).\n\nSyntax: token (regex) · max · min · scope\n\n  extends: occurrence\n  message: "More than 3 commas."\n  scope: sentence\n  token: \',\'\n  max: 3'
					}
				},
				{
					name: 'list_check_types',
					desc: "All twelve of Vale's check extension points, one line each.",
					example: {
						call: 'list_check_types',
						result:
							'existence      flags every occurrence of the\n               listed patterns\nsubstitution   flags a term, suggests a\n               preferred one\noccurrence     counts matches per scope\nrepetition     flags "the the"\nconsistency    enforces one choice project-wide\nconditional    flags "second" unless "first"\n               appeared\ncapitalization $sentence / $title / $lower …\nreadability    flags when the grade is too high\nspelling       Hunspell, with custom dictionaries\nsequence       an ordered run of tokens, by text,\n               POS tag, or scope\nmetric         a formula over document metrics\nscript         a Tengo program — the escape hatch'
					}
				},
				{
					name: 'project_layout',
					desc: 'Where every asset belongs on disk, and the .vale.ini line that enables it.',
					example: {
						call: 'project_layout',
						result:
							".vale.ini\nstyles/<Style>/<Rule>.yml\nstyles/config/vocabularies/<name>/\n    accept.txt + reject.txt  → Vocab = <name>\nstyles/config/dictionaries/<name>.dic/.aff\n    → spelling rule dictionaries: [<name>]\nstyles/config/filters/<name>\n    → --filter='…/filters/<name>'\nstyles/config/views/<name>.yml\n    → rule scope: …view.<name>\nstyles/config/templates/<name>.tmpl\n    → --output='…/templates/<name>.tmpl'",
						note: 'Call it first when creating an asset: every scaffold_* tool writes to these paths, so nothing lands somewhere the engine will not look.'
					}
				}
			]
		},
		{
			name: 'Change safely',
			body: 'Editing a rule already in use is the risky edit. Compiling proves it is valid; these prove the change is safe.',
			tools: [
				{
					name: 'diff_style',
					desc: 'Two versions of a whole package over a corpus, attributed per rule and per file.',
					example: {
						call: 'diff_style\n  old_files: { …Wordy.yml, Terms.yml }\n  new_deltas:\n    "styles/House/Wordy.yml":\n      "tokens:\n         - very\n         - really"\n  corpus: { docs/a.md, docs/b.md }',
						result:
							'{\n  "added": 1,\n  "removed": 0,\n  "filesAffected": 1,\n  "filesScanned": 2,\n  "rules": [\n    { "rule": "House.Wordy",\n      "added": 1, "removed": 0 }\n  ],\n  "files": [{ "path": "docs/a.md",\n    "added": [{ "match": "really",\n                "line": 1, "span": [23, 28] }]}]\n}',
						note: 'It also reports rules the corpus never triggered, so you know which parts of a clean result mean nothing at all.'
					}
				},
				{
					name: 'render_template',
					desc: "See what an output template produces against a document's real alerts — or the error it fails with.",
					example: {
						call: 'render_template\n  template: "{{range .Files}}{{$p := .Path}}\n              {{range .Alerts}}{{$p}}:{{.Line}}:\n              {{index .Span 0}} [{{.Check}}]\n              {{.Message}}…"\n  text: "In order to build,\n         simply run make."',
						result:
							"input.md:1:20 [House.Avoid]\n    Don't use 'simply'.\ninput.md:1:1  [House.Wordy]\n    Use 'to' instead of 'In order to'.\n1 file(s) linted.",
						note: 'The rendered output, not a description of it — including the compile error when the template has one.'
					}
				},
				{
					name: 'put_files',
					desc: 'Upload a project once and name it by content hash, then send only what changed on every later call.',
					example: {
						call: 'put_files\n  files:\n    "styles/House/Terms.yml": …\n    "styles/House/Wordy.yml": …',
						result:
							'{\n  "ref": "sha256:a6e1d3f67c017eceae6ee406\n          de9333d6ee4174027ecd698bff3…",\n  "files": 2,\n  "bytes": 207,\n  "note": "pass this as `ref` instead of\n           `files`; add `deltas` for edits\n           on top of it"\n}',
						note: 'An edit-and-recheck loop then costs one changed file per call instead of the whole tree. The ref is a content hash, so one you did not create is unguessable.'
					}
				}
			]
		}
	];

	const all = groups.flatMap((g) => g.tools);
	const total = all.length;

	// Opens on a failing example on purpose. A demo where everything passes proves
	// nothing; the argument for the product is that the engine says no.
	let selected = $state('test_rule');
	const current = $derived(all.find((t) => t.name === selected) ?? all[0]);
	const currentGroup = $derived(
		groups.find((g) => g.tools.some((t) => t.name === selected))?.name ?? ''
	);

	// A ~30-line highlighter instead of a syntax-highlighting dependency. These
	// panels hold JSON, a little YAML, and some plain engine output — all of it
	// authored in this file. Shipping Shiki to color that would cost more than
	// the whole section weighs.
	//
	// Order in the alternation is the precedence: quoted strings are matched
	// before "#", so a hash inside a string is not read as a comment.
	const TOKENS =
		/("(?:[^"\\]|\\.)*")(\s*:)?|(#[^\n]*)|(\b\d+(?:\.\d+)?\b)|\b(true|false|null)\b|([←→✓✗•])/g;

	function esc(s: string): string {
		return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	}

	const KEY = 'text-lime-600 dark:text-lime-400';
	const STR = 'text-foreground/85';
	const NUM = 'text-sky-600 dark:text-sky-400';
	const LIT = 'text-violet-600 dark:text-violet-400';
	const DIM = 'text-muted-foreground';
	const MARK = 'text-lime-500';

	function highlight(src: string): string {
		return esc(src)
			.split('\n')
			.map((line) => {
				// Token pass FIRST. It inserts markup whose class attribute is quoted,
				// so anything that scans for quoted strings has to have already run —
				// reversed, this pass re-matches its own output and the class name
				// lands on the page as text.
				const out = line.replace(TOKENS, (m, str, colon, comment, num, lit, mark) => {
					if (str !== undefined)
						return colon
							? `<span class="${KEY}">${str}</span>${colon}`
							: `<span class="${STR}">${str}</span>`;
					if (comment !== undefined) return `<span class="${DIM}">${comment}</span>`;
					if (num !== undefined) return `<span class="${NUM}">${num}</span>`;
					if (lit !== undefined) return `<span class="${LIT}">${lit}</span>`;
					if (mark !== undefined) return `<span class="${MARK}">${mark}</span>`;
					return m;
				});
				// An unquoted YAML-ish key: "  name:" or "  - name:". Anchored at the
				// line start, so it cannot reach inside the markup inserted above.
				return out.replace(
					/^(\s*-?\s*)([A-Za-z_][\w.]*)(:)/,
					(_m, lead, key, colon) => `${lead}<span class="${KEY}">${key}</span>${colon}`
				);
			})
			.join('\n');
	}
</script>

<section id="toolbelt" class="scroll-mt-20 border-b border-border/60 bg-muted/30 py-16 sm:py-20">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="max-w-3xl">
			<h2 class="text-base font-semibold text-lime-500">The MCP surface</h2>
			<p class="mt-2 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
				{total} tools, and every one of them can say &ldquo;no&rdquo;
			</p>
			<p class="mt-5 text-pretty text-lg leading-8 text-muted-foreground">
				An assistant with a documentation search can tell you what Vale <em>should</em> do. These
				tools run the engine, so they answer what it <em>does</em>. Open any of them — every panel
				is a real call and what actually came back.
			</p>
		</div>

		<div class="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
			<div class="flex min-w-0 flex-col gap-5">
				{#each groups as group (group.name)}
					<div>
						<div class="flex items-baseline justify-between gap-4">
							<h3 class="text-sm font-semibold">{group.name}</h3>
							<span class="font-mono text-[11px] text-muted-foreground">
								{group.tools.length} tools
							</span>
						</div>
						<p class="mt-1 text-xs leading-5 text-muted-foreground">{group.body}</p>
						<div class="mt-2.5 flex flex-wrap gap-1.5">
							{#each group.tools as tool (tool.name)}
								<button
									type="button"
									onclick={() => (selected = tool.name)}
									aria-pressed={selected === tool.name}
									class="rounded-md border px-2 py-1 font-mono text-[11.5px] transition-colors {selected ===
									tool.name
										? 'border-lime-500 bg-lime-500/15 font-semibold text-lime-700 dark:text-lime-400'
										: 'border-border/60 bg-background text-foreground hover:border-lime-500/50 hover:bg-lime-500/5'}"
								>
									{tool.name}
								</button>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<div class="min-w-0 lg:sticky lg:top-24 lg:self-start">
				<div class="rounded-2xl border border-border/60 bg-card p-6">
					<div class="flex flex-wrap items-center gap-2">
						<code class="font-mono text-base font-semibold text-lime-600 dark:text-lime-400">
							{current.name}
						</code>
						<span class="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
							{currentGroup}
						</span>
					</div>
					<p class="mt-3 text-sm leading-6 text-muted-foreground">{current.desc}</p>

					<div class="mt-5 overflow-hidden rounded-xl border border-border/60">
						<div
							class="border-b border-border/60 bg-muted/60 px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"
						>
							the call
						</div>
						<pre
							class="overflow-x-auto bg-background p-3 font-mono text-[11.5px] leading-[1.7]"><code
								><!-- eslint-disable-next-line svelte/no-at-html-tags -- authored above, HTML-escaped in highlight() -->{@html highlight(
									current.example.call
								)}</code
							></pre>
						<div
							class="border-y border-border/60 bg-muted/60 px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"
						>
							what came back
						</div>
						<pre
							class="overflow-x-auto bg-background p-3 font-mono text-[11.5px] leading-[1.7]"><code
								>{@html highlight(current.example.result)}</code
							></pre>
					</div>

					{#if current.example.note}
						<p class="mt-3.5 text-sm leading-6 text-muted-foreground">{current.example.note}</p>
					{/if}
				</div>

				<p class="mt-3 text-center text-xs text-muted-foreground">
					Every one of the {total} carries a real call and its real output &middot;
					<a href="https://docs.vale.sh/topics/mcp" class="font-semibold hover:underline">
						full reference &rarr;
					</a>
				</p>
			</div>
		</div>
	</div>
</section>
