<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import docsearch from '@docsearch/js';

	let searchContainer: HTMLElement;

	onMount(() => {
		if (browser) {
			docsearch({
				container: searchContainer,
				appId: '2Y8OU39U1X',
				indexName: 'docsearch_mock',
				apiKey: '0e82d6007f06d9f280629a37bb8a0892',
				placeholder: 'Search the docs...',
				translations: {
					button: {
						buttonText: 'Search docs...',
						buttonAriaLabel: 'Search the documentation'
					}
				}
			});
		}
	});
</script>

<div bind:this={searchContainer} id="docsearch"></div>
