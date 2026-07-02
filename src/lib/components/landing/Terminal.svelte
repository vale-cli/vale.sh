<script lang="ts">
	// A faithful recreation of Vale's default CLI output.
	type Sev = 'error' | 'warning' | 'suggestion';
	interface Alert {
		loc: string;
		sev: Sev;
		msg: string;
		rule: string;
	}

	const alerts: Alert[] = [
		{
			loc: '4:3',
			sev: 'error',
			msg: "Did you really mean 'existant'?",
			rule: 'Vale.Spelling'
		},
		{
			loc: '6:12',
			sev: 'warning',
			msg: "Use 'use' instead of 'utilize'.",
			rule: 'Microsoft.Vocab'
		},
		{
			loc: '9:1',
			sev: 'suggestion',
			msg: "In general, use active voice.",
			rule: 'write-good.Passive'
		}
	];

	const sevColor: Record<Sev, string> = {
		error: 'text-red-400',
		warning: 'text-amber-400',
		suggestion: 'text-sky-400'
	};
</script>

<div class="overflow-hidden rounded-xl border border-border bg-zinc-950 shadow-2xl shadow-black/20 ring-1 ring-black/5">
	<!-- Title bar -->
	<div class="flex items-center gap-2 border-b border-white/10 px-4 py-3">
		<span class="h-3 w-3 rounded-full bg-red-500/80"></span>
		<span class="h-3 w-3 rounded-full bg-amber-500/80"></span>
		<span class="h-3 w-3 rounded-full bg-lime-500/80"></span>
		<span class="ml-2 select-none font-mono text-xs text-zinc-500">bash — vale</span>
	</div>

	<!-- Body -->
	<div class="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed">
		<div class="whitespace-pre text-zinc-300">
			<span class="text-lime-400">$</span> vale README.md
		</div>

		<div class="mt-3 whitespace-pre text-zinc-100">README.md</div>

		{#each alerts as a}
			<div class="mt-1 flex gap-4 whitespace-pre">
				<span class="w-14 shrink-0 text-zinc-500">{a.loc}</span>
				<span class="w-[76px] shrink-0 {sevColor[a.sev]}">{a.sev}</span>
				<span class="text-zinc-200">{a.msg}</span>
				<span class="text-zinc-500">{a.rule}</span>
			</div>
		{/each}

		<div class="mt-3 whitespace-pre text-zinc-400">
			<span class="text-red-400">✖</span> 1 error, 1 warning and 1 suggestion in 1 file.
		</div>
	</div>
</div>
