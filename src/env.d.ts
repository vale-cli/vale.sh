// SvelteKit 3 deprecates `$env/*` and no longer generates types for it. The
// module still resolves, and github-sponsors.ts keeps it because it is the one
// import that reads GITHUB_TOKEN from a local .env while prerendering.
declare module '$env/static/private';
