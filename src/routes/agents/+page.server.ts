import { highlightAll } from '$lib/server/highlight';
import type { PageServerLoad } from './$types';

/** Every snippet on the page, highlighted once per build. */
const snippets = {
	install: {
		lang: 'plaintext',
		code: `/plugin marketplace add vale-cli/agent-tools
/plugin install vale@agent-tools`
	},
	onboard: { lang: 'plaintext', code: `/vale:onboard` },
	// For an assistant with a shell and no plugin support.
	clone: {
		lang: 'plaintext',
		code: `Clone https://github.com/vale-cli/agent-tools into a temp directory, then
follow skills/onboard/SKILL.md to set up Vale in this repository.`
	},
	check: {
		lang: 'bash',
		code: `vale ls-config >/dev/null && echo "config resolves"
vale --no-exit --output=line path/to/file.md   # any error lines?`
	},
	// What the edit hook hands back, as it prints it.
	alert: {
		lang: 'plaintext',
		code: `Vale reports 1 alert(s) at error level or above in this file:
  line 4: House.Terms [error] — Use 'allowlist' instead of 'whitelist'.

Fix these before moving on, preserving the markup exactly. Do not disable a rule to clear one.`
	},
	level: { lang: 'bash', code: `VALE_HOOK_LEVEL=warning claude` },
	// The section the commit hook looks for.
	commits: {
		lang: 'ini',
		code: `Packages = Microsoft, Commits

[COMMIT_EDITMSG]
BasedOnStyles = Commits, SevenRules`
	},
	pane: {
		lang: 'plaintext',
		code: `/plugin install vale-onboard@agent-tools
/vale-onboard`
	},
	tools: { lang: 'plaintext', code: `/plugin install vale-tools@agent-tools` },
	lsp: { lang: 'plaintext', code: `/plugin install vale-lsp@agent-tools` },
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
