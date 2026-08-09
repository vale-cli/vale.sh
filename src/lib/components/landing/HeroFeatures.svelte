<script lang="ts">
	import SpellCheck from 'lucide-svelte/icons/spell-check';
	import BookMarked from 'lucide-svelte/icons/book-marked';
	import FileCode2 from 'lucide-svelte/icons/file-code-2';
	import WandSparkles from 'lucide-svelte/icons/wand-sparkles';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';

	/*
		The capabilities the panel above cannot show. A terminal proves Vale
		reports things; it says nothing about what you can teach it, which is the
		part that decides whether a team keeps it.

		Card treatment rather than bare links, matching the rest of the site --
		AgentTools and the generator use the same frame -- so the hero reads as
		two deliberate objects instead of a panel with text under it.
	*/
	const features = [
		{
			icon: SpellCheck,
			title: 'Spell check',
			body: 'Hunspell dictionaries, with filters for acronyms, numbers, and anything else you list.',
			meta: 'checks/spelling',
			href: 'https://docs.vale.sh/checks/spelling'
		},
		{
			icon: BookMarked,
			title: 'Vocabularies',
			body: 'One accept and reject list for your own terminology, applied across every style you run.',
			meta: 'keys/vocabularies',
			href: 'https://docs.vale.sh/keys/vocabularies'
		},
		{
			icon: FileCode2,
			title: 'Custom rules',
			body: 'Twelve extension points in YAML—existence, substitution, readability, script, and more.',
			meta: 'topics/styles',
			href: 'https://docs.vale.sh/topics/styles'
		},
		{
			icon: WandSparkles,
			title: 'Fixes',
			body: 'A rule can carry its own correction, for an editor or an agent to apply.',
			meta: 'topics/actions',
			href: 'https://docs.vale.sh/topics/actions'
		}
	];
</script>

<ul class="grid gap-3 sm:grid-cols-2">
	{#each features as feature (feature.title)}
		<li class="flex">
			<a
				href={feature.href}
				target="_blank"
				rel="noreferrer"
				class="group flex w-full flex-col rounded-xl border border-border bg-card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-lime-500/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
			>
				<span class="flex items-center justify-between gap-3">
					<span class="inline-flex rounded-lg bg-lime-500/10 p-2 text-lime-600 dark:text-lime-400">
						<feature.icon class="h-4 w-4" />
					</span>
					<!-- The reference page each card opens, so the link is not a mystery. -->
					<span class="font-mono text-[11px] text-muted-foreground/70">{feature.meta}</span>
				</span>

				<span class="mt-3 flex items-center gap-1 text-sm font-semibold text-foreground">
					{feature.title}
					<ArrowUpRight
						class="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-lime-600 dark:group-hover:text-lime-400"
					/>
				</span>
				<span class="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
					{feature.body}
				</span>
			</a>
		</li>
	{/each}
</ul>
