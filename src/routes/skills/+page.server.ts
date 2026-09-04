import { highlight } from '$lib/server/highlight';
import type { PageServerLoad } from './$types';

/** The two slash commands that install the plugin, shown twice on the page. */
const install = `/plugin marketplace add vale-cli/agent-tools
/plugin install vale@agent-tools`;

export const load: PageServerLoad = async () => {
	return { install, installHtml: await highlight(install, 'plaintext') };
};
