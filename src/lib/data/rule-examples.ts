/**
 * The twelve `extends` values Vale accepts, each with a real rule body, for
 * the gallery on /features/extensible. Every example is something you could
 * paste into a file and run — not a schematic.
 */
export type RuleExample = {
	id: string;
	summary: string;
	body: string;
	yaml: string;
	alert: string;
};

export const ruleExamples: RuleExample[] = [
	{
		id: 'existence',
		summary: 'Flag anything that matches',
		body: 'The workhorse. A list of tokens—literal or regular expressions—that should not appear.',
		yaml: `extends: existence
message: "Consider removing '%s'"
level: warning
ignorecase: true
tokens:
  - actually
  - basically
  - essentially
  - clearly`,
		alert: "warning  Consider removing 'basically'"
	},
	{
		id: 'substitution',
		summary: 'Prefer this over that',
		body: 'A mapping from what people write to what your style guide wants. The message names both.',
		yaml: `extends: substitution
message: "Use '%s' instead of '%s'."
level: error
ignorecase: true
swap:
  Javascript: JavaScript
  utilize: use
  in order to: to`,
		alert: "error  Use 'JavaScript' instead of 'Javascript'."
	},
	{
		id: 'capitalization',
		summary: 'Enforce a heading style',
		body: 'Title case, sentence case, or a pattern of your own—with AP or Chicago rules for title case, and an exception list.',
		yaml: `extends: capitalization
message: "'%s' should be in sentence case"
level: warning
scope: heading
match: $sentence
exceptions:
  - Vale
  - Markdown`,
		alert: "warning  'Getting Started With Vale' should be in sentence case"
	},
	{
		id: 'occurrence',
		summary: 'Count, then complain',
		body: 'How many times a pattern may appear in a scope. Sentence-level limits are where this earns its keep.',
		yaml: `extends: occurrence
message: 'More than 3 commas!'
level: error
scope: sentence
max: 3
token: ','`,
		alert: 'error  More than 3 commas!'
	},
	{
		id: 'repetition',
		summary: 'Catch the the duplicates',
		body: 'Repeated tokens, with an action attached so an editor can offer the fix.',
		yaml: `extends: repetition
message: "'%s' is repeated!"
level: error
alpha: true
action:
  name: edit
  params: [truncate, ' ']
tokens:
  - '[^\\s.!?]+'`,
		alert: "error  'the' is repeated!"
	},
	{
		id: 'consistency',
		summary: 'Pick one and stick to it',
		body: 'Two spellings that are both fine, but not in the same document. Vale flags whichever showed up second.',
		yaml: `extends: consistency
message: "Inconsistent spelling of '%s'."
level: error
ignorecase: true
either:
  advisor: adviser
  centre: center`,
		alert: "error  Inconsistent spelling of 'adviser'."
	},
	{
		id: 'conditional',
		summary: 'If this, then that',
		body: 'The existence of one pattern requires the existence of another—the standard way to enforce that an acronym is defined before it is used.',
		yaml: `extends: conditional
message: "'%s' has no definition"
level: error
scope: text
# An acronym ...
first: '\\b([A-Z]{3,5})\\b'
# ... requires an expansion.
second: '(?:\\b[A-Z][a-z]+ )+\\(([A-Z]{3,5})\\)'
exceptions:
  - API
  - CLI`,
		alert: "error  'HTTP' has no definition"
	},
	{
		id: 'sequence',
		summary: 'Match on grammar',
		body: 'Patterns over part-of-speech tags, not just words. This is how you catch a construction rather than a phrase.',
		yaml: `extends: sequence
message: |
  The infinitive '%[4]s' after 'be' requires 'to'.
  Did you mean '%[2]s %[3]s *to* %[4]s'?
tokens:
  - tag: MD
  - pattern: be
  - tag: JJ
  - tag: VB|VBN`,
		alert: "error  The infinitive 'use' after 'be' requires 'to'."
	},
	{
		id: 'spelling',
		summary: 'Spell-check with your words',
		body: 'Hunspell dictionaries, plus your own vocabulary. Suggestions are computed at alert time, so an editor can offer them.',
		yaml: `extends: spelling
message: "Did you really mean '%s'?"
level: error
action:
  name: suggest
  params: [spellings]
ignore:
  - vocab.txt`,
		alert: "error  Did you really mean 'recieve'?"
	},
	{
		id: 'readability',
		summary: 'Score the whole document',
		body: 'Five named metrics—Flesch-Kincaid, Gunning Fog, Coleman-Liau, SMOG, and Automated Readability—averaged across the ones you list, with a grade-level ceiling.',
		yaml: `extends: readability
message: "Grade level (%s) too high!"
level: warning
grade: 8
metrics:
  - Flesch-Kincaid
  - Gunning Fog`,
		alert: 'warning  Grade level (12.4) too high!'
	},
	{
		id: 'metric',
		summary: 'Write your own formula',
		body: 'Document-level counts—words, sentences, syllables, paragraphs—combined however you like, with a condition to test.',
		yaml: `extends: metric
message: 'Keep the grade level (%s) below 8.'
formula: |
  (0.39 * (words / sentences)) +
  (11.8 * (syllables / words)) - 15.59
condition: '> 8.0'`,
		alert: 'warning  Keep the grade level (9.1) below 8.'
	},
	{
		id: 'script',
		summary: 'Drop down to code',
		body: 'When a rule needs real logic, write it in Tengo. The script is compiled once and cloned per block, so it stays cheap.',
		yaml: `extends: script
message: 'Consider a new section heading here.'
link: https://tengolang.com
scope: raw
script: LongSection.tengo`,
		alert: 'suggestion  Consider a new section heading here.'
	}
];
