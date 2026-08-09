<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import ArrowUpRight from 'lucide-svelte/icons/arrow-up-right';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import Zap from 'lucide-svelte/icons/zap';
	import Server from 'lucide-svelte/icons/server';
	import CopyButton from '$lib/components/CopyButton.svelte';

	// Lives on /skills rather than the landing page: the hero and the footer
	// already link here, and the edit hook and the MCP server have no other
	// surface on the site at all. Keeping the three together is the point --
	// the skills alone read as "paste a URL into a chat".
	//
	// The free/paid split is stated on each card rather than buried in a
	// footnote. Two of these three need no account, and that has to be obvious
	// on a page whose whole promise is that Vale is free.
	const install = `/plugin marketplace add vale-cli/agent-tools
/plugin install vale@agent-tools`;

	// CopyButton owns the icon and its own absolute placement; the copied state
	// and the clipboard write stay here.
	let copied = $state(false);
	function copyCode() {
		navigator.clipboard.writeText(install);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	const pieces = [
		{
			icon: Sparkles,
			title: 'Skills',
			cost: 'Free',
			body: 'Setup, fixing alerts, triaging a noisy first run, vocabularies, and CI. Each one runs the CLI in your repository and ends with a report.',
			// An anchor, not a link: this renders on /skills, above the list.
			href: '#skill-list',
			cta: 'Browse the skills',
			external: false
		},
		{
			icon: Zap,
			title: 'Edit hook',
			cost: 'Free',
			body: 'Lints each prose file the moment your assistant writes it and hands back only the error-level alerts, so mistakes get fixed in the same turn they were made.',
			href: 'https://github.com/vale-cli/agent-tools',
			cta: 'See the hook',
			external: true
		},
		{
			icon: Server,
			title: 'MCP server',
			cost: 'Vale CMS',
			body: 'The engine itself, as tools an assistant can call — so a rule it writes gets compiled, tested, and costed before it reaches your repository.',
			href: '/cms#mcp',
			cta: 'What it can check',
			external: false
		}
	];
</script>

<div id="ai" class="mx-auto max-w-7xl scroll-mt-24 px-6 pt-7 lg:px-8">
	<div class="mx-auto max-w-2xl sm:text-center">
		<h2 class="text-base/7 font-semibold text-lime-500">Vale for agents</h2>
		<p class="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-balance sm:text-5xl">
			Your assistant writes the docs. Something should check them.
		</p>
		<p class="mt-6 text-lg/8 text-neutral-500">
			A model will write you plausible prose and plausible linter rules with equal confidence. Vale
			is what tells it which of those actually hold up&mdash;in the same turn, not in review.
		</p>
	</div>

	<div class="mx-auto mt-14 max-w-5xl">
		<div class="grid gap-4 sm:grid-cols-3">
			{#each pieces as piece (piece.title)}
				<div class="flex flex-col rounded-xl border border-border bg-card p-6">
					<div class="flex items-center justify-between gap-3">
						<span
							class="inline-flex rounded-lg bg-lime-500/10 p-2 text-lime-600 dark:text-lime-400"
						>
							<piece.icon class="size-5" />
						</span>
						<span
							class="rounded-md bg-muted px-2 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground"
						>
							{piece.cost}
						</span>
					</div>
					<h3 class="mt-4 text-lg font-semibold">{piece.title}</h3>
					<p class="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{piece.body}</p>
					<a
						href={piece.href}
						target={piece.external ? '_blank' : undefined}
						rel={piece.external ? 'noreferrer' : undefined}
						class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-lime-600 hover:underline dark:text-lime-400"
					>
						{piece.cta}
						{#if piece.external}
							<ArrowUpRight class="size-3.5" />
						{:else}
							<ArrowRight class="size-3.5" />
						{/if}
					</a>
				</div>
			{/each}
		</div>

		<div class="mt-8 rounded-xl border border-border bg-muted/30 p-5 sm:p-6">
			<div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
				<h3 class="text-sm font-semibold">All three, in Claude Code</h3>
				<p class="text-xs text-muted-foreground">
					Other clients can read <code class="font-mono">skills/</code> directly.
				</p>
			</div>
			<div class="relative mt-3">
				<pre
					class="overflow-x-auto rounded-lg border border-border bg-background p-4 pr-12 font-mono text-[12.5px] leading-relaxed"><code
						>{install}</code
					></pre>
				<CopyButton
					{copied}
					{copyCode}
					className="text-muted-foreground hover:bg-muted hover:text-foreground"
				/>
			</div>
			<p class="mt-3 text-sm text-muted-foreground">
				The skills and the hook need nothing but the Vale binary. The MCP server is the one paid
				piece &mdash; it runs on <a
					href="/cms"
					class="font-medium text-foreground underline decoration-lime-500/40 underline-offset-4 hover:text-lime-600 dark:hover:text-lime-400"
					>Vale CMS</a
				>, and everything else works without it.
			</p>
		</div>
	</div>
</div>
