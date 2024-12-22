import pc from '@onlynv/shared/colors';
import type { LinkResponse } from '@onlynv/shared/structs/link';
import crypto from 'node:crypto';
import fs from 'node:fs';
import readline from 'node:readline';
import open from 'open';

import type { Interface } from '../interface';
import { getAuthority } from '../util/authority';
import { getConfig, makeConfig } from '../util/config';
import { getDeviceName, getIp } from '../util/os';
import { setKey } from '../util/storage';
import { resolveWorkspace } from '../util/workspace';
import { poll } from './init';

export default async (int: Interface) => {
	const workspace = resolveWorkspace(process.cwd(), false);
	const config = getConfig(workspace);

	const URL = getAuthority(config);

	if (!(workspace && config.connection)) {
		if (!int.flags.id) {
			console.error(pc.red('No workspace found. Please specify a project id with -i'));

			process.exit(1);
		}

		await fs.promises.writeFile(
			'.lnvrc',
			makeConfig({
				authority: config.authority || '@onlynv/platform',
				connection: int.flags.id as string,
				apispec: 1
			})
		);
	}

	console.log(pc.yellow('Linking project...'));
	console.log();

	const iv = crypto.randomBytes(16).toString('hex');

	console.log('Press ENTER to open in browser:');
	console.log(`${URL}/api/projects/${config.connection || int.flags.id}/link/${iv}`);

	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);

	const h: (_: unknown, data: { name: string; ctrl: boolean }) => void = (_, data) => {
		if (data.name === 'return') {
			const metadata = {
				sender_device: getDeviceName(),
				sender_ip: getIp()
			};

			open(
				`${URL}/api/projects/${config.connection || int.flags.id}/link/${iv}?metadata=${btoa(JSON.stringify(metadata))}`
			);

			process.stdin.off('keypress', h);
		}

		if (data.name === 'escape' || (data.ctrl && data.name === 'c')) {
			process.exit();
		}
	};

	process.stdin.on('keypress', h);

	const res = await poll<LinkResponse>(async (delay, cancel, resolve) => {
		const res = await fetch(
			`${URL}/api/projects/${config.connection || int.flags.id}/link/${iv}`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		).catch((e) => {
			return e;
		});

		if (res instanceof Error) {
			console.log(pc.red('Could not establish connection with server'));

			process.exit(1);
		}

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

	setKey(config.connection || (int.flags.id as string), 'default', res.public);
	setKey(config.connection || (int.flags.id as string), 'bearer', res.bearer);

	console.log(pc.green('Connection details saved'));
};
