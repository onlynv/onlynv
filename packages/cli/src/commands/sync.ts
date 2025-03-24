import pc from '@onlynv/shared/colors';
import { createSpinner } from 'nanospinner';
import { privateDecrypt, publicEncrypt } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import path from 'node:path';

import type { Interface } from '../interface';
import { getAuthority } from '../util/authority';
import { getConfig } from '../util/config';
import { getKey } from '../util/storage';
import { resolveWorkspace } from '../util/workspace';
import glob from './glob';

const getAssociatedTemplateFile = (file: string) => {
	if (existsSync(path.resolve(file + '.example'))) {
		return file + '.example';
	}

	if (existsSync(path.resolve(file + '.template'))) {
		return file + '.template';
	}

	const [name, ext] = file.split('.');

	if (existsSync(path.resolve(name + '.example.' + ext))) {
		return name + '.example.' + ext;
	}

	return null;
};

type TemplateVariable = {
	type: 'variable';
	name: string;
};

type TemplateComment = {
	type: 'comment';
	value: string;
};

type TemplateWhitespace = {
	type: 'whitespace';
};

type TemplateComponent = TemplateVariable | TemplateComment | TemplateWhitespace;

const parseTemplate = (file: string) => {
	const template = readFileSync(file, 'utf-8').split('\n');

	const parsed: TemplateComponent[] = [];

	for (const line of template) {
		if (line.startsWith('#')) {
			parsed.push({ type: 'comment', value: line });
		} else if (line === '') {
			parsed.push({ type: 'whitespace' });
		} else {
			const [key] = line.split('=');

			if (!key) continue;

			parsed.push({ type: 'variable', name: key });
		}
	}

	return parsed;
};

