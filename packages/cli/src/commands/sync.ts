import pc from '@onlynv/shared/colors';
import { basename } from 'node:path';
import type { Interface } from '../interface';

import { getConfig } from '../util/config';
import { getKey } from '../util/storage';
import { resolveWorkspace } from '../util/workspace';
import glob from './glob';
import { readFileSync } from 'node:fs';
import { publicEncrypt } from 'node:crypto';

const URL = process.env.npm_lifecycle_script ? 'http://localhost:3000' : 'https://onlynv.dev';

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

	const files = await glob(int, false);

	const data: Record<string, string> = {};

	for (const file of files) {
		const filepath = file.replace(workspace, '');
		data[filepath] = readFileSync(file, 'utf-8');
	}

	const encrypted = publicEncrypt(pubKey, Buffer.from(JSON.stringify(data))).toString('base64');

	console.log(encrypted, URL + `/api/projects/${config.connection}/sync`);

	const res = await fetch(URL + `/api/projects/${config.connection}/sync`, {
		body: encrypted,
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
