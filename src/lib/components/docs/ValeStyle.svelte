<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import Separator from '../ui/separator/separator.svelte';

	let options = [
		{
			name: 'Vale.Spelling',
			description:
				'Checks for spelling errors in your content. Consumes any Hunspell-compatible dictionaries stored in <code>&lt;StylesPath&gt;/config/dictionaries</code>.'
		},
		{
			name: 'Vale.Terms',
			description: `Enforces the current project's accepted <a href="/docs/keys/vocab">Vocabulary</a> terms.`
		},
		{
			name: 'Vale.Avoid',
			description: `Enforces the current project's rejected <a href="/docs/keys/vocab">Vocabulary</a> terms.`
		},
		{
			name: 'Vale.Repetition',
			description: `Flags repeated words such as "the the" or "and and".`
		}
	];
</script>

<Table.Root class="my-0">
	<Table.Header>
		<Table.Row>
			<Table.Head>Name</Table.Head>
			<Table.Head>Description</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each options as opt}
			<Table.Row>
				<Table.Cell><code>{opt.name}</code></Table.Cell>
				<Table.Cell>{@html opt.description}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
