/**
 * The site's code highlighting, shared by the blog (mdsvex.config.js) and the
 * asset generator (script/assets.mjs): one palette, one Vale-aware ini
 * grammar, however many places render code.
 */

/*
 * Vale's own highlighting: the site palette, not a borrowed editor theme.
 * Two hues do all the work -- lime for structure (keywords, keys, tags,
 * headings), amber for data (strings, numbers) -- over the same warm
 * neutrals as the rest of the site, with rose reserved for regexes. The
 * dark background matches --card, so a code block sits inside a card
 * instead of floating on it.
 */
export const valeLight = {
	name: 'vale-light',
	type: 'light',
	colors: {
		'editor.background': '#ffffff',
		'editor.foreground': '#181c10'
	},
	tokenColors: [
		{
			scope: ['comment', 'punctuation.definition.comment'],
			settings: { foreground: '#6b7360', fontStyle: 'italic' }
		},
		{
			scope: ['string', 'string.quoted', 'punctuation.definition.string'],
			settings: { foreground: '#a16207' }
		},
		{
			scope: ['constant.numeric', 'constant.language', 'constant.character'],
			settings: { foreground: '#b45309' }
		},
		{ scope: ['keyword', 'storage', 'storage.type'], settings: { foreground: '#4d7c0f' } },
		{ scope: ['entity.name.function', 'support.function'], settings: { foreground: '#3f6212' } },
		{
			scope: [
				'entity.name.tag',
				'entity.name.section',
				'support.type.property-name',
				'entity.other.attribute-name',
				'keyword.other.definition.ini',
				'variable.other.member'
			],
			settings: { foreground: '#4d7c0f' }
		},
		{
			scope: ['punctuation', 'keyword.operator', 'meta.brace'],
			settings: { foreground: '#79826d' }
		},
		{ scope: ['variable.parameter'], settings: { foreground: '#b45309' } },
		{ scope: ['string.regexp'], settings: { foreground: '#9f1239' } },
		{ scope: ['markup.heading'], settings: { foreground: '#4d7c0f', fontStyle: 'bold' } },
		{ scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
		{ scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
		{ scope: ['variable', 'support.variable'], settings: { foreground: '#181c10' } }
	]
};

export const valeDark = {
	name: 'vale-dark',
	type: 'dark',
	colors: {
		'editor.background': '#161911',
		'editor.foreground': '#e9ece2'
	},
	tokenColors: [
		{
			scope: ['comment', 'punctuation.definition.comment'],
			settings: { foreground: '#878f7c', fontStyle: 'italic' }
		},
		{
			scope: ['string', 'string.quoted', 'punctuation.definition.string'],
			settings: { foreground: '#fcd34d' }
		},
		{
			scope: ['constant.numeric', 'constant.language', 'constant.character'],
			settings: { foreground: '#fbbf24' }
		},
		{ scope: ['keyword', 'storage', 'storage.type'], settings: { foreground: '#a3e635' } },
		{ scope: ['entity.name.function', 'support.function'], settings: { foreground: '#d9f99d' } },
		{
			scope: [
				'entity.name.tag',
				'entity.name.section',
				'support.type.property-name',
				'entity.other.attribute-name',
				'keyword.other.definition.ini',
				'variable.other.member'
			],
			settings: { foreground: '#a3e635' }
		},
		{
			scope: ['punctuation', 'keyword.operator', 'meta.brace'],
			settings: { foreground: '#9aa38d' }
		},
		{ scope: ['variable.parameter'], settings: { foreground: '#fbbf24' } },
		{ scope: ['string.regexp'], settings: { foreground: '#fda4af' } },
		{ scope: ['markup.heading'], settings: { foreground: '#a3e635', fontStyle: 'bold' } },
		{ scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
		{ scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
		{ scope: ['variable', 'support.variable'], settings: { foreground: '#e9ece2' } }
	]
};

export const themes = [valeLight, valeDark];

/*
 * The stock ini grammar loses any key carrying a bracket parameter --
 * `Direct.Length[max] = 30` is exactly the syntax the posts teach -- so this
 * replaces it: dotted keys stay keys, the parameter gets its own color, and
 * levels and toggles read as constants.
 */
export const valeIni = {
	name: 'vale-ini',
	scopeName: 'source.vale-ini',
	repository: {},
	patterns: [
		{ match: '^\\s*[;#].*$', name: 'comment.line.ini' },
		{
			match: '^(\\[)([^\\]]*)(\\])',
			captures: {
				1: { name: 'punctuation.definition.section.ini' },
				2: { name: 'entity.name.section.ini' },
				3: { name: 'punctuation.definition.section.ini' }
			}
		},
		{
			match: '^([A-Za-z][A-Za-z0-9._-]*)(\\[)([A-Za-z][A-Za-z0-9]*)(\\])(?=\\s*=)',
			captures: {
				1: { name: 'keyword.other.definition.ini' },
				2: { name: 'punctuation.definition.parameter.ini' },
				3: { name: 'variable.parameter.ini' },
				4: { name: 'punctuation.definition.parameter.ini' }
			}
		},
		{ match: '^([A-Za-z][A-Za-z0-9._-]*)(?=\\s*=)', name: 'keyword.other.definition.ini' },
		{ match: '=', name: 'keyword.operator.ini' },
		{ match: '\\b(YES|NO|TRUE|FALSE|error|warning|suggestion)\\b', name: 'constant.language.ini' },
		{ match: '\\b\\d+\\b', name: 'constant.numeric.ini' }
	]
};
