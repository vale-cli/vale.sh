import { highlightAll } from '$lib/server/highlight';
import type { PageServerLoad } from './$types';

/** Every snippet on the page, highlighted once per build. */
const snippets = {
	install: {
		lang: 'plaintext',
		code: `/plugin marketplace add vale-cli/agent-tools
/plugin install vale@agent-tools`
	},
	check: {
		lang: 'bash',
		code: `vale ls-config >/dev/null && echo "config resolves"
vale --no-exit --output=line path/to/file.md   # any error lines?`
	},
	// What the hook hands back, as it prints it.
	alert: {
		lang: 'plaintext',
		code: `Vale reports 1 alert(s) at error level or above in this file:
  line 11: Vale.Spelling [error] — Did you really mean 'Teh'?

Fix these before moving on, preserving the markup exactly. Do not disable a rule to clear one.`
	},
	level: { lang: 'bash', code: `VALE_HOOK_LEVEL=warning claude` },
	mcp: {
		lang: 'json',
		code: `{
  "mcpServers": {
    "vale-cms": {
      "type": "http",
      "url": "https://api.vale.sh/mcp"
    }
  }
}`
	}
} as const;

export const load: PageServerLoad = async () => {
	const code = Object.fromEntries(
		Object.entries(snippets).map(([key, s]) => [key, s.code])
	) as Record<keyof typeof snippets, string>;
	return { code, html: await highlightAll(snippets) };
};
