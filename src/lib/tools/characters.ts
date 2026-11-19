/**
 * What the character counter reports beyond a single number: what kinds of
 * characters a text is made of, how many bytes it takes, and how many text
 * messages it would be sent as.
 */
import { graphemes } from './text';

export type Breakdown = {
	letters: number;
	digits: number;
	spaces: number;
	punctuation: number;
	/** Everything else: symbols, emoji. */
	other: number;
	/** As UTF-8, which is what a database column or an API limit counts. */
	bytes: number;
};

export function breakdown(text: string): Breakdown {
	const n = (re: RegExp) => (text.match(re) ?? []).length;
	const letters = n(/\p{L}/gu);
	const digits = n(/\p{N}/gu);
	const spaces = n(/\s/g);
	const punctuation = n(/\p{P}/gu);
	return {
		letters,
		digits,
		spaces,
		punctuation,
		other: Math.max(0, graphemes(text) - letters - digits - spaces - punctuation),
		bytes: new TextEncoder().encode(text).length
	};
}

// The GSM 03.38 default alphabet, and the extension characters that each
// take two of a message's places.
const GSM =
	'@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?' +
	'¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
const GSM_EXTENDED = '^{}\\[~]|€\f';

export type Sms = {
	/** `gsm`: 160 to a message. `unicode`: 70, once one character is outside the GSM alphabet. */
	encoding: 'gsm' | 'unicode';
	/** Places used, as the network counts them. */
	units: number;
	segments: number;
	/** Places left in the last message. */
	remaining: number;
	/** The first character that forced Unicode, if one did. */
	culprit?: string;
};

export function sms(text: string): Sms {
	let units = 0;
	let culprit: string | undefined;
	for (const c of text) {
		if (GSM.includes(c)) units += 1;
		else if (GSM_EXTENDED.includes(c)) units += 2;
		else {
			culprit = c;
			break;
		}
	}
	if (culprit === undefined) {
		const size = units <= 160 ? 160 : 153;
		const segments = Math.ceil(units / size);
		return { encoding: 'gsm', units, segments, remaining: segments * size - units };
	}
	// UCS-2 counts UTF-16 units, so an emoji is two.
	units = text.length;
	const size = units <= 70 ? 70 : 67;
	const segments = Math.ceil(units / size);
	return { encoding: 'unicode', units, segments, remaining: segments * size - units, culprit };
}
