/**
 * Deep links that open a chat already pointed at Vale's agent instructions.
 *
 * Both assistants take the first message as a query parameter, so the link
 * hands over AGENTS.md rather than asking someone to paste a URL into a chat
 * and describe what they want.
 */

const prompt = encodeURIComponent(
	'Read https://vale.sh/AGENTS.md and set up Vale in my repository.'
);

export const assistants = [
	{ label: 'Open in Claude', slug: 'claude', href: `https://claude.ai/new?q=${prompt}` },
	{ label: 'Open in ChatGPT', slug: 'chatgpt', href: `https://chatgpt.com/?q=${prompt}` }
];
