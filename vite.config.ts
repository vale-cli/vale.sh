import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const dep = (name: string) => new URL(`./node_modules/${name}`, import.meta.url).pathname;

export default defineConfig({
    plugins: [sveltekit()],
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
