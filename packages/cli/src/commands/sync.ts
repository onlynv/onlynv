import pc from '@onlynv/shared/colors';
import { publicDecrypt, publicEncrypt } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import path from 'node:path';
import { argv } from 'node:process';

import type { Interface } from '../interface';
import { getConfig } from '../util/config';
import { getKey } from '../util/storage';
import { resolveWorkspace } from '../util/workspace';
import glob from './glob';

const URL =
	process.env.npm_lifecycle_script || argv.includes('DEV') ?
		'http://localhost:3000'
	:	'https://onlynv.dev';

export default async (int: Interface) => {
	const workspace = resolveWorkspace();

	if (!workspace) {
		console.error(pc.red('No workspace found.'));
		process.exit(1);
	}

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

	if (!files) {
		console.log(pc.red('No files found'));
		process.exit(1);
	}

	console.log('');

	const data: Record<string, string> = {};

	for (const file of files) {
		const filepath = file.replace(workspace + '/', '');
		data[filepath] = readFileSync(file, 'utf-8');
	}

	const chunks = JSON.stringify(data).match(/.{1,255}/g) || [];

	console.log(pc.yellow('Encrypting data...'));

	const encrypted = [];

	for (const chunk of chunks) {
		encrypted.push(
			publicEncrypt(pubKey, new Uint8Array(Buffer.from(chunk))).toString('base64')
		);
	}

	console.log(pc.yellow('Sending data to server...'));

	const res = await fetch(
		URL +
			`/api/projects/${config.connection}/sync?strategy=${encodeURIComponent(int.flags.strategy || 'merge')}`,
		{
			body: encrypted.join('::'),
			headers: {
				Authorization: `Bearer ${bearer}`
			},
			method: 'POST'
		}
	);

	if (res.status === 401) {
		console.log(pc.red('Invalid Access Token!\nPlease run `nv link` to re-authenticate'));

		process.exit(1);
	}

	if (!res.ok) {
		console.log(pc.red('Failed to sync project'));
		process.exit(1);
	}

	const newEncrypted = await res.text();

	if (!newEncrypted) {
		console.log(pc.red('Synced but did not receive any data from server'));
		process.exit(1);
	}

	const newChunks = newEncrypted.split('::');

	let json = '';

	for (const chunk of newChunks) {
		const decrypted = publicDecrypt(
			pubKey,
			new Uint8Array(Buffer.from(chunk, 'base64'))
		).toString('utf-8');
		json += decrypted;
	}

	const newData = JSON.parse(json) as Record<
		string,
		Record<string, { value: string; local: string; production: string }>
	>;

	console.log(pc.yellow('Received data from server'));

	for (const [file, content] of Object.entries(newData)) {
		console.log(pc.green(`Writing ${file}`));

		if (file.startsWith('/')) {
			console.error(pc.red('Invalid file path, will not write:'), file);
			continue;
		}

		writeFileSync(path.resolve(workspace, file), assembleEnv(content));
	}

	console.log(pc.green('Synced project'));

	process.exit(0);
};

const assembleEnv = (
	content: Record<string, { value: string; local: string; production: string }>
) => {
	let env = '';

	for (const [key, { value }] of Object.entries(content)) {
		if (/[\s]/.test(value)) {
			env += `${key}="${value}"\n`;
		} else {
			env += `${key}=${value}\n`;
		}
	}

	return env;
};
