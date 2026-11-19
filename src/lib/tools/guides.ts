/**
 * What five style guides say about the questions writers actually argue over.
 *
 * Every Google, Microsoft, and Red Hat position that names a `rule` is one the
 * guide's Vale package enforces: the rule's own message and link (see
 * src/lib/data/packages.json) are where the wording here comes from. AP and
 * Chicago are sold by subscription, so their entries summarise the published
 * rule and link to the guide's site instead of to a section.
 *
 * `stance` is a coarse bucket so the table can show agreement at a glance;
 * `says` is the guide's actual position. Leave a guide out of a topic when it
 * has no stated rule — an empty cell is more honest than a guess.
 */

export const guides = [
	{
		id: 'google',
		name: 'Google',
		full: 'Google developer documentation style guide',
		audience: 'Developer docs',
		href: 'https://developers.google.com/style',
		package: 'Google'
	},
	{
		id: 'microsoft',
		name: 'Microsoft',
		full: 'Microsoft Writing Style Guide',
		audience: 'Product and developer docs',
		href: 'https://learn.microsoft.com/en-us/style-guide/welcome/',
		package: 'Microsoft'
	},
	{
		id: 'redhat',
		name: 'Red Hat',
		full: 'Red Hat supplementary style guide',
		audience: 'Product docs',
		href: 'https://redhat-documentation.github.io/supplementary-style-guide/',
		package: 'RedHat'
	},
	{
		id: 'ap',
		name: 'AP',
		full: 'The Associated Press Stylebook',
		audience: 'News and marketing',
		href: 'https://www.apstylebook.com',
		package: null
	},
	{
		id: 'chicago',
		name: 'Chicago',
		full: 'The Chicago Manual of Style, 18th edition',
		audience: 'Books and long-form',
		href: 'https://www.chicagomanualofstyle.org',
		package: null
	}
] as const;

export type GuideId = (typeof guides)[number]['id'];

/** yes / no answer the topic's question; `varies` is "it depends". */
export type Stance = 'yes' | 'no' | 'varies';

export type Position = {
	stance: Stance;
	/** The short answer shown in the cell. */
	says: string;
	/** The Vale rule that enforces it, as Package.Rule. */
	rule?: string;
	/**
	 * The section of the guide, when it is public. A `rule` with a link of its
	 * own in packages.json takes precedence: see the page's +page.server.ts.
	 */
	href?: string;
};

export type Topic = {
	id: string;
	category: 'Punctuation' | 'Capitalization' | 'Word choice' | 'Numbers and dates' | 'Voice';
	/** Phrased so `yes` and `no` are answers to it. */
	question: string;
	/** The same sentence written both ways. */
	example: { yes: string; no: string };
	positions: Partial<Record<GuideId, Position>>;
};

const G = 'https://developers.google.com/style';
const M = 'https://learn.microsoft.com/en-us/style-guide';

