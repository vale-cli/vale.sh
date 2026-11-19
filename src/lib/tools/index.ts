import Bot from 'lucide-svelte/icons/bot';
import Hash from 'lucide-svelte/icons/hash';
import BookOpenCheck from 'lucide-svelte/icons/book-open-check';
import CaseSensitive from 'lucide-svelte/icons/case-sensitive';
import Scale from 'lucide-svelte/icons/scale';

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
			'Paste text to see every phrase that reads as AI-written, highlighted with a fix for each one. Free, instant, no sign-up, and nothing leaves your browser.',
		blurb: 'Highlights the phrases that make text read as machine-written, with a fix for each.'
	},
	{
		slug: 'word-counter',
		icon: Hash,
		name: 'Word Counter',
		title: 'Word Counter',
		metaTitle: 'Word Counter: Words, Characters, Sentences, and Reading Time',
		description:
			'Count words, characters, sentences, and paragraphs as you type. Reading time, speaking time, keyword density, and length limits. Free and private.',
		blurb: 'Words, characters, sentences, reading time, and keyword density as you type.'
	},
	{
		slug: 'readability-checker',
		icon: BookOpenCheck,
		name: 'Readability Checker',
		title: 'Readability Checker',
		metaTitle: 'Readability Checker: Flesch–Kincaid, Gunning Fog, SMOG, and More',
		description:
			'Score your text on seven readability formulas at once, including Flesch–Kincaid and Gunning fog, and see which sentences to fix. Free, no sign-up.',
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
		slug: 'style-guide-comparison',
		icon: Scale,
		name: 'Style Guide Comparison',
		title: 'Style Guide Comparison',
		metaTitle: 'Style Guide Comparison: Google vs. Microsoft vs. AP vs. Chicago',
		description:
			'Compare the Google, Microsoft, Red Hat, AP, and Chicago style guides rule by rule: Oxford comma, headings, contractions, numbers, dashes, and more.',
		blurb: 'Google, Microsoft, Red Hat, AP, and Chicago, rule by rule.'
	}
] as const;

export type Tool = (typeof tools)[number];
export type ToolSlug = Tool['slug'];

export const tool = (slug: ToolSlug): Tool => tools.find((t) => t.slug === slug)!;
export const otherTools = (slug: ToolSlug): Tool[] => tools.filter((t) => t.slug !== slug);
