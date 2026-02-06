import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    plugins: [sveltekit()],
    resolve: {
        alias: {
            // Force all instances of CodeMirror core to use the same physical file
            '@codemirror/state': path.resolve('./node_modules/@codemirror/state'),
            '@codemirror/view': path.resolve('./node_modules/@codemirror/view'),
            '@codemirror/language': path.resolve('./node_modules/@codemirror/language'),
        }
    }
});
