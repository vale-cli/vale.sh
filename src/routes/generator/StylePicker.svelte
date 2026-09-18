<script lang="ts">
	/*
		A style is a decision, not a name, so each is a card that says what it
		does, how loud it is, who else uses it, and where to read its rules.
		`single` makes the set a radio group: two base guides disagree, so one
		replaces the other.
	*/
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils.js';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import type { Option } from './config.js';

	let {
		options,
		selected = $bindable([]),
		single = false,
		sampleSize,
		showAdoption = true
	}: {
		options: Option[];
		selected: string[];
		single?: boolean;
		sampleSize: number;
		/** Off when the counts, which come from documentation repos, say nothing about the audience. */
		showAdoption?: boolean;
	} = $props();

	function toggle(value: string) {
		if (selected.includes(value)) {
			selected = selected.filter((v) => v !== value);
		} else if (single) {
			selected = [value];
		} else {
			selected = [...selected, value];
		}
	}
</script>

<div class="grid gap-2 sm:grid-cols-2">
	{#each options as item (item.value)}
		{@const on = selected.includes(item.value)}
		{@const id = `style-${item.value}`}
		<div
			class={cn(
				'flex gap-3 rounded-lg border p-3 transition-colors',
				on ? 'border-primary bg-accent' : 'border-border hover:bg-muted/40'
			)}
		>
			<Checkbox
				{id}
				checked={on}
				onCheckedChange={() => toggle(item.value)}
				class={cn('mt-0.5', single && 'rounded-full')}
				aria-label={item.label}
			/>
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<label for={id} class="flex cursor-pointer items-center gap-2">
					{#if item.logo}
						<img
							src={item.logo}
							alt=""
							loading="lazy"
							width="20"
							height="20"
							class="size-5 shrink-0 rounded-sm object-contain"
						/>
					{/if}
					<span class="text-sm font-medium">{item.label}</span>
					{#if item.ruleCount > 0}
						<span class="font-mono text-[11px] text-muted-foreground">{item.ruleCount} rules</span>
					{/if}
				</label>
				<p class="text-xs leading-relaxed text-muted-foreground">{item.description}</p>

				<!--
					How loud it is and who else picked it. The severity mix is the
					honest version of "how noisy": a style that is mostly errors
					behaves very differently on a first run from one that is mostly
					suggestions.
				-->
				<p class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
					{#if item.levels.error}<span class="text-red-500">{item.levels.error} error</span>{/if}
					{#if item.levels.warning}<span class="text-amber-500">{item.levels.warning} warning</span
						>{/if}
					{#if item.levels.suggestion}<span class="text-sky-500"
							>{item.levels.suggestion} suggestion</span
						>{/if}
					{#if showAdoption && item.adoption > 0}
						<span class="text-muted-foreground">· used by {item.adoption} of {sampleSize}</span>
					{/if}
				</p>

				<p class="flex flex-wrap items-center gap-x-3 text-[11px]">
					{#if item.explorer}
						<a
							href={item.explorer}
							class="font-medium text-lime-600 hover:underline dark:text-lime-400"
						>
							Rules
						</a>
					{/if}
					{#if item.homepage}
						<a
							href={item.homepage}
							class="inline-flex items-center gap-0.5 font-medium text-lime-600 hover:underline dark:text-lime-400"
						>
							Source <ArrowUpRight class="size-3" />
						</a>
					{/if}
				</p>
			</div>
			{#if on}<Badge variant="secondary" class="h-fit">On</Badge>{/if}
		</div>
	{/each}
</div>
