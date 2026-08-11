/**
 * The extension points the landing page puts on a carousel.
 *
 * These five were chosen against one question: could a regular expression do
 * this? None of them can. `sequence` needs a part-of-speech tagger,
 * `conditional` needs a second pattern found elsewhere in the file,
 * `consistency` needs to remember what it already saw, `metric` is arithmetic
 * rather than matching, and `script` is a program. The token-list rules people
 * think of as "all Vale does" are on /features/extensible with the other
 * seven.
 *
 * Every rule, sample, and alert below was produced by running Vale v3.17.0
 * over the sample text with that exact rule. The alert messages and levels are
 * its output, not paraphrases of it.
 */
export type Sample = {
	text: string;
	/** The substring the alert points at, underlined in the panel. Omitted for
	 * document-level alerts, which point at 1:1 rather than at a span. */
	mark?: string;
};

export type ExtensionPoint = {
	id: string;
	/** Why this one is not a pattern match. One line, shown above the rule. */
	claim: string;
	yaml: string;
	sample: Sample[];
	alert: { level: 'error' | 'warning' | 'suggestion'; message: string };
	/** The punchline: what the reader should notice about the alert. */
	note: string;
};

/* The paragraph `metric` and `script` both run against. 42 words, deliberately:
   the script's threshold is 40, so a shorter one demonstrates nothing. */
const longParagraph =
	'Notwithstanding the aforementioned considerations regarding deployment, the implementation necessitates a comprehensive understanding of the underlying architecture and its associated operational characteristics, which must be evaluated in their entirety prior to the commencement of any migration activity undertaken by the platform engineering team.';

export const extensionPoints: ExtensionPoint[] = [
	{
		id: 'sequence',
		claim: 'Matches grammar, not characters',
		yaml: `extends: sequence
message: "Use 'meetup' instead of 'meet up'."
level: error
tokens:
  - upos: NOUN
    pattern: meet
  - pattern: up`,
		sample: [
			{ text: 'Our next meet up is on Tuesday.', mark: 'meet up' },
			{ text: "Let's meet up on Tuesday." }
		],
		alert: { level: 'error', message: "Use 'meetup' instead of 'meet up'." },
		note: "One alert, not two: 'meet' is a noun in the first sentence and a verb in the second."
	},
	{
		id: 'conditional',
		claim: 'One pattern requires another',
		yaml: `extends: conditional
message: "'%s' has no definition."
level: error
scope: text
first: '\\b([A-Z]{3,5})\\b'
second: '(?:\\b[A-Z][a-z]+ )+\\(([A-Z]{3,5})\\)'
exceptions:
  - API`,
		sample: [{ text: 'The HTTP endpoint requires an API key.', mark: 'HTTP' }],
		alert: { level: 'error', message: "'HTTP' has no definition." },
		note: 'An acronym is allowed only once its expansion appears somewhere in the file.'
	},
	{
		id: 'consistency',
		claim: 'The file has a memory',
		yaml: `extends: consistency
message: "Inconsistent spelling of '%s'."
level: error
either:
  advisor: adviser`,
		sample: [
			{ text: 'Ask your advisor about it.' },
			{ text: 'Then ask a different adviser.', mark: 'adviser' }
		],
		alert: { level: 'error', message: "Inconsistent spelling of 'adviser'." },
		note: 'Neither spelling is wrong. Using both in one file is.'
	},
	{
		id: 'metric',
		claim: 'Arithmetic over the whole file',
		yaml: `extends: metric
message: "Grade level (%s) is above 8."
level: warning
formula: |
  (0.39 * (words / sentences)) +
  (11.8 * (syllables / words)) - 15.59
condition: "> 8"`,
		sample: [{ text: longParagraph }],
		alert: { level: 'warning', message: 'Grade level (31.41) is above 8.' },
		note: 'Counted, not matched—words, sentences, and syllables across the document.'
	},
	{
		id: 'script',
		claim: 'Drop down to real code',
		yaml: `extends: script
message: "This paragraph runs long—consider splitting it."
level: suggestion
scope: raw
script: |
  text := import("text")
  matches := []
  for line in text.split(scope, "\\n") {
    if len(text.split(line, " ")) > 40 {
      i := text.index(scope, line)
      matches = append(matches, {begin: i, end: i + len(line)})
    }
  }`,
		sample: [{ text: longParagraph }],
		alert: { level: 'suggestion', message: 'This paragraph runs long—consider splitting it.' },
		note: 'Tengo, compiled once when the rule loads and cloned per block.'
	}
];
