<script lang="ts">
	import { MetaTags } from 'svelte-meta-tags';
	import { siteConfig } from '$lib/config/site';

	const description =
		'What the Vale browser extension stores, what it fetches, and what it sends: it checks your writing inside your browser, and your text never leaves it.';

	const link =
		'font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground';

	// Each item matches what the extension's code does; keep them in step.
	const stored = [
		'Your profile: its .vale.ini, the style packages you sync or upload, and the format you chose for each site.',
		'Which sites it is on or off for, and your options, such as checking as you type.',
		'What you said from a card: words added to your vocabulary, rules turned off, and alerts dismissed. A dismissal keeps the flagged words and the word on either side of them, so the same alert stays hidden there.'
	];

	const fetched = [
		'The style packages a configuration names, from their GitHub releases or a URL you add. A URL on any other host is fetched only after you grant that host when asked.'
	];
</script>

<MetaTags
	title="Browser extension privacy policy — Vale"
	{description}
	canonical="https://vale.sh/privacy/extension"
	openGraph={{
		url: 'https://vale.sh/privacy/extension',
		title: 'Vale browser extension privacy policy',
		description,
		images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: 'The Vale logo' }]
	}}
/>

<article>
	<header class="border-b border-border/60 py-14 sm:py-20">
		<div class="mx-auto max-w-3xl px-6 lg:px-8">
			<h1 class="text-base/7 font-semibold text-lime-600 dark:text-lime-400">Privacy policy</h1>
			<p class="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-5xl">
				Your writing stays in your browser.
			</p>
			<p class="mt-6 text-pretty text-lg leading-8 text-muted-foreground">
				This policy covers the Vale browser extension for Chrome, Edge, and Firefox. Vale runs
				inside the extension and checks your text where you write it. The text is never sent to a
				server, and the extension collects nothing about you.
			</p>
			<p class="mt-4 text-sm text-muted-foreground">Effective November 21, 2026.</p>
		</div>
	</header>

	<div class="mx-auto max-w-3xl space-y-12 px-6 py-14 leading-7 sm:py-16 lg:px-8">
		<section>
			<h2 class="text-2xl font-semibold tracking-tight">What it collects</h2>
			<p class="mt-4 text-muted-foreground">
				Nothing. There is no account, no analytics, no telemetry, and no crash reporting. No data is
				sold, shared, or used for anything but checking your writing.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-semibold tracking-tight">What it stores</h2>
			<p class="mt-4 text-muted-foreground">
				The extension keeps the following in your browser’s extension storage, on your device. It
				isn’t synced or sent anywhere.
			</p>
			<ul class="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
				{#each stored as item (item)}
					<li>{item}</li>
				{/each}
			</ul>
			<p class="mt-4 text-muted-foreground">Removing the extension deletes all of it.</p>
		</section>

		<section>
			<h2 class="text-2xl font-semibold tracking-tight">What it fetches</h2>
			<p class="mt-4 text-muted-foreground">
				The extension makes only these requests, and they download files without uploading anything:
			</p>
			<ul class="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
				{#each fetched as item (item)}
					<li>{item}</li>
				{/each}
			</ul>
			<p class="mt-4 text-muted-foreground">
				No request contains your text or anything the extension stores. The host that serves a file
				sees what it sees with any download, such as your IP address and which file was asked for.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-semibold tracking-tight">What it reads on a page</h2>
			<p class="mt-4 text-muted-foreground">
				On a site it is on for, the extension reads the text of the field you are writing in, so it
				can check it and underline what it finds. On any other site, it only asks whether it is on
				for that site. It doesn’t read the rest of the page, your browsing history, or your
				passwords.
			</p>
		</section>

		<section>
			<h2 class="text-2xl font-semibold tracking-tight">Changes and contact</h2>
			<p class="mt-4 text-muted-foreground">
				A change to this policy is posted here with a new effective date. Questions go to
				<a
					href="https://github.com/vale-cli/vale-web/issues"
					target="_blank"
					rel="noreferrer"
					class={link}>the extension’s issue tracker</a
				>.
			</p>
		</section>
	</div>
</article>
