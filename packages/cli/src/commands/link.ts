import pc from '@onlynv/shared/colors';
import type { LinkResponse } from '@onlynv/shared/structs/link';
import crypto from 'node:crypto';
import { argv } from 'node:process';
import readline from 'node:readline';
import open from 'open';

import type { Interface } from '../interface';
import { getConfig } from '../util/config';
import { setKey } from '../util/storage';
import { resolveWorkspace } from '../util/workspace';
import { poll } from './init';

const URL =
	process.env.npm_lifecycle_script || argv.includes('DEV') ?
		'http://localhost:3000'
	:	'https://onlynv.dev';

export default async (int: Interface) => {
	const workspace = resolveWorkspace();
	const config = getConfig(workspace);

	console.log(pc.yellow('Linking project...'));
	console.log();

	const iv = crypto.randomBytes(16).toString('hex');

	console.log('Press ENTER to open in browser:');
	console.log(`${URL}/api/projects/${config.connection}/link/${iv}`);

	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);

	const h: (_: unknown, data: { name: string; ctrl: boolean }) => void = (_, data) => {
		if (data.name === 'return') {
			open(`${URL}/api/projects/${config.connection}/link/${iv}`);

			process.stdin.off('keypress', h);
		}

		if (data.name === 'escape' || (data.ctrl && data.name === 'c')) {
			process.exit();
		}
	};

	process.stdin.on('keypress', h);

	const res = await poll<LinkResponse>(async (delay, cancel, resolve) => {
		const res = await fetch(`${URL}/api/projects/${config.connection}/link/${iv}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (res.status === 200) {
			const json = (await res.json()) as LinkResponse;

			if ('success' in json) {
				resolve(json);
			} else if ('error' in json) {
				cancel();
			} else {
				await delay(1000);
			}
		} else {
			await delay(1000);
		}
	}, 2000);

	console.log();

	if (!res.success) {
		console.log(pc.red('Failed to link project'));

		return;
	}

	console.log(pc.green('Project linked!'));

	console.log();

	setKey(config.connection, 'default', res.public);
	setKey(config.connection, 'bearer', res.bearer);

	console.log(pc.green('Connection details saved'));
};
