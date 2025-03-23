import pc from '@onlynv/shared/colors';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { Interface } from '../interface';

const strip = (data: string) => {
	let stripped = '';

	let insideQuotes = false;

	for (const line of data.split('\n')) {
		let strippedLine = '';

		// skip nv dependent lines
		if (line.startsWith('production:') || line.startsWith('local:')) {
			continue;
		}

		const [beforeeq, ...rest] = line.split('=');

		if (!insideQuotes) {
			strippedLine = beforeeq + (rest.length ? '=' : '');
		}

		for (const part of rest) {
			if (part.includes('"') || part.includes("'")) {
				insideQuotes = !insideQuotes;
			}
		}

		stripped += strippedLine + '\n';
	}

	return stripped.trim();
};

export default async (int: Interface) => {
	if (!int.flags.file || typeof int.flags.file !== 'string') {
		console.error(pc.red('Specify a file to strip: nv strip <file>'));
		process.exit(1);
	}

	const file = path.resolve(int.flags.file);

	if (!file) {
		console.error(pc.red('File not found.'));
		process.exit(1);
	}

	let data;

	try {
		data = readFileSync(file, 'utf-8');
	} catch (e) {
		console.error(pc.red('File not found.'));
		process.exit(1);
	}

	const stripped = strip(data);

	console.log(stripped);
};
