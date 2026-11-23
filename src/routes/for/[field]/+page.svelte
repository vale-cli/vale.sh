<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import ArrowLeft from 'lucide-svelte/icons/arrow-left';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Section from '$lib/components/features/Section.svelte';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import BrandIcon from '$lib/components/landing/BrandIcon.svelte';
	import { fields } from '$lib/data/fields';

	let { data } = $props();

	const field = $derived(data.field);
	// The icon is a component, so it comes from the module, not the load.
	const Icon = $derived(fields.find((f) => f.id === data.field.id)!.icon);
	const others = $derived(fields.filter((f) => f.id !== data.field.id));

	const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
	const external = (href: string) => href.startsWith('http');
</script>

<MetaTags
	title="{field.title} — Vale"
	description={field.lede}
	canonical="https://vale.sh/for/{field.id}"
	openGraph={{
		url: `https://vale.sh/for/${field.id}`,
		title: field.title,
		description: field.summary,
		images: [
			{
				url: `https://vale.sh/media/og/for/${field.id}.png`,
				width: 1200,
				height: 630,
				alt: field.title
			}
		]
	}}
/>

<article>
	<header class="border-b border-border">
		<div class="mx-auto max-w-4xl px-6 pb-14 pt-10 sm:pb-16 lg:px-8">
			<a
				href="/"
				class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft class="h-4 w-4" />
				Home
			</a>

			<div class="mt-8 flex items-center gap-3">
				<div
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-lime-500/20 bg-lime-500/10 text-lime-600 dark:text-lime-400"
				>
					<Icon class="h-5 w-5" />
				</div>
				<p
					class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
				>
					{field.label}
				</p>
			</div>

			<h1 class="mt-5 text-balance text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
				{field.title}
			</h1>
			<p class="mt-4 text-pretty text-xl leading-8 text-muted-foreground">{field.summary}</p>
			<p class="mt-6 text-pretty text-lg leading-8 text-foreground/85">{field.lede}</p>

			<div class="mt-8 flex flex-wrap gap-x-6 gap-y-3">
				<a
					href="https://docs.vale.sh/topics/installation"
					class="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-lime-500 decoration-2 underline-offset-4 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
				>
					Install Vale
					<ArrowRight class="h-4 w-4" />
				</a>
				<a
					href="#config"
					class="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
				>
					Skip to the config
				</a>
			</div>
		</div>
	</header>

	<Section title="Start with this config" lede={field.config.note}>
		<div id="config" class="scroll-mt-24 space-y-4">
			<div>
				<p class="mb-2 font-mono text-[11px] text-muted-foreground">.vale.ini</p>
				<CodeBlock html={data.html.config} code={field.config.code} />
			</div>
			<div>
				<p class="mb-2 text-sm text-foreground/85">
					Then download the packages it names and run Vale over the project:
				</p>
				<CodeBlock html={data.html.run} code={'vale sync\nvale .'} />
			</div>
		</div>
	</Section>

	<Section
		title="Packages"
		lede="Published styles to start from. A package in the Explorer installs by name with Packages and vale sync, one published elsewhere by its release URL, and every rule in either can be turned off or changed in your own config."
		wide
	>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.packages as pkg (pkg.name)}
				<a
					href={pkg.href}
					class="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-lime-500/40"
				>
					<h3 class="font-mono text-sm font-medium text-foreground">{pkg.name}</h3>
					<p class="text-sm leading-relaxed text-foreground/85">{pkg.description}</p>
					<p
						class="mt-auto flex items-center gap-3 pt-2 font-mono text-[11px] text-muted-foreground"
					>
						{#if pkg.rules}<span>{pkg.rules} rules</span>{/if}
						{#if pkg.downloads}<span>{compact.format(pkg.downloads)} downloads</span>{/if}
						<ArrowRight
							class="ml-auto h-3.5 w-3.5 text-lime-600 transition-transform group-hover:translate-x-0.5 dark:text-lime-400"
						/>
					</p>
				</a>
			{/each}
		</div>
	</Section>

	<Section title="Where it runs" lede={field.integrationsNote} wide>
		<ul class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.integrations as it (it.name)}
				<li>
					<a
						href={it.href}
						class="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-lime-500/40"
					>
						<BrandIcon name={it.name} slug={it.slug} avatar={it.avatar} size="h-8 w-8" />
						<span class="min-w-0">
							<span class="block font-medium text-foreground">{it.name}</span>
							<span class="block text-sm text-muted-foreground">{it.detail}</span>
						</span>
						{#if external(it.href)}<ArrowUpRight
								class="ml-auto h-4 w-4 shrink-0 text-muted-foreground"
							/>{:else}<ArrowRight class="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />{/if}
					</a>
				</li>
			{/each}
		</ul>

		<!--
			The agent tools: the plugin that installs them, then the skills this
			kind of writing reaches for, each as the request that brings it up.
		-->
		<div class="mt-10 rounded-2xl border border-border bg-card p-6">
			<div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
				<h3 class="font-medium text-foreground">With an agent</h3>
				<a
					href="/agents"
					class="inline-flex items-center gap-1 text-sm font-medium text-lime-600 dark:text-lime-400"
				>
					All agent tools <ArrowRight class="h-3.5 w-3.5" />
				</a>
			</div>
			<p class="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/85">
				The agent tools install as a Claude Code plugin: skills for setting up and tuning Vale, and
				hooks that lint each file the assistant writes. Type both lines in Claude Code, then ask for
				what you need.
			</p>
			<div class="mt-4">
				<CodeBlock html={data.html.plugin} code={data.plugin} />
			</div>
			<ul class="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
				{#each data.skills as sk (sk.name)}
					<li>
						<a href="/agents#skill-{sk.name}" class="group block">
							<span class="font-mono text-[13px] text-foreground">“{sk.ask}”</span>
							<span class="ml-1.5 font-mono text-[11px] text-muted-foreground">/vale:{sk.name}</span
							>
							<span
								class="mt-1 line-clamp-2 block text-sm leading-relaxed text-foreground/75 group-hover:text-foreground"
								>{sk.summary}</span
							>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</Section>

	<Section title="Who runs it" lede={field.adoptersNote} wide>
		<ul class="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.adopters as a (a.slug)}
				<li>
					<a href="/adopters/{a.slug}" class="group flex gap-3">
						<BrandIcon name={a.name} slug={a.icon} avatar={a.avatar} size="h-9 w-9" />
						<span class="min-w-0">
							<span
								class="block font-medium text-foreground underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-lime-500"
								>{a.name}</span
							>
							<span class="mt-0.5 block text-sm leading-relaxed text-foreground/75"
								>{a.context}</span
							>
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</Section>

	<Section
		title="Formats"
		lede="Where this kind of writing lives. Vale parses each one, so rules see the prose and skip the markup, the code, and the URLs."
	>
		<ul class="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
			{#each field.formats as f (f.href)}
				<li class="border-b border-border">
					<a
						href={f.href}
						class="group flex items-baseline justify-between gap-4 py-3 transition-colors hover:text-lime-600 dark:hover:text-lime-400"
					>
						<span>
							<span class="font-medium">{f.label}</span>
							{#if f.note}<span class="block text-sm text-muted-foreground">{f.note}</span>{/if}
						</span>
						<ArrowUpRight class="h-4 w-4 shrink-0 text-muted-foreground" />
					</a>
				</li>
			{/each}
		</ul>
	</Section>

	<Section title="Read more">
		<div class="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
			<div>
				<h3
					class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-muted-foreground"
				>
					On the blog
				</h3>
				<ul class="mt-4 space-y-6">
					{#each data.posts as post (post.slug)}
						<li>
							<a href="/blog/{post.slug}" class="group block">
								{#if post.study}
									<span
										class="font-mono text-[10px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
										>Case study</span
									>
								{/if}
								<span
									class="block font-medium text-foreground underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-lime-500"
									>{post.title}</span
								>
								<span class="mt-1 line-clamp-2 block text-sm leading-relaxed text-foreground/75"
									>{post.description}</span
								>
							</a>
						</li>
					{/each}
				</ul>
			</div>
			<div>
				<h3
					class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-muted-foreground"
				>
					In the docs
				</h3>
				<ul class="mt-4 space-y-4">
					{#each field.docs as d (d.href)}
						<li>
							<a
								href={d.href}
								class="group inline-flex items-center gap-1.5 font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-lime-500"
							>
								{d.label}
								{#if external(d.href)}<ArrowUpRight
										class="h-3.5 w-3.5 text-muted-foreground"
									/>{:else}<ArrowRight class="h-3.5 w-3.5 text-muted-foreground" />{/if}
							</a>
							{#if d.note}<p class="mt-0.5 text-sm text-muted-foreground">{d.note}</p>{/if}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</Section>

	<!-- The other kinds of writing, in the hero's tab order. -->
	<section class="bg-muted">
		<div class="mx-auto max-w-6xl px-6 py-14 sm:py-16 lg:px-8">
			<h2
				class="font-mono text-[11px] font-medium uppercase tracking-[0.13em] text-lime-600 dark:text-lime-400"
			>
				Other kinds of writing
			</h2>
			<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
				{#each others as other (other.id)}
					{@const OtherIcon = other.icon}
					<a
						href="/for/{other.id}"
						class="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-lime-500/40"
					>
						<div
							class="flex h-9 w-9 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10 text-lime-600 dark:text-lime-400"
						>
							<OtherIcon class="h-4 w-4" />
						</div>
						<h3 class="font-medium text-foreground">{other.label}</h3>
						<p class="text-sm leading-relaxed text-foreground/85">{other.summary}</p>
						<span
							class="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-lime-600 dark:text-lime-400"
						>
							Read the guide
							<ArrowRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
						</span>
					</a>
				{/each}
			</div>
		</div>
	</section>
</article>
