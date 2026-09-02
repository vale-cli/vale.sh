/**
 * The measurements behind the Voices announcement at /blog/voices.
 *
 * None of this is written by hand. `before` is fixtures/before.md from the
 * Voices package; each `after` is fixtures/after/<voice>.md, which the
 * package's test suite requires to produce no alerts at all; and `alerts` is
 * the golden file recording what Vale reported on `before` with that voice
 * enabled.
 *
 * Token counts are real BPE counts from script/tokens/count.py in that repo,
 * not an estimate: OpenAI's o200k_base, because Anthropic publishes no
 * offline tokenizer for Claude 3 and later. The prompt measured is
 * no-ai-slop's SKILL.md at b53e265.
 *
 * To refresh after a rule change: run ./test.sh -u in the Voices repo and
 * re-export testdata/ and fixtures/.
 */

export type Alert = { line: number; rule: string; message: string };

/** Blob roots, so every rule and fixture on the page links to its source. */
export const repo = 'https://github.com/jdkato/voices/blob/main';
export const catalog =
	'https://github.com/smixs/awesome-claude-output-styles/blob/main/output-styles';

export type Voice = {
	name: string;
	basedOn: string;
	summary: string;
	/** The rewrite that satisfies this voice, verified clean in CI. */
	after: string;
	/** What Vale reported on the shared draft below. */
	alerts: Alert[];
};

export type Cost = { label: string; tokens: number; when: string };

/** One hedged draft, checked against every voice. */
export const before =
	"# Understanding Why Your Component Keeps Re-Rendering\n\nHere's the thing: it's worth noting that the reason your\nReact component is re-rendering is likely because you're\ncreating a new object reference on each render cycle,\nwhich breaks React's referential equality check — so you\nmay want to consider memoization.\n\nThis is not just a performance problem, it's a\ncorrectness problem. Furthermore, experts agree that a\nrobust approach to this paradigm shift will empower your\nteam to streamline a number of things in the render\npath, underscoring its significance.\n\nIn conclusion, the team made a decision to leverage\nseveral caching solutions.";

