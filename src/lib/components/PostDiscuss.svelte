<script lang="ts">
	// Where a post gets talked about. Mergecord announces each post to the
	// server's feed, so the invite is the link that works for everyone.
	import { Icons } from '$lib/components/icons';
	import { siteConfig } from '$lib/config/site';
</script>

<aside
	class="not-prose mt-14 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4"
>
	<div class="text-sm">
		<p class="font-medium">Discuss this post</p>
		<p class="mt-0.5 text-muted-foreground">
			Questions, corrections, and disagreements all go to the Vale Discord.
		</p>
	</div>
	<a
		href={siteConfig.links.discord}
		target="_blank"
		rel="noopener noreferrer"
		class="inline-flex items-center gap-2 rounded-full border border-lime-500 bg-lime-500/10 px-4 py-1.5 text-sm font-medium transition-colors hover:bg-lime-500/20"
	>
		<Icons.Discord class="h-4 w-4 fill-current" />
		Join the conversation
	</a>
</aside>