export const topics: Topic[] = [
	{
		id: 'oxford-comma',
		category: 'Punctuation',
		question: 'Use the Oxford (serial) comma?',
		example: { yes: 'Install, configure, and run.', no: 'Install, configure and run.' },
		positions: {
			google: { stance: 'yes', says: 'Always.', rule: 'Google.OxfordComma', href: `${G}/commas` },
			microsoft: {
				stance: 'yes',
				says: 'Always.',
				rule: 'Microsoft.OxfordComma',
				href: `${M}/punctuation/commas`
			},
			redhat: { stance: 'yes', says: 'Always.', rule: 'RedHat.OxfordComma' },
			ap: {
				stance: 'no',
				says: 'Not in a simple series. Add it only when a sentence is unclear without it.'
			},
			chicago: { stance: 'yes', says: 'Strongly recommended.' }
		}
	},
	{
		id: 'em-dash-spacing',
		category: 'Punctuation',
		question: 'Put spaces around an em dash?',
		example: { yes: 'The build — all of it — failed.', no: 'The build—all of it—failed.' },
		positions: {
			google: { stance: 'no', says: 'No spaces.', rule: 'Google.EmDash', href: `${G}/dashes` },
			microsoft: {
				stance: 'no',
				says: 'No spaces.',
				rule: 'Microsoft.Dashes',
				href: `${M}/punctuation/dashes-hyphens/emes`
			},
			redhat: {
				stance: 'varies',
				says: 'Don’t use em dashes at all. Use commas, parentheses, or a colon.',
				rule: 'RedHat.EmDash'
			},
			ap: { stance: 'yes', says: 'A space on both sides.' },
			chicago: { stance: 'no', says: 'No spaces.' }
		}
	},
	{
		id: 'quote-punctuation',
		category: 'Punctuation',
		question: 'Put periods and commas inside closing quotation marks?',
		example: { yes: 'She called it “done.”', no: 'She called it “done”.' },
		positions: {
			google: {
				stance: 'yes',
				says: 'Inside, in American style.',
				rule: 'Google.Quotes',
				href: `${G}/quotation-marks`
			},
			microsoft: {
				stance: 'yes',
				says: 'Inside.',
				rule: 'Microsoft.Quotes',
				href: `${M}/punctuation/quotation-marks`
			},
			ap: { stance: 'yes', says: 'Always inside.' },
			chicago: { stance: 'yes', says: 'Inside, in American style.' }
		}
	},
	{
		id: 'ellipsis',
		category: 'Punctuation',
		question: 'Use an ellipsis in running text?',
		example: { yes: 'Wait for it…', no: 'Wait for it.' },
		positions: {
			google: {
				stance: 'no',
				says: 'In general, don’t.',
				rule: 'Google.Ellipses',
				href: `${G}/ellipses`
			},
			microsoft: {
				stance: 'no',
				says: 'In general, don’t.',
				rule: 'Microsoft.Ellipses',
				href: `${M}/punctuation/ellipses`
			},
			redhat: {
				stance: 'varies',
				says: 'Only to show omitted words.',
				rule: 'RedHat.Ellipses'
			},
			ap: { stance: 'varies', says: 'For omitted words: three periods with a space on each side.' },
			chicago: { stance: 'varies', says: 'For omitted words: three spaced periods.' }
		}
	},
	{
		id: 'exclamation',
		category: 'Punctuation',
		question: 'Use exclamation points?',
		example: { yes: 'Your build passed!', no: 'Your build passed.' },
		positions: {
			google: {
				stance: 'no',
				says: 'Not in text.',
				rule: 'Google.Exclamation',
				href: `${G}/exclamation-points`
			},
			microsoft: {
				stance: 'varies',
				says: 'Sparingly.',
				rule: 'Microsoft.ExclamationPoints',
				href: `${M}/punctuation/exclamation-points`
			},
			ap: { stance: 'varies', says: 'Sparingly, for real surprise or strong emotion.' },
			chicago: { stance: 'varies', says: 'Sparingly.' }
		}
	},
	{
		id: 'sentence-spacing',
		category: 'Punctuation',
		question: 'One space after a period?',
		example: { yes: 'It works. Ship it.', no: 'It works.  Ship it.' },
		positions: {
			google: {
				stance: 'yes',
				says: 'One.',
				rule: 'Google.Spacing',
				href: `${G}/sentence-spacing`
			},
			microsoft: {
				stance: 'yes',
				says: 'One.',
				rule: 'Microsoft.Spacing',
				href: `${M}/punctuation/periods`
			},
			redhat: { stance: 'yes', says: 'One.', rule: 'RedHat.Spacing' },
			ap: { stance: 'yes', says: 'One.' },
			chicago: { stance: 'yes', says: 'One.' }
		}
	},
	{
		id: 'heading-case',
		category: 'Capitalization',
		question: 'Write headings in sentence case?',
		example: { yes: 'Install the command-line tool', no: 'Install the Command-Line Tool' },
		positions: {
			google: {
				stance: 'yes',
				says: 'Sentence case.',
				rule: 'Google.Headings',
				href: `${G}/capitalization`
			},
			microsoft: {
				stance: 'yes',
				says: 'Sentence case.',
				rule: 'Microsoft.Headings',
				href: `${M}/capitalization`
			},
			redhat: { stance: 'yes', says: 'Sentence case.', rule: 'RedHat.Headings' },
			ap: {
				stance: 'yes',
				says: 'Sentence case for news headlines. Title case for the titles of books and other works.'
			},
			chicago: { stance: 'no', says: 'Title case (headline style).' }
		}
	},
	{
		id: 'heading-punctuation',
		category: 'Capitalization',
		question: 'End a heading with a period?',
		example: { yes: 'Install the tool.', no: 'Install the tool' },
		positions: {
			google: {
				stance: 'no',
				says: 'No.',
				rule: 'Google.HeadingPunctuation',
				href: `${G}/capitalization`
			},
			microsoft: {
				stance: 'no',
				says: 'No end punctuation.',
				rule: 'Microsoft.HeadingPunctuation',
				href: `${M}/punctuation/periods`
			},
			redhat: {
				stance: 'no',
				says: 'No end punctuation.',
				rule: 'RedHat.HeadingPunctuation'
			},
			ap: { stance: 'no', says: 'No.' },
			chicago: { stance: 'no', says: 'No.' }
		}
	},
	{
		id: 'abbreviation-periods',
		category: 'Capitalization',
		question: 'Put periods in uppercase abbreviations?',
		example: { yes: 'Made in the U.S.', no: 'Made in the US' },
		positions: {
			google: {
				stance: 'no',
				says: 'No periods in acronyms or initialisms.',
				rule: 'Google.Periods',
				href: `${G}/abbreviations`
			},
			redhat: {
				stance: 'no',
				says: 'No periods.',
				rule: 'RedHat.Abbreviations'
			},
			ap: {
				stance: 'varies',
				says: 'Periods in most two-letter abbreviations (U.S., U.N.), none in longer ones (FBI).'
			},
			chicago: { stance: 'no', says: 'No periods in abbreviations set in capitals.' }
		}
	},
	{
		id: 'contractions',
		category: 'Word choice',
		question: 'Use contractions?',
		example: { yes: 'It’s ready when you’re done.', no: 'It is ready when you are done.' },
		positions: {
			google: {
				stance: 'yes',
				says: 'Yes, the common ones.',
				rule: 'Google.Contractions',
				href: `${G}/contractions`
			},
			microsoft: {
				stance: 'yes',
				says: 'Yes. They set a friendly tone.',
				rule: 'Microsoft.Contractions',
				href: `${M}/word-choice/use-contractions`
			},
			redhat: {
				stance: 'no',
				says: 'Avoid them.',
				rule: 'RedHat.Contractions'
			},
			ap: { stance: 'varies', says: 'Fine in informal contexts. Don’t overdo them.' },
			chicago: { stance: 'yes', says: 'Yes. Most writing reads better with them.' }
		}
	},
	{
		id: 'latin',
		category: 'Word choice',
		question: 'Use Latin abbreviations such as e.g. and i.e.?',
		example: { yes: 'Use a linter, e.g., Vale.', no: 'Use a linter, for example, Vale.' },
		positions: {
			google: {
				stance: 'no',
				says: 'Write “for example” and “that is.”',
				rule: 'Google.Latin',
				href: `${G}/abbreviations`
			},
			microsoft: {
				stance: 'no',
				says: 'Write “for example” and “that is.”',
				rule: 'Microsoft.Foreign',
				href: `${M}/word-choice/use-us-spelling-avoid-non-english-words`
			},
			ap: { stance: 'yes', says: 'Yes, each followed by a comma.' },
			chicago: { stance: 'varies', says: 'Only inside parentheses and notes.' }
		}
	},
	{
		id: 'ui-verb',
		category: 'Word choice',
		question: 'Say “select” instead of “click”?',
		example: { yes: 'Select Save.', no: 'Click Save.' },
		positions: {
			google: {
				stance: 'no',
				says: '“Click” for a mouse, “tap” for a touchscreen.',
				href: `${G}/word-list`
			},
			microsoft: {
				stance: 'yes',
				says: '“Select,” whatever the input device.',
				rule: 'Microsoft.UIVerbs',
				href: `${M}/procedures-instructions/describing-interactions-with-ui`
			}
		}
	},
	{
		id: 'sign-in',
		category: 'Word choice',
		question: 'Say “sign in” instead of “log in”?',
		example: { yes: 'Sign in to your account.', no: 'Log in to your account.' },
		positions: {
			google: {
				stance: 'yes',
				says: '“Sign in.”',
				rule: 'Google.WordList',
				href: `${G}/word-list`
			},
			microsoft: {
				stance: 'yes',
				says: '“Sign in.”',
				href: `${M}/a-z-word-list-term-collections/s/sign-in-sign-out`
			},
			redhat: { stance: 'no', says: '“Log in.”' },
			ap: { stance: 'no', says: '“Log in” as a verb, “login” as a noun.' }
		}
	},
	{
		id: 'ampersand',
		category: 'Word choice',
		question: 'Use “&” in place of “and”?',
		example: { yes: 'Search & replace', no: 'Search and replace' },
		positions: {
			google: {
				stance: 'no',
				says: 'No, unless it is in a name or the UI.',
				href: `${G}/word-list`
			},
			microsoft: { stance: 'no', says: 'No, unless it is in a name or the UI.' },
			redhat: { stance: 'no', says: 'No.', rule: 'RedHat.Symbols' },
			ap: { stance: 'no', says: 'Only when it is part of a formal name.' },
			chicago: { stance: 'no', says: 'Only when it is part of a formal name.' }
		}
	},
	{
		id: 'numbers',
		category: 'Numbers and dates',
		question: 'Spell out numbers below 10?',
		example: { yes: 'Run three jobs on 12 machines.', no: 'Run 3 jobs on 12 machines.' },
		positions: {
			google: { stance: 'yes', says: 'Spell out zero through nine.', href: `${G}/numbers` },
			microsoft: { stance: 'yes', says: 'Spell out zero through nine.', href: `${M}/numbers` },
			ap: { stance: 'yes', says: 'Spell out one through nine.' },
			chicago: { stance: 'varies', says: 'Spell out zero through one hundred.' }
		}
	},
	{
		id: 'ordinals',
		category: 'Numbers and dates',
		question: 'Use an ordinal in a date?',
		example: { yes: 'Released on July 31st.', no: 'Released on July 31.' },
		positions: {
			google: { stance: 'no', says: 'No.', href: `${G}/dates-times` },
			microsoft: {
				stance: 'no',
				says: 'No.',
				rule: 'Microsoft.DateNumbers',
				href: `${M}/numbers`
			},
			ap: { stance: 'no', says: 'No.' },
			chicago: { stance: 'no', says: 'No.' }
		}
	},
	{
		id: 'month-names',
		category: 'Numbers and dates',
		question: 'Abbreviate the month in a date?',
		example: { yes: 'Jan. 31, 2026', no: 'January 31, 2026' },
		positions: {
			google: {
				stance: 'no',
				says: 'Spell it out: July 31, 2016.',
				rule: 'Google.DateFormat',
				href: `${G}/dates-times`
			},
			microsoft: {
				stance: 'no',
				says: 'Spell it out: July 31, 2016.',
				rule: 'Microsoft.DateOrder',
				href: `${M}/numbers`
			},
			ap: {
				stance: 'yes',
				says: 'With a specific date, abbreviate Jan., Feb., Aug., Sept., Oct., Nov., and Dec.'
			},
			chicago: { stance: 'no', says: 'Spell it out in running text.' }
		}
	},
	{
		id: 'am-pm',
		category: 'Numbers and dates',
		question: 'Write AM and PM in capitals without periods?',
		example: { yes: 'The window opens at 9 AM.', no: 'The window opens at 9 a.m.' },
		positions: {
			google: {
				stance: 'yes',
				says: 'AM and PM, after a space.',
				rule: 'Google.AMPM',
				href: `${G}/word-list`
			},
			microsoft: { stance: 'yes', says: 'AM and PM, after a space.', rule: 'Microsoft.AMPM' },
			ap: { stance: 'no', says: 'a.m. and p.m.' },
			chicago: { stance: 'no', says: 'a.m. and p.m., or small capitals.' }
		}
	},
	{
		id: 'second-person',
		category: 'Voice',
		question: 'Address the reader as “you”?',
		example: { yes: 'You can change this later.', no: 'The user can change this later.' },
		positions: {
			google: { stance: 'yes', says: 'Yes. Avoid “we.”', rule: 'Google.We', href: `${G}/pronouns` },
			microsoft: {
				stance: 'yes',
				says: 'Yes. Use first person sparingly.',
				rule: 'Microsoft.We',
				href: `${M}/grammar/person`
			}
		}
	},
	{
		id: 'passive',
		category: 'Voice',
		question: 'Prefer the active voice?',
		example: { yes: 'The server sends a reply.', no: 'A reply is sent by the server.' },
		positions: {
			google: {
				stance: 'yes',
				says: 'In general, yes.',
				rule: 'Google.Passive',
				href: `${G}/voice`
			},
			microsoft: { stance: 'yes', says: 'Yes.', rule: 'Microsoft.Passive' },
			redhat: {
				stance: 'yes',
				says: 'In general, yes.',
				rule: 'RedHat.PassiveVoice'
			}
		}
	},
	{
		id: 'future-tense',
		category: 'Voice',
		question: 'Write in the present tense instead of “will”?',
		example: { yes: 'The command returns a list.', no: 'The command will return a list.' },
		positions: {
			google: {
				stance: 'yes',
				says: 'Yes. Avoid “will.”',
				rule: 'Google.Will',
				href: `${G}/tense`
			},
			microsoft: { stance: 'yes', says: 'Yes.' }
		}
	},
	{
		id: 'singular-they',
		category: 'Voice',
		question: 'Use singular “they” for a person of unknown gender?',
		example: {
			yes: 'Each user sets their own password.',
			no: 'Each user sets his or her own password.'
		},
		positions: {
			google: { stance: 'yes', says: 'Yes.', rule: 'Google.Gender', href: `${G}/pronouns` },
			microsoft: {
				stance: 'yes',
				says: 'Yes, or rewrite in the plural.',
				rule: 'Microsoft.Gender',
				href: `${M}/grammar/nouns-pronouns`
			},
			ap: { stance: 'varies', says: 'Acceptable when rewording would be awkward.' },
			chicago: { stance: 'yes', says: 'Yes, as of the 18th edition.' }
		}
	}
];

export const categories = [...new Set(topics.map((t) => t.category))];

/** How many of the topics two guides both rule on, and how many they agree on. */
export function agreement(a: GuideId, b: GuideId) {
	let shared = 0;
	let same = 0;
	for (const t of topics) {
		const pa = t.positions[a];
		const pb = t.positions[b];
		if (!pa || !pb) continue;
		shared++;
		if (pa.stance === pb.stance) same++;
	}
	return { shared, same };
}
