<script lang="ts">
	import SiteHeader from '$lib/components/SiteHeader.svelte';
	import EventBanner from '$lib/components/EventBanner.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { ModeWatcher } from 'mode-watcher';

	import '../styles/app.css';
	import '../styles/anchor.css';
	import '../styles/code.css';
	import '../styles/autocomplete.css';
	import '../styles/docsearch.css';

	let { children } = $props();
</script>

<ModeWatcher />

<SiteHeader />
<EventBanner />
<div class="flex-1">
	{@render children()}
</div>
<SiteFooter />
