import Bot from 'lucide-svelte/icons/bot';
import Hash from 'lucide-svelte/icons/hash';
import BookOpenCheck from 'lucide-svelte/icons/book-open-check';
import CaseSensitive from 'lucide-svelte/icons/case-sensitive';
import SpellCheck from 'lucide-svelte/icons/spell-check';

/**
 * The pages under /tools.
 *
 * One list, so the index, each page's metadata and structured data, the
 * "more tools" rail, and the footer all agree. A sixth tool is an entry here
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
		slug: 'style-guide-checker',
		icon: SpellCheck,
		name: 'Style Guide Checker',
		title: 'Style Guide Checker',
		metaTitle: 'Style Guide Checker: Google, Microsoft, and Red Hat Style',
		description:
			'Explore the Google, Microsoft, and Red Hat style guides as a map of their rules, and paste your text to see which ones it breaks, with a fix for each.',
		blurb:
			'A visual map of the Google, Microsoft, and Red Hat style guides that lights up on your text.'
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
	}
] as const;

export type Tool = (typeof tools)[number];
export type ToolSlug = Tool['slug'];

export const tool = (slug: ToolSlug): Tool => tools.find((t) => t.slug === slug)!;
export const otherTools = (slug: ToolSlug): Tool[] => tools.filter((t) => t.slug !== slug);
