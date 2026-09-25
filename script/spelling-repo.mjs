// Turn the per-format repository timings into the post's data.
//
//   node script/spelling-repo.mjs path/to/repos.log
//
// Each line of the log is `<format> <tool> <mean seconds> <stddev> <user seconds> <peak MB>`,
// one per tool per format, from a twenty-file repository of that format's
// clean twin. Writes src/lib/data/spelling-repo.json.
import { readFileSync, writeFileSync } from 'node:fs';

const [, , path] = process.argv;
const rows = {};
for (const line of readFileSync(path, 'utf8').split('\n')) {
	const [format, tool, mean, , user, mb] = line.trim().split(/\s+/);
	if (!format || !tool || mean === undefined || mb === undefined) continue;
	rows[format] ??= {};
	rows[format][tool] = { seconds: Number(mean), user: Number(user), mb: Number(mb) };
}
writeFileSync(
	new URL('../src/lib/data/spelling-repo.json', import.meta.url),
	JSON.stringify({ files: 20, rows }, null, '\t') + '\n'
);
console.log(Object.keys(rows).length, 'formats');
