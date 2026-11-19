<script lang="ts">
	// Every skill, grouped by the job it does, with what someone says to
	// bring it up. Each links to its instructions.
	import { skillGroups } from '$lib/data/skills';

	import Figure from './Figure.svelte';

	let { caption }: { caption?: string } = $props();
</script>

<Figure {caption}>
	<div class="grid gap-3 sm:grid-cols-3">
		{#each skillGroups as group (group.title)}
			<section class="rounded-xl border border-border bg-card p-4">
				<h3 class="text-sm font-medium">{group.title}</h3>
				<p class="mt-0.5 text-xs leading-snug text-muted-foreground">{group.note}</p>
				<ul class="mt-3 space-y-2.5">
					{#each group.skills as skill (skill.name)}
						<li>
							<a
								href={skill.path}
								target="_blank"
								rel="noopener noreferrer"
								class="font-mono text-xs font-medium text-lime-700 hover:underline dark:text-lime-400"
								>/vale:{skill.name}</a
							>
							<p class="text-xs leading-snug text-muted-foreground">“{skill.ask}”</p>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</Figure>
