<script lang="ts">
	import { mode } from 'mode-watcher';
	import { userConfigs, type UserConfig } from '$lib/config/users';
	import { onMount } from 'svelte';
	import * as Popover from '$lib/components/ui/popover';
	import { Separator } from '$lib/components/ui/separator/';
	import { shuffleArray } from '$lib/utils';

	let cardColor = '';
	let users: UserConfig[] = [];

	onMount(() => {
		users = shuffleArray(userConfigs);
		mode.subscribe((value) => {
			cardColor = value == 'dark' ? 'bg-gray-400' : 'bg-gray-100';
		});
	});
</script>

<div class="pt-14">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl sm:text-center">
			<h2 class="text-base/7 font-semibold text-lime-600 dark:text-lime-400">
				Used around the world
			</h2>
			<p class="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-balance sm:text-5xl">
				Powering collaboration and consistency across industries.
			</p>
			<p class="mt-6 text-lg/8 text-neutral-500">
				Vale is trusted by thousands of writers, editors, and developers across the globe. <i
					>Click on a logo below to learn more.</i
				>
			</p>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-6 py-8 lg:px-8">
		<div
			class="grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl sm:mx-0 md:grid-cols-2 lg:grid-cols-3"
		>
			{#each users as user}
				<Popover.Root>
					<Popover.Trigger>
						<div class="{cardColor} p-6">
							<img
								class="max-h-12 w-full object-contain"
								src="/users/{user.name}.svg"
								alt={user.name}
								width="158"
								height="48"
							/>
						</div></Popover.Trigger
					>
					<Popover.Content>
						<p class="text-sm">{user.info}</p>
						<Separator class="my-2" />
						<div class="flex h-5 items-center space-x-4 text-sm">
							<div><a href={user.source} class="underline" target="_blank">Source</a></div>
							<Separator orientation="vertical" />
							<div><a href={user.website} class="underline" target="_blank">Website</a></div>
						</div>
					</Popover.Content>
				</Popover.Root>
			{/each}
		</div>
	</div>
	<div class="mx-auto mt-2 max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="flex justify-center">
				<p
					class="relative rounded-full {$mode === 'dark'
						? 'bg-gray-400/5'
						: 'bg-gray-50'} px-4 py-1.5 text-sm/6 ring-1 ring-inset ring-gray-900/5"
				>
					<a href="/library" class="font-semibold text-lime-600 dark:text-lime-400"
						><span class="absolute inset-0" aria-hidden="true"></span> Learn more about how Vale is
						being used
						<span aria-hidden="true">&rarr;</span></a
					>
				</p>
			</div>
		</div>
	</div>
</div>
