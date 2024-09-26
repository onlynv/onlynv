import pc from '@onlynv/shared/colors';
import type { LinkResponse } from '@onlynv/shared/structs/link';
import crypto from 'node:crypto';
import { argv } from 'node:process';
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

export default async (int: Interface, log = true) => {
	const workspace = resolveWorkspace();
	const config = getConfig(workspace);

	if (log) console.log(pc.yellow('Linking project...'));

	if (log) console.log();

	const iv = crypto.randomBytes(16).toString('hex');

	open(`${URL}/api/projects/${config.connection}/link/${iv}`);

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

	if (!res.success) {
		if (log) console.log(pc.red('Failed to link project'));

		return;
	}

	if (log) console.log(pc.green('Project linked!'));

	if (log) console.log();

	setKey(config.connection, 'default', res.public);
	setKey(config.connection, 'bearer', res.bearer);

	if (log) console.log(pc.green('Connection details saved'));
};
