import adapter from '@sveltejs/adapter-netlify';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import mdsvexOptions from './mdsvex.config.js';
import { defineConfig } from 'vite';

const dep = (name: string) => new URL(`./node_modules/${name}`, import.meta.url).pathname;

export default defineConfig({
    plugins: [
        // SvelteKit 3 reads its options here; svelte.config.js is gone.
        sveltekit({
            preprocess: [mdsvex(mdsvexOptions), vitePreprocess()],
            extensions: ['.svelte', '.md'],
            adapter: adapter(),
            // SvelteKit 3 moved to `#lib`. The alias keeps the `$lib` imports,
            // which shadcn-svelte's generated components also use.
            alias: { $lib: 'src/lib' }
        })
    ],
    optimizeDeps: {
        // These ship raw .svelte files; letting esbuild pre-bundle them creates a
        // second Svelte runtime, which crashes hydration with "Cannot read
        // properties of undefined (reading 'source')". Excluding them lets
        // vite-plugin-svelte compile them against the app's single runtime.
        exclude: ['svelte-radix', 'lucide-svelte']
    },
    resolve: {
        alias: {
            // Force all instances of CodeMirror core to use the same physical file
            // Resolved against this file rather than the working directory, so
            // the dedupe holds however vite is started. `path.resolve` would do
            // the same but needs @types/node, which nothing else here wants.
            '@codemirror/state': dep('@codemirror/state'),
            '@codemirror/view': dep('@codemirror/view'),
            '@codemirror/language': dep('@codemirror/language'),
        }
    }
});
