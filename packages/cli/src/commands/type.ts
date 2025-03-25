import pc from '@onlynv/shared/colors';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import path from 'node:path';
import { parse } from 'onlynv';

import type { Interface } from '../interface';
import { resolveWorkspace } from '../util/workspace';
import glob from './glob';

const testId = (key: string) => {
	const identifier = /^[$_\p{ID_Start}][$_\u200C\u200D\p{ID_Continue}]*$/u;

	if (!identifier.test(key)) {
		return `['${key.replaceAll("'", "\\'")}']`;
	}

	return key;
};

const generateTs = (data: string[]) => {
	return `declare namespace NodeJS {
  interface ProcessEnv {
${data.map((key) => `    ${testId(key)}?: string`).join('\n')}
  }
}
// NOTE: This file should not be edited directly. It is generated from the 'nv type' command.`;
};

const generateBun = (data: string[]) => {
	return `declare module "bun" {
  interface Env {
${data.map((key) => `    ${testId(key)}?: string`).join('\n')}
  }
}
// NOTE: This file should not be edited directly. It is generated from the 'nv type' command.`;
};

export default async (int: Interface) => {
	const workspace = resolveWorkspace();

	if (!workspace) {
		console.error(pc.red('No workspace found.'));
		process.exit(1);
	}

	console.log(
		pc.yellow(`Generating types for ${basename(workspace)} (${int.flags.target || 'ts'})`)
	);
	console.log();

	const files = await glob(int);

	console.log();

	if (!files) {
		process.exit(1);
	}

	const data: Record<string, string> = {};

	for (const file of files) {
		const filepath = file.replace(workspace + '/', '');
		data[filepath] = readFileSync(file, 'utf-8');
	}

	const assembled: string[] = [];

	for (const [_, content] of Object.entries(data)) {
		const parsed = parse(content);

		if (parsed) {
			assembled.push(
				...Object.keys(parsed).filter((key) => {
					if (key.startsWith('production:') || key.startsWith('local:')) {
						return false;
					}

					return true;
				})
			);
		}
	}

	let outfile;
	let content;

	switch (int.flags.target || 'ts') {
		case 'ts': {
			content = generateTs(assembled);

			outfile = path.join(workspace, 'nv.d.ts');
			break;
		}
		case 'bun': {
			content = generateBun(assembled);
			outfile = path.join(workspace, 'nv.d.ts');
			break;
		}
		default: {
			console.log(pc.red('Invalid target'));
			process.exit(1);
		}
	}

	if (int.flags['dry-run']) {
		console.log(pc.yellow('Dry run:'), 'Would have written the following to', outfile);
		console.log();
		console.log(content);

		return;
	}

	writeFileSync(outfile, content);

	console.log(pc.green('Types generated successfully!'));
};
