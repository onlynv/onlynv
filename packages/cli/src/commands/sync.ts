import pc from '@onlynv/shared/colors';
import { basename } from 'node:path';
import type { Interface } from '../interface';

import { getConfig } from '../util/config';
import { getKey } from '../util/storage';
import { resolveWorkspace } from '../util/workspace';
import glob from './glob';
import { readFileSync } from 'node:fs';
import { publicEncrypt } from 'node:crypto';
import { argv } from 'node:process';

const URL =
	process.env.npm_lifecycle_script || argv.includes('DEV') ?
		'http://localhost:3000'
	:	'https://onlynv.dev';

export default async (int: Interface) => {
	const workspace = resolveWorkspace();

	const config = getConfig(workspace);
	const pubKey = getKey(config.connection, 'default');
	const bearer = getKey(config.connection, 'bearer');

	if (!pubKey) {
		console.log(
			`${pc.red(`No public keys available for ${basename(workspace)}`)}

Did you forget to add one with 'nv key add ***************'?`
		);
		process.exit(1);
	}

	if (!bearer) {
		console.log(
			`${pc.red(`No bearer token available for ${basename(workspace)}`)}

Did you forget to add one with 'nv key add *************** -n bearer'?`
		);
		process.exit(1);
	}

	console.log(pc.yellow(`Syncing ${basename(workspace)} (${config.connection})`));
	console.log();

	const files = await glob(int);

	console.log('');

	const data: Record<string, string> = {};

	for (const file of files) {
		const filepath = file.replace(workspace, '');
		data[filepath] = readFileSync(file, 'utf-8');
	}

	const chunks = JSON.stringify(data).match(/.{1,255}/g) || [];

	console.log(pc.yellow('Encrypting data...'));

	const encrypted = [];

	for (const chunk of chunks) {
		encrypted.push(publicEncrypt(pubKey, Buffer.from(chunk)).toString('base64'));
	}

	console.log(pc.yellow('Sending data to server...'));

	const res = await fetch(URL + `/api/projects/${config.connection}/sync`, {
		body: encrypted.join('::'),
		headers: {
			Authorization: `Bearer ${bearer}`
		},
		method: 'POST'
	});

	if (!res.ok) {
		console.log(pc.red('Failed to sync project'));
		process.exit(1);
	}
};
