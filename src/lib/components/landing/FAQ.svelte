<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';
</script>

<div class="px-6 py-5 pt-14 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-2xl sm:text-center">
		<h2 class="text-base/7 font-semibold text-lime-600 dark:text-lime-400">Built for you</h2>
		<h2 class="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
			Private, open source, and customizable.
		</h2>
		<p class="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-neutral-500">
			Vale runs entirely <b>offline</b>&mdash;ensuring that your content is never sent to a remote
			server for processing or training purposes.
		</p>
	</div>
	<div class="flex flex-row py-6 sm:items-center sm:justify-center">
		<ul
			role="list"
			class="grid grid-cols-1 gap-x-8 gap-y-3 text-base/7 sm:grid-cols-2 md:grid-cols-3"
		>
			<li class="flex gap-x-3">
				<svg
					class="h-7 w-5 flex-none"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					data-slot="icon"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
						clip-rule="evenodd"
					/>
				</svg>
				No server-side content processing.
			</li>
			<li class="flex gap-x-3">
				<svg
					class="h-7 w-5 flex-none"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					data-slot="icon"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
						clip-rule="evenodd"
					/>
				</svg>
				Available for macOS, Windows, and Linux.
			</li>
			<li class="flex gap-x-3">
				<svg
					class="h-7 w-5 flex-none"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					data-slot="icon"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
						clip-rule="evenodd"
					/>
				</svg>
				Understands markup and code.
			</li>
			<li class="flex gap-x-3">
				<svg
					class="h-7 w-5 flex-none"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					data-slot="icon"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
						clip-rule="evenodd"
					/>
				</svg>
				Implementations of popular style guides.
			</li>
			<li class="flex gap-x-3">
				<svg
					class="h-7 w-5 flex-none"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					data-slot="icon"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
						clip-rule="evenodd"
					/>
				</svg>
				Create &amp; share your own custom rules.
			</li>
			<li class="flex gap-x-3">
				<svg
					class="h-7 w-5 flex-none"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
					data-slot="icon"
				>
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
						clip-rule="evenodd"
					/>
				</svg>
				Open source, MIT-licensed, and actively maintained.
			</li>
		</ul>
	</div>
</div>
