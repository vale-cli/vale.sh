import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

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
            '@codemirror/state': path.resolve('./node_modules/@codemirror/state'),
            '@codemirror/view': path.resolve('./node_modules/@codemirror/view'),
            '@codemirror/language': path.resolve('./node_modules/@codemirror/language'),
        }
    }
});
