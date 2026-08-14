<script lang="ts">
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import BrandIcon from './BrandIcon.svelte';
	import { integrationGroups } from '$lib/data/integrations';
</script>

<div id="integrations" class="mx-auto max-w-7xl px-6 pt-7 lg:px-8">
	<div class="mx-auto max-w-2xl sm:text-center">
		<h2 class="text-base/7 font-semibold text-lime-500">One tool, every app</h2>
		<p class="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-balance sm:text-5xl">
			More than just a command-line interface.
		</p>
		<p class="mt-6 text-lg/8 text-neutral-500">
			Vale runs where you already write&mdash;in your editor, in your notes app, and in CI before
			anything merges.
		</p>
	</div>

	<div class="mx-auto mt-14 max-w-5xl space-y-12">
		{#each integrationGroups as group}
			<section>
				<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
					<h3 class="text-sm font-semibold tracking-tight">{group.title}</h3>
					<p class="text-sm text-muted-foreground">{group.note}</p>
				</div>

				<ul class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each group.items as item}
						<li>
							<a
								href={item.href}
								target="_blank"
								rel="noreferrer"
								class="group flex h-full items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
							>
								<BrandIcon
									name={item.name}
									slug={item.slug}
									avatar={item.avatar}
									class="text-foreground/70 transition-colors group-hover:text-lime-500"
								/>
								<span class="min-w-0 flex-1">
									<span class="block truncate text-sm font-medium">{item.name}</span>
									<span class="block truncate text-xs text-muted-foreground">{item.detail}</span>
								</span>
								<ArrowUpRight
									class="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-lime-500"
								/>
							</a>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>

	<div class="mt-14 flex justify-center pb-5">
		<p
			class="relative rounded-full bg-gray-50 px-4 py-1.5 text-sm/6 ring-1 ring-inset ring-gray-900/5 dark:bg-gray-400/5"
		>
			<a href="https://docs.vale.sh/guides/lsp" class="font-semibold text-lime-500">
				<span class="absolute inset-0" aria-hidden="true"></span>
				Learn more about our integrations
				<span aria-hidden="true">&rarr;</span>
			</a>
		</p>
	</div>
</div>
