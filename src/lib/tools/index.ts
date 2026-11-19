import Bot from 'lucide-svelte/icons/bot';
import Hash from 'lucide-svelte/icons/hash';
import BookOpenCheck from 'lucide-svelte/icons/book-open-check';
import CaseSensitive from 'lucide-svelte/icons/case-sensitive';
import Speech from 'lucide-svelte/icons/speech';
import LetterText from 'lucide-svelte/icons/letter-text';
import Timer from 'lucide-svelte/icons/timer';
import MicVocal from 'lucide-svelte/icons/mic-vocal';
import ALargeSmall from 'lucide-svelte/icons/a-large-small';

/**
 * The pages under /tools.
 *
 * One list, so the index, each page's metadata and structured data, the
 * "more tools" rail, and the footer all agree. Another tool is an entry here
 * and a route.
 *
 * `title` is what a person searches for and is the page's <h1>; `metaTitle`
 * is the <title>, where there is room to say why this one.
 */
export const tools = [
	{
		slug: 'ai-detector',
		icon: Bot,
		name: 'AI Detector',
		title: 'AI Writing Detector',
		metaTitle: 'AI Writing Detector: Find What Makes Text Sound Like AI (Free)',
		description:
			'Paste text or drop a Word or PDF file to see every phrase that reads as AI-written, highlighted with a fix for each. Free, no sign-up, nothing uploaded.',
		blurb: 'Highlights the phrases that make text read as machine-written, with a fix for each.'
	},
	{
		slug: 'word-counter',
		icon: Hash,
		name: 'Word Counter',
		title: 'Word Counter',
		metaTitle: 'Word Counter: Words, Characters, Sentences, and Reading Time',
		description:
			'Count words, characters, and sentences as you type, or drop in a Word, PDF, or Markdown file. Reading time, keyword density, and length limits. Free and private.',
		blurb: 'Words, characters, sentences, reading time, and keyword density as you type.'
	},
	{
		slug: 'character-counter',
		icon: LetterText,
		name: 'Character Counter',
		title: 'Character Counter',
		metaTitle: 'Character Counter: With and Without Spaces, Against Every Limit',
		description:
			'Count characters with and without spaces as you type, and see what is left before the limit of a title tag, meta description, text message, or post. Free and private.',
		blurb: 'Characters with and without spaces, against the limits of posts, titles, and texts.'
	},
	{
		slug: 'readability-checker',
		icon: BookOpenCheck,
		name: 'Readability Checker',
		title: 'Readability Checker',
		metaTitle: 'Readability Checker: Flesch–Kincaid, Gunning Fog, SMOG, and More',
		description:
			'Score text, a Word document, or a PDF on seven readability formulas at once, including Flesch–Kincaid, and see which sentences to fix. Free, no sign-up.',
		blurb: 'Seven readability scores at once, and the sentences dragging them down.'
	},
	{
		slug: 'title-case-converter',
		icon: CaseSensitive,
		name: 'Title Case Converter',
		title: 'Title Case Converter',
		metaTitle: 'Title Case Converter: AP, APA, Chicago, and MLA',
		description:
			'Convert headlines to title case in AP, APA, Chicago, or MLA style, or to sentence case. See how the styles differ on the same title. Free and instant.',
		blurb: 'AP, APA, Chicago, MLA, and sentence case, side by side on the same headline.'
	},
	{
		slug: 'case-converter',
		icon: ALargeSmall,
		name: 'Case Converter',
		title: 'Case Converter',
		metaTitle: 'Case Converter: Uppercase, Lowercase, Sentence, camelCase, and snake_case',
		description:
			'Convert text to uppercase, lowercase, sentence case, or title case, and names to camelCase, snake_case, or kebab-case. Fix caps lock in one paste. Free and instant.',
		blurb: 'Sentence, title, upper, and lower case, and camelCase, snake_case, and kebab-case.'
	},
	{
		slug: 'reading-time-calculator',
		icon: Timer,
		name: 'Reading Time Calculator',
		title: 'Reading Time Calculator',
		metaTitle: 'Reading Time Calculator: How Long Does It Take to Read?',
		description:
			'Paste a text, drop a Word or PDF file, or enter a word count to see how long it takes to read, at the average reading speed or your own. Free, no sign-up.',
		blurb: 'How long a text takes to read, at the average speed or your own.'
	},
	{
		slug: 'speech-time-calculator',
		icon: MicVocal,
		name: 'Speech Time Calculator',
		title: 'Speech Time Calculator',
		metaTitle: 'Speech Time Calculator: Convert Words to Minutes',
		description:
			'Paste a speech or enter a word count to see how long it takes to say, and how many words fit a 5, 10, or 20-minute slot at your pace. Free, no sign-up.',
		blurb: 'How long a speech takes to say, and how many words fit your time limit.'
	},
	{
		slug: 'voice-checker',
		// Needs Vale's browser engine; see listed().
		engine: true,
		icon: Speech,
		name: 'Voice Checker',
		title: 'Writing Voice Checker',
		metaTitle: 'Writing Voice Checker: Hold a Draft to a Voice',
		description:
			'Pick a writing voice, such as direct, plain, or brief, and see every place your draft breaks it, with the reason and a fix. Free, no sign-up, nothing uploaded.',
		blurb: 'Pick a voice and see every place a draft breaks it, with the reason for each.'
	}
] as const;

export type Tool = (typeof tools)[number];
export type ToolSlug = Tool['slug'];

export const tool = (slug: ToolSlug): Tool => tools.find((t) => t.slug === slug)!;
/** The tools a build can offer: all of them, or those that work without the engine. */
export const listed = (engine: boolean): Tool[] =>
	tools.filter((t) => engine || !('engine' in t && t.engine));

export const otherTools = (slug: ToolSlug, engine: boolean): Tool[] =>
	listed(engine).filter((t) => t.slug !== slug);