export const voices: Voice[] = [
	{
		name: 'Voices',
		basedOn: 'Voices',
		summary:
			'The shared core, on under every voice: inflated words, binary contrasts, throat-clearing, weasel attribution, recap endings.',
		after:
			'# Understanding Why Your Component Keeps Re-Rendering\n\nYour component re-renders because you create a new\nobject on every render, and React compares props by\nreference. A new reference is never equal to the old\none, so the memo check fails and the child renders\nagain.\n\nThe fix is to keep the reference stable. Wrap the object\nin `useMemo` with the values it depends on, or move it\nout of the component if it never changes.',
		alerts: [
			{
				line: 3,
				rule: 'Voices.ThroatClearing',
				message: "Throat-clearing: 'Here's the thing'. Cut it and state the point."
			},
			{
				line: 9,
				rule: 'Voices.BinaryContrast',
				message:
					"Binary contrast: 'is not just a performance problem, it's'. State the second half directly."
			},
			{
				line: 10,
				rule: 'Voices.Weasel',
				message: "Weasel attribution: 'experts agree'. Name the source or cut the claim."
			},
			{
				line: 11,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'strong' instead of 'robust'."
			},
			{
				line: 11,
				rule: 'Voices.Banned',
				message: "Inflated word: 'paradigm shift'. Say the plain thing."
			},
			{
				line: 11,
				rule: 'Voices.Banned',
				message: "Inflated word: 'empower'. Say the plain thing."
			},
			{
				line: 12,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'simplify' instead of 'streamline'."
			},
			{
				line: 13,
				rule: 'Voices.SuperficialAnalysis',
				message: "Superficial analysis: ', underscoring'. Say what it does for the reader."
			},
			{
				line: 15,
				rule: 'Voices.Recap',
				message: "Recap ending: 'In conclusion'. End on the last concrete point."
			},
			{
				line: 15,
				rule: 'Voices.WeakVerbs',
				message: "Weak verb phrase: use 'decided' instead of 'made a decision'."
			},
			{
				line: 15,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'use' instead of 'leverage'."
			}
		]
	},
	{
		name: 'Direct',
		basedOn: 'Voices, Direct',
		summary: 'No hedging, no preamble, sentences under 25 words.',
		after:
			'# Understanding Why Your Component Keeps Re-Rendering\n\nYour component re-renders because you create a new\nobject on every render. React compares props by\nreference, and a new reference is never equal to the old\none. The memo check fails, so the child renders again.\n\nWrap the object in `useMemo` with the values it depends\non. If it never changes, move it out of the component.',
		alerts: [
			{ line: 3, rule: 'Direct.Length', message: 'Sentence runs to 45 words. Split it.' },
			{
				line: 3,
				rule: 'Voices.ThroatClearing',
				message: "Throat-clearing: 'Here's the thing'. Cut it and state the point."
			},
			{
				line: 3,
				rule: 'Direct.Hedging',
				message: "Hedge: 'it's worth noting'. State it, or say why you're unsure."
			},
			{
				line: 3,
				rule: 'Direct.Preamble',
				message: "Preamble: 'the reason your React component is'. Lead with the finding."
			},
			{
				line: 4,
				rule: 'Direct.Hedging',
				message: "Hedge: 'is likely because'. State it, or say why you're unsure."
			},
			{
				line: 7,
				rule: 'Direct.Hedging',
				message: "Hedge: 'may want to consider'. State it, or say why you're unsure."
			},
			{
				line: 9,
				rule: 'Voices.BinaryContrast',
				message:
					"Binary contrast: 'is not just a performance problem, it's'. State the second half directly."
			},
			{ line: 10, rule: 'Direct.Length', message: 'Sentence runs to 28 words. Split it.' },
			{
				line: 10,
				rule: 'Voices.Weasel',
				message: "Weasel attribution: 'experts agree'. Name the source or cut the claim."
			},
			{
				line: 11,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'strong' instead of 'robust'."
			},
			{
				line: 11,
				rule: 'Voices.Banned',
				message: "Inflated word: 'paradigm shift'. Say the plain thing."
			},
			{
				line: 11,
				rule: 'Voices.Banned',
				message: "Inflated word: 'empower'. Say the plain thing."
			},
			{
				line: 12,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'simplify' instead of 'streamline'."
			},
			{
				line: 13,
				rule: 'Voices.SuperficialAnalysis',
				message: "Superficial analysis: ', underscoring'. Say what it does for the reader."
			},
			{
				line: 15,
				rule: 'Voices.Recap',
				message: "Recap ending: 'In conclusion'. End on the last concrete point."
			},
			{
				line: 15,
				rule: 'Voices.WeakVerbs',
				message: "Weak verb phrase: use 'decided' instead of 'made a decision'."
			},
			{
				line: 15,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'use' instead of 'leverage'."
			}
		]
	},
	{
		name: 'GenZ',
		basedOn: 'Voices, GenZ',
		summary: 'One slang term a sentence, two a paragraph, at least one.',
		after:
			'# Understanding Why Your Component Keeps Re-Rendering\n\nYour render path is cooked. You build a new object every\nrender, and React compares props by reference. A new\nreference never equals the old one, so the memo check\nfails and the child renders again.\n\nWrap the object in `useMemo` with the values it depends\non. Stable reference, clean diff, massive W.',
		alerts: [
			{
				line: 1,
				rule: 'GenZ.Presence',
				message: 'A paragraph here has no slang. This voice is not off.'
			},
			{
				line: 3,
				rule: 'Voices.ThroatClearing',
				message: "Throat-clearing: 'Here's the thing'. Cut it and state the point."
			},
			{
				line: 9,
				rule: 'Voices.BinaryContrast',
				message:
					"Binary contrast: 'is not just a performance problem, it's'. State the second half directly."
			},
			{
				line: 10,
				rule: 'GenZ.Register',
				message: "Corporate register: 'Furthermore'. Not this voice."
			},
			{
				line: 10,
				rule: 'Voices.Weasel',
				message: "Weasel attribution: 'experts agree'. Name the source or cut the claim."
			},
			{
				line: 11,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'strong' instead of 'robust'."
			},
			{
				line: 11,
				rule: 'Voices.Banned',
				message: "Inflated word: 'paradigm shift'. Say the plain thing."
			},
			{
				line: 11,
				rule: 'Voices.Banned',
				message: "Inflated word: 'empower'. Say the plain thing."
			},
			{
				line: 12,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'simplify' instead of 'streamline'."
			},
			{
				line: 13,
				rule: 'Voices.SuperficialAnalysis',
				message: "Superficial analysis: ', underscoring'. Say what it does for the reader."
			},
			{
				line: 15,
				rule: 'Voices.Recap',
				message: "Recap ending: 'In conclusion'. End on the last concrete point."
			},
			{
				line: 15,
				rule: 'Voices.WeakVerbs',
				message: "Weak verb phrase: use 'decided' instead of 'made a decision'."
			},
			{
				line: 15,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'use' instead of 'leverage'."
			}
		]
	},
	{
		name: 'Coach',
		basedOn: 'Voices, Coach',
		summary: "One note of at most one hundred words, one image, one 'Next:' action.",
		after:
			'# One note on your serve\n\nYour toss drifts left, so your contact point follows\nit and the serve sprays wide. Hold the finish of your\ntoss arm for a beat; the drift shows up right there.\n\n![Toss drift at contact](toss.png)\n\nNext: film ten serves tonight and count the drifts.',
		alerts: [
			{
				line: 1,
				rule: 'Coach.Image',
				message: 'Found 0 images. A coaching note carries exactly one.'
			},
			{
				line: 1,
				rule: 'Coach.NextAction',
				message: "Found 0 'Next:' lines. A coaching note ends with exactly one."
			},
			{ line: 1, rule: 'Coach.Note', message: '166 words. One note means one hundred words.' },
			{
				line: 3,
				rule: 'Voices.ThroatClearing',
				message: "Throat-clearing: 'Here's the thing'. Cut it and state the point."
			},
			{
				line: 9,
				rule: 'Voices.BinaryContrast',
				message:
					"Binary contrast: 'is not just a performance problem, it's'. State the second half directly."
			},
			{
				line: 10,
				rule: 'Voices.Weasel',
				message: "Weasel attribution: 'experts agree'. Name the source or cut the claim."
			},
			{
				line: 11,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'strong' instead of 'robust'."
			},
			{
				line: 11,
				rule: 'Voices.Banned',
				message: "Inflated word: 'paradigm shift'. Say the plain thing."
			},
			{
				line: 11,
				rule: 'Voices.Banned',
				message: "Inflated word: 'empower'. Say the plain thing."
			},
			{
				line: 12,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'simplify' instead of 'streamline'."
			},
			{
				line: 13,
				rule: 'Voices.SuperficialAnalysis',
				message: "Superficial analysis: ', underscoring'. Say what it does for the reader."
			},
			{
				line: 15,
				rule: 'Voices.Recap',
				message: "Recap ending: 'In conclusion'. End on the last concrete point."
			},
			{
				line: 15,
				rule: 'Voices.WeakVerbs',
				message: "Weak verb phrase: use 'decided' instead of 'made a decision'."
			},
			{
				line: 15,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'use' instead of 'leverage'."
			}
		]
	},
	{
		name: 'Simple',
		basedOn: 'Voices, Simple',
		summary: 'Only the 850 words of Basic English.',
		after:
			'# Why your page part is made again and again\n\nYour part of the page is made again and again. Every\ntime it is made, you give it a new box of values. The\nsystem does not look inside the box. It only sees that\nthe box is new, so it does all the work again.\n\nKeep the same box. Make the box once, and give that same\nbox every time. Then the system sees no change, and it\ndoes no work.',
		alerts: [
			{
				line: 1,
				rule: 'Simple.Vocabulary',
				message: "'Understanding' is outside Basic English. Say it in shorter words."
			},
			{
				line: 1,
				rule: 'Simple.Vocabulary',
				message: "'Component' is outside Basic English. Say it in shorter words."
			},
			{
				line: 3,
				rule: 'Simple.Vocabulary',
				message: "'Here's' is outside Basic English. Say it in shorter words."
			},
			{
				line: 3,
				rule: 'Voices.ThroatClearing',
				message: "Throat-clearing: 'Here's the thing'. Cut it and state the point."
			},
			{
				line: 3,
				rule: 'Simple.Vocabulary',
				message: "'worth' is outside Basic English. Say it in shorter words."
			},
			{
				line: 4,
				rule: 'Simple.Vocabulary',
				message: "'React' is outside Basic English. Say it in shorter words."
			},
			{
				line: 4,
				rule: 'Simple.Vocabulary',
				message: "'component' is outside Basic English. Say it in shorter words."
			},
			{
				line: 4,
				rule: 'Simple.Vocabulary',
				message: "'you're' is outside Basic English. Say it in shorter words."
			},
			{
				line: 5,
				rule: 'Simple.Vocabulary',
				message: "'creating' is outside Basic English. Say it in shorter words."
			},
			{
				line: 5,
				rule: 'Simple.Vocabulary',
				message: "'object' is outside Basic English. Say it in shorter words."
			},
			{
				line: 5,
				rule: 'Simple.Vocabulary',
				message: "'reference' is outside Basic English. Say it in shorter words."
			},
			{
				line: 5,
				rule: 'Simple.Vocabulary',
				message: "'render' is outside Basic English. Say it in shorter words."
			},
			{
				line: 5,
				rule: 'Simple.Vocabulary',
				message: "'cycle' is outside Basic English. Say it in shorter words."
			},
			{
				line: 6,
				rule: 'Simple.Vocabulary',
				message: "'breaks' is outside Basic English. Say it in shorter words."
			},
			{
				line: 6,
				rule: 'Simple.Vocabulary',
				message: "'React's' is outside Basic English. Say it in shorter words."
			},
			{
				line: 6,
				rule: 'Simple.Vocabulary',
				message: "'referential' is outside Basic English. Say it in shorter words."
			},
			{
				line: 6,
				rule: 'Simple.Vocabulary',
				message: "'equality' is outside Basic English. Say it in shorter words."
			},
			{
				line: 6,
				rule: 'Simple.Vocabulary',
				message: "'check' is outside Basic English. Say it in shorter words."
			},
			{
				line: 7,
				rule: 'Simple.Vocabulary',
				message: "'want' is outside Basic English. Say it in shorter words."
			},
			{
				line: 7,
				rule: 'Simple.Vocabulary',
				message: "'consider' is outside Basic English. Say it in shorter words."
			},
			{
				line: 7,
				rule: 'Simple.Vocabulary',
				message: "'memoization' is outside Basic English. Say it in shorter words."
			},
			{
				line: 9,
				rule: 'Voices.BinaryContrast',
				message:
					"Binary contrast: 'is not just a performance problem, it's'. State the second half directly."
			},
			{
				line: 9,
				rule: 'Simple.Vocabulary',
				message: "'just' is outside Basic English. Say it in shorter words."
			},
			{
				line: 9,
				rule: 'Simple.Vocabulary',
				message: "'performance' is outside Basic English. Say it in shorter words."
			},
			{
				line: 9,
				rule: 'Simple.Vocabulary',
				message: "'problem' is outside Basic English. Say it in shorter words."
			},
			{
				line: 10,
				rule: 'Simple.Vocabulary',
				message: "'correctness' is outside Basic English. Say it in shorter words."
			},
			{
				line: 10,
				rule: 'Simple.Vocabulary',
				message: "'problem' is outside Basic English. Say it in shorter words."
			},
			{
				line: 10,
				rule: 'Simple.Vocabulary',
				message: "'Furthermore' is outside Basic English. Say it in shorter words."
			},
			{
				line: 10,
				rule: 'Voices.Weasel',
				message: "Weasel attribution: 'experts agree'. Name the source or cut the claim."
			},
			{
				line: 10,
				rule: 'Simple.Vocabulary',
				message: "'agree' is outside Basic English. Say it in shorter words."
			},
			{
				line: 11,
				rule: 'Simple.Vocabulary',
				message: "'robust' is outside Basic English. Say it in shorter words."
			},
			{
				line: 11,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'strong' instead of 'robust'."
			},
			{
				line: 11,
				rule: 'Simple.Vocabulary',
				message: "'approach' is outside Basic English. Say it in shorter words."
			},
			{
				line: 11,
				rule: 'Simple.Vocabulary',
				message: "'paradigm' is outside Basic English. Say it in shorter words."
			},
			{
				line: 11,
				rule: 'Voices.Banned',
				message: "Inflated word: 'paradigm shift'. Say the plain thing."
			},
			{
				line: 11,
				rule: 'Simple.Vocabulary',
				message: "'shift' is outside Basic English. Say it in shorter words."
			},
			{
				line: 11,
				rule: 'Simple.Vocabulary',
				message: "'empower' is outside Basic English. Say it in shorter words."
			},
			{
				line: 11,
				rule: 'Voices.Banned',
				message: "Inflated word: 'empower'. Say the plain thing."
			},
			{
				line: 12,
				rule: 'Simple.Vocabulary',
				message: "'team' is outside Basic English. Say it in shorter words."
			},
			{
				line: 12,
				rule: 'Simple.Vocabulary',
				message: "'streamline' is outside Basic English. Say it in shorter words."
			},
			{
				line: 12,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'simplify' instead of 'streamline'."
			},
			{
				line: 12,
				rule: 'Simple.Vocabulary',
				message: "'render' is outside Basic English. Say it in shorter words."
			},
			{
				line: 13,
				rule: 'Simple.Vocabulary',
				message: "'path' is outside Basic English. Say it in shorter words."
			},
			{
				line: 13,
				rule: 'Voices.SuperficialAnalysis',
				message: "Superficial analysis: ', underscoring'. Say what it does for the reader."
			},
			{
				line: 13,
				rule: 'Simple.Vocabulary',
				message: "'underscoring' is outside Basic English. Say it in shorter words."
			},
			{
				line: 13,
				rule: 'Simple.Vocabulary',
				message: "'significance' is outside Basic English. Say it in shorter words."
			},
			{
				line: 15,
				rule: 'Voices.Recap',
				message: "Recap ending: 'In conclusion'. End on the last concrete point."
			},
			{
				line: 15,
				rule: 'Simple.Vocabulary',
				message: "'conclusion' is outside Basic English. Say it in shorter words."
			},
			{
				line: 15,
				rule: 'Simple.Vocabulary',
				message: "'team' is outside Basic English. Say it in shorter words."
			},
			{
				line: 15,
				rule: 'Voices.WeakVerbs',
				message: "Weak verb phrase: use 'decided' instead of 'made a decision'."
			},
			{
				line: 15,
				rule: 'Simple.Vocabulary',
				message: "'leverage' is outside Basic English. Say it in shorter words."
			},
			{
				line: 15,
				rule: 'Voices.InflatedWords',
				message: "Inflated word: use 'use' instead of 'leverage'."
			},
			{
				line: 16,
				rule: 'Simple.Vocabulary',
				message: "'several' is outside Basic English. Say it in shorter words."
			},
			{
				line: 16,
				rule: 'Simple.Vocabulary',
				message: "'caching' is outside Basic English. Say it in shorter words."
			},
			{
				line: 16,
				rule: 'Simple.Vocabulary',
				message: "'solutions' is outside Basic English. Say it in shorter words."
			},
			{
				line: 18,
				rule: 'Simple.Vocabulary',
				message: "'considerations' is outside Basic English. Say it in shorter words."
			},
			{
				line: 18,
				rule: 'Simple.Vocabulary',
				message: "'motivating' is outside Basic English. Say it in shorter words."
			},
			{
				line: 18,
				rule: 'Simple.Vocabulary',
				message: "'determination' is outside Basic English. Say it in shorter words."
			},
			{
				line: 19,
				rule: 'Simple.Vocabulary',
				message: "'numerous' is outside Basic English. Say it in shorter words."
			},
			{
				line: 19,
				rule: 'Simple.Vocabulary',
				message: "'multidimensional' is outside Basic English. Say it in shorter words."
			},
			{
				line: 19,
				rule: 'Simple.Vocabulary',
				message: "'necessitating' is outside Basic English. Say it in shorter words."
			},
			{
				line: 19,
				rule: 'Simple.Vocabulary',
				message: "'individual' is outside Basic English. Say it in shorter words."
			},
			{
				line: 20,
				rule: 'Simple.Vocabulary',
				message: "'elaboration' is outside Basic English. Say it in shorter words."
			},
			{
				line: 20,
				rule: 'Simple.Vocabulary',
				message: "'unprecedented' is outside Basic English. Say it in shorter words."
			},
			{
				line: 20,
				rule: 'Simple.Vocabulary',
				message: "'comprehensiveness' is outside Basic English. Say it in shorter words."
			},
			{
				line: 22,
				rule: 'Simple.Vocabulary',
				message: "'initial' is outside Basic English. Say it in shorter words."
			},
			{
				line: 22,
				rule: 'Simple.Vocabulary',
				message: "'consideration' is outside Basic English. Say it in shorter words."
			},
			{
				line: 22,
				rule: 'Simple.Vocabulary',
				message: "'comprehensible' is outside Basic English. Say it in shorter words."
			},
			{
				line: 22,
				rule: 'Simple.Vocabulary',
				message: "'exclusively' is outside Basic English. Say it in shorter words."
			},
			{
				line: 23,
				rule: 'Simple.Vocabulary',
				message: "'subsequent' is outside Basic English. Say it in shorter words."
			},
			{
				line: 23,
				rule: 'Simple.Vocabulary',
				message: "'consideration' is outside Basic English. Say it in shorter words."
			},
			{
				line: 24,
				rule: 'Simple.Vocabulary',
				message: "'subsequent' is outside Basic English. Say it in shorter words."
			},
			{
				line: 24,
				rule: 'Simple.Vocabulary',
				message: "'consideration' is outside Basic English. Say it in shorter words."
			},
			{
				line: 24,
				rule: 'Simple.Vocabulary',
				message: "'substantially' is outside Basic English. Say it in shorter words."
			},
			{
				line: 25,
				rule: 'Simple.Vocabulary',
				message: "'reformulation' is outside Basic English. Say it in shorter words."
			},
			{
				line: 25,
				rule: 'Simple.Vocabulary',
				message: "'initial' is outside Basic English. Say it in shorter words."
			},
			{
				line: 25,
				rule: 'Simple.Vocabulary',
				message: "'consideration' is outside Basic English. Say it in shorter words."
			},
			{
				line: 26,
				rule: 'Simple.Vocabulary',
				message: "'tertiary' is outside Basic English. Say it in shorter words."
			},
			{
				line: 26,
				rule: 'Simple.Vocabulary',
				message: "'consideration' is outside Basic English. Say it in shorter words."
			},
			{
				line: 26,
				rule: 'Simple.Vocabulary',
				message: "'incorporated' is outside Basic English. Say it in shorter words."
			},
			{
				line: 27,
				rule: 'Simple.Vocabulary',
				message: "'organizational' is outside Basic English. Say it in shorter words."
			},
			{
				line: 27,
				rule: 'Simple.Vocabulary',
				message: "'completeness' is outside Basic English. Say it in shorter words."
			},
			{
				line: 28,
				rule: 'Simple.Vocabulary',
				message: "'quaternary' is outside Basic English. Say it in shorter words."
			},
			{
				line: 28,
				rule: 'Simple.Vocabulary',
				message: "'consideration' is outside Basic English. Say it in shorter words."
			},
			{
				line: 28,
				rule: 'Simple.Vocabulary',
				message: "'enumerations' is outside Basic English. Say it in shorter words."
			},
			{
				line: 29,
				rule: 'Simple.Vocabulary',
				message: "'communicate' is outside Basic English. Say it in shorter words."
			},
			{
				line: 29,
				rule: 'Simple.Vocabulary',
				message: "'methodological' is outside Basic English. Say it in shorter words."
			},
			{
				line: 29,
				rule: 'Simple.Vocabulary',
				message: "'rigorousness' is outside Basic English. Say it in shorter words."
			},
			{
				line: 30,
				rule: 'Simple.Vocabulary',
				message: "'quinary' is outside Basic English. Say it in shorter words."
			},
			{
				line: 30,
				rule: 'Simple.Vocabulary',
				message: "'consideration' is outside Basic English. Say it in shorter words."
			},
			{
				line: 31,
				rule: 'Simple.Vocabulary',
				message: "'comprehensively' is outside Basic English. Say it in shorter words."
			},
			{
				line: 31,
				rule: 'Simple.Vocabulary',
				message: "'evaporated' is outside Basic English. Say it in shorter words."
			}
		]
	}
];

