import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';

const migrated: Record<string, string> = {
    // Package Hub is now combined with the Explorer:
    '/hub': '/explorer',

    '/docs/integrations/sublime-text': '/docs/guides/lsp',
    '/docs/integrations/guide': '/docs/guides/lsp',

    '/docs/vale-cli': '/docs',

    '/docs/vale-cli/installation': '/docs/install',
    '/docs/vale-cli/structure': '/docs/vale-ini',

    '/docs/topics/scoping': '/docs/scopes',
    '/docs/topics/styles': '/docs/styles',
    '/docs/topics/actions': '/docs/actions',
    '/docs/topics/vocab': '/docs/keys/vocab',
    '/docs/topics/packages': '/docs/keys/packages',
    '/docs/topics/config': '/docs/vale-ini',

    // NOTE: These needs to be handled on the client side?
    '/docs/topics/config/#stylespath': '/docs/keys/stylespath',
    '/docs/topics/config/#packages': '/docs/keys/packages',
    '/docs/topics/config/#minalertlevel': '/docs/keys/minalertlevel',
    '/docs/topics/config/#ignoredscopes': '/docs/keys/ignoredscopes',
    '/docs/topics/config/#skippedscopes': '/docs/keys/skippedscopes',
    '/docs/topics/config/#format-associations': '/docs/vale-ini#format-associations',
    '/docs/topics/config/#basedonstyles': '/docs/keys/basedonstyles',
    '/docs/topics/config/#blockignores': '/docs/keys/blockignores',
    '/docs/topics/config/#commentdelimiters': '/docs/keys/commentdelimiters',
    '/docs/topics/config/#tokenignores': '/docs/keys/tokenignores',
    '/docs/topics/config/#transform': '/docs/keys/transform',

    // CLI manual
    '/manual': '/docs/cli',
    '/manual/sync': '/docs/cli#cli-options',
    '/manual/ls-config': '/docs/cli#cli-options',
    '/manual/ls-metrics': '/docs/cli#cli-options',
    '/manual/config': '/docs/cli#cli-options',
    '/manual/ext': '/docs/cli#cli-options',
    '/manual/filter': '/docs/cli#cli-options',
    '/manual/glob': '/docs/cli#cli-options',
    '/manual/ignore-syntax': '/docs/cli#cli-options',
    '/manual/no-exit': '/docs/cli#cli-options',
    '/manual/no-wrap': '/docs/cli#cli-options',
    '/manual/output': '/docs/cli#cli-options',
    '/manual/version': '/docs/cli#cli-options',
};

export const handle: Handle = async ({ event, resolve }) => {
    const { pathname, search, hash } = new URL(event.request.url);

    let given = pathname;
    if (pathname.slice(-1) === '/' && pathname.length > 1) {
        given = pathname.slice(0, -1);
    }

    if (given in migrated) {
        throw redirect(301, migrated[given]);
    }

    return resolve(event);
};
