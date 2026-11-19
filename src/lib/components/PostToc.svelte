<script lang="ts">
	// A post's sections, twice: a collapsed list under the header on narrow
	// screens, and a rail beside the text on wide ones that marks the section
	// being read. The headings come from the post's metadata, so both render
	// on the server.
	import type { PostHeading } from '$lib/posts';

	let { headings, variant }: { headings: PostHeading[]; variant: 'inline' | 'rail' } = $props();

	let active = $state<string | undefined>(undefined);

	// The section being read is the last heading to pass under the site
	// header. Only the rail shows it.
	$effect(() => {
		if (variant !== 'rail') return;
		const ids = headings.map((h) => h.id);
		let frame = 0;
		const update = () => {
			frame = 0;
			let current: string | undefined;
			for (const id of ids) {
				const el = document.getElementById(id);
				if (el && el.getBoundingClientRect().top <= 120) current = id;
			}
			active = current;
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

{#if variant === 'inline'}
	<details class="group mt-8 rounded-xl border border-border bg-card text-sm xl:hidden">
		<summary
			class="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-medium [&::-webkit-details-marker]:hidden"
		>
			On this page
			<span class="text-muted-foreground transition-transform group-open:rotate-90">›</span>
		</summary>
		<ol class="border-t border-border px-4 py-3">
			{#each headings as heading (heading.id)}
				<li>
					<a class="block py-1 text-muted-foreground hover:text-foreground" href={`#${heading.id}`}
						>{heading.title}</a
					>
				</li>
			{/each}
		</ol>
	</details>
{:else}
	<nav aria-label="On this page" class="text-sm">
		<p class="font-medium">On this page</p>
		<ol class="mt-3 border-l border-border">
			{#each headings as heading (heading.id)}
				<li>
					<a
						href={`#${heading.id}`}
						aria-current={active === heading.id ? 'location' : undefined}
						class="-ml-px block border-l py-1 pl-3 leading-snug transition-colors {active ===
						heading.id
							? 'border-lime-500 font-medium text-foreground'
							: 'border-transparent text-muted-foreground hover:text-foreground'}"
						>{heading.title}</a
					>
				</li>
			{/each}
		</ol>
		<a class="mt-4 block text-muted-foreground hover:text-foreground" href="#top">↑ Back to top</a>
	</nav>
{/if}
