<script lang="ts">
	// The blog checks its own prose, and owning the platform means the receipt
	// can ship with the post. Numbers come from src/lib/data/lint.json, which
	// script/lint-posts.mjs generates by running Vale on every post -- pinned
	// to the version named below, committed rather than computed on deploy.
	//
	// Styled as a spec sheet: one verdict line, then labeled cells that line
	// up, instead of rows of undifferentiated muted text.
	import Check from 'lucide-svelte/icons/check';

	import report from '$lib/data/lint.json';

	let { slug }: { slug: string } = $props();

	const post = (report.posts as Record<string, (typeof report.posts)['voices']>)[slug];
	const alerts = $derived(post ? post.errors + post.warnings + post.suggestions : 0);

	const stats = $derived(
		post
			? [
					{ label: 'Words', value: post.words.toLocaleString('en-US') },
					{ label: 'Sentences', value: String(post.sentences) },
					{ label: 'Paragraphs', value: String(post.paragraphs) },
					{ label: 'FK grade', value: post.grade.toFixed(1) },
					{ label: 'Flesch ease', value: post.ease.toFixed(1) },
					{ label: 'SMOG', value: post.smog.toFixed(1) },
					{ label: 'Complex', value: `${post.complex}%` },
					{ label: 'Read', value: `${post.minutes} min` }
				]
			: []
	);
</script>

{#if post}
	<footer class="not-prose mt-14 border-t border-border pt-5">
		<div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-sm">
			<span class="flex items-center gap-1.5">
				{#if alerts === 0}
					<Check class="h-3.5 w-3.5 text-lime-500" />
					<span
						>Linted by <a class="font-medium hover:underline" href="https://vale.sh">Vale</a>
						{report.vale} in {post.ms}&hairsp;ms — no alerts</span
					>
				{:else}
					<span
						>Linted by <a class="font-medium hover:underline" href="https://vale.sh">Vale</a>
						{report.vale} in {post.ms}&hairsp;ms — {post.errors} errors, {post.warnings} warnings,
						{post.suggestions} suggestions</span
					>
				{/if}
			</span>
			<span class="text-xs text-muted-foreground">Checked {report.generated}</span>
		</div>

		<dl class="mt-4 grid grid-cols-4 gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-8">
			{#each stats as stat (stat.label)}
				<div class="bg-card px-2.5 py-2">
					<dt class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
						{stat.label}
					</dt>
					<dd class="mt-0.5 text-sm tabular-nums">{stat.value}</dd>
				</div>
			{/each}
		</dl>

		<p class="mt-2.5 text-xs leading-relaxed text-muted-foreground/70">
			One <code class="font-mono text-[11px]">vale</code> run on this file, wall clock. Counts from
			<code class="font-mono text-[11px]">vale ls-metrics</code>; reading time at 200 words a
			minute.
		</p>
	</footer>
{/if}
