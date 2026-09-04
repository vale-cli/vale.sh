<script lang="ts">
	import { siteConfig } from '$lib/config/site.js';
	import { Icons } from '$lib/components/icons';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import PenTool from 'lucide-svelte/icons/pen-tool';
	import PackageSearch from 'lucide-svelte/icons/package-search';
	import WandSparkles from 'lucide-svelte/icons/wand-sparkles';
	import Sparkles from 'lucide-svelte/icons/sparkles';

	/*
		Two bands. The first is the brand beside a toolbar of the site's own
		apps: those are things you open, so they get buttons rather than a
		column of links. The second is three columns grouped by what someone is
		trying to do, so docs.vale.sh and /library sit together under Resources
		even though one is a different host.
	*/
	const tools = [
		{ label: 'Vale Studio', href: 'https://studio.vale.sh', icon: PenTool, external: true },
		{ label: 'Style Explorer', href: '/explorer', icon: PackageSearch },
		{ label: 'Config Generator', href: '/generator', icon: WandSparkles },
		{ label: 'Agent Skills', href: '/skills', icon: Sparkles }
	];

	const columns = [
		{
			heading: 'Get Vale',
			links: [
				{ label: 'Install', href: 'https://docs.vale.sh/topics/installation', external: true },
				{ label: 'Releases', href: siteConfig.links.releases, external: true },
				{ label: 'Docker', href: siteConfig.links.docker, external: true },
				{
					label: 'VS Code',
					href: 'https://marketplace.visualstudio.com/items?itemName=ChrisChinchilla.vale-vscode',
					external: true
				},
				{ label: 'Vale CMS', href: '/cms' }
			]
		},
		{
			heading: 'Resources',
			links: [
				{ label: 'Documentation', href: 'https://docs.vale.sh', external: true },
				{ label: 'Media Library', href: '/library' },
				{ label: 'Press Guide', href: '/press' },
				{ label: 'Brand Assets', href: '/brand' }
			]
		},
		{
			heading: 'Community',
			links: [
				{ label: 'GitHub', href: siteConfig.links.org, external: true },
				{ label: 'Discord', href: siteConfig.links.discord, external: true },
				// Styles people publish themselves, as opposed to the curated ones
				// under Resources.
				{
					label: 'Topic',
					href: 'https://github.com/topics/vale-linter-style',
					external: true
				},
				{ label: 'Adopters', href: '/adopters' },
				// Both funding links live on /sponsor now, as the page's two CTAs.
				{ label: 'Support', href: '/sponsor' }
			]
		}
	];

	const social = [
		{ label: 'GitHub', href: siteConfig.links.org, icon: Icons.GitHub, class: 'h-4 w-4' },
		{ label: 'Discord', href: siteConfig.links.discord, icon: Icons.Discord, class: 'h-4 w-4' },
		{
			label: 'X (formerly Twitter)',
			href: siteConfig.links.twitter,
			icon: Icons.Twitter,
			class: 'h-3.5 w-3.5'
		}
	];

	const eyebrow =
		'font-mono text-xs font-semibold uppercase tracking-[0.14em] text-lime-600 dark:text-lime-400';
</script>

<footer class="border-t border-border/40">
	<div class="mx-auto max-w-6xl border-border/40 px-6 lg:border-x lg:px-8">
		<!-- Brand and toolbar -->
		<div class="flex flex-col gap-10 py-12 lg:flex-row lg:items-start lg:justify-between">
			<div class="max-w-sm">
				<a href="/" class="inline-flex items-center gap-2" aria-label="Vale">
					<Icons.logo class="h-5 w-5" />
					<Icons.wordmark class="h-4 w-auto text-foreground" />
				</a>

				<p class="mt-3 text-sm leading-6 text-muted-foreground">
					{siteConfig.description.trim()}
				</p>

				<!-- Same pill language as the hero eyebrow. -->
				<a
					href="https://github.com/errata-ai/vale/blob/master/LICENSE"
					target="_blank"
					rel="noreferrer"
					class="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 py-1 pl-2.5 pr-3 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted"
				>
					<span class="h-1.5 w-1.5 rounded-full bg-lime-500"></span>
					MIT licensed
				</a>
			</div>

			<nav aria-label="Tools" class="lg:max-w-lg">
				<h2 class={eyebrow}>Tools</h2>
				<ul class="mt-4 flex flex-wrap gap-2">
					{#each tools as tool (tool.label)}
						{@const Glyph = tool.icon}
						<li>
							<a
								href={tool.href}
								target={tool.external ? '_blank' : undefined}
								rel={tool.external ? 'noreferrer' : undefined}
								class="group inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-lime-500/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
							>
								<Glyph class="h-4 w-4 text-lime-600 dark:text-lime-400" />
								{tool.label}
								{#if tool.external}
									<ArrowUpRight
										class="h-3.5 w-3.5 text-muted-foreground/60 transition-colors group-hover:text-foreground"
									/>
								{/if}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		</div>

		<!-- Link columns -->
		<div class="grid gap-10 border-t border-border/40 py-10 sm:grid-cols-3 lg:gap-8">
			{#each columns as column (column.heading)}
				<div>
					<h2 class={eyebrow}>{column.heading}</h2>
					<ul class="mt-4 space-y-2.5">
						{#each column.links as link (link.label)}
							<li>
								<a
									href={link.href}
									target={link.external ? '_blank' : undefined}
									rel={link.external ? 'noreferrer' : undefined}
									class="text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									{link.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>

		<div
			class="flex flex-col-reverse items-center gap-4 border-t border-border/40 py-6 sm:flex-row sm:justify-between"
		>
			<p class="text-sm text-muted-foreground">
				Built and maintained by
				<a
					href={siteConfig.links.jdkato}
					target="_blank"
					rel="noreferrer"
					class="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
				>
					@jdkato
				</a>.
			</p>

			<nav class="flex items-center gap-1" aria-label="Vale on other platforms">
				{#each social as item (item.label)}
					{@const Glyph = item.icon}
					<a
						href={item.href}
						target="_blank"
						rel="noreferrer"
						class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
					>
						<Glyph class="{item.class} fill-current" />
						<span class="sr-only">{item.label}</span>
					</a>
				{/each}
			</nav>
		</div>
	</div>
</footer>
