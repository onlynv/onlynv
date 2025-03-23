import pc from '@onlynv/shared/colors';
import type { LinkResponse } from '@onlynv/shared/structs/link';
import crypto, { generateKeyPairSync } from 'node:crypto';
import fs from 'node:fs';
import readline from 'node:readline';
import open from 'open';

import type { Interface } from '../interface';
import { getAuthority } from '../util/authority';
import { getConfig, makeConfig } from '../util/config';
import { getDeviceName, getIp } from '../util/os';
import { getKey, setKey } from '../util/storage';
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
	console.log(pc.gray(`${URL}/projects/${config.connection || int.flags.id}/link/${iv}`));

	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);

	const h: (_: unknown, data: { name: string; ctrl: boolean }) => void = (_, data) => {
		if (data.name === 'return') {
			const metadata = {
				sender_device: getDeviceName(),
				sender_ip: getIp()
			};

			open(
				`${URL}/projects/${config.connection || int.flags.id}/link/${iv}?metadata=${btoa(JSON.stringify(metadata))}`
			);
		}

		if (data.name === 'escape' || (data.ctrl && data.name === 'c')) {
			process.stdin.removeListener('keypress', h);

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
			process.stdin.removeListener('keypress', h);
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
	}, 2000).catch(() => {
		console.log(pc.red('Failed to link project (TIMEOUT)'));

		process.exit(1);
	});

	console.log();

	if (!res.success) {
		console.log(pc.red('Failed to link project'));

		return;
	}

	console.log(pc.green('Project linked!'));

	console.log();

	const hasLocalKeys =
		getKey(config.connection || (int.flags.id as string), 'public') &&
		getKey(config.connection || (int.flags.id as string), 'private');

	if (!hasLocalKeys) {
		const keys = generateKeyPairSync('rsa', {
			modulusLength: 4096,
			publicKeyEncoding: {
				type: 'spki',
				format: 'pem'
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'pem'
			}
		});

		setKey(config.connection || (int.flags.id as string), 'public', keys.publicKey);
		setKey(config.connection || (int.flags.id as string), 'private', keys.privateKey);

		console.log(pc.green('Generated RSA key pair'));

		console.log();
	}

	setKey(config.connection || (int.flags.id as string), 'default', res.public);
	setKey(config.connection || (int.flags.id as string), 'bearer', res.bearer);

	console.log(pc.green('Connection details saved'));
};
