<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	let stack = [
		{
			name: 'vale',
			tech: 'Go',
			info: 'The main repository containing the Vale command-line interface.',
			link: 'https://github.com/vale-cli/vale'
		},
		{
			name: 'vale-ls',
			tech: 'Rust',
			info: 'An implementation of the Language Server Protocol (LSP) for the Vale command-line tool.',
			link: 'https://github.com/vale-cli/vale-ls'
		},
		{
			name: 'vale.sh',
			tech: 'Svelte',
			info: 'Website and documentation for the Vale CLI and related projects.',
			link: 'https://github.com/vale-cli/vale.sh'
		},
		{
			name: 'vale-action',
			tech: 'TypeScript',
			info: 'The official GitHub Action for Vale -- install, manage, and run Vale with ease.',
			link: 'https://github.com/vale-cli/vale-action'
		},
		{
			name: 'packages',
			tech: 'YAML',
			info: 'A collection of pre-packaged, Vale-compatible style guides and configurations.',
			link: 'https://github.com/vale-cli/packages'
		}
	];
</script>

<Table.Root class="my-4">
	<Table.Header>
		<Table.Row>
			<Table.Head class="w-[100px]">Name</Table.Head>
			<Table.Head>Tech</Table.Head>
			<Table.Head>Info</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each stack as { name, tech, info, link }}
			<Table.Row>
				<Table.Cell><a href={link} class="underline"><code>{name}</code></a></Table.Cell>
				<Table.Cell>{tech}</Table.Cell>
				<Table.Cell>{info}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
