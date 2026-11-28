<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import { zipSync, strToU8 } from 'fflate';
	import Tabs from '$lib/components/explorer/Tabs.svelte';
	import RuleCard from '$lib/components/explorer/RuleCard.svelte';
	import { categories, rules } from '$lib/data/rule-gallery';
	import { config, createEngine, type Engine, type ValeAlert } from '$lib/tools/vale';

	// One engine for the page. Cards lint one at a time, since the engine
	// drops a waiting request when a newer one arrives.
	let engine: Engine | null = null;
	let queue: Promise<unknown> = Promise.resolve();
	let rev = 0;

	function lint(id: string, yaml: string, text: string): Promise<ValeAlert[]> {
		const job = async () => {
			// Each edit unpacks under a fresh path, so no stale rule lingers.
			const prefix = `/rules/${id}/${++rev}`;
			const zip = zipSync({ [`Demo/${id}.yml`]: strToU8(yaml) });
			const url = URL.createObjectURL(new Blob([zip], { type: 'application/zip' }));
			const spec = { packages: [{ url, prefix }], config: config(['Demo'], prefix), format: 'md' };
			engine ??= createEngine(spec);
			try {
				return (await engine.lint(text, spec)) ?? [];
			} catch (e) {
				// A rule that doesn't parse takes the worker down with it.
				engine.dispose();
				engine = null;
				throw e;
			} finally {
				URL.revokeObjectURL(url);
			}
		};
		const next = queue.then(job, job);
		queue = next.catch(() => {});
		return next;
	}

	const byCategory = categories.map((c) => ({
		...c,
		rules: rules.filter((r) => r.category === c.id)
	}));
</script>

<MetaTags
	title="Rule Explorer"
	description="Vale rules for markup, links, front matter, code blocks, and page structure, modeled on rules docs teams wrote for themselves. Edit one and see what it catches."
	canonical="https://vale.sh/explorer/rules"
	openGraph={{
		url: 'https://vale.sh/explorer/rules',
		title: 'Vale Rule Explorer',
		description:
			'Rules beyond prose: broken markup, links, front matter, code blocks, and page structure, each one editable and live.'
	}}
/>

<div class="mx-auto max-w-6xl px-6 py-14 lg:px-8">
	<Tabs active="rules" />

	<div class="mx-auto mt-10 max-w-2xl text-center">
		<p class="text-base font-semibold text-lime-600 dark:text-lime-400">Rule Explorer</p>
		<h1 class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Rules beyond prose
		</h1>
		<p class="mx-auto mt-4 text-pretty text-lg leading-8 text-muted-foreground">
			Vale reads the markup, not only the sentences. Each rule here is modeled on ones docs teams
			wrote for themselves. Edit the rule or the sample, and Vale runs again in your browser.
		</p>
	</div>

	<nav aria-label="Rule categories" class="mt-10 flex flex-wrap justify-center gap-2">
		{#each byCategory as c (c.id)}
			<a
				href="#{c.id}"
				class="rounded-full border border-border px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:border-lime-500/40 hover:text-foreground"
			>
				{c.title}
				<span class="ml-1 tabular-nums opacity-60">{c.rules.length}</span>
			</a>
		{/each}
	</nav>

	{#each byCategory as c (c.id)}
		<section id={c.id} class="mt-16 scroll-mt-24" aria-labelledby="{c.id}-title">
			<h2 id="{c.id}-title" class="text-2xl font-semibold tracking-tight">{c.title}</h2>
			<p class="mt-1 text-muted-foreground">{c.summary}</p>
			<div class="mt-6 space-y-6">
				{#each c.rules as rule (rule.id)}
					<RuleCard {rule} {lint} />
				{/each}
			</div>
		</section>
	{/each}
</div>