export default async (int: Interface) => {
	const workspace = resolveWorkspace();

	if (!workspace) {
		console.error(pc.red('No workspace found.'));
		process.exit(1);
	}

	const config = getConfig(workspace);
	const pubKey = getKey(config.connection, 'default');
	const bearer = getKey(config.connection, 'bearer');
	const local = {
		public: getKey(config.connection || (int.flags.id as string), 'public'),
		private: getKey(config.connection || (int.flags.id as string), 'private')
	};

	const URL = getAuthority(config);

	if (!pubKey) {
		console.log(
			`${pc.red(`No public keys available for ${basename(workspace)}`)}

Did you forget to add one with 'nv stow add ***************'?`
		);
		process.exit(1);
	}

	if (!bearer) {
		console.log(
			`${pc.red(`No bearer token available for ${basename(workspace)}`)}

Did you forget to add one with 'nv stow add *************** -n bearer'?`
		);
		process.exit(1);
	}

	if (!local.public || !local.private) {
		console.log(
			`${pc.red(`No local keys available for ${basename(workspace)}`)}

Please re-authenticate with 'nv link'`
		);
	}

	console.log(pc.yellow(`Syncing ${basename(workspace)} (${config.connection})`));
	console.log();

	const files = await glob(int);

	if (!files) {
		process.exit(1);
	}

	const data: Record<string, string> = {};

	for (const file of files) {
		const filepath = file.replace(workspace + '/', '');
		data[filepath] = readFileSync(file, 'utf-8');
	}

	const chunks = JSON.stringify(data).match(/.{1,255}/g) || [];

	console.log();

	const encryptionSpinner = createSpinner(pc.yellow('Encrypting data...'));

	encryptionSpinner.start();

	const encrypted = [];

	for (const chunk of chunks) {
		encrypted.push(
			publicEncrypt(pubKey, new Uint8Array(Buffer.from(chunk))).toString('base64')
		);
	}

	encryptionSpinner.success({ text: pc.green('Encrypted data') });

	console.log();

	if (int.flags['dry-run']) {
		console.log(pc.yellow('Dry run:'), 'Would have sent data to server:');

		console.log();

		console.log(pc.green('Strategy:') + ' ' + (int.flags.strategy || 'merge'));

		console.log(pc.green('Encrypted data:'));

		console.log(encrypted.join('::'));

		console.log(
			pc.green('Target route:') +
				' ' +
				URL +
				`/api/projects/${config.connection}/sync?strategy=${encodeURIComponent(int.flags.strategy || 'merge')}&skip_ci=${int.flags['skip-ci'] === true ? 'true' : 'false'}`
		);

		return;
	}

	const dataSpinner = createSpinner(pc.yellow('Sending data to server...'));

	dataSpinner.start();

	const res = await fetch(
		URL +
			`/api/projects/${config.connection}/sync?strategy=${encodeURIComponent(int.flags.strategy || 'merge')}&skip_ci=${int.flags['skip-ci'] === true ? 'true' : 'false'}`,
		{
			body: encrypted.join('::') + '\n\r\n' + local.public,
			headers: {
				Authorization: `Bearer ${bearer}`
			},
			method: 'POST'
		}
	).catch((e) => {
		return e;
	});

	if (res instanceof Error) {
		dataSpinner.error({
			text: pc.red('Could not establish connection with server')
		});

		process.exit(1);
	}

	if (res.status === 401) {
		dataSpinner.error({
			text: pc.red('Invalid Access Token!\nPlease run `nv link` to re-authenticate')
		});

		process.exit(1);
	}

	if (res.status === 406) {
		dataSpinner.error({
			text: pc.red('Outdated Access Token!\nPlease run `nv link` to re-authenticate')
		});

		process.exit(1);
	}

	if (!res.ok) {
		dataSpinner.error({ text: pc.red('Failed to sync project (ERR_CODE_' + res.status + ')') });
		process.exit(1);
	}

	const newEncrypted = await res.text();

	if (!newEncrypted) {
		dataSpinner.error({ text: pc.red('Synced but did not receive any data from server') });
		process.exit(1);
	}

	const [newChunkData, messages] = newEncrypted.split('\n\r\n');

	if (!newChunkData) {
		dataSpinner.error({ text: pc.red('Synced but did not receive any data from server') });

		for (const message of messages?.split('\n') || []) {
			console.log(message);
		}

		process.exit(1);
	}

	dataSpinner.success({ text: pc.green('Sent data') });

	console.log();

	const newDataSpinner = createSpinner(pc.yellow('Decrypting data from server...'));

	newDataSpinner.start();

	const newChunks = newChunkData?.split('::');

	let json = '';

	for (const chunk of newChunks) {
		const decrypted = privateDecrypt(
			local.private,
			new Uint8Array(Buffer.from(chunk, 'base64'))
		).toString('utf-8');
		json += decrypted;
	}

	const newData = JSON.parse(json) as Record<
		string,
		Record<string, { value: string; local: boolean; production: boolean }>
	>;

	newDataSpinner.success({ text: pc.green('Decrypted data from server') });

	for (const [file, content] of Object.entries(newData)) {
		console.log(pc.green(`Writing ${file}`));

		if (file.startsWith('/')) {
			console.error(pc.red('Invalid file path, will not write:'), file);
			continue;
		}

		const templateFile = getAssociatedTemplateFile(path.resolve(workspace, file));

		const assembled = assembleEnv(content, templateFile);

		writeFileSync(path.resolve(workspace, file), assembled);
	}

	console.log(pc.green('Synced project'));

	for (const message of messages?.split('\n') || []) {
		console.log(message);
	}

	process.exit(0);
};

const assembleEnv = (
	content: Record<string, { value: string; local: boolean; production: boolean }>,
	templateFile: string | null
) => {
	let env = '';

	if (!templateFile) {
		for (const [key, values] of Object.entries(content)) {
			env += `${key}=${values.value}\n`;
		}
	} else {
		const template = parseTemplate(templateFile);

		const used: string[] = [];

		for (const component of template) {
			if (component.type === 'variable') {
				const allValues = Object.entries(content).filter(
					([key]) =>
						key.replace(/^(local|production):/, '') ===
						component.name.replace(/^(local|production):/, '')
				);

				if (allValues.length === 0) {
					env += `${component.name}=\n`;
					continue;
				}

				const values = allValues.map(([name, { value }]) => [name, value]);

				for (const [name, value] of values) {
					env += `${name}=${value}\n`;
				}

				used.push(component.name.replace(/^(local|production):/, ''));
			}

			if (component.type === 'comment') {
				env += component.value + '\n';
			}

			if (component.type === 'whitespace') {
				env += '\n';
			}
		}

		const unused = Object.entries(content).filter(
			([key]) => !used.includes(key.replace(/^(local|production):/, ''))
		);

		for (const [key, values] of unused) {
			const normalisedName = key.replace(/^(local|production):/, '');

			if (values.local) {
				env += `${normalisedName}=${values.value}\n`;
			}

			if (values.production) {
				env += `production:${normalisedName}=${values.value}\n`;
			}
		}
	}

	return env;
};
