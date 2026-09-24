<script lang="ts">
	import { tagsOf, type PostMeta } from '$lib/posts';

	// The post's tags as chips, each a link to its tag page. Inside a card
	// whose title link covers the whole card, the chips sit above it.
	let { post, class: klass = '' }: { post: PostMeta; class?: string } = $props();

	const tags = $derived(tagsOf(post));
</script>

{#if tags.length > 0}
	<ul class="relative z-10 flex flex-wrap gap-1.5 {klass}">
		{#each tags as tag (tag.slug)}
			<li>
				<a
					href={`/blog/tags/${tag.slug}`}
					class="inline-flex rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground ring-1 ring-inset ring-border transition-colors hover:text-foreground hover:ring-lime-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500"
				>
					{tag.label}
				</a>
			</li>
		{/each}
	</ul>
{/if}
