<script lang="ts">
	import { siteConfig } from '$lib/config/site.js';
	import { Icons } from '$lib/components/icons';
</script>

<footer class="border-t border-border/40">
	<div class="mx-auto max-w-7xl px-6 py-6 md:flex md:items-center md:justify-between lg:px-8">
		<div class="flex justify-center gap-x-6 md:order-2">
			<a href={siteConfig.links.github} class="text-gray-400 hover:text-gray-300">
				<span class="sr-only">GitHub</span>
				<Icons.GitHub class="size-5" />
			</a>
			<a href={siteConfig.links.discord} class="text-gray-400 hover:text-gray-300">
				<span class="sr-only">X</span>
				<Icons.Discord class="size-5" />
			</a>
			<a href={siteConfig.links.twitter} class="text-gray-400 hover:text-gray-300">
				<span class="sr-only">X/Twitter</span>
				<Icons.Twitter class="size-5" />
			</a>
		</div>
		<p class="mt-8 text-center text-sm/6 text-gray-400 md:order-1 md:mt-0">
			Built and maintained by <a
				href={siteConfig.links.jdkato}
				class="text-gray-400 underline hover:text-gray-300">@jdkato</a
			>.
		</p>
	</div>
</footer>
