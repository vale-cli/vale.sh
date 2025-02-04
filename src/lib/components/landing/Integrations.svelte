<script lang="ts">
	import { mode } from 'mode-watcher';
</script>

<div class="mx-auto max-w-7xl px-6 pt-7 lg:px-8">
	<div class="mx-auto max-w-2xl sm:text-center">
		<h2 class="text-base/7 font-semibold text-lime-500">One tool, every app</h2>
		<p class="mt-2 text-pretty text-4xl font-semibold tracking-tight sm:text-balance sm:text-5xl">
			More than just a command-line interface.
		</p>
		<p class="mt-6 text-lg/8 text-neutral-500">
			Vale integrates with many popular apps, browsers, and platforms&mdash;including VS Code,
			Google Chrome, GitHub Actions, and more.
		</p>
	</div>
</div>
<div class="relative overflow-hidden pt-4">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<img
			src="/media/vscode.png"
			alt="App screenshot"
			class="mb-[-12%]"
			width="2432"
			height="1442"
		/>
		<div class="relative" aria-hidden="true">
			<div
				class="absolute -inset-x-20 bottom-0 bg-gradient-to-t {$mode === 'dark'
					? 'from-zinc-950'
					: 'from-white'} pt-[7%]"
			></div>
		</div>
	</div>
</div>
<div class="mx-auto max-w-7xl px-6 pb-5 lg:px-8">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mt-14 flex justify-center">
			<p
				class="relative rounded-full {$mode === 'dark'
					? 'bg-gray-400/5'
					: 'bg-gray-50'} px-4 py-1.5 text-sm/6 ring-1 ring-inset ring-gray-900/5"
			>
				<a href="/docs/guides/lsp" class="font-semibold text-lime-500"
					><span class="absolute inset-0" aria-hidden="true"></span> Learn more about our
					integrations
					<span aria-hidden="true">&rarr;</span></a
				>
			</p>
		</div>
	</div>
</div>
