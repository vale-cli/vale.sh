<script>
	import { onMount } from 'svelte';
	import { mode } from 'mode-watcher';

	const isDarkMode = $mode === 'dark';
	const style = isDarkMode
		? '{"a":{"display":"none"}, "h2": {"display":"none"}}'
		: '{"a":{"display":"none"}, "h2": {"display":"none"}}';

	onMount(() => {
		const script = document.createElement('script');
		script.src = `https://opencollective.com/vale/banner.js?style=${encodeURIComponent(style)}`;
		script.async = true;

		const el = document.getElementById('opencollective');
		if (el) {
			el.appendChild(script);
		}
	});
</script>

<div class="pt-14">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl sm:text-center">
			<h2 class="text-base/7 font-semibold text-lime-500">Supported by a community</h2>
			<p class="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-balance sm:text-5xl">
				Sponsors &amp; Backers
			</p>
			<p class="mt-6 text-lg/8 text-neutral-500">
				A big thank you to all of our sponsors and backers! 🙏
			</p>
			<div id="opencollective"></div>
		</div>
	</div>
</div>