export const costs: Cost[] = [
	{
		label: 'no-ai-slop SKILL.md, as loaded',
		tokens: 2418,
		when: 'every session, whether or not it applies'
	},
	{
		label: 'The same rules as a generated brief',
		tokens: 482,
		when: 'every session, and only if you want priming'
	},
	{
		label: 'Alerts on the draft above',
		tokens: 459,
		when: 'only when something is wrong'
	},
	{
		label: 'Alerts on the rewrite',
		tokens: 0,
		when: 'never'
	}
];

/** The entries in awesome-claude-output-styles that map onto a voice. */
export type Coverage = {
	styles: string[];
	voice: string;
	why: string;
	/** The upstream this voice was written from, and the terms it carries. */
	source: { spdx: string; holder: string; href: string };
};

/**
 * GitHub reports the catalogue as NOASSERTION because a credits preamble sits
 * above the MIT text, but the licence itself is MIT.
 */
const CATALOG_MIT = {
	spdx: 'MIT',
	holder: 'Serge Shima',
	href: 'https://github.com/smixs/awesome-claude-output-styles/blob/main/LICENSE'
};

const SLOP_MIT = {
	spdx: 'MIT',
	holder: 'Peter Yang',
	href: 'https://github.com/petergyang/no-ai-slop/blob/main/LICENSE'
};

export const coverage: Coverage[] = [
	{
		styles: ['no-ai-slop', 'no-slop'],
		voice: 'Voices + Direct',
		why: 'Enumerated words and patterns',
		source: SLOP_MIT
	},
	{
		styles: ['gen-z', 'street'],
		voice: 'GenZ',
		source: CATALOG_MIT,
		why: 'The density budget, not the persona'
	},
	{
		styles: ['coach'],
		voice: 'Coach',
		source: CATALOG_MIT,
		why: 'One note, one image, one next action'
	},
	{
		styles: ['thing-explainer'],
		voice: 'Simple',
		source: CATALOG_MIT,
		why: 'A closed vocabulary'
	}
];
