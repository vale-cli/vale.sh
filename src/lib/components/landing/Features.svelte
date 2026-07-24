<script lang="ts">
	import Gauge from 'lucide-svelte/icons/gauge';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import Code from 'lucide-svelte/icons/code';
	import BookOpen from 'lucide-svelte/icons/book-open';
	import SlidersHorizontal from 'lucide-svelte/icons/sliders-horizontal';
	import MonitorSmartphone from 'lucide-svelte/icons/monitor-smartphone';

	interface Feature {
		icon: typeof Gauge;
		title: string;
		description: string;
	}

	const features: Feature[] = [
		{
			icon: ShieldCheck,
			title: 'Private by design',
			description:
				'Vale runs entirely offline. Your content is never sent to a remote server for processing or training.'
		},
		{
			icon: Code,
			title: 'Markup-aware',
			description:
				'Understands Markdown, AsciiDoc, reStructuredText, HTML, and source code—linting prose while ignoring syntax.'
		},
		{
			icon: BookOpen,
			title: 'Style guides included',
			description:
				'Ready-made implementations of Microsoft, Google, and other popular style guides, plus community packages.'
		},
		{
			icon: SlidersHorizontal,
			title: 'Fully customizable',
			description:
				'Write your own rules in YAML—no plugins to compile. Match your brand voice and share rules across a team.'
		},
		{
			icon: Gauge,
			title: 'Fast, single binary',
			description:
				'Built in Go with no runtime dependencies. Drop it into any editor, CI pipeline, or pre-commit hook.'
		},
		{
			icon: MonitorSmartphone,
			title: 'Runs everywhere',
			description:
				'One tool for macOS, Windows, and Linux—MIT-licensed, open source, and actively maintained.'
		}
	];
</script>

<section id="features" class="border-b border-border/60 py-14 sm:py-16">
	<div class="mx-auto max-w-6xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl text-center">
			<h2 class="text-base font-semibold text-lime-500">Why Vale</h2>
			<p class="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
				Linting built for the way you write
			</p>
			<p class="mt-6 text-pretty text-lg leading-8 text-muted-foreground">
				The precision of a code linter, applied to prose—so quality and consistency stop being a
				manual review step.
			</p>
		</div>

		<div
			class="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 sm:grid-cols-2 lg:grid-cols-3"
		>
			{#each features as feature}
				<div class="flex flex-col gap-4 bg-background p-8">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg border border-lime-500/20 bg-lime-500/10 text-lime-500"
					>
						<feature.icon class="h-5 w-5" />
					</div>
					<h3 class="text-lg font-semibold text-foreground">{feature.title}</h3>
					<p class="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>
