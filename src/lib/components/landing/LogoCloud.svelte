<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import * as Popover from '$lib/components/ui/popover';
	import { Separator } from '$lib/components/ui/separator/';
	import { userConfigs, type UserConfig } from '$lib/config/users';

	// Real adopters with public .vale.ini configs (see src/lib/config/users.ts),
	// strongest names first.
	const order = [
		'Microsoft',
		'Amazon Web Services',
		'GitLab',
		'Cloudflare',
		'Red Hat',
		'Datadog',
		'Docker',
		'Grafana Labs',
		'Spectro Cloud'
	];

	const logos: UserConfig[] = order
		.map((name) => userConfigs.find((u) => u.name === name))
		.filter((u): u is UserConfig => Boolean(u));
</script>

<section class="border-b border-border/60 py-14">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<p class="text-center text-sm font-medium text-muted-foreground">
			Trusted by documentation teams at
		</p>
		<div class="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
			{#each logos as user}
				<Popover.Root>
					<Popover.Trigger
						class="flex items-center justify-center rounded-xl bg-white p-5 ring-1 ring-black/[0.06] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:outline-none dark:bg-zinc-400 dark:ring-white/10"
						aria-label="How {user.name} uses Vale"
					>
						<img
							src="/users/{user.name}.svg"
							alt={user.name}
							class="max-h-8 w-full object-contain"
							loading="lazy"
						/>
					</Popover.Trigger>
					<Popover.Content class="w-72">
						<p class="text-sm font-semibold text-foreground">{user.name}</p>
						<p class="mt-1 text-sm text-muted-foreground">{user.info}</p>
						<Separator class="my-3" />
						<div class="flex h-5 items-center space-x-4 text-sm">
							<a href={user.source} class="text-lime-500 hover:underline" target="_blank" rel="noreferrer">Config source</a>
							<Separator orientation="vertical" />
							<a href={user.website} class="text-lime-500 hover:underline" target="_blank" rel="noreferrer">Website</a>
						</div>
					</Popover.Content>
				</Popover.Root>
			{/each}
		</div>
		<div class="mt-8 text-center">
			<a
				href="/library"
				class="inline-flex items-center gap-1.5 text-sm font-medium text-lime-500 hover:text-lime-600"
			>
				See how teams use Vale
				<ArrowRight class="h-4 w-4" />
			</a>
		</div>
	</div>
</section>
