<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';

	let { data } = $props();
	const { team, record, groups, files, similar, study } = $derived(data);

	const day = (iso: string) =>
		new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			timeZone: 'UTC'
		});

	// What the config declares, as rows; a row with nothing to say is left out.
	const config = $derived(
		record
			? [
					{ label: 'Styles', value: record.styles?.join(', ') },
					{ label: 'Formats', value: record.formats?.map((f) => `.${f}`).join(' ') },
					{ label: 'Reports from', value: record.level },
					{
						label: 'Own rules',
						value: record.house == null ? null : record.house ? 'Yes' : 'No, registry packages only'
					},
					{
						label: 'Vocabulary',
						value: record.vocab == null ? null : record.vocab ? 'Yes' : 'None set'
					}
				].filter((r): r is { label: string; value: string } => Boolean(r.value))
			: []
	);

	const activity = $derived(
		record
			? [
					{ label: 'Running Vale since', value: record.since && day(record.since) },
					{ label: 'Config last changed', value: record.touched && day(record.touched) },
					{ label: 'Repository last pushed', value: record.pushed && day(record.pushed) },
					{
						label: 'Vale workflow runs, last 30 days',
						value: record.runs30 == null ? null : record.runs30.toLocaleString('en-US')
					},
					{
						label: 'Repository stars',
						value: record.stars == null ? null : record.stars.toLocaleString('en-US')
					}
				].filter((r): r is { label: string; value: string } => Boolean(r.value))
			: []
	);

	const description = $derived(`How ${team.name} uses Vale: ${team.context}`);
	const slugUrl = $derived(`https://vale.sh/adopters/${data.slug}`);
</script>

<MetaTags
	title="{team.name} — Vale adopters"
	{description}
	canonical={slugUrl}
	openGraph={{ url: slugUrl, title: `${team.name} runs Vale`, description }}
/>

{#snippet rows(items: { label: string; value: string }[])}
	<dl class="divide-y divide-border rounded-xl border border-border bg-card">
		{#each items as row (row.label)}
			<div class="grid gap-x-6 gap-y-0.5 px-5 py-3 sm:grid-cols-[14rem_1fr]">
				<dt class="text-sm text-muted-foreground">{row.label}</dt>
				<dd class="text-sm font-medium text-foreground">{row.value}</dd>
			</div>
		{/each}
	</dl>
{/snippet}

<article class="mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:px-8">
	<a
		href="/adopters#adopters"
		class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
	>
		<ArrowLeft class="h-4 w-4" />
		All adopters
	</a>

	<header class="mt-8">
		<div class="flex items-center gap-4">
			<BrandIcon
				name={team.name}
				slug={team.icon ?? undefined}
				avatar={team.avatar ?? undefined}
				size="h-12 w-12"
			/>
			<div>
				<p
					class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
				>
					{team.category}
				</p>
				<h1 class="mt-1 text-3xl font-medium tracking-tight sm:text-4xl">{team.name}</h1>
			</div>
		</div>
		<p class="mt-6 text-pretty text-lg leading-8 text-foreground/85">{team.context}</p>

		<div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
			<a
				href={team.url}
				target="_blank"
				rel="noreferrer"
				class="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				{data.proofLabel}
				<ArrowUpRight class="h-4 w-4" />
			</a>
			{#if study}
				<a
					href="/blog/{study.slug}"
					class="inline-flex items-center gap-1 text-sm font-medium text-lime-600 hover:underline dark:text-lime-400"
				>
					Read the case study
					<ArrowRight class="h-3.5 w-3.5" />
				</a>
			{/if}
		</div>
	</header>

	{#if record}
		{#if config.length}
			<section class="mt-12">
				<h2 class="text-lg font-medium tracking-tight">What the config says</h2>
				<div class="mt-4">{@render rows(config)}</div>
			</section>
		{/if}

		{#if groups.length}
			<section class="mt-12">
				<h2 class="text-lg font-medium tracking-tight">How it runs</h2>
				<div class="mt-4 space-y-3">
					{#each groups as group (group.name)}
						<div class="flex flex-wrap items-baseline gap-x-4 gap-y-2">
							<span class="w-28 shrink-0 text-sm text-muted-foreground">{group.name}</span>
							<ul class="flex flex-wrap gap-1.5">
								{#each group.facets as facet (facet.id)}
									<li
										class="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
									>
										{facet.label}
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
				{#if files.length}
					<p class="mt-6 text-sm text-muted-foreground">
						The files in the repository that name Vale:
					</p>
					<ul class="mt-2 flex flex-wrap gap-1.5">
						{#each files as file (file.url)}
							<li>
								<a
									href={file.url}
									target="_blank"
									rel="noreferrer"
									class="inline-flex items-center gap-1 rounded-md border border-border px-2 py-0.5 font-mono text-[12px] text-muted-foreground transition-colors hover:border-lime-500/50 hover:text-foreground"
								>
									{file.label}
									<ArrowUpRight class="h-3 w-3" />
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		{/if}

		{#if activity.length}
			<section class="mt-12">
				<h2 class="text-lg font-medium tracking-tight">Activity</h2>
				<div class="mt-4">{@render rows(activity)}</div>
			</section>
		{/if}

		<p class="mt-4 text-xs leading-5 text-muted-foreground">
			Read from the public repository{record.repo ? ` ${record.repo}` : ''} on {day(
				data.generated
			)}, not reported by the team.
		</p>
	{:else}
		<p
			class="mt-12 rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground"
		>
			Nothing has been read from a repository for this entry yet. The link above is its proof.
		</p>
	{/if}

	{#if similar.length}
		<section class="mt-14 border-t border-border pt-10">
			<h2 class="text-lg font-medium tracking-tight">Similar setups in {team.category}</h2>
			<ul class="mt-4 grid gap-3 sm:grid-cols-2">
				{#each similar as other (other.slug)}
					<li>
						<a
							href="/adopters/{other.slug}"
							class="group flex h-full items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-lime-500/40"
						>
							<BrandIcon
								name={other.name}
								slug={other.icon ?? undefined}
								avatar={other.avatar ?? undefined}
							/>
							<span class="min-w-0">
								<span class="block font-medium text-foreground">{other.name}</span>
								<span class="block truncate text-xs text-muted-foreground"
									>Also: {other.shared.join(', ')}</span
								>
							</span>
							<ArrowRight
								class="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
							/>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<p class="mt-14 text-sm text-muted-foreground">
		Is this your team?
		<a
			href="https://github.com/vale-cli/vale.sh/blob/svelte/src/lib/data/adopters.json"
			target="_blank"
			rel="noreferrer"
			class="font-medium text-foreground underline decoration-lime-500/40 underline-offset-4"
			>Edit the entry</a
		>, or
		<a
			href="/adopters#add"
			class="font-medium text-foreground underline decoration-lime-500/40 underline-offset-4"
			>add yours</a
		>.
	</p>
</article>
